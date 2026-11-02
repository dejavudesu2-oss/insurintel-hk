"use strict";
/**
 * InsurIntel HK - High-Concurrency Reliability & Edge Pre-rendering Engine
 * Agent 8: Backend & Cron Reliability Agent
 *
 * Capabilities:
 * 1. Semantic Caching Engine (In-memory + File-based hash store to eliminate duplicate LLM token consumption)
 * 2. Edge Pre-rendering Pipeline: Generates static API snapshots (matrix.json, pitches.json, cafe.json) for 08:15 AM zero-latency delivery
 * 3. Dead-Letter Queue (DLQ) for resilient web scraper failure recovery & exponential backoff
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLQRetryWorker = exports.DeadLetterQueue = exports.EdgePreRenderer = exports.SemanticCacheEngine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class SemanticCacheEngine {
    cache = new Map();
    cacheFilePath;
    constructor(cacheFilePath) {
        this.cacheFilePath = cacheFilePath || path_1.default.join(process.cwd(), "dist", ".semantic_cache.json");
        this.loadCache();
    }
    normalizeKey(query) {
        return query
            .toLowerCase()
            .replace(/[\s\-_，。！？、]/g, "")
            .trim();
    }
    getHash(query) {
        const normalized = this.normalizeKey(query);
        return crypto_1.default.createHash("sha256").update(normalized).digest("hex");
    }
    get(query) {
        const hash = this.getHash(query);
        const entry = this.cache.get(hash);
        if (!entry)
            return null;
        if (new Date() > new Date(entry.expires_at)) {
            this.cache.delete(hash);
            return null;
        }
        entry.hit_count++;
        return entry.data;
    }
    set(query, data, ttlSeconds = 86400) {
        const hash = this.getHash(query);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);
        this.cache.set(hash, {
            key: query,
            data,
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            hit_count: 0
        });
        this.saveCache();
    }
    saveCache() {
        try {
            const outDir = path_1.default.dirname(this.cacheFilePath);
            fs_1.default.mkdirSync(outDir, { recursive: true });
            const serialized = {};
            this.cache.forEach((v, k) => { serialized[k] = v; });
            fs_1.default.writeFileSync(this.cacheFilePath, JSON.stringify(serialized, null, 2), "utf-8");
        }
        catch {
            // Non-critical persistence failure
        }
    }
    loadCache() {
        if (fs_1.default.existsSync(this.cacheFilePath)) {
            try {
                const raw = JSON.parse(fs_1.default.readFileSync(this.cacheFilePath, "utf-8"));
                Object.entries(raw).forEach(([k, v]) => {
                    this.cache.set(k, v);
                });
            }
            catch {
                this.cache.clear();
            }
        }
    }
    getStats() {
        let hits = 0;
        this.cache.forEach(v => { hits += v.hit_count; });
        return {
            total_entries: this.cache.size,
            total_hits: hits
        };
    }
}
exports.SemanticCacheEngine = SemanticCacheEngine;
class EdgePreRenderer {
    apiDistDir;
    constructor(distDir) {
        const base = distDir || path_1.default.join(process.cwd(), "dist");
        this.apiDistDir = path_1.default.join(base, "api", "v1");
    }
    /**
     * Pre-renders static API JSON files for high-concurrency client polling
     */
    preRenderStaticApiAssets(briefing, promos) {
        fs_1.default.mkdirSync(this.apiDistDir, { recursive: true });
        const matrixPath = path_1.default.join(this.apiDistDir, "matrix.json");
        const briefingPath = path_1.default.join(this.apiDistDir, "briefing.json");
        // 1. Static Grand Matrix JSON
        fs_1.default.writeFileSync(matrixPath, JSON.stringify({
            generated_at: new Date().toISOString(),
            version: "2.0.0",
            top_prepayment: briefing.top_prepayment_rankings,
            full_promos: promos
        }, null, 2), "utf-8");
        // 2. Static Daily Briefing JSON
        fs_1.default.writeFileSync(briefingPath, JSON.stringify({
            generated_at: new Date().toISOString(),
            briefing
        }, null, 2), "utf-8");
        console.log(`[InsurIntel Edge] ✅ 靜態邊緣 API 資源預渲染完成: ${this.apiDistDir}`);
        return {
            matrixJsonPath: matrixPath,
            briefingJsonPath: briefingPath
        };
    }
}
exports.EdgePreRenderer = EdgePreRenderer;
class DeadLetterQueue {
    queue = [];
    dlqFilePath;
    constructor(filePath) {
        this.dlqFilePath = filePath || path_1.default.join(process.cwd(), "dist", ".dlq.json");
        this.loadQueue();
    }
    enqueueFailedTask(sourceUrl, error, payload = {}) {
        const task = {
            task_id: crypto_1.default.randomUUID(),
            source_url: sourceUrl,
            attempt_count: 1,
            max_retries: 3,
            last_error: error,
            payload,
            next_retry_at: new Date(Date.now() + 60000).toISOString(),
            status: "PENDING"
        };
        this.queue.push(task);
        this.saveQueue();
        console.error(`[InsurIntel DLQ] ⚠️ 任務失敗已推入死信隊列: ${sourceUrl} (${error})`);
        return task;
    }
    getPendingTasks() {
        return this.queue.filter(t => t.status === "PENDING");
    }
    getDueTasks(now = new Date()) {
        const nowTime = now.getTime();
        return this.queue.filter(t => t.status === "PENDING" && new Date(t.next_retry_at).getTime() <= nowTime);
    }
    markResolved(taskId) {
        const task = this.queue.find(t => t.task_id === taskId);
        if (!task)
            return false;
        task.status = "RESOLVED";
        this.saveQueue();
        return true;
    }
    markFailedAttempt(taskId, error, baseBackoffMs = 60000) {
        const task = this.queue.find(t => t.task_id === taskId);
        if (!task)
            return undefined;
        task.attempt_count += 1;
        task.last_error = error;
        if (task.attempt_count >= task.max_retries) {
            task.status = "DEAD";
            console.warn(`[InsurIntel DLQ] ☠️ 任務已耗盡重試次數 (${task.attempt_count}/${task.max_retries})，標記為 DEAD: ${task.source_url}`);
        }
        else {
            task.status = "PENDING";
            const backoffMs = baseBackoffMs * Math.pow(2, task.attempt_count - 1);
            task.next_retry_at = new Date(Date.now() + backoffMs).toISOString();
            console.warn(`[InsurIntel DLQ] 🔁 任務重試第 ${task.attempt_count} 次失敗，下次重試時間: ${task.next_retry_at}`);
        }
        this.saveQueue();
        return task;
    }
    getAllTasks() {
        return [...this.queue];
    }
    clear() {
        this.queue = [];
        this.saveQueue();
    }
    saveQueue() {
        try {
            fs_1.default.mkdirSync(path_1.default.dirname(this.dlqFilePath), { recursive: true });
            fs_1.default.writeFileSync(this.dlqFilePath, JSON.stringify(this.queue, null, 2), "utf-8");
        }
        catch {
            // Non-critical
        }
    }
    loadQueue() {
        if (fs_1.default.existsSync(this.dlqFilePath)) {
            try {
                this.queue = JSON.parse(fs_1.default.readFileSync(this.dlqFilePath, "utf-8"));
            }
            catch {
                this.queue = [];
            }
        }
    }
}
exports.DeadLetterQueue = DeadLetterQueue;
class DLQRetryWorker {
    dlq;
    baseBackoffMs;
    constructor(dlq, baseBackoffMs = 60000) {
        this.dlq = dlq;
        this.baseBackoffMs = baseBackoffMs;
    }
    async processDueTasks(handler, now) {
        const dueTasks = this.dlq.getDueTasks(now);
        let resolved = 0;
        let failed = 0;
        let dead = 0;
        for (const task of dueTasks) {
            try {
                const success = await handler(task);
                if (success) {
                    this.dlq.markResolved(task.task_id);
                    resolved++;
                }
                else {
                    const updated = this.dlq.markFailedAttempt(task.task_id, "Handler returned false", this.baseBackoffMs);
                    if (updated?.status === "DEAD")
                        dead++;
                    else
                        failed++;
                }
            }
            catch (err) {
                const updated = this.dlq.markFailedAttempt(task.task_id, err?.message || String(err), this.baseBackoffMs);
                if (updated?.status === "DEAD")
                    dead++;
                else
                    failed++;
            }
        }
        return {
            processed: dueTasks.length,
            resolved,
            failed,
            dead
        };
    }
}
exports.DLQRetryWorker = DLQRetryWorker;

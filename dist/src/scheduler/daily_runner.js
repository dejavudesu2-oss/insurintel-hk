"use strict";
/**
 * InsurIntel HK - Automated Daily Cycle Runner & Scheduler
 * Orchestrates the full daily lifecycle:
 * 06:30 AM: Auto-search & ingest latest market intelligence
 * 07:00 AM: Diff detection & delta change calculation
 * 07:45 AM: Generate daily briefing, director speech, and morning presentation slides
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyIntelligenceRunner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const market_searcher_js_1 = require("../crawler/market_searcher.js");
const diff_detector_js_1 = require("../engine/diff_detector.js");
const briefing_generator_js_1 = require("../engine/briefing_generator.js");
class DailyIntelligenceRunner {
    searcher;
    diffDetector;
    briefingGenerator;
    dbSnapshotPath;
    constructor() {
        this.searcher = new market_searcher_js_1.MarketSearcher();
        this.diffDetector = new diff_detector_js_1.IntelligenceDiffDetector();
        this.briefingGenerator = new briefing_generator_js_1.MorningBriefingGenerator();
        this.dbSnapshotPath = path_1.default.join(process.cwd(), "dist", "previous_snapshot.json");
    }
    /**
     * Executes one full daily cycle
     */
    async executeDailyCycle() {
        console.log(`[${new Date().toISOString()}] 🚀 啟動 InsurIntel HK 每日自動情報更新任務...`);
        // 1. Proactive web search
        console.log(`[InsurIntel] 正在自動聯網檢索全港最新保險優惠、預繳利率與促銷通函...`);
        const hits = await this.searcher.fetchDailyMarketNews();
        console.log(`[InsurIntel] 檢索完成！捕獲 ${hits.length} 條市場最新動態。`);
        // 2. Multimodal extraction
        const currentPromos = await this.searcher.processDiscoveredItems(hits);
        // 3. Load yesterday's baseline snapshot for difference detection
        let previousPromos = [];
        if (fs_1.default.existsSync(this.dbSnapshotPath)) {
            try {
                previousPromos = JSON.parse(fs_1.default.readFileSync(this.dbSnapshotPath, "utf-8"));
            }
            catch {
                previousPromos = [];
            }
        }
        else {
            // First run: simulate previous baseline so changes can be demonstrated
            previousPromos = JSON.parse(JSON.stringify(currentPromos));
            const pru = previousPromos.find(p => p.insurer === "Prudential");
            if (pru && pru.prepayment_scheme) {
                pru.prepayment_scheme.guaranteed_rate_pct = 5.5; // Was 5.5% yesterday, now 5.8%
            }
        }
        // 4. Delta diff detection
        const deltaChanges = this.diffDetector.detectChanges(currentPromos, previousPromos);
        console.log(`[InsurIntel] 差分對比完成，共檢測到 ${deltaChanges.length} 項突發關鍵變動：`);
        deltaChanges.forEach((ch, idx) => {
            console.log(`   ${idx + 1}. [${ch.severity}] ${ch.description}`);
        });
        // 5. Generate daily morning briefing and director 2-min speech
        const briefingData = this.briefingGenerator.generateBriefingData(currentPromos, deltaChanges);
        const broadcastText = this.briefingGenerator.formatBroadcastText(briefingData);
        // 6. Render and persist outputs
        const outDir = path_1.default.join(process.cwd(), "dist");
        fs_1.default.mkdirSync(outDir, { recursive: true });
        const slidesHtml = this.briefingGenerator.renderMorningSlidesHtml(briefingData);
        const slidesPath = path_1.default.join(outDir, "morning_slides.html");
        const indexPath = path_1.default.join(outDir, "index.html");
        const txtPath = path_1.default.join(outDir, "morning_briefing.txt");
        fs_1.default.writeFileSync(slidesPath, slidesHtml, "utf-8");
        fs_1.default.writeFileSync(indexPath, slidesHtml, "utf-8");
        fs_1.default.writeFileSync(txtPath, broadcastText, "utf-8");
        // Save today's state as the new baseline
        fs_1.default.writeFileSync(this.dbSnapshotPath, JSON.stringify(currentPromos, null, 2), "utf-8");
        console.log(`[InsurIntel] ✅ 晨會速報生成完畢！已導出至: ${slidesPath}`);
        return {
            discoveredCount: hits.length,
            deltaChangesCount: deltaChanges.length,
            broadcastText,
            slidesHtmlPath: slidesPath
        };
    }
}
exports.DailyIntelligenceRunner = DailyIntelligenceRunner;
// Direct CLI invocation
if (process.argv[1]?.includes("daily_runner")) {
    const runner = new DailyIntelligenceRunner();
    runner.executeDailyCycle().catch(console.error);
}

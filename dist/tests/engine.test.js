"use strict";
/**
 * InsurIntel HK - Comprehensive Engine & Pipeline Test Suite
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_test_1 = __importDefault(require("node:test"));
const diff_detector_js_1 = require("../src/engine/diff_detector.js");
const counter_pitch_js_1 = require("../src/engine/counter_pitch.js");
const briefing_generator_js_1 = require("../src/engine/briefing_generator.js");
const gemini_pipeline_js_1 = require("../src/extractor/gemini_pipeline.js");
const viral_card_synthesizer_js_1 = require("../src/engine/viral_card_synthesizer.js");
const reliability_engine_js_1 = require("../src/backend/reliability_engine.js");
function loadPromos() {
    const mockDir = path_1.default.join(process.cwd(), "src", "mock_data");
    const files = ["savings_aia_pru.json", "ci_manulife_fwd.json", "vhis_qdap_sample.json"];
    let all = [];
    for (const f of files) {
        const p = path_1.default.join(mockDir, f);
        if (fs_1.default.existsSync(p)) {
            all = all.concat(JSON.parse(fs_1.default.readFileSync(p, "utf-8")));
        }
    }
    return all;
}
(0, node_test_1.default)("1. Data Models & Mock Datasets Integrity", () => {
    const promos = loadPromos();
    node_assert_1.default.ok(promos.length >= 6, "Expected at least 6 mock products across categories");
    const categories = new Set(promos.map(p => p.category));
    node_assert_1.default.ok(categories.has("Savings_MultiCurrency"), "Missing Savings category");
    node_assert_1.default.ok(categories.has("Critical_Illness"), "Missing CI category");
    node_assert_1.default.ok(categories.has("Medical_VHIS"), "Missing VHIS category");
    node_assert_1.default.ok(categories.has("Annuity_QDAP"), "Missing QDAP category");
    // Validate Savings specific metrics
    const aiaSavings = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
    node_assert_1.default.ok(aiaSavings, "AIA Savings not found");
    node_assert_1.default.ok(aiaSavings.savings_metrics?.gn16_fulfillment_ratio_pct > 90, "GN16 fulfillment ratio should be valid");
    node_assert_1.default.ok(aiaSavings.premium_discounts.length >= 3, "Tiered discounts should have multiple tiers");
});
(0, node_test_1.default)("2. Diff & Delta Detection Engine", () => {
    const promos = loadPromos();
    const diffDetector = new diff_detector_js_1.IntelligenceDiffDetector();
    const prevPromos = JSON.parse(JSON.stringify(promos));
    // Simulate Prudential rate change from 5.5% -> 5.8%
    const pru = prevPromos.find((p) => p.insurer === "Prudential");
    pru.prepayment_scheme.guaranteed_rate_pct = 5.5;
    const changes = diffDetector.detectChanges(promos, prevPromos);
    node_assert_1.default.ok(changes.length > 0, "Should detect delta changes");
    const rateChange = changes.find(c => c.change_type === "PREPAYMENT_RATE_CHANGE");
    node_assert_1.default.ok(rateChange, "Should identify PREPAYMENT_RATE_CHANGE");
    node_assert_1.default.strictEqual(rateChange.severity, "URGENT");
    node_assert_1.default.ok(rateChange.description.includes("5.5% 調升至 5.8%"), "Diff description should accurately show rate hike");
});
(0, node_test_1.default)("3. Counter-Pitch Engine across all 4 categories with GL20 Compliance", () => {
    const promos = loadPromos();
    const engine = new counter_pitch_js_1.CounterPitchEngine(promos);
    // 1. Savings Counter-Pitch
    const savingsRes = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: "友邦 盈御多元貨幣計劃 3",
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "客睇緊保誠 5.8% 預繳及 28% 回贈"
    });
    node_assert_1.default.ok(savingsRes.attack_points.length === 3, "Savings pitch should provide 3 tactical points");
    node_assert_1.default.ok(savingsRes.regulatory_guardrail.gl20_compliance_note.includes("GL20"), "Must include GL20 compliance");
    node_assert_1.default.ok(savingsRes.regulatory_guardrail.acknowledged_competitor_advantage.length > 0, "Must acknowledge competitor strength");
    // 2. Critical Illness Counter-Pitch
    const ciRes = engine.generateCounterPitch({
        category: "Critical_Illness",
        our_product: "宏利 守護無間危疾保",
        competitor_product: "富衛 危疾加諾保",
        client_scenario: "客追求高回贈"
    });
    node_assert_1.default.ok(ciRes.attack_points.some(pt => pt.title.includes("癌症索償間隔年期")), "CI pitch should attack cancer waiting interval");
    // 3. VHIS Counter-Pitch
    const vhisRes = engine.generateCounterPitch({
        category: "Medical_VHIS",
        our_product: "尊衛您靈活計劃",
        competitor_product: "Bowtie Pink",
        client_scenario: "客認為網上自願醫保更便宜"
    });
    node_assert_1.default.ok(vhisRes.attack_points.some(pt => pt.title.includes("Agent") || pt.title.includes("中介人")), "VHIS pitch should articulate agent claim value");
    // 4. QDAP Counter-Pitch
    const qdapRes = engine.generateCounterPitch({
        category: "Annuity_QDAP",
        our_product: "萬年延期年金",
        competitor_product: "某同業年金",
        client_scenario: "對比退休年金回報"
    });
    node_assert_1.default.ok(qdapRes.attack_points.some(pt => pt.title.includes("保證回報比例")), "QDAP pitch should emphasize guaranteed IRR ratio");
});
(0, node_test_1.default)("4. Morning Briefing & Leader Speech Generator", () => {
    const promos = loadPromos();
    const generator = new briefing_generator_js_1.MorningBriefingGenerator();
    const briefingData = generator.generateBriefingData(promos);
    // Check 07:45 WhatsApp text
    const text = generator.formatBroadcastText(briefingData);
    node_assert_1.default.ok(text.includes("早會情報速遞"), "Broadcast text should include header");
    node_assert_1.default.ok(text.includes("預繳保證利率 TOP 5"), "Broadcast text should include top 5 rankings");
    node_assert_1.default.ok(text.includes(briefingData.manager_speech_2min.theme), "Broadcast text should include manager speech theme");
    // Check HTML Slide deck rendering
    const html = generator.renderMorningSlidesHtml(briefingData);
    node_assert_1.default.ok(!html.includes("{{DATE}}"), "Date placeholder should be rendered");
    node_assert_1.default.ok(!html.includes("{{FLASH_ALERTS_HTML}}"), "Alerts placeholder should be rendered");
    node_assert_1.default.ok(!html.includes("{{RANKINGS_HTML}}"), "Rankings placeholder should be rendered");
    node_assert_1.default.ok(!html.includes("{{MANAGER_SPEECH}}"), "Speech placeholder should be rendered");
    node_assert_1.default.ok(html.includes("雋富多元貨幣計劃"), "Rankings table should contain actual product name");
});
(0, node_test_1.default)("5. Multimodal Extractor Fallback Parser", () => {
    const extractor = new gemini_pipeline_js_1.GeminiIntelligenceExtractor();
    const rawText = "友邦 盈御3 推出限時優惠，美元預繳保證利率 5.2% p.a.，首年保費回贈高達 22%，截止日期 2026年11月30日";
    const parsed = extractor.parseOfflinePromoText(rawText);
    node_assert_1.default.strictEqual(parsed.insurer, "AIA");
    node_assert_1.default.strictEqual(parsed.category, "Savings_MultiCurrency");
    node_assert_1.default.strictEqual(parsed.prepayment_scheme?.guaranteed_rate_pct, 5.2);
    node_assert_1.default.strictEqual(parsed.premium_discounts?.[0].discount_rate_pct, 22.0);
});
(0, node_test_1.default)("6. Agent 1: Circuit Breaker Anomaly Interceptor & Fallback", () => {
    const promos = loadPromos();
    const diffDetector = new diff_detector_js_1.IntelligenceDiffDetector();
    const breaker = diffDetector.getCircuitBreaker();
    // Create an abnormal promo (e.g. 200% discount, 25% prepayment rate)
    const corruptedPromo = JSON.parse(JSON.stringify(promos[0]));
    corruptedPromo.premium_discounts[0].discount_rate_pct = 200; // Anomaly!
    if (corruptedPromo.prepayment_scheme) {
        corruptedPromo.prepayment_scheme.guaranteed_rate_pct = 25.0; // Anomaly!
    }
    const { isValid, anomalies } = breaker.validatePromo(corruptedPromo);
    node_assert_1.default.strictEqual(isValid, false, "Corrupted promo should be rejected");
    node_assert_1.default.ok(anomalies.length >= 1, "Should record anomalies");
    // Sanitize with fallback
    const { sanitized, rejected } = breaker.sanitizeWithFallback([corruptedPromo], promos);
    node_assert_1.default.strictEqual(rejected.length, 1, "Should reject corrupted promo");
    node_assert_1.default.strictEqual(sanitized[0].premium_discounts[0].discount_rate_pct, promos[0].premium_discounts[0].discount_rate_pct, "Should fallback to clean baseline");
});
(0, node_test_1.default)("7. Agent 2 & 3: Three-Stage Framework, Tones & HKIA GL20 Guardrail", () => {
    const promos = loadPromos();
    const engine = new counter_pitch_js_1.CounterPitchEngine(promos);
    // Tone: HK Business English
    const resEng = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: "友邦 盈御多元貨幣計劃 3",
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "Client asks about Prudential 5.8% rate",
        tone: "hk_business_english"
    });
    node_assert_1.default.strictEqual(resEng.tone, "hk_business_english");
    node_assert_1.default.ok(resEng.three_stage_framework.stage_1_empathy.includes("catch your eyes"), "Should match English stage 1");
    node_assert_1.default.ok(resEng.three_stage_framework.stage_2_blindspot.includes("fine print"), "Should match English stage 2");
    node_assert_1.default.ok(resEng.three_stage_framework.stage_3_actuarial_checkmate.includes("GN16 official fulfillment ratio"), "Should match English stage 3");
    // Prohibited words filter verification
    const auditResult = counter_pitch_js_1.HKIAComplianceGuardrail.auditAndSanitize("呢份單保證穩賺零風險，對手一定蝕到跳水，我地全港第一！");
    node_assert_1.default.strictEqual(auditResult.passed, false, "Prohibited terms should be flagged");
    node_assert_1.default.ok(auditResult.warnings.length >= 3, "Should catch multiple prohibited statements");
    node_assert_1.default.ok(!auditResult.sanitizedText.includes("保證穩賺零風險"), "Sanitized text should replace prohibited terms");
    node_assert_1.default.ok(!auditResult.sanitizedText.includes("全港第一"), "Sanitized text should replace '全港第一'");
});
(0, node_test_1.default)("8. Agent 7: WhatsApp Markdown & Personalized Poster Synthesizer", () => {
    const promos = loadPromos();
    const generator = new briefing_generator_js_1.MorningBriefingGenerator();
    const briefing = generator.generateBriefingData(promos);
    const comms = new viral_card_synthesizer_js_1.ViralTeamCommsEngine();
    const stamp = {
        agent_name: "林卓賢 David Lam",
        title: "資深分區總監",
        insurer: "友邦保險 AIA",
        agency_or_team: "宏峰家族",
        license_no: "IA99201928",
        phone_whatsapp: "+852 9876 5432"
    };
    const waText = comms.formatWhatsAppBroadcast(briefing, stamp);
    node_assert_1.default.ok(waText.includes("*【InsurIntel HK 早會市場情報速遞】*"), "Should contain bold header");
    node_assert_1.default.ok(waText.includes("IA99201928"), "Should contain agent license stamp");
    const svg = comms.generatePersonalizedPosterSvg(briefing, stamp);
    node_assert_1.default.ok(svg.includes("<svg"), "Should output valid SVG");
    node_assert_1.default.ok(svg.includes("林卓賢 David Lam"), "Should brand SVG with agent name");
    node_assert_1.default.ok(svg.includes("IA99201928"), "Should brand SVG with license");
});
(0, node_test_1.default)("9. Agent 8: Semantic Cache & Dead-Letter Queue (DLQ)", () => {
    const cache = new reliability_engine_js_1.SemanticCacheEngine();
    const query = "友邦 盈御 vs 保誠 雋富 5.8% 利率";
    const dummyResult = { recommendation: "Attack Year 2 floating rate & GN16 96.5%" };
    cache.set(query, dummyResult, 3600);
    const cached = cache.get(query);
    node_assert_1.default.ok(cached, "Cache should hit");
    node_assert_1.default.strictEqual(cached?.recommendation, dummyResult.recommendation);
    const dlq = new reliability_engine_js_1.DeadLetterQueue();
    const failedTask = dlq.enqueueFailedTask("https://mock-insurer.com/promo", "Connection Timeout (504)");
    node_assert_1.default.strictEqual(failedTask.status, "PENDING");
    node_assert_1.default.ok(dlq.getPendingTasks().length >= 1, "DLQ should register pending task");
});

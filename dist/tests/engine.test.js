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
const node_vm_1 = __importDefault(require("node:vm"));
const diff_detector_js_1 = require("../src/engine/diff_detector.js");
const counter_pitch_js_1 = require("../src/engine/counter_pitch.js");
const briefing_generator_js_1 = require("../src/engine/briefing_generator.js");
const gemini_pipeline_js_1 = require("../src/extractor/gemini_pipeline.js");
const viral_card_synthesizer_js_1 = require("../src/engine/viral_card_synthesizer.js");
const reliability_engine_js_1 = require("../src/backend/reliability_engine.js");
const loader_js_1 = require("../src/mock_data/loader.js");
function loadPromos() {
    return (0, loader_js_1.loadAllMockPromos)();
}
(0, node_test_1.default)("1. Data Models & Mock Datasets Integrity", () => {
    const promos = loadPromos();
    node_assert_1.default.ok(promos.length >= 6, "Expected at least 6 mock products across categories");
    const categories = new Set(promos.map(p => p.category));
    node_assert_1.default.ok(categories.has("Savings_MultiCurrency"), "Missing Savings category");
    node_assert_1.default.ok(categories.has("Critical_Illness"), "Missing CI category");
    node_assert_1.default.ok(categories.has("Medical_VHIS"), "Missing VHIS category");
    node_assert_1.default.ok(categories.has("Annuity_QDAP"), "Missing QDAP category");
    node_assert_1.default.ok(categories.has("Financing_UniversalLife"), "Missing Universal Life category");
    // Validate Savings specific metrics
    const aiaSavings = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
    node_assert_1.default.ok(aiaSavings, "AIA Savings not found");
    node_assert_1.default.ok(aiaSavings.savings_metrics?.gn16_fulfillment_ratio_pct > 90, "GN16 fulfillment ratio should be valid");
    node_assert_1.default.ok(aiaSavings.premium_discounts.length >= 3, "Tiered discounts should have multiple tiers");
    // Validate Universal Life specific metrics
    const aiaUL = promos.find(p => p.insurer === "AIA" && p.category === "Financing_UniversalLife");
    node_assert_1.default.ok(aiaUL, "AIA Universal Life not found");
    node_assert_1.default.ok(aiaUL.ul_metrics, "AIA UL should have ul_metrics");
    node_assert_1.default.ok(aiaUL.ul_metrics.crediting_rate_current_pct > 5.0, "AIA UL crediting rate should be > 5.0%");
    node_assert_1.default.strictEqual(aiaUL.ul_metrics.financing_eligible, true, "AIA UL should be financing eligible");
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
(0, node_test_1.default)("10. Feature F1, F2, F3: Universal Life & Expanded Catalog Dynamic Loader", () => {
    const allPromos = (0, loader_js_1.loadAllMockPromos)();
    node_assert_1.default.ok(allPromos.length >= 40, "Should load 40+ mock products across all 9 HK insurers");
    node_assert_1.default.strictEqual(allPromos.length, 99, "Should load all 99 mock products");
    const insurers = new Set(allPromos.map(p => p.insurer));
    node_assert_1.default.strictEqual(insurers.size, 15, "Should cover all 15 Hong Kong insurers");
    const expectedInsurers = ["AIA", "Prudential", "Manulife", "Sun_Life", "FWD", "AXA", "Bowtie", "BOC_Life", "YF_Life", "Cigna", "Bupa", "HSBC", "Generali", "BlueCross", "ChinaLife"];
    for (const ins of expectedInsurers) {
        node_assert_1.default.ok(insurers.has(ins), `Should cover insurer ${ins}`);
    }
    const savings = (0, loader_js_1.loadPromosByCategory)("Savings_MultiCurrency");
    node_assert_1.default.strictEqual(savings.length, 20, "Should have 20 savings products");
    const ci = (0, loader_js_1.loadPromosByCategory)("Critical_Illness");
    node_assert_1.default.strictEqual(ci.length, 20, "Should have 20 critical illness products");
    const vhis = (0, loader_js_1.loadPromosByCategory)("Medical_VHIS");
    node_assert_1.default.strictEqual(vhis.length, 20, "Should have 20 VHIS products");
    const qdap = (0, loader_js_1.loadPromosByCategory)("Annuity_QDAP");
    node_assert_1.default.strictEqual(qdap.length, 19, "Should have 19 QDAP products");
    const ul = (0, loader_js_1.loadPromosByCategory)("Financing_UniversalLife");
    node_assert_1.default.strictEqual(ul.length, 20, "Should have 20 Universal Life products");
    // Verify Universal Life domain metrics schema
    for (const p of ul) {
        node_assert_1.default.ok(p.ul_metrics, `Product ${p.promo_id} must have ul_metrics`);
        node_assert_1.default.ok(p.ul_metrics.crediting_rate_current_pct > 0, "crediting_rate_current_pct > 0");
        node_assert_1.default.ok(p.ul_metrics.crediting_rate_guaranteed_pct > 0, "crediting_rate_guaranteed_pct > 0");
        node_assert_1.default.ok(p.ul_metrics.surrender_charge_years > 0, "surrender_charge_years > 0");
        node_assert_1.default.strictEqual(p.ul_metrics.financing_eligible, true, "financing_eligible is true");
        node_assert_1.default.ok(p.ul_metrics.max_ltv_pct >= 70 && p.ul_metrics.max_ltv_pct <= 90, "max_ltv_pct in range");
        node_assert_1.default.ok(p.ul_metrics.net_carry_spread_pct > 0, "net_carry_spread_pct > 0");
        node_assert_1.default.ok(p.ul_metrics.min_premium_usd >= 300000, "min_premium_usd >= 300000");
    }
    // Verify loadPromosByInsurer
    const aiaPromos = (0, loader_js_1.loadPromosByInsurer)("AIA");
    node_assert_1.default.strictEqual(aiaPromos.length, 11, "AIA should have 11 products across categories");
    const pruPromos = (0, loader_js_1.loadPromosByInsurer)("Prudential");
    node_assert_1.default.strictEqual(pruPromos.length, 10, "Prudential should have 10 products across categories");
});
(0, node_test_1.default)("11. Feature F4: Multimodal Extractor SDK & Offline Fallback across 9 Insurers & 5 Categories", async () => {
    const extractor = new gemini_pipeline_js_1.GeminiIntelligenceExtractor(); // Offline mode (no API key in test runner)
    // 1. Text extraction async fallback without throwing
    const textPromo = await extractor.extractFromText("安盛 盛利多元儲蓄 預繳 5.0% 首年回贈 25%");
    node_assert_1.default.strictEqual(textPromo.insurer, "AXA");
    node_assert_1.default.strictEqual(textPromo.category, "Savings_MultiCurrency");
    node_assert_1.default.strictEqual(textPromo.prepayment_scheme?.guaranteed_rate_pct, 5.0);
    node_assert_1.default.strictEqual(textPromo.premium_discounts[0].discount_rate_pct, 25.0);
    // 2. Image extraction async fallback without throwing
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const imagePromo = await extractor.extractFromImage(dummyBase64, "image/png");
    node_assert_1.default.ok(imagePromo.promo_id.startsWith("EXTRACT-"));
    node_assert_1.default.ok(imagePromo.product_name.length > 0);
    // 3. 9 Insurers Detection via parseOfflinePromoText
    const insurerTests = [
        ["友邦 盈御3", "AIA"],
        ["保誠 雋富", "Prudential"],
        ["宏利 宏摯", "Manulife"],
        ["永明 萬年延期", "Sun_Life"],
        ["富衛 危疾加諾保", "FWD"],
        ["安盛 盛利", "AXA"],
        ["中銀人壽 延年歲月", "BOC_Life"],
        ["萬通 萬葉", "YF_Life"],
        ["Bowtie Pink 自願醫保", "Bowtie"]
    ];
    for (const [textSnippet, expectedInsurer] of insurerTests) {
        const parsed = extractor.parseOfflinePromoText(textSnippet);
        node_assert_1.default.strictEqual(parsed.insurer, expectedInsurer, `Failed to detect insurer for snippet: ${textSnippet}`);
    }
    // 4. 5 Categories Detection
    const categoryTests = [
        ["友邦 盈御多元貨幣儲蓄", "Savings_MultiCurrency"],
        ["宏利 守護無間危疾保 癌症多次賠償", "Critical_Illness"],
        ["Bowtie Pink 自願醫保靈活計劃", "Medical_VHIS"],
        ["中銀人壽 延年歲月扣稅年金 QDAP", "Annuity_QDAP"],
        ["萬通 萬葉萬用壽險 保費融資 LTV 85%", "Financing_UniversalLife"]
    ];
    for (const [textSnippet, expectedCat] of categoryTests) {
        const parsed = extractor.parseOfflinePromoText(textSnippet);
        node_assert_1.default.strictEqual(parsed.category, expectedCat, `Failed to detect category for snippet: ${textSnippet}`);
    }
    // 5. Universal Life category detection & ul_metrics population
    const ulSnippet = "萬通 萬葉萬用壽險 保費融資 現行派息率 5.4% 融資成數 85%";
    const ulParsed = extractor.parseOfflinePromoText(ulSnippet);
    node_assert_1.default.strictEqual(ulParsed.insurer, "YF_Life");
    node_assert_1.default.strictEqual(ulParsed.category, "Financing_UniversalLife");
    node_assert_1.default.ok(ulParsed.ul_metrics, "ul_metrics must be defined for Universal Life");
    node_assert_1.default.strictEqual(ulParsed.ul_metrics?.crediting_rate_current_pct, 5.4);
    node_assert_1.default.strictEqual(ulParsed.ul_metrics?.max_ltv_pct, 85.0);
    node_assert_1.default.strictEqual(ulParsed.ul_metrics?.financing_eligible, true);
    node_assert_1.default.strictEqual(ulParsed.ul_metrics?.net_carry_spread_pct, 0.9); // 5.4 - 4.5 = 0.9
});
(0, node_test_1.default)("12. Feature F5: Dynamic Comparison Matrix Generation & HTML Injection with UL-only Fallback", () => {
    const promos = loadPromos();
    const generator = new briefing_generator_js_1.MorningBriefingGenerator();
    // 1. Dynamic Matrix rows generation from catalog
    const rows = generator.computeGrandMatrixRows(promos);
    node_assert_1.default.ok(rows.length >= 5, "Expected at least 5 insurer flagship rows");
    // Check insurer names present
    const insurers = rows.map(r => r.insurer);
    node_assert_1.default.ok(insurers.some(i => i.includes("AIA")), "AIA row present");
    node_assert_1.default.ok(insurers.some(i => i.includes("Prudential")), "Prudential row present");
    node_assert_1.default.ok(insurers.some(i => i.includes("Manulife")), "Manulife row present");
    // Check metrics present in rows
    const aiaRow = rows.find(r => r.insurer.includes("AIA"));
    node_assert_1.default.ok(aiaRow, "AIA row found");
    node_assert_1.default.ok(aiaRow.gn16.includes("96.5%"), "AIA GN16 ratio present");
    node_assert_1.default.ok(aiaRow.prepay.includes("5.00%"), "AIA prepayment rate present");
    node_assert_1.default.ok(aiaRow.breakeven.includes("18") && aiaRow.breakeven.includes("6"), "AIA breakeven years present");
    // 2. Attached to briefing data
    const briefing = generator.generateBriefingData(promos);
    node_assert_1.default.ok(briefing.grand_matrix_rows, "grand_matrix_rows attached to DailyMorningBriefing");
    node_assert_1.default.strictEqual(briefing.grand_matrix_rows.length, rows.length);
    // 3. Fallback on empty or UL-only dataset
    const ulPromos = (0, loader_js_1.loadPromosByCategory)("Financing_UniversalLife");
    const fallbackRows = generator.computeGrandMatrixRows(ulPromos);
    node_assert_1.default.strictEqual(fallbackRows.length, 5, "Fallback provides 5 default benchmark rows");
    node_assert_1.default.ok(fallbackRows[0].insurer.includes("AIA"));
    node_assert_1.default.ok(fallbackRows[1].insurer.includes("Prudential"));
    // 4. HTML slide rendering replacement
    const html = generator.renderMorningSlidesHtml(briefing);
    node_assert_1.default.ok(html.includes("96.5%"), "Rendered HTML contains GN16 ratio");
    node_assert_1.default.ok(html.includes("盈御多元貨幣計劃 3"), "Rendered HTML contains product name");
});
(0, node_test_1.default)("13. Feature F6: Financing Universal Life 3-Stage Tactical Pitch across 3 Tones", () => {
    const promos = loadPromos();
    const engine = new counter_pitch_js_1.CounterPitchEngine(promos);
    // 1. Cantonese Colloquial
    const resZh = engine.generateCounterPitch({
        category: "Financing_UniversalLife",
        our_product: "友邦 財富尊享萬用壽險",
        competitor_product: "宏利 宏裕傳承萬用壽險",
        client_scenario: "客人正在考慮做 80% LTV 保費融資，問息差套利有咩風險？",
        tone: "cantonese_colloquial"
    });
    node_assert_1.default.ok(resZh.matchup_title.includes("萬用壽險與保費融資對攻"), "Title reflects UL matchup");
    node_assert_1.default.ok(resZh.three_stage_framework.stage_1_empathy.includes("保費融資"), "Stage 1 empathy mentions premium financing");
    node_assert_1.default.ok(resZh.three_stage_framework.stage_2_blindspot.includes("Margin Call"), "Stage 2 attacks margin calls");
    node_assert_1.default.ok(resZh.three_stage_framework.stage_2_blindspot.includes("浮動"), "Stage 2 attacks floating borrowing cost");
    node_assert_1.default.ok(resZh.three_stage_framework.stage_2_blindspot.includes("退保費用"), "Stage 2 attacks surrender charge");
    node_assert_1.default.ok(resZh.three_stage_framework.stage_3_actuarial_checkmate.includes("無槓桿多元貨幣分紅儲蓄險"), "Stage 3 pivots to unleveraged savings");
    node_assert_1.default.strictEqual(resZh.attack_points.length, 3, "Provides 3 attack points");
    node_assert_1.default.strictEqual(resZh.regulatory_guardrail.compliance_audit_passed, true, "Passes GL20 audit");
    // 2. HK Business English
    const resEng = engine.generateCounterPitch({
        category: "Financing_UniversalLife",
        our_product: "AIA Platinum Wealth Universal Life",
        competitor_product: "Manulife ManuGrand Universal Life",
        client_scenario: "Client asks about 85% LTV premium financing yield arbitrage",
        tone: "hk_business_english"
    });
    node_assert_1.default.ok(resEng.three_stage_framework.stage_1_empathy.includes("catch your eyes"), "English stage 1 has catch your eyes");
    node_assert_1.default.ok(resEng.three_stage_framework.stage_2_blindspot.includes("floating funding cost"), "English stage 2 attacks floating funding cost");
    node_assert_1.default.ok(resEng.three_stage_framework.stage_2_blindspot.includes("margin call"), "English stage 2 attacks margin call");
    node_assert_1.default.ok(resEng.three_stage_framework.stage_3_actuarial_checkmate.includes("unleveraged participating multi-currency savings"), "English stage 3 pivots");
    node_assert_1.default.strictEqual(resEng.regulatory_guardrail.compliance_audit_passed, true);
    // 3. Formal Written Chinese
    const resFormal = engine.generateCounterPitch({
        category: "Financing_UniversalLife",
        our_product: "友邦 財富尊享萬用壽險",
        competitor_product: "永明 萬世傳奇萬用壽險",
        client_scenario: "內地訪港客戶詢問私行保費融資套利",
        tone: "formal_written_zh"
    });
    node_assert_1.default.ok(resFormal.three_stage_framework.stage_1_empathy.includes("保費融資"), "Formal stage 1 empathy");
    node_assert_1.default.ok(resFormal.three_stage_framework.stage_2_blindspot.includes("息差倒掛"), "Formal stage 2 spread inversion");
    node_assert_1.default.ok(resFormal.three_stage_framework.stage_2_blindspot.includes("Margin Call"), "Formal stage 2 margin call");
    node_assert_1.default.ok(resFormal.three_stage_framework.stage_3_actuarial_checkmate.includes("無槓桿多元貨幣分紅儲蓄架構"), "Formal stage 3 pivot");
    node_assert_1.default.strictEqual(resFormal.regulatory_guardrail.compliance_audit_passed, true);
});
(0, node_test_1.default)("14. Feature F7: Profile-Aware Adaptive Pitch Engine (Budget, Persona, Goal, Age)", () => {
    const promos = loadPromos();
    const engine = new counter_pitch_js_1.CounterPitchEngine(promos);
    // Profile-aware request: Budget $50,000, Persona: HighNetWorth_Legacy, Goal: Children_Education, Age: 42
    const profileRes = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: "友邦 盈御多元貨幣計劃 3",
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "客人睇緊保誠 5.8% 預繳，打算為 10 歲女兒準備留學儲蓄",
        client_profile: {
            budget_usd_annual: 50000,
            persona: "HighNetWorth_Legacy",
            target_goal: "Children_Education",
            age: 42
        }
    });
    // Verify budget tier discount calculation for AIA GP3 ($50,000 annual premium):
    // Tier 3 is >= $35,000 -> 22% base + 4% family + 2% bundle = 28% -> $14,000 savings
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("預算精算折扣"), "Strategy includes budget discount");
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("50,000"), "Strategy reflects $50,000 budget");
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("22%"), "Strategy reflects 22% base tier discount");
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("14,000"), "Strategy reflects $14,000 calculated savings");
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("HighNetWorth_Legacy"), "Strategy incorporates persona");
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("Children_Education"), "Strategy incorporates target goal");
    node_assert_1.default.ok(profileRes.core_pivot_strategy.includes("42歲"), "Strategy incorporates age");
    // Test calculateDiscountForBudget edge case: 0 budget
    const aiaGP3 = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
    const zeroBudgetCalc = engine.calculateDiscountForBudget(aiaGP3, 0);
    node_assert_1.default.strictEqual(zeroBudgetCalc.estimated_savings_usd, 0);
    // Test persona variation: Conservative_Income
    const consRes = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: "友邦 盈御多元貨幣計劃 3",
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "客人保守求穩",
        client_profile: {
            persona: "Conservative_Income",
            target_goal: "Retirement",
            age: 58
        }
    });
    node_assert_1.default.ok(consRes.core_pivot_strategy.includes("Conservative_Income"), "Incorporates Conservative_Income");
    node_assert_1.default.ok(consRes.core_pivot_strategy.includes("Retirement"), "Incorporates Retirement goal");
    node_assert_1.default.ok(consRes.core_pivot_strategy.includes("58歲"), "Incorporates 58 age");
});
(0, node_test_1.default)("15. Feature F8: Mobile Café App Interactivity & 54 Battle Combinations", () => {
    const cafePath = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
    node_assert_1.default.ok(fs_1.default.existsSync(cafePath), "mobile_cafe_app.html should exist");
    const html = fs_1.default.readFileSync(cafePath, "utf-8");
    // Verify interactive state updates
    node_assert_1.default.ok(html.includes("function updateBattleCard()"), "Should define updateBattleCard function");
    node_assert_1.default.ok(!html.includes("// Dynamic reactive updates\n    }"), "updateBattleCard should not be an empty stub");
    node_assert_1.default.ok(html.includes("COMPANY_PROFILES"), "Should contain structured company profiles database");
    // Verify all 9 top HK insurers are present
    const insurers = ["保誠 Prudential", "友邦 AIA", "宏利 Manulife", "永明 Sun Life", "富衛 FWD", "安盛 AXA", "純網上虛擬 Bowtie", "中銀人壽 BOC Life", "萬通 YF Life"];
    for (const ins of insurers) {
        node_assert_1.default.ok(html.includes(ins), `Should contain company pill for ${ins}`);
    }
    // Verify 6 claims are present
    const claims = ["5.8% 預繳", "首年保費回贈 28%", "癌症再次索償等待期", "自願醫保全數賠償", "保費融資 85% LTV", "QDAP 延期年金總回報"];
    for (const clm of claims) {
        node_assert_1.default.ok(html.includes(clm), `Should contain claim pill for ${clm}`);
    }
    // Verify toast feedback and dual views
    node_assert_1.default.ok(html.includes("toast"), "Should contain toast element/class");
    node_assert_1.default.ok(html.includes("agent-view"), "Should support Agent private view");
    node_assert_1.default.ok(html.includes("client-view"), "Should support Client public view");
});
(0, node_test_1.default)("16. Feature F9: Agent Branding & Theming Engine across Visual Assets", () => {
    const promos = loadPromos();
    const generator = new briefing_generator_js_1.MorningBriefingGenerator();
    const briefing = generator.generateBriefingData(promos);
    const comms = new viral_card_synthesizer_js_1.ViralTeamCommsEngine();
    const customBranding = {
        agent_name: "張天宇 Alex Cheung",
        title: "資深分區副總監 Senior Associate Director",
        insurer: "保誠保險 Prudential",
        agency_or_team: "晉領家族 Apex Legacy",
        license_no: "IA88392011",
        phone_whatsapp: "+852 9123 4567",
        primary_color: "#ED1B2E", // Prudential Red
        accent_color: "#FF5252",
        team_logo_text: "APEX",
        slogan: "以精算破局 · 護財富傳承"
    };
    // WhatsApp Broadcast
    const waText = comms.formatWhatsAppBroadcast(briefing, customBranding);
    node_assert_1.default.ok(waText.includes("張天宇 Alex Cheung"), "WhatsApp broadcast reflects agent name");
    node_assert_1.default.ok(waText.includes("IA88392011"), "WhatsApp broadcast reflects license stamp");
    node_assert_1.default.ok(waText.includes("晉領家族 Apex Legacy"), "WhatsApp broadcast reflects team name");
    // SVG Poster
    const posterSvg = comms.generatePersonalizedPosterSvg(briefing, customBranding);
    node_assert_1.default.ok(posterSvg.includes("張天宇 Alex Cheung"), "SVG poster reflects agent name");
    node_assert_1.default.ok(posterSvg.includes("IA88392011"), "SVG poster reflects license");
    node_assert_1.default.ok(posterSvg.includes("#ED1B2E"), "SVG poster reflects custom primary color");
    node_assert_1.default.ok(posterSvg.includes("APEX"), "SVG poster reflects logo text");
    node_assert_1.default.ok(posterSvg.includes("以精算破局"), "SVG poster reflects slogan");
    // HTML Flyer
    const flyerHtml = comms.generatePersonalizedPosterHtml(briefing, customBranding);
    node_assert_1.default.ok(flyerHtml.includes("張天宇 Alex Cheung"), "HTML flyer reflects agent name");
    node_assert_1.default.ok(flyerHtml.includes("#ED1B2E"), "HTML flyer reflects custom color theme");
    // Slide Deck dynamic theming
    const slideHtml = generator.renderMorningSlidesHtml(briefing, undefined, customBranding);
    node_assert_1.default.ok(slideHtml.includes("#ED1B2E"), "Slide deck reflects custom primary accent color in CSS :root");
});
(0, node_test_1.default)("17. Feature F10: Robust Swiss Slide Generator Compiler", () => {
    const scriptPath = path_1.default.join(process.cwd(), "scripts", "build_swiss_slides.py");
    node_assert_1.default.ok(fs_1.default.existsSync(scriptPath), "build_swiss_slides.py should exist");
    const scriptContent = fs_1.default.readFileSync(scriptPath, "utf-8");
    // Check that fragile line slicing is removed
    node_assert_1.default.ok(!scriptContent.includes("lines[:1250]"), "Fragile line slicing [:1250] should be eliminated");
    node_assert_1.default.ok(!scriptContent.includes("lines[1338:]"), "Fragile line slicing [1338:] should be eliminated");
    node_assert_1.default.ok(scriptContent.includes("replace("), "Should use semantic token/block replacement");
    // Check generated template
    const outTemplatePath = path_1.default.join(process.cwd(), "templates", "morning_slides.html");
    node_assert_1.default.ok(fs_1.default.existsSync(outTemplatePath), "Generated morning_slides.html template should exist");
    const slideTemplate = fs_1.default.readFileSync(outTemplatePath, "utf-8");
    node_assert_1.default.ok(slideTemplate.includes("{{GRAND_MATRIX_HTML}}"), "Template should preserve dynamic placeholders");
    node_assert_1.default.ok(slideTemplate.includes("window.print()"), "Template should inject PDF print action");
});
(0, node_test_1.default)("18. Feature F11: Circuit Breaker HALF_OPEN to CLOSED Self-Healing & Probe Logic", async () => {
    const cb = new diff_detector_js_1.IntelligenceCircuitBreaker(2, 50, 2); // failureThreshold=2, resetTimeout=50ms, successThreshold=2
    const ts = new Date().toISOString();
    const normalPromo = {
        promo_id: "PROMO-TEST-OK",
        insurer: "AIA",
        product_name: "Test Savings",
        product_aliases: [],
        category: "Savings_MultiCurrency",
        currency_supported: ["USD"],
        payment_period_years: [5],
        validity: { start_date: "2026-01-01", end_date: "2026-12-31", channel: "All" },
        premium_discounts: [{ min_annual_premium_usd: 5000, discount_rate_pct: 15 }],
        prepayment_scheme: { is_available: true, guaranteed_rate_pct: 5.0, lock_period_years: 1, withdrawal_penalty: "None" },
        savings_metrics: {
            breakeven_guaranteed_year: 15,
            breakeven_expected_year: 7,
            expected_irr_year_20: 5.8,
            expected_irr_year_30: 6.5,
            gn16_fulfillment_ratio_pct: 95,
            policy_split_options: true,
            currency_switch_options: true,
            change_insured_unlimited: true,
            secondary_insured: true,
            death_benefit_trust_settlement: true
        },
        audit_metadata: { source_type: "Official_Circular", confidence_level: "Verified", verified_by_editor: true, created_at: ts }
    };
    const corruptPromo = {
        ...normalPromo,
        promo_id: "PROMO-CORRUPT",
        premium_discounts: [{ min_annual_premium_usd: 5000, discount_rate_pct: 250 }] // Out of bounds >80%
    };
    // Initially CLOSED
    node_assert_1.default.strictEqual(cb.getState().status, "CLOSED");
    // Trip the breaker: 2 failures
    cb.validatePromo(corruptPromo);
    node_assert_1.default.strictEqual(cb.getState().status, "CLOSED");
    cb.validatePromo(corruptPromo);
    node_assert_1.default.strictEqual(cb.getState().status, "OPEN");
    node_assert_1.default.strictEqual(cb.isTripped(), true);
    // Wait for reset timeout (50ms) -> transitions to HALF_OPEN
    await new Promise(r => setTimeout(r, 60));
    node_assert_1.default.strictEqual(cb.getState().status, "HALF_OPEN");
    // Probe 1: valid promo -> stays HALF_OPEN, consecutive successes = 1
    const p1 = cb.validatePromo(normalPromo);
    node_assert_1.default.strictEqual(p1.isValid, true);
    node_assert_1.default.strictEqual(cb.getState().status, "HALF_OPEN");
    node_assert_1.default.strictEqual(cb.getState().consecutive_successes, 1);
    // Probe 2: valid promo -> reaches successThreshold=2, transitions to CLOSED!
    const p2 = cb.validatePromo(normalPromo);
    node_assert_1.default.strictEqual(p2.isValid, true);
    node_assert_1.default.strictEqual(cb.getState().status, "CLOSED");
    node_assert_1.default.strictEqual(cb.getState().failure_count, 0);
    // Test failure during HALF_OPEN: immediately trips back to OPEN
    cb.trip();
    await new Promise(r => setTimeout(r, 60));
    node_assert_1.default.strictEqual(cb.getState().status, "HALF_OPEN");
    cb.validatePromo(corruptPromo);
    node_assert_1.default.strictEqual(cb.getState().status, "OPEN");
});
(0, node_test_1.default)("19. Feature F12: Dead-Letter Queue Retry Worker with Exponential Backoff", async () => {
    const testDlqPath = path_1.default.join(process.cwd(), "tmp", ".test_dlq.json");
    if (fs_1.default.existsSync(testDlqPath))
        fs_1.default.unlinkSync(testDlqPath);
    const dlq = new reliability_engine_js_1.DeadLetterQueue(testDlqPath);
    dlq.clear();
    // Enqueue test task
    const task = dlq.enqueueFailedTask("https://mock.hk/api", "Network 503");
    node_assert_1.default.strictEqual(task.status, "PENDING");
    node_assert_1.default.strictEqual(task.attempt_count, 1);
    // In the future: not due yet (default retry is +60s)
    const immediatelyDue = dlq.getDueTasks(new Date());
    node_assert_1.default.strictEqual(immediatelyDue.length, 0);
    // Simulate due in the future
    const futureTime = new Date(Date.now() + 120000);
    const due = dlq.getDueTasks(futureTime);
    node_assert_1.default.strictEqual(due.length, 1);
    node_assert_1.default.strictEqual(due[0].task_id, task.task_id);
    // Test DLQRetryWorker: Handler fails
    const worker = new reliability_engine_js_1.DLQRetryWorker(dlq, 1000); // 1s base backoff
    const failResult = await worker.processDueTasks(async () => false, futureTime);
    node_assert_1.default.strictEqual(failResult.processed, 1);
    node_assert_1.default.strictEqual(failResult.failed, 1);
    // Verify task attempt increased and backoff applied
    const updatedTask = dlq.getAllTasks().find(t => t.task_id === task.task_id);
    node_assert_1.default.strictEqual(updatedTask.attempt_count, 2);
    node_assert_1.default.strictEqual(updatedTask.status, "PENDING");
    // Attempt 3 (exhaust max_retries = 3) -> should transition to DEAD
    const futureTime2 = new Date(Date.now() + 600000);
    const failResult2 = await worker.processDueTasks(async () => false, futureTime2);
    node_assert_1.default.strictEqual(failResult2.dead, 1);
    const deadTask = dlq.getAllTasks().find(t => t.task_id === task.task_id);
    node_assert_1.default.strictEqual(deadTask.status, "DEAD");
    // Test successful resolution
    const task2 = dlq.enqueueFailedTask("https://mock.hk/api2", "Timeout");
    const successResult = await worker.processDueTasks(async () => true, new Date(Date.now() + 120000));
    node_assert_1.default.strictEqual(successResult.resolved, 1);
    const resolvedTask = dlq.getAllTasks().find(t => t.task_id === task2.task_id);
    node_assert_1.default.strictEqual(resolvedTask.status, "RESOLVED");
    // Cleanup
    if (fs_1.default.existsSync(testDlqPath))
        fs_1.default.unlinkSync(testDlqPath);
});
(0, node_test_1.default)("20. Feature F13: Default Root Landing Page & Dual-App Navigation", async () => {
    const cafeSource = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
    const slidesSource = path_1.default.join(process.cwd(), "templates", "morning_slides.html");
    node_assert_1.default.ok(fs_1.default.existsSync(cafeSource), "mobile_cafe_app.html must exist in templates/");
    node_assert_1.default.ok(fs_1.default.existsSync(slidesSource), "morning_slides.html must exist in templates/");
    const cafeHtml = fs_1.default.readFileSync(cafeSource, "utf-8");
    node_assert_1.default.ok(cafeHtml.includes("morning_slides.html"), "Mobile cafe app header must link to morning_slides.html");
    node_assert_1.default.ok(cafeHtml.includes("top-nav-slides-btn"), "Mobile cafe app header must include top-nav-slides-btn class");
    node_assert_1.default.ok(cafeHtml.includes("晨會投影片"), "Mobile cafe app button must display 晨會投影片");
    const slidesHtml = fs_1.default.readFileSync(slidesSource, "utf-8");
    node_assert_1.default.ok(slidesHtml.includes("index.html"), "Morning slides must link back to index.html");
    node_assert_1.default.ok(slidesHtml.includes("top-nav-battlecard-btn"), "Morning slides must include top-nav-battlecard-btn class");
    node_assert_1.default.ok(slidesHtml.includes("見客攻防卡"), "Morning slides button must display 見客攻防卡");
    node_assert_1.default.ok(slidesHtml.includes("ppt-hint-link"), "Morning slides toolbar must include ppt-hint-link shortcut");
    node_assert_1.default.ok(slidesHtml.includes("body.ppt-presenter .top-nav-battlecard-btn"), "Morning slides must hide button in presenter mode");
    // Verify daily runner generates dist files correctly
    const { DailyIntelligenceRunner } = await import("../src/scheduler/daily_runner.js");
    const runner = new DailyIntelligenceRunner();
    await runner.executeDailyCycle();
    const distIndex = path_1.default.join(process.cwd(), "dist", "index.html");
    const distCafe = path_1.default.join(process.cwd(), "dist", "cafe.html");
    const distSlides = path_1.default.join(process.cwd(), "dist", "morning_slides.html");
    node_assert_1.default.ok(fs_1.default.existsSync(distIndex), "dist/index.html must exist");
    node_assert_1.default.ok(fs_1.default.existsSync(distCafe), "dist/cafe.html must exist");
    node_assert_1.default.ok(fs_1.default.existsSync(distSlides), "dist/morning_slides.html must exist");
    const indexContent = fs_1.default.readFileSync(distIndex, "utf-8");
    node_assert_1.default.ok(indexContent.includes("INSURINTEL · 14:00 見客極速攻防卡"), "dist/index.html must be the mobile cafe app");
    node_assert_1.default.ok(indexContent.includes("morning_slides.html"), "dist/index.html must contain link to morning_slides.html");
    const cafeContent = fs_1.default.readFileSync(distCafe, "utf-8");
    node_assert_1.default.strictEqual(cafeContent, indexContent, "dist/cafe.html must be an identical alias of dist/index.html");
    const slidesContent = fs_1.default.readFileSync(distSlides, "utf-8");
    node_assert_1.default.ok(slidesContent.includes("index.html"), "dist/morning_slides.html must link to index.html");
});
(0, node_test_1.default)("21. Feature F14: Zero-Blank Battle Cards across All 54 Insurer x Claim Combinations", () => {
    const cafePath = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
    const html = fs_1.default.readFileSync(cafePath, "utf-8");
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    node_assert_1.default.ok(scriptMatch, "mobile_cafe_app.html must contain a <script> block");
    const sandbox = {
        document: {
            getElementById: () => null,
            querySelectorAll: () => []
        },
        navigator: {},
        console,
        addEventListener: () => { }
    };
    sandbox.window = sandbox;
    node_vm_1.default.createContext(sandbox);
    node_vm_1.default.runInContext(scriptMatch[1], sandbox);
    node_assert_1.default.strictEqual(typeof sandbox.getBattleCard, "function", "getBattleCard must be defined in sandbox");
    node_assert_1.default.strictEqual(typeof sandbox.COMPANY_PROFILES, "object", "COMPANY_PROFILES must be defined in sandbox");
    const insurers = [
        "保誠 Prudential",
        "友邦 AIA",
        "宏利 Manulife",
        "永明 Sun Life",
        "富衛 FWD",
        "安盛 AXA",
        "純網上虛擬 Bowtie",
        "中銀人壽 BOC Life",
        "萬通 YF Life"
    ];
    const claims = [
        "5.8% 預繳",
        "首年保費回贈 28%",
        "癌症再次索償等待期",
        "自願醫保全數賠償",
        "保費融資 85% LTV",
        "QDAP 延期年金總回報"
    ];
    let testedCount = 0;
    for (const ins of insurers) {
        for (const clm of claims) {
            testedCount++;
            const card = sandbox.getBattleCard(ins, clm);
            node_assert_1.default.ok(card, `Battle card for [${ins}] x [${clm}] must exist`);
            // 1. Text validations
            node_assert_1.default.ok(card.agent_title && card.agent_title.length > 5, `[${ins}] x [${clm}] agent_title must be valid`);
            node_assert_1.default.ok(card.agent_step_1 && card.agent_step_1.length > 5, `[${ins}] x [${clm}] agent_step_1 must be valid`);
            node_assert_1.default.ok(card.agent_step_2 && card.agent_step_2.length > 5, `[${ins}] x [${clm}] agent_step_2 must be valid`);
            node_assert_1.default.ok(card.agent_step_3 && card.agent_step_3.length > 5, `[${ins}] x [${clm}] agent_step_3 must be valid`);
            node_assert_1.default.ok(card.client_title && card.client_title.length > 5, `[${ins}] x [${clm}] client_title must be valid`);
            node_assert_1.default.ok(card.client_source && card.client_source.length > 3, `[${ins}] x [${clm}] client_source must be valid`);
            node_assert_1.default.ok(card.client_desc && card.client_desc.length > 5, `[${ins}] x [${clm}] client_desc must be valid`);
            node_assert_1.default.ok(card.whatsapp_script && card.whatsapp_script.length > 10, `[${ins}] x [${clm}] whatsapp_script must be valid`);
            node_assert_1.default.ok(card.disclaimer && card.disclaimer.length > 10, `[${ins}] x [${clm}] disclaimer must be valid`);
            // 2. Disallow forbidden strings
            const jsonStr = JSON.stringify(card);
            node_assert_1.default.ok(!jsonStr.includes("undefined"), `[${ins}] x [${clm}] must not contain 'undefined'`);
            node_assert_1.default.ok(!jsonStr.includes("null"), `[${ins}] x [${clm}] must not contain 'null'`);
            node_assert_1.default.ok(!jsonStr.includes("NaN"), `[${ins}] x [${clm}] must not contain 'NaN'`);
            node_assert_1.default.ok(!jsonStr.includes("（純網上"), `[${ins}] x [${clm}] must not contain raw placeholder '（純網上'`);
            node_assert_1.default.ok(!jsonStr.includes("（無專屬"), `[${ins}] x [${clm}] must not contain raw placeholder '（無專屬'`);
            // 3. Chart Bars validation
            node_assert_1.default.ok(Array.isArray(card.chart_bars) && card.chart_bars.length >= 2, `[${ins}] x [${clm}] chart_bars >= 2`);
            for (const bar of card.chart_bars) {
                node_assert_1.default.ok(bar.label && bar.label.length > 0, `Bar label must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(bar.value && bar.value.length > 0, `Bar value must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(typeof bar.widthPct === "number" && !Number.isNaN(bar.widthPct), `Bar widthPct must be number in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(bar.widthPct > 0 && bar.widthPct <= 100, `Bar widthPct must be between 1 and 100 in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(bar.color && bar.color.length > 0, `Bar color must be specified in [${ins}] x [${clm}]`);
            }
            // 4. Table Rows validation
            node_assert_1.default.ok(Array.isArray(card.table_rows) && card.table_rows.length >= 3, `[${ins}] x [${clm}] table_rows >= 3`);
            for (const row of card.table_rows) {
                node_assert_1.default.ok(row.label && row.label.length > 0, `Row label must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(row.value && row.value.length > 0, `Row value must be non-empty in [${ins}] x [${clm}]`);
            }
            // 5. Bowtie Tailored Boundary Logic checks
            if (ins.includes("Bowtie")) {
                if (clm.includes("預繳")) {
                    node_assert_1.default.ok(card.agent_step_2.includes("未設有具備複利分紅"), "Bowtie + prepayment must articulate pure protection vs par savings");
                    node_assert_1.default.ok(!card.agent_step_3.includes("88%"), "Bowtie + prepayment must not assert fake 88% fulfillment ratio");
                }
                if (clm.includes("融資")) {
                    node_assert_1.default.ok(card.agent_step_2.includes("未設有任何針對虛擬保單的保費融資通道"), "Bowtie + UL must explain virtual boundary");
                }
                if (clm.includes("年金")) {
                    node_assert_1.default.ok(card.agent_step_2.includes("未獲批發行任何可享每年 HK$60,000 薪俸稅免稅額的 QDAP"), "Bowtie + QDAP must explain lack of IA-approved QDAP");
                }
                if (clm.includes("自願醫保")) {
                    node_assert_1.default.ok(card.agent_step_2.includes("自主線上申報") || card.agent_step_2.includes("Chatbot") || card.agent_step_3.includes("出院免找數"), "Bowtie + VHIS must contrast cashless vs self-reimbursement");
                }
            }
            else {
                // Traditional insurers + VHIS: Must NOT say "純線上保險只有 Chatbot 同 Email"
                if (clm.includes("自願醫保")) {
                    node_assert_1.default.ok(!card.agent_step_2.includes("純線上保險只有 Chatbot 同 Email"), `Traditional insurer [${ins}] + VHIS must NOT say pure online chatbot`);
                    node_assert_1.default.ok(card.agent_step_3.includes("出院免找數"), `Traditional insurer [${ins}] + VHIS must highlight cashless direct billing`);
                }
            }
        }
    }
    node_assert_1.default.strictEqual(testedCount, 54, "Must have tested exactly 54 insurer x claim combinations");
    // 6. Direct Canonical Keys Validation (Engine Idempotence across 9 Insurers x 6 Canonical Keys)
    const canonicalClaimKeys = [
        { key: "prepayment", expected: ["5.8%", "預繳", "業務邊界"] },
        { key: "rebate", expected: ["28%", "回贈", "直銷保費架構"] },
        { key: "critical_illness", expected: ["危疾", "癌症", "等待期", "跳水"] },
        { key: "vhis", expected: ["自願醫保", "出院免找數", "標靶藥"] },
        { key: "financing_ul", expected: ["保費融資", "85%", "私銀"] },
        { key: "qdap", expected: ["QDAP", "年金", "扣稅"] }
    ];
    for (const ins of insurers) {
        for (const cDef of canonicalClaimKeys) {
            const card = sandbox.getBattleCard(ins, cDef.key);
            node_assert_1.default.ok(card, `Battle card for [${ins}] x canonical key [${cDef.key}] must exist`);
            const matched = cDef.expected.some(kw => card.agent_title.includes(kw));
            node_assert_1.default.ok(matched, `Direct call getBattleCard('${ins}', '${cDef.key}') failed to resolve claim. Title was: ${card.agent_title}`);
            if (cDef.key !== "prepayment") {
                if (!ins.includes("Bowtie")) {
                    node_assert_1.default.ok(!card.agent_title.includes("5.8% 預繳"), `Key '${cDef.key}' wrongly fell back to prepayment for ${ins}`);
                }
                else {
                    node_assert_1.default.ok(!card.agent_title.includes("業務邊界與傳統旗艦儲蓄傳承價值"), `Key '${cDef.key}' wrongly fell back to Bowtie prepayment card`);
                }
            }
        }
    }
});
(0, node_test_1.default)("22. Feature F15: Interactive DOM Pill Switching & Event Loop across All 54 Insurer x Claim Combinations", () => {
    const cafePath = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
    const html = fs_1.default.readFileSync(cafePath, "utf-8");
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    node_assert_1.default.ok(scriptMatch, "mobile_cafe_app.html must contain a <script> block");
    const domElements = {};
    const makeMockElement = (id, tagName = "div") => ({
        id,
        tagName: tagName.toUpperCase(),
        innerHTML: "",
        innerText: "",
        value: "",
        select: () => { },
        style: { display: "block", opacity: "1" },
        className: "",
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            toggle(c, force) {
                if (force === true)
                    this.classes.add(c);
                else if (force === false)
                    this.classes.delete(c);
                else if (this.classes.has(c))
                    this.classes.delete(c);
                else
                    this.classes.add(c);
            },
            contains(c) { return this.classes.has(c); }
        }
    });
    const registeredIds = [
        "btn-agent-view", "btn-client-view", "agent-view", "client-view",
        "company-pills", "claim-pills", "agent-title", "agent-step-1",
        "agent-step-2", "agent-step-3", "client-title", "client-source",
        "client-desc", "client-chart-box", "client-chart-title",
        "client-chart-bars", "client-table-container", "client-table-title",
        "client-table", "client-disclaimer", "toast", "link-morning-slides"
    ];
    for (const id of registeredIds) {
        domElements[id] = makeMockElement(id, id.includes("btn") ? "button" : id.includes("table") ? "table" : "div");
    }
    const makePill = (text) => {
        const el = makeMockElement("", "button");
        el.innerText = text;
        el.className = "thumb-pill";
        return el;
    };
    const companyPills = [
        makePill("保誠 Prudential"),
        makePill("友邦 AIA"),
        makePill("宏利 Manulife"),
        makePill("永明 Sun Life"),
        makePill("富衛 FWD"),
        makePill("安盛 AXA"),
        makePill("網上 Bowtie"),
        makePill("中銀人壽 BOC Life"),
        makePill("萬通 YF Life")
    ];
    const claimPills = [
        makePill("5.8% 預繳 / 保證高回報"),
        makePill("首年保費回贈 28%"),
        makePill("癌症再次索償等待期"),
        makePill("自願醫保全數賠償"),
        makePill("保費融資 85% LTV"),
        makePill("QDAP 延期年金總回報")
    ];
    const sandbox = {
        document: {
            getElementById: (id) => domElements[id] || null,
            querySelectorAll: (sel) => {
                if (sel === "#company-pills .thumb-pill")
                    return companyPills;
                if (sel === "#claim-pills .thumb-pill")
                    return claimPills;
                return [];
            },
            createElement: (tag) => makeMockElement("", tag),
            body: { appendChild: () => { }, removeChild: () => { } },
            execCommand: () => true
        },
        navigator: { clipboard: { writeText: async () => { } } },
        console,
        clearTimeout: (t) => clearTimeout(t),
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        alert: () => { },
        addEventListener: () => { }
    };
    sandbox.window = sandbox;
    node_vm_1.default.createContext(sandbox);
    node_vm_1.default.runInContext(scriptMatch[1], sandbox);
    // 1. Verify global functions and window exposure
    node_assert_1.default.strictEqual(typeof sandbox.selectCompany, "function", "selectCompany must be defined");
    node_assert_1.default.strictEqual(typeof sandbox.selectClaim, "function", "selectClaim must be defined");
    node_assert_1.default.strictEqual(typeof sandbox.updateBattleCard, "function", "updateBattleCard must be defined");
    node_assert_1.default.strictEqual(typeof sandbox.switchView, "function", "switchView must be defined");
    node_assert_1.default.ok(typeof sandbox.setViewMode === "function" || typeof sandbox.window.setViewMode === "function", "setViewMode must be exposed on window");
    const claimDefinitions = [
        { key: "prepayment", label: "5.8% 預繳", keywords: ["5.8%", "預繳", "業務邊界"] },
        { key: "rebate", label: "首年保費回贈 28%", keywords: ["28%", "回贈", "直銷保費架構"] },
        { key: "critical_illness", label: "癌症再次索償等待期", keywords: ["危疾", "癌症", "跳水"] },
        { key: "vhis", label: "自願醫保全數賠償", keywords: ["自願醫保", "出院免找數", "標靶藥"] },
        { key: "financing_ul", label: "保費融資 85% LTV", keywords: ["保費融資", "85%", "私銀"] },
        { key: "qdap", label: "QDAP 延期年金總回報", keywords: ["QDAP", "年金", "扣稅"] }
    ];
    let switchCount = 0;
    for (let cIdx = 0; cIdx < companyPills.length; cIdx++) {
        const compPill = companyPills[cIdx];
        // Simulate user clicking company pill
        sandbox.selectCompany(compPill, compPill.innerText);
        node_assert_1.default.ok(compPill.classList.contains("active"), `Company pill ${compPill.innerText} must have active class`);
        for (let kIdx = 0; kIdx < claimDefinitions.length; kIdx++) {
            const claimDef = claimDefinitions[kIdx];
            const claimPill = claimPills[kIdx];
            // Simulate user clicking claim pill
            sandbox.selectClaim(claimPill, claimPill.innerText);
            switchCount++;
            // Verify pill active class
            node_assert_1.default.ok(claimPill.classList.contains("active"), `Claim pill ${claimDef.label} must have active class`);
            // Verify DOM updates
            const titleHtml = domElements["agent-title"].innerHTML;
            node_assert_1.default.ok(titleHtml.length > 5, `agent-title must be populated for ${compPill.innerText} x ${claimDef.label}`);
            // Critical Anti-Freeze Assertion: Non-prepayment claims MUST NOT render prepayment copy
            if (claimDef.key !== "prepayment") {
                const isBowtie = compPill.innerText.includes("Bowtie");
                if (!isBowtie) {
                    node_assert_1.default.ok(!titleHtml.includes("5.8% 預繳"), `UI FREEZE BUG: [${compPill.innerText}] x [${claimDef.label}] stayed on 5.8% 預繳! Got: ${titleHtml}`);
                    node_assert_1.default.ok(!titleHtml.includes("浮動陷阱"), `UI FREEZE BUG: [${compPill.innerText}] x [${claimDef.label}] stayed on 浮動陷阱! Got: ${titleHtml}`);
                }
                else {
                    node_assert_1.default.ok(!titleHtml.includes("業務邊界與傳統旗艦儲蓄傳承價值"), `UI FREEZE BUG: Bowtie x [${claimDef.label}] stayed on Bowtie prepayment card! Got: ${titleHtml}`);
                }
            }
            // Assert expected content keywords are present
            const matched = claimDef.keywords.some((kw) => titleHtml.includes(kw));
            node_assert_1.default.ok(matched, `agent-title for [${compPill.innerText}] x [${claimDef.label}] must contain one of [${claimDef.keywords.join(", ")}]. Got: ${titleHtml}`);
            // Verify other required DOM elements are reactive
            node_assert_1.default.ok(domElements["agent-step-1"].innerHTML.length > 0, "agent-step-1 must be populated");
            node_assert_1.default.ok(domElements["agent-step-2"].innerHTML.length > 0, "agent-step-2 must be populated");
            node_assert_1.default.ok(domElements["agent-step-3"].innerHTML.length > 0, "agent-step-3 must be populated");
            node_assert_1.default.ok(domElements["client-title"].innerHTML.length > 0, "client-title must be populated");
            node_assert_1.default.ok(domElements["client-chart-bars"].innerHTML.includes("chart-bar-fill"), "chart-bars must render bars");
            node_assert_1.default.ok(!domElements["client-chart-bars"].innerHTML.includes("NaN%"), "chart-bars must not have NaN%");
            node_assert_1.default.ok(domElements["client-table"].innerHTML.includes("<tr"), "table must render rows");
        }
    }
    node_assert_1.default.strictEqual(switchCount, 54, "Must have interactively switched all 54 pairs in the DOM");
    // 2. Test canonical string overload for selectClaim
    for (const claimDef of claimDefinitions) {
        sandbox.selectClaim(claimDef.key);
        const title = domElements["agent-title"].innerHTML;
        const matched = claimDef.keywords.some((kw) => title.includes(kw));
        node_assert_1.default.ok(matched, `selectClaim('${claimDef.key}') must update title. Got: ${title}`);
    }
    // 3. Test dual-perspective view toggle
    sandbox.switchView("client");
    node_assert_1.default.strictEqual(domElements["agent-view"].style.display, "none", "agent-view display must be none in client mode");
    node_assert_1.default.strictEqual(domElements["client-view"].style.display, "block", "client-view display must be block in client mode");
    sandbox.switchView("agent");
    node_assert_1.default.strictEqual(domElements["agent-view"].style.display, "block", "agent-view display must be block in agent mode");
    node_assert_1.default.strictEqual(domElements["client-view"].style.display, "none", "client-view display must be none in agent mode");
    // 4. Test WhatsApp clipboard copy and toast
    delete sandbox.navigator.clipboard;
    sandbox.copyWhatsAppPitch();
    node_assert_1.default.strictEqual(domElements["toast"].style.display, "block", "Toast must display on copy");
    node_assert_1.default.ok(domElements["toast"].innerText.includes("WhatsApp"), "Toast text must mention WhatsApp");
});
(0, node_test_1.default)("23. Feature F16: Stance-Aware Bilateral Counter-Pitch Engine & Direct 1v1 Product Comparison", () => {
    const promos = loadPromos();
    const engine = new counter_pitch_js_1.CounterPitchEngine(promos);
    const aiaSavings = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
    const pruSavings = promos.find(p => p.insurer === "Prudential" && p.category === "Savings_MultiCurrency");
    node_assert_1.default.ok(aiaSavings, "AIA Savings promo must exist");
    node_assert_1.default.ok(pruSavings, "Prudential Savings promo must exist");
    // 1. Bilateral Test: AIA as Our Company vs Prudential as Rival (Higher GN16 stance)
    const aiaVsPru = engine.generateBilateralCounterPitch(aiaSavings, pruSavings, "cantonese_colloquial");
    node_assert_1.default.ok(aiaVsPru, "AIA vs Pru counter pitch must generate");
    node_assert_1.default.strictEqual(aiaVsPru.regulatory_guardrail.compliance_audit_passed, true, "AIA vs Pru counter pitch must pass GL20 compliance");
    node_assert_1.default.ok(aiaVsPru.three_stage_framework.stage_3_actuarial_checkmate.includes("GN16") ||
        aiaVsPru.three_stage_framework.stage_3_actuarial_checkmate.includes("96.5%"), "AIA vs Pru stage 3 must focus on GN16 fulfillment ratio advantage");
    // 2. Bilateral Test: Prudential as Our Company vs AIA as Rival (Lower GN16, higher upfront cash yield stance)
    const pruVsAia = engine.generateBilateralCounterPitch(pruSavings, aiaSavings, "cantonese_colloquial");
    node_assert_1.default.ok(pruVsAia, "Pru vs AIA counter pitch must generate");
    node_assert_1.default.strictEqual(pruVsAia.regulatory_guardrail.compliance_audit_passed, true, "Pru vs AIA counter pitch must pass GL20 compliance");
    node_assert_1.default.ok(pruVsAia.three_stage_framework.stage_3_actuarial_checkmate.includes("實時落袋確定性") ||
        pruVsAia.three_stage_framework.stage_3_actuarial_checkmate.includes("落袋收益") ||
        pruVsAia.three_stage_framework.stage_3_actuarial_checkmate.includes("首年提供最高保費回贈"), "Pru vs AIA stage 3 must focus on upfront cash rebate and certainty");
    // 3. Test Bilateral Specs in Mobile Cafe App script
    const cafePath = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
    const html = fs_1.default.readFileSync(cafePath, "utf-8");
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    node_assert_1.default.ok(scriptMatch, "mobile_cafe_app.html must contain a <script> block");
    const sandbox = {
        document: {
            getElementById: () => null,
            querySelectorAll: () => []
        },
        navigator: {},
        console,
        addEventListener: () => { }
    };
    sandbox.window = sandbox;
    node_vm_1.default.createContext(sandbox);
    node_vm_1.default.runInContext(scriptMatch[1], sandbox);
    node_assert_1.default.strictEqual(typeof sandbox.getBattleCard, "function", "getBattleCard must be defined");
    // 3-arg bilateral call: (ourCompany, rivalCompany, claimKey)
    const cardAiaVsPru = sandbox.getBattleCard("AIA", "Prudential", "prepayment");
    node_assert_1.default.ok(cardAiaVsPru.bilateral_specs, "bilateral_specs must exist in battle card");
    node_assert_1.default.strictEqual(cardAiaVsPru.bilateral_specs.length, 6, "Must contain exactly 6 core bilateral metrics");
    const gn16RowA = cardAiaVsPru.bilateral_specs.find((r) => r.label === "GN16 實現率");
    node_assert_1.default.ok(gn16RowA, "Must contain GN16 metric");
    node_assert_1.default.strictEqual(gn16RowA.winner, "our", "AIA should be winner for GN16 against Prudential");
    // Swap roles: Prudential as ourCompany vs AIA as rival
    const cardPruVsAia = sandbox.getBattleCard("Prudential", "AIA", "prepayment");
    node_assert_1.default.ok(cardPruVsAia.bilateral_specs, "bilateral_specs must exist in swapped battle card");
    const rebateRowP = cardPruVsAia.bilateral_specs.find((r) => r.label === "首年保費回贈");
    node_assert_1.default.ok(rebateRowP, "Must contain Rebate metric");
    node_assert_1.default.strictEqual(rebateRowP.winner, "our", "Prudential should be winner for Rebate against AIA (28% vs 22%)");
    const prepayRowP = cardPruVsAia.bilateral_specs.find((r) => r.label === "預繳保證利率");
    node_assert_1.default.ok(prepayRowP, "Must contain Prepayment metric");
    node_assert_1.default.strictEqual(prepayRowP.winner, "our", "Prudential should be winner for Prepayment against AIA (5.8% vs 5.0%)");
});

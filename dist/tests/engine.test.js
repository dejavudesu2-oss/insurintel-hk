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

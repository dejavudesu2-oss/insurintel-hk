"use strict";
/**
 * Adversarial Challenger M2_2 - Empirical Stress Harness for Features F6 & F7
 *
 * Verifies:
 * 1. Combinatorial Pitch Generation across 5 categories x 3 tones x 3 personas x 4 goals (180 combinations).
 * 2. Financing_UniversalLife Battle Cards: Stage 1 (empathy), Stage 2 (blindspots: floating rate, margin call, surrender lock-in), Stage 3 (pivot) across 3 tones.
 * 3. Client Profile Adaptation: Budget boundaries ($0, -$50k, $10M), age boundaries (18, 45, 75), and math accuracy.
 * 4. KnowledgeBase Lookup (findPromo) & Resilience:
 *    - Empty string, null, undefined safety.
 *    - Whitespace and punctuation stripping behavior (investigating empty substring matching).
 *    - Non-string unhandled exception vulnerability.
 *    - Empty KB resilience in generateCounterPitch (does findPromo undefined cause a crash?).
 *    - calculateDiscountForBudget(undefined) vulnerability.
 * 5. HKIA GL20 Compliance Guardrails & Sanitization under adversarial input.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_assert_1 = __importDefault(require("node:assert"));
const loader_js_1 = require("../src/mock_data/loader.js");
const counter_pitch_js_1 = require("../src/engine/counter_pitch.js");
const records = [];
function recordTest(suite, test, fn) {
    try {
        fn();
        records.push({ suite, test, passed: true });
        console.log(`[PASS] ${suite} -> ${test}`);
    }
    catch (err) {
        records.push({ suite, test, passed: false, error: err.message, details: err.stack });
        console.error(`[FAIL] ${suite} -> ${test}: ${err.message}`);
    }
}
console.log("================================================================================");
console.log("STARTING EMPIRICAL ADVERSARIAL CHALLENGE M2_2 (Features F6 & F7)");
console.log("================================================================================");
const allPromos = (0, loader_js_1.loadAllMockPromos)();
const engine = new counter_pitch_js_1.CounterPitchEngine(allPromos);
// ============================================================================
// SUITE 1: Combinatorial Stress Matrix (5 Categories x 3 Tones x 3 Personas x 4 Goals = 180 combinations)
// ============================================================================
const categories = [
    "Savings_MultiCurrency",
    "Critical_Illness",
    "Medical_VHIS",
    "Annuity_QDAP",
    "Financing_UniversalLife"
];
const tones = [
    "cantonese_colloquial",
    "hk_business_english",
    "formal_written_zh"
];
const personas = [
    "Conservative_Income",
    "HighNetWorth_Legacy",
    "Smart_Shopper"
];
const goals = [
    "Capital_Appreciation",
    "Children_Education",
    "Retirement",
    "Critical_Protection"
];
let combinationCount = 0;
let passedCombinations = 0;
for (const cat of categories) {
    for (const tone of tones) {
        for (const persona of personas) {
            for (const goal of goals) {
                combinationCount++;
                const testLabel = `Cat: ${cat} | Tone: ${tone} | Persona: ${persona} | Goal: ${goal}`;
                recordTest("Suite 1: Combinatorial Matrix", testLabel, () => {
                    const res = engine.generateCounterPitch({
                        category: cat,
                        our_product: "友邦 旗艦方案",
                        competitor_product: "競品 熱門方案",
                        client_scenario: `客戶畫像測試場景：尋求 ${goal} 配置`,
                        tone,
                        client_profile: {
                            budget_usd_annual: 60000,
                            persona,
                            target_goal: goal,
                            age: 38
                        }
                    });
                    node_assert_1.default.ok(res, "Response must be defined");
                    node_assert_1.default.strictEqual(typeof res.matchup_title, "string", "matchup_title must be string");
                    node_assert_1.default.ok(res.matchup_title.length > 0, "matchup_title must not be empty");
                    node_assert_1.default.strictEqual(res.tone, tone, `Tone must match requested ${tone}`);
                    // Framework stages
                    node_assert_1.default.ok(res.three_stage_framework.stage_1_empathy.length > 10, "Stage 1 empathy must be substantive");
                    node_assert_1.default.ok(res.three_stage_framework.stage_2_blindspot.length > 10, "Stage 2 blindspot must be substantive");
                    node_assert_1.default.ok(res.three_stage_framework.stage_3_actuarial_checkmate.length > 10, "Stage 3 pivot must be substantive");
                    // Attack points
                    node_assert_1.default.ok(Array.isArray(res.attack_points), "attack_points must be an array");
                    node_assert_1.default.ok(res.attack_points.length >= 2, "Must provide at least 2 attack points");
                    for (const pt of res.attack_points) {
                        node_assert_1.default.ok(pt.title && pt.title.length > 0, "Attack point title must exist");
                        node_assert_1.default.ok(pt.dimension && pt.dimension.length > 0, "Attack point dimension must exist");
                        node_assert_1.default.ok(pt.counter_pitch_script && pt.counter_pitch_script.length > 0, "Attack point script must exist");
                        node_assert_1.default.ok(pt.underlying_data_fact && pt.underlying_data_fact.length > 0, "Attack point data fact must exist");
                    }
                    // Regulatory Guardrail
                    node_assert_1.default.ok(res.regulatory_guardrail, "regulatory_guardrail must exist");
                    node_assert_1.default.ok(res.regulatory_guardrail.official_disclaimer.includes("保監局"), "Disclaimer must reference HKIA");
                    node_assert_1.default.strictEqual(res.regulatory_guardrail.compliance_audit_passed, true, "Standard pitch must pass GL20 audit");
                    // Profile Adaptation in core_pivot_strategy
                    node_assert_1.default.ok(res.core_pivot_strategy.includes(persona), `core_pivot_strategy must mention persona ${persona}`);
                    node_assert_1.default.ok(res.core_pivot_strategy.includes(goal), `core_pivot_strategy must mention goal ${goal}`);
                    node_assert_1.default.ok(res.core_pivot_strategy.includes("38歲"), "core_pivot_strategy must reflect age 38");
                    passedCombinations++;
                });
            }
        }
    }
}
recordTest("Suite 1: Combinatorial Summary", "Completed all 180 combinations", () => {
    node_assert_1.default.strictEqual(combinationCount, 180, "Expected exactly 180 combinations");
    node_assert_1.default.strictEqual(passedCombinations, 180, "All 180 combinations must pass");
});
// ============================================================================
// SUITE 2: Financing_UniversalLife Battle Cards Across 3 Tones
// ============================================================================
recordTest("Suite 2: Financing_UniversalLife", "Tone 1: cantonese_colloquial Battle Card verification", () => {
    const res = engine.generateCounterPitch({
        category: "Financing_UniversalLife",
        our_product: "友邦 財富尊享萬用壽險",
        competitor_product: "宏利 宏裕傳承萬用壽險",
        client_scenario: "客人問私銀保費融資 80% LTV 槓桿息差套利有冇得諗？",
        tone: "cantonese_colloquial"
    });
    // Stage 1: Empathy & Acknowledgment
    node_assert_1.default.ok(res.three_stage_framework.stage_1_empathy.includes("保費融資") &&
        (res.three_stage_framework.stage_1_empathy.includes("LTV") || res.three_stage_framework.stage_1_empathy.includes("結算利率")), "Cantonese Stage 1 must empathize with interest in UL leverage and crediting rate");
    // Stage 2: Three Blindspots
    const s2 = res.three_stage_framework.stage_2_blindspot;
    node_assert_1.default.ok(s2.includes("Floating") || s2.includes("浮動"), "Stage 2 must challenge floating rate");
    node_assert_1.default.ok(s2.includes("SOFR") || s2.includes("HIBOR") || s2.includes("息差"), "Stage 2 must cite SOFR/HIBOR or spread inversion");
    node_assert_1.default.ok(s2.includes("Margin Call"), "Stage 2 must challenge margin call");
    node_assert_1.default.ok(s2.includes("48 小時") || s2.includes("補倉") || s2.includes("斬倉"), "Stage 2 must cite 48-hr margin call or liquidation");
    node_assert_1.default.ok(s2.includes("退保費用") || s2.includes("Deed of Assignment"), "Stage 2 must challenge surrender charge lock-in or bank assignment");
    // Stage 3: Actuarial Pivot
    const s3 = res.three_stage_framework.stage_3_actuarial_checkmate;
    node_assert_1.default.ok(s3.includes("無槓桿多元貨幣分紅儲蓄險"), "Stage 3 must pivot to unleveraged multi-currency savings");
    node_assert_1.default.ok(s3.includes("GN16") || s3.includes("96.5%"), "Stage 3 must cite GN16 fulfillment ratio");
    node_assert_1.default.ok(s3.includes("Margin Call"), "Stage 3 must highlight zero margin call risk");
    node_assert_1.default.ok(s3.includes("分拆") || s3.includes("貨幣"), "Stage 3 must highlight policy split and multi-currency flexibility");
    // Attack points (must be 3 dedicated points)
    node_assert_1.default.strictEqual(res.attack_points.length, 3, "Must have 3 dedicated attack points");
    node_assert_1.default.ok(res.attack_points[0].title.includes("浮動借貸成本"), "Attack point 1 on floating funding cost");
    node_assert_1.default.ok(res.attack_points[1].title.includes("Margin Call"), "Attack point 2 on margin call");
    node_assert_1.default.ok(res.attack_points[2].title.includes("退保"), "Attack point 3 on surrender lock-in");
});
recordTest("Suite 2: Financing_UniversalLife", "Tone 2: hk_business_english Battle Card verification", () => {
    const res = engine.generateCounterPitch({
        category: "Financing_UniversalLife",
        our_product: "AIA Platinum Wealth Universal Life",
        competitor_product: "Manulife ManuGrand Universal Life",
        client_scenario: "Client asking about 85% LTV private bank premium financing carry trade",
        tone: "hk_business_english"
    });
    // Stage 1: Empathy & Acknowledgment
    const s1 = res.three_stage_framework.stage_1_empathy;
    node_assert_1.default.ok(s1.includes("Premium Financing") || s1.includes("private bank"), "English Stage 1 mentions Premium Financing / private bank");
    node_assert_1.default.ok(s1.includes("catch your eyes"), "English Stage 1 uses business colloquial phrasing");
    node_assert_1.default.ok(s1.includes("LTV leverage") || s1.includes("crediting rate"), "English Stage 1 mentions LTV leverage or crediting rate");
    // Stage 2: Three Blindspots
    const s2 = res.three_stage_framework.stage_2_blindspot;
    node_assert_1.default.ok(s2.includes("floating funding cost") || s2.includes("SOFR"), "English Stage 2 attacks floating borrowing cost");
    node_assert_1.default.ok(s2.includes("margin call"), "English Stage 2 attacks margin call");
    node_assert_1.default.ok(s2.includes("48 hours") || s2.includes("forced liquidation"), "English Stage 2 highlights 48-hr forced liquidation");
    node_assert_1.default.ok(s2.includes("surrender charge lock-in") || s2.includes("Deed of Assignment"), "English Stage 2 highlights lock-in and assignment");
    // Stage 3: Actuarial Pivot
    const s3 = res.three_stage_framework.stage_3_actuarial_checkmate;
    node_assert_1.default.ok(s3.includes("unleveraged participating multi-currency savings"), "English Stage 3 pivots to unleveraged savings");
    node_assert_1.default.ok(s3.includes("GN16"), "English Stage 3 cites GN16 ratio");
    node_assert_1.default.ok(s3.includes("zero margin call risk"), "English Stage 3 cites zero margin call risk");
    node_assert_1.default.ok(s3.includes("currency swaps") || s3.includes("unlimited policy split"), "English Stage 3 highlights agility");
    // Attack points
    node_assert_1.default.strictEqual(res.attack_points.length, 3);
    node_assert_1.default.ok(res.attack_points[0].title.includes("Floating Funding Cost"));
    node_assert_1.default.ok(res.attack_points[1].title.includes("Margin Call"));
    node_assert_1.default.ok(res.attack_points[2].title.includes("退保"));
});
recordTest("Suite 2: Financing_UniversalLife", "Tone 3: formal_written_zh Battle Card verification", () => {
    const res = engine.generateCounterPitch({
        category: "Financing_UniversalLife",
        our_product: "友邦 財富尊享萬用壽險",
        competitor_product: "永明 萬世傳奇萬用壽險",
        client_scenario: "高淨值企業主客戶諮詢大額保費融資資產配置",
        tone: "formal_written_zh"
    });
    // Stage 1: Empathy & Acknowledgment
    const s1 = res.three_stage_framework.stage_1_empathy;
    node_assert_1.default.ok(s1.includes("保費融資 (Premium Financing) 萬用壽險方案"), "Formal Stage 1 introduces PF UL");
    node_assert_1.default.ok(s1.includes("現行結算利率") && s1.includes("槓桿套利"), "Formal Stage 1 acknowledges rate & leverage");
    // Stage 2: Three Blindspots
    const s2 = res.three_stage_framework.stage_2_blindspot;
    node_assert_1.default.ok(s2.includes("浮動借貸成本與息差倒掛風險"), "Formal Stage 2 attacks floating spread inversion");
    node_assert_1.default.ok(s2.includes("SOFR/HIBOR"), "Formal Stage 2 cites SOFR/HIBOR");
    node_assert_1.default.ok(s2.includes("Margin Call") || s2.includes("追繳保證金"), "Formal Stage 2 attacks Margin Call");
    node_assert_1.default.ok(s2.includes("48 至 72 小時"), "Formal Stage 2 cites 48-72h margin injection");
    node_assert_1.default.ok(s2.includes("退保費用鎖定") && s2.includes("保單轉讓契約 (Deed of Assignment)"), "Formal Stage 2 cites surrender lock and Deed of Assignment");
    // Stage 3: Actuarial Pivot
    const s3 = res.three_stage_framework.stage_3_actuarial_checkmate;
    node_assert_1.default.ok(s3.includes("無槓桿多元貨幣分紅儲蓄架構"), "Formal Stage 3 pivots to unleveraged savings");
    node_assert_1.default.ok(s3.includes("GN16 官方歷年分紅實現率高達 96.5%"), "Formal Stage 3 cites official GN16 96.5%");
    node_assert_1.default.ok(s3.includes("免除保證金追繳壓力"), "Formal Stage 3 confirms zero margin call stress");
    node_assert_1.default.ok(s3.includes("無限次分拆") && s3.includes("貨幣"), "Formal Stage 3 confirms currency and split flexibility");
    // Attack points
    node_assert_1.default.strictEqual(res.attack_points.length, 3);
});
// ============================================================================
// SUITE 3: Client Profile Adaptation & Budget Boundary Calculations
// ============================================================================
const aiaPromo = allPromos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
node_assert_1.default.ok(aiaPromo, "AIA Savings Promo must be loaded");
recordTest("Suite 3: Budget Adaptation", "Zero budget: calculateDiscountForBudget(promo, 0)", () => {
    const calc = engine.calculateDiscountForBudget(aiaPromo, 0);
    node_assert_1.default.strictEqual(calc.tier_discount_rate_pct, 0, "Tier discount should be 0");
    node_assert_1.default.strictEqual(calc.extra_bonus_pct, 0, "Extra bonus should be 0");
    node_assert_1.default.strictEqual(calc.total_concession_pct, 0, "Total concession should be 0");
    node_assert_1.default.strictEqual(calc.estimated_savings_usd, 0, "Estimated savings should be $0");
    const pitch = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "零預算測試",
        client_profile: { budget_usd_annual: 0 }
    });
    node_assert_1.default.ok(!pitch.core_pivot_strategy.includes("💰 預算精算折扣"), "Zero budget should not produce discount tactical note");
});
recordTest("Suite 3: Budget Adaptation", "Negative budget: calculateDiscountForBudget(promo, -50000)", () => {
    const calc = engine.calculateDiscountForBudget(aiaPromo, -50000);
    node_assert_1.default.strictEqual(calc.tier_discount_rate_pct, 0);
    node_assert_1.default.strictEqual(calc.extra_bonus_pct, 0);
    node_assert_1.default.strictEqual(calc.total_concession_pct, 0);
    node_assert_1.default.strictEqual(calc.estimated_savings_usd, 0);
    const pitch = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "負預算測試",
        client_profile: { budget_usd_annual: -50000 }
    });
    node_assert_1.default.ok(!pitch.core_pivot_strategy.includes("💰 預算精算折扣"), "Negative budget should not produce discount note");
});
recordTest("Suite 3: Budget Adaptation", "Extreme budget ($10,000,000): calculateDiscountForBudget(promo, 10000000)", () => {
    // AIA GP3 discounts:
    // min 5,000 -> 12% base + 2% fam = 14%
    // min 15,000 -> 18% base + 3% fam = 21%
    // min 35,000 -> 22% base + 4% fam + 2% bnd = 28%
    const calc = engine.calculateDiscountForBudget(aiaPromo, 10000000);
    node_assert_1.default.strictEqual(calc.tier_discount_rate_pct, 22, "Should match highest tier base discount 22%");
    node_assert_1.default.strictEqual(calc.extra_bonus_pct, 6, "Should match highest tier extra bonuses (4 + 2 = 6%)");
    node_assert_1.default.strictEqual(calc.total_concession_pct, 28, "Total concession should be 28%");
    node_assert_1.default.strictEqual(calc.estimated_savings_usd, 2800000, "10M * 28% = $2,800,000 savings");
    const pitch = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "超高淨值千萬美金預算",
        client_profile: { budget_usd_annual: 10000000 }
    });
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("10,000,000"), "Strategy contains formatted budget 10,000,000");
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("22%"), "Strategy contains 22% base discount");
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("28%"), "Strategy contains 28% total concession");
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("2,800,000"), "Strategy contains $2,800,000 calculated savings");
});
recordTest("Suite 3: Budget Adaptation", "Mathematical accuracy across intermediate budget tiers", () => {
    // Test tier 1: budget $10,000 (min 5,000 tier -> 12% base + 2% fam = 14%)
    const calc10k = engine.calculateDiscountForBudget(aiaPromo, 10000);
    node_assert_1.default.strictEqual(calc10k.tier_discount_rate_pct, 12);
    node_assert_1.default.strictEqual(calc10k.extra_bonus_pct, 2);
    node_assert_1.default.strictEqual(calc10k.total_concession_pct, 14);
    node_assert_1.default.strictEqual(calc10k.estimated_savings_usd, 1400);
    // Test tier 2: budget $20,000 (min 15,000 tier -> 18% base + 3% fam = 21%)
    const calc20k = engine.calculateDiscountForBudget(aiaPromo, 20000);
    node_assert_1.default.strictEqual(calc20k.tier_discount_rate_pct, 18);
    node_assert_1.default.strictEqual(calc20k.extra_bonus_pct, 3);
    node_assert_1.default.strictEqual(calc20k.total_concession_pct, 21);
    node_assert_1.default.strictEqual(calc20k.estimated_savings_usd, 4200);
    // Test tier 3: budget $50,000 (min 35,000 tier -> 22% base + 6% bonus = 28%)
    const calc50k = engine.calculateDiscountForBudget(aiaPromo, 50000);
    node_assert_1.default.strictEqual(calc50k.tier_discount_rate_pct, 22);
    node_assert_1.default.strictEqual(calc50k.extra_bonus_pct, 6);
    node_assert_1.default.strictEqual(calc50k.total_concession_pct, 28);
    node_assert_1.default.strictEqual(calc50k.estimated_savings_usd, 14000);
});
recordTest("Suite 3: Age Adaptation", "Young age (18): accumulates wealth horizon", () => {
    const pitch = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "年輕客戶投保",
        client_profile: { age: 18 }
    });
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("18歲"));
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("年輕積累期，發揮 30 年複利滾存極致優勢"));
});
recordTest("Suite 3: Age Adaptation", "Mid age (45): family balance horizon", () => {
    const pitch = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "中年責任期客戶",
        client_profile: { age: 45 }
    });
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("45歲"));
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("黃金責任期，平衡穩健增值與家庭保障防線"));
});
recordTest("Suite 3: Age Adaptation", "Senior age (75): legacy transfer horizon", () => {
    const pitch = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "高齡長者財富傳承",
        client_profile: { age: 75 }
    });
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("75歲"));
    node_assert_1.default.ok(pitch.core_pivot_strategy.includes("臨退傳承期，優先鎖定確定收益與跨代傳承"));
});
recordTest("Suite 3: Age Adaptation", "Zero or negative age boundaries", () => {
    const pitch0 = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "0歲測試",
        client_profile: { age: 0 }
    });
    node_assert_1.default.ok(!pitch0.core_pivot_strategy.includes("年齡規劃"), "Age 0 should not generate age note");
    const pitchNeg = engine.generateCounterPitch({
        category: "Savings_MultiCurrency",
        our_product: aiaPromo.product_name,
        competitor_product: "保誠 雋富多元貨幣計劃",
        client_scenario: "負歲數測試",
        client_profile: { age: -5 }
    });
    node_assert_1.default.ok(!pitchNeg.core_pivot_strategy.includes("年齡規劃"), "Negative age should not generate age note");
});
// ============================================================================
// SUITE 4: findPromo Resilience & Safety Stress Tests
// ============================================================================
recordTest("Suite 4: findPromo", "Empty string input safely returns undefined without throwing", () => {
    node_assert_1.default.strictEqual(engine.findPromo(""), undefined);
});
recordTest("Suite 4: findPromo", "Null and undefined inputs handled safely without throwing", () => {
    node_assert_1.default.strictEqual(engine.findPromo(null), undefined);
    node_assert_1.default.strictEqual(engine.findPromo(undefined), undefined);
});
recordTest("Suite 4: findPromo", "Adversarial observation: whitespace and punctuation strip to empty string and match first promo", () => {
    // When '   ' or '-' is given, cleanId becomes '' or strippedId becomes ''.
    // Because pNameClean.includes('') is true in JS, findPromo matches the first promo in allPromos.
    const spaceMatch = engine.findPromo("   ");
    const dashMatch = engine.findPromo("-");
    node_assert_1.default.ok(spaceMatch !== undefined, "Whitespace input returns first promo rather than undefined due to string.includes('')");
    node_assert_1.default.ok(dashMatch !== undefined, "Punctuation-only input returns first promo rather than undefined due to string.includes('')");
    node_assert_1.default.strictEqual(spaceMatch?.promo_id, allPromos[0].promo_id);
});
recordTest("Suite 4: findPromo", "Non-string input vulnerability: throws unhandled TypeError", () => {
    // If non-string is passed (e.g. number or object), identifier.trim() throws TypeError.
    node_assert_1.default.throws(() => {
        engine.findPromo(12345);
    }, /identifier\.trim is not a function/);
    node_assert_1.default.throws(() => {
        engine.findPromo({ id: "foo" });
    }, /identifier\.trim is not a function/);
});
recordTest("Suite 4: findPromo", "Non-existent product without category returns undefined without throwing", () => {
    const result = engine.findPromo("totally_non_existent_product_xyz_9999");
    node_assert_1.default.strictEqual(result, undefined);
});
recordTest("Suite 4: findPromo", "Non-existent product WITH category falls back to first category product", () => {
    const result = engine.findPromo("unknown_product_query_abc", "Critical_Illness");
    node_assert_1.default.ok(result, "Should fallback to category product");
    node_assert_1.default.strictEqual(result.category, "Critical_Illness");
});
recordTest("Suite 4: findPromo", "Retrieval accuracy across all 31 products by promo_id", () => {
    for (const promo of allPromos) {
        const found = engine.findPromo(promo.promo_id);
        node_assert_1.default.ok(found, `Must find product by promo_id: ${promo.promo_id}`);
        node_assert_1.default.strictEqual(found.promo_id, promo.promo_id);
    }
});
recordTest("Suite 4: findPromo", "Retrieval accuracy across product aliases and clean punctuation", () => {
    // Test lowercase
    const aiaFound = engine.findPromo("promo-aia-sav-2026-q4");
    node_assert_1.default.ok(aiaFound);
    node_assert_1.default.strictEqual(aiaFound.insurer, "AIA");
    // Test Chinese colloquial alias
    const pruFound = engine.findPromo("保誠 雋富");
    node_assert_1.default.ok(pruFound);
    node_assert_1.default.strictEqual(pruFound.insurer, "Prudential");
    // Test Bowtie
    const bowtieFound = engine.findPromo("bowtie 自願醫保");
    node_assert_1.default.ok(bowtieFound);
    node_assert_1.default.strictEqual(bowtieFound.insurer, "Bowtie");
});
recordTest("Suite 4: findPromo & Empty Engine Safety", "Empty KnowledgeBase does not crash generateCounterPitch across all 5 categories", () => {
    // Create an engine with NO promos at all
    const emptyEngine = new counter_pitch_js_1.CounterPitchEngine([]);
    for (const cat of categories) {
        for (const tone of tones) {
            const res = emptyEngine.generateCounterPitch({
                category: cat,
                our_product: "NonExistentOurProduct",
                competitor_product: "NonExistentCompProduct",
                client_scenario: "Scenario with empty knowledgebase",
                tone,
                client_profile: {
                    budget_usd_annual: 50000,
                    persona: "Conservative_Income",
                    target_goal: "Retirement",
                    age: 50
                }
            });
            node_assert_1.default.ok(res, `Empty engine must safely generate pitch for category: ${cat}, tone: ${tone}`);
            node_assert_1.default.ok(res.three_stage_framework.stage_1_empathy.length > 0);
            node_assert_1.default.ok(res.three_stage_framework.stage_2_blindspot.length > 0);
            node_assert_1.default.ok(res.three_stage_framework.stage_3_actuarial_checkmate.length > 0);
            node_assert_1.default.strictEqual(res.regulatory_guardrail.compliance_audit_passed, true);
        }
    }
});
recordTest("Suite 4: calculateDiscountForBudget", "Passing undefined promo to public calculateDiscountForBudget throws TypeError", () => {
    // Internal callers guard with `if (ourPromo)`, but public API crashes if promo is undefined
    node_assert_1.default.throws(() => {
        engine.calculateDiscountForBudget(undefined, 50000);
    }, /Cannot read properties of undefined/);
});
// ============================================================================
// SUITE 5: HKIA Compliance Guardrail & Sanitization under Adversarial Attacks
// ============================================================================
recordTest("Suite 5: Compliance Guardrail", "Interception of GL20 prohibited words: 保證穩賺, 對手一定蝕, 全港最高", () => {
    const dirtyText = "我地呢張單保證穩賺無風險，回報全港最高，對手一定蝕到入肉！";
    const audit = counter_pitch_js_1.HKIAComplianceGuardrail.auditAndSanitize(dirtyText);
    node_assert_1.default.strictEqual(audit.passed, false, "Dirty text must fail compliance audit");
    node_assert_1.default.ok(audit.warnings.length >= 3, `Expected at least 3 warnings, got ${audit.warnings.length}`);
    node_assert_1.default.ok(!audit.sanitizedText.includes("保證穩賺"), "Prohibited phrase '保證穩賺' must be cleansed");
    node_assert_1.default.ok(!audit.sanitizedText.includes("全港最高"), "Prohibited phrase '全港最高' must be cleansed");
    node_assert_1.default.ok(!audit.sanitizedText.includes("對手一定蝕"), "Prohibited phrase '對手一定蝕' must be cleansed");
    node_assert_1.default.ok(audit.sanitizedText.includes("預期長期穩健"), "Cleansed text must use compliant substitute");
});
recordTest("Suite 5: Compliance Guardrail", "Dynamic official disclaimer contains current fiscal year and mandatory notices", () => {
    const disclaimer = counter_pitch_js_1.HKIAComplianceGuardrail.generateDynamicDisclaimer();
    const currentYear = new Date().getFullYear();
    node_assert_1.default.ok(disclaimer.includes("【香港保監局 (IA) GL20 合規免責聲明】"));
    node_assert_1.default.ok(disclaimer.includes(String(currentYear)), `Disclaimer must include current fiscal year ${currentYear}`);
    node_assert_1.default.ok(disclaimer.includes("GN16"));
    node_assert_1.default.ok(disclaimer.includes("僅供持牌保險中介人內部專業研習使用"));
});
// ============================================================================
// SUITE 6: Promo with Missing or Malformed Discounts
// ============================================================================
recordTest("Suite 6: Malformed Discounts", "calculateDiscountForBudget with empty discounts array or undefined", () => {
    const promoNoDiscounts = {
        promo_id: "TEST-NO-DISCOUNT",
        insurer: "AIA",
        product_name: "Test No Discounts",
        category: "Savings_MultiCurrency",
        currency_supported: ["USD"],
        underwriting_concessions: { simplified_health_declaration: true }
    };
    const calcEmpty = engine.calculateDiscountForBudget(promoNoDiscounts, 50000);
    node_assert_1.default.strictEqual(calcEmpty.tier_discount_rate_pct, 0);
    node_assert_1.default.strictEqual(calcEmpty.estimated_savings_usd, 0);
    promoNoDiscounts.premium_discounts = [];
    const calcArr = engine.calculateDiscountForBudget(promoNoDiscounts, 50000);
    node_assert_1.default.strictEqual(calcArr.tier_discount_rate_pct, 0);
    node_assert_1.default.strictEqual(calcArr.estimated_savings_usd, 0);
});
// ============================================================================
// FINAL SUMMARY & VERDICT
// ============================================================================
console.log("================================================================================");
console.log("ADVERSARIAL STRESS TEST EXECUTION COMPLETE");
console.log("================================================================================");
const totalTests = records.length;
const passedTests = records.filter(r => r.passed).length;
const failedTests = records.filter(r => !r.passed).length;
console.log(`TOTAL TESTS RUN: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
if (failedTests > 0) {
    console.error("FAILURES ENCOUNTERED:");
    for (const f of records.filter(r => !r.passed)) {
        console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
        if (f.details)
            console.error(f.details);
    }
    process.exit(1);
}
else {
    console.log("ALL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS RATE.");
    process.exit(0);
}

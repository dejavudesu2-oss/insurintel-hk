/**
 * InsurIntel HK - Comprehensive Engine & Pipeline Test Suite
 */

import fs from "fs";
import path from "path";
import assert from "node:assert";
import test from "node:test";

import { IntelligenceDiffDetector, IntelligenceCircuitBreaker } from "../src/engine/diff_detector.js";
import { CounterPitchEngine, HKIAComplianceGuardrail } from "../src/engine/counter_pitch.js";
import { MorningBriefingGenerator } from "../src/engine/briefing_generator.js";
import { GeminiIntelligenceExtractor } from "../src/extractor/gemini_pipeline.js";
import { InsurancePromoComprehensive } from "../src/types/insurance.js";
import { ViralTeamCommsEngine, AgentBrandingConfig } from "../src/engine/viral_card_synthesizer.js";
import { SemanticCacheEngine, DeadLetterQueue, DLQRetryWorker } from "../src/backend/reliability_engine.js";
import { loadAllMockPromos, loadPromosByCategory, loadPromosByInsurer } from "../src/mock_data/loader.js";

function loadPromos(): InsurancePromoComprehensive[] {
  return loadAllMockPromos();
}

test("1. Data Models & Mock Datasets Integrity", () => {
  const promos = loadPromos();
  assert.ok(promos.length >= 6, "Expected at least 6 mock products across categories");

  const categories = new Set(promos.map(p => p.category));
  assert.ok(categories.has("Savings_MultiCurrency"), "Missing Savings category");
  assert.ok(categories.has("Critical_Illness"), "Missing CI category");
  assert.ok(categories.has("Medical_VHIS"), "Missing VHIS category");
  assert.ok(categories.has("Annuity_QDAP"), "Missing QDAP category");
  assert.ok(categories.has("Financing_UniversalLife"), "Missing Universal Life category");

  // Validate Savings specific metrics
  const aiaSavings = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
  assert.ok(aiaSavings, "AIA Savings not found");
  assert.ok(aiaSavings.savings_metrics?.gn16_fulfillment_ratio_pct! > 90, "GN16 fulfillment ratio should be valid");
  assert.ok(aiaSavings.premium_discounts.length >= 3, "Tiered discounts should have multiple tiers");

  // Validate Universal Life specific metrics
  const aiaUL = promos.find(p => p.insurer === "AIA" && p.category === "Financing_UniversalLife");
  assert.ok(aiaUL, "AIA Universal Life not found");
  assert.ok(aiaUL.ul_metrics, "AIA UL should have ul_metrics");
  assert.ok(aiaUL.ul_metrics.crediting_rate_current_pct > 5.0, "AIA UL crediting rate should be > 5.0%");
  assert.strictEqual(aiaUL.ul_metrics.financing_eligible, true, "AIA UL should be financing eligible");
});

test("2. Diff & Delta Detection Engine", () => {
  const promos = loadPromos();
  const diffDetector = new IntelligenceDiffDetector();

  const prevPromos = JSON.parse(JSON.stringify(promos));
  // Simulate Prudential rate change from 5.5% -> 5.8%
  const pru = prevPromos.find((p: any) => p.insurer === "Prudential");
  pru.prepayment_scheme.guaranteed_rate_pct = 5.5;

  const changes = diffDetector.detectChanges(promos, prevPromos);
  assert.ok(changes.length > 0, "Should detect delta changes");

  const rateChange = changes.find(c => c.change_type === "PREPAYMENT_RATE_CHANGE");
  assert.ok(rateChange, "Should identify PREPAYMENT_RATE_CHANGE");
  assert.strictEqual(rateChange.severity, "URGENT");
  assert.ok(rateChange.description.includes("5.5% 調升至 5.8%"), "Diff description should accurately show rate hike");
});

test("3. Counter-Pitch Engine across all 4 categories with GL20 Compliance", () => {
  const promos = loadPromos();
  const engine = new CounterPitchEngine(promos);

  // 1. Savings Counter-Pitch
  const savingsRes = engine.generateCounterPitch({
    category: "Savings_MultiCurrency",
    our_product: "友邦 盈御多元貨幣計劃 3",
    competitor_product: "保誠 雋富多元貨幣計劃",
    client_scenario: "客睇緊保誠 5.8% 預繳及 28% 回贈"
  });
  assert.ok(savingsRes.attack_points.length === 3, "Savings pitch should provide 3 tactical points");
  assert.ok(savingsRes.regulatory_guardrail.gl20_compliance_note.includes("GL20"), "Must include GL20 compliance");
  assert.ok(savingsRes.regulatory_guardrail.acknowledged_competitor_advantage.length > 0, "Must acknowledge competitor strength");

  // 2. Critical Illness Counter-Pitch
  const ciRes = engine.generateCounterPitch({
    category: "Critical_Illness",
    our_product: "宏利 守護無間危疾保",
    competitor_product: "富衛 危疾加諾保",
    client_scenario: "客追求高回贈"
  });
  assert.ok(ciRes.attack_points.some(pt => pt.title.includes("癌症索償間隔年期")), "CI pitch should attack cancer waiting interval");

  // 3. VHIS Counter-Pitch
  const vhisRes = engine.generateCounterPitch({
    category: "Medical_VHIS",
    our_product: "尊衛您靈活計劃",
    competitor_product: "Bowtie Pink",
    client_scenario: "客認為網上自願醫保更便宜"
  });
  assert.ok(vhisRes.attack_points.some(pt => pt.title.includes("Agent") || pt.title.includes("中介人")), "VHIS pitch should articulate agent claim value");

  // 4. QDAP Counter-Pitch
  const qdapRes = engine.generateCounterPitch({
    category: "Annuity_QDAP",
    our_product: "萬年延期年金",
    competitor_product: "某同業年金",
    client_scenario: "對比退休年金回報"
  });
  assert.ok(qdapRes.attack_points.some(pt => pt.title.includes("保證回報比例")), "QDAP pitch should emphasize guaranteed IRR ratio");
});

test("4. Morning Briefing & Leader Speech Generator", () => {
  const promos = loadPromos();
  const generator = new MorningBriefingGenerator();
  const briefingData = generator.generateBriefingData(promos);

  // Check 07:45 WhatsApp text
  const text = generator.formatBroadcastText(briefingData);
  assert.ok(text.includes("早會情報速遞"), "Broadcast text should include header");
  assert.ok(text.includes("預繳保證利率 TOP 5"), "Broadcast text should include top 5 rankings");
  assert.ok(text.includes(briefingData.manager_speech_2min.theme), "Broadcast text should include manager speech theme");

  // Check HTML Slide deck rendering
  const html = generator.renderMorningSlidesHtml(briefingData);
  assert.ok(!html.includes("{{DATE}}"), "Date placeholder should be rendered");
  assert.ok(!html.includes("{{FLASH_ALERTS_HTML}}"), "Alerts placeholder should be rendered");
  assert.ok(!html.includes("{{RANKINGS_HTML}}"), "Rankings placeholder should be rendered");
  assert.ok(!html.includes("{{MANAGER_SPEECH}}"), "Speech placeholder should be rendered");
  assert.ok(html.includes("雋富多元貨幣計劃"), "Rankings table should contain actual product name");
});

test("5. Multimodal Extractor Fallback Parser", () => {
  const extractor = new GeminiIntelligenceExtractor();
  const rawText = "友邦 盈御3 推出限時優惠，美元預繳保證利率 5.2% p.a.，首年保費回贈高達 22%，截止日期 2026年11月30日";
  const parsed = extractor.parseOfflinePromoText(rawText);

  assert.strictEqual(parsed.insurer, "AIA");
  assert.strictEqual(parsed.category, "Savings_MultiCurrency");
  assert.strictEqual(parsed.prepayment_scheme?.guaranteed_rate_pct, 5.2);
  assert.strictEqual(parsed.premium_discounts?.[0].discount_rate_pct, 22.0);
});

test("6. Agent 1: Circuit Breaker Anomaly Interceptor & Fallback", () => {
  const promos = loadPromos();
  const diffDetector = new IntelligenceDiffDetector();
  const breaker = diffDetector.getCircuitBreaker();

  // Create an abnormal promo (e.g. 200% discount, 25% prepayment rate)
  const corruptedPromo = JSON.parse(JSON.stringify(promos[0]));
  corruptedPromo.premium_discounts[0].discount_rate_pct = 200; // Anomaly!
  if (corruptedPromo.prepayment_scheme) {
    corruptedPromo.prepayment_scheme.guaranteed_rate_pct = 25.0; // Anomaly!
  }

  const { isValid, anomalies } = breaker.validatePromo(corruptedPromo);
  assert.strictEqual(isValid, false, "Corrupted promo should be rejected");
  assert.ok(anomalies.length >= 1, "Should record anomalies");

  // Sanitize with fallback
  const { sanitized, rejected } = breaker.sanitizeWithFallback([corruptedPromo], promos);
  assert.strictEqual(rejected.length, 1, "Should reject corrupted promo");
  assert.strictEqual(sanitized[0].premium_discounts[0].discount_rate_pct, promos[0].premium_discounts[0].discount_rate_pct, "Should fallback to clean baseline");
});

test("7. Agent 2 & 3: Three-Stage Framework, Tones & HKIA GL20 Guardrail", () => {
  const promos = loadPromos();
  const engine = new CounterPitchEngine(promos);

  // Tone: HK Business English
  const resEng = engine.generateCounterPitch({
    category: "Savings_MultiCurrency",
    our_product: "友邦 盈御多元貨幣計劃 3",
    competitor_product: "保誠 雋富多元貨幣計劃",
    client_scenario: "Client asks about Prudential 5.8% rate",
    tone: "hk_business_english"
  });
  assert.strictEqual(resEng.tone, "hk_business_english");
  assert.ok(resEng.three_stage_framework.stage_1_empathy.includes("catch your eyes"), "Should match English stage 1");
  assert.ok(resEng.three_stage_framework.stage_2_blindspot.includes("fine print"), "Should match English stage 2");
  assert.ok(resEng.three_stage_framework.stage_3_actuarial_checkmate.includes("GN16 official fulfillment ratio"), "Should match English stage 3");

  // Prohibited words filter verification
  const auditResult = HKIAComplianceGuardrail.auditAndSanitize("呢份單保證穩賺零風險，對手一定蝕到跳水，我地全港第一！");
  assert.strictEqual(auditResult.passed, false, "Prohibited terms should be flagged");
  assert.ok(auditResult.warnings.length >= 3, "Should catch multiple prohibited statements");
  assert.ok(!auditResult.sanitizedText.includes("保證穩賺零風險"), "Sanitized text should replace prohibited terms");
  assert.ok(!auditResult.sanitizedText.includes("全港第一"), "Sanitized text should replace '全港第一'");
});

test("8. Agent 7: WhatsApp Markdown & Personalized Poster Synthesizer", () => {
  const promos = loadPromos();
  const generator = new MorningBriefingGenerator();
  const briefing = generator.generateBriefingData(promos);
  const comms = new ViralTeamCommsEngine();

  const stamp = {
    agent_name: "林卓賢 David Lam",
    title: "資深分區總監",
    insurer: "友邦保險 AIA",
    agency_or_team: "宏峰家族",
    license_no: "IA99201928",
    phone_whatsapp: "+852 9876 5432"
  };

  const waText = comms.formatWhatsAppBroadcast(briefing, stamp);
  assert.ok(waText.includes("*【InsurIntel HK 早會市場情報速遞】*"), "Should contain bold header");
  assert.ok(waText.includes("IA99201928"), "Should contain agent license stamp");

  const svg = comms.generatePersonalizedPosterSvg(briefing, stamp);
  assert.ok(svg.includes("<svg"), "Should output valid SVG");
  assert.ok(svg.includes("林卓賢 David Lam"), "Should brand SVG with agent name");
  assert.ok(svg.includes("IA99201928"), "Should brand SVG with license");
});

test("9. Agent 8: Semantic Cache & Dead-Letter Queue (DLQ)", () => {
  const cache = new SemanticCacheEngine();
  const query = "友邦 盈御 vs 保誠 雋富 5.8% 利率";
  const dummyResult = { recommendation: "Attack Year 2 floating rate & GN16 96.5%" };

  cache.set(query, dummyResult, 3600);
  const cached = cache.get<{ recommendation: string }>(query);
  assert.ok(cached, "Cache should hit");
  assert.strictEqual(cached?.recommendation, dummyResult.recommendation);

  const dlq = new DeadLetterQueue();
  const failedTask = dlq.enqueueFailedTask("https://mock-insurer.com/promo", "Connection Timeout (504)");
  assert.strictEqual(failedTask.status, "PENDING");
  assert.ok(dlq.getPendingTasks().length >= 1, "DLQ should register pending task");
});

test("10. Feature F1, F2, F3: Universal Life & Expanded Catalog Dynamic Loader", () => {
  const allPromos = loadAllMockPromos();
  assert.strictEqual(allPromos.length, 31, "Should load all 31 mock products");

  const insurers = new Set(allPromos.map(p => p.insurer));
  assert.strictEqual(insurers.size, 9, "Should cover all 9 Hong Kong insurers");
  const expectedInsurers = ["AIA", "Prudential", "Manulife", "Sun_Life", "FWD", "AXA", "Bowtie", "BOC_Life", "YF_Life"];
  for (const ins of expectedInsurers) {
    assert.ok(insurers.has(ins), `Should cover insurer ${ins}`);
  }

  const savings = loadPromosByCategory("Savings_MultiCurrency");
  assert.strictEqual(savings.length, 8, "Should have 8 savings products");

  const ci = loadPromosByCategory("Critical_Illness");
  assert.strictEqual(ci.length, 7, "Should have 7 critical illness products");

  const vhis = loadPromosByCategory("Medical_VHIS");
  assert.strictEqual(vhis.length, 6, "Should have 6 VHIS products");

  const qdap = loadPromosByCategory("Annuity_QDAP");
  assert.strictEqual(qdap.length, 5, "Should have 5 QDAP products");

  const ul = loadPromosByCategory("Financing_UniversalLife");
  assert.strictEqual(ul.length, 5, "Should have 5 Universal Life products");

  // Verify Universal Life domain metrics schema
  for (const p of ul) {
    assert.ok(p.ul_metrics, `Product ${p.promo_id} must have ul_metrics`);
    assert.ok(p.ul_metrics.crediting_rate_current_pct > 0, "crediting_rate_current_pct > 0");
    assert.ok(p.ul_metrics.crediting_rate_guaranteed_pct > 0, "crediting_rate_guaranteed_pct > 0");
    assert.ok(p.ul_metrics.surrender_charge_years > 0, "surrender_charge_years > 0");
    assert.strictEqual(p.ul_metrics.financing_eligible, true, "financing_eligible is true");
    assert.ok(p.ul_metrics.max_ltv_pct >= 70 && p.ul_metrics.max_ltv_pct <= 90, "max_ltv_pct in range");
    assert.ok(p.ul_metrics.net_carry_spread_pct > 0, "net_carry_spread_pct > 0");
    assert.ok(p.ul_metrics.min_premium_usd >= 300000, "min_premium_usd >= 300000");
  }

  // Verify loadPromosByInsurer
  const aiaPromos = loadPromosByInsurer("AIA");
  assert.strictEqual(aiaPromos.length, 5, "AIA should have 5 products across categories");
  const pruPromos = loadPromosByInsurer("Prudential");
  assert.strictEqual(pruPromos.length, 4, "Prudential should have 4 products across categories");
});

test("11. Feature F4: Multimodal Extractor SDK & Offline Fallback across 9 Insurers & 5 Categories", async () => {
  const extractor = new GeminiIntelligenceExtractor(); // Offline mode (no API key in test runner)

  // 1. Text extraction async fallback without throwing
  const textPromo = await extractor.extractFromText("安盛 盛利多元儲蓄 預繳 5.0% 首年回贈 25%");
  assert.strictEqual(textPromo.insurer, "AXA");
  assert.strictEqual(textPromo.category, "Savings_MultiCurrency");
  assert.strictEqual(textPromo.prepayment_scheme?.guaranteed_rate_pct, 5.0);
  assert.strictEqual(textPromo.premium_discounts[0].discount_rate_pct, 25.0);

  // 2. Image extraction async fallback without throwing
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const imagePromo = await extractor.extractFromImage(dummyBase64, "image/png");
  assert.ok(imagePromo.promo_id.startsWith("EXTRACT-"));
  assert.ok(imagePromo.product_name.length > 0);

  // 3. 9 Insurers Detection via parseOfflinePromoText
  const insurerTests: [string, string][] = [
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
    assert.strictEqual(parsed.insurer, expectedInsurer, `Failed to detect insurer for snippet: ${textSnippet}`);
  }

  // 4. 5 Categories Detection
  const categoryTests: [string, string][] = [
    ["友邦 盈御多元貨幣儲蓄", "Savings_MultiCurrency"],
    ["宏利 守護無間危疾保 癌症多次賠償", "Critical_Illness"],
    ["Bowtie Pink 自願醫保靈活計劃", "Medical_VHIS"],
    ["中銀人壽 延年歲月扣稅年金 QDAP", "Annuity_QDAP"],
    ["萬通 萬葉萬用壽險 保費融資 LTV 85%", "Financing_UniversalLife"]
  ];
  for (const [textSnippet, expectedCat] of categoryTests) {
    const parsed = extractor.parseOfflinePromoText(textSnippet);
    assert.strictEqual(parsed.category, expectedCat, `Failed to detect category for snippet: ${textSnippet}`);
  }

  // 5. Universal Life category detection & ul_metrics population
  const ulSnippet = "萬通 萬葉萬用壽險 保費融資 現行派息率 5.4% 融資成數 85%";
  const ulParsed = extractor.parseOfflinePromoText(ulSnippet);
  assert.strictEqual(ulParsed.insurer, "YF_Life");
  assert.strictEqual(ulParsed.category, "Financing_UniversalLife");
  assert.ok(ulParsed.ul_metrics, "ul_metrics must be defined for Universal Life");
  assert.strictEqual(ulParsed.ul_metrics?.crediting_rate_current_pct, 5.4);
  assert.strictEqual(ulParsed.ul_metrics?.max_ltv_pct, 85.0);
  assert.strictEqual(ulParsed.ul_metrics?.financing_eligible, true);
  assert.strictEqual(ulParsed.ul_metrics?.net_carry_spread_pct, 0.9); // 5.4 - 4.5 = 0.9
});

test("12. Feature F5: Dynamic Comparison Matrix Generation & HTML Injection with UL-only Fallback", () => {
  const promos = loadPromos();
  const generator = new MorningBriefingGenerator();

  // 1. Dynamic Matrix rows generation from catalog
  const rows = generator.computeGrandMatrixRows(promos);
  assert.ok(rows.length >= 5, "Expected at least 5 insurer flagship rows");
  // Check insurer names present
  const insurers = rows.map(r => r.insurer);
  assert.ok(insurers.some(i => i.includes("AIA")), "AIA row present");
  assert.ok(insurers.some(i => i.includes("Prudential")), "Prudential row present");
  assert.ok(insurers.some(i => i.includes("Manulife")), "Manulife row present");

  // Check metrics present in rows
  const aiaRow = rows.find(r => r.insurer.includes("AIA"));
  assert.ok(aiaRow, "AIA row found");
  assert.ok(aiaRow.gn16.includes("96.5%"), "AIA GN16 ratio present");
  assert.ok(aiaRow.prepay.includes("5.00%"), "AIA prepayment rate present");
  assert.ok(aiaRow.breakeven.includes("18") && aiaRow.breakeven.includes("6"), "AIA breakeven years present");

  // 2. Attached to briefing data
  const briefing = generator.generateBriefingData(promos);
  assert.ok(briefing.grand_matrix_rows, "grand_matrix_rows attached to DailyMorningBriefing");
  assert.strictEqual(briefing.grand_matrix_rows.length, rows.length);

  // 3. Fallback on empty or UL-only dataset
  const ulPromos = loadPromosByCategory("Financing_UniversalLife");
  const fallbackRows = generator.computeGrandMatrixRows(ulPromos);
  assert.strictEqual(fallbackRows.length, 5, "Fallback provides 5 default benchmark rows");
  assert.ok(fallbackRows[0].insurer.includes("AIA"));
  assert.ok(fallbackRows[1].insurer.includes("Prudential"));

  // 4. HTML slide rendering replacement
  const html = generator.renderMorningSlidesHtml(briefing);
  assert.ok(html.includes("96.5%"), "Rendered HTML contains GN16 ratio");
  assert.ok(html.includes("盈御多元貨幣計劃 3"), "Rendered HTML contains product name");
});

test("13. Feature F6: Financing Universal Life 3-Stage Tactical Pitch across 3 Tones", () => {
  const promos = loadPromos();
  const engine = new CounterPitchEngine(promos);

  // 1. Cantonese Colloquial
  const resZh = engine.generateCounterPitch({
    category: "Financing_UniversalLife",
    our_product: "友邦 財富尊享萬用壽險",
    competitor_product: "宏利 宏裕傳承萬用壽險",
    client_scenario: "客人正在考慮做 80% LTV 保費融資，問息差套利有咩風險？",
    tone: "cantonese_colloquial"
  });

  assert.ok(resZh.matchup_title.includes("萬用壽險與保費融資對攻"), "Title reflects UL matchup");
  assert.ok(resZh.three_stage_framework.stage_1_empathy.includes("保費融資"), "Stage 1 empathy mentions premium financing");
  assert.ok(resZh.three_stage_framework.stage_2_blindspot.includes("Margin Call"), "Stage 2 attacks margin calls");
  assert.ok(resZh.three_stage_framework.stage_2_blindspot.includes("浮動"), "Stage 2 attacks floating borrowing cost");
  assert.ok(resZh.three_stage_framework.stage_2_blindspot.includes("退保費用"), "Stage 2 attacks surrender charge");
  assert.ok(resZh.three_stage_framework.stage_3_actuarial_checkmate.includes("無槓桿多元貨幣分紅儲蓄險"), "Stage 3 pivots to unleveraged savings");
  assert.strictEqual(resZh.attack_points.length, 3, "Provides 3 attack points");
  assert.strictEqual(resZh.regulatory_guardrail.compliance_audit_passed, true, "Passes GL20 audit");

  // 2. HK Business English
  const resEng = engine.generateCounterPitch({
    category: "Financing_UniversalLife",
    our_product: "AIA Platinum Wealth Universal Life",
    competitor_product: "Manulife ManuGrand Universal Life",
    client_scenario: "Client asks about 85% LTV premium financing yield arbitrage",
    tone: "hk_business_english"
  });

  assert.ok(resEng.three_stage_framework.stage_1_empathy.includes("catch your eyes"), "English stage 1 has catch your eyes");
  assert.ok(resEng.three_stage_framework.stage_2_blindspot.includes("floating funding cost"), "English stage 2 attacks floating funding cost");
  assert.ok(resEng.three_stage_framework.stage_2_blindspot.includes("margin call"), "English stage 2 attacks margin call");
  assert.ok(resEng.three_stage_framework.stage_3_actuarial_checkmate.includes("unleveraged participating multi-currency savings"), "English stage 3 pivots");
  assert.strictEqual(resEng.regulatory_guardrail.compliance_audit_passed, true);

  // 3. Formal Written Chinese
  const resFormal = engine.generateCounterPitch({
    category: "Financing_UniversalLife",
    our_product: "友邦 財富尊享萬用壽險",
    competitor_product: "永明 萬世傳奇萬用壽險",
    client_scenario: "內地訪港客戶詢問私行保費融資套利",
    tone: "formal_written_zh"
  });

  assert.ok(resFormal.three_stage_framework.stage_1_empathy.includes("保費融資"), "Formal stage 1 empathy");
  assert.ok(resFormal.three_stage_framework.stage_2_blindspot.includes("息差倒掛"), "Formal stage 2 spread inversion");
  assert.ok(resFormal.three_stage_framework.stage_2_blindspot.includes("Margin Call"), "Formal stage 2 margin call");
  assert.ok(resFormal.three_stage_framework.stage_3_actuarial_checkmate.includes("無槓桿多元貨幣分紅儲蓄架構"), "Formal stage 3 pivot");
  assert.strictEqual(resFormal.regulatory_guardrail.compliance_audit_passed, true);
});

test("14. Feature F7: Profile-Aware Adaptive Pitch Engine (Budget, Persona, Goal, Age)", () => {
  const promos = loadPromos();
  const engine = new CounterPitchEngine(promos);

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
  assert.ok(profileRes.core_pivot_strategy.includes("預算精算折扣"), "Strategy includes budget discount");
  assert.ok(profileRes.core_pivot_strategy.includes("50,000"), "Strategy reflects $50,000 budget");
  assert.ok(profileRes.core_pivot_strategy.includes("22%"), "Strategy reflects 22% base tier discount");
  assert.ok(profileRes.core_pivot_strategy.includes("14,000"), "Strategy reflects $14,000 calculated savings");
  assert.ok(profileRes.core_pivot_strategy.includes("HighNetWorth_Legacy"), "Strategy incorporates persona");
  assert.ok(profileRes.core_pivot_strategy.includes("Children_Education"), "Strategy incorporates target goal");
  assert.ok(profileRes.core_pivot_strategy.includes("42歲"), "Strategy incorporates age");

  // Test calculateDiscountForBudget edge case: 0 budget
  const aiaGP3 = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency")!;
  const zeroBudgetCalc = engine.calculateDiscountForBudget(aiaGP3, 0);
  assert.strictEqual(zeroBudgetCalc.estimated_savings_usd, 0);

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
  assert.ok(consRes.core_pivot_strategy.includes("Conservative_Income"), "Incorporates Conservative_Income");
  assert.ok(consRes.core_pivot_strategy.includes("Retirement"), "Incorporates Retirement goal");
  assert.ok(consRes.core_pivot_strategy.includes("58歲"), "Incorporates 58 age");
});

test("15. Feature F8: Mobile Café App Interactivity & 54 Battle Combinations", () => {
  const cafePath = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
  assert.ok(fs.existsSync(cafePath), "mobile_cafe_app.html should exist");

  const html = fs.readFileSync(cafePath, "utf-8");

  // Verify interactive state updates
  assert.ok(html.includes("function updateBattleCard()"), "Should define updateBattleCard function");
  assert.ok(!html.includes("// Dynamic reactive updates\n    }"), "updateBattleCard should not be an empty stub");
  assert.ok(html.includes("COMPANY_PROFILES"), "Should contain structured company profiles database");

  // Verify all 9 top HK insurers are present
  const insurers = ["保誠 Prudential", "友邦 AIA", "宏利 Manulife", "永明 Sun Life", "富衛 FWD", "安盛 AXA", "純網上虛擬 Bowtie", "中銀人壽 BOC Life", "萬通 YF Life"];
  for (const ins of insurers) {
    assert.ok(html.includes(ins), `Should contain company pill for ${ins}`);
  }

  // Verify 6 claims are present
  const claims = ["5.8% 預繳", "首年保費回贈 28%", "癌症再次索償等待期", "自願醫保全數賠償", "保費融資 85% LTV", "QDAP 延期年金總回報"];
  for (const clm of claims) {
    assert.ok(html.includes(clm), `Should contain claim pill for ${clm}`);
  }

  // Verify toast feedback and dual views
  assert.ok(html.includes("toast"), "Should contain toast element/class");
  assert.ok(html.includes("agent-view"), "Should support Agent private view");
  assert.ok(html.includes("client-view"), "Should support Client public view");
});

test("16. Feature F9: Agent Branding & Theming Engine across Visual Assets", () => {
  const promos = loadPromos();
  const generator = new MorningBriefingGenerator();
  const briefing = generator.generateBriefingData(promos);
  const comms = new ViralTeamCommsEngine();

  const customBranding: AgentBrandingConfig = {
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
  assert.ok(waText.includes("張天宇 Alex Cheung"), "WhatsApp broadcast reflects agent name");
  assert.ok(waText.includes("IA88392011"), "WhatsApp broadcast reflects license stamp");
  assert.ok(waText.includes("晉領家族 Apex Legacy"), "WhatsApp broadcast reflects team name");

  // SVG Poster
  const posterSvg = comms.generatePersonalizedPosterSvg(briefing, customBranding);
  assert.ok(posterSvg.includes("張天宇 Alex Cheung"), "SVG poster reflects agent name");
  assert.ok(posterSvg.includes("IA88392011"), "SVG poster reflects license");
  assert.ok(posterSvg.includes("#ED1B2E"), "SVG poster reflects custom primary color");
  assert.ok(posterSvg.includes("APEX"), "SVG poster reflects logo text");
  assert.ok(posterSvg.includes("以精算破局"), "SVG poster reflects slogan");

  // HTML Flyer
  const flyerHtml = comms.generatePersonalizedPosterHtml(briefing, customBranding);
  assert.ok(flyerHtml.includes("張天宇 Alex Cheung"), "HTML flyer reflects agent name");
  assert.ok(flyerHtml.includes("#ED1B2E"), "HTML flyer reflects custom color theme");

  // Slide Deck dynamic theming
  const slideHtml = generator.renderMorningSlidesHtml(briefing, undefined, customBranding);
  assert.ok(slideHtml.includes("#ED1B2E"), "Slide deck reflects custom primary accent color in CSS :root");
});

test("17. Feature F10: Robust Swiss Slide Generator Compiler", () => {
  const scriptPath = path.join(process.cwd(), "scripts", "build_swiss_slides.py");
  assert.ok(fs.existsSync(scriptPath), "build_swiss_slides.py should exist");

  const scriptContent = fs.readFileSync(scriptPath, "utf-8");
  // Check that fragile line slicing is removed
  assert.ok(!scriptContent.includes("lines[:1250]"), "Fragile line slicing [:1250] should be eliminated");
  assert.ok(!scriptContent.includes("lines[1338:]"), "Fragile line slicing [1338:] should be eliminated");
  assert.ok(scriptContent.includes("replace("), "Should use semantic token/block replacement");

  // Check generated template
  const outTemplatePath = path.join(process.cwd(), "templates", "morning_slides.html");
  assert.ok(fs.existsSync(outTemplatePath), "Generated morning_slides.html template should exist");
  const slideTemplate = fs.readFileSync(outTemplatePath, "utf-8");
  assert.ok(slideTemplate.includes("{{GRAND_MATRIX_HTML}}"), "Template should preserve dynamic placeholders");
  assert.ok(slideTemplate.includes("window.print()"), "Template should inject PDF print action");
});

test("18. Feature F11: Circuit Breaker HALF_OPEN to CLOSED Self-Healing & Probe Logic", async () => {
  const cb = new IntelligenceCircuitBreaker(2, 50, 2); // failureThreshold=2, resetTimeout=50ms, successThreshold=2
  const ts = new Date().toISOString();

  const normalPromo: InsurancePromoComprehensive = {
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

  const corruptPromo: InsurancePromoComprehensive = {
    ...normalPromo,
    promo_id: "PROMO-CORRUPT",
    premium_discounts: [{ min_annual_premium_usd: 5000, discount_rate_pct: 250 }] // Out of bounds >80%
  };

  // Initially CLOSED
  assert.strictEqual(cb.getState().status, "CLOSED");

  // Trip the breaker: 2 failures
  cb.validatePromo(corruptPromo);
  assert.strictEqual(cb.getState().status, "CLOSED");
  cb.validatePromo(corruptPromo);
  assert.strictEqual(cb.getState().status, "OPEN");
  assert.strictEqual(cb.isTripped(), true);

  // Wait for reset timeout (50ms) -> transitions to HALF_OPEN
  await new Promise(r => setTimeout(r, 60));
  assert.strictEqual(cb.getState().status, "HALF_OPEN");

  // Probe 1: valid promo -> stays HALF_OPEN, consecutive successes = 1
  const p1 = cb.validatePromo(normalPromo);
  assert.strictEqual(p1.isValid, true);
  assert.strictEqual(cb.getState().status, "HALF_OPEN");
  assert.strictEqual(cb.getState().consecutive_successes, 1);

  // Probe 2: valid promo -> reaches successThreshold=2, transitions to CLOSED!
  const p2 = cb.validatePromo(normalPromo);
  assert.strictEqual(p2.isValid, true);
  assert.strictEqual(cb.getState().status, "CLOSED");
  assert.strictEqual(cb.getState().failure_count, 0);

  // Test failure during HALF_OPEN: immediately trips back to OPEN
  cb.trip();
  await new Promise(r => setTimeout(r, 60));
  assert.strictEqual(cb.getState().status, "HALF_OPEN");
  cb.validatePromo(corruptPromo);
  assert.strictEqual(cb.getState().status, "OPEN");
});

test("19. Feature F12: Dead-Letter Queue Retry Worker with Exponential Backoff", async () => {
  const testDlqPath = path.join(process.cwd(), "tmp", ".test_dlq.json");
  if (fs.existsSync(testDlqPath)) fs.unlinkSync(testDlqPath);

  const dlq = new DeadLetterQueue(testDlqPath);
  dlq.clear();

  // Enqueue test task
  const task = dlq.enqueueFailedTask("https://mock.hk/api", "Network 503");
  assert.strictEqual(task.status, "PENDING");
  assert.strictEqual(task.attempt_count, 1);

  // In the future: not due yet (default retry is +60s)
  const immediatelyDue = dlq.getDueTasks(new Date());
  assert.strictEqual(immediatelyDue.length, 0);

  // Simulate due in the future
  const futureTime = new Date(Date.now() + 120000);
  const due = dlq.getDueTasks(futureTime);
  assert.strictEqual(due.length, 1);
  assert.strictEqual(due[0].task_id, task.task_id);

  // Test DLQRetryWorker: Handler fails
  const worker = new DLQRetryWorker(dlq, 1000); // 1s base backoff
  const failResult = await worker.processDueTasks(async () => false, futureTime);
  assert.strictEqual(failResult.processed, 1);
  assert.strictEqual(failResult.failed, 1);

  // Verify task attempt increased and backoff applied
  const updatedTask = dlq.getAllTasks().find(t => t.task_id === task.task_id)!;
  assert.strictEqual(updatedTask.attempt_count, 2);
  assert.strictEqual(updatedTask.status, "PENDING");

  // Attempt 3 (exhaust max_retries = 3) -> should transition to DEAD
  const futureTime2 = new Date(Date.now() + 600000);
  const failResult2 = await worker.processDueTasks(async () => false, futureTime2);
  assert.strictEqual(failResult2.dead, 1);

  const deadTask = dlq.getAllTasks().find(t => t.task_id === task.task_id)!;
  assert.strictEqual(deadTask.status, "DEAD");

  // Test successful resolution
  const task2 = dlq.enqueueFailedTask("https://mock.hk/api2", "Timeout");
  const successResult = await worker.processDueTasks(async () => true, new Date(Date.now() + 120000));
  assert.strictEqual(successResult.resolved, 1);

  const resolvedTask = dlq.getAllTasks().find(t => t.task_id === task2.task_id)!;
  assert.strictEqual(resolvedTask.status, "RESOLVED");

  // Cleanup
  if (fs.existsSync(testDlqPath)) fs.unlinkSync(testDlqPath);
});




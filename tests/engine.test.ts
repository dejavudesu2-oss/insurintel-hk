/**
 * InsurIntel HK - Comprehensive Engine & Pipeline Test Suite
 */

import fs from "fs";
import path from "path";
import assert from "node:assert";
import test from "node:test";
import vm from "node:vm";

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
  assert.ok(allPromos.length >= 40, "Should load 40+ mock products across all 9 HK insurers");
  assert.strictEqual(allPromos.length, 99, "Should load all 99 mock products");

  const insurers = new Set(allPromos.map(p => p.insurer));
  assert.strictEqual(insurers.size, 15, "Should cover all 15 Hong Kong insurers");
  const expectedInsurers = ["AIA", "Prudential", "Manulife", "Sun_Life", "FWD", "AXA", "Bowtie", "BOC_Life", "YF_Life", "Cigna", "Bupa", "HSBC", "Generali", "BlueCross", "ChinaLife"];
  for (const ins of expectedInsurers) {
    assert.ok(insurers.has(ins), `Should cover insurer ${ins}`);
  }

  const savings = loadPromosByCategory("Savings_MultiCurrency");
  assert.strictEqual(savings.length, 20, "Should have 20 savings products");

  const ci = loadPromosByCategory("Critical_Illness");
  assert.strictEqual(ci.length, 20, "Should have 20 critical illness products");

  const vhis = loadPromosByCategory("Medical_VHIS");
  assert.strictEqual(vhis.length, 20, "Should have 20 VHIS products");

  const qdap = loadPromosByCategory("Annuity_QDAP");
  assert.strictEqual(qdap.length, 19, "Should have 19 QDAP products");

  const ul = loadPromosByCategory("Financing_UniversalLife");
  assert.strictEqual(ul.length, 20, "Should have 20 Universal Life products");

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
  assert.strictEqual(aiaPromos.length, 11, "AIA should have 11 products across categories");
  const pruPromos = loadPromosByInsurer("Prudential");
  assert.strictEqual(pruPromos.length, 10, "Prudential should have 10 products across categories");
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

test("20. Feature F13: Default Root Landing Page & Dual-App Navigation", async () => {
  const cafeSource = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
  const slidesSource = path.join(process.cwd(), "templates", "morning_slides.html");
  
  assert.ok(fs.existsSync(cafeSource), "mobile_cafe_app.html must exist in templates/");
  assert.ok(fs.existsSync(slidesSource), "morning_slides.html must exist in templates/");

  const cafeHtml = fs.readFileSync(cafeSource, "utf-8");
  assert.ok(cafeHtml.includes("morning_slides.html"), "Mobile cafe app header must link to morning_slides.html");
  assert.ok(cafeHtml.includes("top-nav-slides-btn"), "Mobile cafe app header must include top-nav-slides-btn class");
  assert.ok(cafeHtml.includes("晨會投影片"), "Mobile cafe app button must display 晨會投影片");

  const slidesHtml = fs.readFileSync(slidesSource, "utf-8");
  assert.ok(slidesHtml.includes("index.html"), "Morning slides must link back to index.html");
  assert.ok(slidesHtml.includes("top-nav-battlecard-btn"), "Morning slides must include top-nav-battlecard-btn class");
  assert.ok(slidesHtml.includes("見客攻防卡"), "Morning slides button must display 見客攻防卡");
  assert.ok(slidesHtml.includes("ppt-hint-link"), "Morning slides toolbar must include ppt-hint-link shortcut");
  assert.ok(slidesHtml.includes("body.ppt-presenter .top-nav-battlecard-btn"), "Morning slides must hide button in presenter mode");

  // Verify daily runner generates dist files correctly
  const { DailyIntelligenceRunner } = await import("../src/scheduler/daily_runner.js");
  const runner = new DailyIntelligenceRunner();
  await runner.executeDailyCycle();

  const distIndex = path.join(process.cwd(), "dist", "index.html");
  const distCafe = path.join(process.cwd(), "dist", "cafe.html");
  const distSlides = path.join(process.cwd(), "dist", "morning_slides.html");

  assert.ok(fs.existsSync(distIndex), "dist/index.html must exist");
  assert.ok(fs.existsSync(distCafe), "dist/cafe.html must exist");
  assert.ok(fs.existsSync(distSlides), "dist/morning_slides.html must exist");

  const indexContent = fs.readFileSync(distIndex, "utf-8");
  assert.ok(indexContent.includes("INSURINTEL · 14:00 見客極速攻防卡"), "dist/index.html must be the mobile cafe app");
  assert.ok(indexContent.includes("morning_slides.html"), "dist/index.html must contain link to morning_slides.html");

  const cafeContent = fs.readFileSync(distCafe, "utf-8");
  assert.strictEqual(cafeContent, indexContent, "dist/cafe.html must be an identical alias of dist/index.html");

  const slidesContent = fs.readFileSync(distSlides, "utf-8");
  assert.ok(slidesContent.includes("index.html"), "dist/morning_slides.html must link to index.html");
});

test("21. Feature F14: Zero-Blank Battle Cards across All 54 Insurer x Claim Combinations", () => {
  const cafePath = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
  const html = fs.readFileSync(cafePath, "utf-8");
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, "mobile_cafe_app.html must contain a <script> block");

  const sandbox: any = {
    document: {
      getElementById: () => null,
      querySelectorAll: () => []
    },
    navigator: {},
    console,
    addEventListener: () => {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(scriptMatch[1], sandbox);

  assert.strictEqual(typeof sandbox.getBattleCard, "function", "getBattleCard must be defined in sandbox");
  assert.strictEqual(typeof sandbox.COMPANY_PROFILES, "object", "COMPANY_PROFILES must be defined in sandbox");

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
      assert.ok(card, `Battle card for [${ins}] x [${clm}] must exist`);

      // 1. Text validations
      assert.ok(card.agent_title && card.agent_title.length > 5, `[${ins}] x [${clm}] agent_title must be valid`);
      assert.ok(card.agent_step_1 && card.agent_step_1.length > 5, `[${ins}] x [${clm}] agent_step_1 must be valid`);
      assert.ok(card.agent_step_2 && card.agent_step_2.length > 5, `[${ins}] x [${clm}] agent_step_2 must be valid`);
      assert.ok(card.agent_step_3 && card.agent_step_3.length > 5, `[${ins}] x [${clm}] agent_step_3 must be valid`);
      assert.ok(card.client_title && card.client_title.length > 5, `[${ins}] x [${clm}] client_title must be valid`);
      assert.ok(card.client_source && card.client_source.length > 3, `[${ins}] x [${clm}] client_source must be valid`);
      assert.ok(card.client_desc && card.client_desc.length > 5, `[${ins}] x [${clm}] client_desc must be valid`);
      assert.ok(card.whatsapp_script && card.whatsapp_script.length > 10, `[${ins}] x [${clm}] whatsapp_script must be valid`);
      assert.ok(card.disclaimer && card.disclaimer.length > 10, `[${ins}] x [${clm}] disclaimer must be valid`);

      // 2. Disallow forbidden strings
      const jsonStr = JSON.stringify(card);
      assert.ok(!jsonStr.includes("undefined"), `[${ins}] x [${clm}] must not contain 'undefined'`);
      assert.ok(!jsonStr.includes("null"), `[${ins}] x [${clm}] must not contain 'null'`);
      assert.ok(!jsonStr.includes("NaN"), `[${ins}] x [${clm}] must not contain 'NaN'`);
      assert.ok(!jsonStr.includes("（純網上"), `[${ins}] x [${clm}] must not contain raw placeholder '（純網上'`);
      assert.ok(!jsonStr.includes("（無專屬"), `[${ins}] x [${clm}] must not contain raw placeholder '（無專屬'`);

      // 3. Chart Bars validation
      assert.ok(Array.isArray(card.chart_bars) && card.chart_bars.length >= 2, `[${ins}] x [${clm}] chart_bars >= 2`);
      for (const bar of card.chart_bars) {
        assert.ok(bar.label && bar.label.length > 0, `Bar label must be non-empty in [${ins}] x [${clm}]`);
        assert.ok(bar.value && bar.value.length > 0, `Bar value must be non-empty in [${ins}] x [${clm}]`);
        assert.ok(typeof bar.widthPct === "number" && !Number.isNaN(bar.widthPct), `Bar widthPct must be number in [${ins}] x [${clm}]`);
        assert.ok(bar.widthPct > 0 && bar.widthPct <= 100, `Bar widthPct must be between 1 and 100 in [${ins}] x [${clm}]`);
        assert.ok(bar.color && bar.color.length > 0, `Bar color must be specified in [${ins}] x [${clm}]`);
      }

      // 4. Table Rows validation
      assert.ok(Array.isArray(card.table_rows) && card.table_rows.length >= 3, `[${ins}] x [${clm}] table_rows >= 3`);
      for (const row of card.table_rows) {
        assert.ok(row.label && row.label.length > 0, `Row label must be non-empty in [${ins}] x [${clm}]`);
        assert.ok(row.value && row.value.length > 0, `Row value must be non-empty in [${ins}] x [${clm}]`);
      }

      // 5. Bowtie Tailored Boundary Logic checks
      if (ins.includes("Bowtie")) {
        if (clm.includes("預繳")) {
          assert.ok(card.agent_step_2.includes("未設有具備複利分紅"), "Bowtie + prepayment must articulate pure protection vs par savings");
          assert.ok(!card.agent_step_3.includes("88%"), "Bowtie + prepayment must not assert fake 88% fulfillment ratio");
        }
        if (clm.includes("融資")) {
          assert.ok(card.agent_step_2.includes("未設有任何針對虛擬保單的保費融資通道"), "Bowtie + UL must explain virtual boundary");
        }
        if (clm.includes("年金")) {
          assert.ok(card.agent_step_2.includes("未獲批發行任何可享每年 HK$60,000 薪俸稅免稅額的 QDAP"), "Bowtie + QDAP must explain lack of IA-approved QDAP");
        }
        if (clm.includes("自願醫保")) {
          assert.ok(card.agent_step_2.includes("自主線上申報") || card.agent_step_2.includes("Chatbot") || card.agent_step_3.includes("出院免找數"), "Bowtie + VHIS must contrast cashless vs self-reimbursement");
        }
      } else {
        // Traditional insurers + VHIS: Must NOT say "純線上保險只有 Chatbot 同 Email"
        if (clm.includes("自願醫保")) {
          assert.ok(!card.agent_step_2.includes("純線上保險只有 Chatbot 同 Email"), `Traditional insurer [${ins}] + VHIS must NOT say pure online chatbot`);
          assert.ok(card.agent_step_3.includes("出院免找數"), `Traditional insurer [${ins}] + VHIS must highlight cashless direct billing`);
        }
      }
    }
  }

  assert.strictEqual(testedCount, 54, "Must have tested exactly 54 insurer x claim combinations");

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
      assert.ok(card, `Battle card for [${ins}] x canonical key [${cDef.key}] must exist`);
      const matched = cDef.expected.some(kw => card.agent_title.includes(kw));
      assert.ok(
        matched,
        `Direct call getBattleCard('${ins}', '${cDef.key}') failed to resolve claim. Title was: ${card.agent_title}`
      );
      if (cDef.key !== "prepayment") {
        if (!ins.includes("Bowtie")) {
          assert.ok(!card.agent_title.includes("5.8% 預繳"), `Key '${cDef.key}' wrongly fell back to prepayment for ${ins}`);
        } else {
          assert.ok(!card.agent_title.includes("業務邊界與傳統旗艦儲蓄傳承價值"), `Key '${cDef.key}' wrongly fell back to Bowtie prepayment card`);
        }
      }
    }
  }
});

test("22. Feature F15: Interactive DOM Pill Switching & Event Loop across All 54 Insurer x Claim Combinations", () => {
  const cafePath = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
  const html = fs.readFileSync(cafePath, "utf-8");
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, "mobile_cafe_app.html must contain a <script> block");

  const domElements: Record<string, any> = {};
  const makeMockElement = (id: string, tagName: string = "div") => ({
    id,
    tagName: tagName.toUpperCase(),
    innerHTML: "",
    innerText: "",
    value: "",
    select: () => {},
    style: { display: "block", opacity: "1" } as Record<string, string>,
    className: "",
    classList: {
      classes: new Set<string>(),
      add(c: string) { this.classes.add(c); },
      remove(c: string) { this.classes.delete(c); },
      toggle(c: string, force?: boolean) {
        if (force === true) this.classes.add(c);
        else if (force === false) this.classes.delete(c);
        else if (this.classes.has(c)) this.classes.delete(c);
        else this.classes.add(c);
      },
      contains(c: string) { return this.classes.has(c); }
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

  const makePill = (text: string) => {
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

  const sandbox: any = {
    document: {
      getElementById: (id: string) => domElements[id] || null,
      querySelectorAll: (sel: string) => {
        if (sel === "#company-pills .thumb-pill") return companyPills;
        if (sel === "#claim-pills .thumb-pill") return claimPills;
        return [];
      },
      createElement: (tag: string) => makeMockElement("", tag),
      body: { appendChild: () => {}, removeChild: () => {} },
      execCommand: () => true
    },
    navigator: { clipboard: { writeText: async () => {} } },
    console,
    clearTimeout: (t: any) => clearTimeout(t),
    setTimeout: (fn: any, ms: number) => setTimeout(fn, ms),
    alert: () => {},
    addEventListener: () => {}
  };
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(scriptMatch[1], sandbox);

  // 1. Verify global functions and window exposure
  assert.strictEqual(typeof sandbox.selectCompany, "function", "selectCompany must be defined");
  assert.strictEqual(typeof sandbox.selectClaim, "function", "selectClaim must be defined");
  assert.strictEqual(typeof sandbox.updateBattleCard, "function", "updateBattleCard must be defined");
  assert.strictEqual(typeof sandbox.switchView, "function", "switchView must be defined");
  assert.ok(
    typeof sandbox.setViewMode === "function" || typeof sandbox.window.setViewMode === "function",
    "setViewMode must be exposed on window"
  );

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
    assert.ok(compPill.classList.contains("active"), `Company pill ${compPill.innerText} must have active class`);

    for (let kIdx = 0; kIdx < claimDefinitions.length; kIdx++) {
      const claimDef = claimDefinitions[kIdx];
      const claimPill = claimPills[kIdx];

      // Simulate user clicking claim pill
      sandbox.selectClaim(claimPill, claimPill.innerText);
      switchCount++;

      // Verify pill active class
      assert.ok(claimPill.classList.contains("active"), `Claim pill ${claimDef.label} must have active class`);

      // Verify DOM updates
      const titleHtml = domElements["agent-title"].innerHTML;
      assert.ok(titleHtml.length > 5, `agent-title must be populated for ${compPill.innerText} x ${claimDef.label}`);

      // Critical Anti-Freeze Assertion: Non-prepayment claims MUST NOT render prepayment copy
      if (claimDef.key !== "prepayment") {
        const isBowtie = compPill.innerText.includes("Bowtie");
        if (!isBowtie) {
          assert.ok(
            !titleHtml.includes("5.8% 預繳"),
            `UI FREEZE BUG: [${compPill.innerText}] x [${claimDef.label}] stayed on 5.8% 預繳! Got: ${titleHtml}`
          );
          assert.ok(
            !titleHtml.includes("浮動陷阱"),
            `UI FREEZE BUG: [${compPill.innerText}] x [${claimDef.label}] stayed on 浮動陷阱! Got: ${titleHtml}`
          );
        } else {
          assert.ok(
            !titleHtml.includes("業務邊界與傳統旗艦儲蓄傳承價值"),
            `UI FREEZE BUG: Bowtie x [${claimDef.label}] stayed on Bowtie prepayment card! Got: ${titleHtml}`
          );
        }
      }

      // Assert expected content keywords are present
      const matched = claimDef.keywords.some((kw: string) => titleHtml.includes(kw));
      assert.ok(
        matched,
        `agent-title for [${compPill.innerText}] x [${claimDef.label}] must contain one of [${claimDef.keywords.join(", ")}]. Got: ${titleHtml}`
      );

      // Verify other required DOM elements are reactive
      assert.ok(domElements["agent-step-1"].innerHTML.length > 0, "agent-step-1 must be populated");
      assert.ok(domElements["agent-step-2"].innerHTML.length > 0, "agent-step-2 must be populated");
      assert.ok(domElements["agent-step-3"].innerHTML.length > 0, "agent-step-3 must be populated");
      assert.ok(domElements["client-title"].innerHTML.length > 0, "client-title must be populated");
      assert.ok(domElements["client-chart-bars"].innerHTML.includes("chart-bar-fill"), "chart-bars must render bars");
      assert.ok(!domElements["client-chart-bars"].innerHTML.includes("NaN%"), "chart-bars must not have NaN%");
      assert.ok(domElements["client-table"].innerHTML.includes("<tr"), "table must render rows");
    }
  }

  assert.strictEqual(switchCount, 54, "Must have interactively switched all 54 pairs in the DOM");

  // 2. Test canonical string overload for selectClaim
  for (const claimDef of claimDefinitions) {
    sandbox.selectClaim(claimDef.key);
    const title = domElements["agent-title"].innerHTML;
    const matched = claimDef.keywords.some((kw: string) => title.includes(kw));
    assert.ok(matched, `selectClaim('${claimDef.key}') must update title. Got: ${title}`);
  }

  // 3. Test dual-perspective view toggle
  sandbox.switchView("client");
  assert.strictEqual(domElements["agent-view"].style.display, "none", "agent-view display must be none in client mode");
  assert.strictEqual(domElements["client-view"].style.display, "block", "client-view display must be block in client mode");

  sandbox.switchView("agent");
  assert.strictEqual(domElements["agent-view"].style.display, "block", "agent-view display must be block in agent mode");
  assert.strictEqual(domElements["client-view"].style.display, "none", "client-view display must be none in agent mode");

  // 4. Test WhatsApp clipboard copy and toast
  delete sandbox.navigator.clipboard;
  sandbox.copyWhatsAppPitch();
  assert.strictEqual(domElements["toast"].style.display, "block", "Toast must display on copy");
  assert.ok(domElements["toast"].innerText.includes("WhatsApp"), "Toast text must mention WhatsApp");
});

test("23. Feature F16: Stance-Aware Bilateral Counter-Pitch Engine & Direct 1v1 Product Comparison", () => {
  const promos = loadPromos();
  const engine = new CounterPitchEngine(promos);

  const aiaSavings = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
  const pruSavings = promos.find(p => p.insurer === "Prudential" && p.category === "Savings_MultiCurrency");

  assert.ok(aiaSavings, "AIA Savings promo must exist");
  assert.ok(pruSavings, "Prudential Savings promo must exist");

  // 1. Bilateral Test: AIA as Our Company vs Prudential as Rival (Higher GN16 stance)
  const aiaVsPru = engine.generateBilateralCounterPitch(aiaSavings!, pruSavings!, "cantonese_colloquial");
  assert.ok(aiaVsPru, "AIA vs Pru counter pitch must generate");
  assert.strictEqual(aiaVsPru.regulatory_guardrail.compliance_audit_passed, true, "AIA vs Pru counter pitch must pass GL20 compliance");
  assert.ok(
    aiaVsPru.three_stage_framework.stage_3_actuarial_checkmate.includes("GN16") ||
    aiaVsPru.three_stage_framework.stage_3_actuarial_checkmate.includes("96.5%"),
    "AIA vs Pru stage 3 must focus on GN16 fulfillment ratio advantage"
  );

  // 2. Bilateral Test: Prudential as Our Company vs AIA as Rival (Lower GN16, higher upfront cash yield stance)
  const pruVsAia = engine.generateBilateralCounterPitch(pruSavings!, aiaSavings!, "cantonese_colloquial");
  assert.ok(pruVsAia, "Pru vs AIA counter pitch must generate");
  assert.strictEqual(pruVsAia.regulatory_guardrail.compliance_audit_passed, true, "Pru vs AIA counter pitch must pass GL20 compliance");
  assert.ok(
    pruVsAia.three_stage_framework.stage_3_actuarial_checkmate.includes("實時落袋確定性") ||
    pruVsAia.three_stage_framework.stage_3_actuarial_checkmate.includes("落袋收益") ||
    pruVsAia.three_stage_framework.stage_3_actuarial_checkmate.includes("首年提供最高保費回贈"),
    "Pru vs AIA stage 3 must focus on upfront cash rebate and certainty"
  );

  // 3. Test Bilateral Specs in Mobile Cafe App script
  const cafePath = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
  const html = fs.readFileSync(cafePath, "utf-8");
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, "mobile_cafe_app.html must contain a <script> block");

  const sandbox: any = {
    document: {
      getElementById: () => null,
      querySelectorAll: () => []
    },
    navigator: {},
    console,
    addEventListener: () => {}
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(scriptMatch[1], sandbox);

  assert.strictEqual(typeof sandbox.getBattleCard, "function", "getBattleCard must be defined");

  // 3-arg bilateral call: (ourCompany, rivalCompany, claimKey)
  const cardAiaVsPru = sandbox.getBattleCard("AIA", "Prudential", "prepayment");
  assert.ok(cardAiaVsPru.bilateral_specs, "bilateral_specs must exist in battle card");
  assert.strictEqual(cardAiaVsPru.bilateral_specs.length, 6, "Must contain exactly 6 core bilateral metrics");

  const gn16RowA = cardAiaVsPru.bilateral_specs.find((r: any) => r.label === "GN16 實現率");
  assert.ok(gn16RowA, "Must contain GN16 metric");
  assert.strictEqual(gn16RowA.winner, "our", "AIA should be winner for GN16 against Prudential");

  // Swap roles: Prudential as ourCompany vs AIA as rival
  const cardPruVsAia = sandbox.getBattleCard("Prudential", "AIA", "prepayment");
  assert.ok(cardPruVsAia.bilateral_specs, "bilateral_specs must exist in swapped battle card");

  const rebateRowP = cardPruVsAia.bilateral_specs.find((r: any) => r.label === "首年保費回贈");
  assert.ok(rebateRowP, "Must contain Rebate metric");
  assert.strictEqual(rebateRowP.winner, "our", "Prudential should be winner for Rebate against AIA (28% vs 22%)");

  const prepayRowP = cardPruVsAia.bilateral_specs.find((r: any) => r.label === "預繳保證利率");
  assert.ok(prepayRowP, "Must contain Prepayment metric");
  assert.strictEqual(prepayRowP.winner, "our", "Prudential should be winner for Prepayment against AIA (5.8% vs 5.0%)");
});







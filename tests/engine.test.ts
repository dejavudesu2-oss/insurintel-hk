/**
 * InsurIntel HK - Comprehensive Engine & Pipeline Test Suite
 */

import fs from "fs";
import path from "path";
import assert from "node:assert";
import test from "node:test";

import { IntelligenceDiffDetector } from "../src/engine/diff_detector.js";
import { CounterPitchEngine } from "../src/engine/counter_pitch.js";
import { MorningBriefingGenerator } from "../src/engine/briefing_generator.js";
import { GeminiIntelligenceExtractor } from "../src/extractor/gemini_pipeline.js";
import { InsurancePromoComprehensive } from "../src/types/insurance.js";

function loadPromos(): InsurancePromoComprehensive[] {
  const mockDir = path.join(process.cwd(), "src", "mock_data");
  const files = ["savings_aia_pru.json", "ci_manulife_fwd.json", "vhis_qdap_sample.json"];
  let all: InsurancePromoComprehensive[] = [];
  for (const f of files) {
    const p = path.join(mockDir, f);
    if (fs.existsSync(p)) {
      all = all.concat(JSON.parse(fs.readFileSync(p, "utf-8")));
    }
  }
  return all;
}

test("1. Data Models & Mock Datasets Integrity", () => {
  const promos = loadPromos();
  assert.ok(promos.length >= 6, "Expected at least 6 mock products across categories");

  const categories = new Set(promos.map(p => p.category));
  assert.ok(categories.has("Savings_MultiCurrency"), "Missing Savings category");
  assert.ok(categories.has("Critical_Illness"), "Missing CI category");
  assert.ok(categories.has("Medical_VHIS"), "Missing VHIS category");
  assert.ok(categories.has("Annuity_QDAP"), "Missing QDAP category");

  // Validate Savings specific metrics
  const aiaSavings = promos.find(p => p.insurer === "AIA" && p.category === "Savings_MultiCurrency");
  assert.ok(aiaSavings, "AIA Savings not found");
  assert.ok(aiaSavings.savings_metrics?.gn16_fulfillment_ratio_pct! > 90, "GN16 fulfillment ratio should be valid");
  assert.ok(aiaSavings.premium_discounts.length >= 3, "Tiered discounts should have multiple tiers");
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

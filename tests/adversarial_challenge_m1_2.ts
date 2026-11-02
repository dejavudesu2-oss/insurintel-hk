/**
 * Adversarial Challenger M1_2 - Empirical Stress Harness
 * 
 * Verifies:
 * 1. Feature F1 & F2 Universal Life Domain Consistency:
 *    - All 5 Universal Life products in src/mock_data/universal_life.json:
 *      * crediting_rate_current_pct > crediting_rate_guaranteed_pct
 *      * net_carry_spread_pct === crediting_rate_current_pct - typical_funding_cost_pct (+/- 0.05%)
 *      * LTV ranges between 70% and 90%
 *      * min_premium_usd >= 100000
 *      * Domain field completeness and integrity
 * 2. Downstream Engine Compatibility across all 31 products:
 *    - CounterPitchEngine (KB indexing, all 31 products, UL category queries, tone switching)
 *    - MorningBriefingGenerator (data generation, broadcast formatting, slide HTML rendering, UL-only dataset fallback)
 *    - IntelligenceDiffDetector & CircuitBreaker (anomaly validation of all 31 products, self-diff, empty baseline, delta triggers)
 */

import fs from "fs";
import path from "path";
import assert from "node:assert";

import { loadAllMockPromos, loadPromosByCategory } from "../src/mock_data/loader.js";
import { CounterPitchEngine, HKIAComplianceGuardrail } from "../src/engine/counter_pitch.js";
import { MorningBriefingGenerator } from "../src/engine/briefing_generator.js";
import { IntelligenceDiffDetector, IntelligenceCircuitBreaker } from "../src/engine/diff_detector.js";
import { InsurancePromoComprehensive, PitchTone } from "../src/types/insurance.js";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function record(suite: string, test: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, test, passed: true });
    console.log(`[PASS] ${suite} -> ${test}`);
  } catch (err: any) {
    results.push({ suite, test, passed: false, error: err.message, details: err.stack });
    console.error(`[FAIL] ${suite} -> ${test}: ${err.message}`);
  }
}

console.log("================================================================================");
console.log("STARTING EMPIRICAL ADVERSARIAL CHALLENGE - CHALLENGER M1_2");
console.log("================================================================================");

// ============================================================================
// SUITE 1: Universal Life Domain Consistency (src/mock_data/universal_life.json)
// ============================================================================
const ulFilePath = path.join(process.cwd(), "src", "mock_data", "universal_life.json");
const rawUl = JSON.parse(fs.readFileSync(ulFilePath, "utf-8"));

record("Suite 1: UL File", "File exists and contains 8 UL products (expanded catalog)", () => {
  assert.ok(Array.isArray(rawUl), "universal_life.json must be an array");
  assert.strictEqual(rawUl.length, 8, `Expected 8 UL products, found ${rawUl.length}`);
});

rawUl.forEach((ulProduct: any, idx: number) => {
  const pid = ulProduct.promo_id || `product_${idx}`;

  record(`Suite 1: UL Product [${pid}]`, "UL Metrics existence and type sanity", () => {
    assert.ok(ulProduct.ul_metrics, `${pid} must contain ul_metrics`);
    assert.strictEqual(ulProduct.category, "Financing_UniversalLife", `${pid} category must be Financing_UniversalLife`);
    assert.strictEqual(typeof ulProduct.ul_metrics.crediting_rate_current_pct, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.crediting_rate_guaranteed_pct, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.typical_funding_cost_pct, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.net_carry_spread_pct, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.max_ltv_pct, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.min_premium_usd, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.surrender_charge_years, "number");
    assert.strictEqual(typeof ulProduct.ul_metrics.policy_loan_interest_pct, "number");
    assert.strictEqual(ulProduct.ul_metrics.financing_eligible, true, "financing_eligible must be true");
  });

  record(`Suite 1: UL Product [${pid}]`, "crediting_rate_current_pct > crediting_rate_guaranteed_pct", () => {
    const { crediting_rate_current_pct, crediting_rate_guaranteed_pct } = ulProduct.ul_metrics;
    assert.ok(
      crediting_rate_current_pct > crediting_rate_guaranteed_pct,
      `Expected current rate (${crediting_rate_current_pct}%) > guaranteed rate (${crediting_rate_guaranteed_pct}%)`
    );
  });

  record(`Suite 1: UL Product [${pid}]`, "net_carry_spread_pct === crediting_rate_current_pct - typical_funding_cost_pct (+/- 0.05%)", () => {
    const { crediting_rate_current_pct, typical_funding_cost_pct, net_carry_spread_pct } = ulProduct.ul_metrics;
    const computedSpread = crediting_rate_current_pct - typical_funding_cost_pct;
    const diff = Math.abs(computedSpread - net_carry_spread_pct);
    assert.ok(
      diff <= 0.05001,
      `Actuarial net carry spread mismatch in ${pid}: computed (${crediting_rate_current_pct} - ${typical_funding_cost_pct} = ${computedSpread.toFixed(3)}) vs recorded (${net_carry_spread_pct}), diff: ${diff}`
    );
  });

  record(`Suite 1: UL Product [${pid}]`, "max_ltv_pct in commercial range (70% - 90%)", () => {
    const { max_ltv_pct } = ulProduct.ul_metrics;
    assert.ok(
      max_ltv_pct >= 70 && max_ltv_pct <= 90,
      `Expected max_ltv_pct between 70% and 90%, received: ${max_ltv_pct}%`
    );
  });

  record(`Suite 1: UL Product [${pid}]`, "min_premium_usd >= 100000", () => {
    const { min_premium_usd } = ulProduct.ul_metrics;
    assert.ok(
      min_premium_usd >= 100000,
      `Expected min_premium_usd >= 100,000 USD, received: ${min_premium_usd}`
    );
  });

  record(`Suite 1: UL Product [${pid}]`, "Margin call buffer and surrender charge sanity", () => {
    const m = ulProduct.ul_metrics;
    assert.ok(m.surrender_charge_years >= 1 && m.surrender_charge_years <= 15, "surrender_charge_years between 1 and 15");
    if (m.margin_call_drop_buffer_pct !== undefined) {
      assert.ok(
        m.margin_call_drop_buffer_pct >= 5 && m.margin_call_drop_buffer_pct <= 50,
        "margin_call_drop_buffer_pct between 5% and 50%"
      );
    }
    assert.ok(
      m.policy_loan_interest_pct >= 2.0 && m.policy_loan_interest_pct <= 12.0,
      "policy_loan_interest_pct reasonable"
    );
  });

  record(`Suite 1: UL Product [${pid}]`, "Currency and payment period commercial conventions", () => {
    assert.ok(ulProduct.currency_supported.includes("USD"), "UL financing products must support USD");
    assert.ok(
      ulProduct.payment_period_years.includes(1) || ulProduct.payment_period_years.includes(2),
      "UL financing should support single premium or short payment"
    );
  });
});

// ============================================================================
// SUITE 2: Full 31-Product Catalog Loader & Distribution
// ============================================================================
const allPromos = loadAllMockPromos();

record("Suite 2: Catalog Loader", "Loads exactly 42 products with 9 insurers and 5 categories", () => {
  assert.strictEqual(allPromos.length, 42, `Catalog must have 42 products, got ${allPromos.length}`);
  const insurers = new Set(allPromos.map(p => p.insurer));
  assert.strictEqual(insurers.size, 9, `Catalog must have 9 insurers, got ${insurers.size}`);
  const categories = new Set(allPromos.map(p => p.category));
  assert.strictEqual(categories.size, 5, `Catalog must have 5 categories, got ${categories.size}`);

  // Check unique promo_ids
  const ids = new Set<string>();
  for (const p of allPromos) {
    assert.ok(!ids.has(p.promo_id), `Duplicate promo_id detected: ${p.promo_id}`);
    ids.add(p.promo_id);
  }
});

// ============================================================================
// SUITE 3: Downstream Compatibility - CounterPitchEngine
// ============================================================================
record("Suite 3: CounterPitchEngine", "Instantiation and KB indexing across all 31 products", () => {
  const engine = new CounterPitchEngine(allPromos);
  assert.ok(engine, "Engine instantiated");

  // Verify internal KB indexed all products
  const kb = (engine as any).promoKnowledgeBase;
  assert.ok(kb instanceof Map, "promoKnowledgeBase must be a Map");
  for (const p of allPromos) {
    assert.ok(kb.has(p.promo_id), `KB missing promo_id: ${p.promo_id}`);
    assert.ok(kb.has(p.product_name.toLowerCase()), `KB missing product_name: ${p.product_name}`);
    for (const alias of p.product_aliases || []) {
      assert.ok(kb.has(alias.toLowerCase()), `KB missing alias: ${alias}`);
    }
  }
});

record("Suite 3: CounterPitchEngine", "Generate counter pitch for each of 31 products without crash", () => {
  const engine = new CounterPitchEngine(allPromos);
  const tones: PitchTone[] = ["cantonese_colloquial", "hk_business_english", "formal_written_zh"];

  for (const p of allPromos) {
    for (const tone of tones) {
      const res = engine.generateCounterPitch({
        category: p.category,
        our_product: p.product_name,
        competitor_product: "競品參考方案",
        client_scenario: "客戶正在考慮多個市場同類產品進行綜合對比",
        tone
      });

      assert.ok(res, `Result should exist for ${p.promo_id} with tone ${tone}`);
      assert.ok(res.three_stage_framework.stage_1_empathy.length > 0, "stage 1 has text");
      assert.ok(res.three_stage_framework.stage_2_blindspot.length > 0, "stage 2 has text");
      assert.ok(res.three_stage_framework.stage_3_actuarial_checkmate.length > 0, "stage 3 has text");
      assert.ok(res.attack_points.length >= 2, "attack points >= 2");
      assert.strictEqual(res.regulatory_guardrail.compliance_audit_passed, true, "compliance passed");
      assert.ok(res.regulatory_guardrail.official_disclaimer.includes("GL20"), "official disclaimer includes GL20");
    }
  }
});

record("Suite 3: CounterPitchEngine", "UL Category handling in CounterPitchEngine (fallback to default safely)", () => {
  const engine = new CounterPitchEngine(allPromos);
  const ulPromos = loadPromosByCategory("Financing_UniversalLife");
  assert.strictEqual(ulPromos.length, 8);

  for (const ul of ulPromos) {
    const res = engine.generateCounterPitch({
      category: "Financing_UniversalLife",
      our_product: ul.product_name,
      competitor_product: "競品大額保費融資方案",
      client_scenario: "客戶關注高槓桿保費融資與息差套利",
      tone: "cantonese_colloquial"
    });

    assert.ok(res, "UL pitch generated via default handler");
    assert.ok(res.matchup_title.includes(ul.product_name), "Title contains product name");
    assert.strictEqual(res.regulatory_guardrail.compliance_audit_passed, true);
  }
});

// ============================================================================
// SUITE 4: Downstream Compatibility - MorningBriefingGenerator
// ============================================================================
record("Suite 4: MorningBriefingGenerator", "Data generation, broadcast formatting, and slide HTML rendering", () => {
  const generator = new MorningBriefingGenerator();
  const briefing = generator.generateBriefingData(allPromos);

  assert.ok(briefing.date, "Briefing date present");
  assert.ok(briefing.top_prepayment_rankings.length > 0, "Top prepayment rankings populated");
  assert.strictEqual(briefing.top_prepayment_rankings.length, 5, "Top 5 rankings populated");
  // Check ordering of rankings (descending by rate_pct)
  for (let i = 0; i < briefing.top_prepayment_rankings.length - 1; i++) {
    assert.ok(
      briefing.top_prepayment_rankings[i].rate_pct >= briefing.top_prepayment_rankings[i + 1].rate_pct,
      "Rankings must be sorted descending by prepayment rate"
    );
  }

  // Broadcast text formatting
  const text = generator.formatBroadcastText(briefing);
  assert.ok(text.includes("【InsurIntel 早會情報速遞】"), "Broadcast contains header");
  assert.ok(text.includes(briefing.top_prepayment_rankings[0].product_name), "Broadcast contains top 1 product");

  // Slide rendering
  const html = generator.renderMorningSlidesHtml(briefing);
  assert.ok(!html.includes("{{DATE}}"), "Date replaced");
  assert.ok(!html.includes("{{FLASH_ALERTS_HTML}}"), "Flash alerts replaced");
  assert.ok(!html.includes("{{GRAND_MATRIX_HTML}}"), "Grand matrix replaced");
  assert.ok(!html.includes("{{MANAGER_SPEECH_FULL}}"), "Manager speech replaced");
  assert.ok(html.includes("<table"), "Table present");
});

record("Suite 4: MorningBriefingGenerator", "Adversarial input: UL-only dataset fallback", () => {
  const generator = new MorningBriefingGenerator();
  const ulPromos = loadPromosByCategory("Financing_UniversalLife");

  // When fed ONLY UL products (none have prepayment_scheme), generator should gracefully fallback
  const briefing = generator.generateBriefingData(ulPromos);
  assert.ok(briefing, "Briefing generated with UL-only data");
  assert.ok(briefing.top_prepayment_rankings.length >= 4, "Fallback default rankings used when no prepayment products");

  const text = generator.formatBroadcastText(briefing);
  assert.ok(text.length > 0);

  const html = generator.renderMorningSlidesHtml(briefing);
  assert.ok(!html.includes("{{DATE}}"));
});

// ============================================================================
// SUITE 5: Downstream Compatibility - IntelligenceDiffDetector & CircuitBreaker
// ============================================================================
record("Suite 5: DiffDetector & CircuitBreaker", "Validating all 31 products against CircuitBreaker guardrails", () => {
  const diffDetector = new IntelligenceDiffDetector();
  const breaker = diffDetector.getCircuitBreaker();

  for (const promo of allPromos) {
    const { isValid, anomalies } = breaker.validatePromo(promo);
    assert.strictEqual(
      isValid,
      true,
      `Product ${promo.promo_id} failed circuit breaker validation: ${JSON.stringify(anomalies)}`
    );
    assert.strictEqual(anomalies.length, 0, `Product ${promo.promo_id} had unexpected anomalies`);
  }
  assert.strictEqual(breaker.isTripped(), false, "Circuit breaker must not be tripped by clean dataset");
});

record("Suite 5: DiffDetector & CircuitBreaker", "Self-diff on 31 products generates no unexpected changes", () => {
  const diffDetector = new IntelligenceDiffDetector();
  const cloned = JSON.parse(JSON.stringify(allPromos));
  const changes = diffDetector.detectChanges(allPromos, cloned);

  // In self-diff, prepayment, discount, gn16 diffs must be 0
  const rateChanges = changes.filter(c => c.change_type === "PREPAYMENT_RATE_CHANGE");
  assert.strictEqual(rateChanges.length, 0, "No prepayment rate changes on identical sets");
  const discountChanges = changes.filter(c => c.change_type === "DISCOUNT_CHANGE");
  assert.strictEqual(discountChanges.length, 0, "No discount changes on identical sets");
  const newLaunchChanges = changes.filter(c => c.change_type === "NEW_LAUNCH");
  assert.strictEqual(newLaunchChanges.length, 0, "No new launch changes on identical sets");
});

record("Suite 5: DiffDetector & CircuitBreaker", "Diff detection against empty baseline triggers NEW_LAUNCH for all products", () => {
  const diffDetector = new IntelligenceDiffDetector();
  const changes = diffDetector.detectChanges(allPromos, []);

  const newLaunches = changes.filter(c => c.change_type === "NEW_LAUNCH");
  assert.strictEqual(newLaunches.length, allPromos.length, `Expected ${allPromos.length} NEW_LAUNCH changes, found ${newLaunches.length}`);
});

record("Suite 5: DiffDetector & CircuitBreaker", "Simulated UL product modification triggers expected delta", () => {
  const diffDetector = new IntelligenceDiffDetector();
  const modified = JSON.parse(JSON.stringify(allPromos));

  // Modify AIA UL discount
  const aiaUl = modified.find((p: any) => p.promo_id === "PROMO-AIA-UL-2026");
  assert.ok(aiaUl, "AIA UL found");
  aiaUl.premium_discounts[1].discount_rate_pct = 7.0; // was 5.0

  const changes = diffDetector.detectChanges(modified, allPromos);
  const discountChange = changes.find(c => c.promo_id === "PROMO-AIA-UL-2026" && c.change_type === "DISCOUNT_CHANGE");
  assert.ok(discountChange, "UL discount change detected");
  assert.strictEqual(discountChange.new_value, "7%");
  assert.strictEqual(discountChange.old_value, "5%");
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log("================================================================================");
console.log("TEST EXECUTION COMPLETE");
console.log("================================================================================");

const passedCount = results.filter(r => r.passed).length;
const failedCount = results.filter(r => !r.passed).length;
console.log(`TOTAL: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);

if (failedCount > 0) {
  console.error("FAILURES DETECTED:");
  results.filter(r => !r.passed).forEach(f => {
    console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log("ALL EMPIRICAL TESTS PASSED WITH 100% SUCCESS RATE.");
  process.exit(0);
}

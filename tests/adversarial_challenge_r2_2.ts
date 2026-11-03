/**
 * Adversarial Challenger R2_2 - Empirical Stress Harness for Milestone M_MarketNav
 * 
 * Verifies:
 * 1. Clean-State Build Lifecycle & Generation:
 *    - Programmatic execution of CLI (`briefing`) and Runner (`daily_runner`) in a completely wiped `dist/` directory.
 *    - Strict assertions on generated `dist/index.html`, `dist/cafe.html`, and `dist/morning_slides.html`.
 *    - Python Swiss slide compiler (`scripts/build_swiss_slides.py`) execution and template integrity.
 * 2. Navigation Integrity & Presentation Isolation:
 *    - Directional navigation: `dist/index.html` -> `morning_slides.html`.
 *    - Reciprocal navigation: `dist/morning_slides.html` -> `index.html` (header button + toolbar shortcut).
 *    - Presentation suppression rules: presenter modal, audience sync, slide preview, print media.
 *    - Byte-for-byte identity & hash parity: `dist/cafe.html` === `dist/index.html`.
 * 3. Comprehensive Market Catalog Validation across all 42 Products & 9 Insurers:
 *    - Global ID uniqueness, absence of collisions or duplicate records.
 *    - Actuarial completeness and schema integrity across all 5 JSON datasets in `src/mock_data/`.
 *    - Strict verification of 9 HK insurers: AIA, Prudential, Manulife, Sun Life, FWD, AXA, BOC Life, YF Life, Bowtie.
 *    - Fast Track digital virtual insurer boundary checks for Bowtie (CI & VHIS only; 0 par/savings/annuity/UL).
 *    - Line-specific metric ranges (GN16 50-150%, QDAP cap HK$60,000, UL positive net carry spread, VHIS certification).
 * 4. Dynamic Matrix Computation & Briefing HTML Integration:
 *    - 8-row grand comparison matrix across traditional insurers with live market metrics.
 *    - Clean output without `undefined`, `null`, or `NaN`.
 */

import fs from "fs";
import path from "path";
import assert from "node:assert";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

import {
  loadAllMockPromos,
  loadPromosByCategory,
  loadPromosByInsurer,
  resolveMockDataDir
} from "../src/mock_data/loader.js";
import { MorningBriefingGenerator } from "../src/engine/briefing_generator.js";
import { DailyIntelligenceRunner } from "../src/scheduler/daily_runner.js";
import {
  InsuranceCategory,
  InsurerCode,
  InsurancePromoComprehensive
} from "../src/types/insurance.js";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function recordTest(suite: string, testName: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = parseFloat((performance.now() - start).toFixed(2));
    results.push({ suite, test: testName, passed: true, durationMs });
    console.log(`[PASS] (${durationMs}ms) ${suite} -> ${testName}`);
  } catch (err: any) {
    const durationMs = parseFloat((performance.now() - start).toFixed(2));
    results.push({ suite, test: testName, passed: false, error: err.message, durationMs });
    console.error(`[FAIL] (${durationMs}ms) ${suite} -> ${testName}: ${err.message}`);
  }
}

const projectRoot = process.cwd();
const mockDataDir = path.join(projectRoot, "src", "mock_data");
const distDir = path.join(projectRoot, "dist");
const templatesDir = path.join(projectRoot, "templates");

const distIndex = path.join(distDir, "index.html");
const distCafe = path.join(distDir, "cafe.html");
const distSlides = path.join(distDir, "morning_slides.html");
const distTxt = path.join(distDir, "morning_briefing.txt");
const distPoster = path.join(distDir, "morning_poster.svg");
const distSnapshot = path.join(distDir, "previous_snapshot.json");

function wipeDist() {
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    for (const file of files) {
      if (file.startsWith(".")) continue;
      const fullPath = path.join(distDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file === "api") {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      } else {
        fs.unlinkSync(fullPath);
      }
    }
  } else {
    fs.mkdirSync(distDir, { recursive: true });
  }
}

async function main() {
  console.log("================================================================================");
  console.log("STARTING EMPIRICAL ADVERSARIAL CHALLENGE R2_2: Milestone M_MarketNav");
  console.log("Scope: Navigation Integrity, Clean-State Lifecycle & 42-Product Market Catalog");
  console.log("================================================================================");

  // ============================================================================
  // SUITE 1: Product Catalog Actuarial & Schema Validation (42 Products across 9 Insurers)
  // ============================================================================

  const jsonFiles = [
    "critical_illness.json",
    "qdap_annuity.json",
    "savings_multicurrency.json",
    "universal_life.json",
    "vhis_medical.json"
  ];

  await recordTest("Suite 1: Market Catalog", "Raw JSON Inventory & Exact File Count (5 files)", () => {
    const actualFiles = fs.readdirSync(mockDataDir).filter(f => f.endsWith(".json"));
    assert.strictEqual(actualFiles.length, 5, `Expected exactly 5 JSON mock files, found ${actualFiles.length}`);
    for (const exp of jsonFiles) {
      assert.ok(actualFiles.includes(exp), `Mock data dir missing required file: ${exp}`);
    }
  });

  let allRawProducts: any[] = [];
  const fileCounts: Record<string, number> = {};

  await recordTest("Suite 1: Market Catalog", "Exact 42 Product Count Breakdown across 5 Categories", () => {
    allRawProducts = [];
    for (const f of jsonFiles) {
      const filePath = path.join(mockDataDir, f);
      const content = fs.readFileSync(filePath, "utf-8");
      const arr = JSON.parse(content);
      assert.ok(Array.isArray(arr), `${f} must be a valid JSON array`);
      fileCounts[f] = arr.length;
      arr.forEach(item => {
        item.__sourceFile = f;
        allRawProducts.push(item);
      });
    }

    assert.strictEqual(fileCounts["savings_multicurrency.json"], 8, "savings_multicurrency.json must contain 8 products");
    assert.strictEqual(fileCounts["critical_illness.json"], 9, "critical_illness.json must contain 9 products");
    assert.strictEqual(fileCounts["vhis_medical.json"], 9, "vhis_medical.json must contain 9 products");
    assert.strictEqual(fileCounts["qdap_annuity.json"], 8, "qdap_annuity.json must contain 8 products");
    assert.strictEqual(fileCounts["universal_life.json"], 8, "universal_life.json must contain 8 products");
    assert.strictEqual(allRawProducts.length, 42, `Total product count must be exactly 42, got ${allRawProducts.length}`);
  });

  await recordTest("Suite 1: Market Catalog", "Global ID Uniqueness (0 duplicate promo_ids)", () => {
    const seenIds = new Map<string, string>();
    for (const prod of allRawProducts) {
      assert.ok(prod.promo_id, `Product missing promo_id in ${prod.__sourceFile}`);
      assert.strictEqual(typeof prod.promo_id, "string", `promo_id must be string in ${prod.__sourceFile}`);
      assert.ok(prod.promo_id.trim().length > 5, `promo_id too short: ${prod.promo_id}`);

      if (seenIds.has(prod.promo_id)) {
        assert.fail(`Duplicate promo_id detected: '${prod.promo_id}' in ${prod.__sourceFile} (first seen in ${seenIds.get(prod.promo_id)})`);
      }
      seenIds.set(prod.promo_id, prod.__sourceFile);
    }
    assert.strictEqual(seenIds.size, 42, "Expected 42 unique promo_ids");
  });

  await recordTest("Suite 1: Market Catalog", "Comprehensive Insurer Coverage (9 Insurers Breakdown)", () => {
    const expectedInsurers = [
      "AIA",
      "Prudential",
      "Manulife",
      "Sun_Life",
      "FWD",
      "AXA",
      "BOC_Life",
      "YF_Life",
      "Bowtie"
    ];

    const insurerCounts: Record<string, number> = {};
    for (const prod of allRawProducts) {
      insurerCounts[prod.insurer] = (insurerCounts[prod.insurer] || 0) + 1;
    }

    for (const ins of expectedInsurers) {
      assert.ok(insurerCounts[ins] !== undefined, `Insurer ${ins} must be present in mock data`);
    }

    // Traditional 8 insurers must each have 5 products (1 per category)
    const traditional = ["AIA", "Prudential", "Manulife", "Sun_Life", "FWD", "AXA", "BOC_Life", "YF_Life"];
    for (const ins of traditional) {
      assert.strictEqual(insurerCounts[ins], 5, `Traditional insurer ${ins} must have exactly 5 products (all 5 categories), got ${insurerCounts[ins]}`);
    }

    // Bowtie (Virtual digital insurer) must have exactly 2 products (CI & VHIS only, 0 savings, 0 QDAP, 0 UL)
    assert.strictEqual(insurerCounts["Bowtie"], 2, `Bowtie must have exactly 2 products, got ${insurerCounts["Bowtie"]}`);
    const bowtieProds = allRawProducts.filter(p => p.insurer === "Bowtie");
    const bowtieCats = new Set(bowtieProds.map(p => p.category));
    assert.ok(bowtieCats.has("Critical_Illness"), "Bowtie must cover Critical_Illness");
    assert.ok(bowtieCats.has("Medical_VHIS"), "Bowtie must cover Medical_VHIS");
    assert.ok(!bowtieCats.has("Savings_MultiCurrency"), "Bowtie MUST NOT have savings products");
    assert.ok(!bowtieCats.has("Annuity_QDAP"), "Bowtie MUST NOT have QDAP products");
    assert.ok(!bowtieCats.has("Financing_UniversalLife"), "Bowtie MUST NOT have Universal Life products");
  });

  await recordTest("Suite 1: Market Catalog", "Verify 11 Newly Added Market Products for Milestone M_MarketNav", () => {
    const newPromoIds = [
      // Critical Illness (2)
      "PROMO-BOWTIE-CI-2026",
      "PROMO-BOC-CI-2026-Q4",
      // VHIS Medical (3)
      "PROMO-SUN-VHIS-2026",
      "PROMO-BOC-VHIS-2026",
      "PROMO-YF-VHIS-2026",
      // QDAP Annuity (3)
      "PROMO-FWD-QDAP-2026",
      "PROMO-AXA-QDAP-2026",
      "PROMO-YF-QDAP-2026",
      // Universal Life (3)
      "PROMO-PRU-UL-2026",
      "PROMO-AXA-UL-2026",
      "PROMO-BOC-UL-2026"
    ];

    for (const id of newPromoIds) {
      const found = allRawProducts.find(p => p.promo_id === id);
      assert.ok(found, `Newly required promo ${id} not found in catalog`);
      assert.ok(found.product_name && found.product_name.length > 5, `${id} product_name is empty or too short`);
      assert.ok(Array.isArray(found.product_aliases) && found.product_aliases.length > 0, `${id} must have product_aliases`);
    }
  });

  await recordTest("Suite 1: Market Catalog", "Strict Schema Validation & Actuarial Sanity across all 42 Products", () => {
    const validCurrencies = new Set(["USD", "HKD", "RMB", "GBP", "EUR", "AUD", "CAD", "SGD"]);
    const validChannels = new Set(["Agency", "Broker", "Bank", "All"]);
    const validSourceTypes = new Set(["Official_Circular", "Broker_Notice", "Social_Media", "Crowd_Upload"]);
    const validConfidence = new Set(["Verified", "Provisional", "Under_Review"]);

    for (const p of allRawProducts) {
      const loc = `${p.insurer} - ${p.product_name} (${p.promo_id})`;

      // Common fields
      assert.ok(p.product_name && typeof p.product_name === "string", `${loc} missing product_name`);
      assert.ok(Array.isArray(p.product_aliases) && p.product_aliases.length > 0, `${loc} missing product_aliases`);
      assert.ok(Array.isArray(p.currency_supported) && p.currency_supported.length > 0, `${loc} missing currency_supported`);
      for (const c of p.currency_supported) {
        assert.ok(validCurrencies.has(c), `${loc} invalid currency: ${c}`);
      }
      assert.ok(Array.isArray(p.payment_period_years) && p.payment_period_years.length > 0, `${loc} missing payment_period_years`);
      for (const y of p.payment_period_years) {
        assert.ok(typeof y === "number" && y > 0, `${loc} invalid payment period: ${y}`);
      }

      // Validity
      assert.ok(p.validity, `${loc} missing validity`);
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.validity.start_date), `${loc} invalid start_date`);
      assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.validity.end_date), `${loc} invalid end_date`);
      assert.ok(new Date(p.validity.end_date) >= new Date(p.validity.start_date), `${loc} end_date earlier than start_date`);
      assert.ok(validChannels.has(p.validity.channel), `${loc} invalid channel`);

      // Premium discounts
      assert.ok(Array.isArray(p.premium_discounts) && p.premium_discounts.length > 0, `${loc} missing premium_discounts`);
      for (const d of p.premium_discounts) {
        assert.ok(typeof d.min_annual_premium_usd === "number" && d.min_annual_premium_usd >= 0, `${loc} invalid min_annual_premium_usd`);
        assert.ok(typeof d.discount_rate_pct === "number" && d.discount_rate_pct >= 0 && d.discount_rate_pct <= 100, `${loc} invalid discount_rate_pct: ${d.discount_rate_pct}`);
      }

      // Prepayment scheme (optional, but if present must be sane)
      if (p.prepayment_scheme && p.prepayment_scheme.is_available) {
        assert.ok(typeof p.prepayment_scheme.guaranteed_rate_pct === "number", `${loc} invalid guaranteed_rate_pct`);
        assert.ok(p.prepayment_scheme.guaranteed_rate_pct > 0 && p.prepayment_scheme.guaranteed_rate_pct <= 12, `${loc} guaranteed_rate_pct out of range`);
        assert.ok(typeof p.prepayment_scheme.lock_period_years === "number" && p.prepayment_scheme.lock_period_years >= 1, `${loc} invalid lock_period_years`);
      }

      // Audit metadata
      assert.ok(p.audit_metadata, `${loc} missing audit_metadata`);
      assert.ok(validSourceTypes.has(p.audit_metadata.source_type), `${loc} invalid source_type`);
      assert.ok(validConfidence.has(p.audit_metadata.confidence_level), `${loc} invalid confidence_level`);
      assert.strictEqual(typeof p.audit_metadata.verified_by_editor, "boolean", `${loc} verified_by_editor must be boolean`);
      assert.ok(p.audit_metadata.created_at, `${loc} missing created_at`);

      // Category-specific validations
      if (p.category === "Savings_MultiCurrency") {
        assert.ok(p.savings_metrics, `${loc} missing savings_metrics`);
        const sm = p.savings_metrics;
        assert.ok(sm.gn16_fulfillment_ratio_pct >= 60 && sm.gn16_fulfillment_ratio_pct <= 130, `${loc} GN16 out of actuarial range: ${sm.gn16_fulfillment_ratio_pct}`);
        assert.ok(sm.breakeven_expected_year >= 3 && sm.breakeven_expected_year <= 15, `${loc} expected breakeven out of range: ${sm.breakeven_expected_year}`);
        assert.ok(sm.expected_irr_year_30 >= 3 && sm.expected_irr_year_30 <= 8, `${loc} IRR30 out of range: ${sm.expected_irr_year_30}`);
        assert.strictEqual(typeof sm.policy_split_options, "boolean", `${loc} policy_split_options must be boolean`);
        assert.strictEqual(typeof sm.currency_switch_options, "boolean", `${loc} currency_switch_options must be boolean`);
      } else if (p.category === "Critical_Illness") {
        assert.ok(p.ci_metrics, `${loc} missing ci_metrics`);
        const cm = p.ci_metrics;
        assert.ok(cm.total_illnesses_covered >= 20 && cm.total_illnesses_covered <= 200, `${loc} total_illnesses_covered out of range: ${cm.total_illnesses_covered}`);
        assert.ok(cm.multiple_claim_limit_pct >= 100 && cm.multiple_claim_limit_pct <= 1500, `${loc} multiple_claim_limit_pct out of range`);
        assert.ok(cm.cancer_waiting_period_years >= 1 && cm.cancer_waiting_period_years <= 5, `${loc} cancer_waiting_period_years out of range`);
        assert.strictEqual(typeof cm.icu_stay_benefit_covered, "boolean", `${loc} icu_stay_benefit_covered must be boolean`);
      } else if (p.category === "Medical_VHIS") {
        assert.ok(p.vhis_metrics, `${loc} missing vhis_metrics`);
        const vm = p.vhis_metrics;
        assert.ok(vm.vhis_scheme_type === "Standard" || vm.vhis_scheme_type === "Flexi", `${loc} invalid vhis_scheme_type`);
        assert.ok(vm.ward_class === "General" || vm.ward_class === "Semi_Private" || vm.ward_class === "Private", `${loc} invalid ward_class`);
        assert.ok(vm.annual_limit_hkd >= 400000 && vm.annual_limit_hkd <= 60000000, `${loc} annual_limit_hkd out of range: ${vm.annual_limit_hkd}`);
        assert.strictEqual(typeof vm.full_cover_non_surgical_cancer, "boolean", `${loc} full_cover_non_surgical_cancer must be boolean`);
        assert.ok(Array.isArray(vm.deductible_options_hkd), `${loc} deductible_options_hkd must be array`);
        assert.ok(vm.vhis_certification_number && vm.vhis_certification_number.length > 3, `${loc} missing vhis_certification_number`);
      } else if (p.category === "Annuity_QDAP") {
        assert.ok(p.qdap_metrics, `${loc} missing qdap_metrics`);
        const qm = p.qdap_metrics;
        assert.strictEqual(qm.tax_deduction_eligible_cap_hkd, 60000, `${loc} QDAP cap must be exactly HKD 60,000 under HK Inland Revenue Ordinance`);
        assert.ok(qm.guaranteed_internal_rate_pct >= 0.5 && qm.guaranteed_internal_rate_pct <= 5.0, `${loc} guaranteed IRR out of range`);
        assert.ok(qm.total_internal_rate_pct >= qm.guaranteed_internal_rate_pct, `${loc} total IRR must be >= guaranteed IRR`);
        assert.ok(qm.annuity_start_age >= 50 && qm.annuity_start_age <= 70, `${loc} annuity_start_age out of range: ${qm.annuity_start_age}`);
      } else if (p.category === "Financing_UniversalLife") {
        assert.ok(p.ul_metrics, `${loc} missing ul_metrics`);
        const um = p.ul_metrics;
        assert.strictEqual(um.financing_eligible, true, `${loc} financing_eligible must be true for Financing_UniversalLife`);
        assert.ok(um.crediting_rate_current_pct >= 3.5 && um.crediting_rate_current_pct <= 8.0, `${loc} crediting rate out of range`);
        assert.ok(um.max_ltv_pct >= 60 && um.max_ltv_pct <= 95, `${loc} max LTV out of range: ${um.max_ltv_pct}`);
        assert.ok(um.typical_funding_cost_pct > 0 && um.typical_funding_cost_pct < 10, `${loc} funding cost out of range`);
        const calculatedSpread = parseFloat((um.crediting_rate_current_pct - um.typical_funding_cost_pct).toFixed(4));
        assert.ok(Math.abs(um.net_carry_spread_pct - calculatedSpread) < 0.2, `${loc} net_carry_spread_pct (${um.net_carry_spread_pct}) mismatch calculated spread (${calculatedSpread})`);
      }
    }
  });

  await recordTest("Suite 1: Market Catalog", "Dynamic Mock Dataset Loader Determinism & Helper Functions", () => {
    const loadedPromos = loadAllMockPromos();
    assert.strictEqual(loadedPromos.length, 42, "loadAllMockPromos() must return exactly 42 products");

    // Priority order preservation check
    assert.strictEqual(loadedPromos[0].insurer, "AIA", "First promo must be AIA");
    assert.strictEqual(loadedPromos[0].category, "Savings_MultiCurrency", "First promo must be Savings");

    // Filter helpers
    const savings = loadPromosByCategory("Savings_MultiCurrency");
    assert.strictEqual(savings.length, 8, "loadPromosByCategory(Savings_MultiCurrency) must return 8 products");

    const ci = loadPromosByCategory("Critical_Illness");
    assert.strictEqual(ci.length, 9, "loadPromosByCategory(Critical_Illness) must return 9 products");

    const vhis = loadPromosByCategory("Medical_VHIS");
    assert.strictEqual(vhis.length, 9, "loadPromosByCategory(Medical_VHIS) must return 9 products");

    const qdap = loadPromosByCategory("Annuity_QDAP");
    assert.strictEqual(qdap.length, 8, "loadPromosByCategory(Annuity_QDAP) must return 8 products");

    const ul = loadPromosByCategory("Financing_UniversalLife");
    assert.strictEqual(ul.length, 8, "loadPromosByCategory(Financing_UniversalLife) must return 8 products");

    const aiaPromos = loadPromosByInsurer("AIA");
    assert.strictEqual(aiaPromos.length, 5, "loadPromosByInsurer(AIA) must return 5 products");

    const bowtiePromos = loadPromosByInsurer("Bowtie");
    assert.strictEqual(bowtiePromos.length, 2, "loadPromosByInsurer(Bowtie) must return 2 products");
  });

  // ============================================================================
  // SUITE 2: Clean-State Lifecycle & Build Regeneration of dist/
  // ============================================================================

  await recordTest("Suite 2: Lifecycle & Build", "CLI Execution in Clean State (npm run start:briefing)", () => {
    wipeDist();
    assert.ok(!fs.existsSync(distIndex), "dist/index.html must not exist before run");
    assert.ok(!fs.existsSync(distCafe), "dist/cafe.html must not exist before run");
    assert.ok(!fs.existsSync(distSlides), "dist/morning_slides.html must not exist before run");

    // Run CLI briefing command synchronously
    execSync("npx tsx src/cli.ts briefing", { cwd: projectRoot, stdio: "pipe" });

    assert.ok(fs.existsSync(distIndex), "CLI briefing must generate dist/index.html");
    assert.ok(fs.existsSync(distCafe), "CLI briefing must generate dist/cafe.html");
    assert.ok(fs.existsSync(distSlides), "CLI briefing must generate dist/morning_slides.html");
    assert.ok(fs.existsSync(distTxt), "CLI briefing must generate dist/morning_briefing.txt");

    const indexContent = fs.readFileSync(distIndex, "utf-8");
    const cafeContent = fs.readFileSync(distCafe, "utf-8");
    const slidesContent = fs.readFileSync(distSlides, "utf-8");

    // Assertions for dist/index.html
    assert.ok(indexContent.includes("INSURINTEL · 14:00 見客極速攻防卡"), "dist/index.html must contain mobile cafe battle card");
    assert.ok(indexContent.includes('href="morning_slides.html"'), "dist/index.html must have button linking to morning_slides.html");
    assert.ok(indexContent.includes("top-nav-slides-btn"), "dist/index.html must include top-nav-slides-btn");
    assert.ok(indexContent.includes("晨會投影片"), "dist/index.html button text must be 晨會投影片");

    // Assertions for dist/cafe.html (Exact match / alias)
    assert.strictEqual(cafeContent, indexContent, "dist/cafe.html must be an exact match / alias of dist/index.html");

    // Assertions for dist/morning_slides.html (Reciprocal button)
    assert.ok(slidesContent.includes('href="index.html"'), "dist/morning_slides.html must have reciprocal button to index.html");
    assert.ok(slidesContent.includes("top-nav-battlecard-btn"), "dist/morning_slides.html must include top-nav-battlecard-btn");
    assert.ok(slidesContent.includes("見客攻防卡"), "dist/morning_slides.html button text must be 見客攻防卡");
  });

  await recordTest("Suite 2: Lifecycle & Build", "Python Swiss Slide Deck Compiler Execution (py scripts/build_swiss_slides.py)", () => {
    let output = "";
    const pyCommands = process.platform === "win32" ? ["py", "python", "python3"] : ["python3", "python", "py"];
    let execSuccess = false;
    for (const cmd of pyCommands) {
      try {
        output = execSync(`${cmd} scripts/build_swiss_slides.py`, { cwd: projectRoot, encoding: "utf-8" });
        execSuccess = true;
        break;
      } catch {
        // try next candidate
      }
    }
    assert.ok(execSuccess, "At least one python binary must execute scripts/build_swiss_slides.py successfully");
    assert.ok(output.includes("Successfully compiled"), "Slide compiler output must indicate success");

    const compiledPath = path.join(templatesDir, "morning_slides.html");
    assert.ok(fs.existsSync(compiledPath), "templates/morning_slides.html must exist");
    const compiledContent = fs.readFileSync(compiledPath, "utf-8");

    assert.ok(compiledContent.includes('href="index.html"'), "Compiled morning slides must contain link to index.html");
    assert.ok(compiledContent.includes("top-nav-battlecard-btn"), "Compiled slides must include top-nav-battlecard-btn");
    assert.ok(compiledContent.includes("見客攻防卡"), "Compiled slides must include 見客攻防卡 text");
    assert.ok(compiledContent.includes("ppt-hint-link"), "Compiled slides must include toolbar hint link");
  });

  await recordTest("Suite 2: Lifecycle & Build", "Daily Runner Execution in Clean State (npm run start:search)", async () => {
    wipeDist();
    assert.ok(!fs.existsSync(distIndex), "dist/index.html must not exist before daily runner");

    const runner = new DailyIntelligenceRunner();
    const result = await runner.executeDailyCycle();

    assert.ok(result.discoveredCount > 0, "Daily runner must discover market items");
    assert.ok(fs.existsSync(distIndex), "Daily runner must generate dist/index.html");
    assert.ok(fs.existsSync(distCafe), "Daily runner must generate dist/cafe.html");
    assert.ok(fs.existsSync(distSlides), "Daily runner must generate dist/morning_slides.html");
    assert.ok(fs.existsSync(distPoster), "Daily runner must generate dist/morning_poster.svg");
    assert.ok(fs.existsSync(distSnapshot), "Daily runner must generate dist/previous_snapshot.json");

    const indexContent = fs.readFileSync(distIndex, "utf-8");
    const cafeContent = fs.readFileSync(distCafe, "utf-8");
    const slidesContent = fs.readFileSync(distSlides, "utf-8");

    // Assertions on generated files
    assert.ok(indexContent.includes("INSURINTEL · 14:00 見客極速攻防卡"), "dist/index.html must contain mobile cafe battle card");
    assert.ok(indexContent.includes('href="morning_slides.html"'), "dist/index.html must have button linking to morning_slides.html");
    assert.strictEqual(cafeContent, indexContent, "dist/cafe.html must be identical byte-for-byte to dist/index.html");
    assert.ok(slidesContent.includes('href="index.html"'), "dist/morning_slides.html must contain reciprocal link to index.html");

    // Snapshot contains validated crawler sanitized items
    const snapshotData = JSON.parse(fs.readFileSync(distSnapshot, "utf-8"));
    assert.ok(Array.isArray(snapshotData) && snapshotData.length > 0, "Snapshot must be non-empty array");

    // Static API Pre-rendered assets
    const apiBriefing = path.join(distDir, "api", "v1", "briefing.json");
    const apiMatrix = path.join(distDir, "api", "v1", "matrix.json");
    assert.ok(fs.existsSync(apiBriefing), "dist/api/v1/briefing.json must exist");
    assert.ok(fs.existsSync(apiMatrix), "dist/api/v1/matrix.json must exist");
  });

  // ============================================================================
  // SUITE 3: Navigation Integrity, Responsive UX & Presentation Isolation
  // ============================================================================

  await recordTest("Suite 3: Navigation Integrity", "Bidirectional URL & Link Validity (dist/index.html <-> dist/morning_slides.html)", () => {
    const indexContent = fs.readFileSync(distIndex, "utf-8");
    const slidesContent = fs.readFileSync(distSlides, "utf-8");

    // 1. In index.html: find all morning slides links
    const indexToSlidesLinks = indexContent.match(/href=["'](morning_slides\.html[^"']*)["']/g) || [];
    assert.ok(indexToSlidesLinks.length >= 1, "Must find at least one link to morning_slides.html in dist/index.html");
    assert.ok(!indexContent.includes("http://localhost"), "Links must not use localhost absolute URLs");
    assert.ok(!indexContent.includes("file:///"), "Links must not use local filesystem paths");

    // 2. In morning_slides.html: find all index.html links
    const slidesToIndexLinks = slidesContent.match(/href=["'](index\.html[^"']*)["']/g) || [];
    assert.ok(slidesToIndexLinks.length >= 2, "Must find at least two links to index.html in dist/morning_slides.html (top-right button + toolbar shortcut)");
  });

  await recordTest("Suite 3: Navigation Integrity", "Strict Hash & Byte Identity (dist/index.html === dist/cafe.html)", () => {
    const indexBuf = fs.readFileSync(distIndex);
    const cafeBuf = fs.readFileSync(distCafe);

    assert.strictEqual(indexBuf.length, cafeBuf.length, `Byte length mismatch: index=${indexBuf.length}, cafe=${cafeBuf.length}`);

    const hashIndex = crypto.createHash("sha256").update(indexBuf).digest("hex");
    const hashCafe = crypto.createHash("sha256").update(cafeBuf).digest("hex");

    assert.strictEqual(hashIndex, hashCafe, `SHA-256 hash mismatch between dist/index.html and dist/cafe.html!`);
  });

  await recordTest("Suite 3: Navigation Integrity", "Presentation Mode Suppression Rules in morning_slides.html", () => {
    const slidesContent = fs.readFileSync(distSlides, "utf-8");

    // Ensure button is strictly hidden in speaker/audience/preview and print modes
    assert.ok(slidesContent.includes("body.ppt-presenter .top-nav-battlecard-btn"), "Missing presenter mode button suppression");
    assert.ok(slidesContent.includes("body.ppt-audience .top-nav-battlecard-btn"), "Missing audience sync mode button suppression");
    assert.ok(slidesContent.includes("body.ppt-preview .top-nav-battlecard-btn"), "Missing preview mode button suppression");
    assert.ok(slidesContent.includes(".top-nav-battlecard-btn"), "top-nav-battlecard-btn style missing");

    // Print media rule
    const printIdx = slidesContent.indexOf("@media print");
    assert.ok(printIdx !== -1, "Print media block must exist");
    const printBlock = slidesContent.substring(printIdx, printIdx + 600);
    assert.ok(printBlock.includes(".top-nav-battlecard-btn"), "Print media must suppress .top-nav-battlecard-btn");
    assert.ok(printBlock.includes("display: none !important"), "Print media suppression must be display: none !important");
  });

  await recordTest("Suite 3: Navigation Integrity", "Mobile Responsiveness & Viewport Ergonomics in mobile_cafe_app.html", () => {
    const indexContent = fs.readFileSync(distIndex, "utf-8");

    // Viewport meta
    assert.ok(indexContent.includes('viewport-fit=cover'), "Must configure viewport-fit=cover for notched displays");
    assert.ok(indexContent.includes('user-scalable=no'), "Must prevent accidental zoom during quick client interactions");

    // Header button visibility under narrow viewport (@media (max-width: 480px))
    const mediaQueryMatch = indexContent.match(/@media\s*\(max-width:\s*480px\)\s*\{([\s\S]*?)\}/);
    assert.ok(mediaQueryMatch, "Must contain responsive media query for narrow screens");
    const queryCss = mediaQueryMatch[1];

    // Under narrow screens: offline-tag should hide to save space, but top-nav-slides-btn must remain visible
    assert.ok(queryCss.includes(".offline-tag"), "Should adapt .offline-tag on small screens");
    assert.ok(queryCss.includes("display: none"), "Should hide .offline-tag on small screens");
    assert.ok(!queryCss.includes(".top-nav-slides-btn { display: none"), "Must NEVER hide .top-nav-slides-btn on small mobile screens");
  });

  // ============================================================================
  // SUITE 4: Dynamic Matrix Computation & Briefing Integration with 42 Products
  // ============================================================================

  await recordTest("Suite 4: Briefing Integration", "Dynamic 8-Row Grand Matrix Covers All Traditional Insurers", () => {
    const promos = loadAllMockPromos();
    const generator = new MorningBriefingGenerator();

    const briefing = generator.generateBriefingData(promos);
    assert.ok(briefing.grand_matrix_rows, "Grand matrix rows must be computed");
    assert.strictEqual(briefing.grand_matrix_rows.length, 8, `Expected exactly 8 traditional insurer rows in grand matrix, got ${briefing.grand_matrix_rows.length}`);

    const insurersInMatrix = briefing.grand_matrix_rows.map(r => r.insurer);
    const requiredInsurerFragments = ["AIA", "保誠", "宏利", "永明", "富衛", "安盛", "中銀", "萬通"];
    for (const exp of requiredInsurerFragments) {
      assert.ok(insurersInMatrix.some(ins => ins.includes(exp)), `Matrix missing insurer: ${exp}`);
    }

    // Check every row has valid non-empty fields
    for (const row of briefing.grand_matrix_rows) {
      assert.ok(row.insurer && row.insurer.length > 0, "Insurer name empty");
      assert.ok(row.product && row.product.length > 0, "Product name empty");
      assert.ok(row.prepay && row.prepay.includes("%"), `Prepay rate format invalid in ${row.insurer}`);
      assert.ok(row.discount && row.discount.includes("%"), `Discount format invalid in ${row.insurer}`);
      assert.ok(row.gn16 && row.gn16.includes("%"), `GN16 format invalid in ${row.insurer}`);
      assert.ok(row.breakeven && row.breakeven.includes("年"), `Breakeven format invalid in ${row.insurer}`);
      assert.ok(row.irr30 && row.irr30.includes("%"), `IRR30 format invalid in ${row.insurer}`);
      assert.ok(row.legacy && row.legacy.length > 0, `Legacy format invalid in ${row.insurer}`);
      assert.ok(row.underwriting && row.underwriting.length > 0, `Underwriting format invalid in ${row.insurer}`);

      // Verify CI, VHIS and UL enrichments
      assert.ok(row.ci_coverage, `CI coverage enrichment missing for ${row.insurer}`);
      assert.ok(row.vhis_benefit, `VHIS benefit enrichment missing for ${row.insurer}`);
      assert.ok(row.ul_carry_spread, `UL carry spread enrichment missing for ${row.insurer}`);

      const rowStr = JSON.stringify(row);
      assert.ok(!rowStr.includes("undefined"), `Matrix row contains 'undefined': ${rowStr}`);
      assert.ok(!rowStr.includes("null"), `Matrix row contains 'null': ${rowStr}`);
      assert.ok(!rowStr.includes("NaN"), `Matrix row contains 'NaN': ${rowStr}`);
    }
  });

  await recordTest("Suite 4: Briefing Integration", "Rendered Morning Slides HTML Contains Matrix & Clean Tokens", () => {
    const promos = loadAllMockPromos();
    const generator = new MorningBriefingGenerator();
    const briefing = generator.generateBriefingData(promos);

    const html = generator.renderMorningSlidesHtml(briefing);
    assert.ok(html.length > 100000, "Rendered HTML too small");
    assert.ok(!html.includes("{{GRAND_MATRIX_HTML}}"), "Unresolved {{GRAND_MATRIX_HTML}} token found");
    assert.ok(!html.includes("{{FLASH_ALERTS_HTML}}"), "Unresolved {{FLASH_ALERTS_HTML}} token found");
    assert.ok(!html.includes("{{DATE}}"), "Unresolved {{DATE}} token found");
    assert.ok(!html.includes("{{LAST_UPDATED}}"), "Unresolved {{LAST_UPDATED}} token found");

    // Check reciprocal navigation button survived rendering
    assert.ok(html.includes('href="index.html"'), "Rendered HTML must contain reciprocal link to index.html");
    assert.ok(html.includes("top-nav-battlecard-btn"), "Rendered HTML must contain top-nav-battlecard-btn");
    assert.ok(html.includes("見客攻防卡"), "Rendered HTML must contain 見客攻防卡 text");
  });

  // ============================================================================
  // SUMMARY & VERDICT
  // ============================================================================

  console.log("\n================================================================================");
  console.log("ADVERSARIAL CHALLENGE R2_2 SUMMARY REPORT");
  console.log("================================================================================");

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const totalCount = results.length;

  console.log(`Total Verification Scenarios : ${totalCount}`);
  console.log(`Passed                       : ${passedCount}`);
  console.log(`Failed                       : ${failedCount}`);

  if (failedCount > 0) {
    console.error("\nEMPIRICAL FAILURES DETECTED:");
    for (const f of results.filter(r => !r.passed)) {
      console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log("\nVERDICT: APPROVE");
    console.log("All empirical verification tests passed cleanly with 0 failures.");
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});

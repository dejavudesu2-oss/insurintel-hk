"use strict";
/**
 * Adversarial Challenger R3_1 - Empirical Stress Test Harness
 * Milestone: M_MarketExp (Product Catalog Expansion & Actuarial Precision)
 *
 * Objectives:
 * 1. Global uniqueness: All 60 products across all 5 JSON files have 100% unique promo_ids.
 * 2. HK statutory & market actuarial boundaries:
 *    - GN16 fulfillment ratio in [60%, 130%]
 *    - Breakeven guaranteed in [1, 25], expected in [1, 15], with expected <= guaranteed
 *    - 20-yr and 30-yr expected IRR in [3.0%, 8.0%], with 20-yr <= 30-yr
 *    - Universal Life crediting rates in [3.5%, 8.0%], LTV <= 90% (HKMA ceiling), net carry spread coherent with crediting - funding_cost
 *    - QDAP tax deduction eligible cap strictly HKD 60,000
 *    - Prepayment guaranteed rates in [2.0%, 8.0%] with lock periods >= 1 year
 * 3. Actuarial completeness: No product exhibits null/undefined/NaN in any required field.
 * 4. Downstream asset synchronization & bitwise parity.
 * 5. Downstream engine compatibility across all 60 products.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const loader_js_1 = require("../src/mock_data/loader.js");
const counter_pitch_js_1 = require("../src/engine/counter_pitch.js");
const briefing_generator_js_1 = require("../src/engine/briefing_generator.js");
const diff_detector_js_1 = require("../src/engine/diff_detector.js");
const results = [];
async function recordTest(suite, testName, fn) {
    const start = performance.now();
    try {
        await fn();
        const durationMs = parseFloat((performance.now() - start).toFixed(2));
        results.push({ suite, test: testName, passed: true, durationMs });
        console.log(`[PASS] (${durationMs}ms) ${suite} -> ${testName}`);
    }
    catch (err) {
        const durationMs = parseFloat((performance.now() - start).toFixed(2));
        results.push({ suite, test: testName, passed: false, error: err.message, durationMs });
        console.error(`[FAIL] (${durationMs}ms) ${suite} -> ${testName}: ${err.message}`);
    }
}
const projectRoot = process.cwd();
const mockDataDir = path_1.default.join(projectRoot, "src", "mock_data");
const catalogFiles = [
    { file: "savings_multicurrency.json", expectedCount: 12, category: "Savings_MultiCurrency" },
    { file: "critical_illness.json", expectedCount: 13, category: "Critical_Illness" },
    { file: "vhis_medical.json", expectedCount: 12, category: "Medical_VHIS" },
    { file: "qdap_annuity.json", expectedCount: 11, category: "Annuity_QDAP" },
    { file: "universal_life.json", expectedCount: 12, category: "Financing_UniversalLife" }
];
async function runAllTests() {
    console.log("================================================================================");
    console.log("STARTING EMPIRICAL ADVERSARIAL CHALLENGE — CHALLENGER R3_1");
    console.log("Target: Product Catalog Expansion & Actuarial Precision (60 Products)");
    console.log("================================================================================");
    // Load all raw JSON files directly
    const rawProductsByFile = new Map();
    let allRawProducts = [];
    for (const { file } of catalogFiles) {
        const filePath = path_1.default.join(mockDataDir, file);
        node_assert_1.default.ok(fs_1.default.existsSync(filePath), `Catalog file must exist: ${file}`);
        const content = fs_1.default.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(content);
        node_assert_1.default.ok(Array.isArray(parsed), `${file} must be an array`);
        rawProductsByFile.set(file, parsed);
        allRawProducts = allRawProducts.concat(parsed);
    }
    // ============================================================================
    // SUITE 1: CATALOG INVENTORY & GLOBAL PROMO_ID UNIQUENESS
    // ============================================================================
    await recordTest("Suite 1: Inventory", "Raw catalog file counts strictly match category allocations", () => {
        let total = 0;
        for (const { file, expectedCount, category } of catalogFiles) {
            const items = rawProductsByFile.get(file);
            node_assert_1.default.strictEqual(items.length, expectedCount, `File ${file} expected ${expectedCount} products, got ${items.length}`);
            items.forEach(p => {
                node_assert_1.default.strictEqual(p.category, category, `Product ${p.promo_id} in ${file} must have category ${category}`);
            });
            total += items.length;
        }
        node_assert_1.default.strictEqual(total, 60, `Total products across all 5 JSON files must be exactly 60, found ${total}`);
    });
    await recordTest("Suite 1: Uniqueness", "All 60 products have 100% unique promo_ids (zero collisions)", () => {
        const seenIds = new Set();
        const duplicates = [];
        for (const p of allRawProducts) {
            node_assert_1.default.ok(p.promo_id && typeof p.promo_id === "string", `Product missing promo_id: ${JSON.stringify(p)}`);
            node_assert_1.default.ok(p.promo_id.startsWith("PROMO-"), `promo_id must follow convention PROMO-*: ${p.promo_id}`);
            if (seenIds.has(p.promo_id)) {
                duplicates.push(p.promo_id);
            }
            seenIds.add(p.promo_id);
        }
        node_assert_1.default.strictEqual(duplicates.length, 0, `Duplicate promo_ids detected: ${duplicates.join(", ")}`);
        node_assert_1.default.strictEqual(seenIds.size, 60, `Expected 60 unique promo_ids, got ${seenIds.size}`);
    });
    await recordTest("Suite 1: Distribution", "Product distribution across 11 insurers is exhaustive and compliant", () => {
        const insurerCounts = new Map();
        for (const p of allRawProducts) {
            insurerCounts.set(p.insurer, (insurerCounts.get(p.insurer) || 0) + 1);
        }
        node_assert_1.default.strictEqual(insurerCounts.size, 11, `Expected 11 insurers, found ${insurerCounts.size}`);
        node_assert_1.default.strictEqual(insurerCounts.get("AIA"), 10, "AIA should have 10 products");
        node_assert_1.default.strictEqual(insurerCounts.get("Prudential"), 8, "Prudential should have 8 products");
        node_assert_1.default.strictEqual(insurerCounts.get("Manulife"), 9, "Manulife should have 9 products");
        node_assert_1.default.strictEqual(insurerCounts.get("Sun_Life"), 6, "Sun Life should have 6 products");
        node_assert_1.default.strictEqual(insurerCounts.get("FWD"), 7, "FWD should have 7 products");
        node_assert_1.default.strictEqual(insurerCounts.get("AXA"), 5, "AXA should have 5 products");
        node_assert_1.default.strictEqual(insurerCounts.get("BOC_Life"), 6, "BOC Life should have 6 products");
        node_assert_1.default.strictEqual(insurerCounts.get("YF_Life"), 5, "YF Life should have 5 products");
        node_assert_1.default.strictEqual(insurerCounts.get("Bowtie"), 2, "Bowtie should have 2 products");
        node_assert_1.default.strictEqual(insurerCounts.get("Cigna"), 1, "Cigna should have 1 product");
        node_assert_1.default.strictEqual(insurerCounts.get("Bupa"), 1, "Bupa should have 1 product");
    });
    await recordTest("Suite 1: Boundaries", "Specialist and virtual insurer boundary constraints strictly respected", () => {
        const bowtieProducts = allRawProducts.filter(p => p.insurer === "Bowtie");
        node_assert_1.default.strictEqual(bowtieProducts.length, 2, "Bowtie must have strictly 2 products");
        const bowtieCats = new Set(bowtieProducts.map(p => p.category));
        node_assert_1.default.ok(bowtieCats.has("Critical_Illness") && bowtieCats.has("Medical_VHIS"), "Bowtie only offers CI and VHIS");
        node_assert_1.default.ok(!bowtieCats.has("Savings_MultiCurrency") && !bowtieCats.has("Annuity_QDAP") && !bowtieCats.has("Financing_UniversalLife"), "Bowtie virtual insurer has NO par/QDAP/UL");
        const cignaProducts = allRawProducts.filter(p => p.insurer === "Cigna");
        node_assert_1.default.strictEqual(cignaProducts.length, 1, "Cigna must have strictly 1 product");
        node_assert_1.default.strictEqual(cignaProducts[0].category, "Medical_VHIS", "Cigna is VHIS only");
        const bupaProducts = allRawProducts.filter(p => p.insurer === "Bupa");
        node_assert_1.default.strictEqual(bupaProducts.length, 1, "Bupa must have strictly 1 product");
        node_assert_1.default.strictEqual(bupaProducts[0].category, "Medical_VHIS", "Bupa is VHIS only");
    });
    // ============================================================================
    // SUITE 2: HONG KONG STATUTORY & MARKET ACTUARIAL BOUNDARIES
    // ============================================================================
    const savingsProducts = rawProductsByFile.get("savings_multicurrency.json");
    await recordTest("Suite 2: Actuarial", "Savings GN16 fulfillment ratio strictly within [60%, 130%]", () => {
        savingsProducts.forEach(p => {
            const sm = p.savings_metrics;
            node_assert_1.default.ok(sm, `${p.promo_id} missing savings_metrics`);
            const gn16 = sm.gn16_fulfillment_ratio_pct;
            node_assert_1.default.ok(typeof gn16 === "number" && gn16 >= 60 && gn16 <= 130, `GN16 fulfillment ratio out of bounds for ${p.promo_id}: ${gn16}% (expected [60%, 130%])`);
            if (sm.gn16_fulfillment_pct !== undefined) {
                node_assert_1.default.strictEqual(sm.gn16_fulfillment_pct, gn16, `GN16 alias mismatch in ${p.promo_id}`);
            }
        });
    });
    await recordTest("Suite 2: Actuarial", "Savings breakeven horizons strictly within [1, 25] (guaranteed) and [1, 15] (expected)", () => {
        savingsProducts.forEach(p => {
            const sm = p.savings_metrics;
            const bg = sm.breakeven_guaranteed_year;
            const be = sm.breakeven_expected_year;
            node_assert_1.default.ok(typeof bg === "number" && bg >= 1 && bg <= 25, `Guaranteed breakeven year out of bounds for ${p.promo_id}: ${bg} (expected [1, 25])`);
            node_assert_1.default.ok(typeof be === "number" && be >= 1 && be <= 15, `Expected breakeven year out of bounds for ${p.promo_id}: ${be} (expected [1, 15])`);
            node_assert_1.default.ok(be <= bg, `Actuarial incoherence in ${p.promo_id}: expected breakeven (${be}) must be <= guaranteed breakeven (${bg})`);
            if (sm.guaranteed_breakeven_year !== undefined) {
                node_assert_1.default.strictEqual(sm.guaranteed_breakeven_year, bg, `guaranteed_breakeven_year alias mismatch in ${p.promo_id}`);
            }
            if (sm.projected_breakeven_year !== undefined) {
                node_assert_1.default.strictEqual(sm.projected_breakeven_year, be, `projected_breakeven_year alias mismatch in ${p.promo_id}`);
            }
        });
    });
    await recordTest("Suite 2: Actuarial", "Savings 20-yr and 30-yr expected IRR within reasonable bounds [3.0%, 8.0%] with upward slope", () => {
        savingsProducts.forEach(p => {
            const sm = p.savings_metrics;
            const irr20 = sm.expected_irr_year_20;
            const irr30 = sm.expected_irr_year_30;
            node_assert_1.default.ok(typeof irr20 === "number" && irr20 >= 3.0 && irr20 <= 8.0, `20-yr expected IRR out of bounds for ${p.promo_id}: ${irr20}% (expected [3.0%, 8.0%])`);
            node_assert_1.default.ok(typeof irr30 === "number" && irr30 >= 3.0 && irr30 <= 8.0, `30-yr expected IRR out of bounds for ${p.promo_id}: ${irr30}% (expected [3.0%, 8.0%])`);
            node_assert_1.default.ok(irr20 <= irr30, `Maturity yield curve inversion in ${p.promo_id}: 20-yr IRR (${irr20}%) > 30-yr IRR (${irr30}%)`);
            if (sm.irr_20yr_pct !== undefined) {
                node_assert_1.default.strictEqual(sm.irr_20yr_pct, irr20, `irr_20yr_pct alias mismatch in ${p.promo_id}`);
            }
            if (sm.irr_30yr_pct !== undefined) {
                node_assert_1.default.strictEqual(sm.irr_30yr_pct, irr30, `irr_30yr_pct alias mismatch in ${p.promo_id}`);
            }
        });
    });
    const ulProducts = rawProductsByFile.get("universal_life.json");
    await recordTest("Suite 2: Actuarial", "Universal Life crediting rates, LTV <= 90% HKMA ceiling, and net carry spread coherence", () => {
        ulProducts.forEach(p => {
            const ul = p.ul_metrics;
            node_assert_1.default.ok(ul, `${p.promo_id} missing ul_metrics`);
            node_assert_1.default.strictEqual(ul.financing_eligible, true, `${p.promo_id} financing_eligible must be true`);
            // Crediting rate bounds [3.5%, 8.0%]
            node_assert_1.default.ok(ul.crediting_rate_current_pct >= 3.5 && ul.crediting_rate_current_pct <= 8.0, `Crediting rate out of bounds for ${p.promo_id}: ${ul.crediting_rate_current_pct}% (expected [3.5%, 8.0%])`);
            node_assert_1.default.ok(ul.crediting_rate_guaranteed_pct >= 1.0 && ul.crediting_rate_guaranteed_pct < ul.crediting_rate_current_pct, `Guaranteed crediting rate invalid for ${p.promo_id}: ${ul.crediting_rate_guaranteed_pct}%`);
            // HKMA LTV statutory/regulatory ceiling <= 90%
            node_assert_1.default.ok(ul.max_ltv_pct >= 70 && ul.max_ltv_pct <= 90, `Max LTV out of bounds for ${p.promo_id}: ${ul.max_ltv_pct}% (HKMA max 90%)`);
            // Funding cost and net carry spread coherence
            const expectedSpread = ul.crediting_rate_current_pct - ul.typical_funding_cost_pct;
            const spreadDiff = Math.abs(expectedSpread - ul.net_carry_spread_pct);
            node_assert_1.default.ok(spreadDiff <= 0.05001, `Net carry spread incoherence in ${p.promo_id}: computed (${ul.crediting_rate_current_pct} - ${ul.typical_funding_cost_pct} = ${expectedSpread.toFixed(3)}) vs recorded (${ul.net_carry_spread_pct}), diff: ${spreadDiff}`);
            // Commercial boundaries
            node_assert_1.default.ok(ul.min_premium_usd >= 100000, `Min premium too low for ${p.promo_id}: ${ul.min_premium_usd}`);
            node_assert_1.default.ok(ul.surrender_charge_years >= 1 && ul.surrender_charge_years <= 15, `Surrender charge years invalid in ${p.promo_id}`);
        });
    });
    const qdapProducts = rawProductsByFile.get("qdap_annuity.json");
    await recordTest("Suite 2: Actuarial", "QDAP tax deduction eligible cap strictly HKD 60,000 (HK IRO Section 26D)", () => {
        qdapProducts.forEach(p => {
            const qm = p.qdap_metrics;
            node_assert_1.default.ok(qm, `${p.promo_id} missing qdap_metrics`);
            node_assert_1.default.strictEqual(qm.tax_deduction_eligible_cap_hkd, 60000, `QDAP tax deduction cap violation in ${p.promo_id}: ${qm.tax_deduction_eligible_cap_hkd} !== 60000`);
            node_assert_1.default.ok(qm.annuity_payment_period_years >= 5, `QDAP annuity period < 5 yrs in ${p.promo_id}`);
            node_assert_1.default.ok(qm.annuity_start_age >= 50, `QDAP annuity start age < 50 in ${p.promo_id}`);
            node_assert_1.default.ok(qm.guaranteed_internal_rate_pct > 0, `QDAP guaranteed IRR <= 0 in ${p.promo_id}`);
            node_assert_1.default.ok(qm.total_internal_rate_pct >= qm.guaranteed_internal_rate_pct, `QDAP total IRR < guaranteed IRR in ${p.promo_id}`);
        });
    });
    await recordTest("Suite 2: Actuarial", "Prepayment guaranteed rates within [2.0%, 8.0%] with lock periods >= 1 year", () => {
        let prepayCount = 0;
        allRawProducts.forEach(p => {
            if (p.prepayment_scheme && p.prepayment_scheme.is_available) {
                prepayCount++;
                const ps = p.prepayment_scheme;
                node_assert_1.default.ok(ps.guaranteed_rate_pct >= 2.0 && ps.guaranteed_rate_pct <= 8.0, `Prepayment rate out of bounds in ${p.promo_id}: ${ps.guaranteed_rate_pct}%`);
                node_assert_1.default.ok(ps.lock_period_years >= 1, `Prepayment lock period < 1 year in ${p.promo_id}: ${ps.lock_period_years}`);
                node_assert_1.default.ok(ps.withdrawal_penalty && ps.withdrawal_penalty.trim().length > 0, `Prepayment withdrawal penalty missing in ${p.promo_id}`);
                if (ps.prepayment_rate_pct !== undefined) {
                    node_assert_1.default.strictEqual(ps.prepayment_rate_pct, ps.guaranteed_rate_pct, `prepayment_rate_pct alias mismatch in ${p.promo_id}`);
                }
                if (ps.prepayment_lock_years !== undefined) {
                    node_assert_1.default.strictEqual(ps.prepayment_lock_years, ps.lock_period_years, `prepayment_lock_years alias mismatch in ${p.promo_id}`);
                }
            }
        });
        node_assert_1.default.ok(prepayCount >= 10, `Expected at least 10 products with prepayment, found ${prepayCount}`);
    });
    // ============================================================================
    // SUITE 3: ACTUARIAL COMPLETENESS & FORENSIC HYGIENE
    // ============================================================================
    await recordTest("Suite 3: Forensic Audit", "Zero null, undefined, NaN, or suspicious strings in any product record", () => {
        const anomalies = [];
        function auditNode(node, pathStr) {
            if (node === null) {
                anomalies.push(`${pathStr}: literal null`);
                return;
            }
            if (node === undefined) {
                anomalies.push(`${pathStr}: literal undefined`);
                return;
            }
            if (typeof node === "number") {
                if (isNaN(node))
                    anomalies.push(`${pathStr}: NaN`);
                if (!isFinite(node))
                    anomalies.push(`${pathStr}: infinite`);
                return;
            }
            if (typeof node === "string") {
                if (node.trim() === "")
                    anomalies.push(`${pathStr}: empty string`);
                if (node.includes("undefined"))
                    anomalies.push(`${pathStr}: contains 'undefined'`);
                if (node.includes("null"))
                    anomalies.push(`${pathStr}: contains 'null'`);
                if (node.includes("NaN"))
                    anomalies.push(`${pathStr}: contains 'NaN'`);
                if (node.includes("[object Object]"))
                    anomalies.push(`${pathStr}: contains '[object Object]'`);
                return;
            }
            if (Array.isArray(node)) {
                if (node.length === 0 && !pathStr.endsWith("deductible_options_hkd")) {
                    // empty arrays generally unexpected for discounts, currencies, etc.
                }
                node.forEach((item, i) => auditNode(item, `${pathStr}[${i}]`));
                return;
            }
            if (typeof node === "object") {
                for (const k of Object.keys(node)) {
                    auditNode(node[k], `${pathStr}.${k}`);
                }
            }
        }
        allRawProducts.forEach(p => auditNode(p, p.promo_id));
        node_assert_1.default.strictEqual(anomalies.length, 0, `Forensic anomalies detected:\n${anomalies.join("\n")}`);
    });
    await recordTest("Suite 3: Schema Completeness", "All 60 products fulfill strict schema contracts for their category", () => {
        allRawProducts.forEach(p => {
            const id = p.promo_id;
            // Core metadata
            node_assert_1.default.ok(p.product_name && p.product_name.length > 0, `${id} missing product_name`);
            node_assert_1.default.ok(Array.isArray(p.product_aliases) && p.product_aliases.length > 0, `${id} missing product_aliases`);
            node_assert_1.default.ok(Array.isArray(p.currency_supported) && p.currency_supported.length > 0, `${id} missing currency_supported`);
            node_assert_1.default.ok(Array.isArray(p.payment_period_years) && p.payment_period_years.length > 0, `${id} missing payment_period_years`);
            node_assert_1.default.ok(p.validity && p.validity.start_date && p.validity.end_date, `${id} missing validity`);
            node_assert_1.default.ok(Array.isArray(p.premium_discounts) && p.premium_discounts.length > 0, `${id} missing premium_discounts`);
            node_assert_1.default.ok(p.audit_metadata && p.audit_metadata.verified_by_editor === true, `${id} missing verified audit_metadata`);
            // Category specific metrics existence
            if (p.category === "Savings_MultiCurrency") {
                node_assert_1.default.ok(p.savings_metrics, `${id} missing savings_metrics`);
                node_assert_1.default.strictEqual(typeof p.savings_metrics.policy_split_options, "boolean");
                node_assert_1.default.strictEqual(typeof p.savings_metrics.currency_switch_options, "boolean");
                node_assert_1.default.strictEqual(typeof p.savings_metrics.change_insured_unlimited, "boolean");
            }
            else if (p.category === "Critical_Illness") {
                node_assert_1.default.ok(p.ci_metrics, `${id} missing ci_metrics`);
                node_assert_1.default.ok(p.ci_metrics.total_illnesses_covered >= 40, `${id} total_illnesses_covered too low`);
                node_assert_1.default.ok(p.ci_metrics.multiple_claim_limit_pct >= 100, `${id} multiple_claim_limit_pct too low`);
                node_assert_1.default.ok(p.ci_metrics.cancer_waiting_period_years >= 1, `${id} cancer_waiting_period_years too low`);
                node_assert_1.default.strictEqual(typeof p.ci_metrics.icu_stay_benefit_covered, "boolean");
            }
            else if (p.category === "Medical_VHIS") {
                node_assert_1.default.ok(p.vhis_metrics, `${id} missing vhis_metrics`);
                node_assert_1.default.ok(["Standard", "Flexi"].includes(p.vhis_metrics.vhis_scheme_type), `${id} invalid vhis_scheme_type`);
                node_assert_1.default.ok(p.vhis_metrics.vhis_certification_number.startsWith("F000"), `${id} invalid cert number`);
                node_assert_1.default.ok(p.vhis_metrics.annual_limit_hkd >= 1000000, `${id} annual limit < 1M`);
            }
            else if (p.category === "Annuity_QDAP") {
                node_assert_1.default.ok(p.qdap_metrics, `${id} missing qdap_metrics`);
            }
            else if (p.category === "Financing_UniversalLife") {
                node_assert_1.default.ok(p.ul_metrics, `${id} missing ul_metrics`);
            }
        });
    });
    // ============================================================================
    // SUITE 4: DOWNSTREAM FRONTEND ASSET PARITY & SYNC VERIFICATION
    // ============================================================================
    await recordTest("Suite 4: Asset Parity", "Bitwise hash parity: dist/index.html === dist/cafe.html", () => {
        const indexPath = path_1.default.join(projectRoot, "dist", "index.html");
        const cafePath = path_1.default.join(projectRoot, "dist", "cafe.html");
        node_assert_1.default.ok(fs_1.default.existsSync(indexPath), "dist/index.html must exist");
        node_assert_1.default.ok(fs_1.default.existsSync(cafePath), "dist/cafe.html must exist");
        const indexContent = fs_1.default.readFileSync(indexPath, "utf-8");
        const cafeContent = fs_1.default.readFileSync(cafePath, "utf-8");
        const hashIndex = node_crypto_1.default.createHash("sha256").update(indexContent).digest("hex");
        const hashCafe = node_crypto_1.default.createHash("sha256").update(cafeContent).digest("hex");
        node_assert_1.default.strictEqual(hashIndex, hashCafe, "dist/index.html and dist/cafe.html must have identical SHA-256 hashes");
    });
    await recordTest("Suite 4: FrontEnd Knowledge Base", "ALL_PRODUCTS_CATALOG in templates/mobile_cafe_app.html contains exactly 60 products", () => {
        const tplPath = path_1.default.join(projectRoot, "templates", "mobile_cafe_app.html");
        const content = fs_1.default.readFileSync(tplPath, "utf-8");
        const match = content.match(/const ALL_PRODUCTS_CATALOG = (\[.*?\]);/s);
        node_assert_1.default.ok(match, "ALL_PRODUCTS_CATALOG declaration must exist in template");
        const catalog = JSON.parse(match[1]);
        node_assert_1.default.strictEqual(catalog.length, 60, `ALL_PRODUCTS_CATALOG must have 60 products, got ${catalog.length}`);
        // Verify drawer chip counts in HTML
        node_assert_1.default.ok(content.includes("全部 (60)"), "Drawer must show '全部 (60)'");
        node_assert_1.default.ok(content.includes("儲蓄 (12)"), "Drawer must show '儲蓄 (12)'");
        node_assert_1.default.ok(content.includes("危疾 (13)"), "Drawer must show '危疾 (13)'");
        node_assert_1.default.ok(content.includes("醫保 (12)"), "Drawer must show '醫保 (12)'");
        node_assert_1.default.ok(content.includes("年金 (11)"), "Drawer must show '年金 (11)'");
        node_assert_1.default.ok(content.includes("萬用 (12)"), "Drawer must show '萬用 (12)'");
        // Zero rendered NaN% or undefined in static HTML
        node_assert_1.default.ok(!content.includes(">undefined<"), "HTML must not contain rendered >undefined<");
        node_assert_1.default.ok(!content.includes(">null<"), "HTML must not contain rendered >null<");
        node_assert_1.default.ok(!content.includes("NaN%"), "HTML must not contain NaN%");
    });
    await recordTest("Suite 4: Morning Slides", "templates/morning_slides.html contains reciprocal button and 60-product lead copy", () => {
        const slidesPath = path_1.default.join(projectRoot, "templates", "morning_slides.html");
        const content = fs_1.default.readFileSync(slidesPath, "utf-8");
        node_assert_1.default.ok(content.includes("top-nav-battlecard-btn"), "Slide deck must contain floating capsule battle card button");
        node_assert_1.default.ok(content.includes('href="index.html"'), "Navigation link must point to index.html");
        node_assert_1.default.ok(content.includes("5 大險種 60 款產品矩陣"), "Cover slide must mention 60 products matrix");
    });
    // ============================================================================
    // SUITE 5: DOWNSTREAM ENGINE COMPATIBILITY ACROSS 60 PRODUCTS
    // ============================================================================
    const loadedPromos = (0, loader_js_1.loadAllMockPromos)();
    await recordTest("Suite 5: Loader Parity", "loadAllMockPromos() loads all 60 products preserving AIA GP3 as promos[0]", () => {
        node_assert_1.default.strictEqual(loadedPromos.length, 60, `Loader must return 60 products, got ${loadedPromos.length}`);
        node_assert_1.default.strictEqual(loadedPromos[0].promo_id, "PROMO-AIA-SAV-2026-Q4", "promos[0] MUST be AIA Global Power 3 for backward compatibility");
        const pruIdx = loadedPromos.findIndex(p => p.insurer === "Prudential");
        node_assert_1.default.strictEqual(loadedPromos[pruIdx].promo_id, "PROMO-PRU-SAV-2026-Q4", "First PRU product MUST be Evergreen Grandeur");
    });
    await recordTest("Suite 5: CounterPitchEngine", "CounterPitchEngine executes flawlessly across all 60 products and all 3 tones (180 runs)", () => {
        const engine = new counter_pitch_js_1.CounterPitchEngine(loadedPromos);
        const tones = ["cantonese_colloquial", "hk_business_english", "formal_written_zh"];
        let count = 0;
        for (const p of loadedPromos) {
            for (const tone of tones) {
                const res = engine.generateCounterPitch({
                    category: p.category,
                    our_product: p.product_name,
                    competitor_product: "競品方案",
                    client_scenario: "客戶關注高性價比及市場回報對比",
                    tone
                });
                node_assert_1.default.ok(res, `Result should exist for ${p.promo_id}`);
                node_assert_1.default.ok(res.three_stage_framework.stage_1_empathy.length > 0, "Empathy text present");
                node_assert_1.default.ok(res.three_stage_framework.stage_2_blindspot.length > 0, "Blindspot text present");
                node_assert_1.default.ok(res.three_stage_framework.stage_3_actuarial_checkmate.length > 0, "Checkmate text present");
                node_assert_1.default.ok(res.regulatory_guardrail.compliance_audit_passed, "GL20 compliance passed");
                count++;
            }
        }
        node_assert_1.default.strictEqual(count, 180, "Expected exactly 180 counter-pitch executions");
    });
    await recordTest("Suite 5: MorningBriefingGenerator", "MorningBriefingGenerator generates 8 flagship grand matrix rows dynamically", () => {
        const generator = new briefing_generator_js_1.MorningBriefingGenerator();
        const briefing = generator.generateBriefingData(loadedPromos);
        node_assert_1.default.ok(briefing.date, "Briefing date present");
        node_assert_1.default.strictEqual(briefing.top_prepayment_rankings.length, 5, "Top 5 prepayment rankings populated");
        node_assert_1.default.ok(briefing.grand_matrix_rows, "Grand matrix rows must be present");
        node_assert_1.default.strictEqual(briefing.grand_matrix_rows.length, 8, "Expected 8 flagship rows for 8 savings insurers");
        // Verify no row contains empty values or undefined
        for (const r of briefing.grand_matrix_rows) {
            node_assert_1.default.ok(r.insurer && r.product && r.prepay && r.discount && r.gn16 && r.breakeven && r.irr30, "All matrix cells populated");
            node_assert_1.default.ok(!r.prepay.includes("undefined") && !r.gn16.includes("undefined"), "Matrix cell has no undefined");
        }
    });
    await recordTest("Suite 5: DiffDetector & Circuit Breaker", "All 60 products pass Circuit Breaker sanity validation with 0 anomalies", () => {
        const diffDetector = new diff_detector_js_1.IntelligenceDiffDetector();
        const breaker = diffDetector.getCircuitBreaker();
        for (const p of loadedPromos) {
            const { isValid, anomalies } = breaker.validatePromo(p);
            node_assert_1.default.strictEqual(isValid, true, `Circuit breaker failed on ${p.promo_id}: ${anomalies.join("; ")}`);
            node_assert_1.default.strictEqual(anomalies.length, 0, `Unexpected anomalies on ${p.promo_id}`);
        }
        node_assert_1.default.strictEqual(breaker.isTripped(), false, "Breaker must remain CLOSED for all 60 clean products");
    });
    // ============================================================================
    // SUMMARY REPORT & VERDICT
    // ============================================================================
    console.log("================================================================================");
    console.log("CHALLENGER R3_1 EMPIRICAL VERIFICATION COMPLETE");
    console.log("================================================================================");
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`TOTAL SCENARIOS TESTED : ${results.length}`);
    console.log(`PASSED                 : ${passed}`);
    console.log(`FAILED                 : ${failed}`);
    if (failed > 0) {
        console.error("\nCRITICAL FAILURES DETECTED:");
        results.filter(r => !r.passed).forEach(f => {
            console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
        });
        console.error("\nVERDICT: REQUEST_CHANGES");
        process.exit(1);
    }
    else {
        console.log("\nVERDICT: APPROVE");
        console.log("All 60 products and actuarial bounds empirically validated with 100% precision.");
        process.exit(0);
    }
}
runAllTests().catch(err => {
    console.error("FATAL RUNNER ERROR:", err);
    process.exit(1);
});

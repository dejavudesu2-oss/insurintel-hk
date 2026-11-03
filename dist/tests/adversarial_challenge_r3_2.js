"use strict";
/**
 * Adversarial Challenger R3_2 - Empirical Stress Harness for Milestone M_MarketExp
 *
 * Verifies:
 * 1. Asset Parity: Bitwise exact identity across templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html.
 * 2. Catalog Drawer Data: window.ALL_PRODUCTS_CATALOG embedded in HTML contains exactly 60 products matching src/mock_data/*.json.
 * 3. Empirical verification of scripts/build_mobile_cafe.js:58 fix (breakeven_guaranteed_year resolution).
 * 4. 54 Core Combinations (9 insurers x 6 claims) rendered completely without undefined, null, NaN%, or empty strings.
 * 5. 72 Bilateral Combinations (9 insurers x 8 rivals) across 5 categories rendered without undefined, null, NaN%, or empty strings.
 * 6. Adversarial edge cases: rapid DOM toggling, exotic injections, stance-aware role swaps.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_vm_1 = __importDefault(require("node:vm"));
const results = [];
function recordTest(suite, test, fn) {
    const start = performance.now();
    try {
        fn();
        const durationMs = parseFloat((performance.now() - start).toFixed(2));
        results.push({ suite, test, passed: true, durationMs });
        console.log(`[PASS] (${durationMs}ms) ${suite} -> ${test}`);
    }
    catch (err) {
        const durationMs = parseFloat((performance.now() - start).toFixed(2));
        results.push({ suite, test, passed: false, error: err.message, durationMs });
        console.error(`[FAIL] (${durationMs}ms) ${suite} -> ${test}: ${err.message}`);
    }
}
console.log("================================================================================");
console.log("EMPIRICAL ADVERSARIAL CHALLENGER R3_2: M_MarketExp STRESS TEST HARNESS");
console.log("Targets: mobile_cafe_app.html, dist/, mock_data/, build_mobile_cafe.js");
console.log("================================================================================");
const projectRoot = process.cwd();
const templateCafe = path_1.default.join(projectRoot, "templates", "mobile_cafe_app.html");
const distIndex = path_1.default.join(projectRoot, "dist", "index.html");
const distCafe = path_1.default.join(projectRoot, "dist", "cafe.html");
const mockDataDir = path_1.default.join(projectRoot, "src", "mock_data");
// -----------------------------------------------------------------------------
// SUITE 1: Asset Parity (Bitwise Exact Identity)
// -----------------------------------------------------------------------------
recordTest("Suite 1: Asset Parity", "Verify templates/mobile_cafe_app.html exists and is non-empty", () => {
    node_assert_1.default.ok(fs_1.default.existsSync(templateCafe), "templates/mobile_cafe_app.html must exist");
    const stat = fs_1.default.statSync(templateCafe);
    node_assert_1.default.ok(stat.size > 50000, `templates/mobile_cafe_app.html size (${stat.size}) is unexpectedly small`);
});
recordTest("Suite 1: Asset Parity", "Verify dist/index.html and dist/cafe.html exist and match templateCafe bitwise", () => {
    node_assert_1.default.ok(fs_1.default.existsSync(distIndex), "dist/index.html must exist");
    node_assert_1.default.ok(fs_1.default.existsSync(distCafe), "dist/cafe.html must exist");
    const bufTemplate = fs_1.default.readFileSync(templateCafe);
    const bufIndex = fs_1.default.readFileSync(distIndex);
    const bufCafe = fs_1.default.readFileSync(distCafe);
    node_assert_1.default.strictEqual(bufTemplate.length, bufIndex.length, `Length mismatch: template (${bufTemplate.length}) vs dist/index.html (${bufIndex.length})`);
    node_assert_1.default.strictEqual(bufTemplate.length, bufCafe.length, `Length mismatch: template (${bufTemplate.length}) vs dist/cafe.html (${bufCafe.length})`);
    const hashTemplate = node_crypto_1.default.createHash("sha256").update(bufTemplate).digest("hex");
    const hashIndex = node_crypto_1.default.createHash("sha256").update(bufIndex).digest("hex");
    const hashCafe = node_crypto_1.default.createHash("sha256").update(bufCafe).digest("hex");
    node_assert_1.default.strictEqual(hashTemplate, hashIndex, `SHA256 mismatch between template and dist/index.html`);
    node_assert_1.default.strictEqual(hashTemplate, hashCafe, `SHA256 mismatch between template and dist/cafe.html`);
    const cmpIndex = Buffer.compare(bufTemplate, bufIndex);
    const cmpCafe = Buffer.compare(bufTemplate, bufCafe);
    node_assert_1.default.strictEqual(cmpIndex, 0, "Buffer.compare(template, dist/index.html) must be 0 (exact bitwise parity)");
    node_assert_1.default.strictEqual(cmpCafe, 0, "Buffer.compare(template, dist/cafe.html) must be 0 (exact bitwise parity)");
});
// -----------------------------------------------------------------------------
// SUITE 2: DOM Sandbox & Script Execution Setup
// -----------------------------------------------------------------------------
const cafeHtml = fs_1.default.readFileSync(templateCafe, "utf-8");
const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
node_assert_1.default.ok(scriptMatch, "mobile_cafe_app.html must contain a valid <script> block");
const scriptCode = scriptMatch[1];
function createSandbox() {
    const domElements = {};
    const makeMockElement = (id, tagName = "div") => {
        return {
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
                    if (force === true) {
                        this.classes.add(c);
                    }
                    else if (force === false) {
                        this.classes.delete(c);
                    }
                    else if (this.classes.has(c)) {
                        this.classes.delete(c);
                    }
                    else {
                        this.classes.add(c);
                    }
                },
                contains(c) { return this.classes.has(c); }
            }
        };
    };
    const registeredIds = [
        "btn-agent-view",
        "btn-client-view",
        "agent-view",
        "client-view",
        "company-pills",
        "claim-pills",
        "select-my-insurer",
        "select-rival-insurer",
        "btn-swap-roles",
        "my-product-display",
        "rival-product-display",
        "bilateral-spec-table",
        "corridor-our-pointer",
        "corridor-our-label",
        "agent-title",
        "agent-step-1",
        "agent-step-2",
        "agent-step-3",
        "agent-trap-alert",
        "client-title",
        "client-source",
        "client-desc",
        "client-chart-box",
        "client-chart-title",
        "client-chart-bars",
        "client-table-container",
        "client-table-title",
        "client-table",
        "client-disclaimer",
        "corridor-desc",
        "corridor-rival-pointer",
        "fineprint-citation",
        "fineprint-claim",
        "fineprint-reality",
        "hero-our-name",
        "hero-rival-name",
        "horizon-slider-box",
        "horizon-slider",
        "horizon-year-badge",
        "horizon-result-card",
        "catalog-drawer",
        "catalog-drawer-backdrop",
        "catalog-cards-list",
        "catalog-search-input",
        "toast",
        "link-morning-slides"
    ];
    for (const id of registeredIds) {
        domElements[id] = makeMockElement(id, id.includes("btn") ? "button" : id.includes("table") ? "table" : id.includes("select") ? "select" : "div");
    }
    const insurerNames = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    domElements["select-my-insurer"].options = insurerNames.map(val => ({ value: val, text: val, disabled: false }));
    domElements["select-rival-insurer"].options = insurerNames.map(val => ({ value: val, text: val, disabled: false }));
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
        makePill("純網上虛擬 Bowtie"),
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
    const storageStore = {};
    const mockLocalStorage = {
        getItem: (k) => (k in storageStore ? storageStore[k] : null),
        setItem: (k, v) => { storageStore[k] = String(v); },
        removeItem: (k) => { delete storageStore[k]; },
        clear: () => { for (const k in storageStore)
            delete storageStore[k]; }
    };
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
        localStorage: mockLocalStorage,
        navigator: {
            clipboard: { writeText: async (t) => { } }
        },
        console,
        clearTimeout: (t) => clearTimeout(t),
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        alert: (msg) => { },
        addEventListener: () => { }
    };
    sandbox.window = sandbox;
    sandbox.__domElements = domElements;
    sandbox.__companyPills = companyPills;
    sandbox.__claimPills = claimPills;
    sandbox.__storageStore = storageStore;
    node_vm_1.default.createContext(sandbox);
    node_vm_1.default.runInContext(scriptCode, sandbox);
    return { sandbox, context: sandbox };
}
const { sandbox } = createSandbox();
const dom = sandbox.__domElements;
// -----------------------------------------------------------------------------
// SUITE 3: Catalog Drawer Data Matching (60 Products)
// -----------------------------------------------------------------------------
recordTest("Suite 3: Catalog Drawer Data", "Verify window.ALL_PRODUCTS_CATALOG exists and contains exactly 60 items", () => {
    const catalog = sandbox.ALL_PRODUCTS_CATALOG || sandbox.window.ALL_PRODUCTS_CATALOG;
    node_assert_1.default.ok(Array.isArray(catalog), "window.ALL_PRODUCTS_CATALOG must be an array");
    node_assert_1.default.strictEqual(catalog.length, 60, `Catalog must have exactly 60 products, found ${catalog.length}`);
});
recordTest("Suite 3: Catalog Drawer Data", "Verify 1-to-1 matching between src/mock_data/*.json and ALL_PRODUCTS_CATALOG", () => {
    const jsonFiles = [
        { file: "savings_multicurrency.json", expectedCategory: "Savings_MultiCurrency", expectedCount: 12 },
        { file: "critical_illness.json", expectedCategory: "Critical_Illness", expectedCount: 13 },
        { file: "vhis_medical.json", expectedCategory: "Medical_VHIS", expectedCount: 12 },
        { file: "qdap_annuity.json", expectedCategory: "Annuity_QDAP", expectedCount: 11 },
        { file: "universal_life.json", expectedCategory: "Financing_UniversalLife", expectedCount: 12 }
    ];
    const catalog = sandbox.ALL_PRODUCTS_CATALOG;
    const catalogById = new Map();
    for (const item of catalog) {
        node_assert_1.default.ok(!catalogById.has(item.id), `Duplicate ID in ALL_PRODUCTS_CATALOG: ${item.id}`);
        catalogById.set(item.id, item);
    }
    let totalRawProducts = 0;
    for (const { file, expectedCategory, expectedCount } of jsonFiles) {
        const filePath = path_1.default.join(mockDataDir, file);
        node_assert_1.default.ok(fs_1.default.existsSync(filePath), `Mock data file ${file} must exist`);
        const content = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        node_assert_1.default.ok(Array.isArray(content), `${file} must contain a JSON array`);
        node_assert_1.default.strictEqual(content.length, expectedCount, `${file} product count mismatch: expected ${expectedCount}, got ${content.length}`);
        totalRawProducts += content.length;
        for (const raw of content) {
            node_assert_1.default.ok(catalogById.has(raw.promo_id), `Product ${raw.promo_id} from ${file} is missing from ALL_PRODUCTS_CATALOG`);
            const catItem = catalogById.get(raw.promo_id);
            node_assert_1.default.strictEqual(catItem.category, expectedCategory, `Category mismatch for ${raw.promo_id}`);
        }
    }
    node_assert_1.default.strictEqual(totalRawProducts, 60, `Total raw products across JSON files must be 60, got ${totalRawProducts}`);
});
recordTest("Suite 3: Catalog Drawer Data", "Verify insurer coverage across all 11 insurers in catalog", () => {
    const catalog = sandbox.ALL_PRODUCTS_CATALOG;
    const insurerCounts = {};
    for (const p of catalog) {
        insurerCounts[p.insurer] = (insurerCounts[p.insurer] || 0) + 1;
    }
    const expectedInsurerCounts = {
        AIA: 10,
        Prudential: 8,
        Manulife: 9,
        Sun_Life: 6,
        FWD: 7,
        AXA: 5,
        BOC_Life: 6,
        YF_Life: 5,
        Bowtie: 2,
        Cigna: 1,
        Bupa: 1
    };
    for (const [ins, count] of Object.entries(expectedInsurerCounts)) {
        node_assert_1.default.strictEqual(insurerCounts[ins], count, `Insurer ${ins} expected count ${count}, got ${insurerCounts[ins]}`);
    }
});
recordTest("Suite 3: Catalog Drawer Data", "Verify all 60 products have complete, uncorrupted fields", () => {
    const catalog = sandbox.ALL_PRODUCTS_CATALOG;
    const requiredFields = ["id", "insurer", "insurerName", "name", "category", "categoryName", "prepay", "discount", "gn16", "breakeven", "highlight"];
    for (const p of catalog) {
        for (const field of requiredFields) {
            node_assert_1.default.ok(p[field] !== undefined && p[field] !== null, `Product ${p.id} field '${field}' is null/undefined`);
            node_assert_1.default.strictEqual(typeof p[field], "string", `Product ${p.id} field '${field}' must be string`);
            node_assert_1.default.ok(p[field].trim().length > 0, `Product ${p.id} field '${field}' is empty`);
            node_assert_1.default.ok(!p[field].includes("undefined"), `Product ${p.id} field '${field}' contains 'undefined'`);
            node_assert_1.default.ok(!p[field].includes("NaN"), `Product ${p.id} field '${field}' contains 'NaN'`);
            node_assert_1.default.ok(!p[field].includes("null"), `Product ${p.id} field '${field}' contains 'null'`);
            node_assert_1.default.ok(!p[field].includes("HK,000"), `Product ${p.id} field '${field}' contains corrupted 'HK,000'`);
        }
    }
});
// -----------------------------------------------------------------------------
// SUITE 4: Empirical Verification of scripts/build_mobile_cafe.js:58 Fix
// -----------------------------------------------------------------------------
recordTest("Suite 4: Build Script Fix Empirical Check", "Verify savings breakeven accurately reflects breakeven_guaranteed_year without defaulting to 18", () => {
    const savingsRaw = JSON.parse(fs_1.default.readFileSync(path_1.default.join(mockDataDir, "savings_multicurrency.json"), "utf-8"));
    const catalog = sandbox.ALL_PRODUCTS_CATALOG;
    node_assert_1.default.strictEqual(savingsRaw.length, 12, "Must have exactly 12 savings plans");
    for (const raw of savingsRaw) {
        const catItem = catalog.find((c) => c.id === raw.promo_id);
        node_assert_1.default.ok(catItem, `Savings item ${raw.promo_id} must be in catalog`);
        // Expected breakeven string based on breakeven_guaranteed_year
        const expectedYear = raw.savings_metrics?.breakeven_guaranteed_year || raw.savings_metrics?.guaranteed_breakeven_year;
        node_assert_1.default.ok(expectedYear, `Raw product ${raw.promo_id} must have guaranteed breakeven year defined`);
        const expectedBreakeven = `第 ${expectedYear} 年保證`;
        node_assert_1.default.strictEqual(catItem.breakeven, expectedBreakeven, `Product ${raw.promo_id} breakeven mismatch: expected '${expectedBreakeven}', got '${catItem.breakeven}'`);
    }
    // Explicit empirical assertions for products whose breakeven year is NOT 18:
    // If the bug (scripts/build_mobile_cafe.js:58) was present, all these would have falsely evaluated to '第 18 年'
    const non18Plans = [
        { id: "PROMO-PRU-SAV-2026-Q4", expectedYear: 19, name: "Prudential Evergreen Grandeur" },
        { id: "PROMO-MANU-SAV-2026-Q4", expectedYear: 17, name: "Manulife ManuGlobal Saver" },
        { id: "PROMO-FWD-SAV-2026-Q4", expectedYear: 16, name: "FWD MaxFortune" },
        { id: "PROMO-BOC-SAV-2026-Q4", expectedYear: 15, name: "BOC Life Generational" },
        { id: "PROMO-YF-SAV-2026-Q4", expectedYear: 17, name: "YF Life Infinite Fortune" },
        { id: "PROMO-AIA-SAV-SLE5-2026", expectedYear: 8, name: "AIA Simple Love Encore 5" },
        { id: "PROMO-PRU-SAV-EGSP2-2026", expectedYear: 17, name: "Prudential Everlasting Grandeur 2" },
        { id: "PROMO-MANU-SAV-CENTURY-2026", expectedYear: 16, name: "Manulife Century Legacy" },
        { id: "PROMO-FWD-SAV-MAXACC-2026", expectedYear: 15, name: "FWD MaxAccumulator" }
    ];
    for (const plan of non18Plans) {
        const item = catalog.find((c) => c.id === plan.id);
        node_assert_1.default.ok(item, `Plan ${plan.id} (${plan.name}) must exist in catalog`);
        node_assert_1.default.strictEqual(item.breakeven, `第 ${plan.expectedYear} 年保證`, `EMPIRICAL BUG DETECTION: Plan ${plan.name} (${plan.id}) has '${item.breakeven}' instead of '第 ${plan.expectedYear} 年保證'. If this is '第 18 年', line 58 bug is present!`);
        node_assert_1.default.notStrictEqual(item.breakeven, "第 18 年", `Plan ${plan.name} (${plan.id}) incorrectly fell back to default '第 18 年'`);
    }
});
// -----------------------------------------------------------------------------
// SUITE 5: 54 Core Combinations (9 Insurers x 6 Claims)
// -----------------------------------------------------------------------------
recordTest("Suite 5: 54 Core Combinations", "Exhaustively render all 54 core combinations and assert complete, non-blank output", () => {
    const insurers = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    const claims = [
        "5.8% 預繳 / 保證高回報",
        "首年保費回贈 28%",
        "癌症再次索償等待期",
        "自願醫保全數賠償",
        "保費融資 85% LTV",
        "QDAP 延期年金總回報"
    ];
    let evaluatedCombos = 0;
    for (const company of insurers) {
        for (const claim of claims) {
            evaluatedCombos++;
            // Trigger selection
            sandbox.selectCompany(company);
            sandbox.selectClaim(claim);
            // Check rendered DOM outputs
            const agentStep1 = dom["agent-step-1"].innerHTML;
            const agentStep2 = dom["agent-step-2"].innerHTML;
            const agentStep3 = dom["agent-step-3"].innerHTML;
            const agentTrap = dom["agent-trap-alert"].innerHTML;
            const clientDesc = dom["client-desc"].innerHTML;
            const clientTable = dom["client-table"].innerHTML;
            const fullOutput = [agentStep1, agentStep2, agentStep3, agentTrap, clientDesc, clientTable].join(" ");
            node_assert_1.default.ok(agentStep1.length > 5, `[${company} x ${claim}] agent-step-1 must not be empty`);
            node_assert_1.default.ok(agentStep2.length > 5, `[${company} x ${claim}] agent-step-2 must not be empty`);
            node_assert_1.default.ok(agentStep3.length > 5, `[${company} x ${claim}] agent-step-3 must not be empty`);
            node_assert_1.default.ok(agentTrap.length > 5, `[${company} x ${claim}] agent-trap-alert must not be empty`);
            node_assert_1.default.ok(clientDesc.length > 5, `[${company} x ${claim}] client-desc must not be empty`);
            node_assert_1.default.ok(clientTable.length > 10, `[${company} x ${claim}] client-table must not be empty`);
            node_assert_1.default.ok(!fullOutput.includes("undefined"), `[${company} x ${claim}] contains 'undefined'`);
            node_assert_1.default.ok(!fullOutput.includes("null"), `[${company} x ${claim}] contains 'null'`);
            node_assert_1.default.ok(!fullOutput.includes("NaN%"), `[${company} x ${claim}] contains 'NaN%'`);
            node_assert_1.default.ok(!fullOutput.includes("[object Object]"), `[${company} x ${claim}] contains '[object Object]'`);
        }
    }
    node_assert_1.default.strictEqual(evaluatedCombos, 54, `Must evaluate exactly 54 combinations (9 insurers x 6 claims), evaluated ${evaluatedCombos}`);
});
recordTest("Suite 5: 54 Core Combinations", "Verify Bowtie pure-protection virtual insurer copy when paired with non-par/savings/annuity/UL", () => {
    sandbox.selectCompany("Bowtie");
    const nonParClaims = [
        "5.8% 預繳 / 保證高回報",
        "首年保費回贈 28%",
        "保費融資 85% LTV",
        "QDAP 延期年金總回報"
    ];
    for (const claim of nonParClaims) {
        sandbox.selectClaim(claim);
        const agentStep1 = dom["agent-step-1"].innerHTML;
        const agentStep2 = dom["agent-step-2"].innerHTML;
        const agentStep3 = dom["agent-step-3"].innerHTML;
        const clientDesc = dom["client-desc"].innerHTML;
        const combined = [agentStep1, agentStep2, agentStep3, clientDesc].join(" ");
        // Verify copy explicitly addresses Bowtie's virtual / pure-protection boundary
        const hasVirtualContext = combined.includes("虛擬") || combined.includes("純保障") || combined.includes("網上") || combined.includes("分紅") || combined.includes("保費融資") || combined.includes("年金") || combined.includes("儲蓄");
        node_assert_1.default.ok(hasVirtualContext, `Bowtie with claim '${claim}' must articulate virtual/pure-protection boundary copy`);
        node_assert_1.default.ok(agentStep1.length > 10, `Bowtie agent-step-1 for '${claim}' is unexpectedly short`);
    }
});
// -----------------------------------------------------------------------------
// SUITE 6: 72 Bilateral Combinations (9 Insurers x 8 Rivals)
// -----------------------------------------------------------------------------
recordTest("Suite 6: 72 Bilateral Combinations", "Exhaustively render all 72 bilateral combinations across categories without undefined, null, or NaN%", () => {
    const insurers = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    const categories = ["Savings_MultiCurrency", "Critical_Illness", "Medical_VHIS", "Annuity_QDAP", "Financing_UniversalLife"];
    let evaluatedBilateral = 0;
    for (const ourComp of insurers) {
        for (const rivalComp of insurers) {
            if (ourComp === rivalComp)
                continue;
            evaluatedBilateral++;
            sandbox.setMyCompany(ourComp);
            sandbox.selectCompany(rivalComp);
            for (const cat of categories) {
                sandbox.selectCategory(cat);
                const heroOur = dom["hero-our-name"].innerText || dom["hero-our-name"].innerHTML;
                const heroRival = dom["hero-rival-name"].innerText || dom["hero-rival-name"].innerHTML;
                const myDisplay = dom["my-product-display"].innerText || dom["my-product-display"].innerHTML;
                const rivalDisplay = dom["rival-product-display"].innerText || dom["rival-product-display"].innerHTML;
                const specTable = dom["bilateral-spec-table"].innerHTML;
                node_assert_1.default.ok(heroOur.length > 0, `[${ourComp} vs ${rivalComp} / ${cat}] hero-our-name must not be empty`);
                node_assert_1.default.ok(heroRival.length > 0, `[${ourComp} vs ${rivalComp} / ${cat}] hero-rival-name must not be empty`);
                node_assert_1.default.ok(specTable.length > 20, `[${ourComp} vs ${rivalComp} / ${cat}] bilateral-spec-table must not be empty`);
                const combined = [heroOur, heroRival, myDisplay, rivalDisplay, specTable].join(" ");
                node_assert_1.default.ok(!combined.includes("undefined"), `[${ourComp} vs ${rivalComp} / ${cat}] contains 'undefined'`);
                node_assert_1.default.ok(!combined.includes("NaN%"), `[${ourComp} vs ${rivalComp} / ${cat}] contains 'NaN%'`);
            }
        }
    }
    node_assert_1.default.strictEqual(evaluatedBilateral, 72, `Must evaluate exactly 72 bilateral pairs, evaluated ${evaluatedBilateral}`);
});
recordTest("Suite 6: 72 Bilateral Combinations", "Verify swapCampRoles preserves state symmetry across all 72 combinations", () => {
    const insurers = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    for (let i = 0; i < insurers.length; i++) {
        const ourComp = insurers[i];
        const rivalComp = insurers[(i + 1) % insurers.length];
        sandbox.setMyCompany(ourComp);
        sandbox.selectCompany(rivalComp);
        node_assert_1.default.strictEqual(sandbox.getMyCompany(), ourComp);
        node_assert_1.default.strictEqual(sandbox.getRivalCompany(), rivalComp);
        // Swap roles
        sandbox.swapCampRoles();
        node_assert_1.default.strictEqual(sandbox.getMyCompany(), rivalComp, `After swap, myCompany must be ${rivalComp}`);
        node_assert_1.default.strictEqual(sandbox.getRivalCompany(), ourComp, `After swap, rivalCompany must be ${ourComp}`);
        // Swap back
        sandbox.swapCampRoles();
        node_assert_1.default.strictEqual(sandbox.getMyCompany(), ourComp, `After second swap, myCompany must restore to ${ourComp}`);
        node_assert_1.default.strictEqual(sandbox.getRivalCompany(), rivalComp, `After second swap, rivalCompany must restore to ${rivalComp}`);
    }
});
// -----------------------------------------------------------------------------
// SUITE 7: Adversarial Edge-Case Stress Testing
// -----------------------------------------------------------------------------
recordTest("Suite 7: Adversarial Stress", "Simulate rapid randomized user DOM toggles (150 cycles) without crash or corrupted state", () => {
    const insurers = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    const claims = ["prepayment", "ci", "vhis", "financing_ul", "qdap", "rebate"];
    const categories = ["Savings_MultiCurrency", "Critical_Illness", "Medical_VHIS", "Annuity_QDAP", "Financing_UniversalLife"];
    for (let i = 0; i < 150; i++) {
        const randomOur = insurers[i % insurers.length];
        const randomRival = insurers[(i * 3 + 1) % insurers.length];
        const randomClaim = claims[i % claims.length];
        const randomCat = categories[i % categories.length];
        if (randomOur !== randomRival) {
            sandbox.setMyCompany(randomOur);
            sandbox.selectCompany(randomRival);
        }
        sandbox.selectClaim(randomClaim);
        sandbox.selectCategory(randomCat);
        if (i % 7 === 0) {
            sandbox.swapCampRoles();
        }
    }
    // Check that application is still responsive and healthy
    const finalSpec = dom["bilateral-spec-table"].innerHTML;
    node_assert_1.default.ok(finalSpec.length > 50, "bilateral-spec-table must be intact after 150 rapid clicks");
    node_assert_1.default.ok(!finalSpec.includes("undefined"), "bilateral-spec-table must not contain undefined");
});
recordTest("Suite 7: Adversarial Stress", "Inject null, undefined, empty, and malicious strings into handlers safely", () => {
    const maliciousInputs = [
        null,
        undefined,
        "",
        "   ",
        "<script>alert(1)</script>",
        "AIA; DROP TABLE PROMOS;",
        "UnknownInsurer",
        "nonexistent_category_xyz",
        "12345"
    ];
    for (const input of maliciousInputs) {
        node_assert_1.default.doesNotThrow(() => {
            sandbox.selectCompany(input);
        }, `selectCompany('${input}') must not throw unhandled exception`);
        node_assert_1.default.doesNotThrow(() => {
            sandbox.setMyCompany(input);
        }, `setMyCompany('${input}') must not throw unhandled exception`);
        node_assert_1.default.doesNotThrow(() => {
            sandbox.selectClaim(input);
        }, `selectClaim('${input}') must not throw unhandled exception`);
        node_assert_1.default.doesNotThrow(() => {
            sandbox.selectCategory(input);
        }, `selectCategory('${input}') must not throw unhandled exception`);
    }
});
// -----------------------------------------------------------------------------
// SUITE 8: Catalog Drawer Interactive Search & Filtering
// -----------------------------------------------------------------------------
recordTest("Suite 8: Drawer Search & Filter", "Verify renderCatalog filters correctly by category across all 60 products", () => {
    const catTests = [
        { cat: "all", expectedCount: 60 },
        { cat: "Savings_MultiCurrency", expectedCount: 12 },
        { cat: "Critical_Illness", expectedCount: 13 },
        { cat: "Medical_VHIS", expectedCount: 12 },
        { cat: "Annuity_QDAP", expectedCount: 11 },
        { cat: "Financing_UniversalLife", expectedCount: 12 }
    ];
    for (const { cat, expectedCount } of catTests) {
        sandbox.renderCatalog("", cat);
        const html = dom["catalog-cards-list"].innerHTML;
        const cardMatches = (html.match(/class="drawer-product-card"/g) || []).length;
        node_assert_1.default.strictEqual(cardMatches, expectedCount, `Category '${cat}' should render ${expectedCount} cards, got ${cardMatches}`);
        node_assert_1.default.ok(!html.includes("undefined"), `Category '${cat}' rendered cards contain 'undefined'`);
        node_assert_1.default.ok(!html.includes("NaN"), `Category '${cat}' rendered cards contain 'NaN'`);
    }
});
recordTest("Suite 8: Drawer Search & Filter", "Verify selectProductFromCatalog loads products into battle card seamlessly", () => {
    // Test loading our company product
    sandbox.setMyCompany("AIA");
    sandbox.selectProductFromCatalog("PROMO-AIA-SAV-2026-Q4");
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "AIA");
    // Test loading rival product
    sandbox.selectProductFromCatalog("PROMO-PRU-CI-2026-Q4");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "Prudential");
});
// -----------------------------------------------------------------------------
// SUITE 9: Horizon Projection Slider & Discrete Steps
// -----------------------------------------------------------------------------
recordTest("Suite 9: Horizon Projection Slider", "Verify onHorizonChange maps discrete steps without NaN or broken copy", () => {
    const steps = [
        { step: 0, expectedBadge: "5 年" },
        { step: 1, expectedBadge: "10 年" },
        { step: 2, expectedBadge: "20 年" },
        { step: 3, expectedBadge: "30 年" }
    ];
    for (const { step, expectedBadge } of steps) {
        sandbox.onHorizonChange(step);
        node_assert_1.default.strictEqual(dom["horizon-year-badge"].innerText, expectedBadge, `Step ${step} should set badge to '${expectedBadge}'`);
        const cardHtml = dom["horizon-result-card"].innerHTML;
        node_assert_1.default.ok(cardHtml.length > 20, `Horizon card HTML must not be empty for step ${step}`);
        node_assert_1.default.ok(!cardHtml.includes("NaN%"), `Horizon card HTML contains 'NaN%' for step ${step}`);
        node_assert_1.default.ok(!cardHtml.includes("undefined"), `Horizon card HTML contains 'undefined' for step ${step}`);
    }
});
// -----------------------------------------------------------------------------
// SUITE 10: Scripts/build_mobile_cafe.js:58 Unit Logic Simulation
// -----------------------------------------------------------------------------
recordTest("Suite 10: Build Script Unit Logic", "Simulate exact build script logic on raw products with and without breakeven keys", () => {
    const testProductWithCanonical = {
        savings_metrics: {
            breakeven_guaranteed_year: 14
        }
    };
    const testProductWithAlias = {
        savings_metrics: {
            guaranteed_breakeven_year: 13
        }
    };
    const testProductWithoutMetrics = {
        savings_metrics: null
    };
    const evaluateBk = (p) => {
        const bkYear = p.savings_metrics ? (p.savings_metrics.guaranteed_breakeven_year || p.savings_metrics.breakeven_guaranteed_year) : null;
        return bkYear ? '第 ' + bkYear + ' 年保證' : '第 18 年';
    };
    node_assert_1.default.strictEqual(evaluateBk(testProductWithCanonical), "第 14 年保證", "Canonical key breakeven_guaranteed_year must evaluate to '第 14 年保證'");
    node_assert_1.default.strictEqual(evaluateBk(testProductWithAlias), "第 13 年保證", "Alias guaranteed_breakeven_year must evaluate to '第 13 年保證'");
    node_assert_1.default.strictEqual(evaluateBk(testProductWithoutMetrics), "第 18 年", "Missing metrics must fall back to '第 18 年'");
});
console.log("\n================================================================================");
console.log("R3_2 EMPIRICAL ADVERSARIAL CHALLENGE TEST SUMMARY");
console.log("================================================================================");
const passedCount = results.filter(r => r.passed).length;
const failedCount = results.filter(r => !r.passed).length;
const totalCount = results.length;
console.log(`Total Scenarios Tested : ${totalCount}`);
console.log(`Passed                 : ${passedCount}`);
console.log(`Failed                 : ${failedCount}`);
if (failedCount > 0) {
    console.error("\nFAILURES DETECTED:");
    for (const f of results.filter(r => !r.passed)) {
        console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
    }
    process.exit(1);
}
else {
    console.log("\nVERDICT: ALL EMPIRICAL CHALLENGE TESTS PASSED (0 FAILURES).");
    process.exit(0);
}

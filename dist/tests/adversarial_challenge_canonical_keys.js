"use strict";
/**
 * Adversarial Challenger R2_1 - Canonical Key & Boundary Stress Suite
 *
 * Verifies:
 * 1. Resolution of canonical keys: 'ci', 'ul', 'vhis', 'rebate', 'financing_ul', 'prepayment', 'critical_illness', 'universal_life', 'financing', 'qdap'
 * 2. Idempotence across multiple normalization passes
 * 3. Case-insensitivity and whitespace padding on canonical keys
 * 4. Substring collision avoidance (e.g. 'financing_ul' containing 'ci')
 * 5. Exhaustive evaluation of all 9 insurers across all canonical key variants
 * 6. DOM reactive state updates when selectClaim is called directly with canonical keys
 * 7. Verification of all 3 resolved bugs from Worker 2 handoff:
 *    - Raw claim key resolution in getBattleCard
 *    - Interactive VHIS pill clicking
 *    - Global window.setViewMode exposure
 *    - AIA GN16 fulfillment ratio delta wording (no '差 0.0%')
 * 8. Asset synchronization parity: templates/mobile_cafe_app.html === dist/index.html === dist/cafe.html
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
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
console.log("ADVERSARIAL STRESS SUITE: CANONICAL KEY INPUTS & EDGE CASES");
console.log("Target: templates/mobile_cafe_app.html & DOM Event Loop");
console.log("================================================================================");
const cafePath = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
node_assert_1.default.ok(fs_1.default.existsSync(cafePath), "templates/mobile_cafe_app.html must exist");
const cafeHtml = fs_1.default.readFileSync(cafePath, "utf-8");
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
// SUITE 1: Canonical Key Resolution & Normalization Map
// -----------------------------------------------------------------------------
recordTest("Suite 1: Canonical Mapping", "Verify exact normalization for all canonical keys and abbreviations", () => {
    const mappings = [
        ["ci", "critical_illness"],
        ["critical_illness", "critical_illness"],
        ["ul", "financing_ul"],
        ["universal_life", "financing_ul"],
        ["financing", "financing_ul"],
        ["financing_ul", "financing_ul"],
        ["vhis", "vhis"],
        ["rebate", "rebate"],
        ["prepayment", "prepayment"],
        ["qdap", "qdap"]
    ];
    for (const [input, expected] of mappings) {
        const resolved = sandbox.normalizeClaim(input);
        node_assert_1.default.strictEqual(resolved, expected, `normalizeClaim('${input}') must resolve to '${expected}', got '${resolved}'`);
    }
});
recordTest("Suite 1: Canonical Mapping", "Verify multi-pass normalization idempotence (1x, 2x, 3x passes)", () => {
    const testKeys = ["ci", "ul", "vhis", "rebate", "financing_ul", "prepayment", "critical_illness", "qdap", "universal_life", "financing"];
    for (const key of testKeys) {
        const pass1 = sandbox.normalizeClaim(key);
        const pass2 = sandbox.normalizeClaim(pass1);
        const pass3 = sandbox.normalizeClaim(pass2);
        node_assert_1.default.strictEqual(pass2, pass1, `Idempotence failed on pass 2 for '${key}': '${pass2}' !== '${pass1}'`);
        node_assert_1.default.strictEqual(pass3, pass1, `Idempotence failed on pass 3 for '${key}': '${pass3}' !== '${pass1}'`);
    }
});
recordTest("Suite 1: Canonical Mapping", "Verify uppercase, whitespace, and newline variations of canonical keys", () => {
    const variations = [
        ["  ci  ", "critical_illness"],
        ["CI", "critical_illness"],
        ["\n\tCi\r\n", "critical_illness"],
        ["  ul  ", "financing_ul"],
        ["UL", "financing_ul"],
        ["\r\nUl\t", "financing_ul"],
        ["  vhis  ", "vhis"],
        ["VHIS", "vhis"],
        ["VhIs", "vhis"],
        ["  rebate  ", "rebate"],
        ["REBATE", "rebate"],
        ["Rebate", "rebate"],
        ["  financing_ul  ", "financing_ul"],
        ["FINANCING_UL", "financing_ul"],
        ["Financing_Ul", "financing_ul"],
        ["  prepayment  ", "prepayment"],
        ["PREPAYMENT", "prepayment"],
        ["  qdap  ", "qdap"],
        ["QDAP", "qdap"]
    ];
    for (const [input, expected] of variations) {
        const resolved = sandbox.normalizeClaim(input);
        node_assert_1.default.strictEqual(resolved, expected, `normalizeClaim('${input}') must resolve to '${expected}', got '${resolved}'`);
    }
});
recordTest("Suite 1: Canonical Mapping", "Verify substring collision isolation: financing_ul must NOT resolve to critical_illness", () => {
    // 'financing' contains 'ci'
    const resolvedFinancing = sandbox.normalizeClaim("financing");
    node_assert_1.default.strictEqual(resolvedFinancing, "financing_ul", "'financing' must NOT resolve to critical_illness");
    const resolvedFinancingUl = sandbox.normalizeClaim("financing_ul");
    node_assert_1.default.strictEqual(resolvedFinancingUl, "financing_ul", "'financing_ul' must NOT resolve to critical_illness");
    const resolvedCi = sandbox.normalizeClaim("ci");
    node_assert_1.default.strictEqual(resolvedCi, "critical_illness", "'ci' must resolve to critical_illness");
    const resolvedUl = sandbox.normalizeClaim("ul");
    node_assert_1.default.strictEqual(resolvedUl, "financing_ul", "'ul' must resolve to financing_ul");
});
// -----------------------------------------------------------------------------
// SUITE 2: Semantic Correctness across All 9 Insurers for Canonical Keys
// -----------------------------------------------------------------------------
const ALL_INSURERS = [
    "Prudential",
    "AIA",
    "Manulife",
    "Sun Life",
    "FWD",
    "AXA",
    "Bowtie",
    "BOC Life",
    "YF Life"
];
recordTest("Suite 2: Semantic Cards", "Verify 'ci' canonical key returns valid Critical Illness battle card for all 9 insurers", () => {
    for (const ins of ALL_INSURERS) {
        const card = sandbox.getBattleCard(ins, "ci");
        node_assert_1.default.ok(card, `Card must exist for ${ins} x ci`);
        if (ins === "Bowtie") {
            node_assert_1.default.ok(card.agent_title.includes("早期危疾") || card.agent_title.includes("癌症"), `Bowtie CI card title must mention 早期危疾 or 癌症, got: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("每年續保") || card.agent_step_2.includes("自然費率"), `Bowtie CI step 2 must mention 每年續保 / 自然費率`);
        }
        else {
            node_assert_1.default.ok(card.agent_title.includes("癌症") || card.agent_title.includes("危疾"), `${ins} CI card title must mention 癌症 or 危疾, got: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("3 年") && card.agent_step_2.includes("空窗期"), `${ins} CI step 2 must mention 3 年空窗期`);
        }
        node_assert_1.default.ok(card.chart_bars.length >= 2, `${ins} chart_bars length >= 2`);
        node_assert_1.default.ok(card.table_rows.length >= 3, `${ins} table_rows length >= 3`);
    }
});
recordTest("Suite 2: Semantic Cards", "Verify 'ul' canonical key returns valid Financing UL battle card for all 9 insurers", () => {
    for (const ins of ALL_INSURERS) {
        const card = sandbox.getBattleCard(ins, "ul");
        node_assert_1.default.ok(card, `Card must exist for ${ins} x ul`);
        if (ins === "Bowtie") {
            node_assert_1.default.ok(card.agent_title.includes("私銀保費融資 (UL)"), `Bowtie UL card title must mention 私銀保費融資 (UL), got: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("未設有任何針對虛擬保單的保費融資通道"), `Bowtie UL step 2 must explain lack of financing channel`);
        }
        else {
            node_assert_1.default.ok(card.agent_title.includes("85%") || card.agent_title.includes("融資"), `${ins} UL card title must mention 85% or 融資, got: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("Prime Rate") || card.agent_step_2.includes("息口") || card.agent_step_2.includes("加息"), `${ins} UL step 2 must mention interest rate risk`);
        }
    }
});
recordTest("Suite 2: Semantic Cards", "Verify 'vhis' canonical key returns valid VHIS battle card for all 9 insurers", () => {
    for (const ins of ALL_INSURERS) {
        const card = sandbox.getBattleCard(ins, "vhis");
        node_assert_1.default.ok(card, `Card must exist for ${ins} x vhis`);
        if (ins === "Bowtie") {
            node_assert_1.default.ok(card.agent_title.includes("自願醫保線上自主申報") || card.agent_title.includes("出院免找數"), `Bowtie VHIS card title mismatch: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("Chatbot") || card.agent_step_2.includes("自己先找數"), `Bowtie VHIS step 2 mismatch`);
        }
        else {
            node_assert_1.default.ok(card.agent_title.includes("標靶藥") || card.agent_title.includes("特約網絡") || card.agent_title.includes("自願醫保"), `${ins} VHIS card title mismatch: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("標靶藥") || card.agent_step_2.includes("網絡"), `${ins} VHIS step 2 mismatch`);
        }
    }
});
recordTest("Suite 2: Semantic Cards", "Verify 'rebate' canonical key returns valid Rebate battle card for all 9 insurers", () => {
    for (const ins of ALL_INSURERS) {
        const card = sandbox.getBattleCard(ins, "rebate");
        node_assert_1.default.ok(card, `Card must exist for ${ins} x rebate`);
        if (ins === "Bowtie") {
            node_assert_1.default.ok(card.agent_title.includes("直銷") || card.agent_title.includes("保費架構"), `Bowtie rebate card title mismatch: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("消費型") || card.agent_step_2.includes("現金價值"), `Bowtie rebate step 2 mismatch`);
        }
        else {
            node_assert_1.default.ok(card.agent_title.includes("28%") || card.agent_title.includes("回贈"), `${ins} rebate card title mismatch: ${card.agent_title}`);
            node_assert_1.default.ok(card.agent_step_2.includes("鎖定期") || card.agent_step_2.includes("回贈"), `${ins} rebate step 2 mismatch`);
        }
    }
});
recordTest("Suite 2: Semantic Cards", "Verify 'financing_ul' canonical key returns valid Financing UL battle card for all 9 insurers", () => {
    for (const ins of ALL_INSURERS) {
        const card = sandbox.getBattleCard(ins, "financing_ul");
        node_assert_1.default.ok(card, `Card must exist for ${ins} x financing_ul`);
        if (ins === "Bowtie") {
            node_assert_1.default.ok(card.agent_title.includes("私銀保費融資 (UL)"), `Bowtie financing_ul mismatch: ${card.agent_title}`);
        }
        else {
            node_assert_1.default.ok(card.agent_title.includes("85%") || card.agent_title.includes("融資"), `${ins} financing_ul mismatch: ${card.agent_title}`);
        }
    }
});
// -----------------------------------------------------------------------------
// SUITE 3: Interactive DOM Simulation with Canonical Keys
// -----------------------------------------------------------------------------
recordTest("Suite 3: DOM Canonical Interaction", "Simulate selectClaim('ci') updating pill active class and DOM content", () => {
    const { sandbox: box } = createSandbox();
    const dom = box.__domElements;
    const claimPills = box.__claimPills;
    box.selectClaim("ci");
    const ciPill = claimPills.find((p) => p.innerText.includes("癌症"));
    node_assert_1.default.ok(ciPill, "CI pill must exist");
    node_assert_1.default.ok(ciPill.classList.contains("active"), "CI pill must have active class after selectClaim('ci')");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("癌症") || dom["agent-title"].innerHTML.includes("危疾"), `DOM agent-title must update to CI card, got: '${dom["agent-title"].innerHTML}'`);
});
recordTest("Suite 3: DOM Canonical Interaction", "Simulate selectClaim('ul') updating pill active class and DOM content", () => {
    const { sandbox: box } = createSandbox();
    const dom = box.__domElements;
    const claimPills = box.__claimPills;
    box.selectClaim("ul");
    const ulPill = claimPills.find((p) => p.innerText.includes("85%"));
    node_assert_1.default.ok(ulPill, "UL pill must exist");
    node_assert_1.default.ok(ulPill.classList.contains("active"), "UL pill must have active class after selectClaim('ul')");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("85%") || dom["agent-title"].innerHTML.includes("融資"), `DOM agent-title must update to UL card, got: '${dom["agent-title"].innerHTML}'`);
});
recordTest("Suite 3: DOM Canonical Interaction", "Simulate selectClaim('vhis') updating pill active class and DOM content", () => {
    const { sandbox: box } = createSandbox();
    const dom = box.__domElements;
    const claimPills = box.__claimPills;
    box.selectClaim("vhis");
    const vhisPill = claimPills.find((p) => p.innerText.includes("自願醫保"));
    node_assert_1.default.ok(vhisPill, "VHIS pill must exist");
    node_assert_1.default.ok(vhisPill.classList.contains("active"), "VHIS pill must have active class after selectClaim('vhis')");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("自願醫保") || dom["agent-title"].innerHTML.includes("標靶藥"), `DOM agent-title must update to VHIS card, got: '${dom["agent-title"].innerHTML}'`);
});
recordTest("Suite 3: DOM Canonical Interaction", "Simulate selectClaim('rebate') updating pill active class and DOM content", () => {
    const { sandbox: box } = createSandbox();
    const dom = box.__domElements;
    const claimPills = box.__claimPills;
    box.selectClaim("rebate");
    const rebatePill = claimPills.find((p) => p.innerText.includes("28%"));
    node_assert_1.default.ok(rebatePill, "Rebate pill must exist");
    node_assert_1.default.ok(rebatePill.classList.contains("active"), "Rebate pill must have active class after selectClaim('rebate')");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("28%") || dom["agent-title"].innerHTML.includes("回贈"), `DOM agent-title must update to Rebate card, got: '${dom["agent-title"].innerHTML}'`);
});
recordTest("Suite 3: DOM Canonical Interaction", "Simulate selectClaim('financing_ul') updating pill active class and DOM content", () => {
    const { sandbox: box } = createSandbox();
    const dom = box.__domElements;
    const claimPills = box.__claimPills;
    box.selectClaim("financing_ul");
    const ulPill = claimPills.find((p) => p.innerText.includes("85%"));
    node_assert_1.default.ok(ulPill, "UL pill must exist");
    node_assert_1.default.ok(ulPill.classList.contains("active"), "UL pill must have active class after selectClaim('financing_ul')");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("85%") || dom["agent-title"].innerHTML.includes("融資"), `DOM agent-title must update to UL card, got: '${dom["agent-title"].innerHTML}'`);
});
// -----------------------------------------------------------------------------
// SUITE 4: Specific Regression Validations
// -----------------------------------------------------------------------------
recordTest("Suite 4: Regression Checks", "Verify AIA GN16 delta calculation does NOT render '差 0.0%'", () => {
    const card = sandbox.getBattleCard("友邦 AIA", "5.8% 預繳");
    node_assert_1.default.ok(!card.agent_step_3.includes("差 0.0%"), "AIA step 3 must not render '差 0.0%'");
    node_assert_1.default.ok(card.agent_step_3.includes("雖同樣達 96.5%"), "AIA step 3 must articulate equal fulfillment parity and product flexibility");
    node_assert_1.default.ok(card.agent_step_3.includes("9種貨幣轉換"), "AIA step 3 must mention 9-currency conversion");
});
recordTest("Suite 4: Regression Checks", "Verify window.setViewMode is exposed globally in window", () => {
    const { sandbox: box } = createSandbox();
    node_assert_1.default.strictEqual(typeof box.window.setViewMode, "function", "window.setViewMode must be a function on window");
    node_assert_1.default.strictEqual(typeof box.window.selectCompany, "function", "window.selectCompany must be a function on window");
    node_assert_1.default.strictEqual(typeof box.window.selectClaim, "function", "window.selectClaim must be a function on window");
    node_assert_1.default.strictEqual(typeof box.window.updateBattleCard, "function", "window.updateBattleCard must be a function on window");
    node_assert_1.default.strictEqual(typeof box.window.getBattleCard, "function", "window.getBattleCard must be a function on window");
});
recordTest("Suite 4: Regression Checks", "Verify asset parity (templates/mobile_cafe_app.html === dist/index.html === dist/cafe.html)", () => {
    const distIndex = path_1.default.join(process.cwd(), "dist", "index.html");
    const distCafe = path_1.default.join(process.cwd(), "dist", "cafe.html");
    node_assert_1.default.ok(fs_1.default.existsSync(distIndex), "dist/index.html must exist");
    node_assert_1.default.ok(fs_1.default.existsSync(distCafe), "dist/cafe.html must exist");
    const cafeContent = fs_1.default.readFileSync(cafePath, "utf-8");
    const indexContent = fs_1.default.readFileSync(distIndex, "utf-8");
    const distCafeContent = fs_1.default.readFileSync(distCafe, "utf-8");
    node_assert_1.default.strictEqual(cafeContent, indexContent, "templates/mobile_cafe_app.html must be identical to dist/index.html");
    node_assert_1.default.strictEqual(indexContent, distCafeContent, "dist/index.html must be identical to dist/cafe.html");
});
// -----------------------------------------------------------------------------
// SUITE 5: 90 Combinatorial Stress (9 Insurers x 10 Canonical Aliases) & Rapid DOM Switching
// -----------------------------------------------------------------------------
recordTest("Suite 5: 90 Canonical Combinations", "Exhaustive evaluation of 9 insurers x 10 canonical aliases (90 pairs)", () => {
    const aliases = ["ci", "ul", "vhis", "rebate", "financing_ul", "financing", "universal_life", "prepayment", "critical_illness", "qdap"];
    let count = 0;
    for (const ins of ALL_INSURERS) {
        for (const alias of aliases) {
            count++;
            const card = sandbox.getBattleCard(ins, alias);
            node_assert_1.default.ok(card, `Card must be returned for ${ins} x ${alias}`);
            // Verify all required text fields are clean non-empty strings
            const requiredFields = [
                "agent_title",
                "agent_step_1",
                "agent_step_2",
                "agent_step_3",
                "client_title",
                "client_source",
                "client_desc",
                "whatsapp_script",
                "disclaimer"
            ];
            for (const f of requiredFields) {
                node_assert_1.default.strictEqual(typeof card[f], "string", `${f} must be string in ${ins} x ${alias}`);
                node_assert_1.default.ok(card[f].trim().length >= 5, `${f} must have length >= 5 in ${ins} x ${alias}`);
            }
            // Deep scan for forbidden substrings
            const json = JSON.stringify(card);
            node_assert_1.default.ok(!json.includes("undefined"), `Forbidden 'undefined' in ${ins} x ${alias}`);
            node_assert_1.default.ok(!json.includes("null"), `Forbidden 'null' in ${ins} x ${alias}`);
            node_assert_1.default.ok(!json.includes("NaN"), `Forbidden 'NaN' in ${ins} x ${alias}`);
            node_assert_1.default.ok(!json.includes("NaN%"), `Forbidden 'NaN%' in ${ins} x ${alias}`);
            node_assert_1.default.ok(!json.includes("[object Object]"), `Forbidden '[object Object]' in ${ins} x ${alias}`);
            // Check chart_bars integrity
            node_assert_1.default.ok(Array.isArray(card.chart_bars) && card.chart_bars.length >= 2, `chart_bars valid in ${ins} x ${alias}`);
            for (const bar of card.chart_bars) {
                node_assert_1.default.ok(bar.label.trim().length > 0, `Bar label must be non-empty in ${ins} x ${alias}`);
                node_assert_1.default.ok(bar.value.trim().length > 0, `Bar value must be non-empty in ${ins} x ${alias}`);
                node_assert_1.default.strictEqual(typeof bar.widthPct, "number", `widthPct must be number in ${ins} x ${alias}`);
                node_assert_1.default.ok(Number.isFinite(bar.widthPct), `widthPct must be finite in ${ins} x ${alias}`);
                node_assert_1.default.ok(bar.widthPct > 0 && bar.widthPct <= 100, `widthPct must be in (0, 100], got ${bar.widthPct} in ${ins} x ${alias}`);
            }
            // Check table_rows integrity
            node_assert_1.default.ok(Array.isArray(card.table_rows) && card.table_rows.length >= 3, `table_rows valid in ${ins} x ${alias}`);
            for (const row of card.table_rows) {
                node_assert_1.default.ok(row.label.trim().length > 0, `Row label must be non-empty in ${ins} x ${alias}`);
                node_assert_1.default.ok(row.value.trim().length > 0, `Row value must be non-empty in ${ins} x ${alias}`);
                node_assert_1.default.strictEqual(typeof row.highlight, "boolean", `Row highlight must be boolean in ${ins} x ${alias}`);
            }
        }
    }
    node_assert_1.default.strictEqual(count, 90, "Must test exactly 90 insurer x canonical alias combinations");
});
recordTest("Suite 5: Rapid DOM Switching", "Simulate rapid consecutive user toggling across all canonical keys and companies", () => {
    const { sandbox: box } = createSandbox();
    const dom = box.__domElements;
    const companyPills = box.__companyPills;
    const claimPills = box.__claimPills;
    const sequence = [
        { comp: "AIA", clm: "ci" },
        { comp: "Bowtie", clm: "vhis" },
        { comp: "Prudential", clm: "ul" },
        { comp: "Manulife", clm: "rebate" },
        { comp: "Sun Life", clm: "financing_ul" },
        { comp: "FWD", clm: "qdap" },
        { comp: "AXA", clm: "prepayment" },
        { comp: "BOC Life", clm: "ci" },
        { comp: "YF Life", clm: "universal_life" }
    ];
    for (const step of sequence) {
        box.selectCompany(step.comp);
        box.selectClaim(step.clm);
        // Verify exactly one company pill is active
        const activeComps = companyPills.filter((p) => p.classList.contains("active"));
        node_assert_1.default.strictEqual(activeComps.length, 1, `Exactly 1 company pill must be active for ${step.comp}`);
        // Verify exactly one claim pill is active
        const activeClaims = claimPills.filter((p) => p.classList.contains("active"));
        node_assert_1.default.strictEqual(activeClaims.length, 1, `Exactly 1 claim pill must be active for ${step.clm}`);
        // Verify DOM title is updated without errors
        node_assert_1.default.ok(dom["agent-title"].innerHTML.length > 5, "agent-title must be populated");
        node_assert_1.default.ok(!dom["agent-title"].innerHTML.includes("undefined"), "agent-title must not contain undefined");
    }
});
recordTest("Suite 5: Malformed Inputs Resiliency", "Verify malformed and exotic input types gracefully fallback to prepayment without crashing", () => {
    const malformedInputs = [
        null,
        undefined,
        "",
        "   ",
        0,
        -1,
        999999,
        false,
        true,
        NaN,
        Infinity,
        {},
        [],
        "random_unrecognized_key_xyz",
        "<script>alert('xss')</script>"
    ];
    for (const bad of malformedInputs) {
        node_assert_1.default.doesNotThrow(() => {
            const normalized = sandbox.normalizeClaim(bad);
            node_assert_1.default.strictEqual(typeof normalized, "string", "Must return string");
            node_assert_1.default.ok(normalized.length > 0, "Normalized key must not be empty");
            const card = sandbox.getBattleCard("AIA", bad);
            node_assert_1.default.ok(card, "Must return valid battle card even for malformed claim input");
            node_assert_1.default.ok(typeof card.agent_title === "string" && card.agent_title.length > 0, "agent_title must be valid string");
        }, `Failed on malformed input: ${JSON.stringify(bad)}`);
    }
});
recordTest("Suite 6: 60-Product Market Catalog in Mobile Battle Card", "Verify window.ALL_PRODUCTS_CATALOG has exactly 60 products and no corrupted HK,000 strings", () => {
    const catalog = sandbox.ALL_PRODUCTS_CATALOG || sandbox.window.ALL_PRODUCTS_CATALOG;
    node_assert_1.default.ok(Array.isArray(catalog), "ALL_PRODUCTS_CATALOG must be an array");
    node_assert_1.default.strictEqual(catalog.length, 60, "ALL_PRODUCTS_CATALOG must contain exactly 60 products");
    const catCounts = {};
    for (const item of catalog) {
        catCounts[item.category] = (catCounts[item.category] || 0) + 1;
        node_assert_1.default.ok(item.id, "Product must have an id");
        node_assert_1.default.ok(item.name, "Product must have a name");
        node_assert_1.default.ok(item.insurer, "Product must have an insurer");
        node_assert_1.default.ok(item.highlight, "Product must have a highlight");
        node_assert_1.default.ok(!item.highlight.includes("HK,000"), `Corrupted 'HK,000' found in product ${item.id}: ${item.highlight}`);
    }
    node_assert_1.default.strictEqual(catCounts["Savings_MultiCurrency"], 12, "Expected 12 Savings products");
    node_assert_1.default.strictEqual(catCounts["Critical_Illness"], 13, "Expected 13 CI products");
    node_assert_1.default.strictEqual(catCounts["Medical_VHIS"], 12, "Expected 12 VHIS products");
    node_assert_1.default.strictEqual(catCounts["Annuity_QDAP"], 11, "Expected 11 QDAP products");
    node_assert_1.default.strictEqual(catCounts["Financing_UniversalLife"], 12, "Expected 12 UL products");
    const qdapItems = catalog.filter((x) => x.category === "Annuity_QDAP");
    for (const q of qdapItems) {
        node_assert_1.default.ok(q.highlight.includes("HK$60,000"), `QDAP highlight must contain HK$60,000. Got: ${q.highlight}`);
    }
});
recordTest("Suite 7: Horizon Slider & Snap Precision", "Verify horizon slider maps discrete steps and displays valid projections", () => {
    const card = sandbox.getBattleCard("Prudential", "prepayment");
    node_assert_1.default.ok(card.horizon_data, "Battle card must contain horizon_data");
    const expectedYears = [5, 10, 15, 20, 25, 30];
    for (const yr of expectedYears) {
        node_assert_1.default.ok(card.horizon_data[yr], `horizon_data must have copy for year ${yr}`);
        node_assert_1.default.ok(card.horizon_data[yr].includes(`第 ${yr} 年`), `Year ${yr} copy must explicitly reference 第 ${yr} 年`);
    }
    // Test onHorizonChange index mapping
    sandbox.onHorizonChange(0);
    node_assert_1.default.strictEqual(dom["horizon-year-badge"].innerText, "5 年");
    node_assert_1.default.ok(dom["horizon-result-card"].innerHTML.includes("第 5 年動態利益投影"));
    sandbox.onHorizonChange(1);
    node_assert_1.default.strictEqual(dom["horizon-year-badge"].innerText, "10 年");
    node_assert_1.default.ok(dom["horizon-result-card"].innerHTML.includes("第 10 年動態利益投影"));
    sandbox.onHorizonChange(2);
    node_assert_1.default.strictEqual(dom["horizon-year-badge"].innerText, "20 年");
    node_assert_1.default.ok(dom["horizon-result-card"].innerHTML.includes("第 20 年動態利益投影"));
    sandbox.onHorizonChange(3);
    node_assert_1.default.strictEqual(dom["horizon-year-badge"].innerText, "30 年");
    node_assert_1.default.ok(dom["horizon-result-card"].innerHTML.includes("第 30 年動態利益投影"));
    // Test direct year input
    sandbox.onHorizonChange(15);
    node_assert_1.default.strictEqual(dom["horizon-year-badge"].innerText, "15 年");
    node_assert_1.default.ok(dom["horizon-result-card"].innerHTML.includes("第 15 年動態利益投影"));
});
recordTest("Suite 8: Category Selector Alias Normalization", "Verify selectCategory correctly normalizes aliases and updates DOM", () => {
    const aliases = [
        { key: "ci", expected: "critical_illness" },
        { key: "Critical_Illness", expected: "critical_illness" },
        { key: "vhis", expected: "vhis" },
        { key: "Medical_VHIS", expected: "vhis" },
        { key: "qdap", expected: "qdap" },
        { key: "Annuity_QDAP", expected: "qdap" },
        { key: "ul", expected: "financing_ul" },
        { key: "Financing_UniversalLife", expected: "financing_ul" },
        { key: "savings", expected: "prepayment" },
        { key: "Savings_MultiCurrency", expected: "prepayment" }
    ];
    for (const item of aliases) {
        sandbox.selectCategory(item.key);
        const card = sandbox.getBattleCard("Prudential", item.expected);
        node_assert_1.default.strictEqual(dom["agent-title"].innerHTML, card.agent_title, `selectCategory('${item.key}') should resolve to ${item.expected}`);
    }
});
recordTest("Suite 9: Swiss Slides Slide 3 Category Switching & Web Audio Synthesizer", "Verify Slide 3 category navigation and Web Audio chime script", () => {
    const slidesPath = path_1.default.join(process.cwd(), "templates", "morning_slides.html");
    node_assert_1.default.ok(fs_1.default.existsSync(slidesPath), "templates/morning_slides.html must exist");
    const slidesHtml = fs_1.default.readFileSync(slidesPath, "utf-8");
    // Check switchMatrixCategory navigates to slide 4 for ci and vhis
    node_assert_1.default.ok(slidesHtml.includes("cat === 'ci' || cat === 'vhis'"), "switchMatrixCategory must handle ci and vhis");
    node_assert_1.default.ok(slidesHtml.includes("go(3)"), "switchMatrixCategory must navigate to go(3) for ci/vhis");
    node_assert_1.default.ok(slidesHtml.includes("go(4)"), "switchMatrixCategory must navigate to go(4) for qdap");
    node_assert_1.default.ok(slidesHtml.includes("go(5)"), "switchMatrixCategory must navigate to go(5) for ul");
    // Check Web Audio synthesizer code exists
    node_assert_1.default.ok(slidesHtml.includes("AudioContext"), "morning_slides.html must implement AudioContext");
    node_assert_1.default.ok(slidesHtml.includes("playChime"), "morning_slides.html must implement playChime");
});
recordTest("Suite 10: My Company Selection & Persistence", "Verify setMyCompany updates state, DOM select, product display, and localStorage persistence", () => {
    // 1. Initial default state
    sandbox.setMyCompany("AIA");
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "AIA", "Default myCompany should be AIA");
    node_assert_1.default.strictEqual(dom["select-my-insurer"].value, "AIA", "select-my-insurer DOM value must be AIA");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "盈御多元貨幣計劃 3", "AIA Savings flagship must be displayed");
    // 2. Switch to Manulife
    sandbox.setMyCompany("Manulife");
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "Manulife", "myCompany must switch to Manulife");
    node_assert_1.default.strictEqual(dom["select-my-insurer"].value, "Manulife", "select-my-insurer DOM must reflect Manulife");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "宏摯多元儲蓄計劃", "Manulife Savings flagship must be displayed");
    // Verify persistence in localStorage
    const saved = sandbox.localStorage.getItem("insurintel_my_insurer");
    node_assert_1.default.ok(saved && (saved.includes("Manulife") || saved.includes("宏利")), `localStorage must persist Manulife, got: ${saved}`);
    // 3. Switch myCompany to currently selected rival (avoid self-matchup)
    sandbox.selectCompany("Prudential");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "Prudential");
    sandbox.setMyCompany("Prudential");
    // Rival should automatically flip away from Prudential to AIA
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "Prudential");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "AIA", "Rival must auto-flip away from Prudential to avoid self-matchup");
    // 4. Object/target element input simulation
    sandbox.setMyCompany({ value: "FWD" });
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "FWD", "setMyCompany should accept object with value");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "盈豐多元貨幣儲蓄保險", "FWD flagship should display");
});
recordTest("Suite 11: Swap Roles & Bilateral Stance Symmetry", "Verify swapCampRoles exchanges roles, updates DOM, and adapts attack stance symmetrically", () => {
    // Set initial baseline: AIA (Our) vs Prudential (Rival) on Prepayment
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    sandbox.selectClaim("prepayment");
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "AIA");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "Prudential");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("保誠"), "AIA title against Prudential must target Prudential");
    // 1. Swap roles: Prudential becomes Our Company, AIA becomes Rival
    sandbox.swapCampRoles();
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "Prudential", "myCompany must become Prudential after swap");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "AIA", "rivalCompany must become AIA after swap");
    node_assert_1.default.strictEqual(dom["select-my-insurer"].value, "Prudential", "select-my-insurer must update to Prudential");
    node_assert_1.default.strictEqual(dom["select-rival-insurer"].value, "AIA", "select-rival-insurer must update to AIA");
    node_assert_1.default.strictEqual(dom["toast"].style.display, "block", "Toast notification must display upon role swap");
    node_assert_1.default.ok(dom["toast"].innerText.includes("攻防已對調"), "Toast text must announce role swap");
    // 2. Verify stance-aware pitch change
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("友邦"), "Prudential title against AIA must target AIA");
    node_assert_1.default.ok(dom["agent-step-3"].innerHTML.includes("實時落袋確定性") ||
        dom["agent-step-3"].innerHTML.includes("真金白銀第一年就慳返幾皮嘢保費"), "Prudential step 3 against AIA must attack upfront cash certainty");
    // 3. Verify Bilateral Spec Table rendered Plan A as Prudential, Plan B as AIA
    const specTableHtml = dom["bilateral-spec-table"].innerHTML;
    node_assert_1.default.ok(specTableHtml.includes("Plan A (我方)"), "Spec table must include Plan A");
    node_assert_1.default.ok(specTableHtml.includes("Plan B (對手)"), "Spec table must include Plan B");
    node_assert_1.default.ok(specTableHtml.includes("首年保費回贈"), "Spec table must include rebate metric");
    node_assert_1.default.ok(specTableHtml.includes("預繳保證利率"), "Spec table must include prepay metric");
    // 4. Swap roles back: AIA restores to Our Company
    sandbox.swapCampRoles();
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "AIA", "myCompany must restore to AIA");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "Prudential", "rivalCompany must restore to Prudential");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("保誠"), "AIA title against Prudential must restore");
});
recordTest("Suite 12: 72 Bilateral Cross-Insurer Combinations", "Exhaustive evaluation of all 9 insurers x 8 rivals (72 combinations) across all canonical claims", () => {
    const insurers = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    const canonicalClaims = ["prepayment", "ci", "vhis", "financing_ul", "qdap"];
    let evaluatedPairs = 0;
    for (const ourComp of insurers) {
        for (const rivalComp of insurers) {
            if (ourComp === rivalComp)
                continue; // Skip self vs self
            evaluatedPairs++;
            for (const claimKey of canonicalClaims) {
                const card = sandbox.getBattleCard(ourComp, rivalComp, claimKey);
                node_assert_1.default.ok(card, `Battle card for [${ourComp}] vs [${rivalComp}] on [${claimKey}] must exist`);
                // String sanity
                node_assert_1.default.ok(card.agent_title && card.agent_title.length > 5, `[${ourComp}] vs [${rivalComp}] agent_title must be valid`);
                node_assert_1.default.ok(card.agent_step_1 && card.agent_step_1.length > 5, `[${ourComp}] vs [${rivalComp}] agent_step_1 must be valid`);
                node_assert_1.default.ok(card.agent_step_2 && card.agent_step_2.length > 5, `[${ourComp}] vs [${rivalComp}] agent_step_2 must be valid`);
                node_assert_1.default.ok(card.agent_step_3 && card.agent_step_3.length > 5, `[${ourComp}] vs [${rivalComp}] agent_step_3 must be valid`);
                node_assert_1.default.ok(card.whatsapp_script && card.whatsapp_script.length > 10, `[${ourComp}] vs [${rivalComp}] whatsapp_script must be valid`);
                // Bilateral specs
                node_assert_1.default.ok(Array.isArray(card.bilateral_specs), `[${ourComp}] vs [${rivalComp}] bilateral_specs must be array`);
                node_assert_1.default.strictEqual(card.bilateral_specs.length, 6, `[${ourComp}] vs [${rivalComp}] bilateral_specs must have 6 rows`);
                // Corridor data
                node_assert_1.default.ok(card.corridor_our && card.corridor_our.length > 0, `[${ourComp}] vs [${rivalComp}] corridor_our must exist`);
                node_assert_1.default.ok(card.corridor_rival && card.corridor_rival.length > 0, `[${ourComp}] vs [${rivalComp}] corridor_rival must exist`);
                // Disallow corrupted strings
                const jsonStr = JSON.stringify(card);
                node_assert_1.default.ok(!jsonStr.includes("undefined"), `[${ourComp}] vs [${rivalComp}] on [${claimKey}] contains 'undefined'`);
                node_assert_1.default.ok(!jsonStr.includes("NaN%"), `[${ourComp}] vs [${rivalComp}] on [${claimKey}] contains 'NaN%'`);
            }
        }
    }
    node_assert_1.default.strictEqual(evaluatedPairs, 72, "Must evaluate exactly 72 insurer pairs (9 x 8)");
});
// -----------------------------------------------------------------------------
// SUITE 13: Adversarial Role-Swap Concurrency & Exotic Fallbacks
// -----------------------------------------------------------------------------
recordTest("Suite 13: Rapid Role Swap & Category Interleaving", "Simulate rapid consecutive swapCampRoles interleaved with category changes without row dropping", () => {
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    const categories = ["Savings_MultiCurrency", "Critical_Illness", "Medical_VHIS", "Annuity_QDAP", "Financing_UniversalLife"];
    const expectedLabelsByCat = {
        Savings_MultiCurrency: ["首年保費回贈", "預繳保證利率", "GN16 實現率", "保證回本年期", "30年預期複利 IRR", "核心條款亮點"],
        Critical_Illness: ["首年保費折扣", "癌症再次索償等待期", "涵蓋嚴重疾病總數", "多次索償賠償總上限", "深切治療部 (ICU) 預支", "核心條款亮點"],
        Medical_VHIS: ["首年保費回贈", "全年保障限額", "非手術癌症標靶治療", "出院免找數 (Cashless) 直付", "每年法定稅務扣除額", "核心條款亮點"],
        Annuity_QDAP: ["首年保費回贈", "每年實質慳稅額", "保證內部回報率 IRR", "QDAP 總內部回報率 IRR", "保證年金利益佔比", "核心條款亮點"],
        Financing_UniversalLife: ["最高融資成數 LTV", "最低保證結算利率 (Floor)", "當前結算利率 (Crediting)", "融資借貸淨息差 (Spread)", "追加保證金 (Margin Call) 緩衝", "核心條款亮點"]
    };
    for (let cycle = 0; cycle < 10; cycle++) {
        const cat = categories[cycle % categories.length];
        sandbox.selectCategory(cat);
        sandbox.swapCampRoles();
        const specTableHtml = dom["bilateral-spec-table"].innerHTML;
        node_assert_1.default.ok(specTableHtml.length > 50, `Spec table must not be empty during cycle ${cycle}`);
        node_assert_1.default.ok(!specTableHtml.includes("undefined"), `Spec table must not contain undefined in cycle ${cycle}`);
        node_assert_1.default.ok(!specTableHtml.includes("NaN"), `Spec table must not contain NaN in cycle ${cycle}`);
        const expectedLabels = expectedLabelsByCat[cat] || expectedLabelsByCat.Savings_MultiCurrency;
        for (const label of expectedLabels) {
            node_assert_1.default.ok(specTableHtml.includes(label), `Spec table must retain '${label}' row in cycle ${cycle} (${cat})`);
        }
    }
});
recordTest("Suite 13: Exotic & Uncanonical Insurer Injections", "Verify setMyCompany and selectCompany gracefully normalize exotic/unknown insurer strings", () => {
    const exoticInputs = ["Zurich Life", "Generali International", "Bupa Overseas", "  ", "", null, undefined];
    for (const input of exoticInputs) {
        // Should never throw
        node_assert_1.default.doesNotThrow(() => {
            sandbox.setMyCompany(input);
        }, `setMyCompany('${input}') must not throw`);
        const myComp = sandbox.getMyCompany();
        node_assert_1.default.strictEqual(typeof myComp, "string", "myCompany must always be a string");
        node_assert_1.default.ok(ALL_INSURERS.includes(myComp), `Normalized myCompany '${myComp}' must be one of the canonical 9 insurers`);
        node_assert_1.default.doesNotThrow(() => {
            sandbox.selectCompany(input);
        }, `selectCompany('${input}') must not throw`);
        const rivalComp = sandbox.getRivalCompany();
        node_assert_1.default.strictEqual(typeof rivalComp, "string", "rivalCompany must always be a string");
        node_assert_1.default.ok(ALL_INSURERS.includes(rivalComp), `Normalized rivalCompany '${rivalComp}' must be one of the canonical 9 insurers`);
    }
    // Restore clean state
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
});
recordTest("Suite 13: Stance-Aware Tone and Content Inversion", "Verify reciprocal CI and Savings tactical pitches invert symmetrically between rivals", () => {
    // Test CI between FWD (2-year wait) and Manulife (3-year wait)
    // 1. FWD as Our Company vs Manulife as Rival
    const fwdVsManu = sandbox.getBattleCard("FWD", "Manulife", "ci");
    node_assert_1.default.ok(fwdVsManu.agent_title.includes("3 年") || fwdVsManu.agent_title.includes("等待期"), "FWD vs Manu title must target 3-year wait");
    node_assert_1.default.ok(fwdVsManu.agent_step_2.includes("3 年"), "FWD vs Manu step 2 must attack Manulife 3-year wait");
    node_assert_1.default.ok(fwdVsManu.agent_step_3.includes("2 年"), "FWD vs Manu step 3 must highlight FWD 2-year line");
    // 2. Swapped: Manulife as Our Company vs FWD as Rival
    const manuVsFwd = sandbox.getBattleCard("Manulife", "FWD", "ci");
    node_assert_1.default.ok(manuVsFwd.agent_title.includes("危疾") || manuVsFwd.agent_title.includes("ICU"), "Manu vs FWD title must target ICU/breadth");
    node_assert_1.default.ok(manuVsFwd.agent_step_2.includes("2 年") || manuVsFwd.agent_step_2.includes("等待期"), "Manu vs FWD step 2 must mention FWD 2-year claim");
    node_assert_1.default.ok(manuVsFwd.agent_step_3.includes("ICU") && (manuVsFwd.agent_step_3.includes("100%") || manuVsFwd.agent_step_3.includes("全額")), "Manu vs FWD step 3 must pivot to ICU 100% advance payout");
});
console.log("\n================================================================================");
console.log("CANONICAL KEY ADVERSARIAL STRESS TEST SUMMARY");
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
    console.log("\nVERDICT: ALL CANONICAL KEY STRESS TESTS PASSED EMPIRICALLY (0 FAILURES).");
    process.exit(0);
}

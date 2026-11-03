"use strict";
/**
 * Adversarial Challenger: Product Dropdown & Cross-Category DOM Linkage Suite
 *
 * Verifies Acceptance Criteria:
 * 1. Both select-my-product and select-rival-product list all products for the selected insurer (5-10 products)
 * 2. Visual grouping via <optgroup> (當前選取險種 vs 該公司其他險種產品) and prefix tags ([儲蓄], [危疾], [醫保], [年金], [萬用])
 * 3. Cross-category selection on either camp automatically links and synchronizes:
 *    - Top Category Tab (#category-tabs .cat-tab)
 *    - Claim Pills (#claim-pills .thumb-pill)
 *    - 1v1 Battle Card Header (hero-our-name vs hero-rival-name) & Spec Comparison Table
 *    - Agent Secret View (agent-title, agent-step-1/2/3, agent-trap-alert)
 * 4. Symmetric support between Plan A (our side) and Plan B (rival side)
 * 5. Intra-category switching preserves active category while updating battle card
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
console.log("ADVERSARIAL SUITE: PRODUCT DROPDOWN & CROSS-CATEGORY DOM LINKAGE");
console.log("Target: templates/mobile_cafe_app.html & build_mobile_cafe.js");
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
            dataset: {},
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
        "category-tabs",
        "company-pills",
        "claim-pills",
        "select-my-insurer",
        "select-rival-insurer",
        "select-my-product",
        "select-rival-product",
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
    const categories = [
        { cat: "Savings_MultiCurrency", label: "📈 儲蓄分紅 (8款)" },
        { cat: "Critical_Illness", label: "🛡️ 重疾危疾 (9款)" },
        { cat: "Medical_VHIS", label: "🏥 自願醫保 (9款)" },
        { cat: "Annuity_QDAP", label: "👴 扣稅年金 (8款)" },
        { cat: "Financing_UniversalLife", label: "🏦 萬用融資 (8款)" }
    ];
    const categoryTabElements = categories.map(c => {
        const el = makeMockElement("", "button");
        el.innerText = c.label;
        el.dataset.cat = c.cat;
        el.className = "cat-tab" + (c.cat === "Savings_MultiCurrency" ? " active" : "");
        if (c.cat === "Savings_MultiCurrency")
            el.classList.add("active");
        return el;
    });
    const claimPills = [
        makePill("5.8% 預繳 / 保證高回報", "prepayment"),
        makePill("首年保費回贈 28%", "rebate"),
        makePill("GN16 官方分紅實現率", "prepayment"),
        makePill("保證回本年期 vs 預期回本", "prepayment"),
        makePill("30年預期複利 IRR", "prepayment"),
        makePill("多元貨幣轉換與保單分拆", "prepayment")
    ];
    function makePill(text, claimKey) {
        const el = makeMockElement("", "button");
        el.innerText = text;
        el.className = "thumb-pill";
        el.dataset.claim = claimKey;
        return el;
    }
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
                if (sel === "#category-tabs .cat-tab")
                    return categoryTabElements;
                if (sel === "#company-pills .thumb-pill")
                    return [];
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
            clipboard: { writeText: async () => { } }
        },
        console,
        clearTimeout: (t) => clearTimeout(t),
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        alert: () => { },
        addEventListener: () => { }
    };
    sandbox.window = sandbox;
    sandbox.__domElements = domElements;
    sandbox.__categoryTabElements = categoryTabElements;
    sandbox.__claimPills = claimPills;
    sandbox.__storageStore = storageStore;
    node_vm_1.default.createContext(sandbox);
    node_vm_1.default.runInContext(scriptCode, sandbox);
    return { sandbox, dom: domElements, tabs: categoryTabElements };
}
// -----------------------------------------------------------------------------
// Suite 1: Full Insurer Product Catalog Population & <optgroup> Visual Structure
// -----------------------------------------------------------------------------
recordTest("Suite 1: Catalog Dropdown Population", "Verify select-my-product lists all catalog products (5-10) with optgroup for all 9 insurers", () => {
    const { sandbox, dom } = createSandbox();
    const insurers = ["AIA", "Prudential", "Manulife", "Sun Life", "FWD", "AXA", "Bowtie", "BOC Life", "YF Life"];
    for (const ins of insurers) {
        sandbox.setMyCompany(ins);
        const selectMyProd = dom["select-my-product"];
        const html = selectMyProd.innerHTML;
        node_assert_1.default.ok(html.includes("<optgroup"), `select-my-product for ${ins} must contain <optgroup> grouping`);
        node_assert_1.default.ok(html.includes("當前選取險種") || html.includes("該公司"), `select-my-product for ${ins} must have group label`);
        // Verify all products of this insurer in catalog are in the dropdown
        const expectedProds = sandbox.ALL_PRODUCTS_CATALOG.filter((p) => sandbox.normalizeCompany(p.insurer) === ins);
        node_assert_1.default.ok(expectedProds.length >= 2, `${ins} should have products in catalog`);
        for (const p of expectedProds) {
            node_assert_1.default.ok(html.includes(p.id), `select-my-product for ${ins} must include product id ${p.id}`);
            const cleanName = sandbox.cleanProductName(p.name);
            node_assert_1.default.ok(html.includes(cleanName), `select-my-product for ${ins} must include product name ${cleanName}`);
        }
    }
});
recordTest("Suite 1: Catalog Dropdown Population", "Verify prefix category tags [儲蓄], [危疾], [醫保], [年金], [萬用] are rendered on options", () => {
    const { sandbox, dom } = createSandbox();
    sandbox.setMyCompany("AIA");
    const html = dom["select-my-product"].innerHTML;
    node_assert_1.default.ok(html.includes("[儲蓄]"), "AIA dropdown must include [儲蓄] tag");
    node_assert_1.default.ok(html.includes("[危疾]"), "AIA dropdown must include [危疾] tag");
    node_assert_1.default.ok(html.includes("[醫保]"), "AIA dropdown must include [醫保] tag");
    node_assert_1.default.ok(html.includes("[年金]"), "AIA dropdown must include [年金] tag");
    node_assert_1.default.ok(html.includes("[萬用]"), "AIA dropdown must include [萬用] tag");
});
// -----------------------------------------------------------------------------
// Suite 2: Plan A Cross-Category Product Selection & Reactive DOM Linkage
// -----------------------------------------------------------------------------
recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting CI product in Savings switches Category Tab, Claim Pills, and Battle Card", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    sandbox.selectCategory("Savings_MultiCurrency");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Savings_MultiCurrency");
    // Select AIA Critical Illness product via setMyProduct
    sandbox.setMyProduct("友心意危疾保");
    // 1. Current category must switch to Critical_Illness
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness", "currentCategory must switch to Critical_Illness");
    // 2. Category Tab DOM must update
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "There must be an active Category Tab");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Critical_Illness", "Active Category Tab must be Critical_Illness");
    // 3. Claim Pills must update to CI claims
    const pillsContainer = dom["claim-pills"].innerHTML;
    node_assert_1.default.ok(pillsContainer.includes("癌症") || pillsContainer.includes("ICU"), "Claim pills must contain CI topics");
    // 4. Product Display and Hero Header must align
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "友心意危疾保", "Product display must show 友心意危疾保");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("友心意危疾保"), "Hero our name must include 友心意危疾保");
    // 5. Agent Secret Pitch must update to CI strategy
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("危疾") || dom["agent-title"].innerHTML.includes("癌症"), "Agent title must address CI battle strategy");
    node_assert_1.default.ok(dom["agent-step-2"].innerHTML.includes("癌症") || dom["agent-step-2"].innerHTML.includes("ICU") || dom["agent-step-2"].innerHTML.includes("危疾"), "Agent step 2 must reflect CI clinical points");
});
recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting VHIS product in Savings switches Category Tab to Medical_VHIS", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    sandbox.selectCategory("Savings_MultiCurrency");
    // Select AIA VHIS product
    sandbox.setMyProduct("尊裕醫療自願醫保計劃");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Medical_VHIS", "currentCategory must switch to Medical_VHIS");
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "Active tab must exist");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Medical_VHIS", "Active tab must be Medical_VHIS");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "尊裕醫療自願醫保計劃");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("尊裕醫療自願醫保計劃"));
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("自願醫保") || dom["agent-title"].innerHTML.includes("標靶藥"), "Agent title must address VHIS strategy");
});
recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting QDAP product in Savings switches Category Tab to Annuity_QDAP", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCategory("Savings_MultiCurrency");
    // Select AIA QDAP Annuity product
    sandbox.setMyProduct("延期年金計劃");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Annuity_QDAP", "currentCategory must switch to Annuity_QDAP");
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "Active tab must exist");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Annuity_QDAP", "Active tab must be Annuity_QDAP");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "延期年金計劃");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("延期年金計劃"));
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("年金") || dom["agent-title"].innerHTML.includes("扣稅"), "Agent title must address QDAP strategy");
});
recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting Universal Life product in Savings switches Category Tab to Financing_UniversalLife", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCategory("Savings_MultiCurrency");
    // Select AIA Universal Life product
    sandbox.setMyProduct("財富尊享萬用壽險");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Financing_UniversalLife", "currentCategory must switch to Financing_UniversalLife");
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "Active tab must exist");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Financing_UniversalLife", "Active tab must be Financing_UniversalLife");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "財富尊享萬用壽險");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("財富尊享萬用壽險"));
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("萬用") || dom["agent-title"].innerHTML.includes("融資"), "Agent title must address UL strategy");
});
// -----------------------------------------------------------------------------
// Suite 3: Plan B (Rival) Cross-Category Product Selection Symmetry
// -----------------------------------------------------------------------------
recordTest("Suite 3: Plan B Cross-Category Selection", "Symmetric cross-category selection on select-rival-product updates category and battle card", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    sandbox.selectCategory("Savings_MultiCurrency");
    // Verify rival dropdown has Prudential products
    const rivalHtml = dom["select-rival-product"].innerHTML;
    node_assert_1.default.ok(rivalHtml.includes("<optgroup"), "select-rival-product must have optgroups");
    node_assert_1.default.ok(rivalHtml.includes("誠保一生危疾保") || rivalHtml.includes("危疾"), "select-rival-product must include Prudential CI plan");
    // User selects Prudential CI plan in rival product dropdown
    sandbox.setRivalProduct("誠保一生危疾保");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness", "currentCategory must switch to Critical_Illness from rival selection");
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "Active tab must exist");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Critical_Illness", "Active tab must switch to Critical_Illness");
    node_assert_1.default.ok(dom["rival-product-display"].innerText.includes("誠保一生") || dom["rival-product-display"].innerText.includes("危疾"));
    node_assert_1.default.ok(dom["hero-rival-name"].innerText.includes("誠保一生") || dom["hero-rival-name"].innerText.includes("危疾"));
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("危疾") || dom["agent-title"].innerHTML.includes("癌症"), "Agent title must align with CI battle");
});
recordTest("Suite 3: Plan B Cross-Category Selection", "Rival selecting VHIS product switches category and updates cashless comparison", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Manulife");
    sandbox.selectCategory("Savings_MultiCurrency");
    // Select Manulife VHIS product
    sandbox.setRivalProduct("宏達醫療保障計劃");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Medical_VHIS", "currentCategory must switch to Medical_VHIS");
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "Active tab must exist");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Medical_VHIS");
    node_assert_1.default.ok(dom["rival-product-display"].innerText.includes("宏達醫療") || dom["rival-product-display"].innerText.includes("醫保"));
    node_assert_1.default.ok(dom["hero-rival-name"].innerText.includes("宏達醫療") || dom["hero-rival-name"].innerText.includes("醫保"));
});
// -----------------------------------------------------------------------------
// Suite 4: Intra-Category Selection & Product Switching
// -----------------------------------------------------------------------------
recordTest("Suite 4: Intra-Category Selection", "Selecting second savings product in same category updates battle card without resetting category", () => {
    const { sandbox, dom } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCategory("Savings_MultiCurrency");
    // Select AIA second savings product
    sandbox.setMyProduct("簡愛延續保障計劃 5");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Savings_MultiCurrency", "Category must remain Savings_MultiCurrency");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "簡愛延續保障計劃 5");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("簡愛延續保障計劃 5"));
});
// -----------------------------------------------------------------------------
// Suite 5: Swap Roles Persistence & Product Symmetry
// -----------------------------------------------------------------------------
recordTest("Suite 5: Swap Roles Interaction", "swapCampRoles preserves product selections and inverts camps symmetrically", () => {
    const { sandbox, dom } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    sandbox.selectCategory("Critical_Illness");
    sandbox.setMyProduct("友心意危疾保");
    sandbox.setRivalProduct("誠保一生危疾保");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "友心意危疾保");
    node_assert_1.default.ok(dom["rival-product-display"].innerText.includes("誠保一生") || dom["rival-product-display"].innerText.includes("危疾"));
    // Swap roles
    sandbox.swapCampRoles();
    node_assert_1.default.strictEqual(sandbox.getMyCompany(), "Prudential");
    node_assert_1.default.strictEqual(sandbox.getRivalCompany(), "AIA");
    node_assert_1.default.ok(dom["my-product-display"].innerText.includes("誠保一生") || dom["my-product-display"].innerText.includes("危疾"));
    node_assert_1.default.strictEqual(dom["rival-product-display"].innerText, "友心意危疾保");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("保誠"));
    node_assert_1.default.ok(dom["hero-rival-name"].innerText.includes("友邦"));
});
// -----------------------------------------------------------------------------
// Suite 6: Multi-Strategy Identifier Resolution & Insurer Isolation
// -----------------------------------------------------------------------------
recordTest("Suite 6: Multi-Strategy Resolution & Isolation", "findProductInCompany normalizes company alias and enforces strict company isolation", () => {
    const { sandbox } = createSandbox();
    // Test alias normalization for company key
    const aiaQdap = sandbox.findProductInCompany("友邦保險", "延期年金計劃");
    node_assert_1.default.ok(aiaQdap, "Should find AIA QDAP even when passing alias '友邦保險'");
    node_assert_1.default.strictEqual(sandbox.normalizeCompany(aiaQdap.insurer), "AIA", "Must belong to AIA, not BOC Life");
    node_assert_1.default.strictEqual(aiaQdap.id, "PROMO-AIA-QDAP-2026");
    const bocQdap = sandbox.findProductInCompany("中銀人壽", "延期年金計劃");
    node_assert_1.default.ok(bocQdap, "Should find BOC Life QDAP when passing '中銀人壽'");
    node_assert_1.default.strictEqual(sandbox.normalizeCompany(bocQdap.insurer), "BOC Life", "Must belong to BOC Life");
    node_assert_1.default.strictEqual(bocQdap.id, "PROMO-BOC-QDAP-2026");
    // Test company keys with underscores
    const sunQdap = sandbox.findProductInCompany("Sun_Life", "萬年延期年金");
    node_assert_1.default.ok(sunQdap, "Should resolve product with Sun_Life key");
    node_assert_1.default.strictEqual(sandbox.normalizeCompany(sunQdap.insurer), "Sun Life");
    // Test strict insurer isolation: passing competitor product must return null
    const competitorLeak = sandbox.findProductInCompany("AIA", "PROMO-PRU-CI-2026-Q4");
    node_assert_1.default.strictEqual(competitorLeak, null, "Passing Prudential product ID to AIA must return null and not leak");
    // Test object identifier resolution
    const objMatch = sandbox.findProductInCompany("AIA", { id: "PROMO-AIA-SAV-2026-Q4" });
    node_assert_1.default.ok(objMatch, "Should support object parameter with id property");
    node_assert_1.default.strictEqual(objMatch.id, "PROMO-AIA-SAV-2026-Q4");
    const objNameMatch = sandbox.findProductInCompany("AIA", { name: "友心意危疾保" });
    node_assert_1.default.ok(objNameMatch, "Should support object parameter with name property");
    node_assert_1.default.strictEqual(objNameMatch.id, "PROMO-AIA-CI-2026-Q4");
    // Malformed / empty inputs
    node_assert_1.default.strictEqual(sandbox.findProductInCompany("AIA", null), null);
    node_assert_1.default.strictEqual(sandbox.findProductInCompany("AIA", ""), null);
    node_assert_1.default.strictEqual(sandbox.findProductInCompany("AIA", "NON_EXISTENT_XYZ"), null);
});
// -----------------------------------------------------------------------------
// Suite 7: Insurers with Gap Categories (e.g. Bowtie in Savings/QDAP/UL)
// -----------------------------------------------------------------------------
recordTest("Suite 7: Gap Categories Handling", "Bowtie in Savings shows gap warning, displays flagship fallback, and enables cross-category jump", () => {
    const { sandbox, dom, tabs } = createSandbox();
    sandbox.setMyCompany("Bowtie");
    sandbox.selectCompany("AIA");
    sandbox.selectCategory("Savings_MultiCurrency");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Savings_MultiCurrency");
    const selectHtml = dom["select-my-product"].innerHTML;
    node_assert_1.default.ok(selectHtml.includes("該險種暫無產品"), "Dropdown must render disabled warning option when company has no products in active category");
    node_assert_1.default.ok(selectHtml.includes("該公司其他險種產品 (全線)"), "Dropdown must list remaining products under (全線) group");
    node_assert_1.default.ok(selectHtml.includes("PROMO-BOWTIE-CI-2026"), "Dropdown must list Bowtie CI");
    node_assert_1.default.ok(selectHtml.includes("PROMO-BOWTIE-VHIS-2026"), "Dropdown must list Bowtie VHIS");
    // Display must show flagship message, not falsely claim CI product
    node_assert_1.default.ok(dom["my-product-display"].innerText.includes("純網上未有儲蓄傳承產品") || dom["my-product-display"].innerText.includes("純網上"));
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("純網上未有儲蓄傳承產品") || dom["hero-our-name"].innerText.includes("純網上"));
    // Selecting Bowtie CI from dropdown must cleanly jump to Critical_Illness
    sandbox.setMyProduct("PROMO-BOWTIE-CI-2026");
    node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness");
    const activeTab = tabs.find((t) => t.classList.contains("active"));
    node_assert_1.default.ok(activeTab, "Active tab must exist");
    node_assert_1.default.strictEqual(activeTab.dataset.cat, "Critical_Illness");
    node_assert_1.default.strictEqual(dom["my-product-display"].innerText, "Bowtie 早期危疾保");
    node_assert_1.default.ok(dom["hero-our-name"].innerText.includes("Bowtie 早期危疾保"));
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("危疾") || dom["agent-title"].innerHTML.includes("癌症"));
});
// -----------------------------------------------------------------------------
// Suite 8: Exhaustive Cross-Category Matrix (5 Categories x 60 Products)
// -----------------------------------------------------------------------------
recordTest("Suite 8: Exhaustive Cross-Category Matrix", "Exhaustively verify all 60 products across all 5 initial categories (300 pairs) for Plan A & Plan B", () => {
    const { sandbox, tabs } = createSandbox();
    const allCategories = [
        "Savings_MultiCurrency",
        "Critical_Illness",
        "Medical_VHIS",
        "Annuity_QDAP",
        "Financing_UniversalLife"
    ];
    const catalog = sandbox.ALL_PRODUCTS_CATALOG;
    node_assert_1.default.strictEqual(catalog.length, 60, "Catalog must contain exactly 60 products");
    for (const startCat of allCategories) {
        for (const p of catalog) {
            const comp = sandbox.normalizeCompany(p.insurer);
            // 1. Test setMyProduct cross-category transition
            sandbox.setMyCompany(comp);
            sandbox.selectCategory(startCat);
            sandbox.setMyProduct(p.id);
            node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), p.category, `From ${startCat} -> setMyProduct(${p.id}) must switch currentCategory to ${p.category}`);
            const activeTabA = tabs.find((t) => t.classList.contains("active"));
            node_assert_1.default.ok(activeTabA, "Active category tab must exist");
            node_assert_1.default.strictEqual(activeTabA.dataset.cat, p.category, `Active tab must be ${p.category}`);
            // 2. Test setRivalProduct cross-category transition
            sandbox.selectCompany(comp);
            sandbox.selectCategory(startCat);
            sandbox.setRivalProduct(p.id);
            node_assert_1.default.strictEqual(sandbox.getCurrentCategory(), p.category, `From ${startCat} -> setRivalProduct(${p.id}) must switch currentCategory to ${p.category}`);
            const activeTabB = tabs.find((t) => t.classList.contains("active"));
            node_assert_1.default.ok(activeTabB, "Active category tab must exist");
            node_assert_1.default.strictEqual(activeTabB.dataset.cat, p.category, `Active tab must be ${p.category}`);
        }
    }
});
// -----------------------------------------------------------------------------
// Suite 9: Rapid Asynchronous Interaction Loop
// -----------------------------------------------------------------------------
recordTest("Suite 9: Rapid Interaction Loop", "Simulate rapid consecutive user toggles across categories, products, and role swaps without desync", () => {
    const { sandbox, dom } = createSandbox();
    sandbox.setMyCompany("AIA");
    sandbox.selectCompany("Prudential");
    sandbox.selectCategory("Savings_MultiCurrency");
    const actions = [
        () => sandbox.setMyProduct("PROMO-AIA-CI-2026-Q4"),
        () => sandbox.setRivalProduct("PROMO-PRU-VHIS-2026"),
        () => sandbox.swapCampRoles(),
        () => sandbox.selectCategory("Financing_UniversalLife"),
        () => sandbox.setMyProduct("PROMO-PRU-UL-2026"),
        () => sandbox.setRivalProduct("PROMO-AIA-UL-ELITE-2026"),
        () => sandbox.swapCampRoles(),
        () => sandbox.setMyProduct("PROMO-AIA-QDAP-2026"),
        () => sandbox.setRivalProduct("PROMO-PRU-QDAP-2026"),
        () => sandbox.selectCategory("Savings_MultiCurrency"),
        () => sandbox.setMyProduct("PROMO-AIA-SAV-SLE5-2026")
    ];
    for (let i = 0; i < actions.length; i++) {
        actions[i]();
        // After each step, verify essential state integrity
        node_assert_1.default.ok(sandbox.getCurrentCategory(), `currentCategory must be non-empty at step ${i}`);
        node_assert_1.default.ok(dom["hero-our-name"].innerText.length > 0, `hero-our-name must be non-empty at step ${i}`);
        node_assert_1.default.ok(dom["hero-rival-name"].innerText.length > 0, `hero-rival-name must be non-empty at step ${i}`);
        node_assert_1.default.ok(dom["bilateral-spec-table"].innerHTML.includes("tbody"), `bilateral spec table must be populated at step ${i}`);
    }
});
// -----------------------------------------------------------------------------
// Suite 10: CSS & Layout Defenses
// -----------------------------------------------------------------------------
recordTest("Suite 10: CSS & Layout Defenses", "Verify camp-select has ellipsis truncation and optgroup styling", () => {
    node_assert_1.default.ok(cafeHtml.includes("text-overflow: ellipsis;"), "CSS must specify text-overflow: ellipsis for select dropdown");
    node_assert_1.default.ok(cafeHtml.includes(".camp-select optgroup"), "CSS must style .camp-select optgroup");
    node_assert_1.default.ok(cafeHtml.includes(".camp-select option"), "CSS must style .camp-select option");
});
console.log("================================================================================");
console.log("PRODUCT DROPDOWN & CROSS-CATEGORY LINKAGE VERIFICATION SUMMARY");
console.log("================================================================================");
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`Total Scenarios Tested : ${results.length}`);
console.log(`Passed                 : ${passed}`);
console.log(`Failed                 : ${failed}`);
if (failed > 0) {
    process.exit(1);
}
else {
    console.log("\nVERDICT: ALL PRODUCT DROPDOWN & LINKAGE STRESS TESTS PASSED (0 FAILURES).");
}

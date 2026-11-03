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

import fs from "fs";
import path from "path";
import assert from "node:assert";
import vm from "node:vm";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

function recordTest(suite: string, test: string, fn: () => void) {
  const start = performance.now();
  try {
    fn();
    const durationMs = parseFloat((performance.now() - start).toFixed(2));
    results.push({ suite, test, passed: true, durationMs });
    console.log(`[PASS] (${durationMs}ms) ${suite} -> ${test}`);
  } catch (err: any) {
    const durationMs = parseFloat((performance.now() - start).toFixed(2));
    results.push({ suite, test, passed: false, error: err.message, durationMs });
    console.error(`[FAIL] (${durationMs}ms) ${suite} -> ${test}: ${err.message}`);
  }
}

console.log("================================================================================");
console.log("ADVERSARIAL SUITE: PRODUCT DROPDOWN & CROSS-CATEGORY DOM LINKAGE");
console.log("Target: templates/mobile_cafe_app.html & build_mobile_cafe.js");
console.log("================================================================================");

const cafePath = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
assert.ok(fs.existsSync(cafePath), "templates/mobile_cafe_app.html must exist");
const cafeHtml = fs.readFileSync(cafePath, "utf-8");

const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, "mobile_cafe_app.html must contain a valid <script> block");
const scriptCode = scriptMatch[1];

function createSandbox() {
  const domElements: Record<string, any> = {};

  const makeMockElement = (id: string, tagName: string = "div") => {
    return {
      id,
      tagName: tagName.toUpperCase(),
      innerHTML: "",
      innerText: "",
      value: "",
      dataset: {} as Record<string, string>,
      select: () => {},
      style: { display: "block", opacity: "1" } as Record<string, string>,
      className: "",
      classList: {
        classes: new Set<string>(),
        add(c: string) { this.classes.add(c); },
        remove(c: string) { this.classes.delete(c); },
        toggle(c: string, force?: boolean) {
          if (force === true) {
            this.classes.add(c);
          } else if (force === false) {
            this.classes.delete(c);
          } else if (this.classes.has(c)) {
            this.classes.delete(c);
          } else {
            this.classes.add(c);
          }
        },
        contains(c: string) { return this.classes.has(c); }
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
    if (c.cat === "Savings_MultiCurrency") el.classList.add("active");
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

  function makePill(text: string, claimKey: string) {
    const el = makeMockElement("", "button");
    el.innerText = text;
    el.className = "thumb-pill";
    el.dataset.claim = claimKey;
    return el;
  }

  const storageStore: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (k: string) => (k in storageStore ? storageStore[k] : null),
    setItem: (k: string, v: string) => { storageStore[k] = String(v); },
    removeItem: (k: string) => { delete storageStore[k]; },
    clear: () => { for (const k in storageStore) delete storageStore[k]; }
  };

  const sandbox: any = {
    document: {
      getElementById: (id: string) => domElements[id] || null,
      querySelectorAll: (sel: string) => {
        if (sel === "#category-tabs .cat-tab") return categoryTabElements;
        if (sel === "#company-pills .thumb-pill") return [];
        if (sel === "#claim-pills .thumb-pill") return claimPills;
        return [];
      },
      createElement: (tag: string) => makeMockElement("", tag),
      body: { appendChild: () => {}, removeChild: () => {} },
      execCommand: () => true
    },
    localStorage: mockLocalStorage,
    navigator: {
      clipboard: { writeText: async () => {} }
    },
    console,
    clearTimeout: (t: any) => clearTimeout(t),
    setTimeout: (fn: any, ms: number) => setTimeout(fn, ms),
    alert: () => {},
    addEventListener: () => {}
  };
  sandbox.window = sandbox;
  sandbox.__domElements = domElements;
  sandbox.__categoryTabElements = categoryTabElements;
  sandbox.__claimPills = claimPills;
  sandbox.__storageStore = storageStore;

  vm.createContext(sandbox);
  vm.runInContext(scriptCode, sandbox);

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

    assert.ok(html.includes("<optgroup"), `select-my-product for ${ins} must contain <optgroup> grouping`);
    assert.ok(html.includes("當前選取險種") || html.includes("該公司"), `select-my-product for ${ins} must have group label`);

    // Verify all products of this insurer in catalog are in the dropdown
    const expectedProds = sandbox.ALL_PRODUCTS_CATALOG.filter((p: any) => sandbox.normalizeCompany(p.insurer) === ins);
    assert.ok(expectedProds.length >= 2, `${ins} should have products in catalog`);

    for (const p of expectedProds) {
      assert.ok(html.includes(p.id), `select-my-product for ${ins} must include product id ${p.id}`);
      const cleanName = sandbox.cleanProductName(p.name);
      assert.ok(html.includes(cleanName), `select-my-product for ${ins} must include product name ${cleanName}`);
    }
  }
});

recordTest("Suite 1: Catalog Dropdown Population", "Verify prefix category tags [儲蓄], [危疾], [醫保], [年金], [萬用] are rendered on options", () => {
  const { sandbox, dom } = createSandbox();
  sandbox.setMyCompany("AIA");
  const html = dom["select-my-product"].innerHTML;

  assert.ok(html.includes("[儲蓄]"), "AIA dropdown must include [儲蓄] tag");
  assert.ok(html.includes("[危疾]"), "AIA dropdown must include [危疾] tag");
  assert.ok(html.includes("[醫保]"), "AIA dropdown must include [醫保] tag");
  assert.ok(html.includes("[年金]"), "AIA dropdown must include [年金] tag");
  assert.ok(html.includes("[萬用]"), "AIA dropdown must include [萬用] tag");
});

// -----------------------------------------------------------------------------
// Suite 2: Plan A Cross-Category Product Selection & Reactive DOM Linkage
// -----------------------------------------------------------------------------
recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting CI product in Savings switches Category Tab, Claim Pills, and Battle Card", () => {
  const { sandbox, dom, tabs } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCompany("Prudential");
  sandbox.selectCategory("Savings_MultiCurrency");

  assert.strictEqual(sandbox.getCurrentCategory(), "Savings_MultiCurrency");

  // Select AIA Critical Illness product via setMyProduct
  sandbox.setMyProduct("友心意危疾保");

  // 1. Current category must switch to Critical_Illness
  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness", "currentCategory must switch to Critical_Illness");

  // 2. Category Tab DOM must update
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "There must be an active Category Tab");
  assert.strictEqual(activeTab.dataset.cat, "Critical_Illness", "Active Category Tab must be Critical_Illness");

  // 3. Claim Pills must update to CI claims
  const pillsContainer = dom["claim-pills"].innerHTML;
  assert.ok(pillsContainer.includes("癌症") || pillsContainer.includes("ICU"), "Claim pills must contain CI topics");

  // 4. Product Display and Hero Header must align
  assert.strictEqual(dom["my-product-display"].innerText, "友心意危疾保", "Product display must show 友心意危疾保");
  assert.ok(dom["hero-our-name"].innerText.includes("友心意危疾保"), "Hero our name must include 友心意危疾保");

  // 5. Agent Secret Pitch must update to CI strategy
  assert.ok(dom["agent-title"].innerHTML.includes("危疾") || dom["agent-title"].innerHTML.includes("癌症"), "Agent title must address CI battle strategy");
  assert.ok(dom["agent-step-2"].innerHTML.includes("癌症") || dom["agent-step-2"].innerHTML.includes("ICU") || dom["agent-step-2"].innerHTML.includes("危疾"), "Agent step 2 must reflect CI clinical points");
});

recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting VHIS product in Savings switches Category Tab to Medical_VHIS", () => {
  const { sandbox, dom, tabs } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCompany("Prudential");
  sandbox.selectCategory("Savings_MultiCurrency");

  // Select AIA VHIS product
  sandbox.setMyProduct("尊裕醫療自願醫保計劃");

  assert.strictEqual(sandbox.getCurrentCategory(), "Medical_VHIS", "currentCategory must switch to Medical_VHIS");
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "Active tab must exist");
  assert.strictEqual(activeTab.dataset.cat, "Medical_VHIS", "Active tab must be Medical_VHIS");

  assert.strictEqual(dom["my-product-display"].innerText, "尊裕醫療自願醫保計劃");
  assert.ok(dom["hero-our-name"].innerText.includes("尊裕醫療自願醫保計劃"));
  assert.ok(dom["agent-title"].innerHTML.includes("自願醫保") || dom["agent-title"].innerHTML.includes("標靶藥"), "Agent title must address VHIS strategy");
});

recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting QDAP product in Savings switches Category Tab to Annuity_QDAP", () => {
  const { sandbox, dom, tabs } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCategory("Savings_MultiCurrency");

  // Select AIA QDAP Annuity product
  sandbox.setMyProduct("延期年金計劃");

  assert.strictEqual(sandbox.getCurrentCategory(), "Annuity_QDAP", "currentCategory must switch to Annuity_QDAP");
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "Active tab must exist");
  assert.strictEqual(activeTab.dataset.cat, "Annuity_QDAP", "Active tab must be Annuity_QDAP");

  assert.strictEqual(dom["my-product-display"].innerText, "延期年金計劃");
  assert.ok(dom["hero-our-name"].innerText.includes("延期年金計劃"));
  assert.ok(dom["agent-title"].innerHTML.includes("年金") || dom["agent-title"].innerHTML.includes("扣稅"), "Agent title must address QDAP strategy");
});

recordTest("Suite 2: Plan A Cross-Category Selection", "Selecting Universal Life product in Savings switches Category Tab to Financing_UniversalLife", () => {
  const { sandbox, dom, tabs } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCategory("Savings_MultiCurrency");

  // Select AIA Universal Life product
  sandbox.setMyProduct("財富尊享萬用壽險");

  assert.strictEqual(sandbox.getCurrentCategory(), "Financing_UniversalLife", "currentCategory must switch to Financing_UniversalLife");
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "Active tab must exist");
  assert.strictEqual(activeTab.dataset.cat, "Financing_UniversalLife", "Active tab must be Financing_UniversalLife");

  assert.strictEqual(dom["my-product-display"].innerText, "財富尊享萬用壽險");
  assert.ok(dom["hero-our-name"].innerText.includes("財富尊享萬用壽險"));
  assert.ok(dom["agent-title"].innerHTML.includes("萬用") || dom["agent-title"].innerHTML.includes("融資"), "Agent title must address UL strategy");
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
  assert.ok(rivalHtml.includes("<optgroup"), "select-rival-product must have optgroups");
  assert.ok(rivalHtml.includes("誠保一生危疾保") || rivalHtml.includes("危疾"), "select-rival-product must include Prudential CI plan");

  // User selects Prudential CI plan in rival product dropdown
  sandbox.setRivalProduct("誠保一生危疾保");

  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness", "currentCategory must switch to Critical_Illness from rival selection");
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "Active tab must exist");
  assert.strictEqual(activeTab.dataset.cat, "Critical_Illness", "Active tab must switch to Critical_Illness");

  assert.ok(dom["rival-product-display"].innerText.includes("誠保一生") || dom["rival-product-display"].innerText.includes("危疾"));
  assert.ok(dom["hero-rival-name"].innerText.includes("誠保一生") || dom["hero-rival-name"].innerText.includes("危疾"));
  assert.ok(dom["agent-title"].innerHTML.includes("危疾") || dom["agent-title"].innerHTML.includes("癌症"), "Agent title must align with CI battle");
});

recordTest("Suite 3: Plan B Cross-Category Selection", "Rival selecting VHIS product switches category and updates cashless comparison", () => {
  const { sandbox, dom, tabs } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCompany("Manulife");
  sandbox.selectCategory("Savings_MultiCurrency");

  // Select Manulife VHIS product
  sandbox.setRivalProduct("宏達醫療保障計劃");

  assert.strictEqual(sandbox.getCurrentCategory(), "Medical_VHIS", "currentCategory must switch to Medical_VHIS");
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "Active tab must exist");
  assert.strictEqual(activeTab.dataset.cat, "Medical_VHIS");

  assert.ok(dom["rival-product-display"].innerText.includes("宏達醫療") || dom["rival-product-display"].innerText.includes("醫保"));
  assert.ok(dom["hero-rival-name"].innerText.includes("宏達醫療") || dom["hero-rival-name"].innerText.includes("醫保"));
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

  assert.strictEqual(sandbox.getCurrentCategory(), "Savings_MultiCurrency", "Category must remain Savings_MultiCurrency");
  assert.strictEqual(dom["my-product-display"].innerText, "簡愛延續保障計劃 5");
  assert.ok(dom["hero-our-name"].innerText.includes("簡愛延續保障計劃 5"));
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

  assert.strictEqual(dom["my-product-display"].innerText, "友心意危疾保");
  assert.ok(dom["rival-product-display"].innerText.includes("誠保一生") || dom["rival-product-display"].innerText.includes("危疾"));

  // Swap roles
  sandbox.swapCampRoles();

  assert.strictEqual(sandbox.getMyCompany(), "Prudential");
  assert.strictEqual(sandbox.getRivalCompany(), "AIA");
  assert.ok(dom["my-product-display"].innerText.includes("誠保一生") || dom["my-product-display"].innerText.includes("危疾"));
  assert.strictEqual(dom["rival-product-display"].innerText, "友心意危疾保");
  assert.ok(dom["hero-our-name"].innerText.includes("保誠"));
  assert.ok(dom["hero-rival-name"].innerText.includes("友邦"));
});

// -----------------------------------------------------------------------------
// Suite 6: Multi-Strategy Identifier Resolution & Insurer Isolation
// -----------------------------------------------------------------------------
recordTest("Suite 6: Multi-Strategy Resolution & Isolation", "findProductInCompany normalizes company alias and enforces strict company isolation", () => {
  const { sandbox } = createSandbox();

  // Test alias normalization for company key
  const aiaQdap = sandbox.findProductInCompany("友邦保險", "延期年金計劃");
  assert.ok(aiaQdap, "Should find AIA QDAP even when passing alias '友邦保險'");
  assert.strictEqual(sandbox.normalizeCompany(aiaQdap.insurer), "AIA", "Must belong to AIA, not BOC Life");
  assert.strictEqual(aiaQdap.id, "PROMO-AIA-QDAP-2026");

  const bocQdap = sandbox.findProductInCompany("中銀人壽", "延期年金計劃");
  assert.ok(bocQdap, "Should find BOC Life QDAP when passing '中銀人壽'");
  assert.strictEqual(sandbox.normalizeCompany(bocQdap.insurer), "BOC Life", "Must belong to BOC Life");
  assert.strictEqual(bocQdap.id, "PROMO-BOC-QDAP-2026");

  // Test company keys with underscores
  const sunQdap = sandbox.findProductInCompany("Sun_Life", "萬年延期年金");
  assert.ok(sunQdap, "Should resolve product with Sun_Life key");
  assert.strictEqual(sandbox.normalizeCompany(sunQdap.insurer), "Sun Life");

  // Test strict insurer isolation: passing competitor product must return null
  const competitorLeak = sandbox.findProductInCompany("AIA", "PROMO-PRU-CI-2026-Q4");
  assert.strictEqual(competitorLeak, null, "Passing Prudential product ID to AIA must return null and not leak");

  // Test object identifier resolution
  const objMatch = sandbox.findProductInCompany("AIA", { id: "PROMO-AIA-SAV-2026-Q4" });
  assert.ok(objMatch, "Should support object parameter with id property");
  assert.strictEqual(objMatch.id, "PROMO-AIA-SAV-2026-Q4");

  const objNameMatch = sandbox.findProductInCompany("AIA", { name: "友心意危疾保" });
  assert.ok(objNameMatch, "Should support object parameter with name property");
  assert.strictEqual(objNameMatch.id, "PROMO-AIA-CI-2026-Q4");

  // Malformed / empty inputs
  assert.strictEqual(sandbox.findProductInCompany("AIA", null), null);
  assert.strictEqual(sandbox.findProductInCompany("AIA", ""), null);
  assert.strictEqual(sandbox.findProductInCompany("AIA", "NON_EXISTENT_XYZ"), null);
});

// -----------------------------------------------------------------------------
// Suite 7: Insurers with Gap Categories (e.g. Bowtie in Savings/QDAP/UL)
// -----------------------------------------------------------------------------
recordTest("Suite 7: Gap Categories Handling", "Bowtie in Savings shows gap warning, displays flagship fallback, and enables cross-category jump", () => {
  const { sandbox, dom, tabs } = createSandbox();
  sandbox.setMyCompany("Bowtie");
  sandbox.selectCompany("AIA");
  sandbox.selectCategory("Savings_MultiCurrency");

  assert.strictEqual(sandbox.getCurrentCategory(), "Savings_MultiCurrency");

  const selectHtml = dom["select-my-product"].innerHTML;
  assert.ok(selectHtml.includes("該險種暫無產品"), "Dropdown must render disabled warning option when company has no products in active category");
  assert.ok(selectHtml.includes("該公司其他險種產品 (全線)"), "Dropdown must list remaining products under (全線) group");
  assert.ok(selectHtml.includes("PROMO-BOWTIE-CI-2026"), "Dropdown must list Bowtie CI");
  assert.ok(selectHtml.includes("PROMO-BOWTIE-VHIS-2026"), "Dropdown must list Bowtie VHIS");

  // Display must show flagship message, not falsely claim CI product
  assert.ok(dom["my-product-display"].innerText.includes("純網上未有儲蓄傳承產品") || dom["my-product-display"].innerText.includes("純網上"));
  assert.ok(dom["hero-our-name"].innerText.includes("純網上未有儲蓄傳承產品") || dom["hero-our-name"].innerText.includes("純網上"));

  // Selecting Bowtie CI from dropdown must cleanly jump to Critical_Illness
  sandbox.setMyProduct("PROMO-BOWTIE-CI-2026");

  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness");
  const activeTab = tabs.find((t: any) => t.classList.contains("active"));
  assert.ok(activeTab, "Active tab must exist");
  assert.strictEqual(activeTab.dataset.cat, "Critical_Illness");
  assert.strictEqual(dom["my-product-display"].innerText, "Bowtie 早期危疾保");
  assert.ok(dom["hero-our-name"].innerText.includes("Bowtie 早期危疾保"));
  assert.ok(dom["agent-title"].innerHTML.includes("危疾") || dom["agent-title"].innerHTML.includes("癌症"));
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
  assert.strictEqual(catalog.length, 60, "Catalog must contain exactly 60 products");

  for (const startCat of allCategories) {
    for (const p of catalog) {
      const comp = sandbox.normalizeCompany(p.insurer);

      // 1. Test setMyProduct cross-category transition
      sandbox.setMyCompany(comp);
      sandbox.selectCategory(startCat);
      sandbox.setMyProduct(p.id);

      assert.strictEqual(sandbox.getCurrentCategory(), p.category, `From ${startCat} -> setMyProduct(${p.id}) must switch currentCategory to ${p.category}`);
      const activeTabA = tabs.find((t: any) => t.classList.contains("active"));
      assert.ok(activeTabA, "Active category tab must exist");
      assert.strictEqual(activeTabA.dataset.cat, p.category, `Active tab must be ${p.category}`);

      // 2. Test setRivalProduct cross-category transition
      sandbox.selectCompany(comp);
      sandbox.selectCategory(startCat);
      sandbox.setRivalProduct(p.id);

      assert.strictEqual(sandbox.getCurrentCategory(), p.category, `From ${startCat} -> setRivalProduct(${p.id}) must switch currentCategory to ${p.category}`);
      const activeTabB = tabs.find((t: any) => t.classList.contains("active"));
      assert.ok(activeTabB, "Active category tab must exist");
      assert.strictEqual(activeTabB.dataset.cat, p.category, `Active tab must be ${p.category}`);
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
    assert.ok(sandbox.getCurrentCategory(), `currentCategory must be non-empty at step ${i}`);
    assert.ok(dom["hero-our-name"].innerText.length > 0, `hero-our-name must be non-empty at step ${i}`);
    assert.ok(dom["hero-rival-name"].innerText.length > 0, `hero-rival-name must be non-empty at step ${i}`);
    assert.ok(dom["bilateral-spec-table"].innerHTML.includes("tbody"), `bilateral spec table must be populated at step ${i}`);
  }
});

// -----------------------------------------------------------------------------
// Suite 10: CSS & Layout Defenses
// -----------------------------------------------------------------------------
recordTest("Suite 10: CSS & Layout Defenses", "Verify camp-select has ellipsis truncation and optgroup styling", () => {
  assert.ok(cafeHtml.includes("text-overflow: ellipsis;"), "CSS must specify text-overflow: ellipsis for select dropdown");
  assert.ok(cafeHtml.includes(".camp-select optgroup"), "CSS must style .camp-select optgroup");
  assert.ok(cafeHtml.includes(".camp-select option"), "CSS must style .camp-select option");
});

// -----------------------------------------------------------------------------
// Suite 11: Cross-Category Claim Independence in getBattleCard
// -----------------------------------------------------------------------------
recordTest("Suite 11: Cross-Category Claim Independence", "getBattleCard('prepayment') while in Critical_Illness must evaluate Savings products, not CI products", () => {
  const { sandbox } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCompany("Prudential");
  sandbox.selectCategory("Critical_Illness");

  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness");

  // Querying prepayment (a savings claim) must resolve to Savings products
  const card = sandbox.getBattleCard("AIA", "Prudential", "prepayment");
  assert.ok(card.hero_our_name.includes("盈御多元貨幣"), `hero_our_name should be Savings product, got: ${card.hero_our_name}`);
  assert.ok(card.hero_rival_name.includes("雋富多元貨幣"), `hero_rival_name should be Savings product, got: ${card.hero_rival_name}`);
  assert.ok(card.agent_title.includes("預繳") || card.agent_title.includes("儲蓄"), "agent_title must address prepayment");
});

// -----------------------------------------------------------------------------
// Suite 12: Claim Chip Label and Key Resolution in selectClaim
// -----------------------------------------------------------------------------
recordTest("Suite 12: Claim Chip Resolution", "selectClaim correctly resolves current category chips by label or key without false category reset", () => {
  const { sandbox, dom } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCompany("Prudential");
  sandbox.selectCategory("Critical_Illness");

  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness");

  // Select chip by exact label in Critical_Illness
  sandbox.selectClaim("首年保費折扣回贈");
  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness", "Must remain in Critical_Illness");
  assert.ok(dom["agent-title"].innerHTML.includes("折扣") || dom["agent-title"].innerHTML.includes("回贈"));

  // Select chip by key in Critical_Illness
  sandbox.selectClaim("深切治療部 (ICU) 預支賠償");
  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness");
  assert.ok(dom["agent-title"].innerHTML.includes("ICU") || dom["agent-step-2"].innerHTML.includes("ICU"));
});

// -----------------------------------------------------------------------------
// Suite 13: Agent Pitch Script Product Alignment for Non-Flagship Selection
// -----------------------------------------------------------------------------
recordTest("Suite 13: Agent Pitch Script Alignment", "Agent pitch scripts dynamically align with selected non-flagship product names", () => {
  const { sandbox, dom } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCompany("Prudential");
  sandbox.selectCategory("Savings_MultiCurrency");

  // Select Prudential second savings product: 特級「雋陞」儲蓄保障計劃 II
  sandbox.setRivalProduct("PROMO-PRU-SAV-EGSP2-2026");

  assert.ok(dom["hero-rival-name"].innerText.includes("雋陞"), "Hero rival name must cite 雋陞");

  // In Savings prepayment pitch, step 3 should reference 雋陞, not hardcode 雋富
  const card = sandbox.getBattleCard("AIA", "Prudential", "prepayment");
  assert.ok(card.agent_step_3.includes("雋陞"), `agent_step_3 must reference selected rival product 雋陞, got: ${card.agent_step_3}`);

  // Test VHIS non-flagship alignment
  sandbox.selectCategory("Medical_VHIS");
  sandbox.setRivalProduct("PROMO-PRU-VHIS-2026");
  const vhisCard = sandbox.getBattleCard("AIA", "Prudential", "vhis");
  assert.ok(vhisCard.hero_rival_name.includes("摯為您"), "Hero rival name must cite 摯為您");
  assert.ok(vhisCard.whatsapp_script.includes("摯為您"), "WhatsApp script must cite 摯為您");
});

// -----------------------------------------------------------------------------
// Suite 14: DOM Event Objects & Target Extraction
// -----------------------------------------------------------------------------
recordTest("Suite 14: Event Object & Target Extraction", "setMyProduct and setRivalProduct accept standard DOM ChangeEvent with target.value", () => {
  const { sandbox, dom } = createSandbox();
  sandbox.setMyCompany("AIA");
  sandbox.selectCategory("Savings_MultiCurrency");

  // Simulate change event dispatched from <select>
  const mockEventA = { target: { value: "PROMO-AIA-CI-2026-Q4" } };
  sandbox.setMyProduct(mockEventA);

  assert.strictEqual(sandbox.getCurrentCategory(), "Critical_Illness", "setMyProduct with event target must switch category");
  assert.strictEqual(dom["my-product-display"].innerText, "友心意危疾保");

  // Simulate change event on rival
  const mockEventB = { target: { value: "PROMO-PRU-QDAP-2026" } };
  sandbox.setRivalProduct(mockEventB);

  assert.strictEqual(sandbox.getCurrentCategory(), "Annuity_QDAP", "setRivalProduct with event target must switch category");
  assert.ok(dom["rival-product-display"].innerText.includes("雋逸年金") || dom["rival-product-display"].innerText.includes("年金"));
});

// -----------------------------------------------------------------------------
// Suite 15: Global Drawer State Isolation & Alias Category Tagging
// -----------------------------------------------------------------------------
recordTest("Suite 15: Drawer State Isolation & Alias Tagging", "openCatalogDrawer resets lastCatalogSide and search input; alias categories produce valid tags", () => {
  const { sandbox, dom } = createSandbox();

  // 1. Open drawer for company, which sets lastCatalogSide = 'our'
  sandbox.openCatalogForCompany("our");
  assert.ok(dom["catalog-search-input"].value.length > 0, "Search input should have company name");

  // 2. Open global drawer, must reset lastCatalogSide and clear input
  sandbox.openCatalogDrawer();
  assert.strictEqual(dom["catalog-search-input"].value, "", "openCatalogDrawer must reset search input to empty");

  // 3. Test alias category tag rendering
  const prodsWithAlias = [
    { id: "TEST-1", name: "測試產品 1", category: "ci" },
    { id: "TEST-2", name: "測試產品 2", category: "vhis" },
    { id: "TEST-3", name: "測試產品 3", category: "qdap" },
    { id: "TEST-4", name: "測試產品 4", category: "ul" }
  ];
  const renderedHtml = sandbox.renderCampProductOptions(prodsWithAlias, "Critical_Illness", "TEST-1");
  assert.ok(renderedHtml.includes("[危疾]"), "Must render [危疾] tag even when category is alias 'ci'");
  assert.ok(renderedHtml.includes("[醫保]"), "Must render [醫保] tag even when category is alias 'vhis'");
  assert.ok(renderedHtml.includes("[年金]"), "Must render [年金] tag even when category is alias 'qdap'");
  assert.ok(renderedHtml.includes("[萬用]"), "Must render [萬用] tag even when category is alias 'ul'");
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
} else {
  console.log("\nVERDICT: ALL PRODUCT DROPDOWN & LINKAGE STRESS TESTS PASSED (0 FAILURES).");
}


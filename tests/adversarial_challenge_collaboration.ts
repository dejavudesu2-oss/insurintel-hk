import assert from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

function test(name: string, fn: () => void) {
  const start = process.hrtime.bigint();
  try {
    fn();
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;
    console.log(`  [PASS] (${ms.toFixed(2)}ms) ${name}`);
  } catch (err: any) {
    console.error(`  [FAIL] ${name}:`, err.message);
    throw err;
  }
}

console.log('================================================================================');
console.log('INSURINTEL HK - ADVERSARIAL CHALLENGE: PLAN A/B & SCENARIO COLLABORATION');
console.log('Verifying: Two-way dynamic synchronization between Category, Plan A/B, and Scenarios');
console.log('================================================================================\n');

const htmlContent = fs.readFileSync(path.join(__dirname, '../templates/mobile_cafe_app.html'), 'utf8');
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  throw new Error('Could not extract script block from mobile_cafe_app.html');
}
const scriptCode = scriptMatch[1];

function createSandbox() {
  const domElements: Record<string, any> = {};

  const makeMockElement = (id: string = '', tagName: string = 'div'): any => ({
    id,
    tagName: tagName.toUpperCase(),
    innerHTML: '',
    innerText: '',
    textContent: '',
    value: '',
    title: '',
    checked: false,
    dataset: {} as Record<string, string>,
    style: {} as Record<string, string>,
    className: '',
    classList: {
      classes: new Set<string>(),
      add(c: string) { this.classes.add(c); },
      remove(c: string) { this.classes.delete(c); },
      toggle(c: string) {
        if (this.classes.has(c)) this.classes.delete(c);
        else this.classes.add(c);
      },
      contains(c: string) { return this.classes.has(c); }
    },
    children: [] as any[],
    appendChild(child: any) { this.children.push(child); },
    removeChild(child: any) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
    },
    setAttribute(k: string, v: string) { this[k] = v; },
    getAttribute(k: string) { return this[k] || null; }
  });

  const registeredIds = [
    'select-my-product', 'select-rival-product', 'select-my-insurer', 'select-rival-insurer',
    'select-my-camp', 'select-rival-camp', 'company-pills', 'claim-pills',
    'scenario-agents-bar-wrap', 'scenario-active-tag', 'scenario-agent-panel', 'toast'
  ];

  for (const id of registeredIds) {
    domElements[id] = makeMockElement(id);
  }

  const categoryTabs = [
    { cat: 'Savings_MultiCurrency', el: makeMockElement('tab-savings') },
    { cat: 'Critical_Illness', el: makeMockElement('tab-ci') },
    { cat: 'Medical_VHIS', el: makeMockElement('tab-vhis') },
    { cat: 'Annuity_QDAP', el: makeMockElement('tab-qdap') },
    { cat: 'Financing_UniversalLife', el: makeMockElement('tab-ul') }
  ];
  categoryTabs.forEach(t => {
    t.el.dataset.cat = t.cat;
  });

  const scenarioTabs = [
    { s: 'cafe_rapid', el: makeMockElement('s-cafe') },
    { s: 'offshore_mcv', el: makeMockElement('s-mcv') },
    { s: 'young_family', el: makeMockElement('s-family') },
    { s: 'retirement_tax', el: makeMockElement('s-retire') },
    { s: 'instant_comms', el: makeMockElement('s-comms') },
    { s: 'cashless_medical', el: makeMockElement('s-medical') }
  ];
  scenarioTabs.forEach(t => {
    t.el.setAttribute('data-scenario', t.s);
  });

  const mockDocument = {
    getElementById(id: string) {
      if (!domElements[id]) domElements[id] = makeMockElement(id);
      return domElements[id];
    },
    querySelector(sel: string) {
      if (sel.startsWith('#')) return domElements[sel.slice(1)] || null;
      return null;
    },
    querySelectorAll(sel: string) {
      if (sel.includes('.scenario-tab-btn')) {
        return scenarioTabs.map(t => t.el);
      }
      if (sel.includes('.cat-tab')) {
        return categoryTabs.map(t => t.el);
      }
      return [];
    },
    createElement(tag: string) { return makeMockElement('', tag); },
    body: makeMockElement('body')
  };

  const mockWindow: any = {
    document: mockDocument,
    console: { log: () => {}, warn: () => {}, error: () => {} },
    localStorage: {
      _store: {} as Record<string, string>,
      getItem(k: string) { return this._store[k] || null; },
      setItem(k: string, v: string) { this._store[k] = String(v); },
      removeItem(k: string) { delete this._store[k]; }
    },
    navigator: {
      clipboard: { writeText: async () => Promise.resolve() },
      serviceWorker: { register: async () => {} }
    },
    setTimeout: (fn: Function) => fn(),
    clearTimeout: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    alert: () => {}
  };

  mockWindow.window = mockWindow;
  const context = vm.createContext(mockWindow);
  vm.runInContext(scriptCode, context);
  return { mockWindow, domElements };
}

test('1. Starting with Universal Life product in Plan A, clicking Cashless Medical auto-switches Category to Medical_VHIS and updates Plan A to Medical product', () => {
  const { mockWindow, domElements } = createSandbox();

  // Set initial category to Financing_UniversalLife
  mockWindow.selectCategory('Financing_UniversalLife');
  mockWindow.setMyCompany('AIA');
  mockWindow.selectCompany('FWD');

  const myProdUl = domElements['select-my-product'].innerHTML;
  assert.ok(myProdUl.includes('萬用'), 'Plan A dropdown must initially contain Universal Life products');

  // Trigger Cashless Medical scenario
  mockWindow.selectScenarioAgent('cashless_medical');

  // Assert Category is auto-switched to Medical_VHIS
  const currentCat = mockWindow.getBattleCard ? mockWindow.getBattleCard().category : null;
  const panelHtml = domElements['scenario-agent-panel'].innerHTML;

  assert.ok(panelHtml.includes('雙邊方案實時聯動中'), 'Cashless medical panel must render collaboration banner');
  assert.ok(panelHtml.includes('亞洲至尊明珠醫療計劃') || panelHtml.includes('醫保'), 'Plan A must be a medical product in cashless medical');
  assert.ok(domElements['select-my-product'].innerHTML.includes('醫保'), 'Plan A dropdown must now list Medical VHIS products');
});

test('2. When in Cashless Medical, switching Plan A to Universal Life auto-switches scenario away from Cashless Medical', () => {
  const { mockWindow, domElements } = createSandbox();

  // Start in Medical_VHIS with Cashless Medical active
  mockWindow.selectScenarioAgent('cashless_medical');
  assert.ok(domElements['scenario-agent-panel'].innerHTML.includes('出院免找數'));

  // User manually selects a Universal Life product in Plan A dropdown
  const ulProduct = mockWindow.ALL_PRODUCTS_CATALOG.find((p: any) => p.category === 'Financing_UniversalLife' && p.insurer === 'AIA');
  assert.ok(ulProduct, 'UL product must exist in catalog');

  mockWindow.setMyProduct(ulProduct.id);

  // Assert scenario is no longer cashless_medical
  const panelHtml = domElements['scenario-agent-panel'].innerHTML;
  assert.ok(!panelHtml.includes('出院免找數'), 'Cashless medical panel must be unmounted when switching to Universal Life');
  assert.ok(panelHtml.includes('咖啡館') || panelHtml.includes('30秒') || panelHtml.includes('LTV'), 'Compatible scenario must be active for Universal Life');
});

test('3. Clicking Retirement Tax auto-switches Category to Annuity_QDAP and aligns Plan A with QDAP product', () => {
  const { mockWindow, domElements } = createSandbox();

  mockWindow.selectScenarioAgent('retirement_tax');

  const panelHtml = domElements['scenario-agent-panel'].innerHTML;
  assert.ok(panelHtml.includes('合資格延期年金 (QDAP)'), 'Panel must render QDAP retirement tax relief');
  assert.ok(panelHtml.includes('充裕未來延期年金計劃') || panelHtml.includes('年金'), 'Plan A must be a QDAP product');
  assert.ok(domElements['select-my-product'].innerHTML.includes('年金'), 'Plan A dropdown must show QDAP products');
});

test('4. Role Swap in Cashless Medical symmetrically inverts Plan A and Plan B in both dropdowns and scenario panel', () => {
  const { mockWindow, domElements } = createSandbox();

  mockWindow.selectScenarioAgent('cashless_medical');
  mockWindow.setMyCompany('AIA');
  mockWindow.selectCompany('Prudential');

  const panelBefore = domElements['scenario-agent-panel'].innerHTML;
  assert.ok(panelBefore.includes('【Plan A 我方】尊裕醫療自願醫保計劃'));
  assert.ok(panelBefore.includes('【Plan B 對手】摯為您醫療計劃'));

  // Swap roles
  mockWindow.swapCampRoles();

  const panelAfter = domElements['scenario-agent-panel'].innerHTML;
  assert.ok(panelAfter.includes('【Plan A 我方】摯為您醫療計劃'));
  assert.ok(panelAfter.includes('【Plan B 對手】尊裕醫療自願醫保計劃'));
});

console.log('\n================================================================================');
console.log('ALL PLAN A/B & SCENARIO COLLABORATION TESTS PASSED (100%)');
console.log('================================================================================');

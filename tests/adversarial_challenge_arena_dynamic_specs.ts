/**
 * Empirical Adversarial Test: Arena Dynamic Product Specs & Claim Objection UX
 * 
 * Verifies:
 * 1. Product Switch in Dropdown -> Bilateral Specs Table dynamically updates values for selected products.
 * 2. Intra-Insurer Comparison -> Comparing two products from the same company renders distinct metrics.
 * 3. Claim Pill Selection -> Highlights corresponding spec row with class `spec-row-highlighted` and badge `🎯 攻防焦點`.
 * 4. Agent Private View -> Objection banner `#agent-objection-title` reflects current claim text.
 * 5. PM Guidance Tooltip & Context Labeling -> DOM contains explanatory elements for advisor field clarity.
 */

import fs from 'fs';
import path from 'path';
import assert from 'node:assert';
import vm from 'node:vm';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}
const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

console.log('================================================================================');
console.log('STARTING ARENA DYNAMIC SPECS & CLAIM UX VERIFICATION');
console.log('================================================================================');

const cafePath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
assert.ok(fs.existsSync(cafePath), 'templates/mobile_cafe_app.html must exist');
const cafeHtml = fs.readFileSync(cafePath, 'utf-8');

const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'Script block must exist in mobile_cafe_app.html');
const scriptCode = scriptMatch[1];

function createSandbox() {
  const domElements: Record<string, any> = {};

  const makeMockElement = (id: string, tagName: string = 'div') => {
    return {
      id,
      tagName: tagName.toUpperCase(),
      innerHTML: '',
      innerText: '',
      value: '',
      title: '',
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
      }
    };
  };

  const registeredIds = [
    'select-my-product',
    'select-rival-product',
    'select-my-camp',
    'select-rival-camp',
    'company-pills',
    'claim-pills',
    'bilateral-spec-table',
    'agent-title',
    'agent-step-1',
    'agent-step-2',
    'agent-step-3',
    'agent-trap-alert',
    'agent-objection-title',
    'client-title',
    'client-source',
    'client-desc',
    'client-chart-bars',
    'client-table',
    'corridor-meter-inner',
    'corridor-note-box',
    'horizon-desc',
    'horizon-slider',
    'claim-selector-section',
    'fineprint-reality-text',
    'fineprint-citation-text'
  ];

  for (const id of registeredIds) {
    domElements[id] = makeMockElement(id);
  }

  const sandbox: any = {
    window: {},
    document: {
      getElementById: (id: string) => domElements[id] || null,
      querySelectorAll: () => [],
      createElement: (tag: string) => makeMockElement('', tag),
      body: { appendChild: () => {}, removeChild: () => {} }
    },
    navigator: { clipboard: { writeText: async () => {} } },
    localStorage: {
      data: {} as Record<string, string>,
      getItem(k: string) { return this.data[k] || null; },
      setItem(k: string, v: string) { this.data[k] = v; }
    },
    console,
    clearTimeout: () => {},
    setTimeout: (fn: any) => fn(),
    addEventListener: () => {},
    alert: () => {}
  };
  sandbox.window = sandbox;
  sandbox.__domElements = domElements;

  vm.createContext(sandbox);
  vm.runInContext(scriptCode, sandbox);

  return sandbox;
}

test('Suite 1: Dropdown switching updates Bilateral Spec Table dynamically', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  // Find two different AIA products in catalog
  const aiaGP3 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('盈御多元貨幣計劃 3'));
  const aiaLove5 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('簡愛延續保障計劃 5'));
  assert.ok(aiaGP3, 'AIA GP3 must exist');
  assert.ok(aiaLove5, 'AIA Love 5 must exist');

  // Set My Product to GP3 and Rival Product to Pru Evergreen
  sb.setMyCompany('AIA');
  sb.selectCompany('Prudential');
  sb.setMyProduct(aiaGP3.id);
  
  const pruEvergreen = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('雋富多元貨幣計劃'));
  sb.setRivalProduct(pruEvergreen.id);

  const tableHtml1 = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml1.includes('22%'), 'GP3 has 22% max rebate');
  assert.ok(tableHtml1.includes('28%'), 'Pru Evergreen has 28% max rebate');

  // Switch My Product to AIA Love 5
  sb.setMyProduct(aiaLove5.id);
  const tableHtml2 = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml2.includes(aiaLove5.maxRebate > 0 ? aiaLove5.maxRebate + '%' : '0%'), 'Table must reflect Love 5 max rebate');
  assert.notStrictEqual(tableHtml1, tableHtml2, 'Table HTML must change when product changes');
});

test('Suite 2: Intra-insurer comparison renders distinct metrics for same-company products', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  const aiaGP3 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('盈御多元貨幣計劃 3'));
  const aiaLove5 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('簡愛延續保障計劃 5'));

  // Put both AIA products head-to-head
  sb.setMyCompany('AIA');
  sb.selectCompany('AIA');
  sb.setMyProduct(aiaGP3.id);
  sb.setRivalProduct(aiaLove5.id);

  const card = sb.getBattleCard('AIA', 'AIA', 'prepayment');
  assert.ok(card, 'Card must be generated for intra-insurer comparison');
  assert.ok(card.hero_our_name.includes('盈御'), 'Hero our must be GP3');
  assert.ok(card.hero_rival_name.includes('簡愛延續'), 'Hero rival must be Love 5');

  const tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('簡愛延續') || card.bilateral_specs.length === 6, 'Must generate 6 spec rows');
  assert.ok(card.agent_title.includes('內部主力'), 'Agent title must indicate intra-insurer selection');
});

test('Suite 3: Claim pill click highlights corresponding row with badge in spec table', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  // Test prepayment highlight
  sb.selectClaim('5.8% 預繳 / 保證高回報');

  let tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('spec-row-highlighted'), 'Must contain spec-row-highlighted class');
  assert.ok(tableHtml.includes('🎯 攻防焦點'), 'Must contain focus badge');
  assert.ok(tableHtml.includes('預繳保證利率'), 'Prepayment row must be present');

  // Test rebate highlight
  sb.selectClaim('首年保費回贈 28%');

  tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('spec-row-highlighted'), 'Rebate row must be highlighted');
  assert.ok(tableHtml.includes('首年保費回贈'), 'Rebate label must be present');
});

test('Suite 4: Agent Private View objection banner updates on claim click', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  sb.selectClaim('首年保費回贈 28%');

  const objectionTitle = sb.__domElements['agent-objection-title'].innerText;
  assert.strictEqual(objectionTitle, '首年保費回贈 28%', 'Objection title must match selected claim text');
});

test('Suite 5: HTML source contains PM context labeling and guide tip', () => {
  assert.ok(cafeHtml.includes('選擇客戶提出的競品噱頭 / 攻防焦點'), 'Must have claim selector header description');
  assert.ok(cafeHtml.includes('實戰指南'), 'Must have PM field advice tooltip');
  assert.ok(cafeHtml.includes('點擊下方對應標籤'), 'Must explain button utility to advisor');
  assert.ok(cafeHtml.includes('agent-objection-banner'), 'Must have objection banner in Agent View');
});

test('Suite 6: Role swapping symmetrically inverts camps and products', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  const aiaGP3 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('盈御多元貨幣計劃 3'));
  const pruEvergreen = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('雋富多元貨幣計劃'));

  sb.setMyCompany('AIA');
  sb.selectCompany('Prudential');
  sb.setMyProduct(aiaGP3.id);
  sb.setRivalProduct(pruEvergreen.id);

  // Swap roles
  sb.swapCampRoles();

  assert.strictEqual(sb.getMyCompany(), 'Prudential', 'My company should now be Prudential');
  assert.strictEqual(sb.getRivalCompany(), 'AIA', 'Selected rival should now be AIA');
  assert.strictEqual(sb.getMySelectedProduct().id, pruEvergreen.id, 'My product should now be Pru Evergreen');
  assert.strictEqual(sb.getRivalSelectedProduct().id, aiaGP3.id, 'Rival product should now be AIA GP3');
});

console.log('================================================================================');
console.log('TEST SUMMARY');
console.log('================================================================================');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
assert.strictEqual(failed, 0, 'All arena dynamic specs tests must pass');

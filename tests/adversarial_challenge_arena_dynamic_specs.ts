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

test('Suite 7: Critical Illness product switching (FWD 危疾加諾保 vs 危疾致諾) dynamically renders CI specs', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  const fwdXcelerator = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('危疾加諾保'));
  const fwdSupreme = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('危疾致諾'));
  assert.ok(fwdXcelerator, 'FWD 危疾加諾保 must exist in catalog');
  assert.ok(fwdSupreme, 'FWD 危疾致諾 must exist in catalog');

  sb.selectCategory('Critical_Illness');
  sb.setMyCompany('FWD');
  sb.selectCompany('FWD');
  sb.setMyProduct(fwdXcelerator.id);
  sb.setRivalProduct(fwdSupreme.id);

  const tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('癌症再次索償等待期'), 'Table must contain 癌症再次索償等待期');
  assert.ok(tableHtml.includes('涵蓋嚴重疾病總數'), 'Table must contain 涵蓋嚴重疾病總數');
  assert.ok(tableHtml.includes('130 種'), 'Table must reflect 危疾加諾保 130 種');
  assert.ok(tableHtml.includes('135 種'), 'Table must reflect 危疾致諾 135 種');
  assert.ok(tableHtml.includes('1000%'), 'Table must reflect 危疾加諾保 1000% multiple limit');
  assert.ok(tableHtml.includes('1100%'), 'Table must reflect 危疾致諾 1100% multiple limit');
  assert.ok(tableHtml.includes('深切治療部 (ICU) 預支'), 'Table must contain ICU 預支 row');
  assert.ok(tableHtml.includes('首年保費折扣'), 'Table must contain 首年保費折扣');
  assert.ok(tableHtml.includes('20%'), 'Table must reflect 20% discount');
  assert.ok(tableHtml.includes('22%'), 'Table must reflect 22% discount');
});

test('Suite 8: Medical VHIS product selection dynamically renders VHIS specs', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  sb.selectCategory('Medical_VHIS');
  sb.setMyCompany('AIA');
  sb.selectCompany('Bowtie');

  const aiaVhis = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.insurer === 'AIA' && sb.normalizeCategory(p.category) === 'Medical_VHIS');
  const bowtieVhis = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.insurer === 'Bowtie' && sb.normalizeCategory(p.category) === 'Medical_VHIS');
  assert.ok(aiaVhis, 'AIA VHIS must exist');
  assert.ok(bowtieVhis, 'Bowtie VHIS must exist');

  sb.setMyProduct(aiaVhis.id);
  sb.setRivalProduct(bowtieVhis.id);

  const tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('全年保障限額'), 'Table must contain 全年保障限額');
  assert.ok(tableHtml.includes('非手術癌症標靶治療'), 'Table must contain 非手術癌症標靶治療');
  assert.ok(tableHtml.includes('出院免找數 (Cashless) 直付'), 'Table must contain 出院免找數 (Cashless) 直付');
  assert.ok(tableHtml.includes('每年法定稅務扣除額'), 'Table must contain 每年法定稅務扣除額');
  assert.ok(tableHtml.includes('HK$8,000'), 'Table must reflect HK$8,000 tax deduction');
});

test('Suite 9: QDAP Annuity product selection dynamically renders QDAP specs', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  sb.selectCategory('Annuity_QDAP');
  sb.setMyCompany('AIA');
  sb.selectCompany('Prudential');

  const aiaQdap = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.insurer === 'AIA' && sb.normalizeCategory(p.category) === 'Annuity_QDAP');
  const pruQdap = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.insurer === 'Prudential' && sb.normalizeCategory(p.category) === 'Annuity_QDAP');
  assert.ok(aiaQdap, 'AIA QDAP must exist');
  assert.ok(pruQdap, 'Pru QDAP must exist');

  sb.setMyProduct(aiaQdap.id);
  sb.setRivalProduct(pruQdap.id);

  const tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('每年實質慳稅額'), 'Table must contain 每年實質慳稅額');
  assert.ok(tableHtml.includes('HK$10,200'), 'Table must reflect HK$10,200 tax savings');
  assert.ok(tableHtml.includes('保證內部回報率 IRR'), 'Table must contain 保證內部回報率 IRR');
  assert.ok(tableHtml.includes('QDAP 總內部回報率 IRR'), 'Table must contain QDAP 總內部回報率 IRR');
  assert.ok(tableHtml.includes('保證年金利益佔比'), 'Table must contain 保證年金利益佔比');
});

test('Suite 10: Universal Life product selection dynamically renders UL specs', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  sb.selectCategory('Financing_UniversalLife');
  sb.setMyCompany('AIA');
  sb.selectCompany('Manulife');

  const aiaUL = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.insurer === 'AIA' && sb.normalizeCategory(p.category) === 'Financing_UniversalLife');
  const manuUL = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.insurer === 'Manulife' && sb.normalizeCategory(p.category) === 'Financing_UniversalLife');
  assert.ok(aiaUL, 'AIA UL must exist');
  assert.ok(manuUL, 'Manulife UL must exist');

  sb.setMyProduct(aiaUL.id);
  sb.setRivalProduct(manuUL.id);

  const tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('最高融資成數 LTV'), 'Table must contain 最高融資成數 LTV');
  assert.ok(tableHtml.includes('最低保證結算利率 (Floor)'), 'Table must contain 最低保證結算利率 (Floor)');
  assert.ok(tableHtml.includes('當前結算利率 (Crediting)'), 'Table must contain 當前結算利率 (Crediting)');
  assert.ok(tableHtml.includes('融資借貸淨息差 (Spread)'), 'Table must contain 融資借貸淨息差 (Spread)');
  assert.ok(tableHtml.includes('追加保證金 (Margin Call) 緩衝'), 'Table must contain 追加保證金 (Margin Call) 緩衝');
});

test('Suite 11: Dynamic policy horizon projections reflect category-specific timelines', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  // 1. Critical Illness Horizon
  sb.selectCategory('Critical_Illness');
  const cardCI = sb.getBattleCard('FWD', 'FWD', 'critical_illness');
  assert.ok(cardCI.horizon_data[5].includes('生命防線') || cardCI.horizon_data[5].includes('ICU'), 'CI horizon 5 must mention ICU/protection');
  assert.ok(cardCI.horizon_data[20].includes('20年供款期滿'), 'CI horizon 20 must mention 20年供款期滿');

  // 2. VHIS Horizon
  sb.selectCategory('Medical_VHIS');
  const cardVHIS = sb.getBattleCard('AIA', 'Bowtie', 'vhis');
  assert.ok(cardVHIS.horizon_data[5].includes('稅務扣除') || cardVHIS.horizon_data[5].includes('Cashless'), 'VHIS horizon 5 must mention tax/Cashless');

  // 3. QDAP Horizon
  sb.selectCategory('Annuity_QDAP');
  const cardQDAP = sb.getBattleCard('AIA', 'Prudential', 'qdap');
  assert.ok(cardQDAP.horizon_data[5].includes('慳稅') || cardQDAP.horizon_data[5].includes('51,000'), 'QDAP horizon 5 must mention 慳稅');

  // 4. Universal Life Horizon
  sb.selectCategory('Financing_UniversalLife');
  const cardUL = sb.getBattleCard('AIA', 'Manulife', 'financing_ul');
  assert.ok(cardUL.horizon_data[5].includes('息差') || cardUL.horizon_data[5].includes('淨息差'), 'UL horizon 5 must mention 息差');
});

test('Suite 12: Chart bars display product names instead of generic company names', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  const aiaGP3 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('盈御多元貨幣計劃 3'));
  const aiaLove5 = sb.ALL_PRODUCTS_CATALOG.find((p: any) => p.name.includes('簡愛延續保障計劃 5'));

  sb.setMyCompany('AIA');
  sb.selectCompany('AIA');
  sb.setMyProduct(aiaGP3.id);
  sb.setRivalProduct(aiaLove5.id);

  const card = sb.getBattleCard('AIA', 'AIA', 'prepayment');
  assert.ok(card.chart_bars.length >= 2, 'Chart bars must exist');
  assert.ok(card.chart_bars[0].label.includes('盈御'), 'First chart bar must display GP3 product name');
  assert.ok(card.chart_bars[1].label.includes('簡愛延續'), 'Second chart bar must display Love 5 product name');
  assert.notStrictEqual(card.chart_bars[0].label, card.chart_bars[1].label, 'Plan A and Plan B chart bars must have distinct labels');
});

test('Suite 13: Claim pill clicks in CI, VHIS, QDAP, UL highlight their respective category spec rows', () => {
  const sb = createSandbox();
  sb.updateCampSelectors();

  // CI: highlight cancer wait
  sb.selectCategory('Critical_Illness');
  sb.selectClaim('癌症再次索償等待期 (2年 vs 3年)');
  let tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('spec-row-highlighted'), 'Must highlight row');
  assert.ok(tableHtml.includes('癌症再次索償等待期'), 'Must target 癌症再次索償等待期 row');

  // VHIS: highlight cashless
  sb.selectCategory('Medical_VHIS');
  sb.selectClaim('全額出院免找數 (Cashless)');
  tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('spec-row-highlighted'), 'Must highlight row');
  assert.ok(tableHtml.includes('出院免找數 (Cashless) 直付'), 'Must target 出院免找數 row');

  // QDAP: highlight tax savings
  sb.selectCategory('Annuity_QDAP');
  sb.selectClaim('每年實慳 HK$10,200 稅款');
  tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('spec-row-highlighted'), 'Must highlight row');
  assert.ok(tableHtml.includes('每年實質慳稅額'), 'Must target 每年實質慳稅額 row');

  // UL: highlight LTV
  sb.selectCategory('Financing_UniversalLife');
  sb.selectClaim('保費融資 85% LTV 槓桿');
  tableHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
  assert.ok(tableHtml.includes('spec-row-highlighted'), 'Must highlight row');
  assert.ok(tableHtml.includes('最高融資成數 LTV'), 'Must target 最高融資成數 LTV row');
});

console.log('================================================================================');
console.log('TEST SUMMARY');
console.log('================================================================================');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
assert.strictEqual(failed, 0, 'All arena dynamic specs tests must pass');


/**
 * Comprehensive Verification & QA Test Suite: Boost V2 Deliverable Features
 * 
 * Verifies:
 * 1. Expanded Insurance Plans & Companies:
 *    - 99 plans across 15 insurers in ALL_PRODUCTS_CATALOG.
 *    - Verified inclusion of HSBC Life, Generali, Blue Cross, China Life Overseas.
 *    - Balanced distribution across 5 categories:
 *      Savings (20), CI (20), VHIS (20), QDAP (19), UL (20).
 *    - Strict product schema integrity (clause_highlights, clause_pitfalls, last_updated).
 * 
 * 2. 1v1 Bilateral Actuarial Scorecard (#bilateral-radar-scorecard):
 *    - 5 quantifiable dimensions: expected_return, guaranteed_safety, underwriting_friendliness, coverage_capacity, liquidity_split.
 *    - Dual horizontal progress bars (our-bar, rival-bar).
 *    - Delta badge generation (delta-lead with 🏆, delta-lag, delta-tie).
 * 
 * 3. Clause Highlights & Pitfalls:
 *    - Client View (#bilateral-clause-comparison): dual-column comparative grid, highlights & pitfalls with GL20 disclosure.
 *    - Agent View (#agent-clause-intel): attack points (🔥 攻擊點) and trump cards (💎 核心王牌) with coaching scripts.
 * 
 * 4. Audit & Regulatory Timestamp:
 *    - "最後資料更新日期：2026年11月06日" across top date banner, tear-sheet (#client-source), and agent HUD (.secret-badge).
 *    - Dynamic preservation across reactive update loops.
 * 
 * 5. Dynamic Switching Across All 5 Categories:
 *    - Dynamic reactive updates for Savings, CI, VHIS, QDAP, and Universal Life.
 *    - Bilateral role swapping (swapCampRoles) preserves data integrity and inverts perspectives.
 * 
 * 6. Template Parity:
 *    - 100% byte-for-byte SHA256 parity between templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html.
 */

import fs from 'fs';
import path from 'path';
import assert from 'node:assert';
import crypto from 'node:crypto';
import vm from 'node:vm';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const testResults: TestResult[] = [];
let currentSuite = 'General';

function suite(name: string, fn: () => void) {
  currentSuite = name;
  console.log(`\n--- [TEST SUITE] ${name} ---`);
  fn();
}

function test(name: string, fn: () => void) {
  const start = performance.now();
  try {
    fn();
    const durationMs = performance.now() - start;
    testResults.push({ suite: currentSuite, name, passed: true, durationMs });
    console.log(`  [PASS] (${durationMs.toFixed(2)}ms) ${name}`);
  } catch (err: any) {
    const durationMs = performance.now() - start;
    testResults.push({ suite: currentSuite, name, passed: false, error: err.message, durationMs });
    console.error(`  [FAIL] (${durationMs.toFixed(2)}ms) ${name}: ${err.message}`);
  }
}

console.log('================================================================================');
console.log('INSURINTEL HK - FINAL COMPREHENSIVE QA VERIFICATION SUITE');
console.log('Testing: 99 Plans / 15 Insurers / Scorecard / Clause Intel / GL20 / Byte Parity');
console.log('================================================================================');

const templatesPath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path.join(process.cwd(), 'dist', 'cafe.html');

assert.ok(fs.existsSync(templatesPath), 'templates/mobile_cafe_app.html must exist');
assert.ok(fs.existsSync(distIndexPath), 'dist/index.html must exist');
assert.ok(fs.existsSync(distCafePath), 'dist/cafe.html must exist');

const cafeHtml = fs.readFileSync(templatesPath, 'utf-8');
const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'Script block must exist in mobile_cafe_app.html');
const scriptCode = scriptMatch[1];

function createSandbox() {
  const domElements: Record<string, any> = {};

  const makeMockElement = (id: string = '', tagName: string = 'div'): any => {
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
      },
      children: [] as any[],
      appendChild(child: any) { this.children.push(child); },
      removeChild(child: any) {
        const idx = this.children.indexOf(child);
        if (idx >= 0) this.children.splice(idx, 1);
      },
      setAttribute(k: string, v: string) { this[k] = v; },
      getAttribute(k: string) { return this[k] || null; }
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
    'bilateral-radar-scorecard',
    'bilateral-clause-comparison',
    'agent-clause-intel',
    'agent-title',
    'agent-step-1',
    'agent-step-2',
    'agent-step-3',
    'agent-trap-alert',
    'agent-objection-title',
    'client-title',
    'client-source',
    'client-desc',
    'client-chart-title',
    'client-chart-bars',
    'client-table-title',
    'client-table',
    'client-disclaimer',
    'hero-our-name',
    'hero-rival-name',
    'corridor-desc',
    'corridor-our-pointer',
    'corridor-rival-pointer',
    'corridor-our-label',
    'corridor-meter-inner',
    'corridor-note-box',
    'fineprint-claim',
    'fineprint-reality',
    'fineprint-citation',
    'fineprint-reality-text',
    'fineprint-citation-text',
    'horizon-desc',
    'horizon-slider',
    'horizon-year-badge',
    'claim-selector-section',
    'top-date-banner',
    'btn-agent-view',
    'btn-client-view',
    'agent-view',
    'client-view',
    'catalog-drawer',
    'catalog-grid',
    'catalog-search-input'
  ];

  for (const id of registeredIds) {
    domElements[id] = makeMockElement(id);
  }

  // Pre-populate top-date-banner text as in template
  domElements['top-date-banner'].innerHTML = '<span>📅 最後資料更新日期：2026年11月06日 · 香港保監局 GN16 / 各保司官方通函及說明書核定</span>';

  const sandbox: any = {
    window: {},
    document: {
      getElementById: (id: string) => domElements[id] || null,
      querySelector: (sel: string) => {
        if (sel.startsWith('#')) return domElements[sel.slice(1)] || null;
        return null;
      },
      querySelectorAll: (sel: string) => {
        if (sel === '.cat-tab') return [];
        if (sel === '.thumb-pill') return [];
        return [];
      },
      createElement: (tag: string) => makeMockElement('', tag),
      body: { appendChild: () => {}, removeChild: () => {} }
    },
    navigator: {
      clipboard: { writeText: async () => {} },
      serviceWorker: { register: async () => {} }
    },
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

// ============================================================================
// SUITE 1: 99 Plans & 15 Insurers Catalog Integrity
// ============================================================================
suite('1. Expanded Plans & Insurers Catalog (99 Plans across 15 Insurers)', () => {
  const sb = createSandbox();
  const catalog = sb.ALL_PRODUCTS_CATALOG;

  test('Total products in ALL_PRODUCTS_CATALOG must equal exactly 99', () => {
    assert.strictEqual(Array.isArray(catalog), true, 'Catalog must be an array');
    assert.strictEqual(catalog.length, 99, `Expected 99 products, got ${catalog.length}`);
  });

  test('Total unique insurers must equal exactly 15 with required top and challenger players', () => {
    const insurers = new Set(catalog.map((p: any) => p.insurer));
    assert.strictEqual(insurers.size, 15, `Expected 15 insurers, got ${insurers.size}`);

    const expectedInsurers = [
      'AIA', 'Prudential', 'Manulife', 'Sun_Life', 'FWD', 'AXA',
      'BOC_Life', 'YF_Life', 'HSBC', 'Generali', 'ChinaLife', 'BlueCross',
      'Bowtie', 'Cigna', 'Bupa'
    ];
    for (const ins of expectedInsurers) {
      assert.ok(insurers.has(ins), `Catalog must contain insurer: ${ins}`);
    }
  });

  test('Specifically verify presence of HSBC Life, Generali, Blue Cross, and China Life Overseas', () => {
    const hsbcProds = catalog.filter((p: any) => p.insurer === 'HSBC');
    const genProds = catalog.filter((p: any) => p.insurer === 'Generali');
    const blueProds = catalog.filter((p: any) => p.insurer === 'BlueCross');
    const chinaProds = catalog.filter((p: any) => p.insurer === 'ChinaLife');

    assert.ok(hsbcProds.length >= 6, `HSBC Life must have products, found: ${hsbcProds.length}`);
    assert.ok(genProds.length >= 5, `Generali must have products, found: ${genProds.length}`);
    assert.ok(blueProds.length >= 5, `Blue Cross must have products, found: ${blueProds.length}`);
    assert.ok(chinaProds.length >= 6, `China Life Overseas must have products, found: ${chinaProds.length}`);
  });

  test('Distribution across all 5 categories matches specification (20/20/20/19/20)', () => {
    const counts: Record<string, number> = {};
    for (const p of catalog) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    assert.strictEqual(counts['Savings_MultiCurrency'], 20, 'Savings must have 20 products');
    assert.strictEqual(counts['Critical_Illness'], 20, 'CI must have 20 products');
    assert.strictEqual(counts['Medical_VHIS'], 20, 'VHIS must have 20 products');
    assert.strictEqual(counts['Annuity_QDAP'], 19, 'QDAP must have 19 products');
    assert.strictEqual(counts['Financing_UniversalLife'], 20, 'UL must have 20 products');
  });

  test('Every product must contain clause_highlights, clause_pitfalls, and last_updated=2026-11-06', () => {
    for (const p of catalog) {
      assert.ok(p.id, `Product ${p.name} must have promo id`);
      assert.ok(Array.isArray(p.clause_highlights) && p.clause_highlights.length > 0,
        `Product ${p.id} (${p.name}) must have non-empty clause_highlights`);
      assert.ok(Array.isArray(p.clause_pitfalls) && p.clause_pitfalls.length > 0,
        `Product ${p.id} (${p.name}) must have non-empty clause_pitfalls`);
      assert.strictEqual(p.last_updated, '2026-11-06',
        `Product ${p.id} (${p.name}) last_updated must be 2026-11-06`);
    }
  });
});

// ============================================================================
// SUITE 2: 1v1 Bilateral Actuarial Scorecard (#bilateral-radar-scorecard)
// ============================================================================
suite('2. 1v1 Bilateral Actuarial Scorecard & Dual Progress Bars', () => {
  const sb = createSandbox();

  test('Radar Scorecard renders into #bilateral-radar-scorecard with 5 quantifiable dimensions', () => {
    sb.setMyCompany('AIA');
    sb.selectCompany('Prudential');
    sb.updateBattleCard();

    const container = sb.__domElements['bilateral-radar-scorecard'];
    assert.ok(container, 'Container #bilateral-radar-scorecard must exist');
    const html = container.innerHTML;
    assert.ok(html.length > 0, 'Scorecard HTML must not be empty');

    assert.ok(html.includes('1v1 雙邊精算維度雷達計分卡'), 'Header must contain title');
    assert.ok(html.includes('五維量化評分 (0-100)'), 'Header must indicate 5 dimensions');

    // Verify all 5 dimension labels
    const requiredDimensions = [
      '預期回報 / 槓桿倍數',
      '保證安全 / GN16 實現率',
      '條款友善 / 等候期',
      '保障廣度 / 額度天花板',
      '資金流動 / 保單分拆傳承'
    ];
    for (const dim of requiredDimensions) {
      assert.ok(html.includes(dim), `Scorecard must display dimension: ${dim}`);
    }
  });

  test('Dual horizontal comparison progress bars render with scores and width styling', () => {
    sb.setMyCompany('AIA');
    sb.selectCompany('Prudential');
    sb.updateBattleCard();

    const html = sb.__domElements['bilateral-radar-scorecard'].innerHTML;
    assert.ok(html.includes('our-bar'), 'Must contain Plan A progress bar (.our-bar)');
    assert.ok(html.includes('rival-bar'), 'Must contain Plan B progress bar (.rival-bar)');
    assert.ok(html.includes('scorecard-dual-track'), 'Must contain dual track layout');
    assert.ok(html.includes('scorecard-row'), 'Must contain scorecard rows');
  });

  test('Delta badges correctly compute lead (+N分 我方領先 🏆), lag (-N分 對手領先), and tie (持平)', () => {
    const card = sb.getBattleCard('AIA', 'Prudential', 'prepayment');
    assert.ok(Array.isArray(card.radar_scorecard), 'Card must have radar_scorecard array');
    assert.strictEqual(card.radar_scorecard.length, 5, 'Must have exactly 5 scorecard items');

    for (const item of card.radar_scorecard) {
      assert.strictEqual(typeof item.our_score, 'number', 'our_score must be number');
      assert.strictEqual(typeof item.rival_score, 'number', 'rival_score must be number');
      assert.strictEqual(item.delta, item.our_score - item.rival_score, 'Delta must equal our_score - rival_score');
      assert.ok(item.our_score >= 0 && item.our_score <= 100, 'Score must be within 0-100');
      assert.ok(item.rival_score >= 0 && item.rival_score <= 100, 'Score must be within 0-100');
    }

    const html = sb.__domElements['bilateral-radar-scorecard'].innerHTML;
    // Check presence of delta badges in rendered output
    assert.ok(
      html.includes('delta-lead') || html.includes('delta-lag') || html.includes('delta-tie'),
      'Rendered scorecard must contain delta badge classes'
    );
  });
});

// ============================================================================
// SUITE 3: Bilateral Clause Highlights & Pitfalls (Client View & Agent View)
// ============================================================================
suite('3. Bilateral Clause Highlights & Pitfalls Comparison', () => {
  const sb = createSandbox();

  test('Client View (#bilateral-clause-comparison) renders dual columns for Plan A and Plan B', () => {
    sb.setMyCompany('AIA');
    sb.selectCompany('Prudential');
    sb.updateBattleCard();

    const container = sb.__domElements['bilateral-clause-comparison'];
    assert.ok(container, 'Container #bilateral-clause-comparison must exist');
    const html = container.innerHTML;

    assert.ok(html.includes('條款亮點與細則盲點雙邊對照卡'), 'Title must be present');
    assert.ok(html.includes('clause-col-our'), 'Plan A column must be present');
    assert.ok(html.includes('clause-col-rival'), 'Plan B column must be present');
    assert.ok(html.includes('✨ 核心條款亮點 (Highlights)'), 'Highlights section title must be present');
    assert.ok(html.includes('⚠️ 條款細則提示 (Key Disclosures)'), 'Pitfalls section title must be present');
    assert.ok(html.includes('clause-highlight-item'), 'Must contain highlight items');
    assert.ok(html.includes('clause-pitfall-item'), 'Must contain pitfall items');
  });

  test('Client View clause comparison contains statutory HKIA GL20 disclaimer', () => {
    const html = sb.__domElements['bilateral-clause-comparison'].innerHTML;
    assert.ok(html.includes('香港保監局《持牌保險中介人操守守則》') || html.includes('香港保監局《操守準則》'), 'Must cite HKIA Code of Conduct');
    assert.ok(html.includes('客觀披露準則') || html.includes('雙邊客觀披露規範'), 'Must note objective disclosure standards');
  });

  test('Agent Private View (#agent-clause-intel) renders tactical attack points and trumps', () => {
    sb.setMyCompany('AIA');
    sb.selectCompany('Prudential');
    sb.updateBattleCard();

    const container = sb.__domElements['agent-clause-intel'];
    assert.ok(container, 'Container #agent-clause-intel must exist');
    const html = container.innerHTML;

    assert.ok(html.includes('條款狙擊情報庫 (Fine-Print Battle Intel)'), 'Header must contain battle intel title');
    assert.ok(html.includes('🔥 攻擊點'), 'Must render rival attack points');
    assert.ok(html.includes('💎 核心王牌'), 'Must render our trump cards');
    assert.ok(html.includes('提問破局金句'), 'Must provide coaching question prompt');
    assert.ok(html.includes('促成攻防金句'), 'Must provide closing punchline prompt');
  });
});

// ============================================================================
// SUITE 4: Audit & Regulatory Timestamp "最後資料更新日期：2026年11月06日"
// ============================================================================
suite('4. Regulatory Timestamp Integrity (最後資料更新日期：2026年11月06日)', () => {
  test('Top date banner in HTML contains exact timestamp "最後資料更新日期：2026年11月06日"', () => {
    assert.ok(
      cafeHtml.includes('最後資料更新日期：2026年11月06日'),
      'HTML source must include "最後資料更新日期：2026年11月06日"'
    );
    assert.ok(
      cafeHtml.includes('id="top-date-banner"'),
      'HTML must contain #top-date-banner element'
    );
  });

  test('Agent HUD secret badge contains exact timestamp "最後資料更新日期：2026年11月06日"', () => {
    assert.ok(
      cafeHtml.includes('class="secret-badge"') &&
      cafeHtml.includes('持牌人私密提詞 · 嚴禁直接展示給客戶 · 最後資料更新日期：2026年11月06日'),
      'Secret badge in Agent HUD must contain exact timestamp'
    );
  });

  test('Client tear-sheet #client-source dynamically maintains "最後資料更新日期：2026年11月06日" after updates', () => {
    const sb = createSandbox();
    sb.updateBattleCard();

    const clientSource = sb.__domElements['client-source'];
    assert.ok(clientSource, '#client-source element must exist');
    assert.ok(
      clientSource.innerHTML.includes('最後資料更新日期：2026年11月06日'),
      `#client-source must include timestamp after updateBattleCard(), got: "${clientSource.innerHTML}"`
    );

    // Test across another company & category
    sb.setMyCompany('Manulife');
    sb.selectCompany('FWD');
    sb.updateBattleCard();
    assert.ok(
      clientSource.innerHTML.includes('最後資料更新日期：2026年11月06日'),
      `#client-source must maintain timestamp after company switch, got: "${clientSource.innerHTML}"`
    );
  });
});

// ============================================================================
// SUITE 5: Dynamic Switching Across All 5 Categories & Role Inversion
// ============================================================================
suite('5. Dynamic Switching Across All 5 Categories & Stance Inversion', () => {
  const sb = createSandbox();

  const categoryTestCases = [
    {
      cat: 'Savings_MultiCurrency',
      name: '儲蓄分紅',
      myCo: 'AIA',
      myProdMatch: '盈御',
      rivCo: 'Prudential',
      rivProdMatch: '雋富',
      expectedSpecKey: '保證回本年期'
    },
    {
      cat: 'Critical_Illness',
      name: '重疾危疾',
      myCo: 'FWD',
      myProdMatch: '危疾加諾保',
      rivCo: 'AIA',
      rivProdMatch: '友心意',
      expectedSpecKey: '涵蓋嚴重疾病總數'
    },
    {
      cat: 'Medical_VHIS',
      name: '自願醫保',
      myCo: 'Bowtie',
      myProdMatch: 'Bowtie Pink',
      rivCo: 'Bupa',
      rivProdMatch: '保柏英雄',
      expectedSpecKey: '全年保障限額'
    },
    {
      cat: 'Annuity_QDAP',
      name: '扣稅年金',
      myCo: 'BOC_Life',
      myProdMatch: '延期年金',
      rivCo: 'Sun_Life',
      rivProdMatch: '萬年延期年金',
      expectedSpecKey: '保證內部回報率 IRR'
    },
    {
      cat: 'Financing_UniversalLife',
      name: '萬用融資',
      myCo: 'AXA',
      myProdMatch: '盛世傳承',
      rivCo: 'FWD',
      rivProdMatch: '富逸傳家',
      expectedSpecKey: '最高融資成數 LTV'
    }
  ];

  for (const tc of categoryTestCases) {
    test(`Category [${tc.name}] (${tc.cat}): Dynamic updates for ${tc.myCo} vs ${tc.rivCo}`, () => {
      sb.selectCategory(tc.cat);
      sb.setMyCompany(tc.myCo);
      sb.selectCompany(tc.rivCo);

      // Select matching products if available
      const myProd = sb.ALL_PRODUCTS_CATALOG.find(
        (p: any) => p.category === tc.cat && p.insurer === tc.myCo && p.name.includes(tc.myProdMatch.slice(0, 3))
      );
      const rivProd = sb.ALL_PRODUCTS_CATALOG.find(
        (p: any) => p.category === tc.cat && p.insurer === tc.rivCo && p.name.includes(tc.rivProdMatch.slice(0, 3))
      );

      if (myProd) sb.setMyProduct(myProd.id);
      if (rivProd) sb.setRivalProduct(rivProd.id);

      sb.updateBattleCard();

      // 1. Verify Spec Table contains expected dimension
      const specHtml = sb.__domElements['bilateral-spec-table'].innerHTML;
      assert.ok(specHtml.includes(tc.expectedSpecKey), `Spec table must include '${tc.expectedSpecKey}' for ${tc.cat}`);

      // 2. Verify Scorecard renders 5 dimensions
      const radarHtml = sb.__domElements['bilateral-radar-scorecard'].innerHTML;
      assert.ok(radarHtml.includes('預期回報 / 槓桿倍數'), 'Radar must render expected_return');
      assert.ok(radarHtml.includes('保證安全 / GN16 實現率'), 'Radar must render guaranteed_safety');

      // 3. Verify Clause Comparison renders highlights & pitfalls
      const clauseHtml = sb.__domElements['bilateral-clause-comparison'].innerHTML;
      assert.ok(clauseHtml.includes('clause-col-our'), 'Must render our clause column');
      assert.ok(clauseHtml.includes('clause-col-rival'), 'Must render rival clause column');

      // 4. Verify Agent Private Intel renders
      const agentIntelHtml = sb.__domElements['agent-clause-intel'].innerHTML;
      assert.ok(agentIntelHtml.includes('條款狙擊情報庫'), 'Must render agent clause intel');

      // 5. Verify timestamp retention
      const clientSource = sb.__domElements['client-source'].innerHTML;
      assert.ok(clientSource.includes('最後資料更新日期：2026年11月06日'), 'Timestamp must persist');
    });
  }

  test('swapCampRoles symmetrically swaps Plan A & Plan B across all visualizations', () => {
    sb.selectCategory('Savings_MultiCurrency');
    sb.setMyCompany('AIA');
    sb.selectCompany('Prudential');
    sb.updateBattleCard();

    const heroOurBefore = sb.__domElements['hero-our-name'].innerText;
    const heroRivBefore = sb.__domElements['hero-rival-name'].innerText;

    sb.swapCampRoles();

    const heroOurAfter = sb.__domElements['hero-our-name'].innerText;
    const heroRivAfter = sb.__domElements['hero-rival-name'].innerText;

    assert.strictEqual(heroOurAfter, heroRivBefore, 'Our hero after swap must match Rival hero before swap');
    assert.strictEqual(heroRivAfter, heroOurBefore, 'Rival hero after swap must match Our hero before swap');

    const card = sb.getBattleCard(sb.getMyCompany(), sb.getRivalCompany(), 'prepayment');
    assert.strictEqual(card.hero_our_name, heroOurAfter, 'Card hero our must match swapped state');
  });
});

// ============================================================================
// SUITE 6: Template Parity Verification (Byte Parity & Hash Match)
// ============================================================================
suite('6. Template Byte-for-Byte Parity Check', () => {
  const getHash = (filePath: string) => {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  };

  test('templates/mobile_cafe_app.html and dist/index.html have identical SHA-256 hash', () => {
    const hashTemplate = getHash(templatesPath);
    const hashIndex = getHash(distIndexPath);
    assert.strictEqual(
      hashTemplate,
      hashIndex,
      `Byte mismatch: templates/mobile_cafe_app.html (${hashTemplate}) != dist/index.html (${hashIndex})`
    );
  });

  test('templates/mobile_cafe_app.html and dist/cafe.html have identical SHA-256 hash', () => {
    const hashTemplate = getHash(templatesPath);
    const hashCafe = getHash(distCafePath);
    assert.strictEqual(
      hashTemplate,
      hashCafe,
      `Byte mismatch: templates/mobile_cafe_app.html (${hashTemplate}) != dist/cafe.html (${hashCafe})`
    );
  });

  test('All three HTML distribution targets have identical byte length', () => {
    const lenTemplate = fs.statSync(templatesPath).size;
    const lenIndex = fs.statSync(distIndexPath).size;
    const lenCafe = fs.statSync(distCafePath).size;

    assert.strictEqual(lenTemplate, lenIndex, 'Length of template and dist/index.html must match');
    assert.strictEqual(lenTemplate, lenCafe, 'Length of template and dist/cafe.html must match');
    assert.ok(lenTemplate > 350000, `Expected template size > 350KB, got ${lenTemplate}`);
  });
});

// ============================================================================
// EXECUTION SUMMARY
// ============================================================================
console.log('\n================================================================================');
console.log('QA VERIFICATION SUMMARY');
console.log('================================================================================');

const passedCount = testResults.filter(r => r.passed).length;
const failedCount = testResults.filter(r => !r.passed).length;
console.log(`Total Scenarios Tested : ${testResults.length}`);
console.log(`Passed                 : ${passedCount}`);
console.log(`Failed                 : ${failedCount}`);

if (failedCount > 0) {
  console.error('\nFAILED TESTS:');
  for (const r of testResults.filter(r => !r.passed)) {
    console.error(`- [${r.suite}] ${r.name}: ${r.error}`);
  }
  process.exit(1);
} else {
  console.log('\nVERDICT: ALL V2 BOOST DELIVERABLE ACCEPTANCE CRITERIA EMPIRICALLY VERIFIED (100% PASS).');
  console.log('================================================================================');
}

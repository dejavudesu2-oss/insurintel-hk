/**
 * tests/verification_30_comments_and_hospital_matrix.ts
 * Rigorous Verification Suite for:
 * 1. 30 Improvement Comments (15 Client + 15 Agent) with PM/PdM Resolution
 * 2. All 13 Private Hospitals in Hong Kong with LOG Deposit Waiver & Direct Billing
 * 3. GN16 100% Official Benchmark Plain-Language Explainer Banner & Anti-Clipping SVG
 * 4. Actuarial Scorecard 1v1 Anti-Collision (Twin Badge & Staggering) & Concrete Metric Translation
 * 5. QDAP Guaranteed Cashflow Bar & Table Rows Dynamic Reactivity (Image 1 Fix)
 * 6. Dynamic Policy Horizon Projections across all 5 categories & 4 horizon years (Image 3 Fix)
 * 7. Interactive Review Board Drawer & Filtering Sandbox
 * 8. Byte-for-byte SHA-256 Parity across distribution targets
 */

import fs from 'fs';
import path from 'path';
import assert from 'node:assert';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { HK_13_PRIVATE_HOSPITALS, CashlessMedicalAgent } from '../src/engine/scenario_agents';

interface TestRecord {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const records: TestRecord[] = [];

function test(name: string, fn: () => void) {
  const start = performance.now();
  try {
    fn();
    const durationMs = performance.now() - start;
    records.push({ name, passed: true, durationMs });
    console.log(`  [PASS] (${durationMs.toFixed(2)}ms) ${name}`);
  } catch (err: any) {
    const durationMs = performance.now() - start;
    records.push({ name, passed: false, error: err.message, durationMs });
    console.error(`  [FAIL] (${durationMs.toFixed(2)}ms) ${name}: ${err.message}`);
  }
}

console.log('================================================================================');
console.log('INSURINTEL HK - 30 COMMENTS & 13 PRIVATE HOSPITALS MATRIX VERIFICATION');
console.log('================================================================================');

const templatesPath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path.join(process.cwd(), 'dist', 'cafe.html');

assert.ok(fs.existsSync(templatesPath), 'mobile_cafe_app.html must exist');
const htmlSource = fs.readFileSync(templatesPath, 'utf8');

// --- 1. 30-Comment Multi-Perspective Review & PM/PdM Watchflow ---
console.log('\n--- [TEST SUITE] 1. 30 Improvement Comments & PM/PdM Governance ---');

const scriptMatch = htmlSource.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'Script block must be present');
const scriptCode = scriptMatch[1];

function createSandbox() {
  const dom: Record<string, any> = {};
  const makeEl = (id: string = '', tag: string = 'div'): any => ({
    id,
    tagName: tag.toUpperCase(),
    innerHTML: '',
    innerText: '',
    textContent: '',
    value: '',
    title: '',
    dataset: {} as Record<string, string>,
    style: {} as Record<string, string>,
    className: '',
    classList: {
      classes: new Set<string>(),
      add(c: string) { this.classes.add(c); },
      remove(c: string) { this.classes.delete(c); },
      contains(c: string) { return this.classes.has(c); },
      toggle(c: string, force?: boolean) {
        if (force === true) this.classes.add(c);
        else if (force === false) this.classes.delete(c);
        else if (this.classes.has(c)) this.classes.delete(c);
        else this.classes.add(c);
      }
    },
    children: [] as any[],
    appendChild(c: any) { this.children.push(c); },
    removeChild(c: any) {},
    closest(sel: string) { return null; },
    querySelector(sel: string) { return null; },
    querySelectorAll(sel: string) { return []; }
  });

  const ids = [
    'audit-30-drawer', 'audit-30-backdrop', 'audit-cards-list', 'audit-chip-all',
    'audit-chip-client', 'audit-chip-agent', 'audit-30-trigger-banner', 'btn-open-audit-drawer',
    'medical-hospital-select', 'medical-treatment-select', 'medical-result-card',
    'horizon-result-card', 'horizon-year-badge', 'corridor-visual-chart', 'corridor-title-text',
    'corridor-badge-text', 'bilateral-radar-scorecard', 'category-tabs', 'bilateral-arena-box',
    'scenario-agents-bar-wrap', 'claim-pills', 'toast', 'select-my-insurer', 'select-rival-insurer',
    'select-my-product', 'select-rival-product'
  ];
  for (const id of ids) {
    dom[id] = makeEl(id);
  }

  const mockWindow: any = {
    document: {
      getElementById(id: string) {
        if (!dom[id]) dom[id] = makeEl(id);
        return dom[id];
      },
      querySelector(sel: string) {
        if (sel.startsWith('#')) return dom[sel.slice(1)] || null;
        return null;
      },
      querySelectorAll() { return []; },
      createElement(tag: string) { return makeEl('', tag); }
    },
    navigator: {
      clipboard: {
        writeText: async (t: string) => Promise.resolve()
      }
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {}
    },
    setTimeout: (fn: Function) => fn(),
    clearTimeout: () => {},
    addEventListener: () => {}
  };
  mockWindow.window = mockWindow;

  const ctx = vm.createContext(mockWindow);
  vm.runInContext(scriptCode, ctx);
  return { ctx, dom };
}

test('30 Improvement comments are loaded on window.APP_30_IMPROVEMENT_COMMENTS with 15 Client & 15 Agent split', () => {
  const { ctx } = createSandbox();
  const comments = ctx.APP_30_IMPROVEMENT_COMMENTS;
  assert.ok(Array.isArray(comments), 'APP_30_IMPROVEMENT_COMMENTS must be an array');
  assert.strictEqual(comments.length, 30, 'Must have exactly 30 comments');

  const clientComments = comments.filter((c: any) => c.sourceRole.includes('客戶'));
  const agentComments = comments.filter((c: any) => c.sourceRole.includes('顧問'));

  assert.strictEqual(clientComments.length, 15, 'Must have exactly 15 Client comments');
  assert.strictEqual(agentComments.length, 15, 'Must have exactly 15 Agent comments');

  comments.forEach((c: any) => {
    assert.ok(c.id, 'Comment must have id');
    assert.ok(c.topic, 'Comment must have topic');
    assert.ok(c.commentText, 'Comment must have commentText');
    assert.ok(c.pmReview, 'Comment must have pmReview');
    assert.ok(c.pdmDecision, 'Comment must have pdmDecision');
    assert.ok(c.status && (c.status.includes('已修復') || c.status.includes('VERIFIED')), 'Comment must be marked resolved');
    assert.ok(c.resolvedIn, 'Comment must document resolvedIn feature symbol');
  });
});

test('Interactive Review Board Drawer renders and filterAudit30 correctly filters cards', () => {
  const { ctx, dom } = createSandbox();
  assert.strictEqual(typeof ctx.openAudit30Drawer, 'function', 'openAudit30Drawer must be exposed');
  assert.strictEqual(typeof ctx.closeAudit30Drawer, 'function', 'closeAudit30Drawer must be exposed');
  assert.strictEqual(typeof ctx.filterAudit30, 'function', 'filterAudit30 must be exposed');
  assert.strictEqual(typeof ctx.renderAudit30Cards, 'function', 'renderAudit30Cards must be exposed');

  // Open drawer
  ctx.openAudit30Drawer();
  assert.ok(dom['audit-30-drawer'].classList.contains('open'), 'Drawer must have open class');
  assert.ok(dom['audit-30-backdrop'].classList.contains('open'), 'Backdrop must have open class');

  // Verify render output has 30 cards initially
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[C1]'), 'Must render C1');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[A30]'), 'Must render A30');

  // Filter client
  ctx.filterAudit30('client');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[C1]'), 'Client filter must include C1');
  assert.ok(!dom['audit-cards-list'].innerHTML.includes('[A16]'), 'Client filter must exclude A16');

  // Filter agent
  ctx.filterAudit30('agent');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[A16]'), 'Agent filter must include A16');
  assert.ok(!dom['audit-cards-list'].innerHTML.includes('[C1]'), 'Agent filter must exclude C1');

  // Close drawer
  ctx.closeAudit30Drawer();
  assert.ok(!dom['audit-30-drawer'].classList.contains('open'), 'Drawer must remove open class');
});

// --- 2. All 13 Private Hospitals in Hong Kong ---
console.log('\n--- [TEST SUITE] 2. All 13 Private Hospitals Matrix & LOG Pre-Approval ---');

test('HK_13_PRIVATE_HOSPITALS contains all 13 private hospitals with room tier and deposit status', () => {
  assert.strictEqual(HK_13_PRIVATE_HOSPITALS.length, 13, 'Must contain exactly 13 private hospitals');

  const expectedHospitals = [
    '香港養和醫院',
    '港怡醫院',
    '嘉諾撒醫院',
    '香港中文大學醫院',
    '聖保祿醫院',
    '仁安醫院',
    '香港浸信會醫院',
    '香港港安醫院－司徒拔道',
    '香港港安醫院－荃灣',
    '播道醫院',
    '聖德肋撒醫院',
    '明德國際醫院',
    '寶血醫院'
  ];

  expectedHospitals.forEach(hosp => {
    const found = HK_13_PRIVATE_HOSPITALS.some(h => h.name.includes(hosp));
    assert.ok(found, `Hospital list must contain ${hosp}`);
  });

  HK_13_PRIVATE_HOSPITALS.forEach(h => {
    assert.ok(h.roomTier, `${h.name} must specify roomTier`);
    assert.ok(h.directBillingStatus, `${h.name} must specify directBillingStatus`);
    assert.ok(h.preApprovalHours, `${h.name} must specify preApprovalHours`);
    assert.ok(h.specialties, `${h.name} must specify specialties`);
    assert.ok(h.depositWithLOG.includes('HK$ 0'), `${h.name} depositWithLOG must be HK$ 0`);
    assert.ok(h.depositWithoutLOG.includes('HK$'), `${h.name} must state non-LOG cash deposit range`);
  });
});

test('Client sandbox exposes all 13 private hospitals in window.HK_13_PRIVATE_HOSPITALS', () => {
  const { ctx } = createSandbox();
  const clientHospitals = ctx.HK_13_PRIVATE_HOSPITALS;
  assert.ok(Array.isArray(clientHospitals), 'HK_13_PRIVATE_HOSPITALS must be on window');
  assert.strictEqual(clientHospitals.length, 13, 'Client must have all 13 private hospitals');
});

test('checkCashlessDirectBilling supports endoscopy and spine surgery procedures', () => {
  const { ctx } = createSandbox();
  assert.strictEqual(typeof ctx.checkCashlessDirectBilling, 'function');

  const endoscopy = ctx.checkCashlessDirectBilling('香港養和醫院 (Hong Kong Sanatorium & Hospital)', '腸胃鏡檢查及息肉切除 (Endoscopy & Polypectomy)', 0);
  assert.strictEqual(endoscopy.estimatedCost, 45000, 'Endoscopy estimated cost must be HK$ 45,000');
  assert.strictEqual(endoscopy.coverage, 45000, 'Coverage must be 45,000 with 0 deductible');

  const spine = ctx.checkCashlessDirectBilling('港怡醫院 (Gleneagles Hospital Hong Kong)', '脊柱微創椎間盤手術 (Minimally Invasive Spine Surgery)', 25000);
  assert.strictEqual(spine.estimatedCost, 350000, 'Spine surgery estimated cost must be HK$ 350,000');
  assert.strictEqual(spine.clientOutOfPocket, 25000, 'Out of pocket matches deductible 25,000');
  assert.strictEqual(spine.coverage, 325000, 'Coverage must be 325,000');
});

test('checkCashlessDirectBilling defensively handles null, undefined, NaN, and negative inputs', () => {
  const { ctx } = createSandbox();
  
  // Test client-side function
  const res1 = ctx.checkCashlessDirectBilling(null, undefined, NaN);
  assert.ok(res1 && res1.isApproved, 'Client-side must handle null/undefined/NaN without throwing');
  assert.strictEqual(res1.deductible, 0, 'Deductible must default to 0 on NaN');
  assert.ok(res1.hospital.length > 0, 'Hospital must fall back to non-empty default');
  assert.ok(res1.treatment.length > 0, 'Treatment must fall back to non-empty default');

  const res2 = ctx.checkCashlessDirectBilling('', '', -5000);
  assert.strictEqual(res2.deductible, 0, 'Negative deductible must clamp/default to 0');

  // Test engine CashlessMedicalAgent
  const agent = new CashlessMedicalAgent();
  const resAgent1 = agent.checkCashlessDirectBilling({ hospital: null as any, treatment: undefined as any, deductibleHKD: NaN as any });
  assert.ok(resAgent1 && resAgent1.isCashlessApproved, 'Engine agent must handle null/undefined/NaN');
  assert.strictEqual(resAgent1.deductibleHKD, 0, 'Engine deductible must default to 0 on NaN');

  const resAgent2 = agent.checkCashlessDirectBilling({ hospital: '   ', treatment: '', deductibleHKD: -10000 });
  assert.strictEqual(resAgent2.deductibleHKD, 0, 'Engine negative deductible must clamp/default to 0');
});

// --- 3. GN16 100% Official Benchmark Explainer & SVG Dimensions ---
console.log('\n--- [TEST SUITE] 3. GN16 100% Benchmark & Anti-Clipping SVG ---');

test('HTML includes GN16 100% statutory explanation banner with clear definitions', () => {
  assert.ok(htmlSource.includes('gn16-explainer-banner'), 'Must include gn16-explainer-banner');
  assert.ok(htmlSource.includes('100% 官方基準'), 'Must explain 100% official benchmark');
  assert.ok(htmlSource.includes('非保證分紅實現率'), 'Must reference GN16 fulfillment ratio');
  assert.ok(htmlSource.includes('100% 完全達到'), 'Must explain 100% means paying 100% of illustrated bonus');
  assert.ok(htmlSource.includes('&gt; 100% 超額派發'), 'Must explain >100% over-fulfillment');
  assert.ok(htmlSource.includes('&lt; 100% 分紅打折'), 'Must explain <100% dividend cuts');
});

test('renderCorridorVisualChart SVG width is widened to 660 with xEnd=520 to avoid label clipping', () => {
  assert.ok(htmlSource.includes('const svgW = 660;'), 'svgW must be widened to 660');
  assert.ok(htmlSource.includes('const xEnd = 520;'), 'xEnd must be 520 to reserve right edge margin');
});

// --- 4. Actuarial Scorecard 1v1 Anti-Collision & Concrete Metrics ---
console.log('\n--- [TEST SUITE] 4. Actuarial Scorecard Anti-Collision & Concrete Metrics ---');

test('Actuarial Scorecard includes anti-collision twin badge for identical scores', () => {
  assert.ok(htmlSource.includes('p.our_score === p.rival_score'), 'Must branch on identical scores');
  assert.ok(htmlSource.includes('tspan fill="#64748b">=</tspan'), 'Twin badge must render equals sign');
  assert.ok(htmlSource.includes('paint-order="stroke"'), 'Staggered labels must have white halo stroke');
});

test('Actuarial Scorecard includes Scorecard Explainer Banner and concrete metric rows', () => {
  assert.ok(htmlSource.includes('id="scorecard-explainer-banner"'), 'Scorecard explainer banner must exist');
  assert.ok(htmlSource.includes('scorecard-concrete-row'), 'scorecard-concrete-row class must exist in HTML');
  assert.ok(htmlSource.includes('實質數據折算：'), 'Concrete metric prefix must exist');
  assert.ok(htmlSource.includes('精算折算依據：'), 'Actuarial rationale explanation must exist');
});

test('computeRadarDimensionScores generates concrete_our, concrete_rival, and explanation', () => {
  const { ctx } = createSandbox();
  const card = ctx.getBattleCard('AIA', 'Prudential', 'prepayment');
  assert.ok(card, 'Battle card must be resolved');
  assert.ok(Array.isArray(card.radar_scorecard), 'radar_scorecard must be an array');
  assert.strictEqual(card.radar_scorecard.length, 5, 'Must have 5 dimensions');

  card.radar_scorecard.forEach((dim: any) => {
    assert.ok(dim.concrete_our, `${dim.key} must have concrete_our`);
    assert.ok(dim.concrete_rival, `${dim.key} must have concrete_rival`);
    assert.ok(dim.explanation, `${dim.key} must have explanation`);
  });
});

// --- 5. QDAP Guaranteed Cashflow Dynamic Reactivity (Image 1 Bug Fix) ---
console.log('\n--- [TEST SUITE] 5. QDAP Guaranteed Cashflow Dynamic Reactivity ---');

test('QDAP battle card chart_bars renders valid percentage string without product name bug', () => {
  const { ctx } = createSandbox();
  const card = ctx.getBattleCard('AIA', 'Prudential', 'qdap');
  assert.ok(card, 'QDAP battle card must be generated');

  const bars = card.chart_bars;
  assert.ok(Array.isArray(bars), 'chart_bars must be an array');
  assert.strictEqual(bars.length, 3, 'Must have 3 bars');

  // Verify Plan B bar value
  const planBBar = bars[1];
  assert.ok(!planBBar.value.includes('對手【'), 'Plan B bar value must not contain corrupted label string');
  assert.ok(planBBar.value.includes('% 保證'), 'Plan B bar value must contain percentage guarantee');
  assert.ok(typeof planBBar.widthPct === 'number' && planBBar.widthPct > 0, 'widthPct must be positive number');

  // Verify Table Rows
  const rows = card.table_rows;
  assert.ok(Array.isArray(rows), 'table_rows must be an array');
  assert.ok(rows.some((r: any) => r.label.includes('保證內部回報率')), 'Must have Guaranteed IRR row');
  assert.ok(rows.some((r: any) => r.label.includes('總預期內部回報率')), 'Must have Total IRR row');
});

test('Critical Illness battle card table_rows dynamically reflect illness count, multiple claim limit %, and ICU clause', () => {
  const { ctx } = createSandbox();
  const card = ctx.getBattleCard('AIA', 'Prudential', 'critical_illness');
  assert.ok(card, 'Critical illness battle card must be generated');

  const rows = card.table_rows;
  assert.ok(Array.isArray(rows), 'table_rows must be an array');
  
  const illnessRow = rows.find((r: any) => r.label.includes('涵蓋嚴重疾病總數'));
  assert.ok(illnessRow, 'Must have illness count row');
  assert.ok(illnessRow.value.includes('種 vs 對手'), 'Illness row must have dynamic comparison');

  const multipleRow = rows.find((r: any) => r.label.includes('多次索賠累計保額上限'));
  assert.ok(multipleRow, 'Must have multiple claim limit row');
  assert.ok(multipleRow.value.includes('%'), 'Multiple claim limit must be a percentage');

  const icuRow = rows.find((r: any) => r.label.includes('ICU'));
  assert.ok(icuRow, 'Must have ICU clause row');
});

test('Universal Life battle card chart_bars and table_rows dynamically reflect net spread, crediting rate, and floor rate', () => {
  const { ctx } = createSandbox();
  const card = ctx.getBattleCard('AIA', 'Prudential', 'financing_ul');
  assert.ok(card, 'Universal life battle card must be generated');

  // Verify chart bars
  const bars = card.chart_bars;
  assert.ok(Array.isArray(bars) && bars.length >= 2, 'UL chart bars must exist');
  assert.ok(bars[0].value.includes('淨利差') || bars[0].value.includes('結算') || bars[0].value.includes('%'), 'UL bar 0 must show crediting / spread metrics');

  // Verify table rows
  const rows = card.table_rows;
  assert.ok(Array.isArray(rows), 'table_rows must be an array');
  const spreadRow = rows.find((r: any) => r.label.includes('淨利差收益') || r.label.includes('Net Spread'));
  assert.ok(spreadRow, 'Must have Net Spread row');
  assert.ok(spreadRow.value.includes('%'), 'Net spread must contain percentage');

  const floorRow = rows.find((r: any) => r.label.includes('保底息率') || r.label.includes('Floor Rate'));
  assert.ok(floorRow, 'Must have Floor Rate row');
  assert.ok(floorRow.value.includes('%'), 'Floor rate must contain percentage');
});

// --- 6. Dynamic Policy Horizon Projections (Image 3 Bug Fix) ---
console.log('\n--- [TEST SUITE] 6. Dynamic Policy Horizon Projections ---');

test('updateHorizonDisplay dynamically evaluates all 5 categories across years 5, 10, 20, 30', () => {
  const { ctx, dom } = createSandbox();
  const categories = [
    'Savings_MultiCurrency',
    'Critical_Illness',
    'Medical_VHIS',
    'Annuity_QDAP',
    'Financing_UniversalLife'
  ];
  const horizonYears = [5, 10, 20, 30];

  categories.forEach(cat => {
    ctx.selectCategory(cat);
    const card = ctx.getBattleCard('AIA', 'Prudential', 'prepayment');

    horizonYears.forEach(year => {
      ctx.updateHorizonDisplay(card, year);
      const output = dom['horizon-result-card'].innerHTML;

      assert.ok(output.includes(`第 ${year} 年`), `Must project for Year ${year} in ${cat}`);
      assert.ok(!output.includes('我方方案在選定第'), `Must NOT have generic placeholder in ${cat} Year ${year}`);
      assert.ok(output.includes('🔵 【Plan A 我方】'), 'Must render Plan A container');
      assert.ok(output.includes('🔴 【Plan B 對手】'), 'Must render Plan B container');
    });
  });
});

// --- 7. Byte-for-Byte SHA-256 Parity ---
console.log('\n--- [TEST SUITE] 7. Distribution Byte-for-Byte Parity ---');

test('templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html are byte-for-byte identical', () => {
  const templateRaw = fs.readFileSync(templatesPath, 'utf8');
  const indexRaw = fs.readFileSync(distIndexPath, 'utf8');
  const cafeRaw = fs.readFileSync(distCafePath, 'utf8');

  const hashT = crypto.createHash('sha256').update(templateRaw).digest('hex');
  const hashI = crypto.createHash('sha256').update(indexRaw).digest('hex');
  const hashC = crypto.createHash('sha256').update(cafeRaw).digest('hex');

  assert.strictEqual(hashT, hashI, 'templates/mobile_cafe_app.html and dist/index.html must have identical SHA-256');
  assert.strictEqual(hashT, hashC, 'templates/mobile_cafe_app.html and dist/cafe.html must have identical SHA-256');
  assert.strictEqual(templateRaw.length, indexRaw.length, 'Byte lengths must match exactly');
});

// --- Summary ---
console.log('\n================================================================================');
const total = records.length;
const passed = records.filter(r => r.passed).length;
const failed = records.filter(r => !r.passed).length;
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('================================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('VERDICT: ALL 30 COMMENTS & 13 PRIVATE HOSPITALS MATRIX ACCEPTANCE TESTS PASSED (100%).\n');
}

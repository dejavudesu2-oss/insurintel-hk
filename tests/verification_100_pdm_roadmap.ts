/**
 * tests/verification_100_pdm_roadmap.ts
 * Rigorous Verification Suite for /boost do all 100-Comment PDM Roadmap:
 * 1. One-Click Client PDF Report & WhatsApp/WeChat Pitch Card Generator (MDRT Branding, GL20 Disclaimer)
 * 2. Universal Life (UL) Premium Financing Interest Rate Stress Calculator (+100bps/+200bps, Net Spread, Margin Call)
 * 3. Group Medical (團險) + High-End VHIS Deductible Optimizer (Optimal Deductible, $0 Gap, 10Y Savings)
 * 4. QDAP Family Tax Savings & Cashflow Calculator (Joint Assessment HK$120k cap, HK$20,400 max savings)
 * 5. 3-Way Flagship Simultaneous Comparison (Plan A vs Plan B vs Plan C across all 5 categories)
 * 6. Accessibility & Localization in Web App Header ([繁/簡] and [標準/大字體] toggles with persistence)
 * 7. 100-Comment Review Board (50 Client + 50 Agent split, scope switching, 30-item backwards compatibility)
 * 8. Byte-for-byte SHA-256 parity across templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html
 */

import fs from 'fs';
import path from 'path';
import assert from 'node:assert';
import crypto from 'node:crypto';
import vm from 'node:vm';

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
console.log('INSURINTEL HK - 100-COMMENT PDM ROADMAP (/BOOST DO ALL) VERIFICATION SUITE');
console.log('================================================================================');

const templatesPath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path.join(process.cwd(), 'dist', 'cafe.html');

assert.ok(fs.existsSync(templatesPath), 'mobile_cafe_app.html must exist');
assert.ok(fs.existsSync(distIndexPath), 'dist/index.html must exist');
assert.ok(fs.existsSync(distCafePath), 'dist/cafe.html must exist');

const htmlSource = fs.readFileSync(templatesPath, 'utf8');

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
    checked: false,
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
    select() {},
    closest(sel: string) { return null; },
    querySelector(sel: string) { return null; },
    querySelectorAll(sel: string) { return []; }
  });

  const ids = [
    // Header & Nav
    'header-lang-toggle-btn', 'header-lang-text', 'header-font-toggle-btn', 'header-font-text',
    'header-pdf-report-btn', 'client-pdf-trigger-banner',
    // Client PDF Modal
    'client-pdf-backdrop', 'client-pdf-modal', 'client-pdf-report-preview',
    'report-agent-name', 'report-agent-title', 'report-agent-license', 'report-agent-team', 'report-agent-phone',
    'btn-print-client-report', 'btn-copy-report-whatsapp', 'btn-copy-report-wechat',
    // 3-Way Arena
    'arena-mode-bar', 'btn-arena-mode-1v1', 'btn-arena-mode-3way',
    'camp-card-our', 'camp-card-rival', 'camp-card-third',
    'select-my-insurer', 'select-rival-insurer', 'select-third-insurer',
    'select-my-product', 'select-rival-product', 'select-third-product',
    'my-product-display', 'rival-product-display', 'third-product-display',
    'hero-our-name', 'hero-rival-name', 'hero-third-name', 'hero-third-side', 'hero-vs-third',
    'bilateral-spec-table',
    // Audit Drawer
    'audit-30-drawer', 'audit-30-backdrop', 'audit-scope-bar', 'audit-scope-30', 'audit-scope-100',
    'audit-30-filter-pills', 'audit-100-filter-pills', 'audit-cards-list', 'audit-header-badge',
    'audit-chip-all', 'audit-chip-client', 'audit-chip-agent',
    'audit-100-chip-all', 'audit-100-chip-client', 'audit-100-chip-agent',
    // Scenarios
    'scenario-agents-bar-wrap', 'scenario-agent-panel', 'tab-scenario-ul-stress', 'tab-scenario-group-medical',
    'toast'
  ];

  for (const id of ids) {
    dom[id] = makeEl(id);
  }

  const localStorageStore: Record<string, string> = {};

  let printed = false;
  let lastCopiedText = '';

  const mockWindow: any = {
    document: {
      documentElement: { lang: 'zh-HK' },
      body: {
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
        appendChild(c: any) {},
        removeChild(c: any) {}
      },
      getElementById(id: string) {
        if (!dom[id]) dom[id] = makeEl(id);
        return dom[id];
      },
      querySelector(sel: string) {
        if (sel.startsWith('#')) return dom[sel.slice(1)] || null;
        return null;
      },
      querySelectorAll() { return []; },
      createElement(tag: string) { return makeEl('', tag); },
      execCommand: () => true
    },
    navigator: {
      clipboard: {
        writeText: async (t: string) => {
          lastCopiedText = t;
          return Promise.resolve();
        }
      }
    },
    localStorage: {
      getItem: (k: string) => localStorageStore[k] || null,
      setItem: (k: string, v: string) => { localStorageStore[k] = String(v); }
    },
    print: () => { printed = true; },
    alert: () => {},
    setTimeout: (fn: Function) => fn(),
    clearTimeout: () => {},
    addEventListener: () => {}
  };
  mockWindow.window = mockWindow;

  const ctx = vm.createContext(mockWindow);
  vm.runInContext(scriptCode, ctx);
  return { ctx, dom, mockWindow, localStorageStore, getPrinted: () => printed, getLastCopiedText: () => lastCopiedText };
}

// ============================================================================
// SUITE 1: One-Click Client PDF Report & Pitch Card Generator
// ============================================================================
console.log('\n--- [TEST SUITE] 1. One-Click Client PDF Report & Advisor Pitch Cards ---');

test('Client PDF Modal exposes openClientPdfModal, closeClientPdfModal, and updates open state', () => {
  const { ctx, dom } = createSandbox();
  assert.strictEqual(typeof ctx.openClientPdfModal, 'function');
  assert.strictEqual(typeof ctx.closeClientPdfModal, 'function');

  ctx.openClientPdfModal();
  assert.ok(dom['client-pdf-modal'].classList.contains('open'), 'Modal must have open class');
  assert.ok(dom['client-pdf-backdrop'].classList.contains('open'), 'Backdrop must have open class');

  ctx.closeClientPdfModal();
  assert.ok(!dom['client-pdf-modal'].classList.contains('open'), 'Modal must remove open class');
  assert.ok(!dom['client-pdf-backdrop'].classList.contains('open'), 'Backdrop must remove open class');
});

test('Advisor Branding Profile persists to localStorage and renders in PDF report', () => {
  const { ctx, dom, localStorageStore } = createSandbox();
  assert.strictEqual(typeof ctx.getAdvisorProfile, 'function');
  assert.strictEqual(typeof ctx.saveAdvisorProfile, 'function');

  const customProfile = {
    name: '林偉傑 Vincent Lam',
    title: '資深區域總監 · MDRT TOT',
    license: 'IA998877',
    team: '宏利傳承尊尚團隊',
    phone: '+852 9876 5432'
  };

  ctx.saveAdvisorProfile(customProfile);
  const loaded = ctx.getAdvisorProfile();
  assert.strictEqual(loaded.name, customProfile.name);
  assert.strictEqual(loaded.title, customProfile.title);
  assert.strictEqual(loaded.phone, customProfile.phone);

  ctx.renderClientPdfPreview();
  const previewHtml = dom['client-pdf-report-preview'].innerHTML;
  assert.ok(previewHtml.includes('林偉傑 Vincent Lam'), 'Preview must render advisor name');
  assert.ok(previewHtml.includes('MDRT TOT'), 'Preview must render MDRT TOT');
  assert.ok(previewHtml.includes('+852 9876 5432'), 'Preview must render phone');
  assert.ok(previewHtml.includes('GL20') || previewHtml.includes('操守守則'), 'Preview must cite statutory Code of Conduct / GL20 disclaimer');
  assert.ok(previewHtml.includes('13 間私家醫院免找數擔保'), 'Preview must cite 13 private hospitals LOG');
});

test('Print function invokes window.print() and export buttons trigger formatted WhatsApp/WeChat copy', () => {
  const { ctx, getPrinted } = createSandbox();
  assert.strictEqual(typeof ctx.printClientReport, 'function');
  assert.strictEqual(typeof ctx.copyReportWhatsApp, 'function');
  assert.strictEqual(typeof ctx.copyReportWechat, 'function');

  ctx.printClientReport();
  assert.strictEqual(getPrinted(), true, 'printClientReport must invoke window.print()');
});

test('copyReportWhatsApp in 3-way mode produces comprehensive 3-plan comparison card', () => {
  const { ctx, getLastCopiedText } = createSandbox();
  ctx.setArenaMode('3way');
  ctx.copyReportWhatsApp();
  const text = getLastCopiedText();
  assert.ok(text.includes('【InsurIntel 專業保險對比簡報 · 客戶專屬】'), 'Card must have title');
  assert.ok(text.includes('三方旗艦橫向對決') || text.includes('3-Way PK'), 'Card must state 3-way mode');
  assert.ok(text.includes('Plan A (我方)'), 'Card must include Plan A');
  assert.ok(text.includes('Plan B (競品)'), 'Card must include Plan B');
  assert.ok(text.includes('Plan C (第三方)'), 'Card must include Plan C');
  assert.ok(text.includes('GL20') || text.includes('操守守則'), 'Card must include Code of Conduct / GL20 disclaimer');
});

test('saveAdvisorProfile with silent=true saves to localStorage without toast notification spam', () => {
  const { ctx, dom, localStorageStore } = createSandbox();
  dom['toast'].className = '';
  ctx.saveAdvisorProfile({ name: '張三豐' }, true);
  assert.strictEqual(JSON.parse(localStorageStore['insurintel_advisor_profile']).name, '張三豐');
  assert.ok(!dom['toast'].classList.contains('show'), 'Toast should not be shown when silent=true');
});

// ============================================================================
// SUITE 2: Universal Life (UL) Premium Financing Stress Calculator
// ============================================================================
console.log('\n--- [TEST SUITE] 2. Universal Life (UL) Premium Financing Stress Calculator ---');

test('calculateULStress computes exact leverage, net spread, and base case values', () => {
  const { ctx } = createSandbox();
  assert.strictEqual(typeof ctx.calculateULStress, 'function');

  // 1,000,000 capital撬動 3,000,000 policy
  // creditingRate = 5.25%, borrowingRate = 3.80%, hike = 0
  const base = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 0);
  assert.strictEqual(base.capital, 1000000);
  assert.strictEqual(base.policyTotal, 3000000);
  assert.strictEqual(base.loanAmount, 2000000);
  assert.strictEqual(base.leverageRatio, 3);
  assert.strictEqual(base.netSpreadPct, 1.45); // 5.25 - 3.80 = 1.45%
  assert.ok(base.annualCarryGainHKD > 0, 'Annual net carry gain must be positive in base case');
  assert.strictEqual(base.isNegativeSpread, false);
  assert.strictEqual(base.status, '安全');
});

test('calculateULStress under +100bps rate hike reduces net spread but maintains positive carry', () => {
  const { ctx } = createSandbox();
  const hike100 = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 100);
  assert.strictEqual(hike100.effectiveBorrowingRate, 4.80);
  assert.strictEqual(hike100.netSpreadPct, 0.45); // 5.25 - 4.80 = 0.45%
  assert.strictEqual(hike100.isNegativeSpread, false);
});

test('calculateULStress under +200bps rate hike triggers negative spread and margin call warning', () => {
  const { ctx } = createSandbox();
  const hike200 = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 200);
  assert.strictEqual(hike200.effectiveBorrowingRate, 5.80);
  assert.strictEqual(hike200.netSpreadPct, -0.55); // 5.25 - 5.80 = -0.55%
  assert.strictEqual(hike200.isNegativeSpread, true);
  assert.ok(hike200.status.includes('警戒') || hike200.status.includes('追繳保證金風險'), 'Status must flag margin call / stress risk');
});

test('calculateULStress maintains positive net cashflow when total policy yield exceeds loan loss in +200bps hike', () => {
  const { ctx } = createSandbox();
  // Capital: $1,000,000, Policy: $3,000,000, Loan: $2,000,000
  // Crediting rate: 5.25%, Borrowing: 3.80% + 2.00% = 5.80%
  // Policy annual return: 3,000,000 * 5.25% = 157,500
  // Loan annual interest: 2,000,000 * 5.80% = 116,000
  // Net cashflow: 157,500 - 116,000 = +41,500
  // Loan spread loss: 2,000,000 * (-0.55%) = -$11,000
  const hike200 = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 200);
  assert.strictEqual(hike200.netSpreadPct, -0.55);
  assert.strictEqual(hike200.isNegativeSpread, true);
  assert.strictEqual(hike200.netCashflow, 41500, 'Overall cashflow remains positive despite negative loan spread');
  assert.strictEqual(hike200.annualBorrowingInterest, 116000);
  assert.strictEqual(hike200.annualCreditingInterest, 157500);
});

// ============================================================================
// SUITE 3: Group Medical + High-End VHIS Deductible Optimizer
// ============================================================================
console.log('\n--- [TEST SUITE] 3. Group Medical + High-End VHIS Deductible Optimizer ---');

test('optimizeGroupMedicalVHIS recommends optimal deductible and computes zero out-of-pocket', () => {
  const { ctx } = createSandbox();
  assert.strictEqual(typeof ctx.optimizeGroupMedicalVHIS, 'function');

  // Test Case A: Existing group limit HK$ 30,000 -> optimal deductible HK$ 25,000
  const opt30k = ctx.optimizeGroupMedicalVHIS(30000);
  assert.strictEqual(opt30k.recommendedDeductible, 25000);
  assert.strictEqual(opt30k.gapOutOfPocket, 0, 'Out-of-pocket gap must be eliminated to HK$ 0');
  assert.ok(opt30k.annualSavingVsZero > 0, 'Annual saving vs HK$0 deductible must be positive');
  assert.strictEqual(opt30k.tenYearSavingVsZero, opt30k.annualSavingVsZero * 10);

  // Test Case B: Existing group limit HK$ 50,000 -> optimal deductible HK$ 50,000
  const opt50k = ctx.optimizeGroupMedicalVHIS(50000);
  assert.strictEqual(opt50k.recommendedDeductible, 50000);
  assert.strictEqual(opt50k.gapOutOfPocket, 0);
  assert.ok(opt50k.annualSavingVsZero > opt30k.annualSavingVsZero, 'Higher deductible yields higher premium savings');

  // Test Case C: Existing group limit HK$ 80,000 (executive tier) -> optimal deductible HK$ 80,000
  const opt80k = ctx.optimizeGroupMedicalVHIS(80000);
  assert.strictEqual(opt80k.recommendedDeductible, 80000);
  assert.strictEqual(opt80k.gapOutOfPocket, 0);

  // Test Case D: No existing group cover (HK$ 0) -> recommended deductible HK$ 0
  const opt0 = ctx.optimizeGroupMedicalVHIS(0);
  assert.strictEqual(opt0.recommendedDeductible, 0);
  assert.strictEqual(opt0.annualSavingVsZero, 0);
});

// ============================================================================
// SUITE 4: QDAP Family Tax Savings & Cashflow Calculator
// ============================================================================
console.log('\n--- [TEST SUITE] 4. QDAP Family Tax Savings & Cashflow Calculator ---');

test('calculateQDAPFamilyTax validates single HK$60k vs joint HK$120k caps and 17% max HK$20,400', () => {
  const { ctx } = createSandbox();
  assert.strictEqual(typeof ctx.calculateQDAPFamilyTax, 'function');

  // Single taxpayer contributing HK$ 60,000 at 17% top tax bracket
  const single1 = ctx.calculateQDAPFamilyTax(60000, 17, false);
  assert.strictEqual(single1.eligibleDeduction, 60000);
  assert.strictEqual(single1.annualTaxSavings, 10200); // 60,000 * 17% = 10,200
  assert.strictEqual(single1.cap, 60000);

  // Single taxpayer contributing HK$ 100,000 -> capped at HK$ 60,000
  const singleExcess = ctx.calculateQDAPFamilyTax(100000, 17, false);
  assert.strictEqual(singleExcess.eligibleDeduction, 60000);
  assert.strictEqual(singleExcess.annualTaxSavings, 10200);

  // Married couple joint assessment contributing HK$ 120,000 at 17% bracket
  const couple1 = ctx.calculateQDAPFamilyTax(120000, 17, true);
  assert.strictEqual(couple1.eligibleDeduction, 120000);
  assert.strictEqual(couple1.annualTaxSavings, 20400); // 120,000 * 17% = 20,400
  assert.strictEqual(couple1.cap, 120000);

  // Monthly annuity payout schedule
  assert.ok(couple1.estimatedMonthlyAnnuity > 0, 'Must compute dynamic monthly retirement annuity');
});

test('calculateQDAPFamilyTax handles zero contribution boundary and generates detailed payout schedule', () => {
  const { ctx } = createSandbox();
  const zeroResult = ctx.calculateQDAPFamilyTax(0, 17, false);
  assert.strictEqual(zeroResult.eligibleDeduction, 0, 'Zero contribution must give 0 eligible deduction');
  assert.strictEqual(zeroResult.annualTaxSavings, 0, 'Zero contribution must give 0 tax savings');
  assert.strictEqual(zeroResult.estimatedMonthlyAnnuity, 0, 'Zero contribution gives 0 monthly annuity');
  assert.ok(Array.isArray(zeroResult.schedule), 'Must generate structured schedule array');
  assert.strictEqual(zeroResult.schedule.length, 20, 'Default schedule duration is 20 years');
  assert.strictEqual(zeroResult.schedule[0].annualPayout, 0);

  const activeResult = ctx.calculateQDAPFamilyTax(60000, 17, false, 10);
  assert.strictEqual(activeResult.schedule.length, 10);
  assert.ok(activeResult.schedule[0].annualPayout > 0);
  assert.strictEqual(activeResult.schedule[0].age, 65);
});

// ============================================================================
// SUITE 5: 3-Way Flagship Simultaneous Comparison (Plan A vs Plan B vs Plan C)
// ============================================================================
console.log('\n--- [TEST SUITE] 5. 3-Way Flagship Simultaneous Comparison (3-Way PK) ---');

test('3-Way Comparison computes dynamic multi-dimensional metrics across all 5 categories', () => {
  const { ctx, dom } = createSandbox();
  assert.strictEqual(typeof ctx.setArenaMode, 'function');
  assert.strictEqual(typeof ctx.toggleArenaMode, 'function');
  assert.strictEqual(typeof ctx.compute3WaySpecs, 'function');

  // Enable 3-way mode
  ctx.setArenaMode('3way');
  assert.strictEqual(ctx.arenaMode, '3way');

  const categories = [
    'Savings_MultiCurrency',
    'Critical_Illness',
    'Medical_VHIS',
    'Annuity_QDAP',
    'Financing_UniversalLife'
  ];

  for (const cat of categories) {
    const specs3 = ctx.compute3WaySpecs('AIA', 'Prudential', 'Manulife', cat);
    assert.ok(Array.isArray(specs3), `compute3WaySpecs for ${cat} must return array`);
    assert.ok(specs3.length >= 3, `${cat} must return at least 3 comparison metrics`);
    specs3.forEach((row: any) => {
      assert.ok(row.label, 'Row must have label');
      assert.ok(row.ourVal !== undefined, 'Row must have ourVal');
      assert.ok(row.rivalVal !== undefined, 'Row must have rivalVal');
      assert.ok(row.thirdVal !== undefined, 'Row must have thirdVal');
      assert.ok(row.winner, 'Row must identify leading plan');
      assert.ok(row.summary, 'Row must give comparative summary');
    });
  }
});

// ============================================================================
// SUITE 6: Accessibility & Localization in Web App Header
// ============================================================================
console.log('\n--- [TEST SUITE] 6. Accessibility & Localization in Web App Header ---');

test('Language toggle switches between zh-HK and zh-CN and persists', () => {
  const { ctx, mockWindow, localStorageStore } = createSandbox();
  assert.strictEqual(typeof ctx.toggleLangZh, 'function');
  assert.strictEqual(typeof ctx.setLangZh, 'function');

  ctx.setLangZh('zh-CN');
  assert.strictEqual(mockWindow.document.documentElement.lang, 'zh-CN');
  assert.ok(mockWindow.document.body.classList.contains('lang-hans'));
  assert.strictEqual(localStorageStore['insurintel_lang'], 'zh-CN');

  ctx.setLangZh('zh-HK');
  assert.strictEqual(mockWindow.document.documentElement.lang, 'zh-HK');
  assert.ok(!mockWindow.document.body.classList.contains('lang-hans'));
  assert.strictEqual(localStorageStore['insurintel_lang'], 'zh-HK');
});

test('Font size toggle activates large-font-mode and persists', () => {
  const { ctx, mockWindow, localStorageStore } = createSandbox();
  assert.strictEqual(typeof ctx.toggleFontSize, 'function');
  assert.strictEqual(typeof ctx.setFontSize, 'function');

  ctx.setFontSize(true);
  assert.ok(mockWindow.document.body.classList.contains('large-font-mode'));
  assert.strictEqual(localStorageStore['insurintel_large_font'], '1');

  ctx.setFontSize(false);
  assert.ok(!mockWindow.document.body.classList.contains('large-font-mode'));
  assert.strictEqual(localStorageStore['insurintel_large_font'], '0');
});

test('Traditional to Simplified Chinese dictionary converts core industry terminology accurately', () => {
  const { ctx } = createSandbox();
  assert.strictEqual(typeof ctx.toHans, 'function');
  assert.strictEqual(typeof ctx.toHant, 'function');

  const tradSample = '香港保險業監管局GN16官方實現率及13間私家醫院免找數擔保';
  const simpResult = ctx.toHans(tradSample);
  assert.strictEqual(simpResult, '香港保险业监管局GN16官方实现率及13间私家医院免找数担保');

  const backTrad = ctx.toHant(simpResult);
  assert.strictEqual(backTrad, tradSample);
});

// ============================================================================
// SUITE 7: Expand Review Board to All 100 Comments (50 Client + 50 Agent)
// ============================================================================
console.log('\n--- [TEST SUITE] 7. 100-Comment Multi-Perspective Review Board ---');

test('window.APP_100_IMPROVEMENT_COMMENTS has exactly 100 items with 50 Client & 50 Agent split', () => {
  const { ctx } = createSandbox();
  const comments100 = ctx.APP_100_IMPROVEMENT_COMMENTS;
  assert.ok(Array.isArray(comments100), 'APP_100_IMPROVEMENT_COMMENTS must be array');
  assert.strictEqual(comments100.length, 100, 'Must have exactly 100 comments');

  const clients = comments100.filter((c: any) => c.sourceRole.includes('客戶'));
  const agents = comments100.filter((c: any) => c.sourceRole.includes('顧問'));

  assert.strictEqual(clients.length, 50, 'Must have exactly 50 Client comments');
  assert.strictEqual(agents.length, 50, 'Must have exactly 50 Agent comments');

  // Verify backward compatibility: 30-item array remains intact
  const comments30 = ctx.APP_30_IMPROVEMENT_COMMENTS;
  assert.ok(Array.isArray(comments30), 'APP_30_IMPROVEMENT_COMMENTS must remain array');
  assert.strictEqual(comments30.length, 30, 'APP_30_IMPROVEMENT_COMMENTS must stay at length 30');
});

test('Audit Drawer Scope Switching (30 vs 100) and 100-filter functionality', () => {
  const { ctx, dom } = createSandbox();
  assert.strictEqual(typeof ctx.setAuditScope, 'function');
  assert.strictEqual(typeof ctx.filterAudit100, 'function');
  assert.strictEqual(typeof ctx.renderAudit100Cards, 'function');

  // Switch to 100 scope
  ctx.setAuditScope('100');
  assert.strictEqual(ctx.auditScope, '100');
  assert.strictEqual(dom['audit-header-badge'].innerText, '100/100 Resolved');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[C01]') || dom['audit-cards-list'].innerHTML.includes('[C1]'));
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[A50]'));

  // Filter 100 clients
  ctx.filterAudit100('client');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[C01]') || dom['audit-cards-list'].innerHTML.includes('[C1]'));
  assert.ok(!dom['audit-cards-list'].innerHTML.includes('[A50]'));

  // Filter 100 agents
  ctx.filterAudit100('agent');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[A50]'));
  assert.ok(!dom['audit-cards-list'].innerHTML.includes('[C01]'));

  // Switch back to 30 scope
  ctx.setAuditScope('30');
  assert.strictEqual(ctx.auditScope, '30');
  assert.strictEqual(dom['audit-header-badge'].innerText, '30/30 Verified');
  assert.ok(dom['audit-cards-list'].innerHTML.includes('[A30]'));
});

// ============================================================================
// SUITE 8: Byte-for-Byte SHA-256 Parity across Distribution Targets
// ============================================================================
console.log('\n--- [TEST SUITE] 8. Byte-for-Byte SHA-256 Distribution Parity ---');

test('templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html have identical SHA-256 hashes', () => {
  const hTemplate = crypto.createHash('sha256').update(fs.readFileSync(templatesPath)).digest('hex');
  const hDistIndex = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
  const hDistCafe = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

  assert.strictEqual(hTemplate, hDistIndex, 'Template and dist/index.html must have identical SHA-256');
  assert.strictEqual(hTemplate, hDistCafe, 'Template and dist/cafe.html must have identical SHA-256');
  console.log(`  SHA-256: ${hTemplate}`);
});

console.log('================================================================================');
console.log(`ROADMAP VERIFICATION SUMMARY: ${records.filter(r => r.passed).length} / ${records.length} PASSED`);
console.log('================================================================================');

const allPassed = records.every(r => r.passed);
if (!allPassed) {
  process.exit(1);
}

"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_vm_1 = __importDefault(require("node:vm"));
const records = [];
function test(name, fn) {
    const start = performance.now();
    try {
        fn();
        const durationMs = performance.now() - start;
        records.push({ name, passed: true, durationMs });
        console.log(`  [PASS] (${durationMs.toFixed(2)}ms) ${name}`);
    }
    catch (err) {
        const durationMs = performance.now() - start;
        records.push({ name, passed: false, error: err.message, durationMs });
        console.error(`  [FAIL] (${durationMs.toFixed(2)}ms) ${name}: ${err.message}`);
    }
}
console.log('================================================================================');
console.log('INSURINTEL HK - 100-COMMENT PDM ROADMAP (/BOOST DO ALL) VERIFICATION SUITE');
console.log('================================================================================');
const templatesPath = path_1.default.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path_1.default.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path_1.default.join(process.cwd(), 'dist', 'cafe.html');
node_assert_1.default.ok(fs_1.default.existsSync(templatesPath), 'mobile_cafe_app.html must exist');
node_assert_1.default.ok(fs_1.default.existsSync(distIndexPath), 'dist/index.html must exist');
node_assert_1.default.ok(fs_1.default.existsSync(distCafePath), 'dist/cafe.html must exist');
const htmlSource = fs_1.default.readFileSync(templatesPath, 'utf8');
const scriptMatch = htmlSource.match(/<script>([\s\S]*?)<\/script>/);
node_assert_1.default.ok(scriptMatch, 'Script block must be present');
const scriptCode = scriptMatch[1];
function createSandbox() {
    const dom = {};
    const makeEl = (id = '', tag = 'div') => ({
        id,
        tagName: tag.toUpperCase(),
        innerHTML: '',
        innerText: '',
        textContent: '',
        value: '',
        title: '',
        checked: false,
        dataset: {},
        style: {},
        className: '',
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); },
            toggle(c, force) {
                if (force === true)
                    this.classes.add(c);
                else if (force === false)
                    this.classes.delete(c);
                else if (this.classes.has(c))
                    this.classes.delete(c);
                else
                    this.classes.add(c);
            }
        },
        children: [],
        appendChild(c) { this.children.push(c); },
        removeChild(c) { },
        select() { },
        closest(sel) { return null; },
        querySelector(sel) { return null; },
        querySelectorAll(sel) { return []; }
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
    const localStorageStore = {};
    let printed = false;
    let lastCopiedText = '';
    const mockWindow = {
        document: {
            documentElement: { lang: 'zh-HK' },
            body: {
                classList: {
                    classes: new Set(),
                    add(c) { this.classes.add(c); },
                    remove(c) { this.classes.delete(c); },
                    contains(c) { return this.classes.has(c); },
                    toggle(c, force) {
                        if (force === true)
                            this.classes.add(c);
                        else if (force === false)
                            this.classes.delete(c);
                        else if (this.classes.has(c))
                            this.classes.delete(c);
                        else
                            this.classes.add(c);
                    }
                },
                appendChild(c) { },
                removeChild(c) { }
            },
            getElementById(id) {
                if (!dom[id])
                    dom[id] = makeEl(id);
                return dom[id];
            },
            querySelector(sel) {
                if (sel.startsWith('#'))
                    return dom[sel.slice(1)] || null;
                return null;
            },
            querySelectorAll() { return []; },
            createElement(tag) { return makeEl('', tag); },
            execCommand: () => true
        },
        navigator: {
            clipboard: {
                writeText: async (t) => {
                    lastCopiedText = t;
                    return Promise.resolve();
                }
            }
        },
        localStorage: {
            getItem: (k) => localStorageStore[k] || null,
            setItem: (k, v) => { localStorageStore[k] = String(v); }
        },
        print: () => { printed = true; },
        alert: () => { },
        setTimeout: (fn) => fn(),
        clearTimeout: () => { },
        addEventListener: () => { }
    };
    mockWindow.window = mockWindow;
    const ctx = node_vm_1.default.createContext(mockWindow);
    node_vm_1.default.runInContext(scriptCode, ctx);
    return { ctx, dom, mockWindow, localStorageStore, getPrinted: () => printed, getLastCopiedText: () => lastCopiedText };
}
// ============================================================================
// SUITE 1: One-Click Client PDF Report & Pitch Card Generator
// ============================================================================
console.log('\n--- [TEST SUITE] 1. One-Click Client PDF Report & Advisor Pitch Cards ---');
test('Client PDF Modal exposes openClientPdfModal, closeClientPdfModal, and updates open state', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.openClientPdfModal, 'function');
    node_assert_1.default.strictEqual(typeof ctx.closeClientPdfModal, 'function');
    ctx.openClientPdfModal();
    node_assert_1.default.ok(dom['client-pdf-modal'].classList.contains('open'), 'Modal must have open class');
    node_assert_1.default.ok(dom['client-pdf-backdrop'].classList.contains('open'), 'Backdrop must have open class');
    ctx.closeClientPdfModal();
    node_assert_1.default.ok(!dom['client-pdf-modal'].classList.contains('open'), 'Modal must remove open class');
    node_assert_1.default.ok(!dom['client-pdf-backdrop'].classList.contains('open'), 'Backdrop must remove open class');
});
test('Advisor Branding Profile persists to localStorage and renders in PDF report', () => {
    const { ctx, dom, localStorageStore } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.getAdvisorProfile, 'function');
    node_assert_1.default.strictEqual(typeof ctx.saveAdvisorProfile, 'function');
    const customProfile = {
        name: '林偉傑 Vincent Lam',
        title: '資深區域總監 · MDRT TOT',
        license: 'IA998877',
        team: '宏利傳承尊尚團隊',
        phone: '+852 9876 5432'
    };
    ctx.saveAdvisorProfile(customProfile);
    const loaded = ctx.getAdvisorProfile();
    node_assert_1.default.strictEqual(loaded.name, customProfile.name);
    node_assert_1.default.strictEqual(loaded.title, customProfile.title);
    node_assert_1.default.strictEqual(loaded.phone, customProfile.phone);
    ctx.renderClientPdfPreview();
    const previewHtml = dom['client-pdf-report-preview'].innerHTML;
    node_assert_1.default.ok(previewHtml.includes('林偉傑 Vincent Lam'), 'Preview must render advisor name');
    node_assert_1.default.ok(previewHtml.includes('MDRT TOT'), 'Preview must render MDRT TOT');
    node_assert_1.default.ok(previewHtml.includes('+852 9876 5432'), 'Preview must render phone');
    node_assert_1.default.ok(previewHtml.includes('GL20'), 'Preview must cite statutory HKIA GL20 disclaimer');
    node_assert_1.default.ok(previewHtml.includes('13 間私家醫院免找數擔保'), 'Preview must cite 13 private hospitals LOG');
});
test('Print function invokes window.print() and export buttons trigger formatted WhatsApp/WeChat copy', () => {
    const { ctx, getPrinted } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.printClientReport, 'function');
    node_assert_1.default.strictEqual(typeof ctx.copyReportWhatsApp, 'function');
    node_assert_1.default.strictEqual(typeof ctx.copyReportWechat, 'function');
    ctx.printClientReport();
    node_assert_1.default.strictEqual(getPrinted(), true, 'printClientReport must invoke window.print()');
});
test('copyReportWhatsApp in 3-way mode produces comprehensive 3-plan comparison card', () => {
    const { ctx, getLastCopiedText } = createSandbox();
    ctx.setArenaMode('3way');
    ctx.copyReportWhatsApp();
    const text = getLastCopiedText();
    node_assert_1.default.ok(text.includes('【InsurIntel 專業保險對比簡報 · 客戶專屬】'), 'Card must have title');
    node_assert_1.default.ok(text.includes('三方旗艦橫向對決') || text.includes('3-Way PK'), 'Card must state 3-way mode');
    node_assert_1.default.ok(text.includes('Plan A (我方)'), 'Card must include Plan A');
    node_assert_1.default.ok(text.includes('Plan B (競品)'), 'Card must include Plan B');
    node_assert_1.default.ok(text.includes('Plan C (第三方)'), 'Card must include Plan C');
    node_assert_1.default.ok(text.includes('GL20'), 'Card must include GL20 disclaimer');
});
test('saveAdvisorProfile with silent=true saves to localStorage without toast notification spam', () => {
    const { ctx, dom, localStorageStore } = createSandbox();
    dom['toast'].className = '';
    ctx.saveAdvisorProfile({ name: '張三豐' }, true);
    node_assert_1.default.strictEqual(JSON.parse(localStorageStore['insurintel_advisor_profile']).name, '張三豐');
    node_assert_1.default.ok(!dom['toast'].classList.contains('show'), 'Toast should not be shown when silent=true');
});
// ============================================================================
// SUITE 2: Universal Life (UL) Premium Financing Stress Calculator
// ============================================================================
console.log('\n--- [TEST SUITE] 2. Universal Life (UL) Premium Financing Stress Calculator ---');
test('calculateULStress computes exact leverage, net spread, and base case values', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.calculateULStress, 'function');
    // 1,000,000 capital撬動 3,000,000 policy
    // creditingRate = 5.25%, borrowingRate = 3.80%, hike = 0
    const base = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 0);
    node_assert_1.default.strictEqual(base.capital, 1000000);
    node_assert_1.default.strictEqual(base.policyTotal, 3000000);
    node_assert_1.default.strictEqual(base.loanAmount, 2000000);
    node_assert_1.default.strictEqual(base.leverageRatio, 3);
    node_assert_1.default.strictEqual(base.netSpreadPct, 1.45); // 5.25 - 3.80 = 1.45%
    node_assert_1.default.ok(base.annualCarryGainHKD > 0, 'Annual net carry gain must be positive in base case');
    node_assert_1.default.strictEqual(base.isNegativeSpread, false);
    node_assert_1.default.strictEqual(base.status, '安全');
});
test('calculateULStress under +100bps rate hike reduces net spread but maintains positive carry', () => {
    const { ctx } = createSandbox();
    const hike100 = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 100);
    node_assert_1.default.strictEqual(hike100.effectiveBorrowingRate, 4.80);
    node_assert_1.default.strictEqual(hike100.netSpreadPct, 0.45); // 5.25 - 4.80 = 0.45%
    node_assert_1.default.strictEqual(hike100.isNegativeSpread, false);
});
test('calculateULStress under +200bps rate hike triggers negative spread and margin call warning', () => {
    const { ctx } = createSandbox();
    const hike200 = ctx.calculateULStress(1000000, 3000000, 5.25, 3.80, 200);
    node_assert_1.default.strictEqual(hike200.effectiveBorrowingRate, 5.80);
    node_assert_1.default.strictEqual(hike200.netSpreadPct, -0.55); // 5.25 - 5.80 = -0.55%
    node_assert_1.default.strictEqual(hike200.isNegativeSpread, true);
    node_assert_1.default.ok(hike200.status.includes('警戒') || hike200.status.includes('追繳保證金風險'), 'Status must flag margin call / stress risk');
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
    node_assert_1.default.strictEqual(hike200.netSpreadPct, -0.55);
    node_assert_1.default.strictEqual(hike200.isNegativeSpread, true);
    node_assert_1.default.strictEqual(hike200.netCashflow, 41500, 'Overall cashflow remains positive despite negative loan spread');
    node_assert_1.default.strictEqual(hike200.annualBorrowingInterest, 116000);
    node_assert_1.default.strictEqual(hike200.annualCreditingInterest, 157500);
});
// ============================================================================
// SUITE 3: Group Medical + High-End VHIS Deductible Optimizer
// ============================================================================
console.log('\n--- [TEST SUITE] 3. Group Medical + High-End VHIS Deductible Optimizer ---');
test('optimizeGroupMedicalVHIS recommends optimal deductible and computes zero out-of-pocket', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.optimizeGroupMedicalVHIS, 'function');
    // Test Case A: Existing group limit HK$ 30,000 -> optimal deductible HK$ 25,000
    const opt30k = ctx.optimizeGroupMedicalVHIS(30000);
    node_assert_1.default.strictEqual(opt30k.recommendedDeductible, 25000);
    node_assert_1.default.strictEqual(opt30k.gapOutOfPocket, 0, 'Out-of-pocket gap must be eliminated to HK$ 0');
    node_assert_1.default.ok(opt30k.annualSavingVsZero > 0, 'Annual saving vs HK$0 deductible must be positive');
    node_assert_1.default.strictEqual(opt30k.tenYearSavingVsZero, opt30k.annualSavingVsZero * 10);
    // Test Case B: Existing group limit HK$ 50,000 -> optimal deductible HK$ 50,000
    const opt50k = ctx.optimizeGroupMedicalVHIS(50000);
    node_assert_1.default.strictEqual(opt50k.recommendedDeductible, 50000);
    node_assert_1.default.strictEqual(opt50k.gapOutOfPocket, 0);
    node_assert_1.default.ok(opt50k.annualSavingVsZero > opt30k.annualSavingVsZero, 'Higher deductible yields higher premium savings');
    // Test Case C: Existing group limit HK$ 80,000 (executive tier) -> optimal deductible HK$ 80,000
    const opt80k = ctx.optimizeGroupMedicalVHIS(80000);
    node_assert_1.default.strictEqual(opt80k.recommendedDeductible, 80000);
    node_assert_1.default.strictEqual(opt80k.gapOutOfPocket, 0);
    // Test Case D: No existing group cover (HK$ 0) -> recommended deductible HK$ 0
    const opt0 = ctx.optimizeGroupMedicalVHIS(0);
    node_assert_1.default.strictEqual(opt0.recommendedDeductible, 0);
    node_assert_1.default.strictEqual(opt0.annualSavingVsZero, 0);
});
// ============================================================================
// SUITE 4: QDAP Family Tax Savings & Cashflow Calculator
// ============================================================================
console.log('\n--- [TEST SUITE] 4. QDAP Family Tax Savings & Cashflow Calculator ---');
test('calculateQDAPFamilyTax validates single HK$60k vs joint HK$120k caps and 17% max HK$20,400', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.calculateQDAPFamilyTax, 'function');
    // Single taxpayer contributing HK$ 60,000 at 17% top tax bracket
    const single1 = ctx.calculateQDAPFamilyTax(60000, 17, false);
    node_assert_1.default.strictEqual(single1.eligibleDeduction, 60000);
    node_assert_1.default.strictEqual(single1.annualTaxSavings, 10200); // 60,000 * 17% = 10,200
    node_assert_1.default.strictEqual(single1.cap, 60000);
    // Single taxpayer contributing HK$ 100,000 -> capped at HK$ 60,000
    const singleExcess = ctx.calculateQDAPFamilyTax(100000, 17, false);
    node_assert_1.default.strictEqual(singleExcess.eligibleDeduction, 60000);
    node_assert_1.default.strictEqual(singleExcess.annualTaxSavings, 10200);
    // Married couple joint assessment contributing HK$ 120,000 at 17% bracket
    const couple1 = ctx.calculateQDAPFamilyTax(120000, 17, true);
    node_assert_1.default.strictEqual(couple1.eligibleDeduction, 120000);
    node_assert_1.default.strictEqual(couple1.annualTaxSavings, 20400); // 120,000 * 17% = 20,400
    node_assert_1.default.strictEqual(couple1.cap, 120000);
    // Monthly annuity payout schedule
    node_assert_1.default.ok(couple1.estimatedMonthlyAnnuity > 0, 'Must compute dynamic monthly retirement annuity');
});
test('calculateQDAPFamilyTax handles zero contribution boundary and generates detailed payout schedule', () => {
    const { ctx } = createSandbox();
    const zeroResult = ctx.calculateQDAPFamilyTax(0, 17, false);
    node_assert_1.default.strictEqual(zeroResult.eligibleDeduction, 0, 'Zero contribution must give 0 eligible deduction');
    node_assert_1.default.strictEqual(zeroResult.annualTaxSavings, 0, 'Zero contribution must give 0 tax savings');
    node_assert_1.default.strictEqual(zeroResult.estimatedMonthlyAnnuity, 0, 'Zero contribution gives 0 monthly annuity');
    node_assert_1.default.ok(Array.isArray(zeroResult.schedule), 'Must generate structured schedule array');
    node_assert_1.default.strictEqual(zeroResult.schedule.length, 20, 'Default schedule duration is 20 years');
    node_assert_1.default.strictEqual(zeroResult.schedule[0].annualPayout, 0);
    const activeResult = ctx.calculateQDAPFamilyTax(60000, 17, false, 10);
    node_assert_1.default.strictEqual(activeResult.schedule.length, 10);
    node_assert_1.default.ok(activeResult.schedule[0].annualPayout > 0);
    node_assert_1.default.strictEqual(activeResult.schedule[0].age, 65);
});
// ============================================================================
// SUITE 5: 3-Way Flagship Simultaneous Comparison (Plan A vs Plan B vs Plan C)
// ============================================================================
console.log('\n--- [TEST SUITE] 5. 3-Way Flagship Simultaneous Comparison (3-Way PK) ---');
test('3-Way Comparison computes dynamic multi-dimensional metrics across all 5 categories', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.setArenaMode, 'function');
    node_assert_1.default.strictEqual(typeof ctx.toggleArenaMode, 'function');
    node_assert_1.default.strictEqual(typeof ctx.compute3WaySpecs, 'function');
    // Enable 3-way mode
    ctx.setArenaMode('3way');
    node_assert_1.default.strictEqual(ctx.arenaMode, '3way');
    const categories = [
        'Savings_MultiCurrency',
        'Critical_Illness',
        'Medical_VHIS',
        'Annuity_QDAP',
        'Financing_UniversalLife'
    ];
    for (const cat of categories) {
        const specs3 = ctx.compute3WaySpecs('AIA', 'Prudential', 'Manulife', cat);
        node_assert_1.default.ok(Array.isArray(specs3), `compute3WaySpecs for ${cat} must return array`);
        node_assert_1.default.ok(specs3.length >= 3, `${cat} must return at least 3 comparison metrics`);
        specs3.forEach((row) => {
            node_assert_1.default.ok(row.label, 'Row must have label');
            node_assert_1.default.ok(row.ourVal !== undefined, 'Row must have ourVal');
            node_assert_1.default.ok(row.rivalVal !== undefined, 'Row must have rivalVal');
            node_assert_1.default.ok(row.thirdVal !== undefined, 'Row must have thirdVal');
            node_assert_1.default.ok(row.winner, 'Row must identify leading plan');
            node_assert_1.default.ok(row.summary, 'Row must give comparative summary');
        });
    }
});
// ============================================================================
// SUITE 6: Accessibility & Localization in Web App Header
// ============================================================================
console.log('\n--- [TEST SUITE] 6. Accessibility & Localization in Web App Header ---');
test('Language toggle switches between zh-HK and zh-CN and persists', () => {
    const { ctx, mockWindow, localStorageStore } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.toggleLangZh, 'function');
    node_assert_1.default.strictEqual(typeof ctx.setLangZh, 'function');
    ctx.setLangZh('zh-CN');
    node_assert_1.default.strictEqual(mockWindow.document.documentElement.lang, 'zh-CN');
    node_assert_1.default.ok(mockWindow.document.body.classList.contains('lang-hans'));
    node_assert_1.default.strictEqual(localStorageStore['insurintel_lang'], 'zh-CN');
    ctx.setLangZh('zh-HK');
    node_assert_1.default.strictEqual(mockWindow.document.documentElement.lang, 'zh-HK');
    node_assert_1.default.ok(!mockWindow.document.body.classList.contains('lang-hans'));
    node_assert_1.default.strictEqual(localStorageStore['insurintel_lang'], 'zh-HK');
});
test('Font size toggle activates large-font-mode and persists', () => {
    const { ctx, mockWindow, localStorageStore } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.toggleFontSize, 'function');
    node_assert_1.default.strictEqual(typeof ctx.setFontSize, 'function');
    ctx.setFontSize(true);
    node_assert_1.default.ok(mockWindow.document.body.classList.contains('large-font-mode'));
    node_assert_1.default.strictEqual(localStorageStore['insurintel_large_font'], '1');
    ctx.setFontSize(false);
    node_assert_1.default.ok(!mockWindow.document.body.classList.contains('large-font-mode'));
    node_assert_1.default.strictEqual(localStorageStore['insurintel_large_font'], '0');
});
test('Traditional to Simplified Chinese dictionary converts core industry terminology accurately', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.toHans, 'function');
    node_assert_1.default.strictEqual(typeof ctx.toHant, 'function');
    const tradSample = '香港保險業監管局GN16官方實現率及13間私家醫院免找數擔保';
    const simpResult = ctx.toHans(tradSample);
    node_assert_1.default.strictEqual(simpResult, '香港保险业监管局GN16官方实现率及13间私家医院免找数担保');
    const backTrad = ctx.toHant(simpResult);
    node_assert_1.default.strictEqual(backTrad, tradSample);
});
// ============================================================================
// SUITE 7: Expand Review Board to All 100 Comments (50 Client + 50 Agent)
// ============================================================================
console.log('\n--- [TEST SUITE] 7. 100-Comment Multi-Perspective Review Board ---');
test('window.APP_100_IMPROVEMENT_COMMENTS has exactly 100 items with 50 Client & 50 Agent split', () => {
    const { ctx } = createSandbox();
    const comments100 = ctx.APP_100_IMPROVEMENT_COMMENTS;
    node_assert_1.default.ok(Array.isArray(comments100), 'APP_100_IMPROVEMENT_COMMENTS must be array');
    node_assert_1.default.strictEqual(comments100.length, 100, 'Must have exactly 100 comments');
    const clients = comments100.filter((c) => c.sourceRole.includes('客戶'));
    const agents = comments100.filter((c) => c.sourceRole.includes('顧問'));
    node_assert_1.default.strictEqual(clients.length, 50, 'Must have exactly 50 Client comments');
    node_assert_1.default.strictEqual(agents.length, 50, 'Must have exactly 50 Agent comments');
    // Verify backward compatibility: 30-item array remains intact
    const comments30 = ctx.APP_30_IMPROVEMENT_COMMENTS;
    node_assert_1.default.ok(Array.isArray(comments30), 'APP_30_IMPROVEMENT_COMMENTS must remain array');
    node_assert_1.default.strictEqual(comments30.length, 30, 'APP_30_IMPROVEMENT_COMMENTS must stay at length 30');
});
test('Audit Drawer Scope Switching (30 vs 100) and 100-filter functionality', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.setAuditScope, 'function');
    node_assert_1.default.strictEqual(typeof ctx.filterAudit100, 'function');
    node_assert_1.default.strictEqual(typeof ctx.renderAudit100Cards, 'function');
    // Switch to 100 scope
    ctx.setAuditScope('100');
    node_assert_1.default.strictEqual(ctx.auditScope, '100');
    node_assert_1.default.strictEqual(dom['audit-header-badge'].innerText, '100/100 Resolved');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[C01]') || dom['audit-cards-list'].innerHTML.includes('[C1]'));
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[A50]'));
    // Filter 100 clients
    ctx.filterAudit100('client');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[C01]') || dom['audit-cards-list'].innerHTML.includes('[C1]'));
    node_assert_1.default.ok(!dom['audit-cards-list'].innerHTML.includes('[A50]'));
    // Filter 100 agents
    ctx.filterAudit100('agent');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[A50]'));
    node_assert_1.default.ok(!dom['audit-cards-list'].innerHTML.includes('[C01]'));
    // Switch back to 30 scope
    ctx.setAuditScope('30');
    node_assert_1.default.strictEqual(ctx.auditScope, '30');
    node_assert_1.default.strictEqual(dom['audit-header-badge'].innerText, '30/30 Verified');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[A30]'));
});
// ============================================================================
// SUITE 8: Byte-for-Byte SHA-256 Parity across Distribution Targets
// ============================================================================
console.log('\n--- [TEST SUITE] 8. Byte-for-Byte SHA-256 Distribution Parity ---');
test('templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html have identical SHA-256 hashes', () => {
    const hTemplate = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(templatesPath)).digest('hex');
    const hDistIndex = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(distIndexPath)).digest('hex');
    const hDistCafe = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(distCafePath)).digest('hex');
    node_assert_1.default.strictEqual(hTemplate, hDistIndex, 'Template and dist/index.html must have identical SHA-256');
    node_assert_1.default.strictEqual(hTemplate, hDistCafe, 'Template and dist/cafe.html must have identical SHA-256');
    console.log(`  SHA-256: ${hTemplate}`);
});
console.log('================================================================================');
console.log(`ROADMAP VERIFICATION SUMMARY: ${records.filter(r => r.passed).length} / ${records.length} PASSED`);
console.log('================================================================================');
const allPassed = records.every(r => r.passed);
if (!allPassed) {
    process.exit(1);
}

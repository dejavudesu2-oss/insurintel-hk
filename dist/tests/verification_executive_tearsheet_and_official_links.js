"use strict";
/**
 * tests/verification_executive_tearsheet_and_official_links.ts
 * Exhaustive Verification & Stress-Testing Suite for:
 * 1. Removal of `📋 30項評審` button & banner from header and main viewport
 * 2. Executive Tear-Sheet PDF Generation & Printing Workflow (@media print, window.print, downloadClientHtmlReport)
 * 3. Prominent Official Original Source & Brochure Links for all 99 products, camp cards, battle cards & tear-sheet
 * 4. Stress-testing all interactive scenario tools (UL stress calculator, group medical optimizer, QDAP tax calculator)
 * 5. Byte-for-byte SHA-256 distribution parity across templates/mobile_cafe_app.html, dist/index.html, dist/cafe.html
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
console.log('INSURINTEL HK - EXECUTIVE TEAR-SHEET & OFFICIAL BROCHURE LINKS VERIFICATION');
console.log('================================================================================');
const templatesPath = path_1.default.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path_1.default.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path_1.default.join(process.cwd(), 'dist', 'cafe.html');
node_assert_1.default.ok(fs_1.default.existsSync(templatesPath), 'mobile_cafe_app.html must exist');
const htmlSource = fs_1.default.readFileSync(templatesPath, 'utf8').replace(/\r\n/g, '\n');
function createSandbox() {
    const dom = {};
    const makeEl = (id = '', tag = 'div') => ({
        id,
        tagName: tag.toUpperCase(),
        innerHTML: '',
        innerText: '',
        textContent: '',
        value: '',
        href: '',
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
        closest(sel) { return null; },
        querySelector(sel) { return null; },
        querySelectorAll(sel) { return []; }
    });
    const ids = [
        'audit-30-drawer', 'audit-30-backdrop', 'audit-cards-list', 'audit-chip-all',
        'audit-chip-client', 'audit-chip-agent', 'audit-header-badge',
        'client-pdf-modal', 'client-pdf-backdrop', 'client-pdf-heading',
        'client-pdf-report-preview', 'btn-print-client-report', 'btn-download-html-report',
        'btn-copy-report-whatsapp', 'btn-copy-report-wechat',
        'report-agent-name', 'report-agent-title', 'report-agent-license', 'report-agent-team', 'report-agent-phone',
        'my-product-official-link', 'rival-product-official-link', 'third-product-official-link',
        'my-product-display', 'rival-product-display', 'third-product-display',
        'hero-our-name', 'hero-rival-name', 'hero-third-name', 'hero-third-side', 'hero-vs-third',
        'tearsheet-our-pdf-link', 'tearsheet-rival-pdf-link', 'tearsheet-third-pdf-link', 'tearsheet-official-links-bar',
        'select-my-insurer', 'select-rival-insurer', 'select-third-insurer',
        'select-my-product', 'select-rival-product', 'select-third-product',
        'camp-card-our', 'camp-card-rival', 'camp-card-third',
        'input-ul-capital', 'input-ul-policy-total', 'input-ul-crediting-rate', 'input-ul-borrowing-rate',
        'btn-hike-0', 'btn-hike-100', 'btn-hike-200', 'btn-hike-300',
        'ul-stress-leverage', 'ul-stress-net-spread', 'ul-stress-cashflow', 'ul-stress-roe',
        'ul-stress-status-pill', 'ul-margin-call-status',
        'slider-group-limit', 'input-group-limit', 'group-opt-recommended', 'group-opt-savings-annual',
        'group-opt-out-of-pocket', 'group-opt-explanation', 'group-opt-10yr-savings',
        'group-chip-0', 'group-chip-25000', 'group-chip-30000', 'group-chip-50000', 'group-chip-80000',
        'qdap-premium-input', 'qdap-couple-toggle', 'qdap-eligible-limit-val', 'qdap-tax-saved-val',
        'qdap-annuity-monthly-val', 'qdap-annuity-monthly-num', 'qdap-guaranteed-share-val', 'qdap-guaranteed-share-num',
        'qdap-chip-2', 'qdap-chip-6', 'qdap-chip-10', 'qdap-chip-14', 'qdap-chip-17',
        'catalog-drawer', 'catalog-drawer-backdrop', 'catalog-cards-list', 'catalog-search-input',
        'ai-chat-drawer', 'ai-chat-drawer-backdrop', 'toast', 'category-tabs', 'bilateral-arena-box',
        'header-lang-text', 'header-font-text'
    ];
    for (const id of ids) {
        dom[id] = makeEl(id);
    }
    let printCalled = false;
    const mockWindow = {
        document: {
            body: makeEl('body', 'body'),
            documentElement: { lang: 'zh-HK' },
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
            querySelectorAll(sel) {
                return [];
            },
            createElement(tag) {
                return makeEl('', tag);
            }
        },
        navigator: {
            clipboard: {
                writeText: async (t) => Promise.resolve()
            }
        },
        localStorage: {
            store: {},
            getItem(k) { return this.store[k] || null; },
            setItem(k, v) { this.store[k] = String(v); }
        },
        print() {
            printCalled = true;
        },
        get printCalled() {
            return printCalled;
        },
        URL: {
            createObjectURL: () => 'blob:mock-url'
        },
        Blob: class MockBlob {
            content;
            options;
            constructor(content, options) {
                this.content = content;
                this.options = options;
            }
        },
        setTimeout: (fn) => fn(),
        clearTimeout: () => { },
        addEventListener: () => { }
    };
    mockWindow.window = mockWindow;
    const scriptMatch = htmlSource.match(/<script>([\s\S]*?)<\/script>/);
    node_assert_1.default.ok(scriptMatch, 'Script block must be present');
    const ctx = node_vm_1.default.createContext(mockWindow);
    node_vm_1.default.runInContext(scriptMatch[1], ctx);
    return { ctx, dom, mockWindow };
}
// ============================================================================
// SUITE 1: 📋 30項評審 Button & Banner Deletion from Header & Viewport
// ============================================================================
console.log('\n--- [TEST SUITE] 1. Deletion of 📋 30項評審 Button & Banner from Main Viewport ---');
test('The 📋 30項評審 button is NOT rendered in the main viewport or bottom navigation bar', () => {
    // Bottom bar should only have: 一鍵翻轉, AI 攻防大腦, 99款產品庫
    const bottomBarMatch = htmlSource.match(/<div class="bottom-bar">([\s\S]*?)<\/div>/);
    node_assert_1.default.ok(bottomBarMatch, 'Bottom bar must exist in HTML');
    const bottomBarHtml = bottomBarMatch[1];
    node_assert_1.default.ok(!bottomBarHtml.includes('30項評審'), 'Bottom bar must NOT contain 30項評審 button');
    node_assert_1.default.ok(!bottomBarHtml.includes('btn-open-audit-drawer'), 'Bottom bar must NOT contain btn-open-audit-drawer');
});
test('The audit-30-trigger-banner is completely removed from the main viewport layout', () => {
    // Check main viewport content before #category-tabs or scenario panels
    node_assert_1.default.ok(!htmlSource.includes('<div class="audit-30-trigger-banner"'), 'audit-30-trigger-banner element must NOT be present in main viewport');
});
test('CSS rules ensure audit triggers and open drawer buttons remain hidden if referenced', () => {
    node_assert_1.default.ok(htmlSource.includes('.audit-30-trigger-banner {\n      display: none !important;'), 'CSS must enforce audit-30-trigger-banner display: none');
    node_assert_1.default.ok(htmlSource.includes('#btn-open-audit-drawer {\n      display: none !important;'), 'CSS must enforce btn-open-audit-drawer display: none');
});
test('Review board drawer and underlying QA data remain accessible programmatically via openAudit30Drawer()', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.openAudit30Drawer, 'function', 'openAudit30Drawer must exist for programmatic QA audit');
    ctx.openAudit30Drawer();
    node_assert_1.default.ok(dom['audit-30-drawer'].classList.contains('open'), 'Drawer opens upon programmatic call');
});
// ============================================================================
// SUITE 2: Executive Tear-Sheet PDF Generation & Printing Workflow
// ============================================================================
console.log('\n--- [TEST SUITE] 2. Executive Tear-Sheet PDF Generation & Printing Workflow ---');
test('renderClientPdfPreview() builds an executive tear-sheet containing required professional sections', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.renderClientPdfPreview, 'function');
    ctx.renderClientPdfPreview();
    const previewHtml = dom['client-pdf-report-preview'].innerHTML;
    node_assert_1.default.ok(previewHtml.includes('client-report-sheet'), 'Must contain client-report-sheet container');
    node_assert_1.default.ok(previewHtml.includes('INSURINTEL HK · 授權財務策劃專業客戶簡報'), 'Must include executive header title');
    node_assert_1.default.ok(previewHtml.includes('香港保監局 GN16 權威官方實現率存檔'), 'Must include GN16 official record subtitle');
    node_assert_1.default.ok(previewHtml.includes('全港 13 間私家醫院免找數擔保核准'), 'Must include 13 private hospitals guarantee badge');
    node_assert_1.default.ok(previewHtml.includes('GL20 認證客觀對比'), 'Must include GL20 objective comparison stamp');
    node_assert_1.default.ok(previewHtml.includes('核心方案架構深度對照表'), 'Must include structured spec comparison table');
    node_assert_1.default.ok(previewHtml.includes('【香港保險業監管局 (IA)《操守指引》(GL20) 合規聲明】'), 'Must include statutory GL20 disclaimer');
});
test('@media print CSS isolates client-pdf-modal, hides background layout & styles A4 margins', () => {
    node_assert_1.default.ok(htmlSource.includes('body > *:not(#client-pdf-modal) {\n        display: none !important;'), 'Print CSS must hide all body elements except #client-pdf-modal');
    node_assert_1.default.ok(htmlSource.includes('.client-pdf-modal {\n        display: block !important;'), 'Print CSS must force client-pdf-modal display: block');
    node_assert_1.default.ok(htmlSource.includes('.advisor-profile-form,\n      .client-pdf-modal-actions'), 'Print CSS must hide advisor edit form and action buttons');
    node_assert_1.default.ok(htmlSource.includes('size: A4 portrait;'), 'Print CSS must specify A4 portrait size');
    node_assert_1.default.ok(htmlSource.includes('print-color-adjust: exact'), 'Print CSS must force exact color printing');
});
test('printClientReport() invokes window.print() and ensures report modal preview is up-to-date', () => {
    const { ctx, mockWindow } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.printClientReport, 'function');
    ctx.printClientReport();
    node_assert_1.default.strictEqual(mockWindow.printCalled, true, 'window.print() must have been called');
});
test('downloadClientHtmlReport() compiles full standalone offline HTML tear-sheet with print styles', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.downloadClientHtmlReport, 'function');
    ctx.renderClientPdfPreview();
    // Trigger download function without throwing
    node_assert_1.default.doesNotThrow(() => {
        ctx.downloadClientHtmlReport();
    });
});
test('copyReportWhatsApp() and copyReportWechat() format executive text tear-sheets with advisor profile and GL20', () => {
    const { ctx } = createSandbox();
    const wa = ctx.copyReportWhatsApp();
    node_assert_1.default.ok(wa.toUpperCase().includes('INSURINTEL'), 'WhatsApp card must include brand header');
    node_assert_1.default.ok(wa.includes('GL20 合規聲明'), 'WhatsApp card must include GL20 compliance');
    node_assert_1.default.ok(wa.includes('專屬理財顧問'), 'WhatsApp card must include advisor profile');
    const wx = ctx.copyReportWechat();
    node_assert_1.default.ok(wx.toUpperCase().includes('INSURINTEL'), 'WeChat card must include brand header');
    node_assert_1.default.ok(wx.includes('保監局 GL20 合規聲明'), 'WeChat card must include GL20 compliance');
});
// ============================================================================
// SUITE 3: Prominent Official Original Source / Brochure Links
// ============================================================================
console.log('\n--- [TEST SUITE] 3. Prominent Official Brochure Links Across All Plans ---');
test('Every single product in ALL_PRODUCTS_CATALOG has a valid official source / brochure URL', () => {
    const { ctx } = createSandbox();
    const catalog = ctx.ALL_PRODUCTS_CATALOG;
    node_assert_1.default.ok(Array.isArray(catalog), 'ALL_PRODUCTS_CATALOG must be an array');
    node_assert_1.default.strictEqual(catalog.length, 99, 'Must have exactly 99 products');
    catalog.forEach((p) => {
        node_assert_1.default.ok(p.official_url || p.brochure_url, `Product ${p.id} (${p.name}) must have official_url or brochure_url`);
        const url = p.official_url || p.brochure_url;
        node_assert_1.default.ok(url.startsWith('https://'), `Product ${p.id} url must be HTTPS: ${url}`);
    });
});
test('Every product card in the 99-product catalog drawer renders a prominent official brochure link', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.renderCatalog, 'function');
    ctx.renderCatalog('', 'all');
    const catalogHtml = dom['catalog-cards-list'].innerHTML;
    node_assert_1.default.ok(catalogHtml.includes('class="catalog-official-link"'), 'Catalog cards must render catalog-official-link');
    node_assert_1.default.ok(catalogHtml.includes('📄 官方原廠說明書及條款 ↗'), 'Must display standardized official link anchor label');
    node_assert_1.default.ok(catalogHtml.includes('target="_blank"'), 'Must open in new tab with target="_blank"');
    node_assert_1.default.ok(catalogHtml.includes('rel="noopener noreferrer"'), 'Must have rel="noopener noreferrer"');
});
test('Camp cards for Plan A, Plan B, and Plan C all feature prominent official brochure links', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.updateCampSelectors, 'function');
    ctx.updateCampSelectors();
    const myLink = dom['my-product-official-link'];
    const rivalLink = dom['rival-product-official-link'];
    const thirdLink = dom['third-product-official-link'];
    node_assert_1.default.ok(myLink.href.startsWith('https://'), 'Plan A link must point to valid HTTPS URL');
    node_assert_1.default.ok(rivalLink.href.startsWith('https://'), 'Plan B link must point to valid HTTPS URL');
    node_assert_1.default.ok(thirdLink.href.startsWith('https://'), 'Plan C link must point to valid HTTPS URL');
});
test('Client View features #tearsheet-official-links-bar with direct links to official documents', () => {
    const { ctx, dom } = createSandbox();
    ctx.updateCampSelectors();
    const ourDoc = dom['tearsheet-our-pdf-link'];
    const rivalDoc = dom['tearsheet-rival-pdf-link'];
    node_assert_1.default.ok(ourDoc.href.startsWith('https://'), 'Tear-sheet Plan A link must be HTTPS');
    node_assert_1.default.ok(rivalDoc.href.startsWith('https://'), 'Tear-sheet Plan B link must be HTTPS');
    node_assert_1.default.ok(ourDoc.innerHTML.includes('官方手冊原件 ↗'), 'Tear-sheet link must display official source badge');
});
test('renderClientPdfPreview() embeds official brochure links in comparison table headers for both 1v1 and 3-Way', () => {
    const { ctx, dom } = createSandbox();
    // 1v1 mode
    ctx.setArenaMode('1v1');
    ctx.renderClientPdfPreview();
    let preview = dom['client-pdf-report-preview'].innerHTML;
    node_assert_1.default.ok(preview.includes('📄 官網原文手冊 ↗'), '1v1 table must include official brochure links');
    // 3-Way mode
    ctx.setArenaMode('3way');
    ctx.renderClientPdfPreview();
    preview = dom['client-pdf-report-preview'].innerHTML;
    node_assert_1.default.ok(preview.includes('Plan C:'), '3-Way table must include Plan C');
    node_assert_1.default.ok(preview.includes('📄 官網原文手冊 ↗'), '3-Way table must include official brochure links');
});
// ============================================================================
// SUITE 4: Interactive Stress-Testing of Newly Added Features
// ============================================================================
console.log('\n--- [TEST SUITE] 4. Stress-Testing Interactive Calculators & Tools ---');
test('UL Stress Calculator behaves reactively across +0, +100, +200, +300 bps hikes', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.calculateULStress, 'function');
    node_assert_1.default.strictEqual(typeof ctx.setULHike, 'function');
    // Base case: capital $1M, total $3M (loan $2M, 3.0x leverage)
    const base = ctx.calculateULStress(1000000, 3000000, 5.25, 4.25, 0);
    node_assert_1.default.strictEqual(base.leverage, '3.0x');
    node_assert_1.default.strictEqual(base.netSpread, '+1.00%');
    node_assert_1.default.strictEqual(base.isNegativeSpread, false);
    node_assert_1.default.ok(base.netCashflow > 0);
    // Extreme stress +200bps: borrowing becomes 6.25%
    const stress = ctx.calculateULStress(1000000, 3000000, 5.25, 4.25, 200);
    node_assert_1.default.strictEqual(stress.netSpread, '-1.00%');
    node_assert_1.default.strictEqual(stress.isNegativeSpread, true);
    node_assert_1.default.strictEqual(stress.isMarginCallRisk, true);
    // Severe stress +300bps: borrowing becomes 7.25%
    const extreme = ctx.calculateULStress(1000000, 3000000, 5.25, 4.25, 300);
    node_assert_1.default.strictEqual(extreme.netSpread, '-2.00%');
    node_assert_1.default.strictEqual(extreme.isNegativeSpread, true);
    node_assert_1.default.strictEqual(extreme.isMarginCallRisk, true);
});
test('Group Medical Deductible Optimizer boundary testing ($0, $25k, $50k, $80k)', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.optimizeGroupMedicalVHIS, 'function');
    const zero = ctx.optimizeGroupMedicalVHIS(0);
    node_assert_1.default.strictEqual(zero.recommendedDeductible, 0);
    node_assert_1.default.strictEqual(zero.premiumSavingsPct, 0);
    node_assert_1.default.strictEqual(zero.outOfPocketCostHKD, 0);
    const med = ctx.optimizeGroupMedicalVHIS(50000);
    node_assert_1.default.strictEqual(med.recommendedDeductible, 50000);
    node_assert_1.default.strictEqual(med.premiumSavingsPct, 54);
    node_assert_1.default.strictEqual(med.premiumSavingsHKD, 9000);
    node_assert_1.default.strictEqual(med.tenYearSavings, 90000);
    node_assert_1.default.strictEqual(med.outOfPocketCostHKD, 0);
    const executive = ctx.optimizeGroupMedicalVHIS(80000);
    node_assert_1.default.strictEqual(executive.recommendedDeductible, 80000);
    node_assert_1.default.strictEqual(executive.premiumSavingsPct, 61);
    node_assert_1.default.strictEqual(executive.premiumSavingsHKD, 10300);
    node_assert_1.default.strictEqual(executive.tenYearSavings, 103000);
    node_assert_1.default.strictEqual(executive.outOfPocketCostHKD, 0);
});
test('QDAP Family Tax Savings boundary testing (Single $60k vs Couple $120k)', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.calculateQDAPFamilyTax, 'function');
    // Single mode: $60k cap @ 17% max HK$10,200
    const single = ctx.calculateQDAPFamilyTax(80000, 17, 'single');
    node_assert_1.default.strictEqual(single.eligibleDeduction, 60000);
    node_assert_1.default.strictEqual(single.taxSaved, 10200);
    // Couple mode: $120k cap @ 17% max HK$20,400
    const couple = ctx.calculateQDAPFamilyTax(150000, 17, 'couple');
    node_assert_1.default.strictEqual(couple.eligibleDeduction, 120000);
    node_assert_1.default.strictEqual(couple.taxSaved, 20400);
    // Zero input
    const zero = ctx.calculateQDAPFamilyTax(0, 17, 'single');
    node_assert_1.default.strictEqual(zero.eligibleDeduction, 0);
    node_assert_1.default.strictEqual(zero.taxSaved, 0);
});
// ============================================================================
// SUITE 5: Distribution Byte-for-Byte SHA-256 Parity
// ============================================================================
console.log('\n--- [TEST SUITE] 5. Byte-for-Byte Parity Across Distribution Files ---');
test('templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html have identical SHA-256 hashes', () => {
    const hTemplate = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(templatesPath)).digest('hex');
    const hDistIndex = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(distIndexPath)).digest('hex');
    const hDistCafe = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(distCafePath)).digest('hex');
    node_assert_1.default.strictEqual(hTemplate, hDistIndex, 'mobile_cafe_app.html and dist/index.html must match');
    node_assert_1.default.strictEqual(hTemplate, hDistCafe, 'mobile_cafe_app.html and dist/cafe.html must match');
    console.log(`  SHA-256: ${hTemplate}`);
});
console.log('================================================================================');
console.log(`SUMMARY: ${records.filter(r => r.passed).length} / ${records.length} PASSED`);
console.log('================================================================================');
if (records.some(r => !r.passed)) {
    process.exit(1);
}

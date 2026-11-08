"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_vm_1 = __importDefault(require("node:vm"));
const scenario_agents_1 = require("../src/engine/scenario_agents");
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
console.log('INSURINTEL HK - 30 COMMENTS & 13 PRIVATE HOSPITALS MATRIX VERIFICATION');
console.log('================================================================================');
const templatesPath = path_1.default.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path_1.default.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path_1.default.join(process.cwd(), 'dist', 'cafe.html');
node_assert_1.default.ok(fs_1.default.existsSync(templatesPath), 'mobile_cafe_app.html must exist');
const htmlSource = fs_1.default.readFileSync(templatesPath, 'utf8');
// --- 1. 30-Comment Multi-Perspective Review & PM/PdM Watchflow ---
console.log('\n--- [TEST SUITE] 1. 30 Improvement Comments & PM/PdM Governance ---');
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
    const mockWindow = {
        document: {
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
            createElement(tag) { return makeEl('', tag); }
        },
        navigator: {
            clipboard: {
                writeText: async (t) => Promise.resolve()
            }
        },
        localStorage: {
            getItem: () => null,
            setItem: () => { }
        },
        setTimeout: (fn) => fn(),
        clearTimeout: () => { },
        addEventListener: () => { }
    };
    mockWindow.window = mockWindow;
    const ctx = node_vm_1.default.createContext(mockWindow);
    node_vm_1.default.runInContext(scriptCode, ctx);
    return { ctx, dom };
}
test('30 Improvement comments are loaded on window.APP_30_IMPROVEMENT_COMMENTS with 15 Client & 15 Agent split', () => {
    const { ctx } = createSandbox();
    const comments = ctx.APP_30_IMPROVEMENT_COMMENTS;
    node_assert_1.default.ok(Array.isArray(comments), 'APP_30_IMPROVEMENT_COMMENTS must be an array');
    node_assert_1.default.strictEqual(comments.length, 30, 'Must have exactly 30 comments');
    const clientComments = comments.filter((c) => c.sourceRole.includes('客戶'));
    const agentComments = comments.filter((c) => c.sourceRole.includes('顧問'));
    node_assert_1.default.strictEqual(clientComments.length, 15, 'Must have exactly 15 Client comments');
    node_assert_1.default.strictEqual(agentComments.length, 15, 'Must have exactly 15 Agent comments');
    comments.forEach((c) => {
        node_assert_1.default.ok(c.id, 'Comment must have id');
        node_assert_1.default.ok(c.topic, 'Comment must have topic');
        node_assert_1.default.ok(c.commentText, 'Comment must have commentText');
        node_assert_1.default.ok(c.pmReview, 'Comment must have pmReview');
        node_assert_1.default.ok(c.pdmDecision, 'Comment must have pdmDecision');
        node_assert_1.default.ok(c.status && (c.status.includes('已修復') || c.status.includes('VERIFIED')), 'Comment must be marked resolved');
        node_assert_1.default.ok(c.resolvedIn, 'Comment must document resolvedIn feature symbol');
    });
});
test('Interactive Review Board Drawer renders and filterAudit30 correctly filters cards', () => {
    const { ctx, dom } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.openAudit30Drawer, 'function', 'openAudit30Drawer must be exposed');
    node_assert_1.default.strictEqual(typeof ctx.closeAudit30Drawer, 'function', 'closeAudit30Drawer must be exposed');
    node_assert_1.default.strictEqual(typeof ctx.filterAudit30, 'function', 'filterAudit30 must be exposed');
    node_assert_1.default.strictEqual(typeof ctx.renderAudit30Cards, 'function', 'renderAudit30Cards must be exposed');
    // Open drawer
    ctx.openAudit30Drawer();
    node_assert_1.default.ok(dom['audit-30-drawer'].classList.contains('open'), 'Drawer must have open class');
    node_assert_1.default.ok(dom['audit-30-backdrop'].classList.contains('open'), 'Backdrop must have open class');
    // Verify render output has 30 cards initially
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[C1]'), 'Must render C1');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[A30]'), 'Must render A30');
    // Filter client
    ctx.filterAudit30('client');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[C1]'), 'Client filter must include C1');
    node_assert_1.default.ok(!dom['audit-cards-list'].innerHTML.includes('[A16]'), 'Client filter must exclude A16');
    // Filter agent
    ctx.filterAudit30('agent');
    node_assert_1.default.ok(dom['audit-cards-list'].innerHTML.includes('[A16]'), 'Agent filter must include A16');
    node_assert_1.default.ok(!dom['audit-cards-list'].innerHTML.includes('[C1]'), 'Agent filter must exclude C1');
    // Close drawer
    ctx.closeAudit30Drawer();
    node_assert_1.default.ok(!dom['audit-30-drawer'].classList.contains('open'), 'Drawer must remove open class');
});
// --- 2. All 13 Private Hospitals in Hong Kong ---
console.log('\n--- [TEST SUITE] 2. All 13 Private Hospitals Matrix & LOG Pre-Approval ---');
test('HK_13_PRIVATE_HOSPITALS contains all 13 private hospitals with room tier and deposit status', () => {
    node_assert_1.default.strictEqual(scenario_agents_1.HK_13_PRIVATE_HOSPITALS.length, 13, 'Must contain exactly 13 private hospitals');
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
        const found = scenario_agents_1.HK_13_PRIVATE_HOSPITALS.some(h => h.name.includes(hosp));
        node_assert_1.default.ok(found, `Hospital list must contain ${hosp}`);
    });
    scenario_agents_1.HK_13_PRIVATE_HOSPITALS.forEach(h => {
        node_assert_1.default.ok(h.roomTier, `${h.name} must specify roomTier`);
        node_assert_1.default.ok(h.directBillingStatus, `${h.name} must specify directBillingStatus`);
        node_assert_1.default.ok(h.preApprovalHours, `${h.name} must specify preApprovalHours`);
        node_assert_1.default.ok(h.specialties, `${h.name} must specify specialties`);
        node_assert_1.default.ok(h.depositWithLOG.includes('HK$ 0'), `${h.name} depositWithLOG must be HK$ 0`);
        node_assert_1.default.ok(h.depositWithoutLOG.includes('HK$'), `${h.name} must state non-LOG cash deposit range`);
    });
});
test('Client sandbox exposes all 13 private hospitals in window.HK_13_PRIVATE_HOSPITALS', () => {
    const { ctx } = createSandbox();
    const clientHospitals = ctx.HK_13_PRIVATE_HOSPITALS;
    node_assert_1.default.ok(Array.isArray(clientHospitals), 'HK_13_PRIVATE_HOSPITALS must be on window');
    node_assert_1.default.strictEqual(clientHospitals.length, 13, 'Client must have all 13 private hospitals');
});
test('checkCashlessDirectBilling supports endoscopy and spine surgery procedures', () => {
    const { ctx } = createSandbox();
    node_assert_1.default.strictEqual(typeof ctx.checkCashlessDirectBilling, 'function');
    const endoscopy = ctx.checkCashlessDirectBilling('香港養和醫院 (Hong Kong Sanatorium & Hospital)', '腸胃鏡檢查及息肉切除 (Endoscopy & Polypectomy)', 0);
    node_assert_1.default.strictEqual(endoscopy.estimatedCost, 45000, 'Endoscopy estimated cost must be HK$ 45,000');
    node_assert_1.default.strictEqual(endoscopy.coverage, 45000, 'Coverage must be 45,000 with 0 deductible');
    const spine = ctx.checkCashlessDirectBilling('港怡醫院 (Gleneagles Hospital Hong Kong)', '脊柱微創椎間盤手術 (Minimally Invasive Spine Surgery)', 25000);
    node_assert_1.default.strictEqual(spine.estimatedCost, 350000, 'Spine surgery estimated cost must be HK$ 350,000');
    node_assert_1.default.strictEqual(spine.clientOutOfPocket, 25000, 'Out of pocket matches deductible 25,000');
    node_assert_1.default.strictEqual(spine.coverage, 325000, 'Coverage must be 325,000');
});
test('checkCashlessDirectBilling defensively handles null, undefined, NaN, and negative inputs', () => {
    const { ctx } = createSandbox();
    // Test client-side function
    const res1 = ctx.checkCashlessDirectBilling(null, undefined, NaN);
    node_assert_1.default.ok(res1 && res1.isApproved, 'Client-side must handle null/undefined/NaN without throwing');
    node_assert_1.default.strictEqual(res1.deductible, 0, 'Deductible must default to 0 on NaN');
    node_assert_1.default.ok(res1.hospital.length > 0, 'Hospital must fall back to non-empty default');
    node_assert_1.default.ok(res1.treatment.length > 0, 'Treatment must fall back to non-empty default');
    const res2 = ctx.checkCashlessDirectBilling('', '', -5000);
    node_assert_1.default.strictEqual(res2.deductible, 0, 'Negative deductible must clamp/default to 0');
    // Test engine CashlessMedicalAgent
    const agent = new scenario_agents_1.CashlessMedicalAgent();
    const resAgent1 = agent.checkCashlessDirectBilling({ hospital: null, treatment: undefined, deductibleHKD: NaN });
    node_assert_1.default.ok(resAgent1 && resAgent1.isCashlessApproved, 'Engine agent must handle null/undefined/NaN');
    node_assert_1.default.strictEqual(resAgent1.deductibleHKD, 0, 'Engine deductible must default to 0 on NaN');
    const resAgent2 = agent.checkCashlessDirectBilling({ hospital: '   ', treatment: '', deductibleHKD: -10000 });
    node_assert_1.default.strictEqual(resAgent2.deductibleHKD, 0, 'Engine negative deductible must clamp/default to 0');
});
// --- 3. GN16 100% Official Benchmark Explainer & SVG Dimensions ---
console.log('\n--- [TEST SUITE] 3. GN16 100% Benchmark & Anti-Clipping SVG ---');
test('HTML includes GN16 100% statutory explanation banner with clear definitions', () => {
    node_assert_1.default.ok(htmlSource.includes('gn16-explainer-banner'), 'Must include gn16-explainer-banner');
    node_assert_1.default.ok(htmlSource.includes('100% 官方基準'), 'Must explain 100% official benchmark');
    node_assert_1.default.ok(htmlSource.includes('非保證分紅實現率'), 'Must reference GN16 fulfillment ratio');
    node_assert_1.default.ok(htmlSource.includes('100% 完全達到'), 'Must explain 100% means paying 100% of illustrated bonus');
    node_assert_1.default.ok(htmlSource.includes('&gt; 100% 超額派發'), 'Must explain >100% over-fulfillment');
    node_assert_1.default.ok(htmlSource.includes('&lt; 100% 分紅打折'), 'Must explain <100% dividend cuts');
});
test('renderCorridorVisualChart SVG width is widened to 660 with xEnd=520 to avoid label clipping', () => {
    node_assert_1.default.ok(htmlSource.includes('const svgW = 660;'), 'svgW must be widened to 660');
    node_assert_1.default.ok(htmlSource.includes('const xEnd = 520;'), 'xEnd must be 520 to reserve right edge margin');
});
// --- 4. Actuarial Scorecard 1v1 Anti-Collision & Concrete Metrics ---
console.log('\n--- [TEST SUITE] 4. Actuarial Scorecard Anti-Collision & Concrete Metrics ---');
test('Actuarial Scorecard includes anti-collision twin badge for identical scores', () => {
    node_assert_1.default.ok(htmlSource.includes('p.our_score === p.rival_score'), 'Must branch on identical scores');
    node_assert_1.default.ok(htmlSource.includes('tspan fill="#64748b">=</tspan'), 'Twin badge must render equals sign');
    node_assert_1.default.ok(htmlSource.includes('paint-order="stroke"'), 'Staggered labels must have white halo stroke');
});
test('Actuarial Scorecard includes Scorecard Explainer Banner and concrete metric rows', () => {
    node_assert_1.default.ok(htmlSource.includes('id="scorecard-explainer-banner"'), 'Scorecard explainer banner must exist');
    node_assert_1.default.ok(htmlSource.includes('scorecard-concrete-row'), 'scorecard-concrete-row class must exist in HTML');
    node_assert_1.default.ok(htmlSource.includes('實質數據折算：'), 'Concrete metric prefix must exist');
    node_assert_1.default.ok(htmlSource.includes('精算折算依據：'), 'Actuarial rationale explanation must exist');
});
test('computeRadarDimensionScores generates concrete_our, concrete_rival, and explanation', () => {
    const { ctx } = createSandbox();
    const card = ctx.getBattleCard('AIA', 'Prudential', 'prepayment');
    node_assert_1.default.ok(card, 'Battle card must be resolved');
    node_assert_1.default.ok(Array.isArray(card.radar_scorecard), 'radar_scorecard must be an array');
    node_assert_1.default.strictEqual(card.radar_scorecard.length, 5, 'Must have 5 dimensions');
    card.radar_scorecard.forEach((dim) => {
        node_assert_1.default.ok(dim.concrete_our, `${dim.key} must have concrete_our`);
        node_assert_1.default.ok(dim.concrete_rival, `${dim.key} must have concrete_rival`);
        node_assert_1.default.ok(dim.explanation, `${dim.key} must have explanation`);
    });
});
// --- 5. QDAP Guaranteed Cashflow Dynamic Reactivity (Image 1 Bug Fix) ---
console.log('\n--- [TEST SUITE] 5. QDAP Guaranteed Cashflow Dynamic Reactivity ---');
test('QDAP battle card chart_bars renders valid percentage string without product name bug', () => {
    const { ctx } = createSandbox();
    const card = ctx.getBattleCard('AIA', 'Prudential', 'qdap');
    node_assert_1.default.ok(card, 'QDAP battle card must be generated');
    const bars = card.chart_bars;
    node_assert_1.default.ok(Array.isArray(bars), 'chart_bars must be an array');
    node_assert_1.default.strictEqual(bars.length, 3, 'Must have 3 bars');
    // Verify Plan B bar value
    const planBBar = bars[1];
    node_assert_1.default.ok(!planBBar.value.includes('對手【'), 'Plan B bar value must not contain corrupted label string');
    node_assert_1.default.ok(planBBar.value.includes('% 保證'), 'Plan B bar value must contain percentage guarantee');
    node_assert_1.default.ok(typeof planBBar.widthPct === 'number' && planBBar.widthPct > 0, 'widthPct must be positive number');
    // Verify Table Rows
    const rows = card.table_rows;
    node_assert_1.default.ok(Array.isArray(rows), 'table_rows must be an array');
    node_assert_1.default.ok(rows.some((r) => r.label.includes('保證內部回報率')), 'Must have Guaranteed IRR row');
    node_assert_1.default.ok(rows.some((r) => r.label.includes('總預期內部回報率')), 'Must have Total IRR row');
});
test('Critical Illness battle card table_rows dynamically reflect illness count, multiple claim limit %, and ICU clause', () => {
    const { ctx } = createSandbox();
    const card = ctx.getBattleCard('AIA', 'Prudential', 'critical_illness');
    node_assert_1.default.ok(card, 'Critical illness battle card must be generated');
    const rows = card.table_rows;
    node_assert_1.default.ok(Array.isArray(rows), 'table_rows must be an array');
    const illnessRow = rows.find((r) => r.label.includes('涵蓋嚴重疾病總數'));
    node_assert_1.default.ok(illnessRow, 'Must have illness count row');
    node_assert_1.default.ok(illnessRow.value.includes('種 vs 對手'), 'Illness row must have dynamic comparison');
    const multipleRow = rows.find((r) => r.label.includes('多次索賠累計保額上限'));
    node_assert_1.default.ok(multipleRow, 'Must have multiple claim limit row');
    node_assert_1.default.ok(multipleRow.value.includes('%'), 'Multiple claim limit must be a percentage');
    const icuRow = rows.find((r) => r.label.includes('ICU'));
    node_assert_1.default.ok(icuRow, 'Must have ICU clause row');
});
test('Universal Life battle card chart_bars and table_rows dynamically reflect net spread, crediting rate, and floor rate', () => {
    const { ctx } = createSandbox();
    const card = ctx.getBattleCard('AIA', 'Prudential', 'financing_ul');
    node_assert_1.default.ok(card, 'Universal life battle card must be generated');
    // Verify chart bars
    const bars = card.chart_bars;
    node_assert_1.default.ok(Array.isArray(bars) && bars.length >= 2, 'UL chart bars must exist');
    node_assert_1.default.ok(bars[0].value.includes('淨利差') || bars[0].value.includes('結算') || bars[0].value.includes('%'), 'UL bar 0 must show crediting / spread metrics');
    // Verify table rows
    const rows = card.table_rows;
    node_assert_1.default.ok(Array.isArray(rows), 'table_rows must be an array');
    const spreadRow = rows.find((r) => r.label.includes('淨利差收益') || r.label.includes('Net Spread'));
    node_assert_1.default.ok(spreadRow, 'Must have Net Spread row');
    node_assert_1.default.ok(spreadRow.value.includes('%'), 'Net spread must contain percentage');
    const floorRow = rows.find((r) => r.label.includes('保底息率') || r.label.includes('Floor Rate'));
    node_assert_1.default.ok(floorRow, 'Must have Floor Rate row');
    node_assert_1.default.ok(floorRow.value.includes('%'), 'Floor rate must contain percentage');
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
            node_assert_1.default.ok(output.includes(`第 ${year} 年`), `Must project for Year ${year} in ${cat}`);
            node_assert_1.default.ok(!output.includes('我方方案在選定第'), `Must NOT have generic placeholder in ${cat} Year ${year}`);
            node_assert_1.default.ok(output.includes('🔵 【Plan A 我方】'), 'Must render Plan A container');
            node_assert_1.default.ok(output.includes('🔴 【Plan B 對手】'), 'Must render Plan B container');
        });
    });
});
// --- 7. Byte-for-Byte SHA-256 Parity ---
console.log('\n--- [TEST SUITE] 7. Distribution Byte-for-Byte Parity ---');
test('templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html are byte-for-byte identical', () => {
    const templateRaw = fs_1.default.readFileSync(templatesPath, 'utf8');
    const indexRaw = fs_1.default.readFileSync(distIndexPath, 'utf8');
    const cafeRaw = fs_1.default.readFileSync(distCafePath, 'utf8');
    const hashT = node_crypto_1.default.createHash('sha256').update(templateRaw).digest('hex');
    const hashI = node_crypto_1.default.createHash('sha256').update(indexRaw).digest('hex');
    const hashC = node_crypto_1.default.createHash('sha256').update(cafeRaw).digest('hex');
    node_assert_1.default.strictEqual(hashT, hashI, 'templates/mobile_cafe_app.html and dist/index.html must have identical SHA-256');
    node_assert_1.default.strictEqual(hashT, hashC, 'templates/mobile_cafe_app.html and dist/cafe.html must have identical SHA-256');
    node_assert_1.default.strictEqual(templateRaw.length, indexRaw.length, 'Byte lengths must match exactly');
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
}
else {
    console.log('VERDICT: ALL 30 COMMENTS & 13 PRIVATE HOSPITALS MATRIX ACCEPTANCE TESTS PASSED (100%).\n');
}

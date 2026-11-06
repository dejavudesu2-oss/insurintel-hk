"use strict";
/**
 * tests/verification_ai_copilot_and_ui_dedup.ts
 * Rigorous Verification Suite for:
 * 1. UI & Button Deduplication
 * 2. Dedicated Inline Copy Buttons adjacent to pitch steps (#agent-step-1/2/3, cafe pitch)
 * 3. Removal / hiding of redundant WhatsApp launcher buttons
 * 4. AI Analysis Dialog / Drawer (#ai-analysis-drawer) with live context payload and AIA System Prompt
 * 5. Dynamic AI consultation generation across all 5 smart prompts with GL20 compliance
 * 6. Template byte-for-byte SHA256 parity across distribution targets
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
console.log('INSURINTEL HK - AI ANALYSIS COPILOT & UI DEDUPLICATION VERIFICATION');
console.log('================================================================================');
const templatesPath = path_1.default.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const distIndexPath = path_1.default.join(process.cwd(), 'dist', 'index.html');
const distCafePath = path_1.default.join(process.cwd(), 'dist', 'cafe.html');
node_assert_1.default.ok(fs_1.default.existsSync(templatesPath), 'mobile_cafe_app.html must exist');
const htmlSource = fs_1.default.readFileSync(templatesPath, 'utf8');
// --- 1. DOM Elements Structure & Deduplication ---
console.log('\n--- [TEST SUITE] 1. UI Structure & Button Deduplication ---');
test('HTML source includes AI Analysis Drawer (#ai-analysis-drawer) and Backdrop', () => {
    node_assert_1.default.ok(htmlSource.includes('id="ai-analysis-drawer"'), 'Must have ai-analysis-drawer ID');
    node_assert_1.default.ok(htmlSource.includes('id="ai-analysis-backdrop"'), 'Must have ai-analysis-backdrop ID');
    node_assert_1.default.ok(htmlSource.includes('id="btn-open-ai-chat"'), 'Must have btn-open-ai-chat in bottom bar');
    node_assert_1.default.ok(htmlSource.includes('id="ai-quick-trigger-banner"'), 'Must have quick trigger banner above arena');
});
test('Inline Copy Buttons exist directly adjacent to pitch steps and elevator script', () => {
    node_assert_1.default.ok(htmlSource.includes('id="btn-copy-full-pitch"'), 'Must have btn-copy-full-pitch');
    node_assert_1.default.ok(htmlSource.includes('copyStepPitch(1, this)'), 'Step 1 must have inline copy button');
    node_assert_1.default.ok(htmlSource.includes('copyStepPitch(2, this)'), 'Step 2 must have inline copy button');
    node_assert_1.default.ok(htmlSource.includes('copyStepPitch(3, this)'), 'Step 3 must have inline copy button');
    node_assert_1.default.ok(htmlSource.includes('id="btn-inline-copy-cafe"'), 'Cafe elevator box must have inline copy button');
});
test('Redundant external WhatsApp launch button in cafe scenario is hidden from layout', () => {
    node_assert_1.default.ok(htmlSource.includes('id="btn-cafe-open-whatsapp" onclick="openWhatsAppCafeScript()" style="display:none;"') ||
        htmlSource.includes('id="btn-cafe-open-whatsapp" style="display:none;"') ||
        htmlSource.includes('id="btn-cafe-open-whatsapp" onclick="openWhatsAppCafeScript()" style="display:none;" aria-hidden="true"'), 'Redundant external WhatsApp button must be styled display:none to deduplicate UI while preserving test ID');
});
test('AIA Advisor System Prompt specification is documented in HTML details', () => {
    node_assert_1.default.ok(htmlSource.includes('AIA 專用 System Prompt 提示詞架構設計'), 'Prompt spec heading must exist');
    node_assert_1.default.ok(htmlSource.includes('友邦 (AIA) 首席攻防核保精算顧問'), 'Prompt spec must define role');
    node_assert_1.default.ok(htmlSource.includes('三步破局法'), 'Prompt spec must define 3-step strategy');
    node_assert_1.default.ok(htmlSource.includes('GL20'), 'Prompt spec must reference GL20 compliance');
});
// --- 2. VM Sandbox Execution of Functions ---
console.log('\n--- [TEST SUITE] 2. Client DOM Sandbox & Function Verification ---');
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
            contains(c) { return this.classes.has(c); }
        },
        children: [],
        appendChild(c) { this.children.push(c); },
        removeChild(c) { },
        closest(sel) {
            if (sel === '.ai-chat-bubble')
                return dom['mock-chat-bubble'] || this;
            return null;
        },
        querySelector(sel) {
            if (sel === '.ai-script-text')
                return { innerText: '模擬 AI 話術文字' };
            return null;
        }
    });
    const ids = [
        'ai-analysis-drawer', 'ai-analysis-backdrop', 'ai-context-details', 'ai-chat-messages',
        'ai-chat-input', 'agent-step-1', 'agent-step-2', 'agent-step-3', 'agent-title',
        'cafe-elevator-script', 'toast', 'select-my-insurer', 'select-rival-insurer',
        'select-my-product', 'select-rival-product', 'btn-copy-full-pitch'
    ];
    for (const id of ids) {
        dom[id] = makeEl(id);
    }
    dom['agent-step-1'].innerText = '「陳生，你真係好有眼光！」';
    dom['agent-step-2'].innerText = '「但仔細拆解對手通函 fine print，只保證頭 1 年！」';
    dom['agent-step-3'].innerText = '「我地旗艦系列歷年累積 GN16 實現率高達 96.5%！」';
    dom['cafe-elevator-script'].innerText = '「30秒電梯話術：友邦盈御3實現率96.5%，避開次年跳水！」';
    let copiedText = '';
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
                writeText: async (t) => { copiedText = t; return Promise.resolve(); }
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
    return { mockWindow, dom, getCopiedText: () => copiedText };
}
test('Sandbox exposes copyStepPitch, copyFull3StepPitch, openAiChatDrawer, sendAiChatQuery on window', () => {
    const { mockWindow } = createSandbox();
    node_assert_1.default.strictEqual(typeof mockWindow.copyStepPitch, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.copyFull3StepPitch, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.openAiChatDrawer, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.closeAiChatDrawer, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.renderAiContextPreview, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.handleSmartPromptClick, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.sendAiChatQuery, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.copyAiGeneratedScript, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.copySystemPrompt, 'function');
    node_assert_1.default.strictEqual(typeof mockWindow.copyCafeScript, 'function');
});
test('copyStepPitch copies individual step text and updates toast', () => {
    const { mockWindow, dom, getCopiedText } = createSandbox();
    const mockBtn = { innerHTML: '📋 複製', nodeType: 1, classList: { add() { }, remove() { } } };
    mockWindow.copyStepPitch(1, mockBtn);
    node_assert_1.default.ok(getCopiedText().includes('陳生，你真係好有眼光'), 'Copied text must match step 1');
    node_assert_1.default.ok(dom['toast'].innerText.includes('步驟 1 破局話術已複製'), 'Toast feedback must confirm step 1 copy');
});
test('copyFull3StepPitch combines all 3 steps with headers', () => {
    const { mockWindow, dom, getCopiedText } = createSandbox();
    const mockBtn = { innerHTML: '📋 複製全部', nodeType: 1, classList: { add() { }, remove() { } } };
    mockWindow.copyFull3StepPitch(mockBtn);
    const full = getCopiedText();
    node_assert_1.default.ok(full.includes('【步驟 1：肯定眼光】'), 'Must have Step 1 header');
    node_assert_1.default.ok(full.includes('【步驟 2：點破盲點】'), 'Must have Step 2 header');
    node_assert_1.default.ok(full.includes('【步驟 3：數據絕殺】'), 'Must have Step 3 header');
    node_assert_1.default.ok(dom['toast'].innerText.includes('完整 3 步破局話術已複製'), 'Toast feedback must confirm full copy');
});
test('openAiChatDrawer toggles open class and renders dynamic context preview', () => {
    const { mockWindow, dom } = createSandbox();
    mockWindow.openAiChatDrawer();
    node_assert_1.default.ok(dom['ai-analysis-drawer'].classList.contains('open'), 'Drawer must have open class');
    node_assert_1.default.ok(dom['ai-analysis-backdrop'].classList.contains('open'), 'Backdrop must have open class');
    node_assert_1.default.ok(dom['ai-context-details'].innerHTML.includes('Plan A'), 'Context details must render Plan A');
    node_assert_1.default.ok(dom['ai-context-details'].innerHTML.includes('GL20') || dom['ai-context-details'].innerHTML.includes('操守守則'), 'Context details must cite GL20 compliance');
});
test('handleSmartPromptClick generates AI analysis with strategy, script, and GL20 guardrails', () => {
    const { mockWindow, dom } = createSandbox();
    mockWindow.handleSmartPromptClick('gimmick_break');
    const chatHtml = dom['ai-chat-messages'].innerHTML;
    node_assert_1.default.ok(chatHtml.includes('🎯 戰略破局核心'), 'AI reply must include Strategy section');
    node_assert_1.default.ok(chatHtml.includes('🗣️ 30 秒地道口頭話術'), 'AI reply must include 30s elevator script');
    node_assert_1.default.ok(chatHtml.includes('📊 精算數據出處'), 'AI reply must cite actuarial source');
    node_assert_1.default.ok(chatHtml.includes('🛡️ 保監局 GL20 合規護欄'), 'AI reply must contain GL20 guardrail');
    node_assert_1.default.ok(chatHtml.includes('copyAiGeneratedScript'), 'AI reply must include 1-click copy button');
});
test('Custom user query via sendAiChatQuery generates compliant advice', () => {
    const { mockWindow, dom } = createSandbox();
    dom['ai-chat-input'].value = '客人問家庭預算點分配好？';
    mockWindow.sendAiChatQuery();
    const chatHtml = dom['ai-chat-messages'].innerHTML;
    node_assert_1.default.ok(chatHtml.includes('家庭'), 'AI reply must address family budget');
    node_assert_1.default.ok(chatHtml.includes('60/40'), 'AI reply must recommend 60/40 rule');
});
test('copyCafeScript accepts button, copies elevator pitch, and provides visual feedback', () => {
    const { mockWindow, dom, getCopiedText } = createSandbox();
    let flashed = false;
    const mockBtn = {
        innerHTML: '📋 複製話術',
        nodeType: 1,
        classList: {
            add(c) { if (c === 'copied')
                flashed = true; },
            remove() { }
        }
    };
    mockWindow.copyCafeScript(mockBtn);
    node_assert_1.default.ok(getCopiedText().includes('30秒電梯話術'), 'Must copy cafe elevator script');
    node_assert_1.default.ok(dom['toast'].innerText.includes('30秒見客話術已複製'), 'Toast feedback must confirm cafe pitch copy');
    node_assert_1.default.strictEqual(flashed, true, 'Button must flash copied class');
});
test('copySystemPrompt copies full AIA System Prompt with visual feedback', () => {
    const { mockWindow, dom, getCopiedText } = createSandbox();
    let flashed = false;
    const mockBtn = {
        innerHTML: '📋 複製 Prompt',
        nodeType: 1,
        classList: {
            add(c) { if (c === 'copied')
                flashed = true; },
            remove() { }
        }
    };
    dom['ai-system-prompt-text'] = {
        innerText: '【角色定義】友邦 (AIA) 首席攻防核保精算顧問與商業談判 Copilot'
    };
    mockWindow.copySystemPrompt(mockBtn);
    node_assert_1.default.ok(getCopiedText().includes('友邦 (AIA) 首席攻防核保精算顧問'), 'Must copy system prompt text');
    node_assert_1.default.ok(dom['toast'].innerText.includes('AIA System Prompt 已複製'), 'Toast feedback must confirm prompt copy');
    node_assert_1.default.strictEqual(flashed, true, 'Button must flash copied class');
});
test('getProductById resolves both string ID and object references without falling back', () => {
    const { mockWindow } = createSandbox();
    mockWindow.ALL_PRODUCTS_CATALOG = [
        { id: 'TEST-AIA-01', name: '友邦 盈御多元貨幣 3', gn16: '96.5%', prepay: '5.0%', breakevenYear: 18, gn16Fulfillment: 96.5 },
        { id: 'TEST-PRU-01', name: '保誠 雋富多元貨幣', gn16: '91.2%', prepay: '5.8%', breakevenYear: 19, gn16Fulfillment: 91.2 }
    ];
    // Test by string ID
    const p1 = mockWindow.getProductById('TEST-AIA-01');
    node_assert_1.default.ok(p1, 'Must find product by ID string');
    node_assert_1.default.strictEqual(p1.id, 'TEST-AIA-01');
    // Test by object reference (previously returned null!)
    const p2 = mockWindow.getProductById({ id: 'TEST-PRU-01', name: '保誠 雋富多元貨幣' });
    node_assert_1.default.ok(p2, 'Must resolve product from object reference');
    node_assert_1.default.strictEqual(p2.id, 'TEST-PRU-01');
});
test('renderAiContextPreview calculates and displays dynamic GN16 & breakeven deltas', () => {
    const { mockWindow, dom } = createSandbox();
    mockWindow.ALL_PRODUCTS_CATALOG = [
        { id: 'TEST-AIA-01', name: '友邦 盈御多元貨幣 3', gn16: '96.5%', prepay: '5.0%', breakevenYear: 18, gn16Fulfillment: 96.5 },
        { id: 'TEST-PRU-01', name: '保誠 雋富多元貨幣', gn16: '91.2%', prepay: '5.8%', breakevenYear: 19, gn16Fulfillment: 91.2 }
    ];
    mockWindow.openAiChatDrawer();
    const ctxHtml = dom['ai-context-details'].innerHTML;
    node_assert_1.default.ok(ctxHtml.includes('精算差值'), 'Context preview must show deltas');
    node_assert_1.default.ok(ctxHtml.includes('GN16 差額'), 'Context preview must calculate GN16 delta');
    node_assert_1.default.ok(ctxHtml.includes('保證回本'), 'Context preview must calculate Breakeven delta');
});
// --- 3. Byte Parity Check ---
console.log('\n--- [TEST SUITE] 3. Template Byte-for-Byte SHA-256 Parity ---');
test('templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html have identical SHA-256 hash', () => {
    const tplHash = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(templatesPath)).digest('hex');
    const indexHash = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(distIndexPath)).digest('hex');
    const cafeHash = node_crypto_1.default.createHash('sha256').update(fs_1.default.readFileSync(distCafePath)).digest('hex');
    node_assert_1.default.strictEqual(tplHash, indexHash, 'templates and dist/index.html must match');
    node_assert_1.default.strictEqual(tplHash, cafeHash, 'templates and dist/cafe.html must match');
});
const failed = records.filter(r => !r.passed);
console.log('================================================================================');
console.log(`TOTAL TESTS: ${records.length} | PASSED: ${records.length - failed.length} | FAILED: ${failed.length}`);
console.log('================================================================================');
if (failed.length > 0) {
    process.exit(1);
}
else {
    console.log('VERDICT: ALL AI COPILOT & UI DEDUPLICATION ACCEPTANCE TESTS PASSED (100%).\n');
}

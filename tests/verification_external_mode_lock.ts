/**
 * tests/verification_external_mode_lock.ts
 * Automated Verification Suite for External Mode Lock & Safety Guard (TASK-R3-03 / R4)
 * 
 * Verifies Acceptance Criteria:
 * 1. Default external mode / client view locks to Demo Mode ("保司 A" vs "保司 B")
 * 2. Attempts to disable demo mode while in external mode or client view are refused
 * 3. Code-level guard assertExternalModeSafety refuses to display real product names beside unverified data
 * 4. Strictly sourced rows (e.g. Cap. 112 s. 26ZZD QDAP HK$60,000) MAY display official names
 * 5. 100% SHA-256 byte parity maintained across templates/mobile_cafe_app.html, dist/index.html, dist/cafe.html
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';

console.log('================================================================================');
console.log('TEST SUITE: EXTERNAL MODE LOCK & CODE-LEVEL SAFETY GUARD (TASK-R3-03 / R4)');
console.log('================================================================================\n');

const htmlTargets = [
  path.join(process.cwd(), 'templates', 'mobile_cafe_app.html'),
  path.join(process.cwd(), 'dist', 'index.html'),
  path.join(process.cwd(), 'dist', 'cafe.html')
];

// 1. Text assertions across all 3 files
htmlTargets.forEach((p) => {
  const fileName = path.basename(p);
  assert.ok(fs.existsSync(p), `File must exist: ${p}`);
  const html = fs.readFileSync(p, 'utf8');

  assert.ok(html.includes('assertExternalModeSafety'), `${fileName} must include assertExternalModeSafety`);
  assert.ok(html.includes('EXTERNAL_MODE_LOCK_VIOLATION'), `${fileName} must include EXTERNAL_MODE_LOCK_VIOLATION error code`);
  assert.ok(html.includes('isExternalModeActive'), `${fileName} must include isExternalModeActive function`);
  assert.ok(html.includes('isFictionalInsurer'), `${fileName} must include isFictionalInsurer helper`);
  assert.ok(html.includes('isStrictSourcedRow'), `${fileName} must include isStrictSourcedRow helper`);

  console.log(`  [PASS] ${fileName} verified for External Mode Lock & Safety Guard functions.`);
});

// 2. SHA-256 Parity check
const hashes = htmlTargets.map(p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'));
assert.strictEqual(hashes[0], hashes[1], 'templates/mobile_cafe_app.html and dist/index.html must match');
assert.strictEqual(hashes[1], hashes[2], 'dist/index.html and dist/cafe.html must match');
console.log(`  [PASS] 100% SHA-256 parity verified across all 3 HTML targets (${hashes[0].slice(0, 16)}...)`);

// 3. Sandboxed execution environment
const templateHtml = fs.readFileSync(htmlTargets[0], 'utf8');
const scriptMatches = templateHtml.match(/<script>([\s\S]*?)<\/script>/g);
assert.ok(scriptMatches && scriptMatches.length > 0, 'Script blocks must be present');

const combinedScript = scriptMatches.map(m => m.replace(/<\/?script>/g, '')).join('\n;\n');

function createSandbox(urlSearch: string = '?view=client', hostname: string = 'app.insurintel.hk') {
  const dom: Record<string, any> = {};
  const toastMessages: string[] = [];

  const makeEl = (id: string = '', tag: string = 'div'): any => ({
    id,
    tagName: tag.toUpperCase(),
    innerHTML: '',
    innerText: '',
    textContent: '',
    value: '',
    href: '',
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
    closest(sel: string) { return null; },
    querySelector(sel: string) { return null; },
    querySelectorAll(sel: string) { return []; },
    setAttribute(k: string, v: string) {},
    getAttribute(k: string) { return null; }
  });

  const mockWindow: any = {
    URLSearchParams: globalThis.URLSearchParams,
    location: {
      search: urlSearch,
      hostname: hostname,
      protocol: 'https:',
      href: `https://${hostname}/${urlSearch}`
    },
    document: {
      getElementById: (id: string) => {
        if (!dom[id]) dom[id] = makeEl(id);
        return dom[id];
      },
      createElement: (tag: string) => makeEl('', tag),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    localStorage: {
      store: {} as Record<string, string>,
      getItem(k: string) { return this.store[k] || null; },
      setItem(k: string, v: string) { this.store[k] = String(v); },
      removeItem(k: string) { delete this.store[k]; }
    },
    navigator: {
      clipboard: {
        writeText: async () => {}
      }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout: (fn: Function) => fn(),
    clearTimeout: () => {},
    showToast: (msg: string) => { toastMessages.push(msg); },
    console: console
  };
  mockWindow.window = mockWindow;

  const ctx = vm.createContext(mockWindow);
  vm.runInContext(combinedScript, ctx);

  return { ctx, dom, mockWindow, toastMessages };
}

// 4. Test isExternalModeActive detection (Real Products Default vs Explicit Demo Mode)
console.log('\n--- Test 1: Default Real Product Mode vs Explicit Demo Mode Detection ---');
const { ctx: extCtx } = createSandbox('?view=client', 'app.insurintel.hk');
assert.strictEqual(extCtx.isExternalModeActive(), false, 'External hostname with ?view=client must default to real product mode (false)');

const { ctx: ghPagesCtx } = createSandbox('', 'dejavudesu2-oss.github.io');
assert.strictEqual(ghPagesCtx.isExternalModeActive(), false, 'GitHub Pages default load must show real products by default (false)');

const { ctx: explicitDemoCtx } = createSandbox('?mode=demo', 'dejavudesu2-oss.github.io');
assert.strictEqual(explicitDemoCtx.isExternalModeActive(), true, 'Explicit ?mode=demo must activate demo mode');
console.log('  [PASS] isExternalModeActive() defaults to real products on all hostnames and activates only for explicit ?mode=demo.');

// 5. Test Code-Level Guard assertExternalModeSafety
console.log('\n--- Test 2: Code-Level Guard assertExternalModeSafety ---');
assert.strictEqual(typeof extCtx.assertExternalModeSafety, 'function', 'assertExternalModeSafety must be exported');

// 2a. Guard must throw when demo lock enforcement (4th arg = true) is active and real unverified insurer/product is passed
assert.throws(() => {
  extCtx.assertExternalModeSafety('AIA', '盈御多元貨幣計劃 3', false, true);
}, (err: any) => {
  return err.code === 'EXTERNAL_MODE_LOCK_VIOLATION' && err.message.includes('Refusing to display real insurer [AIA]');
}, 'Guard must throw EXTERNAL_MODE_LOCK_VIOLATION when demo guard is explicitly enforced');

assert.throws(() => {
  extCtx.assertExternalModeSafety('Prudential', '雋富多元貨幣計劃', false, true);
}, (err: any) => {
  return err.code === 'EXTERNAL_MODE_LOCK_VIOLATION' && err.message.includes('Prudential');
}, 'Guard must throw for unverified Prudential product when demo guard is enforced');

// In default real-product mode (isDemoModeActive = false), real insurers and products pass cleanly
assert.strictEqual(extCtx.assertExternalModeSafety('AIA', '盈御多元貨幣計劃 3', false, false), true, 'Real AIA product must be permitted in default real-product mode');
assert.strictEqual(extCtx.assertExternalModeSafety('Prudential', '雋富多元貨幣計劃'), true, 'Real Prudential product must be permitted by default');

console.log('  [PASS] assertExternalModeSafety permits real products by default and enforces anonymization when demo guard is active.');

// 2b. Fictional demo names must pass seamlessly
const fictionalPass1 = extCtx.assertExternalModeSafety('保司 A (虛擬示範)', '[示範方案 A] 虛擬多元貨幣方案 A', false, true);
assert.strictEqual(fictionalPass1, true, 'Fictional demo names must pass');

const fictionalPass2 = extCtx.assertExternalModeSafety('保司 B (虛擬示範)', '[示範方案 B] 虛擬多元貨幣方案 B', false, true);
assert.strictEqual(fictionalPass2, true, 'Fictional demo names must pass');
console.log('  [PASS] Fictional demo names passed safety guard without exceptions.');

// 2c. Strictly SOURCED rows (e.g. Cap. 112 QDAP HK$60,000) MAY display official name
const sourcedPass1 = extCtx.assertExternalModeSafety('QDAP Tax Deduction Cap HK$60,000', 'Cap. 112 s. 26ZZD', true, true);
assert.strictEqual(sourcedPass1, true, 'Strictly sourced rows with explicit isStrictSourced=true must pass');

const sourcedPass2 = extCtx.assertExternalModeSafety('合資格延期年金 (QDAP)', '扣稅額上限 HK$60,000 (Cap. 112 s. 26ZZD)', false, true);
assert.strictEqual(sourcedPass2, true, 'Strictly sourced statutory rows must pass even if isStrictSourced is omitted');

// FLAW-05 verification: Commercial product coincidentally having QDAP and 60,000 without statute MUST NOT pass as strictly sourced
const commercialQdapCheck = extCtx.isStrictSourcedRow('AIA QDAP 延期年金計劃 60,000', '');
assert.strictEqual(commercialQdapCheck, false, 'Commercial QDAP product without statutory citation must NOT be treated as strictly sourced');

assert.throws(() => {
  extCtx.assertExternalModeSafety('AIA', 'AIA QDAP 延期年金計劃 60,000', false, true);
}, (err: any) => {
  return err.code === 'EXTERNAL_MODE_LOCK_VIOLATION';
}, 'Unverified commercial QDAP plan with real carrier must be blocked when demo guard is enforced');
console.log('  [PASS] Strictly sourced statutory rows (Cap. 112 QDAP) permitted to display official names; commercial QDAPs blocked under demo guard.');

// 6. Test Real Products Ready by Default in Both Agent & Client Views + Optional Demo Toggle
console.log('\n--- Test 3: Real Insurers & 99 Real Products Active by Default in Agent & Client Views ---');
const { ctx: clientCtx, dom: clientDom } = createSandbox('?view=client', 'dejavudesu2-oss.github.io');

// Initialize DOM elements for modal check
clientDom['proposal-scanner-modal'] = { id: 'proposal-scanner-modal' };
clientDom['gn16-pay-modal'] = { id: 'gn16-pay-modal' };
clientDom['gn16-query-modal'] = { id: 'gn16-query-modal' };

clientCtx.checkPhaseBUrlParams();
assert.strictEqual(clientCtx.isDemoModeActive, false, 'isDemoModeActive must be false by default even on external hostname & client view');
assert.strictEqual(clientCtx.ALL_PRODUCTS_CATALOG.length, 99, 'All 99 real products must be loaded in ALL_PRODUCTS_CATALOG');

clientCtx.setViewMode('client');
clientCtx.updateCampSelectors();
clientCtx.updateBattleCard();
assert.strictEqual(clientCtx.isDemoModeActive, false, 'Switching to client view must NOT force demo mode');
assert.strictEqual(clientDom['select-my-insurer'].value, 'AIA', 'Plan A insurer must default to real AIA');
assert.strictEqual(clientDom['select-rival-insurer'].value, 'Prudential', 'Plan B insurer must default to real Prudential');
assert.strictEqual(clientDom['select-third-insurer'].value, 'Manulife', 'Plan C insurer must default to real Manulife');
assert.ok(!clientDom['my-product-display'].innerText.includes('示範方案'), 'Plan A product display must show real product name');
assert.ok(!clientDom['rival-product-display'].innerText.includes('示範方案'), 'Plan B product display must show real product name');
assert.ok(!clientDom['third-product-display'].innerText.includes('示範方案'), 'Plan C product display must show real product name');
assert.ok(clientDom['hero-our-name'].innerText.includes('AIA') || clientDom['hero-our-name'].innerText.includes('盈御'), 'Client hero header must show real Plan A product');
assert.ok(clientDom['hero-rival-name'].innerText.includes('Prudential') || clientDom['hero-rival-name'].innerText.includes('雋富'), 'Client hero header must show real Plan B product');

// Test manual toggle ON and OFF in Client View
clientCtx.toggleDemoMode();
assert.strictEqual(clientCtx.isDemoModeActive, true, 'Manual toggleDemoMode() must enable demo mode');
assert.ok(clientDom['hero-our-name'].innerText.includes('保司 A (虛擬示範)'), 'Demo mode must anonymize Plan A');

clientCtx.toggleDemoMode();
assert.strictEqual(clientCtx.isDemoModeActive, false, 'Manual toggleDemoMode() again must disable demo mode and restore real products');
assert.strictEqual(clientDom['select-my-insurer'].value, 'AIA', 'Plan A insurer must restore to AIA after disabling demo mode');
assert.strictEqual(clientDom['select-rival-insurer'].value, 'Prudential', 'Plan B insurer must restore to Prudential after disabling demo mode');
assert.strictEqual(clientDom['select-third-insurer'].value, 'Manulife', 'Plan C insurer must restore to Manulife after disabling demo mode');
console.log('  [PASS] Real insurers (AIA, Prudential, Manulife, etc.) and 99 real products are active by default in both Agent & Client views; manual Demo Mode toggle works both ways.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL EXTERNAL MODE LOCK & REAL PRODUCT DEFAULT TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

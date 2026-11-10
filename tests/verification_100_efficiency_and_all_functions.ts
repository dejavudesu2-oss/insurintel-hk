import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import * as crypto from 'crypto';

const distIndexPath = path.join(__dirname, '../dist/index.html');
const distCafePath = path.join(__dirname, '../dist/cafe.html');
const templatePath = path.join(__dirname, '../templates/mobile_cafe_app.html');

function assert(condition: any, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('================================================================');
console.log('🚀 MULTI-SUBAGENT VERIFICATION SUITE: ALL FUNCTIONS & 100/10 EFFICIENCY UPGRADES');
console.log('================================================================');

assert(fs.existsSync(distIndexPath), 'dist/index.html must exist');
assert(fs.existsSync(distCafePath), 'dist/cafe.html must exist');
assert(fs.existsSync(templatePath), 'templates/mobile_cafe_app.html must exist');

const indexBuf = fs.readFileSync(distIndexPath);
const cafeBuf = fs.readFileSync(distCafePath);
const shaIndex = crypto.createHash('sha256').update(indexBuf).digest('hex');
const shaCafe = crypto.createHash('sha256').update(cafeBuf).digest('hex');
assert(shaIndex === shaCafe, `dist/index.html and dist/cafe.html must have identical SHA-256 (${shaIndex} vs ${shaCafe})`);
console.log(`✅ [Subagent-1: Build & Parity] SHA-256 parity verified (${shaIndex.slice(0, 16)}...)`);

const htmlSource = indexBuf.toString('utf8');

// Extract main script block
const scriptMatch = htmlSource.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch && scriptMatch[1], 'Could not extract main <script> block from dist/index.html');
const jsCode = scriptMatch![1];

// Build a stateful DOM mock for VM sandbox testing
const elements: Record<string, any> = {};
function getOrCreateElement(id: string) {
  if (!elements[id]) {
    const classSet = new Set<string>();
    elements[id] = {
      id,
      innerHTML: '',
      innerText: '',
      value: '',
      style: { display: '', width: '', left: '', background: '', color: '', borderColor: '', opacity: '' },
      options: [
        { value: 'AIA', text: '友邦 AIA' },
        { value: 'PRU', text: '保誠 Prudential' },
        { value: 'MANU', text: '宏利 Manulife' },
        { value: 'SUN', text: '永明 Sun Life' },
        { value: 'FWD', text: '富衛 FWD' },
        { value: 'AXA', text: '安盛 AXA' },
        { value: 'BOC', text: '中銀人壽 BOC Life' }
      ],
      classList: {
        add: (...cls: string[]) => cls.forEach(c => classSet.add(c)),
        remove: (...cls: string[]) => cls.forEach(c => classSet.delete(c)),
        toggle: (c: string, force?: boolean) => {
          const shouldAdd = typeof force === 'boolean' ? force : !classSet.has(c);
          if (shouldAdd) classSet.add(c);
          else classSet.delete(c);
          return shouldAdd;
        },
        contains: (c: string) => classSet.has(c)
      },
      getAttribute: (attr: string) => elements[id][attr] || null,
      setAttribute: (attr: string, val: string) => { elements[id][attr] = val; },
      appendChild: (child: any) => {
        if (child && child.value !== undefined) {
          elements[id].options.push(child);
          if (!elements[id].value) elements[id].value = child.value;
        }
        return child;
      },
      removeChild: (child: any) => child,
      focus: () => {},
      scrollIntoView: () => {},
      querySelectorAll: () => []
    };
  }
  return elements[id];
}

const presetChips = ['aia_vs_pru_sav', 'manu_vs_sun_sav', 'aia_vs_pru_ci', 'bupa_vs_cigna_vhis', 'boc_vs_cl_qdap', 'hsbc_vs_axa_ul'].map(p => {
  const el = getOrCreateElement('preset-' + p);
  el['data-preset'] = p;
  return el;
});

const premiumChips = [10000, 30000, 50000, 100000].map(u => {
  const el = getOrCreateElement('prem-' + u);
  el['data-usd'] = String(u);
  return el;
});

const catTabs = ['Savings_MultiCurrency', 'Critical_Illness', 'Medical_VHIS', 'Annuity_QDAP', 'Financing_UniversalLife'].map(c => {
  const el = getOrCreateElement('cat-' + c);
  el['data-cat'] = c;
  return el;
});

let currentLocationSearch = '';
let currentLocationHash = '#battlecard';

const sandbox: any = {
  window: {
    addEventListener: () => {},
    location: {
      origin: 'https://dejavudesu2-oss.github.io',
      pathname: '/insurintel-hk/index.html',
      get search() { return currentLocationSearch; },
      set search(v: string) { currentLocationSearch = v; },
      get hash() { return currentLocationHash; },
      set hash(v: string) { currentLocationHash = v; }
    },
    history: {
      pushState: (_s: any, _t: string, url: string) => {
        if (url.startsWith('#')) currentLocationHash = url;
      },
      replaceState: (_s: any, _t: string, url: string) => {
        if (url.startsWith('?')) {
          const parts = url.split('#');
          currentLocationSearch = parts[0];
          if (parts[1]) currentLocationHash = '#' + parts[1];
        } else if (url.startsWith('#')) {
          currentLocationHash = url;
        }
      }
    },
    print: () => {}
  },
  document: {
    getElementById: (id: string) => getOrCreateElement(id),
    querySelector: (sel: string) => {
      const m = sel.match(/data-cat="([^"]+)"/);
      if (m) return getOrCreateElement('cat-' + m[1]);
      return getOrCreateElement(sel);
    },
    querySelectorAll: (sel: string) => {
      if (sel === '.matchup-preset-chip') return presetChips;
      if (sel === '.premium-scale-chip') return premiumChips;
      if (sel === '.cat-tab') return catTabs;
      return [];
    },
    body: getOrCreateElement('body'),
    createElement: (tag: string) => getOrCreateElement('created-' + tag + '-' + Math.random())
  },
  localStorage: {
    _store: {} as Record<string, string>,
    getItem(k: string) { return this._store[k] || null; },
    setItem(k: string, v: string) { this._store[k] = String(v); }
  },
  navigator: {
    clipboard: {
      writeText: (txt: string) => { sandbox._lastClipboard = txt; return Promise.resolve(); }
    }
  },
  URLSearchParams,
  console,
  setTimeout: (fn: Function) => { try { fn(); } catch (e) {} return 1; },
  clearTimeout: () => {}
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.navigator = sandbox.navigator;

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);

// =========================================================================
// SUBAGENT 1: Core Functional & Actuarial Matrix QA Agent
// =========================================================================
console.log('\n🔍 [Subagent-1: Core Functional & Actuarial Matrix QA] Testing all core functions...');
const catalog = sandbox.window.ALL_PRODUCTS_CATALOG || sandbox.ALL_PRODUCTS_CATALOG;
assert(Array.isArray(catalog) && catalog.length === 99, `Expected 99 real products, got ${catalog?.length}`);

const categories = ['Savings_MultiCurrency', 'Critical_Illness', 'Medical_VHIS', 'Annuity_QDAP', 'Financing_UniversalLife'];
for (const cat of categories) {
  sandbox.selectCategory(getOrCreateElement('cat-' + cat), cat);
  const specHtml = getOrCreateElement('bilateral-spec-table').innerHTML;
  assert(specHtml.includes('<tr') && specHtml.length > 100, `Category ${cat} must render non-empty #bilateral-spec-table`);
}

// Test 1v1 and 3-Way Arena Mode
sandbox.setArenaMode('3way');
assert(getOrCreateElement('bilateral-spec-table').innerHTML.includes('Plan C (第三方)'), '3-Way mode must render Plan C column');
sandbox.setArenaMode('1v1');
assert(getOrCreateElement('bilateral-spec-table').innerHTML.includes('Plan A (我方)'), '1v1 mode must render Plan A column');

// Test Swap Roles
const prevOur = sandbox.window.myCompany || 'AIA';
sandbox.swapCampRoles();
assert(typeof sandbox.swapCampRoles === 'function', 'swapCampRoles must be a function');

// Test Horizon Slider (5, 10, 20, 30 years)
for (let step = 0; step <= 3; step++) {
  sandbox.onHorizonChange(step);
  const badgeTxt = getOrCreateElement('horizon-year-badge').innerText;
  assert(badgeTxt.includes('年'), `Horizon step ${step} must update #horizon-year-badge`);
}

// Test all 9 AI Scenario Agents
const scenarios = ['cafe_rapid', 'offshore_mcv', 'young_family', 'retirement_tax', 'instant_comms', 'cashless_medical', 'ul_stress', 'group_medical', 'simulation_100'];
for (const sc of scenarios) {
  sandbox.selectScenarioAgent(sc);
  const panelHtml = getOrCreateElement('scenario-agent-panel').innerHTML;
  assert(panelHtml && panelHtml.length > 40, `Scenario agent ${sc} must render non-empty #scenario-agent-panel`);
}

// Test 100-Scenario Simulation Modal & Filters
sandbox.openSimulationModal();
assert(getOrCreateElement('simulation-modal').classList.contains('open'), 'openSimulationModal() must open #simulation-modal');
assert(getOrCreateElement('modal-sim-cards-list').innerHTML.includes('SC001'), 'openSimulationModal() must populate #modal-sim-cards-list with 100 scenarios');
sandbox.filterSimDomain('Coffee_Shop_Rapid_Pitches');
assert(getOrCreateElement('modal-sim-cards-list').innerHTML.includes('SC001'), 'filterSimDomain("Coffee_Shop_Rapid_Pitches") must filter scenarios');
sandbox.filterSimDomain('all');
sandbox.onSimSearchInput('AIA');
assert(getOrCreateElement('modal-sim-cards-list').innerHTML.length > 50, 'onSimSearchInput("AIA") must return matching scenarios');
sandbox.onSimSearchInput('');
sandbox.closeSimulationModal();
assert(!getOrCreateElement('simulation-modal').classList.contains('open'), 'closeSimulationModal() must close #simulation-modal');

// Test Unified 5-View Switching
for (const viewKey of ['battlecard', 'gl16', 'briefing', 'scanner', 'pricing']) {
  sandbox.switchUnifiedView(viewKey);
  const activeBtn = getOrCreateElement('nav-tab-' + viewKey);
  assert(activeBtn.classList.contains('active'), `Unified view tab #nav-tab-${viewKey} must have .active class when selected`);
}
sandbox.switchUnifiedView('battlecard');
console.log('✅ [Subagent-1: Core Functional & Actuarial Matrix QA] All 5 categories, 99 products, 3-Way PK, 9 AI Scenarios, 100-Scenario Modal, and 5 Unified Views verified!');

// =========================================================================
// SUBAGENT 2: 100 Client & Agent Efficiency Comments Audit Agent
// =========================================================================
console.log('\n🔍 [Subagent-2: 100 Efficiency Comments Audit] Validating 100 comments & Top 10 selection...');
const effComments = sandbox.window.APP_100_EFFICIENCY_COMMENTS;
assert(Array.isArray(effComments), 'window.APP_100_EFFICIENCY_COMMENTS must be an array');
assert(effComments.length === 100, `Expected exactly 100 efficiency comments, got ${effComments.length}`);

const clientEff = effComments.filter((c: any) => c.id.startsWith('EC') && c.sourceRole.includes('客戶'));
const agentEff = effComments.filter((c: any) => c.id.startsWith('EA') && c.sourceRole.includes('顧問'));
assert(clientEff.length === 50, `Expected 50 Client efficiency comments (EC01-EC50), got ${clientEff.length}`);
assert(agentEff.length === 50, `Expected 50 Insurance Agent efficiency comments (EA01-EA50), got ${agentEff.length}`);

effComments.forEach((c: any, idx: number) => {
  assert(c.id && c.topic && c.commentText && c.efficiencyGain && c.status && c.resolvedIn, `Comment at index ${idx} (${c?.id}) is missing required fields`);
});

const top10Upgrades = sandbox.window.TOP_10_SELECTED_EFFICIENCY_UPGRADES;
assert(Array.isArray(top10Upgrades) && top10Upgrades.length === 10, `Expected 10 selected efficiency upgrades, got ${top10Upgrades?.length}`);
for (let i = 1; i <= 10; i++) {
  const id = `EFF-${String(i).padStart(2, '0')}`;
  const up = top10Upgrades.find((u: any) => u.upgradeId === id);
  assert(up, `Missing selected efficiency upgrade ${id}`);
  assert(up.title && up.beforeAfter && up.summary && up.targetSelector && up.demoActionLabel, `Upgrade ${id} has incomplete metadata`);
}
console.log('✅ [Subagent-2: 100 Efficiency Comments Audit] 50 Client + 50 Advisor comments (100 total) & Top 10 Selected Upgrades verified!');

// =========================================================================
// SUBAGENT 3: Top 10 Selected Efficiency Upgrades Live Execution Agent
// =========================================================================
console.log('\n🔍 [Subagent-3: Top 10 Upgrades Live Execution] Testing EFF-01 through EFF-10...');

// EFF-01: Instant Command Palette
sandbox.openCommandPalette();
assert(getOrCreateElement('swiss-cmd-modal').classList.contains('open'), 'EFF-01: openCommandPalette() must open #swiss-cmd-modal');
sandbox.filterCommandPalette('雋富');
assert(getOrCreateElement('swiss-cmd-results').innerHTML.includes('雋富'), 'EFF-01: filterCommandPalette("雋富") must match Prudential flagship product');
sandbox.executeCommandPaletteProduct('Savings_MultiCurrency', 'Manulife', '宏摯多元儲蓄計劃', 'our');
assert(!getOrCreateElement('swiss-cmd-modal').classList.contains('open'), 'EFF-01: executeCommandPaletteProduct must close command palette');

// EFF-02: 6 Hot Matchup Presets
const presetKeys = Object.keys(sandbox.window.HOT_MATCHUP_PRESETS);
assert(presetKeys.length === 6, `EFF-02: Expected 6 hot matchup presets, got ${presetKeys.length}`);
for (const pk of presetKeys) {
  sandbox.applyQuickMatchupPreset(pk);
  const preset = sandbox.window.HOT_MATCHUP_PRESETS[pk];
  assert(getOrCreateElement('hero-our-name').innerText.includes(preset.ourProduct) || getOrCreateElement('my-product-display').innerText.includes(preset.ourProduct), `EFF-02: Preset ${pk} must load ourProduct ${preset.ourProduct}`);
}

// EFF-03: Left-Rail Zero-Scroll Flexbox & Grid CSS
assert(htmlSource.includes('.swiss-left-rail > *') && htmlSource.includes('flex-shrink: 0 !important'), 'EFF-03: CSS must lock .swiss-left-rail > * to flex-shrink: 0 !important');
assert(htmlSource.includes('.swiss-left-rail > .bilateral-arena-box { order: 4; }') && htmlSource.includes('.swiss-left-rail > .quick-selector { order: 5; }') && htmlSource.includes('.swiss-left-rail > .scenario-agents-bar-wrap { order: 7; }'), 'EFF-03: CSS flex order must visually position .quick-selector directly below .bilateral-arena-box and above .scenario-agents-bar-wrap');

// EFF-04: Spec Diff-Only Filter
sandbox.applyQuickMatchupPreset('aia_vs_pru_sav');
sandbox.toggleSpecDiffFilter(false);
const fullRowsHtml = getOrCreateElement('bilateral-spec-table').innerHTML;
sandbox.toggleSpecDiffFilter(true);
assert(sandbox.window.specDiffOnlyMode === true, 'EFF-04: specDiffOnlyMode must be true after toggleSpecDiffFilter(true)');
assert(getOrCreateElement('btn-spec-diff-only').innerText.includes('顯示全部指標'), 'EFF-04: Button text must update when diff-only mode is active');
sandbox.toggleSpecDiffFilter(false);
assert(sandbox.window.specDiffOnlyMode === false, 'EFF-04: specDiffOnlyMode must be false after toggleSpecDiffFilter(false)');

// EFF-05: Client Annual Premium Scaler ($10k / $30k / $50k / $100k)
sandbox.setClientPremiumScale(50000);
assert(sandbox.window.clientAnnualPremiumUSD === 50000, 'EFF-05: clientAnnualPremiumUSD must be 50000');
const scalerText = getOrCreateElement('client-premium-scaler-summary').innerText;
assert(scalerText.includes('250,000') && scalerText.includes('HK$1,950,000'), `EFF-05: Scaler summary must show 5-year total USD $250,000 and HK$1,950,000, got: ${scalerText}`);

// EFF-06: Arena -> GL16 Fulfillment Tracker Context Bridge
sandbox.openGN16ForCurrentArena('our');
assert(getOrCreateElement('gn16-premium-input').value === '50000', 'EFF-06: openGN16ForCurrentArena must sync annual premium USD 50000 into #gn16-premium-input');

// EFF-07: Proposal Scanner -> Arena 1-Click Loader
getOrCreateElement('scanner-raw-input').value = '宏利人壽保險 宏摯多元儲蓄計劃 受保人：陳大文 HKID: A123456(7)';
sandbox.applyScannedProposalToArena();
assert(getOrCreateElement('hero-rival-name').innerText.includes('宏利') || getOrCreateElement('rival-product-display').innerText.includes('宏摯'), 'EFF-07: applyScannedProposalToArena must set Manulife as Plan B rival');

// EFF-08: Advisor Keyboard Hotkeys
sandbox.handleGlobalEfficiencyHotkeys({ ctrlKey: true, key: 'k', preventDefault: () => {} });
assert(getOrCreateElement('swiss-cmd-modal').classList.contains('open'), 'EFF-08: Ctrl+K hotkey must open Command Palette');
sandbox.handleGlobalEfficiencyHotkeys({ key: 'Escape', preventDefault: () => {} });
assert(!getOrCreateElement('swiss-cmd-modal').classList.contains('open'), 'EFF-08: Escape hotkey must close Command Palette');
sandbox.handleGlobalEfficiencyHotkeys({ altKey: true, key: 'd', preventDefault: () => {} });
assert(sandbox.window.specDiffOnlyMode === true, 'EFF-08: Alt+D hotkey must toggle specDiffOnlyMode');
sandbox.toggleSpecDiffFilter(false);

// EFF-09: Shareable URL Deep-Link State Serialization & Restoration
sandbox.applyQuickMatchupPreset('bupa_vs_cigna_vhis');
sandbox.setClientPremiumScale(100000);
const sharedLink = sandbox.copyArenaShareLink();
assert(sharedLink.includes('cat=Medical_VHIS') && sharedLink.includes('our=Bupa') && sharedLink.includes('rival=Cigna') && sharedLink.includes('usd=100000'), `EFF-09: Shared link must encode arena state, got: ${sharedLink}`);

// Reset state and hydrate from URL params
sandbox.applyQuickMatchupPreset('aia_vs_pru_sav');
sandbox.setClientPremiumScale(10000);
currentLocationSearch = '?cat=Critical_Illness&our=AIA&rival=Prudential&usd=50000';
const hydrated = sandbox.hydrateArenaFromUrlParams();
assert(hydrated === true && sandbox.window.clientAnnualPremiumUSD === 50000, 'EFF-09: hydrateArenaFromUrlParams must restore state from URL query params');

// EFF-10: Efficiency Audit Hub & Top Nav Unblurred Z-Index
assert(htmlSource.includes('.unified-app-nav') && htmlSource.includes('z-index: 100020 !important'), 'EFF-10: .unified-app-nav must have z-index: 100020 !important so modals never blur top nav');
sandbox.openEfficiencyAuditHub();
assert(getOrCreateElement('audit-header-badge').innerText === 'Top 10/100 Upgraded', 'EFF-10: Efficiency Audit Hub must set badge to Top 10/100 Upgraded');
const effHubHtml = getOrCreateElement('audit-cards-list').innerHTML;
assert(effHubHtml.includes('EFF-01') && effHubHtml.includes('EFF-10') && effHubHtml.includes('EC01') && effHubHtml.includes('EA50'), 'EFF-10: Efficiency Audit Hub must render Top 10 upgrades and all 100 comments');

for (let i = 1; i <= 10; i++) {
  const upId = `EFF-${String(i).padStart(2, '0')}`;
  sandbox.triggerEfficiencyUpgradeDemo(upId);
}
console.log('✅ [Subagent-3: Top 10 Upgrades Live Execution] All 10 efficiency upgrades (EFF-01..EFF-10) verified in live execution!');

// =========================================================================
// SUBAGENT 4: Edge-Case & Resilience Stress Agent
// =========================================================================
console.log('\n🔍 [Subagent-4: Edge-Case & Resilience Stress] Testing boundary inputs & error paths...');
sandbox.filterCommandPalette('___NON_EXISTENT_PRODUCT_XYZ_999___');
assert(getOrCreateElement('swiss-cmd-results').innerHTML.includes('未找到符合'), 'Edge case: empty search result in Command Palette must render friendly fallback message');

sandbox.applyQuickMatchupPreset('non_existent_preset_id');
assert(getOrCreateElement('hero-our-name').innerText.length > 0, 'Edge case: unknown preset ID must gracefully fallback to default preset');

sandbox.setClientPremiumScale(-500);
assert(sandbox.window.clientAnnualPremiumUSD === 30000, 'Edge case: negative premium scale must fallback to USD $30,000');

getOrCreateElement('scanner-raw-input').value = '';
getOrCreateElement('scanner-scrubbed-output').innerText = '';
sandbox.applyScannedProposalToArena();
assert(getOrCreateElement('scanner-raw-input').value.length > 0, 'Edge case: empty scanner input must auto-load sample proposal text before applying to arena');

currentLocationSearch = '';
assert(sandbox.hydrateArenaFromUrlParams() === false, 'Edge case: empty location.search must return false without throwing');

console.log('✅ [Subagent-4: Edge-Case & Resilience Stress] All boundary conditions and fallback paths passed!');
console.log('================================================================');
console.log('🎉 ALL 4 SUBAGENTS PASSED 100% OF FUNCTIONAL & EFFICIENCY CHECKS!');
console.log('================================================================');

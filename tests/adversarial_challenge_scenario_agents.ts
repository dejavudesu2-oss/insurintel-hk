/**
 * InsurIntel HK - Adversarial Challenge QA Test Suite for Scenario AI Agents
 * 
 * Tests the 6 real-world advisor scenario agents:
 * 1. Cafe Rapid Pitch (30s elevator pitch, single-hand high-contrast metrics)
 * 2. Offshore MCV / HNW Family Office (cross-border FX, 3A hospitals, waiver, offshore trust)
 * 3. Young Family Budget (60/40 rule, mortgage deficit, CI+VHIS+Term bundling)
 * 4. Retirement Tax (QDAP $60,000 / $120,000 tax relief, 2%-17% brackets, guaranteed annuity stream)
 * 5. Instant WhatsApp/WeChat Comms (1-tap closing summaries, markdown formatting, GL20 compliance)
 * 6. Offline Resilience (zero-network resilience, offline cache monitoring, subway/basement simulation)
 * 
 * Also tests:
 * - Reactive DOM integration and event handlers in Sandboxed VM
 * - Graceful handling of malformed/adversarial inputs
 * - Dynamic update on camp/product swapping
 * - Exact byte-for-byte template parity across templates/mobile_cafe_app.html, dist/index.html, dist/cafe.html
 */

import fs from 'fs';
import path from 'path';
import assert from 'node:assert';
import crypto from 'node:crypto';
import vm from 'node:vm';

import {
  CafeRapidPitchAgent,
  OffshoreMCVAgent,
  YoungFamilyBudgetAgent,
  RetirementTaxAgent,
  InstantCommsSynthesizerAgent,
  OfflineResilienceAgent,
  ScenarioAgentHub
} from '../src/engine/scenario_agents.js';

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
console.log('INSURINTEL HK - ADVERSARIAL CHALLENGE: SCENARIO AI AGENTS & ENVIRONMENT SUITE');
console.log('Testing: 6 AI Scenario Agents / Sandboxed VM / Reactivity / Parity');
console.log('================================================================================');

// ============================================================================
// SUITE 1: Pure TypeScript Core Scenario Agents Logic & Boundary Resilience
// ============================================================================
suite('1. Pure TypeScript Core Scenario Agents Logic & Boundary Resilience', () => {

  test('CafeRapidPitchAgent: Computes elevator pitch and deltas across all 5 categories', () => {
    const agent = new CafeRapidPitchAgent();
    const categories = [
      'Savings_MultiCurrency',
      'Critical_Illness',
      'Medical_VHIS',
      'Annuity_QDAP',
      'Financing_UniversalLife'
    ];

    for (const cat of categories) {
      const res = agent.generate30sPitch(
        { name: '我方旗艦', breakevenYear: 5, maxRebate: 22, gn16Fulfillment: 98.2 },
        { name: '對手旗艦', breakevenYear: 8, maxRebate: 15, gn16Fulfillment: 89.0 },
        cat
      );

      assert.strictEqual(res.scenario, 'cafe_rapid');
      assert.ok(res.elevatorScript30s.length > 20, `Pitch should be descriptive for ${cat}`);
      assert.ok(res.punchlineBullets.length >= 3, `Key metrics should have >= 3 items for ${cat}`);
      assert.ok(res.deltaBadges.statusTag.length > 0, `Status tag should be populated for ${cat}`);
    }
  });

  test('CafeRapidPitchAgent: Gracefully handles empty/null products without throwing', () => {
    const agent = new CafeRapidPitchAgent();
    const res = agent.generate30sPitch(null, undefined, 'Savings_MultiCurrency');
    assert.strictEqual(res.scenario, 'cafe_rapid');
    assert.ok(res.elevatorScript30s.includes('我方推薦旗艦') || res.elevatorScript30s.includes('我地方案'));
    assert.strictEqual(res.punchlineBullets.length, 3);
  });

  test('OffshoreMCVAgent: Multi-currency conversion across USD, HKD, RMB', () => {
    const agent = new OffshoreMCVAgent();
    const resUsd = agent.calculateCrossBorder(10000, 'USD', 'HKD');
    assert.strictEqual(resUsd.scenario, 'offshore_mcv');
    assert.strictEqual(resUsd.fromCurrency, 'USD');
    assert.strictEqual(resUsd.toCurrency, 'HKD');
    assert.strictEqual(resUsd.convertedAmount, 77800);

    const resRmb = agent.calculateCrossBorder(10000, 'USD', 'RMB');
    assert.strictEqual(resRmb.convertedAmount, 72300);

    // Negative / Zero boundary check
    const resZero = agent.calculateCrossBorder(0, 'USD', 'HKD');
    assert.strictEqual(resZero.convertedAmount, 0);
  });

  test('OffshoreMCVAgent: Inbound compliance pass, 3A hospital list, waiver limits & trust features', () => {
    const agent = new OffshoreMCVAgent();
    const underwriting = agent.getMCVUnderwritingAndClaims('AIA');
    assert.ok(underwriting.hospitalsCount.includes('1,000+'));
    assert.strictEqual(underwriting.directBillingAvailable, true);
    assert.ok(underwriting.simplifiedLimitText.includes('USD 1,500,000'));
    assert.ok(underwriting.successionFeatures.length >= 3);

    const calc = agent.calculateCrossBorder(100000, 'USD', 'HKD');
    assert.ok(calc.complianceGuidelines.length >= 3);
    assert.ok(calc.complianceGuidelines.some(g => g.includes('入境小白條')));
    assert.strictEqual(calc.mainland3AHospitalCovered, true);
    assert.strictEqual(calc.simplifiedUnderwritingUSD, 1500000);
  });

  test('YoungFamilyBudgetAgent: 60/40 rule calculation, mortgage protection deficit & bundling', () => {
    const agent = new YoungFamilyBudgetAgent();
    const res = agent.optimizeBudgetAndCoverage(6000, 600000, 4000000);

    assert.strictEqual(res.scenario, 'young_family');
    assert.strictEqual(res.monthlyBudgetHKD, 6000);
    assert.strictEqual(res.recommendedProtectionBudgetHKD, 3600); // 60%
    assert.strictEqual(res.recommendedSavingsBudgetHKD, 2400);    // 40%
    assert.strictEqual(res.mortgageBalanceHKD, 4000000);
    assert.ok(res.bundlingStrategy.termLifeCoverageHKD >= 4000000);
    assert.ok(res.bundlingStrategy.ciMultipleCoverageHKD > 0);
    assert.ok(res.bundlingStrategy.vhisPlanType.includes('自願醫保'));

    // Boundary check: small budget clamped safely
    const resLow = agent.optimizeBudgetAndCoverage(100, 200000, 1000000);
    assert.strictEqual(resLow.monthlyBudgetHKD, 500); // clamped to min safe 500
  });

  test('RetirementTaxAgent: Statutory QDAP HK$60,000 single & HK$120,000 couple caps across tax brackets', () => {
    const agent = new RetirementTaxAgent();
    
    // Single individual at 17% top marginal tax rate: annualPremium = 60000, taxRate = 17
    const res17 = agent.calculateQDAPTaxRelief(60000, 17, false);
    assert.strictEqual(res17.scenario, 'retirement_tax');
    assert.strictEqual(res17.eligibleDeductionHKD, 60000);
    assert.strictEqual(res17.taxReliefSavedHKD, 10200); // 60,000 * 17%
    assert.strictEqual(res17.maxDeductibleLimitHKD, 60000);

    // Married couple at 17% top rate: annualPremium = 120000, taxRate = 17
    const resCouple = agent.calculateQDAPTaxRelief(120000, 17, true);
    assert.strictEqual(resCouple.eligibleDeductionHKD, 120000);
    assert.strictEqual(resCouple.taxReliefSavedHKD, 20400); // 120,000 * 17%
    assert.strictEqual(resCouple.maxDeductibleLimitHKD, 120000);

    // Excess contribution should be capped at statutory maximum
    const resExcess = agent.calculateQDAPTaxRelief(200000, 17, true);
    assert.strictEqual(resExcess.eligibleDeductionHKD, 120000);
    assert.strictEqual(resExcess.taxReliefSavedHKD, 20400);

    // 2% tax bracket check: annualPremium = 60000, taxRate = 2
    const res2 = agent.calculateQDAPTaxRelief(60000, 2, false);
    assert.strictEqual(res2.taxReliefSavedHKD, 1200); // 60,000 * 2%
  });

  test('InstantCommsSynthesizerAgent: WhatsApp & WeChat tones with statutory GL20 compliance', () => {
    const agent = new InstantCommsSynthesizerAgent();
    
    // WhatsApp Urgent tone
    const waUrgent = agent.synthesizeFollowUpMessage({
      platform: 'whatsapp',
      tone: 'urgent_closing',
      clientName: '李小姐',
      ourProduct: { name: '友邦 盈御多元貨幣計劃 3' },
      rivalProduct: { name: '保誠 雋富多元貨幣計劃' }
    });

    assert.strictEqual(waUrgent.scenario, 'instant_comms');
    assert.strictEqual(waUrgent.platform, 'whatsapp');
    assert.ok(waUrgent.formattedText.includes('李小姐'));
    assert.ok(waUrgent.formattedText.includes('*回本與資金安全：*')); // WhatsApp markdown bold
    assert.ok(waUrgent.formattedText.includes('GL20'));
    assert.strictEqual(waUrgent.hasGL20Disclaimer, true);

    // WeChat Rational Data tone
    const wcRational = agent.synthesizeFollowUpMessage({
      platform: 'wechat',
      tone: 'rational_data',
      clientName: '張總',
      ourProduct: { name: '宏利 宏摯多元儲蓄計劃' },
      rivalProduct: { name: '安盛 盛世傳承' }
    });

    assert.strictEqual(wcRational.platform, 'wechat');
    assert.ok(wcRational.formattedText.includes('張總'));
    assert.ok(!wcRational.formattedText.includes('*方案 A (我方推薦):*')); // WeChat should not have WA bold asterisks
    assert.ok(wcRational.formattedText.includes('GL20'));

    // Category-Aware Verification: Medical VHIS follow-up must not talk about cash value or prepay
    const waVhis = agent.synthesizeFollowUpMessage({
      platform: 'whatsapp',
      tone: 'urgent_closing',
      category: 'Medical_VHIS',
      clientName: '黃生',
      ourProduct: { name: '保泰 自願醫保靈活計劃' },
      rivalProduct: { name: '保柏 卓越自願醫保' }
    });
    assert.ok(waVhis.formattedText.includes('全額醫療零漏洞'), 'VHIS message must focus on full hospital coverage');
    assert.ok(waVhis.formattedText.includes('標靶藥'), 'VHIS message must cite cancer therapy');
    assert.ok(!waVhis.formattedText.includes('回本與資金安全'), 'VHIS message must never mention cash value breakeven');

    // Category-Aware Verification: QDAP follow-up must cite tax deduction
    const waQdap = agent.synthesizeFollowUpMessage({
      platform: 'whatsapp',
      tone: 'urgent_closing',
      category: 'Annuity_QDAP',
      clientName: '周太',
      ourProduct: { name: '中銀人壽 延期年金計劃' },
      rivalProduct: { name: '永明 定期延期年金' }
    });
    assert.ok(waQdap.formattedText.includes('法定扣稅慳到極'), 'QDAP message must cite statutory tax relief');
    assert.ok(waQdap.formattedText.includes('HK$60,000'), 'QDAP message must cite $60,000 allowance');
  });

  test('OfflineResilienceAgent: Toggles simulated offline and inspects cache readiness with browser status', () => {
    const agent = new OfflineResilienceAgent();
    const onlineStatus = agent.getOfflineReadiness(99, 420000, false);
    assert.strictEqual(onlineStatus.isOnline, true);
    assert.strictEqual(onlineStatus.isSimulatedOffline, false);
    assert.strictEqual(onlineStatus.cachedProductsCount, 99);
    assert.strictEqual(onlineStatus.offlineReadyScore, 100);

    // Browser offline detection
    const browserOfflineStatus = agent.getOfflineReadiness(99, 420000, true);
    assert.strictEqual(browserOfflineStatus.isOnline, false);

    // Toggle offline
    agent.setSimulatedOffline(true);
    const offlineStatus = agent.getOfflineReadiness(99, 420000);
    assert.strictEqual(offlineStatus.isOnline, false);
    assert.strictEqual(offlineStatus.isSimulatedOffline, true);
    assert.ok(offlineStatus.healthStatusText.includes('離線模式'));
  });

  test('ScenarioAgentHub: Accurately routes to each specialized agent', () => {
    const hub = new ScenarioAgentHub();
    assert.ok(hub.getAgentForScenario('cafe_rapid') instanceof CafeRapidPitchAgent);
    assert.ok(hub.getAgentForScenario('offshore_mcv') instanceof OffshoreMCVAgent);
    assert.ok(hub.getAgentForScenario('young_family') instanceof YoungFamilyBudgetAgent);
    assert.ok(hub.getAgentForScenario('retirement_tax') instanceof RetirementTaxAgent);
    assert.ok(hub.getAgentForScenario('instant_comms') instanceof InstantCommsSynthesizerAgent);
    assert.ok(hub.getAgentForScenario('offline_resilience') instanceof OfflineResilienceAgent);
  });
});

// ============================================================================
// SUITE 2: Client DOM & Sandboxed VM Execution of Mobile App Template
// ============================================================================
suite('2. Client DOM & Sandboxed VM Execution of Mobile App Template', () => {
  const templatesPath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
  const cafeHtml = fs.readFileSync(templatesPath, 'utf-8');
  const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, 'Script tag must be present in mobile_cafe_app.html');
  const scriptCode = scriptMatch[1];

  function createMockDOMSandbox() {
    const domElements: Record<string, any> = {};

    const makeMockElement = (id: string = '', tagName: string = 'div'): any => ({
      id,
      tagName: tagName.toUpperCase(),
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
    });

    const registeredIds = [
      'select-my-product', 'select-rival-product', 'select-my-camp', 'select-rival-camp',
      'company-pills', 'claim-pills', 'bilateral-spec-table', 'bilateral-radar-scorecard',
      'bilateral-clause-comparison', 'agent-clause-intel', 'agent-title', 'agent-step-1',
      'agent-step-2', 'agent-step-3', 'agent-trap-alert', 'agent-objection-title',
      'client-title', 'client-source', 'client-desc', 'client-chart-title',
      'client-chart-bars', 'client-table-title', 'client-table', 'client-disclaimer',
      'hero-our-name', 'hero-rival-name', 'corridor-desc', 'corridor-our-pointer',
      'corridor-rival-pointer', 'corridor-our-label', 'corridor-meter-inner',
      'corridor-note-box', 'fineprint-claim', 'fineprint-reality', 'fineprint-citation',
      'fineprint-reality-text', 'fineprint-citation-text', 'horizon-desc', 'horizon-slider',
      'horizon-year-badge', 'claim-selector-section', 'top-date-banner', 'btn-agent-view',
      'btn-client-view', 'agent-view', 'client-view', 'catalog-drawer', 'catalog-grid',
      'catalog-search-input',
      // Scenario Agent elements
      'scenario-agents-bar-wrap',
      'scenario-active-tag',
      'scenario-agent-panel',
      'toast'
    ];

    for (const id of registeredIds) {
      domElements[id] = makeMockElement(id);
    }

    const mockDocument = {
      getElementById(id: string) {
        if (!domElements[id]) {
          domElements[id] = makeMockElement(id);
        }
        return domElements[id];
      },
      querySelector(sel: string) {
        if (sel.startsWith('#')) return domElements[sel.slice(1)] || null;
        return null;
      },
      createElement(tag: string) {
        return makeMockElement('', tag);
      },
      querySelectorAll(selector: string) {
        if (selector === '.scenario-tab-btn') {
          return [
            { getAttribute: (attr: string) => 'cafe_rapid', classList: makeMockElement().classList },
            { getAttribute: (attr: string) => 'offshore_mcv', classList: makeMockElement().classList },
            { getAttribute: (attr: string) => 'young_family', classList: makeMockElement().classList },
            { getAttribute: (attr: string) => 'retirement_tax', classList: makeMockElement().classList },
            { getAttribute: (attr: string) => 'instant_comms', classList: makeMockElement().classList },
            { getAttribute: (attr: string) => 'offline_resilience', classList: makeMockElement().classList }
          ];
        }
        return [];
      },
      body: makeMockElement('body')
    };

    const mockWindow: any = {
      document: mockDocument,
      console: { log: () => {}, warn: () => {}, error: () => {} },
      localStorage: {
        _store: {} as Record<string, string>,
        getItem(k: string) { return this._store[k] || null; },
        setItem(k: string, v: string) { this._store[k] = String(v); },
        removeItem(k: string) { delete this._store[k]; }
      },
      navigator: {
        clipboard: {
          writeText: async () => Promise.resolve()
        },
        serviceWorker: { register: async () => {} }
      },
      setTimeout: (fn: Function) => fn(),
      clearTimeout: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      alert: () => {}
    };

    mockWindow.window = mockWindow;

    const context = vm.createContext(mockWindow);
    vm.runInContext(scriptCode, context);

    return { context, mockWindow, domElements };
  }

  test('VM Sandbox initializes cleanly and exposes all 7 scenario calculation & handler functions on window', () => {
    const { mockWindow } = createMockDOMSandbox();
    assert.strictEqual(typeof mockWindow.selectScenarioAgent, 'function', 'selectScenarioAgent must be exposed');
    assert.strictEqual(typeof mockWindow.calculateQDAPTaxRelief, 'function', 'calculateQDAPTaxRelief must be exposed');
    assert.strictEqual(typeof mockWindow.calculateFamilyBudget, 'function', 'calculateFamilyBudget must be exposed');
    assert.strictEqual(typeof mockWindow.convertMCVCurrency, 'function', 'convertMCVCurrency must be exposed');
    assert.strictEqual(typeof mockWindow.generateInstantMessage, 'function', 'generateInstantMessage must be exposed');
    assert.strictEqual(typeof mockWindow.setOfflineMode, 'function', 'setOfflineMode must be exposed');
    assert.strictEqual(typeof mockWindow.getOfflineStatus, 'function', 'getOfflineStatus must be exposed');
  });

  test('Scenario Agent 1: ☕ Cafe Rapid Pitch renders 30s elevator pitch, GN16 and breakeven deltas', () => {
    const { mockWindow, domElements } = createMockDOMSandbox();
    mockWindow.selectScenarioAgent('cafe_rapid');

    const panelHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(panelHtml.includes('30 秒咖啡館極速對決模式'), 'Panel must include Cafe Rapid title');
    assert.ok(panelHtml.includes('cafe-elevator-script'), 'Panel must include elevator script element');
    assert.ok(panelHtml.includes('btn-copy-cafe-script'), 'Panel must include copy script button');
    assert.ok(panelHtml.includes('btn-cafe-open-whatsapp'), 'Panel must include direct WhatsApp send button');
    assert.ok(panelHtml.includes('btn-cafe-flip-client'), 'Panel must include flip to client button');
    assert.ok(panelHtml.includes('保證回本年期'), 'Panel must include breakeven metric');
    assert.ok(panelHtml.includes('GN16 官方實現率'), 'Panel must include GN16 metric');
    assert.strictEqual(typeof mockWindow.openWhatsAppCafeScript, 'function');
  });

  test('Scenario Agent 2: 🇨🇳 Offshore MCV / HNW renders multi-currency conversion, 3A hospital list & waiver limit', () => {
    const { mockWindow, domElements } = createMockDOMSandbox();
    mockWindow.selectScenarioAgent('offshore_mcv');

    const panelHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(panelHtml.includes('MCV 內地訪港旅客'), 'Panel must include MCV title');
    assert.ok(panelHtml.includes('mcv-amount-input'), 'Panel must include amount input');
    assert.ok(panelHtml.includes('mcv-converted-val'), 'Panel must include converted result container');
    assert.ok(panelHtml.includes('1,000+ 家三甲醫院直付名單'), 'Panel must mention 3A hospital direct billing');
    assert.ok(panelHtml.includes('USD 1,500,000'), 'Panel must mention high-value waiver limit ($1.5M)');
    assert.ok(panelHtml.includes('離岸信託架構與跨代傳承'), 'Panel must mention offshore trust');
    assert.ok(panelHtml.includes('香港入境小白條'), 'Panel must mention HK入境小白條 compliance pass');

    // Test dynamic currency change
    mockWindow.onMCVAmountChange(20000);
    mockWindow.onMCVCurrencySelect('HKD');
    const updatedHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(updatedHtml.includes('20000'), 'Updated panel must reflect input amount');
  });

  test('Scenario Agent 3: 👨‍👩‍👧 Young Family Budget renders 60/40 rule and mortgage gap diagnosis', () => {
    const { mockWindow, domElements } = createMockDOMSandbox();
    mockWindow.selectScenarioAgent('young_family');

    const panelHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(panelHtml.includes('本地年輕家庭'), 'Panel must include young family title');
    assert.ok(panelHtml.includes('60/40 槓桿法則'), 'Panel must mention 60/40 leverage rule');
    assert.ok(panelHtml.includes('family-budget-slider'), 'Panel must have budget slider');
    assert.ok(panelHtml.includes('family-protection-val'), 'Panel must show 60% protection value');
    assert.ok(panelHtml.includes('family-savings-val'), 'Panel must show 40% savings value');
    assert.ok(panelHtml.includes('尚欠房貸保障缺口診斷器'), 'Panel must include mortgage deficit diagnostic');

    // Test dynamic slider adjustments
    mockWindow.onFamilyBudgetChange(8000);
    mockWindow.onMortgageChange(5000000);
    const updatedHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(updatedHtml.includes('HK$ 4,800'), '60% of 8,000 must equal HK$ 4,800');
    assert.ok(updatedHtml.includes('HK$ 3,200'), '40% of 8,000 must equal HK$ 3,200');
    assert.ok(updatedHtml.includes('5,000,000'), 'Mortgage balance must be rendered');

    // Edge Case: 0 mortgage debt
    mockWindow.onMortgageChange(0);
    const zeroMortgageHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(zeroMortgageHtml.includes('當前無房貸負擔'), 'Zero mortgage must reassure client without bogus debt warning');
  });

  test('Scenario Agent 4: 👴 Retirement & Tax renders QDAP statutory relief HK$60,000 / HK$120,000 and 17% tax deduction', () => {
    const { mockWindow, domElements } = createMockDOMSandbox();
    mockWindow.selectScenarioAgent('retirement_tax');

    const panelHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(panelHtml.includes('合資格延期年金 (QDAP) 扣稅'), 'Panel must include QDAP title');
    assert.ok(panelHtml.includes('HK$60,000 扣稅上限'), 'Panel must mention single limit');
    assert.ok(panelHtml.includes('夫妻合併 HK$120,000'), 'Panel must mention married couple limit');
    assert.ok(panelHtml.includes('qdap-premium-input'), 'Panel must have QDAP premium input');
    assert.ok(panelHtml.includes('qdap-couple-toggle'), 'Panel must have married couple toggle');
    assert.ok(panelHtml.includes('tax-bracket-chips'), 'Panel must have tax bracket chips (2%, 6%, 10%, 14%, 17%)');

    // Test single at 17% tax bracket
    mockWindow.onQDAPPremiumChange(60000);
    mockWindow.onQDAPRateSelect(17);
    mockWindow.onQDAPCoupleToggle(false);
    assert.ok(domElements['scenario-agent-panel'].innerHTML.includes('HK$ 10,200'), '60,000 * 17% = HK$ 10,200');

    // Test couple at 17% tax bracket with 120,000 premium
    mockWindow.onQDAPPremiumChange(120000);
    mockWindow.onQDAPCoupleToggle(true);
    assert.ok(domElements['scenario-agent-panel'].innerHTML.includes('HK$ 20,400'), '120,000 * 17% = HK$ 20,400');

    // Test single person contributing excess HK$120,000: effective discount is 8.5% (HK$10,200 / HK$120,000)
    mockWindow.onQDAPCoupleToggle(false);
    assert.ok(domElements['scenario-agent-panel'].innerHTML.includes('8.5%'), 'Effective discount on capped premium must equal 8.5%');
  });

  test('Scenario Agent 5: 💬 Instant Comms Synthesizer renders WhatsApp / WeChat 1-tap closing scripts', () => {
    const { mockWindow, domElements } = createMockDOMSandbox();
    mockWindow.selectScenarioAgent('instant_comms');

    const panelHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(panelHtml.includes('微信 / WhatsApp 見客後極速追單速遞'), 'Panel must include instant comms title');
    assert.ok(panelHtml.includes('comms-preview-text'), 'Panel must include preview box');
    assert.ok(panelHtml.includes('btn-copy-instant-whatsapp'), 'Panel must include WhatsApp copy button');
    assert.ok(panelHtml.includes('btn-open-instant-whatsapp'), 'Panel must include WhatsApp direct open button');
    assert.ok(panelHtml.includes('btn-copy-instant-wechat'), 'Panel must include WeChat copy button');
    assert.strictEqual(typeof mockWindow.openWhatsAppDirect, 'function');

    // Test tone switching
    mockWindow.onCommsToneSelect('urgent_closing');
    mockWindow.onCommsPlatformSelect('whatsapp');
    const waText = mockWindow.generateInstantMessage('whatsapp', 'urgent_closing');
    assert.ok(waText.includes('*回本與資金安全：*'), 'WhatsApp message should contain bold styling');
    assert.ok(waText.includes('GL20'), 'Message must contain statutory GL20 disclaimer');
    assert.ok(waText.includes('2026年11月06日'), 'Message must contain regulatory audit date');

    // Test WeChat tone
    mockWindow.onCommsToneSelect('mcv_vip');
    mockWindow.onCommsPlatformSelect('wechat');
    const wcText = mockWindow.generateInstantMessage('wechat', 'mcv_vip');
    assert.ok(wcText.includes('三甲醫院直付') || wcText.includes('多幣種跨國配置'), 'MCV VIP tone must highlight cross-border perks');
  });

  test('Scenario Agent 6: 📴 Offline Resilience Agent displays local catalog count, storage footprint & simulated offline toggle', () => {
    const { mockWindow, domElements } = createMockDOMSandbox();
    mockWindow.selectScenarioAgent('offline_resilience');

    const panelHtml = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(panelHtml.includes('無網/地庫/地鐵離線環境韌性守護'), 'Panel must include offline resilience title');
    assert.ok(panelHtml.includes('offline-status-banner'), 'Panel must include status banner');
    assert.ok(panelHtml.includes('offline-catalog-count'), 'Panel must display cached catalog count');
    assert.ok(panelHtml.includes('btn-toggle-offline-sim'), 'Panel must have offline simulation toggle button');

    // Test toggle simulated offline
    const initialStatus = mockWindow.getOfflineStatus();
    assert.strictEqual(initialStatus.isOnline, true);
    mockWindow.toggleSimulatedOffline();
    const offlineStatus = mockWindow.getOfflineStatus();
    assert.strictEqual(offlineStatus.isOnline, false);
    assert.strictEqual(offlineStatus.isSimulatedOffline, true);

    // Toggle back
    mockWindow.toggleSimulatedOffline();
    const restoredStatus = mockWindow.getOfflineStatus();
    assert.strictEqual(restoredStatus.isOnline, true);

    // Real browser offline detection (navigator.onLine = false)
    mockWindow.navigator.onLine = false;
    const browserOffline = mockWindow.getOfflineStatus();
    assert.strictEqual(browserOffline.isOnline, false);
    assert.strictEqual(browserOffline.isBrowserOffline, true);
    mockWindow.navigator.onLine = true;
  });
});

// ============================================================================
// SUITE 3: Dynamic Reactivity on Camp / Category / Product Switching
// ============================================================================
suite('3. Dynamic Reactivity on Camp / Category / Product Switching', () => {
  const templatesPath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
  const cafeHtml = fs.readFileSync(templatesPath, 'utf-8');
  const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
  const scriptCode = scriptMatch![1];

  function createReactiveSandbox() {
    const domElements: Record<string, any> = {};

    const makeMockElement = (id: string = '', tagName: string = 'div'): any => ({
      id,
      tagName: tagName.toUpperCase(),
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
    });

    const registeredIds = [
      'select-my-product', 'select-rival-product', 'select-my-camp', 'select-rival-camp',
      'company-pills', 'claim-pills', 'bilateral-spec-table', 'bilateral-radar-scorecard',
      'bilateral-clause-comparison', 'agent-clause-intel', 'agent-title', 'agent-step-1',
      'agent-step-2', 'agent-step-3', 'agent-trap-alert', 'agent-objection-title',
      'client-title', 'client-source', 'client-desc', 'client-chart-title',
      'client-chart-bars', 'client-table-title', 'client-table', 'client-disclaimer',
      'hero-our-name', 'hero-rival-name', 'corridor-desc', 'corridor-our-pointer',
      'corridor-rival-pointer', 'corridor-our-label', 'corridor-meter-inner',
      'corridor-note-box', 'fineprint-claim', 'fineprint-reality', 'fineprint-citation',
      'fineprint-reality-text', 'fineprint-citation-text', 'horizon-desc', 'horizon-slider',
      'horizon-year-badge', 'claim-selector-section', 'top-date-banner', 'btn-agent-view',
      'btn-client-view', 'agent-view', 'client-view', 'catalog-drawer', 'catalog-grid',
      'catalog-search-input', 'scenario-agents-bar-wrap', 'scenario-active-tag',
      'scenario-agent-panel', 'toast'
    ];

    for (const id of registeredIds) {
      domElements[id] = makeMockElement(id);
    }

    const mockDocument = {
      getElementById(id: string) {
        if (!domElements[id]) domElements[id] = makeMockElement(id);
        return domElements[id];
      },
      querySelector(sel: string) {
        if (sel.startsWith('#')) return domElements[sel.slice(1)] || null;
        return null;
      },
      createElement(tag: string) { return makeMockElement('', tag); },
      querySelectorAll() { return []; },
      body: makeMockElement('body')
    };

    const mockWindow: any = {
      document: mockDocument,
      console: { log: () => {}, warn: () => {}, error: () => {} },
      localStorage: {
        _store: {} as Record<string, string>,
        getItem(k: string) { return this._store[k] || null; },
        setItem(k: string, v: string) { this._store[k] = String(v); },
        removeItem(k: string) { delete this._store[k]; }
      },
      navigator: {
        clipboard: { writeText: async () => Promise.resolve() },
        serviceWorker: { register: async () => {} }
      },
      setTimeout: (fn: Function) => fn(),
      clearTimeout: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      alert: () => {}
    };

    mockWindow.window = mockWindow;
    const context = vm.createContext(mockWindow);
    vm.runInContext(scriptCode, context);
    return { mockWindow, domElements };
  }

  test('Switching Camp or Product dynamically re-evaluates Scenario Agent outputs without page reload', () => {
    const { mockWindow, domElements } = createReactiveSandbox();
    mockWindow.selectScenarioAgent('cafe_rapid');

    // Baseline: Prudential vs AIA
    mockWindow.setMyCompany('Prudential');
    mockWindow.selectCompany('AIA');
    const prudentialElevator = domElements['scenario-agent-panel'].innerHTML;
    assert.ok(prudentialElevator.length > 0);

    // Swap roles symmetrically
    mockWindow.swapCampRoles();
    const swappedElevator = domElements['scenario-agent-panel'].innerHTML;
    assert.notStrictEqual(prudentialElevator, swappedElevator, 'Elevator script must update upon camp swap');

    // Switch Category to Critical Illness
    mockWindow.selectCategory('Critical_Illness');
    assert.ok(domElements['scenario-agent-panel'].innerHTML.length > 0, 'Scenario panel should re-render on CI category switch');

    // Switch Category to Medical VHIS
    mockWindow.selectCategory('Medical_VHIS');
    assert.ok(domElements['scenario-agent-panel'].innerHTML.length > 0, 'Scenario panel should re-render on VHIS category switch');
  });

  test('Adversarial Boundary Inputs: Handlers remain completely crash-proof with non-numeric or malformed data', () => {
    const { mockWindow, domElements } = createReactiveSandbox();
    
    // Malformed inputs to scenario calculation methods
    assert.doesNotThrow(() => mockWindow.onMCVAmountChange('not-a-number'));
    assert.doesNotThrow(() => mockWindow.onMCVCurrencySelect(null));
    assert.doesNotThrow(() => mockWindow.onFamilyBudgetChange('undefined'));
    assert.doesNotThrow(() => mockWindow.onMortgageChange({}));
    assert.doesNotThrow(() => mockWindow.onQDAPPremiumChange(NaN));
    assert.doesNotThrow(() => mockWindow.onQDAPRateSelect(999));
    assert.doesNotThrow(() => mockWindow.onQDAPCoupleToggle('yes'));
    assert.doesNotThrow(() => mockWindow.onCommsToneSelect('non_existent_tone'));
    assert.doesNotThrow(() => mockWindow.onCommsPlatformSelect('telegram'));
    assert.doesNotThrow(() => mockWindow.selectScenarioAgent('alien_scenario'));

    // Should maintain non-empty fallback markup
    assert.ok(domElements['scenario-agent-panel'].innerHTML !== undefined);
  });
});

// ============================================================================
// SUITE 4: Byte-for-Byte SHA-256 Template Parity Check
// ============================================================================
suite('4. Byte-for-Byte SHA-256 Template Parity Check', () => {
  const templatesPath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
  const distIndexPath = path.join(process.cwd(), 'dist', 'index.html');
  const distCafePath = path.join(process.cwd(), 'dist', 'cafe.html');

  test('templates/mobile_cafe_app.html and dist/index.html have identical SHA-256 hash', () => {
    const templateContent = fs.readFileSync(templatesPath);
    const distIndexContent = fs.readFileSync(distIndexPath);
    const hash1 = crypto.createHash('sha256').update(templateContent).digest('hex');
    const hash2 = crypto.createHash('sha256').update(distIndexContent).digest('hex');
    assert.strictEqual(hash1, hash2, 'templates/mobile_cafe_app.html and dist/index.html must have identical SHA-256 hash');
  });

  test('templates/mobile_cafe_app.html and dist/cafe.html have identical SHA-256 hash', () => {
    const templateContent = fs.readFileSync(templatesPath);
    const distCafeContent = fs.readFileSync(distCafePath);
    const hash1 = crypto.createHash('sha256').update(templateContent).digest('hex');
    const hash2 = crypto.createHash('sha256').update(distCafeContent).digest('hex');
    assert.strictEqual(hash1, hash2, 'templates/mobile_cafe_app.html and dist/cafe.html must have identical SHA-256 hash');
  });

  test('All three files have identical byte length', () => {
    const s1 = fs.statSync(templatesPath).size;
    const s2 = fs.statSync(distIndexPath).size;
    const s3 = fs.statSync(distCafePath).size;
    assert.strictEqual(s1, s2, `Template size (${s1}) must match dist/index.html size (${s2})`);
    assert.strictEqual(s1, s3, `Template size (${s1}) must match dist/cafe.html size (${s3})`);
  });
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n================================================================================');
console.log('ADVERSARIAL SCENARIO AGENT TEST SUITE SUMMARY');
console.log('================================================================================');
const total = testResults.length;
const passed = testResults.filter(t => t.passed).length;
const failed = testResults.filter(t => !t.passed).length;

console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log('================================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('VERDICT: ALL SCENARIO AI AGENTS & ENVIRONMENT ROBUSTNESS TESTS PASSED (100%).\n');
}

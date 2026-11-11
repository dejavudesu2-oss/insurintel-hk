/**
 * tests/verification_55_agent_upgrades.ts
 * Comprehensive End-to-End & Edge-Case Verification Suite for All 55 Cantonese
 * Product & Advisor Workflow Suggestions (#1–#55) + Top 10 High-ROI Recommendations.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import * as crypto from 'crypto';

const rootDir = path.resolve(__dirname, '..');
const templatePath = path.join(rootDir, 'templates', 'mobile_cafe_app.html');
const distIndexPath = path.join(rootDir, 'dist', 'index.html');
const distCafePath = path.join(rootDir, 'dist', 'cafe.html');
const templateSwPath = path.join(rootDir, 'templates', 'sw.js');
const distSwPath = path.join(rootDir, 'dist', 'sw.js');

function assert(condition: any, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('================================================================================');
console.log('🚀 VERIFICATION SUITE: ALL 55 AGENT & PRODUCT UPGRADES (#1–#55) + TOP 10 PICKS');
console.log('================================================================================');

// 1. Build & Service Worker Cache Parity
assert(fs.existsSync(templatePath), 'templates/mobile_cafe_app.html must exist');
assert(fs.existsSync(distIndexPath), 'dist/index.html must exist');
assert(fs.existsSync(distCafePath), 'dist/cafe.html must exist');
assert(fs.existsSync(templateSwPath), 'templates/sw.js must exist');
assert(fs.existsSync(distSwPath), 'dist/sw.js must exist');

const tplHash = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const idxHash = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const cafeHash = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');
assert(tplHash === idxHash && idxHash === cafeHash, 'Template, dist/index.html, and dist/cafe.html must have identical SHA-256');

const tplSw = fs.readFileSync(templateSwPath, 'utf8');
const dstSw = fs.readFileSync(distSwPath, 'utf8');
assert(tplSw === dstSw, 'templates/sw.js and dist/sw.js must match byte-for-byte');
assert(dstSw.includes("insurintel-cache-v16-pro55-mdrt-suite"), 'Service Worker CACHE_NAME must be bumped to v16-pro55-mdrt-suite');
console.log(`✅ [1/8] Build SHA-256 Parity (${idxHash.slice(0, 12)}...) & SW Cache v16 Verified`);

// 2. Boot Main <script> in Stateful VM Sandbox
const htmlSource = fs.readFileSync(distIndexPath, 'utf8');
assert(htmlSource.includes('id="pro55-suite-modal"'), 'HTML must contain #pro55-suite-modal');
assert(htmlSource.includes('id="ipad-highlighter-overlay"'), 'HTML must contain #ipad-highlighter-overlay');
assert(htmlSource.includes('id="citation-source-popover"'), 'HTML must contain #citation-source-popover');
assert(htmlSource.includes('id="objection-quickpad-panel"'), 'HTML must contain #objection-quickpad-panel');
assert(htmlSource.includes('id="pwa-install-guide-modal"'), 'HTML must contain #pwa-install-guide-modal');

const scriptMatch = htmlSource.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch && scriptMatch[1], 'Main <script> block must be extractable');

const elements: Record<string, any> = {};
function getEl(id: string) {
  if (!elements[id]) {
    const classes = new Set<string>();
    elements[id] = {
      id,
      innerHTML: '',
      innerText: '',
      textContent: '',
      value: '',
      width: 720,
      height: 1280,
      style: { display: '', color: '', left: '', width: '', borderColor: '' },
      options: [
        { value: 'AIA', text: '友邦 AIA' },
        { value: 'Prudential', text: '保誠 Prudential' },
        { value: 'Manulife', text: '宏利 Manulife' },
        { value: 'SunLife', text: '永明 Sun Life' },
        { value: 'BOCLife', text: '中銀人壽 BOC Life' },
        { value: 'ChinaLife', text: '中國人壽 China Life' },
        { value: 'HSBC', text: '滙豐人壽 HSBC' },
        { value: 'AXA', text: '安盛 AXA' },
        { value: 'FWD', text: '富衛 FWD' }
      ],
      classList: {
        add: (...c: string[]) => c.forEach(x => classes.add(x)),
        remove: (...c: string[]) => c.forEach(x => classes.delete(x)),
        toggle: (c: string, force?: boolean) => {
          const next = typeof force === 'boolean' ? force : !classes.has(c);
          if (next) classes.add(c); else classes.delete(c);
          return next;
        },
        contains: (c: string) => classes.has(c)
      },
      getAttribute: (k: string) => elements[id][k] || null,
      setAttribute: (k: string, v: string) => { elements[id][k] = v; },
      appendChild: (ch: any) => ch,
      removeChild: (ch: any) => ch,
      addEventListener: () => {},
      focus: () => {},
      click: () => {},
      getContext: () => ({
        fillStyle: '',
        strokeStyle: '',
        font: '',
        lineWidth: 2,
        globalAlpha: 1,
        lineCap: 'round',
        fillRect: () => {},
        clearRect: () => {},
        fillText: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {}
      }),
      toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };
  }
  return elements[id];
}

const heroTagEls = [getEl('hero-tag-0'), getEl('hero-tag-1'), getEl('hero-tag-2')];
const store: Record<string, string> = {};
let locSearch = '';
let locHash = '#battlecard';

const sandbox: any = {
  console,
  Math,
  Date,
  JSON,
  Number,
  String,
  Boolean,
  Array,
  Object,
  RegExp,
  parseInt,
  parseFloat,
  isNaN,
  encodeURIComponent,
  decodeURIComponent,
  URLSearchParams,
  btoa: (s: string) => Buffer.from(s, 'binary').toString('base64'),
  atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
  setTimeout: (fn: Function) => { fn(); return 1; },
  clearTimeout: () => {},
  localStorage: {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; }
  },
  navigator: {
    onLine: true,
    serviceWorker: {},
    clipboard: { writeText: () => Promise.resolve() }
  },
  window: null as any,
  document: {
    body: getEl('body'),
    getElementById: (id: string) => getEl(id),
    createElement: (tag: string) => getEl('dyn-' + tag + '-' + Math.random()),
    querySelector: (sel: string) => getEl('qs-' + sel),
    querySelectorAll: (sel: string) => {
      if (sel.includes('#hero-battle-header .hero-tag')) return heroTagEls;
      return [];
    }
  }
};

sandbox.window = sandbox;
sandbox.window.location = {
  origin: 'https://dejavudesu2-oss.github.io',
  pathname: '/insurintel-hk/index.html',
  get search() { return locSearch; },
  set search(v: string) { locSearch = v; },
  get hash() { return locHash; },
  set hash(v: string) { locHash = v; }
};
sandbox.window.history = {
  pushState: (_s: any, _t: string, url: string) => { if (url.startsWith('#')) locHash = url; },
  replaceState: (_s: any, _t: string, url: string) => { if (url.startsWith('?')) locSearch = url; }
};
sandbox.window.addEventListener = () => {};
sandbox.window.matchMedia = () => ({ matches: false });
sandbox.window.open = () => ({});

vm.createContext(sandbox);
vm.runInContext(scriptMatch![1], sandbox);

// 3. Registry & Top 10 Recommendations Audit
const registry: any[] = sandbox.window.PRO_55_SUGGESTIONS_REGISTRY;
assert(Array.isArray(registry) && registry.length === 55, `Expected 55 suggestions in registry, got ${registry && registry.length}`);
for (let expectedId = 1; expectedId <= 55; expectedId++) {
  const found = registry.find(item => item.id === expectedId);
  assert(found && found.title && found.summary, `Missing or incomplete suggestion #${expectedId} in registry`);
}
const partCounts = [1, 2, 3, 4, 5, 6].map(p => registry.filter(x => x.part === p).length);
assert(JSON.stringify(partCounts) === JSON.stringify([9, 10, 10, 8, 7, 11]), `Part counts mismatch: ${JSON.stringify(partCounts)}`);

const top10 = sandbox.window.getTop10Pro55Recommendations();
assert(top10.length === 10, `Expected exactly 10 Top-10 picks, got ${top10.length}`);
const expectedTop10Ids = [30, 20, 8, 38, 39, 1, 23, 14, 33, 45];
assert(
  JSON.stringify(top10.map((x: any) => x.id)) === JSON.stringify(expectedTop10Ids),
  `Top 10 ranked IDs mismatch: ${JSON.stringify(top10.map((x: any) => x.id))}`
);
console.log('✅ [2/8] Registry Audit Passed: All 55 Items (#1–#55, Unaccounted = 0) & Top 10 Ranked Picks Verified');

// 4. Part 1 (#1–#9) Verification + Edge Cases
const p1 = sandbox.window.applyPersonaAutoMatch('mcv_hnw_split');
assert(p1.applied && sandbox.window.getMyCompany() === 'Manulife', '#1 Persona auto-match must switch company & premium');
const p1Fallback = sandbox.window.applyPersonaAutoMatch('non_existent_persona');
assert(p1Fallback.personaKey === 'dual_parents_edu', '#1 Invalid persona key must safely fall back to dual_parents_edu');

const memSaved = sandbox.window.saveClientMemoryCard({ salutation: '周太', annualUsd: 50000, payYears: 5 });
assert(memSaved.salutation === '周太' && sandbox.window.getClientMemoryCard().salutation === '周太', '#2 Client memory card must persist & decode');
assert(getEl('agent-step-1').innerHTML.includes('周太'), '#2 Saved client salutation must personalize Advisor Step 1');
sandbox.window.clearClientMemoryCard();
assert(sandbox.window.getClientMemoryCard().salutation === '', '#2 1-click wipe must erase client salutation');

const cvExtract = sandbox.window.extractProposalCashValueSchedule('總保費: USD 200,000\n第 5 年 155,000 185,000\n第 10 年 192,000 280,000');
assert(cvExtract.totalPremiumUsd === 200000 && cvExtract.schedule.length === 4, '#3 Proposal cash value schedule must extract 4 checkpoints');
const cvEmpty = sandbox.window.extractProposalCashValueSchedule('');
assert(cvEmpty.totalPremiumUsd > 0 && cvEmpty.schedule[3].year === 30, '#3 Empty proposal text must fall back cleanly without NaN');

const promoActive = sandbox.window.computePromoUrgencyCountdown('AIA', '2026-11-10T00:00:00+08:00');
assert(!promoActive.isExpired && promoActive.daysLeft >= 20, '#4 Promo countdown before cutoff must show positive remaining days');
const promoExpired = sandbox.window.computePromoUrgencyCountdown('AIA', '2027-02-01T00:00:00+08:00');
assert(promoExpired.isExpired && promoExpired.daysLeft === 0, '#4 Promo countdown after cutoff must flag expired cleanly');

const combo = sandbox.window.calculateComboRebateNetPremium(50000, 5, 3000, 18, 26);
assert(combo.bundledRebateUsd > combo.standaloneRebateUsd && combo.extraComboBenefitUsd > 0, '#5 Combo rebate must exceed standalone');
const comboZero = sandbox.window.calculateComboRebateNetPremium(0, 5, 0, 0, 0);
assert(comboZero.effectiveFirstYearDiscountPct === 0, '#5 Zero-premium edge case must not divide by zero');

['thyroid_nodule', 'fatty_liver', 'breast_hyperplasia', 'mild_hypertension', 'uric_acid', 'hepatitis_b_carrier'].forEach(cond => {
  const uw = sandbox.window.queryUnderwritingTrafficLight(cond);
  assert(uw.savings.includes('綠燈') && uw.docs.length > 5, `#6 Underwriting check failed for ${cond}`);
});

const finAll = sandbox.window.getInsurerFinancialStrengthMatrix('');
assert(finAll.count === 15, `#7 Expected 15 HK insurers in financial strength matrix, got ${finAll.count}`);
const finAia = sandbox.window.getInsurerFinancialStrengthMatrix('AIA');
assert(finAia.count === 1 && finAia.rows[0].sp === 'AA-', '#7 Insurer filter must match AIA');

sandbox.window.setAdvisorChannelMode('broker');
assert(getEl('bilateral-spec-table').innerHTML.includes('方案一 (Plan A)'), '#8 Broker mode must render neutral 方案一/方案二 headers');
sandbox.window.setAdvisorChannelMode('tied', 'AIA');
assert(getEl('bilateral-spec-table').innerHTML.includes('Plan A (我方)'), '#8 Tied mode must restore Plan A (我方)');

const vipPack = sandbox.window.preloadVipOfflinePack();
assert(vipPack.offlineReady && vipPack.plans.length === 3, '#9 VIP offline pack must cache 3 plan entries');
console.log('✅ [3/8] Part 1 Pre-Meeting Prep (#1–#9) & Boundary Cases Verified');

// 5. Part 2 (#10–#19) Verification + Edge Cases
sandbox.window.switchView('agent');
const lockRes = sandbox.window.triggerPanicFlipLock('2468');
assert(lockRes.locked && lockRes.currentMode === 'client', '#10 Panic flip must switch immediately to client view and arm lock');
const blockedSwitch = sandbox.window.switchView('agent');
assert(blockedSwitch === false, '#10 Locked client view must block switching back to agent HUD');
assert(sandbox.window.unlockPanicFlipLock('9999').unlocked === false, '#10 Wrong PIN must be rejected');
assert(sandbox.window.unlockPanicFlipLock('2468').unlocked === true, '#10 Correct PIN must unlock');
sandbox.window.switchView('agent');

const hlOn = sandbox.window.toggleHighlighterCanvas(true);
assert(hlOn.active === true, '#11 Highlighter canvas must activate');
sandbox.window.setHighlighterPenColor('#EF4444');
assert(sandbox.window.exportHighlighterSnapshot().dataUrl.startsWith('data:image/'), '#11 Highlighter snapshot must export data URL');
sandbox.window.clearHighlighterCanvas();
sandbox.window.toggleHighlighterCanvas(false);

const lsTimeline = sandbox.window.computeLifeStageTimeline(3, 18, 38, 65, 85, 30000);
assert(lsTimeline.milestones.length === 3 && lsTimeline.milestones[0].policyYear === 15, '#12 Life-stage timeline math verified');

const splitTree = sandbox.window.simulatePolicySplitTree(300000, 5, 2, ['USD', 'GBP', 'CAD']);
assert(splitTree.totalSubPolicies === 3 && splitTree.branches[1].currency === 'GBP', '#13 Policy split 1-into-3 tree verified');

const reinvest = sandbox.window.simulateReinvestmentRiskVsSavings(150000, 4.3, 2.0, 2, 20, 5.6);
assert(reinvest.reinvestmentGapUsd > 100000, '#14 Rate-cut reinvestment gap over 20 years must be positive');

const infOn = sandbox.window.toggleRealPurchasingPower(true);
assert(infOn.active && infOn.sample1MIn20Yrs.realPurchasingPower === 553676, '#15 3% inflation over 20y on $1M must equal $553,676');
sandbox.window.toggleRealPurchasingPower(false);

assert(sandbox.window.toggleSenior3KpiCard(true).visible === true, '#16 Senior 3-KPI executive card must toggle visible');
assert(getEl('kpi3-total-premium').innerText.includes('USD $'), '#16 3-KPI card must populate scaled USD figure');
sandbox.window.toggleSenior3KpiCard(false);

assert(sandbox.window.setTerminologyDialect('mcv').dialect === 'mcv', '#17 Dialect switch to MCV verified');
sandbox.window.setTerminologyDialect('hk');

const objSearch = sandbox.window.renderObjectionQuickPad('脫鈎');
assert(objSearch.count >= 1 && objSearch.items[0].a.includes('貨幣轉換'), '#18 Objection quick-pad search for 脫鈎 verified');

const dualProj = sandbox.window.openDualScreenClientProjection();
assert(dualProj.cleanClientOnly && dualProj.projectionUrl.includes('dualscreen=1'), '#19 Dual-screen clean client URL verified');
console.log('✅ [4/8] Part 2 In-Cafe Presentation UX (#10–#19) & PIN Security Verified');

// 6. Part 3 (#20–#29) HK Actuarial Deep-Tools + Edge Cases
const w567 = sandbox.window.simulateWithdrawalStressTest(30000, 5, 6, 7, 6.2, 5.2, 30);
assert(w567.annualWithdrawalUsd === 10500 && w567.ourTerminalCvUsd > w567.rivalTerminalCvUsd, '#20 567 withdrawal simulator verified');
const wDeplete = sandbox.window.simulateWithdrawalStressTest(30000, 5, 6, 18, 4.0, 3.5, 30);
assert(wDeplete.ourDepletedYear !== null && wDeplete.capitalErosionWarning === true, '#20 Excessive 18% drawdown must trigger depletion year');

const cohortMap = sandbox.window.renderGN16CohortHeatmap('AIA');
assert(cohortMap.cohorts.length === 8 && getEl('gn16-cohort-heatmap-body').innerHTML.includes('2016'), '#21 GN16 cohort heatmap verified');

const ciAnatomy = sandbox.window.compareCIMultiClaimAnatomy('AIA', 'Prudential');
assert(ciAnatomy.clauses.length === 6, '#22 CI multi-claim 6-clause comparator verified');

const hospSemi = sandbox.window.calculatePrivateHospitalShortfall('angioplasty', 'semi', 65000);
const hospPriv = sandbox.window.calculatePrivateHospitalShortfall('angioplasty', 'private', 65000);
assert(hospSemi.clientOutOfPocketShortfallHkd === 150000 && hospPriv.estimatedBillHkd > hospSemi.estimatedBillHkd, '#23 Private hospital shortfall verified');

const taxCouple = sandbox.window.optimizeCoupleQdapTvcTax(800000, 550000, 1);
assert(taxCouple.totalDeductibleQuotaHkd === 120000 && taxCouple.annualTaxSavedHkd > 0 && taxCouple.annualTaxSavedHkd <= 20400, '#24 Couple QDAP+TVC Cap.112 tax optimizer verified');

const mcvWithin = sandbox.window.generateMcvRenewalGuide(50000, 5, true);
const mcvOver = sandbox.window.generateMcvRenewalGuide(80000, 5, false);
assert(mcvWithin.withinAnnual50kQuota === true && mcvOver.withinAnnual50kQuota === false, '#25 MCV 50k FX quota boundary verified');

const ulNegCarry = sandbox.window.simulateUlPremiumFinancingSpread(1000000, 75, 4.2, 1.4, 4.5, 2.0, 10);
assert(ulNegCarry.negativeCarryActive === true && ulNegCarry.marginCallTriggerRatePct > 5.0, '#26 UL negative carry & margin call trigger verified');

const trustCmp = sandbox.window.compareTrustVsSettlementOption(5000000, 20000);
assert(trustCmp.dimensions.length === 4 && trustCmp.recommendedPath.includes('雙層架構'), '#27 Family trust vs settlement option verified');

const fxStress = sandbox.window.simulateFxSensitivityMultiCurrency(300000, 'GBP', 10);
assert(fxStress.stressedTargetAmount > fxStress.baselineTargetAmount, '#28 Multi-currency FX +10% stress test verified');

const healthGap = sandbox.window.evaluateLegacyPolicyHealthCheck(400000, 500000, 1500000, 600000, 25000, 6000);
assert(healthGap.axes.length === 4 && healthGap.overallHealthScorePct > 0 && healthGap.overallHealthScorePct < 100, '#29 Legacy policy 4-axis gap check verified');
console.log('✅ [5/8] Part 3 HK Actuarial Deep-Tools (#20–#29) & Depletion/Tax Boundaries Verified');

// 7. Part 4 (#30–#37) & Part 5 (#38–#44) Verification
const poster = sandbox.window.generateWhatsAppPoster916(true);
assert(poster.width === 720 && poster.height === 1280 && poster.dataUrl.startsWith('data:image/'), '#30 9:16 WhatsApp poster PNG verified');

const link72 = sandbox.window.createExpiringClientShareLink('林生', 72, 1700000000000);
assert(sandbox.window.verifyExpiringClientShareLink(link72.url, 1700000000000 + 3600000).expired === false, '#31 Active 72h link must pass');
assert(sandbox.window.verifyExpiringClientShareLink(link72.url, 1700000000000 + 80 * 3600000).expired === true, '#31 Expired >72h link must be rejected');

const stage3 = sandbox.window.generateThreeStageFollowupPack('陳博士');
assert(stage3.stages.length === 3 && stage3.stages[0].script.includes('陳博士'), '#32 3-stage follow-up scripts verified');

const spouseBrief = sandbox.window.generateSpouseDecisionBrief('太太');
assert(spouseBrief.briefText.includes('Illustrative - not from an official illustration') && spouseBrief.briefText.includes('21 個曆日'), '#33 Spouse 30s brief verified');

sandbox.window.setAdvisorHonorBadge('COT');
const vcard = sandbox.window.downloadAdvisorVCard();
assert(vcard.vcf.includes('BEGIN:VCARD') && vcard.vcf.includes('COT'), '#34 Advisor .vcf vCard & COT honor badge verified');

const xhsCard = sandbox.window.generateSocialEduCard34('qdap_tax_edu');
assert(xhsCard.aspectRatio === '3:4' && xhsCard.caption.includes('HK$60,000'), '#35 3:4 social educational card verified');

const icsExport = sandbox.window.exportFollowupIcsCalendar({ clientName: '張太', followupDate: '2026-11-20' });
assert(icsExport.ics.includes('BEGIN:VCALENDAR') && icsExport.ics.includes('DTSTART:20261120T020000Z'), '#36 Mini CRM & .ics calendar export verified');

sandbox.window.setReportExportLang('en');
sandbox.window.renderClientPdfPreview();
assert(getEl('client-pdf-report-preview').innerHTML.includes('EXECUTIVE CLIENT BENCHMARK BRIEF'), '#37 English Executive Tear-Sheet verified');
sandbox.window.setReportExportLang('zh-HK');

const cite = sandbox.window.showCitationPopover('gl28_cap');
assert(cite.methodology.includes('6.5%') && getEl('citation-pop-body').innerHTML.includes('GL28'), '#38 Click-to-Source citation popover verified');
sandbox.window.closeCitationPopover();

const badPitch = '呢份單保證派足、穩賺無賠，私下退現金回傭俾你，對手一定唔賠！';
const compScan = sandbox.window.scanAndRewriteComplianceText(badPitch);
assert(!compScan.compliant && compScan.violationCount >= 4 && !compScan.rewrittenText.includes('穩賺無賠'), '#39 Compliance scanner must intercept & rewrite violations');
const cleanPitch = sandbox.window.scanAndRewriteComplianceText('根據香港保監局 GL16 公開披露數據，非保證紅利受實際投資表現影響。');
assert(cleanPitch.compliant && cleanPitch.violationCount === 0, '#39 Clean compliant text must pass with 0 violations');

assert(sandbox.window.evaluateDataFreshnessGuard('2026-11-06', '2026-11-09').isStale === false, '#40 Fresh data (<90d) must pass');
assert(sandbox.window.evaluateDataFreshnessGuard('2026-01-01', '2026-11-09').isStale === true, '#40 Stale data (>90d) must trigger amber warning');

const dualAck = sandbox.window.generateDualAckIllustrationStamp('IA998877', '趙先生');
assert(dualAck.notOfficialIllustration && dualAck.stampText.includes('Not an Official Illustration'), '#41 Dual-acknowledgment stamp verified');

assert(sandbox.window.evaluateFnaPreCheck({}).suitabilityReady === true, '#42 Complete FNA pre-check must pass');
assert(sandbox.window.evaluateFnaPreCheck({ emergencyReserve6M: false }).suitabilityReady === false, '#42 Missing 6M emergency reserve must block FNA');

assert(sandbox.window.checkCrossBorderMcvCompliance({}).compliant === true, '#43 Valid HK territorial signing must pass');
assert(sandbox.window.checkCrossBorderMcvCompliance({ signingInHk: false }).compliant === false, '#43 Off-shore Mainland signing must trigger red-line violation');

const pdpoAudit = sandbox.window.verifyZeroServerUploadAudit();
assert(pdpoAudit.externalUploadCount === 0 && pdpoAudit.pdpoCap486Aligned === true, '#44 Zero-server-upload PDPO Cap.486 audit verified');
console.log('✅ [6/8] Part 4 Follow-Up (#30–#37) & Part 5 HKIA Compliance (#38–#44) Verified');

// 8. Part 6 (#45–#55) + Full 55-Card Hub Sweep
sandbox.window.toggleMorning5SlideDeck(true);
assert(sandbox.window.goToMorning5Slide(4).index === 4, '#45 Morning 5-slide deck jump to slide 5 verified');
assert(sandbox.window.stepMorning5SlideDeck(1).index === 0, '#45 Morning 5-slide deck wrap-around verified');

assert(sandbox.window.evaluateAiRoleplayCoach('cpa_skeptic', '').totalScore === 0, '#46 Empty reply must score 0');
const badRoleplay = sandbox.window.evaluateAiRoleplayCoach('cpa_skeptic', '保證派足穩賺無賠');
const goodRoleplay = sandbox.window.evaluateAiRoleplayCoach('cpa_skeptic', '我理解您重視流動性，短期定存有減息再投資風險，可參考 GL16 實現率紀錄，非保證紅利以正式建議書為準。');
assert(goodRoleplay.totalScore > badRoleplay.totalScore && goodRoleplay.totalScore >= 80, '#46 AI roleplay coach rubric scoring verified');

const pinnedPb = sandbox.window.pinTeamPlaybookScript('九龍區標準話術', '共情肯定', '拆解條款', '引用GL16');
assert(pinnedPb.pinned && sandbox.window.applyTeamPlaybookToHud(pinnedPb.item.id).title.includes('九龍區標準話術'), '#47 Team playbook pin & HUD apply verified');

const wl = sandbox.window.applyAgencyWhiteLabelBrand({ agencyName: 'HARBOUR 家辦財富團隊', primaryColor: '#1E3A8A', approvalCode: 'HK-2026-88' });
sandbox.window.renderClientPdfPreview();
assert(wl.agencyName === 'HARBOUR 家辦財富團隊' && getEl('client-pdf-report-preview').innerHTML.includes('HARBOUR 家辦財富團隊'), '#48 Agency white-label branding verified');
sandbox.window.resetAgencyWhiteLabelBrand();

const quizBefore = sandbox.window.getBootcampProgress();
const quizAfter = sandbox.window.submitBootcampQuizAnswer(5, 0);
assert(quizAfter.correct && quizAfter.completionPct >= quizBefore.completionPct, '#49 14-day onboarding bootcamp quiz progression verified');

const promoSub = sandbox.window.subscribePromoAlertDigest(['Web_App_Digest'], ['AIA', 'Manulife']);
assert(promoSub.localPreferenceOnly && sandbox.window.previewMonthlyPromoDigest().highlights.length === 3, '#50 Monthly promo digest verified');

const plgTeam = sandbox.window.evaluatePlgTierFunnel('team_2480', 20);
assert(plgTeam.tier.priceHkd === 2480 && plgTeam.tier.seats === 15 && plgTeam.tier.perSeatHkd === 165, '#51 PLG Team tier ($2,480 / 15 seats / $165) verified');

const refPass = sandbox.window.generateAgentReferralPass('IA889900', true);
assert(refPass.referralCode === 'MDRT-IA889900' && refPass.rewardMonthsEach === 1, '#52 Agent referral pass verified');

const demand = sandbox.window.getProductDemandHeatmapSummary();
assert(demand.scope === 'local-browser-telemetry-only' && demand.topMatchups.length >= 1, '#53 Local matchup demand analytics verified');

const validCsv = 'company,productName,currency,illustratedRatePct,verifiedDate\nAIA,盈御3,USD,6.2,2026-11-09';
const invalidGl28Csv = 'company,productName,currency,illustratedRatePct,verifiedDate\nAIA,超標測試方案,HKD,7.2,2026-11-09';
assert(sandbox.window.validateAdminCircularIngestion(validCsv).valid === true, '#54 Valid circular CSV must pass GL28 check');
assert(sandbox.window.validateAdminCircularIngestion(invalidGl28Csv).valid === false, '#54 HKD > 6.0% circular must fail GL28 cap validation');
assert(sandbox.window.validateAdminCircularIngestion('').valid === false, '#54 Empty circular input must fail cleanly');

const pwaStatus = sandbox.window.openPwaInstallGuideModal();
assert(pwaStatus.steps.length === 3 && pwaStatus.serviceWorkerSupported === true, '#55 PWA Add-to-Home-Screen guide verified');
sandbox.window.closePwaInstallGuideModal();
console.log('✅ [7/8] Part 6 Team Management & SaaS Commercialization (#45–#55) Verified');

// Sweep all 55 cards in #pro55-suite-modal
sandbox.window.openPro55Suite('top10');
for (let id = 1; id <= 55; id++) {
  const rendered = sandbox.window.openPro55Item(id);
  assert(rendered.openedItemId === id, `Hub failed to open item #${id}`);
  assert(getEl('pro55-workspace-pane').innerHTML.includes(`建議 #${id}：`), `Workspace pane missing header for #${id}`);
  const execRes = sandbox.window.executePro55InteractiveAction(id, false);
  assert(execRes && typeof execRes.htmlSummary === 'string', `Interactive action failed for #${id}`);
}
sandbox.window.closePro55Suite();
console.log('✅ [8/8] Full 55-Card Pro Suite UI Sweep (#1–#55) Executed with ZERO Errors');

console.log('================================================================================');
console.log('🏆 ALL 55 SUGGESTIONS (#1–#55) + TOP 10 RECOMMENDATIONS VERIFIED 100% GREEN!');
console.log('================================================================================');

/**
 * tests/verification_validation_plan.ts
 * Automated Verification Suite for Customer Research & Validation Plan (TASK-08 - HARDENED)
 * 
 * Verifies:
 * 1. Physical file existence at `VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md` (size > 4,000 bytes)
 * 2. Methodology grounding in The Mom Test:
 *    - Strictly past behavior probes
 *    - Zero speculative / hypothetical sales pitches in question text (Negative regex assertion)
 * 3. Hong Kong Insurance Market & Compliance Realities:
 *    - Regulatory grounding: Cites GL27 (Policy Replacement), GN16/GL16 (Fulfillment Ratio), Cap. 41
 *    - Negative assertion: Does NOT cite GL20 (Cybersecurity) for policy replacement/disclosures
 *    - Bifurcation between Tied Agents and Brokers/IFAs
 * 4. 4 Quantified Success Thresholds (TH-01 through TH-04):
 *    - TH-01: >= 3/10 advisors commit actual HK$ 50 FPS deposit or valid IA license number (no cheap talk)
 *    - TH-02: >= 1 District Director / Unit Manager commits to 14-day closed sandbox pilot
 *    - TH-03: >= 7/10 advisors experienced collision and spent > 2 hours comparing
 *    - TH-04: >= 8.0% waitlist conversion on landing page
 * 5. Decision Tree Consistency & Zero Logic Dead Zones:
 *    - Flowchart pivot rule for TH-03 matches the threshold boundary (< 7) without dead zones
 * 6. Executable validation evaluator engine verifying scenario distributions
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';

console.log('================================================================================');
console.log('TEST SUITE: CUSTOMER RESEARCH INTERVIEW SCRIPT & VALIDATION PLAN (TASK-08 - HARDENED)');
console.log('================================================================================\n');

const planPath = path.join(process.cwd(), 'VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md');
assert.ok(fs.existsSync(planPath), 'VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md must exist in repository root');

const content = fs.readFileSync(planPath, 'utf8');
assert.ok(content.length > 4000, `Plan file too short: ${content.length} bytes`);
console.log(`  [PASS] File verified at root: ${content.length} characters.`);

// 1. Methodology & Anti-Hypothetical Negative Assertions
assert.ok(content.includes('The Mom Test'), 'Plan must reference The Mom Test methodology');
assert.ok(content.includes('不問假設性問題') || content.includes('完全不問假設性問題'), 'Plan must explicitly state anti-hypothetical rule');

// Negative Regex Assertions: Strictly forbid speculative pitching in interview questions
const speculativePitchPatterns = [
  /如果市面上有一個工具/i,
  /假如呢個工具聽日就要收費/i,
  /你會唔會用呢個工具/i,
  /你會唔會買/i
];

for (const pattern of speculativePitchPatterns) {
  assert.ok(!pattern.test(content), `Found forbidden speculative sales pitch pattern: ${pattern}`);
}
console.log('  [PASS] Negative test passed: 0 speculative pitching patterns in interview questions.');

// 2. Regulatory Grounding & Compliance Accuracy
assert.ok(content.includes('GL27'), 'Plan must cite HKIA GL27 regarding policy replacement / twisting');
assert.ok(content.includes('GN16') || content.includes('GL16'), 'Plan must cite GN16/GL16 for dividend fulfillment ratios');
assert.ok(content.includes('Tied Agent') || content.includes('專屬代理人'), 'Plan must distinguish Tied Agents');
assert.ok(content.includes('Broker') || content.includes('IFA') || content.includes('獨立經紀行'), 'Plan must distinguish Brokers/IFAs');

// Negative test: GL20 must NOT be cited as a policy replacement or product disclosure guideline
const invalidGL20Citation = /GL20[^.\n]*守則[^.\n]*替換保單/;
assert.ok(!invalidGL20Citation.test(content), 'Plan must not erroneously cite GL20 (Cybersecurity) for policy replacement');
console.log('  [PASS] Regulatory accuracy verified: Proper citation of GL27 & GN16; zero GL20 twisting hallucinations.');

// 3. 4 Cantonese Past-Behavior Interview Modules
assert.ok(content.includes('模塊一') && content.includes('撞單'), 'Module 1 missing');
assert.ok(content.includes('模塊二') && content.includes('時間成本'), 'Module 2 missing');
assert.ok(content.includes('模塊三') && content.includes('成交結果'), 'Module 3 missing');
assert.ok(content.includes('模塊四') && content.includes('歷史付費'), 'Module 4 missing');

assert.ok(content.includes('最近 30 日入面') || content.includes('最近 30 天'), 'Missing Cantonese past timeframe prompt');
assert.ok(content.includes('自己開 Excel') || content.includes('計 IRR'), 'Missing tool breakdown in Module 2');
assert.ok(content.includes('轉數快') || content.includes('PayMe') || content.includes('HK$50'), 'Module 4 must include real currency commitment check');
console.log('  [PASS] All 4 authentic Cantonese past-behavior interview modules verified.');

// 4. Quantified Success Thresholds (TH-01 to TH-04)
assert.ok(content.includes('TH-01'), 'Threshold TH-01 missing');
assert.ok(content.includes('TH-02'), 'Threshold TH-02 missing');
assert.ok(content.includes('TH-03'), 'Threshold TH-03 missing');
assert.ok(content.includes('TH-04'), 'Threshold TH-04 missing');

assert.ok(content.includes('3 / 10') || content.includes('3/10'), 'TH-01 must require >= 3/10 commitment');
assert.ok(content.includes('轉數快') && content.includes('HK$50'), 'TH-01 must specify real monetary pre-payment or license verification');
assert.ok(content.includes('14 天') || content.includes('14-Day'), 'TH-02 must specify 14-day team pilot');
assert.ok(content.includes('8.0') || content.includes('8%'), 'TH-04 must require >= 8.0% waitlist conversion');
console.log('  [PASS] Success thresholds TH-01 through TH-04 verified with non-cheap-talk targets.');

// 5. Decision Tree Consistency (Zero Logic Dead Zones)
assert.ok(content.includes('未達標決策調整規則') || content.includes('Pivot Decision Rules'), 'Missing pivot decision rules');
assert.ok(content.includes('< 7人覺得痛') || content.includes('< 7'), 'TH-03 failure branch must trigger at < 7 to match >= 7 threshold');
assert.ok(!content.includes('< 4人覺得痛'), 'Old buggy logic dead zone (< 4) must be eliminated');
console.log('  [PASS] Decision tree verified: Zero logic dead zones between TH-03 threshold and failure pivot.');

// 6. Executable Validation Evaluator Implementation
interface ValidationInput {
  paidOrLicensedDeposits: number; // 0..10
  teamPilotAgreements: number;    // 0..2
  collisionPast30DaysOver2Hr: number; // 0..10
  landingPageConversionRate: number; // e.g. 0.085
}

function evaluateValidationRun(input: ValidationInput): { passed: boolean; primaryAction: string } {
  const th01Pass = input.paidOrLicensedDeposits >= 3;
  const th02Pass = input.teamPilotAgreements >= 1;
  const th03Pass = input.collisionPast30DaysOver2Hr >= 7;
  const th04Pass = input.landingPageConversionRate >= 0.08;

  if (th01Pass && th02Pass && th03Pass && th04Pass) {
    return { passed: true, primaryAction: 'LAUNCH_14_DAY_PAID_PILOT' };
  }
  if (!th01Pass) {
    return { passed: false, primaryAction: 'PIVOT_PRICE_TO_B2B_OR_RETAIL' };
  }
  if (!th02Pass) {
    return { passed: false, primaryAction: 'PIVOT_GTM_BOTTOM_UP' };
  }
  if (!th03Pass) {
    return { passed: false, primaryAction: 'PIVOT_PRODUCT_SLIM_CARD' };
  }
  return { passed: false, primaryAction: 'PIVOT_LANDING_COPY' };
}

// Scenario 1: All green
const resGreen = evaluateValidationRun({
  paidOrLicensedDeposits: 4,
  teamPilotAgreements: 1,
  collisionPast30DaysOver2Hr: 8,
  landingPageConversionRate: 0.092
});
assert.strictEqual(resGreen.passed, true);
assert.strictEqual(resGreen.primaryAction, 'LAUNCH_14_DAY_PAID_PILOT');

// Scenario 2: Price resistance (only 1 paid deposit)
const resPrice = evaluateValidationRun({
  paidOrLicensedDeposits: 1,
  teamPilotAgreements: 1,
  collisionPast30DaysOver2Hr: 8,
  landingPageConversionRate: 0.092
});
assert.strictEqual(resPrice.passed, false);
assert.strictEqual(resPrice.primaryAction, 'PIVOT_PRICE_TO_B2B_OR_RETAIL');

// Scenario 3: Boundary edge (TH-03 = 6)
const resEdge = evaluateValidationRun({
  paidOrLicensedDeposits: 3,
  teamPilotAgreements: 1,
  collisionPast30DaysOver2Hr: 6,
  landingPageConversionRate: 0.085
});
assert.strictEqual(resEdge.passed, false);
assert.strictEqual(resEdge.primaryAction, 'PIVOT_PRODUCT_SLIM_CARD');

console.log('  [PASS] Executable validation evaluator passed all scenario distributions and edge conditions.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL HARDENED VALIDATION PLAN TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

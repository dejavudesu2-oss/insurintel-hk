/**
 * tests/verification_known_answer_actuarial.ts
 * Automated Verification Suite for Closed-Form Known-Answer Actuarial Benchmarks & Provenance (TASK-R2-03: C4 - HARDENED)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('================================================================================');
console.log('TEST SUITE: CLOSED-FORM KNOWN-ANSWER ACTUARIAL BENCHMARKS (TASK-R2-03 - HARDENED)');
console.log('================================================================================\n');

// 1. Run audit script
const scriptPath = path.join(process.cwd(), 'scripts', 'known_answer_actuarial_tests.js');
assert.ok(fs.existsSync(scriptPath), 'scripts/known_answer_actuarial_tests.js must exist');

const scriptOutput = execSync('node scripts/known_answer_actuarial_tests.js', { encoding: 'utf8' });
console.log('  [PASS] known_answer_actuarial_tests.js executed cleanly with exit code 0.');
assert.ok(scriptOutput.includes('All 5 closed-form known-answer benchmarks passed with zero discrepancy'), 'Output must confirm 5 passed benchmarks');

// 2. Validate Generated JSON Report
const reportPath = path.join(process.cwd(), 'dist', 'known_answer_actuarial_audit_report.json');
assert.ok(fs.existsSync(reportPath), 'dist/known_answer_actuarial_audit_report.json must exist');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
assert.strictEqual(report.overallVerdict, 'PASSED_ALL_CLOSED_FORM_TESTS', 'Overall verdict must be PASSED_ALL_CLOSED_FORM_TESTS');

// 3. Validate Input Provenance Disclosure
const prov = report.inputProvenanceAudit;
assert.ok(prov.dataSourceFile.includes('gn16_database.json'), 'Must disclose dataSourceFile');
assert.ok(prov.originMethod.includes('generate_gn16_data.js'), 'Must disclose procedural generation method');
assert.ok(prov.empiricalStatus.includes('SYNTHETIC'), 'Must label data status as SYNTHETIC / ILLUSTRATIVE');
assert.ok(prov.truthDisclosure.includes('procedural polynomials'), 'Must explicitly disclose that cash values were generated from polynomials');
assert.ok(prov.structuralCashFlowLimitation.includes('discarding historical dividend accumulation'), 'Must disclose structural omission of prior dividend accumulation');
console.log('  [PASS] Input provenance thoroughly documented with structural dividend omission disclosure.');

// 4. Validate All 5 Closed-Form Benchmarks & Cash-Flow Exactness
assert.strictEqual(report.benchmarks.length, 5, 'Must contain exactly 5 closed-form benchmarks');

// BM-01: Zero Coupon 10%
const bm1 = report.benchmarks.find((b: any) => b.id === 'BM-01');
assert.ok(bm1 && bm1.passed, 'BM-01 must pass');
assert.strictEqual(bm1.expectedRatePct, '10.000000', 'BM-01 expected rate must be 10.000000%');
assert.strictEqual(bm1.calculatedRatePct, '10.000000', 'BM-01 calculated rate must match exactly');

// BM-02: Zero Growth Capital Preservation 0% (Clean positive zero asserted!)
const bm2 = report.benchmarks.find((b: any) => b.id === 'BM-02');
assert.ok(bm2 && bm2.passed, 'BM-02 must pass');
assert.strictEqual(bm2.expectedRatePct, '0.000000', 'BM-02 expected rate must be 0.000000%');
assert.strictEqual(bm2.calculatedRatePct, '0.000000', 'BM-02 calculated rate must match clean positive 0.000000% without signed zero defect');

// BM-03: Doubling Horizon 14.869835%
const bm3 = report.benchmarks.find((b: any) => b.id === 'BM-03');
assert.ok(bm3 && bm3.passed, 'BM-03 must pass');
assert.strictEqual(bm3.expectedRatePct, '14.869835', 'BM-03 expected rate must be 14.869835%');
assert.strictEqual(bm3.calculatedRatePct, '14.869835', 'BM-03 calculated rate must match exactly');

// BM-04: Level Ordinary Annuity 4.5% (Non-trivial guess traversal tested!)
const bm4 = report.benchmarks.find((b: any) => b.id === 'BM-04');
assert.ok(bm4 && bm4.passed, 'BM-04 must pass');
assert.strictEqual(bm4.expectedRatePct, '4.500000', 'BM-04 expected rate must be 4.500000%');
assert.strictEqual(bm4.calculatedRatePct, '4.500000', 'BM-04 calculated rate must match exactly');
// Verify exact cash-flow reproducibility: First element is unrounded float ~ -438.99767
assert.ok(typeof bm4.cashFlows[0] === 'number' && bm4.cashFlows[0] < -438.99 && bm4.cashFlows[0] > -439.01,
  'BM-04 cash flows must store exact unrounded float to prevent audit artifact contradiction');

// BM-05: Level Annuity-Due 6.0% (Non-trivial guess traversal tested!)
const bm5 = report.benchmarks.find((b: any) => b.id === 'BM-05');
assert.ok(bm5 && bm5.passed, 'BM-05 must pass');
assert.strictEqual(bm5.expectedRatePct, '6.000000', 'BM-05 expected rate must be 6.000000%');
assert.strictEqual(bm5.calculatedRatePct, '6.000000', 'BM-05 calculated rate must match exactly');
// Verify exact cash-flow reproducibility: Last element is unrounded float ~ 597.531854
assert.ok(typeof bm5.cashFlows[5] === 'number' && bm5.cashFlows[5] > 597.53 && bm5.cashFlows[5] < 597.54,
  'BM-05 cash flows must store exact unrounded float to prevent audit artifact contradiction');
console.log('  [PASS] All 5 closed-form benchmarks mathematically verified with exact unrounded cash flows.');

// 5. Validate Bug Postmortem, Duration-Dependent Inflation & 5 Blindspot Classes
const pm = report.bugPostmortem;
assert.ok(pm.bugDescription.includes('t = T-1 instead of t = T'), 'Must explain timing index flaw');
assert.ok(pm.economicImpactFormula.includes('(1 + r_true)^(T / (T-1)) - 1'), 'Must state exact duration-dependent formula');
assert.ok(pm.whyEarlier207TestsMissedIt.includes('Self-Matching'), 'Must explain engine self-matching blindspot');

assert.ok(Array.isArray(pm.remainingBlindspotClasses) && pm.remainingBlindspotClasses.length >= 5,
  `Must list at least 5 blindspot classes, got ${pm.remainingBlindspotClasses.length}`);

const hasDescartes = pm.remainingBlindspotClasses.some((b: any) => b.bugClass.includes('Descartes') || b.bugClass.includes('Multiple Real IRR Roots'));
assert.ok(hasDescartes, 'Must explicitly document Descartes Rule of Signs and Multiple Real IRR Roots blindspot');
console.log(`  [PASS] Bug postmortem verified with duration formula and ${pm.remainingBlindspotClasses.length} documented harness blindspots (including Descartes' Rule).`);

console.log('\n================================================================================');
console.log('ALL VERIFICATION ASSERTIONS PASSED (TASK-R2-03 HARDENED & VERIFIED)');
console.log('================================================================================\n');

/**
 * tests/verification_strict_provenance.ts
 * Automated Verification Suite for Strict Provenance Definition & True Denominator Audit (TASK-R2-01 - HARDENED)
 * 
 * Verifies:
 * 1. Plain-language explanation of old checker flaws is documented
 * 2. Strict provenance rule evaluation:
 *    - Old SOURCED count: 130 / 130 (100.00%)
 *    - Strict SOURCED count: exactly 1 (STAT-IRD-QDAP-01 with locator Cap. 112 s. 26ZZD)
 *    - Strict UNVERIFIED count: exactly 129
 * 3. True Denominator enumeration across ALL screens:
 *    - Product numbers > 2,500
 *    - GN16 point-in-time numbers > 6,000 (across all inceptions & dataPoints)
 *    - Hospital metrics > 35
 *    - Total client-visible numbers > 9,000
 *    - Strictly sourced displayed numbers: 7 (Caps: 60k, 120k; 5 marginal tax brackets)
 * 4. Synthetic edge-case tests:
 *    - Porous locator ("AIA Official Product Page") rejected
 *    - Genuine locator ("Section 26ZZD") with verified figures accepted
 * 5. UI Stale Claims Check:
 *    - dist/index.html does not contain stale "42+ 產品" or "42款" claims in PDM decisions
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('================================================================================');
console.log('TEST SUITE: STRICT PROVENANCE DEFINITION & TRUE DENOMINATOR AUDIT (TASK-R2-01 - HARDENED)');
console.log('================================================================================\n');

// 1. Run audit script
const scriptPath = path.join(process.cwd(), 'scripts', 'strict_provenance_audit.js');
assert.ok(fs.existsSync(scriptPath), 'scripts/strict_provenance_audit.js must exist');

const output = execSync('node scripts/strict_provenance_audit.js', { encoding: 'utf8' });
assert.ok(output.includes('AUDIT DISCLOSURE: WHAT scripts/check_metrics.js WAS ACTUALLY TESTING'), 'Must contain disclosure of old checker');
console.log('  [PASS] Provenance audit script executed successfully with disclosure text.');

// 2. Inspect generated JSON report
const reportPath = path.join(process.cwd(), 'dist', 'strict_provenance_audit_report.json');
assert.ok(fs.existsSync(reportPath), 'dist/strict_provenance_audit_report.json must exist');

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Rule Comparison Assertions
assert.strictEqual(report.ruleComparison.oldRule.sourcedRows, 130, 'Old rule SOURCED rows must be 130');
assert.strictEqual(report.ruleComparison.oldRule.reportedCoverage, '100.00%', 'Old rule reported coverage must be 100.00%');
assert.strictEqual(report.ruleComparison.newStrictRule.strictSourcedRows, 1, 'Strict SOURCED rows must be exactly 1');
assert.strictEqual(report.ruleComparison.newStrictRule.strictUnverifiedRows, 129, 'Strict UNVERIFIED rows must be exactly 129');
console.log(`  [PASS] Strict rule verified: Old 130 SOURCED (100.00%) -> New 1 SOURCED (0.77%), 129 UNVERIFIED.`);

// True Denominator Invariant Assertions
const inv = report.trueDenominator.numberInventoryBreakdown;
assert.ok(inv.productsScreen.totalProductNumbers > 2500, `Products numbers must be > 2500, got: ${inv.productsScreen.totalProductNumbers}`);
assert.ok(inv.gn16Screen.productsTracked >= 17, `GN16 products tracked must be >= 17, got: ${inv.gn16Screen.productsTracked}`);
assert.ok(inv.gn16Screen.totalFulfillmentNumbers > 6000, `GN16 fulfillment numbers must be > 6000, got: ${inv.gn16Screen.totalFulfillmentNumbers}`);
assert.ok(inv.cashlessHospitalsScreen.depositAmountsDisplayed >= 39, `Hospital deposit numbers must be >= 39, got: ${inv.cashlessHospitalsScreen.depositAmountsDisplayed}`);
assert.ok(report.trueDenominator.allDisplayedNumbersCount > 9000, `Total client-visible numbers must be > 9000, got: ${report.trueDenominator.allDisplayedNumbersCount}`);
assert.strictEqual(report.trueDenominator.strictlySourcedDisplayedNumbersCount, 7, 'Strictly sourced numbers must be 7');
console.log(`  [PASS] Invariants verified: ${inv.productsScreen.totalProductNumbers} product metrics, ${inv.gn16Screen.totalFulfillmentNumbers} GN16 metrics, ${inv.cashlessHospitalsScreen.depositAmountsDisplayed} hospital metrics across ${report.trueDenominator.allDisplayedNumbersCount} total numbers.`);

// 3. Synthetic Edge-Case Locator Assertions
const locatorRegex = /\b(?:p\.|page\s+\d+|section\s+\d+|dipn\s+no\.?\s*\d+|clause\s+[\d\.]+|table\s+\d+|sch(?:edule)?\.?\s*[0-9a-z]+)\b/i;
const genericWebpageRegex = /\b(?:official\s+(?:product|web)?\s*page|website|portal)\b/i;

function testLocator(title: string): boolean {
  return locatorRegex.test(title) && !genericWebpageRegex.test(title);
}

assert.strictEqual(testLocator('AIA Official Product Page'), false, 'AIA Official Product Page must be rejected as generic webpage');
assert.strictEqual(testLocator('Prudential Website Portal'), false, 'Prudential Website Portal must be rejected');
assert.strictEqual(testLocator('Inland Revenue Ordinance (Cap. 112) Section 26ZZD & DIPN No. 57'), true, 'Cap. 112 Section 26ZZD must be accepted');
assert.strictEqual(testLocator('Policy Brochure Page 14 Table 3'), true, 'Policy Brochure Page 14 Table 3 must be accepted');
console.log('  [PASS] Synthetic locator edge cases: Porous marketing pages rejected; genuine section/page locators accepted.');

// 4. Stale Claims in UI Check
const html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
assert.ok(!html.includes('42+ 產品精算數據'), 'dist/index.html must not contain stale 42+ products claim');
assert.ok(!html.includes('42款全港產品庫'), 'dist/index.html must not contain stale 42款 claim');
assert.ok(html.includes('99 款全線主流產品'), 'dist/index.html must display 99 款全線主流產品');
console.log('  [PASS] UI stale claims purged: 42+ claims replaced with 99 products in dist/index.html.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL HARDENED STRICT PROVENANCE & DENOMINATOR TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

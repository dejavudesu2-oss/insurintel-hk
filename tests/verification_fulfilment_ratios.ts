/**
 * tests/verification_fulfilment_ratios.ts
 * 
 * Automated Verification for Public Fulfilment Ratio Sourcing & Templates (TASK-R4-03 / P3)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';

console.log('================================================================================');
console.log('TEST SUITE: PUBLIC FULFILMENT RATIO SOURCING & TEMPLATES (TASK-R4-03 / P3)');
console.log('================================================================================\n');

const fulfilmentModule = require('../scripts/verify_fulfilment_ratios');
const fulfilmentDir = path.join(__dirname, '..', 'INTAKE', 'fulfilment');

// 1. Verify all 5 product templates exist
const expectedTemplates = [
  'AIA_GlobalPower3_fulfillment.csv',
  'PRU_Evergrowing_fulfillment.csv',
  'MANU_ManuGlobal_fulfillment.csv',
  'SUN_SunJoy_fulfillment.csv',
  'FWD_MaxFocus_fulfillment.csv'
];
assert.ok(
  !fs.existsSync(path.join(fulfilmentDir, 'PRU_EvergreenGrand_fulfillment.csv')),
  'Duplicate PRU_EvergreenGrand_fulfillment.csv must be removed (keeping PRU_Evergrowing_fulfillment.csv)'
);

expectedTemplates.forEach(t => {
  const p = path.join(fulfilmentDir, t);
  assert.ok(fs.existsSync(p), `Template must exist: ${t}`);
  const content = fs.readFileSync(p, 'utf8');
  assert.ok(content.includes('policy_year,calendar_year,product_name'), `${t} must contain standard CSV headers`);
  assert.ok(content.includes('SYNTHETIC'), `${t} unverified rows must be marked SYNTHETIC`);
  assert.ok(content.includes('https://'), `${t} must contain real official URLs`);
});
console.log('  [PASS] All 5 official insurer fulfilment templates verified with valid headers & SYNTHETIC status.');

// 2. Verify Master Template & Documentation
assert.ok(fs.existsSync(path.join(fulfilmentDir, 'TEMPLATE_fulfilment_ratio.csv')), 'Master template must exist');
assert.ok(fs.existsSync(path.join(fulfilmentDir, 'README.md')), 'Fulfilment README.md must exist');
const readmeContent = fs.readFileSync(path.join(fulfilmentDir, 'README.md'), 'utf8');
assert.ok(readmeContent.includes('GL16'), 'README must cite GL16');
assert.ok(readmeContent.includes('ia.org.hk'), 'README must list HKIA official directory');
assert.ok(readmeContent.includes('7 / 9,052'), 'README must state strict baseline 7 / 9,052');
console.log('  [PASS] Master template and 1-page owner fulfilment guide verified.');

// 3. Verify Before & After Strict Ratio Parity (Zero Invented Numbers)
assert.strictEqual(fulfilmentModule.beforeCount, 7, 'Baseline strict count must be exactly 7 statutory numbers');
assert.strictEqual(fulfilmentModule.afterCount, 7, 'Strict count after audit must remain 7 until verified owner input');
assert.strictEqual(fulfilmentModule.TOTAL_CLIENT_VISIBLE_NUMBERS, 9052, 'True denominator must be locked at 9,052');
assert.strictEqual(fulfilmentModule.beforePct, '0.08', 'Before percentage must be 0.08%');
assert.strictEqual(fulfilmentModule.afterPct, '0.08', 'After percentage must be 0.08%');
console.log('  [PASS] Strict sourced coverage before and after verified: exactly 7 / 9,052 (0.08%).');

console.log('\n================================================================================');
console.log('SUMMARY: ALL PUBLIC FULFILMENT RATIO ASSERTIONS PASSED (100% GREEN)');
console.log('================================================================================\n');

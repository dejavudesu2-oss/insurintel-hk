/**
 * tests/verification_import_honesty.ts
 * Automated Verification for Benefit Illustration Intake Honesty & Provenance Gating (TASK-R4-02 / P2)
 * 
 * Tests strictly with fictional sample rows only.
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';

console.log('================================================================================');
console.log('TEST SUITE: BENEFIT ILLUSTRATION INTAKE HONESTY & GATING (TASK-R4-02 / P2)');
console.log('================================================================================\n');

const intakeModule = require('../INTAKE/import_benefit_illustration');
const importBenefitIllustration = intakeModule.importBenefitIllustration;
const parseCSV = intakeModule.parseCSV;

// Create purely fictional test fixture
const fictionalDir = path.join(__dirname, 'fixtures');
if (!fs.existsSync(fictionalDir)) fs.mkdirSync(fictionalDir, { recursive: true });
const fictionalCsv = path.join(fictionalDir, 'fictional_honesty_test.csv');
const fictionalCsvContent = `policy_year,age,premium_paid,guaranteed_cash_value,projected_reversionary_bonus,projected_terminal_bonus,total_projected_cash_value
1,30,10000,0,0,0,0
2,31,10000,2000,0,0,2000
3,32,10000,8000,0,0,8000
4,33,10000,20000,0,0,20000
5,34,10000,35000,0,0,35000
6,35,0,45000,1000,6000,52000
10,39,0,57000,6000,23000,86000
20,49,0,85000,32000,105000,222000
30,59,0,120000,95000,410000,625000
`;
fs.writeFileSync(fictionalCsv, fictionalCsvContent, 'utf8');

// 1. Mandatory Field Enforcement
const requiredFields = ['document_title', 'version_date', 'page_number', 'table_name', 'entered_by', 'entry_date'];
const validOpts = {
  insurer: '虛擬示範保司 (Insurer Alpha)',
  product: '虛擬高息旗艦分紅方案 (Demo Alpha)',
  document_title: 'Fictional Demo Proposal 2026',
  version_date: '2026-01-01',
  page_number: 'Page 4',
  table_name: 'Table 1: Cash Values',
  entered_by: 'QA Auditor',
  entry_date: '2026-11-10'
};

for (const field of requiredFields) {
  const badOpts: any = { ...validOpts };
  delete badOpts[field];
  assert.throws(() => {
    importBenefitIllustration(fictionalCsv, badOpts);
  }, /PROVENANCE_GATING_ERROR/, `Missing '${field}' must throw PROVENANCE_GATING_ERROR`);
}
console.log('  [PASS] All 6 mandatory provenance fields strictly enforced.');

// 2. Status Gating: First pass must be TRANSCRIBED (Never SOURCED)
const res1 = importBenefitIllustration(fictionalCsv, validOpts);
assert.strictEqual(res1.status, 'TRANSCRIBED', 'Status must be TRANSCRIBED on first entry');
assert.notStrictEqual(res1.status, 'SOURCED', 'Status must NEVER be SOURCED automatically');
assert.notStrictEqual(res1.status, 'SOURCED-STRICT', 'Status cannot be SOURCED-STRICT without second pass');
assert.ok(res1.coverageRatioString.includes('/ 9052'), 'Coverage must be reported out of 9052');
assert.ok(!res1.coverageRatioString.includes('100%'), 'Must NOT claim 100% coverage');
console.log('  [PASS] First-pass status verified: TRANSCRIBED, zero automatic SOURCED, coverage reported out of 9,052.');

// 3. GL28 Limit Text and Section Verification
assert.ok(res1.gl28CitationNote.includes('GL28 第 5 節') || res1.gl28CitationNote.includes('GL28 Section 5'), 'Must cite GL28 Section 5');
assert.ok(res1.gl28CitationNote.includes('5.3') || res1.gl28CitationNote.includes('Paragraph 5.3'), 'Must cite GL28 Paragraph 5.3');
assert.ok(res1.gl28CitationNote.includes('實務指引') || res1.gl28CitationNote.includes('Practice Note'), 'Must cite Practice Note on Illustration Rate Caps');
console.log('  [PASS] GL28 Section 5, Paragraph 5.3 & Practice Note on Illustration Rate Caps explicitly verified.');

// 4. Double Entry Mismatch Rejection
const fictionalMismatchCsv = path.join(fictionalDir, 'fictional_mismatch.csv');
const mismatchContent = fictionalCsvContent.replace('35000,0,0,35000', '34999,0,0,34999');
fs.writeFileSync(fictionalMismatchCsv, mismatchContent, 'utf8');

assert.throws(() => {
  importBenefitIllustration(fictionalCsv, {
    ...validOpts,
    verifier: {
      method: 'double_entry',
      pass2CsvPath: fictionalMismatchCsv
    }
  });
}, /DOUBLE_ENTRY_MISMATCH/, 'Double entry discrepancy must throw DOUBLE_ENTRY_MISMATCH');
console.log('  [PASS] Double entry mismatch correctly rejected.');

// 5. Successful Double Entry Verification -> Promoted to SOURCED-STRICT
const resStrict = importBenefitIllustration(fictionalCsv, {
  ...validOpts,
  verifier: {
    method: 'double_entry',
    pass2CsvPath: fictionalCsv // Identical file matches 100%
  }
});
assert.strictEqual(resStrict.status, 'SOURCED-STRICT', 'Identical double pass must promote to SOURCED-STRICT');
assert.ok(resStrict.strictSourcedNumbersCount > 0, 'Must record strictly sourced numbers');
assert.ok(!resStrict.coverageRatioString.includes('100%'), 'Must not claim 100%');
console.log(`  [PASS] Double entry promotion to SOURCED-STRICT verified (${resStrict.coverageRatioString}).`);

// Clean up fixtures and golden test
fs.unlinkSync(fictionalCsv);
fs.unlinkSync(fictionalMismatchCsv);
if (fs.existsSync(res1.goldenTestPath)) fs.unlinkSync(res1.goldenTestPath);

// Clean up DATA_PROVENANCE.csv test rows
const provPath = path.join(process.cwd(), 'DATA_PROVENANCE.csv');
const provLines = fs.readFileSync(provPath, 'utf8').split('\n').filter(l => !l.includes('Demo Alpha'));
fs.writeFileSync(provPath, provLines.join('\n'), 'utf8');

console.log('\n================================================================================');
console.log('SUMMARY: ALL BENEFIT ILLUSTRATION INTAKE HONESTY TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

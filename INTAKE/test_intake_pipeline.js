/**
 * INTAKE/test_intake_pipeline.js
 * Automated Verification of the Official Benefit Illustration Intake & Golden Test Pipeline
 * Strictly updated for Run 4 / P2 Honesty Rules:
 * - Never writes SOURCED automatically.
 * - Uses TRANSCRIBED and SOURCED-STRICT.
 * - Enforces 6 mandatory provenance fields.
 * - Zero "100%" coverage claims (reports x / 9,052).
 */

const fs = require('fs');
const path = require('path');
const { strict: assert } = require('assert');
const { execSync } = require('child_process');
const { importBenefitIllustration } = require('./import_benefit_illustration');

console.log('================================================================================');
console.log('TESTING BENEFIT ILLUSTRATION INTAKE PIPELINE (RUN 4 / P2 HONESTY)');
console.log('================================================================================\n');

// 1. Create a fictional test proposal CSV
const fictionalProposalPath = path.join(__dirname, 'fictional_demo_proposal.csv');
const fictionalCsvContent = `policy_year,age,premium_paid,guaranteed_cash_value,projected_reversionary_bonus,projected_terminal_bonus,total_projected_cash_value
1,30,10000,0,0,0,0
2,31,10000,2000,0,0,2000
3,32,10000,8000,0,0,8000
4,33,10000,20000,0,0,20000
5,34,10000,35000,0,0,35000
6,35,0,45000,1000,6000,52000
7,36,0,48000,2000,9000,59000
8,37,0,51000,3200,12800,67000
9,38,0,54000,4500,17500,76000
10,39,0,57000,6000,23000,86000
15,44,0,70000,16000,50000,136000
20,49,0,85000,32000,105000,222000
25,54,0,100000,56000,210000,366000
30,59,0,120000,95000,410000,625000
`;

fs.writeFileSync(fictionalProposalPath, fictionalCsvContent, 'utf8');
console.log('  [PASS] Created sample fictional benefit illustration CSV.');

// 2. Test Provenance Gating: Omission of required fields must throw error
assert.throws(() => {
  importBenefitIllustration(fictionalProposalPath, {
    insurer: '虛擬示範保司 (Insurer Alpha)',
    product: '虛擬高息旗艦分紅方案 (Demo Alpha)'
    // Missing required metadata fields
  });
}, /PROVENANCE_GATING_ERROR/, 'Omitting required provenance metadata must throw PROVENANCE_GATING_ERROR');
console.log('  [PASS] Provenance gating verified: ingestion blocked when required fields are missing.');

// 3. Run initial intake: Status MUST be TRANSCRIBED (never automatic SOURCED)
const resultTranscribed = importBenefitIllustration(fictionalProposalPath, {
  insurer: '虛擬示範保司 (Insurer Alpha)',
  product: '虛擬高息旗艦分紅方案 (Demo Alpha)',
  category: 'Savings_MultiCurrency',
  document_title: 'Demo Alpha Official Benefit Illustration 2026',
  version_date: '2026-01-01',
  page_number: 'Page 5 of 14',
  table_name: 'Table 2: Surrender Values and Projected Benefits',
  entered_by: 'QA Test Auditor / John Doe',
  entry_date: '2026-11-10'
});

assert.strictEqual(resultTranscribed.status, 'TRANSCRIBED', 'Initial intake status must be TRANSCRIBED');
assert.ok(resultTranscribed.coverageRatioString.includes('/ 9052'), 'Coverage must be reported out of 9,052');
assert.ok(!resultTranscribed.coverageRatioString.includes('100%'), 'Must NOT claim 100% coverage');
console.log(`  [PASS] First pass verified: Status is TRANSCRIBED, coverage reported as ${resultTranscribed.coverageRatioString}.`);

// 4. Test Second-Pass Double Entry Verification -> Promotes to SOURCED-STRICT
const fictionalPass2Path = path.join(__dirname, 'fictional_demo_proposal_pass2.csv');
fs.writeFileSync(fictionalPass2Path, fictionalCsvContent, 'utf8');

const resultStrict = importBenefitIllustration(fictionalProposalPath, {
  insurer: '虛擬示範保司 (Insurer Alpha)',
  product: '虛擬高息旗艦分紅方案 (Demo Alpha)',
  category: 'Savings_MultiCurrency',
  document_title: 'Demo Alpha Official Benefit Illustration 2026',
  version_date: '2026-01-01',
  page_number: 'Page 5 of 14',
  table_name: 'Table 2: Surrender Values and Projected Benefits',
  entered_by: 'QA Test Auditor / Second Pass',
  entry_date: '2026-11-10',
  verifier: {
    method: 'double_entry',
    pass2CsvPath: fictionalPass2Path
  }
});

assert.strictEqual(resultStrict.status, 'SOURCED-STRICT', 'Verified double-entry must promote status to SOURCED-STRICT');
assert.ok(resultStrict.strictSourcedNumbersCount > 0, 'Strict sourced numbers count must be positive');
console.log(`  [PASS] Double entry verification verified: Status promoted to SOURCED-STRICT (${resultStrict.coverageRatioString}).`);

// 5. Verify Golden Test Execution
assert.ok(fs.existsSync(resultStrict.goldenTestPath), `Golden test file must exist: ${resultStrict.goldenTestPath}`);
const tsxOutput = execSync(`npx tsx "${resultStrict.goldenTestPath}"`, { encoding: 'utf8' });
assert.ok(tsxOutput.includes('All Golden Assertions'), 'Golden test must execute and pass cleanly under tsx');
console.log(`  [PASS] Generated golden test executed cleanly with 0 failures under npx tsx.`);

// 6. Clean up temporary fictional files
fs.unlinkSync(fictionalProposalPath);
fs.unlinkSync(fictionalPass2Path);
fs.unlinkSync(resultStrict.goldenTestPath);

// Remove temporary row from DATA_PROVENANCE.csv
const provContent = fs.readFileSync('DATA_PROVENANCE.csv', 'utf8');
const cleanedProv = provContent.split('\n').filter(l => !l.includes(resultStrict.recordId) && !l.includes(resultTranscribed.recordId)).join('\n');
fs.writeFileSync('DATA_PROVENANCE.csv', cleanedProv, 'utf8');
console.log('  [PASS] Temporary intake test fixtures cleaned up.');

console.log('\n================================================================================');
console.log('BENEFIT ILLUSTRATION INTAKE PIPELINE TEST PASSED FULLY (100% GREEN)');
console.log('================================================================================\n');

/**
 * INTAKE/test_intake_pipeline.js
 * Automated Verification of the Official Benefit Illustration Intake & Golden Test Pipeline
 */

const fs = require('fs');
const path = require('path');
const { strict: assert } = require('assert');
const { execSync } = require('child_process');
const { importBenefitIllustration } = require('./import_benefit_illustration');

console.log('================================================================================');
console.log('TESTING BENEFIT ILLUSTRATION INTAKE PIPELINE & GOLDEN TEST GENERATION');
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

// 2. Run intake script
const result = importBenefitIllustration(fictionalProposalPath, {
  insurer: '虛擬示範保司 (Insurer Alpha)',
  product: '虛擬高息旗艦分紅方案 (Demo Alpha)',
  category: 'Savings_MultiCurrency',
  docTitle: 'Demo Alpha Official Benefit Illustration 2026',
  pubDate: '2026-01-01'
});

assert.ok(result.recordId, 'Record ID must be returned');
assert.strictEqual(result.projBreakevenYear, 6, 'Projected breakeven must be policy year 6 (52,000 >= 50,000)');
assert.strictEqual(result.guarBreakevenYear, 8, 'Guaranteed breakeven must be policy year 8 (51,000 >= 50,000)');
assert.ok(result.projIrr30 > 5.0, `Projected 30Y IRR must be > 5.0%, got ${result.projIrr30}%`);
assert.ok(result.guarIrr30 > 1.0, `Guaranteed 30Y IRR must be > 1.0%, got ${result.guarIrr30}%`);
console.log(`  [PASS] Actuarial math verified: Guar BE Yr ${result.guarBreakevenYear}, Proj BE Yr ${result.projBreakevenYear}, 30Y Proj IRR ${result.projIrr30}%.`);

// 3. Verify Golden Test was generated and passes under tsx execution
assert.ok(fs.existsSync(result.goldenTestPath), `Golden test file must exist: ${result.goldenTestPath}`);
console.log(`  [PASS] Golden unit test generated at ${result.goldenTestPath}`);

const tsxOutput = execSync(`npx tsx "${result.goldenTestPath}"`, { encoding: 'utf8' });
assert.ok(tsxOutput.includes('All Golden Assertions'), 'Golden test must execute and pass cleanly under tsx');
console.log(`  [PASS] Generated golden test executed cleanly with 0 failures under npx tsx.`);

// 4. Verify DATA_PROVENANCE.csv was updated
const provContent = fs.readFileSync('DATA_PROVENANCE.csv', 'utf8');
assert.ok(provContent.includes(result.recordId), `DATA_PROVENANCE.csv must include ${result.recordId}`);
assert.ok(provContent.includes('虛擬高息旗艦分紅方案 (Demo Alpha)'), 'DATA_PROVENANCE.csv must include product name');
assert.ok(provContent.includes('SOURCED'), 'Record must be marked as SOURCED');
assert.ok(provContent.includes('100%'), 'Record must have 100% source coverage');
console.log(`  [PASS] DATA_PROVENANCE.csv verified: record ${result.recordId} added with status SOURCED (100% Coverage).`);

// Clean up temporary fictional files
fs.unlinkSync(fictionalProposalPath);
fs.unlinkSync(result.goldenTestPath);

// Remove temporary row from DATA_PROVENANCE.csv
const cleanedProv = provContent.split('\n').filter(l => !l.includes(result.recordId)).join('\n');
fs.writeFileSync('DATA_PROVENANCE.csv', cleanedProv, 'utf8');
console.log('  [PASS] Temporary intake test fixtures cleaned up.');

console.log('\n================================================================================');
console.log('BENEFIT ILLUSTRATION INTAKE PIPELINE TEST PASSED FULLY (100% GREEN)');
console.log('================================================================================\n');

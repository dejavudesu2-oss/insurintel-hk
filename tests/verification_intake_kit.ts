/**
 * tests/verification_intake_kit.ts
 * Automated Verification Suite for Benefit Illustration Intake Kit & Human Handoff (TASK-R3-04)
 * 
 * Verifies:
 * 1. INTAKE/TEMPLATE_benefit_illustration.csv exists with exact 7 columns.
 * 2. INTERVIEW_LOG.csv exists with exact 8 columns and is ready for 10 interviews.
 * 3. INTAKE/README.md exists, <= 1 page (<= 3,500 chars), with clear 1-page owner instructions.
 * 4. INTAKE/import_benefit_illustration.js exists and its test pipeline verifies end-to-end.
 * 5. HANDOFF.md exists at root, <= 1 page (<= 5,000 chars), with strictly required 4 sections:
 *    - 1. CURRENT TRUTH
 *    - 2. WHAT IS BLOCKED ON ME
 *    - 3. DECISIONS STILL NEEDED
 *    - 4. HOW TO CONTINUE
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('================================================================================');
console.log('TEST SUITE: REAL DATA INTAKE KIT, INTERVIEW LOG & TERMINAL HANDOFF (TASK-R3-04)');
console.log('================================================================================\n');

// 1. Verify INTAKE/TEMPLATE_benefit_illustration.csv
const templatePath = path.join(process.cwd(), 'INTAKE', 'TEMPLATE_benefit_illustration.csv');
assert.ok(fs.existsSync(templatePath), 'INTAKE/TEMPLATE_benefit_illustration.csv must exist');
const templateContent = fs.readFileSync(templatePath, 'utf8').trim();
const templateLines = templateContent.split('\n').map(l => l.trim()).filter(Boolean);
const expectedTemplateHeaders = [
  'policy_year',
  'age',
  'premium_paid',
  'guaranteed_cash_value',
  'projected_reversionary_bonus',
  'projected_terminal_bonus',
  'total_projected_cash_value'
];
assert.deepStrictEqual(templateLines[0].split(','), expectedTemplateHeaders, 'TEMPLATE_benefit_illustration.csv header must match exactly 7 columns');
assert.ok(templateLines.length >= 2, 'TEMPLATE_benefit_illustration.csv must have example filled rows');
console.log('  [PASS] INTAKE/TEMPLATE_benefit_illustration.csv verified: exact 7 columns with sample illustration data.');

// 2. Verify INTERVIEW_LOG.csv
const interviewLogPath = path.join(process.cwd(), 'INTERVIEW_LOG.csv');
assert.ok(fs.existsSync(interviewLogPath), 'INTERVIEW_LOG.csv must exist in workspace root');
const interviewLogContent = fs.readFileSync(interviewLogPath, 'utf8').trim();
const interviewLogLines = interviewLogContent.split('\n').map(l => l.trim()).filter(Boolean);
const expectedInterviewHeaders = [
  'agent_id',
  'agency_tier',
  'interview_date',
  'current_comparison_method',
  'last_case_pain_point',
  'would_pay_launch_offer',
  'objection',
  'notes'
];
assert.deepStrictEqual(interviewLogLines[0].split(','), expectedInterviewHeaders, 'INTERVIEW_LOG.csv header must match exact 8 columns');
assert.ok(interviewLogLines.length >= 1, 'INTERVIEW_LOG.csv must exist with valid header');
for (let i = 1; i < interviewLogLines.length; i++) {
  const cols = interviewLogLines[i].split(',');
  assert.strictEqual(cols.length, 8, `Row ${i} in INTERVIEW_LOG.csv must have exactly 8 columns`);
}
console.log(`  [PASS] INTERVIEW_LOG.csv verified: exact 8 columns, ready for 10-agent validation (${interviewLogLines.length - 1} records logged).`);

// 3. Verify INTAKE/README.md
const readmePath = path.join(process.cwd(), 'INTAKE', 'README.md');
assert.ok(fs.existsSync(readmePath), 'INTAKE/README.md must exist');
const readmeContent = fs.readFileSync(readmePath, 'utf8');
assert.ok(readmeContent.length <= 3500, `INTAKE/README.md must be <= 1 page (<= 3,500 chars, got ${readmeContent.length})`);
assert.ok(readmeContent.includes('node INTAKE/import_benefit_illustration.js'), 'Must contain exact CLI command');
assert.ok(readmeContent.includes('policy_year') && readmeContent.includes('total_projected_cash_value'), 'Must detail column structure');
console.log(`  [PASS] INTAKE/README.md verified: compact 1-page owner guide (${readmeContent.length} chars).`);

// 4. Verify INTAKE/import_benefit_illustration.js and test pipeline
const importScriptPath = path.join(process.cwd(), 'INTAKE', 'import_benefit_illustration.js');
assert.ok(fs.existsSync(importScriptPath), 'INTAKE/import_benefit_illustration.js must exist');
const pipelineTestPath = path.join(process.cwd(), 'INTAKE', 'test_intake_pipeline.js');
assert.ok(fs.existsSync(pipelineTestPath), 'INTAKE/test_intake_pipeline.js must exist');

const testOutput = execSync('node INTAKE/test_intake_pipeline.js', { encoding: 'utf8' });
assert.ok(testOutput.includes('BENEFIT ILLUSTRATION INTAKE PIPELINE TEST PASSED FULLY'), 'Intake pipeline test must pass 100%');
console.log('  [PASS] INTAKE/import_benefit_illustration.js pipeline verified end-to-end with automated golden test creation.');

// 5. Verify HANDOFF.md structure and character limit
const handoffPath = path.join(process.cwd(), 'HANDOFF.md');
assert.ok(fs.existsSync(handoffPath), 'HANDOFF.md must exist in root');
const handoffContent = fs.readFileSync(handoffPath, 'utf8');
assert.ok(handoffContent.length <= 5000, `HANDOFF.md must be strictly <= 5,000 characters (got ${handoffContent.length})`);
assert.ok(handoffContent.includes('CURRENT TRUTH'), 'HANDOFF.md must contain "CURRENT TRUTH"');
assert.ok(handoffContent.includes('WHAT IS BLOCKED ON ME'), 'HANDOFF.md must contain "WHAT IS BLOCKED ON ME"');
assert.ok(handoffContent.includes('DECISIONS STILL NEEDED'), 'HANDOFF.md must contain "DECISIONS STILL NEEDED"');
assert.ok(handoffContent.includes('HOW TO CONTINUE'), 'HANDOFF.md must contain "HOW TO CONTINUE"');
console.log(`  [PASS] HANDOFF.md verified: strictly <= 5,000 characters (${handoffContent.length} chars) with all 4 required sections.`);

console.log('\n================================================================================');
console.log('TASK-R3-04 VERIFICATION COMPLETE: ALL ASSERTIONS PASSED (100% GREEN)');
console.log('================================================================================\n');

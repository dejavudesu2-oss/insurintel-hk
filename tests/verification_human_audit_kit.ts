/**
 * tests/verification_human_audit_kit.ts
 * Automated Verification Suite for Human Audit Kit & UI Illustrative Watermark (TASK-R2-02 - HARDENED)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

console.log('================================================================================');
console.log('TEST SUITE: HUMAN AUDIT KIT & UI ILLUSTRATIVE WATERMARK (TASK-R2-02 - HARDENED)');
console.log('================================================================================\n');

// 1. Run generate_human_audit_kit.js
const scriptPath = path.join(process.cwd(), 'scripts', 'generate_human_audit_kit.js');
assert.ok(fs.existsSync(scriptPath), 'scripts/generate_human_audit_kit.js must exist');

const scriptOutput = execSync('node scripts/generate_human_audit_kit.js', { encoding: 'utf8' });
console.log('  [PASS] generate_human_audit_kit.js executed with exit code 0.');
assert.ok(scriptOutput.includes('seed 20261109'), 'Script output must report seed 20261109');

// 2. Validate HUMAN_AUDIT_KIT.md structure & content
const kitPath = path.join(process.cwd(), 'HUMAN_AUDIT_KIT.md');
assert.ok(fs.existsSync(kitPath), 'HUMAN_AUDIT_KIT.md must exist');

const kitContent = fs.readFileSync(kitPath, 'utf8');
assert.ok(kitContent.includes('20261109'), 'Must state deterministic random seed 20261109');
assert.ok(kitContent.includes('15 Rows out of 130 Records'), 'Must specify 15 sample rows');

const sampleRows = kitContent.split('\n').filter(l => l.trim().startsWith('| **') && l.includes('[ ] MATCH'));
assert.strictEqual(sampleRows.length, 15, `Must have exactly 15 sampled audit rows, found: ${sampleRows.length}`);
console.log(`  [PASS] Verified 15 sampled audit rows in HUMAN_AUDIT_KIT.md.`);

// Check required fields in each sampled row
sampleRows.forEach((row, idx) => {
  assert.ok(row.includes('[ ] MATCH (原件一致)') && row.includes('[ ] MISMATCH (相左或缺載)'), `Row ${idx + 1} must have detailed checklist criteria`);
  assert.ok(row.includes('http'), `Row ${idx + 1} must contain a URL link`);
  assert.ok(row.includes('【'), `Row ${idx + 1} must specify screen path`);
  // Ensure no dummy 'Rebate: N/A%' in product rows
  if (row.includes('`CI-') || row.includes('`VHIS-') || row.includes('`QDAP-') || row.includes('`UL-')) {
    assert.ok(!row.includes('Rebate: N/A%'), `Row ${idx + 1} must not contain raw dummy string 'Rebate: N/A%'`);
  }
});
console.log('  [PASS] All 15 rows contain required audit fields, URLs, screen paths, real figures, and checkboxes.');

// Validate dynamic summary consistency
const sourcedMatch = kitContent.match(/抽樣集中嚴格 SOURCED 數量\*\*:\s*(\d+)\s*筆/);
const unverifiedMatch = kitContent.match(/抽樣集中嚴格 UNVERIFIED \(示範性質\) 數量\*\*:\s*(\d+)\s*筆/);
assert.ok(sourcedMatch && unverifiedMatch, 'Summary must dynamically report sourced and unverified counts');
assert.strictEqual(Number(sourcedMatch[1]) + Number(unverifiedMatch[1]), 15, 'Sample counts must sum to 15');
assert.ok(kitContent.includes('全庫總體溯源真實情況 (130 筆)'), 'Must document full population provenance');

// Validate formal human sign-off block
assert.ok(kitContent.includes('## 審計員簽署與最終裁定 (Auditor Sign-off & Verdict)'), 'Must contain auditor sign-off block');
assert.ok(kitContent.includes('裁定標準 (Decision Rule)'), 'Must specify decision rule for sign-off');
console.log('  [PASS] Human Audit Kit summary is dynamically consistent and contains sign-off block.');

// 3. Validate UI Illustrative Watermark & Disclaimers in dist/index.html
const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert.ok(htmlContent.includes('id="agent-illustrative-watermark"'), 'Must contain agent illustrative watermark element');
assert.ok(htmlContent.includes('id="client-illustrative-watermark"'), 'Must contain client illustrative watermark banner');
assert.ok(htmlContent.includes('Illustrative - not from an official illustration'), 'Must contain statutory illustrative warning string');

// Check that bilateral spec table has footer warning
assert.ok(htmlContent.includes('⚠️ 利益數值：<span style="font-family:\'JetBrains Mono\',monospace;font-weight:600;">Illustrative - not from an official illustration</span>'), 'Bilateral spec table must contain illustrative footer');

// Check scenario medical & gn16 query modal & catalog drawer watermarks
assert.ok(htmlContent.includes('醫院保證金與直付條款摘自衛生署名單及市場通函，非保司正式利益說明書'), 'Scenario medical panel must disclose illustrative status');
assert.ok(htmlContent.includes('實現率摘自保監局歷史通函存檔，本模擬試算非官方利益說明書認證'), 'GN16 query modal must disclose illustrative status');
assert.ok(htmlContent.includes('規格與回贈摘自公開宣傳單張，非官方利益說明書認證'), 'Catalog drawer must disclose illustrative status');
console.log('  [PASS] UI contains agent watermark, client banner, spec table, scenario medical, GN16, and catalog warnings.');

// 4. Negative assertions against misleading compliance claims
assert.ok(!htmlContent.includes('依據官方利益說明書'), 'UI must not claim figures are based on official illustration');
assert.ok(!htmlContent.includes('官方認證對賬'), 'UI must not claim unverified reconciliation is officially certified');
assert.ok(!htmlContent.includes('100% 徹底無浮水印'), 'UI must not offer paying to strip statutory watermark');
console.log('  [PASS] Negative checks passed: Zero misleading official illustration or certified claims.');

// 5. Validate SHA-256 parity across all 3 HTML files
const files = ['templates/mobile_cafe_app.html', 'dist/index.html', 'dist/cafe.html'];
const hashes = files.map(f => crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), f))).digest('hex'));

assert.strictEqual(hashes[0], hashes[1], 'templates/mobile_cafe_app.html and dist/index.html must match byte-for-byte');
assert.strictEqual(hashes[1], hashes[2], 'dist/index.html and dist/cafe.html must match byte-for-byte');
console.log(`  [PASS] SHA-256 parity verified across all 3 HTML files: ${hashes[0]}`);

console.log('\n================================================================================');
console.log('ALL VERIFICATION ASSERTIONS PASSED (TASK-R2-02 HARDENED & VERIFIED)');
console.log('================================================================================\n');

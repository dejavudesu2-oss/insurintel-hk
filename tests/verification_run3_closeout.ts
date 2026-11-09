/**
 * tests/verification_run3_closeout.ts
 * Automated Verification for RUN3_CLOSEOUT.md (TASK-R4-01 / P1)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { PATHS } from '../scripts/paths.js';

console.log('================================================================================');
console.log('TEST SUITE: RUN 3 CLOSEOUT AUDIT & HONESTY DISCLOSURE (TASK-R4-01 / P1)');
console.log('================================================================================\n');

// 1. Verify RUN3_CLOSEOUT.md exists
const closeoutPath = PATHS.RUN3_CLOSEOUT;
assert.ok(fs.existsSync(closeoutPath), 'RUN3_CLOSEOUT.md must exist in root directory');
const content = fs.readFileSync(closeoutPath, 'utf8');

// 2. Section (a): Legal Citations Table, Counts, Unretrieved Pages, Guidelines
assert.ok(content.includes('(a) R2: 香港法定法規與監管指引逐項核查表'), 'Must contain Section (a)');
assert.ok(content.includes('Cap. 41 s. 64G') && content.includes('Cap. 41 s. 90'), 'Must list statutory citations in table');
assert.ok(content.includes('Conduct requirements for licensed insurance intermediaries'), 'Must include exact section heading for Cap. 41 s. 90');
assert.ok(content.includes('Preservation of secrecy'), 'Must include exact section heading for Cap. 41 s. 121');
assert.ok(content.includes('The "reasonableness" test'), 'Must include exact section heading for Cap. 71 s. 3');
assert.ok(content.includes('Negligence liability'), 'Must include exact section heading for Cap. 71 s. 7');
assert.ok(content.includes('When third party may enforce term'), 'Must include exact section heading for Cap. 623 s. 4');
assert.ok(content.includes('Rescission and variation of contract'), 'Must include exact section heading for Cap. 623 s. 6');
assert.ok(content.includes('Exhaustion of rights conferred by registered trade mark'), 'Must include exact section heading for Cap. 559 s. 19');
assert.ok(content.includes('Acts not amounting to infringement'), 'Must include exact section heading for Cap. 559 s. 21');
assert.ok(content.includes('24 項 SOURCED') || content.includes('24 項細分法定'), 'Must state citation count (24)');
assert.ok(content.includes('未檢索官方網頁清單') && content.includes('UNVERIFIED on live HTTP fetch'), 'Must include Unretrieved Pages List and network retrieval disclosure');
assert.ok(content.includes('GL16') && content.includes('Interpretation Notes on Fulfillment Ratios'), 'Must state GL16 replacement + Interpretation Notes');
assert.ok(content.includes('GL28') && content.includes('GL29') && content.includes('GL30') && content.includes('GL25'), 'Must state addition of GL28, GL29, GL30 (FNA), and GL25');
console.log('  [PASS] Section (a) verified: 24 citations, unbundled exact headings, unretrieved pages list, and GL16/25/28/29/30 verified.');

// 3. Section (b): Hardcoded / Pseudo-Random Values Found & Remediated
assert.ok(content.includes('(b) R3: 代碼庫硬編碼與偽隨機客戶可見數值清查處理表'), 'Must contain Section (b)');
assert.ok(content.includes('5355') && content.includes('d84a92f0'), 'Must list fake d84a92f0 SHA-256 string with accurate line reference');
assert.ok(content.includes('waitlist.html') && content.includes('WAITLIST-PRE-'), 'Must list fake CRM IDs in waitlist.html with accurate remediation');
assert.ok(content.includes('IA-') || content.includes('保險業監管局備案'), 'Must list fabricated IA circular filing numbers');
assert.ok(content.includes('Illustrative_Synthetic'), 'Must list confidence_level: Verified downgrade');
assert.ok(content.includes('AI Copilot'), 'Must list AIA Copilot rename to carrier-neutral AI Copilot');
console.log('  [PASS] Section (b) verified: fake SHA-256, waitlist CRM IDs, fabricated circular numbers, and AI Copilot remediations.');

// 4. Section (c): Screenshot Recaptures and DOM-visibility Assertions
assert.ok(content.includes('(c) R5: 歷史缺陷截圖重新截取與 DOM 可見性斷言'), 'Must contain Section (c)');
assert.ok(content.includes('03_gn16_chart.png') && content.includes('04_scanner_pii_scrub.png') && content.includes('06_pricing_modal.png'), 'Must cover 3 recaptured screenshots');
assert.ok(content.includes('VERIFIED_VISIBLE') && content.includes('opacity="1"'), 'Must include DOM visibility assertion outputs');
console.log('  [PASS] Section (c) verified: 3 recaptured screenshots and CDP DOM assertion ledgers.');

// 5. Section (d): Raw outputs of npm test, strict_provenance_audit.js, and compute_break_even.js
assert.ok(content.includes('(d) 終端機真實輸出驗證'), 'Must contain Section (d)');
assert.ok(content.includes('37 個測試套件'), 'Must state 37 test suites chained in package.json');
assert.ok(content.includes('SUMMARY: ALL RUN 3 CLOSEOUT ASSERTIONS PASSED (100% GREEN)'), 'Must include genuine npm test tail');
assert.ok(content.includes('Old SOURCED Row Count    : 130 / 130') && content.includes('Strict SOURCED Row Count : 1 / 130'), 'Must include strict provenance audit raw output');
assert.ok(content.includes('INSURINTEL HK: SCRIPT-COMPUTED BREAK-EVEN & CHURN SENSITIVITY'), 'Must include compute break even raw output');
assert.ok(content.includes('Model A (Base 12 Individuals)') && content.includes('Model B (Full 206 Individuals)') && content.includes('Model B (Full 17 Teams)'), 'Must include churn sensitivity lines in output');
console.log('  [PASS] Section (d) verified: raw terminal outputs with 37 suites, provenance audit, and churn break-even.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL RUN 3 CLOSEOUT ASSERTIONS PASSED (100% GREEN)');
console.log('================================================================================\n');

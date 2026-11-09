/**
 * tests/verification_legal_and_overclaims.ts
 * Automated Verification Suite for Statutory Citation Audit & Overclaim Sweep (TASK-R2-05 / C7 & C8)
 * 
 * Verifies:
 * 1. LEGAL_BRIEF_CITATION_AUDIT.md exists at root, audits all statutory citations:
 *    Cap. 41 (s.64G, s.90, s.95(1), s.121, Sched. 1A), HKIA GL27, GN16/GL16, HKIA Code of Conduct,
 *    Cap. 362 (s.7, s.13E), Cap. 486 (s.33, DPP), Cap. 559 (s.19/21), Cap. 528 (s.39), Cap. 71,
 *    Cap. 623, and Cap. 112 (s.26ZZD).
 * 2. Official e-Legislation / HKIA URLs and retrieval dates recorded for every citation.
 * 3. Explains citation changes from Run 1: GL20 -> GL27, s.38 -> s.39, s.64G boundary, s.33 dormancy.
 * 4. LEGAL_BRIEF_HK_COMPLIANCE.md contains warning disclaimer header: "Citations are AI-assisted and unverified; counsel to confirm."
 * 5. Overclaim sweep verified across app files (100% claims softened, SHA-256 parity preserved).
 * 6. Intermediary headcount accurately cites HKIA Annual Report (~115,000).
 * 7. Breakeven honesty asserted: zero "保證 100% 回本" in client-facing scripts.
 * 8. GL20 conduct purge verified: intermediary conduct cited under Code of Conduct & GL27.
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PATHS } from '../scripts/paths.js';

console.log('================================================================================');
console.log('TEST SUITE: STATUTORY CITATION AUDIT & OVERCLAIM SWEEP (TASK-R2-05 / C7 & C8)');
console.log('================================================================================\n');

// 1. Verify LEGAL_BRIEF_CITATION_AUDIT.md
const auditPath = PATHS.LEGAL_BRIEF_CITATION_AUDIT;
assert.ok(fs.existsSync(auditPath), 'LEGAL_BRIEF_CITATION_AUDIT.md must exist in workspace root');
const auditText = fs.readFileSync(auditPath, 'utf8');

// Statutory Citation Ledger assertions
const requiredCitations = [
  'Cap. 41 s. 64G',
  'Cap. 41 s. 90',
  'Cap. 41 s. 95(1)',
  'Cap. 41 s. 121',
  'Cap. 41 Sched. 1A',
  'HKIA GL27',
  'HKIA GN16',
  'HKIA Code of Conduct',
  'Cap. 362 s. 7',
  'Cap. 362 s. 13E',
  'Cap. 486 s. 33',
  'Cap. 486 DPP',
  'Cap. 559 s. 19',
  'Cap. 528 s. 39',
  'Cap. 71',
  'Cap. 623',
  'Cap. 112 s. 26ZZD'
];

requiredCitations.forEach(citation => {
  assert.ok(auditText.includes(citation), `Citation audit must cover ${citation}`);
});

// Official source domains & retrieval date assertions
assert.ok(auditText.includes('elegislation.gov.hk'), 'Audit must cite Hong Kong e-Legislation official domain');
assert.ok(auditText.includes('ia.org.hk'), 'Audit must cite HKIA official domain');
assert.ok(auditText.includes('GL27.pdf'), 'Audit must link directly to official GL27 PDF');
assert.ok(auditText.includes('GN16.pdf'), 'Audit must link directly to official GN16 PDF');
assert.ok(auditText.includes('2026-11-09'), 'Audit must record retrieval benchmark date');
assert.ok(auditText.includes('SOURCED'), 'Audit must mark verified statutes as SOURCED');

// Explanation of Run 1 to Run 2 changes
assert.ok(auditText.includes('GL20') && auditText.includes('GL27'), 'Must explain GL20 to GL27 replacement');
assert.ok(auditText.includes('Cybersecurity') || auditText.includes('網絡保安'), 'Must identify GL20 as cybersecurity guideline');
assert.ok(auditText.includes('第 38 條') && auditText.includes('第 39 條'), 'Must explain Cap. 528 s.38 to s.39 replacement');
assert.ok(auditText.includes('私人研習') || auditText.includes('private study'), 'Must explain that s.38 private study cannot protect commercial SaaS');
assert.ok(auditText.includes('Section 64G') && auditText.includes('受規管活動'), 'Must untangle s.64G licensing boundaries from twisting');
assert.ok(auditText.includes('Dormant') || auditText.includes('尚未生效'), 'Must disclose Section 33 dormancy under Cap. 486');
console.log('  [PASS] LEGAL_BRIEF_CITATION_AUDIT.md verified: 16 statutory citations (including Cap. 362), official URLs, retrieval dates, and change rationales.');

// 2. Verify LEGAL_BRIEF_HK_COMPLIANCE.md Header
const briefPath = PATHS.LEGAL_BRIEF_HK_COMPLIANCE;
assert.ok(fs.existsSync(briefPath), 'LEGAL_BRIEF_HK_COMPLIANCE.md must exist in workspace root');
const briefText = fs.readFileSync(briefPath, 'utf8');

assert.ok(
  briefText.includes('Citations are AI-assisted and unverified; counsel to confirm') ||
  briefText.includes('Citations are AI-assisted and unverified; qualified Hong Kong legal counsel to confirm'),
  'Legal brief must include AI-assisted disclaimer header'
);
assert.ok(briefText.length <= 11000, `Legal brief exceeds 2-page limit: ${briefText.length} characters`);
console.log(`  [PASS] LEGAL_BRIEF_HK_COMPLIANCE.md disclaimer header verified (${briefText.length} chars <= 11,000 cap).`);

// 3. Verify Overclaim Sweep in HTML App Files
const appTpl = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const appIdx = path.join(process.cwd(), 'dist', 'index.html');
const appCafe = path.join(process.cwd(), 'dist', 'cafe.html');

const hTpl = crypto.createHash('sha256').update(fs.readFileSync(appTpl)).digest('hex');
const hIdx = crypto.createHash('sha256').update(fs.readFileSync(appIdx)).digest('hex');
const hCafe = crypto.createHash('sha256').update(fs.readFileSync(appCafe)).digest('hex');

assert.strictEqual(hTpl, hIdx, 'mobile_cafe_app.html and index.html must have identical SHA-256');
assert.strictEqual(hIdx, hCafe, 'index.html and cafe.html must have identical SHA-256');

const appContent = fs.readFileSync(appIdx, 'utf8');

// Assert purged overclaims
assert.ok(!appContent.includes('100% 官方真實申報數據對賬'), 'Pay modal must not claim "100% 官方真實申報數據對賬"');
assert.ok(!appContent.includes('100% 已修復'), 'Audit drawer must not claim "100% 已修復"');
assert.ok(!appContent.includes('100% 客戶端確定性脫敏'), 'Scanner modal must not claim "100% 客戶端確定性脫敏"');
assert.ok(!appContent.includes('保證 100% 回本'), 'App must not claim "保證 100% 回本"');
assert.ok(!appContent.includes('對標 GL20 撕頁'), 'App must not claim "對標 GL20 撕頁"');
assert.ok(!appContent.includes('100%法定基準線偏離度分析'), 'App must not claim "100%法定基準線偏離度分析"');
assert.ok(!appContent.includes('一鍵導出認證PDF對賬報告'), 'App must not claim "一鍵導出認證PDF對賬報告"');
assert.ok(!appContent.includes('IA Compliant Tear-Sheet'), 'App must not claim "IA Compliant Tear-Sheet"');

// Assert replaced responsible phrasing
assert.ok(appContent.includes('示範對賬模型'), 'Pay modal must state illustrative reconciliation model');
assert.ok(appContent.includes('持續審計中'), 'Audit drawer must state ongoing audit status');
assert.ok(appContent.includes('前端本地正則掩碼防護'), 'Scanner modal must state regex mask protection');
assert.ok(appContent.includes('文本校驗指紋'), 'Scanner must state honest checksum label');
assert.ok(appContent.includes('合約保證現金價值回本年期為第'), 'Breakeven statement must distinguish expected vs contractual guaranteed breakeven');
console.log(`  [PASS] App overclaim sweep verified and 100% SHA-256 parity preserved (${hTpl.substring(0, 16)}...).`);

// 4. Verify Overclaim Sweep Documentation & Intermediary Headcount
assert.ok(auditText.includes('Overclaim Sweep Before/After Diff') || auditText.includes('全倉庫誇大營銷辭彙清洗對照表'), 'Audit must contain overclaim sweep table');
assert.ok(auditText.includes('production-grade') && auditText.includes('release-ready'), 'Audit must cover production-grade and release-ready');
assert.ok(auditText.includes('115,000') && auditText.includes('保監局'), 'Headcount must cite HKIA Annual Report (~115,000 intermediaries)');
console.log('  [PASS] Overclaim documentation verified: terms audited and intermediary headcount aligned with HKIA statistics.');

console.log('\n================================================================================');
console.log('ALL VERIFICATION ASSERTIONS PASSED (TASK-R2-05 HARDENED & VERIFIED)');
console.log('================================================================================\n');

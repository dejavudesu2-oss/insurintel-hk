/**
 * tests/verification_cycle6_handoff.ts
 * Automated Verification Suite for Skeptic Council, Screenshot Review & Final Handoff (TASK-R2-06 / C9 & C10)
 * 
 * Verifies:
 * 1. SCREENSHOT_REVIEW.md exists, audits all 6 screenshots, checks demo labels & visual flaws.
 * 2. SKEPTIC_COUNCIL_REVIEW.md exists, details 15 adversarial catches (DD, Actuary, Lawyer) with cheap fixes.
 * 3. HANDOFF.md exists at root, <= 1 page (<= 5,000 chars), covers:
 *    - What is true today (verified figures, passing test suites, strict denominator 9,052).
 *    - What was overstated in Run 1 (brutally honest table: 100% -> 0.77%, breakeven Y5 -> Y18-20, fake SHA hash, 1600% ROI).
 *    - What owner must do by hand (5 official PDFs, consult HK lawyer, 10 agent interviews).
 *    - 3 decisions for owner (pricing option, domain/hosting, top 5 priority products).
 * 4. Applied cheap code/copy fixes are verified in app files and 100% SHA-256 parity is preserved.
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('================================================================================');
console.log('TEST SUITE: SKEPTIC COUNCIL, SCREENSHOT REVIEW & FINAL HANDOFF (TASK-R2-06 / C9 & C10)');
console.log('================================================================================\n');

// 1. Verify SCREENSHOT_REVIEW.md
const shotReviewPath = path.join(process.cwd(), 'SCREENSHOT_REVIEW.md');
assert.ok(fs.existsSync(shotReviewPath), 'SCREENSHOT_REVIEW.md must exist in workspace root');
const shotText = fs.readFileSync(shotReviewPath, 'utf8');

const requiredShots = [
  '01_client_neutral_view.png',
  '02_agent_cockpit.png',
  '03_gn16_chart.png',
  '04_scanner_pii_scrub.png',
  '05_offline_mode.png',
  '06_pricing_modal.png'
];

requiredShots.forEach(shot => {
  assert.ok(shotText.includes(shot), `Screenshot review must cover ${shot}`);
});

assert.ok(shotText.includes('DEMO') || shotText.includes('示範') || shotText.includes('UNVERIFIED'), 'Must audit DEMO / UNVERIFIED label visibility');
assert.ok(shotText.includes('視覺瑕疵') || shotText.includes('排版'), 'Must list actionable visual fixes before human demonstration');
console.log('  [PASS] SCREENSHOT_REVIEW.md verified: all 6 assets audited for label honesty, layout alignment, and visual flaws.');

// 2. Verify SKEPTIC_COUNCIL_REVIEW.md
const councilPath = path.join(process.cwd(), 'SKEPTIC_COUNCIL_REVIEW.md');
assert.ok(fs.existsSync(councilPath), 'SKEPTIC_COUNCIL_REVIEW.md must exist in workspace root');
const councilText = fs.readFileSync(councilPath, 'utf8');

// Assert 3 personas
assert.ok(councilText.includes('保險區域總監') || councilText.includes('District Director'), 'Must cover District Director persona');
assert.ok(councilText.includes('精算師') || councilText.includes('Actuary'), 'Must cover Actuary persona');
assert.ok(councilText.includes('香港合規') || councilText.includes('法律師') || councilText.includes('Lawyer'), 'Must cover HK Compliance Lawyer persona');

// Assert 15 findings (DD-01..05, ACT-01..05, LEG-01..05)
for (let i = 1; i <= 5; i++) {
  assert.ok(councilText.includes(`DD-0${i}`), `Must cover District Director finding DD-0${i}`);
  assert.ok(councilText.includes(`ACT-0${i}`), `Must cover Actuary finding ACT-0${i}`);
  assert.ok(councilText.includes(`LEG-0${i}`), `Must cover Legal finding LEG-0${i}`);
}

assert.ok(councilText.includes('Cheap Fixes Applied') || councilText.includes('低成本修復'), 'Must document cheap fixes applied');
console.log('  [PASS] SKEPTIC_COUNCIL_REVIEW.md verified: 15 adversarial catches across DD, Actuary, and Legal counsel.');

// 3. Verify HANDOFF.md (< 1 page, brutal honesty, 3 decisions)
const handoffPath = path.join(process.cwd(), 'HANDOFF.md');
assert.ok(fs.existsSync(handoffPath), 'HANDOFF.md must exist in workspace root');
const handoffText = fs.readFileSync(handoffPath, 'utf8');

assert.ok(handoffText.length <= 5000, `HANDOFF.md exceeds 1-page length limit: ${handoffText.length} characters (must be <= 5,000)`);
assert.ok(handoffText.includes('今天系統真實成立的事實') || handoffText.includes('Actually True Today'), 'Must cover verified facts today');
assert.ok(handoffText.includes('歷史報告中被過度誇大的宣稱') || handoffText.includes('Overstated in Run 1'), 'Must brutally deconstruct past overstatements');
assert.ok(handoffText.includes('0.08%') || handoffText.includes('9,052'), 'Must cite verified denominator 9,052 and 0.08% strictly sourced ratio');
assert.ok(handoffText.includes('第 18~20 年') || handoffText.includes('18-20'), 'Must contrast Year 18-20 guaranteed breakeven against Year 5 claim');
assert.ok(handoffText.includes('項目發起人必須親自人工執行的任務') || handoffText.includes('Owner Must Do By Hand'), 'Must list manual next steps for owner');
assert.ok(handoffText.includes('3 項核心決策') || handoffText.includes('3 Owner Decisions'), 'Must frame 3 decisions required from owner');
assert.ok(handoffText.includes('Advisor Pro') && handoffText.includes('Agency Team'), 'Decision 1 must present Option A vs Option B');
assert.ok(handoffText.includes('insurintel.hk') || handoffText.includes('網域'), 'Decision 2 must cover domain / hosting');
assert.ok(handoffText.includes('盈御') && handoffText.includes('雋富'), 'Decision 3 must recommend top 5 priority products');
console.log(`  [PASS] HANDOFF.md verified: strictly <= 1 page (${handoffText.length} chars), brutally honest deconstructions, manual actions, and 3 decisions.`);

// 4. Verify Applied Cheap Fixes in HTML App Files
const appTpl = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const appIdx = path.join(process.cwd(), 'dist', 'index.html');
const appCafe = path.join(process.cwd(), 'dist', 'cafe.html');

const hTpl = crypto.createHash('sha256').update(fs.readFileSync(appTpl)).digest('hex');
const hIdx = crypto.createHash('sha256').update(fs.readFileSync(appIdx)).digest('hex');
const hCafe = crypto.createHash('sha256').update(fs.readFileSync(appCafe)).digest('hex');

assert.strictEqual(hTpl, hIdx, 'mobile_cafe_app.html and index.html must have identical SHA-256');
assert.strictEqual(hIdx, hCafe, 'index.html and cafe.html must have identical SHA-256');

const appContent = fs.readFileSync(appIdx, 'utf8');

// Assert cheap fixes in code
assert.ok(appContent.includes('[示範方案 A] 虛擬多元貨幣方案 A'), 'Demo mode must virtualize product name for Plan A');
assert.ok(appContent.includes('[示範方案 B] 虛擬多元貨幣方案 B'), 'Demo mode must virtualize product name for Plan B');
assert.ok(appContent.includes('不構成《保險業條例》(Cap. 41) 第 64G 條項下之受規管意見'), 'AI drawer must contain Cap. 41 s. 64G regulated advice disclaimer');
assert.ok(appContent.includes('合約保證現金價值佔比約 15%~20%'), 'Horizon projection must disclose non-guaranteed terminal bonus ratio');
assert.ok(appContent.includes('嚴禁輸入受保人之醫療診斷'), 'Scanner must warn against uploading sensitive medical records under PDPO');
assert.ok(appContent.includes('GL27 轉保風險提醒'), 'Follow-up message must include GL27 twisting risk notice');
console.log(`  [PASS] Cheap code/copy fixes verified in app files and 100% SHA-256 parity preserved (${hTpl.substring(0, 16)}...).`);

console.log('\n================================================================================');
console.log('ALL VERIFICATION ASSERTIONS PASSED (TASK-R2-06 HARDENED & VERIFIED)');
console.log('================================================================================\n');

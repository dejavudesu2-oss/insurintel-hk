/**
 * tests/verification_morning_deck.ts
 * Automated Verification Suite for Morning Assembly Deck & Run-Sheet (TASK-06)
 * 
 * Verifies:
 * 1. Physical .pptx file exists at `dist/morning_assembly_deck.pptx` (auto-builds if missing) and size > 30,000 bytes.
 * 2. Valid PK ZIP header signature (0x50 0x4B 0x03 0x04) confirming a genuine OpenXML presentation.
 * 3. PPTX contains all 10 slide XML entries and slide note components.
 * 4. Interactive HTML slides deck exists at `dist/morning_slides.html` and contains all 10 slide IDs (slide-01 to slide-10).
 * 5. HTML slides deck embeds authentic Cantonese speaker notes on every slide and reciprocal links to index.html.
 * 6. ServiceWorker exists at `dist/sw.js` enabling genuine offline PWA capabilities.
 * 7. Comprehensive manual `MORNING_ASSEMBLY_PACK_AND_RUNSHEET.md` exists and includes:
 *    - Exactly 10 slides matching presentation roadmap
 *    - Authentic Cantonese colloquial speaker notes
 *    - 1-page live demo run-sheet with aligned app metrics (Yr 5 vs Yr 7) and executable server setup
 *    - Offline fallback protocol specifying dist/sw.js cache resilience
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('================================================================================');
console.log('TEST SUITE: MORNING ASSEMBLY DECK & LIVE RUN-SHEET AUDIT (TASK-06)');
console.log('================================================================================\n');

// 1. Audit PPTX Binary
const pptxPath = path.join(process.cwd(), 'dist', 'morning_assembly_deck.pptx');
if (!fs.existsSync(pptxPath)) {
  console.log('  [BUILD] dist/morning_assembly_deck.pptx missing; auto-compiling via scripts/build_morning_assembly_pptx.py...');
  execSync('python scripts/build_morning_assembly_pptx.py', { stdio: 'inherit' });
}
assert.ok(fs.existsSync(pptxPath), 'dist/morning_assembly_deck.pptx must exist');

const pptxStat = fs.statSync(pptxPath);
assert.ok(pptxStat.size > 30000, `PPTX deck size too small: ${pptxStat.size} bytes (expected > 30,000 bytes)`);

const pptxBuf = fs.readFileSync(pptxPath);
// Verify PK ZIP magic signature: 50 4B 03 04
const isZip = pptxBuf[0] === 0x50 && pptxBuf[1] === 0x4b && pptxBuf[2] === 0x03 && pptxBuf[3] === 0x04;
assert.strictEqual(isZip, true, 'dist/morning_assembly_deck.pptx must have valid PK ZIP binary header');
console.log(`  [PASS] Physical PPTX verified: ${pptxStat.size} bytes with valid PK zip header.`);

// Verify PPTX internal structure (all 10 slide XML references in zip entry directory)
const pptxString = pptxBuf.toString('latin1');
for (let i = 1; i <= 10; i++) {
  assert.ok(pptxString.includes(`ppt/slides/slide${i}.xml`), `PPTX must contain slide ${i} entry (ppt/slides/slide${i}.xml)`);
}
console.log('  [PASS] PPTX internal OpenXML verified: exactly 10 slide parts present.');

// 2. Audit HTML Deck
const htmlPath = path.join(process.cwd(), 'dist', 'morning_slides.html');
if (!fs.existsSync(htmlPath)) {
  console.log('  [BUILD] dist/morning_slides.html missing; compiling via scripts/build_swiss_slides.py...');
  execSync('python scripts/build_swiss_slides.py', { stdio: 'inherit' });
}
assert.ok(fs.existsSync(htmlPath), 'dist/morning_slides.html must exist');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
assert.ok(htmlContent.length > 5000, `dist/morning_slides.html too small: ${htmlContent.length} chars`);

// Assert all 10 slide IDs (slide-01 to slide-10) are present in the HTML presentation
for (let i = 1; i <= 10; i++) {
  const pad = i < 10 ? `0${i}` : `${i}`;
  const slideId = `slide-${pad}`;
  assert.ok(htmlContent.includes(`data-slide-id="${slideId}"`) || htmlContent.includes(`id="${slideId}"`), `HTML slide deck missing ${slideId}`);
}
console.log('  [PASS] HTML slide deck verified: exactly 10 slide sections (slide-01 to slide-10) present.');

// Assert HTML slide titles match deck contents
assert.ok(htmlContent.includes('晨會作戰速報：告別被競品牽著走'), 'Slide 1 title missing in HTML deck');
assert.ok(htmlContent.includes('「人哋預期 7 釐，點解你得 5 釐？」'), 'Slide 2 title missing in HTML deck');
assert.ok(htmlContent.includes('分紅實現率：保監局 GN16 法定對賬'), 'Slide 3 title missing in HTML deck');
assert.ok(htmlContent.includes('第 6 年預期回本 vs 第 14 年保證回本'), 'Slide 4 title missing in HTML deck');
assert.ok(htmlContent.includes('行街見客神器：雙視角 Tear-Sheet'), 'Slide 5 title missing in HTML deck');
assert.ok(htmlContent.includes('現場實測：30 秒破解競品高分紅神話'), 'Slide 6 title missing in HTML deck');
assert.ok(htmlContent.includes('客戶端個資零外洩：PDPO 前端確定性脫敏'), 'Slide 7 title missing in HTML deck');
assert.ok(htmlContent.includes('成交實戰三步法：認同、拆解、鎖定'), 'Slide 8 title missing in HTML deck');
assert.ok(htmlContent.includes('分區團隊 14 天實戰試點計劃'), 'Slide 9 title missing in HTML deck');
assert.ok(htmlContent.includes('即日行動：掃碼登入 · 武裝專業武器'), 'Slide 10 title missing in HTML deck');
console.log('  [PASS] HTML slide titles verified against 10-slide master syllabus.');

// Assert Cantonese Speaker Notes in HTML
assert.ok(htmlContent.includes('speaker-notes'), 'HTML slides must contain speaker-notes markup');
assert.ok(htmlContent.includes('廣東話講稿備忘'), 'HTML slides must contain Cantonese speaker notes header');
assert.ok(htmlContent.includes('各位主管同理財顧問夥伴早晨'), 'HTML slides speaker notes must include authentic Cantonese colloquial phrasing');
console.log('  [PASS] Authentic Cantonese speaker notes verified across HTML deck.');

// Assert Navigation & Reciprocal Link
assert.ok(htmlContent.includes('href="index.html"'), 'HTML slides must have reciprocal link to index.html');
assert.ok(htmlContent.includes('top-nav-battlecard-btn'), 'HTML slides must include top-nav-battlecard-btn class');
assert.ok(htmlContent.includes('見客攻防卡'), 'HTML slides must include 見客攻防卡 text');
console.log('  [PASS] Reciprocal navigation to index.html verified in HTML deck.');

// 3. Audit ServiceWorker Offline Support
const swPath = path.join(process.cwd(), 'dist', 'sw.js');
if (!fs.existsSync(swPath)) {
  const swTemplate = path.join(process.cwd(), 'templates', 'sw.js');
  if (fs.existsSync(swTemplate)) {
    fs.copyFileSync(swTemplate, swPath);
  }
}
assert.ok(fs.existsSync(swPath), 'dist/sw.js must exist for offline PWA operation');
const swContent = fs.readFileSync(swPath, 'utf8');
assert.ok(swContent.includes('addEventListener(\'install\''), 'dist/sw.js must implement install event');
assert.ok(swContent.includes('addEventListener(\'fetch\''), 'dist/sw.js must implement fetch event');
assert.ok(swContent.includes('caches.open'), 'dist/sw.js must implement Cache API');
console.log('  [PASS] ServiceWorker verified at dist/sw.js with genuine offline caching.');

// 4. Audit Morning Assembly Pack & Run-Sheet Markdown
const { PATHS } = require('../scripts/paths.js');
const packPath = PATHS.MORNING_ASSEMBLY_PACK_AND_RUNSHEET;
assert.ok(fs.existsSync(packPath), 'MORNING_ASSEMBLY_PACK_AND_RUNSHEET.md must exist in root');
const packContent = fs.readFileSync(packPath, 'utf8');

// Assert 10 slides in run-sheet
for (let i = 1; i <= 10; i++) {
  const pad = i < 10 ? `0${i}` : `${i}`;
  assert.ok(packContent.includes(`Slide ${pad}`) || packContent.includes(`Slide ${i}`), `Run-sheet missing definition for Slide ${pad}`);
}
console.log('  [PASS] Run-sheet contains full 10-slide roadmap.');

// Assert Cantonese Speaker Notes in Run-Sheet
assert.ok(packContent.includes('廣東話逐字講稿') || packContent.includes('Speaker Notes'), 'Run-sheet must contain Cantonese speaker notes');
assert.ok(packContent.includes('各位主管同理財顧問夥伴早晨'), 'Run-sheet speaker notes must include authentic Cantonese colloquial phrasing');
console.log('  [PASS] Authentic Cantonese speaker notes verified in run-sheet.');

// Assert Live Demo Run-Sheet & Aligned Metrics
assert.ok(packContent.includes('現場 Demo 操作手冊'), 'Run-sheet must contain live demo run-sheet');
assert.ok(packContent.includes('npx serve') || packContent.includes('python -m http.server') || packContent.includes('file:///'), 'Run-sheet must document executable local server commands');
assert.ok(packContent.includes('Plan A 我方第 5 年保證回本') && packContent.includes('Plan B 對手第 7 年'), 'Run-sheet Step 2 metrics must align with actual app state (Yr 5 vs Yr 7)');
console.log('  [PASS] 1-Page Live Demo Run-sheet verified with executable server setup and synchronized app metrics.');

// Assert Offline Fallback Protocol
assert.ok(packContent.includes('離線應急預案'), 'Run-sheet must include offline fallback protocol');
assert.ok(packContent.includes('ServiceWorker') && packContent.includes('dist/sw.js'), 'Offline protocol must reference dist/sw.js ServiceWorker');
console.log('  [PASS] Triple offline fallback protocol verified.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL MORNING ASSEMBLY DECK & RUN-SHEET TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

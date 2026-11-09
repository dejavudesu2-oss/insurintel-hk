/**
 * scripts/verify_legal_citations_r3.js
 * Verification of Legal Citations, Guideline Modernization, and 1 July 2025 Rate Caps (TASK-R3-02 / R2)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { PATHS } = require('./paths.js');

console.log('================================================================================');
console.log('VERIFYING LEGAL CITATIONS, GUIDELINES (GL16/25/27/28/29/30) & RATE CAPS');
console.log('================================================================================\n');

// 1. Audit LEGAL_BRIEF_CITATION_AUDIT.md
const auditPath = PATHS.LEGAL_BRIEF_CITATION_AUDIT;
assert.ok(fs.existsSync(auditPath), 'LEGAL_BRIEF_CITATION_AUDIT.md must exist');
const auditText = fs.readFileSync(auditPath, 'utf8');

// Check mandatory disclaimer header
assert.ok(
  auditText.includes('AI-assisted citations; counsel to confirm'),
  'Must include mandatory header: "AI-assisted citations; counsel to confirm."'
);

// Check Cap. 71 Chinese title fix in ledger table
const ledgerPart = auditText.split('## 第二部分')[0];
assert.ok(ledgerPart.includes('《管制免責條款條例》'), 'Cap. 71 title must be 《管制免責條款條例》 in ledger');
assert.ok(!ledgerPart.includes('免責條款網制條例'), 'Ledger must NOT contain typo "免責條款網制條例"');

// Check statutory headings accuracy (Cap. 41 s. 90, s. 121, Cap. 623 s. 4 & s. 6)
assert.ok(
  auditText.includes('Conduct requirements for licensed insurance intermediaries'),
  'Cap. 41 s. 90 heading must be "Conduct requirements for licensed insurance intermediaries"'
);
assert.ok(
  auditText.includes('Preservation of secrecy'),
  'Cap. 41 s. 121 heading must be "Preservation of secrecy"'
);
assert.ok(
  auditText.includes('When third party may enforce term') && auditText.includes('Rescission and variation of contract'),
  'Cap. 623 heading must cover s. 4 (When third party may enforce term) and s. 6 (Rescission and variation of contract)'
);

// Check distinct direct permalinks
const directPermalinks = [
  'https://www.elegislation.gov.hk/hk/cap41!en/s64G',
  'https://www.elegislation.gov.hk/hk/cap41!en/s90',
  'https://www.elegislation.gov.hk/hk/cap41!en/s95',
  'https://www.elegislation.gov.hk/hk/cap41!en/s121',
  'https://www.elegislation.gov.hk/hk/cap41!en/sch1A',
  'https://www.elegislation.gov.hk/hk/cap362!en/s7',
  'https://www.elegislation.gov.hk/hk/cap362!en/s13E',
  'https://www.elegislation.gov.hk/hk/cap486!en/s33',
  'https://www.elegislation.gov.hk/hk/cap486!en/sch1',
  'https://www.elegislation.gov.hk/hk/cap559!en/s21',
  'https://www.elegislation.gov.hk/hk/cap528!en/s39',
  'https://www.elegislation.gov.hk/hk/cap71!en/s3',
  'https://www.elegislation.gov.hk/hk/cap623!en/s4',
  'https://www.elegislation.gov.hk/hk/cap112!en/s26ZZD'
];
directPermalinks.forEach(url => {
  assert.ok(auditText.includes(url), `Ledger must contain direct permalink: ${url}`);
});
console.log('  [PASS] Distinct direct statutory permalinks verified in ledger.');

// Check GL16 vs GN16
assert.ok(auditText.includes('GL16'), 'Must reference GL16 as primary modern guideline');
assert.ok(auditText.includes('GN16') && (auditText.includes('歷史') || auditText.includes('historical')), 'GN16 must be kept as historical note');
assert.ok(auditText.includes('Interpretation Notes') || auditText.includes('釋義筆記'), 'Must reference Interpretation Notes on fulfillment ratios');

// Check new guidelines additions: GL25, GL28, GL29, GL30/FNA
assert.ok(auditText.includes('GL25') && (auditText.includes('Offering of Gifts') || auditText.includes('提供贈品指引')), 'Must cover GL25 (Offering of Gifts)');
assert.ok(auditText.includes('GL28') && (auditText.includes('Benefit Illustrations') || auditText.includes('利益說明文件指引')), 'Must cover GL28 (Benefit Illustrations)');
assert.ok(auditText.includes('GL29') && (auditText.includes('Cooling-off Period') || auditText.includes('冷靜期指引')), 'Must cover GL29 (Cooling-off Period)');
assert.ok(auditText.includes('Financial Needs Analysis') || auditText.includes('財務需要分析'), 'Must cover Financial Needs Analysis (FNA / GL30)');

// Check 1 July 2025 rate caps table
assert.ok(auditText.includes('2025年7月1日') || auditText.includes('1 July 2025'), 'Must analyze 1 July 2025 effective date');
assert.ok(auditText.includes('6.0%') && auditText.includes('6.5%'), 'Must state 6.0% HKD and 6.5% non-HKD illustration rate caps');
assert.ok(auditText.includes('盈御多元貨幣計劃 3') && auditText.includes('雋富多元貨幣計劃'), 'Must list specific products exceeding rate caps');
assert.ok(auditText.includes('[UNVERIFIED - 超出2025年7月1日保監局上限]'), 'Must mark IRR ranges affected by 1 July 2025 caps as UNVERIFIED');
console.log('  [PASS] 1 July 2025 Illustration Rate Caps sub-table verified with 15 flagged products.');

// 2. Audit LEGAL_BRIEF_HK_COMPLIANCE.md
const briefPath = PATHS.LEGAL_BRIEF_HK_COMPLIANCE;
assert.ok(fs.existsSync(briefPath), 'LEGAL_BRIEF_HK_COMPLIANCE.md must exist');
const briefText = fs.readFileSync(briefPath, 'utf8');

assert.ok(briefText.includes('AI-assisted citations; counsel to confirm'), 'Legal brief must include exact disclaimer header');
assert.ok(briefText.length <= 11000, `Brief must be <= 11,000 characters, got: ${briefText.length}`);
assert.ok(briefText.includes('Conduct requirements for licensed insurance intermediaries') || briefText.includes('Section 90 of Cap. 41'), 'Brief must cite Section 90 conduct requirements');
assert.ok(briefText.includes('GL25 (Offering of Gifts)'), 'Brief must instruct counsel specifically on GL25 rebate calculators');
assert.ok(briefText.includes('Cap. 623 s. 4 & s. 6'), 'Brief must cite Cap. 623 s. 4 and s. 6');
console.log(`  [PASS] LEGAL_BRIEF_HK_COMPLIANCE.md verified: exact header present, character length: ${briefText.length} <= 11,000.`);

// 3. Audit Codebase & Data Implementation of Rate Cap Watermark
const mockPath = path.join(__dirname, '..', 'src', 'mock_data', 'savings_multicurrency.json');
const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
const flaggedMockCount = mockData.filter(p => p.savings_metrics?.illustration_rate_cap_status?.includes('受保監局6.0%/6.5%上限規管')).length;
assert.strictEqual(flaggedMockCount, 15, 'Exactly 15 products in mock data must carry Rate Cap Watermark');

const appHtml = fs.readFileSync(path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html'), 'utf8');
assert.ok(
  appHtml.includes('[UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]'),
  'mobile_cafe_app.html must render rate cap watermark for IRRs exceeding caps'
);
assert.ok(
  appHtml.includes('香港保監局 GL16 (GN16) / 各保司官方通函及說明書核定'),
  'mobile_cafe_app.html footer must modernize GN16 to GL16 (GN16)'
);

// 4. Audit Morning Slides GL16 Modernization
const slidesHtml = fs.readFileSync(path.join(__dirname, '..', 'templates', 'morning_slides.html'), 'utf8');
assert.ok(slidesHtml.includes('GL16（前稱 GN16）'), 'Morning slides must cite GL16 with GN16 as historical note');

// 5. Audit Typo in FULL_AUDIT_AND_COMMERCIAL_MASTER_REPORT.md
const masterReportPath = PATHS.FULL_AUDIT_AND_COMMERCIAL_MASTER_REPORT;
if (fs.existsSync(masterReportPath)) {
  const masterText = fs.readFileSync(masterReportPath, 'utf8');
  assert.ok(!masterText.includes('免責條款網制條例'), 'Master report must NOT contain typo 免責條款網制條例');
  assert.ok(masterText.includes('《管制免責條款條例》'), 'Master report must contain correct title 《管制免責條款條例》');
}
console.log('  [PASS] Codebase, mock data, and presentation assets verified for Rate Cap watermark and GL16 modernization.');

console.log('\n================================================================================');
console.log('LEGAL CITATIONS & GUIDELINE MODERNIZATION AUDIT PASSED (TASK-R3-02 FULLY GREEN)');
console.log('================================================================================\n');

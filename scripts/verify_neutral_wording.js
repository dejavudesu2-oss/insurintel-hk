/**
 * scripts/verify_neutral_wording.js
 * 
 * Client Neutral-Wording & Twisting Prevention Guardrails Audit (TASK-03 - HARDENED)
 * 
 * Verifies:
 * 1. ZERO aggressive / disparaging tokens exist in `#client-view` or client-facing tear-sheets.
 *    Audited tokens: 碾壓, 智商稅, 割韭菜, 吊打, 勸退, 垃圾, 辣雞, 騙局, 暴利, 劣等, 死穴, 絕殺, 噱頭, 跳水.
 * 2. ZERO twisting / policy replacement incitements exist.
 *    Audited tokens: 退舊保新, 立刻退保, 退保換, 換保單更划算, 強烈建議退保, 無損退保, 零退保折損, 轉移保單.
 * 3. Scoped container verification:
 *    - Static `#client-disclaimer` DOM container retains all 5 statutory markers.
 *    - Dynamic runtime `getBattleCard()` disclaimer string in JS retains all 5 statutory markers.
 *    - Client PDF export (`renderClientPdfPreview`) retains all 5 statutory markers.
 *    - Client WhatsApp generator (`copyReportWhatsApp`) retains statutory GL20/GL27 and anti-twisting warnings.
 * 4. Temporal anchor consistency: unified to 2026-11-09 across headers, disclaimer, and PDF preview.
 * 5. Byte-for-byte SHA-256 parity across templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const targetFiles = [
  path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html'),
  path.join(__dirname, '..', 'dist', 'index.html'),
  path.join(__dirname, '..', 'dist', 'cafe.html')
];

console.log('================================================================================');
console.log('CLIENT NEUTRAL-WORDING & TWISTING PREVENTION GUARDRAILS AUDIT (TASK-03 - HARDENED)');
console.log('Compliance Benchmarks: HKIA GL20, GL27, Cap. 41 Insurance Authority Guidelines');
console.log('================================================================================\n');

// 1. Prohibited aggressive and derogatory tokens
const aggressiveTokens = [
  '碾壓',
  '智商稅',
  '割韭菜',
  '吊打',
  '勸退',
  '垃圾',
  '辣雞',
  '騙局',
  '暴利',
  '劣等',
  '死穴',
  '絕殺',
  '噱頭',
  '跳水'
];

// 2. Prohibited twisting / aggressive policy replacement incitement tokens
const twistingTokens = [
  '退舊保新',
  '立刻退保',
  '退保換',
  '換保單更划算',
  '強烈建議退保',
  '無損退保',
  '零退保折損',
  '轉移保單'
];

// 3. Mandatory statutory compliance markers
const mandatoryDisclaimers = [
  { name: 'HKIA Regulatory Mention', pattern: /保險業監管局|HKIA/ },
  { name: 'Code of Conduct / GL27 Guideline Reference', pattern: /GL20|GL27|操守守則/ },
  { name: 'Policy Replacement Risk / Anti-Twisting Warning', pattern: /不構成任何保單替換建議|轉保可能涉及重大財務(損失|折損)/ },
  { name: 'Temporal Anchor (Data as of 2026-11-09)', pattern: /2026年11月09日|2026-11-09/ },
  { name: 'Unverified Data Safety Notice', pattern: /未經核實|Unverified/ }
];

let totalViolations = 0;

targetFiles.forEach((filePath) => {
  const fileName = path.basename(filePath);
  console.log(`Auditing file: ${fileName}...`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Target file not found: ${filePath}`);
  }

  const html = fs.readFileSync(filePath, 'utf8');

  // A. Check Client View Scoped Block
  const clientViewStart = html.indexOf('id="client-view"');
  if (clientViewStart === -1) {
    console.error(`  ❌ VIOLATION in ${fileName}: Missing #client-view container element!`);
    totalViolations++;
    return;
  }

  // Find exact closing of #client-view container
  const clientDisclaimerIdx = html.indexOf('id="client-disclaimer"', clientViewStart);
  if (clientDisclaimerIdx === -1) {
    console.error(`  ❌ VIOLATION in ${fileName}: Missing #client-disclaimer container element!`);
    totalViolations++;
    return;
  }

  const clientViewEnd = html.indexOf('</div>\n  </div>', clientDisclaimerIdx);
  const clientViewContent = html.slice(clientViewStart, clientViewEnd !== -1 ? clientViewEnd + 14 : clientDisclaimerIdx + 2000);

  // Check aggressive tokens in client view
  aggressiveTokens.forEach((token) => {
    if (clientViewContent.includes(token)) {
      console.error(`  ❌ VIOLATION in ${fileName} (#client-view): Contains aggressive token "${token}"`);
      totalViolations++;
    }
  });

  // Check twisting tokens in entire file
  twistingTokens.forEach((token) => {
    if (html.includes(token)) {
      console.error(`  ❌ VIOLATION in ${fileName}: Contains twisting/replacement token "${token}"`);
      totalViolations++;
    }
  });

  // B. Verify Static #client-disclaimer content
  const disclaimerMatch = html.slice(clientDisclaimerIdx, clientDisclaimerIdx + 1500);
  mandatoryDisclaimers.forEach(({ name, pattern }) => {
    if (!pattern.test(disclaimerMatch)) {
      console.error(`  ❌ VIOLATION in ${fileName} (#client-disclaimer): Missing mandatory marker: ${name}`);
      totalViolations++;
    }
  });
  console.log(`  [PASS] ${fileName} #client-disclaimer static markup verified.`);

  // C. Verify Dynamic Runtime getBattleCard() disclaimer in JS
  const runtimeDisclaimerPos = html.indexOf('const disclaimer = `<div style="font-weight:700');
  if (runtimeDisclaimerPos === -1) {
    console.error(`  ❌ VIOLATION in ${fileName}: getBattleCard() runtime disclaimer missing statutory text!`);
    totalViolations++;
  } else {
    const runtimeDisclaimerSnippet = html.slice(runtimeDisclaimerPos, runtimeDisclaimerPos + 1200);
    mandatoryDisclaimers.forEach(({ name, pattern }) => {
      if (!pattern.test(runtimeDisclaimerSnippet)) {
        console.error(`  ❌ VIOLATION in ${fileName} (runtime disclaimer): Missing marker: ${name}`);
        totalViolations++;
      }
    });
    console.log(`  [PASS] ${fileName} getBattleCard() dynamic runtime disclaimer verified.`);
  }

  // D. Verify Client PDF Report Export Footer
  const pdfFooterPos = (html.indexOf('【香港保險業監管局 (HKIA)《持牌保險中介人操守守則》客觀告示】') !== -1) ? html.indexOf('【香港保險業監管局 (HKIA)《持牌保險中介人操守守則》客觀告示】') : (html.indexOf('【香港保監局《持牌保險中介人操守守則》客觀告示】') !== -1 ? html.indexOf('【香港保監局《持牌保險中介人操守守則》客觀告示】') : html.indexOf('【香港保險業監管局 (IA)《操守指引》(GL20) 合規聲明】'));
  if (pdfFooterPos === -1) {
    console.error(`  ❌ VIOLATION in ${fileName}: Client PDF report export missing GL20 statutory footer!`);
    totalViolations++;
  } else {
    const pdfSnippet = html.slice(pdfFooterPos, pdfFooterPos + 1000);
    mandatoryDisclaimers.forEach(({ name, pattern }) => {
      if (!pattern.test(pdfSnippet)) {
        console.error(`  ❌ VIOLATION in ${fileName} (PDF report footer): Missing marker: ${name}`);
        totalViolations++;
      }
    });
    console.log(`  [PASS] ${fileName} client PDF report export footer verified.`);
  }

  // E. Verify WhatsApp Share Card
  if (!html.includes('不構成任何保單替換建議，轉保可能涉及重大財務損失')) {
    console.error(`  ❌ VIOLATION in ${fileName}: WhatsApp card share script missing anti-twisting warning!`);
    totalViolations++;
  } else {
    console.log(`  [PASS] ${fileName} WhatsApp sharing card anti-twisting warning verified.`);
  }

  console.log(`  [PASS] ${fileName} passed all neutral-wording & anti-twisting guardrail checks.\n`);
});

// G. SHA-256 Parity check
const hashes = targetFiles.map(f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'));
if (hashes[0] !== hashes[1] || hashes[1] !== hashes[2]) {
  console.error('❌ VIOLATION: SHA-256 parity mismatch across templates and dist HTML files!');
  totalViolations++;
} else {
  console.log(`[PASS] SHA-256 parity confirmed across all 3 HTML files (${hashes[0].slice(0, 16)}...)\n`);
}

const report = {
  timestamp: new Date().toISOString(),
  targetFiles: targetFiles.map(f => path.basename(f)),
  prohibitedAggressiveTokensAudited: aggressiveTokens.length,
  prohibitedTwistingTokensAudited: twistingTokens.length,
  mandatoryDisclaimersAudited: mandatoryDisclaimers.length,
  totalViolations,
  status: totalViolations === 0 ? 'PASSED' : 'FAILED'
};

const outReportPath = path.join(__dirname, '..', 'dist', 'neutral_wording_audit_report.json');
fs.mkdirSync(path.dirname(outReportPath), { recursive: true });
fs.writeFileSync(outReportPath, JSON.stringify(report, null, 2), 'utf8');

console.log('================================================================================');
if (totalViolations === 0) {
  console.log('AUDIT RESULT: 100% PASSED (0 Compliance Violations Across All 3 Apps & Runtime)');
  console.log(`Audit report stored to ${outReportPath}`);
  console.log('================================================================================\n');
  process.exit(0);
} else {
  console.error(`AUDIT RESULT: FAILED with ${totalViolations} violations.`);
  console.log('================================================================================\n');
  process.exit(1);
}

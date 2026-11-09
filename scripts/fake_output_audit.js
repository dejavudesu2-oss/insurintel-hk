/**
 * scripts/fake_output_audit.js
 * Comprehensive Codebase Audit for Fake Outputs, Pseudo-Random IDs, and Fabricated Regulatory Metas (R3)
 */

const fs = require('fs');
const path = require('path');

function auditCodebase() {
  console.log('================================================================================');
  console.log('AUDITING CODEBASE FOR FAKE OUTPUTS, PSEUDO IDS & METRIC CONTRADICTIONS');
  console.log('================================================================================\n');

  const findings = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (['node_modules', '.git', '.gemini', 'screenshots'].includes(entry)) continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanDir(full);
      } else if (/\.(html|js|ts|json|mjs)$/.test(entry)) {
        // Skip self & patch script
        if (entry === 'fake_output_audit.js' || entry === 'patch_fake_output_sweep.js' || entry === 'verification_fake_output_sweep.ts') continue;

        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        lines.forEach((line, idx) => {
          // Check 1: Fake d84a92f0 SHA-256 string
          if (line.includes('d84a92f0')) {
            findings.push({ file: full, line: idx + 1, type: 'Fake SHA-256', text: line.trim() });
          }
          // Check 2: Fake LEAD- CRM IDs in HTML templates
          if (/LEAD-[0-9]{5,}/.test(line) && (full.endsWith('.html'))) {
            findings.push({ file: full, line: idx + 1, type: 'Pseudo LEAD- ID', text: line.trim() });
          }
          // Check 3: Fabricated IA circular filing numbers in any product data/templates
          if (/\bIA-[A-Z0-9]+-(?:SAV|UL|CI|GEN|PIN|SOV|MAX)[A-Z0-9\-]*\b/.test(line) && !line.includes('[示範虛擬編號]') && !full.includes('verification_') && !full.includes('patch_') && !full.includes('test')) {
            findings.push({ file: full, line: idx + 1, type: 'Fabricated Regulatory Circular ID', text: line.trim() });
          }
          // Check 4: Unsanitized 保險業監管局/保監局 filing claims in JSON or HTML
          if (/；\s*(?:保險業監管局|保監局)(?:備案|核准|登記|檔案|認可|認證)[^"'\\]+/.test(line) && !line.includes('[示範虛擬編號]') && !full.includes('test')) {
            findings.push({ file: full, line: idx + 1, type: 'Fabricated Regulatory Authority Attribution', text: line.trim() });
          }
        });
      }
    }
  }

  scanDir('templates');
  scanDir('dist');
  if (fs.existsSync('src')) scanDir('src');
  if (fs.existsSync('scripts')) scanDir('scripts');

  console.log('Scan completed. Findings count:', findings.length);
  if (findings.length > 0) {
    console.error('Audit violations detected:');
    findings.forEach(f => console.error(`  [FAIL] ${f.file}:${f.line} (${f.type}): ${f.text}`));
    return false;
  }

  console.log('  [PASS] Zero fake SHA-256 strings, zero pseudo LEAD- IDs, zero fabricated regulatory circular IDs across templates/, dist/, src/, and scripts/.');
  return true;
}

if (require.main === module) {
  const ok = auditCodebase();
  process.exit(ok ? 0 : 1);
}

module.exports = { auditCodebase };

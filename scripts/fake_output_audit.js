/**
 * scripts/fake_output_audit.js
 * Automated Codebase Audit for Fake Outputs, Pseudo-Random IDs, and Hardcoded Metas (R3)
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
      if (['node_modules', '.git', '.gemini', 'dist/screenshots'].includes(entry)) continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanDir(full);
      } else if (/\.(html|js|ts|json)$/.test(entry)) {
        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        lines.forEach((line, idx) => {
          // Check 1: Fake d84a92f0 SHA-256 string
          if (line.includes('d84a92f0') && !full.includes('patch_fake_output_sweep.js') && !full.includes('fake_output_audit.js') && !full.includes('verification_fake_output_sweep.ts')) {
            findings.push({ file: full, line: idx + 1, type: 'Fake SHA-256', text: line.trim() });
          }
          // Check 2: Fake LEAD- CRM IDs in HTML templates
          if (/LEAD-[0-9]{5,}/.test(line) && (full.endsWith('.html'))) {
            findings.push({ file: full, line: idx + 1, type: 'Pseudo LEAD- ID', text: line.trim() });
          }
          // Check 3: Fabricated IA circular filing numbers in ALL_PRODUCTS_CATALOG
          if (/IA-[A-Z0-9]+-SAV-[0-9]+/.test(line) && !full.includes('verification_') && !full.includes('patch_')) {
            findings.push({ file: full, line: idx + 1, type: 'Fabricated IA Circular ID', text: line.trim() });
          }
        });
      }
    }
  }

  scanDir('templates');
  scanDir('dist');
  if (fs.existsSync('src')) scanDir('src');

  console.log('Scan completed. Findings count:', findings.length);
  if (findings.length > 0) {
    console.error('Audit violations detected:');
    findings.forEach(f => console.error(`  [FAIL] ${f.file}:${f.line} (${f.type}): ${f.text}`));
    return false;
  }

  console.log('  [PASS] Zero fake SHA-256 strings, zero pseudo LEAD- IDs, zero fabricated IA circular IDs.');
  return true;
}

if (require.main === module) {
  const ok = auditCodebase();
  process.exit(ok ? 0 : 1);
}

module.exports = { auditCodebase };

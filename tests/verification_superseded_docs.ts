/**
 * tests/verification_superseded_docs.ts
 * Automated Verification Suite for Repo Map (U1) & Superseded Docs Banner / Grep Audit (U2)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { PATHS } from '../scripts/paths.js';

console.log('================================================================================');
console.log('TEST SUITE: REPO MAP & SUPERSEDED DOCS AUDIT (RUN 5 / U1 & U2)');
console.log('================================================================================\n');

// 1. Verify Root File Count <= 15
const rootEntries = fs.readdirSync(PATHS.REPO_ROOT, { withFileTypes: true });
const rootFiles = rootEntries.filter(e => e.isFile()).map(e => e.name);
assert.ok(
  rootFiles.length <= 15,
  `Root must have <= 15 files, found ${rootFiles.length}: ${rootFiles.join(', ')}`
);
console.log(`  [PASS] Root directory hygiene verified: ${rootFiles.length} files (<= 15 cap).`);

// 2. Verify all paths in scripts/paths.js resolve to existing files/directories
for (const [key, targetPath] of Object.entries(PATHS)) {
  assert.ok(fs.existsSync(targetPath), `Path in scripts/paths.js does not exist: ${key} -> ${targetPath}`);
}
console.log(`  [PASS] All ${Object.keys(PATHS).length} entries in scripts/paths.js exist on disk.`);

// 3. Verify all docs in docs/archive/superseded/ carry the exact SUPERSEDED banner
const REQUIRED_BANNER = 'SUPERSEDED - contains claims later disproven; see HANDOFF.md';
const archiveFiles = fs.readdirSync(PATHS.ARCHIVE_SUPERSEDED_DIR).filter(f => f.endsWith('.md'));
assert.ok(archiveFiles.length >= 10, `Expected at least 10 archived markdown reports, found ${archiveFiles.length}`);

for (const fileName of archiveFiles) {
  const fullPath = path.join(PATHS.ARCHIVE_SUPERSEDED_DIR, fileName);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert.ok(
    content.includes(REQUIRED_BANNER),
    `Archived doc ${fileName} is missing mandatory banner: "${REQUIRED_BANNER}"`
  );
}
console.log(`  [PASS] All ${archiveFiles.length} docs in docs/archive/superseded/ contain the mandatory SUPERSEDED banner.`);

// 4. Grep docs/ (excluding archive/ and EVIDENCE_TABLE.md) for stale claims = 0 hits
function walkActiveDocs(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'archive') continue;
      results.push(...walkActiveDocs(fullPath));
    } else if (entry.isFile()) {
      if (entry.name === 'EVIDENCE_TABLE.md') continue;
      results.push(fullPath);
    }
  }
  return results;
}

const docsRoot = path.join(PATHS.REPO_ROOT, 'docs');
const activeDocFiles = walkActiveDocs(docsRoot);

const forbiddenPatterns: { label: string; regex: RegExp }[] = [
  { label: '8.77/10', regex: /8\.77(?:\s*\/\s*10)?/ },
  { label: '1,600% ROI', regex: /1,600%\s*ROI/i },
  { label: '207/207', regex: /207\s*\/\s*207/ },
  { label: '100% SOURCED', regex: /100(?:\.00)?%\s*(?:\([^)]*\)\s*)?SOURCED(?!-STRICT)/i },
  { label: 'LTV/CAC 8.25', regex: /(?:LTV\/CAC\s*)?8\.25/i }
];

const hits: string[] = [];
for (const filePath of activeDocFiles) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const pat of forbiddenPatterns) {
      if (pat.regex.test(line)) {
        const rel = path.relative(PATHS.REPO_ROOT, filePath);
        hits.push(`${rel}:${idx + 1} [${pat.label}]: ${line.trim().slice(0, 100)}`);
      }
    }
  });
}

assert.strictEqual(
  hits.length,
  0,
  `Expected 0 hits for disproven claims in active docs/, but found ${hits.length}:\n${hits.join('\n')}`
);
console.log(`  [PASS] Grep across ${activeDocFiles.length} active docs/ files (excluding archive/ and EVIDENCE_TABLE.md) returned 0 hits.`);

console.log('\n================================================================================');
console.log('SUMMARY: ALL REPO MAP & SUPERSEDED DOCS ASSERTIONS PASSED (100% GREEN)');
console.log('================================================================================\n');

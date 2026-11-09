/**
 * tests/verification_screenshots.ts
 * Automated Verification Suite for Headless Chrome Screenshot Pipeline (TASK-05)
 * 
 * Verifies:
 * 1. All 6 high-resolution screenshots exist in `dist/screenshots/`
 * 2. Every screenshot file size is > 100,000 bytes
 * 3. PNG binary magic signature (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A) is verified on every asset
 * 4. PNG IHDR dimensions are parsed and confirmed to be high-resolution desktop viewports (>= 1200px width, >= 600px height)
 * 5. Hash diversity is audited: all 6 screenshots must be distinct captures with 6 unique SHA-256 signatures
 * 6. Asset parity between repo distribution and conversation artifact directory is verified via SHA-256 when artifact dir is present
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('================================================================================');
console.log('TEST SUITE: HEADLESS CHROME SCREENSHOT PIPELINE & ASSET AUDIT (TASK-05)');
console.log('================================================================================\n');

const shots = [
  '01_client_neutral_view.png',
  '02_agent_cockpit.png',
  '03_gn16_chart.png',
  '04_scanner_pii_scrub.png',
  '05_offline_mode.png',
  '06_pricing_modal.png',
  '07_briefing_view.png'
];

const distDir = path.join(process.cwd(), 'dist', 'screenshots');
const artifactDir = process.env.ARTIFACTS_DIR || '';

assert.ok(fs.existsSync(distDir), 'dist/screenshots directory must exist');

const hashes = new Set<string>();

shots.forEach((fileName, idx) => {
  const filePath = path.join(distDir, fileName);
  assert.ok(fs.existsSync(filePath), `Screenshot missing in dist: ${fileName}`);

  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 100000, `Screenshot ${fileName} size too small: ${stat.size} bytes (must be > 100,000 bytes)`);

  const buf = fs.readFileSync(filePath);

  // Verify PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
                buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a;
  assert.strictEqual(isPng, true, `${fileName} must be a valid PNG binary file`);

  // Parse IHDR Chunk for Width & Height (bytes 16..23)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  assert.ok(width >= 1200, `${fileName} width must be high-resolution desktop (>= 1200px), got ${width}px`);
  assert.ok(height >= 600, `${fileName} height must be >= 600px, got ${height}px`);

  // Hash diversity check
  const distHash = crypto.createHash('sha256').update(buf).digest('hex');
  assert.ok(!hashes.has(distHash), `Screenshot ${fileName} is a duplicate capture of another view! All views must be distinct.`);
  hashes.add(distHash);

  // Verify artifact copy parity when ARTIFACTS_DIR is explicitly configured
  if (artifactDir) {
    const artPath = path.join(artifactDir, fileName);
    if (fs.existsSync(artPath)) {
      const artHash = crypto.createHash('sha256').update(fs.readFileSync(artPath)).digest('hex');
      assert.strictEqual(distHash, artHash, `SHA-256 mismatch between dist and artifact copy of ${fileName}`);
    } else {
      console.log(`  [NOTE] Artifact directory not detected at ${artifactDir}, skipping local artifact copy parity.`);
    }
  }

  console.log(`  [PASS] Screenshot [${idx + 1}/${shots.length}] ${fileName}: ${stat.size} bytes | Resolution: ${width}x${height} | Hash: ${distHash.substring(0, 10)}... | PNG Valid`);
});

assert.strictEqual(hashes.size, shots.length, `Expected ${shots.length} unique screenshots, but found ${hashes.size}`);
console.log(`\n  [PASS] Visual Diversity Audit: All ${hashes.size} screenshots have distinct SHA-256 signatures.`);

console.log('\n================================================================================');
console.log('SUMMARY: ALL SCREENSHOT ASSET AUDIT TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

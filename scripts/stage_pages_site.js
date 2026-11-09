/**
 * scripts/stage_pages_site.js
 *
 * Stages public web application assets from `dist/` into `_site/` for GitHub Pages deployment.
 *
 * Modes (controlled via PAGES_PUBLISH_MODE environment variable):
 * - "allowlist" (default): Copies ONLY public-facing web app pages, PWA worker, and runtime JSON APIs.
 *   Excludes internal audit reports (*_audit_report.json, independent_irr_audit_results.json),
 *   cache/DLQ state (.dlq.json, .semantic_cache.json, previous_snapshot.json),
 *   internal PowerPoint deck (morning_assembly_deck.pptx), raw screenshots/, and compiled src/ & tests/.
 * - "full": Copies the entire `dist/` directory as-is into `_site/`.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const SITE_DIR = path.join(REPO_ROOT, '_site');
const mode = (process.env.PAGES_PUBLISH_MODE || 'allowlist').toLowerCase();

const ALLOWLIST_FILES = [
  'index.html',
  'cafe.html',
  'waitlist.html',
  'gn16_tracker.html',
  'morning_slides.html',
  'morning_poster.svg',
  'morning_briefing.txt',
  'sw.js',
  'api/v1/briefing.json',
  'api/v1/matrix.json',
  'data/app_100_comments.json',
  'data/daily_100_scenarios.json',
  'data/gn16_database.json'
];

if (fs.existsSync(SITE_DIR)) {
  fs.rmSync(SITE_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SITE_DIR, { recursive: true });

if (mode === 'full') {
  fs.cpSync(DIST_DIR, SITE_DIR, { recursive: true });
  console.log(`[stage_pages_site] Staged FULL dist/ directory into ${SITE_DIR}`);
} else {
  let copiedCount = 0;
  for (const relPath of ALLOWLIST_FILES) {
    const srcPath = path.join(DIST_DIR, relPath);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(SITE_DIR, relPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  }
  console.log(`[stage_pages_site] Staged ${copiedCount} allowlisted public web assets into ${SITE_DIR}`);
}

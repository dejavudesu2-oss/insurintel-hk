/**
 * scripts/build_app.js
 * Deterministic single-command application build (`npm run build:app`).
 * Synchronizes canonical templates (`templates/*`) and runtime JSON datasets (`src/data/*`)
 * into `dist/` with byte-for-byte reproducibility and reports the SHA-256 of `dist/index.html`.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data');
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_DATA_DIR = path.join(DIST_DIR, 'data');
const DIST_SRC_DATA_DIR = path.join(DIST_DIR, 'src', 'data');

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function buildApp() {
  [DIST_DIR, DIST_DATA_DIR, DIST_SRC_DATA_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // 1. Unified App Shell: templates/mobile_cafe_app.html -> dist/index.html & dist/cafe.html
  const appTemplate = path.join(TEMPLATES_DIR, 'mobile_cafe_app.html');
  if (!fs.existsSync(appTemplate)) {
    throw new Error(`Missing canonical app template: ${appTemplate}`);
  }
  const indexDest = path.join(DIST_DIR, 'index.html');
  const cafeDest = path.join(DIST_DIR, 'cafe.html');
  fs.copyFileSync(appTemplate, indexDest);
  fs.copyFileSync(appTemplate, cafeDest);

  // 2. Secondary Templates & Redirect Stubs -> dist/
  const templateMappings = [
    ['gn16_tracker.html', 'gn16_tracker.html'],
    ['waitlist.html', 'waitlist.html'],
    ['morning_slides.html', 'morning_slides.html'],
    ['sw.js', 'sw.js']
  ];

  for (const [srcName, destName] of templateMappings) {
    const srcPath = path.join(TEMPLATES_DIR, srcName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(DIST_DIR, destName));
    }
  }

  // 3. Runtime JSON Data Assets: src/data/*.json -> dist/data/ & dist/src/data/
  if (fs.existsSync(SRC_DATA_DIR)) {
    const jsonFiles = fs.readdirSync(SRC_DATA_DIR).filter((f) => f.endsWith('.json')).sort();
    for (const file of jsonFiles) {
      const srcPath = path.join(SRC_DATA_DIR, file);
      fs.copyFileSync(srcPath, path.join(DIST_DATA_DIR, file));
      fs.copyFileSync(srcPath, path.join(DIST_SRC_DATA_DIR, file));
    }
  }

  const indexHash = sha256File(indexDest);
  const cafeHash = sha256File(cafeDest);
  const gn16Bytes = fs.statSync(path.join(DIST_DIR, 'gn16_tracker.html')).size;

  console.log('================================================================================');
  console.log('DETERMINISTIC APP BUILD COMPLETE (templates -> dist)');
  console.log('================================================================================');
  console.log(`  dist/index.html SHA-256 : ${indexHash}`);
  console.log(`  dist/cafe.html  SHA-256 : ${cafeHash}`);
  console.log(`  dist/gn16_tracker.html  : ${gn16Bytes} bytes (redirect stub -> index.html#gl16)`);
  console.log('================================================================================');

  return { indexHash, cafeHash, gn16Bytes };
}

if (require.main === module) {
  buildApp();
}

module.exports = { buildApp, sha256File };

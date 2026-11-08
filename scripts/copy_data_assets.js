/**
 * scripts/copy_data_assets.js
 * Synchronizes JSON data assets and ServiceWorker into dist/ directories for standalone runtime execution
 */

const fs = require('fs');
const path = require('path');

const srcDataDir = path.join(__dirname, '..', 'src', 'data');
const distDataDir1 = path.join(__dirname, '..', 'dist', 'src', 'data');
const distDataDir2 = path.join(__dirname, '..', 'dist', 'data');
const distDir = path.join(__dirname, '..', 'dist');

[distDataDir1, distDataDir2].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const files = fs.readdirSync(srcDataDir).filter((f) => f.endsWith('.json'));

files.forEach((file) => {
  const src = path.join(srcDataDir, file);
  fs.copyFileSync(src, path.join(distDataDir1, file));
  fs.copyFileSync(src, path.join(distDataDir2, file));
  console.log(`[AssetSync] Copied ${file} -> dist/`);
});

// Copy ServiceWorker
const swSource = path.join(__dirname, '..', 'templates', 'sw.js');
const swDist = path.join(distDir, 'sw.js');
if (fs.existsSync(swSource)) {
  fs.copyFileSync(swSource, swDist);
  console.log('[AssetSync] Copied sw.js -> dist/sw.js');
}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const tPath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
let html = fs.readFileSync(tPath, 'utf8');

html = html.replace(
  "const full = ['【步驟 1：肯定眼光】', t1, '', '【步驟 2：點破盲點】', t2, '', '【步驟 3：客觀數據對照】', t3]",
  "const full = ['【步驟 1：肯定眼光】', t1, '', '【步驟 2：點破盲點】', t2, '', '【步驟 3：數據絕殺】', t3]"
);

html = html.replace(
  '<div class="step-title" style="color:#4ade80;">步驟 3：客觀數據對照（保監局 GN16 官方實現率）</div>',
  '<div class="step-title" style="color:#4ade80;">步驟 3：數據絕殺（保監局 GN16 官方實現率）</div>'
);

fs.writeFileSync(tPath, html, 'utf8');

const distIdx = path.join(__dirname, '..', 'dist', 'index.html');
const distCafe = path.join(__dirname, '..', 'dist', 'cafe.html');
fs.writeFileSync(distIdx, html, 'utf8');
fs.writeFileSync(distCafe, html, 'utf8');

const h1 = crypto.createHash('sha256').update(fs.readFileSync(tPath)).digest('hex');
const h2 = crypto.createHash('sha256').update(fs.readFileSync(distIdx)).digest('hex');
const h3 = crypto.createHash('sha256').update(fs.readFileSync(distCafe)).digest('hex');

console.log('SHA-256 Parity:', h1);
if (h1 === h2 && h2 === h3) {
  console.log('✅ Synchronized with 100% SHA-256 parity!');
} else {
  console.error('❌ Parity mismatch');
  process.exit(1);
}

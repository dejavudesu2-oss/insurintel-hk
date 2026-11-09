/**
 * scripts/patch_neutral_disclaimers.js
 * Updates client-view disclaimers and neutralizes policy replacement wording
 * across templates/mobile_cafe_app.html, dist/index.html, dist/cafe.html, and daily_100_scenarios.json.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Update daily_100_scenarios.json
const scenarioFiles = [
  path.join(__dirname, '..', 'src', 'data', 'daily_100_scenarios.json'),
  path.join(__dirname, '..', 'dist', 'data', 'daily_100_scenarios.json'),
  path.join(__dirname, '..', 'dist', 'src', 'data', 'daily_100_scenarios.json')
];

scenarioFiles.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/提早退保換取現金/g, '提早退保以套取應急現金');
    content = content.replace(/退保換取現金/g, '提早退保以套取應急現金');
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated scenario dataset: ${f}`);
  }
});

// 2. Target HTML files
const htmlFiles = [
  path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html'),
  path.join(__dirname, '..', 'dist', 'index.html'),
  path.join(__dirname, '..', 'dist', 'cafe.html')
];

const oldDisclaimerTarget = `<div id="client-disclaimer" style="margin-top:14px; font-size:11px; color:#9ca3af; line-height:1.4;">
      註：以上數據摘自香港保監局官方統計及各大保險公司年報公佈之實現率，過往表現不代表將來業績；最終條款以正式保單合約批註為準。
    </div>`;

const newDisclaimerReplacement = `<div id="client-disclaimer" style="margin-top:14px; font-size:11px; color:#4b5563; line-height:1.5; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px 14px;">
      <div style="font-weight:700; color:#111827; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
        <span>⚖️ 香港保監局（HKIA）GL20 / GL27 法定合規告示與客觀對照說明</span>
        <span style="font-family:'JetBrains Mono'; font-size:10px; color:#6b7280;">數據截至：2026年11月09日 (Data as of 2026-11-09)</span>
      </div>
      <div>1. <strong>反轉保與保單替換風險警示</strong>：本系統所有精算指標僅供持牌保險中介人作內部市場分析及向客戶客觀展示產品條款，不構成任何保單替換（Twisting）建議。提早退保或轉保可能涉及重大財務折損及失去原有合約權益。</div>
      <div style="margin-top:4px;">2. <strong>數據來源與未經核實提示</strong>：分紅實現率摘自香港保監局（HKIA）GN16 公開通函與各大保司官網年報。任何未經獨立來源查證之試算數據均標註為「未經核實（Unverified - do not present to clients）」，嚴禁向客戶呈示。</div>
      <div style="margin-top:4px; font-size:10px; color:#9ca3af;">3. 過往分紅實現率不代表未來業績承諾，保證現金價值與非保證終期紅利之權益以承保保司正式批註合約為準。</div>
    </div>`;

htmlFiles.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace disclaimer
    if (content.includes(oldDisclaimerTarget)) {
      content = content.replace(oldDisclaimerTarget, newDisclaimerReplacement);
    }
    
    // Replace twisting wording in embedded scenarios or tables
    content = content.replace(/提早退保換取現金/g, '提早退保以套取應急現金');
    content = content.replace(/退保換取現金/g, '提早退保以套取應急現金');

    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated HTML file: ${f}`);
  }
});

// Verify SHA-256 parity across all three HTML files
const h1 = crypto.createHash('sha256').update(fs.readFileSync(htmlFiles[0])).digest('hex');
const h2 = crypto.createHash('sha256').update(fs.readFileSync(htmlFiles[1])).digest('hex');
const h3 = crypto.createHash('sha256').update(fs.readFileSync(htmlFiles[2])).digest('hex');

console.log('SHA-256 Parity:');
console.log('  template:', h1);
console.log('  index:   ', h2);
console.log('  cafe:    ', h3);

if (h1 === h2 && h2 === h3) {
  console.log('✅ 100% SHA-256 byte-for-byte parity verified across all three HTML apps!');
} else {
  console.error('❌ Parity mismatch across HTML files!');
  process.exit(1);
}

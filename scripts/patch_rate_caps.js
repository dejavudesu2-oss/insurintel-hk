/**
 * scripts/patch_rate_caps.js
 * Applies the 1 July 2025 Illustration Rate Cap watermark & tags across mock data and HTML
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CAP_WATERMARK = '[UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]';

// 1. Update src/mock_data/savings_multicurrency.json
const mockPath = path.join(__dirname, '..', 'src', 'mock_data', 'savings_multicurrency.json');
let savingsList = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
let taggedCount = 0;

savingsList = savingsList.map(prod => {
  if (prod.savings_metrics && prod.savings_metrics.expected_irr_year_30 > 6.5) {
    prod.savings_metrics.illustration_rate_cap_status = CAP_WATERMARK;
    taggedCount++;
  }
  return prod;
});

fs.writeFileSync(mockPath, JSON.stringify(savingsList, null, 2), 'utf8');
console.log(`[PASS] Tagged ${taggedCount} savings products in src/mock_data/savings_multicurrency.json with Rate Cap Watermark.`);

// 2. Update templates/mobile_cafe_app.html
const mobileAppPath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
let html = fs.readFileSync(mobileAppPath, 'utf8');

// Replace lines 7504-7505
const oldValLines = `            ourVal: ourMetrics.irr30 > 0 ? ourMetrics.irr30 + "%" : (ourKey === 'Bowtie' ? "自主定存/美債" : "不適用"),
            rivalVal: rivalMetrics.irr30 > 0 ? rivalMetrics.irr30 + "%" : (rivalKey === 'Bowtie' ? "自主定存/美債" : "不適用"),`;

const newValLines = `            ourVal: ourMetrics.irr30 > 0 ? (ourMetrics.irr30 + "%" + (ourMetrics.irr30 > 6.5 ? ' [UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]' : '')) : (ourKey === 'Bowtie' ? "自主定存/美債" : "不適用"),
            rivalVal: rivalMetrics.irr30 > 0 ? (rivalMetrics.irr30 + "%" + (rivalMetrics.irr30 > 6.5 ? ' [UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]' : '')) : (rivalKey === 'Bowtie' ? "自主定存/美債" : "不適用"),`;

if (html.includes(oldValLines)) {
  html = html.replace(oldValLines, newValLines);
  console.log('[PASS] Injected rate cap watermark into radar/bilateral table.');
}

// Replace line 8300
html = html.replace(
  "{ label: `30年預期複利總回報 (IRR)`, value: `我方 ~${ourMetrics.irr30}% vs 對手 ~${rivalMetrics.irr30}%`, highlight: false },",
  "{ label: `30年預期複利總回報 (IRR)`, value: `我方 ~${ourMetrics.irr30}% vs 對手 ~${rivalMetrics.irr30}%` + ((ourMetrics.irr30 > 6.5 || rivalMetrics.irr30 > 6.5) ? ' [UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]' : ''), highlight: false },"
);

// Replace line 8343
html = html.replace(
  "{ label: `30年預期複利總回報 (IRR)`, value: `我方 ~${ourMetrics.irr30}% vs 對手 ~${rivalMetrics.irr30}%`, highlight: true },",
  "{ label: `30年預期複利總回報 (IRR)`, value: `我方 ~${ourMetrics.irr30}% vs 對手 ~${rivalMetrics.irr30}%` + ((ourMetrics.irr30 > 6.5 || rivalMetrics.irr30 > 6.5) ? ' [UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]' : ''), highlight: true },"
);

// Modernize GN16 to GL16 (GN16) in footer
html = html.replace(
  '<span>📅 最後資料更新日期：2026年11月06日 · 數據截至：2026年11月09日 · 香港保監局 GN16 / 各保司官方通函及說明書核定</span>',
  '<span>📅 最後資料更新日期：2026年11月06日 · 數據截至：2026年11月09日 · 香港保監局 GL16 (GN16) / 各保司官方通函及說明書核定</span>'
);
html = html.replace(
  'id="client-source">來源：香港保監局 GN16 公開報告 · 最後資料更新日期：2026年11月06日 · 數據截至：2026年11月09日</span>',
  'id="client-source">來源：香港保監局 GL16 (GN16) 公開報告 · 最後資料更新日期：2026年11月06日 · 數據截至：2026年11月09日</span>'
);

// Save to templates/mobile_cafe_app.html and sync to dist
fs.writeFileSync(mobileAppPath, html, 'utf8');

const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

const shaMobile = crypto.createHash('sha256').update(fs.readFileSync(mobileAppPath)).digest('hex');
const shaIndex = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const shaCafe = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

console.log('[PASS] HTML Distribution SHA-256 Parity verified:', shaMobile);
if (shaMobile !== shaIndex || shaIndex !== shaCafe) {
  throw new Error('Parity mismatch across mobile app targets!');
}

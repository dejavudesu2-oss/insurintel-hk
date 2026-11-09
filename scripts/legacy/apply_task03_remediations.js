/**
 * scripts/apply_task03_remediations.js
 * Comprehensive remediation for all 6 Adversarial Review findings on TASK-03:
 * 1. Overwrite prevention: update getBattleCard() disclaimer in JS runtime.
 * 2. Neutralize loaded/combat terms: 死穴, 絕殺, 噱頭, 陷阱警示, 跳水 across templates and scripts.
 * 3. Add statutory anti-twisting & unverified notices to client PDF preview and WhatsApp card copy.
 * 4. Unify all dates to 2026-11-09 across UI, headers, and reports.
 * 5. Remove "GL20 認證" certification claim -> "依循 GL20 客觀對比原則設計".
 * 6. Synchronize templates/mobile_cafe_app.html, dist/index.html, dist/cafe.html with 100% SHA-256 byte parity.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const templatePath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
let html = fs.readFileSync(templatePath, 'utf8');

// 1. Update getBattleCard() disclaimer in runtime JS
const oldBattleCardDisclaimer = 'const disclaimer = `註：以上數據摘自香港保監局官方統計 (GN16) 及各大保險公司年報公佈之實現率，過往表現不代表將來業績；最終條款以正式保單合約批註為準。持牌人內部專業培訓用途，嚴禁作為宣傳單張散發。`;';
const newBattleCardDisclaimer = `const disclaimer = \`<div style="font-weight:700; color:#111827; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
  <span>⚖️ 香港保監局（HKIA）GL20 / GL27 法定合規告示與客觀對照說明</span>
  <span style="font-family:'JetBrains Mono'; font-size:10px; color:#6b7280;">數據截至：2026年11月09日 (Data as of 2026-11-09)</span>
</div>
<div>1. <strong>反轉保與保單替換風險警示</strong>：本系統所有精算指標僅供持牌保險中介人作內部市場分析及向客戶客觀展示產品條款，不構成任何保單替換（Twisting）建議。提早退保或轉保可能涉及重大財務折損及失去原有合約權益。</div>
<div style="margin-top:4px;">2. <strong>數據來源與未經核實提示</strong>：分紅實現率摘自香港保監局（HKIA）GN16 公開通函與各大保司官網年報。任何未經獨立來源查證之試算數據均標註為「未經核實（Unverified - do not present to clients）」，嚴禁向客戶呈示。</div>
<div style="margin-top:4px; font-size:10px; color:#9ca3af;">3. 過往分紅實現率不代表未來業績承諾，保證現金價值與非保證終期紅利之權益以承保保司正式批註合約為準。</div>\`;`;

if (html.includes(oldBattleCardDisclaimer)) {
  html = html.replace(oldBattleCardDisclaimer, newBattleCardDisclaimer);
  console.log('✅ Replaced getBattleCard runtime disclaimer with statutory GL20/GL27 text.');
} else {
  console.warn('⚠️ oldBattleCardDisclaimer not found exactly.');
}

// 2. Neutralize loaded/combat terms
html = html.replace(/步驟 3：數據絕殺（保監局 GN16 官方實現率）/g, '步驟 3：客觀數據對照（保監局 GN16 官方實現率）');
html = html.replace(/【步驟 3：數據絕殺】/g, '【步驟 3：客觀數據對照】');
html = html.replace(/對手條款死穴/g, '對手條款細節');
html = html.replace(/拆解競品條款死穴/g, '客觀剖析競品條款細節');
html = html.replace(/點破等候期死穴 ➔ 癌症 1 年間隔絕殺/g, '對比等候期間隔 ➔ 癌症 1 年間隔優勢');
html = html.replace(/點破細項拆分上限 ➔ 全港私院出院免找數全數賠償絕殺/g, '對比細項拆分上限 ➔ 全港私院出院免找數全數賠償優勢');
html = html.replace(/點破浮動紅利風險 ➔ 法定頂階退稅 17% 與保證年金絕殺/g, '對比浮動紅利風險 ➔ 法定頂階退稅 17% 與保證年金優勢');
html = html.replace(/點破融資利率波動與 Margin Call ➔ 85% LTV 與正利差鎖定絕殺/g, '對比融資利率波動與 Margin Call ➔ 85% LTV 與正利差鎖定優勢');
html = html.replace(/GN16 官方數據絕殺/g, 'GN16 官方數據對照');
html = html.replace(/平價醫保噱頭/g, '平價醫保宣傳');
html = html.replace(/浮動分紅噱頭/g, '浮動分紅宣傳');
html = html.replace(/陷阱警示：傳統分紅險提早退保損失慘重；Bowtie 零佣金純保障 \+ 自主投資，回歸 100% 資金自由流動性！/g, '客觀條款對照：傳統分紅險具有較長合約承諾期；純保障產品按月續保無早期退保現金價值，中介人應依據客戶整體資產流動性需要客觀分析。');
html = html.replace(/傳統儲蓄險資金鎖定 20-30 年，前期退保損失大；Bowtie 提倡「買純保障，自主投資」，零佣金節省高額保費/g, '傳統儲蓄險著重長遠保證回本與複利增值；純保障產品專注短期健康保障，兩者定位不同，中介人應引導客戶評估自身保單配置。');
html = html.replace(/次年利息極易跳水/g, '次年起按市場利率浮動，非保證利息');
html = html.replace(/費率跳水式暴增/g, '自然費率隨年齡階梯遞增');
html = html.replace(/何時能無損退保/g, '何時能達到保證回本平衡點');
html = html.replace(/100% 流動性 \(零退保折損\)/g, '按月續保 (無長期鎖定期)');
html = html.replace(/0 折損 \(按月繳付無鎖定\) vs 前期提早退保損失慘重/g, '按月繳付彈性退保 vs 長期儲蓄前幾年屬成本累積期');

// 3. Update dates and false certification claims
html = html.replace(/最後資料更新日期：2026年11月06日/g, '最後資料更新日期：2026年11月09日');
html = html.replace(/報告產出日期：2026年11月07日/g, '報告產出日期：2026年11月09日');
html = html.replace(/GL20 認證客觀對比/g, '依循 GL20 客觀對比原則設計');
html = html.replace(/對標GL20/g, '依循GL20原則');

// 4. Update renderClientPdfPreview statutory footer
const oldPdfFooter = `<div style="border-top:1px solid #cbd5e1;padding-top:10px;font-size:10px;color:#64748b;line-height:1.5;">' +
          '<strong>【香港保險業監管局 (IA)《操守指引》(GL20) 合規聲明】：</strong><br>' +
          '本對比簡報所載數據均提取自各保險公司官方公開建議書、產品手冊及保監局 GN16 歷史分紅實現率公開檔案，僅供授權持牌人士與客戶進行客觀財務諮詢與保單條款分析之用，不構成任何要約或誘使。非保證紅利受保險公司實際投資回報及市場波動影響，過往實現率並不代表未來表現。' +
        '</div>`;

const newPdfFooter = `<div style="border-top:1px solid #cbd5e1;padding-top:10px;font-size:10px;color:#64748b;line-height:1.5;">' +
          '<strong>【香港保險業監管局 (IA)《操守指引》(GL20 / GL27) 合規聲明】：</strong><br>' +
          '1. 本對比簡報所載數據均提取自各保險公司官方公開建議書、產品手冊及保監局 GN16 歷史分紅實現率公開檔案（數據截至：2026年11月09日），僅供持牌保險中介人作內部市場分析及向客戶客觀展示產品條款，不構成要約。<br>' +
          '2. <strong>反轉保與保單替換風險警示</strong>：本簡報不構成任何保單替換建議，轉保可能涉及重大財務損失及喪失現有保障權益。<br>' +
          '3. <strong>未經核實數據提示</strong>：任何未經官方獨立來源證實之數據標註為「未經核實（Unverified - do not present to clients）」，嚴禁向客戶呈示。非保證紅利受保險公司實際投資回報影響，過往實現率不代表未來表現。' +
        '</div>`;

if (html.includes(oldPdfFooter)) {
  html = html.replace(oldPdfFooter, newPdfFooter);
  console.log('✅ Updated renderClientPdfPreview statutory footer.');
}

// 5. Update copyReportWhatsApp
html = html.replace(
  "text += '🛡️【香港保監局 GL20 合規聲明】：資料源自官方建議書及保監局備案，供客觀諮詢與條款分析，不構成要約。非保證紅利受市場波動影響，過往實現率不代表未來表現。';",
  "text += '🛡️【香港保監局 GL20/GL27 合規聲明】：資料源自官方建議書及保監局備案，供客觀諮詢與條款分析，不構成要約。不構成任何保單替換建議，轉保可能涉及重大財務損失。數據截至：2026-11-09。未經核實數據嚴禁引用。';"
);

// Save template
fs.writeFileSync(templatePath, html, 'utf8');
console.log(`✅ Updated ${templatePath} (${html.length} chars)`);

// Sync to dist/index.html and dist/cafe.html
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

// Verify SHA-256 parity
const h1 = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const h2 = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const h3 = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

console.log('SHA-256 Parity check:');
console.log('  template:', h1);
console.log('  index:   ', h2);
console.log('  cafe:    ', h3);

if (h1 === h2 && h2 === h3) {
  console.log('🎉 100% SHA-256 Byte-for-Byte Parity Verified Across All 3 Apps!');
} else {
  console.error('❌ Parity mismatch!');
  process.exit(1);
}

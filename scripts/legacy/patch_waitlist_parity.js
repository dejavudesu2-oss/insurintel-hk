const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const templatePath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
let html = fs.readFileSync(templatePath, 'utf8');

// 1. Update 20 seats to 15 seats in modal
html = html.replace('👑 區域總監早會增員首選 (包20席位)', '👑 區域總監早會增員首選 (包15席位)');
html = html.replace('包含 20 個獨立顧問執業席位 (平均 $124/人)', '包含 15 個獨立顧問執業席位 (平均 $165/席)');
html = html.replace('已解鎖 20 個專屬顧問席位', '已解鎖 15 個專屬顧問席位');

// 2. Add top navigation link to waitlist.html
const oldNav = `<a href="morning_slides.html" class="top-nav-slides-btn" id="link-morning-slides" title="全港晨會情報投影片（每日 06:30 HKT 自動更新）"><span class="btn-emoji">📊</span><span class="btn-txt">晨會投影片</span></a>`;
const newNav = `<a href="morning_slides.html" class="top-nav-slides-btn" id="link-morning-slides" title="全港晨會情報投影片（每日 06:30 HKT 自動更新）"><span class="btn-emoji">📊</span><span class="btn-txt">晨會投影片</span></a>
        <a href="waitlist.html" class="top-nav-waitlist-btn" id="link-waitlist" title="早鳥優先體驗名單與定價" style="text-decoration:none;display:inline-flex;align-items:center;gap:4px;padding:6px 10px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:4px;font-size:11px;font-weight:700;color:var(--ikb);margin-left:4px;"><span class="btn-emoji">📝</span><span class="btn-txt">早鳥登記</span></a>`;

if (html.includes(oldNav)) {
  html = html.replace(oldNav, newNav);
  console.log('Added top-nav waitlist link');
}

// 3. Add direct CTA button in gn16-pay-modal footer
const oldModalCheckoutBtn = `<button class="btn-unlock-agent" onclick="simulateGN16Checkout()">立即解鎖並開通權限 ❯</button>`;
const newModalCheckoutBtn = `<button class="btn-unlock-agent" onclick="simulateGN16Checkout()">立即解鎖並開通權限 ❯</button>
      <div style="text-align:center;margin-top:10px;">
        <a href="waitlist.html" style="font-size:12px;color:var(--ikb);font-weight:700;text-decoration:none;">📝 前往早鳥優先體驗登記頁 (查看完整單一要約) ❯</a>
      </div>`;

if (html.includes(oldModalCheckoutBtn)) {
  html = html.replace(oldModalCheckoutBtn, newModalCheckoutBtn);
  console.log('Added waitlist redirect link to pricing modal');
}

// 4. Update simulateGN16Checkout to redirect to waitlist.html
const oldCheckoutFn = `function simulateGN16Checkout() {
      closeGN16PayModal();`;

const newCheckoutFn = `function simulateGN16Checkout() {
      closeGN16PayModal();
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = 'waitlist.html';
        return;
      }`;

if (html.includes(oldCheckoutFn)) {
  html = html.replace(oldCheckoutFn, newCheckoutFn);
  console.log('Updated simulateGN16Checkout to navigate to waitlist.html');
}

fs.writeFileSync(templatePath, html, 'utf8');

// Propagate to dist/index.html and dist/cafe.html
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

const hashT = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const hashI = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const hashC = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

console.log('SHA-256 Parity Check:');
console.log('Template:', hashT);
console.log('Index:   ', hashI);
console.log('Cafe:    ', hashC);
if (hashT === hashI && hashI === hashC) {
  console.log('100% SHA-256 MATCH CONFIRMED');
} else {
  console.error('MISMATCH DETECTED');
  process.exit(1);
}

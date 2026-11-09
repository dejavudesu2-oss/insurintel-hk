/**
 * scripts/patch_modal_opacity.js
 * Ensures modal opacity is immediately 1 when opened, eliminating CSS transition timing ambiguities.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const templatePath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');

let rawHtml = fs.readFileSync(templatePath, 'utf8');
const isCrlf = rawHtml.includes('\r\n');
let html = rawHtml.replace(/\r\n/g, '\n');

// 1. In .gn16-query-modal.open and .gn16-pay-modal.open
html = html.replace(
  `.gn16-query-modal.open {\n      opacity: 1;\n      pointer-events: auto;`,
  `.gn16-query-modal.open {\n      opacity: 1 !important;\n      pointer-events: auto;`
);

html = html.replace(
  `.gn16-pay-modal.open {\n      opacity: 1;\n      pointer-events: auto;`,
  `.gn16-pay-modal.open {\n      opacity: 1 !important;\n      pointer-events: auto;`
);

// 2. In openGN16QueryModal
const queryOpenTarget = `    function openGN16QueryModal(initialKeyword) {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-query-modal');
      const backdrop = document.getElementById('gn16-query-backdrop');
      if (modal && modal.classList) modal.classList.add('open');
      if (backdrop && backdrop.classList) backdrop.classList.add('open');`;

const queryOpenReplacement = `    function openGN16QueryModal(initialKeyword) {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-query-modal');
      const backdrop = document.getElementById('gn16-query-backdrop');
      if (modal && modal.classList) {
        modal.classList.add('open');
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
      }
      if (backdrop && backdrop.classList) {
        backdrop.classList.add('open');
        backdrop.style.display = 'block';
      }`;

if (!html.includes(queryOpenTarget)) {
  throw new Error('Target queryOpenTarget not found');
}
html = html.replace(queryOpenTarget, queryOpenReplacement);

// 3. In closeGN16QueryModal
const queryCloseTarget = `    function closeGN16QueryModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-query-modal');
      const backdrop = document.getElementById('gn16-query-backdrop');
      if (modal && modal.classList) modal.classList.remove('open');
      if (backdrop && backdrop.classList) backdrop.classList.remove('open');
    }`;

const queryCloseReplacement = `    function closeGN16QueryModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-query-modal');
      const backdrop = document.getElementById('gn16-query-backdrop');
      if (modal && modal.classList) {
        modal.classList.remove('open');
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
      if (backdrop && backdrop.classList) {
        backdrop.classList.remove('open');
        backdrop.style.display = 'none';
      }
    }`;

if (!html.includes(queryCloseTarget)) {
  throw new Error('Target queryCloseTarget not found');
}
html = html.replace(queryCloseTarget, queryCloseReplacement);

// 4. In openGN16PayModal
const payOpenTarget = `    function openGN16PayModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-pay-modal');
      const backdrop = document.getElementById('gn16-pay-backdrop');
      if (modal && modal.classList) modal.classList.add('open');
      if (backdrop && backdrop.classList) backdrop.classList.add('open');
    }`;

const payOpenReplacement = `    function openGN16PayModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-pay-modal');
      const backdrop = document.getElementById('gn16-pay-backdrop');
      if (modal && modal.classList) {
        modal.classList.add('open');
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
      }
      if (backdrop && backdrop.classList) {
        backdrop.classList.add('open');
        backdrop.style.display = 'block';
      }
    }`;

if (!html.includes(payOpenTarget)) {
  throw new Error('Target payOpenTarget not found');
}
html = html.replace(payOpenTarget, payOpenReplacement);

// 5. In closeGN16PayModal
const payCloseTarget = `    function closeGN16PayModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-pay-modal');
      const backdrop = document.getElementById('gn16-pay-backdrop');
      if (modal && modal.classList) modal.classList.remove('open');
      if (backdrop && backdrop.classList) backdrop.classList.remove('open');
    }`;

const payCloseReplacement = `    function closeGN16PayModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-pay-modal');
      const backdrop = document.getElementById('gn16-pay-backdrop');
      if (modal && modal.classList) {
        modal.classList.remove('open');
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
      if (backdrop && backdrop.classList) {
        backdrop.classList.remove('open');
        backdrop.style.display = 'none';
      }
    }`;

if (!html.includes(payCloseTarget)) {
  throw new Error('Target payCloseTarget not found');
}
html = html.replace(payCloseTarget, payCloseReplacement);

// 6. In openProposalScannerModal
const scannerOpenTarget = `    function openProposalScannerModal() {
      var modal = document.getElementById('proposal-scanner-modal');
      var backdrop = document.getElementById('proposal-scanner-backdrop');
      if (modal) modal.style.display = 'flex';
      if (backdrop) backdrop.style.display = 'block';
    }`;

const scannerOpenReplacement = `    function openProposalScannerModal() {
      var modal = document.getElementById('proposal-scanner-modal');
      var backdrop = document.getElementById('proposal-scanner-backdrop');
      if (modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '1';
      }
      if (backdrop) backdrop.style.display = 'block';
    }`;

if (!html.includes(scannerOpenTarget)) {
  throw new Error('Target scannerOpenTarget not found');
}
html = html.replace(scannerOpenTarget, scannerOpenReplacement);

// Restore CRLF if needed
if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync(templatePath, html, 'utf8');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

const hash1 = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const hash2 = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const hash3 = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

if (hash1 !== hash2 || hash2 !== hash3) {
  throw new Error(`SHA-256 Parity Mismatch! Template: ${hash1}, Dist/Index: ${hash2}, Dist/Cafe: ${hash3}`);
}

console.log('Successfully patched modal opacity and maintained 100% SHA-256 parity:');
console.log('Hash:', hash1);

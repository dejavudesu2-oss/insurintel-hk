const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const templatePath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');

let raw = fs.readFileSync(templatePath, 'utf8');
const isCrlf = raw.includes('\r\n');
let html = raw.replace(/\r\n/g, '\n');

const target = `      // Chart Bars
      if (clientChartBars && Array.isArray(card.chart_bars)) {
        clientChartBars.innerHTML = card.chart_bars.map(bar => \`
          <div class="chart-bar-row">
            <div class="chart-bar-header">
              <span>\${bar.label}</span>
              <span style="color:\${bar.color}; font-weight:700;">\${bar.value}</span>
            </div>
            <div class="chart-bar-bg">
              <div class="chart-bar-fill" style="width: \${bar.widthPct}%; background: \${bar.color};"></div>
            </div>
          </div>
        \`).join('');
      }`;

const replacement = `      // Chart Bars (Masked in Demo/External/Client Mode)
      if (clientChartBars && Array.isArray(card.chart_bars)) {
        const isDemo = isDemoModeActive || isExternalModeActive() || currentMode === 'client';
        clientChartBars.innerHTML = card.chart_bars.map(bar => {
          let label = bar.label;
          if (isDemo) {
            if (label.includes('我方')) label = '我方【示範方案 A】';
            else if (label.includes('對手') || label.includes('競品')) label = '對手【示範方案 B】';
            else if (label.includes('第三方')) label = '第三方【示範方案 C】';
          }
          return \`
          <div class="chart-bar-row">
            <div class="chart-bar-header">
              <span>\${label}</span>
              <span style="color:\${bar.color}; font-weight:700;">\${bar.value}</span>
            </div>
            <div class="chart-bar-bg">
              <div class="chart-bar-fill" style="width: \${bar.widthPct}%; background: \${bar.color};"></div>
            </div>
          </div>
        \`;
        }).join('');
      }`;

if (!html.includes(target)) {
  console.error('Target not found in templates/mobile_cafe_app.html');
  process.exit(1);
}

html = html.replace(target, replacement);

if (isCrlf) html = html.replace(/\n/g, '\r\n');

fs.writeFileSync(templatePath, html, 'utf8');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

const hash1 = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const hash2 = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const hash3 = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

if (hash1 !== hash2 || hash2 !== hash3) throw new Error('Parity mismatch');
console.log('Chart bars patched successfully. Parity hash:', hash1);

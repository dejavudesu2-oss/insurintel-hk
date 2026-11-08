const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const templatePath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
let html = fs.readFileSync(templatePath, 'utf8');

// Replace the updateCampSelectors block
const oldUpdate = `      if (selectMy) {
        if (isDemoModeActive) {
          if (!selectMy.querySelector('option[value="DEMO_A"]')) {
            const opt = document.createElement('option');
            opt.value = 'DEMO_A';
            opt.text = '保司 A (虛擬示範)';
            selectMy.insertBefore(opt, selectMy.firstChild);
          }
          selectMy.value = 'DEMO_A';
        } else {
          const demoOpt = selectMy.querySelector('option[value="DEMO_A"]');
          if (demoOpt) demoOpt.remove();
          selectMy.value = myCompany;
        }
      }
      if (selectRival) {
        if (isDemoModeActive) {
          if (!selectRival.querySelector('option[value="DEMO_B"]')) {
            const opt = document.createElement('option');
            opt.value = 'DEMO_B';
            opt.text = '保司 B (虛擬示範)';
            selectRival.insertBefore(opt, selectRival.firstChild);
          }
          selectRival.value = 'DEMO_B';
        } else {
          const demoOpt = selectRival.querySelector('option[value="DEMO_B"]');
          if (demoOpt) demoOpt.remove();
          selectRival.value = selectedCompany;
        }
        Array.from(selectRival.options || []).forEach(opt => {
          opt.disabled = false;
        });
      }`;

const safeUpdate = `      if (selectMy) {
        if (isDemoModeActive) {
          if (typeof selectMy.querySelector === 'function') {
            if (!selectMy.querySelector('option[value="DEMO_A"]')) {
              const opt = document.createElement('option');
              opt.value = 'DEMO_A';
              opt.text = '保司 A (虛擬示範)';
              if (typeof selectMy.insertBefore === 'function') selectMy.insertBefore(opt, selectMy.firstChild);
            }
          }
          selectMy.value = 'DEMO_A';
        } else {
          if (typeof selectMy.querySelector === 'function') {
            const demoOpt = selectMy.querySelector('option[value="DEMO_A"]');
            if (demoOpt && typeof demoOpt.remove === 'function') demoOpt.remove();
          }
          selectMy.value = myCompany;
        }
      }
      if (selectRival) {
        if (isDemoModeActive) {
          if (typeof selectRival.querySelector === 'function') {
            if (!selectRival.querySelector('option[value="DEMO_B"]')) {
              const opt = document.createElement('option');
              opt.value = 'DEMO_B';
              opt.text = '保司 B (虛擬示範)';
              if (typeof selectRival.insertBefore === 'function') selectRival.insertBefore(opt, selectRival.firstChild);
            }
          }
          selectRival.value = 'DEMO_B';
        } else {
          if (typeof selectRival.querySelector === 'function') {
            const demoOpt = selectRival.querySelector('option[value="DEMO_B"]');
            if (demoOpt && typeof demoOpt.remove === 'function') demoOpt.remove();
          }
          selectRival.value = selectedCompany;
        }
        Array.from(selectRival.options || []).forEach(opt => {
          opt.disabled = false;
        });
      }`;

if (html.includes(oldUpdate)) {
  html = html.replace(oldUpdate, safeUpdate);
  console.log('Made updateCampSelectors safe for mock environments');
}

// Replace disableDemoMode block
const oldDisable = `      var selectMy = document.getElementById('select-my-insurer');
      var selectRival = document.getElementById('select-rival-insurer');
      if (selectMy) {
        var optA = selectMy.querySelector('option[value="DEMO_A"]');
        if (optA) optA.remove();
      }
      if (selectRival) {
        var optB = selectRival.querySelector('option[value="DEMO_B"]');
        if (optB) optB.remove();
      }`;

const safeDisable = `      var selectMy = document.getElementById('select-my-insurer');
      var selectRival = document.getElementById('select-rival-insurer');
      if (selectMy) {
        if (typeof selectMy.querySelector === 'function') {
          var optA = selectMy.querySelector('option[value="DEMO_A"]');
          if (optA && typeof optA.remove === 'function') optA.remove();
        }
      }
      if (selectRival) {
        if (typeof selectRival.querySelector === 'function') {
          var optB = selectRival.querySelector('option[value="DEMO_B"]');
          if (optB && typeof optB.remove === 'function') optB.remove();
        }
      }`;

if (html.includes(oldDisable)) {
  html = html.replace(oldDisable, safeDisable);
  console.log('Made disableDemoMode safe for mock environments');
}

fs.writeFileSync(templatePath, html, 'utf8');

const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

const hashT = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const hashI = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const hashC = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

console.log('Parity check:', hashT === hashI && hashI === hashC ? '100% MATCH' : 'MISMATCH');

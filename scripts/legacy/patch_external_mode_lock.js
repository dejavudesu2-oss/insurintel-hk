/**
 * scripts/patch_external_mode_lock.js
 * Implements R4 External Mode Lock & Safety Guard and fixes Modal Initialization in templates/mobile_cafe_app.html
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

// 1. Add assertExternalModeSafety and isExternalModeActive helper functions
const phaseBHeaderTarget = `    // ==========================================
    // PHASE B: DEMO MODE & SCANNER & OFFLINE HUD
    // ==========================================
    var isDemoModeActive = false;
    var isOfflineSimulationActive = false;`;

const phaseBHeaderReplacement = `    // ==========================================
    // PHASE B: DEMO MODE & SCANNER & OFFLINE HUD & R4 EXTERNAL MODE LOCK
    // ==========================================
    var isDemoModeActive = false;
    var isOfflineSimulationActive = false;

    // R4: Fictional identification helpers
    function isFictionalInsurer(name) {
      if (!name) return true;
      var s = String(name).trim();
      return (
        s.includes('保司 A') ||
        s.includes('保司 B') ||
        s.includes('保司 C') ||
        s.includes('DEMO_') ||
        s.includes('虛擬') ||
        s.includes('示範') ||
        s.includes('Insurer A') ||
        s.includes('Insurer B') ||
        s.includes('Insurer C')
      );
    }
    window.isFictionalInsurer = isFictionalInsurer;

    function isFictionalProduct(name) {
      if (!name) return true;
      var s = String(name).trim();
      return (
        s.includes('DEMO_PROD') ||
        s.includes('示範方案') ||
        s.includes('虛擬') ||
        s.includes('Plan A') ||
        s.includes('Plan B') ||
        s.includes('旗艦多幣方案') ||
        s.includes('環球多幣方案')
      );
    }
    window.isFictionalProduct = isFictionalProduct;

    function isStrictSourcedRow(insurerOrProductName, locatorOrField) {
      if (!insurerOrProductName) return false;
      var s = String(insurerOrProductName).toLowerCase();
      var loc = locatorOrField ? String(locatorOrField).toLowerCase() : '';
      if ((s.includes('qdap') || s.includes('合資格延期年金') || loc.includes('cap. 112') || loc.includes('s. 26zzd')) &&
          (s.includes('60,000') || s.includes('60000') || loc.includes('60,000') || loc.includes('26zzd') || loc.includes('ird.gov.hk'))) {
        return true;
      }
      return false;
    }
    window.isStrictSourcedRow = isStrictSourcedRow;

    function isExternalModeActive() {
      if (typeof window === 'undefined') return false;
      if (!window.location) return false;
      try {
        var search = window.location.search || '';
        var params = new URLSearchParams(search);
        // Explicit client view is always locked to external mode
        if (params.get('view') === 'client') return true;
        // Local developer mode bypass on localhost with explicit ?internal=1 or ?dev=1
        var isLocalHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalHost && (params.get('internal') === '1' || params.get('dev') === '1')) {
          return false;
        }
        // External hostname or default load outside localhost
        if (window.location.hostname && !isLocalHost) {
          return true;
        }
        // Browser file: / http: protocol default load without internal flag locks to external mode
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:' || window.location.protocol === 'file:') {
          if (!params.get('internal') && !params.get('dev')) {
            return true;
          }
        }
      } catch (e) {}
      return false;
    }
    window.isExternalModeActive = isExternalModeActive;

    function assertExternalModeSafety(insurerName, productName, isStrictSourced, isClientVisible) {
      // Sourced statutory rows (e.g., Cap. 112 QDAP HK$60,000 tax deduction cap) MAY display official names
      if (isStrictSourced === true || isStrictSourcedRow(insurerName, productName) || isStrictSourcedRow(productName, insurerName)) {
        return true;
      }
      var isExternalOrClient = (typeof isClientVisible === 'boolean') ? isClientVisible : ((typeof currentMode !== 'undefined' && currentMode === 'client') || isExternalModeActive());
      if (isExternalOrClient) {
        var isRealIns = !isFictionalInsurer(insurerName);
        var isRealProd = !isFictionalProduct(productName);
        if (isRealIns || isRealProd) {
          var err = new Error('EXTERNAL_MODE_LOCK_VIOLATION: Refusing to display real insurer [' + insurerName + '] / product [' + productName + '] beside unverified data in external client mode. Must switch to fictional demo mode.');
          err.code = 'EXTERNAL_MODE_LOCK_VIOLATION';
          console.error(err.message);
          throw err;
        }
      }
      return true;
    }
    window.assertExternalModeSafety = assertExternalModeSafety;`;

if (html.includes(phaseBHeaderTarget)) {
  html = html.replace(phaseBHeaderTarget, phaseBHeaderReplacement);
}

// 2. Protect toggleDemoMode & disableDemoMode against disabling in external / client view
const demoToggleTarget = `    function toggleDemoMode() {
      if (isDemoModeActive) {
        disableDemoMode();
      } else {
        enableDemoMode();
      }
    }
    window.toggleDemoMode = toggleDemoMode;

    function enableDemoMode() {
      isDemoModeActive = true;
      var banner = document.getElementById('demo-mode-banner');
      if (banner) banner.style.display = 'block';

      var demoBtn = document.getElementById('header-demo-toggle-btn');
      if (demoBtn) {
        demoBtn.style.background = '#fef3c7';
        demoBtn.style.borderColor = '#f59e0b';
        demoBtn.style.color = '#92400e';
      }

      var ourHero = document.getElementById('hero-our-name');
      var rivalHero = document.getElementById('hero-rival-name');
      if (ourHero) ourHero.innerText = '保司 A (虛擬示範) · 旗艦多幣方案';
      if (rivalHero) rivalHero.innerText = '保司 B (虛擬示範) · 環球多幣方案';

      var ourLink = document.getElementById('tearsheet-our-pdf-link');
      var rivalLink = document.getElementById('tearsheet-rival-pdf-link');
      if (ourLink) ourLink.innerHTML = '<span>📄 虛擬方案 A 示範說明書 (示範用) ↗</span>';
      if (rivalLink) rivalLink.innerHTML = '<span>📄 虛擬方案 B 示範說明書 (示範用) ↗</span>';

      updateCampSelectors();
      updateBattleCard();
      showToast('🧪 已切換至虛擬示範模式：保司 A vs 保司 B (純虛構示範數據，絕無真實個資及商標爭議)');
    }
    window.enableDemoMode = enableDemoMode;

    function disableDemoMode() {
      isDemoModeActive = false;
      var banner = document.getElementById('demo-mode-banner');
      if (banner) banner.style.display = 'none';

      var demoBtn = document.getElementById('header-demo-toggle-btn');
      if (demoBtn) {
        demoBtn.style.background = '';
        demoBtn.style.borderColor = '';
        demoBtn.style.color = '';
      }

      var selectMy = document.getElementById('select-my-insurer');
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
      }
      updateCampSelectors();
      updateBattleCard();
      showToast('已退出示範模式，恢復標準市場智庫數據');
    }`;

const demoToggleReplacement = `    function toggleDemoMode() {
      if (isExternalModeActive() || (typeof currentMode !== 'undefined' && currentMode === 'client')) {
        showToast('🔒 外部展示/客戶視角模式已鎖定為虛擬示範模式（保司 A vs 保司 B），禁止展示未經驗證之真實保司品牌。');
        return;
      }
      if (isDemoModeActive) {
        disableDemoMode();
      } else {
        enableDemoMode();
      }
    }
    window.toggleDemoMode = toggleDemoMode;

    function enableDemoMode() {
      isDemoModeActive = true;
      var banner = document.getElementById('demo-mode-banner');
      if (banner) banner.style.display = 'block';

      var demoBtn = document.getElementById('header-demo-toggle-btn');
      if (demoBtn) {
        demoBtn.style.background = '#fef3c7';
        demoBtn.style.borderColor = '#f59e0b';
        demoBtn.style.color = '#92400e';
      }

      var ourHero = document.getElementById('hero-our-name');
      var rivalHero = document.getElementById('hero-rival-name');
      if (ourHero) ourHero.innerText = '保司 A (虛擬示範) · 旗艦多幣方案';
      if (rivalHero) rivalHero.innerText = '保司 B (虛擬示範) · 環球多幣方案';

      var ourLink = document.getElementById('tearsheet-our-pdf-link');
      var rivalLink = document.getElementById('tearsheet-rival-pdf-link');
      if (ourLink) ourLink.innerHTML = '<span>📄 虛擬方案 A 示範說明書 (示範用) ↗</span>';
      if (rivalLink) rivalLink.innerHTML = '<span>📄 虛擬方案 B 示範說明書 (示範用) ↗</span>';

      updateCampSelectors();
      updateBattleCard();
      showToast('🧪 已切換至虛擬示範模式：保司 A vs 保司 B (純虛構示範數據，絕無真實個資及商標爭議)');
    }
    window.enableDemoMode = enableDemoMode;

    function disableDemoMode() {
      if (isExternalModeActive() || (typeof currentMode !== 'undefined' && currentMode === 'client')) {
        showToast('🔒 外部展示/客戶視角模式已鎖定為虛擬示範模式（保司 A vs 保司 B），禁止展示未經驗證之真實保司品牌。');
        return;
      }
      isDemoModeActive = false;
      var banner = document.getElementById('demo-mode-banner');
      if (banner) banner.style.display = 'none';

      var demoBtn = document.getElementById('header-demo-toggle-btn');
      if (demoBtn) {
        demoBtn.style.background = '';
        demoBtn.style.borderColor = '';
        demoBtn.style.color = '';
      }

      var selectMy = document.getElementById('select-my-insurer');
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
      }
      updateCampSelectors();
      updateBattleCard();
      showToast('已退出示範模式，恢復標準市場智庫數據');
    }`;

if (html.includes(demoToggleTarget)) {
  html = html.replace(demoToggleTarget, demoToggleReplacement);
}

// 3. Update checkPhaseBUrlParams with DOM existence guard
const checkParamsTarget = `    function checkPhaseBUrlParams() {
      try {
        if (typeof window === 'undefined' || !window.location || !window.location.search) return;
        if (window._hasCheckedPhaseBUrlParams) return;
        window._hasCheckedPhaseBUrlParams = true;

        var params = new URLSearchParams(window.location.search);
        
        if (params.get('mode') === 'demo' || params.get('demo') === '1' || params.get('demo') === 'true') {
          enableDemoMode();
        }
        if (params.get('view') === 'client') {
          switchView('client');
        } else if (params.get('view') === 'agent') {
          switchView('agent');
        }
        if (params.get('modal') === 'pricing') {
          openGN16PayModal();
        } else if (params.get('modal') === 'scanner') {
          openProposalScannerModal();
          loadSampleProposalText();
          runPIIScrubber();
        } else if (params.get('modal') === 'gn16') {
          openGN16QueryModal();
        }
        if (params.get('offline') === 'true') {
          if (!isOfflineSimulationActive) toggleOfflineMode();
        }
      } catch(e) {}
    }`;

const checkParamsReplacement = `    function checkPhaseBUrlParams() {
      try {
        if (typeof window === 'undefined' || !window.location) return;
        if (window._hasCheckedPhaseBUrlParams) return;

        // If modal elements are not yet present in DOM, defer execution
        if (typeof document !== 'undefined' && (!document.getElementById('proposal-scanner-modal') || !document.getElementById('gn16-pay-modal') || !document.getElementById('gn16-query-modal'))) {
          return;
        }
        window._hasCheckedPhaseBUrlParams = true;

        var searchStr = window.location.search || '';
        var params = new URLSearchParams(searchStr);

        // R4: Default external load or explicit demo flags lock to demo mode
        if (isExternalModeActive() || params.get('mode') === 'demo' || params.get('demo') === '1' || params.get('demo') === 'true') {
          enableDemoMode();
        }
        if (params.get('view') === 'client') {
          switchView('client');
        } else if (params.get('view') === 'agent') {
          switchView('agent');
        }
        if (params.get('modal') === 'pricing') {
          openGN16PayModal();
        } else if (params.get('modal') === 'scanner') {
          openProposalScannerModal();
          loadSampleProposalText();
          runPIIScrubber();
        } else if (params.get('modal') === 'gn16' || params.get('chart') === 'gn16') {
          openGN16QueryModal();
        }
        if (params.get('offline') === 'true') {
          if (!isOfflineSimulationActive) toggleOfflineMode();
        }
      } catch(e) {
        console.error('Error in checkPhaseBUrlParams:', e);
      }
    }`;

if (html.includes(checkParamsTarget)) {
  html = html.replace(checkParamsTarget, checkParamsReplacement);
}

// 4. Update switchView to lock demo mode when switching to client view
const switchViewTarget = `    function switchView(mode) {
      currentMode = mode;
      const agentBtn = document.getElementById('btn-agent-view');
      const clientBtn = document.getElementById('btn-client-view');
      const agentView = document.getElementById('agent-view');
      const clientView = document.getElementById('client-view');

      if (mode === 'agent') {
        if (agentBtn) agentBtn.className = 'view-btn active-agent';
        if (clientBtn) clientBtn.className = 'view-btn';
        if (agentView) agentView.style.display = 'block';
        if (clientView) clientView.style.display = 'none';
        showToast('🔒 已切換至：顧問私密提詞 HUD (內部戰策準備)');
      } else {
        if (agentBtn) agentBtn.className = 'view-btn';
        if (clientBtn) clientBtn.className = 'view-btn active-client';
        if (agentView) agentView.style.display = 'none';
        if (clientView) clientView.style.display = 'block';
        showToast('📱 已切換至：客戶展示撕頁 (依循保監局操守守則公平客觀對照)');
      }

      const hIcon = document.getElementById('header-view-icon');
      const hText = document.getElementById('header-view-text');
      if (hIcon) hIcon.innerText = (mode === 'agent') ? '📱' : '🔒';
      if (hText) hText.innerText = (mode === 'agent') ? '客戶視角' : '顧問提詞';
    }`;

const switchViewReplacement = `    function switchView(mode) {
      currentMode = mode;
      const agentBtn = document.getElementById('btn-agent-view');
      const clientBtn = document.getElementById('btn-client-view');
      const agentView = document.getElementById('agent-view');
      const clientView = document.getElementById('client-view');

      if (mode === 'agent') {
        if (agentBtn) agentBtn.className = 'view-btn active-agent';
        if (clientBtn) clientBtn.className = 'view-btn';
        if (agentView) agentView.style.display = 'block';
        if (clientView) clientView.style.display = 'none';
        showToast('🔒 已切換至：顧問私密提詞 HUD (內部戰策準備)');
      } else {
        // R4: Client view strictly enforces demo mode
        if (typeof enableDemoMode === 'function') enableDemoMode();
        if (agentBtn) agentBtn.className = 'view-btn';
        if (clientBtn) clientBtn.className = 'view-btn active-client';
        if (agentView) agentView.style.display = 'none';
        if (clientView) clientView.style.display = 'block';
        showToast('📱 已切換至：客戶展示撕頁 (依循保監局操守守則公平客觀對照)');
      }

      const hIcon = document.getElementById('header-view-icon');
      const hText = document.getElementById('header-view-text');
      if (hIcon) hIcon.innerText = (mode === 'agent') ? '📱' : '🔒';
      if (hText) hText.innerText = (mode === 'agent') ? '客戶視角' : '顧問提詞';
    }`;

if (html.includes(switchViewTarget)) {
  html = html.replace(switchViewTarget, switchViewReplacement);
}

// 5. In updateBattleCard: enforce assertExternalModeSafety guard
// Replace any previous battleCardHeaderTarget/Replacement
const oldBattleCardReplacement = `      // 1v1 Battle Card Header
      const heroOur = document.getElementById('hero-our-name');
      const heroRival = document.getElementById('hero-rival-name');
      var isClientVisible = (currentMode === 'client') || isExternalModeActive();
      if (isDemoModeActive || isClientVisible) {
        if (heroOur) heroOur.innerText = '保司 A (虛擬示範) · 旗艦多幣方案';
        if (heroRival) heroRival.innerText = '保司 B (虛擬示範) · 環球多幣方案';
      } else {
        if (heroOur) heroOur.innerText = card.hero_our_name;
        if (heroRival) heroRival.innerText = card.hero_rival_name;
      }

      // Enforce R4 External Mode Safety Guard
      var isSourced = (currentCategory === 'Annuity_QDAP') && (card.client_title && card.client_title.includes('QDAP'));
      var curHeroOur = (heroOur && heroOur.innerText) ? heroOur.innerText : card.hero_our_name;
      var curHeroRival = (heroRival && heroRival.innerText) ? heroRival.innerText : card.hero_rival_name;
      assertExternalModeSafety(curHeroOur, curHeroOur, isSourced, isClientVisible);
      assertExternalModeSafety(curHeroRival, curHeroRival, isSourced, isClientVisible);`;

const newBattleCardReplacement = `      // 1v1 Battle Card Header
      const heroOur = document.getElementById('hero-our-name');
      const heroRival = document.getElementById('hero-rival-name');
      var isClientVisible = (currentMode === 'client') || isExternalModeActive();
      if (isDemoModeActive || isClientVisible) {
        if (heroOur) heroOur.innerText = '保司 A (虛擬示範) · 旗艦多幣方案';
        if (heroRival) heroRival.innerText = '保司 B (虛擬示範) · 環球多幣方案';
      } else {
        if (heroOur) heroOur.innerText = card.hero_our_name;
        if (heroRival) heroRival.innerText = card.hero_rival_name;
      }

      // Enforce R4 External Mode Safety Guard
      var isSourced = (currentCategory === 'Annuity_QDAP') && (card.client_title && card.client_title.includes('QDAP'));
      var curHeroOur = (isDemoModeActive || isClientVisible) ? ((heroOur && heroOur.innerText) || '保司 A (虛擬示範) · 旗艦多幣方案') : ((heroOur && heroOur.innerText) || card.hero_our_name);
      var curHeroRival = (isDemoModeActive || isClientVisible) ? ((heroRival && heroRival.innerText) || '保司 B (虛擬示範) · 環球多幣方案') : ((heroRival && heroRival.innerText) || card.hero_rival_name);
      assertExternalModeSafety(curHeroOur, curHeroOur, isSourced, isClientVisible);
      assertExternalModeSafety(curHeroRival, curHeroRival, isSourced, isClientVisible);`;

if (html.includes(oldBattleCardReplacement)) {
  html = html.replace(oldBattleCardReplacement, newBattleCardReplacement);
}

// Restore original line endings
if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

// Write to template and sync to dist files
fs.writeFileSync(templatePath, html, 'utf8');
fs.writeFileSync(distIndexPath, html, 'utf8');
fs.writeFileSync(distCafePath, html, 'utf8');

const hash1 = crypto.createHash('sha256').update(fs.readFileSync(templatePath)).digest('hex');
const hash2 = crypto.createHash('sha256').update(fs.readFileSync(distIndexPath)).digest('hex');
const hash3 = crypto.createHash('sha256').update(fs.readFileSync(distCafePath)).digest('hex');

if (hash1 !== hash2 || hash2 !== hash3) {
  throw new Error(`SHA-256 Parity Mismatch! Template: ${hash1}, Dist/Index: ${hash2}, Dist/Cafe: ${hash3}`);
}

console.log('Successfully patched mobile_cafe_app.html and maintained 100% SHA-256 parity:');
console.log('Hash:', hash1);

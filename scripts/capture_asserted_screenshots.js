/**
 * scripts/capture_asserted_screenshots.js
 * Headless Chrome Capture Engine with Direct CDP DOM Visibility Assertions & Targeted Viewport Alignment (R5)
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const { spawn } = require('child_process');

const { PATHS } = require('./paths.js');
const REPO_ROOT = PATHS.REPO_ROOT;
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const SCREENSHOTS_DIR = path.join(DIST_DIR, 'screenshots');
const ARTIFACTS_SCREENSHOTS_DIR = process.env.ARTIFACTS_DIR || '';
const ASSERTIONS_LOG_PATH = PATHS.SCREENSHOT_ASSERTIONS;
const TEMP_USER_DATA = path.join(os.tmpdir(), 'chrome_cdp_profile');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (ARTIFACTS_SCREENSHOTS_DIR && !fs.existsSync(ARTIFACTS_SCREENSHOTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_SCREENSHOTS_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_USER_DATA)) fs.mkdirSync(TEMP_USER_DATA, { recursive: true });

const CHROME_PATH = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'google-chrome');
const HTTP_PORT = 3334;
const CDP_PORT = 9222;

// Simple HTTP static server
function startHttpServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0].split('#')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(HTTP_PORT);
  return server;
}

// Helper to send CDP JSON-RPC commands over WebSocket
function createCdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    } catch (e) {}
  };

  const ready = new Promise((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = (err) => reject(err);
  });

  return {
    ready,
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const reqId = id++;
        pending.set(reqId, { resolve, reject });
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    },
    close() {
      try { ws.close(); } catch (e) {}
    }
  };
}

async function fetchJson(url) {
  const res = await fetch(url);
  return await res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const TARGET_VIEWS = [
  {
    name: '01_client_neutral_view.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo&view=client`,
    desc: 'Client Neutral View (Clean Tear-Sheet with Statutory Warning & Fictional Plans)',
    preCaptureExpr: `(() => {
      // Dismiss any animated toast alert to prevent obscuring content
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
      // Scroll client-view prominently into the viewport
      window.scrollTo(0, 0);
    })()`,
    assertExpr: `(() => {
      const el = document.getElementById('client-view');
      const ourHero = document.getElementById('hero-our-name');
      const ourProd = document.getElementById('my-product-display');
      const s = el ? window.getComputedStyle(el) : null;
      const rect = el ? el.getBoundingClientRect() : null;
      return {
        target: 'client-view',
        found: !!el,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        inViewport: rect ? (rect.top <= 260 && rect.bottom > 200) : false,
        heroOurText: ourHero ? ourHero.innerText : '',
        ourProdText: ourProd ? ourProd.innerText : '',
        ok: el && s.display !== 'none' && s.opacity !== '0' && rect.height > 0 &&
            ourHero && (ourHero.innerText.includes('AIA') || ourHero.innerText.includes('盈御') || ourHero.innerText.includes('保司 A')) &&
            ourProd && (ourProd.innerText.includes('盈御') || ourProd.innerText.includes('示範方案 A'))
      };
    })()`
  },
  {
    name: '02_agent_cockpit.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo&view=agent`,
    desc: 'Agent Tactical Cockpit (Internal HUD with Counter-Pitch Arguments)',
    preCaptureExpr: `(() => {
      // Dismiss any animated toast alert to prevent obscuring content
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
      // Scroll agent-view prominently into the viewport
      window.scrollTo(0, 0);
    })()`,
    assertExpr: `(() => {
      const el = document.getElementById('agent-view');
      const s = el ? window.getComputedStyle(el) : null;
      const rect = el ? el.getBoundingClientRect() : null;
      const title = document.getElementById('agent-title');
      const trap = document.getElementById('agent-trap-alert');
      return {
        target: 'agent-view',
        found: !!el,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        inViewport: rect ? (rect.top <= 260 && rect.bottom > 200) : false,
        titleText: title ? title.innerText : '',
        trapAlertPresent: !!trap,
        ok: el && s.display !== 'none' && s.opacity !== '0' && rect.height > 0 && !!title && !!trap
      };
    })()`
  },
  {
    name: '03_gn16_chart.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo&modal=gn16`,
    desc: 'GN16 Fulfillment Ratio Tracker (Historical Corridor vs Illustration Curve)',
    preCaptureExpr: `(() => {
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
    })()`,
    assertExpr: `(() => {
      const modal = document.getElementById('gn16-query-modal');
      const chartContainer = document.getElementById('gn16-chart-container');
      const chartSvg = document.querySelector('#gn16-svg-chart-wrapper svg');
      const s = modal ? window.getComputedStyle(modal) : null;
      const rect = modal ? modal.getBoundingClientRect() : null;
      const chartRect = chartContainer ? chartContainer.getBoundingClientRect() : null;
      return {
        target: 'gn16-query-modal',
        found: !!modal,
        isOpen: modal ? modal.classList.contains('open') : false,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        chartContainerHeight: chartRect ? chartRect.height : 0,
        svgExists: !!chartSvg,
        ok: modal && modal.classList.contains('open') && s.opacity !== '0' && rect.height > 0 && chartRect.height > 0 && !!chartSvg
      };
    })()`
  },
  {
    name: '04_scanner_pii_scrub.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo&modal=scanner`,
    desc: 'AI Proposal Scanner (Client-Side Deterministic PII Scrubber & Actuarial Parse)',
    preCaptureExpr: `(() => {
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
    })()`,
    assertExpr: `(() => {
      const modal = document.getElementById('proposal-scanner-modal');
      const scrubbed = document.getElementById('scanner-scrubbed-output');
      const s = modal ? window.getComputedStyle(modal) : null;
      const rect = modal ? modal.getBoundingClientRect() : null;
      const scrubText = scrubbed ? scrubbed.innerText : '';
      return {
        target: 'proposal-scanner-modal',
        found: !!modal,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        hasMaskedHkid: scrubText.includes('[HKID_PROTECTED]'),
        hasMaskedName: scrubText.includes('[CLIENT_NAME_PROTECTED]'),
        ok: modal && s.display !== 'none' && s.opacity !== '0' && rect.height > 0 && scrubText.includes('[HKID_PROTECTED]')
      };
    })()`
  },
  {
    name: '05_offline_mode.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo&offline=true`,
    desc: 'Offline Mode Indicator (LocalStorage & ServiceWorker Offline Resilience)',
    preCaptureExpr: `(() => {
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
      window.scrollTo(0, 0);
    })()`,
    assertExpr: `(() => {
      const banner = document.getElementById('offline-mode-banner');
      const s = banner ? window.getComputedStyle(banner) : null;
      const rect = banner ? banner.getBoundingClientRect() : null;
      return {
        target: 'offline-mode-banner',
        found: !!banner,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        bannerText: banner ? banner.innerText : '',
        ok: banner && s.display !== 'none' && s.opacity !== '0' && rect.height > 0
      };
    })()`
  },
  {
    name: '06_pricing_modal.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo&modal=pricing`,
    desc: 'Single Source of Truth Pricing Modal ($49, $199, $2480, $12800)',
    preCaptureExpr: `(() => {
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
    })()`,
    assertExpr: `(() => {
      const modal = document.getElementById('gn16-pay-modal');
      const tierCards = document.querySelectorAll('.gn16-tier-card');
      const s = modal ? window.getComputedStyle(modal) : null;
      const rect = modal ? modal.getBoundingClientRect() : null;
      return {
        target: 'gn16-pay-modal',
        found: !!modal,
        isOpen: modal ? modal.classList.contains('open') : false,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        tierCardCount: tierCards.length,
        ok: modal && modal.classList.contains('open') && s.opacity !== '0' && rect.height > 0 && tierCards.length >= 2
      };
    })()`
  },
  {
    name: '07_briefing_view.png',
    url: `http://localhost:${HTTP_PORT}/index.html?mode=demo#briefing`,
    desc: 'Unified Morning Briefing View (#briefing — 07:00 HKT Sync, GL16/GL27/GL28 & Strict Provenance)',
    preCaptureExpr: `(() => {
      const toast = document.getElementById('toast');
      if (toast) { toast.style.display = 'none'; toast.style.opacity = '0'; }
      if (typeof switchUnifiedView === 'function') switchUnifiedView('briefing');
    })()`,
    assertExpr: `(() => {
      const modal = document.getElementById('unified-briefing-modal');
      const nav = document.getElementById('unified-app-nav');
      const s = modal ? window.getComputedStyle(modal) : null;
      const rect = modal ? modal.getBoundingClientRect() : null;
      const text = modal ? modal.innerText : '';
      return {
        target: 'unified-briefing-modal',
        found: !!modal,
        display: s ? s.display : 'none',
        opacity: s ? s.opacity : '0',
        height: rect ? rect.height : 0,
        navPresent: !!nav,
        hasIllustrative: text.includes('Illustrative - not from an official illustration'),
        ok: modal && s.display !== 'none' && s.opacity !== '0' && rect.height > 0 && !!nav && text.includes('Illustrative - not from an official illustration')
      };
    })()`
  }
];

async function main() {
  console.log('================================================================================');
  console.log('STARTING ASSERTED SCREENSHOT CAPTURE ENGINE (TASK-R3-03 / R5 REMEDIATED)');
  console.log('================================================================================\n');

  const httpServer = startHttpServer();
  console.log(`[HTTP Server] Listening on http://localhost:${HTTP_PORT}`);

  // Launch Chrome with CDP remote debugging
  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    '--window-size=1280,1100',
    'about:blank'
  ];

  console.log(`[Chrome] Launching Chrome CDP on port ${CDP_PORT}...`);
  const chromeProc = spawn(CHROME_PATH, chromeArgs, { stdio: 'ignore' });

  // Wait for CDP endpoint
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      versionData = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (versionData && versionData.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!versionData || !versionData.webSocketDebuggerUrl) {
    chromeProc.kill();
    httpServer.close();
    throw new Error('Failed to connect to Chrome DevTools Protocol endpoint within 9 seconds.');
  }

  console.log(`[Chrome] Connected to CDP: ${versionData.Browser}`);

  // Query page target
  const targets = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const cdp = createCdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.ready;

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false
  });

  const assertionLog = [];
  assertionLog.push(`=== INSURINTEL HK: SCREENSHOT RECAPTURE DOM ASSERTION LEDGER (REMEDIATED) ===`);
  assertionLog.push(`Execution Timestamp: ${new Date().toISOString()}`);
  assertionLog.push(`Harness: Chrome Headless (${versionData.Browser}) via Chrome DevTools Protocol`);
  assertionLog.push(`Viewport: 1280x1100, Port: ${HTTP_PORT}\n`);

  for (const item of TARGET_VIEWS) {
    console.log(`[Capture] Navigating to: ${item.name} (${item.url})...`);
    await cdp.send('Page.navigate', { url: item.url });

    // Wait for DOM load & animation settle
    for (let i = 0; i < 40; i++) {
      const readyRes = await cdp.send('Runtime.evaluate', {
        expression: `document.readyState === 'complete' && !!document.getElementById('proposal-scanner-modal')`,
        returnByValue: true
      });
      if (readyRes?.result?.value === true) break;
      await sleep(200);
    }
    await sleep(400);

    // Run pre-capture alignment (scroll target into view & clear transient toast)
    if (item.preCaptureExpr) {
      await cdp.send('Runtime.evaluate', {
        expression: item.preCaptureExpr,
        returnByValue: true
      });
      await sleep(300);
    }

    // Evaluate assertion expression
    const evalRes = await cdp.send('Runtime.evaluate', {
      expression: item.assertExpr,
      returnByValue: true
    });

    const assertion = evalRes.result ? evalRes.result.value : { ok: false, error: 'No return value' };
    console.log(`  DOM Assertion Result for ${item.name}:`, JSON.stringify(assertion));

    assertionLog.push(`[TARGET: ${item.name}]`);
    assertionLog.push(`  Description : ${item.desc}`);
    assertionLog.push(`  URL         : ${item.url}`);
    assertionLog.push(`  DOM Check   : found=${assertion.found}, display=${assertion.display}, opacity=${assertion.opacity}, height=${assertion.height}px`);
    assertionLog.push(`  Details     : ${JSON.stringify(assertion)}`);
    assertionLog.push(`  Status      : ${assertion.ok ? 'VERIFIED_VISIBLE (PASS)' : 'VISIBILITY_FAILURE (FAIL)'}\n`);

    if (!assertion.ok) {
      console.error(`  [ERROR] DOM visibility assertion failed for ${item.name}!`, assertion);
      throw new Error(`DOM Visibility Assertion Failed for ${item.name}`);
    }

    // Capture screenshot
    const shotRes = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shotRes.data, 'base64');
    const outPath = path.join(SCREENSHOTS_DIR, item.name);
    fs.writeFileSync(outPath, buffer);

    // Copy to artifact directory when configured
    if (ARTIFACTS_SCREENSHOTS_DIR) {
      const artifactPath = path.join(ARTIFACTS_SCREENSHOTS_DIR, item.name);
      fs.writeFileSync(artifactPath, buffer);
    }

    const sizeKb = (buffer.length / 1024).toFixed(1);
    console.log(`  [SUCCESS] Captured ${item.name} (${sizeKb} KB) -> Written to dist/screenshots and artifact directory.\n`);
  }

  // Write assertions file
  fs.writeFileSync(ASSERTIONS_LOG_PATH, assertionLog.join('\n'), 'utf8');
  console.log(`[Assertions Log] Successfully written to ${ASSERTIONS_LOG_PATH}`);

  // Cleanup
  cdp.close();
  chromeProc.kill();
  httpServer.close();

  console.log('\n================================================================================');
  console.log('ALL 6 SCREENSHOTS RECAPTURED WITH 100% PASSING DOM ASSERTIONS!');
  console.log('================================================================================\n');
}

main().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});

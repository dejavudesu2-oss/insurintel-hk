import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { spawn, ChildProcess } from 'child_process';

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTTP_PORT = 3335;
const CDP_PORT = 9225;

// Baseline before U3: index.html (1,879,068) + cafe.html (1,879,068) + gn16_tracker.html (1,848,667) + morning_slides.html (206,450) + waitlist.html (31,986)
const BEFORE_U3_TOTAL_HTML_BYTES = 5845239;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function startStaticServer(): Promise<http.Server> {
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqUrl = (req.url || '/').split('?')[0].split('#')[0];
      const relPath = reqUrl === '/' ? '/index.html' : reqUrl;
      const filePath = path.join(DIST, relPath);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
    });
    server.listen(HTTP_PORT, '127.0.0.1', () => resolve(server));
  });
}

class CDPClient {
  private ws: any;
  private id = 0;
  private pending = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();

  constructor(wsUrl: string) {
    this.ws = new (globalThis as any).WebSocket(wsUrl);
    this.ws.addEventListener('message', (event: any) => {
      const msg = JSON.parse(typeof event.data === 'string' ? event.data : event.data.toString());
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)!;
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  async ready(): Promise<void> {
    if (this.ws.readyState === 1) return;
    await new Promise<void>((resolve, reject) => {
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (e: any) => reject(e));
    });
  }

  send(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function runTest() {
  console.log('=== VERIFICATION: U3 UNIFIED APP SHELL & REDIRECT STUB ===');

  // 1. Assert dist/gn16_tracker.html < 5 KB
  const gn16TrackerPath = path.join(DIST, 'gn16_tracker.html');
  assert.ok(fs.existsSync(gn16TrackerPath), 'dist/gn16_tracker.html must exist');
  const gn16Bytes = fs.statSync(gn16TrackerPath).size;
  assert.ok(
    gn16Bytes < 5000,
    `Expected dist/gn16_tracker.html < 5000 bytes, got ${gn16Bytes} bytes`
  );
  const gn16Html = fs.readFileSync(gn16TrackerPath, 'utf8');
  assert.ok(
    gn16Html.includes('index.html#gl16'),
    'dist/gn16_tracker.html must redirect to index.html#gl16'
  );
  console.log(`[PASS] dist/gn16_tracker.html is a ${gn16Bytes}-byte (< 5 KB) redirect stub to index.html#gl16.`);

  // 2. Assert total dist/*.html bytes decreased compared to pre-U3 baseline
  const htmlFiles = fs.readdirSync(DIST).filter((f) => f.endsWith('.html'));
  let afterTotalBytes = 0;
  for (const f of htmlFiles) {
    afterTotalBytes += fs.statSync(path.join(DIST, f)).size;
  }
  assert.ok(
    afterTotalBytes < BEFORE_U3_TOTAL_HTML_BYTES,
    `Expected total dist/*.html bytes (${afterTotalBytes}) < pre-U3 baseline (${BEFORE_U3_TOTAL_HTML_BYTES})`
  );
  console.log(
    `[PASS] Total dist/*.html bytes decreased from ${BEFORE_U3_TOTAL_HTML_BYTES} to ${afterTotalBytes} (-${BEFORE_U3_TOTAL_HTML_BYTES - afterTotalBytes} bytes).`
  );

  // 3. Headless DOM test proving all 5 views are reachable in 1 click and show required banners
  const server = await startStaticServer();
  const userDataDir = path.join(ROOT, '.chrome_u3_test_profile');
  let chromeProc: ChildProcess | null = null;

  try {
    chromeProc = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${userDataDir}`,
        'about:blank'
      ],
      { stdio: 'ignore' }
    );

    let targets: any[] = [];
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        if (res.ok) {
          targets = (await res.json()) as any[];
          if (targets.length > 0) break;
        }
      } catch {}
      await sleep(250);
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    assert.ok(pageTarget && pageTarget.webSocketDebuggerUrl, 'Failed to connect to headless Chrome CDP target');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      mobile: true
    });

    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/index.html` });
    for (let i = 0; i < 40; i++) {
      const readyRes = await cdp.send('Runtime.evaluate', {
        expression: `document.readyState === 'complete' && typeof window.switchUnifiedView === 'function' && !!document.getElementById('proposal-scanner-modal')`,
        returnByValue: true
      });
      if (readyRes?.result?.value === true) break;
      await sleep(200);
    }
    await sleep(300);

    const viewsToVerify = [
      {
        tabId: 'nav-tab-battlecard',
        expectedHash: '#battlecard',
        panelId: 'agent-view',
        label: 'Battlecard'
      },
      {
        tabId: 'nav-tab-gl16',
        expectedHash: '#gl16',
        panelId: 'gn16-query-modal',
        label: 'GL16'
      },
      {
        tabId: 'nav-tab-briefing',
        expectedHash: '#briefing',
        panelId: 'unified-briefing-modal',
        label: 'Briefing'
      },
      {
        tabId: 'nav-tab-scanner',
        expectedHash: '#scanner',
        panelId: 'proposal-scanner-modal',
        label: 'Scanner'
      },
      {
        tabId: 'nav-tab-pricing',
        expectedHash: '#pricing',
        panelId: 'gn16-pay-modal',
        label: 'Pricing'
      }
    ];

    for (const v of viewsToVerify) {
      // Perform 1 click on the persistent nav tab
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.getElementById('${v.tabId}');
          if (btn) btn.click();
        })()`,
        returnByValue: true
      });
      await sleep(250);

      const evalRes = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.getElementById('${v.tabId}');
          if (!btn) return { ok: false, reason: 'Missing tab button ${v.tabId}' };
          const panel = document.getElementById('${v.panelId}');
          if (!panel) return { ok: false, reason: 'Missing view panel ${v.panelId}' };
          const style = window.getComputedStyle(panel);
          const rect = panel.getBoundingClientRect();
          const panelVisible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0 && rect.height > 0;

          const topDateBanner = document.getElementById('top-date-banner');
          const demoModeBanner = document.getElementById('demo-mode-banner');
          const navBar = document.getElementById('unified-app-nav');
          const combinedVisibleText = [
            topDateBanner ? topDateBanner.innerText : '',
            demoModeBanner ? demoModeBanner.innerText : '',
            panel ? panel.innerText : ''
          ].join(' | ');

          const hasExternalModeLock = combinedVisibleText.includes('External Mode Lock') && !!demoModeBanner && window.getComputedStyle(demoModeBanner).display !== 'none';
          const hasIllustrativeBanner = combinedVisibleText.includes('Illustrative - not from an official illustration');
          const hasDataAsOf = combinedVisibleText.includes('Data as of');
          const navVisible = !!navBar && window.getComputedStyle(navBar).display !== 'none' && navBar.getBoundingClientRect().height > 0;
          const isTabActive = btn.getAttribute('aria-selected') === 'true';

          return {
            ok: panelVisible && hasExternalModeLock && hasIllustrativeBanner && hasDataAsOf && navVisible && isTabActive,
            hash: window.location.hash,
            panelVisible,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            height: rect.height,
            className: panel.className,
            inlineStyle: panel.getAttribute('style'),
            hasExternalModeLock,
            hasIllustrativeBanner,
            hasDataAsOf,
            navVisible,
            isTabActive
          };
        })()`,
        returnByValue: true
      });

      const val = evalRes?.result?.value;
      assert.ok(
        val && val.ok,
        `View ${v.label} (${v.expectedHash}) failed 1-click DOM check: ${JSON.stringify(val)}`
      );
      assert.strictEqual(
        val.hash,
        v.expectedHash,
        `Expected window.location.hash === '${v.expectedHash}', got '${val.hash}'`
      );
      console.log(
        `[PASS] View "${v.label}" (${v.expectedHash}) reachable in 1 click via #${v.tabId}; panel #${v.panelId} visible; External Mode Lock + Illustrative banner + Data as of verified.`
      );
    }

    cdp.close();
  } finally {
    if (chromeProc) {
      try {
        chromeProc.kill('SIGKILL');
      } catch {}
    }
    server.close();
    await sleep(300);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }

  console.log('=== ALL U3 UNIFIED APP SHELL CHECKS PASSED ===');
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});

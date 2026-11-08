"""
scripts/build_swiss_slides.py
Semantic Slide Deck Compiler for InsurIntel HK
Compiles templates/template-swiss-base.html into templates/morning_slides.html
and dist/morning_slides.html with 10 impactful Swiss-style slides matching morning_assembly_deck.pptx.
"""

import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
sys.path.insert(0, SCRIPT_DIR)
from build_morning_assembly_pptx import SLIDES_DATA

BASE_TEMPLATE_PATH = os.path.join(REPO_ROOT, "templates", "template-swiss-base.html")
OUTPUT_TEMPLATE_PATH = os.path.join(REPO_ROOT, "templates", "morning_slides.html")
DIST_SLIDES_PATH = os.path.join(REPO_ROOT, "dist", "morning_slides.html")

TARGET_TITLE = "InsurIntel HK · 晨會作戰速報：告別被競品牽著走 (10-Slide Swiss Deck)"

EXTRA_STYLES = """
<style id="extra-print-nav-styles">
  .speaker-notes {
    transition: all 0.2s ease;
  }
  body.ppt-presenter .speaker-notes {
    display: block !important;
    background: #fffbeb !important;
    border-left: 4px solid #f59e0b !important;
    color: #92400e !important;
    font-size: 14px !important;
  }
  body.ppt-audience .speaker-notes,
  body.ppt-preview .speaker-notes {
    display: none !important;
  }
  body.ppt-presenter .top-nav-battlecard-btn,
  body.ppt-audience .top-nav-battlecard-btn,
  body.ppt-preview .top-nav-battlecard-btn {
    display: none !important;
  }
  @media print {
    .speaker-notes { display: none !important; }
    .top-nav-battlecard-btn { display: none !important; }
    .hero-qr-badge { box-shadow: none !important; }
    body { background: #fff !important; }
    .slide { page-break-after: always !important; }
    .top-nav-battlecard-btn { display: none !important; }
  }
</style>
"""

INTERACTIVE_SCRIPT = """
<script id="morning-slides-interactive-script">
(function() {
  window.switchMatrixCategory = function(btn, cat) {
    document.querySelectorAll('.matrix-cat-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (cat === 'ci' || cat === 'vhis') {
      if (typeof window.go === 'function') window.go(3);
    } else if (cat === 'qdap') {
      if (typeof window.go === 'function') window.go(4);
    } else if (cat === 'ul') {
      if (typeof window.go === 'function') window.go(5);
    }
  };

  let timerInterval = null;
  let remainingSecs = 180;
  let isRunning = false;
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playChime(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      if (type === 'start') {
        [880, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.2, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });
      } else if (type === 'urgent') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'finish') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.25, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.55);
        });
      }
    } catch (e) {}
  }
  window.playChime = playChime;

  window.toggleMorningTimer = function() {
    const btn = document.getElementById('morning-timer-btn');
    const badge = document.getElementById('morning-timer-badge');
    const display = document.getElementById('morning-timer-display');
    if (!btn || !display) return;

    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      btn.innerText = '▶ 繼續計時';
      if (badge) badge.innerText = 'PAUSED';
    } else {
      isRunning = true;
      btn.innerText = '⏸ 暫停晨會';
      if (badge) badge.innerText = 'COUNTING';
      playChime('start');
      timerInterval = setInterval(() => {
        if (remainingSecs > 0) {
          remainingSecs--;
          const m = String(Math.floor(remainingSecs / 60)).padStart(2, '0');
          const s = String(remainingSecs % 60).padStart(2, '0');
          display.innerText = `${m}:${s}`;
          if (remainingSecs === 30) {
            playChime('urgent');
          }
          if (remainingSecs <= 30) {
            display.style.color = '#ff5500';
            if (badge) badge.innerText = 'URGENT';
          }
        } else {
          clearInterval(timerInterval);
          isRunning = false;
          display.innerText = '00:00';
          if (badge) badge.innerText = 'TIME UP';
          btn.innerText = '⏰ 晨會結束 · 全體開大單！';
          btn.style.background = '#10b981';
          playChime('finish');
        }
      }, 1000);
    }
  };

  window.resetMorningTimer = function() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSecs = 180;
    const btn = document.getElementById('morning-timer-btn');
    const badge = document.getElementById('morning-timer-badge');
    const display = document.getElementById('morning-timer-display');
    if (btn) {
      btn.innerText = '▶ 啟動 3 分鐘晨會';
      btn.style.background = 'var(--accent-orange,#FF5A00)';
    }
    if (badge) badge.innerText = 'READY (3:00)';
    if (display) {
      display.innerText = '03:00';
      display.style.color = '#fff';
    }
  };
})();
</script>
"""

def generate_slides_html():
    slides = []

    for idx, data in enumerate(SLIDES_DATA):
        slide_num = idx + 1
        pad = f"{slide_num:02d}"
        slide_id = f"slide-{pad}"
        num_label = f"{pad} / 10"

        if slide_num == 1:
            slide_html = f"""<!-- ============ {pad} · Hero Cover (晨會作戰速報) ============ -->
<section class="slide accent" data-animate="hero" data-slide-id="{slide_id}" data-layout="cover">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    <div class="chrome-min">
      <div class="l">{data['tag']}</div>
      <div class="r">{num_label}</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">HONG KONG INSURANCE AGENT DECISION SYSTEM</div>
      <h1 data-anim="title" style="align-self:center;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(8.5vw,14vh);line-height:.95;letter-spacing:-.03em;color:#fff">
        {data['title']}<br/><span style="font-style:italic;font-weight:300;font-size:0.6em;">{data['subtitle']}</span>
      </h1>
      <div data-anim="bottom" style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div data-anim="lead" class="lead" style="max-width:54ch;color:rgba(255,255,255,.88);font-size:max(16px,1.2vw);font-weight:300">
          {data['takeaway']}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:end">
          <div class="t-meta" style="color:rgba(255,255,255,.6)">持牌保險中介人內部決策專用 · 晨會 15 分鐘速報 · 數據截至：2026年11月09日</div>
          <!-- 动态 SVG 二维码：全组手机一扫直达见客卡 -->
          <a href="index.html" class="top-nav-battlecard-btn hero-qr-badge" title="手機掃描或點擊同步打開見客攻防卡" style="background:#ffffff;padding:8px 12px;border-radius:4px;display:inline-flex;align-items:center;gap:12px;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,0.3);cursor:pointer;transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='none'">
            <svg width="42" height="42" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;shape-rendering:crispEdges;">
              <rect width="29" height="29" fill="white"/>
              <path fill="#002FA7" d="M2 2h7v7H2V2zm1 1v5h5V3H3zm1 1h3v3H4V4zm14-2h7v7h-7V2zm1 1v5h5V3h-5zm1 1h3v3h-3V4zM2 20h7v7H2v-7zm1 1v5h5v-5H3zm1 1h3v3H4v-3z"/>
              <path fill="#002FA7" d="M10 4h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm-6 6v1h1v-1zm0 2v1h1v-1zm0 2v1h1v-1z"/>
              <path fill="#002FA7" d="M12 7h2v2h-2zm4 0h3v1h-3zm1 2h2v1h-2zm-5 2h3v1h-3zm5 0h1v2h-1zm-7 2h2v1h-2zm4 0h1v2h-1zm3 0h2v1h-2zm-5 3h2v1h-2zm3 0h1v2h-1zm3 0h2v2h-2zm-8 2h1v1h-1zm3 0h3v1h-3zm-5 2h2v1h-2zm4 0h1v2h-1zm3 0h3v1h-3zm-6 2h1v1h-1zm4 0h2v1h-2zm4 0h2v1h-2zm-7 2h3v1h-3zm5 0h1v1h-1zm3 0h1v1h-1z"/>
            </svg>
            <div style="text-align:left;line-height:1.2;">
              <div style="font-size:12px;font-weight:800;color:#002FA7;letter-spacing:0.3px;">📱 見客攻防卡</div>
              <div style="font-size:10px;color:#525252;font-family:var(--mono);margin-top:2px;">直達見客極速攻防卡 (index.html)</div>
            </div>
          </a>
        </div>
      </div>
    </div>
    <!-- Cantonese Speaker Notes Panel -->
    <aside class="speaker-notes" style="margin-top:16px;background:rgba(0,0,0,0.25);border-left:3px solid #ff5a00;padding:10px 14px;border-radius:4px;font-size:13px;color:#f8fafc;line-height:1.5;">
      <strong style="color:#ffb74d;">【廣東話講稿備忘 · 演講時間 1.5 分鐘】：</strong>
      <p style="margin:4px 0 0 0;">{data['notes'].replace(chr(10), '<br/>')}</p>
    </aside>
  </div>
</section>"""
        elif slide_num == 3:
            bullets_html = "".join([f"<li style='margin-bottom:8px;'>{b}</li>" for b in data['bullets']])
            slide_html = f"""<!-- ============ {pad} · GN16 Truth & Grand Matrix ============ -->
<section class="slide" data-animate="matrix-statement" data-slide-id="{slide_id}" data-layout="S15">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">{data['tag']}</div>
      <div class="r">{num_label}</div>
    </div>
    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">REGULATORY STATUTORY BENCHMARK</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.5vw,7.5vh);line-height:1;letter-spacing:-.02em;">
        {data['title']}
      </h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px;">{data['subtitle']}</p>
    </div>

    <!-- 动态大表 (Grand Comparison Matrix) -->
    <div class="matrix-table-container" style="max-height:36vh;overflow-y:auto;border:1px solid var(--border-subtle);border-radius:4px;margin:12px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead style="background:var(--paper);position:sticky;top:0;border-bottom:1px solid var(--border-strong);">
          <tr>
            <th style="padding:8px 12px;text-align:left;">保險公司</th>
            <th style="padding:8px 12px;text-align:left;">旗艦分紅產品</th>
            <th style="padding:8px 12px;text-align:center;">首年預繳保證利率</th>
            <th style="padding:8px 12px;text-align:center;">保證回本年期</th>
            <th style="padding:8px 12px;text-align:center;">保監局 GN16 實現率</th>
            <th style="padding:8px 12px;text-align:left;">客觀條款特點與限制</th>
          </tr>
        </thead>
        <tbody style="font-family:var(--sans),var(--sans-zh)">
          {{{{GRAND_MATRIX_HTML}}}}
        </tbody>
      </table>
    </div>

    <div style="background:rgba(0,47,167,0.04);border:1px solid rgba(0,47,167,0.15);padding:10px 14px;border-radius:4px;">
      <div style="font-weight:700;color:var(--accent);font-size:12px;margin-bottom:4px;">{data['takeaway']}</div>
      <ul style="margin:0;padding-left:18px;font-size:12px;color:var(--text-secondary);line-height:1.4;">
        {bullets_html}
      </ul>
    </div>

    <aside class="speaker-notes" style="margin-top:10px;background:#f8fafc;border-left:3px solid var(--accent);padding:8px 12px;border-radius:4px;font-size:12px;color:#334155;line-height:1.4;">
      <strong style="color:var(--accent);">【廣東話講稿備忘】：</strong>
      <p style="margin:4px 0 0 0;">{data['notes'].replace(chr(10), '<br/>')}</p>
    </aside>
  </div>
</section>"""
        else:
            bullets_html = "".join([f"<li style='margin-bottom:12px;font-size:max(14px,1.1vw);color:var(--text-primary);'>{b}</li>" for b in data['bullets']])
            slide_html = f"""<!-- ============ {pad} · {data['title']} ============ -->
<section class="slide" data-animate="slide-card" data-slide-id="{slide_id}" data-layout="standard">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">{data['tag']}</div>
      <div class="r">{num_label}</div>
    </div>

    <div style="margin-top:1.5vh;">
      <div class="t-meta" style="color:var(--accent);letter-spacing:0.18em;margin-bottom:6px;">INSURINTEL DECISION POINT</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:300;font-size:min(4.8vw,8vh);line-height:1.05;letter-spacing:-.02em;color:var(--ink);">
        {data['title']}
      </h2>
      <div style="font-size:max(15px,1.2vw);color:var(--text-secondary);margin-top:8px;font-weight:300;">
        {data['subtitle']}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:24px;margin:2vh 0;align-items:center;">
      <div style="background:var(--paper);border:1px solid var(--border-subtle);border-radius:6px;padding:20px 24px;">
        <div style="font-size:max(13px,0.95vw);font-weight:700;color:var(--accent);letter-spacing:0.05em;margin-bottom:12px;">
          📌 {data['takeaway']}
        </div>
        <ul style="margin:0;padding-left:20px;line-height:1.5;">
          {bullets_html}
        </ul>
      </div>

      <div style="background:rgba(0,47,167,0.03);border:1px solid rgba(0,47,167,0.12);border-radius:6px;padding:18px 20px;display:flex;flex-direction:column;gap:12px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-helper);letter-spacing:0.1em;">TACTICAL FOCUS · 實戰指引</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">
          • 對客溝通依循保監局 <strong>GL20</strong> 公平原則<br/>
          • 區分「保證退保價值」vs「非保證終期分紅」<br/>
          • 掃描方案前端脫敏保護客戶個資 (<strong>Cap. 486</strong>)
        </div>
        <div style="margin-top:6px;">
          <a href="index.html" class="top-nav-battlecard-btn" style="display:inline-block;padding:6px 12px;background:var(--accent);color:#fff;border-radius:4px;font-size:11px;text-decoration:none;font-weight:600;">
            見客攻防卡 ❯
          </a>
        </div>
      </div>
    </div>

    <aside class="speaker-notes" style="background:#f8fafc;border-left:3px solid var(--accent);padding:10px 14px;border-radius:4px;font-size:12px;color:#334155;line-height:1.45;">
      <strong style="color:var(--accent);">【廣東話講稿備忘 · 講者請讀】：</strong>
      <p style="margin:4px 0 0 0;">{data['notes'].replace(chr(10), '<br/>')}</p>
    </aside>
  </div>
</section>"""
        slides.append(slide_html)

    return "\n\n".join(slides)

def compile_swiss_slides(base_html: str, target_title: str) -> str:
    html = base_html

    # Semantic title replacement
    html = re.sub(r'<title>.*?</title>', f'<title>{target_title}</title>', html, count=1, flags=re.IGNORECASE)

    # Inject extra styles
    if '@media print' not in html:
        html = html.replace('</head>', f'{EXTRA_STYLES}\n</head>')

    # Generate slides
    slides_content = generate_slides_html()

    # Replace deck
    deck_pattern = re.compile(r'(<div\s+id=[\'"]deck[\'"][^>]*>)[\s\S]*?(</div>\s*<div\s+id=[\'"]nav[\'"])', re.IGNORECASE)
    if deck_pattern.search(html):
        html = deck_pattern.sub(f'\\1\n{slides_content}\n\\2', html)
    else:
        html = html.replace('<div id="deck">', f'<div id="deck">\n{slides_content}')

    # Inject interactive script
    html = html.replace('</body>', f'{INTERACTIVE_SCRIPT}\n</body>', 1)

    # Inject toolbar with ppt-hint-link and window.print()
    toolbar_html = """<div class="toolbar" id="toolbar" style="display:flex;gap:12px;align-items:center;padding:8px 16px;background:var(--paper);border-bottom:1px solid var(--border-subtle)">
  <a href="index.html" class="top-nav-battlecard-btn" style="text-decoration:none;color:var(--accent);font-weight:700;font-size:12px;">📱 見客攻防卡</a>
  <a href="#" class="ppt-hint-link" style="display:none;" title="快捷鍵提示">快捷鍵提示</a>
  <button class="top-nav-print-btn" onclick="window.print()" style="cursor:pointer;padding:4px 8px;border-radius:4px;border:1px solid var(--border-subtle);background:#fff;font-size:11px;">🖨️ 列印 PDF</button>
</div>"""
    html = html.replace('<div id="deck">', f'{toolbar_html}\n<div id="deck">')

    return html

def main():
    if not os.path.exists(BASE_TEMPLATE_PATH):
        raise FileNotFoundError(f"Base template not found at: {BASE_TEMPLATE_PATH}")

    with open(BASE_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        base_html = f.read()

    full_content = compile_swiss_slides(base_html, TARGET_TITLE)

    with open(OUTPUT_TEMPLATE_PATH, "w", encoding="utf-8") as f:
        f.write(full_content)

    os.makedirs(os.path.dirname(DIST_SLIDES_PATH), exist_ok=True)
    with open(DIST_SLIDES_PATH, "w", encoding="utf-8") as f:
        f.write(full_content)

    print(f"[InsurIntel] Successfully compiled 10-slide Swiss morning deck to templates & dist ({len(full_content)} chars)!")

if __name__ == "__main__":
    main()

"""
scripts/build_swiss_slides.py
Semantic Slide Deck Compiler for InsurIntel HK

Compiles templates/template-swiss-base.html into templates/morning_slides.html
using robust semantic boundaries and dynamic token placeholders.
Expanded to 8 impactful Swiss-style slides.
"""

import os
import re
import sys

# Directory-relative path resolution
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
BASE_TEMPLATE_PATH = os.path.join(REPO_ROOT, "templates", "template-swiss-base.html")
OUTPUT_TEMPLATE_PATH = os.path.join(REPO_ROOT, "templates", "morning_slides.html")

TARGET_TITLE = "InsurIntel HK · 香港保險早會市場情報與攻防對策系統"

SLIDES_CONTENT = """<!-- ============ 01 · Hero Cover · IKB 满屏 + ASCII 呼吸场 ============ -->
<section class="slide accent" data-animate="hero" data-slide-id="cover" data-layout="cover">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    <div class="chrome-min">
      <div class="l">INSURINTEL HK · MORNING INTELLIGENCE</div>
      <div class="r">ISSUE {{DATE}} · 01 / 08</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">HONG KONG INSURANCE AGENT DECISION SYSTEM</div>
      <h1 data-anim="title" style="align-self:center;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(10.5vw,17vh);line-height:.95;letter-spacing:-.03em;color:#fff">
        全港保險早會<br/><span style="font-style:italic;font-weight:300">3分鐘情報速報</span>
      </h1>
      <div data-anim="bottom" style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div data-anim="lead" class="lead" style="max-width:54ch;color:rgba(255,255,255,.88);font-size:max(16px,1.2vw);font-weight:300">
          5 大險種 42 款產品矩陣 · 預繳保證利率排行 · 保監局 GN16 官方實現率 · 融資槓桿與對抗戰策
        </div>
        <div style="display:flex;justify-content:space-between;align-items:end">
          <div class="t-meta" style="color:rgba(255,255,255,.6)">持牌保險中介人內部決策專用 · 每日 07:45 實時更新 · {{LAST_UPDATED}}</div>
          <!-- 动态 SVG 二维码：全组手机一扫直达见客卡 -->
          <a href="index.html" class="hero-qr-badge" title="手機掃描或點擊同步打開見客攻防卡" style="background:#ffffff;padding:8px 12px;border-radius:4px;display:inline-flex;align-items:center;gap:12px;text-decoration:none;box-shadow:0 4px 16px rgba(0,0,0,0.3);cursor:pointer;transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform='none'">
            <svg width="42" height="42" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;shape-rendering:crispEdges;">
              <rect width="29" height="29" fill="white"/>
              <!-- Position Detection Patterns Top-Left, Top-Right, Bottom-Left -->
              <path fill="#002FA7" d="M2 2h7v7H2V2zm1 1v5h5V3H3zm1 1h3v3H4V4zm14-2h7v7h-7V2zm1 1v5h5V3h-5zm1 1h3v3h-3V4zM2 20h7v7H2v-7zm1 1v5h5v-5H3zm1 1h3v3H4v-3z"/>
              <!-- Timing Patterns -->
              <path fill="#002FA7" d="M10 4h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm-6 6v1h1v-1zm0 2v1h1v-1zm0 2v1h1v-1z"/>
              <!-- Data Modules representing index.html / mobile cafe -->
              <path fill="#002FA7" d="M12 7h2v2h-2zm4 0h3v1h-3zm1 2h2v1h-2zm-5 2h3v1h-3zm5 0h1v2h-1zm-7 2h2v1h-2zm4 0h1v2h-1zm3 0h2v1h-2zm-5 3h2v1h-2zm3 0h1v2h-1zm3 0h2v2h-2zm-8 2h1v1h-1zm3 0h3v1h-3zm-5 2h2v1h-2zm4 0h1v2h-1zm3 0h3v1h-3zm-6 2h1v1h-1zm4 0h2v1h-2zm4 0h2v1h-2zm-7 2h3v1h-3zm5 0h1v1h-1zm3 0h1v1h-1z"/>
            </svg>
            <div style="text-align:left;line-height:1.2;">
              <div style="font-size:12px;font-weight:800;color:#002FA7;letter-spacing:0.3px;">📱 全組掃描同步實操</div>
              <div style="font-size:10px;color:#525252;font-family:var(--mono);margin-top:2px;">直達見客極速攻防卡 (index.html)</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ 02 · S03 Split Statement (🚨 今日震撼彈) ============ -->
<section class="slide split" data-animate="split-statement" data-slide-id="flash-alerts" data-layout="S03">
  <div class="canvas-card">
    <div class="split-half">
      <!-- 左半 · 巨号 Data Hero 突显利率跳升 -->
      <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
        <div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1">
          <div class="l">02 / 08</div>
          <div class="r">BREAKING ALERT</div>
        </div>
        <div data-anim="manifesto" style="display:flex;flex-direction:column;gap:1.8vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">TOP PREPAYMENT RATE</div>
          <h2 style="font-family:var(--sans);font-size:min(12vw,20vh);line-height:.88;letter-spacing:-.04em;font-weight:200;color:#fff">5.80<span style="font-size:min(5vw,8vh);font-weight:300">%</span></h2>
          <div style="font-family:var(--sans),var(--sans-zh);font-size:max(18px,1.4vw);font-weight:300;color:rgba(255,255,255,.9);line-height:1.4">
            保誠「雋富」突發拔高 5 年期預繳利息，搶奪 11 月年終資金！
          </div>
        </div>
        <div data-anim="signature" style="border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.7)">⚠️ 關鍵條款：通函註明僅保證首 1 年，次年回到市場浮動利率</div>
        </div>
      </div>
      <!-- 右半 · 今日三大突发快讯卡片 (动态注入占位符) -->
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min">
          <div class="l">TODAY'S FLASH ALERTS</div>
          <div class="r">3 UPDATES</div>
        </div>
        <div data-anim="rules" style="display:flex;flex-direction:column;gap:1.4vh;flex:1;justify-content:center">
          {{FLASH_ALERTS_HTML}}
        </div>
        <div class="t-meta" style="color:var(--text-helper);text-align:right">→ 詳情見下頁全維度對比大表</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ 03 · S15 Matrix + Hero Stat (📊 5 大行儲蓄險全維度矩陣) ============ -->
<section class="slide" data-animate="matrix-statement" data-slide-id="savings-matrix" data-layout="S15">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">GRAND COMPARISON MATRIX · 5 MAJOR INSURERS</div>
      <div class="r">03 / 08</div>
    </div>
    
    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">SAVINGS BENCHMARK MATRIX</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.8vw,8.5vh);line-height:1;letter-spacing:-.02em;">
          全港主流儲蓄分紅險·全維度對比總表
        </h2>
        <!-- 险种交互标签栏 (Category Tabs) -->
        <div class="matrix-cat-tabs">
          <button class="matrix-cat-pill active" onclick="switchMatrixCategory(this, 'all')">📈 全港儲蓄旗艦 (8款)</button>
          <button class="matrix-cat-pill" onclick="switchMatrixCategory(this, 'ci')">🛡️ 危疾等待期對決 (直達頁 4)</button>
          <button class="matrix-cat-pill" onclick="switchMatrixCategory(this, 'vhis')">🏥 自願醫保免找數 (直達頁 4)</button>
          <button class="matrix-cat-pill" onclick="switchMatrixCategory(this, 'qdap')">👴 QDAP 扣稅回報 (直達頁 5)</button>
          <button class="matrix-cat-pill" onclick="switchMatrixCategory(this, 'ul')">🏦 萬用融資利差 (直達頁 6)</button>
        </div>
      </div>
    </div>

    <!-- 瑞士极细网格数据表格 -->
    <div style="overflow-x:auto;margin:8px 0">
      <table class="grand-matrix-table" style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid var(--text-primary)">
        <thead>
          <tr style="border-bottom:1px solid var(--border-subtle);text-align:left;font-family:var(--mono);font-size:12px;color:var(--text-secondary)">
            <th style="padding:10px 12px">保險公司</th>
            <th style="padding:10px 12px">主力旗艦產品</th>
            <th style="padding:10px 12px">預繳利率 (鎖定期)</th>
            <th style="padding:10px 12px">首年最高回贈</th>
            <th style="padding:10px 12px">GN16 官方實現率</th>
            <th style="padding:10px 12px">回本期 (保證/預期)</th>
            <th style="padding:10px 12px">30年預期 IRR</th>
            <th style="padding:10px 12px">核心傳承功能</th>
            <th style="padding:10px 12px">限時免體檢額度</th>
          </tr>
        </thead>
        <tbody style="font-family:var(--sans),var(--sans-zh)">
{{GRAND_MATRIX_HTML}}
        </tbody>
      </table>
    </div>

    <!-- 底部 Data Hero Stat -->
    <div style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid var(--border-subtle);padding-top:14px">
      <div style="display:flex;align-items:baseline;gap:1.5vw">
        <span style="font-family:var(--sans);font-size:min(5vw,9vh);font-weight:200;line-height:.9;color:var(--accent)">96.5%</span>
        <span style="font-size:14px;color:var(--text-secondary);max-width:40ch">保監局 GN16 官方累積分紅實現率：收益確定性的終極生命線</span>
      </div>
      <div class="t-meta" style="color:var(--text-helper)">💡 點擊任一行開啟聚光燈 (Spotlight) 懸停聚焦 · SOURCE: HK IA GN16</div>
    </div>
  </div>
</section>

<!-- ============ 04 · S19 Four Cards (🛡️ 非儲蓄類深度拆局) ============ -->
<section class="slide" data-animate="four-cards" data-slide-id="protection-categories" data-layout="S19">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">PROTECTION & TAX-DEDUCTIBLE RADAR</div>
      <div class="r">04 / 08</div>
    </div>

    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">CRITICAL ILLNESS · VHIS · QDAP</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.8vw,8.5vh);line-height:1;letter-spacing:-.02em;margin-bottom:24px">
        非儲蓄類旗艦產品保障條款與扣稅對決
      </h2>
    </div>

    <!-- 四列均分瑞士卡片 -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;flex:1">
      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:24px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">01 · CRITICAL ILLNESS</div>
          <h3 style="font-size:20px;font-weight:500;margin-bottom:12px">癌症索償間隔 2 年</h3>
          <p style="font-size:14px;line-height:1.6;color:var(--text-secondary)">
            富衛「危疾加諾」將癌症再次索償等待期縮短至 <strong>2 年</strong>（市場主流仍需 3 年）。每多等 1 年就多承擔 1 年自費風險。
          </p>
        </div>
        <div style="font-family:var(--mono);font-size:12px;color:var(--text-helper)">WAITING: 2 YRS</div>
      </div>

      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:24px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">02 · ICU SAFETY NET</div>
          <h3 style="font-size:20px;font-weight:500;margin-bottom:12px">深切治療部 100% 預支</h3>
          <p style="font-size:14px;line-height:1.6;color:var(--text-secondary)">
            針對未知新病毒或嚴重併發症，連續入住 ICU 達 3~5 天無需符合指定病名，直接預支最高 <strong>100%</strong> 保額現金。
          </p>
        </div>
        <div style="font-family:var(--mono);font-size:12px;color:var(--text-helper)">COVERAGE: FULL ICU</div>
      </div>

      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:24px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">03 · VHIS MEDICAL</div>
          <h3 style="font-size:20px;font-weight:500;margin-bottom:12px">標靶藥全額 + 出院免找數</h3>
          <p style="font-size:14px;line-height:1.6;color:var(--text-secondary)">
            自願醫保靈活計劃標靶藥物無細項限額全數賠償。專屬中介人提供<strong>全流程出院免找數 (Cashless)</strong> 服務，勝過純網上客服。
          </p>
        </div>
        <div style="font-family:var(--mono);font-size:12px;color:var(--text-helper)">TAX CAP: HK$8,000</div>
      </div>

      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:24px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">04 · QDAP ANNUITY</div>
          <h3 style="font-size:20px;font-weight:500;margin-bottom:12px">每年實慳 $10,200 稅款</h3>
          <p style="font-size:14px;line-height:1.6;color:var(--text-secondary)">
            合資格延期年金每年法定扣稅上限高達 <strong>HK$60,000</strong>，最高稅階 17% 直接獲取 HK$10,200 現金省稅，保證 IRR 佔比最高。
          </p>
        </div>
        <div style="font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:600">SAVE: HK$10,200</div>
      </div>
    </div>

    <div class="t-meta" style="color:var(--text-helper);padding-top:14px;border-top:1px solid var(--border-subtle)">
      中介人見客建議：儲蓄保單簽單時，同場搭售 VHIS 靈活計劃與 QDAP 年金，享有組合加碼折扣
    </div>
  </div>
</section>

<!-- ============ 05 · S12 Dual (👴 QDAP 扣稅年金與稅務籌劃排陣) ============ -->
<section class="slide" data-animate="four-cards" data-slide-id="qdap-annuity" data-layout="S12">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">QDAP RETIREMENT & TAX-SAVING LADDER</div>
      <div class="r">05 / 08</div>
    </div>

    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">STATUTORY TAX DEDUCTION · HK$60,000 CAP</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.8vw,8.5vh);line-height:1;letter-spacing:-.02em;margin-bottom:20px">
        QDAP 扣稅延期年金·稅務籌劃與保證回報階梯
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;flex:1;align-items:stretch">
      <!-- 左栏：税阶现金回赠试算 -->
      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:22px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">TAX REBATE CALCULATOR</div>
          <h3 style="font-size:19px;font-weight:600;margin-bottom:14px">🧮 稅階 17% 現金回贈試算表 (年度上限 HK$60,000)</h3>
          <table style="width:100%;font-size:13px;border-collapse:collapse;line-height:1.8">
            <thead>
              <tr style="border-bottom:1px solid var(--border-subtle);color:var(--text-secondary);font-family:var(--mono);text-align:left">
                <th style="padding:6px 0">應課稅收入區間</th>
                <th style="padding:6px 0">累進邊際稅階</th>
                <th style="padding:6px 0;text-align:right">每年實際慳稅</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
                <td style="padding:6px 0">HK$200,000 級別</td>
                <td style="padding:6px 0"><span class="rate-badge">2% - 6%</span></td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700">HK$1,200 - $3,600</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
                <td style="padding:6px 0">HK$350,000 級別</td>
                <td style="padding:6px 0"><span class="rate-badge">10% - 14%</span></td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700">HK$6,000 - $8,400</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(0,0,0,0.06);background:rgba(0,47,167,0.04)">
                <td style="padding:6px 0"><strong>HK$500,000+ 頂級</strong></td>
                <td style="padding:6px 0"><span class="rate-badge" style="background:var(--accent);color:#fff">最高 17%</span></td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700;color:var(--accent)">HK$10,200 (立省17%)</td>
              </tr>
              <tr style="color:var(--green)">
                <td style="padding:6px 0"><strong>夫婦合併申報 (共$12萬)</strong></td>
                <td style="padding:6px 0"><span class="rate-badge" style="background:#10b981;color:#fff">雙倍額度</span></td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700">HK$20,400 / 每年</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="background:#fff;border-left:3px solid var(--accent);padding:10px 12px;font-size:12px;color:var(--text-secondary);margin-top:12px">
          💡 <strong>開單金句：</strong>「陳生，唔好先計 30 年複利！買 QDAP 等同第一年特區政府即時現金補貼您 <strong>17% ($10,200)</strong>，零風險鎖定確定性！」
        </div>
      </div>

      <!-- 右栏：全港 8 大 QDAP 内部回报率阶梯 -->
      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:22px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">INTERNAL RATE OF RETURN (IRR)</div>
          <h3 style="font-size:19px;font-weight:600;margin-bottom:14px">📊 全港 8 大 QDAP 保證內部回報率與首期年金階梯</h3>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
            <div style="background:#fff;padding:10px 14px;border-radius:2px;border:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="color:var(--accent)">中銀人壽 · 延期年金計劃 (Catch Up)</strong>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">保證成分高達 52.0% · 最短 5 年供款 10 年起派</div>
              </div>
              <div style="text-align:right;font-family:var(--mono)"><span style="color:var(--accent);font-weight:700;font-size:15px">3.05%</span><br/><span style="font-size:10px;color:var(--text-helper)">保證 IRR</span></div>
            </div>
            <div style="background:#fff;padding:10px 14px;border-radius:2px;border:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="color:var(--accent)">友邦 AIA · 延期年金計劃</strong>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">保證比例 52.0% · 銜接頂尖醫療直付網絡</div>
              </div>
              <div style="text-align:right;font-family:var(--mono)"><span style="color:var(--accent);font-weight:700;font-size:15px">2.85%</span><br/><span style="font-size:10px;color:var(--text-helper)">保證 IRR</span></div>
            </div>
            <div style="background:#fff;padding:10px 14px;border-radius:2px;border:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong>宏利 / 富衛 / 保誠 / 萬通 / 安盛 / 永明</strong>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">總預期 IRR 達 3.8% ~ 4.6% · 提供非保證分紅增值</div>
              </div>
              <div style="text-align:right;font-family:var(--mono)"><span style="font-weight:700;font-size:15px">4.20%</span><br/><span style="font-size:10px;color:var(--text-helper)">預期總 IRR</span></div>
            </div>
          </div>
        </div>
        <div class="t-meta" style="color:var(--text-helper);margin-top:12px">
          保監局認可標籤：持有至領取期滿本金 100% 保證無損 · 退休專用現金流
        </div>
      </div>
    </div>

    <div class="t-meta" style="color:var(--text-helper);padding-top:12px;border-top:1px solid var(--border-subtle)">
      💡 實戰策略：每年 11 月至 3 月稅季，主打「扣稅 HK$10,200 + 保證養老金」，客戶簽單決策速度最快
    </div>
  </div>
</section>

<!-- ============ 06 · S05 Lever (🏦 萬用壽險與保費融資 85% LTV 槓桿試算) ============ -->
<section class="slide" data-animate="four-cards" data-slide-id="universal-life-financing" data-layout="S05">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">UNIVERSAL LIFE · 85% LTV PREMIUM FINANCING</div>
      <div class="r">06 / 08</div>
    </div>

    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">HIGH NET WORTH LEVERAGE & SPREAD ARBITRAGE</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.8vw,8.5vh);line-height:1;letter-spacing:-.02em;margin-bottom:20px">
        萬用壽險 (UL) 85% LTV 保費融資槓桿與利差測試
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;flex:1;align-items:stretch">
      <!-- 左栏：85% LTV 融资杠杆模型 -->
      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:22px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">CAPITAL LEVERAGE ARCHITECTURE</div>
          <h3 style="font-size:19px;font-weight:600;margin-bottom:14px">🏦 85% LTV 私人銀行融資配資架構 (大客開單必備)</h3>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div style="background:#fff;padding:12px;border-left:3px solid var(--accent)">
              <div class="t-meta" style="color:var(--text-helper)">客戶實際出資 (15%)</div>
              <div style="font-family:var(--sans);font-size:24px;font-weight:700;color:var(--accent)">HK$150萬</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">自有本金鎖定首期</div>
            </div>
            <div style="background:#fff;padding:12px;border-left:3px solid #10b981">
              <div class="t-meta" style="color:var(--text-helper)">銀行融資配資 (85%)</div>
              <div style="font-family:var(--sans);font-size:24px;font-weight:700;color:#10b981">HK$850萬</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">私人銀行低息保單抵押借貸</div>
            </div>
          </div>

          <div style="background:rgba(0,47,167,0.05);padding:12px 14px;border-radius:2px;border:1px solid rgba(0,47,167,0.15)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600;font-size:14px">總保單資產規模 (放大 6.67 倍)</span>
              <span style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--accent)">HK$1,000萬</span>
            </div>
            <p style="font-size:12px;color:var(--text-secondary);margin-top:6px;line-height:1.5">
              高淨值企業主以 HK$150 萬低成本啟動，即時構建 <strong>HK$3,000 萬至 $5,000 萬</strong>等值人壽保障，並坐享千萬本金派息利差！
            </p>
          </div>
        </div>

        <div class="t-meta" style="color:var(--text-helper);margin-top:10px">
          適用客群：外貿出口商、企業主、上市公司高管、新投資移民 (CIES)
        </div>
      </div>

      <!-- 右栏：HIBOR/Prime 利差敏感度压力测试 -->
      <div style="background:var(--grey-1);border-top:3px solid var(--accent);padding:22px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta" style="color:var(--accent);margin-bottom:8px">NET SPREAD STRESS TEST</div>
          <h3 style="font-size:19px;font-weight:600;margin-bottom:14px">📈 全港 8 大 UL 結算派息 vs 融資借貸成本淨息差</h3>
          
          <table style="width:100%;font-size:12px;border-collapse:collapse;line-height:1.8">
            <thead>
              <tr style="border-bottom:1px solid var(--border-subtle);color:var(--text-secondary);font-family:var(--mono);text-align:left">
                <th style="padding:6px 0">萬用壽險產品</th>
                <th style="padding:6px 0">結算派息率</th>
                <th style="padding:6px 0">融資成本 (HIBOR+)</th>
                <th style="padding:6px 0;text-align:right">淨息差 (Net Spread)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
                <td style="padding:6px 0"><strong>萬通 · Infinity 萬用壽險</strong></td>
                <td style="padding:6px 0;font-family:var(--mono)">5.50%</td>
                <td style="padding:6px 0;font-family:var(--mono)">3.85%</td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700;color:var(--accent)">+1.65%</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
                <td style="padding:6px 0"><strong>富衛 · MaxFocus 萬用壽險</strong></td>
                <td style="padding:6px 0;font-family:var(--mono)">5.40%</td>
                <td style="padding:6px 0;font-family:var(--mono)">3.85%</td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700;color:var(--accent)">+1.55%</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
                <td style="padding:6px 0"><strong>友邦 · Platinum 財富萬用</strong></td>
                <td style="padding:6px 0;font-family:var(--mono)">5.35%</td>
                <td style="padding:6px 0;font-family:var(--mono)">3.90%</td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700;color:var(--accent)">+1.45%</td>
              </tr>
              <tr>
                <td style="padding:6px 0"><strong>安盛 / 保誠 / 宏利 / 永明</strong></td>
                <td style="padding:6px 0;font-family:var(--mono)">5.25% - 5.35%</td>
                <td style="padding:6px 0;font-family:var(--mono)">3.80% - 3.90%</td>
                <td style="padding:6px 0;text-align:right;font-family:var(--mono);font-weight:700;color:var(--accent)">+1.42% ~ +1.48%</td>
              </tr>
            </tbody>
          </table>

          <div style="background:#fff;border-left:3px solid #10b981;padding:10px 12px;font-size:12px;color:var(--text-secondary);margin-top:10px">
            🛡️ <strong>利差防禦底線：</strong>全線產品設有 <strong>2.0% - 2.5%</strong> 最低保證結算派息率，有效抵禦全球極端降息週期風險。
          </div>
        </div>

        <div class="t-meta" style="color:var(--text-helper);margin-top:10px">
          金管局 (HKMA) & 保監局 (IA) 監管合規要求：嚴格進行壓力測試與流動性覆核
        </div>
      </div>
    </div>

    <div class="t-meta" style="color:var(--text-helper);padding-top:12px;border-top:1px solid var(--border-subtle)">
      ⚖️ 融資開單核心：保單生效日起由私行出資 85%，淨息差滾存大幅提升資本內部回報率 (IRR 衝破 12%+)
    </div>
  </div>
</section>

<!-- ============ 07 · S08 Duo Compare (🥊 即時攻防對抗話術卡片) ============ -->
<section class="slide" data-animate="duo-mirror" data-slide-id="counter-pitch" data-layout="S08">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">COUNTER-PITCH BATTLE CARDS</div>
      <div class="r">07 / 08</div>
    </div>

    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">FRONT-LINE OBJECTION HANDLING</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.8vw,8.5vh);line-height:1;letter-spacing:-.02em;margin-bottom:16px">
        客睇緊競品？3 招精準反打話術卡
      </h2>
    </div>

    <!-- 左右双轨对照 -->
    <div class="duo-compare" style="flex:1;display:grid;grid-template-columns:1fr auto 1.25fr;gap:3vw;align-items:stretch;margin:12px 0">
      <div style="background:var(--grey-1);padding:24px;border-left:3px solid var(--grey-3);display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <span class="t-cat" style="color:var(--grey-3)">CLIENT'S VIEW · 表面噱頭</span>
          <h3 style="font-size:22px;font-weight:500;margin:10px 0 16px">「對手預繳 5.8% 仲送 28% 回贈，點解買你？」</h3>
          <ul style="font-size:14px;line-height:1.8;color:var(--text-secondary);list-style-position:inside">
            <li>表面亮點：保誠首年宣傳折扣達 28%</li>
            <li>預繳利率：標榜 5.80% 創季度新高</li>
            <li>互聯網醫保：網上 Bowtie 好平無 Agent 佣金</li>
          </ul>
        </div>
        <div class="t-meta" style="color:var(--text-helper)">盲點：忽視次年利率浮動、歷史實現率與理賠兜底服務</div>
      </div>

      <span class="vrule" style="width:1px;background:var(--border-subtle);align-self:stretch"></span>

      <div style="background:rgba(0,47,167,.04);border-left:3px solid var(--accent);padding:24px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <span class="t-cat" style="color:var(--accent)">TACTICAL COUNTER-PITCH · 專業破局話術</span>
          <h3 style="font-size:20px;font-weight:500;color:var(--accent);margin:10px 0 14px">3 大維度精準破局（廣東話實戰話術）：</h3>
          <div style="font-size:14px;line-height:1.7;color:var(--text-primary)">
            <p style="margin-bottom:10px">
              <strong>1. 拆解 1 年預繳噱頭：</strong>「陳生，對手個 5.8% 確實好吸引，但細看通函佢『只保證頭 1 年』，第 2 年按市場浮動；面對降息週期，第二年極易跳水。我地方案中長線鎖定更具確定性！」
            </p>
            <p style="margin-bottom:10px">
              <strong>2. 亮出 GN16 官方實現率：</strong>「買分紅險最緊要睇保監局官方實現率！我地旗艦系列歷年累積實現率高達 <strong>96.5%</strong>（對手約 91.2%）。30年複利落黎，實現率差 5% 就係幾十萬真金白銀嘅分別！」
            </p>
            <p>
              <strong>3. 大病出院免找數價值：</strong>「網上醫保入院報銷要病人自己對住客服 Bot；而專屬中介人提供全流程出院免找數跟進與醫生協調，患病時專人服務嘅價值遠超一年一千幾百差額！」
            </p>
          </div>
        </div>

        <div style="background:#fff;border:1px dashed var(--accent);padding:10px 14px;margin-top:12px">
          <strong style="color:var(--accent);font-size:12px;font-family:var(--mono)">📲 今日見客一鍵 WhatsApp 模板：</strong>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:4px">
            「陳生早晨！最近留意到市場預繳利息戰好激烈，有保司推 5.8%。我幫您做咗份全港 5 年期預繳利息與次年浮動條款對比表，如果您有興趣鎖定中長線穩定收益，我發份比對表俾您參考！」
          </p>
        </div>
      </div>
    </div>

    <div class="t-meta" style="color:var(--text-helper);padding-top:12px;border-top:1px solid var(--border-subtle)">
      ⚖️ 香港保監局《持牌中介人操守守則》(GL20) 合規指引：比較時保持客觀公正，不刻意隱瞞對手首期優惠
    </div>
  </div>
</section>

<!-- ============ 08 · S10 Split Closing (🎯 主管 3 分鐘晨會講稿) ============ -->
<section class="slide split" data-animate="split-statement" data-slide-id="manager-speech" data-layout="S10">
  <div class="canvas-card">
    <div class="split-half">
      <!-- 左半 · IKB 宣言 + ASCII 呼吸场 + 3分钟倒计时器 -->
      <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
        <canvas class="ascii-bg" aria-hidden="true"></canvas>
        <div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1">
          <div class="l">08 / 08</div>
          <div class="r">DIRECTOR BRIEF</div>
        </div>

        <div data-anim="manifesto" style="display:flex;flex-direction:column;gap:1.6vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em;">MORNING AGENDA</div>
          <h2 style="font-family:var(--sans),var(--sans-zh);font-size:min(6vw,10vh);line-height:.95;letter-spacing:-.025em;font-weight:200;color:#fff">
            晨會 3 分鐘<br/><span style="font-style:italic;font-weight:300">帶組實戰指令</span>
          </h2>
          <div style="font-family:var(--sans),var(--sans-zh);font-size:max(13px,0.92vw);line-height:1.5;color:rgba(255,255,255,.85);font-weight:300;max-width:38ch;">
            08:30 晨會議程：<br/>5分鐘市場速遞 $\\to$ 10分鐘競品對練 $\\to$ 5分鐘衝刺號召
          </div>

          <!-- 3 分钟晨会专属数字倒计时器部件 -->
          <div class="morning-timer-box" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);border-radius:4px;padding:12px 14px;margin-top:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.8);letter-spacing:.1em;">DRILL TIMER</span>
              <span id="morning-timer-badge" style="font-size:10px;padding:2px 6px;border-radius:2px;background:rgba(255,255,255,.2);color:#fff;font-family:var(--mono);">READY (3:00)</span>
            </div>
            <div id="morning-timer-display" style="font-family:var(--mono);font-size:min(5vw,36px);font-weight:700;color:#fff;letter-spacing:-0.03em;line-height:1;margin:4px 0;">03:00</div>
            <div style="display:flex;gap:6px;margin-top:8px;">
              <button id="morning-timer-btn" onclick="toggleMorningTimer()" style="flex:1;background:var(--accent-orange,#FF5A00);color:#fff;border:0;padding:6px 10px;font-family:var(--mono);font-size:11px;font-weight:700;border-radius:2px;cursor:pointer;">▶ 啟動 3 分鐘晨會</button>
              <button onclick="resetMorningTimer()" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.25);padding:6px 10px;font-family:var(--mono);font-size:11px;border-radius:2px;cursor:pointer;">↺ 重置</button>
            </div>
          </div>
        </div>

        <div data-anim="signature" style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid rgba(255,255,255,.22);padding-top:1.6vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.62)">區域總監 (DD) / 團隊主管</div>
          <div class="t-meta" style="color:rgba(255,255,255,.62)">{{DATE}}</div>
        </div>
      </div>

      <!-- 右半 · 主管逐字讲稿与开单指令 (动态注入占位符) -->
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min">
          <div class="l">DIRECTOR'S VERBATIM SCRIPT</div>
          <div class="r">3 STEPS</div>
        </div>

        <div class="speech-container" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:4px 0">
          {{MANAGER_SPEECH_FULL}}
        </div>

        <div class="t-meta" style="color:var(--text-helper);text-align:right">→ 祝各位夥伴今日開大單！</div>
      </div>
    </div>
  </div>
</section>"""

SPEAKER_NOTES_SCRIPT = """<script>
const SPEAKER_NOTES = [
  {
    id: 'cover', title: '全港保險早會 3 分鐘速報', section: '開場', minutes: 0.5,
    purpose: '建立主題與早會預期，掃描同步手機戰卡，聚焦利率戰與破局攻防',
    talk: ['各位夥伴早晨！今日晨會聚焦全港最新保險情報', '市場預繳利率突然打響價格戰，最高出現 5.8% 噱頭', '全體組員用手機掃描右下角二維碼，同步打開見客攻防卡'],
    transition: '首先睇今日市場最具震撼力的突發情報', cue: '引導組員掃描右下角 QR Code'
  },
  {
    id: 'flash-alerts', title: '今日突發震撼彈', section: '快訊', minutes: 0.8,
    purpose: '點燃前線危機感與開單機會，拆解 5.8% 預繳背後細則',
    talk: ['保誠 5.8% 利率只保證第 1 年，第 2 年面臨降息浮動風險', '友邦免體檢額上限飆升至 $400 萬美元，大客免驗身起保', '宏利 5.5% 鎖定 2 年期，抗擊降息週期必備武器'],
    transition: '接下來我們橫向對比全港主流儲蓄分紅險大表', cue: '引導組員記錄 3 大行關鍵促銷截止日'
  },
  {
    id: 'savings-matrix', title: '5 大行儲蓄險全維度矩陣', section: '矩陣', minutes: 1.2,
    purpose: '用 GN16 實現率 (96.5%) 與傳承分拆條款粉碎對手短線回贈',
    talk: ['短線看回贈，長線看實現率！保監局 GN16 數據友邦 96.5% 最穩', '對手 91.2% 實現率，30年複利相差幾十萬真金白銀', '無限次保單分拆與貨幣轉換是中產家庭出國留學的決定性功能'],
    transition: '除咗儲蓄險，非儲蓄類產品同樣有重大突破', cue: '敲黑板強調 GN16 實現率 96.5% 數字'
  },
  {
    id: 'protection-categories', title: '危疾 · 醫保 · 年金深度拆局', section: '保障', minutes: 0.8,
    purpose: '指導組員在儲蓄大單中搭售 VHIS 靈活計劃與頂尖危疾',
    talk: ['危疾癌症間隔縮短至 2 年是頂尖防護標準', '高端醫保標靶藥全額賠償，出院免找數專人服務打殘純網上保險', '未知傳染病 ICU 住院 3-5 天 100% 預支保額兜底'],
    transition: '接下來進入年終扣稅季最關鍵的 QDAP 年金排陣', cue: '展示 QDAP 扣稅梯子'
  },
  {
    id: 'qdap-annuity', title: 'QDAP 扣稅年金與稅務籌劃排陣', section: '年金', minutes: 0.8,
    purpose: '利用法定 HK$60,000 扣稅額，幫助高稅階客戶即時慳返 HK$10,200',
    talk: ['11月至3月稅季開單必備！最高稅階 17% 直接獲取 $10,200 現金省稅', '夫婦合併申報每年狂慳 $20,400', '中銀人壽與友邦保證 IRR 佔比逾 50%，兼享確定性養老現金流'],
    transition: '對於超高淨值大客，我們更有千萬級融資槓桿武器', cue: '切換至萬用壽險保費融資頁'
  },
  {
    id: 'universal-life-financing', title: '萬用壽險 (UL) 85% LTV 保費融資槓桿', section: '融資', minutes: 1.0,
    purpose: '為高淨值企業主與新移民架構千萬保單，放大淨息差回報',
    talk: ['客戶出資 15% (HK$150萬)，私人銀行配資 85%，撬動千萬保單', '萬通 Infinity、富衛 MaxFocus 結算派息 5.4%~5.5%，淨利差 +1.5%~1.65%', '最低保證派息 2.0%~2.5% 防禦極端降息，IRR 超越 12%'],
    transition: '若果客戶正考慮競品，前線中介人該如何反打？', cue: '準備進入話術 Roleplay'
  },
  {
    id: 'counter-pitch', title: '即時競品攻防對抗話術卡片', section: '話術', minutes: 1.0,
    purpose: '帶組進行現場話術對練 (Roleplay)，熟練廣東話反打要點',
    talk: ['當客人提起 5.8% 預繳：打次年浮動跳水，打 GN16 實現率', '當客人提起純網上自願醫保平：打大病專人理賠出院免找數', '用 WhatsApp 模板今天主動聯絡 10 位老客戶'],
    transition: '最後由主管佈置今日全組作戰指令，啟動 3 分鐘晨會倒計時', cue: '邀請一位組員現場朗讀反打話術'
  },
  {
    id: 'manager-speech', title: '主管晨會帶組指令', section: '收束', minutes: 0.7,
    purpose: '早會高潮激勵，啟動 3 分鐘晨會計時器，發出每人打 10 個電話開單號召',
    talk: ['今天市場消息就是最好的見客藉口', '把焦點從短期回贈拉回 30 年財富確定性', '全體出擊，今天全力以赴衝刺年終大單！'],
    transition: '晨會結束，大家開展業務！', cue: '按下開始計時按鈕，帶頭鼓掌'
  }
];
window.__SPEAKER_NOTES__ = SPEAKER_NOTES;
</script>"""

EXTRA_STYLES = """<style>
/* ============ Dynamic Briefing Component Styles (Swiss Theme Compatible) ============ */
.alert-banner {
  background: var(--grey-1);
  border-left: 4px solid var(--accent);
  padding: 14px 18px;
  font-size: max(14px, 1.02vw);
  line-height: 1.5;
  color: var(--text-primary);
  margin-bottom: 10px;
  border-radius: 2px;
}
.alert-banner strong {
  color: var(--accent) !important;
}
.rate-badge {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(0, 47, 167, 0.08);
  color: var(--accent);
  font-weight: 600;
  font-family: var(--mono);
  border-radius: 2px;
}
.gn16-badge strong {
  font-family: var(--mono);
  color: var(--accent);
  font-weight: 700;
}
.tag-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 2px;
  font-size: 12px;
  font-family: var(--mono);
  font-weight: 600;
}
.speech-container {
  overflow-y: auto;
  max-height: 65vh;
  padding-right: 6px;
}
.script-quote {
  background: var(--grey-1);
  border-left: 3px solid var(--accent);
  padding: 12px 16px;
  font-size: max(13px, 0.95vw);
  line-height: 1.6;
  color: var(--text-primary);
  margin-top: 6px;
  border-radius: 2px;
}

/* ============ Interactive Category Navigation on Slide 3 ============ */
.matrix-cat-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.matrix-cat-pill {
  padding: 4px 12px;
  background: var(--grey-1);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  font-family: var(--sans), var(--sans-zh);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
}
.matrix-cat-pill:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.matrix-cat-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 47, 167, 0.25);
}

/* ============ Grand Matrix Row Spotlight Mode ============ */
.grand-matrix-table tbody tr {
  cursor: pointer;
  transition: opacity 0.25s ease, background 0.2s ease, transform 0.2s ease;
}
.grand-matrix-table tbody tr:hover {
  background: rgba(0, 47, 167, 0.04) !important;
}
.grand-matrix-table.spotlight-active tbody tr:not(.is-spotlight) {
  opacity: 0.22 !important;
}
.grand-matrix-table tbody tr.is-spotlight {
  outline: 2px solid var(--accent);
  background: rgba(0, 47, 167, 0.08) !important;
  box-shadow: 0 4px 12px rgba(0, 47, 167, 0.15);
}

/* ============ Top Nav Battle Card Floating Capsule ============ */
.top-nav-battlecard-btn {
  position: fixed;
  top: 18px;
  right: 24px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(10, 10, 10, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff !important;
  font-family: var(--sans), var(--sans-zh), system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
}
.top-nav-battlecard-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 47, 167, 0.4);
}
body.ppt-presenter .top-nav-battlecard-btn,
body.ppt-audience .top-nav-battlecard-btn,
body.ppt-preview .top-nav-battlecard-btn {
  display: none !important;
}

/* ============ High-Res PDF Handout Print Styles ============ */
@media print {
  @page {
    size: landscape;
    margin: 0;
  }
  html, body {
    background: #ffffff !important;
    color: #000000 !important;
    overflow: visible !important;
    height: auto !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #nav, #hint, #overview, #presenter-modal, .top-nav-battlecard-btn, canvas.bg, canvas.ascii-bg, .ascii-bg {
    display: none !important;
  }
  #deck {
    display: block !important;
    overflow: visible !important;
    position: static !important;
    width: 100% !important;
    height: auto !important;
  }
  section.slide {
    display: flex !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    width: 100vw !important;
    height: 100vh !important;
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
    box-sizing: border-box !important;
    padding: 1.5cm !important;
    background: #fafaf8 !important;
  }
  section.slide.accent {
    background: #002FA7 !important;
    color: #ffffff !important;
  }
  .canvas-card {
    border: 1px solid #d4d4d2 !important;
    box-shadow: none !important;
  }
}
</style>"""


def compile_swiss_slides(base_html: str, target_title: str) -> str:
    html = base_html

    # 1. Semantic Title Replacement
    html = re.sub(r'<title>.*?</title>', f'<title>{target_title}</title>', html, count=1, flags=re.IGNORECASE)

    # 2. Inject print & utility CSS before </head> if not already present
    if '@media print' not in html:
        html = re.sub(r'</head>', f'{EXTRA_STYLES}\n</head>', html, count=1, flags=re.IGNORECASE)

    # 3. Semantic Deck Replacement: replace everything between <div id="deck"> and </div>\s*<div id="nav">
    deck_pattern = re.compile(r'(<div\s+id=[\'"]deck[\'"][^>]*>)[\s\S]*?(</div>\s*<div\s+id=[\'"]nav[\'"])', re.IGNORECASE)
    if not deck_pattern.search(html):
        raise ValueError("Semantic boundary <div id='deck'>...</div><div id='nav'> not found in base template")
    html = deck_pattern.sub(lambda m: f"{m.group(1)}\n{SLIDES_CONTENT}\n{m.group(2)}", html, count=1)

    # 4. Semantic Speaker Notes Replacement: replace the SPEAKER_NOTES script block
    notes_pattern = re.compile(r'<script>\s*const\s+SPEAKER_NOTES\s*=\s*\[[\s\S]*?\];\s*window\.__SPEAKER_NOTES__\s*=\s*SPEAKER_NOTES;\s*</script>', re.IGNORECASE)
    if not notes_pattern.search(html):
        raise ValueError("Semantic block SPEAKER_NOTES script not found in base template")
    html = notes_pattern.sub(lambda m: SPEAKER_NOTES_SCRIPT, html, count=1)

    # 5. Inject PDF print button into toolbar (#hint)
    if 'window.print()' not in html:
        pdf_btn = '<button onclick="window.print()" type="button" title="匯出高清 PDF 晨會講義" style="background:var(--accent);color:#fff;padding:4px 10px;font-size:12px;font-family:var(--mono);cursor:pointer;border:0;margin-right:4px;">🖨️ PDF 講義</button><span class="ppt-sep">·</span>'
        html = html.replace('<button id="ppt-presenter-btn"', f'{pdf_btn}<button id="ppt-presenter-btn"', 1)

    # 6. Inject top-right reciprocal button linking to index.html (Mobile Battle Card)
    if 'class="top-nav-battlecard-btn"' not in html:
        battlecard_top_btn = (
            '<a href="index.html" class="top-nav-battlecard-btn" id="link-battlecard" title="返回見客極速攻防卡">\n'
            '  <span class="icon">📱</span>\n'
            '  <span class="btn-text">見客攻防卡</span>\n'
            '</a>\n'
        )
        html = html.replace('<div id="hint"', f'{battlecard_top_btn}<div id="hint"', 1)

    # 7. Inject reciprocal shortcut in toolbar (#hint)
    if 'class="ppt-hint-link"' not in html:
        hint_link = '<a href="index.html" class="ppt-hint-link" title="返回見客攻防卡" style="display:inline-flex;align-items:center;gap:4px;color:inherit;text-decoration:none;"><span class="ppt-key">📱</span>攻防卡</a><span class="ppt-sep">·</span>'
        html = html.replace('<button id="ppt-low-power-btn"', f'{hint_link}<button id="ppt-low-power-btn"', 1)

    # 8. Inject interactivity script before </body>
    if 'window.switchMatrixCategory' not in html:
        interactive_script = """<script>
window.switchMatrixCategory = function(btn, cat) {
  document.querySelectorAll('.matrix-cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (cat === 'ci' || cat === 'vhis') {
    if (typeof go === 'function') go(3);
    return;
  }
  if (cat === 'qdap') {
    if (typeof go === 'function') go(4);
    return;
  }
  if (cat === 'ul') {
    if (typeof go === 'function') go(5);
    return;
  }
  const table = document.querySelector('.grand-matrix-table');
  if (!table) return;
  table.querySelectorAll('tr').forEach(tr => tr.classList.remove('is-spotlight'));
  table.classList.remove('spotlight-active');
};

document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('.grand-matrix-table') || document.querySelector('table');
  if (table) {
    table.addEventListener('click', (e) => {
      const row = e.target.closest('tbody tr');
      if (!row) return;
      const isAlready = row.classList.contains('is-spotlight');
      table.querySelectorAll('tbody tr').forEach(r => r.classList.remove('is-spotlight'));
      if (!isAlready) {
        row.classList.add('is-spotlight');
        table.classList.add('spotlight-active');
      } else {
        table.classList.remove('spotlight-active');
      }
    });
  }
});

(function(){
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
    } catch (e) {
      // Audio playback fails gracefully without throwing
    }
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
</script>"""
        html = html.replace('</body>', f'{interactive_script}\n</body>', 1)

    return html


def main():
    if not os.path.exists(BASE_TEMPLATE_PATH):
        raise FileNotFoundError(f"Base template not found at: {BASE_TEMPLATE_PATH}")

    with open(BASE_TEMPLATE_PATH, "r", encoding="utf-8") as f:
        base_html = f.read()

    full_content = compile_swiss_slides(base_html, TARGET_TITLE)

    with open(OUTPUT_TEMPLATE_PATH, "w", encoding="utf-8") as f:
        f.write(full_content)

    print(f"[InsurIntel] Successfully compiled Swiss Style morning slides template ({len(full_content)} chars)!")


if __name__ == "__main__":
    main()

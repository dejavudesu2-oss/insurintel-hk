import os

base_template_path = os.path.join(os.getcwd(), "templates", "template-swiss-base.html")
output_template_path = os.path.join(os.getcwd(), "templates", "morning_slides.html")

with open(base_template_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Head up to line 1250 (just before <section class="slide accent" data-slide-id="cover">)
head_lines = lines[:1250]
# Tail from line 1342 (after </div> <!-- /#deck -->)
tail_lines = lines[1338:]

slides_content = """
<!-- ============ 01 · Hero Cover · IKB 满屏 + ASCII 呼吸场 ============ -->
<section class="slide accent" data-animate="hero" data-slide-id="cover" data-layout="cover">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    <div class="chrome-min">
      <div class="l">INSURINTEL HK · MORNING INTELLIGENCE</div>
      <div class="r">ISSUE {{DATE}} · 01 / 06</div>
    </div>
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">HONG KONG INSURANCE AGENT DECISION SYSTEM</div>
      <h1 data-anim="title" style="align-self:center;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(10.5vw,17vh);line-height:.95;letter-spacing:-.03em;color:#fff">
        全港保險早會<br/><span style="font-style:italic;font-weight:300">3分鐘情報速報</span>
      </h1>
      <div data-anim="bottom" style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div data-anim="lead" class="lead" style="max-width:54ch;color:rgba(255,255,255,.88);font-size:max(16px,1.2vw);font-weight:300">
          5 大行儲蓄險全維度矩陣 · 預繳保證利率排行 · 保監局 GN16 官方實現率 · 見客撞單防禦卡片
        </div>
        <div style="display:flex;justify-content:space-between;align-items:end">
          <div class="t-meta" style="color:rgba(255,255,255,.6)">持牌保險中介人內部決策專用 · 每日 07:45 實時更新</div>
          <div class="t-meta" style="color:rgba(255,255,255,.6)">[P 演講模式 · ESC 總覽 · ← → 翻頁]</div>
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
          <div class="l">02 / 06</div>
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
      <!-- 右半 · 今日三大突发快讯卡片 -->
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min">
          <div class="l">TODAY'S FLASH ALERTS</div>
          <div class="r">3 UPDATES</div>
        </div>
        <div data-anim="rules" style="display:flex;flex-direction:column;gap:0">
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2.2vh 0;border-top:1px solid var(--border-subtle)">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(3.8vw,6.5vh);line-height:.9;color:var(--text-primary)">01</div>
            <div>
              <h3 style="font-weight:500;font-size:max(17px,1.4vw);line-height:1.3;color:var(--text-primary);margin-bottom:.6vh">保誠「雋富」5.8% 預繳利率 (保證1年)</h3>
              <p style="font-size:max(15px,.95vw);line-height:1.5;color:var(--text-secondary)">首年保費折扣最高達 28%，鎖定 5 年期美元儲蓄客戶，限 11 月 20 日前遞交。</p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2.2vh 0;border-top:1px solid var(--border-subtle)">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(3.8vw,6.5vh);line-height:.9;color:var(--text-primary)">02</div>
            <div>
              <h3 style="font-weight:500;font-size:max(17px,1.4vw);line-height:1.3;color:var(--text-primary);margin-bottom:.6vh">友邦「盈御 3」免體檢額上限飆升至 $400 萬美元</h3>
              <p style="font-size:max(15px,.95vw);line-height:1.5;color:var(--text-secondary)">特選客戶啟動健康直通車，無需繁瑣驗身，預繳利率 5.0% 穩健兌現。</p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2.2vh 0;border-top:1px solid var(--border-subtle);border-bottom:2px solid var(--accent)">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(3.8vw,6.5vh);line-height:.9;color:var(--accent)">03</div>
            <div>
              <h3 style="font-weight:500;font-size:max(17px,1.4vw);line-height:1.3;color:var(--accent);margin-bottom:.6vh">宏利「宏摯」預繳 5.5% 鎖定 2 年期</h3>
              <p style="font-size:max(15px,.95vw);line-height:1.5;color:var(--text-secondary)">抗擊降息週期利器，鎖定 2 年期確定利息，加配守護無間危疾額外享 3% 搭售折扣。</p>
            </div>
          </div>
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
      <div class="r">03 / 06</div>
    </div>
    
    <div>
      <div class="t-meta" style="color:var(--accent);margin-bottom:8px">SAVINGS BENCHMARK MATRIX</div>
      <h2 style="font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(4.8vw,8.5vh);line-height:1;letter-spacing:-.02em;margin-bottom:16px">
        全港主流儲蓄分紅險·全維度對比總表
      </h2>
    </div>

    <!-- 瑞士极细网格数据表格 -->
    <div style="overflow-x:auto;margin:12px 0">
      <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid var(--text-primary)">
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
          <tr style="border-bottom:1px solid var(--border-subtle)">
            <td style="padding:12px;font-weight:600">友邦 (AIA)</td>
            <td style="padding:12px;color:var(--accent);font-weight:500">盈御多元貨幣計劃 3</td>
            <td style="padding:12px"><span style="background:rgba(0,47,167,.08);color:var(--accent);padding:3px 8px;font-weight:600;font-family:var(--mono)">5.00% (保證1年)</span></td>
            <td style="padding:12px;font-family:var(--mono)">12% - 22% (+4% 同行)</td>
            <td style="padding:12px"><strong style="color:var(--accent);font-family:var(--mono)">96.5% (極穩健)</strong></td>
            <td style="padding:12px;font-family:var(--mono)">第 18 年 / 第 6 年</td>
            <td style="padding:12px;font-weight:600;font-family:var(--mono)">6.62%</td>
            <td style="padding:12px;font-size:12px;color:var(--text-secondary)">無限次分拆 / 7種貨幣 / 身故信託</td>
            <td style="padding:12px;font-size:12px">免體檢升至 $400 萬美元</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle)">
            <td style="padding:12px;font-weight:600">保誠 (Prudential)</td>
            <td style="padding:12px;color:var(--accent);font-weight:500">雋富多元貨幣計劃</td>
            <td style="padding:12px"><span style="background:rgba(0,47,167,.08);color:var(--accent);padding:3px 8px;font-weight:600;font-family:var(--mono)">5.80% (保證1年)</span></td>
            <td style="padding:12px;font-family:var(--mono)">14% - 28% (+3% 同行)</td>
            <td style="padding:12px"><strong style="color:var(--text-secondary);font-family:var(--mono)">91.2% (波動較大)</strong></td>
            <td style="padding:12px;font-family:var(--mono)">第 19 年 / 第 7 年</td>
            <td style="padding:12px;font-weight:600;font-family:var(--mono)">6.71%</td>
            <td style="padding:12px;font-size:12px;color:var(--text-secondary)">無限次分拆 / 6種貨幣 / 更換受保人</td>
            <td style="padding:12px;font-size:12px">免體檢限額 $350 萬美元</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle)">
            <td style="padding:12px;font-weight:600">宏利 (Manulife)</td>
            <td style="padding:12px;color:var(--accent);font-weight:500">宏摯多元儲蓄計劃</td>
            <td style="padding:12px"><span style="background:rgba(0,47,167,.08);color:var(--accent);padding:3px 8px;font-weight:600;font-family:var(--mono)">5.50% (保證2年)</span></td>
            <td style="padding:12px;font-family:var(--mono)">10% - 25% (+3% 搭售)</td>
            <td style="padding:12px"><strong style="color:var(--accent);font-family:var(--mono)">94.8% (穩健)</strong></td>
            <td style="padding:12px;font-family:var(--mono)">第 17 年 / 第 6 年</td>
            <td style="padding:12px;font-weight:600;font-family:var(--mono)">6.55%</td>
            <td style="padding:12px;font-size:12px;color:var(--text-secondary)">保單分拆 / 8種貨幣 / 終身分紅鎖定</td>
            <td style="padding:12px;font-size:12px">特選次標準體豁免加費</td>
          </tr>
          <tr style="border-bottom:1px solid var(--border-subtle)">
            <td style="padding:12px;font-weight:600">富衛 (FWD)</td>
            <td style="padding:12px;color:var(--accent);font-weight:500">盈豐多元儲蓄保險</td>
            <td style="padding:12px"><span style="background:rgba(0,47,167,.08);color:var(--accent);padding:3px 8px;font-weight:600;font-family:var(--mono)">5.30% (保證3年)</span></td>
            <td style="padding:12px;font-family:var(--mono)">15% - 24% (+5% 家庭)</td>
            <td style="padding:12px"><strong style="color:var(--text-secondary);font-family:var(--mono)">92.6% (良好)</strong></td>
            <td style="padding:12px;font-family:var(--mono)">第 16 年 / 第 5 年</td>
            <td style="padding:12px;font-weight:600;font-family:var(--mono)">6.65%</td>
            <td style="padding:12px;font-size:12px;color:var(--text-secondary)">保單分拆 / 保單轉換 / 第二受保人</td>
            <td style="padding:12px;font-size:12px">簡易核保限時通道</td>
          </tr>
          <tr>
            <td style="padding:12px;font-weight:600">永明 (Sun Life)</td>
            <td style="padding:12px;color:var(--accent);font-weight:500">萬年青星河傳承計劃</td>
            <td style="padding:12px"><span style="background:rgba(0,47,167,.08);color:var(--accent);padding:3px 8px;font-weight:600;font-family:var(--mono)">5.10% (保證1年)</span></td>
            <td style="padding:12px;font-family:var(--mono)">12% - 20% (+3% 同行)</td>
            <td style="padding:12px"><strong style="color:var(--text-secondary);font-family:var(--mono)">93.0% (中等)</strong></td>
            <td style="padding:12px;font-family:var(--mono)">第 18 年 / 第 6 年</td>
            <td style="padding:12px;font-weight:600;font-family:var(--mono)">6.58%</td>
            <td style="padding:12px;font-size:12px;color:var(--text-secondary)">雙核紅利機制 / 貨幣切換</td>
            <td style="padding:12px;font-size:12px">綠色通道快速核保</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部 Data Hero Stat -->
    <div style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid var(--border-subtle);padding-top:14px">
      <div style="display:flex;align-items:baseline;gap:1.5vw">
        <span style="font-family:var(--sans);font-size:min(5vw,9vh);font-weight:200;line-height:.9;color:var(--accent)">96.5%</span>
        <span style="font-size:14px;color:var(--text-secondary);max-width:40ch">保監局 GN16 官方累積分紅實現率：收益確定性的終極生命線</span>
      </div>
      <div class="t-meta" style="color:var(--text-helper)">SOURCE: HK INSURANCE AUTHORITY GN16 OFFICIAL DATA</div>
    </div>
  </div>
</section>

<!-- ============ 04 · S19 Four Cards (🛡️ 非儲蓄類深度拆局) ============ -->
<section class="slide" data-animate="four-cards" data-slide-id="protection-categories" data-layout="S19">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">PROTECTION & TAX-DEDUCTIBLE RADAR</div>
      <div class="r">04 / 06</div>
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

<!-- ============ 05 · S08 Duo Compare (🥊 即時攻防對抗話術卡片) ============ -->
<section class="slide" data-animate="duo-mirror" data-slide-id="counter-pitch" data-layout="S08">
  <div class="canvas-card" style="justify-content:space-between">
    <div class="chrome-min">
      <div class="l">COUNTER-PITCH BATTLE CARDS</div>
      <div class="r">05 / 06</div>
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

<!-- ============ 06 · S10 Split Closing (🎯 主管 3 分鐘晨會講稿) ============ -->
<section class="slide split" data-animate="split-statement" data-slide-id="manager-speech" data-layout="S10">
  <div class="canvas-card">
    <div class="split-half">
      <!-- 左半 · IKB 宣言 + ASCII 呼吸场 -->
      <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
        <canvas class="ascii-bg" aria-hidden="true"></canvas>
        <div class="chrome-min" style="margin-bottom:0;position:relative;z-index:1">
          <div class="l">06 / 06</div>
          <div class="r">DIRECTOR BRIEF</div>
        </div>

        <div data-anim="manifesto" style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em;margin-bottom:1.6vh">MORNING AGENDA</div>
          <h2 style="font-family:var(--sans),var(--sans-zh);font-size:min(7vw,12vh);line-height:.95;letter-spacing:-.025em;font-weight:200;color:#fff">
            晨會 3 分鐘<br/><span style="font-style:italic;font-weight:300">帶組實戰指令</span>
          </h2>
          <div style="font-family:var(--sans),var(--sans-zh);font-size:max(14px,1vw);line-height:1.6;color:rgba(255,255,255,.85);font-weight:300;max-width:38ch;margin-top:1.4vh">
            08:30 晨會議程：<br/>5分鐘市場情報速遞 $\to$ 10分鐘競品對練 $\to$ 5分鐘衝刺號召
          </div>
        </div>

        <div data-anim="signature" style="display:flex;justify-content:space-between;align-items:end;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.62)">區域總監 (DD) / 團隊主管</div>
          <div class="t-meta" style="color:rgba(255,255,255,.62)">{{DATE}}</div>
        </div>
      </div>

      <!-- 右半 · 主管逐字讲稿与开单指令 -->
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        <div class="chrome-min">
          <div class="l">DIRECTOR'S VERBATIM SCRIPT</div>
          <div class="r">3 STEPS</div>
        </div>

        <div data-anim="rules" style="display:flex;flex-direction:column;gap:0">
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2vh 0;border-top:1px solid var(--border-subtle)">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(3.8vw,6.5vh);line-height:.9;color:var(--text-primary)">01</div>
            <div>
              <h3 style="font-weight:500;font-size:max(16px,1.3vw);line-height:1.3;color:var(--text-primary);margin-bottom:.5vh">開場呼應（熱場）</h3>
              <p style="font-size:max(14px,.92vw);line-height:1.5;color:var(--text-secondary)">
                「各位夥伴早晨！打開手機睇到今日早報未？保誠突然將預繳利息拔高到 5.8%，擺明要喺 11 月搶年終資金！但呢個正係我地主動出擊見客嘅絕佳藉口！」
              </p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2vh 0;border-top:1px solid var(--border-subtle)">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(3.8vw,6.5vh);line-height:.9;color:var(--text-primary)">02</div>
            <div>
              <h3 style="font-weight:500;font-size:max(16px,1.3vw);line-height:1.3;color:var(--text-primary);margin-bottom:.5vh">見客實戰指導（破局）</h3>
              <p style="font-size:max(14px,.92vw);line-height:1.5;color:var(--text-secondary)">
                「今日見客記住兩招：第一，拆解對手 5.8% 只保證頭 1 年，次年極易跳水；第二，直接亮出保監局 GN16 數據，我地旗艦系列歷史累積實現率 96.5% 最穩健，拒絕非保證畫餅！」
              </p>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2vw;align-items:start;padding:2vh 0;border-top:1px solid var(--border-subtle);border-bottom:2px solid var(--accent)">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(3.8vw,6.5vh);line-height:.9;color:var(--accent)">03</div>
            <div>
              <h3 style="font-weight:500;font-size:max(16px,1.3vw);line-height:1.3;color:var(--accent);margin-bottom:.5vh">今日開單號召（衝刺）</h3>
              <p style="font-size:max(14px,.92vw);line-height:1.5;color:var(--text-secondary)">
                「今日每位同事帶齊 InsurIntel 對比表同攻防卡片，每人打 10 個跟進電話，全力衝刺大單，今日全力以赴！」
              </p>
            </div>
          </div>
        </div>

        <div class="t-meta" style="color:var(--text-helper);text-align:right">→ 祝各位夥伴今日開大單！</div>
      </div>
    </div>
  </div>
</section>
"""

# Rebuild SPEAKER_NOTES array for the 6 slides
speaker_notes_script = """
<script>
const SPEAKER_NOTES = [
  {
    id: 'cover', title: '全港保險早會 3 分鐘速報', section: '開場', minutes: 0.5,
    purpose: '建立主題與早會預期，聚焦 5 大行儲蓄險利率戰與破局攻防',
    talk: ['各位夥伴早晨！今日晨會聚焦全港最新保險情報', '市場預繳利率突然打響價格戰，最高出現 5.8% 噱頭', '帶大家拆解數字背後的條款真相，掌握見客主動權'],
    transition: '首先睇今日市場最具震撼力的突發情報', cue: '確認大屏幕與手機端同步投影'
  },
  {
    id: 'flash-alerts', title: '今日突發震撼彈', section: '快訊', minutes: 0.8,
    purpose: '點燃前線危機感與開單機會，拆解 5.8% 利率細節',
    talk: ['保誠 5.8% 利率只保證第 1 年，第 2 年面臨降息浮動風險', '友邦免體檢額上限飆升至 $400 萬美元，大客免驗身起保', '宏利 5.5% 鎖定 2 年期，抗擊降息週期必備武器'],
    transition: '接下來我們橫向對比全港 5 大行的真實底牌', cue: '引導組員記錄 3 大行關鍵促銷截止日'
  },
  {
    id: 'savings-matrix', title: '5 大行儲蓄險全維度矩陣', section: '矩陣', minutes: 1.2,
    purpose: '用 GN16 實現率 (96.5%) 與傳承分拆條款粉碎對手短線回贈',
    talk: ['短線看回贈，長線看實現率！保監局 GN16 數據友邦 96.5% 最穩', '對手 91.2% 實現率，30年複利相差幾十萬真金白銀', '無限次保單分拆與貨幣轉換是中產家庭出國留學的決定性功能'],
    transition: '除咗儲蓄險，非儲蓄類產品同樣有重大突破', cue: '敲黑板強調 GN16 實現率 96.5% 數字'
  },
  {
    id: 'protection-categories', title: '危疾 · 醫保 · 年金深度拆局', section: '保障', minutes: 0.8,
    purpose: '指導組員在儲蓄大單中搭售 VHIS 靈活計劃與 QDAP 年金',
    talk: ['危疾癌症間隔縮短至 2 年是頂尖防護標準', '高端醫保標靶藥全額賠償，出院免找數專人服務打殘純網上保險', 'QDAP 每年慳返 $10,200 現金稅款，扣稅季必推'],
    transition: '如果客戶正考慮競品，我們該如何實戰反打？', cue: '展示 WhatsApp 見客訊息範本'
  },
  {
    id: 'counter-pitch', title: '即時競品攻防對抗話術卡片', section: '話術', minutes: 1.0,
    purpose: '帶組進行 5 分鐘現場話術對練 (Roleplay)，熟練廣東話反打要點',
    talk: ['當客人提起 5.8% 預繳：打次年浮動跳水，打 GN16 實現率', '當客人提起純網上自願醫保平：打大病專人理賠出院免找數', '用 WhatsApp 模板今天主動聯絡 10 位老客戶'],
    transition: '最後由主管佈置今日全組作戰指令', cue: '邀請一位組員現場朗讀反打話術'
  },
  {
    id: 'manager-speech', title: '主管晨會帶組指令', section: '收束', minutes: 0.7,
    purpose: '早會高潮激勵，發出每人打 10 個電話開單號召',
    talk: ['今天市場消息就是最好的見客藉口', '把焦點從短期回贈拉回 30 年財富確定性', '全體出擊，今天全力以赴衝刺年終大單！'],
    transition: '晨會結束，大家開展業務！', cue: '帶頭鼓掌，全組口號激勵'
  }
];
window.__SPEAKER_NOTES__ = SPEAKER_NOTES;
</script>
"""

# Find where SPEAKER_NOTES starts in tail_lines and replace it
tail_str = "".join(tail_lines)
# Replace SPEAKER_NOTES definition block
import re
tail_str = re.sub(r'<script>\s*const SPEAKER_NOTES = \[.*?\];\s*window\.__SPEAKER_NOTES__ = SPEAKER_NOTES;\s*</script>', speaker_notes_script, tail_str, flags=re.DOTALL)

# Replace title in head_lines and inject @media print styles
head_str = "".join(head_lines)
head_str = head_str.replace("<title>[必填] 替换为 PPT 标题 · Deck Title</title>", "<title>InsurIntel HK · 香港保險早會市場情報與攻防對策系統</title>")

print_css = """
<style>
/* ============ Agent 5: High-Res PDF Handout Print Styles ============ */
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
  #nav, #hint, #overview, #presenter-modal, canvas.bg, canvas.ascii-bg, .ascii-bg {
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
</style>
"""
head_str = head_str.replace("</head>", print_css + "\n</head>")

tail_str = tail_str.replace(
  '<button data-action="toggle-help" title="查看键盘快捷键帮助">',
  '<button onclick="window.print()" title="匯出高清 PDF 晨會講義" style="background:var(--accent);color:#fff;padding:4px 10px;font-size:12px;font-family:var(--mono);cursor:pointer;border:0;margin-right:8px;">🖨️ PDF 講義</button><button data-action="toggle-help" title="查看键盘快捷键帮助">'
)

full_content = head_str + "\n" + slides_content + "\n" + tail_str

with open(output_template_path, "w", encoding="utf-8") as f:
    f.write(full_content)

print(f"[InsurIntel] Successfully generated Swiss Style morning slides template ({len(full_content)} chars)!")

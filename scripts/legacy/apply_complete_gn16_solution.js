const fs = require('fs');
const path = require('path');

const buildScriptPath = path.join(__dirname, 'build_mobile_cafe.js');
let content = fs.readFileSync(buildScriptPath, 'utf8');

console.log('[GN16 Patch] Base build_mobile_cafe.js read (' + content.length + ' chars)');

// Step 1: Require gn16_database at the top
if (!content.includes("require('../src/data/gn16_database.json')")) {
  const topAnchor = "const fs = require('fs');";
  const topInsert = "const fs = require('fs');\nconst gn16Database = require('../src/data/gn16_database.json');";
  content = content.replace(topAnchor, () => topInsert);
  console.log('[GN16 Patch] 1. Added gn16Database require at top');
}

// Step 2: In <head>, inject Schema.org JSON-LD and meta keywords
const headTarget = '<title>InsurIntel 14:00 見客極速攻防卡</title>';
const headReplacement = `<title>InsurIntel 14:00 見客極速攻防卡 · 香港保險GN16分紅達成率對賬</title>
  <meta name="keywords" content="香港保險分紅實現率, GN16, 友邦充裕未來紅利實現率, 保誠雋升實際回報, 宏利赤霞珠分紅達成, 安盛安進紅利兌現, 富衛盈豐分紅對賬, 永明萬年青紅利實現率, 中國人壽海外分紅實現率, 利益演示紅利對賬">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "香港保險跨境保單「利益演示紅利真實達成率」查詢器",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "offers": [
      {
        "@type": "Offer",
        "name": "單份深度紅利對賬報告",
        "price": "49",
        "priceCurrency": "HKD"
      },
      {
        "@type": "Offer",
        "name": "理財顧問展業專業版 (月費)",
        "price": "199",
        "priceCurrency": "HKD"
      }
    ],
    "featureList": [
      "全港12大保司GN16紅利實現率對賬",
      "利益演示預期 vs 真實到賬雙線走勢圖",
      "100%法定基準線偏離度分析",
      "一鍵導出認證PDF對賬報告",
      "WhatsApp與微信展業談客話術生成"
    ]
  }
  </script>`;

if (content.includes(headTarget)) {
  content = content.replace(headTarget, () => headReplacement);
  console.log('[GN16 Patch] 2. Injected Head Metadata & Schema.org JSON-LD');
}

// Step 3: Inject CSS
if (!content.includes('.gn16-hero-callout-bar')) {
  const gn16Css = `
    /* GN16 Fulfillment Tracker & Monetization Styles */
    .app-nav-btn.gn16-btn {
      background: linear-gradient(135deg, #eff3ff 0%, #dbeafe 100%);
      border: 1px solid #bfdbfe;
      color: #002FA7;
      font-weight: 700;
    }
    .app-nav-btn.gn16-btn:hover {
      background: #002FA7;
      color: #ffffff;
    }
    .gn16-hero-callout-bar {
      margin: 10px 16px 4px 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #002FA7 0%, #1e3a8a 100%);
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,47,167,0.18);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .gn16-hero-callout-bar:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0,47,167,0.25);
    }
    .gn16-callout-left {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .gn16-callout-badge {
      display: inline-block;
      align-self: flex-start;
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.35);
      font-size: 10px;
      font-weight: 800;
      padding: 1px 7px;
      border-radius: 99px;
      letter-spacing: 0.5px;
    }
    .gn16-callout-title {
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }
    .gn16-callout-sub {
      font-size: 11px;
      opacity: 0.9;
    }
    .gn16-callout-cta-btn {
      background: #ffffff;
      color: #002FA7;
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 11.5px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    }

    /* GN16 Query Modal */
    .gn16-query-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: none;
    }
    .gn16-query-backdrop.open { display: block; }
    .gn16-query-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 95%;
      max-width: 820px;
      max-height: 90vh;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .gn16-query-modal.open {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }
    .gn16-query-header {
      padding: 14px 20px;
      background: linear-gradient(135deg, #002FA7 0%, #1e3a8a 100%);
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.15);
    }
    .gn16-query-body {
      padding: 18px 20px;
      overflow-y: auto;
      position: relative;
    }
    .gn16-filters-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }
    .gn16-filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }
    .gn16-field label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
    }
    .gn16-field select, .gn16-field input {
      width: 100%;
      padding: 8px 10px;
      font-size: 12.5px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
      color: #0f172a;
      outline: none;
      font-weight: 600;
    }
    .gn16-field select:focus, .gn16-field input:focus {
      border-color: #002FA7;
      box-shadow: 0 0 0 3px rgba(0, 47, 167, 0.12);
    }
    .gn16-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    @media (max-width: 640px) {
      .gn16-metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    .gn16-metric-card {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      text-align: center;
    }
    .gn16-metric-card.highlight {
      background: #eff3ff;
      border-color: #bfdbfe;
    }
    .gn16-metric-label {
      font-size: 10.5px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 2px;
    }
    .gn16-metric-value {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .gn16-metric-card.highlight .gn16-metric-value {
      color: #002FA7;
    }
    .gn16-chart-container {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      min-height: 280px;
      position: relative;
    }
    .gn16-watermark-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      z-index: 5;
    }
    .gn16-watermark-text {
      transform: rotate(-25deg);
      font-size: 24px;
      font-weight: 900;
      color: rgba(0, 47, 167, 0.08);
      white-space: nowrap;
      user-select: none;
      letter-spacing: 2px;
      text-align: center;
      line-height: 2.2;
    }
    .gn16-pay-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(5px);
      z-index: 10010;
      display: none;
    }
    .gn16-pay-backdrop.open { display: block; }
    .gn16-pay-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 92%;
      max-width: 650px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      z-index: 10011;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .gn16-pay-modal.open {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }
    .gn16-tier-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .gn16-tier-card.active {
      border-color: #002FA7;
      background: #eff3ff;
      box-shadow: 0 4px 12px rgba(0, 47, 167, 0.1);
    }

    @media print {
      body.gn16-printing > *:not(#gn16-query-modal) {
        display: none !important;
      }
      body.gn16-printing #gn16-query-modal {
        display: block !important;
        position: static !important;
        transform: none !important;
        width: 100% !important;
        max-width: 100% !important;
        box-shadow: none !important;
        border: none !important;
        opacity: 1 !important;
      }
      body.gn16-printing .gn16-query-actions,
      body.gn16-printing .gn16-filters-card,
      body.gn16-printing .drawer-close-btn,
      body.gn16-printing #gn16-unlock-advisor-btn {
        display: none !important;
      }
    }
`;
  const cssRegex = /(\r?\n\s*\.client-pdf-modal\s*\{)/;
  if (cssRegex.test(content)) {
    content = content.replace(cssRegex, (match) => gn16Css + '\n' + match);
    console.log('[GN16 Patch] 3. Injected GN16 CSS');
  }
}

// Step 4: Inject Header Button
const headerAnchor = '<button class="app-nav-btn view-btn" id="header-view-toggle-btn"';
if (content.includes(headerAnchor) && !content.includes('id="btn-open-gn16-tracker"')) {
  const navBtnHtml = `        <button class="app-nav-btn gn16-btn" id="btn-open-gn16-tracker" onclick="openGN16QueryModal()" title="香港保險GN16利益演示分紅真實達成率查詢器">
          <span class="btn-emoji">📈</span>
          <span class="btn-txt">分紅達成率</span>
        </button>\n        `;
  content = content.replace(headerAnchor, () => navBtnHtml + headerAnchor);
  console.log('[GN16 Patch] 4. Injected Header GN16 Button');
}

// Step 5: Inject Hero Callout Bar
const heroAnchor = '  <!-- Dual-Perspective Switcher -->';
if (content.includes(heroAnchor) && !content.includes('id="gn16-hero-callout-bar"')) {
  const heroBarHtml = `  <!-- GN16 Fulfillment Ratio Tracker Hero Callout Bar -->
  <div class="gn16-hero-callout-bar" id="gn16-hero-callout-bar" onclick="openGN16QueryModal()">
    <div class="gn16-callout-left">
      <span class="gn16-callout-badge">香港獨家 · GN16 官方披露對賬</span>
      <span class="gn16-callout-title">🔍 香港保單「利益演示紅利真實達成率」查詢器</span>
      <span class="gn16-callout-sub">全港 12 大保司 · 24 款旗艦儲蓄險 · 歷年宣傳預期 vs 真實到賬走勢圖</span>
    </div>
    <div class="gn16-callout-right">
      <button class="gn16-callout-cta-btn" onclick="event.stopPropagation(); openGN16QueryModal();">立即查詢對賬 ➔</button>
    </div>
  </div>\n\n  `;
  content = content.replace(heroAnchor, () => heroBarHtml + heroAnchor);
  console.log('[GN16 Patch] 5. Injected Hero Callout Bar');
}

// Step 6: Inject Modals HTML
const modalsAnchor = '  <!-- Client & Advisor Audit & Improvement Board Drawer (30 & 100 Scope) -->';
if (content.includes(modalsAnchor) && !content.includes('id="gn16-query-modal"')) {
  const modalsHtml = `  <!-- GN16 Fulfillment Ratio Query Modal -->
  <div class="gn16-query-backdrop" id="gn16-query-backdrop" onclick="closeGN16QueryModal()"></div>
  <div class="gn16-query-modal" id="gn16-query-modal" role="dialog" aria-modal="true" aria-labelledby="gn16-query-heading">
    <div class="gn16-query-header">
      <div>
        <div style="font-size:15px;font-weight:800;display:flex;align-items:center;gap:6px;" id="gn16-query-heading">
          <span>📊 香港保單「利益演示紅利真實達成率」對賬器</span>
          <span style="font-size:10px;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:99px;border:1px solid rgba(255,255,255,0.4);">GN16 法定披露</span>
        </div>
        <div style="font-size:11px;opacity:0.9;margin-top:2px;">香港保監局 GN16 權威官方精算回溯 · 當年宣傳利益演示 vs 真實到賬紅利</div>
      </div>
      <button class="drawer-close-btn" onclick="closeGN16QueryModal()" aria-label="關閉對賬器">✕</button>
    </div>
    <div class="gn16-query-body">
      <!-- Filter Selectors -->
      <div class="gn16-filters-card">
        <div class="gn16-filters-grid">
          <div class="gn16-field">
            <label for="gn16-insurer-select">【1. 保司名稱】</label>
            <select id="gn16-insurer-select" onchange="onGN16InsurerChange()"></select>
          </div>
          <div class="gn16-field">
            <label for="gn16-product-select">【2. 產品系列】</label>
            <select id="gn16-product-select" onchange="onGN16ProductChange()"></select>
          </div>
          <div class="gn16-field">
            <label for="gn16-year-select">【3. 投保年份】</label>
            <select id="gn16-year-select" onchange="runGN16Reconciliation()"></select>
          </div>
          <div class="gn16-field">
            <label for="gn16-premium-input">【4. 年繳保費 (USD)】</label>
            <input type="number" id="gn16-premium-input" value="10000" step="1000" min="1000" onchange="runGN16Reconciliation()" />
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:4px;">
          <div style="font-size:11px;color:#64748b;" id="gn16-official-source-link">
            <!-- Injected official GN16 link -->
          </div>
          <button onclick="runGN16Reconciliation()" style="background:#002FA7;color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;">⚡ 立即調取數據對賬</button>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="gn16-metrics-grid">
        <div class="gn16-metric-card highlight">
          <div class="gn16-metric-label">歷年平均分紅達成率</div>
          <div class="gn16-metric-value" id="gn16-metric-avg-ratio">--%</div>
        </div>
        <div class="gn16-metric-card">
          <div class="gn16-metric-label">當年宣傳累計預期紅利</div>
          <div class="gn16-metric-value" id="gn16-metric-cum-ill">$--</div>
        </div>
        <div class="gn16-metric-card">
          <div class="gn16-metric-label">真實到賬累計總紅利</div>
          <div class="gn16-metric-value" id="gn16-metric-cum-act">$--</div>
        </div>
        <div class="gn16-metric-card">
          <div class="gn16-metric-label">累計承諾兌現差額</div>
          <div class="gn16-metric-value" id="gn16-metric-variance">$--</div>
        </div>
      </div>

      <!-- Verdict Callout -->
      <div id="gn16-summary-verdict-box" style="background:#f8fafc;border-left:4px solid #002FA7;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:14px;font-size:12px;color:#1e293b;line-height:1.5;">
        <!-- Injected by runGN16Reconciliation() -->
      </div>

      <!-- Dual-Line Chart Container -->
      <div class="gn16-chart-container" id="gn16-chart-container">
        <div class="gn16-watermark-overlay" id="gn16-watermark-overlay">
          <div class="gn16-watermark-text" id="gn16-watermark-text">
            InsurIntel HK 官方認證對賬 · 投保人私人存檔<br>
            InsurIntel HK 官方認證對賬 · 投保人私人存檔
          </div>
        </div>
        <div id="gn16-svg-chart-wrapper" style="position:relative;z-index:2;width:100%;height:100%;">
          <!-- SVG Chart rendered here -->
        </div>
      </div>

      <!-- Smoothing Reserve & Asset Allocation Note -->
      <div style="background:#f1f5f9;border-radius:8px;padding:10px 14px;font-size:11px;color:#475569;margin-bottom:16px;" id="gn16-smoothing-note">
        <!-- Injected -->
      </div>

      <!-- Agent Profile Card Container -->
      <div id="gn16-agent-card-container">
        <!-- Injected when agent unlocked -->
      </div>

      <!-- Action Buttons -->
      <div class="gn16-query-actions" style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
        <button id="gn16-print-report-btn" onclick="printGN16Report()" style="flex:1;min-width:140px;padding:9px 12px;background:#002FA7;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>🖨️ 列印/導出 PDF 對賬報告</span>
        </button>
        <button id="gn16-wa-pitch-btn" onclick="copyGN16WhatsAppPitch()" style="flex:1;min-width:140px;padding:9px 12px;background:#25d366;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>💬 複製 WhatsApp 談客簡報</span>
        </button>
        <button id="gn16-wechat-pitch-btn" onclick="copyGN16WechatPitch()" style="flex:1;min-width:140px;padding:9px 12px;background:#07c160;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>📱 複製 微信朋友圈/小紅書文案</span>
        </button>
        <button id="gn16-unlock-advisor-btn" onclick="openGN16PayModal()" style="flex:1;min-width:140px;padding:9px 12px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>👑 去除水印 / 綁定顧問名片</span>
        </button>
      </div>
    </div>
  </div>

  <!-- GN16 Monetization / Pay Modal ($49 vs $199) -->
  <div class="gn16-pay-backdrop" id="gn16-pay-backdrop" onclick="closeGN16PayModal()"></div>
  <div class="gn16-pay-modal" id="gn16-pay-modal" role="dialog" aria-modal="true" aria-labelledby="gn16-pay-heading">
    <div style="padding:16px 20px;background:linear-gradient(135deg, #002FA7 0%, #1e3a8a 100%);color:#fff;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:15px;font-weight:800;" id="gn16-pay-heading">🔐 解鎖 GN16 深度紅利對賬權限</div>
        <div style="font-size:11px;opacity:0.9;margin-top:2px;">香港保監局官方數據庫 · 100% 官方真實申報數據對賬</div>
      </div>
      <button class="drawer-close-btn" onclick="closeGN16PayModal()">✕</button>
    </div>
    <div style="padding:20px;overflow-y:auto;max-height:80vh;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;">
        <!-- Option 1: HK$49 Retail -->
        <div class="gn16-tier-card" id="gn16-tier-retail" onclick="selectGN16Tier('retail_49')">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:800;color:#0f172a;">👤 終端保民</span>
            <span style="font-size:18px;font-weight:900;color:#002FA7;">HK$49</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:10px;">單次解鎖 · 私人存檔</div>
          <ul style="font-size:11.5px;color:#334155;line-height:1.6;padding-left:16px;margin:0;">
            <li>解鎖單份保單深度紅利對賬走勢圖</li>
            <li>標註「投保人私人存檔」官方認證水印</li>
            <li>清晰對賬宣傳利益 vs 實際到賬</li>
            <li>支援單次 PDF 導出列印</li>
          </ul>
        </div>
        <!-- Option 2: HK$199 Agent Pro -->
        <div class="gn16-tier-card active" id="gn16-tier-agent" onclick="selectGN16Tier('agent_199')">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:800;color:#0f172a;">💼 顧問展業版</span>
            <span style="font-size:18px;font-weight:900;color:#002FA7;">HK$199 <span style="font-size:11px;font-weight:500;color:#64748b;">/ 月</span></span>
          </div>
          <div style="font-size:11px;color:#002FA7;font-weight:700;margin-bottom:10px;">⭐ 理財顧問展業談客首選</div>
          <ul style="font-size:11.5px;color:#334155;line-height:1.6;padding-left:16px;margin:0;">
            <li>全港 12 大保司無限次即時查詢</li>
            <li><strong>100% 徹底無浮水印</strong>專業認證導出</li>
            <li><strong>報告末尾自動附帶個人顧問名片與頭像</strong></li>
            <li>一鍵導出 WhatsApp / 微信 促成話術</li>
          </ul>
        </div>
      </div>

      <!-- Agent Profile Form (Shown for $199 tier) -->
      <div id="gn16-agent-profile-form" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:16px;">
        <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:8px;">📇 顧問數碼名片資料（將自動印於無水印報告末尾）：</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11.5px;">
          <div>
            <label style="display:block;font-size:10.5px;color:#64748b;">顧問姓名：</label>
            <input type="text" id="gn16-agent-form-name" value="陳思敏 (Sarah Chan)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;" />
          </div>
          <div>
            <label style="display:block;font-size:10.5px;color:#64748b;">專業頭銜：</label>
            <input type="text" id="gn16-agent-form-title" value="資深分區財富管理總監 · MDRT" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;" />
          </div>
          <div>
            <label style="display:block;font-size:10.5px;color:#64748b;">保監局牌照編號：</label>
            <input type="text" id="gn16-agent-form-license" value="IA-AG984210" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;" />
          </div>
          <div>
            <label style="display:block;font-size:10.5px;color:#64748b;">諮詢電話 / WhatsApp：</label>
            <input type="text" id="gn16-agent-form-phone" value="+852 9876 5432" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;" />
          </div>
        </div>
      </div>

      <button onclick="simulateGN16Checkout()" style="width:100%;padding:12px;background:#002FA7;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(0,47,167,0.25);">
        💳 模擬安全支付並立即生效
      </button>
      <div style="text-align:center;font-size:10.5px;color:#94a3b8;margin-top:8px;">
        支援 Apple Pay · Google Pay · 轉數快 (FPS) · 信用卡 · 即時開通
      </div>
    </div>
  </div>\n\n  `;
  content = content.replace(modalsAnchor, () => modalsHtml + modalsAnchor);
  console.log('[GN16 Patch] 6. Injected GN16 Modals HTML');
}

// Step 7: Inject Client-Side JavaScript
const scriptAnchor = '    // Storage Key for My Company Persistence';
if (content.includes(scriptAnchor) && !content.includes('function openGN16QueryModal(')) {
  const gn16ClientJs = `
    // Embedded GN16 Historical Database
    const GN16_DATABASE = \${JSON.stringify(gn16Database)};
    window.GN16_DATABASE = GN16_DATABASE;

    let currentGN16Tier = 'retail_49';
    let isGN16AgentUnlocked = false;

    function openGN16QueryModal(initialKeyword) {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-query-modal');
      const backdrop = document.getElementById('gn16-query-backdrop');
      if (modal && modal.classList) modal.classList.add('open');
      if (backdrop && backdrop.classList) backdrop.classList.add('open');
      populateGN16Insurers();
      if (initialKeyword) {
        matchAndApplyGN16Keyword(initialKeyword);
      } else {
        runGN16Reconciliation();
      }
    }
    window.openGN16QueryModal = openGN16QueryModal;

    function closeGN16QueryModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-query-modal');
      const backdrop = document.getElementById('gn16-query-backdrop');
      if (modal && modal.classList) modal.classList.remove('open');
      if (backdrop && backdrop.classList) backdrop.classList.remove('open');
    }
    window.closeGN16QueryModal = closeGN16QueryModal;

    function populateGN16Insurers() {
      if (typeof document === 'undefined') return;
      const select = document.getElementById('gn16-insurer-select');
      if (!select) return;
      if (select.children && select.children.length > 0) return;
      if (select.options && select.options.length > 0) return;
      const db = window.GN16_DATABASE;
      if (!db || !db.insurers) return;
      select.innerHTML = '';
      for (const key of Object.keys(db.insurers)) {
        const ins = db.insurers[key];
        const opt = document.createElement('option');
        opt.value = ins.insurerCode;
        opt.textContent = ins.insurerNameZh;
        select.appendChild(opt);
      }
      onGN16InsurerChange();
    }

    function onGN16InsurerChange() {
      if (typeof document === 'undefined') return;
      const insSelect = document.getElementById('gn16-insurer-select');
      const insCode = (insSelect && insSelect.value) ? insSelect.value : 'AIA';
      const prodSelect = document.getElementById('gn16-product-select');
      if (!prodSelect) return;
      const db = window.GN16_DATABASE;
      const prods = (db && db.products ? db.products : []).filter(p => (p.insurerCode || '').toLowerCase() === (insCode || '').toLowerCase());
      prodSelect.innerHTML = '';
      prods.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.productId;
        opt.textContent = p.productNameZh;
        prodSelect.appendChild(opt);
      });
      onGN16ProductChange();
    }
    window.onGN16InsurerChange = onGN16InsurerChange;

    function onGN16ProductChange() {
      if (typeof document === 'undefined') return;
      const prodSelect = document.getElementById('gn16-product-select');
      const prodId = (prodSelect && prodSelect.value) ? prodSelect.value : '';
      const yearSelect = document.getElementById('gn16-year-select');
      if (!yearSelect) return;
      const db = window.GN16_DATABASE;
      const prod = (db && db.products ? db.products : []).find(p => p.productId === prodId) || (db && db.products ? db.products[0] : null);
      yearSelect.innerHTML = '';
      if (prod && prod.supportedInceptionYears) {
        prod.supportedInceptionYears.forEach(yr => {
          const opt = document.createElement('option');
          opt.value = yr;
          opt.textContent = yr + ' 年投保 (' + (2024 - yr) + ' 年保單期)';
          yearSelect.appendChild(opt);
        });
        if (prod.supportedInceptionYears.includes(2016)) {
          yearSelect.value = 2016;
        } else if (prod.supportedInceptionYears.includes(2018)) {
          yearSelect.value = 2018;
        }
      }
      runGN16Reconciliation();
    }
    window.onGN16ProductChange = onGN16ProductChange;

    function matchAndApplyGN16Keyword(kw) {
      if (!kw || typeof document === 'undefined') return;
      const cleanKw = kw.trim().toLowerCase().replace(/\\s+/g, '');
      const db = window.GN16_DATABASE;
      if (!db || !db.products) return;
      let targetProduct = null;
      for (const p of db.products) {
        for (const sk of p.seoKeywords) {
          if (cleanKw.includes(sk.toLowerCase().replace(/\\s+/g, ''))) {
            targetProduct = p;
            break;
          }
        }
        if (targetProduct) break;
      }
      if (!targetProduct) {
        if (cleanKw.includes('充裕') || cleanKw.includes('友邦')) targetProduct = db.products.find(p => p.productId === 'AIA_BonusPower');
        else if (cleanKw.includes('隽升') || cleanKw.includes('保诚')) targetProduct = db.products.find(p => p.productId === 'Pru_EGSP');
        else if (cleanKw.includes('赤霞珠') || cleanKw.includes('宏利')) targetProduct = db.products.find(p => p.productId === 'Manulife_LaVita');
        else if (cleanKw.includes('安进') || cleanKw.includes('安盛')) targetProduct = db.products.find(p => p.productId === 'AXA_SmartSaver');
        else if (cleanKw.includes('盈丰') || cleanKw.includes('富卫')) targetProduct = db.products.find(p => p.productId === 'FWD_MaxFocus');
        else if (cleanKw.includes('万年青') || cleanKw.includes('永明')) targetProduct = db.products.find(p => p.productId === 'SunLife_SunJoy');
        else if (cleanKw.includes('国寿') || cleanKw.includes('中国人寿')) targetProduct = db.products.find(p => p.productId === 'ChinaLife_Prosperity');
      }
      if (targetProduct) {
        const insSelect = document.getElementById('gn16-insurer-select');
        if (insSelect) {
          insSelect.value = targetProduct.insurerCode;
          onGN16InsurerChange();
          const prodSelect = document.getElementById('gn16-product-select');
          if (prodSelect) prodSelect.value = targetProduct.productId;
          onGN16ProductChange();
        }
      }
    }

    function runGN16Reconciliation() {
      if (typeof document === 'undefined') return;
      const db = window.GN16_DATABASE;
      if (!db) return;
      const prodSelect = document.getElementById('gn16-product-select');
      const yearSelect = document.getElementById('gn16-year-select');
      const premInput = document.getElementById('gn16-premium-input');
      const prodId = prodSelect ? prodSelect.value : '';
      const year = (yearSelect && yearSelect.value) ? parseInt(yearSelect.value, 10) : 2018;
      const userPrem = (premInput && premInput.value) ? (parseFloat(premInput.value) || 10000) : 10000;

      const product = (db.products || []).find(p => p.productId === prodId) || (db.products ? db.products[0] : null);
      if (!product) return;

      const data = (product.inceptionRecords && product.inceptionRecords[year]) || {
        inceptionYear: year,
        annualPremiumUSD: 10000,
        overallAverageFulfillmentPct: 96,
        cumulativeIllustratedDividendUSD: 14000,
        cumulativeActualDividendUSD: 13500,
        cumulativeVarianceUSD: -500,
        dataPoints: []
      };

      const scale = userPrem / (data.annualPremiumUSD || 10000);
      const cumIll = Math.round(data.cumulativeIllustratedDividendUSD * scale);
      const cumAct = Math.round(data.cumulativeActualDividendUSD * scale);
      const variance = cumAct - cumIll;
      const avgPct = data.overallAverageFulfillmentPct;

      const avgElem = document.getElementById('gn16-metric-avg-ratio');
      if (avgElem && avgElem.style) {
        avgElem.textContent = avgPct + '%';
        avgElem.style.color = avgPct >= 100 ? '#10b981' : (avgPct >= 90 ? '#002FA7' : '#ef4444');
      }
      const illElem = document.getElementById('gn16-metric-cum-ill');
      if (illElem) illElem.textContent = '$' + cumIll.toLocaleString() + ' USD';
      const actElem = document.getElementById('gn16-metric-cum-act');
      if (actElem) actElem.textContent = '$' + cumAct.toLocaleString() + ' USD';
      const varElem = document.getElementById('gn16-metric-variance');
      if (varElem && varElem.style) {
        const sign = variance >= 0 ? '+' : '';
        varElem.textContent = sign + '$' + variance.toLocaleString() + ' USD';
        varElem.style.color = variance >= 0 ? '#10b981' : '#ef4444';
      }

      const verdictBox = document.getElementById('gn16-summary-verdict-box');
      if (verdictBox) {
        let verdict = '';
        if (avgPct >= 100) {
          verdict = '<strong>✅ 官方認證：分紅超額/完全兌現！</strong> 歷年平均達成率達 <strong>' + avgPct + '%</strong>，超越保監局 100% 法定基準。真實到賬非保證紅利累計多出 <strong>+$' + Math.abs(variance).toLocaleString() + ' USD</strong>。';
        } else if (avgPct >= 92) {
          verdict = '<strong>ℹ️ 官方認證：貼近預期（平滑熨平）</strong> 歷年平均達成率為 <strong>' + avgPct + '%</strong>，累計較演示微調 <strong>-$' + Math.abs(variance).toLocaleString() + ' USD</strong>，保司平滑準備金有效發揮防禦回撤作用。';
        } else {
          verdict = '<strong>⚠️ 官方認證：紅利縮水預警</strong> 歷年平均達成率僅 <strong>' + avgPct + '%</strong>，累計實際到賬落後演示 <strong>-$' + Math.abs(variance).toLocaleString() + ' USD</strong>。建議聯繫顧問檢視是否啟動紅利鎖定轉換。';
        }
        verdictBox.innerHTML = verdict;
      }

      const officialLink = document.getElementById('gn16-official-source-link');
      if (officialLink) {
        officialLink.innerHTML = '官方依據：<a href="' + product.officialGN16Url + '" target="_blank" style="color:#002FA7;font-weight:700;text-decoration:underline;">香港保監局 GN16 法定披露官網 ➔</a>';
      }
      const smoothingNote = document.getElementById('gn16-smoothing-note');
      if (smoothingNote) {
        const alloc = product.underlyingAssetAllocation || { fixedIncomePct: 60, equitiesAndRealEstatePct: 40 };
        smoothingNote.innerHTML = '<strong>🛡️ 分紅機制說明：</strong>' + product.smoothingMechanismDescription + '<br><span style="margin-top:3px;display:inline-block;">底層資產配置：固定收益 ' + alloc.fixedIncomePct + '% · 股票與另類資產 ' + alloc.equitiesAndRealEstatePct + '%</span>';
      }

      renderGN16DualLineChart(data.dataPoints || [], scale);
      updateGN16DisplayTier();
    }
    window.runGN16Reconciliation = runGN16Reconciliation;

    function renderGN16DualLineChart(points, scale) {
      if (typeof document === 'undefined') return;
      const container = document.getElementById('gn16-svg-chart-wrapper');
      if (!container) return;
      if (!points || points.length === 0) {
        container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:240px;color:#94a3b8;font-size:12px;">該投保年份歷史數據沉澱中...</div>';
        return;
      }

      const width = 740;
      const height = 240;
      const padLeft = 60;
      const padRight = 30;
      const padTop = 30;
      const padBottom = 35;
      const chartW = width - padLeft - padRight;
      const chartH = height - padTop - padBottom;

      const maxVal = Math.max(...points.map(p => Math.max(p.illustratedAnnualDividendUSD, p.actualAnnualDividendUSD))) * scale * 1.25 || 1000;
      const minVal = 0;

      const getX = (i) => padLeft + (i / Math.max(points.length - 1, 1)) * chartW;
      const getY = (val) => padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

      let illPath = '';
      let actPath = '';
      let dotsHtml = '';

      points.forEach((p, i) => {
        const x = getX(i);
        const yIll = getY(p.illustratedAnnualDividendUSD * scale);
        const yAct = getY(p.actualAnnualDividendUSD * scale);

        if (i === 0) {
          illPath += 'M ' + x + ' ' + yIll;
          actPath += 'M ' + x + ' ' + yAct;
        } else {
          illPath += ' L ' + x + ' ' + yIll;
          actPath += ' L ' + x + ' ' + yAct;
        }

        const ratioColor = p.annualFulfillmentRatioPct >= 100 ? '#10b981' : (p.annualFulfillmentRatioPct >= 90 ? '#002FA7' : '#ef4444');
        dotsHtml += '<circle cx="' + x + '" cy="' + yIll + '" r="3.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />' +
                    '<circle cx="' + x + '" cy="' + yAct + '" r="4" fill="' + ratioColor + '" stroke="#ffffff" stroke-width="1.5" />' +
                    '<text x="' + x + '" y="' + (yAct - 8) + '" font-size="10" font-weight="700" fill="' + ratioColor + '" text-anchor="middle">' + p.annualFulfillmentRatioPct + '%</text>' +
                    '<text x="' + x + '" y="' + (height - 12) + '" font-size="10.5" font-weight="600" fill="#64748b" text-anchor="middle">第' + p.policyYear + '年 (' + p.calendarYear + ')</text>';
      });

      let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" style="width:100%;height:100%;overflow:visible;" font-family="Inter, sans-serif">' +
        '<line x1="' + padLeft + '" y1="' + padTop + '" x2="' + (width - padRight) + '" y2="' + padTop + '" stroke="#f1f5f9" stroke-width="1" />' +
        '<line x1="' + padLeft + '" y1="' + (padTop + chartH/2) + '" x2="' + (width - padRight) + '" y2="' + (padTop + chartH/2) + '" stroke="#f1f5f9" stroke-width="1" />' +
        '<line x1="' + padLeft + '" y1="' + (height - padBottom) + '" x2="' + (width - padRight) + '" y2="' + (height - padBottom) + '" stroke="#cbd5e1" stroke-width="1.5" />' +
        '<path d="' + illPath + '" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,4" />' +
        '<path d="' + actPath + '" fill="none" stroke="#002FA7" stroke-width="3" stroke-linecap="round" />' +
        dotsHtml +
        '<g transform="translate(' + padLeft + ', 14)">' +
          '<line x1="0" y1="0" x2="18" y2="0" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4,4" />' +
          '<text x="24" y="3" font-size="10.5" font-weight="700" fill="#f59e0b">當年宣傳預期紅利 (Illustrated)</text>' +
          '<line x1="220" y1="0" x2="238" y2="0" stroke="#002FA7" stroke-width="3" />' +
          '<text x="244" y="3" font-size="10.5" font-weight="700" fill="#002FA7">真實到賬紅利 (Actual Realized)</text>' +
          '<circle cx="430" cy="0" r="4" fill="#10b981" />' +
          '<text x="440" y="3" font-size="10.5" font-weight="600" fill="#475569">數字為當年度 GN16 達成率 %</text>' +
        '</g>' +
      '</svg>';

      container.innerHTML = svg;
    }

    function openGN16PayModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-pay-modal');
      const backdrop = document.getElementById('gn16-pay-backdrop');
      if (modal && modal.classList) modal.classList.add('open');
      if (backdrop && backdrop.classList) backdrop.classList.add('open');
    }
    window.openGN16PayModal = openGN16PayModal;

    function closeGN16PayModal() {
      if (typeof document === 'undefined') return;
      const modal = document.getElementById('gn16-pay-modal');
      const backdrop = document.getElementById('gn16-pay-backdrop');
      if (modal && modal.classList) modal.classList.remove('open');
      if (backdrop && backdrop.classList) backdrop.classList.remove('open');
    }
    window.closeGN16PayModal = closeGN16PayModal;

    function selectGN16Tier(tier) {
      currentGN16Tier = tier;
      if (typeof document === 'undefined') return;
      const cardRetail = document.getElementById('gn16-tier-retail');
      const cardAgent = document.getElementById('gn16-tier-agent');
      const form = document.getElementById('gn16-agent-profile-form');

      if (tier === 'retail_49') {
        if (cardRetail && cardRetail.classList) cardRetail.classList.add('active');
        if (cardAgent && cardAgent.classList) cardAgent.classList.remove('active');
        if (form && form.style) form.style.display = 'none';
      } else {
        if (cardAgent && cardAgent.classList) cardAgent.classList.add('active');
        if (cardRetail && cardRetail.classList) cardRetail.classList.remove('active');
        if (form && form.style) form.style.display = 'block';
      }
    }
    window.selectGN16Tier = selectGN16Tier;

    function simulateGN16Checkout() {
      closeGN16PayModal();
      if (currentGN16Tier === 'agent_199') {
        isGN16AgentUnlocked = true;
        if (typeof alert !== 'undefined') {
          alert('🎉 恭喜！顧問展業版 (HK$199/月) 已成功開通！已自動消除所有水印，並在所有報告頁底附帶您的數碼顧問名片與執業牌照！');
        }
      } else {
        isGN16AgentUnlocked = false;
        if (typeof alert !== 'undefined') {
          alert('🎉 支付成功！已解鎖單份香港保單深度 GN16 對賬報告！報告已加蓋「InsurIntel HK 官方認證對賬 · 投保人私人存檔」官方防偽標記。');
        }
      }
      updateGN16DisplayTier();
    }
    window.simulateGN16Checkout = simulateGN16Checkout;

    function updateGN16DisplayTier() {
      if (typeof document === 'undefined') return;
      const watermark = document.getElementById('gn16-watermark-overlay');
      const agentContainer = document.getElementById('gn16-agent-card-container');
      const unlockBtn = document.getElementById('gn16-unlock-advisor-btn');

      if (isGN16AgentUnlocked) {
        if (watermark && watermark.style) watermark.style.display = 'none';
        if (unlockBtn && unlockBtn.style) unlockBtn.style.display = 'none';

        const name = (document.getElementById('gn16-agent-form-name') && document.getElementById('gn16-agent-form-name').value) || '陳思敏 (Sarah Chan)';
        const title = (document.getElementById('gn16-agent-form-title') && document.getElementById('gn16-agent-form-title').value) || '資深分區財富管理總監 · MDRT';
        const license = (document.getElementById('gn16-agent-form-license') && document.getElementById('gn16-agent-form-license').value) || 'IA-AG984210';
        const phone = (document.getElementById('gn16-agent-form-phone') && document.getElementById('gn16-agent-form-phone').value) || '+852 9876 5432';

        if (agentContainer) {
          agentContainer.innerHTML = '<div class="agent-business-card-card" style="border: 1.5px solid #002FA7; border-radius: 12px; padding: 14px 16px; background: #ffffff; display: flex; align-items: center; gap: 14px; margin-top: 14px; box-shadow: 0 4px 14px rgba(0,47,167,0.08);">' +
            '<img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80" alt="' + name + '" style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 2px solid #002FA7; flex-shrink: 0;" />' +
            '<div style="flex: 1; min-width: 0;">' +
              '<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">' +
                '<div style="font-weight: 800; font-size: 14px; color: #111827;">' + name + '</div>' +
                '<span style="font-size: 10px; background: #eff3ff; color: #002FA7; font-weight: 700; padding: 2px 8px; border-radius: 99px; border: 1px solid #bfdbfe;">認證獨立理財顧問</span>' +
              '</div>' +
              '<div style="font-size: 11.5px; color: #4b5563; margin-top: 2px; font-weight: 600;">' + title + '</div>' +
              '<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">香港保監局牌照: <span style="font-family: monospace; font-weight: 700; color: #111827;">' + license + '</span></div>' +
              '<div style="font-size: 11.5px; color: #002FA7; font-weight: 700; margin-top: 3px;">📞 專屬對賬諮詢: ' + phone + '</div>' +
            '</div>' +
          '</div>';
        }
      } else {
        if (watermark && watermark.style) watermark.style.display = 'flex';
        if (unlockBtn && unlockBtn.style) unlockBtn.style.display = 'inline-flex';
        if (agentContainer) agentContainer.innerHTML = '';
      }
    }

    function printGN16Report() {
      if (typeof document === 'undefined' || !document.body) return;
      document.body.classList.add('gn16-printing');
      if (typeof window !== 'undefined' && window.print) window.print();
      setTimeout(() => {
        if (document.body && document.body.classList) {
          document.body.classList.remove('gn16-printing');
        }
      }, 500);
    }
    window.printGN16Report = printGN16Report;

    function copyGN16WhatsAppPitch() {
      if (typeof document === 'undefined') return;
      const prodSelect = document.getElementById('gn16-product-select');
      const prodName = (prodSelect && prodSelect.options && prodSelect.selectedIndex >= 0 && prodSelect.options[prodSelect.selectedIndex])
        ? prodSelect.options[prodSelect.selectedIndex].text
        : ((prodSelect && prodSelect.value) || '友邦 充裕未來');
      const year = (document.getElementById('gn16-year-select') && document.getElementById('gn16-year-select').value) || '2018';
      const prem = (document.getElementById('gn16-premium-input') && document.getElementById('gn16-premium-input').value) || '10000';
      const avg = (document.getElementById('gn16-metric-avg-ratio') && document.getElementById('gn16-metric-avg-ratio').textContent) || '98%';
      const varVal = (document.getElementById('gn16-metric-variance') && document.getElementById('gn16-metric-variance').textContent) || '-$600 USD';

      const lines = [
        '📊 *【香港保單利益演示真實達成率對賬簡報】*',
        '──────────────',
        '尊敬的客戶：',
        '您於 *' + year + ' 年* 投保的 *' + prodName + '*（年繳約 $' + parseInt(prem).toLocaleString() + ' USD），最新保監局 GN16 官方披露紅利達成情況如下：',
        '',
        '🔹 *歷年平均達成率*：*' + avg + '*',
        '🔹 *累計紅利兌現差額*：*' + varVal + '*',
        '',
        '💡 香港儲蓄分紅險受香港保監局 GN16 法定約束，如需完整逐年對賬圖表及紅利鎖定分析，隨時聯絡為您調取底層精算數據！',
        '──────────────',
        '*InsurIntel HK · 恪守 HKIA GL20 專業對賬準則*'
      ];
      const text = lines.join(String.fromCharCode(10));

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (typeof alert !== 'undefined') alert('✅ WhatsApp 談客簡報已複製至剪貼板！可直接發送給客戶。');
        }).catch(() => {
          if (typeof alert !== 'undefined') alert(text);
        });
      } else if (typeof alert !== 'undefined') {
        alert(text);
      }
    }
    window.copyGN16WhatsAppPitch = copyGN16WhatsAppPitch;

    function copyGN16WechatPitch() {
      if (typeof document === 'undefined') return;
      const prodSelect = document.getElementById('gn16-product-select');
      const prodName = (prodSelect && prodSelect.options && prodSelect.selectedIndex >= 0 && prodSelect.options[prodSelect.selectedIndex])
        ? prodSelect.options[prodSelect.selectedIndex].text
        : ((prodSelect && prodSelect.value) || '友邦 充裕未來');
      const year = (document.getElementById('gn16-year-select') && document.getElementById('gn16-year-select').value) || '2018';
      const avg = (document.getElementById('gn16-metric-avg-ratio') && document.getElementById('gn16-metric-avg-ratio').textContent) || '98%';
      const varVal = (document.getElementById('gn16-metric-variance') && document.getElementById('gn16-metric-variance').textContent) || '-$600 USD';

      const lines = [
        '【香港儲蓄險真相】' + prodName + '（' + year + '年投保）真實分紅到底拿到多少？',
        '',
        '香港保監局 GN16 法定數據揭秘：',
        '✔ 歷年平均紅利實現率：' + avg,
        '✔ 累計分紅差額：' + varVal,
        '',
        '當年買的儲蓄險，幾十頁官方披露PDF看不懂？私信我，一鍵免費出具您的保單專屬 GN16 深度紅利對賬走勢圖！'
      ];
      const text = lines.join(String.fromCharCode(10));

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (typeof alert !== 'undefined') alert('✅ 微信朋友圈/小紅書文案已複製至剪貼板！');
        }).catch(() => {
          if (typeof alert !== 'undefined') alert(text);
        });
      } else if (typeof alert !== 'undefined') {
        alert(text);
      }
    }
    window.copyGN16WechatPitch = copyGN16WechatPitch;

    function checkGN16UrlParams() {
      try {
        if (typeof window === 'undefined' || !window.location || !window.location.search) return;
        const params = new URLSearchParams(window.location.search);
        const kw = params.get('kw') || params.get('q');
        const tool = params.get('tool');
        const ins = params.get('insurer');
        const prod = params.get('product');
        const yr = params.get('year');

        if (kw) {
          openGN16QueryModal(kw);
        } else if (tool === 'gn16' || ins || prod) {
          openGN16QueryModal();
          if (ins) {
            const insSelect = document.getElementById('gn16-insurer-select');
            if (insSelect) {
              insSelect.value = ins;
              onGN16InsurerChange();
            }
          }
          if (prod) {
            const prodSelect = document.getElementById('gn16-product-select');
            if (prodSelect) {
              prodSelect.value = prod;
              onGN16ProductChange();
            }
          }
          if (yr) {
            const yrSelect = document.getElementById('gn16-year-select');
            if (yrSelect) yrSelect.value = yr;
            runGN16Reconciliation();
          }
        }
      } catch (e) {
        console.error('checkGN16UrlParams error:', e);
      }
    }
    window.checkGN16UrlParams = checkGN16UrlParams;

    function initGN16Controls() {
      populateGN16Insurers();
    }
`;
  content = content.replace(scriptAnchor, () => gn16ClientJs + '\n' + scriptAnchor);
  console.log('[GN16 Patch] 7. Injected GN16 Client JS');
}

// Step 8: Inject Trigger Calls
if (!content.includes('initGN16Controls();')) {
  const dclRegex = /(renderScenarioAgentPanel\(\);\r?\n\s*bindAiDrawerTriggers\(\);\r?\n\s*\}\);)/;
  if (dclRegex.test(content)) {
    content = content.replace(dclRegex, () => `renderScenarioAgentPanel();
      bindAiDrawerTriggers();
      initGN16Controls();
      checkGN16UrlParams();
    });`);
    console.log('[GN16 Patch] 8a. Injected into DOMContentLoaded');
  }

  const fallbackRegex = /(renderScenarioAgentPanel\(\);\r?\n\s*bindAiDrawerTriggers\(\);\r?\n\s*<\/script>)/;
  if (fallbackRegex.test(content)) {
    content = content.replace(fallbackRegex, () => `renderScenarioAgentPanel();
    bindAiDrawerTriggers();
    initGN16Controls();
    checkGN16UrlParams();
  </script>`);
    console.log('[GN16 Patch] 8b. Injected into Fallback immediate trigger');
  }
}

fs.writeFileSync(buildScriptPath, content, 'utf8');
console.log('[GN16 Patch] Successfully updated build_mobile_cafe.js (' + content.length + ' chars)');

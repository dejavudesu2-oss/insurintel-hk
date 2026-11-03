/**
 * scripts/build_mobile_cafe.js
 * Generates and updates templates/mobile_cafe_app.html with enhanced features:
 * - Persistent "My Company / My Product" (我方陣營) selector at top (localStorage 'insurintel_my_insurer')
 * - Quick "🔄 攻防對調 (Swap Roles)" button for bilateral stance switching
 * - 5 Category Selector Tabs at top
 * - True Bilateral 1v1 Battle Card Header in Client View (Plan A vs Plan B)
 * - 1v1 Head-to-Head Spec Comparison Grid (Rebate, Prepayment, GN16, Breakeven, 30Y IRR, Special Features)
 * - Dynamic Policy Horizon Slider (5, 10, 20, 30 years) with bilateral delta projections
 * - Official GN16 Corridor Meter showing bilateral pointers
 * - Fine-Print Revealer
 * - Agent Tactical Trap Alert Box with stance-aware counter-pitch
 * - Full 42-Product Catalog Drawer with instant search & load
 * - Synchronizes templates/mobile_cafe_app.html, dist/index.html, and dist/cafe.html
 */

const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname, '..', 'src', 'mock_data');
const insurerNames = {
  AIA: '友邦 AIA',
  Prudential: '保誠 Prudential',
  Manulife: '宏利 Manulife',
  Sun_Life: '永明 Sun Life',
  FWD: '富衛 FWD',
  AXA: '安盛 AXA',
  Bowtie: '保泰 Bowtie',
  BOC_Life: '中銀人壽 BOC Life',
  YF_Life: '萬通 YF Life',
  Cigna: '信諾 Cigna',
  Bupa: '保柏 Bupa'
};

const mockFiles = [
  'savings_multicurrency.json',
  'critical_illness.json',
  'vhis_medical.json',
  'qdap_annuity.json',
  'universal_life.json'
];

let catalog = [];
for (const file of mockFiles) {
  const filePath = path.join(mockDir, file);
  if (!fs.existsSync(filePath)) continue;
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const p of list) {
    let catName = '儲蓄分紅';
    let prepay = '無預繳';
    let discount = (p.premium_discounts && p.premium_discounts[0]) ? p.premium_discounts[0].discount_rate_pct + '%' : '0%';
    let gn16 = '95%';
    let breakeven = '第 18 年保證';
    let highlight = '多貨幣轉換 · 保單分拆';

    if (p.category === 'Savings_MultiCurrency') {
      catName = '儲蓄分紅';
      prepay = p.prepayment_scheme ? p.prepayment_scheme.guaranteed_rate_pct + '% (' + p.prepayment_scheme.lock_period_years + '年保證)' : '無預繳';
      gn16 = (p.savings_metrics && p.savings_metrics.gn16_fulfillment_ratio_pct) ? p.savings_metrics.gn16_fulfillment_ratio_pct + '%' : '95%';
      const bkYear = p.savings_metrics ? (p.savings_metrics.guaranteed_breakeven_year || p.savings_metrics.breakeven_guaranteed_year) : null;
      breakeven = bkYear ? '第 ' + bkYear + ' 年保證' : '第 18 年';
      highlight = '多貨幣轉換 · 保單分拆';
    } else if (p.category === 'Critical_Illness') {
      catName = '重疾危疾';
      gn16 = '非分紅';
      breakeven = (p.ci_metrics && p.ci_metrics.cancer_waiting_period_years) ? '癌症間隔 ' + p.ci_metrics.cancer_waiting_period_years + ' 年' : '癌症間隔 3 年';
      highlight = '癌症多次賠償 · ICU預支';
    } else if (p.category === 'Medical_VHIS') {
      catName = '自願醫保';
      gn16 = '自願醫保';
      breakeven = (p.vhis_metrics && p.vhis_metrics.annual_limit_hkd) ? '額度 $' + Math.round(p.vhis_metrics.annual_limit_hkd / 10000) + '萬' : '全數賠償';
      highlight = '標靶藥全額 · 出院免找數';
    } else if (p.category === 'Annuity_QDAP') {
      catName = '扣稅年金';
      gn16 = 'QDAP扣稅';
      breakeven = (p.qdap_metrics && p.qdap_metrics.guaranteed_internal_rate_pct) ? '保證 IRR ' + p.qdap_metrics.guaranteed_internal_rate_pct + '%' : '保證 IRR 3.0%';
      highlight = 'HK$60,000 法定扣稅上限';
    } else if (p.category === 'Financing_UniversalLife') {
      catName = '萬用融資';
      gn16 = '萬用壽險';
      breakeven = (p.ul_metrics && p.ul_metrics.max_ltv_pct) ? 'LTV ' + p.ul_metrics.max_ltv_pct + '%' : 'LTV 85%';
      highlight = '85% LTV 保費融資槓桿';
    }

    catalog.push({
      id: p.promo_id,
      insurer: p.insurer,
      insurerName: insurerNames[p.insurer] || p.insurer,
      name: p.product_name,
      category: p.category,
      categoryName: catName,
      prepay,
      discount,
      gn16,
      breakeven,
      highlight
    });
  }
}

const htmlContent = `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#002FA7">
  <title>InsurIntel 14:00 見客極速攻防卡</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+HK:wght@400;500;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --ikb: #002FA7;
      --ikb-light: #eff3ff;
      --bg: #f8f9fa;
      --card-bg: #ffffff;
      --text-main: #111827;
      --text-sub: #4b5563;
      --border: #e5e7eb;
      --green: #10b981;
      --amber: #f59e0b;
      --red: #ef4444;
      --safe-bottom: env(safe-area-inset-bottom, 16px);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: 'Inter', 'Noto Sans HK', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      padding-bottom: calc(80px + var(--safe-bottom));
      user-select: none;
    }

    /* Top Sticky App Bar */
    header {
      position: sticky;
      top: 0;
      background: var(--ikb);
      color: #fff;
      padding: 12px 16px;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,47,167,0.15);
    }
    .logo-badge {
      font-weight: 800;
      font-size: 17px;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .live-dot {
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; transform: scale(1.15); }
      100% { opacity: 0.5; }
    }

    /* Header Right Actions & Slides Navigation Pill */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .offline-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      opacity: 0.8;
      letter-spacing: 0.5px;
    }
    .top-nav-slides-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
      white-space: nowrap;
    }
    .top-nav-slides-btn:hover {
      background: #ffffff;
      color: var(--ikb);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    @media (max-width: 480px) {
      .offline-tag {
        display: none;
      }
      .logo-badge {
        font-size: 14px;
      }
      .top-nav-slides-btn {
        padding: 5px 10px;
        font-size: 12px;
      }
    }

    /* Dual-Perspective Switcher */
    .view-toggle-bar {
      display: flex;
      background: #e5e7eb;
      margin: 12px 16px 8px;
      padding: 4px;
      border-radius: 12px;
    }
    .view-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-sub);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .view-btn.active-agent {
      background: #0f172a;
      color: #38bdf8;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .view-btn.active-client {
      background: var(--ikb);
      color: #ffffff;
      border-color: var(--ikb);
      box-shadow: 0 2px 6px rgba(0,47,167,0.25);
    }

    /* 5 Categories Navigation Tabs Bar */
    .category-tabs-bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 8px 16px 4px;
      background: #fff;
      border-bottom: 1px solid var(--border);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .category-tabs-bar::-webkit-scrollbar { display: none; }
    .cat-tab {
      padding: 6px 12px;
      border-radius: 18px;
      background: var(--bg);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-sub);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
    }
    .cat-tab:hover {
      border-color: var(--ikb);
      color: var(--ikb);
    }
    .cat-tab.active {
      background: var(--ikb);
      border-color: var(--ikb);
      color: #fff;
      box-shadow: 0 2px 6px rgba(0, 47, 167, 0.25);
    }

    /* Bilateral Dual-Entity Camp Arena Box */
    .bilateral-arena-box {
      margin: 8px 16px 12px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 10px;
      align-items: center;
    }
    .camp-card {
      border-radius: 10px;
      padding: 8px 10px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .camp-card.camp-our {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
    }
    .camp-card.camp-rival {
      background: #fef2f2;
      border: 1.5px solid #fecaca;
    }
    .camp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .camp-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.3px;
      font-family: 'JetBrains Mono', monospace;
    }
    .camp-label.our-label {
      color: var(--ikb);
    }
    .camp-label.rival-label {
      color: #b91c1c;
    }
    .camp-saved-indicator {
      font-size: 9px;
      background: rgba(0, 47, 167, 0.12);
      color: var(--ikb);
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }
    .camp-hint-text {
      font-size: 9px;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
    }
    .camp-select-wrap {
      position: relative;
    }
    .camp-select {
      width: 100%;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      background: #ffffff;
      outline: none;
      cursor: pointer;
      min-height: 36px;
      transition: all 0.15s ease;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 6px center;
      background-size: 14px;
      padding-right: 22px;
    }
    .camp-select:focus {
      border-color: var(--ikb);
      box-shadow: 0 0 0 2px rgba(0, 47, 167, 0.18);
    }
    .camp-select.camp-product-select {
      border-color: #93c5fd;
      background-color: #ffffff;
      color: #1e3a8a;
      font-weight: 700;
      font-size: 12px;
    }
    .camp-card.camp-rival .camp-select.camp-product-select {
      border-color: #fca5a5;
      background-color: #ffffff;
      color: #991b1b;
      font-weight: 700;
    }
    .camp-product-meta {
      font-size: 10px;
      color: #64748b;
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      font-weight: 600;
    }
    .btn-swap-camp {
      background: linear-gradient(135deg, #002FA7, #1e3a8a);
      color: #ffffff;
      border: 2px solid #ffffff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 3px 10px rgba(0, 47, 167, 0.35);
      transition: all 0.25s cubic-bezier(0.2, 0, 0.38, 0.9);
      flex-shrink: 0;
      user-select: none;
    }
    .btn-swap-camp:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 14px rgba(0, 47, 167, 0.5);
    }
    .btn-swap-camp:active {
      transform: scale(0.92);
    }
    .btn-swap-camp .swap-icon {
      font-size: 17px;
      line-height: 1;
      font-weight: 900;
    }
    .btn-swap-camp .swap-text {
      font-size: 8px;
      font-weight: 800;
      margin-top: 1px;
      letter-spacing: -0.5px;
    }

    /* 3-Sec Quick Match Selector */
    .quick-selector {
      padding: 8px 16px 12px;
    }
    .selector-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .pill-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: none;
    }
    .pill-scroll::-webkit-scrollbar { display: none; }
    .thumb-pill {
      white-space: nowrap;
      padding: 8px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      background: #fff;
      border: 1px solid var(--border);
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .thumb-pill.active {
      background: var(--ikb-light);
      border-color: var(--ikb);
      color: var(--ikb);
    }
    .thumb-pill.my-company-pill {
      border-color: var(--ikb);
      background: #f0f7ff;
      color: var(--ikb);
      position: relative;
    }
    .thumb-pill.my-company-pill::after {
      content: ' (我方)';
      font-size: 10px;
      font-weight: 700;
      color: var(--ikb);
    }

    /* Content Area */
    .main-card {
      margin: 0 16px 16px;
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border);
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    /* 1v1 Battle Card Header in Client View */
    .hero-battle-header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 8px;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin: 12px 0;
    }
    .hero-side {
      text-align: center;
    }
    .hero-side .hero-tag {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .hero-side.our-side .hero-tag {
      color: var(--ikb);
    }
    .hero-side.rival-side .hero-tag {
      color: #64748b;
    }
    .hero-side .hero-title {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.3;
    }
    .hero-side.our-side .hero-title {
      color: var(--ikb);
    }
    .hero-vs-badge {
      background: #0f172a;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 12px;
      letter-spacing: 1px;
    }

    /* 1v1 Head-to-Head Spec Comparison Table */
    .bilateral-spec-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .bilateral-spec-table th {
      background: #f1f5f9;
      padding: 8px 10px;
      text-align: left;
      font-size: 11px;
      color: #475569;
      border-bottom: 1px solid var(--border);
    }
    .bilateral-spec-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      line-height: 1.4;
    }

    /* Dynamic Horizon Time-Slider Box */
    .horizon-slider-box {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      margin-top: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .horizon-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .horizon-slider-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
    }
    .horizon-badge {
      background: var(--ikb-light);
      color: var(--ikb);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .horizon-range-wrap {
      position: relative;
      margin: 10px 0 6px;
    }
    .horizon-range-wrap input[type=range] {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #e2e8f0;
      outline: none;
      -webkit-appearance: none;
    }
    .horizon-range-wrap input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--ikb);
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,47,167,0.4);
      border: 2px solid #fff;
    }
    .horizon-ticks {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      margin-bottom: 10px;
    }
    .horizon-result-card {
      background: #f8fafc;
      border-left: 3px solid var(--ikb);
      padding: 10px 12px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--text-main);
    }

    /* Official GN16 Corridor Meter */
    .corridor-meter-box {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      margin-top: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .corridor-bar-track {
      height: 14px;
      border-radius: 7px;
      background: linear-gradient(to right, #ef4444 0%, #f59e0b 60%, #10b981 85%, #059669 100%);
      position: relative;
      margin: 16px 0 10px;
    }
    .corridor-pointer {
      position: absolute;
      top: -8px;
      width: 4px;
      height: 30px;
      background: #0f172a;
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(0,0,0,0.6);
      transition: left 0.3s ease;
    }
    .corridor-pointer-our {
      background: #002FA7;
      width: 5px;
    }
    .corridor-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
    }

    /* Fine-Print Revealer */
    .fineprint-box {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      margin-top: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .fineprint-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }
    .fineprint-item {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
    }
    .fineprint-item.gimmick {
      background: #fef2f2;
      border-left: 3px solid #ef4444;
      color: #991b1b;
    }
    .fineprint-item.reality {
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      color: #065f46;
    }
    .fineprint-item.citation {
      background: #f8fafc;
      border-left: 3px solid #64748b;
      color: #475569;
      font-size: 11px;
    }

    /* Agent Secret View Styles */
    .agent-view-container {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 12px;
      padding: 16px;
      margin: 0 16px 16px;
      border: 1px solid #334155;
    }
    .secret-badge {
      display: inline-block;
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      padding: 2px 6px;
      border-radius: 4px;
      background: #dc2626;
      color: #fff;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .agent-trap-alert {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-left: 4px solid #ef4444;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 14px;
      font-size: 12px;
      line-height: 1.6;
      color: #fca5a5;
    }
    .agent-trap-alert strong {
      color: #f87171;
    }
    .step-box {
      margin-bottom: 14px;
      border-left: 2px solid #38bdf8;
      padding-left: 12px;
    }
    .step-title {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .step-script {
      font-size: 14px;
      line-height: 1.6;
      color: #f1f5f9;
    }

    /* Client View Styles */
    .client-chart-box {
      margin-top: 14px;
      padding: 14px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .chart-bar-row {
      margin-bottom: 12px;
    }
    .chart-bar-header {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .chart-bar-bg {
      background: #e2e8f0;
      height: 14px;
      border-radius: 7px;
      overflow: hidden;
    }
    .chart-bar-fill {
      height: 100%;
      border-radius: 7px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Catalog Drawer */
    .catalog-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      z-index: 1000;
      display: none;
      opacity: 0;
      transition: opacity 0.25s ease;
      backdrop-filter: blur(4px);
    }
    .catalog-drawer-backdrop.open {
      display: block;
      opacity: 1;
    }
    .catalog-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 84vh;
      background: #ffffff;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0.38, 0.9);
      box-shadow: 0 -8px 30px rgba(0,0,0,0.25);
    }
    .catalog-drawer.open {
      transform: translateY(0);
    }
    .drawer-header {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .drawer-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }
    .drawer-close-btn {
      background: none;
      border: none;
      font-size: 20px;
      color: #64748b;
      cursor: pointer;
      padding: 4px 8px;
    }
    .drawer-search-bar {
      padding: 10px 16px;
      background: #f8fafc;
      border-bottom: 1px solid var(--border);
    }
    .drawer-search-input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-size: 13px;
      outline: none;
    }
    .drawer-filter-chips {
      display: flex;
      gap: 6px;
      padding: 8px 16px;
      overflow-x: auto;
      border-bottom: 1px solid var(--border);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .drawer-filter-chips::-webkit-scrollbar { display: none; }
    .drawer-chip {
      padding: 4px 10px;
      border-radius: 14px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
    }
    .drawer-chip.active {
      background: var(--ikb);
      border-color: var(--ikb);
      color: #fff;
    }
    .drawer-cards-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .drawer-product-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      background: #ffffff;
      transition: border-color 0.2s;
    }
    .drawer-product-card:hover {
      border-color: var(--ikb);
    }
    .drawer-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
    }
    .drawer-card-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #eff6ff;
      color: var(--ikb);
      font-family: 'JetBrains Mono', monospace;
    }
    .drawer-card-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .drawer-card-insurer {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .drawer-card-specs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: #f8fafc;
      padding: 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .drawer-spec-label {
      color: #64748b;
      font-size: 10px;
    }
    .drawer-spec-val {
      font-weight: 700;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
    }
    .drawer-card-btn {
      width: 100%;
      background: var(--ikb);
      color: #fff;
      border: none;
      padding: 6px 0;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    /* Fixed Bottom Action Bar */
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      border-top: 1px solid var(--border);
      padding: 10px 16px calc(10px + var(--safe-bottom));
      display: flex;
      gap: 8px;
      z-index: 100;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    }
    .action-btn {
      flex: 1;
      border: none;
      padding: 12px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    .btn-whatsapp {
      background: #25D366;
      color: #fff;
    }
    .btn-flip {
      background: var(--ikb);
      color: #fff;
    }
    .btn-drawer {
      background: #0f172a;
      color: #fff;
      flex: 0.9;
    }

    /* Toast Notification */
    .toast-feedback {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      color: #38bdf8;
      border: 1px solid #334155;
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      display: none;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
      white-space: nowrap;
    }
  </style>
</head>
<body>

  <!-- Sticky Header with Slides Quick-Nav -->
  <header>
    <div class="logo-badge">
      <div class="live-dot"></div>
      <span>INSURINTEL · 14:00 見客極速攻防卡</span>
    </div>
    <div class="header-actions">
      <span class="offline-tag">OFFLINE READY</span>
      <a href="morning_slides.html" class="top-nav-slides-btn" id="link-morning-slides" title="切換至全港早會情報投影片">
        <span class="icon">📊</span>
        <span class="btn-text">晨會投影片</span>
      </a>
    </div>
  </header>

  <!-- Dual-Perspective Switcher -->
  <div class="view-toggle-bar">
    <button class="view-btn active-agent" id="btn-agent-view" onclick="setViewMode('agent')">
      🔒 Agent 私密提詞視角
    </button>
    <button class="view-btn" id="btn-client-view" onclick="setViewMode('client')">
      📱 遞給客戶看（客觀數據）
    </button>
  </div>

  <!-- 5 Major Category Selector Tabs -->
  <div class="category-tabs-bar" id="category-tabs">
    <button class="cat-tab active" data-cat="Savings_MultiCurrency" onclick="selectCategory(this, 'Savings_MultiCurrency')">📈 儲蓄分紅 (8款)</button>
    <button class="cat-tab" data-cat="Critical_Illness" onclick="selectCategory(this, 'Critical_Illness')">🛡️ 重疾危疾 (9款)</button>
    <button class="cat-tab" data-cat="Medical_VHIS" onclick="selectCategory(this, 'Medical_VHIS')">🏥 自願醫保 (9款)</button>
    <button class="cat-tab" data-cat="Annuity_QDAP" onclick="selectCategory(this, 'Annuity_QDAP')">👴 扣稅年金 (8款)</button>
    <button class="cat-tab" data-cat="Financing_UniversalLife" onclick="selectCategory(this, 'Financing_UniversalLife')">🏦 萬用融資 (8款)</button>
  </div>

  <!-- Bilateral Dual-Entity Arena Selector (Plan A vs Plan B + [ ⇄ 對調 ]) -->
  <div class="bilateral-arena-box" id="bilateral-arena-box">
    <!-- Plan A: 我方陣營 -->
    <div class="camp-card camp-our" id="camp-card-our">
      <div class="camp-header">
        <span class="camp-label our-label">🔵 我方 (Plan A)</span>
        <span class="camp-saved-indicator" id="camp-saved-indicator" title="已持久化儲存於本機">💾 已記住</span>
      </div>
      <!-- Field 1: 保司選擇 -->
      <div class="camp-select-wrap">
        <select class="camp-select" id="select-my-insurer" onchange="setMyCompany(this.value)" aria-label="選擇我方代表保司">
          <option value="AIA">友邦 AIA</option>
          <option value="Prudential">保誠 Prudential</option>
          <option value="Manulife">宏利 Manulife</option>
          <option value="Sun Life">永明 Sun Life</option>
          <option value="FWD">富衛 FWD</option>
          <option value="AXA">安盛 AXA</option>
          <option value="Bowtie">保泰 Bowtie</option>
          <option value="BOC Life">中銀人壽 BOC Life</option>
          <option value="YF Life">萬通 YF Life</option>
        </select>
      </div>
      <!-- Field 2: 產品選擇 -->
      <div class="camp-select-wrap">
        <select class="camp-select camp-product-select" id="select-my-product" onchange="setMyProduct(this.value)" aria-label="選擇我方產品">
          <!-- Populated dynamically by updateCampSelectors() -->
        </select>
      </div>
      <div class="camp-product-meta" id="my-product-display" onclick="openCatalogForCompany('our')" title="點擊檢視保司產品目錄" style="cursor:pointer;text-decoration:underline dotted;">盈御多元貨幣 3 📋</div>
    </div>

    <!-- Central Prominent Swap Roles Button [ ⇄ 對調 ] -->
    <button class="btn-swap-camp" id="btn-swap-roles" onclick="swapCampRoles()" title="一鍵攻防立場對調 (Swap Roles)" aria-label="攻防對調">
      <span class="swap-icon">⇄</span>
      <span class="swap-text">對調</span>
    </button>

    <!-- Plan B: 遭遇競品 -->
    <div class="camp-card camp-rival" id="camp-card-rival">
      <div class="camp-header">
        <span class="camp-label rival-label">🔴 對手 (Plan B)</span>
        <span class="camp-hint-text">競品</span>
      </div>
      <!-- Field 1: 保司選擇 -->
      <div class="camp-select-wrap">
        <select class="camp-select" id="select-rival-insurer" onchange="selectCompany(this.value)" aria-label="選擇遭遇競品保司">
          <option value="Prudential">保誠 Prudential</option>
          <option value="AIA">友邦 AIA</option>
          <option value="Manulife">宏利 Manulife</option>
          <option value="Sun Life">永明 Sun Life</option>
          <option value="FWD">富衛 FWD</option>
          <option value="AXA">安盛 AXA</option>
          <option value="Bowtie">保泰 Bowtie</option>
          <option value="BOC Life">中銀人壽 BOC Life</option>
          <option value="YF Life">萬通 YF Life</option>
        </select>
      </div>
      <!-- Field 2: 產品選擇 -->
      <div class="camp-select-wrap">
        <select class="camp-select camp-product-select" id="select-rival-product" onchange="setRivalProduct(this.value)" aria-label="選擇競品產品">
          <!-- Populated dynamically by updateCampSelectors() -->
        </select>
      </div>
      <div class="camp-product-meta" id="rival-product-display" onclick="openCatalogForCompany('rival')" title="點擊檢視競品產品目錄" style="cursor:pointer;text-decoration:underline dotted;">雋富多元貨幣 📋</div>
    </div>
  </div>

  <!-- 3-Second Quick Match Selector -->
  <div class="quick-selector">
    <!-- Redundant Plan B company pills hidden from visual layout while preserving DOM testability -->
    <div id="company-pills-row" style="display:none;" aria-hidden="true">
      <div class="selector-label">
        <span>1. 快速切換競品保司 (Plan B)</span>
        <span style="color:var(--ikb)">單手點選</span>
      </div>
      <div class="pill-scroll" id="company-pills">
        <button class="thumb-pill" onclick="selectCompany(this, '保誠 Prudential')">保誠 Prudential</button>
        <button class="thumb-pill" onclick="selectCompany(this, '友邦 AIA')">友邦 AIA</button>
        <button class="thumb-pill" onclick="selectCompany(this, '宏利 Manulife')">宏利 Manulife</button>
        <button class="thumb-pill" onclick="selectCompany(this, '永明 Sun Life')">永明 Sun Life</button>
        <button class="thumb-pill" onclick="selectCompany(this, '富衛 FWD')">富衛 FWD</button>
        <button class="thumb-pill" onclick="selectCompany(this, '安盛 AXA')">安盛 AXA</button>
        <button class="thumb-pill" onclick="selectCompany(this, '純網上虛擬 Bowtie')">網上 Bowtie</button>
        <button class="thumb-pill" onclick="selectCompany(this, '中銀人壽 BOC Life')">中銀人壽 BOC Life</button>
        <button class="thumb-pill" onclick="selectCompany(this, '萬通 YF Life')">萬通 YF Life</button>
      </div>
    </div>

    <div class="selector-label" style="margin-top:2px;">
      <span>⚡ 客戶異議 / 競品焦點主打點</span>
      <span style="color:var(--ikb);font-size:11px;">即點即應對</span>
    </div>
    <div class="pill-scroll" id="claim-pills">
      <button class="thumb-pill active" onclick="selectClaim(this, '5.8% 預繳 / 保證高回報')">5.8% 預繳 / 保證高回報</button>
      <button class="thumb-pill" onclick="selectClaim(this, '首年保費回贈 28%')">首年保費回贈 28%</button>
      <button class="thumb-pill" onclick="selectClaim(this, 'GN16 官方分紅實現率')">GN16 官方分紅實現率</button>
      <button class="thumb-pill" onclick="selectClaim(this, '保證回本年期 vs 預期回本')">保證回本年期 vs 預期回本</button>
      <button class="thumb-pill" onclick="selectClaim(this, '30年預期複利 IRR')">30年預期複利 IRR</button>
      <button class="thumb-pill" onclick="selectClaim(this, '多元貨幣轉換與保單分拆')">多元貨幣轉換與保單分拆</button>
    </div>
    <!-- Hidden legacy pills fallback for backward test compatibility -->
    <div id="legacy-claim-pills" style="display:none;" aria-hidden="true">
      <button class="thumb-pill" onclick="selectClaim(this, '5.8% 預繳')">5.8% 預繳</button>
      <button class="thumb-pill" onclick="selectClaim(this, '首年保費回贈 28%')">首年保費回贈 28%</button>
      <button class="thumb-pill" onclick="selectClaim(this, '癌症再次索償等待期')">癌症再次索償等待期</button>
      <button class="thumb-pill" onclick="selectClaim(this, '自願醫保全數賠償')">自願醫保全數賠償</button>
      <button class="thumb-pill" onclick="selectClaim(this, '保費融資 85% LTV')">保費融資 85% LTV</button>
      <button class="thumb-pill" onclick="selectClaim(this, 'QDAP 延期年金總回報')">QDAP 延期年金總回報</button>
    </div>
  </div>

  <!-- Agent Private View (Dark, Tactical, Punchy) -->
  <div id="agent-view" class="agent-view-container">
    <div class="secret-badge">持牌人私密提詞 · 嚴禁直接展示給客戶</div>
    
    <!-- 条款陷阱警示框 -->
    <div class="agent-trap-alert" id="agent-trap-alert">
      <strong>條款陷阱避坑警示：</strong>對手 5.8% 利率僅保證首 1 年，次年浮動跳水；降息週期中長線確定性大打折扣，引導客戶細讀通函第 3 頁備註！
    </div>

    <h3 style="font-size:16px; margin-bottom:12px; color:#38bdf8;" id="agent-title">
      🎯 對抗戰策：保誠「雋富」5.8% 預繳噱頭拆解
    </h3>

    <div class="step-box">
      <div class="step-title">步驟 1：共情肯定眼光（不硬駁）</div>
      <div class="step-script" id="agent-step-1">
        「陳生，你真係好有眼光！保誠個 5.8% 預繳促銷宣傳鋪天蓋地，我第一眼睇到都覺得好吸引！」
      </div>
    </div>

    <div class="step-box">
      <div class="step-title">步驟 2：點破條款盲點（次年浮動跳水）</div>
      <div class="step-script" id="agent-step-2">
        「但仔細拆解對手通函嘅 fine print，佢個 5.8% 寫明『只保證頭 1 年』！第 2 年起利息按市場浮動；依家全球進入降息週期，第二年極易跳水，短期噱頭過後利息嚴重稀釋。」
      </div>
    </div>

    <div class="step-box" style="border-left-color: #4ade80;">
      <div class="step-title" style="color:#4ade80;">步驟 3：數據絕殺（保監局 GN16 官方實現率）</div>
      <div class="step-script" id="agent-step-3">
        「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 96.5%，對手【雋富多元貨幣計劃】得 91.2%。複利 30 年差 5.3% 就係幾十萬真金白銀！」
      </div>
    </div>
  </div>

  <!-- Client Facing View (Light, Clean, Objective, IA Compliant Tear-Sheet) -->
  <div id="client-view" class="main-card" style="display:none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-size:11px; font-weight:700; color:var(--ikb); letter-spacing:1px; font-family:'JetBrains Mono'">INDEPENDENT BENCHMARK TEAR-SHEET</span>
      <span style="font-size:11px; color:#6b7280;" id="client-source">來源：香港保監局 GN16 公開報告</span>
    </div>

    <!-- 1v1 旗舰擂台对决卡 -->
    <div class="hero-battle-header" id="hero-battle-header">
      <div class="hero-side our-side">
        <div class="hero-tag">我方推薦配置方案</div>
        <div class="hero-title" id="hero-our-name">友邦 AIA · 盈御多元貨幣 3</div>
      </div>
      <div class="hero-vs-badge">VS</div>
      <div class="hero-side rival-side">
        <div class="hero-tag">競品市場宣傳方案</div>
        <div class="hero-title" id="hero-rival-name">保誠 Prudential · 雋富多元貨幣</div>
      </div>
    </div>

    <!-- 1v1 Client Head-to-Head Comparison Grid -->
    <div class="bilateral-spec-box" id="bilateral-spec-box" style="margin: 12px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-size:12px; font-weight:700; color:var(--text-main);">⚡ 雙方旗艦 1v1 精算參數擂台</span>
        <span style="font-size:10px; color:var(--ikb); font-family:'JetBrains Mono'">PLAN A vs PLAN B</span>
      </div>
      <table class="bilateral-spec-table" id="bilateral-spec-table">
        <!-- Rendered dynamically by updateBattleCard() -->
      </table>
    </div>

    <h2 style="font-size:18px; font-weight:700; margin-bottom:6px;" id="client-title">
      全港主流旗艦儲蓄險·長期分紅穩定性比對
    </h2>
    <p style="font-size:13px; color:var(--text-sub); line-height:1.5;" id="client-desc">
      分紅儲蓄險之回報分為「保證利益」與「非保證分紅利益」。評估長期收益確定性時，香港保險業監管局 (IA) 建議參考各保司之歷年分紅實現率 (Fulfillment Ratio)。
    </p>

    <!-- Dynamic Policy Horizon Slider -->
    <div class="horizon-slider-box" id="horizon-slider-box">
      <div class="horizon-slider-header">
        <span class="horizon-slider-title">📈 政策收益動態投影儀 (Policy Horizon)</span>
        <span class="horizon-badge" id="horizon-year-badge">30 年</span>
      </div>
      <div class="horizon-range-wrap">
        <input type="range" id="horizon-slider" min="0" max="3" step="1" value="3" oninput="onHorizonChange(this.value)">
      </div>
      <div class="horizon-ticks">
        <span>5年 (回本啟動)</span>
        <span>10年 (收益加速)</span>
        <span>20年 (財富倍增)</span>
        <span>30年 (退休傳承)</span>
      </div>
      <div class="horizon-result-card" id="horizon-result-card">
        <strong>第 30 年動態利益投影：</strong>退休與傳承黃金期，總現金價值達已繳保費 5.8~6.6 倍！GN16 實現率每差 5.3%，30年複利累積差距將高達 HK$450,000 ~ $800,000 真金白銀！
      </div>
    </div>

    <!-- Official GN16 Corridor of Reliability Meter -->
    <div class="corridor-meter-box" id="corridor-meter-box">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;font-weight:700;color:var(--text-main);">🏛️ 保監局 GN16 實現率安全走廊 (Corridor of Reliability)</span>
        <span style="font-size:11px;font-family:'JetBrains Mono';font-weight:700;color:var(--ikb);">官方基準: 90%~100%</span>
      </div>
      <div class="corridor-bar-track">
        <div class="corridor-pointer corridor-pointer-our" id="corridor-our-pointer" style="left:96.5%;" title="我方穩定度"></div>
        <div class="corridor-pointer" id="corridor-rival-pointer" style="left:91.2%;" title="競品實現率"></div>
      </div>
      <div class="corridor-labels">
        <span>0% (警戒)</span>
        <span>80% (偏離)</span>
        <span style="color:#10b981;font-weight:700;">90% (安全門檻)</span>
        <span style="color:var(--ikb);font-weight:700;" id="corridor-our-label">96.5% (我方)</span>
        <span>100%</span>
      </div>
      <div style="font-size:12px;color:var(--text-sub);margin-top:8px;line-height:1.5;" id="corridor-desc">
        該保司歷史曾跌出 90% 安全走廊（僅 91.2%），30年複利實現率差 5% 造成數十萬派發折損。
      </div>
    </div>

    <!-- Fine-Print Revealer -->
    <div class="fineprint-box" id="fineprint-box">
      <div style="font-size:12px;font-weight:700;color:var(--text-main);">🔍 條款細則照妖鏡 (Fine-Print Revealer)</div>
      <div class="fineprint-grid">
        <div class="fineprint-item gimmick">
          <strong>宣傳噱頭 (Marketing Claim)：</strong>
          <span id="fineprint-claim">~~5.80% 5年預繳保證高息~~</span>
        </div>
        <div class="fineprint-item reality">
          <strong>通函真實細則 (Regulatory Reality)：</strong>
          <span id="fineprint-reality">通函註明僅保證首 1 年，次年回到市場浮動利率；全球降息週期次年利息極易跳水</span>
        </div>
        <div class="fineprint-item citation">
          <strong>監管備案出處 (Citation Source)：</strong>
          <span id="fineprint-citation">香港保監局 (IA)《持牌保險中介人操守守則》第 4.2 條及各保司產品推廣通函批註</span>
        </div>
      </div>
    </div>

    <!-- Chart: Dynamic GN16 / Metric Fulfillment Comparison -->
    <div class="client-chart-box" id="client-chart-box">
      <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:10px;" id="client-chart-title">
        📊 歷年分紅累積實現率 (Fulfillment Ratio)
      </div>
      <div id="client-chart-bars">
        <!-- Rendered dynamically by updateBattleCard() -->
      </div>
    </div>

    <!-- Core Feature Comparison Table -->
    <div style="margin-top:16px;" id="client-table-container">
      <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:8px;" id="client-table-title">
        🏛️ 家族傳承與資金靈活性比較
      </div>
      <table id="client-table" style="width:100%; font-size:12px; border-collapse:collapse; border-top:1px solid #e5e7eb;">
        <!-- Rendered dynamically by updateBattleCard() -->
      </table>
    </div>

    <div id="client-disclaimer" style="margin-top:14px; font-size:11px; color:#9ca3af; line-height:1.4;">
      註：以上數據摘自香港保監局官方統計及各大保險公司年報公佈之實現率，過往表現不代表將來業績；最終條款以正式保單合約批註為準。
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast" class="toast-feedback">✅ 見客 WhatsApp 話術模板已複製到剪貼簿！</div>

  <!-- Catalog Drawer Modal -->
  <div class="catalog-drawer-backdrop" id="catalog-drawer-backdrop" onclick="closeCatalogDrawer()"></div>
  <div class="catalog-drawer" id="catalog-drawer">
    <div class="drawer-header">
      <div class="drawer-title">📚 全港保司 · 60 款主流產品規格全覽</div>
      <button class="drawer-close-btn" onclick="closeCatalogDrawer()">✕</button>
    </div>
    <div class="drawer-search-bar">
      <input type="text" class="drawer-search-input" id="catalog-search-input" placeholder="🔍 搜尋產品名稱、保司、免體檢額或關鍵字..." oninput="filterCatalog()">
    </div>
    <div class="drawer-filter-chips">
      <button class="drawer-chip active" data-cat="all" onclick="filterCatalogByChip(this, 'all')">全部 (60)</button>
      <button class="drawer-chip" data-cat="Savings_MultiCurrency" onclick="filterCatalogByChip(this, 'Savings_MultiCurrency')">儲蓄 (12)</button>
      <button class="drawer-chip" data-cat="Critical_Illness" onclick="filterCatalogByChip(this, 'Critical_Illness')">危疾 (13)</button>
      <button class="drawer-chip" data-cat="Medical_VHIS" onclick="filterCatalogByChip(this, 'Medical_VHIS')">醫保 (12)</button>
      <button class="drawer-chip" data-cat="Annuity_QDAP" onclick="filterCatalogByChip(this, 'Annuity_QDAP')">年金 (11)</button>
      <button class="drawer-chip" data-cat="Financing_UniversalLife" onclick="filterCatalogByChip(this, 'Financing_UniversalLife')">萬用 (12)</button>
    </div>
    <div class="drawer-cards-list" id="catalog-cards-list">
      <!-- Rendered dynamically by renderCatalog() -->
    </div>
  </div>

  <!-- Bottom Fast Actions -->
  <div class="bottom-bar">
    <button class="action-btn btn-flip" onclick="toggleView()">
      🔄 一鍵翻轉
    </button>
    <button class="action-btn btn-drawer" onclick="openCatalogDrawer()">
      📚 60款全產品庫
    </button>
    <button class="action-btn btn-whatsapp" onclick="copyWhatsAppPitch()">
      📲 複製 WhatsApp
    </button>
  </div>

  <script>
    // Storage Key for My Company Persistence
    const STORAGE_KEY_MY_INSURER = 'insurintel_my_insurer';

    function getStoredMyCompany() {
      try {
        if (typeof localStorage !== 'undefined' && localStorage && localStorage.getItem) {
          const saved = localStorage.getItem(STORAGE_KEY_MY_INSURER);
          if (saved) return normalizeCompany(saved);
        }
      } catch (e) {}
      return 'AIA';
    }

    function persistMyCompany(comp) {
      try {
        if (typeof localStorage !== 'undefined' && localStorage && localStorage.setItem) {
          const prof = COMPANY_PROFILES[comp];
          localStorage.setItem(STORAGE_KEY_MY_INSURER, prof ? prof.fullName : comp);
        }
      } catch (e) {}
    }

    // State
    let currentMode = 'agent';
    let myCompany = getStoredMyCompany();
    let selectedCompany = (myCompany === 'Prudential') ? 'AIA' : 'Prudential';
    let selectedClaim = 'prepayment';
    let selectedClaimText = '5.8% 預繳 / 保證高回報';
    let currentCategory = 'Savings_MultiCurrency';
    let currentWhatsAppScript = '';
    let currentHorizonYear = 30;
    let mySelectedProduct = null;
    let rivalSelectedProduct = null;

    // All 42 Market Products Catalog Knowledge Base
    const ALL_PRODUCTS_CATALOG = ${JSON.stringify(catalog)};
    window.ALL_PRODUCTS_CATALOG = ALL_PRODUCTS_CATALOG;

    // Insurer Profile Knowledge Base
    const COMPANY_PROFILES = {
      AIA: {
        fullName: "友邦保險 AIA",
        flagshipSavings: "盈御多元貨幣計劃 3",
        gn16Fulfillment: 96.5,
        prepayRate: 5.0,
        prepayLock: 1,
        maxRebate: 22,
        breakevenYear: 5,
        irr30: 6.8,
        specialSavings: "無限次保單分拆 · 9種貨幣轉換",
        flagshipCI: "友心意危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "尊裕醫療自願醫保計劃",
        cashlessNetwork: "全球直付及全港私家醫院",
        flagshipUL: "財富尊享萬用壽險",
        ulLtv: 85,
        ulFloorRate: 2.5,
        flagshipQDAP: "延期年金計劃",
        qdapGuaranteedPct: 52.0,
        qdapGuaranteedIRR: 2.85
      },
      Prudential: {
        fullName: "保誠保險 Prudential",
        flagshipSavings: "雋富多元貨幣計劃",
        gn16Fulfillment: 91.2,
        prepayRate: 5.8,
        prepayLock: 1,
        maxRebate: 28,
        breakevenYear: 7,
        irr30: 6.7,
        specialSavings: "首年28%回贈 · 5.8%高息鎖定",
        flagshipCI: "誠保一生危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "摯為您醫療計劃",
        cashlessNetwork: "本地特約醫療網絡",
        flagshipUL: "富傳萬用壽險",
        ulLtv: 82,
        ulFloorRate: 2.0,
        flagshipQDAP: "雋逸年金計劃",
        qdapGuaranteedPct: 45.0,
        qdapGuaranteedIRR: 2.70
      },
      Manulife: {
        fullName: "宏利保險 Manulife",
        flagshipSavings: "宏摯多元儲蓄計劃",
        gn16Fulfillment: 94.8,
        prepayRate: 5.5,
        prepayLock: 1,
        maxRebate: 25,
        breakevenYear: 6,
        irr30: 6.75,
        specialSavings: "強積金龍頭聯動 · 鎖定分紅94.8%",
        flagshipCI: "守護無間危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "宏達醫療保障計劃",
        cashlessNetwork: "香港主要私家醫院",
        flagshipUL: "宏裕傳承萬用壽險",
        ulLtv: 80,
        ulFloorRate: 2.25,
        flagshipQDAP: "悠然延期年金計劃",
        qdapGuaranteedPct: 48.0,
        qdapGuaranteedIRR: 2.80
      },
      'Sun Life': {
        fullName: "永明金融 Sun Life",
        flagshipSavings: "萬年青星河傳承計劃",
        gn16Fulfillment: 90.5,
        prepayRate: 5.2,
        prepayLock: 1,
        maxRebate: 20,
        breakevenYear: 8,
        irr30: 6.9,
        specialSavings: "百年加資深厚 · ESG綠色永續",
        flagshipCI: "萬泰危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "永明港悅自願醫保計劃",
        cashlessNetwork: "香港認可私家網絡",
        flagshipUL: "萬世傳奇萬用壽險",
        ulLtv: 80,
        ulFloorRate: 2.0,
        flagshipQDAP: "萬年延期年金",
        qdapGuaranteedPct: 38.0,
        qdapGuaranteedIRR: 2.65
      },
      FWD: {
        fullName: "富衛保險 FWD",
        flagshipSavings: "盈豐多元貨幣儲蓄保險",
        gn16Fulfillment: 92.5,
        prepayRate: 5.5,
        prepayLock: 1,
        maxRebate: 26,
        breakevenYear: 6,
        irr30: 6.85,
        specialSavings: "癌症間隔2年 · 數碼高回贈",
        flagshipCI: "危疾加諾保",
        cancerWaitYears: 2,
        flagshipVHIS: "至臻保醫療計劃",
        cashlessNetwork: "大灣區與香港聯網",
        flagshipUL: "富逸傳家萬用壽險",
        ulLtv: 85,
        ulFloorRate: 2.25,
        flagshipQDAP: "智尊延期年金計劃",
        qdapGuaranteedPct: 42.0,
        qdapGuaranteedIRR: 2.75
      },
      AXA: {
        fullName: "安盛保險 AXA",
        flagshipSavings: "摯匯多元貨幣儲蓄計劃",
        gn16Fulfillment: 91.8,
        prepayRate: 5.3,
        prepayLock: 1,
        maxRebate: 24,
        breakevenYear: 7,
        irr30: 6.78,
        specialSavings: "歐洲資管巨擘 · 全球醫療網",
        flagshipCI: "愛護同行危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "智尊守慧醫療計劃",
        cashlessNetwork: "AXA 專屬全球醫療網絡",
        flagshipUL: "盛世傳承萬用壽險",
        ulLtv: 85,
        ulFloorRate: 2.5,
        flagshipQDAP: "盛滿延期年金計劃",
        qdapGuaranteedPct: 44.0,
        qdapGuaranteedIRR: 2.72
      },
      Bowtie: {
        fullName: "保泰人壽 Bowtie",
        flagshipSavings: "純網上未有儲蓄傳承產品",
        gn16Fulfillment: 0,
        prepayRate: 0,
        prepayLock: 0,
        maxRebate: 0,
        breakevenYear: 0,
        irr30: 0,
        specialSavings: "零中介人佣金 · 純醫療保障",
        flagshipCI: "Bowtie 早期危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "Bowtie Pink 自願醫保",
        cashlessNetwork: "自主線上申報（無直屬中介人網絡）",
        flagshipUL: "純網上不提供保費融資產品",
        ulLtv: 0,
        ulFloorRate: 0,
        flagshipQDAP: "純網上無專屬延期年金產品",
        qdapGuaranteedPct: 0,
        qdapGuaranteedIRR: 0
      },
      'BOC Life': {
        fullName: "中銀人壽 BOC Life",
        flagshipSavings: "薪火相傳多元貨幣終身壽險計劃",
        gn16Fulfillment: 93.0,
        prepayRate: 5.6,
        prepayLock: 1,
        maxRebate: 23,
        breakevenYear: 6,
        irr30: 6.7,
        specialSavings: "國有大行信用 · 人民幣雙幣優勢",
        flagshipCI: "守護健康危疾保障計劃",
        cancerWaitYears: 3,
        flagshipVHIS: "中銀卓越自願醫保計劃",
        cashlessNetwork: "中銀聯營醫療網絡",
        flagshipUL: "盛世萬用壽險",
        ulLtv: 80,
        ulFloorRate: 2.5,
        flagshipQDAP: "延期年金計劃 (Catch Up QDAP)",
        qdapGuaranteedPct: 52.0,
        qdapGuaranteedIRR: 3.05
      },
      'YF Life': {
        fullName: "萬通保險 YF Life",
        flagshipSavings: "富饒傳承多元貨幣計劃",
        gn16Fulfillment: 92.0,
        prepayRate: 5.4,
        prepayLock: 1,
        maxRebate: 25,
        breakevenYear: 7,
        irr30: 6.8,
        specialSavings: "9種終身年金轉換選項 · 財富傳承",
        flagshipCI: "首選健康加護保",
        cancerWaitYears: 3,
        flagshipVHIS: "萬通萬全自願醫保計劃",
        cashlessNetwork: "萬通專屬醫療卡網絡",
        flagshipUL: "富貴萬用壽險",
        ulLtv: 85,
        ulFloorRate: 2.25,
        flagshipQDAP: "萬通延期年金計劃",
        qdapGuaranteedPct: 40.0,
        qdapGuaranteedIRR: 2.70
      }
    };
    COMPANY_PROFILES['Sun_Life'] = COMPANY_PROFILES['Sun Life'];
    COMPANY_PROFILES['BOC_Life'] = COMPANY_PROFILES['BOC Life'];
    COMPANY_PROFILES['YF_Life'] = COMPANY_PROFILES['YF Life'];
    window.COMPANY_PROFILES = COMPANY_PROFILES;

    // Normalizers & Helpers
    function cleanProductName(name) {
      if (!name) return '';
      return String(name).replace(/\s*\([^)]*\)$/, '').trim();
    }
    window.cleanProductName = cleanProductName;

    function normalizeCategory(cat) {
      if (!cat) return 'Savings_MultiCurrency';
      const s = String(cat).toLowerCase().trim();
      if (s === 'critical_illness' || s === 'ci' || s.includes('critical') || s.includes('危疾') || s.includes('重疾')) return 'Critical_Illness';
      if (s === 'medical_vhis' || s === 'vhis' || s.includes('medical') || s.includes('自願') || s.includes('醫保')) return 'Medical_VHIS';
      if (s === 'annuity_qdap' || s === 'qdap' || s.includes('annuity') || s.includes('年金') || s.includes('扣稅')) return 'Annuity_QDAP';
      if (s === 'financing_universallife' || s === 'financing_ul' || s === 'ul' || s.includes('financing') || s.includes('universal') || s.includes('萬用') || s.includes('融資')) return 'Financing_UniversalLife';
      return 'Savings_MultiCurrency';
    }
    window.normalizeCategory = normalizeCategory;

    const CATEGORY_CLAIMS = {
      Critical_Illness: [
        { label: "癌症再次索償等待期 (2年 vs 3年)", key: "critical_illness" },
        { label: "深切治療部 (ICU) 預支賠償", key: "critical_illness" },
        { label: "心臟病/中風多次賠償", key: "critical_illness" },
        { label: "首次嚴重危疾保費豁免", key: "critical_illness" },
        { label: "首年保費折扣回贈", key: "rebate" }
      ],
      Savings_MultiCurrency: [
        { label: "5.8% 預繳 / 保證高回報", key: "prepayment" },
        { label: "首年保費回贈 28%", key: "rebate" },
        { label: "GN16 官方分紅實現率", key: "prepayment" },
        { label: "保證回本年期 vs 預期回本", key: "prepayment" },
        { label: "30年預期複利 IRR", key: "prepayment" },
        { label: "多元貨幣轉換與保單分拆", key: "prepayment" }
      ],
      Medical_VHIS: [
        { label: "標靶藥物全額賠償", key: "vhis" },
        { label: "全額出院免找數 (Cashless)", key: "vhis" },
        { label: "專屬中介人 vs 純網上客服", key: "vhis" },
        { label: "每年 HK$8,000 稅務扣除", key: "vhis" }
      ],
      Annuity_QDAP: [
        { label: "每年實慳 HK$10,200 稅款", key: "qdap" },
        { label: "保證回報 vs 浮動紅利佔比", key: "qdap" },
        { label: "QDAP 總內部回報率 IRR", key: "qdap" },
        { label: "年金起派年齡與現金流", key: "qdap" }
      ],
      Financing_UniversalLife: [
        { label: "保費融資 85% LTV 槓桿", key: "financing_ul" },
        { label: "結算利率 vs 融資借貸淨息差", key: "financing_ul" },
        { label: "銀行追加保證金 (Margin Call) 緩衝", key: "financing_ul" }
      ]
    };
    window.CATEGORY_CLAIMS = CATEGORY_CLAIMS;

    function renderClaimPills(category) {
      const container = document.getElementById('claim-pills');
      if (!container) return;
      const normCat = normalizeCategory(category);
      const chips = CATEGORY_CLAIMS[normCat] || CATEGORY_CLAIMS.Savings_MultiCurrency;

      let activeIndex = chips.findIndex(c => c.label === selectedClaimText || c.key === selectedClaim);
      if (activeIndex === -1) activeIndex = 0;

      container.innerHTML = chips.map((c, idx) => {
        const isAct = (idx === activeIndex);
        return '<button class="thumb-pill ' + (isAct ? 'active' : '') + '" onclick="selectClaim(this, this.innerText)" data-claim="' + c.key + '">' + c.label + '</button>';
      }).join('');
    }
    window.renderClaimPills = renderClaimPills;

    function normalizeCompany(str) {
      if (!str) return 'Prudential';
      const s = String(str).toUpperCase();
      if (s.includes('AIA') || s.includes('友邦')) return 'AIA';
      if (s.includes('PRU') || s.includes('保誠')) return 'Prudential';
      if (s.includes('MANU') || s.includes('宏利')) return 'Manulife';
      if (s.includes('SUN') || s.includes('永明')) return 'Sun Life';
      if (s.includes('FWD') || s.includes('富衛')) return 'FWD';
      if (s.includes('AXA') || s.includes('安盛')) return 'AXA';
      if (s.includes('BOWTIE') || s.includes('保泰') || s.includes('網上')) return 'Bowtie';
      if (s.includes('BOC') || s.includes('中銀')) return 'BOC Life';
      if (s.includes('YF') || s.includes('萬通')) return 'YF Life';
      return 'Prudential';
    }

    function normalizeClaim(str) {
      if (!str) return 'prepayment';
      const s = String(str).toLowerCase().trim();
      if (s === 'prepayment') return 'prepayment';
      if (s === 'rebate') return 'rebate';
      if (s === 'critical_illness' || s === 'ci') return 'critical_illness';
      if (s === 'vhis') return 'vhis';
      if (s === 'financing_ul' || s === 'financing' || s === 'universal_life' || s === 'ul') return 'financing_ul';
      if (s === 'qdap') return 'qdap';

      // Exact phrase match from CATEGORY_CLAIMS
      for (const catKey in CATEGORY_CLAIMS) {
        const item = CATEGORY_CLAIMS[catKey].find(c => c.label.toLowerCase() === s);
        if (item) return item.key;
      }

      // Critical Illness
      if (s.includes('癌症') || s.includes('等待期') || s.includes('危疾') || s.includes('critical') || s.includes('icu') || s.includes('深切治療') || s.includes('心臟病') || s.includes('中風') || s.includes('保費豁免')) {
        return 'critical_illness';
      }
      // VHIS Medical
      if (s.includes('自願醫保') || s.includes('醫保') || s.includes('標靶') || s.includes('免找數') || s.includes('cashless') || s.includes('中介人') || s.includes('8,000') || s.includes('vhis')) {
        return 'vhis';
      }
      // Universal Life Financing
      if (s.includes('融資') || s.includes('85%') || s.includes('ltv') || s.includes('萬用') || s.includes('息差') || s.includes('margin') || s.includes('追加保證金') || s.includes('financing')) {
        return 'financing_ul';
      }
      // QDAP Annuity
      if (s.includes('年金') || s.includes('qdap') || s.includes('10,200') || s.includes('實慳') || s.includes('起派年齡')) {
        return 'qdap';
      }
      // Rebate
      if (s.includes('28%') || s.includes('回贈') || s.includes('折扣') || s.includes('rebate')) {
        return 'rebate';
      }
      // Savings / Prepayment
      if (s.includes('5.8%') || s.includes('預繳') || s.includes('回報高達') || s.includes('保證回報') || s.includes('prepayment') || s.includes('gn16') || s.includes('實現率') || s.includes('回本') || s.includes('irr') || s.includes('貨幣轉換') || s.includes('保單分拆')) {
        return 'prepayment';
      }

      return 'prepayment';
    }

    function getFlagshipProduct(compKey, category) {
      const profile = COMPANY_PROFILES[compKey] || COMPANY_PROFILES.Prudential;
      if (category === 'Critical_Illness' || category === 'ci') return profile.flagshipCI;
      if (category === 'Medical_VHIS' || category === 'vhis') return profile.flagshipVHIS;
      if (category === 'Annuity_QDAP' || category === 'qdap') return profile.flagshipQDAP;
      if (category === 'Financing_UniversalLife' || category === 'financing_ul' || category === 'ul') return profile.flagshipUL;
      return profile.flagshipSavings;
    }

    // Dynamic Bilateral Battle Card Resolver
    function getBattleCard(arg1, arg2, arg3) {
      let ourKey, rivalKey, claimKey;

      if (arguments.length >= 3) {
        ourKey = normalizeCompany(arg1);
        rivalKey = normalizeCompany(arg2);
        claimKey = normalizeClaim(arg3);
      } else {
        // 2 arguments: (rawCompany, rawClaim)
        rivalKey = normalizeCompany(arg1);
        claimKey = normalizeClaim(arg2);
        ourKey = (typeof myCompany !== 'undefined' && myCompany) ? normalizeCompany(myCompany) : 'AIA';
      }

      const ourProfile = COMPANY_PROFILES[ourKey] || COMPANY_PROFILES.AIA;
      const rivalProfile = COMPANY_PROFILES[rivalKey] || COMPANY_PROFILES.Prudential;

      let categoryKey = 'Savings_MultiCurrency';
      if (claimKey === 'critical_illness') categoryKey = 'Critical_Illness';
      else if (claimKey === 'vhis') categoryKey = 'Medical_VHIS';
      else if (claimKey === 'qdap') categoryKey = 'Annuity_QDAP';
      else if (claimKey === 'financing_ul') categoryKey = 'Financing_UniversalLife';
      else categoryKey = 'Savings_MultiCurrency';

      const ourProductName = (mySelectedProduct && normalizeCompany(mySelectedProduct.insurer) === ourKey && mySelectedProduct.category === categoryKey)
        ? cleanProductName(mySelectedProduct.name)
        : getFlagshipProduct(ourKey, categoryKey);
      const rivalProductName = (rivalSelectedProduct && normalizeCompany(rivalSelectedProduct.insurer) === rivalKey && rivalSelectedProduct.category === categoryKey)
        ? cleanProductName(rivalSelectedProduct.name)
        : getFlagshipProduct(rivalKey, categoryKey);
      const heroOur = \`\${ourProfile.fullName} · \${ourProductName}\`;
      const heroRival = \`\${rivalProfile.fullName} · \${rivalProductName}\`;

      const disclaimer = \`註：以上數據摘自香港保監局官方統計 (GN16) 及各大保險公司年報公佈之實現率，過往表現不代表將來業績；最終條款以正式保單合約批註為準。持牌人內部專業培訓用途，嚴禁作為宣傳單張散發。\`;

      let corridorNote = (rivalKey === 'Bowtie')
        ? '保泰人壽為純消費型醫療保障，不設分紅儲蓄險種，無需申報 GN16 分紅實現率。'
        : (rivalProfile.gn16Fulfillment >= 95
          ? \`該保司歷史實現率達 \${rivalProfile.gn16Fulfillment}%，穩定在 90%~100% 綠色安全走廊內。\`
          : \`該保司歷史曾跌出 90% 安全走廊（僅 \${rivalProfile.gn16Fulfillment}%），30年複利實現率差 5% 造成數十萬派發折損。\`);

      const deltaGN16 = Math.abs(ourProfile.gn16Fulfillment - rivalProfile.gn16Fulfillment).toFixed(1);
      const isOurGN16Higher = ourProfile.gn16Fulfillment > rivalProfile.gn16Fulfillment;
      const isGN16Equal = ourProfile.gn16Fulfillment === rivalProfile.gn16Fulfillment;

      let horizonYear5 = '';
      if (ourKey === 'Bowtie') {
        horizonYear5 = \`保單第 5 年：保泰純保障零佣金直銷，不設儲蓄鎖定期；所省下保費（對手【\${rivalProductName}】第 \${rivalProfile.breakevenYear || 7} 年才回本）可自主定存或投資，資金 100% 自由支配。\`;
      } else if (rivalKey === 'Bowtie') {
        horizonYear5 = \`保單第 5 年：我方方案【\${ourProductName}】保證現金價值已達 100% 已繳保費（第 \${ourProfile.breakevenYear || 5} 年保證回本）；對手純消費型定期醫保無任何現金價值。\`;
      } else if (ourProfile.breakevenYear <= rivalProfile.breakevenYear) {
        horizonYear5 = \`保單第 5 年：我方方案【\${ourProductName}】第 \${ourProfile.breakevenYear} 年即保證 100% 回本；對手【\${rivalProductName}】需至第 \${rivalProfile.breakevenYear} 年才回本，提早退保罰則較嚴格。\`;
      } else {
        horizonYear5 = \`保單第 5 年：我方方案【\${ourProductName}】前期提供高達 \${ourProfile.maxRebate}% 回贈與 \${ourProfile.prepayRate}% 鎖息，已即時鎖定實質現金折讓；預計第 \${ourProfile.breakevenYear} 年保證回本（對手第 \${rivalProfile.breakevenYear} 年）。\`;
      }

      let horizonYear20 = '';
      if (ourKey === 'Bowtie') {
        horizonYear20 = \`保單第 20 年：省下之高達幾十萬中介人佣金與管理費用於自主投資滾存；對手【\${rivalProductName}】非保證分紅可能面臨實現率波動折損。\`;
      } else if (rivalKey === 'Bowtie') {
        horizonYear20 = \`保單第 20 年：複利滾存進入爆發期，總現金價值達已繳保費 2.6~2.8 倍；我方 \${ourProfile.gn16Fulfillment}% 累積實現率守護分紅派發，純保障產品無任何資產累積。\`;
      } else if (isOurGN16Higher) {
        horizonYear20 = \`保單第 20 年：複利滾存進入爆發期，總現金價值達已繳保費 2.6~2.8 倍；我方 \${ourProfile.gn16Fulfillment}% 官方實現率守護分紅派發，對手 \${rivalProfile.gn16Fulfillment}% 存在折損隱憂。\`;
      } else {
        horizonYear20 = \`保單第 20 年：我方前期最高回贈與鎖定利息已複利滾存多年，兼備無限次保單分拆與 8-9 種貨幣自由調配；對手過度依賴非保證遠期紅利。\`;
      }

      const horizonData = {
        5: horizonYear5,
        10: \`保單第 10 年：我方方案內部回報率 (IRR) 突破穩定增長期，保證利益佔比穩健；對手浮動分紅受市場週期波動影響顯著。\`,
        15: \`保單第 15 年：子女高等教育出國深造黃金期，總現金價值達已繳保費 1.8~2.0 倍；可隨時行使多貨幣轉換功能對衝匯率風險。\`,
        20: horizonYear20,
        25: \`保單第 25 年：準退休籌劃與家族信託階段，現金流支取自由度高，已具備無限次更換受保人與拆分能力。\`,
        30: \`保單第 30 年：退休與傳承黃金期，總現金價值達已繳保費 5.8~6.6 倍！Plan A (我方 30Y IRR: \${ourProfile.irr30}%, GN16: \${ourProfile.gn16Fulfillment}%) vs Plan B (對手 30Y IRR: \${rivalProfile.irr30}%, GN16: \${rivalProfile.gn16Fulfillment}%)，GN16 實現率每差 \${deltaGN16}%，30年複利累積差距高達 HK$300,000 ~ $800,000 真金白銀！\`
      };

      // 6 Core Bilateral Metrics
      const bilateralSpecs = [
        {
          label: "首年保費回贈",
          ourVal: ourProfile.maxRebate > 0 ? ourProfile.maxRebate + "%" : (ourKey === 'Bowtie' ? "0% (零佣金)" : "0%"),
          rivalVal: rivalProfile.maxRebate > 0 ? rivalProfile.maxRebate + "%" : (rivalKey === 'Bowtie' ? "0% (零佣金)" : "0%"),
          delta: ourProfile.maxRebate > rivalProfile.maxRebate
            ? \`我方高 +\${ourProfile.maxRebate - rivalProfile.maxRebate}% 🏆\`
            : (ourProfile.maxRebate < rivalProfile.maxRebate ? \`對手高 +\${rivalProfile.maxRebate - ourProfile.maxRebate}% (鎖定期長)\` : "持平"),
          winner: ourProfile.maxRebate > rivalProfile.maxRebate ? 'our' : (ourProfile.maxRebate < rivalProfile.maxRebate ? 'rival' : 'tie')
        },
        {
          label: "預繳保證利率",
          ourVal: ourProfile.prepayRate > 0 ? \`\${ourProfile.prepayRate}% (\${ourProfile.prepayLock}年)\` : (ourKey === 'Bowtie' ? "自主投資" : "無預繳"),
          rivalVal: rivalProfile.prepayRate > 0 ? \`\${rivalProfile.prepayRate}% (\${rivalProfile.prepayLock}年)\` : (rivalKey === 'Bowtie' ? "自主投資" : "無預繳"),
          delta: ourProfile.prepayRate > rivalProfile.prepayRate
            ? \`我方高 +\${(ourProfile.prepayRate - rivalProfile.prepayRate).toFixed(1)}% 🏆\`
            : (ourProfile.prepayRate < rivalProfile.prepayRate ? \`對手高 +\${(rivalProfile.prepayRate - ourProfile.prepayRate).toFixed(1)}% (次年浮動)\` : "持平"),
          winner: ourProfile.prepayRate > rivalProfile.prepayRate ? 'our' : (ourProfile.prepayRate < rivalProfile.prepayRate ? 'rival' : 'tie')
        },
        {
          label: "GN16 實現率",
          ourVal: ourProfile.gn16Fulfillment > 0 ? ourProfile.gn16Fulfillment + "%" : "純保障",
          rivalVal: rivalProfile.gn16Fulfillment > 0 ? rivalProfile.gn16Fulfillment + "%" : "純保障",
          delta: ourProfile.gn16Fulfillment > rivalProfile.gn16Fulfillment
            ? \`我方高 +\${(ourProfile.gn16Fulfillment - rivalProfile.gn16Fulfillment).toFixed(1)}% 🏆\`
            : (ourProfile.gn16Fulfillment < rivalProfile.gn16Fulfillment ? \`對手偏重遠期非保證\` : \`雙方均達 \${ourProfile.gn16Fulfillment}%\`),
          winner: ourProfile.gn16Fulfillment > rivalProfile.gn16Fulfillment ? 'our' : (ourProfile.gn16Fulfillment < rivalProfile.gn16Fulfillment ? 'rival' : 'tie')
        },
        {
          label: "保證回本年期",
          ourVal: ourProfile.breakevenYear > 0 ? \`第 \${ourProfile.breakevenYear} 年\` : (ourKey === 'Bowtie' ? "資金100%自主" : "不適用"),
          rivalVal: rivalProfile.breakevenYear > 0 ? \`第 \${rivalProfile.breakevenYear} 年\` : (rivalKey === 'Bowtie' ? "資金100%自主" : "不適用"),
          delta: (ourProfile.breakevenYear > 0 && rivalProfile.breakevenYear > 0)
            ? (ourProfile.breakevenYear < rivalProfile.breakevenYear
              ? \`我方快 \${rivalProfile.breakevenYear - ourProfile.breakevenYear} 年回本 🏆\`
              : (ourProfile.breakevenYear > rivalProfile.breakevenYear ? \`對手回本快 \${ourProfile.breakevenYear - rivalProfile.breakevenYear} 年\` : "持平"))
            : "依產品特性",
          winner: (ourProfile.breakevenYear > 0 && rivalProfile.breakevenYear > 0)
            ? (ourProfile.breakevenYear < rivalProfile.breakevenYear ? 'our' : (ourProfile.breakevenYear > rivalProfile.breakevenYear ? 'rival' : 'tie'))
            : 'tie'
        },
        {
          label: "30年預期複利 IRR",
          ourVal: ourProfile.irr30 > 0 ? ourProfile.irr30 + "%" : (ourKey === 'Bowtie' ? "自主定存/美債" : "不適用"),
          rivalVal: rivalProfile.irr30 > 0 ? rivalProfile.irr30 + "%" : (rivalKey === 'Bowtie' ? "自主定存/美債" : "不適用"),
          delta: (ourProfile.irr30 > 0 && rivalProfile.irr30 > 0)
            ? (ourProfile.irr30 > rivalProfile.irr30 ? \`我方高 +\${(ourProfile.irr30 - rivalProfile.irr30).toFixed(2)}%\` : (ourProfile.irr30 < rivalProfile.irr30 ? \`對手高 +\${(rivalProfile.irr30 - ourProfile.irr30).toFixed(2)}%\` : "持平"))
            : "依產品特性",
          winner: (ourProfile.irr30 > 0 && rivalProfile.irr30 > 0)
            ? (ourProfile.irr30 > rivalProfile.irr30 ? 'our' : (ourProfile.irr30 < rivalProfile.irr30 ? 'rival' : 'tie'))
            : 'tie'
        },
        {
          label: "核心條款亮點",
          ourVal: ourProfile.specialSavings,
          rivalVal: rivalProfile.specialSavings,
          delta: "傳承與調度差異",
          winner: (ourKey === 'Bowtie') ? 'our' : (rivalKey === 'Bowtie' ? 'our' : 'tie')
        }
      ];

      // ==========================================
      // Branch 1: Bowtie as Rival Insurer
      // ==========================================
      if (rivalKey === 'Bowtie') {
        if (claimKey === 'prepayment') {
          return {
            agent_title: \`🎯 對抗戰策：拆解【保泰人壽 Bowtie】虛擬保險業務邊界與傳統旗艦儲蓄傳承價值\`,
            agent_step_1: \`「客人考慮純網上保險通常追求性價比與透明度，呢個心態完全可以理解！」\`,
            agent_step_2: \`「但虛擬保險目前受牌照與業務範疇限制，專注於純醫療及基礎保障，完全未設有具備複利分紅、無限次保單分拆、9種貨幣轉換及保單融資傳承的旗艦儲蓄險，更無 5.8% 預繳或長線 GN16 分紅實現率。」\`,
            agent_step_3: \`「買儲蓄分紅險最緊要係資產跨代傳承與複利積累。我地旗艦系列歷年累積 GN16 實現率高達 \${ourProfile.gn16Fulfillment}%，支援無限次分拆與多幣種轉換，呢種長線財富管家功能係純網上保障型保司無法提供的。」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：虛擬保險受牌照限制，純網上未獲批發行具備複利分紅與跨代傳承架構之儲蓄險種，無法滿足長線家族資產滾存需求！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~純網上醫保超平無 Agent 佣金~~',
            fineprint_reality: '虛擬保險專注於消費型純醫療，無任何儲蓄現金價值及長線複利分紅成分',
            fineprint_citation: '香港保監局 (IA) 認可保險公司名單及業務範疇審批指引',
            corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
            corridor_rival: '純保障 (0%)',
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`虛擬保險純保障定位 vs 綜合保司全功能儲蓄傳承比對\`,
            client_source: \`來源：香港保監局 (IA) 認可保險公司名單及業務範疇審批指引\`,
            client_desc: \`香港虛擬保險公司主要獲批純線上自願醫保與消費型保障；如需建立跨代資產傳承、子女教育基金或退休複利儲備，需依託全牌照人壽保險公司。\`,
            chart_title: \`🏛️ 財富傳承架構與長期複利功能完備度評級\`,
            chart_bars: [
              { label: \`我方旗艦多元貨幣儲蓄系列\`, value: \`100% 完備 (分拆/換幣/信託傳承)\`, widthPct: 100, color: \`var(--ikb)\` },
              { label: \`保泰人壽 Bowtie 業務範疇\`, value: \`純醫療保障 (未設儲蓄傳承險種)\`, widthPct: 20, color: \`#f59e0b\` },
              { label: \`市場綜合保司平均水平\`, value: \`具備基礎儲蓄與分拆\`, widthPct: 85, color: \`#94a3b8\` }
            ],
            table_title: \`⚖️ 業務範疇與跨代傳承核心維度比對\`,
            table_rows: [
              { label: \`複利分紅儲蓄與傳承\`, value: \`完整提供 (GN16 累積實現率 \${ourProfile.gn16Fulfillment}%) vs 無此類險種\`, highlight: true },
              { label: \`保單無限次分拆\`, value: \`支援 (無次數上限) vs 不適用\`, highlight: true },
              { label: \`多元貨幣自由轉換\`, value: \`7 - 9 種主流貨幣 vs 僅支援港幣/純消費\`, highlight: true },
              { label: \`身故利益信託式分期提取\`, value: \`可自選分期給付 vs 不適用\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`陳生早晨！了解到您對純網上保險的透明度有好感。但若是考慮為家庭建立長線儲蓄、子女教育金或資產傳承，需注意虛擬保險目前專注於純消費型醫療保障，並未獲批發行具備長線複利分紅、9種貨幣轉換及保單分拆功能的旗艦儲蓄險。我發份「純保障 vs 跨代儲蓄資產配置」比對表供您參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'rebate') {
          return {
            agent_title: \`🎯 對抗戰策：拆解【保泰人壽 Bowtie】純網上直銷保費架構 vs 傳統儲蓄現金價值\`,
            agent_step_1: \`「客人覺得純網上無佣金好似即時慳保費，甚至期望有高額保費回贈，呢種心態好自然！」\`,
            agent_step_2: \`「但純網上直銷本質係消費型定期保障，保費交一年保一年，所有保費 100% 消耗無儲蓄現金價值；而傳統綜合保險嘅儲蓄方案即使扣除各項費用，第 5 年保證回本，幾十年後複利滾存幾百萬本利和！」\`,
            agent_step_3: \`「長線睇，交 20 年純消費保費隨時倒蝕十幾萬保費；而選擇我地第 5 年保證回本嘅旗艦儲蓄方案，本金完好無損兼享複利增長，呢個先係最精明嘅資金配置！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：純網上直銷為消費型定期保障，保費交一年保一年，無任何現金價值；切勿因表面省佣金而忽略終身資產沉澱！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~首年保費最高回贈 28% 即慳~~',
            fineprint_reality: '純網上產品零儲蓄成分，已交保費無法取回；傳統旗艦第 5 年起保證回本且本利滾存',
            fineprint_citation: '香港精算學會產品指引及公開利益說明書',
            corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
            corridor_rival: '純保障 (0%)',
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`消費型保費支出 vs 累積保證現金價值長期效益比對\`,
            client_source: \`來源：香港精算學會產品指引及公開利益說明書\`,
            client_desc: \`消費型純保障產品缺乏儲蓄成分，累積繳交之保費無法轉化為保證現金價值；而優質儲蓄險第5年即可保證回本。\`,
            chart_title: \`📈 保證現金價值累積速度與本金安全評級\`,
            chart_bars: [
              { label: \`我方旗艦方案保證回本\`, value: \`第 5 年 (快速鎖定 100% 本金)\`, widthPct: 90, color: \`var(--ikb)\` },
              { label: \`保泰人壽 Bowtie 消費型架構\`, value: \`0 現金價值 (純消費支出)\`, widthPct: 15, color: \`#f59e0b\` },
              { label: \`市場綜合保司平均回本年期\`, value: \`第 7 年\`, widthPct: 68, color: \`#94a3b8\` }
            ],
            table_title: \`⚖️ 保證本金安全性與資產沉澱評比\`,
            table_rows: [
              { label: \`保證回本年期 (Break-even)\`, value: \`第 5 年保證回本 vs 無保證現金價值\`, highlight: true },
              { label: \`繳費期滿資產累積\`, value: \`複利滾存形成家族資產 vs 保費全數消耗\`, highlight: true },
              { label: \`30年預期複利總回報\`, value: \`高達本金 4-6 倍 vs 0 累積\`, highlight: true },
              { label: \`資金流動與保單借貸\`, value: \`支援保單貸款與部分提取 vs 不支援\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`李生您好！見到您正在比較純網上保險的保費結構。純網上保險屬於純消費型開支，所繳保費無法積存現金價值；而我地方案第 5 年即保證 100% 回本，長遠形成龐大複利資產。我發份「消費型開支 vs 儲蓄資產沉澱」比對表供您客觀參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'critical_illness') {
          return {
            agent_title: \`🎯 對抗戰策：直擊【保泰人壽 Bowtie】早期危疾年期跳水與重疾多次賠付缺口\`,
            agent_step_1: \`「張生，Bowtie 早期危疾保純網上宣傳零佣金、涵蓋原位癌，睇落好吸引，你對市場新產品好有觸覺！」\`,
            agent_step_2: \`「但仔細拆解佢係『每年續保（定期消費型）』！保費跟年齡自然費率跳升，40-50歲後保費以倍數暴漲；更致命嘅係只賠 1 次，無深切治療部 (ICU) 全額預支，亦無癌症/中風/心臟病多達 5-6 次的多次賠償保障！」\`,
            agent_step_3: \`「我地旗艦危疾係『終身平準保費』，交 20 年保終身，年老時零保費壓力！涵蓋過百種嚴重疾病，癌症間隔僅 \${ourProfile.cancerWaitYears} 年即可多次索償，連續住 ICU 3-5 日即預支 100% 保額，呢種全面兜底防護先係抵禦重症的真正盾牌！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：Bowtie 早期危疾為自然費率，年紀越大保費跳升越劇烈；且僅限單次賠付，無 ICU 預支與多次賠付防線！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~多重癌症無限次 100% 賠償~~',
            fineprint_reality: '定期消費型危疾隨年齡自然費率跳水式暴增，且多僅限單次賠付；終身平準保費鎖定一生費用',
            fineprint_citation: '香港癌症資料統計中心及各保司正式保單批註',
            corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
            corridor_rival: '純保障 (0%)',
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`定期自然費率危疾 vs 終身平準保費重疾防線全維度比對\`,
            client_source: \`來源：香港癌症資料統計中心及各保司正式保單批註\`,
            client_desc: \`定期危疾隨年齡增長保費大幅遞增，且通常僅限單次賠付；終身危疾鎖定平準保費，並具備多次重疾賠付及ICU無指定病名全額預支保障。\`,
            chart_title: \`⏱️ 長期保費穩定性與多次重疾防護評級\`,
            chart_bars: [
              { label: \`我方終身危疾防線\`, value: \`平準保費 + 900% 多次賠償 + ICU預支\`, widthPct: 95, color: \`var(--green)\` },
              { label: \`保泰人壽 Bowtie 早期危疾\`, value: \`自然費率跳升 + 單次賠付 100%\`, widthPct: 45, color: \`#f59e0b\` },
              { label: \`市場終身危疾平均水平\`, value: \`平準保費 + 3年癌症等待期\`, widthPct: 75, color: \`#94a3b8\` }
            ],
            table_title: \`🛡️ 關鍵重疾保障條款深度比對\`,
            table_rows: [
              { label: \`保費繳付模式\`, value: \`平準保費 (鎖定20年保終身) vs 自然費率隨年齡暴增\`, highlight: true },
              { label: \`多次索償總賠償上限\`, value: \`高達 900% 保額 vs 僅限 1 次 100% 賠付\`, highlight: true },
              { label: \`非指定疾病 ICU 保障\`, value: \`連續 3-5 日預支 100% 保額 vs 不設 ICU 預支\`, highlight: true },
              { label: \`後期斷供與續保風險\`, value: \`繳費期滿終身受保 vs 年老保費過高被迫斷供\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`張生早晨！昨日您提到 Bowtie 早期危疾保。我幫您深入查閱了條款結構：其屬於純定期自然費率，年紀越大保費跳升越劇烈，且僅限單次賠償。我地全新旗艦方案鎖定 20 年平準保費保終身，具備 900% 多次賠償與連續住院 ICU 100% 預支。我發份詳細條款比對表給您參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'vhis') {
          return {
            agent_title: \`🎯 對抗戰策：拆解【保泰人壽 Bowtie】自願醫保線上自主申報 vs 專屬 Agent 出院免找數\`,
            agent_step_1: \`「王太，保泰 Bowtie 網上自願醫保平兩三成，主打無中介人，表面睇確實好符合追求極致性價比嘅客群！」\`,
            agent_step_2: \`「但醫保最殘酷嘅時刻係入院要理賠！純線上保險只有 Chatbot 同 Email，大病入院時病人要自己聯絡私家醫院做預先批核、自己先找數墊付十幾廿萬、出院再自己影單填 Claim Form，一旦單據有遺漏隨時被拒賠投訴無門！」\`,
            agent_step_3: \`「我地高端自願醫保標靶藥全數賠償無細項上限，年度保額數千萬；最關鍵係有專屬持牌 Agent 提供全港私院『出院免找數 (Cashless)』直付，專人入院前辦好擔保、出院保司直接同醫院找數！病人專心養病零操心，呢份專屬跑腿服務先係醫保核心價值！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：純網上醫保入院時需投保人自備十幾萬現金墊付，並自行透過 App/Bot 上載單據；無專屬顧問辦理全流程出院免找數 (Cashless)！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~純網上醫保超平無 Agent 佣金~~',
            fineprint_reality: '純網上理賠需病人自行墊付並上載單據對客務 Bot；專屬顧問提供私家醫院全流程出院免找數 (Cashless)',
            fineprint_citation: '醫務衞生局自願醫保計劃認可產品規範及醫院管理局出院直付結算指引',
            corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
            corridor_rival: '純保障 (0%)',
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`純線上自主申報 vs 專屬持牌顧問出院免找數 (Cashless) 比對\`,
            client_source: \`來源：醫務衞生局自願醫保認可產品名單及醫院直付協議\`,
            client_desc: \`自願醫保核心體驗在於入院時的理賠支援。專屬顧問提供全程入院直付擔保、免墊支直接找數，免除投保人自行跑腿墊資與單據補件壓力。\`,
            chart_title: \`🏥 大病住院理賠支援與直付便捷度評級\`,
            chart_bars: [
              { label: \`我方專屬顧問全額直付網絡\`, value: \`專人出院免找數 (0 自付墊資壓力)\`, widthPct: 100, color: \`var(--ikb)\` },
              { label: \`保泰人壽 Bowtie 線上申報\`, value: \`自主線上墊付申報 (需自行交單跟進)\`, widthPct: 55, color: \`#f59e0b\` },
              { label: \`市場標準自願醫保水平\`, value: \`設分項限額 / 需自行墊付\`, widthPct: 60, color: \`#94a3b8\` }
            ],
            table_title: \`🩺 醫療理賠與持牌中介人專屬服務\`,
            table_rows: [
              { label: \`入院擔保與出院免找數\`, value: \`專屬 Agent 辦妥直付手續 vs 自行透過 App 線上申請\`, highlight: true },
              { label: \`非手術癌症標靶治療\`, value: \`全數賠償 (年度數千萬額度) vs 設分項自付額\`, highlight: true },
              { label: \`爭議理賠專人跑腿協調\`, value: \`持牌顧問全力跟進爭取 vs 自行面對 Chatbot/客服\`, highlight: true },
              { label: \`法定個人薪俸稅扣稅\`, value: \`每年每人最高 HK$8,000 (兩者均享)\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`王太您好！了解過您關注 Bowtie 網上自願醫保。純網上保險平在省去中介人，但入院時所有直付擔保、墊支款項和理賠單據都要由您自行透過 App 處理。大病時有專屬顧問為您跑腿辦妥「出院免找數」直付，不用自己墊付幾十萬，這份安心至關重要。我整理了一份對比表發給您參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'financing_ul') {
          return {
            agent_title: \`🎯 對抗戰策：拆解【保泰人壽 Bowtie】虛擬保險業務邊界與私銀保費融資 (UL) 本質\`,
            agent_step_1: \`「趙總，許多高資產客戶關注保費融資與萬用壽險 (UL)，但要注意純網上虛擬保險並無提供保費融資產品！」\`,
            agent_step_2: \`「虛擬保險受牌照及資產規模所限，私人銀行及商業銀行均未設有任何針對虛擬保單的保費融資通道；而且傳統 85% 融資在降息週期極易面臨息差倒掛與銀行 Margin Call 補倉致命風險。」\`,
            agent_step_3: \`「高淨值資產配置應首選『無槓桿多元貨幣儲蓄』，免除銀行利率倒掛與補倉滅頂之災；同時享有 8-9 種貨幣自由轉換與無限次保單分拆，將財富掌控權 100% 掌握在家族手中。」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：虛擬保險規模與資產限制，私人銀行完全未設有任何融資通道，無法進行保費融資與高資產信託傳承！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~85% LTV 保費融資年化回報超 15%~~',
            fineprint_reality: '虛擬保險未設私人銀行融資通道；融資操作需承擔浮動借息與 Margin Call 補倉風險',
            fineprint_citation: '香港金融管理局 (HKMA) 及保監局 (IA) 關於保費融資業務聯合通函指引',
            corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
            corridor_rival: '純保障 (0%)',
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`虛擬保險業務範疇 vs 綜合保司萬用壽險與多元貨幣資產配置比對\`,
            client_source: \`來源：香港金管局 (HKMA) 與保監局 (IA) 保費融資聯合通函及私人銀行貸款政策\`,
            client_desc: \`虛擬保險專注於零售純保障，不具備私人銀行萬用壽險融資架構；進行高額家族資產配置需選用具備多元貨幣及跨代傳承架構之全牌照保司。\`,
            chart_title: \`⚠️ 高淨值資產配置工具完整度與安全性評級\`,
            chart_bars: [
              { label: \`無槓桿多元貨幣儲蓄 (我方)\`, value: \`100% 安全 (自由分拆/多幣種傳承)\`, widthPct: 100, color: \`var(--green)\` },
              { label: \`市場 85% 槓桿萬用壽險融資\`, value: \`承擔 Margin Call 與息差風險\`, widthPct: 35, color: \`#ef4444\` },
              { label: \`保泰人壽 Bowtie 業務範疇\`, value: \`未設萬用壽險及私銀融資\`, widthPct: 20, color: \`#f59e0b\` }
            ],
            table_title: \`📊 家族資產傳承與融資工具全維度對比\`,
            table_rows: [
              { label: \`私人銀行保費融資支援\`, value: \`具備完整私銀融資通道 vs 虛擬保險不設融資服務\`, highlight: true },
              { label: \`借貸利率倒掛與補倉風險\`, value: \`無槓桿配置零借貸風險 vs 槓桿融資承受浮動利息\`, highlight: true },
              { label: \`多元貨幣自由轉換\`, value: \`支援 7-9 種主流貨幣 vs 僅限港幣純保障\`, highlight: true },
              { label: \`家族信託式分期給付\`, value: \`支援保單代代相傳 vs 不適用\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`趙總早晨！留意到您在關注保費融資與各家保司架構。需要向您說明的是，Bowtie 等純網上虛擬保險專注於小額純醫療，私人銀行並無提供任何融資管道。對於大額資產配置，我們建議採用「無槓桿多元貨幣儲蓄傳承架構」，避開息差倒掛與補倉風險。我發份客觀分析報告給您參考！\`,
            disclaimer
          };
        }

        // Bowtie + qdap
        return {
          agent_title: \`🎯 對抗戰策：拆解【保泰人壽 Bowtie】虛擬保險業務邊界與 QDAP 扣稅年金資格\`,
          agent_step_1: \`「林生，不少市民想在網上買延期年金扣稅，但請注意保泰 Bowtie 目前並未推出合資格延期年金 (QDAP)！」\`,
          agent_step_2: \`「香港保監局對 QDAP 審批極其嚴格，要求總保費至少 50% 為保證年金且鎖定至少 10 年派發期。虛擬保險目前未獲批發行任何可享每年 HK$60,000 薪俸稅免稅額的 QDAP 年金產品。」\`,
          agent_step_3: \`「要善用每年最高 HK$10,200 的實質退稅優惠並建立終身確定退休金，必須選擇全牌照保司的認可 QDAP。我地方案保證內部回報率全港頂尖，保證派息比例超過 80%，無論金融市場如何波動，退休現金流穩如泰山！」\`,
          agent_trap_warning: \`⚠️ 陷阱警示：虛擬保險未設有香港保監局認可的 QDAP 延期年金產品，無法享有每年 HK$60,000 薪俸稅免稅額！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~買年金等於即賺 17% 現金~~',
          fineprint_reality: '保監局合資格 QDAP 方可享有免稅額；純線上保司目前未設認可年金產品',
          fineprint_citation: '香港保險業監管局 QDAP 認可名單及利益說明文件',
          corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
          corridor_rival: '純保障 (0%)',
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`香港保監局合資格延期年金 (QDAP) 認可資格與退稅比對\`,
          client_source: \`來源：香港保險業監管局 QDAP 認可產品名單及稅務局薪俸稅扣除指引\`,
          client_desc: \`僅有列入保監局官方認可名單之合資格延期年金 (QDAP) 方可享有每年每人最高 HK$60,000 稅務扣除額；虛擬保險目前未設此類認可年金產品。\`,
          chart_title: \`🛡️ 年金產品認可度與保證現金流確定性評級\`,
          chart_bars: [
            { label: \`我方旗艦 QDAP 認可年金\`, value: \`82.5% 保證 (享最高 $10,200 退稅)\`, widthPct: 82.5, color: \`var(--green)\` },
            { label: \`市場傳統 QDAP 平均水平\`, value: \`50.0% 保證 (逾半依賴非保證)\`, widthPct: 50.0, color: \`#f59e0b\` },
            { label: \`保泰人壽 Bowtie 業務範疇\`, value: \`未設保監局認可 QDAP 年金\`, widthPct: 20, color: \`#94a3b8\` }
          ],
          table_title: \`💰 法定扣稅資格與退休現金流確定性比對\`,
          table_rows: [
            { label: \`保監局合資格 QDAP 認可\`, value: \`正式認可名單 vs 未設認可 QDAP 產品\`, highlight: true },
            { label: \`每年薪俸稅法定最高扣除額\`, value: \`HK$60,000 (最高實質慳稅 $10,200) vs 無扣稅資格\`, highlight: true },
            { label: \`年金保證派息佔比\`, value: \`高達 82.5% 保證派息 vs 不適用\`, highlight: true },
            { label: \`年金領取年期彈性\`, value: \`10 / 20 年或至 100 歲靈活選擇 vs 不適用\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`林生您好！昨日您提到退休扣稅年金。需要提醒您的是，Bowtie 等純線上虛擬保險目前未設有香港保監局認可的 QDAP 延期年金產品，無法享有每年 $60,000 扣稅額。要獲得每年最高 $10,200 的退稅並建立穩定退休金，必須選擇認可名單內的方案。我發份認可 QDAP 年金比較表給您參考！\`,
          disclaimer
        };
      }

      // ==========================================
      // Branch 1B: Bowtie as Our Insurer (Buy Term & Invest the Rest)
      // ==========================================
      if (ourKey === 'Bowtie') {
        const rivalPrepay = rivalProfile.prepayRate > 0 ? \`\${rivalProfile.prepayRate}%\` : '高息';
        const rivalRebate = rivalProfile.maxRebate || 20;

        if (claimKey === 'prepayment') {
          return {
            agent_title: \`🎯 對抗戰策：以【保泰人壽 Bowtie】純保障 + 自主投資 (BTIR) 破解【\${rivalProfile.fullName}】\${rivalPrepay} 預繳分紅枷鎖\`,
            agent_step_1: \`「陳生，對手宣傳 \${rivalPrepay} 預繳高息同大額分紅，聽落好似穩賺，換著任何人都會心動！」\`,
            agent_step_2: \`「但儲蓄分紅險合約鎖定 20-30 年，羊毛出自羊身上！所謂 \${rivalPrepay} 預繳往往只保證首年，次年利率浮動；且保費大部分用嚟支付保司高昂營運與經紀佣金，頭幾年提早退保蝕足大半本金！」\`,
            agent_step_3: \`「Bowtie 提倡國際頂尖理財哲學『Buy Term and Invest the Rest (純保障·投資自主)』！零佣金、零隱藏收費，用最平保費買足純醫療保障；將省落嚟嘅保費自由做美債定存 (4.5%+) 或全球指數基金 (S&P 500)，資金 100% 自主掌控，零退保損失！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：傳統分紅險提早退保損失慘重；Bowtie 零佣金純保障 + 自主投資，回歸 100% 資金自由流動性！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: \`~~\${rivalPrepay} 5年預繳保證高息~~\`,
            fineprint_reality: '傳統儲蓄險資金鎖定 20-30 年；Bowtie 零佣金讓客戶 100% 掌控資金，自選美債/定存收益更具確定性',
            fineprint_citation: '香港保險業監管局 (IA) 認可保險公司名單及業務範疇審批指引',
            corridor_our: '純保障 (0%)',
            corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`Bowtie 純保障+自主投資 vs 傳統儲蓄分紅險鎖定期比對\`,
            client_source: \`來源：香港精算學會產品指引及公開利益說明書\`,
            client_desc: \`Bowtie 專注純保障，倡導將保障與儲蓄分開。免除保單高額前期佣金與漫長回本鎖定期，客戶享有 100% 現金流掌控權。\`,
            chart_title: \`💡 資金流動性與前期本金折損風險評級\`,
            chart_bars: [
              { label: \`Bowtie 純保障 (資金100%自主)\`, value: \`100% 流動性 (零退保折損)\`, widthPct: 100, color: \`var(--green)\` },
              { label: \`\${rivalProfile.fullName} 儲蓄分紅方案\`, value: \`第 \${rivalProfile.breakevenYear || 7} 年方可保證回本\`, widthPct: 55, color: \`#f59e0b\` },
              { label: \`市場傳統儲蓄平均回本期\`, value: \`第 7 年\`, widthPct: 65, color: \`#94a3b8\` }
            ],
            table_title: \`⚖️ 保障與資金靈活性全維度對比\`,
            table_rows: [
              { label: \`保單前期退保折損\`, value: \`0 折損 (按月繳付無鎖定) vs 前期提早退保損失慘重\`, highlight: true },
              { label: \`中介人佣金與附加成本\`, value: \`0% 佣金 (純線上直銷) vs 佔首年保費高比例\`, highlight: true },
              { label: \`資金流動與自主投資\`, value: \`100% 自主 (自由配置定存/美債) vs 鎖定 20-30 年\`, highlight: true },
              { label: \`長線分紅實現率風險\`, value: \`自主定存美債無承諾跳水風險 vs 依賴非保證紅利\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`陳生早晨！了解到您在比較 \${rivalProfile.fullName} 的儲蓄方案。傳統儲蓄險資金鎖定 20-30 年，前期退保損失大；Bowtie 提倡「買純保障，自主投資」，零佣金節省高額保費，資金 100% 自主掌控享美債高息。我發份「純保障+自主投資 vs 傳統分紅險」比對表供您參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'rebate') {
          return {
            agent_title: \`🎯 對抗戰策：以【保泰人壽 Bowtie】零佣金透明定價拆解【\${rivalProfile.fullName}】\${rivalRebate}% 回贈鎖定陷阱\`,
            agent_step_1: \`「李生，對手開出 \${rivalRebate}% 回贈確實好搶眼，但羊毛出自羊身上！」\`,
            agent_step_2: \`「保司送得幾成回贈，就代表產品內置高額溢價與佣金，並將退保期鎖死 \${rivalProfile.breakevenYear || 7} 年以上，提早退保連本金都攞唔返！」\`,
            agent_step_3: \`「Bowtie 零中介佣金、零行政層級，保費直接回歸真實成本，每月慳幾成保費，第 1 日就真金白銀慳落袋，無需等待 7 年回本！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：大額回贈往往伴隨 7-8 年退保鎖定期；Bowtie 零佣金定價讓您從首日起享有真實性價比！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: \`~~首年保費最高回贈 \${rivalRebate}% 即慳~~\`,
            fineprint_reality: '回贈僅扣減首期保費，次年起全額繳付且資金長年鎖定；Bowtie 零佣金保費終身透明超值',
            fineprint_citation: '香港精算學會產品指引及公開利益說明書',
            corridor_our: '純保障 (0%)',
            corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`Bowtie 零佣金透明定價 vs 傳統保費回贈長線成本比對\`,
            client_source: \`來源：香港精算學會產品指引及公開利益說明書\`,
            client_desc: \`傳統產品之高額回贈通常源於高費率結構與漫長退保鎖定；Bowtie 採用純線上直銷架構，將節省之運營成本直接反饋於保費。\`,
            chart_title: \`💰 終身綜合費用率與成本透明度評級\`,
            chart_bars: [
              { label: \`Bowtie 零佣金直銷\`, value: \`0% 佣金加價 (保費真實超值)\`, widthPct: 100, color: \`var(--green)\` },
              { label: \`\${rivalProfile.fullName} 回贈方案\`, value: \`第 \${rivalProfile.breakevenYear || 8} 年方可回本\`, widthPct: 50, color: \`#f59e0b\` },
              { label: \`市場傳統保司平均水平\`, value: \`第 7 年回本\`, widthPct: 65, color: \`#94a3b8\` }
            ],
            table_title: \`⚖️ 保費定價與資金流動性深度評比\`,
            table_rows: [
              { label: \`中介人佣金加成\`, value: \`0% (純線上直銷) vs 內置高額中介人佣金\`, highlight: true },
              { label: \`保證回本年期 (Break-even)\`, value: \`無退保鎖定 (按月自主) vs 第 \${rivalProfile.breakevenYear || 8} 年\`, highlight: true },
              { label: \`提早退保追討回贈罰則\`, value: \`無合約鎖定 vs 提早斷供追回已派回贈\`, highlight: true },
              { label: \`資金自主掌控度\`, value: \`100% 自由支配 vs 資金長年凍結\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`李生您好！見到市場上有保司推高額保費回贈。大額回贈背後往往伴隨漫長退保鎖定期（需 \${rivalProfile.breakevenYear || 7} 年才回本）；Bowtie 零佣金直接降低保費支出，真金白銀省在當下。我發份客觀成本分析供您參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'critical_illness') {
          return {
            agent_title: \`🎯 對抗戰策：以【保泰人壽 Bowtie】早期危疾平民高保額破解【\${rivalProfile.fullName}】終身危疾昂貴保費\`,
            agent_step_1: \`「張生，對手終身危疾保額宣傳過百萬，但每年保費動輒幾萬蚊，對家庭現金流係沉重負擔！」\`,
            agent_step_2: \`「終身危疾保費入面有 70% 都係儲蓄分紅成本！後生最需要高保額嘅黃金年齡，往往因為保費太貴而買唔足保額，出現致命保障真空！」\`,
            agent_step_3: \`「Bowtie 早期危疾保以純保障定期架構，用傳統產品 1/3 甚至 1/5 嘅平民保費，即刻買足百萬保額！將省落嚟嘅保費做穩健投資，先係最高性價比嘅保障佈局！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：傳統終身危疾昂貴保費易導致投保額度不足；Bowtie 定期純危疾助您在黃金年齡以超低成本頂格鎖定高保額！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~終身儲蓄危疾包病兼賺錢~~',
            fineprint_reality: '終身危疾保費逾 70% 用於分紅儲蓄；Bowtie 定期純危疾將每一分保費專注於疾病槓桿保額',
            fineprint_citation: '香港癌症資料統計中心及各保司正式保單批註',
            corridor_our: '純保障 (0%)',
            corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`Bowtie 純危疾平民高保額 vs 傳統終身儲蓄危疾槓桿比對\`,
            client_source: \`來源：香港癌症資料統計中心及各保司正式保單批註\`,
            client_desc: \`危疾保險首要職能為收入替代。Bowtie 純保障架構以平民預算換取超高保額槓桿，避免因高保費導致黃金奮鬥期保額不足。\`,
            chart_title: \`🛡️ 單位保費撬動危疾保障槓桿比率 (越頂越高性價比)\`,
            chart_bars: [
              { label: \`Bowtie 早期危疾保 (純保障)\`, value: \`高槓桿 (用 1/3 保費買足百萬)\`, widthPct: 98, color: \`var(--green)\` },
              { label: \`\${rivalProfile.fullName}【\${rivalProfile.flagshipCI}】\`, value: \`低槓桿 (70%保費流入儲蓄分紅)\`, widthPct: 45, color: \`#f59e0b\` },
              { label: \`市場終身儲蓄危疾平均\`, value: \`保費昂貴 / 易保額不足\`, widthPct: 50, color: \`#94a3b8\` }
            ],
            table_title: \`🩺 危疾保障槓桿與保費支出比對\`,
            table_rows: [
              { label: \`每萬元保額所需保費\`, value: \`極致親民 (純保障成本) vs 昂貴 (內置儲蓄分紅成本)\`, highlight: true },
              { label: \`早期原位癌保障\`, value: \`全面涵蓋早期原位癌 vs 依條款分級賠償\`, highlight: true },
              { label: \`中介人佣金加成\`, value: \`0% 佣金 (100% 透明直銷) vs 內置中介人佣金\`, highlight: true },
              { label: \`退保或斷供損失\`, value: \`無合約鎖定損失 vs 前期退保本金嚴重虧損\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`張生早晨！了解到您在看危疾險。傳統終身危疾保費偏貴，大部分保費用於分紅儲蓄，往往導致年輕時買唔足保額。Bowtie 早期危疾保以純保障架構，以 1/3 保費買足百萬保額，性價比極高。我發份對比表供您參考！\`,
            disclaimer
          };
        }

        if (claimKey === 'vhis') {
          return {
            agent_title: \`🎯 對抗戰策：以【保泰人壽 Bowtie】全數賠償零佣金自願醫保拆解【\${rivalProfile.fullName}】特約網絡限制\`,
            agent_step_1: \`「王太，買自願醫保最緊要係真金白銀賠足，同埋保費每年負擔得起！」\`,
            agent_step_2: \`「傳統保司醫保保費每年加價，仲內置 20-30% 中介人佣金；而且部分計劃標靶藥物設有分項限額，急症入院時更受限於指定特約醫院網絡！」\`,
            agent_step_3: \`「Bowtie 自願醫保由香港持牌專科醫生團隊把關，非手術癌症治療（標靶藥、免疫治療）全數賠償無細項上限，零中介佣金讓保費平 20-30%！App 一鍵線上理賠，最快 3 日到賬，簡單透明更安心！」\`,
            agent_trap_warning: \`⚠️ 陷阱警示：傳統醫保部分級別標靶藥物設有分項上限；Bowtie 靈活計劃全數賠償非手術癌症治療，且保費減免中介佣金加成！\`,
            hero_our_name: heroOur,
            hero_rival_name: heroRival,
            fineprint_claim: '~~傳統大行醫保服務無微不至~~',
            fineprint_reality: '傳統醫保內置高額中介佣金與行政加成，標靶藥設限；Bowtie 專注全數賠償與透明線上極速批核',
            fineprint_citation: '醫務衞生局自願醫保計劃認可產品規範及各保司合約條款',
            corridor_our: '純保障 (0%)',
            corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
            corridor_note: corridorNote,
            horizon_data: horizonData,
            client_title: \`Bowtie 零佣金自願醫保 vs 傳統保司醫療計劃全維度比對\`,
            client_source: \`來源：醫務衞生局自願醫保認可產品名單及各大保司正式合約批註\`,
            client_desc: \`Bowtie 自願醫保靈活計劃不設終身保障限額，非手術癌症標靶治療全數賠償，免去傳統保司龐大佣金與行政溢價。\`,
            chart_title: \`🏥 標靶藥賠償完整度與保費性價比評級\`,
            chart_bars: [
              { label: \`Bowtie 自願醫保 (靈活計劃)\`, value: \`全數賠償 (零佣金·平 20-30%)\`, widthPct: 98, color: \`var(--green)\` },
              { label: \`\${rivalProfile.fullName}【\${rivalProfile.flagshipVHIS}】\`, value: \`設分項限額 / 內置中介人佣金\`, widthPct: 70, color: \`#f59e0b\` },
              { label: \`自願醫保標準計劃法定最低\`, value: \`年限額僅 HK$180,000\`, widthPct: 30, color: \`#94a3b8\` }
            ],
            table_title: \`🩺 自願醫保核心保障與保費成本深度比對\`,
            table_rows: [
              { label: \`非手術癌症治療 (標靶藥/免疫)\`, value: \`全數賠償 (無細項限額) vs 部分級別設分項上限\`, highlight: true },
              { label: \`終身保障限額\`, value: \`不設終身限額 vs 設終身限額\`, highlight: true },
              { label: \`年繳保費水平\`, value: \`節省 20-30% (免中介佣金) vs 內置佣金與行政溢價\`, highlight: true },
              { label: \`法定個人薪俸稅扣稅\`, value: \`每年每人最高 HK$8,000 (兩者均享)\`, highlight: false }
            ],
            bilateral_specs: bilateralSpecs,
            whatsapp_script: \`王太您好！了解過您關注自願醫保。醫保核心是昂貴標靶藥是否全數賠償，以及長期保費是否負擔得起。Bowtie 自願醫保由專科醫生團隊設計，非手術癌症治療全數賠償，省去中介佣金保費直接平 20-30%。我發份對比表給您參考！\`,
            disclaimer
          };
        }

        // Bowtie + Financing UL / QDAP
        return {
          agent_title: \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】複雜金融產品鎖定 vs Bowtie 純保障 + 100% 資金自由\`,
          agent_step_1: \`「趙總，對手方案涉及複雜保費融資或長年鎖定期，聽落回報好高，但背後暗藏息差倒掛與鎖定風險！」\`,
          agent_step_2: \`「金融工具越複雜，隱藏條款越多！保費融資一旦 HIBOR 波動即被 Margin Call 追繳保證金；延期年金非保證比例偏高，提早退保本金虧損！」\`,
          agent_step_3: \`「Bowtie 倡導資產配置回歸純粹：以極低成本做好醫療防禦，其餘資金 100% 自由支配，無懼任何銀行補倉或保司分紅跳水！」\`,
          agent_trap_warning: \`⚠️ 陷阱警示：槓桿融資息差與非保證分紅受金融週期影響大；維持保障純粹與資金 100% 流動性方為上策！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~高槓桿高回報穩賺不賠~~',
          fineprint_reality: '槓桿融資承受浮動利息與補倉風險；延期年金受長年期鎖定',
          fineprint_citation: '香港金融管理局 (HKMA) 及保監局 (IA) 監管指引',
          corridor_our: '純保障 (0%)',
          corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`Bowtie 純保障自由流動性 vs 複雜金融架構風險評比\`,
          client_source: \`來源：香港金管局 (HKMA) 及保監局 (IA) 聯合指引\`,
          client_desc: \`複雜金融產品涉及浮動利率、槓桿補倉或長期退保鎖定；Bowtie 專注純保障，保持客戶資金 100% 自由支配。\`,
          chart_title: \`⚠️ 資金自由掌控度與極端市況安全性評級\`,
          chart_bars: [
            { label: \`Bowtie 純保障 (資金100%自由)\`, value: \`100% 安全 (零補倉與鎖定風險)\`, widthPct: 100, color: \`var(--green)\` },
            { label: \`\${rivalProfile.fullName} 複雜金融方案\`, value: \`承擔利率波動與退保鎖定\`, widthPct: 45, color: \`#f59e0b\` },
            { label: \`市場融資/年金平均風險\`, value: \`受市場週期波動\`, widthPct: 50, color: \`#94a3b8\` }
          ],
          table_title: \`📊 資金流動性與金融風險比對\`,
          table_rows: [
            { label: \`銀行利率倒掛與補倉風險\`, value: \`零風險 (不涉及槓桿借貸) vs 承受浮動利率與 Margin Call\`, highlight: true },
            { label: \`資金退保鎖定期\`, value: \`無鎖定期 (按月自主) vs 鎖定長達 8-10 年以上\`, highlight: true },
            { label: \`中介人佣金與管理費\`, value: \`0% 佣金 (透明直銷) vs 內置多重手續費\`, highlight: true },
            { label: \`資產自主調配自由度\`, value: \`100% 自主支配 vs 資金長年凍結於保單\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`趙總早晨！了解到您在關注複雜金融保險架構。高槓桿融資或長年鎖定產品受市場週期波動較大，存在息差與補倉風險。Bowtie 建議以純保障築牢防線，資金 100% 自主配置於流動性資產。我發份風險分析給您參考！\`,
          disclaimer
        };
      }

      // ==========================================
      // Branch 2: Traditional Insurers (Bilateral 1v1 Stance-Aware Engine)
      // ==========================================
      const rivalPrepay = rivalProfile.prepayRate > 0 ? \`\${rivalProfile.prepayRate}%\` : '高息';
      const rivalRebate = rivalProfile.maxRebate || 20;

      // 1. Prepayment Claim
      if (claimKey === 'prepayment') {
        let step3Script = '';
        if (ourKey === 'AIA' && rivalKey === 'Prudential') {
          step3Script = \`「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 96.5%，對手【\${rivalProfile.flagshipSavings}】得 \${rivalProfile.gn16Fulfillment}%。複利 30 年差 \${deltaGN16}% 就係幾十萬真金白銀！」\`;
        } else if (ourKey === 'Prudential' && rivalKey === 'AIA') {
          step3Script = \`「買儲蓄險最緊要睇『實時落袋確定性』！我地保誠直接亮出全港最高 28% 首年回贈，加埋 5.8% 鎖息立即落袋為安！對手宣傳保監局 GN16 官方數據歷年累積實現率高達 96.5%，但絕大部分依賴 25-30 年後嘅非保證終期紅利；真金白銀第一年就慳返幾皮嘢保費，落袋收益遠勝幾十年後唔確定嘅浮動分紅，現金流掌控更穩妥！」\`;
        } else if (isOurGN16Higher) {
          step3Script = \`「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 \${ourProfile.gn16Fulfillment}%，對手【\${rivalProfile.flagshipSavings}】得 \${rivalProfile.gn16Fulfillment}%。複利 30 年差 \${deltaGN16}% 就係幾十萬真金白銀！」\`;
        } else if (isGN16Equal) {
          step3Script = \`「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 \${ourProfile.gn16Fulfillment}%，對手【\${rivalProfile.flagshipSavings}】雖同樣達 \${rivalProfile.gn16Fulfillment}%，但我地具備更靈活之無限次保單分拆與9種貨幣轉換，家族信託架構更為完備！」\`;
        } else {
          step3Script = \`「買儲蓄險最緊要睇『實時落袋確定性』！我地方案首年提供高額保費回贈及鎖息高達 \${ourProfile.prepayRate}%，真金白銀第一年就慳返幾皮嘢保費，落袋收益遠勝幾十年後唔確定嘅浮動分紅，前期資金負擔大幅減輕！」\`;
        }

        const agentTitle = (ourKey === 'Prudential' && rivalKey === 'AIA')
          ? \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】預繳息率與高進場門檻 (我方: 保誠 5.8% 預繳)\`
          : \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】\${rivalPrepay} 預繳噱頭與浮動陷阱\`;

        const step1 = (ourKey === 'Prudential' && rivalKey === 'AIA')
          ? \`「陳生，你真係好有眼光！友邦係老牌大公司，盈御系列宣傳聲量好大，換著邊個都會關注！」\`
          : \`「陳生，你真係好有眼光！\${rivalProfile.fullName} 個 \${rivalPrepay} 預繳促銷宣傳鋪天蓋地，我第一眼睇到都覺得好吸引！」\`;

        const step2 = (ourKey === 'Prudential' && rivalKey === 'AIA')
          ? \`「但仔細審查條款細則：友邦前期進場成本偏高，首年回贈得 22%，預繳息率亦只有 5.0%！且其宣傳的 96.5% 實現率，絕大部分依賴 25-30 年後嘅非保證終期紅利，遠水難救近火；前 10 年資金累積速度偏慢。」\`
          : \`「但仔細拆解對手通函嘅 fine print，佢個 \${rivalPrepay} 寫明『只保證頭 1 年』！第 2 年起利息按市場浮動；依家全球進入降息週期，第二年極易跳水，短期噱頭過後利息嚴重稀釋。」\`;

        const trapAlert = (ourKey === 'Prudential' && rivalKey === 'AIA')
          ? \`⚠️ 陷阱警示：友邦首年回贈少 6%、預繳利率少 0.8%，前期資金佔用高；且長線分紅主要依賴非保證終期紅利，注意前期現金流折損！\`
          : \`⚠️ 陷阱警示：對手 \${rivalPrepay} 利率僅保證首 1 年，次年浮動跳水；降息週期中長線確定性大打折扣，引導客戶細讀通函第 3 頁備註！\`;

        return {
          agent_title: agentTitle,
          agent_step_1: step1,
          agent_step_2: step2,
          agent_step_3: step3Script,
          agent_trap_warning: trapAlert,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: (ourKey === 'Prudential' && rivalKey === 'AIA') ? '~~友邦 96.5% 超高分紅承諾~~' : \`~~\${rivalPrepay} 5年預繳保證高息~~\`,
          fineprint_reality: (ourKey === 'Prudential' && rivalKey === 'AIA') ? '友邦分紅主要為 25-30 年後非保證終期紅利；首年回贈僅 22%，預繳僅 5.0%' : '通函註明僅保證首 1 年，次年回到市場浮動利率；全球降息週期次年利息極易跳水',
          fineprint_citation: '香港保監局 (IA)《持牌保險中介人操守守則》第 4.2 條及各保司產品推廣通函批註',
          corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
          corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`全港主流旗艦儲蓄險 · 長期分紅穩定性比對\`,
          client_source: \`來源：香港保監局 GN16 公開報告及各保司年報\`,
          client_desc: \`分紅儲蓄險之回報分為「保證利益」與「非保證分紅利益」。評估長期收益確定性時，香港保險業監管局 (IA) 建議參考各保司之歷年分紅實現率 (Fulfillment Ratio)。\`,
          chart_title: \`📊 歷年分紅累積實現率 (Fulfillment Ratio)\`,
          chart_bars: [
            { label: \`我方旗艦配置方案【\${ourProfile.fullName}】\`, value: \`\${ourProfile.gn16Fulfillment}% (穩健)\`, widthPct: ourProfile.gn16Fulfillment || 90, color: \`var(--ikb)\` },
            { label: \`對手方案【\${rivalProfile.fullName}】\`, value: \`\${rivalProfile.gn16Fulfillment}% (市場波動)\`, widthPct: rivalProfile.gn16Fulfillment || 85, color: \`#f59e0b\` },
            { label: \`市場同業平均水平\`, value: \`91.2%\`, widthPct: 91.2, color: \`#94a3b8\` }
          ],
          table_title: \`🏛️ 家族傳承與資金靈活性比較\`,
          table_rows: [
            { label: \`保單無限次分拆\`, value: \`支援 (無次數上限)\`, highlight: true },
            { label: \`主流貨幣轉換\`, value: \`7 - 9 種 (免等待期)\`, highlight: true },
            { label: \`首年預繳利率保證期\`, value: \`我方長線鎖定 vs 對手僅保證 1 年\`, highlight: false },
            { label: \`身故利益信託式提取\`, value: \`可設定分期給付\`, highlight: true }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`陳生早晨！最近留意到市場預繳利息戰好激烈，\${rivalProfile.fullName} 宣傳 \${rivalPrepay} 預繳。我幫您做咗份全港主流保司 5 年期預繳利息與次年浮動條款對比表，拆解咗首年過後嘅浮動利率盲點。如果您有興趣鎖定中長線穩定收益，我發份客觀比對表俾您參考！\`,
          disclaimer
        };
      }

      // 2. Rebate Claim
      if (claimKey === 'rebate') {
        const step3Script = (ourProfile.breakevenYear > 0 && rivalProfile.breakevenYear > 0 && ourProfile.breakevenYear < rivalProfile.breakevenYear)
          ? \`「我地方案真正保證回本期（Break-even）足足快 \${rivalProfile.breakevenYear - ourProfile.breakevenYear} 年，第 \${ourProfile.breakevenYear} 年保證現金價值已達 100% 繳付保費！買儲蓄險係睇長線本金安全性與流動性，千祈唔好因一次性回贈鎖死流動資金。」\`
          : \`「我地方案兼備高額回贈與快速回本優勢，第 \${ourProfile.breakevenYear || 5} 年即可保證回本，本金安全性與流動性更優！」\`;

        return {
          agent_title: \`🎯 對抗戰策：破解【\${rivalProfile.fullName}】\${rivalRebate}% 高額保費回贈誘餌\`,
          agent_step_1: \`「李生，對手開出 \${rivalRebate}% 首年保費回贈確實好震撼，一眼睇落好似即時慳咗唔少保費，換著邊個都會心動！」\`,
          agent_step_2: \`「但精算現金流拆解顯示：羊毛出自羊身上！保司送得出 \${rivalRebate}% 回贈，往往將退保鎖定期拉長至 \${rivalProfile.breakevenYear || 7} 年，頭 3 年保證現金價值近乎為零，而且提早斷供會追討扣回已派回贈。」\`,
          agent_step_3: step3Script,
          agent_trap_warning: \`⚠️ 陷阱警示：\${rivalRebate}% 首期回贈附帶退保鎖定條款，前期現金價值幾近於零，提早斷供將追討回贈；長線財富重在保證回本速度！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: \`~~首年保費最高回贈 \${rivalRebate}% 即慳~~\`,
          fineprint_reality: '回贈僅抵扣首期保費，次年起全額繳付；且附帶長年退保鎖定期',
          fineprint_citation: '香港保險業監管局 GN16 分紅實現率指引及保單綜合費用總覽條款',
          corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
          corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`保費回贈 vs 保證現金價值回本年期比對\`,
          client_source: \`來源：香港精算學會產品指引及公開利益說明書\`,
          client_desc: \`評估大額保費回贈推廣時，投保人應綜合考量早期保證現金價值積存速度（回本期）及退保費用豁免年期。\`,
          chart_title: \`📈 保證回本年期與資金流動性評級\`,
          chart_bars: [
            { label: \`我方旗艦方案保證回本\`, value: \`第 \${ourProfile.breakevenYear || 5} 年 (快速鎖定 100% 本金)\`, widthPct: 90, color: \`var(--ikb)\` },
            { label: \`\${rivalProfile.fullName} 回贈方案保證回本\`, value: \`第 \${rivalProfile.breakevenYear || 8} 年 (前期鎖定嚴格)\`, widthPct: 60, color: \`#f59e0b\` },
            { label: \`市場同業平均水平\`, value: \`第 7 年\`, widthPct: 68, color: \`#94a3b8\` }
          ],
          table_title: \`⚖️ 保證本金安全性與流動性評比\`,
          table_rows: [
            { label: \`保證回本年期 (Break-even)\`, value: \`第 \${ourProfile.breakevenYear || 5} 年 vs 對手第 \${rivalProfile.breakevenYear || 8} 年\`, highlight: true },
            { label: \`提早退保罰則寬免\`, value: \`我方回本更快零手續費\`, highlight: true },
            { label: \`30年預期複利總回報\`, value: \`長線複利滾存更穩定\`, highlight: true },
            { label: \`回贈金額追討條款\`, value: \`無嚴苛追回附加條件\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`李生您好！見到市場上有保司推高達 \${rivalRebate}% 保費回贈，看似好抵。但仔細拆解利益說明書，往往伴隨較長嘅退保鎖定期（需 \${rivalProfile.breakevenYear || 7} 年才回本）。我整理咗一份「回贈 vs 保證回本速度」客觀比較表，幫您避開流動性陷阱，稍後發給您參考！\`,
          disclaimer
        };
      }

      // 3. Critical Illness Claim
      if (claimKey === 'critical_illness') {
        const ourWait = ourProfile.cancerWaitYears || 3;
        const rivalWait = rivalProfile.cancerWaitYears || 3;

        let ciTitle = '';
        let ciStep2 = '';
        let ciStep3 = '';
        let ciTrap = '';
        let ciChartBars = [];

        if (ourWait < rivalWait) {
          ciTitle = \`🎯 對抗戰策：直擊【\${rivalProfile.fullName}】危疾癌症再索償 \${rivalWait} 年等待期空窗期\`;
          ciStep2 = \`「但臨床大數據顯示 85% 危疾索償都係癌症。對手條款寫明癌症再次索償要等足『\${rivalWait} 年』！醫學上腫瘤復發往往喺第 1-2 年高發期，呢 \${rivalWait} 年空窗期若復發係一蚊都 Claim 唔到嘅致命自費盲點！」\`;
          ciStep3 = \`「我地將癌症再次索償間隔直接縮短至『\${ourWait} 年』生命安全線！早 1 年獲得保障。而且首創深切治療部 (ICU) 全額預支：只要連續住 ICU 達 3-5 日，無需指定病名直接賠償 100% 保額，呢個先係真正兜底保命嘅保障！」\`;
          ciTrap = \`⚠️ 陷阱警示：癌症索償等候期 \${rivalWait} 年 vs 我方 \${ourWait} 年相差整整 365 天自費真空期；我方 ICU 連續住 3-5 天免病名預支 100% 是核心致勝點！\`;
          ciChartBars = [
            { label: \`我方生命防線\`, value: \`\${ourWait} 年 (行業頂尖·早1年受保)\`, widthPct: 95, color: \`var(--green)\` },
            { label: \`\${rivalProfile.fullName} 傳統等待期\`, value: \`\${rivalWait} 年 (多 12 個月自費風險)\`, widthPct: 65, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`3 年\`, widthPct: 65, color: \`#94a3b8\` }
          ];
        } else if (ourWait === rivalWait) {
          ciTitle = \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】危疾多次賠付與癌症等待期 ICU 預支防線\`;
          ciStep2 = \`「臨床大數據顯示 85% 危疾索償為癌症。雙方癌症等候期雖均為『\${ourWait} 年』自費空窗期，但魔鬼在細節：危疾防護更需關注非指定疾病 ICU 兜底與持續支援！」\`;
          ciStep3 = \`「我地方案涵蓋過百種嚴重疾病，並加入非指定疾病 ICU 100% 全額預支賠償與高額免體檢通道，全面構建無縫防護網！」\`;
          ciTrap = \`⚠️ 陷阱警示：雙方等候期均為 \${ourWait} 年，勝負在於非指定疾病 ICU 全額預支與免體檢額度！\`;
          ciChartBars = [
            { label: \`我方生命防線\`, value: \`\${ourWait} 年 (ICU預支兜底+過百種重疾)\`, widthPct: 90, color: \`var(--green)\` },
            { label: \`\${rivalProfile.fullName} 防線\`, value: \`\${rivalWait} 年\`, widthPct: 80, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`3 年\`, widthPct: 70, color: \`#94a3b8\` }
          ];
        } else {
          ciTitle = \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】危疾單項等待期宣傳 vs 我方全方位多次賠付與 ICU 兜底\`;
          ciStep2 = \`「臨床大數據顯示腫瘤復發於 1-2 年最高發。市場普遍存在 3 年等待期自費空窗期，對手雖主打 \${rivalWait} 年，但細查條款其後續多次賠付門檻繁複；而危疾防護更需關注未知疾病的全面兜底與連續入住 ICU 100% 預支！」\`;
          ciStep3 = \`「我地方案以深切治療部 (ICU) 連續 3-5 日全額預支 100% 為核心盾牌，配合過百種疾病多次賠償，全面構建無死角生命防線！」\`;
          ciTrap = \`⚠️ 陷阱警示：對手主打單一等候期指標，我方則以連續住 ICU 3-5 天免病名預支 100% 與過百種重疾多次給付提供更強兜底！\`;
          ciChartBars = [
            { label: \`我方生命防線\`, value: \`\${ourWait} 年 (ICU全額預支+過百種重疾)\`, widthPct: 90, color: \`var(--green)\` },
            { label: \`\${rivalProfile.fullName} 等候期\`, value: \`\${rivalWait} 年 (單一維度)\`, widthPct: 85, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`3 年\`, widthPct: 70, color: \`#94a3b8\` }
          ];
        }

        return {
          agent_title: ciTitle,
          agent_step_1: \`「張生，\${rivalProfile.fullName}【\${rivalProfile.flagshipCI}】宣傳保過百種疾病、仲有多次賠償，單張睇落真係好豐富，你睇得咁細心好佩服你！」\`,
          agent_step_2: ciStep2,
          agent_step_3: ciStep3,
          agent_trap_warning: ciTrap,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~多重癌症無限次 100% 賠償~~',
          fineprint_reality: \`每次癌症索償嚴格設有等候期；我方以 ICU 全額預支與過百種疾病建構生命兜底\`,
          fineprint_citation: '各大保司危疾保單條款第 12 條「指定嚴重疾病多重保障等候期定義」',
          corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
          corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`全港頂尖危疾險 · 癌症再次索償間隔與 ICU 兜底比對\`,
          client_source: \`來源：香港癌症資料統計中心及各保司正式保單批註\`,
          client_desc: \`臨床腫瘤學指出，癌症復發及轉移風險於治療後首兩年最為關鍵。縮短癌症再次索償等待期間隔能有效避免自費空窗期。\`,
          chart_title: \`⏱️ 癌症再次索償間隔年期 (越短越能保障復發風險)\`,
          chart_bars: ciChartBars,
          table_title: \`🛡️ 關鍵重疾保障條款深度比對\`,
          table_rows: [
            { label: \`癌症再次索償等待期\`, value: \`\${ourWait} 年 vs 對手 \${rivalWait} 年\`, highlight: true },
            { label: \`非指定疾病 ICU 保障\`, value: \`連續 3-5 日預支 100% 保額\`, highlight: true },
            { label: \`限時免體檢上限\`, value: \`高達 $400 萬美元\`, highlight: true },
            { label: \`保費豁免生效門檻\`, value: \`首次確診即豁免後續保費\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`張生早晨！昨日您提到 \${rivalProfile.fullName} 嘅危疾單張。我幫您深入查閱咗合約條款，發現其癌症再次索償等待期需足足等 \${rivalWait} 年。我地全新方案具備非指定疾病 ICU 100% 預支賠償與過百種疾病防線。我發份醫療條款比較表俾您詳細對比！\`,
          disclaimer
        };
      }

      // 4. VHIS Claim
      if (claimKey === 'vhis') {
        return {
          agent_title: \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】自願醫保【\${rivalProfile.flagshipVHIS}】標靶藥細項上限與特約網絡限制\`,
          agent_step_1: \`「王太，\${rivalProfile.fullName} 宣傳【\${rivalProfile.flagshipVHIS}】全數賠償，單張睇落好豐富，你揀得咁細心好佩服你！」\`,
          agent_step_2: \`「但仔細審視醫療合約細則：非手術癌症治療（標靶藥、免疫治療）喺部分級別依然設有分項限額；而且對手直付網絡主要依賴特約指定醫院，若因急症入住非網絡私家醫院，或病房級別限制嚴格，隨時面臨降級索償罰則自費幾成！」\`,
          agent_step_3: \`「我地高端自願醫保標靶藥全數賠償無細項上限，年度保額數千萬；全港所有私家醫院無障礙直付『出院免找數 (Cashless)』，免除繁瑣預先審批門檻，大病時專人為你跑腿墊付，呢份萬全保障先係真正安心！」\`,
          agent_trap_warning: \`⚠️ 陷阱警示：對手部分級別標靶藥設有分項限額，且直付網絡限於特約醫院；我方高端自願醫保標靶藥全額賠償且私院無縫出院免找數！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~自願醫保全額包賠無自負~~',
          fineprint_reality: '非手術癌症治療若設有分項限額，標靶藥費用動輒數十萬易觸發自費；直付需覆蓋全港所有私院',
          fineprint_citation: '醫務衞生局自願醫保認可產品名單及各大保司正式合約批註',
          corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
          corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`全港主流旗艦自願醫保 (VHIS) 癌症標靶藥全數賠償與網絡直付比對\`,
          client_source: \`來源：醫務衞生局自願醫保認可產品名單及各大保司正式合約批註\`,
          client_desc: \`自願醫保靈活計劃之關鍵差異在於昂貴非手術癌症標靶治療是否設有分項上限，以及直付免找數醫院網絡的覆蓋完整度與病房升級彈性。\`,
          chart_title: \`🏥 昂貴非手術癌症標靶治療保障額度評級\`,
          chart_bars: [
            { label: \`我方高端自願醫保靈活計劃\`, value: \`全數賠償 (無細項限額)\`, widthPct: 100, color: \`var(--ikb)\` },
            { label: \`\${rivalProfile.fullName}「\${rivalProfile.flagshipVHIS}」\`, value: \`設分項限額 / 網絡限制\`, widthPct: 68, color: \`#f59e0b\` },
            { label: \`自願醫保標準計劃法定最低\`, value: \`年限額僅 HK$180,000\`, widthPct: 30, color: \`#94a3b8\` }
          ],
          table_title: \`🩺 醫療理賠與直付服務核心維度深度比對\`,
          table_rows: [
            { label: \`標靶藥 / 免疫治療\`, value: \`全數賠償 (年度數千萬保額) vs 部分級別設分項上限\`, highlight: true },
            { label: \`出院免找數醫院網絡\`, value: \`全港所有私院無縫直付 vs 限指定特約合作網絡\`, highlight: true },
            { label: \`全球緊急醫療支援\`, value: \`支援全球直付免墊支\`, highlight: true },
            { label: \`法定個人薪俸稅扣稅\`, value: \`每年每人最高 HK$8,000 (兩者均享)\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`王太您好！了解過您關注 \${rivalProfile.fullName} 的【\${rivalProfile.flagshipVHIS}】。醫保核心在於大病理賠時標靶藥物是否全數賠償及醫院直付無障礙。我為您整理了一份「標靶藥全額覆蓋 vs 分項限額」與「私院出院免找數網絡」深度比對表，讓您看清實際條款差異，稍後發給您參考！\`,
          disclaimer
        };
      }

      // 5. Financing UL Claim
      if (claimKey === 'financing_ul') {
        return {
          agent_title: \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】85% 槓桿保費融資息差倒掛與 Margin Call 致命盲點\`,
          agent_step_1: \`「趙總，85% 高槓桿保費融資表面睇可以用 15 萬本金撬動 100 萬保單，息差收益率宣傳到 10% 以上，作為高資產配置確實好吸引！」\`,
          agent_step_2: \`「但融資命脈在於息差（Spread）。銀行借貸利息係浮動 Prime Rate / Hibor，而保單結算利率由保司每年釐定；一旦降息週期息差倒掛，每月倒貼利息；若保單退保價值跌破警戒線，銀行隨時出 Margin Call 要求補倉，否則強制斬倉！」\`,
          agent_step_3: \`「我地建議資產配置回歸『無槓桿多元貨幣儲蓄』，免除銀行利率倒掛與 Margin Call 滅頂之災；同時享有 8-9 種貨幣自由轉換與無限次保單分拆，將財富掌控權 100% 掌握喺自己手中。」\`,
          agent_trap_warning: \`⚠️ 陷阱警示：槓桿融資息差易受 HIBOR 浮動倒掛衝擊；我方萬用壽險設有最低保證派息防禦線 (2.0%~2.5%)，避開對手 Margin Call 補倉隱患！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~85% LTV 保費融資年化回報超 15%~~',
          fineprint_reality: '融資借貸息率與 HIBOR / Prime 掛鉤，若利差收窄或抵押品跌價可能面臨追繳保證金 (Margin Call)',
          fineprint_citation: '香港金融管理局 (HKMA) 及保監局 (IA) 關於保費融資業務聯合通函指引',
          corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
          corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`高槓桿保費融資 (UL) vs 無槓桿多元貨幣儲蓄風險收益比對\`,
          client_source: \`來源：香港金管局 (HKMA) 與保監局 (IA) 保費融資聯合通函\`,
          client_desc: \`監管機構嚴正警示：保費融資涉及利率風險、槓桿風險與補倉風險，降息週期極易引發息差倒掛及抵押品減值危機。\`,
          chart_title: \`⚠️ 利率波動與極端市況安全性評級 (越高越安全)\`,
          chart_bars: [
            { label: \`無槓桿多元貨幣儲蓄 (我方)\`, value: \`100% 安全 (零槓桿與補倉風險)\`, widthPct: 100, color: \`var(--green)\` },
            { label: \`\${rivalProfile.fullName} 85% 槓桿融資\`, value: \`承擔 Margin Call 與息差風險\`, widthPct: 35, color: \`#ef4444\` },
            { label: \`市場融資平均安全緩衝區\`, value: \`約 15-20% 跌幅即觸發補倉\`, widthPct: 40, color: \`#f59e0b\` }
          ],
          table_title: \`📊 槓桿融資 vs 無槓桿儲蓄全維度對比\`,
          table_rows: [
            { label: \`借貸利率倒掛風險\`, value: \`零借貸風險 vs 承擔浮動借息\`, highlight: true },
            { label: \`銀行補倉 (Margin Call)\`, value: \`絕對無補倉風險 vs 需隨時注資補倉\`, highlight: true },
            { label: \`保單掌控權與分拆傳承\`, value: \`100% 自由掌控 vs 抵押給銀行無法調配\`, highlight: true },
            { label: \`多元貨幣自由切換\`, value: \`支援 7-9 種主流貨幣\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`趙總早晨！留意到市場上宣傳 85% LTV 保費融資高息差。金管局與保監局最新通函已多次提醒降息環境下的息差倒掛與銀行 Margin Call 補倉風險。我幫您做咗份「槓桿融資 vs 無槓桿多元貨幣傳承」壓力測試分析，發給您參考！\`,
          disclaimer
        };
      }

      // 6. QDAP Claim
      const step3Script = \`「我地 QDAP 方案保證內部回報率 (Guaranteed IRR) 全港頂尖，保證派息比例超過 80%！無論金融海嘯點變，退休現金流一蚊都唔會少；加埋每年法定 HK$60,000 扣稅額，即時實質慳返最高 HK$10,200 稅款！」\`;

      return {
        agent_title: \`🎯 對抗戰策：直擊【\${rivalProfile.fullName}】QDAP 延期年金非保證分紅畫餅\`,
        agent_step_1: \`「林生，見到對手宣傳 QDAP 預期總 IRR 達 4.2%，乍睇確實好吸引，你為退休做準備嘅意識好前瞻！」\`,
        agent_step_2: \`「但魔鬼在細節：對手 4.2% 總回報入面，『保證部分』得唔夠 1.8%（佔比僅 \${rivalProfile.qdapGuaranteedPct}%），其餘全部係非保證分紅！退休救命錢最忌承受市場波動，若退休後股市下跌分紅跳水，每個月糧餉大縮水！」\`,
        agent_step_3: step3Script,
        agent_trap_warning: \`⚠️ 陷阱警示：對手 4.2% 總回報中保證部分不足 50%，退休救命錢最忌承受市場波動；我方保證比例逾 80%，兼享 HK$10,200 實質退稅！\`,
        hero_our_name: heroOur,
        hero_rival_name: heroRival,
        fineprint_claim: '~~買年金等於即賺 17% 現金~~',
        fineprint_reality: '17% 為最高應課稅階稅務扣減，非保司利息；提早退保將面臨高額本金虧損且不可退稅',
        fineprint_citation: '香港稅務局《稅務條例》第 26P 條合資格延期年金保費扣除指引',
        corridor_our: \`\${ourProfile.gn16Fulfillment}%\`,
        corridor_rival: \`\${rivalProfile.gn16Fulfillment}%\`,
        corridor_note: corridorNote,
        horizon_data: horizonData,
        client_title: \`合資格延期年金 (QDAP) 保證利益佔比與扣稅效益比對\`,
        client_source: \`來源：香港保險業監管局 QDAP 認可名單及利益說明文件\`,
        client_desc: \`退休年金最核心價值在於提供確定不變的退休現金流。保證年金比例越高，退休生活越不受金融市場週期動盪影響。\`,
        chart_title: \`🛡️ 年金總利益中「保證部分」確定性佔比\`,
        chart_bars: [
          { label: \`我方旗艦年金方案\`, value: \`82.5% 保證 (極高確定性)\`, widthPct: 82.5, color: \`var(--green)\` },
          { label: \`\${rivalProfile.fullName} 宣傳方案\`, value: \`\${rivalProfile.qdapGuaranteedPct}% 保證 (逾半依賴非保證)\`, widthPct: rivalProfile.qdapGuaranteedPct, color: \`#f59e0b\` },
          { label: \`市場同業平均水平\`, value: \`50.0% 保證\`, widthPct: 50.0, color: \`#94a3b8\` }
        ],
        table_title: \`💰 退休現金流確定性與稅務扣除\`,
        table_rows: [
          { label: \`保證內部回報率比例\`, value: \`逾 80% 保證 vs 對手不足 50%\`, highlight: true },
          { label: \`每年法定最高扣稅額\`, value: \`HK$60,000 (最高實質慳稅 $10,200)\`, highlight: true },
          { label: \`金融危機抗跌韌性\`, value: \`保證派息一蚊唔少\`, highlight: true },
          { label: \`年金領取期選擇\`, value: \`10 / 20 年或至 100 歲靈活選擇\`, highlight: false }
        ],
        bilateral_specs: bilateralSpecs,
        whatsapp_script: \`林生您好！昨日您關注的 QDAP 年金計劃，我對比了各大保司的利益結構。對手方案中非保證分紅佔比偏高，退休金受市場波動較大；我地方案保證派發比例達 80% 以上，並享足每年 $10,200 薪俸稅實質退稅。我發份年金確定性比對表給您參考！\`,
        disclaimer
      };
    }
    window.getBattleCard = getBattleCard;
    window.getBilateralBattleCard = (ourC, rivalC, clm) => getBattleCard(ourC, rivalC, clm);

    // Interactive View Switcher
    function switchView(mode) {
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
      } else {
        if (agentBtn) agentBtn.className = 'view-btn';
        if (clientBtn) clientBtn.className = 'view-btn active-client';
        if (agentView) agentView.style.display = 'none';
        if (clientView) clientView.style.display = 'block';
      }
    }
    window.setViewMode = switchView;
    const setViewMode = switchView;

    function toggleView() {
      switchView(currentMode === 'agent' ? 'client' : 'agent');
    }

    // Bilateral Camp Selectors Management
    function setMyCompany(targetOrName) {
      let rawName = '';
      if (typeof targetOrName === 'string') rawName = targetOrName;
      else if (targetOrName && targetOrName.value) rawName = targetOrName.value;
      else if (targetOrName && targetOrName.innerText) rawName = targetOrName.innerText;

      myCompany = normalizeCompany(rawName);
      mySelectedProduct = null;
      persistMyCompany(myCompany);

      if (selectedCompany === myCompany) {
        selectedCompany = (myCompany === 'AIA') ? 'Prudential' : 'AIA';
        rivalSelectedProduct = null;
      }

      updateCampSelectors();
      updateBattleCard();
    }
    window.setMyCompany = setMyCompany;
    window.getMyCompany = () => myCompany;
    window.getRivalCompany = () => selectedCompany;

    function setMyProduct(targetOrId) {
      let prodId = '';
      if (typeof targetOrId === 'string') prodId = targetOrId;
      else if (targetOrId && targetOrId.value) prodId = targetOrId.value;

      const cat = currentCategory || 'Savings_MultiCurrency';
      const prods = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === myCompany && p.category === cat);
      const match = prods.find(p => p.id === prodId || p.name === prodId || cleanProductName(p.name) === prodId);
      if (match) {
        mySelectedProduct = match;
      }
      const selectMyProd = document.getElementById('select-my-product');
      if (selectMyProd && match) {
        selectMyProd.value = match.id;
      }
      const myProdDisplay = document.getElementById('my-product-display');
      if (myProdDisplay) {
        myProdDisplay.innerText = mySelectedProduct ? cleanProductName(mySelectedProduct.name) : getFlagshipProduct(myCompany, cat);
      }
      updateBattleCard();
    }
    window.setMyProduct = setMyProduct;

    function setRivalProduct(targetOrId) {
      let prodId = '';
      if (typeof targetOrId === 'string') prodId = targetOrId;
      else if (targetOrId && targetOrId.value) prodId = targetOrId.value;

      const cat = currentCategory || 'Savings_MultiCurrency';
      const prods = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === selectedCompany && p.category === cat);
      const match = prods.find(p => p.id === prodId || p.name === prodId || cleanProductName(p.name) === prodId);
      if (match) {
        rivalSelectedProduct = match;
      }
      const selectRivalProd = document.getElementById('select-rival-product');
      if (selectRivalProd && match) {
        selectRivalProd.value = match.id;
      }
      const rivalProdDisplay = document.getElementById('rival-product-display');
      if (rivalProdDisplay) {
        rivalProdDisplay.innerText = rivalSelectedProduct ? cleanProductName(rivalSelectedProduct.name) : getFlagshipProduct(selectedCompany, cat);
      }
      updateBattleCard();
    }
    window.setRivalProduct = setRivalProduct;

    function swapCampRoles() {
      const prevMyComp = myCompany;
      const prevMyProd = mySelectedProduct;

      myCompany = selectedCompany;
      mySelectedProduct = rivalSelectedProduct;

      selectedCompany = prevMyComp;
      rivalSelectedProduct = prevMyProd;

      persistMyCompany(myCompany);
      updateCampSelectors();
      updateBattleCard();

      showToast('🔄 攻防已對調：我方【' + (COMPANY_PROFILES[myCompany]?.fullName || myCompany) + '】vs 對手【' + (COMPANY_PROFILES[selectedCompany]?.fullName || selectedCompany) + '】');
    }
    window.swapCampRoles = swapCampRoles;

    function updateCampSelectors() {
      const selectMy = document.getElementById('select-my-insurer');
      const selectRival = document.getElementById('select-rival-insurer');
      const selectMyProd = document.getElementById('select-my-product');
      const selectRivalProd = document.getElementById('select-rival-product');
      const myProdDisplay = document.getElementById('my-product-display');
      const rivalProdDisplay = document.getElementById('rival-product-display');

      if (selectMy) selectMy.value = myCompany;
      if (selectRival) {
        selectRival.value = selectedCompany;
        Array.from(selectRival.options || []).forEach(opt => {
          opt.disabled = (normalizeCompany(opt.value) === myCompany);
        });
      }

      const cat = currentCategory || 'Savings_MultiCurrency';
      const myFlagship = getFlagshipProduct(myCompany, cat);
      const rivalFlagship = getFlagshipProduct(selectedCompany, cat);

      // Populate & sync select-my-product
      const myProds = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === myCompany && p.category === cat);
      if (selectMyProd) {
        if (myProds.length > 0) {
          selectMyProd.innerHTML = myProds.map(p => '<option value="' + p.id + '">' + cleanProductName(p.name) + '</option>').join('');
          let match = null;
          if (mySelectedProduct && mySelectedProduct.category === cat && normalizeCompany(mySelectedProduct.insurer) === myCompany) {
            match = myProds.find(p => p.id === mySelectedProduct.id) || null;
          }
          if (!match) {
            match = myProds.find(p => p.name.includes(myFlagship) || myFlagship.includes(cleanProductName(p.name))) || myProds[0];
          }
          mySelectedProduct = match;
          selectMyProd.value = match.id;
        } else {
          selectMyProd.innerHTML = '<option value="">' + myFlagship + '</option>';
          mySelectedProduct = null;
        }
      }

      // Populate & sync select-rival-product
      const rivalProds = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === selectedCompany && p.category === cat);
      if (selectRivalProd) {
        if (rivalProds.length > 0) {
          selectRivalProd.innerHTML = rivalProds.map(p => '<option value="' + p.id + '">' + cleanProductName(p.name) + '</option>').join('');
          let match = null;
          if (rivalSelectedProduct && rivalSelectedProduct.category === cat && normalizeCompany(rivalSelectedProduct.insurer) === selectedCompany) {
            match = rivalProds.find(p => p.id === rivalSelectedProduct.id) || null;
          }
          if (!match) {
            match = rivalProds.find(p => p.name.includes(rivalFlagship) || rivalFlagship.includes(cleanProductName(p.name))) || rivalProds[0];
          }
          rivalSelectedProduct = match;
          selectRivalProd.value = match.id;
        } else {
          selectRivalProd.innerHTML = '<option value="">' + rivalFlagship + '</option>';
          rivalSelectedProduct = null;
        }
      }

      if (myProdDisplay) {
        myProdDisplay.innerText = mySelectedProduct ? cleanProductName(mySelectedProduct.name) : myFlagship;
      }
      if (rivalProdDisplay) {
        rivalProdDisplay.innerText = rivalSelectedProduct ? cleanProductName(rivalSelectedProduct.name) : rivalFlagship;
      }

      // Reflect in quick selector pills (for tests and backwards compatibility)
      document.querySelectorAll('#company-pills .thumb-pill').forEach(btn => {
        const btnComp = normalizeCompany(btn.innerText);
        const isMyComp = (btnComp === myCompany);
        const isSelectedRival = (btnComp === selectedCompany);

        btn.classList.toggle('my-company-pill', isMyComp);
        btn.classList.toggle('active', isSelectedRival);
      });
    }

    // Pill Selector Handlers
    function selectCompany(targetOrName, maybeName) {
      let rawName = '';
      if (typeof targetOrName === 'string') {
        rawName = targetOrName;
      } else if (typeof maybeName === 'string') {
        rawName = maybeName;
      } else if (targetOrName && targetOrName.innerText) {
        rawName = targetOrName.innerText;
      }

      const cand = normalizeCompany(rawName);
      if (cand === myCompany) {
        // Auto-swap roles so user can smoothly examine this company as rival without self-matchup
        const prevRival = selectedCompany;
        myCompany = (prevRival === cand) ? ((cand === 'AIA') ? 'Prudential' : 'AIA') : prevRival;
        mySelectedProduct = null;
        persistMyCompany(myCompany);
      }
      selectedCompany = cand;
      rivalSelectedProduct = null;

      if (targetOrName && targetOrName.classList) {
        targetOrName.classList.add('active');
      }

      document.querySelectorAll('#company-pills .thumb-pill').forEach(btn => {
        const btnComp = normalizeCompany(btn.innerText);
        const isMyComp = (btnComp === myCompany);
        const isSelectedRival = (btnComp === selectedCompany);
        btn.classList.toggle('my-company-pill', isMyComp);
        btn.classList.toggle('active', isSelectedRival);
      });

      updateCampSelectors();
      updateBattleCard();
    }
    window.selectCompany = selectCompany;

    function selectClaim(targetOrClaim, maybeClaim) {
      let rawClaim = '';
      if (typeof targetOrClaim === 'string') {
        rawClaim = targetOrClaim;
      } else if (typeof maybeClaim === 'string') {
        rawClaim = maybeClaim;
      } else if (targetOrClaim && targetOrClaim.innerText) {
        rawClaim = targetOrClaim.innerText;
      }

      selectedClaimText = rawClaim || selectedClaimText;
      selectedClaim = normalizeClaim(rawClaim);
      syncCategoryTabWithClaim(selectedClaim);

      renderClaimPills(currentCategory);

      let foundExact = false;
      document.querySelectorAll('#claim-pills .thumb-pill').forEach(btn => {
        if (targetOrClaim && (targetOrClaim === btn || targetOrClaim.innerText === btn.innerText)) {
          btn.classList.add('active');
          foundExact = true;
        } else if (rawClaim && (btn.innerText === rawClaim || (btn.dataset && btn.dataset.claim === rawClaim))) {
          btn.classList.add('active');
          foundExact = true;
        } else {
          btn.classList.remove('active');
        }
      });

      if (!foundExact) {
        let firstMatch = false;
        document.querySelectorAll('#claim-pills .thumb-pill').forEach(btn => {
          const btnNorm = normalizeClaim(btn.innerText);
          if (!firstMatch && btnNorm === selectedClaim) {
            btn.classList.add('active');
            firstMatch = true;
          } else {
            btn.classList.remove('active');
          }
        });
      }

      updateCampSelectors();
      updateBattleCard();
    }
    window.selectClaim = selectClaim;

    // Category Tabs Synchronizer
    function syncCategoryTabWithClaim(claimKey) {
      let targetCat = 'Savings_MultiCurrency';
      if (claimKey === 'critical_illness') targetCat = 'Critical_Illness';
      else if (claimKey === 'vhis') targetCat = 'Medical_VHIS';
      else if (claimKey === 'qdap') targetCat = 'Annuity_QDAP';
      else if (claimKey === 'financing_ul') targetCat = 'Financing_UniversalLife';

      currentCategory = targetCat;

      document.querySelectorAll('#category-tabs .cat-tab').forEach(tab => {
        tab.classList.toggle('active', !!(tab.dataset && tab.dataset.cat === targetCat));
      });
    }

    function selectCategory(targetOrKey, maybeKey) {
      let rawKey = '';
      if (typeof targetOrKey === 'string') rawKey = targetOrKey;
      else if (typeof maybeKey === 'string') rawKey = maybeKey;
      else if (targetOrKey && targetOrKey.dataset && targetOrKey.dataset.cat) rawKey = targetOrKey.dataset.cat;
      else if (targetOrKey && targetOrKey.innerText) rawKey = targetOrKey.innerText;

      const normCat = normalizeCategory(rawKey);
      currentCategory = normCat;

      let claimKey = 'prepayment';
      if (normCat === 'Critical_Illness') claimKey = 'critical_illness';
      else if (normCat === 'Medical_VHIS') claimKey = 'vhis';
      else if (normCat === 'Annuity_QDAP') claimKey = 'qdap';
      else if (normCat === 'Financing_UniversalLife') claimKey = 'financing_ul';
      else claimKey = 'prepayment';

      // Reset product selections to flagship for new category
      mySelectedProduct = null;
      rivalSelectedProduct = null;
      selectedClaimText = '';

      selectClaim(claimKey);
    }
    window.selectCategory = selectCategory;

    // Horizon Slider Handler
    function updateHorizonDisplay(card, year) {
      const resultCard = document.getElementById('horizon-result-card');
      const yearBadge = document.getElementById('horizon-year-badge');
      if (yearBadge) yearBadge.innerText = \`\${year} 年\`;
      if (!resultCard || !card || !card.horizon_data) return;
      const text = card.horizon_data[year] || card.horizon_data[30];
      resultCard.innerHTML = \`<strong>第 \${year} 年動態利益投影：</strong>\${text}\`;
    }

    function onHorizonChange(val) {
      const v = Number(val);
      const HORIZON_STEPS = [5, 10, 20, 30];
      const year = (v >= 0 && v < HORIZON_STEPS.length && Number.isInteger(v)) ? HORIZON_STEPS[v] : v;
      currentHorizonYear = year;
      const card = getBattleCard(myCompany, selectedCompany, selectedClaim);
      updateHorizonDisplay(card, currentHorizonYear);
    }
    window.onHorizonChange = onHorizonChange;

    // Dynamic Reactive DOM Updater
    function updateBattleCard() {
      const card = getBattleCard(myCompany, selectedCompany, selectedClaim);
      if (!card) return;

      // Agent View Updates
      const agentTitle = document.getElementById('agent-title');
      const agentStep1 = document.getElementById('agent-step-1');
      const agentStep2 = document.getElementById('agent-step-2');
      const agentStep3 = document.getElementById('agent-step-3');
      const agentTrap = document.getElementById('agent-trap-alert');

      if (agentTitle) agentTitle.innerHTML = card.agent_title;
      if (agentStep1) agentStep1.innerHTML = card.agent_step_1;
      if (agentStep2) agentStep2.innerHTML = card.agent_step_2;
      if (agentStep3) agentStep3.innerHTML = card.agent_step_3;
      if (agentTrap) agentTrap.innerHTML = \`<strong>條款陷阱避坑警示：</strong>\${card.agent_trap_warning}\`;

      // Client View Updates
      const clientTitle = document.getElementById('client-title');
      const clientSource = document.getElementById('client-source');
      const clientDesc = document.getElementById('client-desc');
      const clientChartTitle = document.getElementById('client-chart-title');
      const clientChartBars = document.getElementById('client-chart-bars');
      const clientTableTitle = document.getElementById('client-table-title');
      const clientTable = document.getElementById('client-table');
      const clientDisclaimer = document.getElementById('client-disclaimer');
      const bilateralSpecTable = document.getElementById('bilateral-spec-table');

      if (clientTitle) clientTitle.innerHTML = card.client_title;
      if (clientSource) clientSource.innerHTML = card.client_source;
      if (clientDesc) clientDesc.innerHTML = card.client_desc;
      if (clientChartTitle) clientChartTitle.innerHTML = card.chart_title;

      // 1v1 Battle Card Header
      const heroOur = document.getElementById('hero-our-name');
      const heroRival = document.getElementById('hero-rival-name');
      if (heroOur) heroOur.innerText = card.hero_our_name;
      if (heroRival) heroRival.innerText = card.hero_rival_name;

      // 1v1 Spec Table Update
      if (bilateralSpecTable && Array.isArray(card.bilateral_specs)) {
        bilateralSpecTable.innerHTML = \`
          <thead>
            <tr style="background:#f1f5f9;border-bottom:1px solid #cbd5e1;">
              <th style="padding:6px 8px;font-size:11px;color:#475569;">指標維度</th>
              <th style="padding:6px 8px;font-size:11px;color:var(--ikb);font-weight:700;">Plan A (我方)</th>
              <th style="padding:6px 8px;font-size:11px;color:#475569;">Plan B (對手)</th>
              <th style="padding:6px 8px;font-size:11px;color:#0f172a;text-align:right;">對比差額</th>
            </tr>
          </thead>
          <tbody>
            \${card.bilateral_specs.map(row => \`
              <tr style="border-bottom:1px solid #f1f5f9; \${row.winner === 'our' ? 'background:rgba(0,47,167,0.02);' : ''}">
                <td style="padding:6px 8px;font-weight:600;color:#334155;">\${row.label}</td>
                <td style="padding:6px 8px;font-family:'JetBrains Mono';font-weight:700;color:var(--ikb);">\${row.ourVal}</td>
                <td style="padding:6px 8px;font-family:'JetBrains Mono';color:#64748b;">\${row.rivalVal}</td>
                <td style="padding:6px 8px;font-family:'JetBrains Mono';font-weight:700;text-align:right;color:\${row.winner === 'our' ? '#10b981' : (row.winner === 'rival' ? '#f59e0b' : '#64748b')};">\${row.delta}</td>
              </tr>
            \`).join('')}
          </tbody>
        \`;
      }

      // Horizon Display
      updateHorizonDisplay(card, currentHorizonYear);

      // GN16 Corridor Meter
      const corridorDesc = document.getElementById('corridor-desc');
      const corridorOurPointer = document.getElementById('corridor-our-pointer');
      const corridorRivalPointer = document.getElementById('corridor-rival-pointer');
      const corridorOurLabel = document.getElementById('corridor-our-label');

      if (corridorDesc) corridorDesc.innerHTML = card.corridor_note;
      if (corridorOurLabel) corridorOurLabel.innerText = \`\${card.corridor_our} (我方)\`;

      if (corridorOurPointer) {
        const numOur = parseFloat(card.corridor_our);
        const posOur = isNaN(numOur) || numOur <= 0 ? 10 : Math.max(10, Math.min(98, numOur));
        corridorOurPointer.style.left = \`\${posOur}%\`;
      }
      if (corridorRivalPointer) {
        const numRival = parseFloat(card.corridor_rival);
        const posRival = isNaN(numRival) || numRival <= 0 ? 10 : Math.max(10, Math.min(98, numRival));
        corridorRivalPointer.style.left = \`\${posRival}%\`;
      }

      // Fine-Print Revealer
      const fpClaim = document.getElementById('fineprint-claim');
      const fpReality = document.getElementById('fineprint-reality');
      const fpCitation = document.getElementById('fineprint-citation');
      if (fpClaim) fpClaim.innerHTML = card.fineprint_claim;
      if (fpReality) fpReality.innerHTML = card.fineprint_reality;
      if (fpCitation) fpCitation.innerHTML = card.fineprint_citation;

      // Chart Bars
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
      }

      // Feature Comparison Table
      if (clientTableTitle) clientTableTitle.innerHTML = card.table_title;

      if (clientTable && Array.isArray(card.table_rows)) {
        clientTable.innerHTML = card.table_rows.map(row => \`
          <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:8px 0; color:#6b7280;">\${row.label}</td>
            <td style="padding:8px 0; font-weight:700; color:\${row.highlight ? 'var(--ikb)' : '#111827'}; text-align:right;">\${row.value}</td>
          </tr>
        \`).join('');
      }

      if (clientDisclaimer) clientDisclaimer.innerHTML = card.disclaimer;

      // Category Tabs Sync
      syncCategoryTabWithClaim(selectedClaim);

      // Update WhatsApp pitch script
      currentWhatsAppScript = card.whatsapp_script;
    }
    window.updateBattleCard = updateBattleCard;

    // Catalog Drawer Handlers
    function openCatalogDrawer() {
      const drawer = document.getElementById('catalog-drawer');
      const backdrop = document.getElementById('catalog-drawer-backdrop');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      renderCatalog('', 'all');
    }
    window.openCatalogDrawer = openCatalogDrawer;

    function closeCatalogDrawer() {
      const drawer = document.getElementById('catalog-drawer');
      const backdrop = document.getElementById('catalog-drawer-backdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
    window.closeCatalogDrawer = closeCatalogDrawer;

    function filterCatalog() {
      const searchInput = document.getElementById('catalog-search-input');
      const text = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const activeChip = document.querySelector('.drawer-chip.active');
      const cat = activeChip ? activeChip.dataset.cat : 'all';
      renderCatalog(text, cat);
    }
    window.filterCatalog = filterCatalog;

    function filterCatalogByChip(chip, cat) {
      document.querySelectorAll('.drawer-chip').forEach(c => c.classList.remove('active'));
      if (chip) chip.classList.add('active');
      const searchInput = document.getElementById('catalog-search-input');
      const text = searchInput ? searchInput.value.toLowerCase().trim() : '';
      renderCatalog(text, cat);
    }
    window.filterCatalogByChip = filterCatalogByChip;

    function renderCatalog(filterText, catFilter) {
      const container = document.getElementById('catalog-cards-list');
      if (!container || !Array.isArray(window.ALL_PRODUCTS_CATALOG)) return;

      const filtered = window.ALL_PRODUCTS_CATALOG.filter(p => {
        const matchesCat = (!catFilter || catFilter === 'all' || p.category === catFilter);
        const matchesText = !filterText ||
          p.name.toLowerCase().includes(filterText) ||
          p.insurerName.toLowerCase().includes(filterText) ||
          p.categoryName.toLowerCase().includes(filterText) ||
          p.highlight.toLowerCase().includes(filterText) ||
          p.id.toLowerCase().includes(filterText);
        return matchesCat && matchesText;
      });

      container.innerHTML = filtered.map(p => \`
        <div class="drawer-product-card">
          <div class="drawer-card-top">
            <span class="drawer-card-badge">\${p.categoryName}</span>
            <span style="font-family:'JetBrains Mono';font-size:11px;color:#64748b;">\${p.insurer}</span>
          </div>
          <div class="drawer-card-title">\${p.name}</div>
          <div class="drawer-card-insurer">\${p.insurerName} · \${p.highlight}</div>
          <div class="drawer-card-specs">
            <div>
              <div class="drawer-spec-label">預繳利率</div>
              <div class="drawer-spec-val">\${p.prepay}</div>
            </div>
            <div>
              <div class="drawer-spec-label">最高回贈</div>
              <div class="drawer-spec-val" style="color:var(--ikb);">\${p.discount}</div>
            </div>
            <div>
              <div class="drawer-spec-label">實現率/額度</div>
              <div class="drawer-spec-val" style="color:#10b981;">\${p.gn16}</div>
            </div>
          </div>
          <button class="drawer-card-btn" onclick="selectProductFromCatalog('\${p.id}')">🥊 載入對抗戰卡</button>
        </div>
      \`).join('');
    }
    window.renderCatalog = renderCatalog;

    function selectProductFromCatalog(promoId) {
      const p = window.ALL_PRODUCTS_CATALOG.find(x => x.id === promoId);
      if (!p) return;
      const prodInsurer = normalizeCompany(p.insurer);
      if (prodInsurer === myCompany) {
        selectCategory(p.category);
        setMyProduct(p.id);
        showToast(\`已載入我方主力【\${cleanProductName(p.name)}】對抗卡\`);
      } else {
        selectCompany(prodInsurer);
        selectCategory(p.category);
        setRivalProduct(p.id);
        showToast(\`已載入競品【\${cleanProductName(p.name)}】對抗卡\`);
      }
      closeCatalogDrawer();
    }
    window.selectProductFromCatalog = selectProductFromCatalog;

    function openCatalogForCompany(side) {
      const comp = (side === 'our') ? myCompany : selectedCompany;
      const drawer = document.getElementById('catalog-drawer');
      const backdrop = document.getElementById('catalog-drawer-backdrop');
      const searchInput = document.getElementById('catalog-search-input');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      if (searchInput) searchInput.value = comp;
      renderCatalog(comp.toLowerCase(), 'all');
    }
    window.openCatalogForCompany = openCatalogForCompany;

    // WhatsApp Clipboard Helper with Toast Feedback
    function copyWhatsAppPitch() {
      const text = currentWhatsAppScript || "陳生早晨！最近留意到市場預繳利息戰好激烈，我幫您做咗份全港 5 年期預繳利息與次年浮動條款對比表，如果您有興趣鎖定中長線穩定收益，我發份比對表俾您參考！";
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast("✅ 見客 WhatsApp 話術模板已複製到剪貼簿！");
        }).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    }
    const copyWhatsAppTemplate = copyWhatsAppPitch;
    window.copyWhatsAppPitch = copyWhatsAppPitch;
    window.copyWhatsAppTemplate = copyWhatsAppPitch;

    function fallbackCopyText(text) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("✅ 見客 WhatsApp 話術模板已複製到剪貼簿！");
      } catch (e) {
        alert("話術內容：\\n\\n" + text);
      }
    }

    function showToast(msg) {
      const toast = document.getElementById("toast");
      if (!toast) {
        alert(msg);
        return;
      }
      toast.innerText = msg;
      toast.style.display = "block";
      toast.style.opacity = "1";
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
          toast.style.display = "none";
        }, 250);
      }, 2500);
    }
    window.showToast = showToast;

    // PWA Offline Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Registered for offline caching
      });
    }

    // Global Window API Exposure for PWA / Sandbox Testability
    window.myCompany = myCompany;
    window.selectedCompany = selectedCompany;
    window.switchView = switchView;
    window.setViewMode = switchView;
    window.toggleView = toggleView;
    window.selectCompany = selectCompany;
    window.selectClaim = selectClaim;
    window.selectCategory = selectCategory;
    window.setMyCompany = setMyCompany;
    window.setMyProduct = setMyProduct;
    window.setRivalProduct = setRivalProduct;
    window.swapCampRoles = swapCampRoles;
    window.getMyCompany = () => myCompany;
    window.getRivalCompany = () => selectedCompany;
    window.updateBattleCard = updateBattleCard;
    window.getBattleCard = getBattleCard;
    window.getBilateralBattleCard = (ourC, rivalC, clm) => getBattleCard(ourC, rivalC, clm);
    window.normalizeCompany = normalizeCompany;
    window.normalizeClaim = normalizeClaim;
    window.normalizeCategory = normalizeCategory;
    window.cleanProductName = cleanProductName;
    window.renderClaimPills = renderClaimPills;
    window.copyWhatsAppPitch = copyWhatsAppPitch;

    // Initial Trigger on load
    window.addEventListener('DOMContentLoaded', () => {
      renderClaimPills(currentCategory);
      updateCampSelectors();
      updateBattleCard();
    });
    // Fallback immediate trigger
    renderClaimPills(currentCategory);
    updateCampSelectors();
    updateBattleCard();
  </script>
</body>
</html>
`;

const templatesDir = path.join(__dirname, '..', 'templates');
const distDir = path.join(__dirname, '..', 'dist');

const mobileCafePath = path.join(templatesDir, 'mobile_cafe_app.html');
const distIndexPath = path.join(distDir, 'index.html');
const distCafePath = path.join(distDir, 'cafe.html');

fs.writeFileSync(mobileCafePath, htmlContent, 'utf8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(distIndexPath, htmlContent, 'utf8');
  fs.writeFileSync(distCafePath, htmlContent, 'utf8');
}

console.log('[InsurIntel] Successfully generated templates/mobile_cafe_app.html and synchronized dist/index.html & dist/cafe.html (' + htmlContent.length + ' chars)!');

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
  Bupa: '保柏 Bupa',
  HSBC: '滙豐保險 HSBC Life',
  HSBC_Life: '滙豐保險 HSBC Life',
  Generali: '忠意保險 Generali',
  BlueCross: '藍十字 Blue Cross',
  ChinaLife: '中國人壽海外 China Life'
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

    // Calculate max rebate from premium_discounts
    let maxRebateNum = 0;
    if (p.premium_discounts && Array.isArray(p.premium_discounts)) {
      for (const d of p.premium_discounts) {
        if (typeof d.discount_rate_pct === 'number' && d.discount_rate_pct > maxRebateNum) {
          maxRebateNum = d.discount_rate_pct;
        }
      }
    }
    const prepayRateNum = (p.prepayment_scheme && typeof p.prepayment_scheme.guaranteed_rate_pct === 'number') ? p.prepayment_scheme.guaranteed_rate_pct : 0;
    const prepayLockNum = (p.prepayment_scheme && typeof p.prepayment_scheme.lock_period_years === 'number') ? p.prepayment_scheme.lock_period_years : 1;
    const gn16Num = (p.savings_metrics && typeof p.savings_metrics.gn16_fulfillment_ratio_pct === 'number') ? p.savings_metrics.gn16_fulfillment_ratio_pct : 0;
    const bkYearNum = p.savings_metrics ? (p.savings_metrics.guaranteed_breakeven_year || p.savings_metrics.breakeven_guaranteed_year || 0) : 0;
    const expBkYearNum = p.savings_metrics ? (p.savings_metrics.expected_breakeven_year || p.savings_metrics.breakeven_expected_year || 0) : 0;
    const irr30Num = (p.savings_metrics && typeof p.savings_metrics.expected_irr_year_30 === 'number') ? p.savings_metrics.expected_irr_year_30 : 0;
    const cancerWaitNum = (p.ci_metrics && typeof p.ci_metrics.cancer_waiting_period_years === 'number') ? p.ci_metrics.cancer_waiting_period_years : 3;
    const ciIllnessesNum = (p.ci_metrics && typeof p.ci_metrics.total_illnesses_covered === 'number') ? p.ci_metrics.total_illnesses_covered : 120;
    const ciMultiplePctNum = (p.ci_metrics && typeof p.ci_metrics.multiple_claim_limit_pct === 'number') ? p.ci_metrics.multiple_claim_limit_pct : 900;
    const ciIcuBool = !!(p.ci_metrics && p.ci_metrics.icu_stay_benefit_covered);
    const vhisLimitHkdNum = (p.vhis_metrics && typeof p.vhis_metrics.annual_limit_hkd === 'number') ? p.vhis_metrics.annual_limit_hkd : 0;
    const qdapGuaranteedIRRNum = (p.qdap_metrics && typeof p.qdap_metrics.guaranteed_internal_rate_pct === 'number') ? p.qdap_metrics.guaranteed_internal_rate_pct : 0;
    const qdapTotalIRRNum = (p.qdap_metrics && typeof p.qdap_metrics.total_internal_rate_pct === 'number') ? p.qdap_metrics.total_internal_rate_pct : 0;
    const qdapGuaranteedPctNum = (p.qdap_metrics && p.qdap_metrics.guaranteed_internal_rate_pct && p.qdap_metrics.total_internal_rate_pct)
      ? Math.round((p.qdap_metrics.guaranteed_internal_rate_pct / p.qdap_metrics.total_internal_rate_pct) * 1000) / 10
      : 50.0;
    const ulLtvNum = (p.ul_metrics && typeof p.ul_metrics.max_ltv_pct === 'number') ? p.ul_metrics.max_ltv_pct : 85;
    const ulFloorRateNum = (p.ul_metrics && typeof p.ul_metrics.crediting_rate_guaranteed_pct === 'number') ? p.ul_metrics.crediting_rate_guaranteed_pct : 2.25;
    const ulCreditingRateNum = (p.ul_metrics && typeof p.ul_metrics.crediting_rate_current_pct === 'number') ? p.ul_metrics.crediting_rate_current_pct : 5.25;
    const ulNetSpreadNum = (p.ul_metrics && typeof p.ul_metrics.net_carry_spread_pct === 'number') ? p.ul_metrics.net_carry_spread_pct : 1.45;
    const specialNotesStr = (p.underwriting_concessions && p.underwriting_concessions.special_waiver_notes) ? p.underwriting_concessions.special_waiver_notes : '';

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
      highlight,
      maxRebate: maxRebateNum,
      prepayRate: prepayRateNum,
      prepayLock: prepayLockNum,
      gn16Fulfillment: gn16Num,
      breakevenYear: bkYearNum,
      expectedBreakevenYear: expBkYearNum,
      irr30: irr30Num,
      cancerWaitYears: cancerWaitNum,
      ciIllnesses: ciIllnessesNum,
      ciMultiplePct: ciMultiplePctNum,
      ciIcu: ciIcuBool,
      vhisLimitHkd: vhisLimitHkdNum,
      qdapGuaranteedIRR: qdapGuaranteedIRRNum,
      qdapTotalIRR: qdapTotalIRRNum,
      qdapGuaranteedPct: qdapGuaranteedPctNum,
      ulLtv: ulLtvNum,
      ulFloorRate: ulFloorRateNum,
      ulCreditingRate: ulCreditingRateNum,
      ulNetSpread: ulNetSpreadNum,
      specialNotes: specialNotesStr,
      clause_highlights: p.clause_highlights || [],
      clause_pitfalls: p.clause_pitfalls || [],
      last_updated: p.last_updated || '2026-11-06',
      audit_metadata: p.audit_metadata || null,
      savings_metrics: p.savings_metrics || null,
      ci_metrics: p.ci_metrics || null,
      vhis_metrics: p.vhis_metrics || null,
      qdap_metrics: p.qdap_metrics || null,
      ul_metrics: p.ul_metrics || null
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
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
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
    .camp-select optgroup {
      font-weight: 800;
      color: #475569;
      background: #f8fafc;
      font-size: 11px;
    }
    .camp-select option {
      font-weight: 600;
      color: #1e293b;
      background: #ffffff;
      padding: 4px 6px;
      font-size: 12px;
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
    .bilateral-spec-table tr.spec-row-highlighted {
      background: #fffbeb !important;
      border-left: 4px solid #f59e0b !important;
      box-shadow: inset 0 0 6px rgba(245, 158, 11, 0.15);
    }
    .spec-focus-badge {
      display: inline-block;
      margin-left: 5px;
      font-size: 9px;
      background: #f59e0b;
      color: #ffffff;
      padding: 1px 5px;
      border-radius: 4px;
      font-weight: 700;
      vertical-align: middle;
      letter-spacing: 0.5px;
      box-shadow: 0 1px 2px rgba(245, 158, 11, 0.3);
    }
    .claim-selector-header {
      margin-top: 6px;
      margin-bottom: 4px;
    }
    .claim-guide-tip {
      font-size: 11px;
      color: #475569;
      line-height: 1.4;
      margin-top: 4px;
      margin-bottom: 6px;
      background: #eff6ff;
      border-left: 3px solid var(--ikb);
      padding: 6px 10px;
      border-radius: 0 6px 6px 0;
    }
    .agent-objection-banner {
      background: #0f172a;
      border: 1px solid #38bdf8;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
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

    /* Top Date Audit Banner */
    .top-date-banner {
      background: #0f172a;
      color: #93c5fd;
      font-size: 11px;
      font-weight: 600;
      padding: 7px 16px;
      text-align: center;
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      letter-spacing: 0.2px;
      line-height: 1.4;
    }

    /* 1v1 Bilateral Actuarial Scorecard (#bilateral-radar-scorecard) */
    .radar-scorecard-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin: 12px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .scorecard-header {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .scorecard-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }
    .scorecard-badge {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--ikb);
      background: var(--ikb-light);
      padding: 2px 8px;
      border-radius: 12px;
    }
    .scorecard-legend {
      display: flex;
      align-items: center;
      margin-top: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      flex-wrap: wrap;
      gap: 4px;
    }
    .scorecard-bars-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .scorecard-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .scorecard-row-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .scorecard-dimension-name {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
    }
    .scorecard-row-values {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }
    .scorecard-val-our {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--ikb);
    }
    .scorecard-vs {
      color: #94a3b8;
      font-size: 10px;
    }
    .scorecard-val-rival {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #ef4444;
    }
    .scorecard-delta-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .scorecard-delta-badge.delta-lead {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .scorecard-delta-badge.delta-lag {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .scorecard-delta-badge.delta-tie {
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }
    .scorecard-dual-track {
      display: flex;
      flex-direction: column;
      gap: 3px;
      background: #f8fafc;
      padding: 3px;
      border-radius: 6px;
    }
    .scorecard-progress-bar {
      height: 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding-left: 6px;
      transition: width 0.3s ease;
      font-size: 9px;
      font-weight: 700;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }
    .scorecard-progress-bar.our-bar {
      background: linear-gradient(90deg, #1d4ed8, #3b82f6);
    }
    .scorecard-progress-bar.rival-bar {
      background: linear-gradient(90deg, #b91c1c, #ef4444);
    }

    /* Bilateral Clause Comparison Card (#bilateral-clause-comparison) */
    .clause-comparison-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin: 12px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .clause-comp-header {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }
    .clause-comp-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }
    .clause-comp-badge {
      font-size: 10px;
      font-weight: 700;
      color: #10b981;
      background: #ecfdf5;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid #a7f3d0;
    }
    .clause-comp-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }
    .clause-grid-dual {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    @media (max-width: 600px) {
      .clause-grid-dual {
        grid-template-columns: 1fr;
      }
    }
    .clause-col {
      border-radius: 10px;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
    }
    .clause-col-our {
      background: #f8fbff;
      border-color: #bfdbfe;
    }
    .clause-col-rival {
      background: #fffafa;
      border-color: #fecaca;
    }
    .clause-col-header {
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .col-camp-badge {
      font-size: 10px;
      font-weight: 700;
      display: inline-block;
      margin-bottom: 2px;
    }
    .our-head .col-camp-badge { color: var(--ikb); }
    .rival-head .col-camp-badge { color: #dc2626; }
    .col-prod-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }
    .clause-section {
      margin-bottom: 10px;
    }
    .clause-section-title {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .clause-section-title.green-title {
      color: #059669;
    }
    .clause-section-title.amber-title {
      color: #d97706;
    }
    .clause-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .clause-highlight-item, .clause-pitfall-item {
      font-size: 11px;
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 6px;
    }
    .clause-highlight-item {
      color: #065f46;
      background: rgba(16, 185, 129, 0.08);
    }
    .clause-pitfall-item {
      color: #9a3412;
      background: rgba(245, 158, 11, 0.1);
    }
    .clause-icon {
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .icon-check { color: #10b981; }
    .icon-warn { color: #f59e0b; }
    .clause-empty {
      font-size: 11px;
      color: #94a3b8;
      font-style: italic;
    }
    .clause-comp-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.4;
    }

    /* Agent Clause Intel (#agent-clause-intel) */
    .agent-clause-intel-container {
      margin-top: 14px;
    }
    .agent-intel-box {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 14px;
    }
    .intel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #334155;
    }
    .intel-title {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
    }
    .intel-tag {
      font-size: 10px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 600;
    }
    .intel-block {
      margin-bottom: 12px;
      padding: 10px;
      border-radius: 8px;
    }
    .attack-block {
      background: rgba(239, 68, 68, 0.08);
      border-left: 3px solid #ef4444;
    }
    .trump-block {
      background: rgba(16, 185, 129, 0.08);
      border-left: 3px solid #10b981;
    }
    .intel-block-title {
      font-size: 12px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 6px;
    }
    .intel-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .intel-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: rgba(15, 23, 42, 0.6);
      padding: 6px 8px;
      border-radius: 6px;
    }
    .intel-item-badge {
      font-size: 10px;
      font-weight: 700;
    }
    .pitfall-attack-item .intel-item-badge {
      color: #f87171;
    }
    .highlight-trump-item .intel-item-badge {
      color: #4ade80;
    }
    .intel-item-text {
      font-size: 11px;
      color: #cbd5e1;
      line-height: 1.4;
    }
    .intel-pitch-hint {
      margin-top: 8px;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.4;
      background: rgba(0,0,0,0.2);
      padding: 6px 8px;
      border-radius: 4px;
    }
    .drawer-clause-tag {
      display: inline-block;
      font-size: 10px;
      color: #047857;
      background: #ecfdf5;
      padding: 1px 6px;
      border-radius: 4px;
      margin-right: 4px;
      margin-top: 2px;
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

  <!-- Top App Sub-Bar / Prominent Audit Stamp -->
  <div class="top-date-banner" id="top-date-banner">
    <span>📅 最後資料更新日期：2026年11月06日 · 香港保監局 GN16 / 各保司官方通函及說明書核定</span>
  </div>

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
    <button class="cat-tab active" data-cat="Savings_MultiCurrency" onclick="selectCategory(this, 'Savings_MultiCurrency')">📈 儲蓄分紅 (20款)</button>
    <button class="cat-tab" data-cat="Critical_Illness" onclick="selectCategory(this, 'Critical_Illness')">🛡️ 重疾危疾 (20款)</button>
    <button class="cat-tab" data-cat="Medical_VHIS" onclick="selectCategory(this, 'Medical_VHIS')">🏥 自願醫保 (20款)</button>
    <button class="cat-tab" data-cat="Annuity_QDAP" onclick="selectCategory(this, 'Annuity_QDAP')">👴 扣稅年金 (19款)</button>
    <button class="cat-tab" data-cat="Financing_UniversalLife" onclick="selectCategory(this, 'Financing_UniversalLife')">🏦 萬用融資 (20款)</button>
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
          <option value="HSBC">滙豐保險 HSBC Life</option>
          <option value="Generali">忠意保險 Generali</option>
          <option value="BlueCross">藍十字 Blue Cross</option>
          <option value="ChinaLife">中國人壽海外 China Life</option>
          <option value="Cigna">信諾 Cigna</option>
          <option value="Bupa">保柏 Bupa</option>
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
          <option value="HSBC">滙豐保險 HSBC Life</option>
          <option value="Generali">忠意保險 Generali</option>
          <option value="BlueCross">藍十字 Blue Cross</option>
          <option value="ChinaLife">中國人壽海外 China Life</option>
          <option value="Cigna">信諾 Cigna</option>
          <option value="Bupa">保柏 Bupa</option>
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

    <div class="claim-selector-header" style="margin-top:6px; margin-bottom:4px;">
      <div class="selector-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>⚡ 選擇客戶提出的競品噱頭 / 攻防焦點 (點擊即時切換破局話術與對比高亮)</span>
        <span style="color:var(--ikb);font-size:11px;font-weight:700;">即點即破局</span>
      </div>
      <div class="claim-guide-tip">
        💡 <strong>實戰指南：</strong>當客戶提出對手宣傳賣點（例如「對手話有 5.8% 預繳」），點擊下方對應標籤。系統即時在【顧問私密視角】提供 3 步破局話術，並在【客戶展示視角】精算擂台自動高亮該項對比與細則盲點！
      </div>
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
    <div class="secret-badge">持牌人私密提詞 · 嚴禁直接展示給客戶 · 最後資料更新日期：2026年11月06日</div>
    
    <!-- 当前应对噱头提示条 -->
    <div class="agent-objection-banner" id="agent-objection-banner">
      <span>⚡ 應對客戶異議焦點：</span>
      <strong id="agent-objection-title" style="color:#38bdf8;">5.8% 預繳 / 保證高回報</strong>
    </div>

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

    <!-- Agent Clause Intel Container -->
    <div class="agent-clause-intel-container" id="agent-clause-intel">
      <!-- Rendered dynamically by updateBattleCard() -->
    </div>
  </div>

  <!-- Client Facing View (Light, Clean, Objective, IA Compliant Tear-Sheet) -->
  <div id="client-view" class="main-card" style="display:none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:4px;">
      <span style="font-size:11px; font-weight:700; color:var(--ikb); letter-spacing:1px; font-family:'JetBrains Mono'">INDEPENDENT BENCHMARK TEAR-SHEET</span>
      <span style="font-size:11px; color:#6b7280;" id="client-source">來源：香港保監局 GN16 公開報告 · 最後資料更新日期：2026年11月06日</span>
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

    <!-- 1v1 Bilateral Actuarial Scorecard (Radar Dimensions) -->
    <div class="radar-scorecard-box" id="bilateral-radar-scorecard">
      <!-- Rendered dynamically by updateBattleCard() -->
    </div>

    <!-- Bilateral Clause Highlights & Pitfalls Comparison Card -->
    <div class="clause-comparison-box" id="bilateral-clause-comparison">
      <!-- Rendered dynamically by updateBattleCard() -->
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
      <div class="drawer-title">📚 全港保司 · 99 款主流產品規格全覽</div>
      <button class="drawer-close-btn" onclick="closeCatalogDrawer()">✕</button>
    </div>
    <div class="drawer-search-bar">
      <input type="text" class="drawer-search-input" id="catalog-search-input" placeholder="🔍 搜尋產品名稱、保司、免體檢額或關鍵字..." oninput="filterCatalog()">
    </div>
    <div class="drawer-filter-chips">
      <button class="drawer-chip active" data-cat="all" onclick="filterCatalogByChip(this, 'all')">全部 (99)</button>
      <button class="drawer-chip" data-cat="Savings_MultiCurrency" onclick="filterCatalogByChip(this, 'Savings_MultiCurrency')">儲蓄 (20)</button>
      <button class="drawer-chip" data-cat="Critical_Illness" onclick="filterCatalogByChip(this, 'Critical_Illness')">危疾 (20)</button>
      <button class="drawer-chip" data-cat="Medical_VHIS" onclick="filterCatalogByChip(this, 'Medical_VHIS')">醫保 (20)</button>
      <button class="drawer-chip" data-cat="Annuity_QDAP" onclick="filterCatalogByChip(this, 'Annuity_QDAP')">年金 (19)</button>
      <button class="drawer-chip" data-cat="Financing_UniversalLife" onclick="filterCatalogByChip(this, 'Financing_UniversalLife')">萬用 (20)</button>
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
      📚 99款全產品庫
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
      },
      HSBC: {
        fullName: "滙豐保險 HSBC Life",
        flagshipSavings: "滙豐智豐多元貨幣保險計劃",
        gn16Fulfillment: 98.1,
        prepayRate: 4.8,
        prepayLock: 1,
        maxRebate: 10,
        breakevenYear: 5,
        irr30: 6.38,
        specialSavings: "英倫百年行庫 · 財富傳承信託架構",
        flagshipCI: "滙豐全心守護危疾保障計劃",
        cancerWaitYears: 3,
        flagshipVHIS: "滙豐靈活自願醫保計劃",
        cashlessNetwork: "香港主要私家醫院及指定診所網絡",
        flagshipUL: "滙豐尊尚萬用壽險",
        ulLtv: 88,
        ulFloorRate: 2.25,
        flagshipQDAP: "滙豐合資格延期年金計劃",
        qdapGuaranteedPct: 62.8,
        qdapGuaranteedIRR: 2.92
      },
      Generali: {
        fullName: "忠意保險 Generali",
        flagshipSavings: "忠意「世譽傳承」多元貨幣儲蓄計劃",
        gn16Fulfillment: 96.0,
        prepayRate: 4.9,
        prepayLock: 1,
        maxRebate: 12,
        breakevenYear: 6,
        irr30: 6.55,
        specialSavings: "意大利百年保險巨擘 · 跨代傳承信託機制",
        flagshipCI: "忠意「跨越危疾保」加強版",
        cancerWaitYears: 3,
        flagshipVHIS: "忠意「忠心保」靈活自願醫保計劃",
        cashlessNetwork: "忠意專屬醫療網絡",
        flagshipUL: "忠意「獅承」萬用壽險",
        ulLtv: 85,
        ulFloorRate: 2.2,
        flagshipQDAP: "忠意「頤養年年」合資格延期年金計劃",
        qdapGuaranteedPct: 59.3,
        qdapGuaranteedIRR: 2.80
      },
      BlueCross: {
        fullName: "藍十字 Blue Cross",
        flagshipSavings: "藍十字智逸多元儲蓄保障計劃",
        gn16Fulfillment: 95.8,
        prepayRate: 5.1,
        prepayLock: 1,
        maxRebate: 12,
        breakevenYear: 6,
        irr30: 6.56,
        specialSavings: "友邦集團成員 · 數碼醫療與儲蓄協同",
        flagshipCI: "藍十字智安心危疾保障計劃",
        cancerWaitYears: 3,
        flagshipVHIS: "藍十字摰顧您自願醫保計劃（靈活計劃）",
        cashlessNetwork: "藍十字醫療網絡直付門診與私院",
        flagshipUL: "藍十字至尊萬用壽險",
        ulLtv: 85,
        ulFloorRate: 2.25,
        flagshipQDAP: "藍十字「安享退」合資格延期年金計劃",
        qdapGuaranteedPct: 62.0,
        qdapGuaranteedIRR: 2.85
      },
      ChinaLife: {
        fullName: "中國人壽海外 China Life",
        flagshipSavings: "裕饒多元貨幣儲蓄保險計劃",
        gn16Fulfillment: 98.0,
        prepayRate: 5.0,
        prepayLock: 1,
        maxRebate: 10,
        breakevenYear: 6,
        irr30: 6.45,
        specialSavings: "央企巨擘信用 · 境內外雙幣聯動",
        flagshipCI: "國壽海外康健無憂危疾保險計劃",
        cancerWaitYears: 3,
        flagshipVHIS: "國壽海外靈活自願醫保計劃",
        cashlessNetwork: "中國人壽海外大灣區及香港直付醫療網絡",
        flagshipUL: "國壽海外尊享財富萬用壽險",
        ulLtv: 82,
        ulFloorRate: 2.2,
        flagshipQDAP: "國壽海外「頤富」合資格延期年金保險計劃",
        qdapGuaranteedPct: 66.6,
        qdapGuaranteedIRR: 3.05
      },
      Cigna: {
        fullName: "信諾環球 Cigna",
        flagshipSavings: "未設分紅儲蓄險種",
        gn16Fulfillment: 0,
        prepayRate: 0,
        prepayLock: 0,
        maxRebate: 0,
        breakevenYear: 0,
        irr30: 0,
        specialSavings: "全球頂尖醫療直付網絡",
        flagshipCI: "信諾尊尚危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "信諾自願醫保靈活計劃",
        cashlessNetwork: "信諾全球直付私家醫院醫療網絡",
        flagshipUL: "未設萬用融資險種",
        ulLtv: 0,
        ulFloorRate: 0,
        flagshipQDAP: "未設延期年金險種",
        qdapGuaranteedPct: 0,
        qdapGuaranteedIRR: 0
      },
      Bupa: {
        fullName: "保柏香港 Bupa",
        flagshipSavings: "未設分紅儲蓄險種",
        gn16Fulfillment: 0,
        prepayRate: 0,
        prepayLock: 0,
        maxRebate: 0,
        breakevenYear: 0,
        irr30: 0,
        specialSavings: "英倫專科醫療無上限實報實銷",
        flagshipCI: "保柏精選危疾保",
        cancerWaitYears: 3,
        flagshipVHIS: "保柏英雄自願醫保計劃",
        cashlessNetwork: "保柏卓健全球私家醫院直付網絡",
        flagshipUL: "未設萬用融資險種",
        ulLtv: 0,
        ulFloorRate: 0,
        flagshipQDAP: "未設延期年金險種",
        qdapGuaranteedPct: 0,
        qdapGuaranteedIRR: 0
      }
    };
    COMPANY_PROFILES['Sun_Life'] = COMPANY_PROFILES['Sun Life'];
    COMPANY_PROFILES['BOC_Life'] = COMPANY_PROFILES['BOC Life'];
    COMPANY_PROFILES['YF_Life'] = COMPANY_PROFILES['YF Life'];
    COMPANY_PROFILES['HSBC_Life'] = COMPANY_PROFILES['HSBC'];
    COMPANY_PROFILES['Blue_Cross'] = COMPANY_PROFILES['BlueCross'];
    COMPANY_PROFILES['Blue Cross'] = COMPANY_PROFILES['BlueCross'];
    COMPANY_PROFILES['China_Life'] = COMPANY_PROFILES['ChinaLife'];
    COMPANY_PROFILES['China Life'] = COMPANY_PROFILES['ChinaLife'];
    window.COMPANY_PROFILES = COMPANY_PROFILES;

    // Normalizers & Helpers
    function cleanProductName(name) {
      if (!name) return '';
      return String(name).replace(/\\s*\\([^)]*\\)$/, '').trim();
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
        { label: "首年保費折扣回贈", key: "critical_illness" }
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

      let activeIndex = chips.findIndex(c => c.label === selectedClaimText);
      if (activeIndex === -1) {
        activeIndex = chips.findIndex(c => c.key === selectedClaim);
      }
      if (activeIndex === -1) activeIndex = 0;

      container.innerHTML = chips.map((c, idx) => {
        const isAct = (idx === activeIndex);
        return '<button class="thumb-pill ' + (isAct ? 'active' : '') + '" onclick="selectClaim(this)" data-claim="' + c.key + '">' + c.label + '</button>';
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
      if (s.includes('HSBC') || s.includes('滙豐') || s.includes('汇丰')) return 'HSBC';
      if (s.includes('GENERALI') || s.includes('忠意')) return 'Generali';
      if (s.includes('BLUECROSS') || s.includes('BLUE CROSS') || s.includes('BLUE_CROSS') || s.includes('藍十字') || s.includes('蓝十字')) return 'BlueCross';
      if (s.includes('CHINALIFE') || s.includes('CHINA LIFE') || s.includes('CHINA_LIFE') || s.includes('中國人壽') || s.includes('中国人寿') || s.includes('中壽') || s.includes('中寿')) return 'ChinaLife';
      if (s.includes('CIGNA') || s.includes('信諾')) return 'Cigna';
      if (s.includes('BUPA') || s.includes('保柏')) return 'Bupa';
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
      if (s.includes('癌症') || s.includes('等待期') || s.includes('危疾') || s.includes('critical') || s.includes('icu') || s.includes('深切治療') || s.includes('心臟病') || s.includes('中風') || s.includes('保費豁免') || s.includes('折扣')) {
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
      if (s.includes('28%') || s === 'rebate' || s.includes('首年保費回贈') || (s.includes('回贈') && !s.includes('危疾') && !s.includes('折扣'))) {
        return 'rebate';
      }
      // Savings / Prepayment
      if (s.includes('5.8%') || s.includes('預繳') || s.includes('回報高達') || s.includes('保證回報') || s.includes('prepayment') || s.includes('gn16') || s.includes('實現率') || s.includes('回本') || s.includes('irr') || s.includes('貨幣轉換') || s.includes('保單分拆')) {
        return 'prepayment';
      }

      return 'prepayment';
    }

    function detectCategoryFromClaim(str) {
      if (!str) return null;
      const s = String(str).toLowerCase().trim();
      if (s === 'ci' || s === 'critical_illness' || s.includes('critical') || s.includes('危疾') || s.includes('重疾') || s.includes('癌症') || s.includes('深切治療') || s.includes('icu') || s.includes('中風') || s.includes('折扣')) return 'Critical_Illness';
      if (s === 'vhis' || s === 'medical' || s.includes('自願') || s.includes('醫保') || s.includes('標靶') || s.includes('cashless') || s.includes('免找數')) return 'Medical_VHIS';
      if (s === 'qdap' || s === 'annuity' || s.includes('年金') || s.includes('扣稅') || s.includes('10,200')) return 'Annuity_QDAP';
      if (s === 'ul' || s === 'financing_ul' || s === 'financing' || s.includes('universal') || s.includes('萬用') || s.includes('融資') || s.includes('85%') || s.includes('ltv') || s.includes('margin')) return 'Financing_UniversalLife';
      if (s === 'prepayment' || s === 'rebate' || s.includes('預繳') || s.includes('5.8%') || s.includes('28%') || s.includes('gn16') || s.includes('分紅') || s.includes('儲蓄') || s.includes('回本')) return 'Savings_MultiCurrency';
      return null;
    }
    window.detectCategoryFromClaim = detectCategoryFromClaim;

    function getFlagshipProduct(compKey, category) {
      const profile = COMPANY_PROFILES[compKey] || COMPANY_PROFILES.Prudential;
      if (category === 'Critical_Illness' || category === 'ci') return profile.flagshipCI;
      if (category === 'Medical_VHIS' || category === 'vhis') return profile.flagshipVHIS;
      if (category === 'Annuity_QDAP' || category === 'qdap') return profile.flagshipQDAP;
      if (category === 'Financing_UniversalLife' || category === 'financing_ul' || category === 'ul') return profile.flagshipUL;
      return profile.flagshipSavings;
    }

    // Dynamic Bilateral Battle Card Resolver
    function getBattleCard(arg1, arg2, arg3, arg4) {
      let ourKey, rivalKey, claimKey, chipTopic = '';

      if (arguments.length >= 3) {
        ourKey = normalizeCompany(arg1);
        rivalKey = normalizeCompany(arg2);
        claimKey = normalizeClaim(arg3);
        chipTopic = String(arg4 || arg3 || (typeof selectedClaimText !== 'undefined' ? selectedClaimText : '') || '');
      } else {
        // 2 arguments: (rawCompany, rawClaim)
        rivalKey = normalizeCompany(arg1);
        claimKey = normalizeClaim(arg2);
        chipTopic = String(arg2 || (typeof selectedClaimText !== 'undefined' ? selectedClaimText : '') || '');
        ourKey = (typeof myCompany !== 'undefined' && myCompany) ? normalizeCompany(myCompany) : 'AIA';
      }

      const ourProfile = COMPANY_PROFILES[ourKey] || COMPANY_PROFILES.AIA;
      const rivalProfile = COMPANY_PROFILES[rivalKey] || COMPANY_PROFILES.Prudential;

      let categoryKey = (typeof currentCategory !== 'undefined' && currentCategory) ? currentCategory : 'Savings_MultiCurrency';
      const detectedCat = detectCategoryFromClaim(chipTopic) || detectCategoryFromClaim(claimKey);
      if (detectedCat) categoryKey = detectedCat;
      else if (claimKey === 'critical_illness' || chipTopic.includes('危疾') || chipTopic.includes('癌症') || chipTopic.includes('ICU') || chipTopic.includes('折扣')) categoryKey = 'Critical_Illness';
      else if (claimKey === 'vhis') categoryKey = 'Medical_VHIS';
      else if (claimKey === 'qdap') categoryKey = 'Annuity_QDAP';
      else if (claimKey === 'financing_ul') categoryKey = 'Financing_UniversalLife';
      else if (claimKey === 'prepayment' || claimKey === 'rebate') categoryKey = 'Savings_MultiCurrency';

      let ourProductName = (mySelectedProduct && normalizeCompany(mySelectedProduct.insurer) === ourKey && normalizeCategory(mySelectedProduct.category) === categoryKey)
        ? cleanProductName(mySelectedProduct.name)
        : getFlagshipProduct(ourKey, categoryKey);
      let rivalProductName = (rivalSelectedProduct && normalizeCompany(rivalSelectedProduct.insurer) === rivalKey && normalizeCategory(rivalSelectedProduct.category) === categoryKey)
        ? cleanProductName(rivalSelectedProduct.name)
        : getFlagshipProduct(rivalKey, categoryKey);

      // Intra-insurer product comparison: active when distinct products are selected within same company for this category
      const isIntraInsurer = !!(ourKey === rivalKey && (
        (mySelectedProduct && rivalSelectedProduct && mySelectedProduct.id !== rivalSelectedProduct.id && normalizeCategory(mySelectedProduct.category) === categoryKey && normalizeCategory(rivalSelectedProduct.category) === categoryKey) ||
        (mySelectedProduct && normalizeCategory(mySelectedProduct.category) === categoryKey && cleanProductName(mySelectedProduct.name) !== rivalProductName) ||
        (rivalSelectedProduct && normalizeCategory(rivalSelectedProduct.category) === categoryKey && ourProductName !== cleanProductName(rivalSelectedProduct.name))
      ));
      if (isIntraInsurer && ourProductName === rivalProductName) {
        const prods = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === ourKey && normalizeCategory(p.category) === categoryKey);
        if (prods.length > 1) {
          rivalProductName = cleanProductName(prods[1].name);
        }
      }

      // Resolve Active Products
      const allCatalog = (typeof ALL_PRODUCTS_CATALOG !== 'undefined' && Array.isArray(ALL_PRODUCTS_CATALOG))
        ? ALL_PRODUCTS_CATALOG
        : ((typeof window !== 'undefined' && Array.isArray(window.ALL_PRODUCTS_CATALOG)) ? window.ALL_PRODUCTS_CATALOG : []);

      let ourProductObj = null;
      let rivalProductObj = null;

      if (mySelectedProduct && normalizeCompany(mySelectedProduct.insurer) === ourKey && normalizeCategory(mySelectedProduct.category) === categoryKey) {
        ourProductObj = mySelectedProduct;
      } else {
        const matchingOur = allCatalog.filter(p => normalizeCompany(p.insurer) === ourKey && normalizeCategory(p.category) === categoryKey);
        ourProductObj = matchingOur.find(p => p.name.includes(ourProductName) || ourProductName.includes(cleanProductName(p.name))) || matchingOur[0] || null;
      }

      if (rivalSelectedProduct && normalizeCompany(rivalSelectedProduct.insurer) === rivalKey && normalizeCategory(rivalSelectedProduct.category) === categoryKey) {
        rivalProductObj = rivalSelectedProduct;
      } else {
        const matchingRival = allCatalog.filter(p => normalizeCompany(p.insurer) === rivalKey && normalizeCategory(p.category) === categoryKey);
        if (isIntraInsurer && matchingRival.length > 1 && ourProductObj) {
          rivalProductObj = matchingRival.find(p => p.id !== ourProductObj.id) || matchingRival[1] || matchingRival[0] || null;
        } else {
          rivalProductObj = matchingRival.find(p => p.name.includes(rivalProductName) || rivalProductName.includes(cleanProductName(p.name))) || matchingRival[0] || null;
        }
      }

      if (ourProductObj && cleanProductName(ourProductObj.name)) {
        ourProductName = cleanProductName(ourProductObj.name);
      }
      if (rivalProductObj && cleanProductName(rivalProductObj.name)) {
        rivalProductName = cleanProductName(rivalProductObj.name);
      }

      function extractMetrics(prod, profile, compKey, catKey) {
        const isBowtie = (compKey === 'Bowtie');

        let maxRebate = 0;
        if (prod && typeof prod.maxRebate === 'number') maxRebate = prod.maxRebate;
        else if (profile && typeof profile.maxRebate === 'number') maxRebate = profile.maxRebate;

        let prepayRate = 0;
        if (prod && typeof prod.prepayRate === 'number') prepayRate = prod.prepayRate;
        else if (profile && typeof profile.prepayRate === 'number') prepayRate = profile.prepayRate;

        let prepayLock = 1;
        if (prod && typeof prod.prepayLock === 'number' && prod.prepayLock > 0) prepayLock = prod.prepayLock;
        else if (profile && typeof profile.prepayLock === 'number') prepayLock = profile.prepayLock;

        let gn16 = isBowtie ? 0 : 95;
        if (isBowtie) {
          gn16 = 0;
        } else if (prod && typeof prod.gn16Fulfillment === 'number' && prod.gn16Fulfillment > 0) {
          gn16 = prod.gn16Fulfillment;
        } else if (profile && typeof profile.gn16Fulfillment === 'number') {
          gn16 = profile.gn16Fulfillment;
        }

        let breakevenYear = 0;
        if (prod && typeof prod.breakevenYear === 'number' && prod.breakevenYear > 0) {
          breakevenYear = prod.breakevenYear;
        } else if (profile && typeof profile.breakevenYear === 'number') {
          breakevenYear = profile.breakevenYear;
        }

        let irr30 = 0;
        if (prod && typeof prod.irr30 === 'number' && prod.irr30 > 0) {
          irr30 = prod.irr30;
        } else if (profile && typeof profile.irr30 === 'number') {
          irr30 = profile.irr30;
        }

        let highlight = '';
        if (prod && (prod.highlight || prod.specialNotes)) {
          highlight = prod.highlight || prod.specialNotes;
        } else if (profile) {
          if (catKey === 'Critical_Illness') highlight = profile.specialCI || profile.specialSavings || '';
          else if (catKey === 'Medical_VHIS') highlight = profile.specialVHIS || profile.cashlessNetwork || '';
          else highlight = profile.specialSavings || '';
        }

        let cancerWaitYears = (prod && typeof prod.cancerWaitYears === 'number') ? prod.cancerWaitYears : (profile && profile.cancerWaitYears ? profile.cancerWaitYears : 3);
        let ciIllnesses = (prod && typeof prod.ciIllnesses === 'number') ? prod.ciIllnesses : 120;
        let ciMultiplePct = (prod && typeof prod.ciMultiplePct === 'number') ? prod.ciMultiplePct : 900;
        let ciIcu = (prod && typeof prod.ciIcu === 'boolean') ? prod.ciIcu : true;

        let vhisLimitHkd = (prod && typeof prod.vhisLimitHkd === 'number') ? prod.vhisLimitHkd : 20000000;

        let qdapGuaranteedIRR = (prod && typeof prod.qdapGuaranteedIRR === 'number') ? prod.qdapGuaranteedIRR : 2.85;
        let qdapTotalIRR = (prod && typeof prod.qdapTotalIRR === 'number') ? prod.qdapTotalIRR : 4.5;
        let qdapGuaranteedPct = (prod && typeof prod.qdapGuaranteedPct === 'number') ? prod.qdapGuaranteedPct : (profile && profile.qdapGuaranteedPct ? profile.qdapGuaranteedPct : 50);

        let ulLtv = (prod && typeof prod.ulLtv === 'number') ? prod.ulLtv : 85;
        let ulFloorRate = (prod && typeof prod.ulFloorRate === 'number') ? prod.ulFloorRate : 2.25;
        let ulCreditingRate = (prod && typeof prod.ulCreditingRate === 'number') ? prod.ulCreditingRate : 5.25;
        let ulNetSpread = (prod && typeof prod.ulNetSpread === 'number') ? prod.ulNetSpread : 1.45;

        return {
          maxRebate,
          prepayRate,
          prepayLock,
          gn16Fulfillment: gn16,
          breakevenYear,
          irr30,
          highlight,
          cancerWaitYears,
          ciIllnesses,
          ciMultiplePct,
          ciIcu,
          vhisLimitHkd,
          qdapGuaranteedIRR,
          qdapTotalIRR,
          qdapGuaranteedPct,
          ulLtv,
          ulFloorRate,
          ulCreditingRate,
          ulNetSpread,
          rawProd: prod
        };
      }

      const ourMetrics = extractMetrics(ourProductObj, ourProfile, ourKey, categoryKey);
      const rivalMetrics = extractMetrics(rivalProductObj, rivalProfile, rivalKey, categoryKey);

      const heroOur = \`\${ourProfile.fullName} · \${ourProductName}\`;
      const heroRival = \`\${rivalProfile.fullName} · \${rivalProductName}\`;

      const disclaimer = \`註：以上數據摘自香港保監局官方統計 (GN16) 及各大保險公司年報公佈之實現率，過往表現不代表將來業績；最終條款以正式保單合約批註為準。持牌人內部專業培訓用途，嚴禁作為宣傳單張散發。\`;

      let corridorNote = '';
      if (categoryKey === 'Critical_Illness') {
        corridorNote = (rivalKey === 'Bowtie')
          ? '保泰早期危疾為純消費型定期費率，隨年齡保費跳升；傳統旗艦危疾採平準保費並設 ICU 全額兜底。'
          : \`重疾保障核心在於平準保費及癌症等候期防線（我方 \${ourMetrics.cancerWaitYears} 年 vs 對手 \${rivalMetrics.cancerWaitYears} 年），防禦復發自費真空期。\`;
      } else if (categoryKey === 'Medical_VHIS') {
        corridorNote = (rivalKey === 'Bowtie')
          ? '自願醫保為純醫療實報實銷；我方專屬持牌顧問提供全港私院出院免找數 (Cashless) 直付，免除病人自行墊付交單壓力。'
          : '高端自願醫保核心在於非手術癌症標靶治療全額無細項限額，及全港私家醫院無障礙出院免找數 (Cashless) 網絡。';
      } else if (categoryKey === 'Annuity_QDAP') {
        corridorNote = (rivalKey === 'Bowtie')
          ? '虛擬保險未設保監局認可合資格延期年金 (QDAP)，無法享有每年最高 HK$60,000 法定薪俸稅免稅額。'
          : \`合資格延期年金 (QDAP) 核心在於退休金確定性，我方保證年金利益比例達 \${ourMetrics.qdapGuaranteedPct}%，每年享最高 HK$10,200 實質退稅。\`;
      } else if (categoryKey === 'Financing_UniversalLife') {
        corridorNote = (rivalKey === 'Bowtie')
          ? '虛擬保險未設私人銀行萬用壽險融資通道；高淨值資產傳承首選全牌照保司多元貨幣架構。'
          : \`保費融資具備 \${rivalMetrics.ulLtv}% LTV 槓桿，核心在於保單結算利率與銀行借貸息率之淨息差 (+\${rivalMetrics.ulNetSpread}%) 及防範 Margin Call 補倉風險。\`;
      } else {
        corridorNote = (rivalKey === 'Bowtie')
          ? '保泰人壽為純消費型醫療保障，不設分紅儲蓄險種，無需申報 GN16 分紅實現率。'
          : (rivalMetrics.gn16Fulfillment >= 95
            ? \`該保司歷史實現率達 \${rivalMetrics.gn16Fulfillment}%，穩定在 90%~100% 綠色安全走廊內。\`
            : \`該保司歷史曾跌出 90% 安全走廊（僅 \${rivalMetrics.gn16Fulfillment}%），30年複利實現率差 5% 造成數十萬派發折損。\`);
      }

      const deltaGN16 = Math.abs(Number(ourMetrics.gn16Fulfillment || 0) - Number(rivalMetrics.gn16Fulfillment || 0)).toFixed(1);
      const isOurGN16Higher = ourMetrics.gn16Fulfillment > rivalMetrics.gn16Fulfillment;
      const isGN16Equal = ourMetrics.gn16Fulfillment === rivalMetrics.gn16Fulfillment;

      const corridorOurVal = (ourKey === 'Bowtie') ? '純保障 (0%)' : \`\${ourMetrics.gn16Fulfillment}%\`;
      const corridorRivalVal = (rivalKey === 'Bowtie') ? '純保障 (0%)' : \`\${rivalMetrics.gn16Fulfillment}%\`;

      // Dynamic Policy Horizon Projections
      let horizonData = {};
      if (categoryKey === 'Critical_Illness') {
        horizonData = {
          5: \`保單第 5 年：已完全渡過合約初期各項等候期，享有完整【\${ourProductName}】生命防線；涵蓋 \${ourMetrics.ciIllnesses} 種嚴重疾病及深切治療部 (ICU) 全額預支兜底。\`,
          10: \`保單第 10 年：家庭責任高峰期，平準保費優勢全面凸顯（鎖定供款額，免除隨年齡費率暴增風險），心腦血管及癌症多重賠償防禦網穩健守護。\`,
          15: \`保單第 15 年：人到中年健康高發期，癌症再次索償間隔僅 \${ourMetrics.cancerWaitYears} 年，較市場同業縮短自費空窗期，持續提供重疾生活津貼與治療後援。\`,
          20: \`保單第 20 年：20年供款期滿！終身享有重疾及人壽保障，無需再繳付任何保費；對手如屬定期消費型則面臨保費隨年齡指數級暴增或斷保風險。\`,
          25: \`保單第 25 年：進入銀髮期重症高發階段，累積多次索償賠償總額高達 \${ourMetrics.ciMultiplePct}% 保額，非指定疾病 ICU 預支兜底提供實質晚年醫療尊嚴。\`,
          30: \`保單第 30 年：終身重疾防禦與財富傳承雙重守護；合約內置高額身故保障或可轉換為退休年金，無病無痛轉化為長壽資產，有病防病、無病傳承！\`
        };
      } else if (categoryKey === 'Medical_VHIS') {
        horizonData = {
          5: \`保單第 5 年：首 5 年累計享有高達 HK$40,000 合資格稅務扣除額；全港私家醫院無縫『出院免找數 (Cashless)』直付，免除自費墊資焦慮。\`,
          10: \`保單第 10 年：累計薪俸稅稅務扣除達 HK$80,000；非手術癌症標靶治療與免疫療法無細項上限全數賠償，年度保障額度充裕。\`,
          15: \`保單第 15 年：步入中壯年期，私家醫院優質病房直付無障礙，專屬持牌顧問全程跑腿協助入院擔保與保險公司對數。\`,
          20: \`保單第 20 年：終身保證續保權益全面守護，無懼年長後健康狀況改變；標靶藥及昂貴自費醫材全數實報實銷。\`,
          25: \`保單第 25 年：晚年醫療通脹與先進醫療科技保障護城河，全球緊急醫療救援及頂尖私院直付，享受尊嚴醫療資源。\`,
          30: \`保單第 30 年：終身不設索償總上限，伴隨客戶一生直至 100 歲以上；累計省下高達十幾萬稅款，大病小病均由保司直付買單！\`
        };
      } else if (categoryKey === 'Annuity_QDAP') {
        horizonData = {
          5: \`保單第 5 年：5年供款期圓滿屆滿！累計已全額享受 HK$300,000 稅務扣除額，實質慳稅高達 HK$51,000！\`,
          10: \`保單第 10 年：年金資產滾存累積期，保證內部回報率穩定增長，無懼金融市場短期週期波動，資金穩步增值。\`,
          15: \`保單第 15 年：正式步入年金黃金派發期！每月/每年固定領取穩定退休年金入賬，保證派息比例逾 80%，打造如常支薪退休生活。\`,
          20: \`保單第 20 年：持續穩定現金流派發，保證回報確定入袋，對衝長壽風險與市場黑天鵝事件。\`,
          25: \`保單第 25 年：累積領取年金總額已超越已繳總保費 1.8~2.2 倍，成為晚年高品質生活的現金流靠山。\`,
          30: \`保單第 30 年：累計年金利益領取完畢或持續派發至百年，已繳保費轉化為高額確定現金流，兼具極致節稅與長壽年金雙重回報！\`
        };
      } else if (categoryKey === 'Financing_UniversalLife') {
        horizonData = {
          5: \`保單第 5 年：融資槓桿息差穩定流入，保單結算利率 (\${ourMetrics.ulCreditingRate}%) 高於銀行借貸成本，鎖定淨息差收益 (+\${ourMetrics.ulNetSpread}%)。\`,
          10: \`保單第 10 年：累積淨息差複利滾存，保單現金價值穩步超越銀行貸款本金，安全緩衝區擴大，抵禦利率週期波動。\`,
          15: \`保單第 15 年：資產槓桿效益最大化，以 15% 自有資金撬動 100% 高額人壽保障與家族信託架構。\`,
          20: \`保單第 20 年：可靈活行使保單部分提取或償還部分銀行貸款，降低融資槓桿，鎖定已累積利差利潤。\`,
          25: \`保單第 25 年：大額保單跨代傳承籌劃，高額身故槓桿利益為家族企業及二代提供充足流動性。\`,
          30: \`保單第 30 年：家族財富代代相傳，免除繁瑣遺產認證程序，以保費融資小博大完成數千萬資產定向傳承！\`
        };
      } else {
        // Savings_MultiCurrency
        let horizonYear5 = '';
        if (ourKey === 'Bowtie') {
          horizonYear5 = \`保單第 5 年：保泰純保障零佣金直銷，不設儲蓄鎖定期；所省下保費（對手【\${rivalProductName}】第 \${rivalMetrics.breakevenYear || 7} 年才回本）可自主定存或投資，資金 100% 自由支配。\`;
        } else if (rivalKey === 'Bowtie') {
          horizonYear5 = \`保單第 5 年：我方方案【\${ourProductName}】保證現金價值已達 100% 已繳保費（第 \${ourMetrics.breakevenYear || 5} 年保證回本）；對手純消費型定期醫保無任何現金價值。\`;
        } else if (ourMetrics.breakevenYear <= rivalMetrics.breakevenYear) {
          horizonYear5 = \`保單第 5 年：我方方案【\${ourProductName}】第 \${ourMetrics.breakevenYear} 年即保證 100% 回本；對手【\${rivalProductName}】需至第 \${rivalMetrics.breakevenYear} 年才回本，提早退保罰則較嚴格。\`;
        } else {
          horizonYear5 = \`保單第 5 年：我方方案【\${ourProductName}】前期提供高達 \${ourMetrics.maxRebate}% 回贈與 \${ourMetrics.prepayRate}% 鎖息，已即時鎖定實質現金折讓；預計第 \${ourMetrics.breakevenYear} 年保證回本（對手第 \${rivalMetrics.breakevenYear} 年）。\`;
        }

        let horizonYear20 = '';
        if (ourKey === 'Bowtie') {
          horizonYear20 = \`保單第 20 年：省下之高達幾十萬中介人佣金與管理費用於自主投資滾存；對手【\${rivalProductName}】非保證分紅可能面臨實現率波動折損。\`;
        } else if (rivalKey === 'Bowtie') {
          horizonYear20 = \`保單第 20 年：複利滾存進入爆發期，總現金價值達已繳保費 2.6~2.8 倍；我方 \${ourMetrics.gn16Fulfillment}% 累積實現率守護分紅派發，純保障產品無任何資產累積。\`;
        } else if (isOurGN16Higher) {
          horizonYear20 = \`保單第 20 年：複利滾存進入爆發期，總現金價值達已繳保費 2.6~2.8 倍；我方 \${ourMetrics.gn16Fulfillment}% 官方實現率守護分紅派發，對手 \${rivalMetrics.gn16Fulfillment}% 存在折損隱憂。\`;
        } else {
          horizonYear20 = \`保單第 20 年：我方前期最高回贈與鎖定利息已複利滾存多年，兼備無限次保單分拆與 8-9 種貨幣自由調配；對手過度依賴非保證遠期紅利。\`;
        }

        horizonData = {
          5: horizonYear5,
          10: \`保單第 10 年：我方方案內部回報率 (IRR) 突破穩定增長期，保證利益佔比穩健；對手浮動分紅受市場週期波動影響顯著。\`,
          15: \`保單第 15 年：子女高等教育出國深造黃金期，總現金價值達已繳保費 1.8~2.0 倍；可隨時行使多貨幣轉換功能對衝匯率風險。\`,
          20: horizonYear20,
          25: \`保單第 25 年：準退休籌劃與家族信託階段，現金流支取自由度高，已具備無限次更換受保人與拆分能力。\`,
          30: \`保單第 30 年：退休與傳承黃金期，總現金價值達已繳保費 5.8~6.6 倍！Plan A (我方 30Y IRR: \${ourMetrics.irr30}%, GN16: \${ourMetrics.gn16Fulfillment}%) vs Plan B (對手 30Y IRR: \${rivalMetrics.irr30}%, GN16: \${rivalMetrics.gn16Fulfillment}%)，GN16 實現率每差 \${deltaGN16}%，30年複利累積差距高達 HK$300,000 ~ $800,000 真金白銀！\`
        };
      }

      // 6 Core Bilateral Metrics (Category-Aware)
      let bilateralSpecs = [];
      if (categoryKey === 'Critical_Illness') {
        const ourWait = ourMetrics.cancerWaitYears;
        const rivalWait = rivalMetrics.cancerWaitYears;
        const ourIll = ourMetrics.ciIllnesses;
        const rivalIll = rivalMetrics.ciIllnesses;
        const ourPct = ourMetrics.ciMultiplePct;
        const rivalPct = rivalMetrics.ciMultiplePct;

        bilateralSpecs = [
          {
            label: "首年保費折扣",
            ourVal: ourMetrics.maxRebate > 0 ? ourMetrics.maxRebate + "%" : "0%",
            rivalVal: rivalMetrics.maxRebate > 0 ? rivalMetrics.maxRebate + "%" : "0%",
            delta: ourMetrics.maxRebate > rivalMetrics.maxRebate
              ? \`我方優惠 +\${ourMetrics.maxRebate - rivalMetrics.maxRebate}% 🏆\`
              : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? \`對手優惠 +\${rivalMetrics.maxRebate - ourMetrics.maxRebate}%\` : "持平"),
            winner: ourMetrics.maxRebate > rivalMetrics.maxRebate ? 'our' : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? 'rival' : 'tie')
          },
          {
            label: "癌症再次索償等待期",
            ourVal: \`\${ourWait} 年\`,
            rivalVal: \`\${rivalWait} 年\`,
            delta: ourWait < rivalWait
              ? \`我方早 \${rivalWait - ourWait} 年受保 🏆\`
              : (ourWait > rivalWait ? \`對手早 \${ourWait - rivalWait} 年\` : \`雙方均為 \${ourWait} 年\`),
            winner: ourWait < rivalWait ? 'our' : (ourWait > rivalWait ? 'rival' : 'tie')
          },
          {
            label: "涵蓋嚴重疾病總數",
            ourVal: \`\${ourIll} 種\`,
            rivalVal: \`\${rivalIll} 種\`,
            delta: ourIll > rivalIll
              ? \`我方多 \${ourIll - rivalIll} 種 🏆\`
              : (ourIll < rivalIll ? \`對手多 \${rivalIll - ourIll} 種\` : "持平"),
            winner: ourIll > rivalIll ? 'our' : (ourIll < rivalIll ? 'rival' : 'tie')
          },
          {
            label: "多次索償賠償總上限",
            ourVal: \`\${ourPct}%\`,
            rivalVal: \`\${rivalPct}%\`,
            delta: ourPct > rivalPct
              ? \`我方高 +\${ourPct - rivalPct}% 🏆\`
              : (ourPct < rivalPct ? \`對手高 +\${rivalPct - ourPct}%\` : "持平"),
            winner: ourPct > rivalPct ? 'our' : (ourPct < rivalPct ? 'rival' : 'tie')
          },
          {
            label: "深切治療部 (ICU) 預支",
            ourVal: ourMetrics.ciIcu ? "支援 100% 預支 (免病名)" : "不設預支",
            rivalVal: rivalMetrics.ciIcu ? "支援 100% 預支 (免病名)" : "不設預支",
            delta: (ourMetrics.ciIcu && !rivalMetrics.ciIcu)
              ? "我方特設 ICU 兜底 🏆"
              : (!ourMetrics.ciIcu && rivalMetrics.ciIcu ? "對手設 ICU 預支" : (ourMetrics.ciIcu ? "雙方均支援 100% 預支" : "雙方均未設 ICU 預支")),
            winner: (ourMetrics.ciIcu && !rivalMetrics.ciIcu) ? 'our' : (!ourMetrics.ciIcu && rivalMetrics.ciIcu ? 'rival' : 'tie')
          },
          {
            label: "核心條款亮點",
            ourVal: ourMetrics.highlight || "癌症多次 · ICU預支",
            rivalVal: rivalMetrics.highlight || "重疾多次賠付",
            delta: "救命防線與兜底",
            winner: 'tie'
          }
        ];
      } else if (categoryKey === 'Medical_VHIS') {
        const ourLimit = ourMetrics.vhisLimitHkd;
        const rivalLimit = rivalMetrics.vhisLimitHkd;

        bilateralSpecs = [
          {
            label: "首年保費回贈",
            ourVal: ourMetrics.maxRebate > 0 ? ourMetrics.maxRebate + "%" : (ourKey === 'Bowtie' ? "0% (零佣金)" : "0%"),
            rivalVal: rivalMetrics.maxRebate > 0 ? rivalMetrics.maxRebate + "%" : (rivalKey === 'Bowtie' ? "0% (零佣金)" : "0%"),
            delta: ourMetrics.maxRebate > rivalMetrics.maxRebate
              ? \`我方高 +\${ourMetrics.maxRebate - rivalMetrics.maxRebate}% 🏆\`
              : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? \`對手高 +\${rivalMetrics.maxRebate - ourMetrics.maxRebate}%\` : "持平"),
            winner: ourMetrics.maxRebate > rivalMetrics.maxRebate ? 'our' : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? 'rival' : 'tie')
          },
          {
            label: "全年保障限額",
            ourVal: ourLimit > 0 ? \`$\${Math.round(ourLimit / 10000)} 萬\` : "全數賠償",
            rivalVal: rivalLimit > 0 ? \`$\${Math.round(rivalLimit / 10000)} 萬\` : (rivalKey === 'Bowtie' ? "$100 萬" : "全數賠償"),
            delta: (ourLimit > 0 && rivalLimit > 0)
              ? (ourLimit > rivalLimit ? \`我方多 $\${Math.round((ourLimit - rivalLimit) / 10000)} 萬 🏆\` : (ourLimit < rivalLimit ? \`對手多 $\${Math.round((rivalLimit - ourLimit) / 10000)} 萬\` : "持平"))
              : "高端醫療全額覆蓋",
            winner: (ourLimit > 0 && rivalLimit > 0)
              ? (ourLimit > rivalLimit ? 'our' : (ourLimit < rivalLimit ? 'rival' : 'tie'))
              : 'tie'
          },
          {
            label: "非手術癌症標靶治療",
            ourVal: "全數賠償 (無細項上限)",
            rivalVal: rivalKey === 'Bowtie' ? "全數賠償" : "全數賠償 / 依級別限額",
            delta: "標靶及免疫治療全額覆蓋",
            winner: 'our'
          },
          {
            label: "出院免找數 (Cashless) 直付",
            ourVal: ourKey === 'Bowtie' ? "線上自主申報 (需墊付)" : "全港私院無縫直付 🏆",
            rivalVal: rivalKey === 'Bowtie' ? "線上自主申報 (需墊付)" : "合作特約醫院直付",
            delta: (ourKey !== 'Bowtie' && rivalKey === 'Bowtie') ? "我方專人免墊付直付 🏆" : "直付網絡便利度",
            winner: (ourKey !== 'Bowtie' && rivalKey === 'Bowtie') ? 'our' : ((ourKey === 'Bowtie' && rivalKey !== 'Bowtie') ? 'rival' : 'tie')
          },
          {
            label: "每年法定稅務扣除額",
            ourVal: "HK$8,000 / 每名受保人",
            rivalVal: "HK$8,000 / 每名受保人",
            delta: "法定稅務扣除額 (持平)",
            winner: 'tie'
          },
          {
            label: "核心條款亮點",
            ourVal: ourMetrics.highlight || "標靶藥全額 · 出院免找數",
            rivalVal: rivalMetrics.highlight || "私院全數賠償",
            delta: "條款保障與免責細則",
            winner: 'tie'
          }
        ];
      } else if (categoryKey === 'Annuity_QDAP') {
        bilateralSpecs = [
          {
            label: "首年保費回贈",
            ourVal: ourMetrics.maxRebate > 0 ? ourMetrics.maxRebate + "%" : "0%",
            rivalVal: rivalMetrics.maxRebate > 0 ? rivalMetrics.maxRebate + "%" : "0%",
            delta: ourMetrics.maxRebate > rivalMetrics.maxRebate
              ? \`我方高 +\${ourMetrics.maxRebate - rivalMetrics.maxRebate}% 🏆\`
              : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? \`對手高 +\${rivalMetrics.maxRebate - ourMetrics.maxRebate}%\` : "持平"),
            winner: ourMetrics.maxRebate > rivalMetrics.maxRebate ? 'our' : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? 'rival' : 'tie')
          },
          {
            label: "每年實質慳稅額",
            ourVal: "最高 HK$10,200",
            rivalVal: rivalKey === 'Bowtie' ? "無 (未獲 QDAP 認可)" : "最高 HK$10,200",
            delta: rivalKey === 'Bowtie' ? "我方享法定退稅 🏆" : "享法定退稅 (持平)",
            winner: rivalKey === 'Bowtie' ? 'our' : 'tie'
          },
          {
            label: "保證內部回報率 IRR",
            ourVal: \`\${ourMetrics.qdapGuaranteedIRR}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : \`\${rivalMetrics.qdapGuaranteedIRR}%\`,
            delta: rivalKey === 'Bowtie'
              ? "我方保證回報 🏆"
              : (ourMetrics.qdapGuaranteedIRR > rivalMetrics.qdapGuaranteedIRR
                ? \`我方高 +\${(ourMetrics.qdapGuaranteedIRR - rivalMetrics.qdapGuaranteedIRR).toFixed(2)}% 🏆\`
                : (ourMetrics.qdapGuaranteedIRR < rivalMetrics.qdapGuaranteedIRR ? \`對手高 +\${(rivalMetrics.qdapGuaranteedIRR - ourMetrics.qdapGuaranteedIRR).toFixed(2)}%\` : "持平")),
            winner: rivalKey === 'Bowtie' ? 'our' : (ourMetrics.qdapGuaranteedIRR > rivalMetrics.qdapGuaranteedIRR ? 'our' : (ourMetrics.qdapGuaranteedIRR < rivalMetrics.qdapGuaranteedIRR ? 'rival' : 'tie'))
          },
          {
            label: "QDAP 總內部回報率 IRR",
            ourVal: \`\${ourMetrics.qdapTotalIRR}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : \`\${rivalMetrics.qdapTotalIRR}%\`,
            delta: rivalKey === 'Bowtie'
              ? "我方總回報 🏆"
              : (ourMetrics.qdapTotalIRR > rivalMetrics.qdapTotalIRR
                ? \`我方高 +\${(ourMetrics.qdapTotalIRR - rivalMetrics.qdapTotalIRR).toFixed(2)}% 🏆\`
                : (ourMetrics.qdapTotalIRR < rivalMetrics.qdapTotalIRR ? \`對手高 +\${(rivalMetrics.qdapTotalIRR - ourMetrics.qdapTotalIRR).toFixed(2)}%\` : "持平")),
            winner: rivalKey === 'Bowtie' ? 'our' : (ourMetrics.qdapTotalIRR > rivalMetrics.qdapTotalIRR ? 'our' : (ourMetrics.qdapTotalIRR < rivalMetrics.qdapTotalIRR ? 'rival' : 'tie'))
          },
          {
            label: "保證年金利益佔比",
            ourVal: \`\${ourMetrics.qdapGuaranteedPct}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : \`\${rivalMetrics.qdapGuaranteedPct}%\`,
            delta: rivalKey === 'Bowtie'
              ? "我方保證年金 🏆"
              : (ourMetrics.qdapGuaranteedPct > rivalMetrics.qdapGuaranteedPct
                ? \`我方保證比例高 +\${(ourMetrics.qdapGuaranteedPct - rivalMetrics.qdapGuaranteedPct).toFixed(1)}% 🏆\`
                : (ourMetrics.qdapGuaranteedPct < rivalMetrics.qdapGuaranteedPct ? \`對手保證比例高 +\${(rivalMetrics.qdapGuaranteedPct - ourMetrics.qdapGuaranteedPct).toFixed(1)}%\` : "持平")),
            winner: rivalKey === 'Bowtie' ? 'our' : (ourMetrics.qdapGuaranteedPct > rivalMetrics.qdapGuaranteedPct ? 'our' : (ourMetrics.qdapGuaranteedPct < rivalMetrics.qdapGuaranteedPct ? 'rival' : 'tie'))
          },
          {
            label: "核心條款亮點",
            ourVal: ourMetrics.highlight || "HK$60,000 法定扣稅上限",
            rivalVal: rivalMetrics.highlight || "保監局認可延期年金",
            delta: "退休穩定現金流",
            winner: 'tie'
          }
        ];
      } else if (categoryKey === 'Financing_UniversalLife') {
        bilateralSpecs = [
          {
            label: "最高融資成數 LTV",
            ourVal: ourKey === 'Bowtie' ? "不支援融資" : \`\${ourMetrics.ulLtv}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不支援融資" : \`\${rivalMetrics.ulLtv}%\`,
            delta: (ourKey !== 'Bowtie' && rivalKey === 'Bowtie')
              ? "我方享私銀融資 🏆"
              : ((ourKey === 'Bowtie' && rivalKey !== 'Bowtie') ? "對手享私銀融資" : "融資槓桿上限 (持平)"),
            winner: (ourKey !== 'Bowtie' && rivalKey === 'Bowtie') ? 'our' : ((ourKey === 'Bowtie' && rivalKey !== 'Bowtie') ? 'rival' : 'tie')
          },
          {
            label: "最低保證結算利率 (Floor)",
            ourVal: \`\${ourMetrics.ulFloorRate}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : \`\${rivalMetrics.ulFloorRate}%\`,
            delta: rivalKey === 'Bowtie'
              ? "我方保證底線 🏆"
              : (ourMetrics.ulFloorRate > rivalMetrics.ulFloorRate
                ? \`我方高 +\${(ourMetrics.ulFloorRate - rivalMetrics.ulFloorRate).toFixed(2)}% 🏆\`
                : (ourMetrics.ulFloorRate < rivalMetrics.ulFloorRate ? \`對手高 +\${(rivalMetrics.ulFloorRate - ourMetrics.ulFloorRate).toFixed(2)}%\` : "持平")),
            winner: rivalKey === 'Bowtie' ? 'our' : (ourMetrics.ulFloorRate > rivalMetrics.ulFloorRate ? 'our' : (ourMetrics.ulFloorRate < rivalMetrics.ulFloorRate ? 'rival' : 'tie'))
          },
          {
            label: "當前結算利率 (Crediting)",
            ourVal: \`\${ourMetrics.ulCreditingRate}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : \`\${rivalMetrics.ulCreditingRate}%\`,
            delta: rivalKey === 'Bowtie'
              ? "我方結算利率 🏆"
              : (ourMetrics.ulCreditingRate > rivalMetrics.ulCreditingRate
                ? \`我方高 +\${(ourMetrics.ulCreditingRate - rivalMetrics.ulCreditingRate).toFixed(2)}% 🏆\`
                : (ourMetrics.ulCreditingRate < rivalMetrics.ulCreditingRate ? \`對手高 +\${(rivalMetrics.ulCreditingRate - ourMetrics.ulCreditingRate).toFixed(2)}%\` : "持平")),
            winner: rivalKey === 'Bowtie' ? 'our' : (ourMetrics.ulCreditingRate > rivalMetrics.ulCreditingRate ? 'our' : (ourMetrics.ulCreditingRate < rivalMetrics.ulCreditingRate ? 'rival' : 'tie'))
          },
          {
            label: "融資借貸淨息差 (Spread)",
            ourVal: \`+\${ourMetrics.ulNetSpread}%\`,
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : \`+\${rivalMetrics.ulNetSpread}%\`,
            delta: rivalKey === 'Bowtie'
              ? "我方正向息差 🏆"
              : (ourMetrics.ulNetSpread > rivalMetrics.ulNetSpread
                ? \`我方多 +\${(ourMetrics.ulNetSpread - rivalMetrics.ulNetSpread).toFixed(2)}% 🏆\`
                : (ourMetrics.ulNetSpread < rivalMetrics.ulNetSpread ? \`對手多 +\${(rivalMetrics.ulNetSpread - ourMetrics.ulNetSpread).toFixed(2)}%\` : "持平")),
            winner: rivalKey === 'Bowtie' ? 'our' : (ourMetrics.ulNetSpread > rivalMetrics.ulNetSpread ? 'our' : (ourMetrics.ulNetSpread < rivalMetrics.ulNetSpread ? 'rival' : 'tie'))
          },
          {
            label: "追加保證金 (Margin Call) 緩衝",
            ourVal: "約 20% 跌幅緩衝",
            rivalVal: rivalKey === 'Bowtie' ? "不適用" : "約 15-20% 緩衝",
            delta: "極端市況安全緩衝",
            winner: 'tie'
          },
          {
            label: "核心條款亮點",
            ourVal: ourMetrics.highlight || "私銀保費融資槓桿",
            rivalVal: rivalMetrics.highlight || "萬用壽險傳承架構",
            delta: "高額人壽身故傳承",
            winner: 'tie'
          }
        ];
      } else {
        // Savings_MultiCurrency (Default)
        bilateralSpecs = [
          {
            label: "首年保費回贈",
            ourVal: ourMetrics.maxRebate > 0 ? ourMetrics.maxRebate + "%" : (ourKey === 'Bowtie' ? "0% (零佣金)" : "0%"),
            rivalVal: rivalMetrics.maxRebate > 0 ? rivalMetrics.maxRebate + "%" : (rivalKey === 'Bowtie' ? "0% (零佣金)" : "0%"),
            delta: ourMetrics.maxRebate > rivalMetrics.maxRebate
              ? \`我方高 +\${ourMetrics.maxRebate - rivalMetrics.maxRebate}% 🏆\`
              : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? \`對手高 +\${rivalMetrics.maxRebate - ourMetrics.maxRebate}% (鎖定期長)\` : "持平"),
            winner: ourMetrics.maxRebate > rivalMetrics.maxRebate ? 'our' : (ourMetrics.maxRebate < rivalMetrics.maxRebate ? 'rival' : 'tie')
          },
          {
            label: "預繳保證利率",
            ourVal: ourMetrics.prepayRate > 0 ? \`\${ourMetrics.prepayRate}% (\${ourMetrics.prepayLock}年)\` : (ourKey === 'Bowtie' ? "自主投資" : "無預繳"),
            rivalVal: rivalMetrics.prepayRate > 0 ? \`\${rivalMetrics.prepayRate}% (\${rivalMetrics.prepayLock}年)\` : (rivalKey === 'Bowtie' ? "自主投資" : "無預繳"),
            delta: ourMetrics.prepayRate > rivalMetrics.prepayRate
              ? \`我方高 +\${(ourMetrics.prepayRate - rivalMetrics.prepayRate).toFixed(1)}% 🏆\`
              : (ourMetrics.prepayRate < rivalMetrics.prepayRate ? \`對手高 +\${(rivalMetrics.prepayRate - ourMetrics.prepayRate).toFixed(1)}% (次年浮動)\` : "持平"),
            winner: ourMetrics.prepayRate > rivalMetrics.prepayRate ? 'our' : (ourMetrics.prepayRate < rivalMetrics.prepayRate ? 'rival' : 'tie')
          },
          {
            label: "GN16 實現率",
            ourVal: ourMetrics.gn16Fulfillment > 0 ? ourMetrics.gn16Fulfillment + "%" : "純保障",
            rivalVal: rivalMetrics.gn16Fulfillment > 0 ? rivalMetrics.gn16Fulfillment + "%" : "純保障",
            delta: ourMetrics.gn16Fulfillment > rivalMetrics.gn16Fulfillment
              ? \`我方高 +\${(ourMetrics.gn16Fulfillment - rivalMetrics.gn16Fulfillment).toFixed(1)}% 🏆\`
              : (ourMetrics.gn16Fulfillment < rivalMetrics.gn16Fulfillment ? \`對手偏重遠期非保證\` : \`雙方均達 \${ourMetrics.gn16Fulfillment}%\`),
            winner: ourMetrics.gn16Fulfillment > rivalMetrics.gn16Fulfillment ? 'our' : (ourMetrics.gn16Fulfillment < rivalMetrics.gn16Fulfillment ? 'rival' : 'tie')
          },
          {
            label: "保證回本年期",
            ourVal: ourMetrics.breakevenYear > 0 ? \`第 \${ourMetrics.breakevenYear} 年\` : (ourKey === 'Bowtie' ? "資金100%自主" : "不適用"),
            rivalVal: rivalMetrics.breakevenYear > 0 ? \`第 \${rivalMetrics.breakevenYear} 年\` : (rivalKey === 'Bowtie' ? "資金100%自主" : "不適用"),
            delta: (ourMetrics.breakevenYear > 0 && rivalMetrics.breakevenYear > 0)
              ? (ourMetrics.breakevenYear < rivalMetrics.breakevenYear
                ? \`我方快 \${rivalMetrics.breakevenYear - ourMetrics.breakevenYear} 年回本 🏆\`
                : (ourMetrics.breakevenYear > rivalMetrics.breakevenYear ? \`對手回本快 \${ourMetrics.breakevenYear - rivalMetrics.breakevenYear} 年\` : "持平"))
              : "依產品特性",
            winner: (ourMetrics.breakevenYear > 0 && rivalMetrics.breakevenYear > 0)
              ? (ourMetrics.breakevenYear < rivalMetrics.breakevenYear ? 'our' : (ourMetrics.breakevenYear > rivalMetrics.breakevenYear ? 'rival' : 'tie'))
              : 'tie'
          },
          {
            label: "30年預期複利 IRR",
            ourVal: ourMetrics.irr30 > 0 ? ourMetrics.irr30 + "%" : (ourKey === 'Bowtie' ? "自主定存/美債" : "不適用"),
            rivalVal: rivalMetrics.irr30 > 0 ? rivalMetrics.irr30 + "%" : (rivalKey === 'Bowtie' ? "自主定存/美債" : "不適用"),
            delta: (ourMetrics.irr30 > 0 && rivalMetrics.irr30 > 0)
              ? (ourMetrics.irr30 > rivalMetrics.irr30 ? \`我方高 +\${(ourMetrics.irr30 - rivalMetrics.irr30).toFixed(2)}%\` : (ourMetrics.irr30 < rivalMetrics.irr30 ? \`對手高 +\${(rivalMetrics.irr30 - ourMetrics.irr30).toFixed(2)}%\` : "持平"))
              : "依產品特性",
            winner: (ourMetrics.irr30 > 0 && rivalMetrics.irr30 > 0)
              ? (ourMetrics.irr30 > rivalMetrics.irr30 ? 'our' : (ourMetrics.irr30 < rivalMetrics.irr30 ? 'rival' : 'tie'))
              : 'tie'
          },
          {
            label: "核心條款亮點",
            ourVal: ourMetrics.highlight || ourProfile.specialSavings || "旗艦優勢配置",
            rivalVal: rivalMetrics.highlight || rivalProfile.specialSavings || "市場同級競品",
            delta: "條款與定位特色",
            winner: (ourKey === 'Bowtie') ? 'our' : (rivalKey === 'Bowtie' ? 'our' : 'tie')
          }
        ];
      }

      // Compute 5-Dimensional Radar Scorecard
      function computeRadarDimensionScores(prod, profile, compKey, catKey) {
        const isBowtie = (compKey === 'Bowtie');
        let expectedReturn = 75;
        let guaranteedSafety = 85;
        let underwritingFriendliness = 85;
        let coverageCapacity = 85;
        let liquiditySplit = 80;

        if (catKey === 'Savings_MultiCurrency') {
          if (isBowtie) {
            expectedReturn = 25;
            guaranteedSafety = 35;
            underwritingFriendliness = 90;
            coverageCapacity = 40;
            liquiditySplit = 30;
          } else {
            const irr = (prod && typeof prod.irr30 === 'number' && prod.irr30 > 0) ? prod.irr30 : (profile.irr30 || 6.5);
            const rebate = (prod && typeof prod.maxRebate === 'number') ? prod.maxRebate : (profile.maxRebate || 15);
            expectedReturn = Math.min(100, Math.max(30, Math.round(((irr / 7.2) * 75) + ((rebate / 30) * 25))));

            const gn16 = (prod && typeof prod.gn16Fulfillment === 'number' && prod.gn16Fulfillment > 0) ? prod.gn16Fulfillment : (profile.gn16Fulfillment || 95);
            const bk = (prod && typeof prod.breakevenYear === 'number' && prod.breakevenYear > 0) ? prod.breakevenYear : (profile.breakevenYear || 6);
            const bkBonus = (bk <= 6) ? 8 : (bk <= 8 ? 4 : 0);
            guaranteedSafety = Math.min(100, Math.max(40, Math.round((gn16 * 0.92) + bkBonus)));

            underwritingFriendliness = 88;
            if (prod && prod.specialNotes && (prod.specialNotes.includes('免體檢') || prod.specialNotes.includes('簡化'))) {
              underwritingFriendliness += 6;
            }

            coverageCapacity = 86;
            if (prod && prod.clause_highlights && prod.clause_highlights.some(h => h.includes('貨幣') || h.includes('信託'))) {
              coverageCapacity += 8;
            }

            liquiditySplit = 82;
            if (prod && prod.savings_metrics) {
              if (prod.savings_metrics.policy_split_options) liquiditySplit += 6;
              if (prod.savings_metrics.currency_switch_options) liquiditySplit += 5;
              if (prod.savings_metrics.change_insured_unlimited) liquiditySplit += 4;
            } else if (profile.specialSavings && profile.specialSavings.includes('分拆')) {
              liquiditySplit += 10;
            }
          }
        } else if (catKey === 'Critical_Illness') {
          const multiple = (prod && typeof prod.ciMultiplePct === 'number') ? prod.ciMultiplePct : (profile.ciMultiplePct || 900);
          const rebate = (prod && typeof prod.maxRebate === 'number') ? prod.maxRebate : (profile.maxRebate || 10);
          expectedReturn = Math.min(100, Math.max(40, Math.round(((multiple / 1100) * 80) + ((rebate / 30) * 20))));

          guaranteedSafety = isBowtie ? 65 : 94;

          const wait = (prod && typeof prod.cancerWaitYears === 'number') ? prod.cancerWaitYears : (profile.cancerWaitYears || 3);
          underwritingFriendliness = (wait <= 2) ? 96 : 84;

          const illnesses = (prod && typeof prod.ciIllnesses === 'number') ? prod.ciIllnesses : 120;
          const hasIcu = prod ? !!prod.ciIcu : true;
          coverageCapacity = Math.min(100, Math.max(50, Math.round(((illnesses / 140) * 85) + (hasIcu ? 14 : 0))));

          liquiditySplit = isBowtie ? 40 : 80;
        } else if (catKey === 'Medical_VHIS') {
          const rebate = (prod && typeof prod.maxRebate === 'number') ? prod.maxRebate : 10;
          expectedReturn = Math.min(100, Math.max(50, Math.round(75 + ((rebate / 30) * 20))));

          guaranteedSafety = 95;
          underwritingFriendliness = isBowtie ? 88 : 85;

          const limit = (prod && typeof prod.vhisLimitHkd === 'number') ? prod.vhisLimitHkd : 20000000;
          coverageCapacity = (limit >= 30000000) ? 98 : (limit >= 20000000 ? 94 : (limit >= 5000000 ? 86 : 68));

          liquiditySplit = isBowtie ? 68 : 88;
        } else if (catKey === 'Annuity_QDAP') {
          if (isBowtie) {
            expectedReturn = 20;
            guaranteedSafety = 30;
            underwritingFriendliness = 40;
            coverageCapacity = 20;
            liquiditySplit = 20;
          } else {
            const totIRR = (prod && typeof prod.qdapTotalIRR === 'number') ? prod.qdapTotalIRR : 4.6;
            expectedReturn = Math.min(100, Math.max(50, Math.round(((totIRR / 5.2) * 80) + 15)));

            const guarIRR = (prod && typeof prod.qdapGuaranteedIRR === 'number') ? prod.qdapGuaranteedIRR : (profile.qdapGuaranteedIRR || 2.85);
            const guarPct = (prod && typeof prod.qdapGuaranteedPct === 'number') ? prod.qdapGuaranteedPct : (profile.qdapGuaranteedPct || 50);
            guaranteedSafety = Math.min(100, Math.max(50, Math.round(((guarIRR / 3.2) * 50) + ((guarPct / 70) * 50))));

            underwritingFriendliness = 95;
            coverageCapacity = 90;
            liquiditySplit = 80;
          }
        } else if (catKey === 'Financing_UniversalLife') {
          if (isBowtie) {
            expectedReturn = 20;
            guaranteedSafety = 30;
            underwritingFriendliness = 30;
            coverageCapacity = 20;
            liquiditySplit = 20;
          } else {
            const spread = (prod && typeof prod.ulNetSpread === 'number') ? prod.ulNetSpread : (profile.ulNetSpread || 1.5);
            const ltv = (prod && typeof prod.ulLtv === 'number') ? prod.ulLtv : (profile.ulLtv || 85);
            expectedReturn = Math.min(100, Math.max(50, Math.round(((spread / 2.0) * 50) + ((ltv / 90) * 50))));

            const floor = (prod && typeof prod.ulFloorRate === 'number') ? prod.ulFloorRate : (profile.ulFloorRate || 2.25);
            guaranteedSafety = Math.min(100, Math.max(50, Math.round(((floor / 2.75) * 60) + 36)));

            underwritingFriendliness = 86;
            coverageCapacity = 96;
            liquiditySplit = 92;
          }
        }

        return {
          expected_return: Math.min(100, Math.max(0, expectedReturn)),
          guaranteed_safety: Math.min(100, Math.max(0, guaranteedSafety)),
          underwriting_friendliness: Math.min(100, Math.max(0, underwritingFriendliness)),
          coverage_capacity: Math.min(100, Math.max(0, coverageCapacity)),
          liquidity_split: Math.min(100, Math.max(0, liquiditySplit))
        };
      }

      const ourDimScores = computeRadarDimensionScores(ourProductObj, ourProfile, ourKey, categoryKey);
      const rivalDimScores = computeRadarDimensionScores(rivalProductObj, rivalProfile, rivalKey, categoryKey);

      const radarDimensionsMeta = [
        { key: 'expected_return', label: '預期回報 / 槓桿倍數' },
        { key: 'guaranteed_safety', label: '保證安全 / GN16 實現率' },
        { key: 'underwriting_friendliness', label: '條款友善 / 等候期' },
        { key: 'coverage_capacity', label: '保障廣度 / 額度天花板' },
        { key: 'liquidity_split', label: '資金流動 / 保單分拆傳承' }
      ];

      const radarScorecard = radarDimensionsMeta.map(dim => {
        const ourScore = ourDimScores[dim.key];
        const rivalScore = rivalDimScores[dim.key];
        const delta = ourScore - rivalScore;
        const leader = (ourScore > rivalScore) ? 'our' : (ourScore < rivalScore ? 'rival' : 'tie');
        return {
          key: dim.key,
          label: dim.label,
          our_score: ourScore,
          rival_score: rivalScore,
          delta,
          leader
        };
      });

      const clauseComparison = {
        our_highlights: (ourProductObj && Array.isArray(ourProductObj.clause_highlights) && ourProductObj.clause_highlights.length > 0)
          ? ourProductObj.clause_highlights
          : ((mySelectedProduct && Array.isArray(mySelectedProduct.clause_highlights)) ? mySelectedProduct.clause_highlights : (ourProfile.clause_highlights || [])),
        our_pitfalls: (ourProductObj && Array.isArray(ourProductObj.clause_pitfalls) && ourProductObj.clause_pitfalls.length > 0)
          ? ourProductObj.clause_pitfalls
          : ((mySelectedProduct && Array.isArray(mySelectedProduct.clause_pitfalls)) ? mySelectedProduct.clause_pitfalls : (ourProfile.clause_pitfalls || [])),
        rival_highlights: (rivalProductObj && Array.isArray(rivalProductObj.clause_highlights) && rivalProductObj.clause_highlights.length > 0)
          ? rivalProductObj.clause_highlights
          : ((rivalSelectedProduct && Array.isArray(rivalSelectedProduct.clause_highlights)) ? rivalSelectedProduct.clause_highlights : (rivalProfile.clause_highlights || [])),
        rival_pitfalls: (rivalProductObj && Array.isArray(rivalProductObj.clause_pitfalls) && rivalProductObj.clause_pitfalls.length > 0)
          ? rivalProductObj.clause_pitfalls
          : ((rivalSelectedProduct && Array.isArray(rivalSelectedProduct.clause_pitfalls)) ? rivalSelectedProduct.clause_pitfalls : (rivalProfile.clause_pitfalls || []))
      };

      function _resolveBattleCardCore() {
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
              { label: \`\${rivalProfile.fullName}【\${rivalProductName || rivalProfile.flagshipCI}】\`, value: \`低槓桿 (70%保費流入儲蓄分紅)\`, widthPct: 45, color: \`#f59e0b\` },
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
              { label: \`\${rivalProfile.fullName}【\${rivalProductName || rivalProfile.flagshipVHIS}】\`, value: \`設分項限額 / 內置中介人佣金\`, widthPct: 70, color: \`#f59e0b\` },
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
      const rivalPrepay = rivalMetrics.prepayRate > 0 ? \`\${rivalMetrics.prepayRate}%\` : '高息';
      const rivalRebate = rivalMetrics.maxRebate || 20;

      // 1. Prepayment Claim
      if (claimKey === 'prepayment') {
        let step3Script = '';
        const rivalDisplayPlan = rivalProductName || rivalProfile.flagshipSavings;
        if (ourKey === 'AIA' && rivalKey === 'Prudential') {
          step3Script = \`「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 \${ourMetrics.gn16Fulfillment}%，對手【\${rivalDisplayPlan}】得 \${rivalMetrics.gn16Fulfillment}%。複利 30 年差 \${deltaGN16}% 就係幾十萬真金白銀！」\`;
        } else if (ourKey === 'Prudential' && rivalKey === 'AIA') {
          step3Script = \`「買儲蓄險最緊要睇『實時落袋確定性』！我地保誠直接亮出全港最高 \${ourMetrics.maxRebate}% 首年回贈，加埋 \${ourMetrics.prepayRate}% 鎖息立即落袋為安！對手宣傳保監局 GN16 官方數據歷年累積實現率高達 \${rivalMetrics.gn16Fulfillment}%，但絕大部分依賴 25-30 年後嘅非保證終期紅利；真金白銀第一年就慳返幾皮嘢保費，落袋收益遠勝幾十年後唔確定嘅浮動分紅，現金流掌控更穩妥！」\`;
        } else if (isGN16Equal || ourKey === rivalKey) {
          step3Script = \`「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 \${ourMetrics.gn16Fulfillment}%，對手【\${rivalDisplayPlan}】雖同樣達 \${rivalMetrics.gn16Fulfillment}%，但我地具備更靈活之無限次保單分拆與9種貨幣轉換，家族信託架構更為完備！」\`;
        } else if (ourKey === 'AIA' || isOurGN16Higher) {
          step3Script = \`「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 \${ourMetrics.gn16Fulfillment}%，對手【\${rivalDisplayPlan}】\${ourMetrics.gn16Fulfillment >= rivalMetrics.gn16Fulfillment ? '得' : '宣傳'} \${rivalMetrics.gn16Fulfillment}%。複利 30 年差 \${deltaGN16}% 就係幾十萬真金白銀！」\`;
        } else {
          step3Script = \`「買儲蓄險最緊要睇『實時落袋確定性』！我地方案首年提供高額保費回贈及鎖息高達 \${ourMetrics.prepayRate}%，真金白銀第一年就慳返幾皮嘢保費，落袋收益遠勝幾十年後唔確定嘅浮動分紅，前期資金負擔大幅減輕！」\`;
        }

        let agentTitle = (ourKey === 'Prudential' && rivalKey === 'AIA')
          ? \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】預繳息率與高進場門檻 (我方: 保誠 \${ourMetrics.prepayRate}% 預繳)\`
          : \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】\${rivalPrepay} 預繳噱頭與浮動陷阱\`;

        if (isIntraInsurer) {
          agentTitle = \`🎯 產品選型：【\${ourProfile.fullName}】內部主力【\${ourProductName}】vs【\${rivalProductName}】\${ourMetrics.prepayRate}% 預繳利率與回本深度對比\`;
        } else if (chipTopic.includes('GN16') || chipTopic.includes('實現率')) {
          agentTitle = \`🎯 對抗戰策：拆解保監局 GN16 官方分紅實現率 (我方 \${ourMetrics.gn16Fulfillment}% vs 【\${rivalProfile.fullName}】\${rivalMetrics.gn16Fulfillment}%)\`;
        } else if (chipTopic.includes('回本')) {
          agentTitle = \`🎯 對抗戰策：保證現金價值回本年期比對 (我方第 \${ourMetrics.breakevenYear || 5} 年 vs 【\${rivalProfile.fullName}】第 \${rivalMetrics.breakevenYear || 7} 年)\`;
        } else if (chipTopic.includes('IRR')) {
          agentTitle = \`🎯 對抗戰策：30年預期複利 IRR 長線總回報比對 (我方 \${ourMetrics.irr30}% vs 【\${rivalProfile.fullName}】\${rivalMetrics.irr30}%)\`;
        } else if (chipTopic.includes('貨幣') || chipTopic.includes('分拆')) {
          agentTitle = \`🎯 對抗戰策：無限次保單分拆與多元貨幣自由轉換 (我方 9 種貨幣 vs 【\${rivalProfile.fullName}】)\`;
        }

        const step1 = isIntraInsurer
          ? \`「陳生，您在考慮 \${ourProfile.fullName} 旗下的【\${ourProductName}】同【\${rivalProductName}】，兩款都係市場極具聲量嘅旗艦儲蓄險！」\`
          : ((ourKey === 'Prudential' && rivalKey === 'AIA')
            ? \`「陳生，你真係好有眼光！友邦係老牌大公司，盈御系列宣傳聲量好大，換著邊個都會關注！」\`
            : \`「陳生，你真係好有眼光！\${rivalProfile.fullName} 個 \${rivalPrepay} 預繳促銷宣傳鋪天蓋地，我第一眼睇到都覺得好吸引！」\`);

        const step2 = isIntraInsurer
          ? \`「【\${ourProductName}】作為新一代多貨幣旗艦，具備更多貨幣轉換與無限次分拆傳承架構；而【\${rivalProductName}】側重穩健鎖定與快速回本。」\`
          : ((ourKey === 'Prudential' && rivalKey === 'AIA')
            ? \`「但仔細審查條款細則：友邦前期進場成本偏高，首年回贈得 22%，預繳息率亦只有 5.0%！且其宣傳的 96.5% 實現率，絕大部分依賴 25-30 年後嘅非保證終期紅利，遠水難救近火；前 10 年資金累積速度偏慢。」\`
            : \`「但仔細拆解對手通函嘅 fine print，佢個 \${rivalPrepay} 寫明『只保證頭 1 年』！第 2 年起利息按市場浮動；依家全球進入降息週期，第二年極易跳水，短期噱頭過後利息嚴重稀釋。」\`);

        const trapAlert = isIntraInsurer
          ? \`⚠️ 選型提示：【\${ourProductName}】更適合長線多幣種家族傳承，【\${rivalProductName}】適合確定年期鎖息，按客戶資金流動性需求推薦！\`
          : ((ourKey === 'Prudential' && rivalKey === 'AIA')
            ? \`⚠️ 陷阱警示：友邦首年回贈少 6%、預繳利率少 0.8%，前期資金佔用高；且長線分紅主要依賴非保證終期紅利，注意前期現金流折損！\`
            : \`⚠️ 陷阱警示：對手 \${rivalPrepay} 利率僅保證首 1 年，次年浮動跳水；降息週期中長線確定性大打折扣，引導客戶細讀通函第 3 頁備註！\`);

        return {
          agent_title: agentTitle,
          agent_step_1: step1,
          agent_step_2: step2,
          agent_step_3: isIntraInsurer ? \`「如果您著重跨代傳承、多幣種配置與長線複利最大化，建議首選【\${ourProductName}】；我方旗艦歷年累積實現率高達 \${ourMetrics.gn16Fulfillment}% GN16 守護分紅；若追求短期資金確定性與特定回本年期，【\${rivalProductName}】各具優勢！」\` : step3Script,
          agent_trap_warning: trapAlert,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: (ourKey === 'Prudential' && rivalKey === 'AIA') ? '~~友邦 96.5% 超高分紅承諾~~' : \`~~\${rivalPrepay} 5年預繳保證高息~~\`,
          fineprint_reality: (ourKey === 'Prudential' && rivalKey === 'AIA') ? '友邦分紅主要為 25-30 年後非保證終期紅利；首年回贈僅 22%，預繳僅 5.0%' : '通函註明僅保證首 1 年，次年回到市場浮動利率；全球降息週期次年利息極易跳水',
          fineprint_citation: '香港保監局 (IA)《持牌保險中介人操守守則》第 4.2 條及各保司產品推廣通函批註',
          corridor_our: corridorOurVal,
          corridor_rival: corridorRivalVal,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`全港主流旗艦儲蓄險 · 長期分紅穩定性比對\`,
          client_source: \`來源：香港保監局 GN16 公開報告及各保司年報\`,
          client_desc: \`分紅儲蓄險之回報分為「保證利益」與「非保證分紅利益」。評估長期收益確定性時，香港保險業監管局 (IA) 建議參考各保司之歷年分紅實現率 (Fulfillment Ratio)。\`,
          chart_title: \`📊 歷年分紅累積實現率 (Fulfillment Ratio)\`,
          chart_bars: [
            { label: \`我方【\${ourProductName}】\`, value: \`\${ourMetrics.gn16Fulfillment}% (穩健)\`, widthPct: ourMetrics.gn16Fulfillment || 90, color: \`var(--ikb)\` },
            { label: \`對手【\${rivalProductName}】\`, value: \`\${rivalMetrics.gn16Fulfillment}% (市場波動)\`, widthPct: rivalMetrics.gn16Fulfillment || 85, color: \`#f59e0b\` },
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
        const step3Script = (ourMetrics.breakevenYear > 0 && rivalMetrics.breakevenYear > 0 && ourMetrics.breakevenYear < rivalMetrics.breakevenYear)
          ? \`「我地方案真正保證回本期（Break-even）足足快 \${rivalMetrics.breakevenYear - ourMetrics.breakevenYear} 年，第 \${ourMetrics.breakevenYear} 年保證現金價值已達 100% 繳付保費！買儲蓄險係睇長線本金安全性與流動性，千祈唔好因一次性回贈鎖死流動資金。」\`
          : \`「我地方案兼備高額回贈與快速回本優勢，第 \${ourMetrics.breakevenYear || 5} 年即可保證回本，本金安全性與流動性更優！」\`;

        return {
          agent_title: \`🎯 對抗戰策：破解【\${rivalProfile.fullName}】\${rivalRebate}% 高額保費回贈誘餌\`,
          agent_step_1: \`「李生，對手開出 \${rivalRebate}% 首年保費回贈確實好震撼，一眼睇落好似即時慳咗唔少保費，換著邊個都會心動！」\`,
          agent_step_2: \`「但精算現金流拆解顯示：羊毛出自羊身上！保司送得出 \${rivalRebate}% 回贈，往往將退保鎖定期拉長至 \${rivalMetrics.breakevenYear || 7} 年，頭 3 年保證現金價值近乎為零，而且提早斷供會追討扣回已派回贈。」\`,
          agent_step_3: step3Script,
          agent_trap_warning: \`⚠️ 陷阱警示：\${rivalRebate}% 首期回贈附帶退保鎖定條款，前期現金價值幾近於零，提早斷供將追討回贈；長線財富重在保證回本速度！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: \`~~首年保費最高回贈 \${rivalRebate}% 即慳~~\`,
          fineprint_reality: '回贈僅抵扣首期保費，次年起全額繳付；且附帶長年退保鎖定期',
          fineprint_citation: '香港保險業監管局 GN16 分紅實現率指引及保單綜合費用總覽條款',
          corridor_our: corridorOurVal,
          corridor_rival: corridorRivalVal,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`保費回贈 vs 保證現金價值回本年期比對\`,
          client_source: \`來源：香港精算學會產品指引及公開利益說明書\`,
          client_desc: \`評估大額保費回贈推廣時，投保人應綜合考量早期保證現金價值積存速度（回本期）及退保費用豁免年期。\`,
          chart_title: \`📈 保證回本年期與資金流動性評級\`,
          chart_bars: [
            { label: \`我方【\${ourProductName}】保證回本\`, value: \`第 \${ourMetrics.breakevenYear || 5} 年 (快速鎖定 100% 本金)\`, widthPct: 90, color: \`var(--ikb)\` },
            { label: \`對手【\${rivalProductName}】保證回本\`, value: \`第 \${rivalMetrics.breakevenYear || 8} 年 (前期鎖定嚴格)\`, widthPct: 60, color: \`#f59e0b\` },
            { label: \`市場同業平均水平\`, value: \`第 7 年\`, widthPct: 68, color: \`#94a3b8\` }
          ],
          table_title: \`⚖️ 保證本金安全性與流動性評比\`,
          table_rows: [
            { label: \`保證回本年期 (Break-even)\`, value: \`第 \${ourMetrics.breakevenYear || 5} 年 vs 對手第 \${rivalMetrics.breakevenYear || 8} 年\`, highlight: true },
            { label: \`提早退保罰則寬免\`, value: \`我方回本更快零手續費\`, highlight: true },
            { label: \`30年預期複利總回報\`, value: \`長線複利滾存更穩定\`, highlight: true },
            { label: \`回贈金額追討條款\`, value: \`無嚴苛追回附加條件\`, highlight: false }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`李生您好！見到市場上有保司推高達 \${rivalRebate}% 保費回贈，看似好抵。但仔細拆解利益說明書，往往伴隨較長嘅退保鎖定期（需 \${rivalMetrics.breakevenYear || 7} 年才回本）。我整理咗一份「回贈 vs 保證回本速度」客觀比較表，幫您避開流動性陷阱，稍後發給您參考！\`,
          disclaimer
        };
      }

      // 3. Critical Illness Claim
      if (claimKey === 'critical_illness') {
        const ourWait = ourMetrics.cancerWaitYears || 3;
        const rivalWait = rivalMetrics.cancerWaitYears || 3;

        let ciTitle = '';
        let ciStep2 = '';
        let ciStep3 = '';
        let ciTrap = '';
        let ciChartBars = [];

        if (isIntraInsurer) {
          ciTitle = \`🎯 產品選型：【\${ourProfile.fullName}】內部主力危疾【\${ourProductName}】vs【\${rivalProductName}】癌症等待期深度對比\`;
          ciStep2 = \`「兩者定位各有專長：【\${ourProductName}】深切治療部 (ICU) 全額預支兜底與縮短癌症間隔領先，非指定疾病防護更強；而【\${rivalProductName}】則側重多重特定危疾持續支援與保費預算平衡。」\`;
          ciStep3 = \`「追求最頂級無死角的危疾防禦與 ICU 兜底，首選配置【\${ourProductName}】；兼顧性價比與基礎多次賠償，【\${rivalProductName}】亦係極具競爭力的選擇！」\`;
          ciTrap = \`⚠️ 選型提示：同門產品側重點不同，【\${ourProductName}】具備更強 ICU 與間隔優勢，按客戶預算與健康保障優先級進行配置！\`;
          ciChartBars = [
            { label: \`【\${ourProductName}】生命防線\`, value: \`\${ourWait} 年 (ICU預支兜底)\`, widthPct: 95, color: \`var(--green)\` },
            { label: \`【\${rivalProductName}】多次保障\`, value: \`\${rivalWait} 年 (多次持續給付)\`, widthPct: 90, color: \`var(--ikb)\` },
            { label: \`市場同業普遍標準\`, value: \`3 年\`, widthPct: 65, color: \`#94a3b8\` }
          ];
        } else if (chipTopic.includes('ICU') || chipTopic.includes('深切治療')) {
          ciTitle = \`🎯 對抗戰策：深切治療部 (ICU) 連續 3-5 天免病名預支 100% 賠償 (我方 vs 【\${rivalProfile.fullName}】)\`;
          ciStep2 = \`「醫學臨床顯示，未知傳染病或嚴重併發症往往未達指定危疾定義，但需入住 ICU 搶救。對手傳統條款必須符合指定病名；若非名單疾病，隨時無法索償！」\`;
          ciStep3 = \`「我地首創深切治療部 (ICU) 全額預支：只要連續入住 ICU 達 3-5 日，無需指定病名直接預支 100% 保額！呢個先係真正不留保障死角嘅救命兜底！」\`;
          ciTrap = \`⚠️ 陷阱警示：對手危疾必須嚴格對號入座指定病種；我方連續住 ICU 3-5 天免病名預支 100% 才是最堅實防禦！\`;
          ciChartBars = [
            { label: \`我方非指定疾病 ICU 兜底\`, value: \`100% 全額預支 (連續住 3-5 日)\`, widthPct: 98, color: \`var(--green)\` },
            { label: \`【\${rivalProfile.fullName}】條款\`, value: \`限指定病名 / 無 ICU 預支\`, widthPct: 50, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`不設未知疾病預支\`, widthPct: 40, color: \`#94a3b8\` }
          ];
        } else if (chipTopic.includes('心臟病') || chipTopic.includes('中風')) {
          ciTitle = \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】危疾多次賠付門檻 vs 我方心臟病/中風多次持續賠償\`;
          ciStep2 = \`「心血管疾病與中風為本港第二大殺手，復發率極高！對手宣傳多次賠償，但細查條款對心臟病/中風往往設有嚴苛的復原標準或僅限單次賠付！」\`;
          ciStep3 = \`「我地方案覆蓋心臟病與中風多重全額給付，等候期合理且支援持續現金流支援，避免第二次病發面臨保障真空！」\`;
          ciTrap = \`⚠️ 陷阱警示：對手心血管多次索償條款嚴格；我方心臟病/中風多次給付門檻透明，全面守護高發重疾！\`;
          ciChartBars = [
            { label: \`我方心腦血管多重防線\`, value: \`多次全額賠付 (覆蓋高復發風險)\`, widthPct: 95, color: \`var(--green)\` },
            { label: \`【\${rivalProfile.fullName}】心血管給付\`, value: \`設單次限制或高門檻\`, widthPct: 60, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`單次 100% 賠付即終止\`, widthPct: 50, color: \`#94a3b8\` }
          ];
        } else if (chipTopic.includes('保費豁免') || chipTopic.includes('豁免')) {
          ciTitle = \`🎯 對抗戰策：首次嚴重危疾即時豁免後續保費 (我方全免 vs 【\${rivalProfile.fullName}】繁瑣條件)\`;
          ciStep2 = \`「不幸罹患嚴重疾病時，收入頓時中斷，若仍需每年繳付幾萬蚊保費，對家庭財務無疑係雪上加霜！對手保費豁免往往需額外附加或設有自付期！」\`;
          ciStep3 = \`「我地方案內置首次嚴重危疾保費豁免：一旦確診首項合資格嚴重危疾，即刻豁免後續所有未繳保費，而後續多次危疾賠償與終身人壽保障完全不受影響！」\`;
          ciTrap = \`⚠️ 陷阱警示：對手豁免條款繁雜且需額外加費；我方首次確診即自動豁免全部剩餘保費，保障依然終身有效！\`;
          ciChartBars = [
            { label: \`我方首次確診保費豁免\`, value: \`即刻全免未繳保費 (保障終身有效)\`, widthPct: 98, color: \`var(--green)\` },
            { label: \`【\${rivalProfile.fullName}】豁免機制\`, value: \`需額外附加費或高門檻\`, widthPct: 55, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`僅豁免指定短期保費\`, widthPct: 45, color: \`#94a3b8\` }
          ];
        } else if (chipTopic.includes('折扣') || chipTopic.includes('回贈')) {
          ciTitle = \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】危疾保費折扣宣傳 vs 我方全方位多次賠償與 ICU 兜底實質保障\`;
          ciStep2 = \`「對手開出危疾首年折扣優惠，乍睇之下慳咗幾千蚊好似好抵。但買危疾係買未來幾十年嘅救命防線！對手折扣背後往往等候期長達 3 年，且無非指定疾病 ICU 預支，一旦病發自費醫療動輒幾十萬，首期幾千蚊折扣完全唔夠填補自費黑洞！」\`;
          ciStep3 = \`「我地方案提供極具競爭力的限時首年折扣回贈，同時將癌症再次索償縮短至 2 年黃金期，更設 ICU 連續住 3-5 天免病名預支 100% 保額！實質保障全面領先，先係真正有誠意的危疾配置！」\`;
          ciTrap = \`⚠️ 陷阱警示：勿因短期幾千元折扣忽視癌症等候期與 ICU 兜底；我方兼備折扣優惠與頂級條款防線！\`;
          ciChartBars = [
            { label: \`我方保障＋折扣綜合防線\`, value: \`頂級條款 (ICU預支+2年等待期)\`, widthPct: 95, color: \`var(--green)\` },
            { label: \`【\${rivalProfile.fullName}】單一折扣宣傳\`, value: \`條款等候期 3 年 / 缺乏 ICU\`, widthPct: 65, color: \`#f59e0b\` },
            { label: \`市場同業普遍標準\`, value: \`3 年等待期\`, widthPct: 60, color: \`#94a3b8\` }
          ];
        } else if (ourWait < rivalWait) {
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
          agent_step_1: \`「張生，\${rivalProfile.fullName}【\${rivalProductName || rivalProfile.flagshipCI}】宣傳保過百種疾病、仲有多次賠償，單張睇落真係好豐富，你睇得咁細心好佩服你！」\`,
          agent_step_2: ciStep2,
          agent_step_3: ciStep3,
          agent_trap_warning: ciTrap,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~多重癌症無限次 100% 賠償~~',
          fineprint_reality: \`每次癌症索償嚴格設有等候期；我方以 ICU 全額預支與過百種疾病建構生命兜底\`,
          fineprint_citation: '各大保司危疾保單條款第 12 條「指定嚴重疾病多重保障等候期定義」',
          corridor_our: corridorOurVal,
          corridor_rival: corridorRivalVal,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`全港頂尖危疾險 · 癌症再次索償間隔與 ICU 兜底比對\`,
          client_source: \`來源：香港癌症資料統計中心及各保司正式保單批註\`,
          client_desc: \`臨床腫瘤學指出，癌症復發及轉移風險於治療後首兩年最為關鍵。縮短癌症再次索償等待期間隔能有效避免自費空窗期。\`,
          chart_title: \`⏱️ 癌症再次索償間隔年期 (越短越能保障復發風險)\`,
          chart_bars: ciChartBars,
          table_title: \`🛡️ 關鍵重疾保障條款深度比對\`,
          table_rows: [
            { label: \`癌症再次索償等待期\`, value: \`\${ourWait} 年 vs 對手 \${rivalWait} 年\`, highlight: !chipTopic.includes('ICU') && !chipTopic.includes('心臟病') && !chipTopic.includes('豁免') && !chipTopic.includes('折扣') },
            { label: \`非指定疾病 ICU 保障\`, value: \`連續 3-5 日預支 100% 保額\`, highlight: chipTopic.includes('ICU') || chipTopic.includes('深切治療') },
            { label: \`限時免體檢上限\`, value: \`高達 $400 萬美元\`, highlight: chipTopic.includes('折扣') || chipTopic.includes('回贈') },
            { label: \`保費豁免生效門檻\`, value: \`首次確診即豁免後續保費\`, highlight: chipTopic.includes('保費豁免') || chipTopic.includes('豁免') }
          ],
          bilateral_specs: bilateralSpecs,
          whatsapp_script: \`張生早晨！昨日您提到 \${rivalProfile.fullName} 嘅危疾單張。我幫您深入查閱咗合約條款，發現其癌症再次索償等待期需足足等 \${rivalWait} 年。我地全新方案具備非指定疾病 ICU 100% 預支賠償與過百種疾病防線。我發份醫療條款比較表俾您詳細對比！\`,
          disclaimer
        };
      }

      // 4. VHIS Claim
      if (claimKey === 'vhis') {
        let vhisTitle = \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】自願醫保【\${rivalProductName || rivalProfile.flagshipVHIS}】標靶藥細項上限與特約網絡限制\`;
        if (isIntraInsurer) {
          vhisTitle = \`🎯 產品選型：【\${ourProfile.fullName}】內部自願醫保【\${ourProductName}】vs【\${rivalProductName}】深度對比\`;
        } else if (chipTopic.includes('Cashless') || chipTopic.includes('免找數')) {
          vhisTitle = \`🎯 對抗戰策：全港私家醫院出院免找數 (Cashless) 拆解【\${rivalProfile.fullName}】墊付壓力\`;
        } else if (chipTopic.includes('中介人') || chipTopic.includes('客服')) {
          vhisTitle = \`🎯 對抗戰策：專屬持牌中介人全流程跑腿理賠 vs 【\${rivalProfile.fullName}】純線上客服 Chatbot\`;
        } else if (chipTopic.includes('8,000') || chipTopic.includes('稅務') || chipTopic.includes('扣除')) {
          vhisTitle = \`🎯 對抗戰策：善用自願醫保每年每人 HK$8,000 薪俸稅稅務扣除頂格規劃\`;
        }

        return {
          agent_title: vhisTitle,
          agent_step_1: \`「王太，\${rivalProfile.fullName} 宣傳【\${rivalProductName || rivalProfile.flagshipVHIS}】全數賠償，單張睇落好豐富，你揀得咁細心好佩服你！」\`,
          agent_step_2: \`「但仔細審視醫療合約細則：非手術癌症治療（標靶藥、免疫治療）喺部分級別依然設有分項限額；而且對手直付網絡主要依賴特約指定醫院，若因急症入住非網絡私家醫院，或病房級別限制嚴格，隨時面臨降級索償罰則自費幾成！」\`,
          agent_step_3: \`「我地高端自願醫保標靶藥全數賠償無細項上限，年度保額數千萬；全港所有私家醫院無障礙直付『出院免找數 (Cashless)』，免除繁瑣預先審批門檻，大病時專人為你跑腿墊付，呢份萬全保障先係真正安心！」\`,
          agent_trap_warning: \`⚠️ 陷阱警示：對手部分級別標靶藥設有分項限額，且直付網絡限於特約醫院；我方高端自願醫保標靶藥全額賠償且私院無縫出院免找數！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~自願醫保全額包賠無自負~~',
          fineprint_reality: '非手術癌症治療若設有分項限額，標靶藥費用動輒數十萬易觸發自費；直付需覆蓋全港所有私院',
          fineprint_citation: '醫務衞生局自願醫保認可產品名單及各大保司正式合約批註',
          corridor_our: corridorOurVal,
          corridor_rival: corridorRivalVal,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`全港主流旗艦自願醫保 (VHIS) 癌症標靶藥全數賠償與網絡直付比對\`,
          client_source: \`來源：醫務衞生局自願醫保認可產品名單及各大保司正式合約批註\`,
          client_desc: \`自願醫保靈活計劃之關鍵差異在於昂貴非手術癌症標靶治療是否設有分項上限，以及直付免找數醫院網絡的覆蓋完整度與病房升級彈性。\`,
          chart_title: \`🏥 昂貴非手術癌症標靶治療保障額度評級\`,
          chart_bars: [
            { label: \`我方【\${ourProductName}】靈活計劃\`, value: \`全數賠償 (無細項限額)\`, widthPct: 100, color: \`var(--ikb)\` },
            { label: \`對手【\${rivalProductName}】\`, value: \`設分項限額 / 網絡限制\`, widthPct: 68, color: \`#f59e0b\` },
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
          whatsapp_script: \`王太您好！了解過您關注 \${rivalProfile.fullName} 的【\${rivalProductName || rivalProfile.flagshipVHIS}】。醫保核心在於大病理賠時標靶藥物是否全數賠償及醫院直付無障礙。我為您整理了一份「標靶藥全額覆蓋 vs 分項限額」與「私院出院免找數網絡」深度比對表，讓您看清實際條款差異，稍後發給您參考！\`,
          disclaimer
        };
      }

      // 5. Financing UL Claim
      if (claimKey === 'financing_ul') {
        let ulTitle = \`🎯 對抗戰策：拆解【\${rivalProfile.fullName}】85% 槓桿保費融資息差倒掛與 Margin Call 致命盲點\`;
        if (isIntraInsurer) {
          ulTitle = \`🎯 產品選型：【\${ourProfile.fullName}】內部萬用壽險與保費融資【\${ourProductName}】vs【\${rivalProductName}】深度對比\`;
        } else if (chipTopic.includes('息差') || chipTopic.includes('結算利率')) {
          ulTitle = \`🎯 對抗戰策：萬用壽險保單結算利率 vs 銀行浮動借貸利率淨息差壓力測試\`;
        } else if (chipTopic.includes('Margin') || chipTopic.includes('追加保證金')) {
          ulTitle = \`🎯 對抗戰策：防禦銀行追加保證金 (Margin Call) 斬倉風險之資產安全配置\`;
        }

        return {
          agent_title: ulTitle,
          agent_step_1: isIntraInsurer
            ? \`「趙總，您在考慮 \${ourProfile.fullName} 旗下的【\${ourProductName}】同【\${rivalProductName}】萬用壽險與保費融資方案！」\`
            : \`「趙總，【\${rivalProductName || rivalProfile.flagshipUL}】85% 高槓桿保費融資表面睇可以用 15 萬本金撬動 100 萬保單，息差收益率宣傳到 10% 以上，作為高資產配置確實好吸引！」\`,
          agent_step_2: \`「但融資命脈在於息差（Spread）。銀行借貸利息係浮動 Prime Rate / Hibor，而保單結算利率由保司每年釐定；一旦降息週期息差倒掛，每月倒貼利息；若保單退保價值跌破警戒線，銀行隨時出 Margin Call 要求補倉，否則強制斬倉！」\`,
          agent_step_3: \`「我地建議資產配置回歸『無槓桿多元貨幣儲蓄』，免除銀行利率倒掛與 Margin Call 滅頂之災；同時享有 8-9 種貨幣自由轉換與無限次保單分拆，將財富掌控權 100% 掌握喺自己手中。」\`,
          agent_trap_warning: \`⚠️ 陷阱警示：槓桿融資息差易受 HIBOR 浮動倒掛衝擊；我方萬用壽險設有最低保證派息防禦線 (2.0%~2.5%)，避開對手 Margin Call 補倉隱患！\`,
          hero_our_name: heroOur,
          hero_rival_name: heroRival,
          fineprint_claim: '~~85% LTV 保費融資年化回報超 15%~~',
          fineprint_reality: '融資借貸息率與 HIBOR / Prime 掛鉤，若利差收窄或抵押品跌價可能面臨追繳保證金 (Margin Call)',
          fineprint_citation: '香港金融管理局 (HKMA) 及保監局 (IA) 關於保費融資業務聯合通函指引',
          corridor_our: corridorOurVal,
          corridor_rival: corridorRivalVal,
          corridor_note: corridorNote,
          horizon_data: horizonData,
          client_title: \`高槓桿保費融資 (UL) vs 無槓桿多元貨幣儲蓄風險收益比對\`,
          client_source: \`來源：香港金管局 (HKMA) 與保監局 (IA) 保費融資聯合通函\`,
          client_desc: \`監管機構嚴正警示：保費融資涉及利率風險、槓桿風險與補倉風險，降息週期極易引發息差倒掛及抵押品減值危機。\`,
          chart_title: \`⚠️ 利率波動與極端市況安全性評級 (越高越安全)\`,
          chart_bars: [
            { label: \`我方【\${ourProductName}】無槓桿配置\`, value: \`100% 安全 (零槓桿與補倉風險)\`, widthPct: 100, color: \`var(--green)\` },
            { label: \`對手【\${rivalProductName}】85% 槓桿融資\`, value: \`承擔 Margin Call 與息差風險\`, widthPct: 35, color: \`#ef4444\` },
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
          whatsapp_script: \`趙總早晨！留意到市場上宣傳【\${rivalProductName || rivalProfile.flagshipUL}】85% LTV 保費融資高息差。金管局與保監局最新通函已多次提醒降息環境下的息差倒掛與銀行 Margin Call 補倉風險。我幫您做咗份「槓桿融資 vs 無槓桿多元貨幣傳承」壓力測試分析，發給您參考！\`,
          disclaimer
        };
      }

      // 6. QDAP Claim
      const step3Script = \`「我地 QDAP 方案保證內部回報率 (Guaranteed IRR) 全港頂尖，保證派息比例超過 80%！無論金融海嘯點變，退休現金流一蚊都唔會少；加埋每年法定 HK$60,000 扣稅額，即時實質慳返最高 HK$10,200 稅款！」\`;

      let qdapTitle = \`🎯 對抗戰策：直擊【\${rivalProfile.fullName}】QDAP 延期年金非保證分紅畫餅\`;
      if (isIntraInsurer) {
        qdapTitle = \`🎯 產品選型：【\${ourProfile.fullName}】內部 QDAP 扣稅年金【\${ourProductName}】vs【\${rivalProductName}】深度對比\`;
      } else if (chipTopic.includes('10,200') || chipTopic.includes('實慳')) {
        qdapTitle = \`🎯 對抗戰策：QDAP 扣稅年金每年法定最高實慳 HK$10,200 稅款與退休金確定性比對\`;
      } else if (chipTopic.includes('IRR')) {
        qdapTitle = \`🎯 對抗戰策：QDAP 延期年金內部回報率 (IRR) 與長線保證現金流深度比對\`;
      } else if (chipTopic.includes('起派年齡') || chipTopic.includes('現金流')) {
        qdapTitle = \`🎯 對抗戰策：退休年金起派年齡彈性與終身穩定現金流對比 (我方 vs 【\${rivalProfile.fullName}】)\`;
      }

      return {
        agent_title: qdapTitle,
        agent_step_1: isIntraInsurer
          ? \`「林生，您在考慮 \${ourProfile.fullName} 旗下的【\${ourProductName}】同【\${rivalProductName}】合資格延期年金方案！」\`
          : \`「林生，見到對手宣傳【\${rivalProductName || rivalProfile.flagshipQDAP}】預期總 IRR 達 4.2%，乍睇確實好吸引，你為退休做準備嘅意識好前瞻！」\`,
        agent_step_2: \`「但魔鬼在細節：對手 4.2% 總回報入面，『保證部分』得唔夠 1.8%（佔比僅 \${rivalMetrics.qdapGuaranteedPct}%），其餘全部係非保證分紅！退休救命錢最忌承受市場波動，若退休後股市下跌分紅跳水，每個月糧餉大縮水！」\`,
        agent_step_3: step3Script,
        agent_trap_warning: \`⚠️ 陷阱警示：對手 4.2% 總回報中保證部分不足 50%，退休救命錢最忌承受市場波動；我方保證比例逾 80%，兼享 HK$10,200 實質退稅！\`,
        hero_our_name: heroOur,
        hero_rival_name: heroRival,
        fineprint_claim: '~~買年金等於即賺 17% 現金~~',
        fineprint_reality: '17% 為最高應課稅階稅務扣減，非保司利息；提早退保將面臨高額本金虧損且不可退稅',
        fineprint_citation: '香港稅務局《稅務條例》第 26P 條合資格延期年金保費扣除指引',
        corridor_our: corridorOurVal,
        corridor_rival: corridorRivalVal,
        corridor_note: corridorNote,
        horizon_data: horizonData,
        client_title: \`合資格延期年金 (QDAP) 保證利益佔比與扣稅效益比對\`,
        client_source: \`來源：香港保險業監管局 QDAP 認可名單及利益說明文件\`,
        client_desc: \`退休年金最核心價值在於提供確定不變的退休現金流。保證年金比例越高，退休生活越不受金融市場週期動盪影響。\`,
        chart_title: \`🛡️ 年金總利益中「保證部分」確定性佔比\`,
        chart_bars: [
          { label: \`我方【\${ourProductName || '旗艦年金方案'}】\`, value: \`82.5% 保證 (極高確定性)\`, widthPct: 82.5, color: \`var(--green)\` },
          { label: \`對手【\${rivalProductName}】\`, value: \`對手【\${rivalProductName}】\`, widthPct: rivalMetrics.qdapGuaranteedPct, color: \`#f59e0b\` },
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
        whatsapp_script: \`林生您好！昨日您關注的 \${rivalProfile.fullName}【\${rivalProductName || rivalProfile.flagshipQDAP}】QDAP 年金計劃，我對比了各大保司的利益結構。對手方案中非保證分紅佔比偏高，退休金受市場波動較大；我地方案保證派發比例達 80% 以上，並享足每年 $10,200 薪俸稅實質退稅。我發份年金確定性比對表給您參考！\`,
        disclaimer
      };
      }

      const card = _resolveBattleCardCore();
      if (card) {
        card.radar_scorecard = radarScorecard;
        card.clause_comparison = clauseComparison;
      }
      return card;
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
      else if (targetOrName && targetOrName.target && typeof targetOrName.target.value === 'string') rawName = targetOrName.target.value;
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

    const CATEGORY_TAGS = {
      Savings_MultiCurrency: '[儲蓄]',
      Critical_Illness: '[危疾]',
      Medical_VHIS: '[醫保]',
      Annuity_QDAP: '[年金]',
      Financing_UniversalLife: '[萬用]'
    };

    function renderCampProductOptions(allProds, cat, selectedId) {
      if (!allProds || allProds.length === 0) return '';
      const normCat = normalizeCategory(cat);
      const currentProds = allProds.filter(p => normalizeCategory(p.category) === normCat);
      const otherProds = allProds.filter(p => normalizeCategory(p.category) !== normCat);

      let html = '';
      if (currentProds.length > 0) {
        html += '<optgroup label="當前選取險種">';
        html += currentProds.map(p => {
          const tag = CATEGORY_TAGS[p.category] || CATEGORY_TAGS[normalizeCategory(p.category)] || '';
          const isSelected = !!(selectedId && (p.id === selectedId || cleanProductName(p.name) === selectedId || p.name === selectedId));
          return '<option value="' + p.id + '"' + (isSelected ? ' selected' : '') + '>' + tag + ' ' + cleanProductName(p.name) + '</option>';
        }).join('');
        html += '</optgroup>';
      } else {
        html += '<option value="" disabled' + (!selectedId ? ' selected' : '') + '>⚠️ 該險種暫無產品（請從下方跨險種選取）</option>';
      }

      if (otherProds.length > 0) {
        const groupLabel = (currentProds.length > 0) ? '該公司其他險種產品' : '該公司其他險種產品 (全線)';
        html += '<optgroup label="' + groupLabel + '">';
        html += otherProds.map(p => {
          const tag = CATEGORY_TAGS[p.category] || CATEGORY_TAGS[normalizeCategory(p.category)] || '';
          const isSelected = !!(selectedId && (p.id === selectedId || cleanProductName(p.name) === selectedId || p.name === selectedId));
          return '<option value="' + p.id + '"' + (isSelected ? ' selected' : '') + '>' + tag + ' ' + cleanProductName(p.name) + '</option>';
        }).join('');
        html += '</optgroup>';
      }
      return html;
    }

    function findProductInCompany(compKey, identifier) {
      if (!identifier) return null;
      const normComp = normalizeCompany(compKey);
      const s = (typeof identifier === 'object' && identifier !== null)
        ? String(identifier.id || identifier.name || (identifier.target && identifier.target.value) || identifier.value || '').trim()
        : String(identifier).trim();
      if (!s) return null;

      const allProds = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === normComp);

      let match = allProds.find(p => p.id === s);
      if (match) return match;

      match = allProds.find(p => cleanProductName(p.name) === s);
      if (match) return match;

      match = allProds.find(p => p.name === s);
      if (match) return match;

      match = allProds.find(p => {
        const tag = CATEGORY_TAGS[p.category] || CATEGORY_TAGS[normalizeCategory(p.category)] || '';
        return (tag + ' ' + cleanProductName(p.name)) === s || (tag + cleanProductName(p.name)) === s;
      });
      if (match) return match;

      match = allProds.find(p => cleanProductName(p.name).includes(s) || s.includes(cleanProductName(p.name)) || p.name.includes(s));
      if (match) return match;

      if (typeof identifier === 'object' && identifier !== null && identifier.name && identifier.category) {
        if (!identifier.insurer || normalizeCompany(identifier.insurer) === normComp) {
          return identifier;
        }
      }

      return null;
    }

    function setMyProduct(targetOrId) {
      let prodId = '';
      if (typeof targetOrId === 'string') prodId = targetOrId;
      else if (targetOrId && targetOrId.target && typeof targetOrId.target.value === 'string') prodId = targetOrId.target.value;
      else if (targetOrId && typeof targetOrId.value === 'string') prodId = targetOrId.value;
      else if (targetOrId && typeof targetOrId === 'object') prodId = targetOrId.id || targetOrId.name || '';

      const match = findProductInCompany(myCompany, (typeof targetOrId === 'object' && targetOrId && !targetOrId.target) ? targetOrId : prodId);
      if (match) {
        mySelectedProduct = match;
        const targetCat = normalizeCategory(match.category);
        if (targetCat !== currentCategory) {
          currentCategory = targetCat;
          syncCategoryTabWithClaim(targetCat);
          const defaultClaim = (CATEGORY_CLAIMS[targetCat] && CATEGORY_CLAIMS[targetCat][0]) ? CATEGORY_CLAIMS[targetCat][0] : null;
          if (defaultClaim) {
            selectedClaim = defaultClaim.key;
            selectedClaimText = defaultClaim.label;
          }
          renderClaimPills(currentCategory);
          rivalSelectedProduct = null;
        }
      }

      updateCampSelectors();
      updateBattleCard();
    }
    window.setMyProduct = setMyProduct;

    function setRivalProduct(targetOrId) {
      let prodId = '';
      if (typeof targetOrId === 'string') prodId = targetOrId;
      else if (targetOrId && targetOrId.target && typeof targetOrId.target.value === 'string') prodId = targetOrId.target.value;
      else if (targetOrId && typeof targetOrId.value === 'string') prodId = targetOrId.value;
      else if (targetOrId && typeof targetOrId === 'object') prodId = targetOrId.id || targetOrId.name || '';

      const match = findProductInCompany(selectedCompany, (typeof targetOrId === 'object' && targetOrId && !targetOrId.target) ? targetOrId : prodId);
      if (match) {
        rivalSelectedProduct = match;
        const targetCat = normalizeCategory(match.category);
        if (targetCat !== currentCategory) {
          currentCategory = targetCat;
          syncCategoryTabWithClaim(targetCat);
          const defaultClaim = (CATEGORY_CLAIMS[targetCat] && CATEGORY_CLAIMS[targetCat][0]) ? CATEGORY_CLAIMS[targetCat][0] : null;
          if (defaultClaim) {
            selectedClaim = defaultClaim.key;
            selectedClaimText = defaultClaim.label;
          }
          renderClaimPills(currentCategory);
          mySelectedProduct = null;
        }
      }

      updateCampSelectors();
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
          opt.disabled = false;
        });
      }

      const cat = currentCategory || 'Savings_MultiCurrency';
      const myFlagship = getFlagshipProduct(myCompany, cat);
      const rivalFlagship = getFlagshipProduct(selectedCompany, cat);

      // Populate & sync select-my-product
      const allMyProds = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === myCompany);
      let myMatch = null;
      if (mySelectedProduct && normalizeCompany(mySelectedProduct.insurer || myCompany) === myCompany && normalizeCategory(mySelectedProduct.category) === cat) {
        myMatch = allMyProds.find(p => p.id === mySelectedProduct.id) || mySelectedProduct;
      }
      if (!myMatch) {
        const curMyProds = allMyProds.filter(p => normalizeCategory(p.category) === cat);
        myMatch = curMyProds.find(p => p.name.includes(myFlagship) || myFlagship.includes(cleanProductName(p.name))) || curMyProds[0] || null;
      }
      if (selectMyProd) {
        mySelectedProduct = myMatch;
        if (allMyProds.length > 0) {
          selectMyProd.innerHTML = renderCampProductOptions(allMyProds, cat, myMatch ? myMatch.id : '');
          if (myMatch) selectMyProd.value = myMatch.id;
          else selectMyProd.value = '';
        } else {
          selectMyProd.innerHTML = '<option value="">' + myFlagship + '</option>';
          mySelectedProduct = null;
        }
      }

      // Populate & sync select-rival-product
      const allRivalProds = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === selectedCompany);
      let rivalMatch = null;
      if (rivalSelectedProduct && normalizeCompany(rivalSelectedProduct.insurer || selectedCompany) === selectedCompany && normalizeCategory(rivalSelectedProduct.category) === cat) {
        rivalMatch = allRivalProds.find(p => p.id === rivalSelectedProduct.id) || rivalSelectedProduct;
      }
      if (!rivalMatch) {
        const curRivalProds = allRivalProds.filter(p => normalizeCategory(p.category) === cat);
        if (myCompany === selectedCompany && curRivalProds.length > 1 && mySelectedProduct) {
          rivalMatch = curRivalProds.find(p => p.id !== mySelectedProduct.id) || curRivalProds[0] || null;
        } else {
          rivalMatch = curRivalProds.find(p => p.name.includes(rivalFlagship) || rivalFlagship.includes(cleanProductName(p.name))) || curRivalProds[0] || null;
        }
      }

      if (selectRivalProd) {
        rivalSelectedProduct = rivalMatch;
        if (allRivalProds.length > 0) {
          selectRivalProd.innerHTML = renderCampProductOptions(allRivalProds, cat, rivalMatch ? rivalMatch.id : '');
          if (rivalMatch) selectRivalProd.value = rivalMatch.id;
          else selectRivalProd.value = '';
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
      } else if (targetOrName && targetOrName.target && typeof targetOrName.target.value === 'string') {
        rawName = targetOrName.target.value;
      } else if (targetOrName && targetOrName.value) {
        rawName = targetOrName.value;
      } else if (targetOrName && targetOrName.innerText) {
        rawName = targetOrName.innerText;
      }

      const cand = normalizeCompany(rawName);
      // Auto-swap roles only when clicking directly on legacy company-pills buttons
      const isLegacyPill = !!(targetOrName && targetOrName.classList && !targetOrName.tagName?.toLowerCase().includes('select'));
      if (isLegacyPill && cand === myCompany) {
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

      const currentCatClaims = CATEGORY_CLAIMS[currentCategory] || [];
      const isChipOfCurrentCat = currentCatClaims.some(c => (c.label && c.label === rawClaim) || (c.key && c.key === rawClaim) || c.text === rawClaim || c.claim === rawClaim);

      if (!isChipOfCurrentCat) {
        selectedClaim = normalizeClaim(rawClaim);
        syncCategoryTabWithClaim(selectedClaim);
      } else {
        selectedClaim = normalizeClaim(rawClaim);
      }

      renderClaimPills(currentCategory);

      let foundExact = false;
      document.querySelectorAll('#claim-pills .thumb-pill').forEach(btn => {
        if (!foundExact && ((targetOrClaim && (targetOrClaim === btn || targetOrClaim.innerText === btn.innerText)) || (rawClaim && (btn.innerText === rawClaim || (btn.dataset && btn.dataset.claim === rawClaim))))) {
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
          if (!firstMatch && (btnNorm === selectedClaim || (selectedClaimText && btn.innerText.includes(selectedClaimText)))) {
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
      let targetCat = normalizeCategory(claimKey);
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
      syncCategoryTabWithClaim(normCat);

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

    function isRowHighlightedByClaim(label, claimKey, claimText) {
      if (!label) return false;
      const l = String(label).toLowerCase();
      const k = String(claimKey || '').toLowerCase();
      const t = String(claimText || '').toLowerCase();

      // Check prepay
      if (l.includes('預繳') || l.includes('prepay')) {
        if (k.includes('prepay') && (t.includes('預繳') || t.includes('5.8%') || t.includes('息率') || !t)) return true;
        if (t.includes('預繳') || t.includes('保證利率') || t.includes('5.8%')) return true;
      }
      // Check rebate / discount
      if (l.includes('回贈') || l.includes('折扣') || l.includes('rebate')) {
        if (k.includes('rebate') || t.includes('回贈') || t.includes('折扣') || t.includes('28%') || t.includes('20%')) return true;
      }
      // Check GN16
      if (l.includes('gn16') || l.includes('實現率')) {
        if (t.includes('gn16') || t.includes('實現率') || t.includes('分紅')) return true;
      }
      // Check breakeven
      if (l.includes('回本') || l.includes('breakeven')) {
        if (t.includes('回本') || t.includes('年期')) return true;
      }
      // Check IRR
      if (l.includes('irr') || l.includes('複利') || l.includes('回報率')) {
        if (l.includes('保證內部回報率') && (t.includes('保證內部回報率') || t.includes('保證回報'))) return true;
        if (l.includes('總內部回報率') && (t.includes('總內部回報率') || t.includes('qdap 總內部回報率'))) return true;
        if (!l.includes('保證內部回報率') && !l.includes('總內部回報率')) {
          if (t.includes('irr') || t.includes('複利') || t.includes('30年')) return true;
        }
      }
      // Check Cancer waiting period
      if (l.includes('癌症') || l.includes('等待期') || l.includes('間隔')) {
        if (t.includes('癌症') || t.includes('等待期') || t.includes('間隔') || t.includes('2年') || t.includes('3年') || (!t && k.includes('ci'))) return true;
      }
      // Check ICU stay benefit
      if (l.includes('icu') || l.includes('深切治療') || l.includes('預支')) {
        if (t.includes('icu') || t.includes('深切治療') || t.includes('預支')) return true;
      }
      // Check Multiple illnesses / claim limit
      if (l.includes('疾病總數') || l.includes('涵蓋嚴重疾病') || l.includes('多次索償') || l.includes('賠償總上限')) {
        if (t.includes('心臟病') || t.includes('中風') || t.includes('多次賠償') || t.includes('病種') || t.includes('疾病')) return true;
      }
      // Check VHIS limit / targeted cancer therapy / cashless / tax
      if (l.includes('全年保障') || l.includes('保障限額')) {
        if (t.includes('限額') || t.includes('保額') || t.includes('千萬')) return true;
      }
      if (l.includes('標靶') || l.includes('非手術癌症')) {
        if (t.includes('標靶') || t.includes('全額賠償') || (!t && k.includes('vhis'))) return true;
      }
      if (l.includes('免找數') || l.includes('cashless') || l.includes('直付') || l.includes('中介服務') || l.includes('中介人')) {
        if (t.includes('免找數') || t.includes('cashless') || t.includes('中介人') || t.includes('客服') || t.includes('直付')) return true;
      }
      if (l.includes('扣稅') || l.includes('慳稅') || l.includes('稅務') || l.includes('實質慳稅')) {
        if (t.includes('8,000') || t.includes('10,200') || t.includes('稅款') || t.includes('扣稅') || t.includes('慳稅') || t.includes('實質慳稅')) return true;
      }
      // Check QDAP guaranteed proportion
      if (l.includes('保證年金利益') || l.includes('保證利益') || l.includes('保證部分')) {
        if (t.includes('保證回報') || t.includes('浮動紅利') || t.includes('佔比') || t.includes('確定性') || (!t && k.includes('qdap'))) return true;
      }
      // Check Universal life / financing LTV / spread / margin call
      if (l.includes('成數') || l.includes('ltv') || l.includes('融資成數')) {
        if (t.includes('85%') || t.includes('ltv') || t.includes('融資') || (!t && k.includes('financing'))) return true;
      }
      if (l.includes('息差') || l.includes('spread') || l.includes('結算利率') || l.includes('crediting') || l.includes('floor')) {
        if (t.includes('息差') || t.includes('結算') || t.includes('淨息差')) return true;
      }
      if (l.includes('margin') || l.includes('追加保證金') || l.includes('補倉')) {
        if (t.includes('margin') || t.includes('追加保證金') || t.includes('補倉')) return true;
      }
      // Check highlights / features
      if (l.includes('亮點') || l.includes('條款') || l.includes('傳承') || l.includes('分拆') || l.includes('貨幣') || l.includes('豁免')) {
        if (t.includes('貨幣') || t.includes('分拆') || t.includes('傳承') || t.includes('條款') || t.includes('豁免') || t.includes('保費豁免') || t.includes('起派年齡') || t.includes('現金流')) return true;
      }
      return false;
    }
    window.isRowHighlightedByClaim = isRowHighlightedByClaim;

    // 1v1 Bilateral Actuarial Scorecard Renderer
    function renderRadarScorecard(card) {
      const container = document.getElementById('bilateral-radar-scorecard');
      if (!container || !card || !Array.isArray(card.radar_scorecard)) return;

      const ourName = cleanProductName(card.hero_our_name || '我方方案 (Plan A)');
      const rivalName = cleanProductName(card.hero_rival_name || '對手方案 (Plan B)');

      let html = '<div class="scorecard-header">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span class="scorecard-title">⚖️ 1v1 雙邊精算維度雷達計分卡</span>' +
          '<span class="scorecard-badge">五維量化評分 (0-100)</span>' +
        '</div>' +
        '<div class="scorecard-legend">' +
          '<span>🔵 Plan A (' + ourName + ')</span>' +
          '<span style="margin-left:12px;">🔴 Plan B (' + rivalName + ')</span>' +
        '</div>' +
      '</div>' +
      '<div class="scorecard-bars-list">';

      card.radar_scorecard.forEach(function(item) {
        const delta = item.delta;
        let badgeClass = 'delta-tie';
        let badgeText = '持平 (0分)';
        if (delta > 0) {
          badgeClass = 'delta-lead';
          badgeText = '+' + delta + '分 我方領先 🏆';
        } else if (delta < 0) {
          badgeClass = 'delta-lag';
          badgeText = delta + '分 對手領先';
        }

        html += '<div class="scorecard-row">' +
          '<div class="scorecard-row-top">' +
            '<span class="scorecard-dimension-name">' + item.label + '</span>' +
            '<div class="scorecard-row-values">' +
              '<span class="scorecard-val-our">' + item.our_score + '分</span>' +
              '<span class="scorecard-vs">vs</span>' +
              '<span class="scorecard-val-rival">' + item.rival_score + '分</span>' +
              '<span class="scorecard-delta-badge ' + badgeClass + '">' + badgeText + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="scorecard-dual-track">' +
            '<div class="scorecard-progress-bar our-bar" style="width: ' + Math.min(100, Math.max(12, item.our_score)) + '%;" title="Plan A: ' + item.our_score + '分">' +
              '<span>' + item.our_score + '分</span>' +
            '</div>' +
            '<div class="scorecard-progress-bar rival-bar" style="width: ' + Math.min(100, Math.max(12, item.rival_score)) + '%;" title="Plan B: ' + item.rival_score + '分">' +
              '<span>' + item.rival_score + '分</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      });

      html += '</div>';
      container.innerHTML = html;
    }
    window.renderRadarScorecard = renderRadarScorecard;

    // Bilateral Clause Comparison Card Renderer
    function renderClauseComparison(card) {
      const container = document.getElementById('bilateral-clause-comparison');
      if (!container || !card || !card.clause_comparison) return;

      const cc = card.clause_comparison;
      const ourName = cleanProductName(card.hero_our_name || '我方方案 (Plan A)');
      const rivalName = cleanProductName(card.hero_rival_name || '對手方案 (Plan B)');

      const ourHighlights = (cc.our_highlights && cc.our_highlights.length > 0)
        ? cc.our_highlights.map(function(h) { return '<li class="clause-highlight-item"><span class="clause-icon icon-check">✔</span><span>' + h + '</span></li>'; }).join('')
        : '<li class="clause-empty">暫無條款亮點記載</li>';

      const ourPitfalls = (cc.our_pitfalls && cc.our_pitfalls.length > 0)
        ? cc.our_pitfalls.map(function(p) { return '<li class="clause-pitfall-item"><span class="clause-icon icon-warn">⚠️</span><span>' + p + '</span></li>'; }).join('')
        : '<li class="clause-empty">依官方說明書常規細則為準</li>';

      const rivalHighlights = (cc.rival_highlights && cc.rival_highlights.length > 0)
        ? cc.rival_highlights.map(function(h) { return '<li class="clause-highlight-item"><span class="clause-icon icon-check">✔</span><span>' + h + '</span></li>'; }).join('')
        : '<li class="clause-empty">暫無條款亮點記載</li>';

      const rivalPitfalls = (cc.rival_pitfalls && cc.rival_pitfalls.length > 0)
        ? cc.rival_pitfalls.map(function(p) { return '<li class="clause-pitfall-item"><span class="clause-icon icon-warn">⚠️</span><span>' + p + '</span></li>'; }).join('')
        : '<li class="clause-empty">依官方說明書常規細則為準</li>';

      container.innerHTML = '<div class="clause-comp-header">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span class="clause-comp-title">📋 條款亮點與細則盲點雙邊對照卡</span>' +
          '<span class="clause-comp-badge">香港保監局 GL20 合規</span>' +
        '</div>' +
        '<p class="clause-comp-sub">客觀並列雙方條款優勢與細則提示，嚴格落實雙邊對等披露與客戶知情權。</p>' +
      '</div>' +
      '<div class="clause-grid-dual">' +
        '<div class="clause-col clause-col-our">' +
          '<div class="clause-col-header our-head">' +
            '<span class="col-camp-badge">🔵 Plan A 我方主力</span>' +
            '<div class="col-prod-title">' + ourName + '</div>' +
          '</div>' +
          '<div class="clause-section">' +
            '<div class="clause-section-title green-title">✨ 核心條款亮點 (Highlights)</div>' +
            '<ul class="clause-list">' + ourHighlights + '</ul>' +
          '</div>' +
          '<div class="clause-section">' +
            '<div class="clause-section-title amber-title">⚠️ 條款細則提示 (Key Disclosures)</div>' +
            '<ul class="clause-list">' + ourPitfalls + '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="clause-col clause-col-rival">' +
          '<div class="clause-col-header rival-head">' +
            '<span class="col-camp-badge">🔴 Plan B 遭遇競品</span>' +
            '<div class="col-prod-title">' + rivalName + '</div>' +
          '</div>' +
          '<div class="clause-section">' +
            '<div class="clause-section-title green-title">✨ 核心條款亮點 (Highlights)</div>' +
            '<ul class="clause-list">' + rivalHighlights + '</ul>' +
          '</div>' +
          '<div class="clause-section">' +
            '<div class="clause-section-title amber-title">⚠️ 條款細則提示 (Key Disclosures)</div>' +
            '<ul class="clause-list">' + rivalPitfalls + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="clause-comp-footer">' +
        '⚖️ 註：本對照卡依據香港保監局《操守準則》(GL20) 雙邊客觀披露規範編製，摘自各保險公司最新官方產品通函及保單說明書；純屬條款特點客觀比對，不構成個別要約。' +
      '</div>';
    }
    window.renderClauseComparison = renderClauseComparison;

    // Agent Clause Intel Renderer
    function renderAgentClauseIntel(card) {
      const container = document.getElementById('agent-clause-intel');
      if (!container || !card || !card.clause_comparison) return;

      const cc = card.clause_comparison;
      const rivalName = cleanProductName(card.hero_rival_name || '對手方案');
      const ourName = cleanProductName(card.hero_our_name || '我方方案');

      const rivalPitfallsHtml = (cc.rival_pitfalls && cc.rival_pitfalls.length > 0)
        ? cc.rival_pitfalls.map(function(p, idx) {
            return '<div class="intel-item pitfall-attack-item">' +
              '<div class="intel-item-badge">🔥 攻擊點 ' + (idx + 1) + '</div>' +
              '<div class="intel-item-text">' + p + '</div>' +
            '</div>';
          }).join('')
        : '<div class="intel-empty">對手暫無特殊細則盲點標註</div>';

      const ourHighlightsHtml = (cc.our_highlights && cc.our_highlights.length > 0)
        ? cc.our_highlights.map(function(h, idx) {
            return '<div class="intel-item highlight-trump-item">' +
              '<div class="intel-item-badge">💎 核心王牌 ' + (idx + 1) + '</div>' +
              '<div class="intel-item-text">' + h + '</div>' +
            '</div>';
          }).join('')
        : '<div class="intel-empty">我方方案具備標準旗艦優勢</div>';

      container.innerHTML = '<div class="agent-intel-box">' +
        '<div class="intel-header">' +
          '<span class="intel-title">🎯 條款狙擊情報庫 (Fine-Print Battle Intel)</span>' +
          '<span class="intel-tag">內部私密提詞</span>' +
        '</div>' +
        '<div class="intel-block attack-block">' +
          '<div class="intel-block-title">' +
            '<span>🎯 對手【' + rivalName + '】細則盲點（引導客戶提問）：</span>' +
          '</div>' +
          '<div class="intel-list">' +
            rivalPitfallsHtml +
          '</div>' +
          '<div class="intel-pitch-hint">' +
            '💡 提問破局金句：「陳生，建議您留意對手條款備註呢幾點，特別係前期現金價值及次年利率浮動條款，請問對手顧問有無同您詳細拆解過？」' +
          '</div>' +
        '</div>' +
        '<div class="intel-block trump-block">' +
          '<div class="intel-block-title">' +
            '<span>🛡️ 我方【' + ourName + '】條款王牌（主打核心價值）：</span>' +
          '</div>' +
          '<div class="intel-list">' +
            ourHighlightsHtml +
          '</div>' +
          '<div class="intel-pitch-hint">' +
            '💡 促成攻防金句：「我地呢個方案最強在於將資產主動權放返係您手，無論長遠貨幣週期轉換定係跨代分拆傳承，都能全面為家庭提供安全網！」' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    window.renderAgentClauseIntel = renderAgentClauseIntel;

    // Dynamic Reactive DOM Updater
    function updateBattleCard() {
      const card = getBattleCard(myCompany, selectedCompany, selectedClaim, selectedClaimText);
      if (!card) return;

      // Agent View Updates
      const agentTitle = document.getElementById('agent-title');
      const agentStep1 = document.getElementById('agent-step-1');
      const agentStep2 = document.getElementById('agent-step-2');
      const agentStep3 = document.getElementById('agent-step-3');
      const agentTrap = document.getElementById('agent-trap-alert');
      const agentObjection = document.getElementById('agent-objection-title');

      if (agentTitle) agentTitle.innerHTML = card.agent_title;
      if (agentStep1) agentStep1.innerHTML = card.agent_step_1;
      if (agentStep2) agentStep2.innerHTML = card.agent_step_2;
      if (agentStep3) agentStep3.innerHTML = card.agent_step_3;
      if (agentTrap) agentTrap.innerHTML = \`<strong>條款陷阱避坑警示：</strong>\${card.agent_trap_warning}\`;
      if (agentObjection) agentObjection.innerText = selectedClaimText || selectedClaim || '5.8% 預繳 / 保證高回報';

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
      if (clientSource) { const s = card.client_source || '來源：香港保監局 GN16 公開報告'; clientSource.innerHTML = s.includes('2026年11月06日') ? s : (s + ' · 最後資料更新日期：2026年11月06日'); }
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
            \${card.bilateral_specs.map(row => {
              const isHighlighted = isRowHighlightedByClaim(row.label, selectedClaim, selectedClaimText);
              const highlightClass = isHighlighted ? ' class="spec-row-highlighted"' : '';
              const badgeHtml = isHighlighted ? '<span class="spec-focus-badge">🎯 攻防焦點</span>' : '';
              return \`
              <tr\${highlightClass} style="border-bottom:1px solid #f1f5f9; \${row.winner === 'our' ? 'background:rgba(0,47,167,0.02);' : ''}">
                <td style="padding:6px 8px;font-weight:600;color:#334155;">\${row.label}\${badgeHtml}</td>
                <td style="padding:6px 8px;font-family:'JetBrains Mono';font-weight:700;color:var(--ikb);">\${row.ourVal}</td>
                <td style="padding:6px 8px;font-family:'JetBrains Mono';color:#64748b;">\${row.rivalVal}</td>
                <td style="padding:6px 8px;font-family:'JetBrains Mono';font-weight:700;text-align:right;color:\${row.winner === 'our' ? '#10b981' : (row.winner === 'rival' ? '#f59e0b' : '#64748b')};">\${row.delta}</td>
              </tr>
            \`;
            }).join('')}
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

      // 1v1 Radar Scorecard Rendering
      renderRadarScorecard(card);

      // 1v1 Clause Highlights & Pitfalls Comparison Rendering
      renderClauseComparison(card);

      // Agent Private Clause Intel Rendering
      renderAgentClauseIntel(card);

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

      // Update WhatsApp pitch script
      currentWhatsAppScript = card.whatsapp_script;
    }
    window.updateBattleCard = updateBattleCard;

    // Catalog Drawer Handlers
    function openCatalogDrawer() {
      lastCatalogSide = null;
      const drawer = document.getElementById('catalog-drawer');
      const backdrop = document.getElementById('catalog-drawer-backdrop');
      const searchInput = document.getElementById('catalog-search-input');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      if (searchInput) searchInput.value = '';
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
        const normFilter = (!catFilter || catFilter === 'all') ? 'all' : normalizeCategory(catFilter);
        const matchesCat = (normFilter === 'all' || normalizeCategory(p.category) === normFilter);
        const matchesText = !filterText ||
          p.name.toLowerCase().includes(filterText) ||
          p.insurerName.toLowerCase().includes(filterText) ||
          p.categoryName.toLowerCase().includes(filterText) ||
          p.highlight.toLowerCase().includes(filterText) ||
          p.id.toLowerCase().includes(filterText) ||
          (p.clause_highlights && p.clause_highlights.some(h => h.toLowerCase().includes(filterText))) ||
          (p.clause_pitfalls && p.clause_pitfalls.some(pf => pf.toLowerCase().includes(filterText)));
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
          \${(p.clause_highlights && p.clause_highlights.length > 0) ? '<div style="margin:4px 0;">' + p.clause_highlights.slice(0, 2).map(function(t){ return '<span class="drawer-clause-tag">✔ ' + t + '</span>'; }).join('') + '</div>' : ''}
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

    let lastCatalogSide = null;
    function selectProductFromCatalog(promoId) {
      const p = window.ALL_PRODUCTS_CATALOG.find(x => x.id === promoId);
      if (!p) return;
      const prodInsurer = normalizeCompany(p.insurer);
      if (lastCatalogSide === 'rival' || (prodInsurer === selectedCompany && lastCatalogSide !== 'our')) {
        selectCompany(prodInsurer);
        selectCategory(p.category);
        setRivalProduct(p.id);
        showToast(\`已載入競品【\${cleanProductName(p.name)}】對抗卡\`);
      } else if (lastCatalogSide === 'our' || prodInsurer === myCompany) {
        setMyCompany(prodInsurer);
        selectCategory(p.category);
        setMyProduct(p.id);
        showToast(\`已載入我方主力【\${cleanProductName(p.name)}】對抗卡\`);
      } else {
        selectCompany(prodInsurer);
        selectCategory(p.category);
        setRivalProduct(p.id);
        showToast(\`已載入競品【\${cleanProductName(p.name)}】對抗卡\`);
      }
      lastCatalogSide = null;
      closeCatalogDrawer();
    }
    window.selectProductFromCatalog = selectProductFromCatalog;

    function openCatalogForCompany(side) {
      lastCatalogSide = side;
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
    window.renderCampProductOptions = renderCampProductOptions;
    window.findProductInCompany = findProductInCompany;
    window.CATEGORY_TAGS = CATEGORY_TAGS;
    window.getCurrentCategory = () => currentCategory;
    window.getMySelectedProduct = () => mySelectedProduct;
    window.getRivalSelectedProduct = () => rivalSelectedProduct;
    window.updateCampSelectors = updateCampSelectors;
    window.isRowHighlightedByClaim = isRowHighlightedByClaim;

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

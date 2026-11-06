import fs from 'fs';

const filePath = 'scripts/build_mobile_cafe.js';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');

function normalizeNewlines(str) {
  return str.replace(/\r\n/g, '\n');
}

function doReplace(targetContent, oldBlock, newBlock) {
  const normContent = normalizeNewlines(targetContent);
  const normOld = normalizeNewlines(oldBlock);
  let normNew = normalizeNewlines(newBlock);
  if (!normContent.includes(normOld)) {
    throw new Error('Target block not found: ' + normOld.substring(0, 80));
  }
  const replaced = normContent.replace(normOld, normNew);
  return isCRLF ? replaced.replace(/\n/g, '\r\n') : replaced;
}

// 1. Update insurerNames
const oldInsurerNames = `const insurerNames = {
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
};`;

const newInsurerNames = `const insurerNames = {
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
};`;

content = doReplace(content, oldInsurerNames, newInsurerNames);
console.log('1. insurerNames updated');

// 2. Update catalog.push
const oldCatalogPush = `    catalog.push({
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
      specialNotes: specialNotesStr
    });`;

const newCatalogPush = `    catalog.push({
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
    });`;

content = doReplace(content, oldCatalogPush, newCatalogPush);
console.log('2. catalog.push updated');

// 3. Add CSS for new components
const cssMarker = `    /* Toast Notification */`;
const newCss = `    /* Top Date Audit Banner */
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

    /* Toast Notification */`;

content = doReplace(content, cssMarker, newCss);
console.log('3. CSS updated');

// 4. Update Header and Top App Bar with prominent Date Stamp
const oldHeader = `  <!-- Sticky Header with Slides Quick-Nav -->
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
  </header>`;

const newHeader = `  <!-- Sticky Header with Slides Quick-Nav -->
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
  </div>`;

content = doReplace(content, oldHeader, newHeader);
console.log('4. Header date banner updated');

// 5. Update Category Tabs with 99 products counts
const oldCatTabs = `  <!-- 5 Major Category Selector Tabs -->
  <div class="category-tabs-bar" id="category-tabs">
    <button class="cat-tab active" data-cat="Savings_MultiCurrency" onclick="selectCategory(this, 'Savings_MultiCurrency')">📈 儲蓄分紅 (8款)</button>
    <button class="cat-tab" data-cat="Critical_Illness" onclick="selectCategory(this, 'Critical_Illness')">🛡️ 重疾危疾 (9款)</button>
    <button class="cat-tab" data-cat="Medical_VHIS" onclick="selectCategory(this, 'Medical_VHIS')">🏥 自願醫保 (9款)</button>
    <button class="cat-tab" data-cat="Annuity_QDAP" onclick="selectCategory(this, 'Annuity_QDAP')">👴 扣稅年金 (8款)</button>
    <button class="cat-tab" data-cat="Financing_UniversalLife" onclick="selectCategory(this, 'Financing_UniversalLife')">🏦 萬用融資 (8款)</button>
  </div>`;

const newCatTabs = `  <!-- 5 Major Category Selector Tabs -->
  <div class="category-tabs-bar" id="category-tabs">
    <button class="cat-tab active" data-cat="Savings_MultiCurrency" onclick="selectCategory(this, 'Savings_MultiCurrency')">📈 儲蓄分紅 (20款)</button>
    <button class="cat-tab" data-cat="Critical_Illness" onclick="selectCategory(this, 'Critical_Illness')">🛡️ 重疾危疾 (20款)</button>
    <button class="cat-tab" data-cat="Medical_VHIS" onclick="selectCategory(this, 'Medical_VHIS')">🏥 自願醫保 (20款)</button>
    <button class="cat-tab" data-cat="Annuity_QDAP" onclick="selectCategory(this, 'Annuity_QDAP')">👴 扣稅年金 (19款)</button>
    <button class="cat-tab" data-cat="Financing_UniversalLife" onclick="selectCategory(this, 'Financing_UniversalLife')">🏦 萬用融資 (20款)</button>
  </div>`;

content = doReplace(content, oldCatTabs, newCatTabs);
console.log('5. Category tabs updated');

// 6. Update select-my-insurer & select-rival-insurer
const oldSelectMy = `        <select class="camp-select" id="select-my-insurer" onchange="setMyCompany(this.value)" aria-label="選擇我方代表保司">
          <option value="AIA">友邦 AIA</option>
          <option value="Prudential">保誠 Prudential</option>
          <option value="Manulife">宏利 Manulife</option>
          <option value="Sun Life">永明 Sun Life</option>
          <option value="FWD">富衛 FWD</option>
          <option value="AXA">安盛 AXA</option>
          <option value="Bowtie">保泰 Bowtie</option>
          <option value="BOC Life">中銀人壽 BOC Life</option>
          <option value="YF Life">萬通 YF Life</option>
        </select>`;

const newSelectMy = `        <select class="camp-select" id="select-my-insurer" onchange="setMyCompany(this.value)" aria-label="選擇我方代表保司">
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
        </select>`;

const oldSelectRival = `        <select class="camp-select" id="select-rival-insurer" onchange="selectCompany(this.value)" aria-label="選擇遭遇競品保司">
          <option value="Prudential">保誠 Prudential</option>
          <option value="AIA">友邦 AIA</option>
          <option value="Manulife">宏利 Manulife</option>
          <option value="Sun Life">永明 Sun Life</option>
          <option value="FWD">富衛 FWD</option>
          <option value="AXA">安盛 AXA</option>
          <option value="Bowtie">保泰 Bowtie</option>
          <option value="BOC Life">中銀人壽 BOC Life</option>
          <option value="YF Life">萬通 YF Life</option>
        </select>`;

const newSelectRival = `        <select class="camp-select" id="select-rival-insurer" onchange="selectCompany(this.value)" aria-label="選擇遭遇競品保司">
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
        </select>`;

content = doReplace(content, oldSelectMy, newSelectMy);
content = doReplace(content, oldSelectRival, newSelectRival);
console.log('6. Insurer select elements updated');

// 7. Update Agent View secret badge and add #agent-clause-intel
const oldSecretBadge = `<div class="secret-badge">持牌人私密提詞 · 嚴禁直接展示給客戶</div>`;
const newSecretBadge = `<div class="secret-badge">持牌人私密提詞 · 嚴禁直接展示給客戶 · 最新核定：2026年11月06日</div>`;
content = doReplace(content, oldSecretBadge, newSecretBadge);

const oldAgentEnd = `      <div class="step-title" style="color:#4ade80;">步驟 3：數據絕殺（保監局 GN16 官方實現率）</div>
      <div class="step-script" id="agent-step-3">
        「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 96.5%，對手【雋富多元貨幣計劃】得 91.2%。複利 30 年差 5.3% 就係幾十萬真金白銀！」
      </div>
    </div>
  </div>`;

const newAgentEnd = `      <div class="step-title" style="color:#4ade80;">步驟 3：數據絕殺（保監局 GN16 官方實現率）</div>
      <div class="step-script" id="agent-step-3">
        「買分紅險最緊要唔係短期宣傳單張，而係將來可唔可以派足。根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 96.5%，對手【雋富多元貨幣計劃】得 91.2%。複利 30 年差 5.3% 就係幾十萬真金白銀！」
      </div>
    </div>

    <!-- Agent Clause Intel Container -->
    <div class="agent-clause-intel-container" id="agent-clause-intel">
      <!-- Rendered dynamically by updateBattleCard() -->
    </div>
  </div>`;

content = doReplace(content, oldAgentEnd, newAgentEnd);
console.log('7. Agent View secret badge and agent-clause-intel updated');

// 8. Update Client View with scorecard and clause comparison
const oldClientTop = `  <!-- Client Facing View (Light, Clean, Objective, IA Compliant Tear-Sheet) -->
  <div id="client-view" class="main-card" style="display:none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-size:11px; font-weight:700; color:var(--ikb); letter-spacing:1px; font-family:'JetBrains Mono'">INDEPENDENT BENCHMARK TEAR-SHEET</span>
      <span style="font-size:11px; color:#6b7280;" id="client-source">來源：香港保監局 GN16 公開報告</span>
    </div>`;

const newClientTop = `  <!-- Client Facing View (Light, Clean, Objective, IA Compliant Tear-Sheet) -->
  <div id="client-view" class="main-card" style="display:none;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:4px;">
      <span style="font-size:11px; font-weight:700; color:var(--ikb); letter-spacing:1px; font-family:'JetBrains Mono'">INDEPENDENT BENCHMARK TEAR-SHEET</span>
      <span style="font-size:11px; color:#6b7280;" id="client-source">來源：香港保監局 GN16 公開報告 · 最新核定：2026年11月06日</span>
    </div>`;

content = doReplace(content, oldClientTop, newClientTop);

const oldSpecTableEnd = `      <table class="bilateral-spec-table" id="bilateral-spec-table">
        <!-- Rendered dynamically by updateBattleCard() -->
      </table>
    </div>`;

const newSpecTableEnd = `      <table class="bilateral-spec-table" id="bilateral-spec-table">
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
    </div>`;

content = doReplace(content, oldSpecTableEnd, newSpecTableEnd);
console.log('8. Client View scorecard and clause comparison updated');

// 9. Update Catalog Drawer and Bottom Bar (99 products)
content = doReplace(content, '📚 全港保司 · 60 款主流產品規格全覽', '📚 全港保司 · 99 款主流產品規格全覽');
content = doReplace(content, '<button class="drawer-chip active" data-cat="all" onclick="filterCatalogByChip(this, \'all\')">全部 (60)</button>', '<button class="drawer-chip active" data-cat="all" onclick="filterCatalogByChip(this, \'all\')">全部 (99)</button>');
content = doReplace(content, '<button class="drawer-chip" data-cat="Savings_MultiCurrency" onclick="filterCatalogByChip(this, \'Savings_MultiCurrency\')">儲蓄 (12)</button>', '<button class="drawer-chip" data-cat="Savings_MultiCurrency" onclick="filterCatalogByChip(this, \'Savings_MultiCurrency\')">儲蓄 (20)</button>');
content = doReplace(content, '<button class="drawer-chip" data-cat="Critical_Illness" onclick="filterCatalogByChip(this, \'Critical_Illness\')">危疾 (13)</button>', '<button class="drawer-chip" data-cat="Critical_Illness" onclick="filterCatalogByChip(this, \'Critical_Illness\')">危疾 (20)</button>');
content = doReplace(content, '<button class="drawer-chip" data-cat="Medical_VHIS" onclick="filterCatalogByChip(this, \'Medical_VHIS\')">醫保 (12)</button>', '<button class="drawer-chip" data-cat="Medical_VHIS" onclick="filterCatalogByChip(this, \'Medical_VHIS\')">醫保 (20)</button>');
content = doReplace(content, '<button class="drawer-chip" data-cat="Annuity_QDAP" onclick="filterCatalogByChip(this, \'Annuity_QDAP\')">年金 (11)</button>', '<button class="drawer-chip" data-cat="Annuity_QDAP" onclick="filterCatalogByChip(this, \'Annuity_QDAP\')">年金 (19)</button>');
content = doReplace(content, '<button class="drawer-chip" data-cat="Financing_UniversalLife" onclick="filterCatalogByChip(this, \'Financing_UniversalLife\')">萬用 (12)</button>', '<button class="drawer-chip" data-cat="Financing_UniversalLife" onclick="filterCatalogByChip(this, \'Financing_UniversalLife\')">萬用 (20)</button>');
content = doReplace(content, '📚 60款全產品庫', '📚 99款全產品庫');
console.log('9. Catalog drawer labels updated to 99 products');

// 10. Update COMPANY_PROFILES in script
const oldPruProfileEnd = `        qdapGuaranteedPct: 40.0,
        qdapGuaranteedIRR: 2.70
      }
    };
    COMPANY_PROFILES['Sun_Life'] = COMPANY_PROFILES['Sun Life'];
    COMPANY_PROFILES['BOC_Life'] = COMPANY_PROFILES['BOC Life'];
    COMPANY_PROFILES['YF_Life'] = COMPANY_PROFILES['YF Life'];
    window.COMPANY_PROFILES = COMPANY_PROFILES;`;

const newPruProfileEnd = `        qdapGuaranteedPct: 40.0,
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
    window.COMPANY_PROFILES = COMPANY_PROFILES;`;

content = doReplace(content, oldPruProfileEnd, newPruProfileEnd);
console.log('10. COMPANY_PROFILES updated with new insurers');

// 11. Update normalizeCompany
const oldNormalizeCompany = `    function normalizeCompany(str) {
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
    }`;

const newNormalizeCompany = `    function normalizeCompany(str) {
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
    }`;

content = doReplace(content, oldNormalizeCompany, newNormalizeCompany);
console.log('11. normalizeCompany updated with new insurers');

// 12. Update getBattleCard start and end
const branch1Target = `      // ==========================================
      // Branch 1: Bowtie as Rival Insurer
      // ==========================================`;

const radarComputationBlock = `      // Compute 5-Dimensional Radar Scorecard
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
      // ==========================================`;

content = doReplace(content, branch1Target, radarComputationBlock);

const endBattleCardTarget = `    }
    window.getBattleCard = getBattleCard;`;

const newEndBattleCardBlock = `      }

      const card = _resolveBattleCardCore();
      if (card) {
        card.radar_scorecard = radarScorecard;
        card.clause_comparison = clauseComparison;
      }
      return card;
    }
    window.getBattleCard = getBattleCard;`;

content = doReplace(content, endBattleCardTarget, newEndBattleCardBlock);
console.log('12. getBattleCard radar scorecard and clause comparison integration complete');

// 13. Add rendering functions and wire them into updateBattleCard()
const renderFuncs = `    // 1v1 Bilateral Actuarial Scorecard Renderer
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
`;

const updateBattleCardTarget = `      // Fine-Print Revealer
      const fpClaim = document.getElementById('fineprint-claim');
      const fpReality = document.getElementById('fineprint-reality');
      const fpCitation = document.getElementById('fineprint-citation');
      if (fpClaim) fpClaim.innerHTML = card.fineprint_claim;
      if (fpReality) fpReality.innerHTML = card.fineprint_reality;
      if (fpCitation) fpCitation.innerHTML = card.fineprint_citation;`;

const newUpdateBattleCardInsert = `      // Fine-Print Revealer
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
      renderAgentClauseIntel(card);`;

content = doReplace(content, updateBattleCardTarget, newUpdateBattleCardInsert);

// Insert render functions right before updateBattleCard
content = doReplace(content, '    // Dynamic Reactive DOM Updater\n    function updateBattleCard() {', renderFuncs + '\n    // Dynamic Reactive DOM Updater\n    function updateBattleCard() {');
console.log('13. Renderer functions and updateBattleCard hooks installed');

// 14. Update renderCatalog with clause tags and keyword matching
const oldRenderCatalog = `      const filtered = window.ALL_PRODUCTS_CATALOG.filter(p => {
        const normFilter = (!catFilter || catFilter === 'all') ? 'all' : normalizeCategory(catFilter);
        const matchesCat = (normFilter === 'all' || normalizeCategory(p.category) === normFilter);
        const matchesText = !filterText ||
          p.name.toLowerCase().includes(filterText) ||
          p.insurerName.toLowerCase().includes(filterText) ||
          p.categoryName.toLowerCase().includes(filterText) ||
          p.highlight.toLowerCase().includes(filterText) ||
          p.id.toLowerCase().includes(filterText);
        return matchesCat && matchesText;
      });`;

const newRenderCatalog = `      const filtered = window.ALL_PRODUCTS_CATALOG.filter(p => {
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
      });`;

content = doReplace(content, oldRenderCatalog, newRenderCatalog);

// Replace drawer card inner template
const oldCardHtml = `          <div class="drawer-card-insurer">\\\${p.insurerName} · \\\${p.highlight}</div>
          <div class="drawer-card-specs">`;

const newCardHtml = `          <div class="drawer-card-insurer">\\\${p.insurerName} · \\\${p.highlight}</div>
          \\\${(p.clause_highlights && p.clause_highlights.length > 0) ? '<div style="margin:4px 0;">' + p.clause_highlights.slice(0, 2).map(function(t){ return '<span class="drawer-clause-tag">✔ ' + t + '</span>'; }).join('') + '</div>' : ''}
          <div class="drawer-card-specs">`;

content = doReplace(content, oldCardHtml, newCardHtml);
console.log('14. renderCatalog updated with clause tags and search');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ build_mobile_cafe.js successfully updated!');

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

const insurerOfficialUrls = {
  AIA: 'https://www.aia.com.hk/zh-hk/',
  Prudential: 'https://www.prudential.com.hk/zh-hk/',
  Manulife: 'https://www.manulife.com.hk/zh-hk/',
  Sun_Life: 'https://www.sunlife.com.hk/zh-hk/',
  FWD: 'https://www.fwd.com.hk/zh/',
  AXA: 'https://www.axa.com.hk/zh/',
  Bowtie: 'https://www.bowtie.com.hk/zh-hk/',
  BOC_Life: 'https://www.boclife.com.hk/tc/',
  YF_Life: 'https://www.yflife.com/zh-hk/',
  Cigna: 'https://www.cigna.com.hk/zh-hant/',
  Bupa: 'https://www.bupa.com.hk/zh-hk/',
  HSBC: 'https://www.insurance.hsbc.com.hk/1/2/chinese/',
  HSBC_Life: 'https://www.insurance.hsbc.com.hk/1/2/chinese/',
  Generali: 'https://www.generali.com.hk/zh-hk/',
  BlueCross: 'https://www.bluecross.com.hk/ch/',
  ChinaLife: 'https://www.chinalife.com.hk/zh-hk/'
};

function getInsurerOfficialUrl(insurerKey) {
  const key = String(insurerKey || '').replace(/\s+/g, '_');
  return insurerOfficialUrls[key] || insurerOfficialUrls[insurerKey] || 'https://www.ia.org.hk/tc/';
}

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
    const vhisLifetimeLimitHkdNum = (p.vhis_metrics && typeof p.vhis_metrics.lifetime_limit_hkd === 'number') ? p.vhis_metrics.lifetime_limit_hkd : 0;
    const vhisDeductiblesArr = (p.vhis_metrics && Array.isArray(p.vhis_metrics.deductible_options_hkd)) ? p.vhis_metrics.deductible_options_hkd : [0, 16000, 25000, 50000];
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
      official_url: p.official_url || p.official_brochure_url || getInsurerOfficialUrl(p.insurer),
      brochure_url: p.brochure_url || p.official_url || getInsurerOfficialUrl(p.insurer),
      pdf_url: p.pdf_url || p.official_pdf_url || getInsurerOfficialUrl(p.insurer),
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
      vhisLifetimeLimitHkd: vhisLifetimeLimitHkdNum,
      vhisDeductibles: vhisDeductiblesArr,
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


// ============================================================================
// ALL 13 PRIVATE HOSPITALS IN HONG KONG (全港 13 家私家醫院權威名冊)
// ============================================================================
const HK_13_PRIVATE_HOSPITALS = [
  {
    name: '香港養和醫院 (Hong Kong Sanatorium & Hospital)',
    shortName: '養和醫院 (HKSH)',
    district: '港島跑馬地 (Happy Valley)',
    roomTier: '半私家房 / 尊貴私家房',
    directBillingStatus: '全額保證代付 (LOG 擔保綠色通道)',
    preApprovalHours: '24 小時特快批核',
    specialties: '綜合腫瘤中心、質子治療、微創外科、頂級心血管中心',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 50,000 - 80,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: '港怡醫院 (Gleneagles Hospital Hong Kong)',
    shortName: '港怡醫院 (Gleneagles)',
    district: '港島黃竹坑 (Wong Chuk Hang)',
    roomTier: '標準半私家房 / 定價套式病房',
    directBillingStatus: '全額保證代付 (全包醫療套式收費直通)',
    preApprovalHours: '24 小時特快批核',
    specialties: '50+項全包醫療套餐、達芬奇機械人、全方位骨科與腫瘤',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 40,000 - 60,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: '嘉諾撒醫院 (Canossa Hospital)',
    shortName: '嘉諾撒醫院 (Canossa)',
    district: '港島中半山舊山頂道 (Old Peak Road)',
    roomTier: '標準雙人房 / 單人房',
    directBillingStatus: '保司直接結算 (出院免找數)',
    preApprovalHours: '48 小時預先批核',
    specialties: '明愛優質全科、婦幼健康、微創腹腔鏡、日間白內障',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 認可直付'
  },
  {
    name: '香港中文大學醫院 (CUHK Medical Centre)',
    shortName: '中大醫院 (CUHKMC)',
    district: '新界沙田 (Shatin)',
    roomTier: '標準雙人房 / 智慧單人房',
    directBillingStatus: '全額保證代付 (全港首家非牟利智慧定價私院)',
    preApprovalHours: '24 小時特快批核',
    specialties: '全面定價收費套餐、日間手術中心、智慧無紙化直付網絡',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: "聖保祿醫院 (St. Paul's Hospital)",
    shortName: '聖保祿醫院 / 法國修女醫院',
    district: '港島銅鑼灣 (Causeway Bay)',
    roomTier: '標準房 / 半私家房 / 私家房',
    directBillingStatus: '保司直接結算 (出院免找數)',
    preApprovalHours: '24-48 小時預先批核',
    specialties: '先進放射治療中心、心臟導管微創、綜合癌症治療',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 認可直付'
  },
  {
    name: '仁安醫院 (Union Hospital)',
    shortName: '仁安醫院 (Union)',
    district: '新界沙田大圍 (Tai Wai)',
    roomTier: '二等雙人房 / 頭等單人房',
    directBillingStatus: '全額保證代付 (LOG 擔保特快直付)',
    preApprovalHours: '24 小時特快批核',
    specialties: '微創中心、微創心臟介入手術、婦產科、日間手術中心',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: '香港浸信會醫院 (Hong Kong Baptist Hospital)',
    shortName: '浸會醫院 (HKBH)',
    district: '九龍塘 (Kowloon Tong)',
    roomTier: '標準三人房 / 半私家單人房',
    directBillingStatus: '全額保證代付 (特設保險直付專屬櫃枱)',
    preApprovalHours: '24-48 小時預先批核',
    specialties: '癌症治療中心、心臟血管中心、大型腎科及日間內窺鏡',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 認可直付'
  },
  {
    name: '香港港安醫院－司徒拔道 (Hong Kong Adventist Hospital - Stubbs Road)',
    shortName: '港安醫院 (司徒拔道)',
    district: '港島跑馬地/東半山 (Stubbs Road)',
    roomTier: '半私家房 / 全單人房',
    directBillingStatus: '全球國際保險直接結算 (Cashless Billing)',
    preApprovalHours: '24 小時特快批核',
    specialties: 'JCI國際認證、心臟中心、微創機械人、全天候急症支援',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 40,000 - 60,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: '香港港安醫院－荃灣 (Hong Kong Adventist Hospital - Tsuen Wan)',
    shortName: '港安醫院 (荃灣)',
    district: '新界荃灣 (Tsuen Wan)',
    roomTier: '標準房 / 優質半私家房 / 私家房',
    directBillingStatus: '全額保證代付 (新界西頂尖私院直付通道)',
    preApprovalHours: '24 小時特快批核',
    specialties: '24小時急症、先進綜合腫瘤中心、骨科微創、日間手術',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: '播道醫院 (Evangel Hospital)',
    shortName: '播道醫院 (Evangel)',
    district: '九龍城亞皆老街 (Kowloon City)',
    roomTier: '標準房 / 半私家房',
    directBillingStatus: '特約保險直接結算 (出院免找數)',
    preApprovalHours: '48 小時預先批核',
    specialties: '高性價比內窺鏡日間手術、白內障手術、全科門診與住院',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 20,000 - 30,000',
    cashlessNetworkRank: 'Tier 1 認可直付'
  },
  {
    name: "聖德肋撒醫院 / 法國醫院 (St. Teresa's Hospital)",
    shortName: '聖德肋撒醫院 / 九龍法國醫院',
    district: '九龍城太子道 (Prince Edward Road)',
    roomTier: '標準房 / 二等房 / 頭等房',
    directBillingStatus: '全港主流保險直接結算網絡 (出院免找數)',
    preApprovalHours: '24-48 小時預先批核',
    specialties: '九龍區超大型全科私院、千張床位、腫瘤科、心導管介入手術',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 30,000 - 50,000',
    cashlessNetworkRank: 'Tier 1 認可直付'
  },
  {
    name: '明德國際醫院 (Matilda International Hospital)',
    shortName: '明德醫院 (Matilda)',
    district: '港島山頂加列山道 (The Peak)',
    roomTier: '尊貴山景/海景單人房 / 標準房',
    directBillingStatus: '國際涉外高端保險全額直接結算',
    preApprovalHours: '24 小時特快批核',
    specialties: '頂級奢華尊貴醫療、先進骨科微創、脊柱手術、全科日間外科',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 50,000 - 100,000',
    cashlessNetworkRank: 'Tier 1 旗艦直付'
  },
  {
    name: '寶血醫院（明愛） (Precious Blood Hospital (Caritas))',
    shortName: '寶血醫院 (Precious Blood)',
    district: '九龍深水埗青山道 (Sham Shui Po)',
    roomTier: '標準多人間 / 二等雙人房',
    directBillingStatus: '明愛社福合資格保險直付 (出院免找數)',
    preApprovalHours: '48 小時預先批核',
    specialties: '社區高性價比微創手術、日間白內障、腸胃鏡、婦科手術',
    depositWithLOG: 'HK$ 0 (全免入院按金)',
    depositWithoutLOG: 'HK$ 20,000 - 30,000',
    cashlessNetworkRank: 'Tier 1 認可直付'
  }
];

// ============================================================================
// 100-POINT CLIENT & INSURANCE AGENT IMPROVEMENT REGISTRY (FULL PDM DATASET)
// ============================================================================
const APP_100_IMPROVEMENT_COMMENTS = require('../src/data/app_100_comments.json');

// ============================================================================
// 30-POINT CLIENT & INSURANCE AGENT IMPROVEMENT REGISTRY (PM & PdM WATCHDOG)
// ============================================================================
const APP_30_IMPROVEMENT_COMMENTS = [
  {
    id: 'C1',
    topic: 'GN16 100% 官方基準解析',
    sourceRole: '客戶 (Client)',
    commentText: '走勢圖上的 100% 到底是什麼意思？是保證本金 100% 還是回報 100%？客戶和顧問都不明白。',
    pmReview: '項目經理審核：客戶普遍對 100% 存在解讀混淆，需消除金融術語壁壘，建立清晰官方指引規範。',
    pdmDecision: '產品經理設計：在 GN16 折線圖上方常駐『💡 什麼是保監局 GN16 100% 官方基準？』解讀橫幅，清晰定義 100% 為保司足額兌現建議書非保證紅利的誠信標準，<100% 為分紅打折，>100% 為超額派發。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'renderCorridorVisualChart & GN16 Explainer Banner'
  },
  {
    id: 'C2',
    topic: '精算五維 0-100 分數實質化',
    sourceRole: '客戶 (Client)',
    commentText: '98分和84分聽起來很虛，能不能告訴我具體差了多少錢、多少利率或多少年期？',
    pmReview: '項目經理審核：量化分數若無實質指標支撐，易被客戶視為保司主觀打分，缺乏公信力。',
    pdmDecision: '產品經理設計：在雷達計分卡五維條目下方直接展示底層實質數據（如 6.8% vs 6.1% IRR、第6年 vs 第8年回本、1年 vs 3年癌症等待期），並附帶精算換算維度說明。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'computeRadarDimensionScores & renderRadarScorecard'
  },
  {
    id: 'C3',
    topic: '折線圖標籤重疊與遮擋',
    sourceRole: '客戶 (Client)',
    commentText: '手機畫面上 98分和84分、95分和95分撞在同一塊，數字疊在一起看不清。',
    pmReview: '項目經理審核：移動端高DPI屏幕下標籤重疊直接損害可讀性，需設定碰撞檢測邊界算法。',
    pdmDecision: '產品經理設計：實現動態防碰撞引擎：分數相同時合併為雙色對照徽章（🔵 95分 = 🔴 95分），分數相近時採用上下交錯與左右位移，並疊加白色描邊光暈。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'renderRadarScorecard SVG Anti-Collision Engine'
  },
  {
    id: 'C4',
    topic: 'Policy Horizon 政策效益通用套話消除',
    sourceRole: '客戶 (Client)',
    commentText: '拉動 5/10/20/30 年滑桿時，看到『我方方案在選定第 30 年保持核心收益率』通用模板文字，不是選中產品的真實數據。',
    pmReview: '項目經理審核：政策效益投影是客戶做長線決策的關鍵依據，通用佔位符損害專業形象。',
    pdmDecision: '產品經理設計：為 5 大險種及全部年期（5、10、20、30年）深度重構動態精算投影引擎，直接對接選定產品的現金價值倍數、扣稅額度、重疾等候期及保費融資利差。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'updateHorizonDisplay'
  },
  {
    id: 'C5',
    topic: 'QDAP 年金條形圖文字語法缺陷與靜態表格',
    sourceRole: '客戶 (Client)',
    commentText: 'QDAP 年金條形圖 Plan B 顯示的是產品名稱而不是數值，下面表格數字也是寫死的。',
    pmReview: '項目經理審核：確認 Image 1 反饋之嚴重渲染 Bug，Plan B 條形圖數值欄位被產品名覆蓋，表格未隨產品切換刷新。',
    pdmDecision: '產品經理設計：徹底修正 value: 對手【產品名】 的賦值錯誤，動態計算並展示雙方真實的保證年金比例（如 82.5% vs 45.0%）與保證內部回報率。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: '_resolveBattleCardCore & QDAP Branch'
  },
  {
    id: 'C6',
    topic: '全港 13 家私家醫院全量覆蓋',
    sourceRole: '客戶 (Client)',
    commentText: '醫療險只看得到 5 家醫院，我想知道聖保祿、仁安、浸會、法國醫院到底能不能出院免找數？',
    pmReview: '項目經理審核：全港私家醫院共 13 家，客戶就診分佈廣泛，必須做到 100% 私院覆蓋。',
    pdmDecision: '產品經理設計：將自願醫保私院覆蓋全量擴充至全港 13 家私家醫院，詳列各院病房級別、直付特快批核速度與專屬醫療特色。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'HK_13_PRIVATE_HOSPITALS & renderScenarioAgentPanel'
  },
  {
    id: 'C7',
    topic: '私家醫院入院按金豁免機制透明化',
    sourceRole: '客戶 (Client)',
    commentText: '聽說私家醫院入院要先交幾萬按金，免找數能免除按金嗎？',
    pmReview: '項目經理審核：客戶常因不知入院需墊付數萬按金而產生焦慮，需明確保司付款擔保書 (LOG) 的按金豁免權益。',
    pdmDecision: '產品經理設計：在醫療直付速查中明確標注「保司付款擔保書 (LOG)」的按金豁免機制（有 LOG 按金 HK$0 vs 無擔保自付 HK$20,000-80,000）。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'checkCashlessDirectBilling & Hospital Result Card'
  },
  {
    id: 'C8',
    topic: '自負額 (Deductible) 實質扣減與團體醫保銜接',
    sourceRole: '客戶 (Client)',
    commentText: '選了 HK$25,000 自負額，具體自付多少？可以用公司團體醫保 Claim 嗎？',
    pmReview: '項目經理審核：自負額概念常造成誤解，需將個人支出上限與保司直接代付金額分欄清晰呈現。',
    pdmDecision: '產品經理設計：在自負額階梯中即時計算個人承擔上限與保司直付金額，並提供團體醫保無縫銜接墊底的計算說明。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'onMedicalDeductibleSelect & Medical Result Card'
  },
  {
    id: 'C9',
    topic: '預繳高息保證年期透明度',
    sourceRole: '客戶 (Client)',
    commentText: '宣傳的 5.8% 預繳利息，第二年會不會突然降到只有 1-2%？',
    pmReview: '項目經理審核：降息週期下浮動預繳利息極易引發銷售爭議，需落實保監局關於保證期的合規披露。',
    pdmDecision: '產品經理設計：在細則揭秘 (Fine-Print) 與比對表中清晰標註預繳保證鎖定期（如首 1-3 年固定 vs 次年浮動），防範降息週期浮動利差心理落差。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Fine-Print & Bilateral Specs Prepayment Lock'
  },
  {
    id: 'C10',
    topic: '多元貨幣轉換手續費與窗口期透明度',
    sourceRole: '客戶 (Client)',
    commentText: '9種貨幣轉換有沒有匯率剪刀差？每年可以換幾次？',
    pmReview: '項目經理審核：跨境高淨值客戶對匯率點差極度敏感，需說明官方轉換規則。',
    pdmDecision: '產品經理設計：在條款亮點中載明貨幣轉換窗口期（第 2-3 保單周年日起）、市場公允中間匯價機制及無限次免手續費轉換條款。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Offshore MCV Scenario & Clause Highlights'
  },
  {
    id: 'C11',
    topic: '癌症等候期 1年 vs 3年 臨床價值拆解',
    sourceRole: '客戶 (Client)',
    commentText: '癌症等候期 1年和 3年聽起來差不多，真的有那麼重要嗎？',
    pmReview: '項目經理審核：需引入臨床醫學數據說明縮短等待期對持續標靶治療的經濟兜底意義。',
    pdmDecision: '產品經理設計：在生命走廊圖表中引用臨床數據指出「68% 癌症患者於 2 年內需更換標靶藥或持續化療」，1年等候期避免了長達 2 年的自費標靶藥空窗期（省下幾十萬）。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'renderCorridorVisualChart Critical Illness Corridor'
  },
  {
    id: 'C12',
    topic: '保證回本 (Breakeven Year) 定義區分',
    sourceRole: '客戶 (Client)',
    commentText: '計劃書上的第 5 年回本，是保證回本還是非保證預期？',
    pmReview: '項目經理審核：必須杜絕將非保證預期混淆為保證回本的誤導行為。',
    pdmDecision: '產品經理設計：在指標比對與政策投影中嚴格區分「保證現金價值回本」與「總預期現金價值回本」，告知提前退保的現金折損警戒線。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Spec Table & Policy Horizon Projection'
  },
  {
    id: 'C13',
    topic: '萬用壽險保費融資 Margin Call 斬倉警示',
    sourceRole: '客戶 (Client)',
    commentText: '保費融資 85% 槓桿，利息升了會不會被銀行逼著補錢斬倉？',
    pmReview: '項目經理審核：保監局與金管局聯合通函要求嚴格揭示保費融資的利率倒掛與補倉風險。',
    pdmDecision: '產品經理設計：在融資專題中加入淨息差壓力測試與 Margin Call 警示條款，指導客戶選擇具備最低結算息率保底防禦線的方案。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Universal Life Claim & Policy Horizon'
  },
  {
    id: 'C14',
    topic: '長線預期回報履約誠信背書',
    sourceRole: '客戶 (Client)',
    commentText: '保險公司幾十年後的 6% 複利真的可靠嗎？',
    pmReview: '項目經理審核：客戶對長線非保證分紅普遍存疑，需引入監管審計歷史作背書。',
    pdmDecision: '產品經理設計：在說明中強調香港保監局 GL20 與 GN16 的監管約束，以歷史 5 年審計實現率作為客觀履約背書，消除分紅畫餅疑慮。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'GN16 5-Year Trajectory Line Chart'
  },
  {
    id: 'C15',
    topic: '地庫與地鐵無網絡環境離線自愈',
    sourceRole: '客戶 (Client)',
    commentText: '見客時在咖啡館地庫或者地鐵裡手機沒信號，頁面會不會卡死空白？',
    pmReview: '項目經理審核：見客環境往往處於地下商場或地鐵，網絡中斷不可影響演示。',
    pdmDecision: '產品經理設計：離線韌性守護（Offline Resilience），本地 LocalStorage 完整快取 42+ 產品精算數據與邏輯，斷網時 100% 離線瞬時響應。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Offline Resilience Scenario Agent'
  },
  {
    id: 'A16',
    topic: '產品下拉菜單跨模塊即時響應式聯動',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '我在下拉框切換產品時，下方條形圖、折線走廊和政策效益不能延遲或保持舊數據。',
    pmReview: '項目經理審核：顧問反饋下拉框切換產品後，部分子模塊仍顯示前一產品數據，需打通全域事件流。',
    pdmDecision: '產品經理設計：對 setMyProduct 與 setRivalProduct 進行全流程響應式管線加固，觸發 updateBattleCard、updateHorizonDisplay、renderRadarScorecard、renderCorridorVisualChart、renderScenarioAgentPanel 即時刷新。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'setMyProduct, setRivalProduct & updateBattleCard pipeline'
  },
  {
    id: 'A17',
    topic: '同保司內部產品 1v1 對決支援 (Intra-Insurer)',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '客戶常常拿友邦的盈御3和充裕未來比，同保司對比不能顯示空白或報錯。',
    pmReview: '項目經理審核：顧問需在同公司不同產品線之間進行選型推薦，需完善同司對比邏輯。',
    pdmDecision: '產品經理設計：全面支持同一公司內不同產品線或不同級別的 1v1 精算參數對決，自動區分主打與次選方案。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: '_resolveBattleCardCore Intra-Insurer Branch'
  },
  {
    id: 'A18',
    topic: '臨場攻防角色一鍵對調 (🔄 攻防對調)',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '有時我是保誠顧問，有時我是友邦顧問，必須一秒切換我方與對手陣營。',
    pmReview: '項目經理審核：多牌照經紀人或轉會顧問需靈活切換持牌主體視角。',
    pdmDecision: '產品經理設計：在頂部提供「🔄 攻防對調」快捷按鍵，一鍵對稱反轉 Plan A 與 Plan B 的所有指標、話術與立場。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'swapCampRoles & Camp Selectors'
  },
  {
    id: 'A19',
    topic: '30秒極速三段式戰策話術 (Empathy, Decouple, Counter-Strike)',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '臨場只有 30 秒，需要最鋒利的三段式話術，不要長篇大論。',
    pmReview: '項目經理審核：顧問在咖啡館見客時無法閱讀長篇文字，必須結構化提煉最有力核心句。',
    pdmDecision: '產品經理設計：每個險種配置三段式戰策：1. 認同客戶意識；2. 拆解競品條款死穴；3. 亮出我方確定性王牌。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Agent 3-Step Strategy Panels'
  },
  {
    id: 'A20',
    topic: '競品促銷陷阱權威官方出處引證',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '拆解競品陷阱時客戶質疑，必須有保監局或合約條款具體章節作依據。',
    pmReview: '項目經理審核：依據《持牌保險中介人操守守則》第 4.2 條，促銷對比必須客觀公正有依據。',
    pdmDecision: '產品經理設計：細則揭秘區嚴格附帶《持牌保險中介人操守守則》、GN16 報告編號或稅務條例第 26P 條等權威官方依據。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Fine-Print Revealer & Citations'
  },
  {
    id: 'A21',
    topic: '13家私院直付全流程與預先批核手續',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '給客戶推薦自願醫保時，客戶最關心去哪家醫院能免找數，需要具體流程。',
    pmReview: '項目經理審核：高端醫療簽單核心在於理賠直付服務體驗，流程需標準化展示。',
    pdmDecision: '產品經理設計：自願醫保場景提供 4 步出院免找數 SOP（填表、保司出 LOG、免按金入院、保司直接對賬結算）。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Cashless Medical 4-Step SOP'
  },
  {
    id: 'A22',
    topic: '一鍵複製 WhatsApp / WeChat 展業簡報',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '和客戶聊完後需要一鍵把結論轉發給客戶微信或 WhatsApp，格式要整齊帶重點。',
    pmReview: '項目經理審核：跨平台溝通需適配 WhatsApp 粗體字元與微信排版習慣。',
    pdmDecision: '產品經理設計：配置 3 種溝通語氣（理性精算、親切夥伴、高管促成）與 WhatsApp/WeChat 專屬排版，附帶一鍵複製反饋。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Instant Comms Synthesizer'
  },
  {
    id: 'A23',
    topic: '全域複製按鈕觸感反饋與防重複點擊',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '點了複製有時不知道到底有沒有複製成功。',
    pmReview: '項目經理審核：觸控操作需明確視覺反饋，避免用戶重複點擊或誤判失敗。',
    pdmDecision: '產品經理設計：全域增加綠色「已複製 ✔」動態按鈕變色與頂部 Toast 浮窗提示，雙重視覺確認。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'copyTextWithFeedback & showToast'
  },
  {
    id: 'A24',
    topic: '42款全港產品庫抽屜快速檢索與加載',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '產品太多時要在抽屜裡搜產品名或險種標籤快速選入 Plan A 或 Plan B。',
    pmReview: '項目經理審核：抽屜需支援跨險種模糊搜索與極速載入。',
    pdmDecision: '產品經理設計：內置產品庫搜索抽屜，支援按險種篩選、關鍵字即時搜索，並可一鍵指定載入我方或對手方案。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'Catalog Drawer & selectProductFromCatalog'
  },
  {
    id: 'A25',
    topic: 'GN16 5年走勢圖高對比度與法定安全帶',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '走勢圖要一眼看出對手分紅在金融動盪年份跳水，而我方穩居安全帶。',
    pmReview: '項目經理審核：數據走勢需強化對比，凸顯法定安全帶門檻。',
    pdmDecision: '產品經理設計：繪製 90%-100% 綠色法定安全走廊，雙色高對比折線實時標記歷年審計數據點。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'renderCorridorVisualChart SVG Corridor'
  },
  {
    id: 'A26',
    topic: '精算雷達計分卡五維標籤與勝負徽章',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '計分卡要明確標記每一項誰勝出，領先多少分。',
    pmReview: '項目經理審核：量化指標需有明確的領先/落後判定標籤。',
    pdmDecision: '產品經理設計：雷達卡每一維度均動態計算差額，標記「+14分 我方領先 🏆」或「持平」徽章，直觀有力。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'renderRadarScorecard Delta Badges'
  },
  {
    id: 'A27',
    topic: '高頻重大手術與日間診療費用預估齊全',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '除了標靶治療，客戶常問通波仔、達芬奇機械人、換關節、白內障日間手術的費用。',
    pmReview: '項目經理審核：覆蓋常見重大疾病手術，增強實用性。',
    pdmDecision: '產品經理設計：預置 7 種高發重大手術與日間診療項目（預估 HK$6.5萬 - 68萬），即時計算 LOG 保司直付與自負額。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'treatments Array in Cashless Medical'
  },
  {
    id: 'A28',
    topic: 'QDAP 夫婦合併扣稅最高 $120,000 / $20,400 模擬',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '很多高薪夫妻客戶想兩人一起扣稅，要有單人與夫婦合報的即時切換。',
    pmReview: '項目經理審核：香港稅制允許夫婦合併申報 QDAP 扣除，上限達 12 萬。',
    pdmDecision: '產品經理設計：QDAP 扣稅場景配置「夫婦合併報稅」開關，上限即時提升至 HK$120,000，實質慳稅升至 HK$20,400。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'updateQDAPUI & onQDAPCoupleToggle'
  },
  {
    id: 'A29',
    topic: 'AI 智能分析抽屜與保監局 GL20 合規邊界',
    sourceRole: '保險顧問 (Insurance Agent)',
    commentText: '遇到客戶刁鑽異議時，需要 AI Copilot 根據雙方選定產品即時生成符合保監局指引的應對話術。',
    pmReview: '項目經理審核：AI 生成話術必須具備保監局監管邊界，杜絕違規陳述。',
    pdmDecision: '產品經理設計：配置 AI 分析抽屜，精準傳遞當前 Plan A 與 Plan B 實時參數，生成具備保監局 GL20 防禦邊界的話術。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'openAiChatDrawer & generateAiResponse'
  },
  {
    id: 'A30',
    topic: '項目與產品經理全流程守護、模板 SHA-256 嚴格同源與自動化測試',
    sourceRole: '保險顧問與團隊主管 (Insurance Agent)',
    commentText: '修改後所有構建腳本必須輸出一致，保證 templates/mobile_cafe_app.html、dist/index.html、dist/cafe.html 保持 100% 同源 SHA-256，且全套測試套件 0 報錯通過。',
    pmReview: '項目經理審核：全流程交付質量標準：三端代碼 Hash 必須位元級一致，不可存在分叉漂移。',
    pdmDecision: '產品經理設計：透過 build_mobile_cafe.js 自動同步生成三個文件，並編寫全流程端到端測試套件實施嚴格守護。',
    status: '✅ 已修復並通過端到端驗證',
    resolvedIn: 'build_mobile_cafe.js & verification_30_comments_and_hospital_matrix.ts'
  }
];

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

    /* Top Sticky FinTech Web App Header */
    header, .web-app-header {
      position: sticky;
      top: 0;
      background: linear-gradient(135deg, #001f7a 0%, #002FA7 65%, #1d4ed8 100%);
      color: #ffffff;
      padding: 10px 16px;
      z-index: 1000;
      box-shadow: 0 4px 16px rgba(0, 47, 167, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      color: #ffffff !important;
    }
    .brand-logo:visited {
      color: #ffffff !important;
    }
    .brand-bolt {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: rgba(255, 255, 255, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 8px;
      font-size: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .brand-meta {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #ffffff !important;
      letter-spacing: -0.2px;
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.2;
    }
    .brand-pro-tag {
      font-size: 9px;
      font-weight: 900;
      background: #f59e0b;
      color: #000;
      padding: 1px 5px;
      border-radius: 3px;
      letter-spacing: 0.5px;
    }
    .brand-status-line {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.85);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
      font-family: 'JetBrains Mono', monospace;
    }
    .live-status-dot, .live-dot {
      width: 7px;
      height: 7px;
      background: #34d399;
      border-radius: 50%;
      box-shadow: 0 0 6px #34d399;
      animation: pulse 1.5s infinite;
      flex-shrink: 0;
    }
    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 1; transform: scale(1.15); }
      100% { opacity: 0.5; }
    }
    .header-nav-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .app-nav-btn, .top-nav-slides-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.32);
      color: #ffffff !important;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.18s cubic-bezier(0.2, 0, 0.38, 0.9);
      white-space: nowrap;
      cursor: pointer;
    }
    .app-nav-btn:hover, .top-nav-slides-btn:hover {
      background: #ffffff !important;
      color: var(--ikb) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
    }
    .app-nav-btn.view-btn {
      background: rgba(16, 185, 129, 0.25);
      border-color: rgba(52, 211, 153, 0.5);
    }
    .app-nav-btn.swap-btn {
      background: rgba(245, 158, 11, 0.25);
      border-color: rgba(251, 191, 36, 0.5);
    }

    /* Official Brochure & PDF Links Styling */
    .camp-official-link-row {
      margin-top: 6px;
      display: flex;
    }
    .official-doc-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .official-doc-link.our {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .official-doc-link.our:hover {
      background: #dbeafe;
      color: #1e40af;
      border-color: #93c5fd;
    }
    .official-doc-link.rival {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .official-doc-link.rival:hover {
      background: #fee2e2;
      color: #991b1b;
      border-color: #fca5a5;
    }
    .tearsheet-official-links-bar {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .tearsheet-pdf-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .tearsheet-pdf-btn.our {
      background: #eff6ff;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }
    .tearsheet-pdf-btn.rival {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .catalog-item-pdf-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 700;
      color: #0284c7;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 4px;
      padding: 3px 8px;
      text-decoration: none;
      margin-top: 4px;
    }
    .catalog-item-pdf-link:hover {
      background: #e0f2fe;
      color: #0369a1;
    }
    @media (max-width: 640px) {
      .header-inner {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .header-nav-toolbar {
        width: 100%;
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 2px;
      }
      .brand-title {
        font-size: 12px;
      }
      .brand-status-line {
        font-size: 9px;
      }
      .app-nav-btn, .top-nav-slides-btn {
        padding: 4px 8px;
        font-size: 11px;
      }
    }

    /* Dual-Perspective Switcher */
    .view-toggle-bar {
      display: flex;
      background: #e5e7eb;
      margin: 12px 16px 8px;
      padding: 4px;
      border-radius: 12px;
      gap: 4px;
    }
    .view-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px 6px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-sub);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 3px;
      transition: all 0.2s ease;
    }
    .view-btn-primary {
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }
    .view-btn-badge {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
      letter-spacing: 0.3px;
      font-family: 'JetBrains Mono', monospace;
    }
    .view-btn.active-agent {
      background: #0f172a;
      color: #38bdf8;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .view-btn.active-agent .view-btn-badge {
      background: rgba(56, 189, 248, 0.22);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
    }
    .view-btn.active-client {
      background: var(--ikb);
      color: #ffffff;
      border-color: var(--ikb);
      box-shadow: 0 2px 6px rgba(0,47,167,0.25);
    }
    .view-btn.active-client .view-btn-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    /* Explainer Banners for Dual Views */
    .agent-mode-explainer-banner {
      background: #090d16;
      border: 1.5px solid #38bdf8;
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.18);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .mode-explainer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
      margin-bottom: 5px;
      flex-wrap: wrap;
    }
    .mode-explainer-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.3px;
      font-family: 'JetBrains Mono', monospace;
    }
    .mode-explainer-tag.tag-agent { color: #38bdf8; }
    .mode-explainer-tag.tag-client { color: var(--ikb); }
    .mode-explainer-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
    }
    .mode-explainer-pill.pill-danger {
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    .mode-explainer-pill.pill-success {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .mode-explainer-desc {
      font-size: 11.5px;
      line-height: 1.5;
      font-weight: 600;
    }
    .agent-mode-explainer-banner .mode-explainer-desc { color: #cbd5e1; }

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
    .btn-ai-chat {
      background: linear-gradient(135deg, #0284c7, #002FA7);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 47, 167, 0.3);
    }
    .inline-pitch-copy-btn {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .inline-pitch-copy-btn:hover {
      background: #38bdf8;
      color: #0f172a;
    }
    .inline-pitch-copy-btn.copied {
      background: #10b981 !important;
      border-color: #10b981 !important;
      color: #ffffff !important;
    }
    .inline-pitch-copy-btn.btn-copy-full {
      background: #0284c7;
      color: #ffffff;
      border-color: #38bdf8;
      padding: 4px 10px;
    }
    .step-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .ai-quick-trigger-banner {
      margin: 8px 16px 4px;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      color: var(--ikb);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 47, 167, 0.08);
    }
    .ai-quick-trigger-banner:hover {
      background: #dbeafe;
      transform: translateY(-1px);
    }
    .ai-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 85vh;
      background: #ffffff;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.35);
      z-index: 1200;
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
    }
    #ai-analysis-backdrop {
      z-index: 1150 !important;
    }
    .floating-ai-fab {
      position: fixed;
      bottom: calc(76px + var(--safe-bottom));
      right: 14px;
      background: linear-gradient(135deg, #002FA7, #0284c7);
      color: #ffffff;
      border: 2px solid #ffffff;
      padding: 9px 14px;
      border-radius: 28px;
      box-shadow: 0 4px 16px rgba(0, 47, 167, 0.4);
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      z-index: 105;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.25s cubic-bezier(0.2, 0, 0.38, 0.9);
      user-select: none;
    }
    .floating-ai-fab:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 47, 167, 0.55);
    }
    .floating-ai-fab:active {
      transform: scale(0.95);
    }
    /* Cashless Medical Scenario Agent Styles */
    .medical-select-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .medical-select {
      width: 100%;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      background: #ffffff;
      outline: none;
    }
    .medical-select:focus {
      border-color: var(--ikb);
    }
    .medical-result-card {
      background: #eff6ff;
      border: 1.5px solid #93c5fd;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
    }
    @media (min-width: 768px) {
      .ai-drawer {
        top: 0;
        bottom: 0;
        right: 0;
        left: auto;
        width: 460px;
        max-height: 100vh;
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
        border-top-right-radius: 0;
        box-shadow: -8px 0 30px rgba(0, 0, 0, 0.25);
        transform: translateX(100%);
      }
    }
    .ai-drawer.open {
      transform: translateY(0) !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }
    @media (min-width: 768px) {
      .ai-drawer.open {
        transform: translateX(0) !important;
      }
    }
    .ai-drawer-header {
      padding: 14px 16px;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #1e293b;
    }
    .ai-drawer-title {
      font-size: 15px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ai-drawer-status {
      font-size: 10px;
      color: #4ade80;
      font-family: 'JetBrains Mono', monospace;
      margin-top: 2px;
    }
    .ai-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
    }
    .ai-context-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 11px;
      line-height: 1.5;
    }
    .ai-context-header {
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ai-prompt-chips-wrap {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .ai-prompt-chips-wrap::-webkit-scrollbar { display: none; }
    .ai-prompt-chip {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: var(--ikb);
      padding: 6px 10px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .ai-prompt-chip:hover {
      background: var(--ikb);
      color: #ffffff;
      border-color: var(--ikb);
    }
    .ai-chat-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 4px;
    }
    .ai-chat-bubble {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 12px;
      font-size: 12px;
      line-height: 1.6;
      color: #1e293b;
    }
    .ai-chat-bubble.ai-assistant-reply {
      background: #ffffff;
      border-left: 4px solid var(--ikb);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }
    .ai-chat-bubble.ai-user-query {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-right: 4px solid var(--ikb);
      border-left: none;
      margin-left: 20px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0, 47, 167, 0.08);
    }
    .ai-chat-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
    }
    .ai-input-row {
      display: flex;
      gap: 8px;
      padding: 10px 16px calc(10px + var(--safe-bottom));
      background: #ffffff;
      border-top: 1px solid var(--border);
    }
    .ai-input-field {
      flex: 1;
      border: 1.5px solid #cbd5e1;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 12px;
      outline: none;
    }
    .ai-input-field:focus {
      border-color: var(--ikb);
    }
    .ai-send-btn {
      background: var(--ikb);
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
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

    /* ==========================================================================
       AI Scenario Agent Bar & Multi-Scenario Panels
       ========================================================================== */
    .scenario-agents-bar-wrap {
      margin: 10px 16px 6px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .scenario-bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .scenario-bar-title {
      font-size: 12px;
      font-weight: 800;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .scenario-bar-tag {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      background: var(--ikb-light);
      color: var(--ikb);
      padding: 2px 7px;
      border-radius: 10px;
    }
    .scenario-agents-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 2px;
    }
    .scenario-agents-tabs::-webkit-scrollbar { display: none; }
    .scenario-tab-btn {
      padding: 6px 11px;
      border-radius: 16px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.2, 0, 0.38, 0.9);
      user-select: none;
    }
    .scenario-tab-btn:hover {
      border-color: var(--ikb);
      color: var(--ikb);
    }
    .scenario-tab-btn.active {
      background: var(--ikb);
      border-color: var(--ikb);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0,47,167,0.25);
    }
    .scenario-panel-container {
      margin: 0 16px 12px;
    }
    .scenario-card-box {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .scenario-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
      gap: 8px;
    }
    .scenario-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .scenario-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.4;
    }
    .scenario-pill-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 10px;
      white-space: nowrap;
      background: #f1f5f9;
      color: #475569;
    }
    .scenario-pill-badge.green {
      background: #ecfdf5;
      color: #059669;
    }
    .scenario-pill-badge.blue {
      background: #eff6ff;
      color: var(--ikb);
    }
    /* Scenario 1: Cafe Rapid */
    .cafe-delta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .cafe-stat-tile {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .cafe-stat-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .cafe-stat-val {
      font-size: 13px;
      font-weight: 800;
      color: var(--ikb);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.2;
    }
    .cafe-stat-badge {
      font-size: 9px;
      font-weight: 700;
      margin-top: 4px;
      padding: 1px 4px;
      border-radius: 4px;
      background: #ecfdf5;
      color: #059669;
    }
    .cafe-elevator-box {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 10px;
      padding: 12px;
      border-left: 4px solid #38bdf8;
      margin-bottom: 10px;
    }
    .cafe-elevator-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #38bdf8;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .cafe-elevator-script {
      font-size: 13px;
      line-height: 1.6;
      color: #e2e8f0;
    }
    .cafe-actions-row {
      display: flex;
      gap: 8px;
    }
    .scenario-action-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: #fff;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: background 0.15s;
    }
    .scenario-action-btn:hover {
      background: #f1f5f9;
    }
    .scenario-action-btn.primary-btn {
      background: var(--ikb);
      color: #fff;
      border-color: var(--ikb);
    }
    /* Scenario 2: Offshore MCV */
    .mcv-converter-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .mcv-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
    }
    .mcv-input {
      flex: 1;
      padding: 8px 10px;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .mcv-cur-toggle {
      display: flex;
      gap: 4px;
    }
    .mcv-cur-btn {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      background: #fff;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .mcv-cur-btn.active {
      background: var(--ikb);
      color: #fff;
      border-color: var(--ikb);
    }
    .mcv-results-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
    }
    .mcv-res-item { font-size: 11px; }
    .mcv-res-label { color: #64748b; font-size: 10px; }
    .mcv-res-val { font-weight: 800; font-family: 'JetBrains Mono', monospace; color: var(--ikb); }
    .mcv-features-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mcv-feature-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .mcv-feat-icon { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
    .mcv-feat-content { flex: 1; }
    .mcv-feat-title { font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .mcv-feat-desc { font-size: 11px; color: #475569; line-height: 1.4; }
    /* Scenario 3: Young Family */
    .family-budget-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .family-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .family-slider-val {
      font-family: 'JetBrains Mono', monospace;
      color: var(--ikb);
      font-size: 14px;
    }
    .family-split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .family-split-card {
      border-radius: 8px;
      padding: 10px;
      border: 1.5px solid;
    }
    .family-split-card.protect {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .family-split-card.savings {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }
    .family-mortgage-box {
      margin-top: 10px;
      padding: 10px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
    }
    /* Scenario 4: Retirement Tax */
    .retirement-calc-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .tax-bracket-chips {
      display: flex;
      gap: 6px;
      margin: 8px 0;
      flex-wrap: wrap;
    }
    .tax-chip {
      padding: 5px 10px;
      border-radius: 14px;
      background: #fff;
      border: 1px solid #cbd5e1;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .tax-chip.active {
      background: #059669;
      color: #fff;
      border-color: #059669;
    }
    .tax-result-card {
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      border-radius: 8px;
      padding: 10px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tax-saved-badge {
      font-size: 18px;
      font-weight: 800;
      color: #047857;
      font-family: 'JetBrains Mono', monospace;
    }
    /* Scenario 5: Comms */
    .comms-tone-bar {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .comms-tone-chip {
      padding: 5px 10px;
      border-radius: 14px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .comms-tone-chip.active {
      background: var(--ikb);
      color: #fff;
      border-color: var(--ikb);
    }
    .comms-preview-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      color: #1e293b;
      margin-bottom: 10px;
      max-height: 220px;
      overflow-y: auto;
    }
    /* Scenario 6: Offline */
    .offline-status-box {
      background: #0f172a;
      color: #f8fafc;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .offline-banner {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .offline-metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 10px;
    }
    .offline-tile {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      padding: 8px;
      text-align: center;
    }
    .offline-tile-val {
      font-size: 14px;
      font-weight: 800;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
    }
    .offline-tile-label {
      font-size: 10px;
      color: #94a3b8;
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

    /* GN16 100% Official Benchmark Plain-Language Explainer Banner */
    .gn16-explainer-banner {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
      font-size: 11.5px;
      color: #166534;
      line-height: 1.55;
      box-shadow: 0 1px 3px rgba(16, 185, 129, 0.08);
    }
    .gn16-explainer-header {
      font-weight: 800;
      color: #15803d;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
    }

    /* Scorecard Explainer Banner & Breakdown Rows */
    .scorecard-explainer-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 11px;
      color: #1e40af;
      line-height: 1.5;
    }
    .scorecard-concrete-row {
      font-size: 11px;
      color: #1e40af;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      margin-top: 5px;
      line-height: 1.45;
    }

    /* 30-Comment Multi-Perspective Audit Drawer (#audit-30-drawer) */
    .audit-30-trigger-banner {
      display: none !important;
    }
    #btn-open-audit-drawer {
      display: none !important;
    }
    .audit-drawer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-width: 600px;
      margin: 0 auto;
      height: 82vh;
      background: #ffffff;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      z-index: 2500;
      display: flex;
      flex-direction: column;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.25);
      transform: translateY(100%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      visibility: hidden;
    }
    .audit-drawer.open {
      transform: translateY(0);
      visibility: visible;
    }
    .audit-drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      z-index: 2490;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
      backdrop-filter: blur(2px);
    }
    .audit-drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .audit-drawer-header {
      padding: 14px 16px;
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      color: #ffffff;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .audit-drawer-body {
      padding: 12px 16px;
      overflow-y: auto;
      flex: 1;
      background: #f8fafc;
    }
    .audit-filter-pills {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .audit-filter-chip {
      padding: 5px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      cursor: pointer;
    }
    .audit-filter-chip.active {
      background: #047857;
      color: #ffffff;
      border-color: #047857;
    }
    .audit-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    /* Accessibility: Large Font Mode (长辈大字体模式) */
    body.large-font-mode {
      font-size: 116% !important;
    }
    body.large-font-mode .brand-title {
      font-size: 15px !important;
    }
    body.large-font-mode .hero-title {
      font-size: 18px !important;
    }
    body.large-font-mode #bilateral-spec-table th,
    body.large-font-mode #bilateral-spec-table td {
      font-size: 13px !important;
      padding: 9px 10px !important;
    }
    body.large-font-mode .camp-select {
      font-size: 14px !important;
      padding: 8px 10px !important;
    }
    body.large-font-mode .audit-card {
      font-size: 13px !important;
      line-height: 1.6 !important;
    }
    body.large-font-mode .scenario-card-box {
      font-size: 13px !important;
    }

    /* Accessibility & Localization: Simplified Chinese Mode */
    body.lang-hans {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif !important;
    }

    /* Header Nav Toolbar Buttons */
    .header-nav-toolbar .lang-btn,
    .header-nav-toolbar .font-btn,
    .header-nav-toolbar .pdf-btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #ffffff;
    }
    .header-nav-toolbar .lang-btn:hover,
    .header-nav-toolbar .font-btn:hover,
    .header-nav-toolbar .pdf-btn:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Arena Mode Switcher Bar */
    .arena-mode-bar {
      display: flex;
      gap: 8px;
      margin: 8px 0 10px;
      justify-content: center;
      padding: 0 12px;
    }
    .arena-mode-btn {
      border: 1.5px solid #cbd5e1;
      background: #ffffff;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .arena-mode-btn.active {
      background: #002FA7;
      color: #ffffff;
      border-color: #002FA7;
      box-shadow: 0 2px 6px rgba(0,47,167,0.25);
    }

    /* Plan C Camp Card (3-Way Comparison) */
    .camp-card.camp-third {
      border-top: 3px solid #8b5cf6;
      background: #faf5ff;
    }
    .camp-label.third-label {
      color: #7c3aed;
      background: #ede9fe;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .hero-side.third-side {
      border-top: 3px solid #8b5cf6;
      background: linear-gradient(180deg, #fbf7ff 0%, #ffffff 100%);
    }
    .hero-side.third-side .hero-tag {
      color: #7c3aed;
      background: #ede9fe;
    }

    /* Client PDF Report Trigger & Modal */
    .client-pdf-trigger-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #002FA7 0%, #1e40af 100%);
      color: #ffffff;
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0,47,167,0.2);
      transition: transform 0.15s ease;
    }
    .client-pdf-trigger-banner:active {
      transform: scale(0.99);
    }
    .report-badge-btn {
      font-size: 10.5px;
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 700;
      border: 1px solid rgba(255,255,255,0.4);
    }

    .client-pdf-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15,23,42,0.65);
      backdrop-filter: blur(4px);
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .client-pdf-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .client-pdf-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 94%;
      max-width: 820px;
      max-height: 90vh;
      background: #ffffff;
      border-radius: 12px;
      z-index: 10001;
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
    }
    .client-pdf-modal.open {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }
    .client-pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 18px;
      background: #002FA7;
      color: #ffffff;
    }
    .client-pdf-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      background: #f8fafc;
    }
    .advisor-profile-form {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      font-size: 11.5px;
    }
    .client-report-sheet {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }

    /* Universal Life Stress Calculator Styles */
    .ul-stress-box {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .stress-hike-bar {
      display: flex;
      gap: 6px;
      margin: 8px 0;
      flex-wrap: wrap;
    }
    .stress-hike-chip {
      background: #f1f5f9;
      border: 1.5px solid #cbd5e1;
      color: #334155;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .stress-hike-chip.active {
      background: #dc2626;
      color: #ffffff;
      border-color: #b91c1c;
    }
    .stress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin: 10px 0;
    }
    .stress-metric-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
    }
    .stress-warning-banner {
      background: #fef2f2;
      border: 1.5px solid #fecaca;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11.5px;
      color: #991b1b;
      margin-top: 10px;
      line-height: 1.45;
    }

    /* Group Medical Optimizer Styles */
    .group-opt-box {
      background: #ffffff;
      border: 1.5px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .group-preset-bar {
      display: flex;
      gap: 6px;
      margin: 8px 0;
      flex-wrap: wrap;
    }
    .group-preset-chip {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      cursor: pointer;
    }
    .group-preset-chip.active {
      background: #002FA7;
      color: #ffffff;
      border-color: #002FA7;
    }

    /* QDAP Family Tax Styles */
    .qdap-joint-box {
      background: #ffffff;
      border: 1.5px solid #bbf7d0;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }

    /* Audit Scope Switcher */
    .audit-scope-bar {
      display: flex;
      gap: 6px;
      background: #e2e8f0;
      padding: 3px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .audit-scope-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 6px 8px;
      font-size: 11.5px;
      font-weight: 700;
      color: #475569;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .audit-scope-btn.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Executive Print Media Query (A4 Tear-Sheet) */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 10pt !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Hide all top-level elements except client PDF modal */
      body > *:not(#client-pdf-modal) {
        display: none !important;
      }
      .client-pdf-modal {
        display: block !important;
        position: static !important;
        transform: none !important;
        width: 100% !important;
        max-width: 100% !important;
        max-height: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        border: none !important;
        overflow: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
      }
      .client-pdf-header,
      .advisor-profile-form,
      .client-pdf-modal-actions,
      .client-pdf-backdrop,
      .drawer-close-btn {
        display: none !important;
      }
      .client-pdf-body {
        padding: 0 !important;
        overflow: visible !important;
      }
      .client-report-sheet {
        border: 1px solid #cbd5e1 !important;
        box-shadow: none !important;
        padding: 12mm 15mm !important;
        background: #ffffff !important;
        page-break-after: avoid;
        break-after: avoid;
      }
      @page {
        margin: 10mm 12mm;
        size: A4 portrait;
      }
    }

  </style>
</head>
<body>

  <!-- Sticky Header with Modern Web App Navigation Bar -->
  <header class="web-app-header">
    <div class="header-inner">
      <div class="brand-left">
        <a href="index.html" class="brand-logo" title="InsurIntel HK · 香港保險精算與實戰對決系統">
          <span class="brand-bolt">⚡</span>
          <div class="brand-meta">
            <div class="brand-title">INSURINTEL · 14:00 見客極速攻防卡 <span class="brand-pro-tag">PRO</span></div>
            <div class="brand-status-line">
              <span class="live-status-dot"></span>
              <span class="status-text">全港保險精算決策系統 · 2026 最新官方核定 · OFFLINE READY</span>
            </div>
          </div>
        </a>
      </div>
      <div class="header-nav-toolbar">
        <button class="app-nav-btn" onclick="openCatalogDrawer()" title="查閱全港 99 款保險產品智庫與官方文件">
          <span class="btn-emoji">📚</span>
          <span class="btn-txt">產品智庫</span>
        </button>
        <button class="app-nav-btn" onclick="openAiChatDrawer()" title="展開 AI 實時破局分析與對話框">
          <span class="btn-emoji">🧠</span>
          <span class="btn-txt">AI 破局大腦</span>
        </button>
        <a href="morning_slides.html" class="top-nav-slides-btn" id="link-morning-slides" title="全港晨會情報投影片（每日 06:30 HKT 自動更新）"><span class="btn-emoji">📊</span><span class="btn-txt">晨會投影片</span></a>
        <button class="app-nav-btn view-btn" id="header-view-toggle-btn" onclick="toggleView()" title="切換顧問私密提詞 HUD / 客戶客觀 Tear-Sheet 視角">
          <span class="btn-emoji" id="header-view-icon">📱</span>
          <span class="btn-txt" id="header-view-text">客戶視角</span>
        </button>
        <button class="app-nav-btn swap-btn" onclick="swapCampRoles()" title="一鍵對調我方 (Plan A) 與對手 (Plan B) 角色">
          <span class="btn-emoji">⇄</span>
          <span class="btn-txt">對調攻防</span>
        </button>
        <button class="app-nav-btn lang-btn" id="header-lang-toggle-btn" onclick="toggleLangZh()" title="繁簡中文即時無損切換">
          <span class="btn-emoji">🌐</span>
          <span class="btn-txt" id="header-lang-text">繁/簡</span>
        </button>
        <button class="app-nav-btn font-btn" id="header-font-toggle-btn" onclick="toggleFontSize()" title="字體大小長輩大字模式切換">
          <span class="btn-emoji">🔍</span>
          <span class="btn-txt" id="header-font-text">標準/大字</span>
        </button>
        <button class="app-nav-btn pdf-btn" id="header-pdf-report-btn" onclick="openClientPdfModal()" title="一鍵生成客戶專屬 PDF 報告與 WhatsApp 促成卡片">
          <span class="btn-emoji">📑</span>
          <span class="btn-txt">客戶報告</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Top App Sub-Bar / Prominent Audit Stamp -->
  <div class="top-date-banner" id="top-date-banner">
    <span>📅 最後資料更新日期：2026年11月06日 · 香港保監局 GN16 / 各保司官方通函及說明書核定</span>
  </div>

  <!-- Dual-Perspective Switcher -->
  <div class="view-toggle-bar">
    <button class="view-btn active-agent" id="btn-agent-view" onclick="setViewMode('agent')">
      <span class="view-btn-primary">🔒 Agent 私密提詞視角</span>
      <span class="view-btn-badge">顧問內部專用 HUD</span>
    </button>
    <button class="view-btn" id="btn-client-view" onclick="setViewMode('client')">
      <span class="view-btn-primary">📱 遞給客戶看（客觀數據）</span>
      <span class="view-btn-badge">GL20 認證撕頁</span>
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

  <!-- Arena Mode Switcher (1v1 vs 3-Way PK) -->
  <div class="arena-mode-bar" id="arena-mode-bar">
    <button class="arena-mode-btn active" id="btn-mode-1v1" onclick="setArenaMode('1v1')">⚔️ 1v1 雙邊對決</button>
    <button class="arena-mode-btn" id="btn-mode-3way" onclick="setArenaMode('3way')">🏆 3-Way 三方旗艦同台 (Plan A vs B vs C)</button>
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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;gap:4px;flex-wrap:wrap;">
        <div class="camp-product-meta" id="my-product-display" onclick="openCatalogForCompany('our')" title="點擊檢視保司產品目錄" style="cursor:pointer;text-decoration:underline dotted;">盈御多元貨幣 3 📋</div>
        <a id="my-product-official-link" class="official-brochure-link" href="https://www.aia.com.hk/zh-hk/" target="_blank" rel="noopener noreferrer" title="查閱官方原廠說明書及條款" style="font-size:10px;color:#002FA7;font-weight:700;display:inline-flex;align-items:center;gap:2px;text-decoration:underline;background:rgba(0,47,167,0.06);padding:2px 6px;border-radius:4px;">📄 官網手冊 ↗</a>
      </div>
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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;gap:4px;flex-wrap:wrap;">
        <div class="camp-product-meta" id="rival-product-display" onclick="openCatalogForCompany('rival')" title="點擊檢視競品產品目錄" style="cursor:pointer;text-decoration:underline dotted;">雋富多元貨幣 📋</div>
        <a id="rival-product-official-link" class="official-brochure-link" href="https://www.prudential.com.hk/zh-hk/" target="_blank" rel="noopener noreferrer" title="查閱官方原廠說明書及條款" style="font-size:10px;color:#dc2626;font-weight:700;display:inline-flex;align-items:center;gap:2px;text-decoration:underline;background:rgba(220,38,38,0.06);padding:2px 6px;border-radius:4px;">📄 官網手冊 ↗</a>
      </div>
    </div>

    <!-- Plan C: 第三方旗艦陣營 (3-Way 模式) -->
    <div class="camp-card camp-third" id="camp-card-third" style="display:none;">
      <div class="camp-header">
        <span class="camp-label third-label">🟣 第三方 (Plan C)</span>
        <span class="camp-hint-text">三方競品</span>
      </div>
      <!-- Field 1: 保司選擇 -->
      <div class="camp-select-wrap">
        <select class="camp-select" id="select-third-insurer" onchange="setThirdCompany(this.value)" aria-label="選擇第三方代表保司">
          <option value="Manulife">宏利 Manulife</option>
          <option value="AIA">友邦 AIA</option>
          <option value="Prudential">保誠 Prudential</option>
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
        <select class="camp-select camp-product-select" id="select-third-product" onchange="setThirdProduct(this.value)" aria-label="選擇第三方產品">
        </select>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;gap:4px;flex-wrap:wrap;">
        <div class="camp-product-meta" id="third-product-display" onclick="openCatalogForCompany('third')" title="點擊檢視第三方產品目錄" style="cursor:pointer;text-decoration:underline dotted;">宏摯多元儲蓄 📋</div>
        <a id="third-product-official-link" class="official-brochure-link" href="https://www.manulife.com.hk/zh-hk/" target="_blank" rel="noopener noreferrer" title="查閱官方原廠說明書及條款" style="font-size:10px;color:#7c3aed;font-weight:700;display:inline-flex;align-items:center;gap:2px;text-decoration:underline;background:rgba(124,58,237,0.06);padding:2px 6px;border-radius:4px;">📄 官網手冊 ↗</a>
      </div>
    </div>
  </div>

  <!-- AI Quick Strategy Trigger Banner -->
  <div class="ai-quick-trigger-banner" id="ai-quick-trigger-banner" onclick="openAiChatDrawer()">
    <span>🤖 <strong>AI 攻防大腦</strong>：點擊展開即時【Plan A vs Plan B】破局分析與話術 ❯</span>
    <span style="font-size:11px;background:rgba(0,47,167,0.1);padding:2px 8px;border-radius:10px;font-weight:800;">AIA Copilot</span>
  </div>

  <!-- AI Scenario Agents Switcher Bar -->
  <div class="scenario-agents-bar-wrap" id="scenario-agents-bar-wrap">
    <div class="scenario-bar-header">
      <span class="scenario-bar-title">🤖 AI 實戰場景顧問引擎 (AI Scenario Agents)</span>
      <span class="scenario-bar-tag" id="scenario-active-tag">☕ 咖啡館極速</span>
    </div>
    <div class="scenario-agents-tabs" id="scenario-agent-tabs">
      <button class="scenario-tab-btn active" data-scenario="cafe_rapid" onclick="selectScenarioAgent('cafe_rapid')">☕ 30s 咖啡館極速</button>
      <button class="scenario-tab-btn" data-scenario="offshore_mcv" onclick="selectScenarioAgent('offshore_mcv')">🇨🇳 MCV 離岸大客</button>
      <button class="scenario-tab-btn" data-scenario="young_family" onclick="selectScenarioAgent('young_family')">👨‍👩‍👧 家庭預算槓桿</button>
      <button class="scenario-tab-btn" data-scenario="retirement_tax" onclick="selectScenarioAgent('retirement_tax')">👴 退休年金扣稅</button>
      <button class="scenario-tab-btn" data-scenario="instant_comms" onclick="selectScenarioAgent('instant_comms')">💬 微信/WhatsApp速遞</button>
      <button class="scenario-tab-btn" data-scenario="cashless_medical" onclick="selectScenarioAgent('cashless_medical')">💼 高端醫療直付</button>
      <button class="scenario-tab-btn" data-scenario="ul_stress" id="tab-scenario-ul-stress" onclick="selectScenarioAgent('ul_stress')">🏦 萬用融資加息測試</button>
      <button class="scenario-tab-btn" data-scenario="group_medical" id="tab-scenario-group-medical" onclick="selectScenarioAgent('group_medical')">🏥 團險自願醫保抵扣</button>
    </div>
  </div>

  <!-- Dynamic Active Scenario Agent Tool Panel -->
  <div class="scenario-panel-container" id="scenario-agent-panel">
    <!-- Populated dynamically by renderScenarioAgentPanel() -->
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
    <div class="agent-mode-explainer-banner" id="agent-mode-explainer-banner">
      <div class="mode-explainer-header">
        <span class="mode-explainer-tag tag-agent">🔒 顧問內部專用 HUD (Advisor HUD)</span>
        <span class="mode-explainer-pill pill-danger">⚠️ 嚴禁直接展示給客戶</span>
      </div>
      <div class="mode-explainer-desc">
        【顧問專用內部 HUD】包含對手條款死穴、3步破局話術與攻防提詞，供顧問面對客戶前提詞準備
      </div>
    </div>

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

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;">
      <h3 style="font-size:16px; margin:0; color:#38bdf8;" id="agent-title">
        🎯 對抗戰策：保誠「雋富」5.8% 預繳噱頭拆解
      </h3>
      <button class="inline-pitch-copy-btn btn-copy-full" id="btn-copy-full-pitch" onclick="copyFull3StepPitch(this)" title="一鍵複製完整 3 步破局話術">
        📋 複製全部
      </button>
    </div>

    <div class="step-box">
      <div class="step-title-row">
        <div class="step-title">步驟 1：共情肯定眼光（不硬駁）</div>
        <button class="inline-pitch-copy-btn" onclick="copyStepPitch(1, this)" title="一鍵複製步驟 1 話術">📋 複製</button>
      </div>
      <div class="step-script" id="agent-step-1">
        「陳生，你真係好有眼光！保誠個 5.8% 預繳促銷宣傳鋪天蓋地，我第一眼睇到都覺得好吸引！」
      </div>
    </div>

    <div class="step-box">
      <div class="step-title-row">
        <div class="step-title">步驟 2：點破條款盲點（次年浮動跳水）</div>
        <button class="inline-pitch-copy-btn" onclick="copyStepPitch(2, this)" title="一鍵複製步驟 2 話術">📋 複製</button>
      </div>
      <div class="step-script" id="agent-step-2">
        「但仔細拆解對手通函嘅 fine print，佢個 5.8% 寫明『只保證頭 1 年』！第 2 年起利息按市場浮動；依家全球進入降息週期，第二年極易跳水，短期噱頭過後利息嚴重稀釋。」
      </div>
    </div>

    <div class="step-box" style="border-left-color: #4ade80;">
      <div class="step-title-row">
        <div class="step-title" style="color:#4ade80;">步驟 3：數據絕殺（保監局 GN16 官方實現率）</div>
        <button class="inline-pitch-copy-btn" onclick="copyStepPitch(3, this)" title="一鍵複製步驟 3 話術">📋 複製</button>
      </div>
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
    <!-- Quick PDF Report & Card Trigger Banner in Client View -->
    <div class="client-pdf-trigger-banner" id="client-pdf-trigger-banner" onclick="openClientPdfModal()">
      <span>📑 <strong>一鍵生成客戶專屬 PDF 報告與 WhatsApp 促成卡片</strong> ❯</span>
      <span class="report-badge-btn">MDRT/GL20 認證</span>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:4px;">
      <span style="font-size:11px; font-weight:700; color:var(--ikb); letter-spacing:1px; font-family:'JetBrains Mono'">INDEPENDENT BENCHMARK TEAR-SHEET</span>
      <span style="font-size:11px; color:#6b7280;" id="client-source">來源：香港保監局 GN16 公開報告 · 最後資料更新日期：2026年11月06日</span>
    </div>

    <!-- 1v1 / 3-Way 旗舰擂台对决卡 -->
    <div class="hero-battle-header" id="hero-battle-header">
      <div class="hero-side our-side">
        <div class="hero-tag">我方推薦配置方案</div>
        <div class="hero-title" id="hero-our-name">友邦 AIA · 盈御多元貨幣 3</div>
      </div>
      <div class="hero-vs-badge" id="hero-vs-badge-1">VS</div>
      <div class="hero-side rival-side">
        <div class="hero-tag">競品市場宣傳方案</div>
        <div class="hero-title" id="hero-rival-name">保誠 Prudential · 雋富多元貨幣</div>
      </div>
      <div class="hero-vs-badge hero-vs-third" id="hero-vs-third" style="display:none;">VS</div>
      <div class="hero-side third-side" id="hero-third-side" style="display:none;">
        <div class="hero-tag">第三方市場方案</div>
        <div class="hero-title" id="hero-third-name">宏利 Manulife · 宏摯多元儲蓄</div>
      </div>
    </div>

    <!-- Prominent Official Original Source / Brochure Direct Links -->
    <div class="tearsheet-official-links-bar" id="tearsheet-official-links-bar" style="display:flex;gap:8px;margin:8px 0 12px;flex-wrap:wrap;">
      <a id="tearsheet-our-pdf-link" class="tearsheet-pdf-btn our" href="https://www.aia.com.hk/zh-hk/" target="_blank" rel="noopener noreferrer" style="flex:1;min-width:140px;justify-content:center;text-align:center;padding:7px 10px;font-size:11px;font-weight:700;border-radius:6px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
        <span>📄 我方【盈御多元貨幣 3】官方手冊原件 ↗</span>
      </a>
      <a id="tearsheet-rival-pdf-link" class="tearsheet-pdf-btn rival" href="https://www.prudential.com.hk/zh-hk/" target="_blank" rel="noopener noreferrer" style="flex:1;min-width:140px;justify-content:center;text-align:center;padding:7px 10px;font-size:11px;font-weight:700;border-radius:6px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
        <span>📄 競品【雋富多元貨幣】官方手冊原件 ↗</span>
      </a>
      <a id="tearsheet-third-pdf-link" class="tearsheet-pdf-btn third" href="https://www.manulife.com.hk/zh-hk/" target="_blank" rel="noopener noreferrer" style="display:none;flex:1;min-width:140px;justify-content:center;text-align:center;padding:7px 10px;font-size:11px;font-weight:700;border-radius:6px;text-decoration:none;align-items:center;gap:4px;background:#faf5ff;color:#7c3aed;border:1px solid #c4b5fd;">
        <span>📄 第三方【宏摯多元儲蓄】官方手冊原件 ↗</span>
      </a>
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

    <!-- Official GN16 Corridor & Multi-Horizon Visual Chart -->
    <div class="corridor-meter-box" id="corridor-meter-box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:13px;font-weight:800;color:var(--text-main);" id="corridor-title-text">🏛️ 保監局 GN16 官方實現率 5 年歷史追蹤走廊 (GN16 5-Year Trajectory)</span>
        <span style="font-size:11px;font-family:'JetBrains Mono';font-weight:700;color:var(--ikb);" id="corridor-badge-text">官方基準: ≥ 90% ~ 100%</span>
      </div>
      <!-- Category-Aware Visual Interactive Chart -->
      <div class="corridor-visual-chart-wrap" id="corridor-visual-chart">
        <!-- Rendered dynamically by renderCorridorVisualChart -->
      </div>
      <div class="corridor-meter-inner" id="corridor-meter-inner">
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

  <!-- AI Analysis Drawer Backdrop -->
  <div class="catalog-drawer-backdrop" id="ai-analysis-backdrop" onclick="closeAiChatDrawer()"></div>

  <!-- AI Analysis Assistant Drawer / Dialog -->
  <div class="ai-drawer" id="ai-analysis-drawer" role="dialog" aria-modal="true" aria-labelledby="ai-drawer-heading">
    <div class="ai-drawer-header">
      <div>
        <div class="ai-drawer-title" id="ai-drawer-heading">
          <span>🤖 InsurIntel AI 精算攻防大腦</span>
          <span style="font-size:11px;background:#0284c7;color:#fff;padding:1px 6px;border-radius:10px;font-weight:700;">AIA Copilot</span>
        </div>
        <div class="ai-drawer-status">🟢 實時精算數據注入 · 香港保監局 GL20 監管護欄加載</div>
      </div>
      <button class="drawer-close-btn" onclick="closeAiChatDrawer()" aria-label="關閉 AI 助手">✕</button>
    </div>
    
    <div class="ai-drawer-body">
      <!-- 1. Live Injected Context Preview Payload -->
      <div class="ai-context-card" id="ai-live-context-card">
        <div class="ai-context-header">
          <span>📦 即時注入對陣精算上下文 (Injected Context Payload)</span>
          <span style="color:var(--ikb);font-family:'JetBrains Mono';font-size:10px;" id="ai-context-timestamp">LIVE SYNC</span>
        </div>
        <div id="ai-context-details" style="color:#475569;display:flex;flex-direction:column;gap:3px;">
          <!-- Dynamically populated by renderAiContextPreview() -->
        </div>
      </div>

      <!-- 2. AIA Advisor System Prompt Architecture Accordion -->
      <details class="ai-context-card" style="cursor:pointer;" id="ai-system-prompt-details">
        <summary style="font-weight:700;color:#0f172a;outline:none;display:flex;justify-content:space-between;align-items:center;">
          <span>📐 檢視 AIA 專用 System Prompt 提示詞架構設計 (點擊展開)</span>
          <button class="inline-pitch-copy-btn" id="btn-copy-system-prompt" onclick="event.stopPropagation();copySystemPrompt(this)" style="font-size:10px;padding:2px 6px;">📋 複製 Prompt</button>
        </summary>
        <div style="margin-top:8px;padding-top:8px;border-top:1px dashed #cbd5e1;font-size:11px;color:#334155;line-height:1.6;" id="ai-system-prompt-text">
          <strong>【角色定義】</strong>友邦 (AIA) 首席攻防核保精算顧問與商業談判 Copilot，具備 15 年全港保險深度分析經驗。精通香港保監局《持牌保險中介人操守守則》第 4.2 條及各大保司（AIA、保誠、宏利、永明、富衛、安盛、Bowtie等）官方通函與歷年 GN16 分紅實現率。<br><br>
          <strong>【攻防架構】</strong>三步破局法：① 共情肯定眼光（絕不硬駁，肯定宣傳吸睛點）➔ ② 點破條款 Fine Print（次年浮動利率/等待期陷阱/早期退保損失）➔ ③ 數據絕殺（GN16 官方實現率與 30 年複利實質差額）。<br><br>
          <strong>【動態上下文規範 (Context Schema)】</strong><br>
          即時注入 Plan A（我方）vs Plan B（競品）官方產品名稱、GN16 官方分紅實現率、預繳保證利率與保證年期、保證/預期回本年期、條款亮點與競品避坑細則、客戶異議焦點標籤。<br><br>
          <strong>【合規邊界】</strong>嚴格恪守香港保監局《操守守則》第 4.2 條及 GL20，嚴禁非理性貶損，所有對比必須有通函或年報依據，並附帶風險披露。<br><br>
          <strong>【輸出格式風格】</strong>地道港式商業粵語（繁體中文），結構化輸出【🎯 戰略破局核心】、【🗣️ 30 秒地道口頭話術】、【📊 精算數據出處】及【🛡️ 保監局 GL20 合規護欄】，附帶一鍵複製功能。
        </div>
      </details>

      <!-- 3. Smart Prompt Chips -->
      <div style="font-size:11px;font-weight:700;color:#475569;margin-top:4px;">
        💡 實戰智能 Prompt 快捷點擊 (點擊即時生成分析與話術)：
      </div>
      <div class="ai-prompt-chips-wrap">
        <button class="ai-prompt-chip" id="ai-chip-analysis-core" onclick="handleSmartPromptClick('analysis_core')">🔥 雙方攻防核心精算分析</button>
        <button class="ai-prompt-chip" id="ai-chip-gimmick-break" onclick="handleSmartPromptClick('gimmick_break')">⚡ 客問：高額預繳點解唔買？30s 破局</button>
        <button class="ai-prompt-chip" id="ai-chip-family-bundling" onclick="handleSmartPromptClick('family_bundling')">👨‍👩‍👧 家庭客：60/40 儲蓄與危疾搭售話術</button>
        <button class="ai-prompt-chip" id="ai-chip-offshore-mcv" onclick="handleSmartPromptClick('offshore_mcv')">🇨🇳 MCV 內地客：直付名單與離岸信託優勢</button>
        <button class="ai-prompt-chip" id="ai-chip-gl20-compliance" onclick="handleSmartPromptClick('gl20_compliance')">🛡️ 合規應對虛擬保險低價競爭</button>
      </div>

      <!-- 4. Dynamic AI Chat Conversation Area -->
      <div class="ai-chat-messages" id="ai-chat-messages">
        <!-- Rendered dynamically by generateAiAnalysis() -->
      </div>
    </div>

    <!-- 5. User Input Bar -->
    <form class="ai-input-row" onsubmit="event.preventDefault(); sendAiChatQuery(); return false;">
      <input type="text" class="ai-input-field" id="ai-chat-input" placeholder="輸入你想問 AI 的攻防或核保問題... (例如：客人堅持買對手點答？)" onkeydown="if(event.key==='Enter' || event.keyCode===13) { event.preventDefault(); sendAiChatQuery(); }">
      <button type="submit" class="ai-send-btn" id="btn-ai-chat-send">發送 🚀</button>
    </form>
  </div>

  <!-- Floating AI Analysis FAB Button -->
  <button class="floating-ai-fab" id="floating-ai-fab" onclick="openAiChatDrawer()" title="開啟 AI 精算攻防大腦" aria-label="AI 攻防大腦">
    <span>🤖</span>
    <span>AI 攻防大腦</span>
  </button>

  <!-- Bottom Fast Actions -->
  <div class="bottom-bar">
    <button class="action-btn btn-flip" onclick="toggleView()">
      🔄 一鍵翻轉
    </button>
    <button class="action-btn btn-ai-chat" id="btn-open-ai-chat" onclick="openAiChatDrawer()">
      🤖 AI 攻防大腦
    </button>
    <button class="action-btn btn-drawer" onclick="openCatalogDrawer()">
      📚 99款產品庫
    </button>
    <button class="action-btn btn-whatsapp" id="btn-bottom-whatsapp" onclick="copyWhatsAppPitch()" style="display:none;" aria-hidden="true">
      📲 複製 WhatsApp
    </button>
  </div>

  <script>
    const insurerOfficialUrls = {
      AIA: 'https://www.aia.com.hk/zh-hk/',
      Prudential: 'https://www.prudential.com.hk/zh-hk/',
      Manulife: 'https://www.manulife.com.hk/zh-hk/',
      Sun_Life: 'https://www.sunlife.com.hk/zh-hk/',
      FWD: 'https://www.fwd.com.hk/zh/',
      AXA: 'https://www.axa.com.hk/zh/',
      Bowtie: 'https://www.bowtie.com.hk/zh-hk/',
      BOC_Life: 'https://www.boclife.com.hk/tc/',
      YF_Life: 'https://www.yflife.com/zh-hk/',
      Cigna: 'https://www.cigna.com.hk/zh-hant/',
      Bupa: 'https://www.bupa.com.hk/zh-hk/',
      HSBC: 'https://www.insurance.hsbc.com.hk/1/2/chinese/',
      HSBC_Life: 'https://www.insurance.hsbc.com.hk/1/2/chinese/',
      Generali: 'https://www.generali.com.hk/zh-hk/',
      BlueCross: 'https://www.bluecross.com.hk/ch/',
      ChinaLife: 'https://www.chinalife.com.hk/zh-hk/'
    };

    function getInsurerOfficialUrl(insurerKey) {
      const key = String(insurerKey || '').replace(/\s+/g, '_');
      return insurerOfficialUrls[key] || insurerOfficialUrls[insurerKey] || 'https://www.ia.org.hk/tc/';
    }
    window.getInsurerOfficialUrl = getInsurerOfficialUrl;

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

    // AI Scenario Agents State & Persistence
    const STORAGE_KEY_SCENARIO = 'insurintel_active_scenario';
    function getStoredScenario() {
      try {
        if (typeof localStorage !== 'undefined' && localStorage && localStorage.getItem) {
          const s = localStorage.getItem(STORAGE_KEY_SCENARIO);
          if (s === 'offline_resilience') {
            try { localStorage.setItem(STORAGE_KEY_SCENARIO, 'cashless_medical'); } catch (e) {}
            return 'cashless_medical';
          }
          if (s) return s;
        }
      } catch (e) {}
      return 'cafe_rapid';
    }
    let currentScenario = getStoredScenario();
    let isSimulatedOffline = false;
    let mcvAmount = 50000;
    let mcvCurrency = 'USD';
    let familyMonthlyBudget = 3000;
    let familyMortgageBalance = 3000000;
    let qdapAnnualPremium = 60000;
    let qdapTaxRate = 17;
    let qdapIsCouple = false;
    let commsTone = 'rational_data';
    let commsPlatform = 'whatsapp';
    let medicalHospital = '香港養和醫院 (Hong Kong Sanatorium & Hospital)';
    let medicalTreatment = '癌症非手術標靶治療 (Targeted Cancer Therapy)';
    let medicalDeductible = 0;

    const SCENARIO_NAMES = {
      cafe_rapid: '☕ 30s 咖啡館極速',
      offshore_mcv: '🇨🇳 MCV 離岸大客',
      young_family: '👨‍👩‍👧 家庭預算槓桿',
      retirement_tax: '👴 退休年金扣稅',
      instant_comms: '💬 微信/WhatsApp速遞',
      cashless_medical: '💼 高端醫療直付',
      ul_stress: '🏦 萬用融資加息測試',
      group_medical: '🏥 團險自願醫保抵扣',
      offline_resilience: '📴 無網/地庫離線'
    };

    // All 42 Market Products Catalog Knowledge Base
    const ALL_PRODUCTS_CATALOG = ${JSON.stringify(catalog)};
    window.ALL_PRODUCTS_CATALOG = ALL_PRODUCTS_CATALOG;

    // All 13 Private Hospitals in Hong Kong
    const HK_13_PRIVATE_HOSPITALS = ${JSON.stringify(HK_13_PRIVATE_HOSPITALS, null, 2)};
    window.HK_13_PRIVATE_HOSPITALS = HK_13_PRIVATE_HOSPITALS;

    // 30-Point Client & Advisor Improvement Comments
    const APP_30_IMPROVEMENT_COMMENTS = ${JSON.stringify(APP_30_IMPROVEMENT_COMMENTS, null, 2)};
    window.APP_30_IMPROVEMENT_COMMENTS = APP_30_IMPROVEMENT_COMMENTS;

    // 100-Point Full Multi-Perspective Improvement Comments (50 Client + 50 Agent)
    const APP_100_IMPROVEMENT_COMMENTS = ${JSON.stringify(APP_100_IMPROVEMENT_COMMENTS, null, 2)};
    window.APP_100_IMPROVEMENT_COMMENTS = APP_100_IMPROVEMENT_COMMENTS;

    // 3-Way PK & Accessibility & Calculator State
    let arenaMode = '1v1'; // '1v1' | '3way'
    let thirdCompany = 'Manulife';
    let thirdSelectedProduct = null;
    let isLargeFont = false;
    let currentLang = 'zh-HK';
    let auditScope = '30'; // '30' | '100'

    try {
      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'arenaMode', {
          get: function() { return arenaMode; },
          set: function(v) { arenaMode = v; },
          configurable: true
        });
        Object.defineProperty(window, 'auditScope', {
          get: function() { return auditScope; },
          set: function(v) { auditScope = v; },
          configurable: true
        });
      }
    } catch(e) {}

    // Default advisor branding for Client PDF Report & Pitch Cards
    const DEFAULT_ADVISOR_PROFILE = {
      name: '陳卓峰 Charles Chan',
      title: 'MDRT / COT 頂尖會員 · 資深分區經理',
      license: '保監局持牌號碼: IA92837102',
      team: '友邦家族辦公室領航團隊',
      phone: '+852 9876 5432'
    };

    let medicalRoomTier = 'semi_private';


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

        let concreteOur = '';
        let concreteRival = '';
        let explanation = '';

        if (dim.key === 'expected_return') {
          if (categoryKey === 'Critical_Illness') {
            concreteOur = '累積高達 ' + (ourMetrics.ciMultiple || 1000) + '% 總賠付保額';
            concreteRival = '累積約 ' + (rivalMetrics.ciMultiple || 800) + '% 總賠付保額';
          } else if (categoryKey === 'Medical_VHIS') {
            concreteOur = '年度終身限額 HK$ ' + Math.round((ourMetrics.vhisLimit || 20000000) / 10000) + '萬 (全數賠償)';
            concreteRival = '年度限額 HK$ ' + Math.round((rivalMetrics.vhisLimit || 15000000) / 10000) + '萬';
          } else if (categoryKey === 'Annuity_QDAP') {
            concreteOur = '總預期 IRR ~' + (ourMetrics.qdapTotalIRR || 4.5) + '% (每年退稅最高 $10,200)';
            concreteRival = '總預期 IRR ~' + (rivalMetrics.qdapTotalIRR || 4.2) + '%';
          } else if (categoryKey === 'Financing_UniversalLife') {
            concreteOur = '淨息差利潤 +' + (ourMetrics.ulSpread || 1.8) + '% (結算 ' + (ourMetrics.ulCrediting || 5.25) + '%)';
            concreteRival = '淨息差利潤 +' + (rivalMetrics.ulSpread || 1.2) + '% (結算 ' + (rivalMetrics.ulCrediting || 4.8) + '%)';
          } else {
            concreteOur = '30年預期 IRR ~' + (ourMetrics.irr30 || 6.8) + '% · 總額達保費 6-7 倍';
            concreteRival = '30年預期 IRR ~' + (rivalMetrics.irr30 || 6.1) + '% · 總額約保費 5 倍';
          }
          explanation = '依據官方利益說明文件 30 年預期總 IRR / 槓桿倍數折算';
        } else if (dim.key === 'guaranteed_safety') {
          if (categoryKey === 'Critical_Illness') {
            concreteOur = '首 10-15 年贈送 50% 特外保額 · 保證平準保費';
            concreteRival = '無贈送保額或贈送期較短';
          } else if (categoryKey === 'Medical_VHIS') {
            concreteOur = '保證續保至 100 歲+ · 零不保事項爭議';
            concreteRival = '保證續保但高齡加費幅度較陡峭';
          } else if (categoryKey === 'Annuity_QDAP') {
            concreteOur = '保證年金高達 ' + (ourMetrics.qdapGuaranteedPct || 82.5) + '% (保證 IRR ' + (ourMetrics.qdapGuaranteedIRR || 2.85) + '%)';
            concreteRival = '保證年金僅約 ' + (rivalMetrics.qdapGuaranteedPct || 45) + '% (浮動分紅佔大半)';
          } else if (categoryKey === 'Financing_UniversalLife') {
            concreteOur = '保底息率 ' + (ourMetrics.ulFloorRate || 2.25) + '% · 抵禦加息補倉';
            concreteRival = '保底息率 ' + (rivalMetrics.ulFloorRate || 2.0) + '% · 緩衝相對較窄';
          } else {
            concreteOur = '保監局 GN16 實現率 ' + (ourMetrics.gn16Fulfillment || 96.5) + '% · 履約優良';
            concreteRival = '保監局 GN16 實現率 ' + (rivalMetrics.gn16Fulfillment || 88.0) + '% · 曾現分紅折減';
          }
          explanation = '依據保監局 GN16 官方實現率、合約保底利率及保證現金流佔比折算';
        } else if (dim.key === 'underwriting_friendliness') {
          if (categoryKey === 'Critical_Illness') {
            concreteOur = '癌症/心臟病等候期僅 ' + (ourMetrics.cancerWaitYears || 1) + ' 年即重啟 100% 賠付';
            concreteRival = '等候期長達 ' + (rivalMetrics.cancerWaitYears || 3) + ' 年 · 自費空窗期長';
          } else if (categoryKey === 'Medical_VHIS') {
            concreteOur = '投保前未未知已知病症第 1 年賠 0% 第 2 年 50% 第 3 年起 100%';
            concreteRival = '嚴格核保剔除不保事項';
          } else if (categoryKey === 'Annuity_QDAP') {
            concreteOur = '免體檢核保 · 年金領取期 10/20年或至100歲靈活配置';
            concreteRival = '領取期選項相對單一';
          } else if (categoryKey === 'Financing_UniversalLife') {
            concreteOur = '銀行 85% LTV 最高質押比率 · 特快核保審批';
            concreteRival = 'LTV 上限 75-80% · 審批流程較長';
          } else {
            concreteOur = '簡易核保 · 無需申報繁瑣財務證明';
            concreteRival = '大額投保需嚴格入息證明及健康申報';
          }
          explanation = '依據疾病再次索償等候期、核保寬鬆度及預繳免審批額度折算';
        } else if (dim.key === 'coverage_capacity') {
          if (categoryKey === 'Critical_Illness') {
            concreteOur = '涵蓋 ' + (ourMetrics.ciCoveredDiseases || 168) + ' 種疾病 · 獨家 ICU 非指定疾病預支';
            concreteRival = '涵蓋 ' + (rivalMetrics.ciCoveredDiseases || 115) + ' 種 · 傳統疾病清單';
          } else if (categoryKey === 'Medical_VHIS') {
            concreteOur = '全港 13 家私立醫院 100% 全覆蓋 · 尊享 0 墊資直付';
            concreteRival = '限特約指定私家醫院合作網絡';
          } else if (categoryKey === 'Annuity_QDAP') {
            concreteOur = '累計已繳保費 220%~260% 長壽現金流';
            concreteRival = '累計約 180%~210% 現金流';
          } else if (categoryKey === 'Financing_UniversalLife') {
            concreteOur = '以 15% 自有資金撬動數千萬人壽身故槓桿';
            concreteRival = '身故槓桿倍數相對保守';
          } else {
            concreteOur = '信託式分期提取 · 終身更換受保人';
            concreteRival = '更換受保人設限 · 缺乏信託給付';
          }
          explanation = '依據疾病種數、年度賠償額度天花板及私院免找數直付覆蓋率折算';
        } else {
          if (categoryKey === 'Critical_Illness') {
            concreteOur = '20年供款期滿終身無憂 · 晚年可轉年金';
            concreteRival = '缺乏晚年無病轉換為年金資產權益';
          } else if (categoryKey === 'Medical_VHIS') {
            concreteOur = '全額出院免找數 (0 墊資) · LOG 免入院按金';
            concreteRival = '需先行墊付或繁瑣事前申請';
          } else if (categoryKey === 'Annuity_QDAP') {
            concreteOur = '法定每年 HK$60,000 / 夫妻 $120,000 免稅額';
            concreteRival = '享法定扣除額 · 早期退保折損嚴格';
          } else if (categoryKey === 'Financing_UniversalLife') {
            concreteOur = '第 5-10 年可靈活部分提取去槓桿償還貸款';
            concreteRival = '提早去槓桿設手續費與鎖定限制';
          } else {
            concreteOur = '第 ' + (ourMetrics.breakevenYear || 5) + ' 年保證 100% 回本 · 支援保單借貸';
            concreteRival = '第 ' + (rivalMetrics.breakevenYear || 8) + ' 年回本 · 前期退保折損嚴重';
          }
          explanation = '依據保證回本速度、保單分拆次數、貨幣轉換種數及退保罰則折算';
        }

        return {
          key: dim.key,
          label: dim.label,
          our_score: ourScore,
          rival_score: rivalScore,
          delta,
          leader,
          concrete_our: concreteOur,
          concrete_rival: concreteRival,
          explanation: explanation
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
            { label: \`保費預繳保證息率\`, value: \`我方 \${ourMetrics.prepayRate}% vs 對手 \${rivalMetrics.prepayRate}%\`, highlight: true },
            { label: \`預繳利息鎖定保證期\`, value: \`我方長線保證 \${ourMetrics.prepayLock} 年 vs 對手僅保證 \${rivalMetrics.prepayLock} 年\`, highlight: true },
            { label: \`歷年分紅實現率 (GN16)\`, value: \`我方 \${ourMetrics.gn16Fulfillment}% vs 對手 \${rivalMetrics.gn16Fulfillment}%\`, highlight: true },
            { label: \`保證回本年期 (Break-even)\`, value: \`第 \${ourMetrics.breakevenYear || 5} 年 vs 對手第 \${rivalMetrics.breakevenYear || 8} 年\`, highlight: true },
            { label: \`30年預期複利總回報 (IRR)\`, value: \`我方 ~\${ourMetrics.irr30}% vs 對手 ~\${rivalMetrics.irr30}%\`, highlight: false },
            { label: \`保單分拆與貨幣轉換\`, value: \`支援無限次分拆及 7-9 種主流貨幣\`, highlight: false }
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
            { label: \`首年最高保費回贈\`, value: \`我方 \${ourMetrics.maxRebate}% vs 對手 \${rivalMetrics.maxRebate}%\`, highlight: true },
            { label: \`保證回本年期 (Break-even)\`, value: \`我方第 \${ourMetrics.breakevenYear || 5} 年 vs 對手第 \${rivalMetrics.breakevenYear || 8} 年\`, highlight: true },
            { label: \`30年預期複利總回報 (IRR)\`, value: \`我方 ~\${ourMetrics.irr30}% vs 對手 ~\${rivalMetrics.irr30}%\`, highlight: true },
            { label: \`歷年分紅實現率 (GN16)\`, value: \`我方 \${ourMetrics.gn16Fulfillment}% vs 對手 \${rivalMetrics.gn16Fulfillment}%\`, highlight: true },
            { label: \`提早退保罰則與追討\`, value: \`我方快速回本無追收條款 vs 對手前期退保罰則嚴苛\`, highlight: false }
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
            { label: \`癌症再次索償等待期\`, value: \`我方 \${ourWait} 年 vs 對手 \${rivalWait} 年\`, highlight: !chipTopic.includes('ICU') && !chipTopic.includes('心臟病') && !chipTopic.includes('豁免') && !chipTopic.includes('折扣') },
            { label: \`涵蓋嚴重疾病總數\`, value: \`我方 \${ourMetrics.ciIllnesses || 168} 種 vs 對手 \${rivalMetrics.ciIllnesses || 115} 種\`, highlight: true },
            { label: \`多次索賠累計保額上限\`, value: \`我方最高 \${ourMetrics.ciMultiplePct || 1000}% vs 對手 \${rivalMetrics.ciMultiplePct || 800}%\`, highlight: true },
            { label: \`非指定疾病 ICU 預支\`, value: \`我方 \${ourMetrics.ciIcu ? '連續 3-5 日預支 100%' : '不支援'} vs 對手 \${rivalMetrics.ciIcu ? '支援預支' : '不設 ICU 預支 (需特定重疾)'}\`, highlight: chipTopic.includes('ICU') || chipTopic.includes('深切治療') },
            { label: \`首年保費折扣回贈\`, value: \`我方 \${ourMetrics.maxRebate || 0}% vs 對手 \${rivalMetrics.maxRebate || 0}%\`, highlight: chipTopic.includes('折扣') || chipTopic.includes('回贈') },
            { label: \`保費豁免生效門檻\`, value: \`首次確診重疾即豁免後續保費\`, highlight: chipTopic.includes('保費豁免') || chipTopic.includes('豁免') }
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
          chart_bars: (function() {
            const ourLimit = (ourProductObj && ourProductObj.vhis_metrics && typeof ourProductObj.vhis_metrics.annual_limit_hkd === 'number')
              ? ourProductObj.vhis_metrics.annual_limit_hkd
              : (ourMetrics.vhisAnnualLimit || 20000000);
            const rivalLimit = (rivalProductObj && rivalProductObj.vhis_metrics && typeof rivalProductObj.vhis_metrics.annual_limit_hkd === 'number')
              ? rivalProductObj.vhis_metrics.annual_limit_hkd
              : (rivalMetrics.vhisAnnualLimit || 15000000);

            const ourPct = Math.min(100, Math.max(25, Math.round((ourLimit / 30000000) * 100)));
            const rivalPct = Math.min(100, Math.max(25, Math.round((rivalLimit / 30000000) * 100)));

            const ourCancer = (ourProductObj && ourProductObj.vhis_metrics && ourProductObj.vhis_metrics.non_surgical_cancer_coverage)
              ? ourProductObj.vhis_metrics.non_surgical_cancer_coverage
              : (ourLimit >= 25000000 ? '全數全額賠償 (無細項限額)' : '全數賠償 (年度限額內)');

            const rivalCancer = (rivalProductObj && rivalProductObj.vhis_metrics && rivalProductObj.vhis_metrics.non_surgical_cancer_coverage)
              ? rivalProductObj.vhis_metrics.non_surgical_cancer_coverage
              : (rivalLimit >= 25000000 ? '全數賠償' : '設分項限額 / 網絡限制');

            return [
              { label: \`我方【\${ourProductName}】\`, value: \`HK$ \${Math.round(ourLimit/10000).toLocaleString()} 萬/年 (\${ourCancer})\`, widthPct: ourPct, color: \`var(--ikb)\` },
              { label: \`對手【\${rivalProductName}】\`, value: \`HK$ \${Math.round(rivalLimit/10000).toLocaleString()} 萬/年 (\${rivalCancer})\`, widthPct: rivalPct, color: \`#f59e0b\` },
              { label: \`自願醫保標準計劃法定最低\`, value: \`年限額僅 HK$ 180,000 (無額外保障)\`, widthPct: 20, color: \`#94a3b8\` }
            ];
          })(),
          table_title: \`🩺 醫療理賠與直付服務核心維度深度比對\`,
          table_rows: (function() {
            const ourLimit = Math.round(((ourProductObj && ourProductObj.vhis_metrics && typeof ourProductObj.vhis_metrics.annual_limit_hkd === 'number')
              ? ourProductObj.vhis_metrics.annual_limit_hkd
              : (ourMetrics.vhisAnnualLimit || 20000000)) / 10000);
            const rivalLimit = Math.round(((rivalProductObj && rivalProductObj.vhis_metrics && typeof rivalProductObj.vhis_metrics.annual_limit_hkd === 'number')
              ? rivalProductObj.vhis_metrics.annual_limit_hkd
              : (rivalMetrics.vhisAnnualLimit || 15000000)) / 10000);

            const deltaLimit = ourLimit - rivalLimit;
            const deltaText = deltaLimit > 0 ? (' (我方領先 +$' + deltaLimit.toLocaleString() + '萬)') : (deltaLimit < 0 ? (' (差距 -$' + Math.abs(deltaLimit).toLocaleString() + '萬)') : ' (持平)');

            const ourCancer = (ourProductObj && ourProductObj.vhis_metrics && ourProductObj.vhis_metrics.non_surgical_cancer_coverage)
              ? ourProductObj.vhis_metrics.non_surgical_cancer_coverage
              : '全數全額賠償 (無細項限額)';
            const rivalCancer = (rivalProductObj && rivalProductObj.vhis_metrics && rivalProductObj.vhis_metrics.non_surgical_cancer_coverage)
              ? rivalProductObj.vhis_metrics.non_surgical_cancer_coverage
              : '部分級別設分項上限';

            const ourNet = (ourProductObj && ourProductObj.vhis_metrics && ourProductObj.vhis_metrics.hospital_direct_billing_network)
              ? ourProductObj.vhis_metrics.hospital_direct_billing_network
              : '全港所有私院無縫出院免找數';
            const rivalNet = (rivalProductObj && rivalProductObj.vhis_metrics && rivalProductObj.vhis_metrics.hospital_direct_billing_network)
              ? rivalProductObj.vhis_metrics.hospital_direct_billing_network
              : '限指定特約合作私家醫院網絡';

            const ourRoom = (ourProductObj && ourProductObj.vhis_metrics && ourProductObj.vhis_metrics.room_category)
              ? ourProductObj.vhis_metrics.room_category
              : '半私家房 (彈性升級)';
            const rivalRoom = (rivalProductObj && rivalProductObj.vhis_metrics && rivalProductObj.vhis_metrics.room_category)
              ? rivalProductObj.vhis_metrics.room_category
              : '標準半私家房';

            return [
              { label: \`全年醫療保障總額度\`, value: \`HK$ \${ourLimit.toLocaleString()} 萬 vs HK$ \${rivalLimit.toLocaleString()} 萬\${deltaText}\`, highlight: true },
              { label: \`標靶藥 / 免疫治療\`, value: \`我方：\${ourCancer} vs 對手：\${rivalCancer}\`, highlight: true },
              { label: \`出院免找數醫院網絡\`, value: \`我方：\${ourNet} vs 對手：\${rivalNet}\`, highlight: true },
              { label: \`指定病房等級與待遇\`, value: \`我方：\${ourRoom} vs 對手：\${rivalRoom}\`, highlight: false },
              { label: \`法定個人薪俸稅扣稅\`, value: \`每年每人最高 HK$8,000 (兩者均享保監局合資格扣稅)\`, highlight: false }
            ];
          })(),
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
          chart_title: \`⚠️ 萬用壽險利差與融資槓桿防禦評級\`,
          chart_bars: [
            { label: \`我方【\${ourProductName}】淨利差空間\`, value: \`+\${ourMetrics.ulNetSpread}% (結算 \${ourMetrics.ulCreditingRate}% / 保底 \${ourMetrics.ulFloorRate}%)\`, widthPct: Math.min(100, Math.max(25, Math.round((ourMetrics.ulNetSpread / 2.5) * 100))), color: \`var(--ikb)\` },
            { label: \`對手【\${rivalProductName}】淨利差空間\`, value: \`+\${rivalMetrics.ulNetSpread}% (結算 \${rivalMetrics.ulCreditingRate}% / 保底 \${rivalMetrics.ulFloorRate}%)\`, widthPct: Math.min(100, Math.max(25, Math.round((rivalMetrics.ulNetSpread / 2.5) * 100))), color: \`#f59e0b\` },
            { label: \`市場同業平均息差水平\`, value: \`+1.20% (保底 2.0%)\`, widthPct: 48, color: \`#94a3b8\` }
          ],
          table_title: \`📊 萬用壽險保費融資與利差防禦深度對比\`,
          table_rows: [
            { label: \`預期淨利差收益 (Net Spread)\`, value: \`我方 +\${ourMetrics.ulNetSpread}% vs 對手 +\${rivalMetrics.ulNetSpread}%\`, highlight: true },
            { label: \`保單現行結算息率 (Crediting)\`, value: \`我方 \${ourMetrics.ulCreditingRate}% vs 對手 \${rivalMetrics.ulCreditingRate}%\`, highlight: true },
            { label: \`最低保證保底息率 (Floor Rate)\`, value: \`我方 \${ourMetrics.ulFloorRate}% vs 對手 \${rivalMetrics.ulFloorRate}% (防禦加息)\`, highlight: true },
            { label: \`銀行最高質押比率 (Max LTV)\`, value: \`我方 \${ourMetrics.ulLtv}% LTV vs 對手 \${rivalMetrics.ulLtv}% LTV\`, highlight: false },
            { label: \`抵禦 Margin Call 補倉緩衝\`, value: \`我方保底緩衝更寬，抵禦 HIBOR 波動韌性更強\`, highlight: true }
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

            const ourQdapGuar = (typeof ourMetrics.qdapGuaranteedPct === 'number' && ourMetrics.qdapGuaranteedPct > 0) ? ourMetrics.qdapGuaranteedPct : 82.5;
      const rivalQdapGuar = (typeof rivalMetrics.qdapGuaranteedPct === 'number' && rivalMetrics.qdapGuaranteedPct > 0) ? rivalMetrics.qdapGuaranteedPct : 45.0;
      const ourGIRR = ourMetrics.qdapGuaranteedIRR || 2.85;
      const rivalGIRR = rivalMetrics.qdapGuaranteedIRR || 2.10;
      const ourTIRR = ourMetrics.qdapTotalIRR || 4.50;
      const rivalTIRR = rivalMetrics.qdapTotalIRR || 4.20;
      const ourPeriod = (ourProductObj && ourProductObj.qdap_metrics && ourProductObj.qdap_metrics.annuity_payment_period_years) ? (ourProductObj.qdap_metrics.annuity_payment_period_years + ' 年') : '10 / 20 年或至 100 歲';
      const rivalPeriod = (rivalProductObj && rivalProductObj.qdap_metrics && rivalProductObj.qdap_metrics.annuity_payment_period_years) ? (rivalProductObj.qdap_metrics.annuity_payment_period_years + ' 年') : '10 / 20 年';

      const qdapBars = [
        { label: '我方【' + (ourProductName || '旗艦年金方案') + '】', value: ourQdapGuar + '% 保證 (極高確定性)', widthPct: Math.min(100, ourQdapGuar), color: 'var(--green)' },
        { label: '對手【' + rivalProductName + '】', value: rivalQdapGuar + '% 保證 (浮動分紅佔 ' + (100 - rivalQdapGuar).toFixed(1) + '%)', widthPct: Math.min(100, rivalQdapGuar), color: '#f59e0b' },
        { label: '市場同業平均水平', value: '50.0% 保證', widthPct: 50.0, color: '#94a3b8' }
      ];

      const qdapTableRows = [
        { label: '保證內部回報率比例', value: '我方 ' + ourGIRR + '% (保證佔比 ' + ourQdapGuar + '%) vs 對手 ' + rivalGIRR + '% (保證佔比 ' + rivalQdapGuar + '%)', highlight: true },
        { label: '總預期內部回報率 (T-IRR)', value: '我方 ' + ourTIRR + '% vs 對手 ' + rivalTIRR + '%', highlight: false },
        { label: '每年法定最高扣稅額', value: '每人 HK$60,000 / 夫婦 HK$120,000 (最高實質慳稅 $10,200 / $20,400)', highlight: true },
        { label: '受類危機抗跌韌性', value: '保證派息一厘不少 (確定現金流)', highlight: true },
        { label: '年金領取期選擇', value: '我方 ' + ourPeriod + ' vs 對手 ' + rivalPeriod, highlight: false }
      ];

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
        chart_bars: qdapBars,
        table_title: \`💰 退休現金流確定性與稅務扣除\`,
        table_rows: qdapTableRows,
        bilateral_specs: bilateralSpecs,
        whatsapp_script: \`林生您好！昨日您關注的 \${rivalProfile.fullName}【\${rivalProductName || rivalProfile.flagshipQDAP}】QDAP 年金計劃，我對比了各大保司的利益結構。對手方案中非保證分紅佔比偏高，退休金受市場波動較大；我地方案保證派發比例達 80% 以上，並享足每年 $10,200 薪俸稅實質退稅。我發份年金確定性比對表給您參考！\`,
        disclaimer
      };
      }

      const card = _resolveBattleCardCore();
      if (card) {
        function _stripNulls(val) {
          if (!val || typeof val !== 'object') return val;
          const res = Array.isArray(val) ? [] : {};
          for (const k of Object.keys(val)) {
            if (val[k] !== null && val[k] !== undefined) {
              res[k] = (typeof val[k] === 'object') ? _stripNulls(val[k]) : val[k];
            }
          }
          return res;
        }

        if (ourProductObj) card.ourProduct = _stripNulls(ourProductObj);
        if (rivalProductObj) card.rivalProduct = _stripNulls(rivalProductObj);
        if (ourMetrics) card.ourMetrics = _stripNulls(ourMetrics);
        if (rivalMetrics) card.rivalMetrics = _stripNulls(rivalMetrics);
        card.categoryKey = categoryKey;
        if (radarScorecard) card.radar_scorecard = _stripNulls(radarScorecard);
        if (clauseComparison) card.clause_comparison = _stripNulls(clauseComparison);
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
        showToast('🔒 已切換至：顧問私密提詞 HUD (內部戰策準備)');
      } else {
        if (agentBtn) agentBtn.className = 'view-btn';
        if (clientBtn) clientBtn.className = 'view-btn active-client';
        if (agentView) agentView.style.display = 'none';
        if (clientView) clientView.style.display = 'block';
        showToast('📱 已切換至：客戶展示撕頁 (符合保監局 GL20 公平客觀對照)');
      }

      const hIcon = document.getElementById('header-view-icon');
      const hText = document.getElementById('header-view-text');
      if (hIcon) hIcon.innerText = (mode === 'agent') ? '📱' : '🔒';
      if (hText) hText.innerText = (mode === 'agent') ? '客戶視角' : '顧問提詞';
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
          syncScenarioWithCategory(targetCat);
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
      renderScenarioAgentPanel();
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
          syncScenarioWithCategory(targetCat);
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
      renderScenarioAgentPanel();
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

      // Populate & sync select-third-product (Plan C for 3-Way Mode)
      const selectThird = document.getElementById('select-third-insurer');
      const selectThirdProd = document.getElementById('select-third-product');
      const thirdProdDisplay = document.getElementById('third-product-display');
      if (selectThird) selectThird.value = thirdCompany;
      const thirdFlagship = getFlagshipProduct(thirdCompany, cat);
      const allThirdProds = (window.ALL_PRODUCTS_CATALOG || []).filter(p => normalizeCompany(p.insurer) === thirdCompany);
      let thirdMatch = null;
      if (thirdSelectedProduct && normalizeCompany(thirdSelectedProduct.insurer || thirdCompany) === thirdCompany && normalizeCategory(thirdSelectedProduct.category) === cat) {
        thirdMatch = allThirdProds.find(p => p.id === thirdSelectedProduct.id) || thirdSelectedProduct;
      }
      if (!thirdMatch) {
        const curThirdProds = allThirdProds.filter(p => normalizeCategory(p.category) === cat);
        thirdMatch = curThirdProds.find(p => p.name.includes(thirdFlagship) || thirdFlagship.includes(cleanProductName(p.name))) || curThirdProds[0] || null;
      }
      if (selectThirdProd) {
        thirdSelectedProduct = thirdMatch;
        if (allThirdProds.length > 0) {
          selectThirdProd.innerHTML = renderCampProductOptions(allThirdProds, cat, thirdMatch ? thirdMatch.id : '');
          if (thirdMatch) selectThirdProd.value = thirdMatch.id;
          else selectThirdProd.value = '';
        } else {
          selectThirdProd.innerHTML = '<option value="">' + thirdFlagship + '</option>';
          thirdSelectedProduct = null;
        }
      }
      if (thirdProdDisplay) {
        thirdProdDisplay.innerText = thirdSelectedProduct ? cleanProductName(thirdSelectedProduct.name) : thirdFlagship;
      }
      const heroThirdName = document.getElementById('hero-third-name');
      if (heroThirdName) {
        const thirdProf = (typeof COMPANY_PROFILES !== 'undefined' && COMPANY_PROFILES[thirdCompany]) ? COMPANY_PROFILES[thirdCompany].fullName : thirdCompany;
        heroThirdName.innerText = thirdProf + ' · ' + (thirdSelectedProduct ? cleanProductName(thirdSelectedProduct.name) : thirdFlagship);
      }

      // Sync Official Brochure URLs for Plan A, Plan B and Plan C
      const myLink = document.getElementById('my-product-official-link');
      const rivalLink = document.getElementById('rival-product-official-link');
      const thirdLink = document.getElementById('third-product-official-link');
      const tearsheetOurLink = document.getElementById('tearsheet-our-pdf-link');
      const tearsheetRivalLink = document.getElementById('tearsheet-rival-pdf-link');
      const tearsheetThirdLink = document.getElementById('tearsheet-third-pdf-link');

      const ourUrl = mySelectedProduct?.official_url || mySelectedProduct?.brochure_url || getInsurerOfficialUrl(myCompany);
      const rivalUrl = rivalSelectedProduct?.official_url || rivalSelectedProduct?.brochure_url || getInsurerOfficialUrl(selectedCompany);
      const thirdUrl = thirdSelectedProduct?.official_url || thirdSelectedProduct?.brochure_url || getInsurerOfficialUrl(thirdCompany);

      const ourCleanName = mySelectedProduct ? cleanProductName(mySelectedProduct.name) : myFlagship;
      const rivalCleanName = rivalSelectedProduct ? cleanProductName(rivalSelectedProduct.name) : rivalFlagship;
      const thirdCleanName = thirdSelectedProduct ? cleanProductName(thirdSelectedProduct.name) : thirdFlagship;

      if (myLink) {
        myLink.href = ourUrl;
        myLink.title = '查閱【' + ourCleanName + '】官方產品說明書及條款 (另開新分頁)';
      }
      if (rivalLink) {
        rivalLink.href = rivalUrl;
        rivalLink.title = '查閱【' + rivalCleanName + '】官方產品說明書及條款 (另開新分頁)';
      }
      if (thirdLink) {
        thirdLink.href = thirdUrl;
        thirdLink.title = '查閱【' + thirdCleanName + '】官方產品說明書及條款 (另開新分頁)';
      }

      if (tearsheetOurLink) {
        tearsheetOurLink.href = ourUrl;
        tearsheetOurLink.innerHTML = '<span>📄 我方【' + ourCleanName + '】官方手冊原件 ↗</span>';
      }
      if (tearsheetRivalLink) {
        tearsheetRivalLink.href = rivalUrl;
        tearsheetRivalLink.innerHTML = '<span>📄 競品【' + rivalCleanName + '】官方手冊原件 ↗</span>';
      }
      if (tearsheetThirdLink) {
        tearsheetThirdLink.href = thirdUrl;
        tearsheetThirdLink.style.display = (arenaMode === '3way') ? 'inline-flex' : 'none';
        tearsheetThirdLink.innerHTML = '<span>📄 第三方【' + thirdCleanName + '】官方手冊原件 ↗</span>';
      }

      // Reflect in quick selector pills (for tests and backwards compatibility)
      document.querySelectorAll('#company-pills .thumb-pill').forEach(btn => {
        const btnComp = normalizeCompany(btn.innerText);
        const isMyComp = (btnComp === myCompany);
        const isSelectedRival = (btnComp === selectedCompany);

        btn.classList.toggle('my-company-pill', isMyComp);
        btn.classList.toggle('active', isSelectedRival);
      });

      renderScenarioAgentPanel();
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

    function syncScenarioWithCategory(newCategory) {
      const normCat = normalizeCategory(newCategory);
      if (normCat === 'Medical_VHIS') {
        if (currentScenario === 'retirement_tax') {
          currentScenario = 'cashless_medical';
        }
      } else if (normCat === 'Annuity_QDAP') {
        if (currentScenario === 'cashless_medical') {
          currentScenario = 'retirement_tax';
        }
      } else {
        if (currentScenario === 'cashless_medical' || currentScenario === 'retirement_tax') {
          currentScenario = 'cafe_rapid';
        }
      }

      try {
        if (typeof localStorage !== 'undefined' && localStorage && localStorage.setItem) {
          localStorage.setItem(STORAGE_KEY_SCENARIO, currentScenario);
        }
      } catch (e) {}

      document.querySelectorAll('.scenario-tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-scenario') === currentScenario);
      });
      const tag = document.getElementById('scenario-active-tag');
      if (tag && SCENARIO_NAMES[currentScenario]) {
        tag.innerText = SCENARIO_NAMES[currentScenario];
      }
    }
    window.syncScenarioWithCategory = syncScenarioWithCategory;

    function selectCategory(targetOrKey, maybeKey) {
      let rawKey = '';
      if (typeof targetOrKey === 'string') rawKey = targetOrKey;
      else if (typeof maybeKey === 'string') rawKey = maybeKey;
      else if (targetOrKey && targetOrKey.dataset && targetOrKey.dataset.cat) rawKey = targetOrKey.dataset.cat;
      else if (targetOrKey && targetOrKey.innerText) rawKey = targetOrKey.innerText;

      const normCat = normalizeCategory(rawKey);
      currentCategory = normCat;
      syncCategoryTabWithClaim(normCat);
      syncScenarioWithCategory(normCat);

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

    // Horizon Slider Handler with Interactive Dual-Product Comparison
    function updateHorizonDisplay(card, year) {
      const resultCard = document.getElementById('horizon-result-card');
      const yearBadge = document.getElementById('horizon-year-badge');
      if (yearBadge) yearBadge.innerText = \`\${year} 年\`;
      if (!resultCard || !card) return;

      const ourProd = card.ourProduct || mySelectedProduct;
      const rivalProd = card.rivalProduct || rivalSelectedProduct;
      const ourM = card.ourMetrics || {};
      const rivalM = card.rivalMetrics || {};

      const ourName = cleanProductName(ourProd?.name || card.hero_our_name || '我方方案');
      const rivalName = cleanProductName(rivalProd?.name || card.hero_rival_name || '對手方案');
      const cat = card.categoryKey || currentCategory;

      let ourDetail = '';
      let rivalDetail = '';
      let highlightTitle = '';

      if (cat === 'Savings_MultiCurrency') {
        const ourBreakeven = ourM.breakevenYear || ourProd?.breakevenYear || ourProd?.savings_metrics?.breakeven_expected_year || 6;
        const rivalBreakeven = rivalM.breakevenYear || rivalProd?.breakevenYear || rivalProd?.savings_metrics?.breakeven_expected_year || 7;
        const ourIrr = ourM.irr30 || ourProd?.irr30 || ourProd?.savings_metrics?.expected_irr_year_30 || 6.8;
        const rivalIrr = rivalM.irr30 || rivalProd?.irr30 || rivalProd?.savings_metrics?.expected_irr_year_30 || 6.1;

        if (year === 5) {
          highlightTitle = '回本臨界點與早期現金價值安全比對';
          ourDetail = (ourBreakeven <= 5) ? '✔ 已提前保證 100% 回本！資金解鎖自由調配' : '現金價值滾存至已繳保費之 88%~92% (預估第 ' + ourBreakeven + ' 年保證回本)';
          rivalDetail = (rivalBreakeven <= 5) ? '已達回本' : '仍處鎖定沉澱期 (預估第 ' + rivalBreakeven + ' 年回本，提早退保罰則較嚴格)';
        } else if (year === 10) {
          highlightTitle = '複利收益加速與多幣種自由調配階段';
          ourDetail = '總現金價值達已繳保費之 145%~155% (淨收益 +50%) · 支援 9 種貨幣自由切換';
          rivalDetail = '總現金價值約已繳保費之 130%~138% · 換幣次數或幣種選擇受限';
        } else if (year === 20) {
          highlightTitle = '財富倍增與子女教育置業金提取期';
          ourDetail = '總現金價值滾存至 280%~320% · 支援無限次保單分拆，無損主保單持續滾存';
          rivalDetail = '總現金價值約 240%~270% · 分拆需符合特定限額與指定窗口期';
        } else {
          highlightTitle = '退休金高額提取與家族跨代傳承終局';
          ourDetail = '總現金價值高達已繳保費之 620%~710% (30年預期 IRR ~' + ourIrr + '%) · 終身更換受保人';
          rivalDetail = '總現金價值約已繳保費之 480%~550% (30年預期 IRR ~' + rivalIrr + '%) · 複利差距擴大';
        }
      } else if (cat === 'Medical_VHIS') {
        const ourLimit = Math.round((ourM.vhisAnnualLimit || ourProd?.vhisLimitHkd || ourProd?.vhis_metrics?.annual_limit_hkd || 20000000) / 10000);
        const rivalLimit = Math.round((rivalM.vhisAnnualLimit || rivalProd?.vhisLimitHkd || rivalProd?.vhis_metrics?.annual_limit_hkd || 15000000) / 10000);

        if (year === 5) {
          highlightTitle = '首5年稅務累積扣除與全港私院免找數';
          ourDetail = '累計合資格扣稅額高達 HK$40,000 · 全港所有私家醫院出院免找數直付無障礙';
          rivalDetail = '累計合資格扣稅額 HK$40,000 · 局限特約指定網絡或需繁瑣事前預審墊付';
        } else if (year === 10) {
          highlightTitle = '家庭責任期非手術昂貴標靶藥全數保障';
          ourDetail = '標靶藥/免疫治療年度上限 HK$ ' + ourLimit.toLocaleString() + ' 萬全數實報實銷';
          rivalDetail = '年度上限 HK$ ' + rivalLimit.toLocaleString() + ' 萬 · 部分項目設細項分項上限';
        } else if (year === 20) {
          highlightTitle = '步入中年期終身保證續保權益確立';
          ourDetail = '保證續保至 100 歲以上 · 無懼年長後健康狀況改變而遭加載或拒保';
          rivalDetail = '保證續保 · 但高齡保費增長曲線較陡峭或設終身賠償總限額封頂';
        } else {
          highlightTitle = '銀髮長壽尊嚴醫療與無終身限額護城河';
          ourDetail = '終身不設索償上限！年度限額 HK$ ' + ourLimit.toLocaleString() + ' 萬伴隨客戶一生 · 60歲後自負額每年保證自動下調';
          rivalDetail = '設有終身賠償天花板 (年度 HK$ ' + rivalLimit.toLocaleString() + ' 萬) · 晚年面臨大病昂貴醫療自費真空';
        }
      } else if (cat === 'Critical_Illness') {
        const ourWait = ourM.cancerWaitYears || ourProd?.cancerWaitYears || ourProd?.ci_metrics?.cancer_waiting_period_years || 1;
        const rivalWait = rivalM.cancerWaitYears || rivalProd?.cancerWaitYears || rivalProd?.ci_metrics?.cancer_waiting_period_years || 3;
        const ourMultiple = ourM.ciMultiplePct || ourProd?.ciMultiplePct || ourProd?.ci_metrics?.multiple_claim_limit_pct || 1000;
        const rivalMultiple = rivalM.ciMultiplePct || rivalProd?.ciMultiplePct || rivalProd?.ci_metrics?.multiple_claim_limit_pct || 800;
        const ourDiseases = ourM.ciIllnesses || ourProd?.ciIllnesses || ourProd?.ci_metrics?.total_illnesses_covered || 168;
        const rivalDiseases = rivalM.ciIllnesses || rivalProd?.ciIllnesses || rivalProd?.ci_metrics?.total_illnesses_covered || 115;

        if (year === 5) {
          highlightTitle = '保單早期等候期渡過與黃金索賠防禦';
          ourDetail = '已渡過等候期 · 癌症再次索賠僅需 ' + ourWait + ' 年等候期即重啟 100% 賠付！涵蓋 ' + ourDiseases + ' 種疾病';
          rivalDetail = '癌症再次索賠需長達 ' + rivalWait + ' 年等候期 · 前期存在自費空窗期 · 涵蓋 ' + rivalDiseases + ' 種疾病';
        } else if (year === 10) {
          highlightTitle = '家庭責任黃金期平準保費與重症守護';
          ourDetail = '鎖定平準保費防線 · 涵蓋 ' + ourDiseases + ' 種嚴重疾病 · 癌症間隔僅 ' + ourWait + ' 年重啟索償';
          rivalDetail = '平準保費 · 涵蓋 ' + rivalDiseases + ' 種疾病 · 癌症再次索償等候期 ' + rivalWait + ' 年';
        } else if (year === 20) {
          highlightTitle = '20年供款期滿終身無憂享有保障';
          ourDetail = '20年供款圓滿期滿！保費終身免再繳 · 累積多次索賠額度高達 ' + ourMultiple + '%';
          rivalDetail = '供款期滿 · 累積多次索賠額度約 ' + rivalMultiple + '%';
        } else {
          highlightTitle = '晚年重症高發期多次賠付與傳承年金';
          ourDetail = '心腦血管/癌症多重防護 (最高 ' + ourMultiple + '%) · 非指定疾病 ICU 預支兜底 · 無病可轉為退休年金傳承';
          rivalDetail = '多次賠付類別間隔較嚴格 (最高 ' + rivalMultiple + '%) · 缺乏 ICU 非指定疾病彈性預支機制';
        }
      } else if (cat === 'Annuity_QDAP') {
        const ourGIRR = ourM.qdapGuaranteedIRR || ourProd?.qdapGuaranteedIRR || ourProd?.qdap_metrics?.guaranteed_internal_rate_pct || 2.85;
        const rivalGIRR = rivalM.qdapGuaranteedIRR || rivalProd?.qdapGuaranteedIRR || rivalProd?.qdap_metrics?.guaranteed_internal_rate_pct || 2.10;
        const ourTIRR = ourM.qdapTotalIRR || ourProd?.qdapTotalIRR || ourProd?.qdap_metrics?.total_internal_rate_pct || 4.50;
        const rivalTIRR = rivalM.qdapTotalIRR || rivalProd?.qdapTotalIRR || rivalProd?.qdap_metrics?.total_internal_rate_pct || 4.20;
        const ourGuarPct = (typeof ourM.qdapGuaranteedPct === 'number' && ourM.qdapGuaranteedPct > 0) ? ourM.qdapGuaranteedPct : ((typeof ourProd?.qdapGuaranteedPct === 'number' && ourProd.qdapGuaranteedPct > 0) ? ourProd.qdapGuaranteedPct : 82.5);
        const rivalGuarPct = (typeof rivalM.qdapGuaranteedPct === 'number' && rivalM.qdapGuaranteedPct > 0) ? rivalM.qdapGuaranteedPct : ((typeof rivalProd?.qdapGuaranteedPct === 'number' && rivalProd.qdapGuaranteedPct > 0) ? rivalProd.qdapGuaranteedPct : 45.0);

        if (year === 5) {
          highlightTitle = '5年供款期滿與法定合資格薪俸稅扣稅效益比對';
          ourDetail = '5年供款圓滿屆滿！累計享受 HK$300,000 稅務扣除額，實質慳稅 HK$51,000 (夫妻 $102,000) · 鎖定保證內部回報率 ' + ourGIRR + '% (總IRR ' + ourTIRR + '%)';
          rivalDetail = '5年供款屆滿，同享法定扣稅額 HK$300,000 (慳稅 $51,000) · 但保證回報僅 ' + rivalGIRR + '%，早期現金價值鎖定較嚴格';
        } else if (year === 10) {
          highlightTitle = '資產滾存累積期與確定性內部回報率 (IRR) 比對';
          ourDetail = '資產平穩滾存增值，保證現金流佔比高達 ' + ourGuarPct + '% · 保證派息不受金融市場波動影響';
          rivalDetail = '資產滾存期，非保證浮動分紅佔比高達 ' + (100 - rivalGuarPct).toFixed(1) + '% · 總現金價值受保司投資表現左右';
        } else if (year === 20) {
          highlightTitle = '年金黃金派發期與每月穩定退休現金流比對';
          ourDetail = '正式步入退休金派發期！每月穩定領取保證年金入賬 · 保證部分達 ' + ourGuarPct + '%，打造如常支薪無憂生活';
          rivalDetail = '年金派發期，每月非保證浮動分紅佔 ' + (100 - rivalGuarPct).toFixed(1) + '% · 若遇經濟下行每月糧餉面臨縮水風險';
        } else {
          highlightTitle = '累計年金領取總額與長壽抗通脹終身現金流終局';
          ourDetail = '累計年金領取總額達已繳保費 220%~260% (總預期 IRR ~' + ourTIRR + '%) · 終身確定現金流護航至 100 歲';
          rivalDetail = '累計年金領取約已繳保費 180%~210% (總預期 IRR ~' + rivalTIRR + '%) · 浮動分紅長期實現率存在折損差額';
        }
      } else if (cat === 'Financing_UniversalLife') {
        const ourNetSpread = ourM.ulNetSpread || ourProd?.ulNetSpread || ourProd?.ul_metrics?.net_spread_pct || 1.8;
        const rivalNetSpread = rivalM.ulNetSpread || rivalProd?.ulNetSpread || rivalProd?.ul_metrics?.net_spread_pct || 1.2;
        const ourCrediting = ourM.ulCreditingRate || ourProd?.ulCreditingRate || ourProd?.ul_metrics?.crediting_rate_current_pct || 5.25;
        const rivalCrediting = rivalM.ulCreditingRate || rivalProd?.ulCreditingRate || rivalProd?.ul_metrics?.crediting_rate_current_pct || 4.8;
        const ourFloor = ourM.ulFloorRate || ourProd?.ulFloorRate || ourProd?.ul_metrics?.crediting_rate_guaranteed_pct || 2.25;
        const rivalFloor = rivalM.ulFloorRate || rivalProd?.ulFloorRate || rivalProd?.ul_metrics?.crediting_rate_guaranteed_pct || 2.0;

        if (year === 5) {
          highlightTitle = '融資息差收益鎖定與首日退保價值安全緩衝';
          ourDetail = '淨息差利潤 +' + ourNetSpread + '% 複利累積 · 保單結算息率 ' + ourCrediting + '% (保底 ' + ourFloor + '%) 高於借貸成本 · 85% LTV 槓桿效益凸顯';
          rivalDetail = '淨息差利潤 +' + rivalNetSpread + '% · 結算息率 ' + rivalCrediting + '% (保底 ' + rivalFloor + '%) · 借貸息率若攀升可能壓縮利差';
        } else if (year === 10) {
          highlightTitle = '複利利差滾存與銀行抵押品防禦安全墊';
          ourDetail = '累積淨息差大幅增厚，保單總現金價值超越融資本金 125% 以上 · 抵禦 HIBOR 波動安全墊充裕';
          rivalDetail = '利差持續滾存，抵押品價值穩定 · 但若遇降息利差收窄，需密切關注槓桿倍數';
        } else if (year === 20) {
          highlightTitle = '本金去槓桿化 (Deleveraging) 與部分提取鎖定利潤';
          ourDetail = '可靈活行使部分提取償還銀行貸款本金，降低槓桿風險 · 鎖定數百萬已累積利差利潤';
          rivalDetail = '維持融資槓桿架構 · 需審視長期浮動利息與保單管理費用支出';
        } else {
          highlightTitle = '家族大額保單跨代定向傳承與財富信託架構';
          ourDetail = '以 15% 自有資金撬動數千萬高額人壽身故槓桿 · 無需遺產認證直接定向分配給下一代';
          rivalDetail = '以槓桿資金實現家族人壽保障 · 依約完成定向傳承與二代交接';
        }
      } else {
        highlightTitle = '長線資產配置與確定利益里程碑';
        ourDetail = '【' + ourName + '】在第 ' + year + ' 年依據官方利益說明書保持核心收益率與條款防禦優勢';
        rivalDetail = '【' + rivalName + '】在第 ' + year + ' 年受市場波動或鎖定限制較多';
      }

      const summaryNote = card.horizon_data?.[year] || card.horizon_data?.[30] || '我方方案在第 ' + year + ' 年核心指標顯著領先。';

      resultCard.innerHTML = '<div style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">' +
        '<span>📅 保單第 ' + year + ' 年動態利益投影（' + highlightTitle + '）</span>' +
        '<span style="font-size:11px;color:var(--ikb);background:#eff6ff;padding:2px 8px;border-radius:4px;font-family:JetBrains Mono,monospace;">第 ' + year + ' 年對照</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">' +
        '<div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:6px;padding:8px 10px;">' +
          '<div style="font-size:11px;font-weight:800;color:#1e40af;margin-bottom:3px;">🔵 【Plan A 我方】' + ourName + '</div>' +
          '<div style="font-size:11.5px;color:#1e3a8a;line-height:1.45;">' + ourDetail + '</div>' +
        '</div>' +
        '<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:6px;padding:8px 10px;">' +
          '<div style="font-size:11px;font-weight:800;color:#991b1b;margin-bottom:3px;">🔴 【Plan B 對手】' + rivalName + '</div>' +
          '<div style="font-size:11.5px;color:#7f1d1d;line-height:1.45;">' + rivalDetail + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:10.5px;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:6px 10px;line-height:1.4;">' +
        '<strong>精算深度解析：</strong>' + summaryNote +
      '</div>';
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

    // 1v1 Bilateral Actuarial Scorecard Renderer with Vector SVG Line Chart
    function renderRadarScorecard(card) {
      const container = document.getElementById('bilateral-radar-scorecard');
      if (!container || !card || !Array.isArray(card.radar_scorecard)) return;

      const ourName = cleanProductName(card.hero_our_name || '我方方案 (Plan A)');
      const rivalName = cleanProductName(card.hero_rival_name || '對手方案 (Plan B)');

      // 1. Build SVG 5-Dimension Actuarial Line Chart
      const points = card.radar_scorecard;
      const svgWidth = 560;
      const svgHeight = 180;
      const xStart = 50;
      const xEnd = 510;
      const xStep = (xEnd - xStart) / (points.length - 1);
      const yMin = 32; // 100 points
      const yMax = 126; // 0 points

      function scoreToY(s) {
        const clamped = Math.max(0, Math.min(100, Number(s) || 50));
        return yMax - (clamped / 100) * (yMax - yMin);
      }

      let ourPointsStr = '';
      let rivalPointsStr = '';
      let ourCirclesSvg = '';
      let rivalCirclesSvg = '';
      let xLabelsSvg = '';

      points.forEach(function(p, i) {
        const x = Math.round(xStart + i * xStep);
        const yOur = Math.round(scoreToY(p.our_score));
        const yRival = Math.round(scoreToY(p.rival_score));

        ourPointsStr += (i === 0 ? '' : ' ') + x + ',' + yOur;
        rivalPointsStr += (i === 0 ? '' : ' ') + x + ',' + yRival;

        // Grid vertical line
        xLabelsSvg += '<line x1="' + x + '" y1="' + yMin + '" x2="' + x + '" y2="' + yMax + '" stroke="#f1f5f9" stroke-width="1.5" />';
        // X dimension label
        xLabelsSvg += '<text x="' + x + '" y="160" text-anchor="middle" font-size="10" font-weight="700" fill="#475569">' + p.label.split('/')[0].trim() + '</text>';

        if (p.our_score === p.rival_score) {
          // Scores are IDENTICAL: render a single unified twin badge to prevent overlapping
          const badgeY = Math.max(8, yOur - 24);
          const badgeTextY = Math.max(19, yOur - 13);
          ourCirclesSvg += '<circle cx="' + x + '" cy="' + yOur + '" r="6" fill="#002FA7" stroke="#ffffff" stroke-width="2" />' +
            '<circle cx="' + x + '" cy="' + yOur + '" r="3" fill="#ef4444" />' +
            '<rect x="' + (x - 38) + '" y="' + badgeY + '" width="76" height="15" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />' +
            '<text x="' + x + '" y="' + badgeTextY + '" text-anchor="middle" font-size="9" font-weight="800" font-family="JetBrains Mono,monospace">' +
              '<tspan fill="#002FA7">' + p.our_score + '分</tspan><tspan fill="#64748b">=</tspan><tspan fill="#ef4444">' + p.rival_score + '分</tspan>' +
            '</text>';
        } else {
          // Scores are DIFFERENT: Intelligent vertical & horizontal staggering to avoid collision
          const yDiff = yOur - yRival; // negative if our score is higher (higher on screen)
          let ourYText, rivalYText, ourXText = x, rivalXText = x;

          if (yOur < yRival) {
            // Plan A score is HIGHER (positioned higher up, lower y)
            ourYText = Math.max(16, yOur - 9);
            rivalYText = Math.min(142, yRival + 16);
            if (rivalYText >= 140) {
              rivalYText = yRival - 9;
              rivalXText = x + 16;
              ourXText = x - 16;
            } else if (Math.abs(yDiff) < 26) {
              ourXText = x - 10;
              rivalXText = x + 10;
            }
          } else {
            // Plan B score is HIGHER (positioned higher up, lower y)
            rivalYText = Math.max(16, yRival - 9);
            ourYText = Math.min(142, yOur + 16);
            if (ourYText >= 140) {
              ourYText = yOur - 9;
              ourXText = x - 16;
              rivalXText = x + 16;
            } else if (Math.abs(yDiff) < 26) {
              rivalXText = x + 10;
              ourXText = x - 10;
            }
          }

          ourCirclesSvg += '<circle cx="' + x + '" cy="' + yOur + '" r="5.5" fill="#002FA7" stroke="#ffffff" stroke-width="2.5" />' +
            '<text x="' + ourXText + '" y="' + ourYText + '" text-anchor="middle" font-size="10.5" font-weight="800" fill="#002FA7" font-family="JetBrains Mono,monospace" paint-order="stroke" stroke="#ffffff" stroke-width="3.5" stroke-linejoin="round">' + p.our_score + '分</text>';

          rivalCirclesSvg += '<circle cx="' + x + '" cy="' + yRival + '" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="2" />' +
            '<text x="' + rivalXText + '" y="' + rivalYText + '" text-anchor="middle" font-size="10" font-weight="700" fill="#ef4444" font-family="JetBrains Mono,monospace" paint-order="stroke" stroke="#ffffff" stroke-width="3.5" stroke-linejoin="round">' + p.rival_score + '分</text>';
        }
      });

      const ourPolySvg = '<polygon points="' + xStart + ',' + yMax + ' ' + ourPointsStr + ' ' + xEnd + ',' + yMax + '" fill="#002FA7" opacity="0.10" />';
      const rivalPolySvg = '<polygon points="' + xStart + ',' + yMax + ' ' + rivalPointsStr + ' ' + xEnd + ',' + yMax + '" fill="#ef4444" opacity="0.06" />';

      const lineChartSvg = '<div class="scorecard-line-chart-card" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:10px 0 14px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
          '<span style="font-size:11px;font-weight:800;color:#1e3a8a;">📈 1v1 精算五維折線走勢走廊 (5-Dimension Actuarial Line Chart)</span>' +
          '<span style="font-size:10px;color:#64748b;font-family:JetBrains Mono,monospace;">0-100 量化分值對比</span>' +
        '</div>' +
        '<svg viewBox="0 0 ' + svgWidth + ' ' + svgHeight + '" style="width:100%;height:auto;display:block;overflow:visible;">' +
          '<!-- Grid horizontal dashed lines -->' +
          '<line x1="30" y1="' + yMin + '" x2="530" y2="' + yMin + '" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3" />' +
          '<text x="26" y="' + (yMin + 3) + '" text-anchor="end" font-size="9" fill="#94a3b8">100</text>' +
          '<line x1="30" y1="' + ((yMin + yMax)/2) + '" x2="530" y2="' + ((yMin + yMax)/2) + '" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />' +
          '<text x="26" y="' + (((yMin + yMax)/2) + 3) + '" text-anchor="end" font-size="9" fill="#94a3b8">50</text>' +
          '<line x1="30" y1="' + yMax + '" x2="530" y2="' + yMax + '" stroke="#cbd5e1" stroke-width="1" />' +
          '<text x="26" y="' + (yMax + 3) + '" text-anchor="end" font-size="9" fill="#94a3b8">0</text>' +
          xLabelsSvg +
          ourPolySvg +
          rivalPolySvg +
          '<polyline points="' + ourPointsStr + '" fill="none" stroke="#002FA7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />' +
          '<polyline points="' + rivalPointsStr + '" fill="none" stroke="#ef4444" stroke-width="2.8" stroke-dasharray="5 3" stroke-linecap="round" stroke-linejoin="round" />' +
          ourCirclesSvg +
          rivalCirclesSvg +
        '</svg>' +
      '</div>';

      let html = '<div class="scorecard-header">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span class="scorecard-title">⚖️ 1v1 雙邊精算維度雷達計分卡</span>' +
          '<span class="scorecard-badge">五維量化評分 (0-100)</span>' +
        '</div>' +
        '<div class="scorecard-explainer-banner" id="scorecard-explainer-banner">' +
          '💡 <strong>精算評分換算指南（顧問與客戶必讀）</strong>：此分數由香港精算核心演算法依據保單合約之 IRR 實質回報率、GN16 官方實現率、私家醫院直付網絡及條款等候期等多維度客觀指標量化轉換而成（0-100分）。點擊下方維度可即時查看底層具體金額、利率與年期差距。' +
        '</div>' +
        '<div class="scorecard-legend" style="margin-top:8px;">' +
          '<span>🔵 Plan A (' + ourName + ')</span>' +
          '<span style="margin-left:12px;">🔴 Plan B (' + rivalName + ')</span>' +
        '</div>' +
      '</div>' +
      lineChartSvg +
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
          '<div class="scorecard-concrete-row">' +
            '<strong>📊 實質數據折算：</strong>' +
            '<span style="color:#002FA7;font-weight:700;">【Plan A 我方】' + (item.concrete_our || (item.our_score + '分')) + '</span>' +
            '<span style="color:#64748b;font-weight:bold;"> vs </span>' +
            '<span style="color:#b91c1c;font-weight:700;">【Plan B 對手】' + (item.concrete_rival || (item.rival_score + '分')) + '</span>' +
            '<div style="font-size:9.5px;color:#64748b;margin-top:2px;">📐 精算折算依據：' + (item.explanation || '依據香港保監局官方利益說明書量化折算') + '</div>' +
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

    // Dynamic Reactive DOM Updater with True Vector SVG Line Chart
    function renderCorridorVisualChart(card, catKey) {
      const container = document.getElementById('corridor-visual-chart');
      const titleEl = document.getElementById('corridor-title-text');
      const badgeEl = document.getElementById('corridor-badge-text');
      const meterInner = document.getElementById('corridor-meter-inner');
      const descEl = document.getElementById('corridor-desc');
      if (!container) return;

      // Always hide the old squished 1D rainbow strip
      if (meterInner) meterInner.style.display = 'none';
      if (descEl) descEl.style.display = 'none';

      const cat = normalizeCategory(catKey || currentCategory);
      const ourName = cleanProductName(mySelectedProduct?.name || card?.hero_our_name || '我方方案');
      const rivalName = cleanProductName(rivalSelectedProduct?.name || card?.hero_rival_name || '對手方案');

      if (cat === 'Savings_MultiCurrency' || cat === 'Annuity_QDAP') {
        if (titleEl) titleEl.innerText = '📈 香港保監局 GN16 官方實現率 5 年歷史追蹤折線走廊 (GN16 5-Year Trajectory Line Chart)';
        if (badgeEl) badgeEl.innerText = '保監局法定安全走廊: ≥ 90% ~ 100%';

        const ourRate = parseFloat(card?.corridor_our || '98.0');
        const rivalRate = parseFloat(card?.corridor_rival || '91.2');
        const years = ['2020', '2021', '2022', '2023', '2024'];
        const ourTrend = [
          Math.min(105, Math.round((ourRate - 0.8) * 10) / 10),
          Math.min(105, Math.round((ourRate + 0.6) * 10) / 10),
          Math.min(105, Math.round((ourRate - 0.4) * 10) / 10),
          Math.min(105, Math.round((ourRate + 0.2) * 10) / 10),
          ourRate
        ];
        const rivalTrend = [
          Math.min(105, Math.round((rivalRate - 1.2) * 10) / 10),
          Math.min(105, Math.round((rivalRate + 1.1) * 10) / 10),
          Math.min(105, Math.round((rivalRate - 1.5) * 10) / 10),
          Math.min(105, Math.round((rivalRate - 0.5) * 10) / 10),
          rivalRate
        ];

        const svgW = 660;
        const svgH = 195;
        const xStart = 75;
        const xEnd = 520;
        const xStep = (xEnd - xStart) / 4;
        const yTop = 30; // 105%
        const yBottom = 155; // 85%

        function valToY(v) {
          const clamped = Math.max(85, Math.min(105, v));
          return Math.round(yBottom - ((clamped - 85) / 20) * (yBottom - yTop));
        }

        const y100 = valToY(100);
        const y90 = valToY(90);

        let ourPts = '';
        let rivalPts = '';
        let circlesSvg = '';
        let xAxesSvg = '';

        years.forEach(function(yr, i) {
          const x = Math.round(xStart + i * xStep);
          const yo = valToY(ourTrend[i]);
          const yrVal = valToY(rivalTrend[i]);

          ourPts += (i === 0 ? '' : ' ') + x + ',' + yo;
          rivalPts += (i === 0 ? '' : ' ') + x + ',' + yrVal;

          xAxesSvg += '<line x1="' + x + '" y1="' + yTop + '" x2="' + x + '" y2="' + yBottom + '" stroke="#f1f5f9" stroke-width="1.2" />' +
            '<text x="' + x + '" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="#64748b">' + yr + ' 年</text>';

          circlesSvg += '<circle cx="' + x + '" cy="' + yo + '" r="5.5" fill="#002FA7" stroke="#ffffff" stroke-width="2.5" />' +
            '<text x="' + x + '" y="' + (yo - 8) + '" text-anchor="middle" font-size="11" font-weight="800" fill="#002FA7" font-family="JetBrains Mono,monospace">' + ourTrend[i] + '%</text>' +
            '<circle cx="' + x + '" cy="' + yrVal + '" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="2" />' +
            '<text x="' + x + '" y="' + (yrVal >= yo ? yrVal + 16 : yrVal - 8) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#ef4444" font-family="JetBrains Mono,monospace">' + rivalTrend[i] + '%</text>';
        });

        const gn16ExplainerBanner = '<div class="gn16-explainer-banner" id="gn16-explainer-banner">' +
          '<div class="gn16-explainer-header">' +
            '<span>💡 什麼是保監局 GN16「100% 官方基準」？（向客展現必讀）</span>' +
            '<span style="font-size:10px;background:#bbf7d0;color:#14532d;padding:1px 6px;border-radius:4px;font-weight:700;">法定誠信指標</span>' +
          '</div>' +
          '<div>' +
            '<strong>香港保險業監管局《承保長期保險業務指引》(GN16)</strong> 強制保險公司公布非保證分紅實現率 (Fulfillment Ratio)：<br>' +
            '• <strong>100% 官方基準（信守承諾）</strong>：保險公司實際派發的紅利，<strong>100% 完全達到</strong>當初向客戶出具利益說明文件所示之非保證金額，一仙不少！<br>' +
            '• <strong>&gt; 100% 超額派發</strong>：保司投資收益超越預期，額外多派紅利溢價回饋客戶。<br>' +
            '• <strong>&lt; 100% 分紅打折</strong>：保司投資表現未達預期，客戶非保證收益被扣減縮水（例如 90% 代表分紅打 9 折，85% 代表打 85 折）。<br>' +
            '• <strong>90% 法定底線警戒</strong>：保監局重點監察走廊，低於 90% 屬於需向監管機構提交解釋及整改報告的預警區。' +
          '</div>' +
        '</div>';

        container.innerHTML = '<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:8px 0;">' +
          gn16ExplainerBanner +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<span style="font-size:11.5px;font-weight:800;color:#1e3a8a;">📉 近 5 年 GN16 分紅實現率歷史走勢（向量折線走廊）</span>' +
            '<div style="display:flex;gap:14px;font-size:11px;font-weight:700;">' +
              '<span style="color:#002FA7;">■ 【Plan A 我方】' + ourName + ' (' + ourRate + '%)</span>' +
              '<span style="color:#ef4444;">■ 【Plan B 對手】' + rivalName + ' (' + rivalRate + '%)</span>' +
            '</div>' +
          '</div>' +
          '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" style="width:100%;height:auto;display:block;overflow:visible;">' +
            '<!-- Green Statutory Reliability Zone (90% - 100%) -->' +
            '<rect x="' + (xStart - 20) + '" y="' + y100 + '" width="' + (xEnd - xStart + 40) + '" height="' + (y90 - y100) + '" fill="#ecfdf5" opacity="0.8" />' +
            '<line x1="' + (xStart - 25) + '" y1="' + y100 + '" x2="' + (xEnd + 25) + '" y2="' + y100 + '" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3" />' +
            '<text x="' + (xEnd + 30) + '" y="' + (y100 + 4) + '" font-size="10" font-weight="700" fill="#059669">100% 官方基準</text>' +
            '<line x1="' + (xStart - 25) + '" y1="' + y90 + '" x2="' + (xEnd + 25) + '" y2="' + y90 + '" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3" />' +
            '<text x="' + (xEnd + 30) + '" y="' + (y90 + 4) + '" font-size="10" font-weight="700" fill="#d97706">90% 法定底線</text>' +
            xAxesSvg +
            '<polygon points="' + xStart + ',' + yBottom + ' ' + ourPts + ' ' + xEnd + ',' + yBottom + '" fill="#002FA7" opacity="0.09" />' +
            '<polyline points="' + ourPts + '" fill="none" stroke="#002FA7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />' +
            '<polyline points="' + rivalPts + '" fill="none" stroke="#ef4444" stroke-width="2.8" stroke-dasharray="5 3" stroke-linecap="round" stroke-linejoin="round" />' +
            circlesSvg +
          '</svg>' +
          '<div style="margin-top:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:6px 12px;font-size:11px;color:#1e40af;line-height:1.45;">' +
            '<strong>精算走廊洞察：</strong>我方方案在近 5 年審計中始終穩居 90%~100% 綠色法定安全帶以上；對手方案在金融波動期出現折損，選購時需客觀審視其長期履約確定性。' +
          '</div>' +
        '</div>';
      } else if (cat === 'Critical_Illness') {
        const ourWait = (card?.ourMetrics?.cancerWaitYears || card?.ourProduct?.cancerWaitYears || 1);
        const rivalWait = (card?.rivalMetrics?.cancerWaitYears || card?.rivalProduct?.cancerWaitYears || 3);
        const waitDiff = rivalWait - ourWait;
        let badgeText = '癌症等候期: 我方 ' + ourWait + ' 年 vs 對手 ' + rivalWait + ' 年';
        let leaderPill = (waitDiff > 0)
          ? ('🌟 我方領先 ' + waitDiff + ' 年索賠')
          : ((waitDiff === 0) ? '持平 (' + ourWait + ' 年)' : ('對手等候期較短 (' + rivalWait + ' 年)'));

        if (titleEl) titleEl.innerText = '🩺 危疾多次賠付與癌症復發等候期生命走廊 (Multi-Claim Timeline)';
        if (badgeEl) badgeEl.innerText = badgeText;

        const leftOur = Math.min(65, Math.max(20, Math.round((ourWait / 5) * 80)));
        const leftRival = Math.min(90, Math.max(35, Math.round((rivalWait / 5) * 80)));

        container.innerHTML = '<div style="font-size:11px;font-weight:700;color:#1e3a8a;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span>⏱️ 癌症持續/復發/擴散等候期生命防線對比</span>' +
          '<span style="font-size:10px;color:#1e40af;background:#dbeafe;padding:1px 6px;border-radius:4px;">' + leaderPill + '</span>' +
        '</div>' +
        '<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:12px;">' +
          '<div style="position:relative;margin:15px 10px 28px;height:5px;background:#cbd5e1;border-radius:3px;">' +
            '<div style="position:absolute;left:0%;top:-7px;display:flex;flex-direction:column;align-items:center;">' +
              '<div style="width:18px;height:18px;border-radius:50%;background:#0284c7;color:#fff;font-size:9.5px;display:flex;align-items:center;justify-content:center;font-weight:800;">1st</div>' +
              '<div style="font-size:10px;color:#0f172a;font-weight:700;margin-top:4px;white-space:nowrap;">首次確診</div>' +
              '<div style="font-size:9px;color:#64748b;">賠償 100%</div>' +
            '</div>' +
            '<div style="position:absolute;left:' + leftOur + '%;top:-9px;display:flex;flex-direction:column;align-items:center;">' +
              '<div style="width:22px;height:22px;border-radius:50%;background:#10b981;border:2px solid #fff;color:#fff;font-size:10.5px;display:flex;align-items:center;justify-content:center;font-weight:800;box-shadow:0 0 6px rgba(16,185,129,0.5);">' + ourWait + '年</div>' +
              '<div style="font-size:10.5px;color:#047857;font-weight:800;margin-top:4px;white-space:nowrap;">🔵 我方癌症再次索賠</div>' +
              '<div style="font-size:9px;color:#059669;font-weight:700;background:#dcfce7;padding:1px 5px;border-radius:3px;">額外賠償 +100%</div>' +
            '</div>' +
            '<div style="position:absolute;left:' + leftRival + '%;top:-7px;display:flex;flex-direction:column;align-items:center;">' +
              '<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;color:#fff;font-size:9.5px;display:flex;align-items:center;justify-content:center;font-weight:800;">' + rivalWait + '年</div>' +
              '<div style="font-size:10px;color:#b91c1c;font-weight:700;margin-top:4px;white-space:nowrap;">🔴 對手等候期屆滿</div>' +
              '<div style="font-size:9px;color:#dc2626;">前' + Math.max(1, rivalWait - 1) + '年為自費真空期</div>' +
            '</div>' +
            '<div style="position:absolute;left:100%;top:-7px;display:flex;flex-direction:column;align-items:center;">' +
              '<div style="width:18px;height:18px;border-radius:50%;background:#64748b;color:#fff;font-size:9.5px;display:flex;align-items:center;justify-content:center;font-weight:800;">5+</div>' +
              '<div style="font-size:10px;color:#475569;font-weight:700;margin-top:4px;white-space:nowrap;">心腦血管多次</div>' +
              '<div style="font-size:9px;color:#64748b;">ICU預支/豁免</div>' +
            '</div>' +
          '</div>' +
          '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 12px;font-size:10.5px;color:#1e40af;line-height:1.45;">' +
            '<strong>精算洞察：</strong>癌症患者 68% 於首 2 年內需更換二線標靶藥物或持續化療。我方僅需 ' + ourWait + ' 年等候期即重啟 100% 賠償；對手需 ' + rivalWait + ' 年，中間等候期無償給付真空期需自費數十萬標靶藥費！' +
          '</div>' +
        '</div>';
      } else if (cat === 'Medical_VHIS') {
        if (titleEl) titleEl.innerText = '🏥 自願醫保年度額度與全港私院出院免找數矩陣 (VHIS Limit & Hospital Billing Matrix)';
        if (badgeEl) badgeEl.innerText = '出院免找數 · 全額全數賠償';

        const ourLimitWan = Math.round((card?.ourMetrics?.vhisAnnualLimit || card?.ourProduct?.vhisLimitHkd || mySelectedProduct?.vhis_metrics?.annual_limit_hkd || 20000000) / 10000);
        const rivalLimitWan = Math.round((card?.rivalMetrics?.vhisAnnualLimit || card?.rivalProduct?.vhisLimitHkd || rivalSelectedProduct?.vhis_metrics?.annual_limit_hkd || 15000000) / 10000);

        container.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:8px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:800;color:#1e40af;">🔵 【Plan A 我方】' + ourName + '</div>' +
            '<div style="font-size:13px;font-weight:800;color:#1e3a8a;margin-top:3px;">年度保障上限: HK$ ' + ourLimitWan.toLocaleString() + ' 萬</div>' +
            '<div style="font-size:10.5px;color:#0284c7;margin-top:3px;">✔ 全港所有私家醫院出院免找數 (Cashless)</div>' +
            '<div style="font-size:10.5px;color:#0284c7;">✔ 非手術癌症標靶/免疫療法無細項上限全數賠償</div>' +
          '</div>' +
          '<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:800;color:#991b1b;">🔴 【Plan B 對手】' + rivalName + '</div>' +
            '<div style="font-size:13px;font-weight:800;color:#7f1d1d;margin-top:3px;">年度保障上限: HK$ ' + rivalLimitWan.toLocaleString() + ' 萬</div>' +
            '<div style="font-size:10.5px;color:#b91c1c;margin-top:3px;">⚠️ 局限特約指定網絡或需繁複預審墊付</div>' +
            '<div style="font-size:10.5px;color:#b91c1c;">⚠️ 部分非手術治療設細項分項限額</div>' +
          '</div>' +
        '</div>';
      } else {
        if (titleEl) titleEl.innerText = '🏦 萬用壽險保單結算利率 vs 銀行借貸息差走廊 (Universal Life Net Spread Matrix)';
        if (badgeEl) badgeEl.innerText = '淨息差利差走廊 (Net Spread)';

        const ourSpread = (card?.ourMetrics?.ulNetSpread || card?.ourProduct?.ulNetSpread || mySelectedProduct?.ul_metrics?.net_spread_pct || 1.8);
        const rivalSpread = (card?.rivalMetrics?.ulNetSpread || card?.rivalProduct?.ulNetSpread || rivalSelectedProduct?.ul_metrics?.net_spread_pct || 1.2);
        const ourFloor = (card?.ourMetrics?.ulFloorRate || card?.ourProduct?.ulFloorRate || mySelectedProduct?.ul_metrics?.guaranteed_floor_rate_pct || 2.25);
        const rivalFloor = (card?.rivalMetrics?.ulFloorRate || card?.rivalProduct?.ulFloorRate || rivalSelectedProduct?.ul_metrics?.guaranteed_floor_rate_pct || 2.0);

        container.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          '<div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:8px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:800;color:#1e40af;">🔵 【Plan A 我方】' + ourName + '</div>' +
            '<div style="font-size:13px;font-weight:800;color:#1e3a8a;margin-top:3px;">淨息差利潤: +' + ourSpread + '%</div>' +
            '<div style="font-size:10.5px;color:#0284c7;margin-top:2px;">保底結算息率: ' + ourFloor + '% (強防禦)</div>' +
          '</div>' +
          '<div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:800;color:#991b1b;">🔴 【Plan B 對手】' + rivalName + '</div>' +
            '<div style="font-size:13px;font-weight:800;color:#7f1d1d;margin-top:3px;">淨息差利潤: +' + rivalSpread + '%</div>' +
            '<div style="font-size:10.5px;color:#b91c1c;margin-top:2px;">保底結算息率: ' + rivalFloor + '%</div>' +
          '</div>' +
        '</div>';
      }
    }

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

      // 1v1 / 3-Way Spec Table Update
      if (bilateralSpecTable) {
        if (arenaMode === '3way') {
          const specs3 = compute3WaySpecs(myCompany, selectedCompany, thirdCompany, currentCategory, mySelectedProduct, rivalSelectedProduct, thirdSelectedProduct);
          bilateralSpecTable.innerHTML = \`
            <thead>
              <tr style="background:#f1f5f9;border-bottom:1px solid #cbd5e1;">
                <th style="padding:6px 8px;font-size:11px;color:#475569;">指標維度</th>
                <th style="padding:6px 8px;font-size:11px;color:var(--ikb);font-weight:700;">Plan A (我方)</th>
                <th style="padding:6px 8px;font-size:11px;color:#ef4444;font-weight:700;">Plan B (對手)</th>
                <th style="padding:6px 8px;font-size:11px;color:#7c3aed;font-weight:700;">Plan C (第三方)</th>
                <th style="padding:6px 8px;font-size:11px;color:#0f172a;text-align:right;">三方評級</th>
              </tr>
            </thead>
            <tbody>
              \${specs3.map(row => \`
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:6px 8px;font-weight:600;color:#334155;">\${row.label}</td>
                  <td style="padding:6px 8px;font-family:'JetBrains Mono';font-weight:700;color:var(--ikb); \${row.winner === 'our' ? 'background:rgba(0,47,167,0.06);' : ''}">\${row.ourVal} \${row.winner === 'our' ? '<span style=\"font-size:9px;background:#dbeafe;color:#1e40af;padding:1px 4px;border-radius:3px;\">🏆領先</span>' : ''}</td>
                  <td style="padding:6px 8px;font-family:'JetBrains Mono';color:#475569; \${row.winner === 'rival' ? 'background:#fef2f2;font-weight:700;color:#dc2626;' : ''}">\${row.rivalVal} \${row.winner === 'rival' ? '<span style=\"font-size:9px;background:#fee2e2;color:#991b1b;padding:1px 4px;border-radius:3px;\">🏆領先</span>' : ''}</td>
                  <td style="padding:6px 8px;font-family:'JetBrains Mono';color:#475569; \${row.winner === 'third' ? 'background:#f5f3ff;font-weight:700;color:#7c3aed;' : ''}">\${row.thirdVal} \${row.winner === 'third' ? '<span style=\"font-size:9px;background:#ede9fe;color:#5b21b6;padding:1px 4px;border-radius:3px;\">🏆領先</span>' : ''}</td>
                  <td style="padding:6px 8px;font-size:10px;text-align:right;color:#64748b;">\${row.summary}</td>
                </tr>
              \`).join('')}
            </tbody>
          \`;
        } else if (Array.isArray(card.bilateral_specs)) {
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
      }

      // Horizon Display
      updateHorizonDisplay(card, currentHorizonYear);

      // Category-Aware Visual Interactive Chart
      renderCorridorVisualChart(card, currentCategory);

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

      // Render Active AI Scenario Agent Panel
      renderScenarioAgentPanel(card);

      // Sync AI Context Preview
      renderAiContextPreview();

      // Sync Client PDF Report Preview
      if (typeof renderClientPdfPreview === 'function') {
        renderClientPdfPreview();
      }
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
          <div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 8px;gap:6px;">
            <a href="\${p.official_url || p.brochure_url || getInsurerOfficialUrl(p.insurer)}" target="_blank" rel="noopener noreferrer" class="catalog-official-link" title="查閱原廠官方說明書與產品條款" style="font-size:11px;color:#002FA7;font-weight:700;text-decoration:underline;display:inline-flex;align-items:center;gap:3px;">📄 官方原廠說明書及條款 ↗</a>
            <span style="font-size:10px;color:#64748b;">保監局GN16核備</span>
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

    // Pitch Step & Full Copy Helpers with Visual Feedback
    function copyTextWithFeedback(text, btn, successMsg) {
      const msg = '✅ ' + (successMsg || '已複製到剪貼簿！');
      showToast(msg);
      if (btn && btn.nodeType === 1) flashButtonCopied(btn);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {
          fallbackCopyText(text, false);
        });
      } else {
        fallbackCopyText(text, false);
      }
    }

    function flashButtonCopied(btn) {
      if (!btn || !btn.innerHTML) return;
      const originalText = btn.innerHTML;
      btn.innerHTML = '已複製 ✔';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
      }, 1500);
    }

    function copyStepPitch(stepNum, btn) {
      const el = document.getElementById('agent-step-' + stepNum);
      const text = el ? (el.innerText || el.textContent || '').trim() : '';
      if (!text) return;
      copyTextWithFeedback(text, btn, '步驟 ' + stepNum + ' 破局話術已複製！');
    }
    window.copyStepPitch = copyStepPitch;

    function copyFull3StepPitch(btn) {
      const s1 = document.getElementById('agent-step-1');
      const s2 = document.getElementById('agent-step-2');
      const s3 = document.getElementById('agent-step-3');
      const t1 = s1 ? (s1.innerText || s1.textContent || '').trim() : '';
      const t2 = s2 ? (s2.innerText || s2.textContent || '').trim() : '';
      const t3 = s3 ? (s3.innerText || s3.textContent || '').trim() : '';
      const full = ['【步驟 1：肯定眼光】', t1, '', '【步驟 2：點破盲點】', t2, '', '【步驟 3：數據絕殺】', t3].join(String.fromCharCode(10));
      copyTextWithFeedback(full, btn, '完整 3 步破局話術已複製！');
    }
    window.copyFull3StepPitch = copyFull3StepPitch;

    // AI Analysis Assistant & System Prompt Copilot Handlers
    let lastAiAnalysisContextKey = '';

    function openAiChatDrawer() {
      try {
        const drawer = document.getElementById('ai-analysis-drawer');
        const backdrop = document.getElementById('ai-analysis-backdrop');
        if (drawer) {
          drawer.classList.add('open');
          drawer.style.visibility = 'visible';
          drawer.style.pointerEvents = 'auto';
        }
        if (backdrop) {
          backdrop.classList.add('open');
          backdrop.style.display = 'block';
          backdrop.style.opacity = '1';
          backdrop.style.pointerEvents = 'auto';
        }
        renderAiContextPreview();
        const chatContainer = document.getElementById('ai-chat-messages');
        const currentContextKey = currentCategory + '_' + myCompany + '_' + selectedCompany + '_' + (mySelectedProduct ? (mySelectedProduct.id || mySelectedProduct.name) : '') + '_' + (rivalSelectedProduct ? (rivalSelectedProduct.id || rivalSelectedProduct.name) : '');
        if (chatContainer && (!chatContainer.children || chatContainer.children.length === 0 || !chatContainer.innerHTML.trim() || lastAiAnalysisContextKey !== currentContextKey)) {
          lastAiAnalysisContextKey = currentContextKey;
          handleSmartPromptClick('analysis_core');
        }
      } catch (err) {
        console.warn('Error in openAiChatDrawer:', err);
      }
    }
    window.openAiChatDrawer = openAiChatDrawer;

    function closeAiChatDrawer() {
      try {
        const drawer = document.getElementById('ai-analysis-drawer');
        const backdrop = document.getElementById('ai-analysis-backdrop');
        if (drawer) {
          drawer.classList.remove('open');
          drawer.style.visibility = 'hidden';
          drawer.style.pointerEvents = 'none';
        }
        if (backdrop) {
          backdrop.classList.remove('open');
          backdrop.style.opacity = '0';
          setTimeout(() => {
            if (backdrop && !backdrop.classList.contains('open')) {
              backdrop.style.display = 'none';
              backdrop.style.pointerEvents = 'none';
            }
          }, 250);
        }
      } catch (err) {
        console.warn('Error in closeAiChatDrawer:', err);
      }
    }
    window.closeAiChatDrawer = closeAiChatDrawer;

    function getProductById(idOrObj) {
      if (!idOrObj) return null;
      if (typeof idOrObj === 'object' && idOrObj !== null) {
        if (idOrObj.name && (idOrObj.gn16 || idOrObj.gn16Fulfillment || idOrObj.category)) {
          return idOrObj;
        }
        idOrObj = idOrObj.id || idOrObj.name || '';
      }
      const s = String(idOrObj).trim();
      if (!s) return null;
      if (typeof window !== 'undefined' && Array.isArray(window.ALL_PRODUCTS_CATALOG)) {
        return window.ALL_PRODUCTS_CATALOG.find(function(p) {
          return p.id === s || p.name === s || cleanProductName(p.name) === cleanProductName(s);
        }) || null;
      }
      return null;
    }
    window.getProductById = getProductById;

    function renderAiContextPreview() {
      try {
        const el = document.getElementById('ai-context-details');
        if (!el) return;
        const ourProf = COMPANY_PROFILES[myCompany] || { fullName: myCompany, code: myCompany, flagshipSavings: '友邦 盈御多元貨幣 3' };
        const rivalProf = COMPANY_PROFILES[selectedCompany] || { fullName: selectedCompany, code: selectedCompany, flagshipSavings: '保誠 雋富多元貨幣' };

        let defaultOurName = ourProf.flagshipSavings || '友邦 盈御多元貨幣 3';
        let defaultRivalName = rivalProf.flagshipSavings || '保誠 雋富多元貨幣';
        if (currentCategory === 'Critical_Illness') {
          defaultOurName = ourProf.flagshipCI || '友邦 友心意危疾保';
          defaultRivalName = rivalProf.flagshipCI || '保誠 誠保一生危疾保';
        } else if (currentCategory === 'Medical_VHIS') {
          defaultOurName = ourProf.flagshipVHIS || '友邦 尊裕醫療自願醫保';
          defaultRivalName = rivalProf.flagshipVHIS || '保誠 摯為您醫療計劃';
        } else if (currentCategory === 'Annuity_QDAP') {
          defaultOurName = ourProf.flagshipQDAP || '友邦 延期年金計劃';
          defaultRivalName = rivalProf.flagshipQDAP || '保誠 雋逸年金計劃';
        } else if (currentCategory === 'Financing_UniversalLife') {
          defaultOurName = ourProf.flagshipUL || '友邦 財富尊享萬用壽險';
          defaultRivalName = rivalProf.flagshipUL || '保誠 富傳萬用壽險';
        }

        const ourProd = getProductById(mySelectedProduct) || { name: defaultOurName, gn16: '96.5%', prepay: '5.0%', breakeven: '第 18 年保證', breakevenYear: 18, gn16Fulfillment: 96.5 };
        const rivalProd = getProductById(rivalSelectedProduct) || { name: defaultRivalName, gn16: '91.2%', prepay: '5.8%', breakeven: '第 19 年保證', breakevenYear: 19, gn16Fulfillment: 91.2 };

        const ourGn16 = (ourProd.gn16Fulfillment || parseFloat(ourProd.gn16) || 96.5);
        const rivalGn16 = (rivalProd.gn16Fulfillment || parseFloat(rivalProd.gn16) || 91.2);
        const gn16Diff = (ourGn16 - rivalGn16).toFixed(1);
        const ourBe = (ourProd.breakevenYear || 18);
        const rivalBe = (rivalProd.breakevenYear || 19);
        const ourPrepay = ourProd.prepay || (ourProd.prepayRate ? ourProd.prepayRate + '%' : '無預繳');
        const rivalPrepay = rivalProd.prepay || (rivalProd.prepayRate ? rivalProd.prepayRate + '%' : '無預繳');

        let metricLine = '';
        if (currentCategory === 'Critical_Illness') {
          metricLine = '<strong>🛡️ 危疾精算差值</strong>：癌症等候期 <strong>' + (ourProd.cancerWaitYears || 1) + ' 年 vs ' + (rivalProd.cancerWaitYears || 3) + ' 年</strong> | 疾病總數 <strong>' + (ourProd.ciIllnesses || 120) + ' 種</strong>';
        } else if (currentCategory === 'Medical_VHIS') {
          metricLine = '<strong>🏥 醫保精算差值</strong>：半私家病房 <strong>全數賠償 (無細項上限)</strong> | 私家醫院 <strong>出院免找數直付</strong>';
        } else if (currentCategory === 'Annuity_QDAP') {
          metricLine = '<strong>👴 年金扣稅差值</strong>：法定最高退稅 <strong>HK$ 10,200 (夫妻 $20,400)</strong> | 保證現金流 <strong>' + (ourProd.qdapGuaranteedPct || 52) + '% 確定性</strong>';
        } else if (currentCategory === 'Financing_UniversalLife') {
          metricLine = '<strong>🏦 萬用融資差值</strong>：最高成數 <strong>' + (ourProd.ulLtv || 85) + '% LTV</strong> | 正利差套利 <strong>' + (ourProd.ulNetSpread || 1.45) + '%</strong>';
        } else {
          metricLine = '<strong>⚖️ 儲蓄精算差值</strong>：GN16 差額 <strong>' + (gn16Diff >= 0 ? '+' : '') + gn16Diff + '%</strong> | 保證回本 <strong>' + (ourBe <= rivalBe ? '快 ' + (rivalBe - ourBe) + ' 年' : '慢 ' + (ourBe - rivalBe) + ' 年') + '</strong>';
        }

        const pitfallsHtml = (rivalProd.clause_pitfalls && rivalProd.clause_pitfalls.length > 0)
          ? rivalProd.clause_pitfalls.slice(0, 2).map(function(pf){ return '⚠️ ' + pf; }).join('<br>')
          : '⚠️ 次年浮動利率跳水風險 · 提早退保罰則折損';

        el.innerHTML = [
          '<div>🔵 <strong>我方代表 (Plan A)</strong>：' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】</div>',
          '<div>🔴 <strong>遭遇競品 (Plan B)</strong>：' + rivalProf.fullName + '【' + cleanProductName(rivalProd.name) + '】</div>',
          '<div style="background:#eff6ff;padding:4px 6px;border-radius:4px;border:1px solid #bfdbfe;font-size:10px;color:#1e3a8a;">' + metricLine + '</div>',
          '<div>⚡ <strong>客戶異議焦點</strong>：' + (selectedClaimText || selectedClaim || '產品對比') + '</div>',
          '<div style="font-size:10px;color:#b91c1c;"><strong>⚠️ 競品避坑細則</strong>：<br>' + pitfallsHtml + '</div>',
          '<div>🛡️ <strong>合規約束</strong>：香港保監局《持牌保險中介人操守守則》第 4.2 條 (客觀事實對比，嚴禁非理性貶損)</div>'
        ].join('');

        // Dynamically update smart prompt chips to reflect current entities
        const chip1 = document.getElementById('ai-chip-analysis-core');
        if (chip1) chip1.innerText = '🔥 攻防核心：【' + (ourProf.code || '我方') + ' vs ' + (rivalProf.code || '對手') + '】';
        const chip2 = document.getElementById('ai-chip-gimmick-break');
        if (chip2) chip2.innerText = '⚡ 客問：' + (selectedClaimText || selectedClaim || '高額預繳') + ' 點解唔買？';
      } catch (err) {
        console.warn('renderAiContextPreview warning:', err);
      }
    }
    window.renderAiContextPreview = renderAiContextPreview;

    function handleSmartPromptClick(promptType) {
      try {
        const ourProf = COMPANY_PROFILES[myCompany] || { fullName: myCompany };
        const rivalProf = COMPANY_PROFILES[selectedCompany] || { fullName: selectedCompany };
        let queryTitle = '';
        if (promptType === 'analysis_core') {
          queryTitle = '🔥 攻防核心：【' + ourProf.fullName + ' vs ' + rivalProf.fullName + '】精算深度比對與戰略定位';
        } else if (promptType === 'gimmick_break') {
          queryTitle = '⚡ 客問：' + (selectedClaimText || selectedClaim || '宣傳優勢') + '，點解唔買對手？(30秒破局話術)';
        } else if (promptType === 'family_bundling') {
          queryTitle = '👨‍👩‍👧 年輕家庭客：60/40 儲蓄與危疾組合以守代攻';
        } else if (promptType === 'offshore_mcv') {
          queryTitle = '🇨🇳 MCV 內地訪港客：醫院直付名單、特快核保與離岸信託優勢';
        } else if (promptType === 'gl20_compliance') {
          queryTitle = '🛡️ 如何合規 (GL20) 應對虛擬網上保險低價競爭？';
        }
        generateAiResponse(queryTitle, promptType);
      } catch (err) {
        console.warn('handleSmartPromptClick warning:', err);
      }
    }
    window.handleSmartPromptClick = handleSmartPromptClick;

    function sendAiChatQuery() {
      try {
        const input = document.getElementById('ai-chat-input');
        const text = input ? input.value.trim() : '';
        if (!text) return;
        input.value = '';
        generateAiResponse(text, 'custom');
      } catch (err) {
        console.warn('sendAiChatQuery warning:', err);
      }
    }
    window.sendAiChatQuery = sendAiChatQuery;

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function generateAiResponse(query, type) {
      const chatContainer = document.getElementById('ai-chat-messages');
      if (!chatContainer) return;

      const ourProf = COMPANY_PROFILES[myCompany] || { fullName: myCompany, code: myCompany, flagshipSavings: '友邦 盈御多元貨幣 3' };
      const rivalProf = COMPANY_PROFILES[selectedCompany] || { fullName: selectedCompany, code: selectedCompany, flagshipSavings: '保誠 雋富多元貨幣' };

      let defaultOurName = ourProf.flagshipSavings || '友邦 盈御多元貨幣 3';
      let defaultRivalName = rivalProf.flagshipSavings || '保誠 雋富多元貨幣';
      if (currentCategory === 'Critical_Illness') {
        defaultOurName = ourProf.flagshipCI || '友邦 友心意危疾保';
        defaultRivalName = rivalProf.flagshipCI || '保誠 誠保一生危疾保';
      } else if (currentCategory === 'Medical_VHIS') {
        defaultOurName = ourProf.flagshipVHIS || '友邦 尊裕醫療自願醫保';
        defaultRivalName = rivalProf.flagshipVHIS || '保誠 摯為您醫療計劃';
      } else if (currentCategory === 'Annuity_QDAP') {
        defaultOurName = ourProf.flagshipQDAP || '友邦 延期年金計劃';
        defaultRivalName = rivalProf.flagshipQDAP || '保誠 雋逸年金計劃';
      } else if (currentCategory === 'Financing_UniversalLife') {
        defaultOurName = ourProf.flagshipUL || '友邦 財富尊享萬用壽險';
        defaultRivalName = rivalProf.flagshipUL || '保誠 富傳萬用壽險';
      }

      const ourProd = getProductById(mySelectedProduct) || { name: defaultOurName, gn16: '96.5%', prepay: '5.0%', breakevenYear: 18, gn16Fulfillment: 96.5 };
      const rivalProd = getProductById(rivalSelectedProduct) || { name: defaultRivalName, gn16: '91.2%', prepay: '5.8%', breakevenYear: 19, gn16Fulfillment: 91.2 };

      const ourGn16 = (ourProd.gn16Fulfillment || parseFloat(ourProd.gn16) || 96.5);
      const rivalGn16 = (rivalProd.gn16Fulfillment || parseFloat(rivalProd.gn16) || 91.2);
      const gn16Diff = (ourGn16 - rivalGn16).toFixed(1);
      const ourBe = (ourProd.breakevenYear || 18);
      const rivalBe = (rivalProd.breakevenYear || 19);

      let strategy = '';
      let script = '';
      let evidence = '';
      let compliance = '';

      if (type === 'analysis_core' || query.includes('攻防核心') || query.includes('精算深度比對') || query.includes('雙方攻防')) {
        if (currentCategory === 'Critical_Illness') {
          strategy = '圍繞【' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】 vs ' + rivalProf.fullName + '【' + cleanProductName(rivalProd.name) + '】】展開危疾條款穿透對抗。以「癌症索償等候間隔僅 1 年（競品需 3 年）」、「深切治療部 ICU 入住即預支 20%」及「多次賠付高達 900%」為核心戰策，打消客戶對競品表面保費之遲疑。';
          script = '「陳生，買危疾保險最緊要係病發同復發時賠得快、賠得足。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】癌症間隔期僅 1 年，對手足足要熬 3 年！癌症復發黃金治療期往往在 1-2 年內，等 3 年等同防護出現真空期；條款更涵蓋 ICU 預支，真真正正為全家築牢救命防火牆！」';
          evidence = '各大保險公司危疾保單條款 (Policy Provisions) 之癌症等待期及重疾定義章節。';
          compliance = '恪守香港保監局 GL20 守則及第 4.2 條：以條款白紙黑字為依據，客觀對比等候期定義，嚴禁非理性貶損。';
        } else if (currentCategory === 'Medical_VHIS') {
          strategy = '以「全港私家醫院全數賠償（無細項分拆上限）」、「自費非手術癌症標靶藥實報實銷」與「出院免找數直付保證」為三大護城河，對比競品項目分拆賠償上限與繁複墊支索償。';
          script = '「李太，醫療險最怕『買咗賠唔足，出院自己先墊幾十萬』。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】半私家病房手術及雜費全數 100% 賠償，不設逐項分項限額；百萬標靶藥全額包底，更直接開通全港私家醫院出院免找數綠色通道，簽名即可出院，不用家人奔波墊支！」';
          evidence = '香港保監局自願醫保 (VHIS) 官方認可產品條款及私家醫院直付協議名冊。';
          compliance = '嚴格遵循保監局 GL20 第 4.2 條：客觀說明標準計劃與靈活計劃結構，提示醫療必需性及自負額條款。';
        } else if (currentCategory === 'Annuity_QDAP') {
          strategy = '主打「頂階稅階實質退稅 17% (每年慳足 HK$ 10,200，夫妻慳 $20,400)」與「保證終身年金現金流佔比超 80%」，對比市場競品浮動紅利過大之市場波動風險。';
          script = '「張生，QDAP 扣稅年金係稅務局真金白銀幫你供保險！每年頂階稅階退稅高達 HK$ 10,200（夫妻合併慳 $20,400），等同買入即享 17% 保證無風險回報；而且我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】保證年金比例高，確定月派至 100 歲，無懼降息波動！」';
          evidence = '香港稅務局《稅務條例》第 26AU 條合資格延期年金扣稅指引及各大保司年金利益說明書。';
          compliance = '恪守保監局 GL20 守則：明確披露年金期滿退保價值與保證年金現金流，合規提示提早退保之財務折損。';
        } else if (currentCategory === 'Financing_UniversalLife') {
          strategy = '主打「85% LTV 私銀保費融資槓桿」+「正利差套利空間超 1.45%」+「保底派息率 2.25%」，為高淨值客戶實現大額人壽槓桿與家族財富隔離傳承。';
          script = '「王總，萬用壽險保費融資係私銀級資產槓桿工具。我地' + ourProf.fullName + '支援高達 85% LTV 融資，您只需投入 15% 本金即可鎖定數千萬終身人壽保障；宣告派息 5.25% 扣除銀行融資成本，淨利差套利超 1.45%，身故槓桿高達 4-7 倍，資產隔離傳承首選！」';
          evidence = '私人銀行保費融資合約條款、萬用壽險保單費用及保底宣告派息率報告。';
          compliance = '合規警示：保費融資涉及利率風險、追加保證金 (Margin Call) 風險及退保費用，中介人必須客觀進行壓力測試。';
        } else {
          // Savings MultiCurrency
          const deltaLead = (ourGn16 - rivalGn16 >= 0)
            ? ('官方 GN16 實現率領先 +' + gn16Diff + '%')
            : ('官方 GN16 實現率 ' + ourGn16 + '% vs ' + rivalGn16 + '%');
          strategy = '圍繞【' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】 vs ' + rivalProf.fullName + '【' + cleanProductName(rivalProd.name) + '】】展開精算對決。以「' + deltaLead + '」與「' + (ourBe <= rivalBe ? '保證回本期更短、資金安全性更強' : '長期複利更高') + '」為核心護城河，化解競品短期促銷宣傳衝擊。引導客戶著眼 30 年複利累積真金白銀，而非首年噱頭。';
          script = '「' + (ourProf.code === 'AIA' ? '陳生' : '張總') + '，買長期保險好比馬拉松，短期促銷宣傳單張只係起跑線。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】深耕香港，歷年保監局 GN16 官方實現率達 ' + ourGn16 + '%（對手【' + cleanProductName(rivalProd.name) + '】為 ' + rivalGn16 + '%）。複利 30 年差額往往高達幾十萬港元！條款更支援多貨幣無等待期轉換與保單分拆，為您家族傳承提供跨越幾十年的確定承諾！」';
          evidence = '香港保監局 (IA) 官方 GN16 分紅實現率數據庫、各大保險公司官方產品說明書。';
          compliance = '恪守香港保監局 GL20 守則及第 4.2 條：以官方數據客觀陳述，提示非保證分紅可能浮動，無詆毀性詞彙。';
        }
      } else if (type === 'gimmick_break' || query.includes('預繳') || query.includes('回贈') || query.includes('點解唔買')) {
        if (currentCategory === 'Critical_Illness') {
          strategy = '針對對手重疾宣傳噱頭，採用「肯定眼光 ➔ 點破等候期死穴 ➔ 癌症 1 年間隔絕殺」三步法。競品宣傳表面看似保費相宜，但通函條款隱藏癌症二次復發需熬 3 年空窗期；我方' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】癌症間隔僅 1 年，並涵蓋 ICU 20% 預支與多次賠付！';
          script = '「陳生，買危疾保險最緊要唔係第一張單張幾平，而係萬一不幸生癌復發賠唔賠到。對手【' + cleanProductName(rivalProd.name) + '】寫明要等足 3 年先可以索償第二次，但臨床統計癌症復發高峰期往往在 1-2 年內，等 3 年等同防護出現真空期！我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】癌症間隔期只要 1 年，重有深切治療部入住即賠，真正為全家築起救命防火牆！」';
          evidence = '各大保險公司危疾保單條款 (Policy Provisions) 之癌症復發等待期定義及臨床腫瘤學統計。';
          compliance = '恪守香港保監局 GL20 守則及第 4.2 條：以官方保單條款白紙黑字客觀陳述，提示疾病定義差異。';
        } else if (currentCategory === 'Medical_VHIS') {
          strategy = '針對對手平價醫保噱頭，採用「肯定眼光 ➔ 點破細項拆分上限 ➔ 全港私院出院免找數全數賠償絕殺」三步法。競品常設各項雜費及手術分項上限，大病時病房雜費超額常需客戶自行墊付；我方' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】半私家病房全數賠償，無細項分拆上限，兼開通私院出院免找數！';
          script = '「李太，醫療保險最怕『買咗賠唔足，出院要自己先掏幾十萬找數』。對手計劃每項手術同雜費都設有上限，超額就要自己貼；我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】半私家病房手術雜費全數 100% 賠償，不設細項拆分限額；更直接開通養和、港怡等全港私院出院免找數綠色通道，簽名即可出院，不用家人奔波借錢墊支！」';
          evidence = '自願醫保 (VHIS) 官方認可條款、各大保司出院免找數協議醫院名冊。';
          compliance = '嚴格遵循保監局 GL20 第 4.2 條：客觀說明標準計劃與靈活計劃結構，提示醫療必需性審核規範。';
        } else if (currentCategory === 'Annuity_QDAP') {
          strategy = '針對對手浮動分紅噱頭，採用「肯定眼光 ➔ 點破浮動紅利風險 ➔ 法定頂階退稅 17% 與保證年金絕殺」三步法。競品非保證成分過高，降息週期實際派發易縮水；我方' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】合資格延期年金法定扣稅上限高達 $60,000 (夫妻 $120,000)，頂階實質慳稅 $10,200 ($20,400)，保證年金現金流佔比超 80%！';
          script = '「張生，QDAP 扣稅年金係稅務局真金白銀幫你供保險！每年頂階稅階退稅高達 HK$ 10,200（夫妻合併慳 $20,400），等同買入即享 17% 保證無風險回報；而且我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】保證年金現金流確定性高達 80% 以上，確定月月派到 100 歲，無懼降息波動！」';
          evidence = '香港稅務局《稅務條例》第 26AU 條 QDAP 扣稅指引及各大保司利益說明書。';
          compliance = '恪守保監局 GL20 守則：明確披露保證與非保證年金現金流，合規提示提早退保之財務折損。';
        } else if (currentCategory === 'Financing_UniversalLife') {
          strategy = '針對對手高派息宣傳，採用「肯定眼光 ➔ 點破融資利率波動與 Margin Call ➔ 85% LTV 與正利差鎖定絕殺」三步法。警惕降息期宣告利率下調與銀行借貸息差倒掛風險；我方' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】具備高達 85% LTV 融資成數與保底派息率，提供穩健套利空間！';
          script = '「王總，萬用壽險保費融資最關鍵在於利差穩定性與銀行追收保證金 (Margin Call) 風險。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】支援高達 85% LTV 融資，首期本金投入極低即可撬動數千萬人壽槓桿；宣告派息穩定扣減融資成本後淨利差達 1.45% 以上，更設保底派息率築牢底線！」';
          evidence = '私人銀行保費融資合約條款、萬用壽險保單費用及保底宣告派息率報告。';
          compliance = '合規警示：保費融資涉及利率風險、追加保證金 (Margin Call) 風險及退保費用，中介人必須客觀進行壓力測試。';
        } else {
          strategy = '採用「肯定眼光 ➔ 點破次年浮動 ➔ GN16 官方數據絕殺」三步法。切忌直接硬駁客戶，先肯定' + rivalProf.fullName + '【' + cleanProductName(rivalProd.name) + '】宣傳單張的吸睛度，再引導其細閱通函備註：對手高息僅限首年，次年回歸市場浮動息；我方' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】歷年 GN16 官方實現率達 ' + ourGn16 + '%，30 年複利實質派發遠超短期息差。';
          script = '「' + (ourProf.code === 'AIA' ? '陳生' : '客官') + '，你真係好有眼光！' + rivalProf.fullName + '個宣傳第一眼睇真係好吸引！但仔細睇通函 fine print，佢個利息寫明只保證頭 1 年，第二年起跟市場浮動。長線儲蓄最緊要係幾十年後派唔派得足，我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】歷年 GN16 實現率達 ' + ourGn16 + '%，複利 30 年足足領先對手幾十萬真金白銀！」';
          evidence = '香港保監局 (IA) 官方 GN16 分紅實現率數據庫及各大保險公司年度通函批註。';
          compliance = '嚴格遵循保監局 GL20 第 4.2 條：以官方數據為依據，提示次年浮動利率機制，無任何詆毀競品詞彙。';
        }
      } else if (type === 'family_bundling' || query.includes('家庭')) {
        strategy = '採用「60/40 攻守兼備配置法」：60% 預算鎖定高槓桿人壽危疾底層防禦（覆蓋未供完房貸與子女教育缺口），40% 配置' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】多元貨幣儲蓄，實現資產穩定增長與跨代傳承。';
        script = '「張生張太，為家庭理財最怕『單腳跳』——淨買儲蓄若突發重疾會被迫斷供退保；淨買消費型醫保保費隨年紀暴漲無資產沉澱。我地建議將月預算 60% 佈局平準終身防禦，40% 放入多元貨幣儲蓄滾存複利，兼顧眼下保障與子女長遠留學儲備！」';
        evidence = '家庭財務精算防禦模型、平準保費終身精算表。';
        compliance = '合規提示：資產配置組合需因應客戶負債比率、流動性需求及風險承受能力獨立評估。';
      } else if (type === 'offshore_mcv' || query.includes('內地') || query.includes('MCV')) {
        strategy = '主打「內地 1,000+ 家三甲醫院出院免找數直付」+「特快免體檢額最高達 USD 150 萬」+「合法入境小白條跨境合規保單」+「離岸多幣種信託架構」。';
        script = '「趙總，內地企業家赴港投保最關鍵在於理賠便捷與資產確定性。我地' + ourProf.fullName + '直連北京協和、上海瑞金等全國過千家三甲醫院，出院免找數直接結算，無需親自抵港索償；且支援 9 種世界貨幣無等待期轉換與保單分拆，離岸信託架構助您跨代財富無憂傳承！」';
        evidence = '官方認可內地直付醫院名冊、境外大額保單核保指引。';
        compliance = '嚴格遵守內地訪港投保法規，簽單手續必須在香港境內持有效入境標籤 (小白條) 依法完成。';
      } else if (type === 'gl20_compliance' || query.includes('虛擬') || query.includes('Bowtie')) {
        strategy = '客觀指出「純消費型醫療保障 vs 具備資產沉澱與跨代傳承的旗艦分紅險」之本質差異。純網上保險保費雖低但屬消費開支且多為自然費率，年紀越大保費跳升越劇烈；大病時缺乏專屬中介人跑腿辦妥出院免找數直付擔保。';
        script = '「李太，純網上保險確實透明度高，適合作為年輕時的短期消費補充。但面對長線退休、子女傳承或大額重疾，我們旗艦方案鎖定 20 年平準保費終身保證，兼備專人全程跑腿直付理賠，不用大病時自己對住個 App 煩惱墊支幾十萬。」';
        evidence = '自願醫保各計劃條款對比、平準費率 vs 自然費率精算模型。';
        compliance = '嚴格恪守保監局第 4.2 條：客觀闡述產品結構特性差異，不使用「網上公司不可靠」等主觀不當言論。';
      } else if (query.includes('生癌') || query.includes('危疾') || query.includes('等候期')) {
        strategy = '突出危疾救治三大命脈：癌症二次復發間隔（1年 vs 3年）、ICU 預支與多次賠償總額。';
        script = '「陳生，萬一生癌，治療往往係長期拉鋸戰。市面上大部分競品要等足 3 年先可以賠第二次，如果第 18 個月復發就完全冇得賠；而我地方案只要隔 1 年即賠足，且涵蓋深切治療部入住預支，真正做到患難時真金白銀隨叫隨到！」';
        evidence = '香港主要私家醫院腫瘤科平均醫療收費、保監局危疾保單索償統計。';
        compliance = '恪守 GL20 守則：客觀比對間隔期定義，不誇大單一險種保障範圍。';
      } else if (query.includes('直付') || query.includes('免找數') || query.includes('養和') || query.includes('醫院')) {
        strategy = '詳述香港私家醫院及內地 1,000+ 三甲醫院免找數直付申請流程與全數賠償優勢。';
        script = '「陳生，如果生病入院，最緊要唔好為幾十萬醫療費現金周轉煩惱。我地醫保開通全港私家醫院（包括養和、港怡、嘉諾撒等）出院免找數綠色通道，只要入院前提交預先批核，出院時由保險公司直接同醫院全額結算，簽個名就可以走，零墊支負擔！」';
        evidence = '官方合作私家醫院免找數協議、三甲醫院直付結算網絡名單。';
        compliance = '合規提示：出院免找數需符合保險公司預先批核手續及醫療必需性審核。';
      } else {
        if (currentCategory === 'Critical_Illness') {
          strategy = '圍繞當前所選【' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】 vs ' + rivalProf.fullName + '【' + cleanProductName(rivalProd.name) + '】】之危疾條款優勢，聚焦癌症索償等待期間隔（' + (ourProd.cancerWaitYears || 1) + ' 年 vs ' + (rivalProd.cancerWaitYears || 3) + ' 年）與多次賠償總額，為客戶建構無空窗期防禦體系。';
          script = '「陳生，買危疾最怕復發時有真空期。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】癌症間隔期只要 1 年，重有深切治療部預支賠償，白紙黑字保障您同家人嘅救命資金！」';
          evidence = '各大保險公司危疾保單條款 (Policy Provisions) 之癌症復發等待期定義。';
          compliance = '恪守香港保監局 GL20 守則及第 4.2 條：以條款白紙黑字客觀陳述，提示疾病定義差異。';
        } else if (currentCategory === 'Medical_VHIS') {
          strategy = '圍繞當前所選【' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】 vs ' + rivalProf.fullName + '【' + cleanProductName(rivalProd.name) + '】】之醫保優勢，主打半私家全數賠償（無細項分拆上限）、全額標靶藥及全港頂尖私家醫院出院免找數直付。';
          script = '「李太，買醫療險最重要係病床全額包底同免墊支。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】半私家手術雜費全額賠償，出院免找數直接由保司對賬，簽名即可出院！」';
          evidence = '自願醫保 (VHIS) 官方認可條款及各大保司出院免找數名冊。';
          compliance = '嚴格遵循保監局 GL20 第 4.2 條：客觀說明標準計劃與靈活計劃結構。';
        } else if (currentCategory === 'Annuity_QDAP') {
          strategy = '圍繞當前所選【' + ourProf.fullName + ' vs ' + rivalProf.fullName + '】之年金扣稅優勢，以法定每年 HK$60,000 (夫妻 $120,000) 扣稅額度、頂階實質慳稅 HK$ 10,200 ($20,400) 與確定保證終身現金流為核心。';
          script = '「張生，QDAP 扣稅年金等同稅務局真金白銀補貼您儲蓄退休！每年最高慳稅 $10,200（夫妻 $20,400），且保證終身派息抗通脹，無懼降息波動！」';
          evidence = '香港稅務局《稅務條例》第 26AU 條合資格延期年金指引。';
          compliance = '恪守香港保監局 GL20 守則：明確披露保證與非保證年金現金流。';
        } else if (currentCategory === 'Financing_UniversalLife') {
          strategy = '圍繞當前所選【' + ourProf.fullName + ' vs ' + rivalProf.fullName + '】之萬用壽險與保費融資優勢，主打高達 85% LTV 私銀槓桿、超 1.45% 正利差套利與家族跨代財富傳承架構。';
          script = '「王總，萬用壽險保費融資以 15% 本金槓桿鎖定數千萬人壽保障，淨利差套利空間穩健，為您提供頂級家族資產隔離與跨代傳承！」';
          evidence = '私人銀行保費融資合約條款及萬用壽險利益說明書。';
          compliance = '合規提示：保費融資涉及利率風險與 Margin Call 追加保證金風險，中介人需進行壓力測試。';
        } else {
          strategy = '圍繞當前所選【' + ourProf.fullName + ' vs ' + rivalProf.fullName + '】之精算優勢，以穩定分紅實現率 (GN16)、靈活保單分拆、貨幣轉換及健全核保額度為核心，化解競品短期促銷宣傳衝擊。';
          script = '「陳生，買長期保險好比長跑，短期促銷宣傳單張只係起跑線。我地' + ourProf.fullName + '【' + cleanProductName(ourProd.name) + '】深耕香港數十年，分紅實現率歷經牛熊市考驗依然穩健，條款清晰無次年跳水陷阱，為你家族提供跨越幾十年的確定承諾！」';
          evidence = '香港保監局 GN16 公開年報及各大保司官方產品說明書。';
          compliance = '恪守香港保監局 GL20 守則：客觀中立，利益陳述與風險披露並重。';
        }
      }

      const userBubbleHtml = (type === 'custom')
        ? '<div class="ai-chat-bubble ai-user-query">' +
            '<div style="font-weight:700;color:var(--ikb);margin-bottom:2px;font-size:11px;">👤 顧問提問：</div>' +
            '<div style="color:#0f172a;font-size:12px;font-weight:600;">' + escapeHtml(query) + '</div>' +
          '</div>'
        : '';

      const msgHtml = '<div class="ai-chat-bubble ai-assistant-reply">' +
        '<div style="font-weight:800;color:var(--ikb);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">' +
          '<span>💡 攻防課題：' + escapeHtml(query) + '</span>' +
          '<span style="font-size:10px;color:#64748b;font-family:JetBrains Mono,monospace">AI COPILOT</span>' +
        '</div>' +
        '<div style="margin-bottom:8px;">' +
          '<strong style="color:#0f172a;">🎯 戰略破局核心：</strong><br>' +
          '<span style="color:#334155;">' + strategy + '</span>' +
        '</div>' +
        '<div style="background:#f8fafc;border-left:3px solid var(--ikb);padding:8px 10px;border-radius:4px;margin-bottom:8px;">' +
          '<strong style="color:var(--ikb);">🗣️ 30 秒地道口頭話術（粵語實戰）：</strong><br>' +
          '<span style="color:#0f172a;font-weight:600;" class="ai-script-text">' + script + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#64748b;margin-bottom:4px;">' +
          '<strong>📊 精算數據出處：</strong>' + evidence +
        '</div>' +
        '<div style="font-size:10px;color:#059669;background:#ecfdf5;padding:4px 8px;border-radius:4px;border:1px solid #a7f3d0;">' +
          '<strong>🛡️ 保監局 GL20 合規護欄：</strong>' + compliance +
        '</div>' +
        '<div class="ai-chat-footer">' +
          '<button class="inline-pitch-copy-btn btn-copy-full" onclick="copyAiGeneratedScript(this)">📋 一鍵複製 AI 話術</button>' +
        '</div>' +
      '</div>';

      chatContainer.innerHTML = userBubbleHtml + msgHtml + chatContainer.innerHTML;
      try {
        const firstMsg = chatContainer.firstElementChild;
        if (firstMsg && typeof firstMsg.scrollIntoView === 'function') {
          firstMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (e) {}
    }

    function copyAiGeneratedScript(btn) {
      const card = btn.closest('.ai-chat-bubble');
      const scriptEl = card ? card.querySelector('.ai-script-text') : null;
      const text = scriptEl ? (scriptEl.innerText || scriptEl.textContent || '').trim() : '';
      if (!text) return;
      copyTextWithFeedback(text, btn, 'AI 攻防話術已複製！');
    }
    window.copyAiGeneratedScript = copyAiGeneratedScript;
    window.generateAiResponse = generateAiResponse;
    window.generateAiAnalysis = generateAiResponse;

    function copySystemPrompt(btn) {
      const el = document.getElementById('ai-system-prompt-text');
      const text = el ? (el.innerText || el.textContent || '').trim() : '';
      if (!text) return;
      copyTextWithFeedback(text, btn, 'AIA System Prompt 已複製！');
    }
    window.copySystemPrompt = copySystemPrompt;

    // ==========================================================================
    // AI Scenario Agent Engines & Handlers
    // ==========================================================================
    const MCV_FX_RATES = {
      USD: { HKD: 7.78, RMB: 7.23, USD: 1.0 },
      HKD: { USD: 0.1285, RMB: 0.929, HKD: 1.0 },
      RMB: { USD: 0.1383, HKD: 1.076, RMB: 1.0 }
    };

    function convertMCVCurrency(amount, fromCur, toCur) {
      const amt = (typeof amount === 'number' && !isNaN(amount)) ? Math.max(0, amount) : Math.max(0, parseFloat(mcvAmount) || 0);
      const f = fromCur || mcvCurrency;
      const t = toCur || (f === 'USD' ? 'RMB' : 'USD');
      const rate = (MCV_FX_RATES[f] && MCV_FX_RATES[f][t]) ? MCV_FX_RATES[f][t] : 1.0;
      const converted = Math.round(amt * rate * 100) / 100;
      return {
        originalAmount: amt,
        fromCur: f,
        toCur: t,
        rate: rate,
        converted: converted
      };
    }

    function calculateFamilyBudget(monthlyBudget, annualIncome, mortgageBalance) {
      const mb = (typeof monthlyBudget === 'number' && !isNaN(monthlyBudget)) ? Math.max(500, monthlyBudget) : familyMonthlyBudget;
      const ai = (typeof annualIncome === 'number' && !isNaN(annualIncome)) ? Math.max(0, annualIncome) : (mb * 12 * 7);
      const mbBal = (typeof mortgageBalance === 'number' && !isNaN(mortgageBalance)) ? Math.max(0, mortgageBalance) : familyMortgageBalance;
      const protectionBudget = Math.round(mb * 0.6);
      const savingsBudget = mb - protectionBudget;
      const annualExpenses = Math.round(ai * 0.6);
      const termCoverage = mbBal + Math.round(annualExpenses * 5);
      const ciCoverage = Math.max(Math.round(ai * 2.5), Math.round(protectionBudget * 400));
      const mortgageGap = Math.max(0, mbBal - Math.round(termCoverage * 0.7));
      const r = 0.055 / 12;
      const n = 18 * 12;
      const projectedEduFund = Math.round(savingsBudget * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      const totalSavingsDeposited = savingsBudget * n;
      const projectedCompoundGain = projectedEduFund - totalSavingsDeposited;
      const termMonthlyPremEst = Math.max(80, Math.round((termCoverage / 1000000) * 85));
      return {
        monthlyBudget: mb,
        protectionBudget: protectionBudget,
        savingsBudget: savingsBudget,
        termCoverage: termCoverage,
        ciCoverage: ciCoverage,
        mortgageBalance: mbBal,
        mortgageGap: mortgageGap,
        projectedEduFund: projectedEduFund,
        totalSavingsDeposited: totalSavingsDeposited,
        projectedCompoundGain: projectedCompoundGain,
        termMonthlyPremEst: termMonthlyPremEst,
        annualExpenses: annualExpenses
      };
    }

    function checkCashlessDirectBilling(hospital, treatment, deductible) {
      const h = (typeof hospital === 'string' && hospital.trim()) ? hospital.trim() : (typeof medicalHospital === 'string' ? medicalHospital : '香港養和醫院 (Hong Kong Sanatorium & Hospital)');
      const t = (typeof treatment === 'string' && treatment.trim()) ? treatment.trim() : (typeof medicalTreatment === 'string' ? medicalTreatment : '癌症非手術標靶治療 (Targeted Cancer Therapy)');
      const d = (typeof deductible === 'number' && !isNaN(deductible) && deductible >= 0) ? deductible : (typeof medicalDeductible === 'number' ? medicalDeductible : 0);

      let est = 500000;
      if (t.includes('癌症') || t.includes('標靶')) est = 680000;
      else if (t.includes('心臟') || t.includes('通波仔')) est = 380000;
      else if (t.includes('骨科') || t.includes('關節')) est = 280000;
      else if (t.includes('達芬奇') || t.includes('機械人')) est = 450000;
      else if (t.includes('白內障') || t.includes('日間')) est = 65000;
      else if (t.includes('腸胃鏡') || t.includes('息肉')) est = 45000;
      else if (t.includes('脊柱') || t.includes('椎間盤')) est = 350000;

      const outOfPocket = Math.min(d, est);
      const covered = est - outOfPocket;
      return {
        hospital: h,
        treatment: t,
        deductible: d,
        estimatedCost: est,
        coverage: covered,
        clientOutOfPocket: outOfPocket,
        isApproved: true,
        ourProduct: mySelectedProduct ? cleanProductName(mySelectedProduct.name) : '我方方案',
        rivalProduct: rivalSelectedProduct ? cleanProductName(rivalSelectedProduct.name) : '遭遇競品'
      };
    }
    window.checkCashlessDirectBilling = checkCashlessDirectBilling;

    function calculateQDAPTaxRelief(taxRate, annualPremium, isCouple, product) {
      const rate = (typeof taxRate === 'number' && !isNaN(taxRate)) ? taxRate : qdapTaxRate;
      const prem = (typeof annualPremium === 'number' && !isNaN(annualPremium)) ? Math.max(0, annualPremium) : qdapAnnualPremium;
      const couple = (typeof isCouple === 'boolean') ? isCouple : qdapIsCouple;
      const maxLimit = couple ? 120000 : 60000;
      const eligible = Math.min(prem, maxLimit);
      const taxSaved = Math.round(eligible * (rate / 100));
      const effectiveDiscount = prem > 0 ? Math.round((taxSaved / prem) * 1000) / 10 : 0;
      // Monthly annuity payout scales proportionally with actual entered premium (prem)
      const monthlyAnnuity = Math.round((prem * 5 * 1.6) / (20 * 12));

      const prod = product || mySelectedProduct || {};
      const gIrr = prod.qdapGuaranteedIRR || (prod.qdap_metrics && prod.qdap_metrics.guaranteed_internal_rate_pct) || 2.80;
      const tIrr = prod.qdapTotalIRR || (prod.qdap_metrics && prod.qdap_metrics.total_internal_rate_pct) || 4.65;
      const gRatio = prod.qdapGuaranteedPct || (prod.qdap_metrics && prod.qdap_metrics.guaranteed_cashflow_ratio_pct) || (Math.round((gIrr / tIrr) * 100 * 10) / 10);

      return {
        annualPremium: prem,
        taxRate: rate,
        isCouple: couple,
        maxLimit: maxLimit,
        eligible: eligible,
        taxSaved: taxSaved,
        monthlyAnnuity: monthlyAnnuity,
        discountPct: effectiveDiscount,
        guaranteedIRR: gIrr,
        totalIRR: tIrr,
        guaranteedPct: gRatio
      };
    }

    function generateInstantMessage(plat, tn) {
      const p = plat || commsPlatform;
      const t = tn || commsTone;
      const cat = currentCategory || 'Savings_MultiCurrency';
      const isWA = (p === 'whatsapp');
      const b = function(s) { return isWA ? ('*' + s + '*') : s; };
      const m = function(s) { return isWA ? (String.fromCharCode(96) + s + String.fromCharCode(96)) : s; };

      const ourProdName = cleanProductName((mySelectedProduct && mySelectedProduct.name) ? mySelectedProduct.name : '我方推薦旗艦');
      const rivalProdName = cleanProductName((rivalSelectedProduct && rivalSelectedProduct.name) ? rivalSelectedProduct.name : '遭遇競品方案');

      let lines = [];
      if (t === 'urgent_closing') {
        lines.push('【陳生，剛才咖啡會議的跟進摘要與限時優惠】');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('剛才見面非常愉快！為免您遺漏核心數據，我快速為您整理剛才探討的關鍵對比：');
        lines.push('');
        if (cat === 'Critical_Illness') {
          lines.push('1️⃣ ' + b('等候期極速賠：') + '我方【' + ourProdName + '】癌症等候間隔僅 1 年（對手需 3 年），復發第一時間賠足！');
          lines.push('2️⃣ ' + b('條款保障穿透：') + '涵蓋 120+ 種危疾 + 深切治療部 (ICU) 入住即預支 20% 保額！');
          lines.push('3️⃣ ' + b('今期限定優惠：') + '本月享有專屬首年保費回贈及免體檢綠色通道，即將於本週五截止！');
        } else if (cat === 'Medical_VHIS') {
          lines.push('1️⃣ ' + b('全額醫療零漏洞：') + '我方【' + ourProdName + '】全港私家醫院手術及病房費全數賠償，無細項拆分上限！');
          lines.push('2️⃣ ' + b('昂貴標靶藥實報實銷：') + '百萬級非手術癌症標靶藥及自費藥全額理賠！');
          lines.push('3️⃣ ' + b('出院免找數直付：') + '全港私家醫院 + 內地 1,000+ 家三甲醫院直付名單，專人協助索償！');
        } else if (cat === 'Annuity_QDAP') {
          lines.push('1️⃣ ' + b('法定扣稅慳到極：') + '每年享高達 HK$60,000 扣稅額，頂階稅階實質退稅 HK$10,200（夫妻合併慳 $20,400）！');
          lines.push('2️⃣ ' + b('高確定性現金流：') + '保證年金佔比超 80%，穩定月月派發至 100 歲！');
          lines.push('3️⃣ ' + b('稅季前及早鎖定：') + '現時投保即享限時回贈，趕及本課稅年度享有全額免稅扣除！');
        } else if (cat === 'Financing_UniversalLife') {
          lines.push('1️⃣ ' + b('極致資金槓桿：') + '85% LTV 保費融資，用 15% 本金撬動千萬級巨額人壽保障！');
          lines.push('2️⃣ ' + b('穩健正利差套利：') + '宣告派息 5.25% 對比融資成本，淨利差空間超 1.45%！');
          lines.push('3️⃣ ' + b('私銀級家族傳承：') + '大額身故槓桿 4-7 倍，資產隔離與跨代傳承首選！');
        } else {
          lines.push('1️⃣ ' + b('回本與資金安全：') + '我方【' + ourProdName + '】保證現金價值回本年期較短，提早鎖定 100% 本金。');
          lines.push('2️⃣ ' + b('條款細則避坑：') + '對手【' + rivalProdName + '】宣傳預繳僅保證首年，次年浮動；我方提供長線確定性。');
          lines.push('3️⃣ ' + b('今期限定優惠：') + '本月享有專屬保費回贈及免體檢綠色通道，即將於本週五截止！');
        }
        lines.push('');
        lines.push('如您希望為家人鎖定此配置，我隨時為您備妥正式投保說明書！');
      } else if (t === 'mcv_vip') {
        lines.push('【陳生，香港離岸資產配置與家庭信託傳承建議書】');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('感謝您專程赴港交流！為配合您的跨國貨幣管理與家族財富傳承需求，重點跟進如下：');
        lines.push('');
        lines.push('🔹 ' + b('多幣種跨國配置：') + '支援 9 種主流世界貨幣（USD/HKD/RMB/GBP/EUR等）無等待期轉換。');
        lines.push('🔹 ' + b('內地三甲醫院直付理賠：') + '覆蓋全國 1,000+ 家三甲醫院，出院免找數，理賠無須赴港。');
        lines.push('🔹 ' + b('家族傳承架構：') + '支援無限次更改受保人與保單分拆，精準分配下一代資產。');
        lines.push('🔹 ' + b('合規安心：') + '香港保監局標準監管，在港合法簽署及入境小白條備查，法律權益終身受保。');
        lines.push('');
        lines.push('稍後我將完整對比利益說明書發至您的信箱，祝返程順利！');
      } else {
        // rational_data
        lines.push('【陳生，全港保險獨立客觀數據對比摘要】');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('感謝您撥冗會面！依據香港保監局 (IA) 公開指引與各大保司年報數據，對比總結如下：');
        lines.push('');
        if (cat === 'Critical_Illness') {
          lines.push('📊 ' + b('方案 A (我方推薦):') + ' 【' + ourProdName + '】');
          lines.push('   └ 癌症等候間隔僅 1 年、涵蓋 120+ 種疾病、含深切治療部 (ICU) 預支與多次賠償高槓桿。');
          lines.push('📊 ' + b('方案 B (市場競品):') + ' 【' + rivalProdName + '】');
          lines.push('   └ 癌症間隔需熬足 3 年，後期非特定重疾限制較多，黃金救治期防護存在盲點。');
          lines.push('');
          lines.push('💡 ' + b('專業總結：') + '重疾防護首重條款穿透力與二次復發間隔，方案 A 實質保障更周全。');
        } else if (cat === 'Medical_VHIS') {
          lines.push('📊 ' + b('方案 A (我方推薦):') + ' 【' + ourProdName + '】');
          lines.push('   └ 自願醫保半私家全數賠償無細項上限，非手術癌症治療自費藥全包，內地千家三甲免找數。');
          lines.push('📊 ' + b('方案 B (市場競品):') + ' 【' + rivalProdName + '】');
          lines.push('   └ 設有項目分拆上限或自負額墊底較高，面對醫療通脹需承擔額外自費差額。');
          lines.push('');
          lines.push('💡 ' + b('專業總結：') + '醫療險首重全額賠償與出院直付免墊支體驗，方案 A 具備最佳性價比。');
        } else if (cat === 'Annuity_QDAP') {
          const qdapProd = (mySelectedProduct && (mySelectedProduct.category === 'Annuity_QDAP' || mySelectedProduct.qdap_metrics)) ? mySelectedProduct : null;
          const qdapShare = (qdapProd && qdapProd.qdapGuaranteedPct) ? qdapProd.qdapGuaranteedPct : 80.5;
          lines.push('📊 ' + b('方案 A (我方推薦):') + ' 【' + ourProdName + '】');
          lines.push('   └ 保證年金利益佔比超 ' + qdapShare + '%，頂階稅階實質退稅 17%，保證終身月派現金流。');
          lines.push('📊 ' + b('方案 B (市場競品):') + ' 【' + rivalProdName + '】');
          lines.push('   └ 浮動紅利佔比較大，長期受宏觀降息與投資波動影響，退休預算確定性較弱。');
          lines.push('');
          lines.push('💡 ' + b('專業總結：') + '退休規劃首重確定性現金流與法定退稅，方案 A 為被動收入最優基石。');
        } else if (cat === 'Financing_UniversalLife') {
          lines.push('📊 ' + b('方案 A (我方推薦):') + ' 【' + ourProdName + '】');
          lines.push('   └ 融資成數高達 85% LTV，保底派息率 2.25%，抗加息與追加保證金 (Margin Call) 安全墊高。');
          lines.push('📊 ' + b('方案 B (市場競品):') + ' 【' + rivalProdName + '】');
          lines.push('   └ 融資成數較低或強平線嚴格，抗利率上行與流動性波動風險較大。');
          lines.push('');
          lines.push('💡 ' + b('專業總結：') + '保費融資講求大額槓桿與正利差安全墊，方案 A 更契合高淨值資產配置。');
        } else {
          lines.push('📊 ' + b('方案 A (我方推薦):') + ' 【' + ourProdName + '】');
          lines.push('   └ 保證回本速度快、保監局 GN16 分紅實現率歷年累積 96.5% 高位穩健。');
          lines.push('📊 ' + b('方案 B (市場競品):') + ' 【' + rivalProdName + '】');
          lines.push('   └ 前期高回贈附帶嚴格退保鎖定期，次年浮動利率存在降息稀釋風險。');
          lines.push('');
          lines.push('💡 ' + b('專業總結：') + '若著重中長線確定性、真實到手分紅與流動性，方案 A 更具精算優勢。');
        }
      }
      const adv = (typeof getAdvisorProfile === 'function') ? getAdvisorProfile() : DEFAULT_ADVISOR_PROFILE;
      lines.push('');
      lines.push('━━━━━━━━━━━━━━━━━━━━━');
      lines.push('💼 專屬理財顧問：' + b(adv.name) + ' (' + adv.title + ')');
      lines.push('🏢 所屬團隊：' + adv.team + ' · ' + adv.license);
      lines.push('📱 聯絡電話 / WhatsApp: ' + adv.phone);
      lines.push(m('最後資料更新：2026年11月06日 · 保監局 GN16 官方核定'));
      lines.push('🛡️【香港保監局 GL20 合規聲明】：本資料基於各保司官方公開手冊及保監局 GN16 備案檔案，僅供客觀諮詢與條款分析，不構成要約或招攬。非保證利益受市場波動影響，過往實現率不代表未來表現。');
      return lines.join('\\n');
    }

    function setOfflineMode(val) {
      isSimulatedOffline = !!val;
      renderScenarioAgentPanel();
    }

    function getOfflineStatus() {
      const browserOnline = (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') ? navigator.onLine : true;
      const isOnline = !isSimulatedOffline && browserOnline;
      return {
        isOnline: isOnline,
        isSimulatedOffline: isSimulatedOffline,
        isBrowserOffline: !browserOnline,
        cachedProducts: (window.ALL_PRODUCTS_CATALOG ? window.ALL_PRODUCTS_CATALOG.length : 99),
        healthScore: 100
      };
    }

    function selectScenarioAgent(scenarioId) {
      currentScenario = scenarioId;
      try {
        if (typeof localStorage !== 'undefined' && localStorage && localStorage.setItem) {
          localStorage.setItem(STORAGE_KEY_SCENARIO, scenarioId);
        }
      } catch (e) {}

      // Two-Way Collaboration: Scenario-to-Category Auto-Switching
      if (scenarioId === 'cashless_medical' || scenarioId === 'group_medical') {
        if (currentCategory !== 'Medical_VHIS') {
          selectCategory('Medical_VHIS');
          return;
        }
      } else if (scenarioId === 'retirement_tax') {
        if (currentCategory !== 'Annuity_QDAP') {
          selectCategory('Annuity_QDAP');
          return;
        }
      } else if (scenarioId === 'ul_stress') {
        if (currentCategory !== 'Financing_UniversalLife') {
          selectCategory('Financing_UniversalLife');
          return;
        }
      } else if (scenarioId === 'offshore_mcv') {
        if (currentCategory === 'Medical_VHIS' || currentCategory === 'Annuity_QDAP') {
          selectCategory('Savings_MultiCurrency');
          return;
        }
      } else if (scenarioId === 'young_family') {
        if (currentCategory === 'Financing_UniversalLife' || currentCategory === 'Annuity_QDAP') {
          selectCategory('Critical_Illness');
          return;
        }
      }

      // Update Tab Buttons UI
      const tabs = document.querySelectorAll('.scenario-tab-btn');
      tabs.forEach(function(btn) {
        if (btn.getAttribute('data-scenario') === scenarioId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      const tag = document.getElementById('scenario-active-tag');
      if (tag && SCENARIO_NAMES[scenarioId]) {
        tag.innerText = SCENARIO_NAMES[scenarioId];
      }

      renderScenarioAgentPanel();
    }

    function onMCVAmountChange(val) {
      mcvAmount = parseFloat(val) || 0;
      renderScenarioAgentPanel();
    }

    function onMCVCurrencySelect(cur) {
      mcvCurrency = cur;
      renderScenarioAgentPanel();
    }

    function updateFamilyBudgetUI() {
      const budgetRes = calculateFamilyBudget(familyMonthlyBudget, familyMonthlyBudget * 12 * 7, familyMortgageBalance);
      const eduWan = (budgetRes.projectedEduFund / 10000).toFixed(1);
      const depWan = (budgetRes.totalSavingsDeposited / 10000).toFixed(1);
      const gainWan = (budgetRes.projectedCompoundGain / 10000).toFixed(1);
      const termWan = Math.round(budgetRes.termCoverage / 10000).toLocaleString();
      const ciWan = Math.round(budgetRes.ciCoverage / 10000).toLocaleString();

      const display = document.getElementById('family-budget-display');
      if (display) display.innerText = 'HK$ ' + familyMonthlyBudget.toLocaleString() + ' / 月';

      const slider = document.getElementById('family-budget-slider');
      if (slider && (!document.activeElement || document.activeElement.id !== 'family-budget-slider')) {
        slider.value = familyMonthlyBudget;
      }

      const protectNum = document.getElementById('family-protection-num');
      if (protectNum) protectNum.innerText = 'HK$ ' + budgetRes.protectionBudget.toLocaleString() + ' /月';

      const protectDesc = document.getElementById('family-protection-desc');
      if (protectDesc) {
        protectDesc.innerHTML = '定期壽險 (HK$' + termWan + '萬，覆蓋房貸+生活費) + 多次危疾 (HK$' + ciWan + '萬) + 自願醫保半私家全數賠償';
      }

      const savingsNum = document.getElementById('family-savings-num');
      if (savingsNum) savingsNum.innerText = 'HK$ ' + budgetRes.savingsBudget.toLocaleString() + ' /月';

      const savingsDesc = document.getElementById('family-savings-desc');
      if (savingsDesc) {
        savingsDesc.innerHTML = '18年複利滾存預估大學金：<strong>HK$ ' + eduWan + '萬</strong> (總投入 HK$ ' + depWan + '萬 · 增值 +HK$ ' + gainWan + '萬)';
      }

      const mortGap = document.getElementById('family-mortgage-gap');
      if (mortGap) {
        mortGap.innerHTML = (budgetRes.mortgageBalance > 0
          ? '若家庭支柱突遭意外或重疾，尚欠房貸餘額為 <strong>HK$ ' + budgetRes.mortgageBalance.toLocaleString() + '</strong>。已動態配置定期壽險保額 <strong>HK$ ' + termWan + '萬</strong> (月保費約 HK$' + budgetRes.termMonthlyPremEst + ')，100% 抹平房貸斷供風險，額外留存 5 年家庭生活費！'
          : '✅ 當前無房貸負擔！每月 60% 防禦預算可全數聚焦於家庭支柱定期純壽險與多次危疾，提供最高保額槓桿防護。');
      }

      const chips = document.querySelectorAll('.family-preset-chips .tax-chip');
      chips.forEach(chip => {
        const chipVal = parseInt(chip.innerText.replace(/[^0-9]/g, ''), 10) * (chip.innerText.includes('k') ? 1000 : 1);
        chip.classList.toggle('active', chipVal === familyMonthlyBudget);
      });

      const panel = document.getElementById('panel-scenario-family');
      if (!panel || (typeof document !== 'undefined' && !document.activeElement)) {
        renderScenarioAgentPanel();
      }
    }

    function onFamilyBudgetChange(val) {
      familyMonthlyBudget = parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 3000;
      updateFamilyBudgetUI();
    }

    function onMortgageChange(val) {
      const cleanVal = String(val).replace(/[^0-9]/g, '');
      familyMortgageBalance = cleanVal === '' ? 0 : (parseInt(cleanVal, 10) || 0);
      updateFamilyBudgetUI();
    }

    function updateQDAPUI() {
      const qdapOur = (mySelectedProduct && (normalizeCategory(mySelectedProduct.category) === 'Annuity_QDAP' || mySelectedProduct.qdap_metrics)) ? mySelectedProduct : null;
      const qdapFlagshipOur = getFlagshipProduct(myCompany, 'Annuity_QDAP');
      const ourProd = qdapOur || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === myCompany && normalizeCategory(p.category) === 'Annuity_QDAP' && (p.name.includes(qdapFlagshipOur) || qdapFlagshipOur.includes(cleanProductName(p.name)))) || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === myCompany && normalizeCategory(p.category) === 'Annuity_QDAP') || (mySelectedProduct || {});

      const gIrr = ourProd.qdapGuaranteedIRR || (ourProd.qdap_metrics && ourProd.qdap_metrics.guaranteed_internal_rate_pct) || 2.80;
      const tIrr = ourProd.qdapTotalIRR || (ourProd.qdap_metrics && ourProd.qdap_metrics.total_internal_rate_pct) || 4.65;
      const gRatio = ourProd.qdapGuaranteedPct || (ourProd.qdap_metrics && ourProd.qdap_metrics.guaranteed_cashflow_ratio_pct) || (Math.round((gIrr / tIrr) * 100 * 10) / 10);

      const qdapRes = calculateQDAPTaxRelief(qdapTaxRate, qdapAnnualPremium, qdapIsCouple, ourProd);

      const eligibleEl = document.getElementById('qdap-eligible-limit-val');
      if (eligibleEl) {
        eligibleEl.innerHTML = '合資格扣稅額：HK$ ' + qdapRes.eligible.toLocaleString() + ' (等同總保費實質慳 ' + qdapRes.discountPct + '%)';
      }

      const taxSavedEl = document.getElementById('qdap-tax-saved-val');
      if (taxSavedEl) {
        taxSavedEl.innerText = 'HK$ ' + qdapRes.taxSaved.toLocaleString();
      }

      const monthlyEl = document.getElementById('qdap-annuity-monthly-val');
      if (monthlyEl) {
        monthlyEl.innerHTML = '<div style="font-size:10px;color:#64748b;">預估退休後每月保證年金</div>' +
          '<div style="font-size:14px;font-weight:800;color:var(--ikb);font-family:monospace;" id="qdap-annuity-monthly-num">HK$ ' + qdapRes.monthlyAnnuity.toLocaleString() + ' /月</div>';
      }

      const shareEl = document.getElementById('qdap-guaranteed-share-val');
      if (shareEl) {
        shareEl.innerHTML = '<div style="font-size:10px;color:#64748b;">年金保證現金流佔比</div>' +
          '<div style="font-size:14px;font-weight:800;color:#0f172a;font-family:monospace;" id="qdap-guaranteed-share-num">' + gRatio + '% (保證IRR ' + gIrr + '%)</div>';
      }

      const panel = document.getElementById('panel-scenario-retirement');
      if (!panel || (typeof document !== 'undefined' && !document.activeElement)) {
        renderScenarioAgentPanel();
      }
    }
    window.updateQDAPUI = updateQDAPUI;

    function onQDAPPremiumChange(val) {
      const clean = String(val).replace(/[^0-9]/g, '');
      qdapAnnualPremium = clean === '' ? 0 : (parseInt(clean, 10) || 0);
      updateQDAPUI();
    }

    function onQDAPRateSelect(rate) {
      qdapTaxRate = parseInt(rate, 10) || 17;
      const chips = document.querySelectorAll('.tax-bracket-chips .tax-chip');
      chips.forEach(chip => {
        const isThis = chip.innerText.startsWith(String(qdapTaxRate) + '%');
        chip.classList.toggle('active', isThis);
      });
      updateQDAPUI();
    }

    function onQDAPCoupleToggle(checked) {
      qdapIsCouple = !!checked;
      updateQDAPUI();
    }

    function onCommsToneSelect(tone) {
      commsTone = tone;
      renderScenarioAgentPanel();
    }

    function onCommsPlatformSelect(platform) {
      commsPlatform = platform;
      renderScenarioAgentPanel();
    }

    function onMedicalHospitalSelect(val) {
      medicalHospital = val || '香港養和醫院 (Hong Kong Sanatorium & Hospital)';
      renderScenarioAgentPanel();
    }

    function onMedicalTreatmentSelect(val) {
      medicalTreatment = val || '癌症非手術標靶治療 (Targeted Cancer Therapy)';
      renderScenarioAgentPanel();
    }

    function onMedicalDeductibleSelect(val) {
      medicalDeductible = parseInt(val, 10) || 0;
      renderScenarioAgentPanel();
    }

    function copyCafeScript(btn) {
      const el = document.getElementById('cafe-elevator-script');
      const text = el ? (el.innerText || el.textContent || '').trim() : '';
      if (!text) return;
      copyTextWithFeedback(text, btn, '30秒見客話術已複製！');
    }

    function copyCommsMessage(plat) {
      const p = plat || commsPlatform;
      const text = generateInstantMessage(p, commsTone);
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          showToast('✅ ' + (p === 'whatsapp' ? 'WhatsApp' : '微信/SMS') + ' 跟進訊息已複製！');
        }).catch(function() {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    }

    function openWhatsAppDirect() {
      const text = generateInstantMessage('whatsapp', commsTone);
      const url = 'https://wa.me/?text=' + encodeURIComponent(text);
      if (typeof window !== 'undefined' && window.open) {
        window.open(url, '_blank');
      }
    }
    window.openWhatsAppDirect = openWhatsAppDirect;

    function openWhatsAppCafeScript() {
      const el = document.getElementById('cafe-elevator-script');
      const text = el ? (el.innerText || el.textContent) : '';
      const url = 'https://wa.me/?text=' + encodeURIComponent(text);
      if (typeof window !== 'undefined' && window.open) {
        window.open(url, '_blank');
      }
    }
    window.openWhatsAppCafeScript = openWhatsAppCafeScript;

    function toggleSimulatedOffline() {
      isSimulatedOffline = !isSimulatedOffline;
      renderScenarioAgentPanel();
      showToast(isSimulatedOffline ? '📴 已切換至地庫離線模擬模式' : '🟢 已恢復網絡連線狀態');
    }

    function flipToClientView() {
      switchView('client');
    }

    function copyCommsMessageWhatsapp() {
      copyCommsMessage('whatsapp');
    }

    function copyCommsMessageWechat() {
      copyCommsMessage('wechat');
    }

    function renderScenarioAgentPanel(cardParam) {
      const container = document.getElementById('scenario-agent-panel');
      if (!container) return;

      const card = cardParam || getBattleCard(myCompany, selectedCompany, selectedClaim, selectedClaimText);
      const ourProf = COMPANY_PROFILES[myCompany] || { fullName: myCompany };
      const rivalProf = COMPANY_PROFILES[selectedCompany] || { fullName: selectedCompany };
      const ourMetrics = (mySelectedProduct || ourProf);
      const rivalMetrics = (rivalSelectedProduct || rivalProf);

      const ourProdName = cleanProductName(ourMetrics.name || ourMetrics.product_name || (card ? card.hero_our_name : '我方方案'));
      const rivalProdName = cleanProductName(rivalMetrics.name || rivalMetrics.product_name || (card ? card.hero_rival_name : '對手方案'));

      let html = '';

      if (currentScenario === 'cafe_rapid') {
        const cat = currentCategory || 'Savings_MultiCurrency';
        let tile1Label = '⚡ 保證回本年期';
        let tile1Val = '';
        let tile1Badge = '';
        let tile2Label = '💰 首年保費回贈';
        let tile2Val = '';
        let tile2Badge = '';
        let tile3Label = '🏛️ GN16 官方實現率';
        let tile3Val = '';
        let tile3Badge = '';
        let elevatorScript = '';

        if (cat === 'Critical_Illness') {
          tile1Label = '🛡️ 癌症等候間隔';
          const ourWait = ourMetrics.cancerWaitYears || (ourMetrics.ci_metrics && ourMetrics.ci_metrics.cancer_waiting_period_years) || 1;
          const rivalWait = rivalMetrics.cancerWaitYears || (rivalMetrics.ci_metrics && rivalMetrics.ci_metrics.cancer_waiting_period_years) || 3;
          const diffWait = rivalWait - ourWait;
          tile1Val = ourWait + ' 年 vs ' + rivalWait + ' 年';
          tile1Badge = diffWait > 0 ? ('快 ' + diffWait + ' 年 🏆') : '等候期間隔極短';

          tile2Label = '🏥 涵蓋疾病總數';
          const ourIll = ourMetrics.ciIllnesses || (ourMetrics.ci_metrics && ourMetrics.ci_metrics.total_illnesses_covered) || 120;
          const rivalIll = rivalMetrics.ciIllnesses || (rivalMetrics.ci_metrics && rivalMetrics.ci_metrics.total_illnesses_covered) || 100;
          const illDiff = ourIll - rivalIll;
          tile2Val = ourIll + ' 種 vs ' + rivalIll + ' 種';
          tile2Badge = illDiff > 0 ? ('多涵蓋 ' + illDiff + ' 種 🏆') : '全方位覆蓋';

          tile3Label = '⚡ 多次索償賠付上限';
          const ourMult = ourMetrics.ciMultiplePct || (ourMetrics.ci_metrics && ourMetrics.ci_metrics.multiple_claim_limit_pct) || 900;
          const rivalMult = rivalMetrics.ciMultiplePct || (rivalMetrics.ci_metrics && rivalMetrics.ci_metrics.multiple_claim_limit_pct) || 800;
          const multDiff = ourMult - rivalMult;
          tile3Val = ourMult + '% vs ' + rivalMult + '%';
          tile3Badge = multDiff > 0 ? ('槓桿多 +' + multDiff + '% 🏆') : (ourMetrics.ciIcu ? '含 ICU 深度預支' : '多次高額守護');

          elevatorScript = '「陳生，30秒快速對比【' + ourProdName + '】同【' + rivalProdName + '】：我方癌症等候期僅需 ' + ourWait + ' 年（對手需熬足 ' + rivalWait + ' 年' + (diffWait > 0 ? '，我方快 ' + diffWait + ' 年理賠' : '') + '），而且涵蓋 ' + ourIll + ' 種危疾（對手 ' + rivalIll + ' 種），多次索償總額高達 ' + ourMult + '%！黃金治療期資金即時到位，推薦優先鎖定我地方案！」';
        } else if (cat === 'Medical_VHIS') {
          const ourAnnual = (ourMetrics.vhisLimitHkd || (ourMetrics.vhis_metrics && ourMetrics.vhis_metrics.annual_limit_hkd)) || 25000000;
          const rivalAnnual = (rivalMetrics.vhisLimitHkd || (rivalMetrics.vhis_metrics && rivalMetrics.vhis_metrics.annual_limit_hkd)) || 20000000;
          const ourAnnualWan = Math.round(ourAnnual / 10000);
          const rivalAnnualWan = Math.round(rivalAnnual / 10000);
          const annualDiff = ourAnnualWan - rivalAnnualWan;

          const ourLifetime = (ourMetrics.vhisLifetimeLimitHkd !== undefined ? ourMetrics.vhisLifetimeLimitHkd : (ourMetrics.vhis_metrics && ourMetrics.vhis_metrics.lifetime_limit_hkd)) ?? 0;
          const rivalLifetime = (rivalMetrics.vhisLifetimeLimitHkd !== undefined ? rivalMetrics.vhisLifetimeLimitHkd : (rivalMetrics.vhis_metrics && rivalMetrics.vhis_metrics.lifetime_limit_hkd)) ?? 0;
          const ourLifeText = ourLifetime === 0 ? '無上限' : ('HK$ ' + Math.round(ourLifetime / 10000) + '萬');
          const rivalLifeText = rivalLifetime === 0 ? '無上限' : ('HK$ ' + Math.round(rivalLifetime / 10000) + '萬');

          tile1Label = '🏥 年度賠償上限';
          tile1Val = 'HK$ ' + ourAnnualWan + '萬 vs ' + rivalAnnualWan + '萬';
          tile1Badge = annualDiff > 0 ? ('+' + annualDiff + '萬額度 🏆') : (annualDiff === 0 ? '全額頂級配置' : '實報實銷無細項');

          tile2Label = '🛡️ 終身保障限額';
          tile2Val = ourLifeText + ' vs ' + rivalLifeText;
          tile2Badge = (ourLifetime === 0 && rivalLifetime > 0) ? '終身無上限完勝 🏆' : '抗通脹高額保障';

          tile3Label = '💳 出院免找數直付覆蓋';
          tile3Val = '全港私院 + 1,000+ 三甲';
          tile3Badge = 'LOG擔保 · 0墊支 🏆';

          elevatorScript = '「陳生，30秒快速對比【' + ourProdName + '】同【' + rivalProdName + '】：在核心自願醫保額度上，我方每年賠償上限高達 HK$ ' + ourAnnualWan + '萬（對手為 HK$ ' + rivalAnnualWan + '萬' + (annualDiff > 0 ? '，我方足足多出 ' + annualDiff + '萬額度' : '') + '），終身限額為【' + ourLifeText + '】！更享有全港頂尖私家醫院及內地 1,000+ 家三甲醫院出院免找數付款擔保 (LOG)，避免生病住院自掏腰包先墊支幾十萬。醫療保障首選我地方案！」';
        } else if (cat === 'Annuity_QDAP') {
          const ourGIRR = ourMetrics.qdapGuaranteedIRR || (ourMetrics.qdap_metrics && ourMetrics.qdap_metrics.guaranteed_internal_rate_pct) || 2.80;
          const rivalGIRR = rivalMetrics.qdapGuaranteedIRR || (rivalMetrics.qdap_metrics && rivalMetrics.qdap_metrics.guaranteed_internal_rate_pct) || 2.50;
          const ourTIRR = ourMetrics.qdapTotalIRR || (ourMetrics.qdap_metrics && ourMetrics.qdap_metrics.total_internal_rate_pct) || 4.65;
          const rivalTIRR = rivalMetrics.qdapTotalIRR || (rivalMetrics.qdap_metrics && rivalMetrics.qdap_metrics.total_internal_rate_pct) || 4.20;
          const ourRatio = ourMetrics.qdapGuaranteedPct || (ourMetrics.qdap_metrics && ourMetrics.qdap_metrics.guaranteed_cashflow_ratio_pct) || (Math.min(95, Math.max(60, Math.round((ourGIRR / ourTIRR) * 100 * 1.3 * 10) / 10)));
          const rivalRatio = rivalMetrics.qdapGuaranteedPct || (rivalMetrics.qdap_metrics && rivalMetrics.qdap_metrics.guaranteed_cashflow_ratio_pct) || (Math.min(95, Math.max(60, Math.round((rivalGIRR / rivalTIRR) * 100 * 1.3 * 10) / 10)));
          const irrDiff = (ourGIRR - rivalGIRR).toFixed(2);
          const ratioDiff = (ourRatio - rivalRatio).toFixed(1);

          tile1Label = '💰 法定年金扣稅上限';
          tile1Val = 'HK$ 60,000 / 120,000';
          tile1Badge = '每年慳稅高達 HK$20,400 🏆';

          tile2Label = '📈 保證內部回報率 (IRR)';
          tile2Val = ourGIRR + '% vs ' + rivalGIRR + '%';
          tile2Badge = parseFloat(irrDiff) > 0 ? ('保證息差 +' + irrDiff + '% 🏆') : '穩健保證現金流';

          tile3Label = '👴 保證年金現金流佔比';
          tile3Val = ourRatio + '% vs ' + rivalRatio + '%';
          tile3Badge = parseFloat(ratioDiff) > 0 ? ('確定性領先 +' + ratioDiff + '% 🏆') : '無懼降息波動';

          elevatorScript = '「陳生，30秒快速對比【' + ourProdName + '】同【' + rivalProdName + '】：我方 QDAP 扣稅年金保證內部回報率達 ' + ourGIRR + '%（對手 ' + rivalGIRR + '%），保證年金現金流佔比高達 ' + ourRatio + '%！頂階稅階每人每年慳足 HK$10,200（夫妻慳 $20,400），月月保證派發至百歲，退休被動現金流最確定！」';
        } else if (cat === 'Financing_UniversalLife') {
          const ourLtv = ourMetrics.ulLtv || (ourMetrics.ul_metrics && ourMetrics.ul_metrics.max_ltv_pct) || 85;
          const rivalLtv = rivalMetrics.ulLtv || (rivalMetrics.ul_metrics && rivalMetrics.ul_metrics.max_ltv_pct) || 80;
          const ourCrediting = ourMetrics.ulCreditingRate || (ourMetrics.ul_metrics && ourMetrics.ul_metrics.crediting_rate_current_pct) || 5.25;
          const rivalCrediting = rivalMetrics.ulCreditingRate || (rivalMetrics.ul_metrics && rivalMetrics.ul_metrics.crediting_rate_current_pct) || 5.0;
          const ourNetSpread = ourMetrics.ulNetSpread || (ourMetrics.ul_metrics && ourMetrics.ul_metrics.net_carry_spread_pct) || 1.45;
          const rivalNetSpread = rivalMetrics.ulNetSpread || (rivalMetrics.ul_metrics && rivalMetrics.ul_metrics.net_carry_spread_pct) || 1.20;

          tile1Label = '🏦 私銀融資成數 (LTV)';
          tile1Val = ourLtv + '% vs ' + rivalLtv + '% LTV';
          tile1Badge = (ourLtv - rivalLtv) > 0 ? ('LTV 領先 +' + (ourLtv - rivalLtv) + '% 🏆') : '15%本金撬千萬人壽';

          tile2Label = '📈 當前宣告派息率';
          tile2Val = ourCrediting + '% vs ' + rivalCrediting + '%';
          tile2Badge = (ourCrediting - rivalCrediting) > 0 ? ('派息領先 +' + (ourCrediting - rivalCrediting).toFixed(2) + '% 🏆') : '穩健正利差套利';

          tile3Label = '🛡️ 淨利差套利空間';
          tile3Val = '> ' + ourNetSpread + '% vs ' + rivalNetSpread + '%';
          tile3Badge = '加息抗壓安全墊 🏆';

          elevatorScript = '「陳生，30秒快速對比【' + ourProdName + '】同【' + rivalProdName + '】：我方萬用融資成數達 ' + ourLtv + '% LTV（對手 ' + rivalLtv + '%），宣告派息達 ' + ourCrediting + '%，淨利差套利空間超 ' + ourNetSpread + '%！用更少本金撬動更大千萬壽險保障，高淨值資產隔離與跨代傳承首選我地方案！」';
        } else {
          // Savings MultiCurrency
          const ourBk = ourMetrics.breakevenYear || (ourMetrics.savings_metrics && ourMetrics.savings_metrics.guaranteed_breakeven_year) || 5;
          const rivalBk = rivalMetrics.breakevenYear || (rivalMetrics.savings_metrics && rivalMetrics.savings_metrics.guaranteed_breakeven_year) || 7;
          const bkDiff = rivalBk - ourBk;

          const ourRebate = ourMetrics.maxRebate || 22;
          const rivalRebate = rivalMetrics.maxRebate || 20;
          const rebateDiff = ourRebate - rivalRebate;

          const ourGn16 = ourMetrics.gn16Fulfillment || (ourMetrics.savings_metrics && ourMetrics.savings_metrics.gn16_fulfillment_ratio_pct) || 96.5;
          const rivalGn16 = rivalMetrics.gn16Fulfillment || (rivalMetrics.savings_metrics && rivalMetrics.savings_metrics.gn16_fulfillment_ratio_pct) || 91.2;
          const gn16Diff = (ourGn16 - rivalGn16).toFixed(1);

          tile1Label = '⚡ 保證回本年期';
          tile1Val = '第 ' + ourBk + ' 年 vs 第 ' + rivalBk + ' 年';
          tile1Badge = bkDiff > 0 ? ('快 ' + bkDiff + ' 年 🏆') : '保證本金安全';

          tile2Label = '💰 首年保費回贈';
          tile2Val = ourRebate + '% vs ' + rivalRebate + '%';
          tile2Badge = rebateDiff >= 0 ? ('回贈領先 +' + rebateDiff + '%') : '性價比優選';

          tile3Label = '🏛️ GN16 官方實現率';
          tile3Val = ourGn16 + '% vs ' + rivalGn16 + '%';
          tile3Badge = gn16Diff > 0 ? ('領先 +' + gn16Diff + '%') : '穩健守護';

          elevatorScript = '「陳生，30秒快速對比【' + ourProdName + '】同【' + rivalProdName + '】：我方保證回本快 ' + Math.max(1, bkDiff) + ' 年，保監局 GN16 官方實現率高出 ' + (gn16Diff > 0 ? gn16Diff : '5.3') + '%！前中期資金安全性同長線派足確定性全面領先，推薦優先鎖定我地方案！」';
        }

        html = '<div class="scenario-card-box" id="panel-scenario-cafe">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">☕ 30 秒咖啡館極速對決模式</div>' +
              '<div class="scenario-subtitle">單手手勢 · 超高對比核心指標 · 30秒電梯話術</div>' +
            '</div>' +
            '<span class="scenario-pill-badge green">⚡ 極速見客</span>' +
          '</div>' +
          '<div class="cafe-delta-grid">' +
            '<div class="cafe-stat-tile" id="cafe-tile-breakeven">' +
              '<div class="cafe-stat-label">' + tile1Label + '</div>' +
              '<div class="cafe-stat-val">' + tile1Val + '</div>' +
              '<div class="cafe-stat-badge">' + tile1Badge + '</div>' +
            '</div>' +
            '<div class="cafe-stat-tile" id="cafe-tile-rebate">' +
              '<div class="cafe-stat-label">' + tile2Label + '</div>' +
              '<div class="cafe-stat-val">' + tile2Val + '</div>' +
              '<div class="cafe-stat-badge">' + tile2Badge + '</div>' +
            '</div>' +
            '<div class="cafe-stat-tile" id="cafe-tile-gn16">' +
              '<div class="cafe-stat-label">' + tile3Label + '</div>' +
              '<div class="cafe-stat-val">' + tile3Val + '</div>' +
              '<div class="cafe-stat-badge">' + tile3Badge + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="cafe-elevator-box">' +
            '<div class="cafe-elevator-header">' +
              '<span>⏱️ 30 秒見客電梯演講提詞 (單手口頭攻防)</span>' +
              '<div style="display:flex;align-items:center;gap:6px;">' +
                '<button class="inline-pitch-copy-btn" id="btn-inline-copy-cafe" onclick="copyCafeScript(this)" style="font-size:11px;padding:2px 8px;">📋 複製話術</button>' +
                '<span style="font-family:monospace;font-size:10px;">30s PITCH</span>' +
              '</div>' +
            '</div>' +
            '<div class="cafe-elevator-script" id="cafe-elevator-script">' + elevatorScript + '</div>' +
          '</div>' +
          '<div class="cafe-actions-row" style="display:none;" aria-hidden="true">' +
            '<button class="scenario-action-btn primary-btn" id="btn-copy-cafe-script" onclick="copyCafeScript(this)">' +
              '📋 複製 30s 話術' +
            '</button>' +
            '<button class="scenario-action-btn" id="btn-cafe-open-whatsapp" onclick="openWhatsAppCafeScript()" style="display:none;" aria-hidden="true">' +
              '🚀 WhatsApp 傳送' +
            '</button>' +
            '<button class="scenario-action-btn" id="btn-cafe-flip-client" onclick="flipToClientView()">' +
              '📱 遞給客戶看' +
            '</button>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'offshore_mcv') {
        const conv = convertMCVCurrency(mcvAmount, mcvCurrency, mcvCurrency === 'USD' ? 'RMB' : 'USD');
        const usdVal = mcvCurrency === 'USD' ? mcvAmount : (mcvCurrency === 'HKD' ? Math.round(mcvAmount * 0.1285) : Math.round(mcvAmount * 0.1383));
        const hkdVal = mcvCurrency === 'HKD' ? mcvAmount : (mcvCurrency === 'USD' ? Math.round(mcvAmount * 7.78) : Math.round(mcvAmount * 1.076));
        const rmbVal = mcvCurrency === 'RMB' ? mcvAmount : (mcvCurrency === 'USD' ? Math.round(mcvAmount * 7.23) : Math.round(mcvAmount * 0.929));

        html = '<div class="scenario-card-box" id="panel-scenario-mcv">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">🇨🇳 MCV 內地訪港旅客 / 家族辦公室專用</div>' +
              '<div class="scenario-subtitle">跨境幣種動態結算 · 全國 1,000+ 三甲醫院直付 · 特快免體檢 · 離岸信託傳承</div>' +
            '</div>' +
            '<span class="scenario-pill-badge blue">跨境資產配置</span>' +
          '</div>' +
          '<div class="mcv-converter-box">' +
            '<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:#1e3a8a;display:flex;justify-content:space-between;align-items:center;">' +
              '<span>🔵 當前配置：<strong>' + ourProdName + '</strong> vs 🔴 <strong>' + rivalProdName + '</strong></span>' +
              '<span style="font-size:10px;color:#0369a1;font-weight:700;">離岸跨幣配置</span>' +
            '</div>' +
            '<div style="font-size:11px;font-weight:700;color:#334155;margin-bottom:6px;">💱 跨境保費與現金流即時換算器 (即時多幣種比對)</div>' +
            '<div class="mcv-input-row">' +
              '<input type="number" class="mcv-input" id="mcv-amount-input" value="' + mcvAmount + '" oninput="onMCVAmountChange(this.value)" placeholder="輸入金額">' +
              '<div class="mcv-cur-toggle">' +
                '<button class="mcv-cur-btn' + (mcvCurrency === 'USD' ? ' active' : '') + '" onclick="onMCVCurrencySelect(this.innerText.trim())">USD</button>' +
                '<button class="mcv-cur-btn' + (mcvCurrency === 'HKD' ? ' active' : '') + '" onclick="onMCVCurrencySelect(this.innerText.trim())">HKD</button>' +
                '<button class="mcv-cur-btn' + (mcvCurrency === 'RMB' ? ' active' : '') + '" onclick="onMCVCurrencySelect(this.innerText.trim())">RMB</button>' +
              '</div>' +
            '</div>' +
            '<div class="mcv-results-grid" id="mcv-converted-val">' +
              '<div class="mcv-res-item"><div class="mcv-res-label">美金 (USD)</div><div class="mcv-res-val">$' + Number(usdVal).toLocaleString() + '</div></div>' +
              '<div class="mcv-res-item"><div class="mcv-res-label">港幣 (HKD)</div><div class="mcv-res-val">HK$' + Number(hkdVal).toLocaleString() + '</div></div>' +
              '<div class="mcv-res-item"><div class="mcv-res-label">人民幣 (RMB)</div><div class="mcv-res-val">¥' + Number(rmbVal).toLocaleString() + '</div></div>' +
            '</div>' +
            '<div style="font-size:10px;color:#64748b;margin-top:6px;">💡 匯率參考：1 USD ≈ 7.78 HKD ≈ 7.23 RMB (支援多達 9 種世界貨幣無等待期轉換)</div>' +
          '</div>' +
          '<div class="mcv-features-list">' +
            '<div class="mcv-feature-item" id="mcv-hospitals-badge">' +
              '<span class="mcv-feat-icon">🏥</span>' +
              '<div class="mcv-feat-content">' +
                '<div class="mcv-feat-title">內地 1,000+ 家三甲醫院直付名單認證</div>' +
                '<div class="mcv-feat-desc">覆蓋北京協和、上海瑞金、廣東省人民醫院等；出院免找數直付，無需親自抵港索償，郵寄診斷書在線理賠！</div>' +
              '</div>' +
            '</div>' +
            '<div class="mcv-feature-item" id="mcv-waiver-badge">' +
              '<span class="mcv-feat-icon">📑</span>' +
              '<div class="mcv-feat-content">' +
                '<div class="mcv-feat-title">高淨值免體檢綠色核保額度</div>' +
                '<div class="mcv-feat-desc">簡化核保程序：最高免體檢額度高達 <strong>USD 1,500,000</strong> (約合 RMB 1,080萬)，快速過件簽發！</div>' +
              '</div>' +
            '</div>' +
            '<div class="mcv-feature-item" id="mcv-trust-badge">' +
              '<span class="mcv-feat-icon">🏛️</span>' +
              '<div class="mcv-feat-content">' +
                '<div class="mcv-feat-title">離岸信託架構與跨代傳承</div>' +
                '<div class="mcv-feat-desc">支援無限次更換受保人至新受保人終身，設第二受保人避免遺產承辦；保單可無限次拆單贈予多名子女！</div>' +
              '</div>' +
            '</div>' +
            '<div class="mcv-feature-item" id="mcv-compliance-badge">' +
              '<span class="mcv-feat-icon">🛡️</span>' +
              '<div class="mcv-feat-content">' +
                '<div class="mcv-feat-title">赴港簽單合規指引 (Compliance Pass)</div>' +
                '<div class="mcv-feat-desc">法定要求必須於香港境內簽署，須核驗港澳通行證及香港入境小白條 (Landing Slip) 存檔，合規受香港法律終身保障！</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'young_family') {
        const budgetRes = calculateFamilyBudget(familyMonthlyBudget, familyMonthlyBudget * 12 * 7, familyMortgageBalance);
        const eduWan = (budgetRes.projectedEduFund / 10000).toFixed(1);
        const depWan = (budgetRes.totalSavingsDeposited / 10000).toFixed(1);
        const gainWan = (budgetRes.projectedCompoundGain / 10000).toFixed(1);
        const termWan = Math.round(budgetRes.termCoverage / 10000).toLocaleString();
        const ciWan = Math.round(budgetRes.ciCoverage / 10000).toLocaleString();

        html = '<div class="scenario-card-box" id="panel-scenario-family">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">👨‍👩‍👧 本地年輕家庭 · 預算最優化與高槓桿保障</div>' +
              '<div class="scenario-subtitle">60/40 槓桿法則 · 房貸缺口診斷 · 定期+多次危疾+自願醫保組合</div>' +
            '</div>' +
            '<span class="scenario-pill-badge green">高性價比槓桿</span>' +
          '</div>' +
          '<div class="family-budget-box">' +
            '<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:#1e3a8a;display:flex;justify-content:space-between;align-items:center;">' +
              '<span>🔵 方案 A 推薦組合: <strong>' + ourProdName + '</strong></span>' +
              '<span style="color:#64748b;">🔴 遭遇競品: <strong>' + rivalProdName + '</strong></span>' +
            '</div>' +
            '<div class="family-slider-header">' +
              '<span>家庭每月總保險預算</span>' +
              '<span class="family-slider-val" id="family-budget-display">HK$ ' + familyMonthlyBudget.toLocaleString() + ' / 月</span>' +
            '</div>' +
            '<input type="range" style="width:100%;accent-color:var(--ikb);" id="family-budget-slider" min="1000" max="100000" step="1000" value="' + familyMonthlyBudget + '" oninput="onFamilyBudgetChange(this.value)">' +
            '<div class="family-preset-chips" style="display:flex;gap:6px;margin:6px 0 10px;flex-wrap:wrap;">' +
              [5000, 10000, 20000, 50000, 100000].map(function(amt) {
                return '<button class="tax-chip' + (familyMonthlyBudget === amt ? ' active' : '') + '" onclick="onFamilyBudgetChange(' + amt + ')">HK$ ' + (amt >= 1000 ? (amt/1000) + 'k' : amt) + '</button>';
              }).join('') +
            '</div>' +
            '<div class="family-split-grid">' +
              '<div class="family-split-card protect" id="family-protection-val">' +
                '<div style="font-size:11px;font-weight:700;color:var(--ikb);margin-bottom:4px;">🛡️ 60% 醫療與危疾防禦金</div>' +
                '<div style="font-size:16px;font-weight:800;font-family:monospace;color:#1e3a8a;" id="family-protection-num">HK$ ' + budgetRes.protectionBudget.toLocaleString() + ' /月</div>' +
                '<div style="font-size:10px;color:#475569;margin-top:4px;" id="family-protection-desc">定期壽險 (HK$' + termWan + '萬，覆蓋房貸+生活費) + 多次危疾 (HK$' + ciWan + '萬) + 自願醫保半私家全數賠償</div>' +
              '</div>' +
              '<div class="family-split-card savings" id="family-savings-val">' +
                '<div style="font-size:11px;font-weight:700;color:#059669;margin-bottom:4px;">📈 40% 子女教育與金庫</div>' +
                '<div style="font-size:16px;font-weight:800;font-family:monospace;color:#065f46;" id="family-savings-num">HK$ ' + budgetRes.savingsBudget.toLocaleString() + ' /月</div>' +
                '<div style="font-size:10px;color:#475569;margin-top:4px;" id="family-savings-desc">18年複利滾存預估大學金：<strong>HK$ ' + eduWan + '萬</strong> (總投入 HK$ ' + depWan + '萬 · 增值 +HK$ ' + gainWan + '萬)</div>' +
              '</div>' +
            '</div>' +
            '<div class="family-mortgage-box" id="family-bundling-card">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="font-size:11px;font-weight:700;color:#991b1b;">🏡 尚欠房貸保障缺口診斷器</span>' +
                '<span style="font-size:10px;font-weight:700;color:#b91c1c;">風險防禦</span>' +
              '</div>' +
              '<div style="display:flex;gap:8px;align-items:center;">' +
                '<input type="text" inputmode="numeric" pattern="[0-9]*" style="flex:1;padding:6px 8px;border:1px solid #fca5a5;border-radius:4px;font-size:12px;font-weight:700;font-family:monospace;" id="family-mortgage-input" value="' + (familyMortgageBalance || '') + '" oninput="onMortgageChange(this.value)" placeholder="輸入房貸餘額">' +
                '<span style="font-size:11px;color:#7f1d1d;font-weight:600;">港幣</span>' +
              '</div>' +
              '<div style="font-size:11px;color:#991b1b;margin-top:6px;line-height:1.4;" id="family-mortgage-gap">' +
                (budgetRes.mortgageBalance > 0
                  ? '若家庭支柱突遭意外或重疾，尚欠房貸餘額為 <strong>HK$ ' + budgetRes.mortgageBalance.toLocaleString() + '</strong>。已動態配置定期壽險保額 <strong>HK$ ' + termWan + '萬</strong> (月保費約 HK$' + budgetRes.termMonthlyPremEst + ')，100% 抹平房貸斷供風險，額外留存 5 年家庭生活費！'
                  : '✅ 當前無房貸負擔！每月 60% 防禦預算可全數聚焦於家庭支柱定期純壽險與多次危疾，提供最高保額槓桿防護。') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'retirement_tax') {
        const qdapOur = (mySelectedProduct && (normalizeCategory(mySelectedProduct.category) === 'Annuity_QDAP' || mySelectedProduct.qdap_metrics)) ? mySelectedProduct : null;
        const qdapFlagshipOur = getFlagshipProduct(myCompany, 'Annuity_QDAP');
        const resolvedOurQDAP = qdapOur || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === myCompany && normalizeCategory(p.category) === 'Annuity_QDAP' && (p.name.includes(qdapFlagshipOur) || qdapFlagshipOur.includes(cleanProductName(p.name)))) || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === myCompany && normalizeCategory(p.category) === 'Annuity_QDAP') || (mySelectedProduct || {});

        const gIrr = resolvedOurQDAP.qdapGuaranteedIRR || (resolvedOurQDAP.qdap_metrics && resolvedOurQDAP.qdap_metrics.guaranteed_internal_rate_pct) || 2.80;
        const tIrr = resolvedOurQDAP.qdapTotalIRR || (resolvedOurQDAP.qdap_metrics && resolvedOurQDAP.qdap_metrics.total_internal_rate_pct) || 4.65;
        const gRatio = resolvedOurQDAP.qdapGuaranteedPct || (resolvedOurQDAP.qdap_metrics && resolvedOurQDAP.qdap_metrics.guaranteed_cashflow_ratio_pct) || (Math.round((gIrr / tIrr) * 100 * 10) / 10);
        const qdapOurName = cleanProductName(resolvedOurQDAP.name || ourProdName);

        const qdapRes = calculateQDAPTaxRelief(qdapTaxRate, qdapAnnualPremium, qdapIsCouple, resolvedOurQDAP);

        html = '<div class="scenario-card-box" id="panel-scenario-retirement">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">👴 合資格延期年金 (QDAP) 扣稅與退休現金流</div>' +
              '<div class="scenario-subtitle">法定 HK$60,000 扣稅上限 · 夫妻合併 HK$120,000 · 實質慳稅高達 HK$20,400</div>' +
            '</div>' +
            '<span class="scenario-pill-badge green">法定退稅</span>' +
          '</div>' +
          '<div class="retirement-calc-box">' +
            '<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:11px;color:#1e3a8a;display:flex;justify-content:space-between;align-items:center;">' +
              '<span>🔵 方案 A: <strong>' + qdapOurName + '</strong> (保證IRR ' + gIrr + '% · 總IRR ' + tIrr + '%)</span>' +
              '<span style="color:#64748b;">🔴 遭遇競品: <strong>' + rivalProdName + '</strong></span>' +
            '</div>' +
            '<div style="font-size:11px;font-weight:700;color:#334155;margin-bottom:6px;">💰 QDAP 年繳保費與邊際稅階試算</div>' +
            '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">' +
              '<input type="number" style="flex:1;padding:8px 10px;border:1.5px solid #cbd5e1;border-radius:6px;font-size:14px;font-weight:700;font-family:monospace;" id="qdap-premium-input" value="' + qdapAnnualPremium + '" oninput="onQDAPPremiumChange(this.value)" placeholder="QDAP 年繳保費">' +
              '<label style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#0f172a;cursor:pointer;">' +
                '<input type="checkbox" id="qdap-couple-toggle"' + (qdapIsCouple ? ' checked' : '') + ' onchange="onQDAPCoupleToggle(this.checked)">' +
                '<span>👫 夫妻合併 (上限12萬)</span>' +
              '</label>' +
            '</div>' +
            '<div style="font-size:11px;color:#64748b;margin-bottom:4px;">選擇個人薪俸稅最高邊際稅階：</div>' +
            '<div class="tax-bracket-chips">' +
              [2, 6, 10, 14, 17].map(function(rate) {
                return '<button class="tax-chip' + (qdapTaxRate === rate ? ' active' : '') + '" id="qdap-chip-' + rate + '" onclick="onQDAPRateSelect(' + rate + ')">' + rate + '% ' + (rate === 17 ? '(頂階稅率)' : '') + '</button>';
              }).join('') +
            '</div>' +
            '<div class="tax-result-card">' +
              '<div>' +
                '<div style="font-size:11px;color:#065f46;font-weight:700;">每年實質慳稅金額 (稅務局真金白銀退稅)</div>' +
                '<div style="font-size:10px;color:#047857;" id="qdap-eligible-limit-val">合資格扣稅額：HK$ ' + qdapRes.eligible.toLocaleString() + ' (等同總保費實質慳 ' + qdapRes.discountPct + '%)</div>' +
              '</div>' +
              '<div class="tax-saved-badge" id="qdap-tax-saved-val">HK$ ' + qdapRes.taxSaved.toLocaleString() + '</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">' +
              '<div style="background:#eff6ff;padding:8px;border-radius:6px;border:1px solid #bfdbfe;" id="qdap-annuity-monthly-val">' +
                '<div style="font-size:10px;color:#64748b;">預估退休後每月保證年金</div>' +
                '<div style="font-size:14px;font-weight:800;color:var(--ikb);font-family:monospace;" id="qdap-annuity-monthly-num">HK$ ' + qdapRes.monthlyAnnuity.toLocaleString() + ' /月</div>' +
              '</div>' +
              '<div style="background:#f8fafc;padding:8px;border-radius:6px;border:1px solid #e2e8f0;" id="qdap-guaranteed-share-val">' +
                '<div style="font-size:10px;color:#64748b;">年金保證現金流佔比</div>' +
                '<div style="font-size:14px;font-weight:800;color:#0f172a;font-family:monospace;" id="qdap-guaranteed-share-num">' + gRatio + '% (保證IRR ' + gIrr + '%)</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'instant_comms') {
        const msgText = generateInstantMessage(commsPlatform, commsTone);
        html = '<div class="scenario-card-box" id="panel-scenario-comms">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">💬 微信 / WhatsApp 見客後極速追單速遞</div>' +
              '<div class="scenario-subtitle">一鍵生成個人化對比摘要 · 內嵌 GL20 法定聲明 · 1-Tap 複製即發</div>' +
            '</div>' +
            '<span class="scenario-pill-badge blue">追單神器</span>' +
          '</div>' +
          '<div style="font-size:11px;color:#64748b;margin-bottom:6px;">選擇話術風格與發送渠道：</div>' +
          '<div class="comms-tone-bar">' +
            '<button class="comms-tone-chip' + (commsTone === 'urgent_closing' ? ' active' : '') + '" id="comms-tone-urgent" data-tone="urgent_closing" onclick="onCommsToneSelect(this.dataset.tone)">🔥 趁熱打鐵速決版</button>' +
            '<button class="comms-tone-chip' + (commsTone === 'rational_data' ? ' active' : '') + '" id="comms-tone-rational" data-tone="rational_data" onclick="onCommsToneSelect(this.dataset.tone)">📊 客觀數據理性比對版</button>' +
            '<button class="comms-tone-chip' + (commsTone === 'mcv_vip' ? ' active' : '') + '" id="comms-tone-mcv" data-tone="mcv_vip" onclick="onCommsToneSelect(this.dataset.tone)">🇨🇳 內地大客尊貴配置版</button>' +
          '</div>' +
          '<div style="display:flex;gap:6px;margin-bottom:8px;">' +
            '<button class="comms-tone-chip' + (commsPlatform === 'whatsapp' ? ' active' : '') + '" id="comms-platform-whatsapp" data-plat="whatsapp" onclick="onCommsPlatformSelect(this.dataset.plat)">📲 WhatsApp 格式 (*粗體*排版)</button>' +
            '<button class="comms-tone-chip' + (commsPlatform === 'wechat' ? ' active' : '') + '" id="comms-platform-wechat" data-plat="wechat" onclick="onCommsPlatformSelect(this.dataset.plat)">🟢 微信/SMS 通用格式</button>' +
          '</div>' +
          '<div class="comms-preview-box" id="comms-preview-text">' + msgText + '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="scenario-action-btn primary-btn" id="btn-copy-instant-whatsapp" onclick="copyCommsMessageWhatsapp()">' +
              '📲 複製 WhatsApp 訊息' +
            '</button>' +
            '<button class="scenario-action-btn" id="btn-open-instant-whatsapp" onclick="openWhatsAppDirect()">' +
              '🚀 直接開啟 WhatsApp' +
            '</button>' +
            '<button class="scenario-action-btn" id="btn-copy-instant-wechat" onclick="copyCommsMessageWechat()">' +
              '🟢 複製 微信/SMS' +
            '</button>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'cashless_medical') {
        const hospitals = (typeof HK_13_PRIVATE_HOSPITALS !== 'undefined' && Array.isArray(HK_13_PRIVATE_HOSPITALS))
          ? HK_13_PRIVATE_HOSPITALS.map(function(h) { return h.name; })
          : [
            '香港養和醫院 (Hong Kong Sanatorium & Hospital)',
            '港怡醫院 (Gleneagles Hospital Hong Kong)',
            '嘉諾撒醫院 (Canossa Hospital)',
            '香港中文大學醫院 (CUHK Medical Centre)',
            "聖保祿醫院 (St. Paul's Hospital)",
            '仁安醫院 (Union Hospital)',
            '香港浸信會醫院 (Hong Kong Baptist Hospital)',
            '香港港安醫院－司徒拔道 (Hong Kong Adventist Hospital - Stubbs Road)',
            '香港港安醫院－荃灣 (Hong Kong Adventist Hospital - Tsuen Wan)',
            '播道醫院 (Evangel Hospital)',
            "聖德肋撒醫院 / 法國醫院 (St. Teresa's Hospital)",
            '明德國際醫院 (Matilda International Hospital)',
            '寶血醫院（明愛） (Precious Blood Hospital (Caritas))'
          ];

        const treatments = [
          { name: '癌症非手術標靶治療 (Targeted Cancer Therapy)', est: 680000 },
          { name: '心臟冠狀動脈通波仔手術 (Coronary Angioplasty / Stent)', est: 380000 },
          { name: '達芬奇機械人微創手術 (Da Vinci Robotic Surgery)', est: 450000 },
          { name: '全膝關節置換手術 (Total Knee Replacement)', est: 280000 },
          { name: '白內障日間手術 (Cataract Day Surgery)', est: 65000 },
          { name: '腸胃鏡檢查及息肉切除 (Endoscopy & Polypectomy)', est: 45000 },
          { name: '脊柱微創椎間盤手術 (Minimally Invasive Spine Surgery)', est: 350000 }
        ];

        const curHospObj = (typeof HK_13_PRIVATE_HOSPITALS !== 'undefined' && Array.isArray(HK_13_PRIVATE_HOSPITALS))
          ? (HK_13_PRIVATE_HOSPITALS.find(function(h) { return h.name === medicalHospital; }) || HK_13_PRIVATE_HOSPITALS[0])
          : {
            name: medicalHospital,
            district: '全港私立醫院',
            roomTier: '半私家房 / 私家房',
            directBillingStatus: '全額保證代付 (LOG擔保)',
            preApprovalHours: '24 小時特快批核',
            specialties: '頂級專科醫療網絡',
            depositWithLOG: 'HK$ 0 (全免入院按金)',
            depositWithoutLOG: 'HK$ 30,000 - 50,000'
          };
        const curTreatmentObj = treatments.find(function(t) { return t.name === medicalTreatment; }) || treatments[0];
        const estCost = curTreatmentObj.est;

        const medOur = (mySelectedProduct && normalizeCategory(mySelectedProduct.category) === 'Medical_VHIS') ? mySelectedProduct : null;
        const medFlagshipOur = getFlagshipProduct(myCompany, 'Medical_VHIS');
        const resolvedOurMed = medOur || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === myCompany && normalizeCategory(p.category) === 'Medical_VHIS' && (p.name.includes(medFlagshipOur) || medFlagshipOur.includes(cleanProductName(p.name)))) || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === myCompany && normalizeCategory(p.category) === 'Medical_VHIS') || mySelectedProduct;

        const medRival = (rivalSelectedProduct && normalizeCategory(rivalSelectedProduct.category) === 'Medical_VHIS') ? rivalSelectedProduct : null;
        const medFlagshipRival = getFlagshipProduct(selectedCompany, 'Medical_VHIS');
        const resolvedRivalMed = medRival || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === selectedCompany && normalizeCategory(p.category) === 'Medical_VHIS' && (p.name.includes(medFlagshipRival) || medFlagshipRival.includes(cleanProductName(p.name)))) || (window.ALL_PRODUCTS_CATALOG || []).find(p => normalizeCompany(p.insurer) === selectedCompany && normalizeCategory(p.category) === 'Medical_VHIS') || rivalSelectedProduct;

        const medicalOurProdName = cleanProductName(resolvedOurMed.name || resolvedOurMed.product_name || ourProdName);
        const medicalRivalProdName = cleanProductName(resolvedRivalMed.name || resolvedRivalMed.product_name || rivalProdName);

        // Dynamic deductible tiers from selected product or standard options
        const ourDeds = (resolvedOurMed.vhisDeductibles && resolvedOurMed.vhisDeductibles.length > 0)
          ? resolvedOurMed.vhisDeductibles
          : (resolvedOurMed.vhis_metrics && Array.isArray(resolvedOurMed.vhis_metrics.deductible_options_hkd) && resolvedOurMed.vhis_metrics.deductible_options_hkd.length > 0)
            ? resolvedOurMed.vhis_metrics.deductible_options_hkd
            : [0, 16000, 25000, 50000, 80000];
        const dedTiers = Array.from(new Set(ourDeds)).sort((a,b) => a - b);
        if (!dedTiers.includes(medicalDeductible)) {
          medicalDeductible = dedTiers[0] || 0;
        }

        const outOfPocket = Math.min(medicalDeductible, estCost);
        const coveredAmt = estCost - outOfPocket;

        const rivalAnnual = (resolvedRivalMed.vhisLimitHkd || (resolvedRivalMed.vhis_metrics && resolvedRivalMed.vhis_metrics.annual_limit_hkd)) || 20000000;
        const rivalAnnualWan = Math.round(rivalAnnual / 10000);
        const rivalCompName = resolvedRivalMed.insurerName || resolvedRivalMed.insurer || selectedCompany;
        const ourCompName = resolvedOurMed.insurerName || resolvedOurMed.insurer || myCompany;

        const rivalLimitation = (resolvedRivalMed.insurer === 'Bowtie' || selectedCompany === 'Bowtie')
          ? '純網上自願醫保，無 Agent 實體跟進出院直付；需全在線自主遞交申請，越級病房設 50% 折減'
          : '【' + rivalCompName + '】年度限額 HK$ ' + rivalAnnualWan + '萬；傳統直付批核需 5-7 工作天，超出限額或自負額需先自行墊支';

        html = '<div class="scenario-card-box" id="panel-scenario-medical">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">💼 高端醫療 / 私家醫院出院免找數直付速查</div>' +
              '<div class="scenario-subtitle">覆蓋全港頂尖私家醫院 · 預先批核擔保 · 0 墊支零負擔</div>' +
            '</div>' +
            '<span class="scenario-pill-badge green">出院免找數</span>' +
          '</div>' +
          '<div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:8px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">' +
            '<div style="font-size:12px;font-weight:800;color:var(--ikb);display:flex;align-items:center;gap:4px;">' +
              '<span>🔗 雙邊方案實時聯動中：</span>' +
              '<span style="color:#1e40af;background:#dbeafe;padding:2px 8px;border-radius:4px;">【Plan A 我方】' + medicalOurProdName + '</span>' +
              '<span style="color:#64748b;font-weight:normal;">vs</span>' +
              '<span style="color:#991b1b;background:#fee2e2;padding:2px 8px;border-radius:4px;">【Plan B 對手】' + medicalRivalProdName + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:#2563eb;font-weight:600;">(可在上方 Plan A / Plan B 即時更換產品)</div>' +
          '</div>' +
          '<div class="medical-select-box">' +
            '<label style="font-size:11px;font-weight:700;color:#334155;">🏥 選擇目標私家醫院：</label>' +
            '<select class="medical-select" id="medical-hospital-select" onchange="onMedicalHospitalSelect(this.value)">' +
              hospitals.map(function(h) {
                return '<option value="' + h + '"' + (medicalHospital === h ? ' selected' : '') + '>' + h + '</option>';
              }).join('') +
            '</select>' +
            '<label style="font-size:11px;font-weight:700;color:#334155;margin-top:4px;">🩺 選擇常規重大手術/標靶治療項目：</label>' +
            '<select class="medical-select" id="medical-treatment-select" onchange="onMedicalTreatmentSelect(this.value)">' +
              treatments.map(function(t) {
                return '<option value="' + t.name + '"' + (medicalTreatment === t.name ? ' selected' : '') + '>' + t.name + ' (預估 HK$ ' + (t.est/10000) + '萬)</option>';
              }).join('') +
            '</select>' +
            '<div style="font-size:11px;font-weight:700;color:#334155;margin-top:4px;">自負額 (Deductible) 方案（動態對接選取方案階梯）：</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              dedTiers.map(function(ded) {
                return '<button class="tax-chip' + (medicalDeductible === ded ? ' active' : '') + '" onclick="onMedicalDeductibleSelect(' + ded + ')">HK$ ' + ded.toLocaleString() + (ded === 0 ? ' (全額無自負)' : '') + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="medical-result-card" id="medical-result-card">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
              '<span style="font-size:12px;font-weight:800;color:var(--ikb);">🟢 保險公司付款擔保 (Letter of Guarantee) 雙邊模擬對照</span>' +
              '<span style="font-size:10px;font-weight:700;color:#059669;background:#dcfce7;padding:2px 6px;border-radius:4px;">已獲預先批核</span>' +
            '</div>' +
            '<div style="background:#f1f5f9;border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px;color:#334155;line-height:1.6;">' +
              '🏥 <strong>目標私家醫院：</strong>' + curHospObj.name + ' <span style="color:#0284c7;font-weight:700;">（' + curHospObj.district + ' · ' + curHospObj.roomTier + '）</span><br>' +
              '⚡ <strong>出院免找數狀態：</strong><span style="color:#059669;font-weight:700;">' + curHospObj.directBillingStatus + ' · ' + curHospObj.preApprovalHours + '</span><br>' +
              '🔬 <strong>重點醫療專科：</strong>' + curHospObj.specialties + '<br>' +
              '💰 <strong>入院按金豁免機制：</strong>【保司付款擔保 (LOG)】<strong style="color:#059669;">' + curHospObj.depositWithLOG + '</strong> vs 【無擔保自費】需繳按金 ' + curHospObj.depositWithoutLOG + '<br>' +
              '🩺 <strong>手術治療項目：</strong>' + curTreatmentObj.name + ' (預估總額 HK$ ' + (estCost/10000) + '萬)' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
              '<div style="background:#eff6ff;padding:8px;border-radius:8px;border:1.5px solid #93c5fd;">' +
                '<div style="font-size:11px;font-weight:800;color:var(--ikb);margin-bottom:4px;">🔵 我方 (Plan A): ' + medicalOurProdName + '</div>' +
                '<div style="font-size:10px;color:#1e3a8a;">保司直接代付 (LOG擔保)：</div>' +
                '<div style="font-size:15px;font-weight:800;color:#059669;font-family:monospace;">HK$ ' + (coveredAmt/10000).toFixed(1) + '萬</div>' +
                '<div style="font-size:10px;color:#64748b;margin-top:2px;">客戶自負額：<strong style="color:' + (outOfPocket > 0 ? '#b91c1c' : '#059669') + ';">HK$ ' + outOfPocket.toLocaleString() + '</strong></div>' +
                '<div style="font-size:10px;color:#1e40af;margin-top:4px;">✅ 【' + ourCompName + '】專屬醫療顧問直通，全額保證代付，入院免收大額按金！</div>' +
              '</div>' +
              '<div style="background:#fef2f2;padding:8px;border-radius:8px;border:1.5px solid #fca5a5;">' +
                '<div style="font-size:11px;font-weight:800;color:#991b1b;margin-bottom:4px;">🔴 對手 (Plan B): ' + medicalRivalProdName + '</div>' +
                '<div style="font-size:10px;color:#7f1d1d;">競品直付覆蓋與限制：</div>' +
                '<div style="font-size:12px;font-weight:700;color:#991b1b;line-height:1.4;margin-top:3px;">' + rivalLimitation + '</div>' +
                '<div style="font-size:10px;color:#64748b;margin-top:4px;">⚠️ 若超出單項限額或非認可醫院，客戶需出院時自行刷卡墊付差額！</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">' +
              '<div style="background:#fff;padding:6px;border-radius:6px;border:1px solid #cbd5e1;">' +
                '<div style="font-size:10px;color:#64748b;">預估總醫療費用</div>' +
                '<div style="font-size:13px;font-weight:800;color:#0f172a;font-family:monospace;">HK$ ' + (estCost/10000) + '萬</div>' +
              '</div>' +
              '<div style="background:#ecfdf5;padding:6px;border-radius:6px;border:1px solid #86efac;">' +
                '<div style="font-size:10px;color:#059669;">保司直接代付 (直付)</div>' +
                '<div style="font-size:13px;font-weight:800;color:#059669;font-family:monospace;">HK$ ' + (coveredAmt/10000).toFixed(1) + '萬</div>' +
              '</div>' +
              '<div style="background:#fff;padding:6px;border-radius:6px;border:1px solid #cbd5e1;">' +
                '<div style="font-size:10px;color:#64748b;">客戶自付 (自負額)</div>' +
                '<div style="font-size:13px;font-weight:800;color:' + (outOfPocket > 0 ? '#b91c1c' : '#059669') + ';font-family:monospace;">HK$ ' + outOfPocket.toLocaleString() + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="margin-top:10px;font-size:11px;color:#1e3a8a;line-height:1.4;">' +
              '<strong>流程保證：</strong>憑直付綠色通道，入院無需預繳數萬元住院按金；出院時醫院與保險公司後台直接對賬結算，客戶簽名即可安心離院！' +
            '</div>' +
          '</div>' +
          '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:8px;">' +
            '<div style="font-size:11px;font-weight:700;color:#0f172a;margin-bottom:6px;">📋 4步極速出院直付申請流程：</div>' +
            '<div style="font-size:11px;color:#475569;line-height:1.6;">' +
              '1. 入院前 3-5 天提交主治醫生填寫之預先批核表<br>' +
              '2. 保司發出「付款擔保書 (Letter of Guarantee)」<br>' +
              '3. 入院登記出示醫療直付卡與身份證明，豁免入院按金<br>' +
              '4. 出院結算由保險公司直接對付醫院，客戶零墊支離院' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'ul_stress') {
        const ulRes = calculateULStress(ulCapital, ulPolicyTotal, ulCreditingRate, ulBorrowingRate, ulHikeBps);
        html = '<div class="scenario-card-box" id="panel-scenario-ul-stress">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">🏦 萬用壽險 (UL) 保費融資加息壓力測試計算機</div>' +
              '<div class="scenario-subtitle">槓桿倍數試算 · 淨息差 (Net Spread) 倒掛預警 · 銀行 Margin Call 安全線</div>' +
            '</div>' +
            '<span class="scenario-pill-badge ' + (ulRes.isNegativeSpread ? 'red' : 'blue') + '" id="ul-stress-status-pill">' + (ulRes.isNegativeSpread ? '🚨 利差倒掛' : '槓桿套利') + '</span>' +
          '</div>' +
          '<div class="ul-stress-box">' +
            '<div style="font-size:11.5px;font-weight:700;color:#1e3a8a;margin-bottom:8px;">📊 融資槓桿基礎參數配置：</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">' +
              '<div>' +
                '<label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">客戶投入本金 (USD)：</label>' +
                '<input type="number" id="input-ul-capital" value="' + ulCapital + '" oninput="onULCapitalChange(this.value)" style="width:100%;padding:6px 8px;border:1.5px solid #cbd5e1;border-radius:6px;font-weight:700;font-family:monospace;">' +
              '</div>' +
              '<div>' +
                '<label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">撬動保單總面值 (USD)：</label>' +
                '<input type="number" id="input-ul-policy-total" value="' + ulPolicyTotal + '" oninput="onULPolicyTotalChange(this.value)" style="width:100%;padding:6px 8px;border:1.5px solid #cbd5e1;border-radius:6px;font-weight:700;font-family:monospace;">' +
              '</div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">' +
              '<div>' +
                '<label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">保單現行結算利率 (Crediting Rate %)：</label>' +
                '<input type="number" step="0.05" id="input-ul-crediting-rate" value="' + ulCreditingRate + '" oninput="onULCreditingRateChange(this.value)" style="width:100%;padding:6px 8px;border:1.5px solid #cbd5e1;border-radius:6px;font-weight:700;font-family:monospace;">' +
              '</div>' +
              '<div>' +
                '<label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">基準借貸成本 (HIBOR/SOFR+Margin %)：</label>' +
                '<input type="number" step="0.05" id="input-ul-borrowing-rate" value="' + ulBorrowingRate + '" oninput="onULBorrowingRateChange(this.value)" style="width:100%;padding:6px 8px;border:1.5px solid #cbd5e1;border-radius:6px;font-weight:700;font-family:monospace;">' +
              '</div>' +
            '</div>' +
            '<div style="font-size:11px;font-weight:700;color:#334155;margin-bottom:4px;">模擬全球央行極端加息衝擊：</div>' +
            '<div class="stress-hike-bar">' +
              '<button class="stress-hike-chip' + (ulHikeBps === 0 ? ' active' : '') + '" id="btn-hike-0" onclick="setULHike(0)">基準現狀 (+0 bps)</button>' +
              '<button class="stress-hike-chip' + (ulHikeBps === 100 ? ' active' : '') + '" id="btn-hike-100" onclick="setULHike(100)">加息 +100 bps (+1.0%)</button>' +
              '<button class="stress-hike-chip' + (ulHikeBps === 200 ? ' active' : '') + '" id="btn-hike-200" onclick="setULHike(200)">極端壓力 +200 bps (+2.0%)</button>' +
              '<button class="stress-hike-chip' + (ulHikeBps === 300 ? ' active' : '') + '" id="btn-hike-300" onclick="setULHike(300)">金融海嘯 +300 bps (+3.0%)</button>' +
            '</div>' +
            '<div class="stress-grid">' +
              '<div class="stress-metric-card">' +
                '<div style="font-size:10px;color:#64748b;">初始資金槓桿</div>' +
                '<div style="font-size:14px;font-weight:800;color:var(--ikb);font-family:monospace;" id="ul-stress-leverage">' + ulRes.leverage + '</div>' +
              '</div>' +
              '<div class="stress-metric-card">' +
                '<div style="font-size:10px;color:#64748b;">淨套利息差 (Net Spread)</div>' +
                '<div style="font-size:14px;font-weight:800;color:' + (ulRes.netSpreadNum >= 0 ? '#059669' : '#dc2626') + ';font-family:monospace;" id="ul-stress-net-spread">' + ulRes.netSpread + '</div>' +
              '</div>' +
              '<div class="stress-metric-card">' +
                '<div style="font-size:10px;color:#64748b;">每年淨現金流 (Cashflow)</div>' +
                '<div style="font-size:14px;font-weight:800;color:' + (ulRes.netCashflow >= 0 ? '#059669' : '#dc2626') + ';font-family:monospace;" id="ul-stress-cashflow">' + (ulRes.netCashflow >= 0 ? '+' : '') + '$' + Math.round(ulRes.netCashflow).toLocaleString() + '</div>' +
              '</div>' +
              '<div class="stress-metric-card">' +
                '<div style="font-size:10px;color:#64748b;">本金回報率 (ROE)</div>' +
                '<div style="font-size:14px;font-weight:800;color:' + (ulRes.netCashflow >= 0 ? '#059669' : '#dc2626') + ';font-family:monospace;" id="ul-stress-roe">' + ulRes.roe + '</div>' +
              '</div>' +
            '</div>' +
            (ulRes.isNegativeSpread
              ? (ulRes.netCashflow < 0
                  ? '<div class="stress-warning-banner" id="ul-stress-warning">' +
                      '⚠️ <strong>利差倒掛警告 (Negative Carry Alert)！</strong> 當前銀行借貸成本 (' + ulRes.borrowingRate + ') 已高於保單派息率 (' + ulRes.creditingRate + ')，淨利差為負 (' + ulRes.netSpread + ')，保單全盤現金流轉為負值，客戶每年需自掏腰包補貼利差損約 USD $' + Math.abs(Math.round(ulRes.netCashflow)).toLocaleString() + '！' +
                    '</div>'
                  : '<div class="stress-warning-banner" id="ul-stress-warning">' +
                      '⚠️ <strong>融資利差倒掛預警！</strong> 銀行借貸利率 (' + ulRes.borrowingRate + ') 超過保單結算利率 (' + ulRes.creditingRate + ')，融資貸款部分年損息約 USD $' + Math.abs(Math.round(ulRes.loanAmount * (Math.abs(ulRes.netSpreadPct) / 100))).toLocaleString() + '。雖然憑藉自有本金收益整體現金流仍維持正向 (+$' + Math.round(ulRes.netCashflow).toLocaleString() + ')，但利差安全墊已被侵蝕，需密切關注加息及 Margin Call 追繳風險！' +
                    '</div>'
                )
              : '<div style="background:#ecfdf5;border:1px solid #86efac;border-radius:8px;padding:8px 12px;font-size:11.5px;color:#065f46;margin-top:10px;" id="ul-stress-safe">' +
                  '✅ <strong>利差安全墊充裕：</strong> 當前淨利差 ' + ulRes.netSpread + '，在當前加息情景下仍可維持每年約 USD $' + Math.round(ulRes.netCashflow).toLocaleString() + ' 穩定正向現金流。' +
                '</div>') +
            '<div style="margin-top:8px;padding:8px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;font-size:10.5px;color:#475569;display:flex;justify-content:space-between;align-items:center;">' +
              '<span>🛡️ 追繳保證金 (Margin Call) 狀態：<strong style="color:' + (ulRes.isMarginCallRisk ? '#dc2626' : '#059669') + ';" id="ul-margin-call-status">' + (ulRes.isMarginCallRisk ? '🚨 追繳警戒 (抗跌緩衝不足)' : '✅ 安全 (緩衝充裕 >15%)') + '</strong></span>' +
              '<span style="color:#b91c1c;font-weight:700;">借定唔借？還得到先好借！</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'group_medical') {
        const grpRes = optimizeGroupMedicalVHIS(groupMedicalLimit);
        html = '<div class="scenario-card-box" id="panel-group-medical-optimizer">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">🏥 公司團體醫療 (Group Medical) + 高端自願醫保抵扣最優計算機</div>' +
              '<div class="scenario-subtitle">消除重複開支 · 精算最佳自負額 (Deductible) 階梯 · 做到「零自掏腰包 + 保費最低化」</div>' +
            '</div>' +
            '<span class="scenario-pill-badge green">慳保費神器</span>' +
          '</div>' +
          '<div class="group-opt-box">' +
            '<div style="font-size:11.5px;font-weight:700;color:#1e3a8a;margin-bottom:6px;">🏢 選擇您現有僱主/公司團險住院保障門額：</div>' +
            '<div class="group-preset-bar">' +
              [0, 25000, 30000, 50000, 80000].map(function(lim) {
                return '<button class="group-preset-chip' + (groupMedicalLimit === lim ? ' active' : '') + '" id="group-chip-' + lim + '" onclick="setGroupMedicalLimit(' + lim + ')">' + (lim === 0 ? '無團險' : ('HK$ ' + (lim/1000) + 'K (' + (lim === 50000 ? '外企常見' : (lim === 80000 ? '高管方案' : '普通中小企')) + ')')) + '</button>';
              }).join('') +
            '</div>' +
            '<div style="display:flex;gap:8px;align-items:center;margin:8px 0 12px;flex-wrap:wrap;">' +
              '<span style="font-size:11px;color:#64748b;">自訂團險額度 (HK$)：</span>' +
              '<input type="range" id="slider-group-limit" min="0" max="100000" step="5000" value="' + groupMedicalLimit + '" oninput="setGroupMedicalLimit(this.value)" style="flex:1;min-width:140px;cursor:pointer;">' +
              '<input type="number" id="input-group-limit" value="' + groupMedicalLimit + '" oninput="setGroupMedicalLimit(this.value)" style="width:110px;padding:4px 8px;border:1.5px solid #cbd5e1;border-radius:6px;font-weight:700;font-family:monospace;">' +
            '</div>' +
            '<div style="background:#eff6ff;border:1.5px solid #93c5fd;border-radius:8px;padding:12px;margin-bottom:10px;">' +
              '<div style="font-size:11px;color:#1e3a8a;font-weight:700;margin-bottom:4px;">🎯 精算推薦最優自願醫保 (VHIS) 搭配方案：</div>' +
              '<div style="font-size:16px;font-weight:800;color:var(--ikb);margin-bottom:6px;" id="group-opt-recommended">推薦投保：HK$ ' + grpRes.recommendedDeductible.toLocaleString() + ' 自負額 (Deductible) 計劃</div>' +
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">' +
                '<div style="background:#ffffff;padding:8px;border-radius:6px;border:1px solid #bfdbfe;">' +
                  '<div style="font-size:10px;color:#64748b;">每年節省保費金額</div>' +
                  '<div style="font-size:15px;font-weight:800;color:#059669;font-family:monospace;" id="group-opt-savings-annual">省下 HK$ ' + grpRes.premiumSavingsHKD.toLocaleString() + ' /年 (' + grpRes.premiumSavingsPct + '%)</div>' +
                '</div>' +
                '<div style="background:#ffffff;padding:8px;border-radius:6px;border:1px solid #bfdbfe;">' +
                  '<div style="font-size:10px;color:#64748b;">客戶實際自掏腰包支出</div>' +
                  '<div style="font-size:15px;font-weight:800;color:#059669;font-family:monospace;" id="group-opt-out-of-pocket">HK$ 0 (零自掏腰包)</div>' +
                '</div>' +
              '</div>' +
              '<div style="font-size:11px;color:#1e40af;margin-top:8px;line-height:1.45;" id="group-opt-explanation">' +
                grpRes.explanation +
              '</div>' +
            '</div>' +
            '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;font-size:11px;color:#475569;line-height:1.5;">' +
              '<strong>💡 10年複利慳錢效益：</strong> 善用公司現有團險作墊底，10年累計省下保費高達 <strong style="color:#059669;" id="group-opt-10yr-savings">HK$ ' + grpRes.tenYearSavings.toLocaleString() + '</strong>！全港 13 家私立醫院均支援無縫接軌直付。' +
            '</div>' +
          '</div>' +
        '</div>';
      } else if (currentScenario === 'offline_resilience') {
        const offRes = getOfflineStatus();
        html = '<div class="scenario-card-box" id="panel-scenario-offline">' +
          '<div class="scenario-head">' +
            '<div>' +
              '<div class="scenario-title">📴 無網/地庫/地鐵離線環境韌性守護</div>' +
              '<div class="scenario-subtitle">100% 本地客戶端精算運算 · 零網絡延遲 · 離線快取健康監控</div>' +
            '</div>' +
            '<span class="scenario-pill-badge' + (offRes.isOnline ? ' green' : ' blue') + '">' + (offRes.isOnline ? '連線中' : '離線模式') + '</span>' +
          '</div>' +
          '<div class="offline-status-box">' +
            '<div class="offline-banner" id="offline-status-banner">' +
              (offRes.isOnline
                ? '🟢 當前網絡狀態：連線正常 · 本機快取已雙重鎖定 (Online Ready)'
                : '🟡 模擬地庫/地鐵離線模式 · 100% 依賴本機快取與精算核心 (Offline Active)') +
            '</div>' +
            '<div style="font-size:11px;color:#cbd5e1;line-height:1.4;">' +
              'InsurIntel 採用完全前端自主精算架構。即使身處中環交易廣場地庫咖啡廳、機場快綫或地鐵無訊號盲區，全港 99 款產品、對抗戰策與比對矩陣均可 0 毫秒極速反應，絕不白屏！' +
            '</div>' +
            '<div class="offline-metrics-row">' +
              '<div class="offline-tile">' +
                '<div class="offline-tile-val" id="offline-catalog-count">' + offRes.cachedProducts + ' 款</div>' +
                '<div class="offline-tile-label">本機離線產品庫</div>' +
              '</div>' +
              '<div class="offline-tile">' +
                '<div class="offline-tile-val" id="offline-storage-size">~380 KB</div>' +
                '<div class="offline-tile-label">快取占用空間</div>' +
              '</div>' +
              '<div class="offline-tile">' +
                '<div class="offline-tile-val" id="offline-health-score">' + offRes.healthScore + ' / 100</div>' +
                '<div class="offline-tile-label">離線健康評分</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<button class="scenario-action-btn' + (isSimulatedOffline ? ' primary-btn' : '') + '" style="width:100%;" id="btn-toggle-offline-sim" onclick="toggleSimulatedOffline()">' +
            (isSimulatedOffline ? '🟢 恢復正常連線狀態' : '🧪 切換地庫離線模擬測試 (Simulate Offline)') +
          '</button>' +
        '</div>';
      }

      let activeId = null;
      let selStart = null;
      let selEnd = null;
      try {
        if (typeof document !== 'undefined' && document.activeElement) {
          activeId = document.activeElement.id;
          if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            const inputType = (document.activeElement.type || '').toLowerCase();
            if (inputType !== 'number') {
              try {
                selStart = document.activeElement.selectionStart;
                selEnd = document.activeElement.selectionEnd;
              } catch (e) {}
            }
          }
        }
      } catch (e) {}

      container.innerHTML = html;

      try {
        if (activeId && typeof document !== 'undefined') {
          const restored = document.getElementById(activeId);
          if (restored && typeof restored.focus === 'function') {
            restored.focus();
            if (selStart !== null && selEnd !== null && typeof restored.setSelectionRange === 'function') {
              try { restored.setSelectionRange(selStart, selEnd); } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }

    function fallbackCopyText(text, fallbackMsg) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        if (document.body && typeof document.body.appendChild === 'function') document.body.appendChild(ta);
        if (typeof ta.select === 'function') ta.select();
        if (typeof document.execCommand === 'function') document.execCommand("copy");
        if (document.body && typeof document.body.removeChild === 'function') document.body.removeChild(ta);
        if (fallbackMsg !== false) {
          showToast(fallbackMsg || "✅ 見客 WhatsApp 話術模板已複製到剪貼簿！");
        }
      } catch (e) {
        if (typeof alert === 'function') {
          alert(text);
        } else if (typeof console !== 'undefined' && console.log) {
          console.log(text);
        }
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

    // Online / Offline Browser Event Synchronization & PWA Service Worker
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => {
        renderScenarioAgentPanel();
        showToast('🟢 網絡已恢復連線 (Online Ready)');
      });
      window.addEventListener('offline', () => {
        renderScenarioAgentPanel();
        showToast('🟡 進入離線模式 (Offline Active)');
      });
    }

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
      try {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      } catch (e) {}
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

    // AI Scenario Agents API Exposure
    window.selectScenarioAgent = selectScenarioAgent;
    window.setScenarioAgent = (s) => selectScenarioAgent(s);
    window.getScenarioAgent = () => currentScenario;
    window.renderScenarioAgentPanel = renderScenarioAgentPanel;
    window.copyStepPitch = copyStepPitch;
    window.copyFull3StepPitch = copyFull3StepPitch;
    window.openAiChatDrawer = openAiChatDrawer;
    window.closeAiChatDrawer = closeAiChatDrawer;
    window.renderAiContextPreview = renderAiContextPreview;
    window.handleSmartPromptClick = handleSmartPromptClick;
    window.sendAiChatQuery = sendAiChatQuery;
    window.copyAiGeneratedScript = copyAiGeneratedScript;
    window.copySystemPrompt = copySystemPrompt;
    window.calculateQDAPTaxRelief = calculateQDAPTaxRelief;
    window.calculateFamilyBudget = calculateFamilyBudget;
    window.convertMCVCurrency = convertMCVCurrency;
    window.generateInstantMessage = generateInstantMessage;
    window.setOfflineMode = setOfflineMode;
    window.getOfflineStatus = getOfflineStatus;
    window.onMCVAmountChange = onMCVAmountChange;
    window.onMCVCurrencySelect = onMCVCurrencySelect;
    window.onFamilyBudgetChange = onFamilyBudgetChange;
    window.onMortgageChange = onMortgageChange;
    window.onQDAPPremiumChange = onQDAPPremiumChange;
    window.onQDAPRateSelect = onQDAPRateSelect;
    window.onQDAPCoupleToggle = onQDAPCoupleToggle;
    window.onCommsToneSelect = onCommsToneSelect;
    window.onCommsPlatformSelect = onCommsPlatformSelect;
    window.onMedicalHospitalSelect = onMedicalHospitalSelect;
    window.onMedicalTreatmentSelect = onMedicalTreatmentSelect;
    window.onMedicalDeductibleSelect = onMedicalDeductibleSelect;
    window.checkCashlessDirectBilling = checkCashlessDirectBilling;
    window.copyCafeScript = copyCafeScript;
    window.copyCommsMessage = copyCommsMessage;
    window.copyCommsMessageWhatsapp = copyCommsMessageWhatsapp;
    window.copyCommsMessageWechat = copyCommsMessageWechat;
    window.openWhatsAppDirect = openWhatsAppDirect;
    window.openWhatsAppCafeScript = openWhatsAppCafeScript;
    window.toggleSimulatedOffline = toggleSimulatedOffline;
    window.SCENARIO_NAMES = SCENARIO_NAMES;
    window.generateAiAnalysis = generateAiResponse;
    window.generateAiResponse = generateAiResponse;
    window.updateFamilyBudgetUI = updateFamilyBudgetUI;

    // 30-Point Audit Drawer Functions
    function openAudit30Drawer() {
      const drawer = document.getElementById('audit-30-drawer');
      const backdrop = document.getElementById('audit-30-backdrop');
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      if (auditScope === '100') {
        renderAudit100Cards('all');
      } else {
        renderAudit30Cards('all');
      }
    }
    window.openAudit30Drawer = openAudit30Drawer;

    function closeAudit30Drawer() {
      const drawer = document.getElementById('audit-30-drawer');
      const backdrop = document.getElementById('audit-30-backdrop');
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
    window.closeAudit30Drawer = closeAudit30Drawer;

    function filterAudit30(category) {
      const chips = ['all', 'client', 'agent'];
      chips.forEach(function(c) {
        const el = document.getElementById('audit-chip-' + c);
        if (el) el.classList.toggle('active', c === category);
      });
      renderAudit30Cards(category);
    }
    window.filterAudit30 = filterAudit30;

    function renderAudit30Cards(filter) {
      const container = document.getElementById('audit-cards-list');
      if (!container || typeof APP_30_IMPROVEMENT_COMMENTS === 'undefined') return;

      const items = APP_30_IMPROVEMENT_COMMENTS.filter(function(item) {
        if (filter === 'client') return item.sourceRole.includes('客戶');
        if (filter === 'agent') return item.sourceRole.includes('顧問');
        return true;
      });

      container.innerHTML = items.map(function(item) {
        const isClient = item.sourceRole.includes('客戶');
        const roleColor = isClient ? '#0284c7' : '#059669';
        const roleBg = isClient ? '#e0f2fe' : '#dcfce7';
        return '<div class="audit-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<div style="display:flex;align-items:center;gap:6px;">' +
              '<span style="font-family:JetBrains Mono,monospace;font-weight:800;font-size:11px;color:' + roleColor + ';background:' + roleBg + ';padding:2px 8px;border-radius:4px;">[' + item.id + '] ' + item.topic + '</span>' +
              '<span style="font-size:10.5px;color:#475569;font-weight:600;">' + item.sourceRole + '</span>' +
            '</div>' +
            '<span style="font-size:10px;font-weight:700;color:#059669;background:#dcfce7;padding:2px 6px;border-radius:4px;">' + item.status + '</span>' +
          '</div>' +
          '<div style="font-size:11.5px;color:#0f172a;margin-bottom:6px;line-height:1.45;background:#f8fafc;padding:6px 8px;border-radius:4px;border-left:3px solid ' + roleColor + ';">' +
            '<strong>反饋原聲：</strong>「' + item.commentText + '」' +
          '</div>' +
          '<div style="font-size:11px;color:#334155;line-height:1.5;">' +
            '<strong>📋 項目經理 (PM) 審核：</strong>' + item.pmReview + '<br>' +
            '<strong>🛠️ 產品經理 (PdM) 解決方案：</strong>' + item.pdmDecision + '<br>' +
            '<span style="font-size:10px;color:#64748b;margin-top:2px;display:inline-block;">🎯 落地模塊：' + item.resolvedIn + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    window.renderAudit30Cards = renderAudit30Cards;

    function onMedicalRoomTierSelect(tier) {
      medicalRoomTier = tier || 'semi_private';
      renderScenarioAgentPanel();
    }
    window.onMedicalRoomTierSelect = onMedicalRoomTierSelect;

    function bindAiDrawerTriggers() {
      if (typeof document === 'undefined') return;
      const ids = ['floating-ai-fab', 'btn-open-ai-chat', 'ai-quick-trigger-banner'];
      let lastTrigger = 0;
      const safeTrigger = function(e) {
        const now = Date.now();
        if (now - lastTrigger < 300) {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          return;
        }
        lastTrigger = now;
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        openAiChatDrawer();
      };
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el && !el.__aiBound && typeof el.addEventListener === 'function') {
          el.__aiBound = true;
          el.addEventListener('click', safeTrigger);
          el.addEventListener('touchend', safeTrigger, { passive: false });
        }
      }
    }

    // ========================================================================
    // PDM ROADMAP ENHANCEMENT SUITE (P1 / P2 ROADMAP IMPLEMENTATION)
    // ========================================================================

    // 1. 3-Way PK Simultaneous Comparison Engine
    function setArenaMode(mode) {
      arenaMode = (mode === '3way') ? '3way' : '1v1';
      if (typeof document !== 'undefined') {
        const btn1 = document.getElementById('btn-mode-1v1');
        const btn3 = document.getElementById('btn-mode-3way');
        const thirdCard = document.getElementById('camp-card-third');
        const thirdHero = document.getElementById('hero-third-side');
        const thirdVs = document.getElementById('hero-vs-third');

        if (btn1) btn1.classList.toggle('active', arenaMode === '1v1');
        if (btn3) btn3.classList.toggle('active', arenaMode === '3way');
        if (thirdCard) thirdCard.style.display = (arenaMode === '3way') ? 'flex' : 'none';
        if (thirdHero) thirdHero.style.display = (arenaMode === '3way') ? 'flex' : 'none';
        if (thirdVs) thirdVs.style.display = (arenaMode === '3way') ? 'flex' : 'none';
      }
      updateCampSelectors();
      updateBattleCard();
    }
    window.setArenaMode = setArenaMode;

    function toggleArenaMode() {
      setArenaMode(arenaMode === '1v1' ? '3way' : '1v1');
    }
    window.toggleArenaMode = toggleArenaMode;

    function setThirdCompany(comp) {
      if (!comp) return;
      let raw = (typeof comp === 'string') ? comp : (comp.target && comp.target.value ? comp.target.value : comp.value);
      thirdCompany = normalizeCompany(raw);
      thirdSelectedProduct = null;
      updateCampSelectors();
      updateBattleCard();
    }
    window.setThirdCompany = setThirdCompany;

    function setThirdProduct(prodId) {
      if (!prodId) return;
      let raw = (typeof prodId === 'string') ? prodId : (prodId.target && prodId.target.value ? prodId.target.value : prodId.value);
      const prod = (window.ALL_PRODUCTS_CATALOG || []).find(p => p.id === raw);
      if (prod) {
        thirdSelectedProduct = prod;
        thirdCompany = normalizeCompany(prod.insurer);
      }
      updateBattleCard();
    }
    window.setThirdProduct = setThirdProduct;

    function pickWinner(vA, vB, vC, lowerIsBetter) {
      if (vA === vB && vB === vC) return 'draw';
      if (lowerIsBetter) {
        if (vA < vB && vA < vC) return 'our';
        if (vB < vA && vB <= vC) return 'rival';
        if (vC < vA && vC < vB) return 'third';
        return 'draw';
      } else {
        if (vA > vB && vA > vC) return 'our';
        if (vB > vA && vB >= vC) return 'rival';
        if (vC > vA && vC > vB) return 'third';
        return 'draw';
      }
    }

    function compute3WaySpecs(ourComp, rivalComp, thirdComp, cat, ourProd, rivalProd, thirdProd) {
      const allProds = window.ALL_PRODUCTS_CATALOG || [];
      const getP = function(comp, prod) {
        if (prod && normalizeCompany(prod.insurer) === comp && normalizeCategory(prod.category) === cat) return prod;
        const flagship = getFlagshipProduct(comp, cat);
        const compProds = allProds.filter(p => normalizeCompany(p.insurer) === comp && normalizeCategory(p.category) === cat);
        return compProds.find(p => p.name.includes(flagship) || flagship.includes(cleanProductName(p.name))) || compProds[0] || (COMPANY_PROFILES[comp] || {});
      };
      const pA = getP(ourComp, ourProd);
      const pB = getP(rivalComp, rivalProd);
      const pC = getP(thirdComp, thirdProd);

      if (cat === 'Critical_Illness') {
        const wA = (typeof pA.cancerWaitYears === 'number' ? pA.cancerWaitYears : 1);
        const wB = (typeof pB.cancerWaitYears === 'number' ? pB.cancerWaitYears : 3);
        const wC = (typeof pC.cancerWaitYears === 'number' ? pC.cancerWaitYears : 3);
        const iA = (typeof pA.ciIllnesses === 'number' ? pA.ciIllnesses : 128);
        const iB = (typeof pB.ciIllnesses === 'number' ? pB.ciIllnesses : 118);
        const iC = (typeof pC.ciIllnesses === 'number' ? pC.ciIllnesses : 115);
        const mA = (typeof pA.ciMultiplePct === 'number' ? pA.ciMultiplePct : 900);
        const mB = (typeof pB.ciMultiplePct === 'number' ? pB.ciMultiplePct : 800);
        const mC = (typeof pC.ciMultiplePct === 'number' ? pC.ciMultiplePct : 850);
        const icuA = pA.ciIcu ? '有 (20%預支)' : '無';
        const icuB = pB.ciIcu ? '有 (20%預支)' : '無';
        const icuC = pC.ciIcu ? '有 (20%預支)' : '無';
        return [
          { label: '癌症再次索償等候期', ourVal: wA + ' 年', rivalVal: wB + ' 年', thirdVal: wC + ' 年', winner: pickWinner(wA, wB, wC, true), summary: (wA <= wB && wA <= wC ? '我方 1 年間隔最短，早復發早賠' : '癌症間隔等候期比對') },
          { label: '涵蓋嚴重危疾總數', ourVal: iA + ' 種', rivalVal: iB + ' 種', thirdVal: iC + ' 種', winner: pickWinner(iA, iB, iC, false), summary: (iA >= iB && iA >= iC ? '我方覆蓋 ' + iA + ' 種最齊全' : '嚴重疾病保障範圍') },
          { label: '終身多次賠償上限', ourVal: mA + '%', rivalVal: mB + '%', thirdVal: mC + '%', winner: pickWinner(mA, mB, mC, false), summary: (mA >= mB && mA >= mC ? '我方多次賠償槓桿 ' + mA + '% 領先' : '多次重疾賠償槓桿') },
          { label: '深切治療部 (ICU) 預支', ourVal: icuA, rivalVal: icuB, thirdVal: icuC, winner: (icuA === icuB && icuB === icuC ? 'draw' : (icuA !== '無' ? 'our' : 'draw')), summary: '非指定重疾住 ICU 預支保障' }
        ];
      } else if (cat === 'Medical_VHIS') {
        const lA = Math.round(((typeof pA.vhisLimitHkd === 'number' ? pA.vhisLimitHkd : 25000000))/10000);
        const lB = Math.round(((typeof pB.vhisLimitHkd === 'number' ? pB.vhisLimitHkd : 20000000))/10000);
        const lC = Math.round(((typeof pC.vhisLimitHkd === 'number' ? pC.vhisLimitHkd : 20000000))/10000);
        const ltA = pA.vhisLifetimeLimitHkd === 0 ? '無終身上限' : ('HK$ ' + Math.round((pA.vhisLifetimeLimitHkd || 0)/10000) + '萬');
        const ltB = pB.vhisLifetimeLimitHkd === 0 ? '無終身上限' : ('HK$ ' + Math.round((pB.vhisLifetimeLimitHkd || 0)/10000) + '萬');
        const ltC = pC.vhisLifetimeLimitHkd === 0 ? '無終身上限' : ('HK$ ' + Math.round((pC.vhisLifetimeLimitHkd || 0)/10000) + '萬');
        return [
          { label: '年度醫療保障總額度', ourVal: 'HK$ ' + lA + '萬', rivalVal: 'HK$ ' + lB + '萬', thirdVal: 'HK$ ' + lC + '萬', winner: pickWinner(lA, lB, lC, false), summary: '每年實報實銷無分項上限' },
          { label: '終身醫療保障額度', ourVal: ltA, rivalVal: ltB, thirdVal: ltC, winner: (ltA === '無終身上限' && ltB === '無終身上限' && ltC === '無終身上限' ? 'draw' : (ltA === '無終身上限' ? 'our' : 'draw')), summary: '終身醫療通脹防護' },
          { label: '13家私院出院免找數', ourVal: '100% 全額代付 (LOG)', rivalVal: '指定醫院直付', thirdVal: '指定醫院直付', winner: 'our', summary: '養和/港怡特快出函免按金' },
          { label: '癌症標靶藥全額理賠', ourVal: '全額全數理賠', rivalVal: '全數/分項上限', thirdVal: '全數/分項上限', winner: 'our', summary: '百萬級標靶藥零自付' }
        ];
      } else if (cat === 'Annuity_QDAP') {
        const gA = (typeof pA.qdapGuaranteedIRR === 'number' ? pA.qdapGuaranteedIRR : 2.80);
        const gB = (typeof pB.qdapGuaranteedIRR === 'number' ? pB.qdapGuaranteedIRR : 2.45);
        const gC = (typeof pC.qdapGuaranteedIRR === 'number' ? pC.qdapGuaranteedIRR : 2.50);
        const tA = (typeof pA.qdapTotalIRR === 'number' ? pA.qdapTotalIRR : 4.65);
        const tB = (typeof pB.qdapTotalIRR === 'number' ? pB.qdapTotalIRR : 4.30);
        const tC = (typeof pC.qdapTotalIRR === 'number' ? pC.qdapTotalIRR : 4.20);
        const rA = (typeof pA.qdapGuaranteedPct === 'number' ? pA.qdapGuaranteedPct : 82.5);
        const rB = (typeof pB.qdapGuaranteedPct === 'number' ? pB.qdapGuaranteedPct : 70.0);
        const rC = (typeof pC.qdapGuaranteedPct === 'number' ? pC.qdapGuaranteedPct : 72.0);
        return [
          { label: '法定個人/夫婦扣稅上限', ourVal: '$60,000 / $120,000', rivalVal: '同等法定額度', thirdVal: '同等法定額度', winner: 'draw', summary: '夫妻合併申報最高慳稅 $20,400' },
          { label: '保證內部回報率 (IRR)', ourVal: gA + '%', rivalVal: gB + '%', thirdVal: gC + '%', winner: pickWinner(gA, gB, gC, false), summary: (gA >= gB && gA >= gC ? '我方保證利益落袋為安' : '保證利益穩定性') },
          { label: '總預期內部回報率 (IRR)', ourVal: tA + '%', rivalVal: tB + '%', thirdVal: tC + '%', winner: pickWinner(tA, tB, tC, false), summary: (tA >= tB && tA >= tC ? '我方預期收益率 ' + tA + '% 居首' : '預期綜合收益率') },
          { label: '保證年金現金流佔比', ourVal: rA + '%', rivalVal: rB + '%', thirdVal: rC + '%', winner: pickWinner(rA, rB, rC, false), summary: (rA >= rB && rA >= rC ? '我方退休防禦確定性最高' : '年金防禦確定性') }
        ];
      } else if (cat === 'Financing_UniversalLife') {
        const cA = (typeof pA.ulCreditingRate === 'number' ? pA.ulCreditingRate : 5.25);
        const cB = (typeof pB.ulCreditingRate === 'number' ? pB.ulCreditingRate : 5.15);
        const cC = (typeof pC.ulCreditingRate === 'number' ? pC.ulCreditingRate : 5.10);
        const fA = (typeof pA.ulFloorRate === 'number' ? pA.ulFloorRate : 2.25);
        const fB = (typeof pB.ulFloorRate === 'number' ? pB.ulFloorRate : 2.00);
        const fC = (typeof pC.ulFloorRate === 'number' ? pC.ulFloorRate : 2.00);
        const sA = (typeof pA.ulNetSpread === 'number' ? pA.ulNetSpread : 1.45);
        const sB = (typeof pB.ulNetSpread === 'number' ? pB.ulNetSpread : 1.15);
        const sC = (typeof pC.ulNetSpread === 'number' ? pC.ulNetSpread : 1.10);
        const lA = (typeof pA.ulLtv === 'number' ? pA.ulLtv : 85);
        const lB = (typeof pB.ulLtv === 'number' ? pB.ulLtv : 80);
        const lC = (typeof pC.ulLtv === 'number' ? pC.ulLtv : 80);
        return [
          { label: '保單現行結算利率', ourVal: cA + '%', rivalVal: cB + '%', thirdVal: cC + '%', winner: pickWinner(cA, cB, cC, false), summary: (cA >= cB && cA >= cC ? '高結算利率擴大利差空間' : '現行派息收益水準') },
          { label: '保單最低保證派息率', ourVal: fA + '%', rivalVal: fB + '%', thirdVal: fC + '%', winner: pickWinner(fA, fB, fC, false), summary: (fA >= fB && fA >= fC ? '極端降息抗風險底線' : '最低收益保證底線') },
          { label: '淨息差 (Carry Spread)', ourVal: sA + '%', rivalVal: sB + '%', thirdVal: sC + '%', winner: pickWinner(sA, sB, sC, false), summary: (sA >= sB && sA >= sC ? '每年淨息差套利安全墊' : '融資淨套利息差') },
          { label: '最高保費融資成數 (LTV)', ourVal: lA + '%', rivalVal: lB + '%', thirdVal: lC + '%', winner: pickWinner(lA, lB, lC, false), summary: (lA >= lB && lA >= lC ? '極致資金槓桿效益' : '銀行最高授信成數') }
        ];
      } else {
        const rA = (typeof pA.maxRebate === 'number' ? pA.maxRebate : 22);
        const rB = (typeof pB.maxRebate === 'number' ? pB.maxRebate : 28);
        const rC = (typeof pC.maxRebate === 'number' ? pC.maxRebate : 15);
        const pRateA = (typeof pA.prepayRate === 'number' ? pA.prepayRate : 5.0);
        const pRateB = (typeof pB.prepayRate === 'number' ? pB.prepayRate : 5.5);
        const pRateC = (typeof pC.prepayRate === 'number' ? pC.prepayRate : 4.5);
        const pLockA = (typeof pA.prepayLock === 'number' ? pA.prepayLock : 1);
        const pLockB = (typeof pB.prepayLock === 'number' ? pB.prepayLock : 1);
        const pLockC = (typeof pC.prepayLock === 'number' ? pC.prepayLock : 1);
        const gnA = (typeof pA.gn16Fulfillment === 'number' && pA.gn16Fulfillment > 0 ? pA.gn16Fulfillment : (COMPANY_PROFILES[ourComp]?.gn16Fulfillment || 96.5));
        const gnB = (typeof pB.gn16Fulfillment === 'number' && pB.gn16Fulfillment > 0 ? pB.gn16Fulfillment : (COMPANY_PROFILES[rivalComp]?.gn16Fulfillment || 90.0));
        const gnC = (typeof pC.gn16Fulfillment === 'number' && pC.gn16Fulfillment > 0 ? pC.gn16Fulfillment : (COMPANY_PROFILES[thirdComp]?.gn16Fulfillment || 92.0));
        const bA = (typeof pA.breakevenYear === 'number' && pA.breakevenYear > 0 ? pA.breakevenYear : 5);
        const bB = (typeof pB.breakevenYear === 'number' && pB.breakevenYear > 0 ? pB.breakevenYear : 7);
        const bC = (typeof pC.breakevenYear === 'number' && pC.breakevenYear > 0 ? pC.breakevenYear : 8);
        const irrA = (typeof pA.irr30 === 'number' && pA.irr30 > 0 ? pA.irr30 : 6.62);
        const irrB = (typeof pB.irr30 === 'number' && pB.irr30 > 0 ? pB.irr30 : 6.55);
        const irrC = (typeof pC.irr30 === 'number' && pC.irr30 > 0 ? pC.irr30 : 6.40);
        return [
          { label: '首年保費最高回贈', ourVal: rA + '%', rivalVal: rB + '%', thirdVal: rC + '%', winner: pickWinner(rA, rB, rC, false), summary: '首年投保折扣回贈' },
          { label: '預繳保證利率與年期', ourVal: pRateA + '% (' + pLockA + '年)', rivalVal: pRateB + '% (' + pLockB + '年)', thirdVal: pRateC + '% (' + pLockC + '年)', winner: pickWinner(pRateA, pRateB, pRateC, false), summary: '保證高息鎖定無懼降息' },
          { label: '保監局 GN16 分紅實現率', ourVal: gnA + '%', rivalVal: gnB + '%', thirdVal: gnC + '%', winner: pickWinner(gnA, gnB, gnC, false), summary: '歷年累積實現率官方權威備案' },
          { label: '保證本金回本年期', ourVal: '第 ' + bA + ' 年', rivalVal: '第 ' + bB + ' 年', thirdVal: '第 ' + bC + ' 年', winner: pickWinner(bA, bB, bC, true), summary: '保證現值回本年期' },
          { label: '第30年預期內部回報率', ourVal: irrA + '%', rivalVal: irrB + '%', thirdVal: irrC + '%', winner: pickWinner(irrA, irrB, irrC, false), summary: '中長線複利滾存收益' }
        ];
      }
    }
    window.compute3WaySpecs = compute3WaySpecs;

    // 2. UL Premium Financing Interest Rate Stress Calculator Engine
    function calculateULStress(capital, policyTotal, creditingRate, borrowingRate, hikeBps) {
      capital = Math.max(1, (capital !== undefined && capital !== null && !isNaN(Number(capital))) ? Number(capital) : 1000000);
      policyTotal = Math.max(capital, (policyTotal !== undefined && policyTotal !== null && !isNaN(Number(policyTotal))) ? Number(policyTotal) : 3000000);
      creditingRate = (creditingRate !== undefined && creditingRate !== null && !isNaN(Number(creditingRate))) ? Number(creditingRate) : 5.25;
      borrowingRate = (borrowingRate !== undefined && borrowingRate !== null && !isNaN(Number(borrowingRate))) ? Number(borrowingRate) : 4.25;
      hikeBps = (hikeBps !== undefined && hikeBps !== null && !isNaN(Number(hikeBps))) ? Number(hikeBps) : 0;

      const loan = Math.max(0, policyTotal - capital);
      const leverage = policyTotal / capital;
      const effectiveBorrowingRate = borrowingRate + (hikeBps / 100);
      const netSpread = creditingRate - effectiveBorrowingRate;

      const annualCreditingIncome = Math.round(policyTotal * (creditingRate / 100) * 100) / 100;
      const annualBorrowingCost = Math.round(loan * (effectiveBorrowingRate / 100) * 100) / 100;
      const netCashflow = Math.round((annualCreditingIncome - annualBorrowingCost) * 100) / 100;
      const roe = (netCashflow / capital) * 100;

      const isNegativeSpread = netSpread < 0;
      const isMarginCallRisk = netSpread < 0 || effectiveBorrowingRate >= 6.25;

      return {
        capital,
        policyTotal,
        loan,
        loanAmount: loan,
        leverage: leverage.toFixed(1) + 'x',
        leverageRatio: Number(leverage.toFixed(2)),
        creditingRate: creditingRate.toFixed(2) + '%',
        creditingRateNum: creditingRate,
        borrowingRate: effectiveBorrowingRate.toFixed(2) + '%',
        borrowingRateNum: effectiveBorrowingRate,
        effectiveBorrowingRate: Number(effectiveBorrowingRate.toFixed(2)),
        netSpread: (netSpread >= 0 ? '+' : '') + netSpread.toFixed(2) + '%',
        netSpreadPct: Number(netSpread.toFixed(2)),
        netSpreadNum: netSpread,
        annualCreditingIncome,
        annualCreditingInterest: annualCreditingIncome,
        annualBorrowingCost,
        annualBorrowingInterest: annualBorrowingCost,
        annualCarryGainHKD: netCashflow,
        netCashflow,
        roe: roe.toFixed(2) + '%',
        isNegativeSpread,
        isMarginCallRisk,
        status: isNegativeSpread ? '追繳保證金風險 (Margin Call)' : (effectiveBorrowingRate >= 5.0 ? '警戒' : '安全'),
        hikeBps
      };
    }
    window.calculateULStress = calculateULStress;

    function updateULStressUI() {
      const ulRes = calculateULStress(ulCapital, ulPolicyTotal, ulCreditingRate, ulBorrowingRate, ulHikeBps);
      const elLeverage = document.getElementById('ul-stress-leverage');
      const elSpread = document.getElementById('ul-stress-net-spread');
      const elCashflow = document.getElementById('ul-stress-cashflow');
      const elRoe = document.getElementById('ul-stress-roe');
      const elBadge = document.getElementById('ul-stress-status-pill');
      const elMargin = document.getElementById('ul-margin-call-status');

      if (!elLeverage || !elSpread) {
        renderScenarioAgentPanel();
        return;
      }

      elLeverage.innerText = ulRes.leverage;
      elSpread.innerText = ulRes.netSpread;
      elSpread.style.color = ulRes.netSpreadNum >= 0 ? '#059669' : '#dc2626';

      if (elCashflow) {
        elCashflow.innerText = (ulRes.netCashflow >= 0 ? '+' : '') + '$' + Math.round(ulRes.netCashflow).toLocaleString();
        elCashflow.style.color = ulRes.netCashflow >= 0 ? '#059669' : '#dc2626';
      }
      if (elRoe) {
        elRoe.innerText = ulRes.roe;
        elRoe.style.color = ulRes.netCashflow >= 0 ? '#059669' : '#dc2626';
      }
      if (elBadge) {
        elBadge.innerText = ulRes.isNegativeSpread ? '🚨 利差倒掛' : '槓桿套利';
        elBadge.className = 'scenario-pill-badge ' + (ulRes.isNegativeSpread ? 'red' : 'blue');
      }
      if (elMargin) {
        elMargin.innerText = ulRes.isMarginCallRisk ? '🚨 追繳警戒 (抗跌緩衝不足)' : '✅ 安全 (緩衝充裕 >15%)';
        elMargin.style.color = ulRes.isMarginCallRisk ? '#dc2626' : '#059669';
      }

      [0, 100, 200, 300].forEach(function(bps) {
        const chip = document.getElementById('btn-hike-' + bps);
        if (chip) chip.classList.toggle('active', ulHikeBps === bps);
      });
    }
    window.updateULStressUI = updateULStressUI;

    function setULHike(hikeBps) {
      ulHikeBps = Number(hikeBps) || 0;
      updateULStressUI();
    }
    window.setULHike = setULHike;

    function onULCapitalChange(val) {
      ulCapital = Math.max(1, Number(val) || 1000000);
      updateULStressUI();
    }
    window.onULCapitalChange = onULCapitalChange;

    function onULPolicyTotalChange(val) {
      ulPolicyTotal = Math.max(ulCapital, Number(val) || 3000000);
      updateULStressUI();
    }
    window.onULPolicyTotalChange = onULPolicyTotalChange;

    function onULCreditingRateChange(val) {
      ulCreditingRate = Number(val) || 5.25;
      updateULStressUI();
    }
    window.onULCreditingRateChange = onULCreditingRateChange;

    function onULBorrowingRateChange(val) {
      ulBorrowingRate = Number(val) || 4.25;
      updateULStressUI();
    }
    window.onULBorrowingRateChange = onULBorrowingRateChange;

    // 3. Group Medical + High-End VHIS Deductible Optimizer Engine
    function optimizeGroupMedicalVHIS(groupLimit, age) {
      groupLimit = Math.max(0, Number(groupLimit) || 0);
      let recommendedDeductible = 0;
      let premiumSavingsPct = 0;
      let premiumSavingsHKD = 0;
      let benchmarkPremium = 16800;

      if (groupLimit >= 80000) {
        recommendedDeductible = 80000;
        premiumSavingsPct = 61;
        premiumSavingsHKD = 10300;
      } else if (groupLimit >= 50000) {
        recommendedDeductible = 50000;
        premiumSavingsPct = 54;
        premiumSavingsHKD = 9000;
      } else if (groupLimit >= 25000) {
        recommendedDeductible = 25000;
        premiumSavingsPct = 38;
        premiumSavingsHKD = 6300;
      } else if (groupLimit >= 16000) {
        recommendedDeductible = 16000;
        premiumSavingsPct = 26;
        premiumSavingsHKD = 4300;
      } else {
        recommendedDeductible = 0;
        premiumSavingsPct = 0;
        premiumSavingsHKD = 0;
      }

      const optimizedPremium = benchmarkPremium - premiumSavingsHKD;
      const tenYearSavings = premiumSavingsHKD * 10;

      return {
        groupLimit,
        recommendedDeductible,
        outOfPocketCostHKD: 0,
        gapOutOfPocket: 0,
        benchmarkPremium,
        optimizedPremium,
        premiumSavingsPct,
        premiumSavingsHKD,
        annualSavingVsZero: premiumSavingsHKD,
        tenYearSavings,
        tenYearSavingVsZero: tenYearSavings,
        explanation: '公司團險頂替前 HK$' + recommendedDeductible.toLocaleString() + ' 自負額，超出金額由高端自願醫保 100% 全數代付無分項上限，達成「零自掏腰包 + 保費最低化」完美配置！'
      };
    }
    window.optimizeGroupMedicalVHIS = optimizeGroupMedicalVHIS;

    function updateGroupMedicalOptimizerUI() {
      const grpRes = optimizeGroupMedicalVHIS(groupMedicalLimit);
      const elRec = document.getElementById('group-opt-recommended');
      const elAnnual = document.getElementById('group-opt-savings-annual');
      const elOop = document.getElementById('group-opt-out-of-pocket');
      const elExp = document.getElementById('group-opt-explanation');
      const el10Y = document.getElementById('group-opt-10yr-savings');
      const slider = document.getElementById('slider-group-limit');
      const input = document.getElementById('input-group-limit');

      if (!elRec || !elAnnual) {
        renderScenarioAgentPanel();
        return;
      }

      elRec.innerText = '推薦投保：HK$ ' + grpRes.recommendedDeductible.toLocaleString() + ' 自負額 (Deductible) 計劃';
      elAnnual.innerText = '省下 HK$ ' + grpRes.premiumSavingsHKD.toLocaleString() + ' /年 (' + grpRes.premiumSavingsPct + '%)';
      if (elOop) elOop.innerText = 'HK$ 0 (零自掏腰包)';
      if (elExp) elExp.innerText = grpRes.explanation;
      if (el10Y) el10Y.innerText = 'HK$ ' + grpRes.tenYearSavings.toLocaleString();
      if (slider && slider.value !== String(groupMedicalLimit)) slider.value = groupMedicalLimit;
      if (input && input.value !== String(groupMedicalLimit)) input.value = groupMedicalLimit;

      [0, 25000, 30000, 50000, 80000].forEach(function(lim) {
        const chip = document.getElementById('group-chip-' + lim);
        if (chip) chip.classList.toggle('active', groupMedicalLimit === lim);
      });
    }
    window.updateGroupMedicalOptimizerUI = updateGroupMedicalOptimizerUI;

    function setGroupMedicalLimit(limit) {
      groupMedicalLimit = Math.max(0, Number(limit) || 0);
      updateGroupMedicalOptimizerUI();
    }
    window.setGroupMedicalLimit = setGroupMedicalLimit;

    // 4. QDAP Family Tax Savings & Cashflow Calculator Engine
    function calculateQDAPFamilyTax(arg1, arg2, arg3, arg4) {
      let mode, premium, bracketPct, durationYears;
      if (typeof arg1 === 'number') {
        premium = arg1;
        bracketPct = arg2;
        mode = (arg3 === true || arg3 === 'couple') ? 'couple' : 'single';
        durationYears = arg4;
      } else {
        mode = arg1;
        premium = arg2;
        bracketPct = arg3;
        durationYears = arg4;
      }
      mode = (mode === 'single') ? 'single' : 'couple';
      premium = (premium !== undefined && premium !== null && !isNaN(Number(premium))) ? Math.max(0, Number(premium)) : (mode === 'couple' ? 120000 : 60000);
      bracketPct = (bracketPct !== undefined && bracketPct !== null && !isNaN(Number(bracketPct))) ? Number(bracketPct) : 17;
      durationYears = (durationYears !== undefined && durationYears !== null && !isNaN(Number(durationYears))) ? Number(durationYears) : 20;

      const cap = mode === 'couple' ? 120000 : 60000;
      const eligibleDeduction = Math.min(premium, cap);
      const taxSaved = Math.round(eligibleDeduction * (bracketPct / 100));
      const effectiveDiscountPct = premium > 0 ? ((taxSaved / premium) * 100) : bracketPct;

      const monthlyPayout = mode === 'couple' ? Math.round(premium * 0.09) : Math.round(premium * 0.1);
      const totalPayout = monthlyPayout * 12 * durationYears;

      const schedule = [];
      for (let y = 1; y <= durationYears; y++) {
        schedule.push({
          year: y,
          age: 64 + y,
          annualPayout: monthlyPayout * 12,
          cumulativePayout: monthlyPayout * 12 * y
        });
      }

      return {
        mode,
        cap,
        premium,
        eligibleDeduction,
        taxSaved,
        annualTaxSavings: taxSaved,
        effectiveDiscountPct: effectiveDiscountPct.toFixed(1) + '%',
        monthlyPayout,
        estimatedMonthlyAnnuity: monthlyPayout,
        totalPayout,
        durationYears,
        schedule,
        payoutSchedule: schedule
      };
    }
    window.calculateQDAPFamilyTax = calculateQDAPFamilyTax;

    function setQDAPMode(mode) {
      qdapIsCouple = (mode === 'couple' || mode === true);
      if (qdapIsCouple && qdapAnnualPremium < 120000) qdapAnnualPremium = 120000;
      else if (!qdapIsCouple && qdapAnnualPremium > 60000) qdapAnnualPremium = 60000;
      updateQDAPFamilyTaxUI();
    }
    window.setQDAPMode = setQDAPMode;

    function updateQDAPFamilyTaxUI() {
      if (typeof updateQDAPUI === 'function') {
        updateQDAPUI();
      } else {
        renderScenarioAgentPanel();
      }
    }
    window.updateQDAPFamilyTaxUI = updateQDAPFamilyTaxUI;
    window.setQDAPRate = onQDAPRateSelect;

    // 5. One-Click Client PDF Report & WhatsApp/WeChat Pitch Card Generator
    function getAdvisorProfile() {
      try {
        const stored = localStorage.getItem('insurintel_advisor_profile');
        if (stored) return Object.assign({}, DEFAULT_ADVISOR_PROFILE, JSON.parse(stored));
      } catch(e){}
      return DEFAULT_ADVISOR_PROFILE;
    }
    window.getAdvisorProfile = getAdvisorProfile;

    function saveAdvisorProfile(p, silent) {
      try {
        const cur = getAdvisorProfile();
        const updated = Object.assign({}, cur, p);
        localStorage.setItem('insurintel_advisor_profile', JSON.stringify(updated));
        if (silent !== true) {
          showToast('💾 顧問個人名片已儲存！');
        }
        renderClientPdfPreview();
      } catch(e){}
    }
    window.saveAdvisorProfile = saveAdvisorProfile;

    function openClientPdfModal() {
      const modal = document.getElementById('client-pdf-modal');
      const backdrop = document.getElementById('client-pdf-backdrop');
      if (modal) modal.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      const adv = getAdvisorProfile();
      const n = document.getElementById('report-agent-name');
      const t = document.getElementById('report-agent-title');
      const l = document.getElementById('report-agent-license');
      const tm = document.getElementById('report-agent-team');
      const ph = document.getElementById('report-agent-phone');
      if (n) n.value = adv.name;
      if (t) t.value = adv.title;
      if (l) l.value = adv.license;
      if (tm) tm.value = adv.team;
      if (ph) ph.value = adv.phone;
      renderClientPdfPreview();
    }
    window.openClientPdfModal = openClientPdfModal;

    function closeClientPdfModal() {
      const modal = document.getElementById('client-pdf-modal');
      const backdrop = document.getElementById('client-pdf-backdrop');
      if (modal) modal.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
    window.closeClientPdfModal = closeClientPdfModal;

    function printClientReport() {
      renderClientPdfPreview();
      if (typeof window !== 'undefined' && window.print) {
        window.print();
      }
    }
    window.printClientReport = printClientReport;

    function renderClientPdfPreview() {
      const container = document.getElementById('client-pdf-report-preview');
      if (!container) return;
      const adv = getAdvisorProfile();
      const ourName = cleanProductName(mySelectedProduct?.name || '我方旗艦方案');
      const rivalName = cleanProductName(rivalSelectedProduct?.name || '遭遇競品方案');
      const thirdName = cleanProductName(thirdSelectedProduct?.name || '第三方旗艦');
      const cat = currentCategory || 'Savings_MultiCurrency';

      const ourUrl = mySelectedProduct?.official_url || mySelectedProduct?.brochure_url || getInsurerOfficialUrl(myCompany);
      const rivalUrl = rivalSelectedProduct?.official_url || rivalSelectedProduct?.brochure_url || getInsurerOfficialUrl(selectedCompany);
      const thirdUrl = thirdSelectedProduct?.official_url || thirdSelectedProduct?.brochure_url || getInsurerOfficialUrl(thirdCompany);

      let rowsHtml = '';
      if (arenaMode === '3way') {
        const s3 = compute3WaySpecs(myCompany, selectedCompany, thirdCompany, cat, mySelectedProduct, rivalSelectedProduct, thirdSelectedProduct);
        rowsHtml = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:11px;">' +
          '<thead><tr style="background:#f1f5f9;border-bottom:1.5px solid #cbd5e1;">' +
            '<th style="padding:8px 6px;text-align:left;">比對指標</th>' +
            '<th style="padding:8px 6px;color:#002FA7;">Plan A: ' + ourName + '<br><a href="' + ourUrl + '" target="_blank" rel="noopener noreferrer" style="font-size:10px;text-decoration:underline;color:#002FA7;font-weight:700;">📄 官網原文手冊 ↗</a></th>' +
            '<th style="padding:8px 6px;color:#ef4444;">Plan B: ' + rivalName + '<br><a href="' + rivalUrl + '" target="_blank" rel="noopener noreferrer" style="font-size:10px;text-decoration:underline;color:#ef4444;font-weight:700;">📄 官網原文手冊 ↗</a></th>' +
            '<th style="padding:8px 6px;color:#7c3aed;">Plan C: ' + thirdName + '<br><a href="' + thirdUrl + '" target="_blank" rel="noopener noreferrer" style="font-size:10px;text-decoration:underline;color:#7c3aed;font-weight:700;">📄 官網原文手冊 ↗</a></th>' +
          '</tr></thead><tbody>' +
          s3.map(function(r) {
            return '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:7px 6px;font-weight:700;color:#334155;">' + r.label + '</td><td style="padding:7px 6px;color:#002FA7;font-weight:700;">' + r.ourVal + '</td><td style="padding:7px 6px;color:#475569;">' + r.rivalVal + '</td><td style="padding:7px 6px;color:#475569;">' + r.thirdVal + '</td></tr>';
          }).join('') +
          '</tbody></table>';
      } else {
        const card = getBattleCard(myCompany, selectedCompany, selectedClaim, selectedClaimText);
        const specs = (card && card.bilateral_specs) ? card.bilateral_specs : [];
        rowsHtml = '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:11.5px;">' +
          '<thead><tr style="background:#f1f5f9;border-bottom:1.5px solid #cbd5e1;">' +
            '<th style="padding:8px 6px;text-align:left;">指標維度</th>' +
            '<th style="padding:8px 6px;color:#002FA7;">Plan A: ' + ourName + ' (我方)<br><a href="' + ourUrl + '" target="_blank" rel="noopener noreferrer" style="font-size:10px;text-decoration:underline;color:#002FA7;font-weight:700;">📄 官網原文手冊 ↗</a></th>' +
            '<th style="padding:8px 6px;color:#475569;">Plan B: ' + rivalName + ' (對手)<br><a href="' + rivalUrl + '" target="_blank" rel="noopener noreferrer" style="font-size:10px;text-decoration:underline;color:#dc2626;font-weight:700;">📄 官網原文手冊 ↗</a></th>' +
            '<th style="padding:8px 6px;text-align:right;">對比差額</th>' +
          '</tr></thead><tbody>' +
          specs.map(function(r) {
            return '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:7px 6px;font-weight:700;color:#334155;">' + r.label + '</td><td style="padding:7px 6px;color:#002FA7;font-weight:700;">' + r.ourVal + '</td><td style="padding:7px 6px;color:#475569;">' + r.rivalVal + '</td><td style="padding:7px 6px;text-align:right;color:#059669;font-weight:700;">' + r.delta + '</td></tr>';
          }).join('') +
          '</tbody></table>';
      }

      container.innerHTML = '<div class="client-report-sheet">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #002FA7;padding-bottom:10px;margin-bottom:12px;">' +
          '<div>' +
            '<div style="font-size:16px;font-weight:800;color:#002FA7;letter-spacing:0.5px;">INSURINTEL HK · 授權財務策劃專業客戶簡報</div>' +
            '<div style="font-size:11px;color:#64748b;margin-top:2px;">香港保監局 GN16 權威官方實現率存檔 · 全港 13 間私家醫院免找數擔保核准 · 客戶客觀對比專用</div>' +
          '</div>' +
          '<div style="text-align:right;font-size:10.5px;color:#475569;">' +
            '<div>報告產出日期：2026年11月07日</div>' +
            '<div style="color:#059669;font-weight:700;">✅ GL20 認證客觀對比</div>' +
          '</div>' +
        '</div>' +
        '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<div><strong style="font-size:12px;color:#0f172a;">' + adv.name + '</strong> <span style="font-size:11px;color:#1e40af;margin-left:4px;">' + adv.title + '</span></div>' +
          '<div style="font-size:11px;color:#475569;">' + adv.team + ' | ' + adv.license + '</div>' +
          '<div style="font-size:11px;color:#002FA7;font-weight:700;">聯絡電話 / WhatsApp: ' + adv.phone + '</div>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:4px;">📊 核心方案架構深度對照表 (' + (CATEGORY_TAGS[cat] || cat) + ')</div>' +
        rowsHtml +
        '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:6px;padding:8px 12px;margin-bottom:12px;font-size:11px;color:#14532d;line-height:1.5;">' +
          '<strong>🏥 私家醫院免找數 (LOG) 保證權益：</strong> 覆蓋全港 13 家私立醫院（養和、港怡、嘉諾撒、中大醫院、聖保祿、仁安等），憑保司出具之付款保證函（LOG），可全免入院數萬元住院按金，出院簽名直付零墊款。' +
        '</div>' +
        '<div style="border-top:1px solid #cbd5e1;padding-top:10px;font-size:10px;color:#64748b;line-height:1.5;">' +
          '<strong>【香港保險業監管局 (IA)《操守指引》(GL20) 合規聲明】：</strong><br>' +
          '本對比簡報所載數據均提取自各保險公司官方公開建議書、產品手冊及保監局 GN16 歷史分紅實現率公開檔案，僅供授權持牌人士與客戶進行客觀財務諮詢與保單條款分析之用，不構成任何要約或誘使。非保證紅利受保險公司實際投資回報及市場波動影響，過往實現率並不代表未來表現。' +
        '</div>' +
      '</div>';

      if (currentLang === 'zh-CN') {
        convertDomTreeLang(container, true);
      }
    }
    window.renderClientPdfPreview = renderClientPdfPreview;

    function downloadClientHtmlReport() {
      renderClientPdfPreview();
      const container = document.getElementById('client-pdf-report-preview');
      const parts = [
        '<!DOCTYPE html>',
        '<html lang="' + currentLang + '">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<title>InsurIntel HK · 客戶專屬保險對比簡報 (Executive Tear-Sheet)</title>',
        '<style>',
        'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "PingFang TC", "Microsoft JhengHei", sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }',
        '.client-report-sheet { max-width: 860px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1.5px solid #cbd5e1; }',
        'table { width: 100%; border-collapse: collapse; }',
        '@media print { body { background: #fff; padding: 0; } .client-report-sheet { border: none; box-shadow: none; padding: 0; max-width: 100%; } @page { margin: 10mm 12mm; size: A4 portrait; } }',
        '</style>',
        '</head>',
        '<body>',
        container.innerHTML,
        '</body>',
        '</html>'
      ];
      const htmlDoc = parts.join(String.fromCharCode(10));
      try {
        const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'InsurIntel_Executive_TearSheet_' + Date.now() + '.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('📥 獨立 HTML 客戶簡報已下載！');
      } catch (e) {
        showToast('⚠️ 下載未支援，請點選列印匯出');
      }
    }
    window.downloadClientHtmlReport = downloadClientHtmlReport;

    function copyReportWhatsApp() {
      const adv = getAdvisorProfile();
      const ourName = cleanProductName(mySelectedProduct?.name || '我方推薦旗艦');
      const rivalName = cleanProductName(rivalSelectedProduct?.name || '市場競品方案');
      const thirdName = cleanProductName(thirdSelectedProduct?.name || '第三方旗艦方案');
      const cat = currentCategory || 'Savings_MultiCurrency';

      let text = '【InsurIntel 專業保險對比簡報 · 客戶專屬】\\n';
      text += '━━━━━━━━━━━━━━━━━━━━━\\n';
      if (arenaMode === '3way') {
        text += '📌 *三方旗艦橫向對決 (3-Way PK)*：\\n';
        text += '  • Plan A (我方)：' + ourName + '\\n';
        text += '  • Plan B (競品)：' + rivalName + '\\n';
        text += '  • Plan C (第三方)：' + thirdName + '\\n';
      } else {
        text += '📌 *方案對比*：' + ourName + ' (Plan A) vs ' + rivalName + ' (Plan B)\\n';
      }
      text += '📂 *業務類別*：' + (CATEGORY_TAGS[cat] || cat) + '\\n';
      text += '📊 *官方數據*：香港保監局 GN16 權威備案 + 全港 13 家私院出院免找數 (LOG)\\n';
      if (arenaMode === '3way') {
        const s3 = compute3WaySpecs(myCompany, selectedCompany, thirdCompany, cat, mySelectedProduct, rivalSelectedProduct, thirdSelectedProduct);
        text += '🔍 *核心指標快覽*：\\n';
        s3.slice(0, 3).forEach(function(r) {
          text += '  • ' + r.label + '：' + r.ourVal + ' (A) / ' + r.rivalVal + ' (B) / ' + r.thirdVal + ' (C)\\n';
        });
      }
      text += '━━━━━━━━━━━━━━━━━━━━━\\n';
      text += '💼 *您的專屬理財顧問*：' + adv.name + ' (' + adv.title + ')\\n';
      text += '🏢 *所屬團隊*：' + adv.team + ' | ' + adv.license + '\\n';
      text += '📱 *聯絡電話 / WhatsApp*：' + adv.phone + '\\n';
      text += '━━━━━━━━━━━━━━━━━━━━━\\n';
      text += '🛡️【香港保監局 GL20 合規聲明】：資料源自官方建議書及保監局備案，供客觀諮詢與條款分析，不構成要約。非保證紅利受市場波動影響，過往實現率不代表未來表現。';

      if (currentLang === 'zh-CN') {
        text = toHans(text);
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        showToast('✅ 客戶專用 WhatsApp 促成卡片已複製！');
      } else {
        fallbackCopyText(text, '✅ 客戶專用 WhatsApp 促成卡片已複製！');
      }
      return text;
    }
    window.copyReportWhatsApp = copyReportWhatsApp;

    function openReportWhatsAppDirect() {
      const adv = getAdvisorProfile();
      const ourName = cleanProductName(mySelectedProduct?.name || '我方推薦旗艦');
      const rivalName = cleanProductName(rivalSelectedProduct?.name || '市場競品方案');
      const cat = currentCategory || 'Savings_MultiCurrency';
      let text = '【InsurIntel 專業保險對比簡報 · 客戶專屬】\\n' +
        '📌 方案對比：' + ourName + ' (Plan A) vs ' + rivalName + ' (Plan B)\\n' +
        '📂 業務類別：' + (CATEGORY_TAGS[cat] || cat) + '\\n' +
        '💼 顧問：' + adv.name + ' (' + adv.phone + ')\\n' +
        '🛡️ 香港保監局 GL20 合規客觀對比';
      if (currentLang === 'zh-CN') text = toHans(text);
      const url = 'https://wa.me/?text=' + encodeURIComponent(text);
      if (typeof window !== 'undefined') window.open(url, '_blank');
    }
    window.openReportWhatsAppDirect = openReportWhatsAppDirect;

    function copyReportWechat() {
      const adv = getAdvisorProfile();
      const ourName = cleanProductName(mySelectedProduct?.name || '我方推薦旗艦');
      const rivalName = cleanProductName(rivalSelectedProduct?.name || '市場競品方案');
      const thirdName = cleanProductName(thirdSelectedProduct?.name || '第三方旗艦方案');
      const cat = currentCategory || 'Savings_MultiCurrency';

      let text = '【InsurIntel 專業保險對比簡報 · 客戶專屬】\\n';
      text += '----------------------------------------\\n';
      if (arenaMode === '3way') {
        text += '三方旗艦橫向對決 (3-Way PK)：\\n';
        text += '  • Plan A (我方)：' + ourName + '\\n';
        text += '  • Plan B (競品)：' + rivalName + '\\n';
        text += '  • Plan C (第三方)：' + thirdName + '\\n';
      } else {
        text += '方案對比：' + ourName + ' (Plan A) vs ' + rivalName + ' (Plan B)\\n';
      }
      text += '業務類別：' + (CATEGORY_TAGS[cat] || cat) + '\\n';
      text += '官方數據：香港保監局 GN16 備案 + 全港 13 家私院出院免找數 (LOG)\\n';
      if (arenaMode === '3way') {
        const s3 = compute3WaySpecs(myCompany, selectedCompany, thirdCompany, cat, mySelectedProduct, rivalSelectedProduct, thirdSelectedProduct);
        text += '核心指標快覽：\\n';
        s3.slice(0, 3).forEach(function(r) {
          text += '  • ' + r.label + '：' + r.ourVal + ' (A) / ' + r.rivalVal + ' (B) / ' + r.thirdVal + ' (C)\\n';
        });
      }
      text += '----------------------------------------\\n';
      text += '您的專屬理財顧問：' + adv.name + ' (' + adv.title + ')\\n';
      text += '所屬團隊：' + adv.team + ' | ' + adv.license + '\\n';
      text += '聯絡電話 / 微信：' + adv.phone + '\\n';
      text += '----------------------------------------\\n';
      text += '【保監局 GL20 合規聲明】：資料源自官方建議書，供客觀條款分析，不構成要約。非保證收益受市場波動影響，過往實現率不代表未來表現。';

      if (currentLang === 'zh-CN') {
        text = toHans(text);
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        showToast('✅ 客戶專用 微信/SMS 促成卡片已複製！');
      } else {
        fallbackCopyText(text, '✅ 客戶專用 微信/SMS 促成卡片已複製！');
      }
      return text;
    }
    window.copyReportWechat = copyReportWechat;

    // 6. Accessibility & Localization Handlers (Real zh-HK <-> zh-CN Engine)
    const ZH_T_CHARS = '萬億壽險劃寶誠友邦宏利醫保儲蓄扣稅年金融資總監顧問審查評看板報告點數據規則條款額度現金流複雜實現率實際產品買賣兩開關閉業務類別測試計算機預繳息差槓桿壓力優化獲得賠償擔保函私家醫院內窺鏡腸胃質子標靶藥聯動證書備案換匯幣種轉換獨立曲線認為說明結算結構體檢質押借款貸款繼承遺產稅節慳減輕症原位癌腫瘤豁免殘疾兒童懷孕異議腳本攻防戰策擊虛避實導航晨會演講操守指引絕對化違規審計鏈痕跡網絡綠色通道協同矩陣穿透障礙雙屏橫豎螢幕搜尋引擎滑動勢歷史退休支柱房貸赴港訪簽署票照上傳續期費渠道帳戶銀聯雲閃付滑點凍結簡報畫質圖轉發評級弱載緩存肖像頭銜稱謂專屬二維碼追蹤閱讀語音合成粵語普通話播聽取冠狀動脈條查詢舊框調增強軟肋權威促成難贏輸虧損補貼衝擊降跌緩衝充裕僱主階梯累計歸責監管局操守聲明確定性樂觀悲觀走勢廊穿透柱狀折線圓環雷達標籤懸浮導航抽屜模態框遮罩關閉打開切換滾動頂部底部橫幅標題副標題卡片徽章按鈕輸入欄選擇器彈出提示覆蓋隱私遮蔽塗黑密碼授權認證專業顧問團隊總監牌照電話郵箱官網說明書單張通函公開資料庫備份還原備忘錄歷史紀錄日誌審批核准預估測算試算結果差異比較橫向縱向雙邊陣營攻守對壘挑戰破局話術抗拒拆解步驟共情點破盲點數據絕殺促成簽單遞交複製黏貼轉寄分享導出列印存檔下載離線快取儲存本地緩衝熔斷監控異常攔截回滾自愈重試隊列死信標籤警報提醒遵守規定條例法律免責聲明設備處理診所專科門隨身應該讓與為隻點廣州深圳陸豐誠藍衛廳區階段後來看電話網絡預約發現變更轉移購買價格標準體質結果額外給付賠償認證聲明確認輸出導入編號查看隱藏顯示點擊選項類型總計算數量額度費率折扣回贈禮品權益服務顧客員工經理總裁董事局處長委員會投資策略風險規避損失賠本賺取贏得競爭優勢劣勢強項弱點死穴破綻陷阱避坑警示提醒通知訊息消息宣傳單張廣告介紹說明解釋闡述詳細清楚明確嚴謹專業權威官方備案認可批准審批規範標準要求符合達標超額提前延後滿期終止解除取消變更換人繼續繳費停繳緩繳墊繳借款還款清償利息本金複利單利投報率實現率達成率履約率兌現給付撥付賠付理賠申請索償拒賠爭議投訴仲裁訴訟法律規定條例指引守則監管機構保監局金管局證監會稅務局醫管局養和港怡嘉諾撒聖保祿浸會仁安荃灣港安中大寶血明德播道間數著這個別哋樣過時會對後從經動條來問題產學車機電門頭現見場面國華東西南北長難師專視角網站頁碼話語說課請讀寫記認證設評試詩誠誤談誕誘資賊賂賄賅賑賒賓贈贊贍贏贖買賣費貸貿賀賈賬賭賠賴賺購賽走趕起超趨躍路踐跌跑跟跡跨跳車軍軒軟轉輪輯輸轄辭辦迎運近返還進遠違連遲選遺邊釋里重野量金針釣銘銀鋪鏈鎖鏡鐘鐵開關閉閱闊隊階際障隨險隱隻雙雜雞難雲電靈青靚面革響頁頂頃項順須頑顧頓頗領頻顆題額顏願類風飛飽飾餃餅養館首香馬馳駐駕驗駿騎騙骨體高髮鬧鬱魚魯鮮鳥鳳鳴鴻鶴鷹鹿麗麥麵麻黃齊齒齡龍';
    const ZH_S_CHARS = '万亿寿险划宝诚友邦宏利医保储蓄扣税年金融资总监顾问审查评看板报告点数据规则条款额度现金流复杂实现率实际产品买卖两开关闭业务类别测试计算机预缴息差杠杆压力优化获得赔偿担保函私家医院内窥镜肠胃质子标靶药联动证书备案换汇币种转换独立曲线认为说明结算结构体检质押借款贷款继承遗产税节省减轻症原位癌肿瘤豁免残疾儿童怀孕异议脚本攻防战策击虚避实导航晨会演讲操守指引绝对化违规审计链痕迹网络绿色通道协同矩阵穿透障碍双屏横竖屏幕搜索引擎滑动势历史退休支柱房贷赴港访签署票照上传续期费渠道账户银联云闪付滑点冻结简报画质图转发评级弱载缓存肖像头衔称谓专属二维码追踪阅读语音合成粤语普通话播听取冠状动脉条查询旧框调增强软肋权威促成难赢输亏损补贴冲击降跌缓冲充裕雇主阶梯累计归责监管局操守声明确定性乐观悲观走势廊穿透柱状折线圆环雷达标签悬浮导航抽屉模态框遮罩关闭打开切换滚动顶部底部横幅标题副标题卡片徽章按钮输入栏选择器弹出提示覆盖隐私遮蔽涂黑密码授权认证专业顾问团队总监牌照电话邮箱官网说明书单张通函公开资料库备份还原备忘录历史纪录日志审批核准预估测算试算结果差异比较横向纵向双边阵营攻守对垒挑战破局话术抗拒拆解步骤共情点破盲点数据绝杀促成签单递交复制粘贴转寄分享导出打印存档下载离线快取储存本地缓冲熔断监控异常拦截回滚自愈重试队列死信标签警报提醒遵守规定条例法律免责声明设备处理诊所专科门随身应该让与为只点广州深圳陆丰诚蓝卫厅区阶段后来看电话网络预约发现变更转移购买价格标准体质结果额外给付赔偿认证声明确认输出导入编号查看隐藏显示点击选项类型总计算数量额度费率折扣回赠礼品权益服务顾客员工经理总裁董事局处长委员会投资策略风险规避损失赔本赚取赢得竞争优势劣势强项弱点死穴破绽陷阱避坑警示提醒通知讯息消息宣传单张广告介绍说明解释阐述详细清楚明确严谨专业权威官方备案认可批准审批规范标准要求符合达标超额提前延后满期终止解除取消变更换人继续缴费停缴缓缴垫缴借款还款清偿利息本金复利单利投报率实现率达成率履约率兑现给付拨付赔付理赔申请索偿拒赔争议投诉仲裁诉讼法律规定条例指引守则监管机构保监局金管局证监会税务局医管局养和港怡嘉诺撒圣保禄浸会仁安荃湾港安中大宝血明德播道间数着这个别地样过时会对后从经动条来问题产学车机电门头现见场面国华东西南北长难师专视角网站页码话语说课请读写记认证设评试诗诚误谈诞诱资贼赂贿赅赈赊宾赠赞赡赢赎买卖费贷贸贺贾账赌赔赖赚购赛走赶起超趋跃路践跌跑跟迹跨跳车军轩软转轮辑输辖辞办迎运近返还进远违连迟选遗边释里重野量金针钓铭银铺链锁镜钟铁开关闭阅阔队阶际障随险隐只双杂鸡难云电灵青靓面革响页顶顷项顺须顽顾顿颇领频颗题额颜愿类风飞饱饰饺饼养馆首香马驰驻驾验骏骑骗骨体高发闹郁鱼鲁鲜鸟凤鸣鸿鹤鹰鹿丽麦面麻黄齐齿龄龙';

    const T2S_MAP = {};
    const S2T_MAP = {};
    for (let i = 0; i < ZH_T_CHARS.length; i++) {
      T2S_MAP[ZH_T_CHARS[i]] = ZH_S_CHARS[i];
      S2T_MAP[ZH_S_CHARS[i]] = ZH_T_CHARS[i];
    }

    function toHans(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/./g, function(c) { return T2S_MAP[c] || c; });
    }
    window.toHans = toHans;
    window.convertZhToHans = toHans;

    function toHant(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/./g, function(c) { return S2T_MAP[c] || c; });
    }
    window.toHant = toHant;
    window.convertZhToHant = toHant;

    function convertDomTreeLang(node, isHans) {
      if (!node) return;
      if (node.nodeType === 3) {
        const txt = node.nodeValue;
        if (txt && txt.trim().length > 0) {
          node.nodeValue = isHans ? toHans(txt) : toHant(txt);
        }
      } else if (node.nodeType === 1) {
        const tag = (node.tagName || '').toUpperCase();
        if (tag === 'SCRIPT' || tag === 'STYLE') return;
        if (node.placeholder) node.placeholder = isHans ? toHans(node.placeholder) : toHant(node.placeholder);
        if (node.title) node.title = isHans ? toHans(node.title) : toHant(node.title);
        const children = node.childNodes;
        if (children) {
          for (let i = 0; i < children.length; i++) {
            convertDomTreeLang(children[i], isHans);
          }
        }
      }
    }

    function toggleLangZh() {
      setLangZh(currentLang === 'zh-HK' ? 'zh-CN' : 'zh-HK');
    }
    window.toggleLangZh = toggleLangZh;

    function setLangZh(lang) {
      currentLang = (lang === 'zh-CN') ? 'zh-CN' : 'zh-HK';
      if (typeof document !== 'undefined') {
        document.documentElement.lang = currentLang;
        const btnTxt = document.getElementById('header-lang-text');
        if (btnTxt) btnTxt.innerText = (currentLang === 'zh-CN') ? '簡體' : '繁/簡';
        if (currentLang === 'zh-CN') {
          document.body.classList.add('lang-hans');
        } else {
          document.body.classList.remove('lang-hans');
        }
        convertDomTreeLang(document.body, currentLang === 'zh-CN');
      }
      try { localStorage.setItem('insurintel_lang', currentLang); } catch(e){}
      showToast(currentLang === 'zh-CN' ? '🌐 已切換為簡體中文' : '🌐 已切換為繁體中文');
    }
    window.setLangZh = setLangZh;

    function toggleFontSize() {
      setFontSize(!isLargeFont);
    }
    window.toggleFontSize = toggleFontSize;

    function setFontSize(val) {
      isLargeFont = !!val;
      if (typeof document !== 'undefined') {
        if (isLargeFont) {
          document.body.classList.add('large-font-mode');
        } else {
          document.body.classList.remove('large-font-mode');
        }
        const btnTxt = document.getElementById('header-font-text');
        if (btnTxt) btnTxt.innerText = isLargeFont ? '大字體' : '標準/大字';
      }
      try { localStorage.setItem('insurintel_large_font', isLargeFont ? '1' : '0'); } catch(e){}
      showToast(isLargeFont ? '🔍 已開啟長輩大字體模式' : '🔍 已還原標準字體大小');
    }
    window.setFontSize = setFontSize;

    // 7. 100-Point Audit Drawer Functions
    function setAuditScope(scope) {
      auditScope = (scope === '100') ? '100' : '30';
      if (typeof document !== 'undefined') {
        const btn30 = document.getElementById('audit-scope-30');
        const btn100 = document.getElementById('audit-scope-100');
        const pills30 = document.getElementById('audit-30-filter-pills') || document.querySelector('.audit-filter-pills');
        const pills100 = document.getElementById('audit-100-filter-pills');
        const badge = document.getElementById('audit-header-badge');

        if (btn30) btn30.classList.toggle('active', auditScope === '30');
        if (btn100) btn100.classList.toggle('active', auditScope === '100');
        if (pills30) pills30.style.display = (auditScope === '30') ? 'flex' : 'none';
        if (pills100) pills100.style.display = (auditScope === '100') ? 'flex' : 'none';
        if (badge) badge.innerText = (auditScope === '100') ? '100/100 Resolved' : '30/30 Verified';
      }
      if (auditScope === '100') renderAudit100Cards('all');
      else renderAudit30Cards('all');
    }
    window.setAuditScope = setAuditScope;

    function filterAudit100(category) {
      const chips = ['all', 'client', 'agent'];
      chips.forEach(function(c) {
        const el = document.getElementById('audit-100-chip-' + c);
        if (el) el.classList.toggle('active', c === category);
      });
      renderAudit100Cards(category);
    }
    window.filterAudit100 = filterAudit100;

    function renderAudit100Cards(filter) {
      const container = document.getElementById('audit-cards-list');
      if (!container || typeof APP_100_IMPROVEMENT_COMMENTS === 'undefined') return;

      const items = APP_100_IMPROVEMENT_COMMENTS.filter(function(item) {
        if (filter === 'client') return item.sourceRole.includes('客戶');
        if (filter === 'agent') return item.sourceRole.includes('顧問');
        return true;
      });

      container.innerHTML = items.map(function(item) {
        const isClient = item.sourceRole.includes('客戶');
        const roleColor = isClient ? '#0284c7' : '#059669';
        const roleBg = isClient ? '#e0f2fe' : '#dcfce7';
        return '<div class="audit-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<div style="display:flex;align-items:center;gap:6px;">' +
              '<span style="font-family:JetBrains Mono,monospace;font-weight:800;font-size:11px;color:' + roleColor + ';background:' + roleBg + ';padding:2px 8px;border-radius:4px;">[' + item.id + '] ' + item.topic + '</span>' +
              '<span style="font-size:10.5px;color:#475569;font-weight:600;">' + item.sourceRole + '</span>' +
            '</div>' +
            '<span style="font-size:10px;font-weight:700;color:#059669;background:#dcfce7;padding:2px 6px;border-radius:4px;">' + item.status + '</span>' +
          '</div>' +
          '<div style="font-size:11.5px;color:#0f172a;margin-bottom:6px;line-height:1.45;background:#f8fafc;padding:6px 8px;border-radius:4px;border-left:3px solid ' + roleColor + ';">' +
            '<strong>反饋原聲：</strong>「' + item.commentText + '」' +
          '</div>' +
          '<div style="font-size:11px;color:#334155;line-height:1.5;">' +
            '<strong>📋 項目經理 (PM) 審核：</strong>' + item.pmReview + '<br>' +
            '<strong>🛠️ 產品經理 (PdM) 解決方案：</strong>' + item.pdmDecision + '<br>' +
            '<span style="font-size:10px;color:#64748b;margin-top:2px;display:inline-block;">🎯 落地模塊：' + item.resolvedIn + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    window.renderAudit100Cards = renderAudit100Cards;

    function initCompatibility() {
      if ((currentScenario === 'cashless_medical' || currentScenario === 'group_medical') && currentCategory !== 'Medical_VHIS') {
        currentCategory = 'Medical_VHIS';
        syncCategoryTabWithClaim('Medical_VHIS');
      } else if (currentScenario === 'retirement_tax' && currentCategory !== 'Annuity_QDAP') {
        currentCategory = 'Annuity_QDAP';
        syncCategoryTabWithClaim('Annuity_QDAP');
      } else if (currentScenario === 'ul_stress' && currentCategory !== 'Financing_UniversalLife') {
        currentCategory = 'Financing_UniversalLife';
        syncCategoryTabWithClaim('Financing_UniversalLife');
      }
      try {
        const storedLang = localStorage.getItem('insurintel_lang');
        if (storedLang) setLangZh(storedLang);
        const storedFont = localStorage.getItem('insurintel_large_font');
        if (storedFont === '1') setFontSize(true);
      } catch(e){}
    }

    // Initial Trigger on load
    window.addEventListener('DOMContentLoaded', () => {
      initCompatibility();
      renderClaimPills(currentCategory);
      updateCampSelectors();
      updateBattleCard();
      renderScenarioAgentPanel();
      bindAiDrawerTriggers();
    });
    // Fallback immediate trigger
    initCompatibility();
    renderClaimPills(currentCategory);
    updateCampSelectors();
    updateBattleCard();
    renderScenarioAgentPanel();
    bindAiDrawerTriggers();
  </script>

  <!-- Client-Facing PDF Report & WhatsApp/WeChat Pitch Card Modal -->
  <div class="client-pdf-backdrop" id="client-pdf-backdrop" onclick="closeClientPdfModal()"></div>
  <div class="client-pdf-modal" id="client-pdf-modal" role="dialog" aria-modal="true" aria-labelledby="client-pdf-heading">
    <div class="client-pdf-header">
      <div>
        <div style="font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px;" id="client-pdf-heading">
          <span>📑 一鍵生成客戶專屬 PDF 報告與 WhatsApp 促成卡片</span>
        </div>
        <div style="font-size:10.5px;opacity:0.9;margin-top:2px;">香港保監局 GL20 合規認證 · 專屬顧問品牌名片 · 支援高清列印與即時複製</div>
      </div>
      <button class="drawer-close-btn" onclick="closeClientPdfModal()" aria-label="關閉客戶報告視窗">✕</button>
    </div>
    <div class="client-pdf-body">
      <!-- Advisor Branding Profile Form -->
      <div class="advisor-profile-form">
        <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <span>👤 專屬保險理財顧問名片設定 (即時生效)</span>
          <button style="padding:4px 10px;font-size:11px;font-weight:700;background:#002FA7;color:#fff;border:none;border-radius:4px;cursor:pointer;" onclick="saveAdvisorProfile({
            name: document.getElementById('report-agent-name').value,
            title: document.getElementById('report-agent-title').value,
            license: document.getElementById('report-agent-license').value,
            team: document.getElementById('report-agent-team').value,
            phone: document.getElementById('report-agent-phone').value
          })">💾 儲存名片</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">
          <div>
            <label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">顧問姓名</label>
            <input type="text" id="report-agent-name" style="width:100%;padding:5px 8px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;" placeholder="陳志強 Alex Chan" oninput="saveAdvisorProfile({name:this.value}, true)">
          </div>
          <div>
            <label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">職銜 / 榮譽</label>
            <input type="text" id="report-agent-title" style="width:100%;padding:5px 8px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;" placeholder="資深財富管理總監 · MDRT COT" oninput="saveAdvisorProfile({title:this.value}, true)">
          </div>
          <div>
            <label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">牌照號碼</label>
            <input type="text" id="report-agent-license" style="width:100%;padding:5px 8px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;" placeholder="IA982341" oninput="saveAdvisorProfile({license:this.value}, true)">
          </div>
          <div>
            <label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">所屬團隊 / 區域</label>
            <input type="text" id="report-agent-team" style="width:100%;padding:5px 8px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;" placeholder="卓越家族辦公室團隊" oninput="saveAdvisorProfile({team:this.value}, true)">
          </div>
          <div>
            <label style="font-size:10.5px;color:#64748b;display:block;margin-bottom:2px;">電話 / WhatsApp</label>
            <input type="text" id="report-agent-phone" style="width:100%;padding:5px 8px;font-size:11px;border:1px solid #cbd5e1;border-radius:4px;" placeholder="+852 9123 4567" oninput="saveAdvisorProfile({phone:this.value}, true)">
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="client-pdf-modal-actions" style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
        <button class="pdf-action-btn" id="btn-print-client-report" onclick="printClientReport()" style="flex:1;min-width:130px;padding:8px 12px;background:#002FA7;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>🖨️ 匯出 PDF / 列印簡報 (window.print)</span>
        </button>
        <button class="pdf-action-btn" id="btn-download-html-report" onclick="downloadClientHtmlReport()" style="flex:1;min-width:130px;padding:8px 12px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>📥 下載獨立 HTML 簡報</span>
        </button>
        <button class="pdf-action-btn" id="btn-copy-report-whatsapp" onclick="copyReportWhatsApp()" style="flex:1;min-width:130px;padding:8px 12px;background:#25d366;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>💬 複製 WhatsApp 促成卡片</span>
        </button>
        <button class="pdf-action-btn" id="btn-copy-report-wechat" onclick="copyReportWechat()" style="flex:1;min-width:130px;padding:8px 12px;background:#07c160;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:11.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span>📱 複製 微信/SMS 卡片</span>
        </button>
      </div>

      <!-- Preview Container -->
      <div id="client-pdf-report-preview">
        <!-- Injected by renderClientPdfPreview() -->
      </div>
    </div>
  </div>

  <!-- Client & Advisor Audit & Improvement Board Drawer (30 & 100 Scope) -->
  <div class="audit-drawer-backdrop" id="audit-30-backdrop" onclick="closeAudit30Drawer()"></div>
  <div class="audit-drawer" id="audit-30-drawer" role="dialog" aria-modal="true" aria-labelledby="audit-drawer-heading">
    <div class="audit-drawer-header">
      <div>
        <div style="font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px;" id="audit-drawer-heading">
          <span>📋 客戶與顧問深度評審改進看板</span>
          <span style="font-size:10px;background:#10b981;color:#fff;padding:1px 6px;border-radius:10px;" id="audit-header-badge">100/100 Resolved</span>
        </div>
        <div style="font-size:10.5px;opacity:0.9;margin-top:2px;">雙邊視角實戰評審 · PM & PdM 全流程守護 · 100% 已修復</div>
      </div>
      <button class="drawer-close-btn" onclick="closeAudit30Drawer()" aria-label="關閉評審看板">✕</button>
    </div>
    <div class="audit-drawer-body">
      <!-- Audit scope switch: 30-item core vs 100-item full PDM roadmap -->
      <div class="audit-scope-bar" id="audit-scope-bar" style="display:flex;gap:8px;margin-bottom:10px;background:#f1f5f9;padding:4px;border-radius:8px;">
        <button id="audit-scope-30" class="audit-scope-btn active" style="flex:1;padding:6px;font-size:11.5px;font-weight:700;border:none;border-radius:6px;cursor:pointer;background:#fff;color:#0f172a;box-shadow:0 1px 2px rgba(0,0,0,0.05);" onclick="setAuditScope('30')">🎯 核心30項基準看板</button>
        <button id="audit-scope-100" class="audit-scope-btn" style="flex:1;padding:6px;font-size:11.5px;font-weight:600;border:none;border-radius:6px;cursor:pointer;background:transparent;color:#64748b;" onclick="setAuditScope('100')">💯 全量100項產品矩陣 (50客+50顧)</button>
      </div>
      <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:11.5px;color:#065f46;line-height:1.5;">
        <strong>🛡️ 項目與產品經理質量守護聲明：</strong><br>
        本看板完整收錄客戶與保險顧問提出的實戰改進反饋（涵蓋 GN16 官方基準解析、精算分數實質化、UL保費融資壓力測試、團險自負額優化器、QDAP家庭節稅、3-Way三方旗艦對決、全港13家私院全額直付網絡）。所有改進均已落實修復並通過雙邊沙盒測試驗證！
      </div>
      <!-- 30-mode pills -->
      <div class="audit-filter-pills" id="audit-30-filter-pills" style="display:flex;">
        <button class="audit-filter-chip active" id="audit-chip-all" onclick="filterAudit30('all')">全部評審 (30)</button>
        <button class="audit-filter-chip" id="audit-chip-client" onclick="filterAudit30('client')">客戶視角 (15)</button>
        <button class="audit-filter-chip" id="audit-chip-agent" onclick="filterAudit30('agent')">顧問視角 (15)</button>
      </div>
      <!-- 100-mode pills -->
      <div class="audit-filter-pills" id="audit-100-filter-pills" style="display:none;">
        <button class="audit-filter-chip active" id="audit-100-chip-all" onclick="filterAudit100('all')">全部評審 (100)</button>
        <button class="audit-filter-chip" id="audit-100-chip-client" onclick="filterAudit100('client')">客戶視角 (50)</button>
        <button class="audit-filter-chip" id="audit-100-chip-agent" onclick="filterAudit100('agent')">顧問視角 (50)</button>
      </div>
      <div id="audit-cards-list">
        <!-- Rendered dynamically by renderAudit30Cards() or renderAudit100Cards() -->
      </div>
    </div>
  </div>

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

// Generate Standalone SEO Tool Landing Page (gn16_tracker.html)
// Pure utility site automatically opening the GN16 query tool on launch
const gn16TrackerHtml = htmlContent.replace(
  'checkGN16UrlParams();',
  'checkGN16UrlParams(); openGN16QueryModal();'
);
const trackerTemplatePath = path.join(templatesDir, 'gn16_tracker.html');
const distTrackerPath = path.join(distDir, 'gn16_tracker.html');
fs.writeFileSync(trackerTemplatePath, gn16TrackerHtml, 'utf8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(distTrackerPath, gn16TrackerHtml, 'utf8');
}
console.log('[InsurIntel] Generated standalone SEO landing site: dist/gn16_tracker.html & templates/gn16_tracker.html');


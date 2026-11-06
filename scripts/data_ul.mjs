// Universal Life Financing data expansion and enrichment definitions

export const existingUlEnrichment = {
  "PROMO-AIA-UL-2026": {
    clause_highlights: [
      "現行派息率高達 5.35%，保證最低派息率（Floor Rate）達 2.25%，鎖定長期安全底線",
      "私人銀行保費融資最高成數 LTV 達 85%，典型融資成本 3.90%，淨利差套利空間達 1.45%",
      "大額家族傳承首選，特設家族信託式資產隔離架構與極速 48 小時融資批核意向書",
      "退保費用期僅 4 年，資金流動性顯著優於傳統 10-15 年儲蓄分紅保險"
    ],
    clause_pitfalls: [
      "面臨加息週期息差倒掛風險：若美聯儲利率或 HIBOR 借貸成本上升超過派息率，將引致負息差虧損",
      "銀行設有保證金追繳（Margin Call）條款，當保單退保價值跌破維持擔保比例時需限時補倉",
      "前 4 年退保仍需扣除退保費用（Surrender Charge），提前退保存在本金折損",
      "最低進場門檻高達 500,000 美元躉繳保費，需通過嚴格的專業投資者（PI）資產審查"
    ],
    official_source_attribution: "友邦保險高淨值業務官方通函 Ref: AIA-PB-UL-2026-01；保監局備案登記: IA-AIA-UL-2026"
  },
  "PROMO-MANU-UL-2026": {
    clause_highlights: [
      "宏裕傳承萬用壽險，現行結算利率高達 5.40%，保證利率 2.00%",
      "融資最高成數達 85% LTV，典型借貸成本 3.85%，淨息差達 1.55%",
      "退保費用年期僅 3 年，為全港退保期最短、靈活性最高的萬用壽險之一",
      "特設保單直接借貸（Policy Loan）功能，無需經過第三方銀行直接向宏利質押借款"
    ],
    clause_pitfalls: [
      "派息率非固定保證，宏利有權依據投資組合回報定期（通常每月或每季）調整結算利率",
      "私人銀行融資需承擔浮動利息波動風險，利差收窄時回報率將低於預期",
      "若銀行收緊融資成數（De-leveraging），借款人需補足保證金以防強制平倉",
      "大額投保涉及全面財務背景審核（Financial Underwriting）與反洗錢盡職調查"
    ],
    official_source_attribution: "宏利人壽高淨值部通告 Ref: MANU-HNW-UL-2026；保監局審核編號: POL-MANU-UL-2026"
  },
  "PROMO-SUN-UL-2026": {
    clause_highlights: [
      "永明百年穩健資產管理操盤，保證最低派息率高達 2.50%，為市場最高保證底線之一",
      "現行派息率 5.30%，融資成數 80% LTV，淨息差穩達 1.50%",
      "專設跨代資產託管信託架構，支援指定後續保單持有人及分配受益人比例",
      "退保費用期僅 4 年，資金回籠速度快，大額保單尊享特級優惠折扣"
    ],
    clause_pitfalls: [
      "最高融資成數上限為 80% LTV，槓桿比例略低於部分 85% 競品",
      "若美元利率維持高位，借貸利息支出將持續侵蝕萬用壽險之淨利差回報",
      "提前於前 4 年解約或終止銀行融資需繳納退保手續費",
      "最低進場躉繳保費為 500,000 美元，適合具備一定流動資產規模之高淨值人士"
    ],
    official_source_attribution: "永明金融高資產客戶部指南 Ref: SUN-LEGACY-UL-2026；保監局備案: IA-SUN-UL-2026"
  },
  "PROMO-FWD-UL-2026": {
    clause_highlights: [
      "富逸傳家萬用壽險，現行派息率高達 5.45%，保證最低派息率 2.25%",
      "支援最高 85% LTV 保費融資，典型借貸成本 3.85%，淨息差高達 1.60%",
      "退保費用期僅 3 年，提供極致靈活的退保與部分提取自由度",
      "合作銀行設有綠色審批通道，48 小時內極速出具私人銀行融資批核函"
    ],
    clause_pitfalls: [
      "結算利率每月公佈，具備浮動性，不保證長期維持在 5.45% 高位",
      "高槓桿（85% LTV）操作在加息環境下面臨較大的利率敏感度與追加保證金風險",
      "前 3 年退保收取階梯式退保費用，中途離場將損失前期融資手續費及部分本金",
      "需滿足最低 500,000 美元保費要求及專業投資者審查"
    ],
    official_source_attribution: "富衛人壽官方高淨值通函 Ref: FWD-UL-APEX-2026；保監局核准: POL-FWD-UL-2026"
  },
  "PROMO-YF-UL-2026": {
    clause_highlights: [
      "萬通富貴萬用壽險，現行派息率 5.30%，保證最低派息率 2.20%",
      "融資成數 80% LTV，淨息差空間 1.45%，退保費用年期 4 年",
      "特設保單價值轉化年金權利，融資結清後可免審批轉化為終身現金年金",
      "大額投保享首年 4.0% 保費回贈，降低客戶初始自有出資成本"
    ],
    clause_pitfalls: [
      "結算利率隨市場浮動，若環球投資收益率下降，派息率可能下調",
      "借貸融資需支付銀行安排手續費及律師公證費用，前期摩擦成本較高",
      "前 4 年退保需繳納退保費用，提早終止保單收益將大幅受損",
      "進場保費門檻 500,000 美元，需提供充足資產證明以通過核保"
    ],
    official_source_attribution: "萬通保險產品手冊 Ref: YFL-UL-MASSFORTUNE-2026；保監局備案: IA-YFL-UL-2026"
  },
  "PROMO-PRU-UL-2026": {
    clause_highlights: [
      "保誠富傳萬用壽險，現行派息率 5.35%，融資成數 82% LTV",
      "結合保誠百年英式紅利與萬用壽險高流動性質押優勢，淨利差達 1.45%",
      "退保費用年期僅 3 年，到期後無任何退保懲罰，資金調度極其從容",
      "提供大額身故槓桿保障，為家族企業傳承築起堅固風險防線"
    ],
    clause_pitfalls: [
      "現行派息率每月浮動，需定期審視與銀行借貸成本之淨利差空間",
      "若遇利率大幅倒掛，銀行可能要求追加質押物或調高借貸利率",
      "首 3 年內退保需扣減退保手續費，未滿期退出將影響實際回報",
      "躉繳保費最低門檻 500,000 美元，需通過專業投資者（PI）資格審核"
    ],
    official_source_attribution: "保誠保險高資產部官方指南 Ref: PRU-UL-GRANDEUR-2026；保監局認可: POL-PRU-UL-2026"
  },
  "PROMO-AXA-UL-2026": {
    clause_highlights: [
      "安盛盛世傳承萬用壽險，現行派息率 5.30%，融資成數 80% LTV",
      "由安盛投資管理（AXA IM）操盤，全球主權債與高評級債券資產池極其深厚",
      "退保費用年期 4 年，保單直接借貸利率僅 5.10%，融資渠道多元",
      "首年保費回贈高達 4.5%，有效補貼客戶初始融資借款利息"
    ],
    clause_pitfalls: [
      "融資借貸成本隨 HIBOR/SOFR 波動，非保證利差存在市場收窄風險",
      "私人銀行設有跌幅預警平倉線，需預留流動資金以應對潛在 Margin Call",
      "前 4 年退保存在退保費用扣除，提前贖回將引致資產折損",
      "需滿足 500,000 美元躉繳進場門檻及完整反洗錢來源審核"
    ],
    official_source_attribution: "安盛保險官方通告 Ref: AXA-UL-GRANDFORTUNE-2026；保監局檔案: IA-AXA-UL-2026"
  },
  "PROMO-BOC-UL-2026": {
    clause_highlights: [
      "中銀人壽盛世萬用壽險，依托中銀香港及中銀私人銀行，全流程一站式融資質押",
      "現行派息率 5.25%，保證最低利率 2.00%，融資最高成數 80% LTV",
      "退保費用期僅 3 年，境內外資金調撥與兩地跨境融資備案通道通暢",
      "特設人民幣與美元雙重結算渠道，大額客戶專享超低融資借貸利率優惠"
    ],
    clause_pitfalls: [
      "現行派息率（5.25%）在同儕中偏向審慎防守，超額利差空間約 1.35%",
      "銀行融資借貸成本若上升將直接壓縮套利空間，需做好息差敏感度測試",
      "前 3 年退保收取手續費，不適宜短期內需要全額變現之資金",
      "最低躉繳保費門檻 500,000 美元，需配合中銀香港私銀開戶要求"
    ],
    official_source_attribution: "中銀人壽官方備忘 Ref: BOCL-UL-GOLDENERA-2026；保監局註冊號: POL-BOCL-UL-2026"
  },
  "PROMO-AIA-UL-ELITE-2026": {
    clause_highlights: [
      "友邦財富恒裕萬用壽險（Fortune Elite），頂級旗艦現行派息率達 5.45%",
      "融資最高成數達 85% LTV，典型融資成本 3.90%，淨利差達 1.55%",
      "退保費用年期僅 3 年，提供極致的現金流質押流動性與超大身故槓桿",
      "尊享友邦超高淨值俱樂部專屬私人銀行綠色批核待遇"
    ],
    clause_pitfalls: [
      "高槓桿操作（85% LTV）需嚴格監控融資借貸成本與結算利率利差變動",
      "銀行保留追繳保證金權利，遇極端金融事件時可能被要求追加抵押品",
      "前 3 年退保需繳納退保費用，提早退保將造成實質利息及本金虧損",
      "最低保費門檻 600,000 美元，需提供詳細完備之資產財富來源證明"
    ],
    official_source_attribution: "友邦保險高端客戶官方指南 Ref: AIA-UL-FORTUNE-ELITE-2026；保監局登記: IA-AIA-FE-2026"
  },
  "PROMO-PRU-UL-PRESTIGE-2026": {
    clause_highlights: [
      "保誠尊富萬用壽險（Prestige UL），現行派息率 5.35%，保證最低派息率 2.20%",
      "融資最高成數 82% LTV，淨息差 1.50%，退保費用年期僅 3 年",
      "專門針對跨國企業家與高淨值家族打造，支援全球多家頂級私人銀行質押融資",
      "大額保費享最高 4.5% 首年折扣優惠，有效沖銷借款初始安排費"
    ],
    clause_pitfalls: [
      "派息率每月按保誠投資委員會評估更新，受環球利率週期直接影響",
      "融資借款利息支出若超出派息水平將引致利息倒貼風險",
      "首 3 年內退保需承擔退保費用，未滿期退出將影響整體回報",
      "躉繳保費最低門檻 500,000 美元，需通過嚴格的客戶盡職調查（CDD）"
    ],
    official_source_attribution: "保誠保險官方產品備忘 Ref: PRU-UL-PRESTIGE-2026；保監局認證: POL-PRU-PRESTIGE-2026"
  },
  "PROMO-SUN-UL-PINNACLE-2026": {
    clause_highlights: [
      "永明耀世傳承萬用壽險（Pinnacle UL），保證最低派息率高達 2.50%，居市場天花板",
      "現行派息率 5.30%，融資最高成數 80% LTV，淨息差 1.50%",
      "退保費用年期僅 3 年，資產流動性極其靈活，滿 3 年後隨時免罰則退保",
      "特設跨代資產信託架構，提供免體檢高額身故保障槓桿"
    ],
    clause_pitfalls: [
      "最高融資成數為 80% LTV，較 85% 融資產品自有出資比例略高",
      "若融資成本隨加息週期上升，淨息差將受擠壓，需預留防守緩衝儲備",
      "前 3 年退保存在手續費扣除，早期退保將造成本金虧損",
      "躉繳保費最低 500,000 美元，需符合專業投資者資格審核"
    ],
    official_source_attribution: "永明金融高淨值專屬手冊 Ref: SUN-UL-PINNACLE-2026；保監局備案: IA-SUN-PINNACLE-2026"
  },
  "PROMO-MANU-UL-INDEX-2026": {
    clause_highlights: [
      "宏利宏耀指數萬用壽險（Indexed UL），現行派息率高達 5.50%，市場頂級回報水平",
      "連結標普500（S&P 500）等環球主流指數表現，同時享有 2.00% 保證最低派息率兜底",
      "融資最高成數 82% LTV，典型借貸成本 3.90%，淨息差高達 1.60%",
      "退保費用年期僅 3 年，兼具美股長線增值潛力與零本金下跌兜底防護"
    ],
    clause_pitfalls: [
      "指數期權收益設有年度封頂上限（Cap Rate），在極端大牛市時無法全額捕獲超額漲幅",
      "若標普500指數長期走平或下跌，結算利率將退回至 2.00% 保證最低水平，觸發息差虧損",
      "銀行融資存在 Margin Call 追繳風險，需具備一定風險承受能力",
      "最低保費門檻 500,000 美元，需滿足結構性衍生金融工具適當性審查"
    ],
    official_source_attribution: "宏利人壽官方指數產品手冊 Ref: MANU-INDEX-UL-2026；保監局檔案: POL-MANU-INDEX-2026"
  }
};

export const newUlProducts = [
  {
    promo_id: "PROMO-HSBC-UL-PREMIER-2026",
    insurer: "HSBC",
    product_name: "滙豐智盈萬用壽險 (HSBC Premier Universal Life)",
    product_aliases: ["滙豐智盈萬用壽險", "滙豐萬用壽險", "HSBC Premier UL", "滙豐智盈UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-15",
      channel: "All"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, max_annual_premium_usd: 1000000, discount_rate_pct: 3.5 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 5.5 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.40,
      crediting_rate_guaranteed_pct: 2.25,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 85.0,
      typical_funding_cost_pct: 3.85,
      net_carry_spread_pct: 1.55,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 5.00,
      margin_call_drop_buffer_pct: 20.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 5000000,
      special_waiver_notes: "滙豐私人銀行（HSBC Global Private Banking）綠色融資審批，48小時極速發放授信函 (Facility Letter)"
    },
    clause_highlights: [
      "滙豐私人銀行閉環一站式保費融資，質押成數高達 85% LTV，極速完成放款",
      "現行派息率 5.40%，保證最低利率 2.25%，淨套利息差高達 1.55%",
      "退保費用年期僅 3 年，資金調動與資產配置靈活性處於市場最高階梯",
      "特設身故信託提取機制，身故保險金可指定按年/月分期支付至全球滙豐賬戶"
    ],
    clause_pitfalls: [
      "借貸成本隨 SOFR/HIBOR 浮動，若美元利率居高不下，息差回報將面臨收窄",
      "私人銀行設有保證金追繳（Margin Call）條款，當保單價值跌破警戒線需限期補足差額",
      "前 3 年退保將被扣除退保費用，提早退保將引致實質資產損失",
      "躉繳進場門檻 500,000 美元，需符合專業投資者（PI）資產審查規範"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "滙豐保險官方高淨值通告 Ref: HSBC-UL-PREMIER-2026；保監局備案登記: POL-HSBC-UL-2026"
    }
  },
  {
    promo_id: "PROMO-HSBC-UL-PRIVILEGE-2026",
    insurer: "HSBC",
    product_name: "滙豐尊尚萬用壽險 (HSBC Privilege Universal Life)",
    product_aliases: ["滙豐尊尚萬用壽險", "滙豐尊尚UL", "HSBC Privilege UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-15",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-15",
      channel: "All"
    },
    premium_discounts: [
      { min_annual_premium_usd: 1000000, discount_rate_pct: 6.0 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.50,
      crediting_rate_guaranteed_pct: 2.25,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 88.0,
      typical_funding_cost_pct: 3.80,
      net_carry_spread_pct: 1.70,
      min_premium_usd: 1000000,
      policy_loan_interest_pct: 4.80,
      margin_call_drop_buffer_pct: 18.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 8000000,
      special_waiver_notes: "超高淨值客戶專屬定製，免體檢額度高達800萬美元，專屬私銀總裁審批通道"
    },
    clause_highlights: [
      "超高淨值家族傳承專屬定製，融資成數最高可達 88% LTV，市場槓桿空間之冠",
      "現行派息率高達 5.50%，淨息差套利空間達 1.70%，資金使用效率最大化",
      "退保費用期僅 3 年，支援私人銀行離岸多幣種質押擔保授信",
      "尊享全球私人銀行法務與稅務架構顧問團隊全流程協同服務"
    ],
    clause_pitfalls: [
      "超高槓桿（88% LTV）對利率波動極其敏感，若融資成本攀升需承擔較高追加保證金風險",
      "最低躉繳保費門檻高達 1,000,000 美元，僅限超高淨值合格專業投資者投保",
      "前 3 年退保需繳付退保手續費，未滿期退出將造成重大財務摩擦損失",
      "派息率隨滙豐投資資產組合收益浮動，不保證長期維持在 5.50% 水平"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "滙豐保險私銀通告 Ref: HSBC-UL-PRIVILEGE-2026；保監局檔案: IA-HSBC-UL-PRIV"
    }
  },
  {
    promo_id: "PROMO-GEN-UL-LIONUNIVERSAL-2026",
    insurer: "Generali",
    product_name: "忠意「獅承」萬用壽險 (Generali LionUniversal Life)",
    product_aliases: ["忠意獅承萬用壽險", "忠意萬用壽險", "Generali LionUniversal Life", "忠意獅承UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD", "EUR"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-20",
      channel: "Broker"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, discount_rate_pct: 4.0 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 6.0 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.45,
      crediting_rate_guaranteed_pct: 2.20,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 85.0,
      typical_funding_cost_pct: 3.85,
      net_carry_spread_pct: 1.60,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 5.00,
      margin_call_drop_buffer_pct: 20.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 6000000,
      special_waiver_notes: "歐洲老牌私銀全面認可質押，提供跨國家族辦公室專屬審批通道"
    },
    clause_highlights: [
      "歐洲第一大人壽保險忠意品牌背書，支援美元及歐元雙幣種保費融資質押",
      "現行派息率 5.45%，保費融資最高 85% LTV，淨利差套利空間高達 1.60%",
      "退保費用期僅 3 年，滿 3 年後退保手續費完全歸零，流動性充沛",
      "獨立家族信託與跨代傳承架構設計成熟，適合跨國跨境資產配置"
    ],
    clause_pitfalls: [
      "若歐洲及美國利率政策發生分歧，歐元/美元匯率波動可能增加外幣保費融資匯兌風險",
      "融資借貸成本浮動，息差收窄時回報將受壓縮，銀行保有追繳保證金權利",
      "前 3 年退保存在退保費用扣減，提前退出將引致本金損失",
      "最低進場保費門檻 500,000 美元，需符合專業投資者（PI）資產審查規範"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "忠意保險官方通告 Ref: GEN-LION-UL-2026；保監局備案登記: POL-GEN-UL-2026"
    }
  },
  {
    promo_id: "PROMO-CL-UL-SUPREME-2026",
    insurer: "ChinaLife",
    product_name: "國壽海外尊享財富萬用壽險 (China Life Supreme Wealth Universal Life)",
    product_aliases: ["國壽尊享財富", "國壽萬用壽險", "China Life Supreme Wealth UL", "國壽尊享UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD", "RMB"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-15",
      channel: "All"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, discount_rate_pct: 4.0 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 5.8 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.38,
      crediting_rate_guaranteed_pct: 2.25,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 85.0,
      typical_funding_cost_pct: 3.80,
      net_carry_spread_pct: 1.58,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 4.90,
      margin_call_drop_buffer_pct: 22.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 6000000,
      special_waiver_notes: "央企信譽保障，全港各大中資及外資私人銀行認可質押，內地高淨值客戶專享極速核保通道"
    },
    clause_highlights: [
      "中國最大人壽保險央企海外旗艦，資產規模雄厚，信用評級頂尖，銀行認可度高",
      "現行派息率 5.38%，支援美元及人民幣雙幣種，融資最高成數達 85% LTV",
      "退保費用期僅 3 年，資金回籠迅速，適合大型民營企業主家族財富傳承",
      "全港主要中資商業銀行及私人銀行提供優惠融資貸款利率與便捷抵押手續"
    ],
    clause_pitfalls: [
      "借貸成本隨銀行同業拆息浮動，加息週期下息差套利空間可能被壓縮",
      "銀行設有 Margin Call 條款，保單退保價值跌破警戒線時需限時補足抵押物",
      "首 3 年內退保需扣減退保手續費，未滿期提前贖回存在本金折讓",
      "進場最低保費門檻為 500,000 美元躉繳，需通過完整反洗錢（AML）合規審查"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "中國人壽海外官方產品通告 Ref: CL-UL-SUPREME-2026；保監局備案: POL-CL-UL-2026"
    }
  },
  {
    promo_id: "PROMO-CL-UL-GRANDEUR-2026",
    insurer: "ChinaLife",
    product_name: "國壽海外宏盛萬用壽險 (China Life Grandeur Universal Life)",
    product_aliases: ["國壽宏盛萬用壽險", "國壽宏盛UL", "China Life Grandeur UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-10",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-10",
      channel: "All"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, discount_rate_pct: 3.5 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 5.0 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.30,
      crediting_rate_guaranteed_pct: 2.20,
      surrender_charge_years: 4,
      financing_eligible: true,
      max_ltv_pct: 82.0,
      typical_funding_cost_pct: 3.85,
      net_carry_spread_pct: 1.45,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 5.10,
      margin_call_drop_buffer_pct: 20.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 5000000,
      special_waiver_notes: "央企穩健之選，提供兩地跨境綠色核保快速通道"
    },
    clause_highlights: [
      "專注於長線穩健資本增值與極致傳承安全，主權級資產防禦體系",
      "現行派息率 5.30%，保證最低派息率 2.20%，融資成數 82% LTV",
      "提供保單直接借貸權益，保險公司內部借貸利率僅 5.10%，融資途徑靈活",
      "支援身故賠償多樣化支付架構，妥善實現家族信託式代際分配"
    ],
    clause_pitfalls: [
      "退保費用期需 4 年，較 3 年期短衝型產品資金鎖定期略長 1 年",
      "最高融資成數 82% LTV，槓桿倍數略低於 85% 旗艦",
      "浮動派息率定期調整，需關注淨利差走勢以防利率倒掛風險",
      "躉繳進場門檻 500,000 美元，需提供完備財務及稅務證明"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "中國人壽海外產品通函 Ref: CL-UL-GRANDEUR-2026；保監局登記: IA-CL-UL-GRAN"
    }
  },
  {
    promo_id: "PROMO-BC-UL-SOVEREIGN-2026",
    insurer: "BlueCross",
    product_name: "藍十字至尊萬用壽險 (Blue Cross Sovereign Universal Life)",
    product_aliases: ["藍十字至尊萬用壽險", "藍十字萬用壽險", "Blue Cross Sovereign UL", "藍十字至尊UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-15",
      channel: "Broker"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, discount_rate_pct: 4.2 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 6.2 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.42,
      crediting_rate_guaranteed_pct: 2.25,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 85.0,
      typical_funding_cost_pct: 3.85,
      net_carry_spread_pct: 1.57,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 5.00,
      margin_call_drop_buffer_pct: 20.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 5000000,
      special_waiver_notes: "東亞銀行私人銀行綠色直通車批核，豁免常規繁瑣財務公證"
    },
    clause_highlights: [
      "東亞銀行旗下藍十字品牌專屬研發，深度對接東亞私銀保費融資業務",
      "現行派息率 5.42%，融資成數 85% LTV，淨息差空間高達 1.57%",
      "退保費用期僅 3 年，滿 3 年後退保費用全免，資金周轉極其便捷",
      "首年保費回贈高達 6.2%，顯著降低客戶自有資金投入成本"
    ],
    clause_pitfalls: [
      "派息率隨藍十字整體投資收益浮動，不保證長期維持在 5.42% 水平",
      "若美元拆息持續走高，借款利息支出將壓縮淨息差套利收益",
      "銀行設有 Margin Call 條款，極端市況下需按時補繳抵押保證金",
      "最低躉繳保費門檻 500,000 美元，需符合專業投資者（PI）法規要求"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "藍十字官方經紀業務通告 Ref: BC-UL-SOVEREIGN-2026；保監局登記: POL-BC-UL-2026"
    }
  },
  {
    promo_id: "PROMO-FWD-UL-PINNACLE-2026",
    insurer: "FWD",
    product_name: "富衛鼎智萬用壽險 (FWD Pinnacle Universal Life)",
    product_aliases: ["富衛鼎智", "鼎智萬用壽險", "FWD Pinnacle UL", "富衛鼎智UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-15",
      channel: "All"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, discount_rate_pct: 4.5 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 6.5 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.48,
      crediting_rate_guaranteed_pct: 2.25,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 85.0,
      typical_funding_cost_pct: 3.82,
      net_carry_spread_pct: 1.66,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 4.95,
      margin_call_drop_buffer_pct: 20.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 6000000,
      special_waiver_notes: "全港主流私銀合作綠色審批通道，大額保單特快 48 小時出具授信函"
    },
    clause_highlights: [
      "富衛頂級旗艦萬用壽險，現行派息率高達 5.48%，市場頂尖回報陣營",
      "支援最高 85% LTV 保費融資，典型借貸成本 3.82%，淨息差套利空間達 1.66%",
      "退保費用期僅 3 年，資金調動靈活，適配高淨值客戶中期流動性規劃",
      "推廣期首年回贈最高達 6.5%，超強折扣力度進一步增厚初始套利安全墊"
    ],
    clause_pitfalls: [
      "現行派息率每月浮動，宏觀利率環境劇變或引起結算利率下調",
      "高槓桿操作受 HIBOR/SOFR 借貸成本上升影響較為敏感，需關注息差收窄風險",
      "首 3 年退保需繳納階梯式退保費用，提前離場存在本金損失",
      "最低進場保費門檻 500,000 美元，需提供完備資產來源審計報告"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "富衛人壽高淨值業務備忘 Ref: FWD-PINNACLE-UL-2026；保監局檔案: IA-FWD-UL-PIN"
    }
  },
  {
    promo_id: "PROMO-AXA-UL-SOVEREIGN-2026",
    insurer: "AXA",
    product_name: "安盛至尊創富萬用壽險 (AXA Sovereign Wealth Universal Life)",
    product_aliases: ["安盛至尊創富", "安盛創富萬用壽險", "AXA Sovereign Wealth UL", "安盛創富UL"],
    category: "Financing_UniversalLife",
    currency_supported: ["USD"],
    payment_period_years: [1],
    validity: {
      start_date: "2026-10-01",
      end_date: "2026-12-31",
      submission_deadline: "2026-12-31",
      payment_deadline: "2027-01-15",
      channel: "All"
    },
    premium_discounts: [
      { min_annual_premium_usd: 500000, discount_rate_pct: 4.2 },
      { min_annual_premium_usd: 1000000, discount_rate_pct: 6.0 }
    ],
    ul_metrics: {
      crediting_rate_current_pct: 5.42,
      crediting_rate_guaranteed_pct: 2.25,
      surrender_charge_years: 3,
      financing_eligible: true,
      max_ltv_pct: 85.0,
      typical_funding_cost_pct: 3.85,
      net_carry_spread_pct: 1.57,
      min_premium_usd: 500000,
      policy_loan_interest_pct: 5.00,
      margin_call_drop_buffer_pct: 20.0
    },
    underwriting_concessions: {
      simplified_health_declaration: false,
      max_non_medical_limit_usd: 5500000,
      special_waiver_notes: "安盛私銀專項審批，特設家族信託質押專案通道"
    },
    clause_highlights: [
      "安盛頂尖環球資產配置操盤，現行結算利率 5.42%，保證最低利率 2.25%",
      "融資最高成數 85% LTV，淨息差空間 1.57%，退保費用期僅 3 年",
      "全流程支援各類家族辦公室離岸信託質押融資架構，資產隔離保護完備",
      "首年大額保費享最高 6.0% 回贈，有效平抑前期借貸利息支出"
    ],
    clause_pitfalls: [
      "浮動派息率定期調整，若環球債券收益率走低，派息率可能隨之下調",
      "私人銀行設有追繳保證金警戒線，借款人需承擔市場利率波動追加抵押品義務",
      "前 3 年退保需繳付退保手續費，未滿期退出將造成資金折減",
      "躉繳進場門檻 500,000 美元，需配合嚴格的專業投資者背景審查"
    ],
    last_updated: "2026-11-06",
    audit_metadata: {
      source_type: "Official_Circular",
      confidence_level: "Verified",
      verified_by_editor: true,
      created_at: "2026-11-06T00:00:00Z",
      official_source_attribution: "安盛保險官方通函 Ref: AXA-SOVEREIGN-UL-2026；保監局檔案: POL-AXA-UL-SOV"
    }
  }
];

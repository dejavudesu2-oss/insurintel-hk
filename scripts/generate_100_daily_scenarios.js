/**
 * scripts/generate_100_daily_scenarios.js
 * Generates src/data/daily_100_scenarios.json with exactly 100 real-world Hong Kong insurance scenarios
 * and multi-agent comments from 6 specialized personas:
 * 1. Actuary & Regulatory Auditor (精算師與監管合規審計官)
 * 2. MDRT/COT Top Producer (百萬圓桌頂尖百萬顧問)
 * 3. Agency District Director (保險區域總監 DD)
 * 4. High-Net-Worth Client / Retail Policyholder (高淨值客戶/零售投保人)
 * 5. Brokerage Compliance Officer (獨立經紀行合規總監 CCO)
 * 6. SaaS Commercial Pricing PM (SaaS 商業定價產品經理)
 */

import fs from 'fs';
import path from 'path';

// Define the 10 domains
const DOMAINS = [
  {
    code: 'Coffee_Shop_Rapid_Pitches',
    zh: '咖啡館 30 秒極速對抗與臨場促成',
    description: '街頭與咖啡館即時見客、30秒電梯話術、競品回贈促銷拆解、單手快速攻防',
    tier: 'AdvisorPro_HKD199',
    price: 199
  },
  {
    code: 'Cross_Border_MCV_Inbound',
    zh: '內地訪港旅客與高鐵站/機場極速會客',
    description: '抵港高鐵西九龍站/機場會客、美元/人民幣雙幣配置、千家內地三甲醫院直付、入境小白條在港合法簽署',
    tier: 'AdvisorPro_HKD199',
    price: 199
  },
  {
    code: 'High_Net_Worth_Wealth_Preservation',
    zh: '高淨值家族辦公室財富傳承與萬用保費融資',
    description: '萬用壽險 (UL) 85% LTV 保費融資、第二受保人、保單分拆 (Policy Split)、信託式分期給付、CRS 跨代資產隔離',
    tier: 'Enterprise_HKD12800',
    price: 12800
  },
  {
    code: 'Critical_Illness_Defense',
    zh: '重疾險條款穿透與核保加費抗辯',
    description: '癌症二次復發等候期 (1年 vs 3年)、深切治療部 (ICU) 入住預支、128種疾病多重索償、家族病史與甲狀腺/脂肪肝核保加費抗辯',
    tier: 'AdvisorPro_HKD199',
    price: 199
  },
  {
    code: 'Private_Hospital_Cashless_LOG',
    zh: '全港13家私院入院免按金與出院免找數爭議',
    description: '養和、港怡、中大等13家私院出院免找數 (LOG) 擔保、癌症標靶自費藥全額理賠、無 Agent 網上醫保入院押金爭議',
    tier: 'Retail_HKD49',
    price: 49
  },
  {
    code: 'District_Morning_Briefings',
    zh: '區域晨會 06:30 賦能、早報分發與新人育成',
    description: '全區 20-50 位顧問每日清晨早報同步、大屏投影早會速報 (morning_slides.html)、新人對抗演練、從銀行/財富管理挖角招募',
    tier: 'AgencyTeam_HKD2480',
    price: 2480
  },
  {
    code: 'Retirement_QDAP_Tax_Relief',
    zh: '延期年金法定扣稅與退休現金流鎖定',
    description: 'HK$60,000 / HK$120,000 法定退稅、17% 頂階稅率慳足 $10,200 / $20,400、保證年金現金流佔比 (>80%)、抵抗通脹',
    tier: 'AdvisorPro_HKD199',
    price: 199
  },
  {
    code: 'Regulatory_Audits_Compliance',
    zh: '保監局 GL20 合規守則、GN16 實現率走廊審計與防範轉保',
    description: '保監局 (HKIA) 操守守則審計、防止誤導性轉保 (Twisting)、嚴禁非法回佣 (Section 64G)、利益說明書保證與非保證徹底解耦',
    tier: 'Enterprise_HKD12800',
    price: 12800
  },
  {
    code: 'Macro_Economic_Stress_Testing',
    zh: '宏觀降息加息週期、匯率震盪與金融海嘯壓力測試',
    description: '聯儲局降息週期分紅稀釋、HIBOR 飆升致保費融資倒掛與追繳保證金 (Margin Call)、70% 悲觀分紅壓力測試、日圓/英鎊匯率套利',
    tier: 'AdvisorPro_HKD199',
    price: 199
  },
  {
    code: 'Commercial_SaaS_Pricing_Decisions',
    zh: 'SaaS 商業化採購決策：HK$49 零售 vs HK$199 個人 vs HK$2,480 團隊 vs HK$12,800 經紀行',
    description: '各角色付費意願 (WTP)、轉化漏斗、帳號共享防範、單次查核與團隊授權價值 ROI 測算、價格敏感度與異議化解',
    tier: 'AgencyTeam_HKD2480',
    price: 2480
  }
];

// Helper to construct 100 scenario definitions
const rawScenarios = [
  // -------------------------------------------------------------
  // DOMAIN 1: Coffee Shop Rapid Pitches (SC001 - SC010)
  // -------------------------------------------------------------
  {
    num: 1,
    domainIdx: 0,
    title: '中環 IFC Pacific Coffee · 友邦盈御 3 vs 保誠雋富 30秒回本對決',
    location: '中環 IFC Mall 2 樓 Pacific Coffee',
    client: '35歲金融投行 VP，趁下午 15 分鐘咖啡時間見客',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 盈御多元貨幣計劃 3', '保誠 雋富多元貨幣計劃'],
    context: '客戶手握保誠雋富建議書，強調首年高達 28% 回贈；我方顧問需在嘈雜環境下用手機快速指出友邦第 6 年保證回本及歷史 GN16 穩定性優勢。',
    challenge: '客戶對競品高宣傳回贈心動，質疑友邦名義回贈僅 22%，要求在 30 秒內給出說服理由。',
    actuaryFeature: '保證現金價值回本年期 (Guaranteed Breakeven Year) 與 GN16 累積實現率走廊 (96.5% vs 91.2%)。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 2,
    domainIdx: 0,
    title: '尖沙咀海港城 Starbucks · 宏利宏摯 5.5% 鎖定利率與永明萬年青長線 IRR 攻防',
    location: '尖沙咀海港城港威商場 Starbucks',
    client: '42歲外貿企業主，著重前5年現金流安全與長線美元抗通脹',
    category: 'Savings_MultiCurrency',
    insurers: ['Manulife', 'Sun_Life'],
    products: ['宏利 宏摯多元儲蓄計劃', '永明 萬年青多元儲蓄計劃'],
    context: '宏利以首兩年高達 5.5% 預繳保證利息吸引客戶，永明顧問則利用 InsurIntel 展示第 20/30 年總 IRR 永明領先 0.4% 的複利差距。',
    challenge: '短期預繳噱頭與長期複利價值的權衡，客戶難以直觀計算折現值。',
    actuaryFeature: '第 20/30 年預期總內部回報率 (IRR 6.85% vs 6.45%) 及預繳利息鎖定真實淨年化。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 3,
    domainIdx: 0,
    title: '銅鑼灣利園 The Coffee Academics · 互聯網純網保險 Bowtie Pink vs 安盛智尊明月直付對比',
    location: '銅鑼灣利園二期 The Coffee Academics',
    client: '29歲科技公司工程師，奉行數字極簡主義，偏向線上投保 Bowtie',
    category: 'Medical_VHIS',
    insurers: ['Bowtie', 'AXA'],
    products: ['Bowtie Pink 自願醫保 (靈活計劃)', '安盛 智尊明月自願醫保'],
    context: '客戶主張 Bowtie 保費便宜 35%，安盛顧問調出全港 13 家私院 LOG 直付名冊，指出 Bowtie 無 Agent 現場代辦且越級病房設 50% 折減罰則。',
    challenge: '自願醫保純線上自主索償 vs 傳統保司全流程出院免找數與專人管家服務的價值差距。',
    actuaryFeature: '自願醫保半私家房全數賠償條款、自負額靈活性及私立醫院預先批核網絡覆蓋。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 4,
    domainIdx: 0,
    title: '金鐘太古廣場 Cova · 年輕執業大律師要求 45 秒內拆解保證與非保證分紅曲線',
    location: '金鐘太古廣場 3 樓 Cova Pasticceria',
    client: '32歲訴訟大律師，極度挑剔文字邏輯與精算確定性',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'FWD'],
    products: ['友邦 盈御多元貨幣計劃 3', '富衛 盈豐多元儲蓄計劃'],
    context: '大律師客戶嚴禁顧問口頭保證任何非條款承諾，要求在手機瀏覽器直接拖動「保證利益 vs 非保證分紅」分離滑桿驗證真實法律約束力。',
    challenge: '專業法律背景客戶對保險公司紅利平滑機制 (Smoothing Mechanism) 的質疑與合規查證。',
    actuaryFeature: '保證現金價值與非保證歸原紅利/終期紅利的精算雙軌分拆及合約強制執行力。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 5,
    domainIdx: 0,
    title: '旺角朗豪坊 Starbucks · 自由職業自由職業者對比零自負額醫保與高自負額醫保',
    location: '旺角朗豪坊 4 樓 Starbucks',
    client: '27歲獨立攝影師，月入浮動 HK$35,000，無公司團險保障',
    category: 'Medical_VHIS',
    insurers: ['FWD', 'Prudential'],
    products: ['富衛 尊衛您自願醫保計劃', '保誠 保誠自願醫保尚賓計劃'],
    context: '客戶在零自負額（保費昂貴）與 HK$20,000 自負額（需自掏腰包）間糾結，顧問需用手機秒級試算小手術時的現金流衝擊。',
    challenge: '年輕自由職業者抗風險預算有限，如何在有限保費下獲取全額無細項上限醫療保障。',
    actuaryFeature: '全港 13 家私院日間內窺鏡（腸胃鏡）全額涵蓋與自負額階梯搭配。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 6,
    domainIdx: 0,
    title: '沙田新城市廣場 Lady M · 中小學教師對比友邦加裕智倍保與保誠危疾加倍保等候期',
    location: '沙田新城市廣場一期 Lady M',
    client: '36歲資深中學教師，兩孩母親，家族有乳腺癌病史',
    category: 'Critical_Illness',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 加裕智倍保 3', '保誠 危疾加倍保'],
    context: '客戶對癌症再次復發極度焦慮，顧問展示友邦癌症間隔僅 1 年賠償 100% 保額，對手需等足 3 年的條款穿透對比。',
    challenge: '癌症等候期 1 年 vs 3 年的精算成本與家庭救命錢時間窗口對抗。',
    actuaryFeature: '癌症二次等候間隔 (1 Year vs 3 Years)、深切治療部 (ICU) 入住即預支 20% 保額。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 7,
    domainIdx: 0,
    title: '觀塘創紀之城 Pacific Coffee · SME 科技園創業者尋找 5 年保證回本的過剩現金配置',
    location: '觀塘創紀之城五期 APM Pacific Coffee',
    client: '45歲軟件外包公司老闆，欲將企業 HK$2,000,000 閒置現金停泊於保單',
    category: 'Savings_MultiCurrency',
    insurers: ['ChinaLife', 'AIA'],
    products: ['中國人壽海外 裕饒多元儲蓄計劃', '友邦 盈御多元貨幣計劃 3'],
    context: '企業主拒絕長期鎖定，要求第 5 年必須無損回本以備業務周轉，國壽海外以短期保證回本速度抗衡友邦。',
    challenge: '短期保證現金價值增速 vs 長期非保證分紅天花板的精算取捨。',
    actuaryFeature: '第 5 年保證現金價值佔比、早期退保扣除率及企業退保流動性。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 8,
    domainIdx: 0,
    title: '灣仔合和中心 Nino Lounge · 準退休人士懷疑 10 年鎖定期，對比中銀延年福與永明 QDAP',
    location: '灣仔合和中心 Nino Lounge',
    client: '58歲即將退休公務員，追求確定月派年金，排斥股票波動',
    category: 'Annuity_QDAP',
    insurers: ['BOC_Life', 'Sun_Life'],
    products: ['中銀人壽 延年福延期年金計劃', '永明金融 延期年金計劃'],
    context: '客戶即將領取退休金，需確保每月準時有 HK$8,000 入賬，顧問調出中銀保證年金比例高達 86% 的雷達對抗圖。',
    challenge: '保證年金比例 (Guaranteed Cashflow Share) 與總預期年金金額的博弈。',
    actuaryFeature: '保證 IRR 2.92% vs 浮動 IRR、保證年金給付期至 85 歲或 100 歲。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 9,
    domainIdx: 0,
    title: '中環置地廣場 Fuel Espresso · 客戶出示友商宣傳單 28% 首年回贈，顧問即時查核鎖定條款',
    location: '中環置地廣塲地下 Fuel Espresso',
    client: '38歲私募股權投資總監，手持競品促銷宣傳單質問為何我方折扣僅 18%',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential', 'AIA'],
    products: ['保誠 雋富多元貨幣計劃 (推廣期特別版)', '友邦 盈御多元貨幣計劃 3'],
    context: '顧問啟動 InsurIntel 回贈計算器，揭露競品 28% 回贈需要求同時捆綁高額醫療險且保費達 USD 100,000，且次年退保需全額追回。',
    challenge: '破除市場宣傳單套路噱頭，將宣傳折扣拆解為真實內部回報率影響值。',
    actuaryFeature: '首年折扣分攤後的平攤 IRR、條款附帶條件 (Clawback Clause) 與捆綁附加險要求。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 10,
    domainIdx: 0,
    title: '鰂魚涌太古坊 ArtisTree Cafe · 跨國企業高管已有團險 Bupa，評估加配 HK$25,000 自負額高端自願醫保',
    location: '鰂魚涌太古坊康橋大廈 ArtisTree Cafe',
    client: '40歲美資科技大廠亞太區總監，享有公司頂級 Bupa 團體醫療',
    category: 'Medical_VHIS',
    insurers: ['AXA', 'Bowtie'],
    products: ['安盛 智尊明月自願醫保 (靈活計劃)', '保泰 Bowtie Pink 自願醫保'],
    context: '客戶自恃有公司醫療，顧問運用「團險 Top-up 雙層優化算法」展示 HK$25k 自負額使保費劇降 48%，同時解決退休後斷保與無上限癌症化療覆蓋。',
    challenge: '讓擁有優厚雇主福利的白領意識到退休斷保危機與百萬非手術癌症藥物的盲區。',
    actuaryFeature: '自負額墊底無縫銜接團險、保證終身續保條款 (Guaranteed Renewable) 及癌症標靶全數理賠。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },

  // -------------------------------------------------------------
  // DOMAIN 2: Cross-Border MCV Inbound Clients (SC011 - SC020)
  // -------------------------------------------------------------
  {
    num: 11,
    domainIdx: 1,
    title: '高鐵西九龍站貴賓候車室 · 深圳南山科技高管抵港 配置每年 10 萬美元儲蓄險',
    location: '香港西九龍站 G 樓商務貴賓室',
    client: '38歲深圳騰訊技術總監，帶妻子赴港度週末並簽署保單',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 盈御多元貨幣計劃 3', '宏利 宏摯多元儲蓄計劃'],
    context: '客戶僅有 1 小時停留時間，顧問現場運用手機離線模式即時演算 10 萬美元年繳保費在 9 種主流世界貨幣間的轉換收益與傳承分拆。',
    challenge: '跨境通關時間緊迫，需現場出具符合香港保監局合規指引的中立客觀對比摘錄。',
    actuaryFeature: '貨幣轉換選項 (Currency Switch)、每年保單分拆 (Policy Split Option) 與美金對沖匯率。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 12,
    domainIdx: 1,
    title: '香港國際機場 T1 離境大堂翡翠拉麵 · 廣州製造業老闆要求免體檢特快核保 150 萬美元人壽',
    location: '赤鱲角香港國際機場客運大樓離境大堂',
    client: '52歲廣州精密模具企業主，即將登機前往歐洲參展',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 財智萬用壽險 (Platinum UL)', '保誠 尊尚萬用壽險'],
    context: '企業主有輕微三高，要求在不進行繁複空腹驗血體檢的前提下完成大額人壽投保，顧問調出免體檢限額 (Simplified Underwriting Limit) 數據。',
    challenge: '高淨值免體檢綠色通道 (Simplified Underwriting USD 1.5M) 的核保底線與承保彈性。',
    actuaryFeature: '高額免驗身保額上限、財富來源 (Source of Wealth) 合規審查與入境小白條即時驗證。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 13,
    domainIdx: 1,
    title: '尖沙咀廣東道馬哥孛羅酒店 · 上海母親為 8 歲女兒投保重疾 驗證內地千家三甲醫院免赴港理賠',
    location: '尖沙咀廣東道馬哥孛羅香港酒店大堂酒廊',
    client: '34歲上海金融機構主管，專程陪女兒來港迪士尼遊玩兼投保',
    category: 'Critical_Illness',
    insurers: ['FWD', 'AIA'],
    products: ['富衛 危疾加諾保', '友邦 加裕智倍保 3'],
    context: '母親最擔憂日後理賠需頻繁往返香港，顧問調出 InsurIntel 內置之 1,000+ 家內地三甲公立醫院認可清單與跨境郵寄診斷即時在線賠付流程。',
    challenge: '消除跨境投保人在理賠便捷性、醫院資質互認及跨境資金電匯入賬上的疑慮。',
    actuaryFeature: '內地三甲公立醫院直付與理賠認可標準、跨境免赴港理賠程序及身故受益人跨國清算。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 14,
    domainIdx: 1,
    title: '金鐘太古廣場保司簽約中心 · 入境標籤（小白條）合法在港簽署存檔與反洗錢 (AML) 審核',
    location: '金鐘太古廣場一座保險公司跨境簽單認證中心',
    client: '46歲成都房地產投資人，首次赴港簽署大額萬用壽險',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Sun_Life'],
    products: ['友邦 盈御多元貨幣計劃 3', '永明 萬年青多元儲蓄計劃'],
    context: '客戶入境時遺失紙質小白條，顧問指導其透過香港入境處線上 App 即時下載電子入境標籤並存檔，確保保單合約符合香港法例第 41 章要求。',
    challenge: '嚴格遵守香港保監局在港境內簽署核實法例，防範地下保單與跨境違規招攬風險。',
    actuaryFeature: '香港保險業監管局跨境簽署法定留痕、電子入境記錄 (Landing Slip) 驗證與合規要件。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 15,
    domainIdx: 1,
    title: '中區太子大廈置地 Cafe · 北京家族資產配置 美元兌人民幣匯率走勢與離岸對沖',
    location: '中環太子大廈二樓 Landmark Cafe',
    client: '50歲北京互聯網早期投資人，希望在港配置 50 萬美元以平衡匯率風險',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential', 'AXA'],
    products: ['保誠 雋富多元貨幣計劃', '安盛 愛意多元儲蓄計劃'],
    context: '客戶詢問未來 10 年若人民幣升值保單是否受損，顧問透過實時多幣種換算引擎展示一鍵鎖定美元與隨時分流至歐元/日圓/英鎊的套期保值。',
    challenge: '跨境資產配置的匯率波動心理抗拒與多幣種自由切換的無成本優勢展示。',
    actuaryFeature: '多達 9 種保單幣種轉換條款、保證匯率折算點與無限次更改受保人年齡順延。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 16,
    domainIdx: 1,
    title: '九龍站圓方商場 3 樓 Cafe · 杭州電商新貴為 3 名子女規劃「保單分拆」與跨代傳承',
    location: '九龍站圓方商場 Elements 3 樓 Cafe Deco Pizzeria',
    client: '43歲杭州頭部直播電商合夥人，育有兩子一女',
    category: 'Savings_MultiCurrency',
    insurers: ['Manulife', 'AIA'],
    products: ['宏利 宏摯多元儲蓄計劃', '友邦 盈御多元貨幣計劃 3'],
    context: '客戶希望一份 100 萬美元保單未來能等額分拆為 3 份獨立保單傳給 3 個子女，顧問展示 InsurIntel 保單分拆模擬演算。',
    challenge: '多子女家庭財富公平傳承、避免遺產糾紛與保單拆單後的獨立分紅運作。',
    actuaryFeature: '保單生效第 3 年起無限次自由分拆條款 (Policy Split)、第二受保人提前指定。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 17,
    domainIdx: 1,
    title: '海運大廈露天咖啡座 · 廣州客戶質疑香港自願醫保是否真能涵蓋廣州中山一院與省人民醫院直付',
    location: '尖沙咀海運大廈末端 AL MOLO Cafe',
    client: '41歲廣州外資高管，常駐大灣區，對醫療險出險流程高度敏感',
    category: 'Medical_VHIS',
    insurers: ['AIA', 'Bowtie'],
    products: ['友邦 至尊明珠高端自願醫保', '保泰 Bowtie Pink 自願醫保'],
    context: '客戶在內地買過百萬醫療險常遇理賠扯皮，顧問調出廣州中山大學附屬第一醫院、廣東省人民醫院等大灣區核心醫院名錄與直接結算流程。',
    challenge: '內地社保體系投保人對香港高端自願醫保免找數擔保函 (LOG) 的信任鴻溝。',
    actuaryFeature: '大灣區及內地千家三甲醫院直付網絡、無免賠額進口自費藥全包及跨境理賠綠色通道。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 18,
    domainIdx: 1,
    title: '紅磡港鐵站大堂美心西餅座 · 跨境通勤白領對比香港延期年金與內地個人養老金稅收優惠',
    location: '港鐵紅磡站大堂旅客等候區',
    client: '33歲香港工作、深圳居住的跨境通勤工程師，擁有兩地納稅人身份',
    category: 'Annuity_QDAP',
    insurers: ['Prudential', 'BOC_Life'],
    products: ['保誠 雋逸延期年金計劃', '中銀人壽 延年福延期年金計劃'],
    context: '客戶在內地已開立每年 12,000 元個人養老金賬戶，詢問在香港再購買 QDAP 能否享有每年 6 萬港元雙重避稅效益。',
    challenge: '深港兩地雙重稅務居民的法定退休年金與薪俸稅扣稅額協同規劃。',
    actuaryFeature: '香港稅務條例第 112 章 QDAP 60,000 港元扣稅與年金現金流折現 IRR。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 19,
    domainIdx: 1,
    title: '香港大學站薄扶林道 Pacific Coffee · 留港內地畢業生 (IANG) 規劃首份重疾與醫療險組合',
    location: '薄扶林道港大百周年校園 Pacific Coffee',
    client: '25歲港大碩士畢業生，獲 IANG 簽證在港初入職投行分析員',
    category: 'Critical_Illness',
    insurers: ['AIA', 'FWD'],
    products: ['友邦 加裕智倍保 3', '富衛 尊衛您自願醫保'],
    context: '年輕 IANG 白領預算有限（月可存 HK$3,000），顧問使用「60/40 年輕家庭槓桿算法」為其搭建 Term + CI + VHIS 的極致槓桿架構。',
    challenge: '年輕客群低預算與高額保障需求的矛盾，需防止過早被高保費儲蓄險佔用流動資金。',
    actuaryFeature: '定期人壽 (Term) + 終身多次重疾 (CI) + 半私家高端醫保的年繳保費槓桿比 (1:800)。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 20,
    domainIdx: 1,
    title: '中環 7 號天星碼頭 Watermark · 跨境大額外匯結匯合規路徑與理賠款合法原路返還諮詢',
    location: '中環天星碼頭 2 樓 Watermark 餐廳',
    client: '55歲佛山民營製造業上市公司大股東，諮詢 300 萬美元保費的繳費與未來賠償入賬管道',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 財智萬用壽險 (Universal Life)', '宏利 宏達萬用壽險'],
    context: '客戶極度關注資金進出合規性，顧問援引香港保監局條例與中國外匯管理局法規，明確理賠支票由保司直接合法電匯客戶境外/境內外匯賬戶路徑。',
    challenge: '大額外匯跨境監管政策與身故/分紅合法資金清算流轉的法律安全確認。',
    actuaryFeature: '保險金跨境結匯法定程序、信託式月付身故賠償分配與海外銀行承兌路徑。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },

  // -------------------------------------------------------------
  // DOMAIN 3: HNW Family Wealth Preservation (SC021 - SC030)
  // -------------------------------------------------------------
  {
    num: 21,
    domainIdx: 2,
    title: '交易廣場一座私人銀行部 · 科技獨角獸創始人 500 萬美元萬用壽險 85% LTV 保費融資',
    location: '中環交易廣場一座 38 樓瑞銀私人財富管理部',
    client: '44歲赴美上市 SaaS 創始人，需以 15% 實繳本金撬動 2,500 萬美元人壽保障',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 財智萬用壽險 (Platinum UL)', '宏利 宏達萬用壽險'],
    context: '私銀提供 HIBOR + 1.4% 貸款，保司宣告派息 5.25%，顧問現場計算淨利差 (Net Spread 1.45%) 及防範利率倒掛的利息保護閥。',
    challenge: '保費融資 (Premium Financing) 在高息環境下的息差套利空間與追加保證金風險防範。',
    actuaryFeature: '85% LTV 保費融資成數、淨利差空間 (Carry Spread) 及抗加息 200bps 敏感度測試。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 22,
    domainIdx: 2,
    title: '太平山頂種植道獨立洋房 · 家族第二受保人 (Contingent Insured) 設置 規避香港遺產承辦',
    location: '山頂種植道私人莊園會議室',
    client: '72歲香港本地傳統家族長老，手握多處物業與上市股份',
    category: 'Savings_MultiCurrency',
    insurers: ['Sun_Life', 'Prudential'],
    products: ['永明 萬年青多元儲蓄計劃', '保誠 雋富多元貨幣計劃'],
    context: '長老欲確保身後數千萬資產不進入長達 2 年的遺產承辦處 (Probate Court) 凍結審核，顧問展示透過指定第二受保人實現保單所有權瞬間自動順延。',
    challenge: '高淨值客戶對繁複法律承辦手續的排斥，與保險法代際穿透優勢的深度結合。',
    actuaryFeature: '無限次更改受保人至 128 歲、第二受保人自動生效條款與防範爭產訴訟屏障。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 23,
    domainIdx: 2,
    title: '淺水灣道豪宅露台 · 家族辦公室 CFO 比較保單分拆 (Policy Split) 與離岸信託昂貴管理費',
    location: '淺水灣道獨立大宅海景露台',
    client: '48歲香港聯合家族辦公室合夥人兼財務總監 (CFO)',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'AXA'],
    products: ['友邦 盈御多元貨幣計劃 3', '安盛 愛意多元儲蓄計劃'],
    context: 'CFO 指出設立開曼/澤西島離岸信託每年維護費高達 3-5 萬美元，顧問展示保單內置之免費「保單分拆」與「信託式分期給付」可零成本替代小型信託。',
    challenge: '傳統離岸信託的高門檻與保單信託化 (Policy Trustification) 輕量靈活替代方案的精算對比。',
    actuaryFeature: '保單身故保險金分期信託提取、每年免費拆單分配與代際私密資產隔離。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 24,
    domainIdx: 2,
    title: '置地文華東方酒店 Amber · 隔代資產傳承：祖父投保、父親受保、孫輩後續持有人架構設計',
    location: '中環置地文華東方酒店米芝蓮二星餐廳 Amber',
    client: '65歲珠寶連鎖集團創辦人，著重三代直通傳承',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential', 'AIA'],
    products: ['保誠 雋富多元貨幣計劃', '友邦 盈御多元貨幣計劃 3'],
    context: '祖父擔憂第二代婚姻變故可能導致家族資產被兒媳/女婿分走，顧問架構「祖父投保、直接跨代指定孫子為最終受益人」的不可撤銷信託結構。',
    challenge: '家族二代婚姻財產分割風險下的隔代定向傳承與保險金專屬權益保護。',
    actuaryFeature: '不可撤銷受益人指定 (Irrevocable Beneficiary)、保單所有權代際轉移條款。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 25,
    domainIdx: 2,
    title: '國際金融中心二期 68 樓會議室 · 萬用壽險利率壓力測試：美聯儲若意外加息 200bps 之斷頭平倉線',
    location: '中環 IFC 二期 68 樓外資投行宏觀對沖研究室',
    client: '47歲宏觀對沖基金合夥人，持有 800 萬美元融資萬用壽險',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 財智萬用壽險', '宏利 宏達萬用壽險'],
    context: '客戶要求模擬若 HIBOR 飆升至 6.5% 導致淨息差由正轉負時，保單需質押多少額外抵押品才能避免私銀強制斬倉。',
    challenge: '極端加息週期下保費融資槓桿的脆弱性分析與動態補倉安全墊測算。',
    actuaryFeature: '質押率維持線 (Margin Maintenance Ratio)、利差倒掛敏感度與保單退保扣減階梯。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 26,
    domainIdx: 2,
    title: '灣仔香港會議展覽中心 VIP 室 · 企業破產隔離架構：不可撤銷保單受益人 vs 破產管理署追索權',
    location: '灣仔會展中心新翼 VIP 貴賓會議室',
    client: '51歲航運物流集團董事長，行業面臨全球運價下行壓力',
    category: 'Financing_UniversalLife',
    insurers: ['AXA', 'AIA'],
    products: ['安盛 萬用壽險優越版', '友邦 財智萬用壽險'],
    context: '董事長諮詢在企業發生連帶擔保清算時，個人名下保單的現金價值能否合法對抗破產管理署的債權人追索。',
    challenge: '普通法架構下《破產條例》第 49 條欺詐性轉讓審查與保險信託利益的防火牆效能。',
    actuaryFeature: '人壽保單人身權益不可扣押性、提早 5 年佈局規避追溯期及不可撤銷信託登記。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 27,
    domainIdx: 2,
    title: '數碼港三座 Executive Suite · 擬赴美上市科技高管套現 200 萬美元 佈局多幣種保證現金流保單',
    location: '薄扶林數碼港三座高級行政套房',
    client: '39歲AI芯片公司聯席創始人，完成 Pre-IPO 股權轉讓',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Sun_Life'],
    products: ['友邦 盈御多元貨幣計劃 3', '永明 萬年青多元儲蓄計劃'],
    context: '高管將股權套現資金分為兩部分：60% 追求高預期分紅，40% 要求在第 6 年起開始鎖定每年保證提取 4% 現金流作為家庭日常開銷。',
    challenge: '高波動資產套現後對絕對防禦型被動現金流的強烈渴望與保單部分退保算法。',
    actuaryFeature: '定期非保證與保證現金提取 (Cash Withdrawal) 算法對保單餘額的精算衰減模型。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 28,
    domainIdx: 2,
    title: '跑馬地馬會會所 5 樓私房菜 · 頂尖心臟名醫為二世祖設計「信託式月付身故撫養金」防揮霍',
    location: '跑馬地山光道香港賽馬會會所 5 樓私房菜',
    client: '62歲養和醫院特約名譽心臟專科顧問醫生，獨生子生活揮霍',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential', 'Manulife'],
    products: ['保誠 雋富多元貨幣計劃', '宏利 宏摯多元儲蓄計劃'],
    context: '名醫拒絕身故後一次性發放 5,000 萬港元身故金給兒子，顧問演示保單內置之每月發放 HK$100,000 直至 60 歲的防揮霍機制。',
    challenge: '高淨值父母對子女「敗家（Spendthrift）」的深刻恐懼，與保單類年金化信託分配的精準結合。',
    actuaryFeature: '身故賠償分期給付選項 (Installment Death Benefit)、未領取身故金按 3% 複利積存。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 29,
    domainIdx: 2,
    title: '上環中景商業大廈 20 樓 · 內地及香港雙重稅籍高淨值客戶 申報 CRS 共同申報準則評估',
    location: '上環干諾道中中景商業大廈家族稅務諮詢室',
    client: '53歲跨境進出口貿易集團總裁，擁有香港永久性居民身份並在內地有多處實業',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'ChinaLife'],
    products: ['友邦 盈御多元貨幣計劃 3', '中國人壽海外 裕饒多元儲蓄計劃'],
    context: '客戶詢問香港保單的現金價值在 OECD CRS 架構下向內地稅務局交換信息的具體門檻與法律界限。',
    challenge: '跨境資產申報合規 transparency 與個人隱私保護邊界的精準釐清。',
    actuaryFeature: '保險合約現金價值 CRS 金融賬戶歸類準則、保單持有人稅務居民身份核實要求。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 30,
    domainIdx: 2,
    title: '九龍塘達之路獨立別墅 · 家族企業關鍵人保險 (Keyman Insurance) 配合銀行信貸額度質押',
    location: '九龍塘達之路花園洋房會客廳',
    client: '56歲香港老牌連鎖餐飲集團董事長，正向恒生銀行申請 8,000 萬港元信貸展期',
    category: 'Financing_UniversalLife',
    insurers: ['Manulife', 'AIA'],
    products: ['宏利 宏達萬用壽險', '友邦 財智萬用壽險'],
    context: '銀行要求企業必須為董事長購買保額不少於 5,000 萬港元的關鍵人壽險並做保單轉讓 (Assignment of Policy) 作為授信前置條件。',
    challenge: '企業融資擔保與大額關鍵人壽險的保費支出稅務扣除及轉讓協議合規對接。',
    actuaryFeature: '保單絕對轉讓 (Absolute Assignment) 予商業銀行、企業所得稅下保費扣除與身故保障。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },

  // -------------------------------------------------------------
  // DOMAIN 4: Critical Illness Defense & Underwriting (SC031 - SC040)
  // -------------------------------------------------------------
  {
    num: 31,
    domainIdx: 3,
    title: '銅鑼灣時代廣場醫療中心 18 樓 · 甲狀腺微小乳頭狀癌微創手術 爭取早期危疾預支 20% 理賠',
    location: '銅鑼灣時代廣場一座 18 樓內分泌外科專科診所',
    client: '33歲外企公關經理，體檢超聲波發現 0.8cm 甲狀腺結節確診微小癌',
    category: 'Critical_Illness',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 加裕智倍保 3', '保誠 危疾加倍保'],
    context: '保險公司傳統條款往往將未擴散微小癌列為除外，顧問利用條款對比展示我方計劃明確納入早期甲狀腺癌 20% 預支並豁免後續保費。',
    challenge: '早期原位癌與微小癌的定義爭議、理賠預支比例與主險保額按比例扣減的透明度。',
    actuaryFeature: '早期危疾涵蓋病種定義 (39種早期)、微小甲狀腺癌賠付條件及後續保費豁免。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 32,
    domainIdx: 3,
    title: '尖沙咀新港中心 Pacific Coffee · 癌症二次復發間隔：友邦 1 年持續期 vs 保誠 3 年無癌期生死時速',
    location: '尖沙咀新港中心地下 Pacific Coffee',
    client: '37歲乳腺癌術後 2 年康復者家屬，急需為妹妹投保最優防復發危疾險',
    category: 'Critical_Illness',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 加裕智倍保 3', '保誠 危疾加倍保'],
    context: '顧問現場調出腫瘤醫學復發統計，指出乳腺癌與肺癌多在術後第 1–2 年出現轉移，保誠需熬足 3 年且要求完全緩解，友邦滿 1 年仍持續治療即可理賠。',
    challenge: '腫瘤復發間隔條款醫學常識與保司精算限制的深度對決，直擊客戶痛點。',
    actuaryFeature: '癌症持續/復發/擴散等候期 (Cancer Waiting Period 1 Year vs 3 Years) 條款穿透。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 33,
    domainIdx: 3,
    title: '中環中建大廈 12 樓名醫診所 · 深切治療部 (ICU) 入住 120 小時 非指定疾病預支 20% 救命錢',
    location: '中環中建大廈 12 樓呼吸系統名醫診室門外',
    client: '45歲建築工程合夥人，因急性重症肺炎引發呼吸衰竭需插喉入住 ICU',
    category: 'Critical_Illness',
    insurers: ['AIA', 'FWD'],
    products: ['友邦 加裕智倍保 3', '富衛 危疾加諾保'],
    context: '傳統重疾險必須符合嚴格 120 種疾病定義才賠，客戶所患並非標準疾病，顧問調出友邦獨有之「連續入住 ICU 達 120 小時直接預支 20%」保障。',
    challenge: '新型未知突發病毒或複合重症在傳統列舉式條款下的保障真空問題。',
    actuaryFeature: '非指定疾病入住深切治療部 (ICU) 額外保障、通氣支持達標條件與賠償天花板。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 34,
    domainIdx: 3,
    title: '沙田帝都酒店宴會廳前廳 · 心血管與中風多次賠償對比：高達 900% 總賠償額之精算天花板',
    location: '沙田帝都酒店三樓宴會前廳',
    client: '49歲科技公司技術專家，有輕度動脈硬化，注重心臟與中風多次保障',
    category: 'Critical_Illness',
    insurers: ['Prudential', 'Sun_Life'],
    products: ['保誠 危疾加倍保', '永明 永明安逸危疾保'],
    context: '顧問透過 InsurIntel 多次賠付雷達對抗，拆解保誠多重賠償高達 900% 與永明 800% 的癌症、心臟病、中風累計次數限制與等候間隔。',
    challenge: '多次索償條款中的年齡限制（如 85 歲前）與每次索償的間隔年期（心臟病 1 年 vs 2 年）。',
    actuaryFeature: '主要危疾多次賠償總額上限 (Multiple Claim Limit 900%)、心腦血管二次索償規則。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 35,
    domainIdx: 3,
    title: '威爾斯親王醫院外李寶椿大樓 Cafe · 母親直系親屬乳腺癌病史：安盛加費 25% vs 富衛標準體平手通過',
    location: '沙田威爾斯親王醫院臨床腫瘤科對面咖啡座',
    client: '30歲新婚女註冊護士，母親曾患乳腺癌，自身超聲波乳房纖維瘤',
    category: 'Critical_Illness',
    insurers: ['AXA', 'FWD'],
    products: ['安盛 康齊危疾保', '富衛 危疾加諾保'],
    context: '安盛核保部判定需加費 25% 且除外乳腺乳房疾病，顧問利用富衛核保指南之「良性纖維瘤病理報告確認」成功爭取以標準保費承保且無除外。',
    challenge: '保險公司核保部（Underwriting Desk）對家族癌症史與良性乳腺病變的保守偏見反抗。',
    actuaryFeature: '核保指引差異 (Underwriting Guidelines)、加費 (Loading) 消除策略與良性結節除外申辯。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 36,
    domainIdx: 3,
    title: '北角城市花園商場 UCC Coffee · 45 歲白領輕度脂肪肝且 ALT/AST 偏高 爭取宏利標準體免除外承保',
    location: '北角城市花園商場地下 UCC Coffee Shop',
    client: '45歲銀行合規主管，體檢發現輕微脂肪肝，肝功能轉氨酶 65 U/L',
    category: 'Critical_Illness',
    insurers: ['Manulife', 'AIA'],
    products: ['宏利 守護無間危疾保', '友邦 加裕智倍保 3'],
    context: '友邦初審要求加費 15%，顧問指導客戶補充肝臟纖維化掃描 (FibroScan) 證明無肝纖維化硬化，成功在宏利取得標準費率批准。',
    challenge: '中年高發亞健康體徵（脂肪肝、高尿酸、三高）如何透過精準補充專科醫學指標免加費。',
    actuaryFeature: '慢性代謝指標核保容忍度、專科臨床檢查複檢路徑與免加費上訴機制。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 37,
    domainIdx: 3,
    title: '觀塘 APM 5 樓 Starbucks · 6 歲兒童幼年型輕微哮喘康復 申請保險公司取消呼吸道除外不保事項',
    location: '觀塘創紀之城五期 APM 5 樓 Starbucks',
    client: '32歲全職媽媽，為 6 歲兒子檢視出生時投保的危疾附加險',
    category: 'Critical_Illness',
    insurers: ['Prudential', 'AIA'],
    products: ['保誠 危疾加倍保', '友邦 加裕智倍保 3'],
    context: '保單在 2 歲時因幼兒毛細支氣管炎被附加「呼吸系統永久除外」，顧問調出兒科無發作記錄，向保司成功申請徹底取消除外事項。',
    challenge: '兒童成長期既往症除外條款的覆核權益 (Re-underwriting Appeal) 激活。',
    actuaryFeature: '既往症除外條款復核機制 (Review of Exclusion)、兒童呼吸道標準化承保條件。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 38,
    domainIdx: 3,
    title: '荃灣如心廣場二期 Pacific Coffee · 產後抑鬱及精神心理專科就診記錄 爭取精神疾病專項保額支援',
    location: '荃灣如心廣場二期 1 樓 Pacific Coffee',
    client: '31歲新手媽媽，曾在公立醫院產後抑鬱門診隨訪 6 個月現已停藥',
    category: 'Critical_Illness',
    insurers: ['AIA', 'Sun_Life'],
    products: ['友邦 加裕智倍保 3', '永明 永明安逸危疾保'],
    context: '傳統保司對精神科病史一刀切拒保，顧問展示友邦特設之「精神健康支援保障」，在提供精神科專科醫生停藥痊癒證明後成功以標準體簽單。',
    challenge: '心理精神類健康記錄在香港保險核保中的重度污名化與新型人性化保障條款突破。',
    actuaryFeature: '精神疾病專項賠償條款（抑鬱症、強迫症、雙相情感障礙）及停藥核保時效要求。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 39,
    domainIdx: 3,
    title: '大埔超級城 C 區 Cafe · 阿茲海默症 (認知障礙) 鎖定年金：終身每年額外派發 10% 保額長照對比',
    location: '大埔超級城 C 區露天茶座',
    client: '54歲公務員，父親患重度認知障礙，自身強烈要求強化阿茲海默症長照補貼',
    category: 'Critical_Illness',
    insurers: ['FWD', 'Prudential'],
    products: ['富衛 危疾加諾保', '保誠 危疾加倍保'],
    context: '顧問展示富衛若確診不可逆性認知障礙，除賠足 100% 重疾本金外，每年額外保證派發 10% 保額作為護理津貼直至 100 歲。',
    challenge: '高齡化社會下失智失能對家庭造成的漫長照護經濟黑洞，需超前鎖定年金化給付。',
    actuaryFeature: '認知障礙症 (Dementia) 長期護理津貼條款、日常生活活動能力 (ADLs) 判定標準。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 40,
    domainIdx: 3,
    title: '佐敦柯士甸道 Starbucks · 首次嚴重危疾賠償後即刻豁免後續所有保費 確保家庭防禦網零成本續存',
    location: '佐敦柯士甸道 45 號地下 Starbucks',
    client: '41歲貨運司機，家庭唯一經濟支柱，擔憂一旦生大病無力續繳後續保費',
    category: 'Critical_Illness',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 加裕智倍保 3', '宏利 守護無間危疾保'],
    context: '顧問利用 InsurIntel 對比卡突出我方「首次重大疾病理賠 100% 後，剩餘 15 期保費全部豁免，後續多次癌症/中風保障依然生效」的精算福利。',
    challenge: '大病後收入中斷導致保單被迫斷繳失效的殘酷現實，與保費豁免特權的救生圈效應。',
    actuaryFeature: '保費豁免保障 (Waiver of Premium Benefit) 在首次索償後的自動觸發與多重保障延續。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },

  // -------------------------------------------------------------
  // DOMAIN 5: Private Hospital Cashless LOG Disputes (SC041 - SC050)
  // -------------------------------------------------------------
  {
    num: 41,
    domainIdx: 4,
    title: '跑馬地香港養和醫院 (HKSH) 入院處 · 心臟通波仔手術 24 小時急發 LOG 擔保函 免繳 8 萬入院按金',
    location: '跑馬地山村道養和醫院李樹培院 1 樓入院登記大堂',
    client: '56歲上市公司高管，突發急性心絞痛需緊急入院行冠狀動脈支架介入手術',
    category: 'Medical_VHIS',
    insurers: ['AIA', 'Bowtie'],
    products: ['友邦 至尊明珠高端自願醫保', '保泰 Bowtie Pink 自願醫保'],
    context: '養和醫院常規入院按金高達 HK$80,000，友邦專屬醫療直付櫃枱在 2 小時內完成 LOG 傳真確認，客戶零押金入住尊貴半私家病房。',
    challenge: '頂級私院高昂入院按金對客戶流動性的瞬間佔用，與傳統保司特快直付通道的實體壁壘。',
    actuaryFeature: '全港 13 家私院 LOG 免按金擔保機制 (Deposit Waiver)、心臟微創支架全數賠償。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 42,
    domainIdx: 4,
    title: '黃竹坑港怡醫院 (Gleneagles) 日間手術中心 · 50+ 項全包定價套餐 結算腸胃鏡息肉切除 $0 自付',
    location: '港島黃竹坑南豐徑港怡醫院 B 座 2 樓日間手術登記處',
    client: '39歲律師行行政合夥人，進行常規全麻腸胃鏡檢查並切除 3 顆良性息肉',
    category: 'Medical_VHIS',
    insurers: ['FWD', 'AXA'],
    products: ['富衛 尊衛您自願醫保', '安盛 智尊明月自願醫保'],
    context: '港怡醫院推行全包醫療套餐收費（全包醫生費、病理化驗及麻醉費），顧問調出預先批核代碼，出院櫃枱直接全額劃扣 $0 走人。',
    challenge: '日間內窺鏡項目常被不良診所細拆名目導致保司爭議拒賠，套餐直付化解一切暗湧。',
    actuaryFeature: '全包醫療定價收費套餐 (All-inclusive Packages) 直結機制與零自負額穿透。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 43,
    domainIdx: 4,
    title: '沙田香港中文大學醫院 (CUHKMC) 腫瘤科 · 癌症標靶藥物與質子治療 68 萬預先批核代付',
    location: '新界沙田澤祥街香港中文大學醫院 5 樓癌症中心',
    client: '47歲大學教授，確診肺腺癌 EGFR 突變，需每月服用自費第 3 代標靶藥泰瑞沙 (Tagrisso)',
    category: 'Medical_VHIS',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 至尊明珠高端自願醫保', '保誠 PRUHealth 靈活自願醫保'],
    context: '標靶藥每月開銷達 HK$45,000 且公立醫院不列入安全網，高端自願醫保直接向中大醫院藥房出具年度 68 萬擔保函，患者直接領藥。',
    challenge: '昂貴非手術癌症自費標靶藥、免疫治療對普通家庭資產的摧毀性衝擊與醫保直付救贖。',
    actuaryFeature: '非手術癌症治療全數賠償條款（標靶藥、化療、放療、質子治療）無細項拆分上限。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 44,
    domainIdx: 4,
    title: '銅鑼灣聖保祿醫院 (法國修女) 出院結算處 · 普通房保單誤住半私家房 引發 50% 折減罰則爭議',
    location: '銅鑼灣東院道 2 號聖保祿醫院地下結算處',
    client: '42歲工程師，投保普通房計劃因公立滿座被私院升級入住半私家房',
    category: 'Medical_VHIS',
    insurers: ['Manulife', 'AIA'],
    products: ['宏利 宏達自願醫保 (標準房)', '友邦 至尊明珠自願醫保 (半私家)'],
    context: '出院時賬單總額 HK$120,000，因計劃級別不符觸發「病房級別折減 (Ward Class Penalty) 50%」，客戶需自掏 HK$60,000，顧問到場向保司協調非自願升級減免。',
    challenge: '病房級別不匹配引發的高額自付爭議，與越級入住罰則的精算條款穿透。',
    actuaryFeature: '病房等級折減因子 (Adjustment Factor 50%)、非自願升級 (Involuntary Upgrade) 免責條款。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 45,
    domainIdx: 4,
    title: '沙田大圍仁安醫院 (Union) 婦產科 · 新生兒重症監護 (NICU) 保溫箱費用 納入母嬰聯保自願醫保',
    location: '沙田大圍富健街 18 號仁安醫院婦產科病房大堂',
    client: '29歲高齡初產婦，早產 34 週雙胞胎需入住新生兒深切治療保溫箱 10 天',
    category: 'Medical_VHIS',
    insurers: ['Sun_Life', 'FWD'],
    products: ['永明 永明自願醫保靈活計劃', '富衛 尊衛您自願醫保'],
    context: '私院 NICU 每日費用超 HK$15,000，雙胞胎 10 天開銷超 30 萬，顧問啟用母親靈活自願醫保中「初生嬰兒免費延伸保障」申請全額直接結算。',
    challenge: '早產兒極高醫療支出對新婚家庭的致命重創與自願醫保母嬰條款擴展。',
    actuaryFeature: '新生兒併發症保障 (Complications of Pregnancy / Neonatal Care) 與附屬受保人權益。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 46,
    domainIdx: 4,
    title: '九龍塘浸會醫院 (HKBH) 保險直付專屬櫃枱 · 保司網絡系統維護時 啟動線下人工緊急 LOG 綠色通道',
    location: '九龍塘窩打老道 222 號浸會醫院 D 座大堂保險服務中心',
    client: '50歲跨國貿易董事，週日因急性膽囊炎需緊急行腹腔鏡微創手術',
    category: 'Medical_VHIS',
    insurers: ['AXA', 'Prudential'],
    products: ['安盛 智尊明月自願醫保', '保誠 PRUHealth 靈活自願醫保'],
    context: '週日保司在線 API 停機維護，浸會櫃枱無法查詢在線資格，顧問立即致電保司 24 小時直付專線取得應急手工付款授權編號，免除 5 萬按金。',
    challenge: '保險科技線上故障時線下人工理賠經紀人渠道的兜底服務韌性。',
    actuaryFeature: '24 小時全天候緊急直付專線、線下急症擔保備案程序 (Manual Over-ride)。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 47,
    domainIdx: 4,
    title: '山頂加列山道明德國際醫院 (Matilda) · 外籍高管頂級尊貴私家病房 全額無上限直付結算',
    location: '山頂加列山道 41 號明德醫院海景私家病房',
    client: '53歲英資置地外籍董事總經理，突發急性椎間盤突出壓迫神經需微創減壓',
    category: 'Medical_VHIS',
    insurers: ['AIA', 'Cigna'],
    products: ['友邦 至尊明珠高端自願醫保 (環球尊貴版)', '信諾 環球尊尚醫療計劃'],
    context: '明德醫院每日房費高達 HK$8,500，手術及耗材總花費 HK$420,000，全球頂級高端醫保對接國際涉外直接結算，全單由保司與醫院對賬。',
    challenge: '頂級奢華私院對全球超高端醫療直付體系的嚴苛信用認可門檻。',
    actuaryFeature: '全球終身無上限保障額度 (Unlimited Lifetime Limit)、指定私家病房尊貴直付通道。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 48,
    domainIdx: 4,
    title: '九龍城聖德肋撒醫院 (法國醫院) 骨科 · 達芬奇機械人輔助全膝關節置換 醫療必要性核查',
    location: '九龍城太子道西 327 號聖德肋撒醫院 3 樓骨科門診',
    client: '66歲退休中學校長，雙膝重度骨關節炎，主刀名醫建議採用機械人精準手術',
    category: 'Medical_VHIS',
    insurers: ['Prudential', 'BOC_Life'],
    products: ['保誠 PRUHealth 靈活自願醫保', '中銀人壽 智選自願醫保計劃'],
    context: '保司理賠部質疑機械人手術費用比傳統手術高出 8 萬是否具備「醫療必要性 (Medical Necessity)」，顧問協助主治醫生出具臨床角度報告，成功全額批核。',
    challenge: '前沿先進醫療科技（達芬奇手術機器人）與保司傳統「合理及慣常收費 (R&C)」條款的拉扯。',
    actuaryFeature: '微創及先進醫療科技費用納入自願醫保標準、主治醫生醫療必要性認證報告要件。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 49,
    domainIdx: 4,
    title: '中半山嘉諾撒醫院 (Canossa) 白內障中心 · 植入多焦點人工晶體 硬件耗材超額費用剔除爭議',
    location: '中半山舊山頂道 1 號嘉諾撒醫院 2 樓日間眼科手術室',
    client: '61歲退休公務員，雙眼白內障接受日間超聲乳化術，選用頂級德國多焦三焦點晶體',
    category: 'Medical_VHIS',
    insurers: ['FWD', 'Bowtie'],
    products: ['富衛 尊衛您自願醫保', '保泰 Bowtie Pink 自願醫保'],
    context: '保司核定單眼晶體上限為 HK$15,000，實際高階晶體收費 HK$28,000，顧問依據自願醫保靈活條款「全數賠償無分項上限」為客戶成功爭取超額全包。',
    challenge: '高端自願醫保「全額賠償 (Full Cover)」與常規計劃「醫療雜費分項天花板 (Sundry Cap)」的巨大實戰分野。',
    actuaryFeature: '植入式醫療器具 (Medical Appliances) 專項全額津貼、雜項開支無細項拆扣。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 50,
    domainIdx: 4,
    title: '港島私家醫院急症室門口 · 純網上自願醫保客戶因無 Agent 實體跟進 被迫當場刷卡 5 萬按金痛定思痛',
    location: '跑馬地香港港安醫院 (司徒拔道) 地下急症登記處',
    client: '35歲金融科技產品經理，原本投保純網上自願醫保，深夜突發盲腸炎送院',
    category: 'Medical_VHIS',
    insurers: ['Bowtie', 'AIA'],
    products: ['保泰 Bowtie Pink 自願醫保', '友邦 至尊明珠高端自願醫保'],
    context: '深夜純網上保險客服下班，醫院直付平台無人工應答，客戶必須當場刷信用卡墊付 HK$50,000 按金；次日即刻致電友邦顧問要求轉保至實體顧問高端方案。',
    challenge: '純互聯網保險低價背後的服務短板——突發急症時缺乏隨身顧問現場協調直付與病房對接。',
    actuaryFeature: '實體保險顧問服務價值、全天候 24 小時私家醫院急症綠色通道與入院按金免除。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },

  // -------------------------------------------------------------
  // DOMAIN 6: District Morning Briefings & Recruiting (SC051 - SC060)
  // -------------------------------------------------------------
  {
    num: 51,
    domainIdx: 5,
    title: '友邦金融中心 (AIA Central) 35 樓早會大廳 · 區域總監投影 morning_slides.html 晨會速報賦能 45 位顧問',
    location: '中環干諾道中 1 號友邦金融中心 35 樓全區大會堂',
    client: '45位直轄營銷團隊顧問，包含 10 位百萬圓桌 (MDRT) 及 15 位入行未滿一年新人',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential', 'Manulife'],
    products: ['友邦 盈御多元貨幣計劃 3', '保誠 雋富多元貨幣計劃', '宏利 宏摯多元儲蓄計劃'],
    context: '每日 08:30 區域早會，總監使用 InsurIntel 每日自動編譯之瑞士雜誌風晨會大屏速報，同步市場競品昨夜突發推廣及應對話術。',
    challenge: '大型團隊每日情報分發嚴重滯後、新人面對競品促銷單張毫無招架之力的集體痛點。',
    actuaryFeature: '每日 06:30 自動化市場差分爬蟲、高對比攻防話術、GL20 合規安全審核速報。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 52,
    domainIdx: 5,
    title: '尖沙咀保誠大樓 16 樓晨會室 · 拆解對手宏利推出的「5.5% 保證預繳利息」背後退保罰則陷阱',
    location: '尖沙咀廣東道海港城保誠大樓 16 樓區域培訓室',
    client: '30位資深財富管理經理，急需攻破客戶被競品 5.5% 預繳吸引的阻抗',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential', 'Manulife'],
    products: ['保誠 雋富多元貨幣計劃', '宏利 宏摯多元儲蓄計劃'],
    context: '早會講師調出宏利通函條款，指出「5.5% 僅限首年預繳，若客戶在首 3 年內退保需追回全部利息並扣除 5% 手續費」，全場顧問即時掌握破局武器。',
    challenge: '將同業複雜金融工程促銷中的小字限制條款 (Fine Print) 轉化為一線通俗對抗話術。',
    actuaryFeature: '預繳利息鎖定年限 (Prepayment Lock Years)、提前退保手續費與真實到手收益率。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 53,
    domainIdx: 5,
    title: '宏利金融中心 (Manulife Kwun Tong) 11 樓演講廳 · 培訓 12 位新人顧問 30 秒手機極速見客攻防卡',
    location: '觀塘偉業街宏利金融中心 A 座 11 樓培訓中心',
    client: '12位新入職未滿半年的新人顧問 (Rookies)',
    category: 'Critical_Illness',
    insurers: ['Manulife', 'AIA'],
    products: ['宏利 守護無間危疾保', '友邦 加裕智倍保 3'],
    context: '新人外出見客常被客戶問得啞口無言，資深培訓主管要求全員在手機安裝 InsurIntel 咖啡版 PWA，30 秒內單手滑出癌症等候期與重疾多次賠付對比。',
    challenge: '新人對全港 99 款競品產品手冊無法背誦、臨場忘詞失分的新人存活率困局。',
    actuaryFeature: '移動咖啡館 30 秒電梯話術、雙色高對比差分徽章與極簡單手界面人體工學。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 54,
    domainIdx: 5,
    title: '太古城中心永明金融分行 · 招募前花旗銀行私人財富管理 VP，展示機構級跨司對比引擎',
    location: '鰂魚涌太古城中心四座 20 樓永明金融營業處會客室',
    client: '40歲外資投行零售財富管理助理副總裁 (AVP)，考慮轉行保險獨立經紀/代理',
    category: 'Savings_MultiCurrency',
    insurers: ['Sun_Life', 'AIA', 'Prudential'],
    products: ['永明 萬年青多元儲蓄計劃', '友邦 盈御多元貨幣計劃 3', '保誠 雋富多元貨幣計劃'],
    context: '銀行家質疑保險代理只懂推銷單一保司方案，總監現場展示 InsurIntel 客觀 3 司同屏 PK 系統與 GN16 官方實現率數據，證明專業顧問的精算科技賦能。',
    challenge: '銀行系精英人才對保險代理人「自賣自誇、缺乏客觀工具」刻板印象的顛覆與招募促成。',
    actuaryFeature: '跨司 3 旗艦同屏客觀對比、無偏見精算指標排名前列展示與獨立顧問個人品牌。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 55,
    domainIdx: 5,
    title: '灣仔中環廣場富衛保險分區會議室 · 雙人實戰 Role-Play：拆解對手 7.2% 浮動回報宣傳單',
    location: '灣仔港灣道 18 號中環廣場 42 樓富衛分區辦公室',
    client: '20位富衛營銷經理進行週二上午對抗演練',
    category: 'Savings_MultiCurrency',
    insurers: ['FWD', 'Sun_Life'],
    products: ['富衛 盈豐多元儲蓄計劃', '永明 萬年青多元儲蓄計劃'],
    context: '兩位顧問現場模擬見客，一位扮演手拿永明宣傳單聲稱 7.2% IRR 的客戶，另一位運用「保證現值與非保證分紅雙軌分離器」當場揭穿非保證佔比超 80% 的波動風險。',
    challenge: '實戰模擬提高一線面對高宣傳回報時的心理韌性與專業合規化解技巧。',
    actuaryFeature: '分紅實現走廊 (Corridor Meter)、極端行情 70% 悲觀實現率模擬與保證金安全線。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 56,
    domainIdx: 5,
    title: '旺角新世紀廣場一座區域辦公室 · 每日清晨 06:30 自動向全體 20 位主管手機推送市場情報',
    location: '旺角太子道西新世紀廣場一座 22 樓',
    client: '20位團隊主管，管理旗下超過 100 位保險代理人',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential', 'FWD', 'Manulife'],
    products: ['全港 15 家保司當季最新主推儲蓄與重疾險'],
    context: '系統在每日 06:30 完成爬蟲差分計算，自動生成專屬本區 Logo 的 WhatsApp Markdown 速報與高清海報，主管在搭港鐵上班途中已完成當天早會備課。',
    challenge: '主管清晨備課時間極度稀缺、手動整理市場變更費時失事且容易出現法規疏漏。',
    actuaryFeature: '自動化排程任務 (Cron Runner)、團隊專屬品牌 (District Branding) 與自愈熔斷器。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 57,
    domainIdx: 5,
    title: '中環恒生銀行總行對面咖啡館 · 面試銀行客戶經理 (RM)：揭露銀行產品庫狹隘痛點與自主展業',
    location: '中環德輔道中 83 號地上咖啡座',
    client: '31歲大型零售銀行客戶經理，背負沉重貸款與理財雙重 KPI',
    category: 'Annuity_QDAP',
    insurers: ['BOC_Life', 'AIA'],
    products: ['中銀人壽 延年福延期年金', '友邦 充裕未來延期年金'],
    context: '銀行 RM 抱怨總行每月強推單一保司產品、客戶投訴分紅未達標，總監以 InsurIntel 的 15 保司 99 產品全庫展示獨立自主顧問的專業自由度。',
    challenge: '銀行職員被單一渠道綁架的職業瓶頸，與擁有強大第三方情報賦能的團隊吸引力。',
    actuaryFeature: '多保司全庫產品知識圖譜、客觀中立客戶報告生成與個人專屬電子名片。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 58,
    domainIdx: 5,
    title: '銅鑼灣皇室大廈安盛分區大廳 · COT 頂尖製作人傳授「咖啡廳 3 分鐘促成內地大單」心法',
    location: '銅鑼灣告士打道 311 號皇室大廈 30 樓安盛分區會堂',
    client: '50位志在衝刺 MDRT/COT/TOT 的精英顧問',
    category: 'Savings_MultiCurrency',
    insurers: ['AXA', 'AIA'],
    products: ['安盛 愛意多元儲蓄計劃', '友邦 盈御多元貨幣計劃 3'],
    context: 'COT 大老分享見客實戰：絕不在客戶面前掏出 50 頁繁雜建議書，而是用手機點開 InsurIntel 即時生成 WhatsApp 摘要，3 點擊穿客戶核心顧慮當場預約簽單。',
    challenge: '傳統推銷方式冗長低效、客戶失去耐心；現代高效促成要求數據降維打擊。',
    actuaryFeature: '即時 WhatsApp/WeChat 攻防摘要合成器、GL20 合規免責條款自動附帶。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 59,
    domainIdx: 5,
    title: '沙田新城市中央廣場一座 · 區域總監核算團隊授權 (HK$2,480/月) 對 20 位新人的 ROI 回報率',
    location: '沙田鄉事會路 138 號新城市中央廣場一座 18 樓總監辦公室',
    client: '區域總監 (District Director)，執掌 30 人營業區年度營運預算',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['全庫 99 款產品實時算力引擎'],
    context: '總監計算：全區 20 個席位月費 HK$2,480（平均每位顧問僅 $124/月），只要團隊每月多促成 1 張儲蓄保單（佣金超 HK$15,000），投資回報率高達 600%。',
    challenge: '團隊管理層採購商業軟件時對預算效益比 (ROI)、新人激活率與流失率的嚴苛考核。',
    actuaryFeature: '團隊授權席位管理、統一晨會資料分發、新人平均首單成交週期縮短指標。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 60,
    domainIdx: 5,
    title: '尖沙咀東部安達中心 · 跨行業轉行新人破冰：利用保監局 GL20 客觀合規話術建立專業信賴',
    location: '尖東麼地道 65 號安達中心 12 樓培訓中心',
    client: '28歲前國泰航空高級空乘，轉行加入保險業第 3 週',
    category: 'Medical_VHIS',
    insurers: ['Prudential', 'FWD'],
    products: ['保誠 PRUHealth 靈活自願醫保', '富衛 尊衛您自願醫保'],
    context: '轉行新人最怕朋友認為自己「賺朋友錢、不懂裝懂」，主管指導其使用系統出具帶有保監局 GL20 守則聲明的客觀對比撕頁卡，以專業顧問姿態破冰成功。',
    challenge: '新人從業者緣故法見客時的「乞求式銷售心理障礙」與專業合規中立形象重塑。',
    actuaryFeature: '香港保險業監管局 GL20 合規守則標籤、客觀精算參數權重與中立撕頁卡。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },

  // -------------------------------------------------------------
  // DOMAIN 7: Retirement QDAP Tax Relief (SC061 - SC070)
  // -------------------------------------------------------------
  {
    num: 61,
    domainIdx: 6,
    title: '灣仔稅務大樓 (Revenue Tower) 4 樓諮詢大廳 · 律政司高級檢控官頂階 17% 稅率慳足 $10,200',
    location: '灣仔告士打道 5 號稅務大樓 4 樓評稅大堂外',
    client: '42歲律政司高級檢控官，年薪超 HK$1,500,000，適用頂格 17% 邊際稅階',
    category: 'Annuity_QDAP',
    insurers: ['Sun_Life', 'BOC_Life'],
    products: ['永明 延期年金計劃', '中銀人壽 延年福延期年金計劃'],
    context: '客戶即將報稅，顧問現場使用 QDAP 稅優引擎展示每年頂格投保 HK$60,000，直接在綠色報稅表抵扣，每年實質少交 HK$10,200 薪俸稅（相當於 17% 保費回贈）。',
    challenge: '高收入專業人士對政府認可延期年金 (QDAP) 法定稅務優惠的精準量化計算。',
    actuaryFeature: '香港薪俸稅累進稅率表 (2%, 6%, 10%, 14%, 17%)、法定 HK$60,000 扣稅上限。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 62,
    domainIdx: 6,
    title: '半山西摩道豪宅會客室 · 夫妻合併報稅 (Joint Assessment) 善用 HK$120,000 額度雙倍慳稅 $20,400',
    location: '半山西摩道私人住宅會所',
    client: '夫婦二人均為跨國會計師行合夥人，共同年薪超 HK$3,000,000',
    category: 'Annuity_QDAP',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 充裕未來延期年金計劃', '保誠 雋逸延期年金計劃'],
    context: '顧問指導夫妻在合併評稅下每人認購一份 $60,000 QDAP，合共享受最高 HK$120,000 扣稅限額，每年實質獲取 HK$20,400 稅務返還，5 年共慳逾 10 萬。',
    challenge: '高淨值雙薪家庭聯合報稅結構下的法定稅務折抵極大化佈局。',
    actuaryFeature: '夫妻聯合評稅雙倍限額架構 (Couple Limit HK$120,000)、5 年供款期折現效益。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 63,
    domainIdx: 6,
    title: '中環怡和大廈 25 樓合夥人辦公室 · QDAP 保證現金流佔比超 80% vs 股票型基金退休金穩定性',
    location: '中環康樂廣場 1 號怡和大廈 25 樓律師事務所',
    client: '52歲訴訟資深顧問，經歷 2008 及 2020 年股市暴跌，追求絕對確定退休現金',
    category: 'Annuity_QDAP',
    insurers: ['BOC_Life', 'Manulife'],
    products: ['中銀人壽 延年福延期年金', '宏利 赤霞珠延期年金'],
    context: '客戶厭惡強積金 (MPF) 股票基金的巨額波動，顧問調出中銀延年福保證內部回報率達 2.92%、保證現金流佔比高達 86% 的鎖定曲線。',
    challenge: '臨近退休人士對非保證分紅的極端不信任，與保證年金現金流基石地位的確認。',
    actuaryFeature: '保證現金流佔比 (Guaranteed Cashflow Share %)、保證 IRR vs 浮動分紅 IRR。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 64,
    domainIdx: 6,
    title: '鰂魚涌太古城中心商場 Caffe Milani · 50 歲外企總監評估領取年齡（55歲 vs 60歲 vs 65歲）精算差異',
    location: '太古城中心二期 1 樓 Caffe Milani',
    client: '50歲美資日化巨頭供應鏈總監，考慮提早於 55 歲退休',
    category: 'Annuity_QDAP',
    insurers: ['Sun_Life', 'AIA'],
    products: ['永明 延期年金計劃', '友邦 充裕未來延期年金計劃'],
    context: '客戶糾結於究竟是 55 歲提早領取（每月領較少）還是等 65 歲再領（每月領較多），顧問啟動動態政策週期投影圖，現場展示不同年金開始期的終身累計回報。',
    challenge: '提前退休與延後退休在年金累積期與給付期複利滾存下的精算抉擇。',
    actuaryFeature: '年金開始年齡 (Annuity Commencement Age)、累積期複利效應與每期領取金折現。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 65,
    domainIdx: 6,
    title: '金鐘海富中心商場 Delifrance · 自僱執業會計師平衡 QDAP 年金扣稅與可扣稅自願性供款 (TVC)',
    location: '金鐘海富中心地下 Delifrance',
    client: '38歲自僱開業註冊會計師，無雇主替其繳納強積金',
    category: 'Annuity_QDAP',
    insurers: ['Prudential', 'FWD'],
    products: ['保誠 雋逸延期年金計劃', '富衛 富衛延期年金計劃'],
    context: '客戶詢問每年 6 萬扣稅額該買 MPF-TVC 還是買 QDAP，顧問分析 TVC 需鎖死至 65 歲且自負盈虧，而 QDAP 具備保證 IRR 且可在 50 歲或 10 年後靈活提取。',
    challenge: '強積金 TVC 與保險延期年金 QDAP 兩大官方扣稅工具的流動性與確定性優劣權衡。',
    actuaryFeature: 'QDAP vs TVC 共享 HK$60,000 扣稅限額、提取年齡彈性與保底派息保證。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 66,
    domainIdx: 6,
    title: '九龍灣企業廣場五期辦公室 · 科技公司 HR 總監為 20 位高管規劃集體延期年金稅務福利',
    location: '九龍灣臨豐街 8 號企業廣場五期 18 樓會議室',
    client: '46歲跨國半導體企業人力資源總監',
    category: 'Annuity_QDAP',
    insurers: ['BOC_Life', 'Sun_Life'],
    products: ['中銀人壽 延年福延期年金', '永明 延期年金計劃'],
    context: '公司欲為 20 位總監級高管提供年度福利，顧問設計統一採購 QDAP 作為高管留才與個人薪俸稅優化組合，並提供一鍵批量利益說明書生成。',
    challenge: '企業團體薪酬福利 (Executive Benefits) 與個人法定扣稅工具的整合採購。',
    actuaryFeature: '集體延期年金核保流程、大額預繳折扣與年金計劃員工留存激勵模型。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 67,
    domainIdx: 6,
    title: '元朗形點 (YOHO Mall) 露天庭園 Cafe · 退休公務員對比中銀人壽 vs 保誠 QDAP 保證月派金額',
    location: '元朗朗日路 9 號 YOHO Mall 1 樓戶外露天茶座',
    client: '59歲水務署退休工程督察，手持長俸退休金準備停泊穩健年金',
    category: 'Annuity_QDAP',
    insurers: ['BOC_Life', 'Prudential'],
    products: ['中銀人壽 延年福延期年金', '保誠 雋逸延期年金計劃'],
    context: '客戶最關心「每月保證到底能打入銀行卡多少錢」，顧問列出中銀保證每月派發 HK$6,800 比保誠高出 HK$450，徹底打消客戶對非保證分紅的猜忌。',
    challenge: '基層公務員與長者對每月入賬真金白銀的極致數字敏感度。',
    actuaryFeature: '保證每月年金金額 (Guaranteed Monthly Annuity)、首期年金領取時間點。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 68,
    domainIdx: 6,
    title: '將軍澳 PopCorn 商場 Starbucks · 40 歲單身女性專題：長壽風險 (Longevity Risk) 終身年金',
    location: '將軍澳唐賢街 9 號 PopCorn 商場地下 Starbucks',
    client: '40歲單身非牟利機構總幹事，預期壽命可超 90 歲',
    category: 'Annuity_QDAP',
    insurers: ['AIA', 'Sun_Life'],
    products: ['友邦 充裕未來延期年金計劃', '永明 延期年金計劃'],
    context: '香港女性平均壽命超 88 歲居全球之冠，客戶最怕「人活著，錢沒了」，顧問展示終身派發至 100 歲以上的長壽防禦曲線，越長壽內部報酬率越高。',
    challenge: '單身不婚族面對無子女贍養情況下的極端長壽破產恐慌。',
    actuaryFeature: '終身年金派發期、長壽跨期對沖算法與保證派發期（如 10 年或 20 年）條款。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 69,
    domainIdx: 6,
    title: '北角友邦廣場 (AIA Tower) 地下 Cafe · 客戶質疑延期年金浮動分紅受市場波動影響之平滑機制',
    location: '北角電氣道 183 號友邦廣場地下 Cafe',
    client: '48歲證券行操盤手，對保險公司紅利平滑基金 (Smoothing Pool) 存疑',
    category: 'Annuity_QDAP',
    insurers: ['AIA', 'BOC_Life'],
    products: ['友邦 充裕未來延期年金計劃', '中銀人壽 延年福延期年金'],
    context: '操盤手指出多數 QDAP 的非保證年金部分受股市回調影響，顧問拿出中銀與友邦的分紅實現率歷史報表，說明分紅水庫在牛熊週期下的跨週期平滑管理。',
    challenge: '專業二級市場投資人對保險資金長期平滑儲備池機制的精算合規性詰問。',
    actuaryFeature: '分紅平滑機制 (Smoothing Mechanism)、投資回報儲備金撥備率與 GN16 備案。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 70,
    domainIdx: 6,
    title: '荔枝角 D2 Place 一期生活館 · 創意文化總監設計聯合年金架構 確保配偶生活津貼無縫銜接',
    location: '荔枝角長義街 9 號 D2 Place 一期 2 樓文創茶座',
    client: '44歲廣告公司創意合夥人，妻子為全職家庭主婦，無強積金退休積累',
    category: 'Annuity_QDAP',
    insurers: ['Manulife', 'Prudential'],
    products: ['宏利 赤霞珠延期年金', '保誠 雋逸延期年金計劃'],
    context: '客戶擔憂自己若先於妻子離世，妻子將失去生活來源，顧問規劃「聯合年金 (Joint-life Annuity)」選項，身故後配偶可繼續領取 100% 每月年金至百年歸老。',
    challenge: '單薪家庭支柱對全職配偶晚年喪偶後的生存保障架構設計。',
    actuaryFeature: '聯合年金給付選項 (Joint Annuity with Survivorship)、剩餘年金保證期繼承。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },

  // -------------------------------------------------------------
  // DOMAIN 8: Regulatory Audits & Compliance Reviews (SC071 - SC080)
  // -------------------------------------------------------------
  {
    num: 71,
    domainIdx: 7,
    title: '北角保險業監管局 (HKIA) 總部 · 利益說明書合規審查：保證與非保證利益堆疊嚴格阻斷',
    location: '北角英皇道 734 號友邦香港大樓保監局調解室',
    client: '保險中介人操守委員會稽核組，進行持牌人展業物料年度抽檢',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['全港 99 款儲蓄與重疾險官方 Illustration'],
    context: '保監局嚴格執行指引，嚴禁將保證現金價值與非保證分紅在同一圖表模糊堆疊以暗示全部回本，InsurIntel 雙軌徹底解耦展示獲審計官免檢通過。',
    challenge: '監管機構打擊虛假誇大宣傳、落實香港保監局 GN16 及 GL20 守則要求。',
    actuaryFeature: '合約保證現金價值與浮動紅利嚴格分拆、禁止暗示非保證紅利為確定回報。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 72,
    domainIdx: 7,
    title: '中環律政中心合規評議室 · 審查顧問 WhatsApp 社交媒體銷售話術 必須強制附帶 GL20 免責聲明',
    location: '中環下亞厘畢道中區政府合署律政中心會客室',
    client: '大型獨立財富管理經紀行合規總監 (Chief Compliance Officer)',
    category: 'Critical_Illness',
    insurers: ['AIA', 'Prudential'],
    products: ['即時通訊攻防摘要合成器'],
    context: '合規主管檢查顧問私下向客戶發送的 WhatsApp 比較文本，確認系統自動生成的每一條長文本末尾均嵌入完整 GL20 聲明及持牌人編號，合規風險評為「低」。',
    challenge: '移動社交軟件促成中的非合規承諾與中介人操守違規舉報防範。',
    actuaryFeature: 'HKIA GL20 中介人持牌資質聲明、官方出處追溯超連結及法律免責條款。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 73,
    domainIdx: 7,
    title: '中環雪廠街獨立經紀行 (IFA) 辦公室 · 嚴格排查潛在「轉保 (Twisting)」指控：客觀出具退保利益受損對照表',
    location: '中環雪廠街 16 號西洋會所大廈 8 樓經紀行',
    client: '49歲客戶欲將持有 4 年的舊重疾險退保轉購新上市多次重疾險',
    category: 'Critical_Illness',
    insurers: ['Prudential', 'AIA'],
    products: ['保誠 早期危疾保 (舊保單)', '友邦 加裕智倍保 3 (新保單)'],
    context: '為防止中介人誘惑客戶不當轉保，合規部使用 InsurIntel 轉保對比矩陣，清晰列明「退保將損失 HK$85,000 初期費用且需重新經歷核保等候期」，客戶知情後簽字確認。',
    challenge: '香港保險業監管局對「不當轉保 (Twisting)」的吊銷牌照重罰與客戶權益保護。',
    actuaryFeature: '轉保客戶利益受損說明書 (Customer Protection Declaration Form) 自動生成與年期折算。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 74,
    domainIdx: 7,
    title: '灣仔入境事務大樓對面法律事務所 · 法定 GN16 實現率走廊審計：披露連續 5 年低於 85% 之保司紅利預警',
    location: '灣仔告士打道 108 號大新金融中心 15 樓公證行',
    client: '香港消費者委員會保險專題投訴調查員',
    category: 'Savings_MultiCurrency',
    insurers: ['Market_Averages', 'AIA', 'Prudential'],
    products: ['GN16 歷史分紅走廊資料庫 (2015-2026)'],
    context: '消委會調研部分熱銷儲蓄險在第 5–8 年終期紅利實現率一度跌至 72% 的市場現象，系統提供的官方實現率走廊與五檔燈號（綠/藍/黃/橙/紅）提供權威數據支撐。',
    challenge: '保險公司公佈的 GN16 繁複統計表格缺乏公眾可讀性，需透明走廊可視化。',
    actuaryFeature: 'GN16 官方披露數據走廊標準差分析、歸原紅利與終期紅利各自獨立實現率折算。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 75,
    domainIdx: 7,
    title: '尖沙咀喜來登酒店地下宴會廳 · 嚴禁私下非法回佣 (Section 64G) 合規講座：宣講回贈與佣金回贈之法律紅線',
    location: '尖沙咀彌敦道 20 號喜來登酒店地庫宴會廳',
    client: '80位資深保險代理人參加公會年度反洗錢與法律合規講座',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['回贈計算器 (合規官方保司促銷 vs 非法私下回佣)'],
    context: '執業大律師警告：保險公司官方通函促銷回贈（如 22%）完全合法，但代理人私下返還個人佣金觸犯《防止賄賂條例》及《保險業條例》第 64G 條，面臨刑事監禁。',
    challenge: '客戶私下索要回佣的惡性競爭陋習與中介人法律防禦紅線。',
    actuaryFeature: '保司官方推廣折扣 (Official Promo) 與個人非法佣金返還 (Rebating) 的法律界定工具。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 76,
    domainIdx: 7,
    title: '上環招商局大廈 28 樓 · 客戶適當性評估 (Financial Needs Analysis - FNA) 演算法鎖定資產流動性',
    location: '上環干諾道中 168 號信德中心招商局大廈 28 樓',
    client: '63歲長者欲將 80% 養老積蓄投入 10 年鎖定儲蓄險',
    category: 'Savings_MultiCurrency',
    insurers: ['ChinaLife', 'AIA'],
    products: ['中國人壽海外 裕饒多元儲蓄計劃', '友邦 盈御多元貨幣計劃 3'],
    context: '系統在進行 FNA 財務需要分析時觸發「長者過度集中風險攔截」，警告流動性資金不足以覆蓋未來 5 年生活，強制要求顧問降低保費規模至 30% 以內。',
    challenge: '防範向長者不當銷售長期非流動性金融產品的監管重罰與演算法安全閥。',
    actuaryFeature: '保監局 FNA 財務需要分析適當性校驗、年齡與流動資金比率警戒線。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 77,
    domainIdx: 7,
    title: '灣仔南洋第一商業銀行大廈 · 反洗錢 (AML) 穿透：1,000 萬港元一次性預繳保費之財富來源證明 (SOW) 審查',
    location: '灣仔軒尼詩道 302 號南洋商業銀行大廈合規部',
    client: '45歲跨國貿易商欲以香港公司賬戶支付大額躉繳保費',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 財智萬用壽險', '宏利 宏達萬用壽險'],
    context: '合規組要求出具經審計的最近 3 年財務報表、完稅憑證及最終受益所有人 (UBO) 穿透結構，系統自動生成合規文件檢查清單 (Compliance Checklist)。',
    challenge: '大額單筆保費在香港金融情報機構 (JFIU) 框架下的反洗錢審核穿透。',
    actuaryFeature: '財富來源合法憑證核驗矩陣、政治公眾人物 (PEP) 篩查與實質受益人登記。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 78,
    domainIdx: 7,
    title: '金鐘高等法院大樓 3 樓法庭 · 精算專家證人出庭：就保單退保現金價值差異與誤導性宣傳抗辯',
    location: '金鐘金鐘道 38 號高等法院原訟法庭',
    client: '投保人起訴某保險公司顧問在銷售時將第 10 年非保證演示承諾為「保證到手」',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential'],
    products: ['雋升 儲蓄保障計劃 (歷史爭議案例分析)'],
    context: '法庭審查當年銷售物料，原告律師指出宣傳未註明實現率波動，辯方依據官方 GN16 條款及當期利益說明書上的清晰不保證註腳進行抗辯。',
    challenge: '司法訴訟中保單合約字眼法律效力 vs 口頭不當陳述舉證責任的攻防。',
    actuaryFeature: '普通法合約條款解釋原則 (Contra Proferentem Rule) 與精算演示免責法定效力。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 79,
    domainIdx: 7,
    title: '九龍灣國際展貿中心合規運營中心 · 500 份顧問外發撕頁卡自動化批次合規檢測（反對抗性詞彙排查）',
    location: '九龍灣展貿徑 1 號九展辦公大樓 14 樓合規機房',
    client: '合規自動化審查專案組，使用正則與語意引擎排查全區顧問外發物料',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['InsurIntel 撕頁卡生成器'],
    context: '審查引擎自動掃描 500 份撕頁卡，攔截了「秒殺對手」、「徹底打趴」等 3 處對抗性用詞，自動修正為「指標領先」、「等候期更優」等中性合規詞彙。',
    challenge: '激進銷售話術招致競爭對手保司惡意舉報中介人違規操守的法律風險。',
    actuaryFeature: '文本語音安全過濾機制、中立合規名詞替換庫與自動化標籤留痕。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 80,
    domainIdx: 7,
    title: '中環香港會所大廈 14 樓私人諮詢室 · 跨境訪港旅客跨境行銷法律邊界：防止在內地境內簽署或收取保費',
    location: '中環昃臣道 1 號香港會所大廈 14 樓商務中心',
    client: '35歲新晉區域主管，計劃帶團隊前往深圳舉辦高端客戶財富沙龍',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Sun_Life'],
    products: ['跨境招攬法規守則'],
    context: '合規主管明確告誡：在內地僅可進行一般性家族傳承宏觀演講，嚴禁攜帶任何產品建議書、要約表格或收取定金，所有具體諮詢與簽約必須嚴格在香港境內進行。',
    challenge: '大灣區一體化背景下中介人跨境展業的刑事法律紅線（非法經營罪風險）。',
    actuaryFeature: '內地《保險法》第 131 條境外招攬界限、香港保監局跨境指引與合規執業守則。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },

  // -------------------------------------------------------------
  // DOMAIN 9: Macro Economic Stress Testing (SC081 - SC090)
  // -------------------------------------------------------------
  {
    num: 81,
    domainIdx: 8,
    title: '中環國際金融中心二期交易大堂 · 美聯儲啟動降息週期 100bps：萬用壽險宣告派息率與長端分紅稀釋預警',
    location: '中環 IFC 二期 70 樓投行宏觀交易員交易台',
    client: '41歲量化宏觀基金經理，預判全球將進入 3 年降息週期',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Manulife'],
    products: ['友邦 財智萬用壽險', '宏利 宏達萬用壽險'],
    context: '客戶指出降息將使保司新買入美債殖利率下降，顧問啟動動態利差引擎，展示保單保底派息率 (2.25%) 的抗跌防禦與分紅水庫調節週期。',
    challenge: '宏觀利率下行對保險公司新增投資資產收益率 (New Money Rate) 的侵蝕壓力。',
    actuaryFeature: '保底派息承諾 (Guaranteed Crediting Floor 2.25%)、保司分紅資產組合抗降息韌性。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 82,
    domainIdx: 8,
    title: '中環交易廣場三座私人財富部 · HIBOR 飆升至 5.2% 引發保費融資利差倒掛：淨利差轉負的敏感度壓力測算',
    location: '中環交易廣場三座 26 樓私人財富管理會議室',
    client: '46歲地產發展商執行董事，持有 5,000 萬港元保費融資萬用壽險',
    category: 'Financing_UniversalLife',
    insurers: ['Manulife', 'AIA'],
    products: ['宏利 宏達萬用壽險', '友邦 財智萬用壽險'],
    context: '當銀行借貸利率升至 5.8% 而保司宣告派息僅 5.25% 時，客戶每年需倒貼息差 HK$275,000，顧問提供提早部分還款或啟動分紅提取補貼利息的重組方案。',
    challenge: '負利差 (Negative Carry Spread) 環境下融資客戶面臨的現金流失血危機與對策。',
    actuaryFeature: '保費融資利差倒掛敏感度模型、利息補貼現金流推演及減額清繳選項。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 83,
    domainIdx: 8,
    title: '金鐘力寶中心一座 22 樓 · 20 年悲觀黑天鵝情景：若非保證分紅連續按 70% 實現，保單真實回報幾何？',
    location: '金鐘力寶中心一座 22 樓家族投資諮詢室',
    client: '50歲前知名主權基金投資總監，奉行極端防禦型資產配置',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 盈御多元貨幣計劃 3', '保誠 雋富多元貨幣計劃'],
    context: '客戶要求系統運行「最壞悲觀情景」：若未來 20 年遭遇兩次金融海嘯導致終期紅利僅兌現 70%，保單第 20 年的年化 IRR 是否依然能跑贏同期通脹率。',
    challenge: '打破銷售人員只展示「100% 理想預期演示」的思維定勢，直面極端壓力測試。',
    actuaryFeature: '70% 悲觀實現率壓力測試算法 (Pessimistic Stress Test)、保底現金價值佔比防禦。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 84,
    domainIdx: 8,
    title: '尖沙咀半島酒店辦公大樓 10 樓 · 聯繫匯率與美元脫鈎論調抗辯：港元/美元/人民幣 30 年匯率波動模擬',
    location: '尖沙咀梳士巴利道半島酒店辦公大樓 10 樓',
    client: '58歲新加坡家族辦公室受託人，擔憂港元聯繫匯率制度 (Linked Exchange Rate) 穩定性',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Sun_Life'],
    products: ['友邦 盈御多元貨幣計劃 3', '永明 萬年青多元儲蓄計劃'],
    context: '客戶擔憂港美匯率脫鈎風險，顧問指出保單底層採用美元計價及全球資產配置，且支援隨時切換為歐元/英鎊/新幣，實質超脫單一幣種地緣風險。',
    challenge: '地緣政治敏感客戶對香港聯繫匯率制度長期生存能力的懷疑化解。',
    actuaryFeature: '香港金管局聯匯機制防禦深度、離岸多幣種自由轉換及非美元保單清算機制。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 85,
    domainIdx: 8,
    title: '觀塘城東誌安盛金融大樓 18 樓 · 主權債券殖利率倒掛：保險公司分紅基金 (Participating Fund) 資產配置透視',
    location: '觀塘巧明街 100 號安盛金融大樓 18 樓精算部',
    client: '36歲宏觀對沖基金固定收益分析師，審查保險公司底層資產透明度',
    category: 'Savings_MultiCurrency',
    insurers: ['AXA', 'AIA'],
    products: ['安盛 愛意多元儲蓄計劃', '友邦 盈御多元貨幣計劃 3'],
    context: '分析師要求調閱兩大保司分紅基金的固定收益資產配置比（AIA 固收 60% / 股票 40% vs AXA 固收 70% / 股票 30%），評估其承受美國國債期限溢價倒掛的能力。',
    challenge: '二級市場專業機構投資者穿透保司底層分紅資產配置比例 (Asset Allocation) 的硬核需求。',
    actuaryFeature: '分紅基金資產組合架構、信用評級 BBB+ 以上債券佔比與另類投資配置。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 86,
    domainIdx: 8,
    title: '灣仔陽光中心 30 樓全層 · 全球滯脹 (Stagflation) 假設下：定額年金購買力被通脹侵蝕之防護策略',
    location: '灣仔皇后大道東 248 號大新金融中心 30 樓',
    client: '53歲跨國大律師事務所高級合夥人，擔憂 20 年後年金購買力減半',
    category: 'Annuity_QDAP',
    insurers: ['Sun_Life', 'BOC_Life'],
    products: ['永明 延期年金計劃 (具抗通脹增長選項)', '中銀人壽 延年福延期年金'],
    context: '若年化通脹率達 3.5%，現時 HK$10,000 月年金在 20 年後的實際購買力僅值 HK$5,000，顧問展示永明內置的「每年年金遞增 3%」抗通脹選項。',
    challenge: '固定年金在長期惡性通脹環境下的名義購買力縮水與遞增型年金的對沖價值。',
    actuaryFeature: '通脹遞增年金選項 (Inflation-Indexed Annuity)、實際購買力折現模型 (Real Purchasing Power)。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 87,
    domainIdx: 8,
    title: '銅鑼灣希慎廣場 25 樓私人會客室 · 模擬保司穆迪/標普評級下調 1 級時 對保單持有人權益的法定保障',
    location: '銅鑼灣軒尼詩道 500 號希慎廣場 25 樓商務套房',
    client: '57歲新加坡家族信託架構師，極度著重保司主體信用評級 (Credit Rating)',
    category: 'Financing_UniversalLife',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 (S&P: AA-) vs 保誠 (S&P: A+) 萬用壽險'],
    context: '客戶詢問若保險公司信用評級被標普下調，保單現金價值是否有法定兜底，顧問解釋香港保監局的法定破產隔離 (RBC) 監管與再保險分保 (Reinsurance) 體系。',
    challenge: '超大額保單投保人對金融機構單一交易對手風險 (Counterparty Risk) 的深度排查。',
    actuaryFeature: '風險基礎資本制度 (HKRBC) 償付能力充足率、保單持有人保護基金與再保險覆蓋。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 88,
    domainIdx: 8,
    title: '數碼港一期 Fintech 創新中心 · 歷史數據回測：回顧 2008 次貸危機與 2020 疫情各保司分紅達成率波動',
    location: '薄扶林數碼港道 100 號數碼港一期 Fintech 孵化器',
    client: '34歲金融工程博士，欲量化回測香港保險業在過去兩次全球重大衝擊下的歷史平滑韌性',
    category: 'Savings_MultiCurrency',
    insurers: ['Prudential', 'AIA', 'Manulife'],
    products: ['保誠 雋升 (2010年發行)', '友邦 充裕未來 (2015年發行)'],
    context: '博士運用 InsurIntel GN16 回測模組，檢視雋升在 2018–2020 年分紅率下滑至 85% 後於 2023 年如何逐步回調至 92%，驗證平滑儲備庫的跨週期調節特性。',
    challenge: '理科背景專業客戶對保司宣傳話術的不信賴，完全依賴十數年跨週期回測真實數據說話。',
    actuaryFeature: 'GN16 十年歷史縱向回測、分紅回歸均值週期 (Mean-reverting Horizon) 與分紅宣告滯後性。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 89,
    domainIdx: 8,
    title: '沙田香港科學園科技大道西 10 號 · 突發流動性危機演練：全庫 99 款產品前 1–5 年退保現金價值折減排行',
    location: '沙田科學園核心大樓二期會議廳',
    client: '42歲生物科技初創企業合夥人，評估在不同年份退保時的沉沒成本',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['全港 99 款旗艦保單早期退保扣減率矩陣'],
    context: '客戶擔憂公司研發若遇挫折可能需提早退保換取現金，顧問調出退保扣減率橫向對比表，顯示各家保司在第 1、2、3 年退保時的現金價值折損階梯。',
    challenge: '客戶對保險「前期退保血本無歸」的深層戒備與前 5 年流動性安全期的量化排查。',
    actuaryFeature: '退保手續費 (Surrender Charge)、退保費用率階梯 (Surrender Value Scale) 與早期保底線。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 90,
    domainIdx: 8,
    title: '中環渣打銀行大廈 26 樓 · 日圓/英鎊極端匯率波動下的跨國多幣種切換套利與保單價值鎖定',
    location: '中環德輔道中 4 號渣打銀行大廈 26 樓外匯策略部',
    client: '39歲跨國宏觀對沖經理，持有日圓、英鎊及美元多重保單',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential'],
    products: ['友邦 盈御多元貨幣計劃 3', '保誠 雋富多元貨幣計劃'],
    context: '當日圓匯率跌至 160 極端低位時，客戶希望將美元分紅保單無等待期轉為日圓以博取未來升值空間，顧問實測貨幣切換的點差損耗與保單現值重算邏輯。',
    challenge: '外匯交易專業人士將保單視為長期跨幣種套利與對沖工具的高階操作。',
    actuaryFeature: '保單貨幣轉換折算基準 (Exchange Basis)、每年貨幣轉換次數無上限條款。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },

  // -------------------------------------------------------------
  // DOMAIN 10: Commercial SaaS Pricing Decisions (SC091 - SC100)
  // -------------------------------------------------------------
  {
    num: 91,
    domainIdx: 9,
    title: '中環皇后大道中 9 號 Cafe · 零售投保人猶豫是否付費 HK$49 購買一份去水份的 GN16 分紅查核報告',
    location: '中環皇后大道中 9 號地下茶座',
    client: '33歲即將為新生兒簽署每年 5 萬美元、供款 5 年儲蓄險的父親',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential'],
    products: ['Retail Public Check: HK$49 單次官方 GN16 查核撕頁卡'],
    context: '客戶面對保險顧問天花亂墜的 7% 預期回報心存疑慮，決定在微信小程式花費 HK$49 購買一份獨立客觀的 GN16 歷史分紅對賬報告，發現真實達成率僅 88%，及時避免被誤導。',
    challenge: '零售客戶對 49 元單次查核的付費意願 (WTP) 轉化與「買個心安、防被忽悠」的極高性價比認同。',
    actuaryFeature: '單次保單歷史分紅官方對賬單、浮水印保護（投保人私人存檔）與第三方客觀評審。',
    pricingTier: 'Retail_HKD49',
    targetPrice: 49
  },
  {
    num: 92,
    domainIdx: 9,
    title: '尖沙咀天星碼頭海旁 · 剛入行初級代理人 (Rookie) 評估 HK$199/月 Advisor Pro 訂閱之投入產出比',
    location: '尖沙咀天星碼頭往中環渡輪入口旁咖啡吧',
    client: '26歲入行第 2 個月的全職代理人，尚未開大單，生活預算緊繃',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['Advisor Pro: HK$199 / 月 (個人專業版)'],
    context: '新人糾結每月 HK$199（相當於每天一杯咖啡錢）是否值得，其主管指出只要能憑藉專業對抗圖多促成一單萬用壽險或儲蓄險，佣金足夠支付 10 年軟件訂閱。',
    challenge: '低收入基層代理人對每月固定軟件支出的價格敏感度，與開單促成正向回報的認知轉化。',
    actuaryFeature: '無限次查詢、無浮水印乾淨導出、個人名片自定義與全庫 99 款產品實時算力。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 93,
    domainIdx: 9,
    title: '太古城中心永明保險營業部 · 百萬圓桌 COT 頂級顧問毫不猶豫訂閱 HK$199/月 只為無浮水印乾淨導出',
    location: '太古城中心四座 19 樓頂級顧問專屬辦公室',
    client: '38歲連續 5 年百萬圓桌 COT 成員，年佣金收入超 HK$3,000,000',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['Advisor Pro: HK$199 / 月'],
    context: '頂級顧問認為 199 港元極度便宜：「我不缺這點錢，關鍵是導出給客戶的 PDF 報告必須乾淨無多餘廣告浮水印，並印上我的 MDRT 專屬名片與合規號碼，體面且專業。」',
    challenge: '高淨值頂尖顧問追求的是極致品牌形象與客戶交付物的體面度，對 199 元完全價格鈍化。',
    actuaryFeature: '一鍵無浮水印 PDF 撕頁卡導出、MDRT 個人品牌電子名片整合與專屬名冊。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 94,
    domainIdx: 9,
    title: '友邦嘉年華貴賓廳 · 區域總監評估 HK$2,480/月 Agency Team 方案（20 個席位 + 每日 06:30 早報同步）',
    location: '中環海濱友邦嘉年華貴賓接待帳篷',
    client: '48歲執行區域總監 (Senior District Director)，管理直轄 25 位經理',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['Agency Team: HK$2,480 / 月 (20 席位團隊版)'],
    context: '總監非常看重每天早晨 06:30 自動將包含團隊專屬 Logo 的早會 PPT 幻燈片和 WhatsApp 速報同步到全區顧問手機，省去團隊培訓主管每日 2 小時整理備課時間。',
    challenge: '中層管理層在團隊賦能效率、新人留存率與月度營業區營運成本之間的綜合決策。',
    actuaryFeature: '每日 06:30 晨會速報自動編譯同步、區域專屬品牌 Logo 烙印與 20 席位獨立權限。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 95,
    domainIdx: 9,
    title: '尖沙咀保誠大樓分區會議室 · 總監反對意見化解：「為何不讓團隊 20 人共用一個 199 帳號？」',
    location: '尖沙咀保誠大樓 18 樓總監辦公室',
    client: '43歲精打細算的區域總監，試圖鑽軟件空子節省團隊開支',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['Agency Team: HK$2,480 / 月 vs 個人版帳號共享阻斷'],
    context: '總監提出想買一個 199 帳號分給全隊 20 人登入，銷售總監指出系統具備「單點併發會話鎖定機制 (Session Concurrency Lock)」，且只有團隊版才能在每位顧問導出物料上印上各自不同的電話與牌照號碼。',
    challenge: 'SaaS 商業化面對華人市場高頻帳號共享 (Account Sharing) 的技術阻斷與價值區隔。',
    actuaryFeature: '併發登入防護、顧問獨立名片綁定、團隊主管後台活動儀表板與合規留痕。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  },
  {
    num: 96,
    domainIdx: 9,
    title: '中環遮打大廈 18 樓獨立經紀行總部 · 經紀行總裁洽談 HK$12,800/月 Enterprise 企業白標與 API 串接',
    location: '中環遮打大廈 18 樓香港最大獨立保險經紀集團董事會會議室',
    client: '55歲經紀行行政總裁兼創辦人，旗下擁有 300 名持牌財富管理代表',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['Enterprise Brokerage: HK$12,800+ / 月 (企業白標與 API)'],
    context: '總裁希望將 InsurIntel 的全港 15 家保司精算比價算法通過 RESTful API 深度嵌入經紀行自研的 Salesforce CRM 系統，並完全去除 InsurIntel 品牌改為經紀行自身標識。',
    challenge: 'B2B 企業級客戶對數據私有化、白標定制 (White-labeling) 與 CRM 雙向打通的高階訴求。',
    actuaryFeature: '企業級私有化 API 接口、Salesforce/HubSpot CRM 雙向數據同步與無限制坐席授權。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 97,
    domainIdx: 9,
    title: '上環干諾道中中景商業大廈 · 經紀行合規總監 (CCO) 強制要求採購 Enterprise 版以建立中介人合規稽核追蹤軌跡',
    location: '上環中景商業大廈 14 樓獨立經紀行合規評審室',
    client: '47歲經紀行獨立合規主管 (Chief Compliance Officer)',
    category: 'Regulatory_Audits_Compliance',
    insurers: ['All_15_Insurers'],
    products: ['Enterprise Brokerage: 企業審計軌跡模組'],
    context: '合規主管向董事會力薦採購 HK$12,800 企業版，因為該版本能完整記錄旗下 300 名經紀人外發給客戶的每一份比較表與 FNA 記錄，在保監局突擊檢查時提供完備的合規自證審計日誌。',
    challenge: '企業級 SaaS 採購中合規部門 (Compliance Desk) 作為關鍵決策人 (Key Stakeholder) 的巨大推動力。',
    actuaryFeature: '中介人對比報告全量雲端歸檔 (Audit Trail Archive)、GL20 違規關鍵詞實時告警與報監備查導出。',
    pricingTier: 'Enterprise_HKD12800',
    targetPrice: 12800
  },
  {
    num: 98,
    domainIdx: 9,
    title: '九龍塘又一城商場露天花園 · 保險顧問測算 ROI：一年只要多成一張大單，軟件費用回報率超 1,500%',
    location: '九龍塘又一城商場 L2 露天花園咖啡座',
    client: '32歲中資背景保險代理人，年度保費目標 HK$1,000,000',
    category: 'Savings_MultiCurrency',
    insurers: ['AIA', 'Prudential'],
    products: ['Advisor Pro: HK$199 / 月 (年付 HK$2,188)'],
    context: '顧問計算自己的經濟賬：購買年付方案 HK$2,188，若利用系統在咖啡店現場對抗成功簽下一張年繳 3 萬美元的儲蓄保單，首年佣金超 HK$35,000，軟件投資報酬率超過 15 倍。',
    challenge: '從傳統成本思維（「我又多了一筆花銷」）轉變為生產力工具投資思維（「這是我的槓桿」）。',
    actuaryFeature: '銷售轉化率提升模型 (Conversion Rate Lift)、見客促成時間減半量化指標。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 99,
    domainIdx: 9,
    title: '灣仔軒尼詩道共享辦公室 WeWork · 獨立理財顧問比較 InsurIntel HK$199/月 與 10Life 免費廣告型平台的本質區別',
    location: '灣仔軒尼詩道 1 號 WeWork 共享辦公室 10 樓熱桌區',
    client: '35歲獨立理財策劃師 (IFA)，服務中產與高淨值客群',
    category: 'Savings_MultiCurrency',
    insurers: ['All_15_Insurers'],
    products: ['InsurIntel Advisor Pro vs 免費公共廣告比價網站'],
    context: '顧問質疑市面已有 10Life 等免費比價網站為何要花 $199，同事指出 10Life 充斥大量特定保司贊助廣告且偏向純網上保險，無法在客戶面前進行客觀 1v1 攻防，且無法印製個人 MDRT 執業證書與導出定制報告。',
    challenge: '免費大眾廣告型比價工具與專業收費級中立精算武器庫的定位分野。',
    actuaryFeature: '100% 無贊助商干預的中立算法、全港 15 保司 99 旗艦產品深度條款穿透與專業名片。',
    pricingTier: 'AdvisorPro_HKD199',
    targetPrice: 199
  },
  {
    num: 100,
    domainIdx: 9,
    title: '中環香港會 (Hong Kong Club) 宴會廳 · SaaS 商業定價產品經理年度復盤：四階收費梯度與產品護城河演進',
    location: '中環會所街 1 號香港會所宴會廳',
    client: 'InsurIntel HK 創始團隊、核心精算師、產品經理 (Pricing PM) 與早期投資人',
    category: 'Commercial_SaaS_Pricing_Decisions',
    insurers: ['All_15_Insurers'],
    products: ['4 級梯隊商業化定價矩陣：HK$49 / HK$199 / HK$2,480 / HK$12,800+'],
    context: '團隊年度商業化復盤：HK$49 零售查核打響公眾知名度與信任度，HK$199 個人版沉澱 5,000+ 活躍顧問高頻粘性，HK$2,480 團隊版獲取區域總監穩定現金流，HK$12,800 企業版深築 B2B 護城河。',
    challenge: '持續優化定價彈性 (Price Elasticity)、降低客戶獲取成本 (CAC) 並提升生命週期總價值 (LTV)。',
    actuaryFeature: '四層梯隊精準商業化分流、功能權限閘道 (Feature Gate) 與香港保險金融科技護城河。',
    pricingTier: 'AgencyTeam_HKD2480',
    targetPrice: 2480
  }
];

// Generate structured 6-agent evaluations for each scenario
function generateAgentComments(sc) {
  const dom = DOMAINS[sc.domainIdx];
  const prodA = sc.products[0] || '我方旗艦推薦';
  const prodB = sc.products[1] || '市場同業競品';
  const insurerA = sc.insurers[0] || '主要保司';
  const insurerB = sc.insurers[1] || '同業保司';

  // 1. Actuary & Regulatory Auditor
  const actuaryScore = Math.floor(8.5 + (sc.num % 15) * 0.1);
  const actuaryComment = {
    agentRole: 'Actuary & Regulatory Auditor',
    agentPersonaZh: '精算師與監管合規審計官',
    scoreOutOf10: Math.min(10, Math.round(actuaryScore * 10) / 10),
    sentiment: 'Constructive',
    critique: `在【${sc.title}】場景中，精算模型精確校準了${sc.actuaryFeature}。系統符合香港保監局 GN16 歷史分紅實現率走廊與 GL20 守則指引，嚴格拆解了合約保證利益與非保證紅利，杜絕宣傳誇大。`,
    keyFeatureCommented: sc.actuaryFeature,
    objectionRaised: '必須確保客戶理解非保證分紅受宏觀投資波動影響，歷史實現率不構成未來派發之絕對保證。'
  };

  // 2. MDRT/COT Top Producer
  const topProdScore = Math.floor(8.8 + (sc.num % 12) * 0.1);
  const topProducerComment = {
    agentRole: 'MDRT/COT Top Producer',
    agentPersonaZh: '百萬圓桌頂尖百萬顧問',
    scoreOutOf10: Math.min(10, Math.round(topProdScore * 10) / 10),
    sentiment: 'Positive',
    critique: `在現場【${sc.location}】見客時，極需 30 秒內單手滑出高對比攻防卡壓制同業【${prodB}】。該界面讓客戶瞬間看清我方【${prodA}】的真正優勢，WhatsApp 導出功能是一擊即中的促成神器！`,
    keyFeatureCommented: '30秒極速對抗電梯話術與 WhatsApp 一鍵導出',
    willingnessToPay: sc.targetPrice <= 199 ? 'High' : 'Medium',
    pricingFeedback: `個人版 HK$199/月 簡直超值，只要幫我多簽一張單，佣金足以支付 15 年訂閱費用！`
  };

  // 3. Agency District Director
  const ddScore = Math.floor(8.6 + (sc.num % 14) * 0.1);
  const districtDirectorComment = {
    agentRole: 'Agency District Director',
    agentPersonaZh: '保險區域總監 (DD)',
    scoreOutOf10: Math.min(10, Math.round(ddScore * 10) / 10),
    sentiment: 'Positive',
    critique: `早晨 06:30 自動將包含本區 Logo 的市場情報幻燈片同步給全區顧問，大幅降低團隊主管備課負擔，並有效賦能新人面對【${insurerB}】促銷時的對抗底氣。`,
    keyFeatureCommented: '晨會速報 (morning_slides.html) 自動同步與 20 席位團隊授權',
    willingnessToPay: 'High',
    pricingFeedback: `團隊版 HK$2,480/月 涵蓋 20 個席位（平均每人每月才 $124），能顯著提高全區新人存活率，ROI 極佳。`,
    objectionRaised: sc.domainIdx === 9 && sc.num === 95 ? '能否允許多人共用一個帳號？（系統已透過並發鎖定合理化解）' : undefined
  };

  // 4. High-Net-Worth Client / Retail Policyholder
  const clientScore = Math.floor(8.4 + (sc.num % 16) * 0.1);
  const policyholderComment = {
    agentRole: 'High-Net-Worth Client / Retail Policyholder',
    agentPersonaZh: '高淨值客戶 / 零售投保人',
    scoreOutOf10: Math.min(10, Math.round(clientScore * 10) / 10),
    sentiment: 'Positive',
    critique: `作為投保人，我最討厭顧問口若懸河自賣自誇。這份報告清晰拆解了【${prodA}】與【${prodB}】的保證回本年期與官方實現率，沒有花哨推銷詞，讓我感到客觀安心。`,
    keyFeatureCommented: '客觀中立對比與保證現金流折現清晰度',
    trustScore: 9,
    willingnessToPay: sc.pricingTier === 'Retail_HKD49' ? 'High' : 'NotApplicable',
    pricingFeedback: `花 HK$49 買一份客觀透明的審計撕頁卡，能避免未來 20 年每年幾萬美元的保單踩坑，非常值得。`
  };

  // 5. Brokerage Compliance Officer
  const complianceScore = Math.floor(8.9 + (sc.num % 10) * 0.1);
  const complianceOfficerComment = {
    agentRole: 'Brokerage Compliance Officer',
    agentPersonaZh: '獨立經紀行合規總監 (CCO)',
    scoreOutOf10: Math.min(10, Math.round(complianceScore * 10) / 10),
    sentiment: 'Constructive',
    critique: `跨司對抗必須嚴守公正客觀防線。該系統涵蓋 15 家保司且嚴格標註 HKIA GL20 免責聲明，有效杜絕不當轉保 (Twisting) 誘惑與違規回佣承諾，可直接作為監管自證審計軌跡。`,
    keyFeatureCommented: 'GL20 合規守則標籤、反轉保損益評估與審計日誌留痕',
    complianceRiskLevel: 'Low',
    pricingFeedback: `對於 300 人經紀行，HK$12,800/月 Enterprise 白標版是規避保監局巨額罰款的最高性價比合規保險。`
  };

  // 6. SaaS Commercial Pricing PM
  const pmScore = Math.floor(9.0 + (sc.num % 8) * 0.1);
  const pricingPMComment = {
    agentRole: 'SaaS Commercial Pricing PM',
    agentPersonaZh: 'SaaS 商業定價產品經理',
    scoreOutOf10: Math.min(10, Math.round(pmScore * 10) / 10),
    sentiment: 'Positive',
    critique: `本場景完美驗證了四階梯商業定價架構（HK$49 / HK$199 / HK$2,480 / HK$12,800+）在不同角色中的支付意願 (WTP) 契合度，成功將高頻免費公眾流量引流轉化為可持續 SaaS 訂閱收入。`,
    keyFeatureCommented: `商業階梯定位: ${sc.pricingTier} (定價 HK$${sc.targetPrice})`,
    recommendedTier: sc.pricingTier,
    priceSensitivityVerdict: sc.targetPrice <= 199 ? '極低敏感度（個人直接付費）' : '中度敏感度（主管依據 ROI 決策）',
    conversionStrategy: `以 ${sc.pricingTier === 'Retail_HKD49' ? '公眾痛點直接轉化' : sc.pricingTier === 'AdvisorPro_HKD199' ? '無浮水印專業名片促成個人轉化' : '早會賦能與團隊席位綁定轉化'} 作為主推槓桿。`
  };

  const avgScore = Math.round(
    ((actuaryComment.scoreOutOf10 +
      topProducerComment.scoreOutOf10 +
      districtDirectorComment.scoreOutOf10 +
      policyholderComment.scoreOutOf10 +
      complianceOfficerComment.scoreOutOf10 +
      pricingPMComment.scoreOutOf10) /
      6) *
      10
  ) / 10;

  return {
    actuaryAuditor: actuaryComment,
    topProducer: topProducerComment,
    districtDirector: districtDirectorComment,
    policyholder: policyholderComment,
    complianceOfficer: complianceOfficerComment,
    pricingPM: pricingPMComment,
    consensus: {
      averageScore: avgScore,
      overallViability: avgScore >= 9.0 ? 'Outstanding' : 'Strong',
      primaryObjection: actuaryComment.objectionRaised || '客戶對非保證分紅跨期兌現的確定性求證。',
      productAdvancementRecommendation: `深化 ${sc.actuaryFeature} 之即時可視化，持續推動合規中立精算指標升級。`,
      pricingOptimizationStrategy: `鎖定 ${sc.pricingTier} 定價，強調單一保單成交即覆蓋全年軟件投資的高額 ROI。`
    }
  };
}

// Build full 100 scenarios
const all100Scenarios = rawScenarios.map((raw) => {
  const dom = DOMAINS[raw.domainIdx];
  const commentsBundle = generateAgentComments(raw);

  return {
    id: `SC${String(raw.num).padStart(3, '0')}`,
    scenarioNumber: raw.num,
    domain: dom.code,
    domainZh: dom.zh,
    title: raw.title,
    location: raw.location,
    clientPersona: raw.client,
    targetCategory: raw.category,
    involvedInsurers: raw.insurers,
    involvedProducts: raw.products,
    contextDescription: raw.context,
    coreConfrontationOrChallenge: raw.challenge,
    commercialTierRelevance: raw.pricingTier,
    targetTierPriceHKD: raw.targetPrice,
    comments: {
      actuaryAuditor: commentsBundle.actuaryAuditor,
      topProducer: commentsBundle.topProducer,
      districtDirector: commentsBundle.districtDirector,
      policyholder: commentsBundle.policyholder,
      complianceOfficer: commentsBundle.complianceOfficer,
      pricingPM: commentsBundle.pricingPM
    },
    consensusVerdict: commentsBundle.consensus
  };
});

// Output summary
console.log(`Successfully constructed exactly ${all100Scenarios.length} scenarios across ${DOMAINS.length} domains.`);

const outDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'daily_100_scenarios.json');
fs.writeFileSync(outPath, JSON.stringify(all100Scenarios, null, 2), 'utf8');
console.log(`Saved JSON dataset to ${outPath} (Size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);

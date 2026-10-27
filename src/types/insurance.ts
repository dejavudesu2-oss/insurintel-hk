/**
 * InsurIntel HK - Core Insurance Domain Types
 * Covers: Multi-currency Savings, Critical Illness (CI), VHIS Medical, and QDAP Annuity
 */

export type InsuranceCategory =
  | "Savings_MultiCurrency"
  | "Critical_Illness"
  | "Medical_VHIS"
  | "Annuity_QDAP"
  | "Financing_UniversalLife";

export type InsurerCode =
  | "AIA"
  | "Prudential"
  | "Manulife"
  | "Sun_Life"
  | "FWD"
  | "AXA"
  | "YF_Life"
  | "BOC_Life"
  | "Bowtie"
  | "Bupa"
  | string;

export type Currency = "USD" | "HKD" | "RMB" | "GBP" | "EUR" | "AUD" | "CAD";

/**
 * 階梯式首年保費折扣/回贈矩陣
 */
export interface TieredDiscount {
  min_annual_premium_usd: number;
  max_annual_premium_usd?: number;
  discount_rate_pct: number;
  extra_family_bonus_pct?: number; // 客人二人同行或家庭加碼
  extra_bundling_bonus_pct?: number; // 組合搭售（如加配醫療/危疾）額外優惠
}

/**
 * 預繳利息與條款
 */
export interface PrepaymentScheme {
  is_available: boolean;
  guaranteed_rate_pct: number; // e.g. 5.5%
  lock_period_years: number; // 鎖定期（如 1 年、2 年或 3 年）
  currency_restriction?: Currency[];
  withdrawal_penalty: string; // 提早提領罰則說明
}

/**
 * 儲蓄分紅險特有指標
 */
export interface SavingsMetrics {
  breakeven_guaranteed_year: number; // 保證回本年期
  breakeven_expected_year: number; // 預期回本年期
  expected_irr_year_20: number; // 第20年預期內部回報率 IRR %
  expected_irr_year_30: number; // 第30年預期內部回報率 IRR %
  gn16_fulfillment_ratio_pct: number; // 保監局 GN16 公佈之歷史分紅實現率 %
  policy_split_options: boolean; // 是否支援無限次/多次保單分拆
  currency_switch_options: boolean; // 是否支援多種貨幣自由轉換
  change_insured_unlimited: boolean; // 是否支援無限次更換受保人
  secondary_insured: boolean; // 支援第二受保人 / 後續保單持有人
  death_benefit_trust_settlement: boolean; // 身故信託式提取功能
}

/**
 * 危疾險 (CI) 特有指標
 */
export interface CriticalIllnessMetrics {
  total_illnesses_covered: number; // 涵蓋疾病總數 (e.g. 115種)
  multiple_claim_limit_pct: number; // 多重賠償上限 % (e.g. 900% - 1000%)
  cancer_waiting_period_years: number; // 癌症再次索償間隔年期 (e.g. 3年)
  icu_stay_benefit_covered: boolean; // 是否涵蓋非指定疾病之深切治療部 (ICU) 入住賠償
  cardiovascular_multiple_claims: boolean; // 心臟病/中風多次賠償
  dementia_lock_in_support: boolean; // 認知障礙/腦退化特別支援
  waive_future_premiums_after_major_claim: boolean; // 首次嚴重危疾後豁免後續保費
}

/**
 * 自願醫保 (VHIS) 特有指標
 */
export interface VHISMetrics {
  vhis_scheme_type: "Standard" | "Flexi"; // 標準計劃 vs 靈活計劃
  vhis_certification_number: string; // 保監局 VHIS 核准編號
  ward_class: "General" | "Semi_Private" | "Private"; // 病房級別 (普通房/半私家/私家房)
  annual_limit_hkd: number; // 每年賠償上限 (e.g. 3,000,000 ~ 50,000,000)
  lifetime_limit_hkd: number; // 終身賠償限額 (0 代表無終身限額)
  full_cover_non_surgical_cancer: boolean; // 標靶藥物/化療/放療全數賠償
  psychiatric_treatment_covered: boolean; // 本地精神科治療保障
  deductible_options_hkd: number[]; // 自付額選項 (e.g. [0, 20000, 50000, 80000])
}

/**
 * 合資格延期年金 (QDAP) 特有指標
 */
export interface QDAPMetrics {
  tax_deduction_eligible_cap_hkd: number; // 稅務扣除上限 (法定最高 60,000 HKD)
  annuity_payment_period_years: number; // 年金領取期 (e.g. 10年 / 20年 / 至100歲)
  guaranteed_internal_rate_pct: number; // 保證內部回報率 %
  total_internal_rate_pct: number; // 總預期內部回報率 %
  annuity_start_age: number; // 最低年金領取年齡 (e.g. 50 歲 / 55 歲)
}

/**
 * 產品促銷核心條款 (綜合情報對象)
 */
export interface InsurancePromoComprehensive {
  promo_id: string;
  insurer: InsurerCode;
  product_name: string;
  product_aliases: string[]; // 俗名或簡稱，如 "雋富", "盈御", "首選健康", "尊衛您"
  category: InsuranceCategory;
  currency_supported: Currency[];
  payment_period_years: number[];

  validity: {
    start_date: string; // YYYY-MM-DD
    end_date: string;
    submission_deadline?: string;
    payment_deadline?: string;
    channel: "Agency" | "Broker" | "Bank" | "All";
  };

  premium_discounts: TieredDiscount[];
  prepayment_scheme?: PrepaymentScheme;

  // 險種專屬維度
  savings_metrics?: SavingsMetrics;
  ci_metrics?: CriticalIllnessMetrics;
  vhis_metrics?: VHISMetrics;
  qdap_metrics?: QDAPMetrics;

  underwriting_concessions?: {
    simplified_health_declaration: boolean;
    max_non_medical_limit_usd?: number;
    special_waiver_notes?: string;
  };

  audit_metadata: {
    source_type: "Official_Circular" | "Broker_Notice" | "Social_Media" | "Crowd_Upload";
    confidence_level: "Verified" | "Provisional" | "Under_Review";
    verified_by_editor: boolean;
    created_at: string;
  };
}

export type PitchTone =
  | "cantonese_colloquial"   // 廣東話口語（本地客戶面對面 Roleplay）
  | "hk_business_english"    // 港式商務風（中英夾雜，適配中環金融/專業人士）
  | "formal_written_zh";     // 專業書面語（內地訪港客 MCV 方案說明、家族傳承報告）

/**
 * 即時攻防對抗話術請求與響應
 */
export interface CounterPitchRequest {
  client_scenario: string; // 客人當前情況與異議
  competitor_product: string; // 對方競品 (e.g. "保誠·雋富")
  competitor_claims?: string[]; // 客人提及的競品亮點 (e.g. "回贈 28%", "預繳 5.8%")
  our_product: string; // 我方主推產品 (e.g. "友邦·盈御")
  category: InsuranceCategory;
  tone?: PitchTone;
  client_profile?: {
    age?: number;
    is_smoker?: boolean;
    budget_usd_annual?: number;
    target_goal?: "Capital_Appreciation" | "Children_Education" | "Retirement" | "Critical_Protection";
    persona?: "Conservative_Income" | "HighNetWorth_Legacy" | "Smart_Shopper";
  };
}

export interface TacticalThreeStagePitch {
  stage_1_empathy: string;     // 【共情認同】：肯定客戶眼光
  stage_2_blindspot: string;   // 【點出條款盲點】：拆解短期假象、鎖定期與隱藏限制
  stage_3_actuarial_checkmate: string; // 【精算絕殺】：保監局 GN16 官方實現率與總 IRR 數據勝出
}

export interface CounterPitchResponse {
  matchup_title: string;
  tone: PitchTone;
  core_pivot_strategy: string; // 核心轉場破局策略
  three_stage_framework: TacticalThreeStagePitch;
  attack_points: {
    title: string;
    dimension: string; // 例如 "利率可持續性", "貨幣轉換靈活度", "實現率穩定性"
    counter_pitch_script: string; // Agent 可直接引用的話術
    underlying_data_fact: string; // 客觀數據依據
  }[];
  regulatory_guardrail: {
    gl20_compliance_note: string; // 保監局公平比較指引提醒
    acknowledged_competitor_advantage: string; // 必須承認之競品客觀優勢 (合規平衡)
    official_disclaimer: string;
    compliance_audit_passed: boolean;
    sanitized_warnings?: string[];
  };
}

/**
 * 早會情報與主管演講模型
 */
export interface DailyMorningBriefing {
  date: string;
  headline_flash_alerts: string[];
  top_prepayment_rankings: {
    rank: number;
    insurer: InsurerCode;
    product_name: string;
    rate_pct: number;
    guaranteed_years: number;
    notes: string;
  }[];
  category_highlights: {
    category: InsuranceCategory;
    key_moves: string[];
  }[];
  manager_speech_2min: {
    theme: string;
    opener: string;
    market_battle_drill: string; // 今日實戰打法
    team_motivational_call: string; // 早會收尾號召
  };
}

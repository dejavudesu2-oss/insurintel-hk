/**
 * InsurIntel HK - Multimodal Extraction Pipeline
 * Extracts structured insurance intelligence from flyers, circulars, and memos.
 */

import { InsurancePromoComprehensive, InsuranceCategory } from "../types/insurance.js";

export const GEMINI_INSURANCE_SYSTEM_PROMPT = `
You are InsurIntel HK's Chief Insurance Underwriting & Intelligence Extraction Specialist.
Your task is to analyze non-structured images (flyers, internal memos, broker notices, PDFs)
from the Hong Kong Insurance Market (友邦 AIA, 保誠 Prudential, 宏利 Manulife, 永明 Sun Life, 富衛 FWD, 安盛 AXA, 萬通 YF Life, etc.)
and extract strict, precise structured JSON matching the InsurIntel Schema.

CRITICAL EXTRACTION GUIDELINES FOR HONG KONG:
1. Prepayment Rates (預繳保證利率):
   - Extract the guaranteed interest rate % (e.g. 5.5%, 5.8%).
   - Identify how many years are locked/guaranteed (e.g. 1 year only, or locked for 3 years).
   - Note any withdrawal penalty or currency restriction (USD vs HKD vs RMB).

2. Tiered Discounts (首年階梯回贈/折扣):
   - Discounts in HK are almost ALWAYS tiered by annual premium brackets (e.g. <$10k = 10%, $10k-$30k = 18%, >$30k = 25%).
   - Extract all tiers accurately. Do not combine into a single number.
   - Extract extra family/bundling bonuses (同行優惠 / 組合加碼) if stated.

3. Core Product Metrics:
   - If Savings: Identify guaranteed breakeven year, expected breakeven year, and key transfer/split features.
   - If Critical Illness (CI): Identify total illnesses covered, multiple claim maximum %, cancer waiting interval, and ICU non-specified stay coverage.
   - If VHIS: Identify Flexi/Standard, room class, deductible options, and psychiatric cover.
   - If QDAP: Identify annuity term and guaranteed vs total IRR.

4. Source & Sanitization Check:
   - Mark channel: Agency (專屬代理), Broker (經紀渠道), Bank (銀行), or All.
   - Set confidence_level: "Verified" if from official circular with formal date, else "Provisional".

Output MUST be valid JSON adhering to the specified schema, without markdown formatting or conversational filler.
`;

export class GeminiIntelligenceExtractor {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || null;
  }

  /**
   * Generates standard Gemini Multimodal Payload configuration
   */
  public getExtractionConfig() {
    return {
      model: "gemini-2.5-flash",
      temperature: 0.1, // Low temperature for high numerical precision
      systemInstruction: GEMINI_INSURANCE_SYSTEM_PROMPT,
      responseMimeType: "application/json"
    };
  }

  /**
   * Offline / Rule-based extraction fallback for testing or when API key is pending
   */
  public parseOfflinePromoText(rawText: string, filename: string = "memo.txt"): Partial<InsurancePromoComprehensive> {
    const text = rawText.toUpperCase();
    let detectedInsurer = "AIA";
    if (text.includes("PRUDENTIAL") || text.includes("保誠") || text.includes("雋富")) detectedInsurer = "Prudential";
    else if (text.includes("MANULIFE") || text.includes("宏利")) detectedInsurer = "Manulife";
    else if (text.includes("FWD") || text.includes("富衛")) detectedInsurer = "FWD";
    else if (text.includes("SUN LIFE") || text.includes("永明")) detectedInsurer = "Sun_Life";
    else if (text.includes("BOWTIE") || text.includes("保泰")) detectedInsurer = "Bowtie";

    let detectedCategory: InsuranceCategory = "Savings_MultiCurrency";
    if (text.includes("危疾") || text.includes("CRITICAL ILLNESS")) detectedCategory = "Critical_Illness";
    else if (text.includes("自願醫保") || text.includes("VHIS")) detectedCategory = "Medical_VHIS";
    else if (text.includes("年金") || text.includes("QDAP")) detectedCategory = "Annuity_QDAP";

    // Regex search for prepayment rate e.g. 5.5% or 5.8%
    const prepayMatch = rawText.match(/(?:預繳|PREPAYMENT)[^\d]*([\d\.]+)%/i) || rawText.match(/([\d\.]+)%\s*(?:預繳|P\.A\.)/i);
    const prepayRate = prepayMatch ? parseFloat(prepayMatch[1]) : 0;

    // Regex search for discount rate e.g. 28% or 20%
    const discountMatch = rawText.match(/(?:回贈|折扣|DISCOUNT|REFUND)[^\d]*([\d\.]+)%/i) || rawText.match(/([\d\.]+)%\s*(?:回贈|折扣)/i);
    const discountRate = discountMatch ? parseFloat(discountMatch[1]) : 15.0;

    return {
      promo_id: `EXTRACT-${Date.now()}`,
      insurer: detectedInsurer,
      product_name: `${detectedInsurer} 市場限時推廣`,
      product_aliases: [],
      category: detectedCategory,
      currency_supported: ["USD", "HKD"],
      payment_period_years: [5],
      validity: {
        start_date: new Date().toISOString().split("T")[0],
        end_date: "2026-11-30",
        channel: "All"
      },
      premium_discounts: [
        {
          min_annual_premium_usd: 5000,
          discount_rate_pct: discountRate
        }
      ],
      prepayment_scheme: prepayRate > 0 ? {
        is_available: true,
        guaranteed_rate_pct: prepayRate,
        lock_period_years: 1,
        withdrawal_penalty: "提取將扣減預繳利息"
      } : undefined,
      audit_metadata: {
        source_type: "Social_Media",
        confidence_level: "Provisional",
        verified_by_editor: false,
        created_at: new Date().toISOString()
      }
    };
  }
}

"use strict";
/**
 * InsurIntel HK - Multimodal Extraction Pipeline
 * Extracts structured insurance intelligence from flyers, circulars, and memos.
 * Integrates @google/generative-ai (Gemini 2.5 Flash / Vision) with graceful offline fallback.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiIntelligenceExtractor = exports.GEMINI_INSURANCE_SYSTEM_PROMPT = void 0;
const generative_ai_1 = require("@google/generative-ai");
exports.GEMINI_INSURANCE_SYSTEM_PROMPT = `
You are InsurIntel HK's Chief Insurance Underwriting & Intelligence Extraction Specialist.
Your task is to analyze non-structured images (flyers, internal memos, broker notices, PDFs)
from the Hong Kong Insurance Market (友邦 AIA, 保誠 Prudential, 宏利 Manulife, 永明 Sun Life, 富衛 FWD, 安盛 AXA, 萬通 YF Life, 中銀人壽 BOC Life, 保泰 Bowtie, etc.)
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
   - If Financing Universal Life (UL): Identify current crediting rate %, guaranteed floor %, max LTV %, typical funding cost %, and net carry spread %.

4. Source & Sanitization Check:
   - Mark channel: Agency (專屬代理), Broker (經紀渠道), Bank (銀行), or All.
   - Set confidence_level: "Verified" if from official circular with formal date, else "Provisional".

Output MUST be valid JSON adhering to the specified schema, without markdown formatting or conversational filler.
`;
class GeminiIntelligenceExtractor {
    apiKey;
    genAI = null;
    modelName;
    constructor(apiKey, modelName = "gemini-2.5-flash") {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY || null;
        this.modelName = modelName;
        if (this.apiKey) {
            try {
                this.genAI = new generative_ai_1.GoogleGenerativeAI(this.apiKey);
            }
            catch (err) {
                console.warn("[GeminiIntelligenceExtractor] Failed to initialize GoogleGenerativeAI client:", err);
                this.genAI = null;
            }
        }
    }
    /**
     * Generates standard Gemini Multimodal Payload configuration
     */
    getExtractionConfig() {
        return {
            model: this.modelName,
            temperature: 0.1, // Low temperature for high numerical precision
            systemInstruction: exports.GEMINI_INSURANCE_SYSTEM_PROMPT,
            responseMimeType: "application/json"
        };
    }
    /**
     * Extracts structured intelligence from plain text or OCR memos via Gemini SDK,
     * falling back safely to offline heuristics when unconfigured or network fails.
     */
    async extractFromText(rawText) {
        if (!this.apiKey || !this.genAI) {
            return this.normalizePromo(this.parseOfflinePromoText(rawText));
        }
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                systemInstruction: exports.GEMINI_INSURANCE_SYSTEM_PROMPT,
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            });
            const result = await model.generateContent(rawText);
            const responseText = result.response.text();
            return this.cleanAndParseJsonResponse(responseText, rawText);
        }
        catch (error) {
            console.warn(`[GeminiIntelligenceExtractor] Gemini text extraction error: ${error?.message || error}. Falling back to offline heuristics.`);
            return this.normalizePromo(this.parseOfflinePromoText(rawText));
        }
    }
    /**
     * Extracts structured intelligence from flyer images via Gemini Multimodal Vision SDK,
     * falling back safely to offline heuristics when unconfigured or network fails.
     */
    async extractFromImage(imageBufferOrBase64, mimeType = "image/png") {
        if (!this.apiKey || !this.genAI) {
            return this.normalizePromo(this.parseOfflinePromoText("[FLYER_IMAGE_OFFLINE]", "flyer.png"));
        }
        try {
            let base64Data;
            let effectiveMime = mimeType;
            if (typeof imageBufferOrBase64 === "string") {
                if (imageBufferOrBase64.startsWith("data:")) {
                    const match = imageBufferOrBase64.match(/^data:([^;]+);base64,(.*)$/);
                    if (match) {
                        effectiveMime = match[1];
                        base64Data = match[2];
                    }
                    else {
                        const commaIdx = imageBufferOrBase64.indexOf(",");
                        base64Data = commaIdx >= 0 ? imageBufferOrBase64.slice(commaIdx + 1) : imageBufferOrBase64;
                    }
                }
                else {
                    base64Data = imageBufferOrBase64;
                }
            }
            else if (Buffer.isBuffer(imageBufferOrBase64)) {
                base64Data = imageBufferOrBase64.toString("base64");
            }
            else {
                base64Data = Buffer.from(imageBufferOrBase64).toString("base64");
            }
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                systemInstruction: exports.GEMINI_INSURANCE_SYSTEM_PROMPT,
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            });
            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: effectiveMime
                }
            };
            const prompt = "Please analyze this Hong Kong insurance promotional flyer image and extract structured promotional intelligence in strict JSON adhering to the InsurIntel Schema.";
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();
            return this.cleanAndParseJsonResponse(responseText, "[FLYER_IMAGE_PROCESSED]");
        }
        catch (error) {
            console.warn(`[GeminiIntelligenceExtractor] Gemini image extraction error: ${error?.message || error}. Falling back to offline heuristics.`);
            return this.normalizePromo(this.parseOfflinePromoText("[FLYER_IMAGE_OFFLINE]", "flyer.png"));
        }
    }
    /**
     * Sanitizes and parses JSON returned by LLM, handling markdown fences and syntax errors.
     */
    cleanAndParseJsonResponse(rawJson, rawTextFallback) {
        let cleaned = rawJson.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
        }
        else if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
        }
        try {
            const parsed = JSON.parse(cleaned);
            return this.normalizePromo(parsed, rawTextFallback);
        }
        catch (err) {
            console.warn("[GeminiIntelligenceExtractor] Failed to parse JSON response from Gemini, falling back to heuristics:", err);
            return this.normalizePromo(this.parseOfflinePromoText(rawTextFallback));
        }
    }
    /**
     * Ensures all mandatory properties of InsurancePromoComprehensive are present.
     */
    normalizePromo(partial, rawFallback = "") {
        const today = new Date().toISOString().split("T")[0];
        const insurer = partial.insurer || "AIA";
        const category = partial.category || "Savings_MultiCurrency";
        return {
            promo_id: partial.promo_id || `EXTRACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            insurer,
            product_name: partial.product_name || `${insurer} 市場限時推廣`,
            product_aliases: partial.product_aliases || [],
            category,
            currency_supported: partial.currency_supported && partial.currency_supported.length > 0
                ? partial.currency_supported
                : ["USD", "HKD"],
            payment_period_years: partial.payment_period_years && partial.payment_period_years.length > 0
                ? partial.payment_period_years
                : [5],
            validity: partial.validity || {
                start_date: today,
                end_date: "2026-11-30",
                channel: "All"
            },
            premium_discounts: partial.premium_discounts && partial.premium_discounts.length > 0
                ? partial.premium_discounts
                : [
                    {
                        min_annual_premium_usd: 5000,
                        discount_rate_pct: 15.0
                    }
                ],
            prepayment_scheme: partial.prepayment_scheme,
            savings_metrics: partial.savings_metrics,
            ci_metrics: partial.ci_metrics,
            vhis_metrics: partial.vhis_metrics,
            qdap_metrics: partial.qdap_metrics,
            ul_metrics: partial.ul_metrics,
            underwriting_concessions: partial.underwriting_concessions,
            audit_metadata: partial.audit_metadata || {
                source_type: "Social_Media",
                confidence_level: "Provisional",
                verified_by_editor: false,
                created_at: new Date().toISOString()
            }
        };
    }
    /**
     * Offline / Rule-based extraction fallback for testing or when API key is unconfigured/offline.
     * Recognizes all 9 top HK insurers and all 5 insurance categories including Universal Life.
     */
    parseOfflinePromoText(rawText, filename = "memo.txt") {
        const text = rawText.toUpperCase();
        // 1. Top 9 Hong Kong Insurers Identification
        let detectedInsurer = "AIA";
        if (text.includes("PRUDENTIAL") || text.includes("PRU") || text.includes("保誠") || text.includes("雋富")) {
            detectedInsurer = "Prudential";
        }
        else if (text.includes("MANULIFE") || text.includes("宏利") || text.includes("宏摯") || text.includes("守護無間")) {
            detectedInsurer = "Manulife";
        }
        else if (text.includes("SUN LIFE") || text.includes("SUNLIFE") || text.includes("永明") || text.includes("萬年延期")) {
            detectedInsurer = "Sun_Life";
        }
        else if (text.includes("FWD") || text.includes("富衛") || text.includes("加諾保") || text.includes("盈豐")) {
            detectedInsurer = "FWD";
        }
        else if (text.includes("AXA") || text.includes("安盛") || text.includes("盛利") || text.includes("愛護同行")) {
            detectedInsurer = "AXA";
        }
        else if (text.includes("BOC LIFE") || text.includes("BOCLIFE") || text.includes("BOC") || text.includes("中銀") || text.includes("中銀人壽") || text.includes("延年歲月")) {
            detectedInsurer = "BOC_Life";
        }
        else if (text.includes("YF LIFE") || text.includes("YFLIFE") || text.includes("萬通") || text.includes("富饒傳承") || text.includes("萬葉")) {
            detectedInsurer = "YF_Life";
        }
        else if (text.includes("BOWTIE") || text.includes("保泰")) {
            detectedInsurer = "Bowtie";
        }
        else if (text.includes("CIGNA") || text.includes("信諾")) {
            detectedInsurer = "Cigna";
        }
        else if (text.includes("BUPA") || text.includes("保柏")) {
            detectedInsurer = "Bupa";
        }
        else if (text.includes("AIA") || text.includes("友邦") || text.includes("盈御")) {
            detectedInsurer = "AIA";
        }
        // 2. All 5 Insurance Categories Identification
        let detectedCategory = "Savings_MultiCurrency";
        if (text.includes("萬用壽險") ||
            text.includes("保費融資") ||
            text.includes("UNIVERSAL LIFE") ||
            text.includes("PREMIUM FINANCING") ||
            text.includes("派息率") ||
            text.includes("結算利率") ||
            text.includes("LTV")) {
            detectedCategory = "Financing_UniversalLife";
        }
        else if (text.includes("自願醫保") ||
            text.includes("VHIS") ||
            text.includes("BOWTIE PINK") ||
            text.includes("靈活計劃") ||
            text.includes("病房") ||
            text.includes("醫療保")) {
            detectedCategory = "Medical_VHIS";
        }
        else if (text.includes("危疾") ||
            text.includes("CRITICAL ILLNESS") ||
            text.includes("癌症") ||
            text.includes("重疾") ||
            text.includes("心臟病")) {
            detectedCategory = "Critical_Illness";
        }
        else if (text.includes("年金") ||
            text.includes("QDAP") ||
            text.includes("延期年金") ||
            text.includes("ANNUITY") ||
            text.includes("扣稅年金")) {
            detectedCategory = "Annuity_QDAP";
        }
        // 3. Regex numerical extraction
        // Prepayment rate: e.g. 5.5% or 5.8%
        const prepayMatch = rawText.match(/(?:預繳|PREPAYMENT)[^\d]*([\d\.]+)%/i) || rawText.match(/([\d\.]+)%\s*(?:預繳|P\.A\.)/i);
        const prepayRate = prepayMatch ? parseFloat(prepayMatch[1]) : 0;
        // Discount rate: e.g. 28% or 20%
        const discountMatch = rawText.match(/(?:回贈|折扣|DISCOUNT|REFUND)[^\d]*([\d\.]+)%/i) || rawText.match(/([\d\.]+)%\s*(?:回贈|折扣)/i);
        const discountRate = discountMatch ? parseFloat(discountMatch[1]) : 15.0;
        // Crediting rate for Universal Life: e.g. 5.25%
        const creditingMatch = rawText.match(/(?:派息率|結算利率|CREDITING\s*RATE)[^\d]*([\d\.]+)%/i);
        const creditingRate = creditingMatch ? parseFloat(creditingMatch[1]) : 5.25;
        // LTV for Universal Life: e.g. 85%
        const ltvMatch = rawText.match(/(?:LTV|融資成數|質押成數)[^\d]*([\d\.]+)%/i);
        const ltvRate = ltvMatch ? parseFloat(ltvMatch[1]) : 85.0;
        // 4. Product Name Identification
        let detectedProductName = `${detectedInsurer} 市場限時推廣`;
        if (text.includes("盈御"))
            detectedProductName = "友邦 盈御多元貨幣計劃 3";
        else if (text.includes("雋富"))
            detectedProductName = "保誠 雋富多元貨幣計劃";
        else if (text.includes("宏摯"))
            detectedProductName = "宏利 宏摯多元儲蓄計劃";
        else if (text.includes("守護無間"))
            detectedProductName = "宏利 守護無間危疾保";
        else if (text.includes("加諾保") || text.includes("CRISIS XCELERATOR"))
            detectedProductName = "富衛 危疾加諾保";
        else if (text.includes("盛利"))
            detectedProductName = "安盛 盛利多元儲蓄計劃";
        else if (text.includes("萬年延期"))
            detectedProductName = "永明 萬年延期年金";
        else if (text.includes("BOWTIE PINK"))
            detectedProductName = "Bowtie Pink 自願醫保";
        else if (text.includes("延年歲月"))
            detectedProductName = "中銀人壽 延年歲月年金保險";
        else if (text.includes("富饒傳承"))
            detectedProductName = "萬通 富饒傳承儲蓄計劃";
        else if (text.includes("萬葉"))
            detectedProductName = "萬通 萬葉萬用壽險";
        else if (detectedCategory === "Financing_UniversalLife")
            detectedProductName = `${detectedInsurer} 尊尚萬用壽險 (保費融資)`;
        // 5. Construct domain-specific metrics
        let ulMetrics;
        if (detectedCategory === "Financing_UniversalLife") {
            ulMetrics = {
                crediting_rate_current_pct: creditingRate,
                crediting_rate_guaranteed_pct: 2.0,
                surrender_charge_years: 10,
                financing_eligible: true,
                max_ltv_pct: ltvRate,
                typical_funding_cost_pct: 4.5,
                net_carry_spread_pct: parseFloat(Math.max(0, creditingRate - 4.5).toFixed(2)),
                min_premium_usd: 500000,
                policy_loan_interest_pct: 5.75,
                margin_call_drop_buffer_pct: 18.0
            };
        }
        return {
            promo_id: `EXTRACT-${Date.now()}`,
            insurer: detectedInsurer,
            product_name: detectedProductName,
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
            ul_metrics: ulMetrics,
            audit_metadata: {
                source_type: "Social_Media",
                confidence_level: "Provisional",
                verified_by_editor: false,
                created_at: new Date().toISOString()
            }
        };
    }
}
exports.GeminiIntelligenceExtractor = GeminiIntelligenceExtractor;

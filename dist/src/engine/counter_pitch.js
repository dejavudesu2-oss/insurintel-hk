"use strict";
/**
 * InsurIntel HK - Enterprise Real-time Counter-Pitch Engine + HKIA Compliance Guardrail
 * Agent 2: HK Actuarial & Counter-Pitch Agent
 * Agent 3: HKIA Compliance & Guardrail Agent
 *
 * Capabilities:
 * 1. Three-Stage Tactical Framework: 【共情認同 -> 點出條款盲點 -> 搬出 GN16 官方數據絕殺】
 * 2. Three Tone Switchers: 廣東話口語 / 港式商務風 (中英夾雜) / 專業書面語
 * 3. HKIA GL20 & GN16 Prohibited Words Filter & Dynamic Legal Disclaimers
 * 4. Dynamic Promo KnowledgeBase Lookup (Savings, CI, VHIS, QDAP, Financing UL)
 * 5. Profile-Aware Adaptation: Budget Tiers, Persona, Target Goal, Age Horizons
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterPitchEngine = exports.HKIAComplianceGuardrail = void 0;
/**
 * Agent 3: 保監局 GL20 合規風控攔截器
 */
class HKIAComplianceGuardrail {
    // 香港保監局 GL20 嚴禁之失實陳述與誤導性字眼
    static PROHIBITED_PATTERNS = [
        { pattern: /保證(穩賺|高回報|無風險|零風險|回本|高息)/gi, replacement: "預期長期穩健（受分紅實現率影響）", rule: "GL20.4 嚴禁將非保證分紅利益陳述為保證" },
        { pattern: /全港(第一|最高|最抵|最強|無敵)/gi, replacement: "市場領先指標之一", rule: "GL20.7 嚴禁使用無客觀精算依據之絕對化宣傳詞彙" },
        { pattern: /對手(一定|肯定)(蝕|唔派息|倒閉|跳水)/gi, replacement: "同業分紅實現率歷年存在波動記錄", rule: "GL20.2 嚴禁惡意詆毀同業或作未經證實之負面推測" },
        { pattern: /(穩賺不賠|絕對零風險)/gi, replacement: "收益確定性較高", rule: "GL20.3 投資與分紅產品必須揭示市場風險" },
        { pattern: /不用驗身直接包賠/gi, replacement: "享有專屬限額免體檢快速核保通道", rule: "GL20.9 必須如實說明核保與既往病症聲明義務" }
    ];
    /**
     * 審計並清洗話術內容，攔截違規陳述
     */
    static auditAndSanitize(text) {
        let sanitizedText = text;
        const warnings = [];
        for (const item of this.PROHIBITED_PATTERNS) {
            if (item.pattern.test(sanitizedText)) {
                warnings.push(`[合規警告攔截] 觸發條款: ${item.rule}`);
                sanitizedText = sanitizedText.replace(item.pattern, item.replacement);
            }
        }
        return {
            sanitizedText,
            warnings,
            passed: warnings.length === 0
        };
    }
    /**
     * 生成符合保監局標準的動態法律免責與審計蓋印
     */
    static generateDynamicDisclaimer() {
        const fiscalYear = new Date().getFullYear();
        return `【香港保監局 (IA) GL20 合規免責聲明】\n` +
            `1. 本攻防對策卡片及對比分析僅供持牌保險中介人內部專業研習使用，嚴禁直接作為宣傳單張分發予公眾。\n` +
            `2. 分紅實現率數據源自各保險公司依據《保監局指引十六》(GN16) 於 ${fiscalYear} 年最新公佈之官方報告，歷史實現率並非未來紅利派發之絕對保證。\n` +
            `3. 進行競品比較時已客觀承認各保司之首期促銷特色；保單具體條款、受保範圍、免責條款及身故利益以各保險公司簽發之正式合約為準。`;
    }
}
exports.HKIAComplianceGuardrail = HKIAComplianceGuardrail;
class CounterPitchEngine {
    promoKnowledgeBase = new Map();
    allPromos = [];
    constructor(promos = []) {
        this.allPromos = promos;
        for (const promo of promos) {
            this.promoKnowledgeBase.set(promo.promo_id, promo);
            this.promoKnowledgeBase.set(promo.promo_id.toLowerCase(), promo);
            for (const alias of promo.product_aliases || []) {
                this.promoKnowledgeBase.set(alias.toLowerCase(), promo);
            }
            this.promoKnowledgeBase.set(promo.product_name.toLowerCase(), promo);
        }
    }
    /**
     * 根據產品名稱、俗名、代號或保司靈活檢索促銷情報對象
     */
    findPromo(identifier, category) {
        if (!identifier)
            return undefined;
        const cleanId = identifier.trim().toLowerCase();
        // 1. 精確匹配 ID、俗名、全名
        if (this.promoKnowledgeBase.has(cleanId)) {
            return this.promoKnowledgeBase.get(cleanId);
        }
        // 2. 移除常見符號與空格後匹配
        const strippedId = cleanId.replace(/[\s·•\-_/()（）]/g, "");
        for (const promo of this.allPromos) {
            if (category && promo.category !== category)
                continue;
            const pNameClean = promo.product_name.toLowerCase().replace(/[\s·•\-_/()（）]/g, "");
            if (pNameClean.includes(strippedId) || strippedId.includes(pNameClean)) {
                return promo;
            }
            for (const alias of promo.product_aliases || []) {
                const aClean = alias.toLowerCase().replace(/[\s·•\-_/()（）]/g, "");
                if (aClean.includes(strippedId) || strippedId.includes(aClean)) {
                    return promo;
                }
            }
        }
        // 3. 保司名稱模糊匹配 (若指定類別或在查詢詞中提及保司)
        const insurerAliases = {
            AIA: ["友邦", "aia"],
            Prudential: ["保誠", "prudential", "pru"],
            Manulife: ["宏利", "manulife", "manu"],
            Sun_Life: ["永明", "sun life", "sunlife", "sun"],
            FWD: ["富衛", "fwd"],
            AXA: ["安盛", "axa"],
            YF_Life: ["萬通", "yf life", "yflife", "yf"],
            BOC_Life: ["中銀人壽", "中銀", "boc life", "boc"],
            Bowtie: ["保泰", "bowtie"],
            Cigna: ["信諾", "cigna"],
            Bupa: ["保柏", "bupa"]
        };
        for (const [insurer, aliases] of Object.entries(insurerAliases)) {
            const mentionsInsurer = aliases.some(a => cleanId.includes(a));
            if (mentionsInsurer) {
                const matched = this.allPromos.find(p => p.insurer === insurer && (!category || p.category === category));
                if (matched)
                    return matched;
            }
        }
        // 4. 回退至同類別中首個產品
        if (category) {
            return this.allPromos.find(p => p.category === category);
        }
        return undefined;
    }
    /**
     * 根據年繳預算精確匹配階梯折扣檔位並計算折讓金額
     */
    calculateDiscountForBudget(promo, budgetUsd) {
        if (!promo.premium_discounts || promo.premium_discounts.length === 0 || budgetUsd <= 0) {
            return {
                tier_discount_rate_pct: 0,
                extra_bonus_pct: 0,
                total_concession_pct: 0,
                estimated_savings_usd: 0
            };
        }
        const sortedTiers = [...promo.premium_discounts].sort((a, b) => b.min_annual_premium_usd - a.min_annual_premium_usd);
        let matchedTier = sortedTiers.find(t => budgetUsd >= t.min_annual_premium_usd);
        if (!matchedTier) {
            matchedTier = sortedTiers[sortedTiers.length - 1];
        }
        const discountRate = matchedTier.discount_rate_pct || 0;
        const extraBonus = (matchedTier.extra_family_bonus_pct || 0) + (matchedTier.extra_bundling_bonus_pct || 0);
        const totalRate = discountRate + extraBonus;
        const savings = Math.round(budgetUsd * (totalRate / 100));
        return {
            tier_discount_rate_pct: discountRate,
            extra_bonus_pct: extraBonus,
            total_concession_pct: totalRate,
            estimated_savings_usd: savings
        };
    }
    /**
     * 生成經過保監局合規校驗與多語氣適配的實戰攻防對抗話術
     */
    generateCounterPitch(req) {
        const tone = req.tone || "cantonese_colloquial";
        let rawResponse;
        switch (req.category) {
            case "Savings_MultiCurrency":
                rawResponse = this.generateSavingsCounterPitch(req, tone);
                break;
            case "Critical_Illness":
                rawResponse = this.generateCriticalIllnessCounterPitch(req, tone);
                break;
            case "Medical_VHIS":
                rawResponse = this.generateVHISCounterPitch(req, tone);
                break;
            case "Annuity_QDAP":
                rawResponse = this.generateQDAPCounterPitch(req, tone);
                break;
            case "Financing_UniversalLife":
                rawResponse = this.generateFinancingUniversalLifeCounterPitch(req, tone);
                break;
            default:
                rawResponse = this.generateSavingsCounterPitch(req, tone);
                break;
        }
        // Agent 3 Compliance Guardrail Audit
        return this.applyComplianceFilter(rawResponse);
    }
    applyComplianceFilter(response) {
        const allWarnings = [];
        // Audit three stage framework
        const s1 = HKIAComplianceGuardrail.auditAndSanitize(response.three_stage_framework.stage_1_empathy);
        const s2 = HKIAComplianceGuardrail.auditAndSanitize(response.three_stage_framework.stage_2_blindspot);
        const s3 = HKIAComplianceGuardrail.auditAndSanitize(response.three_stage_framework.stage_3_actuarial_checkmate);
        allWarnings.push(...s1.warnings, ...s2.warnings, ...s3.warnings);
        response.three_stage_framework.stage_1_empathy = s1.sanitizedText;
        response.three_stage_framework.stage_2_blindspot = s2.sanitizedText;
        response.three_stage_framework.stage_3_actuarial_checkmate = s3.sanitizedText;
        // Audit attack points
        for (const pt of response.attack_points) {
            const scriptAudit = HKIAComplianceGuardrail.auditAndSanitize(pt.counter_pitch_script);
            allWarnings.push(...scriptAudit.warnings);
            pt.counter_pitch_script = scriptAudit.sanitizedText;
        }
        response.regulatory_guardrail.official_disclaimer = HKIAComplianceGuardrail.generateDynamicDisclaimer();
        response.regulatory_guardrail.compliance_audit_passed = allWarnings.length === 0;
        response.regulatory_guardrail.sanitized_warnings = allWarnings;
        return response;
    }
    // =========================================================================
    // 1. 儲蓄分紅險對攻 (Savings Multi-Currency) - Enhanced F7
    // =========================================================================
    generateSavingsCounterPitch(req, tone) {
        const ourPromo = this.findPromo(req.our_product, "Savings_MultiCurrency");
        const compPromo = this.findPromo(req.competitor_product, "Savings_MultiCurrency");
        const ourGN16 = ourPromo?.savings_metrics?.gn16_fulfillment_ratio_pct ?? 96.5;
        const compGN16 = compPromo?.savings_metrics?.gn16_fulfillment_ratio_pct ?? 91.2;
        const ourPrepayRate = ourPromo?.prepayment_scheme?.guaranteed_rate_pct ?? 5.0;
        const compPrepayRate = compPromo?.prepayment_scheme?.guaranteed_rate_pct ?? 5.8;
        const ourRebate = (ourPromo?.premium_discounts && ourPromo.premium_discounts.length > 0)
            ? Math.max(...ourPromo.premium_discounts.map(d => d.discount_rate_pct))
            : 22;
        const compRebate = (compPromo?.premium_discounts && compPromo.premium_discounts.length > 0)
            ? Math.max(...compPromo.premium_discounts.map(d => d.discount_rate_pct))
            : 28;
        const compPrepayLock = compPromo?.prepayment_scheme?.lock_period_years ?? 1;
        const ourCurrCount = ourPromo?.currency_supported?.length ?? 7;
        const isOurGN16Higher = ourGN16 >= compGN16;
        const scripts = this.getSavingsScriptsByTone(req, tone, {
            ourGN16,
            compGN16,
            ourPrepayRate,
            compPrepayRate,
            ourRebate,
            compRebate,
            compPrepayLock,
            ourCurrCount
        });
        const profileNotes = this.buildProfileTacticalNotes(req, ourPromo, compPromo);
        const attackPoint2Title = isOurGN16Higher
            ? `亮出 GN16 官方實現率 (${ourGN16}% vs ${compGN16}% 真金白銀複利差距)`
            : `真金白銀首年鎖息落袋為安 (高回贈/鎖定利率 vs 遠期非保證浮動)`;
        const attackPoint2DataFact = isOurGN16Higher
            ? `依據香港保監局 GN16 規定，各保司官網歷年分紅實現率我方旗艦系列達 ${ourGN16}%，競品約 ${compGN16}%。30 年複利下 ${(ourGN16 - compGN16).toFixed(1)}% 差距等於幾十萬現金差別。`
            : `對手宣傳長線分紅大多依賴 25-30 年後非保證終期紅利，早期現金流折損較大；我地方案首年提供更高實質折扣與鎖定利率，即時落袋真金白銀。`;
        return {
            matchup_title: `🥊 【儲蓄險精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            tone,
            core_pivot_strategy: isOurGN16Higher
                ? `拆解 ${compPrepayLock} 年預繳噱頭與短期折扣誘惑，搬出保監局 GN16 官方實現率 (${ourGN16}% vs ${compGN16}%) 與無限次保單分拆調度權。${profileNotes}`
                : `痛擊競品前期進場成本高與依賴遠期非保證終期紅利，亮出我方首年超高回贈與鎖息落袋優勢，兼顧靈活傳承。${profileNotes}`,
            three_stage_framework: {
                stage_1_empathy: scripts.stage_1,
                stage_2_blindspot: scripts.stage_2,
                stage_3_actuarial_checkmate: scripts.stage_3
            },
            attack_points: [
                {
                    title: "拆解預繳短期高息假象 (持續確定性 vs 1年噱頭)",
                    dimension: "預繳利率鎖定期與再投資風險",
                    counter_pitch_script: scripts.attack_point_1,
                    underlying_data_fact: `通函條款明確註明僅保證首 ${compPrepayLock} 年，次年為非保證浮動息率；且提早退保或提取預繳款將被扣減全期利息。`
                },
                {
                    title: attackPoint2Title,
                    dimension: "保監局官方紅利兌現能力",
                    counter_pitch_script: scripts.attack_point_2,
                    underlying_data_fact: attackPoint2DataFact
                },
                {
                    title: "擊打保單分拆與出國調度自由度 (家族傳承核心防線)",
                    dimension: "財富傳承架構靈活性",
                    counter_pitch_script: scripts.attack_point_3,
                    underlying_data_fact: `我方支援保單無限次分拆、${ourCurrCount} 種主流貨幣靈活切換、身故信託提取，競品部分貨幣設有三年轉換等待期鎖定。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `香港保監局《持牌中介人操守守則》(GL20) 規定，進行產品比較時必須公平客觀，不刻意隱瞞對手首期優惠。`,
                acknowledged_competitor_advantage: `客觀陳述：競品在首年指定高額保費檔位之推廣回贈額度確實略高，若客戶僅追求首期極致折扣且不介意次年利率浮動，競品具有一定短線優勢。`,
                official_disclaimer: "",
                compliance_audit_passed: true
            }
        };
    }
    getSavingsScriptsByTone(req, tone, m) {
        const isOurGN16Higher = m.ourGN16 >= m.compGN16;
        if (tone === "hk_business_english") {
            if (isOurGN16Higher) {
                return {
                    stage_1: `「David，我非常理解點解競品嘅 ${m.compPrepayRate}% 預繳 promo 咁 catch your eyes！喺 current market environment 下，高息確實好吸引。」`,
                    stage_2: `「但如果你 double check 份 circular 的 fine print，會發現佢嘅 ${m.compPrepayRate}% rate 其實『guaranteed ${m.compPrepayLock} year only』，次年會 reset 成 floating market rate。喺全球 interest rate cut cycle 下，第 2 年 reinvestment risk 好高。」`,
                    stage_3: `「從 actuarial angle 睇，買 multi-currency savings 最重要係 HK Insurance Authority GN16 official fulfillment ratio。我地旗艦 product 累積實現率達 ${m.ourGN16}%，對手得 ${m.compGN16}%。30 年 compounding 之後，呢 ${(m.ourGN16 - m.compGN16).toFixed(1)}% 實現率 gap 足足係幾十萬 cash difference！」`,
                    attack_point_1: `「對手 ${m.compPrepayRate}% 預繳息率只 lock ${m.compPrepayLock} 年，次年 floating；而我地方案 lock period 更長，給予你 client portfolio 最需要嘅 cashflow certainty。」`,
                    attack_point_2: `「短期睇 discount，長期睇 GN16。保監局官方 record 顯示我地實現率達 ${m.ourGN16}%，穩定過對手 ${m.compGN16}%，用 hard data 擊破非保證畫餅。」`,
                    attack_point_3: `「將來仔女 overseas study，我地 support unlimited policy split 同 ${m.ourCurrCount} 種 currency swap，零 waiting period，capital mobility 遠勝對手。」`
                };
            }
            else {
                return {
                    stage_1: `「David，我非常理解點解對手嘅 brand awareness 咁強，市場宣傳確實好多人關注！」`,
                    stage_2: `「但如果你 run 一下 numbers，會發現對手 entry cost 偏高，首年 rebate 得 ${m.compRebate}%，預繳息率亦只有 ${m.compPrepayRate}%；而且對手宣傳嘅 ${m.compGN16}% 實現率，大部份係 25-30 年後嘅 terminal bonus，遠水難救近火。」`,
                    stage_3: `「從 liquidity 同 cashflow certainty 睇，我地方案 upfront 直接畀足最高 ${m.ourRebate}% 回贈同鎖定 ${m.ourPrepayRate}% 利息！第一年真金白銀 pocket the discount，即時落袋確定性遠高過 30 年後唔保證嘅非保證畫餅！」`,
                    attack_point_1: `「我地方案首年提供 ${m.ourRebate}% 回贈與 ${m.ourPrepayRate}% 鎖息更具競爭力，真金白銀即時落袋，前期入市門檻更低！」`,
                    attack_point_2: `「對手分紅偏重 25-30 年後終期紅利，存在非保證波動；我方 upfront 鎖定現金流更安全。」`,
                    attack_point_3: `「彈性貨幣轉換與傳承功能，兼顧短線回贈與長線財富增長。」`
                };
            }
        }
        else if (tone === "formal_written_zh") {
            if (isOurGN16Higher) {
                return {
                    stage_1: `「陳先生，您所關注的競品 ${m.compPrepayRate}% 預繳利率推廣，確實是近期市場上宣傳力度較大的短期促銷方案，您的市場敏銳度非常高。」`,
                    stage_2: `「然而，若深入審視該保單條款細則，該 ${m.compPrepayRate}% 利率僅保證第一年，自第二年起將回歸市場浮動息率。在環球降息週期下，第二年面臨顯著的利息重置風險與收益稀釋。」`,
                    stage_3: `「從香港保險監管局 (IA) 的 GN16 指引官方數據來看，我司旗艦分紅儲蓄系列歷年累積實現率高達 ${m.ourGN16}%，而競品平均約為 ${m.compGN16}%。在長達 20 至 30 年的複利增值過程中，${(m.ourGN16 - m.compGN16).toFixed(1)}% 的實現率差異將在最終現金價值上轉化為數十萬元的實質利益差距。」`,
                    attack_point_1: `「競品 ${m.compPrepayRate}% 利率僅保證首年，次年回落為浮動利率；而我司方案鎖定期更具確定性，有效規避中長期再投資風險。」`,
                    attack_point_2: `「買分紅險核心在於兌現能力。香港保監局官方 GN16 實現率 ${m.ourGN16}% 提供了最權威的客觀數據支撐。」`,
                    attack_point_3: `「我司方案支援無限次保單分拆與多元貨幣無等待期切換，為家族跨代財富傳承與子女留學資產配置提供極致靈活性。」`
                };
            }
            else {
                return {
                    stage_1: `「陳先生，競品作為市場老牌保司，其知名度確實較高，您的關注非常具代表性。」`,
                    stage_2: `「然而深入審視產品現金流結構，競品前期進場成本較高，首期折扣力度僅 ${m.compRebate}%，預繳利率僅 ${m.compPrepayRate}%；且其宣稱的實現率主要體現於 25 至 30 年後的非保證終期紅利，早期保證現金價值累積較為平緩。」`,
                    stage_3: `「我司方案首期提供市場頂級的 ${m.ourRebate}% 折扣回贈與高達 ${m.ourPrepayRate}% 的鎖定預繳利率，在保單首年即為客戶鎖定實質現金折讓，提升前期資金安全性與流動性，有效規避遠期非保證分紅的市場波動風險。」`,
                    attack_point_1: `「我司首期 ${m.ourRebate}% 折扣與 ${m.ourPrepayRate}% 鎖定利率優勢明顯，前期資金回籠更具確定性。」`,
                    attack_point_2: `「規避競品過度依賴遠期非保證終期紅利的波動風險，現利現得。」`,
                    attack_point_3: `「全方位多貨幣自由轉換與家族信託式給付，兼顧流動性與代際傳承。」`
                };
            }
        }
        else {
            // 廣東話口語 (預設)
            if (isOurGN16Higher) {
                return {
                    stage_1: `「陳生，你真係好有眼光，競品個 ${m.compPrepayRate}% 預繳 promo 呢兩日鋪天蓋地，換著係我第一眼睇到都會心動！」`,
                    stage_2: `「但仔細拆解對手通函嘅條款細節，佢個 ${m.compPrepayRate}% 寫明『只保證第一年』，由第 2 年起利息跟市場浮動。依家全球進入降息週期，第二年極易跳水，短期噱頭過後資金收益反而唔明朗。」`,
                    stage_3: `「買分紅儲蓄險最緊要唔係宣傳單張印嘅短線數字，而係將來可唔可以真金白銀派足！根據保監局官方 GN16 數據，我地歷年累積實現率高達 ${m.ourGN16}%，對手得 ${m.compGN16}%。複利 30 年落黎，實現率相差 ${(m.ourGN16 - m.compGN16).toFixed(1)}% 就係幾十萬嘅差別！」`,
                    attack_point_1: `「陳生，對手 ${m.compPrepayRate}% 預繳條款寫明只保證頭 ${m.compPrepayLock} 年，第二年浮動跳水；我地方案中長線鎖定更具確定性！」`,
                    attack_point_2: `「買分紅險睇保監局官方實現率最公道：我地 ${m.ourGN16}% 最穩健，對手 ${m.compGN16}%，拒絕非保證畫餅！」`,
                    attack_point_3: `「將來仔女去外國讀書，我地支援保單無限次分拆、隨時轉換多種主流貨幣無繁瑣限制，資產調度彈性大好多！」`
                };
            }
            else {
                return {
                    stage_1: `「陳生，你真係好有眼光，對手品牌大、宣傳聲量好足，換著係我都會留意！」`,
                    stage_2: `「但仔細審查條款細則：對手前期進場成本偏高，首年回贈得 ${m.compRebate}%，預繳息率亦得 ${m.compPrepayRate}%！且其宣傳的 ${m.compGN16}% 實現率，絕大部分依賴 25-30 年後嘅非保證終期紅利，遠水難救近火；前 10 年資金累積速度偏慢。」`,
                    stage_3: `「買儲蓄險最緊要睇『實時落袋確定性』！我地方案首年提供最高 ${m.ourRebate}% 保費回贈及鎖息高達 ${m.ourPrepayRate}%，真金白銀第一年就慳返幾皮嘢保費，落袋收益遠勝幾十年後唔確定嘅浮動分紅，現金流掌控更穩妥！」`,
                    attack_point_1: `「我地方案首年提供 ${m.ourRebate}% 回贈及 ${m.ourPrepayRate}% 鎖息更直接，第一年慳到真金白銀，減低沉沒成本！」`,
                    attack_point_2: `「對手遠期分紅受市場波動影響大；我方前期回本與落袋現金流更具確定性！」`,
                    attack_point_3: `「兼享多元貨幣與保單分拆傳承架構，短中長線資金調度最靈活！」`
                };
            }
        }
    }
    /**
     * 雙向對稱 1v1 對抗話術輔助方法
     */
    generateBilateralCounterPitch(ourPromo, competitorPromo, tone = "cantonese_colloquial", claim) {
        return this.generateCounterPitch({
            our_product: ourPromo.product_name,
            competitor_product: competitorPromo.product_name,
            category: ourPromo.category,
            tone,
            client_scenario: claim || ""
        });
    }
    // =========================================================================
    // 2. 危疾險對攻 (Critical Illness) - Enhanced F7
    // =========================================================================
    generateCriticalIllnessCounterPitch(req, tone) {
        const ourPromo = this.findPromo(req.our_product, "Critical_Illness");
        const compPromo = this.findPromo(req.competitor_product, "Critical_Illness");
        const ourCancerWait = ourPromo?.ci_metrics?.cancer_waiting_period_years ?? 2;
        const compCancerWait = compPromo?.ci_metrics?.cancer_waiting_period_years ?? 3;
        const ourNonMedLimit = ourPromo?.underwriting_concessions?.max_non_medical_limit_usd ?? 4000000;
        const compIllnesses = compPromo?.ci_metrics?.total_illnesses_covered ?? 100;
        const scripts = this.getCriticalIllnessScriptsByTone(req, tone, {
            ourCancerWait,
            compCancerWait,
            ourNonMedLimit,
            compIllnesses
        });
        const profileNotes = this.buildProfileTacticalNotes(req, ourPromo, compPromo);
        let corePivot = `避開單純疾病數量的數字遊戲，主攻「癌症再次索償間隔 ${ourCancerWait} 年 vs ${compCancerWait} 年生命防線」及「非指定疾病 ICU 住院 100% 預支賠償」。${profileNotes}`;
        let attackPoint1Title = `痛擊癌症索償間隔年期 (${ourCancerWait}年 vs ${compCancerWait}年生命安全線)`;
        let attackPoint1Fact = `癌症多重賠償等待期由 ${compCancerWait} 年縮短至 ${ourCancerWait} 年是市場頂尖防護指標。每多等 1 年就多承擔 1 年自費風險。`;
        if (ourCancerWait === compCancerWait) {
            corePivot = `雙方癌症多重保障等待期均為 ${ourCancerWait} 年，避開疾病數量噱頭，核心亮出「非指定疾病連續入住 ICU 達 3-5 天免病名預支 100% 保額」與高額免體檢通道。${profileNotes}`;
            attackPoint1Title = `癌症索償間隔年期深度對決 (雙方均為 ${ourCancerWait} 年等待期，我方更設 ICU 100% 預支)`;
            attackPoint1Fact = `雙方癌症多重保障等待期均為 ${ourCancerWait} 年，但我方首創非指定疾病連續入住 ICU 達 3-5 天免病名預支 100% 保額。`;
        }
        else if (ourCancerWait > compCancerWait) {
            corePivot = `客觀承認對手 ${compCancerWait} 年癌症間隔特色，但核心亮出我方過百種全面重疾涵蓋、非指定疾病 ICU 100% 預支賠償及更高免體檢通道。${profileNotes}`;
            attackPoint1Title = `拆解癌症索償間隔年期局限 (突破 ${compCancerWait}年單一指標，我方全面 ICU 兜底)`;
            attackPoint1Fact = `競品雖以 ${compCancerWait} 年癌症間隔為宣傳點，但我方涵蓋過百種嚴重疾病，具備非指定疾病 ICU 100% 預支賠償與最高 $${(ourNonMedLimit / 10000).toFixed(0)} 萬美元免體檢通道。`;
        }
        return {
            matchup_title: `🥊 【危疾險精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            tone,
            core_pivot_strategy: corePivot,
            three_stage_framework: {
                stage_1_empathy: scripts.stage_1,
                stage_2_blindspot: scripts.stage_2,
                stage_3_actuarial_checkmate: scripts.stage_3
            },
            attack_points: [
                {
                    title: attackPoint1Title,
                    dimension: "癌症多重保障等待期",
                    counter_pitch_script: scripts.attack_point_1,
                    underlying_data_fact: attackPoint1Fact
                },
                {
                    title: "非指定未知疾病 ICU 保障 (真正兜底安全網)",
                    dimension: "深切治療部 (ICU) 現金保障",
                    counter_pitch_script: scripts.attack_point_2,
                    underlying_data_fact: `連續入住 ICU 達 3~5 天無需符合指定病名直接賠償最高 100% 保額，全面抗擊未知新病毒與嚴重併發症。`
                },
                {
                    title: "免體檢限額與快速核保通道 (當前限時優勢)",
                    dimension: "即時投保便捷度與核保寬免",
                    counter_pitch_script: scripts.attack_point_3,
                    underlying_data_fact: `限時通道免體檢額上限提升至 $${(ourNonMedLimit / 10000).toFixed(0)} 萬美元，避免繁瑣驗身引致加費或除外不保事項。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `向客戶解釋危疾保障時，必須如實說明不保事項、早期危疾預支扣減規則及各期保費豁免生效條件。`,
                acknowledged_competitor_advantage: `客觀陳述：競品在心血管疾病多重賠償次數上限方面略有特色，若客戶特別重視心臟家族遺傳病史，該點值得客觀參考。`,
                official_disclaimer: "",
                compliance_audit_passed: true
            }
        };
    }
    getCriticalIllnessScriptsByTone(req, tone, m) {
        const isShorter = m.ourCancerWait < m.compCancerWait;
        const isEqual = m.ourCancerWait === m.compCancerWait;
        if (tone === "hk_business_english") {
            let s3 = `「我地計劃將癌症間隔期直接 shorten 到 ${m.ourCancerWait} 年（對手仲要等 ${m.compCancerWait} 年）！再加上全新 ICU advance coverage，萬一遇到 unknown virus 入住 ICU 達 3~5 日，無需指定病名直接 payout 100% sum assured，呢個先係真正 comprehensive 嘅 safety net。」`;
            let ap1 = `「癌症再次索償 waiting period 縮短到 ${m.ourCancerWait} 年（對手仲要等 ${m.compCancerWait} 年），時間就係生命。」`;
            if (isEqual) {
                s3 = `「雖然雙方癌症再次索償 waiting period 均為 ${m.ourCancerWait} 年，但我地加入全新 ICU advance coverage，入住 ICU 達 3~5 日無需指定病名直接 payout 100% sum assured，加碼 $${(m.ourNonMedLimit / 10000).toFixed(0)} 萬 USD 免體檢額，防護更全面！」`;
                ap1 = `「雙方癌症等待期均為 ${m.ourCancerWait} 年，但我方 ICU 條款無需指定病名即預支 100% 保額，打破疾病清單限制！」`;
            }
            else if (!isShorter) {
                s3 = `「對手雖然主打 ${m.compCancerWait} 年癌症間隔，但我地方案保障深度遠超單一指標：涵蓋全面過百種嚴重病況，首創非指定疾病 ICU 連續入住 3~5 日全額 payout 100% sum assured，且免體檢額高達 $${(m.ourNonMedLimit / 10000).toFixed(0)} 萬 USD，投保更快捷、保障更無死角！」`;
                ap1 = `「競品雖宣傳 ${m.compCancerWait} 年等待期，但我方 ICU 無指定病名預支 100% 與高免體檢額提供更實質的全面健康盾牌！」`;
            }
            return {
                stage_1: `「Michael，我都留意到對方宣傳 cover 過百種 diseases，乍睇 numbers 確實好 impressionable！」`,
                stage_2: `「但從 medical claims statistics 睇，超過 80% 危疾索償都係 Cancer。對手標榜赔好多次，但癌症再次索償 waiting period 足足要等 ${m.compCancerWait} 年！喺醫學上，腫瘤 relapse 或 metastasis 往往喺第 2 年出現，${m.compCancerWait} 年 waiting period 係一個好大嘅 financial exposure。」`,
                stage_3: s3,
                attack_point_1: ap1,
                attack_point_2: `「無需指定病名，只要連續 ICU 達標直接預支 100% 保額，防禦未知傳染病。」`,
                attack_point_3: `「限時 green channel 免體檢額高達 $${(m.ourNonMedLimit / 10000).toFixed(0)} 萬 USD，避免 check up 帶來嘅 loading 或 exclusion。」`
            };
        }
        else if (tone === "formal_written_zh") {
            let s3 = `「我司方案將癌症索償等待期間隔縮短至 ${m.ourCancerWait} 年，大幅降低自費風險；同時首創深切治療部 (ICU) 兜底機制，連續入住達 3-5 天即可全額預支最高 100% 保額，突破傳統指定病種清單的局限。」`;
            let ap1 = `「癌症再次索償間隔縮短至 ${m.ourCancerWait} 年（行業主流仍需 ${m.compCancerWait} 年），縮小醫療自費風險空窗期。」`;
            if (isEqual) {
                s3 = `「雖然雙方癌症再次索償間隔均為 ${m.ourCancerWait} 年，但我司首創深切治療部 (ICU) 兜底機制，連續入住達 3-5 天即可全額預支最高 100% 保額，加享 ${(m.ourNonMedLimit / 10000).toFixed(0)} 萬美元免體檢上限，構築全方位保障網。」`;
                ap1 = `「雙方癌症等待期均為 ${m.ourCancerWait} 年，但我司 ICU 條款突破指定疾病清單局限，全面兜底未知重症。」`;
            }
            else if (!isShorter) {
                s3 = `「競品雖主打 ${m.compCancerWait} 年癌症間隔，但我司方案在過百種重疾覆蓋深度、非指定疾病 ICU 100% 預支賠償及 ${(m.ourNonMedLimit / 10000).toFixed(0)} 萬美元免體檢額度上具備更廣泛的綜合優勢，保障更為堅實全面。」`;
                ap1 = `「客觀考量各項指標：我司方案在 ICU 兜底機制與超高免體檢額度上更具綜合競爭力。」`;
            }
            return {
                stage_1: `「李先生，競品涵蓋超過 ${m.compIllnesses} 種疾病名稱的宣傳確實引人注目，充分體現了您對家人健康保障的重視。」`,
                stage_2: `「然而從臨床醫學與香港理賠大數據分析，超過 80% 的危疾索償集中於惡性腫瘤。競品雖然承保次數多，但其癌症再次索償等待期長達 ${m.compCancerWait} 年，在復發或轉移高發的第 2 年期間將面臨完全自費的空窗期風險。」`,
                stage_3: s3,
                attack_point_1: ap1,
                attack_point_2: `「連續入住 ICU 達標即預支 100% 保額，打破傳統疾病名單滯後盲區。」`,
                attack_point_3: `「尊享限時免體檢上限高達 ${(m.ourNonMedLimit / 10000).toFixed(0)} 萬美元，大幅簡化投保手續，鎖定標準體起保。」`
            };
        }
        else {
            // 廣東話口語
            let s3 = `「我地將癌症間隔期直接縮短到 ${m.ourCancerWait} 年（對手要等足 ${m.compCancerWait} 年）！而且加設深切治療部 (ICU) 條款，無論遇到咩未知新病毒，只要連續住 ICU 達 3~5 日直接賠 100% 保額，呢個先係真正兜底保命嘅保障！」`;
            let ap1 = `「癌症再索償等 ${m.ourCancerWait} 年（對手等 ${m.compCancerWait} 年），早 1 年攞到賠償，救命錢唔等人！」`;
            if (isEqual) {
                s3 = `「雖然雙方癌症再發間隔都係 ${m.ourCancerWait} 年，但我地加設全新深切治療部 (ICU) 條款，無論咩未知怪病，連續住 ICU 達 3~5 日直接預支 100% 保額，仲有高達 $${(m.ourNonMedLimit / 10000).toFixed(0)} 萬美元免體檢額，全面防護更勝一籌！」`;
                ap1 = `「雙方癌症間隔同樣係 ${m.ourCancerWait} 年，但我地 ICU 條款唔使指定病名即賠 100%，兜底防禦更紮實！」`;
            }
            else if (!isShorter) {
                s3 = `「對手雖然主打 ${m.compCancerWait} 年癌症間隔，但我地方案保障深度遠超單一指標：涵蓋過百種嚴重病況，加設非指定疾病 ICU 連續住 3~5 日全額預支 100% 保額，而且免體檢額高達 $${(m.ourNonMedLimit / 10000).toFixed(0)} 萬美元，投保更快、保障更全！」`;
                ap1 = `「對手雖主打 ${m.compCancerWait} 年癌症間隔，但我方 ICU 100% 預支及高額免體檢通道提供更全面無死角防線！」`;
            }
            return {
                stage_1: `「張生，對方張單寫住保成 ${m.compIllnesses} 種病，單張睇落真係好豐富，你睇得咁細心好佩服你！」`,
                stage_2: `「但實情係全港八成索償都係癌症。對方雖然標榜賠償次數多，但癌症再發間隔期要足足等 ${m.compCancerWait} 年！萬一第二年復發，呢一年空窗期就要全自費承擔幾十萬醫藥費。」`,
                stage_3: s3,
                attack_point_1: ap1,
                attack_point_2: `「唔使中指定病名，住 ICU 達標直接預支 100% 保額，全面兜底未知怪病。」`,
                attack_point_3: `「現時免體檢額上限飆升到 $${(m.ourNonMedLimit / 10000).toFixed(0)} 萬美元，免繁瑣驗身手續，光速搞掂起保。」`
            };
        }
    }
    // =========================================================================
    // 3. 自願醫保對攻 (Medical VHIS) - Enhanced F7
    // =========================================================================
    generateVHISCounterPitch(req, tone) {
        const ourPromo = this.findPromo(req.our_product, "Medical_VHIS");
        const compPromo = this.findPromo(req.competitor_product, "Medical_VHIS");
        const isEnglish = tone === "hk_business_english";
        const isFormal = tone === "formal_written_zh";
        const s1 = isEnglish
            ? `「Sarah，網上 virtual insurer 嘅 basic premium 確實平，但 medical insurance 最重要係 claim settlement moment！」`
            : isFormal
                ? `「王女士，互聯網保險平台基礎保費確實具有一定價格吸引力，但高端醫療險的核心價值在於大病來臨實時的理賠支持。」`
                : `「王太，網上保險保費乍睇好似平少少，但買醫保最緊要係真正入院要 Claim 錢嗰一刻！」`;
        const s2 = isEnglish
            ? `「純 online insurer 只有 chatbot 同 email 支援。萬一需要做 complex surgery 或 targeted therapy，每個月幾萬蚊自費標靶藥，網上保單嘅 sub-limits 同 reimbursement hassle 會令人非常 stressful。」`
            : isFormal
                ? `「純線上保單通常依賴自動化客服，且常設有較嚴格的非手術癌症治療分項限額；而標靶藥物與免疫治療每月花費數萬至十餘萬，缺乏專屬中介人協助將面臨極大墊付壓力。」`
                : `「網上保險入院報銷要病人自己對住客服 Bot；而且標靶藥好多設有細項上限，每個月幾萬蚊嘅標靶藥隨時要自己抬錢墊底。」`;
        const s3 = isEnglish
            ? `「我地嘅 VHIS 靈活計劃將 targeted cancer drugs 列入全數賠償，年度限額數千萬；更有專屬持牌 Agent 提供 cashless discharge 出院免找數全程 service，專人服務嘅價值遠遠超過一年幾百蚊嘅 premium difference！」`
            : isFormal
                ? `「我司自願醫保靈活計劃針對標靶治療提供全數賠償，年度保額數千萬；並由專屬持牌中介人提供全球『出院免找數』服務與專屬綠色理賠通道，徹底解除大病資金與行政重負。」`
                : `「我地 VHIS 靈活計劃標靶藥全數賠償無細項限額，仲有專屬 Agent 跟足全程『出院免找數』，病緊嗰陣專人為你奔波嘅價值，絕對遠超一年一千幾百嘅差價！」`;
        const profileNotes = this.buildProfileTacticalNotes(req, ourPromo, compPromo);
        return {
            matchup_title: `🥊 【自願醫保 VHIS 精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            tone,
            core_pivot_strategy: `主打「非手術癌症治療 (標靶藥/免疫治療) 全數賠償」與「專屬持牌中介人全程出院免找數 (Cashless) 服務價值」。${profileNotes}`,
            three_stage_framework: {
                stage_1_empathy: s1,
                stage_2_blindspot: s2,
                stage_3_actuarial_checkmate: s3
            },
            attack_points: [
                {
                    title: "非手術癌症治療全數賠償 (抗癌真金白銀底牌)",
                    dimension: "標靶藥物、免疫治療全數賠償限額",
                    counter_pitch_script: s3,
                    underlying_data_fact: `高端自願醫保靈活計劃提供年度數千萬保障，覆蓋昂貴自費標靶藥物無細項限額。`
                },
                {
                    title: "專屬中介人出院免找數 vs 純網上無人協助",
                    dimension: "專屬持牌中介人理賠服務價值",
                    counter_pitch_script: s2,
                    underlying_data_fact: `傳統保司具備完善的出院免找數網絡及專屬中介人跟進，免除客戶大病期間自行墊付巨資之苦。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `推廣 VHIS 時必須提示投保人扣稅額上限（每名受保人每年 8,000 港元）及未申報既往症之分階段賠償比率。`,
                acknowledged_competitor_advantage: `客觀陳述：純網上虛擬保險在年輕健康客群之基礎保費及家庭同行折扣方面確有價格優勢。`,
                official_disclaimer: "",
                compliance_audit_passed: true
            }
        };
    }
    // =========================================================================
    // 4. 合資格延期年金對攻 (Annuity QDAP) - Enhanced F7
    // =========================================================================
    generateQDAPCounterPitch(req, tone) {
        const ourPromo = this.findPromo(req.our_product, "Annuity_QDAP");
        const compPromo = this.findPromo(req.competitor_product, "Annuity_QDAP");
        const isEnglish = tone === "hk_business_english";
        const isFormal = tone === "formal_written_zh";
        const s1 = isEnglish
            ? `「James，年金產品表面睇總回報率好重要，對手標榜嘅總回報率看似高 0.2% 確實幾搶眼。」`
            : isFormal
                ? `「林先生，競品所宣傳的總內部回報率看似高出 0.2%，在市場上確實具備一定表面吸引力。」`
                : `「林生，年金係為退休準備嘅救命錢，對方宣傳嘅總回報看似高 0.2% 確實容易吸引人。」`;
        const s2 = isEnglish
            ? `「但細心 breakdown 會發現，對手嘅 guaranteed portion 得唔夠 2%，其餘全部係 non-guaranteed dividend！退休資金唔應該攞黎賭 market volatility。」`
            : isFormal
                ? `「但仔細審核其利益構成，競品的保證內部回報率不足 2%，其餘均為非保證紅利；退休現金流最忌承受市場波動風險。」`
                : `「但一拆開條款，對方入面真正保證嘅回報得唔夠 2%，其餘全部係非保證分紅！退休資金唔可以畫餅充飢。」`;
        const s3 = isEnglish
            ? `「我地方案保證 IRR 佔比最高，無論 financial crisis 點演變，每月年金現金流一蚊都唔會少；加埋每年 HK$60,000 扣稅額，最高慳返 HK$10,200 現金稅款，呢個先係最 solid 嘅 retirement foundation！」`
            : isFormal
                ? `「我司方案保證 IRR 佔比全行業名列前茅，退休金發放具備最高確定性；並能精準用滿每年 60,000 港元法定薪俸稅扣稅額，每年最高實質節稅 10,200 港元。」`
                : `「我地方案保證回報比例最高，無論金融風暴點跌，每月年金保證一蚊唔少！每年供足 6 萬即時慳返 HK$10,200 稅款，確定性壓倒一切！」`;
        const profileNotes = this.buildProfileTacticalNotes(req, ourPromo, compPromo);
        return {
            matchup_title: `🥊 【合資格延期年金 QDAP 精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            tone,
            core_pivot_strategy: `主打「保證內部回報率 (Guaranteed IRR) 佔比最高」與「每年 60,000 港元法定薪俸稅扣除省稅最大化」。${profileNotes}`,
            three_stage_framework: {
                stage_1_empathy: s1,
                stage_2_blindspot: s2,
                stage_3_actuarial_checkmate: s3
            },
            attack_points: [
                {
                    title: "保證回報比例壓倒一切 (退休不接受畫餅)",
                    dimension: "保證 IRR vs 非保證分紅",
                    counter_pitch_script: s3,
                    underlying_data_fact: `退休現金流極度依賴保證回報，保證 IRR 佔比越高，抗金融市場波動能力越強。`
                },
                {
                    title: "精確食足 10,200 港元每年慳稅額",
                    dimension: "香港稅務局法定扣稅優勢",
                    counter_pitch_script: s2,
                    underlying_data_fact: `合資格延期年金受保監局嚴格認證，全港納稅人享每年最高 60,000 港元扣稅額，最高稅階實質省稅 10,200 港元。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `必須清楚提醒客戶年金若於早期退保將可能蒙受重大本金損失，且扣稅實際金額視乎個人薪俸稅稅階而定。`,
                acknowledged_competitor_advantage: `客觀陳述：部分同業年金計劃提供更靈活之彈性提取年期選項。`,
                official_disclaimer: "",
                compliance_audit_passed: true
            }
        };
    }
    // =========================================================================
    // 5. 萬用壽險 / 保費融資對攻 (Financing Universal Life) - Feature F6
    // =========================================================================
    generateFinancingUniversalLifeCounterPitch(req, tone) {
        const ourPromo = this.findPromo(req.our_product, "Financing_UniversalLife");
        const compPromo = this.findPromo(req.competitor_product, "Financing_UniversalLife");
        const creditingRate = compPromo?.ul_metrics?.crediting_rate_current_pct ?? ourPromo?.ul_metrics?.crediting_rate_current_pct ?? 5.35;
        const guaranteedRate = compPromo?.ul_metrics?.crediting_rate_guaranteed_pct ?? ourPromo?.ul_metrics?.crediting_rate_guaranteed_pct ?? 2.25;
        const fundingCost = compPromo?.ul_metrics?.typical_funding_cost_pct ?? ourPromo?.ul_metrics?.typical_funding_cost_pct ?? 3.90;
        const carrySpread = compPromo?.ul_metrics?.net_carry_spread_pct ?? ourPromo?.ul_metrics?.net_carry_spread_pct ?? 1.45;
        const ltv = compPromo?.ul_metrics?.max_ltv_pct ?? ourPromo?.ul_metrics?.max_ltv_pct ?? 85.0;
        const surrenderYears = compPromo?.ul_metrics?.surrender_charge_years ?? ourPromo?.ul_metrics?.surrender_charge_years ?? 4;
        const marginBuffer = compPromo?.ul_metrics?.margin_call_drop_buffer_pct ?? ourPromo?.ul_metrics?.margin_call_drop_buffer_pct ?? 20.0;
        const minPremium = compPromo?.ul_metrics?.min_premium_usd ?? ourPromo?.ul_metrics?.min_premium_usd ?? 500000;
        const ourSavingsPromo = this.findPromo(req.our_product, "Savings_MultiCurrency") || this.allPromos.find(p => p.insurer === ourPromo?.insurer && p.category === "Savings_MultiCurrency");
        const ourGN16 = ourSavingsPromo?.savings_metrics?.gn16_fulfillment_ratio_pct ?? 96.5;
        const scripts = this.getUniversalLifeScriptsByTone(req, tone, {
            creditingRate,
            guaranteedRate,
            fundingCost,
            carrySpread,
            ltv,
            surrenderYears,
            marginBuffer,
            minPremium,
            ourGN16
        });
        const profileNotes = this.buildProfileTacticalNotes(req, ourPromo, compPromo);
        return {
            matchup_title: `🥊 【萬用壽險與保費融資對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            tone,
            core_pivot_strategy: `拆解表面 ${creditingRate}% 高息結算與 ${ltv}% LTV 槓桿假象，直擊浮動借貸成本息差倒掛、銀行 Margin Call 補倉致命風險與 ${surrenderYears} 年退保鎖定；引導資金轉向無槓桿多元貨幣分紅儲蓄險，鎖定長線複利確定性與家族傳承全權掌控度。${profileNotes}`,
            three_stage_framework: {
                stage_1_empathy: scripts.stage_1,
                stage_2_blindspot: scripts.stage_2,
                stage_3_actuarial_checkmate: scripts.stage_3
            },
            attack_points: [
                {
                    title: "拆解浮動借貸成本與息差倒掛風險 (Floating Funding Cost Trap)",
                    dimension: "息差套利可持續性與利率週期倒掛",
                    counter_pitch_script: scripts.attack_point_1,
                    underlying_data_fact: `銀行融資借貸成本 (SOFR/HIBOR) 為浮動息率（典型約 ${fundingCost}%），而保單最低保證結算利率僅 ${guaranteedRate}%。在利率波動週期下，利差極易迅速收窄甚至形成負利差倒貼。`
                },
                {
                    title: "痛擊銀行追繳保證金 (Margin Call) 48小時強平致命盲點",
                    dimension: "質押貸款 LTV 監控與強制平倉風險",
                    counter_pitch_script: scripts.attack_point_2,
                    underlying_data_fact: `保費融資質押於銀行，一旦退保價值受利率或派息調整影響跌穿 ${marginBuffer}% 緩衝線，銀行發出 Margin Call 追繳保證金，客戶須於 48-72 小時內追繳數十萬美元現金，否則面臨斬倉沒收。`
                },
                {
                    title: "擊碎長達 3~5 年退保重罰鎖定，轉向無槓桿多元貨幣自主傳承",
                    dimension: "資產處分流動性與家族傳承控制權",
                    counter_pitch_script: scripts.attack_point_3,
                    underlying_data_fact: `萬用壽險設有 ${surrenderYears} 年高額退保費用鎖定期，且須簽署 Deed of Assignment 將保單權益全額質押予銀行；無槓桿多元貨幣分紅險則支援 7-8 種貨幣切換、無限次保單分拆與信託傳承，資產調度零負債。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `香港保監局《持牌中介人操守守則》(GL20) 提醒：向客戶分析保費融資方案時，必須如實披露銀行借貸浮動利率波動、補倉追繳及提早終止之信貸違約風險，嚴禁隱瞞槓桿雙刃劍效應。`,
                acknowledged_competitor_advantage: `客觀陳述：保費融資萬用壽險若在低息環境且客戶流動資金極其充裕、具備完善對沖工具之前提下，首日身故保障槓桿確實較高，適合特定大額超高淨值企業對沖需求。`,
                official_disclaimer: "",
                compliance_audit_passed: true
            }
        };
    }
    getUniversalLifeScriptsByTone(req, tone, m) {
        if (tone === "hk_business_english") {
            return {
                stage_1: `「David，我非常 understand 點解 private bank 嘅 Premium Financing UL proposal 咁 catch your eyes！Headline crediting rate 高達 ${m.creditingRate}%，加上 ${m.ltv}% LTV leverage，表面上的 carry trade return 確實好 attractive。」`,
                stage_2: `「但如果你 run 一個 proper risk stress test，呢個 structure 有三個 critical blindspots：Number 1 係 floating funding cost vs non-guaranteed crediting rate，借貸成本跟 SOFR/HIBOR 浮動，但 guaranteed floor 得 ${m.guaranteedRate}%，rate cut cycle 下 carry spread 好易 invert 成 negative carry；Number 2 係 bank margin call，drop buffer 得 ${m.marginBuffer}%，一旦 market volatility 觸發 margin call，48 hours 內要 inject hundreds of thousands cash 補倉，否則 forced liquidation；Number 3 係 ${m.surrenderYears}-year surrender charge lock-in 加 Deed of Assignment，資產 control 完全被 bank covenants 鎖死。」`,
                stage_3: `「For true long-term wealth preservation and family legacy，你唔需要 expose your capital to leverage debt risk。Pivot 去 unleveraged participating multi-currency savings，HK Insurance Authority GN16 official fulfillment ratio 達 ${m.ourGN16}%，30-year expected IRR 穩達 6.6%+，zero margin call risk，支援 7-8 種 currency swaps 同 unlimited policy split。呢個先係最 resilient 嘅 balance sheet structure！」`,
                attack_point_1: `「對手標榜嘅 carry spread 係建立喺 floating borrowing cost 基礎上，息口一變隨時負利差倒貼；我地方案無任何借貸負擔，yield 實實在在。」`,
                attack_point_2: `「保費融資跌穿 ${m.marginBuffer}% buffer 就要 48 小時內 Margin Call 追錢；無槓桿儲蓄險零負債零催繳，安枕無憂。」`,
                attack_point_3: `「萬用壽險押畀銀行鎖足 ${m.surrenderYears} 年；我地方案支援自由分拆保單同 7-8 種貨幣切換，資產傳承掌控權 100% 喺你手。」`
            };
        }
        else if (tone === "formal_written_zh") {
            return {
                stage_1: `「王先生，私行與高端財富管理市場普遍推廣的保費融資 (Premium Financing) 萬用壽險方案，以高達 ${m.creditingRate}% 的現行結算利率及 ${m.ltv}% 的融資成數（LTV）槓桿套利為宣傳焦點，您的市場敏銳度與資產配置眼光非常獨到。」`,
                stage_2: `「然而，在宏觀利率波動與嚴格的銀行信貸框架下，保費融資架構隱含三重核心風險盲點：其一，浮動借貸成本與息差倒掛風險，銀行融資利率錨定市場浮動基準（SOFR/HIBOR），而保單最低保證結算利率僅有 ${m.guaranteedRate}%，一旦結算利率下調或融資成本上升，利差將迅速收窄甚至形成『負利差』；其二，追繳保證金 (Margin Call) 爆倉風險，保單退保價值跌幅緩衝僅約 ${m.marginBuffer}%，一旦市場波動觸發補倉，客戶須於 48 至 72 小時內追加數十萬美元現金，否則將遭銀行強制處置斷供；其三，長達 ${m.surrenderYears} 年的退保費用鎖定與保單轉讓契約 (Deed of Assignment)，使資產流動性與處分權受到嚴重限制。」`,
                stage_3: `「家族財富長青傳承與核心資產保值，切忌承擔槓桿債務與強平清算之脆弱性。回歸無槓桿多元貨幣分紅儲蓄架構，依託香港保監局 GN16 官方歷年分紅實現率高達 ${m.ourGN16}% 的硬核數據，鎖定 20 至 30 年高達 6.6% 以上的預期複利收益；同時徹底免除保證金追繳壓力，尊享多種主流國際貨幣靈活調度、保單無限次分拆與信託式身故利益傳承，以最高確定性實現跨代財富護航。」`,
                attack_point_1: `「融資利率浮動且保證底線僅 ${m.guaranteedRate}%，極易遭遇息差倒掛；無槓桿分紅儲蓄鎖定長線確定回報，無利率風險敞口。」`,
                attack_point_2: `「警惕銀行 ${m.marginBuffer}% 緩衝線下的 48 小時保證金追繳 (Margin Call)；無槓桿儲蓄資產穩如磐石，絕無強平風險。」`,
                attack_point_3: `「摒棄長達 ${m.surrenderYears} 年退保重罰與銀行質押協議束縛，擁抱多元貨幣無等待期轉換與家族無限次分拆傳承全權自主。」`
            };
        }
        else {
            // 廣東話口語
            return {
                stage_1: `「張生，你真係好有投資眼光！私銀同大行推廣嘅保費融資 (Premium Financing) 萬用壽險，表面睇結算利率有 ${m.creditingRate}%，借足 ${m.ltv}% LTV 槓桿放大息差套利，宣傳單張計出黎嘅槓桿回報確實好吸引！」`,
                stage_2: `「但保費融資背後有三大致命暗湧：第一，融資借貸利率係 Floating 浮動嘅（跟 SOFR/HIBOR），但保單保證息率得 ${m.guaranteedRate}%；一旦息差收窄甚至倒掛，唔單止無息收仲要倒貼利息！第二，銀行每日 Mon 住資產淨值，只要跌穿 ${m.marginBuffer}% 緩衝線就會 Margin Call 追繳保證金，48 小時內要抬幾十萬美金補倉，否則直接斬倉！第三，退保費用鎖足 ${m.surrenderYears} 年，仲要簽 Deed of Assignment 押畀銀行，資金完全失去流動性同支配權。」`,
                stage_3: `「真正做家族傳承同穩健增值，唔需要承擔爆倉同負息差風險！轉去無槓桿多元貨幣分紅儲蓄險，保監局 GN16 官方實現率高達 ${m.ourGN16}%，30 年複利總 IRR 達 6.6% 以上，而且零 Margin Call 負擔、支援 7-8 種主流貨幣隨時自由切換同無限次分拆保單。安心傳承真金白銀，確定性遠勝借錢賭息差！」`,
                attack_point_1: `「融資利率浮動（約 ${m.fundingCost}%），但保證利率得 ${m.guaranteedRate}%，息差倒掛就要倒貼利息；我地方案全期無債務負擔最踏實！」`,
                attack_point_2: `「跌穿 ${m.marginBuffer}% 緩衝位銀行即刻 Margin Call，48 小時唔填水喉就斬倉；無槓桿方案零爆倉風險！」`,
                attack_point_3: `「退保罰足 ${m.surrenderYears} 年仲要全張單押畀銀行；我地支援隨時轉換多國貨幣同無限次分拆，資產傳承自己話事！」`
            };
        }
    }
    /**
     * 根據 client_profile 動態組裝個性化客群戰術適配筆記
     */
    buildProfileTacticalNotes(req, ourPromo, compPromo) {
        const profile = req.client_profile;
        if (!profile)
            return "";
        const notes = [];
        // 1. 預算與階梯折扣計算
        if (profile.budget_usd_annual && profile.budget_usd_annual > 0) {
            const budget = profile.budget_usd_annual;
            if (ourPromo) {
                const ourCalc = this.calculateDiscountForBudget(ourPromo, budget);
                if (ourCalc.total_concession_pct > 0) {
                    notes.push(`💰 預算精算折扣：按年繳預算 US$${budget.toLocaleString()} 計算，我方適用 ${ourCalc.tier_discount_rate_pct}% 階梯折扣` +
                        (ourCalc.extra_bonus_pct > 0 ? `（連同加碼回贈最高達 ${ourCalc.total_concession_pct}%）` : "") +
                        `，首年直接節省保費約 US$${ourCalc.estimated_savings_usd.toLocaleString()}`);
                }
            }
        }
        // 2. 客群畫像戰術
        if (profile.persona) {
            switch (profile.persona) {
                case "Conservative_Income":
                    notes.push(`🛡️ 客群畫像 (Conservative_Income)：追求本金防禦與保證收益確定性，主打確定保證利率、GN16 兌現紀錄，杜絕浮動息差倒掛與補倉催繳`);
                    break;
                case "HighNetWorth_Legacy":
                    notes.push(`👑 客群畫像 (HighNetWorth_Legacy)：聚焦家族跨代傳承架構，主打無槓桿安全底盤、多幣種自由調度、保單無限次分拆、信託式身故提取`);
                    break;
                case "Smart_Shopper":
                    notes.push(`🏷️ 客群畫像 (Smart_Shopper)：對實質折扣敏感，主打首期實質折讓套利與 30 年長線複利實現率差額的現金價值優勢`);
                    break;
            }
        }
        // 3. 理財目標導向
        if (profile.target_goal) {
            switch (profile.target_goal) {
                case "Capital_Appreciation":
                    notes.push(`📈 理財目標 (Capital_Appreciation)：聚焦 20-30 年長期預期 IRR 與分紅實現率複利效應`);
                    break;
                case "Children_Education":
                    notes.push(`🎓 理財目標 (Children_Education)：適配海外留學時間點，凸顯多元貨幣轉換與保單分拆提取靈活性`);
                    break;
                case "Retirement":
                    notes.push(`🏖️ 理財目標 (Retirement)：鎖定退休期穩定被動現金流保證，杜絕市場波動侵蝕`);
                    break;
                case "Critical_Protection":
                    notes.push(`🩺 理財目標 (Critical_Protection)：鎖定癌症再次索償 2 年最短間隔與非指定疾病 ICU 兜底保障`);
                    break;
            }
        }
        // 4. 年齡規劃
        if (profile.age && profile.age > 0) {
            notes.push(`⏳ 年齡規劃 (${profile.age}歲)：${profile.age < 35 ? "年輕積累期，發揮 30 年複利滾存極致優勢" : profile.age < 55 ? "黃金責任期，平衡穩健增值與家庭保障防線" : "臨退傳承期，優先鎖定確定收益與跨代傳承"}`);
        }
        return notes.length > 0 ? "\n\n【客戶畫像戰術適配】\n• " + notes.join("\n• ") : "";
    }
}
exports.CounterPitchEngine = CounterPitchEngine;

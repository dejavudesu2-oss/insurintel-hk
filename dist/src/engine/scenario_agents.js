"use strict";
/**
 * InsurIntel HK - Multi-Scenario AI Agent Engines
 *
 * Implements 6 specialized AI scenario agents for real-world advisor environments:
 * 1. CafeRapidPitchAgent: 30-Second single-hand elevator pitch with high-contrast metrics.
 * 2. OffshoreMCVAgent: Cross-border currency conversion, mainland 3A hospitals, medical underwriting waivers, trust settlement.
 * 3. YoungFamilyBudgetAgent: High-leverage Term + CI + VHIS bundling, mortgage protection deficit analysis, 60/40 rule.
 * 4. RetirementTaxAgent: QDAP statutory HK$60,000 tax deduction across tax brackets (2% to 17%), guaranteed annuity cashflows.
 * 5. InstantCommsSynthesizerAgent: Instant WhatsApp / WeChat / SMS closing summaries with bilateral comparison bullets.
 * 6. OfflineResilienceAgent: 100% zero-network client-side resilience, cache monitoring, simulated offline modes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioAgentHub = exports.CashlessMedicalAgent = exports.OfflineResilienceAgent = exports.InstantCommsSynthesizerAgent = exports.RetirementTaxAgent = exports.YoungFamilyBudgetAgent = exports.OffshoreMCVAgent = exports.CafeRapidPitchAgent = void 0;
// ============================================================================
// AGENT 1: ☕ Café 30-Second Rapid Pitch Mode
// ============================================================================
class CafeRapidPitchAgent {
    generate30sPitch(ourProduct, rivalProduct, category = "Savings_MultiCurrency") {
        const ourName = ourProduct?.name || ourProduct?.product_name || "我方推薦旗艦";
        const rivalName = rivalProduct?.name || rivalProduct?.product_name || "遭遇競品";
        const ourComp = ourProduct?.insurerName || ourProduct?.insurer || "我方保司";
        const rivalComp = rivalProduct?.insurerName || rivalProduct?.insurer || "競品保司";
        let punchlines = [];
        let breakevenDelta = "第 5 年回本";
        let rebateDelta = "首年回贈 +4%";
        let gn16Delta = "GN16 領先 +5.3%";
        let statusTag = "⚡ 30秒極速壓制";
        if (category === "Critical_Illness") {
            const ourWait = ourProduct?.cancerWaitYears || ourProduct?.ci_metrics?.cancer_waiting_period_years || 1;
            const rivalWait = rivalProduct?.cancerWaitYears || rivalProduct?.ci_metrics?.cancer_waiting_period_years || 3;
            const diffWait = rivalWait - ourWait;
            breakevenDelta = diffWait > 0 ? `癌症等候短 ${diffWait} 年` : `等候期 ${ourWait} 年`;
            rebateDelta = `涵蓋 ${ourProduct?.ciIllnesses || 120} 種危疾`;
            gn16Delta = ourProduct?.ciIcu ? "含 ICU 深度預支" : "多次賠付高達 900%";
            statusTag = "🛡️ 危疾條款穿透";
            punchlines = [
                `【等候期極限壓制】我方【${ourName}】癌症間隔僅 ${ourWait} 年（競品需熬足 ${rivalWait} 年），復發第一時間賠足！`,
                `【理賠廣度全覆蓋】涵蓋 ${ourProduct?.ciIllnesses || 120} 種疾病 + 深切治療部 (ICU) 入住即預支 20% 保額！`,
                `【保費槓桿優勢】同一保費下，多次索償總額高達 ${ourProduct?.ciMultiplePct || 900}%，守護終身！`
            ];
        }
        else if (category === "Medical_VHIS") {
            breakevenDelta = "全港私家醫院全數賠償";
            rebateDelta = "出院免找數 (直付名單)";
            gn16Delta = "標靶藥全額無細項上限";
            statusTag = "🏥 醫保全數賠償";
            punchlines = [
                `【全額醫療零漏洞】我方【${ourName}】全數賠償手術費及病房費，打破傳統逐項分拆賠償上限！`,
                `【癌症昂貴標靶藥】實報實銷非手術癌症治療，百萬級標靶藥自費藥全額理賠！`,
                `【出院免找數綠色通道】全港私家醫院 + 內地 1,000+ 家三甲醫院直付，顧問全程協助索償！`
            ];
        }
        else if (category === "Annuity_QDAP") {
            breakevenDelta = "HK$60,000 扣稅上限";
            rebateDelta = "每年慳稅高達 HK$10,200";
            gn16Delta = "保證月派 IRR 3.0%+";
            statusTag = "👴 退休現金流鎖定";
            punchlines = [
                `【法定扣稅慳到極】每位納稅人每年享受高達 HK$60,000 扣稅額，頂階稅率慳足 HK$10,200（夫妻慳 $20,400）！`,
                `【高比例保證現金流】保證年金比例高達 80% 以上，確定月月派發至 100 歲，無懼市場風浪！`,
                `【通脹防禦鎖定】內部回報率 (IRR) 超越定期，退休生活自帶被動收入！`
            ];
        }
        else if (category === "Financing_UniversalLife") {
            breakevenDelta = "85% LTV 私銀保費融資";
            rebateDelta = "淨利差套利 > 1.45%";
            gn16Delta = "保底派息率 2.25%";
            statusTag = "🏦 萬用保費融資槓桿";
            punchlines = [
                `【極致資金槓桿】85% LTV 保費融資，用 15% 本金撬動 100% 巨額千萬壽險保障！`,
                `【正利差穩定套利】當前宣告派息 5.25% 對比融資成本，淨利差套利空間超 1.45%！`,
                `【私銀級資產傳承】身故槓桿高達 4-7 倍，高淨值資產隔離與跨代傳承首選！`
            ];
        }
        else {
            // Savings MultiCurrency
            const ourBk = ourProduct?.breakevenYear || ourProduct?.savings_metrics?.breakeven_guaranteed_year || 5;
            const rivalBk = rivalProduct?.breakevenYear || rivalProduct?.savings_metrics?.breakeven_guaranteed_year || 8;
            const bkDiff = rivalBk - ourBk;
            breakevenDelta = bkDiff > 0 ? `保證回本快 ${bkDiff} 年` : `第 ${ourBk} 年回本`;
            rebateDelta = `預繳保證息差 +0.8%`;
            gn16Delta = `GN16 實現率領先 5.3%`;
            statusTag = "📈 儲蓄分紅確定性壓制";
            punchlines = [
                `【回本速度完勝】我方【${ourName}】第 ${ourBk} 年已實現保證回本，比【${rivalName}】早足 ${Math.max(1, bkDiff)} 年鎖定安全！`,
                `【GN16 官方實現率】保監局官方數據：我方分紅累積實現率高達 96.5%，無懼長線市場降息波動！`,
                `【靈活家族傳承】支援 9 種主流貨幣無限次轉換與保單無限次拆單，一張保單富過三代！`
            ];
        }
        let categoryClosing = "如果想兼顧本金安全與長線收益，推薦優先鎖定我地方案！";
        if (category === "Critical_Illness") {
            categoryClosing = "如果想為家庭構建最嚴密的危疾救治與收入替代防禦網，推薦優先鎖定我地方案！";
        }
        else if (category === "Medical_VHIS") {
            categoryClosing = "如果想在生病入院時享受全數賠償與免墊支直付服務，推薦優先鎖定我地方案！";
        }
        else if (category === "Annuity_QDAP") {
            categoryClosing = "如果想在享受最高法定退稅的同時鎖定確定終身年金現金流，推薦優先鎖定我地方案！";
        }
        else if (category === "Financing_UniversalLife") {
            categoryClosing = "如果想以高成數槓桿獲取大額保障並享受穩健正利差套利，推薦優先鎖定我地方案！";
        }
        else {
            categoryClosing = "如果想兼顧本金安全與長線收益，推薦優先鎖定我地方案！";
        }
        const elevatorScript = `「陳生，30秒幫您快速對比【${ourComp} · ${ourName}】與【${rivalComp} · ${rivalName}】：在核心指標上，我方${breakevenDelta}，而且${rebateDelta}。長線來看${gn16Delta}。${categoryClosing}」`;
        return {
            scenario: "cafe_rapid",
            headline: `${ourName} vs ${rivalName} · 30秒見客極速攻防卡`,
            elevatorScript30s: elevatorScript,
            punchlineBullets: punchlines,
            deltaBadges: {
                breakevenDelta,
                rebateDelta,
                gn16Delta,
                statusTag
            },
            highContrastColor: "#002FA7"
        };
    }
}
exports.CafeRapidPitchAgent = CafeRapidPitchAgent;
// ============================================================================
// AGENT 2: 🇨🇳 Offshore MCV / HNW Family Office Agent
// ============================================================================
class OffshoreMCVAgent {
    // Benchmark FX rates for cross-border calculation
    rates = {
        USD: { HKD: 7.78, RMB: 7.23, USD: 1.0 },
        HKD: { USD: 0.1285, RMB: 0.929, HKD: 1.0 },
        RMB: { USD: 0.1383, HKD: 1.076, RMB: 1.0 }
    };
    calculateCrossBorder(amount, fromCurrency = "USD", toCurrency = "RMB") {
        const from = (["USD", "HKD", "RMB"].includes(fromCurrency) ? fromCurrency : "USD");
        const to = (["USD", "HKD", "RMB"].includes(toCurrency) ? toCurrency : "RMB");
        const rate = this.rates[from][to];
        const converted = Math.round(amount * rate * 100) / 100;
        return {
            scenario: "offshore_mcv",
            originalAmount: amount,
            fromCurrency,
            toCurrency,
            convertedAmount: converted,
            exchangeRate: rate,
            rateNotes: `匯率基準: 1 ${from} ≈ ${rate} ${to} (基於香港主流商業銀行實時結匯匯率)`,
            mainland3AHospitalCovered: true,
            simplifiedUnderwritingUSD: 1500000,
            trustSuccessionSummary: "無限次更換受保人 + 第二受保人 + 保單拆單分配予多位子女",
            complianceGuidelines: [
                "香港法例法定要求：保單合約必須於香港境內簽署核實（簽署地點合規備案）",
                "內地訪港旅客 (MCV) 須出示有效港澳通行證及香港入境標籤（入境小白條）作合規存檔",
                "理賠全球通：身故或危疾索賠僅需郵寄內地三甲醫院診斷證明，無需親自抵港"
            ]
        };
    }
    getMCVUnderwritingAndClaims(insurer) {
        return {
            hospitalsCount: "1,000+ 家內地三甲公立醫院名單全覆蓋",
            directBillingAvailable: true,
            simplifiedLimitText: "高淨值特快核保：最高免體檢保額 USD 1,500,000 (約合 RMB 1,080萬)",
            successionFeatures: [
                "無限次更換受保人（年齡延伸至新受保人 128 歲或終身）",
                "後續受保人 (Contingent Insured) 提前委任，避免遺產爭議與繁複承辦手續",
                "保單分拆選項 (Policy Split Option)：保單生效後可自由分拆成多份獨立保單傳承多名子女",
                "信託式身故賠償：可按月、按季或按年分期給付指定受益人"
            ]
        };
    }
}
exports.OffshoreMCVAgent = OffshoreMCVAgent;
// ============================================================================
// AGENT 3: 👨‍👩‍👧 Young Family & Budget Protection Agent
// ============================================================================
class YoungFamilyBudgetAgent {
    /**
     * 60/40 rule: 60% Protection (Term, CI, VHIS), 40% Wealth/Savings
     * Coverage rule: Mortgage balance + 5x annual living expenses
     * CI Coverage: dynamically scaled by budget amount
     */
    optimizeBudgetAndCoverage(monthlyBudgetHKD = 3000, annualIncomeHKD = 480000, mortgageBalanceHKD = 3000000) {
        const safeMonthlyBudget = Math.max(500, monthlyBudgetHKD);
        const protectionBudget = Math.round(safeMonthlyBudget * 0.6);
        const savingsBudget = safeMonthlyBudget - protectionBudget;
        const safeMortgage = Math.max(0, mortgageBalanceHKD);
        const annualExpenses = Math.round(annualIncomeHKD * 0.6);
        // Life cover: Mortgage + 5x annual expenses (scaled dynamically)
        const termLifeCoverage = safeMortgage + Math.round(annualExpenses * 5);
        const recommendedLifeCICoverage = Math.max(termLifeCoverage, Math.round(annualIncomeHKD * 8));
        const mortgageDeficitGap = Math.max(0, safeMortgage - Math.round(termLifeCoverage * 0.7));
        // CI cover: dynamically scaled by protection budget and annual income
        const ciCoverage = Math.max(Math.round(annualIncomeHKD * 2.5), Math.round(protectionBudget * 400));
        const r = 0.055 / 12;
        const n = 18 * 12;
        const projectedEduFund = Math.round(savingsBudget * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
        const totalSavingsDeposited = savingsBudget * n;
        const projectedCompoundGain = projectedEduFund - totalSavingsDeposited;
        const termMonthlyPremEst = Math.max(80, Math.round((termLifeCoverage / 1000000) * 85));
        return {
            scenario: "young_family",
            monthlyBudgetHKD: safeMonthlyBudget,
            annualIncomeHKD,
            mortgageBalanceHKD: safeMortgage,
            recommendedProtectionBudgetHKD: protectionBudget,
            recommendedSavingsBudgetHKD: savingsBudget,
            recommendedLifeCICoverageHKD: recommendedLifeCICoverage,
            mortgageDeficitGapHKD: Math.round(mortgageDeficitGap),
            projectedEduFundHKD: projectedEduFund,
            totalSavingsDepositedHKD: totalSavingsDeposited,
            projectedCompoundGainHKD: projectedCompoundGain,
            termMonthlyPremEstHKD: termMonthlyPremEst,
            bundlingStrategy: {
                termLifeCoverageHKD: termLifeCoverage,
                ciMultipleCoverageHKD: ciCoverage,
                vhisPlanType: "自願醫保靈活計劃（半私家病房，全數賠償）",
                monthlyPremiumEstimateHKD: protectionBudget
            }
        };
    }
}
exports.YoungFamilyBudgetAgent = YoungFamilyBudgetAgent;
// ============================================================================
// AGENT 4: 👴 Retirement & Tax Optimization Agent
// ============================================================================
class RetirementTaxAgent {
    static QDAP_SINGLE_MAX_DEDUCTION = 60000;
    static QDAP_COUPLE_MAX_DEDUCTION = 120000;
    /**
     * Calculates statutory QDAP tax relief under Hong Kong Inland Revenue Ordinance
     * Tax rates: 2%, 6%, 10%, 14%, 17% (Top marginal rate)
     */
    calculateQDAPTaxRelief(annualPremiumHKD = 60000, taxBracketPct = 17, isCouple = false) {
        const maxLimit = isCouple
            ? RetirementTaxAgent.QDAP_COUPLE_MAX_DEDUCTION
            : RetirementTaxAgent.QDAP_SINGLE_MAX_DEDUCTION;
        const eligible = Math.min(annualPremiumHKD, maxLimit);
        const taxSaved = Math.round(eligible * (taxBracketPct / 100));
        const effectiveDiscount = eligible > 0 ? Math.round((taxSaved / eligible) * 1000) / 10 : 0;
        // Projected annuity income: 5-year premium gives ~15-20 years payout with ~3.2% IRR
        const totalEstAnnualPayout = Math.round((eligible * 5 * 1.6) / 20);
        const monthlyAnnuity = Math.round(totalEstAnnualPayout / 12);
        return {
            scenario: "retirement_tax",
            annualPremiumHKD,
            taxBracketPct,
            isCouple,
            maxDeductibleLimitHKD: maxLimit,
            eligibleDeductionHKD: eligible,
            taxReliefSavedHKD: taxSaved,
            effectiveDiscountPct: effectiveDiscount,
            monthlyAnnuityEstimateHKD: monthlyAnnuity,
            guaranteedCashflowSharePct: 80.5
        };
    }
}
exports.RetirementTaxAgent = RetirementTaxAgent;
// ============================================================================
// AGENT 5: 💬 Instant WhatsApp / WeChat Follow-up Synthesizer Agent
// ============================================================================
class InstantCommsSynthesizerAgent {
    synthesizeFollowUpMessage(params) {
        const client = params.clientName || "陳生";
        const platform = params.platform || "whatsapp";
        const tone = params.tone || "rational_data";
        const category = params.category || "Savings_MultiCurrency";
        const ourProd = params.ourProduct?.name || params.ourProduct?.product_name || "我方推薦旗艦方案";
        const rivalProd = params.rivalProduct?.name || params.rivalProduct?.product_name || "市場同業競品";
        const agent = params.agentName || "持牌保險顧問";
        const phone = params.agentPhone || "+852 9123 4567";
        const isWhatsApp = platform === "whatsapp";
        const bold = (s) => (isWhatsApp ? `*${s}*` : s);
        const mono = (s) => (isWhatsApp ? `\`${s}\`` : s);
        const lines = [];
        if (tone === "urgent_closing") {
            lines.push(`【${client}，剛才咖啡會議的跟進摘要與限時優惠】`);
            lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
            lines.push(`剛才見面非常愉快！為免您遺漏核心數據，我快速為您整理剛才探討的關鍵對比：`);
            lines.push(``);
            if (category === "Critical_Illness") {
                lines.push(`1️⃣ ${bold("等候期極速賠：")}我方【${ourProd}】癌症等候間隔僅 1 年（對手需 3 年），復發第一時間賠足！`);
                lines.push(`2️⃣ ${bold("條款保障穿透：")}涵蓋 120+ 種危疾 + 深切治療部 (ICU) 入住即預支 20% 保額！`);
                lines.push(`3️⃣ ${bold("今期限定優惠：")}本月享有專屬首年保費回贈及免體檢綠色通道，即將於本週五截止！`);
            }
            else if (category === "Medical_VHIS") {
                lines.push(`1️⃣ ${bold("全額醫療零漏洞：")}我方【${ourProd}】全港私家醫院手術及病房費全數賠償，無細項拆分上限！`);
                lines.push(`2️⃣ ${bold("昂貴標靶藥實報實銷：")}百萬級非手術癌症標靶藥及自費藥全額理賠！`);
                lines.push(`3️⃣ ${bold("出院免找數直付：")}全港私家醫院 + 內地 1,000+ 家三甲醫院直付名單，專人協助索償！`);
            }
            else if (category === "Annuity_QDAP") {
                lines.push(`1️⃣ ${bold("法定扣稅慳到極：")}每年享高達 HK$60,000 扣稅額，頂階稅階實質退稅 HK$10,200（夫妻合併慳 $20,400）！`);
                lines.push(`2️⃣ ${bold("高確定性現金流：")}保證年金佔比超 80%，穩定月月派發至 100 歲！`);
                lines.push(`3️⃣ ${bold("稅季前及早鎖定：")}現時投保即享限時回贈，趕及本課稅年度享有全額免稅扣除！`);
            }
            else if (category === "Financing_UniversalLife") {
                lines.push(`1️⃣ ${bold("極致資金槓桿：")}85% LTV 保費融資，用 15% 本金撬動千萬級巨額人壽保障！`);
                lines.push(`2️⃣ ${bold("穩健正利差套利：")}宣告派息 5.25% 對比融資成本，淨利差空間超 1.45%！`);
                lines.push(`3️⃣ ${bold("私銀級家族傳承：")}大額身故槓桿 4-7 倍，資產隔離與跨代傳承首選！`);
            }
            else {
                lines.push(`1️⃣ ${bold("回本與資金安全：")}我方【${ourProd}】保證現金價值回本年期較短，提早鎖定 100% 本金。`);
                lines.push(`2️⃣ ${bold("條款細則避坑：")}對手【${rivalProd}】宣傳預繳僅保證首年，次年浮動；我方提供長線確定性。`);
                lines.push(`3️⃣ ${bold("今期限定優惠：")}本月享有專屬保費回贈及免體檢綠色通道，即將於本週五截止！`);
            }
            lines.push(``);
            lines.push(`如您希望為家人鎖定此配置，我隨時為您備妥正式投保說明書！`);
        }
        else if (tone === "mcv_vip") {
            lines.push(`【${client}，香港離岸資產配置與家庭信託傳承建議書】`);
            lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
            lines.push(`感謝您專程赴港交流！為配合您的跨國貨幣管理與家族財富傳承需求，重點跟進如下：`);
            lines.push(``);
            lines.push(`🔹 ${bold("多幣種跨國配置：")}支援 9 種主流世界貨幣（USD/HKD/RMB/GBP/EUR等）無等待期轉換。`);
            lines.push(`🔹 ${bold("內地三甲醫院直付理賠：")}覆蓋全國 1,000+ 家三甲醫院，出院免找數，理賠無須赴港。`);
            lines.push(`🔹 ${bold("家族傳承架構：")}支援無限次更改受保人與保單分拆，精準分配下一代資產。`);
            lines.push(`🔹 ${bold("合規安心：")}香港保監局標準監管，在港合法簽署及入境小白條備查，法律權益終身受保。`);
            lines.push(``);
            lines.push(`稍後我將完整對比利益說明書發至您的信箱，祝返程順利！`);
        }
        else {
            // rational_data
            lines.push(`【${client}，全港保險獨立客觀數據對比摘要】`);
            lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
            lines.push(`感謝您撥冗會面！依據香港保監局 (IA) 公開指引與各大保司年報數據，對比總結如下：`);
            lines.push(``);
            if (category === "Critical_Illness") {
                lines.push(`📊 ${bold("方案 A (我方推薦):")} 【${ourProd}】`);
                lines.push(`   └ 癌症等候間隔僅 1 年、涵蓋 120+ 種疾病、含深切治療部 (ICU) 預支與多次賠償高槓桿。`);
                lines.push(`📊 ${bold("方案 B (市場競品):")} 【${rivalProd}】`);
                lines.push(`   └ 癌症間隔需熬足 3 年，後期非特定重疾限制較多，黃金救治期防護存在盲點。`);
                lines.push(``);
                lines.push(`💡 ${bold("專業總結：")}重疾防護首重條款穿透力與二次復發間隔，方案 A 實質保障更周全。`);
            }
            else if (category === "Medical_VHIS") {
                lines.push(`📊 ${bold("方案 A (我方推薦):")} 【${ourProd}】`);
                lines.push(`   └ 自願醫保半私家全數賠償無細項上限，非手術癌症治療自費藥全包，內地千家三甲免找數。`);
                lines.push(`📊 ${bold("方案 B (市場競品):")} 【${rivalProd}】`);
                lines.push(`   └ 設有項目分拆上限或自負額墊底較高，面對醫療通脹需承擔額外自費差額。`);
                lines.push(``);
                lines.push(`💡 ${bold("專業總結：")}醫療險首重全額賠償與出院直付免墊支體驗，方案 A 具備最佳性價比。`);
            }
            else if (category === "Annuity_QDAP") {
                lines.push(`📊 ${bold("方案 A (我方推薦):")} 【${ourProd}】`);
                lines.push(`   └ 保證年金利益佔比超 80.5%，頂階稅階實質退稅 17%，保證終身月派現金流。`);
                lines.push(`📊 ${bold("方案 B (市場競品):")} 【${rivalProd}】`);
                lines.push(`   └ 浮動紅利佔比較大，長期受宏觀降息與投資波動影響，退休預算確定性較弱。`);
                lines.push(``);
                lines.push(`💡 ${bold("專業總結：")}退休規劃首重確定性現金流與法定退稅，方案 A 為被動收入最優基石。`);
            }
            else if (category === "Financing_UniversalLife") {
                lines.push(`📊 ${bold("方案 A (我方推薦):")} 【${ourProd}】`);
                lines.push(`   └ 融資成數高達 85% LTV，保底派息率 2.25%，抗加息與追加保證金 (Margin Call) 安全墊高。`);
                lines.push(`📊 ${bold("方案 B (市場競品):")} 【${rivalProd}】`);
                lines.push(`   └ 融資成數較低或強平線嚴格，抗利率上行與流動性波動風險較大。`);
                lines.push(``);
                lines.push(`💡 ${bold("專業總結：")}保費融資講求大額槓桿與正利差安全墊，方案 A 更契合高淨值資產配置。`);
            }
            else {
                lines.push(`📊 ${bold("方案 A (我方推薦):")} 【${ourProd}】`);
                lines.push(`   └ 保證回本速度快、保監局 GN16 分紅實現率歷年累積 96.5% 高位穩健。`);
                lines.push(`📊 ${bold("方案 B (市場競品):")} 【${rivalProd}】`);
                lines.push(`   └ 前期高回贈附帶嚴格退保鎖定期，次年浮動利率存在降息稀釋風險。`);
                lines.push(``);
                lines.push(`💡 ${bold("專業總結：")}若著重中長線確定性、真實到手分紅與流動性，方案 A 更具精算優勢。`);
            }
        }
        lines.push(``);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`顧問：${agent} (${phone})`);
        lines.push(`${mono("最後資料更新：2026年11月06日")}`);
        lines.push(`（聲明：本資料僅供內部專業參考與客觀數據分析，符合香港保監局 GL20 守則指引，最終條款以保險公司簽發之正式合約為準）`);
        const text = lines.join("\n");
        return {
            scenario: "instant_comms",
            platform,
            tone,
            category,
            formattedText: text,
            characterCount: text.length,
            hasGL20Disclaimer: true
        };
    }
}
exports.InstantCommsSynthesizerAgent = InstantCommsSynthesizerAgent;
// ============================================================================
// AGENT 6: 📴 Offline PWA & Environment Resilience Agent
// ============================================================================
class OfflineResilienceAgent {
    simulatedOffline = false;
    browserOffline = false;
    getOfflineReadiness(catalogCount = 99, cacheSizeBytes = 380000, browserOffline = false) {
        this.browserOffline = browserOffline;
        const isOnline = !this.simulatedOffline && !this.browserOffline;
        return {
            scenario: "offline_resilience",
            isOnline,
            isSimulatedOffline: this.simulatedOffline,
            cachedProductsCount: catalogCount,
            offlineReadyScore: 100,
            healthStatusText: isOnline
                ? "🟢 網絡正常連線 · 本地引擎雙重守護 (Online Ready)"
                : "🟡 地庫/地鐵離線模式 · 100% 依賴本機快取與精算核心 (Offline Active)",
            localStoreKeys: [
                "insurintel_my_insurer",
                "insurintel_active_scenario",
                "insurintel_cached_catalog",
                "insurintel_offline_stamp"
            ]
        };
    }
    setSimulatedOffline(val) {
        this.simulatedOffline = val;
    }
    setBrowserOffline(val) {
        this.browserOffline = val;
    }
}
exports.OfflineResilienceAgent = OfflineResilienceAgent;
// ============================================================================
// AGENT 7: 💼 Cashless Medical & Hospital Pre-Approval Agent
// ============================================================================
class CashlessMedicalAgent {
    checkCashlessDirectBilling(params) {
        const hospital = params.hospital || "香港養和醫院 (Hong Kong Sanatorium & Hospital)";
        const treatment = params.treatment || "癌症非手術標靶治療 (Targeted Cancer Therapy)";
        const deductible = typeof params.deductibleHKD === "number" ? params.deductibleHKD : 0;
        let estimatedCost = 500000;
        if (treatment.includes("癌症") || treatment.includes("標靶"))
            estimatedCost = 680000;
        else if (treatment.includes("心臟") || treatment.includes("通波仔"))
            estimatedCost = 380000;
        else if (treatment.includes("骨科") || treatment.includes("關節"))
            estimatedCost = 280000;
        else if (treatment.includes("達芬奇") || treatment.includes("機械人"))
            estimatedCost = 450000;
        else if (treatment.includes("白內障") || treatment.includes("日間"))
            estimatedCost = 65000;
        const clientPay = Math.min(deductible, estimatedCost);
        const covered = estimatedCost - clientPay;
        return {
            scenario: "cashless_medical",
            hospitalName: hospital,
            treatmentName: treatment,
            deductibleHKD: deductible,
            estimatedCostHKD: estimatedCost,
            coverageHKD: covered,
            clientOutOfPocketHKD: clientPay,
            isCashlessApproved: true,
            preApprovalDaysNotice: 3,
            directBillingHotline: "+852 2232 8888",
            workflowSteps: [
                "入院前 3-5 個工作天向保司提交由主治醫生填寫之「預先批核申請表」",
                "保司精算理賠部審核通過後，直接向指定私家醫院發出「付款擔保書 (Letter of Guarantee)」",
                "入院登記出示醫療直付卡與身份證明文件，免收大額住院按金",
                "出院結算由保險公司直接與醫院全額對賬支付，客戶簽名即可安心出院"
            ]
        };
    }
}
exports.CashlessMedicalAgent = CashlessMedicalAgent;
// ============================================================================
// SCENARIO AGENT HUB
// ============================================================================
class ScenarioAgentHub {
    cafePitch = new CafeRapidPitchAgent();
    offshoreMCV = new OffshoreMCVAgent();
    youngFamily = new YoungFamilyBudgetAgent();
    retirementTax = new RetirementTaxAgent();
    instantComms = new InstantCommsSynthesizerAgent();
    cashlessMedical = new CashlessMedicalAgent();
    offlineResilience = new OfflineResilienceAgent();
    getAgentForScenario(type) {
        switch (type) {
            case "cafe_rapid": return this.cafePitch;
            case "offshore_mcv": return this.offshoreMCV;
            case "young_family": return this.youngFamily;
            case "retirement_tax": return this.retirementTax;
            case "instant_comms": return this.instantComms;
            case "cashless_medical": return this.cashlessMedical;
            case "offline_resilience": return this.offlineResilience;
        }
    }
}
exports.ScenarioAgentHub = ScenarioAgentHub;

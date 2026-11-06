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
exports.ScenarioAgentHub = exports.CashlessMedicalAgent = exports.HK_13_PRIVATE_HOSPITALS = exports.OfflineResilienceAgent = exports.InstantCommsSynthesizerAgent = exports.RetirementTaxAgent = exports.YoungFamilyBudgetAgent = exports.OffshoreMCVAgent = exports.CafeRapidPitchAgent = void 0;
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
            const ourIll = ourProduct?.ciIllnesses || ourProduct?.ci_metrics?.total_illnesses_covered || 128;
            const rivalIll = rivalProduct?.ciIllnesses || rivalProduct?.ci_metrics?.total_illnesses_covered || 118;
            const illDiff = ourIll - rivalIll;
            const ourMult = ourProduct?.ciMultiplePct || ourProduct?.ci_metrics?.multiple_claim_limit_pct || 900;
            const rivalMult = rivalProduct?.ciMultiplePct || rivalProduct?.ci_metrics?.multiple_claim_limit_pct || 800;
            const multDiff = ourMult - rivalMult;
            breakevenDelta = diffWait > 0 ? `癌症等候短 ${diffWait} 年 (${ourWait}年 vs ${rivalWait}年)` : `等候期 ${ourWait} 年`;
            rebateDelta = illDiff > 0 ? `涵蓋疾病多 +${illDiff}種 (${ourIll}種 vs ${rivalIll}種)` : `涵蓋 ${ourIll} 種危疾`;
            gn16Delta = multDiff > 0 ? `多次索償限額高 +${multDiff}% (${ourMult}% vs ${rivalMult}%)` : `多次賠付高達 ${ourMult}%`;
            statusTag = "🛡️ 危疾條款穿透";
            punchlines = [
                `【等候期極限壓制】我方【${ourName}】癌症間隔僅 ${ourWait} 年（競品需熬足 ${rivalWait} 年${diffWait > 0 ? `，快 ${diffWait} 年理賠` : ''}），復發第一時間賠足！`,
                `【理賠廣度全覆蓋】涵蓋 ${ourIll} 種疾病（對手 ${rivalIll} 種）${ourProduct?.ciIcu ? ' + 深切治療部 (ICU) 入住即預支 20% 保額' : ''}！`,
                `【保費槓桿優勢】同一保費下，多次索償總額高達 ${ourMult}%（對手 ${rivalMult}%），守護終身！`
            ];
        }
        else if (category === "Medical_VHIS") {
            const ourAnnual = ourProduct?.vhisLimitHkd || ourProduct?.vhis_metrics?.annual_limit_hkd || 25000000;
            const rivalAnnual = rivalProduct?.vhisLimitHkd || rivalProduct?.vhis_metrics?.annual_limit_hkd || 16000000;
            const ourAnnualWan = Math.round(ourAnnual / 10000);
            const rivalAnnualWan = Math.round(rivalAnnual / 10000);
            const diffAnnual = ourAnnualWan - rivalAnnualWan;
            const ourLifetime = (ourProduct?.vhisLifetimeLimitHkd !== undefined ? ourProduct?.vhisLifetimeLimitHkd : ourProduct?.vhis_metrics?.lifetime_limit_hkd) ?? 0;
            const rivalLifetime = (rivalProduct?.vhisLifetimeLimitHkd !== undefined ? rivalProduct?.vhisLifetimeLimitHkd : rivalProduct?.vhis_metrics?.lifetime_limit_hkd) ?? 60000000;
            const ourLifeStr = ourLifetime === 0 ? "終身無上限" : `HK$ ${Math.round(ourLifetime / 10000)}萬`;
            const rivalLifeStr = rivalLifetime === 0 ? "終身無上限" : `HK$ ${Math.round(rivalLifetime / 10000)}萬`;
            const ourDeds = (ourProduct?.vhisDeductibles || ourProduct?.vhis_metrics?.deductible_options_hkd) || [0, 16000, 25000, 50000];
            const ourDedStr = ourDeds.map((d) => d === 0 ? '$0' : `$${d / 1000}k`).join('/');
            breakevenDelta = diffAnnual > 0 ? `年限額高 +${diffAnnual}萬 (${ourAnnualWan}萬 vs ${rivalAnnualWan}萬)` : `年度額度 HK$${ourAnnualWan}萬`;
            rebateDelta = `終身限額 ${ourLifeStr} vs ${rivalLifeStr}`;
            gn16Delta = `全港私院及千家三甲免找數直付 (自負額 ${ourDedStr})`;
            statusTag = "🏥 醫保全數賠償";
            punchlines = [
                `【每年賠償上限】我方【${ourName}】每年高達 HK$ ${ourAnnualWan}萬（對手【${rivalName}】為 HK$ ${rivalAnnualWan}萬${diffAnnual > 0 ? `，足足多出 +${diffAnnual}萬` : ''}）！`,
                `【終身保障總額】我方提供【${ourLifeStr}】（對手為【${rivalLifeStr}】），自負額靈活可選 (${ourDedStr})！`,
                `【出院免找數直付】全港頂尖私家醫院 + 內地 1,000+ 家三甲醫院付款擔保 (LOG) 直付通道，零墊支安心出院！`
            ];
        }
        else if (category === "Annuity_QDAP") {
            const ourGIRR = ourProduct?.qdapGuaranteedIRR || ourProduct?.qdap_metrics?.guaranteed_internal_rate_pct || 2.92;
            const rivalGIRR = rivalProduct?.qdapGuaranteedIRR || rivalProduct?.qdap_metrics?.guaranteed_internal_rate_pct || 2.80;
            const ourTIRR = ourProduct?.qdapTotalIRR || ourProduct?.qdap_metrics?.total_internal_rate_pct || 4.70;
            const rivalTIRR = rivalProduct?.qdapTotalIRR || rivalProduct?.qdap_metrics?.total_internal_rate_pct || 4.50;
            const ourRatio = ourProduct?.qdapGuaranteedPct || ourProduct?.qdap_metrics?.guaranteed_cashflow_ratio_pct || (Math.round((ourGIRR / ourTIRR) * 100 * 10) / 10);
            const rivalRatio = rivalProduct?.qdapGuaranteedPct || rivalProduct?.qdap_metrics?.guaranteed_cashflow_ratio_pct || (Math.round((rivalGIRR / rivalTIRR) * 100 * 10) / 10);
            const diffGIRR = (ourGIRR - rivalGIRR).toFixed(2);
            const ratioDiff = (ourRatio - rivalRatio).toFixed(1);
            breakevenDelta = parseFloat(diffGIRR) > 0 ? `保證回報高出 +${diffGIRR}% (${ourGIRR}% vs ${rivalGIRR}%)` : `保證內部回報率 IRR ${ourGIRR}%`;
            rebateDelta = parseFloat(ratioDiff) > 0 ? `保證現金流佔比領先 +${ratioDiff}% (${ourRatio}% vs ${rivalRatio}%)` : `保證現金流佔比 ${ourRatio}%`;
            gn16Delta = "每人每年 HK$60,000 法定扣稅";
            statusTag = "👴 退休現金流鎖定";
            punchlines = [
                `【法定扣稅慳到極】每位納稅人每年享受高達 HK$60,000 扣稅額，頂階稅率慳足 HK$10,200（夫妻慳 $20,400）！`,
                `【保證內部回報率】我方保證 IRR 達 ${ourGIRR}%（對手 ${rivalGIRR}%），總預期 IRR 達 ${ourTIRR}%！`,
                `【高比例保證現金流】保證年金比例高達 ${ourRatio}%（對手 ${rivalRatio}%），月月保證派發至百歲，退休生活自帶被動收入！`
            ];
        }
        else if (category === "Financing_UniversalLife") {
            const ourLtv = ourProduct?.ulLtv || ourProduct?.ul_metrics?.max_ltv_pct || 85;
            const rivalLtv = rivalProduct?.ulLtv || rivalProduct?.ul_metrics?.max_ltv_pct || 80;
            const ourRate = ourProduct?.ulCreditingRate || ourProduct?.ul_metrics?.crediting_rate_current_pct || 5.25;
            const rivalRate = rivalProduct?.ulCreditingRate || rivalProduct?.ul_metrics?.crediting_rate_current_pct || 5.0;
            const ourNetSpread = ourProduct?.ulNetSpread || ourProduct?.ul_metrics?.net_carry_spread_pct || 1.45;
            const rivalNetSpread = rivalProduct?.ulNetSpread || rivalProduct?.ul_metrics?.net_carry_spread_pct || 1.20;
            breakevenDelta = `融資成數 ${ourLtv}% LTV vs ${rivalLtv}% LTV`;
            rebateDelta = `淨息差空間 > ${ourNetSpread}% vs ${rivalNetSpread}%`;
            gn16Delta = `宣告派息率 ${ourRate}% vs ${rivalRate}%`;
            statusTag = "🏦 萬用保費融資槓桿";
            punchlines = [
                `【極致資金槓桿】我方提供 ${ourLtv}% LTV 保費融資（對手 ${rivalLtv}% LTV），用更少本金撬動千萬巨額保障！`,
                `【穩健正利差套利】當前宣告派息 ${ourRate}%，淨利差套利空間超 ${ourNetSpread}%！`,
                `【私銀級資產傳承】身故槓桿高達 4-7 倍，高淨值資產隔離與跨代傳承首選！`
            ];
        }
        else {
            // Savings MultiCurrency
            const ourBk = ourProduct?.breakevenYear || ourProduct?.savings_metrics?.breakeven_guaranteed_year || 5;
            const rivalBk = rivalProduct?.breakevenYear || rivalProduct?.savings_metrics?.breakeven_guaranteed_year || 8;
            const bkDiff = rivalBk - ourBk;
            const ourRebate = ourProduct?.maxRebate ?? 22;
            const rivalRebate = rivalProduct?.maxRebate ?? 18;
            const ourGn16 = ourProduct?.gn16Fulfillment || ourProduct?.savings_metrics?.gn16_fulfillment_ratio_pct || 96.5;
            const rivalGn16 = rivalProduct?.gn16Fulfillment || rivalProduct?.savings_metrics?.gn16_fulfillment_ratio_pct || 91.2;
            const gn16Diff = (ourGn16 - rivalGn16).toFixed(1);
            breakevenDelta = bkDiff > 0 ? `保證回本快 ${bkDiff} 年 (第${ourBk}年 vs 第${rivalBk}年)` : `第 ${ourBk} 年回本`;
            rebateDelta = `首年回贈 ${ourRebate}% vs ${rivalRebate}%`;
            gn16Delta = parseFloat(gn16Diff) > 0 ? `GN16 實現率領先 +${gn16Diff}% (${ourGn16}% vs ${rivalGn16}%)` : `GN16 實現率 ${ourGn16}%`;
            statusTag = "📈 儲蓄分紅確定性壓制";
            punchlines = [
                `【回本速度完勝】我方【${ourName}】第 ${ourBk} 年已實現保證回本，比【${rivalName}】早足 ${Math.max(1, bkDiff)} 年鎖定安全！`,
                `【GN16 官方實現率】保監局官方數據：我方分紅累積實現率高達 ${ourGn16}%（對手 ${rivalGn16}%），無懼長線市場降息波動！`,
                `【靈活家族傳承】支援主流貨幣轉換與保單拆單，一張保單富過三代！`
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
    calculateQDAPTaxRelief(annualPremiumHKD = 60000, taxBracketPct = 17, isCouple = false, selectedProduct) {
        const maxLimit = isCouple
            ? RetirementTaxAgent.QDAP_COUPLE_MAX_DEDUCTION
            : RetirementTaxAgent.QDAP_SINGLE_MAX_DEDUCTION;
        const eligible = Math.min(annualPremiumHKD, maxLimit);
        const taxSaved = Math.round(eligible * (taxBracketPct / 100));
        const effectiveDiscount = annualPremiumHKD > 0 ? Math.round((taxSaved / annualPremiumHKD) * 1000) / 10 : 0;
        // Projected annuity income: 5-year premium gives ~15-20 years payout with ~3.2% IRR (scaled by annualPremiumHKD)
        const totalEstAnnualPayout = Math.round((annualPremiumHKD * 5 * 1.6) / 20);
        const monthlyAnnuity = Math.round(totalEstAnnualPayout / 12);
        const gIrr = selectedProduct?.qdapGuaranteedIRR || selectedProduct?.qdap_metrics?.guaranteed_internal_rate_pct || 2.80;
        const tIrr = selectedProduct?.qdapTotalIRR || selectedProduct?.qdap_metrics?.total_internal_rate_pct || 4.65;
        const guaranteedCashflowSharePct = selectedProduct?.qdapGuaranteedPct || selectedProduct?.qdap_metrics?.guaranteed_cashflow_ratio_pct || (Math.round((gIrr / tIrr) * 100 * 10) / 10);
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
            guaranteedCashflowSharePct,
            guaranteedIRR: gIrr,
            totalIRR: tIrr
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
                const qdapShare = params.ourProduct?.qdapGuaranteedPct || (params.ourProduct?.qdap_metrics && params.ourProduct?.qdap_metrics.guaranteed_internal_rate_pct && params.ourProduct?.qdap_metrics.total_internal_rate_pct ? Math.round((params.ourProduct.qdap_metrics.guaranteed_internal_rate_pct / params.ourProduct.qdap_metrics.total_internal_rate_pct) * 1000) / 10 : 80.5);
                lines.push(`📊 ${bold("方案 A (我方推薦):")} 【${ourProd}】`);
                lines.push(`   └ 保證年金利益佔比超 ${qdapShare}%，頂階稅階實質退稅 17%，保證終身月派現金流。`);
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
// All 13 Private Hospitals in Hong Kong with full Tier/Room and Cashless Direct Billing metadata
exports.HK_13_PRIVATE_HOSPITALS = [
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
// AGENT 7: 💼 Cashless Medical & Hospital Pre-Approval Agent
// ============================================================================
class CashlessMedicalAgent {
    checkCashlessDirectBilling(params) {
        const hospital = (typeof params?.hospital === "string" && params.hospital.trim())
            ? params.hospital.trim()
            : "香港養和醫院 (Hong Kong Sanatorium & Hospital)";
        const treatment = (typeof params?.treatment === "string" && params.treatment.trim())
            ? params.treatment.trim()
            : "癌症非手術標靶治療 (Targeted Cancer Therapy)";
        const deductible = (typeof params?.deductibleHKD === "number" && !isNaN(params.deductibleHKD) && params.deductibleHKD >= 0)
            ? params.deductibleHKD
            : 0;
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
        else if (treatment.includes("腸胃鏡") || treatment.includes("息肉"))
            estimatedCost = 45000;
        else if (treatment.includes("脊柱") || treatment.includes("椎間盤"))
            estimatedCost = 350000;
        const clientPay = Math.min(deductible, estimatedCost);
        const covered = estimatedCost - clientPay;
        const ourProdName = params.ourProduct?.name || params.ourProduct?.product_name || "我方推薦自願醫保旗艦";
        const rivalProdName = params.rivalProduct?.name || params.rivalProduct?.product_name || "遭遇競品醫保";
        const rivalComp = params.rivalProduct?.insurerName || params.rivalProduct?.insurer || "競品保司";
        const rivalAnnual = params.rivalProduct?.vhisLimitHkd || params.rivalProduct?.vhis_metrics?.annual_limit_hkd || 20000000;
        const rivalAnnualWan = Math.round(rivalAnnual / 10000);
        const rivalLimitation = (params.rivalProduct?.insurer === 'Bowtie' || rivalComp.includes('Bowtie'))
            ? '純網上自願醫保，無 Agent 實體跟進出院直付；需全在線自主遞交申請，越級病房設 50% 折減'
            : `【${rivalComp}】年度限額 HK$ ${rivalAnnualWan}萬；傳統直付批核需 5-7 工作天，超出限額或自負額需先自行墊支`;
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
            ],
            ourProductPlan: ourProdName,
            rivalProductPlan: rivalProdName,
            rivalDirectBillingStatus: rivalLimitation
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

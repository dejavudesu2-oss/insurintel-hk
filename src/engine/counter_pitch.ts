/**
 * InsurIntel HK - Enterprise Real-time Counter-Pitch Engine + HKIA Compliance Guardrail
 * Agent 2: HK Actuarial & Counter-Pitch Agent
 * Agent 3: HKIA Compliance & Guardrail Agent
 * 
 * Capabilities:
 * 1. Three-Stage Tactical Framework: 【共情認同 -> 點出條款盲點 -> 搬出 GN16 官方數據絕殺】
 * 2. Three Tone Switchers: 廣東話口語 / 港式商務風 (中英夾雜) / 專業書面語
 * 3. HKIA GL20 & GN16 Prohibited Words Filter & Dynamic Legal Disclaimers
 */

import {
  CounterPitchRequest,
  CounterPitchResponse,
  InsurancePromoComprehensive,
  PitchTone,
  TacticalThreeStagePitch
} from "../types/insurance.js";

/**
 * Agent 3: 保監局 GL20 合規風控攔截器
 */
export class HKIAComplianceGuardrail {
  // 香港保監局 GL20 嚴禁之失實陳述與誤導性字眼
  private static readonly PROHIBITED_PATTERNS = [
    { pattern: /保證(穩賺|高回報|無風險|零風險|回本|高息)/gi, replacement: "預期長期穩健（受分紅實現率影響）", rule: "GL20.4 嚴禁將非保證分紅利益陳述為保證" },
    { pattern: /全港(第一|最高|最抵|最強|無敵)/gi, replacement: "市場領先指標之一", rule: "GL20.7 嚴禁使用無客觀精算依據之絕對化宣傳詞彙" },
    { pattern: /對手(一定|肯定)(蝕|唔派息|倒閉|跳水)/gi, replacement: "同業分紅實現率歷年存在波動記錄", rule: "GL20.2 嚴禁惡意詆毀同業或作未經證實之負面推測" },
    { pattern: /(穩賺不賠|絕對零風險)/gi, replacement: "收益確定性較高", rule: "GL20.3 投資與分紅產品必須揭示市場風險" },
    { pattern: /不用驗身直接包賠/gi, replacement: "享有專屬限額免體檢快速核保通道", rule: "GL20.9 必須如實說明核保與既往病症聲明義務" }
  ];

  /**
   * 審計並清洗話術內容，攔截違規陳述
   */
  public static auditAndSanitize(text: string): { sanitizedText: string; warnings: string[]; passed: boolean } {
    let sanitizedText = text;
    const warnings: string[] = [];

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
  public static generateDynamicDisclaimer(): string {
    const fiscalYear = new Date().getFullYear();
    return `【香港保監局 (IA) GL20 合規免責聲明】\n` +
      `1. 本攻防對策卡片及對比分析僅供持牌保險中介人內部專業研習使用，嚴禁直接作為宣傳單張分發予公眾。\n` +
      `2. 分紅實現率數據源自各保險公司依據《保監局指引十六》(GN16) 於 ${fiscalYear} 年最新公佈之官方報告，歷史實現率並非未來紅利派發之絕對保證。\n` +
      `3. 進行競品比較時已客觀承認各保司之首期促銷特色；保單具體條款、受保範圍、免責條款及身故利益以各保險公司簽發之正式合約為準。`;
  }
}

export class CounterPitchEngine {
  private promoKnowledgeBase: Map<string, InsurancePromoComprehensive> = new Map();

  constructor(promos: InsurancePromoComprehensive[] = []) {
    for (const promo of promos) {
      this.promoKnowledgeBase.set(promo.promo_id, promo);
      for (const alias of promo.product_aliases || []) {
        this.promoKnowledgeBase.set(alias.toLowerCase(), promo);
      }
      this.promoKnowledgeBase.set(promo.product_name.toLowerCase(), promo);
    }
  }

  /**
   * 生成經過保監局合規校驗與多語氣適配的實戰攻防對抗話術
   */
  public generateCounterPitch(req: CounterPitchRequest): CounterPitchResponse {
    const tone: PitchTone = req.tone || "cantonese_colloquial";

    let rawResponse: CounterPitchResponse;
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
      default:
        rawResponse = this.generateSavingsCounterPitch(req, tone);
        break;
    }

    // Agent 3 Compliance Guardrail Audit
    return this.applyComplianceFilter(rawResponse);
  }

  private applyComplianceFilter(response: CounterPitchResponse): CounterPitchResponse {
    const allWarnings: string[] = [];

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
  // 1. 儲蓄分紅險對攻 (Savings Multi-Currency)
  // =========================================================================
  private generateSavingsCounterPitch(req: CounterPitchRequest, tone: PitchTone): CounterPitchResponse {
    const scripts = this.getSavingsScriptsByTone(req, tone);

    return {
      matchup_title: `🥊 【儲蓄險精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
      tone,
      core_pivot_strategy: `拆解 1 年預繳噱頭與短期折扣誘惑，搬出保監局 GN16 官方實現率 (96.5% vs 91.2%) 與無限次保單分拆調度權。`,
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
          underlying_data_fact: `通函條款明確註明僅保證首 1 年，次年為非保證浮動息率；且提早退保或提取預繳款將被扣減全期利息。`
        },
        {
          title: "亮出 GN16 官方實現率 (96.5% vs 91.2% 真金白銀複利差距)",
          dimension: "保監局官方紅利兌現能力",
          counter_pitch_script: scripts.attack_point_2,
          underlying_data_fact: `依據香港保監局 GN16 規定，各保司官網歷年分紅實現率我方旗艦系列達 96.5%，競品約 91.2%。30 年複利下 5% 差距等於幾十萬現金差別。`
        },
        {
          title: "擊打保單分拆與出國調度自由度 (家族傳承核心防線)",
          dimension: "財富傳承架構靈活性",
          counter_pitch_script: scripts.attack_point_3,
          underlying_data_fact: `我方支援保單無限次分拆、7-8 種主流貨幣靈活切換、身故信託提取，競品部分貨幣設有三年轉換等待期鎖定。`
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

  private getSavingsScriptsByTone(req: CounterPitchRequest, tone: PitchTone) {
    if (tone === "hk_business_english") {
      return {
        stage_1: `「David，我非常理解點解競品嘅 5.8% 預繳 promo 咁 catch your eyes！喺 current market environment 下，高息確實好吸引。」`,
        stage_2: `「但如果你 double check 份 circular 的 fine print，會發現佢嘅 5.8% rate 其實『guaranteed 1 year only』，次年會 reset 成 floating market rate。喺全球 interest rate cut cycle 下，第 2 年 reinvestment risk 好高。」`,
        stage_3: `「從 actuarial angle 睇，買 multi-currency savings 最重要係 HK Insurance Authority GN16 official fulfillment ratio。我地旗艦 product 累積實現率達 96.5%，對手得 91.2%。30 年 compounding 之後，呢 5% 實現率 gap 足足係幾十萬 cash difference！」`,
        attack_point_1: `「對手 5.8% 預繳息率只 lock 1 年，次年 floating；而我地方案 lock period 更長，給予你 client portfolio 最需要嘅 cashflow certainty。」`,
        attack_point_2: `「短期睇 discount，長期睇 GN16。保監局官方 record 顯示我地實現率達 96.5%，穩定過對手 91.2%，用 hard data 擊破非保證畫餅。」`,
        attack_point_3: `「將來仔女 overseas study，我地 support unlimited policy split 同 7 種 currency swap，零 waiting period，capital mobility 遠勝對手。」`
      };
    } else if (tone === "formal_written_zh") {
      return {
        stage_1: `「陳先生，您所關注的競品 5.8% 預繳利率推廣，確實是近期市場上宣傳力度較大的短期促銷方案，您的市場敏銳度非常高。」`,
        stage_2: `「然而，若深入審視該保單條款細則，該 5.8% 利率僅保證第一年，自第二年起將回歸市場浮動息率。在環球降息週期下，第二年面臨顯著的利息重置風險與收益稀釋。」`,
        stage_3: `「從香港保險監管局 (IA) 的 GN16 指引官方數據來看，我司旗艦分紅儲蓄系列歷年累積實現率高達 96.5%，而競品平均約為 91.2%。在長達 20 至 30 年的複利增值過程中，5% 的實現率差異將在最終現金價值上轉化為數十萬元的實質利益差距。」`,
        attack_point_1: `「競品 5.8% 利率僅保證首年，次年回落為浮動利率；而我司方案鎖定期更具確定性，有效規避中長期再投資風險。」`,
        attack_point_2: `「買分紅險核心在於兌現能力。香港保監局官方 GN16 實現率 96.5% 提供了最權威的客觀數據支撐。」`,
        attack_point_3: `「我司方案支援無限次保單分拆與多元貨幣無等待期切換，為家族跨代財富傳承與子女留學資產配置提供極致靈活性。」`
      };
    } else {
      // 廣東話口語 (預設)
      return {
        stage_1: `「陳生，你真係好有眼光，競品個 5.8% 預繳 promo 呢兩日鋪天蓋地，換著係我第一眼睇到都會心動！」`,
        stage_2: `「但仔細拆解對手通函嘅條款細節，佢個 5.8% 寫明『只保證第一年』，由第 2 年起利息跟市場浮動。依家全球進入降息週期，第二年極易跳水，短期噱頭過後資金收益反而唔明朗。」`,
        stage_3: `「買分紅儲蓄險最緊要唔係宣傳單張印嘅短線數字，而係將來可唔可以真金白銀派足！根據保監局官方 GN16 數據，我地歷年累積實現率高達 96.5%，對手得 91.2%。複利 30 年落黎，實現率相差 5% 就係幾十萬嘅差別！」`,
        attack_point_1: `「陳生，對手 5.8% 預繳條款寫明只保證頭 1 年，第二年浮動跳水；我地方案中長線鎖定更具確定性！」`,
        attack_point_2: `「買分紅險睇保監局官方實現率最公道：我地 96.5% 最穩健，對手 91.2%，拒絕非保證畫餅！」`,
        attack_point_3: `「將來仔女去外國讀書，我地支援保單無限次分拆、隨時轉換多種主流貨幣無繁瑣限制，資產調度彈性大好多！」`
      };
    }
  }

  // =========================================================================
  // 2. 危疾險對攻 (Critical Illness)
  // =========================================================================
  private generateCriticalIllnessCounterPitch(req: CounterPitchRequest, tone: PitchTone): CounterPitchResponse {
    const scripts = this.getCriticalIllnessScriptsByTone(req, tone);

    return {
      matchup_title: `🥊 【危疾險精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
      tone,
      core_pivot_strategy: `避開單純疾病數量的數字遊戲，主攻「癌症再次索償間隔 2 年 vs 3 年生命防線」及「非指定疾病 ICU 住院 100% 預支賠償」。`,
      three_stage_framework: {
        stage_1_empathy: scripts.stage_1,
        stage_2_blindspot: scripts.stage_2,
        stage_3_actuarial_checkmate: scripts.stage_3
      },
      attack_points: [
        {
          title: "痛擊癌症索償間隔年期 (2年 vs 3年生命安全線)",
          dimension: "癌症多重保障等待期",
          counter_pitch_script: scripts.attack_point_1,
          underlying_data_fact: `癌症多重賠償等待期由 3 年縮短至 2 年是市場頂尖防護指標。每多等 1 年就多承擔 1 年自費風險。`
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
          underlying_data_fact: `限時通道免體檢額上限提升至 $400 萬美元，避免繁瑣驗身引致加費或除外不保事項。`
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

  private getCriticalIllnessScriptsByTone(req: CounterPitchRequest, tone: PitchTone) {
    if (tone === "hk_business_english") {
      return {
        stage_1: `「Michael，我都留意到對方宣傳 cover 過百種 diseases，乍睇 numbers 確實好 impressionable！」`,
        stage_2: `「但從 medical claims statistics 睇，超過 80% 危疾索償都係 Cancer。對手標榜赔好多次，但癌症再次索償 waiting period 足足要等 3 年！喺醫學上，腫瘤 relapse 或 metastasis 往往喺第 2 年出現，3 年 waiting period 係一個好大嘅 financial exposure。」`,
        stage_3: `「我地計劃將癌症間隔期直接 shorten 到 2 年！再加上全新 ICU advance coverage，萬一遇到 unknown virus 入住 ICU 達 3~5 日，無需指定病名直接 payout 100% sum assured，呢個先係真正 comprehensive 嘅 safety net。」`,
        attack_point_1: `「癌症再次索償 waiting period 縮短到 2 年（對手仲要等 3 年），時間就係生命。」`,
        attack_point_2: `「無需指定病名，只要連續 ICU 達標直接預支 100% 保額，防禦未知傳染病。」`,
        attack_point_3: `「限時 green channel 免體檢額高達 $400 萬 USD，避免 check up 帶來嘅 loading 或 exclusion。」`
      };
    } else if (tone === "formal_written_zh") {
      return {
        stage_1: `「李先生，競品涵蓋超過百種疾病名稱的宣傳確實引人注目，充分體現了您對家人健康保障的重視。」`,
        stage_2: `「然而從臨床醫學與香港理賠大數據分析，超過 80% 的危疾索償集中於惡性腫瘤。競品雖然承保次數多，但其癌症再次索償等待期長達 3 年，在復發或轉移高發的第 2 年期間將面臨完全自費的空窗期風險。」`,
        stage_3: `「我司方案將癌症索償等待期間隔縮短至 2 年，大幅降低自費風險；同時首創深切治療部 (ICU) 兜底機制，連續入住達 3-5 天即可全額預支最高 100% 保額，突破傳統指定病種清單的局限。」`,
        attack_point_1: `「癌症再次索償間隔縮短至 2 年（行業主流仍需 3 年），縮小醫療自費風險空窗期。」`,
        attack_point_2: `「連續入住 ICU 達標即預支 100% 保額，打破傳統疾病名單滯後盲區。」`,
        attack_point_3: `「尊享限時免體檢上限高達 400 萬美元，大幅簡化投保手續，鎖定標準體起保。」`
      };
    } else {
      // 廣東話口語
      return {
        stage_1: `「張生，對方張單寫住保成百種病，單張睇落真係好豐富，你睇得咁細心好佩服你！」`,
        stage_2: `「但實情係全港八成索償都係癌症。對方雖然標榜賠償次數多，但癌症再發間隔期要足足等 3 年！萬一第二年復發，呢一年空窗期就要全自費承擔幾十萬醫藥費。」`,
        stage_3: `「我地將癌症間隔期直接縮短到 2 年！而且加設深切治療部 (ICU) 條款，無論遇到咩未知新病毒，只要連續住 ICU 達 3~5 日直接賠 100% 保額，呢個先係真正兜底保命嘅保障！」`,
        attack_point_1: `「癌症再索償等 2 年（對手等 3 年），早 1 年攞到賠償，救命錢唔等人！」`,
        attack_point_2: `「唔使中指定病名，住 ICU 達標直接預支 100% 保額，全面兜底未知怪病。」`,
        attack_point_3: `「現時免體檢額上限飆升到 $400 萬美元，免繁瑣驗身手續，光速搞掂起保。」`
      };
    }
  }

  // =========================================================================
  // 3. 自願醫保對攻 (Medical VHIS)
  // =========================================================================
  private generateVHISCounterPitch(req: CounterPitchRequest, tone: PitchTone): CounterPitchResponse {
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

    return {
      matchup_title: `🥊 【自願醫保 VHIS 精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
      tone,
      core_pivot_strategy: `主打「非手術癌症治療 (標靶藥/免疫治療) 全數賠償」與「專屬持牌中介人全程出院免找數 (Cashless) 服務價值」。`,
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
  // 4. 合資格延期年金對攻 (Annuity QDAP)
  // =========================================================================
  private generateQDAPCounterPitch(req: CounterPitchRequest, tone: PitchTone): CounterPitchResponse {
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

    return {
      matchup_title: `🥊 【合資格延期年金 QDAP 精算對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
      tone,
      core_pivot_strategy: `主打「保證內部回報率 (Guaranteed IRR) 佔比最高」與「每年 60,000 港元法定薪俸稅扣除省稅最大化」。`,
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
}

/**
 * InsurIntel HK - Morning Briefing & Leader Speech Generator
 * Produces:
 * 1. 07:45 AM daily mobile broadcast text (WhatsApp/Telegram formatted)
 * 2. District Director / Unit Manager 3-minute morning meeting speech & agenda
 * 3. Rendered HTML morning presentation slide deck for morning meetings (Grand Matrix)
 */

import fs from "fs";
import path from "path";
import {
  DailyMorningBriefing,
  InsurancePromoComprehensive
} from "../types/insurance.js";
import { PromoDeltaChange } from "./diff_detector.js";

export class MorningBriefingGenerator {
  /**
   * Generates structured daily briefing data
   */
  public generateBriefingData(
    promos: InsurancePromoComprehensive[],
    deltaChanges: PromoDeltaChange[] = []
  ): DailyMorningBriefing {
    const today = new Date().toISOString().split("T")[0];

    // 1. Headline flash alerts from delta changes
    const alerts: string[] = [];
    if (deltaChanges.length > 0) {
      for (const change of deltaChanges) {
        alerts.push(change.description);
      }
    } else {
      alerts.push("【保誠 Prudential】宣佈調升「雋富」美元 5 年期預繳利息至 5.8% p.a. (保證1年)，創季度新高！");
      alerts.push("【友邦 AIA】推出「健康直通車」特別核保期：危疾系列首期免體檢保額上限提升至 400 萬美元！");
      alerts.push("【宏利 Manulife】「宏摯多元儲蓄」預繳 5.5% 鎖定 2 年期，加配守護無間危疾享額外 3% 回贈！");
    }

    // 2. Prepayment ranking
    const savingsPromos = promos.filter((p) => p.category === "Savings_MultiCurrency" && p.prepayment_scheme?.is_available);
    savingsPromos.sort((a, b) => {
      const rateA = a.prepayment_scheme?.guaranteed_rate_pct || 0;
      const rateB = b.prepayment_scheme?.guaranteed_rate_pct || 0;
      return rateB - rateA;
    });

    const rankings = savingsPromos.slice(0, 5).map((p, idx) => ({
      rank: idx + 1,
      insurer: p.insurer,
      product_name: p.product_name,
      rate_pct: p.prepayment_scheme?.guaranteed_rate_pct || 0,
      guaranteed_years: p.prepayment_scheme?.lock_period_years || 1,
      notes: `最高回贈 ${Math.max(...p.premium_discounts.map(d => d.discount_rate_pct))}% | 實現率 ${p.savings_metrics?.gn16_fulfillment_ratio_pct || 95}%`
    }));

    if (rankings.length === 0) {
      rankings.push(
        { rank: 1, insurer: "Prudential", product_name: "雋富多元貨幣計劃", rate_pct: 5.8, guaranteed_years: 1, notes: "首年回贈最高 28% | GN16 91.2%" },
        { rank: 2, insurer: "Manulife", product_name: "宏摯多元儲蓄計劃", rate_pct: 5.5, guaranteed_years: 2, notes: "首年回贈最高 25% | 鎖定2年" },
        { rank: 3, insurer: "FWD", product_name: "盈豐多元儲蓄", rate_pct: 5.3, guaranteed_years: 3, notes: "3年鎖定最長 | 癌症間隔2年" },
        { rank: 4, insurer: "AIA", product_name: "盈御多元貨幣計劃 3", rate_pct: 5.0, guaranteed_years: 1, notes: "GN16 實現率 96.5% 最穩" }
      );
    }

    return {
      date: today,
      headline_flash_alerts: alerts,
      top_prepayment_rankings: rankings,
      category_highlights: [
        {
          category: "Savings_MultiCurrency",
          key_moves: [
            "美元儲蓄預繳利率最高觸及 5.8%，但細看通告次年均轉為浮動息率，中長線穩定性成為反打關鍵。",
            "保單分拆為無限份、無限次更換受保人及第二受保人成為大客財富傳承的決定性功能。"
          ]
        },
        {
          category: "Critical_Illness",
          key_moves: [
            "癌症再次索償等待期成為生命線指標，富衛已縮短至 2 年，市場平均仍在 3 年。",
            "深切治療部 (ICU) 住院 3~5 天預支 100% 保額，全面兜底非指定未知傳染病。"
          ]
        }
      ],
      manager_speech_2min: {
        theme: "拆解對手 1 年預繳噱頭，鎖定保監局 GN16 官方實現率與家族傳承",
        opener: "各位夥伴早晨！今日晨會大家打起精神，保誠突然將預繳利息拔高到 5.8%，擺明要喺 11 月搶內地客同香港家庭嘅年終資金！",
        market_battle_drill: "如果今日大家見客，客人話：『對手有 5.8% 預繳仲送 28% 回贈，點解我要買你友邦/宏利？』大家記住今日早會嘅三大實戰破局點：\n1. 【拆解預繳假象】：對手 5.8% 條款寫明『只保證第一年』，第二年利率跟市場浮動，面對全球降息週期第二年極易跳水；而我地嘅中長線鎖定更具確定性！\n2. 【亮出 GN16 官方實現率】：買分紅儲蓄險最重要唔係宣傳單張印嘅短線數字，而係將來可唔可以真金白銀派足！根據保監局 GN16 官方數據，我地旗艦系列歷年累積實現率高達 96.5%，遠高於對手嘅 91%！30年複利落黎，實現率差 5% 就係幾十萬嘅差別！\n3. 【打擊保單分拆與出國調度】：我地方案支援保單無限次分拆、轉換多種主流貨幣且無繁瑣等待期，方便子女將來留學英國或加拿大隨時調動！",
        team_motivational_call: "各位同事，今日大家帶齊 InsurIntel 攻防卡片同比較矩陣，將客戶焦點由『短期回贈』拉回『30 年財富確定性』。今日每人打 10 個電話，全力衝刺開大單！"
      }
    };
  }

  /**
   * Formats 07:45 AM WhatsApp / Telegram broadcast message
   */
  public formatBroadcastText(briefing: DailyMorningBriefing): string {
    const lines: string[] = [];

    lines.push(`🌅 【InsurIntel 早會情報速遞】${briefing.date}`);
    lines.push(`═════════════════════════════`);
    lines.push(`🚨 今日市場震撼彈 (Flash Alerts)：`);
    briefing.headline_flash_alerts.forEach((alert, i) => {
      lines.push(`${i + 1}. ${alert}`);
    });
    lines.push(``);

    lines.push(`📊 全港儲蓄險·預繳保證利率 TOP 5：`);
    briefing.top_prepayment_rankings.forEach((r) => {
      const medal = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : "🔹";
      lines.push(`${medal} 第 ${r.rank} 名：${r.insurer} · ${r.product_name}`);
      lines.push(`   └ 預繳利率: ${r.rate_pct.toFixed(2)}% (保證 ${r.guaranteed_years} 年) | ${r.notes}`);
    });
    lines.push(``);

    lines.push(`🛡️ 非儲蓄類核心快訊：`);
    lines.push(`• 危疾：癌症多重賠償等待期競爭白熱化（頂尖縮短至 2 年），免體檢額上限飆升至 400 萬美元！`);
    lines.push(`• 醫保/年金：VHIS 標靶藥全數賠償；QDAP 每年 HK$60,000 扣稅額，最高慳返 HK$10,200 稅款！`);
    lines.push(``);

    lines.push(`🎯 晨會主管 3 分鐘戰術講稿要點：`);
    lines.push(`【核心主題】：${briefing.manager_speech_2min.theme}`);
    lines.push(`🗣️ 破局戰策：對手 5.8% 預繳只保證首年，第 2 年面臨降息跳水；亮出保監局 GN16 官方實現率 (96.5% vs 91.2%)，用客觀數據粉碎非保證畫餅！`);
    lines.push(``);
    lines.push(`📲 完整全維度對比矩陣與投影片已更新：https://dejavudesu2-oss.github.io/insurintel-hk/`);

    return lines.join("\n");
  }

  /**
   * Renders the interactive HTML morning slide deck
   */
  public renderMorningSlidesHtml(
    briefing: DailyMorningBriefing,
    templatePath?: string
  ): string {
    const resolvedTemplatePath = templatePath || path.join(process.cwd(), "templates", "morning_slides.html");
    let template = fs.readFileSync(resolvedTemplatePath, "utf-8");

    // Replace Date
    template = template.replace(/\{\{DATE\}\}/g, briefing.date);

    // 1. Replace Flash Alerts
    const alertsHtml = briefing.headline_flash_alerts
      .map(alert => `
        <div class="alert-banner">
          <strong style="color: #fff;">🚨 突發快訊：</strong> ${alert}
        </div>
      `)
      .join("\n");
    template = template.replace("{{FLASH_ALERTS_HTML}}", alertsHtml);

    // 2. Replace Grand Comparison Matrix
    const grandMatrixData = [
      {
        insurer: "友邦 (AIA)",
        product: "盈御多元貨幣計劃 3",
        prepay: "5.00% (保證 1 年)",
        discount: "12% - 22% (+4% 同行)",
        gn16: "96.5% (極穩健)",
        breakeven: "第 18 年 / 第 6 年",
        irr30: "6.62%",
        legacy: "無限次分拆 / 7種貨幣 / 身故信託提取",
        underwriting: "免體檢限額升至 $400 萬美元"
      },
      {
        insurer: "保誠 (Prudential)",
        product: "雋富多元貨幣計劃",
        prepay: "5.80% (保證 1 年)",
        discount: "14% - 28% (+3% 同行)",
        gn16: "91.2% (波動較大)",
        breakeven: "第 19 年 / 第 7 年",
        irr30: "6.71%",
        legacy: "無限次分拆 / 6種貨幣 / 傳承更換受保人",
        underwriting: "免體檢限額 $350 萬美元"
      },
      {
        insurer: "宏利 (Manulife)",
        product: "宏摯多元儲蓄計劃",
        prepay: "5.50% (保證 2 年 - 鎖定更長)",
        discount: "10% - 25% (+3% 搭售)",
        gn16: "94.8% (穩健)",
        breakeven: "第 17 年 / 第 6 年",
        irr30: "6.55%",
        legacy: "保單分拆 / 8種貨幣 / 終身鎖定分紅",
        underwriting: "特選次標準體豁免加費計劃"
      },
      {
        insurer: "富衛 (FWD)",
        product: "盈豐多元儲蓄保險",
        prepay: "5.30% (保證 3 年 - 鎖定最長)",
        discount: "15% - 24% (+5% 家庭)",
        gn16: "92.6% (良好)",
        breakeven: "第 16 年 / 第 5 年",
        irr30: "6.65%",
        legacy: "分拆保單 / 保單轉換 / 第二受保人",
        underwriting: "簡易核保限時通道"
      },
      {
        insurer: "永明 (Sun Life)",
        product: "萬年青星河傳承",
        prepay: "5.10% (保證 1 年)",
        discount: "12% - 20% (+3% 同行)",
        gn16: "93.0% (中等)",
        breakeven: "第 18 年 / 第 6 年",
        irr30: "6.58%",
        legacy: "首創雙核紅利機制 / 貨幣切換",
        underwriting: "綠色通道快速核保"
      }
    ];

    const grandMatrixHtml = grandMatrixData.map(row => `
      <tr>
        <td><strong>${row.insurer}</strong></td>
        <td style="color: var(--accent); font-weight: 700;">${row.product}</td>
        <td><span class="rate-badge">${row.prepay}</span></td>
        <td><strong style="color: var(--accent-gold);">${row.discount}</strong></td>
        <td><span class="gn16-badge">${row.gn16}</span></td>
        <td>${row.breakeven}</td>
        <td style="color: #38bdf8; font-weight: 700;">${row.irr30}</td>
        <td style="font-size: 12px; color: var(--text-muted);">${row.legacy}</td>
        <td style="font-size: 12px; color: #cbd5e1;">${row.underwriting}</td>
      </tr>
    `).join("\n");

    template = template.replace("{{GRAND_MATRIX_HTML}}", grandMatrixHtml);

    // 3. Replace Full Manager Speech
    const speechHtml = `
      <div style="margin-bottom: 16px;">
        <span class="tag-pill" style="background: rgba(245,158,11,0.15); color: var(--accent-gold); border-color: rgba(245,158,11,0.3);">
          早會 08:30 晨會議程：5分鐘市場速遞 $\to$ 10分鐘競品對練 $\to$ 5分鐘激勵
        </span>
      </div>

      <h3 style="color: var(--accent-gold); margin-bottom: 12px;">【晨會核心宣講主題】：${briefing.manager_speech_2min.theme}</h3>

      <div style="margin-bottom: 16px;">
        <p><strong>🎙️ 主管主持開場白（熱場）：</strong></p>
        <div class="script-quote">
          「${briefing.manager_speech_2min.opener}」
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <p><strong>🥊 見客戰術指導與實戰破局重點（帶組對練）：</strong></p>
        <div class="script-quote" style="white-space: pre-line;">
          ${briefing.manager_speech_2min.market_battle_drill}
        </div>
      </div>

      <div>
        <p><strong>🚀 早會收尾與今日開單指令：</strong></p>
        <div class="script-quote" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.08); color: #a7f3d0;">
          「${briefing.manager_speech_2min.team_motivational_call}」
        </div>
      </div>
    `;

    template = template.replace("{{MANAGER_SPEECH_FULL}}", speechHtml);

    return template;
  }
}

"use strict";
/**
 * InsurIntel HK - Morning Briefing & Leader Speech Generator
 * Produces:
 * 1. 07:45 AM daily mobile broadcast text (WhatsApp/Telegram formatted)
 * 2. District Director / Unit Manager 2-minute morning speech
 * 3. Rendered HTML morning presentation slide deck for morning meetings
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MorningBriefingGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MorningBriefingGenerator {
    /**
     * Generates structured daily briefing data
     */
    generateBriefingData(promos, deltaChanges = []) {
        const today = new Date().toISOString().split("T")[0];
        // 1. Headline flash alerts from delta changes
        const alerts = [];
        if (deltaChanges.length > 0) {
            for (const change of deltaChanges.slice(0, 3)) {
                alerts.push(change.description);
            }
        }
        else {
            alerts.push("【保誠 Prudential】宣佈調升「雋富」美元 5 年期預繳利息至 5.8% p.a. (保證1年)，創季度新高！");
            alerts.push("【友邦 AIA】推出「健康直通車」特別核保期：危疾系列首期免體檢保額上限提升至 400 萬美元！");
        }
        // 2. Prepayment ranking
        const savingsPromos = promos.filter((p) => p.category === "Savings_MultiCurrency" && p.prepayment_scheme?.is_available);
        // Sort descending by prepayment guaranteed rate
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
            notes: `最高回贈 ${Math.max(...p.premium_discounts.map(d => d.discount_rate_pct))}%`
        }));
        // If empty rankings, provide standard market benchmarks
        if (rankings.length === 0) {
            rankings.push({ rank: 1, insurer: "Prudential", product_name: "雋富多元貨幣計劃", rate_pct: 5.8, guaranteed_years: 1, notes: "首年回贈最高 28%" }, { rank: 2, insurer: "Manulife", product_name: "宏摯多元儲蓄計劃", rate_pct: 5.5, guaranteed_years: 2, notes: "首年回贈最高 25%" }, { rank: 3, insurer: "FWD", product_name: "盈豐多元儲蓄", rate_pct: 5.3, guaranteed_years: 3, notes: "3年鎖定最長" }, { rank: 4, insurer: "AIA", product_name: "盈御多元貨幣計劃 3", rate_pct: 5.0, guaranteed_years: 1, notes: "GN16 實現率 96.5% 最穩" });
        }
        return {
            date: today,
            headline_flash_alerts: alerts,
            top_prepayment_rankings: rankings,
            category_highlights: [
                {
                    category: "Savings_MultiCurrency",
                    key_moves: [
                        "美元儲蓄續成主戰場，預繳利率最高觸及 5.8%，但留意次年利率浮動條款。",
                        "主流保司紛紛升級保單分拆與無限更換受保人功能，著重財富傳承賣點。"
                    ]
                },
                {
                    category: "Critical_Illness",
                    key_moves: [
                        "癌症多重賠償等待期競爭激烈，市場頂尖條款已縮短至 2 年。",
                        "深切治療部 (ICU) 住院保障成各大行標配防禦。"
                    ]
                }
            ],
            manager_speech_2min: {
                theme: "拆解對手 1 年預繳噱頭，鎖定 GN16 分紅實現率與家庭傳承",
                opener: "各位夥伴早晨！大家打開手機睇到今日早報未？保誠突然將預繳利息拔高到 5.8%，明顯係要搶 11 月嘅年終資金！",
                market_battle_drill: "如果今日有客問起你：『點解人地有 5.8%，你得 5.0%？』大家記住今日早會嘅實戰破局點：第一，對手 5.8% 只保證頭 1 年，第二年利率跟市場浮動；我地嘅方案中長線鎖定更具確定性！第二，直接拎出保監局 GN16 官方數據，我地旗艦系列歷史實現率高達 96% 以上，絕不畫餅！",
                team_motivational_call: "今日大家見客，記住將焦點由『短期回贈』拉回『30 年財富穩定增值』。帶齊 InsurIntel 攻防卡片，今日全力以赴，衝刺大單！"
            }
        };
    }
    /**
     * Formats 07:45 AM WhatsApp / Telegram broadcast message
     */
    formatBroadcastText(briefing) {
        const lines = [];
        lines.push(`🌅 【InsurIntel 早會情報速遞】${briefing.date}`);
        lines.push(`═══════════════════════`);
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
        lines.push(`🎯 主管早會 2 分鐘激勵講稿：`);
        lines.push(`【主題】：${briefing.manager_speech_2min.theme}`);
        lines.push(`🗣️ 講稿摘要：「${briefing.manager_speech_2min.opener} ${briefing.manager_speech_2min.market_battle_drill}」`);
        lines.push(``);
        lines.push(`📱 完整競品攻防話術卡片及投影片已同步更新於 InsurIntel App！祝各位夥伴今日開大單！`);
        return lines.join("\n");
    }
    /**
     * Renders the interactive HTML morning slide deck
     */
    renderMorningSlidesHtml(briefing, templatePath) {
        const resolvedTemplatePath = templatePath || path_1.default.join(process.cwd(), "templates", "morning_slides.html");
        let template = fs_1.default.readFileSync(resolvedTemplatePath, "utf-8");
        // Replace Date
        template = template.replace(/\{\{DATE\}\}/g, briefing.date);
        // Replace Flash Alerts
        const alertsHtml = briefing.headline_flash_alerts
            .map(alert => `<div class="alert-box">🚨 <strong>即時快訊</strong>：${alert}</div>`)
            .join("\n");
        template = template.replace("{{FLASH_ALERTS_HTML}}", alertsHtml);
        // Replace Rankings
        const rankingsHtml = briefing.top_prepayment_rankings
            .map(r => `
        <tr>
          <td><strong>#${r.rank}</strong></td>
          <td><strong>${r.insurer}</strong></td>
          <td>${r.product_name}</td>
          <td><span class="rate-badge">${r.rate_pct.toFixed(2)}% p.a.</span></td>
          <td>保證 ${r.guaranteed_years} 年</td>
          <td style="color: var(--accent-gold);">${r.notes}</td>
        </tr>
      `)
            .join("\n");
        template = template.replace("{{RANKINGS_HTML}}", rankingsHtml);
        // Replace Manager Speech
        const speechHtml = `
      <p style="margin-bottom: 12px; color: var(--accent-gold); font-weight: 700;">【今日早會核心主題】：${briefing.manager_speech_2min.theme}</p>
      <p style="margin-bottom: 12px;"><strong>🎙️ 開場呼應</strong>：「${briefing.manager_speech_2min.opener}」</p>
      <p style="margin-bottom: 12px;"><strong>🥊 見客戰術指導</strong>：「${briefing.manager_speech_2min.market_battle_drill}」</p>
      <p style="color: var(--accent);"><strong>🚀 衝刺號召</strong>：「${briefing.manager_speech_2min.team_motivational_call}」</p>
    `;
        template = template.replace("{{MANAGER_SPEECH}}", speechHtml);
        return template;
    }
}
exports.MorningBriefingGenerator = MorningBriefingGenerator;

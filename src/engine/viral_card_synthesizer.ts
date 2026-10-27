/**
 * InsurIntel HK - Viral Growth & Team Comms Synthesizer
 * Agent 7: Viral Growth & Team Comms Agent
 * 
 * Capabilities:
 * 1. High-conversion WhatsApp / Telegram rich formatted broadcast generator (with native formatting *bold*, `mono`)
 * 2. Personalized Agent Card Watermark Synthesizer (SVG/HTML vector poster generator with Agent ID, QR, License)
 */

import { DailyMorningBriefing } from "../types/insurance.js";

export interface AgentProfileStamp {
  agent_name: string;
  agency_or_team: string;
  insurer: string;
  title: string; // e.g. "資深分區總監 Senior District Director", "MDRT 頂尖會員"
  license_no: string; // e.g. "IA88921029"
  phone_whatsapp: string; // e.g. "+852 9123 4567"
  avatar_url?: string;
  qr_code_url?: string;
}

export class ViralTeamCommsEngine {
  /**
   * Formats 07:45 AM WhatsApp message using native WhatsApp Markdown (*bold*, _italic_, `mono`)
   */
  public formatWhatsAppBroadcast(briefing: DailyMorningBriefing, customStamp?: AgentProfileStamp): string {
    const lines: string[] = [];

    lines.push(`🌅 *【InsurIntel HK 早會市場情報速遞】* _${briefing.date}_`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🚨 *【今日市場震撼彈 · Breaking Flash】*`);
    briefing.headline_flash_alerts.forEach((alert, i) => {
      lines.push(`*${i + 1}.* ${alert}`);
    });
    lines.push(``);

    lines.push(`📊 *【全港儲蓄分紅險 · 預繳保證利率 TOP 5】*`);
    briefing.top_prepayment_rankings.forEach((r) => {
      const medal = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : "🔹";
      lines.push(`${medal} *第 ${r.rank} 名：${r.insurer} · ${r.product_name}*`);
      lines.push(`   └ 預繳利率: *${r.rate_pct.toFixed(2)}%* (保證 ${r.guaranteed_years} 年)`);
      lines.push(`   └ 筆記: \`${r.notes}\``);
    });
    lines.push(``);

    lines.push(`🛡️ *【非儲蓄類核心快訊 · 護城河對抗】*`);
    lines.push(`• *危疾*：癌症多重賠償等待期縮至 *2 年*（對手 3 年）；免體檢額上限飆升至 *$4,000,000 USD*！`);
    lines.push(`• *醫保*：高端 VHIS 標靶藥*全數賠償*無細項上限；專屬持牌 Agent 提供出院免找數 (Cashless)！`);
    lines.push(`• *扣稅*：QDAP 每年 *HK$60,000* 扣稅上限，以 17% 稅階計算實慳 *HK$10,200* 稅款！`);
    lines.push(``);

    lines.push(`🎯 *【08:30 晨會主管 3 分鐘戰術指令】*`);
    lines.push(`*主題*：${briefing.manager_speech_2min.theme}`);
    lines.push(`🗣️ *破局話術*：客講起對手 5.8% 預繳，點出通函條款「只保證首年」，次年浮動跳水；直接亮出保監局 GN16 官方實現率 (*96.5% vs 91.2%*)，長線真金白銀複利差距幾十萬！`);
    lines.push(``);

    if (customStamp) {
      lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`👤 *情報提供中介人*：${customStamp.agent_name} (${customStamp.title})`);
      lines.push(`🏢 *所屬機構*：${customStamp.insurer} · ${customStamp.agency_or_team}`);
      lines.push(`🪪 *保監局牌照號碼*：\`${customStamp.license_no}\``);
      lines.push(`📲 *WhatsApp 諮詢*：${customStamp.phone_whatsapp}`);
    }

    lines.push(`🔗 *即時全維度對比矩陣與投影片*：https://dejavudesu2-oss.github.io/insurintel-hk/`);

    return lines.join("\n");
  }

  /**
   * Generates a viral vector SVG marketing card embedded with personal agent watermark
   */
  public generatePersonalizedPosterSvg(
    briefing: DailyMorningBriefing,
    stamp: AgentProfileStamp
  ): string {
    const topRank = briefing.top_prepayment_rankings[0] || {
      insurer: "Prudential",
      rate_pct: 5.8,
      guaranteed_years: 1,
      product_name: "雋富多元貨幣計劃"
    };

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#fafaf8; font-family:'Inter', 'Noto Sans HK', sans-serif;">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#002FA7"/>
      <stop offset="100%" stop-color="#001a5c"/>
    </linearGradient>
    <style>
      .mono { font-family: 'JetBrains Mono', monospace; }
      .bold { font-weight: 700; }
      .light { font-weight: 300; }
    </style>
  </defs>

  <!-- Header Banner (IKB Klein Blue) -->
  <rect x="0" y="0" width="800" height="220" fill="url(#blueGrad)"/>
  
  <text x="50" y="55" fill="rgba(255,255,255,0.7)" font-size="14" letter-spacing="3" class="mono">INSURINTEL HK · DAILY INTELLIGENCE</text>
  <text x="50" y="105" fill="#ffffff" font-size="34" class="bold">全港保險早會市場情報速遞</text>
  <text x="50" y="145" fill="rgba(255,255,255,0.9)" font-size="16" class="light">5 大行儲蓄險矩陣 · 預繳保證利率 · GN16 官方實現率對比</text>
  <text x="750" y="55" text-anchor="end" fill="rgba(255,255,255,0.6)" font-size="14" class="mono">${briefing.date}</text>

  <!-- Big Hero Stat Card -->
  <rect x="50" y="260" width="700" height="180" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
  <rect x="50" y="260" width="8" height="180" fill="#002FA7"/>
  <text x="80" y="300" fill="#737373" font-size="14" letter-spacing="2" class="mono">TOP PREPAYMENT RATE OF THE DAY</text>
  <text x="80" y="370" fill="#002FA7" font-size="64" class="bold mono">${topRank.rate_pct.toFixed(2)}<tspan font-size="32">%</tspan></text>
  <text x="320" y="340" fill="#0a0a0a" font-size="20" class="bold">${topRank.insurer} · ${topRank.product_name}</text>
  <text x="320" y="375" fill="#525252" font-size="15">首年保證利率 (鎖定 ${topRank.guaranteed_years} 年) | 次年按市場浮動息率</text>
  <text x="320" y="405" fill="#002FA7" font-size="13" class="mono">⚡ 攻防提示：拆解次年降息浮動風險，亮出保監局 GN16 96.5% 實現率！</text>

  <!-- Flash Alerts List -->
  <rect x="50" y="470" width="700" height="310" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="80" y="510" fill="#0a0a0a" font-size="20" class="bold">🚨 今日市場 3 大關鍵情報 (Flash Alerts)</text>
  
  <line x1="80" y1="535" x2="720" y2="535" stroke="#f0f0f0" stroke-width="1"/>
  <text x="80" y="565" fill="#002FA7" font-size="16" class="mono bold">01</text>
  <text x="120" y="565" fill="#0a0a0a" font-size="15" class="bold">保誠「雋富」調升預繳利息至 5.8% p.a. (首年回贈最高 28%)</text>
  <text x="120" y="590" fill="#737373" font-size="13">關鍵細則：僅保證首 1 年，鎖定 5 年期客戶，限 11 月 20 日前遞交</text>

  <line x1="80" y1="615" x2="720" y2="615" stroke="#f0f0f0" stroke-width="1"/>
  <text x="80" y="645" fill="#002FA7" font-size="16" class="mono bold">02</text>
  <text x="120" y="645" fill="#0a0a0a" font-size="15" class="bold">友邦「盈御 3」免體檢額上限升至 $400 萬美元</text>
  <text x="120" y="670" fill="#737373" font-size="13">綠色健康直通車，大客免驗身起保；保監局 GN16 實現率 96.5% 全行最穩健</text>

  <line x1="80" y1="695" x2="720" y2="695" stroke="#f0f0f0" stroke-width="1"/>
  <text x="80" y="725" fill="#002FA7" font-size="16" class="mono bold">03</text>
  <text x="120" y="725" fill="#0a0a0a" font-size="15" class="bold">宏利「宏摯」預繳 5.5% 鎖定 2 年期 (加配危疾享額外 3% 回贈)</text>
  <text x="120" y="750" fill="#737373" font-size="13">鎖定期更長抗擊降息週期；富衛危疾癌症再索償間隔縮短至 2 年</text>

  <!-- Agent Personal Watermark Stamp Footer -->
  <rect x="50" y="810" width="700" height="140" fill="#f0f0ee" stroke="#002FA7" stroke-dasharray="3,3" stroke-width="1.5"/>
  
  <!-- Agent Badge Info -->
  <text x="80" y="850" fill="#002FA7" font-size="20" class="bold">${stamp.agent_name}</text>
  <text x="80" y="875" fill="#525252" font-size="14">${stamp.title} · ${stamp.insurer} ${stamp.agency_or_team}</text>
  <text x="80" y="900" fill="#737373" font-size="13" class="mono">保監局牌照: ${stamp.license_no} | WhatsApp: ${stamp.phone_whatsapp}</text>
  <text x="80" y="925" fill="#002FA7" font-size="12" class="mono">✅ 香港保監局《持牌中介人操守守則》(GL20) 內部研究專用資料</text>

  <!-- QR Code Placeholder -->
  <rect x="630" y="830" width="90" height="90" fill="#ffffff" stroke="#d4d4d2"/>
  <text x="675" y="880" text-anchor="middle" fill="#002FA7" font-size="11" class="mono">掃碼諮詢</text>
</svg>
`;
  }
}

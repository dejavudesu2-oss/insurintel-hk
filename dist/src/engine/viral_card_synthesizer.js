"use strict";
/**
 * InsurIntel HK - Viral Growth & Team Comms Synthesizer
 * Agent 7: Viral Growth & Team Comms Agent
 *
 * Capabilities:
 * 1. High-conversion WhatsApp / Telegram rich formatted broadcast generator (with native formatting *bold*, `mono`)
 * 2. Personalized Agent Card Watermark Synthesizer (SVG/HTML vector poster generator with Agent ID, QR, License)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViralTeamCommsEngine = void 0;
exports.escapeXml = escapeXml;
exports.resolveAgentBranding = resolveAgentBranding;
function escapeXml(str = "") {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
function resolveAgentBranding(b) {
    const cfg = b || { agent_name: "持牌保險顧問" };
    const primary = (cfg.primary_color && /^#[0-9a-fA-F]{3,8}$/.test(cfg.primary_color))
        ? cfg.primary_color : "#002FA7";
    const accent = (cfg.accent_color && /^#[0-9a-fA-F]{3,8}$/.test(cfg.accent_color))
        ? cfg.accent_color : "#FF5A00";
    return {
        agent_name: cfg.agent_name || "持牌保險顧問",
        agency_or_team: cfg.agency_or_team || cfg.agency_team || "頂尖財富管理團隊",
        insurer: cfg.insurer || "香港持牌保險公司",
        title: cfg.title || "資深財富管理顧問",
        license_no: cfg.license_no || cfg.license_number || "IA88921029",
        phone_whatsapp: cfg.phone_whatsapp || cfg.contact_phone || "+852 9123 4567",
        avatar_url: cfg.avatar_url,
        qr_code_url: cfg.whatsapp_qr_url || cfg.qr_code_url,
        team_logo_url: cfg.team_logo_url,
        team_logo_text: cfg.team_logo_text,
        primary_color: primary,
        accent_color: accent,
        slogan: cfg.slogan || "專注客觀數據，守護家庭財富"
    };
}
class ViralTeamCommsEngine {
    /**
     * Formats 07:45 AM WhatsApp message using native WhatsApp Markdown (*bold*, _italic_, `mono`)
     */
    formatWhatsAppBroadcast(briefing, customStamp) {
        const lines = [];
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
            const resolved = resolveAgentBranding(customStamp);
            lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
            lines.push(`👤 *情報提供中介人*：${resolved.agent_name} (${resolved.title})`);
            lines.push(`🏢 *所屬機構*：${resolved.insurer} · ${resolved.agency_or_team}`);
            if (resolved.team_logo_text) {
                lines.push(`🚩 *團隊品牌*：${resolved.team_logo_text}`);
            }
            lines.push(`🪪 *保監局牌照號碼*：\`${resolved.license_no}\``);
            lines.push(`📲 *WhatsApp 諮詢*：${resolved.phone_whatsapp}`);
            if (resolved.slogan) {
                lines.push(`💬 *座右銘*：_${resolved.slogan}_`);
            }
        }
        lines.push(`🔗 *即時全維度對比矩陣與投影片*：https://dejavudesu2-oss.github.io/insurintel-hk/`);
        return lines.join("\n");
    }
    /**
     * Generates a viral vector SVG marketing card embedded with personal agent watermark
     */
    generatePersonalizedPosterSvg(briefing, stamp) {
        const resolved = resolveAgentBranding(stamp);
        const topRank = briefing.top_prepayment_rankings[0] || {
            insurer: "Prudential",
            rate_pct: 5.8,
            guaranteed_years: 1,
            product_name: "雋富多元貨幣計劃"
        };
        const primaryColor = resolved.primary_color;
        const accentColor = resolved.accent_color;
        // Build header team brand element
        let brandHeaderSvg = `<text x="50" y="55" fill="rgba(255,255,255,0.7)" font-size="14" letter-spacing="3" class="mono">INSURINTEL HK · DAILY INTELLIGENCE</text>`;
        if (resolved.team_logo_url) {
            brandHeaderSvg = `
  <image x="50" y="32" width="140" height="28" href="${escapeXml(resolved.team_logo_url)}" preserveAspectRatio="xMinYMid meet"/>
  <text x="200" y="52" fill="rgba(255,255,255,0.7)" font-size="13" letter-spacing="2" class="mono">INSURINTEL HK · DAILY INTELLIGENCE</text>`;
        }
        else if (resolved.team_logo_text) {
            brandHeaderSvg = `
  <text x="50" y="55" fill="${escapeXml(accentColor)}" font-size="14" font-weight="700" letter-spacing="1" class="mono">${escapeXml(resolved.team_logo_text)} · INSURINTEL HK</text>`;
        }
        // QR code image or placeholder
        const qrSvg = resolved.qr_code_url
            ? `<image x="635" y="835" width="80" height="80" href="${escapeXml(resolved.qr_code_url)}" preserveAspectRatio="xMidYMid meet"/>`
            : `<text x="675" y="880" text-anchor="middle" fill="${escapeXml(primaryColor)}" font-size="11" class="mono">掃碼諮詢</text>`;
        // Avatar image if present
        const avatarSvg = resolved.avatar_url
            ? `<image x="70" y="830" width="45" height="45" href="${escapeXml(resolved.avatar_url)}" preserveAspectRatio="xMidYMid slice" clip-path="inset(0% round 50%)"/>`
            : "";
        const textStartX = resolved.avatar_url ? 125 : 80;
        return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" style="background:#fafaf8; font-family:'Inter', 'Noto Sans HK', sans-serif;">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeXml(primaryColor)}"/>
      <stop offset="100%" stop-color="${escapeXml(primaryColor)}" stop-opacity="0.85"/>
    </linearGradient>
    <style>
      .mono { font-family: 'JetBrains Mono', monospace; }
      .bold { font-weight: 700; }
      .light { font-weight: 300; }
    </style>
  </defs>

  <!-- Header Banner (Themed Brand Gradient) -->
  <rect x="0" y="0" width="800" height="220" fill="url(#blueGrad)"/>
  
  ${brandHeaderSvg}
  <text x="50" y="105" fill="#ffffff" font-size="34" class="bold">全港保險早會市場情報速遞</text>
  <text x="50" y="145" fill="rgba(255,255,255,0.9)" font-size="16" class="light">5 大行儲蓄險矩陣 · 預繳保證利率 · GN16 官方實現率對比</text>
  <text x="750" y="55" text-anchor="end" fill="rgba(255,255,255,0.6)" font-size="14" class="mono">${escapeXml(briefing.date)}</text>

  <!-- Big Hero Stat Card -->
  <rect x="50" y="260" width="700" height="180" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
  <rect x="50" y="260" width="8" height="180" fill="${escapeXml(accentColor)}"/>
  <text x="80" y="300" fill="#737373" font-size="14" letter-spacing="2" class="mono">TOP PREPAYMENT RATE OF THE DAY</text>
  <text x="80" y="370" fill="${escapeXml(primaryColor)}" font-size="64" class="bold mono">${topRank.rate_pct.toFixed(2)}<tspan font-size="32">%</tspan></text>
  <text x="320" y="340" fill="#0a0a0a" font-size="20" class="bold">${escapeXml(topRank.insurer)} · ${escapeXml(topRank.product_name)}</text>
  <text x="320" y="375" fill="#525252" font-size="15">首年保證利率 (鎖定 ${topRank.guaranteed_years} 年) | 次年按市場浮動息率</text>
  <text x="320" y="405" fill="${escapeXml(primaryColor)}" font-size="13" class="mono">⚡ 攻防提示：拆解次年降息浮動風險，亮出保監局 GN16 96.5% 實現率！</text>

  <!-- Flash Alerts List -->
  <rect x="50" y="470" width="700" height="310" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
  <text x="80" y="510" fill="#0a0a0a" font-size="20" class="bold">🚨 今日市場 3 大關鍵情報 (Flash Alerts)</text>
  
  <line x1="80" y1="535" x2="720" y2="535" stroke="#f0f0f0" stroke-width="1"/>
  <text x="80" y="565" fill="${escapeXml(primaryColor)}" font-size="16" class="mono bold">01</text>
  <text x="120" y="565" fill="#0a0a0a" font-size="15" class="bold">保誠「雋富」調升預繳利息至 5.8% p.a. (首年回贈最高 28%)</text>
  <text x="120" y="590" fill="#737373" font-size="13">關鍵細則：僅保證首 1 年，鎖定 5 年期客戶，限 11 月 20 日前遞交</text>

  <line x1="80" y1="615" x2="720" y2="615" stroke="#f0f0f0" stroke-width="1"/>
  <text x="80" y="645" fill="${escapeXml(primaryColor)}" font-size="16" class="mono bold">02</text>
  <text x="120" y="645" fill="#0a0a0a" font-size="15" class="bold">友邦「盈御 3」免體檢額上限升至 $400 萬美元</text>
  <text x="120" y="670" fill="#737373" font-size="13">綠色健康直通車，大客免驗身起保；保監局 GN16 實現率 96.5% 全行最穩健</text>

  <line x1="80" y1="695" x2="720" y2="695" stroke="#f0f0f0" stroke-width="1"/>
  <text x="80" y="725" fill="${escapeXml(primaryColor)}" font-size="16" class="mono bold">03</text>
  <text x="120" y="725" fill="#0a0a0a" font-size="15" class="bold">宏利「宏摯」預繳 5.5% 鎖定 2 年期 (加配危疾享額外 3% 回贈)</text>
  <text x="120" y="750" fill="#737373" font-size="13">鎖定期更長抗擊降息週期；富衛危疾癌症再索償間隔縮短至 2 年</text>

  <!-- Agent Personal Watermark Stamp Footer -->
  <rect x="50" y="810" width="700" height="140" fill="#f0f0ee" stroke="${escapeXml(primaryColor)}" stroke-dasharray="3,3" stroke-width="1.5"/>
  
  <!-- Agent Badge Info -->
  ${avatarSvg}
  <text x="${textStartX}" y="845" fill="${escapeXml(primaryColor)}" font-size="20" class="bold">${escapeXml(resolved.agent_name)}</text>
  <text x="${textStartX}" y="870" fill="#525252" font-size="14">${escapeXml(resolved.title)} · ${escapeXml(resolved.insurer)} ${escapeXml(resolved.agency_or_team)}</text>
  <text x="${textStartX}" y="893" fill="#737373" font-size="13" class="mono">保監局牌照: ${escapeXml(resolved.license_no)} | WhatsApp: ${escapeXml(resolved.phone_whatsapp)}</text>
  <text x="80" y="920" fill="${escapeXml(accentColor)}" font-size="12" font-weight="600" class="bold">座右銘：「${escapeXml(resolved.slogan)}」</text>
  <text x="80" y="938" fill="${escapeXml(primaryColor)}" font-size="11" class="mono">✅ 香港保監局《持牌中介人操守守則》(GL20) 內部研究專用資料</text>

  <!-- QR Code Container -->
  <rect x="630" y="830" width="90" height="90" fill="#ffffff" stroke="#d4d4d2"/>
  ${qrSvg}
</svg>
`;
    }
    /**
     * Generates a complete standalone HTML page wrapping the personalized vector poster
     */
    generatePersonalizedPosterHtml(briefing, stamp) {
        const svg = this.generatePersonalizedPosterSvg(briefing, stamp);
        const resolved = resolveAgentBranding(stamp);
        return `<!DOCTYPE html>
<html lang="zh-HK">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(resolved.agent_name)} - InsurIntel HK 早會市場情報海報</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #e2e8f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .poster-container {
      background: #fafaf8;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border-radius: 8px;
      overflow: hidden;
      max-width: 800px;
      width: 100%;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .poster-container { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="poster-container">
    ${svg}
  </div>
</body>
</html>`;
    }
}
exports.ViralTeamCommsEngine = ViralTeamCommsEngine;

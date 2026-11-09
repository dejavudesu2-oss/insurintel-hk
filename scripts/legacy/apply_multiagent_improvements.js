/**
 * scripts/apply_multiagent_improvements.js
 * Applies the Multi-Agent Review Council findings to scripts/build_mobile_cafe.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'build_mobile_cafe.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Replace selectGN16Tier and simulateGN16Checkout
const oldJsTarget = 'function selectGN16Tier(tier) {';
const newJs = `function selectGN16Tier(tier) {
      currentGN16Tier = tier;
      if (typeof document === 'undefined') return;
      const cardRetail = document.getElementById('gn16-tier-retail');
      const cardAgent = document.getElementById('gn16-tier-agent');
      const cardTeam = document.getElementById('gn16-tier-team');
      const cardEnterprise = document.getElementById('gn16-tier-enterprise');
      const form = document.getElementById('gn16-agent-profile-form');

      if (cardRetail) cardRetail.classList.toggle('active', tier === 'retail_49');
      if (cardAgent) cardAgent.classList.toggle('active', tier === 'agent_199');
      if (cardTeam) cardTeam.classList.toggle('active', tier === 'team_2480');
      if (cardEnterprise) cardEnterprise.classList.toggle('active', tier === 'enterprise_12800');

      if (tier === 'retail_49') {
        if (form && form.style) form.style.display = 'none';
      } else {
        if (form && form.style) form.style.display = 'block';
      }
    }
    window.selectGN16Tier = selectGN16Tier;

    function simulateGN16Checkout() {
      closeGN16PayModal();
      if (currentGN16Tier === 'enterprise_12800') {
        isGN16AgentUnlocked = true;
        if (typeof alert !== 'undefined') {
          alert('🎉 感謝垂詢！企業獨立經紀行 / 家辦總部版 (HK$12,800/月) 專屬客戶成功總監將於 15 分鐘內與您聯繫，為您配置私有化白標 API 與全員無限制席位！');
        }
      } else if (currentGN16Tier === 'team_2480') {
        isGN16AgentUnlocked = true;
        if (typeof alert !== 'undefined') {
          alert('🎉 恭喜總監！區域總監團隊版 (HK$2,480/月) 已成功開通！已解鎖 20 個專屬顧問席位、每日早會情報投影片與團隊專屬 Logo！');
        }
      } else if (currentGN16Tier === 'agent_199') {
        isGN16AgentUnlocked = true;
        if (typeof alert !== 'undefined') {
          alert('🎉 恭喜！顧問展業版 (HK$199/月) 已成功開通！已自動消除所有水印，並在所有報告頁底附帶您的數碼顧問名片與執業牌照！');
        }
      } else {
        isGN16AgentUnlocked = false;
        if (typeof alert !== 'undefined') {
          alert('🎉 支付成功！已解鎖單份香港保單深度 GN16 對賬報告！報告已加蓋「InsurIntel HK 官方認證對賬 · 投保人私人存檔」官方防偽標記。');
        }
      }
      updateGN16DisplayTier();
    }`;

const sIdx = code.indexOf(oldJsTarget);
let eIdx = code.indexOf('updateGN16DisplayTier();', sIdx);
if (sIdx !== -1 && eIdx !== -1) {
  eIdx = code.indexOf('}', eIdx) + 1;
  code = code.substring(0, sIdx) + newJs + code.substring(eIdx);
  console.log('[Multi-Agent Patch] Successfully replaced selectGN16Tier & simulateGN16Checkout');
} else {
  console.error('[Multi-Agent Patch] Error: could not locate JS block');
}

// 2. Add Team & Enterprise HTML cards into payment modal if not already present
if (!code.includes('id="gn16-tier-team"')) {
  const cardAgentTarget = 'id="gn16-tier-agent"';
  const cardEndTarget = '</div>\n      </div>'; // End of the tier grid
  const teamAndEnterpriseHtml = `
        <!-- Option 3: HK$2,480 Agency Team -->
        <div class="gn16-tier-card active" id="gn16-tier-team" onclick="selectGN16Tier('team_2480')" style="border-color:#7c3aed;background:#faf5ff;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12.5px;font-weight:800;color:#5b21b6;">🏢 區域總監團隊版</span>
            <span style="font-size:17px;font-weight:900;color:#7c3aed;">HK$2,480 <span style="font-size:10px;font-weight:500;color:#64748b;">/ 月</span></span>
          </div>
          <div style="font-size:10.5px;color:#7c3aed;font-weight:700;margin-bottom:8px;">👑 區域總監早會增員首選 (包20席位)</div>
          <ul style="font-size:11px;color:#334155;line-height:1.55;padding-left:14px;margin:0;">
            <li><strong>包含 20 個獨立顧問執業席位</strong> (平均 $124/人)</li>
            <li><strong>每日 06:30 自動同步晨會早會情報投影片</strong></li>
            <li>自訂團隊專屬 District Logo 與權威機構名片</li>
            <li>區域成單話術庫與早會路演培訓支持</li>
          </ul>
        </div>
        <!-- Option 4: HK$12,800 Enterprise IFA / Family Office -->
        <div class="gn16-tier-card" id="gn16-tier-enterprise" onclick="selectGN16Tier('enterprise_12800')" style="border-color:#0f766e;background:#f0fdfa;grid-column:1 / -1;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:12.5px;font-weight:800;color:#115e59;">🏛️ 企業獨立經紀行 / 家族辦公室總部版</span>
            <span style="font-size:17px;font-weight:900;color:#0f766e;">HK$12,800 <span style="font-size:10px;font-weight:500;color:#64748b;">/ 月 (年繳 HK$128,000)</span></span>
          </div>
          <div style="font-size:10.5px;color:#0f766e;font-weight:700;margin-bottom:8px;">💎 全員無限席位 · 私有化白標 API · CRM 雙向串接 · 合規留痕審計</div>
          <ul style="font-size:11px;color:#334155;line-height:1.55;padding-left:14px;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:4px;">
            <li>全經紀行全員無限制顧問執業席位</li>
            <li>私有化專屬二級域名與獨立品牌白標</li>
            <li>全功能 RESTful 精算 API 與 Webhook</li>
            <li>雙向對接 Salesforce / HubSpot CRM</li>
            <li>保監局 GL20 / GN16 內部審計留痕日誌</li>
            <li>專屬客戶成功經理與 99.9% 企業 SLA 支持</li>
          </ul>
        </div>`;
  
  const gridEndIdx = code.indexOf('<!-- Agent Profile Form');
  if (gridEndIdx !== -1) {
    const lastClosingDiv = code.lastIndexOf('</div>', gridEndIdx);
    code = code.substring(0, lastClosingDiv) + teamAndEnterpriseHtml + '\n      </div>\n\n' + code.substring(gridEndIdx);
    console.log('[Multi-Agent Patch] Injected Team and Enterprise Tier Cards');
  }
}

// 3. Sanitize client view combat terminology
code = code.split('精算參數擂台').join('雙方方案核心精算指標客觀對照');
code = code.split('條款細則照妖鏡').join('合約條款重要細則客觀披露');
code = code.split('宣傳噱頭').join('市場宣傳重點摘要');

fs.writeFileSync(filePath, code, 'utf8');
console.log('[Multi-Agent Patch] Updated scripts/build_mobile_cafe.js successfully');

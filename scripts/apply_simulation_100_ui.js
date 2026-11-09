/**
 * scripts/apply_simulation_100_ui.js
 * Enhances scripts/build_mobile_cafe.js with complete interactive UI for the
 * 100 Daily Real-World Scenarios Simulation & Multi-Agent Commercial Pricing Review.
 */

const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'build_mobile_cafe.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Add require for daily100Scenarios if not present
if (!code.includes("const daily100Scenarios = require('../src/data/daily_100_scenarios.json');")) {
  code = code.replace(
    "const gn16Database = require('../src/data/gn16_database.json');",
    "const gn16Database = require('../src/data/gn16_database.json');\nconst daily100Scenarios = require('../src/data/daily_100_scenarios.json');"
  );
  console.log('[1/7] Injected require for daily100Scenarios');
}

// 2. Add CSS styles for simulation UI
const simulationCss = `
    /* 100 Daily Scenarios & Multi-Agent Simulation Styles */
    .app-nav-btn.simulation-btn {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
      border: 1px solid #fbcfe8;
      color: #be185d;
      font-weight: 700;
    }
    .app-nav-btn.simulation-btn:hover {
      background: #be185d;
      color: #ffffff;
    }
    .simulation-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: none;
    }
    .simulation-modal-backdrop.open { display: block; }
    .simulation-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: 95%;
      max-width: 900px;
      max-height: 90vh;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s ease;
    }
    .simulation-modal.open {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, -50%) scale(1);
    }
    .simulation-modal-header {
      background: linear-gradient(135deg, #be185d 0%, #831843 100%);
      color: #ffffff;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .simulation-modal-body {
      padding: 16px 20px;
      overflow-y: auto;
      flex: 1;
      background: #f8fafc;
    }
    .sim-stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .sim-stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .sim-stat-val {
      font-size: 16px;
      font-weight: 900;
      color: #be185d;
      font-family: 'JetBrains Mono', monospace;
    }
    .sim-stat-lbl {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .sim-filter-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 8px;
      margin-bottom: 12px;
      scrollbar-width: thin;
    }
    .sim-filter-chip {
      padding: 5px 11px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #334155;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .sim-filter-chip.active {
      background: #be185d;
      border-color: #be185d;
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(190, 24, 93, 0.25);
    }
    .sim-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      transition: all 0.15s ease;
    }
    .sim-card:hover {
      border-color: #f472b6;
      box-shadow: 0 4px 12px rgba(190, 24, 93, 0.08);
    }
    .sim-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 8px;
    }
    .sim-badge-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      color: #be185d;
      background: #fdf2f8;
      border: 1px solid #fbcfe8;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .sim-badge-tier {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .sim-badge-tier.Retail_HKD49 { background: #e0f2fe; color: #0369a1; }
    .sim-badge-tier.AdvisorPro_HKD199 { background: #dcfce7; color: #15803d; }
    .sim-badge-tier.AgencyTeam_HKD2480 { background: #faf5ff; color: #7e22ce; }
    .sim-badge-tier.Enterprise_HKD12800 { background: #fff7ed; color: #c2410c; }
    .sim-comments-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }
    @media (max-width: 640px) {
      .sim-stats-bar { grid-template-columns: 1fr 1fr; }
      .sim-comments-grid { grid-template-columns: 1fr; }
    }
    .sim-agent-row {
      font-size: 11px;
      line-height: 1.45;
      color: #334155;
    }
    .sim-agent-name {
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .sim-score-pill {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 10.5px;
      padding: 1px 5px;
      border-radius: 3px;
      margin-left: 4px;
    }
    .sim-score-pill.high { background: #dcfce7; color: #166534; }
    .sim-score-pill.mid { background: #fef9c3; color: #854d0e; }
`;

if (!code.includes('.app-nav-btn.simulation-btn')) {
  code = code.replace(
    '/* GN16 Fulfillment Tracker & Monetization Styles */',
    `${simulationCss}\n    /* GN16 Fulfillment Tracker & Monetization Styles */`
  );
  console.log('[2/7] Injected Simulation CSS styles');
}

// 3. Add Header Button
if (!code.includes('id="btn-open-simulation-modal"')) {
  code = code.replace(
    '<a href="morning_slides.html" class="top-nav-slides-btn"',
    `<button class="app-nav-btn simulation-btn" id="btn-open-simulation-modal" onclick="openSimulationModal()" title="100大真實展業場景與多維AI代理模擬評審">
          <span class="btn-emoji">💯</span>
          <span class="btn-txt">100場景模擬</span>
        </button>
        <a href="morning_slides.html" class="top-nav-slides-btn"`
  );
  console.log('[3/7] Injected Simulation Header Nav Button');
}

// 4. Add Tab in scenario-agents-tabs
if (!code.includes('id="tab-scenario-simulation-100"')) {
  code = code.replace(
    '<button class="scenario-tab-btn" data-scenario="group_medical" id="tab-scenario-group-medical" onclick="selectScenarioAgent(\'group_medical\')">🏥 團險自願醫保抵扣</button>',
    `<button class="scenario-tab-btn" data-scenario="group_medical" id="tab-scenario-group-medical" onclick="selectScenarioAgent('group_medical')">🏥 團險自願醫保抵扣</button>
      <button class="scenario-tab-btn" data-scenario="simulation_100" id="tab-scenario-simulation-100" onclick="selectScenarioAgent('simulation_100')">💯 100場景模擬與定價</button>`
  );
  console.log('[4/7] Injected Simulation Tab Button in Scenario Bar');
}

// 5. Add to SCENARIO_NAMES and DAILY_100_SCENARIOS definition
if (!code.includes('simulation_100:')) {
  code = code.replace(
    "offline_resilience: '📴 無網/地庫離線'",
    "offline_resilience: '📴 無網/地庫離線',\n      simulation_100: '💯 100場景模擬與定價'"
  );
  console.log('[5/7] Added simulation_100 to SCENARIO_NAMES');
}

if (!code.includes('DAILY_100_SCENARIOS =')) {
  code = code.replace(
    '// 30-Point Client & Advisor Improvement Comments',
    `// 100 Real-World Daily Scenarios & Multi-Agent Simulation
    const DAILY_100_SCENARIOS = \${JSON.stringify(daily100Scenarios)};
    window.DAILY_100_SCENARIOS = DAILY_100_SCENARIOS;

    // 30-Point Client & Advisor Improvement Comments`
  );
  console.log('[5b/7] Embedded DAILY_100_SCENARIOS dataset');
}

// 6. Add renderScenarioAgentPanel branch for simulation_100
const simulationInlineBranch = `} else if (currentScenario === 'simulation_100') {
        html = renderSimulation100InlinePanelHtml();
      }`;

if (!code.includes("currentScenario === 'simulation_100'")) {
  code = code.replace(
    "} else if (currentScenario === 'offline_resilience') {",
    `${simulationInlineBranch} else if (currentScenario === 'offline_resilience') {`
  );
  console.log('[6/7] Added renderScenarioAgentPanel simulation_100 branch');
}

// 7. Client JS Functions
const simulationJsFunctions = `
    // -------------------------------------------------------------
    // 100 Real-World Daily Scenarios Simulation Logic
    // -------------------------------------------------------------
    let simFilterDomain = 'all';
    let simFilterTier = 'all';
    let simSearchQuery = '';

    function openSimulationModal() {
      const modal = document.getElementById('simulation-modal');
      const backdrop = document.getElementById('simulation-modal-backdrop');
      if (modal && backdrop) {
        modal.classList.add('open');
        backdrop.classList.add('open');
        renderSimulationCardsList('modal-sim-cards-list');
      }
    }
    window.openSimulationModal = openSimulationModal;

    function closeSimulationModal() {
      const modal = document.getElementById('simulation-modal');
      const backdrop = document.getElementById('simulation-modal-backdrop');
      if (modal && backdrop) {
        modal.classList.remove('open');
        backdrop.classList.remove('open');
      }
    }
    window.closeSimulationModal = closeSimulationModal;

    function filterSimDomain(dom) {
      simFilterDomain = dom;
      document.querySelectorAll('.sim-domain-chip').forEach(function(el) {
        el.classList.toggle('active', el.getAttribute('data-domain') === dom);
      });
      renderSimulationCardsList('modal-sim-cards-list');
      renderSimulationCardsList('inline-sim-cards-list');
    }
    window.filterSimDomain = filterSimDomain;

    function filterSimTier(tier) {
      simFilterTier = tier;
      document.querySelectorAll('.sim-tier-chip').forEach(function(el) {
        el.classList.toggle('active', el.getAttribute('data-tier') === tier);
      });
      renderSimulationCardsList('modal-sim-cards-list');
      renderSimulationCardsList('inline-sim-cards-list');
    }
    window.filterSimTier = filterSimTier;

    function onSimSearchInput(val) {
      simSearchQuery = (val || '').toLowerCase().trim();
      renderSimulationCardsList('modal-sim-cards-list');
      renderSimulationCardsList('inline-sim-cards-list');
    }
    window.onSimSearchInput = onSimSearchInput;

    function toggleSimCardDetails(scId) {
      const el = document.getElementById('sim-details-' + scId);
      if (el) {
        const isOpen = el.style.display !== 'none';
        el.style.display = isOpen ? 'none' : 'block';
      }
    }
    window.toggleSimCardDetails = toggleSimCardDetails;

    function renderSimulationCardsList(containerId) {
      const container = document.getElementById(containerId);
      if (!container || typeof DAILY_100_SCENARIOS === 'undefined') return;

      const filtered = DAILY_100_SCENARIOS.filter(function(sc) {
        if (simFilterDomain !== 'all' && sc.domain !== simFilterDomain) return false;
        if (simFilterTier !== 'all' && sc.commercialTierRelevance !== simFilterTier) return false;
        if (simSearchQuery) {
          const hay = (sc.id + ' ' + sc.title + ' ' + sc.domainZh + ' ' + sc.location + ' ' + sc.involvedInsurers.join(' ') + ' ' + sc.involvedProducts.join(' ')).toLowerCase();
          if (!hay.includes(simSearchQuery)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:12px;">無符合篩選條件的場景</div>';
        return;
      }

      container.innerHTML = filtered.map(function(sc) {
        const c = sc.comments;
        const v = sc.consensusVerdict;
        return '<div class="sim-card" id="sim-card-' + sc.id + '">' +
          '<div class="sim-card-header">' +
            '<div>' +
              '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">' +
                '<span class="sim-badge-id">[' + sc.id + ']</span>' +
                '<span style="font-size:10px;color:#64748b;font-weight:600;">#' + sc.scenarioNumber + ' · ' + sc.domainZh + '</span>' +
                '<span class="sim-badge-tier ' + sc.commercialTierRelevance + '">HK$ ' + sc.targetTierPriceHKD + '</span>' +
              '</div>' +
              '<div style="font-size:13px;font-weight:800;color:#0f172a;line-height:1.4;">' + sc.title + '</div>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<span class="sim-score-pill ' + (v.averageScore >= 8.5 ? 'high' : 'mid') + '">' + v.averageScore + ' / 10</span>' +
              '<div style="font-size:9.5px;color:#64748b;margin-top:2px;">' + v.overallViability + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:11px;color:#475569;margin-bottom:6px;line-height:1.45;">' +
            '📍 <strong>' + sc.location + '</strong> · 👤 ' + sc.clientPersona + '<br>' +
            '⚔️ <strong>保司與方案：</strong>' + sc.involvedInsurers.join(', ') + ' (' + sc.involvedProducts.join(' vs ') + ')' +
          '</div>' +
          '<div style="font-size:11px;color:#0369a1;background:#f0f9ff;border-left:3px solid #0284c7;padding:5px 8px;border-radius:4px;margin-bottom:8px;">' +
            '⚡ <strong>核心抗辯：</strong>' + sc.coreConfrontationOrChallenge +
          '</div>' +
          '<button class="sim-toggle-btn" style="background:#fdf2f8;border:1px solid #fbcfe8;color:#be185d;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;width:100%;text-align:center;" onclick="toggleSimCardDetails(\\'' + sc.id + '\\')">' +
            '🤖 展開/收起 6 大 AI 代理評審反饋與異議化解策略 ▾' +
          '</button>' +
          '<div class="sim-card-details" id="sim-details-' + sc.id + '" style="display:none;margin-top:8px;">' +
            '<div class="sim-comments-grid">' +
              '<div class="sim-agent-row">' +
                '<span class="sim-agent-name">⚖️ ' + c.actuaryAuditor.agentPersonaZh + ':</span>' +
                '<span class="sim-score-pill ' + (c.actuaryAuditor.scoreOutOf10 >= 8 ? 'high' : 'mid') + '">' + c.actuaryAuditor.scoreOutOf10 + '分</span><br>' +
                c.actuaryAuditor.critique +
              '</div>' +
              '<div class="sim-agent-row">' +
                '<span class="sim-agent-name">🚀 ' + c.topProducer.agentPersonaZh + ':</span>' +
                '<span class="sim-score-pill ' + (c.topProducer.scoreOutOf10 >= 8 ? 'high' : 'mid') + '">' + c.topProducer.scoreOutOf10 + '分</span> (付費意願: <strong>' + c.topProducer.willingnessToPay + '</strong>)<br>' +
                c.topProducer.critique +
              '</div>' +
              '<div class="sim-agent-row">' +
                '<span class="sim-agent-name">👔 ' + c.districtDirector.agentPersonaZh + ':</span>' +
                '<span class="sim-score-pill ' + (c.districtDirector.scoreOutOf10 >= 8 ? 'high' : 'mid') + '">' + c.districtDirector.scoreOutOf10 + '分</span><br>' +
                c.districtDirector.critique +
              '</div>' +
              '<div class="sim-agent-row">' +
                '<span class="sim-agent-name">🛡️ ' + c.policyholder.agentPersonaZh + ':</span>' +
                '<span class="sim-score-pill ' + (c.policyholder.scoreOutOf10 >= 8 ? 'high' : 'mid') + '">' + c.policyholder.scoreOutOf10 + '分</span> (信任分: <strong>' + c.policyholder.trustScore + '/10</strong>)<br>' +
                c.policyholder.critique +
              '</div>' +
              '<div class="sim-agent-row">' +
                '<span class="sim-agent-name">📜 ' + c.complianceOfficer.agentPersonaZh + ':</span>' +
                '<span class="sim-score-pill ' + (c.complianceOfficer.scoreOutOf10 >= 8 ? 'high' : 'mid') + '">' + c.complianceOfficer.scoreOutOf10 + '分</span> (風險: <strong>' + c.complianceOfficer.complianceRiskLevel + '</strong>)<br>' +
                c.complianceOfficer.critique +
              '</div>' +
              '<div class="sim-agent-row">' +
                '<span class="sim-agent-name">💡 ' + c.pricingPM.agentPersonaZh + ':</span>' +
                '<span class="sim-score-pill ' + (c.pricingPM.scoreOutOf10 >= 8 ? 'high' : 'mid') + '">' + c.pricingPM.scoreOutOf10 + '分</span> (建議: <strong>' + c.pricingPM.recommendedTier + '</strong>)<br>' +
                c.pricingPM.critique +
              '</div>' +
            '</div>' +
            '<div style="margin-top:8px;background:#ecfdf5;border:1px solid #a7f3d0;padding:8px 10px;border-radius:6px;font-size:11px;color:#065f46;line-height:1.45;">' +
              '🎯 <strong>共識異議化解策略：</strong>' + v.primaryObjection + '<br>' +
              '💡 <strong>定價與產品建議：</strong>' + v.pricingOptimizationStrategy +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function renderSimulation100InlinePanelHtml() {
      return '<div class="scenario-card-box" id="panel-scenario-simulation-100">' +
        '<div class="scenario-head" style="margin-bottom:12px;">' +
          '<div>' +
            '<div class="scenario-title" style="color:#be185d;">💯 香港保險 100 場真實展業場景多維 AI 代理模擬</div>' +
            '<div class="scenario-subtitle">覆蓋 10 大核心業務領域 · 6 大 AI 代理評審計分卡 · 4 階商業定價收費梯隊</div>' +
          '</div>' +
          '<button class="scenario-action-btn primary-btn" onclick="openSimulationModal()" style="padding:6px 14px;font-size:11px;">🔍 全屏檢視</button>' +
        '</div>' +
        '<div class="sim-stats-bar">' +
          '<div class="sim-stat-card"><div class="sim-stat-val">100</div><div class="sim-stat-lbl">真實業務場景</div></div>' +
          '<div class="sim-stat-card"><div class="sim-stat-val">8.77</div><div class="sim-stat-lbl">AI 代理均分 (10分制)</div></div>' +
          '<div class="sim-stat-card"><div class="sim-stat-val">6 角色</div><div class="sim-stat-lbl">精算/頂尖/DD/客/合規/PM</div></div>' +
          '<div class="sim-stat-card"><div class="sim-stat-val">4 梯隊</div><div class="sim-stat-lbl">$49 ~ $12,800 定價</div></div>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
          '<input type="text" placeholder="🔍 快速搜尋場景、保司 (AIA, 保誠, 宏利...)、產品、地點或挑戰..." style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:11.5px;" oninput="onSimSearchInput(this.value)" />' +
        '</div>' +
        '<div class="sim-filter-scroll">' +
          '<button class="sim-filter-chip sim-domain-chip active" data-domain="all" onclick="filterSimDomain(\\'all\\')">全部領域 (100)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Coffee_Shop_Rapid_Pitches" onclick="filterSimDomain(\\'Coffee_Shop_Rapid_Pitches\\')">☕ 咖啡館極速 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Cross_Border_MCV_Inbound" onclick="filterSimDomain(\\'Cross_Border_MCV_Inbound\\')">🇨🇳 MCV 訪港 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="High_Net_Worth_Wealth_Preservation" onclick="filterSimDomain(\\'High_Net_Worth_Wealth_Preservation\\')">🏛️ 家辦傳承 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Critical_Illness_Defense" onclick="filterSimDomain(\\'Critical_Illness_Defense\\')">🛡️ 重疾穿透 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Private_Hospital_Cashless_LOG" onclick="filterSimDomain(\\'Private_Hospital_Cashless_LOG\\')">🏥 私院直付 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="District_Morning_Briefings" onclick="filterSimDomain(\\'District_Morning_Briefings\\')">👔 區域晨會 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Retirement_QDAP_Tax_Relief" onclick="filterSimDomain(\\'Retirement_QDAP_Tax_Relief\\')">👴 年金扣稅 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Regulatory_Audits_Compliance" onclick="filterSimDomain(\\'Regulatory_Audits_Compliance\\')">📜 合規審計 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Macro_Economic_Stress_Testing" onclick="filterSimDomain(\\'Macro_Economic_Stress_Testing\\')">📉 宏觀壓力 (10)</button>' +
          '<button class="sim-filter-chip sim-domain-chip" data-domain="Commercial_SaaS_Pricing_Decisions" onclick="filterSimDomain(\\'Commercial_SaaS_Pricing_Decisions\\')">💡 SaaS定價 (10)</button>' +
        '</div>' +
        '<div class="sim-filter-scroll" style="margin-top:-4px;">' +
          '<button class="sim-filter-chip sim-tier-chip active" data-tier="all" onclick="filterSimTier(\\'all\\')">全部收費梯隊</button>' +
          '<button class="sim-filter-chip sim-tier-chip" data-tier="Retail_HKD49" onclick="filterSimTier(\\'Retail_HKD49\\')">🏷️ 零售查核 HK$49 (單次保單對賬)</button>' +
          '<button class="sim-filter-chip sim-tier-chip" data-tier="AdvisorPro_HKD199" onclick="filterSimTier(\\'AdvisorPro_HKD199\\')">💼 顧問專業 HK$199/月 (個人名片+無水印)</button>' +
          '<button class="sim-filter-chip sim-tier-chip" data-tier="AgencyTeam_HKD2480" onclick="filterSimTier(\\'AgencyTeam_HKD2480\\')">🏢 區域團隊 HK$2,480/月 (20席+晨會同步)</button>' +
          '<button class="sim-filter-chip sim-tier-chip" data-tier="Enterprise_HKD12800" onclick="filterSimTier(\\'Enterprise_HKD12800\\')">🏦 企業經紀 HK$12,800/月 (白標API+CRM)</button>' +
        '</div>' +
        '<div id="inline-sim-cards-list">' +
          '<!-- Populated by renderSimulationCardsList -->' +
        '</div>' +
      '</div>';
    }
    window.renderSimulation100InlinePanelHtml = renderSimulation100InlinePanelHtml;
    window.renderSimulationCardsList = renderSimulationCardsList;

    // Auto-render inline cards when tab is clicked
    setTimeout(function() {
      if (typeof renderSimulationCardsList === 'function') {
        renderSimulationCardsList('inline-sim-cards-list');
      }
    }, 100);
`;

if (!code.includes('openSimulationModal')) {
  code = code.replace(
    '// 7. 100-Point Audit Drawer Functions',
    `${simulationJsFunctions}\n    // 7. 100-Point Audit Drawer Functions`
  );
  console.log('[7/7] Injected Simulation JS functions');
}

// 8. Add Simulation Modal HTML before </body></html>
const simulationModalHtml = `
  <!-- 100 Real-World Daily Scenarios Simulation Modal -->
  <div class="simulation-modal-backdrop" id="simulation-modal-backdrop" onclick="closeSimulationModal()"></div>
  <div class="simulation-modal" id="simulation-modal" role="dialog" aria-modal="true" aria-labelledby="sim-modal-heading">
    <div class="simulation-modal-header">
      <div>
        <div style="font-size:15px;font-weight:900;" id="sim-modal-heading">💯 香港保險 100 場真實日常展業多維 AI 代理模擬評審</div>
        <div style="font-size:11px;opacity:0.9;margin-top:2px;">覆蓋 10 大核心業務領域 · 6 大 AI 代理評審計分卡 · 4 階商業定價收費梯隊</div>
      </div>
      <button class="drawer-close-btn" onclick="closeSimulationModal()" aria-label="關閉模擬視窗" style="color:#ffffff;background:rgba(255,255,255,0.2);border:none;border-radius:6px;padding:4px 8px;cursor:pointer;">✕</button>
    </div>
    <div class="simulation-modal-body">
      <div class="sim-stats-bar">
        <div class="sim-stat-card"><div class="sim-stat-val">100</div><div class="sim-stat-lbl">真實業務場景</div></div>
        <div class="sim-stat-card"><div class="sim-stat-val">8.77 / 10</div><div class="sim-stat-lbl">AI 代理均分 (卓越)</div></div>
        <div class="sim-stat-card"><div class="sim-stat-val">6 角色</div><div class="sim-stat-lbl">精算/頂尖/DD/客/合規/PM</div></div>
        <div class="sim-stat-card"><div class="sim-stat-val">4 梯隊</div><div class="sim-stat-lbl">$49 ~ $12,800 定價</div></div>
      </div>
      <div style="margin-bottom:10px;">
        <input type="text" placeholder="🔍 快速搜尋場景、保司、產品、地點或核心挑戰..." style="width:100%;padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:11.5px;" oninput="onSimSearchInput(this.value)" />
      </div>
      <div class="sim-filter-scroll">
        <button class="sim-filter-chip sim-domain-chip active" data-domain="all" onclick="filterSimDomain('all')">全部領域 (100)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Coffee_Shop_Rapid_Pitches" onclick="filterSimDomain('Coffee_Shop_Rapid_Pitches')">☕ 咖啡館極速 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Cross_Border_MCV_Inbound" onclick="filterSimDomain('Cross_Border_MCV_Inbound')">🇨🇳 MCV 訪港 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="High_Net_Worth_Wealth_Preservation" onclick="filterSimDomain('High_Net_Worth_Wealth_Preservation')">🏛️ 家辦傳承 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Critical_Illness_Defense" onclick="filterSimDomain('Critical_Illness_Defense')">🛡️ 重疾穿透 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Private_Hospital_Cashless_LOG" onclick="filterSimDomain('Private_Hospital_Cashless_LOG')">🏥 私院直付 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="District_Morning_Briefings" onclick="filterSimDomain('District_Morning_Briefings')">👔 區域晨會 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Retirement_QDAP_Tax_Relief" onclick="filterSimDomain('Retirement_QDAP_Tax_Relief')">👴 年金扣稅 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Regulatory_Audits_Compliance" onclick="filterSimDomain('Regulatory_Audits_Compliance')">📜 合規審計 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Macro_Economic_Stress_Testing" onclick="filterSimDomain('Macro_Economic_Stress_Testing')">📉 宏觀壓力 (10)</button>
        <button class="sim-filter-chip sim-domain-chip" data-domain="Commercial_SaaS_Pricing_Decisions" onclick="filterSimDomain('Commercial_SaaS_Pricing_Decisions')">💡 SaaS定價 (10)</button>
      </div>
      <div class="sim-filter-scroll" style="margin-top:-4px;">
        <button class="sim-filter-chip sim-tier-chip active" data-tier="all" onclick="filterSimTier('all')">全部收費梯隊</button>
        <button class="sim-filter-chip sim-tier-chip" data-tier="Retail_HKD49" onclick="filterSimTier('Retail_HKD49')">🏷️ 零售查核 HK$49 (單次保單對賬)</button>
        <button class="sim-filter-chip sim-tier-chip" data-tier="AdvisorPro_HKD199" onclick="filterSimTier('AdvisorPro_HKD199')">💼 顧問專業 HK$199/月 (個人名片+無水印)</button>
        <button class="sim-filter-chip sim-tier-chip" data-tier="AgencyTeam_HKD2480" onclick="filterSimTier('AgencyTeam_HKD2480')">🏢 區域團隊 HK$2,480/月 (20席+晨會同步)</button>
        <button class="sim-filter-chip sim-tier-chip" data-tier="Enterprise_HKD12800" onclick="filterSimTier('Enterprise_HKD12800')">🏦 企業經紀 HK$12,800/月 (白標API+CRM)</button>
      </div>
      <div id="modal-sim-cards-list">
        <!-- Rendered dynamically by renderSimulationCardsList -->
      </div>
    </div>
  </div>
`;

if (!code.includes('id="simulation-modal"')) {
  if (code.includes('</body>\r\n</html>')) {
    code = code.replace(
      '</body>\r\n</html>',
      `${simulationModalHtml}\n</body>\r\n</html>`
    );
  } else {
    code = code.replace(
      '</body>\n</html>',
      `${simulationModalHtml}\n</body>\n</html>`
    );
  }
  console.log('[8/8] Injected Simulation Modal HTML before </body></html>');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('[SUCCESS] Applied complete 100-scenario simulation UI to scripts/build_mobile_cafe.js!');

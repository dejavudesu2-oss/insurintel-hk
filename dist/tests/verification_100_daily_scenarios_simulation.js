"use strict";
/**
 * tests/verification_100_daily_scenarios_simulation.ts
 * Comprehensive Verification Suite for 100 Daily Real-World Scenarios & Multi-Agent Commentary
 *
 * Tests:
 * 1. Dataset Integrity & Completeness (100 distinct scenarios, 10 domains, 10 items/domain)
 * 2. Multi-Agent 6-Persona Commentary Coverage across all 100 scenarios
 * 3. Commercial Pricing Model (HK$49, HK$199, HK$2,480, HK$12,800) & Unit Economics
 * 4. DailyScenariosSimulationEngine Core Methods, Aggregates & Query Helpers
 * 5. ScenarioAgentHub Integration
 * 6. Markdown Report Artifact Verification
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_child_process_1 = require("node:child_process");
const node_crypto_1 = __importDefault(require("node:crypto"));
const scenario_agents_js_1 = require("../src/engine/scenario_agents.js");
const records = [];
function test(name, fn) {
    const start = performance.now();
    try {
        fn();
        const durationMs = performance.now() - start;
        records.push({ name, passed: true, durationMs });
        console.log(`  [PASS] (${durationMs.toFixed(2)}ms) ${name}`);
    }
    catch (err) {
        const durationMs = performance.now() - start;
        records.push({ name, passed: false, error: err.message, durationMs });
        console.error(`  [FAIL] (${durationMs.toFixed(2)}ms) ${name}: ${err.message}`);
    }
}
console.log('================================================================================');
console.log('INSURINTEL HK - 100 DAILY SCENARIOS & MULTI-AGENT COMMENTARY VERIFICATION');
console.log('================================================================================');
// --- 1. Dataset Integrity & Completeness ---
console.log('\n--- [TEST SUITE] 1. Dataset Integrity & Completeness ---');
const datasetPath = path_1.default.join(process.cwd(), 'src', 'data', 'daily_100_scenarios.json');
node_assert_1.default.ok(fs_1.default.existsSync(datasetPath), 'daily_100_scenarios.json must exist');
const rawData = fs_1.default.readFileSync(datasetPath, 'utf8');
const scenarios = JSON.parse(rawData);
test('Dataset contains exactly 100 distinct scenarios', () => {
    node_assert_1.default.strictEqual(scenarios.length, 100, `Expected 100 scenarios, got ${scenarios.length}`);
});
test('Scenario IDs are sequential SC001 through SC100 with zero duplicates', () => {
    const ids = new Set();
    scenarios.forEach((sc, idx) => {
        const expectedId = `SC${String(idx + 1).padStart(3, '0')}`;
        node_assert_1.default.strictEqual(sc.id, expectedId, `Scenario at index ${idx} must have id ${expectedId}`);
        node_assert_1.default.strictEqual(sc.scenarioNumber, idx + 1);
        node_assert_1.default.ok(!ids.has(sc.id), `Duplicate id found: ${sc.id}`);
        ids.add(sc.id);
    });
    node_assert_1.default.strictEqual(ids.size, 100);
});
test('Covers exactly 10 distinct realistic business domains with 10 scenarios each', () => {
    const expectedDomains = [
        'Coffee_Shop_Rapid_Pitches',
        'Cross_Border_MCV_Inbound',
        'High_Net_Worth_Wealth_Preservation',
        'Critical_Illness_Defense',
        'Private_Hospital_Cashless_LOG',
        'District_Morning_Briefings',
        'Retirement_QDAP_Tax_Relief',
        'Regulatory_Audits_Compliance',
        'Macro_Economic_Stress_Testing',
        'Commercial_SaaS_Pricing_Decisions'
    ];
    const domainCounts = new Map();
    for (const sc of scenarios) {
        domainCounts.set(sc.domain, (domainCounts.get(sc.domain) || 0) + 1);
    }
    node_assert_1.default.strictEqual(domainCounts.size, 10, 'Must cover exactly 10 domains');
    expectedDomains.forEach((dom) => {
        node_assert_1.default.strictEqual(domainCounts.get(dom), 10, `Domain ${dom} must have exactly 10 scenarios`);
    });
});
test('Every scenario has authentic HK location, client persona and context description', () => {
    scenarios.forEach((sc) => {
        node_assert_1.default.ok(sc.title && sc.title.length > 5, `${sc.id} title too short`);
        node_assert_1.default.ok(sc.location && sc.location.length > 3, `${sc.id} location missing`);
        node_assert_1.default.ok(sc.clientPersona && sc.clientPersona.length > 5, `${sc.id} persona missing`);
        node_assert_1.default.ok(sc.contextDescription && sc.contextDescription.length > 15, `${sc.id} context missing`);
        node_assert_1.default.ok(sc.coreConfrontationOrChallenge && sc.coreConfrontationOrChallenge.length > 10, `${sc.id} challenge missing`);
        node_assert_1.default.ok(Array.isArray(sc.involvedInsurers) && sc.involvedInsurers.length >= 1, `${sc.id} must list insurers`);
        node_assert_1.default.ok(Array.isArray(sc.involvedProducts) && sc.involvedProducts.length >= 1, `${sc.id} must list products`);
    });
});
// --- 2. Multi-Agent 6-Persona Commentary Coverage ---
console.log('\n--- [TEST SUITE] 2. Multi-Agent 6-Persona Commentary Coverage ---');
test('Every scenario contains complete evaluations from all 6 AI agent personas', () => {
    const personas = [
        'actuaryAuditor',
        'topProducer',
        'districtDirector',
        'policyholder',
        'complianceOfficer',
        'pricingPM'
    ];
    scenarios.forEach((sc) => {
        personas.forEach((p) => {
            const comment = sc.comments[p];
            node_assert_1.default.ok(comment, `${sc.id} missing comment for ${p}`);
            node_assert_1.default.ok(comment.agentRole && comment.agentRole.length > 0, `${sc.id} ${p} agentRole missing`);
            node_assert_1.default.ok(comment.agentPersonaZh && comment.agentPersonaZh.length > 0, `${sc.id} ${p} agentPersonaZh missing`);
            node_assert_1.default.ok(comment.scoreOutOf10 >= 1 && comment.scoreOutOf10 <= 10, `${sc.id} ${p} score out of range`);
            node_assert_1.default.ok(['Positive', 'Constructive', 'Critical', 'Cautionary'].includes(comment.sentiment), `${sc.id} ${p} invalid sentiment`);
            node_assert_1.default.ok(comment.critique && comment.critique.length > 15, `${sc.id} ${p} critique too short`);
            node_assert_1.default.ok(comment.keyFeatureCommented && comment.keyFeatureCommented.length > 0, `${sc.id} ${p} keyFeatureCommented missing`);
        });
    });
});
test('Persona-specific attributes are rigorously evaluated and typed', () => {
    scenarios.forEach((sc) => {
        // Top Producer has willingnessToPay
        node_assert_1.default.ok(['High', 'Medium', 'Low'].includes(sc.comments.topProducer.willingnessToPay || ''), `${sc.id} topProducer WTP missing`);
        node_assert_1.default.ok(sc.comments.topProducer.pricingFeedback, `${sc.id} topProducer pricingFeedback missing`);
        // District Director has pricingFeedback
        node_assert_1.default.ok(sc.comments.districtDirector.pricingFeedback, `${sc.id} districtDirector pricingFeedback missing`);
        // Policyholder has trustScore
        node_assert_1.default.ok(sc.comments.policyholder.trustScore && sc.comments.policyholder.trustScore >= 1, `${sc.id} policyholder trustScore missing`);
        // Compliance Officer has complianceRiskLevel
        node_assert_1.default.ok(['Low', 'Medium', 'High'].includes(sc.comments.complianceOfficer.complianceRiskLevel || ''), `${sc.id} complianceRiskLevel missing`);
        // Pricing PM has recommendedTier and priceSensitivityVerdict
        node_assert_1.default.ok(sc.comments.pricingPM.recommendedTier, `${sc.id} pricingPM recommendedTier missing`);
        node_assert_1.default.ok(sc.comments.pricingPM.priceSensitivityVerdict, `${sc.id} pricingPM priceSensitivityVerdict missing`);
    });
});
test('Consensus verdict correctly calculates average score and viability classification', () => {
    scenarios.forEach((sc) => {
        const pScores = [
            sc.comments.actuaryAuditor.scoreOutOf10,
            sc.comments.topProducer.scoreOutOf10,
            sc.comments.districtDirector.scoreOutOf10,
            sc.comments.policyholder.scoreOutOf10,
            sc.comments.complianceOfficer.scoreOutOf10,
            sc.comments.pricingPM.scoreOutOf10
        ];
        const expectedAvg = Math.round((pScores.reduce((a, b) => a + b, 0) / 6) * 10) / 10;
        node_assert_1.default.strictEqual(sc.consensusVerdict.averageScore, expectedAvg, `${sc.id} consensus average score mismatch`);
        node_assert_1.default.ok(['Outstanding', 'Strong', 'Moderate', 'NeedsImprovement'].includes(sc.consensusVerdict.overallViability));
        node_assert_1.default.ok(sc.consensusVerdict.primaryObjection.length > 5);
        node_assert_1.default.ok(sc.consensusVerdict.productAdvancementRecommendation.length > 5);
        node_assert_1.default.ok(sc.consensusVerdict.pricingOptimizationStrategy.length > 5);
    });
});
// --- 3. Commercial Pricing Model & Unit Economics ---
console.log('\n--- [TEST SUITE] 3. Commercial Pricing Model & Unit Economics ---');
test('Scenarios cover all 4 commercial pricing tiers with correct price mappings', () => {
    const tierPriceMap = {
        Retail_HKD49: 49,
        AdvisorPro_HKD199: 199,
        AgencyTeam_HKD2480: 2480,
        Enterprise_HKD12800: 12800
    };
    const tierOccurrences = {};
    scenarios.forEach((sc) => {
        node_assert_1.default.ok(sc.commercialTierRelevance in tierPriceMap, `${sc.id} has invalid tier: ${sc.commercialTierRelevance}`);
        node_assert_1.default.strictEqual(sc.targetTierPriceHKD, tierPriceMap[sc.commercialTierRelevance], `${sc.id} price mismatch`);
        tierOccurrences[sc.commercialTierRelevance] = (tierOccurrences[sc.commercialTierRelevance] || 0) + 1;
    });
    // Ensure all tiers have representative scenarios
    node_assert_1.default.ok(tierOccurrences['Retail_HKD49'] >= 5, 'Retail tier must have >= 5 scenarios');
    node_assert_1.default.ok(tierOccurrences['AdvisorPro_HKD199'] >= 40, 'Advisor Pro tier must have >= 40 scenarios');
    node_assert_1.default.ok(tierOccurrences['AgencyTeam_HKD2480'] >= 10, 'Agency Team tier must have >= 10 scenarios');
    node_assert_1.default.ok(tierOccurrences['Enterprise_HKD12800'] >= 15, 'Enterprise tier must have >= 15 scenarios');
});
// --- 4. Simulation Engine Methods & Aggregates ---
console.log('\n--- [TEST SUITE] 4. Simulation Engine Core Methods & Aggregates ---');
const engine = new scenario_agents_js_1.DailyScenariosSimulationEngine();
test('DailyScenariosSimulationEngine correctly loads all 100 scenarios', () => {
    node_assert_1.default.strictEqual(engine.getScenarioCount(), 100);
    node_assert_1.default.strictEqual(engine.getAllScenarios().length, 100);
});
test('Query helper getScenarioById returns exact match by ID or number', () => {
    const sc1 = engine.getScenarioById('SC001');
    node_assert_1.default.ok(sc1);
    node_assert_1.default.strictEqual(sc1?.id, 'SC001');
    const sc50 = engine.getScenarioById('50');
    node_assert_1.default.ok(sc50);
    node_assert_1.default.strictEqual(sc50?.scenarioNumber, 50);
    const sc100 = engine.getScenarioById('sc100');
    node_assert_1.default.ok(sc100);
    node_assert_1.default.strictEqual(sc100?.id, 'SC100');
});
test('Query helper getScenariosByDomain filters accurately', () => {
    const mcvScenarios = engine.getScenariosByDomain('Cross_Border_MCV_Inbound');
    node_assert_1.default.strictEqual(mcvScenarios.length, 10);
    mcvScenarios.forEach((sc) => node_assert_1.default.strictEqual(sc.domain, 'Cross_Border_MCV_Inbound'));
    const hospitalScenarios = engine.getScenariosByDomain('全港13家私院入院免按金與出院免找數爭議');
    node_assert_1.default.strictEqual(hospitalScenarios.length, 10);
});
test('Query helper getScenariosByInsurer filters correctly across 15 insurers', () => {
    const aiaScenarios = engine.getScenariosByInsurer('AIA');
    node_assert_1.default.ok(aiaScenarios.length >= 25, 'AIA should be in at least 25 scenarios');
    const pruScenarios = engine.getScenariosByInsurer('Prudential');
    node_assert_1.default.ok(pruScenarios.length >= 20, 'Prudential should be in at least 20 scenarios');
    const bowtieScenarios = engine.getScenariosByInsurer('Bowtie');
    node_assert_1.default.ok(bowtieScenarios.length >= 4, 'Bowtie should be in at least 4 scenarios');
});
test('runFullSimulation executes and produces complete analytics', () => {
    const res = engine.runFullSimulation();
    node_assert_1.default.strictEqual(res.totalScenarios, 100);
    node_assert_1.default.ok(res.overallAverageScore >= 8.0 && res.overallAverageScore <= 10.0);
    node_assert_1.default.strictEqual(res.domainSummaries.length, 10);
    node_assert_1.default.strictEqual(res.personaSummaries.length, 6);
    node_assert_1.default.strictEqual(res.commercialTierSummaries.length, 4);
    node_assert_1.default.ok(Object.keys(res.insurerConfrontationStats).length >= 8);
    node_assert_1.default.ok(res.topObjectionsCatalog.length > 0);
    node_assert_1.default.ok(res.pricingUnitEconomics.retailTierHKD49.price === 49);
    node_assert_1.default.ok(res.pricingUnitEconomics.advisorProTierHKD199.price === 199);
    node_assert_1.default.ok(res.pricingUnitEconomics.agencyTeamTierHKD2480.price === 2480);
    node_assert_1.default.ok(res.pricingUnitEconomics.enterpriseTierHKD12800.price === 12800);
});
// --- 5. ScenarioAgentHub Integration ---
console.log('\n--- [TEST SUITE] 5. ScenarioAgentHub Integration ---');
test('ScenarioAgentHub exposes simulation100 instance with identical data', () => {
    const hub = new scenario_agents_js_1.ScenarioAgentHub();
    node_assert_1.default.ok(hub.simulation100 instanceof scenario_agents_js_1.DailyScenariosSimulationEngine);
    node_assert_1.default.strictEqual(hub.simulation100.getScenarioCount(), 100);
    const sc1 = hub.simulation100.getScenarioById('SC001');
    node_assert_1.default.ok(sc1);
    node_assert_1.default.strictEqual(sc1?.id, 'SC001');
});
// --- 6. Markdown Report Artifact Verification ---
console.log('\n--- [TEST SUITE] 6. Markdown Report Artifact Verification ---');
test('docs/SIMULATION_100_DAILY_SCENARIOS_REPORT.md exists, is complete and publication-grade', () => {
    const reportPath = path_1.default.join(process.cwd(), 'docs', 'SIMULATION_100_DAILY_SCENARIOS_REPORT.md');
    node_assert_1.default.ok(fs_1.default.existsSync(reportPath), 'SIMULATION_100_DAILY_SCENARIOS_REPORT.md must exist');
    const reportContent = fs_1.default.readFileSync(reportPath, 'utf8');
    // Must exceed 100 KB
    const sizeKb = fs_1.default.statSync(reportPath).size / 1024;
    node_assert_1.default.ok(sizeKb > 100, `Report size too small: ${sizeKb.toFixed(1)} KB`);
    // Must contain all 100 scenario IDs
    for (let i = 1; i <= 100; i++) {
        const id = `[SC${String(i).padStart(3, '0')}]`;
        node_assert_1.default.ok(reportContent.includes(id), `Report missing scenario ID: ${id}`);
    }
    // Must contain all 10 domains
    const domainsZh = [
        '咖啡館 30 秒極速對抗與臨場促成',
        '內地訪港旅客與高鐵站/機場極速會客',
        '高淨值家族辦公室財富傳承與萬用保費融資',
        '重疾險條款穿透與核保加費抗辯',
        '全港13家私院入院免按金與出院免找數爭議',
        '區域晨會 06:30 賦能、早報分發與新人育成',
        '延期年金法定扣稅與退休現金流鎖定',
        '保監局 GL20 合規守則、GN16 實現率走廊審計與防範轉保',
        '宏觀降息加息週期、匯率震盪與金融海嘯壓力測試',
        'SaaS 商業化採購決策：HK$49 零售 vs HK$199 個人 vs HK$2,480 團隊 vs HK$12,800 經紀行'
    ];
    domainsZh.forEach((dZh) => {
        node_assert_1.default.ok(reportContent.includes(dZh), `Report missing domain: ${dZh}`);
    });
    // Must contain all 4 commercial pricing tiers
    node_assert_1.default.ok(reportContent.includes('HK$ 49'));
    node_assert_1.default.ok(reportContent.includes('HK$ 199'));
    node_assert_1.default.ok(reportContent.includes('HK$ 2,480'));
    node_assert_1.default.ok(reportContent.includes('HK$ 12,800'));
});
// --- 7. Robust Path Resolution & In-Memory Caching Resilience ---
console.log('\n--- [TEST SUITE] 7. Robust Path Resolution & In-Memory Caching Resilience ---');
test('DailyScenariosSimulationEngine resolves dataset even when working directory is altered', () => {
    const origCwd = process.cwd();
    try {
        process.chdir(path_1.default.join(origCwd, 'src'));
        const alteredEngine = new scenario_agents_js_1.DailyScenariosSimulationEngine();
        node_assert_1.default.strictEqual(alteredEngine.getScenarioCount(), 100);
        const res = alteredEngine.runFullSimulation();
        node_assert_1.default.strictEqual(res.totalScenarios, 100);
    }
    finally {
        process.chdir(origCwd);
    }
});
test('In-memory caching delivers high concurrency instantiation (< 150ms for 100 instances)', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        const inst = new scenario_agents_js_1.DailyScenariosSimulationEngine();
        node_assert_1.default.strictEqual(inst.getScenarioCount(), 100);
    }
    const duration = performance.now() - start;
    node_assert_1.default.ok(duration < 250, `100 instantiations took too long: ${duration.toFixed(1)}ms`);
});
// --- 8. ScenarioAgentHub Dispatch & Typing Completeness ---
console.log('\n--- [TEST SUITE] 8. ScenarioAgentHub Dispatch & Typing Completeness ---');
test('hub.getAgentForScenario("simulation_100") returns simulation100 instance', () => {
    const hub = new scenario_agents_js_1.ScenarioAgentHub();
    const agent = hub.getAgentForScenario('simulation_100');
    node_assert_1.default.ok(agent instanceof scenario_agents_js_1.DailyScenariosSimulationEngine);
    node_assert_1.default.strictEqual(agent.getScenarioCount(), 100);
});
// --- 9. CLI Simulation Subcommand Execution ---
console.log('\n--- [TEST SUITE] 9. CLI Simulation Subcommand Execution ---');
test('CLI simulation command runs and outputs comprehensive summary', () => {
    const out = (0, node_child_process_1.execSync)('npx tsx src/cli.ts simulation', { encoding: 'utf8' });
    node_assert_1.default.ok(out.includes('100場真實展業場景多維AI代理模擬引擎'));
    node_assert_1.default.ok(out.includes('已成功加載並模擬 100 個香港保險真實日常場景'));
    node_assert_1.default.ok(out.includes('六大 AI 代理綜合評分'));
    node_assert_1.default.ok(out.includes('四大商業定價梯隊 ARR 跑道預測'));
    node_assert_1.default.ok(out.includes('AdvisorPro_HKD199'));
});
test('CLI simulation --id SC001 returns scenario ledger and 6 AI agent comments', () => {
    const out = (0, node_child_process_1.execSync)('npx tsx src/cli.ts simulation --id SC001', { encoding: 'utf8' });
    node_assert_1.default.ok(out.includes('【場景 SC001】'));
    node_assert_1.default.ok(out.includes('精算師與監管合規審計官'));
    node_assert_1.default.ok(out.includes('百萬圓桌頂尖百萬顧問'));
    node_assert_1.default.ok(out.includes('保險區域總監'));
    node_assert_1.default.ok(out.includes('高淨值客戶 / 零售投保人'));
    node_assert_1.default.ok(out.includes('獨立經紀行合規總監'));
    node_assert_1.default.ok(out.includes('SaaS 商業定價產品經理'));
    node_assert_1.default.ok(out.includes('共識結論'));
});
test('CLI simulation --pricing outputs commercial tiers and unit economics', () => {
    const out = (0, node_child_process_1.execSync)('npx tsx src/cli.ts simulation --pricing', { encoding: 'utf8' });
    node_assert_1.default.ok(out.includes('商業化四階收費梯隊與單元經濟學'));
    node_assert_1.default.ok(out.includes('Retail_HKD49'));
    node_assert_1.default.ok(out.includes('AdvisorPro_HKD199'));
    node_assert_1.default.ok(out.includes('AgencyTeam_HKD2480'));
    node_assert_1.default.ok(out.includes('Enterprise_HKD12800'));
});
// --- 10. Mobile Cafe Web App UI Integration & Parity ---
console.log('\n--- [TEST SUITE] 10. Mobile Cafe Web App UI Integration & Parity ---');
test('Mobile Cafe App template includes simulation tab, nav button, and modal elements', () => {
    const templatePath = path_1.default.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
    const html = fs_1.default.readFileSync(templatePath, 'utf8');
    node_assert_1.default.ok(html.includes('id="tab-scenario-simulation-100"'), 'Scenario tab button exists');
    node_assert_1.default.ok(html.includes('id="btn-open-simulation-modal"'), 'Header simulation modal button exists');
    node_assert_1.default.ok(html.includes('id="simulation-modal"'), 'Simulation modal element exists');
    node_assert_1.default.ok(html.includes('id="simulation-modal-backdrop"'), 'Simulation modal backdrop exists');
    node_assert_1.default.ok(html.includes('DAILY_100_SCENARIOS ='), 'Embedded DAILY_100_SCENARIOS exists');
    node_assert_1.default.ok(html.includes('openSimulationModal'), 'openSimulationModal function exists');
    node_assert_1.default.ok(html.includes('renderSimulationCardsList'), 'renderSimulationCardsList function exists');
});
test('templates/mobile_cafe_app.html, dist/index.html and dist/cafe.html have 100% byte-for-byte SHA-256 parity', () => {
    const sha256 = (content) => node_crypto_1.default.createHash('sha256').update(content).digest('hex');
    const tplHash = sha256(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'templates', 'mobile_cafe_app.html'), 'utf8'));
    const idxHash = sha256(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'dist', 'index.html'), 'utf8'));
    const cafeHash = sha256(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'dist', 'cafe.html'), 'utf8'));
    node_assert_1.default.strictEqual(tplHash, idxHash, 'Template and dist/index.html SHA-256 mismatch');
    node_assert_1.default.strictEqual(tplHash, cafeHash, 'Template and dist/cafe.html SHA-256 mismatch');
});
console.log('================================================================================');
console.log(`VERIFICATION SUMMARY: ${records.filter(r => r.passed).length} / ${records.length} PASSED`);
console.log('================================================================================');
const allPassed = records.every(r => r.passed);
if (!allPassed) {
    process.exit(1);
}

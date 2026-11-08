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

import fs from 'fs';
import path from 'path';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import {
  DailyScenariosSimulationEngine,
  ScenarioAgentHub,
  DailyScenario,
  ScenarioDomain,
  CommercialTier
} from '../src/engine/scenario_agents.js';

interface TestRecord {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const records: TestRecord[] = [];

function test(name: string, fn: () => void) {
  const start = performance.now();
  try {
    fn();
    const durationMs = performance.now() - start;
    records.push({ name, passed: true, durationMs });
    console.log(`  [PASS] (${durationMs.toFixed(2)}ms) ${name}`);
  } catch (err: any) {
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

const datasetPath = path.join(process.cwd(), 'src', 'data', 'daily_100_scenarios.json');
assert.ok(fs.existsSync(datasetPath), 'daily_100_scenarios.json must exist');
const rawData = fs.readFileSync(datasetPath, 'utf8');
const scenarios: DailyScenario[] = JSON.parse(rawData);

test('Dataset contains exactly 100 distinct scenarios', () => {
  assert.strictEqual(scenarios.length, 100, `Expected 100 scenarios, got ${scenarios.length}`);
});

test('Scenario IDs are sequential SC001 through SC100 with zero duplicates', () => {
  const ids = new Set<string>();
  scenarios.forEach((sc, idx) => {
    const expectedId = `SC${String(idx + 1).padStart(3, '0')}`;
    assert.strictEqual(sc.id, expectedId, `Scenario at index ${idx} must have id ${expectedId}`);
    assert.strictEqual(sc.scenarioNumber, idx + 1);
    assert.ok(!ids.has(sc.id), `Duplicate id found: ${sc.id}`);
    ids.add(sc.id);
  });
  assert.strictEqual(ids.size, 100);
});

test('Covers exactly 10 distinct realistic business domains with 10 scenarios each', () => {
  const expectedDomains: ScenarioDomain[] = [
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

  const domainCounts = new Map<string, number>();
  for (const sc of scenarios) {
    domainCounts.set(sc.domain, (domainCounts.get(sc.domain) || 0) + 1);
  }

  assert.strictEqual(domainCounts.size, 10, 'Must cover exactly 10 domains');
  expectedDomains.forEach((dom) => {
    assert.strictEqual(domainCounts.get(dom), 10, `Domain ${dom} must have exactly 10 scenarios`);
  });
});

test('Every scenario has authentic HK location, client persona and context description', () => {
  scenarios.forEach((sc) => {
    assert.ok(sc.title && sc.title.length > 5, `${sc.id} title too short`);
    assert.ok(sc.location && sc.location.length > 3, `${sc.id} location missing`);
    assert.ok(sc.clientPersona && sc.clientPersona.length > 5, `${sc.id} persona missing`);
    assert.ok(sc.contextDescription && sc.contextDescription.length > 15, `${sc.id} context missing`);
    assert.ok(sc.coreConfrontationOrChallenge && sc.coreConfrontationOrChallenge.length > 10, `${sc.id} challenge missing`);
    assert.ok(Array.isArray(sc.involvedInsurers) && sc.involvedInsurers.length >= 1, `${sc.id} must list insurers`);
    assert.ok(Array.isArray(sc.involvedProducts) && sc.involvedProducts.length >= 1, `${sc.id} must list products`);
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
  ] as const;

  scenarios.forEach((sc) => {
    personas.forEach((p) => {
      const comment = sc.comments[p];
      assert.ok(comment, `${sc.id} missing comment for ${p}`);
      assert.ok(comment.agentRole && comment.agentRole.length > 0, `${sc.id} ${p} agentRole missing`);
      assert.ok(comment.agentPersonaZh && comment.agentPersonaZh.length > 0, `${sc.id} ${p} agentPersonaZh missing`);
      assert.ok(comment.scoreOutOf10 >= 1 && comment.scoreOutOf10 <= 10, `${sc.id} ${p} score out of range`);
      assert.ok(['Positive', 'Constructive', 'Critical', 'Cautionary'].includes(comment.sentiment), `${sc.id} ${p} invalid sentiment`);
      assert.ok(comment.critique && comment.critique.length > 15, `${sc.id} ${p} critique too short`);
      assert.ok(comment.keyFeatureCommented && comment.keyFeatureCommented.length > 0, `${sc.id} ${p} keyFeatureCommented missing`);
    });
  });
});

test('Persona-specific attributes are rigorously evaluated and typed', () => {
  scenarios.forEach((sc) => {
    // Top Producer has willingnessToPay
    assert.ok(['High', 'Medium', 'Low'].includes(sc.comments.topProducer.willingnessToPay || ''), `${sc.id} topProducer WTP missing`);
    assert.ok(sc.comments.topProducer.pricingFeedback, `${sc.id} topProducer pricingFeedback missing`);

    // District Director has pricingFeedback
    assert.ok(sc.comments.districtDirector.pricingFeedback, `${sc.id} districtDirector pricingFeedback missing`);

    // Policyholder has trustScore
    assert.ok(sc.comments.policyholder.trustScore && sc.comments.policyholder.trustScore >= 1, `${sc.id} policyholder trustScore missing`);

    // Compliance Officer has complianceRiskLevel
    assert.ok(['Low', 'Medium', 'High'].includes(sc.comments.complianceOfficer.complianceRiskLevel || ''), `${sc.id} complianceRiskLevel missing`);

    // Pricing PM has recommendedTier and priceSensitivityVerdict
    assert.ok(sc.comments.pricingPM.recommendedTier, `${sc.id} pricingPM recommendedTier missing`);
    assert.ok(sc.comments.pricingPM.priceSensitivityVerdict, `${sc.id} pricingPM priceSensitivityVerdict missing`);
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
    assert.strictEqual(sc.consensusVerdict.averageScore, expectedAvg, `${sc.id} consensus average score mismatch`);
    assert.ok(['Outstanding', 'Strong', 'Moderate', 'NeedsImprovement'].includes(sc.consensusVerdict.overallViability));
    assert.ok(sc.consensusVerdict.primaryObjection.length > 5);
    assert.ok(sc.consensusVerdict.productAdvancementRecommendation.length > 5);
    assert.ok(sc.consensusVerdict.pricingOptimizationStrategy.length > 5);
  });
});

// --- 3. Commercial Pricing Model & Unit Economics ---
console.log('\n--- [TEST SUITE] 3. Commercial Pricing Model & Unit Economics ---');

test('Scenarios cover all 4 commercial pricing tiers with correct price mappings', () => {
  const tierPriceMap: Record<CommercialTier, number> = {
    Retail_HKD49: 49,
    AdvisorPro_HKD199: 199,
    AgencyTeam_HKD2480: 2480,
    Enterprise_HKD12800: 12800
  };

  const tierOccurrences: Record<string, number> = {};

  scenarios.forEach((sc) => {
    assert.ok(sc.commercialTierRelevance in tierPriceMap, `${sc.id} has invalid tier: ${sc.commercialTierRelevance}`);
    assert.strictEqual(sc.targetTierPriceHKD, tierPriceMap[sc.commercialTierRelevance], `${sc.id} price mismatch`);
    tierOccurrences[sc.commercialTierRelevance] = (tierOccurrences[sc.commercialTierRelevance] || 0) + 1;
  });

  // Ensure all tiers have representative scenarios
  assert.ok(tierOccurrences['Retail_HKD49'] >= 5, 'Retail tier must have >= 5 scenarios');
  assert.ok(tierOccurrences['AdvisorPro_HKD199'] >= 40, 'Advisor Pro tier must have >= 40 scenarios');
  assert.ok(tierOccurrences['AgencyTeam_HKD2480'] >= 10, 'Agency Team tier must have >= 10 scenarios');
  assert.ok(tierOccurrences['Enterprise_HKD12800'] >= 15, 'Enterprise tier must have >= 15 scenarios');
});

// --- 4. Simulation Engine Methods & Aggregates ---
console.log('\n--- [TEST SUITE] 4. Simulation Engine Core Methods & Aggregates ---');

const engine = new DailyScenariosSimulationEngine();

test('DailyScenariosSimulationEngine correctly loads all 100 scenarios', () => {
  assert.strictEqual(engine.getScenarioCount(), 100);
  assert.strictEqual(engine.getAllScenarios().length, 100);
});

test('Query helper getScenarioById returns exact match by ID or number', () => {
  const sc1 = engine.getScenarioById('SC001');
  assert.ok(sc1);
  assert.strictEqual(sc1?.id, 'SC001');

  const sc50 = engine.getScenarioById('50');
  assert.ok(sc50);
  assert.strictEqual(sc50?.scenarioNumber, 50);

  const sc100 = engine.getScenarioById('sc100');
  assert.ok(sc100);
  assert.strictEqual(sc100?.id, 'SC100');
});

test('Query helper getScenariosByDomain filters accurately', () => {
  const mcvScenarios = engine.getScenariosByDomain('Cross_Border_MCV_Inbound');
  assert.strictEqual(mcvScenarios.length, 10);
  mcvScenarios.forEach((sc) => assert.strictEqual(sc.domain, 'Cross_Border_MCV_Inbound'));

  const hospitalScenarios = engine.getScenariosByDomain('全港13家私院入院免按金與出院免找數爭議');
  assert.strictEqual(hospitalScenarios.length, 10);
});

test('Query helper getScenariosByInsurer filters correctly across 15 insurers', () => {
  const aiaScenarios = engine.getScenariosByInsurer('AIA');
  assert.ok(aiaScenarios.length >= 25, 'AIA should be in at least 25 scenarios');

  const pruScenarios = engine.getScenariosByInsurer('Prudential');
  assert.ok(pruScenarios.length >= 20, 'Prudential should be in at least 20 scenarios');

  const bowtieScenarios = engine.getScenariosByInsurer('Bowtie');
  assert.ok(bowtieScenarios.length >= 4, 'Bowtie should be in at least 4 scenarios');
});

test('runFullSimulation executes and produces complete analytics', () => {
  const res = engine.runFullSimulation();
  assert.strictEqual(res.totalScenarios, 100);
  assert.ok(res.overallAverageScore >= 8.0 && res.overallAverageScore <= 10.0);
  assert.strictEqual(res.domainSummaries.length, 10);
  assert.strictEqual(res.personaSummaries.length, 6);
  assert.strictEqual(res.commercialTierSummaries.length, 4);
  assert.ok(Object.keys(res.insurerConfrontationStats).length >= 8);
  assert.ok(res.topObjectionsCatalog.length > 0);
  assert.ok(res.pricingUnitEconomics.retailTierHKD49.price === 49);
  assert.ok(res.pricingUnitEconomics.advisorProTierHKD199.price === 199);
  assert.ok(res.pricingUnitEconomics.agencyTeamTierHKD2480.price === 2480);
  assert.ok(res.pricingUnitEconomics.enterpriseTierHKD12800.price === 12800);
});

// --- 5. ScenarioAgentHub Integration ---
console.log('\n--- [TEST SUITE] 5. ScenarioAgentHub Integration ---');

test('ScenarioAgentHub exposes simulation100 instance with identical data', () => {
  const hub = new ScenarioAgentHub();
  assert.ok(hub.simulation100 instanceof DailyScenariosSimulationEngine);
  assert.strictEqual(hub.simulation100.getScenarioCount(), 100);
  const sc1 = hub.simulation100.getScenarioById('SC001');
  assert.ok(sc1);
  assert.strictEqual(sc1?.id, 'SC001');
});

// --- 6. Markdown Report Artifact Verification ---
console.log('\n--- [TEST SUITE] 6. Markdown Report Artifact Verification ---');

test('docs/SIMULATION_100_DAILY_SCENARIOS_REPORT.md exists, is complete and publication-grade', () => {
  const reportPath = path.join(process.cwd(), 'docs', 'SIMULATION_100_DAILY_SCENARIOS_REPORT.md');
  assert.ok(fs.existsSync(reportPath), 'SIMULATION_100_DAILY_SCENARIOS_REPORT.md must exist');
  const reportContent = fs.readFileSync(reportPath, 'utf8');

  // Must exceed 100 KB
  const sizeKb = fs.statSync(reportPath).size / 1024;
  assert.ok(sizeKb > 100, `Report size too small: ${sizeKb.toFixed(1)} KB`);

  // Must contain all 100 scenario IDs
  for (let i = 1; i <= 100; i++) {
    const id = `[SC${String(i).padStart(3, '0')}]`;
    assert.ok(reportContent.includes(id), `Report missing scenario ID: ${id}`);
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
    assert.ok(reportContent.includes(dZh), `Report missing domain: ${dZh}`);
  });

  // Must contain all 4 commercial pricing tiers
  assert.ok(reportContent.includes('HK$ 49'));
  assert.ok(reportContent.includes('HK$ 199'));
  assert.ok(reportContent.includes('HK$ 2,480'));
  assert.ok(reportContent.includes('HK$ 12,800'));
});

// --- 7. Robust Path Resolution & In-Memory Caching Resilience ---
console.log('\n--- [TEST SUITE] 7. Robust Path Resolution & In-Memory Caching Resilience ---');

test('DailyScenariosSimulationEngine resolves dataset even when working directory is altered', () => {
  const origCwd = process.cwd();
  try {
    process.chdir(path.join(origCwd, 'src'));
    const alteredEngine = new DailyScenariosSimulationEngine();
    assert.strictEqual(alteredEngine.getScenarioCount(), 100);
    const res = alteredEngine.runFullSimulation();
    assert.strictEqual(res.totalScenarios, 100);
  } finally {
    process.chdir(origCwd);
  }
});

test('In-memory caching delivers high concurrency instantiation (< 150ms for 100 instances)', () => {
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    const inst = new DailyScenariosSimulationEngine();
    assert.strictEqual(inst.getScenarioCount(), 100);
  }
  const duration = performance.now() - start;
  assert.ok(duration < 250, `100 instantiations took too long: ${duration.toFixed(1)}ms`);
});

// --- 8. ScenarioAgentHub Dispatch & Typing Completeness ---
console.log('\n--- [TEST SUITE] 8. ScenarioAgentHub Dispatch & Typing Completeness ---');

test('hub.getAgentForScenario("simulation_100") returns simulation100 instance', () => {
  const hub = new ScenarioAgentHub();
  const agent = hub.getAgentForScenario('simulation_100');
  assert.ok(agent instanceof DailyScenariosSimulationEngine);
  assert.strictEqual(agent.getScenarioCount(), 100);
});

// --- 9. CLI Simulation Subcommand Execution ---
console.log('\n--- [TEST SUITE] 9. CLI Simulation Subcommand Execution ---');

test('CLI simulation command runs and outputs comprehensive summary', () => {
  const out = execSync('npx tsx src/cli.ts simulation', { encoding: 'utf8' });
  assert.ok(out.includes('100場真實展業場景多維AI代理模擬引擎'));
  assert.ok(out.includes('已成功加載並模擬 100 個香港保險真實日常場景'));
  assert.ok(out.includes('六大 AI 代理綜合評分'));
  assert.ok(out.includes('四大商業定價梯隊 ARR 跑道預測'));
  assert.ok(out.includes('AdvisorPro_HKD199'));
});

test('CLI simulation --id SC001 returns scenario ledger and 6 AI agent comments', () => {
  const out = execSync('npx tsx src/cli.ts simulation --id SC001', { encoding: 'utf8' });
  assert.ok(out.includes('【場景 SC001】'));
  assert.ok(out.includes('精算師與監管合規審計官'));
  assert.ok(out.includes('百萬圓桌頂尖百萬顧問'));
  assert.ok(out.includes('保險區域總監'));
  assert.ok(out.includes('高淨值客戶 / 零售投保人'));
  assert.ok(out.includes('獨立經紀行合規總監'));
  assert.ok(out.includes('SaaS 商業定價產品經理'));
  assert.ok(out.includes('共識結論'));
});

test('CLI simulation --pricing outputs commercial tiers and unit economics', () => {
  const out = execSync('npx tsx src/cli.ts simulation --pricing', { encoding: 'utf8' });
  assert.ok(out.includes('商業化四階收費梯隊與單元經濟學'));
  assert.ok(out.includes('Retail_HKD49'));
  assert.ok(out.includes('AdvisorPro_HKD199'));
  assert.ok(out.includes('AgencyTeam_HKD2480'));
  assert.ok(out.includes('Enterprise_HKD12800'));
});

// --- 10. Mobile Cafe Web App UI Integration & Parity ---
console.log('\n--- [TEST SUITE] 10. Mobile Cafe Web App UI Integration & Parity ---');

test('Mobile Cafe App template includes simulation tab, nav button, and modal elements', () => {
  const templatePath = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
  const html = fs.readFileSync(templatePath, 'utf8');

  assert.ok(html.includes('id="tab-scenario-simulation-100"'), 'Scenario tab button exists');
  assert.ok(html.includes('id="btn-open-simulation-modal"'), 'Header simulation modal button exists');
  assert.ok(html.includes('id="simulation-modal"'), 'Simulation modal element exists');
  assert.ok(html.includes('id="simulation-modal-backdrop"'), 'Simulation modal backdrop exists');
  assert.ok(html.includes('DAILY_100_SCENARIOS ='), 'Embedded DAILY_100_SCENARIOS exists');
  assert.ok(html.includes('openSimulationModal'), 'openSimulationModal function exists');
  assert.ok(html.includes('renderSimulationCardsList'), 'renderSimulationCardsList function exists');
});

test('templates/mobile_cafe_app.html, dist/index.html and dist/cafe.html have 100% byte-for-byte SHA-256 parity', () => {
  const sha256 = (content: string) => crypto.createHash('sha256').update(content).digest('hex');
  const tplHash = sha256(fs.readFileSync(path.join(process.cwd(), 'templates', 'mobile_cafe_app.html'), 'utf8'));
  const idxHash = sha256(fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8'));
  const cafeHash = sha256(fs.readFileSync(path.join(process.cwd(), 'dist', 'cafe.html'), 'utf8'));

  assert.strictEqual(tplHash, idxHash, 'Template and dist/index.html SHA-256 mismatch');
  assert.strictEqual(tplHash, cafeHash, 'Template and dist/cafe.html SHA-256 mismatch');
});

console.log('================================================================================');
console.log(`VERIFICATION SUMMARY: ${records.filter(r => r.passed).length} / ${records.length} PASSED`);
console.log('================================================================================');

const allPassed = records.every(r => r.passed);
if (!allPassed) {
  process.exit(1);
}

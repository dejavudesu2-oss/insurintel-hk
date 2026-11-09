/**
 * scripts/simulate_100_daily_scenarios.ts
 * Executable simulation runner for InsurIntel HK's 100 Daily Scenarios & Multi-Agent Commentary
 */

import fs from 'fs';
import path from 'path';
import { DailyScenariosSimulationEngine } from '../src/engine/daily_100_scenarios_simulation.js';

console.log('================================================================================');
console.log('INSURINTEL HK - 100 DAILY SCENARIOS MULTI-AGENT SIMULATION RUNNER');
console.log('================================================================================');

const engine = new DailyScenariosSimulationEngine();
const total = engine.getScenarioCount();
console.log(`Loaded ${total} scenarios from daily_100_scenarios.json`);

if (total !== 100) {
  console.error(`ERROR: Expected exactly 100 scenarios, found ${total}`);
  process.exit(1);
}

const simResult = engine.runFullSimulation();

console.log('\n--- SIMULATION SUMMARY METRICS ---');
console.log(`Total Scenarios Tested : ${simResult.totalScenarios}`);
console.log(`Overall Average Score  : ${simResult.overallAverageScore} / 10`);

console.log('\n--- DOMAIN BREAKDOWN ---');
simResult.domainSummaries.forEach((d, idx) => {
  console.log(`  [${String(idx + 1).padStart(2, '0')}] ${d.domainZh} (${d.domain})`);
  console.log(`       Scenarios: ${d.scenarioCount} | Avg Score: ${d.averageScore} | Dominant Tier: ${d.dominantTier}`);
});

console.log('\n--- PERSONA SCORECARDS ---');
simResult.personaSummaries.forEach((p) => {
  console.log(`  - ${p.agentRole} (${p.agentPersonaZh}): Avg ${p.averageScore}/10 | Positives: ${p.sentimentCounts.Positive}`);
});

console.log('\n--- COMMERCIAL PRICING TIER RUN RATES ---');
simResult.commercialTierSummaries.forEach((t) => {
  console.log(`  - [${t.tier}] HK$${t.monthlyPriceHKD.toLocaleString()} | Scenarios: ${t.scenarioCount} | WTP: ${t.estimatedWillingnessToPay} | ARR Potential: HK$${t.annualRunRatePotentialHKD.toLocaleString()}`);
});

// Generate and write markdown report
const reportContent = engine.generateMarkdownReport();
const reportPath = path.join(process.cwd(), 'docs', 'SIMULATION_100_DAILY_SCENARIOS_REPORT.md');

fs.writeFileSync(reportPath, reportContent, 'utf8');
console.log(`\n✅ Generated publication-grade simulation report: ${reportPath} (Size: ${(fs.statSync(reportPath).size / 1024).toFixed(1)} KB)`);
console.log('================================================================================');

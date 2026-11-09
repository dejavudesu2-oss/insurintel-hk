/**
 * tests/verification_cost_model.ts
 * Automated Verification for Single Cost Model & Churn Sensitivity (TASK-R4-01 / P4)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { PATHS } from '../scripts/paths.js';

console.log('================================================================================');
console.log('TEST SUITE: SINGLE COST MODEL & CHURN SENSITIVITY (TASK-R4-01 / P4)');
console.log('================================================================================\n');

// 1. Verify cost_model.json exists and has version and changelog
const costModelPath = PATHS.COST_MODEL;
assert.ok(fs.existsSync(costModelPath), 'cost_model.json must exist in root directory');

const costModel = JSON.parse(fs.readFileSync(costModelPath, 'utf8'));
assert.ok(costModel.version, 'cost_model.json must have version');
assert.ok(Array.isArray(costModel.changelog) && costModel.changelog.length >= 2, 'Must contain changelog covering Run 2 -> Run 3/4');

// Verify changelog contents
const changelogText = JSON.stringify(costModel.changelog);
assert.ok(changelogText.includes('2,000') || changelogText.includes('2000'), 'Changelog must document fixed overhead change from 2,150 to 2,000');
assert.ok(changelogText.includes('1,500') || changelogText.includes('1500'), 'Changelog must document legal compliance retainer change from 800 to 1,500');
assert.ok(changelogText.includes('variable') || changelogText.includes('per seat'), 'Changelog must document AI OCR transitioning from fixed to variable per-seat');
assert.ok(changelogText.includes('Supabase') || changelogText.includes('database'), 'Changelog must document database/cache cost removal rationale');
console.log('  [PASS] cost_model.json structure and changelog verified.');

// 2. Verify all numbers marked ASSUMPTION and roadmap/annual tiers exist
const cs = costModel.cost_structure;
assert.strictEqual(cs.fixed_overhead_monthly_hkd.hosting_edge.status, 'ASSUMPTION');
assert.strictEqual(cs.fixed_overhead_monthly_hkd.domain_dns.status, 'ASSUMPTION');
assert.strictEqual(cs.fixed_overhead_monthly_hkd.legal_compliance.status, 'ASSUMPTION');
assert.strictEqual(cs.fixed_overhead_monthly_hkd.support_base.status, 'ASSUMPTION');
assert.strictEqual(cs.founder_salary_monthly_hkd.status, 'ASSUMPTION');
assert.strictEqual(cs.pricing_tiers_monthly_hkd.advisor_pro.status, 'ASSUMPTION');
assert.strictEqual(cs.pricing_tiers_monthly_hkd.agency_team.status, 'ASSUMPTION');
assert.strictEqual(cs.payment_gateway_fees.status, 'ASSUMPTION');
assert.strictEqual(cs.seat_variable_cost_monthly_hkd.ai_ocr_tokens.status, 'ASSUMPTION');
assert.strictEqual(cs.seat_variable_cost_monthly_hkd.user_bandwidth_storage.status, 'ASSUMPTION');
assert.ok(cs.pricing_tiers_annual_hkd.advisor_pro && cs.pricing_tiers_annual_hkd.agency_team, 'Must define annual pricing tiers');
assert.ok(cs.roadmap_tiers.retail_query && cs.roadmap_tiers.enterprise_custom, 'Must define roadmap tiers');
console.log('  [PASS] All cost structure parameters strictly marked as [ASSUMPTION], annual and roadmap tiers defined.');

// 3. Verify compute_break_even.js execution and math
const computeModule = require('../scripts/compute_break_even');
const economics = computeModule.computeEconomics();

assert.strictEqual(economics.baseFixed, 2000, 'Base fixed overhead must be HK$ 2,000');
assert.strictEqual(economics.fullFixed, 37000, 'Full fixed overhead must be HK$ 37,000');
assert.strictEqual(economics.varCostPerSeat, 10, 'Variable cost per seat must be HK$ 10.00');

assert.strictEqual(economics.breakEven.modelA.individuals, 12, 'Model A individuals must be 12');
assert.strictEqual(economics.breakEven.modelA.teams, 1, 'Model A teams must be 1');
assert.strictEqual(economics.breakEven.modelB.individuals, 206, 'Model B individuals must be 206');
assert.strictEqual(economics.breakEven.modelB.teams, 17, 'Model B teams must be 17');
console.log('  [PASS] Unit economics and break-even thresholds verified from cost_model.json.');

// 4. Verify Churn Sensitivity lines
const churn = economics.churnAnalysis;
assert.ok(churn.modelA_individuals && churn.modelA_teams && churn.modelB_individuals && churn.modelB_teams, 'Must provide churn analysis for Model A and Model B');

// Model B Individuals (206 base):
const b5 = churn.modelB_individuals.find((c: any) => c.churnRatePct === 5);
const b10 = churn.modelB_individuals.find((c: any) => c.churnRatePct === 10);
const b15 = churn.modelB_individuals.find((c: any) => c.churnRatePct === 15);

assert.strictEqual(b5.newSubscribersNeededMo, 11, 'At 5% churn, 11 new subscribers/mo needed');
assert.strictEqual(b10.newSubscribersNeededMo, 21, 'At 10% churn, 21 new subscribers/mo needed');
assert.strictEqual(b15.newSubscribersNeededMo, 31, 'At 15% churn, 31 new subscribers/mo needed');

// Model B Teams (17 base, includes 2.5%):
const t2_5 = churn.modelB_teams.find((c: any) => c.churnRatePct === 2.5);
const t5 = churn.modelB_teams.find((c: any) => c.churnRatePct === 5);
const t10 = churn.modelB_teams.find((c: any) => c.churnRatePct === 10);
const t15 = churn.modelB_teams.find((c: any) => c.churnRatePct === 15);

assert.ok(t2_5, 'Must evaluate 2.5% churn for Agency Teams');
assert.strictEqual(t2_5.newTeamsNeededMo, 1, 'At 2.5% churn, 1 new team/mo needed');
assert.strictEqual(t5.newTeamsNeededMo, 1, 'At 5% churn, 1 new team/mo needed');
assert.strictEqual(t10.newTeamsNeededMo, 2, 'At 10% churn, 2 new teams/mo needed');
assert.strictEqual(t15.newTeamsNeededMo, 3, 'At 15% churn, 3 new teams/mo needed');

// Model A Teams (1 base):
assert.ok(churn.modelA_teams.length >= 4, 'Model A teams must be evaluated across all team scenarios');

// 5. Verify Dynamic Reactivity (Proof of non-hardcoding)
const customModel = JSON.parse(JSON.stringify(costModel));
customModel.cost_structure.churn_sensitivity_scenarios.advisor_pro = [
  { monthly_churn_pct: 20, status: 'ASSUMPTION' }
];
const customEcon = computeModule.computeEconomics(customModel);
assert.strictEqual(customEcon.churnAnalysis.modelB_individuals[0].churnRatePct, 20);
assert.strictEqual(customEcon.churnAnalysis.modelB_individuals[0].newSubscribersNeededMo, Math.ceil(206 * 0.20));
console.log('  [PASS] Dynamic reactivity verified: computeEconomics responds dynamically to cost_model.json adjustments.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL COST MODEL & CHURN ASSERTIONS PASSED (100% GREEN)');
console.log('================================================================================\n');

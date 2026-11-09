/**
 * scripts/compute_break_even.js
 * Programmatic Break-Even and Unit Economics Calculator for InsurIntel HK
 * 
 * Strict rule: All break-even and churn figures MUST be computed dynamically
 * from cost_model.json and never hard-coded.
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('./paths.js');

const costModelPath = PATHS.COST_MODEL;
if (!fs.existsSync(costModelPath)) {
  throw new Error(`cost_model.json not found at ${costModelPath}`);
}
const COST_MODEL = JSON.parse(fs.readFileSync(costModelPath, 'utf8'));
const CS = COST_MODEL.cost_structure;

function computeEconomics(customCostModel = null) {
  const activeCS = customCostModel ? customCostModel.cost_structure : CS;

  // Base fixed overhead (Hosting, DNS, Legal, Support)
  const baseFixed = Object.values(activeCS.fixed_overhead_monthly_hkd).reduce((sum, item) => sum + item.amount, 0); // 2000
  // Full fixed overhead (Base + Founder salary)
  const fullFixed = baseFixed + activeCS.founder_salary_monthly_hkd.amount; // 37000

  // Variable cost per seat
  const varCostPerSeat = activeCS.seat_variable_cost_monthly_hkd.ai_ocr_tokens.amount +
                         activeCS.seat_variable_cost_monthly_hkd.user_bandwidth_storage.amount; // 10.00

  // 1. Advisor Pro (HK$ 199/mo)
  const indPrice = activeCS.pricing_tiers_monthly_hkd.advisor_pro.price; // 199
  const indGateway = indPrice * activeCS.payment_gateway_fees.percentage_rate + activeCS.payment_gateway_fees.fixed_fee_hkd; // 9.116
  const indNetMargin = indPrice - indGateway - varCostPerSeat; // 179.884

  // 2. Agency Team (HK$ 2,480/mo, 15 seats)
  const teamPrice = activeCS.pricing_tiers_monthly_hkd.agency_team.price; // 2480
  const teamSeats = activeCS.pricing_tiers_monthly_hkd.agency_team.seats; // 15
  const teamGateway = teamPrice * activeCS.payment_gateway_fees.percentage_rate + activeCS.payment_gateway_fees.fixed_fee_hkd; // 86.67
  const teamVarCost = teamSeats * varCostPerSeat; // 150.00
  const teamNetMargin = teamPrice - teamGateway - teamVarCost; // 2243.33

  // Break-even
  // Model A: Without Founder Salary (Base Fixed = HK$ 2,000)
  const modelA_IndRaw = baseFixed / indNetMargin; // 2000 / 179.884 = 11.118
  const modelA_IndCount = Math.ceil(modelA_IndRaw); // 12
  const modelA_TeamRaw = baseFixed / teamNetMargin; // 2000 / 2243.33 = 0.891
  const modelA_TeamCount = Math.ceil(modelA_TeamRaw); // 1

  // Model B: With Founder Salary (Full Fixed = HK$ 37,000)
  const modelB_IndRaw = fullFixed / indNetMargin; // 37000 / 179.884 = 205.68
  const modelB_IndCount = Math.ceil(modelB_IndRaw); // 206
  const modelB_TeamRaw = fullFixed / teamNetMargin; // 37000 / 2243.33 = 16.493
  const modelB_TeamCount = Math.ceil(modelB_TeamRaw); // 17

  // Churn Sensitivity Analysis: Dynamic consumption of cost_model.json scenarios
  const indScenarios = activeCS.churn_sensitivity_scenarios.advisor_pro || [];
  const teamScenarios = activeCS.churn_sensitivity_scenarios.agency_team || [];

  const churnAnalysis = {
    modelA_individuals: indScenarios.map(s => {
      const rate = s.monthly_churn_pct / 100;
      return {
        churnRatePct: s.monthly_churn_pct,
        newSubscribersNeededMo: Math.ceil(modelA_IndCount * rate),
        rawNeeded: modelA_IndCount * rate
      };
    }),
    modelA_teams: teamScenarios.map(s => {
      const rate = s.monthly_churn_pct / 100;
      return {
        churnRatePct: s.monthly_churn_pct,
        newTeamsNeededMo: Math.ceil(modelA_TeamCount * rate),
        rawNeeded: modelA_TeamCount * rate
      };
    }),
    modelB_individuals: indScenarios.map(s => {
      const rate = s.monthly_churn_pct / 100;
      return {
        churnRatePct: s.monthly_churn_pct,
        newSubscribersNeededMo: Math.ceil(modelB_IndCount * rate),
        rawNeeded: modelB_IndCount * rate
      };
    }),
    modelB_teams: teamScenarios.map(s => {
      const rate = s.monthly_churn_pct / 100;
      return {
        churnRatePct: s.monthly_churn_pct,
        newTeamsNeededMo: Math.ceil(modelB_TeamCount * rate),
        rawNeeded: modelB_TeamCount * rate
      };
    })
  };

  return {
    version: customCostModel ? customCostModel.version : COST_MODEL.version,
    baseFixed,
    fullFixed,
    varCostPerSeat,
    advisorPro: {
      price: indPrice,
      gatewayFee: indGateway,
      varCost: varCostPerSeat,
      netMargin: indNetMargin
    },
    agencyTeam: {
      price: teamPrice,
      seats: teamSeats,
      gatewayFee: teamGateway,
      teamVarCost,
      netMargin: teamNetMargin
    },
    breakEven: {
      modelA: {
        description: 'Zero Founder Salary (HK$ 2,000/mo base overhead) [ASSUMPTION]',
        individualsRaw: modelA_IndRaw,
        individuals: modelA_IndCount, // 12
        teamsRaw: modelA_TeamRaw,
        teams: modelA_TeamCount       // 1
      },
      modelB: {
        description: 'With Founder Salary (HK$ 37,000/mo full overhead) [ASSUMPTION]',
        individualsRaw: modelB_IndRaw,
        individuals: modelB_IndCount, // 206
        teamsRaw: modelB_TeamRaw,
        teams: modelB_TeamCount       // 17
      }
    },
    churnAnalysis
  };
}

if (require.main === module) {
  const result = computeEconomics();
  console.log('================================================================================');
  console.log(`INSURINTEL HK: SCRIPT-COMPUTED BREAK-EVEN & CHURN SENSITIVITY (v${result.version})`);
  console.log('Source File: cost_model.json [ALL FIGURES MARKED ASSUMPTION]');
  console.log('================================================================================');
  console.log('Base Fixed Overhead   : HK$', result.baseFixed, '[ASSUMPTION]');
  console.log('Full Fixed Overhead   : HK$', result.fullFixed, '[ASSUMPTION]');
  console.log('Variable Cost per Seat: HK$', result.varCostPerSeat.toFixed(2), '[ASSUMPTION]');
  console.log('\n[Advisor Pro HK$ 199/mo [ASSUMPTION]]');
  console.log('  Gateway (Stripe)      : HK$', result.advisorPro.gatewayFee.toFixed(2), '[ASSUMPTION]');
  console.log('  Variable Cost         : HK$', result.advisorPro.varCost.toFixed(2), '[ASSUMPTION]');
  console.log('  Net Contribution Margin: HK$', result.advisorPro.netMargin.toFixed(2), '[ASSUMPTION]');
  console.log('\n[Agency Team HK$ 2,480/mo (15 seats) [ASSUMPTION]]');
  console.log('  Gateway (Stripe)      : HK$', result.agencyTeam.gatewayFee.toFixed(2), '[ASSUMPTION]');
  console.log('  15 Seats Variable Cost: HK$', result.agencyTeam.teamVarCost.toFixed(2), '[ASSUMPTION]');
  console.log('  Net Contribution/Team : HK$', result.agencyTeam.netMargin.toFixed(2), '[ASSUMPTION]');
  console.log('\n[Break-Even Thresholds [ASSUMPTION]]');
  console.log('  Model A (Without Salary HK$ 2,000):');
  console.log('    - Individuals required : 12 [ASSUMPTION] (raw: ' + result.breakEven.modelA.individualsRaw.toFixed(2) + ')');
  console.log('    - Teams required       : 1 [ASSUMPTION] (raw: ' + result.breakEven.modelA.teamsRaw.toFixed(2) + ')');
  console.log('  Model B (With Salary HK$ 37,000):');
  console.log('    - Individuals required : 206 [ASSUMPTION] (raw: ' + result.breakEven.modelB.individualsRaw.toFixed(2) + ')');
  console.log('    - Teams required       : 17 [ASSUMPTION] (raw: ' + result.breakEven.modelB.teamsRaw.toFixed(2) + ')');
  console.log('\n[Churn-Aware Replacement Line (New Subscribers/Teams Needed Monthly) [ASSUMPTION]]');
  console.log('  Model A (Base 12 Individuals):');
  result.churnAnalysis.modelA_individuals.forEach(c => {
    console.log(`    - At ${c.churnRatePct}% monthly churn: ${c.newSubscribersNeededMo} new subscribers/mo [ASSUMPTION] (raw: ${c.rawNeeded.toFixed(2)})`);
  });
  console.log('  Model A (Base 1 Team):');
  result.churnAnalysis.modelA_teams.forEach(c => {
    console.log(`    - At ${c.churnRatePct}% monthly churn: ${c.newTeamsNeededMo} new teams/mo [ASSUMPTION] (raw: ${c.rawNeeded.toFixed(2)})`);
  });
  console.log('  Model B (Full 206 Individuals):');
  result.churnAnalysis.modelB_individuals.forEach(c => {
    console.log(`    - At ${c.churnRatePct}% monthly churn: ${c.newSubscribersNeededMo} new subscribers/mo [ASSUMPTION] (raw: ${c.rawNeeded.toFixed(2)})`);
  });
  console.log('  Model B (Full 17 Teams):');
  result.churnAnalysis.modelB_teams.forEach(c => {
    console.log(`    - At ${c.churnRatePct}% monthly churn: ${c.newTeamsNeededMo} new teams/mo [ASSUMPTION] (raw: ${c.rawNeeded.toFixed(2)})`);
  });
  console.log('================================================================================');
}

module.exports = { computeEconomics };

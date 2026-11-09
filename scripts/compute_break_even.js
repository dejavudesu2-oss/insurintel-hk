/**
 * scripts/compute_break_even.js
 * Programmatic Break-Even and Unit Economics Calculator for InsurIntel HK
 * 
 * Strict rule: All break-even figures MUST be computed directly from this structured
 * cost table and not hand-typed.
 */

const COST_STRUCTURE = {
  fixedOverhead: {
    hostingEdge: 160,       // Vercel / Cloudflare edge hosting & CDN (HKD/mo)
    domainDns: 40,          // Namecheap / Cloudflare DNS & SSL amortized (HKD/mo)
    legalCompliance: 1500,  // Hong Kong compliance counsel retainer amortized (HKD/mo)
    supportBase: 300        // Base WhatsApp Business & communication API (HKD/mo)
  },
  founderSalary: 35000,     // Full-time founder salary baseline (HKD/mo)
  pricing: {
    advisorPro: 199,        // Advisor Pro single seat (HKD/mo)
    agencyTeam: 2480,       // Agency Team license (HKD/mo)
    agencyTeamSeats: 15     // Seats bundled in Agency Team
  },
  gateway: {
    stripeRate: 0.034,      // 3.4% Stripe Hong Kong merchant fee
    stripeFixed: 2.35       // HK$2.35 fixed fee per transaction
  },
  seatVariableCost: {
    aiOcrTokens: 5.25,      // 15 proposal scans/mo @ HK$0.35/scan
    userBandwidthStorage: 4.75 // Marginal cloud storage, messaging & sync buffer (HKD/seat/mo)
  }
};

function computeEconomics() {
  const baseFixed = Object.values(COST_STRUCTURE.fixedOverhead).reduce((a, b) => a + b, 0); // 2000
  const fullFixed = baseFixed + COST_STRUCTURE.founderSalary; // 37000

  const varCostPerSeat = COST_STRUCTURE.seatVariableCost.aiOcrTokens + COST_STRUCTURE.seatVariableCost.userBandwidthStorage; // 10.00

  // Advisor Pro
  const indPrice = COST_STRUCTURE.pricing.advisorPro;
  const indGateway = indPrice * COST_STRUCTURE.gateway.stripeRate + COST_STRUCTURE.gateway.stripeFixed; // 9.116
  const indNetMargin = indPrice - indGateway - varCostPerSeat; // 179.884

  // Agency Team
  const teamPrice = COST_STRUCTURE.pricing.agencyTeam;
  const teamGateway = teamPrice * COST_STRUCTURE.gateway.stripeRate + COST_STRUCTURE.gateway.stripeFixed; // 86.67
  const teamSeats = COST_STRUCTURE.pricing.agencyTeamSeats; // 15
  const teamVarCost = teamSeats * varCostPerSeat; // 15 * 10 = 150
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

  return {
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
        description: 'Zero Founder Salary (HK$ 2,000/mo base overhead)',
        individualsRaw: modelA_IndRaw,
        individuals: modelA_IndCount, // 12
        teamsRaw: modelA_TeamRaw,
        teams: modelA_TeamCount       // 1
      },
      modelB: {
        description: 'With Founder Salary (HK$ 37,000/mo full overhead)',
        individualsRaw: modelB_IndRaw,
        individuals: modelB_IndCount, // 206
        teamsRaw: modelB_TeamRaw,
        teams: modelB_TeamCount       // 17
      }
    }
  };
}

if (require.main === module) {
  const result = computeEconomics();
  console.log('================================================================================');
  console.log('INSURINTEL HK: SCRIPT-COMPUTED BREAK-EVEN & UNIT ECONOMICS');
  console.log('================================================================================');
  console.log('Base Fixed Overhead: HK$', result.baseFixed);
  console.log('Full Fixed Overhead: HK$', result.fullFixed);
  console.log('Variable Cost per Seat: HK$', result.varCostPerSeat);
  console.log('\n[Advisor Pro HK$ 199/mo]');
  console.log('  Gateway (Stripe): HK$', result.advisorPro.gatewayFee.toFixed(2));
  console.log('  Variable Cost: HK$', result.advisorPro.varCost.toFixed(2));
  console.log('  Net Contribution Margin: HK$', result.advisorPro.netMargin.toFixed(2));
  console.log('\n[Agency Team HK$ 2,480/mo (15 seats)]');
  console.log('  Gateway (Stripe): HK$', result.agencyTeam.gatewayFee.toFixed(2));
  console.log('  15 Seats Variable Cost: HK$', result.agencyTeam.teamVarCost.toFixed(2));
  console.log('  Net Contribution Margin per Team: HK$', result.agencyTeam.netMargin.toFixed(2));
  console.log('\n[Break-Even Thresholds]');
  console.log('  Model A (Without Salary HK$ 2,000):');
  console.log('    - Individuals required:', result.breakEven.modelA.individuals, '(raw: ' + result.breakEven.modelA.individualsRaw.toFixed(2) + ')');
  console.log('    - Teams required:', result.breakEven.modelA.teams, '(raw: ' + result.breakEven.modelA.teamsRaw.toFixed(2) + ')');
  console.log('  Model B (With Salary HK$ 37,000):');
  console.log('    - Individuals required:', result.breakEven.modelB.individuals, '(raw: ' + result.breakEven.modelB.individualsRaw.toFixed(2) + ')');
  console.log('    - Teams required:', result.breakEven.modelB.teams, '(raw: ' + result.breakEven.modelB.teamsRaw.toFixed(2) + ')');
  console.log('================================================================================');
}

module.exports = { COST_STRUCTURE, computeEconomics };

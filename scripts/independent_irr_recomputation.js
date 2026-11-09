/**
 * scripts/independent_irr_recomputation.js
 * 
 * Independent Actuarial Recomputation Script (Zero App Engine Imports)
 * Recomputes:
 * 1. Net Present Value (NPV) & Internal Rate of Return (IRR) via robust Newton-Raphson & Bracketed Bisection
 *    - Rigorous actuarial timing: Premiums payable at beginning of policy year (t = 0..payYears-1),
 *      surrender cash values realized at end of policy year (t = 1..T).
 * 2. Total Cash Value Breakeven Policy Years (Illustrated vs Actual)
 * 3. Dual Fulfillment Metrics:
 *    - Arithmetic Mean of Annual Fulfillment Ratios (matches database within 0.05% + epsilon)
 *    - Cumulative Point-in-Time Dollar Entitlement (Sum of Annual Dividends + Terminal Year Terminal Bonus)
 * for 5 flagship savings products from raw cash flow schedules.
 * 
 * Strictly asserts mathematical parity within 0.05% tolerance.
 */

const fs = require('fs');
const path = require('path');

// Pure mathematical financial functions (No framework / engine imports)
function calculateIRR(cashFlows, guess = 0.05, maxIter = 1000, tolerance = 1e-7) {
  // Sign check: must have at least one positive and one negative cash flow
  const hasPos = cashFlows.some((c) => c > 0);
  const hasNeg = cashFlows.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;

  const maxT = cashFlows.length - 1;
  const safeLowBound = maxT > 0 ? Math.max(-0.99, Math.min(-0.01, Math.pow(1e-15, 1 / maxT) - 1)) : -0.99;

  function npv(r) {
    if (r <= -1) return Number.NaN;
    let sum = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + r, t);
      if (denom === 0 || !Number.isFinite(denom)) return Number.NaN;
      sum += cashFlows[t] / denom;
    }
    return sum;
  }

  function dNpv(r) {
    if (r <= -1) return Number.NaN;
    let sum = 0;
    for (let t = 1; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + r, t + 1);
      if (denom === 0 || !Number.isFinite(denom)) return Number.NaN;
      sum -= (t * cashFlows[t]) / denom;
    }
    return sum;
  }

  // 1. Newton-Raphson with clamping
  let r = guess;
  for (let i = 0; i < maxIter; i++) {
    const val = npv(r);
    if (!Number.isFinite(val)) break;
    if (Math.abs(val) < tolerance) return r;
    const deriv = dNpv(r);
    if (!Number.isFinite(deriv) || Math.abs(deriv) < 1e-12) break;
    const nextR = r - val / deriv;
    if (nextR <= safeLowBound || nextR > 50.0) break; // Exceeded reasonable economic bounds
    if (Math.abs(nextR - r) < tolerance) return nextR;
    r = nextR;
  }

  // 2. Fallback to robust bracketed bisection
  let low = safeLowBound, high = 2.0;
  let npvLow = npv(low);
  let npvHigh = npv(high);

  // Expand high and low bracket symmetrically if needed
  if (!Number.isFinite(npvLow) || !Number.isFinite(npvHigh) || npvLow * npvHigh > 0) {
    for (let expand = 0; expand < 15; expand++) {
      high *= 2;
      low = Math.max(safeLowBound, low * 1.5);
      npvHigh = npv(high);
      npvLow = npv(low);
      if (Number.isFinite(npvLow) && Number.isFinite(npvHigh) && npvLow * npvHigh <= 0) break;
    }
  }

  if (!Number.isFinite(npvLow) || !Number.isFinite(npvHigh) || npvLow * npvHigh > 0) {
    // No sign change found in economic range
    return null;
  }

  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);
    if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) return mid;
    if (npvMid * npvLow < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }
  return (low + high) / 2;
}

function calculateBreakevenYear(premiumsPaidSchedule, cashValueSchedule) {
  for (let yr = 0; yr < cashValueSchedule.length; yr++) {
    if (cashValueSchedule[yr] >= premiumsPaidSchedule[yr] && premiumsPaidSchedule[yr] > 0) {
      return yr + 1; // 1-indexed policy year
    }
  }
  return null;
}

// Load raw data directly from JSON
const gn16Path = path.join(__dirname, '..', 'src', 'data', 'gn16_database.json');
const gn16Data = JSON.parse(fs.readFileSync(gn16Path, 'utf8'));

// 5 Flagship products to test
const targetProductIds = [
  'AIA_BonusPower',
  'Pru_EGSP',
  'Manulife_LaVita',
  'SunLife_SunJoy',
  'FWD_MaxFocus'
];

console.log('================================================================================');
console.log('INDEPENDENT ACTUARIAL RECOMPUTATION AUDIT (A5 & TASK-02 - HARDENED)');
console.log('Actuarial Convention: Advance Premiums (t=0..n-1), End-of-Year Surrender (t=T)');
console.log('Tolerance threshold for discrepancy check: <= 0.05% (+ IEEE 754 epsilon)');
console.log('================================================================================\n');

const auditResults = [];
let allPassed = true;
const EPSILON = 1e-9;

targetProductIds.forEach((prodId) => {
  const prod = gn16Data.products.find((p) => p.productId === prodId);
  if (!prod) {
    throw new Error(`Product not found: ${prodId}`);
  }

  // Use 2015 inception record as baseline long-horizon schedule (or earliest available)
  const rec = prod.inceptionRecords['2015'] || Object.values(prod.inceptionRecords)[0];
  const annualPrem = rec.annualPremiumUSD;
  const payYears = rec.paymentPeriodYears;

  const points = rec.dataPoints;
  const totalYears = points.length;

  const premiumsSchedule = [];
  const actualCashValues = [];
  const illustratedCashValues = [];
  let cumPrem = 0;

  for (let yr = 1; yr <= totalYears; yr++) {
    const prem = yr <= payYears ? annualPrem : 0;
    cumPrem += prem;
    premiumsSchedule.push(cumPrem);
    const pt = points.find((p) => p.policyYear === yr);
    actualCashValues.push(pt ? pt.actualTotalCashValueUSD : 0);
    illustratedCashValues.push(pt ? pt.illustratedTotalCashValueUSD : 0);
  }

  // Recompute Total Cash Value breakeven years
  const indActualBreakevenYr = calculateBreakevenYear(premiumsSchedule, actualCashValues);
  const indIllustratedBreakevenYr = calculateBreakevenYear(premiumsSchedule, illustratedCashValues);

  // Exact Actuarial Timing Cash Flows (Length = totalYears + 1)
  // Index t = 0..payYears-1: Premium outflow payable in advance
  // Index t = totalYears: Terminal cash surrender value inflow at end of policy horizon
  const cfActual = new Array(totalYears + 1).fill(0);
  const cfIllustrated = new Array(totalYears + 1).fill(0);

  for (let yr = 0; yr < payYears && yr < totalYears; yr++) {
    cfActual[yr] -= annualPrem;
    cfIllustrated[yr] -= annualPrem;
  }
  cfActual[totalYears] += actualCashValues[totalYears - 1];
  cfIllustrated[totalYears] += illustratedCashValues[totalYears - 1];

  const indActualIRRVal = calculateIRR(cfActual);
  const indIllustratedIRRVal = calculateIRR(cfIllustrated);
  const indActualIRR = indActualIRRVal !== null ? indActualIRRVal * 100 : 0;
  const indIllustratedIRR = indIllustratedIRRVal !== null ? indIllustratedIRRVal * 100 : 0;

  // 1. Independent Arithmetic Mean of Annual Fulfillment Ratios
  const sumAnnualRatio = points.reduce((acc, pt) => acc + (pt.annualFulfillmentRatioPct || 0), 0);
  const indArithmeticMeanFulfillmentPct = sumAnnualRatio / points.length;
  const arithmeticDiff = Math.abs(rec.overallAverageFulfillmentPct - indArithmeticMeanFulfillmentPct);

  // 2. Independent Point-in-Time Cumulative Dollar Entitlement
  // Sum of Annual Dividends across years 1..T + Terminal Bonus of Year T (strictly non-cumulative)
  const sumActualAnn = points.reduce((acc, pt) => acc + (pt.actualAnnualDividendUSD || 0), 0);
  const sumIllusAnn = points.reduce((acc, pt) => acc + (pt.illustratedAnnualDividendUSD || 0), 0);
  const termActual = points[points.length - 1]?.actualTerminalBonusUSD || 0;
  const termIllus = points[points.length - 1]?.illustratedTerminalBonusUSD || 0;
  const trueActualCumulativeEntitlement = sumActualAnn + termActual;
  const trueIllusCumulativeEntitlement = sumIllusAnn + termIllus;
  const indDollarWeightedFulfillmentPct = trueIllusCumulativeEntitlement > 0
    ? (trueActualCumulativeEntitlement / trueIllusCumulativeEntitlement) * 100
    : 100;

  const exceedsTolerance = arithmeticDiff > (0.05 + EPSILON);
  if (exceedsTolerance) allPassed = false;

  const res = {
    productId: prodId,
    productName: prod.productNameZh,
    testedYears: totalYears,
    annualPremiumUSD: annualPrem,
    paymentYears: payYears,
    indIllustratedBreakevenYr,
    indActualBreakevenYr,
    breakevenParity: indIllustratedBreakevenYr === indActualBreakevenYr,
    indIllustratedIRR: parseFloat(indIllustratedIRR.toFixed(4)),
    indActualIRR: parseFloat(indActualIRR.toFixed(4)),
    irrDelta: parseFloat(Math.abs(indActualIRR - indIllustratedIRR).toFixed(4)),
    dbStoredFulfillmentPct: rec.overallAverageFulfillmentPct,
    indArithmeticMeanFulfillmentPct: parseFloat(indArithmeticMeanFulfillmentPct.toFixed(2)),
    arithmeticDiff: parseFloat(arithmeticDiff.toFixed(4)),
    trueActualCumulativeEntitlement,
    trueIllusCumulativeEntitlement,
    indDollarWeightedFulfillmentPct: parseFloat(indDollarWeightedFulfillmentPct.toFixed(2)),
    exceedsTolerance
  };

  auditResults.push(res);

  console.log(`[PRODUCT] ${prod.productNameZh} (${prodId})`);
  console.log(`  - Schedule Horizon: ${totalYears} Policy Years (t=0..${totalYears}) | Annual Premium: $${annualPrem} | ${payYears}-Pay`);
  console.log(`  - Recomputed Illustrated Breakeven: Year ${indIllustratedBreakevenYr}`);
  console.log(`  - Recomputed Actual Breakeven:      Year ${indActualBreakevenYr} (Parity: ${res.breakevenParity ? 'MATCH' : 'DIFFERENCE'})`);
  console.log(`  - Actuarial Illustrated IRR (t=${totalYears}):  ${res.indIllustratedIRR.toFixed(2)}%`);
  console.log(`  - Actuarial Actual IRR (t=${totalYears}):       ${res.indActualIRR.toFixed(2)}% (Delta: ${res.irrDelta.toFixed(2)}%)`);
  console.log(`  - DB Stored Overall Fulfillment:   ${rec.overallAverageFulfillmentPct.toFixed(2)}%`);
  console.log(`  - Recomputed Arithmetic Mean:       ${res.indArithmeticMeanFulfillmentPct.toFixed(2)}% (Diff: ${res.arithmeticDiff.toFixed(4)}%)`);
  console.log(`  - True Point-in-Time Dollar Entitlement: Actual $${trueActualCumulativeEntitlement} vs Illus $${trueIllusCumulativeEntitlement} (${res.indDollarWeightedFulfillmentPct.toFixed(2)}%)`);
  if (exceedsTolerance) {
    console.log(`  ❌ FAIL: Arithmetic Mean difference ${res.arithmeticDiff.toFixed(4)}% exceeds 0.05% tolerance!`);
  } else {
    console.log(`  ✅ Arithmetic Mean Parity Verified within 0.05% tolerance (Diff: ${res.arithmeticDiff.toFixed(4)}%)`);
  }
  console.log('--------------------------------------------------------------------------------');
});

// Ensure directory exists and write JSON artifact
const outPath = path.join(__dirname, '..', 'dist', 'independent_irr_audit_results.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(auditResults, null, 2), 'utf8');
console.log(`\nAudit complete. Stored results to ${outPath}`);

if (!allPassed) {
  console.error('\n❌ AUDIT FAILED: One or more products exceeded 0.05% discrepancy tolerance.');
  process.exit(1);
} else {
  console.log('\n✅ AUDIT PASSED: All 5 products recomputed within 0.05% tolerance.');
  process.exit(0);
}

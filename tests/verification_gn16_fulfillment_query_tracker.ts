/**
 * tests/verification_gn16_fulfillment_query_tracker.ts
 * Rigorous Verification Suite for:
 * 香港保险跨境保单「利益演示红利真实达成率」查询器 (GN16 Fulfillment Ratio Tracker)
 *
 * Covers:
 * 1. GN16 Historical Database Integrity (12 insurers, flagship savings products, historical ledgers)
 * 2. Reconciliation Engine & Dual-Line Curve Calculations
 * 3. SEO Keyword Matching (Zero-Labor Organic Acquisition)
 * 4. Monetization Logic ($49 Retail Watermarked vs $199 Agent Watermark-Free + Digital Card)
 * 5. Advisor Pitch & Lead-Generation Exporters (WhatsApp & WeChat GL20 Compliance)
 * 6. Web App UI Integration (Header Quick-Action, Query Modal, SVG Comparison Chart, Pay Modal)
 * 7. Standalone SEO Utility Landing Page (Schema.org, Meta Tags, URL Query Parsing)
 * 8. Byte-for-Byte SHA-256 Parity Across Distribution Targets
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  getGN16Database,
  getGN16Insurers,
  getGN16ProductsByInsurer,
  findGN16Product,
  matchSEOKeyword,
  calculateGN16Reconciliation,
  generateGN16WhatsAppPitch,
  generateGN16WechatPitch
} from '../src/engine/gn16_engine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`  [PASS] ${msg}`);
}

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

console.log('================================================================================');
console.log('INSURINTEL HK - GN16 FULFILLMENT RATIO TRACKER VERIFICATION');
console.log('================================================================================\n');

// --- [TEST SUITE] 1. GN16 Historical Database Integrity ---
console.log('--- [TEST SUITE] 1. GN16 Historical Database Integrity ---');
const db = getGN16Database();
assert(db.totalInsurersCount >= 12, `Covers at least 12 major HK insurers (found: ${db.totalInsurersCount})`);
assert(db.products.length >= 12, `Covers at least 12 flagship participating savings products (found: ${db.products.length})`);

const insurers = getGN16Insurers();
const requiredInsurers = ['AIA', 'Prudential', 'Manulife', 'Sun_Life', 'FWD', 'AXA', 'BOC_Life', 'ChinaLife'];
for (const ins of requiredInsurers) {
  assert(!!insurers[ins], `Insurer [${ins}] exists in database metadata with official disclosure URL`);
  assert(insurers[ins].officialDisclosurePdfUrl.startsWith('http'), `Insurer [${ins}] has valid disclosure URL`);
}

const aiaProducts = getGN16ProductsByInsurer('AIA');
assert(aiaProducts.length >= 2, `AIA has at least 2 flagship savings series (Bonus Power, Global Power 3)`);

const pruEgsp = findGN16Product('Pru_EGSP');
assert(!!pruEgsp, 'Prudential EGSP (隽升) exists in database');
assert(pruEgsp!.supportedInceptionYears.includes(2015), 'Prudential EGSP includes 2015 inception year');
assert(pruEgsp!.inceptionRecords[2015].dataPoints.length >= 5, 'Prudential EGSP 2015 has multi-year ledger data points');

// --- [TEST SUITE] 2. Reconciliation Engine Calculations ---
console.log('\n--- [TEST SUITE] 2. Reconciliation Engine Calculations ---');
const pruReconciliation = calculateGN16Reconciliation({
  insurerCode: 'Prudential',
  productId: 'Pru_EGSP',
  inceptionYear: 2015,
  customAnnualPremiumUSD: 20000,
  tier: 'retail_49'
});

assert(pruReconciliation.scaleFactor === 2, 'Scale factor is 2.0 for $20,000 USD custom premium vs $10,000 base');
assert(pruReconciliation.adjustedCumulativeIllustratedUSD > 0, 'Cumulative illustrated dividend is positive');
assert(pruReconciliation.adjustedCumulativeActualUSD > 0, 'Cumulative actual dividend is positive');
assert(
  pruReconciliation.adjustedCumulativeVarianceUSD === pruReconciliation.adjustedCumulativeActualUSD - pruReconciliation.adjustedCumulativeIllustratedUSD,
  'Adjusted variance equals actual minus illustrated dividend'
);
assert(typeof pruReconciliation.averageFulfillmentRatioPct === 'number', 'Average fulfillment ratio is computed as a percentage');

// --- [TEST SUITE] 3. SEO Keyword Matching ---
console.log('\n--- [TEST SUITE] 3. SEO Keyword Matching ---');
const testKeywords = [
  { kw: '友邦充裕未来红利实现率', expectedProduct: 'AIA_BonusPower' },
  { kw: '保诚隽升实际回报', expectedProduct: 'Pru_EGSP' },
  { kw: '宏利赤霞珠分红达成', expectedProduct: 'Manulife_LaVita' },
  { kw: '安盛安进红利兑现', expectedProduct: 'AXA_SmartSaver' },
  { kw: '富卫盈丰分红对账', expectedProduct: 'FWD_MaxFocus' },
  { kw: '永明万年青红利实现率', expectedProduct: 'SunLife_SunJoy' },
  { kw: '国寿裕饶多元分红', expectedProduct: 'ChinaLife_Prosperity' }
];

for (const item of testKeywords) {
  const match = matchSEOKeyword(item.kw);
  assert(!!match, `SEO keyword "${item.kw}" successfully resolved to a product`);
  assert(match!.product.productId === item.expectedProduct, `Keyword "${item.kw}" resolved to expected ${item.expectedProduct} (got: ${match?.product.productId})`);
}

// --- [TEST SUITE] 4. Monetization Logic ($49 Retail vs $199 Agent) ---
console.log('\n--- [TEST SUITE] 4. Monetization Logic ($49 Retail vs $199 Agent) ---');
const retailResult = calculateGN16Reconciliation({
  insurerCode: 'AIA',
  productId: 'AIA_BonusPower',
  inceptionYear: 2018,
  tier: 'retail_49'
});
assert(retailResult.watermarkText.includes('投保人私人存檔'), 'Retail $49 tier produces watermarked report ("投保人私人存檔")');
assert(retailResult.canAttachAgentCard === false, 'Retail $49 tier does NOT allow agent business card attachment');
assert(retailResult.agentCardHtml === undefined, 'Retail $49 tier has no agent card HTML');

const agentResult = calculateGN16Reconciliation({
  insurerCode: 'AIA',
  productId: 'AIA_BonusPower',
  inceptionYear: 2018,
  tier: 'agent_199',
  agentProfile: {
    name: '李家豪 (Kelvin Lee)',
    title: '資深區域總監 (Senior District Director)',
    licenseNumber: 'IA-AG882910',
    agencyTeam: '領峰資產財富管理區',
    phoneNumber: '+852 9123 4567',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  }
});
assert(agentResult.watermarkText === '', 'Agent $199 tier is 100% watermark-free (empty watermark string)');
assert(agentResult.canAttachAgentCard === true, 'Agent $199 tier permits digital business card attachment');
assert(!!agentResult.agentCardHtml && agentResult.agentCardHtml.includes('李家豪'), 'Agent card HTML embeds agent name');
assert(agentResult.agentCardHtml!.includes('IA-AG882910'), 'Agent card HTML embeds agent license number');

// --- [TEST SUITE] 5. Advisor Pitch Exporters ---
console.log('\n--- [TEST SUITE] 5. Advisor Pitch Exporters ---');
const waPitch = generateGN16WhatsAppPitch(agentResult);
assert(waPitch.includes('香港保單利益演示真實達成率對賬簡報'), 'WhatsApp pitch has professional report headline');
assert(waPitch.includes('GL20'), 'WhatsApp pitch includes HKIA GL20 regulatory compliance disclaimer');
assert(waPitch.includes('歷年平均達成率'), 'WhatsApp pitch features historical average fulfillment metrics');

const wechatPitch = generateGN16WechatPitch(agentResult);
assert(wechatPitch.includes('香港保監局 GN16 法定數據揭秘'), 'WeChat pitch highlights statutory GN16 disclosures');
assert(wechatPitch.includes('私信我，一鍵免費出具'), 'WeChat pitch includes effective CTA for social prospecting');

// --- [TEST SUITE] 6. Mobile Café Web App HTML Elements ---
console.log('\n--- [TEST SUITE] 6. Mobile Café Web App HTML Elements ---');
const cafeHtmlPath = path.join(__dirname, '..', 'templates', 'mobile_cafe_app.html');
const cafeHtml = fs.readFileSync(cafeHtmlPath, 'utf8');

assert(cafeHtml.includes('id="btn-open-gn16-tracker"'), 'Web app contains header/quick-action button for GN16 tracker');
assert(cafeHtml.includes('id="gn16-hero-callout-bar"'), 'Web app contains prominent hero callout bar for GN16 tracker');
assert(cafeHtml.includes('id="gn16-query-modal"'), 'Web app contains dedicated GN16 Query Modal');
assert(cafeHtml.includes('id="gn16-insurer-select"'), 'GN16 Modal contains Insurer selection dropdown');
assert(cafeHtml.includes('id="gn16-product-select"'), 'GN16 Modal contains Product series selection dropdown');
assert(cafeHtml.includes('id="gn16-year-select"'), 'GN16 Modal contains Inception year selection dropdown');
assert(cafeHtml.includes('id="gn16-premium-input"'), 'GN16 Modal contains Custom annual premium input');
assert(cafeHtml.includes('id="gn16-chart-container"'), 'GN16 Modal contains dynamic dual-line curve chart container');
assert(cafeHtml.includes('id="gn16-pay-modal"'), 'Web app contains GN16 Checkout/Payment Modal ($49 vs $199)');
assert(cafeHtml.includes('HK$49'), 'Payment modal presents HK$49 single audit report option');
assert(cafeHtml.includes('HK$199'), 'Payment modal presents HK$199 / month Advisor Pro tier');
assert(cafeHtml.includes('gn16-watermark-overlay'), 'CSS includes watermark overlay classes');

// --- [TEST SUITE] 7. Standalone SEO Utility Landing Page ---
console.log('\n--- [TEST SUITE] 7. Standalone SEO Utility Landing Page ---');
const distTrackerPath = path.join(__dirname, '..', 'dist', 'gn16_tracker.html');
assert(fs.existsSync(distTrackerPath), 'dist/gn16_tracker.html exists as standalone SEO utility site');
const trackerHtml = fs.readFileSync(distTrackerPath, 'utf8');

assert(trackerHtml.includes('application/ld+json'), 'Standalone tracker page includes Schema.org JSON-LD structured data');
assert(trackerHtml.includes('FinancialProduct') || trackerHtml.includes('SoftwareApplication'), 'Structured data includes FinancialProduct / SoftwareApplication schema');
assert(trackerHtml.includes('checkGN16UrlParams'), 'Standalone tracker page has URL parameter parser for search landing');
assert(trackerHtml.includes('openGN16QueryModal'), 'Standalone tracker page auto-invokes openGN16QueryModal() on arrival');

// --- [TEST SUITE] 8. Byte-for-Byte SHA-256 Parity ---
console.log('\n--- [TEST SUITE] 8. Byte-for-Byte SHA-256 Parity ---');
const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
const distCafePath = path.join(__dirname, '..', 'dist', 'cafe.html');

const templateHash = sha256(cafeHtml);
const indexHash = sha256(fs.readFileSync(distIndexPath, 'utf8'));
const cafeDistHash = sha256(fs.readFileSync(distCafePath, 'utf8'));

console.log(`  Template SHA-256: ${templateHash}`);
console.log(`  Dist Index SHA-256: ${indexHash}`);
console.log(`  Dist Cafe SHA-256: ${cafeDistHash}`);

assert(templateHash === indexHash, 'templates/mobile_cafe_app.html and dist/index.html have identical SHA-256 hash');
assert(templateHash === cafeDistHash, 'templates/mobile_cafe_app.html and dist/cafe.html have identical SHA-256 hash');

console.log('\n================================================================================');
console.log('SUMMARY: ALL GN16 FULFILLMENT TRACKER VERIFICATION TESTS PASSED (100% GREEN)');
console.log('================================================================================');

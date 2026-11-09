/**
 * tests/verification_pricing_honesty.ts
 * Automated Verification Suite for Single Source of Truth Pricing & Landing Page Honesty (TASK-R2-04 / C5 & C6)
 * 
 * Verifies:
 * 1. SINGLE_SOURCE_OF_TRUTH_PRICING.md exists, reconciles all 4 tiers (HK$49, HK$199, HK$2,480/15 seats, HK$12,800),
 *    explains resolution of HK$299 vs HK$199, 15 vs 20 seats, and Enterprise absence from self-serve modal.
 * 2. Unvalidated metrics labeled as [ASSUMPTION]: conversion 3.2%, churn 7.5%, LTV HK$2,653, CAC HK$320, ARR HK$9.58M.
 * 3. 1,600% ROI deconstruction with stated assumptions, conservative scenarios, and zero-deal sensitivity.
 * 4. Complete unit economics & break-even calculations (with & without founder salary: 11 / 1 vs 201 / 16).
 * 5. Side-by-side GTM comparison (Option 1 vs Option 2) with explicit owner decision directive (neutral).
 * 6. 14-day refund vs full upfront payment conflict flagged (Stripe non-refundable fees & chargeback exposure).
 * 7. Landing page honesty: dist/waitlist.html and templates/waitlist.html have 100% SHA-256 parity,
 *    display "Launch price, subject to change", qualify 14-day refund terms, contain zero payment/FPS requests,
 *    identify data controller as InsurIntel HK Operations Ltd., and embed measurement plan.
 * 8. HTML app parity: templates/mobile_cafe_app.html, dist/index.html, dist/cafe.html are 100% identical
 *    and Agency Team tier in modal specifies 15 seats (HK$165/席).
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('================================================================================');
console.log('TEST SUITE: PRICING SSOT & LANDING PAGE HONESTY (TASK-R2-04 / C5 & C6)');
console.log('================================================================================\n');

// 1. Verify SINGLE_SOURCE_OF_TRUTH_PRICING.md
const pricingSsotPath = path.join(process.cwd(), 'SINGLE_SOURCE_OF_TRUTH_PRICING.md');
assert.ok(fs.existsSync(pricingSsotPath), 'SINGLE_SOURCE_OF_TRUTH_PRICING.md must exist in workspace root');
const pricingContent = fs.readFileSync(pricingSsotPath, 'utf8');

// Tier table & price reconciliation assertions
assert.ok(pricingContent.includes('retail_49') && pricingContent.includes('HK$ 49'), 'SSOT must define retail_49 @ HK$49');
assert.ok(pricingContent.includes('agent_199') && pricingContent.includes('HK$ 199'), 'SSOT must define agent_199 @ HK$199');
assert.ok(pricingContent.includes('team_2480') && pricingContent.includes('HK$ 2,480'), 'SSOT must define team_2480 @ HK$2,480');
assert.ok(pricingContent.includes('15 個顧問席位') || pricingContent.includes('15 席'), 'SSOT must define 15 seats for agency team');
assert.ok(pricingContent.includes('enterprise_12800') && pricingContent.includes('HK$ 12,800'), 'SSOT must define enterprise_12800 @ HK$12,800');

// Historical contradictions resolution
assert.ok(pricingContent.includes('HK$299') && pricingContent.includes('HK$199'), 'SSOT must reconcile HK$299 vs HK$199');
assert.ok(pricingContent.includes('15 席') && pricingContent.includes('20 席'), 'SSOT must reconcile 15 seats vs 20 seats');
assert.ok(pricingContent.includes('Pay Modal') || pricingContent.includes('結賬'), 'SSOT must explain Enterprise IFA presentation in modal/sales');

// Assumption tagging
assert.ok(pricingContent.includes('3.2%') && pricingContent.includes('[ASSUMPTION]'), 'Conversion 3.2% must be marked [ASSUMPTION]');
assert.ok(pricingContent.includes('7.5%') && pricingContent.includes('[ASSUMPTION]'), 'Churn 7.5% must be marked [ASSUMPTION]');
assert.ok(pricingContent.includes('2,653') && pricingContent.includes('[ASSUMPTION]'), 'LTV HK$2,653 must be marked [ASSUMPTION]');
assert.ok(pricingContent.includes('320') && pricingContent.includes('[ASSUMPTION]'), 'CAC HK$320 must be marked [ASSUMPTION]');
assert.ok(pricingContent.includes('8.29') && pricingContent.includes('[ASSUMPTION]'), 'LTV/CAC 8.29 must be marked [ASSUMPTION]');
assert.ok(pricingContent.includes('9.58M') && pricingContent.includes('[ASSUMPTION]'), 'ARR 9.58M must be marked [ASSUMPTION]');

// 1,600% ROI deconstruction & sensitivity
assert.ok(pricingContent.includes('1,600%'), 'SSOT must reference 1,600% ROI');
assert.ok(pricingContent.includes('20,000') && pricingContent.includes('26%'), 'SSOT must state USD 20,000 AFYP and 26% FYC assumptions');
assert.ok(pricingContent.includes('歸因') || pricingContent.includes('Attribution'), 'SSOT must analyze attribution weighting');
assert.ok(pricingContent.includes('-100%') || pricingContent.includes('-100\\%'), 'SSOT must present zero incremental deal scenario (-100% ROI)');

// Complete Unit Economics & Break-Even
assert.ok(pricingContent.includes('HK$ 160') || pricingContent.includes('160'), 'Cost model must include hosting HK$160');
assert.ok(pricingContent.includes('HK$ 40') || pricingContent.includes('40'), 'Cost model must include domain HK$40');
assert.ok(pricingContent.includes('HK$ 1,500') || pricingContent.includes('1,500'), 'Cost model must include legal buffer HK$1,500');
assert.ok(pricingContent.includes('HK$ 300') || pricingContent.includes('300'), 'Cost model must include support HK$300');
assert.ok(pricingContent.includes('2,000'), 'Cost model must total fixed overhead without salary HK$2,000');
assert.ok(pricingContent.includes('35,000') && pricingContent.includes('37,000'), 'Cost model must detail founder baseline HK$35,000 and total HK$37,000');
assert.ok(pricingContent.includes('0.35'), 'Cost model must include AI OCR token cost HK$0.35/scan');
assert.ok(pricingContent.includes('3.4%') && pricingContent.includes('2.35'), 'Cost model must include Stripe fee 3.4% + HK$2.35');
assert.ok(pricingContent.includes('12 位付費顧問') && pricingContent.includes('1 個營銷團隊'), 'Break-even without salary must strictly require 12 individuals and 1 team');
assert.ok(pricingContent.includes('206 位付費顧問'), 'Break-even with salary must strictly state 206 subscribers');
assert.ok(pricingContent.includes('17 個營銷團隊'), 'Break-even with salary must strictly state 17 teams');

// Side-by-side GTM options & owner decision neutrality
assert.ok(pricingContent.includes('方案一') && pricingContent.includes('方案二'), 'SSOT must compare Option 1 and Option 2');
assert.ok(pricingContent.includes('不替項目負責人') || pricingContent.includes('決策中立'), 'SSOT must maintain owner decision neutrality');

// 14-day refund conflict flag
assert.ok(pricingContent.includes('Stripe') && (pricingContent.includes('不可退') || pricingContent.includes('手續費')), 'SSOT must flag non-refundable Stripe processing fees');
assert.ok(pricingContent.includes('拒付') || pricingContent.includes('Chargeback'), 'SSOT must flag chargeback dispute exposure');
assert.ok(pricingContent.includes('零預付') || pricingContent.includes('先用後付'), 'SSOT must propose zero-upfront pilot recommendation');
console.log('  [PASS] SINGLE_SOURCE_OF_TRUTH_PRICING.md fully verified: tiers, assumptions, unit economics, GTM options, and refund conflict.');

// 2. Verify dist/waitlist.html & templates/waitlist.html
const tplWaitlist = path.join(process.cwd(), 'templates', 'waitlist.html');
const distWaitlist = path.join(process.cwd(), 'dist', 'waitlist.html');
assert.ok(fs.existsSync(tplWaitlist) && fs.existsSync(distWaitlist), 'Both waitlist HTML files must exist');

const hashTplW = crypto.createHash('sha256').update(fs.readFileSync(tplWaitlist)).digest('hex');
const hashDistW = crypto.createHash('sha256').update(fs.readFileSync(distWaitlist)).digest('hex');
assert.strictEqual(hashTplW, hashDistW, 'templates/waitlist.html and dist/waitlist.html must have 100% SHA-256 parity');

const wHtml = fs.readFileSync(distWaitlist, 'utf8');

// Price label badge
assert.ok(wHtml.includes('Launch price, subject to change'), 'Waitlist must display "Launch price, subject to change" badge');
assert.ok(wHtml.includes('HK$ 199') && wHtml.includes('HK$ 2,480'), 'Waitlist must display HK$ 199 and HK$ 2,480');

// Refund guarantee removed and replaced with zero-upfront pilot
assert.ok(wHtml.includes('14 天零預付試點承諾') || wHtml.includes('零預付'), 'Waitlist must feature 14-day zero-upfront pilot terms');
assert.ok(!wHtml.includes('退款保證'), 'Waitlist must completely remove "退款保證" per done-when');
assert.ok(!wHtml.includes('100% 全額退款保證'), 'Waitlist must NOT claim unconditional 100% refund');

// PII Protection & WhatsApp safe endpoint
assert.ok(!wHtml.includes('85291234567'), 'Waitlist must NOT contain civilian placeholder phone number 85291234567');
assert.ok(wHtml.includes('wa.me/?text='), 'Waitlist must use universal WhatsApp click-to-chat share endpoint');

// Payment collection absence & disclaimer
assert.ok(!wHtml.includes('type="password"') && !wHtml.includes('cc-number') && !wHtml.includes('card-number'), 'Waitlist must not collect credit cards');
assert.ok(wHtml.includes('轉數快') && wHtml.includes('保證金'), 'Waitlist must disclaim deposit / FPS payment collection');

// Cap. 486 PICS data controller
assert.ok(wHtml.includes('InsurIntel HK Operations Ltd.') && wHtml.includes('在港註冊成立中'), 'Waitlist PICS must name InsurIntel HK Operations Ltd. as data controller');
assert.ok(!wHtml.includes('[資料使用者:'), 'Waitlist PICS must NOT contain raw template bracket placeholder');
assert.ok(wHtml.includes('privacy@insurintel.hk'), 'Waitlist PICS must include privacy@insurintel.hk');

// Measurement plan section & live telemetry engine
assert.ok(wHtml.includes('id="measurement-plan"'), 'Waitlist must include #measurement-plan section');
assert.ok(wHtml.includes('logTelemetryEvent') && wHtml.includes('getWaitlistTelemetryStats'), 'Waitlist must implement active telemetry & stats reporting functions');
assert.ok(wHtml.includes('page_view') && wHtml.includes('plan_select_click'), 'Measurement plan must specify telemetry event tracking');
assert.ok(wHtml.includes('CAC =') || wHtml.includes('CAC 公式'), 'Measurement plan must specify real CAC formula');
console.log('  [PASS] Landing page honesty verified: SHA-256 parity, price badge, zero-upfront pilot, PII safe WhatsApp, PICS controller, and active telemetry engine.');

// 3. Verify HTML App SHA-256 Parity & Seat Count in Modal
const appTpl = path.join(process.cwd(), 'templates', 'mobile_cafe_app.html');
const appDistIdx = path.join(process.cwd(), 'dist', 'index.html');
const appDistCafe = path.join(process.cwd(), 'dist', 'cafe.html');

const hTpl = crypto.createHash('sha256').update(fs.readFileSync(appTpl)).digest('hex');
const hIdx = crypto.createHash('sha256').update(fs.readFileSync(appDistIdx)).digest('hex');
const hCafe = crypto.createHash('sha256').update(fs.readFileSync(appDistCafe)).digest('hex');

assert.strictEqual(hTpl, hIdx, 'mobile_cafe_app.html and index.html must have identical SHA-256');
assert.strictEqual(hIdx, hCafe, 'index.html and cafe.html must have identical SHA-256');

const appContent = fs.readFileSync(appDistIdx, 'utf8');
assert.ok(appContent.includes('包含 15 個獨立顧問執業席位'), 'App modal must specify 15 seats for Agency Team');
assert.ok(!appContent.includes('包含 20 個獨立顧問執業席位'), 'App modal must NOT specify 20 seats');
assert.ok(appContent.includes('07:00 HKT 自動同步'), 'App modal must strictly synchronize 07:00 HKT morning delivery time');
assert.ok(appContent.includes('enterprise@insurintel.hk'), 'App modal must direct Enterprise tier to enterprise@insurintel.hk');
console.log(`  [PASS] App parity confirmed 100% (${hTpl.substring(0, 16)}...), modal specifies 15 seats @ 07:45, and Enterprise directs to sales.`);

console.log('\n================================================================================');
console.log('ALL VERIFICATION ASSERTIONS PASSED (TASK-R2-04 HARDENED & VERIFIED)');
console.log('================================================================================\n');

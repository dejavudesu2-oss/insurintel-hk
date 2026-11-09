/**
 * tests/verification_fake_output_sweep.ts
 * Automated Verification Suite for Arithmetic & Fake-Output Sweep (TASK-R3-01 / R1 & R3)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { computeEconomics } from '../scripts/compute_break_even.js';
import { auditCodebase } from '../scripts/fake_output_audit.js';

console.log('================================================================================');
console.log('TEST SUITE: ARITHMETIC REPAIR & FAKE-OUTPUT SWEEP (TASK-R3-01)');
console.log('================================================================================\n');

// 1. Script-computed break-even arithmetic (R1)
const econ = computeEconomics();
console.log('1. Verifying script-computed break-even calculations:');
assert.strictEqual(econ.breakEven.modelA.individuals, 12, 'Model A without salary MUST require 12 individuals (corrected from 11)');
assert.strictEqual(econ.breakEven.modelA.teams, 1, 'Model A without salary MUST require 1 team');
assert.strictEqual(econ.breakEven.modelB.teams, 17, 'Model B with salary MUST require 17 teams (net per team after 15 seats x variable cost)');
assert.strictEqual(econ.agencyTeam.seats, 15, 'Agency Team MUST bundle 15 seats');
assert.strictEqual(econ.varCostPerSeat, 10, 'Variable cost per seat MUST be HK$10.00');
console.log('  [PASS] Script-computed break-even figures verified: Model A = 12, Model B = 17.');

// 2. SSOT Pricing Document Alignment
console.log('\n2. Verifying SINGLE_SOURCE_OF_TRUTH_PRICING.md alignment:');
const ssotPath = path.join(process.cwd(), 'SINGLE_SOURCE_OF_TRUTH_PRICING.md');
const ssot = fs.readFileSync(ssotPath, 'utf8');
assert.ok(ssot.includes('12 位付費顧問'), 'SSOT must state 12 individuals for Model A');
assert.ok(ssot.includes('17 個營銷團隊'), 'SSOT must state 17 teams for Model B');
assert.ok(ssot.includes('07:00 HKT'), 'SSOT must state 07:00 HKT sync time');
assert.ok(ssot.includes('15 個顧問席位') || ssot.includes('15 席'), 'SSOT must state 15 seats');
assert.ok(ssot.includes('首發方案一：Advisor Pro') && ssot.includes('首發方案二：Agency Team'), 'SSOT must present exactly 2 core launch options');
assert.ok(ssot.includes('後續評估梯隊聲明'), 'SSOT must present separate Later/Roadmap note for Retail & Enterprise');
assert.ok(!ssot.includes('75% APE 份額') || ssot.includes('歷史未驗證宣稱') || ssot.includes('[ASSUMPTION]'), 'SSOT must not make unqualified 75% APE claim');
console.log('  [PASS] SINGLE_SOURCE_OF_TRUTH_PRICING.md reconciled with script economics, 2 launch options, and 07:00 sync.');

// 3. Fake-output audit across codebase (R3)
console.log('\n3. Verifying fake-output sweep across codebase:');
const auditPassed = auditCodebase();
assert.ok(auditPassed, 'Audit codebase MUST report zero fake SHA-256 strings, zero pseudo LEAD- IDs, and zero fabricated IA circular IDs');
console.log('  [PASS] Codebase audit confirmed clean of deceptive strings.');

// 4. Client-visible UI honesty
console.log('\n4. Verifying client-visible UI honesty:');
const appHtml = fs.readFileSync(path.join(process.cwd(), 'templates', 'mobile_cafe_app.html'), 'utf8');
assert.ok(appHtml.includes('示範啟發式維度評分指南'), 'Radar scorecard explainer must be honestly labeled as heuristic');
assert.ok(!appHtml.includes('香港精算核心演算法'), 'Radar scorecard must NOT claim to be actuarial credentialed algorithm');
assert.ok(appHtml.includes('每日 07:00 HKT 自動同步晨會早會情報投影片'), 'App modal must specify 07:00 HKT sync time');
assert.ok(appHtml.includes('15 席位團隊授權'), 'DD scenario comment must state 15 seats');

// 5. SHA-256 parity verification
console.log('\n5. Verifying SHA-256 parity:');
const hashMobile = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'templates', 'mobile_cafe_app.html'))).digest('hex');
const hashIndex = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'))).digest('hex');
const hashCafe = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'dist', 'cafe.html'))).digest('hex');
assert.strictEqual(hashMobile, hashIndex, 'mobile_cafe_app.html and index.html must match');
assert.strictEqual(hashIndex, hashCafe, 'index.html and cafe.html must match');

const hashWaitlistTpl = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'templates', 'waitlist.html'))).digest('hex');
const hashWaitlistDist = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'dist', 'waitlist.html'))).digest('hex');
assert.strictEqual(hashWaitlistTpl, hashWaitlistDist, 'templates/waitlist.html and dist/waitlist.html must match');

const hashGn16Tpl = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'templates', 'gn16_tracker.html'))).digest('hex');
const hashGn16Dist = crypto.createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'dist', 'gn16_tracker.html'))).digest('hex');
assert.strictEqual(hashGn16Tpl, hashGn16Dist, 'templates/gn16_tracker.html and dist/gn16_tracker.html must match');

console.log('  [PASS] SHA-256 parity verified across all HTML targets.');
console.log('\n================================================================================');
console.log('ALL ASSERTIONS PASSED (TASK-R3-01 GREEN)');
console.log('================================================================================\n');

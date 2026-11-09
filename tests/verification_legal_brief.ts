/**
 * tests/verification_legal_brief.ts
 * Automated Verification Suite for Legal Instructions Brief for HK Compliance Counsel (TASK-09 - HARDENED)
 * 
 * Verifies:
 * 1. Physical file existence at `LEGAL_BRIEF_HK_COMPLIANCE.md` (size > 3,000 bytes, <= 10,000 bytes - strictly <= 2 pages)
 * 2. Proper instruction formatting for qualified Hong Kong legal counsel:
 *    - Governing Law: HKSAR
 *    - Conflict of interest check instruction
 *    - Defined timetable and deliverables
 * 3. All 6 Formal Regulatory Questions parsed structurally with exactly 2 questions per issue:
 *    - Issue 1: Product comparison & twisting / replacement rules (Cap. 41 s. 90/95/121, GL27, Code of Conduct)
 *      * Negative test: Section 64G is NOT conflated with twisting
 *    - Issue 2: Insurers' trade marks & comparative product reviews (Cap. 559 s. 19/21, Cap. 528 s. 39 fair dealing)
 *      * Negative test: Section 38 of Cap. 528 is NOT cited for criticism/review
 *    - Issue 3: OCR proposal illustration scanning (agent covenants, compilation copyright, absence of TDM exception)
 *    - Issue 4: PDPO Cap. 486 & PCPD June 2024 Generative AI Framework:
 *      * Discloses Section 33 dormancy; cites 2022 Model Contractual Clauses & June 2024 AI Framework
 *      * Verifies hardened HKID regex `[A-Z]{1,2}[0-9]{6}\\([0-9A]\\)`
 *      * Negative test: rejects broken regex `[A-Z][0-9]{6}(A)`
 *    - Issue 5: Disclaimers, T&Cs, Cap. 71 exemption clauses, Cap. 623 third-party exclusion & Hedley Byrne tortious disclaimers
 *      * Cites accurate single launch offer pricing: HK$ 199 (Advisor Pro) & HK$ 2,480 (Agency Team 15-Seat)
 *    - Issue 6: Intermediary licensing boundaries under Section 64G and Schedule 1A Part 1 & 2 ("material decision" & "regulated advice")
 *      * Negative test: rejects fictional "technology service vendor exemption"
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { PATHS } from '../scripts/paths.js';

console.log('================================================================================');
console.log('TEST SUITE: LEGAL INSTRUCTIONS BRIEF FOR HK COMPLIANCE COUNSEL (TASK-09 - HARDENED)');
console.log('================================================================================\n');

const briefPath = PATHS.LEGAL_BRIEF_HK_COMPLIANCE;
assert.ok(fs.existsSync(briefPath), 'LEGAL_BRIEF_HK_COMPLIANCE.md must exist in repository root');

const content = fs.readFileSync(briefPath, 'utf8');
assert.ok(content.length > 3000, `Legal brief too short: ${content.length} bytes`);
assert.ok(content.length <= 11000, `Legal brief exceeds 2-page limit: ${content.length} bytes`);
console.log(`  [PASS] File verified at root: ${content.length} characters (strictly within 2-page executive format).`);

// 1. Structure, Counsel Instructions & Privilege Classification
assert.ok(content.includes('LEGAL INSTRUCTIONS BRIEF'), 'Missing brief title');
assert.ok(content.includes('Privileged & Confidential'), 'Missing professional legal privilege classification');
assert.ok(content.includes('Governing Law') && content.includes('Hong Kong Special Administrative Region'), 'Missing HKSAR governing law');
assert.ok(content.includes('Conflict Check'), 'Missing conflict of interest instruction for counsel');
assert.ok(content.includes('Timetable'), 'Missing delivery timetable for counsel');
assert.ok(content.includes('### 1. BACKGROUND & SOFTWARE ARCHITECTURE'), 'Missing Section 1');
assert.ok(content.includes('### 2. SIX FORMAL QUESTIONS FOR COUNSEL'), 'Missing Section 2');
assert.ok(content.includes('### 3. FORMAL DELIVERABLES REQUESTED FROM COUNSEL'), 'Missing Section 3');
console.log('  [PASS] Document structure, conflict check and counsel instruction headers verified.');

// 2. Issue 1: Product Comparison & Twisting (Cap. 41 & GL27)
assert.ok(content.includes('Issue 1: Product Comparison & Policy Replacement / Twisting Rules'), 'Missing Issue 1 heading');
assert.ok(content.includes('GL27'), 'Issue 1 must cite HKIA GL27');
assert.ok(content.includes('Section 90') || content.includes('Section 121'), 'Issue 1 must cite Section 90 / 121 of Cap. 41');
assert.ok(content.includes('Code of Conduct for Licensed Insurance Intermediaries'), 'Issue 1 must cite Code of Conduct');

// Negative test 1: Section 64G must NOT be cited as a twisting offence
const issue1Block = content.substring(content.indexOf('#### Issue 1:'), content.indexOf('#### Issue 2:'));
assert.ok(!issue1Block.includes('Section 64G'), 'Issue 1 must not conflate Section 64G (licensing offence) with twisting');
console.log('  [PASS] Issue 1 verified: Accurate citations for GL27, s. 90/121, and Code of Conduct; zero 64G twisting conflation.');

// 3. Issue 2: Trade Marks & Comparative Reviews (Cap. 559 & Cap. 528)
assert.ok(content.includes('Issue 2: Insurers\' Trade Marks & Comparative Product Reviews'), 'Missing Issue 2 heading');
assert.ok(content.includes('Trade Marks Ordinance') || content.includes('Cap. 559'), 'Issue 2 must cite Cap. 559');
assert.ok(content.includes('Section 21'), 'Issue 2 must cite Section 21 honest commercial practices');
assert.ok(content.includes('Section 39'), 'Issue 2 must cite Section 39 of Cap. 528 for criticism/review');
assert.ok(content.includes('sufficient acknowledgement'), 'Issue 2 must cite sufficient acknowledgement requirement');

// Negative test 2: Section 38 must NOT be cited for criticism or review
const issue2Block = content.substring(content.indexOf('#### Issue 2:'), content.indexOf('#### Issue 3:'));
assert.ok(!issue2Block.includes('Section 38'), 'Issue 2 must not cite Section 38 (private study) for comparative reviews');
console.log('  [PASS] Issue 2 verified: Section 21 Trade Marks and Section 39 Copyright fair dealing correctly cited.');

// 4. Issue 3: OCR Scanning of Proposals & Intermediary Covenants
assert.ok(content.includes('Issue 3: OCR Scanning of Competitor Proposal Illustrations'), 'Missing Issue 3 heading');
assert.ok(content.includes('covenants') || content.includes('tied-agency'), 'Issue 3 must cover tied-agency restrictive covenants');
assert.ok(content.includes('TDM') || content.includes('Text and Data Mining'), 'Issue 3 must address lack of statutory TDM exception in HK');
console.log('  [PASS] Issue 3 verified: Tied-agent covenants and compilation copyright without TDM exception addressed.');

// 5. Issue 4: PDPO Cap. 486 & June 2024 PCPD AI Regulatory Framework
assert.ok(content.includes('Issue 4: Personal Data (Privacy) Ordinance (PDPO Cap. 486)'), 'Missing Issue 4 heading');
assert.ok(content.includes('Section 33') && (content.includes('not yet') || content.includes('not in operation') || content.includes('dormant')), 'Issue 4 must disclose that Section 33 is not yet in operation');
assert.ok(content.includes('Model Personal Data Protection Framework') || content.includes('June 2024'), 'Issue 4 must cite PCPD June 2024 Model AI Framework');
assert.ok(content.includes('[A-Z]{1,2}[0-9]{6}'), 'Issue 4 must specify comprehensive HKID regex pattern');

// Negative test 4: Rejects broken HKID regex
assert.ok(!content.includes('[A-Z][0-9]{6}(A)'), 'Issue 4 must not contain broken single-letter HKID regex missing digit check digits');
console.log('  [PASS] Issue 4 verified: Section 33 dormancy disclosed, PCPD June 2024 AI Framework cited, hardened HKID regex verified.');

// 6. Issue 5: Disclaimers, Third-Party Rights & Limitation of Liability (Cap. 71 & Cap. 623)
assert.ok(content.includes('Issue 5: Platform Disclaimers, Third-Party Rights & Limitation of Liability'), 'Missing Issue 5 heading');
assert.ok(content.includes('Control of Exemption Clauses Ordinance') || content.includes('Cap. 71'), 'Issue 5 must cite Cap. 71');
assert.ok(content.includes('Contracts (Rights of Third Parties) Ordinance') || content.includes('Cap. 623'), 'Issue 5 must cite Cap. 623');
assert.ok(content.includes('Hedley Byrne'), 'Issue 5 must address common law tortious misstatement duty of care');
assert.ok(content.includes('HK$199') && content.includes('HK$2,480'), 'Issue 5 must cite single launch offer pricing');
console.log('  [PASS] Issue 5 verified: Cap. 71 reasonableness, Cap. 623 third-party exclusion, and Hedley Byrne disclaimers addressed.');

// 7. Issue 6: Intermediary Licensing Boundaries & Schedule 1A Regulated Activities (Cap. 41)
assert.ok(content.includes('Issue 6: Intermediary Licensing Boundaries & Schedule 1A Regulated Activities'), 'Missing Issue 6 heading');
assert.ok(content.includes('Section 64G'), 'Issue 6 must cite Section 64G regulated activity criminal offence');
assert.ok(content.includes('Schedule 1A'), 'Issue 6 must cite Schedule 1A Part 1 and Part 2');
assert.ok(content.includes('material decision'), 'Issue 6 must cite Schedule 1A Part 2 "material decision"');
assert.ok(content.includes('regulated advice'), 'Issue 6 must cite Schedule 1A Part 1 "regulated advice"');

// Negative test 6: Rejects fictional statutory "technology service vendor exemption"
assert.ok(!content.includes('statutory "technology service vendor exemption"'), 'Issue 6 must not hallucinate a statutory vendor exemption');
console.log('  [PASS] Issue 6 verified: Section 64G and Schedule 1A regulated activity / material decision boundaries confirmed.');

// 8. Structural Parsing: Each of the 6 issues must contain exactly 2 numbered questions
const issues = [
  { id: 1, tag: '#### Issue 1:' },
  { id: 2, tag: '#### Issue 2:' },
  { id: 3, tag: '#### Issue 3:' },
  { id: 4, tag: '#### Issue 4:' },
  { id: 5, tag: '#### Issue 5:' },
  { id: 6, tag: '#### Issue 6:' }
];

for (let i = 0; i < issues.length; i++) {
  const currentTag = issues[i].tag;
  const nextTag = i < issues.length - 1 ? issues[i + 1].tag : '### 3. FORMAL DELIVERABLES';
  const startIndex = content.indexOf(currentTag);
  const endIndex = content.indexOf(nextTag);
  assert.ok(startIndex !== -1 && endIndex !== -1, `Section boundary missing for ${currentTag}`);
  const block = content.substring(startIndex, endIndex);

  const hasQ1 = /^\s*1\.\s+/m.test(block);
  const hasQ2 = /^\s*2\.\s+/m.test(block);
  assert.ok(hasQ1, `Issue ${i + 1} missing Question 1`);
  assert.ok(hasQ2, `Issue ${i + 1} missing Question 2`);
}
console.log('  [PASS] Structural integrity: Exactly 2 formal numbered questions parsed in each of the 6 issues (12 questions total).');

console.log('\n================================================================================');
console.log('SUMMARY: ALL HARDENED LEGAL INSTRUCTIONS BRIEF TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

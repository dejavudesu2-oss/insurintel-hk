/**
 * tests/verification_proposal_scanner_pii_scrubber.ts
 * Rigorous Verification Suite for Proposal Scanner & Client-Side PII Scrubber
 */

import { strict as assert } from 'assert';
import { ProposalScannerPIIScrubber } from '../src/engine/proposal_scanner_pii_scrubber';

console.log('================================================================================');
console.log('TEST SUITE: Proposal Scanner Pipeline & Client-Side PII Scrubber (HK PDPO)');
console.log('================================================================================\n');

const scrubber = new ProposalScannerPIIScrubber();

// Test 1: Scrubbing HKID
{
  const raw = '客戶身份證號碼: A123456(7) 及 配偶身份證: Z987654(A)';
  const res = scrubber.scrubPII(raw);
  assert(!res.sanitizedText.includes('A123456(7)'), 'HKID 1 must be removed');
  assert(!res.sanitizedText.includes('Z987654(A)'), 'HKID 2 must be removed');
  assert(res.sanitizedText.includes('[HKID_PROTECTED]'), 'Redaction placeholder present');
  assert.equal(res.matches.filter(m => m.type === 'HKID').length, 2, 'Found 2 HKID matches');
  console.log('  [PASS] HKID patterns redacted accurately');
}

// Test 2: Scrubbing Phone Numbers & Emails
{
  const raw = '聯絡電話: +852 9876 5432, 辦公電話: 852-61234567, 電郵: client.vip@hkfinance.com';
  const res = scrubber.scrubPII(raw);
  assert(!res.sanitizedText.includes('9876 5432'), 'Phone 1 must be removed');
  assert(!res.sanitizedText.includes('61234567'), 'Phone 2 must be removed');
  assert(!res.sanitizedText.includes('client.vip@hkfinance.com'), 'Email must be removed');
  assert(res.sanitizedText.includes('[PHONE_PROTECTED]'), 'Phone redacted tag');
  assert(res.sanitizedText.includes('[EMAIL_PROTECTED]'), 'Email redacted tag');
  console.log('  [PASS] Phone numbers and email addresses redacted cleanly');
}

// Test 3: Scrubbing Policy Numbers & Explicit Client Names
{
  const raw = '保單編號: POL-88239102-X，受保人姓名: 陳大文 (Chan Tai Man)，現居中半山堅道花園大廈';
  const res = scrubber.scrubPII(raw, ['陳大文', 'Chan Tai Man']);
  assert(!res.sanitizedText.includes('POL-88239102-X'), 'Policy number must be redacted');
  assert(!res.sanitizedText.includes('陳大文'), 'Chinese client name must be redacted');
  assert(!res.sanitizedText.includes('Chan Tai Man'), 'English client name must be redacted');
  assert(res.sanitizedText.includes('[POLICY_NO_PROTECTED]'), 'Policy placeholder present');
  assert(res.sanitizedText.includes('[CLIENT_NAME_PROTECTED]'), 'Name placeholder present');
  console.log('  [PASS] Policy numbers and client names redacted properly');
}

// Test 4: Actuarial Schedule Parsing & Dual Breakeven Year Calculation
{
  const proposalRaw = `
    保誠 雋富多元貨幣計劃
    Annual Premium: USD 20,000
    Payment Term: 5 Years
    Year 1 - Total Premiums: 20000, Guaranteed Cash Value: 0
    Year 5 - Total Premiums: 100000, Guaranteed Cash Value: 24000
    Year 6 - Surrender Value: 105000 (Breakeven projected)
    Year 14 - Guaranteed Cash Value: 102000 (Guaranteed breakeven)
  `;
  const sanitized = scrubber.scrubPII(proposalRaw);
  const parsed = scrubber.parseActuarialData(sanitized.sanitizedText, 'Prudential', '雋富多元貨幣計劃');

  assert.equal(parsed.insurerName, 'Prudential', 'Insurer parsed');
  assert.equal(parsed.annualPremium, 20000, 'Annual premium parsed');
  assert.equal(parsed.currency, 'USD', 'Currency detected');
  assert.equal(parsed.schedule.length, 30, '30-year projection generated');
  assert(parsed.guaranteedBreakevenYear !== null, 'Guaranteed breakeven year calculated');
  assert(parsed.totalProjectedBreakevenYear !== null, 'Total projected breakeven year calculated');
  assert(parsed.guaranteedBreakevenYear! > parsed.totalProjectedBreakevenYear!, 'Guaranteed breakeven occurs later than projected breakeven');
  assert(parsed.projectedIRR30Year > parsed.guaranteedIRR30Year, 'Total projected IRR higher than guaranteed IRR');
  console.log(`  [PASS] Actuarial schedule parsed: Guaranteed BE Yr ${parsed.guaranteedBreakevenYear} vs Total Projected BE Yr ${parsed.totalProjectedBreakevenYear}`);
}

// Test 5: Compliance Notice and Audit Hash Verification
{
  const raw = 'Sample Proposal Body Text';
  const res = scrubber.scrubPII(raw);
  assert(res.complianceNotice.includes('PDPO'), 'Notice mentions PDPO Cap. 486');
  assert(res.complianceNotice.includes('requires review by a qualified HK compliance professional'), 'Mandatory disclaimer phrasing');
  assert.equal(typeof res.contentHash, 'string', 'SHA-256 hash generated');
  assert.equal(res.contentHash.length, 64, 'SHA-256 length is 64 hex characters');
  console.log('  [PASS] Compliance disclaimer and SHA-256 audit hash verified');
}

console.log('\n================================================================================');
console.log('SUMMARY: ALL PROPOSAL SCANNER & PII SCRUBBER TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

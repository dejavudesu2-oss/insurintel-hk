"use strict";
/**
 * tests/verification_proposal_scanner_pii_scrubber.ts
 * Rigorous Verification Suite for Proposal Scanner & Client-Side PII Scrubber
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const proposal_scanner_pii_scrubber_1 = require("../src/engine/proposal_scanner_pii_scrubber");
console.log('================================================================================');
console.log('TEST SUITE: Proposal Scanner Pipeline & Client-Side PII Scrubber (HK PDPO)');
console.log('================================================================================\n');
const scrubber = new proposal_scanner_pii_scrubber_1.ProposalScannerPIIScrubber();
// Test 1: Scrubbing HKID
{
    const raw = '客戶身份證號碼: A123456(7) 及 配偶身份證: Z987654(A)';
    const res = scrubber.scrubPII(raw);
    (0, assert_1.strict)(!res.sanitizedText.includes('A123456(7)'), 'HKID 1 must be removed');
    (0, assert_1.strict)(!res.sanitizedText.includes('Z987654(A)'), 'HKID 2 must be removed');
    (0, assert_1.strict)(res.sanitizedText.includes('[HKID_PROTECTED]'), 'Redaction placeholder present');
    assert_1.strict.equal(res.matches.filter(m => m.type === 'HKID').length, 2, 'Found 2 HKID matches');
    console.log('  [PASS] HKID patterns redacted accurately');
}
// Test 2: Scrubbing Phone Numbers & Emails
{
    const raw = '聯絡電話: +852 9876 5432, 辦公電話: 852-61234567, 電郵: client.vip@hkfinance.com';
    const res = scrubber.scrubPII(raw);
    (0, assert_1.strict)(!res.sanitizedText.includes('9876 5432'), 'Phone 1 must be removed');
    (0, assert_1.strict)(!res.sanitizedText.includes('61234567'), 'Phone 2 must be removed');
    (0, assert_1.strict)(!res.sanitizedText.includes('client.vip@hkfinance.com'), 'Email must be removed');
    (0, assert_1.strict)(res.sanitizedText.includes('[PHONE_PROTECTED]'), 'Phone redacted tag');
    (0, assert_1.strict)(res.sanitizedText.includes('[EMAIL_PROTECTED]'), 'Email redacted tag');
    console.log('  [PASS] Phone numbers and email addresses redacted cleanly');
}
// Test 3: Scrubbing Policy Numbers & Explicit Client Names
{
    const raw = '保單編號: POL-88239102-X，受保人姓名: 陳大文 (Chan Tai Man)，現居中半山堅道花園大廈';
    const res = scrubber.scrubPII(raw, ['陳大文', 'Chan Tai Man']);
    (0, assert_1.strict)(!res.sanitizedText.includes('POL-88239102-X'), 'Policy number must be redacted');
    (0, assert_1.strict)(!res.sanitizedText.includes('陳大文'), 'Chinese client name must be redacted');
    (0, assert_1.strict)(!res.sanitizedText.includes('Chan Tai Man'), 'English client name must be redacted');
    (0, assert_1.strict)(res.sanitizedText.includes('[POLICY_NO_PROTECTED]'), 'Policy placeholder present');
    (0, assert_1.strict)(res.sanitizedText.includes('[CLIENT_NAME_PROTECTED]'), 'Name placeholder present');
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
    assert_1.strict.equal(parsed.insurerName, 'Prudential', 'Insurer parsed');
    assert_1.strict.equal(parsed.annualPremium, 20000, 'Annual premium parsed');
    assert_1.strict.equal(parsed.currency, 'USD', 'Currency detected');
    assert_1.strict.equal(parsed.schedule.length, 30, '30-year projection generated');
    (0, assert_1.strict)(parsed.guaranteedBreakevenYear !== null, 'Guaranteed breakeven year calculated');
    (0, assert_1.strict)(parsed.totalProjectedBreakevenYear !== null, 'Total projected breakeven year calculated');
    (0, assert_1.strict)(parsed.guaranteedBreakevenYear > parsed.totalProjectedBreakevenYear, 'Guaranteed breakeven occurs later than projected breakeven');
    (0, assert_1.strict)(parsed.projectedIRR30Year > parsed.guaranteedIRR30Year, 'Total projected IRR higher than guaranteed IRR');
    console.log(`  [PASS] Actuarial schedule parsed: Guaranteed BE Yr ${parsed.guaranteedBreakevenYear} vs Total Projected BE Yr ${parsed.totalProjectedBreakevenYear}`);
}
// Test 5: Compliance Notice and Audit Hash Verification
{
    const raw = 'Sample Proposal Body Text';
    const res = scrubber.scrubPII(raw);
    (0, assert_1.strict)(res.complianceNotice.includes('PDPO'), 'Notice mentions PDPO Cap. 486');
    (0, assert_1.strict)(res.complianceNotice.includes('requires review by a qualified HK compliance professional'), 'Mandatory disclaimer phrasing');
    assert_1.strict.equal(typeof res.contentHash, 'string', 'SHA-256 hash generated');
    assert_1.strict.equal(res.contentHash.length, 64, 'SHA-256 length is 64 hex characters');
    console.log('  [PASS] Compliance disclaimer and SHA-256 audit hash verified');
}
console.log('\n================================================================================');
console.log('SUMMARY: ALL PROPOSAL SCANNER & PII SCRUBBER TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

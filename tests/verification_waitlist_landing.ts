/**
 * tests/verification_waitlist_landing.ts
 * Automated Verification Suite for Single-HTML Fake-Door Waitlist Landing Page (TASK-07)
 * 
 * Verifies:
 * 1. Physical file exists at `dist/waitlist.html` (size > 5,000 bytes)
 * 2. Single launch offer pricing displayed: HK$ 199 / mo (Advisor Pro) and HK$ 2,480 / mo (Agency Team 15-Seat Pilot)
 * 3. 14-Day zero-risk money-back guarantee prominently displayed
 * 4. Hong Kong Cap. 486 (PDPO) privacy protection notice present with 30-day retention & privacy@insurintel.hk
 * 5. Lead intake form structure: plan selector, name, company, phone, email, submit button
 * 6. Sandboxed execution of `handleWaitlistSubmit()`:
 *    - Validates positive submission (generates LEAD-*, persists to localStorage, updates WhatsApp link)
 *    - Negative test: rejects submission with missing company
 *    - Negative test: rejects submission with invalid non-HK phone number
 * 7. Reciprocal links:
 *    - waitlist.html links to index.html and morning_slides.html
 *    - dist/index.html links to waitlist.html
 *    - dist/morning_slides.html links to waitlist.html
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

console.log('================================================================================');
console.log('TEST SUITE: FAKE-DOOR WAITLIST LANDING PAGE & PRICING AUDIT (TASK-07)');
console.log('================================================================================\n');

const waitlistPath = path.join(process.cwd(), 'dist', 'waitlist.html');
assert.ok(fs.existsSync(waitlistPath), 'dist/waitlist.html must exist');

const html = fs.readFileSync(waitlistPath, 'utf8');
assert.ok(html.length > 5000, `dist/waitlist.html too small: ${html.length} bytes`);

// 1. Pricing Compliance
assert.ok(html.includes('HK$ 199'), 'Waitlist must display HK$ 199 Advisor Pro price');
assert.ok(html.includes('HK$ 2,480'), 'Waitlist must display HK$ 2,480 Agency Team Pilot price');
assert.ok(html.includes('15 位顧問') || html.includes('15 席'), 'Waitlist must specify 15-seat allocation for team tier');
console.log('  [PASS] Single launch offer pricing verified: HK$ 199 (Advisor Pro) & HK$ 2,480 (Agency Team 15-Seat).');

// 2. Risk Reversal & Privacy Notice
assert.ok(html.includes('14 天') && (html.includes('零預付') || html.includes('試點承諾') || html.includes('退款保證')), 'Waitlist must feature 14-day zero-risk pilot or refund terms');
assert.ok(html.includes('個人資料（私隱）條例') || html.includes('Cap. 486'), 'Waitlist must feature Cap. 486 privacy compliance notice');
assert.ok(html.includes('privacy@insurintel.hk'), 'Waitlist must specify privacy officer email privacy@insurintel.hk');
assert.ok(html.includes('30 天'), 'Waitlist must state 30-day retention period in PICS');
console.log('  [PASS] Zero-risk guarantee and Cap. 486 statutory privacy notice verified.');

// 3. Form & Input Elements & Modal Controls
assert.ok(html.includes('id="selected-plan"'), 'Form missing #selected-plan select element');
assert.ok(html.includes('id="lead-name"'), 'Form missing #lead-name input element');
assert.ok(html.includes('id="lead-company"'), 'Form missing #lead-company select element');
assert.ok(html.includes('id="lead-phone"'), 'Form missing #lead-phone input element');
assert.ok(html.includes('id="lead-email"'), 'Form missing #lead-email input element');
assert.ok(html.includes('handleWaitlistSubmit'), 'Form missing handleWaitlistSubmit handler');
assert.ok(html.includes('modal-close-btn'), 'Modal missing close button');
assert.ok(html.includes('modal-whatsapp-btn'), 'Modal missing WhatsApp quick-action button');
console.log('  [PASS] Lead capture form structure, modal close button & WhatsApp handover button verified.');

// 4. Sandboxed Execution of Form Submission
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
assert.ok(scriptStart !== -1 && scriptEnd !== -1, 'Script block missing in waitlist.html');
const scriptCode = html.substring(scriptStart + 8, scriptEnd);

function createSandboxContext(initialElements: Record<string, any>) {
  const storageStore: Record<string, string> = {};
  const alertMessages: string[] = [];
  const sandbox: any = {
    document: {
      getElementById: (id: string) => initialElements[id] || null,
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (key: string) => storageStore[key] || null,
      setItem: (key: string, val: string) => { storageStore[key] = val; }
    },
    console,
    alert: (msg: string) => { alertMessages.push(msg); }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(scriptCode, sandbox);
  return { sandbox, storageStore, alertMessages };
}

// Positive submission test
const mockElementsPositive: Record<string, any> = {
  'selected-plan': { value: 'Agency Team 14-Day Pilot (HK$ 2,480 / 月)' },
  'lead-name': { value: '陳大文 (David Chan)' },
  'lead-company': { value: 'AIA' },
  'lead-phone': { value: '+852 9123 4567' },
  'lead-email': { value: 'david.chan@insurance.com.hk' },
  'modal-lead-id': { innerText: '' },
  'modal-whatsapp-btn': { href: '' },
  'waitlist-success-modal': {
    classList: {
      add: (cls: string) => { mockElementsPositive['waitlist-success-modal'].classes.push(cls); },
      remove: (cls: string) => { mockElementsPositive['waitlist-success-modal'].classes = mockElementsPositive['waitlist-success-modal'].classes.filter((c: string) => c !== cls); }
    },
    classes: []
  }
};

const ctxPositive = createSandboxContext(mockElementsPositive);
assert.strictEqual(typeof ctxPositive.sandbox.handleWaitlistSubmit, 'function', 'handleWaitlistSubmit must be callable');
ctxPositive.sandbox.handleWaitlistSubmit({ preventDefault: () => {} });

const savedRaw = ctxPositive.storageStore['insurintel_waitlist_leads'];
assert.ok(savedRaw, 'Lead record must be persisted to localStorage under insurintel_waitlist_leads');
const savedLeads = JSON.parse(savedRaw);
assert.strictEqual(savedLeads.length, 1, 'Exactly 1 lead should be saved');
assert.strictEqual(savedLeads[0].name, '陳大文 (David Chan)');
assert.strictEqual(savedLeads[0].company, 'AIA');
assert.strictEqual(savedLeads[0].plan, 'Agency Team 14-Day Pilot (HK$ 2,480 / 月)');
assert.ok(savedLeads[0].lead_id.startsWith('LEAD-'), `Lead ID must start with LEAD-, got: ${savedLeads[0].lead_id}`);
assert.ok(mockElementsPositive['waitlist-success-modal'].classes.includes('open'), 'Success modal must have class "open"');
assert.ok(mockElementsPositive['modal-whatsapp-btn'].href.includes('wa.me/'), 'WhatsApp link must point to wa.me share endpoint');
console.log(`  [PASS] Sandboxed lead intake verified: Generated ${savedLeads[0].lead_id} & persisted to localStorage.`);

// Negative test 1: Reject empty company
const mockElementsEmptyCompany: Record<string, any> = {
  'selected-plan': { value: 'Advisor Pro (HK$ 199 / 月)' },
  'lead-name': { value: '陳大文' },
  'lead-company': { value: '' }, // EMPTY
  'lead-phone': { value: '91234567' },
  'lead-email': { value: 'test@example.com' },
  'modal-lead-id': { innerText: '' },
  'modal-whatsapp-btn': { href: '' },
  'waitlist-success-modal': { classList: { add: () => {}, remove: () => {} }, classes: [] }
};
const ctxNeg1 = createSandboxContext(mockElementsEmptyCompany);
const resNeg1 = ctxNeg1.sandbox.handleWaitlistSubmit({ preventDefault: () => {} });
assert.strictEqual(resNeg1, false, 'handleWaitlistSubmit must return false for missing company');
assert.strictEqual(ctxNeg1.storageStore['insurintel_waitlist_leads'], undefined, 'No lead should be saved if company is missing');
assert.ok(ctxNeg1.alertMessages.length > 0, 'Alert must be triggered for missing company');
console.log('  [PASS] Negative test 1: Rejected submission with missing company.');

// Negative test 2: Reject invalid non-HK phone number
const mockElementsBadPhone: Record<string, any> = {
  'selected-plan': { value: 'Advisor Pro (HK$ 199 / 月)' },
  'lead-name': { value: '陳大文' },
  'lead-company': { value: 'Prudential' },
  'lead-phone': { value: '12345' }, // INVALID
  'lead-email': { value: 'test@example.com' },
  'modal-lead-id': { innerText: '' },
  'modal-whatsapp-btn': { href: '' },
  'waitlist-success-modal': { classList: { add: () => {}, remove: () => {} }, classes: [] }
};
const ctxNeg2 = createSandboxContext(mockElementsBadPhone);
const resNeg2 = ctxNeg2.sandbox.handleWaitlistSubmit({ preventDefault: () => {} });
assert.strictEqual(resNeg2, false, 'handleWaitlistSubmit must return false for invalid phone');
assert.strictEqual(ctxNeg2.storageStore['insurintel_waitlist_leads'], undefined, 'No lead should be saved if phone is invalid');
assert.ok(ctxNeg2.alertMessages.some((m: string) => m.includes('香港聯絡電話')), 'Alert must warn about invalid HK phone');
console.log('  [PASS] Negative test 2: Rejected submission with invalid phone number.');

// 5. Reciprocal Links
assert.ok(html.includes('href="index.html"'), 'Waitlist must link to index.html');
assert.ok(html.includes('href="morning_slides.html"'), 'Waitlist must link to morning_slides.html');

const indexHtml = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
assert.ok(indexHtml.includes('waitlist.html'), 'dist/index.html must link to waitlist.html');

const slidesHtml = fs.readFileSync(path.join(process.cwd(), 'dist', 'morning_slides.html'), 'utf8');
assert.ok(slidesHtml.includes('waitlist.html'), 'dist/morning_slides.html must link to waitlist.html');
console.log('  [PASS] Reciprocal navigation across index.html, morning_slides.html and waitlist.html verified.');

console.log('\n================================================================================');
console.log('SUMMARY: ALL FAKE-DOOR WAITLIST LANDING PAGE TESTS PASSED (100% GREEN)');
console.log('================================================================================\n');

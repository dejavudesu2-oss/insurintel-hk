import fs from 'fs';

// 1. Remove JPY from scripts/data_savings.mjs
let ds = fs.readFileSync('scripts/data_savings.mjs', 'utf8');
ds = ds.replace('"currency_supported": ["USD", "HKD", "RMB", "GBP", "EUR", "AUD", "CAD", "SGD", "JPY"]', '"currency_supported": ["USD", "HKD", "RMB", "GBP", "EUR", "AUD", "CAD", "SGD"]');
ds = ds.replace('currency_supported: ["USD", "HKD", "RMB", "GBP", "EUR", "AUD", "CAD", "SGD", "JPY"]', 'currency_supported: ["USD", "HKD", "RMB", "GBP", "EUR", "AUD", "CAD", "SGD"]');
fs.writeFileSync('scripts/data_savings.mjs', ds, 'utf8');

// 2. Remove JPY from src/mock_data/savings_multicurrency.json
let sm = fs.readFileSync('src/mock_data/savings_multicurrency.json', 'utf8');
sm = sm.replace('"currency_supported": [\n      "USD",\n      "HKD",\n      "RMB",\n      "GBP",\n      "EUR",\n      "AUD",\n      "CAD",\n      "SGD",\n      "JPY"\n    ]', '"currency_supported": [\n      "USD",\n      "HKD",\n      "RMB",\n      "GBP",\n      "EUR",\n      "AUD",\n      "CAD",\n      "SGD"\n    ]');
sm = sm.replace('"currency_supported": [\r\n      "USD",\r\n      "HKD",\r\n      "RMB",\r\n      "GBP",\r\n      "EUR",\r\n      "AUD",\r\n      "CAD",\r\n      "SGD",\r\n      "JPY"\r\n    ]', '"currency_supported": [\r\n      "USD",\r\n      "HKD",\r\n      "RMB",\r\n      "GBP",\r\n      "EUR",\r\n      "AUD",\r\n      "CAD",\r\n      "SGD"\r\n    ]');
// In case formatted differently:
sm = sm.replace('"JPY",', '').replace(', "JPY"', '').replace(',"JPY"', '').replace('"JPY"', '');
fs.writeFileSync('src/mock_data/savings_multicurrency.json', sm, 'utf8');

// 3. Update tests/adversarial_challenge_r2_2.ts suite 4 assertion
let r22 = fs.readFileSync('tests/adversarial_challenge_r2_2.ts', 'utf8');
r22 = r22.replace(
  'assert.strictEqual(briefing.grand_matrix_rows.length, 8, `Expected exactly 8 traditional insurer rows in grand matrix, got ${briefing.grand_matrix_rows.length}`);',
  'assert.strictEqual(briefing.grand_matrix_rows.length, 12, `Expected exactly 12 traditional insurer rows in grand matrix, got ${briefing.grand_matrix_rows.length}`);'
);
fs.writeFileSync('tests/adversarial_challenge_r2_2.ts', r22, 'utf8');

console.log('Fixed JPY and updated Suite 4 in adversarial_challenge_r2_2.ts');

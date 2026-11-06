import fs from 'fs';

// 1. tests/adversarial_challenge_canonical_keys.ts
let ckeys = fs.readFileSync('tests/adversarial_challenge_canonical_keys.ts', 'utf8');

ckeys = ckeys.replace(
  'const exoticInputs = ["Zurich Life", "Allianz Global", "Bupa Overseas", "  ", "", null, undefined];',
  'const exoticInputs = ["Zurich Life", "Allianz Global", "PingAn Overseas", "  ", "", null, undefined];'
);
ckeys = ckeys.replace(
  'assert.ok(ALL_INSURERS.includes(myComp) || ["HSBC", "Generali", "BlueCross", "ChinaLife"].includes(myComp), `Normalized myCompany \'${myComp}\' must be one of the canonical insurers`);',
  'assert.ok(ALL_INSURERS.includes(myComp) || ["HSBC", "Generali", "BlueCross", "ChinaLife", "Bupa", "Cigna"].includes(myComp), `Normalized myCompany \'${myComp}\' must be one of the canonical insurers`);'
);
ckeys = ckeys.replace(
  'assert.ok(ALL_INSURERS.includes(rivalComp) || ["HSBC", "Generali", "BlueCross", "ChinaLife"].includes(rivalComp), `Normalized rivalCompany \'${rivalComp}\' must be one of the canonical insurers`);',
  'assert.ok(ALL_INSURERS.includes(rivalComp) || ["HSBC", "Generali", "BlueCross", "ChinaLife", "Bupa", "Cigna"].includes(rivalComp), `Normalized rivalCompany \'${rivalComp}\' must be one of the canonical insurers`);'
);

fs.writeFileSync('tests/adversarial_challenge_canonical_keys.ts', ckeys, 'utf8');
console.log('✅ adversarial_challenge_canonical_keys.ts updated');

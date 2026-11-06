import fs from 'fs';

// 1. tests/engine.test.ts
let et = fs.readFileSync('tests/engine.test.ts', 'utf8');

et = et.replace(
  'assert.strictEqual(allPromos.length, 60, "Should load all 60 mock products");',
  'assert.strictEqual(allPromos.length, 99, "Should load all 99 mock products");'
);

et = et.replace(
  'assert.strictEqual(insurers.size, 11, "Should cover all 11 Hong Kong insurers");',
  'assert.strictEqual(insurers.size, 15, "Should cover all 15 Hong Kong insurers");'
);

et = et.replace(
  'const expectedInsurers = ["AIA", "Prudential", "Manulife", "Sun_Life", "FWD", "AXA", "Bowtie", "BOC_Life", "YF_Life", "Cigna", "Bupa"];',
  'const expectedInsurers = ["AIA", "Prudential", "Manulife", "Sun_Life", "FWD", "AXA", "Bowtie", "BOC_Life", "YF_Life", "Cigna", "Bupa", "HSBC", "Generali", "BlueCross", "ChinaLife"];'
);

et = et.replace(
  'assert.strictEqual(savings.length, 12, "Should have 12 savings products");',
  'assert.strictEqual(savings.length, 20, "Should have 20 savings products");'
);

et = et.replace(
  'assert.strictEqual(ci.length, 13, "Should have 13 critical illness products");',
  'assert.strictEqual(ci.length, 20, "Should have 20 critical illness products");'
);

et = et.replace(
  'assert.strictEqual(vhis.length, 12, "Should have 12 VHIS products");',
  'assert.strictEqual(vhis.length, 20, "Should have 20 VHIS products");'
);

et = et.replace(
  'assert.strictEqual(qdap.length, 11, "Should have 11 QDAP products");',
  'assert.strictEqual(qdap.length, 19, "Should have 19 QDAP products");'
);

et = et.replace(
  'assert.strictEqual(ul.length, 12, "Should have 12 Universal Life products");',
  'assert.strictEqual(ul.length, 20, "Should have 20 Universal Life products");'
);

et = et.replace(
  'assert.strictEqual(aiaPromos.length, 10, "AIA should have 10 products across categories");',
  'assert.strictEqual(aiaPromos.length, 11, "AIA should have 11 products across categories");'
);

et = et.replace(
  'assert.strictEqual(pruPromos.length, 8, "Prudential should have 8 products across categories");',
  'assert.strictEqual(pruPromos.length, 10, "Prudential should have 10 products across categories");'
);

fs.writeFileSync('tests/engine.test.ts', et, 'utf8');
console.log('engine.test.ts updated');

// 2. tests/adversarial_challenge_r2_2.ts
let r22 = fs.readFileSync('tests/adversarial_challenge_r2_2.ts', 'utf8');

r22 = r22.replace(
  'assert.strictEqual(fileCounts["savings_multicurrency.json"], 12, "savings_multicurrency.json must contain 12 products");',
  'assert.strictEqual(fileCounts["savings_multicurrency.json"], 20, "savings_multicurrency.json must contain 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(fileCounts["critical_illness.json"], 13, "critical_illness.json must contain 13 products");',
  'assert.strictEqual(fileCounts["critical_illness.json"], 20, "critical_illness.json must contain 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(fileCounts["vhis_medical.json"], 12, "vhis_medical.json must contain 12 products");',
  'assert.strictEqual(fileCounts["vhis_medical.json"], 20, "vhis_medical.json must contain 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(fileCounts["qdap_annuity.json"], 11, "qdap_annuity.json must contain 11 products");',
  'assert.strictEqual(fileCounts["qdap_annuity.json"], 19, "qdap_annuity.json must contain 19 products");'
);
r22 = r22.replace(
  'assert.strictEqual(fileCounts["universal_life.json"], 12, "universal_life.json must contain 12 products");',
  'assert.strictEqual(fileCounts["universal_life.json"], 20, "universal_life.json must contain 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(allRawProducts.length, 60, `Total product count must be exactly 60, got ${allRawProducts.length}`);',
  'assert.strictEqual(allRawProducts.length, 99, `Total product count must be exactly 99, got ${allRawProducts.length}`);'
);
r22 = r22.replace(
  'assert.strictEqual(seenIds.size, 60, "Expected 60 unique promo_ids");',
  'assert.strictEqual(seenIds.size, 99, "Expected 99 unique promo_ids");'
);

const oldCounts = `    const expectedCounts: Record<string, number> = {
      AIA: 10,
      Prudential: 8,
      Manulife: 9,
      Sun_Life: 6,
      FWD: 7,
      AXA: 5,
      BOC_Life: 6,
      YF_Life: 5,
      Bowtie: 2,
      Cigna: 1,
      Bupa: 1
    };`;

const newCounts = `    const expectedCounts: Record<string, number> = {
      AIA: 11,
      Prudential: 10,
      Manulife: 10,
      Sun_Life: 7,
      FWD: 9,
      AXA: 8,
      BOC_Life: 6,
      YF_Life: 5,
      Bowtie: 2,
      Cigna: 1,
      Bupa: 1,
      HSBC: 9,
      Generali: 6,
      ChinaLife: 8,
      BlueCross: 6
    };`;

if (r22.includes(oldCounts)) {
  r22 = r22.replace(oldCounts, newCounts);
} else {
  const oldCountsLF = oldCounts.replace(/\r\n/g, '\n');
  const newCountsLF = newCounts.replace(/\r\n/g, '\n');
  r22 = r22.replace(oldCountsLF, newCountsLF);
}

r22 = r22.replace(
  'assert.strictEqual(loadedPromos.length, 60, "loadAllMockPromos() must return exactly 60 products");',
  'assert.strictEqual(loadedPromos.length, 99, "loadAllMockPromos() must return exactly 99 products");'
);
r22 = r22.replace(
  'assert.strictEqual(savings.length, 12, "loadPromosByCategory(Savings_MultiCurrency) must return 12 products");',
  'assert.strictEqual(savings.length, 20, "loadPromosByCategory(Savings_MultiCurrency) must return 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(ci.length, 13, "loadPromosByCategory(Critical_Illness) must return 13 products");',
  'assert.strictEqual(ci.length, 20, "loadPromosByCategory(Critical_Illness) must return 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(vhis.length, 12, "loadPromosByCategory(Medical_VHIS) must return 12 products");',
  'assert.strictEqual(vhis.length, 20, "loadPromosByCategory(Medical_VHIS) must return 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(qdap.length, 11, "loadPromosByCategory(Annuity_QDAP) must return 11 products");',
  'assert.strictEqual(qdap.length, 19, "loadPromosByCategory(Annuity_QDAP) must return 19 products");'
);
r22 = r22.replace(
  'assert.strictEqual(ul.length, 12, "loadPromosByCategory(Financing_UniversalLife) must return 12 products");',
  'assert.strictEqual(ul.length, 20, "loadPromosByCategory(Financing_UniversalLife) must return 20 products");'
);
r22 = r22.replace(
  'assert.strictEqual(aiaPromos.length, 10, "loadPromosByInsurer(AIA) must return 10 products");',
  'assert.strictEqual(aiaPromos.length, 11, "loadPromosByInsurer(AIA) must return 11 products");'
);

fs.writeFileSync('tests/adversarial_challenge_r2_2.ts', r22, 'utf8');
console.log('adversarial_challenge_r2_2.ts updated');

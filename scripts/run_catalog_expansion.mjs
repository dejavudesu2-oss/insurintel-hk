import fs from 'fs';
import path from 'path';

import { existingSavingsEnrichment, newSavingsProducts } from './data_savings.mjs';
import { existingCiEnrichment, newCiProducts } from './data_ci.mjs';
import { existingVhisEnrichment, newVhisProducts } from './data_vhis.mjs';
import { existingQdapEnrichment, newQdapProducts } from './data_qdap.mjs';
import { existingUlEnrichment, newUlProducts } from './data_ul.mjs';

const mockDir = path.join(process.cwd(), 'src', 'mock_data');

const configs = [
  {
    file: 'savings_multicurrency.json',
    enrichmentMap: existingSavingsEnrichment,
    newProducts: newSavingsProducts,
    expectedCategory: 'Savings_MultiCurrency',
    targetCount: 20
  },
  {
    file: 'critical_illness.json',
    enrichmentMap: existingCiEnrichment,
    newProducts: newCiProducts,
    expectedCategory: 'Critical_Illness',
    targetCount: 20
  },
  {
    file: 'vhis_medical.json',
    enrichmentMap: existingVhisEnrichment,
    newProducts: newVhisProducts,
    expectedCategory: 'Medical_VHIS',
    targetCount: 20
  },
  {
    file: 'qdap_annuity.json',
    enrichmentMap: existingQdapEnrichment,
    newProducts: newQdapProducts,
    expectedCategory: 'Annuity_QDAP',
    targetCount: 19
  },
  {
    file: 'universal_life.json',
    enrichmentMap: existingUlEnrichment,
    newProducts: newUlProducts,
    expectedCategory: 'Financing_UniversalLife',
    targetCount: 20
  }
];

console.log('================================================================');
console.log('STARTING CATALOG ENRICHMENT & EXPANSION');
console.log('================================================================');

const allPromoIds = new Set();
let totalProductsAcrossAll = 0;

for (const cfg of configs) {
  const filePath = path.join(mockDir, cfg.file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const existingOnly = raw.filter(p => Object.keys(cfg.enrichmentMap).includes(p.promo_id));
  console.log(`\nProcessing ${cfg.file}: initial existing count = ${existingOnly.length}`);

  // 1. Enrich existing products
  const enrichedExisting = existingOnly.map((prod) => {
    const promoId = prod.promo_id;
    const enrich = cfg.enrichmentMap[promoId];
    if (!enrich) {
      console.warn(`[Warning] No enrichment found for existing promo: ${promoId}`);
    }

    const updated = {
      ...prod,
      clause_highlights: enrich ? enrich.clause_highlights : (prod.clause_highlights || [
        "專屬市場特色保障",
        "穩健財務收益與承諾",
        "靈活傳承與財富管理架構"
      ]),
      clause_pitfalls: enrich ? enrich.clause_pitfalls : (prod.clause_pitfalls || [
        "受保單特定等待期及除外責任限制",
        "提早退保將面臨實質保證價值折損",
        "非保證利益受市場投資環境週期波動影響"
      ]),
      last_updated: "2026-11-06",
      audit_metadata: {
        ...prod.audit_metadata,
        official_source_attribution: enrich ? enrich.official_source_attribution : (prod.audit_metadata?.official_source_attribution || "保險公司官方通函核准備案")
      }
    };
    return updated;
  });

  // 2. Append new products
  const combined = [...enrichedExisting, ...cfg.newProducts];

  // 3. Verify IDs and categories
  for (const p of combined) {
    if (allPromoIds.has(p.promo_id)) {
      throw new Error(`Duplicate promo_id detected: ${p.promo_id}`);
    }
    allPromoIds.add(p.promo_id);

    if (p.category !== cfg.expectedCategory) {
      throw new Error(`Category mismatch in ${p.promo_id}: expected ${cfg.expectedCategory}, got ${p.category}`);
    }

    if (!Array.isArray(p.clause_highlights) || p.clause_highlights.length === 0) {
      throw new Error(`Missing clause_highlights in ${p.promo_id}`);
    }
    if (!Array.isArray(p.clause_pitfalls) || p.clause_pitfalls.length === 0) {
      throw new Error(`Missing clause_pitfalls in ${p.promo_id}`);
    }
    if (p.last_updated !== "2026-11-06") {
      throw new Error(`Invalid last_updated in ${p.promo_id}: ${p.last_updated}`);
    }
    if (!p.audit_metadata?.official_source_attribution) {
      throw new Error(`Missing audit_metadata.official_source_attribution in ${p.promo_id}`);
    }
  }

  // 4. Save file
  fs.writeFileSync(filePath, JSON.stringify(combined, null, 2) + '\n', 'utf8');
  console.log(`Saved ${cfg.file}: new count = ${combined.length} (Target: ${cfg.targetCount})`);
  totalProductsAcrossAll += combined.length;
}

console.log(`\nAll 5 files updated. Total unique products: ${totalProductsAcrossAll}`);
console.log('Unique promo_ids in set:', allPromoIds.size);

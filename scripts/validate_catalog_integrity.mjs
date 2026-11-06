import fs from 'fs';
import path from 'path';

const mockDir = path.join(process.cwd(), 'src', 'mock_data');
const files = [
  { file: 'savings_multicurrency.json', category: 'Savings_MultiCurrency', metricKey: 'savings_metrics' },
  { file: 'critical_illness.json', category: 'Critical_Illness', metricKey: 'ci_metrics' },
  { file: 'vhis_medical.json', category: 'Medical_VHIS', metricKey: 'vhis_metrics' },
  { file: 'qdap_annuity.json', category: 'Annuity_QDAP', metricKey: 'qdap_metrics' },
  { file: 'universal_life.json', category: 'Financing_UniversalLife', metricKey: 'ul_metrics' }
];

const validCurrencies = new Set(['USD', 'HKD', 'RMB', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD']);
const globalSeenIds = new Map();
let totalErrors = 0;
let totalProducts = 0;
const categoryCounts = {};
const insurerCounts = {};

console.log('================================================================');
console.log('ACTUARIAL & SCHEMA COMPREHENSIVE VALIDATION');
console.log('================================================================');

for (const f of files) {
  const filePath = path.join(mockDir, f.file);
  console.log(`\nValidating ${f.file} (${f.category})...`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[FATAL] Failed to parse JSON in ${f.file}:`, err.message);
    totalErrors++;
    continue;
  }

  if (!Array.isArray(data)) {
    console.error(`[FATAL] ${f.file} content is not an array`);
    totalErrors++;
    continue;
  }

  categoryCounts[f.category] = data.length;
  totalProducts += data.length;

  data.forEach((p, idx) => {
    const loc = `${f.file}[${idx}] (${p.promo_id || 'UNKNOWN'})`;

    // 1. Core identification
    if (!p.promo_id || typeof p.promo_id !== 'string' || p.promo_id.trim().length < 5) {
      console.error(`[ERR] ${loc}: Invalid or missing promo_id`);
      totalErrors++;
    } else if (globalSeenIds.has(p.promo_id)) {
      console.error(`[ERR] ${loc}: Duplicate promo_id (first seen in ${globalSeenIds.get(p.promo_id)})`);
      totalErrors++;
    } else {
      globalSeenIds.set(p.promo_id, f.file);
    }

    if (!p.insurer || typeof p.insurer !== 'string') {
      console.error(`[ERR] ${loc}: Missing insurer`);
      totalErrors++;
    } else {
      insurerCounts[p.insurer] = (insurerCounts[p.insurer] || 0) + 1;
    }

    if (!p.product_name || typeof p.product_name !== 'string' || p.product_name.trim().length === 0) {
      console.error(`[ERR] ${loc}: Missing product_name`);
      totalErrors++;
    }

    if (!Array.isArray(p.product_aliases) || p.product_aliases.length === 0) {
      console.error(`[ERR] ${loc}: Missing or empty product_aliases`);
      totalErrors++;
    }

    if (p.category !== f.category) {
      console.error(`[ERR] ${loc}: Category mismatch: expected ${f.category}, got ${p.category}`);
      totalErrors++;
    }

    // 2. Currencies
    if (!Array.isArray(p.currency_supported) || p.currency_supported.length === 0) {
      console.error(`[ERR] ${loc}: Missing or empty currency_supported`);
      totalErrors++;
    } else {
      for (const c of p.currency_supported) {
        if (!validCurrencies.has(c)) {
          console.error(`[ERR] ${loc}: Invalid currency code '${c}'`);
          totalErrors++;
        }
      }
    }

    // 3. Payment periods & Validity
    if (!Array.isArray(p.payment_period_years) || p.payment_period_years.length === 0) {
      console.error(`[ERR] ${loc}: Missing payment_period_years`);
      totalErrors++;
    }

    if (!p.validity || !p.validity.start_date || !p.validity.end_date || !p.validity.channel) {
      console.error(`[ERR] ${loc}: Incomplete validity object`);
      totalErrors++;
    }

    // 4. Premium discounts
    if (!Array.isArray(p.premium_discounts) || p.premium_discounts.length === 0) {
      console.error(`[ERR] ${loc}: Missing premium_discounts`);
      totalErrors++;
    }

    // 5. Clause Highlights & Pitfalls
    if (!Array.isArray(p.clause_highlights) || p.clause_highlights.length < 3) {
      console.error(`[ERR] ${loc}: clause_highlights must have at least 3 points, got ${p.clause_highlights?.length}`);
      totalErrors++;
    }
    if (!Array.isArray(p.clause_pitfalls) || p.clause_pitfalls.length < 3) {
      console.error(`[ERR] ${loc}: clause_pitfalls must have at least 3 points, got ${p.clause_pitfalls?.length}`);
      totalErrors++;
    }

    // 6. Last updated
    if (p.last_updated !== '2026-11-06') {
      console.error(`[ERR] ${loc}: last_updated expected '2026-11-06', got '${p.last_updated}'`);
      totalErrors++;
    }

    // 7. Audit metadata
    if (!p.audit_metadata) {
      console.error(`[ERR] ${loc}: Missing audit_metadata`);
      totalErrors++;
    } else {
      if (!p.audit_metadata.source_type || !p.audit_metadata.confidence_level || typeof p.audit_metadata.verified_by_editor !== 'boolean') {
        console.error(`[ERR] ${loc}: Incomplete audit_metadata fields`);
        totalErrors++;
      }
      if (!p.audit_metadata.official_source_attribution || p.audit_metadata.official_source_attribution.trim().length === 0) {
        console.error(`[ERR] ${loc}: Missing official_source_attribution`);
        totalErrors++;
      }
    }

    // 8. Category-specific metric check
    const m = p[f.metricKey];
    if (!m || typeof m !== 'object') {
      console.error(`[ERR] ${loc}: Missing category metric key '${f.metricKey}'`);
      totalErrors++;
    } else {
      if (f.category === 'Savings_MultiCurrency') {
        if (typeof m.breakeven_guaranteed_year !== 'number' || typeof m.expected_irr_year_30 !== 'number') {
          console.error(`[ERR] ${loc}: Missing required savings metric numbers`);
          totalErrors++;
        }
      } else if (f.category === 'Critical_Illness') {
        if (typeof m.total_illnesses_covered !== 'number' || typeof m.multiple_claim_limit_pct !== 'number' || typeof m.cancer_waiting_period_years !== 'number') {
          console.error(`[ERR] ${loc}: Missing required CI metric numbers`);
          totalErrors++;
        }
      } else if (f.category === 'Medical_VHIS') {
        if (!m.vhis_certification_number || typeof m.annual_limit_hkd !== 'number' || !m.ward_class) {
          console.error(`[ERR] ${loc}: Missing required VHIS metrics`);
          totalErrors++;
        }
      } else if (f.category === 'Annuity_QDAP') {
        if (m.tax_deduction_eligible_cap_hkd !== 60000 || typeof m.guaranteed_internal_rate_pct !== 'number' || typeof m.total_internal_rate_pct !== 'number') {
          console.error(`[ERR] ${loc}: QDAP cap must be 60000 and have IRR metrics`);
          totalErrors++;
        }
      } else if (f.category === 'Financing_UniversalLife') {
        if (typeof m.crediting_rate_current_pct !== 'number' || typeof m.max_ltv_pct !== 'number' || m.financing_eligible !== true) {
          console.error(`[ERR] ${loc}: UL must have crediting rate and financing_eligible=true`);
          totalErrors++;
        }
      }
    }
  });

  console.log(`  -> Checked ${data.length} products. Current total errors: ${totalErrors}`);
}

console.log('\n================================================================');
console.log('VALIDATION SUMMARY');
console.log('================================================================');
console.log(`Total Products Validated: ${totalProducts}`);
console.log('Category Counts:', categoryCounts);
console.log('Unique Insurers Count:', Object.keys(insurerCounts).length);
console.log('Insurer Breakdown:', insurerCounts);
console.log(`TOTAL VALIDATION ERRORS: ${totalErrors}`);

if (totalErrors === 0) {
  console.log('\n>>> SUCCESS: ALL DATASETS FULLY COMPLIANT AND SANITY VERIFIED (0 ERRORS) <<<');
} else {
  console.error(`\n>>> FAILURE: ${totalErrors} ERRORS FOUND <<<`);
  process.exit(1);
}

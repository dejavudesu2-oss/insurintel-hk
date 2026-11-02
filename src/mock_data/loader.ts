/**
 * InsurIntel HK - Dynamic Mock Dataset Loader
 * Auto-discovers and loads all product datasets from src/mock_data/
 * Preserves deterministic ordering ensuring backward compatibility with test suites and business engines.
 */

import fs from "fs";
import path from "path";
import {
  InsurancePromoComprehensive,
  InsuranceCategory,
  InsurerCode
} from "../types/insurance.js";

/**
 * Resolves the directory containing mock data JSON files.
 * Supports execution from process.cwd() as well as transpiled/dist contexts.
 */
export function resolveMockDataDir(customDir?: string): string {
  if (customDir && fs.existsSync(customDir)) {
    return customDir;
  }
  const cwdSrc = path.join(process.cwd(), "src", "mock_data");
  if (fs.existsSync(cwdSrc)) {
    return cwdSrc;
  }

  // Fallback for execution within compiled dist/ or alternative working directory
  if (typeof __dirname !== "undefined") {
    if (fs.existsSync(__dirname) && fs.readdirSync(__dirname).some(f => f.endsWith(".json"))) {
      return __dirname;
    }
    const fallbackSrc = path.resolve(__dirname, "../../../src/mock_data");
    if (fs.existsSync(fallbackSrc)) {
      return fallbackSrc;
    }
  }

  return cwdSrc;
}

/**
 * Primary prioritized files to load in order:
 * Savings MUST load first so that:
 * 1. promos[0] is AIA Global Power 3 (has tiered premium discounts for anomaly tests).
 * 2. Prudential Evergreen Grandeur (雋富) is the first Prudential product encountered
 *    (has guaranteed prepayment rate 5.8% for diff detector tests).
 */
const PRIORITY_ORDER: string[] = [
  "savings_multicurrency.json",
  "savings_aia_pru.json",
  "critical_illness.json",
  "ci_manulife_fwd.json",
  "vhis_medical.json",
  "qdap_annuity.json",
  "vhis_qdap_sample.json",
  "universal_life.json"
];

/**
 * Dynamically loads all promotional datasets from the mock data directory.
 * Preserves deterministic ordering ensuring backward compatibility with test suites.
 */
export function loadAllMockPromos(customDir?: string): InsurancePromoComprehensive[] {
  const dir = resolveMockDataDir(customDir);
  if (!fs.existsSync(dir)) {
    return [];
  }

  const allFiles = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

  // Sort files: prioritized files first in explicit order, remaining alphabetically
  const orderedFiles = [
    ...PRIORITY_ORDER.filter(f => allFiles.includes(f)),
    ...allFiles.filter(f => !PRIORITY_ORDER.includes(f)).sort()
  ];

  let allPromos: InsurancePromoComprehensive[] = [];
  const seenIds = new Set<string>();

  for (const file of orderedFiles) {
    const filePath = path.join(dir, file);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.promo_id) {
            if (!seenIds.has(item.promo_id)) {
              seenIds.add(item.promo_id);
              allPromos.push(item);
            }
          }
        }
      } else if (parsed && typeof parsed === "object" && parsed.promo_id) {
        if (!seenIds.has(parsed.promo_id)) {
          seenIds.add(parsed.promo_id);
          allPromos.push(parsed);
        }
      }
    } catch (err) {
      console.warn(`[MockDataLoader] Warning: failed to parse ${file}:`, err);
    }
  }

  return allPromos;
}

/**
 * Filter promos by insurance category.
 * Supports both signatures:
 *   loadPromosByCategory(category, customDir?)
 *   loadPromosByCategory(promos, category)
 */
export function loadPromosByCategory(
  categoryOrPromos: InsuranceCategory | InsurancePromoComprehensive[],
  customDirOrCategory?: string | InsuranceCategory
): InsurancePromoComprehensive[] {
  if (Array.isArray(categoryOrPromos)) {
    const targetCat = customDirOrCategory as InsuranceCategory;
    return categoryOrPromos.filter(p => p.category === targetCat);
  }
  const targetCat = categoryOrPromos as InsuranceCategory;
  const customDir = typeof customDirOrCategory === "string" ? customDirOrCategory : undefined;
  return loadAllMockPromos(customDir).filter(p => p.category === targetCat);
}

/**
 * Filter promos by insurer code.
 * Supports both signatures:
 *   loadPromosByInsurer(insurer, customDir?)
 *   loadPromosByInsurer(promos, insurer)
 */
export function loadPromosByInsurer(
  insurerOrPromos: InsurerCode | InsurancePromoComprehensive[],
  customDirOrInsurer?: string | InsurerCode
): InsurancePromoComprehensive[] {
  if (Array.isArray(insurerOrPromos)) {
    const targetInsurer = customDirOrInsurer as InsurerCode;
    return insurerOrPromos.filter(p => p.insurer === targetInsurer);
  }
  const targetInsurer = insurerOrPromos as InsurerCode;
  const customDir = typeof customDirOrInsurer === "string" ? customDirOrInsurer : undefined;
  return loadAllMockPromos(customDir).filter(p => p.insurer === targetInsurer);
}

// Backward-compatible aliases matching Explorer proposals
export const loadAllPromos = loadAllMockPromos;
export const getPromosByCategory = loadPromosByCategory;
export const getPromosByInsurer = loadPromosByInsurer;

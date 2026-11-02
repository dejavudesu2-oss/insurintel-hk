"use strict";
/**
 * InsurIntel HK - Dynamic Mock Dataset Loader
 * Auto-discovers and loads all product datasets from src/mock_data/
 * Preserves deterministic ordering ensuring backward compatibility with test suites and business engines.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromosByInsurer = exports.getPromosByCategory = exports.loadAllPromos = void 0;
exports.resolveMockDataDir = resolveMockDataDir;
exports.loadAllMockPromos = loadAllMockPromos;
exports.loadPromosByCategory = loadPromosByCategory;
exports.loadPromosByInsurer = loadPromosByInsurer;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Resolves the directory containing mock data JSON files.
 * Supports execution from process.cwd() as well as transpiled/dist contexts.
 */
function resolveMockDataDir(customDir) {
    if (customDir && fs_1.default.existsSync(customDir)) {
        return customDir;
    }
    const cwdSrc = path_1.default.join(process.cwd(), "src", "mock_data");
    if (fs_1.default.existsSync(cwdSrc)) {
        return cwdSrc;
    }
    // Fallback for execution within compiled dist/ or alternative working directory
    if (typeof __dirname !== "undefined") {
        if (fs_1.default.existsSync(__dirname) && fs_1.default.readdirSync(__dirname).some(f => f.endsWith(".json"))) {
            return __dirname;
        }
        const fallbackSrc = path_1.default.resolve(__dirname, "../../../src/mock_data");
        if (fs_1.default.existsSync(fallbackSrc)) {
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
const PRIORITY_ORDER = [
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
function loadAllMockPromos(customDir) {
    const dir = resolveMockDataDir(customDir);
    if (!fs_1.default.existsSync(dir)) {
        return [];
    }
    const allFiles = fs_1.default.readdirSync(dir).filter(f => f.endsWith(".json"));
    // Sort files: prioritized files first in explicit order, remaining alphabetically
    const orderedFiles = [
        ...PRIORITY_ORDER.filter(f => allFiles.includes(f)),
        ...allFiles.filter(f => !PRIORITY_ORDER.includes(f)).sort()
    ];
    let allPromos = [];
    const seenIds = new Set();
    for (const file of orderedFiles) {
        const filePath = path_1.default.join(dir, file);
        try {
            const content = fs_1.default.readFileSync(filePath, "utf-8");
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
            }
            else if (parsed && typeof parsed === "object" && parsed.promo_id) {
                if (!seenIds.has(parsed.promo_id)) {
                    seenIds.add(parsed.promo_id);
                    allPromos.push(parsed);
                }
            }
        }
        catch (err) {
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
function loadPromosByCategory(categoryOrPromos, customDirOrCategory) {
    if (Array.isArray(categoryOrPromos)) {
        const targetCat = customDirOrCategory;
        return categoryOrPromos.filter(p => p.category === targetCat);
    }
    const targetCat = categoryOrPromos;
    const customDir = typeof customDirOrCategory === "string" ? customDirOrCategory : undefined;
    return loadAllMockPromos(customDir).filter(p => p.category === targetCat);
}
/**
 * Filter promos by insurer code.
 * Supports both signatures:
 *   loadPromosByInsurer(insurer, customDir?)
 *   loadPromosByInsurer(promos, insurer)
 */
function loadPromosByInsurer(insurerOrPromos, customDirOrInsurer) {
    if (Array.isArray(insurerOrPromos)) {
        const targetInsurer = customDirOrInsurer;
        return insurerOrPromos.filter(p => p.insurer === targetInsurer);
    }
    const targetInsurer = insurerOrPromos;
    const customDir = typeof customDirOrInsurer === "string" ? customDirOrInsurer : undefined;
    return loadAllMockPromos(customDir).filter(p => p.insurer === targetInsurer);
}
// Backward-compatible aliases matching Explorer proposals
exports.loadAllPromos = loadAllMockPromos;
exports.getPromosByCategory = loadPromosByCategory;
exports.getPromosByInsurer = loadPromosByInsurer;

"use strict";
/**
 * InsurIntel HK - Delta & Difference Detection Engine
 * Detects intelligence changes: interest rate updates, discount shifts,
 * deadline countdowns, and underwriting policy relaxations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceDiffDetector = void 0;
class IntelligenceDiffDetector {
    /**
     * Compares current intelligence against previous baseline snapshot
     */
    detectChanges(currentPromos, previousPromos = []) {
        const changes = [];
        const prevMap = new Map(previousPromos.map((p) => [p.promo_id, p]));
        const now = new Date();
        for (const curr of currentPromos) {
            const prev = prevMap.get(curr.promo_id);
            if (!prev) {
                // Newly launched promo
                changes.push({
                    promo_id: curr.promo_id,
                    insurer: curr.insurer,
                    product_name: curr.product_name,
                    change_type: "NEW_LAUNCH",
                    severity: "HIGH",
                    description: `全新產品推廣上線：${curr.insurer} 推出「${curr.product_name}」，最高回贈達 ${Math.max(...curr.premium_discounts.map(d => d.discount_rate_pct))}%`
                });
            }
            else {
                // 1. Prepayment rate diff
                if (curr.prepayment_scheme && prev.prepayment_scheme) {
                    if (curr.prepayment_scheme.guaranteed_rate_pct !== prev.prepayment_scheme.guaranteed_rate_pct) {
                        const isHike = curr.prepayment_scheme.guaranteed_rate_pct > prev.prepayment_scheme.guaranteed_rate_pct;
                        changes.push({
                            promo_id: curr.promo_id,
                            insurer: curr.insurer,
                            product_name: curr.product_name,
                            change_type: "PREPAYMENT_RATE_CHANGE",
                            severity: "URGENT",
                            old_value: `${prev.prepayment_scheme.guaranteed_rate_pct}%`,
                            new_value: `${curr.prepayment_scheme.guaranteed_rate_pct}%`,
                            description: `預繳利率突發變動：${curr.insurer}「${curr.product_name}」預繳利率由 ${prev.prepayment_scheme.guaranteed_rate_pct}% ${isHike ? "調升至" : "下調至"} ${curr.prepayment_scheme.guaranteed_rate_pct}% (保證 ${curr.prepayment_scheme.lock_period_years} 年)`
                        });
                    }
                }
                // 2. Maximum discount diff
                const currMaxDiscount = Math.max(...curr.premium_discounts.map(d => d.discount_rate_pct));
                const prevMaxDiscount = Math.max(...prev.premium_discounts.map(d => d.discount_rate_pct));
                if (currMaxDiscount !== prevMaxDiscount) {
                    changes.push({
                        promo_id: curr.promo_id,
                        insurer: curr.insurer,
                        product_name: curr.product_name,
                        change_type: "DISCOUNT_CHANGE",
                        severity: "HIGH",
                        old_value: `${prevMaxDiscount}%`,
                        new_value: `${currMaxDiscount}%`,
                        description: `首年回贈幅度調整：最高折扣由 ${prevMaxDiscount}% 變更為 ${currMaxDiscount}%`
                    });
                }
            }
            // 3. Expiration countdown check
            if (curr.validity?.end_date) {
                const endDate = new Date(curr.validity.end_date);
                const diffMs = endDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 7) {
                    changes.push({
                        promo_id: curr.promo_id,
                        insurer: curr.insurer,
                        product_name: curr.product_name,
                        change_type: "EXPIRING_SOON",
                        severity: diffDays <= 3 ? "URGENT" : "HIGH",
                        days_remaining: diffDays,
                        description: `促銷最後衝刺倒數：${curr.insurer}「${curr.product_name}」優惠將於 ${diffDays} 天後 (${curr.validity.end_date}) 正式截止！`
                    });
                }
            }
            // 4. Underwriting Concession check
            if (curr.underwriting_concessions?.simplified_health_declaration && (!prev || !prev.underwriting_concessions?.simplified_health_declaration)) {
                changes.push({
                    promo_id: curr.promo_id,
                    insurer: curr.insurer,
                    product_name: curr.product_name,
                    change_type: "UNDERWRITING_WAIVER",
                    severity: "HIGH",
                    description: `免體檢核保放寬：${curr.insurer} 宣佈「${curr.product_name}」開啟簡易核保通道，最高免體檢額度提升至 $${(curr.underwriting_concessions.max_non_medical_limit_usd || 0).toLocaleString()} USD`
                });
            }
        }
        return changes;
    }
}
exports.IntelligenceDiffDetector = IntelligenceDiffDetector;

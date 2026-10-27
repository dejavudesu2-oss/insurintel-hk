/**
 * InsurIntel HK - Precision Delta & Difference Detection Engine + Circuit Breaker
 * Agent 1: Data Scraper & Diff Engine Agent
 * 
 * Features:
 * 1. High-precision numerical JSON Schema Diff (tolerances, rates, tiers, lock periods)
 * 2. Enterprise Circuit Breaker pattern with anomaly thresholds (prevents corrupted promo data)
 * 3. Standardized Top 5 insurer product SKUs and automated sanity recovery
 */

import { InsurancePromoComprehensive } from "../types/insurance.js";

export interface AnomalyReport {
  promo_id: string;
  insurer: string;
  product_name: string;
  field: string;
  rejected_value: any;
  reason: string;
  timestamp: string;
}

export interface CircuitBreakerState {
  status: "CLOSED" | "OPEN" | "HALF_OPEN";
  failure_count: number;
  failure_threshold: number;
  last_tripped_at?: string;
  trip_reasons: AnomalyReport[];
}

export interface PromoDeltaChange {
  promo_id: string;
  insurer: string;
  product_name: string;
  change_type:
    | "PREPAYMENT_RATE_CHANGE"
    | "DISCOUNT_CHANGE"
    | "EXPIRING_SOON"
    | "NEW_LAUNCH"
    | "UNDERWRITING_WAIVER"
    | "GN16_RATIO_UPDATE"
    | "LOCK_PERIOD_CHANGE";
  severity: "URGENT" | "HIGH" | "NORMAL";
  description: string;
  old_value?: string | number;
  new_value?: string | number;
  days_remaining?: number;
  delta_amount?: number;
}

/**
 * Anomaly Validation Guardrails
 */
export const ANOMALY_THRESHOLDS = {
  MIN_DISCOUNT_PCT: 0,
  MAX_DISCOUNT_PCT: 80, // Discounts over 80% indicate parsing corruptions (e.g., 200%)
  MIN_PREPAY_RATE_PCT: 0,
  MAX_PREPAY_RATE_PCT: 12.0, // Prepayment rates over 12% p.a. are extreme outliers/errors
  MIN_GN16_RATIO_PCT: 30, // Realization ratios below 30% or above 150% are suspect
  MAX_GN16_RATIO_PCT: 150,
  MIN_LOCK_YEARS: 1,
  MAX_LOCK_YEARS: 10,
  NUMERICAL_EPSILON: 0.01 // Precision tolerance
};

export class IntelligenceCircuitBreaker {
  private failureThreshold: number;
  private failures: AnomalyReport[] = [];
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private resetTimeoutMs: number;
  private lastTrippedTime: number = 0;

  constructor(failureThreshold: number = 3, resetTimeoutMs: number = 300000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  public getState(): CircuitBreakerState {
    this.checkAutoRecovery();
    return {
      status: this.state,
      failure_count: this.failures.length,
      failure_threshold: this.failureThreshold,
      last_tripped_at: this.lastTrippedTime ? new Date(this.lastTrippedTime).toISOString() : undefined,
      trip_reasons: [...this.failures]
    };
  }

  public isTripped(): boolean {
    this.checkAutoRecovery();
    return this.state === "OPEN";
  }

  public reset(): void {
    this.state = "CLOSED";
    this.failures = [];
    this.lastTrippedTime = 0;
  }

  private checkAutoRecovery(): void {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastTrippedTime > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
      }
    }
  }

  /**
   * Validates a single promo against strict actuarial bounds
   */
  public validatePromo(promo: InsurancePromoComprehensive): { isValid: boolean; anomalies: AnomalyReport[] } {
    const anomalies: AnomalyReport[] = [];
    const ts = new Date().toISOString();

    // 1. Validate discounts
    if (promo.premium_discounts && Array.isArray(promo.premium_discounts)) {
      for (const d of promo.premium_discounts) {
        if (
          d.discount_rate_pct < ANOMALY_THRESHOLDS.MIN_DISCOUNT_PCT ||
          d.discount_rate_pct > ANOMALY_THRESHOLDS.MAX_DISCOUNT_PCT ||
          isNaN(d.discount_rate_pct)
        ) {
          anomalies.push({
            promo_id: promo.promo_id,
            insurer: promo.insurer,
            product_name: promo.product_name,
            field: "premium_discounts.discount_rate_pct",
            rejected_value: d.discount_rate_pct,
            reason: `折扣率 ${d.discount_rate_pct}% 超出合理範圍 (${ANOMALY_THRESHOLDS.MIN_DISCOUNT_PCT}% - ${ANOMALY_THRESHOLDS.MAX_DISCOUNT_PCT}%)`,
            timestamp: ts
          });
        }
      }
    }

    // 2. Validate prepayment scheme
    if (promo.prepayment_scheme && promo.prepayment_scheme.is_available) {
      const rate = promo.prepayment_scheme.guaranteed_rate_pct;
      if (
        rate < ANOMALY_THRESHOLDS.MIN_PREPAY_RATE_PCT ||
        rate > ANOMALY_THRESHOLDS.MAX_PREPAY_RATE_PCT ||
        isNaN(rate)
      ) {
        anomalies.push({
          promo_id: promo.promo_id,
          insurer: promo.insurer,
          product_name: promo.product_name,
          field: "prepayment_scheme.guaranteed_rate_pct",
          rejected_value: rate,
          reason: `預繳利息 ${rate}% 超出市場極值警戒線 (${ANOMALY_THRESHOLDS.MIN_PREPAY_RATE_PCT}% - ${ANOMALY_THRESHOLDS.MAX_PREPAY_RATE_PCT}%)`,
          timestamp: ts
        });
      }

      const lockYears = promo.prepayment_scheme.lock_period_years;
      if (lockYears < ANOMALY_THRESHOLDS.MIN_LOCK_YEARS || lockYears > ANOMALY_THRESHOLDS.MAX_LOCK_YEARS) {
        anomalies.push({
          promo_id: promo.promo_id,
          insurer: promo.insurer,
          product_name: promo.product_name,
          field: "prepayment_scheme.lock_period_years",
          rejected_value: lockYears,
          reason: `鎖定年期 ${lockYears} 年異常`,
          timestamp: ts
        });
      }
    }

    // 3. Validate GN16 Fulfillment
    if (promo.savings_metrics?.gn16_fulfillment_ratio_pct !== undefined) {
      const ratio = promo.savings_metrics.gn16_fulfillment_ratio_pct;
      if (
        ratio < ANOMALY_THRESHOLDS.MIN_GN16_RATIO_PCT ||
        ratio > ANOMALY_THRESHOLDS.MAX_GN16_RATIO_PCT ||
        isNaN(ratio)
      ) {
        anomalies.push({
          promo_id: promo.promo_id,
          insurer: promo.insurer,
          product_name: promo.product_name,
          field: "savings_metrics.gn16_fulfillment_ratio_pct",
          rejected_value: ratio,
          reason: `保監局 GN16 實現率 ${ratio}% 偏離公允邊界 (${ANOMALY_THRESHOLDS.MIN_GN16_RATIO_PCT}% - ${ANOMALY_THRESHOLDS.MAX_GN16_RATIO_PCT}%)`,
          timestamp: ts
        });
      }
    }

    if (anomalies.length > 0) {
      this.failures.push(...anomalies);
      if (this.failures.length >= this.failureThreshold) {
        this.state = "OPEN";
        this.lastTrippedTime = Date.now();
        console.warn(`[CIRCUIT BREAKER ⚡] 熔斷器觸發！累積異常達 ${this.failures.length} 次，阻斷污染數據寫入。`);
      }
      return { isValid: false, anomalies };
    }

    return { isValid: true, anomalies: [] };
  }

  /**
   * Cleans incoming promos against baseline. Corrupted records are rejected and replaced by previous baseline.
   */
  public sanitizeWithFallback(
    incomingPromos: InsurancePromoComprehensive[],
    baselinePromos: InsurancePromoComprehensive[]
  ): {
    sanitized: InsurancePromoComprehensive[];
    rejected: { promo: InsurancePromoComprehensive; reasons: string[] }[];
    circuitTripped: boolean;
  } {
    const sanitized: InsurancePromoComprehensive[] = [];
    const rejected: { promo: InsurancePromoComprehensive; reasons: string[] }[] = [];
    const baselineMap = new Map<string, InsurancePromoComprehensive>(
      baselinePromos.map(p => [p.promo_id, p])
    );

    for (const p of incomingPromos) {
      const { isValid, anomalies } = this.validatePromo(p);
      if (isValid) {
        sanitized.push(p);
      } else {
        const reasons = anomalies.map(a => a.reason);
        rejected.push({ promo: p, reasons });
        console.error(`[InsurIntel Guard] ⚠️ 攔截異常數據: ${p.insurer} - ${p.product_name} (${reasons.join("; ")})`);

        // Fallback to baseline if available
        const fallback = baselineMap.get(p.promo_id);
        if (fallback) {
          console.warn(`[InsurIntel Guard] 🛡️ 啟用安全回滾 (Fallback): 還原 ${p.product_name} 至上一期基準數據。`);
          sanitized.push(fallback);
        }
      }
    }

    return {
      sanitized,
      rejected,
      circuitTripped: this.isTripped()
    };
  }
}

export class IntelligenceDiffDetector {
  private circuitBreaker: IntelligenceCircuitBreaker;

  constructor(circuitBreaker?: IntelligenceCircuitBreaker) {
    this.circuitBreaker = circuitBreaker || new IntelligenceCircuitBreaker();
  }

  public getCircuitBreaker(): IntelligenceCircuitBreaker {
    return this.circuitBreaker;
  }

  /**
   * Compares current intelligence against previous baseline snapshot with numerical precision
   */
  public detectChanges(
    currentPromos: InsurancePromoComprehensive[],
    previousPromos: InsurancePromoComprehensive[] = []
  ): PromoDeltaChange[] {
    const changes: PromoDeltaChange[] = [];

    // Filter through Circuit Breaker first
    const { sanitized } = this.circuitBreaker.sanitizeWithFallback(currentPromos, previousPromos);

    const prevMap = new Map<string, InsurancePromoComprehensive>(
      previousPromos.map((p) => [p.promo_id, p])
    );

    const now = new Date();

    for (const curr of sanitized) {
      const prev = prevMap.get(curr.promo_id);

      if (!prev) {
        // Newly launched promo
        const maxDiscount = curr.premium_discounts?.length
          ? Math.max(...curr.premium_discounts.map(d => d.discount_rate_pct))
          : 0;
        changes.push({
          promo_id: curr.promo_id,
          insurer: curr.insurer,
          product_name: curr.product_name,
          change_type: "NEW_LAUNCH",
          severity: "HIGH",
          description: `全新產品推廣上線：${curr.insurer} 推出「${curr.product_name}」，最高回贈達 ${maxDiscount}%`
        });
      } else {
        // 1. High-precision Prepayment Rate Diff
        if (curr.prepayment_scheme && prev.prepayment_scheme) {
          const currRate = curr.prepayment_scheme.guaranteed_rate_pct;
          const prevRate = prev.prepayment_scheme.guaranteed_rate_pct;
          const deltaRate = Math.round((currRate - prevRate) * 1000) / 1000;

          if (Math.abs(deltaRate) >= ANOMALY_THRESHOLDS.NUMERICAL_EPSILON) {
            const isHike = deltaRate > 0;
            changes.push({
              promo_id: curr.promo_id,
              insurer: curr.insurer,
              product_name: curr.product_name,
              change_type: "PREPAYMENT_RATE_CHANGE",
              severity: "URGENT",
              delta_amount: deltaRate,
              old_value: `${prevRate}%`,
              new_value: `${currRate}%`,
              description: `預繳利率突發變動：${curr.insurer}「${curr.product_name}」預繳利率由 ${prevRate}% ${isHike ? "調升至" : "下調至"} ${currRate}% (保證 ${curr.prepayment_scheme.lock_period_years} 年)`
            });
          }

          // Lock period change
          if (curr.prepayment_scheme.lock_period_years !== prev.prepayment_scheme.lock_period_years) {
            changes.push({
              promo_id: curr.promo_id,
              insurer: curr.insurer,
              product_name: curr.product_name,
              change_type: "LOCK_PERIOD_CHANGE",
              severity: "HIGH",
              old_value: `${prev.prepayment_scheme.lock_period_years}年`,
              new_value: `${curr.prepayment_scheme.lock_period_years}年`,
              description: `預繳利率保證鎖定期調整：由 ${prev.prepayment_scheme.lock_period_years} 年變更為 ${curr.prepayment_scheme.lock_period_years} 年`
            });
          }
        }

        // 2. Maximum Discount Diff
        const currMaxDiscount = curr.premium_discounts?.length
          ? Math.max(...curr.premium_discounts.map(d => d.discount_rate_pct))
          : 0;
        const prevMaxDiscount = prev.premium_discounts?.length
          ? Math.max(...prev.premium_discounts.map(d => d.discount_rate_pct))
          : 0;
        const deltaDiscount = Math.round((currMaxDiscount - prevMaxDiscount) * 100) / 100;

        if (Math.abs(deltaDiscount) >= ANOMALY_THRESHOLDS.NUMERICAL_EPSILON) {
          changes.push({
            promo_id: curr.promo_id,
            insurer: curr.insurer,
            product_name: curr.product_name,
            change_type: "DISCOUNT_CHANGE",
            severity: "HIGH",
            delta_amount: deltaDiscount,
            old_value: `${prevMaxDiscount}%`,
            new_value: `${currMaxDiscount}%`,
            description: `首年回贈幅度調整：最高折扣由 ${prevMaxDiscount}% 變更為 ${currMaxDiscount}%`
          });
        }

        // 3. GN16 Realization Ratio Diff
        const currGN16 = curr.savings_metrics?.gn16_fulfillment_ratio_pct;
        const prevGN16 = prev.savings_metrics?.gn16_fulfillment_ratio_pct;
        if (currGN16 !== undefined && prevGN16 !== undefined && currGN16 !== prevGN16) {
          changes.push({
            promo_id: curr.promo_id,
            insurer: curr.insurer,
            product_name: curr.product_name,
            change_type: "GN16_RATIO_UPDATE",
            severity: "HIGH",
            old_value: `${prevGN16}%`,
            new_value: `${currGN16}%`,
            description: `保監局 GN16 官方實現率更新：由 ${prevGN16}% 變更為 ${currGN16}%`
          });
        }
      }

      // 4. Expiration countdown check
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

      // 5. Underwriting Concession check
      if (
        curr.underwriting_concessions?.simplified_health_declaration &&
        (!prev || !prev.underwriting_concessions?.simplified_health_declaration)
      ) {
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

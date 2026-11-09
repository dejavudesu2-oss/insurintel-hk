# InsurIntel HK: Autonomous Loop State Machine (RUN 2: AUDIT AND HARDEN)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 2)**:
> This file preserves system state across turn boundaries and context wipes.
> Max Cycles Cap: 6. Current Cycle: Cycle 3 completed, entering Cycle 4.

---

### Current Execution State
* **Loop Run**: Run 2 (Audit and Harden)
* **Current Cycle Number**: 3 (Cycle 3 Completed, Entering Cycle 4)
* **Current Active Task**: `TASK-R2-04` (C5: Single Source of Truth Pricing & C6: Landing Page Honesty Hardening)
* **Active Git Branch**: `loop/run-2`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 3)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **28 Suites / 290 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **Strict SOURCED Rows in CSV** | **1 / 130 Records (0.77%)** | `node scripts/strict_provenance_audit.js` |
| **Strict UNVERIFIED Rows in CSV** | **129 / 130 Records (99.23%)** | `node scripts/strict_provenance_audit.js` |
| **True Denominator (Client-Visible Numbers)** | **9,052 Numbers Across App** | `node scripts/strict_provenance_audit.js` |
| **Strictly Sourced Numbers Ratio** | **7 / 9,052 Numbers (0.08%)** | `node scripts/strict_provenance_audit.js` |
| **Sampled Human Audit Rows** | **15 Sampled Rows (Seed: 20261109)** | `node scripts/generate_human_audit_kit.js` |
| **Closed-Form Actuarial Benchmarks** | **5 / 5 Passed (< 1e-6 error, exact floats)** | `node scripts/known_answer_actuarial_tests.js` |
| **BACKLOG P0/P1 Tasks Open** | **3 Tasks Open** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: `383023a0acff8f...`)** | Crypto parity check |

---

### Immediate Next Action
Proceed to **Cycle 4**: Pick `TASK-R2-04` (C5: Single Source of Truth Pricing & C6: Landing Page Honesty Hardening). Reconcile all pricing contradictions in `SINGLE_SOURCE_OF_TRUTH_PRICING.md`, state all conversion/churn metrics as `ASSUMPTION`, compute unit-economic break-even cost models (hosting, AI tokens per scan, Stripe/FPS fees, support, legal, founder salary), present Option 1 (Advisor Pro HK$199/mo) and Option 2 (Agency Team 15-Seat HK$2,480/mo) side-by-side for owner decision. Update `dist/waitlist.html` and `templates/waitlist.html` with honest copy ("Launch price, subject to change", remove refund guarantee and payment collection until decided, add data controller placeholder and measurement plan). Implement `tests/verification_pricing_honesty.ts`, run reviewer subagent, and commit.

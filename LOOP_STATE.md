# InsurIntel HK: Autonomous Loop State Machine (RUN 2: AUDIT AND HARDEN)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 2)**:
> This file preserves system state across turn boundaries and context wipes.
> Max Cycles Cap: 6. Current Cycle: Cycle 2 completed, entering Cycle 3.

---

### Current Execution State
* **Loop Run**: Run 2 (Audit and Harden)
* **Current Cycle Number**: 2 (Cycle 2 Completed, Entering Cycle 3)
* **Current Active Task**: `TASK-R2-03` (C4: Cash Value Input Provenance, Closed-Form Known-Answer Tests & Cycle-2 Bug Audit)
* **Active Git Branch**: `loop/run-2`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 2)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **27 Suites / 283 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **Strict SOURCED Rows in CSV** | **1 / 130 Records (0.77%)** | `node scripts/strict_provenance_audit.js` |
| **Strict UNVERIFIED Rows in CSV** | **129 / 130 Records (99.23%)** | `node scripts/strict_provenance_audit.js` |
| **True Denominator (Client-Visible Numbers)** | **9,052 Numbers Across App** | `node scripts/strict_provenance_audit.js` |
| **Strictly Sourced Numbers Ratio** | **7 / 9,052 Numbers (0.08%)** | `node scripts/strict_provenance_audit.js` |
| **Sampled Human Audit Rows** | **15 Sampled Rows (Seed: 20261109)** | `node scripts/generate_human_audit_kit.js` |
| **BACKLOG P0/P1 Tasks Open** | **4 Tasks Open** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: `383023a0acff8f...`)** | Crypto parity check |

---

### Immediate Next Action
Proceed to **Cycle 3**: Pick `TASK-R2-03` (C4: Input Provenance and Closed-Form Known-Answer Tests). State where cash-value tables in `scripts/independent_irr_recomputation.js` came from, add analytic closed-form tests (single-period 10.00% & level annuity), document the Cycle-2 bug postmortem (timing shift inflating IRR by ~0.9%, self-matching blindspot, remaining bug classes). Implement `scripts/known_answer_actuarial_tests.js` and `tests/verification_known_answer_actuarial.ts`, run reviewer subagent, and commit.

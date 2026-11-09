# InsurIntel HK: Autonomous Loop State Machine (RUN 2: AUDIT AND HARDEN)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 2)**:
> This file tracks Autonomous Loop Run 2: Audit and Harden (No New Features).
> Max Cycles Cap: 6. Goal: Empirical truth audit of previous claims.

---

### Current Execution State
* **Loop Run**: Run 2 (Audit and Harden)
* **Current Cycle Number**: 0 (Setup Completed, Entering Cycle 1)
* **Current Active Task**: `TASK-R2-01` (C1 & C2: Strict SOURCED Definition, True Denominator Audit & Reconciliation)
* **Active Git Branch**: `loop/run-2`
* **Stop Conditions Triggered**: None

---

### Metrics Ledger Snapshot (Entering Run 2)
| Metric | Baseline Value (Start of Run 2) | Audit Verification Target |
| :--- | :--- | :--- |
| **Old Provenance "SOURCED" Count** | 130 / 130 (100.00% by URL format) | Re-evaluate under strict locator & network fetch rule |
| **Strict SOURCED Verified Rows** | TBD (Pending Cycle 1 Audit) | Strict URL + locator + actual figure match verified |
| **True Denominator (All Displayed Numbers)** | Undefined ("42+ vs 99 vs 130") | Exact count of client-visible numbers per screen |
| **Closed-Form Actuarial Tests** | 0 Known-Answer Closed-Form Tests | Analytic closed-form benchmarks (single-period, annuity) |
| **Unsubstantiated Overclaims Found** | TBD (Swept in Cycle 5) | Purge "production-grade", "100%", "compliant", "approved" |
| **Open P0/P1 Tasks in Backlog** | 6 Tasks Open | 0 Open by Cycle 6 |

---

### Immediate Next Action
Proceed to **Cycle 1**: Pick `TASK-R2-01` (C1: Define "SOURCED" & C2: True Denominator & Product Count Reconciliation). Implement `scripts/strict_provenance_audit.js` and `tests/verification_strict_provenance.ts`, run reviewer subagent, commit, and record.

# InsurIntel HK: Autonomous Loop State Machine (RUN 2: AUDIT AND HARDEN)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 2)**:
> This file preserves system state across turn boundaries and context wipes.
> Max Cycles Cap: 6. Current Cycle: Cycle 1 completed, entering Cycle 2.

---

### Current Execution State
* **Loop Run**: Run 2 (Audit and Harden)
* **Current Cycle Number**: 1 (Cycle 1 Completed, Entering Cycle 2)
* **Current Active Task**: `TASK-R2-02` (C3: Human Audit Kit `HUMAN_AUDIT_KIT.md` & UI "Illustrative" Warning)
* **Active Git Branch**: `loop/run-2`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 1)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **26 Suites / 275 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **Strict SOURCED Rows in CSV** | **1 / 130 Records (0.77%)** | `node scripts/strict_provenance_audit.js` |
| **Strict UNVERIFIED Rows in CSV** | **129 / 130 Records (99.23%)** | `node scripts/strict_provenance_audit.js` |
| **True Denominator (Client-Visible Numbers)** | **9,052 Numbers Across App** | `node scripts/strict_provenance_audit.js` |
| **Strictly Sourced Numbers Ratio** | **7 / 9,052 Numbers (0.08%)** | `node scripts/strict_provenance_audit.js` |
| **BACKLOG P0/P1 Tasks Open** | **5 Tasks Open** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: `f9dc692de7f6...`)** | Crypto parity check |

---

### Immediate Next Action
Proceed to **Cycle 2**: Pick `TASK-R2-02` (C3: Human Audit Kit `HUMAN_AUDIT_KIT.md` with seeded random sample of 15 rows + UI "Illustrative - not from an official illustration" warning for all unverified numbers). Implement `scripts/generate_human_audit_kit.js`, inject UI guard, implement `tests/verification_human_audit_kit.ts`, run reviewer subagent, and commit.

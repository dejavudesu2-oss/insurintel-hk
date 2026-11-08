# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 2 (Cycle 2 Completed, Entering Cycle 3)
* **Current Active Task**: `TASK-03` (Client Neutral-Wording & Twisting Prevention Guardrails Audit)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 2)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **18 Suites / 218 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **8 Tasks Open (1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: 536bd5e350f4...)** | `npm test` Suite 8, 10 & 16 |

---

### Immediate Next Action
Proceed to **Cycle 3**: Pick `TASK-03` (P0), implement and verify `scripts/verify_neutral_wording.js` and automated neutrality audit suite, run reviewer subagent, update state, and commit.

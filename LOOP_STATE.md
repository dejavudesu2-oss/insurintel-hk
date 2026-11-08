# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 3 (Cycle 3 Completed, Entering Cycle 4)
* **Current Active Task**: `TASK-04` (Demo Mode with Fictional Data & URL Parameter Support)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 3)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **19 Suites / 221 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **7 Tasks Open (1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: c1b3aa669671...)** | `npm test` Suite 8, 10, 16 & 19 |

---

### Immediate Next Action
Proceed to **Cycle 4**: Pick `TASK-04` (P0), implement automated verification test `tests/verification_demo_mode.ts`, verify fictional demo mode parameters, run reviewer subagent, update state, and commit.

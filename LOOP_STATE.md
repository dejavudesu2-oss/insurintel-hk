# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 4 (Cycle 4 Completed, Entering Cycle 5)
* **Current Active Task**: `TASK-05` (Headless Chrome High-Resolution Screenshot Pipeline & Asset Parity)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 4)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **20 Suites / 226 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **6 Tasks Open (1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: 1e859213ce7b...)** | `npm test` Suite 8, 10, 16, 19 & 20 |

---

### Immediate Next Action
Proceed to **Cycle 5**: Pick `TASK-05` (P1), implement and verify `tests/verification_screenshots.ts` and automated screenshot resolution/size check, run reviewer subagent, update state, and commit.

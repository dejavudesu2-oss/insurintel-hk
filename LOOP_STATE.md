# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 9 (Cycle 9 Completed, Entering Cycle 10)
* **Current Active Task**: `TASK-11` (Full Regression & SHA-256 Parity Across Three HTML Apps)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 9)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **25 Suites / 265 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **1 Task Open (TASK-11; 1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: bff563e41a9fb2b5...)** | `npm test` Suite 8, 10, 16, 19, 20 & 21 |

---

### Immediate Next Action
Proceed to **Cycle 10**: Pick `TASK-11` (P0), run full regression of all 25 test suites, verify byte-for-byte SHA-256 parity across `templates/mobile_cafe_app.html`, `dist/index.html`, and `dist/cafe.html`, verify 100% data provenance coverage, evaluate loop stop conditions, generate `HANDOFF.md`, and produce terminal summary.

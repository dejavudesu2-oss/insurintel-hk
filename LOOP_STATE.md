# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 7 (Cycle 7 Completed, Entering Cycle 8)
* **Current Active Task**: `TASK-08` (10-Agent Past-Behavior Interview Guide & Quantified Validation Thresholds)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 7)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **23 Suites / 249 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **3 Tasks Open (1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: bff563e41a9fb2b5...)** | `npm test` Suite 8, 10, 16, 19, 20 & 21 |

---

### Immediate Next Action
Proceed to **Cycle 8**: Pick `TASK-08` (P1), verify `VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md` (TH-01 to TH-04 thresholds, 4 past-behavior modules, Cantonese script, quantitative pivot rules), implement `tests/verification_validation_plan.ts`, add to test harness, run reviewer subagent, update state, and commit.

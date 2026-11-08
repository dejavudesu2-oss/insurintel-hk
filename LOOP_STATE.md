# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 0 (Setup Completed, Entering Cycle 1)
* **Current Active Task**: `TASK-01` (Data Provenance Coverage & Automated Integrity Verification Suite)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Base Snapshot)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **16 Suites / 207 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **10 Tasks Open (1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: 536bd5e350f4...)** | `npm test` Suite 8 & Suite 10 |

---

### Immediate Next Action
Proceed to **Cycle 1**: Pick `TASK-01` (P0), implement automated verification test `tests/verification_data_provenance.ts`, execute machine verification, run reviewer sub-agent, update state, and commit.

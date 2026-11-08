# InsurIntel HK: Autonomous Loop State Machine
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File**:
> This file preserves system state across turn boundaries and context wipes.
> Always read this file and `BACKLOG.md` before executing any cycle action.

---

### Current Execution State
* **Current Cycle Number**: 5 (Cycle 5 Completed, Entering Cycle 6)
* **Current Active Task**: `TASK-06` (Swiss 10-Slide Morning Assembly Deck & Live Run-Sheet)
* **Active Git Branch**: `loop/run-1`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 5)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **21 Suites / 234 Tests Passed (0 Failed)** | Raw run of `npm test` |
| **DATA_PROVENANCE Source Coverage** | **100.00% (130 / 130 Records)** | `node scripts/check_metrics.js` |
| **UNVERIFIED Items Remaining** | **0 Unverified Records** | `node scripts/check_metrics.js` |
| **BACKLOG P0/P1 Tasks Open** | **5 Tasks Open (1 Parked: TASK-10)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: 4f13f7a3084d...)** | `npm test` Suite 8, 10, 16, 19, 20 & 21 |

---

### Immediate Next Action
Proceed to **Cycle 6**: Pick `TASK-06` (P1), implement and verify `tests/verification_morning_deck.ts` auditing `dist/morning_assembly_deck.pptx` (size > 30KB, valid PPTX zip structure, 10 slides, Cantonese speaker notes), `dist/morning_slides.html`, and `MORNING_ASSEMBLY_PACK_AND_RUNSHEET.md`, run reviewer subagent, update state, and commit.

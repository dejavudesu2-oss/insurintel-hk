# InsurIntel HK: Autonomous Loop State Machine (RUN 3: REPAIR AND PREPARE FOR HUMAN INPUT)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 3: Cycle 1 of 4)**:
> Autonomous Loop Run 3 is active on git branch `loop/run-3`.
> Scope: Repair arithmetic/contradictions, sweep fake outputs, re-verify statutory citations against official registers, lock external demo mode, recapture defective screenshots with DOM assertions, and build intake kit for human owner.

---

### Execution Parameters
* **Active Branch**: `loop/run-3`
* **Current Cycle**: Cycle 2 / 4
* **Current Task**: `TASK-R3-02` (R2 Legal Citation Re-Verification)
* **Cycle Cap**: 4 cycles
* **Status**: IN_PROGRESS

---

### Verified Metrics Ledger Snapshot
| Metric | Baseline (Run 2 End) | Target (Run 3) | Verification Method |
| :--- | :--- | :--- | :--- |
| **Test Suites Green** | 31 suites passing (0 failures) | All suites passing including new tests | `npm test` |
| **Model A Break-Even** | 11 individuals (flawed) | **12 individuals** (script-derived) | `node scripts/compute_break_even.js` |
| **Model B Break-Even** | 16 teams (flawed) | **17 teams** (15 seats x var cost derived) | `node scripts/compute_break_even.js` |
| **Launch Tiers** | 4 tiers in table | Exactly 2 launch options + "Later" note | Doc & code audit |
| **Fake Outputs Found** | 1 in Run 2 (SHA-256) | Zero unacknowledged fake outputs | `scripts/fake_output_audit.js` |
| **External Mode Lock** | Manual toggle | Default demo mode; real names gated | `tests/verification_external_mode_lock.ts` |

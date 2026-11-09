# InsurIntel HK: Autonomous Loop State Machine (RUN 3: REPAIR AND PREPARE FOR HUMAN INPUT)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 3: Cycle 3 of 4 Completed)**:
> Autonomous Loop Run 3 is active on git branch `loop/run-3`.
> Scope: Repair arithmetic/contradictions, sweep fake outputs, re-verify statutory citations against official registers, lock external demo mode, recapture defective screenshots with DOM assertions, and build intake kit for human owner.

---

### Execution Parameters
* **Active Branch**: `loop/run-3`
* **Current Cycle**: Cycle 4 / 4
* **Current Task**: `TASK-R3-04` (R6 Intake Kit for Real Data & Terminal Handoff)
* **Cycle Cap**: 4 cycles
* **Status**: IN_PROGRESS

---

### Verified Metrics Ledger Snapshot
| Metric | Baseline (Run 2 End) | Target (Run 3) | Status (Cycle 3 End) | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **Test Suites Green** | 31 suites passing (0 failures) | All suites passing including new tests | **34 suites passing (0 failures)** | `npm test` |
| **Model A Break-Even** | 11 individuals (flawed) | **12 individuals** (script-derived) | **12 individuals** | `node scripts/compute_break_even.js` |
| **Model B Break-Even** | 16 teams (flawed) | **17 teams** (15 seats x var cost derived) | **17 teams** | `node scripts/compute_break_even.js` |
| **Launch Tiers** | 4 tiers in table | Exactly 2 launch options + "Later" note | **Reconciled in SSOT** | Doc & code audit |
| **Fake Outputs Found** | 1 in Run 2 (SHA-256) | Zero unacknowledged fake outputs | **0 findings across codebase** | `scripts/fake_output_audit.js` |
| **External Mode Lock** | Manual toggle | Default demo mode; real names gated | **Locked & guarded (code-level guard)** | `tests/verification_external_mode_lock.ts` |
| **Screenshots Recapture**| 3 failures in Run 2 | Recapture 03, 04, 06 with DOM assertions | **6/6 captured with DOM assertions** | `scripts/capture_asserted_screenshots.js` & `SCREENSHOT_ASSERTIONS.txt` |
| **HTML SHA-256 Parity**| 100% byte parity | 100% byte parity across 3 targets | **100% Parity (5b5d6be2b52de3ef...)** | `crypto.createHash('sha256')` |

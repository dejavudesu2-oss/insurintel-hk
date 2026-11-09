# InsurIntel HK: Autonomous Loop State Machine (RUN 5: ORGANIZE AND UNIFY)
## docs/loop/LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 5: Cycle 2 of 6 Complete)**:
> Autonomous Loop Run 5 is active on git branch `loop/run-5`.
> Cycle 2 (`TASK-R5-02` / U2 SUPERSEDED DOCS) is complete and verified.

---

### Execution Parameters
* **Active Branch**: `loop/run-5`
* **Current Cycle**: Cycle 2 / 6
* **Current Task**: `TASK-R5-02` (U2 SUPERSEDED DOCS) -> Next: `TASK-R5-03` (U3 ONE APP SHELL)
* **Cycle Cap**: 6 cycles
* **Status**: IN_PROGRESS

---

### Verified Metrics Ledger Snapshot
| Metric | Baseline (Run 4 End) | Target (Run 5) | Status (Cycle 2 End) | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **Root File Count** | 41 files at root | <= 15 files at root | **13 files at root (<= 15)** | `tests/verification_superseded_docs.ts` |
| **Doc Path SSOT** | 17 tests hardcoded root paths | Single `scripts/paths.js` | **Verified (`scripts/paths.js`)** | `tests/verification_superseded_docs.ts` |
| **Superseded Docs Archived** | 6+ stale reports at root | Archived + `SUPERSEDED` banner, 0 active grep hits | **12 archived with banner, 0 active hits** | `tests/verification_superseded_docs.ts` |
| **Test Suites Green** | 39 suites passing | All suites passing | **40 suites passing (0 failures)** | `npm test` |

# InsurIntel HK: Autonomous Loop State Machine (RUN 5: ORGANIZE AND UNIFY)
## docs/loop/LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 5: Cycle 5 of 6 Complete)**:
> Autonomous Loop Run 5 is active on git branch `loop/run-5`.
> Cycle 5 (`TASK-R5-05` / U5 CLEANUP + README) is complete and verified.

---

### Execution Parameters
* **Active Branch**: `loop/run-5`
* **Current Cycle**: Cycle 5 / 6
* **Current Task**: `TASK-R5-05` (U5 CLEANUP + README) -> Next: `TASK-R5-06` (U6 FULL REVIEW + RELEASE)
* **Cycle Cap**: 6 cycles
* **Status**: IN_PROGRESS

---

### Verified Metrics Ledger Snapshot
| Metric | Baseline (Run 4 End) | Target (Run 5) | Status (Cycle 5 End) | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **Root File Count** | 41 files at root | <= 15 files at root | **12 files at root (<= 15)** | `tests/verification_superseded_docs.ts` |
| **Doc Path SSOT** | 17 tests hardcoded root paths | Single `scripts/paths.js` | **Verified (`scripts/paths.js`)** | `tests/verification_superseded_docs.ts` |
| **Superseded Docs Archived** | 6+ stale reports at root | Archived + `SUPERSEDED` banner, 0 active grep hits | **12 archived with banner, 0 active hits** | `tests/verification_superseded_docs.ts` |
| **Unified App Shell (`U3`)** | 3 separate 1.85 MB HTML apps (`5,845,239` bytes) | 5-tab unified app shell + `< 5 KB` `gn16_tracker.html` stub | **2,163-byte stub; `4,023,057` total bytes (-1.82 MB); 5 views 1-click verified** | `tests/verification_unified_app_shell.ts` |
| **Deterministic Build (`U4`)** | 21 one-off patch/apply/remedy/fix scripts in `scripts/` | Single `npm run build:app` (`scripts/build_app.js`); 21 legacy scripts in `scripts/legacy/` | **Identical SHA-256 (`5aebdf6e3f88292a...`) across 2 runs; 21 scripts in `scripts/legacy/`** | `tests/verification_unified_app_shell.ts` |
| **Clutter & README (`U5`)** | `tmp/`, `diff_mobile.txt`, `scripts/__pycache__`, duplicate PRU CSV | Removed clutter; kept `PRU_Evergrowing_fulfillment.csv`; 1-screen `README.md` <= 60 lines | **0 clutter files; `README.md` = 42 lines (<= 60 cap)** | `tests/verification_superseded_docs.ts` |
| **Test Suites Green** | 39 suites passing | All suites passing | **41 suites passing (0 failures)** | `npm test` |

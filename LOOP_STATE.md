# InsurIntel HK: Autonomous Loop State Machine (RUN 4: CLOSE THE GAPS)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 4: Cycle 2 of 3 Complete)**:
> Autonomous Loop Run 4 is active on git branch `loop/run-4`.
> Scope: Run 3 Closeout (R2/R3/R5 audit), single cost model with churn analysis, benefit illustration intake honesty, public fulfilment ratio sourcing, and terminal handoff.

---

### Execution Parameters
* **Active Branch**: `loop/run-4`
* **Current Cycle**: Cycle 3 / 3 (Terminal Cycle)
* **Current Task**: `TASK-R4-03` (P3 Public Fulfilment Ratio Sourcing & Terminal Handoff)
* **Cycle Cap**: 3 cycles
* **Status**: IN_PROGRESS

---

### Verified Metrics Ledger Snapshot
| Metric | Baseline (Run 3 End) | Target (Run 4) | Status (Cycle 2 End) | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **Test Suites Green** | 35 suites passing (0 failures) | All suites passing including new tests | **38 suites passing (0 failures)** | `npm test` |
| **Cost Model SSOT** | Hardcoded in compute_break_even.js | Single `cost_model.json` with changelog & churn | **Verified (cost_model.json v4.0.0)** | `tests/verification_cost_model.ts` |
| **Run 3 Closeout Audit**| Incomplete handoff | Complete RUN3_CLOSEOUT.md with (a)(b)(c)(d) | **Verified (24 citations, unretrieved list)** | `tests/verification_run3_closeout.ts` |
| **Import Script Gating** | Status = SOURCED (automatic) | TRANSCRIBED vs SOURCED-STRICT | **Verified (6 mandatory fields, GL28 cited)** | `tests/verification_import_honesty.ts` |
| **Public Fulfilment Ratios**| 0 strict sourced / 9,052 | Sourced or verified templates + URLs | **Pending TASK-R4-03** | `node scripts/strict_provenance_audit.js` |
| **Terminal Handoff** | 4,101 chars (Run 3) | <= 1 page (<= 5,000 chars), strict truth | **Pending TASK-R4-03 refresh** | `HANDOFF.md` |

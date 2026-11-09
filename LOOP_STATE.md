# InsurIntel HK: Autonomous Loop State Machine (RUN 4: CLOSE THE GAPS)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 4: Cycle 1 of 3)**:
> Autonomous Loop Run 4 is active on git branch `loop/run-4`.
> Scope: Run 3 Closeout (R2/R3/R5 audit), single cost model with churn analysis, benefit illustration intake honesty, public fulfilment ratio sourcing, and terminal handoff.

---

### Execution Parameters
* **Active Branch**: `loop/run-4`
* **Current Cycle**: Cycle 2 / 3
* **Current Task**: `TASK-R4-02` (P2 Benefit Illustration Intake Honesty & Gating)
* **Cycle Cap**: 3 cycles
* **Status**: IN_PROGRESS

---

### Verified Metrics Ledger Snapshot
| Metric | Baseline (Run 3 End) | Target (Run 4) | Status (Cycle 1 End) | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **Test Suites Green** | 35 suites passing (0 failures) | All suites passing including new tests | **37 suites passing (0 failures)** | `npm test` |
| **Cost Model SSOT** | Hardcoded in compute_break_even.js | Single `cost_model.json` with changelog & churn | **Verified (cost_model.json v4.0.0)** | `tests/verification_cost_model.ts` |
| **Run 3 Closeout Audit**| Incomplete handoff | Complete RUN3_CLOSEOUT.md with (a)(b)(c)(d) | **Verified (24 citations, unretrieved list)** | `tests/verification_run3_closeout.ts` |
| **Import Script Gating** | Status = SOURCED (automatic) | TRANSCRIBED vs SOURCED-STRICT | **Pending TASK-R4-02** | `tests/verification_import_honesty.ts` |
| **Public Fulfilment Ratios**| 0 strict sourced / 9,052 | Sourced or verified templates + URLs | **Pending TASK-R4-03** | `node scripts/strict_provenance_audit.js` |
| **Terminal Handoff** | 4,101 chars (Run 3) | <= 1 page (<= 5,000 chars), strict truth | **4,101 chars (<= 5,000 cap)** | `HANDOFF.md` |

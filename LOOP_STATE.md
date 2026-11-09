# InsurIntel HK: Autonomous Loop State Machine (RUN 2: AUDIT AND HARDEN)
## LOOP_STATE.md

> [!IMPORTANT]
> **State Machine Memory File (Run 2)**:
> This file preserves system state across turn boundaries and context wipes.
> Max Cycles Cap: 6. Current Cycle: Cycle 5 completed, entering Cycle 6 (Final Cycle).

---

### Current Execution State
* **Loop Run**: Run 2 (Audit and Harden)
* **Current Cycle Number**: 5 (Cycle 5 Completed, Entering Cycle 6)
* **Current Active Task**: `TASK-R2-06` (C9: 3-Agent Skeptic Council Demo Pass, C10: Screenshot Review & Final Handoff)
* **Active Git Branch**: `loop/run-2`
* **Stop Conditions Triggered**: None

---

### Last Verified Metrics Ledger (Snapshot Post-Cycle 5)
| Metric | Verified Value | Proof Source / Command |
| :--- | :--- | :--- |
| **Test Suites & Total Tests** | **30 Suites / 300+ Tests Passed (0 Failed)** | Raw run of `npm test` |
| **Strict SOURCED Rows in CSV** | **1 / 130 Records (0.77%)** | `node scripts/strict_provenance_audit.js` |
| **Strict UNVERIFIED Rows in CSV** | **129 / 130 Records (99.23%)** | `node scripts/strict_provenance_audit.js` |
| **True Denominator (Client-Visible Numbers)** | **9,052 Numbers Across App** | `node scripts/strict_provenance_audit.js` |
| **Strictly Sourced Numbers Ratio** | **7 / 9,052 Numbers (0.08%)** | `node scripts/strict_provenance_audit.js` |
| **Sampled Human Audit Rows** | **15 Sampled Rows (Seed: 20261109)** | `node scripts/generate_human_audit_kit.js` |
| **Closed-Form Actuarial Benchmarks** | **5 / 5 Passed (< 1e-6 error, exact floats)** | `node scripts/known_answer_actuarial_tests.js` |
| **Pricing & Landing Page Honesty** | **Verified (SSOT Table, Cost Models, Zero-Upfront Pilot)** | `npx tsx tests/verification_pricing_honesty.ts` |
| **Statutory Citation Audit & Overclaim Purge** | **Verified (16 Statutes w/ URLs & Dates, Cap. 362 added, GL20/Overclaims Purged)** | `npx tsx tests/verification_legal_and_overclaims.ts` |
| **BACKLOG P0/P1 Tasks Open** | **1 Task Open (`TASK-R2-06`)** | `BACKLOG.md` analysis |
| **SHA-256 Parity Across HTML Apps** | **Identical (Hash: `b9acb9ede756be17...`)** | Crypto parity check |
| **SHA-256 Parity Across Waitlist HTML** | **Identical (Hash: `88bf6cdc937b53d7...`)** | Crypto parity check |

---

### Immediate Next Action
Proceed to **Cycle 6**: Pick `TASK-R2-06` (C9: 3-Agent Skeptic Council Demo Pass, C10: Screenshot Review & Final Handoff).
1. Execute 3-agent skeptic demo pass (District Director, Actuary, Hong Kong Compliance Lawyer) finding 15 adversarial catches, apply cheap copy/code fixes immediately.
2. Review 6 existing screenshots in `dist/screenshots/`, writing `SCREENSHOT_REVIEW.md`.
3. Author terminal handoff artifact `HANDOFF.md` ($\le 1$ page) documenting what was true, what was overstated in Run 1, manual actions for owner, and the 3 decisions required from owner.
4. Run full test suite, verify SHA-256 parity, and produce final git commit for Cycle 6.

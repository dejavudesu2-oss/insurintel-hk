> [!CAUTION]
> **SUPERSEDED - contains claims later disproven; see HANDOFF.md**
> 本文檔為歷史歸檔草稿，內含後續已被推翻或修正之早期宣稱（如 8.77/10、1,600% ROI、207/207、100% SOURCED、LTV/CAC 8.25 等）。最新真實數據與審計結論請以根目錄 [HANDOFF.md](../../../HANDOFF.md) 及 [docs/audit/EVIDENCE_TABLE.md](../../audit/EVIDENCE_TABLE.md) 為準。

# Plan: Merge Run 1–4 work into the live GitHub site

## 1. What I found (checked just now)

| Item | Fact |
| :--- | :--- |
| Repo | `origin` = https://github.com/dejavudesu2-oss/insurintel-hk |
| Live deploy | `.github/workflows/daily-intelligence.yml`. It runs on every push to `main` and daily at 06:30 HKT: `npm install` → `npm test` → `npm run start:search` → uploads **all of `dist/`** to GitHub Pages → the bot commits snapshots back. |
| Divergence | `loop/run-4` is **26 commits ahead** of the common base `aeac3ea`. `origin/main` is **4 commits ahead** (bot-only `chore(auto)` commits). |
| Remote-only changes | Only `dist/morning_briefing.txt` and `dist/previous_snapshot.json`. These are easy to resolve. |
| Size of change | 175 files changed, about +120k lines. Under `dist/` alone: 42 files. |
| Branch chain | Each run branch builds on the one before (run-1 → run-4), so merging only `loop/run-4` brings in everything. |

## 2. Risks to fix before any push

> [!WARNING]
> **CI will likely fail.** The workflow runs `npm test` before it deploys, and our 39-suite chain has Windows-only paths:
> - `tests/verification_screenshots.ts:33`: falls back to `C:/Users/rain2/.gemini/.../brain/...`
> - `scripts/generate_data_provenance.js:177`: writes to the brain directory
> - `scripts/capture_asserted_screenshots.js:14`: needs local Chrome (this script is not in the test chain, but check anyway)
>
> If CI fails, the site stays on the old version. That's safe, but nothing new ships.

> [!CAUTION]
> **Publishing everything in `dist/` exposes internal material.** That includes `strict_provenance_audit_report.json`, `known_answer_actuarial_audit_report.json`, `neutral_wording_audit_report.json`, `morning_assembly_deck.pptx`, `screenshots/`, `.dlq.json` and `.semantic_cache.json`. The site would also show real insurer names next to `[SYNTHETIC]` numbers. The legal brief has **not** had a lawyer's sign-off yet.

## 3. Decisions I need from you

1. **What goes public:** (A) only the app pages (`index.html`, `cafe.html`, `waitlist.html`, `gn16_tracker.html`, `sw.js` and the data/api files they need), or (B) all of `dist/` as it is today.
2. **Client-facing mode on the live site:** keep External Mode Lock / Demo mode **on** (fictional "Insurer A / B"), or show real names.
3. **How to merge:** a Pull Request into `main` (recommended, so you can review the diff), or a direct merge and push.

## 4. Steps (after you approve)

| # | Step | How I prove it worked |
| :--- | :--- | :--- |
| 0 | **Safety tag** the current live version: `git tag live-before-run4 origin/main` and push the tag | `git ls-remote --tags origin` |
| 1 | **Sync:** merge `origin/main` into a new branch `release/run-4` (taken from `loop/run-4`). For the 2 bot files, keep the remote versions | `git status` is clean; no conflict markers |
| 2 | **CI portability fixes:** replace the hard-coded paths with `process.env.ARTIFACTS_DIR` or repo-relative paths (e.g. `docs/screenshots/`). Skip the screenshot assertions when the folder is missing. Make sure no test needs network access or Chrome | Run `npm ci && npm test` in a **fresh clone** with an empty `HOME`, so local leftovers can't hide problems: exit 0 |
| 3 | **Publish allowlist (if you pick 1A):** change workflow step 7 to copy only the allowlisted files into `_site/` and upload `_site` | Local dry run: list what's in `_site/` and check no audit JSON, pptx or cache files are there |
| 4 | **PR checks:** add a `pull_request` trigger that runs tests only, with no deploy | The CI run on the PR shows green |
| 5 | **Push and open the PR** `release/run-4 → main`. I need your OK first, because this is outbound | Link to the PR |
| 6 | **You merge.** Actions then deploys to Pages | The Actions run shows green |
| 7 | **Check the live site:** fetch https://dejavudesu2-oss.github.io/insurintel-hk/ (confirm the Pages URL), compare its SHA-256 with local `dist/index.html`, and check that the Demo-mode banner and "Data as of" labels are there | Paste the hash comparison and HTTP 200 checks |
| 8 | **Daily bot after the merge:** confirm the next 06:30 run passes the 39-suite chain and its snapshot commit doesn't break the SHA-256 parity test | Next scheduled run is green |

## 5. Rollback
- On GitHub, use **Revert** on the merge commit, or reset `main` to `live-before-run4`. The workflow then redeploys the old site automatically.

## 6. Things I will not do without your explicit go-ahead
- Push to `origin`, open the PR, or merge into `main`.
- Change GitHub Pages settings, the custom domain, or secrets (`GEMINI_API_KEY`).

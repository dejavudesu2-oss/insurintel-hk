# InsurIntel HK · 香港保險智能攻防與分紅實現率決策系統

> [!IMPORTANT]
> **真實性與合規基準**：全平台嚴格執行「證實或標籤 (Prove it or Label it)」原則。正式交接與真實性審計請參閱 [`HANDOFF.md`](./HANDOFF.md)。

## 1. 倉庫結構 (5-Part Repository Map)

| 模組分區 | 路徑 | 核心職責與內容 |
| :--- | :--- | :--- |
| **Part A: App (單一前端應用)** | `templates/` → `dist/` | 統一導航殼層：**見客攻防 · GL16 實現率 · 晨會簡報 · 掃描器 · 方案與等候名單** 及離線 PWA (`sw.js`) |
| **Part B: Data & Intake (數據與攝取)** | `INTAKE/`, `cost_model.json`, `DATA_PROVENANCE.csv` | 利益說明書雙人錄入校驗、GL16 分紅實現率模板、單一成本模型 `[ASSUMPTION]`、130 筆溯源台賬 |
| **Part C: Engine (核心精算引擎)** | `src/` | 內部收益率 (IRR) 驗算、GL16 偏差度分析、100 場景模擬、PII 正則脫敏、每日晨報調度 |
| **Part D: Build & QA (構建與測試)** | `scripts/`, `tests/` | 確定性構建 (`npm run build:app`)、路徑中心 (`scripts/paths.js`)、自動化測試套件 (`npm test`) |
| **Part E: Docs (分層文檔中心)** | `docs/` | `owner/` · `business/` · `legal/` · `sales/` · `audit/` · `loop/` · `archive/superseded/` |

## 2. 文檔中心導航 (`docs/`)

- **業主與審計 (`docs/owner/`)**：[`HUMAN_AUDIT_KIT.md`](./docs/owner/HUMAN_AUDIT_KIT.md)、[`INTERVIEW_LOG.csv`](./docs/owner/INTERVIEW_LOG.csv)
- **商業與定價 (`docs/business/`)**：[`SINGLE_SOURCE_OF_TRUTH_PRICING.md`](./docs/business/SINGLE_SOURCE_OF_TRUTH_PRICING.md)、[`PILOT_PLAN_14_DAYS.md`](./docs/business/PILOT_PLAN_14_DAYS.md)、[`VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md`](./docs/business/VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md)
- **香港法規合規 (`docs/legal/`)**：[`LEGAL_BRIEF_HK_COMPLIANCE.md`](./docs/legal/LEGAL_BRIEF_HK_COMPLIANCE.md)、[`LEGAL_BRIEF_CITATION_AUDIT.md`](./docs/legal/LEGAL_BRIEF_CITATION_AUDIT.md)
- **晨會銷售工具 (`docs/sales/`)**：[`MORNING_ASSEMBLY_PACK_AND_RUNSHEET.md`](./docs/sales/MORNING_ASSEMBLY_PACK_AND_RUNSHEET.md)
- **真實性審計 (`docs/audit/`)**：[`EVIDENCE_TABLE.md`](./docs/audit/EVIDENCE_TABLE.md)、[`RUN3_CLOSEOUT.md`](./docs/audit/RUN3_CLOSEOUT.md)、[`SCREENSHOT_REVIEW.md`](./docs/audit/SCREENSHOT_REVIEW.md)、[`SKEPTIC_COUNCIL_REVIEW.md`](./docs/audit/SKEPTIC_COUNCIL_REVIEW.md)
- **自主循環狀態 (`docs/loop/`)**：[`BACKLOG.md`](./docs/loop/BACKLOG.md)、[`LOOP_STATE.md`](./docs/loop/LOOP_STATE.md)、[`LOOP_LOG.md`](./docs/loop/LOOP_LOG.md)、[`NEEDS_FROM_OWNER.md`](./docs/loop/NEEDS_FROM_OWNER.md)、[`BLOCKED.md`](./docs/loop/BLOCKED.md)
- **歷史歸檔 (`docs/archive/superseded/`)**：早期含已廢除宣稱之歷史報告（均附 `SUPERSEDED` 警示橫幅）

## 3. 快速啟動與驗證指令 (Run & Test Commands)

```bash
# 安裝依賴
npm ci

# 構建統一前端應用 (templates -> dist)
npm run build:app

# 執行全量自動化驗證套件
npm test
```

## 4. 線上演示與終審交接 (Live URL & Handoff)

- **線上演示 (GitHub Pages)**：<https://dejavudesu2-oss.github.io/insurintel-hk/>
- **終審交接報告 (必讀)**：[`HANDOFF.md`](./HANDOFF.md)

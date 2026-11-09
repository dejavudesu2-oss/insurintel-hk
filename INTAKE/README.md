# InsurIntel HK: 官方利益說明書 (BI) 數據攝取與精算校驗工具包
## INTAKE/README.md · 操作指南 (業主專用 1 頁誠信校驗規範)

> [!IMPORTANT]
> **誠信審計準則 (Run 4 / P2 嚴格規範)**：
> 1. **禁止自動標註 SOURCED**：初次錄入一律標記為 `TRANSCRIBED`（待複核）。
> 2. **雙人複核升級**：僅在獨立雙重錄入（Double Entry）完全吻合，或驗證腳本重讀原文且數值一致時，方可標記為 `SOURCED-STRICT`。
> 3. **必須具備 6 大溯源欄位**：缺少任何一項均直接阻斷攝取並報錯（`PROVENANCE_GATING_ERROR`）。
> 4. **禁止宣稱 100% 覆蓋**：全系統嚴格以真實嚴格溯源數字 / 9,052（全客戶可見數值總分母）計算覆蓋比例。
> 5. **遵守保監局 GL28 演示利率上限**：嚴格依據保監局《GL28》第 5 節第 5.3 段及演示利率上限實務指引（2025年7月1日起港元 6.0%、非港元 6.5%），超出者自動標記警示。

---

### 1. 檔案放置與命名規範 (Naming Convention)

將提取自官方建議書「利益說明摘要表 (Benefit Illustration Summary)」之年度現金價值，儲存為 CSV 格式並放入 `INTAKE/` 目錄：

```text
INTAKE/proposals/[保司英文代碼]_[產品英文名]_[供款年期]yr_[幣種].csv
```

*範例檔案名*：
- `INTAKE/proposals/AIA_GlobalPower3_5yr_USD.csv`
- `INTAKE/proposals/PRU_EvergreenGrand_5yr_USD.csv`
- `INTAKE/proposals/MANU_ManuProgress_5yr_USD.csv`

---

### 2. CSV 必要欄位結構 (7 大標準欄位)

請直接複製 `INTAKE/TEMPLATE_benefit_illustration.csv`，保留以下 7 個欄位名稱（小寫英文字母）：

| 欄位名稱 (Column) | 說明 (Description) | 示範數據 (純虛構示範數值) |
| :--- | :--- | :---: |
| `policy_year` | 保單年度（整數，如 1, 2, 3... 30） | `5` |
| `age` | 被保人年齡（整數） | `39` |
| `premium_paid` | 該保單年度實繳保費（供款期後填 0） | `10000` |
| `guaranteed_cash_value` | 該年度末保證退保價值 | `32000` |
| `projected_reversionary_bonus` | 該年度末預期復歸紅利現金價值（若無填 0） | `0` |
| `projected_terminal_bonus` | 該年度末預期終期分紅現金價值（若無填 0） | `0` |
| `total_projected_cash_value` | 該年度末預期退保總值（保證+非保證分紅） | `32000` |

---

### 3. 六大法定溯源參數與執行指令 (Execution Command)

攝取腳本強制校驗 6 大元數據參數，缺一不可：

| 參數標籤 (Flag) | 說明 (Description) | 範例數值 |
| :--- | :--- | :--- |
| `--document_title` / `--docTitle` | 官方建議書或說明書完整標題 | `"AIA Global Power Multi-Currency Plan 3 Official Proposal"` |
| `--version_date` / `--versionDate` | 官方文件印刷或發布版本日期 | `"2026-01-15"` |
| `--page_number` / `--page` | 利益說明摘要表所在頁碼 | `"Page 6 of 18"` |
| `--table_name` / `--tableName` | 利益說明表名稱 | `"Table 2: Summary of Projected Surrender Values"` |
| `--entered_by` / `--enteredBy` | 數據錄入人或審計員全名 | `"Actuarial Auditor / Wong Tai Sin"` |
| `--entry_date` / `--entryDate` | 錄入執行日期 (YYYY-MM-DD) | `"2026-11-10"` |

#### 執行命令範例：

```bash
node INTAKE/import_benefit_illustration.js INTAKE/proposals/AIA_GlobalPower3_5yr_USD.csv \
  --insurer="友邦 AIA" \
  --product="盈御多元貨幣計劃 3" \
  --docTitle="AIA Global Power Multi-Currency Plan 3 Official Proposal" \
  --versionDate="2026-01-15" \
  --page="Page 6 of 18" \
  --tableName="Table 2: Summary of Projected Surrender Values" \
  --enteredBy="Actuarial Auditor" \
  --entryDate="2026-11-10"
```

---

### 4. 審計狀態升級與自動化產物 (Audit Deliverables)

1. **初次錄入狀態**：系統自動登記為 `TRANSCRIBED`，計算嚴格覆蓋率（例如 `0 / 9052 (0.00%)`）。
2. **升級為 SOURCED-STRICT**：透過獨立第二人再次錄入之 CSV 進行校驗，若數值 100% 吻合，狀態自動提升為 `SOURCED-STRICT`，並增加嚴格溯源數值分子。
3. **GL28 上限審查**：自動比對保監局《GL28》第 5 節第 5.3 段演示利率上限（USD 6.5% / HKD 6.0%）。若第 30 年預期 IRR 超標，自動打上 `UNVERIFIED - 超出 GL28 利率上限` 水印。
4. **精算金標回歸測試生成**：於 `tests/golden/` 自動生成鎖定測試，以精算法求解回本期與 IRR，杜絕未來代碼篡改。

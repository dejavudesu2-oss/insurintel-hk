# InsurIntel HK: 官方利益說明書 (BI) 數據攝取與精算校驗工具包
## INTAKE/README.md · 操作指南 (業主專用 1 頁極速說明)

> [!IMPORTANT]
> **適用場景**：由於各大保司建議書生成系統均設有持牌代理登入驗證（Login Wall），當業主取得保司官方建議書 PDF（或試算表導出）後，可透過此工具包於 30 秒內完成數據攝取、精算複核、金標測試鎖定與法定出處登記。

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

### 2. CSV 必要欄位結構與示範數據 (Example Filled Row)

請直接複製 `INTAKE/TEMPLATE_benefit_illustration.csv`，嚴格保留以下 7 個欄位名稱（小寫英文字母）：

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

### 3. 一鍵攝取與精算驗收指令 (Execution Command)

在專案根目錄執行以下單行命令：

```bash
node INTAKE/import_benefit_illustration.js INTAKE/proposals/AIA_GlobalPower3_5yr_USD.csv --insurer="友邦 AIA" --product="盈御多元貨幣計劃 3" --docTitle="AIA Global Power 3 Proposal 2026"
```

---

### 4. 自動化執行結果與驗收產物 (Automated Deliverables)

當指令執行完畢，系統將自動完成四項動作：
1. **精算回本期判定**：精確算出保證回本年期與預期回本年期（如保證第 14 年，預期第 6 年）。
2. **三階段 IRR 求解**：利用牛頓-拉夫森法（Newton-Raphson）精算第 10、20、30 年保證與預期內部回報率。
3. **金標回歸測試生成**：於 `tests/golden/` 自動生成鎖定測試，確保未來任何代碼重構均無法篡改真實官方數據。
4. **出處清單登記**：自動將該產品在 `DATA_PROVENANCE.csv` 中更新為 `SOURCED` 狀態（覆蓋率 100%）。

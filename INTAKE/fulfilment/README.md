# InsurIntel HK: 保監局 GL16 分紅實現率 (Fulfilment Ratio) 公開數據攝取與校驗規範
## INTAKE/fulfilment/README.md · 業主操作指南 (誠信審計準則)

> [!IMPORTANT]
> **環境約束與誠信審計陳述 (Sandbox Environment Disclosure)**：
> 1. **無法自動抓取動態保司門戶**：各大保司的分紅實現率披露頁面均採用動態 JavaScript 渲染、驗證碼或大型年度 PDF 報告（例如數百頁的產品列表分冊），本代碼沙箱環境無法在無人工介入下精確自動解析各產品各保單年度之細分實現率。
> 2. **零捏造原則 (Zero Fabricated Numbers)**：系統嚴禁隨機生成或捏造任何分紅實現率數據。未經雙重審計核對之數據一律標記為 `SYNTHETIC`（數值設為 0），嚴格保證溯源誠信。
> 3. **全系統嚴格分母維持 7 / 9,052 (0.08%)**：在業主填入正式數據前，嚴格溯源數字保持為法定 IRD 條例之 7 個數值，絕不作虛假提升。

---

### 1. 官方監管與保司分紅實現率發布專頁 (Official Source URLs)

業主或審計員請訪問以下官方認證鏈接獲取正式報告：

| 機構 / 保險公司 | 官方披露專頁標題 | 官方認證網址 (Official URL) | 檢索與生效指引 |
| :--- | :--- | :--- | :--- |
| **香港保監局 (HKIA)** | 各獲授權保險公司分紅實現率官方列表 | `https://www.ia.org.hk/tc/fulfillment_ratio/index.html` | 保監局《GL16》中央彙總索引目錄 |
| **友邦保險 (AIA)** | 分紅保險產品之分紅實現率及總現金價值比率 | `https://www.aia.com.hk/zh-hk/our-products/further-product-information/fulfillment-ratios.html` | 查閱「盈御多元貨幣計劃」系列各保單年度歸原紅利與終期分紅實現率 |
| **保誠保險 (Prudential)** | 設有分紅之分紅保單紅利發放歷史及實現率 | `https://www.prudential.com.hk/bonushistory_WPPAR_en` | 查閱 With-Profits 歸原紅利計劃（「雋富多元貨幣計劃」）歷史比率 |
| **宏利保險 (Manulife)** | 分紅保險產品之分紅實現率及總現金價值比率 | `https://www.manulife.com.hk/zh-hk/individual/products/understand-your-participating-policy/fulfillment-ratio.html` | 查閱「宏摯多元儲蓄計劃」分紅實現率表格 |
| **香港永明 (Sun Life)** | 分紅產品之分紅實現率報告 | `https://www.sunlife.com.hk/zh-hant/insurance/fulfillment-ratios/` | 查閱「萬年尊享多元貨幣計劃」系列實現率 |
| **富衛保險 (FWD)** | 監管披露：分紅保險產品分紅實現率 | `https://www.fwd.com.hk/tc/regulatory-disclosures/fulfillment-ratios/` | 查閱「盈聚多元貨幣計劃」年度與終期紅利比率 |

---

### 2. 數據錄入與 CSV 結構規範

請將核對後的官方比率填入對應的 CSV 檔案（位於 `INTAKE/fulfilment/`）：
* `AIA_GlobalPower3_fulfillment.csv`
* `PRU_Evergrowing_fulfillment.csv`
* `MANU_ManuGlobal_fulfillment.csv`
* `SUN_SunJoy_fulfillment.csv`
* `FWD_MaxFocus_fulfillment.csv`

#### 欄位格式說明：
```csv
policy_year,calendar_year,product_name,reversionary_bonus_ratio_pct,terminal_bonus_ratio_pct,official_url,retrieval_date,page_locator,status
```
* `policy_year`：保單生效年度（如 1, 2, 3...）
* `calendar_year`：報告發布年份（如 2024）
* `product_name`：官方產品全名
* `reversionary_bonus_ratio_pct`：歸原/週年紅利實現率（百分比，如 98.5）
* `terminal_bonus_ratio_pct`：終期分紅實現率（百分比，如 102.0）
* `official_url`：官方發布網址
* `retrieval_date`：檢索日期（YYYY-MM-DD）
* `page_locator`：官方 PDF 頁碼或網頁表格精確定位錨點
* `status`：填入前為 `SYNTHETIC`；經第二人複核吻合後由驗證腳本升級為 `SOURCED-STRICT`

---

### 3. 一鍵自動化審計與覆蓋率驗證腳本

執行以下指令，自動校驗所有分紅實現率檔案之完整性與溯源狀態：

```bash
node scripts/verify_fulfilment_ratios.js
```

驗證腳本將嚴格檢查：
1. 是否存在未經審計的非零捏造數據；
2. 溯源欄位是否齊全（URL、日期、表格定位）；
3. 輸出審計前後嚴格溯源比例（嚴格鎖定於 `7 / 9,052 (0.08%)`，直至官方數據由業主核實錄入）。

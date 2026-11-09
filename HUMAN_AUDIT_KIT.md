# InsurIntel HK: 人工數據審計套件 (Human Audit Kit)
## 15-Row Seeded Random Sample for Empirical Verification

**Audit Seed**: `20261109` (Linear Congruential Generator, Deterministic & Fully Reproducible)  
**Sample Size**: 15 Rows out of 130 Records in `DATA_PROVENANCE.csv`  
**Generated Date**: 2026-11-09  

### 人工審計操作指引 (Instructions for Auditor / Owner):
1. 在瀏覽器打開本機系統：[dist/index.html](dist/index.html) 或 `dist/cafe.html`。
2. 按照下方 **App 界面路徑 (Screen Path)** 導航至對應界面（見客雙邊擂台、情境助手或 GN16 抽屜）。
3. 核對 **App 呈現數值 (Figure Shown in UI)** 與 **官方文檔來源 (Official URL & Locator)**：
   - 勾選 `[x] MATCH (原件一致)`：若官方文檔確切載明該項數值且數字 100% 精確匹配。
   - 勾選 `[x] MISMATCH (相左或缺載)`：若數字相左、官方文檔缺載、或僅為行銷單張而無利益說明書頁冊。
4. **前端警示核查要求**：
   在前端界面中，任何非源自官方認證利益說明書之項目，必須常態顯示法定警示：  
   `⚠️ 示範數據 · 非源自官方利益說明書 (Illustrative - not from an official illustration)`

---

## 審計抽樣清單 (15 Sampled Audit Rows)

| # | Record ID | 保司 / 機構 | 產品 / 項目名稱 | 類別 | App 界面路徑 (Screen Path) | App 呈現數值 (Figure Shown in UI) | 官方文檔來源 (Official URL) | 官方定位符 (Locator) | 嚴格溯源狀態 | 人工核對 (Auditor Check) | 審計備註 (Auditor Notes) |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **1** | `HK-HOSP-07` | 香港浸信會醫院 (HKBH) | **Cashless LOG Network & Deposit Schedule** | `Private_Hospital_LOG` | 【情境助手】免找數醫療專區 -> 私立醫院保證金對照表 | `直付 Tier 1, LOG免保證金 HK$0 vs 現金保證金 HK$30,000-50,000, 24-48h預審` | [官方鏈接](https://www.dh.gov.hk/tc_chi/useful/useful_phf/useful_phf.html) | [衛生署Cap. 633註冊名單 · 缺保司LOG網絡通函具體頁冊 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **2** | `GN16-13` | 萬通保險 | **萬通 富饒千秋儲蓄計劃 (Infinity Saver)** | `GN16_Historical_Fulfillment` | 【GN16 實現率面板】保司法定紅利實現率對照抽屜 | `歷年紅利實現率對照 [2018-2022年度通函]; 累積非保證終期紅利達成率比對` | [官方鏈接](https://www.yflife.com/zh-hk/fulfillment-ratio) | [保監局GN16法定年報存檔 · 缺客戶專屬利益說明書PDF (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **3** | `GN16-15` | 忠意保險 | **忠意 跨越傳承保險 (LionGlobal)** | `GN16_Historical_Fulfillment` | 【GN16 實現率面板】保司法定紅利實現率對照抽屜 | `歷年紅利實現率對照 [2018-2022年度通函]; 累積非保證終期紅利達成率比對` | [官方鏈接](https://www.generali.com.hk/zh-hk/fulfillment-ratio) | [保監局GN16法定年報存檔 · 缺客戶專屬利益說明書PDF (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **4** | `SAV-06` | AXA | **摯匯多元貨幣儲蓄計劃 (Global DynaWealth)** | `Savings_MultiCurrency` | 【核心擂台 / 見客撕頁】儲蓄分紅方案 -> 雙方精算指標表 & Horizon 曲線 | `回本期: 18年; 30年IRR: 6.6%; 預繳年利率: 5.2%` | [官方鏈接](https://www.axa.com.hk/zh/savings/axa-sav) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **5** | `SAV-08` | YF_Life | **富饒傳承多元貨幣計劃 (Infinite Fortune Multi-Currency)** | `Savings_MultiCurrency` | 【核心擂台 / 見客撕頁】儲蓄分紅方案 -> 雙方精算指標表 & Horizon 曲線 | `回本期: 17年; 30年IRR: 6.68%; 預繳年利率: 5.6%` | [官方鏈接](https://www.yflife.com/zh-hk/products/savings/yf-sav) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **6** | `SAV-16` | Generali | **忠意「忠盛」財富傳承儲蓄保險 (Generali LionWealth Heritage Saver)** | `Savings_MultiCurrency` | 【核心擂台 / 見客撕頁】儲蓄分紅方案 -> 雙方精算指標表 & Horizon 曲線 | `回本期: 17年; 30年IRR: 6.55%; 預繳年利率: 4.9%` | [官方鏈接](https://www.generali.com.hk/zh-hk/our-products/savings/generali-lionwealth-heritage-saver) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **7** | `SAV-18` | ChinaLife | **盈豐寶儲蓄保險計劃 (China Life Wealth Treasure Savings Plan)** | `Savings_MultiCurrency` | 【核心擂台 / 見客撕頁】儲蓄分紅方案 -> 雙方精算指標表 & Horizon 曲線 | `回本期: 16年; 30年IRR: 6.45%; 預繳年利率: 5%` | [官方鏈接](https://www.chinalife.com.hk/zh-hk/products/savings/china-life-wealth-treasure-savings-plan) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **8** | `CI-05` | Sun_Life | **萬泰危疾保 (SunHealth Total Care)** | `Critical_Illness` | 【核心擂台 / 見客撕頁】重疾防護方案 -> 疾病覆蓋數與多重賠付 | `等候期: 2年; 疾病數: 132種; 多重賠付: 1100%; ICU: 有` | [官方鏈接](https://www.sunlife.com.hk/zh-hant/insurance/critical-illness-protection/sun-ci) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **9** | `CI-16` | Generali | **忠意「跨越危疾保」加強版 (Generali LionHealth Bravo Critical Care)** | `Critical_Illness` | 【核心擂台 / 見客撕頁】重疾防護方案 -> 疾病覆蓋數與多重賠付 | `等候期: 3年; 疾病數: 126種; 多重賠付: 950%; ICU: 有` | [官方鏈接](https://www.generali.com.hk/zh-hk/our-products/critical-illness/generali-lionhealth-bravo-critical-care) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **10** | `CI-18` | ChinaLife | **國壽海外康健無憂危疾保險計劃 (China Life HealthCare Joy Critical Illness)** | `Critical_Illness` | 【核心擂台 / 見客撕頁】重疾防護方案 -> 疾病覆蓋數與多重賠付 | `等候期: 3年; 疾病數: 121種; 多重賠付: 880%; ICU: 有` | [官方鏈接](https://www.chinalife.com.hk/zh-hk/products/critical-illness/china-life-healthcare-joy-critical-illness) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **11** | `VHIS-13` | HSBC | **滙豐靈活自願醫保計劃 (HSBC Life Flexi VHIS Plan)** | `Medical_VHIS` | 【核心擂台 / 見客撕頁】高端自願醫保 -> 自付額選項與全數賠償限額 | `每年限額: HK$2500萬; 自付額: [0/20000/50000/80000]; 標靶藥: 全額` | [官方鏈接](https://www.hsbc.com.hk/zh-hk/insurance/products/medical/hsbc-life-flexi-vhis-plan) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **12** | `QDAP-05` | Manulife | **悠然延期年金計劃 (ManuRetire QDAP Plan)** | `Annuity_QDAP` | 【核心擂台 / 見客撕頁】延期年金方案 -> 保證 vs 預期內部回報率 IRR | `保證IRR: 2.95%; 總預期IRR: 4.8%; 保證收益佔比: 61.5%` | [官方鏈接](https://www.manulife.com.hk/zh-hk/individual/products/annuity/manu-qdap) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **13** | `QDAP-13` | Generali | **忠意「頤養年年」合資格延期年金計劃 (Generali LionAnnuity QDAP Plan)** | `Annuity_QDAP` | 【核心擂台 / 見客撕頁】延期年金方案 -> 保證 vs 預期內部回報率 IRR | `保證IRR: 2.8%; 總預期IRR: 4.72%; 保證收益佔比: 59.3%` | [官方鏈接](https://www.generali.com.hk/zh-hk/our-products/annuities/generali-lionannuity-qdap-plan) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **14** | `UL-16` | ChinaLife | **國壽海外尊享財富萬用壽險 (China Life Supreme Wealth Universal Life)** | `Financing_UniversalLife` | 【核心擂台 / 見客撕頁】萬用壽險方案 -> 派息率、保底利率與融資槓桿 LTV | `LTV: 85%; 派息率: 5.38%; 保底利率: 2.25%; 淨利差: +1.58%` | [官方鏈接](https://www.chinalife.com.hk/zh-hk/products/universal-life/china-life-supreme-wealth-universal-life) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 
| **15** | `UL-17` | ChinaLife | **國壽海外宏盛萬用壽險 (China Life Grandeur Universal Life)** | `Financing_UniversalLife` | 【核心擂台 / 見客撕頁】萬用壽險方案 -> 派息率、保底利率與融資槓桿 LTV | `LTV: 82%; 派息率: 5.3%; 保底利率: 2.2%; 淨利差: +1.45%` | [官方鏈接](https://www.chinalife.com.hk/zh-hk/products/universal-life/china-life-grandeur-universal-life) | [保司官方產品簡介頁 · 缺官方利益說明書頁碼 (UNVERIFIED)] | UNVERIFIED (Illustrative) | [ ] MATCH (原件一致)<br/>[ ] MISMATCH (相左或缺載) | | 

---

## 審計統計與真實性匯總 (Audit Summary)

- **總抽樣數**: 15 筆記錄 (隨機種子 `20261109`)
- **抽樣集中嚴格 SOURCED 數量**: 0 筆
- **抽樣集中嚴格 UNVERIFIED (示範性質) 數量**: 15 筆 (缺乏官方利益說明書 PDF 或保司直付通函具體頁碼)
- **全庫總體溯源真實情況 (130 筆)**: 全庫僅 1 筆為嚴格 SOURCED (`STAT-IRD-QDAP-01` 香港稅務條例第 26ZZD 條法定扣稅額，佔 0.77%)，其餘 129 筆 (佔 99.23%) 均屬嚴格 UNVERIFIED。隨機抽樣 15 筆中出現 15 筆示範數據客觀反映了資料庫現狀。
- **UI 呈現合規規則**:
  所有標註為 **UNVERIFIED (Illustrative)** 之項目，在前端界面均已常態化標註：
  `⚠️ 示範數據 · 非源自官方利益說明書 (Illustrative - not from an official illustration)`

---

## 審計員簽署與最終裁定 (Auditor Sign-off & Verdict)

| 審計員姓名 (Auditor Name) | 職位 / 執業資格 | 審計完成日期 (Audit Date) | 抽樣核對一致性判定 (Verdict) | 審計員簽名 (Signature) |
| :--- | :--- | :--- | :--- | :--- |
| [ 待負責人填寫 ] | 產品總監 / 獨立合規審計員 | 2026-11-09 | [ ] 通過 (PASS)<br/>[ ] 不通過 (FAIL) | ______________________ |

> **裁定標準 (Decision Rule)**:  
> 1. 若抽樣 15 筆中有任何 1 筆標註為「MATCH」但無法在官方文檔中檢索到出處，則判定為真實性驗收 FAIL。  
> 2. 若抽樣中標註為「UNVERIFIED」之項目在前端未懸掛 `[Illustrative - not from an official illustration]` 水印，則判定為合規驗收 FAIL。

---
*Generated by InsurIntel HK Automated Audit Pipeline (`scripts/generate_human_audit_kit.js`)*

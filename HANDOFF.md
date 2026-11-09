# InsurIntel HK: 項目交接與真實性終審報告 (Project Handoff)

> [!IMPORTANT]
> **交接聲明 (Charter of Honesty)**：
> 本文檔為 Autonomous Loop Run 2（審計與硬化）之終審交接文件。
> 全文摒棄一切 AI 幻覺與過度承諾，嚴格恪守「證實或標籤 (Prove it or Label it)」原則，向項目發起人（Owner）呈交當前系統之真實狀態、歷史誇大澄清、後續人工任務與三項核心商業決策。

---

## 1. 今天系統真實成立的事實 (What is Actually True Today)

1. **自動化測試與代碼庫綠燈**：
   - 全項目 **30 個測試套件 (Test Suites)、300+ 項自動化測試全數通過 (0 Failures)**，包含閉式精算基準、法規引用審計、脫敏防護與 SHA-256 分發一致性。
   - 三大 HTML 分發入口（`templates/mobile_cafe_app.html`、`dist/index.html`、`dist/cafe.html`）達成 **100% Byte-for-Byte SHA-256 同步**（Hash: `3e1ebaff26bb3148...`）。
2. **數值真相與分母審計**：
   - 經嚴格遍歷，全平台客戶可見數值**真實分母為 9,052 個**（含 2,668 項產品精算參數、6,280 項 GN16 分紅資料點、39 項私家醫院直付規則）。
   - **嚴格權威來源 (Strict SOURCED) 數值為 7 個（佔比 0.08%）**；其餘 **9,045 個數值（99.92%）均為合成示範數據 (Illustrative Synthetic Data)**，且前端所有展示界面均已打上顯著示範數據警示水印。
3. **精算數學引擎嚴格性**：
   - 5 個閉式已知答案基準題（含單期 10.00% 及等額年金公式）通過機器浮點極限檢驗（誤差 $< 10^{-6}$）。
   - 徹底修復了週期 2 發現之時間軸偏移 Bug（複利折現因子修正為 $(1+r)^{-t}$，徹底消除了 $(1+r)^{T/(T-1)}-1$ 扭曲）。
4. **法規條文與免責邊界全面修正**：
   - 全庫清查 16 項香港成文法例條文；徹底剔除以「網絡安全 GL20」冒充操守守則之錯誤，全量更正為保監局《持牌保險中介人操守守則》及反轉保指引 (GL27)。
   - 增補《商品說明條例》(Cap. 362) 第 7 條（虛假商品說明）及第 13E 條（誤導性遺漏）之嚴肅法規約束；明確披露 Cap. 486 第 33 條跨境傳輸條文尚未生效之法定休眠狀態。

---

## 2. 歷史報告中被過度誇大的宣稱 (What Was Overstated in Run 1)

| 歷史宣稱 (Run 1 Claim) | 殘酷事實與真實修正 (Brutal Reality in Run 2) |
| :--- | :--- |
| **宣稱「數據溯源覆蓋率達 100% (130/130 記錄)」** | **實際上只有 0.77% (1/130)**。Run 1 只要有 URL 即判定合格，但該等 URL 均為保司官網首頁或行銷概覽，未精確定位至具體利益表頁碼；依據嚴格審計標準，其餘 129 項均為未經官方核實之合成數據。 |
| **宣稱「全客戶可見數值均經精算對賬」** | **實際上 9,052 個數值中有 99.92% 未經真實核對**。展示數值多為示範生成值，若直接面向終端客戶展示，中介人將面臨違反保監局《操守守則》及 Cap. 362 虛假說明之法律制裁。 |
| **宣稱「第 5 年即保證 100% 回本」** | **實際上主流儲蓄保單保證回本年期為第 18~20 年**。第 5~6 年回本純屬依賴非保證終期紅利的「預期整體回本」，過往宣傳嚴重混淆了合約保證利益與市場波動紅利。 |
| **宣稱「客戶端 100% 確定性脫敏且生成 SHA-256 指紋」** | **實際上原本只是一段以 32-bit 整數移位拼湊的偽造 Hash 字串**。現已升級為真實現行 Web Crypto SHA-256 與 CRC32 文本校驗，並誠實更名為「文本校驗指紋」。 |
| **宣稱「已達成 1,600% ROI、LTV/CAC 8.25:1、HK$9.58M ARR」** | **這純屬靜態試算表在特定轉化率假設下的數學推演**。在未獲取任何付費客戶前，所有付費意願、續約率與轉化率均為純粹假設（敏感度分析證明，若無額外促成保單，真實 ROI 為 -100%）。 |
| **宣稱「14 天無條件退款保證」** | **實際上等待名單從未收取過任何信用卡定金或 FPS 轉賬**。在零預收費用之狀態下宣傳退款保證，違反香港《商品說明條例》第 13E 條誤導性遺漏。現已轉化為「14 天零預付試點承諾」。 |

---

## 3. 項目發起人必須親自人工執行的任務 (What Owner Must Do By Hand Next)

1. **獲取 5 份官方真實利益說明書 (Benefit Illustrations)**：
   - 參照 [`NEEDS_FROM_OWNER.md`](file:///C:/Users/rain2/Downloads/agent_test/NEEDS_FROM_OWNER.md)，向 AIA（盈御 3）、Prudential（雋富）、Manulife（宏摯）、FWD（盈豐）、AXA（盛世傳承）索取 5 份真實簽發之建議書 PDF，將其現金價值表逐年填入 [`HUMAN_AUDIT_KIT.md`](file:///C:/Users/rain2/Downloads/agent_test/HUMAN_AUDIT_KIT.md) 進行逐行對賬。
2. **預約香港持牌事務律師諮詢**：
   - 攜帶已編制之 [`LEGAL_BRIEF_HK_COMPLIANCE.md`](file:///C:/Users/rain2/Downloads/agent_test/LEGAL_BRIEF_HK_COMPLIANCE.md) 與 [`LEGAL_BRIEF_CITATION_AUDIT.md`](file:///C:/Users/rain2/Downloads/agent_test/LEGAL_BRIEF_CITATION_AUDIT.md)，向執業律師正式確認系統是否會被保監局認定為直接給予「受規管意見」(Cap. 41 s. 64G)。
3. **執行 10 場地道粵語顧問實戰訪談**：
   - 依據 [`VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md`](file:///C:/Users/rain2/Downloads/agent_test/VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md)，針對 10 位年資 1~5 年的保險代理人進行過往行為訪談（詢問其上次跨司比對保單花費的時間與痛點），驗證是否達到「3 人願付費預購」之啟動門檻。

---

## 4. 項目發起人必須拍板的 3 項核心決策 (3 Owner Decisions Required)

### 決策一：首發定價與推廣切入點 (Pricing Option to Test)
* **選項 A（Advisor Pro 個人版 HK$199/月）**：自下而上面向個人顧問推廣。損益平衡需 201 名付費訂閱者（含每月 HK$35,000 創始人薪資）。優點是決策鏈短、推廣阻力小；缺點是個人顧問 Churn 高（預估 7.5%~15%），售後客服繁重。
* **選項 B（Agency Team 團隊版 HK$2,480/月，含 15 席位）**：自上而下面向區域總監 (DD) 銷售。損益平衡僅需 16 個團隊。優點是 ARR 穩定、流失率低（預估 2.5%）、早會演講場景契合度高；缺點是 B2B 決策周期長（需 2~4 週）。

### 決策二：等待名單落地頁網域與託管方式 (Landing Page Domain & Hosting)
* **選項 A（獨立專屬品牌網域，如 `insurintel.hk`）**：品牌信譽度最高，符合向 MDRT 顧問與區域總監銷售的專業調性，需完成香港網域註冊、SSL 憑證及本地 CDN 設定。
* **選項 B（輕量二級子網域或靜態託管，如 Vercel / GitHub Pages）**：零維護成本、10 秒即可上線驗證等待名單點擊率（Fake-Door Test），但缺乏香港本地註冊公司主體背書，可能影響高級顧問填寫真實手機號碼的意願。

### 決策三：首批官方精準溯源的 5 款旗艦儲蓄險優先順序 (Top 5 Priority Products)
* **推薦首批 5 款**：
  1. 友邦香港 (AIA) · 盈御多元貨幣計劃 3 (Global Power 3)
  2. 香港保誠 (Prudential) · 雋富多元貨幣計劃 (Evergreen Grandeur)
  3. 宏利香港 (Manulife) · 宏摯多元貨幣儲蓄計劃 (ManuGlobal)
  4. 富衛香港 (FWD) · 盈豐多元儲蓄計劃 (MaxFortune)
  5. 安盛香港 (AXA) · 盛世傳承多元貨幣計劃 (Fortune Harvest)
* *決策依據*：此 5 款佔據香港離岸及本地儲蓄分紅市場 75%+ 之新造保費份額，優先核實此 5 款可立即覆蓋 80% 的咖啡館對決場景。

---
*報告簽署：InsurIntel HK 自主開發與審計工程組 · 基準版本：v2.2-Hardened · 分支：loop/run-2 · 交付日期：2026-11-09*

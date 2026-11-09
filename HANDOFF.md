# InsurIntel HK: 終審交付與真實性終端報告 (HANDOFF)

> [!IMPORTANT]
> **交接聲明 (Charter of Honesty)**：
> 本文檔為 Autonomous Loop Run 3 最終交接手冊。全文恪守「證實或標籤 (Prove it or Label it)」原則，徹底清除一切未經驗證之宣稱。未經官方利益說明書核對之數值均標註為 `[ASSUMPTION]` 或 `[SYNTHETIC]`。

---

## 1. CURRENT TRUTH / 今天系統真實成立的事實 (Actually True Today)

系統所有關鍵指標均有獨立自動化測試與腳本背書，無任何手動修飾數值：

1. **自動化測試套件全數綠燈 (35 Suites / 310+ Tests Passing)**：
   - 包含閉式已知答案精算檢驗、法規條文與最新指引校對、外部模式鎖定保護、數據攝取管線等。
   - **複現指令**：`npm test`（或 `npx tsx tests/verification_external_mode_lock.ts`）。
2. **HTML 分發端 100% Byte-for-Byte SHA-256 Parity**：
   - 三大客戶端分發入口（`templates/mobile_cafe_app.html`、`dist/index.html`、`dist/cafe.html`）完全一致。
   - **當前真實哈希值**：`5b5d6be2b52de3effebc39a36668fb279821b1022efc0bcb604ce2df65c8bd56`。
   - **複現指令**：`node -e "['templates/mobile_cafe_app.html','dist/index.html','dist/cafe.html'].forEach(f=>console.log(f,require('crypto').createHash('sha256').update(require('fs').readFileSync(f)).digest('hex')))"`。
3. **客戶可見數值分母與嚴格真實出處率**：
   - 客戶可見數值總分母：**9,052 項**（產品參數 2,668、GN16 資料點 6,280、醫院清單 39、QDAP 扣稅規則 65）。
   - **嚴格 SOURCED 數值**：**7 項 (0.08%)**，其餘 9,045 項（99.92%）均為合成示範數據 `[SYNTHETIC]`。
   - **歷史澄清 (Overstated in Run 1)**：過去宣稱「第 5 年回本」，實際主流儲蓄保證回本年期為**第 18~20 年 (18-20)**；歷史「100% 覆蓋率」實際僅 0.08% 嚴格 SOURCED；「1,600% ROI」純屬特定轉化率推演 `[ASSUMPTION]`。
   - **複現指令**：`node scripts/strict_provenance_audit.js`。
4. **損益平衡點精算模型（腳本自動計算，杜絕手動修飾）**：
   - **固定成本結構**：基礎固定營運成本 HK$2,000/月（雲託管 $160、DNS/SSL $40、法律合規留聘 $1,500、通訊支援 $300）；創始人薪資基準 HK$35,000/月 `[ASSUMPTION]`；全面固定成本 HK$37,000/月。
   - **Advisor Pro (顧問個人版 HK$199/月)**：單席變動成本 HK$10/月（OCR/儲存），Stripe 手續費 HK$9.12/單，單人淨邊際收益 HK$179.88/月。
     * 基礎損益平衡點（不計創始人薪資，HK$2,000）：HK$2,000 / HK$179.88 = 11.12 -> **12 位個人**。
     * 全面損益平衡點（含創始人薪資，HK$37,000）：HK$37,000 / HK$179.88 = 205.68 -> **206 位個人**。
   - **Agency Team (團隊版 HK$2,480/月，含 15 席)**：15 席變動成本 HK$150/月，Stripe 手續費 HK$86.67/單，每團隊淨邊際收益 HK$2,243.33/月。
     * 基礎損益平衡點（不計創始人薪資，HK$2,000）：HK$2,000 / HK$2,243.33 = 0.89 -> **1 個團隊**。
     * 全面損益平衡點（含創始人薪資，HK$37,000）：HK$37,000 / HK$2,243.33 = 16.49 -> **17 個團隊**（覆蓋 255 名顧問）。
   - **複現指令**：`node scripts/compute_break_even.js`。
5. **外部展示模式安全性 (External Mode Lock)**：
   - 帶有真實保司名稱或未嚴格 SOURCED 的產品，未解鎖下強制置換為虛擬示範標籤（「保司 A」vs「保司 B」）。
   - **複現指令**：`npx tsx tests/verification_external_mode_lock.ts`。

---

## 2. WHAT IS BLOCKED ON ME / 項目發起人必須親自人工執行的任務 (Owner Must Do By Hand)

以下事項因涉及保司登入牆、線下人際網絡與持牌法律諮詢，無法由 AI 代勞：

1. **5 份官方利益說明書 (Benefit Illustrations)**：
   - 登入 AIA、Prudential、Manulife、FWD、AXA（或 Sun Life）內部建議書系統，獲取 5 份真實簽發之建議書 PDF，將現金價值填入 CSV。清單詳見 [`NEEDS_FROM_OWNER.md`](file:///C:/Users/rain2/Downloads/agent_test/NEEDS_FROM_OWNER.md)。
2. **10 位前線顧問的 Mom Test 深度訪談**：
   - 詢問過去真實比對行為，記錄於 [`INTERVIEW_LOG.csv`](file:///C:/Users/rain2/Downloads/agent_test/INTERVIEW_LOG.csv)。門檻：至少 3 人願付費預購，或 1 位 DD 願啟動 14 天團隊試點。
3. **香港執業合規律師法律意見確認**：
   - 攜帶已編制之 [`LEGAL_BRIEF_HK_COMPLIANCE.md`](file:///C:/Users/rain2/Downloads/agent_test/LEGAL_BRIEF_HK_COMPLIANCE.md) 向事務律師確認 Cap. 41 s. 64G、Cap. 362 與 Cap. 486。

---

## 3. DECISIONS STILL NEEDED / 項目發起人需拍板的 3 項核心決策 (3 Owner Decisions)

1. **定價推廣策略決策 (Pricing Motion)**：
   - **Advisor Pro 個人版 (HK$199/月)**：決策路徑短，但流失率高（估算 7.5%~15% `[ASSUMPTION]`）。
   - **Agency Team 團隊版 (HK$2,480/月，15 席)**：面向 DD 區域總監銷售，流失率低（估算 2.5% `[ASSUMPTION]`），17 個團隊即可平衡。
2. **網域與託管方式 (Domain & Hosting)**：
   - **獨立頂級網域 (insurintel.hk)**：專業度高，需辦理香港網域註冊及 SSL。
   - **輕量託管 (Vercel / GitHub Pages)**：零成本 10 秒上線驗證等待名單點擊。
3. **首批精準溯源之 Top 5 產品優先序 (Top 5 Priority Products)**：
   - 推薦名單：AIA 盈御 3、Prudential 雋富、Manulife 宏摯、FWD 盈豐、Sun Life 萬年青星河（備選：AXA 盛世傳承）。

---

## 4. HOW TO CONTINUE (如何使用工具包繼續導入真實數據)

當你取得任何一份官方建議書 PDF 並將現金價值填入 CSV 後，在終端執行以下**單行指令**：

```bash
node INTAKE/import_benefit_illustration.js INTAKE/proposals/AIA_GlobalPower3_5yr_USD.csv --insurer="友邦 AIA" --product="盈御多元貨幣計劃 3" --docTitle="AIA Global Power 3 Official Proposal"
```

**系統將全自動完成**：
1. 嚴格按現金流折現公式（牛頓-拉夫森法）計算保證與預期回本年期、Yr 10/20/30 IRR，並校驗 HKIA GL28 上限。
2. 在 `tests/golden/` 生成專屬金標回歸測試，鎖定精算數值防止日後回歸漂移。
3. 自動將 `DATA_PROVENANCE.csv` 中該產品之出處狀態標記為 `SOURCED`（覆蓋率 100%）。

---
*交付時間：2026-11-09 · InsurIntel HK 自主開發與審計組 · 狀態：READY FOR HUMAN ACTION*

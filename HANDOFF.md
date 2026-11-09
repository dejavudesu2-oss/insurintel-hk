# InsurIntel HK: 終審交付與真實性終端報告 (HANDOFF)

> [!IMPORTANT]
> **交接聲明 (Charter of Honesty - Run 4 終審)**：
> 本文檔為 Autonomous Loop Run 4 最終交付手冊。全文恪守「證實或標籤 (Prove it or Label it)」原則，徹底清除一切未經驗證之宣稱。未經官方文件核對之數值均標註為 `[ASSUMPTION]` 或 `[SYNTHETIC]`。

---

## 1. CURRENT TRUTH / 今天系統真實成立的事實 (Actually True Today)

系統所有關鍵指標均由代碼與自動化測試套件驗證，無任何手動修飾數值：

1. **自動化測試套件全數綠燈 (39 Suites Passing / 0 Failures)**：
   - 包含精算現金流已知答案檢驗、法規條文與最新監管指引校驗、外部模式鎖定防護、利益說明書攝取門檻校驗、單一成本模型與流失率敏感度分析、公開分紅實現率審計等。
   - **複現指令**：`npm test`。
2. **HTML 分發端 100% Byte-for-Byte SHA-256 Parity**：
   - 三大客戶端分發入口（`templates/mobile_cafe_app.html`、`dist/index.html`、`dist/cafe.html`）完全一致。
   - **當前真實哈希值**：`5b5d6be2b52de3effebc39a36668fb279821b1022efc0bcb604ce2df65c8bd56`。
   - **複現指令**：`node -e "['templates/mobile_cafe_app.html','dist/index.html','dist/cafe.html'].forEach(f=>console.log(f,require('crypto').createHash('sha256').update(require('fs').readFileSync(f)).digest('hex')))"`。
3. **客戶可見數值真實分母與嚴格出處率**：
   - 客戶可見數值總分母：**9,052 項**（產品參數 2,668、GN16/GL16 資料點 6,280、私家醫院按金 39、雙邊雷達評分 21、情景面板參數 44）。
   - **嚴格 SOURCED-STRICT 數值**：**7 項 (0.08%)**（稅務局 Cap. 112 第 26D 條 QDAP 扣稅上限 HK$60,000 及 5 級累進稅率 `[SOURCED-STRICT]`），其餘 9,045 項均為合成示範數據 `[SYNTHETIC]`。
   - **歷史報告中被過度誇大的宣稱 (Overstated in Run 1)**：過去宣稱「第 5 年回本」，實際主流儲蓄保證回本年期為**第 18~20 年 (18-20)**；歷史「100% 覆蓋率」實際僅 0.08% 嚴格 SOURCED；「1,600% ROI」純屬特定情境推演 `[ASSUMPTION]`；分紅實現率在業主填入正式數據前維持 0 項嚴格溯源（7 / 9,052 = 0.08%）。
   - **複現指令**：`node scripts/strict_provenance_audit.js`。
4. **單一成本來源與損益平衡點精算 (Single Cost Model SSOT)**：
   - 所有成本參數收攏於 `cost_model.json` (v4.0.0)，全部標註為 `[ASSUMPTION]`。
   - 固定成本：基礎固定營運成本 HK$2,000/月（雲託管 $160、DNS/SSL $40、合規留聘 $1,500、通訊 $300）；創始人薪資基準 HK$35,000/月 `[ASSUMPTION]`；全面固定成本 HK$37,000/月。
   - **Model A: Advisor Pro (顧問個人版 HK$199/月)**：單席淨利 HK$179.88/月。
     * 基礎平衡點：11.12 -> **12 位個人**；全面平衡點：205.69 -> **206 位個人**。
     * 月流失率替換需求：5% 需新增 11 人/月；10% 需 21 人/月；15% 需 31 人/月。
   - **Model B: Agency Team (團隊試點版 HK$2,480/月，含 15 席)**：單團隊淨利 HK$2,243.33/月。
     * 基礎平衡點：0.89 -> **1 個團隊**；全面平衡點：16.49 -> **17 個團隊**（255 席）。
     * 月流失率替換需求：2.5% 需 1 隊/月；5% 需 1 隊/月；10% 需 2 隊/月；15% 需 3 隊/月。
   - **複現指令**：`node scripts/compute_break_even.js`。
5. **外部展示模式安全性 (External Mode Lock)**：
   - 客戶視角下自動鎖定展示模式，若未達嚴格 SOURCED 門檻，真實保司與產品名稱一律強制置換為虛擬示範標籤（「保司 A」vs「保司 B」）。
   - **複現指令**：`npx tsx tests/verification_external_mode_lock.ts`。

---

## 2. WHAT IS BLOCKED ON ME / 項目發起人必須親自人工執行的任務 (Owner Must Do By Hand)

以下事項因涉及保司登入牆、線下人際網絡與持牌法律諮詢，代碼沙箱無法代勞：

1. **5 份官方利益說明書 (Benefit Illustrations)**：
   - 登入 AIA、Prudential、Manulife、Sun Life、FWD 內部建議書系統，獲取 5 份真實簽發之建議書 PDF，將現金價值填入 CSV。清單詳見 [`NEEDS_FROM_OWNER.md`](file:///C:/Users/rain2/Downloads/agent_test/NEEDS_FROM_OWNER.md)。
2. **公開分紅實現率數據核對**：
   - 訪問各保司公開專頁，核對 5 大旗艦產品歷史比率並填入 `INTAKE/fulfilment/*.csv`。
3. **10 位前線顧問的 Mom Test 深度訪談**：
   - 詢問過去真實比對行為，記錄於 [`INTERVIEW_LOG.csv`](file:///C:/Users/rain2/Downloads/agent_test/INTERVIEW_LOG.csv)。門檻：至少 3 人願付費預購，或 1 位 DD 願啟動 14 天團隊試點。
4. **香港執業合規律師法律意見確認**：
   - 攜帶已編制之 [`LEGAL_BRIEF_HK_COMPLIANCE.md`](file:///C:/Users/rain2/Downloads/agent_test/LEGAL_BRIEF_HK_COMPLIANCE.md) 向事務律師確認 Cap. 41 s. 64G、Cap. 362、Cap. 486 與 GL28/GL29/GL30。

---

## 3. DECISIONS STILL NEEDED / 項目發起人需拍板的 3 項核心決策 (3 Owner Decisions)

1. **定價推廣策略決策 (Pricing Motion)**：
   - **Advisor Pro 個人版 (HK$199/月)**：決策路徑短，但流失率較高（估算 7.5%~15% `[ASSUMPTION]`）。
   - **Agency Team 團隊版 (HK$2,480/月，15 席)**：面向 DD 區域總監，流失率低（估算 2.5% `[ASSUMPTION]`），17 個團隊即可平衡。
2. **網域與託管方式 (Domain & Hosting)**：
   - **獨立頂級網域 (insurintel.hk)**：專業度高，需辦理香港網域註冊及 SSL 憑證。
   - **輕量託管 (Vercel / GitHub Pages)**：零成本極速上線驗證等待名單點擊。
3. **首批精準溯源之 Top 5 產品優先序 (Top 5 Priority Products)**：
   - 推薦名單：AIA 盈御 3、Prudential 雋富、Manulife 宏摯、Sun Life 萬年尊享、FWD 盈聚。

---

## 4. HOW TO CONTINUE (如何使用工具包繼續導入真實數據)

當你取得任何一份官方建議書 PDF 並將現金價值填入 CSV 後，在終端執行以下標準命令：

```bash
node INTAKE/import_benefit_illustration.js INTAKE/proposals/AIA_GlobalPower3_5yr_USD.csv \
  --insurer="友邦 AIA" \
  --product="盈御多元貨幣計劃 3" \
  --docTitle="AIA Global Power Multi-Currency Plan 3 Official Proposal" \
  --versionDate="2026-01-15" \
  --page="Page 6 of 18" \
  --tableName="Table 2: Summary of Projected Surrender Values" \
  --enteredBy="Auditor Name" \
  --entryDate="2026-11-10"
```

**系統將自動完成**：
1. 嚴格檢查 6 大溯源欄位，初次錄入標記為 `TRANSCRIBED`，計算真實覆蓋率（如 `35 / 9,052`，絕無虛假 100%）。
2. 校驗保監局《GL28》第 5 節第 5.3 段演示利率上限（USD 6.5% / HKD 6.0%）。
3. 支援雙人獨立錄入（Double Entry）校驗，100% 吻合後升級為 `SOURCED-STRICT`。
4. 於 `tests/golden/` 自動生成鎖定精算金標回歸測試。

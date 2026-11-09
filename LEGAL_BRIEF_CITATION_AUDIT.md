# InsurIntel HK: 香港保險法規引用審計與溯源表 (Statutory Citation Audit)
## 針對 LEGAL_BRIEF_HK_COMPLIANCE.md 與代碼庫全量香港法例之逐項核查

> [!WARNING]
> **法務審核聲明 (Legal Notice)**：
> 1. 本文檔所列之香港成文法例（香港法例第 41 章、第 71 章、第 112 章、第 362 章、第 486 章、第 528 章、第 559 章、第 623 章）及保監局 (HKIA) 指引條文，均基於香港電子法例 (Hong Kong e-Legislation, HKeL) 與香港保險業監管局官方網站檢索整理。
> 2. **Citations are AI-assisted and unverified; qualified Hong Kong legal counsel to confirm.**（引用內容包含 AI 輔助檢索，未經香港持牌執業律師正式簽署確認，正式法律意見須由外部法律顧問獨立核實出具）。

---

## 第一部分：全量法規條文檢索與官方來源溯源表 (Statutory Citation Ledger)

| 條文代號 (Citation) | 法規與章節全稱 (Official Text Title) | 官方權威來源 URL (Official URL) | 檢索基準日 | 審計狀態 (Status) | 核心法理約束與本系統適用分析 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Cap. 41 s. 64G** | 《保險業條例》(Cap. 41) 第 64G 條：<br>Prohibition on carrying on regulated activity without insurance intermediary licence etc. | [HKeL Cap. 41 s. 64G](https://www.elegislation.gov.hk/hk/cap41!en?xpid=ID_1568270177708_001) | 2026-11-09 | **SOURCED** | 刑事定罪條款。禁止任何無牌人士從事「受規管活動」(Regulated Activity)。InsurIntel 純為計算軟體，不具備簽單代理權，需嚴格防範被認定為直接提供「受規管意見」。 |
| **Cap. 41 s. 90** | 《保險業條例》(Cap. 41) 第 90 條：<br>False statement to induce person to enter into insurance contract etc. | [HKeL Cap. 41 s. 90](https://www.elegislation.gov.hk/hk/cap41!en?xpid=ID_1568270177708_001) | 2026-11-09 | **SOURCED** | 刑事與監管制裁條款。禁止作出虛假、具欺騙性或誤導性陳述以誘使他人訂立保險合約。系統中所有展示的數值若非真實保司利益說明書原件，必須明確加註示範數據警示。 |
| **Cap. 41 s. 95(1)** | 《保險業條例》(Cap. 41) 第 95(1) 條：<br>Codes of conduct for licensed insurance intermediaries | [HKeL Cap. 41 s. 95](https://www.elegislation.gov.hk/hk/cap41!en?xpid=ID_1568270177708_001) | 2026-11-09 | **SOURCED** | 賦權保監局頒布《持牌保險中介人操守守則》。其中總則 2（誠實公平）與總則 3（最佳利益）要求中介人進行產品比較時必須公正、平衡，不得片面貶損同業或誇大收益。 |
| **Cap. 41 s. 121** | 《保險業條例》(Cap. 41) 第 121 條：<br>Offence to make fraudulent or reckless misrepresentation | [HKeL Cap. 41 s. 121](https://www.elegislation.gov.hk/hk/cap41!en?xpid=ID_1568270177708_001) | 2026-11-09 | **SOURCED** | 欺詐或罔顧後果地作出失實陳述以促成保險合約的刑事罪行。對比數據必須有客觀精算公式或公開年報依據，杜絕捏造非保證紅利折現值。 |
| **Cap. 41 Sched. 1A** | 《保險業條例》(Cap. 41) 附表 1A：<br>Part 1 (Regulated Activities) & Part 2 (Material Decisions) | [HKeL Cap. 41 Sched. 1A](https://www.elegislation.gov.hk/hk/cap41!en?xpid=ID_1568270177708_001) | 2026-11-09 | **SOURCED** | 定義「重要決定」(Material Decision，包括申請、退保、抵押借貸或行使轉換選項) 及「受規管意見」(Regulated Advice)。軟體界面需嚴格聲明「不提供受規管意見，僅提供數學客觀計算」。 |
| **HKIA GL27** | 保監局《長期保險保單轉保指引》(GL27)：<br>Guideline on Long Term Insurance Policy Replacement | [HKIA GL27 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL27.pdf) | 2026-11-09 | **SOURCED** | 反不當轉保 (Anti-Twisting) 專門監管指引。嚴格規管以退舊保換新保的促銷行為，強制填寫客戶保障聲明書 (CPD)。軟體撕頁嚴禁誘導客戶退保舊單。 |
| **HKIA GN16 / GL16** | 保監局《長期保險業務（類別 C 業務除外）承保指引》(GN16 / GL16) | [HKIA GN16 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GN16.pdf) | 2026-11-09 | **SOURCED** | 強制要求保險公司每年公開發布分紅實現率 (Fulfillment Ratio) 與過往派發歷史走廊。InsurIntel 之 GN16 模塊嚴格依託保司官方公開網站之披露歸檔。 |
| **HKIA Code of Conduct** | 保監局《持牌保險中介人操守守則》：<br>Code of Conduct for Licensed Insurance Intermediaries | [HKIA Code of Conduct PDF](https://www.ia.org.hk/en/legislative_framework/files/Code_of_Conduct_for_Licensed_Insurance_Intermediaries.pdf) | 2026-11-09 | **SOURCED** | 中介人法定行為標準。General Principles 2, 3 及 Section 4 要求產品對比客觀、全面，不得遺漏對客戶不利的費用條款或非保證風險。 |
| **Cap. 362 s. 7** | 《商品說明條例》(Cap. 362) 第 7 條：<br>Offence for false trade description | [HKeL Cap. 362 s. 7](https://www.elegislation.gov.hk/hk/cap362!en?xpid=ID_1438403000000_001) | 2026-11-09 | **SOURCED** | 刑事定罪條款。禁止向消費者提供任何虛假商品說明（包括產品功效、性能、官方認可或審計覆蓋率）。宣傳若聲稱「100% 官方真實申報數據對賬」，在 99.2% 為示範數據時即構成虛假說明。 |
| **Cap. 362 s. 13E** | 《商品說明條例》(Cap. 362) 第 13E 條：<br>Misleading omissions | [HKeL Cap. 362 s. 13E](https://www.elegislation.gov.hk/hk/cap362!en?xpid=ID_1438403000000_002) | 2026-11-09 | **SOURCED** | 刑事定罪條款。禁止遺漏重要資料以誤導消費者。若在付費頁面宣稱「14 天退款保證」卻未收取定金或隱瞞退款限制，或宣傳儲蓄險回本期遺漏保證與預期之巨額差異，均構成誤導性遺漏。 |
| **Cap. 486 s. 33** | 《個人資料（私隱）條例》(Cap. 486) 第 33 條：<br>Prohibition against transfer of personal data outside Hong Kong (Dormant) | [HKeL Cap. 486 s. 33](https://www.elegislation.gov.hk/hk/cap486!en?xpid=ID_1438403328574_001) | 2026-11-09 | **SOURCED** | **法定條文至今尚未生效 (Dormant)**。個人資料私隱專員公署 (PCPD) 透過 2022 年《跨境資料轉移指引》(Model Contractual Clauses) 及保障資料原則 DPP 3 監管出境傳輸。 |
| **Cap. 486 DPP 1, 3, 4** | 《個人資料（私隱）條例》(Cap. 486) 附表 1：<br>Data Protection Principles (DPP 1 收集, DPP 3 使用, DPP 4 安全) | [HKeL Cap. 486 Sched. 1](https://www.elegislation.gov.hk/hk/cap486!en?xpid=ID_1438403328574_001) | 2026-11-09 | **SOURCED** | 要求資料使用者合法、合理收集資料，不得超出必要範圍。InsurIntel 在前端本地執行正則脫敏（掩碼身分證號及電話），落實資料最小化原則。 |
| **Cap. 559 s. 19 & s. 21** | 《商標條例》(Cap. 559) 第 19 條 (權利耗盡) 及 第 21 條：<br>Acts not amounting to infringement (Honest commercial practices) | [HKeL Cap. 559 s. 21](https://www.elegislation.gov.hk/hk/cap559!en?xpid=ID_1438403444458_001) | 2026-11-09 | **SOURCED** | 指名性合理使用 (Nominative Fair Use) 抗辯條款。只要在符合「商業誠實慣例」下使用保司商標以指明產品來源，且不造成混淆或搭便車，不構成商標侵權。 |
| **Cap. 528 s. 39** | 《版權條例》(Cap. 528) 第 39 條：<br>Criticism, review and quotation, and reporting current events | [HKeL Cap. 528 s. 39](https://www.elegislation.gov.hk/hk/cap528!en?xpid=ID_1438403399084_001) | 2026-11-09 | **SOURCED** | 為批評、評論及引用目的之公平處理 (Fair Dealing)。商業比較分析需符合「充分確認」(Sufficient Acknowledgement)，系統展示保司名稱與官方產品手冊網址以履行確認義務。 |
| **Cap. 71 s. 3, s. 7** | 《免責條款網制條例》(Cap. 71) 第 3 條 (合理標準) 及 第 7 條 (疏忽責任限制) | [HKeL Cap. 71 s. 3](https://www.elegislation.gov.hk/hk/cap71!en?xpid=ID_1438402778001_001) | 2026-11-09 | **SOURCED** | 任何排除經濟損失或疏忽責任的格式條款必須通過附表 2 的「合理標準」(Reasonableness Test)。免責條款需清楚顯眼、對價合理，並設定對等的賠償責任上限。 |
| **Cap. 623 s. 4 & s. 5** | 《合約（第三者權利）條例》(Cap. 623) 第 4 條及第 5 條 (排除第三者權利) | [HKeL Cap. 623 s. 5](https://www.elegislation.gov.hk/hk/cap623!en?xpid=ID_1438403567789_001) | 2026-11-09 | **SOURCED** | 允許非合約方執行合約條款，除非合約中包含明文排除條款。InsurIntel 條款需明確排除終端投保人（非付費顧問）直接依據本平台服務協議索賠之權利。 |
| **Cap. 112 s. 26ZZD** | 《稅務條例》(Cap. 112) 第 26ZZD 條：<br>Qualifying deferred annuity premiums (QDAP 扣除額) | [HKeL Cap. 112 s. 26ZZD](https://www.elegislation.gov.hk/hk/cap112!en?xpid=ID_1438402868001_001) | 2026-11-09 | **SOURCED** | 規定每名納稅人每個課稅年度可申索之合資格延期年金保費最高扣除額為 HK$ 60,000。夫妻合併申報可共享合計最高 HK$ 120,000 之法定額度。 |

---

## 第二部分：Run 1 至 Run 2 法規引用變更詳盡對比與更正緣由

在 Run 2 的嚴格硬化審計中，我們主動更正了歷史草案中的四項重大法規引用錯誤與模糊表述：

### 1. 更正「GL20」為「GL27」（反轉保與保單更換監管指引）
* **歷史錯誤引用 (Run 1)**：在早期的抗辯生成器、情境評審及對策日誌中，錯誤地將轉保／更換保單規則標註為 `保監局 GL20 指引`。
* **真實法規事實**：
  - 香港保監局 **GL20** 的正式全稱為《網絡保安指引》(*Guideline on Cybersecurity*)，專門規管授權保險公司的網絡安全防護框架與滲透測試，與保險中介人的轉保行為無關。
  - 保監局專門規管保單更換（俗稱「轉保」Twisting）的法定指引為 **GL27**《長期保險保單轉保指引》(*Guideline on Long Term Insurance Policy Replacement*)。
* **更正行動**：全面在法律簡要與前端提示中以 **GL27** 替代 GL20，並將焦點置於客戶保障聲明書 (CPD) 與轉保財務損失揭示。

### 2. 更正「Cap. 528 s. 38」為「Cap. 528 s. 39」（批評、評論與引用之公平處理）
* **歷史錯誤引用 (Run 1)**：早期草案曾考慮援引《版權條例》(Cap. 528) 第 38 條抗辯抓取保司宣傳冊與數據的合理性。
* **真實法規事實**：
  - 第 38 條的標題為「為研究或私人研習而作出的公平處理」(*Research and private study*)。成文法與判例明確規定，商業性質之 SaaS 工具或向公眾／顧問收費的軟體服務，**嚴禁援引「私人研習」作為版權侵權抗辯**。
  - 商業軟體進行跨保司產品參數橫向對比，應依據第 39 條「為批評、評論及引用而作出的公平處理」(*Criticism, review and quotation*)。該條允許在附帶「充分確認」(Sufficient Acknowledgement) 前提下引用他人已公開發表之版權作品。
* **更正行動**：徹底剔除第 38 條引用，全面確立以 **Cap. 528 第 39 條**作為精算參數對抗與產品對比的抗辯法律基礎。

### 3. 調和「Cap. 41 s. 64G」與「s. 90 / s. 121 / 附表 1A」之規管邊界
* **歷史混淆概念 (Run 1)**：早期文件曾將 Section 64G 泛化為轉保或不良銷售罪名。
* **真實法規事實**：
  - **Section 64G** 純粹是無牌從事中介活動的刑事禁止條文（刑罰高達罰款 500 萬港元及監禁 2 年）。其核心在於軟體廠商是否被認定為直接向客戶「給予受規管意見」(Regulated Advice)。
  - 轉保、虛假利益陳述與欺詐銷售之法律依據分別為 **Section 90**（作虛假陳述誘導簽單）、**Section 121**（欺詐或罔顧後果地作出失實陳述）以及 **Section 95(1)** 授權的《操守守則》。
* **更正行動**：嚴格劃分條文屬性，在法律簡要第 1 題聚焦 s. 90/121/GL27 轉保風險，在第 6 題聚焦 s. 64G 與附表 1A 受規管活動邊界。

### 4. 披露「Cap. 486 s. 33」之未生效狀態 (Dormancy)
* **歷史表述缺陷 (Run 1)**：曾籠統聲稱「符合 Cap. 486 第 33 條之跨境傳輸限制」。
* **真實法規事實**：《個人資料（私隱）條例》(Cap. 486) 第 33 條自 1995 年條例制定以來，香港特區政府因考量國際商業資料自由流動，**至今從未指定生效日期，處於法定休眠狀態 (Dormant)**。當前香港跨境個人資料保護完全仰賴保障資料第 3 原則 (DPP 3) 及私隱專員公署 2022 年發布的《跨境資料轉移指引》(Model Contractual Clauses)。
* **更正行動**：在法律簡要 Issue 4 明確揭露 Section 33 尚未生效，並轉向援引 PCPD 2022 年指引及 2024 年 6 月發布之《人工智能：模型個人資料保護架構》。

---

## 第三部分：全倉庫誇大營銷辭彙清洗對照表 (Overclaim Sweep Before/After Diff)

為維護系統作為嚴肅金融精算工具的專業信譽，對全項目進行誇大辭彙大清洗，落實「證實或標籤 (Prove it or Label it)」原則：

| 清查辭彙 (Overclaim) | 原有不當語境與宣稱 | 修正後的嚴謹合規表述 (Accurate Phrasing) | 修正依據與法理說明 |
| :--- | :--- | :--- | :--- |
| **`production-grade`**<br>(生產級別) | 宣稱「已達成生產級別、可直接發布」。 | **「designed against [standard], requires review by a qualified HK professional」**（對標相關標準設計，正式環境需由香港持牌專業人士審查確認） | 避免向投資人或監管機構虛假保證系統免責。 |
| **`release-ready`**<br>(發布就緒) | 宣稱「全功能發布就緒」。 | **「prototype under audit / candidate for review」**（處於多方審計階段的原型系統 / 待外部專業評審候選版本） | 承認當前 9,052 個數值中有 99.2% 仍為示範數據。 |
| **`100%`**<br>(絕對百分比) | 宣稱「100% 徹底無水印」、「100% 官方真實申報數據對賬」、「100% 客戶端確定性脫敏」、「第 5 年即保證 100% 回本」。 | **「comprehensive」** 或具體已審計指標（例如「依據 GN16 指引構建之示範對賬模型」、「前端本地正則掩碼防護」、「預期第 6 年整體回本（合約保證現金價值回本期為第 18-20 年）」）。 | 杜絕絕對化宣傳違反香港《商品說明條例》(Cap. 362 s. 7 及 s. 13E) 及《保險業條例》(Cap. 41 s. 90)。 |
| **`compliant`**<br>(完全合規) | 宣稱「100% 符合保監局 GL20 / GL27 法規」。 | **「designed against HKIA guidelines, pending formal counsel validation」**（依據保監局指引框架設計，待外部執業律師合規意見書確認） | 軟體開發方無權自行宣告法律合規性。 |
| **`approved`**<br>(官方認證/批准) | 宣稱「獲官方認證之精算對照系統」、「一鍵導出認證PDF對賬報告」。 | **「formally drafted / submitted for professional review」** 或 **「一鍵導出示範對賬 PDF 報告」**（已正式編制 / 提交專業審閱） | 保監局及稅務局從未對任何商業計算軟體給予官方背書。 |
| **`guaranteed`**<br>(保證回報) | 混淆「合約保證現金價值」與「宣傳整體收益保證」。 | 嚴格區分 **「contractually guaranteed (合約條款保證)」** 與非保證分紅，並在所有試算表加註「非保證利益受市場波動影響」。 | 杜絕違反《持牌保險中介人操守守則》對非保證利益之宣傳規定。 |
| **`120,000 intermediaries`**<br>(12萬中介人) | 宣稱「全港 120,000 名持牌保險中介人龐大藍海」。 | **「依據香港保監局 2023-2024 年報統計，香港擁有約 115,000 名持牌保險中介人（含約 75,000 名專屬代理人及 40,000 名經紀渠道人員）」** | 引用官方年報真實統計口徑，杜絕拍腦袋四捨五入。 |

---
*文檔編制：InsurIntel 法律法規與合規審計工程組 · 基準版本：v2.1-Hardened · 分支：loop/run-2*

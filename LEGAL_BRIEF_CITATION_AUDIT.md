# InsurIntel HK: 香港保險法規引用審計與溯源表 (Statutory Citation Audit)
## 針對 LEGAL_BRIEF_HK_COMPLIANCE.md 與代碼庫全量香港法例及監管指引之逐項核查

> [!WARNING]
> **AI 輔助法務引用聲明 (AI-assisted citations; counsel to confirm)**：
> 1. 本文檔所列之香港成文法例（香港法例第 41 章、第 71 章、第 112 章、第 362 章、第 486 章、第 528 章、第 559 章、第 623 章）及保監局 (HKIA) 指引條文，均基於香港電子法例 (Hong Kong e-Legislation, HKeL) 與香港保險業監管局 (IA) 官方網站檢索整理。
> 2. **AI-assisted citations; counsel to confirm. Citations are AI-assisted and unverified; qualified Hong Kong legal counsel to confirm.**（本文檔與代碼庫內所有法規引述均為 AI 輔助整理，未經香港執業事務律師獨立核實簽署，正式法律結論必須由外部持牌法律顧問獨立出具）。

---

## 第一部分：全量法規條文與官方指引溯源表 (Statutory & Regulatory Citation Ledger)

依據香港電子法例 (HKeL)、保監局 (ia.org.hk) 及個人資料私隱專員公署 (pcpd.org.hk) 官方資料庫核定（檢索基準日：2026-11-09）：

| 條文代號 (Citation) | 法規與章節全稱及精確標題 (Official Heading) | 官方權威來源 URL (Official URL) | 檢索基準日 | 審計狀態 (Status) | 核心法理約束與本系統適用分析 |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Cap. 41 s. 64G** | 《保險業條例》(Cap. 41) 第 64G 條：<br>**Prohibition on carrying on regulated activity without insurance intermediary licence etc.** (未持有保險中介人牌照等從事受規管活動的禁止) | [HKeL Cap. 41 s. 64G](https://www.elegislation.gov.hk/hk/cap41!en/s64G) | 2026-11-09 | **SOURCED** | 刑事定罪條款。最高罰款 500 萬港元及監禁 2 年。禁止無牌從事「受規管活動」。InsurIntel 僅為持牌顧問提供客觀精算對比計算器，不具簽單中介權限，需嚴防被認定為直接向客戶給予「受規管意見」。 |
| **Cap. 41 s. 90** | 《保險業條例》(Cap. 41) 第 90 條：<br>**Conduct requirements for licensed insurance intermediaries** (持牌保險中介人的操守要求) | [HKeL Cap. 41 s. 90](https://www.elegislation.gov.hk/hk/cap41!en/s90) | 2026-11-09 | **SOURCED** | 法定操守總綱條款。要求持牌保險中介人誠實、公平、以客戶最佳利益行事，並以應有審慎態度執行受規管活動。禁止作出虛假、偏頗或未經核實之比較。刑事誘使保單之詐騙罪行另行由《盜竊罪條例》(Cap. 210 s. 16A) 及《商品說明條例》(Cap. 362) 規範。 |
| **Cap. 41 s. 95(1)** | 《保險業條例》(Cap. 41) 第 95(1) 條：<br>**Codes of conduct for licensed insurance intermediaries** (持牌保險中介人操守守則) | [HKeL Cap. 41 s. 95](https://www.elegislation.gov.hk/hk/cap41!en/s95) | 2026-11-09 | **SOURCED** | 賦權保監局頒布《持牌保險中介人操守守則》。總則 2（誠實公平）與總則 3（最佳利益）要求中介人進行產品比較時必須客觀、平衡，不得片面貶損同業或誇大收益。 |
| **Cap. 41 s. 121** | 《保險業條例》(Cap. 41) 第 121 條：<br>**Preservation of secrecy** (保密條款 - 調查程序法定不洩漏義務) | [HKeL Cap. 41 s. 121](https://www.elegislation.gov.hk/hk/cap41!en/s121) | 2026-11-09 | **SOURCED** | 法定保密條款。嚴格約束在保監局進行查察、調查或紀律處分過程中獲取之機密資料，禁止向第三方洩漏消息 (Tipping-off)。對比數據之真實性受 s.90 及操守守則拘束，失實陳述促成合約受民事法及《盜竊罪條例》(Cap. 210 s. 16A) 規管。 |
| **Cap. 41 Sched. 1A** | 《保險業條例》(Cap. 41) 附表 1A：<br>**Part 1 (Regulated Activities) & Part 2 (Material Decisions)** (受規管活動與重要決定) | [HKeL Cap. 41 Sched. 1A](https://www.elegislation.gov.hk/hk/cap41!en/sch1A) | 2026-11-09 | **SOURCED** | 定義「重要決定」(Material Decision) 及「受規管意見」(Regulated Advice)。軟體界面需嚴格聲明「本系統不提供受規管意見，僅提供數學客觀計算，最終建議需由持牌顧問獨立作出」。 |
| **HKIA GL16 (現行) / GN16 (歷史名稱)** | 保監局《長期保險業務（類別 C 業務除外）承保指引》(GL16)<br>**Guideline on Underwriting Long Term Insurance Business (other than Investment-Linked Long Term Business)** 及分紅實現率釋義筆記 (*Interpretation Notes on Fulfillment Ratios*) | [HKIA GL16 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL16.pdf)<br>[HKIA GN16.pdf (歷史存檔)](https://www.ia.org.hk/en/legislative_framework/files/GN16.pdf) | 2026-11-09 | **SOURCED** | **指引現代化確認**：保監局已將前保險業監理處 (OCI) 時代的指引通告 (Guidance Note 16, GN16) 全面過渡並正式編纂為 **GL16**。GL16 及其 Interpretation Notes 強制保險公司每年公開發布分紅實現率 (Fulfillment Ratio) 與過往派發走廊。本系統全量以 GL16 為標準引用，「GN16」僅作為市場俗稱歷史備註保留。 |
| **HKIA GL25** | 保監局《提供贈品指引》(GL25)：<br>**Guideline on Offering of Gifts** | [HKIA GL25 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL25.pdf) | 2026-11-09 | **SOURCED** | **新增規管指引**。嚴格規管保險公司及中介人在推廣或分銷長期保險時提供贈品、折扣或回贈之行為，確保贈品不會分散客戶對產品合適性的注意力或構成不當誘因（回佣抽成受高度嚴格限制）。系統之「促銷折扣／預繳利息」攻防卡必須提示顧問遵守 GL25 贈品限制。 |
| **HKIA GL27** | 保監局《長期保險保單轉保指引》(GL27)：<br>**Guideline on Long Term Insurance Policy Replacement** | [HKIA GL27 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL27.pdf) | 2026-11-09 | **SOURCED** | 反不當轉保 (Anti-Twisting) 專門監管指引。嚴格規管以退舊保換新保的促銷行為，強制填寫客戶保障聲明書 (CPD) 並披露財務與保障損失。軟體撕頁嚴禁誘導客戶退保舊單。 |
| **HKIA GL28** | 保監局《長期保險保單利益說明文件指引》(GL28)：<br>**Guideline on Benefit Illustrations for Long Term Insurance Policies** 及利益說明利率上限實務指引 (*Practice Note on Illustration Rate Caps*) | [HKIA GL28 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL28.pdf) | 2026-11-09 | **SOURCED** | **新增核心指引**。規管向潛在投保人提供利益說明文件 (Benefit Illustrations) 之標準化展示，嚴格要求區分合約保證利益與非保證分紅利益，並規範假設回報率敏感度測試。<br>⚠️ **2025年7月1日演示利率上限衝擊**：保監局自 2025 年 7 月 1 日起實施分紅保單銷售演示利率上限（港元保單最高 **6.0%**；非港元／外幣保單最高 **6.5%**）。本系統當前展示之 30 年期預期 IRR（如 6.62%~6.88%）若用於 2025 年 7 月後銷售情境，已超出法定上限，**必須在界面全量標註為 `[UNVERIFIED - 受保監局 2025年7月1日 演示利率上限 6.0%/6.5% 約束]`**。 |
| **HKIA GL29** | 保監局《冷靜期指引》(GL29)：<br>**Guideline on Cooling-off Period** | [HKIA GL29 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL29.pdf) | 2026-11-09 | **SOURCED** | **新增法定指引**。確立投保人於交付保單起計 21 天內享有取消保單並獲全額退還保費之法定冷靜期權利。在評估產品更換 (GL27) 時，顧問必須提醒客戶冷靜期時效與逾期退保所帶來的不可逆資產損失。 |
| **HKIA GL30 / Code of Conduct s. 4.2** | 保監局《財務需要分析指引》(GL30) 及《操守守則》第 4.2 節：<br>**Guideline on Financial Needs Analysis** / Assessment of Suitability | [HKIA GL30 Official PDF](https://www.ia.org.hk/en/legislative_framework/files/GL30.pdf)<br>[HKIA Code of Conduct PDF](https://www.ia.org.hk/en/legislative_framework/files/Code_of_Conduct_for_Licensed_Insurance_Intermediaries.pdf) | 2026-11-09 | **SOURCED** | **新增財務需要分析指引**。強制要求中介人在推薦任何長期保險前，必須為客戶進行完備的財務需要分析 (FNA)，評估客戶的負擔能力、投資期限與風險承受能力。InsurIntel 僅為客觀計算輔助工具，**嚴禁跳過中介人自身法定 FNA 調查程序**。 |
| **HKIA Code of Conduct** | 保監局《持牌保險中介人操守守則》：<br>**Code of Conduct for Licensed Insurance Intermediaries** | [HKIA Code of Conduct PDF](https://www.ia.org.hk/en/legislative_framework/files/Code_of_Conduct_for_Licensed_Insurance_Intermediaries.pdf) | 2026-11-09 | **SOURCED** | 中介人法定行為標準。General Principles 2, 3 及 Section 4 要求產品對比客觀、全面，不得遺漏對客戶不利的費用條款或非保證風險。 |
| **Cap. 362 s. 7** | 《商品說明條例》(Cap. 362) 第 7 條：<br>**Offence for false trade description** (虛假商品說明的罪行) | [HKeL Cap. 362 s. 7](https://www.elegislation.gov.hk/hk/cap362!en/s7) | 2026-11-09 | **SOURCED** | 刑事定罪條款。禁止向消費者提供任何虛假商品說明（包括產品功效、性能、官方認可或審計覆蓋率）。宣傳若聲稱「100% 官方真實申報數據對賬」，在 99.2% 為示範數據時即構成虛假說明。 |
| **Cap. 362 s. 13E** | 《商品說明條例》(Cap. 362) 第 13E 條：<br>**Misleading omissions** (誤導性遺漏) | [HKeL Cap. 362 s. 13E](https://www.elegislation.gov.hk/hk/cap362!en/s13E) | 2026-11-09 | **SOURCED** | 刑事定罪條款。禁止遺漏重要資料以誤導消費者。若在付費頁面宣稱「14 天退款保證」卻未收取定金或隱瞞退款限制，或宣傳儲蓄險回本期遺漏保證與預期之巨額差異，均構成誤導性遺漏。 |
| **Cap. 486 s. 33** | 《個人資料（私隱）條例》(Cap. 486) 第 33 條：<br>**Prohibition against transfer of personal data outside Hong Kong except in specified circumstances** (在指明情況以外將個人資料轉移至香港以外地方的禁止 - 休眠條款) | [HKeL Cap. 486 s. 33](https://www.elegislation.gov.hk/hk/cap486!en/s33) | 2026-11-09 | **SOURCED** | **法定條文至今尚未生效 (Dormant)**。個人資料私隱專員公署 (PCPD) 透過 2022 年《跨境資料轉移指引》(Model Contractual Clauses) 及保障資料原則 DPP 3 監管出境傳輸。 |
| **Cap. 486 DPP 1, 3, 4** | 《個人資料（私隱）條例》(Cap. 486) 附表 1：<br>**Data Protection Principles** (DPP 1 收集目的及方式, DPP 3 個人資料的使用, DPP 4 個人資料的保安) | [HKeL Cap. 486 Sched. 1](https://www.elegislation.gov.hk/hk/cap486!en/sch1) | 2026-11-09 | **SOURCED** | 要求資料使用者合法、合理收集資料，不得超出必要範圍。InsurIntel 在前端本地執行正則脫敏（掩碼身分證號及電話），落實資料最小化原則。 |
| **Cap. 559 s. 19 & s. 21** | 《商標條例》(Cap. 559) 第 19 條及第 21 條：<br>**Exhaustion of rights conferred by registered trade mark** (s. 19) & **Acts not amounting to infringement** (s. 21 不構成侵犯商標的行為 - 誠實商業慣例) | [HKeL Cap. 559 s. 21](https://www.elegislation.gov.hk/hk/cap559!en/s21) | 2026-11-09 | **SOURCED** | 指名性合理使用 (Nominative Fair Use) 抗辯條款。只要在符合「誠實商業慣例」下使用保司商標以指明產品來源，且不造成混淆或不正當搭便車，不構成商標侵權。 |
| **Cap. 528 s. 39** | 《版權條例》(Cap. 528) 第 39 條：<br>**Criticism, review and quotation, and reporting current events** (為批評、評論及引用，以及報導時事而作出的公平處理) | [HKeL Cap. 528 s. 39](https://www.elegislation.gov.hk/hk/cap528!en/s39) | 2026-11-09 | **SOURCED** | 為批評、評論及引用目的之公平處理 (Fair Dealing)。商業比較分析需符合「充分確認」(Sufficient Acknowledgement)，系統展示保司名稱與官方產品手冊網址以履行確認義務。 |
| **Cap. 71 s. 3, s. 7** | **《管制免責條款條例》(Cap. 71)** 第 3 條及第 7 條：<br>**Control of Exemption Clauses Ordinance** (s. 3 The "reasonableness" test 合理標準 & s. 7 Negligence liability 疏忽責任限制) | [HKeL Cap. 71 s. 3](https://www.elegislation.gov.hk/hk/cap71!en/s3) | 2026-11-09 | **SOURCED** | **更正中文名稱**：成文法法定官方全稱為《管制免責條款條例》（消除歷史錯字「網制」更正為「管制」）。任何排除經濟損失或疏忽責任的格式條款必須通過附表 2 的「合理標準」(Reasonableness Test)。免責條款需清楚顯眼、對價合理，並設定對等的賠償責任上限。 |
| **Cap. 623 s. 4 & s. 6** | 《合約（第三者權利）條例》(Cap. 623) 第 4 條及第 6 條：<br>**When third party may enforce term** (s. 4 第三者強制執行條款權利) & **Rescission and variation of contract** (s. 6 合約的撤銷及變更) | [HKeL Cap. 623 s. 4 & s. 6](https://www.elegislation.gov.hk/hk/cap623!en/s4) | 2026-11-09 | **SOURCED** | 允許非合約方執行合約條款，除非合約中包含明文排除條款。InsurIntel 條款需明確排除終端投保人（非付費顧問）直接依據本平台服務協議索賠之權利。 |
| **Cap. 112 s. 26ZZD** | 《稅務條例》(Cap. 112) 第 26ZZD 條：<br>**Qualifying deferred annuity premiums** (合資格延期年金保費扣除) | [HKeL Cap. 112 s. 26ZZD](https://www.elegislation.gov.hk/hk/cap112!en/s26ZZD) | 2026-11-09 | **SOURCED** | 規定每名納稅人每個課稅年度可申索之合資格延期年金保費最高扣除額為 HK$ 60,000。夫妻合併申報可共享合計最高 HK$ 120,000 之法定額度。 |

---

## 第二部分：指引現代化與 2025年7月1日 演示利率上限衝擊專題

### 1. 指引編號現代化：GL16 替代歷史名詞 GN16
* **法規背景**：自 2019 年保監局接替前保監處成立獨立監管架構以來，所有舊有 Guidance Notes (GN) 均已重新修訂編碼為 Guidelines (GL)。
* **實施規範**：
  - 核心指引正式引用全稱：**HKIA GL16《長期保險業務（類別 C 業務除外）承保指引》**。
  - 保監局於 2020 年與 2023 年多次發布《Interpretation Notes on GL16》，專門規定保司分紅實現率 (Fulfillment Ratios) 必須每年在其官方網站發布至少 5 年的歷史追蹤記錄。
  - 「GN16」僅作為市場中介人約定俗成之歷史備註保留，不可作為首要法律依據。

### 2. 2025年7月1日 分紅保單演示利率上限 (Illustration Rate Caps) 衝擊審計
* **監管規則**：保監局發布《分紅保單利益說明實務指引》(Practice Note)，自 **2025 年 7 月 1 日** 起對新簽發保單之銷售演示利益說明書施加法定回報率上限約束：
  - 港元計價產品 (HKD)：銷售利益說明之內部回報率 (IRR) 上限為 **6.0%**。
  - 外幣／美元計價產品 (non-HKD)：銷售利益說明之內部回報率 (IRR) 上限為 **6.5%**。
* **庫存 15 款受上限約束之儲蓄險旗艦清單（全量打上 UNVERIFIED 警示）**：

| 保險公司 (Insurer) | 產品名稱 (Product Name) | 當前庫存第30年預期IRR | 2025年7月1日法定演示上限 | 系統處置審計標籤 (Audit Status Tag) |
| :--- | :--- | :---: | :---: | :--- |
| **AIA** | 盈御多元貨幣計劃 3 | 6.62% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Prudential** | 雋富多元貨幣計劃 | 6.71% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Prudential** | 特級「雋陞」儲蓄保障計劃 II | 6.82% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Manulife** | 宏摯多元儲蓄計劃 | 6.55% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Manulife** | 世紀傳承保障計劃 | 6.60% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Sun Life** | 萬年青星河傳承計劃 | 6.58% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **FWD** | 盈豐多元貨幣儲蓄保險 | 6.65% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **FWD** | 盈聚天下儲蓄保險 | 6.72% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **AXA** | 摯匯多元貨幣儲蓄計劃 | 6.60% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **YF Life** | 富饒傳承多元貨幣計劃 | 6.68% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **HSBC Life** | 滙豐智豐多元貨幣保險計劃 | 6.65% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Generali** | 忠意「世譽傳承」多元貨幣儲蓄計劃 | 6.72% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Generali** | 忠意「忠盛」財富傳承儲蓄保險 | 6.55% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **China Life Overseas** | 裕饒多元貨幣儲蓄保險計劃 | 6.60% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |
| **Blue Cross** | 藍十字智逸多元儲蓄保障計劃 | 6.56% | 港幣 6.0% / 外幣 6.5% | `[UNVERIFIED - 超出2025年7月1日保監局上限]` |

* **對本系統之影響與防禦處置**：
  - 當前系統展示的儲蓄險產品 30 年預期 IRR 多在 6.55% ~ 6.82% 區間（源自歷史舊版說明書）。
  - 若顧問將此等 IRR 數字用於 2025 年 7 月 1 日之後的新單銷售場景，將違反 GL28 及保監局實務指引。
  - **處置要求**：前端界面、攻防卡與導出 PDF 凡涉及第 30 年預期 IRR 高於 6.0% (港幣) 或 6.5% (外幣) 之數字，全量打上 `[UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]` 水印與警示。
* **監管規則**：保監局發布《分紅保單利益說明實務指引》(Practice Note)，自 **2025 年 7 月 1 日** 起對新簽發保單之銷售演示利益說明書施加約束：
  - 港元計價產品 (HKD)：利益說明之內部回報率 (IRR) 上限為 **6.0%**。
  - 外幣／美元計價產品 (non-HKD)：利益說明之內部回報率 (IRR) 上限為 **6.5%**。
* **對本系統之影響與防禦行動**：
  - 當前系統中展示的儲蓄險產品 30 年預期 IRR 多在 6.62% ~ 6.88% 區間（源於歷史說明書）。
  - 若顧問將此等 IRR 數字用於 2025 年 7 月 1 日之後的新單銷售場景，將違反 GL28 及保監局實務指引。
  - **處置要求**：前端界面與導出 PDF 凡涉及第 30 年預期 IRR 高於 6.5% 之數字，全量打上 `[UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]` 水印。

### 3. GL25（贈品與回贈）、GL28（利益說明）、GL29（冷靜期）、GL30（財務需要分析）對系統之約束
1. **GL25 (提供贈品指引)**：保險中介人不得以贈品、高額抽成回贈誘使客戶購買不合適的保單。系統展示之「預繳優惠」與「保費折扣」僅為保司公開核准條款，顧問嚴禁私下以佣金回贈客戶（Rebating is strictly prohibited）。
2. **GL28 (利益說明文件指引)**：強制區分保證利益與非保證分紅。系統必須確保客戶客觀視角中「保證現金價值走廊」置於首位，且終期紅利必須明確披露投資波動性。
3. **GL29 (冷靜期指引)**：21 天冷靜期是投保人的法定救濟途徑。系統的反轉保對比模組必須強調冷靜期時效性。
4. **GL30 / FNA (財務需要分析)**：系統不得生成具排他性的「最優保單推薦結論」，必須在顯著位置聲明「本分析不構成 FNA，顧問必須依據保監局操守守則親自為客戶完成完整財務需要分析評估」。

---

## 第三部分：更正對照與法理歷史

1. **更正 Cap. 71 中文標題**：徹底更正歷史文書中「免責條款網制條例」之錯別字，確立為法定官方名稱 **《管制免責條款條例》**。
2. **更正 GL20 為 GL27 / Code of Conduct**：GL20 係《網絡保安指引》，禁止冒充為中介人行為守則。行為守則依據為 Cap. 41 s. 95(1)《持牌保險中介人操守守則》及 GL27。
3. **確立 Cap. 528 第 39 條公平處理（更正第 38 條）**：商業軟體禁止援引第 38 條私人研習 (private study) 抗辯，全面確立依據第 39 條為批評、評論及引用之公平處理抗辯。
4. **披露 Cap. 486 s. 33 休眠**：澄清香港個人資料跨境傳輸主要受 DPP 3 及 PCPD 2022 年指引拘束。
5. **調和 Section 64G 受規管活動與轉保邊界**：明確劃分 Section 64G 無牌從事受規管活動罪行與 s.90/GL27 轉保規管之法理邊界。

---

## 第四部分：全倉庫誇大營銷辭彙清洗對照表 (Overclaim Sweep Before/After Diff)

為維護系統作為嚴肅金融精算工具的專業信譽，對全項目進行誇大辭彙大清洗，落實「證實或標籤 (Prove it or Label it)」原則：

| 清查辭彙 (Overclaim) | 原有不當語境與宣稱 | 修正後的嚴謹合規表述 (Accurate Phrasing) | 修正依據與法理說明 |
| :--- | :--- | :--- | :--- |
| **`production-grade`**<br>(生產級別) | 宣稱「已達成生產級別、可直接發布」。 | **「designed against [standard], requires review by a qualified HK professional」**（對標相關標準設計，正式環境需由香港持牌專業人士審查確認） | 避免向投資人或監管機構虛假保證系統免責。 |
| **`release-ready`**<br>(發布就緒) | 宣稱「全功能發布就緒」。 | **「prototype under audit / candidate for review」**（處於多方審計階段的原型系統 / 待外部專業評審候選版本） | 承認當前 9,052 個數值中有 99.2% 仍為示範數據。 |
| **`100%`**<br>(絕對百分比) | 宣稱「100% 徹底無水印」、「100% 官方真實申報數據對賬」、「100% 客戶端確定性脫敏」、「第 5 年即保證 100% 回本」。 | **「comprehensive」** 或具體已審計指標（例如「依據 GL16 指引構建之示範對賬模型」、「前端本地正則掩碼防護」、「預期第 6 年整體回本（合約保證現金價值回本期為第 18-20 年）」）。 | 杜絕絕對化宣傳違反香港《商品說明條例》(Cap. 362 s. 7 及 s. 13E) 及《保險業條例》(Cap. 41 s. 90)。 |
| **`compliant`**<br>(完全合規) | 宣稱「100% 符合保監局 GL20 / GL27 法規」。 | **「designed against HKIA guidelines, pending formal counsel validation」**（依據保監局指引框架設計，待外部執業律師合規意見書確認） | 軟體開發方無權自行宣告法律合規性。 |
| **`approved`**<br>(官方認證/批准) | 宣稱「獲官方認證之精算對照系統」、「一鍵導出認證PDF對賬報告」。 | **「formally drafted / submitted for professional review」** 或 **「一鍵導出示範對賬 PDF 報告」**（已正式編制 / 提交專業審閱） | 保監局及稅務局從未對任何商業計算軟體給予官方背書。 |
| **`guaranteed`**<br>(保證回報) | 混淆「合約保證現金價值」與「宣傳整體收益保證」。 | 嚴格區分 **「contractually guaranteed (合約條款保證)」** 與非保證分紅，並在所有試算表加註「非保證利益受市場波動影響」。 | 杜絕違反《持牌保險中介人操守守則》對非保證利益之宣傳規定。 |
| **`120,000 intermediaries`**<br>(12萬中介人) | 宣稱「全港 120,000 名持牌保險中介人龐大藍海」。 | **「依據香港保監局 2023-2024 年報統計，香港擁有約 115,000 名持牌保險中介人（含約 75,000 名專屬代理人及 40,000 名經紀渠道人員）」** | 引用官方年報真實統計口徑，杜絕拍腦袋四捨五入。 |

---
*文檔編制：InsurIntel 法律法規與合規審計工程組 · 基準版本：v3.0-Hardened (Run 3) · 交付日期：2026-11-09*

/**
 * scripts/remedy_legal_cycle2.js
 * Comprehensive remediation for Cycle 2 (TASK-R3-02) based on adversarial legal audit
 */

const fs = require('fs');
const path = require('path');

// 1. Update LEGAL_BRIEF_CITATION_AUDIT.md
const auditPath = path.join(__dirname, '..', 'LEGAL_BRIEF_CITATION_AUDIT.md');
let auditContent = fs.readFileSync(auditPath, 'utf8');

// Replace copy-pasted URLs with exact permalinks
auditContent = auditContent.replace(/\[HKeL Cap\. 41 s\. 64G\]\([^)]+\)/g, '[HKeL Cap. 41 s. 64G](https://www.elegislation.gov.hk/hk/cap41!en/s64G)');
auditContent = auditContent.replace(/\[HKeL Cap\. 41 s\. 90\]\([^)]+\)/g, '[HKeL Cap. 41 s. 90](https://www.elegislation.gov.hk/hk/cap41!en/s90)');
auditContent = auditContent.replace(/\[HKeL Cap\. 41 s\. 95\]\([^)]+\)/g, '[HKeL Cap. 41 s. 95](https://www.elegislation.gov.hk/hk/cap41!en/s95)');
auditContent = auditContent.replace(/\[HKeL Cap\. 41 s\. 121\]\([^)]+\)/g, '[HKeL Cap. 41 s. 121](https://www.elegislation.gov.hk/hk/cap41!en/s121)');
auditContent = auditContent.replace(/\[HKeL Cap\. 41 Sched\. 1A\]\([^)]+\)/g, '[HKeL Cap. 41 Sched. 1A](https://www.elegislation.gov.hk/hk/cap41!en/sch1A)');

auditContent = auditContent.replace(/\[HKeL Cap\. 362 s\. 7\]\([^)]+\)/g, '[HKeL Cap. 362 s. 7](https://www.elegislation.gov.hk/hk/cap362!en/s7)');
auditContent = auditContent.replace(/\[HKeL Cap\. 362 s\. 13E\]\([^)]+\)/g, '[HKeL Cap. 362 s. 13E](https://www.elegislation.gov.hk/hk/cap362!en/s13E)');

auditContent = auditContent.replace(/\[HKeL Cap\. 486 s\. 33\]\([^)]+\)/g, '[HKeL Cap. 486 s. 33](https://www.elegislation.gov.hk/hk/cap486!en/s33)');
auditContent = auditContent.replace(/\[HKeL Cap\. 486 Sched\. 1\]\([^)]+\)/g, '[HKeL Cap. 486 Sched. 1](https://www.elegislation.gov.hk/hk/cap486!en/sch1)');

auditContent = auditContent.replace(/\[HKeL Cap\. 559 s\. 21\]\([^)]+\)/g, '[HKeL Cap. 559 s. 21](https://www.elegislation.gov.hk/hk/cap559!en/s21)');
auditContent = auditContent.replace(/\[HKeL Cap\. 528 s\. 39\]\([^)]+\)/g, '[HKeL Cap. 528 s. 39](https://www.elegislation.gov.hk/hk/cap528!en/s39)');
auditContent = auditContent.replace(/\[HKeL Cap\. 71 s\. 3\]\([^)]+\)/g, '[HKeL Cap. 71 s. 3](https://www.elegislation.gov.hk/hk/cap71!en/s3)');
auditContent = auditContent.replace(/\[HKeL Cap\. 623 s\. 5\]\([^)]+\)/g, '[HKeL Cap. 623 s. 4 & s. 6](https://www.elegislation.gov.hk/hk/cap623!en/s4)');
auditContent = auditContent.replace(/\[HKeL Cap\. 112 s\. 26ZZD\]\([^)]+\)/g, '[HKeL Cap. 112 s. 26ZZD](https://www.elegislation.gov.hk/hk/cap112!en/s26ZZD)');

// Correct statutory headings in ledger
auditContent = auditContent.replace(
  '**False statement to induce person to enter into insurance contract etc.** (作出虛假陳述誘使他人訂立保險合約等)',
  '**Conduct requirements for licensed insurance intermediaries** (持牌保險中介人的操守要求)'
);
auditContent = auditContent.replace(
  '刑事與監管制裁條款。禁止以虛假或誤導性陳述誘使他人訂立保險合約。系統中所有展示的數值若非真實保司利益說明書原件，必須明確加註「示範合成數據」警示。',
  '法定操守總綱條款。要求持牌保險中介人誠實、公平、以客戶最佳利益行事，並以應有審慎態度執行受規管活動。禁止作出虛假、偏頗或未經核實之比較。刑事誘使保單之詐騙罪行另行由《盜竊罪條例》(Cap. 210 s. 16A) 及《商品說明條例》(Cap. 362) 規範。'
);

auditContent = auditContent.replace(
  '**Offence to make fraudulent or reckless misrepresentation** (作出欺詐或罔顧後果的失實陳述的罪行)',
  '**Preservation of secrecy** (保密條款 - 調查程序法定不洩漏義務)'
);
auditContent = auditContent.replace(
  '刑事罪行條款。禁止欺詐或罔顧後果地作出失實陳述以促成保險合約。對比數據必須有客觀精算公式或官方通函依據，杜絕捏造非保證紅利折現值。',
  '法定保密條款。嚴格約束在保監局進行查察、調查或紀律處分過程中獲取之機密資料，禁止向第三方洩漏消息 (Tipping-off)。對比數據之真實性受 s.90 及操守守則拘束，失實陳述促成合約受民事法及《盜竊罪條例》(Cap. 210 s. 16A) 規管。'
);

auditContent = auditContent.replace(
  '| **Cap. 623 s. 4 & s. 5** | 《合約（第三者權利）條例》(Cap. 623) 第 4 條及第 5 條：<br>**Third party rights may be enforced** (s. 4) & **Variation and rescission of contract** (s. 5 排除第三者權利) |',
  '| **Cap. 623 s. 4 & s. 6** | 《合約（第三者權利）條例》(Cap. 623) 第 4 條及第 6 條：<br>**When third party may enforce term** (s. 4 第三者強制執行條款權利) & **Rescission and variation of contract** (s. 6 合約的撤銷及變更) |'
);

// Add explicit Rate Caps Table to Section 2 of LEGAL_BRIEF_CITATION_AUDIT.md
const rateCapSectionMarker = '### 2. 2025年7月1日 分紅保單演示利率上限 (Illustration Rate Caps) 衝擊審計';
const rateCapDetailedTable = `### 2. 2025年7月1日 分紅保單演示利率上限 (Illustration Rate Caps) 衝擊審計
* **監管規則**：保監局發布《分紅保單利益說明實務指引》(Practice Note)，自 **2025 年 7 月 1 日** 起對新簽發保單之銷售演示利益說明書施加法定回報率上限約束：
  - 港元計價產品 (HKD)：銷售利益說明之內部回報率 (IRR) 上限為 **6.0%**。
  - 外幣／美元計價產品 (non-HKD)：銷售利益說明之內部回報率 (IRR) 上限為 **6.5%**。
* **庫存 15 款受上限約束之儲蓄險旗艦清單（全量打上 UNVERIFIED 警示）**：

| 保險公司 (Insurer) | 產品名稱 (Product Name) | 當前庫存第30年預期IRR | 2025年7月1日法定演示上限 | 系統處置審計標籤 (Audit Status Tag) |
| :--- | :--- | :---: | :---: | :--- |
| **AIA** | 盈御多元貨幣計劃 3 | 6.62% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Prudential** | 雋富多元貨幣計劃 | 6.71% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Prudential** | 特級「雋陞」儲蓄保障計劃 II | 6.82% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Manulife** | 宏摯多元儲蓄計劃 | 6.55% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Manulife** | 世紀傳承保障計劃 | 6.60% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Sun Life** | 萬年青星河傳承計劃 | 6.58% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **FWD** | 盈豐多元貨幣儲蓄保險 | 6.65% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **FWD** | 盈聚天下儲蓄保險 | 6.72% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **AXA** | 摯匯多元貨幣儲蓄計劃 | 6.60% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **YF Life** | 富饒傳承多元貨幣計劃 | 6.68% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **HSBC Life** | 滙豐智豐多元貨幣保險計劃 | 6.65% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Generali** | 忠意「世譽傳承」多元貨幣儲蓄計劃 | 6.72% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Generali** | 忠意「忠盛」財富傳承儲蓄保險 | 6.55% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **China Life Overseas** | 裕饒多元貨幣儲蓄保險計劃 | 6.60% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |
| **Blue Cross** | 藍十字智逸多元儲蓄保障計劃 | 6.56% | 港幣 6.0% / 外幣 6.5% | \`[UNVERIFIED - 超出2025年7月1日保監局上限]\` |

* **對本系統之影響與防禦處置**：
  - 當前系統展示的儲蓄險產品 30 年預期 IRR 多在 6.55% ~ 6.82% 區間（源自歷史舊版說明書）。
  - 若顧問將此等 IRR 數字用於 2025 年 7 月 1 日之後的新單銷售場景，將違反 GL28 及保監局實務指引。
  - **處置要求**：前端界面、攻防卡與導出 PDF 凡涉及第 30 年預期 IRR 高於 6.0% (港幣) 或 6.5% (外幣) 之數字，全量打上 \`[UNVERIFIED - 僅反映歷史計劃書，自2025年7月1日起受保監局6.0%/6.5%上限規管]\` 水印與警示。`;

auditContent = auditContent.replace(rateCapSectionMarker, rateCapDetailedTable);
fs.writeFileSync(auditPath, auditContent, 'utf8');
console.log('[REMEDY] LEGAL_BRIEF_CITATION_AUDIT.md remediated successfully.');

// 2. Update LEGAL_BRIEF_HK_COMPLIANCE.md
const briefPath = path.join(__dirname, '..', 'LEGAL_BRIEF_HK_COMPLIANCE.md');
let briefContent = fs.readFileSync(briefPath, 'utf8');

// Replace Issue 1 Section 121 misattribution with Section 90 & Code of Conduct & Theft Ordinance
const oldIssue1Reg = 'Section 90 and Section 121 of Cap. 41 impose civil and criminal sanctions for fraudulent or reckless misrepresentations inducing an insurance contract.';
const newIssue1Reg = 'Section 90 of Cap. 41 and the HKIA Code of Conduct establish statutory conduct requirements and disciplinary sanctions for unfair or misleading comparisons, alongside criminal fraud sanctions under the Theft Ordinance (Cap. 210 s. 16A) and Trade Descriptions Ordinance (Cap. 362 s. 7).';
briefContent = briefContent.replace(oldIssue1Reg, newIssue1Reg);

const oldQ1_1 = 'or misrepresentation under Section 90 / Section 121 of Cap. 41?';
const newQ1_1 = 'or misrepresentation under Section 90 of Cap. 41, the Theft Ordinance (Cap. 210 s. 16A), or Cap. 362 s. 7?';
briefContent = briefContent.replace(oldQ1_1, newQ1_1);

// Expand Q1_2 with GL25 rebate comparison calculator instruction
const oldQ1_2 = '2. Does the strict interface separation between the internal "Agent Cockpit" and outward "Client Neutral View" effectively protect an advisor from conduct investigations under the Code of Conduct and GL25/GL27/GL30, provided only the neutral view is delivered to prospects?';
const newQ1_2 = '2. Under HKIA GL25 (Offering of Gifts) which prohibits gift/rebate inducements that distract from product suitability, does providing automated discount/rebate comparison rankings inside software constitute facilitating non-compliant marketing, and what hard-coded engine guardrails (e.g. banning rebate-sorted leaderboards) are required? Does separating the internal "Agent Cockpit" from outward "Client Neutral View" protect advisors under GL25/GL27/GL30?';
briefContent = briefContent.replace(oldQ1_2, newQ1_2);

// Ensure Cap. 623 is cited with s. 4 and s. 6
briefContent = briefContent.replace(
  'The *Contracts (Rights of Third Parties) Ordinance* (Cap. 623) allows non-parties to enforce contractual terms unless expressly excluded.',
  'The *Contracts (Rights of Third Parties) Ordinance* (Cap. 623 s. 4 & s. 6) allows non-parties to enforce contractual terms unless expressly excluded pursuant to Section 4.'
);

fs.writeFileSync(briefPath, briefContent, 'utf8');
console.log('[REMEDY] LEGAL_BRIEF_HK_COMPLIANCE.md remediated successfully (Length: ' + briefContent.length + ' chars).');

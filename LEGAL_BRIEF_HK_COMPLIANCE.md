# LEGAL INSTRUCTIONS BRIEF: REGULATORY COMPLIANCE AUDIT
## For the Attention of: Qualified Hong Kong Insurance & Technology Legal Counsel
**Matter**: Regulatory Compliance, Data Privacy, Intellectual Property & Intermediary Licensing Review for InsurIntel HK  
**Instructing Party**: Technology Operations, InsurIntel HK  
**Governing Law**: Laws of the Hong Kong Special Administrative Region (HKSAR)  
**Date**: 9 November 2026  
**Document Classification**: Privileged & Confidential (Instructions for Formal Legal Opinion)  

> [!WARNING]
> **Legal Disclaimer / Notice to Counsel**: Citations are AI-assisted and unverified; counsel to confirm.

---

### PRELIMINARY INSTRUCTIONS TO COUNSEL
1. **Conflict Check**: Counsel is requested to confirm immediately that no conflict of interest exists preventing counsel from advising against authorized Hong Kong long-term insurers (including AIA, Prudential, Manulife, Sun Life, FWD).
2. **Timetable**: Counsel is requested to provide a preliminary written memorandum within 10 business days.

---

### 1. BACKGROUND & SOFTWARE ARCHITECTURE
InsurIntel HK (the "Platform") is an offline-capable Progressive Web Application (PWA) developed as a B2B market intelligence analytics engine for licensed insurance intermediaries (agents and brokers) in Hong Kong. 
The Platform provides:
1. **Actuarial Benchmark Engine**: Side-by-side comparative grids of 99 authorized long-term insurance policies across 5 categories.
2. **Statutory Fulfillment Reconciliation**: Historical fulfillment ratio tracking based strictly on public disclosures mandated by HKIA Guideline GN16 / GL16.
3. **Dual-Mode Architectural Separation**:
   - **Agent Tactical Cockpit (Internal HUD)**: Private advisor workspace for preparation and objection handling.
   - **Client Neutral View (Outward Tear-Sheet)**: Objective presentation stripped of aggressive combat vocabulary, presenting statutory Guaranteed vs Non-Guaranteed values neutrally.
4. **Proposal Scanner & PII Scrubbing**: Automated scanner using in-browser deterministic regex tokenization to redact Hong Kong Identity Card numbers (`[A-Z]{1,2}[0-9]{6}\([0-9A]\)`), phone numbers, names, and policy numbers locally before text parsing.

---

### 2. SIX FORMAL QUESTIONS FOR COUNSEL

#### Issue 1: Product Comparison & Policy Replacement / Twisting Rules (Cap. 41 & HKIA GL27)
* **Regulatory Context**: Under the statutory *Code of Conduct for Licensed Insurance Intermediaries* (Cap. 41 s. 95(1); General Principles 2 & 3), intermediaries must ensure product comparisons are fair and balanced. Under HKIA **GL27** (*Guideline on Long Term Insurance Policy Replacement*), intermediaries must strictly avoid improper policy replacement ("twisting") and make full disclosure of financial implications via the Customer Protection Declaration (CPD). Section 90 and Section 121 of Cap. 41 impose civil and criminal sanctions for fraudulent or reckless misrepresentations inducing an insurance contract.
* **Platform Design**: The "Client Neutral View" displays guaranteed breakeven years and GN16 fulfillment history alongside a prominent banner: *"This tear-sheet provides objective parameter comparisons from public regulatory filings and does not constitute an inducement, advice, or recommendation to surrender, borrow against, or replace any existing policy."*
* **Questions for Counsel**:
  1. Does automated calculation and display of comparative metrics (such as guaranteed breakeven periods or GN16 fulfillment deficits) expose the software vendor or intermediary users to regulatory sanction for inciting twisting under GL27 or misleading representation under Section 90 / Section 121 of Cap. 41?
  2. Does the strict interface separation between the internal "Agent Cockpit" and outward "Client Neutral View" effectively protect an advisor from conduct investigations under the Code of Conduct, provided only the neutral view is delivered to prospects?

#### Issue 2: Insurers' Trade Marks & Comparative Product Reviews (Cap. 559 & Cap. 528)
* **Regulatory Context**: The Platform references authorized insurers' trade marks (e.g., AIA, Prudential, Manulife) and official product titles to index comparison tables.
* **Statutory Framework**: Section 19 and Section 21 of the *Trade Marks Ordinance* (Cap. 559) provide that nominative use of a mark to identify goods/services as those of the proprietor does not infringe if in accordance with honest practices. Section 39 of the *Copyright Ordinance* (Cap. 528) provides fair dealing exemptions for criticism, review, and quotation, subject to sufficient acknowledgement.
* **Questions for Counsel**:
  1. Does displaying insurers' brand names, product titles, and direct hyperlinks to official brochures qualify as non-infringing nominative use under Section 21 of Cap. 559, and what specific typographic treatments are required to satisfy "honest commercial practice"?
  2. Does comparative analysis of product parameters in a commercial B2B SaaS platform qualify for fair dealing under Section 39 of Cap. 528, and does referencing the source brochure URL fulfill the statutory requirement for "sufficient acknowledgement"?

#### Issue 3: OCR Scanning of Competitor Proposal Illustrations (IP & Intermediary Covenants)
* **Commercial Context**: Advisor users upload camera snapshots or PDF exports of competitor benefit illustrations for automated data extraction.
* **Questions for Counsel**:
  1. Does an insurance agent bound by standard tied-agency covenants (prohibiting handling competitor materials) breach contractual duties or fiduciary obligations to their appointing principal by scanning illustrations into a third-party analytical tool?
  2. Given that actuarial cash value projection tables are primarily numerical facts, does extracting tabular data via OCR infringe compilation copyright or database rights under Cap. 528, noting the absence of an express statutory Text and Data Mining (TDM) exception under Hong Kong copyright law?

#### Issue 4: Personal Data (Privacy) Ordinance (PDPO Cap. 486) & PCPD AI Regulatory Framework
* **Regulatory Context**: While **Section 33 of Cap. 486 is not yet in operation (dormant)**, the PCPD enforces cross-border transfer standards via the *Guidance on Data Cross-Border Data Transfer* (2022 Model Contractual Clauses), DPP 3, and DPP 4. Furthermore, the PCPD published the *Artificial Intelligence: Model Personal Data Protection Framework* on 11 June 2024, setting rigorous standards for AI procurement, data minimization, and model training opt-outs. All HKID cards (`[A-Z]{1,2}[0-9]{6}\([0-9A]\)`), phone numbers, names, and policy numbers are scrubbed client-side in browser RAM before any cloud dispatch.
* **Questions for Counsel**:
  1. Does local client-side tokenization effectively render the payload "non-personal data" under Section 2(1) of Cap. 486 prior to cloud processing, or does residual context (e.g. commencement date, unique premium amounts) create a lingering re-identification risk?
  2. To align with the PCPD June 2024 Model AI Framework, what specific data processing and non-training covenants must be secured from upstream cloud providers (e.g. Google Gemini Enterprise API), and does the platform act as a "data user" or a "data processor" in relation to uploaded proposals?

#### Issue 5: Platform Disclaimers, Third-Party Rights & Limitation of Liability (Cap. 71 & Cap. 623)
* **Commercial Context**: InsurIntel charges HK$199/month (Advisor Pro) and HK$2,480/month (Agency Team 15-Seat).
* **Statutory Framework**: The *Control of Exemption Clauses Ordinance* (Cap. 71) subjects commercial exclusion clauses to statutory reasonableness tests. The *Contracts (Rights of Third Parties) Ordinance* (Cap. 623) allows non-parties to enforce contractual terms unless expressly excluded.
* **Questions for Counsel**:
  1. Are click-wrap terms excluding indirect/consequential damages and capping total vendor liability to subscription fees paid in the preceding 3 months legally enforceable under the reasonableness requirements of Cap. 71?
  2. How must the platform's Terms of Service and Client Tear-Sheets be structured to expressly exclude third-party enforcement rights under Cap. 623 and negate any common law tortious duty of care (*Hedley Byrne v Heller*) to end-policyholders who view the output?

#### Issue 6: Intermediary Licensing Boundaries & Schedule 1A Regulated Activities (Cap. 41)
* **Regulatory Context**: Under Section 64G of Cap. 41, it is a criminal offence to carry on a "regulated activity" without an insurance intermediary licence. Schedule 1A Part 1 and Part 2 define regulated activities, which include: (i) negotiating/arranging insurance, (ii) inviting/inducing a "material decision" (defined in Schedule 1A Part 2 to include policy application, surrender, or termination), and (iii) giving "regulated advice" (offering opinions or recommendations). InsurIntel operates purely as a software-as-a-service vendor, charging fixed subscription fees with zero commission-sharing and zero policy-binding capability.
* **Questions for Counsel**:
  1. Does generating algorithmic comparison rankings, automated IRR calculations, or pre-scripted WhatsApp sales messages cross the statutory threshold of "giving regulated advice" or "inducing a material decision" under Schedule 1A Part 1, thereby exposing InsurIntel to criminal prosecution under Section 64G?
  2. What explicit operational boundaries and disclaimer mechanics are necessary to ensure that InsurIntel remains strictly classified as an unlicensable technology calculation tool, leaving sole regulated advisory responsibility with the licensed intermediary?

---

### 3. FORMAL DELIVERABLES REQUESTED FROM COUNSEL
Counsel is instructed to deliver:
1. **Written Memorandum of Advice**: Detailed legal reasoning and risk mitigation steps for Questions 1 through 6.
2. **Master Terms of Service & PICS Markup**: Contractual drafting incorporating PCPD 2022 Model Contractual Clauses, Cap. 623 third-party exclusion, and Cap. 71 liability limits.
3. **Statutory Tear-Sheet Legend**: Standardized disclaimer language for the "Client Neutral View" to negate tortious reliance and prevent GL27 twisting allegations.

**Prepared on behalf of InsurIntel HK Technology Operations.**

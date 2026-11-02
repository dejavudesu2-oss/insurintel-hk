"use strict";
/**
 * Adversarial Challenger R2_1 - Empirical Stress Harness for Milestone M_MarketNav
 *
 * Verifies:
 * 1. Combinatorial Exhaustion: All 9 Insurers x 6 Claims = 54 Battle Card Combinations.
 * 2. Absolute Cleanliness: Zero `undefined`, `null`, `NaN`, `NaN%`, or unresolved placeholder templates.
 * 3. Bowtie Virtual Insurer Dedicated Boundaries: Prepayment, Rebate, CI, VHIS, Financing UL, QDAP.
 * 4. Traditional Insurers Sanitization: Inverted VHIS bug eradication, GN16 calculations.
 * 5. Input Adversarial Fuzzing: Whitespace, uppercase, lowercase, mixed case, non-standard strings, malformed types (null, undefined, 0, NaN, bool, obj), XSS injection.
 * 6. DOM Interactivity & Lifecycle Simulation: Selectors, active pill toggling, dual-perspective switching, WhatsApp clipboard fallback, toast timer.
 * 7. Bidirectional Navigation & Dist Asset Parity: Link targets, classnames, suppression in presenter mode, index.html == cafe.html alias check.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_vm_1 = __importDefault(require("node:vm"));
const results = [];
function recordTest(suite, test, fn) {
    const start = performance.now();
    try {
        fn();
        const durationMs = parseFloat((performance.now() - start).toFixed(2));
        results.push({ suite, test, passed: true, durationMs });
        console.log(`[PASS] (${durationMs}ms) ${suite} -> ${test}`);
    }
    catch (err) {
        const durationMs = parseFloat((performance.now() - start).toFixed(2));
        results.push({ suite, test, passed: false, error: err.message, durationMs });
        console.error(`[FAIL] (${durationMs}ms) ${suite} -> ${test}: ${err.message}`);
    }
}
console.log("================================================================================");
console.log("STARTING EMPIRICAL ADVERSARIAL CHALLENGE R2_1: Milestone M_MarketNav");
console.log("Target: templates/mobile_cafe_app.html & All 54 Battle Card Combinations");
console.log("================================================================================");
// Load template and extract script
const cafePath = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
node_assert_1.default.ok(fs_1.default.existsSync(cafePath), "templates/mobile_cafe_app.html must exist");
const cafeHtml = fs_1.default.readFileSync(cafePath, "utf-8");
const scriptMatch = cafeHtml.match(/<script>([\s\S]*?)<\/script>/);
node_assert_1.default.ok(scriptMatch, "mobile_cafe_app.html must contain a valid <script> block");
const scriptCode = scriptMatch[1];
// Helper to create sandbox
function createSandbox() {
    const domElements = {};
    const makeMockElement = (id, tagName = "div") => {
        return {
            id,
            tagName: tagName.toUpperCase(),
            innerHTML: "",
            innerText: "",
            value: "",
            select: () => { },
            style: { display: "block", opacity: "1" },
            className: "",
            classList: {
                classes: new Set(),
                add(c) { this.classes.add(c); },
                remove(c) { this.classes.delete(c); },
                toggle(c, force) {
                    if (force === true) {
                        this.classes.add(c);
                    }
                    else if (force === false) {
                        this.classes.delete(c);
                    }
                    else if (this.classes.has(c)) {
                        this.classes.delete(c);
                    }
                    else {
                        this.classes.add(c);
                    }
                },
                contains(c) { return this.classes.has(c); }
            }
        };
    };
    const registeredIds = [
        "btn-agent-view",
        "btn-client-view",
        "agent-view",
        "client-view",
        "company-pills",
        "claim-pills",
        "agent-title",
        "agent-step-1",
        "agent-step-2",
        "agent-step-3",
        "client-title",
        "client-source",
        "client-desc",
        "client-chart-box",
        "client-chart-title",
        "client-chart-bars",
        "client-table-container",
        "client-table-title",
        "client-table",
        "client-disclaimer",
        "toast",
        "link-morning-slides"
    ];
    for (const id of registeredIds) {
        domElements[id] = makeMockElement(id, id.includes("btn") ? "button" : id.includes("table") ? "table" : "div");
    }
    // Pre-populate mock buttons for pills
    const makePill = (text) => {
        const el = makeMockElement("", "button");
        el.innerText = text;
        el.className = "thumb-pill";
        return el;
    };
    const companyPills = [
        makePill("保誠 Prudential"),
        makePill("友邦 AIA"),
        makePill("宏利 Manulife"),
        makePill("永明 Sun Life"),
        makePill("富衛 FWD"),
        makePill("安盛 AXA"),
        makePill("網上 Bowtie"),
        makePill("中銀人壽 BOC Life"),
        makePill("萬通 YF Life")
    ];
    const claimPills = [
        makePill("5.8% 預繳 / 保證高回報"),
        makePill("首年保費回贈 28%"),
        makePill("癌症再次索償等待期"),
        makePill("自願醫保全數賠償"),
        makePill("保費融資 85% LTV"),
        makePill("QDAP 延期年金總回報")
    ];
    const sandbox = {
        document: {
            getElementById: (id) => domElements[id] || null,
            querySelectorAll: (sel) => {
                if (sel === "#company-pills .thumb-pill")
                    return companyPills;
                if (sel === "#claim-pills .thumb-pill")
                    return claimPills;
                return [];
            },
            createElement: (tag) => makeMockElement("", tag),
            body: {
                appendChild: () => { },
                removeChild: () => { }
            },
            execCommand: () => true
        },
        navigator: {
            clipboard: {
                writeText: async (text) => { }
            }
        },
        console,
        clearTimeout: (t) => clearTimeout(t),
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        alert: (msg) => { },
        addEventListener: () => { }
    };
    sandbox.window = sandbox;
    sandbox.__domElements = domElements;
    sandbox.__companyPills = companyPills;
    sandbox.__claimPills = claimPills;
    node_vm_1.default.createContext(sandbox);
    node_vm_1.default.runInContext(scriptCode, sandbox);
    return { sandbox, context: sandbox };
}
// Instantiate default sandbox
const { sandbox } = createSandbox();
// Canonical list of 9 insurers & 6 claims
const CANONICAL_INSURERS = [
    "保誠 Prudential",
    "友邦 AIA",
    "宏利 Manulife",
    "永明 Sun Life",
    "富衛 FWD",
    "安盛 AXA",
    "純網上虛擬 Bowtie",
    "中銀人壽 BOC Life",
    "萬通 YF Life"
];
const CANONICAL_CLAIMS = [
    "5.8% 預繳",
    "首年保費回贈 28%",
    "癌症再次索償等待期",
    "自願醫保全數賠償",
    "保費融資 85% LTV",
    "QDAP 延期年金總回報"
];
// ============================================================================
// SUITE 1: Combinatorial Exhaustion of 54 Combinations (9 Insurers x 6 Claims)
// ============================================================================
recordTest("Suite 1: Combinatorial 54 Pairs", "Exhaustive evaluation of all 54 pairs", () => {
    let count = 0;
    for (const ins of CANONICAL_INSURERS) {
        for (const clm of CANONICAL_CLAIMS) {
            count++;
            const card = sandbox.getBattleCard(ins, clm);
            node_assert_1.default.ok(card, `Card must be returned for ${ins} x ${clm}`);
            // Verify all 9 text fields are non-empty strings
            const requiredTextFields = [
                "agent_title",
                "agent_step_1",
                "agent_step_2",
                "agent_step_3",
                "client_title",
                "client_source",
                "client_desc",
                "whatsapp_script",
                "disclaimer"
            ];
            for (const field of requiredTextFields) {
                node_assert_1.default.strictEqual(typeof card[field], "string", `${field} must be string in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(card[field].trim().length >= 5, `${field} must have length >= 5 in [${ins}] x [${clm}] (was: "${card[field]}")`);
            }
            // Check chart_bars
            node_assert_1.default.ok(Array.isArray(card.chart_bars), `chart_bars must be an array in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(card.chart_bars.length >= 2, `chart_bars must have >= 2 items in [${ins}] x [${clm}]`);
            for (let i = 0; i < card.chart_bars.length; i++) {
                const bar = card.chart_bars[i];
                node_assert_1.default.ok(typeof bar.label === "string" && bar.label.trim().length > 0, `Bar [${i}] label must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(typeof bar.value === "string" && bar.value.trim().length > 0, `Bar [${i}] value must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.strictEqual(typeof bar.widthPct, "number", `Bar [${i}] widthPct must be number in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(!Number.isNaN(bar.widthPct), `Bar [${i}] widthPct must not be NaN in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(Number.isFinite(bar.widthPct), `Bar [${i}] widthPct must be finite in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(bar.widthPct > 0 && bar.widthPct <= 100, `Bar [${i}] widthPct must be in range (0, 100], got ${bar.widthPct} in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(typeof bar.color === "string" && bar.color.trim().length > 0, `Bar [${i}] color must be non-empty in [${ins}] x [${clm}]`);
            }
            // Check table_rows
            node_assert_1.default.ok(Array.isArray(card.table_rows), `table_rows must be an array in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(card.table_rows.length >= 3, `table_rows must have >= 3 items in [${ins}] x [${clm}]`);
            for (let j = 0; j < card.table_rows.length; j++) {
                const row = card.table_rows[j];
                node_assert_1.default.ok(typeof row.label === "string" && row.label.trim().length > 0, `Row [${j}] label must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(typeof row.value === "string" && row.value.trim().length > 0, `Row [${j}] value must be non-empty in [${ins}] x [${clm}]`);
                node_assert_1.default.strictEqual(typeof row.highlight, "boolean", `Row [${j}] highlight must be boolean in [${ins}] x [${clm}]`);
            }
        }
    }
    node_assert_1.default.strictEqual(count, 54, "Exactly 54 combinations must have been tested");
});
// ============================================================================
// SUITE 2: Zero Forbidden Strings across All 54 Combinations
// ============================================================================
recordTest("Suite 2: Zero Forbidden Strings", "Deep scan for undefined, null, NaN, NaN%, and unresolved templates", () => {
    for (const ins of CANONICAL_INSURERS) {
        for (const clm of CANONICAL_CLAIMS) {
            const card = sandbox.getBattleCard(ins, clm);
            const json = JSON.stringify(card);
            // Check for forbidden substrings
            node_assert_1.default.ok(!json.includes("undefined"), `Forbidden 'undefined' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("null"), `Forbidden 'null' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("NaN"), `Forbidden 'NaN' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("NaN%"), `Forbidden 'NaN%' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("[object Object]"), `Forbidden '[object Object]' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("（純網上"), `Unresolved placeholder '（純網上' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("（無專屬"), `Unresolved placeholder '（無專屬' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("TBD"), `Placeholder 'TBD' found in [${ins}] x [${clm}]`);
            node_assert_1.default.ok(!json.includes("TODO"), `Placeholder 'TODO' found in [${ins}] x [${clm}]`);
            // Verify no whitespace-only values in any row or bar
            card.chart_bars.forEach((b, idx) => {
                node_assert_1.default.ok(b.label.trim().length > 0, `Chart bar ${idx} has blank label in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(b.value.trim().length > 0, `Chart bar ${idx} has blank value in [${ins}] x [${clm}]`);
            });
            card.table_rows.forEach((r, idx) => {
                node_assert_1.default.ok(r.label.trim().length > 0, `Table row ${idx} has blank label in [${ins}] x [${clm}]`);
                node_assert_1.default.ok(r.value.trim().length > 0, `Table row ${idx} has blank value in [${ins}] x [${clm}]`);
            });
        }
    }
});
// ============================================================================
// SUITE 3: Bowtie Virtual Insurer Dedicated Boundary Verification
// ============================================================================
recordTest("Suite 3: Bowtie Boundaries", "Verify Bowtie + Prepayment virtual boundary articulation", () => {
    const card = sandbox.getBattleCard("Bowtie", "5.8% 預繳");
    node_assert_1.default.ok(card.agent_title.includes("虛擬保險業務邊界"), "Must mention virtual insurance business boundary");
    node_assert_1.default.ok(card.agent_step_2.includes("未設有具備複利分紅"), "Must articulate lack of compound par savings");
    node_assert_1.default.ok(card.agent_step_2.includes("無限次保單分拆"), "Must articulate policy splitting contrast");
    node_assert_1.default.ok(card.agent_step_2.includes("9種貨幣轉換"), "Must articulate multi-currency contrast");
    // Must NOT invent a fake GN16 fulfillment ratio for Bowtie
    node_assert_1.default.ok(!card.agent_step_2.includes("88%"), "Must NOT claim fake 88% fulfillment for Bowtie");
    node_assert_1.default.ok(!card.agent_step_3.includes("88%"), "Must NOT claim fake 88% fulfillment for Bowtie");
    // Chart bar check
    const bowtieBar = card.chart_bars.find((b) => b.label.includes("Bowtie"));
    node_assert_1.default.ok(bowtieBar, "Must have Bowtie bar");
    node_assert_1.default.strictEqual(bowtieBar.widthPct, 20, "Bowtie bar widthPct must be 20%");
    node_assert_1.default.ok(bowtieBar.value.includes("未設儲蓄傳承險種"), "Bowtie value must state lack of savings line");
});
recordTest("Suite 3: Bowtie Boundaries", "Verify Bowtie + Rebate term consumption vs 5th year break-even", () => {
    const card = sandbox.getBattleCard("Bowtie", "首年保費回贈 28%");
    node_assert_1.default.ok(card.agent_title.includes("純網上直銷保費架構"), "Must address direct sales premium structure");
    node_assert_1.default.ok(card.agent_step_2.includes("消費型定期保障"), "Must identify term pure consumption");
    node_assert_1.default.ok(card.agent_step_2.includes("100% 消耗無儲蓄現金價值"), "Must explain 100% consumed no cash value");
    node_assert_1.default.ok(card.agent_step_2.includes("第 5 年保證回本"), "Must contrast 5th-year break-even");
    const bowtieBar = card.chart_bars.find((b) => b.label.includes("Bowtie"));
    node_assert_1.default.ok(bowtieBar, "Must have Bowtie bar");
    node_assert_1.default.strictEqual(bowtieBar.widthPct, 15, "Bowtie bar widthPct must be 15%");
    node_assert_1.default.ok(bowtieBar.value.includes("0 現金價值"), "Bowtie value must state 0 cash value");
});
recordTest("Suite 3: Bowtie Boundaries", "Verify Bowtie + Critical Illness natural rate jump vs level 20-yr whole life", () => {
    const card = sandbox.getBattleCard("Bowtie", "癌症再次索償等待期");
    node_assert_1.default.ok(card.agent_title.includes("早期危疾年期跳水與重疾多次賠付缺口"), "Must address early CI rate spike and multi-claim gap");
    node_assert_1.default.ok(card.agent_step_2.includes("每年續保（定期消費型）"), "Must point out annually renewable term structure");
    node_assert_1.default.ok(card.agent_step_2.includes("自然費率跳升"), "Must mention natural rate progression");
    node_assert_1.default.ok(card.agent_step_2.includes("只賠 1 次"), "Must mention single payout limitation");
    node_assert_1.default.ok(card.agent_step_2.includes("ICU"), "Must mention lack of ICU advance payout");
    node_assert_1.default.ok(card.agent_step_3.includes("終身平準保費"), "Must contrast level whole life premium");
    node_assert_1.default.ok(card.agent_step_3.includes("多次索償"), "Must highlight multiple claim capability in step 3");
    node_assert_1.default.ok(card.chart_bars[0].value.includes("900% 多次賠償"), "Must highlight 900% multiple claim in chart bar");
    node_assert_1.default.ok(card.agent_step_3.includes("連續住 ICU 3-5 日即預支 100%"), "Must highlight ICU 100% advance payout");
    const bowtieBar = card.chart_bars.find((b) => b.label.includes("Bowtie"));
    node_assert_1.default.ok(bowtieBar, "Must have Bowtie bar");
    node_assert_1.default.strictEqual(bowtieBar.widthPct, 45, "Bowtie bar widthPct must be 45%");
});
recordTest("Suite 3: Bowtie Boundaries", "Verify Bowtie + VHIS cashless direct billing vs self-service app claims", () => {
    const card = sandbox.getBattleCard("Bowtie", "自願醫保全數賠償");
    node_assert_1.default.ok(card.agent_title.includes("自願醫保線上自主申報 vs 專屬 Agent 出院免找數"), "Title must contrast online self-filing vs dedicated cashless");
    node_assert_1.default.ok(card.agent_step_2.includes("Chatbot 同 Email"), "Must contrast chatbot/email with agent support");
    node_assert_1.default.ok(card.agent_step_2.includes("自己先找數墊付十幾廿萬"), "Must point out self-reimbursement cashflow pressure");
    node_assert_1.default.ok(card.agent_step_3.includes("出院免找數 (Cashless)"), "Must highlight cashless direct billing");
    node_assert_1.default.ok(card.agent_step_3.includes("專人入院前辦好擔保"), "Must highlight admission guarantee by agent");
    const bowtieBar = card.chart_bars.find((b) => b.label.includes("Bowtie"));
    node_assert_1.default.ok(bowtieBar, "Must have Bowtie bar");
    node_assert_1.default.strictEqual(bowtieBar.widthPct, 55, "Bowtie bar widthPct must be 55%");
});
recordTest("Suite 3: Bowtie Boundaries", "Verify Bowtie + Financing UL absence of private bank financing", () => {
    const card = sandbox.getBattleCard("Bowtie", "保費融資 85% LTV");
    node_assert_1.default.ok(card.agent_title.includes("私銀保費融資 (UL) 本質"), "Must address private bank financing UL reality");
    node_assert_1.default.ok(card.agent_step_2.includes("私人銀行及商業銀行均未設有任何針對虛擬保單的保費融資通道"), "Must explain absence of virtual policy financing channels");
    node_assert_1.default.ok(card.agent_step_2.includes("Margin Call"), "Must address margin call risk in leveraged UL");
    node_assert_1.default.ok(card.agent_step_3.includes("無槓桿多元貨幣儲蓄"), "Must advocate unleveraged multi-currency savings");
    const bowtieBar = card.chart_bars.find((b) => b.label.includes("Bowtie"));
    node_assert_1.default.ok(bowtieBar, "Must have Bowtie bar");
    node_assert_1.default.strictEqual(bowtieBar.widthPct, 20, "Bowtie bar widthPct must be 20%");
    node_assert_1.default.ok(bowtieBar.value.includes("未設萬用壽險及私銀融資"), "Value must state lack of UL/financing");
});
recordTest("Suite 3: Bowtie Boundaries", "Verify Bowtie + QDAP absence of IA-approved tax-deductible QDAP", () => {
    const card = sandbox.getBattleCard("Bowtie", "QDAP 延期年金總回報");
    node_assert_1.default.ok(card.agent_title.includes("QDAP 扣稅年金資格"), "Must address QDAP tax qualification");
    node_assert_1.default.ok(card.agent_step_2.includes("未獲批發行任何可享每年 HK$60,000 薪俸稅免稅額的 QDAP"), "Must explain lack of HK$60,000 tax-deductible QDAP approval");
    node_assert_1.default.ok(card.agent_step_3.includes("HK$10,200 的實質退稅優惠"), "Must mention up to HK$10,200 tax savings");
    const bowtieBar = card.chart_bars.find((b) => b.label.includes("Bowtie"));
    node_assert_1.default.ok(bowtieBar, "Must have Bowtie bar");
    node_assert_1.default.strictEqual(bowtieBar.widthPct, 20, "Bowtie bar widthPct must be 20%");
    node_assert_1.default.ok(bowtieBar.value.includes("未設保監局認可 QDAP 年金"), "Value must state lack of approved QDAP");
});
// ============================================================================
// SUITE 4: Traditional Insurers Sanitization & Inversion Prevention
// ============================================================================
recordTest("Suite 4: Traditional Insurers Sanitization", "Verify traditional insurers x VHIS do NOT call traditional carriers pure online chatbots", () => {
    const traditionalInsurers = CANONICAL_INSURERS.filter(i => !i.includes("Bowtie"));
    node_assert_1.default.strictEqual(traditionalInsurers.length, 8, "Must be exactly 8 traditional insurers");
    for (const ins of traditionalInsurers) {
        const card = sandbox.getBattleCard(ins, "自願醫保全數賠償");
        // Must NOT call traditional carriers pure online
        node_assert_1.default.ok(!card.agent_step_2.includes("純線上保險只有 Chatbot 同 Email"), `${ins} must NOT contain online chatbot copy`);
        node_assert_1.default.ok(!card.agent_title.includes("線上自主申報"), `${ins} title must not say online self-declaration`);
        // Must feature competitive benchmarks
        node_assert_1.default.ok(card.agent_title.includes("標靶藥細項上限") || card.agent_title.includes("特約網絡限制"), `${ins} must highlight targeted therapy limits or network constraints`);
        node_assert_1.default.ok(card.agent_step_2.includes("非手術癌症治療（標靶藥、免疫治療）喺部分級別依然設有分項限額"), `${ins} must critique targeted therapy sublimits`);
        node_assert_1.default.ok(card.agent_step_3.includes("出院免找數 (Cashless)"), `${ins} must highlight our cashless billing`);
    }
});
recordTest("Suite 4: Traditional Insurers Sanitization", "Verify GN16 delta calculation consistency across traditional insurers", () => {
    const traditionalInsurers = CANONICAL_INSURERS.filter(i => !i.includes("Bowtie"));
    for (const ins of traditionalInsurers) {
        const card = sandbox.getBattleCard(ins, "5.8% 預繳");
        node_assert_1.default.ok(card.agent_step_3.includes("GN16"), `${ins} must mention GN16`);
        node_assert_1.default.ok(card.agent_step_3.includes("歷年累積實現率高達 96.5%"), `${ins} must cite our 96.5% benchmark`);
        // Ensure no NaN in string
        node_assert_1.default.ok(!card.agent_step_3.includes("NaN"), `${ins} GN16 delta must not be NaN`);
    }
});
// ============================================================================
// SUITE 5: Boundary, Case-Insensitive, Whitespace & Adversarial Fuzzing Resilience
// ============================================================================
recordTest("Suite 5: Adversarial Fuzzing", "Test case-insensitivity, trim, and whitespace variants", () => {
    const testCases = [
        { comp: "   友邦 aia   ", clm: "  5.8% 預繳  ", expectedComp: "AIA", expectedClm: "prepayment" },
        { comp: "PRUDENTIAL", clm: "REBATE", expectedComp: "Prudential", expectedClm: "rebate" },
        { comp: "bowtie", clm: "critical_illness", expectedComp: "Bowtie", expectedClm: "critical_illness" },
        { comp: "   \t\nBowtie\r\n  ", clm: "\t\nvhis\r\n", expectedComp: "Bowtie", expectedClm: "vhis" },
        { comp: "sun life", clm: "financing_ul", expectedComp: "Sun Life", expectedClm: "financing_ul" },
        { comp: "manulife", clm: "qdap", expectedComp: "Manulife", expectedClm: "qdap" },
        { comp: "fwd", clm: "85%", expectedComp: "FWD", expectedClm: "financing_ul" },
        { comp: "axa", clm: "年金", expectedComp: "AXA", expectedClm: "qdap" },
        { comp: "boc life", clm: "癌症", expectedComp: "BOC Life", expectedClm: "critical_illness" },
        { comp: "yf life", clm: "全數賠償", expectedComp: "YF Life", expectedClm: "vhis" }
    ];
    for (const tc of testCases) {
        const card = sandbox.getBattleCard(tc.comp, tc.clm);
        node_assert_1.default.ok(card, `Card must be generated for ${tc.comp} x ${tc.clm}`);
        const json = JSON.stringify(card);
        node_assert_1.default.ok(!json.includes("undefined"), `No undefined in ${tc.comp}`);
        node_assert_1.default.ok(!json.includes("NaN"), `No NaN in ${tc.comp}`);
    }
});
recordTest("Suite 5: Adversarial Fuzzing", "Test malformed, null, undefined, unexpected, and XSS injection inputs", () => {
    const extremeInputs = [
        [null, null],
        [undefined, undefined],
        ["", ""],
        ["   ", "   "],
        [12345, 67890],
        [true, false],
        [NaN, Infinity],
        [{}, []],
        ["Unknown Insurer 999", "Random Claim Crypto"],
        ["<script>alert(1)</script>", "'; DROP TABLE battle_cards; --"],
        ["__proto__", "constructor"]
    ];
    for (const [c, clm] of extremeInputs) {
        node_assert_1.default.doesNotThrow(() => {
            const card = sandbox.getBattleCard(c, clm);
            node_assert_1.default.ok(card, `Must return valid card even under extreme input [${c}] x [${clm}]`);
            node_assert_1.default.ok(typeof card.agent_title === "string" && card.agent_title.length > 0, "agent_title must be valid string");
            node_assert_1.default.ok(typeof card.whatsapp_script === "string" && card.whatsapp_script.length > 0, "whatsapp_script must be valid string");
            node_assert_1.default.ok(Array.isArray(card.chart_bars) && card.chart_bars.length >= 2, "chart_bars must be valid array");
            node_assert_1.default.ok(Array.isArray(card.table_rows) && card.table_rows.length >= 3, "table_rows must be valid array");
            const json = JSON.stringify(card);
            node_assert_1.default.ok(!json.includes("undefined"), "Must not contain undefined");
            node_assert_1.default.ok(!json.includes("NaN"), "Must not contain NaN");
        }, `Failed on extreme input: [${c}] x [${clm}]`);
    }
});
recordTest("Suite 5: Adversarial Fuzzing", "Test raw normalized claim keys in getBattleCard", () => {
    const rawKeys = ["prepayment", "rebate", "critical_illness", "vhis", "financing_ul", "qdap"];
    const failures = [];
    for (const key of rawKeys) {
        const card = sandbox.getBattleCard("保誠 Prudential", key);
        // Check if the returned card actually matches the claim
        if (key === "rebate" && !card.agent_title.includes("28%")) {
            failures.push(`Claim key '${key}' returned '${card.agent_title}' instead of rebate`);
        }
        else if (key === "critical_illness" && !card.agent_title.includes("癌症") && !card.agent_title.includes("等待期")) {
            failures.push(`Claim key '${key}' returned '${card.agent_title}' instead of critical_illness`);
        }
        else if (key === "vhis" && !card.agent_title.includes("自願醫保") && !card.agent_title.includes("標靶藥")) {
            failures.push(`Claim key '${key}' returned '${card.agent_title}' instead of vhis`);
        }
        else if (key === "financing_ul" && !card.agent_title.includes("85%") && !card.agent_title.includes("融資")) {
            failures.push(`Claim key '${key}' returned '${card.agent_title}' instead of financing_ul`);
        }
    }
    node_assert_1.default.strictEqual(failures.length, 0, `normalizeClaim failed to resolve raw claim keys:\n${failures.join("\n")}`);
});
// ============================================================================
// SUITE 6: DOM Interactivity & Lifecycle Simulation in Node VM
// ============================================================================
recordTest("Suite 6: DOM Lifecycle Simulation", "Simulate initial load and updateBattleCard execution", () => {
    const { sandbox: freshBox } = createSandbox();
    const dom = freshBox.__domElements;
    // Initial trigger
    freshBox.updateBattleCard();
    node_assert_1.default.ok(dom["agent-title"].innerHTML.length > 0, "agent-title innerHTML must be populated");
    node_assert_1.default.ok(dom["agent-step-1"].innerHTML.length > 0, "agent-step-1 innerHTML must be populated");
    node_assert_1.default.ok(dom["agent-step-2"].innerHTML.length > 0, "agent-step-2 innerHTML must be populated");
    node_assert_1.default.ok(dom["agent-step-3"].innerHTML.length > 0, "agent-step-3 innerHTML must be populated");
    node_assert_1.default.ok(dom["client-title"].innerHTML.length > 0, "client-title innerHTML must be populated");
    node_assert_1.default.ok(dom["client-chart-bars"].innerHTML.length > 0, "client-chart-bars innerHTML must be populated");
    node_assert_1.default.ok(dom["client-table"].innerHTML.length > 0, "client-table innerHTML must be populated");
    node_assert_1.default.ok(dom["client-disclaimer"].innerHTML.length > 0, "client-disclaimer innerHTML must be populated");
    // Verify chart bars HTML structure
    node_assert_1.default.ok(dom["client-chart-bars"].innerHTML.includes("chart-bar-row"), "chart-bars must contain chart-bar-row");
    node_assert_1.default.ok(dom["client-chart-bars"].innerHTML.includes("chart-bar-fill"), "chart-bars must contain chart-bar-fill");
    node_assert_1.default.ok(!dom["client-chart-bars"].innerHTML.includes("NaN%"), "chart-bars must not contain NaN%");
    // Verify table HTML structure
    node_assert_1.default.ok(dom["client-table"].innerHTML.includes("<tr"), "client-table must contain tr elements");
    node_assert_1.default.ok(dom["client-table"].innerHTML.includes("<td"), "client-table must contain td elements");
});
recordTest("Suite 6: DOM Lifecycle Simulation", "Simulate user clicking company and claim pills (interactive state update)", () => {
    const { sandbox: freshBox } = createSandbox();
    const dom = freshBox.__domElements;
    const companyPills = freshBox.__companyPills;
    const claimPills = freshBox.__claimPills;
    // 1. Click on Bowtie company pill
    const bowtiePill = companyPills.find((p) => p.innerText.includes("Bowtie"));
    node_assert_1.default.ok(bowtiePill, "Bowtie pill must exist");
    freshBox.selectCompany(bowtiePill, "純網上虛擬 Bowtie");
    node_assert_1.default.ok(bowtiePill.classList.contains("active"), "Bowtie pill must have active class");
    const pruPill = companyPills.find((p) => p.innerText.includes("Prudential"));
    node_assert_1.default.ok(!pruPill.classList.contains("active"), "Prudential pill must NOT have active class");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("Bowtie"), "agent-title must be updated to Bowtie");
    // 2. Click on VHIS claim pill
    const vhisPill = claimPills.find((p) => p.innerText.includes("自願醫保"));
    node_assert_1.default.ok(vhisPill, "VHIS pill must exist");
    freshBox.selectClaim(vhisPill, "自願醫保全數賠償");
    node_assert_1.default.ok(vhisPill.classList.contains("active"), "VHIS pill must have active class");
    // In the real app, does clicking the VHIS pill update the battle card to VHIS?
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("出院免找數") || dom["agent-title"].innerHTML.includes("自願醫保"), `Clicking VHIS pill must update agent-title to VHIS card, but got: '${dom["agent-title"].innerHTML}'`);
    node_assert_1.default.ok(dom["agent-step-3"].innerHTML.includes("Cashless"), "agent-step-3 must be updated to Cashless");
    // 3. Test string overload: selectCompany("友邦 AIA")
    freshBox.selectCompany("友邦 AIA");
    const aiaPill = companyPills.find((p) => p.innerText.includes("AIA"));
    node_assert_1.default.ok(aiaPill.classList.contains("active"), "AIA pill must be active after string call");
    node_assert_1.default.ok(dom["agent-title"].innerHTML.includes("友邦保險 AIA"), "agent-title must reflect AIA");
});
recordTest("Suite 6: DOM Lifecycle Simulation", "Simulate dual-perspective view toggle and flip", () => {
    const { sandbox: freshBox } = createSandbox();
    const dom = freshBox.__domElements;
    // Verify switchView function exists
    node_assert_1.default.strictEqual(typeof freshBox.switchView, "function", "switchView must be a function");
    // Default is agent mode
    freshBox.switchView("agent");
    node_assert_1.default.strictEqual(dom["agent-view"].style.display, "block", "agent-view display must be block in agent mode");
    node_assert_1.default.strictEqual(dom["client-view"].style.display, "none", "client-view display must be none in agent mode");
    // Switch to client mode
    freshBox.switchView("client");
    node_assert_1.default.strictEqual(dom["agent-view"].style.display, "none", "agent-view display must be none in client mode");
    node_assert_1.default.strictEqual(dom["client-view"].style.display, "block", "client-view display must be block in client mode");
    // Toggle view back to agent mode
    freshBox.toggleView();
    node_assert_1.default.strictEqual(dom["agent-view"].style.display, "block", "agent-view display must be block after toggle");
    node_assert_1.default.strictEqual(dom["client-view"].style.display, "none", "client-view display must be none after toggle");
});
recordTest("Suite 6: DOM Lifecycle Simulation", "Verify window.setViewMode exposure for inline HTML onclick handlers", () => {
    const { sandbox: freshBox } = createSandbox();
    // In templates/mobile_cafe_app.html lines 353 & 356:
    // onclick="setViewMode('agent')" and onclick="setViewMode('client')"
    // setViewMode is declared as `const setViewMode = switchView;` which is not attached to window
    node_assert_1.default.ok(typeof freshBox.setViewMode === "function" || typeof freshBox.window.setViewMode === "function", "window.setViewMode must be exposed so inline onclick='setViewMode(...)' handlers do not throw in strict/modular execution contexts");
});
recordTest("Suite 6: DOM Lifecycle Simulation", "Simulate WhatsApp pitch copy and toast popup (fallback path)", () => {
    const { sandbox: freshBox } = createSandbox();
    const dom = freshBox.__domElements;
    // Simulate without navigator.clipboard to test synchronous fallbackCopyText
    delete freshBox.navigator.clipboard;
    // Initialize and select card
    freshBox.updateBattleCard();
    freshBox.copyWhatsAppPitch();
    // Toast must be shown immediately in fallback mode
    node_assert_1.default.strictEqual(dom["toast"].style.display, "block", "Toast display must be block");
    node_assert_1.default.strictEqual(dom["toast"].style.opacity, "1", "Toast opacity must be 1");
    node_assert_1.default.ok(dom["toast"].innerText.includes("WhatsApp"), "Toast text must mention WhatsApp");
});
// ============================================================================
// SUITE 7: Dual-App Bidirectional Navigation & Artifact Parity
// ============================================================================
recordTest("Suite 7: Navigation & Artifacts", "Verify mobile_cafe_app.html header navigation link to morning_slides.html", () => {
    // Check exact tag in mobile_cafe_app.html
    const linkRegex = /<a\s+href="morning_slides\.html"\s+class="top-nav-slides-btn"[\s\S]*?>[\s\S]*?晨會投影片[\s\S]*?<\/a>/;
    node_assert_1.default.ok(linkRegex.test(cafeHtml), "mobile_cafe_app.html must have prominent button linking to morning_slides.html");
    node_assert_1.default.ok(cafeHtml.includes(".top-nav-slides-btn"), "CSS for top-nav-slides-btn must exist");
});
recordTest("Suite 7: Navigation & Artifacts", "Verify morning_slides.html reciprocal navigation link to index.html", () => {
    const slidesPath = path_1.default.join(process.cwd(), "templates", "morning_slides.html");
    node_assert_1.default.ok(fs_1.default.existsSync(slidesPath), "templates/morning_slides.html must exist");
    const slidesHtml = fs_1.default.readFileSync(slidesPath, "utf-8");
    // Check reciprocal button linking to index.html
    node_assert_1.default.ok(slidesHtml.includes('href="index.html"'), "morning_slides.html must link to index.html");
    node_assert_1.default.ok(slidesHtml.includes("top-nav-battlecard-btn"), "morning_slides.html must contain top-nav-battlecard-btn");
    node_assert_1.default.ok(slidesHtml.includes("見客攻防卡"), "morning_slides.html must display 見客攻防卡 text");
    node_assert_1.default.ok(slidesHtml.includes("ppt-hint-link"), "morning_slides.html must contain shortcut in toolbar");
    // Verify suppression in presenter/audience/preview/print modes
    node_assert_1.default.ok(slidesHtml.includes("body.ppt-presenter .top-nav-battlecard-btn"), "Must suppress button in presenter mode");
    node_assert_1.default.ok(slidesHtml.includes("body.ppt-audience .top-nav-battlecard-btn"), "Must suppress button in audience mode");
    node_assert_1.default.ok(slidesHtml.includes("body.ppt-preview .top-nav-battlecard-btn"), "Must suppress button in preview mode");
    node_assert_1.default.ok(slidesHtml.includes("@media print"), "Must suppress in print media");
});
recordTest("Suite 7: Navigation & Artifacts", "Verify dist/ assets existence and identity parity (index.html == cafe.html)", () => {
    const distDir = path_1.default.join(process.cwd(), "dist");
    const distIndex = path_1.default.join(distDir, "index.html");
    const distCafe = path_1.default.join(distDir, "cafe.html");
    const distSlides = path_1.default.join(distDir, "morning_slides.html");
    node_assert_1.default.ok(fs_1.default.existsSync(distIndex), "dist/index.html must exist");
    node_assert_1.default.ok(fs_1.default.existsSync(distCafe), "dist/cafe.html must exist");
    node_assert_1.default.ok(fs_1.default.existsSync(distSlides), "dist/morning_slides.html must exist");
    const indexContent = fs_1.default.readFileSync(distIndex, "utf-8");
    const cafeContent = fs_1.default.readFileSync(distCafe, "utf-8");
    const slidesContent = fs_1.default.readFileSync(distSlides, "utf-8");
    // Verify dist/index.html is the Mobile Cafe App
    node_assert_1.default.ok(indexContent.includes("INSURINTEL · 14:00 見客極速攻防卡"), "dist/index.html must be the mobile cafe app");
    node_assert_1.default.ok(indexContent.includes("morning_slides.html"), "dist/index.html must link to morning_slides.html");
    // Verify dist/cafe.html is identical alias
    node_assert_1.default.strictEqual(cafeContent, indexContent, "dist/cafe.html must be 100% identical byte-for-byte to dist/index.html");
    // Verify dist/morning_slides.html links back to index.html
    node_assert_1.default.ok(slidesContent.includes("index.html"), "dist/morning_slides.html must link to index.html");
});
// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log("\n================================================================================");
console.log("ADVERSARIAL CHALLENGE R2_1 SUMMARY");
console.log("================================================================================");
const passedCount = results.filter(r => r.passed).length;
const failedCount = results.filter(r => !r.passed).length;
const totalCount = results.length;
console.log(`Total Scenarios Tested : ${totalCount}`);
console.log(`Passed                 : ${passedCount}`);
console.log(`Failed                 : ${failedCount}`);
if (failedCount > 0) {
    console.error("\nFAILURES DETECTED:");
    for (const f of results.filter(r => !r.passed)) {
        console.error(`- [${f.suite}] ${f.test}: ${f.error}`);
    }
    process.exit(1);
}
else {
    console.log("\nVERDICT: ALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY (0 FAILURES).");
    process.exit(0);
}

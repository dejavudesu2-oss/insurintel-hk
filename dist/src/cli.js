"use strict";
/**
 * InsurIntel HK - Command Line Interface
 * Unified terminal interface for briefing generation, counter-pitch, and intelligence analysis.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const diff_detector_js_1 = require("./engine/diff_detector.js");
const counter_pitch_js_1 = require("./engine/counter_pitch.js");
const briefing_generator_js_1 = require("./engine/briefing_generator.js");
function loadAllMockData() {
    const mockDir = path_1.default.join(process.cwd(), "src", "mock_data");
    const files = ["savings_aia_pru.json", "ci_manulife_fwd.json", "vhis_qdap_sample.json"];
    let all = [];
    for (const f of files) {
        const p = path_1.default.join(mockDir, f);
        if (fs_1.default.existsSync(p)) {
            const data = JSON.parse(fs_1.default.readFileSync(p, "utf-8"));
            all = all.concat(data);
        }
    }
    return all;
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || "briefing";
    const promos = loadAllMockData();
    if (command === "briefing") {
        console.log("\n=======================================================");
        console.log("   InsurIntel HK - 早會情報與主管講稿生成器");
        console.log("=======================================================\n");
        const diffDetector = new diff_detector_js_1.IntelligenceDiffDetector();
        // Simulate a baseline change for demo
        const previousPromos = JSON.parse(JSON.stringify(promos));
        // Simulate Pru previous rate was 5.5%, now 5.8%
        const pru = previousPromos.find((p) => p.insurer === "Prudential");
        if (pru && pru.prepayment_scheme) {
            pru.prepayment_scheme.guaranteed_rate_pct = 5.5;
        }
        const deltas = diffDetector.detectChanges(promos, previousPromos);
        const generator = new briefing_generator_js_1.MorningBriefingGenerator();
        const briefingData = generator.generateBriefingData(promos, deltas);
        const broadcastText = generator.formatBroadcastText(briefingData);
        console.log(broadcastText);
        // Render HTML slide deck
        const html = generator.renderMorningSlidesHtml(briefingData);
        const outDir = path_1.default.join(process.cwd(), "dist");
        fs_1.default.mkdirSync(outDir, { recursive: true });
        const htmlPath = path_1.default.join(outDir, "morning_slides.html");
        const indexPath = path_1.default.join(outDir, "index.html");
        const txtPath = path_1.default.join(outDir, "morning_briefing.txt");
        fs_1.default.writeFileSync(htmlPath, html, "utf-8");
        fs_1.default.writeFileSync(indexPath, html, "utf-8");
        fs_1.default.writeFileSync(txtPath, broadcastText, "utf-8");
        console.log(`\n[InsurIntel] 早會投影片已導出至: ${htmlPath}`);
        console.log(`[InsurIntel] 廣播文本已導出至: ${txtPath}`);
    }
    else if (command === "search") {
        const { DailyIntelligenceRunner } = await import("./scheduler/daily_runner.js");
        const runner = new DailyIntelligenceRunner();
        await runner.executeDailyCycle();
    }
    else if (command === "pitch") {
        console.log("\n=======================================================");
        console.log("   InsurIntel HK - 4大險種即時攻防對抗話術引擎");
        console.log("=======================================================\n");
        const engine = new counter_pitch_js_1.CounterPitchEngine(promos);
        // 1. Savings Battle
        console.log("\n>>> 測試案例 1：儲蓄分紅險對攻 (友邦·盈御 VS 保誠·雋富)");
        const savingsPitch = engine.generateCounterPitch({
            category: "Savings_MultiCurrency",
            our_product: "友邦 盈御多元貨幣計劃 3",
            competitor_product: "保誠 雋富多元貨幣計劃",
            client_scenario: "客人睇緊保誠，話保誠首年回贈有 28%，預繳有 5.8%，問我友邦得 5.0% 點解要買？"
        });
        console.log(`【對抗戰策】：${savingsPitch.matchup_title}`);
        console.log(`【核心思路】：${savingsPitch.core_pivot_strategy}\n`);
        savingsPitch.attack_points.forEach((pt, i) => {
            console.log(`Point ${i + 1}: ${pt.title}`);
            console.log(`  🗣️ 話術: ${pt.counter_pitch_script}`);
        });
        console.log(`\n⚖️ 保監局合規防禦提醒: ${savingsPitch.regulatory_guardrail.gl20_compliance_note}`);
        console.log(`🤝 承認競品客觀優勢: ${savingsPitch.regulatory_guardrail.acknowledged_competitor_advantage}`);
        // 2. Critical Illness Battle
        console.log("\n-------------------------------------------------------");
        console.log(">>> 測試案例 2：危疾險對攻 (宏利·守護無間 VS 富衛·危疾加諾)");
        const ciPitch = engine.generateCounterPitch({
            category: "Critical_Illness",
            our_product: "宏利 守護無間危疾保",
            competitor_product: "富衛 危疾加諾保",
            client_scenario: "客人話富衛回贈 20% 仲送多重保障，問點解要揀宏利？"
        });
        console.log(`【對抗戰策】：${ciPitch.matchup_title}`);
        console.log(`【核心思路】：${ciPitch.core_pivot_strategy}`);
        console.log(`Point 1: ${ciPitch.attack_points[0].title}`);
        console.log(`  🗣️ 話術: ${ciPitch.attack_points[0].counter_pitch_script}`);
        // 3. VHIS Medical Battle
        console.log("\n-------------------------------------------------------");
        console.log(">>> 測試案例 3：自願醫保對攻 (專屬中介人靈活計劃 VS 網上純虛擬保險)");
        const vhisPitch = engine.generateCounterPitch({
            category: "Medical_VHIS",
            our_product: "友邦/保誠 尊衛您靈活計劃",
            competitor_product: "Bowtie Pink 自願醫保",
            client_scenario: "客人話網上 Bowtie 好平又無佣金，問專屬 Agent 有咩價值？"
        });
        console.log(`【對抗戰策】：${vhisPitch.matchup_title}`);
        console.log(`Point: ${vhisPitch.attack_points[1].title}`);
        console.log(`  🗣️ 話術: ${vhisPitch.attack_points[1].counter_pitch_script}`);
    }
    else {
        console.log(`未知指令: ${command}。可用指令: briefing | pitch`);
    }
}
main().catch(console.error);

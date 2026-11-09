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
const loader_js_1 = require("./mock_data/loader.js");
const daily_100_scenarios_simulation_js_1 = require("./engine/daily_100_scenarios_simulation.js");
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || "briefing";
    const promos = (0, loader_js_1.loadAllMockPromos)();
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
        const slidesPath = path_1.default.join(outDir, "morning_slides.html");
        const indexPath = path_1.default.join(outDir, "index.html");
        const cafePath = path_1.default.join(outDir, "cafe.html");
        const txtPath = path_1.default.join(outDir, "morning_briefing.txt");
        // Output morning slide deck to morning_slides.html
        fs_1.default.writeFileSync(slidesPath, html, "utf-8");
        fs_1.default.writeFileSync(txtPath, broadcastText, "utf-8");
        // Copy mobile café app to index.html (default root landing) and cafe.html (backward-compatible alias)
        const cafeSource = path_1.default.join(process.cwd(), "templates", "mobile_cafe_app.html");
        if (fs_1.default.existsSync(cafeSource)) {
            fs_1.default.copyFileSync(cafeSource, indexPath);
            fs_1.default.copyFileSync(cafeSource, cafePath);
            const gn16Source = path_1.default.join(process.cwd(), 'templates', 'gn16_tracker.html');
            if (fs_1.default.existsSync(gn16Source)) {
                fs_1.default.copyFileSync(gn16Source, path_1.default.join(outDir, 'gn16_tracker.html'));
            }
        }
        console.log(`\n[InsurIntel] 早會投影片已導出至: ${slidesPath}`);
        console.log(`[InsurIntel] 📱 見客極速攻防卡（首頁）已導出至: ${indexPath}`);
        console.log(`[InsurIntel] 📱 見客極速攻防卡（別名）已導出至: ${cafePath}`);
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
    else if (command === "simulation") {
        console.log("\n=======================================================");
        console.log("   InsurIntel HK - 100場真實展業場景多維AI代理模擬引擎");
        console.log("=======================================================\n");
        const engine = new daily_100_scenarios_simulation_js_1.DailyScenariosSimulationEngine();
        const total = engine.getScenarioCount();
        const idArgIdx = args.findIndex((a) => a === "--id");
        const domainArgIdx = args.findIndex((a) => a === "--domain");
        const isPricing = args.includes("--pricing");
        const isReport = args.includes("--report");
        if (idArgIdx !== -1 && args[idArgIdx + 1]) {
            const targetId = args[idArgIdx + 1];
            const sc = engine.getScenarioById(targetId);
            if (!sc) {
                console.error(`[Simulation] 找不到場景編號: ${targetId}`);
                return;
            }
            console.log(`【場景 ${sc.id}】: ${sc.title}`);
            console.log(`- 業務領域: ${sc.domainZh} (${sc.domain})`);
            console.log(`- 會面地點: ${sc.location}`);
            console.log(`- 客戶畫像: ${sc.clientPersona}`);
            console.log(`- 涉及保司: ${sc.involvedInsurers.join(", ")}`);
            console.log(`- 產品對決: ${sc.involvedProducts.join(" vs ")}`);
            console.log(`- 業務情境: ${sc.contextDescription}`);
            console.log(`- 核心抗辯: ${sc.coreConfrontationOrChallenge}`);
            console.log(`- 商業梯隊: ${sc.commercialTierRelevance} (目標價: HK$${sc.targetTierPriceHKD})`);
            console.log("\n--- 六大 AI 代理評審反饋 ---");
            console.log(`1. ⚖️ ${sc.comments.actuaryAuditor.agentPersonaZh} (${sc.comments.actuaryAuditor.scoreOutOf10}/10): ${sc.comments.actuaryAuditor.critique}`);
            console.log(`2. 🚀 ${sc.comments.topProducer.agentPersonaZh} (${sc.comments.topProducer.scoreOutOf10}/10, 付費意願: ${sc.comments.topProducer.willingnessToPay}): ${sc.comments.topProducer.critique}`);
            console.log(`3. 👔 ${sc.comments.districtDirector.agentPersonaZh} (${sc.comments.districtDirector.scoreOutOf10}/10): ${sc.comments.districtDirector.critique}`);
            console.log(`4. 🛡️ ${sc.comments.policyholder.agentPersonaZh} (${sc.comments.policyholder.scoreOutOf10}/10, 信任分: ${sc.comments.policyholder.trustScore}/10): ${sc.comments.policyholder.critique}`);
            console.log(`5. 📜 ${sc.comments.complianceOfficer.agentPersonaZh} (${sc.comments.complianceOfficer.scoreOutOf10}/10, 風險: ${sc.comments.complianceOfficer.complianceRiskLevel}): ${sc.comments.complianceOfficer.critique}`);
            console.log(`6. 💡 ${sc.comments.pricingPM.agentPersonaZh} (${sc.comments.pricingPM.scoreOutOf10}/10, 推薦階梯: ${sc.comments.pricingPM.recommendedTier}): ${sc.comments.pricingPM.critique}`);
            console.log(`\n【共識結論】: 平均分 ${sc.consensusVerdict.averageScore}/10 (${sc.consensusVerdict.overallViability})`);
            console.log(`- 異議化解策略: ${sc.consensusVerdict.primaryObjection}`);
            return;
        }
        if (domainArgIdx !== -1 && args[domainArgIdx + 1]) {
            const targetDomain = args[domainArgIdx + 1];
            const scList = engine.getScenariosByDomain(targetDomain);
            console.log(`【領域檢索】: ${targetDomain} (共 ${scList.length} 個場景)`);
            scList.forEach((s) => {
                console.log(`  - [${s.id}] ${s.title} | 均分: ${s.consensusVerdict.averageScore}/10 | 階梯: ${s.commercialTierRelevance}`);
            });
            return;
        }
        const sim = engine.runFullSimulation();
        if (isPricing) {
            console.log("--- 商業化四階收費梯隊與單元經濟學 (Unit Economics) ---");
            sim.commercialTierSummaries.forEach((t) => {
                console.log(`\n▶ [${t.tier}] 收費: HK$${t.monthlyPriceHKD.toLocaleString()} / 月`);
                console.log(`  目標客群: ${t.targetAudience}`);
                console.log(`  涵蓋場景: ${t.scenarioCount} 個 | 評審均分: ${t.averageScore}/10 | 付費意願: ${t.estimatedWillingnessToPay}`);
                console.log(`  預估 ARR 跑道: HK$${t.annualRunRatePotentialHKD.toLocaleString()}`);
                console.log(`  核心價值主張: ${t.keyValueProposition}`);
            });
            return;
        }
        if (isReport) {
            const reportMd = engine.generateMarkdownReport();
            const reportPath = path_1.default.join(process.cwd(), "docs", "SIMULATION_100_DAILY_SCENARIOS_REPORT.md");
            fs_1.default.writeFileSync(reportPath, reportMd, "utf8");
            console.log(`[Simulation] 報告已成功生成至: ${reportPath} (${(fs_1.default.statSync(reportPath).size / 1024).toFixed(1)} KB)`);
            return;
        }
        console.log(`[Simulation] 已成功加載並模擬 ${sim.totalScenarios} 個香港保險真實日常場景。`);
        console.log(`[Simulation] 六大 AI 代理綜合評分: ${sim.overallAverageScore} / 10 (${sim.overallAverageScore >= 8.5 ? "卓越 (Outstanding)" : "強勁 (Strong)"})`);
        console.log("\n▶ 十大業務領域分佈:");
        sim.domainSummaries.forEach((d, i) => {
            console.log(`  ${String(i + 1).padStart(2, "0")}. [${d.domain}] ${d.domainZh}: ${d.scenarioCount}場 | 均分 ${d.averageScore} | 主導定價: ${d.dominantTier}`);
        });
        console.log("\n▶ 六大 AI 代理評審計分卡:");
        sim.personaSummaries.forEach((p) => {
            console.log(`  - ${p.agentRole} (${p.agentPersonaZh}): 均分 ${p.averageScore}/10 | 正向: ${p.sentimentCounts.Positive || 0} | 建設性: ${p.sentimentCounts.Constructive || 0}`);
        });
        console.log("\n▶ 四大商業定價梯隊 ARR 跑道預測:");
        sim.commercialTierSummaries.forEach((t) => {
            console.log(`  - ${t.tier} (HK$${t.monthlyPriceHKD}/月): 覆蓋 ${t.scenarioCount}場景 | 付費意願: ${t.estimatedWillingnessToPay} | 潛在ARR: HK$${t.annualRunRatePotentialHKD.toLocaleString()}`);
        });
        console.log("\n💡 提示: 可使用 --id <SC001>、--domain <領域名>、--pricing 或 --report 查看詳細內容。");
    }
    else {
        console.log(`未知指令: ${command}。可用指令: briefing | pitch | simulation | search`);
    }
}
main().catch(console.error);

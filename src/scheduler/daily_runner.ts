/**
 * InsurIntel HK - Automated Daily Cycle Runner & Scheduler
 * Orchestrates the full daily lifecycle:
 * 06:30 AM: Auto-search & ingest latest market intelligence
 * 07:00 AM: Diff detection & delta change calculation
 * 07:45 AM: Generate daily briefing, director speech, and morning presentation slides
 */

import fs from "fs";
import path from "path";
import { MarketSearcher } from "../crawler/market_searcher.js";
import { IntelligenceDiffDetector } from "../engine/diff_detector.js";
import { MorningBriefingGenerator } from "../engine/briefing_generator.js";
import { InsurancePromoComprehensive } from "../types/insurance.js";
import { EdgePreRenderer } from "../backend/reliability_engine.js";
import { ViralTeamCommsEngine } from "../engine/viral_card_synthesizer.js";

export class DailyIntelligenceRunner {
  private searcher: MarketSearcher;
  private diffDetector: IntelligenceDiffDetector;
  private briefingGenerator: MorningBriefingGenerator;
  private preRenderer: EdgePreRenderer;
  private commsEngine: ViralTeamCommsEngine;
  private dbSnapshotPath: string;

  constructor() {
    this.searcher = new MarketSearcher();
    this.diffDetector = new IntelligenceDiffDetector();
    this.briefingGenerator = new MorningBriefingGenerator();
    this.preRenderer = new EdgePreRenderer();
    this.commsEngine = new ViralTeamCommsEngine();
    this.dbSnapshotPath = path.join(process.cwd(), "dist", "previous_snapshot.json");
  }

  /**
   * Executes one full daily cycle
   */
  public async executeDailyCycle(): Promise<{
    discoveredCount: number;
    deltaChangesCount: number;
    broadcastText: string;
    slidesHtmlPath: string;
  }> {
    console.log(`[${new Date().toISOString()}] 🚀 啟動 InsurIntel HK 每日自動情報更新任務...`);

    // 1. Proactive web search
    console.log(`[InsurIntel] 正在自動聯網檢索全港最新保險優惠、預繳利率與促銷通函...`);
    const hits = await this.searcher.fetchDailyMarketNews();
    console.log(`[InsurIntel] 檢索完成！捕獲 ${hits.length} 條市場最新動態。`);

    // 2. Multimodal extraction
    const currentPromos = await this.searcher.processDiscoveredItems(hits);

    // 3. Load yesterday's baseline snapshot for difference detection
    let previousPromos: InsurancePromoComprehensive[] = [];
    if (fs.existsSync(this.dbSnapshotPath)) {
      try {
        previousPromos = JSON.parse(fs.readFileSync(this.dbSnapshotPath, "utf-8"));
      } catch {
        previousPromos = [];
      }
    } else {
      // First run: simulate previous baseline so changes can be demonstrated
      previousPromos = JSON.parse(JSON.stringify(currentPromos));
      const pru = previousPromos.find(p => p.insurer === "Prudential");
      if (pru && pru.prepayment_scheme) {
        pru.prepayment_scheme.guaranteed_rate_pct = 5.5; // Was 5.5% yesterday, now 5.8%
      }
    }

    // 4. Delta diff detection & Circuit Breaker Validation
    const deltaChanges = this.diffDetector.detectChanges(currentPromos, previousPromos);
    const circuitBreaker = this.diffDetector.getCircuitBreaker();
    const breakerState = circuitBreaker.getState();

    if (breakerState.status !== "CLOSED") {
      console.warn(`[InsurIntel Runner] ⚠️ 熔斷器警告狀態: ${breakerState.status} (異常累積: ${breakerState.failure_count} 次)`);
    }

    console.log(`[InsurIntel] 差分對比完成，共檢測到 ${deltaChanges.length} 項突發關鍵變動：`);
    deltaChanges.forEach((ch, idx) => {
      console.log(`   ${idx + 1}. [${ch.severity}] ${ch.description}`);
    });

    // Obtain sanitized promos through circuit breaker
    const { sanitized } = circuitBreaker.sanitizeWithFallback(currentPromos, previousPromos);

    // 5. Generate daily morning briefing and director 2-min speech
    const briefingData = this.briefingGenerator.generateBriefingData(sanitized, deltaChanges);
    const broadcastText = this.briefingGenerator.formatBroadcastText(briefingData);

    // 6. Render and persist outputs
    const outDir = path.join(process.cwd(), "dist");
    fs.mkdirSync(outDir, { recursive: true });

    const slidesHtml = this.briefingGenerator.renderMorningSlidesHtml(briefingData);
    const slidesPath = path.join(outDir, "morning_slides.html");
    const indexPath = path.join(outDir, "index.html");
    const txtPath = path.join(outDir, "morning_briefing.txt");

    fs.writeFileSync(slidesPath, slidesHtml, "utf-8");
    fs.writeFileSync(indexPath, slidesHtml, "utf-8");
    fs.writeFileSync(txtPath, broadcastText, "utf-8");

    // Agent 6: Ensure mobile café app is present in dist
    const cafeSource = path.join(process.cwd(), "templates", "mobile_cafe_app.html");
    const cafeDist = path.join(outDir, "cafe.html");
    if (fs.existsSync(cafeSource)) {
      fs.copyFileSync(cafeSource, cafeDist);
    }

    // Agent 7: Generate viral morning poster SVG
    const demoStamp = {
      agent_name: "林卓賢 David Lam",
      title: "資深分區總監 Senior District Director",
      insurer: "友邦保險 AIA",
      agency_or_team: "宏峰家族",
      license_no: "IA99201928",
      phone_whatsapp: "+852 9876 5432"
    };
    const posterSvg = this.commsEngine.generatePersonalizedPosterSvg(briefingData, demoStamp);
    const posterPath = path.join(outDir, "morning_poster.svg");
    fs.writeFileSync(posterPath, posterSvg, "utf-8");

    // Agent 8: Edge API Pre-rendering
    this.preRenderer.preRenderStaticApiAssets(briefingData, sanitized);

    // Save only validated sanitized state as the new baseline
    fs.writeFileSync(this.dbSnapshotPath, JSON.stringify(sanitized, null, 2), "utf-8");

    console.log(`[InsurIntel] ✅ 晨會速報生成完畢！已導出至: ${slidesPath}`);
    console.log(`[InsurIntel] 📱 見客極速攻防卡已就緒: ${cafeDist}`);
    console.log(`[InsurIntel] 🎨 個人化宣傳海報已導出: ${posterPath}`);
    return {
      discoveredCount: hits.length,
      deltaChangesCount: deltaChanges.length,
      broadcastText,
      slidesHtmlPath: slidesPath
    };
  }
}

// Direct CLI invocation
if (process.argv[1]?.includes("daily_runner")) {
  const runner = new DailyIntelligenceRunner();
  runner.executeDailyCycle().catch(console.error);
}

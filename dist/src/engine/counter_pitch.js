"use strict";
/**
 * InsurIntel HK - Real-time Counter-Pitch Engine
 * Generates battle-tested defense & attack scripts across Savings, CI, VHIS, and QDAP
 * with Insurance Authority (IA) GL20 fair comparison guardrails.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterPitchEngine = void 0;
class CounterPitchEngine {
    promoKnowledgeBase = new Map();
    constructor(promos = []) {
        for (const promo of promos) {
            this.promoKnowledgeBase.set(promo.promo_id, promo);
            // Index by product alias / name
            for (const alias of promo.product_aliases) {
                this.promoKnowledgeBase.set(alias.toLowerCase(), promo);
            }
            this.promoKnowledgeBase.set(promo.product_name.toLowerCase(), promo);
        }
    }
    /**
     * Generates actionable tactical counter-pitch script
     */
    generateCounterPitch(req) {
        switch (req.category) {
            case "Savings_MultiCurrency":
                return this.generateSavingsCounterPitch(req);
            case "Critical_Illness":
                return this.generateCriticalIllnessCounterPitch(req);
            case "Medical_VHIS":
                return this.generateVHISCounterPitch(req);
            case "Annuity_QDAP":
                return this.generateQDAPCounterPitch(req);
            default:
                return this.generateSavingsCounterPitch(req);
        }
    }
    generateSavingsCounterPitch(req) {
        return {
            matchup_title: `🥊 【儲蓄險對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            core_pivot_strategy: `引導客戶將注意力從「首年短線促銷數字」轉移至「保單分拆靈活度、長線貨幣調配自由度、以及保監局 GN16 歷史分紅實現率」。`,
            attack_points: [
                {
                    title: "拆解預繳短期高息假象 (持續確定性 vs 1年噱頭)",
                    dimension: "預繳利率鎖定期與再投資風險",
                    counter_pitch_script: `「陳生/李太，競品宣傳嘅 5.8% 預繳利率確實吸睛，但仔細睇保司通函，佢『只保證第一年』，由第 2 年起利息將按當時市場浮動利率計算。面對未來降息趨勢，第二年利息極可能回調。而我地推介嘅方案鎖定期更具韌性，綜合資金收益確定性更強，唔會面臨一年後利息跳水嘅尷尬。」`,
                    underlying_data_fact: `競品預繳保證期通常僅為 1 年，次年為非保證息率；且提早退保或提取預繳款將被扣減全期利息。`
                },
                {
                    title: "亮出 GN16 歷史分紅實現率 (客觀數據粉碎非保證畫餅)",
                    dimension: "保監局官方紅利兌現能力",
                    counter_pitch_script: `「買分紅儲蓄險，最緊要唔係宣傳單張上印得幾靚嘅回贈數字，而係將來可唔可以真金白銀派足俾你。根據保監局 GN16 指引公佈嘅官方分紅實現率，我地旗艦系列歷年累積實現率高達 96% 以上，遠高於市場部分同業的 90%~91%。長線 20-30 年複合增長落黎，實現率差 5%，就係幾十萬港幣嘅實際回報差距！」`,
                    underlying_data_fact: `依據香港保監局 GN16 規定，各保險公司必須在官網披露過去分紅實現率。高實現率是抗擊對手高預期 IRR 的終極武器。`
                },
                {
                    title: "擊打保單分拆與貨幣轉換限制 (傳承與出國調度自由)",
                    dimension: "財富傳承與貨幣架構靈活性",
                    counter_pitch_script: `「儲蓄保單係為將來 10 至 30 年仔女升學或退休做準備。我地嘅方案支援『保單無限次分拆』，將來可以平分俾多個仔女，而且轉換成英鎊、加幣或美元時手續極之簡便，無繁瑣等待期。競品喺部分貨幣轉換節點上有較嚴苛限制，資產調度彈性明顯遜色。」`,
                    underlying_data_fact: `我方支援分拆保單、無限次更改受保人及第二受保人，具備身故信託式分期提取功能。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `香港保監局《持牌中介人操守守則》(GL20) 規定，進行產品比較時必須公平、客觀，禁止失實陳述或刻意隱瞞競品保證利益。`,
                acknowledged_competitor_advantage: `客觀陳述：競品在首年指定高保費檔位之促銷回贈額度確實略高，若客戶僅追求首期資金極致折扣且不介意次年利率浮動，競品具有一定短線優勢。`,
                official_disclaimer: `【免責聲明】本對抗話術僅供持牌保險從業員內部研究研討使用。所有數據摘自各大保險公司市場通函及保監局公開記錄，最終產品條款及利益以保單合約批註為準。`
            }
        };
    }
    generateCriticalIllnessCounterPitch(req) {
        return {
            matchup_title: `🥊 【危疾險對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            core_pivot_strategy: `避開單純疾病數量的數字遊戲，主攻「癌症再次索償間隔期」、「非指定疾病之深切治療部 (ICU) 入住保障」及「免體檢綠色核保寬免」。`,
            attack_points: [
                {
                    title: "痛擊癌症索償間隔年期 (2年 vs 3年生命安全線)",
                    dimension: "癌症多重保障等待期",
                    counter_pitch_script: `「張生，危疾保障最核心嘅索償佔比 80% 都係癌症。對方雖然標榜賠償次數多，但癌症再發嘅間隔期需要足足等 3 年！而我地嘅條款大幅縮短至 2 年，一旦遇到擴散或持續未愈，多等 1 年就係多承受 1 年嘅醫療自費風險。時間就係生命！」`,
                    underlying_data_fact: `癌症多重賠償等待期由 3 年縮短至 2 年是市場頂尖防護指標。`
                },
                {
                    title: "突圍非指定疾病 ICU 保障 (應對未知名未知疾病)",
                    dimension: "深切治療部 (ICU) 現金保障",
                    counter_pitch_script: `「醫學日新月異，世界上總有未知新病毒或特殊併發症未必入到指定疾病名單。我地計劃特別涵蓋『非指定疾病 ICU 住院保障』，只要連續入住深切治療部達到指定日數，無需符合特定病名直接賠償最高 100% 保額！呢個先係真正兜底嘅醫療安全網。」`,
                    underlying_data_fact: `涵蓋連續入住 ICU 指定天數（如 3-5 天）即觸發預支賠償，彌補傳統危疾名單滯後盲點。`
                },
                {
                    title: "免體檢限額與綠色核保通道 (當前限時優勢)",
                    dimension: "即時投保便捷度與次標準體放寬",
                    counter_pitch_script: `「現時我司推出限時健康直通車，危疾免體檢額度提升至最高 200 萬美元，對於輕微三高或結節客戶提供專屬核保寬免，手續極快，無需繁瑣去診所驗身即可光速起保！」`,
                    underlying_data_fact: `核保寬免優惠期間可快速鎖定保額，避免因驗身引致不必要的保費加費或不保事項。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `向客戶解釋危疾保障時，必須如實說明不保事項、早期危疾預支扣減規則及各期保費豁免生效條件。`,
                acknowledged_competitor_advantage: `客觀陳述：競品在心血管疾病多重賠償次數上限方面略有特色，若客戶特別重視心臟家族遺傳病史，該點值得客觀參考。`,
                official_disclaimer: `【免責聲明】話術內容僅供中介人展業備課參考，疾病具體定義及索償要求以保單條款為準。`
            }
        };
    }
    generateVHISCounterPitch(req) {
        return {
            matchup_title: `🥊 【自願醫保 VHIS 對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            core_pivot_strategy: `主打「全數賠償非手術癌症治療 (標靶藥/免疫治療)」、「本地精神科住院」及「全球免找數出院醫療支援網絡」。`,
            attack_points: [
                {
                    title: "非手術癌症治療全數賠償 (現代抗癌真金白銀負擔)",
                    dimension: "標靶藥物、化療、放療賠償限額",
                    counter_pitch_script: `「王太，宜家癌症治療最貴嘅唔係做手術，而係每個月幾萬至十幾萬嘅標靶藥同免疫療法。我地嘅 VHIS 靈活計劃將標靶治療列入『全數賠償』項目，每年高達幾千萬保障額度，唔會受細項雜費上限卡住，真正做到安心抗癌。」`,
                    underlying_data_fact: `高端自願醫保提供終身無上限或每年數千萬保障，覆蓋昂貴自費標靶藥物。`
                },
                {
                    title: "直屬 Agent 貼身理賠 vs 純網上無人協助",
                    dimension: "專屬中介人理賠服務價值",
                    counter_pitch_script: `「網上虛擬保險雖然保費平少少，但一旦入院或需要做複雜理賠預先批核，網上只有客服 Bot 或電郵回覆。而我地有專屬持牌中介人跟足全程，由搵醫生填表格到公立轉私家『出院免找數』全流程跟進，患病時專人服務嘅價值遠超一年一千幾百嘅保費差額。」`,
                    underlying_data_fact: `傳統保司具備完善的出院免找數 (Pre-authorization cashless) 網絡及專人跟進，理賠糾紛率低。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `推廣 VHIS 時必須提示投保人扣稅額上限（每名受保人每年 8,000 港元）及未申報既往症之分階段賠償比率。`,
                acknowledged_competitor_advantage: `客觀陳述：純網上虛擬保險在年輕健康客群之基礎保費及家庭同行折扣方面確有價格優勢。`,
                official_disclaimer: `【免責聲明】本資料非醫學意見，醫療賠償以主診醫生醫療報告及官方保單條款核實為準。`
            }
        };
    }
    generateQDAPCounterPitch(req) {
        return {
            matchup_title: `🥊 【合資格延期年金 QDAP 對攻】${req.our_product} (我方) VS ${req.competitor_product} (競品)`,
            core_pivot_strategy: `主打「保證內部回報率 (Guaranteed IRR) 佔比最高」與「每年 60,000 港元法定薪俸稅扣除省稅最大化」。`,
            attack_points: [
                {
                    title: "保證回報比例壓倒一切 (退休不接受畫餅)",
                    dimension: "保證 IRR vs 非保證分紅",
                    counter_pitch_script: `「延期年金係退休嘅救命錢，唔係用黎投機。對方總回報看似高 0.2%，但入面保證回報得唔夠 2%，其餘全部係非保證分紅！我地嘅方案保證回報率高達近 3%，無論環球金融市場點跌，每月年金一蚊都唔會少，退休最緊要係真保證！」`,
                    underlying_data_fact: `退休現金流極度依賴保證回報，保證 IRR 佔比越高，抗金融危機風險能力越強。`
                },
                {
                    title: "精確食足 10,200 港元每年慳稅額",
                    dimension: "香港稅務局法定扣稅優勢",
                    counter_pitch_script: `「只要每年供款達 60,000 港元，以最高稅階 17% 計算，每年即時慳返 10,200 港元真金白銀稅款。5 年累計慳稅超過 51,000 港元，扣除稅務優惠後嘅實際回報率極具吸引力！」`,
                    underlying_data_fact: `合資格延期年金受保監局嚴格認證，全港納稅人享每年最高 60,000 港元扣稅額。`
                }
            ],
            regulatory_guardrail: {
                gl20_compliance_note: `必須清楚提醒客戶年金若於早期退保將可能蒙受重大本金損失，且扣稅實際金額視乎個人薪俸稅稅階而定。`,
                acknowledged_competitor_advantage: `客觀陳述：部分同業年金計劃提供更靈活之彈性提取年期選項。`,
                official_disclaimer: `【免責聲明】稅務扣除資格以香港稅務局最終評稅結果為準。`
            }
        };
    }
}
exports.CounterPitchEngine = CounterPitchEngine;

"""
scripts/build_morning_assembly_pptx.py
Compiles the 10-slide high-impact Swiss-style Morning Assembly Deck (.pptx)
using python-pptx with embedded speaker notes for each slide.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
OUTPUT_PPTX = os.path.join(OUTPUT_DIR, "morning_assembly_deck.pptx")
ARTIFACT_PPTX = r"C:\Users\rain2\.gemini\antigravity\brain\1b870b1c-62ef-43c1-aaaf-3caf86d37e28\morning_assembly_deck.pptx"

# Presentation Design Palette
COLOR_IKB = RGBColor(0, 47, 167)       # #002FA7 International Klein Blue
COLOR_DARK = RGBColor(15, 23, 42)      # #0f172a Slate 900
COLOR_MUTED = RGBColor(100, 116, 139)  # #64748b Slate 500
COLOR_EMERALD = RGBColor(16, 185, 129) # #10b981
COLOR_AMBER = RGBColor(217, 119, 6)    # #d97706
COLOR_BG_LIGHT = RGBColor(248, 250, 252) # #f8fafc

SLIDES_DATA = [
    {
        "num": "01 / 10",
        "tag": "INSURINTEL HK · MORNING ASSEMBLY INTELLIGENCE",
        "title": "晨會作戰速報：告別被競品牽著走",
        "subtitle": "15 分鐘教你用「客觀精算數據」擊破對手宣傳盲點 · 保監局 GN16 官方披露對賬",
        "takeaway": "核心訊息：顧問不再憑空辯解，用客觀法規與精算數據贏得保民信賴。",
        "bullets": [
            "見客常見僵局：對手宣傳 7% 預期回報，我方產品被客戶質疑保守",
            "傳統銷售痛點：單靠「品牌大、歷史長」已無法說服理性客戶",
            "今日突破：15 分鐘掌握精算對照撕頁與保監局官方對賬武器"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "各位主管同理財顧問夥伴早晨！今日晨會 15 分鐘，我哋唔講抽象大道理，集中攻克大家平時行街最頭痛嘅一幕："
            "當個客攞住第二間保司份 proposal，指住人哋寫嘅 7 釐預期分紅同第 6 年回本，問你點解你間公司好似慢咗，"
            "大家平時點應對？今日同大家分享一套專業、合規而且 100% 用官方客觀數據講嘢嘅精算作戰武器！"
        )
    },
    {
        "num": "02 / 10",
        "tag": "THE CLIENT'S COMMON OBJECTION",
        "title": "「人哋預期 7 釐，點解你得 5 釐？」",
        "subtitle": "投保人眼中只有宣傳單張上的高預期，卻忽視了「演示預期」不等於「真實到賬」",
        "takeaway": "核心訊息：客戶只看表面最高收益數字，直接死撐只會激起客戶防衛心理。",
        "bullets": [
            "競品話術陷阱：過度放大非保證分紅，包裝成「保證回本快、總回報極高」",
            "顧問錯誤應對：直接批評對手「唔靠譜」，反令客戶覺得我方缺乏風度",
            "正確專業視角：引導客戶拆解「保證利益」vs「非保證利益」的法定本質"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "大家回想下，上個禮拜你有冇遇到客問呢句嘢？客戶心態好簡單：大家都係香港一線大保司，"
            "點解佢嗰份幾年就打平，你嗰份要咁耐？如果你直接同個客講『佢間公司唔得㗎、會蝕㗎』，"
            "個客只會覺得你為咗佣金詆毀同行。我哋要學識『用客觀數據引導客戶自己發現問題』，呢個先係 MDRT 嘅段位！"
        )
    },
    {
        "num": "03 / 10",
        "tag": "STATUTORY REGULATORY TRUTH · GN16",
        "title": "分紅實現率：保監局 GN16 法定對賬",
        "subtitle": "香港保監局 GL16（前稱 GN16）強制要求保司每年公開真實派發比率，歷史實現率反映市場波動現實",
        "takeaway": "核心訊息：非保證分紅浮動敞口高達 75%，必須參考官方 GN16 歷史履行軌跡。",
        "bullets": [
            "法規依據：香港保監局《承保長期保險業務指引》(GN16) 法定披露制度",
            "市場實況：部分激進產品非保證紅利實現率低於 85%，甚至出現 60% 區間",
            "對賬力量：當客戶看見官方申報真實走勢圖，對「7% 預期」的盲信瞬間降溫"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "好多客唔知道，原來香港保監局有一個叫 GN16 嘅指引。所有非保證儲蓄險，"
            "每年都要向全港公佈：『當初份 proposal 寫會畀幾多，實際到賬畀咗幾多』。"
            "有啲產品喺大牛市宣傳 7 釐，遇到加息週期同投資市場調整，實現率得返八成。這份官方申報數據，就是你最硬核的合規盾牌！"
        )
    },
    {
        "num": "04 / 10",
        "tag": "BREAKEVEN TRAP & LIQUIDITY HAZARD",
        "title": "第 6 年預期回本 vs 第 14 年保證回本",
        "subtitle": "合約保證現金價值與預期退保總值截然不同，早期退保本金折損高達 70%",
        "takeaway": "核心訊息：不看合約保證回本期的理財方案，都是在給家庭現金流埋雷。",
        "bullets": [
            "數字遊戲：宣傳話「第 6 年回本」，實際合約保證打平本金需要「第 14 年」",
            "退保陷阱：第 5 保單年度退保，保證現金價值往往僅有總繳保費的 24% 左右",
            "專業提問：「陳生，如果家庭急需資金，這筆錢你能確保 10 年內完全不提領嗎？」"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "大家睇睇份計劃書細則：宣傳封面大大隻字寫『第 6 年回本』，翻去第 18 頁精算表，"
            "第 6 年嘅保證現金價值得本金三成！如果個客中途做生意要資金周轉被迫退保，保險公司只會按『保證現金價值』畀佢。"
            "呢個就係專業顧問同普通 Sales 嘅分別：普通 Sales 幫保司賣夢想，專業顧問幫客戶守住底線！"
        )
    },
    {
        "num": "05 / 10",
        "tag": "PRODUCT INNOVATION · INSURINTEL HK",
        "title": "行街見客神器：雙視角 Tear-Sheet",
        "subtitle": "顧問內部私密 HUD 提詞駕駛艙 + 轉身遞給客戶看的中立客觀 Tear-Sheet",
        "takeaway": "核心訊息：離線 5ms 即時精算，雙模態切換，對標保監局 GL20 公平比較原則。",
        "bullets": [
            "顧問私密 HUD：即時提示競品條款死穴、GN16 數據波動、退保價值凹槽",
            "客戶客觀撕頁：一鍵切換中立模式，法定免責與更新時間戳全具備，無侵略性行話",
            "離線零延遲：置地地庫、中環半山咖啡廳無 5G 網絡照樣毫秒級即時運算"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "工欲善其事，必先利其器。我哋團隊正式引入 InsurIntel HK。佢最大嘅亮點係『雙模態分流』："
            "你自己在搭車去見客途中，開住『顧問私密 HUD』，系統將對手產品嘅三個死穴用高光提詞標出嚟；"
            "當你坐喺中環 Starbucks 對面個客，按右上角『客戶視角』，成個界面變成乾淨、中立、高規格嘅機構 Tear-Sheet，"
            "遞畀個客睇，極具機構級財富管理風範！"
        )
    },
    {
        "num": "06 / 10",
        "tag": "LIVE DEMO RUN-THROUGH",
        "title": "現場實測：30 秒破解競品高分紅神話",
        "subtitle": "保司 A (旗艦多幣) vs 保司 B (環球傳承) · 1v1 實戰精算對決",
        "takeaway": "核心訊息：不打口水戰，用 30 年保證 IRR 與 GN16 官方折算說服客戶。",
        "bullets": [
            "第 1 步：選擇雙方產品，系統即時對齊年繳保費 (USD 20,000 x 5 年)",
            "第 2 步：展開對照表，保證回本第 14 年 vs 第 15 年，保證複利 1.75% 顯著清晰",
            "第 3 步：點擊「客戶報告」，即刻生成 WhatsApp 促成卡片與 PDF 專屬名片"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 2 分鐘】\n"
            "我依家開投影現場點擊大家睇。大家睇個螢幕：我揀我哋嘅旗艦多幣，對手揀市場上最常見嘅競品方案。"
            "睇呢度：雙方總保費都係 10 萬美金。對手號稱收益高，但 30 年保證現金價值我方多出 15,000 美金，"
            "保證回本期我方早 1 年打平。再撳呢度『複製 WhatsApp 對照卡』，即刻生成排版整齊嘅重點對比，"
            "見完客 5 分鐘內發到個客 WhatsApp，臨門一腳鎖定信心！"
        )
    },
    {
        "num": "07 / 10",
        "tag": "COMPLIANCE & PRIVACY ASSURANCE",
        "title": "客戶端個資零外洩：PDPO 前端確定性脫敏",
        "subtitle": "對標香港私隱條例 (Cap. 486) 與保監局 GL26 指引，敏感資料內存即刻銷毀",
        "takeaway": "核心訊息：100% 瀏覽器本地運算，不傳送客戶身分證與保單號至任何雲端 API。",
        "bullets": [
            "身分證 (HKID)：自動正則識別並替換為 [HKID_PROTECTED]",
            "電話、電郵、姓名、保單號：於手機本地內存直接遮蔽，絕不上傳",
            "數位簽章日誌：生成 SHA-256 數位指紋，團隊合規抽檢 100% 站得住腳"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "大家最關心合規問題：『我掃個客畀我嘅 proposal，會唔會畀保司合規部話洩漏客戶資料？』"
            "InsurIntel 嚴格對標香港法例第 486 章《個人資料(私隱)條例》同保監局 GL26 人工智能指引。"
            "所有文字喺瀏覽器前端已經做咗確定性脫敏，姓名、電話、身份證全部變做安全保護代碼，"
            "原始個資喺手機內存即時清空，完全唔會流出手機外，合規百分之百安心！"
        )
    },
    {
        "num": "08 / 10",
        "tag": "THE 3-STEP OBJECTION HANDLING FORMULA",
        "title": "成交實戰三步法：認同、拆解、鎖定",
        "subtitle": "高段位理財顧問的談客對話模板：從被動辯解轉為主動掌握主導權",
        "takeaway": "核心訊息：先肯定客戶對收益的渴望，再用保證價值與流動性鎖定我方方案。",
        "bullets": [
            "步驟一【同理認同】：「陳生，呢份計劃書寫嘅 7% 預期真係好吸引，我都明白你點解想揀佢。」",
            "步驟二【數據拆解】：「但我想同你一齊睇睇保監局披露嘅真實紅利實現率，同埋第 6 年同第 14 年嘅保證價值分別。」",
            "步驟三【價值鎖定】：「既然是為孩子做 20 年傳承，我們是不是更應該把『確定拿得到的保證部分』放第一位？」"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "請全體顧問背熟呢三句金句！第一步千祈唔好反駁，先認同個客嘅眼光：『我都覺得個預期好吸引』；"
            "第二步，輕描淡寫遞出數據：『但我哋一齊睇睇保險公司合約承諾嘅底線』；"
            "第三步，將個客由『追逐虛假高預期』拉返去『穩健傳承確定性』。只要你用呢個三步法，"
            "客戶會覺得你先係真心為佢利益著想嘅私人財富顧問，張單就穩陣！"
        )
    },
    {
        "num": "09 / 10",
        "tag": "DISTRICT TEAM PILOT & ECONOMICS",
        "title": "分區團隊 14 天實戰試點計劃",
        "subtitle": "專屬 15 位顧問席位 · 晨會速報每日同步 · 只要多救回 1 張單，ROI 超過 1,000%",
        "takeaway": "核心訊息：團隊作戰武器統一，用標準化精算工具拉高整區新人簽單勝率。",
        "bullets": [
            "團隊配置：15 席顧問展業權限 + 每日晨會市場速報投影片同步更新",
            "成本效益：團隊版每月僅 HK$2,480，平均每位顧問每天成本僅約 HK$5.5",
            "業績槓桿：單月救回或促成 1 張 USD 20,000 儲蓄單，實收佣金即可覆蓋一年軟件成本"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1.5 分鐘】\n"
            "各位總監同主管：今日我哋分區正式啟動 14 天實戰試點。每組分配 15 個顧問席位，"
            "包含自定義團隊名片、每日 06:30 自動更新嘅晨會投影片。成個團隊一個月只需要 HK$2,480，"
            "15 個人每人每日只係一杯茶餐廳奶茶嘅五分一！只要新人喺見客嗰陣用呢個工具守住或者搶返 1 張年繳 2 萬美金嘅單，"
            "成區嘅實收佣金回報率超過 10 倍！"
        )
    },
    {
        "num": "10 / 10",
        "tag": "ACTION TODAY · MDRT COMMITMENT",
        "title": "即日行動：掃碼登入 · 武裝專業武器",
        "subtitle": "立即登入體驗虛擬示範模式 · 下午見客實戰應用 · 衝刺年度 MDRT / COT",
        "takeaway": "核心訊息：專業是最好的銷售說服力，用科技與客觀數據贏得全港高淨值客戶。",
        "bullets": [
            "今日動作 1：掃描螢幕二維碼或打開群組連結，收藏 PWA 至手機桌面",
            "今日動作 2：點擊「示範模式」體驗保司 A vs 保司 B 對戰與掃描器",
            "今日動作 3：下午約見客戶即刻實測，感受客觀 Tear-Sheet 帶來的信任提升"
        ],
        "notes": (
            "【講稿備忘 · 演講時間 1 分鐘】\n"
            "最後 1 分鐘：今日晨會講完，行動最緊要！請大家而家攞出手機，掃描螢幕右上角二維碼，"
            "或者喺 WhatsApp 群組點開鏈接。將佢『加入主畫面』，佢就係你手機入面隨時可用嘅離線精算雷達。"
            "今日晏晝約咗客嘅同事，即刻攞出嚟試用！祝大家今日全部開單大吉，今年全部上 MDRT、COT！多謝大家！"
        )
    }
]

def build_presentation():
    prs = Presentation()
    # 16:9 Aspect Ratio (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # Blank slide layout

    for data in SLIDES_DATA:
        slide = prs.slides.add_slide(blank_layout)

        # 1. Top Bar / Chrome Banner
        chrome_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(0.4))
        tf_c = chrome_box.text_frame
        tf_c.word_wrap = True
        p_c = tf_c.paragraphs[0]
        p_c.text = f"{data['tag']}  |  {data['num']}"
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = COLOR_IKB

        # 2. Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.95), Inches(11.733), Inches(0.9))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = data["title"]
        p_t.font.size = Pt(28)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_DARK

        # 3. Slide Subtitle / Single Message
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.85), Inches(11.733), Inches(0.6))
        tf_s = sub_box.text_frame
        tf_s.word_wrap = True
        p_s = tf_s.paragraphs[0]
        p_s.text = data["subtitle"]
        p_s.font.size = Pt(14)
        p_s.font.color.rgb = COLOR_MUTED

        # 4. Main Body Content (3 Bullet Points with Accent Bar)
        body_box = slide.shapes.add_textbox(Inches(0.8), Inches(2.6), Inches(11.733), Inches(3.2))
        tf_b = body_box.text_frame
        tf_b.word_wrap = True

        for i, bullet in enumerate(data["bullets"]):
            p_b = tf_b.add_paragraph() if i > 0 else tf_b.paragraphs[0]
            p_b.text = f"•  {bullet}"
            p_b.font.size = Pt(16)
            p_b.font.color.rgb = COLOR_DARK
            p_b.space_after = Pt(18)

        # 5. Bottom Key Takeaway Callout Box
        callout_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.0), Inches(11.733), Inches(0.8))
        tf_call = callout_box.text_frame
        tf_call.word_wrap = True
        p_call = tf_call.paragraphs[0]
        p_call.text = f"📌 {data['takeaway']}"
        p_call.font.size = Pt(13)
        p_call.font.bold = True
        p_call.font.color.rgb = COLOR_IKB

        # 6. Speaker Notes
        notes_slide = slide.notes_slide
        tf_n = notes_slide.notes_text_frame
        tf_n.text = data["notes"]

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    prs.save(OUTPUT_PPTX)
    print(f"[PPTX Generator] Successfully compiled 10-slide deck to: {OUTPUT_PPTX}")

    try:
        import shutil
        os.makedirs(os.path.dirname(ARTIFACT_PPTX), exist_ok=True)
        shutil.copyfile(OUTPUT_PPTX, ARTIFACT_PPTX)
        print(f"[PPTX Generator] Copied deck to artifact path: {ARTIFACT_PPTX}")
    except Exception as e:
        print(f"[PPTX Generator] Warning copying to artifact path: {e}")

if __name__ == "__main__":
    build_presentation()

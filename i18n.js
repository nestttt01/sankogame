(function () {
    'use strict';

    const UI_LANGUAGE_STORAGE_KEY = 'sanko_ui_language_v1';
    const SUPPORTED_UI_LANGUAGES = new Set(['zh-TW', 'en', 'ja']);
    const M = {
        '角色': ['Character', 'キャラクター'],
        '情境': ['Scenario', 'シナリオ'],
        '新角色': ['New Character', '新キャラクター'],
'未知': ['Unknown', '不明'],
'未命名存檔': ['Untitled Save', '無題のデータ'],
'未命名配置': ['Untitled Preset', '無題の設定'],
'目前配置': ['Current Preset', '現在の設定'],
'測試語氣': ['Test Voice', '口調テスト'],
'生成中...': ['Generating...', '生成中...'],
'沒有取得測試內容。': ['No test line returned.', 'テスト内容を取得できませんでした。'],
'暫時無法測試語氣。': ['Voice test is temporarily unavailable.', '現在、口調テストを利用できません。'],
'匯出目前配置': ['Export Current Preset', '現在の設定をエクスポート'],
'匯入配置': ['Import Preset', '設定をインポート'],
'儲存配置': ['Save Preset', '設定を保存'],
'另存配置：請輸入新的配置檔名': ['Save Preset As: enter a new preset name', '設定を別名保存：新しい設定名を入力してください'],
'已另存新檔為「{name}」！基礎屬性已被鎖定！': ['Saved as “{name}”. Base stats are locked.', '「{name}」として別名保存しました。基本能力値はロックされました。'],
'人物': ['Characters', '人物'],
'人物/情境': ['Characters / Scenario', '人物／シナリオ'],
'全選': ['Select All', 'すべて選択'],
'找到 {filtered} / {total} 條紀錄': ['Found {filtered} / {total} entries', '{filtered} / {total} 件見つかりました'],
'共 {total} 條紀錄；每頁最多 {pageSize} 條': ['{total} entries; up to {pageSize} per page', '全 {total} 件；1ページ最大 {pageSize} 件'],
'匯出': ['Export', '書き出し'],
'匯出選取': ['Export Selected', '選択を書き出し'],
'刪除選取配置': ['Delete Selected Presets', '選択した設定を削除'],
'確定要刪除 {count} 個配置嗎？': ['Delete {count} presets?', '{count} 個の設定を削除しますか？'],
'已刪除 {count} 個配置。': ['Deleted {count} presets.', '{count} 個の設定を削除しました。'],
'目前使用中': ['In Use', '使用中'],
'已上鎖': ['Locked', 'ロック中'],
'綁定': ['Bound to', '紐づけ'],
'綁定情境': ['Linked Scenario', '紐づくシナリオ'],
'尚未建立情境': ['No scenario yet', 'シナリオ未作成'],
'份紀錄': ['records', '件の記録'],
'請先勾選要刪除的配置。': ['Select presets to delete first.', '削除する設定を先に選択してください。'],
'勾選的配置目前都不能刪除。': ['The selected presets cannot be deleted right now.', '選択した設定は現在削除できません。'],
'匯出全部': ['Export All', 'すべて書き出し'],
'請先勾選要刪除的記憶紀錄。': ['Select memory records to delete first.', '削除する記憶記録を先に選択してください。'],
'請先勾選要匯出的記憶紀錄。': ['Select memory records to export first.', '書き出す記憶記録を先に選択してください。'],
'找不到可匯出的記憶紀錄。': ['No memory records available to export.', '書き出せる記憶記録が見つかりません。'],
'目前沒有資料可以匯出。': ['There is no data to export.', '書き出せるデータがありません。'],
'確定要刪除 {count} 個記憶紀錄嗎？此操作無法復原。': ['Delete {count} memory records? This cannot be undone.', '{count}件の記憶記録を削除しますか？この操作は元に戻せません。'],
'修改記憶紀錄檔名': ['Rename memory record', '記憶記録名を変更'],
'選取此記憶紀錄': ['Select this memory record', 'この記憶記録を選択'],
'配置匯入匯出': ['Preset import/export', '設定のインポート／エクスポート'],
'觀察四周': ['Look Around', '周囲を見る'],
'向最近的人搭話': ['Talk to Someone Nearby', '近くの人に話しかける'],
'檢查身上的物品': ['Check Inventory', '持ち物を確認'],
'標記為重要': ['Mark Important', '重要にする'],
'取消重要標記': ['Unmark Important', '重要を解除'],
'保留人物，隨機世界／情境': ['Keep Characters, Randomize Scenario', '人物を残してシナリオ生成'],
        '人物與世界全部隨機': ['Randomize Everything', 'すべてランダム生成'],
        '保留目前玩家與 NPC 設定，只產生適合這些人物的世界觀與情境。': ['Keep the current player and NPC settings, and generate a world/scenario suited to them.', '現在のプレイヤーとNPC設定を残し、その人物に合う世界観とシナリオだけを生成します。'],
        'AI 會重新產生玩家設定、NPC 與情境；頭像不會傳給 AI，套用前可先預覽。': ['AI regenerates the player, NPCs, and scenario. Images are not sent to AI, and you can preview before applying.', 'AIがプレイヤー、NPC、シナリオを再生成します。画像はAIに送信されず、適用前にプレビューできます。'],
        '暫時無法取得瀏覽器容量資訊；存檔功能仍可正常使用。': ['Storage details are temporarily unavailable; data still works.', '容量情報を一時的に取得できませんが、データ機能は通常どおり使えます。'],
        '目前沒有遊戲存檔；建立存檔後會在這裡提醒備份。': ['No game data yet. Backup reminders appear here after you create one.', 'ゲームデータはまだありません。作成後、ここにバックアップ通知が表示されます。'],
        '尚未記錄到匯出備份；建議現在按下方「匯出」。': ['No export backup has been recorded yet. Use Export below now.', 'エクスポート済みバックアップはまだ記録されていません。下の「エクスポート」を押してください。'],
        '目前沒有可查看的冒險紀錄。': ['No adventure log entries to view.', '表示できる冒険ログはありません。'],
        '請先建立遊戲存檔。': ['Create game data first.', '先にゲームデータを作成してください。'],
        '第 0 / 0 頁': ['Page 0 / 0', '0 / 0 ページ'],
        '沒有符合搜尋條件的紀錄。': ['No entries match your search.', '検索条件に一致する記録はありません。'],
        '故事剛開始，目前尚無重大事件發生。': ['The story has just begun. No major events have happened yet.', '物語は始まったばかりで、重大な出来事はまだ起きていません。'],
        '旅途筆記': ['Journey Notes', '旅ノート'],
        '旅途筆記': ['Journey Notes', '旅ノート'],
        'API說明': ['API', 'API説明'],
        '遊戲玩法': ['Guide', '遊び方'],
        '角色配置': ['Characters', 'キャラクター'],
        '存檔': ['Data', 'データ'],
        '語言切換': ['Language', '言語切替'],
        'API 說明': ['API Guide', 'API説明'],
        '這個遊戲會用你的 API Key 呼叫 AI。請先選擇服務商、貼上對應金鑰並完成驗證；金鑰不會被放進遊戲備份。': ['This game calls AI with your API key. Choose a provider, paste the matching key, and verify it; keys are not included in game backups.', 'このゲームはあなたのAPIキーでAIを呼び出します。サービスを選び、対応するキーを貼り付けて認証してください。キーはゲームのバックアップに含まれません。'],
        '1. API 金鑰': ['1. API Key', '1. APIキー'],
        '1. API Key 是什麼？': ['1. What is an API Key?', '1. APIキーとは？'],
        'API Key 是 AI 服務用來辨識使用者與計算用量的金鑰，不是遊戲帳號或遊戲密碼。請向 Google AI Studio 或 OpenRouter 申請，並妥善保管。': ['An API key lets the AI service identify you and track usage. It is not a game account or game password. Get one from Google AI Studio or OpenRouter and keep it private.', 'APIキーはAIサービスが利用者を識別し、使用量を計算するための鍵です。ゲームのアカウントやパスワードではありません。Google AI StudioまたはOpenRouterで取得し、大切に保管してください。'],
        '2. Gemini 與 OpenRouter': ['2. Gemini & OpenRouter', '2. GeminiとOpenRouter'],
        '選擇 Google Gemini 時，請使用 Google AI Studio 提供的金鑰；選擇 OpenRouter 時，請使用 OpenRouter 金鑰。兩種金鑰不能互換。': ['Use a Google AI Studio key for Google Gemini, and an OpenRouter key for OpenRouter. The two key types cannot be swapped.', 'Google GeminiにはGoogle AI Studioのキー、OpenRouterにはOpenRouterのキーを使用します。2種類のキーは互換できません。'],
        '輕量模型通常回覆較快、用量較省，適合測試設定或日常遊玩；較大型模型通常更擅長長篇劇情、人物語氣與複雜指令。': ['Lightweight models are usually faster and cheaper; larger models often handle long stories, character voices, and complex instructions better.', '軽量モデルは高速で使用量を抑えやすく、大型モデルは長編、口調、複雑な指示に向く傾向があります。'],
        '4. 金鑰保存': ['4. Key Storage', '4. キーの保存'],
        '未開啟「在這台裝置保留金鑰」時，金鑰只在目前頁面使用。共用裝置請勿開啟保存功能；匯出備份不包含 API Key。': ['When “Keep key on this device” is off, the key is used only for this page session. Do not enable it on shared devices; exported backups do not include API keys.', '「この端末にキーを保存」をオフにすると、キーは現在のページだけで使用されます。共有端末では有効にしないでください。エクスポートにはAPIキーは含まれません。'],
        '完成 API 驗證並選好模型後，先建立角色與情境，再進入存檔輸入第一個行動，就可以開始單人 TRPG。': ['After verifying the API key and choosing a model, create characters and scenarios, open a save, and type your first action to start the solo TRPG.', 'API認証とモデル選択が終わったら、キャラクターとシナリオを作成し、データを開いて最初の行動を入力するとソロTRPGを開始できます。'],
        '5. 驗證失敗時': ['5. If Verification Fails', '5. 認証に失敗したとき'],
        '請先確認服務商與金鑰來源一致，再檢查金鑰是否完整貼上、是否有多餘空白、帳號是否已開通 API 權限。OpenRouter 模型清單會依帳號與服務狀態變動。': ['First confirm that the provider matches the key source, then check that the key was pasted completely, has no extra spaces, and that the account has API access enabled. OpenRouter model lists can change by account and service status.', 'まずサービス提供元とキーの発行元が一致しているか確認し、キーが完全に貼り付けられているか、余分な空白がないか、アカウントでAPI権限が有効か確認してください。OpenRouterのモデル一覧はアカウントやサービス状態で変わることがあります。'],
        '6. 使用量與隱私': ['6. Usage & Privacy', '6. 使用量とプライバシー'],
        '遊戲會把劇情上下文送到你選擇的 AI 服務商，用量與費用由該服務商計算。匯出遊戲備份不會包含 API Key；換裝置後需要重新驗證。': ['The game sends story context to the AI provider you choose. Usage and cost are calculated by that provider. Exported backups do not include the API key; verify again after switching devices.', 'ゲームは選択したAIサービスへ物語の文脈を送信します。使用量と費用はそのサービス側で計算されます。エクスポートしたバックアップにAPIキーは含まれません。端末を変えた場合は再認証が必要です。'],
        '7. 模型建議': ['7. Model Suggestions', '7. モデルのおすすめ'],
        '測試設定時可先用較快、較省的模型；長篇劇情、複雜角色語氣或需要穩定記憶整理時，再切換到較大型模型。模型可以在遊戲內切換。': ['Use a faster, cheaper model while testing settings; switch to a larger model for long stories, complex character voices, or steadier memory organization. Models can be changed in game.', '設定を試す間は高速で軽いモデルを使い、長編、複雑な口調、安定した記憶整理が必要なときは大型モデルへ切り替えてください。モデルはゲーム内で変更できます。'],
        '1. 單人 AI TRPG': ['1. Solo AI TRPG', '1. ソロAI TRPG'],
        '1. 這是什麼？': ['1. What is this?', '1. これは何？'],
        '這是一個單人 AI TRPG／劇情模擬器。你可以建立自己的角色、NPC 與世界觀，讓 AI 擔任 DM、旁白及其他角色。': ['This is a solo AI TRPG and story simulator. You create your character, NPCs, and world, while AI plays the DM, narrator, and other characters.', 'これはソロ用AI TRPG／物語シミュレーターです。自分のキャラクター、NPC、世界観を作り、AIがDM、語り手、ほかのキャラクターを担当します。'],
        '2. 角色與情境': ['2. Characters & Scenarios', '2. キャラクターとシナリオ'],
        '角色配置可以管理玩家、NPC、情境與遊戲設定。桌機版的側邊籤會切換不同設定頁，返回首頁時會保存目前配置。': ['Characters manages the player, NPCs, scenarios, and game settings. On desktop, side tabs switch setup pages; returning home saves the current preset.', 'キャラクターではプレイヤー、NPC、シナリオ、ゲーム設定を管理します。PC版ではサイドタブで設定ページを切り替え、ホームに戻ると現在の設定が保存されます。'],
        '3. 遊戲輸入': ['3. Game Input', '3. 入力方法'],
        '進入遊戲後，直接輸入角色想說的話或想做的事，也可以點選 AI 提供的選項。高風險行動可用 D20 判定。': ['In game, type what your character says or does, or choose an AI-provided option. Risky actions can use D20 checks.', 'ゲーム中は、キャラクターの台詞や行動を直接入力するか、AIの選択肢を選べます。リスクの高い行動にはD20判定を使えます。'],
        '4. 角色面板與日誌': ['4. Character Panel & Log', '4. キャラクターパネルとログ'],
        '角色面板會保存狀態、道具、Flags、任務、摘要與關係；冒險日誌可以搜尋、分頁、編輯或整理，不會因摘要更新而消失。': ['The character panel stores states, items, flags, tasks, summaries, and relationships; the adventure log can be searched, paged, edited, or organized, and will not disappear when summaries update.', 'キャラクターパネルは状態、アイテム、フラグ、タスク、要約、関係を保存します。冒険日誌は検索、ページ送り、編集、整理ができ、要約更新で消えることはありません。'],
        '5. 玩家模式與旁白模式': ['5. Player Mode & Narration Mode', '5. プレイヤーモードとナレーションモード'],
        '一般輸入會視為玩家角色的行動或台詞。若你想直接調整場景、時間、人物或事件，可以使用創作者／旁白式指令，系統會避免把它當成角色台詞。': ['Normal input is treated as the player character action or dialogue. To directly adjust scenes, time, people, or events, use creator/narration-style instructions so the system avoids reading them as character lines.', '通常の入力はプレイヤーキャラクターの行動や台詞として扱われます。場面、時間、人物、事件を直接調整したい場合は、作成者／ナレーション式の指示を使うと、キャラクターの台詞として扱われにくくなります。'],
        '6. D20 判定': ['6. D20 Checks', '6. D20判定'],
        '高風險行動可以使用 D20。AI 會依照角色能力、場景難度與當前狀態判讀結果，並把重要變化寫回角色面板。': ['High-risk actions can use D20 checks. The AI reads the result using character stats, scene difficulty, and current state, then writes important changes back to the character panel.', 'リスクの高い行動にはD20判定を使えます。AIは能力値、場面の難易度、現在の状態から結果を判断し、重要な変化をキャラクターパネルへ書き戻します。'],
        '7. 記憶整理': ['7. Memory Organization', '7. 記憶整理'],
        '長篇遊玩時，可以整理摘要或冒險日誌，降低重複事件與上下文負擔。完整事件會留在日誌裡，不會因摘要變短而被直接刪除。': ['During long play, organize summaries or the adventure log to reduce repeated events and context load. Full events remain in the log and are not deleted just because a summary becomes shorter.', '長く遊ぶときは、要約や冒険日誌を整理して重複イベントや文脈負荷を減らせます。完全な出来事は日誌に残り、要約が短くなっただけで削除されません。'],
        '8. 建議流程': ['8. Suggested Flow', '8. おすすめの流れ'],
        '先設定玩家與 NPC，再建立世界觀與第一個情境。進入存檔後輸入第一個行動，遊玩幾回合後再回角色面板微調狀態，會比一開始填滿所有欄位更順。': ['Set up the player and NPCs first, then create the world and first scenario. After entering a save, type the first action; after a few turns, return to the character panel to fine-tune states. This is smoother than filling every field at the start.', 'まずプレイヤーとNPCを設定し、世界観と最初のシナリオを作ります。データに入ったら最初の行動を入力し、数ターン遊んでからキャラクターパネルで状態を微調整すると、最初から全項目を埋めるより進めやすくなります。'],
        '調整頭像': ['Adjust Avatar', 'アバター調整'],
        '拖曳移動；手機可雙指縮放': ['Drag to move; pinch to zoom on mobile.', 'ドラッグで移動、スマホではピンチで拡大できます。'],
        '確認': ['Confirm', '確認'], '取消': ['Cancel', 'キャンセル'],
        '🗺️ 發現新情境 / 切換空間': ['🗺️ New Scenario / Change Location', '🗺️ 新しいシナリオ／場所の切替'],
        '新情境名稱 (如: 某人的夢境)': ['Scenario name (e.g. Someone’s Dream)', 'シナリオ名（例：誰かの夢）'],
        '環境法則與世界觀': ['World Rules & Setting', '世界観と環境ルール'],
        'NPC 們在此的身分/狀態': ['NPC roles/status here', 'ここでのNPCの役割／状態'],
        '玩家專屬身分': ['Player role', 'プレイヤーの役割'],
        '轉場規則（選填）': ['Transition rules (optional)', '場面転換ルール（任意）'],
        '確認建立並傳送': ['Create and Send', '作成して送信'],
        '玩家狀態與面板': ['Status Panel', 'ステータスパネル'],
        '另存新配置': ['Save as New', '別名で保存'],
        '儲存並返回': ['Save & Return', '保存して戻る'], '儲存': ['Save', '保存'],
        '狀態': ['Status', 'ステータス'], '紀錄': ['Log', '記録'], '設定': ['Settings', '設定'],
        '情境': ['Scenario', 'シナリオ'], '當前': ['Current', '現在'], 'NPC 好感摘要': ['NPC Affection', 'NPC好感度'], '尚未設定 NPC。': ['No NPCs yet.', 'NPCはまだいません。'],
        '狀態旗標 / Flags': ['Status Flags', '状態フラグ'],
        'AI 會依據這些狀態銜接劇情、Buff/Debuff 與長期影響。': ['AI uses these states to continue the story, buffs/debuffs, and long-term effects.', 'AIはこれらの状態を参照して物語、バフ／デバフ、長期的な影響をつなげます。'],
        '加入': ['Add', '追加'], '玩家道具': ['Player Items', 'プレイヤー所持品'],
        '目前持有、失去或劇情產生的重要物品。': ['Important items currently held, lost, or created by the story.', '現在所持・紛失、または物語で生まれた重要アイテムです。'],
        '介面語言': ['Display Language', '表示言語'], '輸出語言': ['Output Language', '出力言語'], '繁體中文': ['Traditional Chinese', '繁体字中国語'],
        '日文台詞 + 繁中翻譯': ['Japanese dialogue + Traditional Chinese translation', '日本語台詞＋繁体字中国語訳'],
        '英文台詞 + 繁中翻譯': ['English dialogue + Traditional Chinese translation', '英語台詞＋繁体字中国語訳'],
        '自動依玩家語言': ['Auto-detect player language', 'プレイヤー言語を自動判定'],
        '詳細設定': ['Details', '詳細'],
        '玩家、NPC 與情境的詳細欄位集中在這裡。跑團中只想看摘要時，回到「狀態」頁即可。': ['Detailed player, NPC, and scenario fields are here. Return to Status when you only need a summary.', 'プレイヤー、NPC、シナリオの詳細項目はこちらです。要約だけを見る場合は「ステータス」に戻ってください。'],
        '編輯玩家細節設定': ['Edit Player Details', 'プレイヤー詳細を編集'],
        '登場 NPC 管理': ['Manage NPCs', 'NPC管理'], '情境空間管理': ['Manage Scenes', 'シーン管理'],
        '角色名稱': ['Character Name', 'キャラクター名'], '目前好感度': ['Current Affection', '現在の好感度'], '目前好感度（死亡後停止）': ['Current Affection (locked after death)', '現在の好感度（死亡後は固定）'],
        '已死亡': ['Deceased', '死亡'], '已死亡・復活失敗': ['Deceased · Revival Failed', '死亡・復活失敗'],
        '動態狀態': ['Dynamic Status', '動的ステータス'], '當前情緒': ['Current Mood', '現在の気分'],
        '身體／外觀狀態': ['Physical / Appearance', '身体／外見の状態'], '此刻對玩家／隊伍的個人態度': ['Current Attitude to Player / Party', 'プレイヤー／仲間への現在の態度'],
        '當前目標': ['Current Goal', '現在の目標'], '角色專屬約定／秘密（完整保留；每行一個短標題）': ['Character Promises / Secrets (one short title per line)', 'キャラクター固有の約束／秘密（1行に短い見出し1件）'],
        'AI 重要紀錄追加已暫停；仍可手動修改': ['Automatic memory updates are paused; manual edits are still available.', '重要記録の自動追加は一時停止中です。手動編集は可能です。'],
        '讀取摘要': ['Story Summary', '参照サマリー'],
        '每回合會自動更新重點、任務與關係；完整冒險紀錄仍保留在下方，不會自動刪除。': ['Story highlights, tasks, and relationships update each turn. The full adventure log remains below and is never deleted automatically.', '各ターンで重要事項、タスク、関係が更新されます。冒険記録は下に残り、自動削除されません。'],
        '整理摘要': ['Organize Summary', 'サマリーを整理'], '開啟完整冒險日誌': ['Show Full Log', '全ログを表示'],
        '收起完整冒險日誌': ['Hide Full Log', '全ログを閉じる'],
        '完整紀錄可直接在本分頁展開；AI 仍會讀取同一份存檔資料。': ['The full log opens in this tab and uses the same save data.', '全ログはこのタブで開き、同じデータデータを参照します。'],
        '重點劇情': ['Story Highlights', '重要イベント'],
        '用 3～8 條保留目前劇情主線、最近重大轉折與當前場景狀況。': ['Keep 3–8 points covering the main plot, recent turning points, and current scene.', '現在の本筋、直近の転機、現在の場面を3～8項目で残します。'],
        '任務清單': ['Tasks', 'タスク'],
        '遇到新任務會新增空格；事件完成後會自動打勾，也可以手動修改。': ['New tasks are added automatically and checked when completed. You can also edit them manually.', '新しいタスクは自動で追加され、完了時にチェックされます。手動編集も可能です。'],
        '＋新增': ['＋ Add', '＋ 追加'], '整體角色關係圖': ['Relationships', '関係図'],
        '只記角色彼此之間的全局關係、重大承諾、界線與張力；每位 NPC 此刻對玩家的態度放在「設定 → 動態狀態」。': ['Record global relationships, major promises, boundaries, and tension. Each NPC’s current attitude belongs under Settings → Dynamic Status.', '全体的な関係、重要な約束、境界線、緊張感を記録します。各NPCの現在の態度は「設定 → 動的状態」にあります。'],
        'API 使用追蹤': ['API Usage', 'API使用量'],
        '只儲存在本機瀏覽器。匯出存檔時會一起保存，匯入時可恢復；清除瀏覽器資料或清除設備資料會刪除。': ['Stored only in this browser. It is included in exports and restored on import; clearing browser or device data removes it.', 'このブラウザ内だけに保存されます。エクスポート／インポートに含まれ、ブラウザまたは端末データを消去すると削除されます。'],
        '遊戲玩法與系統指南': ['Game Guide', 'ゲームガイド'],
        '第一次玩，從這裡開始': ['First time? Start here', '初めての方はこちら'],
        'API 金鑰的設定、隱私與錯誤排除請直接查看首頁說明。完成驗證並選好模型後，依序建立角色與情境、進入存檔，再輸入第一個行動即可開始。': ['See the home page for API setup, privacy, and troubleshooting. After verification, choose a model, create characters and a scenario, enter a save, and type your first action.', 'API設定、プライバシー、トラブル対処はホーム画面をご覧ください。認証後にモデルを選び、キャラクターとシナリオを作成し、データを開いて最初の行動を入力します。'],
        '1. 這是什麼？': ['1. What is this?', '1. これは何？'],
        '這是一個單人 AI TRPG／劇情模擬器。你可以建立自己的角色、NPC 與世界觀，讓 AI 擔任 DM、旁白及其他角色，陪你進行冒險、戀愛、日常、懸疑或任何想玩的故事。': ['A solo AI TRPG/story simulator. Create your own character, NPCs, and world, then let AI act as the GM, narrator, and other characters for adventures, romance, slice-of-life, mystery, or any story you want.', '一人用のAI TRPG／物語シミュレーターです。自分のキャラクター、NPC、世界観を作り、AIをGM・ナレーター・他の登場人物として、冒険、恋愛、日常、ミステリーなど好きな物語を楽しめます。'],
        '2. 建立角色、NPC 與情境': ['2. Create Characters, NPCs & Scenarios', '2. キャラクター、NPC、シナリオを作る'],
        '進入「劇本創角」後，使用左側的「角色設定」、「情境設定」與「遊戲設定」切換不同內容。角色設定可編輯玩家與每一位 NPC 的頭像、名稱及人物資料；情境設定用來建立世界觀、身分與轉場規則。切換標籤時，尚未離開頁面的修改不會被重置。': ['Open Character Setup and use the Character, Scenario, and Game tabs on the left. Character settings edit the player and each NPC; Scenario settings define the world, roles, and transitions. Switching tabs does not reset unsaved edits.', '「キャラクター作成」を開き、左側の「キャラクター設定」「シナリオ設定」「ゲーム設定」を切り替えます。タブを切り替えても、ページを離れるまで編集内容はリセットされません。'],
        '3. 情境生成與遊戲設定': ['3. Scenario Generation & Game Settings', '3. シナリオ生成とゲーム設定'],
        '情境設定集中管理世界觀與 AI 隨機生成；遊戲設定則管理配置名稱、輸出語言、遊戲難度與備份。你可以保留人物只隨機產生情境，也可以讓 AI 將人物與情境全部隨機。生成結果會先讓你確認，不會在未套用前直接覆蓋目前內容；返回首頁時，系統會保存目前配置。': ['Scenario Settings manages worldbuilding and AI random generation; Game Settings manages preset name, output language, difficulty, and backups. Keep existing characters and generate only scenarios, or generate everything. Results are previewed before being applied, and the current preset is saved when you return home.', 'シナリオ設定では世界観とAIランダム生成を管理し、ゲーム設定では設定名、出力言語、難易度、バックアップを管理します。人物を残してシナリオだけ生成することも、すべて生成することもできます。結果は適用前に確認でき、ホームへ戻ると現在の設定が保存されます。'],
        '4. 怎麼玩？': ['4. How to Play', '4. 遊び方'],
        '進入遊戲後，直接在下方輸入角色想說的話或想做的事。你也可以點選 AI 提供的選項。若行動具有風險，可以使用骰子按鈕進行 D20 判定；系統會依角色能力、難度與骰點決定成功或失敗。NPC 只有在劇情明確確認時才會死亡；標準模式可由劇情或「神」復活，困難模式每次死亡只有一次復活檢定，極限模式則永久死亡。': ['Type what your character says or does, or choose an AI suggestion. Risky actions can use a D20 check based on ability, difficulty, and roll. NPC death requires explicit story confirmation; revival rules depend on game difficulty.', 'キャラクターの台詞や行動を入力するか、AIの選択肢を選びます。危険な行動は能力、難易度、出目によるD20判定が可能です。NPCの死亡は物語上の明確な確定が必要で、復活ルールは難易度で変わります。'],
        '5. 玩家、旁白與「神」模式': ['5. Player, Narrator & Creator Mode', '5. プレイヤー、ナレーター、「神」モード'],
        '一般輸入會被視為玩家角色的行動。輸入 ［切換旁白］ 可以改用場外視角安排環境、鏡頭與 NPC 行動；輸入 ［切換玩家］ 就能回到玩家角色。「神」按鈕則是創作者模式，可以直接調整場景、時間、人物或事件。神模式的內容不會被 NPC 當成玩家說出口的話。': ['Normal input is treated as the player character action. Type [Switch to Narrator] to arrange the environment, camera, and NPC actions from an outside view; type [Switch to Player] to return to the player character. The God button is creator mode, letting you directly adjust scenes, time, characters, or events. God mode content will not be treated as something the player said aloud to NPCs.', '通常の入力はプレイヤーキャラクターの行動として扱われます。［ナレーターに切替］と入力すると、場外視点で環境、カメラ、NPCの行動を配置できます。［プレイヤーに切替］でプレイヤーキャラクターに戻ります。「神」ボタンは作成者モードで、場面、時間、人物、事件を直接調整できます。神モードの内容は、NPCに対してプレイヤーが発言した言葉として扱われません。'],
        '一般輸入會被視為玩家角色的行動。輸入': ['Normal input is treated as the player character’s action. Enter', '通常入力はプレイヤーキャラクターの行動として扱われます。'],
        '［切換旁白］': ['[Switch to Narrator]', '［ナレーターに切替］'],
        '可以改用場外視角安排環境、鏡頭與 NPC 行動；輸入': ['switches to an outside perspective for environments, camera, and NPC actions; enter', 'で場外視点から環境、カメラ、NPC行動を指定できます。'],
        '［切換玩家］': ['[Switch to Player]', '［プレイヤーに切替］'],
        '就能回到玩家角色。「神」按鈕則是創作者模式，可以直接調整場景、時間、人物或事件。神模式的內容不會被 NPC 當成玩家說出口的話。': ['to return to the player character. The Creator button directly adjusts scenes, time, people, or events; NPCs will not treat those instructions as spoken dialogue.', 'でプレイヤーに戻ります。「神」ボタンは場面、時間、人物、出来事を直接調整する作者モードで、NPCはその内容をプレイヤーの発言として扱いません。'],
        '6. 角色面板與冒險日誌': ['6. Character Panel & Adventure Log', '6. キャラクターパネルと冒険日誌'],
        '角色面板可以查看與修改玩家狀態、NPC、道具、Flags、任務、劇情摘要及角色關係；AI 每回合會參考這些重點資料來延續故事。面板內的冒險日誌只顯示目前這份遊戲紀錄，完整事件可以搜尋、分頁、編輯或整理，不會因摘要更新而自動消失。桌機版按「儲存」後面板會保持開啟，可點側邊標籤收回；手機版則使用「儲存並返回」。': ['View and edit player status, NPCs, items, flags, tasks, summaries, and relationships. The embedded adventure log belongs only to the current save. On desktop, Save keeps the panel open; use the side tab to collapse it. Mobile uses Save & Return.', 'プレイヤー状態、NPC、アイテム、フラグ、タスク、要約、関係を確認・編集できます。パネル内の日誌は現在のデータ専用です。PC版では保存後も開いたままで、サイドタブから閉じられます。スマホ版は「保存して戻る」を使います。'],
        '7. 遊戲紀錄、配置與備份': ['7. Saves, Presets & Backups', '7. データ、設定、バックアップ'],
        '每份遊戲紀錄都會綁定目前使用的角色配置，彼此的摘要、任務、關係與冒險日誌會分開保存。使用「另存新配置」後，該紀錄會改綁新配置；仍被遊戲紀錄使用的配置無法直接刪除，上鎖配置也不會被遊戲內修改覆蓋。資料主要保存在目前裝置的瀏覽器，不會自動同步，請定期在存檔選單使用「匯出」備份，並在更換裝置後使用「匯入」恢復。': ['Each save is bound to its current character preset, with separate summaries, tasks, relationships, and logs. Save as New Preset changes that binding. Presets still used by saves cannot be deleted, and locked presets cannot be overwritten. Data is local to this browser, so export backups regularly and import them on a new device.', '各データは現在のキャラクター設定に紐づき、要約、タスク、関係、日誌は別々に保存されます。「新しい設定として保存」で紐づけが変わります。使用中の設定は削除できず、ロック中の設定は上書きされません。定期的にエクスポートし、新しい端末でインポートしてください。'],
        '💡 AI 忘記事情怎麼辦？': ['💡 What if AI forgets?', '💡 AIが忘れたら？'],
        '打開角色面板，檢查重點劇情、任務、角色關係與 Flags 是否正確。你可以手動修正，或使用「整理摘要」重新整理目前狀態。': ['Open the Character Panel and check key events, tasks, relationships, and flags. Correct them manually or use Organize Summary.', 'キャラクターパネルで重要な物語、タスク、関係、フラグを確認し、手動修正または「サマリーを整理」を使ってください。'],
        '💡 劇情重複或場景錯亂怎麼辦？': ['💡 Repeated plot or confused scenes?', '💡 展開の重複や場面の混乱は？'],
        '先確認摘要與冒險日誌是否正確。如果 AI 仍然混淆，可以開啟「神」模式，直接說明目前場景、在場角色與接下來希望聚焦的方向。': ['Check the summary and adventure log first. If confusion continues, use Creator mode to state the current scene, present characters, and desired focus.', 'まず要約と冒険日誌を確認してください。まだ混乱する場合は「神」モードで現在の場面、登場人物、今後の焦点を指定します。'],
        '我瞭解了': ['Got it', 'わかりました'],
        'API 金鑰與模型指南': ['API & Model Guide', 'API・モデルガイド'],
        '開始前先知道這些': ['Before You Begin', '始める前に'],
        '本遊戲需要使用你自己的 API Key 才能呼叫 AI。請先在首頁選擇供應商、貼上對應金鑰並完成驗證；金鑰不會包含在遊戲備份中，共用裝置也不建議開啟保存功能。': ['This game uses your own API key to call AI. Choose a provider on the home page, paste the matching key, and verify it. Keys are never included in game backups; do not save them on shared devices.', 'このゲームは自分のAPIキーでAIを呼び出します。ホームでプロバイダーを選び、対応するキーを貼り付けて認証してください。キーはバックアップに含まれず、共有端末での保存は推奨しません。'],
        '1. API Key 是什麼？': ['1. What is an API Key?', '1. APIキーとは？'],
        'API Key 是 AI 服務用來辨識使用者與計算用量的金鑰，不是遊戲帳號或遊戲密碼。請向 Google AI Studio 或 OpenRouter 申請，並妥善保管；不要把金鑰貼到公開貼文、截圖或傳給其他人。': ['An API key identifies you to an AI service and tracks usage; it is not a game account or password. Obtain one from Google AI Studio or OpenRouter and keep it private.', 'APIキーはAIサービスが利用者を識別し、使用量を計算するための鍵です。ゲームのアカウントやパスワードではありません。Google AI StudioまたはOpenRouterで取得し、公開しないでください。'],
        '2. Google Gemini 與 OpenRouter': ['2. Google Gemini & OpenRouter', '2. Google GeminiとOpenRouter'],
        '選擇 Google Gemini 時，請使用 Google AI Studio 提供的金鑰；選擇 OpenRouter 時，請使用 OpenRouter 金鑰。兩種金鑰不能互換。OpenRouter 可提供多家模型，Gemini 則直接使用 Google 模型；實際可用清單會在驗證後載入。': ['Use a Google AI Studio key for Gemini and an OpenRouter key for OpenRouter. They are not interchangeable. OpenRouter offers models from multiple providers, while Gemini uses Google models. Available models load after verification.', 'GeminiにはGoogle AI Studioのキー、OpenRouterにはOpenRouterのキーを使用します。互換性はありません。OpenRouterは複数社のモデル、GeminiはGoogleモデルを提供し、利用可能一覧は認証後に読み込まれます。'],
        '3. 模型怎麼選？': ['3. Choosing a Model', '3. モデルの選び方'],
        '輕量模型通常回覆較快、用量較省，適合測試設定或日常遊玩；較大型模型通常更擅長長篇劇情、人物語氣與複雜指令。清單中的 ★ 代表較適合目前遊戲用途的優先選項。模型表現與費用可能不同，請以供應商顯示的資訊為準。': ['Lightweight models are usually faster and cheaper, while larger models often handle long plots, character voice, and complex instructions better. ★ marks recommended choices for this game. Check the provider for current performance and pricing.', '軽量モデルは高速で使用量を抑えやすく、大型モデルは長編、口調、複雑な指示に向く傾向があります。★はこのゲーム向けの推奨です。性能と料金は各プロバイダーで確認してください。'],
        '4. 金鑰會保存在哪裡？': ['4. Where is the Key Stored?', '4. キーの保存場所'],
        '未開啟「在這台裝置保留金鑰」時，金鑰只在目前頁面使用，重新開啟後需要再次輸入；開啟後才會保存在這台裝置的瀏覽器。匯出備份不包含 API Key，因此在新裝置匯入遊戲資料後仍需重新驗證。': ['Without Keep key on this device, the key lasts only for the current page session. When enabled, it is stored in this browser. Exports never include API keys, so a new device must verify again.', '「この端末にキーを保存」を有効にしない場合、キーは現在のページだけで使用されます。有効時のみブラウザに保存されます。エクスポートには含まれないため、新しい端末では再認証が必要です。'],
        '5. 哪些資料會傳給 AI？': ['5. What Data is Sent?', '5. AIへ送信されるデータ'],
        '為了產生回覆，角色設定、目前情境、必要的劇情摘要與近期對話會送往所選供應商。角色照片與完整本機存檔不會隨一般對話請求上傳；照片與遊戲進度主要保存在目前裝置。': ['Character settings, the current scenario, necessary summaries, and recent dialogue are sent to the selected provider. Character images and complete local saves are not uploaded with normal chat requests.', '返答生成のため、キャラクター設定、現在のシナリオ、必要な要約、直近の会話が選択したサービスへ送られます。画像や完全なローカルデータは通常の会話リクエストでは送信されません。'],
        '6. 驗證或回覆失敗怎麼辦？': ['6. Verification or Reply Failed?', '6. 認証・応答に失敗したら'],
        '請依序確認供應商是否選對、金鑰是否完整、帳戶額度與模型權限是否有效，以及網路是否正常。若只有特定模型失敗，可以改選其他模型；等待過久時可按「取消等待」，未完成的輸入會盡量放回輸入框。': ['Check the provider, key, account quota, model permission, and network. If only one model fails, choose another. Use Cancel Waiting if a request takes too long; unfinished input is restored when possible.', 'プロバイダー、キー、残高、モデル権限、ネットワークを確認してください。特定モデルだけ失敗する場合は別のモデルを選びます。長時間かかる場合は「待機を中止」を押してください。'],
        '在這台裝置保留金鑰': ['Keep key on this device', 'この端末にキーを保存'],
        '未開啟時只在本次頁面使用；共用裝置請勿開啟。': ['When off, the key is used only for this page session. Do not enable on shared devices.', 'オフの場合は現在のページだけで使用します。共有端末では有効にしないでください。'],
        '驗證金鑰': ['Verify', '確認'], '驗證中...': ['Verifying…', '確認中…'],
        '開始前請先準備 API 金鑰': ['API Key Required', 'APIキーが必要です'],
        '請選擇 Google Gemini 或 OpenRouter，貼上對應的 API Key 並完成驗證。金鑰不會包含在匯出備份中；共用裝置請勿開啟保存功能。': ['Choose Google Gemini or OpenRouter, paste the matching API key, and verify it. Keys are excluded from exports; do not save them on shared devices.', 'Google GeminiまたはOpenRouterを選び、対応するAPIキーを貼り付けて認証します。キーはバックアップに含まれません。共有端末では保存しないでください。'],
        '查看 API 詳細說明與模型選擇': ['API & Model Help', 'API・モデルのヘルプ'],
        '驗證成功。請選擇大腦核心：': ['Verified. Choose a model:', '確認完了。モデルを選択：'],
        '劇本創角': ['Character Setup', 'キャラクター'], '進入存檔選單': ['Saves', 'データ'],
        '冒險日誌': ['Adventure Log', '冒険日誌'], '閱讀遊戲玩法與系統指南': ['Game Guide', 'ゲームガイド'],
        '清除設備所有資料': ['Delete Local Data', 'ローカルデータを削除'],
        '外觀配色': ['Theme', 'テーマ'], '背景': ['Background', '背景'], '紙張': ['Paper', '用紙'], '面板': ['Panel', 'パネル'],
        '線與字': ['Text & Lines', '文字と線'], '重點': ['Accent', 'アクセント'], '對話': ['Dialogue', '会話'], '恢復預設': ['Reset', 'リセット'],
        '角色設定': ['Characters', 'キャラクター設定'], '情境設定': ['Scenarios', 'シナリオ設定'], '遊戲設定': ['Game', 'ゲーム設定'],
        '玩家': ['Player', 'プレイヤー'], '登場 NPC': ['NPCs', '登場NPC'], '目前配置': ['Current Preset', '現在の設定'],
 '＋ 新增': ['＋ Add', '＋ 追加'], '新增角色配置': ['New Character Preset', 'キャラクター設定を追加'], '配置檔案名稱': ['Preset Name', '設定名'], 'AI 隨機生成': ['AI Generator', 'AI生成'],
        '保留人物，隨機情境': ['Randomize Scenario', 'シナリオのみ生成'],
        '人物與情境全部隨機': ['Randomize All', 'すべてランダム生成'],
        '保留人物隨機情境': ['Randomize Scenario', 'シナリオのみ生成'],
        '人物情境全部隨機': ['Randomize Everything', 'すべてランダム生成'],
        '遊戲難度': ['Difficulty', '難易度'], '標準模式': ['Standard', '標準'], '困難模式': ['Hard', 'ハード'], '極限模式': ['Nightmare', 'ナイトメア'],
        '困難模式：檢定 DC +2，NPC 每次死亡只有一次復活檢定。極限模式：檢定 DC +4，歸零必定 Game Over，NPC 死亡後無法復活。': ['Hard: checks DC +2; each NPC death gets one revival check. Nightmare: checks DC +4; reaching zero causes Game Over and NPC death is permanent.', 'ハード：判定DC+2、NPC死亡ごとに復活判定は1回。ナイトメア：判定DC+4、ゼロでGame Over、NPCは復活できません。'],
        '困難模式：檢定 DC +2，NPC 每次死亡只有一次復活檢定，失敗後永久死亡。極限模式：檢定 DC +4，歸零必定 Game Over，NPC 死亡後無法復活。': ['Hard: checks DC +2; each NPC death gets one revival check, and failure is permanent. Nightmare: checks DC +4; reaching zero causes Game Over and NPC death is permanent.', 'ハード：判定DC+2、NPC死亡ごとに復活判定は1回で、失敗すると永続死亡。極限：判定DC+4、ゼロでGame Over、NPCは復活できません。'],
        '清空欄位': ['Clear', 'クリア'], '刪除配置': ['Delete Preset', '設定を削除'],
        '角色與情境的修改會保留，返回大廳時自動儲存目前配置。': ['Character and scenario edits are retained; the current preset is saved when returning home.', 'キャラクターとシナリオの編集は保持され、ホームへ戻ると現在の設定が自動保存されます。'],
        '返回': ['Back', '戻る'], '新增': ['Add', '追加'], '玩家自己設定': ['Player', 'プレイヤー'],
        '點擊更換頭像': ['Change Avatar', '画像を変更'], '玩家名稱': ['Player Name', 'プレイヤー名'],
        '基礎六圍屬性': ['Attributes', '能力値'], '🎲 隨機骰點 (4d6)': ['🎲 Roll Stats', '🎲 能力値を振る'],
        '💀 找守墓人洗點': ['💀 Respec', '💀 振り直す'],
        'STR 力量': ['STR Strength', 'STR 筋力'], 'DEX 敏捷': ['DEX Dexterity', 'DEX 敏捷'], 'CON 體質': ['CON Constitution', 'CON 体質'],
        'INT 智力': ['INT Intelligence', 'INT 知力'], 'WIS 感知': ['WIS Wisdom', 'WIS 感知'], 'CHA 魅力': ['CHA Charisma', 'CHA 魅力'],
        '詳細人物設定': ['Character Details', 'キャラクター詳細'], '核心性格 / 背景故事': ['Core Personality / Background', '性格／背景'], '年齡 / 身高 / 體型': ['Age / Height / Build', '年齢／身長／体格'],
        '說話習慣 / 語氣': ['Speech Style / Tone', '話し方／口調'], '喜歡的事物': ['Likes', '好きなもの'], '討厭的事物': ['Dislikes', '嫌いなもの'],
        '外貌特徵 / 常見穿搭': ['Appearance / Usual Outfit', '外見／普段の服装'], '核心性格 / 背景故事 (專長等)': ['Core Personality / Background', '性格／背景（特技など）'],
        '登場 NPC 列表': ['NPC List', '登場NPC一覧'], '+ 新增 NPC': ['+ Add NPC', '+ NPC追加'], '動態情境列表': ['Scenario List', 'シナリオ一覧'],
        'NPC 名稱': ['NPC Name', 'NPC名'], '開局好感': ['Starting Affection', '初期好感度'], 'NPC:': ['NPC:', 'NPC：'], '情境:': ['Scenario:', 'シナリオ：'],
        '情境名稱': ['Scenario Name', 'シナリオ名'], '該情境下的物理法則與世界觀': ['World Rules & Setting', 'このシナリオの世界観とルール'],
        'NPC 們在此情境下的總體身分/狀態': ['NPC Roles / Status', 'このシナリオでのNPCの役割／状態'], '玩家在此的專屬身份/狀態': ['Player Role / Status', 'このシナリオでのプレイヤーの役割／状態'],
        '玩家在此的身分/狀態': ['Player Role / Status', 'プレイヤーの役割／状態'], '新增情境': ['Add Scenario', 'シナリオ追加'], '建立新的世界或場景': ['Create a new world or scene', '新しい世界や場面を作成'],
        '+ 新增情境': ['+ Add Scenario', '+ シナリオ追加'], '儲存變更': ['Save', '保存'], '另存新檔': ['Save as New', '別名で保存'], '返回選單': ['Back to Menu', 'メニューへ戻る'],
        '隨機生成': ['Randomize', 'ランダム生成'], '偏好關鍵字（可留空，AI 會自由發揮）': ['Preferences (optional)', '希望キーワード（任意）'],
        '開始生成': ['Generate', '生成'], '生成中…': ['Generating…', '生成中…'], '重新生成': ['Regenerate', '再生成'],
        '套用到表單': ['Apply', '適用'], 'AI 正在建立設定…': ['Creating preset…', '設定を作成中…'],
        '選擇記憶紀錄': ['Select Save', 'データを選択'], '本機資料狀態': ['Storage', 'ストレージ'], '重新計算': ['Refresh', '更新'],
        '今日呼叫': ['Today', '今日の呼び出し'], '本月呼叫': ['This Month', '今月の呼び出し'], 'JSON 修復': ['JSON Repairs', 'JSON修復'], '總呼叫': ['Total', '合計'],
        '模型使用次數': ['Model Usage', 'モデル使用回数'], '尚未有模型使用紀錄。': ['No model usage yet.', 'モデル使用履歴はまだありません。'],
        '尚未選擇': ['Not selected', '未選択'], '尚未使用': ['Not used yet', '未使用'], '實際費用仍以 OpenRouter / Google 後台為準。': ['Check OpenRouter / Google for actual costs.', '実際の料金はOpenRouter／Googleで確認してください。'], '重設統計': ['Reset Stats', '統計をリセット'],
        '正在計算瀏覽器儲存空間…': ['Calculating storage…', '容量を計算中…'], '尚未確認備份狀態。': ['Backup not checked.', 'バックアップ未確認'],
        '創建新紀錄': ['New Save', '新規データ'], '匯出': ['Export', 'エクスポート'], '匯入': ['Import', 'インポート'], '返回大廳': ['Home', 'ホーム'],
        '整理重複事件': ['Merge Duplicates', '重複を統合'], '↶ 復原上次整理': ['↶ Undo Merge', '↶ 統合を元に戻す'], '跳到最新': ['Latest', '最新へ'],
        '上一頁': ['Previous', '前へ'], '下一頁': ['Next', '次へ'], '編輯單筆冒險紀錄': ['Edit Entry', '記録を編集'], '刪除此筆': ['Delete Entry', 'この記録を削除'],
        '角色面板': ['Character', 'キャラクター'], '離開': ['Exit', '終了'], '(隊友狀態請見面板)': ['(Party status in panel)', '（仲間の状態はパネルへ）'],
        '+ 新情境': ['+ New Scenario', '+ 新シナリオ'], '神': ['Creator', '神'], '核心切換': ['Model', 'モデル'],
        '遊戲引擎 (DM)': ['Game Engine (GM)', 'ゲームエンジン (GM)'], '正在進行判定與演算...': ['Processing…', '処理中…'],
        '取消等待': ['Cancel', 'キャンセル'], '🎲 擲骰': ['🎲 Roll', '🎲 ダイス'], '發送': ['Send', '送信'],
        '刪除': ['Delete', '削除'], '編輯': ['Edit', '編集'], '完成': ['Done', '完了'], '收起': ['Collapse', '閉じる'],
        '尚未解鎖任何標籤...': ['No flags unlocked yet…', 'まだフラグはありません…'], '背包空空如也...': ['Inventory is empty…', '所持品は空です…'],
        '目前沒有任務。接到新委託時，會自動加在這裡。': ['No tasks yet. New tasks appear here automatically.', 'タスクはまだありません。新しい依頼は自動で追加されます。'],
        '目前沒有任何存檔紀錄。': ['No saves yet.', 'データデータはありません。'], '目前沒有存檔': ['No saves', 'データなし'],
        '— 遊戲紀錄已載入 —': ['— Save Loaded —', '— データを読み込みました —'],
        '遊戲紀錄已載入': ['Save Loaded', 'データを読み込みました'],
        '輔助旁白': ['Narrator', 'ナレーター'], '創作者指令': ['Creator Instruction', '作者指示'],
        '引擎 (DM)': ['Engine (GM)', 'エンジン (GM)'], '判定引擎': ['Check Engine', '判定エンジン'], '判定': ['Check', '判定'],
        '此情境/支線尚無對話。請輸入動作，或讓 AI 生成開場': ['No dialogue in this scenario yet. Enter an action or let AI generate an opening.', 'このシナリオにはまだ会話がありません。行動を入力するか、AIに導入を生成させてください。'],
        '🎲 讓 AI 根據「情境設定」隨機生成開場事件': ['🎲 Generate an Opening from the Scenario', '🎲 シナリオ設定から導入を生成'],
        '力量': ['Strength', '筋力'], '敏捷': ['Dexterity', '敏捷'], '體質': ['Constitution', '体質'],
        '智力': ['Intelligence', '知力'], '感知': ['Wisdom', '感知'], '魅力': ['Charisma', '魅力'],
        '大成功': ['Critical Success', '大成功'], '成功': ['Success', '成功'], '失敗': ['Failure', '失敗'], '大失敗': ['Critical Failure', '大失敗']
    };

    const ATTR_M = {
        '縮小圖片': ['Zoom out', '縮小'], '圖片縮放': ['Image zoom', '画像の拡大縮小'], '放大圖片': ['Zoom in', '拡大'],
        '關閉角色面板': ['Close character panel', 'キャラクターパネルを閉じる'],
        '回到首頁': ['Back to home', 'ホームへ戻る'],
        '儲存並回到首頁': ['Save and return home', '保存してホームへ戻る'],
        '另存配置': ['Save Preset As', '設定を別名保存'],
        '新增角色配置': ['New Character Preset', 'キャラクター設定を追加'],
        '配置匯入匯出': ['Preset import/export', '設定のインポート／エクスポート'],
        '修改記憶紀錄檔名': ['Rename memory record', '記憶記録名を変更'],
        '選取此記憶紀錄': ['Select this memory record', 'この記憶記録を選択'],
        '新增狀態或旗標（最多 48 字）...': ['Add a status or flag (max 48 chars)…', '状態・フラグを追加（最大48文字）…'],
        '例如：\n• 秀芙與三高已確認戀人關係\n• 目前準備進入週六現實約會': ['Example:\n• Xiufu and Sangao confirmed their relationship\n• Preparing for a Saturday date in the real world', '例：\n• 秀芙と三高は恋人関係を確認した\n• 土曜日の現実世界でのデートを準備中'],
        '手動新增任務...': ['Add a task manually…', 'タスクを手動追加…'], '點擊上傳首頁照片': ['Upload home image', 'ホーム画像をアップロード'],
        '例如：\n• 秀芙與三高已成為戀人\n• SY 知道兩人關係升溫': ['Example:\n• Xiufu and Sangao are now a couple\n• SY knows their relationship is growing closer', '例：\n• 秀芙と三高は恋人になった\n• SYは二人の関係が深まっていることを知っている'],
        '請貼上你的 API Key': ['Paste your API key', 'APIキーを貼り付けてください'],
        '背景顏色': ['Background color', '背景色'], '紙張顏色': ['Paper color', '用紙色'], '面板顏色': ['Panel color', 'パネル色'], '線條與主要文字顏色': ['Line and main text color', '線と主要文字の色'],
        '重點顏色': ['Accent color', 'アクセント色'], 'NPC 對話顏色': ['NPC dialogue color', 'NPC会話色'],
        '角色配置總覽': ['Character preset overview', 'キャラクター設定一覧'], '配置分類': ['Preset categories', '設定カテゴリー'],
        '角色設定總覽': ['Character settings overview', 'キャラクター設定一覧'], '編輯玩家角色': ['Edit player character', 'プレイヤーを編集'],
        '情境設定總覽': ['Scenario settings overview', 'シナリオ設定一覧'], '遊戲設定總覽': ['Game settings overview', 'ゲーム設定一覧'],
        '切換配置鎖定': ['Toggle preset lock', '設定ロック切替'], '點擊切換鎖定狀態': ['Toggle lock', 'ロック切替'],
        '可填入想要的氣氛、類型、禁忌或角色關係；不填也可以。': ['Optional mood, genre, boundaries, or relationships.', '雰囲気、ジャンル、NG、関係性など（任意）。'],
        '選擇日誌存檔': ['Choose journal save', '日誌のデータを選択'], '搜尋事件、角色或地點...': ['Search events, characters, or places…', 'イベント、人物、場所を検索…'],
        '搜尋冒險日誌': ['Search adventure log', '冒険日誌を検索'], '冒險紀錄內容': ['Adventure entry content', '冒険記録の内容'],
        '開啟或收回角色面板': ['Open or collapse character panel', 'キャラクターパネルを開閉'],
        '切換持續創作者指令模式': ['Toggle persistent Creator mode', '継続「神」モード切替'],
        '輸入你的開局動作，或點選上方選項...': ['Enter your opening action or choose an option above…', '最初の行動を入力するか、上の選択肢を選んでください…'],
        '由 AI 判斷檢定屬性後隨機擲出 D20': ['AI chooses the ability, then rolls a D20', 'AIが能力を選びD20を振ります'],
        '例如：從遊戲世界切回時視為登出並回到語音通話。': ['Example: returning from the game world logs out and returns to voice chat.', '例：ゲーム世界から戻るとログアウト扱いになり、ボイスチャットへ戻る。'],
        '輸入本回合的創作者指令...': ['Enter a Creator instruction for this turn…', 'このターンの作者指示を入力…'],
        '輸入輔助旁白，或點「神」下達創作者指令...': ['Enter narrator direction, or use Creator for a stage instruction…', 'ナレーター指示を入力するか、「神」で作者指示を出してください…'],
        '輸入角色行動，或點「神」下達創作者指令...': ['Enter your character’s action, or use Creator for a stage instruction…', 'キャラクターの行動を入力するか、「神」で作者指示を出してください…'],
        '開啟持續創作者指令模式': ['Enable persistent Creator mode', '継続「神」モードをオン'],
        '關閉持續創作者指令模式': ['Disable persistent Creator mode', '継続「神」モードをオフ']
    };

    const SYSTEM_M = {
        '至少要保留一位 NPC 喔！': ['At least one NPC must remain.', 'NPCを最低1人残してください。'],
        '至少要保留一個情境喔！': ['At least one scenario must remain.', 'シナリオを最低1つ残してください。'],
        '系統至少需要保留一組配置喔！': ['At least one preset must remain.', '設定を最低1つ残してください。'],
        '確定要刪除這位 NPC 嗎？': ['Delete this NPC?', 'このNPCを削除しますか？'],
        '確定要刪除這個情境嗎？對應的對話紀錄也會被連帶刪除！': ['Delete this scenario? Its dialogue history will also be deleted.', 'このシナリオを削除しますか？対応する会話記録も削除されます。'],
        '確定要刪除這個存檔嗎？此操作無法復原。': ['Delete this save? This cannot be undone.', 'このデータを削除しますか？元に戻せません。'],
        '確定要刪除這一筆冒險紀錄嗎？': ['Delete this adventure entry?', 'この冒険記録を削除しますか？'],
        '目前沒有資料可以匯出。': ['There is no data to export.', 'エクスポートするデータがありません。'],
        '請貼上你的 API Key！': ['Please paste your API key.', 'APIキーを貼り付けてください。'],
        '這份存檔格式不正確，無法載入。': ['This save has an invalid format and cannot be loaded.', 'このデータ形式は正しくないため読み込めません。'],
        '找不到這名角色，頭像未變更。': ['Character not found. The avatar was not changed.', 'キャラクターが見つからないため、画像は変更されませんでした。'],
        '請先輸入你打算做什麼，再來擲骰子喔！': ['Enter what you want to do before rolling.', '先に行動を入力してからダイスを振ってください。'],
        '「神」模式是創作者指令，不使用玩家六圍。請按一般發送。': ['Creator mode does not use player attributes. Use Send instead.', '「神」モードは能力値を使いません。通常送信を使用してください。'],
        '目前是輔助旁白／創作者視角，不會使用玩家六圍擲骰。請改用一般送出。': ['Narrator/Creator view does not use player attributes. Use Send instead.', 'ナレーター／作者視点では能力値判定を行いません。通常送信を使用してください。'],
        '無法刪除當前所在的情境！請先返回遊戲切換到其他情境後，再來進行刪除。': ['You cannot delete the active scenario. Switch to another scenario first.', '現在いるシナリオは削除できません。別のシナリオへ移動してください。'],
        '這筆紀錄不能是空白；若要移除請按「刪除此筆」。': ['This entry cannot be blank. Use Delete Entry to remove it.', '記録を空欄にはできません。削除する場合は「この項目を削除」を使用してください。'],
        '整理會合併語意重複的事件。系統會先保留備份，確定要繼續嗎？': ['Organizing merges semantically duplicate events. A backup will be kept. Continue?', '整理すると意味の重複するイベントを統合します。バックアップを保存して続行しますか？'],
        '冒險紀錄已整理完成；如不滿意可按「復原上次整理」。': ['Adventure log organized. Use Undo Last Organize if needed.', '冒険記録を整理しました。必要なら「前回の整理を戻す」を使用してください。'],
        '這份存檔目前沒有可復原的整理備份。': ['This save has no organization backup to restore.', 'このデータには復元できる整理バックアップがありません。'],
        '目前沒有可復原的整理備份。': ['There is no organization backup to restore.', '復元できる整理バックアップがありません。'],
        '已復原整理前的完整冒險紀錄。': ['The adventure log was restored.', '整理前の冒険記録を復元しました。'],
        '摘要與任務清單已整理完成。': ['Summary and task list organized.', 'サマリーとタスクリストを整理しました。'],
        '匯入失敗：備份檔超過 50MB。': ['Import failed: backup file exceeds 50 MB.', 'インポート失敗：バックアップが50MBを超えています。'],
        '【系統提示：靈魂重鑄】\n\n「命運的絲線又糾纏在一起了嗎...？」\n\n確定要重新洗點嗎？原本被鎖定的基礎六圍將會強制解鎖！': ['[System: Soul Reforge]\n\n“Have the threads of fate tangled again…?”\n\nReroll your stats? This will unlock and replace the current base attributes.', '【システム：魂の再鋳造】\n\n「運命の糸がまた絡み合ったのですか……？」\n\n能力値を振り直しますか？ロック中の基本能力値は解除され、新しい値に置き換わります。'],
        '洗點成功！你的能力值已重新分配。': ['Stats successfully reassigned.', '能力値を再配分しました。'],
        '極限模式的死亡永久成立，無法嘗試復活。': ['Death is permanent in Nightmare mode.', '極限モードでは死亡は永続し、復活できません。'],
        '這名 NPC 的復活檢定已經失敗，不能再次嘗試。': ['This NPC already failed their revival check.', 'このNPCは復活判定に失敗しており、再挑戦できません。'],
        '困難模式不能由「神」直接復活；必須以角色行動進行一次復活檢定。': ['Hard mode requires a character action and revival check; Creator mode cannot revive directly.', 'ハードモードではキャラクター行動による復活判定が必要です。「神」で直接復活できません。'],
        '困難模式的復活必須檢定。請按「擲骰」，成功才能復活；失敗後將永久無法再嘗試。': ['Hard mode revival requires a roll. Success revives; failure is permanent.', 'ハードモードの復活には判定が必要です。成功で復活、失敗すると再挑戦できません。'],
        '確定要清除本機 API 使用統計嗎？遊戲存檔不會被刪除。': ['Reset local API usage stats? Game saves will not be deleted.', 'ローカルのAPI使用統計をリセットしますか？データデータは削除されません。'],
        '🔒 此配置已受玩家保護，無法洗點！請先點擊上方解鎖。': ['🔒 This preset is locked. Unlock it before rerolling stats.', '🔒 この設定はロックされています。能力値を振り直す前にロックを解除してください。'],
        '🔒 此配置已受玩家保護，為防誤刪無法進行操作！\n若確定要刪除，請先點擊上方解鎖。': ['🔒 This preset is locked to prevent accidental deletion. Unlock it first if you want to delete it.', '🔒 誤削除防止のため、この設定はロックされています。削除する場合は先にロックを解除してください。'],
        '🔒 此配置已受玩家保護，無法進行覆蓋儲存！\n若要修改，請先點擊上方解鎖。': ['🔒 This preset is locked and cannot be overwritten. Unlock it before saving changes.', '🔒 この設定はロックされているため上書きできません。変更を保存する前にロックを解除してください。'],
        '確定要清空當前所有輸入框的資料嗎？這將讓你獲得一張白紙來重新填寫！\n(尚未點擊儲存前，原本的配置不會被覆蓋)': ['Clear all current fields and start with a blank form? The saved preset will not be overwritten until you save.', '現在の入力欄をすべて消去して白紙から始めますか？保存するまで元の設定は上書きされません。'],
        '已清空所有欄位！請開始創作；返回大廳時會自動儲存目前配置。': ['All fields cleared. Your current preset will be saved automatically when you return home.', 'すべての欄を消去しました。ホームへ戻ると現在の設定が自動保存されます。'],
        '當前配置變更已成功儲存！基礎屬性已被鎖定！': ['Preset changes saved. Base attributes are now locked.', '設定を保存しました。基本能力値はロックされました。'],
        '請輸入新的劇本配置名稱：': ['Enter a name for the new preset:', '新しい設定名を入力してください：'],
        '請為這份新的系統大廳配置命名：': ['Name this new lobby preset:', '新しいホーム設定に名前を付けてください：'],
        '準備進入遊戲！請為這次存檔命名：': ['Ready to play! Name this save:', 'ゲームを始めます。このデータに名前を付けてください：'],
        '警告：這將會清除設備上儲存的 API 金鑰、照片設定與所有劇本存檔！\n此操作無法復原！': ['Warning: this deletes saved API keys, image settings, and all saves on this device. This cannot be undone.', '警告：この端末のAPIキー、画像設定、すべてのデータを削除します。元に戻せません。'],
        '無法刪除當前所在的情境！請先返回遊戲切換到其他情境後，再來進行刪除。': ['The active scenario cannot be deleted. Return to the game and switch scenarios first.', '現在のシナリオは削除できません。ゲームに戻って別のシナリオへ切り替えてください。'],
        '找不到這名角色，頭像未變更。': ['Character not found. Avatar unchanged.', 'キャラクターが見つかりません。画像は変更されませんでした。'],
        '創作者指令後方沒有內容，尚未送出給 AI': ['The Creator instruction was empty and was not sent to AI.', '作者指示が空のため、AIには送信されませんでした。']
        ,'整理完整冒險紀錄會合併重複事件。系統會先保留備份，確定要繼續嗎？': ['Organizing the full adventure log merges duplicate events. A backup will be kept. Continue?', '冒険記録全体を整理すると重複イベントを統合します。バックアップを保存して続行しますか？'],
        'HP 歸零：極限模式 Game Over。': ['HP reached zero: Game Over in Nightmare mode.', 'HPが0になりました：極限モードはGame Overです。'],
        'HP 歸零：困難模式進入致命結局判定。': ['HP reached zero: starting a fatal-outcome check in Hard mode.', 'HPが0になりました：ハードモードの致命的結末判定に入ります。'],
        'HP 歸零：保護機制啟動，下一回合優先演出救援。': ['HP reached zero: safety protection activated; rescue takes priority next turn.', 'HPが0になりました：保護機能が作動し、次のターンは救助を優先します。'],
        'SAN 歸零：極限模式 Game Over。': ['SAN reached zero: Game Over in Nightmare mode.', 'SANが0になりました：極限モードはGame Overです。'],
        'SAN 歸零：困難模式進入致命結局判定。': ['SAN reached zero: starting a fatal-outcome check in Hard mode.', 'SANが0になりました：ハードモードの致命的結末判定に入ります。'],
        'SAN 歸零：照護機制啟動，下一回合優先處理精神崩潰。': ['SAN reached zero: care protection activated; the breakdown takes priority next turn.', 'SANが0になりました：ケア機能が作動し、次のターンは精神崩壊への対処を優先します。'],
        'HP 已進入重傷區間，後續行動與判定將受到影響。': ['HP is in the critical-injury range; later actions and checks will be affected.', 'HPが重傷域に入り、以後の行動と判定に影響します。'],
        'SAN 已進入精神危機區間，後續感知與判定將受到影響。': ['SAN is in the mental-crisis range; later perception and checks will be affected.', 'SANが精神危機域に入り、以後の感知と判定に影響します。'],
        'HP 已恢復至安全區間，重傷狀態解除。': ['HP returned to a safe range; critical injury removed.', 'HPが安全域に戻り、重傷状態を解除しました。'],
        'SAN 已恢復至安全區間，精神危機狀態解除。': ['SAN returned to a safe range; mental crisis removed.', 'SANが安全域に戻り、精神危機状態を解除しました。']
    };

    const reverse = { en: new Map(), ja: new Map() };
    Object.entries(M).forEach(([zh, values]) => { reverse.en.set(values[0], zh); reverse.ja.set(values[1], zh); });
    const attrReverse = { en: new Map(), ja: new Map() };
    Object.entries(ATTR_M).forEach(([zh, values]) => { attrReverse.en.set(values[0], zh); attrReverse.ja.set(values[1], zh); });
    const systemReverse = { en: new Map(), ja: new Map() };
    Object.entries(SYSTEM_M).forEach(([zh, values]) => { systemReverse.en.set(values[0], zh); systemReverse.ja.set(values[1], zh); });
    const textKeys = new WeakMap();
    const dynamicTextKeys = new WeakMap();
    const attrKeys = new WeakMap();
    let currentLanguage = normalizeLanguage(localStorage.getItem(UI_LANGUAGE_STORAGE_KEY));
    let observer = null;

    function normalizeLanguage(value) {
        const raw = String(value || '').trim();
        if (/^ja/i.test(raw)) return 'ja';
        if (/^en/i.test(raw)) return 'en';
        return 'zh-TW';
    }

    function translatedValue(zh, locale = currentLanguage, dictionary = M) {
        if (locale === 'zh-TW') return zh;
        const values = dictionary[zh];
        return values ? values[locale === 'en' ? 0 : 1] : zh;
    }

    function resolveKey(value, dictionary = M, reverseMaps = reverse) {
        if (dictionary[value]) return value;
        return reverseMaps.en.get(value) || reverseMaps.ja.get(value) || '';
    }

    function shouldSkipNode(node) {
        const parent = node.parentElement;
        return !parent || Boolean(parent.closest('script, style, [data-no-i18n], #dialogue-box, .journal-entry-text, .save-title, .msg-text, .msg-narrative, .desktop-npc-avatar-button > span:last-child, #desktop-player-name, .npc-summary-name'));
    }

    function translateDynamic(value, locale) {
        const rules = [
            [/^系統捕捉到隱藏錯誤，請截圖這段文字：\n([\s\S]*)\n行號：(.*)$/, a => currentLanguage === 'en' ? `A hidden error was caught. Please screenshot this message:\n${a[1]}\nLine: ${a[2]}` : `非表示のエラーを検出しました。このメッセージをスクリーンショットしてください：\n${a[1]}\n行：${a[2]}`],
            [/^(.+)無法寫入瀏覽器資料庫。請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。$/, a => currentLanguage === 'en' ? `${a[1]} could not be written to browser storage. Export a backup and make sure browser storage is allowed.` : `${a[1]}をブラウザの保存領域に書き込めません。バックアップを出力し、ブラウザの保存が許可されているか確認してください。`],
            [/^總點數\s*(\d+)\s*\/\s*(\d+)$/, a => locale === 'en' ? `Total ${a[1]} / ${a[2]}` : locale === 'ja' ? `合計 ${a[1]} / ${a[2]}` : a[0]],
            [/^第\s*(\d+)\s*\/\s*(\d+)\s*頁$/, a => locale === 'en' ? `Page ${a[1]} / ${a[2]}` : locale === 'ja' ? `${a[1]} / ${a[2]} ページ` : a[0]],
            [/^最後遊玩：(.*)$/, a => locale === 'en' ? `Last played: ${a[1]}` : locale === 'ja' ? `最終プレイ：${a[1]}` : a[0]],
            [/^代表NPC:\s*(.*?)\s*\|\s*玩家:\s*(.*)$/, a => locale === 'en' ? `Featured NPC: ${a[1]} | Player: ${a[2]}` : locale === 'ja' ? `代表NPC：${a[1]}｜プレイヤー：${a[2]}` : a[0]],
            [/^配置：(.*)$/, a => locale === 'en' ? `Preset: ${a[1]}` : locale === 'ja' ? `設定：${a[1]}` : a[0]],
            [/^情境\s*(\d+)：(.*)$/, a => locale === 'en' ? `Scenario ${a[1]}: ${a[2]}` : locale === 'ja' ? `シナリオ ${a[1]}：${a[2]}` : a[0]],
            [/^玩家：(.+)$/, a => locale === 'en' ? `Player: ${a[1]}` : locale === 'ja' ? `プレイヤー：${a[1]}` : a[0]],
            [/^目前：(.*)$/, a => locale === 'en' ? `Current: ${a[1]}` : locale === 'ja' ? `現在：${a[1]}` : a[0]],
            [/^情境：(.*)$/, a => locale === 'en' ? `Scenario: ${a[1]}` : locale === 'ja' ? `シナリオ：${a[1]}` : a[0]],
            [/^♥好感:\s*(-?\d+)$/, a => locale === 'en' ? `♥ Affection: ${a[1]}` : locale === 'ja' ? `♥ 好感度：${a[1]}` : a[0]],
            [/^\[力量STR:\s*(.*?)\]$/, a => locale === 'en' ? `[STR Strength: ${a[1]}]` : locale === 'ja' ? `[STR 筋力：${a[1]}]` : a[0]],
            [/^\[敏捷DEX:\s*(.*?)\]$/, a => locale === 'en' ? `[DEX Dexterity: ${a[1]}]` : locale === 'ja' ? `[DEX 敏捷：${a[1]}]` : a[0]],
            [/^\[體質CON:\s*(.*?)\]$/, a => locale === 'en' ? `[CON Constitution: ${a[1]}]` : locale === 'ja' ? `[CON 体質：${a[1]}]` : a[0]],
            [/^\[智力INT:\s*(.*?)\]$/, a => locale === 'en' ? `[INT Intelligence: ${a[1]}]` : locale === 'ja' ? `[INT 知力：${a[1]}]` : a[0]],
            [/^\[感知WIS:\s*(.*?)\]$/, a => locale === 'en' ? `[WIS Wisdom: ${a[1]}]` : locale === 'ja' ? `[WIS 感知：${a[1]}]` : a[0]],
            [/^\[魅力CHA:\s*(.*?)\]$/, a => locale === 'en' ? `[CHA Charisma: ${a[1]}]` : locale === 'ja' ? `[CHA 魅力：${a[1]}]` : a[0]],
            [/^只有重大約定／秘密才會追加；AI 每回合讀最近\s*(\d+)\s*筆$/, a => locale === 'en' ? `Only major promises or secrets are added; the latest ${a[1]} are used each turn.` : locale === 'ja' ? `重要な約束や秘密のみ追加され、各ターンで最新${a[1]}件を参照します。` : a[0]],
            [/^查看／編輯全部\s*(\d+)\s*筆紀錄$/, a => locale === 'en' ? `View / Edit All ${a[1]} Notes` : locale === 'ja' ? `${a[1]}件すべて表示／編集` : a[0]],
            [/^最近更新：(.*)$/, a => locale === 'en' ? `Last updated: ${a[1]}` : locale === 'ja' ? `最終更新：${a[1]}` : a[0]],
            [/^(\d+)\s*\/\s*修復\s*(\d+)$/, a => locale === 'en' ? `${a[1]} / Repairs ${a[2]}` : locale === 'ja' ? `${a[1]}／修復 ${a[2]}` : a[0]],
            [/^目前供應商：(.*)$/, a => locale === 'en' ? `Provider: ${a[1]}` : locale === 'ja' ? `プロバイダー：${a[1]}` : a[0]],
            [/^目前模型：(.*)$/, a => locale === 'en' ? `Model: ${a[1]}` : locale === 'ja' ? `モデル：${a[1]}` : a[0]],
            [/^最後使用：(.*)$/, a => locale === 'en' ? `Last used: ${a[1]}` : locale === 'ja' ? `最終使用：${a[1]}` : a[0]],
            [/^已保存\s*(\d+)\s*\/\s*(\d+)\s*個 Flags；目前全部都會提供給 AI。$/, a => locale === 'en' ? `${a[1]} / ${a[2]} flags saved; all are currently shared with AI.` : locale === 'ja' ? `${a[1]}／${a[2]}件のフラグを保存中。現在はすべてAIに共有されます。` : a[0]],
            [/^已保存\s*(\d+)\s*個 Flags；AI 每回合優先讀取\s*(\d+)\s*個（含生存狀態、最早重要項目與最近項目），其餘仍完整保留。$/, a => locale === 'en' ? `${a[1]} flags saved; AI prioritizes ${a[2]} each turn and keeps the rest.` : locale === 'ja' ? `${a[1]}件のフラグを保存中。各ターンで${a[2]}件を優先し、残りも保持されます。` : a[0]]
        ];
        for (const [pattern, format] of rules) {
            const match = value.match(pattern);
            if (match) return format(match);
        }
        return value;
    }

    function translateSystemText(message) {
        const value = String(message ?? '');
        const exactKey = resolveKey(value, SYSTEM_M, systemReverse) || resolveKey(value);
        if (exactKey) return translatedValue(exactKey, currentLanguage, SYSTEM_M[exactKey] ? SYSTEM_M : M);
        if (currentLanguage === 'zh-TW') return value;
        const rules = [
            [/^確定要刪除「(.+)」這個配置嗎？$/, a => currentLanguage === 'en' ? `Delete the preset “${a[1]}”?` : `設定「${a[1]}」を削除しますか？`],
            [/^無法刪除「(.+)」。\n\n目前仍有 (\d+) 份遊戲紀錄綁定這個配置：\n([\s\S]+)\n\n請先在對應遊戲中使用「另存新配置」切換綁定，再回來刪除。$/, a => currentLanguage === 'en' ? `Cannot delete “${a[1]}”.\n\n${a[2]} save(s) still use this preset:\n${a[3]}\n\nOpen those saves and use Save as New to change their preset before deleting it.` : `「${a[1]}」は削除できません。\n\nこの設定を使用中データが${a[2]}件あります：\n${a[3]}\n\n各データで「別名で保存」を使って設定を切り替えてから削除してください。`],
            [/^已另存新檔為「(.+)」！基礎屬性已被鎖定！$/, a => currentLanguage === 'en' ? `Saved as “${a[1]}”. Base attributes are now locked.` : `「${a[1]}」として保存しました。基本能力値はロックされました。`],
            [/^已將目前的角色核心設定與情境資料另存為新配置「(.+)」！\n動態狀態與冒險進度只保留在目前存檔中。$/, a => currentLanguage === 'en' ? `Character and scenario settings were saved as “${a[1]}”.\nDynamic status and adventure progress remain only in this save.` : `キャラクターとシナリオ設定を「${a[1]}」として保存しました。\n動的状態と冒険進行は現在のデータにのみ残ります。`],
            [/^【系統提醒】\n因為大廳的配置 \[(.+)\] 已上鎖 \(🔒\)，\n本次變更僅儲存於「當前遊戲紀錄」中，不會覆蓋回大廳。\n\(若要覆蓋回大廳，請先至大廳解鎖，或使用另存新配置\)$/, a => currentLanguage === 'en' ? `[System Notice]\nThe lobby preset [${a[1]}] is locked (🔒).\nThese changes were saved only to the current game save and did not overwrite the lobby preset.\n(Unlock it in the lobby or use Save as New to overwrite a preset.)` : `【システム通知】\nホームの設定［${a[1]}］はロックされています（🔒）。\n今回の変更は現在のデータのみ保存され、ホームの設定には上書きされません。\n（上書きするにはホームでロックを解除するか、「別名で保存」を使用してください。）`],
            [/^(.+)\n原本內容沒有被刪除。$/, a => currentLanguage === 'en' ? `${a[1]}\nThe original content was not deleted.` : `${a[1]}\n元の内容は削除されていません。`],
            [/^(.+)\n原本的內容沒有被刪除。$/, a => currentLanguage === 'en' ? `${a[1]}\nThe original content was not deleted.` : `${a[1]}\n元の内容は削除されていません。`],
            [/^要復原 (.+) 整理前的冒險紀錄嗎？$/, a => currentLanguage === 'en' ? `Restore the adventure log from before the ${a[1]} organization?` : `${a[1]}の整理前の冒険記録を復元しますか？`],
            [/^要復原 (.+) 整理前的完整冒險紀錄嗎？$/, a => currentLanguage === 'en' ? `Restore the full adventure log from before the ${a[1]} organization?` : `${a[1]}の整理前の冒険記録全体を復元しますか？`],
            [/^匯入完成：(\d+) 個存檔、(\d+) 個角色配置(?:，(\d+) 個同 ID 資料已自動改名)?。$/, a => currentLanguage === 'en' ? `Import complete: ${a[1]} save(s), ${a[2]} preset(s)${a[3] ? `; ${a[3]} duplicate ID(s) were renamed` : ''}.` : `インポート完了：データ${a[1]}件、設定${a[2]}件${a[3] ? `、同一IDのデータ${a[3]}件を自動改名` : ''}。`],
            [/^頭像已存入目前遊戲紀錄。\n角色配置「(.+)」已上鎖，因此沒有覆寫配置。$/, a => currentLanguage === 'en' ? `The avatar was saved to the current game save.\nPreset “${a[1]}” is locked, so it was not overwritten.` : `画像を現在のデータに保存しました。\n設定「${a[1]}」はロック中のため上書きされませんでした。`],
            [/^無法寫入瀏覽器資料庫。/, a => currentLanguage === 'en' ? value.replace('無法寫入瀏覽器資料庫。', 'Could not write to browser storage.').replace('請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。', 'Export a backup and make sure browser storage is allowed.') : value.replace('無法寫入瀏覽器資料庫。', 'ブラウザの保存領域に書き込めません。').replace('請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。', 'バックアップを出力し、ブラウザの保存が許可されているか確認してください。')],
            [/^請先驗證 (.+) 金鑰並選擇模型。$/, a => currentLanguage === 'en' ? `Verify your ${a[1]} key and choose a model first.` : `先に${a[1]}キーを認証し、モデルを選択してください。`],
            [/^儲存時發生錯誤：(.*)$/, a => currentLanguage === 'en' ? `Save error: ${a[1]}` : `保存エラー：${a[1]}`],
            [/^匯入失敗：(.*)$/, a => currentLanguage === 'en' ? `Import failed: ${a[1]}` : `インポート失敗：${a[1]}`],
            [/^Flags 已達 (\d+) 個，請先刪除或合併較舊項目再新增。$/, a => currentLanguage === 'en' ? `Flags reached ${a[1]}. Delete or merge older entries first.` : `フラグが${a[1]}件に達しました。古い項目を削除または統合してください。`],
            [/^【系統提示：靈魂重鑄】\n\n確定要重新隨機洗點嗎？\n注意：此存檔目前剩餘 (\d+) 次洗點機會！$/, a => currentLanguage === 'en' ? `[System: Soul Reforge]\n\nReroll your stats?\nRerolls remaining for this save: ${a[1]}.` : `【システム：魂の再鋳造】\n\n能力値を振り直しますか？\nこのデータで残っている振り直し回数：${a[1]}回。`],
            [/^— (.+) 的好感度 (-?\d+) → (-?\d+) —$/, a => currentLanguage === 'en' ? `— ${a[1]} Affection ${a[2]} → ${a[3]} —` : `— ${a[1]}の好感度 ${a[2]} → ${a[3]} —`],
            [/^☠ (.+) 已死亡(?::|：)?(.*)$/, a => currentLanguage === 'en' ? `☠ ${a[1]} has died${a[2] ? `: ${a[2]}` : ''}` : `☠ ${a[1]}は死亡しました${a[2] ? `：${a[2]}` : ''}`],
            [/^✦ (.+) 已恢復存活$/, a => currentLanguage === 'en' ? `✦ ${a[1]} has been revived` : `✦ ${a[1]}は復活しました`],
            [/^— 新登場 NPC \[ (.+) \] 已加入角色面板 —$/, a => currentLanguage === 'en' ? `— New NPC [ ${a[1]} ] added to the Character Panel —` : `— 新しいNPC［${a[1]}］をキャラクターパネルに追加しました —`],
            [/^獲得道具 \[ (.+) \]$/, a => currentLanguage === 'en' ? `Item obtained [ ${a[1]} ]` : `アイテム入手［${a[1]}］`],
            [/^失去道具 \[ (.+) \]$/, a => currentLanguage === 'en' ? `Item lost [ ${a[1]} ]` : `アイテム喪失［${a[1]}］`],
            [/^新增狀態 \[ (.+) \]$/, a => currentLanguage === 'en' ? `Status added [ ${a[1]} ]` : `状態を追加［${a[1]}］`],
            [/^Flags 已達 (\d+) 個上限；新項目未加入，請至角色面板整理。$/, a => currentLanguage === 'en' ? `Flag limit (${a[1]}) reached. The new flag was not added; manage flags in the Character Panel.` : `フラグ上限（${a[1]}件）に達しました。新しい項目は追加されていません。キャラクターパネルで整理してください。`],
            [/^已切換為輔助旁白模式；玩家角色 (.+) 不預設在場$/, a => currentLanguage === 'en' ? `Switched to Narrator mode; ${a[1]} is not assumed to be present.` : `ナレーターモードに切り替えました。プレイヤーキャラクター「${a[1]}」は不在扱いです。`],
            [/^玩家角色 (.+) 已設為在場；後續普通輸入恢復角色行動模式$/, a => currentLanguage === 'en' ? `${a[1]} is now present; normal input has returned to Player mode.` : `プレイヤーキャラクター「${a[1]}」を登場状態にしました。通常入力はプレイヤーモードに戻ります。`],
            [/^玩家角色 (.+) 已設為不在場；後續普通輸入採輔助旁白模式$/, a => currentLanguage === 'en' ? `${a[1]} is now absent; normal input will use Narrator mode.` : `プレイヤーキャラクター「${a[1]}」を不在状態にしました。通常入力はナレーターモードになります。`],
            [/^操作者已轉換為「(.+)」引導身分；原玩家角色不預設在場$/, a => currentLanguage === 'en' ? `Operator role changed to “${a[1]}”; the player character is not assumed to be present.` : `操作役を「${a[1]}」に変更しました。プレイヤーキャラクターは不在扱いです。`],
            [/^— GAME OVER：(.+)（極限模式）—$/, a => currentLanguage === 'en' ? `— GAME OVER: ${a[1]} (Nightmare mode) —` : `— GAME OVER：${a[1]}（極限モード）—`],
            [/^— 生死檢定失敗：D20 (\d+)，GAME OVER —$/, a => currentLanguage === 'en' ? `— Survival check failed: D20 ${a[1]}, GAME OVER —` : `— 生死判定失敗：D20 ${a[1]}、GAME OVER —`],
            [/^— 生死檢定成功：D20 (\d+)，(.+)後保留 1 點 —$/, a => currentLanguage === 'en' ? `— Survival check succeeded: D20 ${a[1]}; ${a[2]}, 1 point remains —` : `— 生死判定成功：D20 ${a[1]}、${a[2]}後に1点残ります —`],
            [/^— 保護機制啟動：(.+)後保留 1 點 —$/, a => currentLanguage === 'en' ? `— Safety protection activated: ${a[1]}, 1 point remains —` : `— 保護機能作動：${a[1]}後に1点残ります —`],
            [/^重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）$/, a => currentLanguage === 'en' ? 'Memory updates paused (manual editing remains available).' : '重要記録の自動追加を一時停止しました（手動編集は可能です）。'],
            [/^重要紀錄：已恢復 AI 自動追加$/, a => currentLanguage === 'en' ? 'Memory updates resumed.' : '重要記録の自動追加を再開しました。'],
            [/^— (.+) —$/, a => {
                const inner = translateSystemText(a[1]);
                return `— ${inner} —`;
            }],
            [/^(STR|DEX|CON|INT|WIS|CHA)\s+(力量|敏捷|體質|智力|感知|魅力)｜(大成功|成功|失敗|大失敗)｜(.+)$/, a => {
                const stat = { 力量:['Strength','筋力'], 敏捷:['Dexterity','敏捷'], 體質:['Constitution','体質'], 智力:['Intelligence','知力'], 感知:['Wisdom','感知'], 魅力:['Charisma','魅力'] }[a[2]];
                const result = { 大成功:['Critical Success','大成功'], 成功:['Success','成功'], 失敗:['Failure','失敗'], 大失敗:['Critical Failure','大失敗'] }[a[3]];
                const index = currentLanguage === 'en' ? 0 : 1;
                return `${a[1]} ${stat[index]} | ${result[index]} | ${a[4]}`;
            }]
        ];
        for (const [pattern, format] of rules) {
            const match = value.match(pattern);
            if (match) return format(match);
        }
        return value;
    }

    function translateTextNode(node) {
        if (!node || shouldSkipNode(node)) return;
        const raw = node.nodeValue || '';
        const trimmed = raw.trim();
        if (!trimmed) return;
        let key = textKeys.get(node);
        const variants = key && M[key] ? [key, ...M[key]] : [];
        if (!key || !variants.includes(trimmed)) key = resolveKey(trimmed);
        if (key) {
            textKeys.set(node, key);
            const next = translatedValue(key);
            if (trimmed !== next) node.nodeValue = raw.replace(trimmed, next);
            return;
        }
        let dynamicSource = dynamicTextKeys.get(node);
        if (dynamicSource) {
            const knownVariants = [dynamicSource, translateDynamic(dynamicSource, 'en'), translateDynamic(dynamicSource, 'ja')];
            if (!knownVariants.includes(trimmed)) {
                dynamicTextKeys.delete(node);
                dynamicSource = '';
            }
        }
        dynamicSource ||= trimmed;
        const nextDynamic = translateDynamic(dynamicSource, currentLanguage);
        if (nextDynamic !== dynamicSource || dynamicTextKeys.has(node)) {
            if (!dynamicTextKeys.has(node)) dynamicTextKeys.set(node, dynamicSource);
            if (nextDynamic !== trimmed) node.nodeValue = raw.replace(trimmed, nextDynamic);
        }
    }

    function translateAttributes(element) {
        if (!element || element.nodeType !== 1 || element.matches('[data-no-i18n]')) return;
        let store = attrKeys.get(element);
        if (!store) { store = {}; attrKeys.set(element, store); }
        ['placeholder', 'title', 'aria-label'].forEach(name => {
            const value = element.getAttribute(name);
            if (!value) return;
            let key = store[name];
            const variants = key && ATTR_M[key] ? [key, ...ATTR_M[key]] : [];
            if (!key || !variants.includes(value)) key = resolveKey(value, ATTR_M, attrReverse);
            if (!key) return;
            store[name] = key;
            const next = translatedValue(key, currentLanguage, ATTR_M);
            if (value !== next) element.setAttribute(name, next);
        });
    }

    function translateSubtree(root = document.body) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root); return; }
        if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
            else translateAttributes(node);
        }
    }

    function syncLanguageSelectors() {
        document.querySelectorAll('[data-ui-language-select]').forEach(select => { select.value = currentLanguage; });
    }

    function setUiLanguage(locale, options = {}) {
        currentLanguage = normalizeLanguage(locale);
        if (options.persist !== false) localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, currentLanguage);
        document.documentElement.lang = currentLanguage;
        document.title = translatedValue('旅途筆記');
        syncLanguageSelectors();
        translateSubtree(document.body);
        if (options.notify !== false) window.dispatchEvent(new CustomEvent('ui-language-change', { detail: { locale: currentLanguage } }));
        return currentLanguage;
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(records => {
            records.forEach(record => {
                if (record.type === 'characterData') translateTextNode(record.target);
                if (record.type === 'childList') record.addedNodes.forEach(node => translateSubtree(node));
                if (record.type === 'attributes') translateAttributes(record.target);
            });
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
    }

    window.setUiLanguage = setUiLanguage;
    window.getUiLanguage = () => currentLanguage;
    window.translateUi = translateSubtree;
    window.uiMessage = (zh, params = {}) => {
        let value = translatedValue(zh);
        Object.entries(params).forEach(([key, replacement]) => { value = value.replaceAll(`{${key}}`, replacement); });
        return value;
    };
    window.uiSystemMessage = translateSystemText;

    const nativeAlert = window.alert.bind(window);
    const nativeConfirm = window.confirm.bind(window);
    const nativePrompt = window.prompt.bind(window);
    window.alert = message => nativeAlert(translateSystemText(message));
    window.confirm = message => nativeConfirm(translateSystemText(message));
    window.prompt = (message, defaultValue) => nativePrompt(translateSystemText(message), defaultValue);

    document.addEventListener('DOMContentLoaded', () => {
        setUiLanguage(currentLanguage, { persist: false, notify: false });
        startObserver();
    });
})();

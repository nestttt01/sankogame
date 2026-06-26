/* ==================== Script section 1 ==================== */
window.onerror = function(message, source, lineno, colno, error) {
            alert("系統捕捉到隱藏錯誤，請截圖這段文字：\n" + message + "\n行號：" + lineno);
            return true;
        };
        // 會呼吸的文字方塊：自動長高函數
        function autoResize(el) {
            el.style.height = 'auto';
            el.style.height = (el.scrollHeight) + 'px';
        }
        function initTextareas() {
            setTimeout(() => {
                document.querySelectorAll('textarea').forEach(el => autoResize(el));
            }, 50);
        }

        function openTutorialModal() {
            if (showHomeInfoView('guide')) return;
            document.getElementById('tutorial-modal').style.display = 'flex';
        }
        function closeTutorialModal() {
            document.getElementById('tutorial-modal').style.display = 'none';
        }
        function openApiGuideModal() {
            if (showHomeInfoView('api')) return;
            document.getElementById('api-guide-modal').style.display = 'flex';
        }
        function closeApiGuideModal() {
            document.getElementById('api-guide-modal').style.display = 'none';
        }
function showHomeInfoView(viewName = 'main', options = {}) {
const setupScreen = document.getElementById('setup-screen');
if (!setupScreen || getComputedStyle(setupScreen).display === 'none') return false;
if (!window.matchMedia('(min-width: 1100px)').matches) return false;
const requested = ['main', 'api', 'guide', 'saves', 'journal'].includes(viewName) ? viewName : 'main';
const activeView = document.querySelector('.setup-home-view.active')?.dataset.homeView || 'main';
const nextView = !options.force && activeView === requested && requested !== 'main' ? 'main' : requested;
            document.querySelectorAll('.setup-home-view').forEach(view => {
                view.classList.toggle('active', view.dataset.homeView === nextView);
            });
            document.querySelectorAll('.setup-side-tab[data-home-tab]').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.homeTab === nextView);
            });
return true;
}

function canUseSetupHomeView() {
const setupScreen = document.getElementById('setup-screen');
return !!setupScreen
&& getComputedStyle(setupScreen).display !== 'none'
&& window.matchMedia('(min-width: 1100px)').matches;
}

function embedSaveMenuInSetupHome() {
const host = document.getElementById('setup-save-host');
const screen = document.getElementById('save-menu-screen');
if (!host || !screen) return false;
host.appendChild(screen);
screen.classList.add('setup-embedded-screen');
screen.style.display = 'flex';
const backButton = screen.querySelector('.u-inline-056');
if (backButton) backButton.hidden = true;
return true;
}

function restoreSaveMenuFromSetupHome() {
const anchor = document.getElementById('save-menu-screen-home');
const screen = document.getElementById('save-menu-screen');
if (!anchor || !screen || screen.parentElement?.id !== 'setup-save-host') return;
screen.classList.remove('setup-embedded-screen');
screen.style.display = 'none';
const backButton = screen.querySelector('.u-inline-056');
if (backButton) backButton.hidden = false;
anchor.after(screen);
}

function embedJournalInSetupHome() {
const host = document.getElementById('setup-journal-host');
const screen = document.getElementById('journal-screen');
if (!host || !screen) return false;
host.appendChild(screen);
screen.classList.remove('journal-screen-embedded');
screen.classList.add('journal-screen-home-embedded');
screen.style.display = 'flex';
return true;
}

function restoreJournalFromSetupHome() {
const anchor = document.getElementById('journal-screen-home');
const screen = document.getElementById('journal-screen');
if (!anchor || !screen || screen.parentElement?.id !== 'setup-journal-host') return;
screen.classList.remove('journal-screen-home-embedded');
screen.style.display = 'none';
anchor.after(screen);
}

function updateSetupCurrentPresetLabel() {
const label = document.getElementById('setup-current-preset');
const name = document.getElementById('setup-current-preset-name');
if (!label || !name) return;
const preset = scenarioPresets?.[activePresetId] || {};
label.firstChild.textContent = `${uiText('目前配置')}：`;
name.textContent = valueToText(preset.presetName, uiText('未命名配置'));
}

function markEditScenarioDirty() {
if (document.getElementById('edit-scenario-screen')?.style.display === 'flex') editScenarioDirty = true;
}

function clearEditScenarioDirty() {
editScenarioDirty = false;
}

function setupEditScenarioLeaveWarning() {
const screen = document.getElementById('edit-scenario-screen');
if (!screen || screen.dataset.leaveWarningReady === 'true') return;
screen.dataset.leaveWarningReady = 'true';
screen.addEventListener('input', markEditScenarioDirty, true);
screen.addEventListener('change', markEditScenarioDirty, true);
window.addEventListener('beforeunload', event => {
const editingVisible = screen.style.display === 'flex';
if (!editingVisible || !editScenarioDirty) return;
event.preventDefault();
event.returnValue = '';
});
}

/* ==================== Script section 2 ==================== */
/* ======= 系統核心變數 ======= */
        let apiProvider = "google";
        let apiKey = "";
        const sessionApiKeys = {};
        let rememberApiKey = false;
        let selectedModel = "";
        const MAX_RECENT_CHAT_LINES = 24;
        const MAX_AI_OUTPUT_TOKENS = 1600;
        const MAX_ADVENTURE_LOG_PROMPT_CHARS = 6000;
        const DEFAULT_RECENT_CHAT_TURNS = 6;
        const DEFAULT_RECENT_CHAT_CHARS = 4200;
        const MAX_SUMMARY_ITEM_CHARS = 160;
        const MAX_RELATIONSHIP_ITEM_CHARS = 140;
        const MAX_FLAG_CHARS = 48;
        const MAX_STORED_FLAGS = 80;
        const MAX_FLAGS_FOR_PROMPT = 32;
        const MAX_MEMORY_NOTES_FOR_PROMPT = 16;
        const MAX_MEMORY_NOTE_PROMPT_CHARS = 32;
        const MAX_MEMORY_NOTE_STORED_CHARS = 36;
        const MEMORY_NOTES_COLLAPSE_THRESHOLD = 6;
        const AI_REQUEST_TIMEOUT_MS = 75000;
        const AI_REQUEST_MAX_ATTEMPTS = 2;
        let activeAIAbortController = null;
        let activeAIAbortReason = '';
        let storageWarningShown = false;

        function getModelRuntimeProfile() {
            const modelId = String(selectedModel || '').toLowerCase();
            const bilingual = ['ja-zh', 'en-zh'].includes(currentScenario?.languageMode);
            if (apiProvider === 'openrouter' && /(?:^|\/)gpt-4[.-]?1(?:$|[-:])/.test(modelId)) {
                return {
                    id: 'gpt-4.1', normalMaxTokens: bilingual ? 1400 : 1100,
                    repairMaxTokens: 800, summaryMaxTokens: 1400, journalMaxTokens: 2200,
                    recentTurns: 6, recentChars: 3600, promptChars: 15500,
                    loreChars: 1800, npcLimit: 6, memoryNotes: 8
                };
            }
            if (apiProvider === 'openrouter') {
                return {
                    id: 'openrouter', normalMaxTokens: bilingual ? 1500 : 1250,
                    repairMaxTokens: 850, summaryMaxTokens: 1500, journalMaxTokens: 2200,
                    recentTurns: 6, recentChars: 4200, promptChars: 18000,
                    loreChars: 2200, npcLimit: 7, memoryNotes: 8
                };
            }
            return {
                id: 'gemini', normalMaxTokens: bilingual ? 1800 : 1600,
                repairMaxTokens: 900, summaryMaxTokens: 1600, journalMaxTokens: 2400,
                recentTurns: 8, recentChars: 6000, promptChars: 28000,
                loreChars: 3000, npcLimit: 8, memoryNotes: 10
            };
        }
        const DICE_STATS = {
            str: { code: 'STR', label: '力量' },
            dex: { code: 'DEX', label: '敏捷' },
            con: { code: 'CON', label: '體質' },
            int: { code: 'INT', label: '智力' },
            wis: { code: 'WIS', label: '感知' },
            cha: { code: 'CHA', label: '魅力' }
        };
        const DICE_DIFFICULTIES = {
            easy: { label: '簡單', dc: 8 },
            normal: { label: '普通', dc: 10 },
            hard: { label: '困難', dc: 14 },
            extreme: { label: '極難', dc: 18 }
        };
        const GAME_DIFFICULTIES = {
            standard: { label: '標準模式', dcModifier: 0, gameOver: 'none' },
            hard: { label: '困難模式', dcModifier: 2, gameOver: 'possible' },
            nightmare: { label: '極限模式', dcModifier: 4, gameOver: 'forced' }
        };
        const AUTO_SURVIVAL_FLAGS = {
            hpCritical: '重傷（HP 20 以下）',
            hpZero: '生命歸零（危機結局待處理）',
            sanCritical: '精神瀕臨崩潰（SAN 20 以下）',
            sanZero: '精神歸零（危機結局待處理）'
        };
        const AUTO_SURVIVAL_FLAG_SET = new Set(Object.values(AUTO_SURVIVAL_FLAGS));
        
        let currentHp = 100;
        let currentSan = 100;
        let currentItems = [];
        
        let currentScenarioIndex = 0; 
        let chatScripts = [[]]; 
        let currentChatPageIndex = 0; 

        let currentAdventureLog = "• 故事剛開始，目前尚無重大事件發生。"; 
        let currentStorySummary = "";
        let currentOpenTasks = "";
        let currentRelationshipSummary = "";
        let currentFlags = []; 
        let currentSaveId = null; 
        let savesData = {}; 
        let pendingSceneTransition = null;
        let pendingDiceSummary = null;
        let creatorInputArmed = false;
        let activeGameSaveTimer = null;
        let activeInputDraftTimer = null;
        let lastLifecycleSaveAt = 0;
        let activeStatusTab = "state";
        const JOURNAL_PAGE_SIZE = 50;
        let journalSelectedSaveId = '';
        let journalPageIndex = 0;
        let journalSearchText = '';
let journalEditingEntryIndex = -1;
let journalReturnTarget = 'setup';
let journalEmbedded = false;
let editScenarioDirty = false;
let apiUsageStats = {};
let lastPromptDiagnostics = {};

window.addEventListener('ui-language-change', () => {
 updateSetupCurrentPresetLabel();
});

        const UI_THEME_STORAGE_KEY = 'sanko_ui_theme_v1';
        const LAST_BACKUP_STORAGE_KEY = 'sanko_last_backup_at_v1';
        const BACKUP_REMINDER_DAYS = 14;
const DEFAULT_UI_THEME = Object.freeze({
background: '#EEEEEE',
paper: '#EEEEEE',
surface: '#FAFAFA',
ink: '#282828',
accent: '#EDFF66',
dialogue: '#BFB3B8'
});
const UI_THEME_VARIABLES = Object.freeze({
background: '--bg-main',
paper: '--paper-bg',
surface: '--card-bg',
ink: '--border-dark',
accent: '--accent-neon',
dialogue: '--accent-gray'
});
        let uiTheme = { ...DEFAULT_UI_THEME };

        function normalizeThemeColor(value, fallback) {
            const clean = String(value || '').trim();
            return /^#[0-9a-f]{6}$/i.test(clean) ? clean.toUpperCase() : fallback;
        }

        function normalizeUiTheme(value) {
            const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            return Object.fromEntries(Object.keys(DEFAULT_UI_THEME).map(key => [
                key,
                normalizeThemeColor(source[key], DEFAULT_UI_THEME[key])
            ]));
        }

        function mixThemeColors(base, overlay, overlayRatio = 0.12) {
            const toRgb = color => [1, 3, 5].map(index => Number.parseInt(color.slice(index, index + 2), 16));
            const baseRgb = toRgb(normalizeThemeColor(base, DEFAULT_UI_THEME.surface));
            const overlayRgb = toRgb(normalizeThemeColor(overlay, DEFAULT_UI_THEME.ink));
            const mixed = baseRgb.map((value, index) => Math.round(value * (1 - overlayRatio) + overlayRgb[index] * overlayRatio));
            return `#${mixed.map(value => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
        }

        function syncUiThemeControls() {
            Object.keys(DEFAULT_UI_THEME).forEach(key => {
                const input = document.getElementById(`theme-${key}`);
                if (input && input.value.toUpperCase() !== uiTheme[key]) input.value = uiTheme[key];
            });
        }

        function applyUiTheme(theme, persist = true) {
            uiTheme = normalizeUiTheme(theme);
            Object.entries(UI_THEME_VARIABLES).forEach(([key, variable]) => {
                document.documentElement.style.setProperty(variable, uiTheme[key]);
            });
            document.documentElement.style.setProperty('--text-main', uiTheme.ink);
            document.documentElement.style.setProperty('--text-sub', `${uiTheme.ink}A6`);
            document.documentElement.style.setProperty('--surface-muted', mixThemeColors(uiTheme.surface, uiTheme.ink));
            if (persist) localStorage.setItem(UI_THEME_STORAGE_KEY, JSON.stringify(uiTheme));
            syncUiThemeControls();
            return uiTheme;
        }

        function loadUiTheme() {
            try {
                const stored = JSON.parse(localStorage.getItem(UI_THEME_STORAGE_KEY) || 'null');
                applyUiTheme(stored || DEFAULT_UI_THEME, false);
            } catch (error) {
                console.warn('配色資料已損壞，已恢復預設值', error);
                applyUiTheme(DEFAULT_UI_THEME, true);
            }
        }

        function updateUiThemeColor(key, color) {
            if (!(key in DEFAULT_UI_THEME)) return;
            applyUiTheme({ ...uiTheme, [key]: color }, true);
        }

        function resetUiTheme() {
            applyUiTheme(DEFAULT_UI_THEME, true);
        }

        const emptyAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

        /* ======= 劇本配置系統 ======= */
        const defaultPreset = {
            id: 'default',
            presetName: '預設：TRPG雙重宇宙(範例)',
            playerName: '小島秀芙',
            playerAvatar: emptyAvatar,
            playerStats: { str: 8, dex: 12, con: 14, int: 12, wis: 13, cha: 13 },
            isLocked: false, 
            statsLocked: true, 
            languageMode: 'zh-tw',
            gameDifficulty: 'standard',
            playerDetails: { age: '24歲 / 152cm', speech: '直率、偶爾會吐槽。', likes: '薪水、睡眠、PVP打架。', dislikes: '加班、高難度副本機制。', app: '在艾歐澤亞內是白髮貓魅族，喜歡到處旅行，也喜歡去各種類型的店內當員工，最近樂於在海霧村的公關店幫客人畫拍立得。現實生活是被死線追殺的社畜設計師，經常穿無彩度寬鬆的休閒服。', bg: '打架很凶但PVE常迷路。專長：敏銳心靈、耐性、洞察。' },
            npcs: [
                {
                    id: 'npc_1',
                    name: '宮崎三高',
                    avatar: emptyAvatar,
                    affection: 0,
                    details: { age: '26歲 / 192cm', speech: '極度精簡(例如：「好」)，語氣冷靜。', likes: '動物迷因、觀察人類。', dislikes: '沒有特別討厭的。', app: '在艾歐澤亞是精靈，面部有淡淡傷疤，氣質禁慾，喜歡穿黑白色系服飾。在現實話也比較簡短，但經常突然冒出聽起來很幽默的話，同樣喜歡穿黑白色系服飾。', bg: '極度內斂。就算玩家搞砸也會默默扛下一切。專長：治癒師、演員、觀察力。' }
                },
                {
                    id: 'npc_2',
                    name: 'SY',
                    avatar: emptyAvatar,
                    affection: 0,
                    details: { age: '26歲 / 175cm', speech: '有點遲鈍，沒什麼情緒起伏。', likes: '打扮、在家組模型。', dislikes: '早起。', app: '在艾歐澤亞，擁有敏銳的兔耳朵。現實中是擅長打扮的男性，經常遲到但化妝實力堅強。', bg: '有點遲鈍的機工士。對什麼事情都沒有太大的反應。專長：幸運、神射手、武器大師。' }
                }
            ],
            scenarios: [
                {
                    name: '艾歐澤亞 (FFXIV)',
                    lore: '充滿魔法與劍的奇幻虛擬世界。大家擁有技能與血量設定，一起推進高難度副本。但在副本以外的氛圍卻是大家喜歡一同歡樂，艾歐澤亞住民們經營了各種形形色色的店面，包括花店、麵包店、咖啡廳、舞廳、女僕公關店、或者是賭場。',
                    npcRoles: '三高是硬核賢者補師(H2)，負責補血。SY是技術高超的遠程輸出。',
                    playerRole: '熱衷 PVP 但對高難副本一竅不通的坦克，最近熱衷於跑店。',
                    transitionRule: '從現實世界進入時，預設視為登入遊戲；角色保留現實世界的人際關係與記憶。'
                },
                {
                    name: '現實世界',
                    lore: '現代都市，現代都市，地點在哪裡並不重要，不需要寫出地點。\n【🚨 DM 動態情境判斷法則】：\n1. 當剛退出遊戲 / 未特別說明時：預設大家『已下班，各自待幾家中』透過 Discord 語音閒聊。請描寫居家的放鬆感（如看迷因、喝水）。\n2. 當玩家主動出門 / 約見面 / 跑現實劇情時：請立刻無縫切換為『實體空間互動』！此時他們作為攝影師、化妝師的現實職業狀態與穿搭外貌，將成為主要的互動元素。\n(請 DM 隨時根據玩家的動作，聰明判斷現在是「遠端通話」還是「實體面對面」)',
                    npcRoles: '語音通話時：三高通常在看動物迷因，SY 呈現放鬆狀態。實體見面時：三高會展現禁慾專業的攝影師氣場，SY 則是擅長打扮的男性。',
                    playerRole: '平時在家是被死線追殺的設計師，若出門則會切換為現實生活對應的狀態。',
                    transitionRule: '從艾歐澤亞切回時，預設視為登出遊戲並回到 Discord 語音；除非玩家明確描述實體見面。'
                }
            ]
        };

        let scenarioPresets = {};
        let activePresetId = 'default';
        let currentScenario = {}; 
        
        let editingNpcs = [];
        let editingScenarios = [];
        let randomGeneratorMode = 'world';
        let pendingGeneratedPreset = null;

        const GAME_DB_NAME = 'sanko_trpg_storage';
        const GAME_DB_VERSION = 1;
        const GAME_DB_STORE = 'game_data';
        const SAVE_INDEX_KEY = 'sanko_save_index_v1';
        const SAVE_ITEM_PREFIX = 'sanko_save_v1:';
        const INDEXED_DATA_KEYS = new Set([
            'sanko_saves_v8',
            SAVE_INDEX_KEY,
            'sanko_scenario_presets_v2',
            'sanko_api_usage_stats_v1',
            'sanko_home_pic'
        ]);
        const INDEXED_JSON_KEYS = new Set([
            'sanko_saves_v8',
            SAVE_INDEX_KEY,
            'sanko_scenario_presets_v2',
            'sanko_api_usage_stats_v1'
        ]);
        let gameDatabasePromise = null;
        let gameDatabaseConnection = null;
        let indexedDatabaseReady = false;
        let indexedWriteQueue = Promise.resolve();
        const pendingIndexedWrites = new Map();
        let indexedRetryTimer = null;
        let storedSaveIds = new Set();
        let deletedSaveIds = new Set();

        function getSaveStorageKey(saveId) {
            return `${SAVE_ITEM_PREFIX}${String(saveId)}`;
        }

        function isIndexedStorageKey(key) {
            return INDEXED_DATA_KEYS.has(key) || String(key).startsWith(SAVE_ITEM_PREFIX);
        }

        function clonePersistentValue(value) {
            if (typeof structuredClone === 'function') return structuredClone(value);
            return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
        }

        function openGameDatabase() {
            if (gameDatabasePromise) return gameDatabasePromise;
            const openingPromise = new Promise((resolve, reject) => {
                if (!window.indexedDB) { reject(new Error('此瀏覽器不支援 IndexedDB')); return; }
                const request = indexedDB.open(GAME_DB_NAME, GAME_DB_VERSION);
                request.onupgradeneeded = () => {
                    const database = request.result;
                    if (!database.objectStoreNames.contains(GAME_DB_STORE)) database.createObjectStore(GAME_DB_STORE);
                };
                request.onsuccess = () => {
                    const database = request.result;
                    gameDatabaseConnection = database;
                    database.onversionchange = () => {
                        if (gameDatabaseConnection === database) {
                            gameDatabaseConnection = null;
                            gameDatabasePromise = null;
                        }
                        database.close();
                    };
                    database.onclose = () => {
                        if (gameDatabaseConnection !== database) return;
                        gameDatabaseConnection = null;
                        gameDatabasePromise = null;
                    };
                    resolve(database);
                };
                request.onerror = () => reject(request.error || new Error('IndexedDB 開啟失敗'));
                request.onblocked = () => reject(new Error('IndexedDB 被其他分頁阻擋'));
            });
            gameDatabasePromise = openingPromise.catch(error => {
                gameDatabasePromise = null;
                throw error;
            });
            return gameDatabasePromise;
        }

        function invalidateGameDatabaseConnection() {
            const database = gameDatabaseConnection;
            gameDatabaseConnection = null;
            gameDatabasePromise = null;
            try { database?.close(); } catch (error) { /* 下一次寫入會重新開啟 */ }
        }

        async function readIndexedValue(key) {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readonly');
                const request = transaction.objectStore(GAME_DB_STORE).get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || new Error('IndexedDB 讀取失敗'));
            });
        }

        async function writeIndexedValue(key, value) {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readwrite');
                transaction.objectStore(GAME_DB_STORE).put(value, key);
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 寫入失敗'));
                transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 寫入已中止'));
            });
        }

        async function deleteIndexedValue(key) {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readwrite');
                transaction.objectStore(GAME_DB_STORE).delete(key);
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 刪除失敗'));
                transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 刪除已中止'));
            });
        }

        async function listIndexedKeys(prefix = '') {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readonly');
                const request = transaction.objectStore(GAME_DB_STORE).getAllKeys();
                request.onsuccess = () => resolve((request.result || []).map(String).filter(key => !prefix || key.startsWith(prefix)));
                request.onerror = () => reject(request.error || new Error('IndexedDB 索引讀取失敗'));
            });
        }

        async function clearIndexedGameData() {
            try {
                const database = await openGameDatabase();
                await new Promise((resolve, reject) => {
                    const transaction = database.transaction(GAME_DB_STORE, 'readwrite');
                    transaction.objectStore(GAME_DB_STORE).clear();
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 清除失敗'));
                    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 清除已中止'));
                });
            } catch (error) {
                console.warn('IndexedDB 清除失敗，將繼續清除舊資料。', error);
            }
        }

        function handleIndexedWriteError(label, error) {
            console.error(`${label}儲存失敗`, error);
            if (!storageWarningShown) {
                storageWarningShown = true;
                alert(`${label}無法寫入瀏覽器資料庫。請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。`);
            }
        }

        function isTemporaryIndexedWriteError(error) {
            const errorName = String(error?.name || '');
            const errorMessage = String(error?.message || '');
            return ['AbortError', 'InvalidStateError', 'TransactionInactiveError', 'UnknownError', 'NotReadableError'].includes(errorName)
                || /abort|inactive|background|closing|closed|transaction/i.test(`${errorName} ${errorMessage}`);
        }

        function scheduleIndexedWriteRetry(delay = 500) {
            if (indexedRetryTimer) clearTimeout(indexedRetryTimer);
            if (document.visibilityState === 'hidden' || !pendingIndexedWrites.size) return;
            indexedRetryTimer = setTimeout(() => {
                indexedRetryTimer = null;
                retryPendingIndexedWrites();
            }, delay);
        }

        async function flushPendingIndexedWrite(key) {
            const pendingWrite = pendingIndexedWrites.get(key);
            if (!pendingWrite) return true;
            try {
                if (pendingWrite.operation === 'delete') await deleteIndexedValue(key);
                else await writeIndexedValue(key, pendingWrite.snapshot);
                if (pendingIndexedWrites.get(key) === pendingWrite) pendingIndexedWrites.delete(key);
                storageWarningShown = false;
                return true;
            } catch (error) {
                invalidateGameDatabaseConnection();
                if (pendingIndexedWrites.get(key) !== pendingWrite) return false;
                if (document.visibilityState === 'hidden') {
                    console.warn(`${pendingWrite.label}背景儲存暫停，回到頁面後會自動重試。`, error);
                    return false;
                }
                pendingWrite.attempts += 1;
                if (pendingWrite.attempts < 2 && isTemporaryIndexedWriteError(error)) {
                    scheduleIndexedWriteRetry();
                    return false;
                }
                pendingIndexedWrites.delete(key);
                handleIndexedWriteError(pendingWrite.label, error);
                return false;
            }
        }

        function retryPendingIndexedWrites() {
            if (document.visibilityState === 'hidden' || !pendingIndexedWrites.size) return;
            for (const key of pendingIndexedWrites.keys()) {
                indexedWriteQueue = indexedWriteQueue.then(() => flushPendingIndexedWrite(key));
            }
        }

        function queueIndexedWrite(key, value, label = '資料') {
            pendingIndexedWrites.set(key, {
                operation: 'put',
                snapshot: clonePersistentValue(value),
                label,
                attempts: 0
            });
            indexedWriteQueue = indexedWriteQueue.then(() => flushPendingIndexedWrite(key));
            return true;
        }

        function queueIndexedDelete(key, label = '資料') {
            pendingIndexedWrites.set(key, {
                operation: 'delete',
                snapshot: undefined,
                label,
                attempts: 0
            });
            indexedWriteQueue = indexedWriteQueue.then(() => flushPendingIndexedWrite(key));
            return true;
        }

        function buildSaveIndexPayload() {
            return {
                version: 1,
                ids: Array.from(storedSaveIds),
                deleted: Array.from(deletedSaveIds)
            };
        }

        async function loadSaveCollection() {
            if (!indexedDatabaseReady) {
                const legacySaves = await readPersistentValue('sanko_saves_v8', {});
                const fallback = legacySaves && typeof legacySaves === 'object' && !Array.isArray(legacySaves) ? legacySaves : {};
                storedSaveIds = new Set(Object.keys(fallback));
                return fallback;
            }

            const indexValue = await readIndexedValue(SAVE_INDEX_KEY);
            const indexedIds = Array.isArray(indexValue)
                ? indexValue.map(String)
                : Array.isArray(indexValue?.ids) ? indexValue.ids.map(String) : [];
            deletedSaveIds = new Set(Array.isArray(indexValue?.deleted) ? indexValue.deleted.map(String) : []);

            const itemKeys = await listIndexedKeys(SAVE_ITEM_PREFIX);
            const scannedIds = itemKeys.map(key => key.slice(SAVE_ITEM_PREFIX.length)).filter(Boolean);
            const candidateIds = new Set(indexedIds);
            scannedIds.forEach(id => { if (!deletedSaveIds.has(id)) candidateIds.add(id); });

            const legacyValue = await readIndexedValue('sanko_saves_v8');
            const legacySaves = legacyValue && typeof legacyValue === 'object' && !Array.isArray(legacyValue) ? legacyValue : {};
            Object.keys(legacySaves).forEach(id => { if (!deletedSaveIds.has(id)) candidateIds.add(id); });

            const loadedSaves = {};
            for (const id of candidateIds) {
                let save = await readIndexedValue(getSaveStorageKey(id));
                if ((!save || typeof save !== 'object' || Array.isArray(save)) && legacySaves[id]) {
                    save = legacySaves[id];
                    await writeIndexedValue(getSaveStorageKey(id), save);
                }
                if (save && typeof save === 'object' && !Array.isArray(save)) loadedSaves[id] = save;
            }

            storedSaveIds = new Set(Object.keys(loadedSaves));
            await writeIndexedValue(SAVE_INDEX_KEY, buildSaveIndexPayload());
            if (legacyValue !== undefined) await deleteIndexedValue('sanko_saves_v8');
            localStorage.removeItem('sanko_saves_v8');
            return loadedSaves;
        }

        function persistSaveIndex(label = '存檔索引') {
            if (!indexedDatabaseReady) return true;
            return queueIndexedWrite(SAVE_INDEX_KEY, buildSaveIndexPayload(), label);
        }

        function persistSingleSave(saveId, label = '遊戲存檔') {
            const id = String(saveId || '');
            const save = savesData[id];
            if (!id || !save) return false;
            if (!indexedDatabaseReady) {
                try {
                    localStorage.setItem('sanko_saves_v8', JSON.stringify(savesData));
                    storageWarningShown = false;
                    return true;
                } catch (error) {
                    handleIndexedWriteError(label, error);
                    return false;
                }
            }
            const isNew = !storedSaveIds.has(id) || deletedSaveIds.has(id);
            deletedSaveIds.delete(id);
            storedSaveIds.add(id);
            queueIndexedWrite(getSaveStorageKey(id), save, label);
            if (isNew) persistSaveIndex('存檔索引');
            return true;
        }

        function persistAllSaves(label = '遊戲存檔') {
            if (!indexedDatabaseReady) {
                try {
                    localStorage.setItem('sanko_saves_v8', JSON.stringify(savesData));
                    storageWarningShown = false;
                    return true;
                } catch (error) {
                    handleIndexedWriteError(label, error);
                    return false;
                }
            }
            const nextIds = new Set(Object.keys(savesData));
            storedSaveIds.forEach(id => {
                if (!nextIds.has(id)) deletedSaveIds.add(id);
            });
            nextIds.forEach(id => {
                deletedSaveIds.delete(id);
                queueIndexedWrite(getSaveStorageKey(id), savesData[id], label);
            });
            storedSaveIds.forEach(id => {
                if (!nextIds.has(id)) queueIndexedDelete(getSaveStorageKey(id), label);
            });
            storedSaveIds = nextIds;
            persistSaveIndex('存檔索引');
            return true;
        }

        function removePersistedSave(saveId, label = '刪除遊戲存檔') {
            const id = String(saveId || '');
            if (!id) return false;
            if (!indexedDatabaseReady) {
                try {
                    localStorage.setItem('sanko_saves_v8', JSON.stringify(savesData));
                    return true;
                } catch (error) {
                    handleIndexedWriteError(label, error);
                    return false;
                }
            }
            storedSaveIds.delete(id);
            deletedSaveIds.add(id);
            persistSaveIndex('存檔索引');
            queueIndexedDelete(getSaveStorageKey(id), label);
            return true;
        }

        async function initializePersistentStorage() {
            try {
                await openGameDatabase();
                for (const key of INDEXED_DATA_KEYS) {
                    const storedValue = await readIndexedValue(key);
                    if (storedValue !== undefined) {
                        localStorage.removeItem(key);
                        continue;
                    }
                    const legacyValue = localStorage.getItem(key);
                    if (legacyValue === null) continue;
                    let migratedValue = legacyValue;
                    if (INDEXED_JSON_KEYS.has(key)) {
                        try { migratedValue = JSON.parse(legacyValue); }
                        catch (error) { console.warn(`略過損毀的舊資料：${key}`, error); continue; }
                    }
                    await writeIndexedValue(key, migratedValue);
                    localStorage.removeItem(key);
                }
                indexedDatabaseReady = true;
                return true;
            } catch (error) {
                indexedDatabaseReady = false;
                console.warn('IndexedDB 無法使用，暫時退回 localStorage。', error);
                return false;
            }
        }

        async function readPersistentValue(key, fallbackValue) {
            if (indexedDatabaseReady && isIndexedStorageKey(key)) {
                try {
                    const value = await readIndexedValue(key);
                    return value === undefined ? fallbackValue : value;
                } catch (error) {
                    console.warn(`IndexedDB 讀取失敗：${key}`, error);
                }
            }
            const legacyValue = localStorage.getItem(key);
            if (legacyValue === null) return fallbackValue;
            if (!INDEXED_JSON_KEYS.has(key)) return legacyValue;
            try { return JSON.parse(legacyValue); }
            catch (error) { return fallbackValue; }
        }

        function persistLargeValue(storageKey, value, label = '資料') {
            if (indexedDatabaseReady && isIndexedStorageKey(storageKey)) return queueIndexedWrite(storageKey, value, label);
            try {
                localStorage.setItem(storageKey, value);
                return true;
            } catch (error) {
                handleIndexedWriteError(label, error);
                return false;
            }
        }

        window.onload = async () => {
            try {
                loadUiTheme();
                await initializePersistentStorage();
                apiUsageStats = await loadApiUsageStats();
                apiProvider = localStorage.getItem('sanko_api_provider') || 'google';
                const providerSelect = document.getElementById('api-provider');
                if (providerSelect) providerSelect.value = apiProvider;

                const hasPersistedKey = Boolean(getPersistedApiKey('google') || getPersistedApiKey('openrouter'));
                const savedRememberPreference = localStorage.getItem('sanko_remember_api_key');
                rememberApiKey = savedRememberPreference === null ? hasPersistedKey : savedRememberPreference === 'true';
                localStorage.setItem('sanko_remember_api_key', String(rememberApiKey));
                if (!rememberApiKey) removePersistedApiKeys();
                const rememberToggle = document.getElementById('remember-api-key');
                if (rememberToggle) rememberToggle.checked = rememberApiKey;

                const savedKey = rememberApiKey ? getPersistedApiKey(apiProvider) : '';
                if (savedKey) {
                    sessionApiKeys[apiProvider] = savedKey;
                    apiKey = savedKey;
                    document.getElementById('api-key').value = savedKey;
                    document.getElementById('delete-key-btn').style.display = 'inline-block';
            }
selectedModel = localStorage.getItem(getModelStorageKey(apiProvider)) || '';
setHomeModelAreaVisible(selectedModel && apiKey);
ensureGameModelSelectReady();

            const savedPic = await readPersistentValue('sanko_home_pic', '');
                if (savedPic) { document.getElementById('setup-pic').src = savedPic; }

                savesData = await loadSaveCollection();

                const savedPresets = await readPersistentValue('sanko_scenario_presets_v2', null);
                if (savedPresets && typeof savedPresets === 'object' && !Array.isArray(savedPresets)) {
                    scenarioPresets = savedPresets;
                    let presetRuntimeStateRemoved = false;
                    for(let k in scenarioPresets) {
                        if(!scenarioPresets[k].playerStats) {
                            scenarioPresets[k].playerStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
                        }
                        scenarioPresets[k].playerStats = normalizePlayerStats(scenarioPresets[k].playerStats);
                        
                        // 相容鎖定設定：將預設防刪鎖與數值鎖分開
                        if(scenarioPresets[k].isLocked === undefined) { scenarioPresets[k].isLocked = false; }
                        if(scenarioPresets[k].statsLocked === undefined) { scenarioPresets[k].statsLocked = true; }
                        if(!scenarioPresets[k].gameDifficulty) { scenarioPresets[k].gameDifficulty = 'standard'; }
                        
                        // 舊存檔相容
                        if(!scenarioPresets[k].playerDetails) {
                            scenarioPresets[k].playerDetails = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: scenarioPresets[k].playerPersona || '' };
                        }
                        
                        if(!scenarioPresets[k].npcs) {
                            scenarioPresets[k].npcs = [{
                                id: 'npc_' + Date.now(),
                                name: scenarioPresets[k].targetName || '未知目標',
                                avatar: scenarioPresets[k].targetAvatar || emptyAvatar,
                                details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: scenarioPresets[k].targetPersona || '' },
                                affection: 0
                            }];
                        } else {
                            scenarioPresets[k].npcs.forEach(n => { 
                                if (n.affection === undefined) n.affection = 0; 
                                if (!n.details) n.details = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' };
                            });
                        }
                        if(!scenarioPresets[k].scenarios) {
                            scenarioPresets[k].scenarios = [{name: '預設場景', lore: '', npcRoles: scenarioPresets[k].targetRole || '', playerRole: '', transitionRule: ''}];
                        } else {
                            scenarioPresets[k].scenarios.forEach(sc => {
                                if(sc.npcRoles === undefined) sc.npcRoles = sc.targetRole || '';
                                if(sc.playerRole === undefined) sc.playerRole = '';
                                if(sc.transitionRule === undefined) sc.transitionRule = '';
                            });
                        }

                        const hasRuntimeState = Boolean(scenarioPresets[k].playerDynamic)
                            || scenarioPresets[k].npcs.some(n => Boolean(n.dynamic));
                        if (hasRuntimeState) {
                            scenarioPresets[k] = createPresetSnapshotFromScenario(scenarioPresets[k], scenarioPresets[k]);
                            presetRuntimeStateRemoved = true;
                        }
                    }
                    if (presetRuntimeStateRemoved) persistJson('sanko_scenario_presets_v2', scenarioPresets, '清理角色配置中的遊戲進度');
                } else {
                    scenarioPresets = { 'default': defaultPreset };
                    persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
                }

                activePresetId = localStorage.getItem('sanko_active_preset_id') || 'default';
                if (!scenarioPresets[activePresetId]) activePresetId = Object.keys(scenarioPresets)[0];
                currentScenario = clonePersistentValue(scenarioPresets[activePresetId]);

            } catch (e) {
                console.error("載入資料時發生錯誤:", e);
            }
            adjustInputHeight();
        }

        function loadPic(input) {
            triggerCrop(input, 'home');
        }

        function setHomeModelAreaVisible(visible) {
            const isVisible = Boolean(visible);
            const area = document.getElementById('model-selection-area');
            if (area) area.style.display = isVisible ? 'block' : 'none';
            document.getElementById('setup-screen')?.classList.toggle('home-has-model', isVisible);
        }

        function cycleUiLanguageFromHome() {
            const order = ['zh-TW', 'ja', 'en'];
            const current = window.getUiLanguage
                ? getUiLanguage()
                : (document.querySelector('[data-ui-language-select]')?.value || 'zh-TW');
            const index = order.indexOf(current);
            const next = order[(index + 1 + order.length) % order.length] || 'zh-TW';
            if (window.setUiLanguage) setUiLanguage(next);
        }

        const PLAYER_STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const PLAYER_STAT_TOTAL_CAP = 72;

        function normalizePlayerStats(stats) {
            const normalized = {};
            PLAYER_STAT_KEYS.forEach(key => {
                const value = Number.parseInt(stats?.[key], 10);
                normalized[key] = Math.max(1, Math.min(20, Number.isFinite(value) ? value : 10));
            });
            let total = PLAYER_STAT_KEYS.reduce((sum, key) => sum + normalized[key], 0);
            while (total > PLAYER_STAT_TOTAL_CAP) {
                const reducible = PLAYER_STAT_KEYS
                    .filter(key => normalized[key] > 1)
                    .sort((a, b) => normalized[b] - normalized[a]);
                if (!reducible.length) break;
                normalized[reducible[0]] -= 1;
                total -= 1;
            }
            return normalized;
        }

        function getStatInputs() {
            return PLAYER_STAT_KEYS.map(key => document.getElementById(`stat-${key}`)).filter(Boolean);
        }

        function updateStatTotalDisplay() {
            const total = getStatInputs().reduce((sum, input) => sum + (Number.parseInt(input.value, 10) || 0), 0);
            const display = document.getElementById('stat-total-display');
            if (display) {
                display.textContent = `總點數 ${total} / ${PLAYER_STAT_TOTAL_CAP}`;
                display.classList.toggle('at-cap', total >= PLAYER_STAT_TOTAL_CAP);
            }
            return total;
        }

        function enforceStatTotal(changedInput) {
            const parsed = Number.parseInt(changedInput.value, 10);
            if (!Number.isFinite(parsed)) { updateStatTotalDisplay(); return; }
            const otherTotal = getStatInputs()
                .filter(input => input !== changedInput)
                .reduce((sum, input) => sum + (Number.parseInt(input.value, 10) || 0), 0);
            const maxAllowed = Math.max(1, Math.min(20, PLAYER_STAT_TOTAL_CAP - otherTotal));
            changedInput.value = Math.max(1, Math.min(maxAllowed, parsed));
            updateStatTotalDisplay();
        }

        function readPlayerStatsFromInputs() {
            const raw = {};
            PLAYER_STAT_KEYS.forEach(key => {
                raw[key] = Number.parseInt(document.getElementById(`stat-${key}`)?.value, 10) || 10;
            });
            return normalizePlayerStats(raw);
        }

        function roll4d6DropLowest() {
            const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => a - b);
            return rolls[1] + rolls[2] + rolls[3];
        }

        function rollPlayerStatSetAtCap() {
            let stats;
            do {
                stats = Object.fromEntries(PLAYER_STAT_KEYS.map(key => [key, roll4d6DropLowest()]));
            } while (PLAYER_STAT_KEYS.reduce((sum, key) => sum + stats[key], 0) !== PLAYER_STAT_TOTAL_CAP);
            return stats;
        }

        function applyStatsToInputs(stats) {
            const normalized = normalizePlayerStats(stats);
            PLAYER_STAT_KEYS.forEach(key => {
                const input = document.getElementById(`stat-${key}`);
                if (input) input.value = normalized[key];
            });
            updateStatTotalDisplay();
            return normalized;
        }

        function rollPlayerStats() {
            applyStatsToInputs(rollPlayerStatSetAtCap());
        }

        function respecStats() {
            // ----- 新增的鎖頭防護機制 -----
            let p = scenarioPresets[activePresetId];
            if (p && p.isLocked) {
                alert("🔒 此配置已受玩家保護，無法洗點！請先點擊上方解鎖。");
                return;
            }
            // ------------------------------

            if(confirm("【系統提示：靈魂重鑄】\n\n「命運的絲線又糾纏在一起了嗎...？」\n\n確定要重新洗點嗎？原本被鎖定的基礎六圍將會強制解鎖！")) {
                if (p) {
                    p.statsLocked = false;
                    persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
                }
                const statInputs = document.querySelectorAll('.stat-input');
                statInputs.forEach(input => input.disabled = false);
                document.getElementById('btn-roll-stats').style.display = 'inline-block';
                document.getElementById('btn-respec-stats').style.display = 'none';
            }
        }

        let cropTargetRole = '';
        let pendingGameAvatarTarget = null;
        const CROP_VIEW_SIZE = 250;
        let cropImgObj = document.getElementById('crop-img');
        let cropContainer = document.getElementById('crop-container');
        let scaleSlider = document.getElementById('crop-scale');
        let cropScaleLabel = document.getElementById('crop-scale-label');
        let cropState = {
            isDragging: false, startX: 0, startY: 0, imgX: 0, imgY: 0,
            scale: 1, minScale: 0.1, maxScale: 3,
            pinchDistance: 0, pinchScale: 1
        };

        function triggerCrop(input, role) {
            if (input.files && input.files[0]) {
                cropTargetRole = role;
                const reader = new FileReader();
                reader.onload = (e) => {
                    cropImgObj.src = e.target.result;
                    cropImgObj.onload = () => {
                        const width = cropImgObj.naturalWidth || cropImgObj.width;
                        const height = cropImgObj.naturalHeight || cropImgObj.height;
                        cropImgObj.style.width = `${width}px`;
                        cropImgObj.style.height = `${height}px`;
                        cropImgObj.style.maxWidth = 'none';
                        cropImgObj.style.maxHeight = 'none';
                        const coverScale = Math.max(CROP_VIEW_SIZE / width, CROP_VIEW_SIZE / height);
                        cropState.minScale = Math.max(0.005, coverScale);
                        cropState.maxScale = Math.max(coverScale * 6, cropState.minScale * 2);
                        cropState.scale = coverScale;
                        cropState.imgX = (CROP_VIEW_SIZE - width * cropState.scale) / 2;
                        cropState.imgY = (CROP_VIEW_SIZE - height * cropState.scale) / 2;
                        scaleSlider.min = cropState.minScale;
                        scaleSlider.max = cropState.maxScale;
                        scaleSlider.step = Math.max((cropState.maxScale - cropState.minScale) / 240, 0.0001);
                        scaleSlider.value = cropState.scale;
                        clampCropPosition();
                        updateCropTransform();
                        document.getElementById('crop-modal').style.display = 'flex';
                    };
                };
                reader.readAsDataURL(input.files[0]);
            }
            input.value = '';
        }

        function clampCropScale(value) {
            return Math.min(cropState.maxScale, Math.max(cropState.minScale, value));
        }

        function clampCropPosition() {
            const width = (cropImgObj.naturalWidth || 0) * cropState.scale;
            const height = (cropImgObj.naturalHeight || 0) * cropState.scale;
            if (!width || !height) return;
            cropState.imgX = width <= CROP_VIEW_SIZE
                ? (CROP_VIEW_SIZE - width) / 2
                : Math.min(0, Math.max(CROP_VIEW_SIZE - width, cropState.imgX));
            cropState.imgY = height <= CROP_VIEW_SIZE
                ? (CROP_VIEW_SIZE - height) / 2
                : Math.min(0, Math.max(CROP_VIEW_SIZE - height, cropState.imgY));
        }

        function setCropScale(nextScale, centerX = CROP_VIEW_SIZE / 2, centerY = CROP_VIEW_SIZE / 2) {
            const oldScale = cropState.scale || 1;
            const newScale = clampCropScale(nextScale);
            const imagePointX = (centerX - cropState.imgX) / oldScale;
            const imagePointY = (centerY - cropState.imgY) / oldScale;
            cropState.imgX = centerX - imagePointX * newScale;
            cropState.imgY = centerY - imagePointY * newScale;
            cropState.scale = newScale;
            scaleSlider.value = newScale;
            clampCropPosition();
            updateCropTransform();
        }

        function adjustCropScale(direction) {
            setCropScale(cropState.scale * (direction > 0 ? 1.12 : 1 / 1.12));
        }

        function updateCropTransform() {
            cropImgObj.style.transform = `translate3d(${cropState.imgX}px, ${cropState.imgY}px, 0) scale(${cropState.scale})`;
            const baseScale = Math.max(CROP_VIEW_SIZE / (cropImgObj.naturalWidth || CROP_VIEW_SIZE), CROP_VIEW_SIZE / (cropImgObj.naturalHeight || CROP_VIEW_SIZE));
            cropScaleLabel.textContent = `${Math.round((cropState.scale / baseScale) * 100)}%`;
        }

        scaleSlider.addEventListener('input', (e) => setCropScale(parseFloat(e.target.value)));

        function touchDistance(touches) {
            return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        }

        function handleDragStart(e) {
            e.preventDefault();
            if (e.touches && e.touches.length === 2) {
                cropState.isDragging = false;
                cropState.pinchDistance = touchDistance(e.touches);
                cropState.pinchScale = cropState.scale;
                return;
            }
            cropState.isDragging = true;
            const point = e.touches ? e.touches[0] : e;
            cropState.startX = point.clientX - cropState.imgX;
            cropState.startY = point.clientY - cropState.imgY;
        }

        function handleDragMove(e) {
            if (e.touches && e.touches.length === 2) {
                e.preventDefault();
                const rect = cropContainer.getBoundingClientRect();
                const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left - cropContainer.clientLeft;
                const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top - cropContainer.clientTop;
                setCropScale(cropState.pinchScale * touchDistance(e.touches) / cropState.pinchDistance, centerX, centerY);
                return;
            }
            if (!cropState.isDragging) return;
            e.preventDefault();
            const point = e.touches ? e.touches[0] : e;
            cropState.imgX = point.clientX - cropState.startX;
            cropState.imgY = point.clientY - cropState.startY;
            clampCropPosition();
            updateCropTransform();
        }

        function handleDragEnd(e) {
            cropState.isDragging = false;
            if (e && e.touches && e.touches.length === 1) handleDragStart(e);
        }

        cropContainer.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        cropContainer.addEventListener('touchstart', handleDragStart, {passive: false});
        window.addEventListener('touchmove', handleDragMove, {passive: false});
        window.addEventListener('touchend', handleDragEnd, {passive: false});

        function confirmCrop() {
            const canvas = document.createElement('canvas');
            const size = 300;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const drawRatio = size / CROP_VIEW_SIZE;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.save();
            ctx.scale(drawRatio, drawRatio);
            ctx.translate(cropState.imgX, cropState.imgY);
            ctx.scale(cropState.scale, cropState.scale);
            ctx.drawImage(cropImgObj, 0, 0);
            ctx.restore();
            const finalBase64 = canvas.toDataURL('image/jpeg', 0.82);

            if (cropTargetRole === 'home') {
                document.getElementById('setup-pic').src = finalBase64;
                persistLargeValue('sanko_home_pic', finalBase64, '首頁頭像');
            } else if (cropTargetRole === 'player') {
                document.getElementById('preview-player').src = finalBase64;
            } else if (cropTargetRole.startsWith('npc-')) {
                const idx = cropTargetRole.split('-')[1];
                const targetImg = document.getElementById(`preview-npc-${idx}`);
                if (targetImg) targetImg.src = finalBase64;
            } else if (cropTargetRole === 'game') {
                commitGameAvatar(finalBase64);
            }
            if (cropTargetRole === 'player' || cropTargetRole.startsWith('npc-')) renderDesktopPresetOverview();
            closeCropModal();
        }

        function closeCropModal() {
            document.getElementById('crop-modal').style.display = 'none';
            cropImgObj.onload = null;
            cropImgObj.removeAttribute('src');
            cropImgObj.style.width = '';
            cropImgObj.style.height = '';
            cropImgObj.style.transform = '';
        }



/* ======= 2026-06 desktop export/save menu refinements ======= */
window.journeySelectedSaveIds = window.journeySelectedSaveIds || new Set();

function getJsonClone(value) {
if (typeof clonePersistentValue === 'function') return clonePersistentValue(value);
return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isPrivateOrImageKey(key) {
const normalized = String(key || '').toLowerCase();
return normalized.includes('apikey')
|| normalized === 'api_key'
|| normalized === 'key'
|| normalized.includes('token')
|| normalized.includes('secret')
|| normalized.includes('homepic')
|| normalized.includes('image')
|| normalized.includes('photo')
|| normalized.includes('picture')
|| normalized.includes('pic');
}

function isAvatarKey(key) {
return String(key || '').toLowerCase().includes('avatar');
}

function stripImagesAndPrivateData(value, key = '') {
if (value === null || value === undefined) return value;
if (typeof value === 'string') {
if (/^(data:image|blob:)/i.test(value.trim())) return isAvatarKey(key) ? value : '';
return value;
}
if (Array.isArray(value)) return value.map(item => stripImagesAndPrivateData(item));
if (typeof value === 'object') {
const output = {};
Object.entries(value).forEach(([childKey, childValue]) => {
if (isPrivateOrImageKey(childKey) && !isAvatarKey(childKey)) return;
output[childKey] = stripImagesAndPrivateData(childValue, childKey);
});
return output;
}
return value;
}

function getPresetExportSections() {
const both = document.getElementById('preset-export-both')?.checked;
const characters = both || document.getElementById('preset-export-characters')?.checked;
const scenarios = both || document.getElementById('preset-export-scenarios')?.checked;
return {
characters: characters || (!characters && !scenarios),
scenarios: scenarios || (!characters && !scenarios)
};
}

function filterPresetForSections(preset, sections = { characters: true, scenarios: true }) {
const safePreset = stripImagesAndPrivateData(getJsonClone(preset || {}));
if (!sections.characters) {
delete safePreset.playerAvatar;
delete safePreset.playerName;
delete safePreset.playerDetails;
delete safePreset.playerStats;
delete safePreset.statsLocked;
delete safePreset.npcs;
delete safePreset.targetName;
delete safePreset.targetPersona;
delete safePreset.targetAvatar;
}
if (!sections.scenarios) delete safePreset.scenarios;
return safePreset;
}

function sanitizePresetCollection(presets, sections = { characters: true, scenarios: true }) {
const output = {};
Object.entries(presets || {}).forEach(([id, preset]) => {
output[id] = filterPresetForSections(preset, sections);
});
return output;
}

function sanitizeSavesCollection(saves, ids = null) {
const output = {};
const allowed = ids ? new Set(ids.map(String)) : null;
Object.entries(saves || {}).forEach(([id, save]) => {
if (!allowed || allowed.has(String(id))) output[id] = stripImagesAndPrivateData(getJsonClone(save));
});
return output;
}

function buildBackupPayload(saveIds = null, presetSections = { characters: true, scenarios: true }) {
saveCurrentProgress();
return {
version: 5,
type: 'journey-notes-backup',
exportedAt: new Date().toISOString(),
saves: sanitizeSavesCollection(savesData, saveIds),
scenarioPresets: sanitizePresetCollection(scenarioPresets, presetSections),
activePresetId,
uiTheme: stripImagesAndPrivateData(getJsonClone(uiTheme)),
uiLanguage: window.getUiLanguage ? getUiLanguage() : 'zh-TW',
privacy: {
excludes: ['apiKeys', 'homePhoto', 'privateTokens']
}
};
}

function downloadJsonFile(payload, filename) {
const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
}

function goHomeFromSetupNav() {
restoreSaveMenuFromSetupHome();
restoreJournalFromSetupHome();
const setupScreen = document.getElementById('setup-screen');
if (setupScreen) setupScreen.style.display = 'flex';
document.getElementById('save-menu-screen').style.display = 'none';
document.getElementById('journal-screen').style.display = 'none';
showHomeInfoView('main', { force: true });
}

function getSelectedSaveIds() {
return Array.from(window.journeySelectedSaveIds || []).filter(id => savesData[id]);
}

function updateSaveSelectAllState() {
const selectAll = document.getElementById('save-select-all');
if (!selectAll) return;
const ids = Object.keys(savesData || {});
const selected = getSelectedSaveIds();
selectAll.checked = ids.length > 0 && selected.length === ids.length;
selectAll.indeterminate = selected.length > 0 && selected.length < ids.length;
}

function toggleSaveSelection(id, checked) {
if (checked) window.journeySelectedSaveIds.add(String(id));
else window.journeySelectedSaveIds.delete(String(id));
updateSaveSelectAllState();
}

function toggleAllSaveSelection(checked) {
window.journeySelectedSaveIds.clear();
if (checked) Object.keys(savesData || {}).forEach(id => window.journeySelectedSaveIds.add(String(id)));
renderSaveList();
}

function renameSaveTitle(id, value) {
const save = savesData[id];
if (!save) return;
const nextTitle = valueToText(value, '未命名存檔').trim() || '未命名存檔';
save.title = nextTitle;
if (!persistSingleSave(id, '重新命名遊戲存檔')) renderSaveList();
}

function deleteSelectedSaves() {
const ids = getSelectedSaveIds();
if (!ids.length) {
alert(uiText('請先勾選要刪除的記憶紀錄。'));
return;
}
if (!confirm(uiText('確定要刪除 {count} 個記憶紀錄嗎？此操作無法復原。').replace('{count}', ids.length))) return;
ids.forEach(id => {
const removedSave = savesData[id];
delete savesData[id];
if (!removePersistedSave(id, '刪除遊戲存檔')) savesData[id] = removedSave;
localStorage.removeItem(getInputDraftStorageKey(id));
if (currentSaveId === id) currentSaveId = null;
window.journeySelectedSaveIds.delete(String(id));
});
renderSaveList();
}


function getUniquePresetId(baseId = 'preset_imported') {
let candidate = String(baseId || `preset_imported_${Date.now()}`).replace(/[^\w-]+/g, '_');
if (!candidate || candidate === 'default') candidate = `preset_imported_${Date.now()}`;
if (!scenarioPresets[candidate]) return candidate;
let counter = 1;
while (scenarioPresets[`${candidate}_${counter}`]) counter += 1;
return `${candidate}_${counter}`;
}

function normalizeImportedPreset(rawPreset, sections = { characters: true, scenarios: true }) {
const base = stripImagesAndPrivateData(getJsonClone(scenarioPresets[activePresetId] || defaultPreset || {}));
const incoming = stripImagesAndPrivateData(getJsonClone(rawPreset || {}));
const output = { ...base, ...incoming };
if (!sections.characters) {
output.playerName = base.playerName || '';
output.playerDetails = base.playerDetails || {};
output.playerStats = base.playerStats || {};
output.npcs = base.npcs || [];
}
if (!sections.scenarios) output.scenarios = base.scenarios || [{ name: '主情境', lore: '', npcRoles: '', playerRole: '', transitionRule: '' }];
output.id = getUniquePresetId(incoming.id || `preset_imported_${Date.now()}`);
output.presetName = valueToText(incoming.presetName || output.presetName, '匯入配置');
output.isLocked = false;
return output;
}

function importPresetConfig(input) {
const file = input.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = event => {
try {
const importedData = JSON.parse(event.target.result);
const importedPresets = importedData.type === 'journey-notes-preset'
? { imported: importedData.preset }
: (importedData.scenarioPresets || importedData.presets || {});
const sections = importedData.exportSections || { characters: true, scenarios: true };
let count = 0;
Object.values(importedPresets || {}).forEach(rawPreset => {
if (!rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) return;
const preset = normalizeImportedPreset(rawPreset, sections);
scenarioPresets[preset.id] = preset;
activePresetId = preset.id;
count += 1;
});
if (!count) throw new Error('沒有找到可匯入的配置。');
persistJson('sanko_scenario_presets_v2', scenarioPresets, '匯入角色配置');
localStorage.setItem('sanko_active_preset_id', activePresetId);
currentScenario = getJsonClone(scenarioPresets[activePresetId]);
renderPresetSelector();
loadPresetToForm(activePresetId);
renderDesktopPresetOverview();
alert(`匯入完成：${count} 個配置。圖片與私密資料已略過。`);
} catch (error) {
alert(`匯入配置失敗：${error.message || '檔案格式不正確或已損毀。'}`);
} finally {
input.value = '';
}
};
reader.readAsText(file);
}

        const LANGUAGE_MODE_LABELS = {
            "zh-tw": "繁體中文",
            "en": "English",
            "ja": "日本語",
            "ja-zh": "日文台詞 + 繁中翻譯",
            "en-zh": "英文台詞 + 繁中翻譯",
            "auto": "自動依玩家語言"
        };

        function getLanguageInstruction(mode) {
            const selected = mode || currentScenario.languageMode || "zh-tw";
            const common = "【最高優先語言規則】無論角色設定、範例、過往對話使用何種語言，都必須遵守本段。所有玩家看得到的 narrative、每一位 NPC 的 dialogues[].text、options[].text 都必須使用指定語言；角色姓名與專有名詞可保留原文。JSON 欄位名稱仍使用英文鍵名。不得因 NPC 人設以中文撰寫，就讓 NPC 繼續使用中文。";
            const rules = {
                "zh-tw": "輸出語言：繁體中文。旁白、NPC 台詞、選項、系統訊息一律使用自然繁體中文。可少量使用外語稱呼或專有名詞，但不要讓玩家必須讀外語才能理解。",
                "en": "Output language: English. Write ALL narration, EVERY NPC line, every option, and system-facing text in natural English. Chinese or Japanese may appear only inside character names or proper nouns; never output Chinese NPC dialogue.",
                "ja": "出力言語：日本語。地の文、すべてのNPCの台詞、選択肢、システム向け文言を自然な日本語で書く。中国語の人物設定をそのまま台詞にコピーしない。JSON keys remain in English.",
                "ja-zh": "輸出模式：日文台詞 + 繁中翻譯。旁白、選項、系統訊息一律使用繁體中文。NPC 可以使用自然日文台詞，但每段日文台詞後必須立刻附上繁體中文文學翻譯，格式例如：NPC：「日本語の台詞」\\n（中文譯：繁體中文翻譯）。玩家若使用中文，NPC 不得只用日文回覆而沒有翻譯。",
                "en-zh": "輸出模式：英文台詞 + 繁中翻譯。旁白、選項、系統訊息一律使用繁體中文。NPC 可以使用自然英文台詞，但每段英文台詞後必須立刻附上繁體中文文學翻譯，格式例如：NPC: \"English line.\"\\n（中文譯：繁體中文翻譯）。玩家若使用中文，NPC 不得只用英文回覆而沒有翻譯。",
                "auto": "輸出語言：自動依玩家最近輸入語言。若玩家使用繁體中文，旁白、選項與必要說明使用繁體中文；若 NPC 使用外語台詞，必須附繁體中文翻譯。"
            };
            return `${common}\n${rules[selected] || rules["zh-tw"]}`;
        }

        function setLanguageModeControls(mode) {
            const nextMode = mode || "zh-tw";
            const editSelect = document.getElementById('input-language-mode');
            const modalSelect = document.getElementById('modal-language-mode');
            if (editSelect && editSelect.value !== nextMode) editSelect.value = nextMode;
            if (modalSelect && modalSelect.value !== nextMode) modalSelect.value = nextMode;
            return nextMode;
        }

        function syncPresetLanguageMode(mode) {
            const nextMode = setLanguageModeControls(mode);
            if (activePresetId && scenarioPresets[activePresetId]) {
                const previousMode = scenarioPresets[activePresetId].languageMode || 'zh-tw';
                scenarioPresets[activePresetId].languageMode = nextMode;
                if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                    scenarioPresets[activePresetId].languageMode = previousMode;
                    setLanguageModeControls(previousMode);
                }
            }
        }

        function syncGameLanguageMode(mode) {
            const nextMode = setLanguageModeControls(mode);
            if (!currentSaveId || !currentScenario || !savesData[currentSaveId]) return;
            const previousMode = currentScenario.languageMode || 'zh-tw';
            currentScenario.languageMode = nextMode;
            if (!saveCurrentProgress()) {
                currentScenario.languageMode = previousMode;
                setLanguageModeControls(previousMode);
            }
        }

        function getTodayKey() { return new Date().toISOString().slice(0, 10); }
        function getMonthKey() { return new Date().toISOString().slice(0, 7); }
        async function loadApiUsageStats() {
            const storedStats = await readPersistentValue('sanko_api_usage_stats_v1', {});
            return storedStats && typeof storedStats === 'object' && !Array.isArray(storedStats) ? storedStats : {};
        }
        function saveApiUsageStats() {
            return persistJson('sanko_api_usage_stats_v1', apiUsageStats, 'API 使用統計');
        }
        function ensureApiUsageBucket() {
            const today = getTodayKey();
            const month = getMonthKey();
            if (!apiUsageStats.totals) apiUsageStats.totals = { requests: 0, repairRequests: 0 };
            if (!apiUsageStats.days) apiUsageStats.days = {};
            if (!apiUsageStats.months) apiUsageStats.months = {};
            if (!apiUsageStats.models) apiUsageStats.models = {};
            if (!apiUsageStats.days[today]) apiUsageStats.days[today] = { requests: 0, repairRequests: 0 };
            if (!apiUsageStats.months[month]) apiUsageStats.months[month] = { requests: 0, repairRequests: 0 };
            return { today, month };
        }

        function getModelUsageKey(provider = apiProvider, model = selectedModel) {
            return `${provider || 'unknown'}::${model || '未選擇模型'}`;
        }

        function getModelDisplayName(modelId = selectedModel) {
            const id = modelId || '未選擇模型';
            const options = Array.from(document.getElementById('game-model-choice')?.options || []);
            const matched = options.find(opt => opt.value === id);
            return matched ? matched.textContent.replace(/^★\s*/, '') : id;
        }
        function trackApiRequest(kind = "normal") {
            const { today, month } = ensureApiUsageBucket();
            const provider = apiProvider || 'unknown';
            const model = selectedModel || '未選擇模型';
            const modelKey = getModelUsageKey(provider, model);
            if (!apiUsageStats.models[modelKey]) {
                apiUsageStats.models[modelKey] = {
                    provider,
                    model,
                    displayName: getModelDisplayName(model),
                    requests: 0,
                    repairRequests: 0,
                    lastUsedAt: ''
                };
            }
            apiUsageStats.totals.requests += 1;
            apiUsageStats.days[today].requests += 1;
            apiUsageStats.months[month].requests += 1;
            apiUsageStats.models[modelKey].requests += 1;
            apiUsageStats.models[modelKey].lastUsedAt = new Date().toLocaleString();
            if (kind === "repair") {
                apiUsageStats.totals.repairRequests += 1;
                apiUsageStats.days[today].repairRequests += 1;
                apiUsageStats.months[month].repairRequests += 1;
                apiUsageStats.models[modelKey].repairRequests += 1;
            }
            apiUsageStats.lastUsedAt = new Date().toLocaleString();
            apiUsageStats.lastProvider = provider;
            apiUsageStats.lastModel = model;
            saveApiUsageStats();
            renderApiUsageStats();
        }

        function escapeStatusHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, ch => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[ch]));
        }

        function uiText(value) {
            return window.uiMessage ? window.uiMessage(value) : value;
        }

        function uiLocale() {
            return window.getUiLanguage ? getUiLanguage() : 'zh-TW';
        }

        function uiCharacterName(value, fallback = '新角色') {
            const text = valueToText(value, fallback);
            return text === '新角色' ? uiText('新角色') : text;
        }

        function uiJournalEntryText(value) {
            const text = valueToText(value);
            return text === '故事剛開始，目前尚無重大事件發生。'
                ? uiText('故事剛開始，目前尚無重大事件發生。')
                : text;
        }

        function normalizeSurvivalValue(value, fallback = 100) {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : fallback;
        }

        function parseNumericDelta(value) {
            if (value === null || value === undefined || value === '') return 0;
            const parsed = Number(value);
            return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
        }

        function applySurvivalDelta(currentValue, deltaValue) {
            const current = normalizeSurvivalValue(currentValue, 100);
            return normalizeSurvivalValue(current + parseNumericDelta(deltaValue), current);
        }

        function stripMemoryListPrefix(value) {
            return valueToText(value)
                .replace(/^\s*(?:(?:[-•*・▪◦])|(?:\d+[.)、]))\s*/, '')
                .trim();
        }

        function normalizeAdventureLogKey(line) {
            return stripMemoryListPrefix(line)
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();
        }

        function splitAdventureLog(value) {
            const source = Array.isArray(value) ? value : valueToText(value).split(/\n+/);
            return source.map(stripMemoryListPrefix).filter(Boolean);
        }

        function formatBulletListText(value, fallback = '', dedupe = false) {
            const seen = new Set();
            const lines = [];
            splitAdventureLog(value).forEach(line => {
                const key = normalizeAdventureLogKey(line);
                if (!key || (dedupe && seen.has(key))) return;
                seen.add(key);
                lines.push(`• ${line}`);
            });
            return lines.join('\n') || fallback;
        }

        function normalizeMemoryTextarea(textarea) {
            if (!textarea) return;
            const fallback = textarea.id === 'ui-adventure-log' ? '• 故事剛開始，目前尚無重大事件發生。' : '';
            textarea.value = formatBulletListText(textarea.value, fallback, textarea.id !== 'ui-adventure-log');
            autoResize(textarea);
        }

function mergeAdventureLog(existingLog, incomingLog) {
const merged = splitAdventureLog(existingLog);
const seen = new Set(merged.map(normalizeAdventureLogKey).filter(Boolean));
splitAdventureLog(incomingLog).forEach(line => {
                const key = normalizeAdventureLogKey(line);
                if (!key || seen.has(key)) return;
                seen.add(key);
                merged.push(line);
});
return formatBulletListText(merged, '• 故事剛開始，目前尚無重大事件發生。');
}

function appendTaskJournalEntry(status, taskText, reason = '') {
const text = normalizeTaskText(taskText);
if (!text) return false;
const label = status === 'failed' ? '任務失敗' : '任務完成';
const detail = reason ? `（${truncatePromptText(reason, 80)}）` : '';
currentAdventureLog = mergeAdventureLog(currentAdventureLog, `${label}：${text}${detail}`);
return true;
}

function normalizeTaskText(value) {
return stripMemoryListPrefix(valueToText(value)
.replace(/^\s*(?:☑|✅|✔|✓|☒|✗|✘|❌|☐|⬜|□|\[[xX!?\- ]\])\s*/, '')
.replace(/^\s*(?:完成|已完成|失敗|已失敗|任務完成|任務失敗)[：:]\s*/, ''));
}

        function normalizeTaskKey(value) {
            return normalizeTaskText(value).replace(/[\s，。！？、；：,.!?;:「」『』]/g, '').toLowerCase();
        }

        function parseTaskChecklist(value) {
            const source = Array.isArray(value) ? value : valueToText(value).split(/\n+/);
            const tasks = [];
            const seen = new Map();
            source.forEach(entry => {
                const objectEntry = entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : null;
                const raw = objectEntry ? valueToText(objectEntry.text || objectEntry.task || objectEntry.title) : valueToText(entry);
                const text = normalizeTaskText(raw);
                if (!text) return;
const done = objectEntry
? Boolean(objectEntry.done || ['done', 'completed', 'complete'].includes(valueToText(objectEntry.status).toLowerCase()))
: /^\s*(?:☑|✅|✔|✓|\[[xX]\])/.test(raw);
const failed = objectEntry
? Boolean(objectEntry.failed || ['failed', 'fail', 'lost', 'dead', 'impossible'].includes(valueToText(objectEntry.status).toLowerCase()))
: /^\s*(?:☒|✗|✘|❌|\[[!?\-]\])/.test(raw) || /^\s*(?:失敗|已失敗|任務失敗)[：:]/.test(raw);
const key = normalizeTaskKey(text);
if (!key) return;
if (seen.has(key)) {
const existing = tasks[seen.get(key)];
if (done) existing.done = true;
if (failed) { existing.failed = true; existing.done = false; }
return;
}
seen.set(key, tasks.length);
tasks.push({ text, done: failed ? false : done, failed });
});
return tasks;
}

function serializeTaskChecklist(tasks) {
return parseTaskChecklist(tasks).map(task => `${task.failed ? '☒' : task.done ? '☑' : '☐'} ${task.text}`).join('\n');
}

function readTaskChecklistFromDom() {
const container = document.getElementById('ui-open-tasks');
if (!container || container.dataset.rendered !== 'true') return parseTaskChecklist(currentOpenTasks);
return Array.from(container.querySelectorAll('.memory-task-row')).map(row => ({
done: Boolean(row.querySelector('.memory-task-check')?.checked),
failed: row.dataset.taskStatus === 'failed',
text: normalizeTaskText(row.querySelector('.memory-task-text')?.value)
})).filter(task => task.text);
}

function recordTaskStatusTransitions(previousTasks, nextTasks, reason = '') {
const previousByKey = new Map(parseTaskChecklist(previousTasks).map(task => [normalizeTaskKey(task.text), task]));
let changed = false;
            parseTaskChecklist(nextTasks).forEach(task => {
                const key = normalizeTaskKey(task.text);
                if (!key) return;
                const previous = previousByKey.get(key);
                const wasDone = Boolean(previous?.done);
                const wasFailed = Boolean(previous?.failed);
                if (task.done && !wasDone) changed = appendTaskJournalEntry('done', task.text, reason) || changed;
                if (task.failed && !wasFailed) changed = appendTaskJournalEntry('failed', task.text, reason) || changed;
            });
return changed;
}

function failTasksRelatedToNpcEvents(events) {
const names = (Array.isArray(events) ? events : [])
.map(event => valueToText(event).match(/^(.+?)\s*已死亡/)?.[1]?.trim())
.filter(Boolean);
if (!names.length) return false;
const tasks = parseTaskChecklist(currentOpenTasks);
const previousTasks = parseTaskChecklist(tasks);
let changed = false;
tasks.forEach(task => {
if (task.done || task.failed) return;
const matchedName = names.find(name => name && task.text.includes(name));
if (!matchedName) return;
task.failed = true;
task.done = false;
changed = true;
});
if (!changed) return false;
recordTaskStatusTransitions(previousTasks, tasks, '相關角色死亡或離場');
currentOpenTasks = serializeTaskChecklist(tasks);
renderTaskChecklist(currentOpenTasks);
return true;
}

function renderTaskChecklist(value = currentOpenTasks) {
            const container = document.getElementById('ui-open-tasks');
            if (!container) return;
            const tasks = parseTaskChecklist(value);
            currentOpenTasks = serializeTaskChecklist(tasks);
            container.dataset.rendered = 'true';
            if (!tasks.length) {
                container.innerHTML = '<p class="memory-task-empty">目前沒有任務。接到新委託時，會自動加在這裡。</p>';
                return;
            }
container.innerHTML = tasks.map((task, index) => `
<div class="memory-task-row ${task.done ? 'done' : ''} ${task.failed ? 'failed' : ''}" data-task-index="${index}" data-task-status="${task.failed ? 'failed' : task.done ? 'done' : 'open'}">
<input class="memory-task-check" type="checkbox" aria-label="完成任務：${escapeStatusHtml(task.text)}" ${task.done ? 'checked' : ''} onchange="setMemoryTaskStatus(${index}, this.checked ? 'done' : 'open')">
<input class="memory-task-text" type="text" value="${escapeStatusHtml(task.text)}" aria-label="任務內容" onchange="handleMemoryTaskChange()">
<button class="memory-task-fail" type="button" aria-label="標記任務失敗" title="標記任務失敗" onclick="setMemoryTaskStatus(${index}, '${task.failed ? 'open' : 'failed'}')">!</button>
<button class="memory-task-remove" type="button" aria-label="刪除任務" onclick="removeMemoryTask(${index})">×</button>
</div>`).join('');
}

function handleMemoryTaskChange() {
const previousTasks = parseTaskChecklist(currentOpenTasks);
const nextTasks = readTaskChecklistFromDom();
recordTaskStatusTransitions(previousTasks, nextTasks);
currentOpenTasks = serializeTaskChecklist(nextTasks);
renderTaskChecklist(currentOpenTasks);
saveCurrentProgress();
}

function setMemoryTaskStatus(index, status) {
const tasks = readTaskChecklistFromDom();
if (index < 0 || index >= tasks.length) return;
const previousTasks = parseTaskChecklist(currentOpenTasks);
tasks[index].done = status === 'done';
tasks[index].failed = status === 'failed';
recordTaskStatusTransitions(previousTasks, tasks);
currentOpenTasks = serializeTaskChecklist(tasks);
renderTaskChecklist(currentOpenTasks);
saveCurrentProgress();
}

        function addMemoryTaskFromInput() {
            const input = document.getElementById('ui-new-memory-task');
            const text = normalizeTaskText(input?.value);
            if (!text) return;
            const tasks = readTaskChecklistFromDom();
            if (!tasks.some(task => normalizeTaskKey(task.text) === normalizeTaskKey(text))) tasks.push({ text, done: false });
            currentOpenTasks = serializeTaskChecklist(tasks);
            if (input) input.value = '';
            renderTaskChecklist(currentOpenTasks);
            saveCurrentProgress();
        }

        function removeMemoryTask(index) {
            const tasks = readTaskChecklistFromDom();
            if (index < 0 || index >= tasks.length) return;
            tasks.splice(index, 1);
            currentOpenTasks = serializeTaskChecklist(tasks);
            renderTaskChecklist(currentOpenTasks);
            saveCurrentProgress();
        }

        function findMemoryTaskIndex(tasks, targetText) {
            const targetKey = normalizeTaskKey(targetText);
            if (!targetKey) return -1;
            const exactIndex = tasks.findIndex(task => normalizeTaskKey(task.text) === targetKey);
            if (exactIndex >= 0) return exactIndex;
            if (targetKey.length < 4) return -1;
            return tasks.findIndex(task => {
                const taskKey = normalizeTaskKey(task.text);
                return taskKey.length >= 4 && (taskKey.includes(targetKey) || targetKey.includes(taskKey));
            });
        }

        function applyTaskUpdates(updates) {
            if (!Array.isArray(updates) || !updates.length) return false;
const tasks = parseTaskChecklist(currentOpenTasks);
const previousTasks = parseTaskChecklist(tasks);
let changed = false;
            updates.forEach(update => {
                if (!update || typeof update !== 'object') return;
                const text = normalizeTaskText(update.text || update.task || update.title);
                const action = valueToText(update.action || update.status).trim().toLowerCase();
                if (!text || !action) return;
                const index = findMemoryTaskIndex(tasks, text);
                if (['add', 'new', 'open'].includes(action)) {
if (index < 0) { tasks.push({ text, done: false, failed: false }); changed = true; }
else if ((tasks[index].done || tasks[index].failed) && action === 'open') { tasks[index].done = false; tasks[index].failed = false; changed = true; }
                } else if (['done', 'complete', 'completed', 'finish', 'finished'].includes(action)) {
if (index >= 0 && (!tasks[index].done || tasks[index].failed)) { tasks[index].done = true; tasks[index].failed = false; changed = true; }
} else if (['fail', 'failed', 'failure', 'lost', 'dead', 'impossible', 'cancelled', 'canceled'].includes(action)) {
if (index >= 0 && !tasks[index].failed) { tasks[index].failed = true; tasks[index].done = false; changed = true; }
} else if (['reopen', 'undo'].includes(action)) {
if (index >= 0 && (tasks[index].done || tasks[index].failed)) { tasks[index].done = false; tasks[index].failed = false; changed = true; }
                } else if (['remove', 'delete'].includes(action) && index >= 0) {
                    tasks.splice(index, 1); changed = true;
                }
            });
if (changed) {
recordTaskStatusTransitions(previousTasks, tasks);
currentOpenTasks = serializeTaskChecklist(tasks);
                renderTaskChecklist(currentOpenTasks);
            }
            return changed;
        }

        function normalizeSummaryPayload(value, maxItems = 12, maxItemChars = MAX_SUMMARY_ITEM_CHARS) {
            const source = Array.isArray(value) ? value : valueToText(value).split(/\n+/);
            const seen = new Set();
            const items = [];
            source.forEach(entry => {
                const text = truncatePromptText(stripMemoryListPrefix(entry), maxItemChars);
                const key = normalizeAdventureLogKey(text);
                if (!key || seen.has(key)) return;
                seen.add(key);
                items.push(text);
            });
            return items.slice(0, maxItems);
        }

        function applyAutomaticMemoryUpdate(update) {
            if (!update || typeof update !== 'object' || Array.isArray(update)) return false;
            let changed = false;
            const storyItems = normalizeSummaryPayload(update.story_summary ?? update.story, 8, MAX_SUMMARY_ITEM_CHARS);
            if (storyItems.length) {
                const existingStory = normalizeSummaryPayload(currentStorySummary, 8, MAX_SUMMARY_ITEM_CHARS);
                const combinedStory = normalizeSummaryPayload([...existingStory, ...storyItems], 20, MAX_SUMMARY_ITEM_CHARS);
                const retainedStory = combinedStory.length > 8
                    ? [...combinedStory.slice(0, 3), ...combinedStory.slice(-5)]
                    : combinedStory;
                const nextStory = formatBulletListText(retainedStory, '', true);
                if (nextStory !== currentStorySummary) { currentStorySummary = nextStory; changed = true; }
            }
            const relationshipItems = normalizeSummaryPayload(update.relationship_summary ?? update.relationships, 10, MAX_RELATIONSHIP_ITEM_CHARS);
            if (relationshipItems.length) {
                const existingRelationships = normalizeSummaryPayload(currentRelationshipSummary, 10, MAX_RELATIONSHIP_ITEM_CHARS);
                const combinedRelationships = normalizeSummaryPayload([...existingRelationships, ...relationshipItems], 20, MAX_RELATIONSHIP_ITEM_CHARS);
                const retainedRelationships = combinedRelationships.length > 10
                    ? [...combinedRelationships.slice(0, 3), ...combinedRelationships.slice(-7)]
                    : combinedRelationships;
                const nextRelationships = formatBulletListText(retainedRelationships, '', true);
                if (nextRelationships !== currentRelationshipSummary) { currentRelationshipSummary = nextRelationships; changed = true; }
            }
            if (applyTaskUpdates(update.task_updates)) changed = true;
            const storyField = document.getElementById('ui-story-summary');
            const relationshipField = document.getElementById('ui-relationship-summary');
            if (storyField) { storyField.value = currentStorySummary; autoResize(storyField); }
            if (relationshipField) { relationshipField.value = currentRelationshipSummary; autoResize(relationshipField); }
            return changed;
        }

        function getAdventureLogForPrompt(log = currentAdventureLog) {
            const text = valueToText(log, '尚無重大事件。');
            if (text.length <= MAX_ADVENTURE_LOG_PROMPT_CHARS) return text;
            const headLength = 1400;
            const tailLength = MAX_ADVENTURE_LOG_PROMPT_CHARS - headLength - 80;
            return `${text.slice(0, headLength)}\n（中段較舊紀錄僅保留於本機面板）\n${text.slice(-tailLength)}`;
        }

        function getRecentAdventureLogForPrompt(log = currentAdventureLog, maxChars = 1800) {
            const text = valueToText(log, '尚無重大事件。').trim();
            if (text.length <= maxChars) return text;
            return `（完整冒險紀錄已保留於本機面板；以下只截取最近片段）\n${text.slice(-maxChars)}`;
        }

        function hasMemoryBrief() {
            return [currentStorySummary, currentOpenTasks, currentRelationshipSummary].some(value => valueToText(value).trim());
        }

        function getRecentAdventureFacts(log = currentAdventureLog, maxItems = 6, maxChars = 900) {
            const entries = splitAdventureLog(log).slice(-maxItems);
            const text = entries.map(entry => `• ${truncatePromptText(entry, 150)}`).join('\n');
            return truncatePromptText(text, maxChars) || '尚無可用的重大事件摘要。';
        }

        function getMemoryBriefForPrompt() {
            const storyItems = normalizeSummaryPayload(currentStorySummary, 8, MAX_SUMMARY_ITEM_CHARS);
            const relationshipItems = normalizeSummaryPayload(currentRelationshipSummary, 8, MAX_RELATIONSHIP_ITEM_CHARS);
            const allTasks = parseTaskChecklist(currentOpenTasks);
            const openTasks = allTasks.filter(task => !task.done && !task.failed).slice(0, 12);
            const completedTasks = allTasks.filter(task => task.done).slice(-4);
            const failedTasks = allTasks.filter(task => task.failed).slice(-4);
            const taskText = [...openTasks, ...completedTasks, ...failedTasks]
                .map(task => `${task.failed ? '☒' : task.done ? '☑' : '☐'} ${truncatePromptText(task.text, 120)}`)
                .join('\n');
            const storyText = storyItems.length
                ? storyItems.map(item => `• ${item}`).join('\n')
                : getRecentAdventureFacts();
            return `【目前劇情重點】\n${storyText}\n\n【任務】\n${taskText || '目前沒有任務。'}\n\n【整體角色關係】\n${relationshipItems.length ? relationshipItems.map(item => `• ${item}`).join('\n') : '尚無需要長期保留的關係變化。'}\n\n以上皆為既定狀態；不要把已發生或已完成的內容重新當成新事件。完整冒險日誌只保存在本機，本回合未傳送。`;
        }

        function resizeMemoryTextareas() {
            ['ui-story-summary', 'ui-relationship-summary'].forEach(id => {
                const el = document.getElementById(id);
                if (el) autoResize(el);
            });
        }

        function persistJson(storageKey, data, label = '資料') {
            if (storageKey === 'sanko_saves_v8') return persistAllSaves(label);
            if (indexedDatabaseReady && isIndexedStorageKey(storageKey)) return queueIndexedWrite(storageKey, data, label);
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                storageWarningShown = false;
                return true;
            } catch (error) {
                handleIndexedWriteError(label, error);
                return false;
            }
        }


        function createEmptyDynamicState() {
            return { mood: '', condition: '', relationship: '', goal: '', memoryNotes: [], isDead: false, deathCause: '', diedAt: '', revivedAt: '', reviveAttempted: false, reviveLocked: false, reviveFailureReason: '', reviveAttemptedAt: '', lastReason: '', updatedAt: '' };
        }

        function createPresetSnapshotFromScenario(sourceScenario, baselinePreset = null) {
            const snapshot = clonePersistentValue(sourceScenario || defaultPreset);
            const baselineNpcs = Array.isArray(baselinePreset?.npcs) ? baselinePreset.npcs : [];
            delete snapshot.playerDynamic;
            delete snapshot.sourcePresetId;
            if (!Array.isArray(snapshot.npcs)) snapshot.npcs = [];
            if (Array.isArray(snapshot.scenarios)) {
                snapshot.scenarios.forEach(scene => { delete scene.runtimePlayerPresence; delete scene.runtimeGuideRole; });
            }
            snapshot.npcs = snapshot.npcs.map(npc => {
                const cleanNpc = clonePersistentValue(npc);
                delete cleanNpc.dynamic;
                if (baselinePreset) {
                    const baselineNpc = baselineNpcs.find(item =>
                        (item.id && cleanNpc.id && item.id === cleanNpc.id)
                        || (item.name && cleanNpc.name && item.name === cleanNpc.name)
                    );
                    if (baselineNpc && baselineNpc.affection !== undefined) cleanNpc.affection = baselineNpc.affection;
                }
                return cleanNpc;
            });
            return snapshot;
        }

        function createFreshScenarioFromPreset(preset) {
            const fresh = createPresetSnapshotFromScenario(preset || defaultPreset);
            fresh.playerDynamic = createEmptyDynamicState();
            fresh.npcs.forEach(npc => { npc.dynamic = createEmptyDynamicState(); });
            fresh.memoryNotesPaused = false;
            return fresh;
        }

        function normalizeMemoryNotes(value) {
            const rawEntries = Array.isArray(value)
                ? value
                : valueToText(value).split(/\n+/);
            const notes = [];
            rawEntries.forEach(entry => {
                const clean = valueToText(entry).replace(/^\s*[-•*]\s*/, '').trim();
                if (clean && !notes.includes(clean)) notes.push(clean);
            });
            return notes;
        }

        function normalizeMemoryNoteKey(value) {
            return valueToText(value)
                .toLowerCase()
                .replace(/[\s\p{P}\p{S}]/gu, '')
                .replace(/(?:目前|此刻|現在|已經|曾經|對玩家|與玩家|將會|會|要|的)/g, '');
        }

        function areMemoryNotesSimilar(left, right) {
            const a = normalizeMemoryNoteKey(left);
            const b = normalizeMemoryNoteKey(right);
            if (!a || !b) return false;
            if (a === b) return true;
            if (Math.min(a.length, b.length) >= 6 && (a.includes(b) || b.includes(a))) return true;
            const makePairs = text => {
                const pairs = new Set();
                for (let index = 0; index < text.length - 1; index += 1) pairs.add(text.slice(index, index + 2));
                return pairs;
            };
            const aPairs = makePairs(a);
            const bPairs = makePairs(b);
            if (!aPairs.size || !bPairs.size) return false;
            let overlap = 0;
            aPairs.forEach(pair => { if (bPairs.has(pair)) overlap += 1; });
            return overlap / Math.max(aPairs.size, bPairs.size) >= 0.72;
        }

        function truncatePromptText(value, maxChars) {
            const text = valueToText(value).trim();
            if (text.length <= maxChars) return text;
            return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
        }

        function normalizeDynamicState(state) {
            const source = state && typeof state === 'object' ? state : {};
            return {
                mood: valueToText(source.mood),
                condition: valueToText(source.condition),
                relationship: valueToText(source.relationship),
                goal: valueToText(source.goal),
                memoryNotes: normalizeMemoryNotes(source.memoryNotes ?? source.recentChange ?? source.development),
                isDead: source.isDead === true,
                deathCause: valueToText(source.deathCause),
                diedAt: valueToText(source.diedAt),
                revivedAt: valueToText(source.revivedAt),
                reviveAttempted: source.reviveAttempted === true,
                reviveLocked: source.reviveLocked === true,
                reviveFailureReason: valueToText(source.reviveFailureReason),
                reviveAttemptedAt: valueToText(source.reviveAttemptedAt),
                lastReason: valueToText(source.lastReason),
                updatedAt: valueToText(source.updatedAt)
            };
        }

        function getDynamicStatePreview(state) {
            const dynamic = normalizeDynamicState(state);
            if (dynamic.isDead) return `已死亡${dynamic.deathCause ? `：${dynamic.deathCause}` : ''}`;
            return [dynamic.mood, dynamic.condition].filter(Boolean).join(' · ');
        }

        function isNpcDead(npc) {
            return normalizeDynamicState(npc?.dynamic).isDead === true;
        }

        function isPermanentNpcDeathMode() {
            return normalizeGameDifficulty(currentScenario?.gameDifficulty) === 'nightmare';
        }

        function isNpcRevivePermanentlyLocked(npc) {
            return isPermanentNpcDeathMode() || normalizeDynamicState(npc?.dynamic).reviveLocked === true;
        }

        function markNpcDead(npc, cause = '') {
            if (!npc) return false;
            const dynamic = normalizeDynamicState(npc.dynamic);
            if (dynamic.isDead) return false;
            dynamic.isDead = true;
            dynamic.deathCause = truncatePromptText(cause, 120) || '劇情已明確確認死亡';
            dynamic.diedAt = new Date().toLocaleString();
            dynamic.revivedAt = '';
            dynamic.reviveAttempted = false;
            dynamic.reviveLocked = false;
            dynamic.reviveFailureReason = '';
            dynamic.reviveAttemptedAt = '';
            dynamic.mood = '';
            dynamic.goal = '';
            dynamic.condition = '已死亡';
            dynamic.lastReason = `死亡：${dynamic.deathCause}`;
            dynamic.updatedAt = dynamic.diedAt;
            npc.dynamic = dynamic;
            return true;
        }

        function reviveNpc(npc, reason = '', { allowHardSuccess = false } = {}) {
            if (!npc || !isNpcDead(npc) || isNpcRevivePermanentlyLocked(npc)) return false;
            const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            if (difficulty === 'hard' && !allowHardSuccess) return false;
            const dynamic = normalizeDynamicState(npc.dynamic);
            dynamic.isDead = false;
            dynamic.revivedAt = new Date().toLocaleString();
            dynamic.condition = '';
            dynamic.deathCause = '';
            dynamic.reviveAttempted = difficulty === 'hard';
            dynamic.reviveLocked = false;
            dynamic.reviveFailureReason = '';
            dynamic.reviveAttemptedAt = difficulty === 'hard' ? new Date().toLocaleString() : dynamic.reviveAttemptedAt;
            dynamic.lastReason = `恢復存活${reason ? `：${truncatePromptText(reason, 100)}` : ''}`;
            dynamic.updatedAt = dynamic.revivedAt;
            npc.dynamic = dynamic;
            return true;
        }

        function lockFailedNpcRevival(npc, reason = '') {
            if (!npc || !isNpcDead(npc)) return false;
            const dynamic = normalizeDynamicState(npc.dynamic);
            if (dynamic.reviveLocked) return false;
            dynamic.reviveAttempted = true;
            dynamic.reviveLocked = true;
            dynamic.reviveFailureReason = truncatePromptText(reason, 140) || '困難模式復活檢定失敗';
            dynamic.reviveAttemptedAt = new Date().toLocaleString();
            dynamic.lastReason = `復活失敗：${dynamic.reviveFailureReason}`;
            dynamic.updatedAt = dynamic.reviveAttemptedAt;
            npc.dynamic = dynamic;
            return true;
        }

        function getNpcDeathBadgeText(npc) {
            const dynamic = normalizeDynamicState(npc?.dynamic);
            return dynamic.reviveLocked ? '已死亡・復活失敗' : '已死亡';
        }

        function renderDynamicStateEditor(prefix, state, { allowDeath = false } = {}) {
            const dynamic = normalizeDynamicState(state);
            const promptNoteLimit = getModelRuntimeProfile().memoryNotes;
            const deadStateLock = allowDeath && dynamic.isDead ? 'readonly' : '';
            const reason = dynamic.lastReason
                ? `<p class="dynamic-state-reason">最近更新：${escapeStatusHtml(dynamic.lastReason)}${dynamic.updatedAt ? ` · ${escapeStatusHtml(dynamic.updatedAt)}` : ''}</p>`
                : '';
            const notesText = dynamic.memoryNotes.map(note => `• ${note}`).join('\n');
            const notesEditor = dynamic.memoryNotes.length > MEMORY_NOTES_COLLAPSE_THRESHOLD
                ? `<details class="dynamic-memory-details"><summary>查看／編輯全部 ${dynamic.memoryNotes.length} 筆紀錄</summary><textarea id="${prefix}-memoryNotes" rows="6" ${deadStateLock}>${escapeStatusHtml(notesText)}</textarea></details>`
                : `<textarea id="${prefix}-memoryNotes" rows="4" ${deadStateLock}>${escapeStatusHtml(notesText)}</textarea>`;
            return `
                <div class="dynamic-state-panel">
                    <div class="dynamic-state-heading">
                        <strong>動態狀態</strong>
                        <span>${currentScenario.memoryNotesPaused ? 'AI 重要紀錄追加已暫停；仍可手動修改' : `只有重大約定／秘密才會追加；AI 每回合讀最近 ${promptNoteLimit} 筆`}</span>
                    </div>
                    <div class="dynamic-state-grid">
                        <div class="dynamic-state-field"><label>當前情緒</label><input type="text" id="${prefix}-mood" value="${escapeStatusHtml(dynamic.mood)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field"><label>身體／外觀狀態</label><input type="text" id="${prefix}-condition" value="${escapeStatusHtml(dynamic.condition)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field"><label>此刻對玩家／隊伍的個人態度</label><input type="text" id="${prefix}-relationship" value="${escapeStatusHtml(dynamic.relationship)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field"><label>當前目標</label><input type="text" id="${prefix}-goal" value="${escapeStatusHtml(dynamic.goal)}" ${deadStateLock}></div>
                        <div class="dynamic-state-field full"><label>角色專屬約定／秘密（完整保留；每行一個短標題）</label>${notesEditor}</div>
                    </div>
                    ${reason}
                </div>`;
        }

        function syncDynamicStateFromDom(prefix, existingState) {
            const previous = normalizeDynamicState(existingState);
            const next = { ...previous, memoryNotes: [...previous.memoryNotes] };
            let changed = false;

            if (!next.isDead) ['mood', 'condition', 'relationship', 'goal'].forEach(key => {
                const input = document.getElementById(`${prefix}-${key}`);
                if (!input) return;
                const value = input.value.trim();
                if (value !== previous[key]) {
                    next[key] = value;
                    changed = true;
                }
            });

            const notesInput = document.getElementById(`${prefix}-memoryNotes`);
            if (notesInput && !next.isDead) {
                const notes = normalizeMemoryNotes(notesInput.value);
                if (JSON.stringify(notes) !== JSON.stringify(previous.memoryNotes)) {
                    next.memoryNotes = notes;
                    changed = true;
                }
            }

            if (changed) {
                next.lastReason = '玩家手動修改';
                next.updatedAt = new Date().toLocaleString();
            }
            return next;
        }

        function formatDynamicStateForPrompt(state, { maxNotes = MAX_MEMORY_NOTES_FOR_PROMPT } = {}) {
            const dynamic = normalizeDynamicState(state);
            const visibleNotes = dynamic.memoryNotes.slice(-Math.max(0, maxNotes));
            const omittedCount = Math.max(0, dynamic.memoryNotes.length - visibleNotes.length);
            const memoryText = visibleNotes.length
                ? `${omittedCount ? `（另有 ${omittedCount} 筆較舊個人紀錄保留在角色面板，本回合不重複傳送）\n` : ''}${visibleNotes.map(note => `- ${truncatePromptText(note, MAX_MEMORY_NOTE_PROMPT_CHARS)}`).join('\n')}`
                : '無';
            return `[當前情緒]: ${truncatePromptText(dynamic.mood, 80) || '未特別標記'}\n[身體/外觀狀態]: ${truncatePromptText(dynamic.condition, 120) || '正常'}\n[此刻對玩家/隊伍的個人態度；不是全局角色關係摘要]: ${truncatePromptText(dynamic.relationship, 160) || '尚未形成'}\n[當前目標]: ${truncatePromptText(dynamic.goal, 160) || '未設定'}\n[角色專屬約定/秘密，只可追加不可覆寫；每則為短標題]:\n${memoryText}`;
        }

        function applyDynamicStatePatch(existingState, update, allowMemoryNotes = true) {
            const state = normalizeDynamicState(existingState);
            if (state.isDead) return { state, changed: false, changedLabels: [] };
            const changes = update?.changes && typeof update.changes === 'object'
                ? update.changes
                : (update?.state && typeof update.state === 'object' ? update.state : {});
            const changedLabels = [];
            const persistent = update?.persistent === true || valueToText(update?.importance).toLowerCase() === 'major';

            const immediateLabels = { mood: '情緒', condition: '身體狀態' };
            Object.keys(immediateLabels).forEach(key => {
                const value = valueToText(changes[key]);
                if (!value || value === state[key]) return;
                state[key] = value;
                changedLabels.push(immediateLabels[key]);
            });

            if (persistent) {
                const lastingLabels = { relationship: '關係態度', goal: '當前目標' };
                Object.keys(lastingLabels).forEach(key => {
                    const value = valueToText(changes[key]);
                    if (!value || value === state[key]) return;
                    state[key] = value;
                    changedLabels.push(lastingLabels[key]);
                });

                if (allowMemoryNotes) {
                    const incomingNotes = normalizeMemoryNotes(changes.memoryNotes ?? changes.recentChange)
                        .map(note => truncatePromptText(note, MAX_MEMORY_NOTE_STORED_CHARS))
                        .filter(Boolean)
                        .slice(0, 1);
                    incomingNotes.forEach(note => {
                        if (!state.memoryNotes.some(existing => areMemoryNotesSimilar(existing, note))) state.memoryNotes.push(note);
                    });
                    if (incomingNotes.length) {
                        const previousNotes = normalizeDynamicState(existingState).memoryNotes;
                        const addedCount = incomingNotes.filter(note => !previousNotes.some(existing => areMemoryNotesSimilar(existing, note))).length;
                        if (addedCount > 0) changedLabels.push('重要紀錄');
                    }
                }
            }

            if (changedLabels.length) {
                state.lastReason = valueToText(update?.reason, '劇情推進');
                state.updatedAt = new Date().toLocaleString();
            }
            return { state, changedLabels };
        }

        function clampAffectionValue(value, fallback = 0) {
            const parsed = Number.parseInt(value, 10);
            const safe = Number.isFinite(parsed) ? parsed : Number.parseInt(fallback, 10) || 0;
            return Math.max(-100, Math.min(100, safe));
        }

        function normalizeNpcLookupName(value) {
            return valueToText(value)
                .toLowerCase()
                .replace(/[「」『』\"'`·・．。\s_\-]/g, '')
                .replace(/^(npc|角色)/, '');
        }

        function findNpcByName(name) {
            const cleanName = valueToText(name).replace(/^[「『\"']+|[」』\"']+$/g, '').trim();
            if (!cleanName || !currentScenario?.npcs) return null;
            return currentScenario.npcs.find(npc => valueToText(npc.name) === cleanName) || null;
        }

        function findNpcByLooseName(name) {
            const exact = findNpcByName(name);
            if (exact) return exact;
            const lookup = normalizeNpcLookupName(name);
            if (!lookup || !currentScenario?.npcs) return null;
            return currentScenario.npcs.find(npc => {
                const npcName = normalizeNpcLookupName(npc.name);
                return npcName === lookup || (lookup.length >= 2 && (npcName.includes(lookup) || lookup.includes(npcName)));
            }) || null;
        }

        function applyAffectionUpdate(npc, value, mode = 'change', { announce = true } = {}) {
            if (!npc || isNpcDead(npc)) return null;
            const previous = clampAffectionValue(npc.affection, 0);
            const numericValue = Number.parseInt(value, 10);
            if (!Number.isFinite(numericValue)) return null;
            const next = mode === 'set'
                ? clampAffectionValue(numericValue, previous)
                : clampAffectionValue(previous + numericValue, previous);
            npc.affection = next;
            if (announce) createSystemAlert(`— ${npc.name} 的好感度 ${previous} → ${next} —`);
            return { npcId: npc.id || npc.name, npcName: npc.name, previous, next, mode };
        }

        function normalizeAffectionPayloadEntries(payload) {
            if (!payload) return [];
            if (Array.isArray(payload)) {
                return payload.map(entry => ({
                    name: valueToText(entry?.name || entry?.npc || entry?.character),
                    value: entry?.value ?? entry?.affection ?? entry?.change ?? entry?.delta
                })).filter(entry => entry.name);
            }
            if (typeof payload !== 'object') return [];
            return Object.entries(payload).map(([name, rawValue]) => ({
                name,
                value: rawValue && typeof rawValue === 'object'
                    ? (rawValue.value ?? rawValue.affection ?? rawValue.change ?? rawValue.delta)
                    : rawValue
            }));
        }

        function applyAffectionPayload(payload, mode = 'change', skippedNpcIds = new Set()) {
            const updates = [];
            normalizeAffectionPayloadEntries(payload).forEach(entry => {
                const npc = findNpcByLooseName(entry.name);
                if (!npc || isNpcDead(npc) || skippedNpcIds.has(npc.id || npc.name)) return;
                const update = applyAffectionUpdate(npc, entry.value, mode);
                if (update) updates.push(update);
            });
            return updates;
        }

        function normalizeNpcLifePayload(payload, detailKey) {
            const source = Array.isArray(payload) ? payload : (payload ? [payload] : []);
            return source.map(entry => {
                if (typeof entry === 'string') return { name: valueToText(entry), detail: '' };
                return {
                    name: valueToText(entry?.name || entry?.npc || entry?.character),
                    detail: valueToText(entry?.[detailKey] || entry?.reason || entry?.cause)
                };
            }).filter(entry => entry.name);
        }

        function applyNpcDeathPayload(payload, skippedNpcIds = new Set()) {
            const events = [];
            normalizeNpcLifePayload(payload, 'cause').forEach(entry => {
                const npc = findNpcByLooseName(entry.name) || ensureNpcForSpeaker(entry.name, { announce: false });
                if (!npc || skippedNpcIds.has(npc.id || npc.name) || !markNpcDead(npc, entry.detail)) return;
                const cause = normalizeDynamicState(npc.dynamic).deathCause;
                events.push(`${npc.name} 已死亡：${cause}`);
                createSystemAlert(`☠ ${npc.name} 已死亡${cause ? `：${cause}` : ''}`);
            });
            return events;
        }

        function applyNpcRevivePayload(payload) {
            const events = [];
            if (normalizeGameDifficulty(currentScenario?.gameDifficulty) !== 'standard') return events;
            normalizeNpcLifePayload(payload, 'reason').forEach(entry => {
                const npc = findNpcByLooseName(entry.name);
                if (!npc || !reviveNpc(npc, entry.detail)) return;
                events.push(`${npc.name} 已恢復存活${entry.detail ? `：${truncatePromptText(entry.detail, 100)}` : ''}`);
                createSystemAlert(`✦ ${npc.name} 已恢復存活`);
            });
            return events;
        }

        function escapeRegExp(value) {
            return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function applyManualAffectionCommands(text) {
            const source = valueToText(text);
            if (!source.includes('好感') || !Array.isArray(currentScenario?.npcs)) return [];
            const updates = [];
            currentScenario.npcs.forEach(npc => {
                if (isNpcDead(npc)) return;
                const escapedName = escapeRegExp(valueToText(npc.name));
                if (!escapedName || !source.includes(valueToText(npc.name))) return;
                const prefix = `(?:把|將)?\\s*${escapedName}\\s*(?:的)?\\s*好感度`;
                const setMatch = source.match(new RegExp(`${prefix}\\s*(?:改成|改為|設為|設定為|設定成|調到|調成|調整到|變成|為)\\s*(-?\\d+)`, 'i'));
                const addMatch = source.match(new RegExp(`${prefix}\\s*(?:增加|提升|加)\\s*(\\d+)`, 'i'));
                const subtractMatch = source.match(new RegExp(`${prefix}\\s*(?:減少|降低|扣除|扣)\\s*(\\d+)`, 'i'));
                let update = null;
                if (setMatch) update = applyAffectionUpdate(npc, setMatch[1], 'set');
                else if (addMatch) update = applyAffectionUpdate(npc, addMatch[1], 'change');
                else if (subtractMatch) update = applyAffectionUpdate(npc, -Number.parseInt(subtractMatch[1], 10), 'change');
                if (update) updates.push(update);
            });
            return updates;
        }

        function buildManualAffectionPrompt(updates) {
            if (!Array.isArray(updates) || !updates.length) return '';
            const summary = updates.map(update => `${update.npcName}：${update.previous} → ${update.next}`).join('、');
            return `【系統已直接執行玩家的好感度修改】${summary}。請自然承接玩家指令，但本回合不得再對這些 NPC 回傳 npc_love_change 或 npc_love_set，以免重複計算。`;
        }

        function isBlankNpcPlaceholder(npc) {
            if (!npc || valueToText(npc.name) !== '新角色') return false;
            const details = npc.details || {};
            return ['age', 'speech', 'likes', 'dislikes', 'app', 'bg'].every(key => !valueToText(details[key]));
        }

        function ensureNpcForSpeaker(name, { announce = true } = {}) {
            const cleanName = valueToText(name).replace(/^[「『\"']+|[」』\"']+$/g, '').trim();
            if (!cleanName || cleanName === currentScenario?.playerName) return null;
            if (['旁白', '系統', 'DM', '遊戲引擎', '玩家'].includes(cleanName)) return null;
            const existing = findNpcByName(cleanName);
            if (existing) return existing;

            let npc = currentScenario.npcs.find(isBlankNpcPlaceholder);
            if (npc) {
                npc.name = cleanName;
                npc.dynamic = normalizeDynamicState(npc.dynamic);
                npc.dynamic.memoryNotes = [`於「${currentScenario.scenarios?.[currentScenarioIndex]?.name || '目前情境'}」首次登場。`];
            } else {
                npc = {
                    id: `npc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    name: cleanName,
                    avatar: emptyAvatar,
                    affection: 0,
                    details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
                    dynamic: {
                        ...createEmptyDynamicState(),
                        memoryNotes: [`於「${currentScenario.scenarios?.[currentScenarioIndex]?.name || '目前情境'}」首次登場。`]
                    }
                };
                currentScenario.npcs.push(npc);
            }
            npc.dynamic.lastReason = 'AI 在劇情中引入新角色';
            npc.dynamic.updatedAt = new Date().toLocaleString();
            if (announce) createSystemAlert(`— 新登場 NPC [ ${cleanName} ] 已加入角色面板 —`);
            return npc;
        }

        function getAffectionToneClass(value) {
            const score = Number(value ?? 0);
            if (score < -30) return 'affection-hostile';
            if (score < 0) return 'affection-low';
            if (score < 40) return 'affection-neutral';
            if (score < 80) return 'affection-good';
            return 'affection-high';
        }

        function renderStatusSummary() {
            const target = document.getElementById('status-summary-display');
            if (!target) return;
            const currentScen = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const npcs = currentScenario.npcs || [];
            const npcRows = npcs.length
                ? npcs.map(n => {
                    const affection = Number(n.affection ?? 0);
                    const tone = getAffectionToneClass(affection);
                    return `<div class="npc-summary-row"><span class="npc-summary-name">${escapeStatusHtml(n.name || 'NPC')}</span><span class="npc-affection ${tone}"><span class="npc-affection-score">${affection}</span></span></div>`;
                }).join('')
                : '<p class="status-panel-hint">尚未設定 NPC。</p>';
            target.innerHTML = `
                <div class="quick-status-grid">
                    <div class="quick-status-box"><div class="quick-status-label">HP</div><div class="quick-status-value">${currentHp}/100</div></div>
                    <div class="quick-status-box"><div class="quick-status-label">SAN</div><div class="quick-status-value">${currentSan}/100</div></div>
                    <div class="quick-status-box"><div class="quick-status-label">情境</div><div class="quick-status-value">${escapeStatusHtml(currentScen.name || '未命名')}</div></div>
                </div>
                <p class="u-inline-016">NPC 好感摘要</p>
                <div class="npc-summary-list">${npcRows}</div>
            `;
        }

        function renderApiUsageStats() {
            const target = document.getElementById('api-usage-display');
            if (!target) return;
            const { today, month } = ensureApiUsageBucket();
            const day = apiUsageStats.days[today];
            const mon = apiUsageStats.months[month];
            const total = apiUsageStats.totals;
            const providerText = apiProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini';
            const modelRows = Object.values(apiUsageStats.models || {})
                .sort((a, b) => (b.requests || 0) - (a.requests || 0))
                .slice(0, 8)
                .map(entry => {
                    const provider = entry.provider === 'openrouter' ? 'OpenRouter' : (entry.provider === 'google' ? 'Google' : valueToText(entry.provider, '未知'));
                    const requestCount = Math.max(0, Number.parseInt(entry.requests, 10) || 0);
                    const repairCount = Math.max(0, Number.parseInt(entry.repairRequests, 10) || 0);
                    const repairs = repairCount ? ` / 修復 ${repairCount}` : '';
                    return `<div class="api-model-row"><span><b>${escapeStatusHtml(entry.displayName || entry.model)}</b><small>${escapeStatusHtml(provider)}</small></span><strong>${requestCount}${repairs}</strong></div>`;
                }).join('') || '<p class="api-stat-note">尚未有模型使用紀錄。</p>';
            target.innerHTML = `
                <div class="api-stat-grid">
                    <div class="api-stat-box"><div class="api-stat-label">今日呼叫</div><div class="api-stat-value">${Math.max(0, Number.parseInt(day.requests, 10) || 0)}</div></div>
                    <div class="api-stat-box"><div class="api-stat-label">本月呼叫</div><div class="api-stat-value">${Math.max(0, Number.parseInt(mon.requests, 10) || 0)}</div></div>
                    <div class="api-stat-box"><div class="api-stat-label">JSON 修復</div><div class="api-stat-value">${Math.max(0, Number.parseInt(mon.repairRequests, 10) || 0)}</div></div>
                    <div class="api-stat-box"><div class="api-stat-label">總呼叫</div><div class="api-stat-value">${Math.max(0, Number.parseInt(total.requests, 10) || 0)}</div></div>
                </div>
                <p class="u-inline-016">模型使用次數</p>
                <div class="api-model-list">${modelRows}</div>
                <p class="api-stat-note">目前供應商：${providerText}<br>目前模型：${escapeStatusHtml(getModelDisplayName(selectedModel) || '尚未選擇')}<br>最後使用：${escapeStatusHtml(apiUsageStats.lastUsedAt || '尚未使用')}<br>實際費用仍以 OpenRouter / Google 後台為準。</p>
                <div class="api-stat-actions">
                    <button class="btn u-inline-057" onclick="resetApiUsageStats()">重設統計</button>
                </div>
            `;
        }
        function resetApiUsageStats() {
            if (!confirm("確定要清除本機 API 使用統計嗎？遊戲存檔不會被刪除。")) return;
            apiUsageStats = {};
            saveApiUsageStats();
            renderApiUsageStats();
        }
        function switchStatusTab(tabName) {
            activeStatusTab = tabName || "state";
            document.querySelectorAll('.status-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.statusTab === activeStatusTab));
            document.querySelectorAll('.status-page').forEach(page => page.classList.toggle('active', page.id === `status-page-${activeStatusTab}`));
            if (activeStatusTab === "api") renderApiUsageStats();
            if (activeStatusTab === "log") resizeMemoryTextareas();
            if (activeStatusTab === "settings") initTextareas();
        }

        function getKeyStorageKey(provider = apiProvider) { return `sanko_api_key_${provider}`; }
        function getModelStorageKey(provider = apiProvider) { return `sanko_selected_model_${provider}`; }
        function getPersistedApiKey(provider = apiProvider) {
            return localStorage.getItem(getKeyStorageKey(provider)) || (provider === 'google' ? localStorage.getItem('sanko_api_key') : '');
        }

        function getStoredApiKey(provider = apiProvider) {
            if (Object.prototype.hasOwnProperty.call(sessionApiKeys, provider)) return sessionApiKeys[provider];
            return rememberApiKey ? getPersistedApiKey(provider) : '';
        }

        function persistApiKey(provider, key) {
            if (!key) return;
            localStorage.setItem(getKeyStorageKey(provider), key);
            if (provider === 'google') localStorage.setItem('sanko_api_key', key);
        }

        function removePersistedApiKeys() {
            Object.keys(localStorage)
                .filter(key => key === 'sanko_api_key' || key.startsWith('sanko_api_key_'))
                .forEach(key => localStorage.removeItem(key));
        }

        function setRememberApiKey(enabled) {
            rememberApiKey = Boolean(enabled);
            localStorage.setItem('sanko_remember_api_key', String(rememberApiKey));

            const provider = document.getElementById('api-provider')?.value || apiProvider || 'google';
            const visibleKey = document.getElementById('api-key')?.value.trim() || getStoredApiKey(provider);
            sessionApiKeys[provider] = visibleKey || '';
            if (provider === apiProvider) apiKey = sessionApiKeys[provider];

            if (rememberApiKey) {
                persistApiKey(provider, sessionApiKeys[provider]);
            } else {
                removePersistedApiKeys();
            }
        }

        function refreshApiCredentials() {
            const providerSelect = document.getElementById('api-provider');
            apiProvider = providerSelect?.value || localStorage.getItem('sanko_api_provider') || apiProvider || 'google';
            apiKey = getStoredApiKey(apiProvider);
            selectedModel = localStorage.getItem(getModelStorageKey(apiProvider)) || selectedModel || '';
            return { provider: apiProvider, key: apiKey, model: selectedModel };
        }

        function changeApiProvider(provider) {
            const keyInput = document.getElementById('api-key');
            if (apiProvider && keyInput) sessionApiKeys[apiProvider] = keyInput.value.trim();

            apiProvider = provider || 'google';
            localStorage.setItem('sanko_api_provider', apiProvider);
            apiKey = getStoredApiKey(apiProvider);
            selectedModel = localStorage.getItem(getModelStorageKey(apiProvider)) || '';

            keyInput.value = apiKey || '';
            document.getElementById('model-choice').innerHTML = '';
            document.getElementById('game-model-choice').innerHTML = '';
            setHomeModelAreaVisible(selectedModel && apiKey);
 document.getElementById('verify-btn').style.display = 'inline-block';
 document.getElementById('verify-btn').disabled = false;
 document.getElementById('verify-btn').innerText = '驗證金鑰';
 document.getElementById('delete-key-btn').style.display = apiKey ? 'inline-block' : 'none';
 ensureGameModelSelectReady();
}

function syncModelSelection(modelName) {
if (modelName === '__load_models__') {
 fetchAvailableModelsFromGame();
 return;
}
if(!modelName) {
 ensureGameModelSelectReady();
 return;
}
selectedModel = modelName;
localStorage.setItem(getModelStorageKey(apiProvider), modelName);
setSelectValueWithFallback(document.getElementById('model-choice'), modelName);
setSelectValueWithFallback(document.getElementById('game-model-choice'), modelName);
renderApiUsageStats();
}

function setSelectValueWithFallback(select, value, label = '') {
 if (!select || !value) return;
 if (!Array.from(select.options).some(option => option.value === value)) {
 const opt = document.createElement('option');
 opt.value = value;
 opt.textContent = label || value.replace(/^models\//, '');
 select.appendChild(opt);
 }
 select.value = value;
}

function ensureGameModelSelectReady() {
 const gameSelect = document.getElementById('game-model-choice');
 if (!gameSelect) return;
 const storedModel = localStorage.getItem(getModelStorageKey(apiProvider)) || selectedModel || '';
 const hasRealModel = Array.from(gameSelect.options).some(option => option.value && option.value !== '__load_models__');
 if (!hasRealModel) {
  gameSelect.innerHTML = '';
  if (storedModel) {
   setSelectValueWithFallback(gameSelect, storedModel);
  } else {
   const placeholderOpt = document.createElement('option');
   placeholderOpt.value = '';
   placeholderOpt.textContent = '選擇模型';
   gameSelect.appendChild(placeholderOpt);
  }
  const loadOpt = document.createElement('option');
  loadOpt.value = '__load_models__';
  loadOpt.textContent = storedModel ? '載入其他模型...' : '載入模型...';
 gameSelect.appendChild(loadOpt);
 gameSelect.value = storedModel || '';
 } else if (storedModel) {
 setSelectValueWithFallback(gameSelect, storedModel);
 }
}

async function fetchAvailableModelsFromGame() {
 const gameSelect = document.getElementById('game-model-choice');
 const providerSelect = document.getElementById('api-provider');
 const keyInput = document.getElementById('api-key');
 apiProvider = providerSelect?.value || localStorage.getItem('sanko_api_provider') || apiProvider || 'google';
 let key = keyInput?.value.trim() || getStoredApiKey(apiProvider);
 if (!key) {
 const providerName = apiProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini';
 const input = prompt(`請貼上 ${providerName} API Key 來載入模型：`, '');
 if (input === null) {
 ensureGameModelSelectReady();
 return;
 }
 key = input.trim();
 if (!key) {
 alert('需要 API Key 才能載入模型。');
 ensureGameModelSelectReady();
 return;
 }
 if (keyInput) keyInput.value = key;
 }
 apiKey = key;
 sessionApiKeys[apiProvider] = key;
 localStorage.setItem('sanko_api_provider', apiProvider);
 if (gameSelect) gameSelect.disabled = true;
 try {
 const preferredModel = localStorage.getItem(getModelStorageKey(apiProvider)) || selectedModel || '';
 const models = apiProvider === 'openrouter' ? await fetchOpenRouterModels() : await fetchGoogleModels();
 populateModelSelects(models, preferredModel);
 setHomeModelAreaVisible(true);
 document.getElementById('delete-key-btn').style.display = 'inline-block';
 } catch (error) {
 console.error('遊戲內載入模型失敗', error);
 alert(getFriendlyErrorMessage(error, '模型載入失敗，請確認金鑰後再試。'));
 ensureGameModelSelectReady();
 } finally {
 if (gameSelect) gameSelect.disabled = false;
 }
}

        function normalizeChatLineForScenePrompt(line, pageIndex = currentChatPageIndex) {
            const text = valueToText(line);
            const scene = currentScenario.scenarios?.[pageIndex] || {};
            if (!text || (!sceneUsesNarratorDefinition(scene) && getSceneParticipationMode(scene) !== 'narrator')) return text;

            const playerPrefix = `${currentScenario.playerName}：`;
            if (text.startsWith(playerPrefix)) {
                const legacyInput = text.slice(playerPrefix.length).trim();
                const context = parseSceneInputContext(legacyInput, scene);
                return context.mode === 'creator'
                    ? `【歷史創作者指令】：${context.content}`
                    : `【歷史輔助旁白】：${context.content}`;
            }
            if (text.startsWith('【旁白】：玩家行動 - ')) {
                return `【歷史輔助旁白】：${text.replace('【旁白】：玩家行動 - ', '').trim()}`;
            }
            return text;
        }

        function isChatTurnStart(line) {
            const text = valueToText(line);
            return text.startsWith(`${currentScenario.playerName}：`)
                || text.startsWith('【旁白】：玩家行動')
                || text.startsWith('【創作者指令】：')
                || text.startsWith('【輔助旁白】：');
        }

        function getRecentChatText(pageIndex = currentChatPageIndex, options = {}) {
            const maxTurns = Math.max(1, Number(options.maxTurns) || DEFAULT_RECENT_CHAT_TURNS);
            const maxChars = Math.max(800, Number(options.maxChars) || DEFAULT_RECENT_CHAT_CHARS);
            const source = Array.isArray(chatScripts[pageIndex]) ? chatScripts[pageIndex] : [];
            const turns = [];
            let currentTurn = [];
            source.forEach(rawLine => {
                if (isChatTurnStart(rawLine) && currentTurn.length) {
                    turns.push(currentTurn);
                    currentTurn = [];
                }
                currentTurn.push(normalizeChatLineForScenePrompt(rawLine, pageIndex));
            });
            if (currentTurn.length) turns.push(currentTurn);
            if (options.excludeLatestTurn && turns.length) turns.pop();
            const selectedTurns = turns.slice(-maxTurns);
            let text = selectedTurns.map((turn, index) => `【先前回合 ${index + 1}】\n${turn.map(line => truncatePromptText(line, 1000)).join('\n')}`).join('\n\n');
            while (selectedTurns.length > 1 && text.length > maxChars) {
                selectedTurns.shift();
                text = selectedTurns.map((turn, index) => `【先前回合 ${index + 1}】\n${turn.map(line => truncatePromptText(line, 1000)).join('\n')}`).join('\n\n');
            }
            if (text.length > maxChars) text = `（較早內容已由摘要取代）\n${text.slice(-maxChars)}`;
            return text || '尚無先前對話。';
        }

        function scoreModelForTRPG(model) {
            const id = (model.id || '').toLowerCase();
            const name = (model.name || '').toLowerCase();
            const haystack = `${id} ${name}`;
            let score = 0;
            if (haystack.includes('gpt-4.1') || haystack.includes('gpt-4o') || haystack.includes('o4')) score += 120;
            if (haystack.includes('claude') && (haystack.includes('sonnet') || haystack.includes('opus'))) score += 110;
            if (haystack.includes('gemini') && (haystack.includes('pro') || haystack.includes('flash'))) score += 100;
            if (haystack.includes('mistral') || haystack.includes('qwen')) score += 35;
            if (haystack.includes('free') || haystack.includes('preview') || haystack.includes('experimental')) score -= 20;
            if (model.context_length) score += Math.min(40, Math.floor(model.context_length / 8000));
            return score;
        }

        function sortModelsForTRPG(models) {
            return [...models].sort((a, b) => scoreModelForTRPG(b) - scoreModelForTRPG(a));
        }


function openEditScenario() {
document.getElementById('setup-screen').style.display = 'none';
document.getElementById('edit-scenario-screen').style.display = 'flex';
setupEditScenarioLeaveWarning();
renderPresetSelector(); loadPresetToForm(activePresetId);
clearEditScenarioDirty();
switchDesktopConfigWorkspace('characters');
}

        function isDesktopConfigLayout() {
            return window.matchMedia('(min-width: 1100px)').matches;
        }

        function syncDesktopCharacterNameWidth(input) {
            if (!input) return;
            if (!isDesktopConfigLayout()) {
                input.style.removeProperty('width');
                return;
            }
            const characterCount = Math.max(1, Array.from(valueToText(input.value, '角色')).length);
            input.style.width = `${Math.max(112, Math.min(320, characterCount * 22 + 36))}px`;
        }

        function setDesktopConfigTab(section = 'characters') {
            document.querySelectorAll('.desktop-config-tab').forEach(button => {
                button.classList.toggle('active', button.dataset.configSection === section);
            });
        }

        let desktopConfigWorkspace = 'characters';

        function switchDesktopConfigWorkspace(section = 'characters') {
            const screen = document.getElementById('edit-scenario-screen');
            if (!screen) return;
            if (screen.classList.contains('random-generator-inline-open')) closeRandomGenerator();
            if (isDesktopConfigLayout() && screen.style.display === 'flex') syncEditingDataFromDOM();
            desktopConfigWorkspace = ['characters', 'scenarios', 'game'].includes(section) ? section : 'characters';
            screen.classList.remove('desktop-editor-open');
            screen.classList.toggle('game-workspace-active', desktopConfigWorkspace === 'game');
            delete screen.dataset.editorSection;
            setDesktopConfigTab(desktopConfigWorkspace);
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === desktopConfigWorkspace);
            });
            renderDesktopPresetOverview();
        }

        function showDesktopConfigOverview() {
            switchDesktopConfigWorkspace('characters');
        }

        function closeDesktopConfigEditor() {
            const screen = document.getElementById('edit-scenario-screen');
            if (!screen) return;
            screen.classList.remove('desktop-editor-open');
            delete screen.dataset.editorSection;
            renderDesktopPresetOverview();
        }

        function openDesktopConfigEditor(section = 'player', itemIndex = -1) {
            if (!isDesktopConfigLayout()) return;
            const screen = document.getElementById('edit-scenario-screen');
            if (!screen) return;
            const workspace = section === 'scenario' ? 'scenarios' : (section === 'game' ? 'game' : 'characters');
            desktopConfigWorkspace = workspace;
            setDesktopConfigTab(workspace);
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === workspace);
            });
            screen.classList.remove('game-workspace-active');
            screen.classList.add('desktop-editor-open');
            screen.dataset.editorSection = section;

            document.querySelectorAll('#npc-list-container details, #scenario-list-container details').forEach(card => {
                card.classList.remove('desktop-active-card');
            });

            if (section === 'player') {
                document.querySelector('#preset-player-editor > details')?.setAttribute('open', '');
                syncDesktopCharacterNameWidth(document.getElementById('input-player-name'));
            }
            if (section === 'npc') {
                const card = document.getElementById('npc-list-container')?.querySelectorAll('details')[itemIndex];
                if (card) {
                    card.open = true;
                    card.classList.add('desktop-active-card');
                }
                syncDesktopCharacterNameWidth(document.getElementById(`npc-name-${itemIndex}`));
            }
            if (section === 'scenario') {
                const card = document.getElementById('scenario-list-container')?.querySelectorAll('details')[itemIndex];
                if (card) {
                    card.open = true;
                    card.classList.add('desktop-active-card');
                }
            }
            requestAnimationFrame(() => {
                const editor = document.getElementById('desktop-config-editor');
                if (editor) editor.scrollTop = 0;
            });
        }

        function renderDesktopPresetOverview() {
            const avatar = document.getElementById('desktop-player-avatar');
            const preview = document.getElementById('preview-player');
            const name = document.getElementById('desktop-player-name');
            const nameInput = document.getElementById('input-player-name');
            if (avatar) avatar.src = preview?.src || scenarioPresets[activePresetId]?.playerAvatar || emptyAvatar;
            if (name) name.textContent = valueToText(nameInput?.value, uiText('玩家'));

            const list = document.getElementById('desktop-npc-avatar-list');
            if (!list) return;
            list.innerHTML = '';
            editingNpcs.forEach((npc, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'desktop-npc-avatar-button';
                const displayName = uiCharacterName(document.getElementById(`npc-name-${index}`)?.value || npc.name, `角色 ${index + 1}`);
                button.setAttribute('aria-label', `${uiText('編輯')} NPC：${displayName}`);
                button.onclick = () => openDesktopConfigEditor('npc', index);
                const currentPreview = document.getElementById(`preview-npc-${index}`)?.src;
                const image = document.createElement('img');
                image.src = currentPreview || npc.avatar || emptyAvatar;
                image.alt = '';
                const label = document.createElement('span');
                label.textContent = displayName;
                button.append(image, label);
                list.appendChild(button);
            });

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'desktop-npc-avatar-button desktop-npc-add-button';
            addButton.setAttribute('aria-label', uiText('新增 NPC'));
            addButton.innerHTML = `<span class="desktop-npc-add-icon">＋</span><span>${escapeStatusHtml(uiText('新增'))}</span>`;
            addButton.onclick = () => {
                addNpcBlock();
                openDesktopConfigEditor('npc', editingNpcs.length - 1);
            };
            list.appendChild(addButton);

            const scenarioList = document.getElementById('desktop-scenario-card-list');
            if (scenarioList) {
                scenarioList.innerHTML = '';
                editingScenarios.forEach((scenario, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'desktop-overview-card desktop-scenario-card';
                    button.onclick = () => openDesktopConfigEditor('scenario', index);
                    const nameValue = valueToText(document.getElementById(`scen-name-${index}`)?.value || scenario.name, `${uiText('情境')} ${index + 1}`);
                    const fullLoreValue = valueToText(document.getElementById(`scen-lore-${index}`)?.value || scenario.lore, uiText('尚未填寫世界觀'));
                    const loreValue = fullLoreValue.length > 72 ? `${fullLoreValue.slice(0, 72)}…` : fullLoreValue;
                    button.innerHTML = `<span class="desktop-scenario-number">${index + 1}</span><span><strong data-no-i18n>${escapeStatusHtml(nameValue)}</strong><small data-no-i18n>${escapeStatusHtml(loreValue)}</small></span>`;
                    scenarioList.appendChild(button);
                });
                const addScenarioButton = document.createElement('button');
                addScenarioButton.type = 'button';
                addScenarioButton.className = 'desktop-overview-card desktop-overview-add-card';
                addScenarioButton.innerHTML = `<span class="desktop-scenario-number">＋</span><span><strong>${escapeStatusHtml(uiText('新增情境'))}</strong><small>${escapeStatusHtml(uiText('建立新的世界或場景'))}</small></span>`;
                addScenarioButton.onclick = () => {
                    addScenarioBlock();
                    openDesktopConfigEditor('scenario', editingScenarios.length - 1);
                };
                scenarioList.appendChild(addScenarioButton);
            }

renderDesktopGameSettings();
updateSetupCurrentPresetLabel();
}

        function renderDesktopGameSettings() {
            const selector = document.getElementById('desktop-preset-selector');
            if (selector) {
                selector.innerHTML = '';
                Object.entries(scenarioPresets).forEach(([id, preset]) => {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = `${valueToText(preset?.presetName, '未命名配置')}${preset?.isLocked ? ' 🔒' : ''}`;
                    option.selected = id === activePresetId;
                    selector.appendChild(option);
                });
            }
            const nameInput = document.getElementById('desktop-preset-name-input');
            if (nameInput && document.activeElement !== nameInput) nameInput.value = document.getElementById('input-preset-name')?.value || '';
            const language = document.getElementById('desktop-language-mode');
            if (language) language.value = document.getElementById('input-language-mode')?.value || 'zh-tw';
            const difficulty = document.getElementById('desktop-game-difficulty');
            if (difficulty) difficulty.value = document.getElementById('input-game-difficulty')?.value || 'standard';
const lockButton = document.getElementById('desktop-preset-lock-btn');
if (lockButton) lockButton.textContent = scenarioPresets[activePresetId]?.isLocked ? '🔒' : '🔓';
const bindingNote = document.getElementById('desktop-preset-binding-note');
if (bindingNote) {
const sourceScenarios = Array.isArray(editingScenarios)
? editingScenarios
: (scenarioPresets[activePresetId]?.scenarios || []);
const scenarioNames = sourceScenarios
.map((scenario, index) => valueToText(scenario?.name, `${uiText('情境')} ${index + 1}`))
.filter(Boolean);
let bindingText = uiText('尚未建立情境');
if (scenarioNames.length === 1) {
bindingText = scenarioNames[0];
} else if (scenarioNames.length > 1) {
bindingText = `${scenarioNames[0]} +${scenarioNames.length - 1}`;
}
bindingNote.textContent = `${uiText('綁定情境')}：${bindingText}`;
}
renderPresetDeleteList();
}

function getPresetDeleteBlockReason(id) {
if (scenarioPresets[id]?.isLocked) return uiText('已上鎖');
const boundSaves = getPresetBoundSaves(id);
if (boundSaves.length) return `${uiText('綁定')} ${boundSaves.length} ${uiText('份紀錄')}`;
return '';
}

function renderPresetDeleteList() {
const list = document.getElementById('preset-delete-list');
const selectAll = document.getElementById('preset-delete-select-all');
if (!list) return;
list.innerHTML = '';
Object.entries(scenarioPresets || {}).forEach(([id, preset]) => {
const reason = getPresetDeleteBlockReason(id);
const row = document.createElement('label');
row.className = `desktop-preset-delete-row${reason ? ' disabled' : ''}`;
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.className = 'preset-delete-checkbox';
checkbox.value = id;
checkbox.disabled = Boolean(reason);
checkbox.onchange = syncPresetDeleteSelectAll;
const name = document.createElement('span');
name.className = 'desktop-preset-delete-name';
name.textContent = `${valueToText(preset?.presetName, '未命名配置')}${reason ? `（${reason}）` : ''}`;
row.title = name.textContent;
row.appendChild(checkbox);
row.appendChild(name);
list.appendChild(row);
});
if (selectAll) {
selectAll.checked = false;
selectAll.indeterminate = false;
selectAll.disabled = !list.querySelector('.preset-delete-checkbox:not(:disabled)');
}
}

function syncPresetDeleteSelectAll() {
const selectAll = document.getElementById('preset-delete-select-all');
const boxes = Array.from(document.querySelectorAll('.preset-delete-checkbox:not(:disabled)'));
if (!selectAll) return;
const checked = boxes.filter(box => box.checked).length;
selectAll.checked = boxes.length > 0 && checked === boxes.length;
selectAll.indeterminate = checked > 0 && checked < boxes.length;
}

function togglePresetDeleteSelectAll(checked) {
document.querySelectorAll('.preset-delete-checkbox:not(:disabled)').forEach(box => {
box.checked = checked;
});
syncPresetDeleteSelectAll();
}

function deleteSelectedPresets() {
const selectedIds = Array.from(document.querySelectorAll('.preset-delete-checkbox:checked:not(:disabled)')).map(box => box.value);
if (!selectedIds.length) {
alert(uiText('請先勾選要刪除的配置。'));
return;
}
const deletableIds = selectedIds.filter(id => !getPresetDeleteBlockReason(id));
if (!deletableIds.length) {
alert(uiText('勾選的配置目前都不能刪除。'));
renderPresetDeleteList();
return;
}
if (Object.keys(scenarioPresets).length - deletableIds.length < 1) {
alert(uiText('系統至少需要保留一組配置喔！'));
renderPresetDeleteList();
return;
}
const names = deletableIds.map(id => `• ${valueToText(scenarioPresets[id]?.presetName, '未命名配置')}`).join('\n');
const confirmMessage = `${uiText('確定要刪除 {count} 個配置嗎？').replace('{count}', deletableIds.length)}\n${names}`;
if (!confirm(confirmMessage)) return;
const previousPresets = getJsonClone(scenarioPresets);
deletableIds.forEach(id => delete scenarioPresets[id]);
if (!scenarioPresets[activePresetId]) activePresetId = Object.keys(scenarioPresets)[0] || 'default';
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
scenarioPresets = previousPresets;
renderPresetDeleteList();
return;
}
localStorage.setItem('sanko_active_preset_id', activePresetId);
renderPresetSelector();
loadPresetToForm(activePresetId);
renderDesktopGameSettings();
alert(uiText('已刪除 {count} 個配置。').replace('{count}', deletableIds.length));
}

function selectDesktopPreset(id) {
            if (!scenarioPresets[id] || id === activePresetId) return;
            commitCurrentPresetSilently();
            loadPresetToForm(id);
            localStorage.setItem('sanko_active_preset_id', id);
            renderDesktopPresetOverview();
        }

 function updateDesktopPresetName(value) {
 const input = document.getElementById('input-preset-name');
 if (input) input.value = value;
 const nextName = valueToText(value, uiText('未命名配置'));
 if (scenarioPresets[activePresetId]) scenarioPresets[activePresetId].presetName = nextName;
 const desktopOption = document.querySelector(`#desktop-preset-selector option[value="${CSS.escape(activePresetId)}"]`);
 if (desktopOption) desktopOption.textContent = `${nextName}${scenarioPresets[activePresetId]?.isLocked ? ' 🔒' : ''}`;
 const legacyOption = document.querySelector(`#preset-selector option[value="${CSS.escape(activePresetId)}"]`);
 if (legacyOption) legacyOption.textContent = `${nextName}${scenarioPresets[activePresetId]?.isLocked ? ' 🔒' : ''}`;
 renderDesktopPresetOverview();
 updateSetupCurrentPresetLabel();
 }

        function setDesktopLanguageMode(value) {
            syncPresetLanguageMode(value);
            renderDesktopGameSettings();
        }

        function setDesktopGameDifficulty(value) {
            const input = document.getElementById('input-game-difficulty');
            if (input) input.value = normalizeGameDifficulty(value);
        }

        function renderPresetSelector() {
            const selector = document.getElementById('preset-selector'); selector.innerHTML = '';
            for (const id in scenarioPresets) {
                const opt = document.createElement('option'); opt.value = id;
                const lockStatus = scenarioPresets[id].isLocked ? " 🔒" : "";
                opt.textContent = scenarioPresets[id].presetName + lockStatus;
                if (id === activePresetId) opt.selected = true; selector.appendChild(opt);
            }
            renderDesktopGameSettings();
        }

        function updatePresetLockUI() {
            const p = scenarioPresets[activePresetId];
            const isLocked = p ? p.isLocked : false;
            document.getElementById('preset-lock-toggle').innerText = isLocked ? "🔒" : "🔓";
            renderPresetSelector();
            renderDesktopGameSettings();
        }

        function togglePresetLock() {
            let p = scenarioPresets[activePresetId];
            if (!p) return;
            if (!p.isLocked) {
                commitCurrentPresetSilently();
                p = scenarioPresets[activePresetId];
            }
            p.isLocked = !p.isLocked;
            persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
            updatePresetLockUI();
        }

        let forceOpenNpcIndex = -1;
        function renderNpcList() {
            const container = document.getElementById('npc-list-container');
            container.innerHTML = '';
            editingNpcs.forEach((npc, index) => {
                const details = document.createElement('details');
                details.className = 'foldable-card';
                if (index === forceOpenNpcIndex) details.open = true; 
                
                details.innerHTML = `
                    <summary>NPC: <span id="npc-title-${index}" data-no-i18n>${escapeStatusHtml(npc.name || '新角色')}</span></summary>
                    <div class="foldable-content">
                        <button class="delete-scen-btn" onclick="removeNpcBlock(${index})">刪除</button>
                        <div class="avatar-setup-area u-inline-060">
                            <div class="avatar-box" onclick="document.getElementById('upload-npc-${index}').click();">
                                <img id="preview-npc-${index}" class="avatar-preview" src="${escapeStatusHtml(npc.avatar || emptyAvatar)}">
                                <div class="avatar-label">點擊更換頭像</div>
                                <input type="file" id="upload-npc-${index}" accept="image/*" onchange="triggerCrop(this, 'npc-${index}')" hidden class="hidden-file-input">
                            </div>
                        </div>
                        
                        <div class="u-inline-061">
                            <div class="u-inline-062">
                                <div class="scenario-label">NPC 名稱</div>
                                <input type="text" class="scenario-input" id="npc-name-${index}" value="${escapeStatusHtml(npc.name)}" oninput="document.getElementById('npc-title-${index}').innerText = this.value || '新角色'; syncDesktopCharacterNameWidth(this); renderDesktopPresetOverview();">
                            </div>
                            <div class="u-inline-063">
<div class="scenario-label">開局好感</div>
<input type="number" class="scenario-input" id="npc-aff-${index}" value="${npc.affection !== undefined ? npc.affection : 0}">
</div>
</div>

<div class="scenario-label u-inline-064">詳細設定</div>
 <div class="anime-sheet">
 <div><label>年齡 / 身高 / 體型</label><input type="text" id="npc-age-${index}" value="${escapeStatusHtml(npc.details?.age || '')}"></div>
 <div class="character-voice-field">
 <div class="character-test-inline">
 <label>說話習慣 / 語氣</label>
 <button type="button" class="btn character-test-mini-btn" onclick="testCharacterVoice('npc', ${index})">測試語氣</button>
 </div>
 <input type="text" id="npc-speech-${index}" value="${escapeStatusHtml(npc.details?.speech || '')}">
 </div>
 <div><label>喜歡的事物</label><input type="text" id="npc-likes-${index}" value="${escapeStatusHtml(npc.details?.likes || '')}"></div>
 <div><label>討厭的事物</label><input type="text" id="npc-dislikes-${index}" value="${escapeStatusHtml(npc.details?.dislikes || '')}"></div>
<div class="full"><label>外貌特徵 / 常見穿搭</label><textarea id="npc-app-${index}" rows="1" oninput="autoResize(this)">${escapeStatusHtml(npc.details?.app || '')}</textarea></div>
<div class="full"><label>核心性格 / 背景故事</label><textarea id="npc-bg-${index}" rows="1" oninput="autoResize(this)">${escapeStatusHtml(npc.details?.bg || npc.persona || '')}</textarea></div>
<div class="full character-test-row">
<p id="voice-test-npc-${index}" class="character-test-output"></p>
</div>
</div>
</div>
`;
                container.appendChild(details);
            });
            initTextareas();
            forceOpenNpcIndex = -1; 
            renderDesktopPresetOverview();
        }

        let forceOpenScenIndex = -1;
        function renderScenarioList() {
            const container = document.getElementById('scenario-list-container');
            container.innerHTML = '';
            editingScenarios.forEach((scen, index) => {
                const details = document.createElement('details');
                details.className = 'foldable-card';
                if (index === forceOpenScenIndex) details.open = true;

                details.innerHTML = `
                    <summary>情境: <span id="scen-title-${index}" data-no-i18n>${escapeStatusHtml(scen.name || '未命名')}</span></summary>
                    <div class="foldable-content">
                        <button class="delete-scen-btn" onclick="removeScenarioBlock(${index})">刪除</button>
                        <div class="scenario-label">情境名稱</div>
                        <input type="text" class="scenario-input" id="scen-name-${index}" value="${escapeStatusHtml(scen.name)}" oninput="document.getElementById('scen-title-${index}').innerText = this.value || '未命名'; renderDesktopPresetOverview();">
                        <div class="scenario-label">該情境下的物理法則與世界觀</div>
                        <textarea class="scenario-input" id="scen-lore-${index}" oninput="autoResize(this); renderDesktopPresetOverview();">${escapeStatusHtml(scen.lore)}</textarea>
                        <div class="scenario-label">NPC 們在此情境下的總體身分/狀態</div>
                        <textarea class="scenario-input" id="scen-npcRoles-${index}" oninput="autoResize(this)">${escapeStatusHtml(scen.npcRoles || '')}</textarea>
                        <div class="scenario-label">玩家在此的專屬身份/狀態</div>
                        <input type="text" class="scenario-input" id="scen-player-${index}" value="${escapeStatusHtml(scen.playerRole)}">
                        <div class="scenario-label">轉場規則（選填）</div>
                        <textarea class="scenario-input" id="scen-transition-${index}" placeholder="例如：切回此情境時視為夢醒。" oninput="autoResize(this)">${escapeStatusHtml(scen.transitionRule || '')}</textarea>
                    </div>
                `;
                container.appendChild(details);
            });
            initTextareas();
            forceOpenScenIndex = -1;
            renderDesktopPresetOverview();
        }

        function syncEditingDataFromDOM() {
            editingNpcs.forEach((npc, index) => {
                const n = document.getElementById(`npc-name-${index}`);
                if(n) {
                    npc.name = n.value;
                    npc.affection = parseInt(document.getElementById(`npc-aff-${index}`).value) || 0;
                    npc.details = {
                        age: document.getElementById(`npc-age-${index}`).value.trim(),
                        speech: document.getElementById(`npc-speech-${index}`).value.trim(),
                        likes: document.getElementById(`npc-likes-${index}`).value.trim(),
                        dislikes: document.getElementById(`npc-dislikes-${index}`).value.trim(),
                        app: document.getElementById(`npc-app-${index}`).value.trim(),
                        bg: document.getElementById(`npc-bg-${index}`).value.trim()
                    };
                    npc.avatar = document.getElementById(`preview-npc-${index}`).src;
                }
            });
editingScenarios.forEach((scen, index) => {
const n = document.getElementById(`scen-name-${index}`);
if(n) {
scen.name = n.value;
scen.lore = document.getElementById(`scen-lore-${index}`).value;
                    scen.npcRoles = document.getElementById(`scen-npcRoles-${index}`).value;
                    scen.playerRole = document.getElementById(`scen-player-${index}`).value;
                    scen.transitionRule = document.getElementById(`scen-transition-${index}`).value;
}
});
}

async function testCharacterVoice(kind = 'npc', index = -1) {
refreshApiCredentials();
if (!apiKey || !selectedModel) {
alert(`請先驗證 ${apiProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'} 金鑰並選擇模型。`);
return;
}
syncEditingDataFromDOM();
if (kind !== 'npc') return;
const character = editingNpcs[index];
if (!character) return;
const output = document.getElementById(`voice-test-npc-${index}`);
const button = document.querySelector(`button[onclick="testCharacterVoice('npc', ${index})"]`);
if (button) button.disabled = true;
if (output) output.textContent = uiText('生成中...');
try {
const scene = editingScenarios[0] || {};
const prompt = `你是 TRPG 角色語氣測試器。請根據角色設定，輸出這個角色在開場時可能說的一句話與一小段動作描寫。不要改設定，不要新增劇情結論，不要 Markdown，80字內。\n角色：${JSON.stringify(character)}\n目前情境：${JSON.stringify({ name: scene.name || '', lore: scene.lore || '', npcRoles: scene.npcRoles || '', playerRole: scene.playerRole || '' })}`;
const text = await requestAIText(prompt, { kind: 'generation', maxTokens: 220 });
if (output) output.textContent = valueToText(text, uiText('沒有取得測試內容。')).replace(/\s+/g, ' ').trim();
} catch (error) {
if (output) output.textContent = typeof getFriendlyErrorMessage === 'function' ? getFriendlyErrorMessage(error, '暫時無法測試語氣。') : '暫時無法測試語氣。';
} finally {
if (button) button.disabled = false;
}
}

function openRandomGenerator(mode = 'world') {
            randomGeneratorMode = mode === 'all' ? 'all' : 'world';
            pendingGeneratedPreset = null;
            const isAll = randomGeneratorMode === 'all';
            document.getElementById('random-generator-title').innerText = uiText(isAll ? '人物與世界全部隨機' : '保留人物，隨機世界／情境');
            document.getElementById('random-generator-description').innerText = uiText(isAll
                ? 'AI 會重新產生玩家設定、NPC 與情境；頭像不會傳給 AI，套用前可先預覽。'
                : '保留目前玩家與 NPC 設定，只產生適合這些人物的世界觀與情境。');
            document.getElementById('random-generator-theme').value = '';
            const preview = document.getElementById('random-generator-preview');
            preview.style.display = 'none';
            preview.textContent = '';
            document.getElementById('random-generator-apply-btn').style.display = 'none';
            const runButton = document.getElementById('random-generator-run-btn');
            runButton.disabled = false;
            runButton.innerText = uiText('開始生成');
            const modal = document.getElementById('random-generator-modal');
            const box = document.querySelector('.random-generator-inline-panel') || modal?.querySelector('.modal-box');
            const screen = document.getElementById('edit-scenario-screen');
            const editor = document.getElementById('desktop-config-editor');
            if (!box || !modal) {
                if (modal) modal.style.display = 'none';
                console.error('Random generator panel is unavailable; blocked an empty modal overlay.');
                return;
            }
 const useDesktopColumn = isDesktopConfigLayout()
 && ['scenarios', 'game'].includes(desktopConfigWorkspace)
 && screen?.style.display === 'flex'
 && box && editor;
            if (useDesktopColumn) {
                modal.style.display = 'none';
                editor.appendChild(box);
                box.classList.add('random-generator-inline-panel');
                screen.classList.add('desktop-editor-open', 'random-generator-inline-open');
                screen.dataset.editorSection = 'random-generator';
            } else {
                if (box.parentElement !== modal) modal.appendChild(box);
                box.classList.remove('random-generator-inline-panel');
                modal.style.display = 'flex';
            }
        }

        function closeRandomGenerator() {
            const runButton = document.getElementById('random-generator-run-btn');
            if (runButton?.disabled) cancelActiveAIRequest();
            const modal = document.getElementById('random-generator-modal');
            const box = document.querySelector('.random-generator-inline-panel') || modal?.querySelector('.modal-box');
            const screen = document.getElementById('edit-scenario-screen');
            if (box && modal && box.parentElement !== modal) modal.appendChild(box);
            box?.classList.remove('random-generator-inline-panel');
            modal.style.display = 'none';
            if (screen?.classList.contains('random-generator-inline-open')) {
                screen.classList.remove('desktop-editor-open', 'random-generator-inline-open');
                delete screen.dataset.editorSection;
                screen.classList.add('game-workspace-active');
                setDesktopConfigTab('game');
            }
            pendingGeneratedPreset = null;
        }

        function buildRandomGeneratorPrompt(mode, theme = '') {
            const preference = truncatePromptText(theme, 500) || '沒有指定；請自由創作，但避免套用任何固定範例或既有作品。';
            if (mode === 'world') {
                const player = {
                    name: valueToText(document.getElementById('input-player-name')?.value, '玩家'),
                    details: {
                        age: valueToText(document.getElementById('p-age')?.value),
                        speech: valueToText(document.getElementById('p-speech')?.value),
                        likes: valueToText(document.getElementById('p-likes')?.value),
                        dislikes: valueToText(document.getElementById('p-dislikes')?.value),
                        app: truncatePromptText(document.getElementById('p-app')?.value, 300),
                        bg: truncatePromptText(document.getElementById('p-bg')?.value, 500)
                    }
                };
                const npcs = editingNpcs.slice(0, 8).map(npc => ({
                    name: valueToText(npc.name),
                    speech: truncatePromptText(npc.details?.speech, 120),
                    personality: truncatePromptText(npc.details?.bg, 260)
                }));
                return `你是原創 TRPG 世界與情境設計器。保留提供的人物設定，不得改名、改性格或預設玩家已經歷任何事件。根據人物與偏好，創作 1～3 個可自由發展的情境。只輸出 JSON，不要 Markdown。\n\n玩家與 NPC：\n${JSON.stringify({ player, npcs })}\n\n偏好：${preference}\n\nJSON：{"presetName":"簡短配置名稱","scenarios":[{"name":"情境名稱","lore":"世界法則、時代與環境，300字內","npcRoles":"各 NPC 在此的身分，200字內","playerRole":"玩家起始身分，120字內","transitionRule":"此情境與其他情境如何切換，100字內"}]}`;
            }
            return `你是原創單人 TRPG 配置設計器。請從零創作一組可長期遊玩的設定，不得沿用任何固定範例、知名作品或預設玩家已經歷事件。產生 1 名玩家、2～4 名 NPC、1～3 個情境；人物要有可互動的差異，但不要替玩家決定未來行動或關係結果。只輸出 JSON，不要 Markdown。\n\n偏好：${preference}\n\nJSON：{"presetName":"簡短配置名稱","player":{"name":"玩家名","details":{"age":"年齡體型","speech":"語氣","likes":"喜好","dislikes":"厭惡","app":"外貌穿搭","bg":"核心性格與背景，250字內"}},"npcs":[{"name":"NPC名","details":{"age":"年齡體型","speech":"語氣","likes":"喜好","dislikes":"厭惡","app":"外貌穿搭","bg":"核心性格與背景，220字內"}}],"scenarios":[{"name":"情境名稱","lore":"世界法則、時代與環境，300字內","npcRoles":"各 NPC 在此的身分，200字內","playerRole":"玩家起始身分，120字內","transitionRule":"情境切換規則，100字內"}]}`;
        }

        function normalizeGeneratedDetails(value) {
            const source = value && typeof value === 'object' ? value : {};
            return {
                age: truncatePromptText(source.age, 80),
                speech: truncatePromptText(source.speech, 160),
                likes: truncatePromptText(source.likes, 140),
                dislikes: truncatePromptText(source.dislikes, 140),
                app: truncatePromptText(source.app, 320),
                bg: truncatePromptText(source.bg, 420)
            };
        }

        function normalizeGeneratedScenarios(value) {
            const source = Array.isArray(value) ? value : [];
            const scenarios = source.slice(0, 3).map((scene, index) => ({
                name: truncatePromptText(scene?.name, 80) || `隨機情境 ${index + 1}`,
                lore: truncatePromptText(scene?.lore, 700),
                npcRoles: truncatePromptText(scene?.npcRoles, 450),
                playerRole: truncatePromptText(scene?.playerRole, 260),
                transitionRule: truncatePromptText(scene?.transitionRule, 220)
            }));
            if (!scenarios.length) throw new Error('AI 沒有產生可用情境，請重新生成。');
            return scenarios;
        }

        function normalizeRandomGeneratorPayload(data, mode) {
            const normalized = {
                mode,
                presetName: truncatePromptText(data?.presetName, 60) || '隨機生成配置',
                scenarios: normalizeGeneratedScenarios(data?.scenarios)
            };
            if (mode === 'all') {
                normalized.player = {
                    name: truncatePromptText(data?.player?.name, 60) || '玩家',
                    details: normalizeGeneratedDetails(data?.player?.details)
                };
                const npcSource = Array.isArray(data?.npcs) ? data.npcs : [];
                normalized.npcs = npcSource.slice(0, 4).map((npc, index) => ({
                    id: `npc_random_${Date.now()}_${index}`,
                    name: truncatePromptText(npc?.name, 60) || `角色 ${index + 1}`,
                    avatar: editingNpcs[index]?.avatar || emptyAvatar,
                    affection: 0,
                    details: normalizeGeneratedDetails(npc?.details)
                }));
                if (normalized.npcs.length < 2) throw new Error('AI 產生的 NPC 不足，請重新生成。');
            }
            return normalized;
        }

        async function parseRandomGeneratorJson(rawText, mode) {
            try {
                return normalizeRandomGeneratorPayload(JSON.parse(extractJsonText(rawText)), mode);
            } catch (firstError) {
                const schema = mode === 'all'
                    ? '{"presetName":"","player":{"name":"","details":{}},"npcs":[],"scenarios":[]}'
                    : '{"presetName":"","scenarios":[]}';
                const repairPrompt = `把下方內容修正為合法 JSON，只保留原本已產生的設定，不得新增故事事件。格式：${schema}\n\n${rawText.slice(0, 9000)}`;
                const repaired = await requestAIText(repairPrompt, { kind: 'repair', maxTokens: mode === 'all' ? 1300 : 900 });
                try {
                    return normalizeRandomGeneratorPayload(JSON.parse(extractJsonText(repaired)), mode);
                } catch (secondError) {
                    console.error('隨機生成 JSON 修復失敗', secondError);
                    const formatError = new Error('生成結果格式異常，請重新生成一次。');
                    formatError.userFriendly = true;
                    throw formatError;
                }
            }
        }

        function formatRandomGeneratorPreview(result) {
            const lines = [`配置：${result.presetName}`];
            if (result.mode === 'all') {
                lines.push(`\n玩家：${result.player.name}`, `人物：${result.player.details.bg || '未設定'}`);
                lines.push(`\nNPC：${result.npcs.map(npc => npc.name).join('、')}`);
            } else {
                lines.push('\n人物：保留目前玩家與 NPC 設定');
            }
            result.scenarios.forEach((scene, index) => {
                lines.push(`\n情境 ${index + 1}：${scene.name}`, scene.lore, `玩家身分：${scene.playerRole || '未設定'}`, `NPC 身分：${scene.npcRoles || '未設定'}`);
            });
            return lines.join('\n');
        }

        async function generateRandomPresetPreview() {
            syncEditingDataFromDOM();
            const runButton = document.getElementById('random-generator-run-btn');
            const applyButton = document.getElementById('random-generator-apply-btn');
            const preview = document.getElementById('random-generator-preview');
            runButton.disabled = true;
            runButton.innerText = '生成中…';
            applyButton.style.display = 'none';
            preview.style.display = 'block';
            preview.textContent = 'AI 正在建立設定…';
            pendingGeneratedPreset = null;
            try {
                const theme = document.getElementById('random-generator-theme').value;
                const prompt = buildRandomGeneratorPrompt(randomGeneratorMode, theme);
                const profile = getModelRuntimeProfile();
                const maxTokens = randomGeneratorMode === 'all'
                    ? (profile.id === 'gpt-4.1' ? 1500 : Math.min(2100, profile.journalMaxTokens))
                    : Math.min(1200, profile.summaryMaxTokens);
                const rawText = await requestAIText(prompt, { kind: 'generation', maxTokens });
                pendingGeneratedPreset = await parseRandomGeneratorJson(rawText, randomGeneratorMode);
                preview.textContent = formatRandomGeneratorPreview(pendingGeneratedPreset);
                applyButton.style.display = 'inline-block';
                runButton.innerText = '重新生成';
            } catch (error) {
                console.error(error);
                preview.textContent = getFriendlyErrorMessage(error, '生成失敗，請稍後再試。');
                runButton.innerText = '重新生成';
            } finally {
                runButton.disabled = false;
            }
        }

        function applyRandomPresetPreview() {
            const result = pendingGeneratedPreset;
            if (!result) return;
            document.getElementById('input-preset-name').value = result.presetName;
            editingScenarios = clonePersistentValue(result.scenarios);
            if (result.mode === 'all') {
                document.getElementById('input-player-name').value = result.player.name;
                ['age', 'speech', 'likes', 'dislikes', 'app', 'bg'].forEach(key => {
                    const field = document.getElementById(`p-${key}`);
                    if (field) field.value = result.player.details[key] || '';
                });
                applyStatsToInputs(rollPlayerStatSetAtCap());
                editingNpcs = clonePersistentValue(result.npcs);
                renderNpcList();
            }
            renderScenarioList();
            initTextareas();
            closeRandomGenerator();
            renderDesktopPresetOverview();
            alert(isDesktopConfigLayout()
                ? '隨機設定已套用；切換標籤不會重置內容，返回首頁時會自動儲存目前配置。'
                : '隨機設定已套用到表單；確認內容後即可繼續編輯。');
        }

        function addNpcBlock() {
            syncEditingDataFromDOM();
editingNpcs.push({ id: 'npc_' + Date.now(), name: '新角色', avatar: emptyAvatar, affection: 0, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' } });
forceOpenNpcIndex = editingNpcs.length - 1;
markEditScenarioDirty();
renderNpcList();
        }

        function removeNpcBlock(index) {
            if(editingNpcs.length <= 1) { alert("至少要保留一位 NPC 喔！"); return; }
syncEditingDataFromDOM(); editingNpcs.splice(index, 1); markEditScenarioDirty(); renderNpcList();
        }

        function addScenarioBlock() {
            syncEditingDataFromDOM();
editingScenarios.push({name: '新情境', lore: '', npcRoles: '', playerRole: '', transitionRule: ''});
forceOpenScenIndex = editingScenarios.length - 1;
markEditScenarioDirty();
renderScenarioList();
        }

        function removeScenarioBlock(index) {
            if(editingScenarios.length <= 1) { alert("至少要保留一個情境喔！"); return; }
syncEditingDataFromDOM(); editingScenarios.splice(index, 1); markEditScenarioDirty(); renderScenarioList();
        }

        function loadPresetToForm(id) {
            activePresetId = id; const p = scenarioPresets[id] || defaultPreset;
            document.getElementById('input-preset-name').value = p.presetName || ''; 
            document.getElementById('input-player-name').value = p.playerName || ''; 
            document.getElementById('preview-player').src = p.playerAvatar || emptyAvatar;
            setLanguageModeControls(p.languageMode || 'zh-tw');
            document.getElementById('input-game-difficulty').value = normalizeGameDifficulty(p.gameDifficulty);
            
            const ps = normalizePlayerStats(p.playerStats || {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10});
            p.playerStats = ps;
            applyStatsToInputs(ps);

            updatePresetLockUI();

            const isStatsLocked = p.statsLocked === true;
            const statInputs = document.querySelectorAll('.stat-input');
            statInputs.forEach(input => input.disabled = isStatsLocked);
            
            if(isStatsLocked) {
                document.getElementById('btn-roll-stats').style.display = 'none';
                document.getElementById('btn-respec-stats').style.display = 'inline-block';
            } else {
                document.getElementById('btn-roll-stats').style.display = 'inline-block';
                document.getElementById('btn-respec-stats').style.display = 'none';
            }

            let pDet = p.playerDetails || { age: '', speech: '', likes: '', dislikes: '', app: '', bg: p.playerPersona || '' };
            document.getElementById('p-age').value = pDet.age || '';
            document.getElementById('p-speech').value = pDet.speech || '';
            document.getElementById('p-likes').value = pDet.likes || '';
            document.getElementById('p-dislikes').value = pDet.dislikes || '';
            document.getElementById('p-app').value = pDet.app || '';
            document.getElementById('p-bg').value = pDet.bg || '';

            editingNpcs = JSON.parse(JSON.stringify(p.npcs || []));
            if(editingNpcs.length === 0) { editingNpcs.push({ id: 'npc_legacy', name: p.targetName || '未知目標', avatar: p.targetAvatar || emptyAvatar, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: p.targetPersona || '' }, affection: 0 }); } 
            else { editingNpcs.forEach(n => { if (n.affection === undefined) n.affection = 0; if(!n.details) n.details = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' }; }); }
            
            editingScenarios = JSON.parse(JSON.stringify(p.scenarios || []));
            if(editingScenarios.length === 0) editingScenarios.push({name: '預設場景', lore: '', npcRoles: '', playerRole: '', transitionRule: ''});
            
renderNpcList(); renderScenarioList();
initTextareas();
renderDesktopPresetOverview();
updateSetupCurrentPresetLabel();
clearEditScenarioDirty();
}

        function createNewPreset() {
            const newId = 'preset_' + Date.now();
            scenarioPresets[newId] = { 
                id: newId, presetName: '新劇本配置', playerName: '玩家', playerAvatar: emptyAvatar, languageMode: 'zh-tw', gameDifficulty: 'standard', playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
                playerStats: {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10},
                isLocked: false, 
                statsLocked: false,
                npcs: [{ id: 'npc_1', name: '新角色', avatar: emptyAvatar, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' }, affection: 0 }],
                scenarios: [{name: '主情境', lore: '', npcRoles: '', playerRole: '', transitionRule: ''}] 
            };
            activePresetId = newId; renderPresetSelector(); loadPresetToForm(newId);
        }

        function getPresetBoundSaves(presetId) {
            return Object.entries(savesData).filter(([, save]) => {
                const scenario = save?.scenario;
                if (!scenario || typeof scenario !== 'object') return false;
                return String(scenario.sourcePresetId || scenario.id || '') === String(presetId);
            });
        }

        function deleteCurrentPreset() {
            if (Object.keys(scenarioPresets).length <= 1) { alert("系統至少需要保留一組配置喔！"); return; }
            const pOld = scenarioPresets[activePresetId];
            if (pOld && pOld.isLocked) {
                alert("🔒 此配置已受玩家保護，為防誤刪無法進行操作！\n若確定要刪除，請先點擊上方解鎖。");
                return;
            }
            const boundSaves = getPresetBoundSaves(activePresetId);
            if (boundSaves.length) {
                const saveNames = boundSaves.slice(0, 6).map(([, save]) => `• ${valueToText(save.title, save.date || '未命名紀錄')}`);
                const more = boundSaves.length > 6 ? `\n…以及另外 ${boundSaves.length - 6} 份紀錄` : '';
                alert(`無法刪除「${valueToText(pOld?.presetName, '此配置')}」。\n\n目前仍有 ${boundSaves.length} 份遊戲紀錄綁定這個配置：\n${saveNames.join('\n')}${more}\n\n請先在對應遊戲中使用「另存新配置」切換綁定，再回來刪除。`);
                return;
            }
            if (confirm(`確定要刪除「${scenarioPresets[activePresetId].presetName}」這個配置嗎？`)) {
                delete scenarioPresets[activePresetId]; activePresetId = Object.keys(scenarioPresets)[0];
                renderPresetSelector(); loadPresetToForm(activePresetId);
                persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
            }
        }

        function restoreDefaultPreset() {
            if(confirm("確定要清空當前所有輸入框的資料嗎？這將讓你獲得一張白紙來重新填寫！\n(尚未點擊儲存前，原本的配置不會被覆蓋)")) {
                const blankPreset = {
                    presetName: '空白配置',
                    playerName: '',
                    languageMode: 'zh-tw',
                    gameDifficulty: 'standard',
                    playerAvatar: emptyAvatar,
                    playerStats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                    isLocked: false, 
                    statsLocked: false,
                    playerDetails: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' },
                    npcs: [{ id: 'npc_1', name: '新角色', avatar: emptyAvatar, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' }, affection: 0 }],
                    scenarios: [{name: '主情境', lore: '', npcRoles: '', playerRole: '', transitionRule: ''}]
                };
                Object.keys(blankPreset).forEach(k => { 
                    scenarioPresets[activePresetId][k] = JSON.parse(JSON.stringify(blankPreset[k])); 
                });
                loadPresetToForm(activePresetId); 
                alert("已清空所有欄位！請開始創作；返回大廳時會自動儲存目前配置。");
            }
        }

function gatherPresetData(idToSave, nameToSave) {
 syncEditingDataFromDOM();
 const previousPreset = scenarioPresets[activePresetId] || {};
 const fallbackDetails = previousPreset.playerDetails || currentScenario.playerDetails || {};
 const playerDetailsFromDom = {
 age: document.getElementById('p-age')?.value.trim() || '',
 speech: document.getElementById('p-speech')?.value.trim() || '',
 likes: document.getElementById('p-likes')?.value.trim() || '',
 dislikes: document.getElementById('p-dislikes')?.value.trim() || '',
 app: document.getElementById('p-app')?.value.trim() || '',
 bg: document.getElementById('p-bg')?.value.trim() || ''
 };
 const hasPlayerDetailsInDom = Object.values(playerDetailsFromDom).some(Boolean);
 const safePlayerDetails = hasPlayerDetailsInDom ? playerDetailsFromDom : {
 age: fallbackDetails.age || '',
 speech: fallbackDetails.speech || '',
 likes: fallbackDetails.likes || '',
 dislikes: fallbackDetails.dislikes || '',
 app: fallbackDetails.app || '',
 bg: fallbackDetails.bg || previousPreset.playerPersona || ''
 };
 const safeNpcs = Array.isArray(editingNpcs) && editingNpcs.length
 ? editingNpcs
 : (Array.isArray(previousPreset.npcs) ? previousPreset.npcs : []);
 const safeScenarios = Array.isArray(editingScenarios) && editingScenarios.length
 ? editingScenarios
 : (Array.isArray(previousPreset.scenarios) ? previousPreset.scenarios : []);
 return {
 id: idToSave, presetName: nameToSave, 
 playerName: document.getElementById('input-player-name')?.value.trim() || previousPreset.playerName || '',
 languageMode: document.getElementById('input-language-mode')?.value || 'zh-tw',
 gameDifficulty: normalizeGameDifficulty(document.getElementById('input-game-difficulty')?.value),
 playerAvatar: document.getElementById('preview-player')?.src || previousPreset.playerAvatar || emptyAvatar,
 playerStats: readPlayerStatsFromInputs(),
 isLocked: scenarioPresets[activePresetId] ? scenarioPresets[activePresetId].isLocked : false,
 playerDetails: safePlayerDetails,
 npcs: JSON.parse(JSON.stringify(safeNpcs)),
 scenarios: JSON.parse(JSON.stringify(safeScenarios))
 };
 }

        function commitCurrentPresetSilently() {
            const pOld = scenarioPresets[activePresetId];
            if (!pOld || pOld.isLocked) return false;
            const presetName = document.getElementById('input-preset-name').value.trim() || '未命名配置';
            const p = gatherPresetData(activePresetId, presetName);
            p.statsLocked = pOld.statsLocked === true;
            scenarioPresets[activePresetId] = p;
            if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                scenarioPresets[activePresetId] = pOld;
                return false;
            }
localStorage.setItem('sanko_active_preset_id', activePresetId);
currentScenario = clonePersistentValue(p);
renderPresetSelector();
clearEditScenarioDirty();
return true;
}

        function saveCurrentPreset() {
            const pOld = scenarioPresets[activePresetId];
            if (pOld && pOld.isLocked) {
                alert("🔒 此配置已受玩家保護，無法進行覆蓋儲存！\n若要修改，請先點擊上方解鎖。");
                return;
            }
            
            const presetName = document.getElementById('input-preset-name').value.trim() || '未命名配置'; 
            const p = gatherPresetData(activePresetId, presetName);
            p.statsLocked = true; 
            scenarioPresets[activePresetId] = p;
            if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                if (pOld) scenarioPresets[activePresetId] = pOld;
                else delete scenarioPresets[activePresetId];
                return;
            }
localStorage.setItem('sanko_active_preset_id', activePresetId);
currentScenario = clonePersistentValue(p);
clearEditScenarioDirty();
renderPresetSelector();
renderDesktopGameSettings();
            
            const statInputs = document.querySelectorAll('.stat-input');
            statInputs.forEach(input => input.disabled = true);
            document.getElementById('btn-roll-stats').style.display = 'none';
            document.getElementById('btn-respec-stats').style.display = 'inline-block';
            
alert(uiText('當前配置變更已成功儲存！基礎屬性已被鎖定！'));
        }

        function saveAsNewPreset() {
            const newId = 'preset_' + Date.now(); 
            const currentName = document.getElementById('input-preset-name').value.trim(); 
            const defaultName = currentName ? currentName + ' (另存)' : '未命名配置 (另存)';
            
 const userInput = prompt(uiText('另存配置：請輸入新的配置檔名'), defaultName);
            if (userInput === null) return; 
            
            const newPresetName = userInput.trim() || defaultName;
            document.getElementById('input-preset-name').value = newPresetName;

            const p = gatherPresetData(newId, newPresetName); 
            p.isLocked = false; 
            p.statsLocked = true;
            const previousActiveId = activePresetId;
            scenarioPresets[newId] = p;
            activePresetId = newId;
            if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                delete scenarioPresets[newId];
                activePresetId = previousActiveId;
                return;
            }
            localStorage.setItem('sanko_active_preset_id', activePresetId);
currentScenario = clonePersistentValue(p); renderPresetSelector(); loadPresetToForm(newId); alert(uiText('已另存新檔為「{name}」！基礎屬性已被鎖定！').replace('{name}', newPresetName));
        }

function cancelEdit() {
if (document.getElementById('edit-scenario-screen')?.classList.contains('random-generator-inline-open')) closeRandomGenerator();
syncEditingDataFromDOM();
commitCurrentPresetSilently();
clearEditScenarioDirty();
document.getElementById('edit-scenario-screen').style.display = 'none';
document.getElementById('setup-screen').style.display = 'flex';
updateSetupCurrentPresetLabel();
}

        async function deleteAllData() {
            if(!confirm("警告：這將會清除設備上儲存的 API 金鑰、照片設定與所有劇本存檔！\n此操作無法復原！")) return;
            await indexedWriteQueue;
            await clearIndexedGameData();
            Object.keys(localStorage).filter(key => key.startsWith('sanko_')).forEach(key => localStorage.removeItem(key));
            location.reload();
        }

        /* ==== 遊戲內面板功能模組化 ==== */
        function syncDomToCurrentScenario() {
            currentStorySummary = formatBulletListText(document.getElementById('ui-story-summary')?.value, '', true);
            const taskContainer = document.getElementById('ui-open-tasks');
            if (taskContainer?.dataset.rendered === 'true') currentOpenTasks = serializeTaskChecklist(readTaskChecklistFromDom());
            currentRelationshipSummary = formatBulletListText(document.getElementById('ui-relationship-summary')?.value, '', true);
            
            // 同步 Player Details
            if (!currentScenario.playerDetails) currentScenario.playerDetails = {};
            const ePage = document.getElementById('edit-p-age');
            if (ePage) currentScenario.playerDetails.age = ePage.value;
            const ePspeech = document.getElementById('edit-p-speech');
            if (ePspeech) currentScenario.playerDetails.speech = ePspeech.value;
            const ePlikes = document.getElementById('edit-p-likes');
            if (ePlikes) currentScenario.playerDetails.likes = ePlikes.value;
            const ePdislikes = document.getElementById('edit-p-dislikes');
            if (ePdislikes) currentScenario.playerDetails.dislikes = ePdislikes.value;
            const ePapp = document.getElementById('edit-p-app');
            if (ePapp) currentScenario.playerDetails.app = ePapp.value;
            const ePbg = document.getElementById('edit-p-bg');
            if (ePbg) currentScenario.playerDetails.bg = ePbg.value;
            currentScenario.playerDynamic = syncDynamicStateFromDom('edit-p-state', currentScenario.playerDynamic);

            // 同步 NPCs
            currentScenario.npcs.forEach((n, idx) => {
                if (!n.details) n.details = {};
                const eNname = document.getElementById(`edit-n-name-${idx}`);
                if (eNname) n.name = eNname.value;
                const eNaffection = document.getElementById(`edit-n-aff-${idx}`);
                if (eNaffection && !isNpcDead(n)) n.affection = clampAffectionValue(eNaffection.value, n.affection);
                const eNage = document.getElementById(`edit-n-age-${idx}`);
                if (eNage) n.details.age = eNage.value;
                const eNspeech = document.getElementById(`edit-n-speech-${idx}`);
                if (eNspeech) n.details.speech = eNspeech.value;
                const eNlikes = document.getElementById(`edit-n-likes-${idx}`);
                if (eNlikes) n.details.likes = eNlikes.value;
                const eNdislikes = document.getElementById(`edit-n-dislikes-${idx}`);
                if (eNdislikes) n.details.dislikes = eNdislikes.value;
                const eNapp = document.getElementById(`edit-n-app-${idx}`);
                if (eNapp) n.details.app = eNapp.value;
                const eNbg = document.getElementById(`edit-n-bg-${idx}`);
                if (eNbg) n.details.bg = eNbg.value;
                n.dynamic = syncDynamicStateFromDom(`edit-n-state-${idx}`, n.dynamic);
            });

            // 同步 Scenarios
            currentScenario.scenarios.forEach((sc, idx) => {
                const eSName = document.getElementById(`edit-scen-name-${idx}`);
                if(eSName) sc.name = eSName.value;
                const eSLore = document.getElementById(`edit-scen-lore-${idx}`);
                if(eSLore) sc.lore = eSLore.value;
                const eSNpcs = document.getElementById(`edit-scen-npcs-${idx}`);
                if(eSNpcs) sc.npcRoles = eSNpcs.value;
                const eSPlayer = document.getElementById(`edit-scen-player-${idx}`);
                if(eSPlayer) sc.playerRole = eSPlayer.value;
                const eSTransition = document.getElementById(`edit-scen-transition-${idx}`);
                if(eSTransition) sc.transitionRule = eSTransition.value;
            });
        }

        function modalAddNpc() {
            syncDomToCurrentScenario();
            currentScenario.npcs.push({ id: 'npc_' + Date.now(), name: '新角色', avatar: emptyAvatar, affection: 0, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' } });
            openStatusModal();
        }

        function modalDeleteNpc(idx) {
            if(currentScenario.npcs.length <= 1) { alert("至少要保留一位 NPC 喔！"); return; }
            if(confirm("確定要刪除這位 NPC 嗎？")) {
                syncDomToCurrentScenario();
                currentScenario.npcs.splice(idx, 1);
                openStatusModal();
            }
        }

        function modalAddScenario() {
            syncDomToCurrentScenario();
            currentScenario.scenarios.push({name: '新情境', lore: '', npcRoles: '', playerRole: '', transitionRule: ''});
            chatScripts.push([]);
            openStatusModal();
        }

        function modalDeleteScenario(idx) {
            if(currentScenario.scenarios.length <= 1) { alert("至少要保留一個情境喔！"); return; }
            if(idx === currentScenarioIndex) { alert("無法刪除當前所在的情境！請先返回遊戲切換到其他情境後，再來進行刪除。"); return; }
            
            if(confirm("確定要刪除這個情境嗎？對應的對話紀錄也會被連帶刪除！")) {
                syncDomToCurrentScenario();
                currentScenario.scenarios.splice(idx, 1);
                chatScripts.splice(idx, 1);
                
                if (currentScenarioIndex > idx) {
                    currentScenarioIndex--;
                    currentChatPageIndex--;
                }
                openStatusModal();
            }
        }

        function modalRespecStats() {
            let rCount = savesData[currentSaveId].respecCount !== undefined ? savesData[currentSaveId].respecCount : 3;
            if (rCount <= 0) return;
            
            if(confirm(`【系統提示：靈魂重鑄】\n\n確定要重新隨機洗點嗎？\n注意：此存檔目前剩餘 ${rCount} 次洗點機會！`)) {
                syncDomToCurrentScenario();
                currentScenario.playerStats = rollPlayerStatSetAtCap();
                
                savesData[currentSaveId].respecCount = rCount - 1;
                saveCurrentProgress();
                openStatusModal();
                alert("洗點成功！你的能力值已重新分配。");
            }
        }

        function saveAsNewPresetFromModal() {
            try {
                syncDomToCurrentScenario(); 
                const currentName = currentScenario.presetName || "未命名配置";
                const defaultName = currentName + ' (新進度另存)';
                const userInput = prompt("請為這份新的系統大廳配置命名：", defaultName);
                if (userInput === null) return; 
                
                const newPresetName = userInput.trim() || defaultName;
                const newId = 'preset_' + Date.now();
                
                let newPreset = createPresetSnapshotFromScenario(currentScenario);
                newPreset.id = newId;
                newPreset.presetName = newPresetName;
                newPreset.isLocked = false;
                newPreset.statsLocked = true;
                
                scenarioPresets[newId] = newPreset;
                if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                    delete scenarioPresets[newId];
                    return;
                }
                
 // 將當前遊戲數據綁定到新配置 ID
 activePresetId = newId;
 localStorage.setItem('sanko_active_preset_id', activePresetId);
 currentScenario.sourcePresetId = newId;
 currentScenario.presetName = newPresetName;
 
 saveCurrentProgress(); 
 renderPresetSelector();
 updateSetupCurrentPresetLabel();
 alert(`已將目前的角色核心設定與情境資料另存為新配置「${newPresetName}」！\n動態狀態與冒險進度只保留在目前存檔中。`);
            } catch (e) {
                console.error(e);
                alert("儲存時發生錯誤：" + e.message);
            }
        }

        function openStatusModal() {
            if(!currentSaveId) return;
            currentStorySummary = formatBulletListText(currentStorySummary, '', true);
            currentOpenTasks = serializeTaskChecklist(currentOpenTasks);
            currentRelationshipSummary = formatBulletListText(currentRelationshipSummary, '', true);
            currentAdventureLog = formatBulletListText(currentAdventureLog, "• 故事剛開始，目前尚無重大事件發生。");
            document.getElementById('ui-story-summary').value = currentStorySummary;
            renderTaskChecklist(currentOpenTasks);
            document.getElementById('ui-relationship-summary').value = currentRelationshipSummary;
            setLanguageModeControls(currentScenario.languageMode || 'zh-tw');
            
            const pStats = currentScenario.playerStats || {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10};
            let pDet = currentScenario.playerDetails || { age: '', speech: '', likes: '', dislikes: '', app: '', bg: currentScenario.playerPersona || '' };
            currentScenario.playerDynamic = normalizeDynamicState(currentScenario.playerDynamic);
            const pDynamic = currentScenario.playerDynamic;
            const pDynamicPreview = getDynamicStatePreview(pDynamic);

                        let rCount = Math.max(0, Number.parseInt(savesData[currentSaveId].respecCount, 10));
            if (!Number.isFinite(rCount)) rCount = 3;
            // 改為單純的骷髏頭按鈕，長按或游標懸停會顯示剩餘次數
            let respecBtnHtml = rCount > 0 
                ? `<button onclick="modalRespecStats()" title="找守墓人洗點 (剩餘 ${rCount} 次)" class="u-inline-065">💀</button>` 
                : `<span title="洗點次數已用盡" class="u-inline-066">💀</span>`;

                        // Player Section 完美還原圖3排版
            let statsHtml = `
            <div class="u-inline-067">
                <div class="u-inline-068">
                    <span class="u-inline-069">玩家：${escapeStatusHtml(currentScenario.playerName)}</span>
                    <span class="u-inline-070">${respecBtnHtml}</span>
                </div>

                ${pDynamicPreview ? `<div class="player-dynamic-preview">目前：${escapeStatusHtml(pDynamicPreview)}</div>` : ''}
                <div class="u-inline-071">
                    <span>[力量STR: ${pStats.str}]</span>
                    <span>[敏捷DEX: ${pStats.dex}]</span>
                    <span>[體質CON: ${pStats.con}]</span>
                    <span>[智力INT: ${pStats.int}]</span>
                    <span>[感知WIS: ${pStats.wis}]</span>
                    <span>[魅力CHA: ${pStats.cha}]</span>
                </div>
            </div>
            
            <details class="dark-card u-inline-072">
                <summary>
                    <div class="summary-left">
                        <span class="summary-name">編輯玩家細節設定</span>
                    </div>
                </summary>
                <div class="dark-card-content anime-sheet u-inline-073">
                    <div><label>年齡 / 身高 / 體型</label><input type="text" id="edit-p-age" value="${escapeStatusHtml(pDet.age)}"></div>
                    <div><label>說話習慣 / 語氣</label><input type="text" id="edit-p-speech" value="${escapeStatusHtml(pDet.speech)}"></div>
                    <div><label>喜歡的事物</label><input type="text" id="edit-p-likes" value="${escapeStatusHtml(pDet.likes)}"></div>
                    <div><label>討厭的事物</label><input type="text" id="edit-p-dislikes" value="${escapeStatusHtml(pDet.dislikes)}"></div>
                    <div class="full"><label>外貌特徵 / 常見穿搭</label><textarea id="edit-p-app" rows="1" oninput="autoResize(this)">${escapeStatusHtml(pDet.app)}</textarea></div>
                    <div class="full"><label>核心性格 / 背景故事</label><textarea id="edit-p-bg" rows="1" oninput="autoResize(this)">${escapeStatusHtml(pDet.bg)}</textarea></div>
                    ${renderDynamicStateEditor('edit-p-state', pDynamic)}
                </div>
            </details>\n`;
            
            // NPC Section
            statsHtml += `
            <div class="section-header-flex">
                <h4>${escapeStatusHtml(uiText('登場 NPC 管理'))}</h4>
                <button class="section-add-btn" onclick="modalAddNpc()">${escapeStatusHtml(uiText('+ 新增 NPC'))}</button>
            </div>`;

            currentScenario.npcs.forEach((n, idx) => {
                const affectionValue = Number(n.affection);
                const aff = Number.isFinite(affectionValue) ? affectionValue : 0;
                let nDet = n.details || { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' };
                n.dynamic = normalizeDynamicState(n.dynamic);
                const nDynamic = n.dynamic;
                const npcDead = nDynamic.isDead === true;
                const nDynamicPreview = npcDead ? '' : getDynamicStatePreview(nDynamic);
                
                statsHtml += `
                <details class="dark-card">
                    <summary>
                        <div class="summary-left">
                            <span class="summary-name"><span class="npc-summary-user-name" data-no-i18n>${escapeStatusHtml(n.name)}</span>${npcDead ? `<span class="npc-dead-badge">${getNpcDeathBadgeText(n)}</span>` : ''}</span>
                            <span class="summary-tag">♥好感: ${aff}</span>
                            ${nDynamicPreview ? `<span class="dynamic-state-preview" title="${escapeStatusHtml(nDynamicPreview)}">${escapeStatusHtml(nDynamicPreview)}</span>` : ''}
                        </div>
                    </summary>
                    <div class="dark-card-content">
                        <div class="u-inline-074">
                            <button class="delete-btn-red" onclick="modalDeleteNpc(${idx}); event.stopPropagation();">刪除</button>
                        </div>
                        <div class="anime-sheet u-inline-075">
                            <div class="full"><label>角色名稱</label><input type="text" id="edit-n-name-${idx}" value="${escapeStatusHtml(n.name)}" oninput="this.closest('details').querySelector('.npc-summary-user-name').innerText = this.value || '未命名';"></div>
                            <div><label>目前好感度${npcDead ? '（死亡後停止）' : ''}</label><input type="number" id="edit-n-aff-${idx}" min="-100" max="100" value="${clampAffectionValue(n.affection, 0)}" ${npcDead ? 'disabled' : ''}></div>
                            <div><label>年齡 / 身高 / 體型</label><input type="text" id="edit-n-age-${idx}" value="${escapeStatusHtml(nDet.age)}"></div>
                            <div><label>說話習慣 / 語氣</label><input type="text" id="edit-n-speech-${idx}" value="${escapeStatusHtml(nDet.speech)}"></div>
                            <div><label>喜歡的事物</label><input type="text" id="edit-n-likes-${idx}" value="${escapeStatusHtml(nDet.likes)}"></div>
                            <div><label>討厭的事物</label><input type="text" id="edit-n-dislikes-${idx}" value="${escapeStatusHtml(nDet.dislikes)}"></div>
                            <div class="full"><label>外貌特徵 / 常見穿搭</label><textarea id="edit-n-app-${idx}" rows="1" oninput="autoResize(this)">${escapeStatusHtml(nDet.app)}</textarea></div>
                            <div class="full"><label>核心性格 / 背景故事</label><textarea id="edit-n-bg-${idx}" rows="1" oninput="autoResize(this)">${escapeStatusHtml(nDet.bg)}</textarea></div>
                            ${renderDynamicStateEditor(`edit-n-state-${idx}`, nDynamic, { allowDeath: true })}
                        </div>
                    </div>
                </details>\n`;
            });

            // Scenario Section
            statsHtml += `
            <div class="section-header-flex">
                <h4>情境空間管理</h4>
                <button class="section-add-btn" onclick="modalAddScenario()">+ 新增情境</button>
            </div>`;

            currentScenario.scenarios.forEach((sc, idx) => {
                const isCurrent = idx === currentScenarioIndex ? `<span class="summary-tag">當前</span>` : '';
                statsHtml += `
                <details class="dark-card">
                    <summary>
                        <div class="summary-left">
                            <span class="summary-name">情境：${escapeStatusHtml(sc.name || '未命名')}</span>
                            ${isCurrent}
                        </div>
                    </summary>
                    <div class="dark-card-content">
                        <div class="u-inline-074">
                            <button class="delete-btn-red" onclick="modalDeleteScenario(${idx}); event.stopPropagation();">刪除</button>
                        </div>
                        <div class="scenario-label">情境名稱</div>
                        <input type="text" id="edit-scen-name-${idx}" class="scenario-input" value="${escapeStatusHtml(sc.name)}" oninput="this.closest('details').querySelector('.summary-name').innerText = '情境：' + (this.value || '未命名');">
                        <div class="scenario-label">環境法則與世界觀</div>
                        <textarea id="edit-scen-lore-${idx}" class="scenario-input" oninput="autoResize(this)">${escapeStatusHtml(sc.lore)}</textarea>
                        <div class="scenario-label">NPC 們在此的身分/狀態</div>
                        <textarea id="edit-scen-npcs-${idx}" class="scenario-input" oninput="autoResize(this)">${escapeStatusHtml(sc.npcRoles || '')}</textarea>
                        <div class="scenario-label">玩家在此的身分/狀態</div>
                        <input type="text" id="edit-scen-player-${idx}" class="scenario-input" value="${escapeStatusHtml(sc.playerRole || '')}">
                        <div class="scenario-label">轉場規則（選填）</div>
                        <textarea id="edit-scen-transition-${idx}" class="scenario-input" placeholder="例如：從遊戲世界切回時視為登出。" oninput="autoResize(this)">${escapeStatusHtml(sc.transitionRule || '')}</textarea>
                    </div>
                </details>`;
            });

            document.getElementById('ui-stats-display').innerHTML = statsHtml;
            
            renderStatusSummary(); renderFlags(); renderItems(); renderApiUsageStats();
            setStatusPanelOpen(true);
            updateStatusSaveButtonLabel();
            switchStatusTab(activeStatusTab);
            initTextareas();
        }

        function setStatusPanelOpen(isOpen) {
            const statusModal = document.getElementById('status-modal');
            if (!statusModal) return;
            statusModal.style.display = isOpen ? 'block' : 'none';
            document.body.classList.toggle('status-panel-open', Boolean(isOpen));
            if (isOpen) statusModal.scrollTop = 0;
        }

        function shouldKeepStatusPanelOpenAfterSave() {
            return window.matchMedia('(min-width: 1100px)').matches
                && document.getElementById('game-container')?.style.display === 'flex';
        }

        function updateStatusSaveButtonLabel() {
            const button = document.getElementById('status-save-btn');
            if (button) button.textContent = shouldKeepStatusPanelOpenAfterSave() ? '儲存' : '儲存並返回';
        }

        function collapseStatusPanel() {
            const statusModal = document.getElementById('status-modal');
            if (!statusModal || statusModal.style.display !== 'block') return;
            try {
                syncDomToCurrentScenario();
                saveCurrentProgress();
            } catch (error) {
                console.warn('收回角色面板時背景儲存失敗', error);
            }
            setStatusPanelOpen(false);
        }

        function toggleStatusPanel() {
            const statusModal = document.getElementById('status-modal');
            if (statusModal?.style.display === 'block') collapseStatusPanel();
            else openStatusModal();
        }

        function saveStatusModal() {
            try {
                syncDomToCurrentScenario();
                if (!saveCurrentProgress()) return; // 存檔未成功時禁止繼續覆寫大廳配置
                
                // 雙向同步：覆寫回大廳的原始配置檔
                let sourceId = currentScenario.sourcePresetId || currentScenario.id;
                if (sourceId && scenarioPresets[sourceId]) {
                    if (scenarioPresets[sourceId].isLocked) {
                        alert(`【系統提醒】\n因為大廳的配置 [${scenarioPresets[sourceId].presetName}] 已上鎖 (🔒)，\n本次變更僅儲存於「當前遊戲紀錄」中，不會覆蓋回大廳。\n(若要覆蓋回大廳，請先至大廳解鎖，或使用另存新配置)`);
                    } else {
                        let syncPreset = createPresetSnapshotFromScenario(currentScenario, scenarioPresets[sourceId]);
                        syncPreset.id = sourceId;
                        syncPreset.presetName = scenarioPresets[sourceId].presetName; 
                        syncPreset.isLocked = false; 
                        syncPreset.statsLocked = scenarioPresets[sourceId].statsLocked !== undefined ? scenarioPresets[sourceId].statsLocked : true;
                        const previousPreset = scenarioPresets[sourceId];
                        scenarioPresets[sourceId] = syncPreset;
                        if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
                            scenarioPresets[sourceId] = previousPreset;
                            return;
                        }
                    }
                }
                
                // 同步更新選擇框中的情境名稱與選單
                const locSelect = document.getElementById('btn-location');
                if(locSelect) {
                    locSelect.innerHTML = '';
                    currentScenario.scenarios.forEach((sc, i) => {
                        const opt = document.createElement('option'); opt.value = i; opt.innerText = `📍 ${sc.name}`;
                        if(i === currentScenarioIndex) opt.selected = true; locSelect.appendChild(opt);
                    });
                }

                if (shouldKeepStatusPanelOpenAfterSave()) {
                    renderStatusSummary();
                    renderFlags();
                    renderItems();
                    updateStatusSaveButtonLabel();
                } else {
                    setStatusPanelOpen(false);
                }
            } catch (e) {
                console.error(e);
                alert("儲存時發生錯誤：" + e.message);
            }
        }

        window.addEventListener('resize', () => {
            if (document.getElementById('status-modal')?.style.display === 'block') updateStatusSaveButtonLabel();
        });

        function renderFlags() {
            const container = document.getElementById('ui-flags-container'); container.innerHTML = '';
            const budgetNote = document.getElementById('flags-budget-note');
            const normalizedFlags = [];
            currentFlags.forEach(flag => {
                const clean = cleanStoredFlagText(flag);
                if (clean && !normalizedFlags.includes(clean)) normalizedFlags.push(clean);
            });
            currentFlags = normalizedFlags;
            if (budgetNote) {
                const omitted = Math.max(0, currentFlags.length - MAX_FLAGS_FOR_PROMPT);
                budgetNote.textContent = omitted
                    ? `已保存 ${currentFlags.length} 個 Flags；AI 每回合優先讀取 ${MAX_FLAGS_FOR_PROMPT} 個（含生存狀態、最早重要項目與最近項目），其餘仍完整保留。`
                    : `已保存 ${currentFlags.length} / ${MAX_STORED_FLAGS} 個 Flags；目前全部都會提供給 AI。`;
                budgetNote.classList.toggle('warning', omitted > 0 || currentFlags.length >= MAX_STORED_FLAGS);
            }
            if(currentFlags.length === 0) { container.innerHTML = '<span class="u-inline-076">尚未解鎖任何標籤...</span>'; return; }
            currentFlags.forEach((flag, index) => {
                const cleanFlag = cleanStoredFlagText(flag);

                const tag = document.createElement('div');
                tag.className = 'flag-tag';
                tag.appendChild(document.createTextNode(`${cleanFlag} `));

                const removeButton = document.createElement('span');
                removeButton.innerText = '✖';
                removeButton.title = '刪除此標籤';
                removeButton.setAttribute('role', 'button');
                removeButton.setAttribute('tabindex', '0');
                removeButton.onclick = () => removeFlag(index);
                removeButton.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') removeFlag(index); };
                tag.appendChild(removeButton);
                container.appendChild(tag);
            });
        }

        function cleanStoredFlagText(value) {
            return valueToText(value)
                .replace(/^\[[^\]]+\]\s*/, '')
                .replace(/^狀態[：:]\s*/, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function normalizeFlagText(value) {
            return cleanStoredFlagText(value).slice(0, MAX_FLAG_CHARS);
        }

        function getFlagsForPrompt() {
            const allFlags = [];
            currentFlags.map(normalizeFlagText).filter(Boolean).forEach(flag => {
                if (!allFlags.includes(flag)) allFlags.push(flag);
            });
            if (!allFlags.length) return '目前尚無。';
            let selectedFlags = allFlags;
            if (allFlags.length > MAX_FLAGS_FOR_PROMPT) {
                const autoFlags = allFlags.filter(flag => AUTO_SURVIVAL_FLAG_SET.has(flag));
                const regularFlags = allFlags.filter(flag => !AUTO_SURVIVAL_FLAG_SET.has(flag));
                const earliest = regularFlags.slice(0, Math.min(4, regularFlags.length));
                const remainingSlots = Math.max(0, MAX_FLAGS_FOR_PROMPT - autoFlags.length - earliest.length);
                const recent = remainingSlots > 0 ? regularFlags.slice(-remainingSlots) : [];
                selectedFlags = [];
                [...autoFlags, ...earliest, ...recent].forEach(flag => {
                    if (!selectedFlags.includes(flag) && selectedFlags.length < MAX_FLAGS_FOR_PROMPT) selectedFlags.push(flag);
                });
            }
            const omitted = Math.max(0, allFlags.length - selectedFlags.length);
            return `${selectedFlags.map(flag => `[狀態/成就] ${flag}`).join('\n')}${omitted ? `\n（另有 ${omitted} 個較舊 Flags 完整保留於角色面板；重要歷史應以摘要為準。）` : ''}`;
        }

        function manualAddFlag() {
            const input = document.getElementById('new-flag-input');
            const val = normalizeFlagText(input?.value);
            if (!val || currentFlags.includes(val)) return;
            if (currentFlags.length >= MAX_STORED_FLAGS) {
                alert(`Flags 已達 ${MAX_STORED_FLAGS} 個，請先刪除或合併較舊項目再新增。`);
                return;
            }
            currentFlags.push(val);
            if (input) input.value = '';
            renderFlags();
            saveCurrentProgress();
        }

        function removeFlag(index) { currentFlags.splice(index, 1); renderFlags(); saveCurrentProgress(); }

        function removeItem(index) {
            if (!Number.isInteger(index) || index < 0 || index >= currentItems.length) return;
            currentItems.splice(index, 1);
            renderItems();
            saveCurrentProgress();
        }

        function renderItems() {
            const container = document.getElementById('ui-items-container'); container.innerHTML = '';
            if(currentItems.length === 0) { container.innerHTML = '<span class="u-inline-076">背包空空如也...</span>'; return; }
            currentItems.forEach((item, index) => {
                const tag = document.createElement('div');
                tag.className = 'item-tag';

                const label = document.createElement('span');
                label.innerText = item;

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'item-remove-btn';
                removeButton.innerText = '×';
                removeButton.title = `刪除道具：${item}`;
                removeButton.setAttribute('aria-label', `刪除道具：${item}`);
                removeButton.onclick = () => removeItem(index);

                tag.append(label, removeButton);
                container.appendChild(tag);
            });
        }

        function refreshOpenStatusPanel() {
            const modal = document.getElementById('status-modal');
            if (!modal || modal.style.display !== 'block') return;
            const panelHasFocus = document.activeElement?.closest?.('#status-modal-content');
            if (panelHasFocus) {
                renderStatusSummary();
                renderFlags();
                renderItems();
                return;
            }
            const scroller = document.querySelector('#status-modal-content > .u-inline-012');
            const scrollTop = scroller?.scrollTop || 0;
            openStatusModal();
            const refreshedScroller = document.querySelector('#status-modal-content > .u-inline-012');
            if (refreshedScroller) refreshedScroller.scrollTop = scrollTop;
        }

        document.getElementById('status-modal')?.addEventListener('click', event => {
            if (event.target === event.currentTarget) collapseStatusPanel();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && document.getElementById('status-modal')?.style.display === 'block') collapseStatusPanel();
            if ((event.key === 'Enter' || event.key === ' ') && event.target?.id === 'floating-menu-btn') {
                event.preventDefault();
                toggleStatusPanel();
            }
        });

        function getAdventureJournalSaveKeys() {
            return Object.keys(savesData).filter(id => savesData[id] && typeof savesData[id] === 'object' && !Array.isArray(savesData[id]))
                .sort((a, b) => String(b).localeCompare(String(a)));
        }

function openAdventureJournal(preferredSaveId = '') {
const gameVisible = document.getElementById('game-container')?.style.display === 'flex';
const saveMenuVisible = document.getElementById('save-menu-screen')?.style.display === 'flex';
const setupHomeVisible = canUseSetupHomeView();
journalReturnTarget = gameVisible ? 'game' : (saveMenuVisible ? 'save-menu' : (setupHomeVisible ? 'setup-home' : 'setup'));
if (gameVisible && currentSaveId) {
const statusModal = document.getElementById('status-modal');
if (statusModal?.style.display === 'block') syncDomToCurrentScenario();
saveCurrentProgress();
                const host = document.getElementById('inline-journal-host');
                const journalScreen = document.getElementById('journal-screen');
                if (host && journalScreen) {
                    host.appendChild(journalScreen);
                    journalScreen.classList.add('journal-screen-embedded');
                    journalScreen.style.display = 'flex';
                    journalEmbedded = true;
                    document.getElementById('status-page-log')?.classList.add('journal-inline-open');
                    const toggleButton = document.getElementById('inline-journal-toggle-btn');
                    if (toggleButton) toggleButton.textContent = '收起完整冒險日誌';
const closeButton = document.getElementById('journal-close-btn');
if (closeButton) closeButton.textContent = '收起';
}
} else if (setupHomeVisible) {
if (embedJournalInSetupHome()) showHomeInfoView('journal');
} else {
['setup-screen', 'edit-scenario-screen', 'save-menu-screen', 'game-container'].forEach(id => {
const el = document.getElementById(id);
if (el) el.style.display = 'none';
                });
                document.getElementById('journal-screen').style.display = 'flex';
            }
            const keys = getAdventureJournalSaveKeys();
            journalSelectedSaveId = journalEmbedded && currentSaveId && savesData[currentSaveId]
                ? String(currentSaveId)
                : ((preferredSaveId && savesData[preferredSaveId])
                    ? String(preferredSaveId)
                    : (journalSelectedSaveId && savesData[journalSelectedSaveId] ? journalSelectedSaveId : (keys[0] || '')));
            journalPageIndex = 0;
            journalSearchText = '';
            const search = document.getElementById('journal-search');
            if (search) search.value = '';
            renderAdventureJournalSaveSelector();
            renderAdventureJournal();
            if (!journalEmbedded) window.scrollTo(0, 0);
        }

        function toggleInlineAdventureJournal(preferredSaveId = '') {
            if (journalEmbedded) closeAdventureJournal();
            else openAdventureJournal(preferredSaveId);
        }

function closeAdventureJournal() {
document.getElementById('journal-edit-modal').style.display = 'none';
const journalScreen = document.getElementById('journal-screen');
journalScreen.style.display = 'none';
if (journalScreen.classList.contains('journal-screen-home-embedded')) {
restoreJournalFromSetupHome();
showHomeInfoView('main');
return;
}
if (journalEmbedded) {
journalScreen.classList.remove('journal-screen-embedded');
document.getElementById('journal-screen-home')?.after(journalScreen);
journalEmbedded = false;
                document.getElementById('status-page-log')?.classList.remove('journal-inline-open');
                const toggleButton = document.getElementById('inline-journal-toggle-btn');
                if (toggleButton) toggleButton.textContent = '開啟完整冒險日誌';
                const closeButton = document.getElementById('journal-close-btn');
                if (closeButton) closeButton.textContent = '返回';
                return;
            }
            if (journalReturnTarget === 'game' && currentSaveId) {
                document.getElementById('game-container').style.display = 'flex';
                updatePlayerInputPlaceholder();
                return;
            }
            if (journalReturnTarget === 'save-menu') {
                document.getElementById('save-menu-screen').style.display = 'flex';
                renderSaveList();
                return;
            }
            document.getElementById('setup-screen').style.display = 'flex';
        }

        function renderAdventureJournalSaveSelector() {
            const select = document.getElementById('journal-save-select');
            if (!select) return;
            const keys = journalEmbedded && currentSaveId && savesData[currentSaveId]
                ? [String(currentSaveId)]
                : getAdventureJournalSaveKeys();
            select.innerHTML = '';
            if (!keys.length) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '目前沒有存檔';
                select.appendChild(option);
                select.disabled = true;
                return;
            }
            select.disabled = false;
            keys.forEach(id => {
                const save = savesData[id];
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `${valueToText(save.title, '未命名紀錄')} · ${valueToText(save.date, '未知時間')}`;
                option.selected = id === journalSelectedSaveId;
                select.appendChild(option);
            });
        }

        function selectAdventureJournalSave(saveId) {
            if (journalEmbedded && String(saveId) !== String(currentSaveId)) return;
            if (!savesData[saveId]) return;
            journalSelectedSaveId = String(saveId);
            journalPageIndex = 0;
            renderAdventureJournal();
        }

        function filterAdventureJournal(value) {
            journalSearchText = valueToText(value).toLowerCase();
            journalPageIndex = 0;
            renderAdventureJournal();
        }

function getAdventureJournalEntries(saveId = journalSelectedSaveId) {
const save = savesData[saveId];
if (!save) return [];
const important = Array.isArray(save.importantJournalEntries) ? save.importantJournalEntries.map(Number) : [];
return splitAdventureLog(save.log).map((text, index) => ({ text, index, important: important.includes(index) }));
}

function toggleJournalEntryImportant(entryIndex) {
const save = savesData[journalSelectedSaveId];
if (!save) return;
const index = Number(entryIndex);
const important = Array.isArray(save.importantJournalEntries) ? save.importantJournalEntries.map(Number) : [];
const next = important.includes(index)
? important.filter(item => item !== index)
: [...important, index].sort((a, b) => a - b);
save.importantJournalEntries = next;
persistSingleSave(journalSelectedSaveId, '冒險日誌重要標記');
renderAdventureJournal();
}

        function renderAdventureJournal() {
            const list = document.getElementById('journal-entry-list');
            const meta = document.getElementById('journal-meta');
            const pageLabel = document.getElementById('journal-page-label');
            const prevButton = document.getElementById('journal-prev-btn');
            const nextButton = document.getElementById('journal-next-btn');
            const organizeButton = document.getElementById('journal-organize-btn');
            if (!list || !meta || !pageLabel) return;
            const save = savesData[journalSelectedSaveId];
            if (!save) {
                list.innerHTML = `<p class="journal-empty">${escapeStatusHtml(uiText('目前沒有可查看的冒險紀錄。'))}</p>`;
                meta.textContent = uiText('請先建立遊戲存檔。');
                pageLabel.textContent = uiText('第 0 / 0 頁');
                if (prevButton) prevButton.disabled = true;
                if (nextButton) nextButton.disabled = true;
                if (organizeButton) organizeButton.disabled = true;
                return;
            }
            if (organizeButton) organizeButton.disabled = false;
            const allEntries = getAdventureJournalEntries();
            const filteredEntries = journalSearchText
                ? allEntries.filter(entry => entry.text.toLowerCase().includes(journalSearchText))
                : allEntries;
            const pageCount = Math.max(1, Math.ceil(filteredEntries.length / JOURNAL_PAGE_SIZE));
            journalPageIndex = Math.max(0, Math.min(journalPageIndex, pageCount - 1));
            const start = journalPageIndex * JOURNAL_PAGE_SIZE;
            const visibleEntries = filteredEntries.slice(start, start + JOURNAL_PAGE_SIZE);
 const locale = uiLocale();
 meta.textContent = journalSearchText
 ? uiText('找到 {filtered} / {total} 條紀錄')
 .replace('{filtered}', filteredEntries.length)
 .replace('{total}', allEntries.length)
 : uiText('共 {total} 條紀錄；每頁最多 {pageSize} 條')
 .replace('{total}', allEntries.length)
 .replace('{pageSize}', JOURNAL_PAGE_SIZE);
            pageLabel.textContent = locale === 'en' ? `Page ${journalPageIndex + 1} / ${pageCount}` : locale === 'ja' ? `${journalPageIndex + 1} / ${pageCount} ページ` : `第 ${journalPageIndex + 1} / ${pageCount} 頁`;
            if (prevButton) prevButton.disabled = journalPageIndex <= 0;
            if (nextButton) nextButton.disabled = journalPageIndex >= pageCount - 1;
            if (!visibleEntries.length) {
                list.innerHTML = `<p class="journal-empty">${escapeStatusHtml(uiText('沒有符合搜尋條件的紀錄。'))}</p>`;
                return;
            }
list.innerHTML = visibleEntries.map(entry => `
<article class="journal-entry${entry.important ? ' journal-entry-important' : ''}">
<span class="journal-entry-index">#${entry.index + 1}</span>
<p class="journal-entry-text">${escapeStatusHtml(uiJournalEntryText(entry.text))}</p>
<button class="journal-entry-star" type="button" aria-label="${entry.important ? escapeStatusHtml(uiText('取消重要標記')) : escapeStatusHtml(uiText('標記為重要'))}" title="${entry.important ? escapeStatusHtml(uiText('取消重要標記')) : escapeStatusHtml(uiText('標記為重要'))}" onclick="toggleJournalEntryImportant(${entry.index})">${entry.important ? '★' : '☆'}</button>
<button class="journal-entry-edit" type="button" onclick="openJournalEntryEditor(${entry.index})">${escapeStatusHtml(uiText('編輯'))}</button>
</article>`).join('');
}

        function changeAdventureJournalPage(delta) {
            journalPageIndex += Number(delta) || 0;
            renderAdventureJournal();
            window.scrollTo(0, 0);
        }

        function jumpAdventureJournalToLatest() {
            const entries = getAdventureJournalEntries().filter(entry => !journalSearchText || entry.text.toLowerCase().includes(journalSearchText));
            journalPageIndex = Math.max(0, Math.ceil(entries.length / JOURNAL_PAGE_SIZE) - 1);
            renderAdventureJournal();
            window.scrollTo(0, document.body.scrollHeight);
        }

        function openJournalEntryEditor(entryIndex) {
            const entries = getAdventureJournalEntries();
            const entry = entries.find(item => item.index === Number(entryIndex));
            if (!entry) return;
            journalEditingEntryIndex = entry.index;
            document.getElementById('journal-edit-text').value = entry.text;
            document.getElementById('journal-edit-modal').style.display = 'flex';
            document.getElementById('journal-edit-text').focus();
        }

        function closeJournalEntryEditor() {
            journalEditingEntryIndex = -1;
            document.getElementById('journal-edit-modal').style.display = 'none';
        }

        function saveJournalEntryEdit() {
            const save = savesData[journalSelectedSaveId];
            const entries = getAdventureJournalEntries().map(entry => entry.text);
            if (!save || journalEditingEntryIndex < 0 || journalEditingEntryIndex >= entries.length) return;
            const text = valueToText(document.getElementById('journal-edit-text').value).replace(/\s*\n+\s*/g, ' ').trim();
            if (!text) { alert('這筆紀錄不能是空白；若要移除請按「刪除此筆」。'); return; }
            entries[journalEditingEntryIndex] = stripMemoryListPrefix(text);
            save.log = formatBulletListText(entries, '• 故事剛開始，目前尚無重大事件發生。');
            save.date = new Date().toLocaleString();
            if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
            persistSingleSave(journalSelectedSaveId, '冒險日誌');
            closeJournalEntryEditor();
            renderAdventureJournal();
        }

        function deleteJournalEntryEdit() {
            const save = savesData[journalSelectedSaveId];
            const entries = getAdventureJournalEntries().map(entry => entry.text);
if (!save || journalEditingEntryIndex < 0 || journalEditingEntryIndex >= entries.length) return;
if (!confirm('確定要刪除這一筆冒險紀錄嗎？')) return;
const deletedIndex = journalEditingEntryIndex;
entries.splice(journalEditingEntryIndex, 1);
if (Array.isArray(save.importantJournalEntries)) {
save.importantJournalEntries = save.importantJournalEntries
.map(Number)
.filter(index => index !== deletedIndex)
.map(index => index > deletedIndex ? index - 1 : index);
}
save.log = formatBulletListText(entries, '• 故事剛開始，目前尚無重大事件發生。');
            save.date = new Date().toLocaleString();
            if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
            persistSingleSave(journalSelectedSaveId, '冒險日誌');
            closeJournalEntryEditor();
            renderAdventureJournal();
        }

        function chunkAdventureLog(log, maxChars = 7000) {
            const entries = splitAdventureLog(log);
            const chunks = [];
            let currentChunk = [];
            let currentLength = 0;
            entries.forEach(entry => {
                const clean = truncatePromptText(entry, 600);
                const nextLength = currentLength + clean.length + 3;
                if (currentChunk.length && nextLength > maxChars) {
                    chunks.push(currentChunk.join('\n'));
                    currentChunk = [];
                    currentLength = 0;
                }
                currentChunk.push(`• ${clean}`);
                currentLength += clean.length + 3;
            });
            if (currentChunk.length) chunks.push(currentChunk.join('\n'));
            return chunks.length ? chunks : ['• 尚無重大事件。'];
        }

        function buildSelectedJournalOrganizerPrompt(save, logChunk = '', partIndex = 0, partCount = 1) {
            const scenario = save?.scenario || {};
            const memory = save?.memoryBrief || {};
            return `你是 TRPG 冒險紀錄整理器。整理第 ${partIndex + 1}/${partCount} 段紀錄：合併本段語意重複內容，保持原順序，保留重要事實、任務結果、角色關係轉折、場景變化與重要物品異動。不得捏造或預設劇情。只輸出 JSON：{"adventure_log":["精簡事件"]}。\n玩家：${valueToText(scenario.playerName, '玩家')}\n相關角色：${(scenario.npcs || []).map(npc => npc.name).filter(Boolean).slice(0, 20).join('、') || '無'}\n既有摘要：${truncatePromptText(memory.story, 1200) || '無'}\n任務：${truncatePromptText(memory.tasks, 900) || '無'}\n關係：${truncatePromptText(memory.relationships, 900) || '無'}\n\n本段紀錄：\n${logChunk}`;
        }

        async function organizeAdventureLogWithAI(save, onProgress = null) {
            const profile = getModelRuntimeProfile();
            const chunks = chunkAdventureLog(save?.log, profile.id === 'gpt-4.1' ? 6000 : 8000);
            const organizedEntries = [];
            for (let index = 0; index < chunks.length; index += 1) {
                if (typeof onProgress === 'function') onProgress(index + 1, chunks.length);
                const prompt = buildSelectedJournalOrganizerPrompt(save, chunks[index], index, chunks.length);
                const rawText = await requestAIText(prompt, { kind: 'journal', maxTokens: profile.journalMaxTokens });
                const data = await parseMemoryOrganizerJson(rawText, prompt);
                normalizeSummaryPayload(data.adventure_log, 200, 240).forEach(entry => organizedEntries.push(entry));
            }
            return formatBulletListText(organizedEntries, '', true);
        }

        async function organizeSelectedJournalLog() {
            const save = savesData[journalSelectedSaveId];
            if (!save) return;
            if (!confirm('整理會合併語意重複的事件。系統會先保留備份，確定要繼續嗎？')) return;
            const button = document.getElementById('journal-organize-btn');
            const originalLabel = button?.innerText || '';
            if (button) { button.disabled = true; button.innerText = '整理中…'; }
            try {
                const organizedLog = await organizeAdventureLogWithAI(save, (current, total) => {
                    if (button) button.innerText = total > 1 ? `整理中 ${current}/${total}` : '整理中…';
                });
                if (!organizedLog) throw new Error('AI 沒有回傳可用的冒險紀錄。');
                if (!Array.isArray(save.memoryLogBackups)) save.memoryLogBackups = [];
                save.memoryLogBackups.push({ date: new Date().toLocaleString(), log: save.log });
                save.memoryLogBackups = save.memoryLogBackups.slice(-3);
                save.log = organizedLog;
                save.date = new Date().toLocaleString();
                if (journalSelectedSaveId === currentSaveId) currentAdventureLog = organizedLog;
                persistSingleSave(journalSelectedSaveId, '整理冒險日誌');
                journalPageIndex = 0;
                renderAdventureJournalSaveSelector();
                renderAdventureJournal();
                alert('冒險紀錄已整理完成；如不滿意可按「復原上次整理」。');
            } catch (error) {
                console.error(error);
                alert(`${getFriendlyErrorMessage(error, 'AI 暫時無法完成整理。')}\n原本內容沒有被刪除。`);
            } finally {
                if (button) { button.disabled = false; button.innerText = originalLabel; }
            }
        }

        function restoreSelectedJournalBackup() {
            const save = savesData[journalSelectedSaveId];
            const backups = Array.isArray(save?.memoryLogBackups) ? save.memoryLogBackups : [];
            if (!backups.length) { alert('這份存檔目前沒有可復原的整理備份。'); return; }
            const latest = backups[backups.length - 1];
            if (!confirm(`要復原 ${latest.date || '上一次'} 整理前的冒險紀錄嗎？`)) return;
            save.log = formatBulletListText(latest.log, '• 故事剛開始，目前尚無重大事件發生。');
            backups.pop();
            save.memoryLogBackups = backups;
            save.date = new Date().toLocaleString();
            if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
            persistSingleSave(journalSelectedSaveId, '復原冒險日誌');
            renderAdventureJournalSaveSelector();
            renderAdventureJournal();
        }

        function formatStorageBytes(bytes) {
            const value = Number(bytes) || 0;
            if (value < 1024) return `${value} B`;
            if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
            if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
            return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
        }

        async function updateStorageHealthDisplay() {
            const usageText = document.getElementById('storage-usage-text');
            const backupText = document.getElementById('storage-backup-text');
            if (!usageText || !backupText) return;
            try {
                let usage = 0;
                let quota = 0;
                if (navigator.storage?.estimate) {
                    const estimate = await navigator.storage.estimate();
                    usage = Number(estimate.usage) || 0;
                    quota = Number(estimate.quota) || 0;
                } else {
                    usage = new Blob([JSON.stringify({ savesData, scenarioPresets, apiUsageStats })]).size;
                }
                const persisted = navigator.storage?.persisted ? await navigator.storage.persisted() : false;
                const ratio = quota > 0 ? usage / quota : 0;
                const locale = uiLocale();
                usageText.textContent = quota > 0
                    ? (locale === 'en'
                        ? `Browser storage used ${formatStorageBytes(usage)} / about ${formatStorageBytes(quota)} available (${Math.round(ratio * 100)}%); ${persisted ? 'marked as less likely to be cleared automatically' : 'regular exports are still recommended'}.`
                        : locale === 'ja'
                            ? `ブラウザ使用量 ${formatStorageBytes(usage)} / 利用可能 約 ${formatStorageBytes(quota)}（${Math.round(ratio * 100)}%）；${persisted ? '自動削除されにくい状態です' : '定期的なエクスポートをおすすめします'}。`
                            : `瀏覽器目前使用 ${formatStorageBytes(usage)} / 可用約 ${formatStorageBytes(quota)}（${Math.round(ratio * 100)}%）；${persisted ? '瀏覽器已標記為較不易自動清除' : '仍建議定期匯出備份'}。`)
                    : (locale === 'en'
                        ? `Current data size is about ${formatStorageBytes(usage)}; this browser does not report available quota.`
                        : locale === 'ja'
                            ? `現在のデータ量は約 ${formatStorageBytes(usage)} です。このブラウザは空き容量の上限を提供していません。`
                            : `目前資料量約 ${formatStorageBytes(usage)}；此瀏覽器沒有提供可用容量上限。`);
                usageText.classList.toggle('backup-warning', ratio >= 0.8);
            } catch (error) {
                usageText.textContent = uiText('暫時無法取得瀏覽器容量資訊；存檔功能仍可正常使用。');
            }

            const lastBackupValue = localStorage.getItem(LAST_BACKUP_STORAGE_KEY);
            const lastBackupTime = lastBackupValue ? Date.parse(lastBackupValue) : NaN;
            const daysSinceBackup = Number.isFinite(lastBackupTime) ? Math.floor((Date.now() - lastBackupTime) / 86400000) : null;
            const hasSaves = Object.keys(savesData).length > 0;
            const overdue = hasSaves && (daysSinceBackup === null || daysSinceBackup >= BACKUP_REMINDER_DAYS);
            const locale = uiLocale();
            backupText.textContent = !hasSaves
                ? uiText('目前沒有遊戲存檔；建立存檔後會在這裡提醒備份。')
                : daysSinceBackup === null
                    ? uiText('尚未記錄到匯出備份；建議現在按下方「匯出」。')
                    : (locale === 'en'
                        ? `Last export: ${new Date(lastBackupTime).toLocaleString()} (${daysSinceBackup === 0 ? 'today' : `${daysSinceBackup} days ago`}). ${overdue ? 'Please back up again.' : 'Backup status is OK.'}`
                        : locale === 'ja'
                            ? `最終エクスポート：${new Date(lastBackupTime).toLocaleString()}（${daysSinceBackup === 0 ? '今日' : `${daysSinceBackup} 日前`}）。${overdue ? 'もう一度バックアップしてください。' : 'バックアップ状態は正常です。'}`
                            : `最近一次匯出：${new Date(lastBackupTime).toLocaleString()}（${daysSinceBackup === 0 ? '今天' : `${daysSinceBackup} 天前`}）。${overdue ? '建議再備份一次。' : '備份狀態正常。'}`);
            backupText.classList.toggle('backup-warning', overdue);
        }

function openSaveMenu() {
refreshApiCredentials();
if(!apiKey || !selectedModel) { alert(`請先驗證 ${apiProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'} 金鑰並選擇模型。`); return; }
if (canUseSetupHomeView()) {
embedSaveMenuInSetupHome();
showHomeInfoView('saves');
renderSaveList();
return;
}
document.getElementById('setup-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'none';
document.getElementById('save-menu-screen').style.display = 'flex'; renderSaveList();
}

function backToSetup() { restoreSaveMenuFromSetupHome(); restoreJournalFromSetupHome(); document.getElementById('save-menu-screen').style.display = 'none'; document.getElementById('setup-screen').style.display = 'flex'; showHomeInfoView('main'); }
function backToSaveMenu() {
saveCurrentProgress();
if (journalEmbedded) closeAdventureJournal();
const saveMenuScreen = document.getElementById('save-menu-screen');
const returnToSetupSave = saveMenuScreen?.parentElement?.id === 'setup-save-host'
&& window.matchMedia('(min-width: 1100px)').matches;
setStatusPanelOpen(false);
document.getElementById('game-container').style.display = 'none';
if (returnToSetupSave) {
document.getElementById('setup-screen').style.display = 'flex';
saveMenuScreen.style.display = 'flex';
renderSaveList();
showHomeInfoView('saves', { force: true });
return;
}
restoreSaveMenuFromSetupHome();
document.getElementById('save-menu-screen').style.display = 'flex';
renderSaveList();
}

function renderSaveList() {
const listDiv = document.getElementById('save-list');
if (!listDiv) return;
listDiv.innerHTML = '';
updateStorageHealthDisplay();
const saveKeys = Object.keys(savesData || {}).sort((a, b) => String(b).localeCompare(String(a)));
if (saveKeys.length === 0) {
window.journeySelectedSaveIds.clear();
listDiv.innerHTML = `<p class="u-inline-077">${escapeStatusHtml(uiText('目前沒有任何存檔紀錄。'))}</p>`;
updateSaveSelectAllState();
return;
}
saveKeys.forEach(id => {
const saveData = savesData[id] && typeof savesData[id] === 'object' ? savesData[id] : {};
const scenario = saveData.scenario && typeof saveData.scenario === 'object' ? saveData.scenario : {};
const pName = valueToText(scenario.playerName, uiText('玩家'));
const presetId = scenario.sourcePresetId || scenario.id || '';
const presetName = valueToText(scenarioPresets[presetId]?.presetName || scenario.presetName, uiText('未命名配置'));
let tName = '群像劇';
if (Array.isArray(scenario.npcs) && scenario.npcs.length > 0) tName = valueToText(scenario.npcs[0]?.name, tName);
if (scenario.targetName) tName = valueToText(scenario.targetName, tName);
const slotDiv = document.createElement('div');
slotDiv.className = 'save-slot';
slotDiv.onclick = event => {
if (event.target.closest('input, button, label')) return;
loadGame(id);
};
const main = document.createElement('div');
main.className = 'save-slot-main';
const titleInput = document.createElement('input');
titleInput.className = 'save-title-input save-title';
titleInput.value = valueToText(saveData.title, uiText('未命名存檔'));
titleInput.setAttribute('aria-label', uiText('修改記憶紀錄檔名'));
titleInput.onclick = event => event.stopPropagation();
titleInput.onchange = event => renameSaveTitle(id, event.target.value);
titleInput.onkeydown = event => {
if (event.key === 'Enter') {
event.preventDefault();
event.currentTarget.blur();
}
};
const info = document.createElement('div');
info.className = 'save-info';
const locale = uiLocale();
info.innerText = locale === 'en'
? `Preset: ${presetName}\nPartner/NPC: ${tName} | Player: ${pName}\nLast played: ${saveData.date || ''}`
: locale === 'ja'
? `設定：${presetName}\n相手/NPC：${tName}｜プレイヤー：${pName}\n最終プレイ：${saveData.date || ''}`
: `配置：${presetName}\n代表NPC: ${tName}｜玩家: ${pName}\n最後遊玩：${saveData.date || ''}`;
const frame = document.createElement('label');
frame.className = 'save-select-frame';
frame.setAttribute('aria-label', uiText('選取此記憶紀錄'));
frame.onclick = event => event.stopPropagation();
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.className = 'save-select-box';
checkbox.checked = window.journeySelectedSaveIds.has(String(id));
checkbox.onchange = event => toggleSaveSelection(id, event.target.checked);
main.appendChild(titleInput);
main.appendChild(info);
frame.appendChild(checkbox);
slotDiv.appendChild(main);
slotDiv.appendChild(frame);
listDiv.appendChild(slotDiv);
});
updateSaveSelectAllState();
}

        function createNewSave() {
            const defaultName = `群像劇紀錄 - ${new Date().toLocaleDateString()}`;
            
            const userInput = prompt("準備進入遊戲！請為這次存檔命名：", defaultName);
            if (userInput === null) return; 

            const saveName = userInput.trim() || defaultName;
            const id = Date.now().toString();
            const selectedPreset = scenarioPresets[activePresetId] || defaultPreset;
            const freshScenario = createFreshScenarioFromPreset(selectedPreset);
            const newSave = { title: saveName, date: new Date().toLocaleString(), hp: 100, san: 100, items: [], scenIndex: 0, chatPageIndex: 0, scripts: [[]], log: "• 故事剛開始，目前尚無重大事件發生。", memoryBrief: { story: "", tasks: "", relationships: "" }, flags: [], inputDraft: '', respecCount: 3, scenario: freshScenario };
            newSave.scenario.sourcePresetId = activePresetId;
            savesData[id] = newSave;
            if (!persistSingleSave(id, '遊戲存檔')) { delete savesData[id]; return; }
            loadGame(id); 
        }


function exportSaves() {
const hasSaves = Object.keys(savesData || {}).length > 0;
const hasPresets = Object.keys(scenarioPresets || {}).length > 0;
if (!hasSaves && !hasPresets) {
alert(uiText('目前沒有資料可以匯出。'));
return;
}
const selectedIds = getSelectedSaveIds();
const payload = buildBackupPayload(selectedIds.length ? selectedIds : null);
const scopeName = selectedIds.length ? 'Selected_Saves' : 'Backup';
downloadJsonFile(payload, `Journey_Notes_${scopeName}_${new Date().toISOString().slice(0,10)}.json`);
localStorage.setItem(LAST_BACKUP_STORAGE_KEY, new Date().toISOString());
updateStorageHealthDisplay();
}

function exportCurrentPreset() {
syncEditingDataFromDOM();
const sections = getPresetExportSections();
const sourcePreset = scenarioPresets[activePresetId]
|| gatherPresetData(activePresetId || `preset_${Date.now()}`, document.getElementById('input-preset-name')?.value?.trim() || '未命名配置');
const safePreset = filterPresetForSections(sourcePreset, sections);
const payload = {
version: 2,
type: 'journey-notes-preset',
exportedAt: new Date().toISOString(),
exportSections: sections,
preset: safePreset,
privacy: {
excludes: ['apiKeys', 'homePhoto', 'privateTokens']
}
};
const safeName = valueToText(safePreset.presetName, '未命名配置').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 48);
downloadJsonFile(payload, `Journey_Notes_Preset_${safeName}_${new Date().toISOString().slice(0,10)}.json`);
}

function importSaves(input) {
const file = input.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = event => {
try {
const importedData = JSON.parse(event.target.result);
const importedSaves = importedData.saves || importedData.savesData || {};
const importedPresets = importedData.scenarioPresets || importedData.presets || {};
if ((!importedSaves || typeof importedSaves !== 'object' || Array.isArray(importedSaves))
&& (!importedPresets || typeof importedPresets !== 'object' || Array.isArray(importedPresets))) {
throw new Error('沒有可用的存檔或角色配置');
}
let presetCount = 0;
let saveCount = 0;
const presetIdMap = {};
Object.entries(importedPresets || {}).forEach(([sourceId, rawPreset]) => {
if (!rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) return;
const preset = normalizeImportedPreset(rawPreset, { characters: true, scenarios: true });
presetIdMap[sourceId] = preset.id;
scenarioPresets[preset.id] = preset;
presetCount += 1;
});
Object.entries(importedSaves || {}).forEach(([sourceId, rawSave]) => {
if (!rawSave || typeof rawSave !== 'object' || Array.isArray(rawSave)) return;
const targetId = savesData[sourceId] ? `save_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` : sourceId;
const copiedSave = stripImagesAndPrivateData(getJsonClone(rawSave));
if (copiedSave.scenario?.sourcePresetId && presetIdMap[copiedSave.scenario.sourcePresetId]) {
copiedSave.scenario.sourcePresetId = presetIdMap[copiedSave.scenario.sourcePresetId];
}
savesData[targetId] = copiedSave;
saveCount += 1;
});
if (!saveCount && !presetCount) throw new Error('沒有可用的存檔或角色配置');
if (importedData.uiTheme && typeof importedData.uiTheme === 'object') applyUiTheme(stripImagesAndPrivateData(importedData.uiTheme), true);
if (importedData.uiLanguage && window.setUiLanguage) setUiLanguage(importedData.uiLanguage, { notify: false });
persistJson('sanko_scenario_presets_v2', scenarioPresets, '匯入角色配置');
persistJson('sanko_saves_v8', savesData, '匯入存檔');
renderPresetSelector();
renderSaveList();
alert(`匯入完成：${saveCount} 個存檔、${presetCount} 個角色配置。圖片與私密資料已略過。`);
} catch (error) {
alert(`匯入失敗：${error.message || '檔案格式不正確或已損毀。'}`);
} finally {
input.value = '';
}
};
reader.readAsText(file);
}

        function saveCurrentProgress() {
            if(!currentSaveId || !savesData[currentSaveId]) return false;
            savesData[currentSaveId].scripts = chatScripts;
            savesData[currentSaveId].chatPageIndex = currentChatPageIndex;
            savesData[currentSaveId].hp = normalizeSurvivalValue(currentHp, 100);
            savesData[currentSaveId].san = normalizeSurvivalValue(currentSan, 100);
            savesData[currentSaveId].items = currentItems;
            savesData[currentSaveId].scenIndex = currentScenarioIndex;
            savesData[currentSaveId].date = new Date().toLocaleString();
            savesData[currentSaveId].log = currentAdventureLog;
            savesData[currentSaveId].memoryBrief = {
                story: currentStorySummary,
                tasks: currentOpenTasks,
                relationships: currentRelationshipSummary
            };
            savesData[currentSaveId].flags = currentFlags;
const currentInputDraft = document.getElementById('player-input')?.value || '';
            savesData[currentSaveId].inputDraft = currentInputDraft;
            try {
                const draftKey = getInputDraftStorageKey(currentSaveId);
                if (currentInputDraft) localStorage.setItem(draftKey, currentInputDraft);
                else localStorage.removeItem(draftKey);
            } catch (error) {
                console.warn('輸入草稿暫存失敗', error);
            }
            savesData[currentSaveId].scenario = currentScenario;
            savesData[currentSaveId].sceneTransition = pendingSceneTransition;
            delete savesData[currentSaveId].script;
            return persistSingleSave(currentSaveId, '遊戲存檔');
        }

        function getInputDraftStorageKey(saveId = currentSaveId) {
            return `sanko_input_draft_${saveId || 'none'}`;
        }

        function persistActiveInputDraft() {
            if (activeInputDraftTimer) {
                clearTimeout(activeInputDraftTimer);
                activeInputDraftTimer = null;
            }
            if (!currentSaveId || !savesData[currentSaveId]) return;
            const draft = document.getElementById('player-input')?.value || '';
            savesData[currentSaveId].inputDraft = draft;
            try {
                const key = getInputDraftStorageKey();
                if (draft) localStorage.setItem(key, draft);
                else localStorage.removeItem(key);
            } catch (error) {
                console.warn('輸入草稿暫存失敗', error);
            }
        }

        function scheduleInputDraftSave(delay = 300) {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            if (activeInputDraftTimer) clearTimeout(activeInputDraftTimer);
            activeInputDraftTimer = setTimeout(persistActiveInputDraft, delay);
        }

        function syncVisibleGameEditsForSave() {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            const statusModal = document.getElementById('status-modal');
            if (statusModal?.style.display === 'block') syncDomToCurrentScenario();
        }

        function flushActiveGameSave() {
            if (activeGameSaveTimer) {
                clearTimeout(activeGameSaveTimer);
                activeGameSaveTimer = null;
            }
            if (!currentSaveId || !savesData[currentSaveId]) return;
            try {
                persistActiveInputDraft();
                syncVisibleGameEditsForSave();
                saveCurrentProgress();
            } catch (error) {
                console.warn('背景自動存檔失敗', error);
            }
        }

        function flushLifecycleGameSave() {
            const now = Date.now();
            if (now - lastLifecycleSaveAt < 700) return;
            lastLifecycleSaveAt = now;
            flushActiveGameSave();
        }

        function scheduleActiveGameSave(delay = 900) {
            if (!currentSaveId || !savesData[currentSaveId]) return;
            if (activeGameSaveTimer) clearTimeout(activeGameSaveTimer);
            activeGameSaveTimer = setTimeout(flushActiveGameSave, delay);
        }

        document.addEventListener('input', event => {
            if (event.target?.id === 'player-input') scheduleInputDraftSave();
            else if (event.target?.closest?.('#status-modal-content')) scheduleActiveGameSave();
        }, true);
        document.addEventListener('change', event => {
            if (event.target?.id === 'player-input') scheduleInputDraftSave(100);
            else if (event.target?.closest?.('#status-modal-content')) scheduleActiveGameSave(250);
        }, true);
        document.addEventListener('paste', event => {
            if (event.target?.id === 'player-input') setTimeout(() => scheduleInputDraftSave(100), 0);
            else if (event.target?.closest?.('#status-modal-content')) setTimeout(() => scheduleActiveGameSave(250), 0);
        }, true);
        document.addEventListener('compositionend', event => {
            if (event.target?.id === 'player-input') scheduleInputDraftSave(100);
            else if (event.target?.closest?.('#status-modal-content')) scheduleActiveGameSave(250);
        }, true);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flushLifecycleGameSave();
            else retryPendingIndexedWrites();
        });
        window.addEventListener('pagehide', flushLifecycleGameSave);
        window.addEventListener('pageshow', retryPendingIndexedWrites);

        function openMidGameScenarioModal() {
            document.getElementById('mid-scen-name').value = '';
            document.getElementById('mid-scen-lore').value = '';
            document.getElementById('mid-scen-npcs').value = '';
            document.getElementById('mid-scen-player').value = '';
            document.getElementById('mid-scen-transition').value = '';
            document.getElementById('midgame-scen-modal').style.display = 'flex';
        }

        function confirmMidGameScenario() {
            const name = document.getElementById('mid-scen-name').value.trim() || '未知領域';
            const lore = document.getElementById('mid-scen-lore').value.trim();
            const npcRoles = document.getElementById('mid-scen-npcs').value.trim();
            const playerRole = document.getElementById('mid-scen-player').value.trim();
            const transitionRule = document.getElementById('mid-scen-transition').value.trim();
            
            const newScen = { name, lore, npcRoles, playerRole, transitionRule };
            currentScenario.scenarios.push(newScen);
            const newIndex = currentScenario.scenarios.length - 1;
            chatScripts[newIndex] = []; 
            
            const locSelect = document.getElementById('btn-location');
            const opt = document.createElement('option');
            opt.value = newIndex;
            opt.innerText = `📍 ${name}`;
            locSelect.appendChild(opt);
            
            document.getElementById('midgame-scen-modal').style.display = 'none';
            changeScenario(newIndex); 
        }

        function getSystemInstruction() {
            syncSurvivalFlags({ announce: false });
            const currentScen = currentScenario.scenarios[currentScenarioIndex];
            const flagsText = getFlagsForPrompt();
            const itemsText = currentItems.length > 0 ? currentItems.join(', ') : "無";
            
            const formatDetails = (d) => {
                if(!d) return `[未設定詳細資料]`;
                return `[年齡/體型]: ${truncatePromptText(d.age, 100) || '未知'}\n[外貌穿搭]: ${truncatePromptText(d.app, 500) || '未知'}\n[說話習慣]: ${truncatePromptText(d.speech, 350) || '未知'}\n[喜歡的事物]: ${truncatePromptText(d.likes, 240) || '未知'}\n[討厭的事物]: ${truncatePromptText(d.dislikes, 240) || '未知'}\n[背景與性格]: ${truncatePromptText(d.bg, 1000) || '未知'}`;
            };

            const npcDescriptions = currentScenario.npcs.map(n => {
                n.dynamic = normalizeDynamicState(n.dynamic);
                return `[NPC - ${n.name}]：\n(當前好感度): ${n.affection !== undefined ? n.affection : 0}\n【核心人設：禁止自動改寫】\n${formatDetails(n.details)}\n【可流動的當前狀態】\n${formatDynamicStateForPrompt(n.dynamic)}`;
            }).join('\n\n');
            const sceneNpcRole = truncatePromptText(currentScen.npcRoles || currentScen.targetRole, 1800) || "無特殊設定";

            const pStats = currentScenario.playerStats || {str:10, dex:10, con:10, int:10, wis:10, cha:10};
            const statsStr = `力量(STR):${pStats.str}, 敏捷(DEX):${pStats.dex}, 體質(CON):${pStats.con}, 智力(INT):${pStats.int}, 感知(WIS):${pStats.wis}, 魅力(CHA):${pStats.cha}`;
            const pDetailsStr = formatDetails(currentScenario.playerDetails);
            currentScenario.playerDynamic = normalizeDynamicState(currentScenario.playerDynamic);
            const pDynamicStr = formatDynamicStateForPrompt(currentScenario.playerDynamic);
            const languageInstruction = getLanguageInstruction(currentScenario.languageMode || 'zh-tw');

            return `\n【輸出語言規則】\n${languageInstruction}\n
【系統防護指令 (最高優先級)】
你是一個「TRPG 沉浸式群像劇引擎」與「DM(地下城主)」。
凡是標示為「創作者指令」的內容，都是操作者在角色外下達的最高權限舞台指示，絕對不是 ${currentScenario.playerName} 的台詞、行動或情緒；NPC 不得聽見、評論、責怪或對該指令產生好感變化。

【語言風格核心守則：拒絕直譯、追求日系翻譯文學感】
1. 【口吻要求】對話台詞保持日文語感，依照日本人說話的習慣與邏輯（例如：善用省略主語、弦外之音的暗示、以及讀空氣的留白，避免將內心想法全部直白地說出口）。
2. 【口吻轉換】：
   - 角色說話時，請融入「日文文學/日系翻譯文學」的優雅與留白。
   - 避免直接把英文直譯。例如，不用「我感覺到很憤怒」，改用「一股燥熱在胸口蔓延」。
   - NPC 的語氣要體現層次：冷靜的角色用詞精簡、帶有距離感；活潑的角色語氣要自然，絕對不要像生硬的 NPC 公告。
3. 【修辭調整】：
   - 描寫場景時，多描寫感官細節（氣味、光影、氣氛），而不是單純描述動作。
   - 動作描寫與對話之間要透過「心境轉折」連結，讓角色講出的每一句話都有其動機與內在掙扎。
4. 【節奏掌控 (防呆機制)】：
   - 請視當下情境的節奏動態調整描寫比例。日常閒聊或緊急戰鬥時應「簡短俐落」；關鍵劇情或情緒轉折時再著重「感官與內心描寫」，避免敘事過於拖沓黏膩。

【目前場景與多重世界連貫性 (極重要)】
目前場景 / 支線：【${currentScen.name}】
世界觀與物理法則：${truncatePromptText(currentScen.lore, 5000)}
情境轉場規則：${truncatePromptText(currentScen.transitionRule, 1200) || '未指定；預設視為鏡頭切換，不得擅自判定傳送、夢醒或時間跳躍。'}
(DM 絕對指令：角色核心關係與長期記憶預設跨情境延續；物理地點、當下身分與事件進度必須依目前情境及交接包判斷，不得把不同支線直接混成同一空間。)

【登場的 NPC 們 (請依照這些設定進行扮演與判定)】
${npcDescriptions}
(當下情境中 NPC 們的總體身分/狀態)：${sceneNpcRole}

【玩家角色設定 (數值已被鎖定)】
[玩家 - ${currentScenario.playerName}]：
(基礎六圍數值) ${statsStr}
【核心人設：禁止自動改寫】\n${pDetailsStr}
【可流動的當前狀態】\n${pDynamicStr}
(情境欄位設定的身分／視角) ${truncatePromptText(currentScen.playerRole, 1200) || '未指定'}
${buildSceneParticipationInstruction(currentScen)}

【🚨 群像劇 NPC 互動與發言邏輯】
1. 絕對禁止「每次每個 NPC 都輪流講話」！這非常機械化且不自然。
2. 請像真正的導演一樣判斷本回合輸入影響了誰、誰會立刻反應、誰會旁觀沉默。若玩家角色不在場，只能描寫在場 NPC 對事件與彼此的反應。
3. 很多時候【只需要一位 NPC 回話】，甚至【沒有人說話】（只有動作描寫）。只有在激烈討論時，才會有兩位以上的 NPC 發言。

【🚨 本回合操作者輸入判讀規則 - 最高優先】
每次回覆必須先判斷輸入模式：角色行動、輔助旁白，或創作者指令。
1. 角色行動：只有玩家角色在場且輸入不是場外指示時，才可視為 ${currentScenario.playerName} 的台詞或動作，並判斷是否需要 D20。
2. 輔助旁白：用來安排鏡頭、環境與 NPC 行動，不是 ${currentScenario.playerName} 在場說話；NPC 不得把旁白當成可聽見的台詞。
3. 創作者指令：必須直接服從並調整場景事實，不得讓 NPC 質疑指令、責怪玩家或把指令內容改寫成角色行動。
4. 玩家角色被設定為不在場時，未收到明確「回歸、登場、上線或回到現場」指示前，禁止擅自讓玩家角色出現、說話、被 NPC 看見或成為衝突來源。
5. 輸入含糊時不要擅自大幅推進；先呈現當下可確認的場景反應。options 必須符合目前視角：旁白模式提供導演下一步，不得假裝玩家角色在場，也不得觸發玩家六圍檢定。

【玩家生存狀態與安全機制】
目前 HP (生命/體力)：${currentHp}/100
目前 SAN (理智/壓力)：${currentSan}/100
目前背包道具：${itemsText}
${getGameDifficultyInstruction()}
${buildSurvivalInstruction()}
(受傷、勞累可扣除 HP；恐懼、精神打擊可扣除 SAN。必須依目前遊戲難度處理歸零結果。)

【永久記憶與狀態標籤 (Flags) - 極重要】
${flagsText}

【DM 核心記憶庫】
${getMemoryBriefForPrompt()}

【🚨 TRPG 硬判定與數值影響】
1. 玩家輸入若包含「系統硬判定」，代表程式已依指定六屬性、難度與 D20 骰點算出結果。結果【大成功／成功／失敗／大失敗】具有最高優先級，DM 絕對不得翻案、升降級或重新擲骰。
2. narrative 第一段必須明確承接硬判定結果並演出直接後果。大成功應帶來額外優勢；大失敗應帶來合理且明顯的代價，並遵守目前遊戲難度的歸零與 Game Over 規則。
3. 六屬性加值與難度 DC 已經反映在程式結果中，禁止再次用角色數值修改結果。Flags、傷勢與情境只能影響後果描寫，不可改變已算定的成功等級。
4. 玩家輸入沒有「系統硬判定」時，不要擅自宣稱玩家已經擲骰；可以在 options 建議玩家使用擲骰按鈕。
5. 【事件對數值的影響】：重大事件可利用 new_flags 發放狀態標籤。使用或消耗道具時，將效果反映在 hp_change、san_change 或 lost_items；贈送 NPC 時可反映在 npc_love_change。
6. 玩家明確要求「把某 NPC 好感度設為某數字」時，使用 npc_love_set；一般劇情造成的增減才使用 npc_love_change。禁止只在 narrative 宣稱修改完成卻漏填數值欄位。

        【🚨 角色動態狀態與好感度演進機制 (極重要)】
目前 AI 重要紀錄追加：${currentScenario.memoryNotesPaused ? '已暫停。memoryNotes 必須回傳空陣列或省略，不得新增任何條目。' : '開啟中。僅在符合下列重大事件規則時新增。'}
1. 核心人設（年齡、背景、性格、語氣、喜好與厭惡）由玩家建立，絕對不可自動改寫或摘要覆蓋。
2. mood 可在角色情緒明顯轉換時即時更新；不要只是換同義詞，也不要每回合更新。
3. condition 只有實際受傷、痊癒、換裝、裝備或外觀改變時才更新；普通動作不算變化。
4. dynamic relationship 只記「該角色此刻對玩家／隊伍的個人態度」；涉及角色彼此、多人關係、重大承諾與張力，應寫入 relationship_summary。relationship 與 goal 屬於持久狀態，只有信任/敵意/界線明顯改變，或正式接受、完成、放棄目標時才更新，並必須回傳 persistent: true。當下想做的動作不等於長期目標。
5. memoryNotes 是角色專屬的長期記憶索引，只記錄重大約定、秘密、關係里程碑、不可逆選擇與尚未履行的承諾。每條必須是短標題，不得寫成完整句子或補充心理分析。只能回傳本回合要新增的條目，必須 persistent: true；禁止重寫或重複既有條目。
6. 若本回合沒有真正的狀態改變，npc_state_updates 回傳 []、player_state_update 回傳 {}。不要為了填欄位而更新。
7. 若玩家的行為符合某位 NPC 的喜好、提供實質幫助或展現魅力，請增加其好感度；惹惱對方則減少。好感度突破 50 或 80 時，可主動觸發專屬事件。

【🚨 自動雙層記憶更新（每回合必做）】
1. memory_update.story_summary：回傳完整的最新劇情摘要陣列，保持 3～8 條短句。遇見新 NPC、接到／完成任務、抵達新地點、關係或局勢重大轉折時必須更新；沒變化時原樣保留既有重點。不得加入尚未發生的事。
2. memory_update.relationship_summary：這是「整體角色關係圖」，回傳完整的最新角色關係陣列，保留角色彼此的重要關係、界線、承諾與張力，最多 10 條；不要重複每位 NPC dynamic relationship 裡的短期個人態度，只有全局關係實際變化才改寫。
3. memory_update.task_updates：只回傳本回合的任務異動。接到任務用 {"action":"add","text":"任務內容"}；完成用 {"action":"complete","text":"必須與既有任務文字相同或高度一致"}；重新開啟用 reopen；刪除錯誤項目才用 remove。無異動回傳 []。
4. ☑ 已完成任務與既有摘要都是歷史事實，不得改回未完成，也不得把任何已發生內容重新當成新事件。
5. adventure_log 只追加本回合重要事實；memory_update 則維護精簡的「現在狀態」。兩者用途不同，不得用摘要取代或刪除完整紀錄。

【回傳 JSON 格式與嚴格規定 (支援多人)】
- "hp_change": 整數。若需扣除或恢復體力填寫此欄位 (例: -10)。
- "san_change": 整數。若需扣除或恢復理智填寫此欄位 (例: -5)。
- "npc_love_change": 物件 (Object)。指定個別 NPC 的好感度增減量，鍵名必須使用完整 NPC 名稱。無變動請回傳 {}。
- "npc_love_set": 物件 (Object)。只有玩家明確要求指定數值時使用，代表直接設定最終好感度。無指定請回傳 {}。
- "new_items": 字串陣列 [Array]。若玩家獲得新道具寫入此處。
- "lost_items": 字串陣列 [Array]。若玩家消耗或失去道具寫入此處。
- "new_flags": 字串陣列 [Array]。若玩家獲得長期 Buff/Debuff 或解鎖重要承諾/事件寫入此處。(注意：標籤名稱不要加「狀態：」前綴，直接寫名稱即可)
- "npc_state_updates": NPC 狀態更新陣列。持久變化必須加 persistent:true；無變動回傳 []。
- "player_state_update": 物件。即時狀態只填 changes；需要更新 relationship、goal 或 memoryNotes 時必須加 persistent:true。重要紀錄格式：{"persistent":true,"changes":{"condition":"右臂擦傷","memoryNotes":["替隊友承受陷阱"]},"reason":"陷阱判定失敗"}。無變動回傳 {}。
- "memory_update": 物件。格式：{"story_summary":["目前主線短句"],"relationship_summary":["角色關係短句"],"task_updates":[{"action":"add|complete|reopen|remove","text":"任務內容"}]}。story_summary 與 relationship_summary 是完整最新快照；task_updates 只列本回合異動。
- "adventure_log": 字串 (String)。只回傳「本回合新增的重要事件」，一行一則；不要重抄、改寫或刪除舊紀錄，程式會自動去重後追加。沒有重大事件時回傳空字串。
- "narrative": 第三方旁白視角。進行情境描寫、NPC之間的動作、判定結果宣告。
- "dialogues": 只有真正開口說話的 NPC 才列入，名稱必須符合 NPC 列表；沒人說話回傳 []。
- "options": 必須回傳 3 個下一步物件。只有具風險且成敗不確定的行動才標記 check；通常最多 1 個需要檢定，且至少 1 個 check 為 none。
`;
        }

        function getRelevantNpcsForPrompt(scene, latestPlayerAction, profile) {
            const npcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs.filter(npc => !isNpcDead(npc)) : [];
            if (npcs.length <= profile.npcLimit) return npcs;
            const relevanceText = [
                latestPlayerAction,
                scene?.npcRoles,
                scene?.playerRole,
                currentStorySummary,
                currentRelationshipSummary,
                getRecentChatText(currentChatPageIndex, { maxTurns: 2, maxChars: 1600 })
            ].map(valueToText).join('\n').toLowerCase();
            return npcs
                .map((npc, index) => ({
                    npc,
                    index,
                    score: relevanceText.includes(valueToText(npc?.name).toLowerCase()) ? 100 : 0
                }))
                .sort((a, b) => b.score - a.score || a.index - b.index)
                .slice(0, profile.npcLimit)
                .map(entry => entry.npc);
        }

        function getCompactSystemInstruction(latestPlayerAction = '', profile = getModelRuntimeProfile()) {
            syncSurvivalFlags({ announce: false });
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const formatDetails = details => {
                const d = details || {};
                return `年齡/體型：${truncatePromptText(d.age, 70) || '未設定'}\n外貌：${truncatePromptText(d.app, 220) || '未設定'}\n語氣：${truncatePromptText(d.speech, 180) || '未設定'}\n喜好：${truncatePromptText(d.likes, 120) || '未設定'}\n厭惡：${truncatePromptText(d.dislikes, 120) || '未設定'}\n核心人設：${truncatePromptText(d.bg, 600) || '未設定'}`;
            };
            const relevantNpcs = getRelevantNpcsForPrompt(scene, latestPlayerAction, profile);
            const deceasedNpcs = (currentScenario.npcs || []).filter(isNpcDead);
            const deceasedText = deceasedNpcs.length
                ? deceasedNpcs.map(npc => {
                    const dynamic = normalizeDynamicState(npc.dynamic);
                    return `- ${valueToText(npc.name, '未命名')}：${dynamic.deathCause || '已確認死亡'}${dynamic.reviveLocked ? '（復活檢定已失敗，永久死亡）' : ''}`;
                }).join('\n')
                : '無';
            const npcText = relevantNpcs.length
                ? relevantNpcs.map(npc => {
                    npc.dynamic = normalizeDynamicState(npc.dynamic);
                    return `【NPC：${valueToText(npc.name, '未命名')}｜好感 ${Number(npc.affection) || 0}】\n${formatDetails(npc.details)}\n${formatDynamicStateForPrompt(npc.dynamic, { maxNotes: profile.memoryNotes })}`;
                }).join('\n\n')
                : '目前沒有需要載入詳細設定的 NPC。';
            const livingNpcCount = (currentScenario.npcs || []).filter(npc => !isNpcDead(npc)).length;
            const omittedNpcCount = Math.max(0, livingNpcCount - relevantNpcs.length);
            const items = currentItems.slice(0, 24).map(item => truncatePromptText(item, 60));
            const omittedItems = Math.max(0, currentItems.length - items.length);
            const playerStats = currentScenario.playerStats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
            currentScenario.playerDynamic = normalizeDynamicState(currentScenario.playerDynamic);
            const difficulty = getGameDifficultyInfo();

            return `【身份與語言】
你是單人 TRPG 的 DM、旁白與 NPC。${getLanguageInstruction(currentScenario.languageMode || 'zh-tw')}
只輸出合法 JSON，不要 Markdown 或額外解釋。

【敘事原則】
- 尊重玩家建立的世界、核心人設與已發生事實；不得擅自改寫。
- 對話自然、有角色差異與適度留白；普通回合簡潔，重大轉折才增加描寫。
- 只讓此刻需要反應的角色說話，不要安排所有 NPC 輪流發言。
- 不預設任何固定劇情；只承接本回合輸入與下方資料。

【當前場景】
名稱：${truncatePromptText(scene.name, 100) || '未命名'}
世界與規則：${truncatePromptText(scene.lore, profile.loreChars) || '未設定'}
NPC 在本場景的身分：${truncatePromptText(scene.npcRoles || scene.targetRole, 700) || '未設定'}
玩家身分／視角：${truncatePromptText(scene.playerRole, 500) || '未設定'}
轉場規則：${truncatePromptText(scene.transitionRule, 500) || '未設定；預設為鏡頭切換'}
${buildSceneParticipationInstruction(scene)}

【玩家：${valueToText(currentScenario.playerName, '玩家')}】
能力：STR ${playerStats.str}／DEX ${playerStats.dex}／CON ${playerStats.con}／INT ${playerStats.int}／WIS ${playerStats.wis}／CHA ${playerStats.cha}
${formatDetails(currentScenario.playerDetails)}
${formatDynamicStateForPrompt(currentScenario.playerDynamic, { maxNotes: profile.memoryNotes })}

【本回合相關 NPC】
${npcText}${omittedNpcCount ? `\n（另有 ${omittedNpcCount} 位未被本回合內容提及的 NPC，其詳細資料未傳送；不要擅自安排其登場。）` : ''}

【已死亡 NPC】
${deceasedText}
死亡 NPC 不得說話、行動、改變好感或更新角色狀態；只能被存活角色回憶或談論。

【遊戲狀態】
HP ${currentHp}/100；SAN ${currentSan}/100；難度：${difficulty.label}（DC 修正 ${difficulty.dcModifier >= 0 ? '+' : ''}${difficulty.dcModifier}）
道具：${items.length ? items.join('、') : '無'}${omittedItems ? `（另有 ${omittedItems} 件未列出）` : ''}
Flags：\n${getFlagsForPrompt()}

【長期記憶】
${getMemoryBriefForPrompt()}

【判定與狀態規則】
- 輸入中的「系統硬判定」已由程式算定，必須直接承接，不得重擲或改變成敗。
- 沒有硬判定時，不要假裝已擲骰；風險行動可在 options 建議檢定。
- 創作者指令是角色外舞台命令；NPC 不得聽見，也不得因此改變好感。輔助旁白不是玩家角色的言行。
- 只有角色行動模式才可改變玩家 HP、SAN、道具或好感；必須依實際事件填入 changes。
- HP 或 SAN 歸零時遵守目前難度的結局規則；不可自行忽略程式狀態。
- npc_states／player_state 的 memoryNotes 不是日誌：只有重大約定、未公開秘密、關係里程碑或不可逆選擇才可新增，且必須 persistent:true。
- 每名角色每回合最多新增 1 條 memoryNotes，限 36 字內的短標題。普通情緒、氣氛、對話內容、受傷與日常互動不得寫入；相似內容不得換句話重複新增。
- 只有劇情文字已明確確認 NPC 死亡時，才可填 npc_deaths；重傷、昏迷、失蹤或生死不明都不算死亡。
- ${difficulty.key === 'standard' ? '標準模式：劇情明確演出復活，或「神」直接介入時可填 npc_revives；不強制檢定。' : (difficulty.key === 'hard' ? '困難模式：每次死亡只有一次復活嘗試。所有復活相關 options 都必須有六屬性檢定且 difficulty 至少為 hard；程式會執行成敗，npc_revives 必須留空。若已標記復活失敗，禁止再提供任何復活選項。' : '極限模式：死亡永久成立，npc_revives 必須為空，禁止提供任何復活行動或選項。')}

【長期記憶判定】
普通對話、移動、短暫情緒、重複描述與無後續影響的小事：memory 必須為 null。
只有任務異動、關係或承諾實質改變、重要物品得失、永久狀態、重要線索、不可逆選擇，或會影響後續的場景變化，才回傳 memory。
memory.category 只能是 task、relationship、item、status、clue、decision、scene；memory.event 只寫一條簡短既定事實。story_summary 與 relationship_summary 只有重大變化時才回傳完整精簡快照，否則省略。不得把普通事件硬寫成重點。

【JSON 契約】
必須回傳 narrative、dialogues、options。changes 只放本回合真的發生的變動；無變動可回傳 {}。memory 無重大事件時回傳 null。
{
  "narrative":"旁白文字",
  "dialogues":[{"speaker":"<角色名>","text":"台詞"}],
  "options":[{"text":"下一步","check":"none|str|dex|con|int|wis|cha","difficulty":"easy|normal|hard|extreme"}],
  "changes":{
    "hp":0,"san":0,
    "affection_change":{"<角色名>":0},"affection_set":{"<角色名>":0},
    "items_add":[],"items_remove":[],"flags_add":[],
    "npc_deaths":[{"name":"<角色名>","cause":"明確死因或死亡事件"}],
    "npc_revives":[{"name":"<角色名>","reason":"明確復活事件；只供標準模式使用"}],
    "npc_states":[{"name":"<角色名>","persistent":false,"changes":{"mood":"","condition":"","relationship":"","goal":"","memoryNotes":[]}}],
    "player_state":{}
  },
  "memory":{"category":"task|relationship|item|status|clue|decision|scene","event":"重大既定事實","story_summary":[],"relationship_summary":[],"task_updates":[{"action":"add|complete|reopen|remove","text":"任務"}]}
}
dialogues 只列真正開口者。options 必須恰好 3 個，通常最多 1 個需要檢定，至少 1 個 check 為 none。省略 changes 內未變動的欄位。`;
        }

        function populateModelSelects(models, preferredModel = "") {
            const select = document.getElementById('model-choice');
            const gameSelect = document.getElementById('game-model-choice');
            select.innerHTML = '';
            gameSelect.innerHTML = '';

            const sortedModels = sortModelsForTRPG(models);
            sortedModels.forEach(model => {
                const recommended = scoreModelForTRPG(model) >= 100 ? '★ ' : '';
                const opt = document.createElement('option');
                opt.value = model.id;
                opt.textContent = recommended + (model.name || model.id);
                const optGame = document.createElement('option');
                optGame.value = model.id;
                optGame.textContent = recommended + (model.name || model.id);
                select.appendChild(opt);
                gameSelect.appendChild(optGame);
            });

            const fallback = sortedModels[0] ? sortedModels[0].id : "";
            const nextModel = sortedModels.some(model => model.id === preferredModel) ? preferredModel : fallback;
            if (nextModel) syncModelSelection(nextModel);
        }

        async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                return await fetch(url, { ...options, signal: controller.signal });
            } catch (error) {
                if (error?.name === 'AbortError') throw new Error(`連線超過 ${Math.round(timeoutMs / 1000)} 秒沒有回應。`);
                throw error;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        async function fetchGoogleModels() {
            const res = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message || "Google API 金鑰驗證失敗。");

            const validModels = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent") && !m.name.includes("-tts") && !m.name.includes("-vision"))
                .map(m => ({ id: m.name, name: m.displayName || m.name, context_length: m.inputTokenLimit || 0 }));
            if(validModels.length === 0) throw new Error("找不到可用的文字生成模型。");
            return validModels;
        }

        async function fetchOpenRouterModels() {
            const res = await fetchWithTimeout('https://openrouter.ai/api/v1/models?output_modalities=text&sort=most-popular', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error?.message || "OpenRouter API 金鑰驗證失敗。");

            const validModels = (data.data || [])
                .filter(m => !m.architecture || !m.architecture.output_modalities || m.architecture.output_modalities.includes('text'))
                .map(m => ({
                    id: m.id,
                    name: `${m.name || m.id}${m.context_length ? ` (${Math.round(m.context_length / 1000)}k)` : ''}`,
                    context_length: m.context_length || 0
                }));
            if(validModels.length === 0) throw new Error("找不到可用的 OpenRouter 文字模型。");
            return validModels;
        }

        async function fetchAvailableModels() {
            apiProvider = document.getElementById('api-provider')?.value || 'google';
            apiKey = document.getElementById('api-key').value.trim();
            if(!apiKey) { alert("請貼上你的 API Key！"); return; }
            const verifyBtn = document.getElementById('verify-btn');
            verifyBtn.innerText = "驗證中..."; verifyBtn.disabled = true;

            try {
                localStorage.setItem('sanko_api_provider', apiProvider);
                sessionApiKeys[apiProvider] = apiKey;

                const preferredModel = localStorage.getItem(getModelStorageKey(apiProvider)) || selectedModel || '';
                const models = apiProvider === 'openrouter' ? await fetchOpenRouterModels() : await fetchGoogleModels();
                populateModelSelects(models, preferredModel);
                if (rememberApiKey) persistApiKey(apiProvider, apiKey);
                else removePersistedApiKeys();

                document.getElementById('delete-key-btn').style.display = 'inline-block';
                setHomeModelAreaVisible(true);
                verifyBtn.style.display = 'none';
            } catch (error) {
                console.error('API 驗證技術資訊', error);
                alert(getFriendlyErrorMessage(error, 'API 驗證失敗，請確認金鑰後再試。'));
                verifyBtn.innerText = "驗證金鑰"; verifyBtn.disabled = false;
            }
        }

        function truncateSceneTransitionText(value, maxChars = 300) {
            const text = valueToText(value).replace(/\s+/g, ' ').trim();
            if (text.length <= maxChars) return text;
            return `${text.slice(0, Math.max(0, maxChars - 1))}…`;
        }

        function getSceneTransitionHistory(pageIndex, maxLines = 3) {
            const page = Array.isArray(chatScripts[pageIndex]) ? chatScripts[pageIndex] : [];
            const lines = page
                .filter(line => !valueToText(line).startsWith('【系統提示】'))
                .map(line => truncateSceneTransitionText(stripHardDiceDirective(line), 150))
                .filter(Boolean)
                .slice(-maxLines);
            return truncateSceneTransitionText(lines.join(' / '), 420);
        }

        function normalizeSceneTransition(value) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
            const fromIndex = Number.parseInt(value.fromIndex, 10);
            const toIndex = Number.parseInt(value.toIndex, 10);
            if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return null;
            return {
                version: 1,
                type: value.type === 'resume' ? 'resume' : 'first-entry',
                fromIndex,
                toIndex,
                fromName: valueToText(value.fromName, '未命名情境'),
                toName: valueToText(value.toName, '未命名情境'),
                sourceTail: valueToText(value.sourceTail),
                targetTail: valueToText(value.targetTail),
                createdAt: valueToText(value.createdAt)
            };
        }

        function createSceneTransition(fromIndex, toIndex) {
            const fromScene = currentScenario.scenarios?.[fromIndex] || {};
            const toScene = currentScenario.scenarios?.[toIndex] || {};
            const targetTail = getSceneTransitionHistory(toIndex);
            return normalizeSceneTransition({
                version: 1,
                type: targetTail ? 'resume' : 'first-entry',
                fromIndex,
                toIndex,
                fromName: fromScene.name || '未命名情境',
                toName: toScene.name || '未命名情境',
                sourceTail: getSceneTransitionHistory(fromIndex),
                targetTail,
                createdAt: new Date().toISOString()
            });
        }

        function buildSceneTransitionPrompt() {
            const transition = normalizeSceneTransition(pendingSceneTransition);
            if (!transition || transition.toIndex !== currentScenarioIndex) return '';
            const targetScene = currentScenario.scenarios?.[transition.toIndex] || {};
            const typeLabel = transition.type === 'resume' ? '返回既有支線' : '首次進入新情境';
            const targetHistory = transition.targetTail || '此情境尚無先前對話。';
            const sourceHistory = transition.sourceTail || '來源情境沒有可用的近期對話。';
            const transitionRule = truncateSceneTransitionText(targetScene.transitionRule, 260)
                || '未指定。採用安全的鏡頭切換，不得自行發明傳送、夢醒或時間跳躍。';
            return `

【情境交接包－本回合最高優先】
切換類型：${typeLabel}
來源情境：${transition.fromName}
目標情境：${transition.toName}
來源上一幕：${sourceHistory}
目標支線既有進度：${targetHistory}
轉場規則：${transitionRule}
目標情境 NPC 身分／狀態：${targetScene.npcRoles || '未指定'}
目標情境玩家身分／視角：${targetScene.playerRole || '未指定'}
玩家在場判定：${getSceneParticipationMode(targetScene) === 'narrator' ? `玩家角色 ${currentScenario.playerName} 目前不視為在場；操作者輸入採輔助旁白／導演模式。` : `玩家角色 ${currentScenario.playerName} 預設在場；除非當前指令另有說明。`}

交接要求：
1. narrative 第一段先讓讀者明白目前的時間、空間與在場角色，再直接回應操作者本回合輸入；旁白／創作者模式不得改寫成玩家角色行動。
2. 返回既有支線時，優先接續「目標支線既有進度」；來源上一幕只作為跨支線共同記憶，不得把兩地物理場景混在一起。
3. 首次進入時，依目標情境設定建立自然入口；未指定轉場方式時只做鏡頭切換，不可擅自創造穿越機制。
4. 核心人設、關係、重大約定與長期記憶延續；當下身分與環境法則以目標情境為準。
5. 若目標情境是輔助旁白／玩家不在場模式，禁止把操作者輸入當成玩家角色發言；只有明確回歸指令才能讓玩家角色重新登場。`;
        }

        function changeScenario(indexStr) {
            const newIndex = Number.parseInt(indexStr, 10);
            if (!Number.isInteger(newIndex) || !currentScenario.scenarios?.[newIndex]) return;
            if (newIndex === currentScenarioIndex && newIndex === currentChatPageIndex) return;

            const fromIndex = currentScenarioIndex;
            pendingSceneTransition = createSceneTransition(fromIndex, newIndex);
            currentScenarioIndex = newIndex;
            currentChatPageIndex = newIndex;
            
            if (!chatScripts[currentChatPageIndex]) chatScripts[currentChatPageIndex] = [];
            renderChatPage(currentChatPageIndex);
            setCreatorInputMode(false, false);

            saveCurrentProgress();
            document.getElementById('btn-location').value = currentScenarioIndex;
        }

function renderChatPage(pageIndex) {
const msgBox = document.getElementById('dialogue-box');
msgBox.innerHTML = '';
const optArea = document.getElementById('options-area');
optArea.innerHTML = '';
            
            const currentLog = chatScripts[pageIndex] || [];

            if (currentLog.length > 0) {
                currentLog.forEach(line => {
                    if (line.startsWith(`【旁白】：`)) { 
                        appendNarrative(stripHardDiceDirective(line.replace(`【旁白】：`, ""))); 
                    }
                    else if (line.startsWith(`【創作者指令】：`)) {
                        appendCreatorInstruction('創作者指令', line.replace(`【創作者指令】：`, ''));
                    }
                    else if (line.startsWith(`【輔助旁白】：`)) {
                        appendCreatorInstruction('輔助旁白', line.replace(`【輔助旁白】：`, ''));
                    }
                    else if (line.startsWith(`【系統提示】：`)) {
                        const rawMsg = line.replace(`【系統提示】：`, ""); 
                        const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(rawMsg) : rawMsg;
                        if (rawMsg.includes("解鎖") || rawMsg.includes("獲得") || rawMsg.includes("失去") || rawMsg.includes("消耗") || rawMsg.includes("好感度") || rawMsg.includes("發生改變") || rawMsg.includes("檢定")) {
                            const alertDiv = document.createElement('div'); alertDiv.className = 'alert-msg'; alertDiv.innerText = displayMsg; msgBox.appendChild(alertDiv);
                        } else {
                            const systemMsgDiv = document.createElement('div');
                            systemMsgDiv.className = 'system-msg';
                            systemMsgDiv.innerText = displayMsg;
                            msgBox.appendChild(systemMsgDiv);
                        }
                    } else {
                        const splitIdx = line.indexOf('：');
                        if (splitIdx > -1) { const speaker = line.substring(0, splitIdx); const text = stripHardDiceDirective(line.substring(splitIdx + 1)); appendMessage(speaker, text); }
                    }
                });
                msgBox.scrollTop = msgBox.scrollHeight;
} else {
const emptyMessage = window.uiMessage ? window.uiMessage('此情境/支線尚無對話。請輸入動作，或讓 AI 生成開場') : '此情境/支線尚無對話。請輸入動作，或讓 AI 生成開場';
const systemMsg = document.createElement('div'); systemMsg.className = 'system-msg'; systemMsg.innerHTML = `<i>— ${emptyMessage} —</i>`; msgBox.appendChild(systemMsg); msgBox.scrollTop = msgBox.scrollHeight;
const btn = document.createElement('button'); btn.className = 'opt-btn'; btn.style.borderColor = 'var(--accent-neon)'; btn.style.width = 'fit-content'; btn.style.alignSelf = 'center'; btn.textContent = window.uiMessage ? window.uiMessage('🎲 讓 AI 根據「情境設定」隨機生成開場事件') : '🎲 讓 AI 根據「情境設定」隨機生成開場事件';
                btn.onclick = () => { 
                    optArea.innerHTML = ''; 
                    document.getElementById('loading').style.display = 'block'; 
                    const currentScenName = currentScenario.scenarios[currentChatPageIndex].name;
                    const prompt = `【系統啟動要求】目前視角處於「${currentScenName}」情境。請嚴格根據「當前場景的世界觀與物理法則」以及「NPC在此的總體身分」，隨機生成一個極具帶入感的開局事件（例如：遭遇突發危機、日常衝突、或是某個角色正在做符合他人設的行為）。請利用 narrative 豐富描寫場景氣氛，並讓合適的 NPC 講出第一句話。`; 
                    callAI_JSON(prompt, true); 
                };
                optArea.appendChild(btn);
            }
        }

        function appendNarrative(text) {
            if (!text) return; const dialogueBox = document.getElementById('dialogue-box'); const navDiv = document.createElement('div'); navDiv.className = 'msg-narrative'; navDiv.innerText = text;
            dialogueBox.appendChild(navDiv); dialogueBox.scrollTop = dialogueBox.scrollHeight;
        }

        function appendCreatorInstruction(label, text) {
            if (!text) return;
            const dialogueBox = document.getElementById('dialogue-box');
            const note = document.createElement('div');
            note.className = 'creator-instruction';
            const heading = document.createElement('strong');
            heading.textContent = window.uiMessage ? window.uiMessage(label) : label;
            note.appendChild(heading);
            note.appendChild(document.createTextNode(text));
            dialogueBox.appendChild(note);
            dialogueBox.scrollTop = dialogueBox.scrollHeight;
        }


        function openGameAvatarPicker(kind, npcId = '') {
            if (!currentSaveId || !currentScenario) return;
            pendingGameAvatarTarget = { kind, npcId: valueToText(npcId) };
            const input = document.getElementById('upload-game-avatar');
            if (!input) return;
            input.value = '';
            input.click();
        }

        function triggerGameAvatarCrop(input) {
            if (!pendingGameAvatarTarget) return;
            triggerCrop(input, 'game');
        }

        function getGameAvatarCharacter(target = pendingGameAvatarTarget) {
            if (!target || !currentScenario) return null;
            if (target.kind === 'player') return { kind: 'player', character: currentScenario };
            const npcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs : [];
            const npc = npcs.find(item => valueToText(item.id) === valueToText(target.npcId));
            return npc ? { kind: 'npc', character: npc } : null;
        }

        function updateVisibleGameAvatars(target, avatarSrc) {
            document.querySelectorAll('.chat-avatar.editable-avatar').forEach(img => {
                const samePlayer = target.kind === 'player' && img.dataset.avatarKind === 'player';
                const sameNpc = target.kind === 'npc'
                    && img.dataset.avatarKind === 'npc'
                    && img.dataset.avatarNpcId === valueToText(target.npcId);
                if (samePlayer || sameNpc) img.src = avatarSrc;
            });
        }

        function syncGameAvatarToPreset(target, avatarSrc) {
            const sourceId = currentScenario?.sourcePresetId || currentScenario?.id;
            const preset = sourceId ? scenarioPresets[sourceId] : null;
            if (!preset) return { synced: false, reason: 'missing' };
            if (preset.isLocked) return { synced: false, reason: 'locked', presetName: preset.presetName || '目前配置' };

            const previousPreset = clonePersistentValue(preset);
            if (target.kind === 'player') {
                preset.playerAvatar = avatarSrc;
            } else {
                if (!Array.isArray(preset.npcs)) preset.npcs = [];
                const currentNpc = getGameAvatarCharacter(target)?.character;
                if (!currentNpc) return { synced: false, reason: 'missing-character' };
                let presetNpc = preset.npcs.find(item =>
                    (valueToText(item.id) && valueToText(item.id) === valueToText(currentNpc.id))
                    || (valueToText(item.name) && valueToText(item.name) === valueToText(currentNpc.name))
                );
                if (!presetNpc) {
                    presetNpc = clonePersistentValue(currentNpc);
                    delete presetNpc.dynamic;
                    preset.npcs.push(presetNpc);
                }
                presetNpc.avatar = avatarSrc;
            }

            if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置頭像')) {
                scenarioPresets[sourceId] = previousPreset;
                return { synced: false, reason: 'storage' };
            }
            return { synced: true, presetName: preset.presetName || '目前配置' };
        }

        function commitGameAvatar(avatarSrc) {
            const target = pendingGameAvatarTarget;
            const resolved = getGameAvatarCharacter(target);
            if (!target || !resolved) {
                alert('找不到這名角色，頭像未變更。');
                pendingGameAvatarTarget = null;
                return;
            }

            if (target.kind === 'player') currentScenario.playerAvatar = avatarSrc;
            else resolved.character.avatar = avatarSrc;
            updateVisibleGameAvatars(target, avatarSrc);
            const saveOk = saveCurrentProgress();
            if (!saveOk) {
                pendingGameAvatarTarget = null;
                return;
            }
            const presetResult = syncGameAvatarToPreset(target, avatarSrc);
            pendingGameAvatarTarget = null;

            if (presetResult.reason === 'locked') {
                alert(`頭像已存入目前遊戲紀錄。\n角色配置「${presetResult.presetName}」已上鎖，因此沒有覆寫配置。`);
            }
        }

        function makeChatAvatarEditable(avatar, target, speaker) {
            if (!avatar || !target) return;
            avatar.classList.add('editable-avatar');
            avatar.dataset.avatarKind = target.kind;
            if (target.kind === 'npc') avatar.dataset.avatarNpcId = valueToText(target.npcId);
            avatar.alt = `${speaker} 的頭像`;
            avatar.title = '點擊新增或更換頭像';
            avatar.tabIndex = 0;
            avatar.setAttribute('role', 'button');
            avatar.setAttribute('aria-label', `更換 ${speaker} 的頭像`);
            const openPicker = () => openGameAvatarPicker(target.kind, target.npcId || '');
            avatar.addEventListener('click', openPicker);
            avatar.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                openPicker();
            });
        }

        function appendMessage(speaker, text) {
            if (!text) return; let isPlayer = false; let avatarSrc = emptyAvatar; let avatarTarget = null;

            if (speaker === currentScenario.playerName) {
                isPlayer = true;
                avatarSrc = currentScenario.playerAvatar || emptyAvatar;
                avatarTarget = { kind: 'player' };
            } else {
                const foundNpc = currentScenario.npcs.find(n => n.name === speaker);
                avatarSrc = foundNpc ? (foundNpc.avatar || emptyAvatar) : emptyAvatar;
                if (foundNpc) avatarTarget = { kind: 'npc', npcId: valueToText(foundNpc.id) };
            }

            const dialogueBox = document.getElementById('dialogue-box'); 
            const msgWrapper = document.createElement('div'); 
            msgWrapper.className = `msg-wrapper ${isPlayer ? 'player' : 'npc'}`;

            const avatar = document.createElement('img');
            avatar.src = avatarSrc;
            avatar.className = 'chat-avatar';
            avatar.onerror = () => {
                if (avatar.src !== emptyAvatar) avatar.src = emptyAvatar;
            };
            makeChatAvatarEditable(avatar, avatarTarget, speaker);

            const content = document.createElement('div');
            content.className = 'msg-content';

            const speakerDiv = document.createElement('div');
            speakerDiv.className = 'msg-speaker';
            speakerDiv.textContent = speaker;

            const textDiv = document.createElement('div');
            textDiv.className = 'msg-text';
            textDiv.textContent = text;

            content.appendChild(speakerDiv);
            content.appendChild(textDiv);
            msgWrapper.appendChild(avatar);
            msgWrapper.appendChild(content);
            dialogueBox.appendChild(msgWrapper);
            dialogueBox.scrollTop = dialogueBox.scrollHeight;
        }

        function loadGame(id) {
            const saveData = savesData[id];
            if (!saveData || typeof saveData !== 'object' || Array.isArray(saveData)) {
                alert('這份存檔格式不正確，無法載入。');
                return;
 }
 currentSaveId = id;
 const fallbackScenario = scenarioPresets[activePresetId] || defaultPreset;
            if (!saveData.scenario || typeof saveData.scenario !== 'object' || Array.isArray(saveData.scenario)) {
                saveData.scenario = JSON.parse(JSON.stringify(fallbackScenario));
            }
            
            if(saveData.scenario) { 
                currentScenario = saveData.scenario; 
                if(!currentScenario.languageMode) currentScenario.languageMode = 'zh-tw';
                if(!currentScenario.gameDifficulty) currentScenario.gameDifficulty = 'standard';
                currentScenario.memoryNotesPaused = currentScenario.memoryNotesPaused === true;
                if(!currentScenario.playerStats) currentScenario.playerStats = {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10};
                currentScenario.playerStats = normalizePlayerStats(currentScenario.playerStats);
                if(!Array.isArray(currentScenario.npcs)) {
                    currentScenario.npcs = [{ id: 'npc_legacy', name: currentScenario.targetName || '未知目標', avatar: currentScenario.targetAvatar || emptyAvatar, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: currentScenario.targetPersona || '' }, affection: saveData.love !== undefined ? saveData.love : 0 }];
                } else {
                    currentScenario.npcs = currentScenario.npcs.filter(n => n && typeof n === 'object' && !Array.isArray(n));
                    currentScenario.npcs.forEach(n => { if (n.affection === undefined) n.affection = saveData.love !== undefined ? saveData.love : 0; if(!n.details || typeof n.details !== 'object') n.details = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' }; });
                    if (!currentScenario.npcs.length) currentScenario.npcs.push({ id: 'npc_imported', name: '新角色', avatar: emptyAvatar, affection: 0, details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: '' } });
                }
                if(!Array.isArray(currentScenario.scenarios)) {
                    currentScenario.scenarios = [];
                    if(currentScenario.world1) currentScenario.scenarios.push({name: currentScenario.world1, lore: currentScenario.worldLore||'', npcRoles:'', playerRole:''});
                    if(currentScenario.world2) currentScenario.scenarios.push({name: currentScenario.world2, lore: '', npcRoles:'', playerRole:''});
                    if(currentScenario.scenarios.length === 0) currentScenario.scenarios.push({name: '預設場景', lore: '', npcRoles:'', playerRole:''});
                } else {
                    currentScenario.scenarios = currentScenario.scenarios.filter(sc => sc && typeof sc === 'object' && !Array.isArray(sc));
                    currentScenario.scenarios.forEach(sc => {
                        if(sc.npcRoles === undefined) sc.npcRoles = sc.targetRole || '';
                        if(sc.playerRole === undefined) sc.playerRole = '';
                        if(sc.transitionRule === undefined) sc.transitionRule = '';
                    });
                    if (!currentScenario.scenarios.length) currentScenario.scenarios.push({name: '預設場景', lore: '', npcRoles: '', playerRole: '', transitionRule: ''});
                }
            }
            
            chatScripts = Array.isArray(saveData.scripts)
                ? saveData.scripts.map(page => Array.isArray(page) ? page.map(line => valueToText(line)).filter(Boolean) : [])
                : [];
            if(chatScripts.length === 0 && Array.isArray(saveData.script)) { chatScripts = [saveData.script.map(line => valueToText(line)).filter(Boolean)]; }
            if(chatScripts.length === 0) { chatScripts = [[]]; }

            currentScenarioIndex = saveData.scenIndex || 0;
            if (currentScenarioIndex >= currentScenario.scenarios.length) currentScenarioIndex = 0;
            currentChatPageIndex = saveData.chatPageIndex !== undefined ? saveData.chatPageIndex : currentScenarioIndex;
            if (currentChatPageIndex >= currentScenario.scenarios.length) currentChatPageIndex = currentScenarioIndex;
            if (currentChatPageIndex !== currentScenarioIndex) currentChatPageIndex = currentScenarioIndex;
            pendingSceneTransition = normalizeSceneTransition(saveData.sceneTransition);
            if (pendingSceneTransition && pendingSceneTransition.toIndex !== currentScenarioIndex) pendingSceneTransition = null;
            
            currentScenario.scenarios.forEach((_, i) => {
                if (!chatScripts[i]) chatScripts[i] = [];
            });

            currentHp = normalizeSurvivalValue(saveData.hp, 100);
            currentSan = normalizeSurvivalValue(saveData.san, 100);
            currentItems = Array.isArray(saveData.items) ? saveData.items.map(item => valueToText(item)).filter(Boolean) : [];
            currentAdventureLog = formatBulletListText(saveData.log, "• 故事剛開始，目前尚無重大事件發生。");
            const memoryBrief = saveData.memoryBrief && typeof saveData.memoryBrief === 'object' ? saveData.memoryBrief : {};
            currentStorySummary = formatBulletListText(memoryBrief.story, '', true);
            currentOpenTasks = serializeTaskChecklist(memoryBrief.tasks);
            currentRelationshipSummary = formatBulletListText(memoryBrief.relationships, '', true);
            currentFlags = Array.isArray(saveData.flags) ? saveData.flags.map(flag => valueToText(flag)).filter(Boolean) : [];
            const playerInput = document.getElementById('player-input');
            const lightweightDraft = localStorage.getItem(getInputDraftStorageKey(id));
            playerInput.value = lightweightDraft !== null ? lightweightDraft : valueToText(saveData.inputDraft);
            adjustInputHeight();
            const loadSurvivalOutcome = resolveSurvivalOutcome();
            if (loadSurvivalOutcome.rescued || loadSurvivalOutcome.gameOver) saveCurrentProgress();

            document.getElementById('ui-hp').innerText = currentHp; document.getElementById('ui-san').innerText = currentSan; document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
            
            const locSelect = document.getElementById('btn-location'); locSelect.innerHTML = '';
            currentScenario.scenarios.forEach((sc, i) => {
                const opt = document.createElement('option'); opt.value = i; opt.innerText = `📍 ${sc.name}`;
                if(i === currentScenarioIndex) opt.selected = true; locSelect.appendChild(opt);
            });
            
 ensureGameModelSelectReady();
 setSelectValueWithFallback(document.getElementById('game-model-choice'), selectedModel);
 document.getElementById('dialogue-box').innerHTML = ''; document.getElementById('options-area').innerHTML = '';
document.getElementById('setup-screen').style.display = 'none'; document.getElementById('save-menu-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'flex';
            
            renderChatPage(currentChatPageIndex);
            
            const msgBox = document.getElementById('dialogue-box'); 
            const loadedText = window.uiMessage ? window.uiMessage('— 遊戲紀錄已載入 —') : '— 遊戲紀錄已載入 —';
            const sysMsg = document.createElement('div'); sysMsg.className = 'system-msg'; sysMsg.innerText = loadedText; msgBox.appendChild(sysMsg); msgBox.scrollTop = msgBox.scrollHeight;

            const input = document.getElementById('player-input');
            input.disabled = false;
            document.getElementById('send-btn').disabled = false;
            document.getElementById('dice-btn').disabled = false;
            setCreatorInputMode(false, false);
            if (!applyGameOverUi()) input.focus();
        }

        function selectOption(text, check = '', difficulty = 'normal') {
            const inputEl = document.getElementById('player-input');
            inputEl.value = text;
            inputEl.dataset.diceSuggestedText = text;
            inputEl.dataset.diceStat = check;
            inputEl.dataset.diceDifficulty = difficulty;
            adjustInputHeight();
            inputEl.focus();
        }

        function normalizeGameDifficulty(value) {
            return GAME_DIFFICULTIES[value] ? value : 'standard';
        }

        function getGameDifficultyInfo() {
            const key = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            return { key, ...GAME_DIFFICULTIES[key] };
        }

        function getSurvivalDiceModifier(statKey) {
            let modifier = 0;
            if (currentHp <= 20 && ['str', 'dex', 'con'].includes(statKey)) modifier -= 2;
            if (currentSan <= 20 && ['int', 'wis', 'cha'].includes(statKey)) modifier -= 2;
            return modifier;
        }

        function calculateDiceCheck(statKey, difficultyKey = 'normal', forcedRoll = null) {
            const statInfo = DICE_STATS[statKey];
            const difficulty = DICE_DIFFICULTIES[difficultyKey] || DICE_DIFFICULTIES.normal;
            const gameDifficulty = getGameDifficultyInfo();
            const rawScore = Number(currentScenario?.playerStats?.[statKey] ?? 10);
            const score = Number.isFinite(rawScore) ? Math.round(rawScore) : 10;
            const abilityModifier = Math.floor((score - 10) / 2);
            const survivalModifier = getSurvivalDiceModifier(statKey);
            const totalModifier = abilityModifier + survivalModifier;
            const dc = Math.max(2, Math.min(30, difficulty.dc + gameDifficulty.dcModifier));
            const roll = forcedRoll === null ? Math.floor(Math.random() * 20) + 1 : Math.max(1, Math.min(20, Math.round(forcedRoll)));
            const total = roll + totalModifier;
            let result = total >= dc ? '成功' : '失敗';
            if (roll === 20) result = '大成功';
            else if (roll === 1) result = '大失敗';
            return {
                statKey,
                code: statInfo.code,
                label: statInfo.label,
                score,
                abilityModifier,
                difficultyKey,
                difficultyLabel: difficulty.label,
                difficultyDc: difficulty.dc,
                gameDifficultyKey: gameDifficulty.key,
                gameDifficultyLabel: gameDifficulty.label,
                gameDifficultyDcModifier: gameDifficulty.dcModifier,
                survivalModifier,
                totalModifier,
                dc,
                roll,
                total,
                result
            };
        }

        function normalizeDiceStatKey(value) {
            const clean = valueToText(value).toLowerCase();
            const aliases = {
                str: 'str', strength: 'str', '力量': 'str',
                dex: 'dex', dexterity: 'dex', '敏捷': 'dex',
                con: 'con', constitution: 'con', '體質': 'con', '体质': 'con',
                int: 'int', intelligence: 'int', '智力': 'int',
                wis: 'wis', wisdom: 'wis', '感知': 'wis',
                cha: 'cha', charisma: 'cha', '魅力': 'cha'
            };
            return aliases[clean] || '';
        }

        function normalizeDiceDifficulty(value) {
            const clean = valueToText(value).toLowerCase();
            const aliases = {
                easy: 'easy', '簡單': 'easy', '简单': 'easy',
                normal: 'normal', medium: 'normal', '普通': 'normal',
                hard: 'hard', '困難': 'hard', '困难': 'hard',
                extreme: 'extreme', '極難': 'extreme', '极难': 'extreme'
            };
            return aliases[clean] || 'normal';
        }

        async function classifyDiceCheck(playerText) {
            const stats = currentScenario.playerStats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const prompt = `你是 TRPG 檢定分類器。只判斷這個行動最適合哪一項六屬性與難度，不要擲骰、不要判斷成功失敗，也不要因為某項數值較高就偏袒它。

玩家行動：${playerText}
目前情境：${scene.name || '未命名'}
情境法則：${scene.lore || '無特殊設定'}
玩家六屬：STR ${stats.str}, DEX ${stats.dex}, CON ${stats.con}, INT ${stats.int}, WIS ${stats.wis}, CHA ${stats.cha}

選擇原則：
- STR 力量：搬動、破壞、壓制、純肌力。
- DEX 敏捷：閃避、潛行、精細操作、反應速度。
- CON 體質：忍耐、抵抗毒病疲勞、維持體力。
- INT 智力：知識、推理、破解、分析技術。
- WIS 感知：觀察、直覺、洞察、追蹤與察覺。
- CHA 魅力：說服、欺瞞、威嚇、表演與社交影響。
- 難度只能是 easy、normal、hard、extreme，依行動本身與情境風險決定。

只輸出 JSON：{"attribute":"str|dex|con|int|wis|cha","difficulty":"easy|normal|hard|extreme","reason":"30字內理由"}`;
            const rawText = await requestAIText(prompt, { kind: 'dice', maxTokens: 160 });
            let parsed;
            try { parsed = JSON.parse(extractJsonText(rawText)); }
            catch (error) { throw new Error('AI 無法辨識這次檢定屬性，請稍後重試。'); }
            const statKey = normalizeDiceStatKey(parsed.attribute || parsed.stat || parsed.ability);
            if (!DICE_STATS[statKey]) throw new Error('AI 沒有回傳有效的六屬性檢定。');
            return {
                statKey,
                difficultyKey: normalizeDiceDifficulty(parsed.difficulty),
                reason: valueToText(parsed.reason, '依玩家行動判定')
            };
        }

        function stripHardDiceDirective(text) {
            return valueToText(text).replace(/\n?\(系統硬判定：[\s\S]*?AI 不得更改。\)/, '').trim();
        }

        function getResurrectionIntent(text) {
            const cleanText = stripHardDiceDirective(text);
            if (!/(復活|復生|起死回生|死而復生|救活|救回.*(生命|性命)|讓.*活過來|使.*活過來|喚回.*靈魂|召回.*靈魂|喚回亡者|帶回人世|逆轉.*死亡|改變.*死亡|打破.*死亡)/.test(cleanText)) return null;
            const researchOnly = /(調查|詢問|研究|尋找|查明|了解|討論|蒐集|收集).{0,10}(復活|復生|死亡)/.test(cleanText)
                && !/(嘗試|試圖|開始|進行|施展|發動|啟動|強行|立刻|現在|我要|我試著|讓|使|將|把).{0,16}(復活|復生|起死回生|救活|救回|活過來|喚回|召回|帶回人世|逆轉|改變|打破)/.test(cleanText);
            if (researchOnly) return null;
            const deadNpcs = (currentScenario?.npcs || []).filter(isNpcDead);
            const namedNpc = deadNpcs.find(npc => cleanText.includes(valueToText(npc.name)));
            const npc = namedNpc || (deadNpcs.length === 1 ? deadNpcs[0] : null);
            return npc ? { npc, text: cleanText } : null;
        }

        function parseHardDiceOutcome(text) {
            const match = valueToText(text).match(/結果【(大成功|成功|失敗|大失敗)】/);
            if (!match) return null;
            return { result: match[1], success: match[1] === '成功' || match[1] === '大成功' };
        }

        function enforceResurrectionOptionRules(option) {
            const intent = getResurrectionIntent(option?.text);
            if (!intent) return option;
            const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            if (difficulty === 'nightmare' || isNpcRevivePermanentlyLocked(intent.npc)) return null;
            if (difficulty === 'hard') {
                const rank = { easy: 0, normal: 1, hard: 2, extreme: 3 };
                return {
                    ...option,
                    check: DICE_STATS[option.check] ? option.check : 'wis',
                    difficulty: (rank[option.difficulty] ?? 1) < rank.hard ? 'hard' : option.difficulty
                };
            }
            return option;
        }

        function recordResurrectionOutcome(eventText) {
            currentAdventureLog = mergeAdventureLog(currentAdventureLog, eventText);
            applyAutomaticMemoryUpdate({ story_summary: [eventText] });
            createSystemAlert(eventText);
        }

        function resolveProgrammedResurrectionAction(playerText, inputContext) {
            const intent = getResurrectionIntent(playerText);
            if (!intent) return { handled: false, extraPrompt: '' };
            const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
            if (difficulty === 'standard' && inputContext.mode === 'creator') {
                if (!reviveNpc(intent.npc, '「神」介入復活')) return { handled: false, extraPrompt: '' };
                const eventText = `${intent.npc.name} 在創作者指令介入下恢復存活`;
                recordResurrectionOutcome(eventText);
                return { handled: true, success: true, npc: intent.npc, extraPrompt: `【程式已確認復活】${eventText}。請承接此結果演出，不得再次改變。` };
            }
            if (difficulty !== 'hard') return { handled: false, extraPrompt: '' };
            const outcome = parseHardDiceOutcome(playerText);
            if (!outcome) return { handled: false, extraPrompt: '' };
            if (outcome.success) {
                if (!reviveNpc(intent.npc, '困難模式復活檢定成功', { allowHardSuccess: true })) return { handled: false, extraPrompt: '' };
                const eventText = `${intent.npc.name} 的復活檢定成功，已恢復存活`;
                recordResurrectionOutcome(eventText);
                return { handled: true, success: true, npc: intent.npc, extraPrompt: `【復活硬判定結果】${eventText}。這是程式最終結果，必須演出成功，不得回傳 npc_revives 或改判。` };
            }
            lockFailedNpcRevival(intent.npc, `復活檢定${outcome.result}`);
            const eventText = `${intent.npc.name} 的復活檢定失敗，已永久失去復活機會`;
            recordResurrectionOutcome(eventText);
            return { handled: true, success: false, npc: intent.npc, extraPrompt: `【復活硬判定結果】${eventText}。這是程式最終結果，必須演出失敗；禁止復活、禁止提供新的復活選項。` };
        }

        async function sendDiceChoice() {
            if (getCurrentGameOver()) { applyGameOverUi(); return; }
            const inputEl = document.getElementById('player-input');
            const playerText = inputEl.value.trim();
            if (!playerText) { alert('請先輸入你打算做什麼，再來擲骰子喔！'); return; }
            if (creatorInputArmed) {
                alert('「神」模式是創作者指令，不使用玩家六圍。請按一般發送。');
                return;
            }
            const inputContext = parseSceneInputContext(stripHardDiceDirective(playerText));
            if (inputContext.mode !== 'character') {
                alert('目前是輔助旁白／創作者視角，不會使用玩家六圍擲骰。請改用一般送出。');
                return;
            }

            const suggestedText = inputEl.dataset.diceSuggestedText || '';
            const suggestedStat = normalizeDiceStatKey(inputEl.dataset.diceStat);
            const hasValidSuggestion = suggestedText === playerText && DICE_STATS[suggestedStat];
            inputEl.disabled = true;
            document.getElementById('send-btn').disabled = true;
            document.getElementById('dice-btn').disabled = true;
            document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('判定引擎') : '判定引擎';
            document.getElementById('loading').style.display = 'block';

            try {
                let classification = hasValidSuggestion
                    ? {
                        statKey: suggestedStat,
                        difficultyKey: normalizeDiceDifficulty(inputEl.dataset.diceDifficulty),
                        reason: '採用行動選項的預設檢定'
                    }
                    : await classifyDiceCheck(playerText);
                const resurrectionIntent = getResurrectionIntent(playerText);
                if (resurrectionIntent && normalizeGameDifficulty(currentScenario?.gameDifficulty) === 'hard') {
                    if (isNpcRevivePermanentlyLocked(resurrectionIntent.npc)) throw new Error('這名 NPC 的復活機會已經失敗，無法再次嘗試。');
                    const rank = { easy: 0, normal: 1, hard: 2, extreme: 3 };
                    if ((rank[classification.difficultyKey] ?? 1) < rank.hard) classification.difficultyKey = 'hard';
                    classification.reason = `困難模式復活檢定：${resurrectionIntent.npc.name}`;
                }
                const check = calculateDiceCheck(classification.statKey, classification.difficultyKey);
                const signedAbility = check.abilityModifier >= 0 ? `+${check.abilityModifier}` : String(check.abilityModifier);
                const signedTotal = check.totalModifier >= 0 ? `+${check.totalModifier}` : String(check.totalModifier);
                const gameDifficultyText = check.gameDifficultyDcModifier ? `｜遊戲難度 ${check.gameDifficultyLabel}：DC +${check.gameDifficultyDcModifier}` : `｜遊戲難度 ${check.gameDifficultyLabel}`;
                const survivalText = check.survivalModifier ? `｜生存狀態修正 ${check.survivalModifier}` : '';
                const directive = `(系統硬判定：${check.code} ${check.label}｜屬性 ${check.score}（加值 ${signedAbility}）｜行動難度 ${check.difficultyLabel}：基礎 DC ${check.difficultyDc}${gameDifficultyText}${survivalText}｜最終 DC ${check.dc}｜D20 ${check.roll} ${signedTotal} = ${check.total}｜結果【${check.result}】｜判定理由：${classification.reason}。此結果由程式計算，AI 不得更改。)`;
                pendingDiceSummary = `${check.code} ${check.label}｜${check.result}｜${check.roll}${signedTotal}=${check.total}／DC${check.dc}`;
                inputEl.value = `${playerText}\n${directive}`;
                document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
                await sendChoice();
            } catch (error) {
                pendingDiceSummary = null;
                inputEl.disabled = false;
                document.getElementById('send-btn').disabled = false;
                document.getElementById('dice-btn').disabled = false;
                document.getElementById('loading').style.display = 'none';
                document.getElementById('ui-target-typing').innerText = window.uiMessage ? window.uiMessage('引擎 (DM)') : '引擎 (DM)';
                inputEl.focus();
                alert(getFriendlyErrorMessage(error, '無法完成屬性判定，請稍後再試。'));
            }
        }

        function adjustInputHeight() { const input = document.getElementById('player-input'); if(!input) return; input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 100) + "px"; }

        function checkInputKey(e) { adjustInputHeight(); const isMobile = window.innerWidth <= 600; if (!isMobile) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChoice(); } } }

        function applyMemoryNoteControlCommand(text) {
            const commandPattern = /[［\[【]\s*(暫停追加|恢復追加)\s*[］\]】]/g;
            let lastCommand = '';
            const cleanedText = valueToText(text).replace(commandPattern, (match, command) => {
                lastCommand = command;
                return '';
            }).replace(/\s{2,}/g, ' ').trim();

            if (!lastCommand) return { text: valueToText(text).trim(), handled: false, paused: currentScenario.memoryNotesPaused === true };

            const paused = lastCommand === '暫停追加';
            currentScenario.memoryNotesPaused = paused;
            createSystemNote(paused
                ? '重要紀錄：已暫停 AI 自動追加（仍可在面板手動修改）'
                : '重要紀錄：已恢復 AI 自動追加');
            return { text: cleanedText, handled: true, paused };
        }

        function sceneUsesNarratorDefinition(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            const playerRole = valueToText(scene?.playerRole);
            const transitionRule = valueToText(scene?.transitionRule);
            const combined = `${playerRole}
${transitionRule}`;
            const narratorRole = /輔助旁白|場外旁白|旁白視角|旁白模式|創作者視角|導演視角|觀察者視角/.test(combined);
            const playerName = valueToText(currentScenario.playerName);
            const mentionsPlayer = /玩家|主角|player/i.test(combined) || (playerName && combined.includes(playerName));
            const explicitAbsence = /不在場|目前不在|暫時不在|離線|離場|缺席|未登場|尚未登場|場外/.test(combined);
            return narratorRole || (mentionsPlayer && explicitAbsence);
        }

        function getSceneParticipationMode(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            if (scene?.runtimePlayerPresence === 'present') return 'character';
            if (scene?.runtimePlayerPresence === 'absent') return 'narrator';
            return sceneUsesNarratorDefinition(scene) ? 'narrator' : 'character';
        }

        function normalizeModeSwitchCommandText(text) {
            return valueToText(text)
                .trim()
                .replace(/^\s*[［\[【]\s*/, '')
                .replace(/\s*[］\]】]\s*$/, '')
                .trim();
        }

        function getLocalModeSwitchType(text) {
            const command = normalizeModeSwitchCommandText(text);
            if (!command) return '';
            if (/^(?:switch\s+(?:to\s+)?)?(?:narrator|narrator\s+mode)$/i.test(command)) return 'narrator';
            if (/^(?:switch\s+(?:to\s+)?)?(?:player|player\s+mode)$/i.test(command)) return 'player';
            if (/^(?:ナレーター(?:に|へ)?切替|ナレーター(?:に|へ)?切り替え|ナレーターモード)$/.test(command)) return 'narrator';
            if (/^(?:プレイヤー(?:に|へ)?切替|プレイヤー(?:に|へ)?切り替え|プレイヤーモード)$/.test(command)) return 'player';
            if (/^(?:切換|切到|切成|改成|改為|轉成|轉換為)?\s*(?:輔助旁白|旁白模式|輔助旁白模式|旁白|導演模式|創作者視角)$/.test(command)) return 'narrator';
            if (/^(?:切回|切換為|切換|回到|恢復|改回|轉回)?\s*(?:玩家|玩家模式|角色行動|角色行動模式)$/.test(command)) return 'player';
            if (/^(?:玩家登入|玩家回來|玩家回歸|玩家登場|玩家上線|恢復玩家模式|回到玩家模式|恢復角色行動|普通輸入恢復角色行動)$/.test(command)) return 'player';
            if (/^(?:玩家離場|玩家退場|玩家離線|玩家不在場|切換為輔助旁白|切換輔助旁白|切到輔助旁白|切換旁白|切到旁白)$/.test(command)) return 'narrator';
            return '';
        }

        function parseSceneInputContext(text, scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            const rawText = valueToText(text).trim();
            const creatorPattern = /^\s*[［\[【]\s*創作者指令\s*[］\]】]\s*/i;
            if (creatorPattern.test(rawText)) {
                const content = rawText.replace(creatorPattern, '').trim();
                return { mode: 'creator', content, rawText, explicit: true, localOnly: Boolean(getLocalModeSwitchType(content)) };
            }
            const shortcutModeSwitch = getLocalModeSwitchType(rawText);
            if (shortcutModeSwitch) {
                return { mode: 'creator', content: normalizeModeSwitchCommandText(rawText), rawText, explicit: true, localOnly: true };
            }
            const mode = getSceneParticipationMode(scene);
            return { mode, content: rawText, rawText, explicit: false, localOnly: false };
        }

        function applyCreatorPresenceDirective(context) {
            if (context?.mode !== 'creator' || !context.content) return '';
            const scene = currentScenario.scenarios?.[currentScenarioIndex];
            if (!scene) return '';
            const playerName = valueToText(currentScenario.playerName);
            const content = normalizeModeSwitchCommandText(context.content);
            const notices = [];
            const directModeSwitch = getLocalModeSwitchType(content);

            if (directModeSwitch === 'narrator') {
                scene.runtimeGuideRole = '輔助旁白';
                scene.runtimePlayerPresence = 'absent';
                if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                notices.push(`已切換為輔助旁白模式；玩家角色 ${playerName} 不預設在場`);
                return notices.join('；');
            }
            if (directModeSwitch === 'player') {
                scene.runtimePlayerPresence = 'present';
                delete scene.runtimeGuideRole;
                if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                notices.push(`玩家角色 ${playerName} 已設為在場；後續普通輸入恢復角色行動模式`);
                return notices.join('；');
            }

            const mentionsPlayer = /玩家|主角|player/i.test(content) || (playerName && content.includes(playerName));
            const guideMatch = content.match(/(?:轉換為|切換為|切到|改為|成為)\s*([^，。；\n]{1,24})/);
            const guideRole = guideMatch ? valueToText(guideMatch[1]).replace(/角色$/, '').trim() : '';

            if (guideRole && /引導|旁白|導演|NPC|配角|角色/.test(guideRole)) {
                scene.runtimeGuideRole = guideRole;
                scene.runtimePlayerPresence = 'absent';
                if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                notices.push(`操作者已轉換為「${guideRole}」引導身分；原玩家角色不預設在場`);
            }

            if (mentionsPlayer) {
                const absenceNow = /目前.{0,8}不在|仍然?.{0,6}(?:離線|不在)|暫時.{0,6}不在|尚未回歸|離線|離場|退場|不在場/.test(content);
                const returnNow = /回到現場|現在.{0,6}回歸|重新.{0,6}(?:登場|上線)|回來了|讓.{0,12}回來|加入.{0,8}(?:現場|支線)|正式登場|玩家.{0,4}(?:登入|回來|回歸|登場|上線)|(?:切回|回到|恢復|改回|轉回).{0,4}(?:玩家|玩家模式|角色行動)|普通輸入.{0,8}恢復(?:角色行動|玩家)/.test(content);
                if (absenceNow) {
                    scene.runtimePlayerPresence = 'absent';
                    if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                    notices.push(`玩家角色 ${playerName} 已設為不在場；後續普通輸入採輔助旁白模式`);
                } else if (returnNow) {
                    scene.runtimePlayerPresence = 'present';
                    delete scene.runtimeGuideRole;
                    if (typeof setCreatorInputMode === 'function') setCreatorInputMode(false, false);
                    notices.push(`玩家角色 ${playerName} 已設為在場；後續普通輸入恢復角色行動模式`);
                }
            }
            return notices.join('；');
        }

        function buildSceneParticipationInstruction(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}) {
            if (getSceneParticipationMode(scene) === 'narrator') {
                const guideRole = valueToText(scene?.runtimeGuideRole);
                const guideText = guideRole ? `操作者目前以「${guideRole}」身分引導場景。` : '操作者目前是輔助旁白／導演。';
                return `【場景視角與在場規則】${guideText}玩家角色 ${currentScenario.playerName} 不預設在場。普通輸入不得解讀為玩家角色說話或行動。只有當前指令或既有紀錄明確建立「回歸、登場、上線或回到現場」後，才能讓玩家角色出現。`;
            }
            return `【場景視角與在場規則】玩家角色 ${currentScenario.playerName} 預設在場，普通輸入視為角色行動；標有［創作者指令］的內容仍是角色外最高權限指示。`;
        }

        function updatePlayerInputPlaceholder() {
            const input = document.getElementById('player-input');
            if (!input) return;
            if (creatorInputArmed) {
                input.placeholder = window.uiMessage ? window.uiMessage('輸入本回合的創作者指令...') : '輸入本回合的創作者指令...';
                return;
            }
            const placeholder = getSceneParticipationMode() === 'narrator'
                ? '輸入輔助旁白，或點「神」下達創作者指令...'
                : '輸入角色行動，或點「神」下達創作者指令...';
            input.placeholder = window.uiMessage ? window.uiMessage(placeholder) : placeholder;
        }

        function setCreatorInputMode(enabled, focusInput = true) {
            creatorInputArmed = Boolean(enabled);
            const button = document.getElementById('creator-mode-btn');
            if (button) {
                button.classList.toggle('active', creatorInputArmed);
                button.setAttribute('aria-pressed', String(creatorInputArmed));
                const title = creatorInputArmed ? '關閉持續創作者指令模式' : '開啟持續創作者指令模式';
                button.title = window.uiMessage ? window.uiMessage(title) : title;
                if (!creatorInputArmed) button.blur();
            }
            updatePlayerInputPlaceholder();
            const input = document.getElementById('player-input');
            if (focusInput && input && !input.disabled) input.focus();
        }

        function toggleCreatorInputMode() {
            setCreatorInputMode(!creatorInputArmed);
        }

        async function sendChoice() {
            if (getCurrentGameOver()) { applyGameOverUi(); return; }
            const inputEl = document.getElementById('player-input'); const sendBtn = document.getElementById('send-btn'); const diceBtn = document.getElementById('dice-btn'); 
            const rawPlayerText = inputEl.value.trim(); if(!rawPlayerText) return;
            const memoryControl = applyMemoryNoteControlCommand(rawPlayerText);
            let playerText = memoryControl.text;
            if (creatorInputArmed && playerText && !/^\s*[［\[【]\s*創作者指令\s*[］\]】]/i.test(playerText)) {
                playerText = `［創作者指令］${playerText}`;
            }
            if (memoryControl.handled) {
                inputEl.value = '';
                inputEl.style.height = 'auto';
                delete inputEl.dataset.diceSuggestedText;
                delete inputEl.dataset.diceStat;
                delete inputEl.dataset.diceDifficulty;
                saveCurrentProgress();
                if (!playerText) { inputEl.focus(); return; }
            }
            const inputContext = parseSceneInputContext(stripHardDiceDirective(playerText));
            if (inputContext.mode === 'creator' && !inputContext.content) {
                inputEl.value = '';
                inputEl.style.height = 'auto';
                createSystemNote('創作者指令後方沒有內容，尚未送出給 AI');
                saveCurrentProgress();
                inputEl.focus();
                return;
            }
            const presenceUpdate = applyCreatorPresenceDirective(inputContext);
            if (presenceUpdate) {
                createSystemNote(presenceUpdate);
                updatePlayerInputPlaceholder();
                if (inputContext.localOnly || Boolean(getLocalModeSwitchType(inputContext.content))) {
                    inputEl.value = '';
                    inputEl.style.height = 'auto';
                    delete inputEl.dataset.diceSuggestedText;
                    delete inputEl.dataset.diceStat;
                    delete inputEl.dataset.diceDifficulty;
                    const options = document.getElementById('options-area');
                    if (options) options.innerHTML = '';
                    saveCurrentProgress();
                    inputEl.focus();
                    return;
                }
            }
            const suggestedStat = normalizeDiceStatKey(inputEl.dataset.diceStat);
            const shouldAutoRoll = inputContext.mode === 'character'
                && !playerText.includes('系統硬判定')
                && inputEl.dataset.diceSuggestedText === playerText
                && DICE_STATS[suggestedStat];
            const resurrectionIntent = getResurrectionIntent(playerText);
            if (resurrectionIntent) {
                const difficulty = normalizeGameDifficulty(currentScenario?.gameDifficulty);
                if (difficulty === 'nightmare') {
                    alert('極限模式的死亡永久成立，無法嘗試復活。');
                    return;
                }
                if (difficulty === 'hard') {
                    if (isNpcRevivePermanentlyLocked(resurrectionIntent.npc)) {
                        alert('這名 NPC 的復活檢定已經失敗，不能再次嘗試。');
                        return;
                    }
                    if (inputContext.mode !== 'character') {
                        alert('困難模式不能由「神」直接復活；必須以角色行動進行一次復活檢定。');
                        return;
                    }
                    const hasVerifiedResurrectionRoll = Boolean(pendingDiceSummary) && Boolean(parseHardDiceOutcome(playerText));
                    if (!hasVerifiedResurrectionRoll && !shouldAutoRoll) {
                        alert('困難模式的復活必須檢定。請按「擲骰」，成功才能復活；失敗後將永久無法再嘗試。');
                        return;
                    }
                }
            }
            if (shouldAutoRoll) { await sendDiceChoice(); return; }
            const diceSummary = pendingDiceSummary;
            pendingDiceSummary = null;
            const displayText = stripHardDiceDirective(playerText);

            inputEl.value = ""; inputEl.style.height = "auto"; inputEl.disabled = true; sendBtn.disabled = true; diceBtn.disabled = true;
            delete inputEl.dataset.diceSuggestedText;
            delete inputEl.dataset.diceStat;
            delete inputEl.dataset.diceDifficulty;
            document.getElementById('options-area').innerHTML = ''; document.getElementById('loading').style.display = 'block';

            if (inputContext.mode === 'creator') {
                appendCreatorInstruction('創作者指令', inputContext.content);
                chatScripts[currentChatPageIndex].push(`【創作者指令】：${inputContext.content}`);
            } else if (inputContext.mode === 'narrator') {
                appendCreatorInstruction('輔助旁白', inputContext.content);
                chatScripts[currentChatPageIndex].push(`【輔助旁白】：${inputContext.content}`);
            } else if(displayText.startsWith("（") || displayText.startsWith("(")) {
                chatScripts[currentChatPageIndex].push(`【旁白】：玩家行動 - ${playerText}`); appendNarrative(`玩家行動：\n${displayText}`);
            } else {
                appendMessage(currentScenario.playerName, displayText); chatScripts[currentChatPageIndex].push(`${currentScenario.playerName}：${playerText}`);
            }
            if (diceSummary) createSystemAlert(diceSummary);
            const manualAffectionUpdates = applyManualAffectionCommands(displayText);
            const manualAffectionPrompt = buildManualAffectionPrompt(manualAffectionUpdates);
            const manualAffectionNpcIds = manualAffectionUpdates.map(update => update.npcId);
            const resurrectionResolution = resolveProgrammedResurrectionAction(playerText, inputContext);
            const combinedSystemPrompt = [manualAffectionPrompt, resurrectionResolution.extraPrompt].filter(Boolean).join('\n\n');
            
            saveCurrentProgress();
            try {
                const protectedRevivedNpcIds = resurrectionResolution.success && resurrectionResolution.npc
                    ? [resurrectionResolution.npc.id || resurrectionResolution.npc.name]
                    : [];
                await callAI_JSON(combinedSystemPrompt, false, playerText, manualAffectionNpcIds, protectedRevivedNpcIds);
            } finally {
                const gameOver = getCurrentGameOver();
                inputEl.disabled = Boolean(gameOver);
                sendBtn.disabled = Boolean(gameOver);
                diceBtn.disabled = Boolean(gameOver);
                document.getElementById('loading').style.display = 'none';
                if (gameOver) applyGameOverUi();
                else inputEl.focus();
            }
        }

        function createSystemAlert(msg) {
            chatScripts[currentChatPageIndex].push(`【系統提示】：${msg}`);
            const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(msg) : msg;
            const msgBox = document.getElementById('dialogue-box'); const alertDiv = document.createElement('div'); alertDiv.className = 'alert-msg'; alertDiv.innerText = displayMsg;
            msgBox.appendChild(alertDiv); msgBox.scrollTop = msgBox.scrollHeight;
        }


        function createSystemNote(msg) {
            const formatted = `— ${msg} —`;
            chatScripts[currentChatPageIndex].push(`【系統提示】：${formatted}`);
            const displayMsg = window.uiSystemMessage ? window.uiSystemMessage(msg) : msg;
            const msgBox = document.getElementById('dialogue-box');
            const noteDiv = document.createElement('div');
            noteDiv.className = 'system-msg';
            noteDiv.innerText = `— ${displayMsg} —`;
            msgBox.appendChild(noteDiv);
            msgBox.scrollTop = msgBox.scrollHeight;
        }


        function getRequiredSurvivalFlags() {
            const flags = [];
            if (currentHp <= 0) flags.push(AUTO_SURVIVAL_FLAGS.hpZero);
            else if (currentHp <= 20) flags.push(AUTO_SURVIVAL_FLAGS.hpCritical);
            if (currentSan <= 0) flags.push(AUTO_SURVIVAL_FLAGS.sanZero);
            else if (currentSan <= 20) flags.push(AUTO_SURVIVAL_FLAGS.sanCritical);
            return flags;
        }

        function getGameDifficultyInstruction() {
            const mode = getGameDifficultyInfo();
            if (mode.gameOver === 'forced') return `【遊戲難度：${mode.label}】所有檢定 DC 額外 +${mode.dcModifier}。HP 或 SAN 歸零時程式會立即鎖定 Game Over，旁白必須承接壞結局。`;
            if (mode.gameOver === 'possible') return `【遊戲難度：${mode.label}】所有檢定 DC 額外 +${mode.dcModifier}。HP 或 SAN 歸零時程式會在回覆完成後擲 D20 生死檢定：1–10 保命並回到 1 點，11–20 Game Over。你只能描寫倒下或崩潰，不可提前宣判最終生死。`;
            return `【遊戲難度：${mode.label}】沒有 Game Over。HP 或 SAN 歸零時程式會啟動保護機制並回到 1 點。`;
        }

        function getCurrentGameOver() {
            return currentSaveId && savesData[currentSaveId] ? savesData[currentSaveId].gameOver || null : null;
        }

        function applyGameOverUi() {
            const gameOver = getCurrentGameOver();
            if (!gameOver) return false;
            const input = document.getElementById('player-input');
            const sendButton = document.getElementById('send-btn');
            const diceButton = document.getElementById('dice-btn');
            if (input) {
                input.disabled = true;
                input.value = '';
                input.placeholder = `GAME OVER：${gameOver.reason || '本次冒險已結束'}`;
            }
            if (sendButton) sendButton.disabled = true;
            if (diceButton) diceButton.disabled = true;
            const options = document.getElementById('options-area');
            if (options) options.innerHTML = '';
            return true;
        }

        function resolveSurvivalOutcome(forcedRoll = null) {
            if (getCurrentGameOver()) return { gameOver: true, existing: true };
            const zeroKinds = [];
            if (currentHp <= 0) zeroKinds.push('HP');
            if (currentSan <= 0) zeroKinds.push('SAN');
            if (!zeroKinds.length) return { gameOver: false, rescued: false };

            const mode = getGameDifficultyInfo();
            const reason = `${zeroKinds.join(' 與 ')} 歸零`;
            let survivalRoll = null;
            let gameOver = mode.gameOver === 'forced';

            if (mode.gameOver === 'possible') {
                survivalRoll = forcedRoll === null ? Math.floor(Math.random() * 20) + 1 : Math.max(1, Math.min(20, Math.round(forcedRoll)));
                gameOver = survivalRoll >= 11;
            }

            if (gameOver) {
                savesData[currentSaveId].gameOver = { reason, mode: mode.key, roll: survivalRoll, at: new Date().toLocaleString() };
                createSystemAlert(mode.gameOver === 'forced'
                    ? `— GAME OVER：${reason}（極限模式）—`
                    : `— 生死檢定失敗：D20 ${survivalRoll}，GAME OVER —`);
                applyGameOverUi();
                return { gameOver: true, roll: survivalRoll, reason };
            }

            if (currentHp <= 0) currentHp = 1;
            if (currentSan <= 0) currentSan = 1;
            document.getElementById('ui-hp').innerText = currentHp;
            document.getElementById('ui-san').innerText = currentSan;
            createSystemAlert(mode.gameOver === 'possible'
                ? `— 生死檢定成功：D20 ${survivalRoll}，${reason}後保留 1 點 —`
                : `— 保護機制啟動：${reason}後保留 1 點 —`);
            return { gameOver: false, rescued: true, roll: survivalRoll, reason };
        }

        function buildSurvivalInstruction() {
            const instructions = [];
            const mode = getGameDifficultyInfo();
            if (currentHp <= 0) {
                if (mode.gameOver === 'forced') instructions.push('【強制 Game Over】玩家 HP 已歸零。narrative 必須優先演出死亡、敗北或不可繼續冒險的壞結局；不得自動恢復 HP。');
                else if (mode.gameOver === 'possible') instructions.push('【致命危機】玩家 HP 已歸零。可依先前鋪陳演出 Game Over；只有現場角色確實能救援時才可倖存，若倖存 hp_change 必須至少恢復到 1。');
                else instructions.push('【強制保護事件】玩家 HP 已歸零。本回合不可照常冒險；narrative 必須先演出隊友救援、撤離或安全機制，且 hp_change 必須讓 HP 至少恢復到 1。');
            } else if (currentHp <= 20) {
                instructions.push('【重傷狀態】玩家 HP 僅剩 20 以下。行動能力、判定與 NPC 反應必須明顯受到重傷影響。');
            }
            if (currentSan <= 0) {
                if (mode.gameOver === 'forced') instructions.push('【強制 Game Over】玩家 SAN 已歸零。narrative 必須優先演出精神崩潰、永久失控或不可繼續冒險的壞結局；不得自動恢復 SAN。');
                else if (mode.gameOver === 'possible') instructions.push('【精神崩潰危機】玩家 SAN 已歸零。可依先前鋪陳演出 Game Over；只有現場角色確實能照護時才可倖存，若倖存 san_change 必須至少恢復到 1。');
                else instructions.push('【強制照護事件】玩家 SAN 已歸零。本回合不可照常冒險；narrative 必須先演出精神崩潰、隊友安撫或安全撤離，且 san_change 必須讓 SAN 至少恢復到 1。');
            } else if (currentSan <= 20) {
                instructions.push('【精神危機】玩家 SAN 僅剩 20 以下。感知、情緒、判定與 NPC 反應必須明顯受到影響。');
            }
            return instructions.length ? `\n${instructions.join('\n')}` : '';
        }

        function syncSurvivalFlags({ announce = false } = {}) {
            const previousAutoFlags = currentFlags.filter(flag => AUTO_SURVIVAL_FLAG_SET.has(flag));
            const requiredFlags = getRequiredSurvivalFlags();
            currentFlags = currentFlags.filter(flag => !AUTO_SURVIVAL_FLAG_SET.has(flag));
            requiredFlags.forEach(flag => currentFlags.push(flag));

            if (!announce || getCurrentGameOver()) return;

            requiredFlags.forEach(flag => {
                if (previousAutoFlags.includes(flag)) return;
                if (flag === AUTO_SURVIVAL_FLAGS.hpZero) {
                    const mode = getGameDifficultyInfo();
                    createSystemAlert(mode.gameOver === 'forced' ? 'HP 歸零：極限模式 Game Over。' : mode.gameOver === 'possible' ? 'HP 歸零：困難模式進入致命結局判定。' : 'HP 歸零：保護機制啟動，下一回合優先演出救援。');
                }
                else if (flag === AUTO_SURVIVAL_FLAGS.hpCritical) createSystemAlert('HP 已進入重傷區間，後續行動與判定將受到影響。');
                else if (flag === AUTO_SURVIVAL_FLAGS.sanZero) {
                    const mode = getGameDifficultyInfo();
                    createSystemAlert(mode.gameOver === 'forced' ? 'SAN 歸零：極限模式 Game Over。' : mode.gameOver === 'possible' ? 'SAN 歸零：困難模式進入致命結局判定。' : 'SAN 歸零：照護機制啟動，下一回合優先處理精神崩潰。');
                }
                else if (flag === AUTO_SURVIVAL_FLAGS.sanCritical) createSystemAlert('SAN 已進入精神危機區間，後續感知與判定將受到影響。');
            });

            const hpRecovered = previousAutoFlags.some(flag => flag === AUTO_SURVIVAL_FLAGS.hpCritical || flag === AUTO_SURVIVAL_FLAGS.hpZero)
                && currentHp > 20;
            const sanRecovered = previousAutoFlags.some(flag => flag === AUTO_SURVIVAL_FLAGS.sanCritical || flag === AUTO_SURVIVAL_FLAGS.sanZero)
                && currentSan > 20;
            if (hpRecovered) createSystemAlert('HP 已恢復至安全區間，重傷狀態解除。');
            if (sanRecovered) createSystemAlert('SAN 已恢復至安全區間，精神危機狀態解除。');
        }

        function getFriendlyApiErrorMessage(status = 0, rawMessage = '') {
            const message = valueToText(rawMessage).toLowerCase();
            if (status === 401 || status === 403 || /api.?key|unauthori[sz]ed|authentication|permission/.test(message)) {
                return 'API Key 無效或沒有使用權限，請回首頁重新驗證。';
            }
            if (status === 402 || /more credits|insufficient credits|can only afford|fewer max.?tokens|payment required|credit balance/.test(message)) {
                return 'OpenRouter 可用額度不足，請補充餘額或改用其他模型。';
            }
            if (status === 429 || /quota|rate.?limit|resource.?exhausted|too many requests/.test(message)) {
                return 'API 額度或請求次數已達上限，請稍後再試或改用其他模型。';
            }
            if (/context length|maximum context|prompt.{0,12}too long|too many tokens|token limit|input tokens/.test(message)) {
                return '送給 AI 的背景資料太長，請先整理摘要後再試。';
            }
            if (/json|response.?format|invalid schema/.test(message)) {
                return 'AI 回覆格式異常，本次內容沒有套用，請重新發送。';
            }
            if (/safety|blocked|content filter/.test(message)) {
                return 'AI 因內容安全限制沒有回覆，請調整本回合文字後再試。';
            }
            if (status === 408 || /timeout|timed out/.test(message)) {
                return 'AI 回覆逾時，請稍後再試。';
            }
            if (status >= 500 || /server error|service unavailable|overloaded/.test(message)) {
                return 'AI 服務暫時忙碌，請稍後再試。';
            }
            if (/network|failed to fetch|connection|offline/.test(message)) {
                return '連線失敗，請確認網路後再試。';
            }
            return 'AI 暫時無法完成這次回覆，請稍後再試。';
        }

        function getFriendlyErrorMessage(error, fallback = '操作失敗，請稍後再試。') {
            if (error?.userFriendly === true && error.message) return error.message;
            const rawMessage = valueToText(error?.message || error);
            if (!rawMessage) return fallback;
            if (/API Key 未載入|尚未選擇模型|已暫停|已取消|輸出長度達上限|沒有產生可用情境|NPC 不足|重新生成|復活機會|無法再次嘗試/.test(rawMessage)) return rawMessage;
            return getFriendlyApiErrorMessage(Number(error?.status) || 0, rawMessage) || fallback;
        }

        function buildAIRequest(fullPrompt, maxTokens = MAX_AI_OUTPUT_TOKENS, kind = 'normal') {
            refreshApiCredentials();
            if (!apiKey) throw new Error(`${apiProvider === 'openrouter' ? 'OpenRouter' : 'Google Gemini'} API Key 未載入，請回到首頁重新驗證金鑰。`);
            if (!selectedModel) throw new Error("尚未選擇模型，請回到首頁重新選擇模型。");
            const temperature = kind === 'generation' ? 0.9 : (kind === 'normal' ? 0.7 : (kind === 'journal' || kind === 'summary' ? 0.25 : 0.1));
            if (apiProvider === 'openrouter') {
                return {
                    url: 'https://openrouter.ai/api/v1/chat/completions',
                    options: {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'X-Title': 'TRPG Whisper'
                        },
                        body: JSON.stringify({
                            model: selectedModel,
                            messages: [{ role: 'user', content: fullPrompt }],
                            response_format: { type: 'json_object' },
                            temperature,
                            max_tokens: maxTokens
                        })
                    }
                };
            }

            const safetySettings = [{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }];
            return {
                url: `https://generativelanguage.googleapis.com/v1beta/${selectedModel}:generateContent?key=${apiKey}`,
                options: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: fullPrompt }] }], safetySettings: safetySettings, generationConfig: { responseMimeType: "application/json", temperature, maxOutputTokens: maxTokens } })
                }
            };
        }

        function getAIResponseText(data) {
            if (apiProvider === 'openrouter') {
                return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "";
            }
            if (data.candidates?.[0]?.finishReason === 'SAFETY') {
                throw new Error("AI 回覆被安全系統阻擋，請調整輸入內容後再試。");
            }
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }

        function cancelActiveAIRequest() {
            if (!activeAIAbortController) return;
            activeAIAbortReason = 'user';
            activeAIAbortController.abort();
        }

        function isRetryableAIRequestError(error) {
            if (error?.retryable === true) return true;
            if (error?.name === 'TypeError' || error?.name === 'SyntaxError') return true;
            return /network|failed to fetch|connection|temporar/i.test(String(error?.message || ''));
        }

        async function requestAIText(fullPrompt, { kind = 'normal', maxTokens = MAX_AI_OUTPUT_TOKENS } = {}) {
            let lastError = null;
            const longOperation = kind === 'journal' || kind === 'summary' || kind === 'generation' || maxTokens > 3000;
            const requestTimeoutMs = longOperation ? 120000 : AI_REQUEST_TIMEOUT_MS;
            const attemptLimit = longOperation ? 1 : AI_REQUEST_MAX_ATTEMPTS;
            for (let attempt = 1; attempt <= attemptLimit; attempt += 1) {
                const request = buildAIRequest(fullPrompt, maxTokens, kind);
                const controller = new AbortController();
                activeAIAbortController = controller;
                activeAIAbortReason = '';
                const timeoutId = setTimeout(() => {
                    if (activeAIAbortController !== controller) return;
                    activeAIAbortReason = 'timeout';
                    controller.abort();
                }, requestTimeoutMs);

                try {
                    const response = await fetch(request.url, { ...request.options, signal: controller.signal });
                    trackApiRequest(kind);
                    let data;
                    try { data = await response.json(); }
                    catch (error) {
                        error.retryable = true;
                        throw error;
                    }
                    if (!response.ok || data.error) {
                        const errMsg = data.error ? (data.error.message || JSON.stringify(data.error)) : "未知錯誤";
                        console.error('AI API 技術資訊', { status: response.status, provider: apiProvider, message: errMsg });
                        const requestError = new Error(getFriendlyApiErrorMessage(response.status, errMsg));
                        requestError.userFriendly = true;
                        requestError.status = response.status;
                        requestError.technicalMessage = errMsg;
                        requestError.retryable = response.status === 408 || response.status >= 500;
                        throw requestError;
                    }
                    if (apiProvider === 'google' && (!data.candidates || data.candidates.length === 0)) {
                        throw new Error("AI 沒有回傳候選內容，可能是模型或安全設定拒絕。");
                    }
                    const finishReason = apiProvider === 'openrouter'
                        ? valueToText(data.choices?.[0]?.finish_reason).toLowerCase()
                        : valueToText(data.candidates?.[0]?.finishReason).toLowerCase();
                    if (finishReason === 'length' || finishReason === 'max_tokens') {
                        const lengthError = new Error('AI 回覆太長而被截斷，本次內容沒有套用，請縮短要求後重試。');
                        lengthError.userFriendly = true;
                        throw lengthError;
                    }
                    const text = getAIResponseText(data);
                    if (!text) throw new Error("AI 這次回傳了空白內容，可能是 API 暫時異常，請重新發送一次。");
                    return text;
                } catch (error) {
                    const abortReason = activeAIAbortController === controller ? activeAIAbortReason : '';
                    if (error?.name === 'AbortError') {
                        if (abortReason === 'user') {
                            const cancelError = new Error('已取消這次 AI 等待；你的輸入已放回輸入框。');
                            cancelError.userFriendly = true;
                            throw cancelError;
                        }
                        const timeoutError = new Error(`AI 超過 ${Math.round(requestTimeoutMs / 1000)} 秒沒有回應，已停止等待。`);
                        timeoutError.userFriendly = true;
                        timeoutError.retryable = true;
                        lastError = timeoutError;
                    } else {
                        lastError = error;
                    }
                    if (attempt >= attemptLimit || !isRetryableAIRequestError(lastError)) throw lastError;
                    await new Promise(resolve => setTimeout(resolve, 900));
                } finally {
                    clearTimeout(timeoutId);
                    if (activeAIAbortController === controller) {
                        activeAIAbortController = null;
                        activeAIAbortReason = '';
                    }
                }
            }
            throw lastError || new Error('AI 請求失敗。');
        }

        function extractJsonText(rawText) {
            const jsonMatch = rawText.match(new RegExp("\\{[\\s\\S]*\\}"));
            if(jsonMatch) return jsonMatch[0];
            return rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        async function parseAIJsonWithRepair(rawText, fullPrompt) {
            try {
                return JSON.parse(extractJsonText(rawText));
            } catch (firstError) {
                const profile = getModelRuntimeProfile();
                const repairPrompt = `將下方內容修正為合法 JSON 物件，只輸出 JSON，不得新增原文沒有的劇情。頂層允許欄位：narrative、dialogues、options、changes、memory；若原文使用舊欄位名稱也必須保留其數值。\n\n待修正內容：\n${rawText.slice(0, 9000)}`;
                const repairedText = await requestAIText(repairPrompt, { kind: 'repair', maxTokens: profile.repairMaxTokens });
                try {
                    return JSON.parse(extractJsonText(repairedText));
                } catch (secondError) {
                    console.error('AI JSON 修復失敗', secondError);
                    const formatError = new Error('AI 回覆格式異常，本次內容沒有套用，請重新發送。');
                    formatError.userFriendly = true;
                    throw formatError;
                }
            }
        }

        function getVisibleResponseStrings(data) {
            const values = [];
            const narrative = valueToText(data?.narrative);
            if (narrative) values.push(narrative);
            const dialogues = Array.isArray(data?.dialogues) ? data.dialogues : (data?.dialogue ? [data.dialogue] : []);
            dialogues.forEach(entry => {
                const normalized = normalizeDialogueEntry(entry);
                if (normalized?.text) values.push(normalized.text);
            });
            if (Array.isArray(data?.options)) data.options.forEach(option => {
                const text = optionToText(option);
                if (text) values.push(text);
            });
            return values;
        }

        function stripKnownCharacterNames(text) {
            const names = [
                currentScenario?.playerName,
                ...(currentScenario?.npcs || []).map(npc => npc?.name),
                ...(currentScenario?.scenarios || []).map(scene => scene?.name),
                ...currentItems,
                ...currentFlags
            ]
                .map(valueToText).filter(Boolean).sort((a, b) => b.length - a.length);
            return names.reduce((value, name) => value.split(name).join(''), valueToText(text));
        }

        function responseNeedsLanguageRepair(data, mode = currentScenario?.languageMode || 'zh-tw') {
            if (!data || mode === 'auto') return false;
            const texts = getVisibleResponseStrings(data).map(stripKnownCharacterNames).filter(Boolean);
            if (!texts.length) return false;
            if (mode === 'en') return texts.some(text => /[\u3040-\u30ff\u3400-\u9fff]/u.test(text));
            if (mode === 'ja') return texts.some(text => /[\u3400-\u9fff]/u.test(text) && !/[\u3040-\u30ff]/u.test(text) && text.replace(/\s/g, '').length >= 6);
            if (mode === 'zh-tw') return texts.some(text => !/[\u3400-\u9fff]/u.test(text) && (text.match(/[A-Za-z]{2,}/g) || []).length >= 6);
            const dialogues = Array.isArray(data?.dialogues) ? data.dialogues : [];
            if (mode === 'ja-zh' || mode === 'en-zh') {
                return dialogues.some(entry => {
                    const text = normalizeDialogueEntry(entry)?.text || '';
                    return text && !/[（(]中文(?:譯|译)[：:]/.test(text);
                });
            }
            return false;
        }

        async function repairVisibleResponseLanguage(data) {
            const mode = currentScenario?.languageMode || 'zh-tw';
            if (!responseNeedsLanguageRepair(data, mode)) return data;
            const profile = getModelRuntimeProfile();
            const visiblePayload = {
                narrative: data?.narrative,
                dialogues: Array.isArray(data?.dialogues) ? data.dialogues : [],
                options: Array.isArray(data?.options) ? data.options : []
            };
            const prompt = `${getLanguageInstruction(mode)}

下方 JSON 的玩家可見文字違反輸出語言規則。只改寫 narrative、dialogues[].text、options[].text；speaker、check、difficulty、changes、memory 及所有數值必須完全保持不變。不得新增或刪除劇情、台詞、選項。只輸出合法 JSON。

待修正 JSON：
${JSON.stringify(visiblePayload)}`;
            try {
                const repairedRaw = await requestAIText(prompt, { kind: 'repair', maxTokens: profile.repairMaxTokens });
                const repaired = await parseAIJsonWithRepair(repairedRaw, prompt);
                const merged = { ...data };
                if (valueToText(repaired?.narrative)) merged.narrative = repaired.narrative;
                if (Array.isArray(repaired?.dialogues) && repaired.dialogues.length === (Array.isArray(data?.dialogues) ? data.dialogues.length : repaired.dialogues.length)) merged.dialogues = repaired.dialogues;
                if (Array.isArray(repaired?.options) && repaired.options.length === (Array.isArray(data?.options) ? data.options.length : repaired.options.length)) merged.options = repaired.options;
                return merged;
            } catch (error) {
                console.warn('輸出語言修正失敗，保留原始回覆。', error);
                return data;
            }
        }

        async function parseMemoryOrganizerJson(rawText, originalPrompt) {
            try {
                return JSON.parse(extractJsonText(rawText));
            } catch (firstError) {
                const profile = getModelRuntimeProfile();
                const repairPrompt = `把下方內容修正成合法 JSON 物件，只輸出 JSON，不要新增、刪除或改寫事件。必須保留原本陣列與文字。\n\n待修正內容：\n${rawText.slice(0, 10000)}`;
                const repairedText = await requestAIText(repairPrompt, { kind: 'repair', maxTokens: Math.max(profile.repairMaxTokens, 1200) });
                try {
                    return JSON.parse(extractJsonText(repairedText));
                } catch (secondError) {
                    console.error('摘要 JSON 修復失敗', secondError);
                    const formatError = new Error('AI 整理結果格式異常，原本內容沒有改動，請稍後再試。');
                    formatError.userFriendly = true;
                    throw formatError;
                }
            }
        }

        function refreshMemoryEditorFields() {
            const storyField = document.getElementById('ui-story-summary');
            const relationshipField = document.getElementById('ui-relationship-summary');
            const logField = document.getElementById('ui-adventure-log');
            if (storyField) { storyField.value = currentStorySummary; autoResize(storyField); }
            if (relationshipField) { relationshipField.value = currentRelationshipSummary; autoResize(relationshipField); }
            if (logField) { logField.value = currentAdventureLog; autoResize(logField); }
            renderTaskChecklist(currentOpenTasks);
        }

        function getAdventureLogSnapshotForSummary(log = currentAdventureLog) {
            const entries = splitAdventureLog(log);
            if (entries.length <= 28) return entries.map(entry => `• ${truncatePromptText(entry, 200)}`).join('\n') || '無';
            const selected = [...entries.slice(0, 5), ...entries.slice(-23)];
            return `${selected.slice(0, 5).map(entry => `• ${truncatePromptText(entry, 200)}`).join('\n')}\n（中段完整內容保留於冒險日誌，本次摘要整理不重複傳送）\n${selected.slice(5).map(entry => `• ${truncatePromptText(entry, 200)}`).join('\n')}`;
        }

        function buildMemoryOrganizerPrompt(kind) {
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const tasks = parseTaskChecklist(currentOpenTasks);
            const sharedContext = `目前場景：${truncatePromptText(scene.name, 100) || '未命名'}\n玩家：${currentScenario.playerName || '玩家'}\n相關角色：${(currentScenario.npcs || []).map(npc => npc.name).filter(Boolean).slice(0, 16).join('、') || '無'}\nFlags：${truncatePromptText(getFlagsForPrompt(), 1600)}\n\n目前重點劇情：\n${truncatePromptText(currentStorySummary, 1600) || '無'}\n\n目前任務：\n${truncatePromptText(serializeTaskChecklist(tasks), 1400) || '無'}\n\n目前角色關係：\n${truncatePromptText(currentRelationshipSummary, 1400) || '無'}\n\n冒險紀錄精選：\n${getAdventureLogSnapshotForSummary()}\n\n最近完整回合：\n${getRecentChatText(currentChatPageIndex, { maxTurns: 4, maxChars: 2800 })}`;
            if (kind === 'log') {
                return buildSelectedJournalOrganizerPrompt(savesData[currentSaveId] || {}, chunkAdventureLog(currentAdventureLog, 7000)[0], 0, 1);
            }
            return `你是 TRPG 狀態摘要整理器。根據下方資料整理「現在仍影響後續」的內容，不得捏造、不得加入普通小事、不得把已完成任務改回未完成。只輸出 JSON：{"story_summary":["3～8 條目前主線、場景狀態與重大既定事實"],"tasks":[{"text":"任務內容","done":false}],"relationship_summary":["最多 8 條仍有效的全局角色關係"]}。文字使用中性描述，不得加入資料中沒有的劇情。\n\n${sharedContext}`;
        }

        async function organizeMemoryWithAI(kind) {
            if (!['summary', 'log'].includes(kind) || !currentSaveId) return;
            if (kind === 'log' && !window.confirm('整理完整冒險紀錄會合併重複事件。系統會先保留備份，確定要繼續嗎？')) return;
            syncDomToCurrentScenario();
            const summaryButton = document.getElementById('organize-summary-btn');
            const logButton = document.getElementById('organize-log-btn');
            const activeButton = kind === 'log' ? logButton : summaryButton;
            const originalLabel = activeButton?.innerText || '';
            [summaryButton, logButton].forEach(button => { if (button) button.disabled = true; });
            if (activeButton) activeButton.innerText = '整理中…';
            try {
                const profile = getModelRuntimeProfile();
                if (kind === 'log') {
                    const save = savesData[currentSaveId];
                    const organizedLog = await organizeAdventureLogWithAI(save, (current, total) => {
                        if (activeButton) activeButton.innerText = total > 1 ? `整理中 ${current}/${total}` : '整理中…';
                    });
                    if (!organizedLog) throw new Error('AI 沒有回傳可用的冒險紀錄。');
                    if (!Array.isArray(save.memoryLogBackups)) save.memoryLogBackups = [];
                    save.memoryLogBackups.push({ date: new Date().toLocaleString(), log: currentAdventureLog });
                    save.memoryLogBackups = save.memoryLogBackups.slice(-3);
                    currentAdventureLog = organizedLog;
                } else {
                    const prompt = buildMemoryOrganizerPrompt('summary');
                    const rawText = await requestAIText(prompt, { kind: 'summary', maxTokens: profile.summaryMaxTokens });
                    const data = await parseMemoryOrganizerJson(rawText, prompt);
                    const storyItems = normalizeSummaryPayload(data.story_summary, 8, MAX_SUMMARY_ITEM_CHARS);
                    const relationshipItems = normalizeSummaryPayload(data.relationship_summary, 8, MAX_RELATIONSHIP_ITEM_CHARS);
                    if (storyItems.length) currentStorySummary = formatBulletListText(storyItems, '', true);
                    if (relationshipItems.length) currentRelationshipSummary = formatBulletListText(relationshipItems, '', true);
                    if (Array.isArray(data.tasks)) currentOpenTasks = serializeTaskChecklist(data.tasks);
                }
                refreshMemoryEditorFields();
                saveCurrentProgress();
                alert(kind === 'log' ? '冒險紀錄已整理完成；如不滿意可按「復原上次整理」。' : '摘要與任務清單已整理完成。');
            } catch (error) {
                console.error(error);
                alert(`${getFriendlyErrorMessage(error, 'AI 暫時無法完成整理。')}\n原本的內容沒有被刪除。`);
            } finally {
                [summaryButton, logButton].forEach(button => { if (button) button.disabled = false; });
                if (activeButton) activeButton.innerText = originalLabel;
            }
        }

        function restoreLatestAdventureLogBackup() {
            const save = savesData[currentSaveId];
            const backups = Array.isArray(save?.memoryLogBackups) ? save.memoryLogBackups : [];
            if (!backups.length) { alert('目前沒有可復原的整理備份。'); return; }
            const latest = backups[backups.length - 1];
            if (!window.confirm(`要復原 ${latest.date || '上一次'} 整理前的完整冒險紀錄嗎？`)) return;
            currentAdventureLog = formatBulletListText(latest.log, currentAdventureLog);
            backups.pop();
            save.memoryLogBackups = backups;
            refreshMemoryEditorFields();
            saveCurrentProgress();
            alert('已復原整理前的完整冒險紀錄。');
        }


        function valueToText(value, fallback = "") {
            if (value === null || value === undefined) return fallback;
            if (typeof value === "string") return value.trim();
            if (typeof value === "number" || typeof value === "boolean") return String(value);
            if (Array.isArray(value)) return value.map(v => valueToText(v)).filter(Boolean).join("\n");
            if (typeof value === "object") {
                const pairedLines = [];
                if (value.ja && value.zh) pairedLines.push(`${value.ja}\n（中文譯：${value.zh}）`);
                if (value.en && value.zh) pairedLines.push(`${value.en}\n（中文譯：${value.zh}）`);
                if (pairedLines.length) return pairedLines.join("\n");

                const preferredKeys = ["text", "label", "title", "action", "content", "line", "dialogue", "narrative", "description", "name"];
                for (const key of preferredKeys) {
                    const text = valueToText(value[key]);
                    if (text) return text;
                }

                return Object.entries(value)
                    .map(([key, val]) => {
                        const text = valueToText(val);
                        return text ? `${key}: ${text}` : "";
                    })
                    .filter(Boolean)
                    .join(" / ");
            }
            return fallback;
        }

        function normalizeOptionEntry(option) {
            if (typeof option === 'string') return { text: option.trim(), check: '', difficulty: 'normal' };
            if (!option || typeof option !== 'object') return { text: '', check: '', difficulty: 'normal' };
            return {
                text: valueToText(option.text || option.action || option.label || option.content).replace(/\s+/g, ' ').trim(),
                check: normalizeDiceStatKey(option.check || option.attribute || option.stat),
                difficulty: normalizeDiceDifficulty(option.difficulty)
            };
        }

        function optionToText(option) {
            return normalizeOptionEntry(option).text;
        }

        function normalizeDialogueEntry(entry) {
            const defaultSpeaker = (currentScenario.npcs || []).find(npc => !isNpcDead(npc))?.name || 'NPC';
            if (typeof entry === "string") {
                const colonIndex = entry.indexOf("：") > -1 ? entry.indexOf("：") : entry.indexOf(":");
                if (colonIndex > 0 && colonIndex < 20) {
                    return { speaker: entry.slice(0, colonIndex).trim(), text: entry.slice(colonIndex + 1).trim() };
                }
                return { speaker: defaultSpeaker, text: entry.trim() };
            }
            if (!entry || typeof entry !== "object") return null;
            const speaker = valueToText(entry.speaker || entry.name || entry.character || entry.npc, defaultSpeaker);
            const text = valueToText(entry.text || entry.line || entry.dialogue || entry.content || entry.message);
            if (!text) return null;
            return { speaker, text };
        }

        function buildLatestActionPrompt(latestPlayerAction = "") {
            const rawAction = valueToText(latestPlayerAction).trim();
            const context = parseSceneInputContext(stripHardDiceDirective(rawAction));
            if (!context.content) return "";
            if (context.mode === 'creator') {
                return `

【本回合創作者指令－系統最高優先】
${context.content}
${currentScenario.scenarios?.[currentScenarioIndex]?.runtimeGuideRole ? `
目前持續引導身分：${currentScenario.scenarios[currentScenarioIndex].runtimeGuideRole}` : ''}

執行規則：
1. 這是角色外的舞台事實與導演要求，不是 ${currentScenario.playerName} 的台詞或行動。
2. 直接依指令調整時間、空間、在場角色、事件先後或敘事焦點。
3. NPC 不得聽見、質疑、責怪或對此產生好感變化。
4. 若指令說玩家不在場，禁止讓玩家角色發言或被 NPC 當成衝突來源；若指令明確要求回歸，才安排合理登場。
5. narrative 第一段必須呈現指令已生效的結果；options 提供符合新場景的後續方向。
6. 若指令明確要求增減道具、Flags、HP、SAN、好感度或角色動態狀態，必須同步填入對應 JSON 欄位；若未要求，不得擅自變動。`;
            }
            if (context.mode === 'narrator') {
                return `

【本回合輔助旁白／導演輸入－必須優先判讀】
${context.content}

執行規則：
1. 這不是 ${currentScenario.playerName} 的台詞、動作或情緒，NPC 無法聽見旁白。
2. 操作者正在安排鏡頭、環境、事件或在場 NPC 的行動，請直接承接。
3. 玩家角色目前不預設在場；除非此輸入明確說明回歸、登場、上線或回到現場。
4. 不得對玩家角色扣 HP、SAN、好感度或套用 D20 判定。
5. options 應提供 3 個場外導演方向或 NPC 支線走向。`;
            }
            return `

【本回合玩家角色最新輸入－必須優先判讀】
${rawAction}

【本回合 DM 回應要求】
1. 理解玩家角色此刻的具體意圖、目標、手段與語氣。
2. narrative 第一段必須直接回饋動作造成的立即結果。
3. 若有系統硬判定，逐字遵守已算定的屬性、加值、DC 與結果。
4. 只讓真正會在此刻反應的 NPC 說話。
5. options 接續結果並提供 3 個下一步行動。`;
        }

        function buildGamePrompt(extraPrompt = '', latestPlayerAction = '', profile = getModelRuntimeProfile()) {
            let recentChatText = getRecentChatText(currentChatPageIndex, {
                maxTurns: profile.recentTurns,
                maxChars: profile.recentChars,
                excludeLatestTurn: Boolean(latestPlayerAction)
            });
            const latestActionPrompt = buildLatestActionPrompt(latestPlayerAction);
            const sceneTransitionPrompt = truncatePromptText(buildSceneTransitionPrompt(), 2200);
            let systemInstruction = getCompactSystemInstruction(latestPlayerAction, profile);
            const assemble = () => `${systemInstruction}${sceneTransitionPrompt}\n\n【最近完整回合】\n${recentChatText}${latestActionPrompt}${extraPrompt ? `\n\n【本回合附加系統資訊】\n${truncatePromptText(extraPrompt, 1200)}` : ''}`;
            let fullPrompt = assemble();
            if (fullPrompt.length > profile.promptChars) {
                recentChatText = getRecentChatText(currentChatPageIndex, {
                    maxTurns: Math.min(3, profile.recentTurns),
                    maxChars: 2000,
                    excludeLatestTurn: Boolean(latestPlayerAction)
                });
                const compactProfile = { ...profile, loreChars: Math.min(profile.loreChars, 1000), npcLimit: Math.min(profile.npcLimit, 4), memoryNotes: Math.min(profile.memoryNotes, 4) };
                systemInstruction = getCompactSystemInstruction(latestPlayerAction, compactProfile);
                fullPrompt = assemble();
            }
            if (fullPrompt.length > profile.promptChars) {
                recentChatText = getRecentChatText(currentChatPageIndex, {
                    maxTurns: 2,
                    maxChars: 1000,
                    excludeLatestTurn: Boolean(latestPlayerAction)
                });
                fullPrompt = assemble();
            }
            if (fullPrompt.length > profile.promptChars) {
                const promptTail = fullPrompt.slice(systemInstruction.length);
                const notice = '\n（部分低優先背景因提示詞預算已省略）\n';
                const availableSystemChars = Math.max(1800, profile.promptChars - promptTail.length - notice.length);
                const headChars = Math.max(900, Math.floor(availableSystemChars * 0.58));
                const tailChars = Math.max(700, availableSystemChars - headChars);
                systemInstruction = `${systemInstruction.slice(0, headChars)}${notice}${systemInstruction.slice(-tailChars)}`;
                fullPrompt = assemble();
            }
            lastPromptDiagnostics = {
                profile: profile.id,
                chars: fullPrompt.length,
                budget: profile.promptChars,
                recentTurns: profile.recentTurns,
                maxOutputTokens: profile.normalMaxTokens,
                includesFullAdventureLog: false
            };
            return fullPrompt;
        }

        async function callAI_JSON(extraPrompt = "", isOpening = false, latestPlayerAction = "", manualAffectionNpcIds = [], protectedRevivedNpcIds = []) {
            const profile = getModelRuntimeProfile();
            const fullPrompt = buildGamePrompt(extraPrompt, latestPlayerAction, profile);

            try {
                const rawText = await requestAIText(fullPrompt, { kind: 'normal', maxTokens: profile.normalMaxTokens });
                let parsedData = await parseAIJsonWithRepair(rawText, fullPrompt);
                parsedData = await repairVisibleResponseLanguage(parsedData);
                const inputContext = parseSceneInputContext(stripHardDiceDirective(latestPlayerAction));
                // 輔助旁白不可改動玩家；角色行動與最高權限的創作者指令都可寫入狀態欄位。
                const playerEffectsAllowed = inputContext.mode !== 'narrator';
                const affectionEffectsAllowed = inputContext.mode === 'character'
                    || (inputContext.mode === 'creator' && /好感度|affection/i.test(inputContext.content));
                const changes = parsedData.changes && typeof parsedData.changes === 'object' && !Array.isArray(parsedData.changes)
                    ? parsedData.changes
                    : {};
                const memoryPayload = parsedData.memory && typeof parsedData.memory === 'object' && !Array.isArray(parsedData.memory)
                    ? parsedData.memory
                    : null;
                const validMemoryCategories = new Set(['task', 'relationship', 'item', 'status', 'clue', 'decision', 'scene']);
                const memoryCategory = valueToText(memoryPayload?.category).toLowerCase();
                const characterNoteCategories = new Set(['task', 'relationship', 'clue', 'decision']);
                const allowCharacterMemoryNotes = !currentScenario.memoryNotesPaused && characterNoteCategories.has(memoryCategory);
                const protectedRevivedIds = new Set(Array.isArray(protectedRevivedNpcIds) ? protectedRevivedNpcIds : []);
                let revivePayload = changes.npc_revives ?? parsedData.npc_revives;
                const hasRevivePayload = Array.isArray(revivePayload) ? revivePayload.length > 0 : Boolean(revivePayload);
                if (normalizeGameDifficulty(currentScenario?.gameDifficulty) === 'standard' && !hasRevivePayload) {
                    const intent = getResurrectionIntent(latestPlayerAction);
                    const responseText = `${valueToText(parsedData.narrative)}\n${valueToText(parsedData.dialogues)}`;
                    const explicitSuccess = /(成功.{0,12}(復活|復生|恢復生命)|復活成功|死而復生|重新恢復生命|確實已恢復呼吸)/.test(responseText)
                        && !/(失敗|無法|未能|沒有成功|仍然死亡|仍未復活)/.test(responseText);
                    if (intent && explicitSuccess) revivePayload = [{ name: intent.npc.name, reason: '劇情明確演出復活成功' }];
                }
                const npcLifeEvents = [
                    ...applyNpcRevivePayload(revivePayload),
                    ...applyNpcDeathPayload(changes.npc_deaths ?? parsedData.npc_deaths, protectedRevivedIds)
                ];
                
                const manuallyHandledNpcIds = new Set(Array.isArray(manualAffectionNpcIds) ? manualAffectionNpcIds : []);
                if (affectionEffectsAllowed) {
                    applyAffectionPayload(changes.affection_set ?? parsedData.npc_love_set, 'set', manuallyHandledNpcIds);
                    applyAffectionPayload(changes.affection_change ?? parsedData.npc_love_change, 'change', manuallyHandledNpcIds);
                }

                const npcStateUpdates = Array.isArray(changes.npc_states) ? changes.npc_states : parsedData.npc_state_updates;
                if (Array.isArray(npcStateUpdates)) {
                    npcStateUpdates.forEach(update => {
                        const npcName = valueToText(update?.name);
                        const foundNpc = findNpcByName(npcName) || ensureNpcForSpeaker(npcName);
                        if (!foundNpc) return;
                        const result = applyDynamicStatePatch(foundNpc.dynamic, update, allowCharacterMemoryNotes);
                        foundNpc.dynamic = result.state;
                    });
                }

                const playerStateUpdate = changes.player_state && typeof changes.player_state === 'object'
                    ? changes.player_state
                    : parsedData.player_state_update;
                if (playerEffectsAllowed && playerStateUpdate && typeof playerStateUpdate === 'object') {
                    const result = applyDynamicStatePatch(currentScenario.playerDynamic, playerStateUpdate, allowCharacterMemoryNotes);
                    currentScenario.playerDynamic = result.state;
                }

                // 舊模型若仍回傳舊欄位，只記入「近期變化」，絕不覆寫核心人設。
                if (parsedData.npc_persona_updates && Array.isArray(parsedData.npc_persona_updates)) {
                    parsedData.npc_persona_updates.forEach(update => {
                        const foundNpc = findNpcByName(update?.name) || ensureNpcForSpeaker(update?.name);
                        const legacyText = valueToText(update?.new_persona);
                        if (!foundNpc || !legacyText) return;
                        const result = applyDynamicStatePatch(foundNpc.dynamic, { persistent: true, changes: { memoryNotes: [legacyText] }, reason: '舊格式的劇情更新' }, false);
                        foundNpc.dynamic = result.state;
                    });
                }
                if (playerEffectsAllowed && typeof parsedData.player_persona_update === 'string' && parsedData.player_persona_update.trim()) {
                    const result = applyDynamicStatePatch(currentScenario.playerDynamic, { persistent: true, changes: { memoryNotes: [parsedData.player_persona_update] }, reason: '舊格式的劇情更新' }, false);
                    currentScenario.playerDynamic = result.state;
                }

                const hpDelta = playerEffectsAllowed ? parseNumericDelta(changes.hp ?? parsedData.hp_change) : 0;
                const sanDelta = playerEffectsAllowed ? parseNumericDelta(changes.san ?? parsedData.san_change) : 0;
                if (hpDelta) currentHp = applySurvivalDelta(currentHp, hpDelta);
                if (sanDelta) currentSan = applySurvivalDelta(currentSan, sanDelta);
                document.getElementById('ui-hp').innerText = currentHp;
                document.getElementById('ui-san').innerText = currentSan;
                
                const memoryEvent = validMemoryCategories.has(memoryCategory)
                    ? truncatePromptText(memoryPayload?.event, 180)
                    : valueToText(parsedData.adventure_log);
if (memoryEvent) currentAdventureLog = mergeAdventureLog(currentAdventureLog, memoryEvent);
npcLifeEvents.forEach(event => { currentAdventureLog = mergeAdventureLog(currentAdventureLog, event); });
if (npcLifeEvents.length) failTasksRelatedToNpcEvents(npcLifeEvents);
if (npcLifeEvents.length) applyAutomaticMemoryUpdate({ story_summary: npcLifeEvents });
                if (memoryPayload) {
                    const automaticMemory = { ...memoryPayload };
                    if (memoryEvent && !automaticMemory.story_summary && !automaticMemory.story) {
                        automaticMemory.story_summary = [memoryEvent];
                    }
                    if (memoryEvent && memoryCategory === 'relationship' && !automaticMemory.relationship_summary && !automaticMemory.relationships) {
                        automaticMemory.relationship_summary = [memoryEvent];
                    }
                    applyAutomaticMemoryUpdate(automaticMemory);
                } else {
                    applyAutomaticMemoryUpdate(parsedData.memory_update);
                }
                
                const addedItems = Array.isArray(changes.items_add) ? changes.items_add : parsedData.new_items;
                if(playerEffectsAllowed && Array.isArray(addedItems) && addedItems.length > 0) {
                    addedItems.forEach(item => {
                        const itemText = valueToText(item);
                        if(itemText && !currentItems.includes(itemText)) {
                            currentItems.push(itemText);
                            createSystemAlert(`獲得道具 [ ${itemText} ]`);
                        }
                    });
                }
                
                const removedItems = Array.isArray(changes.items_remove) ? changes.items_remove : parsedData.lost_items;
                if(playerEffectsAllowed && Array.isArray(removedItems) && removedItems.length > 0) { 
                    removedItems.forEach(aiItem => { 
                        const itemText = valueToText(aiItem);
                        if (!itemText) return;
                        const idx = currentItems.findIndex(invItem => invItem.includes(itemText) || itemText.includes(invItem)); 
                        if(idx > -1) { 
                            const removedName = currentItems[idx];
                            currentItems.splice(idx, 1); 
                            createSystemAlert(`失去道具 [ ${removedName} ]`); 
                        } 
                    }); 
                }
                
                const addedFlags = Array.isArray(changes.flags_add) ? changes.flags_add : parsedData.new_flags;
                if(Array.isArray(addedFlags) && addedFlags.length > 0) { 
                    let flagLimitReached = false;
                    addedFlags.forEach(flag => { 
                        const cleanFlag = normalizeFlagText(flag);
                        if(cleanFlag && !currentFlags.includes(cleanFlag) && currentFlags.length < MAX_STORED_FLAGS) { 
                            currentFlags.push(cleanFlag); 
                            createSystemNote(`新增狀態 [ ${cleanFlag} ]`); 
                        } else if (cleanFlag && !currentFlags.includes(cleanFlag)) flagLimitReached = true;
                    }); 
                    if (flagLimitReached) createSystemNote(`Flags 已達 ${MAX_STORED_FLAGS} 個上限；新項目未加入，請至角色面板整理。`);
                }

                const narrativeText = valueToText(parsedData.narrative);
                if(narrativeText) {
                    chatScripts[currentChatPageIndex].push(`【旁白】：${narrativeText}`);
                    appendNarrative(narrativeText);
                }
                
                if(parsedData.dialogues && Array.isArray(parsedData.dialogues)) {
                    parsedData.dialogues.forEach(d => {
                        const normalized = normalizeDialogueEntry(d);
                        if (!normalized) return;
                        const speakingNpc = ensureNpcForSpeaker(normalized.speaker);
                        if (speakingNpc && isNpcDead(speakingNpc)) return;
                        chatScripts[currentChatPageIndex].push(`${normalized.speaker}：${normalized.text}`);
                        appendMessage(normalized.speaker, normalized.text);
                    });
                } else {
                    const singleDialogue = normalizeDialogueEntry(parsedData.dialogue);
                    if (singleDialogue) {
                        const speakingNpc = ensureNpcForSpeaker(singleDialogue.speaker);
                        if (!(speakingNpc && isNpcDead(speakingNpc))) {
                            chatScripts[currentChatPageIndex].push(`${singleDialogue.speaker}：${singleDialogue.text}`);
                            appendMessage(singleDialogue.speaker, singleDialogue.text);
                        }
                    }
                }

                resolveSurvivalOutcome();

                if(!getCurrentGameOver() && parsedData.options && Array.isArray(parsedData.options)) {
                    const optArea = document.getElementById('options-area');
                    parsedData.options.forEach(opt => {
                        const option = enforceResurrectionOptionRules(normalizeOptionEntry(opt));
                        if (!option) return;
                        if (!option.text) return;
                        const btn = document.createElement('button');
                        btn.className = 'opt-btn';
                        btn.textContent = option.text;
                        if (option.check && DICE_STATS[option.check]) {
                            const checkLabel = document.createElement('span');
                            checkLabel.className = 'opt-check-label';
                            const checkWord = window.uiMessage ? window.uiMessage('判定') : '判定';
                            checkLabel.textContent = `${DICE_STATS[option.check].code} ${checkWord}`;
                            btn.appendChild(checkLabel);
                        }
                        btn.onclick = () => selectOption(option.text, option.check, option.difficulty);
                        optArea.appendChild(btn);
                    });
                }
                
                syncSurvivalFlags({ announce: true });
                refreshOpenStatusPanel();
                if (pendingSceneTransition) pendingSceneTransition = null;
                saveCurrentProgress();
                applyGameOverUi();
                document.getElementById('loading').style.display = 'none';

            } catch (error) {
                console.error(error);
                document.getElementById('loading').style.display = 'none';
                alert(getFriendlyErrorMessage(error, 'AI 暫時無法完成這次回覆，請稍後再試。'));
                if (isOpening) { const fallbackNav = `(系統提示：載入時發生連線異常，請稍後重新整理或檢查金鑰)`; chatScripts[currentChatPageIndex].push(`【旁白】：${fallbackNav}`); appendNarrative(fallbackNav); saveCurrentProgress(); return; }
                if (chatScripts[currentChatPageIndex].length > 0 && chatScripts[currentChatPageIndex][chatScripts[currentChatPageIndex].length - 1].startsWith('【系統提示】：— ') && chatScripts[currentChatPageIndex][chatScripts[currentChatPageIndex].length - 1].includes('檢定：')) {
                    chatScripts[currentChatPageIndex].pop();
                    const dialogueBox = document.getElementById('dialogue-box');
                    if (dialogueBox?.lastChild) dialogueBox.removeChild(dialogueBox.lastChild);
                }
                if(chatScripts[currentChatPageIndex].length > 0 && (chatScripts[currentChatPageIndex][chatScripts[currentChatPageIndex].length-1].startsWith(currentScenario.playerName) || chatScripts[currentChatPageIndex][chatScripts[currentChatPageIndex].length-1].startsWith("【旁白】：玩家行動") || chatScripts[currentChatPageIndex][chatScripts[currentChatPageIndex].length-1].startsWith("【創作者指令】：") || chatScripts[currentChatPageIndex][chatScripts[currentChatPageIndex].length-1].startsWith("【輔助旁白】："))) {
                    const lastPlayerText = chatScripts[currentChatPageIndex].pop(); let restoreText = "";
                    if(lastPlayerText.startsWith("【旁白】：玩家行動 - ")) restoreText = lastPlayerText.replace("【旁白】：玩家行動 - \n", "").replace("【旁白】：玩家行動 - ", "");
                    else if(lastPlayerText.startsWith("【創作者指令】：")) restoreText = `［創作者指令］${lastPlayerText.replace("【創作者指令】：", "")}`;
                    else if(lastPlayerText.startsWith("【輔助旁白】：")) restoreText = lastPlayerText.replace("【輔助旁白】：", "");
                    else restoreText = lastPlayerText.replace(`${currentScenario.playerName}：`, "");
                    restoreText = restoreText.replace(new RegExp("\\n\\(系統硬判定：[\\s\\S]*?AI 不得更改。\\)"), "");
                    restoreText = restoreText.replace(new RegExp("\\n\\(系統判定：玩家進行了 D20 檢定，擲出 \\d+ 點\\)"), "");
                    const playerInput = document.getElementById('player-input'); if (playerInput) playerInput.value = restoreText;
                    const dialogueBox = document.getElementById('dialogue-box'); if (dialogueBox && dialogueBox.lastChild) { dialogueBox.removeChild(dialogueBox.lastChild); }
                }
                saveCurrentProgress();
            }
        }

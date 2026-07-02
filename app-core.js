// === [app.js 拆分] app-core.js：原 app.js 第 1–444 行｜啟動/全域狀態/模型 runtime profile/首頁導覽外殼/UI 主題｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
/* ==================== Script section 1 ==================== */
window.onerror = function(message, source, lineno, colno, error) {
            alert("系統捕捉到隱藏錯誤，請截圖這段文字：\n" + message + "\n行號：" + lineno);
            return true;
        };
        // 會呼吸的文字方塊：自動長高函數
        function autoResize(el) {
            if (!el || el.offsetParent === null) return; // 元素隱藏時 scrollHeight 為 0，跳過以免高度被壓成空白
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

function toggleHomeUpdateNotes(force) {
const widget = document.getElementById('home-update-widget');
const tab = document.getElementById('home-update-tab');
if (!widget) return;
const nextOpen = typeof force === 'boolean' ? force : !widget.classList.contains('open');
widget.classList.toggle('open', nextOpen);
if (tab) tab.setAttribute('aria-expanded', String(nextOpen));
}

function showHomeInfoView(viewName = 'main', options = {}) {
const setupScreen = document.getElementById('setup-screen');
if (!setupScreen || getComputedStyle(setupScreen).display === 'none') return false;
if (!window.matchMedia('(min-width: 1100px)').matches) return false;
const requested = ['main', 'api', 'guide', 'saves', 'journal'].includes(viewName) ? viewName : 'main';
const activeView = document.querySelector('.setup-home-view.active')?.dataset.homeView || 'main';
const nextView = !options.force && activeView === requested && requested !== 'main' ? 'main' : requested;
if (nextView !== 'main') toggleHomeUpdateNotes(false);
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

        function getBaseRuntimeProfile() {
            const modelId = String(selectedModel || '').toLowerCase();
            const bilingual = ['ja-zh', 'en-zh'].includes(currentScenario?.languageMode);
            if (apiProvider === 'anthropic') {
                return {
                    id: 'anthropic', normalMaxTokens: bilingual ? 6000 : 4096,
                    repairMaxTokens: 2000, summaryMaxTokens: 3000, journalMaxTokens: 4000,
                    recentTurns: 8, recentChars: 6000, promptChars: 28000,
                    loreChars: 3000, npcLimit: 8, memoryNotes: 10
                };
            }
            if (apiProvider === 'openrouter' && /(?:^|\/)gpt-4[.-]?1(?:$|[-:])/.test(modelId)) {
                return {
                    id: 'gpt-4.1', normalMaxTokens: bilingual ? 1800 : 1500,
                    repairMaxTokens: 800, summaryMaxTokens: 1400, journalMaxTokens: 2200,
                    recentTurns: 6, recentChars: 3600, promptChars: 15500,
                    loreChars: 1800, npcLimit: 6, memoryNotes: 8
                };
            }
            if (apiProvider === 'openrouter') {
                return {
                    id: 'openrouter', normalMaxTokens: bilingual ? 1800 : 1500,
                    repairMaxTokens: 850, summaryMaxTokens: 1500, journalMaxTokens: 2200,
                    recentTurns: 6, recentChars: 4200, promptChars: 18000,
                    loreChars: 2200, npcLimit: 7, memoryNotes: 8
                };
            }
            return {
                id: 'gemini', normalMaxTokens: bilingual ? 2000 : 1700,
                repairMaxTokens: 900, summaryMaxTokens: 1600, journalMaxTokens: 2400,
                recentTurns: 8, recentChars: 6000, promptChars: 28000,
                loreChars: 3000, npcLimit: 8, memoryNotes: 10
            };
        }
        function getReplyLengthPref() {
            const v = localStorage.getItem('sanko_reply_length');
            return (v === 'short' || v === 'long') ? v : 'medium';
        }
        function setReplyLength(value) {
            const v = (value === 'short' || value === 'long') ? value : 'medium';
            localStorage.setItem('sanko_reply_length', v);
        }
        function getMatureModePref() {
            return localStorage.getItem('sanko_mature_mode') === 'on';
        }
        function setMatureMode(value) {
            localStorage.setItem('sanko_mature_mode', value === 'on' ? 'on' : 'off');
        }
        function toggleMatureMode() {
            setMatureMode(getMatureModePref() ? 'off' : 'on');
            refreshMatureToggle();
        }
        function refreshMatureToggle() {
            const btn = document.getElementById('mature-mode-toggle');
            if (!btn) return;
            const on = getMatureModePref();
            btn.textContent = on ? 'ON' : 'OFF';
            btn.classList.toggle('on', on);
            btn.setAttribute('aria-pressed', String(on));
        }
        function getReplyLengthCapTokens(bilingual) {
            const caps = { short: 2500, medium: 4500, long: 9000 };
            let cap = caps[getReplyLengthPref()] || 4500;
            if (bilingual) cap = Math.round(cap * 1.5);
            return cap;
        }
        function getModelRuntimeProfile() {
            const profile = getBaseRuntimeProfile();
            const bilingual = ['ja-zh', 'en-zh'].includes(currentScenario?.languageMode);
            profile.normalMaxTokens = getReplyLengthCapTokens(bilingual);
            return profile;
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
            trivial: { label: '超簡單', dc: 4, dcMin: 3, dcMax: 5 },
            easy: { label: '簡單', dc: 10, dcMin: 9, dcMax: 11 },
            normal: { label: '普通', dc: 13, dcMin: 12, dcMax: 14 },
            hard: { label: '困難', dc: 17, dcMin: 16, dcMax: 18 },
            extreme: { label: '極難', dc: 21, dcMin: 20, dcMax: 22 }
        };
        const GAME_DIFFICULTIES = {
            standard: { label: '標準模式', dcModifier: 0, gameOver: 'none' },
            hard: { label: '困難模式', dcModifier: 2, gameOver: 'possible' },
            nightmare: { label: '極限模式', dcModifier: 3, gameOver: 'forced' }
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
let journalReturnTarget = 'setup';
let journalEmbedded = false;
let editScenarioDirty = false;
let apiUsageStats = {};
let lastPromptDiagnostics = {};

function syncSetupSideLabels() {
const locale = window.getUiLanguage ? getUiLanguage() : 'zh-TW';
const shortLabels = {
'API說明': { en: 'API', ja: 'API' },
'遊戲玩法': { en: 'Guide', ja: '遊び方' },
'角色配置': { en: 'Char', ja: 'キャラ' },
'存檔': { en: 'Data', ja: 'データ' },
'冒險日誌': { en: 'Log', ja: '日誌' },
'語言切換': { en: 'Lang', ja: '言語' }
};
document.querySelectorAll('.setup-side-tab[data-side-label]').forEach(tab => {
const source = tab.dataset.sideLabel || tab.textContent.trim();
const mapped = shortLabels[source];
tab.textContent = locale === 'en'
? (mapped?.en || source)
: locale === 'ja'
? (mapped?.ja || source)
: source;
});
}

window.addEventListener('ui-language-change', () => {
 updateSetupCurrentPresetLabel();
 syncSetupSideLabels();
 if (document.getElementById('save-menu-screen')?.style.display === 'flex') renderSaveList();
 renderAdventureJournalSaveSelector();
 renderAdventureJournal();
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

        // ===== 背景系統：純色 / 自訂圖片（大圖走 IndexedDB） =====
        const UI_BG_MODE_KEY = 'sanko_ui_bg_mode_v1';
        const UI_BG_IMAGE_KEY = 'sanko_ui_bg_image_v1';
        const UI_BG_MAX_DIM = 2560; // 上傳大圖時自動縮到此邊長內，兼顧畫質與效能
        let uiBgMode = 'solid';
        let uiBgImage = '';

        function syncBackgroundControls() {
            document.querySelectorAll('.bg-style-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.bg === uiBgMode);
            });
            const clearBtn = document.querySelector('.bg-clear-btn');
            if (clearBtn) clearBtn.disabled = !uiBgImage;
        }

        function applyBackground() {
            const root = document.documentElement;
            const mode = (uiBgMode === 'image' && !uiBgImage) ? 'solid' : uiBgMode;
            root.dataset.bgMode = mode;
            if (mode === 'image' && uiBgImage) {
                root.style.setProperty('--bg-image', 'url("' + uiBgImage + '")');
            } else {
                root.style.removeProperty('--bg-image');
            }
            syncBackgroundControls();
        }

        function setBackgroundMode(mode) {
            if (mode === 'image' && !uiBgImage) {
                const input = document.getElementById('bg-image-input');
                if (input) input.click();
                return;
            }
            uiBgMode = (mode === 'image') ? 'image' : 'solid';
            try { localStorage.setItem(UI_BG_MODE_KEY, uiBgMode); } catch (error) { /* 忽略 */ }
            applyBackground();
        }

        function downscaleImageToDataURL(file, maxDim) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = () => reject(new Error('讀取檔案失敗'));
                reader.onload = event => {
                    const img = new Image();
                    img.onerror = () => reject(new Error('圖片解析失敗'));
                    img.onload = () => {
                        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
                        const w = Math.max(1, Math.round(img.width * scale));
                        const h = Math.max(1, Math.round(img.height * scale));
                        const canvas = document.createElement('canvas');
                        canvas.width = w; canvas.height = h;
                        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                        // 縮過或非 PNG 都輸出 JPEG 控制體積；其餘維持原樣
                        const out = (scale < 1) ? canvas.toDataURL('image/jpeg', 0.85)
                                                : (event.target.result);
                        resolve(out);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        async function handleBackgroundUpload(input) {
            const file = input && input.files && input.files[0];
            input.value = '';
            if (!file) return;
            if (!/^image\//.test(file.type)) { alert('請選擇圖片檔。'); return; }
            try {
                const dataUrl = await downscaleImageToDataURL(file, UI_BG_MAX_DIM);
                uiBgImage = dataUrl;
                uiBgMode = 'image';
                try { localStorage.setItem(UI_BG_MODE_KEY, uiBgMode); } catch (error) { /* 忽略 */ }
                persistLargeValue(UI_BG_IMAGE_KEY, uiBgImage, '背景圖');
                applyBackground();
            } catch (error) {
                console.error('背景圖上傳失敗', error);
                alert('背景圖載入失敗，請換一張圖片再試。');
            }
        }

        function clearBackgroundImage() {
            uiBgImage = '';
            persistLargeValue(UI_BG_IMAGE_KEY, '', '背景圖');
            if (uiBgMode === 'image') {
                uiBgMode = 'solid';
                try { localStorage.setItem(UI_BG_MODE_KEY, uiBgMode); } catch (error) { /* 忽略 */ }
            }
            applyBackground();
        }

        async function loadBackground() {
            try { uiBgMode = localStorage.getItem(UI_BG_MODE_KEY) || 'solid'; } catch (error) { uiBgMode = 'solid'; }
            try { uiBgImage = await readPersistentValue(UI_BG_IMAGE_KEY, '') || ''; } catch (error) { uiBgImage = ''; }
            if (uiBgMode === 'image' && !uiBgImage) uiBgMode = 'solid';
            applyBackground();
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


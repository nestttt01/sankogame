// === [app.js 拆分] app-api.js：原 app.js 第 2691–2920 行｜API key 與模型(危險區，勿外洩 key)｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
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
 const providerName = getApiProviderLabel();
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
 const models = apiProvider === 'openrouter' ? await fetchOpenRouterModels() : apiProvider === 'anthropic' ? await fetchAnthropicModels() : await fetchGoogleModels();
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
            if (haystack.includes('gpt-5') || haystack.includes('gpt-4.1') || haystack.includes('gpt-4o') || haystack.includes('o4')) score += 120;
            if (haystack.includes('claude') && (haystack.includes('sonnet') || haystack.includes('opus'))) score += 110;
            if (haystack.includes('gemini') && (haystack.includes('pro') || haystack.includes('flash'))) score += 100;
            if (haystack.includes('grok')) score += 100;
            if (haystack.includes('deepseek')) score += 90;
            if (haystack.includes('kimi')) score += 70;
            if (haystack.includes('mistral') || haystack.includes('qwen')) score += 35;
            if (haystack.includes('free') || haystack.includes('preview') || haystack.includes('experimental')) score -= 20;
            if (model.context_length) score += Math.min(40, Math.floor(model.context_length / 8000));
            return score;
        }

        // 選單分類：✦ = 專為角色扮演/跑團微調的模型；▪ = 大廠通用優質文字模型；其餘無標記。
        const ROLEPLAY_MODEL_TOKENS = ['sao10k','stheno','euryale','lunaris','fimbulvetr','thedrummer','drummer','cydonia','rocinante','anubis','skyfall','magnum','magmell','mag-mell','mythomax','mytho','noromaid','hermes','lyra','midnight','erosumika','kunoichi','tiefighter','psyfighter','mlewd','chronos','weaver','wayfarer','unslop','nothingiisreal','venice','abliterated','uncensored','roleplay','-rp-','rpmax','eva-','starcannon','umbral','sorcererlm','painted','violet','angelslayer','wingless','dolphin'];
        const PREMIUM_MODEL_TOKENS = ['gpt-5','gpt-4.1','gpt-4o','o4','o3','claude','gemini','grok','deepseek','kimi','qwen','mistral','llama-4','llama-3'];

        function classifyModelForMenu(model) {
            const haystack = `${model.id || ''} ${model.name || ''}`.toLowerCase();
            if (ROLEPLAY_MODEL_TOKENS.some(t => haystack.includes(t))) return 'rp';
            if (PREMIUM_MODEL_TOKENS.some(t => haystack.includes(t))) return 'premium';
            return 'other';
        }

        function menuCategoryRank(model) {
            const category = classifyModelForMenu(model);
            return category === 'premium' ? 0 : (category === 'rp' ? 1 : 2);
        }

        function sortModelsForTRPG(models) {
            return [...models].sort((a, b) => {
                const rankDiff = menuCategoryRank(a) - menuCategoryRank(b);
                if (rankDiff !== 0) return rankDiff;
                return scoreModelForTRPG(b) - scoreModelForTRPG(a);
            });
        }



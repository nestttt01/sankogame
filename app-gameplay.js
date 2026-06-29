// === [app.js 拆分] app-gameplay.js：原 app.js 第 5882–6905 行｜對話渲染/頭像/訊息/loadGame/骰點/輸入/場景參與/創作者模式/生存｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
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
saveData.scenario = getCanonicalScenarioForSave(saveData.scenario);

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

        function calculateDiceCheck(statKey, difficultyKey = 'normal', forcedRoll = null, options = {}) {
            const statInfo = DICE_STATS[statKey];
            const difficulty = DICE_DIFFICULTIES[difficultyKey] || DICE_DIFFICULTIES.normal;
            const gameDifficulty = getGameDifficultyInfo();
            const stats = options.stats || currentScenario?.playerStats || {};
            const rawScore = Number(stats?.[statKey] ?? 10);
            const score = Number.isFinite(rawScore) ? Math.round(rawScore) : 10;
            const abilityModifier = Math.floor((score - 10) / 2);
            const survivalModifier = options.applySurvivalModifier === false ? 0 : getSurvivalDiceModifier(statKey);
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
                result,
                scope: options.scope || 'player'
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

        async function classifyDiceCheck(playerText, options = {}) {
            const stats = options.stats || currentScenario.playerStats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const actorLabel = options.actorLabel || '玩家';
            const prompt = `你是 TRPG 檢定分類器。只判斷這個行動最適合哪一項六屬性與難度，不要擲骰、不要判斷成功失敗，也不要因為某項數值較高就偏袒它。

判定對象：${actorLabel}
判定內容：${playerText}
目前情境：${scene.name || '未命名'}
情境法則：${scene.lore || '無特殊設定'}
參考六屬：STR ${stats.str}, DEX ${stats.dex}, CON ${stats.con}, INT ${stats.int}, WIS ${stats.wis}, CHA ${stats.cha}

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
            if (inputContext.mode === 'creator') {
                alert('「神」模式是創作者指令，不使用玩家六圍。請按一般發送。');
                return;
            }
            const isNarratorDice = inputContext.mode === 'narrator';
            const neutralNpcStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

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
                    : await classifyDiceCheck(playerText, isNarratorDice ? { stats: neutralNpcStats, actorLabel: 'NPC／旁白支線' } : {});
                const resurrectionIntent = getResurrectionIntent(playerText);
                if (resurrectionIntent && normalizeGameDifficulty(currentScenario?.gameDifficulty) === 'hard') {
                    if (isNpcRevivePermanentlyLocked(resurrectionIntent.npc)) throw new Error('這名 NPC 的復活機會已經失敗，無法再次嘗試。');
                    const rank = { easy: 0, normal: 1, hard: 2, extreme: 3 };
                    if ((rank[classification.difficultyKey] ?? 1) < rank.hard) classification.difficultyKey = 'hard';
                    classification.reason = `困難模式復活檢定：${resurrectionIntent.npc.name}`;
                }
                const check = calculateDiceCheck(
                    classification.statKey,
                    classification.difficultyKey,
                    null,
                    isNarratorDice ? { stats: neutralNpcStats, applySurvivalModifier: false, scope: 'narrator' } : {}
                );
                const signedAbility = check.abilityModifier >= 0 ? `+${check.abilityModifier}` : String(check.abilityModifier);
                const signedTotal = check.totalModifier >= 0 ? `+${check.totalModifier}` : String(check.totalModifier);
                const gameDifficultyText = check.gameDifficultyDcModifier ? `｜遊戲難度 ${check.gameDifficultyLabel}：DC +${check.gameDifficultyDcModifier}` : `｜遊戲難度 ${check.gameDifficultyLabel}`;
                const survivalText = check.survivalModifier ? `｜生存狀態修正 ${check.survivalModifier}` : '';
                const scopeText = isNarratorDice ? '｜NPC／旁白支線判定，不得套用玩家 HP/SAN 或好感' : '';
                const diceReason = `${classification.reason}${scopeText}`;
                classification.reason = diceReason;
                const directive = `(系統硬判定：${check.code} ${check.label}｜屬性 ${check.score}（加值 ${signedAbility}）｜行動難度 ${check.difficultyLabel}：基礎 DC ${check.difficultyDc}${gameDifficultyText}${survivalText}｜最終 DC ${check.dc}｜D20 ${check.roll} ${signedTotal} = ${check.total}｜結果【${check.result}】｜判定理由：${classification.reason}。此結果由程式計算，AI 不得更改。)`;
                pendingDiceSummary = `${check.code} ${check.label}｜${check.result}｜${check.roll}${signedTotal}=${check.total}／DC${check.dc}`;
                if (isNarratorDice) pendingDiceSummary = `支線判定｜${pendingDiceSummary}`;
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
            const resourceRule = '高風險場景應允許玩家透過符合世界觀的抽象資源降低風險、減輕代價或打開新路線；資源可以是物資、工具、防護、線索、通行權、人脈、信任、人情、承諾或其他故事優勢，不要固定生成特定物品名稱。';
            if (mode.gameOver === 'forced') return `【遊戲難度：${mode.label}】所有玩家角色檢定 DC 額外 +${mode.dcModifier}。HP 或 SAN 歸零時程式會立即鎖定 Game Over，旁白必須承接壞結局。${resourceRule}`;
            if (mode.gameOver === 'possible') return `【遊戲難度：${mode.label}】所有玩家角色檢定 DC 額外 +${mode.dcModifier}。HP 或 SAN 歸零時程式會在回覆完成後擲 D20 生死檢定：1–10 保命並回到 1 點，11–20 Game Over。你只能描寫倒下或崩潰，不可提前宣判最終生死。${resourceRule}`;
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


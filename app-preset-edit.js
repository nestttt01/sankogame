// === [app.js 拆分] app-preset-edit.js：原 app.js 第 3437–4152 行｜語音測試/AI 隨機生成/配置表單與儲存刪除/modal NPC 情境｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
async function testCharacterVoice(kind = 'npc', index = -1) {
refreshApiCredentials();
if (!apiKey || !selectedModel) {
alert(`請先驗證 ${getApiProviderLabel()} 金鑰並選擇模型。`);
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
            const coreRulesInput = document.getElementById('input-core-rules'); if (coreRulesInput) coreRulesInput.value = p.coreRules || ''; 
            const profInput = document.getElementById('input-proficiencies'); if (profInput) profInput.value = JSON.stringify(Array.isArray(p.playerProficiencies) ? p.playerProficiencies : []); if (typeof renderProficiencyTags === 'function') renderProficiencyTags();
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
const resolvedId = resolvePresetIdForScenario(scenario);
if (resolvedId && String(resolvedId) === String(presetId)) return true;
const presetName = valueToText(scenarioPresets[presetId]?.presetName);
return Boolean(presetName && valueToText(scenario.presetName) === presetName);
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
const presetName = valueToText(pOld?.presetName, uiText('未命名配置'));
const confirmMessage = boundSaves.length
? uiText('此配置目前綁定「{saveName}」遊戲紀錄。刪除配置會一起刪除此紀錄，確定要刪除嗎？')
.replace('{saveName}', getSaveDisplayName(boundSaves[0][1]))
: uiText('確定要刪除「{presetName}」這個配置嗎？').replace('{presetName}', presetName);
if (!confirm(confirmMessage)) return;
const deletedPresetId = activePresetId;
const previousPreset = pOld;
const removedSaves = boundSaves.map(([saveId, save]) => [saveId, save]);
delete scenarioPresets[deletedPresetId];
removedSaves.forEach(([saveId]) => {
delete savesData[saveId];
localStorage.removeItem(getInputDraftStorageKey(saveId));
if (currentSaveId === saveId) currentSaveId = null;
window.journeySelectedSaveIds?.delete(String(saveId));
});
activePresetId = Object.keys(scenarioPresets)[0];
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
scenarioPresets[deletedPresetId] = previousPreset;
removedSaves.forEach(([saveId, save]) => { savesData[saveId] = save; });
return;
}
let saveDeleteFailed = false;
removedSaves.forEach(([saveId, save]) => {
if (!removePersistedSave(saveId, '刪除遊戲存檔')) {
savesData[saveId] = save;
saveDeleteFailed = true;
}
});
if (saveDeleteFailed) return;
renderPresetSelector();
loadPresetToForm(activePresetId);
renderSaveList();
updateSetupCurrentPresetLabel();
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
 coreRules: document.getElementById('input-core-rules')?.value.trim() || previousPreset.coreRules || '',
 playerProficiencies: (() => { try { const v = JSON.parse(document.getElementById('input-proficiencies')?.value || '[]'); return Array.isArray(v) ? v : (previousPreset.playerProficiencies || []); } catch (e) { return previousPreset.playerProficiencies || []; } })(),
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
let newId = 'preset_' + Date.now();
while (scenarioPresets[newId]) newId = `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const currentName = document.getElementById('input-preset-name').value.trim(); 
const defaultName = currentName ? currentName + ' (另存)' : '未命名配置 (另存)';

const userInput = prompt(uiText('另存配置：請輸入新的配置檔名'), defaultName);
if (userInput === null) return; 

const newPresetName = userInput.trim() || defaultName;
const p = gatherPresetData(newId, newPresetName);
p.isLocked = false;
p.statsLocked = true;
scenarioPresets[newId] = p;
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
delete scenarioPresets[newId];
return;
}
renderPresetSelector();
renderPresetDeleteList();
alert(uiText('已另存配置「{presetName}」。').replace('{presetName}', newPresetName));
}

function saveAsNewGameFile() {
if (!currentSaveId || !savesData[currentSaveId]) return;
const sourceSave = savesData[currentSaveId];
const defaultName = `${getSaveDisplayName(sourceSave)} (另存)`;
const userInput = prompt(uiText('另存新檔：請輸入新的紀錄檔名'), defaultName);
if (userInput === null) return;
const newSaveName = userInput.trim() || defaultName;
try {
const statusModal = document.getElementById('status-modal');
if (statusModal && getComputedStyle(statusModal).display !== 'none') syncDomToCurrentScenario();
saveCurrentProgress();
const sourcePresetId = currentScenario?.sourcePresetId
|| (currentScenario?.id && scenarioPresets[currentScenario.id] ? currentScenario.id : '')
|| activePresetId;
const baselinePreset = scenarioPresets[sourcePresetId] || null;
let newPresetId = 'preset_' + Date.now();
while (scenarioPresets[newPresetId]) newPresetId = `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const newPreset = createPresetSnapshotFromScenario(currentScenario, baselinePreset);
newPreset.id = newPresetId;
newPreset.presetName = `${newSaveName} 專屬配置`;
newPreset.isLocked = false;
newPreset.statsLocked = true;
scenarioPresets[newPresetId] = newPreset;
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
delete scenarioPresets[newPresetId];
return;
}
let newSaveId = Date.now().toString();
while (savesData[newSaveId]) newSaveId = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const copiedSave = clonePersistentValue(savesData[currentSaveId]);
copiedSave.title = newSaveName;
copiedSave.date = new Date().toLocaleString();
copiedSave.scenario = clonePersistentValue(currentScenario);
copiedSave.scenario.id = newPresetId;
copiedSave.scenario.sourcePresetId = newPresetId;
savesData[newSaveId] = copiedSave;
if (!persistSingleSave(newSaveId, '遊戲存檔')) {
delete savesData[newSaveId];
delete scenarioPresets[newPresetId];
persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
return;
}
activePresetId = newPresetId;
localStorage.setItem('sanko_active_preset_id', activePresetId);
loadGame(newSaveId);
renderPresetSelector();
renderSaveList();
updateSetupCurrentPresetLabel();
} catch (error) {
console.error(error);
alert(`另存新檔失敗：${error.message || error}`);
}
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
            const eCoreRules = document.getElementById('edit-core-rules');
            if (eCoreRules) currentScenario.coreRules = eCoreRules.value;
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
                const eSObjective = document.getElementById(`edit-scen-objective-${idx}`);
                if(eSObjective) sc.objective = eSObjective.value;
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


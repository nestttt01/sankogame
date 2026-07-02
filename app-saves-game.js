// === [app.js 拆分] app-saves-game.js：原 app.js 第 4982–5881 行｜存檔選單與列表/匯出匯入存檔/保存進度/情境管理/系統指令/場景切換｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
function openSaveMenu() {
refreshApiCredentials();
if(!apiKey || !selectedModel) { alert(`請先驗證 ${getApiProviderLabel()} 金鑰並選擇模型。`); return; }
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
const scenario = getCanonicalScenarioForSave(saveData.scenario && typeof saveData.scenario === 'object' ? saveData.scenario : {}) || {};
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
alert(uiText('已匯出 {count} 份資料。').replace('{count}', '1'));
}

function importSaves(input) {
const file = input.files?.[0];
if (!file) return;
const reader = new FileReader();
reader.onload = event => {
try {
const preservedUiLanguage = window.getUiLanguage ? getUiLanguage() : null;
const importedData = JSON.parse(event.target.result);
const normalizedImport = normalizeImportPayload(importedData);
const importedSaves = normalizedImport.saves;
const importedPresets = normalizedImport.presets;
if ((!importedSaves || typeof importedSaves !== 'object' || Array.isArray(importedSaves))
&& (!importedPresets || typeof importedPresets !== 'object' || Array.isArray(importedPresets))) {
throw new Error('沒有可用的存檔或角色配置');
}
let presetCount = 0;
let saveCount = 0;
let skippedSaveCount = 0;
const presetIdMap = {};
Object.entries(importedPresets || {}).forEach(([sourceId, rawPreset]) => {
if (!rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) return;
const result = importPresetWithoutDuplicate(rawPreset, { characters: true, scenarios: true }, {
originalId: sourceId,
matchByNameAndContent: false
});
presetIdMap[sourceId] = result.id;
if (rawPreset.id) presetIdMap[rawPreset.id] = result.id;
if (!result.imported) return;
presetCount += 1;
});
Object.entries(importedSaves || {}).forEach(([sourceId, rawSave]) => {
if (!rawSave || typeof rawSave !== 'object' || Array.isArray(rawSave)) return;
const targetId = savesData[sourceId] ? `save_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` : sourceId;
const copiedSave = stripImagesAndPrivateData(getJsonClone(rawSave));
const originalPresetId = copiedSave.scenario?.sourcePresetId || copiedSave.scenario?.id || '';
if (originalPresetId && presetIdMap[originalPresetId]) {
copiedSave.scenario.sourcePresetId = presetIdMap[originalPresetId];
if (copiedSave.scenario.id === originalPresetId) copiedSave.scenario.id = presetIdMap[originalPresetId];
}
if (findExistingSaveForImport(copiedSave)) {
skippedSaveCount += 1;
return;
}
savesData[targetId] = copiedSave;
saveCount += 1;
});
if (!saveCount && !presetCount && !skippedSaveCount) throw new Error('沒有可用的存檔或角色配置');
persistJson('sanko_scenario_presets_v2', scenarioPresets, '匯入角色配置');
persistJson('sanko_saves_v8', savesData, '匯入存檔');
renderPresetSelector();
renderSaveList();
if (preservedUiLanguage && window.setUiLanguage) {
setUiLanguage(preservedUiLanguage, { persist: false, notify: false });
} else if (window.translateUi) {
translateUi(document.body);
}
if (!saveCount && !presetCount && skippedSaveCount) {
alert(uiText('沒有新增資料，已略過 {count} 個重複存檔。').replace('{count}', skippedSaveCount));
} else {
const skippedText = skippedSaveCount
? uiText('略過 {count} 個重複存檔。').replace('{count}', skippedSaveCount)
: '';
alert(uiText('匯入完成：{saveCount} 個存檔、{presetCount} 個角色配置。{skippedText}')
.replace('{saveCount}', saveCount)
.replace('{presetCount}', presetCount)
.replace('{skippedText}', skippedText));
}
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
    if (currentScenario && typeof currentScenario === 'object') {
        const boundPresetId = currentScenario.sourcePresetId
            || (currentScenario.id && scenarioPresets?.[currentScenario.id] ? currentScenario.id : '')
            || (activePresetId && scenarioPresets?.[activePresetId] ? activePresetId : '');
        if (boundPresetId) currentScenario.sourcePresetId = boundPresetId;
    }
    syncBoundPresetFromCurrentScenario();
    const scenarioForSave = getCanonicalScenarioForSave(currentScenario);
savesData[currentSaveId].scenario = scenarioForSave;
currentScenario = scenarioForSave;
savesData[currentSaveId].sceneTransition = pendingSceneTransition;
delete savesData[currentSaveId].script;
const saved = persistSingleSave(currentSaveId, '遊戲存檔');
return saved;
}

function syncBoundPresetFromCurrentScenario() {
if (!currentScenario || typeof currentScenario !== 'object') return false;
const sourceId = currentScenario.sourcePresetId
|| (currentScenario.id && scenarioPresets?.[currentScenario.id] ? currentScenario.id : '')
|| '';
if (!sourceId || !scenarioPresets?.[sourceId]) return false;
const previousPreset = scenarioPresets[sourceId];
if (previousPreset.isLocked) return false;
const syncPreset = createPresetSnapshotFromScenario(currentScenario);
syncPreset.id = sourceId;
syncPreset.presetName = previousPreset.presetName;
syncPreset.isLocked = false;
syncPreset.statsLocked = previousPreset.statsLocked !== undefined ? previousPreset.statsLocked : true;
scenarioPresets[sourceId] = syncPreset;
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
scenarioPresets[sourceId] = previousPreset;
return false;
}
return true;
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

        function createBlankScenario(name = '新情境') {
            return { name, lore: '', npcRoles: '', playerRole: '', transitionRule: '' };
        }

        function refreshGameLocationSelect() {
            const locSelect = document.getElementById('btn-location');
            if (!locSelect) return;
            locSelect.innerHTML = '';
            (currentScenario.scenarios || []).forEach((sc, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerText = `📍 ${sc.name || '未命名'}`;
                if (i === currentScenarioIndex) opt.selected = true;
                locSelect.appendChild(opt);
            });
        }

        function addScenarioToCurrentGame(scenario) {
            if (!Array.isArray(currentScenario.scenarios)) currentScenario.scenarios = [];
            currentScenario.scenarios.push(scenario);
            const newIndex = currentScenario.scenarios.length - 1;
            chatScripts[newIndex] = [];
            refreshGameLocationSelect();
            return newIndex;
        }

        function openStatusScenarioEditor(scenarioIndex) {
            activeStatusTab = 'settings';
            openStatusModal();
            switchStatusTab('settings');
            requestAnimationFrame(() => {
                const input = document.getElementById(`edit-scen-name-${scenarioIndex}`);
                const card = input?.closest('details');
                if (card) {
                    card.open = true;
                    card.scrollIntoView({ block: 'start', behavior: 'smooth' });
                }
                if (input) {
                    input.focus();
                    input.select();
                }
            });
        }

        function addMidGameScenarioAndEdit() {
            if (document.getElementById('status-modal')?.style.display === 'block') syncDomToCurrentScenario();
            const newIndex = addScenarioToCurrentGame(createBlankScenario());
            changeScenario(newIndex);
            openStatusScenarioEditor(newIndex);
        }

        function confirmMidGameScenario() {
            const name = document.getElementById('mid-scen-name').value.trim() || '未知領域';
            const lore = document.getElementById('mid-scen-lore').value.trim();
            const npcRoles = document.getElementById('mid-scen-npcs').value.trim();
            const playerRole = document.getElementById('mid-scen-player').value.trim();
            const transitionRule = document.getElementById('mid-scen-transition').value.trim();
            
            const newScen = { name, lore, npcRoles, playerRole, transitionRule };
            const newIndex = addScenarioToCurrentGame(newScen);
            
            document.getElementById('midgame-scen-modal').style.display = 'none';
            changeScenario(newIndex); 
        }

        // 推算「此情境此刻的在場角色」：優先用 AI 維護的現場快照，沒有就用最近 3 回合說過話＋本場景指派身分推測。
        function getPresentRosterForScene(scene = currentScenario.scenarios?.[currentScenarioIndex] || {}, profile = getModelRuntimeProfile()) {
            const aliveNpcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs.filter(npc => !isNpcDead(npc)) : [];
            const situation = normalizeRuntimeSituation(scene.runtimeSituation);
            const names = [];
            const npcs = [];
            const pushName = name => { const n = valueToText(name); if (n && !names.includes(n)) names.push(n); };
            if (situation.present.length) {
                situation.present.forEach(name => {
                    pushName(name);
                    const npc = aliveNpcs.find(item => valueToText(item.name) === valueToText(name));
                    if (npc && !npcs.includes(npc)) npcs.push(npc);
                });
            } else {
                const recentText = `${valueToText(scene?.npcRoles)}\n${getRecentChatText(currentChatPageIndex, { maxTurns: 3, maxChars: 1800 })}`.toLowerCase();
                aliveNpcs.forEach(npc => {
                    const name = valueToText(npc.name);
                    if (name && recentText.includes(name.toLowerCase())) { pushName(name); npcs.push(npc); }
                });
            }
            return { names: names.slice(0, 12), npcs: npcs.slice(0, Math.max(profile.npcLimit, 6)), situation };
        }

        function getRelevantNpcsForPrompt(scene, latestPlayerAction, profile, forcedNpcs = []) {
            const npcs = Array.isArray(currentScenario.npcs) ? currentScenario.npcs.filter(npc => !isNpcDead(npc)) : [];
            if (npcs.length <= profile.npcLimit) return npcs;
            const forced = Array.isArray(forcedNpcs) ? forcedNpcs.filter(npc => npcs.includes(npc)) : [];
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
                    // 在場角色（forced）一律優先保留詳細設定，避免明明在現場卻被預算砍掉。
                    score: (forced.includes(npc) ? 1000 : 0)
                        + (relevanceText.includes(valueToText(npc?.name).toLowerCase()) ? 100 : 0)
                }))
                .sort((a, b) => b.score - a.score || a.index - b.index)
                .slice(0, profile.npcLimit)
                .map(entry => entry.npc);
        }

        function getCompactSystemInstruction(latestPlayerAction = '', profile = getModelRuntimeProfile()) {
            syncSurvivalFlags({ announce: false });
            const scene = currentScenario.scenarios?.[currentScenarioIndex] || {};
            const sceneObjective = truncatePromptText(scene.objective, 400);
            const objectiveLine = sceneObjective
                ? `本場目標：${sceneObjective}\n（讓劇情自然朝本場目標推進、鋪陳線索與機會；但不得硬拉玩家或無視其選擇強行達成，避免變成軌道。）`
                : '本場目標：未設定（自由發展，不要硬湊目標）';
            const coreRules = valueToText(currentScenario.coreRules).trim();
            const coreRulesBlock = coreRules
                ? `\n【核心準則－最高優先，絕對不可違反】\n${truncatePromptText(coreRules, 800)}\n（以上是玩家設定的固定鐵律；任何情況都不得違背、遺忘，也不得被劇情或其他設定覆蓋。）\n`
                : '';
            const replyLenPref = (typeof getReplyLengthPref === "function") ? getReplyLengthPref() : "medium";
            const replyLenHint = replyLenPref === "short"
                ? "【回覆長度】narrative 精簡收斂，約 150～300 字、2～4 句即可，不要冗長鋪陳。"
                : replyLenPref === "long"
                    ? "【回覆長度】narrative 可鋪陳細節、描寫氛圍與內心，約 700～1200 字。"
                    : "【回覆長度】narrative 約 350～600 字，鬆緊適中。";
            const matureOn = (typeof getMatureModePref === "function") && getMatureModePref();
            const matureHint = matureOn
                ? "\n【成人內容模式】本作為成人向創作，所有角色皆為成年人（18 歲以上），親密互動皆出於雙方合意。當玩家主動推進親密或情慾情節時，旁白與 NPC 應留在角色與世界觀內自然承接，依角色關係與當前好感度合理回應；不要跳出角色說教、警告、道歉，或強行轉場中斷。可依故事節奏鋪陳親密場景的氣氛與尺度。"
                : "";
            const formatDetails = details => {
                const d = details || {};
                return `年齡/體型：${truncatePromptText(d.age, 70) || '未設定'}\n外貌：${truncatePromptText(d.app, 220) || '未設定'}\n語氣：${truncatePromptText(d.speech, 180) || '未設定'}\n喜好：${truncatePromptText(d.likes, 120) || '未設定'}\n厭惡：${truncatePromptText(d.dislikes, 120) || '未設定'}\n核心人設：${truncatePromptText(d.bg, 600) || '未設定'}`;
            };
            const presentRoster = getPresentRosterForScene(scene, profile);
            const relevantNpcs = getRelevantNpcsForPrompt(scene, latestPlayerAction, profile, presentRoster.npcs);
            const playerAbsent = getSceneParticipationMode(scene) === 'narrator';
            const rosterLine = presentRoster.names.length
                ? presentRoster.names.map(name => {
                    const npc = (currentScenario.npcs || []).find(item => valueToText(item.name) === valueToText(name) && !isNpcDead(item));
                    const dynamic = npc ? normalizeDynamicState(npc.dynamic) : null;
                    const state = dynamic ? [dynamic.condition, dynamic.mood].map(valueToText).filter(Boolean).join('／') : '';
                    return state ? `${name}（${truncatePromptText(state, 40)}）` : valueToText(name);
                }).join('、')
                : '尚無明確其他角色在場；僅依旁白描述的環境。';
            const currentSituationBlock = `【現在狀況－每回合必讀，最高優先的當下事實】
地點：${presentRoster.situation.location || '沿用上一幕，未變更前不得擅自更換場景'}
時間：${presentRoster.situation.time || '沿用上一幕，未明確說明前不得跳時間'}
玩家是否在場：${playerAbsent ? `否（${valueToText(currentScenario.playerName, '玩家')} 目前不在現場，操作者採旁白／導演視角）` : `是（${valueToText(currentScenario.playerName, '玩家')} 在現場）`}
在場角色：${rosterLine}
（這是此刻的物理現場。除非本回合輸入或劇情明確改變，必須延續上述地點、時間與在場角色，不得無故遺忘、移除或替換。若現場確實變動，於 changes.scene_state 回報新的 location／time／present。）`;
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
${coreRulesBlock}
【敘事原則】
- 尊重玩家建立的世界、核心人設與已發生事實；不得擅自改寫。
- 對話自然、有角色差異與適度留白；普通回合簡潔，重大轉折才增加描寫。
- 只讓此刻需要反應的角色說話，不要安排所有 NPC 輪流發言。
- 不預設任何固定劇情；只承接本回合輸入與下方資料。

${currentSituationBlock}

【當前場景】
名稱：${truncatePromptText(scene.name, 100) || '未命名'}
世界與規則：${truncatePromptText(scene.lore, profile.loreChars) || '未設定'}
NPC 在本場景的身分：${truncatePromptText(scene.npcRoles || scene.targetRole, 700) || '未設定'}
玩家身分／視角：${truncatePromptText(scene.playerRole, 500) || '未設定'}
${objectiveLine}
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
- 困難或極限模式下，高風險場景應讓玩家有機會取得、交換、消耗或犧牲符合世界觀的抽象資源。資源可為物資、工具、防護、線索、通行權、人脈、信任、人情、承諾或其他故事優勢；不要固定生成特定物品名稱。玩家合理使用資源時，可降低風險、減輕失敗代價或打開新路線。
- 創作者指令是角色外舞台命令；NPC 不得聽見，也不得因此改變好感。輔助旁白不是玩家角色的言行。
- 只有角色行動模式才可改變玩家 HP、SAN、道具或好感；必須依實際事件填入 changes。
- HP 或 SAN 歸零時遵守目前難度的結局規則；不可自行忽略程式狀態。
- 場景延續：地點、時間、在場角色預設延續「現在狀況」。只有本回合輸入或劇情明確改變現場時，才在 changes.scene_state 回報變動欄位（present 填目前實際在現場的角色名單，玩家不在場時不要列入玩家）；現場沒變動就省略 scene_state。
- npc_states／player_state 的 memoryNotes 不是日誌：只有重大約定、未公開秘密、關係里程碑或不可逆選擇才可新增，且必須 persistent:true。
- 每名角色每回合最多新增 1 條 memoryNotes，限 36 字內的短標題。普通情緒、氣氛、對話內容、受傷與日常互動不得寫入；相似內容不得換句話重複新增。
- 只有劇情文字已明確確認 NPC 死亡時，才可填 npc_deaths；重傷、昏迷、失蹤或生死不明都不算死亡。
- ${difficulty.key === 'standard' ? '標準模式：劇情明確演出復活，或「神」直接介入時可填 npc_revives；不強制檢定。' : (difficulty.key === 'hard' ? '困難模式：每次死亡只有一次復活嘗試。所有復活相關 options 都必須有六屬性檢定且 difficulty 至少為 hard；程式會執行成敗，npc_revives 必須留空。若已標記復活失敗，禁止再提供任何復活選項。' : '極限模式：死亡永久成立，npc_revives 必須為空，禁止提供任何復活行動或選項。')}

【長期記憶判定】
普通對話、移動、短暫情緒、重複描述與無後續影響的小事：memory 必須為 null。
只有任務異動、關係或承諾實質改變、重要物品得失、永久狀態、重要線索、不可逆選擇，或會影響後續的場景變化，才回傳 memory。上述任一情況一旦發生，memory 為必填、不得省略；即使本回合 JSON 內容較長，也必須完整輸出 memory 欄位到最後。
memory.category 只能是 task、relationship、item、status、clue、decision、scene；memory.event 只寫一條簡短既定事實。story_summary 與 relationship_summary 只有重大變化時才回傳完整精簡快照，否則省略。不得把普通事件硬寫成重點。

【狀態旗標（flags_add）判定——嚴格，預設不加】
只有「會長期存在、之後每回合都該當成既定前提」的關鍵標記才寫入 flags_add，且必須屬於下列之一：
1. 持久身分／處境：取得的身分、職位、陣營、被通緝、未解的中毒或傷病、失明、懷孕等會延續多回合的狀態。
2. 稱號／名號：被賦予且會被沿用的稱號。
3. 確定的關係里程碑：關係正式定下的節點（結為戀人、結拜、正式敵對、締結契約），或某 NPC 好感度達到滿值 100。
4. 契約、詛咒、印記、後遺症等會持續生效的設定。
以下一律不得寫成 flag（改走 memory 或日誌）：普通對話、移動、短暫情緒、曖昧或好感小幅變化、單次小事件、一般任務進度。
加入前先自問：「這會延續到很多回合以後、且之後劇情要一直記得嗎？」——不確定就不要加。每回合最多加 1～2 個真正重要的，寧缺勿濫。

${replyLenHint}${matureHint}

【JSON 契約】
必須回傳 narrative、dialogues、options。changes 只放本回合真的發生的變動；無變動可回傳 {}。memory 無重大事件時回傳 null。
{
  "narrative":"旁白文字",
  "dialogues":[{"speaker":"<角色名>","text":"台詞"}],
  "options":[{"text":"下一步","check":"none|str|dex|con|int|wis|cha","difficulty":"trivial|easy|normal|hard|extreme"}],
  "memory":{"category":"task|relationship|item|status|clue|decision|scene","event":"重大既定事實","story_summary":[],"relationship_summary":[],"task_updates":[{"action":"add|complete|reopen|remove","text":"任務"}]},
  "changes":{
    "hp":0,"san":0,
    "affection_change":{"<角色名>":0},"affection_set":{"<角色名>":0},
    "items_add":[],"items_remove":[],"flags_add":[],
    "npc_deaths":[{"name":"<角色名>","cause":"明確死因或死亡事件"}],
    "npc_revives":[{"name":"<角色名>","reason":"明確復活事件；只供標準模式使用"}],
    "npc_states":[{"name":"<角色名>","persistent":false,"changes":{"mood":"","condition":"","relationship":"","goal":"","memoryNotes":[]}}],
    "player_state":{},
    "scene_state":{"location":"","time":"","present":["<目前在場角色名>"]}
  }
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
                const category = classifyModelForMenu(model);
                const prefix = category === 'premium' ? '▪ ' : '';
                const label = prefix + (model.name || model.id);
                const opt = document.createElement('option');
                opt.value = model.id;
                opt.textContent = label;
                const optGame = document.createElement('option');
                optGame.value = model.id;
                optGame.textContent = label;
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

        // 非「文字寫作」用途的模型關鍵字：程式碼專用 / 安全審查 / embedding / 語音 / OCR 等。
        // 這些即使能輸出文字也不適合拿來跑劇情，從清單濾除以精簡選單。
        const NON_WRITING_MODEL_TOKENS = ['coder', 'codestral', 'codellama', 'codex', 'embed', 'rerank', 'moderation', 'guard', 'shield', 'whisper', 'tts', 'audio', 'speech', 'transcribe', 'ocr'];
        function isWritingFocusedModel(id, name) {
            const haystack = `${id || ''} ${name || ''}`.toLowerCase();
            return !NON_WRITING_MODEL_TOKENS.some(t => haystack.includes(t));
        }

        async function fetchGoogleModels() {
            const res = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message || "Google API 金鑰驗證失敗。");

            const validModels = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent") && !m.name.includes("-tts") && !m.name.includes("-vision") && isWritingFocusedModel(m.name, m.displayName))
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
                .filter(m => (!m.architecture || !m.architecture.output_modalities || m.architecture.output_modalities.includes('text')) && isWritingFocusedModel(m.id, m.name))
                .map(m => ({
                    id: m.id,
                    name: `${m.name || m.id}${m.context_length ? ` (${Math.round(m.context_length / 1000)}k)` : ''}`,
                    context_length: m.context_length || 0
                }));
            if(validModels.length === 0) throw new Error("找不到可用的 OpenRouter 文字模型。");
            return validModels;
        }

        async function fetchAnthropicModels() {
            const fallbackModels = [
                { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', context_length: 200000 },
                { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', context_length: 200000 },
                { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', context_length: 200000 },
                { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', context_length: 200000 }
            ];
            try {
                const res = await fetchWithTimeout('https://api.anthropic.com/v1/models?limit=100', {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    }
                });
                const data = await res.json();
                if (!res.ok || data.error) {
                    if (res.status === 401 || res.status === 403) throw new Error(data.error?.message || 'Anthropic API 金鑰無效或沒有權限。');
                    return fallbackModels;
                }
                const list = (data.data || [])
                    .filter(m => /claude/i.test(m.id || ''))
                    .map(m => ({ id: m.id, name: m.display_name || m.id, context_length: 200000 }));
                return list.length ? list : fallbackModels;
            } catch (error) {
                if (/金鑰|無效|沒有權限|invalid|unauthor|forbidden/i.test(String(error?.message || ''))) throw error;
                return fallbackModels;
            }
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
                const models = apiProvider === 'openrouter' ? await fetchOpenRouterModels() : apiProvider === 'anthropic' ? await fetchAnthropicModels() : await fetchGoogleModels();
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


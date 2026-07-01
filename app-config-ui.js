// === [app.js 拆分] app-config-ui.js：原 app.js 第 2921–3436 行｜桌機角色配置 UI/配置概覽/NPC 與情境列表｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
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
            screen.dataset.workspace = desktopConfigWorkspace;
            screen.classList.remove('desktop-editor-open');
            screen.classList.toggle('game-workspace-active', desktopConfigWorkspace === 'game');
            delete screen.dataset.editorSection;
            setDesktopConfigTab(desktopConfigWorkspace);
            document.querySelectorAll('.desktop-workspace-view').forEach(view => {
                view.classList.toggle('active', view.dataset.workspaceView === desktopConfigWorkspace);
            });
            renderDesktopPresetOverview();
        }

        function openDesktopConfigEditor(section = 'player', itemIndex = -1) {
            if (!isDesktopConfigLayout()) return;
            const screen = document.getElementById('edit-scenario-screen');
            if (!screen) return;
            const workspace = section === 'scenario' ? 'scenarios' : (section === 'game' ? 'game' : 'characters');
            desktopConfigWorkspace = workspace;
            screen.dataset.workspace = workspace;
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
bindingNote.textContent = `${uiText('綁定紀錄')}：${getPresetBoundSaveName(activePresetId)}`;
}
renderPresetDeleteList();
}

function getSaveDisplayName(save) {
return valueToText(save?.title, save?.date || uiText('未命名紀錄'));
}

function getPresetBoundSaveName(presetId) {
const boundSaves = getPresetBoundSaves(presetId);
if (!boundSaves.length) return uiText('無');
return getSaveDisplayName(boundSaves[0][1]);
}

function getPresetDeleteBlockReason(id) {
if (scenarioPresets[id]?.isLocked) return uiText('已上鎖');
return '';
}

function getPresetDeleteNote(id) {
const boundSaveName = getPresetBoundSaveName(id);
if (boundSaveName !== uiText('無')) return `${uiText('綁定紀錄')}：${boundSaveName}`;
return '';
}

function renderPresetDeleteList() {
const list = document.getElementById('preset-delete-list');
const selectAll = document.getElementById('preset-delete-select-all');
if (!list) return;
list.innerHTML = '';
Object.entries(scenarioPresets || {}).forEach(([id, preset]) => {
const reason = getPresetDeleteBlockReason(id);
const note = getPresetDeleteNote(id);
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
name.textContent = `${valueToText(preset?.presetName, '未命名配置')}${reason ? `（${reason}）` : note ? `（${note}）` : ''}`;
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
const boundSaveEntries = [];
for (const id of deletableIds) {
const boundSaves = getPresetBoundSaves(id);
if (!boundSaves.length) continue;
const saveName = getSaveDisplayName(boundSaves[0][1]);
const boundMessage = uiText('此配置目前綁定「{saveName}」遊戲紀錄。刪除配置會一起刪除此紀錄，確定要刪除嗎？')
.replace('{saveName}', saveName);
if (!confirm(boundMessage)) return;
boundSaves.forEach(([saveId, save]) => boundSaveEntries.push([saveId, save]));
}
const previousPresets = getJsonClone(scenarioPresets);
const previousSaves = boundSaveEntries.map(([saveId, save]) => [saveId, save]);
deletableIds.forEach(id => delete scenarioPresets[id]);
boundSaveEntries.forEach(([saveId]) => {
delete savesData[saveId];
localStorage.removeItem(getInputDraftStorageKey(saveId));
if (currentSaveId === saveId) currentSaveId = null;
window.journeySelectedSaveIds?.delete(String(saveId));
});
if (!scenarioPresets[activePresetId]) activePresetId = Object.keys(scenarioPresets)[0] || 'default';
if (!persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置')) {
scenarioPresets = previousPresets;
previousSaves.forEach(([saveId, save]) => { savesData[saveId] = save; });
renderPresetDeleteList();
return;
}
let saveDeleteFailed = false;
boundSaveEntries.forEach(([saveId, save]) => {
if (!removePersistedSave(saveId, '刪除遊戲存檔')) {
savesData[saveId] = save;
saveDeleteFailed = true;
}
});
if (saveDeleteFailed) {
scenarioPresets = previousPresets;
previousSaves.forEach(([saveId, save]) => { savesData[saveId] = save; });
persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
renderPresetDeleteList();
renderSaveList();
return;
}
localStorage.setItem('sanko_active_preset_id', activePresetId);
renderPresetSelector();
loadPresetToForm(activePresetId);
renderDesktopGameSettings();
renderSaveList();
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
                        <div class="scenario-label">本場目標（選填，DM 會朝此推進）</div>
<textarea class="scenario-input" id="scen-objective-${index}" placeholder="${escapeStatusHtml(uiText('例如：讓玩家在天黑前找到出口。'))}" oninput="autoResize(this)">${escapeStatusHtml(scen.objective || '')}</textarea>
                        <div class="scenario-label">轉場規則（選填）</div>
<textarea class="scenario-input" id="scen-transition-${index}" placeholder="${escapeStatusHtml(uiText('例如：切回此情境時視為夢醒。'))}" oninput="autoResize(this)">${escapeStatusHtml(scen.transitionRule || '')}</textarea>
                    </div>
                `;
                container.appendChild(details);
            });
            initTextareas();
            forceOpenScenIndex = -1;
            renderDesktopPresetOverview();
        }

        let coreRulesSaveTimer = null;
function updateCoreRulesDrawerDirection(widget) {
if (!widget) return;
widget.classList.remove('open-inside', 'open-outside');
const rect = widget.getBoundingClientRect();
const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
const outsideRoom = rect.left;
const insideRoom = viewportWidth - rect.left;
const outsideFitWidth = Math.min(320, Math.max(0, outsideRoom - 48));
const insideFitWidth = Math.min(320, Math.max(240, insideRoom - 24));
const shouldOpenOutside = window.matchMedia('(min-width: 700px)').matches
&& outsideFitWidth >= 240;
widget.style.setProperty('--core-rules-drawer-width', `${shouldOpenOutside ? outsideFitWidth : insideFitWidth}px`);
widget.classList.add(shouldOpenOutside ? 'open-outside' : 'open-inside');
}
        function toggleCoreRulesDrawer(btn, force) {
            const widget = btn && btn.closest ? btn.closest('.core-rules-widget') : document.querySelector('.core-rules-widget');
            if (!widget) return;
            const willOpen = typeof force === 'boolean' ? force : !widget.classList.contains('open');
if (willOpen) {
updateCoreRulesDrawerDirection(widget);
} else {
setTimeout(() => {
if (!widget.classList.contains('open')) {
widget.classList.remove('open-inside', 'open-outside');
widget.style.removeProperty('--core-rules-drawer-width');
}
}, 180);
}
widget.classList.toggle('open', willOpen);
            const tab = widget.querySelector('.core-rules-tab');
            if (tab) tab.setAttribute('aria-expanded', String(willOpen));
            if (willOpen) {
                const editor = widget.querySelector('.core-rules-editor');
                if (editor) {
                    const inGame = Boolean(widget.closest('#game-container'));
                    editor.value = inGame
                        ? ((typeof currentScenario === 'object' && currentScenario && currentScenario.coreRules) || '')
                        : (document.getElementById('input-core-rules')?.value || '');
                    setTimeout(() => editor.focus(), 50);
                }
                if (typeof renderProficiencyTags === 'function') renderProficiencyTags();
            }
        }

        function onCoreRulesInput(el) {
            const widget = el.closest('.core-rules-widget');
            const inGame = Boolean(widget && widget.closest('#game-container'));
            if (inGame) {
                if (typeof currentScenario === 'object' && currentScenario) currentScenario.coreRules = el.value;
                clearTimeout(coreRulesSaveTimer);
                coreRulesSaveTimer = setTimeout(() => { if (typeof saveCurrentProgress === 'function') saveCurrentProgress(); }, 600);
            } else {
                const hidden = document.getElementById('input-core-rules');
                if (hidden) hidden.value = el.value;
            }
        }

        function readEditingProficiencyList() {
            try {
                const v = JSON.parse(document.getElementById('input-proficiencies')?.value || '[]');
                return Array.isArray(v) ? v.map(x => valueToText(x).trim()).filter(Boolean) : [];
            } catch (e) { return []; }
        }

        function getProficiencyListForContext(inGame) {
            if (inGame) {
                return (currentScenario && Array.isArray(currentScenario.playerProficiencies))
                    ? currentScenario.playerProficiencies.map(x => valueToText(x).trim()).filter(Boolean) : [];
            }
            return readEditingProficiencyList();
        }

        function renderProficiencyTags() {
            document.querySelectorAll('[data-proficiency-tags]').forEach(container => {
                const inGame = Boolean(container.closest('#game-container'));
                const list = getProficiencyListForContext(inGame);
                container.innerHTML = '';
                if (!list.length) {
                    const empty = document.createElement('span');
                    empty.className = 'proficiency-empty';
                    empty.textContent = (typeof uiText === 'function') ? uiText('尚未生成擅長領域。') : '尚未生成擅長領域。';
                    container.appendChild(empty);
                    return;
                }
                list.forEach((prof, index) => {
                    const tag = document.createElement('span');
                    tag.className = 'proficiency-tag';
                    tag.appendChild(document.createTextNode(valueToText(prof) + ' '));
                    const rm = document.createElement('span');
                    rm.className = 'proficiency-tag-remove';
                    rm.textContent = '✖';
                    rm.setAttribute('role', 'button');
                    rm.setAttribute('tabindex', '0');
                    rm.onclick = () => removeProficiency(index, inGame);
                    rm.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') removeProficiency(index, inGame); };
                    tag.appendChild(rm);
                    container.appendChild(tag);
                });
            });
        }

        function persistProficiencyList(clean, inGame) {
            if (inGame) {
                if (currentScenario && typeof currentScenario === 'object') currentScenario.playerProficiencies = clean;
                if (typeof saveCurrentProgress === 'function') saveCurrentProgress();
            } else {
                const input = document.getElementById('input-proficiencies');
                if (input) input.value = JSON.stringify(clean);
                if (typeof commitCurrentPresetSilently === 'function') commitCurrentPresetSilently();
            }
            renderProficiencyTags();
        }

        function setEditingProficiencies(list, inGame) {
            const clean = (Array.isArray(list) ? list : []).map(v => valueToText(v).trim()).filter(Boolean).slice(0, 4);
            persistProficiencyList(clean, inGame);
        }

        function removeProficiency(index, inGame) {
            const list = getProficiencyListForContext(inGame).slice();
            if (index < 0 || index >= list.length) return;
            list.splice(index, 1);
            persistProficiencyList(list, inGame);
        }

        async function generatePlayerProficiencies(btn) {
            const inGame = Boolean(btn && btn.closest && btn.closest('#game-container'));
            if (!inGame && scenarioPresets[activePresetId] && scenarioPresets[activePresetId].isLocked) {
                alert((typeof uiText === 'function') ? uiText('目前這個配置已上鎖，無法修改。') : '目前這個配置已上鎖，無法修改。');
                return;
            }
            let name = '', bg = '', likes = '';
            if (inGame) {
                const det = (currentScenario && currentScenario.playerDetails) || {};
                name = valueToText(currentScenario && currentScenario.playerName);
                bg = valueToText(det.bg).trim();
                likes = valueToText(det.likes).trim();
            } else {
                name = document.getElementById('input-player-name')?.value.trim() || '';
                bg = document.getElementById('p-bg')?.value.trim() || '';
                likes = document.getElementById('p-likes')?.value.trim() || '';
            }
            if (!bg) {
                alert((typeof uiText === 'function') ? uiText('請先在「核心性格 / 背景故事」填寫角色設定，再生成擅長。') : '請先填寫角色的性格 / 背景，再生成擅長。');
                return;
            }
            const buttons = Array.from(document.querySelectorAll('.proficiency-gen-btn'));
            const restoreLabel = (typeof uiText === 'function') ? uiText('角色專屬的魔法') : '角色專屬的魔法';
            buttons.forEach(b => { b.disabled = true; });
            if (btn) btn.textContent = (typeof uiText === 'function') ? uiText('生成中…') : '生成中…';
            try {
                const prompt = `你是 TRPG 角色專長分析器。只根據下面角色「已明確寫出」的性格與背景，列出這名角色真正擅長的 2～4 個具體領域，作為檢定加值依據。\n\n角色名稱：${name || '（未命名）'}\n性格 / 背景：${bg}\n喜好：${likes || '（未填）'}\n\n規則：\n- 只列設定裡明確、具體、符合常理的專長；設定沒有依據的不要編。\n- 拒絕籠統或萬能描述（例如「什麼都會」「天才」「無所不能」），那類請忽略不列。\n- 每項用 4～12 字的具體技能領域（例：安撫他人、潛行跟蹤、機械維修）。\n- 最多 4 項；設定不足時可少於 4 項甚至空陣列。\n\n只輸出 JSON：{"proficiencies":["...","..."]}`;
                const rawText = await requestAIText(prompt, { kind: 'dice', maxTokens: 220 });
                let parsed;
                try { parsed = JSON.parse(extractJsonText(rawText)); } catch (e) { parsed = null; }
                const list = parsed && Array.isArray(parsed.proficiencies) ? parsed.proficiencies : null;
                if (!list) {
                    alert((typeof uiText === 'function') ? uiText('AI 無法生成擅長領域，請稍後再試。') : 'AI 無法生成擅長領域，請稍後再試。');
                    return;
                }
                setEditingProficiencies(list.map(v => valueToText(v).trim().slice(0, 16)), inGame);
            } catch (err) {
                alert((typeof uiText === 'function') ? uiText('AI 無法生成擅長領域，請稍後再試。') : 'AI 無法生成擅長領域，請稍後再試。');
            } finally {
                buttons.forEach(b => { b.disabled = false; });
                if (btn) btn.textContent = restoreLabel;
            }
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
                    scen.objective = document.getElementById(`scen-objective-${index}`).value;
                    scen.transitionRule = document.getElementById(`scen-transition-${index}`).value;
}
});
}

// === [app.js 拆分] app-status-journal.js：原 app.js 第 4153–4981 行｜狀態面板/Flags/道具/冒險日誌頁｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
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
            const rlSel = document.getElementById('reply-length-select'); if (rlSel && typeof getReplyLengthPref === 'function') rlSel.value = getReplyLengthPref();
            if (typeof refreshMatureToggle === 'function') refreshMatureToggle();
            
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
                        <div class="scenario-label">本場目標（選填，DM 會朝此推進）</div>
<textarea id="edit-scen-objective-${idx}" class="scenario-input" placeholder="${escapeStatusHtml(uiText('例如：讓玩家在天黑前找到出口。'))}" oninput="autoResize(this)">${escapeStatusHtml(sc.objective || '')}</textarea>
                        <div class="scenario-label">轉場規則（選填）</div>
<textarea id="edit-scen-transition-${idx}" class="scenario-input" placeholder="${escapeStatusHtml(uiText('例如：切回此情境時視為夢醒。'))}" oninput="autoResize(this)">${escapeStatusHtml(sc.transitionRule || '')}</textarea>
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
let presetSyncedBeforeSave = false;
const preSaveSourceId = currentScenario.sourcePresetId || currentScenario.id;
if (preSaveSourceId && scenarioPresets[preSaveSourceId] && !scenarioPresets[preSaveSourceId].isLocked) {
presetSyncedBeforeSave = syncBoundPresetFromCurrentScenario();
}
if (!saveCurrentProgress()) return; // 存檔未成功時禁止繼續覆寫大廳配置
                
                // 雙向同步：覆寫回大廳的原始配置檔
                let sourceId = currentScenario.sourcePresetId || currentScenario.id;
                if (sourceId && scenarioPresets[sourceId]) {
if (scenarioPresets[sourceId].isLocked) {
alert(`【系統提醒】\n因為大廳的配置 [${scenarioPresets[sourceId].presetName}] 已上鎖 (🔒)，\n本次變更僅儲存於「當前遊戲紀錄」中，不會覆蓋回大廳。\n(若要備份目前設定，請使用另存配置；若要覆蓋回大廳，請先至大廳解鎖)`);
} else if (!presetSyncedBeforeSave) {
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
            return `${selectedFlags.map(flag => `${flag}`).join('\n')}${omitted ? `\n（另有 ${omitted} 個較舊 Flags 完整保留於角色面板；重要歷史應以摘要為準。）` : ''}`;
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
                    if (toggleButton) {
                        toggleButton.textContent = '收起完整冒險日誌';
                        toggleButton.classList.add('is-open');
                    }
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
                if (toggleButton) {
                    toggleButton.textContent = '開啟完整冒險日誌';
                    toggleButton.classList.remove('is-open');
                }
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
 option.textContent = uiText('目前沒有存檔');
                select.appendChild(option);
                select.disabled = true;
                return;
            }
            select.disabled = false;
            keys.forEach(id => {
                const save = savesData[id];
                const option = document.createElement('option');
                option.value = id;
 option.textContent = `${valueToText(save.title, uiText('未命名紀錄'))} · ${valueToText(save.date, uiText('未知時間'))}`;
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
 const pagination = pageLabel?.closest('.journal-pagination');
 if (!list || !meta || !pageLabel) return;
 const save = savesData[journalSelectedSaveId];
 if (!save) {
 list.innerHTML = `<p class="journal-empty">${escapeStatusHtml(uiText('目前沒有可查看的冒險紀錄。'))}</p>`;
 meta.textContent = uiText('請先建立遊戲存檔。');
 pageLabel.textContent = uiText('第 0 / 0 頁');
 if (prevButton) prevButton.disabled = true;
 if (nextButton) nextButton.disabled = true;
 if (organizeButton) organizeButton.disabled = true;
 if (pagination) {
 pagination.hidden = true;
 pagination.style.display = 'none';
 }
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
 if (pagination) {
 const showPagination = pageCount > 1;
 pagination.hidden = !showPagination;
 pagination.style.display = showPagination ? 'grid' : 'none';
 }
 if (prevButton) prevButton.disabled = journalPageIndex <= 0;
 if (nextButton) nextButton.disabled = journalPageIndex >= pageCount - 1;
            if (!visibleEntries.length) {
                list.innerHTML = `<p class="journal-empty">${escapeStatusHtml(uiText('沒有符合搜尋條件的紀錄。'))}</p>`;
                return;
            }
list.innerHTML = visibleEntries.map(entry => `
<article class="journal-entry${entry.important ? ' journal-entry-important' : ''}">
<span class="journal-entry-index">#${entry.index + 1}</span>
<textarea class="journal-entry-text journal-entry-inline-input" rows="1" aria-label="${escapeStatusHtml(uiText('冒險紀錄內容'))}" oninput="autoResize(this)" onblur="saveJournalEntryInlineEdit(${entry.index}, this.value)">${escapeStatusHtml(uiJournalEntryText(entry.text))}</textarea>
<button class="journal-entry-star" type="button" aria-label="${entry.important ? escapeStatusHtml(uiText('取消重要標記')) : escapeStatusHtml(uiText('標記為重要'))}" title="${entry.important ? escapeStatusHtml(uiText('取消重要標記')) : escapeStatusHtml(uiText('標記為重要'))}" onclick="toggleJournalEntryImportant(${entry.index})">${entry.important ? '★' : '☆'}</button>
<button class="journal-entry-delete" type="button" aria-label="${escapeStatusHtml(uiText('刪除此筆'))}" title="${escapeStatusHtml(uiText('刪除此筆'))}" onclick="deleteJournalEntryInline(${entry.index})">－</button>
</article>`).join('');
list.querySelectorAll('.journal-entry-inline-input').forEach(autoResize);
}

function saveJournalEntryInlineEdit(entryIndex, value) {
const save = savesData[journalSelectedSaveId];
const index = Number(entryIndex);
if (!save || !Number.isInteger(index)) return;
const entries = getAdventureJournalEntries().map(entry => entry.text);
if (index < 0 || index >= entries.length) return;
const text = valueToText(value).replace(/\s*\n+\s*/g, ' ').trim();
if (!text || text === entries[index]) {
renderAdventureJournal();
return;
}
entries[index] = stripMemoryListPrefix(text);
save.log = formatBulletListText(entries, '• 故事剛開始，目前尚無重大事件發生。');
save.date = new Date().toLocaleString();
if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
persistSingleSave(journalSelectedSaveId, '冒險日誌');
renderAdventureJournal();
}

function deleteJournalEntryInline(entryIndex) {
const save = savesData[journalSelectedSaveId];
const index = Number(entryIndex);
if (!save || !Number.isInteger(index)) return;
const entries = getAdventureJournalEntries().map(entry => entry.text);
if (index < 0 || index >= entries.length) return;
if (!confirm(uiText('確定要刪除這筆冒險紀錄嗎？'))) return;
entries.splice(index, 1);
if (Array.isArray(save.importantJournalEntries)) {
save.importantJournalEntries = save.importantJournalEntries
.map(Number)
.filter(item => Number.isInteger(item) && item !== index)
.map(item => item > index ? item - 1 : item);
}
save.log = formatBulletListText(entries, '• 故事剛開始，目前尚無重大事件發生。');
save.date = new Date().toLocaleString();
if (journalSelectedSaveId === currentSaveId) currentAdventureLog = save.log;
persistSingleSave(journalSelectedSaveId, '冒險日誌');
renderAdventureJournal();
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

 function isProtectedAdventureLogEntry(line) {
 const text = stripMemoryListPrefix(line);
 return /^(?:【\s*)?任務(?:完成|失敗)(?:\s*】)?[：:]?/.test(text)
 || /^(?:🏆|(?:【\s*)?(?:成就|成就解鎖|成就達成)(?:\s*】)?[：:]?)/.test(text)
 || /^\[(?:成就|Achievement|ACHIEVEMENT|狀態\/成就)\]/.test(text);
 }

 function restoreProtectedAdventureLogEntries(originalLog, organizedLog) {
 const protectedEntries = splitAdventureLog(originalLog).filter(isProtectedAdventureLogEntry);
 if (!protectedEntries.length) return organizedLog;
 const mergedEntries = splitAdventureLog(organizedLog);
 const seen = new Set(mergedEntries.map(normalizeAdventureLogKey).filter(Boolean));
 protectedEntries.forEach(entry => {
 const key = normalizeAdventureLogKey(entry);
 if (!key || seen.has(key)) return;
 seen.add(key);
 mergedEntries.push(entry);
 });
 return formatBulletListText(mergedEntries, '• 故事剛開始，目前尚無重大事件發生。');
 }

 function buildSelectedJournalOrganizerPrompt(save, logChunk = '', partIndex = 0, partCount = 1) {
 const scenario = save?.scenario || {};
 const memory = save?.memoryBrief || {};
 return `你是 TRPG 冒險紀錄整理器。整理第 ${partIndex + 1}/${partCount} 段紀錄：合併本段語意重複內容，保持原順序，保留重要事實、任務結果、角色關係轉折、場景變化與重要物品異動。不得捏造或預設劇情。
保護規則：凡是「任務完成：」「任務失敗：」「【成就】」「成就：」「🏆」或「[成就]」開頭的紀錄，必須原文保留；不得刪除、不得改寫成摘要、不得把完成或失敗任務改回未完成。
只輸出 JSON：{"adventure_log":["精簡事件"]}。\n玩家：${valueToText(scenario.playerName, '玩家')}\n相關角色：${(scenario.npcs || []).map(npc => npc.name).filter(Boolean).slice(0, 20).join('、') || '無'}\n既有摘要：${truncatePromptText(memory.story, 1200) || '無'}\n任務：${truncatePromptText(memory.tasks, 900) || '無'}\n關係：${truncatePromptText(memory.relationships, 900) || '無'}\n\n本段紀錄：\n${logChunk}`;
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
 if (!confirm(uiText('整理會合併語意重複的事件。系統會先保留備份，確定要繼續嗎？'))) return;
            const button = document.getElementById('journal-organize-btn');
            const originalLabel = button?.innerText || '';
 if (button) { button.disabled = true; button.innerText = uiText('整理中…'); }
            try {
                const organizedLog = await organizeAdventureLogWithAI(save, (current, total) => {
 if (button) {
 button.innerText = total > 1
 ? uiText('整理中 {current}/{total}').replace('{current}', current).replace('{total}', total)
 : uiText('整理中…');
 }
                });
 if (!organizedLog) throw new Error(uiText('AI 沒有回傳可用的冒險紀錄。'));
 const finalLog = restoreProtectedAdventureLogEntries(save.log, organizedLog);
 if (!Array.isArray(save.memoryLogBackups)) save.memoryLogBackups = [];
 save.memoryLogBackups.push({ date: new Date().toLocaleString(), log: save.log });
 save.memoryLogBackups = save.memoryLogBackups.slice(-3);
 save.log = finalLog;
 save.date = new Date().toLocaleString();
 if (journalSelectedSaveId === currentSaveId) currentAdventureLog = finalLog;
                persistSingleSave(journalSelectedSaveId, '整理冒險日誌');
                journalPageIndex = 0;
                renderAdventureJournalSaveSelector();
                renderAdventureJournal();
 alert(uiText('冒險紀錄已整理完成；如不滿意可按「復原上次整理」。'));
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


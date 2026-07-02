// === [app.js 拆分] app-scenario-state.js：原 app.js 第 2073–2690 行｜persistJson/情境快照/動態狀態/NPC 死亡與好感/狀態摘要｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
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

        // 每條情境/支線各自的「當下現場快照」：目前地點、時間、在場角色名單。
        // 這是 runtime 狀態（不進配置模板），只在存檔內依情境保存，用來避免 AI 過幾回合就忘了時間/空間/在場 NPC。
        function normalizeRuntimeSituation(value) {
            const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            const rawPresent = Array.isArray(source.present)
                ? source.present
                : valueToText(source.present).split(/[、,，\n]+/);
            const present = [];
            rawPresent.forEach(entry => {
                const name = truncatePromptText(valueToText(entry).replace(/^\s*[-•*]\s*/, ''), 40);
                if (name && !present.includes(name)) present.push(name);
            });
            return {
                location: truncatePromptText(valueToText(source.location), 120),
                time: truncatePromptText(valueToText(source.time), 80),
                present: present.slice(0, 12),
                updatedAt: valueToText(source.updatedAt)
            };
        }

        function runtimeSituationHasContent(situation) {
            const s = normalizeRuntimeSituation(situation);
            return Boolean(s.location || s.time || s.present.length);
        }

function createPresetSnapshotFromScenario(sourceScenario, baselinePreset = null) {
const snapshot = clonePersistentValue(sourceScenario || defaultPreset);
delete snapshot.playerDynamic;
delete snapshot.sourcePresetId;
if (!Array.isArray(snapshot.npcs)) snapshot.npcs = [];
if (Array.isArray(snapshot.scenarios)) {
snapshot.scenarios.forEach(scene => { delete scene.runtimePlayerPresence; delete scene.runtimeGuideRole; delete scene.runtimeSituation; });
}
snapshot.npcs = snapshot.npcs.map(npc => {
const cleanNpc = clonePersistentValue(npc);
delete cleanNpc.dynamic;
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

function findMatchingRuntimeNpc(existingNpcs, nextNpc, index) {
if (!Array.isArray(existingNpcs)) return null;
const nextId = valueToText(nextNpc?.id);
const nextName = valueToText(nextNpc?.name);
return existingNpcs.find(item =>
(nextId && valueToText(item?.id) === nextId)
|| (nextName && valueToText(item?.name) === nextName)
) || existingNpcs[index] || null;
}

function resolvePresetIdForScenario(scenario) {
if (!scenario || typeof scenario !== 'object') return '';
const directId = valueToText(scenario.sourcePresetId || scenario.id);
if (directId && scenarioPresets[directId]) return directId;
const presetName = valueToText(scenario.presetName);
if (!presetName) return directId;
return Object.keys(scenarioPresets).find(id => valueToText(scenarioPresets[id]?.presetName) === presetName) || directId;
}

function mergePresetIntoBoundSaveScenario(saveScenario, presetId, preset) {
const previousScenario = saveScenario && typeof saveScenario === 'object' ? saveScenario : {};
const nextScenario = createFreshScenarioFromPreset(preset);
nextScenario.sourcePresetId = presetId;
nextScenario.id = presetId;
nextScenario.presetName = preset.presetName || nextScenario.presetName;
nextScenario.playerDynamic = previousScenario.playerDynamic
? clonePersistentValue(previousScenario.playerDynamic)
: createEmptyDynamicState();
nextScenario.memoryNotesPaused = previousScenario.memoryNotesPaused === true;

const previousNpcs = Array.isArray(previousScenario.npcs) ? previousScenario.npcs : [];
if (!Array.isArray(nextScenario.npcs)) nextScenario.npcs = [];
nextScenario.npcs.forEach((npc, index) => {
const previousNpc = findMatchingRuntimeNpc(previousNpcs, npc, index);
npc.dynamic = previousNpc?.dynamic
? clonePersistentValue(previousNpc.dynamic)
: createEmptyDynamicState();
});

const previousScenarios = Array.isArray(previousScenario.scenarios) ? previousScenario.scenarios : [];
if (Array.isArray(nextScenario.scenarios)) {
nextScenario.scenarios.forEach((scene, index) => {
const previousScene = previousScenarios.find(item =>
valueToText(item?.name) && valueToText(item.name) === valueToText(scene?.name)
) || previousScenarios[index];
if (!previousScene) return;
if (previousScene.runtimePlayerPresence !== undefined) scene.runtimePlayerPresence = previousScene.runtimePlayerPresence;
if (previousScene.runtimeGuideRole !== undefined) scene.runtimeGuideRole = previousScene.runtimeGuideRole;
if (previousScene.runtimeSituation !== undefined) scene.runtimeSituation = previousScene.runtimeSituation;
});
}

return nextScenario;
}

function getCanonicalScenarioForSave(scenario) {
if (!scenario || typeof scenario !== 'object') return scenario;
const presetId = resolvePresetIdForScenario(scenario);
const preset = presetId ? scenarioPresets[presetId] : null;
return preset ? mergePresetIntoBoundSaveScenario(scenario, presetId, preset) : scenario;
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

        // === 關係里程碑保底旗標（好感滿值 / 好感觸底 / NPC 死亡；程式硬保證，不靠 AI 自覺）===
        const AFFECTION_MAX_MILESTONE = 100;
        const AFFECTION_MIN_MILESTONE = -30;
        let pendingRelationshipMilestones = [];

        function queueRelationshipMilestone(npcName, kind) {
            const name = valueToText(npcName);
            if (!name) return;
            if (pendingRelationshipMilestones.some(m => m.npcName === name && m.kind === kind)) return;
            pendingRelationshipMilestones.push({ npcName: name, kind });
        }

        function buildMilestoneFlagText(npcName, kind) {
            if (kind === 'maxAffection') return `與 ${npcName} 締結至深羈絆`;
            if (kind === 'minAffection') return `與 ${npcName} 結下難解深仇`;
            if (kind === 'death') return `${npcName} 已殞命`;
            return '';
        }

        function addGuaranteedFlag(flagText) {
            const cleanFlag = normalizeFlagText(flagText);
            if (!cleanFlag || currentFlags.includes(cleanFlag)) return false;
            if (currentFlags.length >= MAX_STORED_FLAGS) {
                createSystemNote(`Flags 已達 ${MAX_STORED_FLAGS} 個上限；重要標記「${cleanFlag}」未加入，請至角色面板整理。`);
                return false;
            }
            currentFlags.push(cleanFlag);
            createSystemNote(`新增狀態 [ ${cleanFlag} ]`);
            return true;
        }

        // aiFlagsThisTurn：本回合 AI 回傳的 flags_add。好感里程碑若 AI 已給含該角色名的標籤，
        // 交給 AI 的關係措辭，程式不再補；死亡一律程式保底。
        function flushRelationshipMilestoneFlags(aiFlagsThisTurn = []) {
            if (!pendingRelationshipMilestones.length) return;
            const aiFlags = Array.isArray(aiFlagsThisTurn)
                ? aiFlagsThisTurn.map(flag => normalizeFlagText(flag)).filter(Boolean)
                : [];
            const pending = pendingRelationshipMilestones;
            pendingRelationshipMilestones = [];
            pending.forEach(({ npcName, kind }) => {
                if ((kind === 'maxAffection' || kind === 'minAffection')
                    && npcName && aiFlags.some(flag => flag.includes(npcName))) return;
                addGuaranteedFlag(buildMilestoneFlagText(npcName, kind));
            });
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
            if (previous < AFFECTION_MAX_MILESTONE && next >= AFFECTION_MAX_MILESTONE) queueRelationshipMilestone(npc.name, 'maxAffection');
            if (previous > AFFECTION_MIN_MILESTONE && next <= AFFECTION_MIN_MILESTONE) queueRelationshipMilestone(npc.name, 'minAffection');
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
                queueRelationshipMilestone(npc.name, 'death');
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
            const providerText = getApiProviderLabel();
            const modelRows = Object.values(apiUsageStats.models || {})
                .sort((a, b) => (b.requests || 0) - (a.requests || 0))
                .slice(0, 8)
                .map(entry => {
                    const provider = entry.provider === 'openrouter' ? 'OpenRouter' : (entry.provider === 'google' ? 'Google' : (entry.provider === 'anthropic' ? 'Anthropic' : valueToText(entry.provider, '未知')));
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


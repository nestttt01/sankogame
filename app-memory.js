// === [app.js 拆分] app-memory.js：原 app.js 第 1571–2072 行｜語言指令/API 用量統計/uiText/冒險日誌與記憶與任務清單輔助｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
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


// === [app.js 拆分] app-ai.js：原 app.js 第 6906–7661 行｜AI 請求/JSON 解析修復/語言修復/記憶整理/prompt 組裝/callAI_JSON(危險區)｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
        function getApiProviderLabel() {
            if (apiProvider === 'openrouter') return 'OpenRouter';
            if (apiProvider === 'anthropic') return 'Anthropic (Claude)';
            return 'Google Gemini';
        }

        // 走 i18n 字典翻譯人看的句子；{provider} 以參數帶入；window.uiMessage 不在時退回中文並自行替換。
        function translateErrorText(zh, params = {}) {
            if (window.uiMessage) return window.uiMessage(zh, params);
            let value = zh;
            Object.entries(params).forEach(([key, replacement]) => { value = value.split(`{${key}}`).join(replacement); });
            return value;
        }

        // 在友善訊息後附上「供應商｜HTTP 狀態｜原始原因」診斷尾巴；金鑰一律遮罩，不外洩。
        function buildApiErrorDiagnostic(status = 0, rawMessage = '') {
            const parts = [getApiProviderLabel()];
            if (status) parts.push(`HTTP ${status}`);
            const raw = valueToText(rawMessage)
                .replace(/\s+/g, ' ')
                .replace(/key=[\w.\-]+/gi, 'key=***')
                .replace(/AIza[\w\-]{20,}/g, '***')
                .replace(/sk-[\w\-]{10,}/gi, '***')
                .trim();
            if (raw) parts.push(truncatePromptText(raw, 140));
            return `\n（${translateErrorText('診斷')}：${parts.join('｜')}）`;
        }

        function getFriendlyApiErrorMessage(status = 0, rawMessage = '') {
            const provider = getApiProviderLabel();
            const message = valueToText(rawMessage).toLowerCase();
            const withTech = (zh, params = {}) => `${translateErrorText(zh, params)}${buildApiErrorDiagnostic(status, rawMessage)}`;
            if (status === 401 || status === 403 || /api.?key|unauthori[sz]ed|authentication|permission/.test(message)) {
                return withTech('{provider} 金鑰無效或沒有使用權限，請回首頁重新貼上並驗證金鑰。', { provider });
            }
            if (status === 402 || /more credits|insufficient credits|can only afford|fewer max.?tokens|payment required|credit balance|negative balance/.test(message)) {
                return apiProvider === 'openrouter'
                    ? withTech('OpenRouter 餘額不足（可能是 $0 或負值）。請到 openrouter.ai 的 Credits 頁儲值，或改用 Google Gemini。')
                    : withTech('{provider} 因額度或付款問題拒絕了這次請求，請確認帳戶狀態或改用其他供應商。', { provider });
            }
            if (status === 429 || /quota|rate.?limit|resource.?exhausted|too many requests/.test(message)) {
                return withTech('{provider} 請求太頻繁或額度已達上限，請稍候再試或改用其他模型。', { provider });
            }
            if (/context length|maximum context|prompt.{0,12}too long|too many tokens|token limit|input tokens/.test(message)) {
                return withTech('送給 AI 的背景資料太長，請先用狀態面板的「整理摘要／整理紀錄」壓縮後再試。');
            }
            if (/json|response.?format|invalid schema/.test(message)) {
                return withTech('AI 回覆格式異常，本次內容沒有套用，請重新發送一次。');
            }
            if (/safety|blocked|content filter|安全|阻擋/.test(message)) {
                return withTech('{provider} 因內容安全限制沒有回覆，請調整本回合的文字後再試。', { provider });
            }
            if (/no candidates|candidate|empty content|no response|空白|沒有回傳/.test(message)) {
                return withTech('{provider} 這次沒有回傳內容（常見於安全機制或模型暫時不穩），通常再送一次就會好。', { provider });
            }
            if (status === 404 || /not found|no such model|unknown model|model.{0,12}(not|unavailable)/.test(message)) {
                return withTech('找不到或無法使用所選模型，請回首頁重新選擇模型（{provider}）。', { provider });
            }
            if (status === 408 || /timeout|timed out/.test(message)) {
                return withTech('AI 回覆逾時，請稍後再試；網路較慢時可改用較快的模型。');
            }
            if (status >= 500 || /server error|service unavailable|overloaded|bad gateway/.test(message)) {
                return withTech('{provider} 服務暫時忙碌或過載，請稍後再試。', { provider });
            }
            if (/network|failed to fetch|connection|offline|load failed/.test(message)) {
                return withTech('連線失敗，請確認網路後再試（手機切換 Wi-Fi／行動網路時容易中斷）。');
            }
            return withTech('AI 暫時無法完成這次回覆；請看下方診斷資訊判斷原因，或稍後再試。');
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
            if (!apiKey) throw new Error(`${getApiProviderLabel()} API Key 未載入，請回到首頁重新驗證金鑰。`);
            if (!selectedModel) throw new Error("尚未選擇模型，請回到首頁重新選擇模型。");
            const temperature = kind === 'generation' ? 0.9 : (kind === 'normal' ? 0.7 : (kind === 'journal' || kind === 'summary' ? 0.25 : 0.1));
            // 抑制重複：只對劇情對話與創作生成加溫和懲罰；整理日誌/摘要/JSON 修復要忠實，不加（也避免懲罰到 JSON 結構）。
            const repetitionSensitiveKind = (kind === 'normal' || kind === 'generation');
            const frequencyPenalty = repetitionSensitiveKind ? 0.3 : 0;
            const presencePenalty = repetitionSensitiveKind ? 0.5 : 0;
            if (apiProvider === 'openrouter') {
                return {
                    url: 'https://openrouter.ai/api/v1/chat/completions',
                    options: {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'X-Title': 'TRPG JourneyNotes'
                        },
                        body: JSON.stringify({
                            model: selectedModel,
                            messages: [{ role: 'user', content: fullPrompt }],
                            response_format: { type: 'json_object' },
                            temperature,
                            frequency_penalty: frequencyPenalty,
                            presence_penalty: presencePenalty,
                            max_tokens: maxTokens
                        })
                    }
                };
            }

            if (apiProvider === 'anthropic') {
                return {
                    url: 'https://api.anthropic.com/v1/messages',
                    options: {
                        method: 'POST',
                        headers: {
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                            'anthropic-dangerous-direct-browser-access': 'true',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            // 新一代 Claude（Opus 4.7/4.8）已停用 temperature，送出即回 400；一律不帶，改用模型預設取樣。
                            model: selectedModel,
                            max_tokens: maxTokens,
                            messages: [{ role: 'user', content: fullPrompt }]
                        })
                    }
                };
            }

            const matureOn = (typeof getMatureModePref === "function") && getMatureModePref();
            const sexualThreshold = matureOn ? "BLOCK_NONE" : "BLOCK_ONLY_HIGH";
            const safetySettings = [{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }, { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" }, { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: sexualThreshold }, { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }];
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
            if (apiProvider === 'anthropic') {
                return Array.isArray(data.content)
                    ? data.content.filter(part => part && part.type === 'text').map(part => part.text || '').join('')
                    : "";
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
                        : apiProvider === 'anthropic'
                            ? valueToText(data.stop_reason).toLowerCase()
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
 if (!organizedLog) throw new Error(uiText('AI 沒有回傳可用的冒險紀錄。'));
 const finalLog = restoreProtectedAdventureLogEntries(currentAdventureLog, organizedLog);
 if (!Array.isArray(save.memoryLogBackups)) save.memoryLogBackups = [];
 save.memoryLogBackups.push({ date: new Date().toLocaleString(), log: currentAdventureLog });
 save.memoryLogBackups = save.memoryLogBackups.slice(-3);
 currentAdventureLog = finalLog;
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
4. 不得對玩家角色扣 HP、SAN 或好感度；若輸入中附有「系統硬判定」，只能把它作為 NPC／旁白支線的成功、失敗或代價依據，不得套用到玩家 HP/SAN。
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
                const itemJournalEvents = [];
                let sceneJournalEvent = '';
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

                // 更新「現在狀況」現場快照（地點／時間／在場角色）。環境變動在任何模式都可能發生，故不受 playerEffectsAllowed 限制。
                const sceneStatePayload = (changes.scene_state && typeof changes.scene_state === 'object' && !Array.isArray(changes.scene_state))
                    ? changes.scene_state
                    : ((parsedData.scene_state && typeof parsedData.scene_state === 'object' && !Array.isArray(parsedData.scene_state)) ? parsedData.scene_state : null);
                if (sceneStatePayload) {
                    const activeScene = currentScenario.scenarios?.[currentScenarioIndex];
                    if (activeScene && typeof activeScene === 'object') {
                        const prevSituation = normalizeRuntimeSituation(activeScene.runtimeSituation);
                        const incomingSituation = normalizeRuntimeSituation(sceneStatePayload);
                        const mergedSituation = {
                            location: incomingSituation.location || prevSituation.location,
                            time: incomingSituation.time || prevSituation.time,
                            present: incomingSituation.present.length ? incomingSituation.present : prevSituation.present,
                            updatedAt: new Date().toISOString()
                        };
                        if (runtimeSituationHasContent(mergedSituation)) activeScene.runtimeSituation = mergedSituation;
                        if (mergedSituation.location && mergedSituation.location !== prevSituation.location) sceneJournalEvent = `來到 ${truncatePromptText(mergedSituation.location, 60)}`;
                    }
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
                            itemJournalEvents.push(`獲得 ${itemText}`);
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
                            itemJournalEvents.push(`失去 ${removedName}`); 
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
                // 關係里程碑保底旗標：好感滿值 / 好感觸底 / NPC 死亡由程式硬保證。
                // 好感里程碑若 AI 本回合已回傳含角色名的標籤，優先採用 AI 措辭，程式不重複補。
                flushRelationshipMilestoneFlags(Array.isArray(addedFlags) ? addedFlags : []);

                // 冒險日誌安全網：AI 未回傳 memory.event（無聲漏記或截斷）時，
                // 把本回合具體發生的大事（物品得失、場景移動）補進冒險日誌，避免大事遺失。
                if (!(memoryEvent && memoryCategory === 'item')) {
                    itemJournalEvents.forEach(ev => { currentAdventureLog = mergeAdventureLog(currentAdventureLog, ev); });
                }
                if (!memoryEvent && sceneJournalEvent) {
                    currentAdventureLog = mergeAdventureLog(currentAdventureLog, sceneJournalEvent);
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

// === [app.js 拆分] app-storage.js：原 app.js 第 445–913 行｜IndexedDB 與 localStorage 持久化層、window.onload 載入流程｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
        function getSaveStorageKey(saveId) {
            return `${SAVE_ITEM_PREFIX}${String(saveId)}`;
        }

        function isIndexedStorageKey(key) {
            return INDEXED_DATA_KEYS.has(key) || String(key).startsWith(SAVE_ITEM_PREFIX);
        }

        function clonePersistentValue(value) {
            if (typeof structuredClone === 'function') return structuredClone(value);
            return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
        }

        function openGameDatabase() {
            if (gameDatabasePromise) return gameDatabasePromise;
            const openingPromise = new Promise((resolve, reject) => {
                if (!window.indexedDB) { reject(new Error('此瀏覽器不支援 IndexedDB')); return; }
                const request = indexedDB.open(GAME_DB_NAME, GAME_DB_VERSION);
                request.onupgradeneeded = () => {
                    const database = request.result;
                    if (!database.objectStoreNames.contains(GAME_DB_STORE)) database.createObjectStore(GAME_DB_STORE);
                };
                request.onsuccess = () => {
                    const database = request.result;
                    gameDatabaseConnection = database;
                    database.onversionchange = () => {
                        if (gameDatabaseConnection === database) {
                            gameDatabaseConnection = null;
                            gameDatabasePromise = null;
                        }
                        database.close();
                    };
                    database.onclose = () => {
                        if (gameDatabaseConnection !== database) return;
                        gameDatabaseConnection = null;
                        gameDatabasePromise = null;
                    };
                    resolve(database);
                };
                request.onerror = () => reject(request.error || new Error('IndexedDB 開啟失敗'));
                request.onblocked = () => reject(new Error('IndexedDB 被其他分頁阻擋'));
            });
            gameDatabasePromise = openingPromise.catch(error => {
                gameDatabasePromise = null;
                throw error;
            });
            return gameDatabasePromise;
        }

        function invalidateGameDatabaseConnection() {
            const database = gameDatabaseConnection;
            gameDatabaseConnection = null;
            gameDatabasePromise = null;
            try { database?.close(); } catch (error) { /* 下一次寫入會重新開啟 */ }
        }

        async function readIndexedValue(key) {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readonly');
                const request = transaction.objectStore(GAME_DB_STORE).get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || new Error('IndexedDB 讀取失敗'));
            });
        }

        async function writeIndexedValue(key, value) {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readwrite');
                transaction.objectStore(GAME_DB_STORE).put(value, key);
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 寫入失敗'));
                transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 寫入已中止'));
            });
        }

        async function deleteIndexedValue(key) {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readwrite');
                transaction.objectStore(GAME_DB_STORE).delete(key);
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 刪除失敗'));
                transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 刪除已中止'));
            });
        }

        async function listIndexedKeys(prefix = '') {
            const database = await openGameDatabase();
            return new Promise((resolve, reject) => {
                const transaction = database.transaction(GAME_DB_STORE, 'readonly');
                const request = transaction.objectStore(GAME_DB_STORE).getAllKeys();
                request.onsuccess = () => resolve((request.result || []).map(String).filter(key => !prefix || key.startsWith(prefix)));
                request.onerror = () => reject(request.error || new Error('IndexedDB 索引讀取失敗'));
            });
        }

        async function clearIndexedGameData() {
            try {
                const database = await openGameDatabase();
                await new Promise((resolve, reject) => {
                    const transaction = database.transaction(GAME_DB_STORE, 'readwrite');
                    transaction.objectStore(GAME_DB_STORE).clear();
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 清除失敗'));
                    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 清除已中止'));
                });
            } catch (error) {
                console.warn('IndexedDB 清除失敗，將繼續清除舊資料。', error);
            }
        }

        function handleIndexedWriteError(label, error) {
            console.error(`${label}儲存失敗`, error);
            if (!storageWarningShown) {
                storageWarningShown = true;
                alert(`${label}無法寫入瀏覽器資料庫。請先匯出備份，並確認瀏覽器沒有封鎖本機儲存。`);
            }
        }

        function isTemporaryIndexedWriteError(error) {
            const errorName = String(error?.name || '');
            const errorMessage = String(error?.message || '');
            return ['AbortError', 'InvalidStateError', 'TransactionInactiveError', 'UnknownError', 'NotReadableError'].includes(errorName)
                || /abort|inactive|background|closing|closed|transaction/i.test(`${errorName} ${errorMessage}`);
        }

        function scheduleIndexedWriteRetry(delay = 500) {
            if (indexedRetryTimer) clearTimeout(indexedRetryTimer);
            if (document.visibilityState === 'hidden' || !pendingIndexedWrites.size) return;
            indexedRetryTimer = setTimeout(() => {
                indexedRetryTimer = null;
                retryPendingIndexedWrites();
            }, delay);
        }

        async function flushPendingIndexedWrite(key) {
            const pendingWrite = pendingIndexedWrites.get(key);
            if (!pendingWrite) return true;
            try {
                if (pendingWrite.operation === 'delete') await deleteIndexedValue(key);
                else await writeIndexedValue(key, pendingWrite.snapshot);
                if (pendingIndexedWrites.get(key) === pendingWrite) pendingIndexedWrites.delete(key);
                storageWarningShown = false;
                return true;
            } catch (error) {
                invalidateGameDatabaseConnection();
                if (pendingIndexedWrites.get(key) !== pendingWrite) return false;
                if (document.visibilityState === 'hidden') {
                    console.warn(`${pendingWrite.label}背景儲存暫停，回到頁面後會自動重試。`, error);
                    return false;
                }
                pendingWrite.attempts += 1;
                if (pendingWrite.attempts < 2 && isTemporaryIndexedWriteError(error)) {
                    scheduleIndexedWriteRetry();
                    return false;
                }
                pendingIndexedWrites.delete(key);
                handleIndexedWriteError(pendingWrite.label, error);
                return false;
            }
        }

        function retryPendingIndexedWrites() {
            if (document.visibilityState === 'hidden' || !pendingIndexedWrites.size) return;
            for (const key of pendingIndexedWrites.keys()) {
                indexedWriteQueue = indexedWriteQueue.then(() => flushPendingIndexedWrite(key));
            }
        }

        function queueIndexedWrite(key, value, label = '資料') {
            pendingIndexedWrites.set(key, {
                operation: 'put',
                snapshot: clonePersistentValue(value),
                label,
                attempts: 0
            });
            indexedWriteQueue = indexedWriteQueue.then(() => flushPendingIndexedWrite(key));
            return true;
        }

        function queueIndexedDelete(key, label = '資料') {
            pendingIndexedWrites.set(key, {
                operation: 'delete',
                snapshot: undefined,
                label,
                attempts: 0
            });
            indexedWriteQueue = indexedWriteQueue.then(() => flushPendingIndexedWrite(key));
            return true;
        }

        function buildSaveIndexPayload() {
            return {
                version: 1,
                ids: Array.from(storedSaveIds),
                deleted: Array.from(deletedSaveIds)
            };
        }

        async function loadSaveCollection() {
            if (!indexedDatabaseReady) {
                const legacySaves = await readPersistentValue('sanko_saves_v8', {});
                const fallback = legacySaves && typeof legacySaves === 'object' && !Array.isArray(legacySaves) ? legacySaves : {};
                storedSaveIds = new Set(Object.keys(fallback));
                return fallback;
            }

            const indexValue = await readIndexedValue(SAVE_INDEX_KEY);
            const indexedIds = Array.isArray(indexValue)
                ? indexValue.map(String)
                : Array.isArray(indexValue?.ids) ? indexValue.ids.map(String) : [];
            deletedSaveIds = new Set(Array.isArray(indexValue?.deleted) ? indexValue.deleted.map(String) : []);

            const itemKeys = await listIndexedKeys(SAVE_ITEM_PREFIX);
            const scannedIds = itemKeys.map(key => key.slice(SAVE_ITEM_PREFIX.length)).filter(Boolean);
            const candidateIds = new Set(indexedIds);
            scannedIds.forEach(id => { if (!deletedSaveIds.has(id)) candidateIds.add(id); });

            const legacyValue = await readIndexedValue('sanko_saves_v8');
            const legacySaves = legacyValue && typeof legacyValue === 'object' && !Array.isArray(legacyValue) ? legacyValue : {};
            Object.keys(legacySaves).forEach(id => { if (!deletedSaveIds.has(id)) candidateIds.add(id); });

            const loadedSaves = {};
            for (const id of candidateIds) {
                let save = await readIndexedValue(getSaveStorageKey(id));
                if ((!save || typeof save !== 'object' || Array.isArray(save)) && legacySaves[id]) {
                    save = legacySaves[id];
                    await writeIndexedValue(getSaveStorageKey(id), save);
                }
                if (save && typeof save === 'object' && !Array.isArray(save)) loadedSaves[id] = save;
            }

            storedSaveIds = new Set(Object.keys(loadedSaves));
            await writeIndexedValue(SAVE_INDEX_KEY, buildSaveIndexPayload());
            if (legacyValue !== undefined) await deleteIndexedValue('sanko_saves_v8');
            localStorage.removeItem('sanko_saves_v8');
            return loadedSaves;
        }

        function persistSaveIndex(label = '存檔索引') {
            if (!indexedDatabaseReady) return true;
            return queueIndexedWrite(SAVE_INDEX_KEY, buildSaveIndexPayload(), label);
        }

        function persistSingleSave(saveId, label = '遊戲存檔') {
            const id = String(saveId || '');
            const save = savesData[id];
            if (!id || !save) return false;
            if (!indexedDatabaseReady) {
                try {
                    localStorage.setItem('sanko_saves_v8', JSON.stringify(savesData));
                    storageWarningShown = false;
                    return true;
                } catch (error) {
                    handleIndexedWriteError(label, error);
                    return false;
                }
            }
            const isNew = !storedSaveIds.has(id) || deletedSaveIds.has(id);
            deletedSaveIds.delete(id);
            storedSaveIds.add(id);
            queueIndexedWrite(getSaveStorageKey(id), save, label);
            if (isNew) persistSaveIndex('存檔索引');
            return true;
        }

        function persistAllSaves(label = '遊戲存檔') {
            if (!indexedDatabaseReady) {
                try {
                    localStorage.setItem('sanko_saves_v8', JSON.stringify(savesData));
                    storageWarningShown = false;
                    return true;
                } catch (error) {
                    handleIndexedWriteError(label, error);
                    return false;
                }
            }
            const nextIds = new Set(Object.keys(savesData));
            storedSaveIds.forEach(id => {
                if (!nextIds.has(id)) deletedSaveIds.add(id);
            });
            nextIds.forEach(id => {
                deletedSaveIds.delete(id);
                queueIndexedWrite(getSaveStorageKey(id), savesData[id], label);
            });
            storedSaveIds.forEach(id => {
                if (!nextIds.has(id)) queueIndexedDelete(getSaveStorageKey(id), label);
            });
            storedSaveIds = nextIds;
            persistSaveIndex('存檔索引');
            return true;
        }

        function removePersistedSave(saveId, label = '刪除遊戲存檔') {
            const id = String(saveId || '');
            if (!id) return false;
            if (!indexedDatabaseReady) {
                try {
                    localStorage.setItem('sanko_saves_v8', JSON.stringify(savesData));
                    return true;
                } catch (error) {
                    handleIndexedWriteError(label, error);
                    return false;
                }
            }
            storedSaveIds.delete(id);
            deletedSaveIds.add(id);
            persistSaveIndex('存檔索引');
            queueIndexedDelete(getSaveStorageKey(id), label);
            return true;
        }

        async function initializePersistentStorage() {
            try {
                await openGameDatabase();
                for (const key of INDEXED_DATA_KEYS) {
                    const storedValue = await readIndexedValue(key);
                    if (storedValue !== undefined) {
                        localStorage.removeItem(key);
                        continue;
                    }
                    const legacyValue = localStorage.getItem(key);
                    if (legacyValue === null) continue;
                    let migratedValue = legacyValue;
                    if (INDEXED_JSON_KEYS.has(key)) {
                        try { migratedValue = JSON.parse(legacyValue); }
                        catch (error) { console.warn(`略過損毀的舊資料：${key}`, error); continue; }
                    }
                    await writeIndexedValue(key, migratedValue);
                    localStorage.removeItem(key);
                }
                indexedDatabaseReady = true;
                return true;
            } catch (error) {
                indexedDatabaseReady = false;
                console.warn('IndexedDB 無法使用，暫時退回 localStorage。', error);
                return false;
            }
        }

        async function readPersistentValue(key, fallbackValue) {
            if (indexedDatabaseReady && isIndexedStorageKey(key)) {
                try {
                    const value = await readIndexedValue(key);
                    return value === undefined ? fallbackValue : value;
                } catch (error) {
                    console.warn(`IndexedDB 讀取失敗：${key}`, error);
                }
            }
            const legacyValue = localStorage.getItem(key);
            if (legacyValue === null) return fallbackValue;
            if (!INDEXED_JSON_KEYS.has(key)) return legacyValue;
            try { return JSON.parse(legacyValue); }
            catch (error) { return fallbackValue; }
        }

        function persistLargeValue(storageKey, value, label = '資料') {
            if (indexedDatabaseReady && isIndexedStorageKey(storageKey)) return queueIndexedWrite(storageKey, value, label);
            try {
                localStorage.setItem(storageKey, value);
                return true;
            } catch (error) {
                handleIndexedWriteError(label, error);
                return false;
            }
        }

        window.onload = async () => {
            try {
                loadUiTheme();
                await initializePersistentStorage();
                await loadBackground();
                apiUsageStats = await loadApiUsageStats();
                apiProvider = localStorage.getItem('sanko_api_provider') || 'google';
                const providerSelect = document.getElementById('api-provider');
                if (providerSelect) providerSelect.value = apiProvider;

                const hasPersistedKey = Boolean(getPersistedApiKey('google') || getPersistedApiKey('openrouter'));
                const savedRememberPreference = localStorage.getItem('sanko_remember_api_key');
                rememberApiKey = hasPersistedKey || savedRememberPreference === 'true';
                localStorage.setItem('sanko_remember_api_key', String(rememberApiKey));
                const rememberToggle = document.getElementById('remember-api-key');
                if (rememberToggle) rememberToggle.checked = rememberApiKey;

                const savedKey = rememberApiKey ? getPersistedApiKey(apiProvider) : '';
                if (savedKey) {
                    sessionApiKeys[apiProvider] = savedKey;
                    apiKey = savedKey;
                    document.getElementById('api-key').value = savedKey;
                    document.getElementById('delete-key-btn').style.display = 'inline-block';
            }
selectedModel = localStorage.getItem(getModelStorageKey(apiProvider)) || '';
setHomeModelAreaVisible(selectedModel && apiKey);
syncSetupSideLabels();
ensureGameModelSelectReady();

            const savedPic = await readPersistentValue('sanko_home_pic', '');
                if (savedPic) { document.getElementById('setup-pic').src = savedPic; }

                savesData = await loadSaveCollection();

                const savedPresets = await readPersistentValue('sanko_scenario_presets_v2', null);
                if (savedPresets && typeof savedPresets === 'object' && !Array.isArray(savedPresets)) {
                    scenarioPresets = savedPresets;
                    let presetRuntimeStateRemoved = false;
                    for(let k in scenarioPresets) {
                        if(!scenarioPresets[k].playerStats) {
                            scenarioPresets[k].playerStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
                        }
                        scenarioPresets[k].playerStats = normalizePlayerStats(scenarioPresets[k].playerStats);
                        
                        // 相容鎖定設定：將預設防刪鎖與數值鎖分開
                        if(scenarioPresets[k].isLocked === undefined) { scenarioPresets[k].isLocked = false; }
                        if(scenarioPresets[k].statsLocked === undefined) { scenarioPresets[k].statsLocked = true; }
                        if(!scenarioPresets[k].gameDifficulty) { scenarioPresets[k].gameDifficulty = 'standard'; }
                        
                        // 舊存檔相容
                        if(!scenarioPresets[k].playerDetails) {
                            scenarioPresets[k].playerDetails = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: scenarioPresets[k].playerPersona || '' };
                        }
                        
                        if(!scenarioPresets[k].npcs) {
                            scenarioPresets[k].npcs = [{
                                id: 'npc_' + Date.now(),
                                name: scenarioPresets[k].targetName || '未知目標',
                                avatar: scenarioPresets[k].targetAvatar || emptyAvatar,
                                details: { age: '', speech: '', likes: '', dislikes: '', app: '', bg: scenarioPresets[k].targetPersona || '' },
                                affection: 0
                            }];
                        } else {
                            scenarioPresets[k].npcs.forEach(n => { 
                                if (n.affection === undefined) n.affection = 0; 
                                if (!n.details) n.details = { age: '', speech: '', likes: '', dislikes: '', app: '', bg: n.persona || '' };
                            });
                        }
                        if(!scenarioPresets[k].scenarios) {
                            scenarioPresets[k].scenarios = [{name: '預設場景', lore: '', npcRoles: scenarioPresets[k].targetRole || '', playerRole: '', transitionRule: ''}];
                        } else {
                            scenarioPresets[k].scenarios.forEach(sc => {
                                if(sc.npcRoles === undefined) sc.npcRoles = sc.targetRole || '';
                                if(sc.playerRole === undefined) sc.playerRole = '';
                                if(sc.transitionRule === undefined) sc.transitionRule = '';
                            });
                        }

                        const hasRuntimeState = Boolean(scenarioPresets[k].playerDynamic)
                            || scenarioPresets[k].npcs.some(n => Boolean(n.dynamic));
                        if (hasRuntimeState) {
                            scenarioPresets[k] = createPresetSnapshotFromScenario(scenarioPresets[k], scenarioPresets[k]);
                            presetRuntimeStateRemoved = true;
                        }
                    }
                    if (presetRuntimeStateRemoved) persistJson('sanko_scenario_presets_v2', scenarioPresets, '清理角色配置中的遊戲進度');
                } else {
                    scenarioPresets = { 'default': defaultPreset };
                    persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
                }

                activePresetId = localStorage.getItem('sanko_active_preset_id') || 'default';
                if (!scenarioPresets[activePresetId]) activePresetId = Object.keys(scenarioPresets)[0];
                currentScenario = clonePersistentValue(scenarioPresets[activePresetId]);

            } catch (e) {
                console.error("載入資料時發生錯誤:", e);
            }
            adjustInputHeight();
        }


// === [app.js 拆分] app-ui-helpers.js：原 app.js 第 914–1215 行｜loadPic/語言切換/玩家屬性骰點/頭像裁切 modal｜需依 index.html 既有順序與其他 app-*.js 一同載入，勿單獨重排。 ===
        function loadPic(input) {
            triggerCrop(input, 'home');
        }

        function setHomeModelAreaVisible(visible) {
            const isVisible = Boolean(visible);
            const area = document.getElementById('model-selection-area');
            if (area) area.style.display = isVisible ? 'block' : 'none';
            document.getElementById('setup-screen')?.classList.toggle('home-has-model', isVisible);
        }

        function cycleUiLanguageFromHome() {
            const order = ['zh-TW', 'ja', 'en'];
            const current = window.getUiLanguage
                ? getUiLanguage()
                : (document.querySelector('[data-ui-language-select]')?.value || 'zh-TW');
            const index = order.indexOf(current);
            const next = order[(index + 1 + order.length) % order.length] || 'zh-TW';
            if (window.setUiLanguage) setUiLanguage(next);
        }

        const PLAYER_STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const PLAYER_STAT_TOTAL_CAP = 72;

        function normalizePlayerStats(stats) {
            const normalized = {};
            PLAYER_STAT_KEYS.forEach(key => {
                const value = Number.parseInt(stats?.[key], 10);
                normalized[key] = Math.max(1, Math.min(20, Number.isFinite(value) ? value : 10));
            });
            let total = PLAYER_STAT_KEYS.reduce((sum, key) => sum + normalized[key], 0);
            while (total > PLAYER_STAT_TOTAL_CAP) {
                const reducible = PLAYER_STAT_KEYS
                    .filter(key => normalized[key] > 1)
                    .sort((a, b) => normalized[b] - normalized[a]);
                if (!reducible.length) break;
                normalized[reducible[0]] -= 1;
                total -= 1;
            }
            return normalized;
        }

        function getStatInputs() {
            return PLAYER_STAT_KEYS.map(key => document.getElementById(`stat-${key}`)).filter(Boolean);
        }

        function updateStatTotalDisplay() {
            const total = getStatInputs().reduce((sum, input) => sum + (Number.parseInt(input.value, 10) || 0), 0);
            const display = document.getElementById('stat-total-display');
            if (display) {
                display.textContent = `總點數 ${total} / ${PLAYER_STAT_TOTAL_CAP}`;
                display.classList.toggle('at-cap', total >= PLAYER_STAT_TOTAL_CAP);
            }
            return total;
        }

        function enforceStatTotal(changedInput) {
            const parsed = Number.parseInt(changedInput.value, 10);
            if (!Number.isFinite(parsed)) { updateStatTotalDisplay(); return; }
            const otherTotal = getStatInputs()
                .filter(input => input !== changedInput)
                .reduce((sum, input) => sum + (Number.parseInt(input.value, 10) || 0), 0);
            const maxAllowed = Math.max(1, Math.min(20, PLAYER_STAT_TOTAL_CAP - otherTotal));
            changedInput.value = Math.max(1, Math.min(maxAllowed, parsed));
            updateStatTotalDisplay();
        }

        function readPlayerStatsFromInputs() {
            const raw = {};
            PLAYER_STAT_KEYS.forEach(key => {
                raw[key] = Number.parseInt(document.getElementById(`stat-${key}`)?.value, 10) || 10;
            });
            return normalizePlayerStats(raw);
        }

        function roll4d6DropLowest() {
            const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => a - b);
            return rolls[1] + rolls[2] + rolls[3];
        }

        function rollPlayerStatSetAtCap() {
            let stats;
            do {
                stats = Object.fromEntries(PLAYER_STAT_KEYS.map(key => [key, roll4d6DropLowest()]));
            } while (PLAYER_STAT_KEYS.reduce((sum, key) => sum + stats[key], 0) !== PLAYER_STAT_TOTAL_CAP);
            return stats;
        }

        function applyStatsToInputs(stats) {
            const normalized = normalizePlayerStats(stats);
            PLAYER_STAT_KEYS.forEach(key => {
                const input = document.getElementById(`stat-${key}`);
                if (input) input.value = normalized[key];
            });
            updateStatTotalDisplay();
            return normalized;
        }

        function rollPlayerStats() {
            applyStatsToInputs(rollPlayerStatSetAtCap());
        }

        function respecStats() {
            // ----- 新增的鎖頭防護機制 -----
            let p = scenarioPresets[activePresetId];
            if (p && p.isLocked) {
                alert("🔒 此配置已受玩家保護，無法洗點！請先點擊上方解鎖。");
                return;
            }
            // ------------------------------

            if(confirm("【系統提示：靈魂重鑄】\n\n「命運的絲線又糾纏在一起了嗎...？」\n\n確定要重新洗點嗎？原本被鎖定的基礎六圍將會強制解鎖！")) {
                if (p) {
                    p.statsLocked = false;
                    persistJson('sanko_scenario_presets_v2', scenarioPresets, '角色配置');
                }
                const statInputs = document.querySelectorAll('.stat-input');
                statInputs.forEach(input => input.disabled = false);
                document.getElementById('btn-roll-stats').style.display = 'inline-block';
                document.getElementById('btn-respec-stats').style.display = 'none';
            }
        }

        let cropTargetRole = '';
        let pendingGameAvatarTarget = null;
        const CROP_VIEW_SIZE = 250;
        let cropImgObj = document.getElementById('crop-img');
        let cropContainer = document.getElementById('crop-container');
        let scaleSlider = document.getElementById('crop-scale');
        let cropScaleLabel = document.getElementById('crop-scale-label');
        let cropState = {
            isDragging: false, startX: 0, startY: 0, imgX: 0, imgY: 0,
            scale: 1, minScale: 0.1, maxScale: 3,
            pinchDistance: 0, pinchScale: 1
        };

        function triggerCrop(input, role) {
            if (input.files && input.files[0]) {
                cropTargetRole = role;
                const reader = new FileReader();
                reader.onload = (e) => {
                    cropImgObj.src = e.target.result;
                    cropImgObj.onload = () => {
                        const width = cropImgObj.naturalWidth || cropImgObj.width;
                        const height = cropImgObj.naturalHeight || cropImgObj.height;
                        cropImgObj.style.width = `${width}px`;
                        cropImgObj.style.height = `${height}px`;
                        cropImgObj.style.maxWidth = 'none';
                        cropImgObj.style.maxHeight = 'none';
                        const coverScale = Math.max(CROP_VIEW_SIZE / width, CROP_VIEW_SIZE / height);
                        cropState.minScale = Math.max(0.005, coverScale);
                        cropState.maxScale = Math.max(coverScale * 6, cropState.minScale * 2);
                        cropState.scale = coverScale;
                        cropState.imgX = (CROP_VIEW_SIZE - width * cropState.scale) / 2;
                        cropState.imgY = (CROP_VIEW_SIZE - height * cropState.scale) / 2;
                        scaleSlider.min = cropState.minScale;
                        scaleSlider.max = cropState.maxScale;
                        scaleSlider.step = Math.max((cropState.maxScale - cropState.minScale) / 240, 0.0001);
                        scaleSlider.value = cropState.scale;
                        clampCropPosition();
                        updateCropTransform();
                        document.getElementById('crop-modal').style.display = 'flex';
                    };
                };
                reader.readAsDataURL(input.files[0]);
            }
            input.value = '';
        }

        function clampCropScale(value) {
            return Math.min(cropState.maxScale, Math.max(cropState.minScale, value));
        }

        function clampCropPosition() {
            const width = (cropImgObj.naturalWidth || 0) * cropState.scale;
            const height = (cropImgObj.naturalHeight || 0) * cropState.scale;
            if (!width || !height) return;
            cropState.imgX = width <= CROP_VIEW_SIZE
                ? (CROP_VIEW_SIZE - width) / 2
                : Math.min(0, Math.max(CROP_VIEW_SIZE - width, cropState.imgX));
            cropState.imgY = height <= CROP_VIEW_SIZE
                ? (CROP_VIEW_SIZE - height) / 2
                : Math.min(0, Math.max(CROP_VIEW_SIZE - height, cropState.imgY));
        }

        function setCropScale(nextScale, centerX = CROP_VIEW_SIZE / 2, centerY = CROP_VIEW_SIZE / 2) {
            const oldScale = cropState.scale || 1;
            const newScale = clampCropScale(nextScale);
            const imagePointX = (centerX - cropState.imgX) / oldScale;
            const imagePointY = (centerY - cropState.imgY) / oldScale;
            cropState.imgX = centerX - imagePointX * newScale;
            cropState.imgY = centerY - imagePointY * newScale;
            cropState.scale = newScale;
            scaleSlider.value = newScale;
            clampCropPosition();
            updateCropTransform();
        }

        function adjustCropScale(direction) {
            setCropScale(cropState.scale * (direction > 0 ? 1.12 : 1 / 1.12));
        }

        function updateCropTransform() {
            cropImgObj.style.transform = `translate3d(${cropState.imgX}px, ${cropState.imgY}px, 0) scale(${cropState.scale})`;
            const baseScale = Math.max(CROP_VIEW_SIZE / (cropImgObj.naturalWidth || CROP_VIEW_SIZE), CROP_VIEW_SIZE / (cropImgObj.naturalHeight || CROP_VIEW_SIZE));
            cropScaleLabel.textContent = `${Math.round((cropState.scale / baseScale) * 100)}%`;
        }

        scaleSlider.addEventListener('input', (e) => setCropScale(parseFloat(e.target.value)));

        function touchDistance(touches) {
            return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        }

        function handleDragStart(e) {
            e.preventDefault();
            if (e.touches && e.touches.length === 2) {
                cropState.isDragging = false;
                cropState.pinchDistance = touchDistance(e.touches);
                cropState.pinchScale = cropState.scale;
                return;
            }
            cropState.isDragging = true;
            const point = e.touches ? e.touches[0] : e;
            cropState.startX = point.clientX - cropState.imgX;
            cropState.startY = point.clientY - cropState.imgY;
        }

        function handleDragMove(e) {
            if (e.touches && e.touches.length === 2) {
                e.preventDefault();
                const rect = cropContainer.getBoundingClientRect();
                const centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left - cropContainer.clientLeft;
                const centerY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top - cropContainer.clientTop;
                setCropScale(cropState.pinchScale * touchDistance(e.touches) / cropState.pinchDistance, centerX, centerY);
                return;
            }
            if (!cropState.isDragging) return;
            e.preventDefault();
            const point = e.touches ? e.touches[0] : e;
            cropState.imgX = point.clientX - cropState.startX;
            cropState.imgY = point.clientY - cropState.startY;
            clampCropPosition();
            updateCropTransform();
        }

        function handleDragEnd(e) {
            cropState.isDragging = false;
            if (e && e.touches && e.touches.length === 1) handleDragStart(e);
        }

        cropContainer.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        cropContainer.addEventListener('touchstart', handleDragStart, {passive: false});
        window.addEventListener('touchmove', handleDragMove, {passive: false});
        window.addEventListener('touchend', handleDragEnd, {passive: false});

        function confirmCrop() {
            const canvas = document.createElement('canvas');
            const size = 300;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const drawRatio = size / CROP_VIEW_SIZE;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.save();
            ctx.scale(drawRatio, drawRatio);
            ctx.translate(cropState.imgX, cropState.imgY);
            ctx.scale(cropState.scale, cropState.scale);
            ctx.drawImage(cropImgObj, 0, 0);
            ctx.restore();
            const finalBase64 = canvas.toDataURL('image/jpeg', 0.82);

            if (cropTargetRole === 'home') {
                document.getElementById('setup-pic').src = finalBase64;
                persistLargeValue('sanko_home_pic', finalBase64, '首頁頭像');
            } else if (cropTargetRole === 'player') {
                document.getElementById('preview-player').src = finalBase64;
            } else if (cropTargetRole.startsWith('npc-')) {
                const idx = cropTargetRole.split('-')[1];
                const targetImg = document.getElementById(`preview-npc-${idx}`);
                if (targetImg) targetImg.src = finalBase64;
            } else if (cropTargetRole === 'game') {
                commitGameAvatar(finalBase64);
            }
            if (cropTargetRole === 'player' || cropTargetRole.startsWith('npc-')) renderDesktopPresetOverview();
            closeCropModal();
        }

        function closeCropModal() {
            document.getElementById('crop-modal').style.display = 'none';
            cropImgObj.onload = null;
            cropImgObj.removeAttribute('src');
            cropImgObj.style.width = '';
            cropImgObj.style.height = '';
            cropImgObj.style.transform = '';
        }




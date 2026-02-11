/**
 * おうちにGO！レスキュー隊 - メインアプリケーション
 */
import './style.css';
import {
    getCheckpoints,
    saveCheckpoints,
    createCheckpoint,
    DIALOGUES,
    getTodaySticker,
    saveSticker,
    loadStickers,
    saveName,
    loadName,
    saveGameProgress,
    loadGameProgress,
    resetGameProgress,
    saveCheckpointImage,
    loadCheckpointImage,
    hasCheckpointImage,
} from './gameData.js';
import {
    playSosSound,
    playTransformSound,
    playItemSound,
    playFanfareSound,
    playButtonSound,
    startCelebration,
    startSparkle,
    animateButtonPress,
    setSoundEnabled,
    isSoundEnabled,
} from './effects.js';

// ===========================================
// State
// ===========================================
let playerName = '';
let currentPhase = 0; // 0=name, 1=SOS, 2=prepare, 3=mission, 4=complete
let checkpointIndex = -1; // -1=start -> 0, 1, 2... -> Goal
let itemsCollected = [];
let checkpointList = []; // Loaded from storage

// ===========================================
// DOM
// ===========================================
const phases = {
    phase1: document.getElementById('phase1'),
    phase2: document.getElementById('phase2'),
    phase3: document.getElementById('phase3'),
    phase4: document.getElementById('phase4'),
};

// Name modal
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const nameSubmit = document.getElementById('name-submit');

// Phase 1
const btnDispatch = document.getElementById('btn-dispatch');
const sosMessage = document.getElementById('sos-message');

// Phase 2
const prepareStep = document.getElementById('prepare-step');
const transformStep = document.getElementById('transform-step');
const btnShoesDone = document.getElementById('btn-shoes-done');
const btnGoMission = document.getElementById('btn-go-mission');

// Phase 3
const mapMessage = document.getElementById('map-message');
const itemsList = document.getElementById('items-list');
const btnCheckpoint = document.getElementById('btn-checkpoint');
const currentPhoto = document.getElementById('current-photo');
const photoPlaceholder = document.getElementById('photo-placeholder');
const nextDestText = document.getElementById('next-destination-text');
const progressFill = document.getElementById('progress-fill');
const progressStepsContainer = document.querySelector('.progress-steps');

// Phase 4
const completeMessage = document.getElementById('complete-message');
const stickerReveal = document.getElementById('sticker-reveal');
const todaysSticker = document.getElementById('todays-sticker');
const btnStickerBook = document.getElementById('btn-sticker-book');
const btnRestart = document.getElementById('btn-restart');

// Sticker modal
const stickerModal = document.getElementById('sticker-modal');
const stickerGrid = document.getElementById('sticker-grid');
const stickerCount = document.getElementById('sticker-count');
const closeStickerBook = document.getElementById('close-sticker-book');

// Settings
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const resetBtn = document.getElementById('reset-btn');
const displayName = document.getElementById('display-name');
const changeNameBtn = document.getElementById('change-name-btn');
const soundToggle = document.getElementById('sound-toggle');
const checkpointsContainer = document.getElementById('checkpoints-settings-container');
const addCheckpointBtn = document.getElementById('add-checkpoint-btn');

// ===========================================
// SVG Character Generator
// ===========================================
function generateCharacterSVG(emotion) {
    const bodyColor = '#4FC3F7';
    const helmetColor = '#E53935';
    const darkBody = '#0288D1';
    let face = '', extras = '';

    if (emotion === 'crying') {
        face = `
      <ellipse cx="70" cy="95" rx="10" ry="12" fill="white"/>
      <ellipse cx="130" cy="95" rx="10" ry="12" fill="white"/>
      <circle cx="70" cy="100" r="6" fill="#333"/>
      <circle cx="130" cy="100" r="6" fill="#333"/>
      <line x1="55" y1="78" x2="78" y2="85" stroke="#333" stroke-width="3" stroke-linecap="round"/>
      <line x1="145" y1="78" x2="122" y2="85" stroke="#333" stroke-width="3" stroke-linecap="round"/>
      <path d="M80 125 Q100 115 120 125" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M60 108 Q55 125 60 135" stroke="#4FC3F7" stroke-width="4" fill="none" opacity="0.8"/>
      <path d="M140 108 Q145 125 140 135" stroke="#4FC3F7" stroke-width="4" fill="none" opacity="0.8"/>
      <ellipse cx="58" cy="138" rx="5" ry="4" fill="#4FC3F7" opacity="0.6"/>
      <ellipse cx="142" cy="138" rx="5" ry="4" fill="#4FC3F7" opacity="0.6"/>`;
    } else if (emotion === 'hero') {
        face = `
      <ellipse cx="70" cy="95" rx="11" ry="12" fill="white"/>
      <ellipse cx="130" cy="95" rx="11" ry="12" fill="white"/>
      <circle cx="72" cy="95" r="7" fill="#333"/>
      <circle cx="132" cy="95" r="7" fill="#333"/>
      <circle cx="74" cy="92" r="2" fill="white"/>
      <circle cx="134" cy="92" r="2" fill="white"/>
      <line x1="55" y1="80" x2="82" y2="78" stroke="#333" stroke-width="4" stroke-linecap="round"/>
      <line x1="145" y1="80" x2="118" y2="78" stroke="#333" stroke-width="4" stroke-linecap="round"/>
      <path d="M78 122 Q100 138 122 122" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extras = `
      <path d="M45 140 Q30 180 50 195 L100 175 L150 195 Q170 180 155 140" fill="#E53935" opacity="0.9"/>
      <circle cx="100" cy="145" r="12" fill="#FFD700" stroke="#FF8F00" stroke-width="2"/>
      <text x="100" y="150" text-anchor="middle" font-size="14" fill="#E53935" font-weight="bold">★</text>`;
    } else {
        face = `
      <path d="M58 92 Q70 82 82 92" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M118 92 Q130 82 142 92" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="55" cy="108" rx="12" ry="7" fill="#FF8A80" opacity="0.5"/>
      <ellipse cx="145" cy="108" rx="12" ry="7" fill="#FF8A80" opacity="0.5"/>
      <path d="M72 118 Q100 145 128 118" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        extras = `
      <text x="35" y="60" font-size="20" fill="#FFD700">✨</text>
      <text x="155" y="55" font-size="18" fill="#FFD700">⭐</text>
      <text x="25" y="170" font-size="16" fill="#FFD700">✨</text>
      <text x="165" y="165" font-size="18" fill="#FFD700">⭐</text>`;
    }

    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    ${extras}
    <ellipse cx="100" cy="155" rx="45" ry="40" fill="${bodyColor}"/>
    <ellipse cx="100" cy="160" rx="42" ry="35" fill="${darkBody}" opacity="0.2"/>
    <ellipse cx="48" cy="150" rx="12" ry="18" fill="${bodyColor}" transform="rotate(-15 48 150)"/>
    <ellipse cx="152" cy="150" rx="12" ry="18" fill="${bodyColor}" transform="rotate(15 152 150)"/>
    ${emotion === 'happy' ? `<ellipse cx="42" cy="130" rx="12" ry="18" fill="${bodyColor}" transform="rotate(-40 42 130)"/><ellipse cx="158" cy="130" rx="12" ry="18" fill="${bodyColor}" transform="rotate(40 158 130)"/>` : ''}
    <rect x="75" y="185" width="18" height="12" rx="6" fill="${darkBody}"/>
    <rect x="107" y="185" width="18" height="12" rx="6" fill="${darkBody}"/>
    <circle cx="100" cy="95" r="50" fill="${bodyColor}"/>
    <path d="M50 85 Q50 40 100 35 Q150 40 150 85" fill="${helmetColor}"/>
    <rect x="45" y="80" width="110" height="12" rx="4" fill="${helmetColor}" opacity="0.9"/>
    <circle cx="100" cy="45" r="8" fill="#FFD700" stroke="#FF8F00" stroke-width="2"/>
    <circle cx="100" cy="45" r="4" fill="#FFF9C4"/>
    <line x1="100" y1="37" x2="100" y2="25" stroke="#666" stroke-width="3"/>
    <circle cx="100" cy="22" r="5" fill="#FFD700"/>
    ${face}
  </svg>`;
}

// ===========================================
// Initialization
// ===========================================
function init() {
    playerName = loadName();
    checkpointList = getCheckpoints();

    const savedSound = localStorage.getItem('rescue-sound');
    if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
        soundToggle.checked = isSoundEnabled();
    }

    setCharacterImages();

    if (!playerName) {
        showNameModal();
    } else {
        const saved = loadGameProgress();
        if (saved) {
            currentPhase = saved.phase;
            checkpointIndex = saved.checkpointIndex;
            // Restore items collected up to this point
            for (let i = 0; i <= checkpointIndex; i++) {
                if (i < checkpointList.length) {
                    itemsCollected.push(checkpointList[i].item);
                }
            }
        } else {
            currentPhase = 1;
        }
        showPhase(currentPhase);
    }

    setupEventListeners();
    renderCheckpointSettings();
    setupHomePhotoUpload();
}

function setCharacterImages() {
    const cryingSVG = generateCharacterSVG('crying');
    const heroSVG = generateCharacterSVG('hero');
    const happySVG = generateCharacterSVG('happy');
    const encode = (svg) => 'data:image/svg+xml,' + encodeURIComponent(svg);

    const charCrying = document.getElementById('char-crying');
    const charHero = document.getElementById('char-hero');
    const charHappy = document.getElementById('char-happy');

    if (charCrying) charCrying.src = encode(cryingSVG);
    if (charHero) charHero.src = encode(heroSVG);
    if (charHappy) charHappy.src = encode(happySVG);
}

// ===========================================
// Phase Management
// ===========================================
function hideAllPhases() {
    Object.values(phases).forEach((el) => el.classList.add('hidden'));
}

function showPhase(phase) {
    hideAllPhases();
    currentPhase = phase;
    saveGameProgress(currentPhase, checkpointIndex);

    switch (phase) {
        case 1: showPhase1(); break;
        case 2: showPhase2(); break;
        case 3: showPhase3(); break;
        case 4: showPhase4(); break;
    }

    if (displayName) displayName.textContent = playerName;
}

// ===========================================
// Phase 1 & 2
// ===========================================
function showPhase1() {
    phases.phase1.classList.remove('hidden');
    sosMessage.innerHTML = DIALOGUES.sos(playerName);
    setTimeout(() => playSosSound(), 500);
}

function showPhase2() {
    phases.phase2.classList.remove('hidden');
    prepareStep.classList.remove('hidden');
    transformStep.classList.add('hidden');
}

function handleShoesDone() {
    animateButtonPress(btnShoesDone);
    playTransformSound();
    prepareStep.classList.add('hidden');
    transformStep.classList.remove('hidden');
    transformStep.classList.add('transform-enter');
    const flash = document.querySelector('.transform-flash');
    if (flash) {
        flash.classList.add('flash-active');
        setTimeout(() => flash.classList.remove('flash-active'), 600);
    }
    startSparkle(window.innerWidth / 2, window.innerHeight / 3);
    setTimeout(() => { transformStep.classList.remove('transform-enter'); }, 800);
}

// ===========================================
// Phase 3: Photo Mission
// ===========================================
function showPhase3() {
    phases.phase3.classList.remove('hidden');
    updatePhotoView();
    updateItemsDisplay();
    renderProgressDots(); // Re-render dots based on current checkpoint list
}

function renderProgressDots() {
    progressStepsContainer.innerHTML = '';

    // School (Start)
    const schoolDot = document.createElement('div');
    schoolDot.className = 'step-dot completed';
    schoolDot.innerHTML = '🏫';
    progressStepsContainer.appendChild(schoolDot);

    // Checkpoints
    checkpointList.forEach((cp, idx) => {
        const dot = document.createElement('div');
        dot.className = 'step-dot';
        dot.id = `dot-${idx}`;
        // Choose icon based on index or random/preset
        const icons = ['🏪', '🌳', '⛲', '🚩', '🏰'];
        dot.innerHTML = icons[idx % icons.length];
        progressStepsContainer.appendChild(dot);
    });

    // Home (Goal)
    const homeDot = document.createElement('div');
    homeDot.className = 'step-dot';
    homeDot.id = 'dot-home';
    homeDot.innerHTML = '🏠';
    progressStepsContainer.appendChild(homeDot);

    updateProgressStatus();
}

function updateProgressStatus() {
    // Update active/completed classes
    // Index -1: School is active (or completed if moving to 0)
    // Index 0: CP1 completed.

    const dots = progressStepsContainer.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
        // i=0 is School. i=1 is CP1... i=len+1 is Home.
        // checkpointIndex + 1 corresponds to the dot index of the "completed" checkpoints (Start is 0)
        // Actually:
        // CP Index: -1 (Start). Progress: 0. School (dot 0) completed. Next Target dot 1 (CP1).

        dot.classList.remove('active', 'completed');

        if (i <= checkpointIndex + 1) {
            dot.classList.add('completed');
        } else if (i === checkpointIndex + 2) {
            dot.classList.add('active');
        }
    });

    const totalSteps = checkpointList.length + 1; // CPs + Home
    // Current step: checkpointIndex + 1 (0 to totalSteps)
    const currentStep = checkpointIndex + 2;
    const progress = Math.min(100, (currentStep / (totalSteps + 1)) * 100);
    progressFill.style.width = `${progress}%`;
}

function updatePhotoView() {
    let nextTargetIndex = checkpointIndex + 1;
    let targetCp = null;
    let targetId = 'home';
    let targetName = 'おうち';

    if (nextTargetIndex < checkpointList.length) {
        targetCp = checkpointList[nextTargetIndex];
        targetId = targetCp.id;
        targetName = targetCp.name;
    }

    // Load Photo
    const photoData = loadCheckpointImage(targetId);
    if (photoData) {
        currentPhoto.src = photoData;
        currentPhoto.classList.remove('hidden');
        photoPlaceholder.classList.add('hidden');
    } else {
        currentPhoto.classList.add('hidden');
        photoPlaceholder.classList.remove('hidden');
        photoPlaceholder.querySelector('.placeholder-text').textContent = 'しゃしんを せっていしてね！';
    }

    // Update Message & Button
    if (targetId === 'home') {
        mapMessage.innerHTML = 'もうすぐ おうちだよ！<br>さいごの ボタンを おそう！';
        btnCheckpoint.innerHTML = '🏠 おうちとうちゃく！';
        btnCheckpoint.classList.add('btn-goal');
    } else {
        mapMessage.innerHTML = targetCp.hint;
        btnCheckpoint.innerHTML = '📍 いどうする！';
        btnCheckpoint.classList.remove('btn-goal');
    }

    updateProgressStatus();

    nextDestText.textContent = `つぎ: ${targetName}`;
}

function updateItemsDisplay() {
    if (!itemsList) return;
    itemsList.innerHTML = '';
    itemsCollected.forEach((item) => {
        const span = document.createElement('span');
        span.className = 'item-icon item-bounce';
        span.textContent = item;
        itemsList.appendChild(span);
    });
}

function handleCheckpoint() {
    animateButtonPress(btnCheckpoint);
    playButtonSound();

    // Check if reached Home
    if (checkpointIndex >= checkpointList.length - 1) {
        showPhase(4);
        return;
    }

    checkpointIndex++;
    saveGameProgress(currentPhase, checkpointIndex);

    // Play effects
    playItemSound();
    const cp = checkpointList[checkpointIndex]; // The one we just reached
    itemsCollected.push(cp.item);

    mapMessage.innerHTML = cp.found + '<br>' + cp.itemName + ' ゲット！';

    // Sparkle
    const rect = btnCheckpoint.getBoundingClientRect();
    startSparkle(rect.left + rect.width / 2, rect.top);

    updateItemsDisplay();

    // Delay update view
    setTimeout(() => {
        updatePhotoView();
    }, 1500);
}

// ===========================================
// Checkpoint Settings Logic (Dynamic)
// ===========================================
function renderCheckpointSettings() {
    checkpointsContainer.innerHTML = '';

    checkpointList.forEach((cp, index) => {
        const div = document.createElement('div');
        div.className = 'photo-upload-group';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <label style="margin:0;">${index + 1}. </label>
                <button class="btn-danger btn-small remove-cp-btn" data-index="${index}">×</button>
            </div>
            <input type="text" class="cp-name-input" value="${cp.name}" data-index="${index}" placeholder="なまえ" style="width:100%; margin-bottom:8px; padding:8px; border:1px solid #ddd; border-radius:4px;">
            <input type="file" id="upload-${cp.id}" accept="image/*" />
            <img id="preview-${cp.id}" class="preview-thumb hidden" />
        `;
        checkpointsContainer.appendChild(div);

        // Load preview
        const preview = div.querySelector(`#preview-${cp.id}`);
        const existing = loadCheckpointImage(cp.id);
        if (existing) {
            preview.src = existing;
            preview.classList.remove('hidden');
        }

        // Event listeners
        const fileInput = div.querySelector(`#upload-${cp.id}`);
        fileInput.addEventListener('change', (e) => handleImageUpload(e, cp.id, preview));

        const nameInput = div.querySelector(`.cp-name-input`);
        nameInput.addEventListener('change', (e) => {
            cp.name = e.target.value;
            cp.hint = `つぎは ${cp.name} だよ！`;
            cp.found = `${cp.name}に ついたよ！`;
            saveCheckpoints(checkpointList);
        });

        const removeBtn = div.querySelector(`.remove-cp-btn`);
        removeBtn.addEventListener('click', () => removeCheckpoint(index));
    });

    // Disable remove if only 1 checkpoint
    if (checkpointList.length <= 1) {
        document.querySelectorAll('.remove-cp-btn').forEach(b => b.disabled = true);
    }
    // Disable add if max 5
    addCheckpointBtn.disabled = (checkpointList.length >= 5);
}

function handleAddCheckpoint() {
    if (checkpointList.length >= 5) return;
    const newCp = createCheckpoint(`ポイント ${checkpointList.length + 1}`);
    checkpointList.push(newCp);
    saveCheckpoints(checkpointList);
    renderCheckpointSettings();
    playButtonSound();
}

function removeCheckpoint(index) {
    if (checkpointList.length <= 1) return;
    if (confirm('ほんとうに けす？')) {
        checkpointList.splice(index, 1);
        saveCheckpoints(checkpointList);
        renderCheckpointSettings();
        playButtonSound();
    }
}

function setupHomePhotoUpload() {
    const id = 'home';
    const input = document.getElementById(`upload-${id}`);
    const preview = document.getElementById(`preview-${id}`);

    const existing = loadCheckpointImage(id);
    if (existing && preview) {
        preview.src = existing;
        preview.classList.remove('hidden');
    }

    if (input) {
        input.addEventListener('change', (e) => handleImageUpload(e, id, preview));
    }
}

function handleImageUpload(e, id, previewElement) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.indexOf('image') === -1) {
        alert('画像ファイルを選択してください');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const MAX_SIZE = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

            saveCheckpointImage(id, dataUrl);
            if (previewElement) {
                previewElement.src = dataUrl;
                previewElement.classList.remove('hidden');
            }

            if (currentPhase === 3) updatePhotoView();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// ===========================================
// Phase 4 & Common
// ===========================================
function showPhase4() {
    phases.phase4.classList.remove('hidden');
    completeMessage.innerHTML = DIALOGUES.goalReached(playerName);
    setTimeout(() => { playFanfareSound(); startCelebration(); }, 500);
    setTimeout(() => { showTodaySticker(); }, 2000);
}

function showTodaySticker() {
    const sticker = getTodaySticker();
    saveSticker(sticker);
    stickerReveal.classList.remove('hidden');
    stickerReveal.classList.add('sticker-appear');
    todaysSticker.innerHTML = `
    <div class="sticker-display" style="--sticker-color: ${sticker.color}">
      <span class="sticker-emoji">${sticker.emoji}</span>
      <span class="sticker-name">${sticker.name}</span>
    </div>`;
    startSparkle(window.innerWidth / 2, window.innerHeight * 0.6);
}

function showStickerBook() {
    const stickers = loadStickers();
    stickerGrid.innerHTML = '';
    if (stickers.length === 0) {
        stickerGrid.innerHTML = '<p class="no-stickers">まだ シールが ないよ！<br>ミッションを クリアしよう！</p>';
    } else {
        [...stickers].reverse().forEach((s) => {
            const div = document.createElement('div');
            div.className = 'sticker-card';
            div.innerHTML = `<span class="sticker-card-emoji">${s.emoji}</span><span class="sticker-card-name">${s.name}</span><span class="sticker-card-date">${formatDate(s.date)}</span>`;
            stickerGrid.appendChild(div);
        });
    }
    stickerCount.textContent = `あつめた シール: ${stickers.length}まい`;
    stickerModal.classList.remove('hidden');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function showNameModal() {
    nameModal.classList.remove('hidden');
    nameInput.value = playerName;
    setTimeout(() => nameInput.focus(), 300);
}

function handleNameSubmit() {
    const name = nameInput.value.trim();
    if (!name) {
        nameInput.classList.add('shake');
        setTimeout(() => nameInput.classList.remove('shake'), 500);
        return;
    }
    playerName = name;
    saveName(playerName);
    nameModal.classList.add('hidden');
    playButtonSound();
    currentPhase = 1;
    showPhase(1);
}

function setupEventListeners() {
    nameSubmit.addEventListener('click', handleNameSubmit);
    nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleNameSubmit(); });

    btnDispatch.addEventListener('click', () => { animateButtonPress(btnDispatch); playButtonSound(); showPhase(2); });
    btnShoesDone.addEventListener('click', handleShoesDone);
    btnGoMission.addEventListener('click', () => { animateButtonPress(btnGoMission); playButtonSound(); showPhase(3); });
    btnCheckpoint.addEventListener('click', handleCheckpoint);

    btnStickerBook.addEventListener('click', showStickerBook);
    closeStickerBook.addEventListener('click', () => stickerModal.classList.add('hidden'));
    stickerModal.querySelector('.modal-backdrop').addEventListener('click', () => stickerModal.classList.add('hidden'));

    btnRestart.addEventListener('click', () => {
        resetGameProgress();
        currentPhase = 1;
        checkpointIndex = -1;
        itemsCollected = [];
        showPhase(1);
    });

    settingsBtn.addEventListener('click', () => {
        renderCheckpointSettings();
        settingsModal.classList.remove('hidden');
    });
    closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
    settingsModal.querySelector('.modal-backdrop').addEventListener('click', () => settingsModal.classList.add('hidden'));
    soundToggle.addEventListener('change', () => { setSoundEnabled(soundToggle.checked); localStorage.setItem('rescue-sound', soundToggle.checked); });
    changeNameBtn.addEventListener('click', () => { settingsModal.classList.add('hidden'); showNameModal(); });
    resetBtn.addEventListener('click', () => { resetGameProgress(); currentPhase = 1; checkpointIndex = -1; itemsCollected = []; settingsModal.classList.add('hidden'); showPhase(1); });

    addCheckpointBtn.addEventListener('click', handleAddCheckpoint);
}

document.addEventListener('DOMContentLoaded', init);

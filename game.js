'use strict';

import {
    BACKGROUND_URL, LEVEL_START_AUDIO_URL, LEVEL_WIN_AUDIO_URL, LEVEL_GAMEOVER_AUDIO_URL,
    LEVEL_MUSIC_URL, SILENT_AUDIO_URL, UNLOCK_CODE_HASH, SOUND_EAGLE_URL, SOUND_POOP_URL, SOUND_BOM_URL, SOUND_SPRAY_URL,
    DEFAULT_VOLUME_MUSIC, DEFAULT_VOLUME_SFX, VOLUME_STORAGE_KEY_MUSIC, VOLUME_STORAGE_KEY_SFX, getStoredVolume,
    VIRTUAL_HEIGHT, VIRTUAL_WIDTH, MOBILE_MAX_CANVAS_WIDTH, MOBILE_MAX_CANVAS_HEIGHT, MAX_DEVICE_PIXEL_RATIO,
    POINTS_TO_BOSS, BASE_WORLD_SPEED, HIGH_SCORE_KEY, UNLOCK_ALL_LEVELS_KEY, isDebugEnabled,
    SNACKS, levelBossConfig, SUP_NORMAL_BASE_SPEED, SUP_NORMAL_SPEED_RANGE, SUP_A_SPEED_MULT, SUP_B_SPEED_MULT, SUP_C_SPEED_MULT, SUP_D_SPEED_MULT,
    HOOLIGAN_BASE_SPEED, HOOLIGAN_SPEED_RANGE, HOOLIGAN_SPEEDMULT_MIN, HOOLIGAN_SPEEDMULT_MAX, HOOLIGAN_VX_WORLD_OFFSET,
    HOOLIGAN_CHANCE_LEVEL1, HOOLIGAN_CHANCE_MAX, SUP_A_SPAWN_WEIGHT, SUP_B_SPAWN_WEIGHT, SUP_C_SPAWN_WEIGHT, SUP_D_SPAWN_WEIGHT,
    BOSS_CONFIG, getBossConfig, LEVEL_BG_KEYS, LEVEL_ENDLESS_SCROLL, LEVEL_SCROLL_START_RIGHT, LEVEL_ENDLESS_SCROLL_LEFT, LEVEL_SCROLL_WAIT_MS, DEFAULT_SCROLL_WAIT_MS,
    getLevelAssetKeys, LEVEL_SPECIFIC_KEYS, FPS_HISTORY_LEN, FPS_LOW_THRESHOLD, FPS_RECOVER_THRESHOLD, LOW_FPS_FRAMES_TO_REDUCE, HIGH_FPS_FRAMES_TO_RECOVER, MAX_SPLATS_WHEN_REDUCED,
    SUP_ARENT_KEYS, SUP_B_KEYS, SUP_C_KEYS, SUP_D_KEYS,
    HOOLI_RUN_KEYS, HOOLI_THROW_KEYS,
    CLOWN_LOOP_KEYS, CLOWN_THROW_KEYS, CLOWN_DOWN_KEYS,
    ZWOLF_RUN_KEYS, ZWOLF_THROW_KEYS, ZWOLF_DOWN_KEYS,
    DOM_RUN_KEYS, DOM_THROW_KEYS,
    SUP_A_SCALE_X, SUP_A_SCALE_Y, SUP_B_SCALE_X, SUP_B_SCALE_Y, SUP_C_SCALE_X, SUP_C_SCALE_Y, SUP_C_RUN_Y_OFFSET, SUP_D_SCALE_X, SUP_D_SCALE_Y,
    HOOLI_SCALE_X, HOOLI_SCALE_Y,
    SUP_A_HIT_SCALE_X, SUP_A_HIT_SCALE_Y, SUP_B_HIT_SCALE_X, SUP_B_HIT_SCALE_Y, SUP_C_HIT_SCALE_X, SUP_C_HIT_SCALE_Y, SUP_D_HIT_SCALE_X, SUP_D_HIT_SCALE_Y,
    HOOLI_HIT_SCALE_X, HOOLI_HIT_SCALE_Y,
    PROJECTILE_FONT_SIZE, BOSS_PROJECTILE_TYPE, GENERIC_BOSS_ANIM_KEYS, SIMPLE_ANIM_BOSSES, bossDownMap, BOSS_NAMES
} from './js/config.js';
import { assets, preloadCore, loadLevelAssets } from './js/assets.js';
import { submitGlobalScore, getTopScores } from './js/firebase-service.js';

(() => {

// === Android/Mobile Context Menu Preventie ===
// Zorgt ervoor dat "Afbeelding opslaan" of "Tekst kopiëren" popups niet verschijnen bij ingedrukt houden
window.addEventListener('contextmenu', e => e.preventDefault());

let musicVolume = getStoredVolume(VOLUME_STORAGE_KEY_MUSIC, DEFAULT_VOLUME_MUSIC);
let sfxVolume = getStoredVolume(VOLUME_STORAGE_KEY_SFX, DEFAULT_VOLUME_SFX);

function trackEvent(path, title, vars) {
    if (!window.goatcounter || !window.goatcounter.count) return;
    try { window.goatcounter.count(Object.assign({ path: path, title: title, event: true }, vars || {})); } catch (e) {}
}

const els = {
    bossHealthBar: document.getElementById('boss-health-bar'), bossHealthContainer: document.getElementById('boss-health-container'),
    bossSummaryContainer: document.getElementById('boss-summary-container'), gameOverBossContainer: document.getElementById('game-over-boss-container'),
    closeInfoBtn: document.getElementById('close-info-btn'), debugPanel: document.getElementById('debug-panel'),
    failedAssetsContainer: document.getElementById('failed-assets-container'), finalScore: document.getElementById('final-score'),
    fireBtn: document.getElementById('fire-btn'), gameOverScreen: document.getElementById('game-over-screen'),
    gameOverTitle: document.getElementById('game-over-title'), gameContainer: document.getElementById('game-container'),
    healthBar: document.getElementById('health-bar'), healthContainer: document.getElementById('health-container'),
    infoBtn: document.getElementById('info-btn'), infoModal: document.getElementById('info-modal'),
    iosLaterBtn: document.getElementById('ios-later-btn'), iosModal: document.getElementById('ios-modal'),
    joystickContainer: document.getElementById('joystick-container'), joystickKnob: document.getElementById('joystick-knob'),
    levelText: document.getElementById('level-text'), levelUpScreen: document.getElementById('level-up-screen'),
    levelUpText: document.getElementById('level-up-text'), levelUpScore: document.getElementById('level-up-score'),
    levelLoadingOverlay: document.getElementById('level-loading-overlay'), levelLoadingText: document.getElementById('level-loading-text'),
    levelLoadingBar: document.getElementById('level-loading-bar'), loadingText: document.getElementById('loading-text'),
    restartBtn: document.getElementById('restart-btn'), scoreText: document.getElementById('score-text'),
    startBtn: document.getElementById('start-btn'), startScreen: document.getElementById('start-screen'),
    continueBtn: document.getElementById('continue-btn'), settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'), musicSlider: document.getElementById('music-slider'),
    sfxSlider: document.getElementById('sfx-slider'), musicValue: document.getElementById('music-value'),
    sfxValue: document.getElementById('sfx-value'), closeSettingsBtn: document.getElementById('close-settings-btn'),
    unlockCodeBtn: document.getElementById('unlock-code-btn'), highscoresModal: document.getElementById('highscores-modal'),
    highscoresList: document.getElementById('highscores-list'), closeHighscoresBtn: document.getElementById('close-highscores-btn'),
    highscoreNameModal: document.getElementById('highscore-name-modal'), highscoreNameInput: document.getElementById('highscore-name-input'),
    highscoreNameSubmit: document.getElementById('highscore-name-submit'), closeGameBtn: document.getElementById('close-game-btn'),
    whatsappShareBtn: document.getElementById('whatsapp-share-btn'), derbyCountdown: document.getElementById('derby-countdown')
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const tintCanvas = document.createElement('canvas');
const tintCtx = tintCanvas.getContext('2d', { willReadFrequently: true });
const bgImg = new Image(); 
   
// === Audio Setup (HTML5 Audio for music/jingles) ===
const levelAudio = new Audio(LEVEL_START_AUDIO_URL); levelAudio.loop = true;
const silentUnlockAudio = new Audio(SILENT_AUDIO_URL);
const winAudio = new Audio(LEVEL_WIN_AUDIO_URL);
const gameOverAudio = new Audio(LEVEL_GAMEOVER_AUDIO_URL);

// === Web Audio API Setup (For fast, non-stuttering SFX) ===
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const sfxGain = audioCtx.createGain();
sfxGain.connect(audioCtx.destination);

let sfxBuffers = { eagle: null, poop: null, bom: null, spray: null };

async function loadSfxBuffer(url, key) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        sfxBuffers[key] = await audioCtx.decodeAudioData(arrayBuffer);
    } catch(e) { console.warn("Failed to load audio:", url); }
}

loadSfxBuffer(SOUND_EAGLE_URL, 'eagle');
loadSfxBuffer(SOUND_POOP_URL, 'poop');
loadSfxBuffer(SOUND_BOM_URL, 'bom');
loadSfxBuffer(SOUND_SPRAY_URL, 'spray');

function playSfx(key) {
    if (!sfxBuffers[key]) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const source = audioCtx.createBufferSource();
    source.buffer = sfxBuffers[key];
    source.connect(sfxGain);
    source.start(0);
}

function applyVolumes() {
    levelAudio.volume = musicVolume; winAudio.volume = musicVolume; gameOverAudio.volume = musicVolume;
    sfxGain.gain.value = sfxVolume;
}
applyVolumes(); 

// === Wake Lock API Setup (Houdt scherm aan op Android) ===
let wakeLock = null;
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.warn('Wake Lock error:', err);
        }
    }
}
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible' && gameActive) {
        await requestWakeLock();
    }
});

let gameScale = 1; let lastTime = 0; let gameActive = false; let animationFrameId = null;
let joystickActive = false; let joystickPointerId = null; const keys = {};
let currentLevel = 1; let score = 0; let levelScoreStart = 0; let worldStep = 0; let bossActive = false;
let lastRenderedScore = -1; let lastRenderedLevel = -1; let lastRenderedHp = -1;
let eagleSoundTimer = 0; let nextEagleDelay = 20000 + Math.random() * 30000;
let scrollPhase = 'right'; let scrollWaitUntil = 0; let scrollPhaseWas = 'right'; 
const BURST_SIZE = 5; const BURST_RELOAD_MS = 1000; const BURST_RESET_MS = 2500;
let burstShotsLeft = BURST_SIZE; let reloadUntil = 0; let lastShotTime = 0; 
let fpsHistory = []; let lowFpsFrameCount = 0; let highFpsFrameCount = 0; let reduceQuality = false;
const SPLAT_POOL_SIZE = 120;
const splatPool = Array.from({ length: SPLAT_POOL_SIZE }, () => ({ x: 0, y: 0, vx: 0, vy: 0, radius: 0, life: 0, decay: 0.025, active: false }));
const SPLAT_CANVAS_SIZE = 32; const SPLAT_COLOR = 'rgb(92, 64, 51)';
const splatCanvas = document.createElement('canvas'); splatCanvas.width = SPLAT_CANVAS_SIZE; splatCanvas.height = SPLAT_CANVAS_SIZE;
(function () {
    const sc = splatCanvas.getContext('2d'); const cx = SPLAT_CANVAS_SIZE / 2; const r = 14;
    sc.fillStyle = SPLAT_COLOR; sc.beginPath(); sc.arc(cx, cx, r, 0, Math.PI * 2); sc.fill();
})();
let poops = []; let targets = []; let powerUps = []; let beerGlasses = []; let activeBosses = [];

const player = { x: 100, y: 150, width: 240, height: 100, speed: 15, dx: 0, dy: 0, hp: 100, hitFlash: 0, isDead: false, fallSpeed: 0, facing: 1, activeWeapons: { 'DIARREE': 0, 'POEPBOM': 0 }, shootCooldown: 0 };
const weaponButtons = { 'DIARREE': document.getElementById('btn-DIARREE'), 'POEPBOM': document.getElementById('btn-POEPBOM') };

function loadAsset(key, options = {}) {
    const { onProgress, totalForProgress, timeoutMs = 60000, silentFail = false } = options;
    const item = assets[key];
    if (!item || item.loaded) return Promise.resolve();
    return new Promise((resolve) => {
        const img = new Image();
        if (item.src.startsWith('http')) img.crossOrigin = 'anonymous';
        const silent = silentFail || key.startsWith('clownLoop') || key.startsWith('clownThrow') || key.startsWith('clownDown') || key.startsWith('zwolfRun') || key.startsWith('zwolfThrow') || key.startsWith('zwolfDown') || (/^supC\d+$/.test(key));
        const timeout = setTimeout(() => {
            item.loaded = false;
            if (!silent) addFailedAsset(item.label);
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        }, timeoutMs);
        img.onload = () => {
            clearTimeout(timeout);
            try {
                const maxSize = 2048; let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) { const scale = maxSize / Math.max(w, h); w = Math.round(w * scale); h = Math.round(h * scale); }
                item.canvas.width = w; item.canvas.height = h;
                const aCtx = item.canvas.getContext('2d');
                aCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
                item.loaded = true;
            } catch (e) { item.loaded = false; if (!silent) addFailedAsset(item.label); }
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        };
        img.onerror = () => {
            clearTimeout(timeout); item.loaded = false;
            if (!silent) addFailedAsset(item.label);
            if (onProgress) onProgress(key, totalForProgress);
            resolve();
        };
        img.src = item.src;
    });
}

function updateLevelLoadingProgress(level, current, total) {
    const pct = total ? Math.round((current / total) * 100) : 0;
    if (els.levelLoadingText) els.levelLoadingText.textContent = `Level ${level} laden... ${pct}%`;
    if (els.levelLoadingBar && total) els.levelLoadingBar.style.width = `${(current / total) * 100}%`;
}

function checkIOS() {
    const isIOS = /(iPad|iPhone|iPod)/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;
    if (isIOS && !isStandalone && els.iosModal) els.iosModal.style.display = 'flex';
}

function initDebugUI() {
    if (!els.debugPanel) return; els.debugPanel.style.display = isDebugEnabled() ? 'flex' : 'none';
}

function openExternalUrl(url) { if (!url) return; window.open(url, '_blank', 'noopener,noreferrer'); }

function initExternalLinks() {
    document.querySelectorAll('[data-open-url]').forEach((el) => {
        const url = el.getAttribute('data-open-url');
        const isBeerButton = el.classList && el.classList.contains('paypal-btn');
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); if (isBeerButton) trackEvent('/cta/koop-bier', 'KOOP BIER klik (pointer)'); openExternalUrl(url); }, { passive: false });
        el.addEventListener('click', (e) => { if (performance.now() - lastTouchTs < 600) return; e.preventDefault(); if (isBeerButton) trackEvent('/cta/koop-bier', 'KOOP BIER klik (click)'); openExternalUrl(url); });
    });
}

async function hashStringSHA256(str) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) return '';
    const encoder = new TextEncoder(); const data = encoder.encode(str);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyUnlockCode(input) {
    if (input.toUpperCase() === 'KOWET') {
        alert('Adelaars vliegen altijd hoger! Succes zondag! 🔴🟡');
        return true;
    }
    const hash = await hashStringSHA256(input.trim());
    return hash && hash === UNLOCK_CODE_HASH;
}

function addFailedAsset(label) {
    const container = els.failedAssetsContainer;
    if (container) {
        if (container.innerHTML === "") container.innerHTML = "<strong>Fout bij laden van:</strong><br>";
        const span = document.createElement('span'); span.innerText = "✖ " + label + " "; container.appendChild(span);
    }
}

function updateLoadingBar(current, total) {
    const pct = Math.floor((current / total) * 100);
    if (els.loadingText) els.loadingText.innerText = `Laden... ${pct}%`;
}

function triggerHealVisual() {
    const hb = els.healthContainer;
    if (hb) { hb.classList.remove('heal-animate'); void hb.offsetWidth; hb.classList.add('heal-animate'); }
}

function spawnBoss() {
    bossActive = true;
    const screenRight = (canvas.width / gameScale); const cfg = levelBossConfig[currentLevel] || ['boss0'];
    const visibleWidth = canvas.width / gameScale; const leftMargin = 150; const rightMargin = 300; 
    const leftX = leftMargin; const rightX = visibleWidth - rightMargin; const laneCount = cfg.length;
    
    const laneCenters = cfg.map((_, i) => {
        if (laneCount === 1) return (leftX + rightX) / 2;
        const t = i / (laneCount - 1); return leftX + t * (rightX - leftX);
    });

    activeBosses = cfg.map((t, i) => {
        const bc = getBossConfig(t);
        return {
            type: t, x: screenRight + 100 + (i * 350), y: 680, width: bc.width, height: bc.height,
            hp: (25 + currentLevel * 5) / (cfg.length * 0.8), maxHp: (25 + currentLevel * 5) / (cfg.length * 0.8),
            speed: bc.speed, currentVx: -bc.speed, vxTimer: 0, isHit: false, hitFlash: 0,
            throwTimer: 45 + (i * 15), throwVisualTimer: 0, eatVisualTimer: 0, throwFlip: false, moveFlip: false,
            moveFlipTimer: 0, laneIndex: i, targetX: laneCenters[i],
            ...(t === 'boss0' || t === 'boss1' ? { animTime: 0, downAnimTime: 0 } : {}),
            ...(t === 'boss2' || t === 'boss3' || t === 'boss4' || t === 'boss5' || t === 'boss6' || t === 'boss7' || t === 'boss8' || t === 'boss9' ? { animTime: 0 } : {})
        };
    });

    if (els.bossHealthContainer) els.bossHealthContainer.style.display = 'block'; updateBossUI();
}

function showLevelUp() {
    gameActive = false; levelAudio.pause(); levelAudio.currentTime = 0; winAudio.play().catch(() => {});
    const cfg = levelBossConfig[currentLevel];
    trackEvent('/level/complete/' + currentLevel, 'Level ' + currentLevel + ' gehaald');
    if (els.levelUpText) els.levelUpText.innerText = cfg.map(c => (assets[c] && assets[c].name) || BOSS_NAMES[c] || c).join(" en ") + " verslagen.";
    const levelDelta = Math.max(0, score - levelScoreStart);
    if (els.levelUpScore) els.levelUpScore.textContent = levelDelta > 0 ? `+${levelDelta} punten in dit level` : '';
    const container = els.bossSummaryContainer;
    if (container) {
        container.innerHTML = '';
        cfg.forEach(c => { const img = document.createElement('img'); img.src = assets[bossDownMap[c]]?.src || assets[c]?.src || ''; img.className = 'boss-summary-img'; container.appendChild(img); });
    }
    const isLastLevel = currentLevel >= 10;
    if (isLastLevel) {
        if (els.levelUpScreen) els.levelUpScreen.style.display = 'none';
        if (els.gameOverTitle) els.gameOverTitle.textContent = 'Spel uitgespeeld!';
        if (els.finalScore) els.finalScore.innerText = score;
        if (els.gameOverBossContainer) {
            const bossContainer = els.gameOverBossContainer; bossContainer.innerHTML = '';
            cfg.forEach(c => { const img = document.createElement('img'); img.src = assets[bossDownMap[c]]?.src || assets[c]?.src || ''; img.className = 'boss-summary-img'; bossContainer.appendChild(img); });
        }
        const newHigh = setHighScore(score);
        const highEl = document.getElementById('high-score-value'); if (highEl) highEl.innerText = newHigh;
        const lineEl = document.getElementById('high-score-line'); if (lineEl) lineEl.style.display = 'block';
        if (els.gameOverScreen) els.gameOverScreen.style.display = 'flex';
        onGameOverShown(score);
    } else { if (els.levelUpScreen) els.levelUpScreen.style.display = 'flex'; }
}

function resize() {
    const isMobile = window.innerWidth < 1024 || ('ontouchstart' in window);
    const dpr = Math.min(typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1, MAX_DEVICE_PIXEL_RATIO);
    if (isMobile) {
        const targetRatio = VIRTUAL_WIDTH / VIRTUAL_HEIGHT; const windowRatio = window.innerWidth / window.innerHeight;
        let finalWidth, finalHeight;
        if (windowRatio > targetRatio) { finalHeight = Math.min(window.innerHeight, MOBILE_MAX_CANVAS_HEIGHT); finalWidth = finalHeight * targetRatio; } 
        else { finalWidth = Math.min(window.innerWidth, MOBILE_MAX_CANVAS_WIDTH); finalHeight = finalWidth / targetRatio; }
        canvas.width = Math.round(finalWidth); canvas.height = Math.round(finalHeight);
        canvas.style.width = Math.round(finalWidth) + 'px'; canvas.style.height = Math.round(finalHeight) + 'px';
    } else {
        canvas.width = Math.round(window.innerWidth * dpr); canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
    }
    gameScale = Math.max(0.1, canvas.height / VIRTUAL_HEIGHT);
}

async function requestLandscape() {
    try { const container = els.gameContainer || document.getElementById('game-container'); if (container.requestFullscreen) await container.requestFullscreen(); else if (container.webkitRequestFullscreen) await container.webkitRequestFullscreen(); if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}
}

function drawTinted(spriteCanvas, x, y, w, h, flash) {
    if (!spriteCanvas || !spriteCanvas.width) return;
    const intensity = Math.max(0, Math.min(1, flash / 15));
    if (intensity <= 0) { ctx.drawImage(spriteCanvas, Math.round(x), Math.round(y), Math.round(w), Math.round(h)); return; }
    if (tintCanvas.width !== spriteCanvas.width || tintCanvas.height !== spriteCanvas.height) { tintCanvas.width = spriteCanvas.width; tintCanvas.height = spriteCanvas.height; }
    tintCtx.clearRect(0, 0, tintCanvas.width, tintCanvas.height); tintCtx.drawImage(spriteCanvas, 0, 0);
    tintCtx.globalCompositeOperation = 'source-in'; tintCtx.fillStyle = 'rgba(255, 0, 0, 1)'; tintCtx.fillRect(0, 0, tintCanvas.width, tintCanvas.height); tintCtx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.drawImage(spriteCanvas, Math.round(x), Math.round(y), Math.round(w), Math.round(h)); ctx.globalAlpha = 0.4 + 0.4 * intensity; ctx.drawImage(tintCanvas, Math.round(x), Math.round(y), Math.round(w), Math.round(h)); ctx.restore();
}

function createSplat(x, y, radius, type) {
    const particles = type === 'BOMB' ? 20 : 8;
    for (let i = 0; i < particles; i++) {
        let slot = splatPool.find(s => !s.active);
        if (!slot) {
            const oldest = splatPool.reduce((best, s) => { if (!s.active) return best; return (!best || s.life < best.life) ? s : best; }, null);
            if (oldest) slot = oldest; else continue;
        }
        slot.x = x; slot.y = y; slot.vx = (Math.random() - 0.5) * 12; slot.vy = -Math.random() * 8 - 2;
        slot.radius = Math.random() * (radius / 3) + 2; slot.life = 1.0; slot.decay = 0.025; slot.active = true;
    }
}

function executePoop(type) {
    if(!gameActive || player.isDead) return;
    const now = performance.now();
    if (type === 'NORMAL') {
        if (reloadUntil > 0) { if (now < reloadUntil) return; reloadUntil = 0; burstShotsLeft = BURST_SIZE; }
        if (lastShotTime > 0 && (now - lastShotTime) > BURST_RESET_MS) burstShotsLeft = BURST_SIZE;
        if (burstShotsLeft <= 0) { reloadUntil = now + BURST_RELOAD_MS; if (els.fireBtn) els.fireBtn.classList.add('reloading'); return; }
        burstShotsLeft--; lastShotTime = now;
        playSfx('poop');
    } else if (type === 'POEPBOM') {
        playSfx('bom');
    } else if (type === 'DIARREE') {
        playSfx('spray');
    }
    const px = player.x + 110, py = player.y + 80;
    if(type === 'DIARREE') { for(let i=0; i<4; i++) setTimeout(() => poops.push({ x: px, y: py, radius: 8, speedY: 18, speedX: (i-1.5)*4, type:'NORMAL' }), i * 60); } 
    else if(type === 'POEPBOM') { poops.push({ x: px, y: py, radius: 30, speedY: 9, speedX: 0, type:'BOMB' }); } 
    else { poops.push({ x: px, y: py, radius: 12, speedY: 15, speedX: 0, type:'NORMAL' }); }
}

window.triggerSpecial = (type) => { if (player.activeWeapons[type] > 0) executePoop(type); };

function updateBossUI() {
    const total = activeBosses.reduce((s, b) => s + Math.max(0, b.hp), 0);
    const max = activeBosses.reduce((s, b) => s + b.maxHp, 0);
    const bar = els.bossHealthBar; if (bar) bar.style.width = (total / (max||1) * 100) + '%';
}

function updateBurstUI() {
    const pips = document.getElementById('burst-pips'); const reloadBar = document.getElementById('burst-reload-bar');
    if (!pips || !reloadBar) return;
    const pipEls = pips.querySelectorAll('.burst-pip');
    pipEls.forEach((el, i) => { if (i < burstShotsLeft) el.classList.add('full'); else el.classList.remove('full'); });
    const now = performance.now();
    if (reloadUntil > 0 && now < reloadUntil) {
        const pct = (1 - (reloadUntil - now) / BURST_RELOAD_MS) * 100; reloadBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    } else { reloadBar.style.width = '0%'; }
}

function resetGame() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    player.hp = 100; player.x = 100; player.y = 150; player.isDead = false; player.hitFlash = 0; player.shootCooldown = 0; player.fallSpeed = 0;
    player.activeWeapons = { 'DIARREE': 0, 'POEPBOM': 0 };
    burstShotsLeft = BURST_SIZE; reloadUntil = 0; lastShotTime = 0;
    if (els.fireBtn) els.fireBtn.classList.remove('reloading');
    updateBurstUI(); poops = []; splatPool.forEach(s => { s.active = false; });
    targets = []; powerUps = []; beerGlasses = []; activeBosses = [];
    bossActive = false; worldStep = 0; gameActive = true; eagleSoundTimer = 0; nextEagleDelay = 20000 + Math.random() * 30000;
    if (LEVEL_ENDLESS_SCROLL[currentLevel] === false) { scrollWaitUntil = 0; scrollPhase = LEVEL_SCROLL_START_RIGHT[currentLevel] ? 'left' : 'right'; scrollPhaseWas = scrollPhase; }
    if (els.healthBar) els.healthBar.style.width = '100%';
    if (els.bossHealthContainer) els.bossHealthContainer.style.display = 'none';
    if (els.gameOverScreen) els.gameOverScreen.style.display = 'none';
    if (els.highscoreNameModal) els.highscoreNameModal.style.display = 'none';
    if (els.levelUpScreen) els.levelUpScreen.style.display = 'none';
    ['DIARREE', 'POEPBOM'].forEach(k => { const btn = weaponButtons[k]; if(btn) { btn.classList.remove('active'); btn.querySelector('.timer-overlay').style.height = '0%'; } });
    winAudio.pause(); winAudio.currentTime = 0; gameOverAudio.pause(); gameOverAudio.currentTime = 0;
    const musicUrl = LEVEL_MUSIC_URL[currentLevel] || LEVEL_START_AUDIO_URL; const resolvedMusicUrl = new URL(musicUrl, window.location.href).href;
    if (levelAudio.src !== resolvedMusicUrl) levelAudio.src = musicUrl;
    if (levelAudio.paused) levelAudio.play().catch(() => {});
    lastRenderedScore = -1; lastRenderedLevel = -1; lastRenderedHp = -1;
    trackEvent('/level/start/' + currentLevel, 'Level ' + currentLevel + ' gestart');
}

function getHighScore() { const s = localStorage.getItem(HIGH_SCORE_KEY); return s !== null ? Math.max(0, parseInt(s, 10)) : 0; }
function setHighScore(score) { const current = getHighScore(); if (score > current) { localStorage.setItem(HIGH_SCORE_KEY, String(score)); return score; } return current; }

let pendingHighscoreScore = 0;

async function displayHighscoresInModal() {
    const listEl = els.highscoresList; if (!listEl) return;
    listEl.innerHTML = '<li style="list-style:none;">Laden...</li>';
    try {
        const scores = await getTopScores(50);
        listEl.innerHTML = '';
        if (scores.length === 0) { listEl.innerHTML = '<li style="list-style:none;">Nog geen scores.</li>'; return; }
        scores.forEach((entry, i) => { const li = document.createElement('li'); li.textContent = `${entry.name}: ${entry.score}`; listEl.appendChild(li); });
    } catch (e) { listEl.innerHTML = '<li style="list-style:none;">Scorebord laden mislukt.</li>'; }
}

function onGameOverShown(score) {
    if (score > 0) {
        pendingHighscoreScore = score; if (els.highscoreNameModal) els.highscoreNameModal.style.display = 'flex';
        if (els.highscoreNameInput) { els.highscoreNameInput.value = ''; els.highscoreNameInput.placeholder = 'Je naam'; setTimeout(() => els.highscoreNameInput.focus(), 100); }
    }
}

function update(dt) {
    if(!gameActive) return;
    const canvasWidthScaled = canvas.width / gameScale;
    
    // DELTA TIME FACTOR (1.0 at 60FPS)
    const ts = dt / 16.66667; 
    
    if(player.hitFlash > 0) player.hitFlash -= 1 * ts;
    activeBosses.forEach(b => { if (b.hitFlash > 0) b.hitFlash -= 1 * ts; });
    if(player.isDead) {
        player.fallSpeed += 0.5 * ts; player.y += player.fallSpeed * ts;
        if(player.y > VIRTUAL_HEIGHT) { 
            gameActive = false; levelAudio.pause(); levelAudio.currentTime = 0; gameOverAudio.play().catch(() => {});
            if (els.gameOverBossContainer) els.gameOverBossContainer.innerHTML = '';
            if (els.gameOverTitle) els.gameOverTitle.textContent = 'Eagle down.';
            if (els.finalScore) els.finalScore.innerText = score;
            const newHigh = setHighScore(score);
            const highEl = document.getElementById('high-score-value'); if (highEl) highEl.innerText = newHigh;
            const lineEl = document.getElementById('high-score-line'); if (lineEl) lineEl.style.display = 'block';
            if (els.gameOverScreen) els.gameOverScreen.style.display = 'flex';
            onGameOverShown(score);
        }
        return;
    }
    if(!joystickActive) {
        if(keys['KeyW'] || keys['ArrowUp']) player.dy = -player.speed; else if(keys['KeyS'] || keys['ArrowDown']) player.dy = player.speed; else player.dy = 0;
        if(keys['KeyA'] || keys['ArrowLeft']) { player.dx = -player.speed; player.facing = -1; } else if(keys['KeyD'] || keys['ArrowRight']) { player.dx = player.speed; player.facing = 1; } else player.dx = 0;
        if(keys['Space'] && player.shootCooldown <= 0) { executePoop('NORMAL'); player.shootCooldown = 15; }
    }
    if(player.shootCooldown > 0) player.shootCooldown -= 1 * ts;
    const now = performance.now();
    if (reloadUntil > 0 && now >= reloadUntil) { reloadUntil = 0; burstShotsLeft = BURST_SIZE; if (els.fireBtn) els.fireBtn.classList.remove('reloading'); }
    if (reloadUntil <= 0 && lastShotTime > 0 && (now - lastShotTime) > BURST_RESET_MS) burstShotsLeft = BURST_SIZE;
    updateBurstUI();
    
    eagleSoundTimer += dt;
    if (eagleSoundTimer >= nextEagleDelay) {
        eagleSoundTimer = 0; nextEagleDelay = 20000 + Math.random() * 30000;
        playSfx('eagle');
    }
    let worldSpeedFactor = (player.dx < 0) ? 0.3 : 1.0;
    let allBossesDefeated = false;
    if(activeBosses.length > 0) {
        allBossesDefeated = true;
        for(let i=0; i<activeBosses.length; i++) { if(!activeBosses[i].isHit) { allBossesDefeated = false; break; } }
    }
    const endlessScroll = LEVEL_ENDLESS_SCROLL[currentLevel] !== false;
    const scrollLeft = LEVEL_ENDLESS_SCROLL_LEFT[currentLevel];
    const autoScrollSpeed = BASE_WORLD_SPEED * 0.85;
    let currentEffectiveWorldSpeed;
    if (endlessScroll) {
        currentEffectiveWorldSpeed = (bossActive && !allBossesDefeated) ? 0 : BASE_WORLD_SPEED * worldSpeedFactor;
        if (scrollLeft) {
            const bgKey = LEVEL_BG_KEYS[currentLevel] || 'background'; const bgAsset = assets[bgKey];
            const dw = bgAsset && bgAsset.loaded && bgAsset.canvas.height > 0 ? Math.floor(VIRTUAL_HEIGHT * (bgAsset.canvas.width / bgAsset.canvas.height)) : 2000;
            if (worldStep <= 0) worldStep = 2 * dw;
            worldStep -= currentEffectiveWorldSpeed * ts;
            if (worldStep < 0) worldStep += 2 * dw;
        } else { worldStep += currentEffectiveWorldSpeed * ts; }
    } else {
        const bgKey = LEVEL_BG_KEYS[currentLevel] || 'background'; const bgAsset = assets[bgKey];
        const maxScroll = bgAsset && bgAsset.loaded && bgAsset.canvas.height > 0 ? Math.max(0, Math.floor(VIRTUAL_HEIGHT * (bgAsset.canvas.width / bgAsset.canvas.height)) - canvasWidthScaled) : 9999;
        const scrollWaitMs = LEVEL_SCROLL_WAIT_MS[currentLevel] ?? DEFAULT_SCROLL_WAIT_MS;
        const sx = (worldStep * 0.5);
        if (LEVEL_SCROLL_START_RIGHT[currentLevel] && scrollPhase === 'left' && worldStep === 0 && maxScroll < 9999) worldStep = maxScroll * 2;
        if (scrollPhase === 'right') {
            currentEffectiveWorldSpeed = (bossActive && !allBossesDefeated) ? 0 : autoScrollSpeed; worldStep += currentEffectiveWorldSpeed * ts;
            if (sx >= maxScroll) { worldStep = maxScroll * 2; scrollPhase = 'wait'; scrollWaitUntil = now + scrollWaitMs; scrollPhaseWas = 'right'; }
        } else if (scrollPhase === 'wait') {
            currentEffectiveWorldSpeed = 0; if (now >= scrollWaitUntil) scrollPhase = scrollPhaseWas === 'right' ? 'left' : 'right';
        } else {
            currentEffectiveWorldSpeed = (bossActive && !allBossesDefeated) ? 0 : -autoScrollSpeed; worldStep = Math.max(0, worldStep + currentEffectiveWorldSpeed * ts);
            if (worldStep <= 0) { scrollPhase = 'wait'; scrollWaitUntil = now + scrollWaitMs; scrollPhaseWas = 'left'; }
        }
    }
    
    player.x = Math.max(-50, Math.min(canvasWidthScaled - 100, player.x + player.dx * ts));
    player.y = Math.max(-20, Math.min(VIRTUAL_HEIGHT / 1.8, player.y + player.dy * ts));
    
    if (score !== lastRenderedScore) { if (els.scoreText) els.scoreText.innerText = score; lastRenderedScore = score; }
    if (currentLevel !== lastRenderedLevel) { if (els.levelText) els.levelText.innerText = currentLevel; lastRenderedLevel = currentLevel; }
    const sec = dt / 1000; const WEAPON_DECAY_FACTOR = 2;
    Object.keys(player.activeWeapons).forEach(k => {
        if(player.activeWeapons[k] > 0) {
            player.activeWeapons[k] -= sec * WEAPON_DECAY_FACTOR;
            let btn = weaponButtons[k];
            if(btn) { btn.classList.add('active'); btn.querySelector('.timer-overlay').style.height = (player.activeWeapons[k] / 8 * 100) + '%'; if(player.activeWeapons[k] <= 0) btn.classList.remove('active'); }
        }
    });
    if(Math.random() < 0.012 && powerUps.length < 5) {
        let snackRoll = Math.random(); let selectedSnack = snackRoll < 0.3? SNACKS[0] : (snackRoll < 0.6? SNACKS[1] : (snackRoll < 0.9? SNACKS[2] : SNACKS[3]));
        if (bossActive && !allBossesDefeated) powerUps.push({ x: Math.random() * (canvasWidthScaled - 200) + 100, y: 100 + Math.random() * 500, type: selectedSnack, speed: 0, lifespan: 450, floatPhase: Math.random() * Math.PI * 2 });
        else powerUps.push({ x: canvasWidthScaled + 50, y: 100 + Math.random() * 500, type: selectedSnack, speed: 5, floatPhase: Math.random() * Math.PI * 2 });
    }
    for(let i=powerUps.length-1; i>=0; i--) {
        const p = powerUps[i]; p.x -= (p.speed + currentEffectiveWorldSpeed) * ts;
        if (p.lifespan !== undefined) { p.lifespan -= 1 * ts; if (p.lifespan <= 0) { powerUps.splice(i, 1); continue; } }
        const dx = p.x - (player.x + 120); const dy = p.y - (player.y + 50);
        if((dx*dx + dy*dy) < 8100) {
            if (p.type.type === 'WEAPON') player.activeWeapons[p.type.weapon] = 8;
            else if (p.type.type === 'HEAL_SMALL') { player.hp = Math.min(100, player.hp + 20); triggerHealVisual(); }
            else if (p.type.type === 'HEAL_FULL') { player.hp = 100; triggerHealVisual(); }
            powerUps.splice(i,1);
        } else if(p.x < -100) powerUps.splice(i,1);
    }
    for(let i=beerGlasses.length-1; i>=0; i--) {
        const bg = beerGlasses[i]; bg.x += (bg.vx - currentEffectiveWorldSpeed) * ts; bg.y += bg.vy * ts; bg.vy += 0.45 * ts;
        if(bg.y > VIRTUAL_HEIGHT) { beerGlasses.splice(i,1); continue; }
        if(bg.x > player.x && bg.x < player.x+player.width && bg.y > player.y && bg.y < player.y+player.height) {
            player.hp -= (bg.damage != null ? bg.damage : (5 + (currentLevel-1)*2)); player.hitFlash = 15; beerGlasses.splice(i, 1);
            if(player.hp <= 0) player.isDead = true;
        }
    }
    for(let i=poops.length-1; i>=0; i--) {
        const p = poops[i]; p.y += p.speedY * ts; p.x += p.speedX * ts;
        if(p.y > VIRTUAL_HEIGHT - 65) {
            createSplat(p.x, VIRTUAL_HEIGHT - 50, p.radius, p.type);
            if(p.type === 'BOMB') {
                targets.forEach(t => { if(!t.isHit && Math.abs(p.x-t.x) < 250) { t.isHit = true; t.hitTime = now; score += 200; }});
                activeBosses.forEach(b => { if(!b.isHit && Math.abs(p.x-b.x) < 250) { b.hp -= 4; b.hitFlash = 15; updateBossUI(); }});
            }
            poops.splice(i, 1); continue;
        }
        let hit = false;
        for(let t of targets) if(!t.isHit && p.x > t.x && p.x < t.x+130 && p.y > VIRTUAL_HEIGHT-250) { t.isHit = true; t.hitTime = now; score += 100; hit = true; break; }
        if(!hit) {
            for(let b of activeBosses) {
                if(!b.isHit && p.x > b.x && p.x < b.x+b.width && p.y > b.y && p.y < b.y+b.height) { b.hp -= 1; b.hitFlash = 15; updateBossUI(); hit = true; if(b.hp <= 0) { b.isHit = true; score += 1000; if(activeBosses.every(x=>x.isHit)) setTimeout(showLevelUp, 1500); } break; }
            }
        }
        if(hit) poops.splice(i, 1);
    }
    const hpPct = Math.max(0, Math.min(100, player.hp));
    if (hpPct !== lastRenderedHp) { if (els.healthBar) els.healthBar.style.width = hpPct + '%'; lastRenderedHp = hpPct; }
    if (!bossActive && targets.length < 5 && Math.random() < 0.04) {
        const spawnY = VIRTUAL_HEIGHT - 200;
        const hooliganChance = Math.min(HOOLIGAN_CHANCE_MAX, HOOLIGAN_CHANCE_LEVEL1 + (currentLevel - 1) * ((HOOLIGAN_CHANCE_MAX - HOOLIGAN_CHANCE_LEVEL1) / 10));
        const isHooligan = Math.random() < hooliganChance;
        if (isHooligan) {
            const speedMult = HOOLIGAN_SPEEDMULT_MIN + Math.random() * (HOOLIGAN_SPEEDMULT_MAX - HOOLIGAN_SPEEDMULT_MIN);
            targets.push({
                type: 'hooligan', x: -160, y: spawnY, speed: HOOLIGAN_BASE_SPEED + Math.random() * HOOLIGAN_SPEED_RANGE, speedMult,
                vx: (BASE_WORLD_SPEED + HOOLIGAN_VX_WORLD_OFFSET) * speedMult, wanderTimer: 0, isHit: false, variant: 1, hitTime: 0,
                throwTimer: 0, facing: 1, turnPhase: 0, turning: false, animTime: Math.random() * 8, animSpeed: (0.08 + Math.random() * 0.06) * speedMult
            });
        } else {
            const totalWeight = SUP_A_SPAWN_WEIGHT + SUP_B_SPAWN_WEIGHT + SUP_C_SPAWN_WEIGHT + SUP_D_SPAWN_WEIGHT;
            const r = Math.random() * totalWeight;
            const variant = r < SUP_A_SPAWN_WEIGHT ? 1 : r < SUP_A_SPAWN_WEIGHT + SUP_B_SPAWN_WEIGHT ? 2 : r < SUP_A_SPAWN_WEIGHT + SUP_B_SPAWN_WEIGHT + SUP_C_SPAWN_WEIGHT ? 3 : 4;
            const baseSpeed = SUP_NORMAL_BASE_SPEED + Math.random() * SUP_NORMAL_SPEED_RANGE;
            const speedMult = variant === 1 ? SUP_A_SPEED_MULT : variant === 2 ? SUP_B_SPEED_MULT : variant === 3 ? SUP_C_SPEED_MULT : SUP_D_SPEED_MULT;
            const animFrames = variant === 1 ? 72 : variant === 2 ? 28 : variant === 3 ? 10 : 9;
            const animSpd = variant === 3 ? 0.1 : variant === 4 ? 0.12 : variant === 2 ? 0.12 : 0.2;
            targets.push({ type: 'normal', x: -160, y: spawnY, speed: baseSpeed * speedMult, isHit: false, variant, hitTime: 0, throwTimer: 0, ...((variant === 1 || variant === 2 || variant === 3 || variant === 4) && { animTime: Math.random() * animFrames, animSpeed: animSpd }) });
        }
    }
    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        if (!t.isHit) {
            if (t.type === 'normal') {
                t.x += (t.speed - currentEffectiveWorldSpeed) * ts;
                if (t.variant === 1 || t.variant === 2 || t.variant === 3 || t.variant === 4) t.animTime = (t.animTime || 0) + ((t.animSpeed ?? 0.12) * ts);
            } else if (t.type === 'hooligan') {
                t.wanderTimer = (t.wanderTimer || 0) - (1 * ts);
                if (t.wanderTimer <= 0) {
                    const base = BASE_WORLD_SPEED + 4; const range = 4; const dir = Math.random() < 0.5 ? -1 : 1;
                    const speedMult = t.speedMult ?? 1; t.vx = dir * (base + Math.random() * range) * speedMult;
                    t.wanderTimer = 40 + Math.random() * 60;
                }
                const desiredFacing = (t.vx || 0) >= 0 ? 1 : -1;
                if (!t.turning && desiredFacing !== (t.facing || 1)) { t.turning = true; t.turnPhase = 0; t.facing = desiredFacing; }
                if (t.turning) {
                    t.turnPhase += 0.1 * ts;
                    if (t.turnPhase >= 1) { t.turnPhase = 1; t.turning = false; }
                }
                if (t.throwTimer > 0) t.throwTimer -= 1 * ts;
                if (t.throwTimer <= 0 && Math.random() < 0.015) {
                    t.throwTimer = 100;
                    beerGlasses.push({ x: t.x + 50, y: VIRTUAL_HEIGHT - 150, vx: (player.x - t.x) * 0.018, vy: -22 - (Math.random() * 5), type: 'STONE' });
                }
                t.x += ((t.vx || 0) - currentEffectiveWorldSpeed) * ts;
                const leftLimit = -200; const rightLimit = canvasWidthScaled + 200;
                if (t.x < leftLimit) { t.x = leftLimit; t.vx = Math.abs(t.vx || 0); } else if (t.x > rightLimit) { t.x = rightLimit; t.vx = -Math.abs(t.vx || 0); }
                t.animTime += t.animSpeed * ts;
            }
        } else { t.x -= currentEffectiveWorldSpeed * ts; }
        if (t.isHit && now - t.hitTime > 3000) targets.splice(i, 1);
        else if (t.x < -600 || t.x > canvasWidthScaled + 600) targets.splice(i, 1);
    }
    activeBosses.forEach((b) => {
        b.x -= currentEffectiveWorldSpeed * ts;
        if (!b.isHit) {
            if (b.throwVisualTimer > 0) b.throwVisualTimer -= 1 * ts;
            if (b.eatVisualTimer > 0) b.eatVisualTimer -= 1 * ts;
            const targetX = b.targetX ?? canvasWidthScaled / 2; const dx = targetX - b.x; const deadZone = 40;
            b.vxTimer -= 1 * ts;
            if (b.vxTimer <= 0) {
                if (Math.abs(dx) > deadZone) { b.currentVx = (dx > 0 ? 1 : -1) * b.speed * 1.5 + (Math.random() - 0.5) * b.speed; } 
                else { b.currentVx = (Math.random() - 0.5) * b.speed; }
                b.vxTimer = 40 + Math.random() * 80;
            }
            b.x += b.currentVx * ts;
            const minX = 50; const maxX = canvasWidthScaled - 300;
            if (b.x < minX) { b.x = minX; b.currentVx = Math.abs(b.currentVx); } else if (b.x > maxX) { b.x = maxX; b.currentVx = -Math.abs(b.currentVx); }
            if (b.throwTimer > 0) b.throwTimer -= 1 * ts;
            if (b.throwTimer <= 0) {
                b.throwTimer = 110;
                if (b.type === 'boss5' && Math.random() < 0.3) b.eatVisualTimer = 45; else b.throwVisualTimer = 35;
                const pt = BOSS_PROJECTILE_TYPE[b.type] || 'STONE';
                if (!b.eatVisualTimer || b.eatVisualTimer <= 0) {
                    const bc = getBossConfig(b.type); const count = bc.throwCount ?? 1; const hitChance = bc.throwHitChance ?? 0.7; const timeToTarget = bc.throwTimeToTarget ?? 50; const G = 0.45;
                    for (let i = 0; i < count; i++) {
                        const spawnX = b.x + 100 + (Math.random() - 0.5) * 30; const spawnY = b.y + 100;
                        const aimAtPlayer = Math.random() < hitChance;
                        const spreadX = count > 1 ? (i - (count - 1) / 2) * 25 + (Math.random() - 0.5) * 20 : (Math.random() - 0.5) * 15;
                        const spreadY = (Math.random() - 0.5) * 20;
                        const missX = (Math.random() - 0.5) * 400; const missY = (Math.random() - 0.5) * 200;
                        const targetX = player.x + player.width / 2 + (aimAtPlayer ? spreadX : missX);
                        const targetY = player.y + player.height / 2 + (aimAtPlayer ? spreadY : missY);
                        const pdx = targetX - spawnX; const pdy = targetY - spawnY; const t = Math.max(20, timeToTarget);
                        beerGlasses.push({ x: spawnX, y: spawnY, vx: pdx / t, vy: pdy / t - 0.5 * G * t, type: pt, damage: bc.throwDamage ?? 6 });
                    }
                }
            }
        }
        if (b.type === 'boss0') { if (b.isHit) b.downAnimTime = Math.min((b.downAnimTime || 0) + (0.6 * ts), CLOWN_DOWN_KEYS.length); else b.animTime = (b.animTime || 0) + (0.25 * ts); }
        else if (b.type === 'boss1') { if (b.isHit) b.downAnimTime = Math.min((b.downAnimTime || 0) + (0.5 * ts), ZWOLF_DOWN_KEYS.length); else b.animTime = (b.animTime || 0) + (0.3 * ts); }
        else if (SIMPLE_ANIM_BOSSES.has(b.type)) { if (!b.isHit) b.animTime = (b.animTime || 0) + (0.25 * ts); }
    });
    for (const s of splatPool) {
        if (!s.active) continue;
        s.x -= currentEffectiveWorldSpeed * ts; s.y += s.vy * ts; s.vy += 0.5 * ts;
        if (s.y > VIRTUAL_HEIGHT - 50) { s.y = VIRTUAL_HEIGHT - 50; s.vy = 0; }
        s.life -= s.decay * ts; if (s.life <= 0) s.active = false;
    }
    if(!bossActive && (score - levelScoreStart) >= POINTS_TO_BOSS) spawnBoss();
}

function findNearestLoadedFrame(keys, index) {
    if (assets[keys[index]]?.loaded) return keys[index];
    for (let d = 1; d < keys.length; d++) {
        if (index - d >= 0 && assets[keys[index - d]]?.loaded) return keys[index - d];
        if (index + d < keys.length && assets[keys[index + d]]?.loaded) return keys[index + d];
    }
    return keys.find(k => assets[k]?.loaded) || keys[0];
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(gameScale, gameScale);
    const bgKey = LEVEL_BG_KEYS[currentLevel] || 'background';
    const bgAsset = assets[bgKey];
    if (bgAsset && bgAsset.loaded && bgAsset.canvas.height > 0) {
        const dw = Math.floor(VIRTUAL_HEIGHT * (bgAsset.canvas.width / bgAsset.canvas.height));
        const endless = LEVEL_ENDLESS_SCROLL[currentLevel] !== false;
        const scrollLeft = LEVEL_ENDLESS_SCROLL_LEFT[currentLevel];
        let sx;
        if (endless) {
            sx = scrollLeft ? Math.floor(worldStep * 0.5) : Math.floor((worldStep * 0.5) % dw);
            ctx.drawImage(bgAsset.canvas, Math.round(-sx), 0, Math.round(dw), Math.round(VIRTUAL_HEIGHT));
            ctx.drawImage(bgAsset.canvas, Math.round(dw - sx - 1), 0, Math.round(dw + 1), Math.round(VIRTUAL_HEIGHT));
        } else {
            const maxScroll = Math.max(0, dw - (canvas.width / gameScale));
            sx = Math.min(Math.floor(worldStep * 0.5), maxScroll);
            ctx.drawImage(bgAsset.canvas, Math.round(-sx), 0, Math.round(dw), Math.round(VIRTUAL_HEIGHT));
        }
    }
    for (let t of targets) {
        const isHooligan = t.type === 'hooligan';
        const halfW = isHooligan ? 75 : 65; const fullH = isHooligan ? 200 : 195;
        const baseFacing = isHooligan ? (t.facing || 1) : 1;
        let scaleX = baseFacing;
        if (isHooligan && t.turning) scaleX = baseFacing * Math.cos((t.turnPhase || 0) * Math.PI);
        ctx.save();
        const hitYOffset = (t.isHit && t.variant === 3) ? 125 : (t.isHit && (t.variant === 1 || t.variant === 2 || t.variant === 4)) ? 65 : (t.isHit ? 28 : 0);
        const runYOffset = (!t.isHit && t.variant === 3) ? SUP_C_RUN_Y_OFFSET : 0;
        ctx.translate(Math.round(t.x + halfW), Math.round(VIRTUAL_HEIGHT - 50 + hitYOffset + runYOffset));
        ctx.scale(scaleX, 1);
        let sk;
        if (t.isHit) {
            sk = isHooligan ? 'hooliHit' : (t.variant === 4 ? 'supDDown' : t.variant === 3 ? 'supCDown' : t.variant === 2 ? 'supBDown' : 'normalHit');
        } else {
            if (isHooligan) {
                if (t.throwTimer > 70) sk = HOOLI_THROW_KEYS[Math.min(5, Math.floor((100 - t.throwTimer) / 5))];
                else sk = HOOLI_RUN_KEYS[Math.floor(t.animTime || 0) % HOOLI_RUN_KEYS.length];
            } else {
                const runKeys = t.variant === 4 ? SUP_D_KEYS : t.variant === 3 ? SUP_C_KEYS : t.variant === 2 ? SUP_B_KEYS : SUP_ARENT_KEYS;
                sk = runKeys[Math.floor(t.animTime || 0) % runKeys.length];
            }
        }
        let drawSk = sk;
        if (assets[sk] && !assets[sk].loaded && SUP_ARENT_KEYS.includes(sk)) drawSk = SUP_ARENT_KEYS.find(k => assets[k].loaded) || sk;
        if (!assets[drawSk]?.loaded && SUP_B_KEYS.includes(sk)) drawSk = SUP_B_KEYS.find(k => assets[k].loaded) || sk;
        if (!assets[drawSk]?.loaded && SUP_C_KEYS.includes(sk)) drawSk = findNearestLoadedFrame(SUP_C_KEYS, Math.floor(t.animTime || 0) % SUP_C_KEYS.length);
        if (assets[drawSk] && assets[drawSk].loaded) {
            let sizeScaleX = 1, sizeScaleY = 1;
            if (drawSk === 'normalHit') { sizeScaleX = SUP_A_HIT_SCALE_X; sizeScaleY = SUP_A_HIT_SCALE_Y; }
            else if (drawSk === 'supBDown') { sizeScaleX = SUP_B_HIT_SCALE_X; sizeScaleY = SUP_B_HIT_SCALE_Y; }
            else if (drawSk === 'supCDown') { sizeScaleX = SUP_C_HIT_SCALE_X; sizeScaleY = SUP_C_HIT_SCALE_Y; }
            else if (drawSk === 'supDDown') { sizeScaleX = SUP_D_HIT_SCALE_X; sizeScaleY = SUP_D_HIT_SCALE_Y; }
            else if (drawSk === 'hooliHit') { sizeScaleX = HOOLI_HIT_SCALE_X; sizeScaleY = HOOLI_HIT_SCALE_Y; }
            else {
                if (SUP_ARENT_KEYS.includes(drawSk)) { sizeScaleX = SUP_A_SCALE_X; sizeScaleY = SUP_A_SCALE_Y; }
                else if (SUP_B_KEYS.includes(drawSk)) { sizeScaleX = SUP_B_SCALE_X; sizeScaleY = SUP_B_SCALE_Y; }
                else if (SUP_C_KEYS.includes(drawSk)) { sizeScaleX = SUP_C_SCALE_X; sizeScaleY = SUP_C_SCALE_Y; }
                else if (SUP_D_KEYS.includes(drawSk)) { sizeScaleX = SUP_D_SCALE_X; sizeScaleY = SUP_D_SCALE_Y; }
                else if (isHooligan) { sizeScaleX = HOOLI_SCALE_X; sizeScaleY = HOOLI_SCALE_Y; }
            }
            const drawHalfW = halfW * sizeScaleX; const drawFullH = fullH * sizeScaleY;
            ctx.drawImage(assets[drawSk].canvas, Math.round(-drawHalfW), Math.round(-drawFullH), Math.round(drawHalfW * 2), Math.round(drawFullH));
        }
        ctx.restore();
    }
    for (let b of activeBosses) {
        ctx.save();
        const bc = getBossConfig(b.type); const groundY = VIRTUAL_HEIGHT - 15;
        const drawW = b.width * bc.scale * (b.isHit ? (bc.downScale ?? 1) : 1);
        const drawH = b.height * bc.scale * (b.isHit ? (bc.downScale ?? 1) : 1);
        const centerY = b.isHit ? groundY - drawH / 2 + (bc.downOffset ?? 0) : groundY - drawH / 2 + (bc.offset ?? 0);
        ctx.translate(Math.round(b.x + b.width / 2), Math.round(centerY));
        if (bc.mirrorFlip ? !((b.currentVx || 0) > 0 && !b.isHit) : ((b.currentVx || 0) > 0 && !b.isHit)) ctx.scale(-1, 1);
        let sk;
        if (b.type === 'boss0') {
            if (b.isHit) sk = CLOWN_DOWN_KEYS[Math.min(Math.floor(b.downAnimTime || 0), CLOWN_DOWN_KEYS.length - 1)];
            else if (b.throwVisualTimer > 0) sk = CLOWN_THROW_KEYS[Math.min(Math.floor((1 - (b.throwVisualTimer / 35)) * CLOWN_THROW_KEYS.length), CLOWN_THROW_KEYS.length - 1)];
            else sk = CLOWN_LOOP_KEYS[Math.floor(b.animTime || 0) % CLOWN_LOOP_KEYS.length];
            if (!assets[sk] || !assets[sk].loaded) sk = b.isHit ? CLOWN_DOWN_KEYS[0] : (b.throwVisualTimer > 0 ? CLOWN_THROW_KEYS[0] : CLOWN_LOOP_KEYS[0]);
        } else if (b.type === 'boss1') {
            if (b.isHit) sk = ZWOLF_DOWN_KEYS[Math.min(Math.floor(b.downAnimTime || 0), ZWOLF_DOWN_KEYS.length - 1)];
            else if (b.throwVisualTimer > 0) sk = ZWOLF_THROW_KEYS[Math.min(Math.floor((1 - (b.throwVisualTimer / 35)) * ZWOLF_THROW_KEYS.length), ZWOLF_THROW_KEYS.length - 1)];
            else sk = ZWOLF_RUN_KEYS[Math.floor(b.animTime || 0) % ZWOLF_RUN_KEYS.length];
            if (!assets[sk] || !assets[sk].loaded) sk = b.isHit ? ZWOLF_DOWN_KEYS[0] : (b.throwVisualTimer > 0 ? ZWOLF_THROW_KEYS[0] : ZWOLF_RUN_KEYS[0]);
        } else if (b.type === 'boss5') {
            if (b.isHit) sk = 'boss5Down'; else if (b.eatVisualTimer > 0 && assets['boss5Eat']) sk = 'boss5Eat';
            else if (b.throwVisualTimer > 0) sk = DOM_THROW_KEYS[Math.min(Math.floor((1 - (b.throwVisualTimer / 35)) * DOM_THROW_KEYS.length), DOM_THROW_KEYS.length - 1)];
            else sk = DOM_RUN_KEYS[Math.floor(b.animTime || 0) % DOM_RUN_KEYS.length];
            if (!assets[sk] || !assets[sk].loaded) sk = b.isHit ? 'boss5Down' : (b.throwVisualTimer > 0 ? (DOM_THROW_KEYS[0] || 'boss5') : (DOM_RUN_KEYS[0] || 'boss5'));
        } else if (GENERIC_BOSS_ANIM_KEYS[b.type]) {
            const keys = GENERIC_BOSS_ANIM_KEYS[b.type];
            if (b.isHit) sk = keys.down;
            else if (b.throwVisualTimer > 0 && keys.throw && keys.throw.length) sk = keys.throw[Math.min(Math.floor((1 - (b.throwVisualTimer / 35)) * keys.throw.length), keys.throw.length - 1)];
            else if (keys.run && keys.run.length) sk = keys.run[Math.floor(b.animTime || 0) % keys.run.length];
            else sk = keys.down;
            if (!assets[sk] || !assets[sk].loaded) sk = b.isHit ? keys.down : (b.throwVisualTimer > 0 ? ((keys.throw && keys.throw[0]) || keys.down) : ((keys.run && keys.run[0]) || keys.down));
        } else {
            sk = b.isHit ? bossDownMap[b.type] : (b.throwVisualTimer > 0 ? b.type + 'Throw' : (b.eatVisualTimer > 0 ? 'boss5Eat' : b.type));
        }
        if (assets[sk] && assets[sk].loaded) drawTinted(assets[sk].canvas, -drawW / 2, -drawH / 2, drawW, drawH, b.hitFlash);
        ctx.restore();
    }
    for (let bg of beerGlasses) {
        ctx.font = `${PROJECTILE_FONT_SIZE[bg.type] ?? 32}px Arial`; ctx.textAlign = 'center';
        const icon = bg.type === 'GLOVE' ? '🧤' : (bg.type === 'BALL' ? '⚽' : (bg.type === 'FRIES' ? '🍟' : (bg.type === 'BRICK' ? '🧱' : (bg.type === 'STICK' ? '🪵' : (bg.type === 'DIAMOND' ? '♦️' : (bg.type === 'TORCH' ? '🔥' : '🪨'))))));
        ctx.fillText(icon, Math.round(bg.x), Math.round(bg.y));
    }

    const t = performance.now() * 0.001;
    for (const p of powerUps) {
        const drawY = p.y + Math.sin(t * 0.9 + (p.floatPhase ?? 0)) * 12;
        ctx.beginPath(); ctx.arc(Math.round(p.x), Math.round(drawY), 28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 240, 255, 0.35)'; ctx.fill();
        ctx.strokeStyle = 'rgba(180, 210, 255, 0.85)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = '36px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.type.icon, Math.round(p.x), Math.round(drawY));
    }
    
    let splatsDrawn = 0;
    for (const s of splatPool) {
        if (!s.active) continue;
        if (reduceQuality && splatsDrawn >= MAX_SPLATS_WHEN_REDUCED) break;
        ctx.save(); ctx.globalAlpha = s.life;
        ctx.drawImage(splatCanvas, 0, 0, SPLAT_CANVAS_SIZE, SPLAT_CANVAS_SIZE, Math.round(s.x - s.radius), Math.round(s.y - s.radius), Math.round(2 * s.radius), Math.round(2 * s.radius));
        ctx.restore(); splatsDrawn++;
    }
    const poopImg = assets.poopProjectile;
    for (const p of poops) {
        const size = 2 * p.radius;
        if (poopImg && poopImg.loaded) ctx.drawImage(poopImg.canvas, Math.round(p.x - size / 2), Math.round(p.y - size / 2), Math.round(size), Math.round(size));
        else { ctx.font = `${p.radius * 2.5}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💩', Math.round(p.x), Math.round(p.y)); }
    }
    ctx.save();
    const hoverY = player.isDead ? 0 : Math.sin(t * 0.8) * 8; const hoverX = player.isDead ? 0 : Math.cos(t * 0.5) * 4;
    ctx.translate(Math.round(player.x + player.width / 2 + hoverX), Math.round(player.y + player.height / 2 + hoverY));
    const pulse = player.isDead ? 1 : 1 + 0.02 * Math.sin(t * 0.6); ctx.scale(pulse, pulse);
    ctx.rotate(player.isDead ? Math.PI : Math.max(-0.12, Math.min(0.12, player.dx * 0.012 + player.dy * 0.008)));
    if (player.facing === -1) ctx.scale(-1, 1);
    const isMoving = !player.isDead && (player.dx !== 0 || player.dy !== 0);
    const frameIndex = Math.floor((performance.now() / 100) % 4);
    const eagleAnimKeys = ['eagleAnim1', 'eagleAnim2', 'eagleAnim3', 'eagleAnim4'];
    const eagleAsset = player.isDead ? assets.eagle : (isMoving ? assets[eagleAnimKeys[frameIndex]] : assets.eagle);
    if (eagleAsset && eagleAsset.loaded) drawTinted(eagleAsset.canvas, -player.width/2, -player.height/2, player.width, player.height, player.hitFlash);
    ctx.restore(); ctx.restore();
    if(gameActive) animationFrameId = requestAnimationFrame(gameLoop);
}

function gameLoop(t) {
    if (!lastTime) lastTime = t;
    const dt = Math.min(50, Math.max(0, t - lastTime)); lastTime = t;
    if (dt > 0) {
        fpsHistory.push(1000 / dt); if (fpsHistory.length > FPS_HISTORY_LEN) fpsHistory.shift();
        const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
        if (avgFps < FPS_LOW_THRESHOLD) { lowFpsFrameCount++; highFpsFrameCount = 0; if (lowFpsFrameCount >= LOW_FPS_FRAMES_TO_REDUCE) reduceQuality = true; } 
        else if (avgFps > FPS_RECOVER_THRESHOLD) { highFpsFrameCount++; lowFpsFrameCount = 0; if (highFpsFrameCount >= HIGH_FPS_FRAMES_TO_RECOVER) reduceQuality = false; } 
        else { lowFpsFrameCount = 0; highFpsFrameCount = 0; }
    }
    try { update(dt); render(); } 
    catch (err) { console.error('Game loop error:', err); gameActive = false; if (animationFrameId) cancelAnimationFrame(animationFrameId); if (els.startScreen) els.startScreen.style.display = 'flex'; }
}

window.addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); }, { passive: false });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

const moveJoystick = (input) => {
    if (!els.joystickContainer || !els.joystickKnob) return;
    const r = els.joystickContainer.getBoundingClientRect();
    const dx = input.clientX - (r.left + r.width/2), dy = input.clientY - (r.top + r.height/2);
    const dist = Math.sqrt(dx*dx + dy*dy), m = Math.min(dist, 50), a = Math.atan2(dy, dx);
    els.joystickKnob.style.transform = `translate(${Math.cos(a)*m}px, ${Math.sin(a)*m}px)`;
    player.dx = Math.cos(a) * (m/50) * player.speed; player.dy = Math.sin(a) * (m/50) * player.speed;
    if(player.dx !== 0) player.facing = player.dx > 0 ? 1 : -1;
};
const endJoystick = (pointerId) => {
    if (pointerId != null && pointerId !== joystickPointerId) return;
    joystickActive = false; joystickPointerId = null;
    if (els.joystickKnob) els.joystickKnob.style.transform = 'translate(0,0)';
    player.dx = 0; player.dy = 0;
};

if (els.joystickContainer) {
    els.joystickContainer.addEventListener('pointerdown', (e) => { e.preventDefault(); joystickActive = true; joystickPointerId = e.pointerId; els.joystickContainer.setPointerCapture?.(e.pointerId); moveJoystick(e); }, { passive: false });
}
window.addEventListener('pointermove', (e) => { if (joystickActive && e.pointerId === joystickPointerId) moveJoystick(e); });
window.addEventListener('pointerup', (e) => endJoystick(e.pointerId));
window.addEventListener('pointercancel', (e) => endJoystick(e.pointerId));

let lastTouchTs = 0;
window.addEventListener('touchstart', () => { lastTouchTs = performance.now(); }, { passive: true });

const bind = (id, fn) => {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); fn(); }, { passive: false });
    el.addEventListener('click', (e) => { if (performance.now() - lastTouchTs < 600) return; e.preventDefault(); fn(); });
};

// Derby Countdown Logica
function updateDerbyCountdown() {
    if (!els.derbyCountdown) return;
    const derbyDate = new Date('April 5, 2026 14:30:00').getTime();
    const now = new Date().getTime();
    const distance = derbyDate - now;

    if (distance < 0) {
        els.derbyCountdown.innerHTML = "DE DERBY IS BEGONNEN!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    els.derbyCountdown.innerHTML = `Derby start in: ${days}d ${hours}u ${minutes}m ${seconds}s`;
}
setInterval(updateDerbyCountdown, 1000);
updateDerbyCountdown();

// WhatsApp Deel Logica
if (els.whatsappShareBtn) {
    els.whatsappShareBtn.addEventListener('click', () => {
        const text = `Ik ben aan het warmdraaien voor de IJsselderby! 🦅💩 Mijn score in Harley the Game is ${score}. Kan jij beter? Speel het hier: ${window.location.href}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });
}

bind('start-btn', async () => { 
    if(gameActive) return; 
    
    if (audioCtx.state === 'suspended') audioCtx.resume();
    await requestWakeLock(); // Vraag Wake Lock aan zodra de speler op Start klikt
    
    silentUnlockAudio.currentTime = 0; silentUnlockAudio.play().catch(() => {});
    levelAudio.play().catch(() => {}); levelAudio.pause(); levelAudio.currentTime = 0;
    winAudio.play().catch(() => {}); winAudio.pause(); winAudio.currentTime = 0;
    gameOverAudio.play().catch(() => {}); gameOverAudio.pause(); gameOverAudio.currentTime = 0;

    await requestLandscape();
    await loadLevelAssets(1, { els, updateLevelProgress: updateLevelLoadingProgress, addFailedAsset });
    resize(); setTimeout(resize, 300);
    score = 0; levelScoreStart = 0; currentLevel = 1;
    if (els.startScreen) els.startScreen.style.display = 'none';
    resetGame(); lastTime = performance.now(); animationFrameId = requestAnimationFrame(gameLoop);
});
bind('restart-btn', async () => { 
    score = 0; levelScoreStart = 0; currentLevel = 1; 
    await loadLevelAssets(1, { els, updateLevelProgress: updateLevelLoadingProgress, addFailedAsset }); 
    resize(); setTimeout(resize, 300);
    resetGame(); lastTime = performance.now(); animationFrameId = requestAnimationFrame(gameLoop); 
});
bind('back-to-start-btn', () => {
    if (els.gameOverScreen) els.gameOverScreen.style.display = 'none';
    if (els.highscoreNameModal) els.highscoreNameModal.style.display = 'none';
    if (els.startScreen) els.startScreen.style.display = 'flex';
});
bind('continue-btn', async () => { 
    if (currentLevel >= 10) return;
    currentLevel++; levelScoreStart = score; 
    await loadLevelAssets(currentLevel, { els, updateLevelProgress: updateLevelLoadingProgress, addFailedAsset }); 
    resize(); setTimeout(resize, 300);
    resetGame(); lastTime = performance.now(); animationFrameId = requestAnimationFrame(gameLoop); 
});
bind('fire-btn', () => executePoop('NORMAL'));
bind('btn-DIARREE', () => window.triggerSpecial('DIARREE'));
bind('btn-POEPBOM', () => window.triggerSpecial('POEPBOM'));
bind('info-btn', () => { if (els.infoModal) els.infoModal.style.display = 'flex'; });
bind('close-info-btn', () => { if (els.infoModal) els.infoModal.style.display = 'none'; });
bind('settings-btn', () => {
    if (!els.settingsModal) return; els.settingsModal.style.display = 'flex';
    const musicVal = Math.round(musicVolume * 100); const sfxVal = Math.round(sfxVolume * 100);
    requestAnimationFrame(() => {
        if (els.musicSlider) els.musicSlider.value = String(musicVal);
        if (els.sfxSlider) els.sfxSlider.value = String(sfxVal);
        if (els.musicValue) els.musicValue.textContent = musicVal + '%';
        if (els.sfxValue) els.sfxValue.textContent = sfxVal + '%';
    });
});
bind('close-game-btn', () => exitToStartScreen({ attemptClose: true }));
bind('close-settings-btn', () => { if (els.settingsModal) els.settingsModal.style.display = 'none'; });
bind('highscores-btn', () => { if (els.highscoresModal) { els.highscoresModal.style.display = 'flex'; displayHighscoresInModal(); } });
bind('close-highscores-btn', () => { if (els.highscoresModal) els.highscoresModal.style.display = 'none'; });
function submitHighscoreName() {
    const name = (els.highscoreNameInput && els.highscoreNameInput.value.trim()) || 'Anoniem';
    if (pendingHighscoreScore > 0) submitGlobalScore(name, pendingHighscoreScore).catch(() => {});
    if (els.highscoreNameModal) els.highscoreNameModal.style.display = 'none';
    if (els.highscoreNameInput) els.highscoreNameInput.value = '';
}
bind('highscore-name-submit', submitHighscoreName);
if (els.highscoreNameInput) els.highscoreNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitHighscoreName(); } });
bind('ios-later-btn', () => { if (els.iosModal) els.iosModal.style.display = 'none'; });
if (els.unlockCodeBtn) {
    els.unlockCodeBtn.addEventListener('click', async () => {
        const input = (prompt('Voer de geheime code in om alle levels te ontgrendelen:') || '').trim();
        if (!input) return;
        if (await verifyUnlockCode(input)) { try { localStorage.setItem(UNLOCK_ALL_LEVELS_KEY, '1'); } catch (e) {} alert('Alle levels zijn ontgrendeld. De testknoppen zijn nu beschikbaar.'); initDebugUI(); } 
        else alert('Ongeldige code.');
    });
}

function isStandaloneDisplayMode() { try { if (window.navigator && window.navigator.standalone) return true; if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true; } catch (e) {} return false; }

function stopAllAudio() {
    [levelAudio, winAudio, gameOverAudio].forEach(a => { try { a.pause(); } catch (e) {} });
}

function exitToStartScreen(options = {}) {
    gameActive = false;
    if (animationFrameId != null) { try { cancelAnimationFrame(animationFrameId); } catch (e) {} animationFrameId = null; }
    
    // Geef Wake Lock weer netjes vrij als de speler stopt
    if (wakeLock !== null) { wakeLock.release().then(() => wakeLock = null); }

    stopAllAudio();
    [els.infoModal, els.settingsModal, els.highscoresModal, els.highscoreNameModal, els.gameOverScreen, els.levelUpScreen, els.levelLoadingOverlay].forEach(el => { if(el) el.style.display = 'none'; });
    if (els.gameContainer) els.gameContainer.style.display = '';
    if (els.startScreen) els.startScreen.style.display = 'flex';
    if (options.attemptClose && !isStandaloneDisplayMode()) { try { window.close(); } catch (e) {} } else if (options.attemptClose && isStandaloneDisplayMode()) { try { alert('Sluiten kan op iOS niet via het kruisje. Swipe omhoog (App Switcher) om de app te sluiten.'); } catch (e) {} }
}

async function startLevel(n) {
    if (!isDebugEnabled()) return;
    await requestWakeLock();
    await loadLevelAssets(n, { els, updateLevelProgress: updateLevelLoadingProgress, addFailedAsset });
    currentLevel = n; levelScoreStart = (n - 1) * POINTS_TO_BOSS; score = levelScoreStart; resetGame();
    if (els.startScreen) els.startScreen.style.display = 'none';
    lastTime = performance.now(); animationFrameId = requestAnimationFrame(gameLoop);
}

async function forceLevel(n) {
    if (!isDebugEnabled()) return;
    await requestWakeLock();
    await loadLevelAssets(n, { els, updateLevelProgress: updateLevelLoadingProgress, addFailedAsset });
    currentLevel = n; levelScoreStart = (n - 1) * POINTS_TO_BOSS; score = levelScoreStart + POINTS_TO_BOSS; resetGame(); 
    if (els.startScreen) els.startScreen.style.display = 'none';
    lastTime = performance.now(); animationFrameId = requestAnimationFrame(gameLoop);
}

if (isDebugEnabled()) { window.forceLevel = forceLevel; window.startLevel = startLevel; }

window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('Service Worker registratie mislukt:', err));
    }

    preloadCore({ updateLoadingBar: (current, total) => updateLoadingBar(current, total), addFailedAsset, els, bgImg });
    checkIOS(); initDebugUI(); initExternalLinks();
    if (els.musicSlider) {
        els.musicSlider.value = String(Math.round(musicVolume * 100));
        els.musicSlider.addEventListener('input', () => { musicVolume = Number(els.musicSlider.value) / 100; try { localStorage.setItem(VOLUME_STORAGE_KEY_MUSIC, String(musicVolume)); } catch (e) {} applyVolumes(); if (els.musicValue) els.musicValue.textContent = els.musicSlider.value + '%'; });
        if (els.musicValue) els.musicValue.textContent = Math.round(musicVolume * 100) + '%';
    }
    if (els.sfxSlider) {
        els.sfxSlider.value = String(Math.round(sfxVolume * 100));
        els.sfxSlider.addEventListener('input', () => { sfxVolume = Number(els.sfxSlider.value) / 100; try { localStorage.setItem(VOLUME_STORAGE_KEY_SFX, String(sfxVolume)); } catch (e) {} applyVolumes(); if (els.sfxValue) els.sfxValue.textContent = els.sfxSlider.value + '%'; });
        if (els.sfxValue) els.sfxValue.textContent = Math.round(sfxVolume * 100) + '%';
    }
    document.querySelectorAll('.debug-start-level-btn[data-level]').forEach((btn) => {
        const handler = async (e) => { e.preventDefault(); if (!isDebugEnabled()) return; const lvl = Number(btn.getAttribute('data-level')); if (Number.isFinite(lvl)) await startLevel(lvl); };
        btn.addEventListener('pointerdown', handler, { passive: false }); btn.addEventListener('click', (e) => { e.preventDefault(); if (performance.now() - lastTouchTs < 600) return; handler(e); });
    });
    document.querySelectorAll('.debug-level-btn[data-level]').forEach((btn) => {
        const handler = async (e) => { e.preventDefault(); if (!isDebugEnabled()) return; const lvl = Number(btn.getAttribute('data-level')); if (Number.isFinite(lvl)) await forceLevel(lvl); };
        btn.addEventListener('pointerdown', handler, { passive: false }); btn.addEventListener('click', (e) => { if (performance.now() - lastTouchTs < 600) return; handler(e); });
    });
}, { once: true });
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => { setTimeout(resize, 300); });
window.addEventListener('pageshow', () => { setTimeout(resize, 100); });
resize();

})();
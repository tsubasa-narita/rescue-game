/**
 * おうちにGO！レスキュー隊 - サウンド＆エフェクト
 */

let soundEnabled = true;

export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
}

export function isSoundEnabled() {
    return soundEnabled;
}

// Web Audio API context (lazy init)
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

/**
 * SOS アラーム音
 */
export function playSosSound() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two-tone alarm
    for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now + i * 0.4);
        osc.frequency.setValueAtTime(600, now + i * 0.4 + 0.2);
        gain.gain.setValueAtTime(0.08, now + i * 0.4);
        gain.gain.exponentialDecayToValueAtTime?.(0.01, now + i * 0.4 + 0.35);
        gain.gain.setValueAtTime(0.08, now + i * 0.4);
        gain.gain.linearRampToValueAtTime(0.01, now + i * 0.4 + 0.38);
        osc.start(now + i * 0.4);
        osc.stop(now + i * 0.4 + 0.4);
    }
}

/**
 * シャキーン！変身完了音
 */
export function playTransformSound() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Rising sparkle
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
    });

    // Dramatic chord at end
    setTimeout(() => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(1047, ctx.currentTime);
        osc2.frequency.setValueAtTime(1318, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.8);
        osc2.stop(ctx.currentTime + 0.8);
    }, 450);
}

/**
 * アイテムゲット音
 */
export function playItemSound() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.1);
    osc.frequency.setValueAtTime(1100, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
}

/**
 * ファンファーレ音
 */
export function playFanfareSound() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Triumphant fanfare melody
    const melody = [
        { freq: 523, time: 0, dur: 0.15 },
        { freq: 659, time: 0.15, dur: 0.15 },
        { freq: 784, time: 0.3, dur: 0.15 },
        { freq: 1047, time: 0.45, dur: 0.5 },
        { freq: 784, time: 0.7, dur: 0.15 },
        { freq: 1047, time: 0.85, dur: 0.7 },
    ];

    melody.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.12, now + time);
        gain.gain.linearRampToValueAtTime(0.01, now + time + dur);
        osc.start(now + time);
        osc.stop(now + time + dur);
    });
}

/**
 * ボタン押下音
 */
export function playButtonSound() {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
}

// ===========================================
// パーティクルエフェクト
// ===========================================
let particleCanvas = null;
let particleCtx = null;
let particles = [];
let animFrameId = null;

function initParticleCanvas() {
    particleCanvas = document.getElementById('particle-canvas');
    if (!particleCanvas) return;
    particleCtx = particleCanvas.getContext('2d');
    resizeParticleCanvas();
    window.addEventListener('resize', resizeParticleCanvas);
}

function resizeParticleCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth * window.devicePixelRatio;
    particleCanvas.height = window.innerHeight * window.devicePixelRatio;
    particleCanvas.style.width = window.innerWidth + 'px';
    particleCanvas.style.height = window.innerHeight + 'px';
    if (particleCtx) {
        particleCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 8 + 4;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = Math.random() * -12 - 4;
        this.gravity = 0.3;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.008;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 10;
        // Shape: 0=circle, 1=star, 2=rect
        this.shape = Math.floor(Math.random() * 3);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= this.decay;
        this.rotation += this.rotSpeed;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        if (this.shape === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 1) {
            drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
        } else {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();
    }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
}

function animateParticles() {
    if (!particleCtx || !particleCanvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    particleCtx.clearRect(0, 0, w, h);

    particles = particles.filter((p) => p.life > 0);
    particles.forEach((p) => {
        p.update();
        p.draw(particleCtx);
    });

    if (particles.length > 0) {
        animFrameId = requestAnimationFrame(animateParticles);
    } else {
        particleCtx.clearRect(0, 0, w, h);
        animFrameId = null;
    }
}

/**
 * 紙吹雪エフェクト
 */
export function startCelebration() {
    initParticleCanvas();
    if (!particleCtx) return;

    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D', '#C084FC', '#FB923C'];
    const w = window.innerWidth;

    // Burst from multiple points
    for (let burst = 0; burst < 3; burst++) {
        const bx = w * (0.2 + burst * 0.3);
        for (let i = 0; i < 30; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(bx, window.innerHeight * 0.3, color));
        }
    }

    if (!animFrameId) {
        animateParticles();
    }
}

/**
 * キラキラエフェクト（小規模）
 */
export function startSparkle(x, y) {
    initParticleCanvas();
    if (!particleCtx) return;

    const colors = ['#FFD700', '#FFF176', '#FFEB3B', '#FFC107', '#FF9800'];
    for (let i = 0; i < 15; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const p = new Particle(x || window.innerWidth / 2, y || window.innerHeight / 2, color);
        p.speedX = (Math.random() - 0.5) * 6;
        p.speedY = (Math.random() - 0.5) * 6;
        p.gravity = 0.1;
        particles.push(p);
    }

    if (!animFrameId) {
        animateParticles();
    }
}

/**
 * ボタンのアニメーション
 */
export function animateButtonPress(button) {
    button.classList.add('btn-pressed');
    setTimeout(() => button.classList.remove('btn-pressed'), 300);
}

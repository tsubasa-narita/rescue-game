/**
 * おうちにGO！レスキュー隊 - ゲームデータ
 */

const BASE = import.meta.env.BASE_URL;

// デフォルトのチェックポイント
const DEFAULT_CHECKPOINTS = [
    { id: 'cp1', name: 'コンビニ', hint: 'つぎは コンビニ だよ！', item: 'おにぎり', found: 'コンビニに ついたよ！', itemName: 'おにぎり' },
    { id: 'cp2', name: 'おおきな木', hint: 'つぎは おおきな木 だよ！', item: 'どんぐり', found: 'おおきな木に ついたよ！', itemName: 'どんぐり' },
    { id: 'cp3', name: 'こうえん', hint: 'つぎは こうえん だよ！', item: 'おはな', found: 'こうえんに ついたよ！', itemName: 'おはな' }
];

export function getCheckpoints() {
    try {
        const saved = localStorage.getItem('rescue-checkpoints');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load checkpoints', e);
    }
    return [...DEFAULT_CHECKPOINTS];
}

export function saveCheckpoints(list) {
    try {
        localStorage.setItem('rescue-checkpoints', JSON.stringify(list));
    } catch (e) {
        console.error('Failed to save checkpoints', e);
    }
}

export function createCheckpoint(name) {
    const id = 'cp_' + Date.now();
    return {
        id: id,
        name: name,
        hint: `つぎは ${name} だよ！`,
        item: 'キラキラ',
        found: `${name}に ついたよ！`,
        itemName: 'キラキラ'
    };
}

// キャラクターのセリフ
export const DIALOGUES = {
    sos: (name) =>
        `うわ〜ん！おうちに かえるみちが わからなく なっちゃった！<br>${name}たいいん、いますぐ たすけに きてくれないと、ずっと おうちに はいれないよ〜！`,
    dispatch: (name) => `${name}たいいん、しゅつどう！`,
    shoesDone: 'シャキーン！✨ へんしん かんりょう！ かっこいい レスキューたいいんだ！',
    missionStart: 'さあ、レスキューくんを たすけに いこう！',
    goalReached: (name) =>
        `${name}たいいん、ありがとう！たすかったよ！<br>きみは さいこうの レスキューたいいんだ！⭐`,
};

// 日替わりシール定義
export const STICKERS = [
    { id: 'star', emoji: '⭐', name: 'キラキラぼし', color: '#FFD700' },
    { id: 'heart', emoji: '💖', name: 'ハートシール', color: '#FF69B4' },
    { id: 'rainbow', emoji: '🌈', name: 'にじシール', color: '#FF6B6B' },
    { id: 'rocket', emoji: '🚀', name: 'ロケットシール', color: '#4FC3F7' },
    { id: 'crown', emoji: '👑', name: 'おうかんシール', color: '#FFC107' },
    { id: 'medal', emoji: '🏅', name: 'メダルシール', color: '#FF8F00' },
    { id: 'diamond', emoji: '💎', name: 'ダイヤシール', color: '#00BCD4' },
];

// 今日のシールを取得
export function getTodaySticker() {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    return STICKERS[dayOfYear % STICKERS.length];
}

// シール帳の保存
export function saveSticker(sticker) {
    const stickers = loadStickers();
    const today = new Date().toISOString().split('T')[0];
    // 同じ日のシールは上書き
    const existing = stickers.findIndex((s) => s.date === today);
    const entry = { date: today, stickerId: sticker.id, emoji: sticker.emoji, name: sticker.name };
    if (existing >= 0) {
        stickers[existing] = entry;
    } else {
        stickers.push(entry);
    }
    localStorage.setItem('rescue-stickers', JSON.stringify(stickers));
}

export function loadStickers() {
    try {
        return JSON.parse(localStorage.getItem('rescue-stickers') || '[]');
    } catch {
        return [];
    }
}

// 名前の保存・取得
export function saveName(name) {
    localStorage.setItem('rescue-name', name);
}

export function loadName() {
    return localStorage.getItem('rescue-name') || '';
}

// 進捗保存
export function saveGameProgress(phase, checkpointIndex) {
    const today = new Date().toISOString().split('T')[0];
    const data = { date: today, phase, checkpointIndex };
    localStorage.setItem('rescue-progress', JSON.stringify(data));
}

export function loadGameProgress() {
    try {
        const data = JSON.parse(localStorage.getItem('rescue-progress'));
        if (data) {
            const today = new Date().toISOString().split('T')[0];
            if (data.date === today) return data;
        }
    } catch {
        // ignore
    }
    return null;
}

export function resetGameProgress() {
    localStorage.removeItem('rescue-progress');
}

// おうちの場所（Latitude, Longitude）
export function saveHomeLocation(lat, lng) {
    const data = { lat, lng };
    localStorage.setItem('rescue-home', JSON.stringify(data));
}

export function loadHomeLocation() {
    try {
        const data = JSON.parse(localStorage.getItem('rescue-home'));
        if (data && data.lat && data.lng) return data;
    } catch {
        // ignore
    }
    return null;
}

export function hasHomeLocation() {
    // Legacy: originally used for map coords, now we check for 'home' image in photo list if needed
    // But for now let's keep it as is or update logic later.
    return !!loadHomeLocation();
}

// 写真データの保存・読み込み
// id: 'cp1', 'cp2', 'cp3', 'home'
export function saveCheckpointImage(id, dataUrl) {
    try {
        localStorage.setItem(`rescue-photo-${id}`, dataUrl);
    } catch (e) {
        console.error('Failed to save image', e);
        alert('写真の保存に失敗しました。容量オーバーの可能性があります。');
    }
}

export function loadCheckpointImage(id) {
    return localStorage.getItem(`rescue-photo-${id}`);
}

export function hasCheckpointImage(id) {
    return !!localStorage.getItem(`rescue-photo-${id}`);
}

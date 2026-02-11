/**
 * おうちにGO！レスキュー隊 - ゲームデータ
 */

const BASE = import.meta.env.BASE_URL;

// チェックポイント定義
export const CHECKPOINTS = [
    {
        id: 'cp1',
        name: 'コンビニ',
        icon: '🏪',
        item: '🔑',
        itemName: 'カギのパーツ１',
        hint: 'あ！あのおみせの ちかくに ヒントが あるかも！',
        found: 'やった！カギのパーツ みつけた！',
    },
    {
        id: 'cp2',
        name: 'おおきな木',
        icon: '🌳',
        item: '🔑',
        itemName: 'カギのパーツ２',
        hint: 'おおきなきの したを さがしてみよう！',
        found: 'すごい！もう１つ パーツ ゲット！',
    },
    {
        id: 'cp3',
        name: 'こうえん',
        icon: '⛲',
        item: '🔑',
        itemName: 'カギのパーツ３',
        hint: 'あと すこし！こうえんの ちかくだよ！',
        found: 'カギが かんせい！おうちの ドアを あけよう！',
    },
];

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

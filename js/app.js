/* 한글 그림 학습지 — 낱말·문장을 넣으면 읽어 주고, 그림을 붙여 A4 학습지로 만든다. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NOTO = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.047/svg/emoji_u';
const LS_KEY = 'hangul-picture-worksheet-v1';
const SPEAKER = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const GUIDES = {
  card: '그림을 보고 소리 내어 읽어 보세요.',
  trace: '흐린 글씨를 따라 쓰고, 빈칸에 한 번 더 써 보세요.',
  match: '그림과 알맞은 글을 선으로 이어 보세요.',
};
const SAMPLES = {
  fruit: ['사과', '포도', '바나나', '수박', '딸기를 먹어요', '나는 달콤한 복숭아를 제일 좋아합니다'],
  animal: ['강아지', '고양이', '토끼', '나비가 날아요', '곰이 잠을 자요', '코끼리는 긴 코로 물을 마십니다'],
  school: ['학교', '연필', '가방', '책을 읽어요', '친구와 축구를 해요', '나는 아침에 일어나서 학교에 갑니다'],
  feel: ['사랑', '기뻐요', '슬퍼요', '고맙습니다', '친구야 미안해', '오늘은 기분이 좋아서 노래를 불렀어요'],
};
const DEFAULT = {
  title: '한글 읽기 · 쓰기', layout: 'card', cols: 2, imgStyle: 'noto', pixelN: 32,
  voice: 'female', rate: 0.85, showName: true, showQR: false, font: 'gothic',
  guide: {}, seed: 1, multi: true, fontScale: 1, wrap: true, volume: 1, zoom: 'fit', traceMode: 'sentence', items: [],
};

let state = structuredClone(DEFAULT);
let viewer = false;
let uid = 1;
const newId = () => 'i' + Date.now().toString(36) + (uid++);

/* ══════════ 낱말 → 그림 찾기 ══════════ */
const NOUN = {
  엄마: '👩', 아빠: '👨', 어머니: '👩', 아버지: '👨', 할머니: '👵', 할아버지: '👴', 아기: '👶', 동생: '🧒', 형: '👦', 누나: '👧', 언니: '👧', 오빠: '👦',
  친구: '🧑‍🤝‍🧑', 선생님: '🧑‍🏫', 가족: '👪', 의사: '🧑‍⚕️', 경찰: '👮', 소방관: '🧑‍🚒', 요리사: '🧑‍🍳', 농부: '🧑‍🌾', 아이: '🧒', 어린이: '🧒', 사람: '🧑',
  학교: '🏫', 집: '🏠', 병원: '🏥', 공원: '🏞️', 놀이터: '🛝', 가게: '🏪', 시장: '🏪', 도서관: '📚', 교실: '🏫', 화장실: '🚻',
  나무: '🌳', 꽃: '🌸', 해: '☀️', 해님: '☀️', 달: '🌙', 달님: '🌙', 별: '⭐', 비: '🌧️', 눈: '❄️', 구름: '☁️', 바람: '🌬️', 하늘: '🌤️', 바다: '🌊', 산: '⛰️', 강: '🏞️', 숲: '🌲', 무지개: '🌈', 불: '🔥', 물: '💧', 돌: '🪨', 잎: '🍃', 씨앗: '🌱', 새싹: '🌱',
  봄: '🌷', 여름: '🏖️', 가을: '🍁', 겨울: '⛄', 아침: '🌅', 저녁: '🌇', 밤: '🌃', 낮: '🌞',
  밥: '🍚', 우유: '🥛', 빵: '🍞', 과자: '🍪', 사탕: '🍬', 떡: '🍡', 김밥: '🍙', 국수: '🍜', 라면: '🍜', 고기: '🍖', 달걀: '🥚', 계란: '🥚', 김치: '🥬', 주스: '🧃', 아이스크림: '🍦', 케이크: '🎂', 피자: '🍕', 치킨: '🍗',
  사과: '🍎', 포도: '🍇', 바나나: '🍌', 수박: '🍉', 딸기: '🍓', 복숭아: '🍑', 귤: '🍊', 배: '🍐', 토마토: '🍅', 당근: '🥕', 오이: '🥒', 감자: '🥔', 고구마: '🍠', 옥수수: '🌽', 호박: '🎃', 버섯: '🍄', 레몬: '🍋', 참외: '🍈', 체리: '🍒', 파인애플: '🍍',
  강아지: '🐶', 개: '🐕', 고양이: '🐱', 토끼: '🐰', 곰: '🐻', 새: '🐦', 물고기: '🐟', 나비: '🦋', 호랑이: '🐯', 사자: '🦁', 코끼리: '🐘', 기린: '🦒', 원숭이: '🐵', 돼지: '🐷', 소: '🐮', 말: '🐴', 닭: '🐔', 병아리: '🐥', 오리: '🦆', 개구리: '🐸', 거북이: '🐢', 뱀: '🐍', 쥐: '🐭', 여우: '🦊', 늑대: '🐺', 양: '🐑', 펭귄: '🐧', 고래: '🐳', 상어: '🦈', 벌: '🐝', 개미: '🐜', 거미: '🕷️', 달팽이: '🐌', 다람쥐: '🐿️', 사슴: '🦌', 악어: '🐊', 문어: '🐙', 공룡: '🦖', 무당벌레: '🐞',
  책: '📖', 연필: '✏️', 가방: '🎒', 공책: '📓', 가위: '✂️', 풀: '🌿', 자: '📏', 색연필: '🖍️', 크레파스: '🖍️', 종이: '📄', 편지: '✉️',
  공: '⚽', 축구: '⚽', 야구: '⚾', 농구: '🏀', 줄넘기: '🤸', 그네: '🛝', 인형: '🧸', 장난감: '🧸', 풍선: '🎈', 선물: '🎁', 로봇: '🤖', 연: '🪁',
  자동차: '🚗', 차: '🚗', 버스: '🚌', 기차: '🚆', 비행기: '✈️', 자전거: '🚲', 택시: '🚕', 트럭: '🚚', 오토바이: '🏍️', 지하철: '🚇', 로켓: '🚀', 소방차: '🚒', 구급차: '🚑',
  모자: '🧢', 신발: '👟', 옷: '👕', 바지: '👖', 치마: '👗', 양말: '🧦', 장갑: '🧤', 안경: '👓', 우산: '☂️', 시계: '⏰', 전화: '📞', 전화기: '📞', 컴퓨터: '💻', 텔레비전: '📺', 침대: '🛏️', 의자: '🪑', 문: '🚪', 열쇠: '🔑', 컵: '🥤', 숟가락: '🥄', 칫솔: '🪥', 비누: '🧼', 수건: '🧻', 거울: '🪞', 돈: '💰', 사진: '📷', 그림: '🖼️', 음악: '🎵', 노래: '🎵', 피아노: '🎹', 북: '🥁',
  사랑: '❤️', 마음: '💗', 꿈: '💭', 생일: '🎂', 손: '✋', 발: '🦶', 귀: '👂', 코: '👃', 입: '👄', 이: '🦷', 머리: '🧑', 눈사람: '⛄', 한글: '🔤', 지구: '🌍', 우주: '🌌', 왕: '🤴', 공주: '👸', 왕자: '🤴', 천사: '👼', 도깨비: '👹', 유령: '👻',
};
const VERB = [
  [/^먹/, '🍽️'], [/^(마시|마셔|마셨|마십)/, '🥤'], [/^(달리|달려|달렸|달립|뛰|뜁)/, '🏃'], [/^(걷|걸어|걸었)/, '🚶'],
  [/^(자요|잡니다|잤|잠을|잠이|자고|잠자)/, '😴'], [/^읽/, '📖'], [/^(써요|씁니다|썼|쓰고|쓰는|쓰기)/, '✍️'],
  [/^(놀아|놉니다|놀았|놀고|놀이)/, '🤸'], [/^웃/, '😄'], [/^(울어|웁니다|울었|울고)/, '😢'], [/^(노래|불러|불렀|부릅)/, '🎤'], [/^춤/, '💃'],
  [/^(그려|그렸|그립니다|그리는)/, '🎨'], [/^씻/, '🧼'], [/^(좋아|사랑)/, '❤️'], [/^공부/, '📚'], [/^요리/, '🍳'], [/^수영/, '🏊'],
  [/^청소/, '🧹'], [/^운동/, '🤸'], [/^(안녕|인사)/, '👋'], [/^(고마|고맙|감사)/, '🙏'], [/^미안/, '🙇'],
  [/^(기뻐|기쁘|기쁩|즐거|즐겁|행복|신나|신났)/, '😊'], [/^(슬퍼|슬프|슬픕)/, '😢'], [/^(화나|화가|화났)/, '😠'], [/^(무서|무섭)/, '😨'],
  [/^(아파|아프|아픕)/, '🤒'], [/^(추워|춥)/, '🥶'], [/^(더워|덥)/, '🥵'], [/^(맛있|맛나)/, '😋'], [/^(일어나|일어났)/, '⏰'],
  [/^앉/, '🪑'], [/^(날아|납니다|날았)/, '🕊️'], [/^(피었|피어|핍니다)/, '🌸'], [/^(갑니다|가요|갔어|갔습|가고)/, '🚶'], [/^(타요|탑니다|탔)/, '🚌'],
];
const JOSA = ['으로부터', '에서부터', '에게서', '한테서', '이라고', '이라는', '으로써', '으로서', '입니다', '이에요', '처럼', '보다', '부터', '까지', '에게', '한테', '에서', '으로', '이랑', '하고', '라고', '이나', '이며', '이다', '예요', '들이', '들은', '들을', '들', '은', '는', '이', '가', '을', '를', '에', '의', '와', '과', '로', '도', '만', '랑', '께', '야', '아'];
const STOP = new Set(['나', '너', '저', '우리', '그', '저희', '것', '위', '아래', '안', '밖', '속', '옆', '앞', '뒤', '때', '수', '더', '잘', '못', '참', '아주', '매우', '제일', '가장', '오늘', '내일', '어제', '그리고', '그래서', '하지만', '정말', '너무', '해요', '합니다', '했어요', '했습니다', '하고', '있어요', '있습니다', '없어요', '같이', '함께']);

const idx = new Map();
function addIdx(key, ch, score, order) {
  if (!key) return;
  let m = idx.get(key);
  if (!m) idx.set(key, m = new Map());
  const cur = m.get(ch);
  if (!cur || cur.score < score) m.set(ch, { ch, score, order });
}
(window.EMOJI_KO || []).forEach(([ch, label, tags], i) => {
  addIdx(label, ch, 100, i);
  const words = label.split(' ');
  if (words.length > 1) {
    addIdx(words.join(''), ch, 90, i);
    addIdx(words[words.length - 1], ch, 70, i);
    words.slice(0, -1).forEach(w => addIdx(w, ch, 30, i));
  }
  tags.forEach(t => addIdx(t, ch, 60, i));
});
const rank = m => [...m.values()].sort((a, b) => b.score - a.score || a.order - b.order).map(e => e.ch);

function tokens(text) { return (text.match(/[가-힣A-Za-z0-9]+/g) || []); }
function stems(tok) {
  const out = [tok];
  for (const j of JOSA) if (tok.length > j.length && tok.endsWith(j)) out.push(tok.slice(0, -j.length));
  return [...new Set(out)].sort((a, b) => b.length - a.length);
}
/** 낱말 하나에 맞는 그림 후보. { key: 찾은 낱말, list: [이모지…], verb } */
function matchToken(tok) {
  for (const s of stems(tok)) {
    if (STOP.has(s)) return null;
    const list = [];
    if (NOUN[s]) list.push(NOUN[s]);
    if (s.length > 1 || s === tok) { const m = idx.get(s); if (m) list.push(...rank(m)); }
    if (list.length) return { key: s, list: [...new Set(list)] };
  }
  for (const [re, ch] of VERB) if (re.test(tok)) return { key: tok, list: [ch], verb: true };
  return null;
}
/** 글 전체에서 그림 후보를 찾는다. 이름씨(명사)가 움직씨(동사)보다 먼저. */
function findEmoji(text) {
  const hits = tokens(text).map(matchToken).filter(Boolean);
  const ordered = [...hits.filter(h => !h.verb), ...hits.filter(h => h.verb)];
  const list = [];
  ordered.forEach(h => list.push(h.list[0]));
  ordered.forEach(h => list.push(...h.list.slice(1, 8)));
  const heads = [], keys = []; // 글에 나온 순서대로, 낱말마다 하나씩
  hits.forEach(h => { if (!heads.includes(h.list[0])) { heads.push(h.list[0]); keys.push(h.key); } });
  return { list: [...new Set(list)], key: ordered[0]?.key || '', heads, keys, nouns: hits.filter(h => !h.verb).map(h => h.key) };
}
/** 문장에서 따로 떼어 쓸 핵심 낱말(이름씨 먼저, 없으면 긴 마디) */
function keyWords(text) {
  let ws = findEmoji(text).nouns;
  if (!ws.length) ws = tokens(text).filter(t => t.length >= 2).slice(0, 2);
  return [...new Set(ws)].slice(0, 4);
}
/** 고르기 창에서 쓰는 넓은 찾기(포함하는 이름까지). */
function searchEmoji(q) {
  q = q.trim();
  if (!q) return [];
  const out = [...findEmoji(q).list];
  const more = [];
  for (const [key, m] of idx) if (key.includes(q) && key !== q) more.push(...m.values());
  more.sort((a, b) => b.score - a.score || a.order - b.order).forEach(e => out.push(e.ch));
  return [...new Set(out)].slice(0, 48);
}
/** 사진을 찾을 때 쓸 낱말 후보(아는 낱말 먼저). */
function photoKeys(text, knownOnly) {
  const known = [], rest = [];
  tokens(text).slice(0, 5).forEach(tok => {
    const m = matchToken(tok);
    if (m && !m.verb) known.push(m.key);
    else stems(tok).slice(0, 2).forEach(s => { if (!STOP.has(s) && s.length > 1) rest.push(s); });
  });
  return [...new Set(knownOnly ? known : [...known, ...rest])].slice(0, 8);
}

const emojiHex = ch => Array.from(ch).map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f').join('_');
const notoUrl = ch => NOTO + emojiHex(ch) + '.svg';
function glyphUrl(ch) { // 구글 그림을 못 받았을 때: 기기 글꼴로 그린다
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  x.font = '200px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(ch, 128, 140);
  return c.toDataURL('image/png');
}

/* ── 위키백과·위키미디어 공용 사진 ── */
const WIKI = 'https://ko.wikipedia.org/w/api.php?format=json&origin=*&action=query&';
const COMMONS = 'https://commons.wikimedia.org/w/api.php?format=json&origin=*&action=query&';
async function getJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); }
async function wikiPhotos(keys) { // 낱말마다 위키백과 대표 사진 하나씩
  if (!keys.length) return [];
  const j = await getJSON(WIKI + 'redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=' + encodeURIComponent(keys.join('|')));
  const pages = Object.values(j.query?.pages || {});
  const map = {};
  [...(j.query?.normalized || []), ...(j.query?.redirects || [])].forEach(r => { map[r.from] = r.to; });
  const out = [];
  for (const k of keys) {
    let t = k; for (let n = 0; n < 3 && map[t]; n++) t = map[t];
    const p = pages.find(p => p.title === t && p.thumbnail);
    if (p && !out.some(o => o.src === p.thumbnail.source)) out.push({ src: p.thumbnail.source, credit: p.title });
  }
  return out;
}
async function photoSearch(q) {
  const enc = encodeURIComponent(q);
  const [w, c] = await Promise.allSettled([
    getJSON(WIKI + 'generator=search&gsrlimit=10&prop=pageimages&piprop=thumbnail&pithumbsize=500&gsrsearch=' + enc),
    getJSON(COMMONS + 'generator=search&gsrnamespace=6&gsrlimit=14&prop=imageinfo&iiprop=url&iiurlwidth=500&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q)),
  ]);
  const out = [];
  if (w.status === 'fulfilled') Object.values(w.value.query?.pages || {}).sort((a, b) => a.index - b.index)
    .forEach(p => p.thumbnail && out.push({ src: p.thumbnail.source, credit: p.title }));
  if (c.status === 'fulfilled') Object.values(c.value.query?.pages || {}).sort((a, b) => a.index - b.index)
    .forEach(p => p.imageinfo?.[0]?.thumburl && out.push({ src: p.imageinfo[0].thumburl, credit: p.title.replace(/^File:/, '') }));
  const seen = new Set();
  return out.filter(p => !seen.has(p.src) && seen.add(p.src));
}

/* ══════════ 도트 그림 만들기 ══════════ */
function loadImg(src, cors) {
  return new Promise((res, rej) => {
    const im = new Image();
    if (cors && !src.startsWith('data:')) im.crossOrigin = 'anonymous';
    im.onload = () => res(im); im.onerror = () => rej(new Error('load'));
    im.src = src;
  });
}
const pixelCache = new Map();
/** 그림을 n×n 칸으로 줄이고 색을 정리한 뒤, 칸이 또렷하게 크게 키운다. */
async function pixelate(src, n) {
  const key = n + '|' + src;
  if (pixelCache.has(key)) return pixelCache.get(key);
  const im = await loadImg(src, true);
  const w0 = im.naturalWidth || 128, h0 = im.naturalHeight || 128;
  const r = Math.min(n / w0, n / h0);
  const w = Math.max(1, Math.round(w0 * r)), h = Math.max(1, Math.round(h0 * r));
  const s = document.createElement('canvas'); s.width = w; s.height = h;
  const sx = s.getContext('2d', { willReadFrequently: true });
  sx.imageSmoothingQuality = 'high';
  sx.drawImage(im, 0, 0, w, h);
  const d = sx.getImageData(0, 0, w, h); // 다른 곳 그림이 막혀 있으면 여기서 오류
  const q = 36; // 색 단계 정리
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i + 3] < 110) { d.data[i + 3] = 0; continue; }
    d.data[i + 3] = 255;
    for (let k = 0; k < 3; k++) d.data[i + k] = Math.min(255, Math.round(d.data[i + k] / q) * q);
  }
  sx.putImageData(d, 0, 0);
  const scale = Math.max(1, Math.round(768 / Math.max(w, h)));
  const b = document.createElement('canvas'); b.width = w * scale; b.height = h * scale;
  const bx = b.getContext('2d');
  bx.imageSmoothingEnabled = false;
  bx.drawImage(s, 0, 0, b.width, b.height);
  const url = b.toDataURL('image/png');
  pixelCache.set(key, url);
  return url;
}

const baseSrc = img => !img ? '' : img.kind === 'emoji' ? notoUrl(img.ch) : img.src;
async function setImg(el, item, img) {
  if (!img) return;
  const base = baseSrc(img);
  const token = el._t = (el._t || 0) + 1;
  const put = src => { if (el._t === token) el.src = src; };
  if (item.pixel) {
    try { put(await pixelate(base, state.pixelN)); return; } catch (e) {
      if (img.kind === 'emoji') { try { put(await pixelate(glyphUrl(img.ch), state.pixelN)); return; } catch (e2) { /* 아래로 */ } }
    }
  }
  if (img.kind === 'emoji') el.onerror = () => { el.onerror = null; el.src = glyphUrl(img.ch); };
  put(base);
}
function picEl(item, img, cls = 'pic') {
  const el = document.createElement('img');
  el.className = cls; el.alt = item.text || '그림'; el.decoding = 'async';
  setImg(el, item, img);
  return el;
}

/* ══════════ 그림 자동으로 붙이기 ══════════ */
const classify = text => {
  const t = (text || '').trim(), n = Array.from(t).length;
  if (!t) return 'pic';
  if (!/\s/.test(t) && n <= 7) return 'word';
  return n <= 16 ? 'short' : 'long';
};
const TYPE_NAME = { word: '낱말', short: '짧은 문장', long: '긴 문장', pic: '그림만' };
const MAX_PICS = 4;
/** 낱말은 그림 하나, 문장은(설정에 따라) 낱말마다 작은 그림 여러 개 */
const wantCount = item => (state.multi && classify(item.text) !== 'word') ? MAX_PICS : 1;
function emojiPicks(item) {
  const f = findEmoji(item.text), n = wantCount(item);
  return (n > 1 ? f.heads.slice(0, n) : f.list.slice(0, 1)).map(ch => ({ kind: 'emoji', ch }));
}
async function autoImage(item) {
  const text = item.text, n = wantCount(item);
  const still = () => item.text === text && item.auto;
  const photos = async () => {
    try {
      let keys = n > 1 ? photoKeys(text, true) : [], max = n;
      if (!keys.length) { keys = photoKeys(text); max = 1; }
      const ps = (await wikiPhotos(keys)).slice(0, max);
      if (ps.length && still()) { item.imgs = ps.map(p => ({ kind: 'url', src: p.src, credit: p.credit })); return true; }
    } catch (e) { /* 인터넷이 없으면 그림 없이 둔다 */ }
    return false;
  };
  if (state.imgStyle === 'photo' && await photos()) return;
  if (!still()) return;
  const em = emojiPicks(item);
  if (em.length) { item.imgs = em; return; }
  if (state.imgStyle !== 'photo' && await photos()) return;
  if (still()) item.imgs = [];
}
/** 예전에 저장한 학습지(그림 하나짜리)를 지금 모양으로 맞춘다 */
function norm(st) {
  st.items.forEach(it => { if (!Array.isArray(it.imgs)) it.imgs = it.img ? [it.img] : []; delete it.img; });
  return st;
}

async function addTexts(lines) {
  const fresh = lines.map(s => s.trim()).filter(Boolean)
    .map(text => ({ id: newId(), text, imgs: [], auto: true, pixel: state.imgStyle === 'pixel' }));
  if (!fresh.length) return;
  state.items.push(...fresh);
  fresh.forEach(it => { it.imgs = emojiPicks(it); });
  render();
  await Promise.all(fresh.filter(it => !it.imgs.length || state.imgStyle === 'photo').map(autoImage));
  render();
}

/* ══════════ 읽어 주기 ══════════ */
const synth = window.speechSynthesis;
let voices = [];
const FEM = /heami|sun-?hi|yuna|sora|ji-?min|seo-?hyeon|soon-?bok|yu-?jin|female|여성|여자|google 한국의/i;
const MAL = /in-?joon|bong-?jin|gook-?min|hyun-?su|male|남성|남자/i;
const gender = v => FEM.test(v.name) ? 'f' : MAL.test(v.name) ? 'm' : 'u';
function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices().filter(v => /^ko/i.test(v.lang))
    .sort((a, b) => /natural/i.test(b.name) - /natural/i.test(a.name));
  voiceNote();
}
function pickVoice(want) {
  const w = want === 'male' ? 'm' : 'f';
  const exact = voices.find(v => gender(v) === w);
  if (exact) return { voice: exact, pitch: 1, real: true };
  const any = voices[0] || null;
  const g = any ? gender(any) : 'u';
  return { voice: any, pitch: w === 'm' ? 0.5 : (g === 'm' ? 1.7 : 1.15), real: false };
}
function voiceNote() {
  const el = $('#voiceNote'); if (!el) return;
  if (!synth) { el.textContent = '이 브라우저는 읽어 주기를 지원하지 않아요. 크롬이나 엣지에서 열어 주세요.'; return; }
  const { voice, real } = pickVoice(state.voice);
  const who = state.voice === 'male' ? '남자' : '여자';
  if (!voice) el.textContent = '한국어 목소리를 찾는 중이에요. 소리가 나지 않으면 크롬이나 엣지에서 열어 주세요.';
  else if (real) el.textContent = `${who} 목소리: ${voice.name}`;
  else el.textContent = `이 기기에는 ${who} 한국어 목소리가 없어서 「${voice.name}」의 음높이를 바꿔 읽어요. 엣지(Edge)에서 열면 실제 남녀 목소리를 쓸 수 있어요.`;
}
let speakToken = 0, keep = null;
function markSpeaking(id) {
  $$('.speaking').forEach(e => e.classList.remove('speaking'));
  if (id) $$(`[data-id="${id}"]`).forEach(e => e.classList.add('speaking'));
}
function stopSpeak() {
  speakToken++;
  if (synth) synth.cancel();
  markSpeaking(null);
  $('#btnSpeakAll').textContent = '▶ 전체 듣기';
}
function speakText(text, my, done) {
  const parts = (text.match(/[^.!?\n]+[.!?]*/g) || [text]).map(s => s.trim()).filter(Boolean);
  let k = 0;
  const go = () => {
    if (my !== speakToken) return;
    if (k >= parts.length) return done();
    const u = keep = new SpeechSynthesisUtterance(parts[k++]);
    const { voice, pitch } = pickVoice(state.voice);
    u.lang = 'ko-KR'; if (voice) u.voice = voice;
    u.pitch = pitch; u.rate = state.rate; u.volume = state.volume;
    u.onend = go; u.onerror = go;
    synth.speak(u);
  };
  go();
}
function speakItems(list, all) {
  if (!synth) { toast('이 브라우저는 읽어 주기를 지원하지 않아요.'); return; }
  list = list.filter(it => it.text.trim());
  stopSpeak();
  if (!list.length) return;
  const my = speakToken;
  if (all) $('#btnSpeakAll').textContent = '■ 멈추기';
  let i = 0;
  const next = () => {
    if (my !== speakToken) return;
    if (i >= list.length) { stopSpeak(); return; }
    const it = list[i++];
    markSpeaking(it.id);
    speakText(it.text, my, () => setTimeout(next, list.length > 1 ? 500 : 0));
  };
  setTimeout(next, 80);
}

/* ══════════ 학습지(A4) 그리기 ══════════ */
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function sayBtn(item) {
  const b = h('button', 'say', SPEAKER);
  b.type = 'button'; b.title = '소리로 듣기'; b.setAttribute('aria-label', `「${item.text}」 듣기`);
  b.onclick = e => { e.stopPropagation(); speakItems([item]); };
  return b;
}
function picsEl(item) {
  const box = h('div', 'pics n-' + item.imgs.length);
  item.imgs.forEach((img, i) => {
    const b = h('button', 'pic-btn'); b.type = 'button';
    b.title = viewer ? '눌러서 듣기' : '눌러서 그림 바꾸기';
    b.appendChild(picEl(item, img));
    b.onclick = () => viewer ? speakItems([item]) : openPicker(item, i);
    box.appendChild(b);
  });
  return box;
}
/** 줄바꿈을 끈 경우: 한 줄에 들어갈 때까지 글씨를 줄인다 */
function fitText(block) {
  $$('.txt, .r', block).forEach(el => {
    let fs = parseFloat(getComputedStyle(el).fontSize);
    for (let n = 0; n < 40 && el.scrollWidth > el.clientWidth + 1 && fs > 9; n++) { fs *= 0.95; el.style.fontSize = fs + 'px'; }
  });
}

/* ══════════ 화면에서 바로 쓰기 · 선 잇기 (손가락, 펜, 마우스) ══════════ */
const ink = new Map();   // '항목id:줄번호' → 획 목록 (칸 하나가 100×100인 좌표)
const links = new Map(); // 왼쪽 그림 id → 오른쪽 글 id
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/** 따라 쓰기 한 줄 위에 얹는 투명 필기판 */
function inkLayer(key, cols) {
  const svg = svgEl('svg', { class: 'ink', viewBox: `0 0 ${cols * 100} 100`, preserveAspectRatio: 'none' });
  const draw = pts => svgEl('polyline', { points: pts.join(' ') });
  (ink.get(key) || []).forEach(p => svg.appendChild(draw(p)));
  let cur = null, line = null;
  const pos = e => { const r = svg.getBoundingClientRect(); return [+((e.clientX - r.left) / r.width * cols * 100).toFixed(1), +((e.clientY - r.top) / r.height * 100).toFixed(1)]; };
  svg.addEventListener('pointerdown', e => {
    if (e.button) return;
    e.preventDefault();
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* 일부 기기 */ }
    cur = [...pos(e), ...pos(e)];
    line = draw(cur); svg.appendChild(line);
  });
  svg.addEventListener('pointermove', e => { if (!cur) return; cur.push(...pos(e)); line.setAttribute('points', cur.join(' ')); });
  const end = () => { if (!cur) return; const list = ink.get(key) || []; list.push(cur); ink.set(key, list); cur = null; };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  return svg;
}

/** 선 잇기: 점을 끌어다 놓거나, 두 점을 차례로 누른다 */
let drag = null, armed = null;
const groupXY = (g, cx, cy) => { const r = g.getBoundingClientRect(), k = 1000 / r.width; return [((cx - r.left) * k).toFixed(1), ((cy - r.top) * k).toFixed(1)]; };
const dotXY = (dot, g) => { const r = dot.getBoundingClientRect(); return groupXY(g, r.left + r.width / 2, r.top + r.height / 2); };
function drawLinks() {
  $$('.mgroup').forEach(g => {
    const svg = $('.wires', g), r = g.getBoundingClientRect();
    if (!svg || !r.width) return;
    svg.setAttribute('viewBox', `0 0 1000 ${(1000 * r.height / r.width).toFixed(1)}`);
    svg.innerHTML = '';
    $$('.dot[data-side="l"]', g).forEach(d => {
      const to = links.get(d.dataset.item);
      const t = to && $(`.dot[data-side="r"][data-item="${to}"]`, g);
      if (!t) return;
      const [x1, y1] = dotXY(d, g), [x2, y2] = dotXY(t, g);
      svg.appendChild(svgEl('line', { x1, y1, x2, y2 }));
    });
  });
}
function setArmed(dot) { if (armed) armed.classList.remove('sel'); armed = dot; if (dot) dot.classList.add('sel'); }
function connect(a, b) {
  const l = a.dataset.side === 'l' ? a : b, r = l === a ? b : a;
  for (const [k, v] of links) if (v === r.dataset.item) links.delete(k); // 글 하나에는 선 하나
  links.set(l.dataset.item, r.dataset.item);
  setArmed(null);
  drawLinks();
}
function bindLinking() {
  $('#pages').addEventListener('pointerdown', e => {
    const dot = e.target.closest('.dot');
    if (!dot || e.button) return;
    e.preventDefault();
    const g = dot.closest('.mgroup'), [x, y] = dotXY(dot, g);
    const line = svgEl('line', { class: 'temp', x1: x, y1: y, x2: x, y2: y });
    $('.wires', g).appendChild(line);
    drag = { dot, g, line };
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const [x, y] = groupXY(drag.g, e.clientX, e.clientY);
    drag.line.setAttribute('x2', x); drag.line.setAttribute('y2', y);
  });
  const up = e => {
    if (!drag) return;
    const { dot, g, line } = drag; drag = null; line.remove();
    const hit = e.type === 'pointerup' ? document.elementFromPoint(e.clientX, e.clientY)?.closest('.dot, .mrow .l, .mrow .r') : null;
    const to = !hit ? null : hit.classList.contains('dot') ? hit : $(`.dot[data-side="${hit.classList.contains('l') ? 'l' : 'r'}"]`, hit.closest('.mrow'));
    const pair = (a, b) => a && b && a !== b && a.isConnected && a.closest('.mgroup') === b.closest('.mgroup') && a.dataset.side !== b.dataset.side;
    if (pair(dot, to)) connect(dot, to);            // 끌어서 놓기
    else if (to === dot) {                           // 눌렀다 떼기: 두 점을 차례로
      if (pair(armed, dot)) connect(armed, dot); else setArmed(armed === dot ? null : dot);
    }
  };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  $('#btnErase').onclick = () => { ink.clear(); links.clear(); setArmed(null); renderPages(); toast('쓴 글씨와 이은 선을 지웠어요.'); };
}

function cardBlock(item) {
  const type = classify(item.text);
  const el = h('div', `card t-${type}${item.imgs.length ? '' : ' no-pic'}`);
  el.dataset.id = item.id;
  if (item.imgs.length) el.appendChild(picsEl(item));
  if (item.text.trim()) { el.appendChild(h('div', 'txt', esc(item.text))); el.appendChild(sayBtn(item)); }
  return el;
}
function traceBlock(item) {
  const type = classify(item.text);
  // 칸 크기(mm): 낱말만 쓸 때는 크게(big), 문장과 함께 쓸 때는 보통
  const size = t => Math.min(30, Math.round((t === 'big' ? 20 : t === 'word' ? 14 : t === 'short' ? 11 : 9.5) * state.fontScale * 10) / 10);
  const fitOne = (b, n) => Math.min(b, Math.floor(width / Math.max(1, n) * 10) / 10); // 낱말이 한 줄에 들어가게
  const width = item.imgs.length ? 146 : 180; // 칸을 놓을 수 있는 너비(mm)
  const row = (chars, ghost) => h('div', 'boxes' + (ghost ? '' : ' blank'), chars.map(c => `<span>${ghost && c !== ' ' ? esc(c) : ''}</span>`).join(''));
  const el = h('div', 'trow'); el.dataset.id = item.id;
  if (item.imgs.length) el.appendChild(picsEl(item));
  const tl = h('div', 'tlines');
  const read = h('div', 'tread', esc(item.text));
  read.appendChild(sayBtn(item));
  tl.appendChild(read);
  // 낱말은 그대로, 문장은 설정에 따라: 문장 전체 / 핵심 낱말 / 둘 다
  const mode = type === 'word' ? 'sentence' : state.traceMode;
  if (mode !== 'words') {
    const b = type === 'word' ? fitOne(size('big'), Array.from(item.text.trim()).length) : size(type);
    const per = Math.max(2, Math.floor(width / b)); // 한 줄 칸 수 — 넘치면 다음 줄로
    const lines = []; let cur = [];
    Array.from(item.text.trim()).forEach(c => {
      if (!cur.length && c === ' ') return;
      cur.push(c);
      if (cur.length === per) { lines.push(cur); cur = []; }
    });
    if (cur.length) lines.push(cur);
    const part = h('div', 'tpart'); part.style.setProperty('--b', b + 'mm');
    lines.forEach(line => part.append(row(line, true), row(line, false)));
    if (type === 'word' && lines[0]) part.appendChild(row(lines[0], false));
    tl.appendChild(part);
  }
  if (mode !== 'sentence') {
    const base = size(mode === 'both' ? 'word' : 'big');
    const part = h('div', 'tpart twords');
    if (mode === 'both') part.appendChild(h('div', 'tlabel', '핵심 낱말'));
    keyWords(item.text).forEach(w => {
      const chars = Array.from(w), g = h('div', 'tword');
      g.style.setProperty('--b', fitOne(base, chars.length) + 'mm');
      g.append(row(chars, true), row(chars, false));
      part.appendChild(g);
    });
    tl.appendChild(part);
  }
  $$('.boxes', tl).forEach((bx, r) => bx.appendChild(inkLayer(item.id + ':' + mode + r, bx.children.length)));
  el.appendChild(tl);
  return el;
}
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function matchBlocks(items) {
  const usable = items.filter(it => it.imgs.length && it.text.trim());
  const out = [];
  const groups = Math.ceil(usable.length / 5), size = Math.ceil(usable.length / (groups || 1)); // 한 쪽 5개까지, 고르게 나눈다
  for (let g = 0; g < groups; g++) {
    const group = usable.slice(g * size, g * size + size);
    const rand = rng(state.seed * 7919 + g * 104729 + group.length);
    let right = group.slice();
    for (let i = right.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [right[i], right[j]] = [right[j], right[i]]; }
    if (right.length > 1 && right.every((it, i) => it === group[i])) right.push(right.shift());
    const el = h('div', 'mgroup');
    group.forEach((it, i) => {
      const row = h('div', 'mrow');
      const l = h('div', 'l'); l.dataset.id = it.id;
      l.appendChild(picsEl(it)); l.appendChild(sayBtn(it));
      const rt = right[i];
      const r = h('div', `r t-${classify(rt.text)}`, esc(rt.text)); r.dataset.id = rt.id;
      const dl = h('span', 'dot'), dr = h('span', 'dot');
      dl.dataset.side = 'l'; dl.dataset.item = it.id; dr.dataset.side = 'r'; dr.dataset.item = rt.id;
      row.append(l, dl, h('span'), dr, r);
      el.appendChild(row);
    });
    el.appendChild(svgEl('svg', { class: 'wires' }));
    out.push(el);
  }
  return out;
}

function shareUrl() {
  const slim = {
    t: state.title, l: state.layout, c: state.cols, s: state.imgStyle, p: state.pixelN, v: state.voice, r: state.rate,
    n: state.showName ? 1 : 0, f: state.font, g: state.guide, d: state.seed, z: state.fontScale, w: state.wrap ? 1 : 0, k: state.traceMode,
    i: state.items.map(it => [it.text, it.imgs.map(im => im.kind === 'emoji' ? 'e:' + im.ch : im.kind === 'url' ? 'u:' + im.src : '').filter(Boolean), it.pixel ? 1 : 0]),
  };
  return location.href.split('#')[0] + '#v=' + LZString.compressToEncodedURIComponent(JSON.stringify(slim));
}
function fromShare(code) {
  const o = JSON.parse(LZString.decompressFromEncodedURIComponent(code));
  return {
    ...structuredClone(DEFAULT), title: o.t, layout: o.l, cols: o.c, imgStyle: o.s, pixelN: o.p, voice: o.v, rate: o.r,
    showName: !!o.n, font: o.f, guide: o.g || {}, seed: o.d || 1, fontScale: o.z || 1, wrap: o.w !== 0, traceMode: o.k || 'sentence',
    items: (o.i || []).map(([text, im, px]) => ({
      id: newId(), text, pixel: !!px, auto: false,
      imgs: (Array.isArray(im) ? im : im ? [im] : []).map(c => c.startsWith('e:') ? { kind: 'emoji', ch: c.slice(2) } : { kind: 'url', src: c.slice(2) }),
    })),
  };
}
function qrDataUrl(text) {
  try { const q = qrcode(0, 'L'); q.addData(text); q.make(); return q.createDataURL(4, 0); } catch (e) { return ''; }
}

function renderPages() {
  const wrap = $('#pages');
  wrap.style.setProperty('--z', 1);
  wrap.innerHTML = '';
  const { layout } = state;
  const blocks = layout === 'match' ? matchBlocks(state.items)
    : state.items.filter(it => it.imgs.length || it.text.trim()).map(layout === 'trace' ? traceBlock : cardBlock);
  const usesPhoto = state.items.some(it => it.imgs.some(im => im.kind !== 'emoji'));
  const usesNoto = state.items.some(it => it.imgs.some(im => im.kind === 'emoji'));
  const credit = [usesNoto && 'Google Noto Emoji', usesPhoto && '위키미디어 공용 등'].filter(Boolean).join(' · ');
  const pages = [];

  const newPage = first => {
    const page = h('div', `page f-${state.font}`);
    page.style.setProperty('--u', state.fontScale);
    if (first) {
      const head = h('div', 'sheet-head');
      const t = h('div', 't');
      t.appendChild(h('h1', 'sheet-title', esc(state.title || '학습지')));
      if (state.showName) t.appendChild(h('div', 'sheet-name', '<span>이름 <i></i></span><span>날짜 <i class="s"></i>월 <i class="s"></i>일</span>'));
      head.appendChild(t);
      if (state.showQR && /^https?:/.test(location.protocol)) {
        const src = qrDataUrl(shareUrl());
        if (src) head.appendChild(h('div', 'sheet-qr', `<img src="${src}" alt="소리 듣기 QR">소리로 듣기`));
      }
      page.appendChild(head);
      page.appendChild(h('div', 'sheet-guide', esc(state.guide[layout] || GUIDES[layout])));
    } else {
      page.appendChild(h('div', 'sheet-cont', esc(state.title || '학습지')));
    }
    const body = h('div', `sheet-body body-${layout}${layout === 'card' ? ' cols-' + state.cols : ''}${state.wrap ? '' : ' nowrap'}`);
    if (layout === 'card') body.style.setProperty('--cols', state.cols);
    page.appendChild(body);
    const foot = h('div', 'sheet-foot', `<span>${credit ? '그림: ' + esc(credit) : ''}</span><span class="pn"></span>`);
    page.appendChild(foot);
    wrap.appendChild(page);
    pages.push(page);
    return body;
  };

  let body = newPage(true);
  if (!blocks.length) {
    body.className = 'sheet-body';
    body.appendChild(h('div', 'sheet-empty', layout === 'match' && state.items.length
      ? '선 잇기는 그림과 글이 모두 있는 낱말·문장으로 만들어요.'
      : '왼쪽 「글자 넣기」에 낱말이나 문장을 적고<br>「낱말·문장 추가」를 눌러 보세요.'));
  }
  for (const b of blocks) {
    body.appendChild(b);
    if (!state.wrap) fitText(b);
    if (body.scrollHeight > body.clientHeight + 1 && body.children.length > 1) {
      b.remove();
      body = newPage(false);
      body.appendChild(b);
    }
  }
  pages.forEach((p, i) => { $('.pn', p).textContent = `${i + 1} / ${pages.length}`; });
  fitZoom();
  armed = null;
  drawLinks();
}
let curZ = 1;
/** 미리 보기 크기: '화면 맞춤'이면 창 너비에 맞추고, 아니면 고른 배율 그대로 (인쇄는 늘 A4 실제 크기) */
function fitZoom() {
  const wrap = $('#pages'), page = $('.page', wrap);
  if (!page) return;
  wrap.style.setProperty('--z', 1);
  const fit = Math.max(0.2, Math.min(1, ($('#stage').clientWidth - 40) / page.offsetWidth));
  curZ = state.zoom === 'fit' ? fit : state.zoom;
  wrap.style.setProperty('--z', curZ.toFixed(3));
  $('#zoomVal').textContent = Math.round(curZ * 100) + '%';
  $('#zoomFit').setAttribute('aria-pressed', String(state.zoom === 'fit'));
}

/* ══════════ 왼쪽 목록 ══════════ */
function renderList() {
  const ol = $('#items');
  ol.innerHTML = '';
  $('#count').textContent = state.items.length ? state.items.length + '개' : '';
  if (!state.items.length) { ol.appendChild(h('li', 'empty', '아직 넣은 글이 없어요.')); return; }
  state.items.forEach((item, i) => {
    const li = h('li', 'item'); li.dataset.id = item.id;
    const thumbs = h('div', 'thumbs');
    const fillThumb = () => {
      thumbs.innerHTML = '';
      item.imgs.forEach((img, k) => {
        const t = h('button', 'thumb'); t.type = 'button'; t.title = '그림 바꾸기';
        t.appendChild(picEl(item, img, '')); t.onclick = () => openPicker(item, k);
        thumbs.appendChild(t);
      });
      if (item.imgs.length < MAX_PICS) {
        const a = h('button', 'thumb add', item.imgs.length ? '＋' : '그림<br>넣기'); a.type = 'button';
        a.title = item.imgs.length ? '그림 하나 더 넣기' : '그림 넣기'; a.setAttribute('aria-label', a.title);
        a.onclick = () => openPicker(item, item.imgs.length);
        thumbs.appendChild(a);
      }
    };
    fillThumb();

    const input = h('input'); input.type = 'text'; input.id = 'txt-' + item.id; input.value = item.text;
    input.placeholder = '글자를 적어 주세요'; input.setAttribute('aria-label', '낱말 또는 문장');
    const type = classify(item.text);
    const badge = h('span', 'badge ' + type, TYPE_NAME[type]);
    let timer;
    input.oninput = () => {
      item.text = input.value;
      const t = classify(item.text); badge.className = 'badge ' + t; badge.textContent = TYPE_NAME[t];
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (item.auto) { await autoImage(item); fillThumb(); }
        renderPages(); save();
      }, 350);
    };

    const tools = h('div', 'item-tools');
    const mk = (label, html, fn, disabled) => { const b = h('button', 'icon-btn', html); b.type = 'button'; b.title = label; b.setAttribute('aria-label', label); b.disabled = !!disabled; b.onclick = fn; return b; };
    tools.append(
      badge,
      mk('소리로 듣기', SPEAKER, () => speakItems([item])),
      mk('위로', '↑', () => move(i, -1), i === 0),
      mk('아래로', '↓', () => move(i, 1), i === state.items.length - 1),
      mk('지우기', '✕', () => { state.items.splice(i, 1); render(); }),
    );
    const low = h('div', 'item-low'); low.append(thumbs, tools);
    li.append(input, low);
    ol.appendChild(li);
  });
}
function move(i, d) { const a = state.items; [a[i], a[i + d]] = [a[i + d], a[i]]; render(); }

const press = (sel, attr, val) => $$(sel + ' button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === String(val))));
function renderControls() {
  $('#title').value = state.title;
  $('#guide').value = state.guide[state.layout] || GUIDES[state.layout];
  $('#rate').value = state.rate; $('#rateOut').textContent = state.rate <= 0.7 ? '· 천천히' : state.rate >= 1.1 ? '· 빠르게' : '· 보통';
  $('#pixelN').value = state.pixelN; $('#pixelOut').textContent = `· 가로 ${state.pixelN}칸`;
  $('#showName').checked = state.showName; $('#showQR').checked = state.showQR;
  press('#layoutSeg', 'layout', state.layout); press('#styleSeg', 'style', state.imgStyle);
  press('#colsSeg', 'cols', state.cols); press('#fontSeg', 'font', state.font); press('.voice-seg', 'voice', state.voice);
  $('#volume').value = Math.round(state.volume * 100); $('#volOut').textContent = `· ${Math.round(state.volume * 100)}%`; press('#multiSeg', 'multi', state.multi ? 1 : 0);
  $('#fontScale').value = Math.round(state.fontScale * 100); $('#fontOut').textContent = `· ${Math.round(state.fontScale * 100)}%`;
  $('#wrap').checked = state.wrap;
  $('#colsField').hidden = state.layout !== 'card';
  $('#traceField').hidden = state.layout !== 'trace'; press('#traceSeg', 'trace', state.traceMode);
  $('#pixelField').hidden = !state.items.some(it => it.pixel) && state.imgStyle !== 'pixel';
  $('#btnShuffle').hidden = state.layout !== 'match';
  voiceNote();
}
function render() { renderControls(); renderList(); renderPages(); save(); }
function save() {
  if (viewer) return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* 저장 공간이 없으면 넘어간다 */ }
}
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3200); }

/* ══════════ 그림 고르기 창 ══════════ */
let pickItem = null, pickIdx = 0, pickIsNew = false, photoToken = 0;
function choose(img) {
  if (!pickItem) return;
  if (img) pickItem.imgs[pickIdx] = img; else pickItem.imgs.splice(pickIdx, 1);
  pickItem.auto = false; pickItem.pixel = $('#pickPixel').checked;
  const wasNew = pickIsNew, id = pickItem.id;
  pickIsNew = false;
  $('#picker').close();
  render();
  if (wasNew && img) { toast('그림을 넣었어요. 옆 칸에 글자를 적을 수 있어요.'); setTimeout(() => $('#txt-' + id)?.focus(), 60); }
}
function pickGrid(q) {
  const eg = $('#pickEmoji'); eg.innerHTML = '';
  const list = searchEmoji(q);
  if (!list.length) eg.appendChild(h('div', 'msg', q ? '맞는 그림이 없어요. 다른 낱말로 찾아보세요.' : '찾을 낱말을 적어 주세요.'));
  list.forEach(ch => {
    const b = h('button', 'pick'); b.type = 'button'; b.title = ch;
    const im = h('img'); im.alt = ch; im.loading = 'lazy'; im.src = notoUrl(ch);
    im.onerror = () => { im.onerror = null; im.src = glyphUrl(ch); };
    b.appendChild(im); b.onclick = () => choose({ kind: 'emoji', ch });
    eg.appendChild(b);
  });
  const pg = $('#pickPhoto'); pg.innerHTML = '';
  $('#pickGoogle').href = 'https://www.google.com/search?tbm=isch&tbs=sur:cl&q=' + encodeURIComponent(q || '');
  if (!q) return;
  pg.appendChild(h('div', 'msg', '사진을 찾는 중…'));
  const my = ++photoToken;
  photoSearch(q).then(ps => {
    if (my !== photoToken) return;
    pg.innerHTML = '';
    if (!ps.length) pg.appendChild(h('div', 'msg', '맞는 사진이 없어요.'));
    ps.forEach(p => {
      const b = h('button', 'pick'); b.type = 'button'; b.title = p.credit;
      const im = h('img'); im.alt = p.credit; im.loading = 'lazy'; im.src = p.src;
      b.appendChild(im); b.onclick = () => choose({ kind: 'url', src: p.src, credit: p.credit });
      pg.appendChild(b);
    });
  }).catch(() => { if (my === photoToken) pg.innerHTML = '<div class="msg">사진을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</div>'; });
}
function openPicker(item, idx = 0, isNew) {
  pickItem = item; pickIdx = Math.min(idx, item.imgs.length); pickIsNew = !!isNew;
  const f = findEmoji(item.text);
  const q = ((item.imgs.length > 1 || pickIdx > 0) && f.keys[pickIdx]) || f.key || photoKeys(item.text)[0] || tokens(item.text)[0] || '';
  $('#pickQ').value = q; $('#pickUrl').value = '';
  $('#pickPixel').checked = isNew ? state.imgStyle === 'pixel' : !!item.pixel;
  $('#pickNone').hidden = !item.imgs[pickIdx];
  pickGrid(q);
  $('#picker').showModal();
}
function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = async () => {
      try {
        const im = await loadImg(fr.result);
        const r = Math.min(1, 1000 / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * r) || 1; c.height = Math.round(im.naturalHeight * r) || 1;
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        res(/png|gif|svg|webp/.test(file.type) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86));
      } catch (e) { rej(e); }
    };
    fr.readAsDataURL(file);
  });
}
async function chooseFile(file) {
  if (!file || !file.type.startsWith('image/')) { toast('그림 파일만 넣을 수 있어요.'); return; }
  try { choose({ kind: 'data', src: await fileToDataUrl(file) }); } catch (e) { toast('이 그림은 열 수 없어요. 다른 파일로 해 보세요.'); }
}

/** 자동으로 붙인 그림을 지금 설정에 맞게 다시 고른다 (직접 고른 그림은 그대로) */
async function reAuto() {
  await Promise.all(state.items.filter(it => it.auto && it.text.trim()).map(autoImage));
  render();
}

/* ══════════ 단추 잇기 ══════════ */
function bind() {
  $('#btnAdd').onclick = () => { const ta = $('#inputText'); const lines = ta.value.split('\n'); if (!lines.some(s => s.trim())) { ta.focus(); toast('낱말이나 문장을 먼저 적어 주세요.'); return; } ta.value = ''; addTexts(lines); };
  $('#inputText').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#btnAdd').click(); });
  $('#btnAddPic').onclick = () => { const it = { id: newId(), text: '', imgs: [], auto: false, pixel: state.imgStyle === 'pixel' }; state.items.push(it); openPicker(it, 0, true); };
  $('#samples').onclick = e => { const k = e.target.dataset.sample; if (k) addTexts(SAMPLES[k]); };

  $('#title').oninput = e => { state.title = e.target.value; renderPages(); save(); };
  $('#guide').oninput = e => { const v = e.target.value.trim(); if (v && v !== GUIDES[state.layout]) state.guide[state.layout] = v; else delete state.guide[state.layout]; renderPages(); save(); };
  $('#layoutSeg').onclick = e => { const v = e.target.dataset.layout; if (v) { state.layout = v; render(); } };
  $('#traceSeg').onclick = e => { const v = e.target.dataset.trace; if (v) { state.traceMode = v; render(); } };
  $('#colsSeg').onclick = e => { const v = e.target.dataset.cols; if (v) { state.cols = +v; render(); } };
  $('#fontSeg').onclick = e => { const v = e.target.dataset.font; if (v) { state.font = v; render(); } };
  $('#styleSeg').onclick = async e => {
    const v = e.target.dataset.style; if (!v) return;
    state.imgStyle = v;
    state.items.forEach(it => { it.pixel = v === 'pixel'; });
    render();
    const autos = state.items.filter(it => it.auto && it.text.trim());
    if (v === 'photo' && autos.length) toast('사진을 찾는 중이에요…');
    await Promise.all(autos.map(autoImage));
    render();
  };
  $('#multiSeg').onclick = e => { const v = e.target.dataset.multi; if (v == null) return; state.multi = v === '1'; renderControls(); reAuto(); };
  $('#fontScale').oninput = e => { state.fontScale = +e.target.value / 100; $('#fontOut').textContent = `· ${e.target.value}%`; renderPages(); save(); };
  $('#wrap').onchange = e => { state.wrap = e.target.checked; render(); };
  $('#pixelN').oninput = e => { state.pixelN = +e.target.value; $('#pixelOut').textContent = `· 가로 ${state.pixelN}칸`; };
  $('#pixelN').onchange = () => render();
  $('#rate').oninput = e => { state.rate = +e.target.value; renderControls(); save(); };
  $('#showName').onchange = e => { state.showName = e.target.checked; render(); };
  $('#showQR').onchange = e => {
    state.showQR = e.target.checked; render();
    if (state.showQR && !/^https?:/.test(location.protocol)) toast('QR은 인터넷 주소(https)로 연 화면에서만 찍혀 나와요.');
  };
  $('#btnShuffle').onclick = () => { state.seed = (state.seed % 9973) + 1; render(); };
  const onVoice = e => { const v = e.target.dataset.voice; if (!v) return; state.voice = v; renderControls(); save(); speakItems([{ id: '', text: v === 'male' ? '남자 목소리로 읽어요.' : '여자 목소리로 읽어요.' }]); };
  $$('.voice-seg').forEach(el => { el.onclick = onVoice; });
  $('#volume').oninput = e => { state.volume = +e.target.value / 100; renderControls(); save(); };
  $('#btnTry').onclick = () => speakItems([{ id: '', text: '안녕하세요. 이 목소리로 읽어 드려요.' }]);
  const setZoom = z => { state.zoom = z; fitZoom(); save(); };
  $('#zoomIn').onclick = () => setZoom(Math.min(2, Math.round((curZ + 0.1) * 10) / 10));
  $('#zoomOut').onclick = () => setZoom(Math.max(0.3, Math.round((curZ - 0.1) * 10) / 10));
  $('#zoomFit').onclick = () => setZoom('fit');
  $('#tabs').onclick = e => {
    const t = e.target.dataset.tab; if (!t) return;
    $$('#tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    $$('.pane').forEach(p => { p.hidden = p.dataset.pane !== t; });
  };
  $('#btnSpeakAll').onclick = () => { if ($('#btnSpeakAll').textContent.startsWith('■')) stopSpeak(); else speakItems(state.items, true); };
  $('#btnPrint').onclick = () => { stopSpeak(); window.print(); };

  $('#btnClear').onclick = () => { if (state.items.length && confirm('넣은 낱말과 문장을 모두 지울까요?')) { state.items = []; render(); } };
  $('#btnSave').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state)], { type: 'application/json' }));
    a.download = (state.title || '학습지').replace(/[\\/:*?"<>|]/g, ' ').trim() + '.json';
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('#fileLoad').onchange = async e => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    try { const o = JSON.parse(await f.text()); if (!Array.isArray(o.items)) throw 0; state = norm({ ...structuredClone(DEFAULT), ...o }); render(); toast('학습지를 불러왔어요.'); }
    catch (err) { toast('이 프로그램에서 저장한 파일이 아니에요.'); }
  };

  // 그림 고르기
  $('#pickSearch').onclick = () => pickGrid($('#pickQ').value.trim());
  $('#pickQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); pickGrid($('#pickQ').value.trim()); } });
  $('#pickFile').onchange = e => { const f = e.target.files[0]; e.target.value = ''; chooseFile(f); };
  const urlOk = () => { const u = $('#pickUrl').value.trim(); if (/^(https?:|data:image\/)/.test(u)) choose(u.startsWith('data:') ? { kind: 'data', src: u } : { kind: 'url', src: u }); else toast('https:// 로 시작하는 그림 주소를 넣어 주세요.'); };
  $('#pickUrlOk').onclick = urlOk;
  $('#pickUrl').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); urlOk(); } });
  $('#pickNone').onclick = () => choose(null);
  $('#pickPixel').onchange = e => { if (pickItem && pickItem.imgs.length) { pickItem.pixel = e.target.checked; render(); } };
  $('#picker').addEventListener('paste', e => {
    const f = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
    if (f) { e.preventDefault(); chooseFile(f); }
  });
  $('#picker').addEventListener('close', () => {
    if (pickIsNew && pickItem && !pickItem.imgs.length) { state.items = state.items.filter(it => it !== pickItem); render(); }
    pickIsNew = false;
  });

  // 링크 공유
  $('#btnShare').onclick = () => {
    const url = shareUrl();
    $('#shareUrl').value = url;
    const local = !/^https?:/.test(location.protocol);
    const lost = state.items.reduce((n, it) => n + it.imgs.filter(im => im.kind === 'data').length, 0);
    const qr = url.length < 2300 ? qrDataUrl(url) : '';
    $('#shareQR').innerHTML = qr && !local ? `<img src="${qr}" alt="학습지 주소 QR">` : '';
    $('#shareNote').textContent = [
      local && '지금은 내 컴퓨터에서 연 화면이라, 이 주소는 이 컴퓨터에서만 열려요. 인터넷에 올린 주소에서 만들면 누구나 열 수 있어요.',
      lost && `내 컴퓨터에서 올린 그림 ${lost}개는 주소에 담을 수 없어 빠져요.`,
      !qr && !local && '글이 많아 QR은 만들지 못했어요. 주소를 복사해 보내 주세요.',
    ].filter(Boolean).join(' ');
    $('#share').showModal();
  };
  $('#shareCopy').onclick = async () => {
    const inp = $('#shareUrl');
    try { await navigator.clipboard.writeText(inp.value); toast('주소를 복사했어요.'); }
    catch (e) { inp.select(); document.execCommand('copy'); toast('주소를 복사했어요.'); }
  };
  $('#btnEdit').onclick = () => {
    let has = false;
    try { has = (JSON.parse(localStorage.getItem(LS_KEY) || '{}').items || []).length > 0; } catch (e) { /* 없음 */ }
    if (has && !confirm('이 학습지를 고치면, 이 기기에서 만들던 학습지는 사라져요. 계속할까요?')) return;
    viewer = false; document.body.classList.remove('viewer');
    history.replaceState(null, '', location.pathname + location.search);
    render();
  };

  // 왼쪽 설정 칸: 필요할 때만 열어 쓴다 (이 기기에 기억)
  const setPanel = open => {
    document.body.classList.toggle('panel-closed', !open);
    const b = $('#btnPanel');
    b.textContent = open ? '◀ 설정 숨기기' : '▶ 설정 열기';
    b.setAttribute('aria-expanded', String(open));
    fitZoom();
    try { localStorage.setItem(LS_KEY + '-panel', open ? '1' : '0'); } catch (e) { /* 기억 못 해도 동작 */ }
  };
  $('#btnPanel').onclick = () => setPanel(document.body.classList.contains('panel-closed'));
  let panelOpen = true;
  try { panelOpen = localStorage.getItem(LS_KEY + '-panel') !== '0'; } catch (e) { /* 처음 */ }
  setPanel(panelOpen);
  bindLinking();
  window.addEventListener('resize', fitZoom);
  window.addEventListener('beforeprint', stopSpeak);
  if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }
  document.fonts?.ready.then(renderPages);
}

/* ══════════ 시작 ══════════ */
function start() {
  const m = location.hash.match(/^#v=(.+)$/);
  let loaded = false, redo = false;
  if (m) {
    try { state = fromShare(m[1]); viewer = true; loaded = true; document.body.classList.add('viewer'); }
    catch (e) { toast('주소가 잘못되어 학습지를 열 수 없어요.'); }
  }
  if (!loaded) {
    try { const o = JSON.parse(localStorage.getItem(LS_KEY)); if (o && Array.isArray(o.items)) { state = norm({ ...structuredClone(DEFAULT), ...o }); loaded = true; if (o.multi === undefined) redo = true; } } catch (e) { /* 처음 */ }
  }
  bind();
  render();
  if (redo) reAuto();
  if (!loaded) addTexts(['사과', '강아지', '나비가 날아요', '나는 아침에 일어나서 학교에 갑니다']);
}
window.__ws = { findEmoji, searchEmoji, classify, photoKeys };
start();
})();

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
  guide: {}, seed: 1, items: [],
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
  return { list: [...new Set(list)], key: ordered[0]?.key || '' };
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
function photoKeys(text) {
  const known = [], rest = [];
  tokens(text).slice(0, 5).forEach(tok => {
    const m = matchToken(tok);
    if (m && !m.verb) known.push(m.key);
    else stems(tok).slice(0, 2).forEach(s => { if (!STOP.has(s) && s.length > 1) rest.push(s); });
  });
  return [...new Set([...known, ...rest])].slice(0, 8);
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
async function wikiExact(keys) {
  if (!keys.length) return null;
  const j = await getJSON(WIKI + 'redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=500&titles=' + encodeURIComponent(keys.join('|')));
  const pages = Object.values(j.query?.pages || {});
  const map = {};
  [...(j.query?.normalized || []), ...(j.query?.redirects || [])].forEach(r => { map[r.from] = r.to; });
  for (const k of keys) {
    let t = k; for (let n = 0; n < 3 && map[t]; n++) t = map[t];
    const p = pages.find(p => p.title === t && p.thumbnail);
    if (p) return { src: p.thumbnail.source, credit: p.title };
  }
  return null;
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
async function setImg(el, item) {
  const img = item.img;
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
function picEl(item, cls = 'pic') {
  const el = document.createElement('img');
  el.className = cls; el.alt = item.text || '그림'; el.decoding = 'async';
  setImg(el, item);
  return el;
}

/* ══════════ 그림 자동으로 붙이기 ══════════ */
async function autoImage(item) {
  const text = item.text;
  const em = findEmoji(text).list;
  const tryPhoto = async () => {
    try {
      const p = await wikiExact(photoKeys(text));
      if (p && item.text === text && item.auto) { item.img = { kind: 'url', src: p.src, credit: p.credit }; return true; }
    } catch (e) { /* 인터넷이 없으면 그림 없이 둔다 */ }
    return false;
  };
  if (state.imgStyle === 'photo' && await tryPhoto()) return;
  if (item.text !== text || !item.auto) return;
  if (em.length) { item.img = { kind: 'emoji', ch: em[0] }; return; }
  if (state.imgStyle !== 'photo' && await tryPhoto()) return;
  if (item.text === text && item.auto) item.img = null;
}

const classify = text => {
  const t = (text || '').trim(), n = Array.from(t).length;
  if (!t) return 'pic';
  if (!/\s/.test(t) && n <= 7) return 'word';
  return n <= 16 ? 'short' : 'long';
};
const TYPE_NAME = { word: '낱말', short: '짧은 문장', long: '긴 문장', pic: '그림만' };

async function addTexts(lines) {
  const fresh = lines.map(s => s.trim()).filter(Boolean)
    .map(text => ({ id: newId(), text, img: null, auto: true, pixel: state.imgStyle === 'pixel' }));
  if (!fresh.length) return;
  state.items.push(...fresh);
  fresh.forEach(it => { const em = findEmoji(it.text).list; if (em.length) it.img = { kind: 'emoji', ch: em[0] }; });
  render();
  await Promise.all(fresh.filter(it => !it.img || state.imgStyle === 'photo').map(autoImage));
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
    u.pitch = pitch; u.rate = state.rate;
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
function picButton(item, cls) {
  const b = h('button', 'pic-btn'); b.type = 'button';
  b.title = viewer ? '눌러서 듣기' : '눌러서 그림 바꾸기';
  b.appendChild(picEl(item, cls));
  b.onclick = () => viewer ? speakItems([item]) : openPicker(item);
  return b;
}

function cardBlock(item) {
  const type = classify(item.text);
  const el = h('div', `card t-${type}${item.img ? '' : ' no-pic'}`);
  el.dataset.id = item.id;
  if (item.img) el.appendChild(picButton(item));
  if (item.text.trim()) { el.appendChild(h('div', 'txt', esc(item.text))); el.appendChild(sayBtn(item)); }
  return el;
}
function traceBlock(item) {
  const type = classify(item.text);
  const b = type === 'word' ? 14 : type === 'short' ? 11 : 9.5;
  const per = Math.floor((item.img ? 146 : 180) / b);
  const chars = Array.from(item.text.trim());
  const lines = [];
  let cur = [];
  chars.forEach(c => {
    if (!cur.length && c === ' ') return;
    cur.push(c);
    if (cur.length === per) { lines.push(cur); cur = []; }
  });
  if (cur.length) lines.push(cur);
  const el = h('div', 'trow'); el.dataset.id = item.id;
  if (item.img) el.appendChild(picButton(item));
  const tl = h('div', 'tlines'); tl.style.setProperty('--b', b + 'mm');
  const read = h('div', 'tread', esc(item.text));
  read.appendChild(sayBtn(item));
  tl.appendChild(read);
  lines.forEach(line => {
    tl.appendChild(h('div', 'boxes', line.map(c => `<span>${c === ' ' ? '' : esc(c)}</span>`).join('')));
    tl.appendChild(h('div', 'boxes blank', line.map(() => '<span></span>').join('')));
  });
  if (type === 'word') tl.appendChild(h('div', 'boxes blank', lines[0].map(() => '<span></span>').join('')));
  el.appendChild(tl);
  return el;
}
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function matchBlocks(items) {
  const usable = items.filter(it => it.img && it.text.trim());
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
      l.appendChild(picButton(it)); l.appendChild(sayBtn(it));
      const rt = right[i];
      const r = h('div', `r t-${classify(rt.text)}`, esc(rt.text)); r.dataset.id = rt.id;
      row.append(l, h('span', 'dot'), h('span'), h('span', 'dot'), r);
      el.appendChild(row);
    });
    out.push(el);
  }
  return out;
}

function shareUrl() {
  const slim = {
    t: state.title, l: state.layout, c: state.cols, s: state.imgStyle, p: state.pixelN, v: state.voice, r: state.rate,
    n: state.showName ? 1 : 0, f: state.font, g: state.guide, d: state.seed,
    i: state.items.map(it => [it.text, !it.img ? '' : it.img.kind === 'emoji' ? 'e:' + it.img.ch : it.img.kind === 'url' ? 'u:' + it.img.src : '', it.pixel ? 1 : 0]),
  };
  return location.href.split('#')[0] + '#v=' + LZString.compressToEncodedURIComponent(JSON.stringify(slim));
}
function fromShare(code) {
  const o = JSON.parse(LZString.decompressFromEncodedURIComponent(code));
  return {
    ...structuredClone(DEFAULT), title: o.t, layout: o.l, cols: o.c, imgStyle: o.s, pixelN: o.p, voice: o.v, rate: o.r,
    showName: !!o.n, font: o.f, guide: o.g || {}, seed: o.d || 1,
    items: (o.i || []).map(([text, im, px]) => ({
      id: newId(), text, pixel: !!px, auto: false,
      img: !im ? null : im.startsWith('e:') ? { kind: 'emoji', ch: im.slice(2) } : { kind: 'url', src: im.slice(2) },
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
    : state.items.filter(it => it.img || it.text.trim()).map(layout === 'trace' ? traceBlock : cardBlock);
  const usesPhoto = state.items.some(it => it.img && it.img.kind === 'url');
  const usesNoto = state.items.some(it => it.img && it.img.kind === 'emoji');
  const credit = [usesNoto && 'Google Noto Emoji', usesPhoto && '위키미디어 공용 등'].filter(Boolean).join(' · ');
  const pages = [];

  const newPage = first => {
    const page = h('div', `page f-${state.font}`);
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
    const body = h('div', `sheet-body body-${layout}${layout === 'card' ? ' cols-' + state.cols : ''}`);
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
    if (body.scrollHeight > body.clientHeight + 1 && body.children.length > 1) {
      b.remove();
      body = newPage(false);
      body.appendChild(b);
    }
  }
  pages.forEach((p, i) => { $('.pn', p).textContent = `${i + 1} / ${pages.length}`; });
  fitZoom();
}
function fitZoom() {
  const wrap = $('#pages'), page = $('.page', wrap);
  if (!page) return;
  wrap.style.setProperty('--z', 1);
  const room = $('#stage').clientWidth - 34;
  const z = Math.min(1, room / page.offsetWidth);
  wrap.style.setProperty('--z', z.toFixed(4));
}

/* ══════════ 왼쪽 목록 ══════════ */
function renderList() {
  const ol = $('#items');
  ol.innerHTML = '';
  $('#count').textContent = state.items.length ? state.items.length + '개' : '';
  if (!state.items.length) { ol.appendChild(h('li', 'empty', '아직 넣은 글이 없어요.')); return; }
  state.items.forEach((item, i) => {
    const li = h('li', 'item'); li.dataset.id = item.id;
    const thumb = h('button', 'thumb'); thumb.type = 'button'; thumb.title = '그림 바꾸기';
    const fillThumb = () => { thumb.innerHTML = ''; if (item.img) thumb.appendChild(picEl(item, '')); else thumb.textContent = '그림 넣기'; };
    fillThumb(); li._fillThumb = fillThumb;
    thumb.onclick = () => openPicker(item);

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
    li.append(thumb, input, tools);
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
  press('#colsSeg', 'cols', state.cols); press('#fontSeg', 'font', state.font); press('#voiceSeg', 'voice', state.voice);
  $('#colsField').hidden = state.layout !== 'card';
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
let pickItem = null, pickIsNew = false, photoToken = 0;
function choose(img) {
  if (!pickItem) return;
  pickItem.img = img; pickItem.auto = false; pickItem.pixel = $('#pickPixel').checked;
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
function openPicker(item, isNew) {
  pickItem = item; pickIsNew = !!isNew;
  const q = findEmoji(item.text).key || photoKeys(item.text)[0] || tokens(item.text)[0] || '';
  $('#pickQ').value = q; $('#pickUrl').value = '';
  $('#pickPixel').checked = isNew ? state.imgStyle === 'pixel' : !!item.pixel;
  $('#pickNone').hidden = !item.img;
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

/* ══════════ 단추 잇기 ══════════ */
function bind() {
  $('#btnAdd').onclick = () => { const ta = $('#inputText'); const lines = ta.value.split('\n'); if (!lines.some(s => s.trim())) { ta.focus(); toast('낱말이나 문장을 먼저 적어 주세요.'); return; } ta.value = ''; addTexts(lines); };
  $('#inputText').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#btnAdd').click(); });
  $('#btnAddPic').onclick = () => { const it = { id: newId(), text: '', img: null, auto: false, pixel: state.imgStyle === 'pixel' }; state.items.push(it); openPicker(it, true); };
  $('#samples').onclick = e => { const k = e.target.dataset.sample; if (k) addTexts(SAMPLES[k]); };

  $('#title').oninput = e => { state.title = e.target.value; renderPages(); save(); };
  $('#guide').oninput = e => { const v = e.target.value.trim(); if (v && v !== GUIDES[state.layout]) state.guide[state.layout] = v; else delete state.guide[state.layout]; renderPages(); save(); };
  $('#layoutSeg').onclick = e => { const v = e.target.dataset.layout; if (v) { state.layout = v; render(); } };
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
  $('#pixelN').oninput = e => { state.pixelN = +e.target.value; $('#pixelOut').textContent = `· 가로 ${state.pixelN}칸`; };
  $('#pixelN').onchange = () => render();
  $('#rate').oninput = e => { state.rate = +e.target.value; renderControls(); save(); };
  $('#showName').onchange = e => { state.showName = e.target.checked; render(); };
  $('#showQR').onchange = e => {
    state.showQR = e.target.checked; render();
    if (state.showQR && !/^https?:/.test(location.protocol)) toast('QR은 인터넷 주소(https)로 연 화면에서만 찍혀 나와요.');
  };
  $('#btnShuffle').onclick = () => { state.seed = (state.seed % 9973) + 1; render(); };
  $('#voiceSeg').onclick = e => { const v = e.target.dataset.voice; if (!v) return; state.voice = v; renderControls(); save(); speakItems([{ id: '', text: v === 'male' ? '남자 목소리로 읽어요.' : '여자 목소리로 읽어요.' }]); };
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
    try { const o = JSON.parse(await f.text()); if (!Array.isArray(o.items)) throw 0; state = { ...structuredClone(DEFAULT), ...o }; render(); toast('학습지를 불러왔어요.'); }
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
  $('#pickPixel').onchange = e => { if (pickItem && pickItem.img) { pickItem.pixel = e.target.checked; render(); } };
  $('#picker').addEventListener('paste', e => {
    const f = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
    if (f) { e.preventDefault(); chooseFile(f); }
  });
  $('#picker').addEventListener('close', () => {
    if (pickIsNew && pickItem && !pickItem.img) { state.items = state.items.filter(it => it !== pickItem); render(); }
    pickIsNew = false;
  });

  // 링크 공유
  $('#btnShare').onclick = () => {
    const url = shareUrl();
    $('#shareUrl').value = url;
    const local = !/^https?:/.test(location.protocol);
    const lost = state.items.filter(it => it.img && it.img.kind === 'data').length;
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

  window.addEventListener('resize', fitZoom);
  window.addEventListener('beforeprint', stopSpeak);
  if (synth) { loadVoices(); synth.addEventListener?.('voiceschanged', loadVoices); }
  document.fonts?.ready.then(renderPages);
}

/* ══════════ 시작 ══════════ */
function start() {
  const m = location.hash.match(/^#v=(.+)$/);
  let loaded = false;
  if (m) {
    try { state = fromShare(m[1]); viewer = true; loaded = true; document.body.classList.add('viewer'); }
    catch (e) { toast('주소가 잘못되어 학습지를 열 수 없어요.'); }
  }
  if (!loaded) {
    try { const o = JSON.parse(localStorage.getItem(LS_KEY)); if (o && Array.isArray(o.items)) { state = { ...structuredClone(DEFAULT), ...o }; loaded = true; } } catch (e) { /* 처음 */ }
  }
  bind();
  render();
  if (!loaded) addTexts(['사과', '강아지', '나비가 날아요', '나는 아침에 일어나서 학교에 갑니다']);
}
window.__ws = { findEmoji, searchEmoji, classify, photoKeys };
start();
})();

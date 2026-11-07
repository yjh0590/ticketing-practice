// Venue catalog. Real venues are simplified practice layouts: the overall shape, floors and
// grade names follow public guides, but section counts, numbering and prices are examples.
// Geometry lives in a 400×300 SVG box. Arc angles are degrees: 0 = east, 90 = south (SVG y-down).
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const pick = (value, i, id) => (typeof value === 'function' ? value(i, id) : value);

// Wedge sections evenly spread between a0 and a1 around (cx, cy); `sy` squashes into an oval.
function ring({ ids, name, grade, rows, columns, cx, cy, r0, r1, a0, a1, sy = 1, gap = 1.4 }) {
  const step = (a1 - a0) / ids.length;
  return ids.map((id, i) => ({
    id: String(id), name: name(id, i), grade: pick(grade, i, id), rows: pick(rows, i, id), columns: pick(columns, i, id),
    shape: { arc: [cx, cy, r0, r1, a0 + i * step + gap / 2, a0 + (i + 1) * step - gap / 2], sy },
  }));
}
// Rectangular blocks laid out left to right between x0 and x1.
function blocks({ ids, name, grade, rows, columns, x0, x1, y, h, gap = 6 }) {
  const w = (x1 - x0 - gap * (ids.length - 1)) / ids.length;
  return ids.map((id, i) => ({ id: String(id), name: name(id, i), grade: pick(grade, i, id), rows: pick(rows, i, id), columns: pick(columns, i, id), shape: { rect: [x0 + i * (w + gap), y, w, h] } }));
}
// The last two seats of the last section stay free so every practice run can finish.
function venue(v) {
  const last = v.sections.at(-1);
  return { excludedSeats: [], reserved: [`${last.id}-${last.rows}-${last.columns - 1}`, `${last.id}-${last.rows}-${last.columns}`], decor: [], ...v };
}
const endStage = (x, y, w, h, label = 'STAGE') => ({ rect: [x, y, w, h], cls: 'stage', label });
// Ballpark field drawn around an infield centred at (cx, cy).
const field = (cx, cy, r) => [
  { arc: [cx, cy, 0, r, 0, 360], cls: 'field' },
  { poly: [[cx, cy + r * .78], [cx + r * .42, cy + r * .36], [cx, cy - r * .06], [cx - r * .42, cy + r * .36]], cls: 'diamond' },
];

// Cinema hall: screen on top, left/centre/right blocks split by aisles.
const ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function cinema({ id, name, en, price, rows, side, center, fictional = false }) {
  const total = side * 2 + center, w = 300 / total, h = Math.min(14, 200 / rows);
  const block = (key, label, columns, offset, x) => ({ id: key, name: `${label} 블록`, grade: 'STD', rows, columns, offset, shape: { rect: [x, 60, columns * w - 4, rows * h] } });
  return venue({
    id, type: 'cinema', name, en, label: `${en} · ${fictional ? 'SAMPLE' : '연습용 단순화 배치'}`, stage: 'SCREEN', fictional,
    seatLabel: (seat, sec) => `${ROWS[seat.row - 1]}열 ${seat.number + sec.offset}번`, rowLabel: row => ROWS[row - 1],
    seatHint: '스크린 ↑ · 좌석 번호는 왼쪽부터 이어집니다',
    grades: { STD: { label: '일반', price, tone: 'r' } },
    decor: [{ rect: [70, 34, 260, 6], cls: 'screen' }, { text: 'SCREEN', at: [200, 22] }],
    sections: [block('L', '왼쪽', side, 0, 50), block('C', '가운데', center, side, 50 + side * w + 4), block('R', '오른쪽', side, side + center, 50 + (side + center) * w + 8)],
  });
}
// A-match grades by the wedge's centre angle (0 = north goal = 레드석, 90 = 본부석 쪽).
function footballGrade(angle, upper) {
  const a = (angle + 360) % 360, goalN = a <= 18 || a >= 342, goalS = a >= 144 && a <= 216;
  if (goalN) return 'RED';
  if (goalS) return 'THIRD';
  if (upper) return a > 36 && a < 324 ? 'SECOND' : 'RED';
  if (a === 90) return 'PREMIUM';
  if ((a >= 72 && a <= 108) || (a >= 252 && a <= 288)) return 'FIRST';
  return 'SECOND';
}

export const venues = {
  // ── Fictional defaults (kept for stable practice runs and tests) ──
  arena: venue({
    id: 'seoul-live-sample', type: 'arena', name: '서울 라이브 아레나', en: 'SEOUL LIVE ARENA', label: 'SEOUL LIVE ARENA · SAMPLE', stage: 'STAGE', fictional: true,
    grades: { VIP: { label: 'VIP석', price: 154000, tone: 'vip' }, R: { label: 'R석', price: 132000, tone: 'r' } },
    decor: [{ arc: [200, 150, 0, 140, 0, 360], sy: .95, cls: 'outline' }, endStage(140, 22, 120, 24), { rect: [195, 46, 10, 52], cls: 'runway' }],
    sections: [
      { id: 'A', grade: 'VIP', rows: 8, columns: 12, shape: { rect: [104, 104, 86, 56] } },
      { id: 'B', grade: 'VIP', rows: 8, columns: 12, shape: { rect: [210, 104, 86, 56] } },
      { id: 'C', grade: 'R', rows: 8, columns: 12, shape: { rect: [70, 180, 82, 56, 8] } },
      { id: 'D', grade: 'R', rows: 8, columns: 12, shape: { rect: [159, 186, 82, 56] } },
      { id: 'E', grade: 'R', rows: 8, columns: 12, shape: { rect: [248, 180, 82, 56, -8] } },
    ],
    excludedSeats: ['A-1-1', 'B-1-12'], reserved: ['D-8-11', 'D-8-12'],
  }),
  ballpark: venue({
    id: 'practice-ballpark', type: 'ballpark', name: '연습 볼파크', en: 'PRACTICE BALLPARK', label: 'PRACTICE BALLPARK · SAMPLE', stage: 'GROUND', fictional: true,
    grades: { TABLE: { label: '테이블석', price: 45000, tone: 'table' }, CHEER: { label: '응원석', price: 18000, tone: 'cheer' }, OUTFIELD: { label: '외야석', price: 11000, tone: 'outfield' } },
    decor: field(200, 150, 82),
    sections: [
      { id: 'T3', name: '3루 테이블', grade: 'TABLE', rows: 4, columns: 12, shape: { arc: [200, 150, 88, 122, 92, 135] } },
      { id: 'T1', name: '1루 테이블', grade: 'TABLE', rows: 4, columns: 12, shape: { arc: [200, 150, 88, 122, 45, 88] } },
      { id: 'B3', name: '3루 응원', grade: 'CHEER', rows: 8, columns: 12, shape: { arc: [200, 150, 88, 122, 138, 205] } },
      { id: 'B1', name: '1루 응원', grade: 'CHEER', rows: 8, columns: 12, shape: { arc: [200, 150, 88, 122, -25, 42] } },
      { id: 'OF', name: '외야', grade: 'OUTFIELD', rows: 8, columns: 14, shape: { arc: [200, 150, 88, 122, 215, 325] } },
    ],
    reserved: ['B1-8-11', 'B1-8-12'],
  }),
  theater: venue({
    id: 'practice-theater', type: 'theater', name: '대학로 연습극장', en: 'PRACTICE THEATER', label: 'PRACTICE THEATER · SAMPLE', stage: 'STAGE', fictional: true,
    grades: { ALL: { label: '전석', price: 55000, tone: 'r' } },
    decor: [endStage(110, 30, 180, 30)],
    sections: [
      { id: 'L', name: '왼쪽 블록', grade: 'ALL', rows: 8, columns: 6, shape: { rect: [70, 95, 70, 130, 6] } },
      { id: 'C', name: '가운데 블록', grade: 'ALL', rows: 8, columns: 10, shape: { rect: [150, 95, 100, 130] } },
      { id: 'R', name: '오른쪽 블록', grade: 'ALL', rows: 8, columns: 6, shape: { rect: [260, 95, 70, 130, -6] } },
    ],
    reserved: ['C-8-5', 'C-8-6'],
  }),

  // ── Concert venues ──
  kspo: venue({
    id: 'kspo-dome', type: 'arena', name: 'KSPO DOME (올림픽체조경기장)', en: 'KSPO DOME', label: 'KSPO DOME · 연습용 단순화 배치', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석 (플로어)', price: 165000, tone: 'vip' }, R: { label: 'R석 (2층)', price: 143000, tone: 'r' }, S: { label: 'S석 (3층)', price: 121000, tone: 's' } },
    decor: [endStage(145, 14, 110, 22)],
    sections: [
      ...blocks({ ids: ['FA', 'FB', 'FC'], name: id => `플로어 ${id.slice(1)}구역`, grade: 'VIP', rows: 10, columns: 14, x0: 140, x1: 260, y: 48, h: 44 }),
      ...blocks({ ids: ['FD', 'FE', 'FF'], name: id => `플로어 ${id.slice(1)}구역`, grade: 'VIP', rows: 10, columns: 14, x0: 140, x1: 260, y: 98, h: 44 }),
      ...ring({ ids: range(1, 14), name: id => `2층 ${id}구역`, grade: 'R', rows: 6, columns: 12, cx: 200, cy: 98, r0: 102, r1: 132, a0: -14, a1: 194 }),
      ...ring({ ids: range(15, 38), name: id => `3층 ${id}구역`, grade: 'S', rows: 6, columns: 12, cx: 200, cy: 98, r0: 137, r1: 172, a0: -18, a1: 198, gap: 1 }),
    ],
  }),
  gocheok: venue({
    id: 'gocheok-concert', type: 'dome', name: '고척스카이돔 (콘서트)', en: 'GOCHEOK SKY DOME', label: 'GOCHEOK SKY DOME · 연습용 단순화 배치', stage: 'STAGE',
    grades: {
      VIP: { label: 'VIP석 (그라운드)', price: 154000, tone: 'vip' }, R: { label: 'R석 (1층)', price: 143000, tone: 'r' },
      S: { label: 'S석 (3층)', price: 121000, tone: 's' }, A: { label: 'A석 (4층)', price: 99000, tone: 'a' }, LIMIT: { label: '시야제한석', price: 77000, tone: 'limit' },
    },
    decor: [endStage(150, 10, 100, 20), { arc: [200, 92, 127, 137, -16, 196], cls: 'blocked', label: '2층 · 초대석 위주 (연습 제외)', labelAt: [200, 224] }],
    sections: [
      ...blocks({ ids: ['G1', 'G2', 'G3', 'G4'], name: id => `그라운드 ${id.slice(1)}구역`, grade: 'VIP', rows: 8, columns: 14, x0: 128, x1: 272, y: 42, h: 40, gap: 5 }),
      ...blocks({ ids: ['G5', 'G6', 'G7', 'G8'], name: id => `그라운드 ${id.slice(1)}구역`, grade: 'VIP', rows: 8, columns: 14, x0: 128, x1: 272, y: 88, h: 40, gap: 5 }),
      ...ring({ ids: range(101, 112), name: id => `1층 ${id}구역`, grade: 'R', rows: 5, columns: 12, cx: 200, cy: 92, r0: 100, r1: 124, a0: -12, a1: 192 }),
      ...ring({ ids: range(301, 316), name: id => `3층 ${id}구역`, grade: 'S', rows: 5, columns: 12, cx: 200, cy: 92, r0: 140, r1: 160, a0: -16, a1: 196 }),
      ...ring({ ids: range(401, 418), name: id => `4층 ${id}구역`, grade: (i, id) => (i < 2 || i > 15 ? 'LIMIT' : 'A'), rows: 5, columns: 12, cx: 200, cy: 92, r0: 163, r1: 184, a0: -18, a1: 198, gap: 1 }),
    ],
  }),
  inspire: venue({
    id: 'inspire-arena', type: 'arena', name: '인스파이어 아레나', en: 'INSPIRE ARENA', label: 'INSPIRE ARENA · 연습용 단순화 배치', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석 (플로어)', price: 165000, tone: 'vip' }, R: { label: 'R석 (하단)', price: 143000, tone: 'r' }, S: { label: 'S석 (상단)', price: 121000, tone: 's' } },
    decor: [endStage(160, 30, 80, 20)],
    sections: [
      ...blocks({ ids: ['F1', 'F2', 'F3'], name: id => `플로어 ${id.slice(1)}구역`, grade: 'VIP', rows: 10, columns: 12, x0: 150, x1: 250, y: 74, h: 38 }),
      ...blocks({ ids: ['F4', 'F5', 'F6'], name: id => `플로어 ${id.slice(1)}구역`, grade: 'VIP', rows: 10, columns: 12, x0: 150, x1: 250, y: 118, h: 38 }),
      ...ring({ ids: range(101, 114), name: id => `${id}구역`, grade: 'R', rows: 6, columns: 12, cx: 200, cy: 140, r0: 90, r1: 116, a0: -58, a1: 238 }),
      ...ring({ ids: range(201, 218), name: id => `${id}구역`, grade: 'S', rows: 6, columns: 12, cx: 200, cy: 140, r0: 121, r1: 150, a0: -62, a1: 242, gap: 1 }),
    ],
  }),
  worldcup: venue({
    id: 'seoul-worldcup', type: 'stadium', name: '서울월드컵경기장 (콘서트)', en: 'SEOUL WORLD CUP STADIUM', label: 'SEOUL WORLD CUP STADIUM · 연습용 단순화 배치', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석 (그라운드 앞)', price: 176000, tone: 'vip' }, R: { label: 'R석 (그라운드 뒤)', price: 154000, tone: 'r' }, S: { label: 'S석 (1층)', price: 132000, tone: 's' }, A: { label: 'A석 (2층)', price: 110000, tone: 'a' } },
    decor: [{ arc: [200, 150, 0, 116, 0, 360], sy: .74, cls: 'pitch' }, endStage(150, 70, 100, 18)],
    sections: [
      ...blocks({ ids: ['GA', 'GB', 'GC', 'GD'], name: id => `그라운드 ${id.slice(1)}구역`, grade: 'VIP', rows: 10, columns: 16, x0: 118, x1: 282, y: 100, h: 38, gap: 5 }),
      ...blocks({ ids: ['GE', 'GF', 'GG', 'GH'], name: id => `그라운드 ${id.slice(1)}구역`, grade: 'R', rows: 10, columns: 16, x0: 118, x1: 282, y: 144, h: 38, gap: 5 }),
      ...ring({ ids: range(101, 116), name: id => `1층 ${id}구역`, grade: 'S', rows: 6, columns: 14, cx: 200, cy: 150, r0: 122, r1: 152, a0: -32, a1: 212, sy: .76 }),
      ...ring({ ids: range(201, 220), name: id => `2층 ${id}구역`, grade: 'A', rows: 6, columns: 14, cx: 200, cy: 150, r0: 157, r1: 192, a0: -34, a1: 214, sy: .74, gap: 1 }),
    ],
  }),
  sejong: venue({
    id: 'sejong-grand', type: 'theater', name: '세종문화회관 대극장', en: 'SEJONG GRAND THEATER', label: 'SEJONG CENTER GRAND THEATER · 연습용 단순화 배치', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석', price: 150000, tone: 'vip' }, R: { label: 'R석', price: 120000, tone: 'r' }, S: { label: 'S석 (2층)', price: 90000, tone: 's' }, A: { label: 'A석 (3층)', price: 60000, tone: 'a' } },
    decor: [endStage(120, 6, 160, 20), { text: '1층', at: [30, 70] }, { text: '2층', at: [30, 192] }, { text: '3층', at: [30, 252] }],
    sections: [
      ...ring({ ids: ['1E', '1D', '1C', '1B', '1A'], name: id => `1층 ${id.slice(1)}구역`, grade: (i) => (i === 2 ? 'VIP' : 'R'), rows: 12, columns: (i) => (i === 2 ? 16 : 12), cx: 200, cy: -10, r0: 52, r1: 160, a0: 38, a1: 142, gap: 2 }),
      ...ring({ ids: ['2D', '2C', '2B', '2A'], name: id => `2층 ${id.slice(1)}구역`, grade: 'S', rows: 7, columns: 14, cx: 200, cy: -10, r0: 170, r1: 210, a0: 50, a1: 130, gap: 2 }),
      ...ring({ ids: ['3D', '3C', '3B', '3A'], name: id => `3층 ${id.slice(1)}구역`, grade: 'A', rows: 7, columns: 14, cx: 200, cy: -10, r0: 220, r1: 262, a0: 54, a1: 126, gap: 2 }),
    ],
  }),
  bluesquare: venue({
    id: 'bluesquare-shinhan', type: 'theater', name: '블루스퀘어 신한카드홀', en: 'BLUESQUARE', label: 'BLUESQUARE SHINHANCARD HALL · 연습용 단순화 배치', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석', price: 170000, tone: 'vip' }, R: { label: 'R석', price: 140000, tone: 'r' }, S: { label: 'S석', price: 110000, tone: 's' }, A: { label: 'A석', price: 80000, tone: 'a' } },
    decor: [endStage(110, 8, 180, 22), { text: '1층', at: [26, 80] }, { text: '2층', at: [26, 196] }, { text: '3층', at: [26, 258] }],
    sections: [
      ...blocks({ ids: ['1L', '1C', '1R'], name: id => `1층 ${{ L: '왼쪽', C: '가운데', R: '오른쪽' }[id[1]]}`, grade: (i) => (i === 1 ? 'VIP' : 'R'), rows: 14, columns: (i) => (i === 1 ? 16 : 10), x0: 60, x1: 340, y: 42, h: 118, gap: 10 }),
      ...blocks({ ids: ['2L', '2C', '2R'], name: id => `2층 ${{ L: '왼쪽', C: '가운데', R: '오른쪽' }[id[1]]}`, grade: (i) => (i === 1 ? 'R' : 'S'), rows: 7, columns: (i) => (i === 1 ? 16 : 10), x0: 52, x1: 348, y: 172, h: 50, gap: 10 }),
      ...blocks({ ids: ['3L', '3C', '3R'], name: id => `3층 ${{ L: '왼쪽', C: '가운데', R: '오른쪽' }[id[1]]}`, grade: 'A', rows: 6, columns: (i) => (i === 1 ? 16 : 10), x0: 44, x1: 356, y: 234, h: 46, gap: 10 }),
    ],
  }),
  charlotte: venue({
    id: 'charlotte-theater', type: 'theater', name: '샤롯데씨어터', en: 'CHARLOTTE THEATER', label: 'CHARLOTTE THEATER · 연습용 단순화 배치', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석', price: 170000, tone: 'vip' }, R: { label: 'R석', price: 140000, tone: 'r' }, S: { label: 'S석', price: 100000, tone: 's' } },
    decor: [endStage(115, 8, 170, 22), { text: '1층', at: [28, 90] }, { text: '2층', at: [28, 232] }],
    sections: [
      ...ring({ ids: ['1C', '1B', '1A'], name: id => `1층 ${id.slice(1)}구역`, grade: (i) => (i === 1 ? 'VIP' : 'R'), rows: 14, columns: (i) => (i === 1 ? 16 : 10), cx: 200, cy: 0, r0: 48, r1: 176, a0: 44, a1: 136, gap: 2.5 }),
      ...ring({ ids: ['2C', '2B', '2A'], name: id => `2층 ${id.slice(1)}구역`, grade: (i) => (i === 1 ? 'R' : 'S'), rows: 8, columns: (i) => (i === 1 ? 16 : 10), cx: 200, cy: 0, r0: 196, r1: 262, a0: 54, a1: 126, gap: 2.5 }),
    ],
  }),

  // ── Ballparks ── (1루 = right side, 3루 = left side, home plate at the bottom)
  jamsil: venue({
    id: 'jamsil-baseball', type: 'ballpark', name: '잠실야구장', en: 'JAMSIL BASEBALL STADIUM', label: 'JAMSIL BASEBALL STADIUM · 연습용 단순화 배치', stage: 'GROUND',
    grades: {
      TABLE: { label: '테이블석', price: 58000, tone: 'table' }, BLUE: { label: '블루석', price: 25000, tone: 'blue' }, ORANGE: { label: '오렌지석', price: 23000, tone: 'orange' },
      RED: { label: '레드석', price: 20000, tone: 'red' }, NAVY: { label: '네이비석', price: 17000, tone: 'navy' }, GREEN: { label: '외야그린석', price: 11000, tone: 'outfield' },
    },
    decor: field(200, 150, 80),
    sections: [
      { id: 'TB', name: '중앙 테이블석', grade: 'TABLE', rows: 6, columns: 12, shape: { arc: [200, 150, 86, 114, 74, 106] } },
      { id: 'BL3', name: '3루 블루석', grade: 'BLUE', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 107, 132] } },
      { id: 'BL1', name: '1루 블루석', grade: 'BLUE', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 48, 73] } },
      { id: 'OR3', name: '3루 오렌지석', grade: 'ORANGE', rows: 10, columns: 14, shape: { arc: [200, 150, 86, 114, 133, 166] } },
      { id: 'OR1', name: '1루 오렌지석', grade: 'ORANGE', rows: 10, columns: 14, shape: { arc: [200, 150, 86, 114, 14, 47] } },
      { id: 'RD3', name: '3루 레드석', grade: 'RED', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 167, 208] } },
      { id: 'RD1', name: '1루 레드석', grade: 'RED', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, -28, 13] } },
      ...ring({ ids: ['N3A', 'N3B', 'N3C', 'N1C', 'N1B', 'N1A'].reverse(), name: id => `${id[1]}루 네이비석 ${id[2]}`, grade: 'NAVY', rows: 6, columns: 14, cx: 200, cy: 150, r0: 118, r1: 142, a0: -26, a1: 206 }),
      ...ring({ ids: ['GR', 'GC', 'GL'].reverse(), name: id => `외야그린석 ${{ L: '좌측', C: '중앙', R: '우측' }[id[1]]}`, grade: 'GREEN', rows: 8, columns: 16, cx: 200, cy: 150, r0: 86, r1: 118, a0: 214, a1: 326 }),
    ],
  }),
  sajik: venue({
    id: 'sajik-baseball', type: 'ballpark', name: '사직야구장', en: 'SAJIK BASEBALL STADIUM', label: 'SAJIK BASEBALL STADIUM · 연습용 단순화 배치', stage: 'GROUND',
    grades: {
      CENTER: { label: '중앙탁자석', price: 45000, tone: 'table' }, WIDE: { label: '와이드탁자석', price: 35000, tone: 'orange' }, CHEER: { label: '응원탁자석', price: 30000, tone: 'cheer' },
      FIELD: { label: '내야필드석', price: 22000, tone: 'blue' }, UPPER: { label: '내야상단석', price: 15000, tone: 'navy' }, OUTFIELD: { label: '외야석', price: 9000, tone: 'outfield' },
    },
    decor: field(200, 150, 80),
    sections: [
      { id: 'CT', name: '중앙탁자석', grade: 'CENTER', rows: 6, columns: 12, shape: { arc: [200, 150, 86, 114, 72, 108] } },
      { id: 'WD3', name: '3루 와이드탁자석', grade: 'WIDE', rows: 6, columns: 12, shape: { arc: [200, 150, 86, 114, 109, 128] } },
      { id: 'WD1', name: '1루 와이드탁자석', grade: 'WIDE', rows: 6, columns: 12, shape: { arc: [200, 150, 86, 114, 52, 71] } },
      { id: 'CH1', name: '1루 응원탁자석', grade: 'CHEER', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 14, 51] } },
      { id: 'FD1', name: '1루 내야필드석', grade: 'FIELD', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, -28, 13] } },
      { id: 'FD3', name: '3루 내야필드석', grade: 'FIELD', rows: 10, columns: 14, shape: { arc: [200, 150, 86, 114, 129, 166] } },
      { id: 'FD3B', name: '3루 내야필드석 (외야쪽)', grade: 'FIELD', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 167, 208] } },
      ...ring({ ids: ['U1A', 'U1B', 'UC', 'U3B', 'U3A'], name: id => (id === 'UC' ? '중앙상단석' : `${id[1]}루 내야상단석 ${id[2]}`), grade: 'UPPER', rows: 7, columns: 14, cx: 200, cy: 150, r0: 118, r1: 142, a0: -26, a1: 206 }),
      ...ring({ ids: ['OL', 'OC', 'OR'], name: id => `외야석 ${{ L: '좌측', C: '중앙', R: '우측' }[id[1]]}`, grade: 'OUTFIELD', rows: 8, columns: 16, cx: 200, cy: 150, r0: 86, r1: 118, a0: 214, a1: 326 }),
    ],
  }),
  landers: venue({
    id: 'incheon-landers', type: 'ballpark', name: '인천SSG랜더스필드', en: 'INCHEON SSG LANDERS FIELD', label: 'INCHEON SSG LANDERS FIELD · 연습용 단순화 배치', stage: 'GROUND',
    grades: {
      TABLE: { label: '내야 테이블석', price: 40000, tone: 'table' }, CHEER: { label: '응원석', price: 20000, tone: 'cheer' }, INFIELD: { label: '내야 지정석', price: 18000, tone: 'blue' },
      UPPER: { label: '2층 내야석', price: 14000, tone: 'navy' }, BBQ: { label: '외야 바비큐존', price: 30000, tone: 'orange' }, GREEN: { label: '외야 그린존', price: 10000, tone: 'outfield' },
    },
    decor: field(200, 150, 80),
    sections: [
      { id: 'TB3', name: '3루 내야 테이블석', grade: 'TABLE', rows: 5, columns: 12, shape: { arc: [200, 150, 86, 114, 91, 112] } },
      { id: 'TB1', name: '1루 내야 테이블석', grade: 'TABLE', rows: 5, columns: 12, shape: { arc: [200, 150, 86, 114, 68, 89] } },
      { id: 'IF3', name: '3루 내야 지정석', grade: 'INFIELD', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 113, 160] } },
      { id: 'IF1', name: '1루 내야 지정석', grade: 'INFIELD', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 20, 67] } },
      { id: 'CH1', name: '1루 응원석', grade: 'CHEER', rows: 10, columns: 14, shape: { arc: [200, 150, 86, 114, -28, 19] } },
      { id: 'IF3B', name: '3루 내야 지정석 (외야쪽)', grade: 'INFIELD', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 114, 161, 208] } },
      ...ring({ ids: ['UP1', 'UP2', 'UP3', 'UP4'], name: (id, i) => `2층 내야석 ${i + 1}`, grade: 'UPPER', rows: 6, columns: 14, cx: 200, cy: 150, r0: 118, r1: 140, a0: -26, a1: 206 }),
      { id: 'BBQ', name: '외야 바비큐존', grade: 'BBQ', rows: 4, columns: 10, shape: { arc: [200, 150, 86, 118, 214, 246] } },
      { id: 'GZ', name: '외야 그린존', grade: 'GREEN', rows: 8, columns: 16, shape: { arc: [200, 150, 86, 118, 248, 292] } },
      { id: 'OFR', name: '우측 외야석', grade: 'GREEN', rows: 8, columns: 14, shape: { arc: [200, 150, 86, 118, 294, 326] } },
    ],
  }),
  ncpark: venue({
    id: 'changwon-ncpark', type: 'ballpark', name: '창원NC파크', en: 'CHANGWON NC PARK', label: 'CHANGWON NC PARK · 연습용 단순화 배치', stage: 'GROUND',
    grades: { TABLE: { label: '테이블석', price: 35000, tone: 'table' }, INFIELD: { label: '내야석', price: 18000, tone: 'blue' }, UPPER: { label: '2층 내야석', price: 13000, tone: 'navy' }, OUTFIELD: { label: '외야석', price: 9000, tone: 'outfield' } },
    decor: field(200, 150, 80),
    sections: [
      ...ring({ ids: range(101, 118).reverse(), name: id => `${id}블럭`, grade: (i) => (i >= 7 && i <= 10 ? 'TABLE' : 'INFIELD'), rows: 7, columns: 12, cx: 200, cy: 150, r0: 86, r1: 114, a0: -28, a1: 208, gap: 1 }),
      ...ring({ ids: range(201, 210).reverse(), name: id => `${id}블럭`, grade: 'UPPER', rows: 6, columns: 12, cx: 200, cy: 150, r0: 118, r1: 142, a0: -26, a1: 206, gap: 1 }),
      ...ring({ ids: ['OL', 'OC', 'OR'], name: id => `외야석 ${{ L: '좌측', C: '중앙', R: '우측' }[id[1]]}`, grade: 'OUTFIELD', rows: 8, columns: 16, cx: 200, cy: 150, r0: 86, r1: 118, a0: 214, a1: 326 }),
    ],
  }),

  // ── Train (KTX-산천 8량 기준 단순화: 3호차 특실 2+1, 나머지 일반실 2+2) ──
  ktx: venue({
    id: 'ktx-sancheon', type: 'train', name: 'KTX-산천 (8량)', en: 'KTX-SANCHEON', label: 'KTX-SANCHEON · 연습용 단순화 배치', stage: '객실 앞쪽 (진행 방향)',
    seatHint: '창가 A·D(특실 A·C) / 통로 B·C(특실 B) · 연습용 배치',
    seatLabel: (seat, sec) => `${sec.name.split(' ')[0]} ${seat.row}${(sec.letters || 'ABCD')[seat.number - 1]}`,
    rowLabel: row => `${row}`,
    grades: { FIRST: { label: '특실', price: 83700, tone: 'vip' }, GENERAL: { label: '일반실', price: 59800, tone: 'r' } },
    decor: [{ text: '1 ~ 4호차', at: [200, 54] }, { text: '5 ~ 8호차', at: [200, 164] }],
    sections: [1, 2, 3, 4, 5, 6, 7, 8].map((car, i) => {
      const first = car === 3, x = 48 + (i % 4) * 78, y = i < 4 ? 70 : 180;
      return { id: `C${car}`, tag: `${car}호차`, name: `${car}호차 (${first ? '특실' : '일반실'})`, grade: first ? 'FIRST' : 'GENERAL', rows: first ? 10 : 14, columns: first ? 3 : 4, aisles: [2], letters: first ? 'ABC' : 'ABCD', shape: { rect: [x, y, 72, 44] } };
    }),
  }),

  // ── Cinemas (rows lettered from the screen; seat numbers run across the whole row) ──
  yongsan: cinema({ id: 'cgv-yongsan-imax', name: 'CGV 용산아이파크몰 IMAX관', en: 'CGV YONGSAN IMAX', price: 22000, rows: 16, side: 6, center: 18 }),
  cgvhall: cinema({ id: 'cgv-general', name: 'CGV 연습 일반관', en: 'CGV PRACTICE HALL', price: 15000, rows: 10, side: 3, center: 12, fictional: true }),
  coexdolby: cinema({ id: 'megabox-coex-dolby', name: '메가박스 코엑스 돌비시네마', en: 'MEGABOX COEX DOLBY CINEMA', price: 22000, rows: 12, side: 4, center: 14 }),
  megahall: cinema({ id: 'megabox-general', name: '메가박스 연습 일반관', en: 'MEGABOX PRACTICE HALL', price: 15000, rows: 10, side: 3, center: 12, fictional: true }),

  // ── Football (서울월드컵경기장 A매치, 등급 위치는 추정) ──
  kfa: venue({
    id: 'seoul-worldcup-football', type: 'stadium', name: '서울월드컵경기장 (A매치)', en: 'SEOUL WORLD CUP STADIUM', label: 'SEOUL WORLD CUP STADIUM · A매치 연습용 단순화 배치', stage: 'PITCH',
    grades: {
      PREMIUM: { label: '프리미엄석', price: 250000, tone: 'vip' }, FIRST: { label: '1등석', price: 120000, tone: 'blue' }, SECOND: { label: '2등석', price: 50000, tone: 's' },
      THIRD: { label: '3등석', price: 30000, tone: 'a' }, RED: { label: '레드석 (응원석)', price: 35000, tone: 'red' },
    },
    decor: [{ rect: [130, 108, 140, 84], cls: 'pitch' }, { rect: [196, 108, 8, 84], cls: 'halfway' }, { text: '본부석 쪽', at: [200, 212] }],
    sections: [
      ...ring({ ids: range(101, 120), name: id => `1층 ${id}구역`, grade: i => footballGrade(i * 18, false), rows: 7, columns: 14, cx: 200, cy: 150, r0: 118, r1: 150, a0: -9, a1: 351, sy: .7 }),
      ...ring({ ids: range(201, 220), name: id => `2층 ${id}구역`, grade: i => footballGrade(i * 18, true), rows: 6, columns: 14, cx: 200, cy: 150, r0: 155, r1: 190, a0: -9, a1: 351, sy: .7, gap: 1 }),
    ],
  }),
};

// Which venues a booking of each event type can be practiced in (first = default).
export const venueGroups = {
  concert: ['arena', 'kspo', 'gocheok', 'inspire', 'worldcup', 'sejong', 'bluesquare', 'charlotte'],
  baseball: ['ballpark', 'jamsil', 'landers', 'ncpark', 'sajik'],
  play: ['theater'],
  train: ['ktx'],
  movie: ['yongsan', 'cgvhall', 'coexdolby', 'megahall'],
  football: ['kfa'],
};

// ── Geometry → SVG ──
const round = n => Math.round(n * 10) / 10;
function arcPoints([cx, cy, r0, r1, a0, a1], sy = 1) {
  const steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 6));
  const at = (r, a) => [round(cx + r * Math.cos(a * Math.PI / 180)), round(cy + r * Math.sin(a * Math.PI / 180) * sy)];
  const outer = Array.from({ length: steps + 1 }, (_, i) => at(r1, a0 + (a1 - a0) * i / steps));
  const inner = r0 > 0 ? Array.from({ length: steps + 1 }, (_, i) => at(r0, a1 - (a1 - a0) * i / steps)) : [];
  return [...outer, ...inner];
}
function rectPoints([x, y, w, h, rotate = 0]) {
  const cx = x + w / 2, cy = y + h / 2, t = rotate * Math.PI / 180;
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => [round(cx + (px - cx) * Math.cos(t) - (py - cy) * Math.sin(t)), round(cy + (px - cx) * Math.sin(t) + (py - cy) * Math.cos(t))]);
}
export function shapePoints(shape) {
  if (shape.rect) return rectPoints(shape.rect);
  if (shape.arc) return arcPoints(shape.arc, shape.sy);
  return shape.poly;
}
export const shapePath = shape => `M${shapePoints(shape).map(p => p.join(' ')).join('L')}Z`;
// Label anchor: middle of the wedge for arcs, centre for rectangles/polygons.
export function shapeCenter(shape) {
  if (shape.arc) {
    const [cx, cy, r0, r1, a0, a1] = shape.arc, a = (a0 + a1) / 2 * Math.PI / 180, r = r0 > 0 ? (r0 + r1) / 2 : 0;
    return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a) * (shape.sy ?? 1))];
  }
  const points = shapePoints(shape);
  return points.reduce(([x, y], [px, py]) => [x + px / points.length, y + py / points.length], [0, 0]).map(round);
}

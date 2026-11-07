// Venue geometry and performance configuration are independent of the booking UI.
// `reserved` seats are kept free at start so every practice run can be completed.
export const venues = {
  arena: {
    id: 'seoul-live-sample', name: '서울 라이브 아레나', label: 'SEOUL LIVE ARENA · SAMPLE', stage: 'STAGE',
    grades: { VIP: { label: 'VIP석', price: 154000, tone: 'vip' }, R: { label: 'R석', price: 132000, tone: 'r' } },
    sections: [
      { id: 'A', grade: 'VIP', rows: 8, columns: 12 },
      { id: 'B', grade: 'VIP', rows: 8, columns: 12 },
      { id: 'C', grade: 'R', rows: 8, columns: 12 },
      { id: 'D', grade: 'R', rows: 8, columns: 12 },
      { id: 'E', grade: 'R', rows: 8, columns: 12 },
    ],
    excludedSeats: ['A-1-1', 'B-1-12'], reserved: ['D-8-11', 'D-8-12'],
  },
  ballpark: {
    id: 'practice-ballpark', name: '연습 볼파크', label: 'PRACTICE BALLPARK · SAMPLE', stage: 'GROUND',
    grades: { TABLE: { label: '테이블석', price: 45000, tone: 'table' }, CHEER: { label: '응원석', price: 18000, tone: 'cheer' }, OUTFIELD: { label: '외야석', price: 11000, tone: 'outfield' } },
    sections: [
      { id: 'T3', name: '3루 테이블', grade: 'TABLE', rows: 4, columns: 12 },
      { id: 'T1', name: '1루 테이블', grade: 'TABLE', rows: 4, columns: 12 },
      { id: 'B3', name: '3루 응원', grade: 'CHEER', rows: 8, columns: 12 },
      { id: 'B1', name: '1루 응원', grade: 'CHEER', rows: 8, columns: 12 },
      { id: 'OF', name: '외야', grade: 'OUTFIELD', rows: 8, columns: 14 },
    ],
    excludedSeats: [], reserved: ['B1-8-11', 'B1-8-12'],
  },
  theater: {
    id: 'practice-theater', name: '대학로 연습극장', label: 'PRACTICE THEATER · SAMPLE', stage: 'STAGE',
    grades: { ALL: { label: '전석', price: 55000, tone: 'r' } },
    sections: [
      { id: 'L', name: '왼쪽 블록', grade: 'ALL', rows: 8, columns: 6 },
      { id: 'C', name: '가운데 블록', grade: 'ALL', rows: 8, columns: 10 },
      { id: 'R', name: '오른쪽 블록', grade: 'ALL', rows: 8, columns: 6 },
    ],
    excludedSeats: [], reserved: ['C-8-5', 'C-8-6'],
  },
};
export const venue = venues.arena;
export const performanceLayout = { id: 'front-row-end-stage', venueId: venue.id, excludedSeats: venue.excludedSeats };
export const difficulties = {
  easy: { label: '가볍게', initialTaken: .12, interval: 2200, batch: 1, latency: 180, failure: 0 },
  normal: { label: '실전처럼', initialTaken: .38, interval: 1100, batch: 3, latency: 420, failure: .18 },
  hard: { label: '치열하게', initialTaken: .62, interval: 650, batch: 5, latency: 650, failure: .35 },
};
export function createSeats(random = Math.random, place = venue) {
  return place.sections.flatMap(section => Array.from({ length: section.rows * section.columns }, (_, i) => {
    const row = Math.floor(i / section.columns) + 1, number = i % section.columns + 1;
    const id = `${section.id}-${row}-${number}`;
    return { id, section: section.id, grade: section.grade, row, number, excluded: place.excludedSeats.includes(id), roll: random() };
  }));
}
export function validSelection(ids, seats, taken, quantity, adjacent = true) {
  if (ids.length !== quantity || new Set(ids).size !== quantity) return false;
  const selected = ids.map(id => seats.find(seat => seat.id === id));
  if (selected.some(seat => !seat || seat.excluded || taken.has(seat.id))) return false;
  if (!adjacent) return true;
  return selected.every(seat => seat.section === selected[0].section && seat.row === selected[0].row)
    && (quantity === 1 || Math.abs(selected[0].number - selected[1].number) === 1);
}
export function compete(seats, taken, count, random = Math.random) {
  const available = seats.filter(seat => !seat.excluded && !taken.has(seat.id));
  const lost = [];
  for (let i = 0; i < count && available.length; i++) {
    const index = Math.min(available.length - 1, Math.floor(random() * available.length));
    const [seat] = available.splice(index, 1);
    taken.add(seat.id); lost.push(seat.id);
  }
  return lost;
}
// `sections` optionally limits the check to an auto-assigned product's seat pool.
export function hasAvailability(seats, taken, quantity, adjacent = true, sections = null) {
  return candidates(seats, taken, quantity, adjacent, sections).length > 0;
}
function candidates(seats, taken, quantity, adjacent, sections) {
  const available = seats.filter(seat => !seat.excluded && !taken.has(seat.id) && (!sections || sections.includes(seat.section)));
  if (quantity === 1) return available.map(seat => [seat.id]);
  if (!adjacent) return available.length >= quantity ? [available.slice(0, quantity).map(seat => seat.id)] : [];
  const ids = new Set(available.map(seat => seat.id));
  return available.map(seat => [seat.id, `${seat.section}-${seat.row}-${seat.number + 1}`]).filter(([, next]) => ids.has(next));
}
// Unreserved/discount products: the system, not the buyer, picks seats from the pool.
export function autoAssign(seats, taken, quantity, adjacent, sections, random = Math.random) {
  if (!adjacent && quantity > 1) {
    const pool = seats.filter(seat => !seat.excluded && !taken.has(seat.id) && sections.includes(seat.section));
    if (pool.length < quantity) return [];
    const picked = [];
    while (picked.length < quantity) { const [seat] = pool.splice(Math.min(pool.length - 1, Math.floor(random() * pool.length)), 1); picked.push(seat.id); }
    return picked;
  }
  const options = candidates(seats, taken, quantity, adjacent, sections);
  return options.length ? options[Math.min(options.length - 1, Math.floor(random() * options.length))] : [];
}
// Practice dynamic pricing: +5% per 20% of the section already sold, rounded to 100 won.
export function demandPrice(base, seats, taken, sectionId) {
  const section = seats.filter(seat => seat.section === sectionId && !seat.excluded);
  const ratio = section.length ? section.filter(seat => taken.has(seat.id)).length / section.length : 0;
  return Math.round(base * (1 + Math.floor(ratio * 5) * .05) / 100) * 100;
}

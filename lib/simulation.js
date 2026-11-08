// Seat simulation is independent of the booking UI; venue data lives in venues.js.
// `reserved` seats are kept free at start so every practice run can be completed.
import { venues } from './venues.js';
export { venues };
export const venue = venues.arena;
export const performanceLayout = { id: 'front-row-end-stage', venueId: venue.id, excludedSeats: venue.excludedSeats };
// Three modes, judged on the same three criteria: queue size, how fast seats vanish, how often payment bounces.
export const difficulties = {
  easy: { label: '쌩초보', desc: '흐름부터 천천히 익히기', queue: 24, queueSteps: 3, initialTaken: .12, interval: 2200, batch: 1, latency: 180, failure: 0 },
  normal: { label: '일반인', desc: '평범한 인기 공연 오픈', queue: 186, queueSteps: 5, initialTaken: .38, interval: 1100, batch: 3, latency: 420, failure: .18 },
  hard: { label: '매크로급', desc: '매크로와 겨루는 오픈 1초', queue: 4200, queueSteps: 8, initialTaken: .7, interval: 450, batch: 7, latency: 750, failure: .4 },
};
export function createSeats(random = Math.random, place = venue) {
  return place.sections.flatMap(section => Array.from({ length: section.rows * section.columns }, (_, i) => {
    const row = Math.floor(i / section.columns) + 1, number = i % section.columns + 1;
    const id = `${section.id}-${row}-${number}`;
    // `block` counts the aisles to the seat's left: seats across an aisle are never adjacent.
    const block = (section.aisles || []).filter(a => number > a).length;
    return { id, section: section.id, grade: section.grade, row, number, block, excluded: place.excludedSeats.includes(id), roll: random() };
  }));
}
export function validSelection(ids, seats, taken, quantity, adjacent = true) {
  if (ids.length !== quantity || new Set(ids).size !== quantity) return false;
  const selected = ids.map(id => seats.find(seat => seat.id === id));
  if (selected.some(seat => !seat || seat.excluded || taken.has(seat.id))) return false;
  if (!adjacent) return true;
  return selected.every(seat => seat.section === selected[0].section && seat.row === selected[0].row && seat.block === selected[0].block)
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
  const byId = new Map(available.map(seat => [seat.id, seat]));
  return available.map(seat => [seat, byId.get(`${seat.section}-${seat.row}-${seat.number + 1}`)]).filter(([seat, next]) => next && next.block === seat.block).map(([seat, next]) => [seat.id, next.id]);
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

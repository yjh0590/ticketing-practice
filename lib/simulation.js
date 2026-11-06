// Venue geometry and performance configuration are independent of the booking UI.
export const venue = {
  id: 'seoul-live-sample', name: '서울 라이브 아레나',
  sections: [
    { id: 'A', grade: 'VIP', rows: 8, columns: 12, x: 160, y: 170 },
    { id: 'B', grade: 'VIP', rows: 8, columns: 12, x: 340, y: 170 },
    { id: 'C', grade: 'R', rows: 8, columns: 12, x: 90, y: 310 },
    { id: 'D', grade: 'R', rows: 8, columns: 12, x: 250, y: 310 },
    { id: 'E', grade: 'R', rows: 8, columns: 12, x: 410, y: 310 },
  ],
};
export const performanceLayout = { id: 'front-row-end-stage', venueId: venue.id, excludedSeats: ['A-1-1', 'B-1-12'] };
export const difficulties = {
  easy: { label: '가볍게', initialTaken: .12, interval: 2200, batch: 1, latency: 180, failure: 0 },
  normal: { label: '실전처럼', initialTaken: .38, interval: 1100, batch: 3, latency: 420, failure: .18 },
  hard: { label: '치열하게', initialTaken: .62, interval: 650, batch: 5, latency: 650, failure: .35 },
};
export function createSeats(random = Math.random) {
  return venue.sections.flatMap(section => Array.from({ length: section.rows * section.columns }, (_, i) => {
    const row = Math.floor(i / section.columns) + 1, number = i % section.columns + 1;
    const id = `${section.id}-${row}-${number}`;
    return { id, section: section.id, grade: section.grade, row, number, excluded: performanceLayout.excludedSeats.includes(id), roll: random() };
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
export function hasAvailability(seats, taken, quantity, adjacent = true) {
  const available = seats.filter(seat => !seat.excluded && !taken.has(seat.id));
  if (quantity === 1 || !adjacent) return available.length >= quantity;
  const ids = new Set(available.map(seat => seat.id));
  return available.some(seat => ids.has(`${seat.section}-${seat.row}-${seat.number + 1}`));
}

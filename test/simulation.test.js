import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeats, validSelection, compete, hasAvailability, autoAssign, demandPrice, venues } from '../lib/simulation.js';
import { providers, events, categories, seatStep, gateStep } from '../lib/providers.js';
import { venueGroups, shapePoints, shapeCenter } from '../lib/venues.js';
test('venue has unique seats and performance exclusions', () => {
 const seats = createSeats(() => .5);
 assert.equal(seats.length, 480);
 assert.equal(new Set(seats.map(s => s.id)).size, 480);
 assert.deepEqual(seats.filter(s => s.excluded).map(s => s.id), ['A-1-1', 'B-1-12']);
 assert.equal(validSelection(['A-1-1'], seats, new Set(), 1), false);
});
test('confirmation rejects occupied, unknown and duplicate seats', () => {
 const seats = createSeats();
 assert.equal(validSelection(['A-1-2'], seats, new Set(), 1), true);
 assert.equal(validSelection(['A-1-2'], seats, new Set(['A-1-2']), 1), false);
 assert.equal(validSelection(['unknown'], seats, new Set(), 1), false);
 assert.equal(validSelection(['A-1-2', 'A-1-2'], seats, new Set(), 2), false);
});
test('two tickets must be adjacent in the same row and section', () => {
 const seats = createSeats();
 assert.equal(validSelection(['A-1-3', 'A-1-2'], seats, new Set(), 2), true);
 for (const pair of [['A-1-2', 'A-1-4'], ['A-1-2', 'A-2-3'], ['A-1-2', 'B-1-3']]) assert.equal(validSelection(pair, seats, new Set(), 2), false);
});
test('competition invalidates pending selection and handles exhausted seats', () => {
 const seats = createSeats(); const taken = new Set(['A-1-2']);
 assert.deepEqual(compete(seats, taken, 2, () => 0), ['A-1-3', 'A-1-4']);
 assert.equal(validSelection(['A-1-3'], seats, taken, 1), false);
 assert.equal(compete(seats, taken, 1000).length, 475);
 assert.equal(hasAvailability(seats, taken, 1), false);
});
test('sold out detection distinguishes singles from contiguous pairs', () => {
 const seats = createSeats(); const taken = new Set(seats.map(s => s.id));
 taken.delete('D-8-10'); taken.delete('D-8-12');
 assert.equal(hasAvailability(seats, taken, 1), true);
 assert.equal(hasAvailability(seats, taken, 2), false);
 taken.delete('D-8-11');
 assert.equal(hasAvailability(seats, taken, 2), true);
});
test('provider practice permits scattered seats unless adjacent training is requested', () => {
 const seats = createSeats(); const taken = new Set(seats.map(s => s.id));
 taken.delete('A-1-2'); taken.delete('E-8-12');
 assert.equal(validSelection(['A-1-2', 'E-8-12'], seats, taken, 2, false), true);
 assert.equal(validSelection(['A-1-2', 'E-8-12'], seats, taken, 2, true), false);
 assert.equal(hasAvailability(seats, taken, 2, false), true);
 assert.equal(hasAvailability(seats, taken, 2, true), false);
});
test('every venue has unique seat ids and free reserved seats', () => {
 for (const place of Object.values(venues)) {
  const seats = createSeats(() => .5, place);
  assert.equal(new Set(seats.map(s => s.id)).size, seats.length, place.id);
  for (const id of place.reserved) assert.ok(seats.some(s => s.id === id && !s.excluded), id);
  for (const section of place.sections) assert.ok(place.grades[section.grade], section.id);
  assert.equal(new Set(place.sections.map(s => s.id)).size, place.sections.length, place.id);
  assert.equal(validSelection(place.reserved, seats, new Set(), 2, true), true, `${place.id} reserved pair is adjacent`);
 }
});
test('every venue map fits the 400x300 drawing and each zone label sits on its zone', () => {
 for (const place of Object.values(venues)) for (const section of place.sections) {
  assert.ok(!section.id.includes('-'), `${section.id} would break seat ids`);
  for (const [x, y] of shapePoints(section.shape)) assert.ok(x >= 0 && x <= 400 && y >= 0 && y <= 300, `${place.id}/${section.id} at ${x},${y}`);
  const [x, y] = shapeCenter(section.shape), xs = shapePoints(section.shape).map(p => p[0]), ys = shapePoints(section.shape).map(p => p[1]);
  assert.ok(x >= Math.min(...xs) && x <= Math.max(...xs) && y >= Math.min(...ys) && y <= Math.max(...ys), `${place.id}/${section.id} label`);
 }
});
test('venue choices exist for every event type', () => {
 for (const [type, ids] of Object.entries(venueGroups)) {
  assert.equal(ids[0], events[type].venue, `${type} default stays the original practice venue`);
  for (const id of ids) assert.ok(venues[id], id);
 }
});
test('auto assignment stays inside the product pool and respects adjacency', () => {
 const seats = createSeats(() => .5, venues.theater); const taken = new Set();
 const single = autoAssign(seats, taken, 1, true, ['L'], () => 0);
 assert.deepEqual(single, ['L-1-1']);
 const pair = autoAssign(seats, taken, 2, true, ['C'], () => .999);
 const [a, b] = pair.map(id => seats.find(s => s.id === id));
 assert.ok(a.section === 'C' && a.row === b.row && b.number - a.number === 1);
 const scattered = autoAssign(seats, taken, 2, false, ['L', 'R'], () => .5);
 assert.equal(new Set(scattered).size, 2);
 assert.ok(scattered.every(id => /^[LR]-/.test(id)));
 seats.filter(s => s.section === 'L').forEach(s => taken.add(s.id));
 assert.deepEqual(autoAssign(seats, taken, 1, true, ['L']), []);
 assert.equal(hasAvailability(seats, taken, 1, true, ['L']), false);
 assert.equal(hasAvailability(seats, taken, 1, true, ['L', 'C']), true);
});
test('demand pricing rises with section sales in 5% steps', () => {
 const seats = createSeats(() => .5, venues.ballpark); const taken = new Set();
 assert.equal(demandPrice(18000, seats, taken, 'B1'), 18000);
 seats.filter(s => s.section === 'B1').slice(0, 48).forEach(s => taken.add(s.id));
 assert.equal(demandPrice(18000, seats, taken, 'B1'), 19800);
 seats.filter(s => s.section === 'B1').forEach(s => taken.add(s.id));
 assert.equal(demandPrice(18000, seats, taken, 'B1'), 22500);
 assert.equal(demandPrice(18000, seats, taken, 'B3'), 18000);
});
test('provider flows are internally consistent', () => {
 for (const p of Object.values(providers)) {
  assert.equal(p.steps.length, p.flow.length, p.id);
  assert.ok(seatStep(p) > -1, p.id);
  assert.equal(p.flow.at(-1), 'payment', p.id);
  if (p.partner) assert.ok(providers[p.partner] && gateStep(p) > -1, p.id);
  if (p.flow.includes('option')) for (const o of p.options) assert.ok(o.sections.every(id => venues[events[p.event || 'concert'].venue].sections.some(s => s.id === id)), `${p.id}/${o.id}`);
 }
});
test('seats across an aisle are never a pair (train cars, cinema blocks)', () => {
 const seats = createSeats(() => .5, venues.ktx), taken = new Set();
 assert.equal(validSelection(['C1-1-1', 'C1-1-2'], seats, taken, 2, true), true);
 assert.equal(validSelection(['C1-1-2', 'C1-1-3'], seats, taken, 2, true), false, 'B and C sit across the aisle');
 seats.filter(s => s.section === 'C1' && s.row === 1 && s.number !== 2 && s.number !== 3).forEach(s => taken.add(s.id));
 assert.equal(hasAvailability(seats.filter(s => s.section === 'C1' && s.row === 1), taken, 2, true), false);
 assert.equal(venues.yongsan.seatLabel({ row: 16, number: 5 }, venues.yongsan.sections[2]), 'P열 29번');
});
test('every provider sits in exactly one main-screen category', () => {
 const listed = categories.flatMap(c => c.ids);
 assert.equal(new Set(listed).size, listed.length, 'no provider is listed twice');
 assert.deepEqual([...listed].sort(), Object.keys(providers).sort());
 assert.deepEqual(categories.find(c => c.id === 'baseball').ids.sort(), ['lotte', 'nc', 'nolps', 'ssg', 'tlbaseball']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeats, validSelection, compete, hasAvailability } from '../lib/simulation.js';
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

import { venue, difficulties, createSeats, validSelection, compete, hasAvailability } from './lib/simulation.js';
const $ = id => document.getElementById(id);
const state = { phase: 'ready', difficulty: 'normal', quantity: 1, section: null, seats: createSeats(), taken: new Set(), selected: [], started: 0, firstClick: null, failures: 0, ticks: null, clock: null, run: 0 };
const STORAGE_KEY = 'frontrow-history-v1';
function readHistory() {
  try {
    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(entries) ? entries.filter(e => e && Number.isFinite(e.elapsed) && typeof e.date === 'string' && typeof e.seats === 'string' && Object.hasOwn(difficulties, e.difficulty) && Number.isFinite(e.failures)).slice(0, 30) : [];
  } catch { return []; }
}
let history = readHistory();
const seconds = ms => `${(ms / 1000).toFixed(1)}초`;
const seatLabel = seat => `${seat.section}구역 ${seat.row}열 ${seat.number}번`;
function say(text, error = false) { $('simulation-status').textContent = text; $('simulation-status').classList.toggle('error', error); }
function stop() { clearInterval(state.ticks); clearInterval(state.clock); }
function lockSettings(locked) { document.querySelectorAll('.settings select, [data-difficulty]').forEach(el => { el.disabled = locked; }); }
function updateSteps() {
  ['ready', 'seats', 'result'].forEach((step, i) => {
    const current = state.phase === 'ready' || state.phase === 'countdown' ? 0 : state.phase === 'active' || state.phase === 'checking' ? 1 : 2;
    $(`step-${step}`).classList.toggle('current', i === current); $(`step-${step}`).classList.toggle('complete', i < current);
  });
}
function render() {
  const available = state.seats.filter(s => !s.excluded && !state.taken.has(s.id));
  $('map-title').textContent = state.section ? `${state.section}구역 · ${venue.sections.find(s => s.id === state.section).grade}` : '전체 구역';
  $('available-count').textContent = `선택 가능 ${available.filter(s => !state.section || s.section === state.section).length}석`;
  $('back-to-zones').hidden = !state.section;
  $('cancel-practice').hidden = !['countdown', 'active', 'checking'].includes(state.phase);
  if (state.section) renderSeats(); else renderZones(available);
  const selected = state.selected.map(id => state.seats.find(s => s.id === id));
  $('selection-text').textContent = selected.length ? selected.map(seatLabel).join(' / ') : '아직 선택한 좌석이 없어요';
  const button = $('action-button');
  button.disabled = state.phase === 'checking' || state.phase === 'countdown' || (state.phase === 'active' && !validSelection(state.selected, state.seats, state.taken, state.quantity));
  button.textContent = state.phase === 'ready' ? '연습 시작 ↗' : state.phase === 'countdown' ? '곧 시작해요…' : state.phase === 'checking' ? '좌석 확인 중…' : state.phase === 'active' ? `좌석 확정 (${state.selected.length}/${state.quantity}) →` : '다시 연습하기 ↗';
  updateSteps();
}
function renderZones(available) {
  $('map').className = 'map overview';
  $('map').innerHTML = `<div class="arena"><div class="arena-ring"></div><div class="stage">STAGE<span>무대</span></div><div class="stage-runway"></div><div class="zone-grid">${venue.sections.map(section => `<button class="zone zone-${section.id} ${section.grade.toLowerCase()}" data-zone="${section.id}" aria-label="${section.id}구역 ${section.grade}, ${available.filter(s => s.section === section.id).length}석 선택 가능"><span>${section.grade}</span><strong>${section.id}</strong><small>${available.filter(s => s.section === section.id).length}석</small></button>`).join('')}</div><span class="arena-label">SEOUL LIVE ARENA · SAMPLE LAYOUT</span></div>`;
}
function renderSeats() {
  const focusedSeat = document.activeElement?.dataset.seat;
  const section = venue.sections.find(s => s.id === state.section);
  $('map').className = 'map detail';
  $('map').innerHTML = `<div class="seat-stage">STAGE · 이쪽이 무대예요</div><div class="seat-scroll"><div class="seat-grid" style="--columns:${section.columns}">${Array.from({ length: section.rows }, (_, row) => `<span class="row-label">${row + 1}열</span>${state.seats.filter(s => s.section === section.id && s.row === row + 1).map(seat => {
    const taken = state.taken.has(seat.id) || seat.excluded, selected = state.selected.includes(seat.id);
    return `<button class="seat ${section.grade.toLowerCase()} ${taken ? 'taken' : ''} ${selected ? 'chosen' : ''}" data-seat="${seat.id}" aria-label="${seatLabel(seat)}${taken ? ' 선택 불가' : ''}" aria-pressed="${selected}" ${taken ? 'disabled' : ''}>${seat.number}</button>`;
  }).join('')}`).join('')}</div></div><p class="seat-hint">${state.phase === 'ready' ? '둘러보기 모드 · 연습을 시작하면 좌석을 선택할 수 있어요.' : state.quantity === 2 ? '같은 열에서 붙어 있는 두 자리를 선택하세요.' : '원하는 좌석을 선택하고 좌석 확정을 눌러주세요.'}</p>`;
  if (focusedSeat) $('map').querySelector(`[data-seat="${focusedSeat}"]:not(:disabled)`)?.focus({ preventScroll: true });
}
function reset() {
  stop(); state.run++; Object.assign(state, { phase: 'ready', seats: createSeats(), taken: new Set(), selected: [], firstClick: null, failures: 0, started: 0 });
  $('timer').textContent = '00:00.0'; $('booking-title').textContent = '공연장을 미리 둘러보세요';
  lockSettings(false); say('준비되면 연습을 시작하세요. 3초 카운트다운 뒤 예매가 열려요.'); render();
}
async function start() {
  reset(); state.phase = 'countdown'; state.section = null; lockSettings(true);
  const run = state.run;
  for (let i = 3; i > 0; i--) {
    say(`${i}초 후 예매가 시작돼요. 원하는 구역을 떠올려보세요.`); render();
    await new Promise(resolve => setTimeout(resolve, 1000)); if (state.run !== run) return;
  }
  const config = difficulties[state.difficulty];
  state.taken = new Set(state.seats.filter(s => s.roll < config.initialTaken).map(s => s.id));
  // Always leave one contiguous pair so every run starts with a reachable goal.
  state.taken.delete('D-8-11'); state.taken.delete('D-8-12');
  state.phase = 'active'; state.started = performance.now();
  $('booking-title').textContent = '지금, 나의 자리를 찾아보세요'; say('예매가 열렸어요! 구역을 선택하고 원하는 좌석을 잡아보세요.');
  state.clock = setInterval(() => {
    const elapsed = performance.now() - state.started;
    $('timer').textContent = `${String(Math.floor(elapsed / 60000)).padStart(2, '0')}:${((elapsed % 60000) / 1000).toFixed(1).padStart(4, '0')}`;
  }, 80);
  state.ticks = setInterval(() => {
    if (state.phase !== 'active' && state.phase !== 'checking') return;
    compete(state.seats, state.taken, config.batch);
    // Pending confirmations retain selection, so confirm() can report the lost seat.
    if (state.phase === 'active' && state.selected.some(id => state.taken.has(id))) {
      state.failures++; state.selected = state.selected.filter(id => !state.taken.has(id));
      say('선택했던 좌석을 다른 관객이 먼저 잡았어요. 다음 후보를 골라주세요.', true);
    }
    if (!hasAvailability(state.seats, state.taken, state.quantity)) finish(false);
    else render();
  }, config.interval);
  render();
}
async function confirm() {
  if (!validSelection(state.selected, state.seats, state.taken, state.quantity)) return;
  state.phase = 'checking'; const run = state.run; render();
  await new Promise(resolve => setTimeout(resolve, difficulties[state.difficulty].latency));
  if (run !== state.run || state.phase !== 'checking') return;
  if (state.selected.some(id => state.taken.has(id)) || Math.random() < difficulties[state.difficulty].failure) {
    state.selected.forEach(id => state.taken.add(id)); state.selected = []; state.failures++; state.phase = 'active';
    say('아쉽지만 방금 다른 관객이 선점했어요. 다른 좌석으로 다시 도전하세요.', true);
    if (!hasAvailability(state.seats, state.taken, state.quantity)) finish(false); else render();
  } else finish(true);
}
function finish(success) {
  stop(); state.phase = 'done'; lockSettings(false);
  const elapsed = performance.now() - state.started;
  const seats = success ? state.selected.map(id => seatLabel(state.seats.find(s => s.id === id))).join(' / ') : '선택 가능한 좌석이 모두 소진됐어요';
  const result = { date: new Date().toISOString(), elapsed, seats, difficulty: state.difficulty, failures: state.failures, firstClick: state.firstClick, success, performance: $('performance').value };
  history.unshift(result); history = history.slice(0, 30);
  let saved = true;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch { saved = false; }
  $('result-title').textContent = success ? '내 자리를 찾았어요!' : '다음 기회를 준비해요';
  $('result-description').textContent = seats;
  $('result-time').textContent = seconds(elapsed); $('result-failures').textContent = `${state.failures}회`;
  $('result-first').textContent = state.firstClick === null ? '—' : seconds(state.firstClick);
  $('result-tip').textContent = (success ? (state.failures ? '실패해도 다시 선택한 순발력, 다음 실전에서도 기억하세요.' : '좋아요! 다음에는 난이도를 높이거나 연석에 도전해보세요.') : '다음 연습에서는 대안 구역을 정해두고 더 빠르게 이동해보세요.') + (saved ? '' : ' 브라우저 저장이 차단되어 기록은 이 창에서만 유지돼요.');
  say(success ? '좌석 선택 성공! 결과를 확인하고 다시 도전해보세요.' : '이번 연습이 끝났어요. 다시 도전할 수 있어요.');
  render(); renderHistory(); $('result-dialog').showModal();
}
function renderHistory() {
  $('history-count').textContent = history.length;
  const list = $('history-list'); list.replaceChildren();
  if (!history.length) { list.innerHTML = '<div class="empty-history"><span>↗</span><h3>첫 번째 연습을 기다리고 있어요</h3><p>연습을 마치면 소요 시간과 선택한 좌석이 여기에 쌓여요.</p><button class="secondary" data-view="practice">연습하러 가기 →</button></div>'; return; }
  history.forEach(entry => {
    const row = document.createElement('article'); row.className = 'history-row';
    [entry.success ? '성공' : '종료', new Date(entry.date).toLocaleString('ko-KR'), difficulties[entry.difficulty].label, entry.seats, `${seconds(entry.elapsed)} · 선점 실패 ${entry.failures}회`].forEach((text, i) => { const el = document.createElement(i === 3 ? 'strong' : 'span'); el.textContent = text; if (i === 0) el.className = 'history-badge'; row.append(el); });
    list.append(row);
  });
}
document.addEventListener('click', event => {
  const view = event.target.closest('[data-view]')?.dataset.view;
  if (view) { $('practice-view').hidden = view !== 'practice'; $('history-view').hidden = view !== 'history'; document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view)); }
  const difficulty = event.target.closest('[data-difficulty]')?.dataset.difficulty;
  if (difficulty && ['ready', 'done'].includes(state.phase)) {
    state.difficulty = difficulty;
    document.querySelectorAll('[data-difficulty]').forEach(el => { el.classList.toggle('selected', el.dataset.difficulty === difficulty); el.setAttribute('aria-pressed', el.dataset.difficulty === difficulty); });
    $('difficulty-help').textContent = { easy: '경쟁이 적고 좌석 확정 시 무작위 실패가 없어요.', normal: '좌석이 실시간으로 줄어들고, 선점에 실패할 수 있어요.', hard: '빠르게 줄어드는 좌석 속에서 대안을 찾는 연습이에요.' }[difficulty];
  }
  const section = event.target.closest('[data-zone]')?.dataset.zone;
  if (section) { state.section = section; render(); $('map').querySelector('.seat:not(:disabled)')?.focus({ preventScroll: true }); }
  const id = event.target.closest('[data-seat]')?.dataset.seat;
  if (id && state.phase === 'active' && !state.taken.has(id)) {
    if (state.firstClick === null) state.firstClick = performance.now() - state.started;
    if (state.selected.includes(id)) state.selected = state.selected.filter(s => s !== id);
    else { if (state.selected.length >= state.quantity) state.selected = []; state.selected.push(id); }
    say(state.quantity === 2 && state.selected.length === 2 && !validSelection(state.selected, state.seats, state.taken, 2) ? '연석은 같은 구역·같은 열의 붙어 있는 두 좌석을 선택해야 해요.' : '좌석을 고른 뒤 아래의 좌석 확정을 눌러주세요.'); render();
  }
});
$('quantity').addEventListener('change', event => { state.quantity = Number(event.target.value); state.selected = []; render(); });
$('back-to-zones').addEventListener('click', () => { state.section = null; render(); });
$('cancel-practice').addEventListener('click', reset);
$('action-button').addEventListener('click', () => state.phase === 'active' ? confirm() : ['ready', 'done'].includes(state.phase) ? start() : undefined);
$('retry').addEventListener('click', () => { $('result-dialog').close(); reset(); });
$('close-result').addEventListener('click', () => $('result-dialog').close());
$('clear-history').addEventListener('click', () => {
  if (!history.length || !window.confirm('이 브라우저의 연습 기록을 모두 지울까요?')) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch { say('브라우저 저장소 접근이 제한되어 기록을 지우지 못했어요.', true); return; }
  history = []; renderHistory();
});
window.addEventListener('pagehide', stop);
render(); renderHistory();

import { venue, difficulties, createSeats, validSelection, compete, hasAvailability } from './lib/simulation.js';
import { providers, dates, calendar } from './lib/providers.js';
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'frontrow-history-v1';
const state = { provider: 'nol', date: dates[0].id, phase: 'idle', step: 0, section: null, selected: [], taken: new Set(), seats: [], run: 0, started: 0, elapsed: 0, seatTime: null, firstClick: null, failures: 0, holdStarted: null, captcha: '', captchaError: '', discount: 0, delivery: 'venue', payment: 'card', agreed: false, queue: 0 };
let clock, competitors, queueTimer;
const provider = () => providers[state.provider];
const seconds = ms => ms === null ? '—' : `${(ms / 1000).toFixed(1)}초`;
const price = seat => seat.grade === 'VIP' ? 154000 : 132000;
const money = value => `${value.toLocaleString('ko-KR')}원`;
const seatLabel = seat => `${seat.section}구역 ${seat.row}열 ${seat.number}번`;
const selectedSeats = () => state.selected.map(id => state.seats.find(s => s.id === id)).filter(Boolean);
const config = () => difficulties[state.difficulty];
const selectionValid = () => validSelection(state.selected, state.seats, state.taken, state.quantity, state.adjacent);
function readHistory() {
  try {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(records) ? records.filter(r => r && Number.isFinite(r.elapsed) && typeof r.seats === 'string' && typeof r.date === 'string' && Object.hasOwn(difficulties, r.difficulty)).slice(0, 30) : [];
  } catch { return []; }
}
let history = readHistory();
function clearTimers() { clearInterval(clock); clearInterval(competitors); clearInterval(queueTimer); }
function setSettingsLocked(locked) { document.querySelectorAll('.practice-settings input,.practice-settings select,[data-provider]').forEach(el => { el.disabled = locked; }); $('book-button').disabled = locked; }
function renderProduct() {
  document.body.dataset.provider = state.provider;
  document.querySelectorAll('button[data-provider]').forEach(el => { el.classList.toggle('selected', el.dataset.provider === state.provider); el.setAttribute('aria-pressed', el.dataset.provider === state.provider); });
  $('product-brand').textContent = provider().brand;
  $('product-calendar').innerHTML = calendar(state.date, 'product');
  const date = dates.find(d => d.id === state.date);
  $('product-session').textContent = `1회 · ${date.time}`; $('date-summary').textContent = `${date.label} ${date.time}`;
}
function changeDate(id) {
  if (state.date !== id) { state.date = id; state.section = null; state.selected = []; state.seatTime = null; state.holdStarted = null; state.discount = 0; }
  renderProduct(); if ($('booking-dialog').open) renderWindow();
}
function totals() { const ticket = selectedSeats().reduce((sum, seat) => sum + price(seat), 0); return { ticket, discount: Math.floor(ticket * state.discount), shipping: state.delivery === 'post' ? 3500 : 0 }; }
function total() { const t = totals(); return t.ticket - t.discount + t.shipping; }
function resetSeats() {
  state.seats = createSeats(); state.taken = new Set(state.seats.filter(s => s.roll < config().initialTaken).map(s => s.id));
  state.taken.delete('D-8-11'); state.taken.delete('D-8-12'); state.selected = []; state.section = null; state.seatTime = null; state.holdStarted = null;
}
async function start() {
  if (state.phase !== 'idle') return;
  clearTimers(); state.run++;
  Object.assign(state, { phase: 'countdown', step: 0, selected: [], started: 0, elapsed: 0, seatTime: null, firstClick: null, failures: 0, holdStarted: null, discount: 0, delivery: 'venue', payment: 'card', agreed: false, captchaError: '', difficulty: $('difficulty').value, quantity: Number($('quantity').value), adjacent: $('adjacent').checked });
  setSettingsLocked(true); const run = state.run;
  for (let i = 3; i > 0; i--) { $('book-button').textContent = `${i}초 후 예매창 열림`; await new Promise(resolve => setTimeout(resolve, 1000)); if (run !== state.run) return; }
  resetSeats(); state.started = performance.now();
  $('window-title').textContent = `${provider().brand} · PC 예매 연습`;
  state.phase = $('use-queue').checked ? 'queue' : 'booking';
  $('booking-dialog').showModal(); renderWindow();
  clock = setInterval(() => {
    state.elapsed = performance.now() - state.started;
    document.querySelectorAll('[data-elapsed]').forEach(el => { el.textContent = seconds(state.elapsed); });
    if (state.holdStarted !== null) {
      const remaining = Math.max(0, 180 - Math.floor((performance.now() - state.holdStarted) / 1000));
      document.querySelectorAll('[data-hold]').forEach(el => { el.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`; });
      if (!remaining) { state.holdStarted = null; state.seatTime = null; state.selected = []; state.step = 1; state.discount = 0; renderWindow(); startCompetition(); window.alert('연습용 좌석 유지시간이 초과되었습니다. 좌석을 다시 선택해주세요.'); }
    }
  }, 100);
  if (state.phase === 'queue') {
    const initial = { easy: 24, normal: 186, hard: 824 }[state.difficulty]; state.queue = initial; renderWindow(); let progress = 0;
    queueTimer = setInterval(() => { if (++progress >= 5) { clearInterval(queueTimer); state.phase = 'booking'; renderWindow(); } else { state.queue = Math.ceil(initial * (1 - progress / 5)); renderWindow(); } }, 700);
  }
}
function cancel() {
  clearTimers(); state.run++; state.phase = 'idle'; state.holdStarted = null; if ($('booking-dialog').open) $('booking-dialog').close();
  setSettingsLocked(false); $('book-button').textContent = '예매하기'; renderProduct();
}
function sidebar() {
  const date = dates.find(d => d.id === state.date), t = totals();
  return `<aside class="booking-sidebar"><div class="summary-show"><div class="mini-poster">FRONT<br>ROW</div><div><strong>2026 FRONT ROW<br>: THE LIVE</strong><p>서울 라이브 아레나<br>2026.12.12 ~ 12.13</p></div></div><h3>${provider().summaryTitle}</h3><dl class="summary-info"><div><dt>일시</dt><dd>${date.label}<br>${date.time}</dd></div><div><dt>선택좌석<br>(${state.selected.length}석)</dt><dd id="sidebar-seats">${selectedSeats().map(s => `${s.grade} ${seatLabel(s)}`).join('<br>') || '<span class="gray">선택한 좌석이 없습니다.</span>'}</dd></div><div><dt>티켓금액</dt><dd>${money(t.ticket)}</dd></div><div><dt>할인금액</dt><dd>−${money(t.discount)}</dd></div><div><dt>수령방법</dt><dd>${state.delivery === 'post' ? '배송 (가상 주소)' : '현장수령'}</dd></div><div><dt>배송료</dt><dd>${money(t.shipping)}</dd></div></dl><div class="summary-total"><span>총 결제금액</span><strong>${money(total())}</strong></div><div class="hold-info">${state.holdStarted !== null ? '좌석 유지 <strong data-hold>3:00</strong><small>연습용 제한시간</small>' : '좌석도·금액은 가상 예시입니다.'}</div><div class="window-actions"><button id="previous-step" ${state.step === 0 || state.phase !== 'booking' ? 'disabled' : ''}>이전단계</button><button id="next-step" class="next-button" ${state.phase !== 'booking' || (state.step === 1 && !selectionValid()) || (state.step === 4 && !state.agreed) ? 'disabled' : ''}>${state.phase === 'checking' ? '확인 중…' : state.step === 1 ? provider().seatAction : state.step === 4 ? '가상 결제 완료' : provider().nextAction} <span>›</span></button></div></aside>`;
}
function renderWindow() {
  if (!$('booking-dialog').open) return;
  const focus = document.activeElement?.dataset.seat;
  const content = $('window-content');
  if (state.phase === 'queue') {
    content.innerHTML = `<section class="queue-screen"><span class="queue-symbol">⌛</span><h2>예매 대기 중입니다.</h2><p>접속 순서에 따라 예매창으로 자동 이동합니다.</p><div class="queue-number"><span>나의 대기순서</span><strong>${state.queue.toLocaleString()}</strong></div><progress max="824" value="${824 - state.queue}" aria-label="연습 대기열 진행"></progress><p class="gray">연습용 대기열 · 실제 대기시간과 무관합니다.</p><button id="cancel-queue" class="plain-button">연습 중단</button></section>`; return;
  }
  content.innerHTML = `<ol class="booking-steps">${provider().steps.map((step, i) => `<li class="${i === state.step ? 'current' : i < state.step ? 'complete' : ''}" ${i === state.step ? 'aria-current="step"' : ''}><small>STEP ${i + 1}</small><strong>${step}</strong></li>`).join('')}</ol><div class="booking-body"><section class="booking-main">${stepContent()}</section>${sidebar()}</div><div class="window-status"><span>독립 연습 화면 · ${provider().name} PC형 · 가상 공연장</span><span>진행 시간 <b data-elapsed>${seconds(state.elapsed)}</b></span></div>`;
  if (state.phase === 'captcha') renderCaptcha();
  if (focus) content.querySelector(`[data-seat="${focus}"]:not(:disabled)`)?.focus({ preventScroll: true });
}
function stepContent() {
  if (state.step === 0) return `<div class="panel-title"><h2>${provider().steps[0]}</h2><span>관람일과 회차를 확인하세요.</span></div><div class="date-step"><section><h3>관람일 선택</h3>${calendar(state.date, 'window')}</section><section><h3>회차 선택</h3><button class="session-row selected" id="window-session">1회　${dates.find(d => d.id === state.date).time} <span>선택</span></button><div class="remaining-table"><h4>좌석등급 / 잔여석</h4><p><i class="vip-dot"></i> VIP석 <b>${available().filter(s => s.grade === 'VIP').length}석</b></p><p><i class="r-dot"></i> R석 <b>${available().filter(s => s.grade === 'R').length}석</b></p></div></section></div><div class="step-notice">관람일을 선택한 후 오른쪽 아래 <b>다음단계</b>를 눌러주세요.</div>`;
  if (state.step === 1) return seatContent();
  if (state.step === 2) return `<div class="panel-title"><h2>${provider().steps[2]}</h2><span>선택한 좌석의 가격을 확인하세요.</span></div><div class="form-section"><h3>가격 / 할인 선택</h3><table class="price-table"><thead><tr><th>좌석등급</th><th>가격</th><th>매수</th></tr></thead><tbody>${['VIP', 'R'].filter(grade => selectedSeats().some(s => s.grade === grade)).map(grade => `<tr><td>${grade}석 · 일반</td><td>${money(grade === 'VIP' ? 154000 : 132000)}</td><td>${selectedSeats().filter(s => s.grade === grade).length}매</td></tr>`).join('')}</tbody></table><label class="form-row">할인 선택<select id="discount"><option value="0" ${state.discount === 0 ? 'selected' : ''}>일반 · 할인 없음</option><option value="0.1" ${state.discount === .1 ? 'selected' : ''}>연습용 10% 할인</option></select></label>${state.provider === 'yes24' ? '<div class="coupon-box"><h3>쿠폰 선택</h3><p>사용 가능한 연습 쿠폰이 없습니다.</p></div>' : '<p class="gray">할인 자격 및 금액은 연습용 예시입니다.</p>'}<div class="price-sum">티켓 금액 합계 <strong>${money(totals().ticket - totals().discount)}</strong></div></div>`;
  if (state.step === 3) return `<div class="panel-title"><h2>${provider().steps[3]}</h2><span>수령 방법과 예매자 정보를 확인하세요.</span></div><div class="form-section"><h3>티켓 수령 방법</h3><div class="radio-options"><label><input type="radio" name="delivery" value="venue" ${state.delivery === 'venue' ? 'checked' : ''}> 현장수령</label><label><input type="radio" name="delivery" value="post" ${state.delivery === 'post' ? 'checked' : ''}> 배송 · 3,500원</label></div><div class="delivery-details">${state.delivery === 'venue' ? '공연 당일 현장 티켓박스에서 수령하는 연습입니다.' : '<b>가상 배송지</b><p>서울특별시 연습구 첫열로 101 · 연습용 주소</p><span class="gray">실제 주소 입력 없이 배송 선택 순서만 연습합니다.</span>'}</div><h3>예매자 확인</h3><dl class="fake-buyer"><div><dt>이름</dt><dd>연습 관객</dd></div><div><dt>연락처</dt><dd>010-0000-0000 (가상)</dd></div><div><dt>이메일</dt><dd>practice@example.com (가상)</dd></div></dl><p class="gray">가상 정보입니다. 실제 개인정보는 입력받지 않습니다.</p></div>`;
  return `<div class="panel-title"><h2>${provider().steps[4]}</h2><span>마지막 단계까지 침착하게 확인하세요.</span></div><div class="form-section"><div class="payment-banner">연습용 가상 결제 · 실제 청구 금액 0원</div><h3>결제수단 선택</h3><div class="payment-options">${[['card', '신용카드'], ['bank', '무통장입금']].map(([id, name]) => `<label class="${state.payment === id ? 'selected' : ''}"><input type="radio" name="payment" value="${id}" ${state.payment === id ? 'checked' : ''}>${name}</label>`).join('')}</div><label class="form-row">${state.payment === 'card' ? '카드사' : '입금은행'}<select id="fake-payment"><option>${state.payment === 'card' ? '연습 카드 (가상)' : '연습 은행 (가상)'}</option></select></label><p class="gray">카드번호나 계좌번호를 입력하지 않는 연습입니다.</p><div class="confirmation-box"><h3>최종 예매 확인</h3><p>${dates.find(d => d.id === state.date).label} ${dates.find(d => d.id === state.date).time}</p><p>${selectedSeats().map(seatLabel).join(' / ')}</p><p>수령 방법: ${state.delivery === 'venue' ? '현장수령' : '배송'}</p><strong>가상 결제금액 ${money(total())}</strong></div><label class="agreement"><input id="payment-agreement" type="checkbox" ${state.agreed ? 'checked' : ''}> 위 예매 정보를 확인했으며, 연습용 가상 결제에 동의합니다.</label></div>`;
}
const available = () => state.seats.filter(s => !s.excluded && !state.taken.has(s.id));
function seatContent() {
  const section = venue.sections.find(s => s.id === state.section);
  return `<div class="panel-title"><h2>좌석 선택</h2><div><span>${section ? `${section.id}구역` : '전체 좌석 배치도'}</span><button id="refresh-seats">좌석 새로고침 ↻</button></div></div><div class="seat-layout"><div class="seat-map-area">${section ? detailMap(section) : overviewMap()}<div class="map-caption"><span>가상 공연장 · ${state.quantity}매${state.adjacent ? ' · 연석 연습' : ''}</span><span>선택 ${state.selected.length} / ${state.quantity}</span></div></div><aside class="seat-controls"><h3>좌석등급 / 잔여석</h3><div class="seat-grades"><p><i class="vip-dot"></i>VIP석 <b>154,000원</b></p><p><i class="r-dot"></i>R석 <b>132,000원</b></p></div><h3>구역 선택</h3><div class="section-list">${venue.sections.map(s => `<button data-zone="${s.id}" class="${s.id === state.section ? 'selected' : ''}">${s.id}구역 <span>${available().filter(a => a.section === s.id).length}석</span></button>`).join('')}</div><button id="all-sections" class="map-reset">전체 배치도 보기</button><div class="seat-key"><span><i class="selected-dot"></i> 선택좌석</span><span><i class="taken-dot"></i> 선택불가</span></div></aside></div><div class="step-notice" id="seat-message" role="status">${state.message || `구역을 선택하고 좌석 ${state.quantity}개를 클릭한 뒤, ${provider().seatAction}를 눌러주세요.`}</div>`;
}
function overviewMap() {
  return `<div class="venue-overview"><div class="venue-outline"></div><div class="stage">STAGE</div><div class="runway"></div><div class="zones">${venue.sections.map(s => `<button class="zone zone-${s.id} ${s.grade.toLowerCase()}" data-zone="${s.id}" aria-label="${s.id}구역 ${s.grade}"><small>${s.grade}</small><b>${s.id}</b><span>${available().filter(a => a.section === s.id).length}석</span></button>`).join('')}</div><span class="venue-name">SEOUL LIVE ARENA · SAMPLE</span></div>`;
}
function detailMap(section) {
  return `<div class="detail-map"><div class="detail-stage">STAGE</div><div class="seat-grid" style="--columns:${section.columns}">${Array.from({ length: section.rows }, (_, row) => `<span class="row-label">${row + 1}열</span>${state.seats.filter(s => s.section === section.id && s.row === row + 1).map(s => { const unavailable = s.excluded || state.taken.has(s.id); return `<button class="seat ${s.grade.toLowerCase()} ${state.selected.includes(s.id) ? 'chosen' : ''}" data-seat="${s.id}" aria-label="${seatLabel(s)}${unavailable ? ' 선택불가' : ''}" title="${seatLabel(s)}" aria-pressed="${state.selected.includes(s.id)}" ${unavailable || state.phase !== 'booking' ? 'disabled' : ''}></button>`; }).join('')}`).join('')}</div><p class="seat-direction">왼쪽 ← 좌석 번호 → 오른쪽</p></div>`;
}
function newCaptcha() { state.captcha = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join(''); }
function renderCaptcha() {
  const overlay = document.createElement('section'); overlay.className = 'captcha-overlay'; overlay.setAttribute('role', 'region'); overlay.setAttribute('aria-labelledby', 'captcha-title');
  overlay.innerHTML = `<form id="captcha-form" class="captcha-box"><h2 id="captcha-title">보안문자 입력</h2><p>아래 문자를 입력해주세요. 대소문자는 구분하지 않습니다.</p><div class="captcha-art" aria-hidden="true">${[...state.captcha].map((c, i) => `<span style="transform:rotate(${[-12, 9, -7, 13, -9, 5][i]}deg)">${c}</span>`).join('')}</div><label class="sr-only" for="captcha-input">연습용 보안문자 ${state.captcha}</label><div class="captcha-input-row"><input id="captcha-input" maxlength="6" autocomplete="off" spellcheck="false" placeholder="영문 6자리" aria-describedby="captcha-error"><button type="button" id="refresh-captcha" aria-label="보안문자 새로고침">↻</button></div><p id="captcha-error" class="captcha-error" role="alert">${state.captchaError}</p><button type="submit" class="next-button">입력완료</button><small>연습용 보안문자 · 실제 인증이 아닙니다.</small></form>`;
  $('window-content').append(overlay); $('captcha-input').focus();
}
function enterSeats() {
  state.step = 1; state.message = ''; state.discount = 0; state.agreed = false; state.holdStarted = null;
  if ($('use-captcha').checked && !state.captchaPassed) { state.phase = 'captcha'; newCaptcha(); state.captchaError = ''; renderWindow(); }
  else { state.phase = 'booking'; renderWindow(); startCompetition(); }
}
function startCompetition() {
  clearInterval(competitors);
  competitors = setInterval(() => {
    if (state.step !== 1 || !['booking', 'checking'].includes(state.phase)) return;
    compete(state.seats, state.taken, config().batch);
    if (state.phase === 'booking' && state.selected.some(id => state.taken.has(id))) { state.failures++; state.selected = state.selected.filter(id => !state.taken.has(id)); state.message = '선택한 좌석이 선점되었습니다. 다른 좌석을 선택해주세요.'; }
    if (!hasAvailability(state.seats, state.taken, state.quantity, state.adjacent)) finish(false);
    else renderWindow();
  }, config().interval);
}
async function confirmSeats() {
  if (!selectionValid() || state.phase !== 'booking') return;
  state.phase = 'checking'; const run = state.run; renderWindow();
  await new Promise(resolve => setTimeout(resolve, config().latency));
  if (run !== state.run || state.phase !== 'checking') return;
  if (!selectionValid() || Math.random() < config().failure) {
    state.selected.forEach(id => state.taken.add(id)); state.selected = []; state.failures++; state.phase = 'booking'; state.message = '이미 선택된 좌석입니다. 다른 좌석을 선택해주세요.';
    renderWindow(); window.alert('이미 선택된 좌석입니다. 다른 좌석을 선택해주세요.');
    if (!hasAvailability(state.seats, state.taken, state.quantity, state.adjacent)) finish(false);
  } else {
    clearInterval(competitors); state.seatTime = performance.now() - state.started; state.holdStarted = performance.now(); state.phase = 'booking'; state.step = 2; state.message = ''; renderWindow();
  }
}
function next() {
  if (state.phase !== 'booking') return;
  if (state.step === 0) { state.captchaPassed = false; resetSeats(); enterSeats(); }
  else if (state.step === 1) confirmSeats();
  else if (state.step < 4) { state.step++; renderWindow(); }
  else if (state.agreed) finish(true);
}
function previous() {
  if (state.phase !== 'booking' || !state.step) return;
  if (state.step === 1) { clearInterval(competitors); state.step = 0; state.selected = []; state.section = null; }
  else if (state.step === 2) { state.seatTime = null; state.discount = 0; state.holdStarted = null; state.step = 1; startCompetition(); }
  else state.step--;
  state.agreed = false; renderWindow();
}
function finish(success) {
  clearTimers(); const elapsed = performance.now() - state.started;
  const record = { date: new Date().toISOString(), elapsed, seatTime: state.seatTime, seats: selectedSeats().map(seatLabel).join(' / ') || '좌석 소진', provider: state.provider, performance: state.date, difficulty: state.difficulty, failures: state.failures, firstClick: state.firstClick, success, amount: success ? total() : 0 };
  history.unshift(record); history = history.slice(0, 30); let saved = true;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch { saved = false; }
  $('booking-dialog').close(); state.phase = 'idle'; state.holdStarted = null; setSettingsLocked(false); $('book-button').textContent = '예매하기';
  $('result-title').textContent = success ? '예매 흐름을 끝까지 완주했어요!' : '좌석이 모두 소진됐어요';
  $('result-description').textContent = `${provider().name} · ${record.seats}`;
  $('result-seat-time').textContent = seconds(record.seatTime); $('result-time').textContent = seconds(elapsed); $('result-failures').textContent = `${state.failures}회`;
  $('result-tip').textContent = (success ? '실제 청구 금액은 0원입니다. 다음 연습에서는 좌석 확보 시간을 줄여보세요.' : '다른 구역으로 빠르게 이동하며 다시 도전해보세요.') + (saved ? '' : ' 브라우저 저장이 차단되어 기록은 이 창에서만 유지됩니다.');
  renderHistory(); $('result-dialog').showModal();
}
function renderHistory() {
  $('history-count').textContent = history.length; $('history-list').replaceChildren();
  if (!history.length) { $('history-list').innerHTML = '<div class="history-empty"><h3>아직 연습 기록이 없어요.</h3><p>예매 흐름을 끝까지 완료하면 기록이 남습니다.</p></div>'; return; }
  history.forEach(record => {
    const row = document.createElement('article'); row.className = 'history-row';
    [record.success ? '완료' : '종료', providers[record.provider]?.name || '기본 연습', new Date(record.date).toLocaleString('ko-KR'), record.seats, `좌석 ${seconds(record.seatTime ?? null)} / 전체 ${seconds(record.elapsed)}`, `${difficulties[record.difficulty].label} · 실패 ${record.failures ?? 0}회`].forEach(text => { const span = document.createElement('span'); span.textContent = text; row.append(span); }); $('history-list').append(row);
  });
}
document.addEventListener('click', event => {
  const target = event.target.closest('button'); if (!target || target.disabled) return;
  if (target.dataset.provider && state.phase === 'idle') { state.provider = target.dataset.provider; renderProduct(); }
  if (target.dataset.view) { const practice = target.dataset.view === 'practice'; $('practice-view').hidden = !practice; $('history-view').hidden = practice; document.querySelectorAll('[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === target.dataset.view)); }
  if (target.dataset.date && (state.phase === 'idle' || state.step === 0 && state.phase === 'booking')) changeDate(target.dataset.date);
  if (target.dataset.zone && state.step === 1 && state.phase === 'booking') { state.section = target.dataset.zone; renderWindow(); }
  if (target.dataset.seat && state.phase === 'booking' && state.step === 1 && !state.taken.has(target.dataset.seat)) {
    const id = target.dataset.seat;
    if (state.firstClick === null) state.firstClick = performance.now() - state.started;
    if (state.selected.includes(id)) state.selected = state.selected.filter(s => s !== id);
    else if (state.selected.length < state.quantity) state.selected.push(id);
    else { state.message = `최대 ${state.quantity}매까지 선택할 수 있습니다. 기존 좌석을 해제해주세요.`; renderWindow(); return; }
    state.message = state.adjacent && state.selected.length === state.quantity && !selectionValid() ? '연석 연습에서는 같은 구역·같은 열의 붙어 있는 좌석을 선택해주세요.' : ''; renderWindow();
  }
  const actions = { 'book-button': start, 'close-booking': cancel, 'cancel-queue': cancel, 'next-step': next, 'previous-step': previous, 'all-sections': () => { if (state.phase === 'booking') { state.section = null; renderWindow(); } }, 'refresh-seats': () => { if (state.phase === 'booking') { state.selected = state.selected.filter(id => !state.taken.has(id)); state.message = '현재 잔여좌석으로 갱신했습니다.'; renderWindow(); } }, 'refresh-captcha': () => { newCaptcha(); state.captchaError = ''; renderWindow(); }, 'close-result': () => $('result-dialog').close(), retry: () => { $('result-dialog').close(); start(); }, 'clear-history': () => { if (!history.length || !window.confirm('연습 기록을 모두 지울까요?')) return; try { localStorage.removeItem(STORAGE_KEY); } catch { window.alert('저장소 접근이 제한되어 기록을 지우지 못했습니다.'); return; } history = []; renderHistory(); } };
  actions[target.id]?.();
});
document.addEventListener('change', event => {
  const el = event.target;
  if (el.id === 'discount') { state.discount = Number(el.value); renderWindow(); }
  if (el.name === 'delivery') { state.delivery = el.value; renderWindow(); }
  if (el.name === 'payment') { state.payment = el.value; state.agreed = false; renderWindow(); }
  if (el.id === 'payment-agreement') { state.agreed = el.checked; $('next-step').disabled = !state.agreed; }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'captcha-form') return; event.preventDefault();
  if ($('captcha-input').value.trim().toUpperCase() !== state.captcha) { state.captchaError = '문자가 일치하지 않습니다. 다시 입력해주세요.'; renderWindow(); }
  else { state.captchaPassed = true; state.phase = 'booking'; renderWindow(); startCompetition(); }
});
$('booking-dialog').addEventListener('cancel', event => { event.preventDefault(); cancel(); });
window.addEventListener('pagehide', clearTimers);
renderProduct(); renderHistory();

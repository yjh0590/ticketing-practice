import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const port = 5198;
const server = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: 'pipe', windowsHide: true });
let browser;
const stepKind = page => page.locator('.booking-main').getAttribute('data-step-kind');
const currentStep = page => page.evaluate(() => [...document.querySelectorAll('.booking-steps li')].findIndex(li => li.classList.contains('current')));
// Walks any provider flow to the result dialog, running per-step checks along the way.
async function completeFlow(page, id, checks = {}) {
  await page.click(`button[data-provider="${id}"]`);
  await page.click('#book-button'); await page.waitForSelector('#next-step');
  await checks.start?.(page);
  for (let guard = 0; guard < 10; guard++) {
    const kind = await stepKind(page), index = await currentStep(page);
    if (kind === 'seats') { await page.click('.zone[data-zone="D"]'); await page.click('[data-seat="D-8-11"]'); }
    const box = { membership: '#access-confirm', handoff: '#access-confirm', review: '#review-confirm', payment: '#payment-agreement' }[kind];
    if (box) { assert.equal(await page.locator('#next-step').isDisabled(), true, `${id} ${kind} requires confirmation`); await page.check(box); }
    await checks[kind]?.(page);
    await page.click('#next-step');
    if (kind === 'payment') { await page.waitForSelector('#result-dialog[open]'); await page.click('#close-result'); return; }
    await page.waitForFunction(i => [...document.querySelectorAll('.booking-steps li')].findIndex(li => li.classList.contains('current')) !== i, index);
  }
  throw new Error(`${id} flow did not reach payment`);
}
const dialogBox = page => page.locator('#booking-dialog').boundingBox();
const methods = page => page.locator('.payment-options').textContent();
try {
  await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); server.once('exit', code => reject(new Error(`Preview exited: ${code}`))); });
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = []; const alerts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', async dialog => { alerts.push(dialog.message()); await dialog.accept(); });
  await page.addInitScript(() => { Math.random = () => .9; });
  await page.goto(`http://127.0.0.1:${port}`);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/desktop.png', fullPage: true });
  await page.selectOption('#difficulty', 'easy');
  await page.selectOption('#quantity', '2');
  await page.click('[data-calendar="product"][data-date="2026-12-13"]');
  assert.match(await page.locator('#product-session').textContent(), /17:00/);
  await page.click('#book-button');
  await page.waitForSelector('.queue-screen');
  await page.screenshot({ path: 'artifacts/queue.png', fullPage: true });
  await page.waitForSelector('#next-step');
  assert.match(await page.locator('.summary-info').textContent(), /2026.12.13/);
  await page.click('[data-calendar="window"][data-date="2026-12-12"]');
  await page.click('#next-step');
  await page.fill('#captcha-input', 'WRONGX');
  await page.press('#captcha-input', 'Enter');
  await page.waitForFunction(() => document.getElementById('captcha-error').textContent.includes('일치하지'));
  await page.click('#refresh-captcha');
  const captcha = await page.locator('.captcha-art').textContent();
  await page.fill('#captcha-input', captcha.toLowerCase());
  await page.press('#captcha-input', 'Enter');
  await page.waitForSelector('.captcha-overlay', { state: 'detached' });
  await page.click('.zone[data-zone="D"]');
  assert.equal(await page.locator('[data-seat]').count(), 96);
  const nolControls = await page.locator('.seat-controls').boundingBox();
  const nolMap = await page.locator('.seat-map-area').boundingBox();
  assert.ok(nolControls.x > nolMap.x);
  await page.click('[data-seat="D-8-9"]');
  await page.click('[data-seat="D-8-11"]');
  assert.equal(await page.locator('#next-step').isEnabled(), true, 'scattered seats allowed unless adjacent mode enabled');
  await page.screenshot({ path: 'artifacts/nol-seat-selection.png', fullPage: true });
  await page.click('#next-step');
  await page.waitForSelector('#discount');
  assert.match(await page.locator('.summary-total').textContent(), /264,000/);
  await page.click('#previous-step');
  await page.waitForSelector('[data-seat="D-8-11"]');
  assert.equal(await page.locator('[data-hold]').count(), 0);
  await page.click('#next-step');
  await page.waitForSelector('#discount');
  await page.selectOption('#discount', '0.1');
  assert.match(await page.locator('.summary-total').textContent(), /237,600/);
  await page.click('#next-step');
  await page.check('input[name="delivery"][value="post"]');
  assert.match(await page.locator('.summary-total').textContent(), /241,100/);
  await page.click('#next-step');
  assert.equal(await page.locator('#next-step').isDisabled(), true);
  await page.check('input[name="payment"][value="bank"]');
  await page.check('#payment-agreement');
  await page.screenshot({ path: 'artifacts/nol-payment.png', fullPage: true });
  await page.click('#next-step');
  await page.waitForSelector('#result-dialog[open]');
  assert.match(await page.locator('#result-description').textContent(), /NOL.*9번.*11번/);
  assert.notEqual(await page.locator('#result-seat-time').textContent(), '—');
  await page.click('#close-result');
  await page.reload();
  await page.click('[data-view="history"]');
  assert.equal(await page.locator('.history-row').count(), 1);
  await page.click('[data-view="practice"]');
  await page.click('button[data-provider="yes24"]');
  await page.uncheck('#use-queue'); await page.uncheck('#use-captcha');
  await page.selectOption('#difficulty', 'easy');
  await page.selectOption('#quantity', '2'); await page.check('#adjacent');
  await page.click('#book-button'); await page.waitForSelector('#next-step');
  await page.click('#next-step'); await page.click('.zone[data-zone="D"]');
  const yesControls = await page.locator('.seat-controls').boundingBox(); const yesMap = await page.locator('.seat-map-area').boundingBox();
  assert.ok(yesControls.x < yesMap.x);
  await page.click('[data-seat="D-8-9"]'); await page.click('[data-seat="D-8-11"]');
  assert.equal(await page.locator('#next-step').isDisabled(), true);
  await page.click('[data-seat="D-8-9"]'); await page.click('[data-seat="D-8-12"]');
  await page.screenshot({ path: 'artifacts/yes24-seat-selection.png', fullPage: true });
  await page.click('#next-step'); await page.waitForSelector('#discount');
  assert.equal(await page.locator('.coupon-box').count(), 1);
  await page.click('#next-step'); await page.click('#next-step');
  await page.check('#payment-agreement'); await page.click('#next-step');
  await page.waitForSelector('#result-dialog[open]');
  assert.match(await page.locator('#result-description').textContent(), /YES24/);
  await page.click('#close-result');
  // Remaining providers: flow-specific steps, layouts and payment methods.
  await page.selectOption('#difficulty', 'easy'); await page.selectOption('#quantity', '1'); await page.uncheck('#adjacent');
  await page.evaluate(() => { Math.random = () => .9; });
  await completeFlow(page, 'ticketlink', {
    seats: async p => { const c = await p.locator('.seat-controls').boundingBox(), m = await p.locator('.seat-map-area').boundingBox(); assert.ok(c.x < m.x, 'ticketlink zone list on the left'); },
    payment: async p => assert.match(await methods(p), /PAYCO/),
  });
  await completeFlow(page, 'melon', {
    seats: async p => { const c = await p.locator('.seat-controls').boundingBox(), m = await p.locator('.seat-map-area').boundingBox(); assert.ok(c.y + c.height <= m.y + 1, 'melon zone list above the map'); },
    price: async p => assert.equal(await p.locator('.coupon-box').count(), 1),
  });
  await completeFlow(page, 'coupang', {
    start: async p => { assert.ok((await dialogBox(p)).width <= 440, 'coupang uses a phone-sized window'); assert.equal(await p.locator('.booking-steps li').count(), 5); },
    date: async p => assert.equal(await p.locator('.date-cards button').count(), 2),
    review: async p => assert.match(await p.locator('.summary-info').textContent(), /모바일 티켓/),
    payment: async p => { assert.match(await methods(p), /쿠페이/); await p.screenshot({ path: 'artifacts/coupang-payment.png' }); },
  });
  await completeFlow(page, 'naver', {
    start: async p => assert.equal(await p.locator('.booking-steps li').count(), 4),
    payment: async p => assert.match(await methods(p), /Npay/),
  });
  await completeFlow(page, 'kream', {
    start: async p => { assert.equal(await p.locator('#booking-dialog').getAttribute('data-skin'), 'kream'); assert.equal(await p.locator('.booking-steps li').count(), 6); },
    date: async p => { assert.equal(await p.locator('#booking-dialog').getAttribute('data-skin'), 'ticketlink'); assert.match(await p.locator('#window-title').textContent(), /ticketlink.*KREAM/); },
    seats: async p => p.screenshot({ path: 'artifacts/kream-partner-seats.png' }),
  });
  assert.match(await page.locator('#result-description').textContent(), /KREAM/);
  await page.click('[data-view="history"]');
  assert.equal(await page.locator('.history-row').count(), 7);
  await page.click('[data-view="practice"]');
  await page.click('button[data-provider="yes24"]');
  // A failure after clicking seat completion must return to the seat step.
  await page.selectOption('#difficulty', 'normal'); await page.selectOption('#quantity', '1');
  await page.click('#book-button'); await page.waitForSelector('#next-step');
  await page.click('#next-step'); await page.click('.zone[data-zone="D"]');
  await page.click('[data-seat="D-8-11"]'); await page.evaluate(() => { Math.random = () => .01; });
  await page.click('#next-step');
  await page.waitForFunction(() => document.getElementById('seat-message')?.textContent.includes('이미 선택된'));
  assert.equal(await page.locator('#next-step').isDisabled(), true);
  assert.ok(alerts.some(message => message.includes('이미 선택된')));
  await page.click('#close-booking');
  assert.equal(await page.locator('#booking-dialog').isVisible(), false);
  assert.equal(await page.locator('#difficulty').isEnabled(), true);
  await page.click('#book-button');
  await page.waitForSelector('#booking-dialog[open]');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#difficulty').isEnabled(), true);
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(`http://127.0.0.1:${port}`);
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await mobile.screenshot({ path: 'artifacts/mobile.png', fullPage: true });
  await mobile.uncheck('#use-queue'); await mobile.uncheck('#use-captcha');
  await mobile.click('#book-button'); await mobile.waitForSelector('#next-step'); await mobile.click('#next-step');
  await mobile.click('.zone[data-zone="D"]');
  assert.equal(await mobile.locator('[data-seat]').count(), 96);
  assert.equal(await mobile.locator('#booking-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
  await mobile.click('#close-booking');
  await mobile.click('button[data-provider="coupang"]'); await mobile.click('#book-button'); await mobile.waitForSelector('#access-confirm');
  assert.equal(await mobile.locator('#booking-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
  await mobile.screenshot({ path: 'artifacts/mobile-coupang.png' });
  const denied = await browser.newPage();
  await denied.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await denied.goto(`http://127.0.0.1:${port}`);
  assert.equal(await denied.locator('button[data-provider]').count(), 7);
  for (const path of ['/.git/config', '/package.json', '/app.js/../../.git/config']) assert.equal((await fetch(`http://127.0.0.1:${port}${path}`)).status, 404);
  assert.deepEqual(errors, []);
  console.log('PASS: all 7 provider flows (membership, handoff, review steps), queue, CAPTCHA retry, date changes, seat concurrency, scattered/adjacent selection, discount/shipping totals, payment agreement, history, Escape cleanup, mobile, blocked storage');
} finally { await browser?.close(); server.kill(); }

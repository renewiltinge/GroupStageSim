#!/usr/bin/env node
/* Headless rooktest: laadt het portaal, controleert op console-fouten,
 * rendert elke room, test labs en het beantwoorden van een vraag.
 * Gebruik: node tools/smoke.js */
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push('[console] ' + m.text()); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));

  const url = 'file://' + path.join(__dirname, '..', 'index.html');
  await page.goto(url, { waitUntil: 'networkidle' });

  // homepage
  await page.waitForSelector('.card', { timeout: 5000 });
  const roomIds = await page.evaluate(() => window.CS && window.CS.util ? null : null);
  const cards = await page.$$('.card');
  console.log('Homepage: ' + cards.length + ' room-kaarten.');

  // haal alle room-id's op
  const ids = await page.evaluate(() => {
    const out = [];
    // CS houdt ROOMS intern; lees via hash-navigatie uit de kaarten
    return out;
  });

  // Loop over elke room door de hash te zetten
  const roomList = await page.evaluate(() => {
    // reconstruct from global if available
    return (window.__ROOMS__ || []);
  });

  // Fallback: klik elke kaart via hash. We lezen room-id's uit de DOM data.
  // We gebruiken de interne lijst door CS te instrumenteren:
  const allIds = await page.evaluate(() => {
    const res = [];
    try {
      // CS.boot heeft ROOMS gesorteerd; we hebben geen directe export,
      // dus lees uit de kaart-clicks door ze te simuleren is lastig.
    } catch (e) {}
    return res;
  });

  // Eenvoudiger: navigeer naar elke room via de bekende bestandslijst
  const fs = require('fs');
  const vm = require('vm');
  const dir = path.join(__dirname, '..', 'content/rooms');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_'));
  const rooms = files.map((f) => { let r = null; vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), { CS: { registerRoom: (x) => (r = x) } }); return r; }).filter(Boolean);

  let totalTasks = 0, totalQ = 0, totalLabs = 0;
  for (const r of rooms) {
    // Volledige reload per room (vermijd same-document hash-navigatie races)
    await page.goto('about:blank');
    await page.goto(url + '#/room/' + r.id, { waitUntil: 'networkidle' });
    try { await page.waitForSelector('.task', { timeout: 8000 }); }
    catch (e) { errors.push('Room ' + r.id + ': geen .task gerenderd (' + e.message.split('\n')[0] + ')'); continue; }
    const tasks = await page.$$('.task');
    const labs = await page.$$('.lab');
    const qs = await page.$$('.q');
    totalTasks += r.tasks.length; totalQ += qs.length; totalLabs += labs.length;
    // controleer dat titels renderen
    const h1 = await page.$eval('.room-hero h1', (e) => e.textContent).catch(() => '');
    if (!h1) errors.push('Room ' + r.id + ': geen titel gerenderd');
    console.log('  ✓ ' + r.id + ' — ' + tasks.length + ' taakblokken, ' + labs.length + ' labs, ' + qs.length + ' vragen');
  }

  // test het beantwoorden van open vragen in een paar rooms
  let tested = 0;
  for (const r of rooms) {
    if (tested >= 3) break;
    // vind een taak + open vraag
    let found = null;
    r.tasks.forEach((t, ti) => (t.questions || []).forEach((q, qi) => { if (!found && !q.noAnswer && !Array.isArray(q.options)) found = { ti, qi, q }; }));
    if (!found) continue;
    const ans = Array.isArray(found.q.answer) ? found.q.answer[0] : found.q.answer;
    await page.goto('about:blank');
    await page.goto(url + '#/room/' + r.id, { waitUntil: 'networkidle' });
    await page.waitForSelector('#task-' + found.ti + ' .q');
    // de n-de .q binnen de taak; vul zijn tekst-input
    const sel = '#task-' + found.ti + ' .q:nth-of-type(' + (found.qi + 1) + ') input[type=text]';
    const input = await page.$(sel);
    if (!input) { errors.push(r.id + ': geen open-input gevonden voor vraag ' + (found.qi + 1)); continue; }
    await input.fill(ans);
    await input.press('Enter');
    await page.waitForTimeout(250);
    const ok = await page.evaluate((s) => { const n = document.querySelector(s); return n && n.closest('.q').classList.contains('correct'); }, sel);
    console.log('Open-vraag test in ' + r.id + ' (taak ' + (found.ti + 1) + '): ' + (ok ? '✓ geaccepteerd (+XP)' : '✗ NIET geaccepteerd'));
    if (!ok) errors.push('Open vraag niet geaccepteerd in ' + r.id + ' (antwoord: ' + ans + ')');
    tested++;
  }

  console.log('\nTotaal: ' + rooms.length + ' rooms, ' + totalTasks + ' taken, ' + totalLabs + ' labs, ' + totalQ + ' vragen gerenderd.');
  if (errors.length) { console.log('\n✗ FOUTEN:'); errors.forEach((e) => console.log('  ' + e)); }
  else console.log('\n✓ Geen console-/pagefouten.');

  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();

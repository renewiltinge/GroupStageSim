#!/usr/bin/env node
/* Aanvullende labtest: http, phishing, subnet en password labs.
 * Gebruik: node tools/labtest-extra.js */
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const fails = [];
  p.on('pageerror', (e) => fails.push('pageerror: ' + e.message));
  const ok = (n, c) => { console.log((c ? '  ✓ ' : '  ✗ ') + n); if (!c) fails.push(n); };

  // HTTP-lab (hoe-het-web-werkt): cookie role=admin -> beschermd endpoint met vlag
  await p.goto(url + '#/room/hoe-het-web-werkt', { waitUntil: 'networkidle' });
  await p.waitForSelector('.lab');
  const httpTask = await p.evaluate(() => [...document.querySelectorAll('.task')].findIndex((t) => t.querySelector('.http-cols')));
  if (httpTask >= 0) {
    const sel = '#task-' + httpTask;
    const inputs = await p.$$(sel + ' .lab-pad input[type=text]');
    const taRoutes = await p.evaluate((s) => {
      // zoek het pad van een route die een vlag teruggeeft en een admin-cookie vereist
      return null;
    }, sel);
    // probeer het beschermde pad met een admin-cookie (generiek)
    await inputs[0].fill('/intern-beheer');
    const ta = await p.$(sel + ' .lab-pad textarea');
    await ta.fill('Cookie: role=admin');
    await p.click(sel + ' .lab-pad button.primary');
    await p.waitForTimeout(150);
    const resp = await p.$eval(sel + ' .resp', (e) => e.textContent).catch(() => '');
    ok('HTTP-lab: admin-cookie geeft 200 + vlag', /JVT\{/.test(resp) && /200/.test(resp));
  } else ok('HTTP-lab aanwezig', false);

  // Phishing-lab (social-engineering): rode vlaggen aanklikken
  await p.goto(url + '#/room/social-engineering-phishing', { waitUntil: 'networkidle' });
  await p.waitForSelector('.mail');
  const flagables = await p.$$('.flagable');
  ok('Phishing-lab heeft klikbare rode vlaggen', flagables.length > 0);
  if (flagables.length) { await flagables[0].click(); await p.waitForTimeout(100); }
  ok('Phishing-lab markeert aangeklikte vlag', (await p.$$('.flagable.flagged')).length > 0);

  // Subnet-lab (subnetting)
  await p.goto(url + '#/room/subnetting', { waitUntil: 'networkidle' });
  await p.waitForSelector('.lab-pad');
  const si = await p.$('.lab-pad input[type=text]');
  await si.fill('192.168.10.64/26'); await p.click('.lab-pad button.primary'); await p.waitForTimeout(100);
  const so = await p.$eval('.lab-out', (e) => e.textContent);
  ok('Subnet-lab: /26 broadcast = .127', so.includes('192.168.10.127'));
  ok('Subnet-lab: /26 = 62 hosts', so.includes('62'));

  // Password-lab (wachtwoorden-authenticatie)
  await p.goto(url + '#/room/wachtwoorden-authenticatie', { waitUntil: 'networkidle' });
  const pwTask = await p.evaluate(() => [...document.querySelectorAll('.task')].findIndex((t) => t.querySelector('.meter')));
  if (pwTask >= 0) {
    const pwInput = await p.$('#task-' + pwTask + ' .lab-pad input');
    await pwInput.fill('Tr0ub4dour&3xplore!2026'); await p.waitForTimeout(100);
    const v = await p.$eval('#task-' + pwTask + ' .found-note', (e) => e.textContent).catch(() => '');
    ok('Password-lab toont entropie/oordeel', /bits|sterk|redelijk|zwak/i.test(v));
  } else ok('Password-lab aanwezig', false);

  console.log('\n' + (fails.length ? '✗ ' + fails.length + ' gefaald' : '✓ Alle aanvullende labtests geslaagd'));
  await b.close(); process.exit(fails.length ? 1 : 0);
})();

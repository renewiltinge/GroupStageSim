#!/usr/bin/env node
/* Diepe labtest: bedient de labs echt (terminal, sqli, cyberchef, hashcrack,
 * http, logs) in de Mini-CTF en controleert de uitkomsten.
 * Gebruik: node tools/labtest.js */
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const url = 'file://' + path.join(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fails = [];
  page.on('pageerror', (e) => fails.push('pageerror: ' + e.message));
  const ok = (name, cond) => { console.log((cond ? '  ✓ ' : '  ✗ ') + name); if (!cond) fails.push(name); };

  await page.goto(url + '#/room/mini-ctf', { waitUntil: 'networkidle' });
  await page.waitForSelector('.task');

  // ---- Terminal (taak 2): nmap ----
  async function termType(taskIdx, cmd) {
    const sel = '#task-' + taskIdx + ' .term .inrow input';
    await page.waitForSelector(sel);
    const inp = await page.$(sel);
    await inp.fill(cmd);
    await inp.press('Enter');
    await page.waitForTimeout(120);
  }
  await termType(1, 'nmap -sV 10.10.60.42');
  let termText = await page.$eval('#task-1 .term', (e) => e.textContent);
  ok('Terminal nmap toont vlag JVT{poorten_in_kaart}', termText.includes('JVT{poorten_in_kaart}'));
  ok('Terminal nmap toont Tomcat 9.0.30', termText.includes('Tomcat 9.0.30'));

  // ---- SQLi (taak 3) ----
  await page.$eval('#task-2 .sqlform input', (e) => (e.value = ''));
  const sqlU = await page.$('#task-2 .sqlform input:nth-of-type(1)');
  // vul gebruikersnaam met injectie
  const inputs = await page.$$('#task-2 .sqlform input[type=text]');
  await inputs[0].fill("admin' --");
  await inputs[1].fill('xxx');
  await page.click('#task-2 .sqlform button.primary');
  await page.waitForTimeout(100);
  let sqlOut = await page.$eval('#task-2 .lab-out', (e) => e.textContent);
  ok('SQLi "admin\' --" logt in als admin + toont vlag', sqlOut.includes('JVT{sql_injectie_werkt}'));
  // prepared statements aan -> injectie faalt
  await page.click('#task-2 .switch .track');
  await page.click('#task-2 .sqlform button.primary');
  await page.waitForTimeout(100);
  sqlOut = await page.$eval('#task-2 .lab-out', (e) => e.textContent);
  ok('Met prepared statements faalt dezelfde injectie', sqlOut.includes('Ongeldige'));

  // ---- CyberChef (taak 4): Base64 decode + ROT13 ----
  // klik de juiste chips in het palet
  await page.evaluate(() => {
    const chips = [...document.querySelectorAll('#task-3 .chip-row .chip')];
    const b64 = chips.find((c) => c.textContent.trim() === 'Base64 decoderen');
    b64 && b64.click();
  });
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const chips = [...document.querySelectorAll('#task-3 .chip-row .chip')];
    const rot = chips.find((c) => c.textContent.trim() === 'ROT13');
    rot && rot.click();
  });
  await page.waitForTimeout(100);
  const ccOut = await page.$eval('#task-3 .lab-out', (e) => e.textContent);
  ok('CyberChef Base64->ROT13 geeft JVT{cyberchef_kampioen}', ccOut.includes('JVT{cyberchef_kampioen}'));

  // ---- Hashcrack (taak 5) ----
  await page.click('#task-4 .lab-pad button.primary'); // start aanval
  await page.waitForFunction(() => /Wachtwoord gevonden|Niet gekraakt/.test(document.querySelector('#task-4 .lab-pad').textContent), { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(200);
  const hcText = await page.$eval('#task-4', (e) => e.textContent);
  ok('Hashcrack vindt wachtwoord koffie!2026', hcText.includes('koffie!2026') && hcText.includes('gevonden'));

  // ---- Logs (taak 6): filter op Accepted ----
  const logFilter = await page.$('#task-5 .lab-pad input[type=text]');
  await logFilter.fill('Accepted');
  await page.waitForTimeout(100);
  const logText = await page.$eval('#task-5 .logview', (e) => e.textContent);
  ok('Logfilter "Accepted" toont aanvaller-IP 198.51.100.7', logText.includes('198.51.100.7'));

  // ---- Terminal file hunt (taak 7) ----
  await termType(6, 'ls -a');
  let t7 = await page.$eval('#task-6 .term', (e) => e.textContent);
  ok('ls -a toont verborgen map .verborgen', t7.includes('.verborgen'));
  await termType(6, 'cat /home/koffie/.verborgen/buit.b64 | base64 -d');
  t7 = await page.$eval('#task-6 .term', (e) => e.textContent);
  ok('base64 -d van buit.b64 geeft JVT{dojo_voltooid}', t7.includes('JVT{dojo_voltooid}'));
  await termType(6, 'grep -r JVT /home/koffie');
  t7 = await page.$eval('#task-6 .term', (e) => e.textContent);
  ok('grep -r JVT vindt het .b64-bestand', t7.includes('buit.b64'));

  console.log('\n' + (fails.length ? '✗ ' + fails.length + ' labtest(s) GEFAALD' : '✓ Alle labtests geslaagd'));
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();

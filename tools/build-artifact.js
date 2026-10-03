#!/usr/bin/env node
/*
 * Bouwt één zelfstandig HTML-bestand met het hele portaal erin (CSS, engine,
 * labs en alle rooms inline). Handig om offline te delen of als Artifact te
 * publiceren.
 *
 * Gebruik:  node tools/build-artifact.js [uitvoerpad]
 * Standaard uitvoer: dist/jvt-cyber-dojo.html
 *
 * Let op: dit bestand bevat GEEN <!doctype>/<html>/<head>/<body>, zodat het
 * ook direct als claude.ai-Artifact gepubliceerd kan worden (dat voegt zelf
 * een skelet toe). Open je het als los bestand in je browser? Dan werkt het
 * alsnog — browsers vullen het skelet aan.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(ROOT, 'dist', 'jvt-cyber-dojo.html');
const ORDER = ['fundamenten', 'security-kern', 'offensief', 'defensief', 'eindopdracht'];

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const safeJs = (s) => s.replace(/<\/(script)/gi, '<\\/$1'); // voorkom vroegtijdig sluiten van <script>

// Rooms sorteren op leerpad + order
const dir = path.join(ROOT, 'content/rooms');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_'));
const rooms = files.map((f) => {
  let room = null;
  vm.runInNewContext(fs.readFileSync(path.join(dir, f), 'utf8'), { CS: { registerRoom: (r) => (room = r) }, console });
  return { f, room };
}).filter((x) => x.room);
rooms.sort((a, b) => {
  const pa = ORDER.indexOf(a.room.path), pb = ORDER.indexOf(b.room.path);
  return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb) || a.room.order - b.room.order || a.f.localeCompare(b.f);
});

const css = read('assets/css/style.css');
const app = read('assets/js/app.js');
const labs = read('assets/js/labs.js');
const roomScripts = rooms.map((x) => '<script>\n' + safeJs(fs.readFileSync(path.join(dir, x.f), 'utf8')) + '\n</script>').join('\n');

const html = `<title>JVT Cyber Dojo</title>
<style>
${css}
</style>

<header id="topbar" class="topbar"></header>
<main id="app"></main>

<script>
${safeJs(app)}
</script>
<script>
${safeJs(labs)}
</script>
${roomScripts}
<script>CS.boot();</script>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
const kb = (html.length / 1024).toFixed(0);
console.log('Zelfstandig portaal geschreven: ' + path.relative(ROOT, OUT) + ' (' + kb + ' KB, ' + rooms.length + ' rooms)');

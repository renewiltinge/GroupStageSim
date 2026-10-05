#!/usr/bin/env node
/*
 * Controleert room-bestanden op structuur en inhoud.
 * Gebruik:  node tools/validate.js                 (alle rooms)
 *           node tools/validate.js content/rooms/linux-basis.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const PATHS = ['fundamenten', 'security-kern', 'offensief', 'defensief', 'forensie', 'eindopdracht'];
const DIFFS = ['Makkelijk', 'Gemiddeld', 'Moeilijk'];
const LABS = ['terminal', 'cyberchef', 'hashcrack', 'password', 'phishing', 'logs', 'http', 'sqli', 'subnet', 'hexviewer', 'pcap',
  'jwt', 'regex', 'cvss', 'timestamp', 'ioc', 'url', 'yara', 'timeline', 'chmod', 'numconv'];

const args = process.argv.slice(2);
const files = args.length
  ? args.map((f) => path.resolve(f))
  : fs.readdirSync(path.join(ROOT, 'content/rooms')).filter((f) => f.endsWith('.js')).map((f) => path.join(ROOT, 'content/rooms', f));

let errors = 0;
let warnings = 0;
const err = (file, msg) => { errors++; console.log(`  ✗ ${msg}`); };
const warn = (file, msg) => { warnings++; console.log(`  ! ${msg}`); };

function checkHtml(file, html, where) {
  const voids = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'wbr', 'col', 'source', 'path', 'line', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'use', 'stop']);
  const stack = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;
  let m;
  const stripped = html.replace(/<pre[\s\S]*?<\/pre>/g, (blk) => blk.replace(/<code[^>]*>|<\/code>/g, '').replace(/<(?!\/?pre)[^>]*>/g, ''));
  while ((m = re.exec(stripped))) {
    const tag = m[1].toLowerCase();
    const closing = m[0][1] === '/';
    const selfClosing = m[2] === '/' || voids.has(tag);
    if (closing) {
      const idx = stack.lastIndexOf(tag);
      if (idx === -1) { err(file, `${where}: sluitende </${tag}> zonder opening`); continue; }
      if (idx !== stack.length - 1) warn(file, `${where}: tags niet netjes genest rond </${tag}> (open: ${stack.slice(idx + 1).join(',')})`);
      stack.length = idx;
    } else if (!selfClosing) {
      stack.push(tag);
    }
  }
  const leftover = stack.filter((t) => !['li', 'p', 'td', 'th', 'tr'].includes(t));
  if (leftover.length) err(file, `${where}: niet afgesloten tags: ${leftover.join(', ')}`);
  if (/\$\{/.test(html)) warn(file, `${where}: bevat "\${" — bedoeld?`);
}

function labText(lab) {
  return JSON.stringify(lab);
}

function hashOf(algo, s) {
  return crypto.createHash(algo).update(s, 'utf8').digest('hex');
}

const seenIds = new Set();
for (const file of files) {
  const rel = path.relative(ROOT, file);
  console.log(`• ${rel}`);
  const rooms = [];
  const sandbox = { CS: { registerRoom: (r) => rooms.push(r) }, console };
  try {
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: rel });
  } catch (e) {
    err(rel, `JavaScript-fout: ${e.message}`);
    continue;
  }
  if (rooms.length !== 1) { err(rel, `registerRoom moet precies 1x aangeroepen worden (nu ${rooms.length})`); continue; }
  const r = rooms[0];
  const base = path.basename(file, '.js');
  if (r.id !== base) err(rel, `id "${r.id}" komt niet overeen met bestandsnaam "${base}"`);
  if (seenIds.has(r.id)) err(rel, `dubbele id ${r.id}`);
  seenIds.add(r.id);
  for (const k of ['title', 'icon', 'summary']) if (!r[k] || typeof r[k] !== 'string') err(rel, `veld ${k} ontbreekt`);
  if (!PATHS.includes(r.path)) err(rel, `onbekend path "${r.path}"`);
  if (!DIFFS.includes(r.difficulty)) err(rel, `onbekende difficulty "${r.difficulty}"`);
  if (typeof r.order !== 'number') err(rel, 'order moet een getal zijn');
  if (typeof r.minutes !== 'number') err(rel, 'minutes moet een getal zijn');
  if (!Array.isArray(r.objectives) || r.objectives.length < 2) warn(rel, 'weinig of geen objectives');
  if (!Array.isArray(r.tasks) || !r.tasks.length) { err(rel, 'geen tasks'); continue; }
  if (!Array.isArray(r.terms) || r.terms.length < 3) warn(rel, 'weinig of geen terms');
  (r.terms || []).forEach((t, i) => { if (!t.term || !t.def) err(rel, `term ${i} mist term/def`); });
  (r.resources || []).forEach((x, i) => { if (!x.title || !/^https:\/\//.test(x.url || '')) err(rel, `resource ${i} mist titel of https-url`); });

  let qCount = 0;
  const allText = [];
  r.tasks.forEach((t, ti) => {
    const where = `taak ${ti + 1}`;
    if (!t.title) err(rel, `${where}: geen title`);
    if (!t.content) err(rel, `${where}: geen content`);
    else { checkHtml(rel, t.content, where); allText.push(t.content); }
    if (t.lab) {
      allText.push(labText(t.lab));
      if (!LABS.includes(t.lab.type)) err(rel, `${where}: onbekend labtype "${t.lab.type}"`);
      if (t.lab.type === 'terminal') {
        if (t.lab.fs) for (const p of Object.keys(t.lab.fs)) if (!p.startsWith('/')) err(rel, `${where}: fs-pad niet absoluut: ${p}`);
        if (t.lab.cwd && t.lab.fs && t.lab.shell !== 'powershell') {
          const dirs = new Set(['/']);
          for (const p of Object.keys(t.lab.fs)) { const parts = p.split('/').filter(Boolean); const isDir = p.endsWith('/'); for (let i = 1; i <= parts.length - (isDir ? 0 : 1); i++) dirs.add('/' + parts.slice(0, i).join('/')); }
          if (!dirs.has(t.lab.cwd)) warn(rel, `${where}: cwd ${t.lab.cwd} bestaat niet in fs`);
        }
      }
      if (t.lab.type === 'hashcrack') {
        const algo = t.lab.algo || 'md5';
        const hit = (t.lab.wordlist || []).find((w) => hashOf(algo, (t.lab.salt || '') + w) === String(t.lab.hash).toLowerCase());
        if (!hit) warn(rel, `${where}: hash wordt door geen enkel woord uit de wordlist gekraakt`);
        else console.log(`    (hashcrack: wachtwoord = "${hit}")`);
      }
      if (t.lab.type === 'phishing') {
        (t.lab.emails || []).forEach((m, mi) => {
          if (typeof m.phishing !== 'boolean') err(rel, `${where}: email ${mi} mist phishing:true/false`);
          if (!Array.isArray(m.body)) err(rel, `${where}: email ${mi} body moet een array zijn`);
        });
      }
      if (t.lab.type === 'http') {
        (t.lab.routes || []).forEach((rt, ri) => { if (!rt.method || !rt.path || !rt.status) err(rel, `${where}: route ${ri} mist method/path/status`); });
      }
    }
    if (!Array.isArray(t.questions) || !t.questions.length) { warn(rel, `${where}: geen vragen`); return; }
    t.questions.forEach((q, qi) => {
      qCount++;
      const w = `${where} vraag ${qi + 1}`;
      if (!q.q) err(rel, `${w}: geen vraagtekst`);
      if (q.noAnswer) return;
      if (Array.isArray(q.options)) {
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) err(rel, `${w}: answer moet index binnen options zijn`);
        return;
      }
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
      if (!answers.length || answers.some((a) => typeof a !== 'string' || !a.trim())) { err(rel, `${w}: answer ontbreekt of is leeg`); return; }
      if (answers[0].length > 60) warn(rel, `${w}: lang antwoord (${answers[0].length} tekens) — kan het korter?`);
      for (const a of answers) {
        if (/^JVT\{/.test(a) && !/^JVT\{[a-z0-9_]+\}$/.test(a)) warn(rel, `${w}: vlag "${a}" volgt niet JVT{kleine_letters_underscores}`);
      }
    });
    // Vlaggen moeten ergens in deze room (tekst of lab) te vinden zijn, eventueel gecodeerd.
  });
  const corpus = allText.join('\n');
  r.tasks.forEach((t, ti) => (t.questions || []).forEach((q, qi) => {
    if (q.noAnswer || Array.isArray(q.options)) return;
    const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    const flag = answers.find((a) => /^JVT\{/.test(a));
    if (flag && !corpus.includes(flag) && !q.encoded) {
      warn(rel, `taak ${ti + 1} vraag ${qi + 1}: vlag ${flag} komt niet letterlijk voor in tekst/lab (gecodeerd? zet dan encoded: true)`);
    }
  }));
  console.log(`    ${r.tasks.length} taken, ${qCount} vragen`);
}

console.log(`\n${files.length} bestand(en), ${errors} fout(en), ${warnings} waarschuwing(en)`);
process.exit(errors ? 1 : 0);

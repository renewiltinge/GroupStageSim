/* ======================================================================
   JVT Cyber Dojo — interactieve labs
   Elke lab registreert zich via CS.registerLab(type, fn).
   fn(container, labConfig, ctx) bouwt de UI in container.
   ====================================================================== */
(function () {
  'use strict';
  const { el, esc } = CS.util;

  function shell(title, bodyNode, dots = true) {
    const box = el('div', { class: 'lab' });
    const head = el('div', { class: 'lab-head' });
    if (dots) head.append(el('span', { class: 'dot r' }), el('span', { class: 'dot y' }), el('span', { class: 'dot g' }));
    head.append(el('span', { class: 'title', html: title }));
    box.append(head, el('div', { class: 'lab-body' }, bodyNode));
    return box;
  }

  // small sync hashers (voor hashcrack & cyberchef) ----------------------
  const Hash = {
    md5: md5, sha1: sha1, sha256: sha256,
  };

  // =====================================================================
  //  TERMINAL
  // =====================================================================
  CS.registerLab('terminal', function (container, cfg) {
    const isPwsh = cfg.shell === 'powershell';
    const user = cfg.user || 'student';
    const host = cfg.host || 'jvt-lab';
    const home = cfg.home || '/home/' + user;
    let cwd = cfg.cwd || home;
    const denied = new Set(cfg.denied || []);
    const fixed = {};
    Object.keys(cfg.commands || {}).forEach((k) => { fixed[normCmd(k)] = cfg.commands[k]; });

    // bouw bestandssysteem
    const files = {}; // pad -> inhoud (string) ; mappen als pad eindigend op niets, bijgehouden in dirs
    const dirs = new Set(['/']);
    const modes = cfg.modes || {};
    const owners = cfg.owners || {};
    for (const [p, v] of Object.entries(cfg.fs || {})) {
      const isDir = p.endsWith('/') && (v === null || v === undefined);
      const clean = isDir ? p.slice(0, -1) : p;
      const parts = clean.split('/').filter(Boolean);
      for (let i = 1; i < parts.length; i++) dirs.add('/' + parts.slice(0, i).join('/'));
      if (isDir) dirs.add('/' + parts.join('/'));
      else files[clean] = v == null ? '' : String(v);
    }
    // zorg dat home/cwd bestaan
    [home, cwd].forEach((d) => { const parts = d.split('/').filter(Boolean); for (let i = 1; i <= parts.length; i++) dirs.add('/' + parts.slice(0, i).join('/')); });

    const out = el('div', { class: 'term', tabindex: '0' });
    const history = [];
    let hidx = 0;

    function resolve(p) {
      if (!p) return cwd;
      p = p.replace('~', home);
      let base = p.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
      p.split('/').forEach((seg) => {
        if (seg === '' || seg === '.') return;
        if (seg === '..') base.pop();
        else base.push(seg);
      });
      return '/' + base.join('/');
    }
    const exists = (p) => files.hasOwnProperty(p) || dirs.has(p);
    const isDenied = (p) => { for (const d of denied) { if (p === d || p.startsWith(d + '/')) return true; } return false; };
    const childrenOf = (dir) => {
      const set = new Set();
      const pre = dir === '/' ? '/' : dir + '/';
      [...Object.keys(files), ...dirs].forEach((p) => {
        if (p === dir) return;
        if (p.startsWith(pre)) { const rest = p.slice(pre.length).split('/')[0]; if (rest) set.add(rest); }
      });
      return [...set].sort();
    };

    function println(text, cls) {
      const line = el('div', { class: 'line' + (cls ? ' ' + cls : '') });
      line.textContent = text;
      out.append(line);
      out.scrollTop = out.scrollHeight;
    }
    function printPrompted(cmd) {
      const line = el('div', { class: 'line' });
      line.append(el('span', { class: 'prompt', text: promptStr() }), document.createTextNode(' ' + cmd));
      out.append(line);
    }
    function promptStr() {
      if (isPwsh) return 'PS ' + cwd.replace(home, '~') + '>';
      return user + '@' + host + ':' + cwd.replace(home, '~') + '$';
    }

    function run(raw) {
      const cmd = raw.trim();
      if (!cmd) return;
      history.push(cmd); hidx = history.length;
      // vaste commando's eerst
      const fx = fixed[normCmd(cmd)];
      if (fx !== undefined) { println(fx); return; }
      if (isPwsh) {
        if (/^(clear|cls)$/i.test(cmd)) { out.innerHTML = ''; return; }
        if (/^help$/i.test(cmd)) { println('Beschikbare commando\'s in dit lab zijn vooraf ingesteld. Typ de commando\'s uit de opdracht precies over.'); return; }
        if (/^history$/i.test(cmd)) { history.forEach((h, i) => println('  ' + (i + 1) + '  ' + h)); return; }
        println("De term '" + cmd.split(' ')[0] + "' wordt niet herkend. Typ de commando's uit de opdracht precies over.", 'err');
        return;
      }
      // pipes
      const stages = cmd.split('|').map((s) => s.trim());
      let input = null; // null = geen stdin
      let errored = false;
      for (let i = 0; i < stages.length; i++) {
        const res = execBash(stages[i], input, i > 0);
        if (res.err) { println(res.err, 'err'); errored = true; break; }
        input = res.out; // string of array? we gebruiken string met \n
      }
      if (!errored && input != null && input !== '') println(input.replace(/\n$/, ''));
    }

    function execBash(segment, stdin, piped) {
      const toks = tokenize(segment);
      if (!toks.length) return { out: stdin || '' };
      const c = toks[0];
      const args = toks.slice(1);
      const flags = args.filter((a) => a.startsWith('-') && a !== '-');
      const rest = args.filter((a) => !a.startsWith('-') || a === '-');
      const hasFlag = (f) => flags.some((x) => x === f || (x.length > 1 && !x.startsWith('--') && x.slice(1).includes(f.replace('-', ''))));

      const readFile = (p) => {
        const abs = resolve(p);
        if (isDenied(abs)) return { err: 'cat: ' + p + ': Permission denied' };
        if (dirs.has(abs) && !files.hasOwnProperty(abs)) return { err: 'cat: ' + p + ': Is a directory' };
        if (!files.hasOwnProperty(abs)) return { err: 'cat: ' + p + ': No such file or directory' };
        return { out: files[abs] };
      };

      switch (c) {
        case 'help':
          return { out: 'Beschikbare commando\'s:\n  ls, cd, pwd, cat, head, tail, grep, find, echo, whoami, id,\n  hostname, uname, history, clear, wc, file, sort, uniq, cut,\n  base64, sha256sum, md5sum, touch, mkdir, rm, strings\nPipes met | werken. Typ de commando\'s uit de opdracht.' };
        case 'pwd': return { out: cwd };
        case 'whoami': return { out: user };
        case 'id': return { out: 'uid=1000(' + user + ') gid=1000(' + user + ') groups=1000(' + user + ')' };
        case 'hostname': return { out: host };
        case 'uname': return { out: hasFlag('-a') ? 'Linux ' + host + ' 6.1.0-jvt #1 SMP x86_64 GNU/Linux' : 'Linux' };
        case 'clear': out.innerHTML = ''; return { out: '' };
        case 'echo': return { out: args.join(' ').replace(/^["']|["']$/g, '') };
        case 'history': return { out: history.map((h, i) => '  ' + (i + 1) + '  ' + h).join('\n') };
        case 'cd': {
          const target = rest[0] ? resolve(rest[0]) : home;
          if (isDenied(target)) return { err: 'cd: ' + rest[0] + ': Permission denied' };
          if (dirs.has(target)) { cwd = target; return { out: '' }; }
          if (files.hasOwnProperty(target)) return { err: 'cd: ' + rest[0] + ': Not a directory' };
          return { err: 'cd: ' + (rest[0] || '') + ': No such file or directory' };
        }
        case 'ls': {
          const dir = resolve(rest[0] || '.');
          if (isDenied(dir)) return { err: 'ls: cannot open directory \'' + (rest[0] || '.') + '\': Permission denied' };
          if (files.hasOwnProperty(dir) && !dirs.has(dir)) return { out: rest[0] };
          if (!dirs.has(dir)) return { err: 'ls: cannot access \'' + (rest[0] || '') + '\': No such file or directory' };
          let names = childrenOf(dir);
          if (!hasFlag('-a')) names = names.filter((n) => !n.startsWith('.'));
          else names = ['.', '..', ...names];
          if (hasFlag('-l')) {
            const lines = names.map((n) => {
              if (n === '.' || n === '..') return 'drwxr-xr-x 1 ' + user + ' ' + user + ' 4096 okt  3 10:00 ' + n;
              const full = dir === '/' ? '/' + n : dir + '/' + n;
              const isD = dirs.has(full) && !files.hasOwnProperty(full);
              const mode = modes[full] || (isD ? 'drwxr-xr-x' : '-rw-r--r--');
              const owner = owners[full] || user;
              const size = isD ? 4096 : (files[full] || '').length;
              return mode + ' 1 ' + owner + ' ' + owner + ' ' + String(size).padStart(5) + ' okt  3 10:00 ' + n;
            });
            return { out: lines.join('\n') };
          }
          return { out: names.join('  ') };
        }
        case 'cat': {
          if (stdin != null && !rest.length) return { out: stdin };
          if (!rest.length) return { out: '' };
          let acc = [];
          for (const f of rest) { const r = readFile(f); if (r.err) return r; acc.push(r.out); }
          return { out: acc.join('') };
        }
        case 'head': case 'tail': {
          let n = 10; const ni = args.indexOf('-n'); if (ni >= 0 && args[ni + 1]) n = parseInt(args[ni + 1], 10) || 10;
          let text = stdin;
          if (rest.length) { const r = readFile(rest[rest.length - 1]); if (r.err) return r; text = r.out; }
          const lines = (text || '').replace(/\n$/, '').split('\n');
          return { out: (c === 'head' ? lines.slice(0, n) : lines.slice(-n)).join('\n') };
        }
        case 'wc': {
          let text = stdin;
          if (rest.length) { const r = readFile(rest[0]); if (r.err) return r; text = r.out; }
          const t = text || '';
          const lines = t === '' ? 0 : t.replace(/\n$/, '').split('\n').length;
          if (hasFlag('-l')) return { out: String(lines) };
          const words = t.trim() ? t.trim().split(/\s+/).length : 0;
          return { out: '  ' + lines + '  ' + words + '  ' + t.length + (rest[0] ? ' ' + rest[0] : '') };
        }
        case 'grep': {
          const invert = hasFlag('-v'), ic = hasFlag('-i'), nums = hasFlag('-n'), count = hasFlag('-c'), rec = hasFlag('-r');
          const nonFlag = rest;
          const pattern = nonFlag[0];
          if (pattern == null) return { err: 'usage: grep [-ivnc] patroon [bestand]' };
          let source = [];
          if (rec && nonFlag[1]) {
            const base = resolve(nonFlag[1]);
            Object.keys(files).forEach((p) => { if (p === base || p.startsWith(base + '/')) files[p].replace(/\n$/, '').split('\n').forEach((ln, i) => source.push({ ln, i, file: p })); });
          } else if (stdin != null && nonFlag.length < 2) {
            (stdin || '').replace(/\n$/, '').split('\n').forEach((ln, i) => source.push({ ln, i }));
          } else {
            for (let fi = 1; fi < nonFlag.length; fi++) { const r = readFile(nonFlag[fi]); if (r.err) return r; r.out.replace(/\n$/, '').split('\n').forEach((ln, i) => source.push({ ln, i, file: nonFlag.length > 2 || rec ? nonFlag[fi] : null })); }
          }
          let re; try { re = new RegExp(pattern.replace(/^["']|["']$/g, ''), ic ? 'i' : ''); } catch (e) { return { err: 'grep: ongeldig patroon' }; }
          let matched = source.filter((s) => re.test(s.ln));
          if (invert) matched = source.filter((s) => !re.test(s.ln));
          if (count) return { out: String(matched.length) };
          return { out: matched.map((s) => (s.file ? s.file + ':' : '') + (nums ? (s.i + 1) + ':' : '') + s.ln).join('\n') };
        }
        case 'find': {
          const base = resolve(rest[0] || '.');
          const ni = args.indexOf('-name'); const namePat = ni >= 0 ? args[ni + 1].replace(/^["']|["']$/g, '') : null;
          const ti = args.indexOf('-type'); const type = ti >= 0 ? args[ti + 1] : null;
          const re = namePat ? new RegExp('^' + namePat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$') : null;
          const all = [...dirs, ...Object.keys(files)].filter((p) => p === base || p.startsWith(base === '/' ? '/' : base + '/'));
          const res = all.filter((p) => {
            if (isDenied(p)) return false;
            if (type === 'f' && !files.hasOwnProperty(p)) return false;
            if (type === 'd' && files.hasOwnProperty(p)) return false;
            if (re) { const name = p.split('/').pop(); return re.test(name); }
            return true;
          }).sort();
          return { out: res.join('\n') };
        }
        case 'sort': {
          let text = stdin; if (rest.length) { const r = readFile(rest[0]); if (r.err) return r; text = r.out; }
          let lines = (text || '').replace(/\n$/, '').split('\n');
          if (hasFlag('-n')) lines.sort((a, b) => parseFloat(a) - parseFloat(b)); else lines.sort();
          if (hasFlag('-r')) lines.reverse();
          return { out: lines.join('\n') };
        }
        case 'uniq': {
          let text = stdin; if (rest.length) { const r = readFile(rest[0]); if (r.err) return r; text = r.out; }
          const lines = (text || '').replace(/\n$/, '').split('\n');
          const res = []; let prev = Symbol(), cnt = 0;
          lines.forEach((l) => { if (l === prev) cnt++; else { if (cnt) res.push(hasFlag('-c') ? String(cnt).padStart(7) + ' ' + prev : prev); prev = l; cnt = 1; } });
          if (cnt) res.push(hasFlag('-c') ? String(cnt).padStart(7) + ' ' + prev : prev);
          return { out: res.join('\n') };
        }
        case 'cut': {
          const di = args.indexOf('-d'); const delim = di >= 0 ? args[di + 1].replace(/^["']|["']$/g, '') : '\t';
          const fi = args.indexOf('-f'); const field = fi >= 0 ? parseInt(args[fi + 1], 10) : 1;
          let text = stdin; const file = rest.find((r, i) => i > 0 || !['-d', '-f'].includes(r));
          const fname = rest[rest.length - 1]; if (rest.length && files.hasOwnProperty(resolve(fname))) { const r = readFile(fname); if (r.err) return r; text = r.out; }
          const lines = (text || '').replace(/\n$/, '').split('\n').map((l) => (l.split(delim)[field - 1] || ''));
          return { out: lines.join('\n') };
        }
        case 'base64': {
          let text = stdin; if (rest.length) { const r = readFile(rest[rest.length - 1]); if (r.err) return r; text = r.out; }
          try { return { out: hasFlag('-d') ? b64decode((text || '').trim()) : b64encode(text || '') }; } catch (e) { return { err: 'base64: ongeldige invoer' }; }
        }
        case 'sha256sum': { let text = stdin; if (rest.length) { const r = readFile(rest[0]); if (r.err) return r; text = r.out; } return { out: sha256(text || '') + '  ' + (rest[0] || '-') }; }
        case 'md5sum': { let text = stdin; if (rest.length) { const r = readFile(rest[0]); if (r.err) return r; text = r.out; } return { out: md5(text || '') + '  ' + (rest[0] || '-') }; }
        case 'strings': {
          let text = stdin; if (rest.length) { const r = readFile(rest[0]); if (r.err) return r; text = r.out; }
          const m = (text || '').match(/[\x20-\x7e]{4,}/g) || [];
          return { out: m.join('\n') };
        }
        case 'file': {
          const abs = resolve(rest[0]); if (!exists(abs)) return { err: 'file: ' + rest[0] + ': No such file or directory' };
          if (dirs.has(abs) && !files.hasOwnProperty(abs)) return { out: rest[0] + ': directory' };
          const content = files[abs] || '';
          return { out: rest[0] + ': ' + (/[^\x09-\x7e]/.test(content) ? 'data' : 'ASCII text') };
        }
        case 'touch': { const abs = resolve(rest[0]); if (!files.hasOwnProperty(abs)) { files[abs] = ''; const parts = abs.split('/').filter(Boolean); for (let i = 1; i < parts.length; i++) dirs.add('/' + parts.slice(0, i).join('/')); } return { out: '' }; }
        case 'mkdir': { const abs = resolve(rest[0]); dirs.add(abs); const parts = abs.split('/').filter(Boolean); for (let i = 1; i < parts.length; i++) dirs.add('/' + parts.slice(0, i).join('/')); return { out: '' }; }
        case 'rm': { const abs = resolve(rest[rest.length - 1]); if (files.hasOwnProperty(abs)) { delete files[abs]; return { out: '' }; } if (dirs.has(abs)) { if (hasFlag('-r')) { dirs.delete(abs); Object.keys(files).forEach((p) => { if (p.startsWith(abs + '/')) delete files[p]; }); return { out: '' }; } return { err: 'rm: cannot remove \'' + rest[rest.length - 1] + '\': Is a directory' }; } return { err: 'rm: cannot remove \'' + rest[rest.length - 1] + '\': No such file or directory' }; }
        default:
          return { err: (piped ? '' : 'bash: ') + c + ': command not found' };
      }
    }

    // invoerregel
    function newPrompt() {
      const row = el('div', { class: 'inrow' });
      const ps = el('span', { class: 'prompt', text: promptStr() });
      const inp = el('input', { type: 'text', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off' });
      row.append(ps, document.createTextNode(' '), inp);
      out.append(row);
      inp.focus();
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const v = inp.value; row.remove();
          printPrompted(v); run(v); newPrompt();
        } else if (e.key === 'ArrowUp') { if (hidx > 0) { hidx--; inp.value = history[hidx] || ''; } e.preventDefault(); }
        else if (e.key === 'ArrowDown') { if (hidx < history.length) { hidx++; inp.value = history[hidx] || ''; } e.preventDefault(); }
        else if (e.key === 'l' && e.ctrlKey) { out.innerHTML = ''; newPrompt(); e.preventDefault(); }
      });
    }

    if (cfg.motd) println(cfg.motd, 'muted');
    out.addEventListener('click', () => { const i = out.querySelector('.inrow input'); if (i) i.focus(); });
    container.append(shell('<b>' + (isPwsh ? 'PowerShell' : 'Terminal') + '</b> — ' + user + '@' + host, out));
    newPrompt();

    function tokenize(s) { const m = s.match(/"[^"]*"|'[^']*'|\S+/g) || []; return m; }
    function normCmd(s) { return s.trim().replace(/\s+/g, ' '); }
  });

  // =====================================================================
  //  CYBERCHEF
  // =====================================================================
  CS.registerLab('cyberchef', function (container, cfg) {
    const OPS = [
      { id: 'b64e', name: 'Base64 coderen', fn: (s) => b64encode(s) },
      { id: 'b64d', name: 'Base64 decoderen', fn: (s) => b64decode(s) },
      { id: 'hexe', name: 'Hex coderen', fn: (s) => toHex(s) },
      { id: 'hexd', name: 'Hex decoderen', fn: (s) => fromHex(s) },
      { id: 'bine', name: 'Binair coderen', fn: (s) => s.split('').map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') },
      { id: 'bind', name: 'Binair decoderen', fn: (s) => s.trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join('') },
      { id: 'rot13', name: 'ROT13', fn: (s) => s.replace(/[a-z]/gi, (c) => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c.charCodeAt(0) + 13) ? c.charCodeAt(0) + 13 : c.charCodeAt(0) - 13)) },
      { id: 'caesar', name: 'Caesar (n)', arg: '3', fn: (s, n) => caesar(s, parseInt(n, 10) || 0) },
      { id: 'urle', name: 'URL coderen', fn: (s) => encodeURIComponent(s) },
      { id: 'urld', name: 'URL decoderen', fn: (s) => { try { return decodeURIComponent(s); } catch (e) { return '[ongeldige URL-codering]'; } } },
      { id: 'rev', name: 'Omkeren', fn: (s) => s.split('').reverse().join('') },
      { id: 'xor', name: 'XOR (sleutel)', arg: 'key', fn: (s, k) => xorStr(s, k || '') },
      { id: 'md5', name: 'MD5', fn: (s) => md5(s) },
      { id: 'sha1', name: 'SHA-1', fn: (s) => sha1(s) },
      { id: 'sha256', name: 'SHA-256', fn: (s) => sha256(s) },
    ];
    const recipe = []; // {op, argVal}
    const wrap = el('div', { class: 'lab-pad' });
    const input = el('textarea', { rows: '3', spellcheck: 'false' }); input.value = cfg.input || '';
    wrap.append(el('label', { text: 'Invoer' }), input);
    wrap.append(el('label', { text: 'Voeg bewerkingen toe (klikken = toevoegen aan recept)' }));
    const palette = el('div', { class: 'chip-row' });
    OPS.forEach((op) => palette.append(el('span', { class: 'chip', text: op.name, onclick: () => { recipe.push({ op, argVal: op.arg || '' }); renderRecipe(); compute(); } })));
    wrap.append(palette);
    wrap.append(el('label', { text: 'Recept (volgorde telt)' }));
    const recipeBox = el('div', { class: 'chip-row' });
    wrap.append(recipeBox);
    wrap.append(el('label', { text: 'Uitvoer' }));
    const output = el('div', { class: 'lab-out' });
    wrap.append(output);

    function renderRecipe() {
      recipeBox.innerHTML = '';
      if (!recipe.length) { recipeBox.append(el('span', { class: 'found-note', text: 'Nog leeg — klik hierboven op een bewerking.' })); return; }
      recipe.forEach((step, i) => {
        const chip = el('span', { class: 'chip on' });
        chip.append(document.createTextNode((i + 1) + '. ' + step.op.name));
        if (step.op.arg != null) {
          const inp = el('input', { type: 'text', value: step.argVal, style: 'width:70px;margin-left:6px;padding:2px 6px;font-size:.78rem', oninput: (e) => { step.argVal = e.target.value; compute(); } });
          chip.append(inp);
        }
        chip.append(el('span', { text: '  ✕', style: 'cursor:pointer;color:var(--bad)', onclick: (e) => { e.stopPropagation(); recipe.splice(i, 1); renderRecipe(); compute(); } }));
        recipeBox.append(chip);
      });
      recipeBox.append(el('span', { class: 'chip', text: '🗑 Wissen', onclick: () => { recipe.length = 0; renderRecipe(); compute(); } }));
    }
    function compute() {
      let s = input.value;
      try { recipe.forEach((step) => { s = step.op.fn(s, step.argVal); }); output.textContent = s; }
      catch (e) { output.textContent = '[fout: ' + e.message + ']'; }
    }
    input.addEventListener('input', compute);
    renderRecipe(); compute();
    container.append(shell('<b>CyberChef Light</b> — coderen, decoderen & hashen', wrap, false));
  });

  // =====================================================================
  //  HASHCRACK
  // =====================================================================
  CS.registerLab('hashcrack', function (container, cfg) {
    const algo = cfg.algo || 'md5';
    const salt = cfg.salt || '';
    const target = String(cfg.hash).toLowerCase();
    const list = (cfg.wordlist || []).slice();
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('div', { html: '<strong>Doel-hash (' + algo.toUpperCase() + (salt ? ', salt=&quot;' + esc(salt) + '&quot;' : '') + '):</strong>' }));
    wrap.append(el('div', { class: 'lab-out', text: target }));
    wrap.append(el('label', { text: 'Woordenlijst (' + list.length + ' woorden) — of voeg eigen gok toe' }));
    const addRow = el('div', { class: 'ans-row' });
    const guess = el('input', { type: 'text', placeholder: 'eigen woord…', style: 'flex:1' });
    addRow.append(guess, el('button', { class: 'btn small', text: 'Voeg toe', onclick: () => { if (guess.value.trim()) { list.push(guess.value.trim()); guess.value = ''; renderList(); } } }));
    wrap.append(addRow);
    const listBox = el('div', { class: 'chip-row' });
    wrap.append(listBox);
    const runBtn = el('button', { class: 'btn primary', text: '▶ Start woordenlijstaanval', style: 'margin-top:10px' });
    wrap.append(runBtn);
    const result = el('div', { class: 'lab-out', style: 'margin-top:10px' });
    wrap.append(result);

    function hashWord(w) { return Hash[algo](salt + w); }
    function renderList() { listBox.innerHTML = ''; list.forEach((w) => listBox.append(el('span', { class: 'chip', text: w }))); }
    renderList();
    runBtn.addEventListener('click', () => {
      result.textContent = ''; let i = 0; runBtn.disabled = true;
      const step = () => {
        if (i >= list.length) { result.append(el('div', { text: '✗ Niet gekraakt. Voeg meer woorden toe.', style: 'color:var(--bad)' })); runBtn.disabled = false; return; }
        const w = list[i];
        const h = hashWord(w);
        const line = el('div', { class: 'resp' });
        const hit = h === target;
        line.textContent = 'proberen "' + w + '" → ' + h.slice(0, 24) + '… ' + (hit ? '✓ TREFFER' : '✗');
        if (hit) line.style.color = 'var(--good)';
        result.append(line);
        if (hit) { result.append(el('div', { html: '<strong>🔓 Wachtwoord gevonden: <code>' + esc(w) + '</code></strong>', style: 'margin-top:6px;color:var(--good)' })); runBtn.disabled = false; return; }
        i++; setTimeout(step, 110);
      };
      step();
    });
    container.append(shell('<b>Hash-kraker</b> — woordenlijstaanval (lab)', wrap, false));
  });

  // =====================================================================
  //  PASSWORD STRENGTH
  // =====================================================================
  CS.registerLab('password', function (container) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Typ een wachtwoord (wordt NIET verstuurd — alles blijft in je browser)' }));
    const inp = el('input', { type: 'text', placeholder: 'probeer eens iets…', spellcheck: 'false' });
    wrap.append(inp);
    const meter = el('div', { class: 'meter' }, el('i', { style: 'width:0%' }));
    wrap.append(meter);
    const verdict = el('div', { class: 'found-note' });
    const info = el('div', { class: 'lab-out', style: 'margin-top:8px' });
    wrap.append(verdict, info);
    const COMMON = new Set(['wachtwoord', 'password', '123456', '123456789', 'welkom', 'welkom01', 'qwerty', 'geheim', 'admin', 'letmein', 'iloveyou', 'voetbal', 'lente2024', 'zomer2025']);

    function analyse(pw) {
      let pool = 0;
      if (/[a-z]/.test(pw)) pool += 26;
      if (/[A-Z]/.test(pw)) pool += 26;
      if (/[0-9]/.test(pw)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
      const entropy = pw.length ? Math.round(pw.length * Math.log2(pool || 1)) : 0;
      const guesses = Math.pow(2, entropy);
      const perSec = 1e10; // 10 miljard/sec (moderne GPU, offline)
      const secs = guesses / perSec;
      return { entropy, secs, common: COMMON.has(pw.toLowerCase()) };
    }
    function human(secs) {
      if (secs < 1) return 'minder dan een seconde';
      const u = [['jaar', 31536000], ['dag', 86400], ['uur', 3600], ['minuut', 60], ['seconde', 1]];
      for (const [n, s] of u) { if (secs >= s) { const v = secs / s; if (v > 1e9) return Math.round(v / 1e9) + ' miljard ' + n + 'en'; if (v > 1e6) return Math.round(v / 1e6) + ' miljoen ' + n + 'en'; return Math.round(v) + ' ' + n + (Math.round(v) === 1 ? '' : (n === 'jaar' ? ' jaar' : 'en')); } }
      return '—';
    }
    inp.addEventListener('input', () => {
      const pw = inp.value; const a = analyse(pw);
      const pct = Math.min(100, (a.entropy / 90) * 100);
      const bar = meter.querySelector('i');
      bar.style.width = pct + '%';
      let color = 'var(--bad)', label = 'zeer zwak';
      if (a.common) { color = 'var(--bad)'; label = 'staat in elke woordenlijst!'; bar.style.width = '8%'; }
      else if (a.entropy >= 70) { color = 'var(--good)'; label = 'sterk'; }
      else if (a.entropy >= 50) { color = 'var(--warn)'; label = 'redelijk'; }
      else if (a.entropy >= 30) { color = 'var(--warn)'; label = 'zwak'; }
      bar.style.background = color;
      verdict.innerHTML = '<strong style="color:' + color + '">' + label + '</strong> · ' + a.entropy + ' bits entropie';
      info.textContent = pw ? 'Geschatte kraaktijd (offline, 10 miljard pogingen/sec): ' + (a.common ? 'direct — dit wachtwoord wordt als eerste geprobeerd' : human(a.secs)) : '';
    });
    container.append(shell('<b>Wachtwoord-analyse</b>', wrap, false));
  });

  // =====================================================================
  //  PHISHING
  // =====================================================================
  CS.registerLab('phishing', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    const emails = cfg.emails || [];
    let idx = 0, found = 0, total = 0;
    emails.forEach((m) => { total += Object.keys(m.flags || {}).length; (m.body || []).forEach((p) => p.forEach((seg) => { if (seg.flag) total++; })); });
    const box = el('div', {});
    wrap.append(box);
    const nav = el('div', { class: 'verdict-row', style: 'margin-top:14px' });
    wrap.append(nav);

    function render() {
      const m = emails[idx];
      box.innerHTML = '';
      const mail = el('div', { class: 'mail' });
      const hdr = el('div', { class: 'hdr' });
      const addRow = (k, v, flagKey) => {
        const row = el('div', { class: 'row' });
        row.append(el('span', { class: 'k', text: k }));
        if (m.flags && m.flags[flagKey]) {
          const span = el('span', { class: 'flagable', text: v, title: 'Klik als dit verdacht is' });
          span.addEventListener('click', () => flag(span, m.flags[flagKey]));
          row.append(span);
        } else row.append(el('span', { text: v }));
        hdr.append(row);
      };
      addRow('Van:', m.fromName + ' <' + m.from + '>', 'from');
      addRow('Aan:', m.to || 'jij@voorbeeld.nl', 'to');
      addRow('Onderwerp:', m.subject, 'subject');
      addRow('Datum:', m.date || '', 'date');
      mail.append(hdr);
      const body = el('div', { class: 'body' });
      (m.body || []).forEach((para) => {
        const p = el('p');
        para.forEach((seg) => {
          if (seg.link) {
            const a = el('a', { href: 'javascript:void(0)', class: 'flagable', text: seg.text || seg.link });
            a.setAttribute('data-href', seg.link);
            a.title = 'Werkelijke link: ' + seg.link;
            if (seg.flag) a.addEventListener('click', () => flag(a, seg.flag)); else a.addEventListener('click', (e) => e.preventDefault());
            p.append(a);
          } else if (seg.flag) {
            const s = el('span', { class: 'flagable', text: seg.text });
            s.addEventListener('click', () => flag(s, seg.flag));
            p.append(s);
          } else p.append(document.createTextNode(seg.text));
        });
        body.append(p);
      });
      mail.append(body);
      box.append(mail);
      const note = el('div', { class: 'found-note', text: 'Klik op alles wat jou verdacht lijkt. Kies daarna of deze mail phishing is.' });
      box.append(note);

      nav.innerHTML = '';
      nav.append(
        el('button', { class: 'btn', text: '🚩 Dit is phishing', onclick: () => verdict(true) }),
        el('button', { class: 'btn', text: '✅ Dit is legitiem', onclick: () => verdict(false) }),
        el('span', { class: 'found-note', text: 'E-mail ' + (idx + 1) + '/' + emails.length }),
      );
    }
    const flagged = new WeakSet();
    function flag(node, reason) {
      if (flagged.has(node)) return;
      flagged.add(node); node.classList.add('flagged'); found++;
      CS.toast('🔍 Rode vlag gevonden', reason);
    }
    function verdict(saysPhish) {
      const m = emails[idx];
      const correct = saysPhish === !!m.phishing;
      CS.toast(correct ? '✓ Klopt!' : '✗ Mis', (m.phishing ? 'Dit WAS phishing. ' : 'Dit was legitiem. ') + (m.phishing ? 'Rode vlaggen gevonden: ' + found : ''));
      if (idx < emails.length - 1) { idx++; found = 0; render(); }
      else { box.innerHTML = ''; box.append(el('div', { class: 'callout tip', html: '<strong>Klaar!</strong> Je hebt alle ' + emails.length + ' mails beoordeeld. Onthoud de rode vlaggen: afzenderadres, haast/dreiging, vreemde links, onpersoonlijke aanhef, en verzoeken om gegevens.' })); nav.innerHTML = ''; }
    }
    render();
    container.append(shell('<b>Phishing-inbox</b> — zoek de rode vlaggen', wrap, false));
  });

  // =====================================================================
  //  LOGS
  // =====================================================================
  CS.registerLab('logs', function (container, cfg) {
    const lines = (cfg.lines || '').replace(/\n$/, '').split('\n');
    const wrap = el('div', { class: 'lab-pad' });
    const ctrl = el('div', { class: 'ans-row' });
    const filter = el('input', { type: 'text', placeholder: 'filter… (tekst, of /regex/)', style: 'flex:1' });
    const cnt = el('span', { class: 'found-note' });
    ctrl.append(filter, cnt);
    wrap.append(ctrl);
    const view = el('div', { class: 'logview' });
    wrap.append(view);
    function render() {
      const f = filter.value.trim();
      let re = null, plain = '';
      if (f.startsWith('/') && f.lastIndexOf('/') > 0) { try { re = new RegExp(f.slice(1, f.lastIndexOf('/')), 'i'); } catch (e) { re = null; } }
      else plain = f.toLowerCase();
      view.innerHTML = ''; let shown = 0;
      lines.forEach((ln, i) => {
        const match = re ? re.test(ln) : (plain ? ln.toLowerCase().includes(plain) : true);
        if (f && !match) return;
        shown++;
        const row = el('div', { class: 'ln' });
        row.append(el('span', { class: 'n', text: String(i + 1) }));
        if (f && match && (re || plain)) {
          const span = el('span');
          let html = esc(ln);
          if (plain) html = html.replace(new RegExp('(' + plain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<span class="hl">$1</span>');
          else if (re) html = html.replace(new RegExp(re.source, 'ig'), (mm) => '<span class="hl">' + esc(mm) + '</span>');
          span.innerHTML = html; row.append(span);
        } else row.append(el('span', { text: ln }));
        view.append(row);
      });
      cnt.textContent = shown + ' / ' + lines.length + ' regels';
    }
    filter.addEventListener('input', render);
    render();
    container.append(shell('<b>Logviewer</b> — <code>' + esc(cfg.title || 'log') + '</code>', wrap, false));
  });

  // =====================================================================
  //  HTTP CLIENT
  // =====================================================================
  CS.registerLab('http', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    const cols = el('div', { class: 'http-cols' });
    const left = el('div', {}), right = el('div', {});
    cols.append(left, right);
    wrap.append(cols);

    const methodSel = el('select', {}, ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'].map((mth) => el('option', { value: mth, text: mth })));
    const pathInp = el('input', { type: 'text', value: (cfg.start && cfg.start.path) || '/' });
    if (cfg.start && cfg.start.method) methodSel.value = cfg.start.method;
    left.append(el('label', { text: 'Methode & pad op ' + (cfg.host || 'server') }), el('div', { class: 'ans-row' }, [methodSel, pathInp]));
    const headersArea = el('textarea', { rows: '3', spellcheck: 'false' });
    headersArea.value = cfg.start && cfg.start.headers ? Object.entries(cfg.start.headers).map(([k, v]) => k + ': ' + v).join('\n') : 'Cookie: session=abc123';
    left.append(el('label', { text: 'Headers (één per regel, "Naam: waarde")' }), headersArea);
    const bodyArea = el('textarea', { rows: '2', spellcheck: 'false' }); bodyArea.value = (cfg.start && cfg.start.body) || '';
    left.append(el('label', { text: 'Body (voor POST/PUT)' }), bodyArea);
    left.append(el('button', { class: 'btn primary', text: '➤ Verstuur verzoek', style: 'margin-top:10px', onclick: send }));

    const respBox = el('div', { class: 'lab-out resp', style: 'min-height:120px' });
    right.append(el('label', { text: 'Antwoord van server' }), respBox);

    function parseHeaders(text) { const h = {}; text.split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }); return h; }
    function send() {
      const method = methodSel.value;
      const path = pathInp.value.trim();
      const headers = parseHeaders(headersArea.value);
      const body = bodyArea.value;
      const route = (cfg.routes || []).find((r) => {
        if (r.method !== method) return false;
        if (r.path !== path) return false;
        if (r.when) return r.when.every((w) => {
          if (w.header) { const hv = Object.entries(headers).find(([k]) => k.toLowerCase() === w.header.toLowerCase()); return hv && String(hv[1]).includes(w.contains); }
          if (w.body) return body.includes(w.value);
          return true;
        });
        return true;
      });
      const resp = route || { status: 404, headers: { 'Content-Type': 'text/plain' }, body: 'Not Found' };
      const statusClass = 'status-' + (resp.status >= 200 && resp.status < 300 ? '200' : String(resp.status)[0]);
      respBox.innerHTML = '';
      respBox.append(el('div', { class: statusClass, html: '<strong>HTTP/1.1 ' + resp.status + ' ' + statusText(resp.status) + '</strong>' }));
      Object.entries(resp.headers || {}).forEach(([k, v]) => respBox.append(el('div', { text: k + ': ' + v })));
      respBox.append(el('div', { text: '' }));
      respBox.append(el('div', { html: esc(resp.body || '').replace(/\n/g, '<br>') }));
    }
    function statusText(s) { return ({ 200: 'OK', 201: 'Created', 301: 'Moved Permanently', 302: 'Found', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 500: 'Internal Server Error' })[s] || ''; }
    send();
    container.append(shell('<b>HTTP-client</b> — stuur verzoeken naar <code>' + esc(cfg.host || 'lab') + '</code>', wrap, false));
  });

  // =====================================================================
  //  SQL INJECTION
  // =====================================================================
  CS.registerLab('sqli', function (container, cfg) {
    const flag = cfg.flag || 'JVT{sql_injectie}';
    const users = [
      { id: 1, username: 'admin', password: 'Zomer!2026', role: 'admin' },
      { id: 2, username: 'jan', password: 'voetbal', role: 'user' },
      { id: 3, username: 'fatima', password: 'K9!wortel', role: 'user' },
    ];
    const wrap = el('div', { class: 'lab-pad sqlform' });
    const uInp = el('input', { type: 'text', placeholder: 'gebruikersnaam', spellcheck: 'false' });
    const pInp = el('input', { type: 'text', placeholder: 'wachtwoord', spellcheck: 'false' });
    wrap.append(el('label', { text: 'Gebruikersnaam' }), uInp, el('label', { text: 'Wachtwoord' }), pInp);
    const safe = el('label', { class: 'switch', style: 'margin-top:12px' }, [
      el('input', { type: 'checkbox' }), el('span', { class: 'track' }), el('span', { text: 'Gebruik prepared statements (veilig)' }),
    ]);
    wrap.append(safe);
    const queryView = el('div', { class: 'sqlquery' });
    wrap.append(el('label', { text: 'Query die de server uitvoert:' }), queryView);
    const result = el('div', { class: 'lab-out' });
    wrap.append(el('button', { class: 'btn primary', text: '🔑 Inloggen', style: 'margin:10px 0', onclick: attempt }), result);

    function sqlEsc(s) { return s.replace(/'/g, "''"); }
    function updateQuery() {
      const u = uInp.value, p = pInp.value;
      const secure = safe.querySelector('input').checked;
      if (secure) queryView.textContent = "SELECT * FROM users WHERE username = ? AND password = ?   -- params: ['" + u + "', '" + p + "']";
      else queryView.textContent = "SELECT * FROM users WHERE username = '" + u + "' AND password = '" + p + "'";
    }
    uInp.addEventListener('input', updateQuery); pInp.addEventListener('input', updateQuery);
    safe.querySelector('input').addEventListener('change', updateQuery);
    updateQuery();

    function attempt() {
      const u = uInp.value, p = pInp.value;
      const secure = safe.querySelector('input').checked;
      let matched;
      if (secure) {
        matched = users.filter((row) => row.username === u && row.password === p);
      } else {
        // naïeve evaluatie van WHERE met OR en commentaar
        matched = evalNaive(u, p, users);
      }
      result.innerHTML = '';
      if (matched.length) {
        const asAdmin = matched.some((m) => m.role === 'admin');
        result.append(el('div', { html: '<strong style="color:var(--good)">✓ Ingelogd als ' + esc(matched[0].username) + ' (' + matched[0].role + ')</strong>' }));
        if (asAdmin) result.append(el('div', { html: '🏴 Admin-toegang! Vlag: <code>' + esc(flag) + '</code>', style: 'margin-top:6px;color:var(--good)' }));
      } else {
        result.append(el('div', { text: '✗ Ongeldige gebruikersnaam of wachtwoord.', style: 'color:var(--bad)' }));
      }
    }
    // zeer kleine "SQL"-evaluator die ' OR '1'='1 en -- comments begrijpt
    function evalNaive(u, p, rows) {
      let q = "username = '" + u + "' AND password = '" + p + "'";
      // comment
      const ci = q.search(/--|#/); if (ci >= 0) q = q.slice(0, ci);
      return rows.filter((row) => {
        try { return evalWhere(q, row); } catch (e) { return false; }
      });
    }
    function evalWhere(q, row) {
      // vervang kolomwaarden en vergelijk; ondersteun OR/AND, '='
      // tokeniseer op OR/AND
      const orParts = q.split(/\s+OR\s+/i);
      return orParts.some((orp) => {
        const andParts = orp.split(/\s+AND\s+/i);
        return andParts.every((cond) => evalCond(cond.trim(), row));
      });
    }
    function evalCond(cond, row) {
      // vormen: 'x' = 'y' | username = 'x' | password = 'x' | '1'='1'
      const m = cond.match(/^(.+?)\s*=\s*(.+)$/);
      if (!m) { // kaal getal of string => waarheid
        const t = cond.replace(/['"]/g, '').trim(); return t === '1' || /^[^0].*/.test(t) && t !== '0' && t !== '';
      }
      const lhs = val(m[1], row), rhs = val(m[2], row);
      return lhs === rhs;
    }
    function val(tok, row) {
      tok = tok.trim();
      const sm = tok.match(/^'(.*)'$/);
      if (sm) return sm[1];
      if (tok === 'username') return row.username;
      if (tok === 'password') return row.password;
      if (tok === 'role') return row.role;
      return tok;
    }
    container.append(shell('<b>Kwetsbaar loginformulier</b> — SQL-injectie (lab)', wrap, false));
  });

  // =====================================================================
  //  SUBNET
  // =====================================================================
  CS.registerLab('subnet', function (container) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Reken uit: IP/CIDR (bijv. 192.168.1.10/26)' }));
    const inp = el('input', { type: 'text', value: '192.168.1.10/24', spellcheck: 'false' });
    wrap.append(inp, el('button', { class: 'btn small primary', text: 'Bereken', style: 'margin-top:8px', onclick: calc }));
    const outp = el('div', { class: 'lab-out', style: 'margin-top:10px' });
    wrap.append(outp);
    wrap.append(el('hr', { style: 'border:0;border-top:1px solid var(--border);margin:14px 0' }));
    const quiz = el('div', {});
    wrap.append(el('button', { class: 'btn small', text: '🎲 Geef me een oefenvraag', onclick: newQ }), quiz);

    function parse(s) {
      const m = s.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
      if (!m) return null;
      const oct = [+m[1], +m[2], +m[3], +m[4]]; const cidr = +m[5];
      if (oct.some((o) => o > 255) || cidr > 32) return null;
      const ipNum = ((oct[0] << 24) >>> 0) + (oct[1] << 16) + (oct[2] << 8) + oct[3];
      const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
      const net = (ipNum & mask) >>> 0;
      const bcast = (net | (~mask >>> 0)) >>> 0;
      const hosts = cidr >= 31 ? 0 : (bcast - net - 1);
      return { cidr, mask, net, bcast, hosts, first: net + 1, last: bcast - 1 };
    }
    const toIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    function calc() {
      const r = parse(inp.value);
      if (!r) { outp.textContent = 'Ongeldige invoer. Voorbeeld: 10.0.0.5/24'; return; }
      outp.innerHTML = [
        'Subnetmasker:    ' + toIp(r.mask),
        'Netwerkadres:    ' + toIp(r.net),
        'Broadcast:       ' + toIp(r.bcast),
        'Eerste host:     ' + (r.hosts > 0 ? toIp(r.first) : '—'),
        'Laatste host:    ' + (r.hosts > 0 ? toIp(r.last) : '—'),
        'Bruikbare hosts: ' + r.hosts,
      ].join('\n');
    }
    calc();
    let answer;
    function newQ() {
      const oct = [10, 172, 192][Math.floor(Math.random() * 3)];
      const ip = oct + '.' + rnd(255) + '.' + rnd(255) + '.' + rnd(254);
      const cidr = 24 + Math.floor(Math.random() * 6); // /24../29
      const r = parse(ip + '/' + cidr);
      const which = ['netwerkadres', 'broadcast-adres', 'aantal bruikbare hosts'][Math.floor(Math.random() * 3)];
      answer = which === 'netwerkadres' ? toIp(r.net) : which === 'broadcast-adres' ? toIp(r.bcast) : String(r.hosts);
      quiz.innerHTML = '';
      quiz.append(el('div', { style: 'margin:10px 0', html: 'Wat is het <strong>' + which + '</strong> van <code>' + ip + '/' + cidr + '</code>?' }));
      const a = el('input', { type: 'text', placeholder: 'jouw antwoord', spellcheck: 'false' });
      const fb = el('div', { class: 'found-note' });
      quiz.append(el('div', { class: 'ans-row' }, [a, el('button', { class: 'btn small primary', text: 'Check', onclick: () => {
        fb.textContent = a.value.trim() === answer ? '✓ Correct!' : '✗ Het juiste antwoord is ' + answer;
        fb.style.color = a.value.trim() === answer ? 'var(--good)' : 'var(--bad)';
      } })]), fb);
    }
    function rnd(n) { return Math.floor(Math.random() * n); }
    container.append(shell('<b>Subnet-calculator</b> & oefenvragen', wrap, false));
  });

  // =====================================================================
  //  Encoding & hash helpers
  // =====================================================================
  function b64encode(s) { return btoa(unescape(encodeURIComponent(s))); }
  function b64decode(s) { return decodeURIComponent(escape(atob(s.replace(/\s/g, '')))); }
  function toHex(s) { return Array.from(s).map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '); }
  function fromHex(s) { return s.trim().split(/\s+/).map((h) => String.fromCharCode(parseInt(h, 16))).join(''); }
  function caesar(s, n) { return s.replace(/[a-z]/gi, (c) => { const base = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - base + n % 26 + 26) % 26 + base); }); }
  function xorStr(s, key) { if (!key) return s; let o = ''; for (let i = 0; i < s.length; i++) o += String.fromCharCode(s.charCodeAt(i) ^ key.charCodeAt(i % key.length)); return o; }

  // Expose encoders globally voor content indien nodig
  CS.enc = { b64encode, b64decode, toHex, fromHex, caesar, xorStr, md5, sha1, sha256 };

  // ---- MD5 (geverifieerde klassieke implementatie) ----------------------
  function md5(str) {
    function safeAdd(x, y) { const lsw = (x & 0xffff) + (y & 0xffff); const msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); }
    function rol(n, c) { return (n << c) | (n >>> (32 - c)); }
    function cmn(q, a, b, x, s, t) { return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
    function toBlocks(s) {
      const u = unescape(encodeURIComponent(s)); const n = u.length;
      const blks = []; for (let i = 0; i < n * 8; i += 8) blks[i >> 5] = (blks[i >> 5] || 0) | ((u.charCodeAt(i / 8) & 0xff) << (i % 32));
      blks[n * 8 >> 5] = (blks[n * 8 >> 5] || 0) | (0x80 << ((n * 8) % 32));
      blks[(((n + 8) >> 6) + 1) * 16 - 2] = n * 8;
      for (let i = 0; i < (((n + 8) >> 6) + 1) * 16; i++) blks[i] = blks[i] || 0;
      return blks;
    }
    const x = toBlocks(str);
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const oa = a, ob = b, oc = c, od = d;
      a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426); c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632); c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
      a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784); c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222); c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606); c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od);
    }
    const hex = (n) => { let s = ''; for (let i = 0; i < 4; i++) s += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, '0'); return s; };
    return hex(a) + hex(b) + hex(c) + hex(d);
  }

  // ---- SHA-1 -------------------------------------------------------------
  function sha1(str) {
    function rl(n, c) { return (n << c) | (n >>> (32 - c)); }
    const bytes = []; const u = unescape(encodeURIComponent(str)); for (let i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i));
    const ml = bytes.length * 8; bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push((ml / Math.pow(2, i * 8)) & 0xff);
    let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
    for (let off = 0; off < bytes.length; off += 64) {
      const w = []; for (let i = 0; i < 16; i++) w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      for (let i = 16; i < 80; i++) w[i] = rl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
      let a = h0, b = h1, c = h2, d = h3, e = h4;
      for (let i = 0; i < 80; i++) {
        let f, k;
        if (i < 20) { f = (b & c) | (~b & d); k = 0x5A827999; }
        else if (i < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
        else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
        else { f = b ^ c ^ d; k = 0xCA62C1D6; }
        const t = (rl(a, 5) + f + e + k + w[i]) & 0xffffffff;
        e = d; d = c; c = rl(b, 30); b = a; a = t;
      }
      h0 = (h0 + a) & 0xffffffff; h1 = (h1 + b) & 0xffffffff; h2 = (h2 + c) & 0xffffffff; h3 = (h3 + d) & 0xffffffff; h4 = (h4 + e) & 0xffffffff;
    }
    const hx = (n) => (n >>> 0).toString(16).padStart(8, '0');
    return hx(h0) + hx(h1) + hx(h2) + hx(h3) + hx(h4);
  }

  // ---- SHA-256 -----------------------------------------------------------
  function sha256(ascii) {
    function rr(n, x) { return (n >>> x) | (n << (32 - x)); }
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const u = unescape(encodeURIComponent(ascii)); const bytes = []; for (let i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i));
    const l = bytes.length * 8; bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push((Math.floor(l / Math.pow(2, i * 8))) & 0xff);
    for (let off = 0; off < bytes.length; off += 64) {
      const w = []; for (let i = 0; i < 16; i++) w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      for (let i = 16; i < 64; i++) { const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3); const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) & 0xffffffff; }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25); const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[i] + w[i]) & 0xffffffff;
        const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22); const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) & 0xffffffff;
        hh = g; g = f; f = e; e = (d + t1) & 0xffffffff; d = c; c = b; b = a; a = (t1 + t2) & 0xffffffff;
      }
      h = [h[0] + a, h[1] + b, h[2] + c, h[3] + d, h[4] + e, h[5] + f, h[6] + g, h[7] + hh].map((x) => x & 0xffffffff);
    }
    return h.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
})();

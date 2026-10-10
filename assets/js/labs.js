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
    md5: md5, sha1: sha1, sha256: sha256, md4: md4, ntlm: ntlm,
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
  //  HASHCRACK — woordenlijst + regels + brute-force (masker)
  // =====================================================================
  CS.registerLab('hashcrack', function (container, cfg) {
    const algo = (cfg.algo || 'md5').toLowerCase();
    const salt = cfg.salt || '';
    const saltPos = cfg.saltPos || 'prefix'; // 'prefix' => hash(salt+pw), 'suffix' => hash(pw+salt)
    const target = String(cfg.hash).toLowerCase();
    const baseList = (cfg.wordlist || []).slice();
    const hashFn = Hash[algo] || Hash.md5;
    function hashWord(w) { return hashFn(saltPos === 'suffix' ? w + salt : salt + w); }

    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('div', { html: '<strong>Doel-hash (' + algo.toUpperCase() + (salt ? ', salt=&quot;' + esc(salt) + '&quot;' : '') + '):</strong>' }));
    wrap.append(el('div', { class: 'lab-out', style: 'word-break:break-all', text: target }));

    // --- modus-keuze ---
    let mode = 'dict';
    const modeRow = el('div', { class: 'chip-row', style: 'margin-top:10px' });
    const dictPane = el('div', {}), bfPane = el('div', { class: 'hide' });
    const mDict = el('span', { class: 'chip on', text: '📖 Woordenlijst' });
    const mBf = el('span', { class: 'chip', text: '🔡 Brute-force (masker)' });
    mDict.addEventListener('click', () => { mode = 'dict'; mDict.classList.add('on'); mBf.classList.remove('on'); dictPane.classList.remove('hide'); bfPane.classList.add('hide'); });
    mBf.addEventListener('click', () => { mode = 'bf'; mBf.classList.add('on'); mDict.classList.remove('on'); bfPane.classList.remove('hide'); dictPane.classList.add('hide'); });
    modeRow.append(mDict, mBf);
    wrap.append(modeRow);

    // --- woordenlijst-paneel ---
    dictPane.append(el('label', { text: 'Woordenlijst — voeg eigen gokken toe' }));
    const addRow = el('div', { class: 'ans-row' });
    const guess = el('input', { type: 'text', placeholder: 'eigen woord…', style: 'flex:1' });
    const list = baseList.slice();
    const listBox = el('div', { class: 'chip-row' });
    function renderList() { listBox.innerHTML = ''; list.forEach((w) => listBox.append(el('span', { class: 'chip', text: w }))); }
    addRow.append(guess, el('button', { class: 'btn small', text: 'Voeg toe', onclick: () => { if (guess.value.trim()) { list.push(guess.value.trim()); guess.value = ''; renderList(); } } }));
    dictPane.append(addRow, listBox);
    // regels (mangling)
    dictPane.append(el('label', { text: 'Regels (mangling) — rek de lijst op, zoals Hashcat/John' }));
    const rules = { cap: false, leet: false, digits: false, bang: false, year: false };
    const ruleRow = el('div', { class: 'chip-row' });
    const ruleDefs = [['cap', 'Eerste letter hoofd'], ['leet', 'l33t (a→@ e→3 o→0 s→$)'], ['digits', '+ cijfer 0–99'], ['year', '+ jaar 1990–2026'], ['bang', '+ leesteken ! ? @ #']];
    ruleDefs.forEach(([k, label]) => { const c = el('span', { class: 'chip', text: label, onclick: () => { rules[k] = !rules[k]; c.classList.toggle('on', rules[k]); updateCount(); } }); ruleRow.append(c); });
    dictPane.append(ruleRow);
    const ruleCount = el('div', { class: 'found-note' });
    dictPane.append(ruleCount);

    function leet(w) { return w.replace(/a/gi, '@').replace(/e/gi, '3').replace(/o/gi, '0').replace(/s/gi, '$').replace(/i/gi, '1'); }
    function* candidates() {
      for (const base of list) {
        const forms = new Set([base]);
        if (rules.cap) forms.add(base.charAt(0).toUpperCase() + base.slice(1));
        if (rules.leet) { Array.from(forms).forEach((f) => forms.add(leet(f))); }
        const stems = Array.from(forms);
        for (const s of stems) {
          yield s;
          if (rules.digits) for (let d = 0; d <= 99; d++) yield s + d;
          if (rules.year) for (let y = 1990; y <= 2026; y++) yield s + y;
          if (rules.bang) for (const p of ['!', '?', '@', '#', '123', '!!']) yield s + p;
        }
      }
    }
    function countCandidates() { let n = 0; for (const _ of candidates()) { n++; if (n > 1e6) break; } return n; }
    function updateCount() { ruleCount.textContent = '≈ ' + countCandidates().toLocaleString('nl-NL') + ' kandidaten uit ' + list.length + ' basiswoorden'; }

    // --- brute-force-paneel ---
    const charsets = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', symbols: '!@#$%&*' };
    const bfSel = { lower: true, upper: false, digits: true, symbols: false };
    bfPane.append(el('label', { text: 'Tekenset' }));
    const csRow = el('div', { class: 'chip-row' });
    [['lower', 'a–z'], ['upper', 'A–Z'], ['digits', '0–9'], ['symbols', '!@#$…']].forEach(([k, label]) => { const c = el('span', { class: 'chip' + (bfSel[k] ? ' on' : ''), text: label, onclick: () => { bfSel[k] = !bfSel[k]; c.classList.toggle('on', bfSel[k]); bfInfo(); } }); csRow.append(c); });
    bfPane.append(csRow);
    bfPane.append(el('label', { text: 'Maximale lengte' }));
    const lenSel = el('select', {}, [1, 2, 3, 4].map((n) => el('option', { value: n, text: n + ' tekens' })));
    lenSel.value = '3';
    bfPane.append(lenSel);
    const bfNote = el('div', { class: 'found-note' });
    bfPane.append(bfNote);
    const BF_CAP = 800000;
    function bfCharset() { return Object.keys(charsets).filter((k) => bfSel[k]).map((k) => charsets[k]).join(''); }
    function bfTotal() { const cs = bfCharset().length, L = +lenSel.value; let t = 0; for (let i = 1; i <= L; i++) t += Math.pow(cs, i); return t; }
    function bfInfo() { const t = bfTotal(); bfNote.innerHTML = 'Zoekruimte: <strong>' + t.toLocaleString('nl-NL') + '</strong> combinaties' + (t > BF_CAP ? ' — <span style="color:var(--warn)">te groot, er worden er maximaal ' + BF_CAP.toLocaleString('nl-NL') + ' geprobeerd. Dit laat juist zien waarom lengte zo belangrijk is.</span>' : '.'); }
    lenSel.addEventListener('change', bfInfo);

    wrap.append(dictPane, bfPane);
    const runBtn = el('button', { class: 'btn primary', text: '▶ Start kraken', style: 'margin-top:12px' });
    const stat = el('div', { class: 'found-note', style: 'margin-top:8px' });
    const result = el('div', { class: 'lab-out', style: 'margin-top:8px' });
    wrap.append(runBtn, stat, result);

    let running = false;
    function finish(found, cand, tried, t0) {
      running = false; runBtn.disabled = false; runBtn.textContent = '▶ Start kraken';
      const secs = Math.max((performance.now() - t0) / 1000, 0.001);
      stat.textContent = tried.toLocaleString('nl-NL') + ' pogingen · ' + Math.round(tried / secs).toLocaleString('nl-NL') + ' hashes/s · ' + secs.toFixed(1) + 's';
      result.innerHTML = '';
      if (found != null) result.append(el('div', { html: '<strong>🔓 Gekraakt! Wachtwoord: <code>' + esc(found) + '</code></strong>', style: 'color:var(--good)' }));
      else result.append(el('div', { text: '✗ Niet gekraakt binnen de geprobeerde kandidaten. Kies een grotere lijst, zet regels aan, of verleng het masker.', style: 'color:var(--bad)' }));
    }
    runBtn.addEventListener('click', () => {
      if (running) return; running = true; runBtn.disabled = true; runBtn.textContent = '… bezig';
      result.innerHTML = ''; stat.textContent = '';
      const t0 = performance.now();
      let tried = 0, found = null;
      let gen;
      if (mode === 'dict') { gen = candidates(); }
      else {
        const cs = bfCharset();
        if (!cs) { running = false; runBtn.disabled = false; runBtn.textContent = '▶ Start kraken'; result.append(el('div', { class: 'callout warn', text: 'Kies minstens één tekenset.' })); return; }
        const L = +lenSel.value;
        gen = (function* () {
          const idx = [];
          for (let len = 1; len <= L; len++) {
            idx.length = len; idx.fill(0);
            while (true) {
              yield idx.map((i) => cs[i]).join('');
              let p = len - 1;
              while (p >= 0) { idx[p]++; if (idx[p] < cs.length) break; idx[p] = 0; p--; }
              if (p < 0) break;
            }
          }
        })();
      }
      const chunk = () => {
        const budget = 6000; let n = 0;
        while (n < budget) {
          const nx = gen.next();
          if (nx.done) { finish(found, null, tried, t0); return; }
          const w = nx.value; tried++; n++;
          if (hashWord(w) === target) { found = w; finish(found, null, tried, t0); return; }
          if (mode === 'bf' && tried >= BF_CAP) { finish(found, null, tried, t0); return; }
          if (tried > 2e6) { finish(found, null, tried, t0); return; }
        }
        stat.textContent = tried.toLocaleString('nl-NL') + ' pogingen…';
        setTimeout(chunk, 0);
      };
      chunk();
    });
    renderList(); updateCount(); bfInfo();
    container.append(shell('<b>Hash-kraker</b> — woordenlijst, regels en brute-force (lab)', wrap, false));
  });

  // =====================================================================
  //  HASHID — herken het hashtype
  // =====================================================================
  CS.registerLab('hashid', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Plak een hash om het type te herkennen' }));
    const inp = el('input', { type: 'text', placeholder: 'bv. 5f4dcc3b5aa765d61d8327deb882cf99' }); inp.value = cfg.value || '';
    wrap.append(inp);
    const out = el('div', {});
    wrap.append(out);
    function identify(h) {
      h = h.trim();
      const res = [];
      const isHex = /^[a-f0-9]+$/i.test(h);
      if (/^\$2[aby]\$\d\d\$/.test(h)) res.push(['bcrypt', 'Blowfish-gebaseerd, met kostenfactor. Traag met opzet — zeer lastig te kraken.', true]);
      else if (/^\$6\$/.test(h)) res.push(['sha512crypt ($6$)', 'Linux /etc/shadow, met salt en vele rondes.', true]);
      else if (/^\$5\$/.test(h)) res.push(['sha256crypt ($5$)', 'Linux /etc/shadow, met salt en vele rondes.', true]);
      else if (/^\$1\$/.test(h)) res.push(['md5crypt ($1$)', 'Oud Unix-formaat met salt. Verouderd.', true]);
      else if (/^\$argon2/i.test(h)) res.push(['Argon2', 'Moderne, geheugenharde functie. Aanbevolen voor wachtwoorden.', true]);
      else if (/^\{SSHA\}/i.test(h)) res.push(['SSHA (LDAP)', 'Salted SHA-1 in Base64, veel in directory-servers.', true]);
      else if (/^\{SHA\}/i.test(h)) res.push(['SHA-1 (LDAP {SHA})', 'Base64-gecodeerde SHA-1, zonder salt.', false]);
      else if (isHex) {
        const n = h.length;
        if (n === 32) { res.push(['MD5', 'Snel en zonder salt → kwetsbaar voor woordenlijst- en brute-force-aanvallen.', false]); res.push(['NTLM', 'Windows-wachtwoordhash (MD4 van UTF-16LE). Even snel, geen salt.', false]); res.push(['MD4', 'Verouderd, zeer snel.', false]); }
        else if (n === 40) res.push(['SHA-1', 'Verouderd (botsingen bekend). Zonder salt snel te kraken.', false]);
        else if (n === 56) res.push(['SHA-224', 'SHA-2-familie.', false]);
        else if (n === 64) { res.push(['SHA-256', 'SHA-2-familie. Zonder salt nog steeds snel per hash.', false]); res.push(['SHA3-256 / BLAKE2', 'Zelfde lengte, andere functie.', false]); }
        else if (n === 96) res.push(['SHA-384', 'SHA-2-familie.', false]);
        else if (n === 128) res.push(['SHA-512', 'SHA-2-familie.', false]);
        else if (n === 16) res.push(['Mogelijk CRC/half-MD5', 'Korte hex — vaak een checksum, geen veilige hash.', false]);
        else res.push(['Onbekende hex-lengte (' + n + ')', 'Komt niet overeen met een bekende hash.', false]);
      } else if (/^[A-Za-z0-9+/]+={0,2}$/.test(h) && h.length % 4 === 0) {
        res.push(['Base64-gecodeerd', 'Dit is codering, geen hash. Decodeer het eerst (zie CyberChef).', false]);
      } else if (h.includes(':') && /^[a-f0-9]+:/i.test(h)) {
        res.push(['hash:salt of user:hash', 'Een samengesteld formaat — splits op de dubbele punt en herken elk deel apart.', false]);
      } else res.push(['Onherkend', 'Geen patroon herkend. Controleer op spaties of knip-/plakfouten.', false]);
      return res;
    }
    function render() {
      out.innerHTML = '';
      if (!inp.value.trim()) return;
      const res = identify(inp.value);
      res.forEach(([name, note, strong]) => {
        out.append(el('div', { class: 'callout ' + (strong ? 'tip' : 'info'), html: '<strong>' + esc(name) + '</strong>' + (strong ? ' 🛡️ <em>(traag / gesalt — moeilijk te kraken)</em>' : '') + '<br>' + esc(note) }));
      });
      out.append(el('div', { class: 'found-note', text: 'Lengte: ' + inp.value.trim().length + ' tekens. Let op: lengte alleen is niet bewijzend — meerdere functies delen dezelfde lengte.' }));
    }
    inp.addEventListener('input', render);
    render();
    container.append(shell('<b>Hash-herkenner</b> — welk type is dit?', wrap, false));
  });

  // =====================================================================
  //  CIPHER — klassieke cijfers kraken (Caesar/XOR/Vigenère/Atbash)
  // =====================================================================
  CS.registerLab('cipher', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Versleutelde tekst' }));
    const inp = el('textarea', { rows: '3', spellcheck: 'false' }); inp.value = cfg.text || '';
    wrap.append(inp);
    const methodRow = el('div', { class: 'chip-row' });
    const methods = [['caesar', 'Caesar / ROT (alle 26)'], ['xor', 'XOR (1 byte, brute-force)'], ['vigenere', 'Vigenère (met sleutel)'], ['atbash', 'Atbash'], ['reverse', 'Omkeren']];
    let method = 'caesar';
    methods.forEach(([k, label]) => { const c = el('span', { class: 'chip' + (k === method ? ' on' : ''), text: label, onclick: () => { method = k; Array.from(methodRow.children).forEach((x) => x.classList.remove('on')); c.classList.add('on'); render(); } }); methodRow.append(c); });
    wrap.append(methodRow);
    const keyRow = el('div', { class: 'ans-row hide' });
    const keyInp = el('input', { type: 'text', placeholder: 'Vigenère-sleutel, bv. dojo', style: 'flex:1' });
    keyRow.append(keyInp);
    wrap.append(keyRow);
    keyInp.addEventListener('input', render);
    const out = el('div', {});
    wrap.append(out);

    function shiftText(s, n) { return s.replace(/[a-z]/gi, (c) => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + n) % 26 + b); }); }
    // Nederlands/Engels-achtige score: veelvoorkomende letters, spaties en woorden, en JVT{
    function score(s) {
      const low = s.toLowerCase(); let sc = 0;
      for (const ch of low) { if (' etaoinshrdlu'.includes(ch)) sc += 2; else if (ch >= 'a' && ch <= 'z') sc += 0.3; else if (ch === ' ') sc += 1; else if (ch < ' ') sc -= 3; else sc -= 0.2; }
      [' de ', ' het ', ' een ', ' en ', ' van ', ' the ', ' and ', 'jvt{', 'flag', 'wachtwoord', 'geheim'].forEach((w) => { if (low.includes(w)) sc += 25; });
      return sc;
    }
    function atbash(s) { return s.replace(/[a-z]/gi, (c) => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode(b + 25 - (c.charCodeAt(0) - b)); }); }
    function vigenere(s, key, dec) { if (!key) return s; let ki = 0; return s.replace(/[a-z]/gi, (c) => { const b = c <= 'Z' ? 65 : 97; const k = key[ki % key.length].toLowerCase().charCodeAt(0) - 97; ki++; const off = dec ? (26 - k) : k; return String.fromCharCode((c.charCodeAt(0) - b + off) % 26 + b); }); }
    function render() {
      keyRow.classList.toggle('hide', method !== 'vigenere');
      out.innerHTML = '';
      const s = inp.value;
      if (!s) return;
      if (method === 'caesar') {
        const rows = [];
        for (let n = 0; n <= 25; n++) { const dec = shiftText(s, (26 - n) % 26); rows.push({ n, dec, sc: score(dec) }); }
        const best = rows.slice().sort((a, b) => b.sc - a.sc)[0];
        out.append(el('div', { class: 'callout tip', html: '🔓 <strong>Beste gok: ROT' + best.n + '</strong> (verschuiving ' + best.n + ')<br><code>' + esc(best.dec.slice(0, 160)) + '</code>' }));
        const box = el('div', { class: 'logview', style: 'max-height:260px' });
        rows.forEach((r) => { const ln = el('div', { class: 'ln' }); ln.append(el('span', { class: 'n', text: 'ROT' + r.n }), el('span', { text: r.dec, style: r === best ? 'color:#8ec7ab' : '' })); box.append(ln); });
        out.append(box);
      } else if (method === 'xor') {
        const bytes = []; const u = unescape(encodeURIComponent(s)); for (let i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i) & 0xff);
        // als invoer hex lijkt, lees als hex
        let data = bytes;
        if (/^[0-9a-f\s]+$/i.test(s.trim()) && s.replace(/\s/g, '').length % 2 === 0) { data = s.trim().split(/\s+/).join('').match(/.{2}/g).map((h) => parseInt(h, 16)); }
        const cands = [];
        for (let k = 0; k < 256; k++) { const dec = data.map((b) => String.fromCharCode(b ^ k)).join(''); cands.push({ k, dec, sc: score(dec) }); }
        cands.sort((a, b) => b.sc - a.sc);
        out.append(el('div', { class: 'callout tip', html: '🔓 <strong>Beste sleutel: 0x' + cands[0].k.toString(16).padStart(2, '0') + ' (' + cands[0].k + ')</strong><br><code>' + esc(cands[0].dec.slice(0, 160)) + '</code>' }));
        out.append(el('label', { text: 'Top 6 kandidaten' }));
        const box = el('div', { class: 'logview', style: 'max-height:200px' });
        cands.slice(0, 6).forEach((c) => { const ln = el('div', { class: 'ln' }); ln.append(el('span', { class: 'n', text: '0x' + c.k.toString(16).padStart(2, '0') }), el('span', { text: c.dec.slice(0, 120) })); box.append(ln); });
        out.append(box);
      } else if (method === 'vigenere') {
        out.append(el('label', { text: 'Ontsleuteld (met sleutel "' + esc(keyInp.value || '') + '")' }));
        out.append(el('div', { class: 'lab-out', text: vigenere(s, keyInp.value.replace(/[^a-z]/gi, ''), true) }));
        out.append(el('div', { class: 'found-note', text: 'Tip: ken je de sleutellengte niet? Zoek herhalende stukken (Kasiski) of probeer korte woorden. Deze tool ontsleutelt met de sleutel die je invult.' }));
      } else if (method === 'atbash') {
        out.append(el('div', { class: 'lab-out', text: atbash(s) }));
      } else if (method === 'reverse') {
        out.append(el('div', { class: 'lab-out', text: s.split('').reverse().join('') }));
      }
    }
    inp.addEventListener('input', render);
    render();
    container.append(shell('<b>Cijfer-kraker</b> — klassieke versleuteling ontcijferen', wrap, false));
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
  //  HEXVIEWER — hex-dump lezen (magic bytes, file carving)
  // =====================================================================
  CS.registerLab('hexviewer', function (container, cfg) {
    let bytes = [];
    if (cfg.hex) bytes = cfg.hex.trim().split(/\s+/).filter(Boolean).map((h) => parseInt(h, 16) & 0xff);
    else if (cfg.base64) { const s = b64decode(cfg.base64); for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i) & 0xff); }
    else if (cfg.text) { const u = unescape(encodeURIComponent(cfg.text)); for (let i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i) & 0xff); }
    const wrap = el('div', { class: 'lab-pad' });
    if (cfg.filename) wrap.append(el('div', { html: '<strong>Bestand:</strong> <code>' + esc(cfg.filename) + '</code> &nbsp; (' + bytes.length + ' bytes)' }));
    const dump = el('div', { class: 'logview', style: 'max-height:300px' });
    for (let off = 0; off < bytes.length; off += 16) {
      const row = bytes.slice(off, off + 16);
      const hex = row.map((b) => b.toString(16).padStart(2, '0')).join(' ');
      const hexPad = hex.padEnd(16 * 3 - 1, ' ');
      const ascii = row.map((b) => (b >= 0x20 && b <= 0x7e) ? String.fromCharCode(b) : '.').join('');
      const line = el('div', { class: 'ln' });
      line.append(
        el('span', { style: 'color:#7f8db5;flex:none', text: off.toString(16).padStart(8, '0') }),
        el('span', { style: 'color:#8ec7ab;white-space:pre', text: ' ' + hexPad + ' ' }),
        el('span', { style: 'color:#d6e2ff;white-space:pre', text: ascii }),
      );
      dump.append(line);
    }
    if (!bytes.length) dump.append(el('div', { text: '(leeg)' }));
    wrap.append(dump);
    wrap.append(el('details', { html: '<summary>📑 Spiekbrief: veelvoorkomende magic bytes (bestandssignaturen)</summary>' +
      '<table style="width:100%;font-size:.82rem;margin-top:8px"><thead><tr><th>Bestandstype</th><th>Eerste bytes (hex)</th><th>ASCII</th></tr></thead><tbody>' +
      '<tr><td>PNG-afbeelding</td><td><code>89 50 4E 47 0D 0A 1A 0A</code></td><td>.PNG….</td></tr>' +
      '<tr><td>JPEG-afbeelding</td><td><code>FF D8 FF</code></td><td>ÿØÿ</td></tr>' +
      '<tr><td>GIF-afbeelding</td><td><code>47 49 46 38</code></td><td>GIF8</td></tr>' +
      '<tr><td>PDF-document</td><td><code>25 50 44 46</code></td><td>%PDF</td></tr>' +
      '<tr><td>ZIP / DOCX / XLSX</td><td><code>50 4B 03 04</code></td><td>PK..</td></tr>' +
      '<tr><td>RAR-archief</td><td><code>52 61 72 21</code></td><td>Rar!</td></tr>' +
      '<tr><td>ELF (Linux-programma)</td><td><code>7F 45 4C 46</code></td><td>.ELF</td></tr>' +
      '<tr><td>Windows EXE/DLL</td><td><code>4D 5A</code></td><td>MZ</td></tr>' +
      '<tr><td>7-Zip-archief</td><td><code>37 7A BC AF 27 1C</code></td><td>7z…</td></tr>' +
      '</tbody></table>' }));
    container.append(shell('<b>Hex-viewer</b> — lees de rauwe bytes', wrap, false));
  });

  // =====================================================================
  //  PCAP — netwerkverkeer lezen (Wireshark-light)
  // =====================================================================
  CS.registerLab('pcap', function (container, cfg) {
    const packets = cfg.packets || [];
    const wrap = el('div', { class: 'lab-pad' });
    const ctrl = el('div', { class: 'ans-row' });
    const filter = el('input', { type: 'text', placeholder: 'filter… (bv. http, 10.10.5.9, POST) of /regex/', style: 'flex:1' });
    const cnt = el('span', { class: 'found-note' });
    ctrl.append(filter, cnt);
    wrap.append(ctrl);
    const table = el('div', { class: 'logview', style: 'max-height:260px;padding:0' });
    const detail = el('div', { class: 'lab-out', style: 'margin-top:10px;min-height:48px' });
    detail.textContent = 'Klik op een pakket om de inhoud te zien.';
    wrap.append(table, detail);

    function matches(p, f) {
      if (!f) return true;
      const hay = [p.no, p.time, p.src, p.dst, p.proto, p.len, p.info, p.stream || ''].join(' ').toLowerCase();
      if (f.startsWith('/') && f.lastIndexOf('/') > 0) { try { return new RegExp(f.slice(1, f.lastIndexOf('/')), 'i').test(hay); } catch (e) { return true; } }
      return hay.includes(f.toLowerCase());
    }
    function render() {
      const f = filter.value.trim();
      table.innerHTML = '';
      const head = el('div', { class: 'ln', style: 'position:sticky;top:0;background:#141c33;color:#9aa6c8;font-weight:700' });
      head.append(
        el('span', { style: 'flex:none;width:34px', text: '#' }),
        el('span', { style: 'flex:none;width:58px', text: 'tijd' }),
        el('span', { style: 'flex:none;width:112px', text: 'bron' }),
        el('span', { style: 'flex:none;width:112px', text: 'bestemming' }),
        el('span', { style: 'flex:none;width:52px', text: 'prot.' }),
        el('span', { style: 'flex:1;min-width:0', text: 'info' }),
      );
      table.append(head);
      let shown = 0;
      packets.forEach((p) => {
        if (!matches(p, f)) return;
        shown++;
        const row = el('div', { class: 'ln', style: 'cursor:pointer', onclick: () => showDetail(p) });
        row.append(
          el('span', { style: 'flex:none;width:34px;color:#7f8db5', text: String(p.no) }),
          el('span', { style: 'flex:none;width:58px;color:#7f8db5', text: String(p.time) }),
          el('span', { style: 'flex:none;width:112px', text: p.src }),
          el('span', { style: 'flex:none;width:112px', text: p.dst }),
          el('span', { style: 'flex:none;width:52px;color:#8ec7ab', text: p.proto }),
          el('span', { style: 'flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis', text: p.info }),
        );
        table.append(row);
      });
      cnt.textContent = shown + ' / ' + packets.length + ' pakketten';
    }
    function showDetail(p) {
      detail.innerHTML = '';
      detail.append(el('div', { html: '<strong>Pakket ' + p.no + '</strong> · ' + esc(p.src) + ' → ' + esc(p.dst) + ' · ' + esc(p.proto) + ' · ' + (p.len || '?') + ' bytes' }));
      detail.append(el('div', { style: 'margin-top:4px;color:var(--muted)', text: p.info }));
      if (p.stream) {
        detail.append(el('div', { style: 'margin-top:8px;font-size:.78rem;color:var(--faint)', text: '— Follow stream —' }));
        detail.append(el('pre', { style: 'white-space:pre-wrap;margin:4px 0 0', text: p.stream }));
      }
    }
    filter.addEventListener('input', render);
    render();
    container.append(shell('<b>Pakketanalyse</b> — ' + esc(cfg.title || 'capture.pcap'), wrap, false));
  });


  // =====================================================================
  //  JWT — JSON Web Tokens inspecteren
  // =====================================================================
  function b64urlDecode(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    try { return decodeURIComponent(escape(atob(s))); } catch (e) { return null; }
  }
  // s is a latin1/binary byte-string (bytes 0–255), zoals de HMAC-uitvoer; btoa codeert die rauw.
  // (NIET b64encode gebruiken: dat doet een UTF-8-omweg en verminkt losse bytes.)
  function b64urlEncode(s) {
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function hmacSha256(keyStr, msg) {
    // HMAC-SHA256 op exacte bytes via sha256bytes (geen UTF-8-omweg; die zou bytes >= 0x80 verminken).
    const toBytes = (str) => { const u = unescape(encodeURIComponent(str)); const a = []; for (let i = 0; i < u.length; i++) a.push(u.charCodeAt(i) & 0xff); return a; };
    const hexToBytes = (hex) => { const out = []; for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16)); return out; };
    let key = toBytes(keyStr);
    if (key.length > 64) key = hexToBytes(sha256bytes(key));
    while (key.length < 64) key.push(0);
    const ipad = key.map((b) => b ^ 0x36);
    const opad = key.map((b) => b ^ 0x5c);
    const inner = hexToBytes(sha256bytes(ipad.concat(toBytes(msg))));
    const mac = hexToBytes(sha256bytes(opad.concat(inner)));
    return mac.map((b) => String.fromCharCode(b)).join('');
  }
  function jwtSignHS256(secret, headerB64, payloadB64) {
    return b64urlEncode(hmacSha256(secret, headerB64 + '.' + payloadB64));
  }
  CS.registerLab('jwt', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Token (plak hier een JWT)' }));
    const input = el('textarea', { rows: '3', spellcheck: 'false' }); input.value = cfg.token || '';
    wrap.append(input);
    const out = el('div', {});
    wrap.append(out);
    wrap.append(el('label', { text: 'Handtekening controleren (HS256) — vul het vermoedelijke geheim in' }));
    const secRow = el('div', { class: 'ans-row' });
    const secInp = el('input', { type: 'text', placeholder: 'geheim…', style: 'flex:1' });
    const secBtn = el('button', { class: 'btn small primary', text: 'Controleer' });
    const secOut = el('div', { class: 'found-note' });
    secRow.append(secInp, secBtn);
    wrap.append(secRow, secOut);

    function human(ts) {
      const n = Number(ts); if (!isFinite(n)) return '';
      const d = new Date(n * 1000);
      if (isNaN(d.getTime())) return '';
      return ' → ' + d.toISOString().replace('.000', '') + ' (UTC)';
    }
    function render() {
      out.innerHTML = '';
      const parts = input.value.trim().split('.');
      if (parts.length < 2) { out.append(el('div', { class: 'callout warn', text: 'Dit lijkt geen JWT (verwacht header.payload.handtekening).' })); return; }
      const headJson = b64urlDecode(parts[0]);
      const payJson = b64urlDecode(parts[1]);
      let head = null, pay = null;
      try { head = JSON.parse(headJson); } catch (e) {}
      try { pay = JSON.parse(payJson); } catch (e) {}
      out.append(el('label', { text: 'Header' }));
      out.append(el('div', { class: 'lab-out', text: head ? JSON.stringify(head, null, 2) : (headJson || '[kon header niet decoderen]') }));
      out.append(el('label', { text: 'Payload (claims)' }));
      out.append(el('div', { class: 'lab-out', text: pay ? JSON.stringify(pay, null, 2) : (payJson || '[kon payload niet decoderen]') }));
      // claim-uitleg
      if (pay) {
        const notes = [];
        ['exp', 'iat', 'nbf', 'auth_time'].forEach((k) => { if (pay[k] != null) notes.push(k + ': ' + pay[k] + human(pay[k])); });
        if (pay.exp != null) { const expd = Number(pay.exp) * 1000; notes.push(Date.now() > expd ? '⏰ Dit token is VERLOPEN.' : '✓ Nog geldig (exp in de toekomst).'); }
        if (notes.length) out.append(el('div', { class: 'found-note', html: notes.map(esc).join('<br>') }));
      }
      // waarschuwingen
      const warns = [];
      if (head) {
        const alg = String(head.alg || '').toLowerCase();
        if (alg === 'none') warns.push('⚠️ alg = "none": dit token heeft geen handtekening. Een server die dit accepteert is ernstig kwetsbaar — de inhoud is dan niet te vertrouwen.');
        if (alg === 'hs256') warns.push('ℹ️ HS256 gebruikt één gedeeld geheim (symmetrisch). Is dat geheim zwak of gelekt, dan kan iedereen geldige tokens maken.');
      }
      if (pay && pay.exp == null) warns.push('⚠️ Geen exp-claim: dit token verloopt nooit. Dat vergroot de schade bij diefstal.');
      if (parts.length === 2 || !parts[2]) warns.push('⚠️ Geen handtekening aanwezig.');
      warns.forEach((w) => out.append(el('div', { class: 'callout ' + (w[0] === '⚠' ? 'warn' : 'info'), text: w })));
    }
    secBtn.addEventListener('click', () => {
      const parts = input.value.trim().split('.');
      if (parts.length < 3 || !parts[2]) { secOut.textContent = 'Geen handtekening om te controleren.'; secOut.style.color = 'var(--bad)'; return; }
      let head = null; try { head = JSON.parse(b64urlDecode(parts[0])); } catch (e) {}
      if (!head || String(head.alg).toLowerCase() !== 'hs256') { secOut.textContent = 'Controle werkt hier alleen voor alg=HS256.'; secOut.style.color = 'var(--warn)'; return; }
      const calc = jwtSignHS256(secInp.value, parts[0], parts[1]);
      const ok = calc === parts[2];
      secOut.textContent = ok ? '✓ Handtekening klopt met dit geheim — het token is authentiek en onveranderd.' : '✗ Handtekening klopt NIET met dit geheim.';
      secOut.style.color = ok ? 'var(--good)' : 'var(--bad)';
    });
    input.addEventListener('input', render);
    render();
    container.append(shell('<b>JWT-inspecteur</b> — lees en controleer een JSON Web Token', wrap, false));
  });

  // =====================================================================
  //  REGEX — reguliere expressies testen
  // =====================================================================
  CS.registerLab('regex', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Patroon' }));
    const pRow = el('div', { class: 'ans-row' });
    const pat = el('input', { type: 'text', placeholder: 'bv. Failed password for (\\w+)', style: 'flex:1' }); pat.value = cfg.pattern || '';
    const flags = el('input', { type: 'text', placeholder: 'flags', style: 'width:72px' }); flags.value = cfg.flags != null ? cfg.flags : 'gm';
    pRow.append(el('span', { style: 'font-family:var(--mono)', text: '/' }), pat, el('span', { style: 'font-family:var(--mono)', text: '/' }), flags);
    wrap.append(pRow);
    const cnt = el('div', { class: 'found-note' });
    wrap.append(cnt);
    wrap.append(el('label', { text: 'Tekst' }));
    const text = el('textarea', { rows: '8', spellcheck: 'false' }); text.value = cfg.text || '';
    wrap.append(text);
    wrap.append(el('label', { text: 'Resultaat (treffers gemarkeerd)' }));
    const view = el('div', { class: 'logview', style: 'white-space:pre-wrap' });
    wrap.append(view);
    const groupsBox = el('div', {});
    wrap.append(groupsBox);

    function run() {
      let flagStr = flags.value.replace(/[^gimsuy]/g, '');
      if (!flagStr.includes('g')) flagStr += 'g';
      let re;
      try { re = new RegExp(pat.value, flagStr); } catch (e) { cnt.textContent = 'Ongeldig patroon: ' + e.message; cnt.style.color = 'var(--bad)'; view.textContent = text.value; groupsBox.innerHTML = ''; return; }
      cnt.style.color = '';
      if (!pat.value) { cnt.textContent = ''; view.textContent = text.value; groupsBox.innerHTML = ''; return; }
      const src = text.value;
      let count = 0, last = 0, html = '', m;
      const groups = [];
      re.lastIndex = 0;
      while ((m = re.exec(src)) !== null) {
        count++;
        html += esc(src.slice(last, m.index)) + '<span class="hl">' + esc(m[0]) + '</span>';
        last = m.index + m[0].length;
        if (m.length > 1) groups.push(m.slice(1));
        if (m.index === re.lastIndex) re.lastIndex++;
        if (count > 5000) break;
      }
      html += esc(src.slice(last));
      view.innerHTML = html;
      cnt.textContent = count + ' treffer' + (count === 1 ? '' : 's');
      groupsBox.innerHTML = '';
      if (groups.length) {
        const ncol = Math.max.apply(null, groups.map((g) => g.length));
        const tbl = el('table', { style: 'width:100%;font-size:.82rem;margin-top:10px' });
        const head = el('tr', {}, [el('th', { text: '#' })].concat(Array.from({ length: ncol }, (_, i) => el('th', { text: 'groep ' + (i + 1) }))));
        tbl.append(el('thead', {}, head));
        const tb = el('tbody', {});
        groups.slice(0, 50).forEach((g, i) => { tb.append(el('tr', {}, [el('td', { text: String(i + 1) })].concat(Array.from({ length: ncol }, (_, j) => el('td', { text: g[j] == null ? '' : g[j] }))))); });
        tbl.append(tb);
        groupsBox.append(el('label', { text: 'Capture-groepen' }), tbl);
      }
    }
    [pat, flags, text].forEach((n) => n.addEventListener('input', run));
    wrap.append(el('details', { html: '<summary>📑 Regex-spiekbrief</summary>' +
      '<table style="width:100%;font-size:.82rem;margin-top:8px"><tbody>' +
      '<tr><td><code>.</code></td><td>elk teken (behalve nieuwe regel)</td></tr>' +
      '<tr><td><code>\\d \\w \\s</code></td><td>cijfer · woordteken · witruimte (hoofdletter = negatie)</td></tr>' +
      '<tr><td><code>[abc] [^abc] [a-z]</code></td><td>tekenklasse · negatie · bereik</td></tr>' +
      '<tr><td><code>* + ?</code></td><td>0+ · 1+ · 0 of 1 keer</td></tr>' +
      '<tr><td><code>{n} {n,} {n,m}</code></td><td>exact n · minstens n · n tot m keer</td></tr>' +
      '<tr><td><code>^ $</code></td><td>begin · einde (van regel met flag m)</td></tr>' +
      '<tr><td><code>( ) (?: ) |</code></td><td>groep · niet-vangende groep · of</td></tr>' +
      '<tr><td><code>\\b</code></td><td>woordgrens</td></tr>' +
      '<tr><td>flags</td><td><code>g</code> alle · <code>i</code> hoofdletterongevoelig · <code>m</code> meerregelig · <code>s</code> . matcht ook nieuwe regel</td></tr>' +
      '</tbody></table>' }));
    run();
    container.append(shell('<b>Regex-tester</b> — zoek patronen in tekst', wrap, false));
  });

  // =====================================================================
  //  CVSS — v3.1 basisscore
  // =====================================================================
  CS.registerLab('cvss', function (container, cfg) {
    const METRICS = [
      { k: 'AV', name: 'Attack Vector (aanvalsvector)', opts: [['N', 'Network'], ['A', 'Adjacent'], ['L', 'Local'], ['P', 'Physical']] },
      { k: 'AC', name: 'Attack Complexity (complexiteit)', opts: [['L', 'Low'], ['H', 'High']] },
      { k: 'PR', name: 'Privileges Required (rechten vooraf)', opts: [['N', 'None'], ['L', 'Low'], ['H', 'High']] },
      { k: 'UI', name: 'User Interaction (interactie nodig)', opts: [['N', 'None'], ['R', 'Required']] },
      { k: 'S', name: 'Scope (bereik)', opts: [['U', 'Unchanged'], ['C', 'Changed']] },
      { k: 'C', name: 'Confidentiality (vertrouwelijkheid)', opts: [['N', 'None'], ['L', 'Low'], ['H', 'High']] },
      { k: 'I', name: 'Integrity (integriteit)', opts: [['N', 'None'], ['L', 'Low'], ['H', 'High']] },
      { k: 'A', name: 'Availability (beschikbaarheid)', opts: [['N', 'None'], ['L', 'Low'], ['H', 'High']] },
    ];
    const W = {
      AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
      AC: { L: 0.77, H: 0.44 },
      PR: { N: 0.85, L: 0.62, H: 0.27 },      // Scope Unchanged
      PRc: { N: 0.85, L: 0.68, H: 0.5 },      // Scope Changed
      UI: { N: 0.85, R: 0.62 },
      C: { N: 0, L: 0.22, H: 0.56 },
      I: { N: 0, L: 0.22, H: 0.56 },
      A: { N: 0, L: 0.22, H: 0.56 },
    };
    const sel = { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' };
    function roundup(x) { const i = Math.round(x * 100000); return (i % 10000 === 0) ? i / 100000 : (Math.floor(i / 10000) + 1) / 10; }
    function score() {
      const iss = 1 - (1 - W.C[sel.C]) * (1 - W.I[sel.I]) * (1 - W.A[sel.A]);
      const impact = sel.S === 'U' ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
      const pr = sel.S === 'C' ? W.PRc[sel.PR] : W.PR[sel.PR];
      const expl = 8.22 * W.AV[sel.AV] * W.AC[sel.AC] * pr * W.UI[sel.UI];
      if (impact <= 0) return 0;
      const base = sel.S === 'U' ? Math.min(impact + expl, 10) : Math.min(1.08 * (impact + expl), 10);
      return roundup(base);
    }
    function severity(s) { return s === 0 ? 'None' : s < 4 ? 'Low' : s < 7 ? 'Medium' : s < 9 ? 'High' : 'Critical'; }
    const wrap = el('div', { class: 'lab-pad' });
    const grid = el('div', {});
    const vectorBox = el('div', { class: 'sqlquery' });
    const scoreBox = el('div', { style: 'font-size:1.6rem;font-weight:800;margin:4px 0' });
    const sevBox = el('div', { class: 'found-note' });
    METRICS.forEach((mt) => {
      const row = el('div', { style: 'margin:10px 0' });
      row.append(el('label', { text: mt.k + ' — ' + mt.name, style: 'margin:0 0 4px' }));
      const chips = el('div', { class: 'chip-row', style: 'margin:0' });
      mt.opts.forEach(([code, label]) => {
        const chip = el('span', { class: 'chip' + (sel[mt.k] === code ? ' on' : ''), text: code + ' · ' + label, onclick: () => { sel[mt.k] = code; refresh(); } });
        chip.setAttribute('data-k', mt.k); chip.setAttribute('data-c', code);
        chips.append(chip);
      });
      row.append(chips);
      grid.append(row);
    });
    const pasteRow = el('div', { class: 'ans-row', style: 'margin-top:8px' });
    const paste = el('input', { type: 'text', placeholder: 'CVSS:3.1/AV:N/AC:L/... plakken', style: 'flex:1' });
    const pasteBtn = el('button', { class: 'btn small', text: 'Laden' });
    pasteRow.append(paste, pasteBtn);
    pasteBtn.addEventListener('click', () => {
      const v = paste.value.toUpperCase();
      METRICS.forEach((mt) => { const m = new RegExp('(?:^|/)' + mt.k + ':([A-Z])').exec(v); if (m) { const code = m[1]; if (mt.opts.some((o) => o[0] === code)) sel[mt.k] = code; } });
      refresh();
    });
    function refresh() {
      $$chips();
      const s = score();
      const vec = 'CVSS:3.1/' + METRICS.map((mt) => mt.k + ':' + sel[mt.k]).join('/');
      vectorBox.textContent = vec;
      scoreBox.textContent = s.toFixed(1) + ' / 10';
      const sev = severity(s);
      scoreBox.style.color = sev === 'Critical' || sev === 'High' ? 'var(--bad)' : sev === 'Medium' ? 'var(--warn)' : 'var(--good)';
      sevBox.textContent = 'Ernst: ' + sev;
    }
    function $$chips() {
      Array.from(grid.querySelectorAll('.chip')).forEach((c) => {
        const k = c.getAttribute('data-k'), code = c.getAttribute('data-c');
        c.classList.toggle('on', sel[k] === code);
      });
    }
    if (cfg.vector) { paste.value = cfg.vector; pasteBtn.click(); }
    wrap.append(el('div', { style: 'display:flex;gap:16px;flex-wrap:wrap;align-items:center;margin-bottom:6px' }, [scoreBox, sevBox]));
    wrap.append(vectorBox, grid, pasteRow);
    refresh();
    container.append(shell('<b>CVSS v3.1-calculator</b> — bereken de basisscore', wrap, false));
  });

  // =====================================================================
  //  TIMESTAMP — tijdstempels omrekenen
  // =====================================================================
  CS.registerLab('timestamp', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Waarde (een getal, of een datum zoals 2026-10-01 08:12:03)' }));
    const inp = el('input', { type: 'text', placeholder: 'bv. 1696147923 of 133421...' }); inp.value = cfg.value || '';
    wrap.append(inp);
    const out = el('div', {});
    wrap.append(out);
    function fmt(d) {
      if (!d || isNaN(d.getTime())) return null;
      if (d.getUTCFullYear() < 1950 || d.getUTCFullYear() > 2200) return null;
      const iso = d.toISOString().replace('.000', '');
      let nl = '';
      try { nl = d.toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) { nl = ''; }
      return { iso: iso, nl: nl };
    }
    function row(name, d, extra) {
      const f = fmt(d);
      const r = el('div', { class: 'logview', style: 'max-height:none;padding:8px 10px;margin:6px 0' });
      r.append(el('div', { html: '<strong style="color:#8ec7ab">' + esc(name) + '</strong>' + (extra ? ' <span style="color:#7f8db5">' + esc(extra) + '</span>' : '') }));
      if (f) { r.append(el('div', { text: f.iso + '  (UTC)' })); if (f.nl) r.append(el('div', { style: 'color:#9aa6c8', text: f.nl + '  (NL)' })); }
      else r.append(el('div', { style: 'color:#7f8db5', text: '— geen plausibele datum —' }));
      return r;
    }
    const EPOCH_1601 = -11644473600000; // ms vanaf Unix-epoch tot 1601-01-01
    const EPOCH_2001 = 978307200000;    // ms vanaf Unix-epoch tot 2001-01-01
    function render() {
      out.innerHTML = '';
      const raw = inp.value.trim();
      if (!raw) return;
      // Is het een datum?
      if (/[-:a-zA-Z]/.test(raw) && !/^0x/i.test(raw)) {
        let d = new Date(raw.replace(' ', 'T'));
        if (isNaN(d.getTime())) d = new Date(raw);
        if (!isNaN(d.getTime())) {
          const ms = d.getTime();
          out.append(el('div', { class: 'callout info', text: 'Als datum gelezen. Hieronder de bijbehorende tijdstempelwaarden.' }));
          out.append(row('ISO 8601 (UTC)', d));
          out.append(el('div', { class: 'lab-out', html:
            'Unix-seconden: <strong>' + Math.floor(ms / 1000) + '</strong><br>' +
            'Unix-milliseconden: <strong>' + ms + '</strong><br>' +
            'Windows FILETIME: <strong>' + String((BigInt(ms) - BigInt(EPOCH_1601)) * 10000n) + '</strong><br>' +
            'Chrome/WebKit (µs): <strong>' + String((BigInt(ms) - BigInt(EPOCH_1601)) * 1000n) + '</strong><br>' +
            'Apple/Cocoa (s): <strong>' + Math.floor((ms - EPOCH_2001) / 1000) + '</strong>' }));
          return;
        }
      }
      // Getal
      let num;
      try { num = /^0x/i.test(raw) ? BigInt(raw) : BigInt(raw.replace(/[^0-9]/g, '') || '0'); } catch (e) { out.append(el('div', { class: 'callout warn', text: 'Kon dit niet als getal lezen.' })); return; }
      const n = Number(num);
      out.append(el('div', { class: 'found-note', text: 'Getal geïnterpreteerd als verschillende tijdstempelformaten. Alleen plausibele datums (1950–2200) worden getoond.' }));
      out.append(row('Unix-tijd (seconden)', new Date(n * 1000), String(num)));
      out.append(row('Unix-tijd (milliseconden)', new Date(n), String(num)));
      out.append(row('Windows FILETIME (100 ns sinds 1601)', new Date(Number(num / 10000n) + EPOCH_1601), String(num)));
      out.append(row('Chrome/WebKit (µs sinds 1601)', new Date(Number(num / 1000n) + EPOCH_1601), String(num)));
      out.append(row('Apple/Cocoa (s sinds 2001)', new Date(n * 1000 + EPOCH_2001), String(num)));
    }
    inp.addEventListener('input', render);
    render();
    container.append(shell('<b>Tijdstempel-omrekenaar</b> — forensische datums ontcijferen', wrap, false));
  });

  // =====================================================================
  //  IOC — indicatoren uit tekst halen
  // =====================================================================
  CS.registerLab('ioc', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Tekst / rapport (plak hier ruwe tekst met mogelijke indicatoren)' }));
    const ta = el('textarea', { rows: '8', spellcheck: 'false' }); ta.value = cfg.text || '';
    wrap.append(ta);
    const btns = el('div', { class: 'chip-row' });
    const defangBtn = el('span', { class: 'chip', text: '🛡️ Defang (veilig delen)' });
    const refangBtn = el('span', { class: 'chip', text: '↩️ Refang' });
    btns.append(defangBtn, refangBtn);
    wrap.append(btns);
    const out = el('div', {});
    wrap.append(out);
    const FILEEXT = /\.(exe|dll|ps1|bat|vbs|js|docm|docx|xlsm|xlsx|pdf|zip|rar|7z|txt|log|lnk|iso|img|msi|hta|jpg|jpeg|png|gif)$/i;
    function refang(s) {
      return s.replace(/\bhxxps\b/gi, 'https').replace(/\bhxxp\b/gi, 'http').replace(/\bfxp\b/gi, 'ftp')
        .replace(/\[\.\]|\(\.\)|\{\.\}|\[dot\]|\(dot\)|\s+dot\s+/gi, '.')
        .replace(/\[@\]|\(@\)|\[at\]|\(at\)|\s+at\s+/gi, '@')
        .replace(/\[:\]|\[:/g, ':').replace(/\[\/\]/g, '/');
    }
    function defang(s) {
      return s.replace(/https/gi, 'hxxps').replace(/http/gi, 'hxxp')
        .replace(/\./g, '[.]').replace(/@/g, '[@]').replace(/:\/\//g, '[://]');
    }
    function uniq(a) { const seen = {}, out = []; a.forEach((x) => { const k = x.toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(x); } }); return out; }
    function extract(text) {
      const t = refang(text);
      const ipv4 = uniq((t.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || []).filter((ip) => ip.split('.').every((o) => +o >= 0 && +o <= 255)));
      const urls = uniq((t.match(/\b(?:https?|ftp):\/\/[^\s"'<>]+/gi) || []).map((u) => u.replace(/[.,;:)\]]+$/, '')));
      const emails = uniq(t.match(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi) || []);
      const sha256 = uniq(t.match(/\b[a-f0-9]{64}\b/gi) || []);
      const sha1 = uniq((t.match(/\b[a-f0-9]{40}\b/gi) || []));
      const md5 = uniq((t.match(/\b[a-f0-9]{32}\b/gi) || []));
      const cves = uniq(t.match(/\bCVE-\d{4}-\d{4,}\b/gi) || []);
      // domeinen: alle hostnamen, incl. in URL's en e-mails; geen IP's of bestandsnamen
      const hostSet = {};
      const addHost = (h) => { if (!h) return; h = h.replace(/^www\./i, ''); if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(h)) return; if (FILEEXT.test(h)) return; if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h)) return; hostSet[h.toLowerCase()] = h; };
      (t.match(/\b(?:https?|ftp):\/\/([a-z0-9.-]+)/gi) || []).forEach((u) => addHost(u.replace(/^[a-z]+:\/\//i, '')));
      emails.forEach((e) => addHost(e.split('@')[1]));
      (t.match(/\b([a-z0-9-]+\.)+[a-z]{2,}\b/gi) || []).forEach(addHost);
      const domains = Object.values(hostSet);
      return { ipv4, domains, urls, emails, md5, sha1, sha256, cves };
    }
    function render() {
      out.innerHTML = '';
      const r = extract(ta.value);
      const groups = [
        ['IPv4-adressen', r.ipv4], ['Domeinen', r.domains], ['URL\'s', r.urls], ['E-mailadressen', r.emails],
        ['MD5-hashes', r.md5], ['SHA-1-hashes', r.sha1], ['SHA-256-hashes', r.sha256], ['CVE-nummers', r.cves],
      ];
      const summary = el('div', { class: 'chip-row' });
      groups.forEach(([name, arr]) => summary.append(el('span', { class: 'chip' + (arr.length ? ' on' : ''), text: name + ': ' + arr.length })));
      out.append(summary);
      groups.forEach(([name, arr]) => {
        if (!arr.length) return;
        out.append(el('label', { text: name + ' (' + arr.length + ')' }));
        out.append(el('div', { class: 'lab-out', text: arr.join('\n') }));
      });
    }
    defangBtn.addEventListener('click', () => { const r = extract(ta.value); const all = [].concat(r.ipv4, r.domains, r.urls, r.emails); out.insertBefore(el('div', { class: 'lab-out', style: 'margin-bottom:10px', text: all.map(defang).join('\n') || '(niets om te defangen)' }), out.firstChild); });
    refangBtn.addEventListener('click', () => { ta.value = refang(ta.value); render(); });
    ta.addEventListener('input', render);
    render();
    container.append(shell('<b>IOC-extractor</b> — haal indicatoren uit vrije tekst', wrap, false));
  });

  // =====================================================================
  //  URL — URL's ontleden (phishing-analyse)
  // =====================================================================
  CS.registerLab('url', function (container, cfg) {
    const SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'rb.gy', 'cutt.ly'];
    const BRANDS = ['nederbank', 'pakketpost', 'rijksbelastingen', 'microsoft', 'apple', 'google', 'ideal', 'postnl', 'marktplaats', 'belastingdienst', 'ing', 'rabobank', 'paypal'];
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Voeg een URL toe om te ontleden' }));
    const addRow = el('div', { class: 'ans-row' });
    const inp = el('input', { type: 'text', placeholder: 'https://…', style: 'flex:1' });
    const addBtn = el('button', { class: 'btn small primary', text: 'Ontleed' });
    addRow.append(inp, addBtn);
    wrap.append(addRow);
    const out = el('div', {});
    wrap.append(out);
    function parse(raw) {
      const flags = [];
      const info = { raw: raw };
      const m = /^([a-z][a-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/i.exec(raw.trim());
      if (!m) { info.error = 'Kon deze URL niet ontleden (ontbreekt het schema, bv. https://?).'; return info; }
      info.scheme = m[1].toLowerCase();
      let authority = m[2];
      info.path = m[3] || ''; info.query = (m[4] || '').replace(/^\?/, '');
      let userinfo = '';
      if (authority.indexOf('@') >= 0) { userinfo = authority.slice(0, authority.lastIndexOf('@')); authority = authority.slice(authority.lastIndexOf('@') + 1); flags.push('Bevat een "@" in de URL: alles vóór de @ is gebruikersinfo; de echte host staat erná (' + authority + '). Klassieke misleiding.'); }
      info.userinfo = userinfo;
      let host = authority, port = '';
      if (/:(\d+)$/.test(authority)) { port = authority.replace(/^.*:(\d+)$/, '$1'); host = authority.replace(/:(\d+)$/, ''); }
      info.host = host; info.port = port;
      const isIp = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
      info.isIp = isIp;
      const labels = host.split('.');
      if (!isIp && labels.length >= 2) { info.regDomain = labels.slice(-2).join('.'); info.subdomain = labels.slice(0, -2).join('.'); }
      else { info.regDomain = host; info.subdomain = ''; }
      if (info.scheme === 'http') flags.push('Gebruikt http in plaats van https: verkeer is niet versleuteld.');
      if (isIp) flags.push('De host is een rauw IP-adres in plaats van een domeinnaam — ongebruikelijk voor een echte dienst.');
      if (/xn--/i.test(host)) flags.push('Bevat punycode (xn--): kan een homoglief-domein zijn dat lijkt op een bekende merknaam.');
      if (!isIp && labels.length >= 4) flags.push('Veel subdomeinen (' + labels.length + ' labels): de echt geregistreerde naam is "' + info.regDomain + '", niet wat er vooraan staat.');
      BRANDS.forEach((b) => { if (info.subdomain && info.subdomain.toLowerCase().indexOf(b) >= 0) flags.push('Een bekende merknaam ("' + b + '") staat in het subdomein, maar het echte domein is "' + info.regDomain + '". Misleiding.'); });
      if (SHORTENERS.indexOf(info.regDomain.toLowerCase()) >= 0) flags.push('URL-verkorter (' + info.regDomain + '): de echte bestemming is verborgen.');
      if (port && port !== '80' && port !== '443') flags.push('Ongebruikelijke poort (' + port + ').');
      if (raw.length > 90) flags.push('Zeer lange URL (' + raw.length + ' tekens): kan bedoeld zijn om de echte host uit beeld te duwen.');
      info.flags = flags;
      return info;
    }
    function card(raw) {
      const info = parse(raw);
      const box = el('div', { class: 'task', style: 'margin:10px 0;padding:14px 16px' });
      box.append(el('div', { class: 'sqlquery', style: 'margin:0 0 8px', text: raw }));
      if (info.error) { box.append(el('div', { class: 'callout warn', text: info.error })); return box; }
      const rows = [
        ['Schema', info.scheme], ['Gebruikersinfo (@)', info.userinfo || '—'], ['Host', info.host],
        ['Subdomein', info.subdomain || '—'], ['Geregistreerd domein', info.regDomain], ['Poort', info.port || '(standaard)'],
        ['Pad', info.path || '/'], ['Query', info.query || '—'],
      ];
      const tbl = el('table', { style: 'width:100%;font-size:.84rem' }, el('tbody', {}, rows.map(([k, v]) => el('tr', {}, [el('td', { style: 'color:var(--muted);width:38%', text: k }), el('td', { style: 'font-family:var(--mono);word-break:break-all', text: v })]))));
      box.append(tbl);
      if (info.flags.length) { const ul = el('ul', { style: 'margin:8px 0 0;padding-left:18px' }); info.flags.forEach((f) => ul.append(el('li', { style: 'color:var(--bad);font-size:.84rem', text: f }))); box.append(el('div', { style: 'margin-top:8px;font-weight:600;color:var(--bad)', text: '🚩 Rode vlaggen (' + info.flags.length + ')' }), ul); }
      else box.append(el('div', { class: 'found-note', style: 'color:var(--good)', text: '✓ Geen duidelijke rode vlaggen gevonden.' }));
      return box;
    }
    function add(raw) { if (!raw.trim()) return; out.insertBefore(card(raw.trim()), out.firstChild); }
    addBtn.addEventListener('click', () => { add(inp.value); inp.value = ''; });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { add(inp.value); inp.value = ''; } });
    (cfg.urls || []).forEach((u) => out.append(card(u)));
    container.append(shell('<b>URL-ontleder</b> — kijk achter de schermen van een link', wrap, false));
  });

  // =====================================================================
  //  YARA — regels schrijven en testen (subset)
  // =====================================================================
  CS.registerLab('yara', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'YARA-regel(s)' }));
    const ta = el('textarea', { rows: '12', spellcheck: 'false', style: 'font-size:.82rem' }); ta.value = cfg.rule || '';
    wrap.append(ta);
    const runBtn = el('button', { class: 'btn primary', text: '▶ Scan bestanden', style: 'margin-top:10px' });
    wrap.append(runBtn);
    const out = el('div', { style: 'margin-top:12px' });
    wrap.append(out);

    function fileBytes(f) {
      if (f.hex != null) return f.hex.trim().split(/\s+/).filter(Boolean).map((h) => parseInt(h, 16) & 0xff);
      const u = unescape(encodeURIComponent(f.text || ''));
      const a = []; for (let i = 0; i < u.length; i++) a.push(u.charCodeAt(i) & 0xff);
      return a;
    }
    function latin1(bytes) { return bytes.map((b) => String.fromCharCode(b)).join(''); }
    function toWide(str) { let o = ''; for (let i = 0; i < str.length; i++) { o += str[i] + '\u0000'; } return o; }
    function parseRules(src) {
      const rules = [];
      const re = /rule\s+([A-Za-z_]\w*)\s*(?::\s*[\w\s]+?)?\{/g;
      let m;
      while ((m = re.exec(src)) !== null) {
        // vind bijpassend sluitend accolade
        let depth = 1, i = re.lastIndex;
        for (; i < src.length && depth; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; }
        const body = src.slice(re.lastIndex, i - 1);
        rules.push({ name: m[1], body: body });
        re.lastIndex = i;
      }
      return rules;
    }
    function parseStrings(body) {
      const section = /strings\s*:([\s\S]*?)(?:condition\s*:|$)/i.exec(body);
      const list = [];
      if (!section) return list;
      const lineRe = /\$([A-Za-z0-9_]*)\s*=\s*(.+)$/gm;
      let m;
      while ((m = lineRe.exec(section[1])) !== null) {
        const id = m[1]; let val = m[2].trim();
        const mods = [];
        // modifiers achteraan
        val = val.replace(/\s+(nocase|wide|ascii|fullword)\b/g, (x, mod) => { mods.push(mod); return ''; }).trim();
        let kind, data;
        if (/^"/.test(val)) { kind = 'text'; data = val.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\x([0-9a-f]{2})/gi, (x, h) => String.fromCharCode(parseInt(h, 16))); }
        else if (/^\{/.test(val)) { kind = 'hex'; data = val.replace(/^\{|\}$/g, '').trim().split(/\s+/).map((t) => t === '??' ? null : parseInt(t, 16)); }
        else if (/^\//.test(val)) { const rm = /^\/(.*)\/([a-z]*)$/.exec(val); kind = 'regex'; data = rm ? new RegExp(rm[1], (rm[2].includes('i') ? 'i' : '') + (rm[2].includes('s') ? 's' : '') + 'g') : null; }
        list.push({ id: id, kind: kind, data: data, mods: mods });
      }
      return list;
    }
    function countMatches(str, bytes, s) {
      if (s.kind === 'text') {
        let needles = [s.data];
        if (s.mods.includes('wide') && !s.mods.includes('ascii')) needles = [toWide(s.data)];
        else if (s.mods.includes('wide')) needles = [s.data, toWide(s.data)];
        let total = 0; const positions = [];
        needles.forEach((needle) => {
          const hay = s.mods.includes('nocase') ? str.toLowerCase() : str;
          const nd = s.mods.includes('nocase') ? needle.toLowerCase() : needle;
          let idx = 0;
          while ((idx = hay.indexOf(nd, idx)) >= 0) {
            if (s.mods.includes('fullword')) {
              const before = str[idx - 1], after = str[idx + needle.length];
              const w = (c) => c && /[A-Za-z0-9_]/.test(c);
              if (w(before) || w(after)) { idx += 1; continue; }
            }
            positions.push(idx); total++; idx += needle.length || 1;
          }
        });
        return { count: total, positions: positions };
      }
      if (s.kind === 'hex') {
        const pat = s.data; const positions = [];
        for (let i = 0; i + pat.length <= bytes.length; i++) {
          let ok = true;
          for (let j = 0; j < pat.length; j++) { if (pat[j] !== null && bytes[i + j] !== pat[j]) { ok = false; break; } }
          if (ok) positions.push(i);
        }
        return { count: positions.length, positions: positions };
      }
      if (s.kind === 'regex' && s.data) {
        const positions = []; let m; s.data.lastIndex = 0; let guard = 0;
        while ((m = s.data.exec(str)) !== null) { positions.push(m.index); if (m.index === s.data.lastIndex) s.data.lastIndex++; if (++guard > 10000) break; }
        return { count: positions.length, positions: positions };
      }
      return { count: 0, positions: [] };
    }
    function evalCondition(cond, ctx) {
      // vervang constructies door JS. ctx: match[id]={count,positions}, strs=[ids], filesize, uint
      cond = cond.replace(/\bfilesize\b/g, '(' + ctx.filesize + ')');
      cond = cond.replace(/(\d+)\s*(KB|MB)/gi, (x, n, u) => String(+n * (u.toUpperCase() === 'MB' ? 1048576 : 1024)));
      cond = cond.replace(/uint8\s*\(\s*(\d+)\s*\)/gi, (x, o) => String(ctx.u8(+o)));
      cond = cond.replace(/uint16\s*\(\s*(\d+)\s*\)/gi, (x, o) => String(ctx.u16(+o)));
      cond = cond.replace(/uint32\s*\(\s*(\d+)\s*\)/gi, (x, o) => String(ctx.u32(+o)));
      // "N of them" / "any of them" / "all of them"
      const allIds = ctx.strs.slice();
      function ofExpr(quant, ids) {
        const hits = ids.filter((id) => ctx.match[id] && ctx.match[id].count > 0).length;
        if (/^any$/i.test(quant)) return hits >= 1;
        if (/^all$/i.test(quant)) return hits === ids.length && ids.length > 0;
        const n = parseInt(quant, 10); return hits >= n;
      }
      function expandGroup(g) {
        // ($a,$b) of ($s*)
        return g.split(',').map((x) => x.trim()).flatMap((tok) => {
          const mm = /^\$([A-Za-z0-9_]*)\*$/.exec(tok);
          if (mm) return allIds.filter((id) => id.indexOf(mm[1]) === 0);
          const one = /^\$([A-Za-z0-9_]+)$/.exec(tok); return one ? [one[1]] : [];
        });
      }
      cond = cond.replace(/\b(any|all|\d+)\s+of\s+them\b/gi, (x, q) => '(' + ofExpr(q, allIds) + ')');
      cond = cond.replace(/\b(any|all|\d+)\s+of\s*\(([^)]*)\)/gi, (x, q, g) => '(' + ofExpr(q, expandGroup(g)) + ')');
      // $a at 0
      cond = cond.replace(/\$([A-Za-z0-9_]+)\s+at\s+(\d+)/gi, (x, id, off) => '(' + ((ctx.match[id] && ctx.match[id].positions.indexOf(+off) >= 0)) + ')');
      // $a in (lo..hi)
      cond = cond.replace(/\$([A-Za-z0-9_]+)\s+in\s*\(\s*(\d+)\s*\.\.\s*(\d+|filesize|\d+)\s*\)/gi, (x, id, lo, hi) => { const h = /^\d+$/.test(hi) ? +hi : ctx.filesize; const ps = ctx.match[id] ? ctx.match[id].positions : []; return '(' + ps.some((p) => p >= +lo && p <= h) + ')'; });
      // #a (count), $a (presence)
      cond = cond.replace(/#([A-Za-z0-9_]+)/g, (x, id) => '(' + (ctx.match[id] ? ctx.match[id].count : 0) + ')');
      cond = cond.replace(/\$([A-Za-z0-9_]+)/g, (x, id) => '(' + ((ctx.match[id] && ctx.match[id].count > 0)) + ')');
      // operatoren
      cond = cond.replace(/\band\b/gi, '&&').replace(/\bor\b/gi, '||').replace(/\bnot\b/gi, '!').replace(/\btrue\b/gi, 'true').replace(/\bfalse\b/gi, 'false');
      cond = cond.replace(/0x[0-9a-f]+/gi, (h) => String(parseInt(h, 16)));
      // alleen veilige tekens
      if (/[^0-9\s()!&|<>=+\-*/.truefals]/i.test(cond.replace(/true|false/gi, ''))) { /* laat door, maar */ }
      try { return !!Function('"use strict";return (' + cond + ');')(); } catch (e) { return 'ERR'; }
    }
    runBtn.addEventListener('click', () => {
      out.innerHTML = '';
      const rules = parseRules(ta.value);
      if (!rules.length) { out.append(el('div', { class: 'callout warn', text: 'Geen geldige rule { } gevonden.' })); return; }
      const parsed = rules.map((r) => ({ name: r.name, strings: parseStrings(r.body), cond: ((/condition\s*:([\s\S]*)$/i.exec(r.body) || [])[1] || '').trim() }));
      (cfg.files || []).forEach((f) => {
        const bytes = fileBytes(f);
        const str = latin1(bytes);
        const fileBox = el('div', { class: 'task', style: 'margin:8px 0;padding:12px 14px' });
        fileBox.append(el('div', { html: '<strong>' + esc(f.name || 'bestand') + '</strong> <span style="color:var(--muted)">(' + bytes.length + ' bytes)</span>' }));
        const ctx = { strs: [], match: {}, filesize: bytes.length, u8: (o) => bytes[o] || 0, u16: (o) => (bytes[o] || 0) | ((bytes[o + 1] || 0) << 8), u32: (o) => ((bytes[o] || 0) | ((bytes[o + 1] || 0) << 8) | ((bytes[o + 2] || 0) << 16) | ((bytes[o + 3] || 0) << 24)) >>> 0 };
        parsed.forEach((r) => {
          const myCtx = Object.assign({}, ctx, { strs: r.strings.map((s) => s.id), match: {} });
          r.strings.forEach((s) => { myCtx.match[s.id] = countMatches(str, bytes, s); });
          const res = r.cond ? evalCondition(r.cond, myCtx) : false;
          const hitStrs = r.strings.filter((s) => myCtx.match[s.id].count > 0);
          const line = el('div', { style: 'margin-top:6px' });
          line.append(el('span', { style: 'font-weight:700;color:' + (res === true ? 'var(--good)' : res === 'ERR' ? 'var(--warn)' : 'var(--muted)'), text: (res === true ? '✓ RAAK' : res === 'ERR' ? '⚠ fout in condition' : '· geen match') + '  — regel ' + r.name }));
          if (hitStrs.length) line.append(el('div', { class: 'found-note', text: 'strings gevonden: ' + hitStrs.map((s) => '$' + s.id + ' (' + myCtx.match[s.id].count + '×)').join(', ') }));
          fileBox.append(line);
        });
        out.append(fileBox);
      });
    });
    runBtn.click();
    container.append(shell('<b>YARA-lab</b> — schrijf een regel en scan de bestanden', wrap, false));
  });

  // =====================================================================
  //  TIMELINE — super-timeline van een onderzoek
  // =====================================================================
  CS.registerLab('timeline', function (container, cfg) {
    const events = (cfg.events || []).slice().sort((a, b) => String(a.t).localeCompare(String(b.t)));
    const marks = {};
    const sources = Array.from(new Set(events.map((e) => e.src))).filter(Boolean);
    const wrap = el('div', { class: 'lab-pad' });
    const ctrl = el('div', { class: 'ans-row' });
    const filter = el('input', { type: 'text', placeholder: 'filter… (tekst of /regex/)', style: 'flex:1' });
    const cnt = el('span', { class: 'found-note' });
    ctrl.append(filter, cnt);
    wrap.append(ctrl);
    const srcRow = el('div', { class: 'chip-row' });
    const activeSrc = {};
    sources.forEach((s) => { activeSrc[s] = true; });
    sources.forEach((s) => { const chip = el('span', { class: 'chip on', text: s, onclick: () => { activeSrc[s] = !activeSrc[s]; chip.classList.toggle('on', activeSrc[s]); render(); } }); srcRow.append(chip); });
    wrap.append(srcRow);
    const rangeRow = el('div', { class: 'ans-row', style: 'margin-top:6px' });
    const from = el('input', { type: 'text', placeholder: 'van (JJJJ-MM-DD UU:MM:SS)', style: 'flex:1' });
    const to = el('input', { type: 'text', placeholder: 'tot', style: 'flex:1' });
    rangeRow.append(from, to);
    wrap.append(rangeRow);
    const view = el('div', { class: 'logview', style: 'max-height:380px' });
    wrap.append(view);
    function parseT(s) { const d = new Date(String(s).replace(' ', 'T') + 'Z'); return isNaN(d.getTime()) ? null : d.getTime(); }
    function matchesFilter(e, f) {
      if (!f) return true;
      const hay = [e.t, e.src, e.host, e.user, e.desc].filter(Boolean).join(' ').toLowerCase();
      if (f.startsWith('/') && f.lastIndexOf('/') > 0) { try { return new RegExp(f.slice(1, f.lastIndexOf('/')), 'i').test(hay); } catch (x) { return true; } }
      return hay.includes(f.toLowerCase());
    }
    function render() {
      view.innerHTML = '';
      const f = filter.value.trim();
      const lo = parseT(from.value.trim()), hi = parseT(to.value.trim());
      let shown = 0, prev = null;
      events.forEach((e, i) => {
        if (!activeSrc[e.src]) return;
        if (!matchesFilter(e, f)) return;
        const tms = parseT(e.t);
        if (lo != null && tms != null && tms < lo) return;
        if (hi != null && tms != null && tms > hi) return;
        shown++;
        let delta = '';
        if (prev != null && tms != null) { const d = Math.round((tms - prev) / 1000); if (d >= 0) { delta = d < 60 ? ('+' + d + 's') : d < 3600 ? ('+' + Math.floor(d / 60) + 'm' + (d % 60 ? (d % 60) + 's' : '')) : ('+' + Math.floor(d / 3600) + 'u' + (Math.floor((d % 3600) / 60)) + 'm'); } }
        prev = tms != null ? tms : prev;
        const row = el('div', { class: 'ln', style: 'cursor:pointer;align-items:baseline' });
        const star = el('span', { style: 'flex:none;width:18px;color:' + (marks[i] ? 'var(--warn)' : '#566288'), text: marks[i] ? '⭐' : '☆', onclick: (ev) => { ev.stopPropagation(); marks[i] = !marks[i]; render(); } });
        row.append(star,
          el('span', { style: 'flex:none;width:150px;color:#8ec7ab', text: e.t }),
          el('span', { style: 'flex:none;width:60px;color:#7f8db5', text: delta }),
          el('span', { style: 'flex:none;width:92px;color:#c9a6ff', text: e.src || '' }),
          el('span', { style: 'flex:1;min-width:0', html: (e.host ? '<span style="color:#7f8db5">' + esc(e.host) + (e.user ? '\\' + esc(e.user) : '') + '</span> ' : '') + esc(e.desc || '') }));
        view.append(row);
      });
      cnt.textContent = shown + ' / ' + events.length + ' gebeurtenissen';
    }
    [filter, from, to].forEach((n) => n.addEventListener('input', render));
    render();
    container.append(shell('<b>Super-timeline</b> — ' + esc(cfg.title || 'onderzoek'), wrap, false));
  });

  // =====================================================================
  //  CHMOD — Linux-rechten omrekenen
  // =====================================================================
  CS.registerLab('chmod', function (container, cfg) {
    const classes = ['Eigenaar (u)', 'Groep (g)', 'Anderen (o)'];
    const perms = ['lezen (r=4)', 'schrijven (w=2)', 'uitvoeren (x=1)'];
    const special = ['setuid (4)', 'setgid (2)', 'sticky (1)'];
    const state = [[false, false, false], [false, false, false], [false, false, false]];
    const spec = [false, false, false];
    const wrap = el('div', { class: 'lab-pad' });
    const octBox = el('div', { style: 'font-family:var(--mono);font-size:1.6rem;font-weight:800;margin:2px 0' });
    const symBox = el('div', { class: 'sqlquery', style: 'margin:6px 0' });
    const grid = el('div', { class: 'lab-grid2' });
    function build() {
      grid.innerHTML = '';
      classes.forEach((c, ci) => {
        const col = el('div', { style: 'background:var(--bg-2);border:1px solid var(--border);border-radius:8px;padding:10px' });
        col.append(el('div', { style: 'font-weight:700;margin-bottom:6px', text: c }));
        perms.forEach((p, pi) => {
          const lab = el('label', { class: 'switch', style: 'display:flex;margin:4px 0' });
          const cb = el('input', { type: 'checkbox' }); cb.checked = state[ci][pi];
          cb.addEventListener('change', () => { state[ci][pi] = cb.checked; refresh(); });
          lab.append(cb, el('span', { class: 'track' }), el('span', { text: ' ' + p }));
          col.append(lab);
        });
        grid.append(col);
      });
    }
    const specRow = el('div', { class: 'chip-row' });
    special.forEach((s, si) => { const chip = el('span', { class: 'chip', text: s, onclick: () => { spec[si] = !spec[si]; chip.classList.toggle('on', spec[si]); refresh(); } }); specRow.append(chip); });
    function refresh() {
      const digits = state.map((cl) => (cl[0] ? 4 : 0) + (cl[1] ? 2 : 0) + (cl[2] ? 1 : 0));
      const specDigit = (spec[0] ? 4 : 0) + (spec[1] ? 2 : 0) + (spec[2] ? 1 : 0);
      octBox.textContent = (specDigit ? specDigit : '') + digits.join('');
      let sym = '';
      state.forEach((cl, ci) => { sym += (cl[0] ? 'r' : '-'); sym += (cl[1] ? 'w' : '-'); let x = cl[2]; if (ci === 0 && spec[0]) sym += x ? 's' : 'S'; else if (ci === 1 && spec[1]) sym += x ? 's' : 'S'; else if (ci === 2 && spec[2]) sym += x ? 't' : 'T'; else sym += x ? 'x' : '-'; });
      symBox.textContent = '-' + sym + '   (chmod ' + (specDigit ? specDigit : '') + digits.join('') + ')';
    }
    function loadOctal(str) {
      const m = /(\d)?(\d)(\d)(\d)$/.exec(str.trim());
      if (!m) return;
      const sp = m[1] ? +m[1] : 0; spec[0] = !!(sp & 4); spec[1] = !!(sp & 2); spec[2] = !!(sp & 1);
      [m[2], m[3], m[4]].forEach((d, ci) => { const n = +d; state[ci][0] = !!(n & 4); state[ci][1] = !!(n & 2); state[ci][2] = !!(n & 1); });
      Array.from(specRow.children).forEach((chip, si) => chip.classList.toggle('on', spec[si]));
      build(); refresh();
    }
    const loadRow = el('div', { class: 'ans-row', style: 'margin-top:8px' });
    const oin = el('input', { type: 'text', placeholder: 'octaal laden, bv. 755 of 4755', style: 'flex:1' });
    loadRow.append(oin, el('button', { class: 'btn small', text: 'Laden', onclick: () => loadOctal(oin.value) }));
    wrap.append(el('div', { style: 'display:flex;gap:16px;align-items:center;flex-wrap:wrap' }, [octBox, symBox]), grid, el('label', { text: 'Speciale bits' }), specRow, loadRow);
    build();
    if (cfg.mode) loadOctal(String(cfg.mode)); else refresh();
    container.append(shell('<b>chmod-calculator</b> — rechten ↔ octaal ↔ rwx', wrap, false));
  });

  // =====================================================================
  //  NUMCONV — getallen omzetten
  // =====================================================================
  CS.registerLab('numconv', function (container, cfg) {
    const wrap = el('div', { class: 'lab-pad' });
    wrap.append(el('label', { text: 'Waarde (bv. 77, 0x4D, 0b1001101, of tekst met aanhalingstekens "MZ")' }));
    const inp = el('input', { type: 'text', placeholder: '0x4D5A' }); inp.value = cfg.value || '';
    wrap.append(inp);
    const out = el('div', {});
    wrap.append(out);
    function render() {
      out.innerHTML = '';
      let raw = inp.value.trim();
      if (!raw) return;
      let n = null;
      if (/^"[^"]*"$/.test(raw) || /^'[^']*'$/.test(raw)) {
        const s = raw.slice(1, -1);
        const codes = Array.from(s).map((c) => c.charCodeAt(0));
        out.append(el('div', { class: 'lab-out', html: 'ASCII-codes: <strong>' + codes.join(' ') + '</strong><br>hex: <strong>' + codes.map((c) => c.toString(16).padStart(2, '0')).join(' ') + '</strong>' }));
        return;
      }
      try {
        if (/^0x[0-9a-f]+$/i.test(raw)) n = BigInt(raw);
        else if (/^0b[01]+$/i.test(raw)) n = BigInt(parseInt(raw.slice(2), 2));
        else if (/^0o[0-7]+$/i.test(raw)) n = BigInt(parseInt(raw.slice(2), 8));
        else if (/^-?\d+$/.test(raw)) n = BigInt(raw);
        else { out.append(el('div', { class: 'callout warn', text: 'Kon dit niet als getal lezen.' })); return; }
      } catch (e) { out.append(el('div', { class: 'callout warn', text: 'Ongeldig getal.' })); return; }
      const num = n;
      const asciiOf = (v) => { const bytes = []; let x = v < 0n ? -v : v; if (x === 0n) bytes.push(0); while (x > 0n) { bytes.unshift(Number(x & 0xffn)); x >>= 8n; } return bytes.map((b) => (b >= 0x20 && b <= 0x7e) ? String.fromCharCode(b) : '·').join(''); };
      out.append(el('div', { class: 'lab-out', html:
        'Decimaal: <strong>' + num.toString(10) + '</strong><br>' +
        'Hexadecimaal: <strong>0x' + (num < 0n ? '-' : '') + (num < 0n ? (-num).toString(16) : num.toString(16)).toUpperCase() + '</strong><br>' +
        'Binair: <strong>0b' + (num < 0n ? '-' : '') + (num < 0n ? (-num).toString(2) : num.toString(2)) + '</strong><br>' +
        'Octaal: <strong>0o' + (num < 0n ? '-' : '') + (num < 0n ? (-num).toString(8) : num.toString(8)) + '</strong><br>' +
        'Als ASCII-bytes: <strong>' + esc(asciiOf(num)) + '</strong>' }));
    }
    inp.addEventListener('input', render);
    render();
    container.append(shell('<b>Getallen-omzetter</b> — decimaal · hex · binair · octaal · ASCII', wrap, false));
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

  // ---- MD4 (voor NTLM-demonstratie) -------------------------------------
  function md4(str) {
    function rl(x, c) { return (x << c) | (x >>> (32 - c)); }
    function add(a, b) { return (a + b) & 0xffffffff; }
    const u = unescape(encodeURIComponent(str)); const bytes = [];
    for (let i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i) & 0xff);
    return md4FromBytes(bytes);
  }
  function md4FromBytes(bytes) {
    const add = (a, b) => (a + b) & 0xffffffff;
    const rol = (x, s) => ((x << s) | (x >>> (32 - s))) & 0xffffffff;
    const F = (x, y, z) => (x & y) | (~x & z);
    const G = (x, y, z) => (x & y) | (x & z) | (y & z);
    const H = (x, y, z) => x ^ y ^ z;
    const msg = bytes.slice(); const bitLen = msg.length * 8;
    msg.push(0x80); while (msg.length % 64 !== 56) msg.push(0);
    for (let i = 0; i < 8; i++) msg.push((Math.floor(bitLen / Math.pow(2, 8 * i))) & 0xff);
    let A = 0x67452301, B = 0xefcdab89, C = 0x98badcfe, D = 0x10325476;
    for (let off = 0; off < msg.length; off += 64) {
      const X = [];
      for (let i = 0; i < 16; i++) X[i] = (msg[off + i * 4] | (msg[off + i * 4 + 1] << 8) | (msg[off + i * 4 + 2] << 16) | (msg[off + i * 4 + 3] << 24)) >>> 0;
      let a = A, b = B, c = C, d = D;
      const ff = (a, b, c, d, k, s) => rol(add(add(a, F(b, c, d)), X[k]), s);
      const gg = (a, b, c, d, k, s) => rol(add(add(add(a, G(b, c, d)), X[k]), 0x5a827999), s);
      const hh = (a, b, c, d, k, s) => rol(add(add(add(a, H(b, c, d)), X[k]), 0x6ed9eba1), s);
      // Ronde 1 (k = 0..15, shifts 3,7,11,19)
      for (let k = 0; k < 16; k += 4) { a = ff(a, b, c, d, k, 3); d = ff(d, a, b, c, k + 1, 7); c = ff(c, d, a, b, k + 2, 11); b = ff(b, c, d, a, k + 3, 19); }
      // Ronde 2 (k = 0,4,8,12,1,..., shifts 3,5,9,13)
      for (let j = 0; j < 4; j++) { a = gg(a, b, c, d, j, 3); d = gg(d, a, b, c, j + 4, 5); c = gg(c, d, a, b, j + 8, 9); b = gg(b, c, d, a, j + 12, 13); }
      // Ronde 3 (k = 0,8,4,12,2,..., shifts 3,9,11,15)
      const r3 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
      for (let i = 0; i < 16; i += 4) { a = hh(a, b, c, d, r3[i], 3); d = hh(d, a, b, c, r3[i + 1], 9); c = hh(c, d, a, b, r3[i + 2], 11); b = hh(b, c, d, a, r3[i + 3], 15); }
      A = add(A, a); B = add(B, b); C = add(C, c); D = add(D, d);
    }
    const le = (n) => { let s = ''; for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0'); return s; };
    return le(A) + le(B) + le(C) + le(D);
  }
  // NTLM = MD4(UTF-16LE(wachtwoord))
  function ntlm(str) { const bytes = []; for (let i = 0; i < str.length; i++) { const code = str.charCodeAt(i); bytes.push(code & 0xff, (code >>> 8) & 0xff); } return md4FromBytes(bytes); }

  // Expose encoders globally voor content indien nodig
  CS.enc = { b64encode, b64decode, toHex, fromHex, caesar, xorStr, md5, sha1, sha256, md4, ntlm };

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
    const u = unescape(encodeURIComponent(ascii)); const bytes = []; for (let i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i) & 0xff);
    return sha256bytes(bytes);
  }
  // SHA-256 over een rauwe byte-array (0–255). Gebruikt door HMAC, dat exacte bytes moet
  // hashen zonder de UTF-8-omweg van sha256(tekst) die bytes >= 0x80 zou verminken.
  function sha256bytes(input) {
    function rr(n, x) { return (n >>> x) | (n << (32 - x)); }
    const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    let h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const bytes = input.slice();
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

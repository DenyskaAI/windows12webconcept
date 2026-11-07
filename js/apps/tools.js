/* Apps: Calculator, Settings, Terminal */
(function () {
  'use strict';
  const W12 = window.W12; const { el, t, fs, glyph } = W12;

  /* ---------------- Calculator ---------------- */
  W12.registerApp({
    id: 'calculator', icon: 'calculator', w: 340, h: 520, minW: 300, minH: 460, keys: 'калькулятор calculator calc',
    name: () => t('Калькулятор', 'Calculator'),
    create(win) {
      let cur = '0', prev = null, op = null, fresh = true, expr = '';
      const fmt = (n) => (Number.isFinite(n) ? String(+n.toPrecision(12)) : t('Ошибка', 'Error'));
      const disp = el('div', { class: 'calc-main' }, '0'); const ex = el('div', { class: 'calc-expr' });
      const upd = () => { disp.textContent = cur; ex.textContent = expr; disp.style.fontSize = cur.length > 11 ? '28px' : '44px'; };
      const calc = (a, b, o) => (o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : b === 0 ? NaN : a / b);
      const press = (k) => {
        if (cur === t('Ошибка', 'Error') && k !== 'C') cur = '0', fresh = true;
        if (/^\d$/.test(k)) { cur = fresh || cur === '0' ? k : cur.length < 16 ? cur + k : cur; fresh = false; }
        else if (k === '.') { if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; }
        else if (['+', '−', '×', '÷'].includes(k)) { if (op && !fresh) { prev = calc(prev, +cur, op); cur = fmt(prev); } else prev = +cur; op = k; fresh = true; expr = fmt(prev) + ' ' + k; }
        else if (k === '=') { if (op) { const b = +cur; const r = calc(prev, b, op); expr = fmt(prev) + ' ' + op + ' ' + fmt(b) + ' ='; cur = fmt(r); op = null; prev = null; fresh = true; } }
        else if (k === 'C') { cur = '0'; prev = null; op = null; fresh = true; expr = ''; }
        else if (k === 'CE') { cur = '0'; fresh = true; }
        else if (k === '⌫') { if (!fresh) cur = cur.length > 1 ? cur.slice(0, -1) : '0'; }
        else if (k === '±') cur = fmt(-cur);
        else if (k === '%') cur = fmt(prev != null ? (prev * +cur) / 100 : +cur / 100);
        else if (k === 'x²') { expr = 'sqr(' + cur + ')'; cur = fmt(cur * cur); fresh = true; }
        else if (k === '√x') { expr = '√(' + cur + ')'; cur = fmt(Math.sqrt(+cur)); fresh = true; }
        else if (k === '1/x') { expr = '1/(' + cur + ')'; cur = +cur === 0 ? t('Ошибка', 'Error') : fmt(1 / cur); fresh = true; }
        upd();
      };
      const keys = ['%', 'CE', 'C', '⌫', '1/x', 'x²', '√x', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '±', '0', '.', '='];
      const grid = el('div', { class: 'calc-grid' }, keys.map((k) => el('button', { class: 'ck' + (/\d/.test(k) ? ' num' : k === '=' ? ' eq' : ''), onclick: () => { press(k); win.body.focus(); } }, k)));
      win.body.addEventListener('keydown', (e) => {
        const m = { '*': '×', '/': '÷', '-': '−', Enter: '=', Backspace: '⌫', Escape: 'C', Delete: 'CE' }; const k = m[e.key] || e.key;
        if (keys.includes(k) || k === '+') { e.preventDefault(); press(k); }
      });
      win.body.append(el('div', { class: 'calc' }, ex, disp, grid)); upd(); win.body.focus();
    },
  });

  /* ---------------- Settings ---------------- */
  W12.settingsPages = [
    { id: 'system', name: () => t('Система', 'System') }, { id: 'display', name: () => t('Экран и яркость', 'Display & brightness') },
    { id: 'personalization', name: () => t('Персонализация', 'Personalization') }, { id: 'language', name: () => t('Язык и время', 'Language & time') },
    { id: 'accounts', name: () => t('Учётные записи', 'Accounts') }, { id: 'about', name: () => t('О системе', 'About') },
  ];
  W12.registerApp({
    id: 'settings', icon: 'settings', w: 880, h: 580, single: true, keys: 'параметры настройки settings',
    name: () => t('Параметры', 'Settings'),
    create(win, args) {
      let page = (args && args.page) || 'personalization';
      const content = el('div', { class: 'set-content' }); const nav = el('div', { class: 'set-nav' });
      const sw = (key, onc) => { const i = el('input', { type: 'checkbox', class: 'switch', onchange: (e) => { W12.set({ [key]: e.target.checked }); onc && onc(); } }); i.checked = !!W12.state[key]; return i; };
      const row = (title, sub, ctl) => el('div', { class: 'set-row' }, el('div', null, el('b', null, title), sub ? el('small', null, sub) : null), ctl);
      const sel = (key, opts) => { const s = el('select', { class: 'input', onchange: (e) => { W12.set({ [key]: e.target.value }); if (key === 'lang') location.reload(); } }, opts.map(([v, n]) => el('option', { value: v }, n))); s.value = W12.state[key]; return s; };
      const pages = {
        personalization: () => [
          row(t('Тема', 'Theme'), null, sel('theme', [['dark', t('Тёмная', 'Dark')], ['light', t('Светлая', 'Light')]])),
          row(t('Акцентный цвет', 'Accent color'), null, el('div', { class: 'swatches' }, W12.accents.map((c) => el('button', { class: 'swatch' + (c === W12.state.accent ? ' on' : ''), style: { background: c }, onclick: () => { W12.set({ accent: c }); render(); } })))),
          row(t('Эффекты прозрачности', 'Transparency effects'), null, sw('glass')),
          row(t('Выравнивание панели задач', 'Taskbar alignment'), null, sel('align', [['center', t('По центру', 'Center')], ['left', t('Слева', 'Left')]])),
          el('div', { class: 'set-h' }, t('Фон рабочего стола', 'Desktop background')),
          el('div', { class: 'wp-grid' }, W12.wallpapers.map((w) => el('button', { class: 'wp' + (W12.state.wallpaper === w.id ? ' on' : ''), style: { background: w.css }, title: w.name, onclick: () => { W12.set({ wallpaper: w.id }); render(); } })))],
        display: () => [
          row(t('Яркость', 'Brightness'), null, el('input', { type: 'range', min: 20, max: 100, value: W12.state.brightness, oninput: (e) => W12.set({ brightness: +e.target.value }) })),
          row(t('Ночной свет', 'Night light'), null, sw('night')),
          row(t('Разрешение', 'Resolution'), null, el('span', { class: 'muted' }, innerWidth + ' × ' + innerHeight)),
          row(t('Полноэкранный режим', 'Full screen'), null, el('button', { class: 'btn', onclick: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()) }, 'F11'))],
        language: () => [row(t('Язык интерфейса', 'Display language'), t('Страница будет перезагружена', 'The page will reload'), sel('lang', [['ru', 'Русский'], ['en', 'English']])), row(t('24-часовой формат', '24-hour clock'), null, sw('clock24'))],
        accounts: () => { const i = el('input', { class: 'input', value: W12.state.user, onchange: (e) => e.target.value.trim() && W12.set({ user: e.target.value.trim() }) }); return [row(t('Имя пользователя', 'User name'), null, i)]; },
        system: () => [row(t('Wi-Fi', 'Wi-Fi'), null, sw('wifi')), row('Bluetooth', null, sw('bluetooth')), row(t('Авиарежим', 'Airplane mode'), null, sw('airplane')),
          row(t('Хранилище', 'Storage'), t('Файлы виртуального диска в localStorage', 'Virtual disk files in localStorage'), el('span', { class: 'muted' }, W12.fmtSize(fs.usage()))),
          row(t('Сброс', 'Reset'), t('Удалить все файлы и настройки', 'Delete all files and settings'), el('button', { class: 'btn danger', onclick: async () => { if (await W12.confirm(t('Сбросить Windows 12 к заводским настройкам?', 'Reset Windows 12 to factory settings?'))) { W12.ls.del('w12.state'); W12.ls.del('w12.fs'); sessionStorage.clear(); location.reload(); } } }, t('Сбросить', 'Reset')))],
        about: () => [el('div', { class: 'about' }, el('div', { class: 'about-logo', html: W12.icon('start', 64) }), el('h2', null, 'Windows 12 Web Concept'), el('small', null, t('Неофициальный фан-проект, не связан с Microsoft', 'Unofficial fan project, not affiliated with Microsoft'))),
          row(t('Версия', 'Version'), null, el('span', { class: 'muted' }, W12.ver)), row(t('Процессор', 'CPU'), null, el('span', { class: 'muted' }, (navigator.hardwareConcurrency || '?') + t(' ядер', ' cores'))),
          row(t('Браузер', 'Browser'), null, el('span', { class: 'muted ua' }, navigator.userAgent.slice(0, 70)))],
      };
      function render() {
        nav.innerHTML = '';
        W12.settingsPages.forEach((p) => nav.append(el('button', { class: 'set-nav-i' + (p.id === page ? ' on' : ''), onclick: () => { page = p.id; render(); } }, p.name())));
        content.innerHTML = ''; content.append(el('h1', null, W12.settingsPages.find((p) => p.id === page).name()), ...pages[page]());
      }
      win.onArgs = (a) => { if (a && a.page) { page = a.page; render(); } };
      win.body.append(el('div', { class: 'set' }, nav, content)); render();
    },
  });

  /* ---------------- Terminal ---------------- */
  W12.registerApp({
    id: 'terminal', icon: 'terminal', w: 740, h: 460, keys: 'терминал terminal cmd powershell консоль',
    name: () => t('Терминал', 'Terminal'),
    create(win) {
      let cwd = '/'; const hist = []; let hp = 0;
      const out = el('div', { class: 'term-out' }); const input = el('input', { class: 'term-in', spellcheck: 'false', autocomplete: 'off' });
      const win_path = () => 'C:\\Users\\' + W12.state.user + (cwd === '/' ? '' : cwd.replace(/\//g, '\\'));
      const prompt = el('span', { class: 'term-p' });
      const setP = () => (prompt.textContent = win_path() + '>');
      const print = (s, cls) => { out.append(el('div', { class: 'term-l ' + (cls || '') }, s)); out.scrollTop = out.scrollHeight; };
      const P = (a) => fs.norm(a || '.', cwd);
      const C = {
        help: () => print('help, cls, echo, dir/ls, cd, pwd, cat/type, mkdir, touch, rm/del, mv, cp, tree, date, whoami, hostname, ver, neofetch, open <app|file>, apps, theme dark|light, lang ru|en, calc <expr>, ping <host>, history, lock, reboot, shutdown'),
        cls: () => (out.innerHTML = ''), clear: () => (out.innerHTML = ''),
        echo: (a) => print(a.join(' ')), pwd: () => print(win_path()), whoami: () => print('win12\\' + W12.state.user.toLowerCase()), hostname: () => print('WIN12-WEB'),
        date: () => print(new Date().toLocaleString()), ver: () => print('Windows 12 Web Concept [Version ' + W12.ver + ']'), winver: () => C.ver(),
        dir(a) { const p = P(a[0]); if (!fs.isDir(p)) return print(t('Папка не найдена', 'Path not found'), 'err'); fs.list(p).forEach((i) => print((i.type === 'dir' ? '<DIR>   ' : W12.fmtSize(i.size).padEnd(8)) + i.name)); },
        cd(a) { const p = P(a.join(' ') || '/'); if (fs.isDir(p)) { cwd = p; setP(); } else print(t('Системе не удаётся найти указанный путь.', 'The system cannot find the path specified.'), 'err'); },
        cat(a) { const c = fs.read(P(a[0])); c == null ? print(t('Файл не найден', 'File not found'), 'err') : print(c.startsWith('data:') ? '[binary]' : c); },
        mkdir: (a) => fs.mkdir(P(a[0])) || print(t('Не удалось создать', 'Cannot create'), 'err'),
        touch: (a) => { if (!fs.exists(P(a[0]))) fs.write(P(a[0]), '') || print(t('Не удалось создать', 'Cannot create'), 'err'); },
        rm: (a) => fs.rm(P(a[0])) || print(t('Не найдено', 'Not found'), 'err'),
        mv: (a) => fs.mv(P(a[0]), P(a[1])) || print(t('Не удалось переместить', 'Cannot move'), 'err'),
        cp: (a) => fs.cp(P(a[0]), P(a[1])) || print(t('Не удалось скопировать', 'Cannot copy'), 'err'),
        tree() { (function walk(p, pre) { fs.list(p).forEach((i) => { print(pre + '├─ ' + i.name); if (i.type === 'dir') walk(i.path, pre + '│  '); }); })(cwd, ''); },
        apps: () => print(Object.keys(W12.apps).join(', ')),
        open(a) { const n = a.join(' '); if (W12.apps[n]) return W12.wm.open(n); const p = P(n); if (fs.isDir(p)) return W12.wm.open('explorer', { path: p }); if (fs.exists(p)) return W12.openFile(p); print(t('Не найдено: ', 'Not found: ') + n, 'err'); },
        theme(a) { if (['dark', 'light'].includes(a[0])) W12.set({ theme: a[0] }); else print('theme dark|light'); },
        lang(a) { if (['ru', 'en'].includes(a[0])) { W12.set({ lang: a[0] }); location.reload(); } else print('lang ru|en'); },
        calc(a) { try { const s = a.join(' ').replace(/\^/g, '**'); if (!/^[\d\s+\-*/().%]+$/.test(s)) throw 0; print(String(Function('"use strict";return (' + s + ')')())); } catch (e) { print(t('Неверное выражение', 'Invalid expression'), 'err'); } },
        ping(a) { const h = a[0] || 'localhost'; print('Pinging ' + h + ' with 32 bytes of data:'); [0, 1, 2, 3].forEach((i) => setTimeout(() => print('Reply from ' + h + ': bytes=32 time=' + (8 + Math.round(Math.random() * 20)) + 'ms TTL=117'), 350 * (i + 1))); },
        history: () => hist.forEach((h, i) => print(i + 1 + '  ' + h)), lock: () => W12.shell.lock(), reboot: () => W12.shell.power(true), shutdown: () => W12.shell.power(false), exit: () => W12.wm.close(win, true),
        neofetch() {
          print('        ████████  ████████        ' + 'user@WIN12-WEB', 'acc'); print('        ████████  ████████        ' + '-----------------');
          print('        ████████  ████████        OS: Windows 12 Web Concept ' + W12.ver); print('        ████████  ████████        Host: ' + (navigator.platform || 'Browser'));
          print('                                  CPU: ' + (navigator.hardwareConcurrency || '?') + ' cores'); print('        ████████  ████████        Resolution: ' + innerWidth + 'x' + innerHeight);
          print('        ████████  ████████        Theme: ' + W12.state.theme + ' / ' + W12.state.accent); print('        ████████  ████████        Shell: w12sh');
        },
      };
      const run = (line) => {
        print(win_path() + '> ' + line, 'cmd'); line = line.trim(); if (!line) return;
        hist.push(line); hp = hist.length;
        const parts = line.match(/"[^"]*"|\S+/g).map((s) => s.replace(/^"|"$/g, '')); const name = parts.shift().toLowerCase();
        const alias = { ls: 'dir', type: 'cat', md: 'mkdir', del: 'rm', rmdir: 'rm', move: 'mv', copy: 'cp', start: 'open' }[name] || name;
        if (C[alias]) { try { C[alias](parts); } catch (e) { print(String(e), 'err'); } } else print(t(`«${name}» не является внутренней или внешней командой.`, `'${name}' is not recognized as a command.`), 'err');
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (hp > 0) input.value = hist[--hp]; }
        else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hp < hist.length - 1 ? hist[++hp] : ((hp = hist.length), ''); }
        else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
        else if (e.key === 'Tab') {
          e.preventDefault(); const m = input.value.match(/^(.*\s)?(\S*)$/); const word = m[2]; const slash = word.lastIndexOf('/');
          const dir = slash >= 0 ? word.slice(0, slash + 1) : ''; const base = word.slice(slash + 1).toLowerCase();
          const hit = fs.list(P(dir || '.')).find((i) => i.name.toLowerCase().startsWith(base));
          if (hit) input.value = (m[1] || '') + dir + hit.name + (hit.type === 'dir' ? '/' : '');
        }
      });
      const wrap = el('div', { class: 'term', onclick: () => { if (!getSelection().toString()) input.focus(); } }, out, el('div', { class: 'term-line' }, prompt, input));
      win.body.append(wrap); setP(); print('Windows 12 Web Concept [Version ' + W12.ver + ']'); print(t('Введите help для списка команд.', 'Type help for a list of commands.')); out.append(el('div'));
      win.onFocus = () => input.focus(); setTimeout(() => input.focus(), 60);
    },
  });
})();

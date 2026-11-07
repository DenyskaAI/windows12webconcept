/* ==========================================================================
   Windows 12 Web Concept — core
   Namespace, helpers, state, i18n, virtual file system, dialogs, menus, toasts
   ========================================================================== */
(function () {
  'use strict';
  const W12 = (window.W12 = { apps: {}, ver: '1.0.0', TB: 72 });

  /* ---------- helpers ---------- */
  W12.$ = (s, r = document) => r.querySelector(s);
  W12.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  W12.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  W12.pad = (n) => String(n).padStart(2, '0');
  W12.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  W12.uid = (() => { let n = 0; return () => 'w' + (++n) + Math.random().toString(36).slice(2, 6); })();

  /** Tiny hyperscript: el('div', {class:'x', onclick:fn}, child, 'text') */
  W12.el = function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') e.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'dataset') Object.assign(e.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
        else e.setAttribute(k, v === true ? '' : v);
      }
    }
    kids.flat(Infinity).forEach((c) => {
      if (c == null || c === false) return;
      e.append(c.nodeType ? c : document.createTextNode(c));
    });
    return e;
  };
  const { el, $, uid } = W12;

  /* ---------- event bus ---------- */
  const handlers = {};
  W12.on = (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); return fn; };
  W12.off = (ev, fn) => { handlers[ev] = (handlers[ev] || []).filter((f) => f !== fn); };
  W12.emit = (ev, ...a) => (handlers[ev] || []).slice().forEach((fn) => { try { fn(...a); } catch (e) { console.error(e); } });

  /* ---------- storage ---------- */
  W12.ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  /* ---------- state ---------- */
  const defaults = {
    lang: (navigator.language || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en',
    theme: 'dark',
    accent: '#0078d4',
    wallpaper: 'bloom',
    align: 'center',
    glass: true,
    clock24: true,
    volume: 60,
    brightness: 100,
    wifi: true,
    bluetooth: true,
    airplane: false,
    night: false,
    user: 'User',
    pinned: ['explorer', 'browser', 'notepad', 'calculator', 'terminal', 'settings', 'assistant'],
    recent: [],
    notes: '',
  };
  W12.state = Object.assign({}, defaults, W12.ls.get('w12.state', {}));
  W12.save = () => W12.ls.set('w12.state', W12.state);
  W12.set = (patch) => { Object.assign(W12.state, patch); W12.save(); W12.emit('state', patch); };

  /** i18n: t('по-русски', 'in English') */
  W12.t = (ru, en) => (W12.state.lang === 'ru' ? ru : en);
  const t = W12.t;

  /* ---------- wallpapers & accents ---------- */
  W12.wallpapers = [
    { id: 'bloom', name: 'Bloom', css: 'radial-gradient(55% 75% at 18% 28%, #2b7bff 0%, transparent 62%), radial-gradient(48% 70% at 82% 18%, #9b4dff 0%, transparent 60%), radial-gradient(70% 80% at 62% 92%, #12c6ff 0%, transparent 62%), linear-gradient(135deg, #0a0f2e, #16265a)' },
    { id: 'sunset', name: 'Sunset', css: 'radial-gradient(60% 70% at 25% 85%, #ff6a3d 0%, transparent 60%), radial-gradient(60% 60% at 80% 30%, #ff3d8b 0%, transparent 62%), radial-gradient(50% 60% at 50% 0%, #7a3dff 0%, transparent 70%), linear-gradient(160deg, #2b0f3a, #5a1b44)' },
    { id: 'forest', name: 'Forest', css: 'radial-gradient(60% 70% at 20% 20%, #2ecc71 0%, transparent 60%), radial-gradient(60% 70% at 85% 80%, #0aa37f 0%, transparent 60%), radial-gradient(40% 50% at 70% 15%, #b8f27a 0%, transparent 65%), linear-gradient(150deg, #04261e, #0c4a3a)' },
    { id: 'aurora', name: 'Aurora', css: 'radial-gradient(70% 45% at 30% 30%, #19e6b4 0%, transparent 62%), radial-gradient(60% 50% at 75% 45%, #6a5cff 0%, transparent 62%), radial-gradient(60% 40% at 50% 95%, #ff5fd2 0%, transparent 65%), linear-gradient(180deg, #050a1f, #0b1740)' },
    { id: 'ocean', name: 'Ocean', css: 'radial-gradient(70% 60% at 50% 100%, #00d4ff 0%, transparent 62%), radial-gradient(60% 50% at 10% 20%, #0066ff 0%, transparent 60%), linear-gradient(180deg, #02182f, #04336b)' },
    { id: 'graphite', name: 'Graphite', css: 'radial-gradient(60% 60% at 25% 25%, #4a5160 0%, transparent 62%), radial-gradient(60% 60% at 80% 85%, #2a2f3a 0%, transparent 62%), linear-gradient(145deg, #15171c, #262a33)' },
    { id: 'light', name: 'Daybreak', css: 'radial-gradient(60% 70% at 20% 25%, #8fd3ff 0%, transparent 60%), radial-gradient(60% 70% at 85% 25%, #ffd1f0 0%, transparent 62%), radial-gradient(70% 60% at 55% 95%, #b5a8ff 0%, transparent 62%), linear-gradient(160deg, #e9f2ff, #f6ecff)' },
  ];
  W12.accents = ['#0078d4', '#005fb8', '#7a3dff', '#c239b3', '#e3008c', '#d13438', '#ff6a00', '#c19c00', '#107c10', '#00a389', '#0099bc', '#5d5a58'];
  W12.wallpaperCss = (id) => {
    if (id && id.startsWith('file:')) {
      const c = W12.fs.read(id.slice(5));
      if (c && c.startsWith('data:')) return 'center / cover no-repeat url("' + c + '")';
      id = 'bloom';
    }
    return (W12.wallpapers.find((w) => w.id === id) || W12.wallpapers[0]).css;
  };

  /* ---------- virtual file system ---------- */
  const now = () => Date.now();
  const F = (c) => ({ t: 'f', c: c || '', m: now() });
  const D = (k) => ({ t: 'd', k: k || {}, m: now() });
  function seed() {
    const ru = W12.state.lang === 'ru';
    return {
      root: D({
        Desktop: D(),
        Documents: D({
          'Welcome.txt': F(ru
            ? 'Добро пожаловать в Windows 12 Web Concept!\n\nЭто демонстрационная «операционная система», которая работает целиком в браузере.\n\nПопробуйте:\n • Меню «Пуск» и поиск (Alt+S)\n • Быстрые настройки (Alt+A), календарь (Alt+N), виджеты (Alt+W)\n • Перетаскивайте окна к краям экрана — сработает привязка (snap)\n • Терминал, Paint, Змейка, Ассистент\n\nВсе файлы хранятся в localStorage вашего браузера.'
            : 'Welcome to Windows 12 Web Concept!\n\nThis is a demo "operating system" running entirely in your browser.\n\nTry:\n • Start menu and search (Alt+S)\n • Quick settings (Alt+A), calendar (Alt+N), widgets (Alt+W)\n • Drag windows to the screen edges to snap them\n • Terminal, Paint, Snake, Assistant\n\nAll files are stored in your browser\'s localStorage.'),
          'Todo.md': F('# Todo\n\n- [x] Install Windows 12\n- [ ] Star the repo on GitHub\n- [ ] Write your own app\n'),
        }),
        Downloads: D(), Pictures: D(), Music: D(), Videos: D(),
      }),
      trash: [],
    };
  }
  let fsData = W12.ls.get('w12.fs', null);
  if (!fsData || !fsData.root) fsData = seed();

  function persistFS() {
    if (!W12.ls.set('w12.fs', fsData)) setTimeout(() => W12.notify(t('Нет места', 'Storage full'), t('Хранилище браузера переполнено. Удалите крупные файлы.', 'Browser storage is full. Delete large files.'), 'warn'), 0);
  }
  const bad = /[\\/:*?"<>|]/;
  const fs = (W12.fs = {
    RB: '/$Recycle',
    validName: (n) => !!n && !bad.test(n) && n.trim() === n && n !== '.' && n !== '..',
    norm(p, cwd) {
      const src = String(p || '/').replace(/\\/g, '/');
      const parts = (src.startsWith('/') ? src : (cwd || '/') + '/' + src).split('/');
      const out = [];
      for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
      return '/' + out.join('/');
    },
    node(p) {
      let n = fsData.root;
      for (const s of fs.norm(p).split('/').filter(Boolean)) {
        if (n.t !== 'd' || !n.k[s]) return null;
        n = n.k[s];
      }
      return n;
    },
    parent(p) {
      const a = fs.norm(p).split('/').filter(Boolean);
      const name = a.pop();
      const dirPath = '/' + a.join('/');
      return { dir: fs.node(dirPath), name, dirPath };
    },
    join: (d, n) => fs.norm(d + '/' + n),
    exists: (p) => !!fs.node(p),
    isDir: (p) => { const n = fs.node(p); return !!n && n.t === 'd'; },
    base: (p) => fs.norm(p).split('/').filter(Boolean).pop() || '',
    ext: (p) => { const b = fs.base(p); const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i + 1).toLowerCase() : ''; },
    list(p) {
      const n = fs.node(p);
      if (!n || n.t !== 'd') return [];
      return Object.keys(n.k).map((name) => {
        const v = n.k[name];
        return { name, type: v.t === 'd' ? 'dir' : 'file', size: v.t === 'f' ? v.c.length : 0, mtime: v.m, path: fs.join(p, name) };
      }).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name, undefined, { numeric: true }) : a.type === 'dir' ? -1 : 1));
    },
    read(p) { const n = fs.node(p); return n && n.t === 'f' ? n.c : null; },
    write(p, content) {
      const { dir, name } = fs.parent(p);
      if (!dir || dir.t !== 'd' || !fs.validName(name)) return false;
      if (dir.k[name] && dir.k[name].t === 'd') return false;
      dir.k[name] = F(content);
      dir.m = now();
      persistFS(); W12.emit('fs', p);
      return true;
    },
    mkdir(p) {
      const { dir, name } = fs.parent(p);
      if (!dir || dir.t !== 'd' || !fs.validName(name) || dir.k[name]) return false;
      dir.k[name] = D(); dir.m = now();
      persistFS(); W12.emit('fs', p);
      return true;
    },
    rm(p, toTrash = true) {
      const { dir, name, dirPath } = fs.parent(p);
      if (!dir || !dir.k || !dir.k[name]) return false;
      const node = dir.k[name];
      delete dir.k[name];
      if (toTrash) fsData.trash.push({ id: uid(), name, node, from: dirPath, at: now() });
      persistFS(); W12.emit('fs', p);
      return true;
    },
    mv(src, dst) {
      src = fs.norm(src); dst = fs.norm(dst);
      if (src === dst) return true;
      if (dst.startsWith(src + '/')) return false;
      const a = fs.parent(src); const b = fs.parent(dst);
      if (!a.dir || !b.dir || b.dir.t !== 'd' || !a.dir.k[a.name] || b.dir.k[b.name] || !fs.validName(b.name)) return false;
      b.dir.k[b.name] = a.dir.k[a.name];
      delete a.dir.k[a.name];
      persistFS(); W12.emit('fs', dst);
      return true;
    },
    cp(src, dst) {
      src = fs.norm(src); dst = fs.norm(dst);
      const n = fs.node(src); const b = fs.parent(dst);
      if (!n || !b.dir || b.dir.t !== 'd' || b.dir.k[b.name] || !fs.validName(b.name) || dst.startsWith(src + '/')) return false;
      b.dir.k[b.name] = JSON.parse(JSON.stringify(n));
      persistFS(); W12.emit('fs', dst);
      return true;
    },
    unique(dirPath, name) {
      if (!fs.exists(fs.join(dirPath, name))) return name;
      const i = name.lastIndexOf('.');
      const base = i > 0 ? name.slice(0, i) : name; const ext = i > 0 ? name.slice(i) : '';
      for (let n = 2; n < 999; n++) { const c = base + ' (' + n + ')' + ext; if (!fs.exists(fs.join(dirPath, c))) return c; }
      return name + Date.now();
    },
    trash: () => fsData.trash,
    restore(id) {
      const i = fsData.trash.findIndex((x) => x.id === id);
      if (i < 0) return false;
      const x = fsData.trash[i];
      const dirPath = fs.isDir(x.from) ? x.from : '/Documents';
      const name = fs.unique(dirPath, x.name);
      fs.node(dirPath).k[name] = x.node;
      fsData.trash.splice(i, 1);
      persistFS(); W12.emit('fs', dirPath);
      return true;
    },
    purge(id) { fsData.trash = fsData.trash.filter((x) => x.id !== id); persistFS(); W12.emit('fs', fs.RB); },
    emptyTrash() { fsData.trash = []; persistFS(); W12.emit('fs', fs.RB); },
    search(q, limit = 8) {
      const res = []; q = q.toLowerCase();
      (function walk(p) {
        for (const it of fs.list(p)) {
          if (res.length >= limit) return;
          if (it.name.toLowerCase().includes(q)) res.push(it);
          if (it.type === 'dir') walk(it.path);
        }
      })('/');
      return res;
    },
    usage() { try { return JSON.stringify(fsData).length; } catch (e) { return 0; } },
    reset() { fsData = seed(); persistFS(); W12.emit('fs', '/'); },
  });

  /* ---------- file associations ---------- */
  const IMG = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
  W12.isImage = (p) => IMG.includes(fs.ext(p));
  W12.iconForFile = (name) => (IMG.includes(fs.ext(name)) ? 'image' : 'file');
  W12.openFile = (path) => {
    const rec = [path].concat(W12.state.recent.filter((x) => x !== path)).filter(fs.exists).slice(0, 8);
    W12.set({ recent: rec });
    if (W12.isImage(path)) return W12.wm.open('photos', { path });
    return W12.wm.open('notepad', { path });
  };

  /* ---------- apps ---------- */
  W12.registerApp = (def) => { W12.apps[def.id] = def; };
  W12.launch = (id, args) => W12.wm.open(id, args);

  /* ---------- dialogs ---------- */
  W12.dialog = (o) => new Promise((resolve) => {
    const host = $('#screen') || document.body;
    const inp = o.input ? el('input', { class: 'input dlg-input', value: o.value || '', spellcheck: 'false' }) : null;
    const buttons = o.buttons || [
      { label: 'OK', value: true, primary: true },
      { label: t('Отмена', 'Cancel'), value: false, cancel: true },
    ];
    const cancelBtn = buttons.find((b) => b.cancel);
    const cancelVal = cancelBtn ? cancelBtn.value : null;
    const done = (v) => { ov.classList.add('out'); setTimeout(() => ov.remove(), 160); document.removeEventListener('keydown', key, true); resolve(v); };
    const key = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); done(o.input ? null : cancelVal); }
      else if (e.key === 'Enter' && (inp || o.enter)) { e.stopPropagation(); e.preventDefault(); const p = buttons.find((b) => b.primary); done(o.input ? inp.value : p ? p.value : true); }
    };
    const ov = el('div', { class: 'dlg-overlay' },
      el('div', { class: 'dlg glass-solid', style: o.width ? { width: o.width + 'px' } : null },
        el('div', { class: 'dlg-title' }, o.title || 'Windows 12'),
        o.message ? el('div', { class: 'dlg-msg' }, o.message) : null,
        o.node || null,
        inp,
        el('div', { class: 'dlg-btns' }, buttons.map((b) => el('button', {
          class: 'btn' + (b.primary ? ' primary' : ''),
          onclick: () => done(o.input ? (b.primary ? inp.value : null) : b.value),
        }, b.label)))));
    host.append(ov);
    document.addEventListener('keydown', key, true);
    if (inp) { inp.focus(); const i = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, i > 0 ? i : inp.value.length); }
    o.onMount && o.onMount(ov, done);
  });
  W12.alert = (message, title) => W12.dialog({ title, message, enter: true, buttons: [{ label: 'OK', value: true, primary: true }] });
  W12.confirm = (message, title) => W12.dialog({ title, message, enter: true });
  W12.prompt = (message, value, title) => W12.dialog({ title, message, input: true, value });

  /** Simple file picker. mode: 'open' | 'save' → Promise<path|null> */
  W12.filePicker = ({ mode = 'open', path = '/Documents', name = '', title, filter }) => {
    let cwd = path;
    const list = el('div', { class: 'fp-list' });
    const crumb = el('div', { class: 'fp-path' });
    const nameIn = el('input', { class: 'input', placeholder: t('Имя файла', 'File name'), value: name, spellcheck: 'false' });
    const up = el('button', { class: 'btn', title: t('Вверх', 'Up'), onclick: () => { cwd = fs.parent(cwd).dirPath; render(); } }, '↑');
    let finish = null;
    function render() {
      crumb.textContent = cwd === '/' ? t('Этот компьютер', 'This PC') : cwd;
      list.innerHTML = '';
      fs.list(cwd).filter((i) => i.type === 'dir' || !filter || filter(i)).forEach((i) => {
        list.append(el('div', {
          class: 'fp-item', onclick: () => { if (i.type === 'file') nameIn.value = i.name; },
          ondblclick: () => { if (i.type === 'dir') { cwd = i.path; render(); } else if (mode === 'open') finish(i.path); },
        }, el('span', { class: 'fp-ico', html: W12.icon(i.type === 'dir' ? 'folder' : W12.iconForFile(i.name), 20) }), i.name));
      });
      if (!list.children.length) list.append(el('div', { class: 'fp-empty' }, t('Папка пуста', 'This folder is empty')));
    }
    const node = el('div', { class: 'fp' }, el('div', { class: 'fp-bar' }, up, crumb), list, nameIn);
    return W12.dialog({
      title: title || (mode === 'save' ? t('Сохранить как', 'Save as') : t('Открыть', 'Open')), width: 460, node,
      buttons: [{ label: mode === 'save' ? t('Сохранить', 'Save') : t('Открыть', 'Open'), primary: true, value: 'ok' }, { label: t('Отмена', 'Cancel'), cancel: true, value: null }],
      onMount: (ov, done) => { finish = done; render(); },
    }).then((v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'string' && v !== 'ok') return v;
      const n = nameIn.value.trim();
      if (!n) return null;
      const full = fs.join(cwd, n);
      if (mode === 'open' && !fs.exists(full)) return null;
      if (mode === 'save' && !fs.validName(n)) { W12.alert(t('Недопустимое имя файла.', 'Invalid file name.')); return null; }
      return full;
    });
  };

  /* ---------- toasts & notifications ---------- */
  W12.notices = [];
  W12.notify = (title, msg, icon) => {
    const n = { id: uid(), title, msg, icon: icon || 'info', time: Date.now() };
    W12.notices.unshift(n);
    if (W12.notices.length > 30) W12.notices.pop();
    const host = $('#toasts');
    if (host) {
      const card = el('div', { class: 'toast glass', onclick: () => kill() },
        el('div', { class: 'toast-ico', html: W12.glyph(icon === 'warn' ? 'warn' : icon === 'ok' ? 'check' : 'info', 20) }),
        el('div', { class: 'toast-txt' }, el('b', null, title), el('span', null, msg)));
      const kill = () => { card.classList.add('out'); setTimeout(() => card.remove(), 220); };
      host.append(card);
      setTimeout(kill, 5200);
    }
    W12.emit('notify', n);
  };

  /* ---------- context menu ---------- */
  W12.ctxClose = () => { const m = $('.ctx'); if (m) m.remove(); };
  W12.ctx = (x, y, items) => {
    W12.ctxClose();
    const m = el('div', { class: 'ctx glass', onpointerdown: (e) => e.stopPropagation() });
    items.filter(Boolean).forEach((it) => {
      if (it.sep) { m.append(el('div', { class: 'ctx-sep' })); return; }
      m.append(el('div', {
        class: 'ctx-item' + (it.disabled ? ' dis' : '') + (it.danger ? ' danger' : ''),
        onclick: () => { if (it.disabled) return; W12.ctxClose(); it.action && it.action(); },
      }, el('span', { class: 'ci' }, it.icon || ''), el('span', { class: 'cl' }, it.label), it.hint ? el('span', { class: 'ck' }, it.hint) : null));
    });
    ($('#screen') || document.body).append(m);
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(6, Math.min(x, innerWidth - r.width - 6)) + 'px';
    m.style.top = Math.max(6, Math.min(y, innerHeight - r.height - 6)) + 'px';
  };
  /** open a menu under an element */
  W12.menuAt = (target, items) => { const r = target.getBoundingClientRect(); W12.ctx(r.left, r.bottom + 2, items); };
  document.addEventListener('pointerdown', () => W12.ctxClose());
  window.addEventListener('blur', () => W12.ctxClose());
  document.addEventListener('contextmenu', (e) => { if (!e.target.closest('input,textarea,[contenteditable]')) e.preventDefault(); });

  /* ---------- misc ---------- */
  W12.fmtSize = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB');
  W12.fmtDate = (ms) => new Date(ms).toLocaleString(W12.state.lang === 'ru' ? 'ru-RU' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
  W12.download = (name, content) => {
    const a = document.createElement('a');
    if (typeof content === 'string' && content.startsWith('data:')) a.href = content;
    else a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    a.download = name; document.body.append(a); a.click(); a.remove();
  };
  W12.beep = (times = 3) => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const vol = (W12.state.volume / 100) * 0.2;
      for (let i = 0; i < times; i++) {
        const o = ac.createOscillator(); const g = ac.createGain();
        o.connect(g); g.connect(ac.destination); o.type = 'sine'; o.frequency.value = 880;
        g.gain.setValueAtTime(vol, ac.currentTime + i * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.35 + 0.25);
        o.start(ac.currentTime + i * 0.35); o.stop(ac.currentTime + i * 0.35 + 0.28);
      }
    } catch (e) { /* audio not available */ }
  };
})();

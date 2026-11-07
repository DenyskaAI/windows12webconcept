/* Windows 12 Web Concept — shell: theme, taskbar, start, flyouts, desktop, lock screen */
(function () {
  'use strict';
  const W12 = window.W12; const { el, $, t, fs, glyph, icon, pad } = W12;
  const S = () => W12.state; const wm = W12.wm;
  const shell = (W12.shell = {});
  const loc = () => (S().lang === 'ru' ? 'ru-RU' : 'en-US');

  /* ---------- theme ---------- */
  shell.applyTheme = () => {
    const s = S(); const d = document.documentElement;
    d.dataset.theme = s.theme; d.style.setProperty('--accent', s.accent);
    d.dataset.glass = s.glass ? '1' : '0'; d.lang = s.lang; document.body.dataset.align = s.align;
    const wp = W12.wallpaperCss(s.wallpaper);
    $('#wallpaper').style.background = wp; $('#lock-bg').style.background = wp;
    $('#dim').style.opacity = String(1 - s.brightness / 100 * 0.8 - 0.2 + 0.0);
    $('#dim').style.opacity = String(Math.max(0, (100 - s.brightness) / 100 * 0.75));
    $('#night').style.opacity = s.night ? '1' : '0';
  };
  W12.on('state', () => { shell.applyTheme(); renderTaskbar(); shell.tick(); });

  /* ---------- clock ---------- */
  shell.tick = () => {
    const d = new Date(); const h24 = S().clock24;
    const time = d.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit', hour12: !h24 });
    const date = d.toLocaleDateString(loc(), { day: 'numeric', month: 'long', weekday: 'long' });
    const short = d.toLocaleDateString(loc(), { day: '2-digit', month: '2-digit', year: 'numeric' });
    $$('.c-time').forEach((e) => (e.textContent = time));
    $$('.c-date').forEach((e) => (e.textContent = date));
    $$('.c-short').forEach((e) => (e.textContent = short));
  };
  const $$ = W12.$$;

  /* ---------- flyouts ---------- */
  const FLY = ['start', 'quick', 'calendar', 'widgets', 'taskview'];
  shell.closeAll = (except) => FLY.forEach((id) => { if (id !== except) { const f = $('#' + id); f && f.classList.remove('open'); } });
  shell.toggle = (id) => {
    const f = $('#' + id); const was = f.classList.contains('open');
    shell.closeAll(id); W12.ctxClose();
    if (was) { f.classList.remove('open'); return; }
    if (shell['build_' + id]) shell['build_' + id]();
    f.classList.add('open');
    if (id === 'start') setTimeout(() => $('#st-input').focus(), 60);
  };
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.flyout, #taskbar, #topbar, .ctx, .dlg-overlay')) shell.closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && FLY.some((id) => $('#' + id).classList.contains('open'))) { e.preventDefault(); shell.closeAll(); }
  }, true);

  /* ---------- taskbar ---------- */
  function openApp(id) { shell.closeAll(); wm.open(id); }
  function renderTaskbar() {
    const dock = $('#dock-apps'); dock.innerHTML = '';
    const ids = S().pinned.slice(); wm.list().forEach((w) => { if (!ids.includes(w.app.id)) ids.push(w.app.id); });
    ids.forEach((id) => {
      const app = W12.apps[id]; if (!app) return;
      const ws = wm.byApp(id); const act = ws.some((w) => w === wm.active && !w.min);
      dock.append(el('button', {
        class: 'tb-btn' + (ws.length ? ' run' : '') + (act ? ' act' : ''), title: app.name(),
        onclick: () => {
          shell.closeAll();
          if (!ws.length) return wm.open(id);
          if (ws.length === 1) { const w = ws[0]; return w === wm.active && !w.min ? wm.minimize(w) : wm.focus(w); }
          const n = ws.filter((w) => w !== wm.active)[0] || ws[0]; wm.focus(n);
        },
        oncontextmenu: (e) => {
          e.preventDefault(); const pinned = S().pinned.includes(id);
          W12.ctx(e.clientX, e.clientY - 120, [
            { label: app.name(), icon: '', action: () => wm.open(id) },
            { label: pinned ? t('Открепить от панели задач', 'Unpin from taskbar') : t('Закрепить на панели задач', 'Pin to taskbar'), action: () => W12.set({ pinned: pinned ? S().pinned.filter((x) => x !== id) : S().pinned.concat(id) }) },
            ws.length ? { label: t('Закрыть окно', 'Close window'), action: () => ws.forEach((w) => wm.close(w)) } : null]);
        },
      }, el('span', { class: 'ti', html: icon(app.icon || id, 26) }), el('i', { class: 'dot' })));
    });
  }
  W12.on('wm', renderTaskbar);

  function buildTaskbar() {
    const btn = (g, title, fn) => el('button', { class: 'tb-btn', title, html: glyph(g, 20), onclick: fn });
    $('#tb-center').prepend(
      el('button', { class: 'tb-btn start-btn', title: t('Пуск', 'Start'), html: icon('start', 26), onclick: () => shell.toggle('start') }),
      btn('search', t('Поиск', 'Search'), () => shell.toggle('start')),
      btn('taskview', t('Представление задач', 'Task view'), () => shell.toggle('taskview')));
    $('#tb-left').append(el('button', { class: 'pill wx', onclick: () => shell.toggle('widgets') },
      el('span', { class: 'wx-ico' }, '⛅'), el('span', { class: 'wx-t' }, el('b', null, '18°C'), el('small', null, t('Облачно', 'Cloudy')))));
    $('#tb-right').append(
      el('button', { class: 'pill tray', onclick: () => shell.toggle('quick') }, el('span', { html: glyph('wifi', 17) }), el('span', { html: glyph('volume', 17) }), el('span', { html: glyph('battery', 17) })),
      el('button', { class: 'pill clk', onclick: () => shell.toggle('calendar') }, el('b', { class: 'c-time' }), el('small', { class: 'c-short' })));
    $('#showdesk').onclick = () => wm.showDesktop();
    $('#topbar').append(el('button', { class: 'pill top', onclick: () => shell.toggle('calendar') }, el('b', { class: 'c-time' }), el('span', { class: 'sep' }), el('span', { class: 'c-date' })));
  }

  /* ---------- start menu ---------- */
  const appList = () => Object.values(W12.apps).sort((a, b) => a.name().localeCompare(b.name()));
  const SETTINGS = () => (W12.settingsPages || []);
  shell.build_start = () => {
    const st = $('#start'); if (st.dataset.built !== S().lang) {
      st.dataset.built = S().lang; st.innerHTML = '';
      const input = el('input', { id: 'st-input', class: 'st-input', placeholder: t('Поиск приложений, настроек и файлов', 'Search apps, settings and files'), autocomplete: 'off', spellcheck: 'false' });
      st.append(el('div', { class: 'st-search' }, el('span', { html: glyph('search', 17) }), input), el('div', { id: 'st-body', class: 'st-body' }),
        el('div', { class: 'st-foot' }, el('button', { class: 'st-user', onclick: () => { shell.closeAll(); wm.open('settings', { page: 'accounts' }); } }, el('span', { class: 'avatar', html: glyph('user', 18) }), el('b', { id: 'st-name' })),
          el('button', { class: 'tb-btn', title: t('Питание', 'Power'), html: glyph('power', 18), onclick: (e) => W12.menuAt(e.currentTarget.getBoundingClientRect ? e.currentTarget : e.target, [
            { label: t('Сон (блокировка)', 'Sleep (lock)'), action: () => shell.lock() }, { label: t('Перезагрузка', 'Restart'), action: () => shell.power(true) }, { label: t('Завершение работы', 'Shut down'), action: () => shell.power(false) }]) })));
      input.addEventListener('input', () => renderStart(input.value.trim()));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const f = $('#st-body .st-res'); f && f.click(); } if (e.key === 'Escape') shell.closeAll(); });
    }
    $('#st-name').textContent = S().user; $('#st-input').value = ''; renderStart('');
  };
  function renderStart(q, all) {
    const b = $('#st-body'); b.innerHTML = '';
    const tile = (a) => el('button', { class: 'st-app', onclick: () => openApp(a.id) }, el('span', { html: icon(a.icon || a.id, 34) }), el('small', null, a.name()));
    if (!q) {
      b.append(el('div', { class: 'st-h' }, el('b', null, all ? t('Все приложения', 'All apps') : t('Закреплённые', 'Pinned')), el('button', { class: 'link', onclick: () => renderStart('', !all) }, all ? t('‹ Назад', '‹ Back') : t('Все приложения ›', 'All apps ›'))));
      b.append(el('div', { class: 'st-grid' }, (all ? appList() : S().pinned.map((id) => W12.apps[id]).filter(Boolean)).map(tile)));
      if (!all) {
        b.append(el('div', { class: 'st-h' }, el('b', null, t('Рекомендуем', 'Recommended'))));
        const rec = S().recent.filter(fs.exists).slice(0, 6);
        b.append(el('div', { class: 'st-rec' }, rec.length ? rec.map((p) => el('button', { class: 'st-r', onclick: () => { shell.closeAll(); W12.openFile(p); } }, el('span', { html: icon(W12.iconForFile(p), 28) }), el('span', null, el('b', null, fs.base(p)), el('small', null, p)))) : el('div', { class: 'muted' }, t('Здесь появятся недавние файлы', 'Recent files will appear here'))));
      }
      return;
    }
    const ql = q.toLowerCase(); const res = [];
    appList().filter((a) => (a.name() + ' ' + (a.keys || '')).toLowerCase().includes(ql)).forEach((a) => res.push({ ic: icon(a.icon || a.id, 28), n: a.name(), s: t('Приложение', 'App'), fn: () => wm.open(a.id) }));
    SETTINGS().filter((p) => p.name().toLowerCase().includes(ql)).forEach((p) => res.push({ ic: icon('settings', 28), n: p.name(), s: t('Параметры', 'Settings'), fn: () => wm.open('settings', { page: p.id }) }));
    fs.search(q).forEach((f) => res.push({ ic: icon(f.type === 'dir' ? 'folder' : W12.iconForFile(f.name), 28), n: f.name, s: f.path, fn: () => (f.type === 'dir' ? wm.open('explorer', { path: f.path }) : W12.openFile(f.path)) }));
    res.push({ ic: icon('assistant', 28), n: t('Спросить ассистента: ', 'Ask Assistant: ') + q, s: t('ИИ', 'AI'), fn: () => wm.open('assistant', { q }) });
    res.forEach((r) => b.append(el('button', { class: 'st-r st-res', onclick: () => { shell.closeAll(); r.fn(); } }, el('span', { html: r.ic }), el('span', null, el('b', null, r.n), el('small', null, r.s)))));
  }

  /* ---------- quick settings ---------- */
  shell.build_quick = () => {
    const q = $('#quick'); q.innerHTML = '';
    const tog = (key, g, label, onChange) => {
      const b = el('button', { class: 'qs-tile' + (S()[key] ? ' on' : ''), onclick: () => { W12.set({ [key]: !S()[key] }); b.classList.toggle('on', S()[key]); onChange && onChange(); } }, el('span', { html: glyph(g, 20) }), el('small', null, label));
      return b;
    };
    const slider = (key, g, min) => el('div', { class: 'qs-slider' }, el('span', { html: glyph(g, 18) }), el('input', { type: 'range', min: min || 0, max: 100, value: S()[key], oninput: (e) => W12.set({ [key]: +e.target.value }) }));
    const dark = el('button', { class: 'qs-tile' + (S().theme === 'dark' ? ' on' : ''), onclick: () => { W12.set({ theme: S().theme === 'dark' ? 'light' : 'dark' }); dark.classList.toggle('on', S().theme === 'dark'); } }, el('span', { html: glyph('moon', 20) }), el('small', null, t('Тёмная тема', 'Dark mode')));
    const batt = el('small', { class: 'muted' }, '');
    if (navigator.getBattery) navigator.getBattery().then((b) => (batt.textContent = Math.round(b.level * 100) + '%' + (b.charging ? ' ⚡' : ''))).catch(() => {});
    q.append(el('div', { class: 'qs-grid' }, tog('wifi', 'wifi', 'Wi-Fi'), tog('bluetooth', 'bluetooth', 'Bluetooth'), tog('airplane', 'plane', t('Авиарежим', 'Airplane')), tog('night', 'sun', t('Ночной свет', 'Night light')), dark,
      el('button', { class: 'qs-tile', onclick: () => { shell.closeAll(); wm.open('settings'); } }, el('span', { html: glyph('grid', 20) }), el('small', null, t('Все параметры', 'All settings')))),
      slider('brightness', 'sun', 20), slider('volume', 'volume'),
      el('div', { class: 'qs-foot' }, el('span', { html: glyph('battery', 18) }), batt, el('span', { style: { flex: 1 } }), el('button', { class: 'tb-btn', title: t('Параметры', 'Settings'), html: glyph('grid', 18), onclick: () => { shell.closeAll(); wm.open('settings'); } })));
  };

  /* ---------- calendar + notifications ---------- */
  let calOff = 0;
  shell.build_calendar = () => {
    const c = $('#calendar'); c.innerHTML = '';
    const now = new Date(); const m = new Date(now.getFullYear(), now.getMonth() + calOff, 1);
    const first = (m.getDay() + 6) % 7; const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const names = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'short' }));
    const grid = el('div', { class: 'cal-grid' }, names.map((n) => el('b', null, n)));
    for (let i = 0; i < first; i++) grid.append(el('span'));
    for (let d = 1; d <= days; d++) grid.append(el('span', { class: 'cal-d' + (!calOff && d === now.getDate() ? ' today' : '') }, d));
    const nl = el('div', { class: 'notif-list' }, W12.notices.length ? W12.notices.map((n) => el('div', { class: 'notif' }, el('b', null, n.title), el('span', null, n.msg))) : el('div', { class: 'muted', style: { padding: '10px' } }, t('Нет новых уведомлений', 'No new notifications')));
    c.append(el('div', { class: 'cal-notif' }, el('div', { class: 'notif-h' }, el('b', null, t('Уведомления', 'Notifications')), el('button', { class: 'link', onclick: () => { W12.notices.length = 0; shell.build_calendar(); } }, t('Очистить', 'Clear'))), nl),
      el('div', { class: 'cal' }, el('div', { class: 'cal-big' }, el('b', { class: 'c-time' }), el('span', { class: 'c-date' })),
        el('div', { class: 'cal-nav' }, el('b', null, m.toLocaleDateString(loc(), { month: 'long', year: 'numeric' })), el('span', null, el('button', { class: 'tb-btn', html: glyph('chevUp', 16), onclick: () => { calOff--; shell.build_calendar(); } }), el('button', { class: 'tb-btn', html: glyph('chevDown', 16), onclick: () => { calOff++; shell.build_calendar(); } }))), grid));
    shell.tick();
  };

  /* ---------- widgets ---------- */
  shell.build_widgets = () => {
    const w = $('#widgets'); w.innerHTML = '';
    const ta = el('textarea', { class: 'wd-notes', placeholder: t('Быстрые заметки…', 'Quick notes…'), oninput: (e) => W12.set({ notes: e.target.value }) }); ta.value = S().notes || '';
    w.append(el('div', { class: 'wd-h' }, el('b', null, t('Виджеты', 'Widgets'))),
      el('div', { class: 'wd-card wd-wx' }, el('div', { class: 'big' }, '⛅ 18°C'), el('div', null, el('b', null, t('Облачно', 'Cloudy')), el('small', null, t('Демо-данные', 'Demo data')))),
      el('div', { class: 'wd-card' }, el('b', { class: 'c-time big' }), el('small', { class: 'c-date' })),
      el('div', { class: 'wd-card' }, el('b', null, t('Система', 'System')), el('small', null, (navigator.hardwareConcurrency || 4) + t(' ядер CPU', ' CPU cores') + ' · ' + (navigator.deviceMemory ? navigator.deviceMemory + ' GB RAM' : 'RAM n/a'))),
      el('div', { class: 'wd-card' }, el('b', null, t('Заметки', 'Notes')), ta));
    shell.tick();
  };

  /* ---------- task view ---------- */
  shell.build_taskview = () => {
    const tv = $('#taskview'); tv.innerHTML = '';
    const list = wm.list();
    tv.append(el('div', { class: 'tv-grid' }, list.length ? list.map((w) => el('div', { class: 'tv-card', onclick: () => { shell.closeAll(); wm.focus(w); } },
      el('div', { class: 'tv-h' }, el('span', { html: icon(w.app.icon || w.app.id, 18) }), el('b', null, w.title), el('button', { class: 'wbtn', html: glyph('close', 14), onclick: (e) => { e.stopPropagation(); wm.close(w); setTimeout(() => shell.build_taskview(), 200); } })),
      el('div', { class: 'tv-prev' }, el('span', { html: icon(w.app.icon || w.app.id, 64) })))) : el('div', { class: 'tv-empty' }, t('Нет открытых окон', 'No open windows'))));
  };
  $('#taskview').addEventListener('click', (e) => { if (e.target.id === 'taskview' || e.target.classList.contains('tv-grid')) shell.closeAll(); });

  /* ---------- desktop icons ---------- */
  let selIcon = null;
  function renderIcons() {
    const box = $('#icons'); box.innerHTML = '';
    const items = [
      { n: t('Этот компьютер', 'This PC'), i: 'thispc', open: () => wm.open('explorer', { path: '/' }) },
      { n: t('Корзина', 'Recycle Bin'), i: 'recycle', open: () => wm.open('explorer', { path: fs.RB }) },
      { n: W12.apps.browser.name(), i: 'browser', open: () => wm.open('browser') },
      { n: W12.apps.notepad.name(), i: 'notepad', open: () => wm.open('notepad') },
    ];
    fs.list('/Desktop').forEach((f) => items.push({ n: f.name, i: f.type === 'dir' ? 'folder' : W12.iconForFile(f.name), path: f.path, open: () => (f.type === 'dir' ? wm.open('explorer', { path: f.path }) : W12.openFile(f.path)) }));
    items.forEach((it) => {
      const b = el('div', { class: 'dicon', tabindex: '0', onclick: (e) => { e.stopPropagation(); $$('.dicon.sel').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); selIcon = it; }, ondblclick: () => it.open(),
        oncontextmenu: (e) => { e.preventDefault(); e.stopPropagation(); b.click(); W12.ctx(e.clientX, e.clientY, [{ label: t('Открыть', 'Open'), action: it.open }, it.path ? { label: t('Удалить', 'Delete'), danger: true, action: () => fs.rm(it.path) } : null]); } },
      el('span', { html: icon(it.i, 44) }), el('small', null, it.n));
      box.append(b);
    });
  }
  W12.on('fs', () => renderIcons());
  $('#desktop').addEventListener('click', () => { $$('.dicon.sel').forEach((x) => x.classList.remove('sel')); selIcon = null; });
  $('#desktop').addEventListener('contextmenu', (e) => {
    if (e.target.closest('.win,.dicon')) return; e.preventDefault();
    const mk = (dir) => async () => {
      const n = await W12.prompt(dir ? t('Имя папки', 'Folder name') : t('Имя файла', 'File name'), fs.unique('/Desktop', dir ? t('Новая папка', 'New folder') : t('Новый текстовый документ.txt', 'New Text Document.txt')));
      if (n) (dir ? fs.mkdir : (p) => fs.write(p, ''))(fs.join('/Desktop', n));
    };
    W12.ctx(e.clientX, e.clientY, [
      { label: t('Обновить', 'Refresh'), action: renderIcons }, { sep: 1 },
      { label: t('Создать папку', 'New folder'), action: mk(true) }, { label: t('Создать текстовый документ', 'New text document'), action: mk(false) }, { sep: 1 },
      { label: t('Открыть терминал', 'Open Terminal'), action: () => wm.open('terminal') },
      { label: t('Персонализация', 'Personalize'), action: () => wm.open('settings', { page: 'personalization' }) },
      { label: t('Параметры экрана', 'Display settings'), action: () => wm.open('settings', { page: 'display' }) }]);
  });

  /* ---------- lock / boot / power ---------- */
  shell.lock = () => { shell.closeAll(); const l = $('#lock'); l.classList.remove('gone', 'login'); l.classList.add('show'); };
  shell.unlock = () => { $('#lock').classList.add('gone'); setTimeout(() => $('#lock').classList.remove('show'), 500); sessionStorage.setItem('w12.booted', '1'); };
  shell.power = (restart) => {
    if (restart) { sessionStorage.removeItem('w12.booted'); location.reload(); return; }
    shell.closeAll(); $('#off').classList.add('show');
  };
  function buildLock() {
    const l = $('#lock');
    l.append(el('div', { id: 'lock-bg' }), el('div', { class: 'lock-time' }, el('b', { class: 'c-time' }), el('span', { class: 'c-date' })),
      el('div', { class: 'lock-hint' }, t('Нажмите, чтобы продолжить', 'Click or press any key to continue')),
      el('div', { class: 'lock-login' }, el('div', { class: 'avatar big', html: glyph('user', 44) }), el('h2', { id: 'lk-name' }), el('button', { class: 'btn primary', onclick: () => shell.unlock() }, t('Войти', 'Sign in'))));
    l.addEventListener('click', () => { if (!l.classList.contains('login')) { l.classList.add('login'); $('#lk-name').textContent = S().user; } });
    $('#off').addEventListener('click', () => { sessionStorage.removeItem('w12.booted'); location.reload(); });
    document.addEventListener('keydown', (e) => {
      if (l.classList.contains('show') && !l.classList.contains('gone')) { if (!l.classList.contains('login')) { l.classList.add('login'); $('#lk-name').textContent = S().user; } else if (e.key === 'Enter') shell.unlock(); }
    });
  }

  /* ---------- keyboard shortcuts (Alt + key ≈ Win + key) ---------- */
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.code.replace('Key', '').replace('Digit', '').toLowerCase();
    const map = { s: () => shell.toggle('start'), a: () => shell.toggle('quick'), n: () => shell.toggle('calendar'), w: () => shell.toggle('widgets'), t: () => shell.toggle('taskview'),
      e: () => wm.open('explorer'), i: () => wm.open('settings'), m: () => wm.showDesktop(), l: () => shell.lock(), q: () => wm.active && wm.close(wm.active) };
    if (map[k]) { e.preventDefault(); map[k](); }
    else if (/^[1-9]$/.test(k) && S().pinned[+k - 1]) { e.preventDefault(); wm.open(S().pinned[+k - 1]); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'Delete' && selIcon && selIcon.path) fs.rm(selIcon.path);
    if (e.key === 'Enter' && selIcon) selIcon.open();
  });

  /* ---------- init ---------- */
  shell.init = () => {
    document.body.prepend(el('div', { html: W12.iconDefs }));
    buildTaskbar(); buildLock(); renderTaskbar(); renderIcons(); shell.applyTheme(); shell.tick();
    setInterval(shell.tick, 1000);
    const booted = sessionStorage.getItem('w12.booted');
    const boot = $('#boot');
    if (booted) { boot.remove(); $('#lock').classList.add('gone'); return; }
    $('#lock').classList.add('show');
    setTimeout(() => { boot.classList.add('gone'); setTimeout(() => boot.remove(), 600); }, 1700);
    W12.notify(t('Добро пожаловать!', 'Welcome!'), t('Нажмите Alt+S, чтобы открыть «Пуск».', 'Press Alt+S to open Start.'), 'ok');
  };
})();

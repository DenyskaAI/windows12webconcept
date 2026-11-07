/* Apps: Paint, Task Manager, Photos, Clock */
(function () {
  'use strict';
  const W12 = window.W12; const { el, t, fs, glyph, icon } = W12;

  /* ---------------- Paint ---------------- */
  W12.registerApp({
    id: 'paint', icon: 'paint', w: 920, h: 620, keys: 'paint рисование рисовать draw',
    name: () => t('Paint', 'Paint'),
    create(win, args) {
      const cv = el('canvas', { width: 1200, height: 800, class: 'pt-cv' }); const g = cv.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
      let tool = 'pencil', color = '#000000', size = 4; const undo = [], redo = [];
      const snap = () => { undo.push(g.getImageData(0, 0, cv.width, cv.height)); if (undo.length > 25) undo.shift(); redo.length = 0; };
      const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) * cv.width) / r.width, y: ((e.clientY - r.top) * cv.height) / r.height }; };
      const fill = (sx, sy) => {
        const img = g.getImageData(0, 0, cv.width, cv.height); const d = new Uint32Array(img.data.buffer); const w = cv.width, h = cv.height;
        const c = document.createElement('canvas').getContext('2d'); c.fillStyle = color; c.fillRect(0, 0, 1, 1); const b = c.getImageData(0, 0, 1, 1).data; const nc = (255 << 24) | (b[2] << 16) | (b[1] << 8) | b[0];
        const target = d[sy * w + sx]; if (target === nc) return; const st = [[sx, sy]];
        while (st.length) { const [x, y] = st.pop(); if (x < 0 || y < 0 || x >= w || y >= h || d[y * w + x] !== target) continue; d[y * w + x] = nc; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]); }
        g.putImageData(img, 0, 0);
      };
      let drawing = false, start = null, base = null;
      cv.addEventListener('pointerdown', (e) => {
        const p = pos(e); snap();
        if (tool === 'fill') return fill(Math.floor(p.x), Math.floor(p.y));
        drawing = true; start = p; base = g.getImageData(0, 0, cv.width, cv.height); cv.setPointerCapture(e.pointerId);
        g.lineCap = g.lineJoin = 'round'; g.lineWidth = size; g.strokeStyle = tool === 'eraser' ? '#fff' : color; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + 0.01, p.y); g.stroke();
      });
      cv.addEventListener('pointermove', (e) => {
        if (!drawing) return; const p = pos(e);
        if (tool === 'pencil' || tool === 'eraser') { g.lineTo(p.x, p.y); g.stroke(); return; }
        g.putImageData(base, 0, 0); g.beginPath();
        if (tool === 'line') { g.moveTo(start.x, start.y); g.lineTo(p.x, p.y); }
        else if (tool === 'rect') g.rect(start.x, start.y, p.x - start.x, p.y - start.y);
        else g.ellipse((start.x + p.x) / 2, (start.y + p.y) / 2, Math.abs(p.x - start.x) / 2, Math.abs(p.y - start.y) / 2, 0, 0, 7);
        g.stroke();
      });
      const end = () => { drawing = false; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      const restore = (from, to) => { if (!from.length) return; to.push(g.getImageData(0, 0, cv.width, cv.height)); g.putImageData(from.pop(), 0, 0); };
      const tools = [['pencil', '✏️', t('Карандаш', 'Pencil')], ['eraser', '🧽', t('Ластик', 'Eraser')], ['line', '╱', t('Линия', 'Line')], ['rect', '▭', t('Прямоугольник', 'Rectangle')], ['ellipse', '◯', t('Эллипс', 'Ellipse')], ['fill', '🪣', t('Заливка', 'Fill')]];
      const tb = el('div', { class: 'pt-bar' });
      const btns = tools.map(([id, ic, n]) => el('button', { class: 'btn ghost' + (id === tool ? ' on' : ''), title: n, onclick: () => { tool = id; btns.forEach((b, i) => b.classList.toggle('on', tools[i][0] === id)); } }, ic));
      const col = el('input', { type: 'color', value: color, oninput: (e) => (color = e.target.value), class: 'pt-col' });
      const sz = el('input', { type: 'range', min: 1, max: 40, value: size, oninput: (e) => (size = +e.target.value), style: { width: '110px' } });
      const save = async () => { const p = await W12.filePicker({ mode: 'save', path: '/Pictures', name: 'Drawing.png' }); if (p) { fs.write(p.match(/\.\w+$/) ? p : p + '.png', cv.toDataURL('image/png')); W12.notify('Paint', t('Сохранено: ', 'Saved: ') + p, 'ok'); } };
      tb.append(...btns, col, sz,
        el('button', { class: 'btn ghost', title: 'Undo', html: glyph('undo', 16), onclick: () => restore(undo, redo) }), el('button', { class: 'btn ghost', title: 'Redo', html: glyph('redo', 16), onclick: () => restore(redo, undo) }),
        el('button', { class: 'btn ghost', title: t('Очистить', 'Clear'), html: glyph('trash', 16), onclick: () => { snap(); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); } }),
        el('span', { style: { flex: 1 } }), el('button', { class: 'btn', onclick: save, html: glyph('save', 16) + ' ' + t('Сохранить', 'Save') }),
        el('button', { class: 'btn ghost', title: t('Скачать', 'Download'), html: glyph('download', 16), onclick: () => W12.download('drawing.png', cv.toDataURL()) }));
      const loadImg = (p) => { const c = fs.read(p); if (!c || !c.startsWith('data:')) return; const im = new Image(); im.onload = () => { g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(im, 0, 0); }; im.src = c; };
      win.onArgs = (a) => a && a.path && loadImg(a.path); if (args && args.path) loadImg(args.path);
      win.body.append(el('div', { class: 'pt' }, tb, el('div', { class: 'pt-wrap' }, cv)));
    },
  });

  /* ---------------- Task Manager ---------------- */
  W12.registerApp({
    id: 'taskmgr', icon: 'taskmgr', w: 680, h: 500, single: true, keys: 'диспетчер задач task manager процессы',
    name: () => t('Диспетчер задач', 'Task Manager'),
    create(win) {
      let selId = null; const hist = Array(60).fill(0); const cpu = {};
      const cv = el('canvas', { width: 640, height: 110, class: 'tm-cv' }); const g = cv.getContext('2d');
      const table = el('div', { class: 'tm-table' });
      const tick = () => {
        const rows = W12.wm.list().map((w) => { cpu[w.id] = Math.max(0, Math.min(40, (cpu[w.id] || 2) + (Math.random() - 0.5) * 3)); return { id: w.id, name: w.title, ic: w.app.icon || w.app.id, cpu: cpu[w.id], mem: 40 + (w.id.length * 7) % 90 + cpu[w.id] * 2, win: w }; });
        const sys = [['System', 1.5, 120], ['Desktop Window Manager', 2.2, 85], ['Shell Experience Host', 0.8, 60]].map(([n, c, m]) => ({ name: n, ic: 'settings', cpu: c + Math.random(), mem: m, sys: true }));
        const all = rows.concat(sys); const total = Math.min(100, all.reduce((s, r) => s + r.cpu, 0)); hist.push(total); hist.shift();
        table.innerHTML = '';
        table.append(el('div', { class: 'tm-r head' }, el('span', null, t('Имя', 'Name')), el('span', null, 'CPU'), el('span', null, t('Память', 'Memory'))));
        all.forEach((r) => table.append(el('div', { class: 'tm-r' + (r.id && r.id === selId ? ' sel' : ''), onclick: () => { selId = r.id || null; } }, el('span', { class: 'tm-n' }, el('i', { html: icon(r.ic, 16) }), r.name), el('span', null, r.cpu.toFixed(1) + '%'), el('span', null, r.mem.toFixed(0) + ' MB'))));
        g.clearRect(0, 0, 640, 110); g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent'); g.lineWidth = 2; g.beginPath();
        hist.forEach((v, i) => { const x = (i / 59) * 640, y = 105 - v; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
        end.disabled = !selId;
      };
      const end = el('button', { class: 'btn', onclick: () => { const w = W12.wm.wins.get(selId); if (w) W12.wm.close(w, true); selId = null; } }, t('Снять задачу', 'End task'));
      const iv = setInterval(tick, 1000); win.onClose = () => clearInterval(iv);
      win.body.append(el('div', { class: 'tm' }, el('div', { class: 'tm-top' }, el('b', null, t('Загрузка ЦП', 'CPU usage')), end), cv, table)); tick();
    },
  });

  /* ---------------- Photos ---------------- */
  W12.registerApp({
    id: 'photos', icon: 'photos', w: 860, h: 580, keys: 'фото photos изображения картинки gallery галерея',
    name: () => t('Фотографии', 'Photos'),
    create(win, args) {
      const grid = el('div', { class: 'ph-grid' }); let viewer = null;
      const all = () => W12.wallpapers.map((w) => ({ id: w.id, css: w.css, name: w.name })).concat(fs.list('/Pictures').filter((f) => f.type === 'file' && W12.isImage(f.name) && (fs.read(f.path) || '').startsWith('data:')).map((f) => ({ id: 'file:' + f.path, css: 'center / contain no-repeat url("' + fs.read(f.path) + '")', name: f.name, path: f.path })));
      const show = (i) => {
        const list = all(); i = (i + list.length) % list.length; const it = list[i]; if (viewer) viewer.remove();
        viewer = el('div', { class: 'ph-view' }, el('div', { class: 'ph-img', style: { background: it.css } }),
          el('div', { class: 'ph-ctl' }, el('button', { class: 'btn', html: glyph('chevLeft', 16), onclick: () => show(i - 1) }), el('b', null, it.name), el('button', { class: 'btn', onclick: () => { W12.set({ wallpaper: it.id }); W12.notify(t('Фон изменён', 'Background changed'), it.name, 'ok'); } }, t('Сделать фоном', 'Set as background')),
            it.path ? el('button', { class: 'btn', onclick: () => W12.wm.open('paint', { path: it.path }) }, 'Paint') : null, el('button', { class: 'btn', html: glyph('chevRight', 16), onclick: () => show(i + 1) }), el('button', { class: 'btn', onclick: () => { viewer.remove(); viewer = null; } }, '✕')));
        win.body.append(viewer);
      };
      const render = () => { grid.innerHTML = ''; all().forEach((it, i) => grid.append(el('button', { class: 'ph-t', style: { background: it.css }, title: it.name, onclick: () => show(i) }))); };
      const fl = W12.on('fs', render); win.onClose = () => W12.off('fs', fl);
      win.onArgs = (a) => { if (a && a.path) { const i = all().findIndex((x) => x.path === a.path); if (i >= 0) show(i); } };
      win.body.append(el('div', { class: 'ph' }, grid)); render(); if (args && args.path) win.onArgs(args);
    },
  });

  /* ---------------- Clock ---------------- */
  W12.registerApp({
    id: 'clock', icon: 'clock', w: 440, h: 520, single: true, keys: 'часы clock таймер timer секундомер stopwatch',
    name: () => t('Часы', 'Clock'),
    create(win) {
      let tab = 'timer'; const body = el('div', { class: 'ck-body' }); let iv = null;
      const stop = () => { clearInterval(iv); iv = null; }; win.onClose = stop;
      const fmt = (ms, cs) => { const s = Math.floor(ms / 1000); return W12.pad(Math.floor(s / 3600)) + ':' + W12.pad(Math.floor(s / 60) % 60) + ':' + W12.pad(s % 60) + (cs ? '.' + W12.pad(Math.floor((ms % 1000) / 10)) : ''); };
      const tabs = { timer: t('Таймер', 'Timer'), stopwatch: t('Секундомер', 'Stopwatch'), world: t('Мировое время', 'World clock') };
      const views = {
        timer() {
          const inp = (v, max) => el('input', { class: 'input', type: 'number', min: 0, max, value: v, style: { width: '64px', textAlign: 'center', fontSize: '22px' } });
          const h = inp(0, 99), m = inp(5, 59), s = inp(0, 59); const disp = el('div', { class: 'ck-big' }, '00:05:00'); let left = 0, endAt = 0, running = false;
          const btn = el('button', { class: 'btn primary', onclick: () => {
            if (running) { running = false; stop(); btn.textContent = t('Старт', 'Start'); left = endAt - Date.now(); return; }
            if (!left) left = ((+h.value * 60 + +m.value) * 60 + +s.value) * 1000; if (left <= 0) return;
            endAt = Date.now() + left; running = true; btn.textContent = t('Пауза', 'Pause');
            iv = setInterval(() => { const r = endAt - Date.now(); if (r <= 0) { stop(); running = false; left = 0; disp.textContent = '00:00:00'; btn.textContent = t('Старт', 'Start'); W12.beep(); W12.notify(t('Таймер', 'Timer'), t('Время вышло!', "Time's up!"), 'ok'); } else disp.textContent = fmt(r + 999); }, 200);
          } }, t('Старт', 'Start'));
          const reset = el('button', { class: 'btn', onclick: () => { stop(); running = false; left = 0; btn.textContent = t('Старт', 'Start'); disp.textContent = fmt(((+h.value * 60 + +m.value) * 60 + +s.value) * 1000); } }, t('Сброс', 'Reset'));
          body.append(disp, el('div', { class: 'ck-in' }, h, ':', m, ':', s), el('div', { class: 'ck-btns' }, btn, reset));
        },
        stopwatch() {
          let acc = 0, t0 = 0, running = false; const disp = el('div', { class: 'ck-big' }, '00:00:00.00'); const laps = el('div', { class: 'ck-laps' });
          const btn = el('button', { class: 'btn primary', onclick: () => { if (running) { running = false; acc += Date.now() - t0; stop(); btn.textContent = t('Старт', 'Start'); } else { running = true; t0 = Date.now(); btn.textContent = t('Стоп', 'Stop'); iv = setInterval(() => (disp.textContent = fmt(acc + Date.now() - t0, 1)), 40); } } }, t('Старт', 'Start'));
          body.append(disp, el('div', { class: 'ck-btns' }, btn, el('button', { class: 'btn', onclick: () => running && laps.prepend(el('div', null, '#' + (laps.children.length + 1) + '  ' + disp.textContent)) }, t('Круг', 'Lap')), el('button', { class: 'btn', onclick: () => { stop(); running = false; acc = 0; disp.textContent = '00:00:00.00'; btn.textContent = t('Старт', 'Start'); laps.innerHTML = ''; } }, t('Сброс', 'Reset'))), laps);
        },
        world() {
          const zones = [['Local', undefined], ['UTC', 'UTC'], ['London', 'Europe/London'], ['Moscow', 'Europe/Moscow'], ['Dubai', 'Asia/Dubai'], ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'], ['New York', 'America/New_York'], ['Los Angeles', 'America/Los_Angeles']];
          const rows = zones.map(([n, z]) => { const v = el('b'); body.append(el('div', { class: 'ck-zone' }, el('span', null, n), v)); return () => (v.textContent = new Date().toLocaleTimeString(W12.state.lang, { timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !W12.state.clock24 })); });
          const up = () => rows.forEach((f) => f()); up(); iv = setInterval(up, 1000);
        },
      };
      const render = () => { stop(); body.innerHTML = ''; views[tab](); head.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === tab)); };
      const head = el('div', { class: 'ck-tabs' }, Object.keys(tabs).map((k) => el('button', { class: 'btn ghost', dataset: { k }, onclick: () => { tab = k; render(); } }, tabs[k])));
      win.body.append(el('div', { class: 'ck' }, head, body)); render();
    },
  });
})();

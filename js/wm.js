/* Windows 12 Web Concept — window manager: drag, resize, snap, min/max, focus */
(function () {
  'use strict';
  const W12 = window.W12; const { el, $, t } = W12;
  const wins = new Map(); let z = 100; let active = null; let cascade = 0;
  const wm = (W12.wm = { wins, list: () => [...wins.values()], get active() { return active; } });
  const host = () => $('#windows');
  const area = () => ({ w: innerWidth, h: innerHeight - W12.TB });
  const apply = (w) => { const r = w.rect; Object.assign(w.el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }); };
  wm.byApp = (id) => wm.list().filter((w) => w.app.id === id);

  function topVisible() {
    return wm.list().filter((w) => !w.min).sort((a, b) => b.z - a.z)[0] || null;
  }
  function updateBody() { document.body.classList.toggle('has-max', !!(active && active.max && !active.min)); }

  wm.open = (appId, args) => {
    const app = W12.apps[appId];
    if (!app) return null;
    if (app.single) { const ex = wm.byApp(appId)[0]; if (ex) { wm.focus(ex); ex.onArgs && ex.onArgs(args); return ex; } }
    const A = area();
    const w = Math.min(app.w || 760, A.w - 16), h = Math.min(app.h || 520, A.h - 16);
    const off = (cascade++ % 6) * 28;
    const win = { id: W12.uid(), app, args, rect: { x: Math.max(8, (A.w - w) / 2 - 70 + off), y: Math.max(8, (A.h - h) / 2 - 50 + off), w, h }, max: false, min: false, snapped: null, z: 0 };
    win.body = el('div', { class: 'win-body', tabindex: '-1' });
    win.titleEl = el('span', { class: 'win-title-text' });
    win.setTitle = (s) => { win.titleEl.textContent = s; win.title = s; W12.emit('wm'); };
    const resizable = app.resizable !== false;
    const btn = (cls, g, fn, title) => el('button', { class: 'wbtn ' + cls, title, html: W12.glyph(g, 14), onclick: (e) => { e.stopPropagation(); fn(); }, onpointerdown: (e) => e.stopPropagation() });
    win.maxBtn = btn('wmax', 'max', () => wm.toggleMax(win), t('Развернуть', 'Maximize'));
    const titlebar = el('div', { class: 'win-title', ondblclick: (e) => { if (resizable && !e.target.closest('.win-actions')) wm.toggleMax(win); } },
      el('span', { class: 'win-ico', html: W12.icon(app.icon || appId, 16) }), win.titleEl,
      el('div', { class: 'win-actions' }, btn('wmin', 'min', () => wm.minimize(win), t('Свернуть', 'Minimize')), resizable ? win.maxBtn : null, btn('wclose', 'close', () => wm.close(win), t('Закрыть', 'Close'))));
    win.el = el('div', { class: 'win opening', dataset: { app: appId }, onpointerdown: () => wm.focus(win) }, titlebar, win.body,
      resizable ? ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => el('div', { class: 'rz rz-' + d, onpointerdown: (e) => startResize(win, d, e) })) : null);
    win.titleEl.textContent = win.title = typeof app.name === 'function' ? app.name() : appId;
    titlebar.addEventListener('pointerdown', (e) => startDrag(win, e));
    apply(win);
    host().append(win.el);
    wins.set(win.id, win);
    try { app.create(win, args); } catch (e) { console.error(e); }
    setTimeout(() => win.el.classList.remove('opening'), 220);
    if (innerWidth < 720 && resizable) wm.toggleMax(win);
    wm.focus(win);
    return win;
  };

  wm.focus = (win) => {
    if (win.min) { win.min = false; win.el.classList.remove('min'); }
    if (active === win && win.z === z) return;
    win.z = ++z; win.el.style.zIndex = win.z;
    if (active && active !== win) active.el.classList.remove('active');
    active = win; win.el.classList.add('active');
    updateBody(); W12.emit('wm');
    win.onFocus && win.onFocus();
  };
  wm.minimize = (win) => {
    win.min = true; win.el.classList.add('min'); win.el.classList.remove('active');
    if (active === win) { active = null; const n = topVisible(); if (n) wm.focus(n); }
    updateBody(); W12.emit('wm');
  };
  wm.close = async (win, force) => {
    if (!force && win.beforeClose && !(await win.beforeClose())) return;
    win.onClose && win.onClose();
    wins.delete(win.id); win.el.classList.add('closing');
    setTimeout(() => win.el.remove(), 170);
    if (active === win) { active = null; const n = topVisible(); if (n) wm.focus(n); }
    updateBody(); W12.emit('wm');
  };
  wm.toggleMax = (win) => {
    if (win.app.resizable === false) return;
    if (win.max) {
      win.max = false; win.el.classList.remove('max');
      if (win.prev) { win.rect = { ...win.prev }; win.snapped = null; }
    } else {
      if (!win.snapped) win.prev = { ...win.rect };
      win.max = true; win.el.classList.add('max');
    }
    win.maxBtn.innerHTML = W12.glyph(win.max ? 'restore' : 'max', 14);
    apply(win); updateBody(); win.onResize && win.onResize();
  };
  wm.snap = (win, side) => {
    const A = area();
    if (!win.snapped && !win.max) win.prev = { ...win.rect };
    win.max = false; win.el.classList.remove('max'); win.snapped = side;
    win.rect = { x: side === 'left' ? 0 : A.w / 2, y: 0, w: A.w / 2, h: A.h };
    apply(win); win.onResize && win.onResize();
  };
  let hidden = [];
  wm.showDesktop = () => {
    const vis = wm.list().filter((w) => !w.min);
    if (vis.length) { hidden = vis; vis.forEach((w) => wm.minimize(w)); }
    else { hidden.filter((w) => wins.has(w.id)).forEach((w) => wm.focus(w)); hidden = []; }
  };
  wm.closeAll = () => wm.list().forEach((w) => wm.close(w, true));

  function startDrag(win, e) {
    if (e.button !== 0 || e.target.closest('.win-actions')) return;
    wm.focus(win);
    let r = { ...win.rect }; let offX = e.clientX - r.x, offY = e.clientY - r.y; let moved = false; let snap = null;
    const prev = $('#snap-preview');
    const mv = (ev) => {
      if (!moved) {
        if (Math.abs(ev.clientX - e.clientX) + Math.abs(ev.clientY - e.clientY) < 5) return;
        moved = true; host().classList.add('dragging');
        if ((win.max || win.snapped) && win.prev) {
          const ratio = e.clientX / innerWidth;
          win.max = false; win.el.classList.remove('max'); win.snapped = null; win.rect = { ...win.prev };
          win.maxBtn.innerHTML = W12.glyph('max', 14);
          offX = win.rect.w * ratio; offY = 18; win.onResize && win.onResize();
        }
      }
      win.rect.x = ev.clientX - offX; win.rect.y = Math.max(0, ev.clientY - offY); apply(win);
      const A = area();
      snap = ev.clientX <= 3 ? 'left' : ev.clientX >= innerWidth - 4 ? 'right' : ev.clientY <= 3 && win.app.resizable !== false ? 'max' : null;
      if (snap) {
        const p = snap === 'left' ? [0, 0, A.w / 2] : snap === 'right' ? [A.w / 2, 0, A.w / 2] : [0, 0, A.w];
        Object.assign(prev.style, { left: p[0] + 'px', top: '0px', width: p[2] + 'px', height: A.h + 'px' }); prev.classList.add('show');
      } else prev.classList.remove('show');
    };
    const up = () => {
      removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
      host().classList.remove('dragging'); prev.classList.remove('show');
      if (moved && snap) { if (snap === 'max') { win.prev = { ...win.rect }; wm.toggleMax(win); } else wm.snap(win, snap); }
    };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  }

  function startResize(win, dir, e) {
    e.preventDefault(); e.stopPropagation(); wm.focus(win);
    if (win.max) return;
    const sx = e.clientX, sy = e.clientY, r = { ...win.rect }; const minW = win.app.minW || 340, minH = win.app.minH || 240;
    host().classList.add('dragging');
    const mv = (ev) => {
      let { x, y, w, h } = r; const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (dir.includes('e')) w = Math.max(minW, r.w + dx);
      if (dir.includes('s')) h = Math.max(minH, r.h + dy);
      if (dir.includes('w')) { w = Math.max(minW, r.w - dx); x = r.x + r.w - w; }
      if (dir.includes('n')) { h = Math.max(minH, r.h - dy); y = Math.max(0, r.y + r.h - h); }
      win.rect = { x, y, w, h }; win.snapped = null; apply(win); win.onResize && win.onResize();
    };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); host().classList.remove('dragging'); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  }

  addEventListener('resize', () => wm.list().forEach((w) => { if (w.snapped) wm.snap(w, w.snapped); }));
})();

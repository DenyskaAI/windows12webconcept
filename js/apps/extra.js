/* Apps: Browser, Assistant, Snake */
(function () {
  'use strict';
  const W12 = window.W12; const { el, t, glyph } = W12;

  /* ---------------- Browser ---------------- */
  const homeDoc = () => `<!doctype html><meta charset=utf-8><body style="margin:0;font-family:Segoe UI,system-ui,sans-serif;background:linear-gradient(135deg,#0b1030,#1d3a8a);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh">
<h1 style="font-weight:300;font-size:40px;margin:0 0 20px">Windows 12 Browser</h1>
<form onsubmit="parent.postMessage({w12:'go',q:q.value},'*');return false"><input id=q autofocus placeholder="${t('Введите адрес или запрос', 'Enter address or search')}" style="width:min(520px,80vw);padding:14px 20px;border-radius:99px;border:0;font-size:16px;outline:0"></form>
<div style="display:flex;gap:14px;margin-top:28px;flex-wrap:wrap;justify-content:center">${['example.com', 'openstreetmap.org', 'wikipedia.org', 'github.com'].map((s) => `<a href=# onclick="parent.postMessage({w12:'go',q:'${s}'},'*');return false" style="color:#fff;text-decoration:none;background:rgba(255,255,255,.14);padding:10px 18px;border-radius:12px">${s}</a>`).join('')}</div></body>`;
  W12.registerApp({
    id: 'browser', icon: 'browser', w: 960, h: 600, keys: 'браузер browser internet интернет edge',
    name: () => t('Браузер', 'Browser'),
    create(win) {
      const hist = ['about:home']; let hi = 0;
      const frame = el('iframe', { class: 'br-frame', sandbox: 'allow-scripts allow-forms allow-popups allow-same-origin' });
      const addr = el('input', { class: 'input br-addr', spellcheck: 'false', placeholder: t('Адрес или поиск', 'Address or search') });
      const note = el('div', { class: 'br-note' }, t('Многие сайты запрещают встраивание (X-Frame-Options). ', 'Many sites forbid embedding (X-Frame-Options). '), el('button', { class: 'link', onclick: () => addr.value && window.open(addr.value.startsWith('http') ? addr.value : 'https://' + addr.value, '_blank', 'noopener') }, t('Открыть во вкладке браузера ↗', 'Open in a real tab ↗')), el('button', { class: 'link', onclick: () => note.remove() }, '✕'));
      const load = (u) => {
        if (u === 'about:home') { frame.removeAttribute('src'); frame.setAttribute('sandbox', 'allow-scripts'); frame.srcdoc = homeDoc(); addr.value = ''; win.setTitle(t('Новая вкладка', 'New tab') + ' — ' + t('Браузер', 'Browser')); return; }
        frame.removeAttribute('srcdoc'); frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-same-origin'); frame.src = u; addr.value = u; win.setTitle(u.replace(/^https?:\/\//, '') + ' — ' + t('Браузер', 'Browser'));
      };
      const go = (q, push = true) => {
        q = (q || '').trim(); if (!q) return;
        let u = q;
        if (q !== 'about:home') {
          if (/^https?:\/\//i.test(q)) u = q;
          else if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(q)) u = 'https://' + q;
          else { window.open('https://duckduckgo.com/?q=' + encodeURIComponent(q), '_blank', 'noopener'); return; }
        }
        if (push) { hist.splice(hi + 1); hist.push(u); hi = hist.length - 1; }
        load(u);
      };
      const msg = (e) => { if (e.source === frame.contentWindow && e.data && e.data.w12 === 'go') go(e.data.q); };
      addEventListener('message', msg); win.onClose = () => removeEventListener('message', msg);
      addr.addEventListener('keydown', (e) => e.key === 'Enter' && go(addr.value));
      const b = (g, f) => el('button', { class: 'btn ghost', html: glyph(g, 16), onclick: f });
      win.body.append(el('div', { class: 'br' }, el('div', { class: 'br-bar' }, b('back', () => hi > 0 && load(hist[--hi])), b('forward', () => hi < hist.length - 1 && load(hist[++hi])), b('refresh', () => load(hist[hi])), b('home', () => go('about:home')), addr), note, frame));
      load('about:home');
    },
  });

  /* ---------------- Assistant ---------------- */
  W12.registerApp({
    id: 'assistant', icon: 'assistant', w: 420, h: 580, minW: 340, single: true, keys: 'ассистент assistant ai ии copilot помощник',
    name: () => t('Ассистент', 'Assistant'),
    create(win, args) {
      const log = el('div', { class: 'as-log' });
      const say = (txt, me) => { log.append(el('div', { class: 'as-msg ' + (me ? 'me' : 'bot') }, txt)); log.scrollTop = log.scrollHeight; };
      const appByWord = (s) => Object.values(W12.apps).find((a) => (a.name() + ' ' + a.id + ' ' + (a.keys || '')).toLowerCase().split(/\s+/).some((w) => w.length > 2 && s.includes(w)));
      const jokes = [t('Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 = Dec 25.', 'Why do programmers mix up Halloween and Christmas? Because Oct 31 = Dec 25.'), t('Windows 12 вышла! Ой, это просто сайт.', 'Windows 12 is out! Oh wait, it is just a website.')];
      const reply = async (q) => {
        if (W12.assistantHandler) { try { return await W12.assistantHandler(q); } catch (e) { return String(e); } }
        const s = q.toLowerCase();
        let m;
        if ((m = s.match(/(?:открой|запусти|open|launch|start)\s+(.+)/))) { const a = appByWord(m[1]); if (a) { W12.wm.open(a.id); return t('Открываю: ', 'Opening: ') + a.name(); } }
        if (/закрой все|close all/.test(s)) { W12.wm.closeAll(); return t('Все окна закрыты.', 'All windows closed.'); }
        if (/тёмн|темн|dark/.test(s)) { W12.set({ theme: 'dark' }); return t('Тёмная тема включена.', 'Dark mode on.'); }
        if (/светл|light/.test(s)) { W12.set({ theme: 'light' }); return t('Светлая тема включена.', 'Light mode on.'); }
        if ((m = s.match(/(?:громкость|volume)\s*(\d+)/))) { W12.set({ volume: Math.min(100, +m[1]) }); return t('Громкость: ', 'Volume: ') + Math.min(100, +m[1]) + '%'; }
        if (/врем|час|time/.test(s)) return new Date().toLocaleTimeString();
        if (/дат|число|date|today|сегодня/.test(s)) return new Date().toLocaleDateString(W12.state.lang, { dateStyle: 'full' });
        if (/шутк|joke/.test(s)) return jokes[Math.floor(Math.random() * jokes.length)];
        if (/погод|weather/.test(s)) return t('Сейчас +18°C, облачно (демо-данные).', 'It is 18°C and cloudy right now (demo data).');
        if (/привет|hello|hi\b|здравств/.test(s)) return t('Привет, ' + W12.state.user + '! Чем помочь?', 'Hi ' + W12.state.user + '! How can I help?');
        const expr = s.replace(/посчитай|сколько будет|calculate|calc|=|\?/g, '').replace(/,/g, '.').replace(/\^/g, '**').trim();
        if (expr && /^[\d\s+\-*/().%]+$/.test(expr) && /\d/.test(expr)) { try { return '= ' + Function('"use strict";return (' + expr + ')')(); } catch (e) { /* fallthrough */ } }
        return t('Я локальный демо-ассистент: умею открывать приложения, менять тему/громкость, считать и шутить. Подключить настоящую ИИ-модель можно через W12.assistantHandler (см. README).', 'I am a local demo assistant: I can open apps, change theme/volume, calculate and joke. Plug in a real AI via W12.assistantHandler (see README).');
      };
      const ask = async (q) => { q = q.trim(); if (!q) return; say(q, true); const typing = el('div', { class: 'as-msg bot' }, '…'); log.append(typing); const r = await reply(q); await new Promise((r2) => setTimeout(r2, 350)); typing.remove(); say(r); };
      const inp = el('input', { class: 'input', placeholder: t('Спросите что-нибудь…', 'Ask me anything…'), onkeydown: (e) => { if (e.key === 'Enter') { ask(inp.value); inp.value = ''; } } });
      const chips = [t('Открой блокнот', 'Open notepad'), t('Какая сегодня дата?', "What's the date?"), t('Светлая тема', 'Light theme'), '12*(3+4)', t('Расскажи шутку', 'Tell a joke')];
      win.onArgs = (a) => a && a.q && ask(a.q);
      win.body.append(el('div', { class: 'as' }, log, el('div', { class: 'as-chips' }, chips.map((c) => el('button', { class: 'chip', onclick: () => ask(c) }, c))), el('div', { class: 'as-in' }, inp, el('button', { class: 'btn primary', html: glyph('send', 16), onclick: () => { ask(inp.value); inp.value = ''; } }))));
      say(t('Привет! Я ассистент Windows 12. Что сделать?', 'Hi! I am the Windows 12 assistant. What can I do?'));
      if (args && args.q) ask(args.q); setTimeout(() => inp.focus(), 60);
    },
  });

  /* ---------------- Snake ---------------- */
  W12.registerApp({
    id: 'snake', icon: 'snake', w: 460, h: 540, resizable: false, keys: 'змейка snake игра game',
    name: () => t('Змейка', 'Snake'),
    create(win) {
      const N = 20, C = 22; const cv = el('canvas', { width: N * C, height: N * C, class: 'sn-cv' }); const g = cv.getContext('2d');
      const info = el('div', { class: 'sn-info' }); let best = W12.ls.get('w12.snake', 0);
      let snake, dir, nd, food, score, timer, over;
      const spawn = () => { do food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; while (snake.some((s) => s.x === food.x && s.y === food.y)); };
      const reset = () => { snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; dir = nd = { x: 1, y: 0 }; score = 0; over = false; spawn(); clearInterval(timer); timer = setInterval(step, 110); draw(); };
      const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0078d4';
      function step() {
        dir = nd; const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some((s) => s.x === h.x && s.y === h.y)) { over = true; clearInterval(timer); if (score > best) { best = score; W12.ls.set('w12.snake', best); } draw(); return; }
        snake.unshift(h); if (h.x === food.x && h.y === food.y) { score++; spawn(); } else snake.pop(); draw();
      }
      function draw() {
        g.fillStyle = '#12141a'; g.fillRect(0, 0, N * C, N * C);
        g.fillStyle = '#ff5a6e'; g.beginPath(); g.arc(food.x * C + C / 2, food.y * C + C / 2, C / 2 - 3, 0, 7); g.fill();
        g.fillStyle = accent(); snake.forEach((s, i) => { g.globalAlpha = i ? 0.85 : 1; g.fillRect(s.x * C + 1, s.y * C + 1, C - 2, C - 2); }); g.globalAlpha = 1;
        info.textContent = t('Счёт: ', 'Score: ') + score + '   ' + t('Рекорд: ', 'Best: ') + best + (over ? '   ' + t('Игра окончена — пробел для рестарта', 'Game over — press Space') : '');
      }
      win.body.addEventListener('keydown', (e) => {
        const m = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] }[e.key];
        if (m) { e.preventDefault(); if (m[0] !== -dir.x || m[1] !== -dir.y) nd = { x: m[0], y: m[1] }; }
        else if (e.key === ' ') { e.preventDefault(); reset(); }
      });
      win.onClose = () => clearInterval(timer);
      win.body.append(el('div', { class: 'sn' }, info, cv)); reset(); win.body.focus(); cv.addEventListener('click', () => win.body.focus());
    },
  });
})();

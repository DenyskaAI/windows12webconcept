/* ==========================================================================
   Windows 12 Web Concept — icons
   App icons are inline SVG (gradients live in one global <defs> block),
   UI glyphs are stroke-based and inherit currentColor.
   ========================================================================== */
(function () {
  'use strict';
  const W12 = window.W12;

  const grad = (id, a, b) => `<linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  W12.iconDefs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    grad('blue', '#58c8ff', '#0b63c8') + grad('yellow', '#ffd966', '#f0a500') + grad('green', '#5fe38a', '#0b8a3a') +
    grad('red', '#ff8080', '#d13438') + grad('purple', '#c3a0ff', '#6b3fd4') + grad('gray', '#55565c', '#1d1e22') +
    grad('orange', '#ffb84d', '#f2651b') + grad('teal', '#46e6d0', '#0a7e8c') + grad('pink', '#ff9bd5', '#8a3fe0') +
    grad('silver', '#f1f3f6', '#8d96a3') + grad('sky', '#8fe0ff', '#2f7bff') +
    '</defs></svg>';

  const ICONS = {
    explorer: '<path d="M4 12a4 4 0 0 1 4-4h10l5 5h17a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#g-yellow)"/><path d="M4 21h40v16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#ffe28f" opacity=".92"/>',
    notepad: '<rect x="8" y="4" width="32" height="40" rx="5" fill="url(#g-blue)"/><rect x="8" y="4" width="32" height="8" rx="4" fill="#0a4fa8" opacity=".55"/><rect x="14" y="19" width="20" height="2.6" rx="1.3" fill="#fff"/><rect x="14" y="26" width="20" height="2.6" rx="1.3" fill="#fff" opacity=".85"/><rect x="14" y="33" width="12" height="2.6" rx="1.3" fill="#fff" opacity=".7"/>',
    calculator: '<rect x="7" y="4" width="34" height="40" rx="6" fill="url(#g-gray)" stroke="#6b6d75" stroke-width=".8"/><rect x="11.5" y="9" width="25" height="8.5" rx="2.5" fill="#8fe6a4"/><g fill="#fff" opacity=".9"><circle cx="15.5" cy="25" r="2.6"/><circle cx="24" cy="25" r="2.6"/><circle cx="32.5" cy="25" r="2.6"/><circle cx="15.5" cy="32" r="2.6"/><circle cx="24" cy="32" r="2.6"/><circle cx="15.5" cy="39" r="2.6"/><circle cx="24" cy="39" r="2.6"/></g><circle cx="32.5" cy="32" r="2.6" fill="#58c8ff"/><rect x="29.9" y="36.4" width="5.2" height="5" rx="2.4" fill="#58c8ff"/>',
    settings: '<circle cx="24" cy="24" r="16.5" fill="none" stroke="#aab3bf" stroke-width="6.5" stroke-dasharray="5.18 5.18" transform="rotate(8 24 24)"/><circle cx="24" cy="24" r="13" fill="url(#g-silver)"/><circle cx="24" cy="24" r="5.5" fill="#2b2f36"/>',
    browser: '<circle cx="24" cy="24" r="20" fill="url(#g-sky)"/><g fill="none" stroke="#fff" stroke-width="2" opacity=".85"><ellipse cx="24" cy="24" rx="8.5" ry="20"/><path d="M4 24h40M7 14h34M7 34h34"/></g>',
    terminal: '<rect x="4" y="7" width="40" height="34" rx="6" fill="#17181c" stroke="#55575f"/><rect x="4" y="7" width="40" height="8" rx="6" fill="#2c2e35"/><path d="M12 22l7 5-7 5" fill="none" stroke="#7df09a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 33h13" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
    paint: '<path d="M24 4C12 4 4 12.5 4 23c0 10 7.5 19 18.5 19 3.5 0 4.5-2.2 3.4-4.5-1.4-3 .2-5.5 3.6-5.5H36c5 0 8-3 8-7.5C44 11 35 4 24 4z" fill="#f4dfb8" stroke="#c9a56a"/><circle cx="14" cy="19" r="3.4" fill="#ff4d4d"/><circle cx="23" cy="12.5" r="3.4" fill="#ffd23d"/><circle cx="33" cy="15" r="3.4" fill="#47d16c"/><circle cx="36.5" cy="25" r="3.4" fill="#3d8bff"/><circle cx="14" cy="29" r="3.4" fill="#b46bff"/>',
    taskmgr: '<rect x="4" y="6" width="40" height="36" rx="6" fill="url(#g-green)"/><path d="M9 31l7-9 6 5 8-12 9 10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
    photos: '<rect x="4" y="7" width="40" height="34" rx="6" fill="url(#g-teal)"/><circle cx="33" cy="17" r="4.5" fill="#ffe27a"/><path d="M4 35l12-14 9 10 6-6 13 13v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="#fff" opacity=".92"/>',
    clock: '<circle cx="24" cy="24" r="20" fill="url(#g-purple)"/><circle cx="24" cy="24" r="15.5" fill="#fff"/><path d="M24 14v10.5l7 4.2" fill="none" stroke="#5b34c2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    assistant: '<rect x="4" y="4" width="40" height="40" rx="12" fill="url(#g-pink)"/><path d="M23 9c1.4 8.2 5 12.2 13.2 14C28 25 24.4 29 23 37c-1.4-8-5-12-13-14 8-1.8 11.6-5.8 13-14z" fill="#fff"/><path d="M36 28c.5 3 1.8 4.4 4.6 5-2.8.6-4.1 2-4.6 5-.5-3-1.8-4.4-4.6-5 2.8-.6 4.1-2 4.6-5z" fill="#fff" opacity=".85"/>',
    snake: '<rect x="4" y="4" width="40" height="40" rx="10" fill="url(#g-green)"/><path d="M12 35h14a6.5 6.5 0 0 0 0-13H21a4 4 0 0 1 0-8h14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="14" r="2" fill="#0b4a1f"/><circle cx="36" cy="14" r="5" fill="none" stroke="#ff5a5a" stroke-width="0"/>',
    thispc: '<rect x="5" y="8" width="38" height="25" rx="3.5" fill="url(#g-blue)"/><rect x="8" y="11" width="32" height="19" rx="1.5" fill="#0c2b66" opacity=".55"/><path d="M24 33v5" stroke="#9aa3ae" stroke-width="3"/><rect x="14" y="38" width="20" height="3.5" rx="1.75" fill="#b9c1cc"/>',
    recycle: '<rect x="9" y="9" width="30" height="4.5" rx="2.25" fill="#9cc7f2"/><rect x="19" y="5" width="10" height="5" rx="2" fill="#7fb1e6"/><path d="M12 15h24l-2 26a3 3 0 0 1-3 2.8H17a3 3 0 0 1-3-2.8z" fill="#d3e9ff" stroke="#7aa7d6"/><path d="M20 21v15M24 21v15M28 21v15" stroke="#7aa7d6" stroke-width="1.8" stroke-linecap="round"/>',
    folder: '<path d="M4 12a4 4 0 0 1 4-4h10l5 5h17a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="url(#g-yellow)"/><path d="M4 21h40v16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#ffe28f" opacity=".92"/>',
    file: '<path d="M12 4h17l10 10v28a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#f7f8fa" stroke="#bfc4cc"/><path d="M29 4v10h10z" fill="#dfe3e9" stroke="#bfc4cc"/><path d="M16 24h16M16 30h16M16 36h10" stroke="#aab1bb" stroke-width="2" stroke-linecap="round"/>',
    image: '<rect x="6" y="8" width="36" height="32" rx="4" fill="#e8f6ff" stroke="#9fc9e6"/><circle cx="31" cy="18" r="4" fill="#ffcf4d"/><path d="M6 34l10-11 8 8 5-5 13 13v1a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#5bbf8a"/>',
    start: '<rect x="2" y="2" width="9.6" height="9.6" rx="1.8" fill="url(#g-sky)"/><rect x="12.4" y="2" width="9.6" height="9.6" rx="1.8" fill="url(#g-sky)"/><rect x="2" y="12.4" width="9.6" height="9.6" rx="1.8" fill="url(#g-sky)"/><rect x="12.4" y="12.4" width="9.6" height="9.6" rx="1.8" fill="url(#g-sky)"/>',
  };
  const VB = { start: '0 0 24 24' };

  /** App / file icon as SVG markup */
  W12.icon = (name, size) => {
    const s = size || 32;
    const body = ICONS[name] || ICONS.file;
    return `<svg class="ico-svg" width="${s}" height="${s}" viewBox="${VB[name] || '0 0 48 48'}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  };

  const G = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    taskview: '<rect x="3" y="5" width="14" height="11" rx="2.5"/><path d="M8 19.5h9a4 4 0 0 0 4-4V9"/>',
    widgets: '<rect x="3" y="3" width="8" height="8" rx="2.2"/><rect x="13" y="3" width="8" height="8" rx="2.2"/><rect x="3" y="13" width="8" height="8" rx="2.2"/><rect x="13" y="13" width="8" height="8" rx="2.2"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.7 16a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19.4" r="1.1" fill="currentColor"/>',
    bluetooth: '<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path d="M18 6.5a8 8 0 0 1 0 11"/>',
    battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><path d="M22 10.5v3"/><rect x="5" y="9.5" width="9" height="5" rx="1" fill="currentColor"/>',
    power: '<path d="M12 3v9"/><path d="M6.5 6.5a8 8 0 1 0 11 0"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    forward: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevUp: '<path d="M6 15l6-6 6 6"/>',
    chevDown: '<path d="M6 9l6 6 6-6"/>',
    chevLeft: '<path d="M15 6l-6 6 6 6"/>',
    chevRight: '<path d="M9 6l6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    plane: '<path d="M21 15.5v-2L13.5 9V4.5a1.5 1.5 0 0 0-3 0V9L3 13.5v2l7.5-2v4l-2 1.5v1.5l3.5-1 3.5 1V19l-2-1.5v-4z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    min: '<path d="M5 12h14"/>',
    max: '<rect x="5.5" y="5.5" width="13" height="13" rx="2"/>',
    restore: '<rect x="4.5" y="8.5" width="11" height="11" rx="2"/><path d="M8.5 8.5v-3a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3"/>',
    close: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.8" cy="6" r="1" fill="currentColor"/><circle cx="3.8" cy="12" r="1" fill="currentColor"/><circle cx="3.8" cy="18" r="1" fill="currentColor"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="currentColor"/>',
    warn: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v5"/><circle cx="12" cy="17.6" r=".9" fill="currentColor"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
    newfolder: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.5h7A2.5 2.5 0 0 1 21 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><path d="M12 10.5v6M9 13.5h6"/>',
    sparkle: '<path d="M12 3c.8 5 3 7.5 8 8.5-5 1-7.2 3.5-8 8.5-.8-5-3-7.5-8-8.5 5-1 7.2-3.5 8-8.5z"/>',
    send: '<path d="M3 11.5L21 3l-6.5 18-3-7.5z"/><path d="M11.5 13.5L21 3"/>',
    save: '<path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    download: '<path d="M12 4v11M7 10.5l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V5M7 9.5l5-5 5 5M4 20h16"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  };
  /** UI glyph (stroke, inherits color) */
  W12.glyph = (name, size) => {
    const s = size || 18;
    return `<svg class="glyph" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${G[name] || ''}</svg>`;
  };
})();

/* Apps: File Explorer + Notepad */
(function () {
  'use strict';
  const W12 = window.W12; const { el, t, fs, glyph, icon } = W12;

  /* ---------------- File Explorer ---------------- */
  W12.registerApp({
    id: 'explorer', icon: 'explorer', w: 900, h: 570, keys: 'files проводник файлы explorer',
    name: () => t('Проводник', 'File Explorer'),
    create(win, args) {
      let path = (args && args.path) || '/Documents'; const hist = [path]; let hi = 0;
      let view = W12.ls.get('w12.view', 'grid'); const sel = new Set(); let filter = '';
      const RB = fs.RB;
      const places = [['/Desktop', t('Рабочий стол', 'Desktop')], ['/Documents', t('Документы', 'Documents')], ['/Downloads', t('Загрузки', 'Downloads')], ['/Pictures', t('Изображения', 'Pictures')], ['/Music', t('Музыка', 'Music')], ['/Videos', t('Видео', 'Videos')], ['/', t('Этот компьютер', 'This PC')], [RB, t('Корзина', 'Recycle Bin')]];
      const label = (p) => (p === '/' ? t('Этот компьютер', 'This PC') : p === RB ? t('Корзина', 'Recycle Bin') : fs.base(p));
      const crumbs = el('div', { class: 'fx-crumbs' });
      const main = el('div', { class: 'fx-main', tabindex: '0' });
      const status = el('div', { class: 'fx-status' });
      const side = el('div', { class: 'fx-side' });
      const search = el('input', { class: 'input fx-search', placeholder: t('Поиск', 'Search'), oninput: (e) => { filter = e.target.value.toLowerCase(); render(); } });
      const nav = (g, title, fn) => el('button', { class: 'btn ghost', title, html: glyph(g, 16), onclick: fn });
      const items = () => {
        if (path === RB) return fs.trash().map((x) => ({ name: x.name, type: x.node.t === 'd' ? 'dir' : 'file', size: x.node.t === 'f' ? x.node.c.length : 0, mtime: x.at, id: x.id, path: x.id }));
        return fs.list(path);
      };
      const go = (p, push = true) => { path = p; sel.clear(); if (push) { hist.splice(hi + 1); hist.push(p); hi = hist.length - 1; } render(); };
      const open = (it) => { if (path === RB) return; it.type === 'dir' ? go(it.path) : W12.openFile(it.path); };
      const act = {
        async newFolder() { const n = await W12.prompt(t('Имя папки', 'Folder name'), fs.unique(path, t('Новая папка', 'New folder'))); if (n) fs.mkdir(fs.join(path, n)) || W12.alert(t('Не удалось создать папку.', 'Could not create folder.')); },
        async newFile() { const n = await W12.prompt(t('Имя файла', 'File name'), fs.unique(path, t('Новый текстовый документ.txt', 'New Text Document.txt'))); if (n) fs.write(fs.join(path, n), '') || W12.alert(t('Не удалось создать файл.', 'Could not create file.')); },
        async rename(it) { const n = await W12.prompt(t('Новое имя', 'New name'), it.name); if (n && n !== it.name && !fs.mv(it.path, fs.join(path, n))) W12.alert(t('Не удалось переименовать.', 'Could not rename.')); },
        del(its) { its.forEach((i) => (path === RB ? fs.purge(i.id) : fs.rm(i.path))); },
        copy(its, cut) { W12.clip = { cut, paths: its.map((i) => i.path) }; },
        paste() {
          const c = W12.clip; if (!c) return;
          c.paths.forEach((p) => { const nm = fs.unique(path, fs.base(p)); c.cut ? fs.mv(p, fs.join(path, nm)) : fs.cp(p, fs.join(path, nm)); });
          if (c.cut) W12.clip = null;
        },
        upload() {
          const inp = el('input', { type: 'file', multiple: true });
          inp.onchange = () => [...inp.files].forEach((f) => {
            const r = new FileReader(); const img = f.type.startsWith('image/');
            r.onload = () => fs.write(fs.join(path, fs.unique(path, f.name)), r.result);
            img ? r.readAsDataURL(f) : r.readAsText(f);
          });
          inp.click();
        },
      };
      const selected = () => items().filter((i) => sel.has(i.path));
      function menuFor(it, e) {
        e.preventDefault(); e.stopPropagation();
        if (!sel.has(it.path)) { sel.clear(); sel.add(it.path); render(); }
        const its = selected();
        if (path === RB) return W12.ctx(e.clientX, e.clientY, [{ label: t('Восстановить', 'Restore'), action: () => its.forEach((i) => fs.restore(i.id)) }, { label: t('Удалить навсегда', 'Delete permanently'), danger: true, action: () => act.del(its) }]);
        W12.ctx(e.clientX, e.clientY, [
          { label: t('Открыть', 'Open'), action: () => open(it) }, { sep: 1 },
          { label: t('Копировать', 'Copy'), action: () => act.copy(its, false) }, { label: t('Вырезать', 'Cut'), action: () => act.copy(its, true) },
          { label: t('Переименовать', 'Rename'), hint: 'F2', action: () => act.rename(it) },
          it.type === 'file' ? { label: t('Скачать', 'Download'), action: () => W12.download(it.name, fs.read(it.path)) } : null,
          { label: t('Удалить', 'Delete'), hint: 'Del', danger: true, action: () => act.del(its) }]);
      }
      function render() {
        crumbs.innerHTML = '';
        const parts = path === RB ? [] : path.split('/').filter(Boolean);
        crumbs.append(el('button', { class: 'crumb', onclick: () => go('/') }, t('Этот компьютер', 'This PC')));
        if (path === RB) crumbs.append(el('span', null, '›'), el('button', { class: 'crumb' }, label(RB)));
        parts.forEach((s, i) => crumbs.append(el('span', null, '›'), el('button', { class: 'crumb', onclick: () => go('/' + parts.slice(0, i + 1).join('/')) }, s)));
        side.innerHTML = '';
        places.forEach(([p, n]) => side.append(el('button', { class: 'side-item' + (p === path ? ' on' : ''), onclick: () => go(p) }, el('span', { html: icon(p === '/' ? 'thispc' : p === RB ? 'recycle' : 'folder', 18) }), n)));
        main.innerHTML = ''; main.className = 'fx-main ' + view;
        let list = items(); if (filter) list = list.filter((i) => i.name.toLowerCase().includes(filter));
        if (view === 'list') main.append(el('div', { class: 'fx-item head' }, el('span'), el('span', { class: 'fi-name' }, t('Имя', 'Name')), el('span', { class: 'fi-date' }, t('Изменён', 'Modified')), el('span', { class: 'fi-size' }, t('Размер', 'Size'))));
        list.forEach((it) => main.append(el('div', {
          class: 'fx-item' + (sel.has(it.path) ? ' sel' : ''),
          onclick: (e) => { e.stopPropagation(); if (!(e.ctrlKey || e.metaKey)) sel.clear(); sel.has(it.path) && (e.ctrlKey || e.metaKey) ? sel.delete(it.path) : sel.add(it.path); render(); main.focus(); },
          ondblclick: () => open(it), oncontextmenu: (e) => menuFor(it, e),
        }, el('span', { class: 'fi-ico', html: icon(it.type === 'dir' ? 'folder' : W12.iconForFile(it.name), view === 'grid' ? 44 : 20) }), el('span', { class: 'fi-name' }, it.name), el('span', { class: 'fi-date' }, W12.fmtDate(it.mtime)), el('span', { class: 'fi-size' }, it.type === 'file' ? W12.fmtSize(it.size) : ''))));
        if (!list.length) main.append(el('div', { class: 'fx-empty' }, t('Здесь пусто', 'This folder is empty')));
        status.textContent = list.length + t(' элементов', ' items') + (sel.size ? ' · ' + t('выбрано: ', 'selected: ') + sel.size : '');
        win.setTitle(label(path) + ' — ' + t('Проводник', 'File Explorer'));
      }
      main.addEventListener('click', () => { sel.clear(); render(); });
      main.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        W12.ctx(e.clientX, e.clientY, path === RB ? [{ label: t('Очистить корзину', 'Empty Recycle Bin'), action: () => fs.emptyTrash() }] : [
          { label: t('Создать папку', 'New folder'), action: act.newFolder }, { label: t('Создать текстовый документ', 'New text document'), action: act.newFile },
          { label: t('Вставить', 'Paste'), disabled: !W12.clip, action: act.paste }, { label: t('Обновить', 'Refresh'), action: render }]);
      });
      main.addEventListener('keydown', (e) => {
        const its = selected();
        if (e.key === 'Delete' && its.length) act.del(its);
        else if (e.key === 'F2' && its[0]) act.rename(its[0]);
        else if (e.key === 'Enter' && its[0]) open(its[0]);
        else if ((e.ctrlKey || e.metaKey) && e.key === 'c') act.copy(its, false);
        else if ((e.ctrlKey || e.metaKey) && e.key === 'x') act.copy(its, true);
        else if ((e.ctrlKey || e.metaKey) && e.key === 'v') act.paste();
        else if ((e.ctrlKey || e.metaKey) && e.key === 'a') { e.preventDefault(); items().forEach((i) => sel.add(i.path)); render(); }
      });
      const fsl = W12.on('fs', render); win.onClose = () => W12.off('fs', fsl);
      win.onArgs = (a) => a && a.path && go(a.path);
      const viewBtn = el('button', { class: 'btn ghost', title: t('Вид', 'View'), onclick: () => { view = view === 'grid' ? 'list' : 'grid'; W12.ls.set('w12.view', view); viewBtn.innerHTML = glyph(view === 'grid' ? 'list' : 'grid', 16); render(); }, html: glyph(view === 'grid' ? 'list' : 'grid', 16) });
      win.body.append(el('div', { class: 'fx' },
        el('div', { class: 'fx-bar' }, nav('back', t('Назад', 'Back'), () => { if (hi > 0) { hi--; go(hist[hi], false); } }), nav('forward', t('Вперёд', 'Forward'), () => { if (hi < hist.length - 1) { hi++; go(hist[hi], false); } }),
          nav('up', t('Вверх', 'Up'), () => path !== '/' && go(path === RB ? '/' : fs.parent(path).dirPath)), crumbs, search),
        el('div', { class: 'fx-cmd' }, el('button', { class: 'btn ghost', onclick: act.newFolder, html: glyph('newfolder', 16) + ' ' + t('Создать', 'New') }), el('button', { class: 'btn ghost', onclick: act.upload, html: glyph('upload', 16) + ' ' + t('Загрузить', 'Upload') }),
          el('button', { class: 'btn ghost', onclick: () => { const i = selected(); i.length && act.del(i); }, html: glyph('trash', 16) }), viewBtn),
        el('div', { class: 'fx-wrap' }, side, main), status));
      render();
    },
  });

  /* ---------------- Notepad ---------------- */
  W12.registerApp({
    id: 'notepad', icon: 'notepad', w: 700, h: 480, keys: 'блокнот notepad text editor текст',
    name: () => t('Блокнот', 'Notepad'),
    create(win, args) {
      let path = (args && args.path) || null; let dirty = false; let wrap = true;
      const ta = el('textarea', { class: 'np-text', spellcheck: 'false' });
      const status = el('div', { class: 'np-status' });
      const title = () => win.setTitle((dirty ? '*' : '') + (path ? fs.base(path) : t('Без имени', 'Untitled')) + ' — ' + t('Блокнот', 'Notepad'));
      const stat = () => { const v = ta.value.slice(0, ta.selectionStart).split('\n'); status.textContent = t('Стр ', 'Ln ') + v.length + t(', Стлб ', ', Col ') + (v[v.length - 1].length + 1) + ' · ' + ta.value.length + t(' симв.', ' chars'); };
      const load = (p) => { const c = fs.read(p); path = p; ta.value = c && !c.startsWith('data:') ? c : ''; dirty = false; title(); stat(); };
      const save = async (as) => {
        if (!path || as) { const p = await W12.filePicker({ mode: 'save', name: path ? fs.base(path) : 'Untitled.txt' }); if (!p) return false; path = p; }
        const ok = fs.write(path, ta.value); if (ok) { dirty = false; title(); } else W12.alert(t('Не удалось сохранить файл.', 'Could not save file.'));
        return ok;
      };
      win.beforeClose = async () => {
        if (!dirty) return true;
        const r = await W12.dialog({ title: t('Блокнот', 'Notepad'), message: t('Сохранить изменения?', 'Save changes?'), buttons: [{ label: t('Сохранить', 'Save'), value: 'save', primary: true }, { label: t('Не сохранять', "Don't save"), value: 'no' }, { label: t('Отмена', 'Cancel'), value: 'cancel', cancel: true }] });
        return r === 'no' ? true : r === 'save' ? save() : false;
      };
      const menu = (label, items) => el('button', { class: 'btn ghost', onclick: (e) => W12.menuAt(e.currentTarget, items) }, label);
      const bar = el('div', { class: 'np-bar' },
        menu(t('Файл', 'File'), [
          { label: t('Новый', 'New'), action: () => wm_new() }, { label: t('Открыть…', 'Open…'), action: async () => { const p = await W12.filePicker({ mode: 'open' }); p && load(p); } },
          { label: t('Сохранить', 'Save'), hint: 'Ctrl+S', action: () => save() }, { label: t('Сохранить как…', 'Save as…'), action: () => save(true) },
          { label: t('Скачать', 'Download'), action: () => W12.download(path ? fs.base(path) : 'Untitled.txt', ta.value) }]),
        menu(t('Правка', 'Edit'), [{ label: t('Выделить всё', 'Select all'), action: () => { ta.focus(); ta.select(); } }, { label: t('Время и дата', 'Time and date'), action: () => { ta.setRangeText(new Date().toLocaleString(), ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); } }]),
        menu(t('Вид', 'View'), [{ label: t('Перенос по словам', 'Word wrap'), action: () => { wrap = !wrap; ta.style.whiteSpace = wrap ? 'pre-wrap' : 'pre'; } }, { label: t('Крупнее', 'Zoom in'), action: () => (ta.style.fontSize = parseInt(getComputedStyle(ta).fontSize, 10) + 2 + 'px') }, { label: t('Мельче', 'Zoom out'), action: () => (ta.style.fontSize = Math.max(8, parseInt(getComputedStyle(ta).fontSize, 10) - 2) + 'px') }]));
      const wm_new = () => W12.wm.open('notepad');
      ta.addEventListener('input', () => { dirty = true; title(); stat(); });
      ta.addEventListener('keyup', stat); ta.addEventListener('click', stat);
      ta.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
        if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
      });
      win.onArgs = (a) => a && a.path && load(a.path);
      win.body.append(el('div', { class: 'np' }, bar, ta, status));
      path ? load(path) : (title(), stat());
      setTimeout(() => ta.focus(), 50);
    },
  });
})();

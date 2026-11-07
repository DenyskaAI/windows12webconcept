# Windows 12 — Web Concept

Неофициальный фан-концепт рабочего стола «Windows 12», который целиком работает в браузере.
Чистые HTML/CSS/JS — без сборки и зависимостей. *Не связан с Microsoft.*

Unofficial fan concept of a "Windows 12" desktop running entirely in the browser. Vanilla HTML/CSS/JS, no build step.

## Возможности / Features
- Загрузка, экран блокировки, вход
- Плавающая панель задач, меню «Пуск» с поиском (приложения, настройки, файлы)
- Окна: перетаскивание, изменение размера, сворачивание, привязка к краям (snap)
- Быстрые настройки, календарь + уведомления, виджеты, представление задач
- Виртуальная файловая система в `localStorage` + корзина
- Приложения: Проводник, Блокнот, Калькулятор, Параметры, Терминал, Браузер, Ассистент, Paint, Диспетчер задач, Фотографии, Часы, Змейка
- Тёмная/светлая тема, акцентные цвета, обои, русский и английский языки

## Запуск / Run
Откройте `index.html` в браузере или `python3 -m http.server` и перейдите на `localhost:8000`.

**GitHub Pages:** Settings → Pages → Source: *GitHub Actions* (workflow уже в `.github/workflows/pages.yml`) или Deploy from branch `main` / root.

## Горячие клавиши (Alt = Win)
`Alt+S` Пуск · `Alt+A` быстрые настройки · `Alt+N` календарь · `Alt+W` виджеты · `Alt+T` задачи · `Alt+E` проводник · `Alt+I` параметры · `Alt+M` рабочий стол · `Alt+L` блокировка · `Alt+Q` закрыть окно · `Alt+1…9` закреплённые приложения

## Свои приложения / Add an app
```js
W12.registerApp({
  id: 'hello', icon: 'notepad', name: () => 'Hello', w: 400, h: 300,
  create(win) { win.body.textContent = 'Hello, Windows 12!'; }
});
```
Добавьте файл в `index.html` перед `js/shell.js`. Иконка — ключ из `js/icons.js`.

## Реальный ИИ в ассистенте
```js
W12.assistantHandler = async (q) => (await fetch('/api/chat', {method:'POST', body:q})).text();
```

## Структура
```
index.html  css/style.css
js/core.js (состояние, ФС, диалоги)  js/icons.js  js/wm.js (окна)  js/shell.js (оболочка)
js/apps/*.js  js/main.js
```

MIT License

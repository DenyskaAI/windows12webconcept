/* Windows 12 Web Concept — entry point */
(function () {
  'use strict';
  const start = () => window.W12.shell.init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

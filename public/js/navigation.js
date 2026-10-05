(function () {
  'use strict';
  var button = document.querySelector('.studio-menu');
  var nav = document.querySelector('.studio-links');
  if (!button || !nav) return;
  function close(restoreFocus) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', function () {
    var open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', function (event) { if (event.target.closest('a')) close(false); });
  document.addEventListener('pointerdown', function (event) { if (!event.target.closest('.studio-nav')) close(false); });
  document.addEventListener('focusin', function (event) { if (!event.target.closest('.studio-nav')) close(false); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') close(true);
  });
  matchMedia('(min-width: 901px)').addEventListener('change', function () { close(false); });
  var page = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a:not(.studio-pill)').forEach(function (link) {
    var url = new URL(link.href);
    if (url.pathname.split('/').pop() === page && !url.hash) link.setAttribute('aria-current', 'page');
  });
})();

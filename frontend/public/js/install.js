/* Installable app: registers the offline worker (sw.js) and asks once, politely, to install.
 * Chrome, Edge and Android get a real Install button (beforeinstallprompt); Safari on iPhone, iPad
 * and Mac has no install API, so it gets one line of instructions. Never shown when already
 * installed, and "Not now" hides it for 14 days. The page renderer skips it on the editor and checkout. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(function () {});

  var KEY = 'mz-install-dismissed', WAIT = 14 * 864e5, deferred = null, shown = false;
  var installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var snoozed = false;
  try { snoozed = Date.now() - Number(localStorage.getItem(KEY) || 0) < WAIT; } catch (e) { snoozed = false; }
  if (installed || snoozed) return;

  var ua = navigator.userAgent, invite = /\/invite\.html/.test(location.pathname);
  var iOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var safari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|Edg\//.test(ua);
  var what = invite ? 'Save this invitation' : 'Get the momentsiz app';
  var why = invite ? 'Open it in one tap, even without signal.' : 'Create and share invitations in one tap, right from your home screen.';

  function show(text, canInstall) {
    if (shown) return;
    shown = true;
    var bar = document.createElement('aside');
    bar.className = 'mz-install'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-labelledby', 'mz-install-title');
    bar.innerHTML = '<img src="/assets/momentsiz-icon-192.png" alt="" width="44" height="44">' +
      '<div><strong id="mz-install-title"></strong><span></span></div>' +
      '<div class="mz-install-actions">' + (canInstall ? '<button type="button" class="mz-install-go">Install</button>' : '') +
      '<button type="button" class="mz-install-later">' + (canInstall ? 'Not now' : 'Got it') + '</button></div>';
    bar.querySelector('strong').textContent = what;
    bar.querySelector('span').textContent = text;
    function close(snooze) {
      if (snooze) try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* private mode: ask again next visit */ }
      bar.classList.remove('is-in'); setTimeout(function () { bar.remove(); }, 250);
    }
    bar.querySelector('.mz-install-later').addEventListener('click', function () { close(true); });
    if (canInstall) bar.querySelector('.mz-install-go').addEventListener('click', function () {
      deferred.prompt();
      deferred.userChoice.then(function (choice) { close(choice.outcome !== 'accepted'); deferred = null; });
    });
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('is-in'); });
  }

  // Chromium browsers: hold their own mini-infobar and ask at a calmer moment, after the page has settled.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    setTimeout(function () { if (deferred) show(why, true); }, 4000);
  });
  window.addEventListener('appinstalled', function () { var bar = document.querySelector('.mz-install'); if (bar) bar.remove(); });

  if (safari) setTimeout(function () {
    show(iOS ? 'Tap the Share button, then “Add to Home Screen”.' : 'In Safari, choose File › Add to Dock.', false);
  }, 4000);
})();

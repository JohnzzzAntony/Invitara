/* Homepage: live invitation previews in the device mockups and the occasion-filtered design row. */
(function () {
  'use strict';
  var E = window, grid = document.getElementById('home-designs');
  var PAGES = { wedding: 'wedding-invitations', engagement: 'engagement-invitations', birthday: 'birthday-invitations', baby: 'baby-shower-invitations', anniversary: 'anniversary-invitations' };
  var FEATURED = ['edition-vow', 'edition-petal', 'edition-postmark', 'edition-orbit', 'edition-archive', 'edition-universe'];

  document.querySelectorAll('[data-mini]').forEach(function (host) {
    var t = E.EVER_findTemplate && E.EVER_findTemplate(host.dataset.mini);
    if (!t) return;
    var mini = E.EVER_renderSiteMini(t);
    mini.setAttribute('aria-hidden', 'true'); mini.inert = true;
    host.appendChild(mini);
  });

  if (!grid) return;
  function unavailable() {
    grid.innerHTML = '<p class="home-loading">We couldn’t load the designs. <a href="create.html">Browse all invitations</a>.</p>';
  }
  if (!E.INVITARA_availableTemplates || !E.INVITARA_CARDS || !E.INVITARA_CATALOG) { unavailable(); return; }

  function explore(occasion) {
    var a = document.createElement('a');
    a.className = 'home-explore-card';
    a.href = PAGES[occasion] || 'create.html';
    a.innerHTML = '<span>Explore</span><strong>' + E.EVER_esc(E.INVITARA_CATALOG.label(occasion)) + ' invitations</strong><b aria-hidden="true">→</b>';
    return a;
  }
  function render(occasion) {
    try {
      grid.querySelectorAll('.ex-mini').forEach(function (el) { if (el.__dispose) el.__dispose(); });
      grid.replaceChildren();
      var all = E.INVITARA_availableTemplates();
      var list = occasion === 'all'
        ? FEATURED.map(function (id) { return all.find(function (t) { return t.id === id; }); }).filter(Boolean)
        : all.filter(function (t) { return t.occasion === occasion; });
      list.slice(0, 6).forEach(function (t) { grid.appendChild(E.INVITARA_CARDS.card(t)); });
      if (occasion !== 'all') grid.appendChild(explore(occasion));
    } catch (_) { unavailable(); }
  }
  document.querySelectorAll('.home-tabs [data-occasion]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.home-tabs [data-occasion]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      render(button.dataset.occasion);
    });
  });
  render('all');
})();

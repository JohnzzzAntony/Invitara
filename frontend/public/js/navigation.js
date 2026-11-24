(function () {
  'use strict';
  // Footer link groups become accordions on phones; desktop keeps plain headings and open columns.
  // Built from the server-rendered links, so without JavaScript every link stays visible.
  var footerGroups = Array.prototype.slice.call(document.querySelectorAll('.studio-footer .footer-column'));
  if (footerGroups.length) {
    var phone = matchMedia('(max-width: 767px)');
    var groups = footerGroups.map(function (column) {
      var heading = column.querySelector('.footer-heading');
      var panel = column.querySelector('.footer-links');
      return heading && panel ? { column: column, heading: heading, panel: panel, label: heading.textContent.trim() } : null;
    }).filter(Boolean);
    var setOpen = function (group, open) {
      group.column.classList.toggle('is-open', open);
      group.panel.inert = !open;
      var toggle = group.heading.querySelector('.footer-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
    };
    var applyFooterMode = function () {
      groups.forEach(function (group) {
        if (phone.matches) {
          if (group.heading.querySelector('.footer-toggle')) return;
          var toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.className = 'footer-toggle';
          toggle.setAttribute('aria-controls', group.panel.id);
          toggle.innerHTML = '<span></span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
          toggle.firstChild.textContent = group.label;
          toggle.addEventListener('click', function () { setOpen(group, !group.column.classList.contains('is-open')); });
          group.heading.replaceChildren(toggle);
          group.column.classList.add('is-accordion');
          setOpen(group, false);
        } else {
          group.heading.textContent = group.label;
          group.column.classList.remove('is-accordion', 'is-open');
          group.panel.inert = false;
        }
      });
    };
    applyFooterMode();
    phone.addEventListener('change', applyFooterMode);
  }
  var button = document.querySelector('.studio-menu');
  var nav = document.querySelector('.studio-links');
  if (!button || !nav) return;
  var previousOverflow = '';
  function close(restoreFocus) {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
    document.body.style.overflow = previousOverflow;
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', function () {
    var open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
    if (open) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = previousOverflow;
  });
  nav.addEventListener('click', function (event) { if (event.target.closest('a')) close(false); });
  document.addEventListener('pointerdown', function (event) { if (!event.target.closest('.studio-nav')) close(false); });
  document.addEventListener('focusin', function (event) { if (!event.target.closest('.studio-nav')) close(false); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') close(true);
    if (event.key === 'Tab' && button.getAttribute('aria-expanded') === 'true') {
      var links = Array.from(nav.querySelectorAll('a[href], button:not(:disabled)'));
      var first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); button.focus(); }
      else if (!event.shiftKey && document.activeElement === button) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === button) { event.preventDefault(); last.focus(); }
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', function () { close(false); });
  var page = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a:not(.studio-pill)').forEach(function (link) {
    var url = new URL(link.href);
    if (url.pathname.split('/').pop() === page && !url.hash) link.setAttribute('aria-current', 'page');
  });
})();

/* Animated invitations: the standalone pages in invitation-templates/, made editable.
 * Each page gets its own layout whose fields are the page's visible texts (js/animated-data.js),
 * so saving, server validation, pricing and the AI assistant work like every other design.
 * The page renders in a same-origin frame; invitation-templates/edit.js applies the state inside it.
 * Loaded after every other catalogue: the animated designs replace the earlier collection,
 * which stays registered (archived) so saved invitations keep rendering. DOM-free at load (backend/catalog.mjs). */
(function () {
  'use strict';
  var E = window, cat = E.INVITARA_CATALOG, BASE = '/invitation-templates/', session = {};
  function F(k, label, type) { return { k: k, label: label, type: type || 'text' }; }
  var LABELS = { intro: 'Opening', top: 'Cover', story: 'Story', events: 'Schedule', venue: 'Venue', rsvp: 'RSVP', footer: 'Closing', other: 'Other text' };

  function frame(t, d, host, className) {
    var f = document.createElement('iframe');
    f.className = className; f.title = t.name + ' invitation';
    f.__animated = Object.assign(host, { state: d });
    f.src = BASE + t.animatedPath;
    return f;
  }
  function render(d, t, opts) {
    var el = E.EVER_siteRoot(d, t, opts), host = {}, editor = E.EVER_EDITOR;
    el.classList.add('ws-animated');
    el.style.cssText += ';height:100vh;height:100dvh;overflow:hidden';
    if (editor && !(E.EVER_visualEditor && E.EVER_visualEditor.isPreview())) {
      host = session[t.id] = session[t.id] || {};
      host.editor = editor;
    }
    if (opts.inviteId) {
      host.inviteId = opts.inviteId;
      host.send = function (body) { return E.EVER_API.request('/invites/' + encodeURIComponent(opts.inviteId) + '/rsvp', 'POST', body); };
    }
    var f = frame(t, d, host, 'ws-animated-frame');
    f.style.cssText = 'display:block;width:100%;height:100%;border:0';
    el.appendChild(f);
    return el;
  }
  function mini(d, t) {
    var el = document.createElement('div');
    el.className = 'wsm ws-animated-mini'; el.setAttribute('aria-hidden', 'true');
    var f = frame(t, d, {}, 'template-frame');
    f.loading = 'lazy'; f.tabIndex = -1;
    el.appendChild(f);
    return el;
  }

  (E.INVITARA_ANIMATED || []).forEach(function (a) {
    var slug = a.id.replace(/^\d+-/, ''), id = 'animated-' + slug;
    var occasion = cat.occasions.find(function (o) { return slug.indexOf(o[0] + '-') === 0; });
    var sections = [], defaults = { basics: { title: a.title, date: a.date.slice(0, 10), time: a.date.slice(11, 16), mapUrl: '' }, sections: {} };
    a.fields.forEach(function (f) {
      var spec = sections.find(function (s) { return s.id === f[0]; });
      if (!spec) { spec = { id: f[0], label: LABELS[f[0]] || f[0], fields: [] }; sections.push(spec); defaults.sections[f[0]] = { on: true }; }
      spec.fields.push(F(f[1], f[2].length > 48 ? f[2].slice(0, 45) + '…' : f[2], f[2].length > 60 ? 'textarea' : 'text'));
      defaults.sections[f[0]][f[1]] = f[2];
    });
    E.EVER_registerLayout({
      id: id, label: a.design, events: [occasion ? occasion[0] : 'other'],
      basics: [F('title', 'Invitation name'), F('date', 'Event date', 'date'), F('time', 'Start time (HH:MM)'), F('mapUrl', 'Directions link (https://…)')],
      sections: sections,
      defaults: function () { return JSON.parse(JSON.stringify(defaults)); },
      render: render, mini: mini
    });
    E.EVER_THEMES.push({
      id: id, name: a.design, event: occasion ? occasion[0] : 'other', occasion: occasion ? occasion[0] : 'other',
      category: 'Luxury', style: 'Luxury', experience: 'reveal', layout: id, family: slug, animated: true, archived: false,
      animatedPath: a.path, price: 79, bg: a.themeColor, ink: '#f5efe2', dark: a.themeColor, gold: '#c9a35c', soft: a.themeColor,
      nameFont: 'corm', decoration: 'minimal',
      description: a.intro + '. ' + a.motion + '.',
      premiumFeatures: [a.intro, 'Scroll-driven motion', 'Every text editable', 'Online RSVP']
    });
  });
  E.EVER_THEMES.forEach(function (t) { if (!t.animated) t.archived = true; });
})();

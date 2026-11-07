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
  // Quick details: the facts each design repeats across many texts. Changing one in Basics rewrites every copy.
  var FACTS = {
    '11-wedding-moonlit-garden-gates': [['First name', 'Sofia'], ['Second name', 'Adrian'], ['Initials', 'S&A'], ['Date as shown', '18 · 09 · 2027'], ['Reply-by date', '1 August 2027'], ['Venue', 'The Moon Garden'], ['Venue address', 'Al Barari, Dubai · United Arab Emirates']],
    '12-wedding-royal-palace-doors': [['First name', 'Ananya'], ['Second name', 'Vikram'], ['Dates as shown', '22 – 24 January 2027'], ['Venue', 'The Lake Palace'], ['Venue address', 'Lake Pichola, Udaipur, Rajasthan']],
    '13-anniversary-golden-50-champagne': [['First name', 'Margaret'], ['Second name', 'Richard'], ['Initials', 'M&R'], ['Reply-by date', '12 May 2027'], ['Venue', 'The Crystal Room'], ['Venue address', 'Jumeirah Beach Road, Dubai']],
    '14-anniversary-cinema-love-story': [['First name', 'Leila'], ['Second name', 'Omar'], ['Date as shown', 'Friday 15 October 2027 · 8 PM'], ['Short date', 'Fri 15 Oct 2027'], ['Reply-by date', '15 September 2027'], ['Venue', 'The Grand Picture House'], ['Venue address', 'Al Seef, Bur Dubai']],
    '15-birthday-gates-in-the-clouds': [['Name', 'Aria'], ['Date as shown', 'Thursday · 5 August 2027 · 7:30 PM'], ['Reply-by date', '20 July 2027'], ['Venue', 'Cloud Nine Rooftop'], ['Venue address', 'Level 47, Business Bay, Dubai']],
    '16-birthday-art-deco-cocktail': [['Name', 'Marcus'], ['Date as shown', 'Saturday 20 November 2027'], ['Reply-by date', '1 November 2027'], ['Venue', 'The Gilded Lounge'], ['Venue address', 'Gate Village 7, DIFC, Dubai']],
    '17-product-launch-perfume-unveil': [['Brand', 'Maison Sahar'], ['Product', 'Noir Éclat'], ['Date', '3 March 2027'], ['Venue address', 'Building 6, Dubai Design District']],
    '18-product-launch-coming-soon-drop': [['Brand', 'Halo Audio'], ['Product', 'Orbit One'], ['Date', '9 April 2027'], ['Short date', '09.04.27'], ['Reply-by date', '1 April'], ['Venue', 'Warehouse 21'], ['Venue address', 'Al Quoz 1, Dubai']],
    '19-housewarming-we-found-our-home': [['First name', 'Sara'], ['Second name', 'Adam'], ['Family name', 'Khan'], ['Date as shown', 'Sunday 16 May 2027, from noon'], ['Reply-by date', '5 May'], ['Address', '12 Jasmine Lane'], ['Area', 'Arabian Ranches 3, Dubai']],
    '20-housewarming-griha-pravesh-diya': [['Family name', 'Iyer'], ['Date as shown', 'Sunday · 14 February 2027 · 8:00 AM'], ['Reply-by date', '7 February'], ['Address', 'Villa 27, Mirdif'], ['Area', 'Street 14, Mirdif, Dubai']]
  };
  function factKey(label) { return 'fact' + label.replace(/[^A-Za-z]/g, ''); }
  // Replaces a whole word or phrase (and its CAPITALISED copy) in every text of the invitation except the facts themselves.
  E.INVITARA_replaceFact = function (state, from, to) {
    if (!from || !to || from === to) return 0;
    var count = 0, pairs = [[from, to], [from.toUpperCase(), to.toUpperCase()]];
    function swap(text) {
      pairs.forEach(function (p) {
        var re = new RegExp('(?<![\\p{L}\\p{N}])' + p[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\p{N}])', 'gu');
        text = text.replace(re, function () { count++; return p[1]; });
      });
      return text;
    }
    Object.keys(state.basics || {}).forEach(function (k) { if (k.indexOf('fact') !== 0 && typeof state.basics[k] === 'string') state.basics[k] = swap(state.basics[k]); });
    Object.keys(state.sections || {}).forEach(function (sid) {
      var sec = state.sections[sid];
      Object.keys(sec || {}).forEach(function (k) { if (typeof sec[k] === 'string') sec[k] = swap(sec[k]); });
    });
    return count;
  };

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
    var f = document.createElement('iframe');
    f.className = 'ws-animated-frame'; f.title = t.name + ' invitation';
    f.__animated = Object.assign(host, { state: d });
    f.src = BASE + t.animatedPath;
    f.style.cssText = 'display:block;width:100%;height:100%;border:0';
    el.appendChild(f);
    return el;
  }
  // Thumbnails are posters, not live pages: a grid of running templates would stutter the whole page.
  function mini(d, t) {
    var el = document.createElement('div');
    el.className = 'wsm ws-animated-mini'; el.setAttribute('aria-hidden', 'true');
    var img = document.createElement('img');
    img.className = 'template-frame'; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    img.width = 600; img.height = 900; img.src = t.poster;
    el.appendChild(img);
    return el;
  }

  (E.INVITARA_ANIMATED || []).forEach(function (a) {
    var slug = a.id.replace(/^\d+-/, ''), id = 'animated-' + slug;
    var occasion = cat.occasions.find(function (o) { return slug.indexOf(o[0] + '-') === 0; });
    var facts = FACTS[a.id] || [];
    var sections = [], defaults = { basics: { title: a.title, date: a.date.slice(0, 10), time: a.date.slice(11, 16), mapUrl: '' }, sections: {} };
    facts.forEach(function (f) { defaults.basics[factKey(f[0])] = f[1]; });
    a.fields.forEach(function (f) {
      var spec = sections.find(function (s) { return s.id === f[0]; });
      if (!spec) { spec = { id: f[0], label: LABELS[f[0]] || f[0], fields: [] }; sections.push(spec); defaults.sections[f[0]] = { on: true }; }
      // Label a field by its role when it is exactly a fact or a time; otherwise by the line it holds in the design.
      var fact = facts.find(function (x) { return x[1] === f[2]; });
      var label = fact ? fact[0] : /^\d{1,2}(:\d\d)?\s?(AM|PM)$/i.test(f[2]) ? 'Time (' + f[2] + ')' : f[2].length > 48 ? f[2].slice(0, 45) + '…' : f[2];
      spec.fields.push(F(f[1], label, f[2].length > 60 ? 'textarea' : 'text'));
      defaults.sections[f[0]][f[1]] = f[2];
    });
    E.EVER_registerLayout({
      id: id, label: a.design, events: [occasion ? occasion[0] : 'other'],
      basics: facts.map(function (f) { var spec = F(factKey(f[0]), f[0]); spec.fact = true; return spec; }).concat([F('title', 'Invitation name'), F('date', 'Event date', 'date'), F('time', 'Start time (HH:MM)'), F('mapUrl', 'Directions link (https://…)')]),
      sections: sections,
      defaults: function () { return JSON.parse(JSON.stringify(defaults)); },
      render: render, mini: mini
    });
    E.EVER_THEMES.push({
      id: id, name: a.design, event: occasion ? occasion[0] : 'other', occasion: occasion ? occasion[0] : 'other',
      category: 'Luxury', style: 'Luxury', experience: 'reveal', layout: id, family: slug, animated: true, archived: false,
      animatedPath: a.path, poster: a.poster, price: 79, bg: a.themeColor, ink: '#f5efe2', dark: a.themeColor, gold: '#c9a35c', soft: a.themeColor,
      nameFont: 'corm', decoration: 'minimal',
      description: a.intro + '. ' + a.motion + '.',
      premiumFeatures: [a.intro, 'Scroll-driven motion', 'Every text editable', 'Online RSVP']
    });
  });
  E.EVER_THEMES.forEach(function (t) { if (!t.animated) t.archived = true; });
})();

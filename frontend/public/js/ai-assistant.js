/* Editor assistant: a floating chat (bottom-left; a bottom sheet on phones).
 *
 * Guided mode asks for the chosen template's own details, one at a time, straight from that
 * template's field list (EVER_EDITOR.fields), so it fits every design exactly. Each answer is
 * written to the invitation at once (one undo step) and the preview scrolls to it.
 * Anything else typed goes to the server's AI (backend/ai.mjs, /api/ai/edit) with the editor's
 * state; its checked edit operations are applied in one step, then any AI images are made. */
(function () {
  'use strict';
  var form = document.getElementById('ai-form');
  if (!form) return;
  var E = window, fab = document.getElementById('ai-fab'), panel = document.getElementById('ai-panel');
  var log = document.getElementById('ai-log'), input = document.getElementById('ai-input'), go = document.getElementById('ai-go');
  var picker = document.getElementById('ai-photos'), attached = document.getElementById('ai-attached'), chips = document.getElementById('ai-suggest');
  var phone = matchMedia('(max-width: 767px)');
  var files = [], history = [], queue = [], asking = null, greeted = false;

  /* ---------- Chat basics ---------- */
  function bubble(text, who) {
    var p = document.createElement('p');
    p.className = 'ai-msg ai-' + who; p.textContent = text;
    log.appendChild(p); log.scrollTop = log.scrollHeight;
    return p;
  }

  /* Quick replies under the chat: [{ label, run }] or a ready element. */
  function offer(items) {
    chips.replaceChildren();
    items.forEach(function (it) {
      if (it.nodeType) { chips.appendChild(it); return; }
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = it.label;
      if (it.primary) b.className = 'is-primary';
      b.addEventListener('click', it.run);
      chips.appendChild(b);
    });
    chips.hidden = !items.length;
  }

  function open() {
    panel.hidden = false; fab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('ai-open');
    // On phones the sheet covers the editing controls, so show the live invitation above it.
    if (phone.matches && !document.body.classList.contains('is-previewing')) document.getElementById('mobile-preview').click();
    if (!greeted) greet();
    input.focus({ preventScroll: true });
  }
  function close() {
    panel.hidden = true; fab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('ai-open'); fab.focus();
  }
  fab.addEventListener('click', function () { if (panel.hidden) open(); else close(); });
  document.getElementById('ai-close').addEventListener('click', close);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* ---------- What this template is ---------- */
  function template() {
    var s = E.EVER_EDITOR.getState(), t = E.EVER_findTemplate(s.templateId) || {};
    var occasion = t.occasion || s.basics.event || '';
    var label = E.INVITARA_CATALOG && occasion ? E.INVITARA_CATALOG.label(occasion) : 'event';
    return { name: t.name || 'your design', occasion: occasion, label: label, couple: /wedding|engagement|anniversary/.test(occasion) };
  }

  /* The questions, phrased for the template's occasion. Unknown fields fall back to their own label. */
  function question(f, t) {
    var k = f.path.split('.')[1];
    var who = t.couple ? 'partner' : t.occasion === 'housewarming' ? 'host' : '';
    var Q = {
      title: 'What should the invitation be called? Guests see it as the page title.',
      nameA: t.couple ? 'What’s the first partner’s name?' : 'Who is hosting? Your name, or the guest of honour.',
      nameB: t.couple ? 'And the second partner’s name?' : 'Is there a second host? (optional)',
      brand: 'What monogram should appear? Usually initials, like “A & B”.',
      date: 'What’s the date of your ' + t.label.toLowerCase() + '?',
      time: 'What time does it start?',
      venue: 'What’s the venue called?', city: 'Which city or area is it in?',
      dress: 'Is there a dress code? (optional)', email: 'Which email can guests contact? (optional)', phone: 'Which phone number can guests call? (optional)',
      factFirstname: who ? 'What’s the first ' + who + '’s name?' : 'What’s the first name?',
      factSecondname: who ? 'And the second ' + who + '’s name?' : 'And the second name?',
      factInitials: 'How should your initials appear?',
      factName: t.occasion === 'birthday' ? 'Whose birthday is it? Their name as it should appear.' : 'What name should appear?',
      factFamilyname: 'What’s the family name?',
      factBrand: 'What’s the brand name?', factProduct: 'What’s the product called?',
      factDate: 'How should the date be written on the invitation?', factDateasshown: 'How should the date be written on the invitation?',
      factShortdate: 'And a short version of the date?', factReplybydate: 'By when should guests reply?',
      factVenue: 'What’s the venue called?', factVenueaddress: 'What’s the venue’s address?',
      factAddress: 'What’s the address?', factArea: 'Which area or street is it in?'
    };
    if (f.type === 'photo') return 'Would you like to add your own photo to the “' + f.label + '” section?';
    return Q[k] || 'What should “' + f.label.replace(/\s*\(.*\)$/, '') + '” say?';
  }

  /* Ask in a natural order: who, what it's called, when, where, then everything else. */
  function rank(k) {
    if (/^(nameA|nameB|factFirstname|factSecondname|factName|factFamilyname|factBrand|factProduct)$/.test(k)) return 0;
    if (/^(brand|factInitials)$/.test(k)) return 1;
    if (k === 'title') return 2;
    if (k === 'date') return 3;
    if (k === 'time') return 4;
    if (/date/i.test(k)) return 5;
    if (/venue|city|address|area/i.test(k)) return 6;
    return 7;
  }
  function questions() {
    var all = E.EVER_EDITOR.fields(), basics = all.filter(function (f) { return /^basics\./.test(f.path); });
    // Main photos only (not section backgrounds), each named by the section it belongs to.
    var sections = E.EVER_EDITOR.context().sections;
    var photos = all.filter(function (f) { return f.type === 'photo' && !/backgroundPhoto$/.test(f.path); }).slice(0, 4).map(function (f) {
      var s = sections.find(function (x) { return x.id === f.path.split('.')[1]; });
      return Object.assign({}, f, { label: s ? s.label : f.label });
    });
    return basics.map(function (f, i) { return { f: f, r: rank(f.path.split('.')[1]), i: i }; })
      .sort(function (a, b) { return a.r - b.r || a.i - b.i; }).map(function (x) { return x.f; }).concat(photos);
  }
  function optional(f) {
    var k = f.path.split('.')[1];
    return f.type === 'photo' || /Url$/.test(k) || ['email', 'phone', 'dress', 'nameB'].indexOf(k) >= 0 || /optional/i.test(f.label);
  }

  /* ---------- Smart suggestions from what the host already gave ---------- */
  function day() {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(E.EVER_EDITOR.getState().basics.date || '');
    return m ? new Date(+m[1], m[2] - 1, +m[3]) : null;
  }
  function fmt(d, opts) { return new Intl.DateTimeFormat('en-GB', opts).format(d); }
  function suggestions(f, t) {
    var b = E.EVER_EDITOR.getState().basics, k = f.path.split('.')[1], d = day(), pad = function (n) { return String(n).padStart(2, '0'); };
    var a = b.factFirstname || b.nameA || b.factName || '', z = b.factSecondname || b.nameB || '';
    if (/^(factInitials|brand)$/.test(k) && a) return z ? [a[0] + ' & ' + z[0], a[0] + '&' + z[0]] : [a[0]];
    if (k === 'title') {
      if (b.factProduct && b.factBrand) return [b.factProduct + ' — Launch by ' + b.factBrand];
      if (b.factFamilyname) return ['The ' + b.factFamilyname + ' Family ' + t.label];
      if (a && z) return [a + ' & ' + z + ' — ' + t.label];
      if (a) return [a + '’s ' + t.label];
      return [];
    }
    if (d && /^(factDate|factDateasshown)$/.test(k)) return [pad(d.getDate()) + ' · ' + pad(d.getMonth() + 1) + ' · ' + d.getFullYear(), fmt(d, { day: 'numeric', month: 'long', year: 'numeric' }), fmt(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })];
    if (d && k === 'factShortdate') return [pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2), fmt(d, { day: 'numeric', month: 'short' })];
    if (d && k === 'factReplybydate') return [21, 14].map(function (n) { return fmt(new Date(d.getTime() - n * 864e5), { day: 'numeric', month: 'long', year: 'numeric' }); });
    if (k === 'time') return ['18:00', '19:00', '19:30', '20:00'];
    return [];
  }

  /* "7pm", "7:30 pm", "19.30" -> "19:30". Anything else is kept as typed. */
  function cleanTime(v) {
    var m = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/i.exec(v.trim());
    if (!m || (!m[2] && !m[3])) return v;
    var h = +m[1] % (m[3] ? 12 : 24) + (/pm/i.test(m[3] || '') ? 12 : 0);
    return String(h).padStart(2, '0') + ':' + (m[2] || '00');
  }

  /* ---------- Writing an answer into the invitation ---------- */
  function show(value) {
    // Scroll the live preview to the new words and outline them briefly.
    setTimeout(function () {
      var canvas = document.getElementById('canvas'), frame = canvas.querySelector('iframe');
      var root = frame && frame.contentDocument ? frame.contentDocument.body : canvas;
      if (!root || !value) return;
      var walker = (root.ownerDocument || document).createTreeWalker(root, NodeFilter.SHOW_TEXT), node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.indexOf(value) < 0) continue;
        var el = node.parentElement;
        el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        el.style.outline = '3px solid #F52D91'; el.style.outlineOffset = '4px'; el.style.borderRadius = '6px';
        setTimeout(function () { el.style.outline = ''; el.style.outlineOffset = ''; }, 1800);
        return;
      }
    }, 450);
  }

  function write(f, value) {
    E.EVER_EDITOR.apply([{ type: f.type === 'photo' ? 'photo' : 'text', path: f.path, value: value }]);
    if (f.type !== 'photo') show(value);
  }

  /* ---------- Guided questions ---------- */
  function ask() {
    asking = queue.shift() || null;
    if (!asking) { finish(); return; }
    var t = template(), f = asking, items = [];
    var fresh = E.EVER_EDITOR.fields().find(function (x) { return x.path === f.path; }) || f;
    var now = f.type === 'photo' ? '' : (fresh.value || '').trim();
    bubble(question(f, t) + (now && f.type !== 'date' ? '\nNow: “' + now + '”' : ''), 'bot');
    if (f.type === 'date') {
      var row = document.createElement('div'); row.className = 'ai-inline';
      row.innerHTML = '<label class="sr-only" for="ai-date">Event date</label><input type="date" id="ai-date"><button type="button" class="is-primary">Set date</button>';
      var dateIn = row.querySelector('input'); dateIn.value = fresh.value || '';
      row.querySelector('button').addEventListener('click', function () { if (dateIn.value) answer(dateIn.value, fmt(new Date(dateIn.value + 'T12:00'), { day: 'numeric', month: 'long', year: 'numeric' })); });
      items.push(row);
    } else if (f.type === 'photo') {
      items.push({ label: 'Choose a photo', primary: true, run: function () { picker.click(); } });
    } else {
      suggestions(f, t).forEach(function (s) { items.push({ label: s, run: function () { answer(s); } }); });
    }
    items.push({ label: optional(f) ? 'Skip' : 'Keep it for now', run: function () { bubble(optional(f) ? 'Skip' : 'Keep it for now', 'user'); ask(); } });
    items.push({ label: 'Stop questions', run: stop });
    offer(items);
    input.placeholder = f.type === 'photo' ? 'Or type to skip this photo…' : 'Type your answer…';
  }

  function answer(value, shown) {
    var f = asking;
    if (!f) return;
    var k = f.path.split('.')[1];
    if (f.type === 'date') {
      var parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : (function () { var d = new Date(value); return isNaN(d) ? '' : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
      if (!parsed) { bubble(value, 'user'); bubble('I couldn’t read that date. Pick it from the calendar, or type it like “12 June 2027”.', 'bot'); return; }
      value = parsed;
    }
    if (k === 'time') value = cleanTime(value);
    bubble(shown || value, 'user');
    write(f, value);
    var done = bubble('✓ Added to your invitation.', 'bot'); done.classList.add('ai-done');
    ask();
  }

  function start(onlyPath) {
    queue = questions().filter(function (f) { return !onlyPath || f.path === onlyPath; });
    if (!queue.length) { bubble(onlyPath ? 'That detail is fixed for this invitation.' : 'This design has nothing to ask about. Tell me what you’d like to change.', 'bot'); offer([]); return; }
    if (!onlyPath) bubble('Great. I’ll ask ' + queue.length + ' quick questions and fill each answer into your invitation as we go.', 'bot');
    ask();
  }

  function stop() {
    queue = []; asking = null;
    bubble('No problem. Tell me anything you’d like to change, in your own words.', 'bot');
    menu();
  }

  function finish() {
    asking = null;
    input.placeholder = 'Ask for any change…';
    bubble('That’s everything for now. Want me to write the rest of the words to match your details?', 'bot');
    menu();
  }

  function menu() {
    input.placeholder = 'Ask for any change…';
    offer([
      { label: 'Write the rest for me', primary: true, run: function () { send('Write the remaining text in every section so it matches the details already filled in. Keep every name, date, time and place exactly as they are.'); } },
      { label: 'Fill in my details', run: function () { bubble('Fill in my details', 'user'); start(); } },
      { label: 'What’s left to publish?', run: function () { close(); document.getElementById('publish-btn').click(); } }
    ]);
  }

  function greet() {
    greeted = true;
    var t = template();
    bubble('Hi! I know your “' + t.name + '” ' + t.label.toLowerCase() + ' design. I’ll ask a few quick questions and fill in your invitation as we go, so you can watch it change.', 'bot');
    offer([
      { label: 'Let’s start', primary: true, run: function () { bubble('Let’s start', 'user'); start(); } },
      { label: 'I’ll type what I want', run: function () { bubble('Sure. Describe any change, for example “make it black and gold” or “write a short welcome”.', 'bot'); menu(); input.focus(); } }
    ]);
  }

  /* The publish checklist sends each missing detail here. */
  E.MZ_ASSISTANT = { ask: function (path) { open(); bubble('Let’s fix that.', 'bot'); start(path); } };

  /* ---------- Photos ---------- */
  /* Reads an image file into a JPEG data URL no larger than max pixels on its longest side. */
  function shrink(file, max) {
    return new Promise(function (resolve, reject) {
      var src = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var scale = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(src); resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = function () { URL.revokeObjectURL(src); reject(new Error('“' + file.name + '” could not be opened. Try another image.')); };
      img.src = src;
    });
  }

  function showAttached() {
    attached.hidden = !files.length;
    attached.replaceChildren();
    files.forEach(function (f, i) {
      var chip = document.createElement('button');
      chip.type = 'button'; chip.textContent = 'Photo ' + (i + 1) + ' ×';
      chip.setAttribute('aria-label', 'Remove ' + f.name);
      chip.addEventListener('click', function () { files.splice(i, 1); showAttached(); });
      attached.appendChild(chip);
    });
  }

  picker.addEventListener('change', async function () {
    var picked = Array.from(picker.files);
    picker.value = '';
    if (picked.some(function (f) { return !/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 8 * 1024 * 1024; })) { bubble('Choose JPG, PNG or WebP photos under 8 MB.', 'bot'); return; }
    if (asking && asking.type === 'photo' && picked.length) {
      try { var f = asking; bubble('Photo: ' + picked[0].name, 'user'); write(f, await shrink(picked[0], 1400)); bubble('✓ Photo added.', 'bot').classList.add('ai-done'); ask(); }
      catch (err) { bubble(err.message, 'bot'); }
      return;
    }
    files = files.concat(picked).slice(0, 6); showAttached();
  });

  /* ---------- Typing ---------- */
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var message = input.value.trim();
    if (!message || go.disabled) return;
    input.value = '';
    if (asking && asking.type !== 'photo') { answer(message); return; }
    if (asking) { bubble(message, 'user'); ask(); return; }
    send(message);
  });

  /* Free-form requests go to the AI. */
  async function send(message) {
    var editor = E.EVER_EDITOR;
    if (!editor || go.disabled) return;
    bubble(message + (files.length ? ' (' + files.length + ' photo' + (files.length > 1 ? 's' : '') + ')' : ''), 'user');
    go.disabled = true; offer([]);
    var sending = files; files = []; showAttached();
    var status = bubble(sending.length ? 'Looking at your photos…' : 'Thinking…', 'bot');
    status.classList.add('ai-wait');
    try {
      var full = await Promise.all(sending.map(function (f) { return shrink(f, 1400); }));
      var thumbs = await Promise.all(sending.map(function (f) { return shrink(f, 384); }));
      status.textContent = 'Working on it… a bigger change can take a minute.';
      var out = await E.EVER_API.request('/ai/edit', 'POST', { message: message, context: editor.context(), history: history, photos: thumbs }, 180000);
      history.push({ role: 'user', text: message }, { role: 'assistant', text: out.reply });
      history = history.slice(-8);

      var images = out.ops.filter(function (op) { return op.type === 'image'; });
      var now = out.ops.filter(function (op) { return op.type !== 'image'; }).map(function (op) {
        return op.type === 'photo' ? { type: 'photo', path: op.path, value: full[op.photo] } : op;
      });
      if (now.length) editor.apply(now);
      status.classList.remove('ai-wait');
      status.textContent = out.reply;
      var firstText = now.find(function (op) { return op.type === 'text' && op.value; });
      if (firstText) show(String(firstText.value).slice(0, 40));

      var failed = 0;
      for (var i = 0; i < images.length; i++) {
        var note = bubble('Creating image ' + (i + 1) + ' of ' + images.length + '…', 'bot');
        note.classList.add('ai-wait');
        try {
          var shot = await E.EVER_API.request('/ai/image', 'POST', { prompt: images[i].prompt }, 90000);
          editor.apply([{ type: 'photo', path: images[i].path, value: shot.image }]);
          note.remove();
        } catch (err) { failed++; note.remove(); }
      }
      if (failed) bubble(failed + ' image' + (failed > 1 ? 's' : '') + ' could not be created. Ask again, or add your own photo.', 'bot');
      var steps = (now.length ? 1 : 0) + images.length - failed;
      if (steps) {
        var undo = document.createElement('button');
        undo.type = 'button'; undo.className = 'ai-undo'; undo.textContent = 'Undo';
        undo.addEventListener('click', function () { for (var s = 0; s < steps; s++) editor.undo(); undo.disabled = true; undo.textContent = 'Undone'; });
        status.appendChild(document.createTextNode(' ')); status.appendChild(undo);
      }
    } catch (err) {
      status.classList.remove('ai-wait');
      status.textContent = err.message;
      input.value = input.value || message;
    } finally {
      go.disabled = false;
      menu();
    }
  }
})();

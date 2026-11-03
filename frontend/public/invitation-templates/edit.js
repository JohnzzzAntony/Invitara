/* Makes an animated template editable. Loaded before each template's own script.
 * fields() is also run by scripts/animated-templates.mjs to generate js/animated-data.js,
 * so the field keys here and in the editor schema always come from the same walk.
 * The embedding page (js/animated-catalog.js) sets frameElement.__animated = {state, editor, inviteId}. */
(function () {
  'use strict';
  var SKIP = 'script,style,noscript,template,title,option,select,textarea,[data-cd],[data-count]';
  var SVG = 'http://www.w3.org/2000/svg';

  function sectionOf(el) {
    var s = el.closest('.intro,header[id],section[id],footer');
    if (!s) return 'other';
    if (s.classList.contains('intro')) return 'intro';
    if (s.tagName === 'FOOTER') return 'footer';
    return s.id.replace(/[^a-zA-Z0-9]/g, '') || 'other';
  }
  // Editor paths only accept letters in field names, so index 0 -> "ta", 27 -> "tbb".
  function key(i) { var s = ''; do { s = String.fromCharCode(97 + i % 26) + s; i = Math.floor(i / 26); } while (i); return 't' + s; }

  // Every visible text becomes one leaf element; stray text beside other elements is wrapped in a span.
  function fields(doc) {
    var walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT), nodes = [], seen = new Set(), out = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parent = node.parentElement;
      if (!node.data.trim() || !parent || parent.closest(SKIP)) return;
      if (parent.children.length) {
        if (parent.namespaceURI === SVG) return;
        var span = doc.createElement('span');
        parent.insertBefore(span, node); span.appendChild(node); parent = span;
      }
      if (seen.has(parent)) return;
      seen.add(parent);
      out.push({ el: parent, section: sectionOf(parent), key: key(out.length), text: parent.textContent.replace(/\s+/g, ' ').trim() });
    });
    return out;
  }
  window.INVITE_FIELDS = fields;

  var host = null;
  try { host = window.frameElement && window.frameElement.__animated; } catch (e) { host = null; }
  if (!host) return;
  var state = host.state, list = fields(document), body = document.body, root = document.documentElement;

  list.forEach(function (f) {
    var value = state.sections[f.section] && state.sections[f.section][f.key];
    if (typeof value === 'string' && value !== f.text) f.el.textContent = value;
  });
  Object.keys(state.sections).forEach(function (id) {
    var el = document.getElementById(id);
    if (el && state.sections[id].on === false) el.hidden = true;
  });
  var offset = (body.dataset.date.match(/([+-]\d\d:\d\d|Z)$/) || ['', ''])[1];
  if (/^\d{4}-\d\d-\d\d$/.test(state.basics.date || '')) body.dataset.date = state.basics.date + 'T' + (/^\d\d:\d\d$/.test(state.basics.time || '') ? state.basics.time : '18:00') + ':00' + offset;
  if (state.basics.title) body.dataset.title = state.basics.title;
  var map = state.basics.mapUrl;
  if (/^https:\/\/[^\s<>"]+$/.test(map || '')) document.querySelectorAll('a[href^="https://maps.google.com"]').forEach(function (a) { a.href = map; });

  if (host.editor) {
    var editor = host.editor;
    // Preview rebuilds reload this frame; keep the reader's place and skip the opening they already saw.
    if (host.opened) root.classList.add('opened');
    addEventListener('load', function () { if (host.scrollY) scrollTo(0, host.scrollY); });
    addEventListener('scroll', function () { host.scrollY = scrollY; }, { passive: true });
    document.addEventListener('click', function (e) { if (e.target.closest('[data-open]')) host.opened = true; });
    var style = document.createElement('style');
    style.textContent = '[data-ed]{cursor:text}[data-ed]:hover,[data-ed]:focus{outline:1px dashed currentColor;outline-offset:3px}';
    document.head.appendChild(style);
    list.forEach(function (f) {
      var path = 'sections.' + f.section + '.' + f.key;
      if (!editor.canEdit(path)) return;
      f.el.setAttribute('data-ed', '');
      f.el.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        f.el.setAttribute('contenteditable', 'plaintext-only');
        f.el.focus();
      }, true);
      f.el.addEventListener('input', function () { editor.change(path, f.el.textContent, true); });
      f.el.addEventListener('blur', function () { f.el.removeAttribute('contenteditable'); editor.sync(); });
    });
    document.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
  }

  if (host.inviteId) {
    // Replies go to the host's dashboard; this runs before, and replaces, the template's own submit handler.
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('form[data-rsvp]');
      if (!form) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      var data = new FormData(form), button = form.querySelector('[type=submit]'), err = form.querySelector('.err'), done = form.parentNode.querySelector('.thanks');
      button.disabled = true; if (err) err.hidden = true;
      host.send({ name: data.get('name'), attend: data.get('attending'), guests: data.get('guests'), msg: data.get('message') || '' }).then(function () {
        form.hidden = true; if (done) { done.hidden = false; done.focus(); }
      }, function (error) {
        button.disabled = false;
        if (err) { err.textContent = error.message || 'Something went wrong. Please try again.'; err.hidden = false; }
      });
    }, true);
  }
})();

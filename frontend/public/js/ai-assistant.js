/* Editor assistant tab: a chat. Each message goes to the server's NVIDIA proxy
   (backend/ai.mjs, /api/ai/edit) with the editor's current state; the reply's
   checked edit operations are applied in one step, then any AI images are made. */
(function () {
  'use strict';
  var form = document.getElementById('ai-form');
  if (!form) return;
  var log = document.getElementById('ai-log'), input = document.getElementById('ai-input'), go = document.getElementById('ai-go');
  var picker = document.getElementById('ai-photos'), attached = document.getElementById('ai-attached');
  var files = [], history = [];

  function bubble(text, who) {
    var p = document.createElement('p');
    p.className = 'ai-msg ai-' + who; p.textContent = text;
    log.appendChild(p); log.scrollTop = log.scrollHeight;
    return p;
  }

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

  picker.addEventListener('change', function () {
    var picked = Array.from(picker.files);
    picker.value = '';
    if (picked.some(function (f) { return !/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 8 * 1024 * 1024; })) { bubble('Choose JPG, PNG or WebP photos under 8 MB.', 'bot'); return; }
    files = files.concat(picked).slice(0, 6); showAttached();
  });

  document.getElementById('ai-suggest').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-text]');
    if (!b) return;
    input.value = b.dataset.text; input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var editor = window.EVER_EDITOR, message = input.value.trim();
    if (!editor || !message || go.disabled) return;
    bubble(message + (files.length ? ' (' + files.length + ' photo' + (files.length > 1 ? 's' : '') + ')' : ''), 'user');
    input.value = ''; go.disabled = true;
    document.getElementById('ai-suggest').hidden = true;
    var sending = files; files = []; showAttached();
    var status = bubble(sending.length ? 'Looking at your photos…' : 'Thinking…', 'bot');
    status.classList.add('ai-wait');
    try {
      var full = await Promise.all(sending.map(function (f) { return shrink(f, 1400); }));
      var thumbs = await Promise.all(sending.map(function (f) { return shrink(f, 384); }));
      status.textContent = 'Thinking… a full redesign can take a minute.';
      var out = await window.EVER_API.request('/ai/edit', 'POST', { message: message, context: editor.context(), history: history, photos: thumbs }, 180000);
      history.push({ role: 'user', text: message }, { role: 'assistant', text: out.reply });
      history = history.slice(-8);

      var images = out.ops.filter(function (op) { return op.type === 'image'; });
      var now = out.ops.filter(function (op) { return op.type !== 'image'; }).map(function (op) {
        return op.type === 'photo' ? { type: 'photo', path: op.path, value: full[op.photo] } : op;
      });
      if (now.length) editor.apply(now);
      status.classList.remove('ai-wait');
      status.textContent = out.reply;

      var failed = 0;
      for (var i = 0; i < images.length; i++) {
        var note = bubble('Creating image ' + (i + 1) + ' of ' + images.length + '…', 'bot');
        note.classList.add('ai-wait');
        try {
          var shot = await window.EVER_API.request('/ai/image', 'POST', { prompt: images[i].prompt }, 90000);
          editor.apply([{ type: 'photo', path: images[i].path, value: shot.image }]);
          note.remove();
        } catch (err) { failed++; note.remove(); }
      }
      if (failed) bubble(failed + ' image' + (failed > 1 ? 's' : '') + ' could not be created. Ask again, or add your own from Content.', 'bot');
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
    }
  });
})();

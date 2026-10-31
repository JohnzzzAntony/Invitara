/* Editor AI tab: the host types the essentials, the server's NVIDIA proxy
   (backend/ai.mjs) writes every field of the active layout, the host's photos
   go where the model suggests, and empty photo spots can be generated. */
(function () {
  'use strict';
  var form = document.getElementById('ai-form');
  if (!form) return;
  var status = document.getElementById('ai-status'), go = document.getElementById('ai-go');
  function say(text) { status.textContent = text; }
  function val(id) { return document.getElementById(id).value.trim(); }

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

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var editor = window.EVER_EDITOR;
    if (!editor) return;
    var files = Array.from(document.getElementById('ai-photos').files).slice(0, 6);
    if (files.some(function (f) { return !/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 8 * 1024 * 1024; })) { say('Choose JPG, PNG or WebP photos under 8 MB.'); return; }
    var date = val('ai-date');
    var details = ['Names: ' + val('ai-names'), date && 'Date: ' + date, val('ai-time') && 'Time: ' + val('ai-time'),
      val('ai-venue') && 'Venue: ' + val('ai-venue'), val('ai-notes') && 'Notes: ' + val('ai-notes')].filter(Boolean).join('\n');
    go.disabled = true;
    try {
      say(files.length ? 'Reading your photos…' : 'Writing your invitation…');
      var full = await Promise.all(files.map(function (f) { return shrink(f, 1400); }));
      var thumbs = await Promise.all(files.map(function (f) { return shrink(f, 384); }));
      var fields = editor.fields();
      say('Writing your invitation… this can take up to a minute.');
      var draft = await window.EVER_API.request('/ai/invitation', 'POST', { details: details, tone: val('ai-tone'), fields: fields, photos: thumbs }, 150000);

      var values = Object.assign({}, draft.fields), used = {};
      if (date && fields.some(function (f) { return f.path === 'basics.date'; })) values['basics.date'] = date;
      Object.keys(draft.photos).forEach(function (path) { values[path] = full[draft.photos[path]]; used[draft.photos[path]] = true; });
      var empty = fields.filter(function (f) { return f.type === 'photo' && !values[f.path]; });
      /* Photos the model did not place still fill the next empty spots. */
      full.forEach(function (photo, i) { if (!used[i] && empty.length) values[empty.shift().path] = photo; });
      editor.fill(values);

      var wanted = document.getElementById('ai-images').checked ? empty.slice(0, 4) : [], failed = 0;
      for (var i = 0; i < wanted.length; i++) {
        say('Creating image ' + (i + 1) + ' of ' + wanted.length + '…');
        try {
          var prompt = draft.imagePrompts[wanted[i].path] || wanted[i].label + ' for ' + (val('ai-notes') || 'a celebration') + ' at ' + (val('ai-venue') || 'an elegant venue');
          var shot = await window.EVER_API.request('/ai/image', 'POST', { prompt: prompt }, 90000);
          var one = {}; one[wanted[i].path] = shot.image; editor.fill(one);
        } catch (err) { failed++; }
      }
      say(failed ? 'Your invitation is written. ' + failed + ' image' + (failed > 1 ? 's' : '') + ' could not be created. Add your own from Sections.' : 'Done. Review each section, then publish when you’re happy.');
    } catch (err) {
      say(err.message);
    } finally {
      go.disabled = false;
    }
  });
})();

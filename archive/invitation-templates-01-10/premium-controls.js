(function () {
  'use strict';

  var root = document.documentElement;
  var key = 'invitara-template-preferences';
  var preferences = {};
  try { preferences = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}

  var systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var modeSelect;
  function applyMotion(mode) {
    if (mode !== 'full' && mode !== 'reduced' && mode !== 'off') mode = systemReduced.matches ? 'reduced' : 'full';
    root.dataset.motionMode = mode;
    if (mode === 'off' || mode === 'reduced') {
      document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    }
    if (modeSelect) modeSelect.value = mode;
  }

  var initialMode = preferences.motion || (systemReduced.matches ? 'reduced' : 'full');
  applyMotion(initialMode);

  var trigger = document.createElement('button');
  trigger.className = 'invitation-settings-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-label', 'Open invitation settings');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 13.5 1.1.8-1.5 2.6-1.3-.5a7.8 7.8 0 0 1-1.5.9l-.2 1.4h-3l-.3-1.4a7.8 7.8 0 0 1-1.5-.9l-1.3.5-1.5-2.6 1.1-.8a7.3 7.3 0 0 1 0-1.8l-1.1-.8 1.5-2.6 1.3.5a7.8 7.8 0 0 1 1.5-.9l.3-1.4h3l.2 1.4a7.8 7.8 0 0 1 1.5.9l1.3-.5 1.5 2.6-1.1.8a7.3 7.3 0 0 1 0 1.8Z"/></svg><span>Settings</span>';
  document.body.appendChild(trigger);

  var dialog = document.createElement('dialog');
  dialog.className = 'invitation-settings';
  dialog.setAttribute('aria-labelledby', 'invitation-settings-title');
  dialog.innerHTML = '<div class="invitation-settings__inner"><div class="invitation-settings__top"><div><p class="invitation-settings__eyebrow">Your experience</p><h2 id="invitation-settings-title">Display settings</h2></div><button class="invitation-settings__close" type="button" aria-label="Close settings">×</button></div><div class="invitation-settings__field"><label for="invitation-motion-mode">Motion</label><select id="invitation-motion-mode"><option value="full">Full motion</option><option value="reduced">Reduced motion</option><option value="off">Motion off</option></select></div><div class="invitation-settings__field" data-video-quality-field hidden><label for="invitation-video-quality">Video quality</label><select id="invitation-video-quality"></select></div><p class="invitation-settings__note">Your display preferences are saved on this device. Scroll reveals and the invitation opening respect your motion preference.</p></div>';
  document.body.appendChild(dialog);

  modeSelect = dialog.querySelector('#invitation-motion-mode');
  modeSelect.value = root.dataset.motionMode;
  modeSelect.addEventListener('change', function () {
    preferences.motion = modeSelect.value;
    applyMotion(preferences.motion);
    save();
  });

  function save() {
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch (_) {}
  }

  var videoField = dialog.querySelector('[data-video-quality-field]');
  var qualitySelect = dialog.querySelector('#invitation-video-quality');
  var qualityValues = new Set();
  var videos = Array.from(document.querySelectorAll('video'));
  videos.forEach(function (video) {
    Array.from(video.querySelectorAll('source[data-quality]')).forEach(function (source) {
      qualityValues.add(source.dataset.quality);
    });
  });
  var qualities = Array.from(qualityValues).sort(function (a, b) { return Number(b) - Number(a); });

  if (videos.length && qualities.length) {
    videoField.hidden = false;
    qualitySelect.add(new Option('Auto · best available', 'auto'));
    qualities.forEach(function (quality) {
      qualitySelect.add(new Option(/^\d+$/.test(quality) ? quality + 'p' : quality, quality));
    });
    qualitySelect.value = qualities.includes(preferences.videoQuality) ? preferences.videoQuality : 'auto';
    qualitySelect.addEventListener('change', function () {
      preferences.videoQuality = qualitySelect.value;
      applyVideoQuality(qualitySelect.value);
      save();
    });
    applyVideoQuality(qualitySelect.value);
  } else {
    videoField.hidden = false;
    qualitySelect.add(new Option(videos.length ? 'No quality variants available' : 'No video in this invitation', 'unavailable'));
    qualitySelect.disabled = true;
  }

  function applyVideoQuality(requested) {
    videos.forEach(function (video) {
      var sources = Array.from(video.querySelectorAll('source[data-quality]'));
      if (!sources.length) return;
      var choice = requested === 'auto' ? sources.slice().sort(function (a, b) { return Number(b.dataset.quality) - Number(a.dataset.quality); })[0] : sources.find(function (source) { return source.dataset.quality === requested; });
      if (!choice || video.src === new URL(choice.src, document.baseURI).href) return;
      var time = video.currentTime;
      var playing = !video.paused;
      video.src = choice.src;
      video.load();
      video.addEventListener('loadedmetadata', function restore() {
        video.removeEventListener('loadedmetadata', restore);
        video.currentTime = Math.min(time, video.duration || time);
        if (playing) video.play().catch(function () {});
      });
    });
  }

  trigger.addEventListener('click', function () { dialog.showModal(); });
  dialog.querySelector('.invitation-settings__close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  systemReduced.addEventListener('change', function (event) {
    if (!preferences.motion) applyMotion(event.matches ? 'reduced' : 'full');
  });
})();

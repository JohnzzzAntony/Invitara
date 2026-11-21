/* Homepage hero: featured designs as a swipeable card deck on phones and a 3D coverflow on wider screens
 * (Swiper, already vendored), plus the rotating occasion word. One button pauses every moving part (WCAG 2.2.2);
 * reduced motion keeps the deck still and the word fixed. */
(function () {
  'use strict';
  var E = window, deck = document.getElementById('hero-deck');
  if (!deck || !E.Swiper || !E.INVITARA_availableTemplates) return;
  var C = E.EVER_C, esc = E.EVER_esc, cat = E.INVITARA_CATALOG;
  var root = deck.parentElement, controls = root.nextElementSibling, toggle = controls.querySelector('.mz-toggle');
  var wide = matchMedia('(min-width: 1024px)'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var swiper = null, paused = false;

  // One design per occasion first, so the opening cards show the range.
  var seen = {}, first = [], rest = [];
  E.INVITARA_availableTemplates().filter(function (t) { return t.poster; }).forEach(function (t) {
    (seen[t.occasion] ? rest : first).push(t); seen[t.occasion] = true;
  });
  deck.innerHTML = first.concat(rest).map(function (t, i) {
    return '<a class="swiper-slide mz-slide" href="design.html?id=' + encodeURIComponent(t.id) + '">' +
      '<img src="' + esc(t.poster) + '" alt="" width="600" height="900" decoding="async"' + (i > 2 ? ' loading="lazy"' : '') + '>' +
      '<span class="mz-slide-meta"><b>' + esc(t.name) + '</b><em>' + esc(cat ? cat.label(t.occasion) : t.occasion) + ' · ' + esc(C.localMoney(C.startingPrice(t.id))) + '</em></span></a>';
  }).join('');

  function mount() {
    if (swiper) swiper.destroy(true, true);
    var coverflow = wide.matches, still = reduced.matches;
    swiper = new E.Swiper(root, {
      effect: coverflow ? 'coverflow' : 'cards',
      grabCursor: true, centeredSlides: true, rewind: true,
      slidesPerView: coverflow ? 'auto' : 1,
      initialSlide: coverflow ? 1 : 0,
      coverflowEffect: { rotate: 24, stretch: 0, depth: 220, modifier: 1, scale: .9, slideShadows: false },
      cardsEffect: { perSlideOffset: 9, perSlideRotate: 3, rotate: true, slideShadows: false },
      speed: still ? 0 : 750,
      autoplay: still ? false : { delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true, slideLabelMessage: 'Design {{index}} of {{slidesLength}}' },
      navigation: { prevEl: controls.querySelector('[data-dir=prev]'), nextEl: controls.querySelector('[data-dir=next]') },
      pagination: { el: controls.querySelector('.carousel-pagination'), clickable: true, bulletClass: 'carousel-dot', bulletActiveClass: 'is-active',
        renderBullet: function (i, cls) { return '<button type="button" class="' + cls + '" aria-label="Go to design ' + (i + 1) + '"></button>'; } }
    });
    if (paused && !still) swiper.autoplay.stop();
    toggle.hidden = still;
  }

  // Rotating occasion word: screen readers get the fixed word "celebration" beside it.
  var word = document.querySelector('.mz-word'), words = word ? word.dataset.words.split(',') : [], at = 0;
  setInterval(function () {
    if (!word || paused || reduced.matches || document.hidden) return;
    at = (at + 1) % words.length;
    word.classList.remove('is-in'); void word.offsetWidth;
    word.textContent = words[at]; word.classList.add('is-in');
  }, 2600);

  toggle.addEventListener('click', function () {
    paused = !paused;
    if (paused) swiper.autoplay.stop(); else swiper.autoplay.start();
    root.closest('.mz-hero').classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    toggle.firstElementChild.textContent = paused ? '▶' : '❚❚';
  });
  wide.addEventListener('change', mount); reduced.addEventListener('change', mount);
  mount();
})();

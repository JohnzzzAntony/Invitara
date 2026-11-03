(function () {
  var root = document.documentElement;
  var cards = Array.from(document.querySelectorAll('body > ul > li'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!cards.length || reduced || !('IntersectionObserver' in window)) return;
  root.classList.add('gallery-motion');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  cards.forEach(function (card) { observer.observe(card); });
})();

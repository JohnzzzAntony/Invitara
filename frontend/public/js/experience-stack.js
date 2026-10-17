/* Static gallery: stable reading order and ordinary keyboard navigation. */
(function () {
  'use strict';
  var host = document.getElementById('home-experiences');
  if (!host) return;
  var photos = ['ws-rings', 'ws-cafe', 'ws-couple', 'ws-decor', 'ws-dance', 'ws-proposal', 'ev-anniv', 'ev-tropical'];
  host.classList.add('experience-stack');
  Array.from(host.children).forEach(function (card, i) {
    var copy = document.createElement('div');
    copy.className = 'stack-copy';
    while (card.firstChild) copy.append(card.firstChild);
    var image = document.createElement('img');
    image.src = 'assets/' + photos[i % photos.length] + '.jpg';
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 600;
    image.height = 600;
    var visual = document.createElement('div');
    visual.className = 'stack-visual';
    visual.append(image);
    card.append(copy, visual);
  });
})();

// Homepage: the design collection (Feature Carousel), fed by the live catalogue. The hero lives in js/hero.js.
import { featureCarousel } from './feature-carousel.js';

const E = window;

const host = document.getElementById('design-carousel');
if (host && E.INVITARA_availableTemplates) {
  const icons = E.INVITARA_OCCASION_ICONS || {};
  featureCarousel(host, E.INVITARA_availableTemplates().map((t) => ({
    id: t.id,
    label: t.name,
    icon: (icons[t.occasion === 'product-launch' ? 'corporate' : t.occasion] || icons.other || ['', ''])[1],
    image: t.poster,
    // First sentence only: the rest of a design's description lists its motion effects.
    description: t.description.split('. ')[0].replace(/\.?$/, '.'),
    href: 'design.html?id=' + encodeURIComponent(t.id)
  })));
}

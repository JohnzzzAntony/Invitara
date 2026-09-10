/* gen-landing.mjs — build the SEO landing pages.
 *
 * Emits one static public/<slug>.html per entry in landing-content.mjs, so
 * each page is real crawlable HTML rather than a client-rendered route. The
 * pages share the site's chrome and stylesheets; only the copy, metadata and
 * the design-grid filter differ.
 *
 * Run:  node scripts/gen-landing.mjs
 *
 * The output files are GENERATED — edit scripts/landing-content.mjs and
 * re-run rather than hand-editing public/<slug>.html.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './landing-content.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'https://your-domain.example';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* Chrome shared with the rest of the site. Kept inline (rather than fetched
   at runtime) so the pages are complete HTML for a crawler. */
const header = (slug) => `  <header class="site-header" id="top">
    <div class="container header-inner">
      <a class="logo" href="index.html" aria-label="Invitara — home">INVIT<span>ARA</span></a>
      <nav class="main-nav" aria-label="Primary">
        <a href="index.html" class="nav-link">Home</a>
        <a href="create.html" class="nav-link">Designs</a>
        <a href="index.html#how" class="nav-link">How it works</a>
        <a href="pricing.html" class="nav-link">Pricing</a>
        <a href="index.html#faq" class="nav-link">F.A.Q.</a>
        <button class="nav-link resume-btn" type="button" data-resume>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.6V12l3 1.8"/></svg>
          Continue editing
        </button>
        <a href="create.html" class="btn btn-primary btn-nav">Get started</a>
      </nav>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu" hidden>
    <nav aria-label="Mobile">
      <a href="index.html">Home</a>
      <a href="create.html">Designs</a>
      <a href="index.html#how">How it works</a>
      <a href="pricing.html">Pricing</a>
      <a href="index.html#faq">F.A.Q.</a>
      <button class="mobile-resume" type="button" data-resume>Continue editing</button>
      <a href="create.html" class="btn btn-primary btn-block">Get started</a>
    </nav>
  </div>`;

const footer = () => `  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="f-brand">
        <a class="logo logo-light" href="index.html">INVIT<span>ARA</span></a>
        <p class="f-tagline">Create. Customize. Celebrate.</p>
        <p>Elegant online RSVP pages for weddings, birthdays, anniversaries, housewarmings and every occasion.</p>
      </div>
      <nav class="f-col" aria-label="Occasions">
        <h4>Occasions</h4>
        <a href="wedding-invitations.html">Weddings</a>
        <a href="birthday-invitations.html">Birthdays</a>
        <a href="anniversary-invitations.html">Anniversaries</a>
        <a href="baby-shower-invitations.html">Baby showers</a>
        <a href="gala-invitations.html">Galas</a>
      </nav>
      <nav class="f-col" aria-label="Product">
        <h4>Product</h4>
        <a href="create.html">Designs</a>
        <a href="pricing.html">Pricing</a>
        <a href="online-rsvp.html">Online RSVP</a>
        <a href="digital-invitations.html">Digital invitations</a>
        <a href="dashboard.html">My invitations</a>
      </nav>
      <nav class="f-col" aria-label="Support">
        <h4>Support</h4>
        <a href="index.html#faq">F.A.Q.</a>
        <a href="mailto:hello@your-domain.example">Contact us</a>
        <a href="privacy.html">Privacy policy</a>
        <a href="terms.html">Terms of service</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <div class="container fb-inner">
        <p>© <span id="year">2026</span> Invitara. All rights reserved.</p>
        <p>Made with care for every celebration.</p>
      </div>
    </div>
  </footer>`;

function jsonLd(p) {
  const url = `${HOST}/${p.slug}.html`;
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': url,
          url,
          name: p.title,
          description: p.description,
          isPartOf: { '@id': `${HOST}/#site` },
          inLanguage: 'en',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${HOST}/` },
            { '@type': 'ListItem', position: 2, name: p.kicker, item: url },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: p.faq.map(([q, a]) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        },
      ],
    },
    null,
    2
  );
}

function page(p) {
  const url = `${HOST}/${p.slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- GENERATED by scripts/gen-landing.mjs — edit scripts/landing-content.mjs -->
  <title>${esc(p.title)} | Invitara</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="keywords" content="${esc(p.keywords)}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${url}" />
  <meta name="theme-color" content="#faf7f2" />
  <meta name="author" content="Invitara" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Invitara" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(p.title)} | Invitara" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:image" content="${HOST}/assets/og-cover.jpg" />
  <meta property="og:image:alt" content="Invitara — beautiful event invitation websites with online RSVP" />
  <meta name="twitter:card" content="summary_large_image" />

  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23652901'/%3E%3Ctext x='16' y='21.5' font-family='Georgia,serif' font-size='15' fill='white' text-anchor='middle'%3EI%3C/text%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,500&family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Great+Vibes&family=Jost:wght@300;400;500&family=Lato:wght@300;400;700&family=Parisienne&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="css/commerce.css" />

  <script type="application/ld+json">
${jsonLd(p)}
  </script>
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>

${header(p.slug)}

  <main id="content">
    <section class="page-head">
      <div class="container">
        <p class="kicker center">${esc(p.kicker)}</p>
        <h1>${esc(p.h1)}</h1>
        <p class="lead">${esc(p.lead)}</p>
        <div class="lp-actions">
          <a href="create.html" class="btn btn-primary btn-lg">Browse the designs</a>
          <a href="pricing.html" class="arrow-link">See pricing <span aria-hidden="true">&#8594;</span></a>
        </div>
      </div>
    </section>

    <section class="picker">
      <div class="container">
        <h2 class="section-title center">Designs for this occasion</h2>
        <p class="section-sub center">Every price shown includes the design and its entry plan, paid once.</p>
        <div class="pick-grid" id="pick-grid" data-event="${esc(p.event || '')}"></div>
        <div class="picker-more">
          <a href="create.html" class="btn btn-primary btn-lg">See all 8 designs</a>
        </div>
      </div>
    </section>

    <section class="lp-points">
      <div class="container">
        <div class="lp-grid">
${p.intro
  .map(
    (b) => `          <article class="lp-point">
            <h3>${esc(b.h)}</h3>
            <p>${esc(b.p)}</p>
          </article>`
  )
  .join('\n')}
        </div>
      </div>
    </section>

    <section class="how">
      <div class="container">
        <p class="kicker center">How it works</p>
        <h2 class="section-title center">Four steps, about ten minutes</h2>
        <ol class="steps">
          <li class="step"><span class="step-num" aria-hidden="true">1</span><h3>Pick a design</h3><p>Choose from 8 designs, one for each kind of occasion.</p></li>
          <li class="step"><span class="step-num" aria-hidden="true">2</span><h3>Make it yours</h3><p>Edit every word, photo and colour in a live editor.</p></li>
          <li class="step"><span class="step-num" aria-hidden="true">3</span><h3>Preview and pay</h3><p>See exactly what guests will see, then pay once.</p></li>
          <li class="step"><span class="step-num" aria-hidden="true">4</span><h3>Publish and share</h3><p>Send one link. Replies come back to you.</p></li>
        </ol>
      </div>
    </section>

    <section class="faq">
      <div class="container">
        <h2 class="section-title center">Questions, answered</h2>
        <div class="acc">
${p.faq
  .map(
    ([q, a]) => `          <div class="acc-item">
            <button class="acc-btn" type="button" aria-expanded="false">
              <span>${esc(q)}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path class="acc-v" d="M12 5v14"/></svg>
            </button>
            <div class="acc-panel"><p>${esc(a)}</p></div>
          </div>`
  )
  .join('\n')}
        </div>
      </div>
    </section>

    <section class="cta-band">
      <div class="container cta-inner">
        <h2>Your next celebration starts with one link</h2>
        <p>Pick a design, make it yours, and send it today.</p>
        <a href="create.html" class="btn btn-light btn-lg">Get started — from AED 58</a>
      </div>
    </section>
  </main>

${footer()}

  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

  <script src="js/templates.js"></script>
  <script src="js/commerce.js"></script>
  <script src="js/app.js"></script>
  <script src="js/picker.js"></script>
</body>
</html>
`;
}

let n = 0;
for (const p of PAGES) {
  writeFileSync(resolve(ROOT, `public/${p.slug}.html`), page(p));
  console.log(`  wrote public/${p.slug}.html`);
  n++;
}
console.log(`\n${n} landing pages generated`);

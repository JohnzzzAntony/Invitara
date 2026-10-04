/* ==========================================================================
   Invitara — core engine v4: multi-layout template catalog
   10 layouts (poetic, herald, atrium, editorial, calm, terra, crescent,
   heritage, mandala, serene) x 13 premium themes, spread across nine event
   types. Each layout is a port of one Muhibbi invitation home page; they
   live in js/layouts/*.js, share js/mu.js and register themselves through
   EVER_registerLayout (see docs/LAYOUT-SPEC.md).
   ========================================================================== */
(function () {
  'use strict';

  /* The layout a theme falls back to when it names none. */
  var DEFAULT_LAYOUT = 'vellum';

  /* ------------------------------------------------------------------ *
   *  Icons (inline SVG, stroke = currentColor)                          *
   * ------------------------------------------------------------------ */
  var ICONS = {
    rings:    '<svg viewBox="0 0 24 24"><circle cx="9" cy="14" r="5.5"/><circle cx="15" cy="14" r="5.5"/><path d="M9 8.5 7.5 6h3L9 8.5zm6 0L13.5 6h3L15 8.5z"/></svg>',
    cocktail: '<svg viewBox="0 0 24 24"><path d="M5 4h14l-7 8v7"/><path d="M8.5 12h7M9 20h6"/></svg>',
    dinner:   '<svg viewBox="0 0 24 24"><path d="M4 16a8 8 0 0 1 16 0"/><path d="M2.8 16h18.4M12 8V6.2M10.6 6.2h2.8"/></svg>',
    music:    '<svg viewBox="0 0 24 24"><path d="M9 18.5V6l10-2v12.5"/><circle cx="6.8" cy="18.5" r="2.2"/><circle cx="16.8" cy="16.5" r="2.2"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>',
    clock:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2.2"/></svg>',
    pin:      '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10z"/><circle cx="12" cy="10.6" r="2.3"/></svg>',
    dress:    '<svg viewBox="0 0 24 24"><path d="M9.5 3.5 12 6l2.5-2.5M9.5 3.5 8 8l1.6 1.2L8 20.5h8l-1.6-11.3L16 8l-1.5-4.5"/></svg>',
    car:      '<svg viewBox="0 0 24 24"><path d="M5 13 6.6 8.2A1.6 1.6 0 0 1 8.1 7h7.8a1.6 1.6 0 0 1 1.5 1.2L19 13M5 13h14v5.4h-2.2M5 13v5.4h2.2M7.6 18.4h8.8"/><circle cx="7.8" cy="18.3" r="1.6"/><circle cx="16.2" cy="18.3" r="1.6"/></svg>',
    bell:     '<svg viewBox="0 0 24 24"><path d="M4 17.5h16M5.5 17.5a6.5 6.5 0 0 1 13 0M12 11V9.2M12 6.6a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"/></svg>',
    chair:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.6" r="1.9"/><path d="M12 6.5v6M12 12.5H8.4a2 2 0 0 0-2 2V20M12 12.5h3.6a2 2 0 0 1 2 2V20M10 20v-3M14 20v-3"/></svg>',
    snow:     '<svg viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M12 3l-2 2M12 3l2 2M12 21l-2-2M12 21l2-2"/></svg>',
    phone:    '<svg viewBox="0 0 24 24"><path d="M7.6 3.8 9.8 6a1.7 1.7 0 0 1 0 2.4l-1 1a12.8 12.8 0 0 0 5.8 5.8l1-1a1.7 1.7 0 0 1 2.4 0l2.2 2.2a1.7 1.7 0 0 1 0 2.4l-1.1 1.1c-1 1-2.6 1.3-3.9.7A22 22 0 0 1 5 10.8c-.6-1.3-.3-2.9.7-3.9l1-1a1.7 1.7 0 0 1 .9-2.1z"/></svg>',
    mail:     '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 3.5a8.4 8.4 0 0 0-7.3 12.7L3.5 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.5z"/><path d="M9.3 8.4c.6-.2.8 0 1 .5l.5 1.1c.1.3 0 .6-.2.8l-.5.5a6.4 6.4 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.1.5c.5.2.7.4.5 1-.3.9-1.4 1.3-2.3 1A8.6 8.6 0 0 1 8.3 10.7c-.3-.9.1-2 1-2.3z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M14.5 8.5H16V5.8h-2c-2 0-3.2 1.3-3.2 3.3v1.7H9v2.6h1.8v6.8h2.7v-6.8h2.2l.4-2.6h-2.6V9.4c0-.6.3-.9 1-.9z"/></svg>',
    instagram:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none"/></svg>',
    share:    '<svg viewBox="0 0 24 24"><circle cx="6.5" cy="12" r="2.3"/><circle cx="17" cy="6.5" r="2.3"/><circle cx="17" cy="17.5" r="2.3"/><path d="m8.6 10.9 6.3-3.2M8.6 13.1l6.3 3.2"/></svg>',
    heart:    '<svg viewBox="0 0 24 24"><path d="M12 20s-7.2-4.6-7.2-9.8A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.2 2.6C19.2 15.4 12 20 12 20z"/></svg>',
    camera:   '<svg viewBox="0 0 24 24"><path d="M4 8.5h3l1.6-2.3h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.2"/></svg>',
    chevron:  '<svg viewBox="0 0 24 24"><path d="m6 9.5 6 6 6-6"/></svg>',
    gift:     '<svg viewBox="0 0 24 24"><rect x="4" y="9.5" width="16" height="11" rx="1.5"/><path d="M3.5 6.5h17v3h-17zM12 6.5V20.5M12 6.5s-1-3.5-3.5-3.5a1.9 1.9 0 0 0 0 3.5zM12 6.5s1-3.5 3.5-3.5a1.9 1.9 0 0 1 0 3.5z"/></svg>',
    cake:     '<svg viewBox="0 0 24 24"><path d="M4 20.5h16M5.5 20.5v-6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6M9.5 12.5V10M14.5 12.5V10M12 12V9"/><path d="M12 7.2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"/></svg>',
    game:     '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>',
    home:     '<svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5M6 10v10h12V10M10 20v-6h4v6"/></svg>',
    key:      '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><path d="m11 11 9 9M17 17l2.2-2.2M14 14l2.2-2.2"/></svg>',
    cross:    '<svg viewBox="0 0 24 24"><path d="M12 4v16M7.5 9h9"/></svg>',
    star:     '<svg viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/></svg>',
    moon:     '<svg viewBox="0 0 24 24"><path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5z"/></svg>',
    sun:      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/></svg>',
    leaf:     '<svg viewBox="0 0 24 24"><path d="M19 5c-8 0-13 4-13 11 0 1.5.3 2.6.7 3C8 13 11 10.5 15.5 9.5 11 12 8.2 15 7.2 19c.7.3 1.6.5 2.8.5 7 0 9-7.5 9-14.5z"/></svg>',
    baby:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6.5"/><path d="M9.6 9h.01M14.4 9h.01M9.8 12.4a3.2 3.2 0 0 0 4.4 0M12 16.5V21M9 21h6"/></svg>',
    spark:    '<svg viewBox="0 0 24 24"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>',
    glass:    '<svg viewBox="0 0 24 24"><path d="M8 3h8l-1 6a3 3 0 0 1-6 0zM12 12v8M8.5 20h7"/></svg>'
  };

  /* ------------------------------------------------------------------ *
   *  Photo library (bundled, deployment-safe relative paths)            *
   * ------------------------------------------------------------------ */
  var PHOTOS = [
    /* Muhibbi template photography — public/mu/images.
       GENERATED by .zscripts/gen-photos.mjs; re-run it after adding files. */
    { id: 'mu-hero-1', src: 'mu/images/hero/image.jpg', label: 'Hero 1' },
    { id: 'mu-hero-2', src: 'mu/images/hero/image-2.jpg', label: 'Hero 2' },
    { id: 'mu-hero-3', src: 'mu/images/hero/image-3.jpg', label: 'Hero 3' },
    { id: 'mu-hero-4', src: 'mu/images/hero/image-4.jpg', label: 'Hero 4' },
    { id: 'mu-hero-5', src: 'mu/images/hero/image-5.jpg', label: 'Hero 5' },
    { id: 'mu-hero-6', src: 'mu/images/hero/image-6.jpg', label: 'Hero 6' },
    { id: 'mu-hero-7', src: 'mu/images/hero/image-7.jpg', label: 'Hero 7' },
    { id: 'mu-hero-8', src: 'mu/images/hero/image-8.jpg', label: 'Hero 8' },
    { id: 'mu-hero-9', src: 'mu/images/hero/image-9.jpg', label: 'Hero 9' },
    { id: 'mu-hero-10', src: 'mu/images/hero/image-10.jpg', label: 'Hero 10' },
    { id: 'mu-hero-11', src: 'mu/images/hero/image-11.jpg', label: 'Hero 11' },
    { id: 'mu-hero-12', src: 'mu/images/hero/image-12.jpg', label: 'Hero 12' },
    { id: 'mu-hero-13', src: 'mu/images/hero/image-13.jpg', label: 'Hero 13' },
    { id: 'mu-hero-14', src: 'mu/images/hero/image-14.jpg', label: 'Hero 14' },
    { id: 'mu-hero-15', src: 'mu/images/hero/image-15.jpg', label: 'Hero 15' },
    { id: 'mu-hero-16', src: 'mu/images/hero/image-16.jpg', label: 'Hero 16' },
    { id: 'mu-hero-17', src: 'mu/images/hero/image-17.jpg', label: 'Hero 17' },
    { id: 'mu-hero-18', src: 'mu/images/hero/image-18.jpg', label: 'Hero 18' },
    { id: 'mu-hero-19', src: 'mu/images/hero/image-19.jpg', label: 'Hero 19' },
    { id: 'mu-hero-20', src: 'mu/images/hero/image-20.jpg', label: 'Hero 20' },
    { id: 'mu-couple-1', src: 'mu/images/couple/image-1.jpg', label: 'Portrait 1' },
    { id: 'mu-couple-2', src: 'mu/images/couple/image-2.jpg', label: 'Portrait 2' },
    { id: 'mu-couple-3', src: 'mu/images/couple/image-3.jpg', label: 'Portrait 3' },
    { id: 'mu-couple-4', src: 'mu/images/couple/image-4.jpg', label: 'Portrait 4' },
    { id: 'mu-couple-5', src: 'mu/images/couple/image-5.jpg', label: 'Portrait 5' },
    { id: 'mu-couple-6', src: 'mu/images/couple/image-6.jpg', label: 'Portrait 6' },
    { id: 'mu-couple-7', src: 'mu/images/couple/image-7.jpg', label: 'Portrait 7' },
    { id: 'mu-couple-8', src: 'mu/images/couple/image-8.jpg', label: 'Portrait 8' },
    { id: 'mu-couple-9', src: 'mu/images/couple/image-9.jpg', label: 'Portrait 9' },
    { id: 'mu-couple-10', src: 'mu/images/couple/image-10.png', label: 'Portrait 10' },
    { id: 'mu-couple-11', src: 'mu/images/couple/image-11.png', label: 'Portrait 11' },
    { id: 'mu-couple-12', src: 'mu/images/couple/image-12.jpg', label: 'Portrait 12' },
    { id: 'mu-couple-13', src: 'mu/images/couple/image-13.jpg', label: 'Portrait 13' },
    { id: 'mu-story-1', src: 'mu/images/story/image-1.jpg', label: 'Story 1' },
    { id: 'mu-story-2', src: 'mu/images/story/image-2.jpg', label: 'Story 2' },
    { id: 'mu-story-3', src: 'mu/images/story/image-3.jpg', label: 'Story 3' },
    { id: 'mu-story-4', src: 'mu/images/story/image-4.jpg', label: 'Story 4' },
    { id: 'mu-story-5', src: 'mu/images/story/image-5.jpg', label: 'Story 5' },
    { id: 'mu-story-6', src: 'mu/images/story/image-6.jpg', label: 'Story 6' },
    { id: 'mu-story-7', src: 'mu/images/story/image-7.jpg', label: 'Story 7' },
    { id: 'mu-story-8', src: 'mu/images/story/image-8.jpg', label: 'Story 8' },
    { id: 'mu-story-9', src: 'mu/images/story/image-9.jpg', label: 'Story 9' },
    { id: 'mu-story-10', src: 'mu/images/story/image-10.jpg', label: 'Story 10' },
    { id: 'mu-story-11', src: 'mu/images/story/image-11.jpg', label: 'Story 11' },
    { id: 'mu-story-12', src: 'mu/images/story/image-12.jpg', label: 'Story 12' },
    { id: 'mu-story-13', src: 'mu/images/story/image-13.jpg', label: 'Story 13' },
    { id: 'mu-story-14', src: 'mu/images/story/image-14.jpg', label: 'Story 14' },
    { id: 'mu-story-15', src: 'mu/images/story/image-15.jpg', label: 'Story 15' },
    { id: 'mu-story-16', src: 'mu/images/story/image-16.jpg', label: 'Story 16' },
    { id: 'mu-story-17', src: 'mu/images/story/image-17.jpg', label: 'Story 17' },
    { id: 'mu-story-18', src: 'mu/images/story/image-18.jpg', label: 'Story 18' },
    { id: 'mu-story-19', src: 'mu/images/story/image-19.jpg', label: 'Story 19' },
    { id: 'mu-story-20', src: 'mu/images/story/image-20.jpg', label: 'Story 20' },
    { id: 'mu-story-21', src: 'mu/images/story/image-21.jpg', label: 'Story 21' },
    { id: 'mu-story-22', src: 'mu/images/story/image-22.jpg', label: 'Story 22' },
    { id: 'mu-story-23', src: 'mu/images/story/image-23.jpg', label: 'Story 23' },
    { id: 'mu-story-24', src: 'mu/images/story/image-24.jpg', label: 'Story 24' },
    { id: 'mu-story-25', src: 'mu/images/story/image-25.jpg', label: 'Story 25' },
    { id: 'mu-story-26', src: 'mu/images/story/image-26.jpg', label: 'Story 26' },
    { id: 'mu-story-27', src: 'mu/images/story/image-27.jpg', label: 'Story 27' },
    { id: 'mu-story-28', src: 'mu/images/story/image-28.jpg', label: 'Story 28' },
    { id: 'mu-story-29', src: 'mu/images/story/image-29.jpg', label: 'Story 29' },
    { id: 'mu-story-30', src: 'mu/images/story/image-30.jpg', label: 'Story 30' },
    { id: 'mu-story-31', src: 'mu/images/story/image-31.jpg', label: 'Story 31' },
    { id: 'mu-story-32', src: 'mu/images/story/image-32.jpg', label: 'Story 32' },
    { id: 'mu-gallery-1', src: 'mu/images/gallery/image-1.jpg', label: 'Gallery 1' },
    { id: 'mu-gallery-2', src: 'mu/images/gallery/image-2.jpg', label: 'Gallery 2' },
    { id: 'mu-gallery-3', src: 'mu/images/gallery/image-3.jpg', label: 'Gallery 3' },
    { id: 'mu-gallery-4', src: 'mu/images/gallery/image-4.jpg', label: 'Gallery 4' },
    { id: 'mu-gallery-5', src: 'mu/images/gallery/image-5.jpg', label: 'Gallery 5' },
    { id: 'mu-gallery-6', src: 'mu/images/gallery/image-6.jpg', label: 'Gallery 6' },
    { id: 'mu-gallery-7', src: 'mu/images/gallery/image-7.jpg', label: 'Gallery 7' },
    { id: 'mu-gallery-8', src: 'mu/images/gallery/image-8.jpg', label: 'Gallery 8' },
    { id: 'mu-gallery-9', src: 'mu/images/gallery/image-9.jpg', label: 'Gallery 9' },
    { id: 'mu-gallery-11', src: 'mu/images/gallery/image-11.jpg', label: 'Gallery 11' },
    { id: 'mu-gallery-12', src: 'mu/images/gallery/image-12.jpg', label: 'Gallery 12' },
    { id: 'mu-gallery-13', src: 'mu/images/gallery/image-13.jpg', label: 'Gallery 13' },
    { id: 'mu-gallery-14', src: 'mu/images/gallery/image-14.jpg', label: 'Gallery 14' },
    { id: 'mu-gallery-15', src: 'mu/images/gallery/image-15.jpg', label: 'Gallery 15' },
    { id: 'mu-gallery-16', src: 'mu/images/gallery/image-16.jpg', label: 'Gallery 16' },
    { id: 'mu-gallery-17', src: 'mu/images/gallery/image-17.jpg', label: 'Gallery 17' },
    { id: 'mu-gallery-18', src: 'mu/images/gallery/image-18.jpg', label: 'Gallery 18' },
    { id: 'mu-gallery-19', src: 'mu/images/gallery/image-19.jpg', label: 'Gallery 19' },
    { id: 'mu-gallery-20', src: 'mu/images/gallery/image-20.jpg', label: 'Gallery 20' },
    { id: 'mu-gallery-21', src: 'mu/images/gallery/image-21.jpg', label: 'Gallery 21' },
    { id: 'mu-gallery-22', src: 'mu/images/gallery/image-22.jpg', label: 'Gallery 22' },
    { id: 'mu-gallery-23', src: 'mu/images/gallery/image-23.jpg', label: 'Gallery 23' },
    { id: 'mu-gallery-24', src: 'mu/images/gallery/image-24.jpg', label: 'Gallery 24' },
    { id: 'mu-gallery-25', src: 'mu/images/gallery/image-25.jpg', label: 'Gallery 25' },
    { id: 'mu-gallery-26', src: 'mu/images/gallery/image-26.jpg', label: 'Gallery 26' },
    { id: 'mu-gallery-27', src: 'mu/images/gallery/image-27.jpg', label: 'Gallery 27' },
    { id: 'mu-gallery-28', src: 'mu/images/gallery/image-28.jpg', label: 'Gallery 28' },
    { id: 'mu-gallery-29', src: 'mu/images/gallery/image-29.jpg', label: 'Gallery 29' },
    { id: 'mu-gallery-30', src: 'mu/images/gallery/image-30.jpg', label: 'Gallery 30' },
    { id: 'mu-gallery-31', src: 'mu/images/gallery/image-31.jpg', label: 'Gallery 31' },
    { id: 'mu-gallery-32', src: 'mu/images/gallery/image-32.jpg', label: 'Gallery 32' },
    { id: 'mu-gallery-33', src: 'mu/images/gallery/image-33.jpg', label: 'Gallery 33' },
    { id: 'mu-gallery-34', src: 'mu/images/gallery/image-34.jpg', label: 'Gallery 34' },
    { id: 'mu-gallery-35', src: 'mu/images/gallery/image-35.jpg', label: 'Gallery 35' },
    { id: 'mu-gallery-36', src: 'mu/images/gallery/image-36.jpg', label: 'Gallery 36' },
    { id: 'mu-gallery-37', src: 'mu/images/gallery/image-37.jpg', label: 'Gallery 37' },
    { id: 'mu-gallery-38', src: 'mu/images/gallery/image-38.jpg', label: 'Gallery 38' },
    { id: 'mu-gallery-39', src: 'mu/images/gallery/image-39.jpg', label: 'Gallery 39' },
    { id: 'mu-gallery-40', src: 'mu/images/gallery/image-40.jpg', label: 'Gallery 40' },
    { id: 'mu-gallery-41', src: 'mu/images/gallery/image-41.jpg', label: 'Gallery 41' },
    { id: 'mu-gallery-42', src: 'mu/images/gallery/image-42.jpg', label: 'Gallery 42' },
    { id: 'mu-gallery-43', src: 'mu/images/gallery/image-43.jpg', label: 'Gallery 43' },
    { id: 'mu-gallery-44', src: 'mu/images/gallery/image-44.jpg', label: 'Gallery 44' },
    { id: 'mu-portfolio-1', src: 'mu/images/portfolio/image-1.jpg', label: 'Photo 1' },
    { id: 'mu-portfolio-2', src: 'mu/images/portfolio/image-2.jpg', label: 'Photo 2' },
    { id: 'mu-portfolio-3', src: 'mu/images/portfolio/image-3.jpg', label: 'Photo 3' },
    { id: 'mu-portfolio-4', src: 'mu/images/portfolio/image-4.jpg', label: 'Photo 4' },
    { id: 'mu-portfolio-5', src: 'mu/images/portfolio/image-5.jpg', label: 'Photo 5' },
    { id: 'mu-portfolio-6', src: 'mu/images/portfolio/image-6.jpg', label: 'Photo 6' },
    { id: 'mu-portfolio-7', src: 'mu/images/portfolio/image-7.jpg', label: 'Photo 7' },
    { id: 'mu-portfolio-8', src: 'mu/images/portfolio/image-8.jpg', label: 'Photo 8' },
    { id: 'mu-portfolio-9', src: 'mu/images/portfolio/image-9.jpg', label: 'Photo 9' },
    { id: 'mu-portfolio-10', src: 'mu/images/portfolio/image-10.jpg', label: 'Photo 10' },
    { id: 'mu-portfolio-11', src: 'mu/images/portfolio/image-11.jpg', label: 'Photo 11' },
    { id: 'mu-portfolio-12', src: 'mu/images/portfolio/image-12.jpg', label: 'Photo 12' },
    { id: 'mu-portfolio-13', src: 'mu/images/portfolio/image-13.jpg', label: 'Photo 13' },
    { id: 'mu-portfolio-14', src: 'mu/images/portfolio/image-14.jpg', label: 'Photo 14' },
    { id: 'mu-portfolio-15', src: 'mu/images/portfolio/image-15.jpg', label: 'Photo 15' },
    { id: 'mu-portfolio-16', src: 'mu/images/portfolio/image-16.jpg', label: 'Photo 16' },
    { id: 'mu-portfolio-17', src: 'mu/images/portfolio/image-17.jpg', label: 'Photo 17' },
    { id: 'mu-portfolio-18', src: 'mu/images/portfolio/image-18.jpg', label: 'Photo 18' },
    { id: 'mu-portfolio-19', src: 'mu/images/portfolio/image-19.jpg', label: 'Photo 19' },
    { id: 'mu-event-1', src: 'mu/images/event/image-1.jpg', label: 'Detail 1' },
    { id: 'mu-event-2', src: 'mu/images/event/image-2.jpg', label: 'Detail 2' },
    { id: 'mu-event-3', src: 'mu/images/event/image-3.jpg', label: 'Detail 3' },
    { id: 'mu-event-4', src: 'mu/images/event/image-4.jpg', label: 'Detail 4' },
    { id: 'mu-event-5', src: 'mu/images/event/image-5.jpg', label: 'Detail 5' },
    { id: 'mu-event-6', src: 'mu/images/event/image-6.jpg', label: 'Detail 6' },
    { id: 'mu-event-7', src: 'mu/images/event/image-7.jpg', label: 'Detail 7' },
    { id: 'mu-rsvp-1', src: 'mu/images/rsvp/image-1.jpg', label: 'RSVP panel 1' },
    { id: 'mu-rsvp-2', src: 'mu/images/rsvp/image-2.jpg', label: 'RSVP panel 2' },
    { id: 'mu-rsvp-3', src: 'mu/images/rsvp/image-3.jpg', label: 'RSVP panel 3' },
    { id: 'mu-rsvp-4', src: 'mu/images/rsvp/image-4.png', label: 'RSVP panel 4' },
    { id: 'mu-blog-1', src: 'mu/images/blog/img-1.jpg', label: 'Card 1' },
    { id: 'mu-blog-2', src: 'mu/images/blog/img-2.jpg', label: 'Card 2' },
    { id: 'mu-blog-3', src: 'mu/images/blog/img-3.jpg', label: 'Card 3' },
    { id: 'mu-product-1', src: 'mu/images/product/img-1.jpg', label: 'Gift 1' },
    { id: 'mu-product-2', src: 'mu/images/product/img-2.jpg', label: 'Gift 2' },
    { id: 'mu-product-3', src: 'mu/images/product/img-3.jpg', label: 'Gift 3' },
    { id: 'mu-product-4', src: 'mu/images/product/img-4.jpg', label: 'Gift 4' },
    { id: 'mu-quote-1', src: 'mu/images/quote/image-1.jpg', label: 'Quote 1' },
    { id: 'mu-quote-2', src: 'mu/images/quote/image-2.jpg', label: 'Quote 2' },
    { id: 'mu-date-1', src: 'mu/images/wedding-date/img-1.png', label: 'Date frame 1' },
    { id: 'mu-date-2', src: 'mu/images/wedding-date/img-2.png', label: 'Date frame 2' },
    { id: 'mu-date-3', src: 'mu/images/wedding-date/img-3.png', label: 'Date frame 3' },
    { id: 'mu-date-4', src: 'mu/images/wedding-date/img-4.png', label: 'Date frame 4' },
    { id: 'mu-date-5', src: 'mu/images/wedding-date/img-5.png', label: 'Date frame 5' },
    { id: 'mu-offer-1', src: 'mu/images/offer-image/img-1.jpg', label: 'Feature 1' },
    { id: 'mu-video', src: 'mu/images/video.jpg', label: 'Video still' },
    { id: 'mu-video-2', src: 'mu/images/video-2.jpg', label: 'Video still 2' },
    { id: 'mu-cta', src: 'mu/images/cta.jpg', label: 'Invitation band' },
    { id: 'mu-contact', src: 'mu/images/contact-bg.jpg', label: 'Contact backdrop' },
    { id: 'mu-soft', src: 'mu/images/pricing/bg.jpg', label: 'Soft backdrop' },
    /* Invitara occasion photography — public/assets. */
    { id: 'couple', src: 'assets/ws-couple.jpg', label: 'Couple portrait' },
    { id: 'cafe', src: 'assets/ws-cafe.jpg', label: 'First meeting' },
    { id: 'proposal', src: 'assets/ws-proposal.jpg', label: 'The proposal' },
    { id: 'rings', src: 'assets/ws-rings.jpg', label: 'The rings' },
    { id: 'dance', src: 'assets/ws-dance.jpg', label: 'First dance' },
    { id: 'decor', src: 'assets/ws-decor.jpg', label: 'Reception decor' },
    { id: 'shoes', src: 'assets/hero.jpg', label: 'Bridal style' },
    { id: 'band', src: 'assets/cta-band.jpg', label: 'Celebration' },
    { id: 'balloons', src: 'assets/ev-balloons.jpg', label: 'Balloons & confetti' },
    { id: 'neon', src: 'assets/ev-neon.jpg', label: 'Neon party' },
    { id: 'glam', src: 'assets/ev-glam.jpg', label: 'Glam party table' },
    { id: 'tropical', src: 'assets/ev-tropical.jpg', label: 'Tropical pool party' },
    { id: 'anniv', src: 'assets/ev-anniv.jpg', label: 'Anniversary table' },
    { id: 'silver', src: 'assets/ev-silver.jpg', label: 'Silver celebration' },
    { id: 'home', src: 'assets/ev-home.jpg', label: 'New home porch' },
    { id: 'cottage', src: 'assets/ev-cottage.jpg', label: 'Cottage garden' },
    { id: 'baptism', src: 'assets/ev-baptism.jpg', label: 'Christening candles' },
    { id: 'baby', src: 'assets/ev-baby.jpg', label: 'Baby shower' },
    { id: 'gala', src: 'assets/ev-gala.jpg', label: 'Gala ballroom' },
    { id: 'star', src: 'assets/ev-star.jpg', label: 'Star party' }
  ];

  /* ------------------------------------------------------------------ *
   *  Event types                                                        *
   * ------------------------------------------------------------------ */
  var EVENTS = {
    wedding:      { label: 'Wedding',              tagline: 'Ceremonies & receptions' },
    engagement:   { label: 'Engagement',           tagline: 'Say it out loud' },
    birthday:     { label: 'Birthday',             tagline: 'Every milestone age' },
    anniversary:  { label: 'Anniversary',          tagline: 'Renew & remember' },
    housewarming: { label: 'Housewarming',         tagline: 'New address, open doors' },
    baptism:      { label: 'Baptism & Christening',tagline: 'A blessed beginning' },
    baby:         { label: 'Baby Shower & Kids',   tagline: 'Welcome little ones' },
    graduation:   { label: 'Graduation',           tagline: 'Years of work, one day' },
    gala:         { label: 'Gala & Evening',       tagline: 'Formal affairs' }
  };

  /* ------------------------------------------------------------------ *
   *  Fonts                                                              *
   * ------------------------------------------------------------------ */
  /* `stack` drives the site (via the --ws-display variable), `cls` renders the
     chip in the editor's font picker. */
  var NAME_FONTS = {
    corm:   { label: 'Classic',   cls: 'f-corm',    stack: '"Cormorant Garamond", serif' },
    pfd:    { label: 'Editorial', cls: 'f-pfd',     stack: '"Playfair Display", serif' },
    cinzel: { label: 'Grand',     cls: 'f-cinzel',  stack: '"Cinzel", serif' },
    vibes:  { label: 'Script',    cls: 'f-vibes',   stack: '"Great Vibes", cursive' },
    paris:  { label: 'Romantic',  cls: 'f-paris',   stack: '"Parisienne", cursive' },
    jost:   { label: 'Modern',    cls: 'f-jost',    stack: '"Jost", sans-serif' },
    baloo:  { label: 'Rounded',   cls: 'f-baloo',   stack: '"Baloo 2", cursive' }
  };
  var BODY_FONTS = {
    lato: { label: 'DM Sans',  cls: '',             stack: '"DM Sans", sans-serif' },
    jost: { label: 'Jost',  cls: 'ws-body-jost', stack: '"Jost", sans-serif' }
  };

  var CUSTOM_KEY = 'ever-rsvp-custom-tpl';
  var EVENT_KEY  = 'ever-rsvp-event';

  /* ------------------------------------------------------------------ *
   *  Helpers                                                            *
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* Security: only http(s) links and in-page anchors may be used in href/iframe
     sources the owner can type into — blocks javascript:/data:/vbscript: URLs.  */
  function safeUrl(u) {
    var s = String(u || '').trim();
    return /^(https:\/\/|http:\/\/|#[a-z0-9_-]*)/i.test(s) ? s : '';
  }
  function icon(name, cls) {
    return '<span class="ws-ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
      (ICONS[name] || ICONS.heart) + '</span>';
  }
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function dateObj(iso) {
    var d = new Date((iso || '') + 'T17:00:00');
    return isNaN(d.getTime()) ? new Date('2026-11-24T17:00:00') : d;
  }
  function fmtHeroDate(iso) {
    var d = dateObj(iso);
    return d.getDate() + ' \u00b7 ' + MONTHS[d.getMonth()].toUpperCase() + ' \u00b7 ' + d.getFullYear();
  }
  function fmtLongDate(iso) {
    var d = dateObj(iso);
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
  }
  function fmtWeekday(iso) {
    return DAYS[dateObj(iso).getDay()];
  }
  function monogram(a, b) {
    return (String(a || 'A').trim().charAt(0) + ' \u00b7 ' + String(b || 'R').trim().charAt(0)).toUpperCase();
  }
  function initials(s) {
    return String(s || 'E').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase() || 'E';
  }
  function photoSrc(idOrUrl) {
    if (!idOrUrl) return PHOTOS[0].src;
    if (/^(https?:|data:|\/|assets\/)/.test(idOrUrl)) return idOrUrl;
    for (var i = 0; i < PHOTOS.length; i++) if (PHOTOS[i].id === idOrUrl) return PHOTOS[i].src;
    return PHOTOS[0].src;
  }
  function directionsUrl(address, city) {
    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(((address || '') + ' ' + (city || '')).trim());
  }
  function deepMerge(dst, src) {
    if (!src || typeof src !== 'object') return dst;
    for (var k in src) {
      if (!Object.prototype.hasOwnProperty.call(src, k) || ['__proto__','constructor','prototype'].indexOf(k) !== -1) continue;
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) {
        deepMerge(dst[k], src[k]);
      } else if (src[k] !== undefined) {
        dst[k] = src[k];
      }
    }
    return dst;
  }
  function futureISO(monthsAhead, day) {
    var d = new Date();
    d.setDate(day || 24);
    d.setMonth(d.getMonth() + (monthsAhead || 0));
    var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var dd = String(d.getDate()); if (dd.length < 2) dd = '0' + dd;
    return d.getFullYear() + '-' + m + '-' + dd;
  }
  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (e) { return null; }
  }
  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ *
   *  Layout registry                                                    *
   * ------------------------------------------------------------------ */
  var LAYOUTS = [];
  function registerLayout(def) {
    if (!def || !def.id || !def.render) return;
    def.sections = def.sections || [];
    def.basics = def.basics || [];
    LAYOUTS.push(def);
  }
  function layouts() { return LAYOUTS.slice(); }
  function findLayout(id) {
    for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i].id === id) return LAYOUTS[i];
    return LAYOUTS[0];
  }
  function layoutOrder(layout) {
    return layout.sections.map(function (s) { return s.id; });
  }

  /* ------------------------------------------------------------------ *
   *  Theme catalog — 13 designs across nine occasions.                  *
   *                                                                     *
   *  Every layout carries at least one theme and every hero scene is     *
   *  claimed by one, so nothing in js/layouts/ or js/invites/ is dead     *
   *  code. Weddings get four because they are the deepest category.      *
   *                                                                     *
   *  Every layout is a port of one Muhibbi invitation home page. A theme *
   *  re-colours it (5 core colours + a display font), names its hero     *
   *  scene and ornament motif, and — this is the part that matters —     *
   *  overrides EVERY section its layout renders.                         *
   *                                                                     *
   *  That last rule exists because of a real defect: the layout defaults *
   *  are all weddings, and a theme that overrode only `hero` shipped a   *
   *  birthday party whose RSVP form said "Welcome to our big day" and    *
   *  whose story section explained how the couple met. The shared        *
   *  MU.rsvpDefaults() and MU.contactDefaults() are wedding copy too, so *
   *  a non-wedding theme MUST override `rsvp` and `contact` as well.     *
   *  If you add a theme, override every section id in its layout's spec. *
   *                                                                     *
   *  `scene`  — WebGL hero background, js/invites/scene-<id>.js          *
   *  `motion` — drifting ornament motif, js/site-motion.js              *
   * ------------------------------------------------------------------ */
  var THEMES = [
  {
    "id": "vellum",
    "name": "Vellum",
    "event": "wedding",
    "category": "Classic",
    "dark": "#363b2f",
    "gold": "#87734e",
    "bg": "#f5f1e9",
    "ink": "#38372f",
    "soft": "#e9e5da",
    "nameFont": "corm",
    "layout": "vellum",
    "ornament": "none"
  },
  {
    "id": "nocturne",
    "name": "Nocturne",
    "event": "gala",
    "category": "Luxe",
    "dark": "#101110",
    "gold": "#c2ad7a",
    "bg": "#101110",
    "ink": "#e7e5da",
    "soft": "#30262b",
    "nameFont": "corm",
    "layout": "nocturne",
    "ornament": "none"
  },
  {
    "id": "confetti",
    "name": "Confetti Club",
    "event": "birthday",
    "category": "Playful",
    "dark": "#2449da",
    "gold": "#dce868",
    "bg": "#2449da",
    "ink": "#f9f1dc",
    "soft": "#f0acd0",
    "nameFont": "jost",
    "layout": "confetti",
    "ornament": "none"
  },
  {
    "id": "bloom",
    "name": "Little Bloom",
    "event": "baby",
    "category": "Soft",
    "dark": "#55436a",
    "gold": "#8e7441",
    "bg": "#f6f0e7",
    "ink": "#55436a",
    "soft": "#e8e1f0",
    "nameFont": "corm",
    "layout": "bloom",
    "ornament": "none"
  },
  {
    "id": "atlas",
    "name": "Atlas",
    "event": "wedding",
    "category": "Modern",
    "dark": "#164c45",
    "gold": "#a94e2b",
    "bg": "#ede8da",
    "ink": "#164c45",
    "soft": "#d6df69",
    "nameFont": "jost",
    "layout": "atlas",
    "ornament": "none"
  }
];

  /* ------------------------------------------------------------------ *
   *  Templates: builtin + custom                                        *
   * ------------------------------------------------------------------ */
  function readCustom() {
    try {
      var arr = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function writeCustom(arr) {
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }
  function saveCustomTemplate(t) {
    var arr = readCustom();
    t.id = t.id || ('custom-' + Date.now());
    t.custom = true;
    t.event = t.event || 'wedding';
    t.layout = t.layout || DEFAULT_LAYOUT;
    t.category = t.category || 'Custom';
    var found = false;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === t.id) { arr[i] = t; found = true; break; }
    }
    if (!found) arr.push(t);
    writeCustom(arr);
    return t;
  }
  function deleteCustomTemplate(id) {
    writeCustom(readCustom().filter(function (t) { return t.id !== id; }));
  }
  function allTemplates() { return THEMES.slice(); }
  function findTemplate(id) {
    var list = allTemplates();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function templateExists(id) {
    return THEMES.some(function (t) { return t.id === id; }) ||
      readCustom().some(function (t) { return t.id === id; });
  }

  /* ------------------------------------------------------------------ *
   *  Default site content for a template                                *
   *  (layout defaults + template content overrides)                     *
   * ------------------------------------------------------------------ */
  function siteDefaults(templateId) {
    var tpl = templateId ? findTemplate(templateId) : THEMES[0];
    var layout = findLayout(tpl.layout || DEFAULT_LAYOUT);
    var dflt = layout.defaults ? layout.defaults() : { basics: {}, sections: {} };
    var d = {
      v: 4,
      layoutId: layout.id,
      templateId: tpl.id,
      nameFont: '',            /* '' = follow the template */
      bodyFont: 'lato',
      accent: 'tpl',           /* 'tpl' or hex */
      btnShape: 'soft',
      spacing: 'normal',
      basics: dflt.basics || {},
      order: layoutOrder(layout),
      sections: dflt.sections || {}
    };
    if (tpl.content) {
      if (Array.isArray(tpl.content.order)) d.order = tpl.content.order.filter(function(id){return d.sections[id];});
      if (tpl.content.basics) deepMerge(d.basics, tpl.content.basics);
      if (tpl.content.sections) {
        for (var k in tpl.content.sections) {
          if (!d.sections[k]) d.sections[k] = { on: true };
          deepMerge(d.sections[k], tpl.content.sections[k]);
        }
      }
    }
    return d;
  }

  /* ------------------------------------------------------------------ *
   *  State loader (editor) with v1/v2/v3 → v4 migration                 *
   * ------------------------------------------------------------------ */
  function loadSiteState(flow) {
    flow = flow || {};
    var saved = readJson(EVENT_KEY);
    var wanted = flow.design || (saved && saved.templateId) || '';
    if (wanted && !templateExists(wanted)) wanted = '';
    var d = siteDefaults(wanted || undefined);

    if (!saved || typeof saved !== 'object') return d;

    /* theme-ish top-level fields carry over on every version */
    ['nameFont', 'bodyFont', 'accent', 'btnShape', 'spacing'].forEach(function (k) {
      if (saved[k] !== undefined && saved[k] !== null && saved[k] !== '') d[k] = saved[k];
    });

    var savedLayout = null;
    if (saved.v === 4 && saved.layoutId && LAYOUTS.some(function (l) { return l.id === saved.layoutId; })) {
      savedLayout = saved.layoutId;
    } else if (saved.v === 3) {
      savedLayout = DEFAULT_LAYOUT; /* pre-v4 sites had a single wedding format */
    }

    if (saved.v === 4) {
      /* keep user edits; extra section keys are simply ignored by renderers */
      deepMerge(d, saved);
      if (saved.order && Array.isArray(saved.order) && saved.order.length) d.order = saved.order.slice();
    } else if (saved.v === 3) {
      if (saved.basics) deepMerge(d.basics, saved.basics);
      if (saved.sections) {
        for (var k in saved.sections) {
          if (d.sections[k]) deepMerge(d.sections[k], saved.sections[k]);
        }
      }
      if (Array.isArray(saved.order) && saved.order.length === d.order.length) d.order = saved.order.slice();
    } else {
      /* v1/v2 legacy: carry only universal bits */
      var TMAP = { eucalyptus: 'sage', monogram: 'champagne', 'golden-hour': 'champagne',
        midnight: 'navy', 'garden-party': 'sage', ocean: 'navy', ivory: 'champagne' };
      if (saved.sections && saved.sections.rsvp && saved.sections.rsvp.deadline) {
        d.sections.rsvp.deadline = saved.sections.rsvp.deadline;
      }
      if (saved.nameFont === 'classic') d.nameFont = 'corm';
      if (saved.nameFont === 'romantic') d.nameFont = 'paris';
      if (saved.nameFont === 'modern') d.nameFont = 'jost';
      void TMAP;
    }

    /* the design picked in checkout wins, but keep edits when the layout matches */
    if (flow.design && templateExists(flow.design) && flow.design !== d.templateId) {
      var newTpl = findTemplate(flow.design);
      if (newTpl.layout === d.layoutId) {
        d.templateId = flow.design; /* keep user edits */
      } else {
        d = siteDefaults(flow.design); /* new event type → fresh sample content */
      }
    }
    if (!templateExists(d.templateId)) d.templateId = THEMES[0].id;
    var tpl = findTemplate(d.templateId);
    if (!LAYOUTS.some(function (l) { return l.id === d.layoutId; }) || d.layoutId !== (tpl.layout || DEFAULT_LAYOUT)) {
      /* switching layouts keeps overlapping content keys via deepMerge below */
      var keep = { basics: d.basics, sections: d.sections };
      d = siteDefaults(d.templateId);
      deepMerge(d.basics, keep.basics);
      for (var sk in keep.sections) {
        if (d.sections[sk]) deepMerge(d.sections[sk], keep.sections[sk]);
      }
    }
    void savedLayout;
    return d;
  }

  /* ------------------------------------------------------------------ *
   *  Theme CSS variables + root elements                                *
   * ------------------------------------------------------------------ */
  /* '#rrggbb' → 'r, g, b' so a colour can also be used inside rgba(). */
  function rgbTriplet(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    if (h.length !== 6) return '';
    return parseInt(h.slice(0, 2), 16) + ', ' + parseInt(h.slice(2, 4), 16) + ', ' + parseInt(h.slice(4, 6), 16);
  }

  function themeVars(tpl, data) {
    var v = {
      '--ws-dark': tpl.dark, '--ws-gold': tpl.gold,
      '--ws-bg': tpl.bg, '--ws-ink': tpl.ink, '--ws-soft': tpl.soft
    };
    if (data && data.accent && data.accent !== 'tpl' && /^#?[0-9a-fA-F]{3,8}$/.test(data.accent)) {
      v['--ws-gold'] = data.accent.charAt(0) === '#' ? data.accent : '#' + data.accent;
    }
    /* the generated mu.css uses rgba(var(--ws-gold-rgb), a) for tinted overlays */
    var trip = rgbTriplet(v['--ws-gold']);
    if (trip) v['--ws-gold-rgb'] = trip;
    if (tpl.gold2) v['--ws-gold-2'] = tpl.gold2;
    /* display font: editor choice wins over the theme's own pairing */
    var nf = NAME_FONTS[(data && data.nameFont) || tpl.nameFont] || NAME_FONTS.corm;
    v['--ws-display'] = nf.stack;
    var bf = BODY_FONTS[(data && data.bodyFont) || 'lato'] || BODY_FONTS.lato;
    v['--ws-body'] = bf.stack;
    return v;
  }
  function applyVars(el, tpl, data) {
    var v = themeVars(tpl, data);
    for (var k in v) el.style.setProperty(k, v[k]);
  }
  function siteRoot(data, tpl, opts) {
    opts = opts || {};
    var layout = findLayout(data.layoutId || tpl.layout || DEFAULT_LAYOUT);
    var el = document.createElement('div');
    el.className = 'ws ws-' + layout.id + ' ws-orn-' + (tpl.ornament || 'lines') + ' ' +
      (BODY_FONTS[data.bodyFont] || BODY_FONTS.lato).cls +
      ' ws-bs-' + (data.btnShape || 'soft') + ' ws-sp-' + (data.spacing || 'normal') +
      (opts.interactive ? ' ws-live' : '');
    applyVars(el, tpl, data);
    return el;
  }
  function miniRoot(tpl, data, layoutId) {
    var el = document.createElement('div');
    el.className = 'wsm ws-' + (layoutId || tpl.layout || DEFAULT_LAYOUT) + ' ws-orn-' + (tpl.ornament || 'lines');
    el.setAttribute('aria-hidden', 'true');
    applyVars(el, tpl, data);
    return el;
  }

  /* ------------------------------------------------------------------ *
   *  Shared partials used by layouts                                    *
   * ------------------------------------------------------------------ */
  function timerHtml(dateISO) {
    return '<div class="ws-timer" data-ws-deadline="' + esc(dateISO) + 'T17:00:00" aria-label="Countdown timer">' +
      '<span class="ws-tbox"><b data-u="d">00</b><i>Days</i></span>' +
      '<span class="ws-tbox"><b data-u="h">00</b><i>Hours</i></span>' +
      '<span class="ws-tbox"><b data-u="m">00</b><i>Minutes</i></span>' +
      '<span class="ws-tbox"><b data-u="s">00</b><i>Seconds</i></span>' +
    '</div>';
  }
  function rsvpFormHtml(r) {
    var guests = '<option value="">Number of guests</option>';
    for (var i = 1; i <= (parseInt(r.guestsMax, 10) || 6); i++) guests += '<option value="' + i + '">' + i + '</option>';
    var meals = '<option value="">Meal preference</option>';
    (r.meals || []).forEach(function (m) { meals += '<option>' + esc(m) + '</option>'; });
    return '<form class="ws-rsvp-form" novalidate>' +
      '<div class="ws-frow">' +
        '<input type="text" name="name" placeholder="Your name" required/>' +
        (r.showPhone ? '<input type="tel" name="phone" placeholder="Phone number"/>' : '') +
      '</div>' +
      '<div class="ws-frow">' +
        '<select name="guests">' + guests + '</select>' +
        '<select name="attend" required><option value="">Will you attend?</option><option>Joyfully accept</option><option>Regretfully decline</option></select>' +
      '</div>' +
      '<div class="ws-frow">' +
        '<select name="meal">' + meals + '</select>' +
      '</div>' +
      (r.showMsg ? '<textarea name="msg" rows="3" placeholder="Your message (optional)"></textarea>' : '') +
      '<button class="ws-btn ws-btn-dark ws-submit" type="submit">' + esc(r.submit || 'Submit RSVP') + ' ' + icon('heart') + '</button>' +
    '</form>';
  }
  /* Scroll a container to `top`.
     `scrollTo({behavior:'smooth'})` is silently a no-op on some engines and
     inside some embedded views, which would leave the preview's own nav links
     and the editor's jump buttons doing nothing — so animate it ourselves and
     fall back to an instant jump when motion is not wanted. */
  function scrollElTo(el, top) {
    if (!el) return;
    top = Math.max(0, Math.min(top, el.scrollHeight - el.clientHeight));
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }
    var from = el.scrollTop;
    var dist = top - from;
    /* A hidden document gets no animation frames, so tween only when visible. */
    if (reduce || document.hidden || Math.abs(dist) < 2) { el.scrollTop = top; return; }
    var dur = Math.min(700, 220 + Math.abs(dist) * 0.25);
    var t0 = 0;
    if (el.__wsScroll) cancelAnimationFrame(el.__wsScroll);
    el.__wsScroll = requestAnimationFrame(function step(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;  /* easeInOutCubic */
      el.scrollTop = from + dist * e;
      if (p < 1) el.__wsScroll = requestAnimationFrame(step);
      else el.__wsScroll = 0;
    });
  }

  function mapIframe(url, title) {
    var src = safeUrl(url);
    return src
      ? '<iframe class="ws-map" src="' + esc(src) + '" title="' + esc(title || 'Venue map') + '" loading="lazy" referrerpolicy="no-referrer"></iframe>'
      : '<div class="ws-map ws-map-empty">' + icon('pin') + '<p>Map coming soon</p></div>';
  }

  /* ------------------------------------------------------------------ *
   *  Renderers (dispatch to the layout)                                 *
   * ------------------------------------------------------------------ */
  function renderSite(data, opts) {
    data = data || siteDefaults();
    var tpl = findTemplate(data.templateId);
    var layout = findLayout(data.layoutId || tpl.layout || DEFAULT_LAYOUT);
    return layout.render(data, tpl, opts || {});
  }

  function renderSiteMini(tpl, data, opts) {
    opts = opts || {};
    if (typeof tpl === 'string') tpl = findTemplate(tpl);
    data = data || siteDefaults(tpl.id);
    data.templateId = tpl.id;
    var layout = findLayout(tpl.layout || data.layoutId || DEFAULT_LAYOUT);
    if (layout.mini) return layout.mini(data, tpl, opts);
    return miniRoot(tpl, data, layout.id);
  }

  /* ------------------------------------------------------------------ *
   *  Live behaviours: countdown + anchors + RSVP + scroll reveal        *
   * ------------------------------------------------------------------ */
  function tickCountdowns(root) {
    var timers = (root || document).querySelectorAll('[data-ws-deadline]');
    Array.prototype.forEach.call(timers, function (t) {
      var end = new Date(t.getAttribute('data-ws-deadline')).getTime();
      if (isNaN(end)) return;
      var diff = Math.max(0, end - Date.now());
      var d = Math.floor(diff / 864e5),
          h = Math.floor(diff % 864e5 / 36e5),
          m = Math.floor(diff % 36e5 / 6e4),
          s = Math.floor(diff % 6e4 / 1e3);
      var map = { d: d, h: h, m: m, s: s };
      for (var u in map) {
        var node = t.querySelector('[data-u="' + u + '"]');
        if (node) node.textContent = String(map[u]).length < 2 ? '0' + map[u] : String(map[u]);
      }
    });
  }

  /**
   * Wire a rendered site: scroll-reveal, in-page nav, the RSVP demo, and the
   * layout behaviours in js/mu.js (sliders, mobile menu, lightbox).
   *
   * Sliders in particular MUST be bound — bindSliders() is what sizes each
   * slide to one-per-view. An unbound hero slider lays every slide out side
   * by side, which is what a published page looked like before invite.js
   * started calling this.
   *
   * opts.rsvpDemo  false on the published page, where a guest's reply is sent
   *                to the host by js/invite.js instead of being faked.
   */
  function bindSite(root, opts) {
    if (!root || root.__wsBound) return;
    root.__wsBound = true;
    opts = opts || {};
    /* gentle scroll-reveal for site sections (JS-added class: no-JS visitors
       never see hidden content; honours prefers-reduced-motion) */
    var reduceMotion = false;
    try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }
    if (!root.classList.contains('ex') && !reduceMotion && 'IntersectionObserver' in window) {
      var secs = root.querySelectorAll('.ws-sec, .ws-footer');
      Array.prototype.forEach.call(secs, function (sec) { sec.classList.add('ws-anim'); });
      var secIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('ws-in'); secIO.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      Array.prototype.forEach.call(secs, function (sec) { secIO.observe(sec); });
      root.__muDisposers = root.__muDisposers || [];
      root.__muDisposers.push(function(){secIO.disconnect();});
    }
    /* Smooth in-page nav. In the editor the site sits inside a scrolling
       canvas; on a published page the window is the scroller, so fall back to
       the document element rather than an ancestor that never scrolls. */
    root.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-goto]') : null;
      if (!a || !root.contains(a)) return;
      e.preventDefault();
      var target = root.querySelector('#ws-sec-' + a.getAttribute('data-goto'));
      if (!target) return;
      var wrap = root.closest('.ed-canvas-wrap') || document.getElementById('canvas-frame');
      if (wrap) {
        var top = target.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop - 10;
        scrollElTo(wrap, top);
      } else {
        var doc = document.scrollingElement || document.documentElement;
        scrollElTo(doc, target.getBoundingClientRect().top + doc.scrollTop - 10);
      }
    });
    /* RSVP demo submit — skipped where a real reply path exists (invite.js) */
    if (opts.rsvpDemo !== false) {
      root.addEventListener('submit', function (e) {
        var form = e.target.closest ? e.target.closest('.ws-rsvp-form') : null;
        if (!form || !root.contains(form)) return;
        e.preventDefault();
        var name = form.querySelector('[name="name"]');
        var attend = form.querySelector('[name="attend"]');
        if (name && !name.value.trim()) { name.classList.add('ws-err'); name.focus(); return; }
        if (attend && !attend.value) { attend.classList.add('ws-err'); attend.focus(); return; }
        var doneMsg = root.__wsData && root.__wsData.sections && root.__wsData.sections.rsvp &&
                      root.__wsData.sections.rsvp.success;
        var box = document.createElement('div');
        box.className = 'ws-rsvp-done';
        box.innerHTML = '<span class="ws-done-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg></span>' +
          '<b>RSVP received</b><p>' + esc(doneMsg || 'Thank you!') + '</p>';
        form.hidden = true;
        (form.parentElement || form.closest('.ws-sec') || root).appendChild(box);
      });
    }
    root.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('ws-err');
    }, true);
    /* layout-level behaviours (sliders, mobile menu, lightbox) — see js/mu.js */
    if (typeof window.MU_bind === 'function') window.MU_bind(root);


  }

  /* ------------------------------------------------------------------ */
  window.EVER_EVENTS = EVENTS;
  window.EVER_THEMES = THEMES;
  window.EVER_ICONS = ICONS;
  window.EVER_PHOTOS = PHOTOS;
  window.EVER_NAME_FONTS = NAME_FONTS;
  window.EVER_BODY_FONTS = BODY_FONTS;
  window.EVER_registerLayout = registerLayout;
  window.EVER_layouts = layouts;
  window.EVER_findLayout = findLayout;
  window.EVER_layoutOrder = layoutOrder;
  window.EVER_siteDefaults = siteDefaults;
  window.EVER_loadSiteState = loadSiteState;
  window.EVER_renderSite = renderSite;
  window.EVER_renderSiteMini = renderSiteMini;
  window.EVER_allTemplates = allTemplates;
  window.EVER_findTemplate = findTemplate;
  window.EVER_templateExists = templateExists;
  window.EVER_saveCustomTemplate = saveCustomTemplate;
  window.EVER_deleteCustomTemplate = deleteCustomTemplate;
  window.EVER_readCustomTemplates = readCustom;
  window.EVER_tickCountdowns = tickCountdowns;
  window.EVER_bindSite = bindSite;
  window.EVER_esc = esc;
  window.EVER_safeUrl = safeUrl;
  window.EVER_photoSrc = photoSrc;
  window.EVER_fmtHeroDate = fmtHeroDate;
  window.EVER_fmtLongDate = fmtLongDate;
  window.EVER_fmtWeekday = fmtWeekday;
  window.EVER_dateObj = dateObj;
  window.EVER_monogram = monogram;
  window.EVER_initials = initials;
  window.EVER_directionsUrl = directionsUrl;
  window.EVER_applyVars = applyVars;
  window.EVER_siteRoot = siteRoot;
  window.EVER_miniRoot = miniRoot;
  window.EVER_timerHtml = timerHtml;
  window.EVER_rsvpFormHtml = rsvpFormHtml;
  window.EVER_mapIframe = mapIframe;
  window.EVER_scrollElTo = scrollElTo;
  window.EVER_icon = icon;
  window.EVER_deepMerge = deepMerge;
  window.EVER_futureISO = futureISO;
  window.EVER_readJson = readJson;
  window.EVER_writeJson = writeJson;
  window.EVER_EVENT_KEY = EVENT_KEY;
  /* backwards-compatible aliases */
  window.EVER_TEMPLATES = THEMES;
  window.renderSiteMini = function (tpl, data) { return renderSiteMini(tpl, data); };
})();

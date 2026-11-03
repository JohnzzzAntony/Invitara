# Invitation templates (10)

Each folder is one self-contained, mobile-first digital invitation (`index.html`, with CSS, JS and SVG artwork inline). The only external request is Google Fonts.

| # | Folder | Occasion | Style |
|---|--------|----------|-------|
| 01 | `01-wedding-save-the-date-navy` | Wedding · Save the Date | Navy embossed florals, gold Art Deco type |
| 02 | `02-grand-opening-watercolor-estate` | Grand Opening | Watercolor trees, crest monogram, château |
| 03 | `03-mehndi-night-mughal-arch` | Mehndi Night | Lilac jali, Mughal arch, domes, peacock, birds |
| 04 | `04-engagement-burgundy-envelope` | Engagement | Burgundy envelope, striped card, oval photo, calla lilies |
| 05 | `05-anniversary-embossed-burgundy` | Anniversary | Tap-to-open embossed burgundy envelope, gold seal |
| 06 | `06-bridal-shower-dusty-rose-seal` | Bridal Shower | Tap-to-open dusty-rose felt envelope, rose wax seal |
| 07 | `07-wedding-reception-royal-crest` | Wedding Reception | Misty garden fountain, blue toile crest |
| 08 | `08-baby-shower-eucalyptus-gold` | Baby Shower | Watercolor eucalyptus, gold line-drawn rose |
| 09 | `09-birthday-blush-gold-monogram` | Birthday (30th) | Blush paper, gold numerals with line florals |
| 10 | `10-haldi-ceremony-garden-path` | Haldi Ceremony | Garden path, palms, lanterns, vintage car |

Open `index.html` at the root for a gallery of all ten. `manifest.json` lists each template's id, occasion, path, theme colour and event data, so you can import them into a catalogue.

## Customising a template

- **Event data** lives on `<body>`: `data-date` (ISO 8601 with a UTC offset, used by the countdown and calendar), `data-hours` (how long the event lasts, for the calendar), `data-title` and `data-venue`.
- **Text** (names, venue, schedule) is plain HTML. Also update `<title>`, the meta description and the `og:` tags.
- **Colours and fonts** are CSS custom properties in each file's `:root` (`--bg`, `--ink`, `--accent`, `--display`, `--script`, `--body`).
- **Photo** (template 04): replace the `src` of the image inside `.photo`.
- **Map links**: change each `maps.google.com/?q=` link.

## RSVP integration

Every template uses the same form markup (`form[data-rsvp]`, with fields `name`, `attending`, `guests` and `message`).

- Set `data-endpoint="https://your-api/rsvp"` on the form to POST JSON: `{name, attending, guests, message, event}`. A non-2xx response shows the inline error and lets the guest try again.
- Whether or not an endpoint is set, a successful submit dispatches `document` → `invite:rsvp` (`event.detail` holds the same JSON), so your site's own script can handle it:

```js
document.addEventListener('invite:rsvp', e => myApi.saveRsvp(e.detail));
```

Without an endpoint the form only shows the thank-you message, so remember to connect one before guests use it.

## Behaviour and accessibility

- Templates 05 and 06 open with an envelope. Without JavaScript the cover is skipped and the invitation is shown directly.
- Countdown, scroll reveal and "Add to calendar" (Google Calendar link) come from the shared script at the bottom of each file.
- `prefers-reduced-motion` turns animations off. All templates include a skip link, labelled form fields, visible focus styles and decorative SVGs hidden from screen readers.

The shared `premium-controls.css` and `premium-controls.js` files add a settings button to every invitation. Guests can choose full, reduced or off motion; the selection is saved on their device. The gallery uses a one-time, IntersectionObserver reveal and respects the operating system's reduced-motion preference.

The settings panel includes a video-quality selector. It becomes active when a template includes video sources marked with numeric or named `data-quality` values on its `<source>` elements. The current ten designs contain no video, so the selector explains that no video is available.
- Tested at 390 px wide with no horizontal scroll. The page is centred at a 480 px maximum width on larger screens.

## About the artwork

The designs follow the layout, palette, typography and mood of the Pinterest references. All illustrations (florals, buildings, envelopes, crests, birds, car) are original SVG drawn for these files, and every name and venue is a placeholder. No third-party template artwork or photography is included.

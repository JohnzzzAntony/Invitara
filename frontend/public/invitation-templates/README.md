# Animated invitation templates (11–20)

Ten premium, mobile-first digital invitations. Each opens with its own tap-to-open intro and then tells its story through scroll-driven motion. Every folder is one self-contained `index.html` (CSS, JS and SVG artwork are inline; only Google Fonts load externally). Open `index.html` at the root for a gallery, and use `manifest.json` to import them into a catalogue.

| # | Template | Occasion | Tap-to-open intro | Scroll motion |
|---|----------|----------|-------------------|---------------|
| 11 | Moonlit Garden Gates | Wedding | Iron gates swing open | Fireflies, parallax garden, pinned moonrise with rising lanterns, scroll-drawn timeline |
| 12 | Royal Palace Doors | Wedding (Indian) | Carved doors open in 3D | Falling marigold petals, rotating mandala, pinned arch tunnel, pinned horizontal event carousel |
| 13 | Golden Champagne | 50th anniversary | Pop the cork, confetti burst | Gold dust, 0→50 counter, pinned film-strip timeline, clinking glasses |
| 14 | Cinema Love Story | 10th anniversary | Curtains part, 3-2-1 film leader | Film grain, projector beam, spinning reels, masked film frames, ticket reveal |
| 15 | Gates in the Clouds | 18th birthday | Untie the bow, gates and clouds part | Parallax clouds and balloons, pinned balloon rise with the sky turning to night |
| 16 | Art-Deco Cocktail | 40th birthday | Deco panels slide apart | Self-drawing deco frame, neon flicker, pinned martini that fills as you scroll |
| 17 | Perfume Unveil | Product launch | Silk drape lifts off the bottle | Spotlight and smoke, floating bottle, pinned fragrance-note reveal |
| 18 | Coming Soon Drop | Product launch | 3-2-1 launch countdown | Scroll-linked marquee type, pinned product zoom with feature callouts, stat counters |
| 19 | We Found Our Home | Housewarming | Turn the key, the door swings open | Pinned scene where the house builds itself (walls, roof, lights, smoke) |
| 20 | Diya & Rangoli | Griha Pravesh | Light the diya, the rangoli draws itself | Swinging toran, pinned rangoli bloom, flickering diyas |

## Motion engine (shared, inlined in every file)

The engine is declarative: you add attributes to HTML and no per-template JavaScript is needed.

| Attribute | Effect |
|---|---|
| `data-rv="up/down/left/right/zoom/blur/tilt/mask/wipe"` | Reveal when scrolled into view. Delay with `style="--d:400ms"` |
| `data-stagger` | Children reveal one after another |
| `data-split` | Splits text into letters that animate in |
| `data-count="50"` | Counts up from 0 when visible |
| `data-draw` on an SVG | Strokes draw themselves. `data-draw="scroll"` ties the drawing to scroll |
| `data-speed="1.2"` | Parallax |
| `class="pin" data-progress="pin" style="--len:300"` | A pinned scene. Children read `--p` (0→1) in CSS, e.g. `opacity: clamp(0, calc((var(--p) - .3) * 6), 1)` |
| `<canvas data-particles="petals/confetti/dust/fireflies/bubbles/smoke/sparks" data-colors="#a,#b">` | Ambient particles. They pause when off-screen or when the tab is hidden |
| `data-open="2500"` on a button | The tap-to-open intro. It adds `.opening` straight away and `.opened` after the given ms |
| `window.inviteBurst(x, y, colors)` | A one-off confetti burst |

## Customising

- **Event data** lives on `<body>`: `data-date` (ISO 8601 with offset, which drives the countdown and calendar), `data-hours`, `data-title` and `data-venue`. Text is plain HTML, and colours and fonts are CSS variables in `:root`.
- **RSVP** works the same way in every template. Set `data-endpoint="https://…"` on the form to POST JSON `{name, attending, guests, message, event}`, and/or listen for `document.addEventListener('invite:rsvp', e => …)`. Without an endpoint the form only shows a thank-you message, so connect one before sending invitations.
- **Bottom dock** links to `#top`, `#story`, `#events`, `#venue` and `#rsvp`. Keep those ids if you rearrange sections.

## Accessibility and performance

- **Reduced motion:** with `prefers-reduced-motion`, intros open instantly, pinned scenes become normal sections, particles stay off and all content is visible.
- **No JavaScript:** the intro is skipped and all content and the RSVP form are shown.
- **Rendering:** only transform and opacity are animated. There is one throttled scroll loop, particle counts scale with screen area and stay capped, and the device pixel ratio is capped at 2.
- **Accessibility:** skip link, labelled form, visible focus rings, decorative SVG hidden from screen readers, and split text keeps an `aria-label`.
- **Tested:** at 390 px and 1280 px wide, covering open, reveal of every element, no horizontal overflow, countdown, calendar link, RSVP success and validation, reduced motion and no-JS.

## Artwork

These designs follow motifs common in the Pinterest references (gates, palace doors, wax seals, curtains, drapes, toran and rangoli). All illustrations are original SVG and CSS. Names, brands (Maison Sahar, Halo Audio) and venues are fictional placeholders.

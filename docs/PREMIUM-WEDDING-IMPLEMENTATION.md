# Premium wedding implementation

Five active premium designs complement the original 14 editions. Earlier Atelier designs remain archived.

- NOIR: black and gold monogram, cinematic opening, horizontal story and RSVP panel.
- AURELIA: ivory and sage, botanical SVG growth and scroll opening.
- MAISON: burgundy editorial typography, asymmetric chapters and gallery.
- VELVET: draggable curtains, formal programme and wardrobe details.
- VOYAGE: destination motion plate, animated route, weekend itinerary and accommodation.

Shared features include tap/drag/scroll openings, scratch showroom with a 65% coverage threshold and button fallback, saved favorites, mobile showroom swipe, keyboard gallery, optional music, calendar download, sharing, reduced motion and editable invitation content. Dietary and accommodation responses use the existing authenticated RSVP backend and dashboard export. Public guestbook entries are host-curated; submitted wishes remain private until deliberately added by the host.

Product metadata, prices, sitemap and answer-oriented catalogue content include the premium designs. Prices are AED 249–299 before the existing VAT calculation.

## Verification

Run `npm run test:premium`, `npm test`, `npm run build` and `npm run lint` from the root. Browser checks use Microsoft Edge and cover five designs at 320, 390, 768 and 1440 pixels, opening interactions, gallery, calendar, music, RSVP preview and editor persistence. Backend tests validate catalogue state and stored dietary/accommodation replies, including access restrictions.

## Media and launch notes

Photographs are optimized WebP versions of existing project assets. The optional ambient WAV is synthesized locally. The destination WebM is a moving photographic plate, not location footage. Hosts can replace media through the editor. Hotel descriptions, room rates and travel details are editable sample content and must be confirmed for the event. Music requires guest activation.

No measured Lighthouse scores or physical-device certification are claimed. Existing production payment and deployment acceptance gates still apply; see RELEASE-READINESS.md.

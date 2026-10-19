# Business collection

Six additive templates on the existing Express / vanilla JavaScript platform. Existing invitations and prices remain unchanged. No new runtime packages.

## Design direction
Purpose: help hosts publish distinctive, editable business invitations and collect private RSVPs.
DFII: impact 5 + context 5 + feasibility 5 + performance 4 - consistency risk 4 = 15.

- Grand Reveal: brand launch; a champagne on charcoal editorial. Scroll to part the reveal curtains.
- Open Doors: boutique opening; forest green, an arched storefront and scroll-linked hinged doors.
- Spotlight: product launch; graphite and mint, a scroll-linked orbital beam and keyboard accessible product rotation.
- Executive Vision: corporate reception; navy and brass, a sealed envelope opened as the stamp breaks.
- First Table: restaurant opening; a terracotta dining editorial. Scroll to lift a sculpted cloche; the expandable menu follows.
- Architectural: property preview; a mineral green architectural drawing. Scroll to erase its blueprint and reveal the residence.

Existing Cormorant Garamond and Jost font families; existing theme variables; 7% page gutters; 25/50/100px section rhythm. One deliberate reveal per template, scroll-linked artwork and one-shot section entrances. Reduced-motion and pause controls remove animation without removing content. Product artwork is explicitly an illustration, not a 3D model.

## Openings and occasions
Each template is listed under its own storefront occasion: Brand Launch, Store Opening, Product Launch, Corporate Event, Restaurant Opening or Property Launch. All six openings now scrub their occasion-specific Anime.js timelines as guests scroll: curtains part, boutique doors swing, a product spotlight blooms, an executive seal breaks, a cloche rises and a blueprint gives way to a residence. Scroll back to reverse the reveal. A visible button opens by tap or keyboard, with replay, pause and reduced-motion support. Anime.js is bundled with the project build and loaded only when needed.

## Editing and use
Find the six designs in Create > Business events. All use the existing editor, theme controls, media uploads, section ordering, draft save, payment, publish and private guest-reply infrastructure. Hero, story, features/speakers/menu/amenities, agenda, location, date and RSVP are editable. Feature content uses the existing timeline fields. Gallery starts disabled until hosts add their own photos. Original SVG demo artwork is local and replaceable with uploaded imagery. Illustrative companies, speaker names and locations must be replaced by the host before publishing.

Hosts can choose an existing hero opening setting or `none` in the editor. The occasion-matched opening is the default. It has a visible keyboard button and a replay control. Full, gentle and reduced motion settings remain honored. Calendar links and downloaded ICS use the configured timezone and end time. A restaurant reply requests a seat and does not claim to confirm a reservation.

Scope is six usable templates, not a replacement event-management platform. Existing publish/payment/ownership behavior applies; this change does not add ticketing, guest check-in, GLB hosting, scheduled publishing or an administration/revision service.

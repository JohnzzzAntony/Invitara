# Premium site UI

The shared layer is `frontend/public/css/premium-ui.css` and `frontend/public/js/premium-ui.js`. Pages with shared navigation load both. Invitation canvases retain their own themes.

Treatments: animated CTA arrows and highlight sweeps; navigation underlines; page scroll progress; one-time section reveals; occasion icon motion; pointer-lit experience cards; editorial feature, process and pricing panels; animated native-details FAQs; input focus rings; footer link motion. Reduced-motion preferences cancel active UI animations. Content remains visible without JavaScript.

Public design references reviewed on Skiper UI:
- https://skiper-ui.com/components
- CssLink / Text roll navigation / Animated icons
- Scroll with fade effect / Scroll progress
- Gradient hover cards / Bouncy accordion

These are original vanilla JavaScript and CSS adaptations of interaction patterns, not imported paid component source. The earlier carousel adapts the user-supplied Skiper UI Carousel_006 reference; attribution remains in its source.

Verification: `node scripts/premium-ui-check.mjs` with the preview on localhost:3002 checks five pages at 320, 390, 768 and 1440 pixels, FAQ mouse and keyboard activation, mobile navigation and browser errors. Screenshot evidence is saved under artifacts/premium-ui-*.png.

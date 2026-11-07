# PODIE components (vendored originals)

Unmodified sources and MIT notices for the two components ported to plain JavaScript for this site:

| Component | Original | License | Port |
|---|---|---|---|
| Feature Carousel (uselayouts, Urvish Mali) | `feature-carousel.original.tsx` from https://podie.dev/r/uselayouts--feature-carousel.json | `LICENSE-feature-carousel.txt` (MIT) | `frontend/motion/feature-carousel.js` |
| Shadow Text (kokonutUI, @dorianbaffier) | `shadow-text.original.tsx` (+ the Lumen demo) from https://podie.dev/r/kokonut--shadow-text.json | `LICENSE-shadow-text.txt` (MIT) | `frontend/motion/shadow-text.js` |

The site is plain HTML served by Express (no React or Tailwind), so the components are ported line for line: same timings, easing, maths and interactions. The carousel animates with the same `motion` library (vanilla `animate` instead of `motion/react`). Content and colours are adapted to Respondr.

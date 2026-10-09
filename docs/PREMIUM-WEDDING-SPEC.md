# Invitara — Premium Interactive Wedding Template Collection
## High-Fidelity Wireframe & Build Specification

**Project:** Invitara  
**Target:** Existing Invitara website  
**Purpose:** Add 5 premium, animated, highly interactive wedding invitation templates that feel like luxury digital experiences rather than ordinary invitation pages.

---

# 1. Product Direction

The new template collection should position Invitara as a **premium interactive invitation platform**.

The templates must not feel like five variations of the same webpage. Each template has its own:

- Visual identity
- Opening interaction
- Scroll behavior
- Signature animation
- Storytelling structure
- RSVP experience
- Gallery behavior
- Micro-interactions
- Preview experience

### Core principle

> **The guest should feel like they are opening, touching and experiencing a real invitation.**

Avoid excessive animation. Premium motion should be slow, intentional and elegant.

---

# 2. Template Collection

| ID | Template | Style | Signature Interaction |
|---|---|---|---|
| T01 | **NOIR** | Black luxury / cinematic | Gold monogram + light reveal |
| T02 | **AURELIA** | Botanical / romantic | Garden grows while scrolling |
| T03 | **MAISON** | Fashion editorial | Typography-driven transitions |
| T04 | **VELVET** | Royal / ballroom | Curtains + physical invitation |
| T05 | **VOYAGE** | Destination / cinematic | Interactive travel journey |

---

# 3. Shared Invitation Experience

Every template should support these optional interaction modes:

### Mode A — Tap to Open

Initial screen displays a closed invitation.

```text
┌──────────────────────────────────────────────┐
│                                              │
│                INVITARA                      │
│                                              │
│                 ✦                            │
│                                              │
│              ALEX & ELENA                    │
│                                              │
│         ┌─────────────────────┐              │
│         │                     │              │
│         │       INVITATION    │              │
│         │                     │              │
│         │          ✦          │              │
│         │                     │              │
│         └─────────────────────┘              │
│                                              │
│             TAP TO OPEN                      │
│                                              │
└──────────────────────────────────────────────┘
```

Interaction:

1. User taps invitation.
2. Envelope/card opens.
3. Cover transitions into Hero.
4. Background music can begin only after user interaction.
5. A subtle "Scroll to explore" indicator appears.

---

# 4. Mode B — Scroll to Open

The invitation starts visually closed.

```text
┌──────────────────────────────────────────────┐
│                 ✦                            │
│                                              │
│            ALEX & ELENA                      │
│                                              │
│              07.12.2026                      │
│                                              │
│          ────────────────                    │
│                                              │
│              SCROLL ↓                        │
│                                              │
└──────────────────────────────────────────────┘
```

As the user scrolls:

```text
0%      Closed invitation
25%     Envelope begins opening
50%     Cover moves away
75%     Photograph revealed
100%    Hero completely revealed
```

The scroll should control the animation progress.

---

# 5. Mode C — Scratch to Reveal

A premium interactive preview should be available from the template marketplace.

```text
┌──────────────────────────────────────────────┐
│                                              │
│           ✦ SCRATCH TO REVEAL ✦             │
│                                              │
│       ┌─────────────────────────────┐        │
│       │  ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦    │        │
│       │                             │        │
│       │       SCRATCH HERE          │        │
│       │                             │        │
│       │  ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦    │        │
│       └─────────────────────────────┘        │
│                                              │
│             18% REVEALED                     │
│                                              │
└──────────────────────────────────────────────┘
```

Scratch layer:

- Canvas-based or optimized DOM mask
- Touch + mouse support
- Progress percentage
- Reveal completion threshold: ~65%
- On completion: elegant particle/reveal animation
- CTA: **EXPLORE THIS TEMPLATE**

Use scratch primarily for **marketplace previews**, not as a mandatory interaction for every guest.

---

# 6. Mode D — Drag to Open

For selected templates, the guest can physically drag an envelope or curtain.

```text
┌──────────────────────────────────────────────┐
│                                              │
│               DRAG TO OPEN                   │
│                                              │
│        ┌─────────────────────────┐           │
│        │                         │           │
│        │        INVITATION       │           │
│        │                         │           │
│        └───────────────●─────────┘           │
│                        ↔                     │
│                                              │
└──────────────────────────────────────────────┘
```

Use spring physics and subtle resistance.

---

# 7. T01 — NOIR
## The Black Luxury Experience

### Visual Direction

- Obsidian black
- Ivory
- Champagne gold
- Editorial serif typography
- Fine lines
- Soft grain
- Cinematic photography
- Metallic accents

### Hero Wireframe

```text
┌──────────────────────────────────────────────┐
│  07.12.2026                         MENU ☰   │
│                                              │
│                 ✦                            │
│                                              │
│                    J                         │
│                 ↘  ↓  ↙                     │
│                                              │
│             JOHN & ANNA                      │
│                                              │
│             07 · 12 · 2026                   │
│                                              │
│       [FULL-SCREEN CINEMATIC IMAGE]          │
│                                              │
│                 ↓ SCROLL                     │
└──────────────────────────────────────────────┘
```

### Opening Animation

1. Black screen.
2. Single gold particle appears.
3. Particle expands into monogram.
4. Gold light sweeps horizontally.
5. Couple names fade in.
6. Portrait slowly appears.
7. Hero image begins subtle zoom.
8. Scroll indicator appears.

### Sections

#### Section 01 — The Couple

```text
┌──────────────────────────────────────────────┐
│                                              │
│              THE COUPLE                      │
│                                              │
│       ┌─────────────────────────────┐        │
│       │                             │        │
│       │      LARGE PORTRAIT         │        │
│       │                             │        │
│       └─────────────────────────────┘        │
│                                              │
│          JOHN                 ANNA            │
│                                              │
└──────────────────────────────────────────────┘
```

Motion:
- Image slow zoom
- Names move independently
- Gold line draws itself

#### Section 02 — Our Story

Horizontal scroll.

```text
2019 ─────── 2021 ─────── 2024 ─────── 2026
  │           │            │             │
PHOTO       PHOTO        PHOTO         WEDDING
```

#### Section 03 — The Celebration

Oversized typography:

```text
THE
DAY
```

Then event details reveal.

#### Section 04 — Timeline

```text
04:00   CEREMONY
06:00   COCKTAIL
08:00   DINNER
10:00   DANCE
```

Gold vertical progress line follows scroll.

#### Section 05 — Gallery

Asymmetric editorial grid.

#### Section 06 — Venue

Full-width photograph + minimal map.

#### Section 07 — RSVP

Black glass card.

#### Section 08 — Final Scene

```text
THANK YOU
FOR BEING
PART OF
OUR STORY.
```

Gold particles slowly disappear.

---

# 8. T02 — AURELIA
## The Living Garden

### Visual Direction

- Warm ivory
- Soft sage
- Champagne
- Botanical illustrations
- Fine line artwork
- Elegant serif + clean sans-serif

### Opening

A single branch appears.

As the guest scrolls:

```text
Branch → Leaves → Flowers → Full Garden
```

The couple's names are revealed between the flowers.

### Hero Wireframe

```text
┌──────────────────────────────────────────────┐
│                                              │
│          [BOTANICAL ILLUSTRATION]            │
│                                              │
│               ALEX & ELENA                   │
│                                              │
│             07 DECEMBER                      │
│                                              │
│       [COUPLE PORTRAIT]                      │
│                                              │
│        ↓ GROW WITH US                        │
└──────────────────────────────────────────────┘
```

### Sections

1. **The Couple**
2. **Our Story**
3. **The Garden**
4. **Wedding Details**
5. **Gallery**
6. **Venue**
7. **RSVP**
8. **Guestbook**
9. **Final Garden**

### Signature Interaction

Every major section adds botanical growth.

At the final section the entire page is surrounded by the completed garden.

---

# 9. T03 — MAISON
## The Luxury Editorial

### Visual Direction

Inspired by:

- Fashion editorials
- French luxury houses
- Premium magazines
- Architectural layouts

Palette:

- Ivory
- Charcoal
- Burgundy accent
- Champagne

### Opening

```text
┌──────────────────────────────────────────────┐
│                                              │
│              ELENA                           │
│                                              │
│                  &                           │
│                                              │
│                         ALEX                 │
│                                              │
│             [EDITORIAL PHOTO]                │
│                                              │
│             07 / 12 / 2026                   │
│                                              │
└──────────────────────────────────────────────┘
```

### Signature Interaction

Typography itself becomes the navigation.

As user scrolls:

```text
ELENA  ←──────────────→  ALEX
```

The names move apart.

Then converge:

```text
             ELENA & ALEX
```

### Sections

#### Chapter 01

THE BEGINNING

#### Chapter 02

THE JOURNEY

#### Chapter 03

THE MOMENT

#### Chapter 04

FOREVER

Each chapter uses a different editorial composition.

### Gallery

No standard grid.

Use:

```text
          LARGE IMAGE
                         small image

      vertical image

                  LARGE IMAGE
```

Images animate into place using clip-path reveals.

### RSVP

Minimal editorial form:

```text
WE HOPE
YOU'LL JOIN US.

[ YES, I'LL BE THERE ]

[ I CAN'T MAKE IT ]
```

---

# 10. T04 — VELVET
## The Grand Ballroom

### Visual Direction

- Deep burgundy
- Black
- Champagne gold
- Velvet texture
- Candlelight
- Classical architecture

### Opening Wireframe

```text
┌──────────────────────────────────────────────┐
│                                              │
│       ╔════════════════════════════╗         │
│       ║                            ║         │
│       ║       VELVET CURTAIN       ║         │
│       ║                            ║         │
│       ╚════════════════════════════╝         │
│                                              │
│              DRAG TO OPEN                    │
└──────────────────────────────────────────────┘
```

### Interaction

User drags curtains outward.

Physics:

- Spring resistance
- Slight fabric movement
- Shadow
- Candlelight behind curtain

When fully opened:

```text
ALEX
&
ELENA

REQUEST THE PLEASURE
OF YOUR COMPANY
```

### Sections

1. Ballroom Hero
2. Our Story
3. Wedding Ceremony
4. Reception
5. Dress Code
6. Venue Architecture
7. Gallery
8. RSVP
9. Guestbook
10. Final Ballroom Scene

### Dress Code

Interactive wardrobe-style cards:

```text
BLACK TIE

MEN              WOMEN
Suit              Evening Dress
Bow Tie           Heels
```

### Signature Interaction

The timeline resembles a grand ballroom program.

---

# 11. T05 — VOYAGE
## The Destination Wedding Film

### Visual Direction

- Cinematic video
- Travel photography
- Soft sand
- Ocean blue
- White
- Warm sunlight

### Opening

Full-screen video.

```text
SOMEWHERE
BEAUTIFUL

↓

TWO PEOPLE

↓

ONE JOURNEY

↓

ONE DAY
```

Then:

```text
ALEX & ELENA

07.12.2026
MALDIVES
```

### Signature Interaction

The guest travels through the invitation.

```text
HOME
  ↓
JOURNEY
  ↓
DESTINATION
  ↓
HOTEL
  ↓
WEDDING
  ↓
CELEBRATION
```

### Interactive Map

```text
┌──────────────────────────────────────────────┐
│                                              │
│             WORLD MAP                        │
│                                              │
│     DUBAI ● ─────────────── ✈ ───── ●       │
│                                      MALDIVES│
│                                              │
│                [EXPLORE]                     │
└──────────────────────────────────────────────┘
```

The plane animates along the route.

### Wedding Weekend

```text
THURSDAY
WELCOME DINNER

FRIDAY
BEACH CELEBRATION

SATURDAY
THE WEDDING

SUNDAY
FAREWELL BRUNCH
```

### Accommodation

Hotel cards with:

- Image
- Room type
- Price/information field
- Booking link
- Distance
- Check-in/check-out

### RSVP

```text
WILL YOU
JOIN US
ON THIS
JOURNEY?

[ YES ]

[ NO ]
```

---

# 12. Marketplace Template Preview System

The existing Invitara template selection experience should become an interactive showroom.

Instead of a static thumbnail:

```text
┌──────────────────────────────────────────────┐
│                                              │
│              TEMPLATE PREVIEW               │
│                                              │
│         [INTERACTIVE PREVIEW]                │
│                                              │
│          Scratch / Tap / Drag                │
│                                              │
│        ┌───────────────────────┐             │
│        │   EXPLORE TEMPLATE    │             │
│        └───────────────────────┘             │
│                                              │
│        ♡ 1.2k       ★ Premium                │
└──────────────────────────────────────────────┘
```

### Preview Controls

```text
[ TAP TO OPEN ]
[ SCRATCH ]
[ DRAG ]
[ SCROLL ]
```

The system can automatically choose the interaction appropriate to each template.

---

# 13. Premium Template Card

Every template card should include:

```text
┌──────────────────────────────────────────────┐
│                                              │
│          [LIVE ANIMATED PREVIEW]             │
│                                              │
│                                      ♡       │
│                                              │
│        NOIR                                  │
│        Black Luxury                          │
│                                              │
│        Cinematic · Premium · Elegant         │
│                                              │
│        ★ PREMIUM                             │
│                                              │
│        [PREVIEW]     [USE TEMPLATE]          │
└──────────────────────────────────────────────┘
```

Hover:

- Preview begins automatically
- Card slightly lifts
- Border appears
- Typography changes position
- Preview badge appears

Mobile:

- Tap card
- Open full-screen preview
- Swipe between templates

---

# 14. Template Preview Modal

```text
┌──────────────────────────────────────────────┐
│ ← BACK                              ♡        │
│                                              │
│              [LIVE TEMPLATE]                 │
│                                              │
│                                              │
│                                              │
│                                              │
│                                              │
│                                              │
│        ┌──────────────────────────┐          │
│        │                          │          │
│        │     USE THIS TEMPLATE    │          │
│        └──────────────────────────┘          │
│                                              │
│        ← Swipe / Scroll →                    │
└──────────────────────────────────────────────┘
```

---

# 15. Shared High-End Components

Create reusable components so the five templates remain maintainable.

```text
InvitationShell
├── InvitationLoader
├── OpeningExperience
│   ├── TapToOpen
│   ├── ScrollToOpen
│   ├── ScratchReveal
│   ├── DragToOpen
│   └── CurtainReveal
│
├── Hero
├── CoupleSection
├── StoryTimeline
├── EventSchedule
├── Countdown
├── Gallery
├── Venue
├── Map
├── Accommodation
├── DressCode
├── RSVP
├── Guestbook
├── MusicController
└── ClosingScene
```

---

# 16. Animation System

Use a consistent animation language across Invitara.

### Entrance

- Fade
- Blur-to-sharp
- Clip reveal
- Mask reveal
- Scale 0.96 → 1
- Translate 20px → 0

### Scroll

- Parallax
- Horizontal pinning
- Text movement
- Image zoom
- Progressive reveal

### Interaction

- Spring physics
- Magnetic buttons
- Cursor/touch response
- Drag resistance
- Hover micro-motion

### Avoid

- Excessive bounce
- Fast spinning
- Random particles everywhere
- Large aggressive zooms
- Too many simultaneous animations
- Auto-playing audio without interaction

---

# 17. Premium Motion Rules

### Timing

| Animation | Duration |
|---|---:|
| Micro interaction | 150–300ms |
| Button | 250–400ms |
| Image reveal | 800–1400ms |
| Hero transition | 1200–2200ms |
| Page transition | 700–1200ms |
| Major cinematic scene | 1500–3000ms |

Use easing curves such as:

- `ease-out`
- `cubic-bezier`
- spring-based motion

---

# 18. Mobile-First Experience

The invitation will often be opened from WhatsApp, Instagram, SMS or QR code.

Therefore mobile is the primary experience.

### Mobile opening

```text
┌───────────────────────┐
│                       │
│        ✦              │
│                       │
│    ALEX & ELENA       │
│                       │
│   ┌───────────────┐   │
│   │               │   │
│   │  INVITATION   │   │
│   │               │   │
│   └───────────────┘   │
│                       │
│     TAP TO OPEN       │
│                       │
└───────────────────────┘
```

### Requirements

- 60fps target
- Touch gestures
- No hover-dependent functionality
- Respect `prefers-reduced-motion`
- Lazy-load gallery/video
- Avoid layout shift
- Compress media
- Maintain fast first paint

---

# 19. Desktop Experience

Desktop should feel like a luxury interactive website.

Use:

- Wide cinematic photography
- Large typography
- Horizontal storytelling
- Mouse-reactive elements
- Cursor effects where appropriate
- Full-screen sections
- Editorial layouts

Do not simply stretch the mobile layout.

---

# 20. Music Experience

Optional music control:

```text
┌──────────────┐
│ ♫ MUSIC  ON  │
└──────────────┘
```

Rules:

- Never force audio before user interaction
- Store preference locally
- Allow mute
- Show subtle visualizer
- Audio should fade between opening and content

---

# 21. RSVP Experience

RSVP should be template-specific but use a shared data model.

Fields:

- Guest name
- Attendance
- Number of guests
- Meal preference
- Dietary requirements
- Message
- Accommodation requirement

Premium interaction:

Instead of showing a generic form immediately, reveal the form as a physical card, editorial panel or cinematic overlay depending on template.

---

# 22. Accessibility

All interactions must have accessible alternatives.

Examples:

### Scratch

Provide:

`TAP TO REVEAL`

### Drag

Provide:

`TAP TO OPEN`

### Scroll-controlled animation

Provide:

`CONTINUE`

### Motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Disable non-essential motion while preserving the information hierarchy.

---

# 23. Performance Requirements

Target:

- Lighthouse Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- CLS: < 0.1
- Fast mobile interaction
- Optimized WebP/AVIF images
- Responsive image sizes
- Lazy loading
- Video poster images
- IntersectionObserver for non-critical animations

Avoid loading all template media at once.

---

# 24. Data-Driven Template Architecture

Do not duplicate the entire application for each template.

Use:

```text
templateId
theme
sections
animationPreset
openingType
content
media
events
gallery
venue
rsvp
```

Example:

```json
{
  "templateId": "noir",
  "openingType": "gold-monogram",
  "theme": "dark-luxury",
  "sections": [
    "hero",
    "couple",
    "story",
    "events",
    "gallery",
    "venue",
    "rsvp",
    "closing"
  ]
}
```

Each template should primarily define:

- Design tokens
- Section order
- Animation presets
- Opening experience
- Typography
- Decorative system

---

# 25. Design Token Structure

```text
Template
├── Colors
├── Typography
├── Spacing
├── Radius
├── Shadows
├── Borders
├── Motion
├── Backgrounds
├── DecorativeElements
└── Components
```

Example:

```text
NOIR
Background: #080808
Primary Text: Ivory
Accent: Champagne Gold
Display Font: Luxury Serif
Body Font: Modern Sans

AURELIA
Background: Warm Ivory
Primary Text: Deep Green
Accent: Champagne
Display Font: Elegant Serif
Body Font: Clean Sans
```

---

# 26. Template Purchase CTA

Every preview should end with a strong CTA.

```text
┌──────────────────────────────────────────────┐
│                                              │
│             MAKE IT YOURS                    │
│                                              │
│       Customize this invitation              │
│       with your story, photos and details.    │
│                                              │
│       ┌──────────────────────────────┐       │
│       │       USE THIS TEMPLATE      │       │
│       └──────────────────────────────┘       │
│                                              │
│              ★ PREMIUM                       │
└──────────────────────────────────────────────┘
```

---

# 27. Final Template Journey

The complete customer journey should be:

```text
INVITARA HOME
      ↓
TEMPLATE COLLECTION
      ↓
SEE ANIMATED PREVIEW
      ↓
TAP / SCRATCH / DRAG
      ↓
OPEN FULL TEMPLATE
      ↓
EXPLORE SECTIONS
      ↓
CUSTOMIZE
      ↓
ADD PHOTOS
      ↓
ADD STORY
      ↓
ADD EVENTS
      ↓
CONFIGURE RSVP
      ↓
PREVIEW
      ↓
PURCHASE
      ↓
PUBLISH
      ↓
SHARE INVITATION
```

---

# 28. Recommended Development Priority

### Phase 1 — Shared Experience Engine

Build:

- Invitation shell
- Opening engine
- Scroll engine
- Scratch engine
- Drag engine
- Motion system
- Gallery system
- RSVP system
- Music controller

### Phase 2 — NOIR

Build this first as the flagship template.

### Phase 3 — MAISON

Build the editorial system.

### Phase 4 — AURELIA

Build botanical animation system.

### Phase 5 — VELVET

Build curtain / physical interaction system.

### Phase 6 — VOYAGE

Build travel/map/cinematic system.

### Phase 7 — Marketplace Preview

Connect all five templates to the existing template selection page.

---

# 29. Final Quality Standard

Before publishing any template, verify:

### Visual

- [ ] Premium typography
- [ ] Consistent spacing
- [ ] Perfect alignment
- [ ] High-quality imagery
- [ ] No generic UI components
- [ ] No unnecessary borders/cards
- [ ] Strong visual hierarchy

### Animation

- [ ] Opening interaction works
- [ ] Scroll animation is smooth
- [ ] Touch works
- [ ] Scratch works
- [ ] Drag works where applicable
- [ ] Reduced-motion mode works
- [ ] No animation causes layout shift

### Functional

- [ ] RSVP works
- [ ] Maps work
- [ ] Calendar works
- [ ] Gallery works
- [ ] Music works
- [ ] Sharing works
- [ ] Back navigation works
- [ ] Deep links work

### Mobile

- [ ] iPhone tested
- [ ] Android tested
- [ ] Small screens tested
- [ ] Large phones tested
- [ ] Landscape tested

### Performance

- [ ] Images optimized
- [ ] Videos optimized
- [ ] Lazy loading implemented
- [ ] No unnecessary JavaScript
- [ ] Fast initial load
- [ ] Smooth 60fps target

---

# 30. Final Creative Direction

The five templates should communicate five completely different emotions:

**NOIR**

> "This feels expensive."

**AURELIA**

> "This feels alive."

**MAISON**

> "This feels fashionable."

**VELVET**

> "This feels grand."

**VOYAGE**

> "This feels like a movie."

The goal is not to create five attractive webpages.

The goal is to create **five experiences that customers remember after closing the browser.**

> **Invitara should feel less like an invitation builder and more like a luxury digital invitation studio.**

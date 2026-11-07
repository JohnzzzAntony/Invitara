/*!
 * Feature Carousel — ported to plain JavaScript from uselayouts (https://uselayouts.com), MIT License,
 * Copyright (c) 2025 Urvish Mali. Original source and full notice: third_party/podie/.
 * Same motion library, timings, easing and interactions; React state became a small render loop.
 */
import { animate } from 'motion';

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;
const chipSpring = { type: 'tween', duration: 0.42, ease: [0.4, 0, 0.2, 1] };
const cardSpring = { type: 'tween', duration: 0.38, ease: [0.4, 0, 0.2, 1] };
const instant = { duration: 0 };

function shortestOffset(index, current, len) {
  let d = ((index - current) % len + len) % len;
  if (d > len / 2) d -= len;
  return d;
}

/**
 * items: [{ id, label, icon (inner SVG markup), image, description, href }].
 * Chips scroll on the left, cards stack on the right; it autoplays and pauses on hover, focus or the pause button.
 */
export function featureCarousel(host, items) {
  const len = items.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = 0;
  let hoverPaused = false;
  let userPaused = false;
  let timer = 0;

  host.classList.add('fc');
  host.innerHTML = '<div class="fc-frame"><div class="fc-rail"><div class="fc-fade fc-fade-top"></div><div class="fc-fade fc-fade-bottom"></div><div class="fc-chips" role="group" aria-label="Choose a design"></div></div>'
    + '<div class="fc-stage"><div class="fc-deck"></div><button type="button" class="fc-toggle" aria-pressed="false">Pause</button></div></div>';
  const chipHost = host.querySelector('.fc-chips');
  const deck = host.querySelector('.fc-deck');
  const toggle = host.querySelector('.fc-toggle');

  const chips = items.map((item, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'fc-chip-wrap';
    wrap.style.height = ITEM_HEIGHT + 'px';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fc-chip';
    button.innerHTML = '<span class="fc-chip-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + item.icon + '</svg></span><span class="fc-chip-label"></span>';
    button.querySelector('.fc-chip-label').textContent = item.label;
    button.addEventListener('click', () => {
      const delta = shortestOffset(index, current(), len);
      if (delta !== 0) { step += delta; render(); }
    });
    button.addEventListener('mouseenter', () => { hoverPaused = true; schedule(); });
    button.addEventListener('mouseleave', () => { hoverPaused = false; schedule(); });
    wrap.appendChild(button);
    chipHost.appendChild(wrap);
    return { wrap, button, prevOffset: null };
  });

  const cards = items.map((item, index) => {
    const card = document.createElement('a');
    card.className = 'fc-card';
    card.href = item.href;
    const img = document.createElement('img');
    img.src = item.image; img.alt = item.label; img.width = 600; img.height = 900;
    img.loading = index < 2 ? 'eager' : 'lazy'; img.decoding = 'async';
    const overlay = document.createElement('div');
    overlay.className = 'fc-overlay';
    overlay.innerHTML = '<div class="fc-pill"></div><p class="fc-description"></p>';
    overlay.querySelector('.fc-pill').textContent = (index + 1) + ' • ' + item.label;
    overlay.querySelector('.fc-description').textContent = item.description;
    card.append(img, overlay);
    deck.appendChild(card);
    return { card, img, overlay, wasActive: null };
  });

  function current() { return ((step % len) + len) % len; }

  function render() {
    const currentIndex = current();
    chips.forEach((chip, index) => {
      const offset = shortestOffset(index, currentIndex, len);
      // A chip that wraps from one end to the other jumps instead of sliding across the list.
      const jumped = chip.prevOffset === null || Math.abs(offset - chip.prevOffset) > 1;
      chip.prevOffset = offset;
      const active = offset === 0;
      chip.button.classList.toggle('is-active', active);
      chip.button.setAttribute('aria-pressed', String(active));
      animate(chip.wrap, { y: offset * ITEM_HEIGHT, opacity: Math.max(0, 1 - Math.abs(offset) * 0.22) }, reduceMotion || jumped ? instant : chipSpring);
    });
    cards.forEach((c, index) => {
      const d = shortestOffset(index, currentIndex, len);
      const isActive = d === 0, isPrev = d === -1, isNext = d === 1;
      c.card.style.zIndex = isActive ? 20 : isPrev || isNext ? 10 : 0;
      c.card.style.pointerEvents = isActive ? 'auto' : 'none';
      c.card.tabIndex = isActive ? 0 : -1;
      c.card.setAttribute('aria-hidden', String(!isActive));
      c.img.classList.toggle('is-dim', !isActive);
      animate(c.card, {
        x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
        scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
        opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
        rotate: isPrev ? -3 : isNext ? 3 : 0
      }, reduceMotion || c.wasActive === null ? instant : cardSpring);
      // The caption enters when its card becomes active and leaves when it stops being active.
      if (isActive !== c.wasActive) {
        if (isActive) animate(c.overlay, { opacity: [0, 1], y: [12, 0] }, reduceMotion || c.wasActive === null ? instant : { duration: 0.2, ease: [0.32, 0.72, 0, 1] });
        else animate(c.overlay, { opacity: 0, y: 8 }, reduceMotion ? instant : { duration: 0.2, ease: [0.32, 0.72, 0, 1] });
      }
      c.wasActive = isActive;
    });
  }

  function schedule() {
    clearInterval(timer);
    timer = 0;
    if (hoverPaused || userPaused) return;
    timer = setInterval(() => { step += 1; render(); }, AUTO_PLAY_INTERVAL);
  }

  // Keyboard users get the same pause as hover while a chip has focus.
  chipHost.addEventListener('focusin', () => { hoverPaused = true; schedule(); });
  chipHost.addEventListener('focusout', () => { hoverPaused = false; schedule(); });
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.textContent = userPaused ? 'Play' : 'Pause';
    schedule();
  });

  render();
  schedule();
}

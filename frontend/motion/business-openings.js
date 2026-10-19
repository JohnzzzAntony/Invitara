import { createTimeline, stagger } from 'animejs';

export function bindBusinessOpening(root) {
  const key = root.dataset.business;
  const scene = root.querySelector('.business-scene');
  const panels = scene?.querySelectorAll('.business-shutter');
  let timeline;

  function play() {
    timeline?.cancel();
    timeline = createTimeline({ autoplay: false, defaults: { duration: 1050, ease: 'linear' } });
    if (key === 'brand') {
      timeline.add(panels, { translateX: ['0%', '-110%'], opacity: [1, 0] })
        .add(scene.querySelector('.business-art'), { scale: [1.12, 1], filter: ['brightness(.42) blur(8px)', 'brightness(1) blur(0px)'] }, '-=700');
    } else if (key === 'atelier') {
      timeline.add(panels, { rotateY: (el, i) => i ? ['0deg', '112deg'] : ['0deg', '-112deg'], opacity: [1, .2] })
        .add(scene.querySelector('.business-door-knob'), { scale: [1, 0], opacity: [1, 0], duration: 450 }, '-=820');
    } else if (key === 'aura') {
      timeline.add(scene.querySelector('.business-spotlight'), { clipPath: ['circle(4% at 50% 45%)', 'circle(80% at 50% 45%)'], opacity: [0, 1], duration: 1300 })
        .add(panels, { translateX: (el, i) => i ? ['0%', '110%'] : ['0%', '-110%'], opacity: [1, 0], duration: 1300 }, '-=1300')
        .add(scene.querySelector('.business-art'), { scale: [.84, .96], rotateY: ['-14deg', '0deg'] }, '-=950');
    } else if (key === 'executive') {
      timeline.add(scene.querySelectorAll('.business-fold'), { translateY: (el, i) => i ? ['0%', '108%'] : ['0%', '-108%'], rotateX: (el, i) => i ? ['0deg', '28deg'] : ['0deg', '-28deg'] })
        .add(scene.querySelector('.business-seal'), { scale: [1, .05], rotateZ: [0, -48], opacity: [1, 0], filter: ['blur(0px)', 'blur(7px)'], duration: 650 }, '-=920');
    } else if (key === 'table') {
      timeline.add(scene.querySelector('.business-cloche'), { translateY: ['0%', '-118%'], rotateX: ['0deg', '-24deg'], opacity: [1, .25], duration: 1250 })
        .add(scene.querySelector('.business-art'), { scale: [1.12, 1], duration: 1100 }, '-=1000');
    } else {
      timeline.add(scene.querySelector('.business-blueprint'), { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], opacity: [.65, 0], duration: 1500 })
        .add(panels, { translateY: (el, i) => i ? ['0%', '110%'] : ['0%', '-110%'], opacity: [1, 0], duration: 1500 }, '-=1500')
        .add(scene.querySelector('.business-art'), { scale: [1.12, 1], filter: ['grayscale(1) brightness(.78)', 'grayscale(0) brightness(1)'] }, '-=950');
    }
    const copy = root.querySelectorAll('.business-kicker,.business-title,.business-note,.business-cta');
    timeline.add(copy, { translateY: [22, 0], opacity: [0, 1], delay: stagger(85), duration: 700, ease: 'out(3)' }, '-=680');
    timeline.add(root.querySelector('.business-opening-details'), { translateY: [16, 0], opacity: [0, 1], duration: 480, ease: 'out(3)' }, '-=260');
    return timeline;
  }

  function ensureTimeline() {
    if (!timeline) play();
    return timeline;
  }

  function seek(progress) {
    const active = ensureTimeline();
    active.pause();
    active.seek(active.duration * Math.max(0, Math.min(1, progress)));
  }

  function finish() {
    const active = ensureTimeline();
    active.play();
  }

  function reset() {
    timeline?.seek(0);
    timeline?.cancel();
    timeline = null;
    root.classList.remove('business-open');
    root.querySelectorAll('.business-reveal').forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
      button.textContent = button.dataset.label || button.textContent;
    });
  }

  return { play: finish, seek, pause: () => timeline?.pause(), reset, cancel: () => timeline?.cancel() };
}

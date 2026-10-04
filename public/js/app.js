/* ==========================================================================
   Invitara — site interactions
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  /* Mark JS as available (progressive enhancement for reveal animations) */
  document.documentElement.classList.add('js');

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------- Toast ---------------- */
  var toastEl = $('#toast');
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 3200);
  }

  /* Expose for the flow pages (create / checkout / editor) */
  window.everToast = toast;

  $$('[data-demo-toast]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (el.tagName === 'A') e.preventDefault();
      toast(el.getAttribute('data-demo-toast'));
    });
  });

  /* ---------------- Header shadow on scroll ---------------- */
  var header = $('.site-header');
  var toTop = $('#to-top');

  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.hidden = y < 600;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Mobile menu ---------------- */
  var menuToggle = $('.menu-toggle');
  var mobileMenu = $('#mobile-menu');

  function closeMenu() {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.hidden = true;
    document.body.style.overflow = '';
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var open = menuToggle.getAttribute('aria-expanded') === 'true';
      if (open) {
        closeMenu();
      } else {
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close menu');
        mobileMenu.hidden = false;
        document.body.style.overflow = 'hidden';
      }
    });
    $$('a', mobileMenu).forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* Safety: any in-page anchor clicked anywhere (e.g. keyboard focus into
     background links while the menu is open) should close the mobile menu. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (link && mobileMenu && !mobileMenu.hidden) closeMenu();
  });

  /* ---------------- "Continue editing" ----------------
     There are no accounts: an event lives in this browser's localStorage
     (see js/templates.js). So instead of a sign-in that leads nowhere, the
     header offers to resume a saved event, and says so plainly when there
     is none to resume. */
  var EVENT_KEY = 'ever-rsvp-event';

  function hasSavedEvent() {
    try {
      var raw = localStorage.getItem(EVENT_KEY);
      if (!raw) return false;
      var state = JSON.parse(raw);
      return !!(state && typeof state === 'object');
    } catch (err) {
      return false;   /* corrupt or blocked storage — treat as "nothing saved" */
    }
  }

  /* One invitation goes straight to its editor; several go to the dashboard
     so the customer chooses. commerce.js is not loaded on every page, hence
     the guard. */
  function resumeTarget() {
    var C = window.EVER_C;
    if (C) {
      var projects = C.allProjects();
      if (projects.length > 1) return 'dashboard.html';
      if (projects.length === 1) {
        C.openProject(projects[0].id);
        return 'editor.html';
      }
    }
    return hasSavedEvent() ? 'editor.html' : '';
  }

  $$('[data-resume]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = resumeTarget();
      if (target) {
        window.location.href = target;
      } else {
        toast('No saved invitation on this device yet — pick a design to start one.');
        setTimeout(function () { window.location.href = 'create.html'; }, 1400);
      }
    });
  });

  /* ---------------- Active nav link ---------------- */
  var navLinks = $$('.nav-link[href^="#"]');
  var watched = ['overview', 'designs', 'faq'];

  if ('IntersectionObserver' in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    watched.forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) sectionObserver.observe(sec);
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = $$('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- Dashboard counters ---------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var t0 = null;
    var dur = 1100;

    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
  }

  /* ---------------- Testimonial carousel ---------------- */
  var carousel = $('#carousel');
  if (carousel) {
    var track = $('.carousel-track', carousel);
    var slides = $$('.slide', carousel);
    var dotsWrap = $('.c-dots', carousel);
    var index = 0;
    var timer = null;
    var DELAY = 6500;

    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'c-dot' + (i === 0 ? ' on' : '');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', 'Go to review ' + (i + 1));
      d.addEventListener('click', function () { go(i, true); });
      dotsWrap.appendChild(d);
    });
    var dots = $$('.c-dot', dotsWrap);

    function go(i, user) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach(function (d, di) {
        d.classList.toggle('on', di === index);
        d.setAttribute('aria-selected', String(di === index));
      });
      if (user) restart();
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, DELAY);
    }

    $$('.c-arrow', carousel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        go(index + parseInt(btn.getAttribute('data-dir'), 10), true);
      });
    });

    carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
    carousel.addEventListener('mouseleave', restart);
    carousel.addEventListener('focusin', function () { clearInterval(timer); });
    carousel.addEventListener('focusout', restart);

    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(index - 1, true);
      if (e.key === 'ArrowRight') go(index + 1, true);
    });

    var sx = null;
    carousel.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 46) go(index + (dx < 0 ? 1 : -1), true);
      sx = null;
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else restart();
    });

    restart();
  }

  /* ---------------- FAQ accordion ---------------- */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var open = item.classList.contains('open');
      $$('.acc-item.open').forEach(function (other) {
        other.classList.remove('open');
        $('.acc-btn', other).setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------- Demo RSVP modal ---------------- */
  var overlay = $('#demo-modal');
  var stageForm = $('#modal-form-stage');
  var stageDone = $('#modal-done-stage');
  var rsvpForm = $('#rsvp-form');
  var STORE_KEY = 'ever-rsvp-demo-reply';
  var lastFocus = null;

  function openModal() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (err) { saved = null; }

    if (saved) {
      fillForm(saved);
      showDone(saved);
    } else {
      stageForm.hidden = false;
      stageDone.hidden = true;
    }

    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = $('#rsvp-name');
    if (first && !stageForm.hidden) setTimeout(function () { first.focus(); }, 60);
  }

  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function fillForm(data) {
    $('#rsvp-name').value = data.name || '';
    var radio = document.querySelector('input[name="attend"][value="' + (data.attend || 'yes') + '"]');
    if (radio) radio.checked = true;
    $('#rsvp-guests').value = data.guests || 2;
    $('#rsvp-guests-val').textContent = data.guests || 2;
    if (data.menu) $('#rsvp-menu').value = data.menu;
    $('#rsvp-song').value = data.song || '';
  }

  function showDone(data) {
    var msg = $('#done-msg');
    if (data.attend === 'no') {
      msg.textContent = 'Your reply has been saved. You will be missed, ' + data.name + '!';
    } else {
      msg.textContent = data.name + ', ' + data.guests +
        (Number(data.guests) === 1 ? ' seat is reserved.' : ' seats are reserved.') +
        ' See you on June 14th!';
    }
    stageForm.hidden = true;
    stageDone.hidden = false;
  }

  $$('[data-demo-modal]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    $('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!overlay.hidden) closeModal();
      closeLogin();
      closeMenu();
    });
  }

  /* Stepper inside the demo form */
  $$('.stepper.real .st-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = $('#rsvp-guests');
      var val = Math.min(6, Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(btn.getAttribute('data-step'), 10)));
      input.value = val;
      $('#rsvp-guests-val').textContent = val;
    });
  });

  /* Submit the demo RSVP */
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#rsvp-name').value.trim();
      var err = $('.form-error', rsvpForm);

      if (!name) {
        err.hidden = false;
        $('#rsvp-name').focus();
        return;
      }
      err.hidden = true;

      var data = {
        name: name,
        attend: (document.querySelector('input[name="attend"]:checked') || {}).value || 'yes',
        guests: $('#rsvp-guests').value,
        menu: $('#rsvp-menu').value,
        song: $('#rsvp-song').value.trim(),
        at: new Date().toISOString()
      };
      try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (err2) { /* storage unavailable */ }
      showDone(data);
    });
  }

  var editReply = $('#edit-reply');
  if (editReply) {
    editReply.addEventListener('click', function () {
      stageDone.hidden = true;
      stageForm.hidden = false;
      $('#rsvp-name').focus();
    });
  }

  var resetDemo = $('#reset-demo');
  if (resetDemo) {
    resetDemo.addEventListener('click', function () {
      try { localStorage.removeItem(STORE_KEY); } catch (err) { /* ignore */ }
      rsvpForm.reset();
      $('#rsvp-guests').value = 2;
      $('#rsvp-guests-val').textContent = 2;
      stageDone.hidden = true;
      stageForm.hidden = false;
      $('#rsvp-name').focus();
    });
  }

  /* ---------------- Newsletter ---------------- */
  var newsForm = $('.news-form');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#news-email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        toast('Please enter a valid e-mail address.');
        input.focus();
        return;
      }
      input.value = '';
      toast('Thank you — you are on the list! (Demo only)');
    });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

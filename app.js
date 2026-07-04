/* ============================================================
   SUP MARKETING — Main JavaScript
   Custom Cursor · Nav · Counters · Sliders · FAQ · Form
============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initScrollAnimations();
  initCounters();
  initCaseStudiesSlider();
  initFaq();
  initContactForm();
  initProgressBar();
});

/* ──────────────────────────────────────────────────────────
   1. CUSTOM CURSOR
────────────────────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursorDot');
  if (!cursor || !dot) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = 0, my = 0;   // mouse position
  let cx = 0, cy = 0;   // cursor position (lerped)

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animateCursor() {
    cx += (mx - cx) * 0.1;
    cy += (my - cy) * 0.1;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, [class*="card"], .pcard, .pillar-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.8)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
  });
}

/* ──────────────────────────────────────────────────────────
   2. NAVIGATION
────────────────────────────────────────────────────────── */
function initNav() {
  const header    = document.getElementById('navHeader');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  /* Scroll → scroll class */
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Hamburger */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close on mobile link click */
    mobileMenu.querySelectorAll('.mob-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* Active nav link on scroll */
  const sections = document.querySelectorAll('section[id], footer');
  const navLinks = document.querySelectorAll('.nav-link');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => io.observe(s));
}

/* ──────────────────────────────────────────────────────────
   3. SCROLL ANIMATIONS (IntersectionObserver reveal)
────────────────────────────────────────────────────────── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.reveal, .fade-in');

  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        /* Stagger siblings in same parent */
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal, .fade-in'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => io.observe(el));
}

/* ──────────────────────────────────────────────────────────
   4. STAT COUNTERS
────────────────────────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const isFloat = el.dataset.target.includes('.');
  const dur     = 1800;
  const start   = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = target * eased;
    el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ──────────────────────────────────────────────────────────
   5. CASE STUDIES SLIDER
────────────────────────────────────────────────────────── */
function initCaseStudiesSlider() {
  const slides   = document.querySelectorAll('.cs-slide');
  const dots     = document.querySelectorAll('.cs-dot');
  const prevBtn  = document.getElementById('csPrev');
  const nextBtn  = document.getElementById('csNext');

  if (!slides.length || !prevBtn) return;

  let current = 0;
  let autoTimer = null;

  function show(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    autoTimer = setInterval(() => show(current + 1), 5500);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  startAuto();

  prevBtn.addEventListener('click', () => { show(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { show(current + 1); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { show(i); resetAuto(); });
  });

  /* Touch / swipe support */
  let startX = 0;
  const wrapper = document.querySelector('.cs-wrapper');
  if (wrapper) {
    wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { show(current + (dx < 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });
  }
}

/* ──────────────────────────────────────────────────────────
   6. FAQ ACCORDION
────────────────────────────────────────────────────────── */
function initFaq() {
  const accordion = document.getElementById('faqAccordion');
  if (!accordion) return;

  accordion.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');

      /* Close all */
      accordion.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      /* Open clicked if it was closed */
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ──────────────────────────────────────────────────────────
   7. CONTACT FORM
────────────────────────────────────────────────────────── */
function initContactForm() {
  /* Pillar toggle buttons */
  const pillarsRow = document.getElementById('pillarsRow');
  const hiddenSvc  = document.getElementById('selectedServices');
  const selected   = new Set();

  if (pillarsRow) {
    pillarsRow.querySelectorAll('.pillar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const svc = btn.dataset.svc;
        if (selected.has(svc)) { selected.delete(svc); btn.classList.remove('selected'); }
        else                   { selected.add(svc);    btn.classList.add('selected'); }
        if (hiddenSvc) hiddenSvc.value = [...selected].join(', ');
      });
    });
  }

  /* Form submission */
  const form        = document.getElementById('contactForm');
  const success     = document.getElementById('formSuccess');
  const resetBtn    = document.getElementById('resetForm');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Basic validation */
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ff4444';
        field.addEventListener('input', () => field.style.borderColor = '', { once: true });
      }
    });
    if (!valid) return;

    /* Simulate success */
    form.style.display = 'none';
    if (pillarsRow) pillarsRow.style.display = 'none';
    if (success) success.classList.add('visible');
  });

  if (resetBtn && form && success) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      success.classList.remove('visible');
      if (pillarsRow) {
        pillarsRow.style.display = '';
        pillarsRow.querySelectorAll('.pillar-btn').forEach(b => b.classList.remove('selected'));
      }
      selected.clear();
    });
  }
}

/* ──────────────────────────────────────────────────────────
   8. SCROLL PROGRESS BAR
────────────────────────────────────────────────────────── */
function initProgressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
}

/* ──────────────────────────────────────────────────────────
   9. POLAROID PARALLAX ON MOUSE MOVE
────────────────────────────────────────────────────────── */
(function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const leftCards  = hero.querySelectorAll('.hero-cards-left .pcard');
  const rightCards = hero.querySelectorAll('.hero-cards-right .pcard');

  if (window.matchMedia('(hover: none)').matches) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;   /* -1 to 1 */
    const dy = (e.clientY - cy) / cy;   /* -1 to 1 */

    leftCards.forEach((card, i) => {
      const depth = (i + 1) * 6;
      card.style.transform = `rotate(-5deg) translate(${dx * -depth}px, ${dy * -depth}px)`;
    });

    rightCards.forEach((card, i) => {
      const depth = (i + 1) * 6;
      card.style.transform = `rotate(5deg) translate(${dx * depth}px, ${dy * depth}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    leftCards.forEach(c  => c.style.transform = '');
    rightCards.forEach(c => c.style.transform = '');
  });
})();

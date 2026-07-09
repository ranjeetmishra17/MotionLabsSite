/* ============================================================
   MOTION LABS — Main JavaScript
   Nav · Counters · Reels · Form · Progress · Video
============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimations();
  initCounters();
  initFaq();
  initContactForm();
  initProgressBar();
  initHeroVideoControls();
  initReels();
  initServiceCardTouch();
});

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
  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close button inside menu */
    const mobClose = document.getElementById('mobClose');
    if (mobClose) mobClose.addEventListener('click', closeMenu);

    /* Close on any link or CTA click */
    mobileMenu.querySelectorAll('.mob-link, .mob-cta').forEach(el => {
      el.addEventListener('click', closeMenu);
    });

    /* Close on Escape key */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
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
  const pillarsRow  = document.getElementById('pillarsRow');
  const hiddenSvc   = document.getElementById('selectedServices');
  const formWrap    = pillarsRow && pillarsRow.closest('.contact-form-wrap');
  const sectionHdr  = formWrap && formWrap.querySelector('.form-section-header');
  const formDivider = formWrap && formWrap.querySelector('.form-divider');
  const selected    = new Set();

  /* Pillar toggle buttons */
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
  const form     = document.getElementById('contactForm');
  const success  = document.getElementById('formSuccess');
  const resetBtn = document.getElementById('resetForm');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ff4444';
        field.style.boxShadow   = '0 0 0 3px rgba(255,68,68,0.14)';
        field.classList.add('field-shake');
        field.addEventListener('animationend', () => field.classList.remove('field-shake'), { once: true });
        field.addEventListener('input', () => { field.style.borderColor = ''; field.style.boxShadow = ''; }, { once: true });
      }
    });
    if (!valid) return;

    /* Show success */
    form.style.display = 'none';
    if (pillarsRow)   pillarsRow.style.display  = 'none';
    if (sectionHdr)   sectionHdr.style.display  = 'none';
    if (formDivider)  formDivider.style.display  = 'none';
    if (success) success.classList.add('visible');
  });

  if (resetBtn && form && success) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      success.classList.remove('visible');
      if (pillarsRow)   { pillarsRow.style.display = ''; pillarsRow.querySelectorAll('.pillar-btn').forEach(b => b.classList.remove('selected')); }
      if (sectionHdr)   sectionHdr.style.display  = '';
      if (formDivider)  formDivider.style.display  = '';
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

/* ──────────────────────────────────────────────────────────
   10. HERO UGC VIDEO INTERACTION CONTROLS
   ────────────────────────────────────────────────────────── */
function initHeroVideoControls() {
  const video = document.getElementById('heroUgcVideo');
  const playBtn = document.getElementById('videoPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const muteBtn = document.getElementById('videoMuteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const bars = document.getElementById('videoBars');

  if (!video) return;

  // Toggle play/pause when clicking the video card or play button
  function togglePlay() {
    if (video.paused) {
      video.play().catch(err => console.log('Video play failed:', err));
      if (bars) bars.classList.remove('paused');
      if (playIcon) {
        // Change play icon to pause icon
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      }
    } else {
      video.pause();
      if (bars) bars.classList.add('paused');
      if (playIcon) {
        // Change play icon back to play icon
        playIcon.innerHTML = '<path d="M5 3l14 9-14 9V3z"/>';
      }
    }
  }

  // Toggle mute/unmute
  function toggleMute(e) {
    if (e) e.stopPropagation(); // Avoid triggering card play toggle
    video.muted = !video.muted;
    if (video.muted) {
      if (muteIcon) {
        // Muted: show speaker box + cross icon (no sound waves)
        muteIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>';
      }
    } else {
      if (muteIcon) {
        // Unmuted: show speaker box + sound waves
        muteIcon.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/>';
      }
    }
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (muteBtn) muteBtn.addEventListener('click', toggleMute);

  // Click on the mock container also toggles play/pause
  const mockContainer = video.parentElement;
  if (mockContainer) {
    mockContainer.addEventListener('click', (e) => {
      // Prevent double trigger if clicking directly on buttons
      if (e.target.closest('#videoPlayBtn') || e.target.closest('#videoMuteBtn')) return;
      togglePlay();
    });
  }

  // Synchronize initial UI state (default muted and playing)
  if (video.autoplay) {
    if (bars) bars.classList.remove('paused');
    if (playIcon) {
      playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    }
  }
}

/* ──────────────────────────────────────────────────────────
   11. REELS — infinite marquee + hover play
────────────────────────────────────────────────────────── */
function initReels() {
  const wrap  = document.querySelector('.reels-track-wrap');
  const track = document.querySelector('.reels-marquee-track');
  const inner = document.querySelector('.reels-inner');
  if (!wrap || !track || !inner) return;

  /* Clone the set of cards once inside the reels-marquee-track wrapper */
  const clone = inner.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);

  /* Hover play / pause for cards that have a real Vimeo iframe */
  wrap.querySelectorAll('.reel-frame').forEach(frame => {
    const iframe = frame.querySelector('.reel-video');
    if (!iframe) return;

    const src = iframe.getAttribute('src');
    if (src && src.includes('vimeo.com')) {
      frame.classList.add('has-video');

      // Initialize Vimeo Player
      const player = typeof Vimeo !== 'undefined' ? new Vimeo.Player(iframe) : null;
      if (player) {
        iframe.vimeoPlayer = player;
        
        // Pause immediately since background=1 autoplays by default
        player.pause().catch(() => {});

        frame.addEventListener('mouseenter', () => {
          if (!frame.classList.contains('has-video')) return;
          player.play().catch(err => console.log('Vimeo play error:', err));
        });

        frame.addEventListener('mouseleave', () => {
          player.pause().catch(() => {});
        });

        /* Touch/Click: tap to toggle */
        frame.addEventListener('click', () => {
          if (!frame.classList.contains('has-video')) return;
          player.getPaused().then(paused => {
            if (paused) {
              player.play().catch(() => {});
            } else {
              player.pause().catch(() => {});
            }
          }).catch(() => {});
        });
      }
    }
  });

  /* Pause all videos when section leaves viewport */
  const section = document.querySelector('.video-showcase-section');
  if (section) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        wrap.querySelectorAll('.reel-video').forEach(iframe => {
          if (iframe.vimeoPlayer) {
            iframe.vimeoPlayer.pause().catch(() => {});
          }
        });
      }
    }, { threshold: 0 }).observe(section);
  }
}

/* ──────────────────────────────────────────────────────────
   TOUCH SUPPORT — Service Card Flip
   On coarse-pointer (touch) devices, cards flip on tap
────────────────────────────────────────────────────────── */
function initServiceCardTouch() {
  /* Only activate on actual touch/coarse-pointer devices */
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isTouch) return;

  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('click', () => {
      /* Toggle flipped state; close siblings */
      const isFlipped = card.classList.contains('flipped');
      document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('flipped'));
      if (!isFlipped) card.classList.add('flipped');
    });
  });

  /* Close any open card when tapping outside */
  document.addEventListener('click', e => {
    if (!e.target.closest('.svc-card')) {
      document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('flipped'));
    }
  });
}

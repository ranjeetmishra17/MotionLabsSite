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
  initProgressBar();
  initHeroVideoControls();
  initReels();
  initTestimonials();
  initServiceCardTouch();
  initVideoModal();
  initOrbitCards();
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

  /* Smooth scroll click handler for desktop nav links */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
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
  // Helper function to wire up a video card
  function setupVideoCard(videoEl, playBtnEl, playIconEl, muteBtnEl, muteIconEl, barsEl, uploadBtnEl, inputEl) {
    if (!videoEl) return;

    const isVimeo = videoEl.tagName === 'IFRAME';
    const player = isVimeo && typeof Vimeo !== 'undefined' ? new Vimeo.Player(videoEl) : null;

    function togglePlay() {
      if (isVimeo && player) {
        player.getPaused().then(paused => {
          if (paused) {
            player.play().catch(err => console.log('Vimeo play failed:', err));
            if (barsEl) barsEl.classList.remove('paused');
            if (playIconEl) {
              playIconEl.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            }
          } else {
            player.pause().catch(err => console.log('Vimeo pause failed:', err));
            if (barsEl) barsEl.classList.add('paused');
            if (playIconEl) {
              playIconEl.innerHTML = '<path d="M5 3l14 9-14 9V3z"/>';
            }
          }
        });
      } else {
        if (videoEl.paused) {
          videoEl.play().catch(err => console.log('Video play failed:', err));
          if (barsEl) barsEl.classList.remove('paused');
          if (playIconEl) {
            playIconEl.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
          }
        } else {
          videoEl.pause();
          if (barsEl) barsEl.classList.add('paused');
          if (playIconEl) {
            playIconEl.innerHTML = '<path d="M5 3l14 9-14 9V3z"/>';
          }
        }
      }
    }

    function toggleMute(e) {
      if (e) e.stopPropagation();
      if (isVimeo && player) {
        player.getMuted().then(muted => {
          const nextMuted = !muted;
          player.setMuted(nextMuted);
          if (nextMuted) {
            if (muteIconEl) muteIconEl.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>';
          } else {
            if (muteIconEl) muteIconEl.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/>';
          }
        });
      } else {
        videoEl.muted = !videoEl.muted;
        if (videoEl.muted) {
          if (muteIconEl) {
            muteIconEl.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>';
          }
        } else {
          if (muteIconEl) {
            muteIconEl.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/>';
          }
        }
      }
    }

    if (playBtnEl) playBtnEl.addEventListener('click', togglePlay);
    if (muteBtnEl) muteBtnEl.addEventListener('click', toggleMute);

    const mockContainer = videoEl.parentElement;
    if (mockContainer) {
      mockContainer.addEventListener('click', (e) => {
        if (e.target.closest('.video-play') || e.target.closest('.video-mute') || e.target.closest('.video-upload-btn')) return;
        togglePlay();
      });
    }

    if (uploadBtnEl && inputEl) {
      uploadBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        inputEl.click();
      });
      inputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileURL = URL.createObjectURL(file);
          
          let activeVideo = videoEl;
          if (videoEl.tagName === 'IFRAME') {
            activeVideo = document.createElement('video');
            activeVideo.id = videoEl.id;
            activeVideo.className = videoEl.className;
            activeVideo.autoplay = true;
            activeVideo.loop = true;
            activeVideo.muted = true;
            activeVideo.playsInline = true;
            
            videoEl.parentNode.replaceChild(activeVideo, videoEl);
            
            // Re-setup with the new video element
            setupVideoCard(activeVideo, playBtnEl, playIconEl, muteBtnEl, muteIconEl, barsEl, uploadBtnEl, inputEl);
            activeVideo.src = fileURL;
            activeVideo.load();
            activeVideo.play().catch(err => console.log('Video play failed:', err));
            if (barsEl) barsEl.classList.remove('paused');
            if (playIconEl) {
              playIconEl.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
            }
            return;
          }
          
          videoEl.src = fileURL;
          videoEl.load();
          videoEl.play().catch(err => console.log('Video play failed:', err));
          if (barsEl) barsEl.classList.remove('paused');
          if (playIconEl) {
            playIconEl.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
          }
        }
      });
    }

    if (videoEl.autoplay || isVimeo) {
      if (barsEl) barsEl.classList.remove('paused');
      if (playIconEl) {
        playIconEl.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      }
    }
  }

  // Setup Left Card
  setupVideoCard(
    document.getElementById('heroUgcVideo'),
    null,
    null,
    document.getElementById('videoMuteBtn'),
    document.getElementById('muteIcon'),
    document.getElementById('videoBars'),
    document.getElementById('videoUploadBtnLeft'),
    document.getElementById('videoInputLeft')
  );

  // Setup Right Card
  setupVideoCard(
    document.getElementById('heroUgcVideoRight'),
    null,
    null,
    null,
    null,
    document.getElementById('videoBarsRight'),
    document.getElementById('videoUploadBtnRight'),
    document.getElementById('videoInputRight')
  );
}

/* ──────────────────────────────────────────────────────────
   11. REELS — infinite marquee + hover play + click modal
────────────────────────────────────────────────────────── */
function initReels() {
  const wrap  = document.querySelector('.reels-track-wrap');
  const track = document.querySelector('.reels-marquee-track');
  const inner = document.querySelector('.reels-inner');
  if (!wrap || !track || !inner) return;

  /* Clone the original card set and append for seamless loop */
  for(let i=0; i<4; i++){
    const clone = inner.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  /* Hover play / pause for all frames (original + cloned) */
  track.querySelectorAll('.reel-frame').forEach(frame => {
    const iframe = frame.querySelector('.reel-video');
    if (!iframe) return;

    const src = iframe.getAttribute('src');
    if (src && src.includes('vimeo.com')) {
      frame.classList.add('has-video');

      const player = typeof Vimeo !== 'undefined' ? new Vimeo.Player(iframe) : null;
      if (player) {
        iframe.vimeoPlayer = player;
        // player.pause().catch(() => {}); /* Removed for autoplay */

        frame.addEventListener('mouseenter', () => {
          player.play().catch(err => console.log('Vimeo play error:', err));
        });

        frame.addEventListener('mouseleave', () => {
          // player.pause().catch(() => {}); /* Removed for autoplay */
        });

        /* Click: open fullscreen modal preview */
        frame.addEventListener('click', () => {
          if (!frame.classList.contains('has-video')) return;
          openVideoModal(src, frame);
        });
      }
    }
  });

  /* Pause all videos when section leaves viewport */
  const section = document.querySelector('.video-showcase-section');
  if (section) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        track.querySelectorAll('.reel-video').forEach(iv => {
          if (iv.vimeoPlayer) iv.vimeoPlayer.pause().catch(() => {});
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

/* ──────────────────────────────────────────────────────────
   VIDEO PREVIEW MODAL
   Opens a fullscreen portrait modal when a reel card is clicked
────────────────────────────────────────────────────────── */
function initVideoModal() {
  const overlay   = document.getElementById('videoModal');
  const iframe    = document.getElementById('videoModalIframe');
  const closeBtn  = document.getElementById('videoModalClose');
  const label     = document.getElementById('videoModalLabel');
  if (!overlay || !iframe) return;

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    /* Stop video by blanking src, then restore after transition */
    setTimeout(() => { iframe.src = ''; }, 350);
  }

  closeBtn && closeBtn.addEventListener('click', closeModal);

  /* Close on backdrop click (outside container) */
  overlay.addEventListener('click', e => {
    if (!e.target.closest('.vmodal-container')) closeModal();
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  /* Expose opener globally so initReels can call it */
  window.openVideoModal = function(backgroundSrc, frame) {
    /* Extract Vimeo video ID from the background=1 src */
    const match = backgroundSrc && backgroundSrc.match(/vimeo\.com\/video\/([0-9]+)/);
    if (!match) return;
    const videoId = match[1];

    /* Get the reel label (e.g. "Reel 01") */
    const reelLabel = frame && frame.querySelector('.reel-label');
    if (label) label.textContent = reelLabel ? reelLabel.textContent : '';

    /* Build autoplay src with sound */
    const modalSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&loop=0&controls=1&title=0&byline=0&portrait=0`;
    iframe.src = modalSrc;

    /* Pause all inline card players while modal is open */
    document.querySelectorAll('.reel-video').forEach(iv => {
      if (iv.vimeoPlayer) iv.vimeoPlayer.pause().catch(() => {});
    });

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
}
/* ──────────────────────────────────────────────────────────
   ORBIT CARD CLICKS — Brand & Creator Logo Video Previews
   Clicking any .creator-card or .brand-card opens the video modal
────────────────────────────────────────────────────────── */
function initOrbitCards() {
  const orbitSection = document.querySelector('.partners-circle-section');
  if (!orbitSection) return;

  const cards = orbitSection.querySelectorAll('.creator-card[data-video-id], .brand-card[data-video-id]');

  cards.forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation(); // prevent bubbling into the orbit container
      const videoId = card.dataset.videoId;
      const label   = card.dataset.label || '';
      if (!videoId) return;

      // Build a synthetic Vimeo background src so openVideoModal can extract the ID
      const syntheticSrc = `https://player.vimeo.com/video/${videoId}?background=1`;

      // Create a fake frame element carrying the label so the modal shows it
      const fakeFrame = { querySelector: selector => {
        if (selector === '.reel-label') return { textContent: label };
        return null;
      }};

      if (typeof window.openVideoModal === 'function') {
        window.openVideoModal(syntheticSrc, fakeFrame);
      }
    });
  });
}

function initTestimonials() {
  const track = document.querySelector('.testi-marquee-track');
  const inner = document.querySelector('.testi-inner');
  if (!track || !inner) return;

  for(let i=0; i<3; i++){
    const clone = inner.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }
}





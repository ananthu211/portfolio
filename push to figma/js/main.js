/* ================================================================
   ANANTHU S — PORTFOLIO
   main.js — Premium scroll + motion system
================================================================ */

'use strict';

/* ── Feature detection ──────────────────────────────────────── */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH   = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/* ── Utilities ──────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* ── Virtual scroll state ───────────────────────────────────── */
const scroll = { current: 0, target: 0, velocity: 0, ease: 0.085 };
let scrollMax = 0;

/* ── DOM refs ───────────────────────────────────────────────── */
let scrollContainer = null;
let nav, ring, dot;
let heroTitle, heroSub, heroTagline, heroMeta;
let orbs = [];
let projectCards  = [];
let aboutStatement;
let heroAnimDone  = false;

/* ── Velocity marquee state ─────────────────────────────────── */
let velSection    = null;
let velWrapper    = null;
let velWrapperTop = 0;
let velSmooth     = 0;
let velPrevTarget = 0;
let velPrevNativeY= 0;

const VEL_ROWS = [
  { dir: -1, base: 0.40, vi: 0.40, offset: 0, w: 0, el: null },
  { dir: +1, base: 0.60, vi: 0.30, offset: 0, w: 0, el: null },
  { dir: -1, base: 0.30, vi: 0.50, offset: 0, w: 0, el: null },
];

/* ── Mouse state ────────────────────────────────────────────── */
const mouse = { x: -100, y: -100, rx: -100, ry: -100 };
let lastMX = -100, lastMY = -100;

/* ── Card tilt tracking ─────────────────────────────────────── */
const tiltingCards = new Set();


/* ================================================================
   INIT
================================================================ */
function init() {
  /* Hero entrance */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add('loaded');
    setTimeout(() => { heroAnimDone = true; }, 1800);
  }));

  /* Grab refs */
  nav            = qs('#nav');
  ring           = qs('#cursorRing');
  dot            = qs('#cursorDot');
  heroTitle      = qs('.hero-title');
  heroSub        = qs('.hero-sub');
  heroTagline    = qs('.hero-tagline');
  heroMeta       = qs('.hero-meta');
  orbs           = qsa('.hero-orb');
  aboutStatement = qs('.about-statement');
  projectCards   = qsa('.project-card');

  if (!TOUCH && !REDUCED) setupVirtualScroll();

  setupCursor();
  setupCardTilt();
  setupVelocityMarquee();
  setupReveal();
  setupCountUp();
  setupSmoothScroll();
  setupEmailHover();

  requestAnimationFrame(mainLoop);
}


/* ================================================================
   VIRTUAL SCROLL
================================================================ */
function setupVirtualScroll() {
  /* Wrap all body children in the scroll container */
  const children = [...document.body.children];

  scrollContainer = document.createElement('div');
  scrollContainer.id = 'scroll-container';
  document.body.appendChild(scrollContainer);
  children.forEach(child => scrollContainer.appendChild(child));

  /*
   * CRITICAL: position:fixed breaks when any ancestor has a CSS transform.
   * #scroll-container gets translateY every frame, so cursor, dot, and nav
   * must live directly on <body> — outside the transformed container.
   */
  /* Fixed-position elements must live on <body>, not inside the transformed container */
  [
    qs('#cursorRing'), qs('#cursorDot'), qs('#nav'), qs('#copilotBtn'),
  ].forEach(el => { if (el) document.body.appendChild(el); });

  document.body.classList.add('js-scroll');

  function updateMax() {
    scrollMax = Math.max(0, scrollContainer.scrollHeight - window.innerHeight);
  }
  updateMax();

  const ro = new ResizeObserver(updateMax);
  ro.observe(scrollContainer);

  /* Wheel */
  window.addEventListener('wheel', e => {
    e.preventDefault();
    scroll.target = clamp(scroll.target + e.deltaY * 0.9, 0, scrollMax);
  }, { passive: false });

  /* Basic touch for virtual scroll */
  let touchY = 0;
  window.addEventListener('touchstart', e => {
    touchY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    const dy = touchY - e.touches[0].clientY;
    touchY = e.touches[0].clientY;
    scroll.target = clamp(scroll.target + dy, 0, scrollMax);
  }, { passive: true });
}


/* ================================================================
   CURSOR
================================================================ */
function setupCursor() {
  if (!ring || !dot) return;

  /* "View" label inside ring for card hover state */
  const label = document.createElement('span');
  label.className = 'cursor-label';
  label.textContent = 'View';
  ring.appendChild(label);

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    ring.style.opacity = '0';
    dot.style.opacity  = '0';
  });
  document.addEventListener('mouseenter', () => {
    ring.style.opacity = '1';
    dot.style.opacity  = '1';
  });

  /* Link / button hover */
  const linkSels = 'a, button, .sugg-chip, .m-nav-item';
  qsa(linkSels).forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!ring.classList.contains('is-card')) ring.classList.add('is-link');
    });
    el.addEventListener('mouseleave', () => ring.classList.remove('is-link'));
  });

  /* Card hover */
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      ring.classList.remove('is-link');
      ring.classList.add('is-card');
    });
    card.addEventListener('mouseleave', () => ring.classList.remove('is-card'));
  });
}

function tickCursor() {
  if (!ring || !dot) return;

  const vx    = mouse.x - lastMX;
  const vy    = mouse.y - lastMY;
  lastMX      = mouse.x;
  lastMY      = mouse.y;
  const speed = Math.sqrt(vx * vx + vy * vy);

  mouse.rx = lerp(mouse.rx, mouse.x, 0.11);
  mouse.ry = lerp(mouse.ry, mouse.y, 0.11);

  const stretch = clamp(1 + speed * 0.016, 1, 1.45);
  const squish  = clamp(1 - speed * 0.007, 0.72, 1);
  const angle   = speed > 1 ? Math.atan2(vy, vx) * (180 / Math.PI) : 0;

  ring.style.left      = mouse.rx + 'px';
  ring.style.top       = mouse.ry + 'px';
  ring.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(${stretch.toFixed(3)}) scaleY(${squish.toFixed(3)})`;
}


/* ================================================================
   3D CARD TILT
================================================================ */
function setupCardTilt() {
  if (TOUCH || REDUCED) return;

  projectCards.forEach(card => {
    const wrap = qs('.mockup-wrap', card);
    if (wrap) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      wrap.appendChild(glare);
    }

    card.addEventListener('mousemove', e => {
      tiltingCards.add(card);
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / (rect.height / 2)) * -5;
      const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  5;

      card.style.transition   = 'transform .05s linear';
      card.style.transform    = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;

      if (wrap) {
        const glare = qs('.card-glare', wrap);
        if (glare) {
          const gx = ((e.clientX - rect.left) / rect.width)  * 100;
          const gy = ((e.clientY - rect.top)  / rect.height) * 100;
          glare.style.opacity    = '1';
          glare.style.background =
            `radial-gradient(circle at ${gx}% ${gy}%, rgba(232,213,176,.08) 0%, transparent 55%)`;
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      tiltingCards.delete(card);
      card.style.transition = 'transform .65s cubic-bezier(.16,1,.3,1)';
      card.style.transform  = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      const glare = qs('.card-glare', card);
      if (glare) glare.style.opacity = '0';
    });
  });
}



/* ================================================================
   PARALLAX + HERO SCRUB
================================================================ */
function tickTransforms() {
  if (REDUCED) return;

  const s  = TOUCH ? window.scrollY : scroll.current;
  const vh = window.innerHeight;

  /* ── Orbs: scroll parallax + mouse ── */
  const orbStrengths    = [0.020, 0.028, 0.016];
  const orbMouseFactors = [10, 20, 32];
  orbs.forEach((orb, i) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (mouse.x - cx) / Math.max(cx, 1);
    const dy = (mouse.y - cy) / Math.max(cy, 1);
    const mx = dx * orbMouseFactors[i];
    const my = dy * orbMouseFactors[i] + s * orbStrengths[i];
    orb.style.transform = `translate(${mx}px, ${my}px)`;
  });

  /* ── Hero scrub ── */
  const heroProgress = clamp(s / vh, 0, 1);

  if (heroTitle) {
    heroTitle.style.transform = `translateY(${s * 0.06 + heroProgress * -70}px)`;
    if (heroAnimDone) {
      heroTitle.style.opacity = clamp(1 - heroProgress * 2, 0, 1).toFixed(3);
    }
  }

  if (heroSub) {
    heroSub.style.transform = `translateY(${s * 0.04 + heroProgress * -40}px)`;
    if (heroAnimDone) {
      heroSub.style.opacity = clamp(1 - heroProgress * 2.5, 0, 1).toFixed(3);
    }
  }

  if (heroTagline) {
    heroTagline.style.transform = `translateY(${s * 0.09 + heroProgress * -30}px)`;
    if (heroAnimDone) {
      heroTagline.style.opacity = clamp(1 - heroProgress * 3, 0, 1).toFixed(3);
    }
  }

  if (heroMeta) {
    heroMeta.style.transform = `translateX(${heroProgress * 50}px)`;
    if (heroAnimDone) {
      heroMeta.style.opacity = clamp(1 - heroProgress * 2.5, 0, 1).toFixed(3);
    }
  }

  /* ── Project card parallax (viewport-center relative) ── */
  projectCards.forEach(card => {
    const rect   = card.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const dist   = center - vh / 2;

    const idxEl  = qs('.project-index', card);
    const titleEl= qs('.project-title',  card);
    const mockup = qs('.mockup-wrap',    card);

    if (idxEl)  idxEl.style.transform  = `translateY(${dist * -0.055}px)`;
    if (titleEl && !tiltingCards.has(card)) {
      titleEl.style.transform = `translateY(${dist * 0.022}px)`;
    }
    if (mockup && !tiltingCards.has(card)) {
      mockup.style.transform = `translateY(${dist * 0.038}px)`;
    }
  });

  /* ── About statement ── */
  if (aboutStatement) {
    const rect = aboutStatement.getBoundingClientRect();
    const dist = (rect.top + rect.height / 2) - vh / 2;
    aboutStatement.style.transform = `translateY(${dist * 0.048}px)`;
  }
}


/* ================================================================
   VELOCITY FX
================================================================ */
function tickVelocityFx(vel) {
  if (REDUCED || !scrollContainer) return;

  const abs   = Math.abs(vel);
  const blurV = clamp(abs * 0.14, 0, 2.2);
  scrollContainer.style.filter = blurV > 0.08 ? `blur(${blurV.toFixed(2)}px)` : '';
}


/* ================================================================
   NAV
================================================================ */
function tickNav() {
  if (!nav) return;
  const y = TOUCH ? window.scrollY : scroll.current;
  nav.classList.toggle('scrolled', y > 60);
}


/* ================================================================
   MAIN RAF LOOP
================================================================ */
function mainLoop() {
  if (!TOUCH && !REDUCED && scrollContainer) {
    scroll.current  = lerp(scroll.current, scroll.target, scroll.ease);
    scroll.velocity = scroll.target - scroll.current;
    scrollContainer.style.transform = `translateY(${-scroll.current}px)`;
  } else {
    scroll.current  = window.scrollY;
    scroll.velocity = 0;
  }

  tickCursor();
  tickTransforms();
  tickVelocityFx(scroll.velocity);
  tickVelocityMarquee();
  tickNav();

  requestAnimationFrame(mainLoop);
}


/* ================================================================
   SCROLL REVEALS
================================================================ */
function setupReveal() {
  const items = qsa('.reveal-item');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  items.forEach(el => io.observe(el));
}


/* ================================================================
   SECTION COUNT-UP
================================================================ */
function setupCountUp() {
  const els = qsa('[data-count]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 700;
      let start = null;

      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = String(Math.round(p * end)).padStart(2, '0');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(end).padStart(2, '0');
      }

      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => io.observe(el));
}


/* ================================================================
   SMOOTH SCROLL — anchor links
================================================================ */
function setupSmoothScroll() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id     = a.getAttribute('href');
      const target = qs(id);
      if (!target) return;
      e.preventDefault();

      if (!TOUCH && !REDUCED && scrollContainer) {
        /* Absolute offset within scroll-container */
        const absTop = target.getBoundingClientRect().top + scroll.current - 80;
        scroll.target = clamp(absTop, 0, scrollMax);
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


/* ================================================================
   CONTACT EMAIL — letter stagger
================================================================ */
function setupEmailHover() {
  const link = qs('.contact-email');
  const str  = qs('.email-str');
  if (!link || !str) return;

  const original = str.textContent;

  function split() {
    str.innerHTML = '';
    [...original].forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent   = ch === ' ' ? '\u00A0' : ch;
      span.style.display = 'inline-block';
      span.style.transition =
        `transform .4s cubic-bezier(.16,1,.3,1) ${i * 0.018}s,` +
        `opacity .4s ease ${i * 0.018}s`;
      str.appendChild(span);
    });
  }

  link.addEventListener('mouseenter', () => {
    split();
    requestAnimationFrame(() => {
      qsa('span', str).forEach((sp, i) => {
        sp.style.transform = 'translateY(-3px)';
        sp.style.opacity   = '0.7';
        setTimeout(() => {
          sp.style.transform = 'translateY(0)';
          sp.style.opacity   = '1';
        }, i * 18);
      });
    });
  });

  link.addEventListener('mouseleave', () => {
    str.textContent = original;
  });
}


/* ================================================================
   VELOCITY MARQUEE
================================================================ */
function setupVelocityMarquee() {
  velWrapper = qs('.vel-wrapper');
  velSection = qs('#velSection');
  if (!velWrapper || !velSection) return;

  /* Wire up track elements */
  qsa('.vel-row', velSection).forEach((row, i) => {
    const track = qs('.vel-track', row);
    if (!track) return;
    VEL_ROWS[i].el = track;
  });

  /* Cache wrapper top after layout (scroll = 0 at init) */
  function cacheTop() {
    velWrapperTop = velWrapper.getBoundingClientRect().top +
      (scrollContainer ? scroll.current : window.scrollY);
  }
  cacheTop();

  const ro = new ResizeObserver(cacheTop);
  ro.observe(velWrapper);

  /* Cache row widths (1/3 of total since content is triplicated) */
  function cacheWidths() {
    VEL_ROWS.forEach(row => {
      if (row.el) row.w = row.el.scrollWidth / 3;
    });
  }
  /* Give fonts a moment to load then measure */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(cacheWidths);
  } else {
    setTimeout(cacheWidths, 300);
  }
  window.addEventListener('resize', cacheWidths);

  /* Entry animation via IntersectionObserver */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        velWrapper.classList.add('vel-entered');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  io.observe(velWrapper);

  velPrevTarget   = scroll.target;
  velPrevNativeY  = window.scrollY;
}

function tickVelocityMarquee() {
  if (!velSection || !VEL_ROWS[0].el) return;

  /* ── 1. Compute raw velocity ── */
  let rawVel;
  if (!TOUCH && !REDUCED && scrollContainer) {
    /* Virtual scroll: delta of target since last frame */
    rawVel         = (scroll.target - velPrevTarget) * 0.55;
    velPrevTarget  = scroll.target;
  } else {
    rawVel         = window.scrollY - velPrevNativeY;
    velPrevNativeY = window.scrollY;
  }

  /* ── 2. Smooth velocity ── */
  velSmooth = lerp(velSmooth, rawVel, 0.1);

  /* ── 3. Sticky simulation for virtual scroll ── */
  if (!TOUCH && !REDUCED && scrollContainer) {
    const wrapH   = velWrapper.offsetHeight;           /* ≈ 300vh */
    const secH    = velSection.offsetHeight;           /* ≈ 100vh */
    const progress = scroll.current - velWrapperTop;
    const stickyY  = clamp(progress, 0, wrapH - secH);
    velSection.style.transform = `translateY(${stickyY}px)`;
  }

  /* ── 4. Advance each row ── */
  const absVel     = Math.abs(velSmooth);
  const brightness = clamp(0.08 + absVel * 0.038, 0.08, 0.50);

  VEL_ROWS.forEach(row => {
    if (!row.el || !row.w) return;

    /* Speed: left rows speed up with scroll-down, right rows slow/reverse */
    const velSign = row.dir < 0 ? 1 : -1;
    const speed   = row.base + velSmooth * row.vi * velSign;

    row.offset += speed;
    /* Wrap with modulo — handles negative speed (reverse) */
    row.offset = ((row.offset % row.w) + row.w) % row.w;

    /* Translate: left→ neg, right → offset from -w back toward 0 */
    const tx = row.dir < 0 ? -row.offset : row.offset - row.w;
    row.el.style.transform = `translateX(${tx}px)`;

    /* Velocity brightness */
    row.el.style.color = `rgba(240, 236, 228, ${brightness.toFixed(3)})`;
  });
}



/* ================================================================
   BOOT
================================================================ */
document.addEventListener('DOMContentLoaded', init);

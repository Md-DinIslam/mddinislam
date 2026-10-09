/**
 * Md. Din Islam — Portfolio
 * Navigation, theme switching, scroll effects and reveal animations.
 */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const themeToggle = document.getElementById('themeToggle');
  const scrollTopBtn = document.getElementById('scrollTop');
  const progressBar = document.getElementById('scrollProgress');

  /* ---------- Mobile navigation ---------- */
  function setMenu(open) {
    navMenu.classList.toggle('active', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function initMobileNav() {
    navToggle.addEventListener('click', () => {
      setMenu(!navMenu.classList.contains('active'));
    });

    // Close on link click, outside click, or Escape
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !e.target.closest('#navbar')) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- Theme (persists choice) ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f8f7' : '#07100d');
  }

  function initTheme() {
    applyTheme(root.getAttribute('data-theme') || 'dark');

    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* storage unavailable — theme still applies for this visit */
      }
    });
  }

  /* ---------- Scroll: navbar state, progress bar, back-to-top ---------- */
  function initScrollEffects() {
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      navbar.classList.toggle('scrolled', y > 50);
      scrollTopBtn.classList.toggle('visible', y > 300);
      progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    });
  }

  /* ---------- Smooth scrolling for in-page links ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');

        if (href === '#' || href === '') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: scrollBehavior });
          return;
        }

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight + 1;
        window.scrollTo({ top, behavior: scrollBehavior });
        history.replaceState(null, '', href);
      });
    });
  }

  /* ---------- Highlight the nav link for the section in view ---------- */
  function initActiveNav() {
    const links = new Map();
    navMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
      links.set(link.getAttribute('href').slice(1), link);
    });

    // Sections without their own menu entry map to a neighbour
    const alias = { references: 'education' };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = alias[entry.target.id] || entry.target.id;
        links.forEach((link) => link.classList.remove('active'));
        const link = links.get(id);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
  }

  /* ---------- Reveal on scroll (staggered within a group) ---------- */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => {
      const group = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
      el.style.setProperty('--delay', `${Math.min(group.indexOf(el), 6) * 0.07}s`);
      observer.observe(el);
    });
  }

  /* ---------- Count-up numbers in the hero stats ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion || Number.isNaN(target)) return;

    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
  }

  /* ---------- "View more" for long lists ---------- */
  // Any container with data-collapse="N" shows its first N items and hides the rest behind a toggle.
  function initCollapsibleLists() {
    document.querySelectorAll('[data-collapse]').forEach((list, index) => {
      const limit = parseInt(list.dataset.collapse, 10) || 3;
      const extra = Array.from(list.children).slice(limit);
      if (extra.length === 0) return;

      if (!list.id) list.id = `collapsible-${index}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-secondary view-more';
      button.setAttribute('aria-controls', list.id);

      function render(expanded) {
        extra.forEach((item) => item.classList.toggle('is-collapsed', !expanded));
        button.setAttribute('aria-expanded', String(expanded));
        button.innerHTML = expanded
          ? 'Show less <i class="fas fa-chevron-up"></i>'
          : `View more (${extra.length}) <i class="fas fa-chevron-down"></i>`;
      }

      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        render(expanded);
        if (!expanded) list.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      });

      render(false);
      const wrap = document.createElement('div');
      wrap.className = 'view-more-wrap';
      wrap.appendChild(button);
      list.after(wrap);
    });
  }

  /* ---------- Init ---------- */
  initMobileNav();
  initTheme();
  initScrollEffects();
  initSmoothScroll();
  initActiveNav();
  initReveal();
  initCounters();
  initCollapsibleLists();

  console.log('%cWelcome to my portfolio! 🚀', 'font-size: 20px; color: #10b981; font-weight: bold;');
  console.log('%cInterested in AI agents and LLM systems? Let\'s connect!', 'font-size: 14px; color: #0d9488;');
})();

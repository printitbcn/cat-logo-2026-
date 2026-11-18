/**
 * PRINT IT — Home redesign motion (scoped)
 * Solo corre efectos visuales de la home. No altera lógica de navegación.
 */
(function initHomeRedesign() {
  const reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function isHomeActive() {
    return document.body.classList.contains('is-home-page');
  }

  function runShowcaseMotion() {
    const showcase = document.getElementById('image-showcase');
    if (!showcase) return;
    showcase.classList.remove('home-showcase-ready');
    if (!isHomeActive() || reduce) return;
    // Force reflow so animation retriggers on theme/home enter
    void showcase.offsetWidth;
    requestAnimationFrame(() => {
      showcase.classList.add('home-showcase-ready');
    });
  }

  function setupReveal() {
    const home = document.getElementById('page-home');
    if (!home) return;

    const targets = home.querySelectorAll(
      '.home-cover-nav, .home-cover-brand, .home-cover-editorial > *, .home-cover-meta, .home-page-categories .mini-card, .home-page-footer'
    );

    targets.forEach((el, i) => {
      el.classList.add('home-reveal');
      el.style.setProperty('--home-delay', `${Math.min(i * 70, 700)}ms`);
    });

    if (reduce) {
      targets.forEach((el) => el.classList.add('is-inview'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.02, rootMargin: '40px 0px 40px 0px' }
    );

    targets.forEach((el) => io.observe(el));

    // Fallback: ensure above-the-fold content never stays invisible
    requestAnimationFrame(() => {
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-inview');
        }
      });
    });
  }

  function bindKeyboardChips() {
    const chips = document.querySelectorAll('#page-home .mini-card.home-pantone');
    chips.forEach((chip) => {
      chip.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          chip.click();
        }
      });
    });
  }

  onReady(() => {
    setupReveal();
    bindKeyboardChips();
    runShowcaseMotion();

    // Re-run showcase motion when theme toggles (existing app.js sets data-theme)
    const root = document.documentElement;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          runShowcaseMotion();
          break;
        }
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // Re-run when returning to home (body class toggle)
    const bodyMo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (isHomeActive()) runShowcaseMotion();
          break;
        }
      }
    });
    bodyMo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  });
})();

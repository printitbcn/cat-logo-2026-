/**
 * Foco exclusivo entre escaparate (primary) y vídeo de galería.
 * Requiere: #dual-video-gallery, [data-dual-stage="gallery"], #image-showcase, [data-dual-focus]
 */
(function initDualVideoFocus() {
  const galleryVideo = document.getElementById('dual-video-gallery');
  const galleryStage = document.querySelector('[data-dual-stage="gallery"]');
  const showcaseRoot = document.getElementById('image-showcase');
  const tabs = Array.from(document.querySelectorAll('[data-dual-focus]'));
  if (!galleryVideo || !galleryStage || !showcaseRoot || !tabs.length) return;

  let focus = 'primary';
  let showcaseVideo = null;
  let userIntent = null;

  function pauseEl(v) {
    if (!v) return;
    try {
      v.pause();
    } catch (_) {}
  }

  function playEl(v) {
    if (!v) return;
    try {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_) {}
  }

  function setTabState(which) {
    tabs.forEach((btn) => {
      const on = btn.getAttribute('data-dual-focus') === which;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function gateExclusive(activeClip) {
    const galleryOn = activeClip === 'gallery';
    galleryVideo.dataset.printitExclusiveOff = galleryOn ? '0' : '1';
    if (showcaseVideo) {
      showcaseVideo.dataset.printitExclusiveOff = galleryOn ? '1' : '0';
    }
  }

  function setFocus(which, { fromUser } = {}) {
    focus = which === 'gallery' ? 'gallery' : 'primary';
    setTabState(focus);

    const galleryOn = focus === 'gallery';
    galleryStage.classList.toggle('dual-clip-active', galleryOn);
    galleryStage.classList.toggle('dual-clip-idle', !galleryOn);
    showcaseRoot.classList.toggle('dual-clip-active', !galleryOn);
    showcaseRoot.classList.toggle('dual-clip-idle', galleryOn);
    gateExclusive(focus);

    if (galleryOn) {
      pauseEl(showcaseVideo);
      playEl(galleryVideo);
    } else {
      pauseEl(galleryVideo);
      playEl(showcaseVideo);
    }

    if (fromUser && galleryOn) {
      try {
        galleryVideo.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } catch (_) {}
    }
  }

  function ensureShowcaseCue() {
    if (showcaseRoot.querySelector('.dual-clip-cue')) return;
    const cue = document.createElement('span');
    cue.className = 'dual-clip-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.textContent = 'Reproducir';
    showcaseRoot.appendChild(cue);
  }

  function bindShowcaseVideo(v) {
    if (!v || v === showcaseVideo) return;
    showcaseVideo = v;
    showcaseVideo.setAttribute('data-dual-clip', 'primary');
    ensureShowcaseCue();
    if (!showcaseVideo.dataset.dualFocusBound) {
      showcaseVideo.dataset.dualFocusBound = '1';
      showcaseVideo.addEventListener('pointerdown', () => {
        userIntent = 'primary';
      });
      showcaseVideo.addEventListener('play', () => {
        if (focus === 'primary') {
          pauseEl(galleryVideo);
          return;
        }
        if (userIntent === 'primary') {
          userIntent = null;
          setFocus('primary', { fromUser: true });
          return;
        }
        pauseEl(showcaseVideo);
      });
      showcaseRoot.addEventListener('click', (e) => {
        if (e.target.closest('button, a, .carousel-controls, .carousel-dots')) return;
        if (focus !== 'primary') setFocus('primary', { fromUser: true });
      });
    }
    setFocus(focus);
  }

  function watchShowcase() {
    const v = showcaseRoot.querySelector('video#showcase-img, video.gallery-video, video');
    if (v) bindShowcaseVideo(v);
  }

  galleryVideo.removeAttribute('autoplay');
  galleryVideo.dataset.printitExclusiveOff = '1';

  galleryVideo.addEventListener('pointerdown', () => {
    userIntent = 'gallery';
  });
  galleryStage.addEventListener('click', () => {
    if (focus !== 'gallery') setFocus('gallery', { fromUser: true });
  });
  galleryVideo.addEventListener('play', () => {
    if (focus === 'gallery') {
      pauseEl(showcaseVideo);
      return;
    }
    if (userIntent === 'gallery') {
      userIntent = null;
      setFocus('gallery', { fromUser: true });
      return;
    }
    pauseEl(galleryVideo);
  });

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      setFocus(btn.getAttribute('data-dual-focus'), { fromUser: true });
    });
  });

  watchShowcase();
  const mo = new MutationObserver(() => watchShowcase());
  mo.observe(showcaseRoot, { childList: true, subtree: true });

  setTimeout(() => setFocus('primary'), 120);
  setTimeout(() => setFocus('primary'), 400);
})();

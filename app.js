/* ===== Print It — Catálogo Comercial JS (Dark Portfolio Style) ===== */

// ===== IMAGE CAROUSEL =====
const HOME_CAROUSEL_IMAGE = 'Material Inicial/PORTADA-PRINT-IT.png';
let carouselImages = [HOME_CAROUSEL_IMAGE];
const CATALOGUE_SHOWCASE_IMAGE = 'assets/img/products/luminaria-showroom-1.jpeg';
const PRODUCT_SHOWCASE_IMAGE = 'assets/img/products/luminaria-p100.png';
const DALI_SHOWCASE_VIDEO = 'DALI : CASSAMBI /dali cassambi control .mp4';
const CONTACT_SHOWCASE_IMAGE = 'assets/img/products/luminaria-showroom-2.jpeg';
let currentImageIndex = 0;
const FIXED_SHOWCASE_LABEL = 'MAKE AN IMPRESSION';

/**
 * Primera vista de la galería principal de cada ficha (imagen o poster del primer vídeo),
 * para el carrusel del panel izquierdo en la página «Aplicaciones».
 */
const PRINTIT_CATALOGUE_GALLERY_FIRST_PREVIEW = {
  'product-banners-y-circulares.html': 'assets/img/categories/aeris.png',
  'product-barniz-drop-gloss.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-barniz-semi-mate.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-con-luz.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-cubos.html': 'assets/img/categories/cubos%20aereos%20.png',
  'product-custom.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-dali-casambi.html': 'DALI : CASSAMBI /dali cassambi control .mp4',
  'product-dynamic-white.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-forrado-columnas.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-forrado-paredes.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-frisos.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-impresion-uvi.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-lightbox-doble-cara.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-lightbox-pared.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-luxpanel.html': 'assets/img/products/luxpanel-2.png',
  'product-on-off.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-relieve-braille.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-relieve-cmyk.html': 'assets/img/products/luminaria-showroom-1.jpeg',
  'product-rigidos.html': 'RI%CC%81GIDOS%20/ri%CC%81gidos%202.png',
  'product-sin-luz.html': 'assets/img/categories/totems.png',
  'product-tunable-white.html': 'TUNABLE WHITE /TUNABLE WHITE IN PERSPECTIVE .png'
};

let showcaseLastCleanSrc = '';

const ONOFF_CORRECTED_MOV_POSTER = 'ON-OFF/cover on off.png';
const PROFILE_IMAGE_OVERRIDES = {
  P30: 'PERFILERIA /P30.png',
  P35: 'PERFILERIA /P35.png'
};

function updateShowcaseImage(src, label) {
  const labelEl = document.getElementById('selected-label');
  if (src == null || String(src).trim() === '') return;

  const cleanSrc = String(src).split('?')[0];
  const isGif = /\.gif$/i.test(cleanSrc);
  const isVideoSrc = /\.(mp4|webm|mov)$/i.test(cleanSrc);
  const isShowcaseContainCenter = /desmiembre\.mp4$/i.test(cleanSrc);
  const isOnOffCorrectedMov = /ON OFF CORRECTED\.mov$/i.test(cleanSrc);

  let mediaEl = document.getElementById('showcase-img');
  if (!mediaEl) {
    const showcase = document.getElementById('image-showcase');
    if (!showcase) return;
    if (isVideoSrc) {
      const v = document.createElement('video');
      v.id = 'showcase-img';
      v.className = 'gallery-video';
      v.setAttribute('autoplay', '');
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.loop = true;
      showcase.insertBefore(v, showcase.firstChild);
      mediaEl = v;
    } else {
      const im = document.createElement('img');
      im.id = 'showcase-img';
      im.alt = '';
      im.loading = 'eager';
      im.decoding = 'async';
      try {
        im.fetchPriority = 'high';
      } catch (_) {}
      showcase.insertBefore(im, showcase.firstChild);
      mediaEl = im;
    }
  }

  mediaEl.style.opacity = '0';
  mediaEl.style.transform = 'scale(1.02)';

  setTimeout(() => {
    let mediaEl = document.getElementById('showcase-img');
    if (!mediaEl) return;
    if (isVideoSrc && mediaEl.tagName !== 'VIDEO') {
      const v = document.createElement('video');
      v.id = 'showcase-img';
      v.className = 'gallery-video';
      v.setAttribute('autoplay', '');
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.loop = true;
      mediaEl.replaceWith(v);
      mediaEl = v;
    } else if (!isVideoSrc && !isGif && mediaEl.tagName === 'VIDEO') {
      const im = document.createElement('img');
      im.id = 'showcase-img';
      im.alt = '';
      im.loading = 'eager';
      im.decoding = 'async';
      try {
        im.fetchPriority = 'high';
      } catch (_) {}
      mediaEl.replaceWith(im);
      mediaEl = im;
    }

    const isVideoEl = mediaEl.tagName === 'VIDEO';
    let nextSrc = cleanSrc;
    if (isGif) {
      if (!isVideoEl) mediaEl.loading = 'eager';
      if (showcaseLastCleanSrc && showcaseLastCleanSrc !== cleanSrc) {
        nextSrc = `${cleanSrc}?_=${Date.now()}`;
      }
    }
    showcaseLastCleanSrc = cleanSrc;
    mediaEl.classList.toggle('showcase-video--contain-center', isShowcaseContainCenter);
    if (isVideoEl) {
      if (isVideoSrc) {
        mediaEl.querySelectorAll('source').forEach(s => s.remove());
        mediaEl.poster = isOnOffCorrectedMov ? ONOFF_CORRECTED_MOV_POSTER : '';
        mediaEl.src = nextSrc;
        mediaEl.load();
        mediaEl.play().catch(() => { });
      } else {
        // If showcase is video but target is image, render image as poster.
        mediaEl.pause();
        mediaEl.removeAttribute('src');
        mediaEl.poster = nextSrc;
        mediaEl.load();
      }
    } else {
      mediaEl.src = nextSrc;
    }
    mediaEl.style.opacity = '1';
    mediaEl.style.transform = 'scale(1)';
    if (labelEl) labelEl.textContent = FIXED_SHOWCASE_LABEL;
  }, 300);
}

function updateDots() {
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentImageIndex);
  });
}

function setCarouselImages(images, startIndex = 0) {
  if (!Array.isArray(images) || images.length === 0) return;
  carouselImages = images;
  currentImageIndex = Math.max(0, Math.min(startIndex, carouselImages.length - 1));
  updateDots();
}

function nextImage() {
  if (!carouselImages.length) return;
  currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
  updateShowcaseImage(carouselImages[currentImageIndex]);
  updateDots();
}

function prevImage() {
  if (!carouselImages.length) return;
  currentImageIndex = (currentImageIndex - 1 + carouselImages.length) % carouselImages.length;
  updateShowcaseImage(carouselImages[currentImageIndex]);
  updateDots();
}

function goToImage(index) {
  if (!carouselImages.length) return;
  currentImageIndex = Math.max(0, Math.min(index, carouselImages.length - 1));
  updateShowcaseImage(carouselImages[currentImageIndex]);
  updateDots();
}

// ===== PAGE NAVIGATION (SPA-like) =====
/** Evita bucles cuando applyHashRoute() llama a showPage / goToCatalogueAll. */
let printitApplyingHashRoute = false;

function replaceAppHashForPage(pageName) {
  const path = `${window.location.pathname}${window.location.search}`;
  const allowed = ['home', 'catalogue', 'product', 'contact'];
  if (!allowed.includes(pageName)) return;
  if (pageName === 'home') {
    if (window.location.hash) {
      history.replaceState(null, '', path);
    }
    return;
  }
  const nextUrl = `${path}#${pageName}`;
  const cur = `${window.location.pathname}${window.location.search}${window.location.hash || ''}`;
  if (cur !== nextUrl) {
    history.replaceState(null, '', nextUrl);
  }
}

function showPage(pageName, event) {
  if (event) event.preventDefault();

  const target = document.getElementById(`page-${pageName}`);
  if (!target) return;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target
  target.classList.add('active');

  // Scroll right panel to top
  const panelRight = document.getElementById('panel-right');
  if (panelRight) panelRight.scrollTop = 0;

  // Reset image based on page
  if (pageName === 'home') {
    setCarouselImages([HOME_CAROUSEL_IMAGE], 0);
    updateShowcaseImage(HOME_CAROUSEL_IMAGE, 'Catálogo Comercial');
    currentImageIndex = 0;
    renderCarouselDots(1);
    updateDots();
  } else if (pageName === 'catalogue') {
    /* El carrusel del catálogo se actualiza en filterCatalogue(), goToCatalogueAll() y openCatalogueCategory(). */
  } else if (pageName === 'product') {
    syncProductGalleryToShowcase();
    const productSources = getProductGallerySources();
    if (productSources.length) {
      currentImageIndex = 0;
      updateShowcaseImage(productSources[0], FIXED_SHOWCASE_LABEL);
      renderCarouselDots(productSources.length);
      updateDots();
    } else {
      updateShowcaseImage(getProductFallbackShowcase(), 'Luminaria ON / OFF');
      renderCarouselDots(1);
    }
    applyProductContextFromPage();
  } else if (pageName === 'contact') {
    setCarouselImages([CONTACT_SHOWCASE_IMAGE], 0);
    updateShowcaseImage(CONTACT_SHOWCASE_IMAGE, 'Roberto Ferrero · Print It');
    renderCarouselDots(1);
    updateDots();
  }

  if (!printitApplyingHashRoute) {
    replaceAppHashForPage(pageName);
  }

  // Re-trigger animations
  setTimeout(() => {
    target.querySelectorAll('.animate-in').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // Trigger reflow
      el.style.animation = '';
    });
  }, 10);
}

function getProductFallbackShowcase() {
  const page = (window.location.pathname || '').split('/').pop() || '';
  if (page === 'product-dali-casambi.html') return DALI_SHOWCASE_VIDEO;
  return PRODUCT_SHOWCASE_IMAGE;
}

function getProductGallerySources() {
  const items = document.querySelectorAll('#page-product .sheet-media-gallery .product-gallery .gallery-item');
  const sources = [];
  items.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      const src = img.getAttribute('src') || img.src;
      if (src) sources.push(src);
      return;
    }
    const video = item.querySelector('video');
    if (video) {
      const sourceEl = video.querySelector('source[src]');
      const videoSrc = (sourceEl && sourceEl.getAttribute('src')) || video.getAttribute('src') || '';
      if (videoSrc) {
        sources.push(videoSrc);
        return;
      }
      const poster = video.getAttribute('poster');
      if (poster) sources.push(poster);
    }
  });
  return sources;
}

function syncProductGalleryToShowcase() {
  const galleryItems = document.querySelectorAll('#page-product .sheet-media-gallery .product-gallery .gallery-item');
  if (!galleryItems.length) return;
  const sources = getProductGallerySources();
  if (!sources.length) return;
  setCarouselImages(sources, 0);

  galleryItems.forEach((item, idx) => {
    if (item.dataset.previewBound === '1') return;
    item.dataset.previewBound = '1';
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSrc = sources[idx] || sources[0];
      currentImageIndex = idx < sources.length ? idx : 0;
      updateShowcaseImage(targetSrc, 'MAKE AN IMPRESSION');
      updateDots();
    });
  });
}

function productHrefFromCatalogueRow(item) {
  const link = item.querySelector('a[href^="product-"][href$=".html"]');
  if (!link) return '';
  return (link.getAttribute('href') || '').trim();
}

function collectCatalogueCarouselData() {
  const list = document.getElementById('catalogue-list');
  if (!list) return { sources: [], hrefs: [], rows: [] };
  const sources = [];
  const hrefs = [];
  const rows = [];
  const seenHref = new Set();
  list.querySelectorAll('.catalogue-item').forEach(item => {
    if (item.classList.contains('hidden')) return;
    item.querySelectorAll('a[href^="product-"][href$=".html"]').forEach(link => {
      const href = (link.getAttribute('href') || '').trim();
      if (!href || seenHref.has(href)) return;
      seenHref.add(href);
      const mapped = PRINTIT_CATALOGUE_GALLERY_FIRST_PREVIEW[href];
      const src = mapped || item.dataset.img || '';
      if (!src) return;
      sources.push(src);
      hrefs.push(href);
      rows.push(item);
    });
  });
  return { sources, hrefs, rows };
}

function renderCarouselDots(n) {
  const wrap = document.getElementById('carousel-dots');
  if (!wrap) return;
  const count = Math.max(1, n);
  const buttons = [];
  for (let i = 0; i < count; i++) {
    const active = i === currentImageIndex ? ' active' : '';
    buttons.push(
      `<button type="button" class="carousel-dot${active}" onclick="goToImage(${i})" aria-label="Vista ${i + 1}"></button>`
    );
  }
  wrap.innerHTML = `\n                    ${buttons.join('\n                    ')}\n                `;
}

function applyCatalogueShowcaseCarousel() {
  const list = document.getElementById('catalogue-list');
  if (!list) return;
  const { sources, hrefs, rows } = collectCatalogueCarouselData();
  window.PRINTIT_CATALOGUE_CAROUSEL_HREFS = hrefs;
  if (!sources.length) {
    setCarouselImages([CATALOGUE_SHOWCASE_IMAGE], 0);
    updateShowcaseImage(CATALOGUE_SHOWCASE_IMAGE, 'Catálogo Completo');
    renderCarouselDots(1);
    updateDots();
    return;
  }
  setCarouselImages(sources, 0);
  const label0 = (rows[0] && rows[0].dataset && rows[0].dataset.label) || 'Print It';
  updateShowcaseImage(sources[0], label0);
  renderCarouselDots(sources.length);
  updateDots();
}

// ===== CATALOGUE LIST INTERACTION =====
function selectCatalogueItem(item) {
  // Remove active from all
  document.querySelectorAll('.catalogue-item').forEach(el => el.classList.remove('active'));

  // Set active
  item.classList.add('active');

  const label = item.dataset.label;
  const href = productHrefFromCatalogueRow(item);
  let src = '';
  if (href && PRINTIT_CATALOGUE_GALLERY_FIRST_PREVIEW[href]) {
    src = PRINTIT_CATALOGUE_GALLERY_FIRST_PREVIEW[href];
  } else {
    src = item.dataset.img || '';
  }

  const pc = document.getElementById('page-catalogue');
  const hrefs = window.PRINTIT_CATALOGUE_CAROUSEL_HREFS;
  if (pc && pc.classList.contains('active') && Array.isArray(hrefs) && hrefs.length && href) {
    const idx = hrefs.indexOf(href);
    if (idx >= 0) {
      currentImageIndex = idx;
      updateShowcaseImage(carouselImages[idx] || src, label);
      updateDots();
      return;
    }
  }

  updateShowcaseImage(src, label);
}

// ===== MINI CARD CLICK =====
function showCategoryImage(src, label) {
  updateShowcaseImage(src, label);
}

/** Home mini-cards: ir al catálogo filtrado y sincronizar imagen + pastillas */
function filterCategoryKeyToHashAnchor(category) {
  const map = {
    lluminaries: 'luminarias',
    lightbox: 'lightbox',
    totems: 'totems',
    aeris: 'aereos',
    vesteix: 'revestimientos',
    rigids: 'rigidos'
  };
  return map[category] || 'catalogue';
}

function openCatalogueCategory(category, imgSrc, label, event) {
  if (event) event.preventDefault();
  showPage('catalogue', null);
  const pill = document.querySelector(`.filter-pill[data-filter="${category}"]`);
  if (pill) filterCatalogue(category, pill);
  else applyCatalogueShowcaseCarousel();
  if (imgSrc && carouselImages.length) {
    let idx = carouselImages.indexOf(imgSrc);
    if (idx < 0) idx = 0;
    currentImageIndex = idx;
    updateShowcaseImage(carouselImages[idx], label);
    updateDots();
  }
  const slug = filterCategoryKeyToHashAnchor(category);
  const path = `${window.location.pathname}${window.location.search}`;
  history.replaceState(null, '', `${path}#${slug}`);
}

// ===== PRODUCT DETAIL =====
function showProductDetail(event) {
  if (event) event.preventDefault();
  window.PRINTIT_PRODUCT_CONTEXT = { ...DEFAULT_PRODUCT_CONTEXT };
  showPage('product');
}

function openEmbeddedProduct(category, subcategory, event) {
  if (event) event.preventDefault();
  window.PRINTIT_PRODUCT_CONTEXT = {
    category: category || DEFAULT_PRODUCT_CONTEXT.category,
    subcategory: subcategory || DEFAULT_PRODUCT_CONTEXT.subcategory
  };
  showPage('product');
}

function goToCatalogueAll(event) {
  if (event) event.preventDefault();
  showPage('catalogue', null);
  const allPill = document.querySelector('.filter-pill[data-filter="all"]');
  if (allPill) filterCatalogue('all', allPill);
  else applyCatalogueShowcaseCarousel();
}

// ===== FILTER BY TAG (Home page links) =====
function filterByTag(tag, event) {
  if (event) event.preventDefault();
  goToCatalogueAll(null);
}

// ===== CATALOGUE FILTER =====
function filterCatalogue(category, btn) {
  // Update active pill
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  const items = document.querySelectorAll('.catalogue-item, .catalogue-section-header');
  const simpleItems = document.querySelectorAll('.catalogue-item-simple');
  const detailedItems = document.querySelectorAll('.catalogue-item-detailed');

  if (category === 'all') {
    items.forEach(el => el.classList.remove('hidden'));
    detailedItems.forEach(el => el.classList.add('hidden'));
    simpleItems.forEach(el => el.classList.remove('hidden'));
  } else {
    items.forEach(el => {
      const elCategory = el.dataset.category;
      if (elCategory === category) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    simpleItems.forEach(el => el.classList.add('hidden'));
    detailedItems.forEach(el => {
      if (el.dataset.category === category) {
        el.classList.remove('hidden');
      }
    });
  }

  const pc = document.getElementById('page-catalogue');
  if (pc && pc.classList.contains('active')) {
    applyCatalogueShowcaseCarousel();
  }
}

// ===== PROFILE VARIANT SELECTION =====
function selectVariant(profile, _el) {
  document.querySelectorAll('.variant-card').forEach(card => {
    card.classList.remove('active');
    const badge = card.querySelector('.variant-badge');
    if (badge) badge.remove();
  });

  document.querySelectorAll('.sheet-profile-card').forEach(card => card.classList.remove('active'));

  document.querySelectorAll(`[data-profile="${profile}"]`).forEach(card => {
    card.classList.add('active');
    if (card.classList.contains('variant-card')) {
      card.insertAdjacentHTML('beforeend', '<div class="variant-badge">Actual</div>');
    }
  });

  const schematicImg = document.getElementById('schematic-main-image');
  if (schematicImg) {
    schematicImg.src =
      PROFILE_IMAGE_OVERRIDES[profile] ||
      `Material Inicial/OPCIONES-DE-PERFILERIA/${profile}.png`;
    schematicImg.alt = `Vista técnica — ${profile}`;
  }
}

// ===== TEMA CLARO / OSCURO =====
const THEME_STORAGE_KEY = 'printit-theme';
const NAV_LOGO_DARK_MODE_SRC = 'Material Inicial/logo-oficial.png';
const NAV_LOGO_LIGHT_MODE_SRC = 'Material Inicial/Logo Dark.jpeg';

function applyTheme(theme) {
  const isLight = theme === 'light';
  if (isLight) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  document.querySelectorAll('.nav-theme-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
    );
  });

  document.querySelectorAll('.nav-logo').forEach(img => {
    img.src = isLight ? NAV_LOGO_LIGHT_MODE_SRC : NAV_LOGO_DARK_MODE_SRC;
  });
}

function toggleTheme() {
  const next =
    document.documentElement.getAttribute('data-theme') === 'light'
      ? 'dark'
      : 'light';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch (_) {}
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (_) {}
  applyTheme(saved === 'light' ? 'light' : 'dark');
}

function initBeforeAfterComparators() {
  document.querySelectorAll('.ba-compare').forEach(root => {
    const initial = parseInt(root.dataset.baInitial || '50', 10);
    const range = root.querySelector('.ba-range');
    if (!range) return;
    range.value = String(Math.min(100, Math.max(0, initial)));

    const apply = () => {
      const v = Number(range.value);
      root.style.setProperty('--ba-pos', `${v}%`);
      range.setAttribute('aria-valuenow', String(v));
    };
    apply();
    range.addEventListener('input', apply);
    range.addEventListener('change', apply);
  });
}

function initSoftLoopVideos(scope = document) {
  scope.querySelectorAll('video[data-soft-loops]').forEach(video => {
    if (video.dataset.softLoopBound === '1') return;
    video.dataset.softLoopBound = '1';
    video.removeAttribute('loop');
    video.dataset.loopCompleted = '0';

    video.addEventListener('ended', () => {
      const maxLoops = Math.max(1, parseInt(video.dataset.softLoops || '2', 10));
      const completed = parseInt(video.dataset.loopCompleted || '0', 10) + 1;
      video.dataset.loopCompleted = String(completed);

      if (completed >= maxLoops) {
        return;
      }

      video.classList.add('is-fading');
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => { });
        video.classList.remove('is-fading');
      }, 180);
    });
  });
}

const PRINTIT_LOG_MAX = 200;
let printitLogLines = [];

/** Texto para volcar a LOGS/errors.log (prioriza ERROR y WARN). */
function buildPrintitLogExportText() {
  const urlLine = `# URL: ${location.href}`;
  const tsLine = `# Export: ${new Date().toISOString()}`;
  const header = `${urlLine}\n${tsLine}\n\n`;
  const errOrWarn = printitLogLines.filter(l => /\] (ERROR|WARN) \|/.test(l));
  if (errOrWarn.length) {
    return header + errOrWarn.join('\n') + '\n';
  }
  return (
    header +
    '# (Sin ERROR/WARN en esta sesión — registro completo.)\n\n' +
    printitLogLines.join('\n') +
    '\n'
  );
}

function downloadPrintitLogFile() {
  const text = buildPrintitLogExportText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `errors-${stamp}.log`;
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
  printitLog('INFO', 'Exportación .log', `Descargado ${filename} — puedes renombrar/sustituir LOGS/errors.log`);
}
const DEFAULT_PRODUCT_CONTEXT = {
  category: 'LUMINARIAS',
  subcategory: 'On / Off'
};

function printitLog(level, message, detail) {
  const ts = new Date().toISOString();
  const extra = detail != null && detail !== '' ? ` | ${String(detail)}` : '';
  const line = `[${ts}] ${level} | ${message}${extra}`;
  printitLogLines.push(line);
  if (printitLogLines.length > PRINTIT_LOG_MAX) printitLogLines.shift();
  const el = document.getElementById('printit-log-output');
  if (el) el.textContent = printitLogLines.join('\n');
}

function initPrintitDiagnostics() {
  const out = document.getElementById('printit-log-output');
  const toggle = document.getElementById('printit-log-toggle');
  const drawer = document.getElementById('printit-log-drawer');
  const clearBtn = document.getElementById('printit-log-clear');
  const copyBtn = document.getElementById('printit-log-copy');
  if (!out || !toggle || !drawer) return;

  printitLog('INFO', 'Carga de página', `${location.protocol}//${location.host}${location.pathname}`);

  if (location.protocol === 'file:') {
    printitLog(
      'ERROR',
      'Protocolo file://',
      'Usa un servidor HTTP (ej. python3 -m http.server 5500) y abre http://localhost:5500/'
    );
  }

  printitLog('INFO', 'navigator.onLine', String(navigator.onLine));

  window.addEventListener('online', () => printitLog('INFO', 'Red: online', 'true'));
  window.addEventListener('offline', () => printitLog('WARN', 'Red: offline', 'El navegador reporta sin conexión'));

  window.addEventListener('error', ev => {
    const src = ev.filename ? `${ev.filename}:${ev.lineno}` : '';
    printitLog('ERROR', ev.message || 'window.error', src);
  });

  window.addEventListener('unhandledrejection', ev => {
    const r = ev.reason;
    printitLog('ERROR', 'Promise no manejada', r && (r.message || String(r)));
  });

  document.addEventListener(
    'error',
    ev => {
      const t = ev.target;
      if (!t || t === document || t === window) return;
      const tag = t.tagName;
      if (tag === 'IMG' || tag === 'VIDEO' || tag === 'SOURCE' || tag === 'SCRIPT' || tag === 'LINK') {
        const src = t.currentSrc || t.src || t.href || '';
        printitLog('ERROR', `Recurso no cargado (${tag})`, src);
      }
    },
    true
  );

  if (location.protocol === 'http:' || location.protocol === 'https:') {
    fetch(location.href, { method: 'HEAD', cache: 'no-store' })
      .then(r => printitLog('INFO', 'HTTP mismo origen', `${r.status} ${r.statusText}`))
      .catch(e => printitLog('ERROR', 'HTTP mismo origen falló', e.message || String(e)));
  }

  toggle.addEventListener('click', () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      printitLogLines = [];
      out.textContent = '';
      printitLog('INFO', 'Registro limpiado', '');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(out.textContent);
        printitLog('INFO', 'Copiado al portapapeles', '');
      } catch (e) {
        printitLog('WARN', 'Clipboard no disponible', e.message || String(e));
      }
    });
  }

  const actions = clearBtn && copyBtn && clearBtn.parentElement;
  if (actions && !document.getElementById('printit-log-export')) {
    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.id = 'printit-log-export';
    exportBtn.className = 'printit-log-btn';
    exportBtn.textContent = 'Exportar .log';
    exportBtn.title = 'Descarga ERROR/WARN (o sesión completa si no hay). Guarda como LOGS/errors.log en el proyecto.';
    actions.appendChild(exportBtn);
    exportBtn.addEventListener('click', () => {
      try {
        downloadPrintitLogFile();
      } catch (e) {
        printitLog('ERROR', 'Exportar .log falló', e.message || String(e));
      }
    });
  }
}

function applyProductContextFromPage() {
  const ctx = window.PRINTIT_PRODUCT_CONTEXT || DEFAULT_PRODUCT_CONTEXT;
  const titleEl = document.querySelector('#page-product .product-struct-title');
  const leadEl = document.querySelector('#page-product .product-struct-lead');
  const crumbEl = document.querySelector('#page-product .product-breadcrumb-item[aria-current="page"]');
  const labelEl = document.getElementById('selected-label');
  if (titleEl) titleEl.textContent = ctx.category;
  if (leadEl) leadEl.textContent = ctx.subcategory;
  if (crumbEl) crumbEl.textContent = `${ctx.category} - ${ctx.subcategory}`;
  if (labelEl) labelEl.textContent = FIXED_SHOWCASE_LABEL;
}

function initProductPageLinkNavigation() {
  document.addEventListener('click', (e) => {
    const productLink = e.target.closest('a[href^="product-"]');
    if (!productLink) return;
    const href = productLink.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    e.stopPropagation();
    window.location.href = href;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const showcaseImg = document.getElementById('showcase-img');
  if (showcaseImg) {
    let initial = showcaseImg.getAttribute('src') || '';
    if (!initial && showcaseImg.tagName === 'VIDEO') {
      const firstSource = showcaseImg.querySelector('source[src]');
      initial =
        (firstSource && firstSource.getAttribute('src')) ||
        showcaseImg.currentSrc ||
        '';
    }
    showcaseLastCleanSrc = initial.split('?')[0];
  }
  initTheme();
  initBeforeAfterComparators();
  initSoftLoopVideos();
  syncProductGalleryToShowcase();
  document.querySelectorAll('.nav-theme-toggle').forEach(btn => {
    btn.type = 'button';
    btn.addEventListener('click', toggleTheme);
  });

  const catalogueRoot = document.getElementById('catalogue-list');
  if (catalogueRoot) {
    // Mark non-simple catalogue rows as detailed for filter behavior.
    document.querySelectorAll('#catalogue-list .catalogue-item').forEach(item => {
      if (!item.classList.contains('catalogue-item-simple')) {
        item.classList.add('catalogue-item-detailed');
      }
    });

    const allPill = document.querySelector('.filter-pill[data-filter="all"]');
    if (allPill) filterCatalogue('all', allPill);

    // Product links inside catalogue rows should navigate directly.
    document.querySelectorAll('.catalogue-item-name a[href^="product-"]').forEach(link => {
      link.addEventListener('click', e => {
        e.stopPropagation();
      });
    });
  }

  const hasInitialHash = Boolean((window.location.hash || '').replace('#', ''));
  if (!hasInitialHash && document.getElementById('page-home')) {
    showPage('home', null);
  }

  applyHashRoute();
  applyProductContextFromPage();
  initProductPageLinkNavigation();

  initPrintitDiagnostics();
});

function applyHashRoute() {
  printitApplyingHashRoute = true;
  try {
    const hash = (window.location.hash || '').replace('#', '');
    if ((hash === 'catalogue' || hash === 'all') && document.getElementById('page-catalogue')) {
      goToCatalogueAll(null);
    } else if (hash === 'product' && document.getElementById('page-product')) {
      if (!window.PRINTIT_PRODUCT_CONTEXT) {
        window.PRINTIT_PRODUCT_CONTEXT = { ...DEFAULT_PRODUCT_CONTEXT };
      }
      showPage('product', null);
    } else if (hash === 'contact' && document.getElementById('page-contact')) {
      showPage('contact', null);
    } else if (document.getElementById('page-catalogue')) {
      const anchorToFilter = {
        luminarias: 'lluminaries',
        lightbox: 'lightbox',
        totems: 'totems',
        aereos: 'aeris',
        revestimientos: 'vesteix',
        rigidos: 'rigids'
      };
      const targetFilter = anchorToFilter[hash];
      if (targetFilter) {
        showPage('catalogue', null);
        const pill = document.querySelector(`.filter-pill[data-filter="${targetFilter}"]`);
        if (pill) filterCatalogue(targetFilter, pill);
        else applyCatalogueShowcaseCarousel();
        const section = document.getElementById(hash);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  } finally {
    printitApplyingHashRoute = false;
  }
}

window.addEventListener('hashchange', applyHashRoute);

// ===== SUBCAT PILLS =====
document.addEventListener('click', function (e) {
  if (e.target.closest('.subcat-pill')) {
    document.querySelectorAll('.subcat-pill').forEach(p => p.classList.remove('active'));
    e.target.closest('.subcat-pill').classList.add('active');
  }
});

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', e => {
  if (!document.getElementById('showcase-img')) return;
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});

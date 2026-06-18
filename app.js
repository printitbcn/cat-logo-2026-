/* ===== Print It — Catálogo Comercial JS (Dark Portfolio Style) ===== */

// ===== IMAGE CAROUSEL =====
const HOME_CAROUSEL_IMAGE = 'Material Inicial/PORTADA-PRINT-IT.png';
let carouselImages = [HOME_CAROUSEL_IMAGE];
const CATALOGUE_SHOWCASE_IMAGE =
  'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png';
const AERIS_SHOWCASE_IMAGE = 'assets/img/categories/cubos aereos .png';
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
  'product-banners-y-circulares.html': 'assets/img/categories/cubos aereos .png',
  'product-barniz-drop-gloss.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-barniz-semi-mate.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-con-luz.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-cubos.html': 'assets/img/categories/cubos%20aereos%20.png',
  'product-custom.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-dali-casambi.html': 'DALI : CASSAMBI /dali cassambi control .mp4',
  'product-dynamic-white.html': 'LED DYNAMICO/led dinamico solis .mp4',
  'product-pixel-led.html': 'LUMINARIAS CUSTOM /special project led dynamic .mp4',
  'product-forrado-columnas.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-forrado-paredes.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-frisos.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-impresion-uvi.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-lightbox-doble-cara.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-lightbox-pared.html': 'LIGHTBOX /lightbox a pared mercedes.mov',
  'product-luxpanel.html': 'assets/img/products/luxpanel-2.png',
  'product-on-off.html': 'ON-OFF/on off 4k action .mp4',
  'product-relieve-braille.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-relieve-cmyk.html':
    'totems :photocalls : backdrops /totems : backdrops : photocalls con luz .png',
  'product-rigidos.html': 'RI%CC%81GIDOS%20/ri%CC%81gidos%202.png',
  'product-sin-luz.html': 'totems :photocalls : backdrops /totem sin luz madera.png',
  'product-tunable-white.html': 'TUNABLE WHITE /TUNABLE EXTERIOR.png'
};

let showcaseLastCleanSrc = '';

const ONOFF_CORRECTED_MOV_POSTER = 'ON-OFF/cover on off.png';
const PROFILE_IMAGE_OVERRIDES = {
  P120: 'PERFILERIA /P120.png',
  P30: 'PERFILERIA /P30.png',
  P35: 'PERFILERIA /P35.png',
  P36: 'PERFILERIA /P36.png'
};

function updateShowcaseImage(src, label) {
  const labelEl = document.getElementById('selected-label');
  if (src == null || String(src).trim() === '') return;

  const cleanSrc = String(src).split('?')[0];
  const isGif = /\.gif$/i.test(cleanSrc);
  const isVideoSrc = /\.(mp4|webm|mov)$/i.test(cleanSrc);
  const isShowcaseContainCenter =
    /desmiembre\.mp4$/i.test(cleanSrc) ||
    /photocallls con luz\.mov$/i.test(cleanSrc);
  const isOnOffCorrectedClip = /ON OFF CORRECTED\.(mov|mp4)$/i.test(cleanSrc);

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
        mediaEl.poster = isOnOffCorrectedClip ? ONOFF_CORRECTED_MOV_POSTER : '';
        mediaEl.src = nextSrc;
        mediaEl.load();
        mediaEl.play().catch(() => { });
        bindPrintitVideoHoverControls(mediaEl);
        observePrintitVideoAutoplayWhenVisible(mediaEl);
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

  // Robust page-state hook for CSS (fallback for environments
  // where :has() selectors may not evaluate reliably).
  document.body.classList.toggle('is-contact-page', pageName === 'contact');
  const officeBanner = document.querySelector('.app-office-contact-banner');
  if (officeBanner) {
    officeBanner.classList.toggle('is-visible', pageName === 'contact');
  }

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
    initContactPageLayout();
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

  setTimeout(() => printitKickVisibleVideos(), 80);
}

function getProductFallbackShowcase() {
  const page = (window.location.pathname || '').split('/').pop() || '';
  if (page === 'product-dali-casambi.html') return DALI_SHOWCASE_VIDEO;
  if (page === 'product-pixel-led.html')
    return 'LUMINARIAS CUSTOM /special project led dynamic .mp4';
  return PRODUCT_SHOWCASE_IMAGE;
}

function initDaliCasambiUseCaseLightbox() {
  const page = (window.location.pathname || '').split('/').pop() || '';
  if (page !== 'product-dali-casambi.html') return;
  const lb = document.getElementById('dali-use-lightbox');
  const img = lb && lb.querySelector('.dali-use-lightbox-img');
  const btnClose = lb && lb.querySelector('.dali-use-lightbox-close');
  if (!lb || !img || !btnClose) return;

  function closeLb() {
    lb.hidden = true;
    img.removeAttribute('src');
    img.alt = '';
    document.body.style.overflow = '';
  }

  function openLb(src, alt) {
    img.src = src;
    img.alt = alt || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => btnClose.focus());
  }

  document.querySelectorAll('a.dali-use-link').forEach(link => {
    link.addEventListener('click', ev => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
      const href = link.getAttribute('href');
      if (!href) return;
      ev.preventDefault();
      openLb(href, link.getAttribute('aria-label') || '');
    });
  });

  lb.addEventListener('click', ev => {
    if (ev.target.closest('.dali-use-lightbox-close')) {
      closeLb();
      return;
    }
    if (ev.target === img) return;
    closeLb();
  });

  document.addEventListener('keydown', ev => {
    if (lb.hidden) return;
    if (ev.key === 'Escape') closeLb();
  });
}

function getProductGalleryItemNodes() {
  const sheetItems = document.querySelectorAll(
    '#page-product .sheet-media-gallery .product-gallery .gallery-item'
  );
  if (sheetItems.length) return sheetItems;
  return document.querySelectorAll('#page-product .product-detail-card .product-gallery .gallery-item');
}

function getProductGallerySources() {
  const items = getProductGalleryItemNodes();
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
  const galleryItems = getProductGalleryItemNodes();
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
  if (category === 'aeris') {
    setCarouselImages([AERIS_SHOWCASE_IMAGE], 0);
    currentImageIndex = 0;
    updateShowcaseImage(AERIS_SHOWCASE_IMAGE, label || 'Aeris');
    renderCarouselDots(1);
    updateDots();
    const slug = filterCategoryKeyToHashAnchor(category);
    const path = `${window.location.pathname}${window.location.search}`;
    history.replaceState(null, '', `${path}#${slug}`);
    return;
  }
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
    if (category === 'aeris') {
      setCarouselImages([AERIS_SHOWCASE_IMAGE], 0);
      currentImageIndex = 0;
      updateShowcaseImage(AERIS_SHOWCASE_IMAGE, 'Aeris');
      renderCarouselDots(1);
      updateDots();
    }
  }
}

function initFilterPillIcons() {
  const iconByFilter = {
    all: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v2.5A2.75 2.75 0 0 1 16.25 11h-8.5A2.75 2.75 0 0 1 5 8.25v-2.5Zm0 10A2.75 2.75 0 0 1 7.75 13h8.5A2.75 2.75 0 0 1 19 15.75v2.5A2.75 2.75 0 0 1 16.25 21h-8.5A2.75 2.75 0 0 1 5 18.25v-2.5Z"/></svg>',
    lluminaries: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 18.6h5.6v1.4a1 1 0 0 1-1 1h-3.6a1 1 0 0 1-1-1v-1.4Zm1.3-2.1h3v1.1h-3v-1.1Zm-1.3-1.2v-.2c0-1.6-.8-2.4-1.8-3.5A5.5 5.5 0 1 1 16.6 11c-1 1.1-1.8 1.9-1.8 3.5v.8H9.2v-.1Zm1.2-1.1h3.2c.2-1.6 1.2-2.6 2-3.4a4.3 4.3 0 1 0-6.9 0c.8.8 1.8 1.8 2 3.4Z"/></svg>',
    lightbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.8A2.8 2.8 0 0 1 6.8 3h10.4A2.8 2.8 0 0 1 20 5.8v12.4a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 18.2V5.8Zm1.5 0v12.4c0 .7.6 1.3 1.3 1.3h10.4c.7 0 1.3-.6 1.3-1.3V5.8c0-.7-.6-1.3-1.3-1.3H6.8c-.7 0-1.3.6-1.3 1.3Zm2.1 1.6h8.8v9.2H7.6V7.4Zm1.5 1.5V15h5.8V8.9H9.1Z"/></svg>',
    totems: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3.8A2.8 2.8 0 0 1 12.8 1h.4A2.8 2.8 0 0 1 16 3.8V5h1a1 1 0 0 1 1 1v10.2a2.8 2.8 0 0 1-2.8 2.8h-4.4A2.8 2.8 0 0 1 8 16.2V6a1 1 0 0 1 1-1h1V3.8Zm1.5 1.2h3V3.8c0-.7-.6-1.3-1.3-1.3h-.4c-.7 0-1.3.6-1.3 1.3V5Zm-2 1.5v9.7c0 .7.6 1.3 1.3 1.3h4.4c.7 0 1.3-.6 1.3-1.3V6.5H9.5Zm-1 14h8a.8.8 0 0 1 0 1.5h-8a.8.8 0 0 1 0-1.5Z"/></svg>',
    aeris: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2a2.1 2.1 0 0 1 2.1 2.1v2.2h2.1a2.8 2.8 0 0 1 2.8 2.8V14a2.8 2.8 0 0 1-2.8 2.8H7.8A2.8 2.8 0 0 1 5 14V9.3a2.8 2.8 0 0 1 2.8-2.8h2.1V4.3A2.1 2.1 0 0 1 12 2.2Zm0 1.5a.6.6 0 0 0-.6.6v2.2h1.2V4.3a.6.6 0 0 0-.6-.6Zm-4.2 4.3c-.7 0-1.3.6-1.3 1.3V14c0 .7.6 1.3 1.3 1.3h8.4c.7 0 1.3-.6 1.3-1.3V9.3c0-.7-.6-1.3-1.3-1.3H7.8Z"/></svg>',
    vesteix: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.6A2.6 2.6 0 0 1 5.6 3h12.8A2.6 2.6 0 0 1 21 5.6v12.8a2.6 2.6 0 0 1-2.6 2.6H5.6A2.6 2.6 0 0 1 3 18.4V5.6Zm1.5 0v12.8c0 .6.5 1.1 1.1 1.1h12.8c.6 0 1.1-.5 1.1-1.1V5.6c0-.6-.5-1.1-1.1-1.1H5.6c-.6 0-1.1.5-1.1 1.1Zm3.2 2.2h8.6a.8.8 0 0 1 0 1.5H7.7a.8.8 0 1 1 0-1.5Zm0 3.4h8.6a.8.8 0 0 1 0 1.5H7.7a.8.8 0 1 1 0-1.5Zm0 3.4h5.2a.8.8 0 0 1 0 1.5H7.7a.8.8 0 0 1 0-1.5Z"/></svg>',
    rigids: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.3 5.3A2.3 2.3 0 0 1 6.6 3h10.8a2.3 2.3 0 0 1 2.3 2.3v13.4a2.3 2.3 0 0 1-2.3 2.3H6.6a2.3 2.3 0 0 1-2.3-2.3V5.3Zm1.5 0v13.4c0 .4.4.8.8.8h10.8c.4 0 .8-.4.8-.8V5.3c0-.4-.4-.8-.8-.8H6.6c-.4 0-.8.4-.8.8Zm2.4 2.2h7.6a.8.8 0 0 1 .8.8v7.4a.8.8 0 0 1-.8.8H8.2a.8.8 0 0 1-.8-.8V8.3a.8.8 0 0 1 .8-.8Zm.7 1.5V15h6.1V9H8.9Z"/></svg>'
  };

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    if (pill.dataset.iconReady === '1') return;
    const filter = (pill.dataset.filter || '').trim();
    const iconMarkup = iconByFilter[filter] || iconByFilter.all;
    const label = (pill.textContent || '').trim();
    pill.innerHTML = `
      <span class="filter-pill-icon" aria-hidden="true">${iconMarkup}</span>
      <span class="filter-pill-label">${label}</span>
    `;
    pill.dataset.iconReady = '1';
  });
}

// ===== PROFILE VARIANT SELECTION =====
function selectVariant(profile, _el) {
  document.querySelectorAll('.variant-card').forEach(card => {
    card.classList.remove('active');
    const badge = card.querySelector('.variant-badge');
    if (badge) badge.remove();
  });

  const profileCol =
    _el && _el.closest && _el.closest('.product-profile-col--frontal, .product-profile-col--backlight');
  if (profileCol) {
    profileCol.querySelectorAll('.sheet-profile-card').forEach(card => card.classList.remove('active'));
  } else {
    document.querySelectorAll('.sheet-profile-card').forEach(card => card.classList.remove('active'));
  }

  document.querySelectorAll(`[data-profile="${profile}"]`).forEach(card => {
    card.classList.add('active');
    if (card.classList.contains('variant-card')) {
      card.insertAdjacentHTML('beforeend', '<div class="variant-badge">Actual</div>');
    }
  });

  let schematicImg = document.getElementById('schematic-main-image');
  if (profileCol && profileCol.classList.contains('product-profile-col--frontal')) {
    schematicImg = profileCol.querySelector('.product-schematic-frontal img');
  } else if (profileCol && profileCol.classList.contains('product-profile-col--backlight')) {
    schematicImg = document.getElementById('schematic-main-image');
  }
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

  document.querySelectorAll('img[data-logo-light][data-logo-dark]').forEach(img => {
    const lightSrc = (img.getAttribute('data-logo-light') || '').trim();
    const darkSrc = (img.getAttribute('data-logo-dark') || '').trim();
    if (!lightSrc || !darkSrc) return;
    img.src = isLight ? lightSrc : darkSrc;
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

/** Escritorio: barra nativa solo al pasar el ratón; táctil: controles siempre. */
function printitPreferHoverOnlyVideoControls() {
  try {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  } catch (_) {
    return false;
  }
}

function printitVideoHoverHost(video) {
  return (
    video.closest('.gallery-item') ||
    video.closest('.product-video-wrap') ||
    video.closest('.custom-made-spot') ||
    video.closest('.custom-made-video-box') ||
    video.closest('.dali-decision-video-wrap') ||
    video.closest('#image-showcase') ||
    video.parentElement
  );
}

let printitVideoIo = null;

function bindPrintitVideoHoverControls(video) {
  if (!video || video.tagName !== 'VIDEO' || video.dataset.printitHoverCtl === '1') return;
  video.dataset.printitHoverCtl = '1';

  if (!printitPreferHoverOnlyVideoControls()) {
    if (!video.hasAttribute('controls')) video.controls = true;
    return;
  }

  video.removeAttribute('controls');
  video.controls = false;
  const host = printitVideoHoverHost(video);
  if (!host) return;

  const show = () => {
    video.controls = true;
  };
  const hide = () => {
    video.controls = false;
  };

  host.addEventListener('mouseenter', show);
  host.addEventListener('mouseleave', ev => {
    if (!host.contains(ev.relatedTarget)) hide();
  });
}

function observePrintitVideoAutoplayWhenVisible(video) {
  if (!video || video.tagName !== 'VIDEO' || video.dataset.printitAutoIo === '1') return;
  video.dataset.printitAutoIo = '1';

  if (!('IntersectionObserver' in window)) {
    video.play().catch(() => {});
    return;
  }

  if (!printitVideoIo) {
    printitVideoIo = new IntersectionObserver(
      entries => {
        entries.forEach(ent => {
          const v = ent.target;
          if (!(v instanceof HTMLVideoElement)) return;
          const ratio = ent.intersectionRatio;
          if (ent.isIntersecting && ratio >= 0.12) {
            v.play().catch(() => {});
          } else if (!ent.isIntersecting || ratio < 0.05) {
            v.pause();
          }
        });
      },
      { threshold: [0, 0.05, 0.12, 0.25] }
    );
  }
  printitVideoIo.observe(video);
}

function refreshPrintitVideoBindings(scope = document) {
  scope.querySelectorAll('video').forEach(v => {
    bindPrintitVideoHoverControls(v);
    observePrintitVideoAutoplayWhenVisible(v);
  });
}

/** Tras cambiar de vista (p. ej. display de .page), forzar play en vídeos ya visibles. */
function printitKickVisibleVideos() {
  document.querySelectorAll('video').forEach(v => {
    const r = v.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const st = window.getComputedStyle(v);
    if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) === 0) return;
    const inView = r.top < window.innerHeight && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
    if (inView) v.play().catch(() => {});
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
  if (crumbEl) {
    const bc =
      typeof ctx.breadcrumb === 'string' && ctx.breadcrumb.trim()
        ? ctx.breadcrumb.trim()
        : `${ctx.category} - ${ctx.subcategory}`;
    crumbEl.textContent = bc;
  }
  if (labelEl) labelEl.textContent = FIXED_SHOWCASE_LABEL;
}

const CONTACT_PERSON_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6"/></svg>`;

const CONTACT_WEB_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 3.2 4 6.6 4 9s-1.4 5.8-4 9"/><path d="M12 3c-2.6 3.2-4 6.6-4 9s1.4 5.8 4 9"/></svg>`;

function initContactCardIcons(contactPage) {
  contactPage.querySelectorAll('.contact-team-grid .profile-card').forEach((card) => {
    if (card.querySelector('.contact-card-icon')) return;
    const icon = document.createElement('span');
    icon.className = 'contact-card-icon';
    icon.innerHTML = CONTACT_PERSON_ICON;
    card.insertBefore(icon, card.firstChild);
  });
}

function moveContactWebLinkToBar(contactPage) {
  if (contactPage.querySelector('.contact-web-bar')) return;

  const grid = contactPage.querySelector('.contact-team-grid');
  if (!grid) return;

  const existingWeb = contactPage.querySelector(
    '.contact-team-grid .social-link[href*="printitbcn.com"]:not([href^="mailto"])'
  );

  const bar = document.createElement('div');
  bar.className = 'contact-web-bar animate-in';

  const iconWrap = document.createElement('span');
  iconWrap.className = 'contact-web-bar-icon';
  iconWrap.setAttribute('aria-hidden', 'true');
  iconWrap.innerHTML = CONTACT_WEB_ICON;
  bar.appendChild(iconWrap);

  if (existingWeb) {
    const webLink = existingWeb.cloneNode(true);
    bar.appendChild(webLink);
    contactPage
      .querySelectorAll('.contact-team-grid .social-link[href*="printitbcn.com"]:not([href^="mailto"])')
      .forEach((link) => link.remove());
  } else {
    const webLink = document.createElement('a');
    webLink.href = 'https://www.printitbcn.com';
    webLink.className = 'social-link';
    webLink.target = '_blank';
    webLink.rel = 'noopener noreferrer';
    webLink.innerHTML = '<span>Web: www.printitbcn.com</span>';
    bar.appendChild(webLink);
  }

  grid.insertAdjacentElement('afterend', bar);
}

function splitContactSocialLinkLabels(scope = document) {
  const selectors = [
    '#page-contact .social-link',
    '#page-contact .contact-web-bar .social-link',
    '.app-office-contact-banner .social-link',
  ];

  selectors.forEach((selector) => {
    scope.querySelectorAll(selector).forEach((link) => {
      const span = link.querySelector('span:first-child');
      if (!span || span.classList.contains('contact-link-label')) return;

      const text = (span.textContent || '').trim();
      const match = text.match(/^([^:]+):\s*(.+)$/);
      if (!match) return;

      const label = document.createElement('span');
      label.className = 'contact-link-label';
      label.textContent = match[1].trim();

      const value = document.createElement('span');
      value.className = 'contact-link-value';
      value.textContent = match[2].trim();

      span.replaceWith(label, value);
    });
  });
}

function initContactPageLayout() {
  const contactPage = document.getElementById('page-contact');
  if (!contactPage) return;

  contactPage.classList.add('contact-page--architect');

  const nav = contactPage.querySelector('.top-nav');
  const cards = [...contactPage.querySelectorAll('.profile-card.animate-in')];
  const footer = contactPage.querySelector('.footer-bar');

  if (nav && !contactPage.querySelector('.contact-intro')) {
    const intro = document.createElement('header');
    intro.className = 'contact-intro animate-in';
    intro.innerHTML = `
      <p class="contact-intro-eyebrow">Print It · Barcelona</p>
      <h1 class="contact-intro-title">Contacto</h1>
      <p class="contact-intro-lead">Hablemos de tu proyecto.</p>
    `;
    nav.insertAdjacentElement('afterend', intro);
  }

  if (cards.length && !contactPage.querySelector('.contact-team-grid')) {
    const grid = document.createElement('div');
    grid.className = 'contact-team-grid';
    cards.forEach((card) => grid.appendChild(card));
    if (footer) contactPage.insertBefore(grid, footer);
    else contactPage.appendChild(grid);
  }

  moveContactWebLinkToBar(contactPage);
  initContactCardIcons(contactPage);
  splitContactSocialLinkLabels(contactPage);
}

function initWhatsAppLinks(scope = document) {
  const mobileLinks = scope.querySelectorAll('.social-link[href^="tel:"]');
  mobileLinks.forEach((link) => {
    const text = (link.textContent || '').toLowerCase();
    if (!text.includes('móvil') && !text.includes('movil')) return;
    if (link.dataset.waBound === '1') return;

    const rawTel = link.getAttribute('href') || '';
    const phone = rawTel.replace('tel:', '').replace(/[^\d+]/g, '');
    if (!phone) return;

    const wa = document.createElement('a');
    wa.className = 'social-link social-link-whatsapp';
    // Official WhatsApp deep-link with broad desktop/mobile support.
    wa.href = `https://api.whatsapp.com/send?phone=${phone.replace('+', '')}`;
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', `Abrir chat de WhatsApp con ${phone}`);
    wa.innerHTML = `
      <span>WhatsApp: ${phone}</span>
      <span class="link-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.21c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.19-.44-2.26-1.42-.84-.75-1.4-1.67-1.57-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.54c-.19 0-.49.07-.75.35-.26.28-.98.95-.98 2.31s1 2.67 1.14 2.86c.14.19 1.95 2.98 4.72 4.18.66.28 1.17.45 1.57.57.66.21 1.26.18 1.73.11.53-.08 1.67-.68 1.9-1.33.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.54-.33z"></path>
          <path d="M16.01 3.2c-7.08 0-12.8 5.72-12.8 12.79 0 2.25.59 4.45 1.71 6.39L3 29l6.78-1.78a12.8 12.8 0 0 0 6.23 1.6h.01c7.07 0 12.79-5.72 12.79-12.8 0-3.43-1.34-6.66-3.77-9.08A12.73 12.73 0 0 0 16.01 3.2zm0 23.45h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.62 10.62 0 0 1-1.64-5.66c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.52 1.11 7.53 3.11 2.01 2 3.11 4.68 3.11 7.52 0 5.87-4.77 10.64-10.64 10.64z"></path>
        </svg>
      </span>
    `;

    link.insertAdjacentElement('afterend', wa);
    link.dataset.waBound = '1';
  });
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
  initFilterPillIcons();
  initBeforeAfterComparators();
  initSoftLoopVideos();
  refreshPrintitVideoBindings();
  requestAnimationFrame(() => printitKickVisibleVideos());
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
  initContactPageLayout();
  initWhatsAppLinks();
  splitContactSocialLinkLabels();
  initDaliCasambiUseCaseLightbox();

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

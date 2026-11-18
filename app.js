/* ===== Print It — Catálogo Comercial JS (Dark Portfolio Style) ===== */

/* file:// breaks catalogue navigation / media — force http local server */
(function printitGuardFileProtocol() {
  try {
    if (typeof location === 'undefined' || location.protocol !== 'file:') return;
    const msg =
      'Abre el catálogo con el servidor local (http), no como archivo file://.\n\nhttp://127.0.0.1:8080/\nhttp://192.168.1.12:8080/';
    try {
      console.error('[Print It]', msg);
    } catch (_) {}
    const paint = () => {
      try {
        if (document.getElementById('printit-file-protocol-banner')) return;
        const b = document.createElement('div');
        b.id = 'printit-file-protocol-banner';
        b.setAttribute('role', 'alert');
        b.style.cssText =
          'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px;background:#0a0a0a;color:#fff;font:600 15px/1.45 system-ui,sans-serif;text-align:center';
        b.innerHTML =
          '<div><p style="margin:0 0 12px">No se puede navegar en <code>file://</code>.</p><p style="margin:0 0 16px;font-weight:500;opacity:.85">Abre:</p><p style="margin:0"><a href="http://127.0.0.1:8080/" style="color:#fff">http://127.0.0.1:8080/</a></p><p style="margin:10px 0 0"><a href="http://192.168.1.12:8080/" style="color:#fff">http://192.168.1.12:8080/</a></p></div>';
        (document.body || document.documentElement).appendChild(b);
      } catch (_) {}
    };
    if (document.body) paint();
    else document.addEventListener('DOMContentLoaded', paint, { once: true });
  } catch (_) {}
})();

// ===== IMAGE CAROUSEL =====
const HOME_CAROUSEL_IMAGE = 'media/brand/portada-3-print-it.png';
let carouselImages = [HOME_CAROUSEL_IMAGE];
const CATALOGUE_SHOWCASE_IMAGE =
  'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png';
const AERIS_SHOWCASE_IMAGE = 'media/aplicaciones/aereos/exteirior-cubo.jpg';
const PRODUCT_SHOWCASE_IMAGE = 'media/brand/products/luminaria-p100.png';
const DALI_SHOWCASE_VIDEO = 'media/aplicaciones/luminarias/dimmer-def-def-def.mp4';
const CONTACT_SHOWCASE_IMAGE = 'media/brand/products/showroom-indu-2.jpg';
let currentImageIndex = 0;
const FIXED_SHOWCASE_LABEL = 'MAKE AN IMPRESSION';
/** Cache bust para imágenes/vídeos en móvil (Safari cachea agresivamente sin query). */
const PRINTIT_MEDIA_CACHE = '20261103frame4';
let catalogueCarouselTimer = null;
const CATALOGUE_CAROUSEL_MS = 4500;

function withPrintitMediaCache(url) {
  if (url == null) return url;
  const trimmed = String(url).trim();
  if (!trimmed || /^(data:|blob:|#)/i.test(trimmed)) return trimmed;
  const base = trimmed.split('?')[0];
  return `${base}?v=${PRINTIT_MEDIA_CACHE}`;
}

function bustPrintitImgSrc(img) {
  const src = img.getAttribute('src');
  if (src) img.src = withPrintitMediaCache(src);
}

function bustPrintitVideoSrc(video) {
  const poster = video.getAttribute('poster');
  if (poster) video.poster = withPrintitMediaCache(poster);
  const src = video.getAttribute('src');
  if (src) video.src = withPrintitMediaCache(src);
  video.querySelectorAll('source[src]').forEach((source) => {
    const sourceSrc = source.getAttribute('src');
    if (sourceSrc) source.src = withPrintitMediaCache(sourceSrc);
  });
  try {
    video.load();
  } catch (_) {}
}

function bustPrintitGalleryMediaCache() {
  const scope = document.getElementById('page-product');
  if (!scope) return;

  scope
    .querySelectorAll(
      '.sheet-media-gallery img[src], .ba-compare img[src], .product-embed-section img[src], .product-extra-footer img[src], .product-detail-card .product-gallery img[src]'
    )
    .forEach(bustPrintitImgSrc);

  scope
    .querySelectorAll(
      '.sheet-media-gallery video, .product-embed-section video, .product-extra-footer video, .product-detail-card .product-gallery video, .product-feature-video'
    )
    .forEach(bustPrintitVideoSrc);

  scope.querySelectorAll('.sheet-media-gallery object[data]').forEach((objectEl) => {
    const data = objectEl.getAttribute('data');
    if (data) objectEl.data = withPrintitMediaCache(data);
  });

  const showcaseImg = document.getElementById('showcase-img');
  if (showcaseImg) {
    if (showcaseImg.tagName === 'VIDEO') bustPrintitVideoSrc(showcaseImg);
    else bustPrintitImgSrc(showcaseImg);
  }
}

/**
 * Primera vista de la galería principal de cada ficha (imagen o poster del primer vídeo),
 * para el carrusel del panel izquierdo en la página «Aplicaciones».
 */
const PRINTIT_CATALOGUE_GALLERY_FIRST_PREVIEW = {
  'product-banners-y-circulares.html': 'media/aplicaciones/aereos/exteirior-cubo.jpg',
  'product-circulares-con-luz.html': 'media/aplicaciones/aereos/exteirior-cubo.jpg',
  'product-circulares-sin-luz.html': 'media/aplicaciones/aereos/exteirior-cubo.jpg',
  'product-barniz-drop-gloss.html':
    'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png',
  'product-barniz-semi-mate.html':
    'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png',
  'product-cubos.html': 'media/aplicaciones/aereos/exteirior-cubo.jpg',
  'product-custom.html': 'media/aplicaciones/luminarias/special-project-led-dynamic.mp4',
  'product-dali-casambi.html': 'media/aplicaciones/luminarias/dimmer-def-def-def.mp4',
  'product-dynamic-white.html': 'media/aplicaciones/luminarias/dinamico-tecnico-completo-def-9x16.mp4',
  'product-pixel-led.html': 'media/aplicaciones/luminarias/special-project-led-dynamic.mp4',
  'product-forrado-paredes.html':
    'media/aplicaciones/vestimos/voile-diferentes-placements-special.mp4',
  'product-voile.html':
    'media/aplicaciones/vestimos/voile-tecnico-def-def.mov',
  'product-frisos.html':
    'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png',
  'product-impresion-uvi.html':
    'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png',
  'product-lightbox-doble-cara.html': 'media/aplicaciones/lightbox/lightbox-completo-def.jpg',
  'product-lightbox-pared.html': 'media/aplicaciones/lightbox/exterior-p50-a-pared.jpg',
  'product-lightbox-pared-cortinas-led.html': 'media/aplicaciones/lightbox/lightbox-exterior.jpg',
  'product-luxpanel.html': 'media/aplicaciones/lightbox/lux-exterior-def.png',
  'product-on-off.html': 'media/aplicaciones/luminarias/on-off-4k-action.mp4',
  'product-relieve-braille.html':
    'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png',
  'product-relieve-cmyk.html':
    'media/aplicaciones/totems/totems-backdrops-photocalls-con-luz.png',
  'product-rigidos.html': 'media/aplicaciones/rigidos/rigidos-miniatura.jpg',
  'product-sin-luz.html': 'media/aplicaciones/totems/2.jpg',
  'product-tunable-white.html': 'media/aplicaciones/luminarias/tunable-action-def-916.mp4'
};

let showcaseLastCleanSrc = '';

const ONOFF_CORRECTED_MOV_POSTER = 'media/aplicaciones/luminarias/exterior-on-off-p100.png';
const PROFILE_IMAGE_OVERRIDES = {
  P120: 'media/perfiles/p120.png',
  P30: 'media/perfiles/p30.png',
  P35: 'media/perfiles/p35.png',
  P36: 'media/perfiles/p36.png'
};

function clearShowcaseMediaKeepBox() {
  const mediaEl = document.getElementById('showcase-img');
  if (!mediaEl) return;
  if (mediaEl.tagName === 'VIDEO') {
    try { mediaEl.pause(); } catch (_) {}
    mediaEl.removeAttribute('src');
    mediaEl.querySelectorAll('source').forEach((s) => s.remove());
    try { mediaEl.load(); } catch (_) {}
  } else {
    mediaEl.removeAttribute('src');
  }
  mediaEl.removeAttribute('poster');
  mediaEl.style.opacity = '1';
  mediaEl.style.transform = 'scale(1)';
}

function updateShowcaseImage(src, label) {
  const labelEl = document.getElementById('selected-label');
  if (src == null || String(src).trim() === '') return;
  if (String(src).trim() === '__printit_empty__') {
    clearShowcaseMediaKeepBox();
    if (labelEl) labelEl.textContent = label || FIXED_SHOWCASE_LABEL;
    showcaseLastCleanSrc = '';
    return;
  }

  const cleanSrc = String(src).split('?')[0];
  const isGif = /\.gif$/i.test(cleanSrc);
  const isVideoSrc = /\.(mp4|webm|mov)$/i.test(cleanSrc);
  const isShowcaseContainCenter =
    /vid1\.mp4$/i.test(cleanSrc) ||
    /photocallls con luz\.mov$/i.test(cleanSrc) ||
    /lightbox doble cara p120/i.test(cleanSrc) ||
    /totem chanel placements magico/i.test(cleanSrc) ||
    /360 TOTEM CHANEL/i.test(cleanSrc) ||
    /TECNICO TOTEM LUZ/i.test(cleanSrc) ||
    /DEF PLACEMENTS LIGHTBOX P120/i.test(cleanSrc) ||
    /frisos placements/i.test(cleanSrc) ||
    /CIRCULAR FERIA/i.test(cleanSrc) ||
    /PLACEMENT TOTEM SIN LUZ/i.test(cleanSrc) ||
    /luxpanel-placements-new/i.test(cleanSrc) ||
    /luxpanel-def-placements/i.test(cleanSrc) ||
    /LUXPANEL DEF PLACEMENTS/i.test(cleanSrc);
  const isShowcaseContainFit =
    /dinamico prueba 1\.mov$/i.test(cleanSrc) ||
    /dinamico tecnico completo def \.mov$/i.test(cleanSrc) ||
    /DINAMIC TECNICO COMPLETO?\.mov$/i.test(cleanSrc) ||
    /DINAMIC TECNICO COMPLETE\.mov$/i.test(cleanSrc) ||
    /dinamic white placements\. ?\.mp4$/i.test(cleanSrc) ||
    /dinamico \.mp4$/i.test(cleanSrc);
  const isOnOffCorrectedClip = /on off 4k action \.mp4$/i.test(cleanSrc);
  const isDalliCasambiEffectShowcase = /DALLI\s*-\s*CASSAMBI\s+EFFECT\.mp4$/i.test(cleanSrc);
  const isRigidosShowroomPortrait =
    /SHOWROOM\s+R[IÍ]GIDOS/i.test(cleanSrc) ||
    /vestimos espacio 2\.mp4$/i.test(cleanSrc);
  const isSvgShowcase = /\.svg$/i.test(cleanSrc);

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
    let nextSrc = withPrintitMediaCache(cleanSrc);
    if (isGif) {
      if (!isVideoEl) mediaEl.loading = 'eager';
      if (showcaseLastCleanSrc && showcaseLastCleanSrc !== cleanSrc) {
        nextSrc = `${nextSrc}&_=${Date.now()}`;
      }
    }
    showcaseLastCleanSrc = cleanSrc;
    mediaEl.classList.toggle('showcase-video--contain-center', isShowcaseContainCenter);
    mediaEl.classList.toggle('showcase-video--contain-fit', isShowcaseContainFit);
    mediaEl.classList.toggle(
      'showcase-video--portrait-9-16',
      isDalliCasambiEffectShowcase || isRigidosShowroomPortrait
    );
    mediaEl.classList.toggle('showcase-img--svg', isSvgShowcase && mediaEl.tagName !== 'VIDEO');
    if (isVideoEl) {
      if (isVideoSrc) {
        mediaEl.querySelectorAll('source').forEach(s => s.remove());
        mediaEl.poster = isOnOffCorrectedClip ? withPrintitMediaCache(ONOFF_CORRECTED_MOV_POSTER) : '';
        mediaEl.preload = (isDalliCasambiEffectShowcase || /CIRCULAR FERIA/i.test(cleanSrc)) ? 'auto' : 'metadata';
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

function isDedicatedProductPageUrl() {
  const path = window.location.pathname || '';
  const leaf = path.split('/').filter(Boolean).pop() || '';
  return /^product-[^/]+\.html$/i.test(leaf);
}

/** True when an <a href> can navigate without JS (not bare # / javascript:). */
function isNavigableAnchorHref(href) {
  const h = String(href || '').trim();
  if (!h || h === '#') return false;
  if (/^javascript:/i.test(h)) return false;
  return true;
}

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

  /* Dedicated product HTML: Inicio / Contacto leave to index. Catalogue stays
     in-page so filter pills keep working; Aplicaciones uses goToCatalogueAll(). */
  if (isDedicatedProductPageUrl()) {
    if (pageName === 'home') {
      navigateToProductUrl(indexHomeUrl());
      return;
    }
    if (pageName === 'contact') {
      navigateToProductUrl(indexContactUrl());
      return;
    }
  }

  const target = document.getElementById(`page-${pageName}`);
  if (!target) return;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target
  target.classList.add('active');
  document.documentElement.removeAttribute('data-initial-route');

  // Robust page-state hook for CSS (fallback for environments
  // where :has() selectors may not evaluate reliably).
  document.body.classList.toggle('is-contact-page', pageName === 'contact');
  document.body.classList.toggle('is-home-page', pageName === 'home');
  document.body.classList.toggle('is-product-page', pageName === 'product');
  document.body.classList.toggle(
    'has-catalogue-filter-nav',
    pageName === 'catalogue' || pageName === 'product'
  );
  const officeBanner = document.querySelector('.app-office-contact-banner');
  if (officeBanner) {
    officeBanner.classList.toggle('is-visible', pageName === 'contact');
  }

  // Scroll right panel to top
  const panelRight = document.getElementById('panel-right');
  if (panelRight) panelRight.scrollTop = 0;

  // Reset image based on page
  if (pageName === 'home') {
    stopCatalogueCarouselAutoplay();
    setCarouselImages([HOME_CAROUSEL_IMAGE], 0);
    updateShowcaseImage(HOME_CAROUSEL_IMAGE, 'Catálogo Comercial');
    currentImageIndex = 0;
    renderCarouselDots(1);
    updateDots();
  } else if (pageName === 'catalogue') {
    /* El carrusel del catálogo se actualiza en filterCatalogue(), goToCatalogueAll() y openCatalogueCategory(). */
  } else if (pageName === 'product') {
    stopCatalogueCarouselAutoplay();
    syncProductGalleryToShowcase();
    const fixedShowcase = String(window.PRINTIT_FIXED_SHOWCASE || '').trim();
    /* Si hay escaparate fijo (p. ej. Rígidos showroom), no lo pisa la galería. */
    if (!fixedShowcase) {
      const productSources = getProductGallerySources();
      if (productSources.length) {
        const page = (window.location.pathname || '').split('/').pop() || '';
        let startIndex = 0;
        if (page === 'product-dynamic-white.html' && productSources.length > 1) {
          startIndex = 1;
        }
        currentImageIndex = startIndex;
        updateShowcaseImage(productSources[startIndex], FIXED_SHOWCASE_LABEL);
        renderCarouselDots(productSources.length);
        updateDots();
      } else {
        updateShowcaseImage(getProductFallbackShowcase(), 'Luminaria ON / OFF');
        renderCarouselDots(1);
      }
    }
    applyProductContextFromPage();
    highlightProductFilterPill();
  } else if (pageName === 'contact') {
    stopCatalogueCarouselAutoplay();
    setCarouselImages([CONTACT_SHOWCASE_IMAGE], 0);
    updateShowcaseImage(CONTACT_SHOWCASE_IMAGE, 'Roberto Ferrero · Print It');
    renderCarouselDots(1);
    updateDots();
    initContactPageLayout();
  }

  if (!printitApplyingHashRoute) {
    replaceAppHashForPage(pageName);
  }

  repositionCatalogueFilterNav(pageName);

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
  const fixed = String(window.PRINTIT_FIXED_SHOWCASE || '').trim();
  if (fixed) return fixed;
  const page = (window.location.pathname || '').split('/').pop() || '';
  if (page === 'product-dali-casambi.html') return DALI_SHOWCASE_VIDEO;
  if (page === 'product-pixel-led.html')
    return 'media/aplicaciones/luminarias/special-project-led-dynamic.mp4';
  if (page === 'product-tunable-white.html')
    return 'media/aplicaciones/luminarias/tunable-action-def-916.mp4';
  if (page === 'product-rigidos.html')
    return 'media/aplicaciones/rigidos/showroom-rigidos-print-it.mov';
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

function initDaliCasambiSchemaShowcase() {
  const page = (window.location.pathname || '').split('/').pop() || '';
  if (page !== 'product-dali-casambi.html') return;
  const schemaBlock = document.querySelector('#page-product .product-extra-schema');
  const schemaImg = schemaBlock && schemaBlock.querySelector('img');
  if (!schemaBlock || !schemaImg || schemaBlock.dataset.showcaseBound === '1') return;
  schemaBlock.dataset.showcaseBound = '1';
  schemaBlock.setAttribute('tabindex', '0');
  schemaBlock.setAttribute('role', 'button');
  const previewLabel =
    schemaImg.getAttribute('alt') || 'Esquema DALI y Casambi';
  schemaBlock.setAttribute('aria-label', `${previewLabel} — ampliar en escaparate`);

  const activate = e => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (e.type === 'keydown') e.preventDefault();
    e.preventDefault();
    const src = (schemaImg.getAttribute('src') || schemaImg.src || '').split('?')[0];
    if (!src) return;
    updateShowcaseImage(src, FIXED_SHOWCASE_LABEL);
  };

  schemaBlock.addEventListener('click', activate);
  schemaBlock.addEventListener('keydown', activate);
}

function getProductGalleryItemNodes() {
  const sheetItems = document.querySelectorAll(
    '#page-product .sheet-media-gallery .product-gallery .gallery-item'
  );
  if (sheetItems.length) return sheetItems;
  return document.querySelectorAll('#page-product .product-detail-card .product-gallery .gallery-item');
}

/** All product galleries (header + sheet) — clicks from either must drive the showcase. */
function getAllProductGalleryItemNodes() {
  return document.querySelectorAll(
    '#page-product .product-detail-card .product-gallery .gallery-item, #page-product .sheet-media-gallery .product-gallery .gallery-item'
  );
}

function getGalleryMediaSrcFromItem(item) {
  if (!item) return '';
  const video = item.querySelector('video');
  if (video) {
    const sourceEl = video.querySelector('source[src]');
    const videoSrc = (sourceEl && sourceEl.getAttribute('src')) || video.getAttribute('src') || '';
    if (videoSrc) return videoSrc;
    const poster = video.getAttribute('poster');
    if (poster) return poster;
  }
  const objectEl = item.querySelector('object[data]');
  if (objectEl) {
    const data = (objectEl.getAttribute('data') || '').trim();
    if (data) return data;
  }
  const img = item.querySelector('img');
  if (img) {
    const src = (img.getAttribute('src') || img.src || '').trim();
    if (src) return src;
  }
  return '';
}

function getProductGallerySources() {
  const items = getProductGalleryItemNodes();
  const sources = [];
  items.forEach(item => {
    const src = getGalleryMediaSrcFromItem(item);
    if (src) sources.push(src);
  });
  return sources;
}

function syncProductGalleryToShowcase() {
  const galleryItems = getProductGalleryItemNodes();
  const fixedShowcase = String(window.PRINTIT_FIXED_SHOWCASE || '').trim();
  const sources = getProductGallerySources();
  if (!galleryItems.length && !fixedShowcase) return;
  if (!sources.length && !fixedShowcase) return;

  const page = (window.location.pathname || '').split('/').pop() || '';
  let startIndex = 0;
  if (page === 'product-dynamic-white.html' && sources.length > 1) {
    startIndex = 1;
  }

  /* Escaparate bloqueado (p. ej. Rígidos showroom): no lo sustituye la galería. */
  const carouselSources = fixedShowcase ? [fixedShowcase] : sources;
  const carouselStart = fixedShowcase ? 0 : startIndex;
  setCarouselImages(carouselSources, carouselStart);

  const productPage = document.getElementById('page-product');
  if (productPage && (productPage.classList.contains('active') || isDedicatedProductPageUrl())) {
    currentImageIndex = carouselStart;
    updateShowcaseImage(carouselSources[carouselStart], FIXED_SHOWCASE_LABEL);
    renderCarouselDots(carouselSources.length);
    updateDots();
  }

  if (fixedShowcase) return;

  const cleanKey = (src) => String(src || '').split('?')[0];

  getAllProductGalleryItemNodes().forEach((item) => {
    if (item.dataset.previewBound === '1') return;
    item.dataset.previewBound = '1';
    item.style.cursor = 'pointer';
    item.setAttribute('tabindex', '0');
    const previewLabel =
      item.querySelector('video, img, object')?.getAttribute('aria-label') || 'Ampliar en escaparate';
    item.setAttribute('aria-label', previewLabel);

    const activatePreview = (e) => {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      if (e.type === 'keydown') e.preventDefault();
      const targetSrc = getGalleryMediaSrcFromItem(item);
      if (!targetSrc) return;
      const idx = sources.findIndex((s) => cleanKey(s) === cleanKey(targetSrc));
      currentImageIndex = idx >= 0 ? idx : 0;
      updateShowcaseImage(targetSrc, 'MAKE AN IMPRESSION');
      updateDots();
    };

    item.addEventListener('click', activatePreview);
    item.addEventListener('keydown', activatePreview);
  });
}

function productHrefFromCatalogueRow(item) {
  const link = item.querySelector('a[href^="product-"][href$=".html"]');
  if (!link) return '';
  return (link.getAttribute('href') || '').trim();
}

function isCatalogueStillSrc(src) {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(String(src || '').split('?')[0]);
}

/** Left showcase in catalogue: product preview map first, then row data-img. */
function catalogueShowcaseSrcForHref(href, item) {
  const mapped = (PRINTIT_CATALOGUE_GALLERY_FIRST_PREVIEW[href] || '').trim();
  const dataImg = ((item && item.dataset && item.dataset.img) || '').trim();
  if (mapped) return mapped;
  return dataImg;
}

/** Re-entrancy guard so synthetic nav anchors do not loop through click binders. */
let printitNavigating = false;

function navigateToProductUrl(url) {
  let href = String(url || '').trim();
  if (!href || href === '#') return false;
  /* Ignore bare hash-only targets; allow path#hash (e.g. index.html#catalogue). */
  if (
    /^#/.test(href) &&
    !/^#(?:catalogue|contact|product|all|luminarias|lightbox|totems|aereos|revestimientos|rigidos)$/i.test(
      href
    )
  ) {
    return false;
  }
  /*
   * On a product ficha, bare hashes like #catalogue must leave to index.html —
   * otherwise the browser stays on product-….html#catalogue and the brochure
   * feels “stuck” during a presentation.
   */
  if (isDedicatedProductPageUrl()) {
    const hashOnly = href.match(/^#([A-Za-z0-9_-]+)$/);
    if (hashOnly) {
      const h = hashOnly[1].toLowerCase();
      if (h === 'catalogue' || h === 'all') href = indexCatalogueUrl();
      else if (h === 'contact') href = indexContactUrl();
      else if (h === 'home' || h === 'inicio') href = indexHomeUrl();
      else if (
        ['luminarias', 'lightbox', 'totems', 'aereos', 'revestimientos', 'rigidos'].includes(h)
      ) {
        href = indexCategoryUrl(h === 'aereos' ? 'aeris' : h === 'revestimientos' ? 'vesteix' : h === 'rigidos' ? 'rigids' : h === 'luminarias' ? 'lluminaries' : h);
      }
    }
  }
  try {
    const abs = new URL(href, window.location.href);
    /* Drop a trailing empty hash that some browsers keep on .href */
    if (abs.hash === '#' || abs.hash === '') {
      href = abs.pathname + abs.search;
      if (!href || href === '/') href = abs.href.replace(/#$/, '');
      else href = abs.origin + href;
    } else {
      href = abs.href;
    }
  } catch (_) {
    /* keep href as-is */
  }

  /*
   * Navigate in-frame, synchronously. Deferred location.replace after
   * preventDefault was a no-op in Cursor’s preview and left catalogue
   * clicks stuck on index. Native browsers accept assign() here.
   */
  try {
    const curBase = String(window.location.href || '').split('#')[0];
    const nextBase = String(href).split('#')[0];
    if (curBase === nextBase) return true;
  } catch (_) {}

  if (printitNavigating) {
    try {
      window.location.href = href;
    } catch (_) {}
    return true;
  }
  printitNavigating = true;
  try {
    window.location.assign(href);
  } catch (_) {
    try {
      window.location.href = href;
    } catch (_) {
      try {
        window.open(href, '_self');
      } catch (_) {}
    }
  } finally {
    setTimeout(() => {
      printitNavigating = false;
    }, 200);
  }
  return true;
}

function indexCatalogueUrl() {
  try {
    return new URL('index.html#catalogue', window.location.href).href;
  } catch (_) {
    return 'index.html#catalogue';
  }
}

function indexHomeUrl() {
  try {
    return new URL('index.html', window.location.href).href;
  } catch (_) {
    return 'index.html';
  }
}

function indexContactUrl() {
  try {
    return new URL('index.html#contact', window.location.href).href;
  } catch (_) {
    return 'index.html#contact';
  }
}

function hardenProductAnchors(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('a[href^="product-"][href$=".html"]').forEach((a) => {
    if (a.dataset.printitNavHardened === '1') return;
    a.dataset.printitNavHardened = '1';
    a.removeAttribute('target');
  });
}

function setCatalogueHeaderPanelExpanded(category, expanded) {
  const header = document.querySelector(
    `.catalogue-section-header--toggle[data-category="${category}"]`
  );
  if (!header) return;
  header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  header.classList.toggle('is-expanded', !!expanded);
  document.querySelectorAll(`.catalogue-item[data-header-panel="${category}"]`).forEach((panel) => {
    panel.classList.toggle('hidden', !expanded);
  });
}

function bindCatalogueHeaderToggles() {
  const list = document.getElementById('catalogue-list');
  if (!list || list.dataset.headerToggleBound === '1') return;
  list.dataset.headerToggleBound = '1';

  const toggleHeader = (header) => {
    if (!header || !header.classList.contains('catalogue-section-header--toggle')) return;
    const category = header.dataset.category;
    if (!category) return;
    const open = header.getAttribute('aria-expanded') === 'true';
    setCatalogueHeaderPanelExpanded(category, !open);
    if (!open) {
      const panel = document.querySelector(`.catalogue-item[data-header-panel="${category}"]`);
      if (panel) selectCatalogueItem(panel);
    }
  };

  list.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const header = t.closest('.catalogue-section-header--toggle');
    if (!header || !list.contains(header)) return;
    /* Never navigate from the section title — only expand / collapse. */
    e.preventDefault();
    e.stopPropagation();
    toggleHeader(header);
  });

  list.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const header = t.closest('.catalogue-section-header--toggle');
    if (!header || !list.contains(header)) return;
    e.preventDefault();
    toggleHeader(header);
  });
}

function bindCatalogueProductLinks() {
  const list = document.getElementById('catalogue-list');
  if (!list) return;
  hardenProductAnchors(list);
  bindCatalogueHeaderToggles();
  if (list.dataset.catalogueNavBound === '1') return;
  list.dataset.catalogueNavBound = '1';

  /* Capture phase: before onclick=selectCatalogueItem / <summary> toggle.
     Always force location.assign — stopPropagation in capture would otherwise
     prevent the event from reaching the <a>, so native href never fires. */
  const activateProductHref = (href, e) => {
    if (!isNavigableAnchorHref(href)) return false;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigateToProductUrl(href);
    return true;
  };

  const onActivate = (e) => {
    if (printitNavigating) return;
    if (e.type === 'click' && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0))
      return;
    if (e.type === 'pointerup') return; /* avoid double-nav with click */
    const t = e.target instanceof Element ? e.target : e.target && e.target.parentElement;
    if (!t || typeof t.closest !== 'function') return;

    const link = t.closest('a[href^="product-"][href$=".html"]');
    if (link && list.contains(link) && !link.hasAttribute('data-printit-nav')) {
      activateProductHref(link.getAttribute('href') || link.href, e);
      return;
    }

    const nameEl = t.closest('summary.catalogue-item-name, .catalogue-item-name');
    if (
      nameEl &&
      list.contains(nameEl) &&
      !nameEl.classList.contains('catalogue-item-name--branch') &&
      !nameEl.classList.contains('catalogue-item-name--accordion')
    ) {
      const nested = nameEl.querySelector('a[href^="product-"][href$=".html"]');
      if (nested) {
        activateProductHref(nested.getAttribute('href') || nested.href, e);
        return;
      }
    }

    const simple = t.closest('.catalogue-item-simple');
    if (simple && list.contains(simple)) {
      const rowLink = simple.querySelector('a[href^="product-"][href$=".html"]');
      if (rowLink && !t.closest('a[href^="product-"][href$=".html"]')) {
        activateProductHref(rowLink.getAttribute('href') || rowLink.href, e);
      }
    }
  };

  list.addEventListener('click', onActivate, true);
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
      const src = catalogueShowcaseSrcForHref(href, item);
      /* Prefer stills for catalogue showcase; fall back to video if no still. */
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

function stopCatalogueCarouselAutoplay() {
  if (catalogueCarouselTimer) {
    clearInterval(catalogueCarouselTimer);
    catalogueCarouselTimer = null;
  }
}

function startCatalogueCarouselAutoplay() {
  stopCatalogueCarouselAutoplay();
  const pc = document.getElementById('page-catalogue');
  if (!pc || !pc.classList.contains('active')) return;
  if (!Array.isArray(carouselImages) || carouselImages.length < 2) return;
  catalogueCarouselTimer = setInterval(() => {
    const stillCatalogue = document.getElementById('page-catalogue');
    if (!stillCatalogue || !stillCatalogue.classList.contains('active')) {
      stopCatalogueCarouselAutoplay();
      return;
    }
    nextImage();
  }, CATALOGUE_CAROUSEL_MS);
}

function applyCatalogueShowcaseCarousel() {
  const list = document.getElementById('catalogue-list');
  if (!list) return;
  const { sources, hrefs, rows } = collectCatalogueCarouselData();
  window.PRINTIT_CATALOGUE_CAROUSEL_HREFS = hrefs;
  if (!sources.length) {
    stopCatalogueCarouselAutoplay();
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
  startCatalogueCarouselAutoplay();
}

// ===== CATALOGUE LIST INTERACTION =====
function selectCatalogueItem(item) {
  document.querySelectorAll('.catalogue-item').forEach(el => el.classList.remove('active'));
  item.classList.add('active');

  const label = item.dataset.label;
  const href = productHrefFromCatalogueRow(item);
  let src = '';
  if (href) {
    src = catalogueShowcaseSrcForHref(href, item);
  } else {
    src = item.dataset.img || '';
  }

  /* Branch rows (Lightbox a pared): cycle the stills of their product links. */
  if (item.classList.contains('catalogue-item--branch')) {
    const branchSrcs = [];
    item.querySelectorAll('a[href^="product-"][href$=".html"]').forEach((link) => {
      const h = (link.getAttribute('href') || '').trim();
      const s = catalogueShowcaseSrcForHref(h, item);
      if (s && isCatalogueStillSrc(s) && !branchSrcs.includes(s)) branchSrcs.push(s);
    });
    if (branchSrcs.length) {
      const pc = document.getElementById('page-catalogue');
      if (pc && pc.classList.contains('active')) {
        setCarouselImages(branchSrcs, 0);
        window.PRINTIT_CATALOGUE_CAROUSEL_HREFS = [...item.querySelectorAll('a[href^="product-"][href$=".html"]')]
          .map((l) => (l.getAttribute('href') || '').trim())
          .filter(Boolean);
        updateShowcaseImage(branchSrcs[0], label);
        renderCarouselDots(branchSrcs.length);
        updateDots();
        startCatalogueCarouselAutoplay();
        return;
      }
    }
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

function indexCategoryUrl(category) {
  const hash = !category || category === 'all' ? 'catalogue' : filterCategoryKeyToHashAnchor(category);
  try {
    return new URL(`index.html#${hash}`, window.location.href).href;
  } catch (_) {
    return `index.html#${hash}`;
  }
}

function openCatalogueCategory(category, imgSrc, label, event) {
  if (event) event.preventDefault();
  if (isDedicatedProductPageUrl()) {
    navigateToProductUrl(indexCategoryUrl(category));
    return;
  }
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

const PRODUCT_PAGE_CATALOGUE_FILTER = {
  'product-banners-y-circulares.html': 'aeris',
  'product-circulares-con-luz.html': 'aeris',
  'product-circulares-sin-luz.html': 'aeris',
  'product-barniz-drop-gloss.html': 'rigids',
  'product-barniz-semi-mate.html': 'rigids',
  'product-cubos.html': 'aeris',
  'product-custom.html': 'lluminaries',
  'product-dali-casambi.html': 'lluminaries',
  'product-dynamic-white.html': 'lluminaries',
  'product-forrado-paredes.html': 'vesteix',
  'product-voile.html': 'vesteix',
  'product-frisos.html': 'aeris',
  'product-impresion-uvi.html': 'rigids',
  'product-lightbox-doble-cara.html': 'lightbox',
  'product-lightbox-pared.html': 'lightbox',
  'product-lightbox-pared-cortinas-led.html': 'lightbox',
  'product-luxpanel.html': 'lightbox',
  'product-on-off.html': 'lluminaries',
  'product-pixel-led.html': 'lluminaries',
  'product-relieve-braille.html': 'rigids',
  'product-relieve-cmyk.html': 'rigids',
  'product-rigidos.html': 'rigids',
  'product-sin-luz.html': 'totems',
  'product-tunable-white.html': 'lluminaries'
};

function highlightProductFilterPill() {
  const page = (window.location.pathname || '').split('/').pop() || '';
  const filter = PRODUCT_PAGE_CATALOGUE_FILTER[page];
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  if (!filter) return;
  const pill = document.querySelector(`.filter-pill[data-filter="${filter}"]`);
  if (pill) pill.classList.add('active');
}

function goToCatalogueAll(event) {
  if (event) event.preventDefault();
  if (isDedicatedProductPageUrl()) {
    navigateToProductUrl(indexCatalogueUrl());
    return;
  }
  showPage('catalogue', null);
  filterCatalogue('all', null);
}

// ===== FILTER BY TAG (Home page links) =====
function filterByTag(tag, event) {
  if (event) event.preventDefault();
  goToCatalogueAll(null);
}

// ===== CATALOGUE FILTER =====
function filterCatalogue(category, btn) {
  /* From a product ficha, category pills leave to the main catalogue on index. */
  if (isDedicatedProductPageUrl() && !printitApplyingHashRoute) {
    navigateToProductUrl(indexCategoryUrl(category));
    return;
  }

  let pc = document.getElementById('page-catalogue');
  if (!pc || !pc.classList.contains('active')) {
    showPage('catalogue', null);
    pc = document.getElementById('page-catalogue');
  }

  // Update active pill
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const items = document.querySelectorAll('.catalogue-item, .catalogue-section-header');
  const simpleItems = document.querySelectorAll('.catalogue-item-simple');
  const detailedItems = document.querySelectorAll('.catalogue-item-detailed');

  if (category === 'all') {
    items.forEach(el => el.classList.remove('hidden'));
    detailedItems.forEach(el => el.classList.add('hidden'));
    simpleItems.forEach(el => el.classList.remove('hidden'));

    // Lightbox: misma UI que en el filtro (Luxpanel detallado + branch a pared), no filas simples
    [...detailedItems]
      .filter((el) => el.dataset.category === 'lightbox')
      .forEach((el) => el.classList.remove('hidden'));
    [...simpleItems]
      .filter((el) => el.dataset.category === 'lightbox')
      .forEach((el) => el.classList.add('hidden'));

    // Aéreos: mostrar branch Circulares (CON/SIN LUZ) también en vista «all»
    [...detailedItems]
      .filter(
        (el) =>
          el.dataset.category === 'aeris' && el.classList.contains('catalogue-item--branch')
      )
      .forEach((el) => el.classList.remove('hidden'));
    [...simpleItems]
      .filter((el) => {
        if (el.dataset.category !== 'aeris') return false;
        const href = (el.querySelector('a[href^="product-"]') || {}).getAttribute?.('href') || '';
        return /product-circulares-(con|sin)-luz\.html|product-banners-y-circulares\.html/.test(
          href
        );
      })
      .forEach((el) => el.classList.add('hidden'));
  } else {
    items.forEach(el => {
      const elCategory = el.dataset.category;
      if (elCategory === category) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    const detailedForCat = [...detailedItems].filter(el => el.dataset.category === category);
    const simpleForCat = [...simpleItems].filter(el => el.dataset.category === category);
    // If detailed rows have product links, use those; otherwise fall back to simple rows
    // (Aéreos on product pages had a single details block without navigable links).
    const detailedHaveLinks = detailedForCat.some(el => el.querySelector('a[href]'));

    if (detailedHaveLinks) {
      simpleForCat.forEach(el => el.classList.add('hidden'));
      detailedForCat.forEach(el => el.classList.remove('hidden'));
    } else {
      detailedForCat.forEach(el => el.classList.add('hidden'));
      simpleForCat.forEach(el => el.classList.remove('hidden'));
    }

  }

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

  if (!printitApplyingHashRoute) {
    const path = `${window.location.pathname}${window.location.search}`;
    if (category === 'all') {
      history.replaceState(null, '', `${path}#catalogue`);
    } else {
      history.replaceState(null, '', `${path}#${filterCategoryKeyToHashAnchor(category)}`);
    }
  }
}

function getMiniCardThumbSrc(miniCard) {
  if (!miniCard) return '';
  const img = miniCard.querySelector('img');
  if (img && img.getAttribute('src')) return img.getAttribute('src');
  const video = miniCard.querySelector('video');
  if (video) {
    const poster = video.getAttribute('poster');
    if (poster) return poster;
    const source = video.querySelector('source[src]');
    if (source) return source.getAttribute('src');
    return video.getAttribute('src') || '';
  }
  return '';
}

const FILTER_MINI_CARD_ORDER = [
  'lluminaries',
  'lightbox',
  'totems',
  'aeris',
  'vesteix',
  'rigids'
];

const FALLBACK_FILTER_THUMBS = {
  lluminaries: 'media/aplicaciones/luminarias/luminaria-indice.png',
  lightbox: 'media/aplicaciones/lightbox/lightbox-miniatura.png',
  totems: 'media/aplicaciones/totems/2.jpg',
  aeris: 'media/aplicaciones/aereos/exteirior-cubo.jpg',
  vesteix: 'media/aplicaciones/vestimos/voile-miniatura.png',
  rigids: 'media/aplicaciones/rigidos/rigidos-miniatura.jpg'
};

/** Miniaturas de filtro que no deben variar entre páginas (ni por mini-cards). */
const LOCKED_FILTER_THUMBS = new Set(['totems', 'vesteix', 'rigids', 'lightbox']);

function buildFilterThumbMapFromMiniCards() {
  const miniCards = document.querySelectorAll('#page-home .mini-cards .mini-card');
  const map = { ...FALLBACK_FILTER_THUMBS };
  miniCards.forEach((card, index) => {
    const filter = FILTER_MINI_CARD_ORDER[index];
    if (!filter || LOCKED_FILTER_THUMBS.has(filter)) return;
    const src = getMiniCardThumbSrc(card);
    if (src) map[filter] = src;
  });
  LOCKED_FILTER_THUMBS.forEach((filter) => {
    if (FALLBACK_FILTER_THUMBS[filter]) map[filter] = FALLBACK_FILTER_THUMBS[filter];
  });
  return { map, miniCards };
}

function buildAllThumbGridMarkup(miniCards) {
  const tiles = [...miniCards]
    .slice(0, 4)
    .map((card) => {
      const src = getMiniCardThumbSrc(card);
      return src
        ? `<img src="${src}" alt="" decoding="async" loading="lazy">`
        : '';
    })
    .filter(Boolean)
    .join('');
  return tiles ? `<span class="filter-pill-thumb-grid">${tiles}</span>` : '';
}

function initGlobalCatalogueFilterNav() {
  const panelRight = document.getElementById('panel-right');
  if (!panelRight) return;

  let bar = document.getElementById('catalogue-filter-nav');
  if (!bar) {
    bar = document.querySelector('#page-catalogue .filter-bar');
    if (!bar) return;
    bar.id = 'catalogue-filter-nav';
    bar.classList.add('catalogue-filter-nav');
  }

  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Categorías de aplicaciones');

  const activePage = document.querySelector('.page.active');
  if (activePage) {
    const pageName = activePage.id.replace('page-', '');
    repositionCatalogueFilterNav(pageName === 'home' ? 'catalogue' : pageName);
  }
}

function isMobileProductFilterDock() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function repositionCatalogueFilterNav(pageName) {
  const bar = document.getElementById('catalogue-filter-nav');
  if (!bar) return;

  /* En inicio no se muestra: las mini-cards ya actúan como índice por categoría. */
  if (pageName === 'home') {
    pageName = 'catalogue';
  }

  if (!['catalogue', 'product'].includes(pageName)) {
    bar.classList.remove('catalogue-filter-nav--mobile-dock');
    return;
  }

  const page = document.getElementById(`page-${pageName}`);
  if (!page) return;

  if (pageName === 'product' && isMobileProductFilterDock()) {
    bar.classList.add('catalogue-filter-nav--mobile-dock');
    if (bar.parentElement !== document.body) {
      document.body.appendChild(bar);
    }
    return;
  }

  bar.classList.remove('catalogue-filter-nav--mobile-dock');

  const insertAfter =
    pageName === 'product'
      ? page.querySelector('.product-top-actions') || page.querySelector('.top-nav')
      : page.querySelector('.top-nav');

  if (!insertAfter) return;
  if (bar.parentElement !== page) {
    insertAfter.insertAdjacentElement('afterend', bar);
    return;
  }
  if (bar.previousElementSibling === insertAfter) return;
  insertAfter.insertAdjacentElement('afterend', bar);
}

function initFilterPillIcons() {
  const { map: thumbByFilter, miniCards } = buildFilterThumbMapFromMiniCards();

  document.querySelectorAll('.filter-bar').forEach((bar) => {
    bar.classList.add('filter-bar--thumbs');
  });

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    if (pill.dataset.thumbReady === '1') return;
    const filter = (pill.dataset.filter || '').trim();
    const labelEl = pill.querySelector('.filter-pill-label');
    const label = labelEl
      ? labelEl.textContent.trim()
      : (pill.textContent || '').trim();

    let thumbMarkup = '';
    const thumbSrc = pill.dataset.thumbSrc || thumbByFilter[filter] || '';
    if (thumbSrc) {
      thumbMarkup = `<img class="filter-pill-thumb-img" src="${thumbSrc}" alt="" decoding="async" loading="lazy">`;
    }

    pill.innerHTML = `
      <span class="filter-pill-thumb" aria-hidden="true">${thumbMarkup}</span>
      <span class="filter-pill-label">${label}</span>
    `;
    pill.dataset.thumbReady = '1';
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
      `media/perfiles/${String(profile).toLowerCase()}.png`;
    schematicImg.alt = `Vista técnica — ${profile}`;
  }
}

// ===== TEMA CLARO / OSCURO =====
const THEME_STORAGE_KEY = 'printit-theme';
const NAV_LOGO_DARK_MODE_SRC = 'media/brand/logo-oficial.png';
const NAV_LOGO_LIGHT_MODE_SRC = 'media/brand/logo-dark.jpg';
const THEME_TOGGLE_MARKUP = `
  <span class="nav-theme-toggle-track" aria-hidden="true">
    <span class="nav-theme-opt nav-theme-opt--dark">
      <svg class="nav-theme-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z"/></svg>
      <span class="nav-theme-opt-label">Oscuro</span>
    </span>
    <span class="nav-theme-opt nav-theme-opt--light">
      <svg class="nav-theme-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <span class="nav-theme-opt-label">Claro</span>
    </span>
  </span>
`.trim();

function ensureThemeToggleMarkup(btn) {
  if (!(btn instanceof HTMLElement)) return;
  if (btn.querySelector('.nav-theme-toggle-track')) return;
  btn.innerHTML = THEME_TOGGLE_MARKUP;
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  if (isLight) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  document.querySelectorAll('.nav-theme-toggle').forEach(btn => {
    ensureThemeToggleMarkup(btn);
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      isLight ? 'Modo claro activo. Cambiar a modo oscuro' : 'Modo oscuro activo. Cambiar a modo claro'
    );
    btn.setAttribute('title', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    btn.dataset.themeActive = isLight ? 'light' : 'dark';
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

function setTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch (_) {}
}

function toggleTheme() {
  const next =
    document.documentElement.getAttribute('data-theme') === 'light'
      ? 'dark'
      : 'light';
  setTheme(next);
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
    if (root.classList.contains('ba-compare--triple')) return;
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

/** Comparador de 3 capas (delante / interior / abierto) con dos persianas. */
function initTripleBeforeAfterComparators() {
  const GAP = 8;

  document.querySelectorAll('.ba-compare.ba-compare--triple').forEach((root) => {
    if (root.dataset.baTripleBound === '1') return;
    root.dataset.baTripleBound = '1';

    let posA = Math.min(90, Math.max(8, parseInt(root.dataset.baInitialA || '34', 10)));
    let posB = Math.min(92, Math.max(10, parseInt(root.dataset.baInitialB || '68', 10)));
    if (posB < posA + GAP) posB = Math.min(92, posA + GAP);

    const rangeA = root.querySelector('.ba-range--a');
    const rangeB = root.querySelector('.ba-range--b');
    const handleA = root.querySelector('[data-ba-handle="a"]');
    const handleB = root.querySelector('[data-ba-handle="b"]');

    const apply = () => {
      root.style.setProperty('--ba-pos-a', `${posA}%`);
      root.style.setProperty('--ba-pos-b', `${posB}%`);
      if (rangeA) {
        rangeA.value = String(Math.round(posA));
        rangeA.setAttribute('aria-valuenow', String(Math.round(posA)));
      }
      if (rangeB) {
        rangeB.value = String(Math.round(posB));
        rangeB.setAttribute('aria-valuenow', String(Math.round(posB)));
      }
    };

    const setFromClientX = (which, clientX) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      if (which === 'a') {
        posA = Math.min(posB - GAP, Math.max(8, pct));
      } else {
        posB = Math.max(posA + GAP, Math.min(92, pct));
      }
      apply();
    };

    const bindHandle = (el, which) => {
      if (!el) return;
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.setPointerCapture?.(e.pointerId);
        setFromClientX(which, e.clientX);
        const onMove = (ev) => setFromClientX(which, ev.clientX);
        const onUp = () => {
          el.releasePointerCapture?.(e.pointerId);
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
      });
    };

    bindHandle(handleA, 'a');
    bindHandle(handleB, 'b');

    if (rangeA) {
      rangeA.addEventListener('input', () => {
        posA = Math.min(posB - GAP, Math.max(8, Number(rangeA.value)));
        apply();
      });
    }
    if (rangeB) {
      rangeB.addEventListener('input', () => {
        posB = Math.max(posA + GAP, Math.min(92, Number(rangeB.value)));
        apply();
      });
    }

    apply();
  });
}

/** Fotos apiladas: la de delante deja ver un trozo de las de atrás a la derecha. */
function initLayerStairs() {
  document.querySelectorAll('.photo-stack').forEach(root => {
    if (root.dataset.stackBound === '1') return;
    root.dataset.stackBound = '1';

    const range = root.querySelector('.photo-stack-range');
    if (!range) return;

    const peek = Math.min(28, Math.max(12, parseInt(root.dataset.stackPeek || '18', 10)));
    const initial = parseInt(root.dataset.stackInitial || '55', 10);
    // Front edge between peek and (100 - 2*peek) so mid + back always peek on the right
    const minFront = peek;
    const maxFront = 100 - 2 * peek;

    const apply = () => {
      const t = Math.min(100, Math.max(0, Number(range.value)));
      const front = minFront + (t / 100) * (maxFront - minFront);
      root.style.setProperty('--peek', `${peek}%`);
      root.style.setProperty('--front', `${front}%`);
      range.setAttribute('aria-valuenow', String(Math.round(t)));
    };

    range.value = String(Math.min(100, Math.max(0, initial)));
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

/** Vídeos del catálogo: barra nativa play/pausa (muted; sin volumen ni fullscreen). */
function printitEnsureVideoUiControls(video) {
  if (!video || video.tagName !== 'VIDEO') return;
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.controls = true;
  video.setAttribute('controls', '');
  video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback noplaybackrate novolume');
  video.disablePictureInPicture = true;
  video.setAttribute('disablePictureInPicture', '');
}

function bindPrintitVideoHoverControls(video) {
  if (!video || video.tagName !== 'VIDEO' || video.dataset.printitHoverCtl === '1') return;
  video.dataset.printitHoverCtl = '1';
  printitEnsureVideoUiControls(video);
}

let printitVideoIo = null;

function observePrintitVideoAutoplayWhenVisible(video) {
  if (!video || video.tagName !== 'VIDEO' || video.dataset.printitAutoIo === '1') return;
  video.dataset.printitAutoIo = '1';

  if (!('IntersectionObserver' in window)) {
    if (video.dataset.printitSeq !== '1') video.play().catch(() => {});
    return;
  }

  if (!printitVideoIo) {
    printitVideoIo = new IntersectionObserver(
      entries => {
        entries.forEach(ent => {
          const v = ent.target;
          if (!(v instanceof HTMLVideoElement)) return;
          /* Páginas con foco exclusivo (p. ej. Viste): no autoplay el clip idle. */
          if (v.dataset.printitExclusiveOff === '1') {
            if (!v.paused) v.pause();
            return;
          }
          const ratio = ent.intersectionRatio;
          /* Secuencia de galería: solo pausa fuera de vista; el play lo lleva la secuencia. */
          if (v.dataset.printitSeq === '1') {
            if (!ent.isIntersecting || ratio < 0.05) v.pause();
            else if (v.dataset.printitSeqActive === '1' && v.paused) v.play().catch(() => {});
            return;
          }
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

/**
 * En cada galería de ficha con 2+ vídeos: solo reproduce uno a la vez.
 * Empieza siempre el de la izquierda; al acabar, el siguiente (ciclo).
 */
function initPrintitGalleryVideoSequences(scope = document) {
  const galleries = scope.querySelectorAll(
    '#page-product .sheet-media-gallery .product-gallery, #page-product .product-detail-header .product-gallery'
  );

  galleries.forEach((gallery) => {
    if (gallery.dataset.printitSeqBound === '1') return;

    const videos = [...gallery.querySelectorAll('video')].filter((v) => {
      if (v.dataset.printitExclusiveOff === '1') return false;
      if (v.hasAttribute('data-dual-clip')) return false;
      return true;
    });
    if (videos.length < 2) return;

    gallery.dataset.printitSeqBound = '1';
    let active = 0;

    const setActive = (idx) => {
      active = ((idx % videos.length) + videos.length) % videos.length;
      videos.forEach((v, i) => {
        const isActive = i === active;
        v.dataset.printitSeqActive = isActive ? '1' : '0';
        if (isActive) {
          v.play().catch(() => {});
        } else {
          v.pause();
          try {
            if (v.currentTime > 0.05) v.currentTime = 0;
          } catch (_) {}
        }
      });
    };

    videos.forEach((v, i) => {
      v.dataset.printitSeq = '1';
      v.dataset.printitSeqIndex = String(i);
      v.loop = false;
      v.removeAttribute('loop');
      v.autoplay = false;
      v.removeAttribute('autoplay');
      v.pause();
      try {
        v.currentTime = 0;
      } catch (_) {}

      v.addEventListener('ended', () => {
        if (i !== active) return;
        setActive(i + 1);
      });

      v.addEventListener('play', () => {
        if (i === active) return;
        active = i;
        videos.forEach((other, j) => {
          other.dataset.printitSeqActive = j === i ? '1' : '0';
          if (j !== i && !other.paused) other.pause();
        });
      });
    });

    setActive(0);
  });
}

function refreshPrintitVideoBindings(scope = document) {
  scope.querySelectorAll('video').forEach(v => {
    printitEnsureVideoUiControls(v);
    bindPrintitVideoHoverControls(v);
    observePrintitVideoAutoplayWhenVisible(v);
  });
}

/** Tras cambiar de vista (p. ej. display de .page), forzar play en vídeos ya visibles. */
function printitKickVisibleVideos() {
  document.querySelectorAll('video').forEach(v => {
    if (v.dataset.printitExclusiveOff === '1') return;
    if (v.dataset.printitSeq === '1' && v.dataset.printitSeqActive !== '1') return;
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

function initProductSheetDownloadCtaRow(scope = document) {
  const page = scope.getElementById ? scope.getElementById('page-product') : null;
  if (!page) return;

  const specSheet = page.querySelector('.product-spec-sheet');
  if (!specSheet) return;

  const h1 = specSheet.querySelector(':scope > .product-doc-h1');
  if (!h1) return;

  let cta = null;
  page.querySelectorAll('.sheet-media-gallery').forEach((gallery) => {
    if (cta) return;
    const link = gallery.querySelector(':scope > .sheet-media-gallery-header .sheet-download-cta');
    if (link) cta = link;
  });
  if (!cta || cta.dataset.sheetHeadPlaced === '1') return;

  let head = specSheet.querySelector('.product-spec-sheet-head');
  if (!head) {
    head = document.createElement('div');
    head.className = 'product-spec-sheet-head';
    specSheet.insertBefore(head, h1);
    head.appendChild(h1);
  } else if (h1.parentElement !== head) {
    head.insertBefore(h1, head.firstChild);
  }

  head.appendChild(cta);
  cta.dataset.sheetHeadPlaced = '1';
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
      'Abre http://127.0.0.1:8080/ en Safari (no abras el HTML desde Finder)'
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

function initSiteFrameBrand() {
  document.body.classList.add('has-site-frame');
  if (document.querySelector('.site-frame-bottom')) return;

  const el = document.createElement('div');
  el.className = 'site-frame-bottom';
  el.setAttribute('aria-label', 'Print It web');
  el.innerHTML = `
    <span class="site-frame-bottom-line" aria-hidden="true"></span>
    <a class="site-frame-url" href="https://www.printitbcn.com" target="_blank" rel="noopener noreferrer">www.printitbcn.com</a>
  `;
  document.body.appendChild(el);
}

function initContactPageLayout() {
  const contactPage = document.getElementById('page-contact');
  if (!contactPage) return;

  contactPage.classList.add('contact-page--architect');

  const nav = contactPage.querySelector('.top-nav');
  const cards = [...contactPage.querySelectorAll('.profile-card.animate-in')];
  const footer = contactPage.querySelector('.footer-bar');

  const brand = nav && nav.querySelector('.nav-brand');
  if (brand && !contactPage.querySelector('.contact-page-logo')) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'contact-page-logo animate-in';
    logoWrap.appendChild(brand);
    nav.insertAdjacentElement('afterend', logoWrap);
  }

  if (nav && !contactPage.querySelector('.contact-intro')) {
    const intro = document.createElement('header');
    intro.className = 'contact-intro animate-in';
    intro.innerHTML = `
      <p class="contact-intro-eyebrow">Print It · Barcelona</p>
      <h1 class="contact-intro-title">Contacto</h1>
      <p class="contact-intro-lead">Hablemos de tu proyecto.</p>
    `;
    const logoWrap = contactPage.querySelector('.contact-page-logo');
    const anchor = logoWrap || nav;
    anchor.insertAdjacentElement('afterend', intro);
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

function closeProfilePeekLightbox() {
  const lb = document.getElementById('sheet-profile-peek-lightbox');
  if (lb) {
    lb.hidden = true;
    lb.classList.remove(
      'sheet-profile-peek-lightbox--voile-ficha',
      'sheet-profile-peek-lightbox--voile-element'
    );
    lb.querySelectorAll('.sheet-profile-peek-lightbox__svg').forEach((n) => n.remove());
    const img = lb.querySelector('.sheet-profile-peek-lightbox__img');
    if (img) {
      img.hidden = false;
      img.removeAttribute('src');
    }
    const title = lb.querySelector('.sheet-profile-peek-lightbox__title');
    if (title) title.hidden = false;
  }
  document.body.classList.remove('sheet-profile-peek-lightbox-open');
  document.querySelectorAll('.sheet-profile-thumb--peek.is-enlarged').forEach((thumb) => {
    thumb.classList.remove('is-enlarged');
    thumb.setAttribute('aria-expanded', 'false');
  });
}

function ensureProfilePeekLightbox() {
  let lb = document.getElementById('sheet-profile-peek-lightbox');
  if (lb) return lb;

  lb = document.createElement('div');
  lb.id = 'sheet-profile-peek-lightbox';
  lb.className = 'sheet-profile-peek-lightbox';
  lb.hidden = true;
  lb.innerHTML = `
    <div class="sheet-profile-peek-lightbox__backdrop" data-peek-close tabindex="-1" aria-hidden="true"></div>
    <div class="sheet-profile-peek-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Vista técnica ampliada">
      <button type="button" class="sheet-profile-peek-lightbox__close" aria-label="Cerrar vista ampliada">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <p class="sheet-profile-peek-lightbox__title"></p>
      <div class="sheet-profile-peek-lightbox__stage">
        <img class="sheet-profile-peek-lightbox__img" alt="">
      </div>
    </div>
  `;
  document.body.appendChild(lb);

  lb.querySelector('[data-peek-close]').addEventListener('click', closeProfilePeekLightbox);
  lb.querySelector('.sheet-profile-peek-lightbox__close').addEventListener('click', closeProfilePeekLightbox);

  return lb;
}

function openProfilePeekLightbox(thumb) {
  const frameImg = thumb.querySelector('.sheet-profile-peek-frame img');
  if (!frameImg) return;

  const lb = ensureProfilePeekLightbox();
  const img = lb.querySelector('.sheet-profile-peek-lightbox__img');
  const title = lb.querySelector('.sheet-profile-peek-lightbox__title');
  const stage = lb.querySelector('.sheet-profile-peek-lightbox__stage');
  const card = thumb.closest('.sheet-profile-card');
  const profileName = card?.querySelector('.sheet-profile-name')?.textContent?.trim() || '';

  // Prefer hi-res / vector source for lightbox (data-peek-src) so enlarged line art stays crisp
  const peekSrc =
    frameImg.getAttribute('data-peek-src') ||
    thumb.getAttribute('data-peek-src') ||
    frameImg.getAttribute('src') ||
    frameImg.src;
  const resolvedSrc = withPrintitMediaCache(peekSrc);
  img.alt = frameImg.alt || (profileName ? `Vista técnica ${profileName}` : 'Vista técnica ampliada');
  const isVoileFicha =
    card?.getAttribute('data-peek-ficha') === 'voile' ||
    /voile-suspension/i.test(peekSrc || '');

  const peekTitle = card?.getAttribute('data-peek-title');
  title.hidden = false;
  if (peekTitle) {
    title.textContent = peekTitle;
  } else if (profileName && card?.hasAttribute('data-profile')) {
    title.textContent = `Sección de perfil · ${profileName}`;
  } else if (profileName) {
    title.textContent = `Vista técnica · ${profileName}`;
  } else {
    title.textContent = 'Vista técnica ampliada';
  }

  lb.classList.toggle('sheet-profile-peek-lightbox--voile-ficha', isVoileFicha);
  lb.classList.remove('sheet-profile-peek-lightbox--voile-element');

  // Clear previous inline SVG (Voile ficha) so Montserrat from the page can apply
  stage.querySelectorAll('.sheet-profile-peek-lightbox__svg').forEach((n) => n.remove());
  img.hidden = false;
  img.removeAttribute('src');
  const isFrisoFicha =
    frameImg.hasAttribute('data-peek-friso') ||
    /FRISOS\s*\/svg\/friso-.*-ficha/i.test(peekSrc || '');

  img.classList.toggle(
    'sheet-profile-peek-lightbox__img--lineart',
    /perfileria|PERFILERIA|voile-suspension|\.svg($|\?)/i.test(peekSrc)
  );
  img.classList.toggle('sheet-profile-peek-lightbox__img--friso-ficha', isFrisoFicha);
  img.classList.toggle(
    'profile-lineart--on-black',
    frameImg.classList.contains('profile-lineart--on-black')
  );

  // Voile / Friso: misma imagen exacta que la miniatura (fondo negro, dibujo técnico)
  img.hidden = false;
  img.style.background = '#000';
  img.src = resolvedSrc;

  document.querySelectorAll('.sheet-profile-thumb--peek.is-enlarged').forEach((t) => {
    if (t !== thumb) {
      t.classList.remove('is-enlarged');
      t.setAttribute('aria-expanded', 'false');
    }
  });

  thumb.classList.add('is-enlarged');
  thumb.setAttribute('aria-expanded', 'true');
  lb.hidden = false;
  document.body.classList.add('sheet-profile-peek-lightbox-open');
  lb.querySelector('.sheet-profile-peek-lightbox__close').focus();
}

const PROFILE_PEEK_LOUPE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

function initProfilePeekThumbs(scope = document) {
  scope.querySelectorAll('.sheet-profile-thumb--peek').forEach((thumb) => {
    if (thumb.dataset.peekBound === '1') return;
    thumb.dataset.peekBound = '1';
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    if (!thumb.getAttribute('aria-label')) {
      thumb.setAttribute('aria-label', 'Ampliar vista técnica');
    }

    if (!thumb.querySelector('.sheet-profile-peek-loupe')) {
      const loupe = document.createElement('span');
      loupe.className = 'sheet-profile-peek-loupe';
      loupe.innerHTML = PROFILE_PEEK_LOUPE_SVG;
      thumb.appendChild(loupe);
    }

    const toggle = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (thumb.classList.contains('is-enlarged')) {
        closeProfilePeekLightbox();
      } else {
        openProfilePeekLightbox(thumb);
      }
    };

    thumb.addEventListener('click', toggle);
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggle(e);
      }
      if (e.key === 'Escape') {
        closeProfilePeekLightbox();
      }
    });
  });

  if (!document.body.dataset.profilePeekDismissBound) {
    document.body.dataset.profilePeekDismissBound = '1';
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeProfilePeekLightbox();
    });
  }
}

/** On product fichas, category pills become real links to index#category. */
function convertProductPageFilterPillsToLinks() {
  if (!isDedicatedProductPageUrl()) return;
  document.querySelectorAll('button.filter-pill[data-filter]').forEach((pill) => {
    const cat = (pill.dataset.filter || 'all').trim();
    const hash = !cat || cat === 'all' ? 'catalogue' : filterCategoryKeyToHashAnchor(cat);
    const a = document.createElement('a');
    a.className = pill.className;
    a.href = `index.html#${hash}`;
    a.dataset.filter = cat;
    if (pill.dataset.thumbSrc) a.dataset.thumbSrc = pill.dataset.thumbSrc;
    if (pill.dataset.thumbReady) a.dataset.thumbReady = pill.dataset.thumbReady;
    if (pill.dataset.iconReady) a.dataset.iconReady = pill.dataset.iconReady;
    a.setAttribute('role', 'button');
    a.innerHTML = pill.innerHTML;
    if (pill.classList.contains('active')) a.classList.add('active');
    pill.replaceWith(a);
  });
}

function initProductPageLinkNavigation() {
  hardenProductAnchors(document);
  if (document.body.dataset.productNavBound === '1') return;
  document.body.dataset.productNavBound = '1';

  /* Always rewrite SPA chrome to real URLs when on a product ficha. */
  if (isDedicatedProductPageUrl()) {
    document.querySelectorAll('a[onclick*="showPage(\'home\'"]').forEach((a) => {
      a.setAttribute('href', 'index.html');
      a.removeAttribute('onclick');
    });
    document.querySelectorAll('a.nav-brand-link').forEach((a) => {
      a.setAttribute('href', 'index.html');
      a.removeAttribute('onclick');
    });
    document.querySelectorAll('a[onclick*="goToCatalogueAll"]').forEach((a) => {
      a.setAttribute('href', 'index.html#catalogue');
      a.removeAttribute('onclick');
    });
    document.querySelectorAll('a[onclick*="showPage(\'contact\'"]').forEach((a) => {
      a.setAttribute('href', 'index.html#contact');
      a.removeAttribute('onclick');
    });
    document.querySelectorAll('a[href="#catalogue"]').forEach((a) => {
      a.setAttribute('href', 'index.html#catalogue');
    });
    document.querySelectorAll('a[href="#contact"]').forEach((a) => {
      a.setAttribute('href', 'index.html#contact');
    });
    document.querySelectorAll('a[href="#"]').forEach((a) => {
      const label = (a.textContent || '').trim();
      if (label === 'Inicio' || a.classList.contains('nav-brand-link')) {
        a.setAttribute('href', 'index.html');
        a.removeAttribute('onclick');
      } else if (label === 'Contacto') {
        a.setAttribute('href', 'index.html#contact');
        a.removeAttribute('onclick');
      }
    });
    convertProductPageFilterPillsToLinks();

    /* Capture: force leave-to-index for chrome / category pills (preview-safe). */
    document.addEventListener(
      'click',
      (e) => {
        if (printitNavigating) return;
        if (!isDedicatedProductPageUrl()) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const t = e.target instanceof Element ? e.target : e.target && e.target.parentElement;
        if (!t || typeof t.closest !== 'function') return;
        const a = t.closest('a[href]');
        if (!a || a.hasAttribute('data-printit-nav')) return;
        const raw = (a.getAttribute('href') || '').trim();
        if (!raw || raw === '#' || /^javascript:/i.test(raw)) return;
        let abs;
        try {
          abs = new URL(raw, window.location.href);
        } catch (_) {
          return;
        }
        const leaf = (abs.pathname || '').split('/').pop() || '';
        const sameProductPage =
          leaf.toLowerCase() ===
          ((window.location.pathname || '').split('/').pop() || '').toLowerCase();
        const hashOnlySpa =
          /^#(?:catalogue|contact|home|inicio|all|luminarias|lightbox|totems|aereos|revestimientos|rigidos)$/i.test(
            raw
          );
        const leavesToIndex =
          leaf === 'index.html' ||
          leaf === '' ||
          abs.pathname.endsWith('/') ||
          (sameProductPage && hashOnlySpa);
        const isProductHop =
          /^product-[^/]+\.html$/i.test(leaf) && !sameProductPage;
        if (!leavesToIndex && !isProductHop) return;
        e.preventDefault();
        e.stopPropagation();
        navigateToProductUrl(raw);
      },
      true
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  /* Load brand font without blocking styles.css parse. */
  try {
    if (!document.querySelector('link[data-printit-font]')) {
      const pre = document.createElement('link');
      pre.rel = 'preconnect';
      pre.href = 'https://fonts.googleapis.com';
      document.head.appendChild(pre);
      const pre2 = document.createElement('link');
      pre2.rel = 'preconnect';
      pre2.href = 'https://fonts.gstatic.com';
      pre2.crossOrigin = 'anonymous';
      document.head.appendChild(pre2);
      const font = document.createElement('link');
      font.rel = 'stylesheet';
      font.href =
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;700&display=swap';
      font.dataset.printitFont = '1';
      document.head.appendChild(font);
    }
  } catch (_) {}

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
  initSiteFrameBrand();
  initGlobalCatalogueFilterNav();
  initFilterPillIcons();
  initBeforeAfterComparators();
  initTripleBeforeAfterComparators();
  initLayerStairs();
  initSoftLoopVideos();
  refreshPrintitVideoBindings();
  initPrintitGalleryVideoSequences();
  requestAnimationFrame(() => printitKickVisibleVideos());
  bustPrintitGalleryMediaCache();
  initBeforeAfterComparators();
  initTripleBeforeAfterComparators();
  initLayerStairs();
  syncProductGalleryToShowcase();
  document.querySelectorAll('.nav-theme-toggle').forEach(btn => {
    btn.type = 'button';
    if (btn.dataset.themeBound === '1') return;
    btn.dataset.themeBound = '1';
    btn.addEventListener('click', (event) => {
      const opt = event.target instanceof Element
        ? event.target.closest('.nav-theme-opt')
        : null;
      if (opt?.classList.contains('nav-theme-opt--light')) {
        setTheme('light');
        return;
      }
      if (opt?.classList.contains('nav-theme-opt--dark')) {
        setTheme('dark');
        return;
      }
      toggleTheme();
    });
  });

  const initialHash = (window.location.hash || '').replace('#', '');
  const dedicatedProduct = isDedicatedProductPageUrl();

  const catalogueRoot = document.getElementById('catalogue-list');
  if (catalogueRoot) {
    // Mark non-simple catalogue rows as detailed for filter behavior.
    document.querySelectorAll('#catalogue-list .catalogue-item').forEach(item => {
      if (!item.classList.contains('catalogue-item-simple')) {
        item.classList.add('catalogue-item-detailed');
      }
    });

    bindCatalogueProductLinks();
    bindCatalogueHeaderToggles();
  }

  if (!initialHash && !dedicatedProduct && document.getElementById('page-home')) {
    showPage('home', null);
  }

  applyHashRoute();
  applyProductContextFromPage();
  initProductPageLinkNavigation();
  initContactPageLayout();
  initWhatsAppLinks();
  splitContactSocialLinkLabels();
  initDaliCasambiUseCaseLightbox();
  initDaliCasambiSchemaShowcase();
  initProfilePeekThumbs();
  initProductSheetDownloadCtaRow();

  initPrintitDiagnostics();

  // Review sticky pins: only when session exists (see review/login.html). Removable later.
  try {
    if (sessionStorage.getItem('printit-review')) {
      import('./review/review-app.js')
        .then((m) => m.initPrintitReview && m.initPrintitReview())
        .catch((err) => console.warn('[printit-review] failed to load', err));
    }
  } catch (_) {}
});

Object.assign(window, {
  selectCatalogueItem,
  bindCatalogueProductLinks,
  bindCatalogueHeaderToggles,
  setCatalogueHeaderPanelExpanded,
  filterCatalogue,
  showPage,
  goToCatalogueAll,
  openCatalogueCategory,
  showProductDetail,
  openEmbeddedProduct,
  prevImage,
  nextImage,
  goToImage,
  toggleTheme,
  navigateToProductUrl
});

function applyHashRoute() {
  printitApplyingHashRoute = true;
  try {
    const hash = (window.location.hash || '').replace('#', '');
    if ((hash === 'catalogue' || hash === 'all') && document.getElementById('page-catalogue')) {
      goToCatalogueAll(null);
    } else if (isDedicatedProductPageUrl() && document.getElementById('page-product')) {
      /* Real product-*.html fichas only — never trap index.html on #product. */
      if (!window.PRINTIT_PRODUCT_CONTEXT) {
        window.PRINTIT_PRODUCT_CONTEXT = { ...DEFAULT_PRODUCT_CONTEXT };
      }
      showPage('product', null);
    } else if (hash === 'product' && document.getElementById('page-catalogue')) {
      goToCatalogueAll(null);
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

window.addEventListener('resize', () => {
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;
  repositionCatalogueFilterNav(activePage.id.replace('page-', ''));
});

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

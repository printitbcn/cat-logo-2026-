# Tech stack y arquitectura � PRINT-IT-PROP-CATALOGO

Documento orientado a **desarrolladores y mantenimiento**: c�mo est� montada la infraestructura del cat�logo Print It, qu� tecnolog�as intervienen (y cu�les no), y c�mo encaja la l�gica en el navegador.

Para una gu�a orientada a **contenido, cat�logo y flujo de usuario**, conviene leer tambi�n [`../PROJECT-GUIDE.md`](../PROJECT-GUIDE.md).

---

## 1. Resumen ejecutivo

| Aspecto | Decisi�n |
|--------|-----------|
| **Paradigma** | Sitio **est�tico**: HTML + CSS + **JavaScript sin framework** |
| **Build** | **No** hay `package.json`, bundler (Vite/Webpack) ni transpilaci�n |
| **Runtime** | Navegador moderno (ES5+ razonable; APIs DOM est�ndar) |
| **Servidor** | Cualquier servidor de **archivos est�ticos** (p. ej. `python3 -m http.server`). Para **LAN**: `.env.example` ? `.env`, `./scripts/serve-lan.sh` o tarea **Serve catalog on LAN** en VS Code/Cursor |
| **Dependencias npm** | **Ninguna** en tiempo de ejecuci�n del cat�logo |

La �aplicaci�n� es un **patr�n tipo SPA ligero**: varias vistas en un mismo HTML (`index.html`) o en p�ginas `product-*.html` que repiten el mismo layout y cargan el mismo `app.js`.

---

## 2. Stack por capas

### 2.1 Marcado y estilo

| Capa | Uso en el proyecto |
|------|---------------------|
| **HTML5** | P�ginas sem�nticas, `lang="es"`, secciones `#page-home`, `#page-catalogue`, `#page-product`, `#page-contact` |
| **CSS3** | Variables CSS (`--accent`, `--bg-card`, etc.), `grid`/`flex`, `aspect-ratio`, media queries |
| **Tema claro/oscuro** | Atributo `data-theme="light"` en `<html>`; persistencia en `localStorage` (`printit-theme`) |
| **Tipograf�a** | Google Fonts � **Montserrat** (`@import` en `styles.css`) |

### 2.2 L�gica cliente

| Archivo | Rol |
|---------|-----|
| **`app.js`** | �nica capa de l�gica compartida: carrusel, navegaci�n entre vistas, cat�logo, tema, comparadores, v�deos, diagn�stico, contexto de producto |
| **Handlers inline** | Muchos botones/enlaces usan `onclick="�"` apuntando a funciones globales definidas en `app.js` |

No hay TypeScript, JSX ni m�dulos ES `import`/`export` en el c�digo del cat�logo principal.

### 2.3 Herramientas opcionales (repo)

| Ruta | Uso |
|------|-----|
| **`.cursor-tools/livereload/`** | Utilidad de recarga en vivo para desarrollo; **no** forma parte del despliegue del cat�logo |

---

## 3. Estructura de directorios (visi�n t�cnica)

```
PRINT-IT-PROP-CATALOGO/
??? index.html                 # Entrada principal: home + cat�logo + producto embebido + contacto
??? app.js                     # L�gica global del sitio
??? styles.css                 # Estilos globales (�nico CSS principal)
??? PROJECT-GUIDE.md           # Gu�a funcional / de contenido
??? techstack/
?   ??? TECH-STACK.md          # Este documento
??? product-*.html             # Fichas por producto/subcategor�a (mismo patr�n que index)
??? sitemap/
?   ??? index.html             # Listado de enlaces a p�ginas
??? assets/
?   ??? img/                   # Categor�as, productos, etc. (rutas limpias)
??? Material Inicial/          # PDFs, v�deos, logos, portadas, perfiler�a PNG�
??? LIGHTBOX /, T�TEMS /, �    # Carpetas con material comercial (nombres con espacio / Unicode)
??? *.png, *.mp4               # A veces activos en ra�z (convenci�n: preferir assets/ para nuevos recursos)
```

**Convenci�n recomendada:** nuevas im�genes/v�deos de interfaz en `assets/img/...` con nombres sin espacios; PDFs y material legacy pueden seguir en carpetas con espacios usando **URL encoding** en `href`/`src`.

---

## 4. Arquitectura de la interfaz (layout)

### 4.1 Dos columnas (`.app`)

1. **`panel-left`** � Escaparate fijo: `#image-showcase` con `#showcase-img` (`<img>` o `<video>`), controles de carrusel, puntos y CTA.
2. **`panel-right`** � Contenedor con scroll de las �p�ginas� (`.page`).

Las `.page` son mutuamente excluyentes mediante la clase **`.active`**.

### 4.2 Vistas (`showPage`)

`showPage('home' | 'catalogue' | 'product' | 'contact')`:

- Activa `#page-{nombre}`.
- Ajusta **hash** en la URL (`#catalogue`, `#product`, �) v�a `replaceAppHashForPage`.
- Actualiza la **media del escaparate** seg�n la vista (ver siguiente secci�n).
- Re-dispara animaciones `.animate-in`.

---

## 5. L�gica central de `app.js`

### 5.1 Carrusel y escaparate (`updateShowcaseImage`)

- El elemento **`#showcase-img`** puede ser **`<img>`** o **`<video>`**.
- Detecta tipo por extensi�n (`.mp4`, `.webm`, `.mov`, `.gif`) y por `tagName`.
- Para **v�deo**: asigna `src`, `load()`, `play()`; casos especiales (posters para ciertos `.mov`).
- Para **imagen sobre v�deo**: usa `poster` en el `<video>` si la fuente ya no es v�deo.
- Transici�n suave con `opacity` / `transform`.

**Constantes** al inicio del archivo definen im�genes por defecto para home, cat�logo, producto gen�rico y contacto.

### 5.2 Acoplamiento cr�tico: galer�a de producto ? escaparate

En la vista **producto**:

1. `getProductGallerySources()` recorre **solo**  
   `#page-product .sheet-media-gallery .product-gallery .gallery-item`  
   y obtiene `src` de `<img>` o de `<source>` / `poster` de `<video>`.
2. `syncProductGalleryToShowcase()` construye `carouselImages` con esas URLs y enlaza **click** en cada celda para llamar a `updateShowcaseImage`.

**Implicaci�n para desarrollo:** si el escaparate muestra una imagen �incorrecta� al cargar, casi siempre es porque **la primera celda** de esa galer�a no coincide con el `src` inicial de `#showcase-img` (el JS sobrescribe al entrar en `#product`).

### 5.3 Cat�logo (`filterCatalogue`, `selectCatalogueItem`)

- P�ldoras `.filter-pill` con `data-filter`: `all`, `lluminaries`, `lightbox`, `totems`, `aeris`, `vesteix`, `rigids`.
- Alterna visibilidad entre `.catalogue-item-simple` (�ndice) y `.catalogue-item-detailed` (fichas ampliadas).
- `selectCatalogueItem` y mini-cards usan `data-img` / `data-label` para el escaparate.

### 5.4 Perfiles P50 / P70 / P100 (`selectVariant`)

- Activa tarjetas `.sheet-profile-card` con `data-profile`.
- Si existe `#schematic-main-image`, cambia la ruta a `Material Inicial/OPCIONES-DE-PERFILERIA/{perfil}.png`.

### 5.5 Tema (`initTheme`, `toggleTheme`)

- `localStorage` + `data-theme` en `<html>`.
- Cambia logos de navegaci�n seg�n modo.

### 5.6 Comparador antes/despu�s (`initBeforeAfterComparators`)

- Bloques `.ba-compare` con `--ba-pos` en CSS enlazado a `<input type="range" class="ba-range">`.

### 5.7 V�deos con bucle �suave� (`initSoftLoopVideos`)

- V�deos con `data-soft-loops`: limita repeticiones con evento `ended` y clase `is-fading`.

### 5.8 Contexto de producto (`PRINTIT_PRODUCT_CONTEXT`)

- Las p�ginas `product-*.html` pueden definir en `<head>`:

  ```js
  window.PRINTIT_PRODUCT_CONTEXT = { category: '�', subcategory: '�' };
  window.location.hash = 'product';
  ```

- `applyProductContextFromPage()` escribe t�tulo, lead y miga en selectores dentro de `#page-product`.

- `DEFAULT_PRODUCT_CONTEXT` en `app.js` es el **fallback** si no hay contexto.

### 5.9 Enrutado por hash (`applyHashRoute`)

- Escucha `hashchange` y al cargar: `#catalogue`, `#product`, `#contact`, anclas de categor�a (`#lightbox`, `#totems`, �) mapeadas a filtros.

### 5.10 Navegaci�n entre HTML (`initProductPageLinkNavigation`)

- Clic en enlaces `href^="product-"` hace `location.href` al otro archivo (multi-page �real�, no solo hash).

### 5.11 Diagn�stico (`initPrintitDiagnostics`)

- Panel `#printit-log-dock`: registro de carga, `file://` vs `http`, errores de recursos (`IMG`/`VIDEO`/`SCRIPT`), `fetch` HEAD a la propia URL, promesas no capturadas.

---

## 6. Hoja de estilos (`styles.css`)

- **Tokens** en `:root` y override en `[data-theme="light"]` (colores, fondos, bordes, acento).
- Componentes: navegaci�n, tarjetas de cat�logo, ficha t�cnica (`.technical-sheet`, `.sheet-table`), galer�as, comparador, footer, diagn�stico.
- **Extensiones por producto** mediante clases en el contenedor, por ejemplo:
  - `.product-spec-sheet--rigidos` � rejillas, chips, flujo visual.
  - `.product-spec-sheet--luxpanel` � KPIs y teselas.
  - `.sheet-media-gallery--two-up` / `--two-equal` � rejillas de galer�a de 2 �tems (anchos desiguales o 50/50).

Convenci�n: subir estilos **acotados** al modificador de la p�gina o familia, en lugar de reglas globales sueltas.

---

## 7. Multientrada: `index.html` vs `product-*.html`

| Entrada | Descripci�n |
|---------|-------------|
| **`index.html`** | Experiencia completa en un archivo (ideal para demo �nica) |
| **`product-*.html`** | Misma plantilla de layout + cat�logo embebido + ficha concreta; hash `#product` en head para abrir directo la ficha |

Ambos incluyen el mismo **`app.js`** (con query string de versi�n en algunos HTML, p. ej. `app.js?v=�`, para invalidar cach�).

---

## 8. Rutas, encoding y medios

- Rutas con **espacios** o **Unicode compuesto** (p. ej. `T�TEMS `, `ficha t�cnica`) deben referenciarse con **`encodeURIComponent`-style** en HTML (`%20`, `%CC%81` para ciertos acentos en NFD).
- **`file://`** rompe rutas y a veces CORS; el diagn�stico lo advierte. Uso recomendado: **`http://localhost:puerto/`**.

---

## 9. �Dependencias� reales

| Tipo | Dependencia |
|------|----------------|
| **Red (runtime)** | Google Fonts (CSS `@import`) |
| **Navegador** | Soporte razonable de CSS Grid, `aspect-ratio`, v�deo HTML5 |
| **Opcional** | Servidor est�tico local |

No hay lockfile ni instalaci�n previa para ver el cat�logo.

---

## 10. C�mo extender la plataforma con criterio

1. **Nueva ficha de producto:** duplicar un `product-*.html` cercano en familia, ajustar `PRINTIT_PRODUCT_CONTEXT`, galer�a `.sheet-media-gallery`, ficha `.technical-sheet` y enlaces PDF/v�deo.
2. **Nuevo estilo de ficha:** preferir clase contenedora (`product-spec-sheet--marca`) en el HTML + bloque CSS dedicado.
3. **Nuevo comportamiento JS:** a�adir funci�n en `app.js` e `init*` desde `DOMContentLoaded` si hace falta; evitar duplicar listeners (patr�n `dataset.previewBound` como referencia).
4. **Escaparate coherente con galer�a:** mantener alineados el **primer** �tem de `.sheet-media-gallery .product-gallery` y `#showcase-img` (tipo y `src`).

---

## 11. Referencias cruzadas

| Documento | Contenido |
|-----------|------------|
| [`PROJECT-GUIDE.md`](../PROJECT-GUIDE.md) | Flujo de cat�logo, filtros, anclas, convenciones de copy |
| `app.js` | Comportamiento l�nea por l�nea |
| `styles.css` | Dise�o y temas |

---

*�ltima actualizaci�n alineada con la estructura del repositorio (cat�logo est�tico Print It).*

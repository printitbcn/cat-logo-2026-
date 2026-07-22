# Print It — Catálogo comercial (PRINT-IT-PROP-CATALOGO)

Guía del proyecto: estructura, comportamiento del catálogo, páginas de producto, diagnóstico y desarrollo local.

---

## 1. Resumen

Sitio **estático** (HTML, CSS, JavaScript sin framework) que presenta el catálogo comercial Print It: navegación tipo SPA dentro de `index.html` (Inicio, Catálogo, Producto, Contacto), listado de categorías con filtros, fichas técnicas en acordeón (`<details>`) y páginas HTML independientes por subcategoría.

---

## 2. Stack técnico

| Capa | Tecnología |
|------|----------------|
| Marcado | HTML5 |
| Estilos | CSS3 (variables, tema claro/oscuro con `data-theme`) |
| Lógica | JavaScript vanilla (`app.js`) |
| Tipografía | Google Fonts — Inter (import en `styles.css`) |
| Servidor local | `python3 -m http.server` (u otro servidor de archivos estáticos) |
| Build / npm | No hay `package.json` ni bundler |

---

## 3. Estructura de archivos (raíz del proyecto)

```
PRINT-IT-PROP-CATALOGO/
├── index.html              # App principal: home, catálogo, producto embebido, contacto
├── app.js                  # Carrusel, navegación entre “páginas”, filtros del catálogo, tema, diagnóstico
├── styles.css              # Estilos globales, catálogo, producto, diagnóstico, responsive
├── PROJECT-GUIDE.md        # Este documento
├── product-*.html          # Páginas de producto por subcategoría (mismo look general)
├── Material Inicial/       # PDFs, vídeo, logo, portada, opciones de perfilería, etc.
├── assets/                 # Imágenes referenciadas (categorías, productos, showroom)
└── (otros)                 # Capturas de prueba, etc., según el entorno
```

**Nota:** Las rutas con espacios (`Material Inicial/...`) deben servirse por HTTP; evitar abrir `index.html` como `file://` para un comportamiento fiable.

---

## 4. Arquitectura de `index.html`

### 4.1 Layout general

- **Columna izquierda (`panel-left`):** imagen destacada / carrusel (`#showcase-img`, controles y puntos).
- **Columna derecha (`panel-right`):** contenido con varias “páginas” en bloques `.page`.

### 4.2 Páginas internas (visibilidad por clase)

| ID | Uso |
|----|-----|
| `page-home` | Inicio, hero, mini-cards hacia categorías |
| `page-catalogue` | Catálogo con barra de filtros y lista `#catalogue-list` |
| `page-product` | Ficha larga tipo “Luminaria ON/OFF — P100” (plantilla de referencia) |
| `page-contact` | Contacto |

La función `showPage('home' | 'catalogue' | 'product' | 'contact', event)` en `app.js` activa una `.page` y ajusta la imagen del escaparate cuando aplica.

---

## 5. Catálogo: índice general vs detalle técnico

### 5.1 Filtros superiores (`filter-pill`)

- **Todos:** solo títulos de sección + filas **simples** (índice de alto nivel).
- **Luminarias, Lightbox, Tótems, Aéreos, Revestimientos, Rígidos:** muestra la categoría filtrada y las filas **detalladas** (con `<details>` y especificaciones).

`data-filter` usa claves internas (`lluminaries`, `lightbox`, `totems`, `aeris`, `vesteix`, `rigids`); la etiqueta visible de **Aéreos** corresponde al filtro `aeris`.

### 5.2 Clases en ítems

- **`catalogue-item-simple`:** visible en vista “Todos”; texto minimalista.
- **`catalogue-item-detailed`:** asignada por JS al resto de filas del listado; visible solo con filtro de categoría (no en “Todos”).

### 5.3 Encabezados de categoría e IDs (anclas)

Para enlaces del tipo `index.html#lightbox` desde páginas de producto o externos:

| ID en `index.html` | Categoría (`data-category`) |
|--------------------|-----------------------------|
| `#luminarias` | `lluminaries` |
| `#lightbox` | `lightbox` |
| `#totems` | `totems` |
| `#aereos` | `aeris` |
| `#revestimientos` | `vesteix` |
| `#rigidos` | `rigids` |

`app.js` (al cargar con hash) abre Catálogo, aplica el filtro correspondiente y hace scroll al ancla. `styles.css` usa `scroll-margin-top` en `.catalogue-section-header` para que el título no quede oculto bajo la cabecera.

### 5.4 Detalle técnico (Lightbox y otras familias)

- Subcategorías en **sentence case** en `<summary>`; especificaciones dentro de `<details>` con filas tipo icono + etiqueta + valor a la derecha.
- Lightbox “a pared” / “a doble cara”: agrupación **Slim** / **Wide** con separación visual (`.tech-pack`).

### 5.5 Enlaces a producto desde el catálogo

- **On - Off (Luminarias):** enlaza al **producto embebido** en `index.html` con `showPage('product', event)` (ficha “LUMINARIA ON / OFF P100”).
- **Resto de subcategorías:** enlaces a `product-<slug>.html` (páginas independientes). Los clics en esos `<a>` usan `stopPropagation` para no disparar solo el cambio de imagen del ítem.

---

## 6. Páginas `product-*.html`

- Una página por subcategoría (nombres lógicos: `product-luxpanel.html`, `product-tunable-white.html`, etc.).
- **Misma estructura que `index.html` en vista catálogo por categoría:** contenedor `.app`, **panel izquierdo** con imagen hero (clase `product-page-showcase`, sin carrusel), **panel derecho** con `top-nav`, **barra de filtros** como enlaces a `index.html` / `index.html#luminarias` / … (pastilla activa según familia), enlace **← VOLVER A …**, bloque **`catalogue-list`** con cabecera de sección (mismo estilo que `#luminarias`, etc.) y filas `catalogue-item-simple` por cada subcategoría (la actual lleva `.active`).
- Debajo, `product-detail-card` (galería reutilizada, descripción, meta) y `footer-bar`.
- Incluyen `app.js` para el **tema** (y no ejecutan la lógica de `#catalogue-list` del índice, que está acotada al listado principal).
- **On - Off** desde una página producto: enlace a `index.html#product` (ver hash `#product` en `app.js` / `applyHashRoute`).
- **Contacto** desde producto: `index.html#contact`.

**Medios:** hasta que existan assets por producto, se reutilizan las mismas imágenes/vídeo que el resto del sitio.

---

## 7. Tema claro / oscuro

- Clave `localStorage`: `printit-theme` (`light` / ausente = oscuro).
- `applyTheme` / `toggleTheme` en `app.js`; botones `.nav-theme-toggle` en las barras de navegación de `index.html`.

---

## 8. Diagnóstico (“Registro de conexión y errores”)

Panel fijo (botón **Diagnóstico**) en `index.html`:

- Registra: URL de carga, `navigator.onLine`, comprobación `HEAD` mismo origen (http/https), errores JS, promesas no capturadas, fallos de carga de `IMG` / `VIDEO` / `SCRIPT` / `LINK`.
- Aviso explícito si se abre con `file://`.
- Botones **Limpiar** y **Copiar registro**.

Útil para distinguir problemas de **servidor caído** o **respuesta vacía** frente a errores de recursos.

---

## 9. Desarrollo local y problemas frecuentes

### 9.1 Servir el proyecto

Desde la raíz del repositorio:

```bash
cd /ruta/a/PRINT-IT-PROP-CATALOGO
python3 -m http.server 5500 --bind 127.0.0.1
```

Abrir: **http://127.0.0.1:5500/** o **http://localhost:5500/**

### 9.1b Red local (LAN) con variables de entorno

Para servir el sitio estático en una IP accesible desde otros equipos del mismo Wi‑Fi:

1. Copia el ejemplo de entorno y edítalo si quieres otro puerto:
   ```bash
   cp .env.example .env
   ```
2. Variables (en `.env`): `PRINTIT_SERVE_HOST` (por defecto `0.0.0.0` = todas las interfaces) y `PRINTIT_SERVE_PORT` (por defecto `8080`).
3. Arranca el servidor:
   ```bash
   ./scripts/serve-lan.sh
   ```
   El script imprime la URL **LAN** sugerida (p. ej. `http://192.168.x.x:8080/`) y deja corriendo `python3 -m http.server`.

En **Cursor / VS Code**: paleta de comandos → **Tasks: Run Task** → **Serve catalog on LAN**.

Si **otro dispositivo no carga** la URL:

- Debe estar en el **mismo Wi‑Fi** que el Mac (no datos móviles). La red **Invitados** a veces tiene **aislamiento de clientes** (AP isolation): impide que dos equipos se hablen; usa la red principal.
- URL con **`http://`**, no `https://`.
- **VPN** desactivada en el Mac o en el otro equipo.
- Comprueba que en `.env` no tengas `PRINTIT_SERVE_HOST=127.0.0.1` si quieres acceso LAN (debe ser `0.0.0.0` o ausente).
- El script imprime **varias IPs** si hay varias interfaces; prueba cada `http://IP:puerto/` mostrada.

### 9.2 ERR_EMPTY_RESPONSE / “Empty reply from server”

Suele indicar un proceso **escuchando en el puerto pero que no responde HTTP** (proceso colgado o incorrecto). Solución: cerrar ese proceso y volver a lanzar `http.server` como arriba.

### 9.3 Navegador integrado vs localhost

Algunos visores embebidos no llegan bien a `localhost`; probar **Chrome/Safari** con la misma URL.

---

## 10. Evolución funcional (línea de tiempo del diseño)

1. Catálogo con secciones **Luminarias, Lightbox, Tótems/Backdrops, Aéreos, Viste tu espacio, Rígidos**.
2. Reorganización **Lightbox** (Luxpanel, pared, doble cara) y texto de **Tótems/Backdrops**.
3. Vista **Todos** como índice simple; **filtro por categoría** muestra detalle técnico en `<details>`.
4. Iconografía SVG minimalista en filas técnicas; agrupaciones Slim/Wide en Lightbox.
5. Páginas **product-*.html** + enlaces desde subcategorías; **On-Off** enlazado a la ficha **Producto** dentro de `index.html`.
6. Anclas `#luminarias`, `#lightbox`, etc., navegación “volver a categoría” y bloque **más productos**.
7. Panel **Diagnóstico** y comprobaciones HTTP / errores de recursos.
8. Ajustes de UX: filtro **Aéreos**, `stopPropagation` en enlaces de producto, hash → catálogo filtrado.

---

## 11. Mantenimiento rápido

| Tarea | Dónde |
|--------|--------|
| Añadir subcategoría en el índice “Todos” | `index.html` — fila `catalogue-item-simple` |
| Añadir detalle técnico | `index.html` — fila `catalogue-item-detailed` + `<details>` |
| Nuevo producto standalone | Nuevo `product-….html` + enlace en catálogo + entrada en la lista “hermanos” del script/plantilla de productos |
| Estilos globales | `styles.css` |
| Lógica de filtros / tema / log | `app.js` |

---

## 12. Contacto y enlaces externos

Datos de contacto y web corporativa están en la página **Contacto** de `index.html` (email, teléfonos, `printitbcn.com`).

---

*Documento generado para el equipo y para futuras ampliaciones del catálogo.*

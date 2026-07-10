# Agent instructions — Print It catalog (PRINT-IT-PROP-CATALOGO)

Static commercial catalog for Print It: HTML, CSS, and vanilla JavaScript. No framework, no `package.json`, no build step.

## Cursor Cloud specific instructions

### Stack

- **Entry:** `index.html` (home, catalogue, embedded product, contact)
- **Logic:** `app.js`
- **Styles:** `styles.css`
- **Product pages:** `product-*.html` (one file per subcategory)
- **Docs:** `PROJECT-GUIDE.md` (content/UX), `Techstack/TECH-STACK.md` (architecture)

### Serving the site (required for testing)

Always serve over HTTP — do not rely on `file://`.

```bash
# Local / cloud preview (loopback)
python3 -m http.server 8080 --bind 127.0.0.1

# LAN preview (phones/tablets on same Wi?Fi)
cp .env.example .env   # optional; defaults are fine
./scripts/serve-lan.sh
```

Open `http://127.0.0.1:8080/` (or the LAN URLs printed by `serve-lan.sh`).

### Dependencies

There is **no** `npm install`. Optional Python tooling for maintenance scripts:

```bash
python3 -m pip install --user imageio-ffmpeg   # for scripts/optimize_catalog_videos.py
```

### Common tasks

| Task | Where |
|------|--------|
| Add catalogue index row | `index.html` — `catalogue-item-simple` |
| Add technical detail row | `index.html` — `catalogue-item-detailed` + `<details>` |
| New standalone product page | New `product-*.html` + catalogue link + `sitemap/` entry |
| Global styles / theme | `styles.css` |
| Filters, theme, showcase, diagnostics | `app.js` |

### Git / PR workflow (cloud agents)

- Branch prefix: `cursor/<descriptive-name>-ab1f`
- Base branch: `main`
- Push: `git push -u origin <branch>`
- Create/update PRs via the ManagePullRequest tool (not `gh pr create`)

### Media and paths

- Legacy folders use spaces and accents (`Material Inicial/`, `DALI : CASSAMBI /`, etc.). URL-encode in `src`/`href` when needed.
- Prefer new UI assets under `assets/img/` with no spaces in filenames.
- Large videos: run `scripts/optimize_catalog_videos.py` only when explicitly asked (rewrites media).

### Deploy

- **GitHub Pages:** workflow `.github/workflows/deploy-pages.yml` pushes `main` to branch `gh-pages`.
- **Vercel:** homepage configured on the repo (`cat-logo-2026.vercel.app`).

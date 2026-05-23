# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BrasilBuzz** (`brasilbuzz.com.br`) is a static Brazilian Portuguese news portal covering health, finance, and well-being. Pure HTML/CSS/JS — no build system, no package manager, no frameworks. Deployed on Netlify.

## Validation Commands

```bash
# Quick validation during development
python .agent/scripts/checklist.py .

# Full suite before deployment (requires a running dev server)
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

There is no build step. To preview locally, serve the root directory with any static server (e.g. `python3 -m http.server 8080`).

## File Structure

```
/                        ← root = Netlify publish root
├── index.html           ← homepage
├── style.css            ← shared styles (article pages, layout, ads)
├── home.css             ← homepage-only styles
├── main.js              ← shared JS (defer loaded)
├── favicon.svg
├── img/                 ← OG images, etc.
├── saude/{slug}/
│   └── index.html       ← article page (references ../../style.css, ../../main.js)
└── netlify.toml         ← cache headers + redirects
```

Category sections planned: `/saude/`, `/financas/`, `/bem-estar/`. Each article lives at `/{categoria}/{slug}/index.html`.

## Architecture

### CSS Strategy
- **Critical CSS is inlined** in each page's `<head>` for fast FCP — covers above-the-fold layout, header, and ad containers.
- Full styles are in `style.css` (shared) and `home.css` (homepage only), loaded via `<link>`.
- **Cache**: CSS/JS files have `max-age=31536000, immutable` (1 year). To bust cache after a change, rename the file. HTML has 5-minute cache.

### Ad System
Ad slots use `.pubad` divs with a `data-pos` attribute. Google AdManager is initialized via a CDN script (`jsadtec`) in each page. Positions:
- `topo` — Leaderboard (728×90 desktop / 320×50 mobile)
- `meio` — In-content (300×250)
- `sidebar` — Halfpage (300×600, desktop ≥1080px only)
- `rodape` — Leaderboard footer

CLS prevention: every `.ad-container` reserves minimum height before the ad loads.

### Sidebar Layout (CSS-only, no JS)
Article pages use a CSS Grid layout (`.page-layout`) that switches to `grid-template-columns: 1fr 320px` at ≥1080px. The sticky sidebar works via `position: sticky` on `.sidebar-sticky`.

**Critical invariant**: `.page-layout` must NOT have `align-items: start` — the default `stretch` is required for the sticky sidebar to function. The sidebar is hidden on mobile via `display: none` on `.article-sidebar`.

### JavaScript
`main.js` is zero-dependency, `defer`-loaded, and targets < 4KB. It uses `IntersectionObserver` for scroll-reveal animations on `.signal-card` and `.protocol-step`, a view-count animation, and passive scroll listener for header shadow. Always respects `prefers-reduced-motion`.

### URL / Path Convention
- Canonical URLs use the trailing-slash directory form: `/saude/7-sinais-silenciosos-pressao-alta/`
- Asset paths in articles are relative: `../../style.css`, `../../main.js`
- Root assets (`favicon.svg`, `/img/`) use absolute paths

### Schema / SEO
- Homepage uses `og:type = website`; articles use `og:type = article` + `Schema.org/Article` markup
- All pages include `fb:app_id`, `twitter:card`, canonical `<link>`, and breadcrumb `BreadcrumbList` (articles)
- `meta name="robots"` is `index, follow` on all pages

## Performance Targets
PageSpeed 90+, CLS < 0.1, LCP < 1.5s

## AG Kit (.agent/)
The `.agent/` directory contains the AG Kit AI agent framework (agents, skills, workflows). It is tooling for AI-assisted development — not part of the site itself and not deployed to Netlify.

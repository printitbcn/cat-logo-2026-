#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Restore classic catalog UI (profile card home, text filter pills, Ver Aplicaciones btn)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CLASSIC_FILTER_BAR = """                <!-- Filter Bar -->
                <div class="filter-bar animate-in">
                    <button class="filter-pill active" data-filter="all"
                        onclick="filterCatalogue('all', this)">Todos</button>
                    <button class="filter-pill" data-filter="lluminaries"
                        onclick="filterCatalogue('lluminaries', this)">Luminarias</button>
                    <button class="filter-pill" data-filter="lightbox"
                        onclick="filterCatalogue('lightbox', this)">Lightbox</button>
                    <button class="filter-pill" data-filter="totems"
                        onclick="filterCatalogue('totems', this)">T\u00f3tems</button>
                    <button class="filter-pill" data-filter="aeris"
                        onclick="filterCatalogue('aeris', this)">A\u00e9reos</button>
                    <button class="filter-pill" data-filter="vesteix"
                        onclick="filterCatalogue('vesteix', this)">Revestimientos</button>
                    <button class="filter-pill" data-filter="rigids"
                        onclick="filterCatalogue('rigids', this)">R\u00edgidos</button>
                </div>"""

CLASSIC_PROFILE_CARD = """                <!-- Profile Card -->
                <div class="profile-card animate-in">
                    <div class="profile-header">
                        <img src="Material Inicial/logo-oficial.png" alt="Print It" class="profile-avatar profile-avatar--logo">
                        <div>
                            <div class="profile-name">Print It</div>
                            <div class="profile-role">Soluciones de impresi\u00f3n premium</div>
                        </div>
                    </div>
                    <p class="profile-description">Soluciones de impresi\u00f3n visual premium para ferias, retail,
                        interiorismo y eventos. Dise\u00f1amos, fabricamos e instalamos sistemas de iluminaci\u00f3n y gran
                        formato que transforman espacios.</p>
                </div>"""

INDEX_HOME_HEAD = """            <!-- PAGE: HOME -->
            <div class="page active" id="page-home">

                <!-- Top Nav -->
                <nav class="top-nav animate-in">
                    <div class="nav-brand">
                        <a href="#" class="nav-brand-link" onclick="showPage('home', event)"
                            aria-label="Print It \u2014 Inicio">
                        </a>
                    </div>
                    <div class="nav-links">
                        <a href="#" class="active" onclick="showPage('home', event)">Inicio</a>
                        <a href="#catalogue" onclick="goToCatalogueAll(event)">Aplicaciones</a>
                        <a href="#" onclick="showPage('contact', event)">Contacto</a>
                        <button type="button" class="nav-theme-toggle" aria-label="Cambiar a modo claro"></button>
                    </div>
                </nav>

                <!-- Profile Card -->
                <div class="profile-card animate-in">
                    <div class="profile-header">
                        <img src="Material Inicial/logo-oficial.png" alt="Print It" class="profile-avatar profile-avatar--logo">
                        <div>
                            <div class="profile-name">Print It</div>
                            <div class="profile-role">Soluciones de impresi\u00f3n premium</div>
                        </div>
                    </div>
                    <p class="profile-description">Soluciones de impresi\u00f3n visual premium para ferias, retail,
                        interiorismo y eventos. Dise\u00f1amos, fabricamos e instalamos sistemas de iluminaci\u00f3n y gran
                        formato que transforman espacios.</p>
                </div>

                <!-- Social / Sector Links -->
                <div class="social-links animate-in">
                    <a href="mailto:roberto.ferrero@printitbcn.com" class="contact-link">
                        Cont\u00e1ctanos
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.5">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </a>
                </div>

                <!-- Latest Work / Categories -->
                <div class="animate-in">
                    <div class="section-row">
                        <h3>
                            Categor\u00edas
                            <span class="arrow-down">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 5v14M19 12l-7 7-7-7" />
                                </svg>
                            </span>
                        </h3>
                        <a href="#catalogue" class="view-all" onclick="goToCatalogueAll(event)">Ver Todo</a>
                    </div>"""

VIEW_BTN_INDEX = """                <!-- View Project -->
                <a href="#catalogue" class="view-project-btn" id="view-project-btn" onclick="goToCatalogueAll(event)">
                    Ver Aplicaciones
                </a>

"""

VIEW_BTN_PRODUCT = """                <!-- View Project -->
                <a href="#" class="view-project-btn" id="view-project-btn" onclick="showProductDetail(event)">
                    Ver Aplicaciones
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                </a>

"""

FILTER_RE = re.compile(
    r"[ \t]*<!-- Filter Bar -->\s*<div class=\"filter-bar animate-in\">.*?</div>",
    re.DOTALL,
)

HOME_BRAND_RE = re.compile(
    r"[ \t]*<!-- Profile Card -->\s*<div class=\"profile-card profile-card--home animate-in\">.*?</div>\s*\n",
    re.DOTALL,
)

INDEX_HOME_RE = re.compile(
    r"<!-- PAGE: HOME -->\s*<div class=\"page active\" id=\"page-home\">.*?<!-- Latest Work / Categories -->\s*<div class=\"animate-in(?: home-page-categories)?\">\s*<div class=\"section-row(?: home-cover-categories-heading)?\">",
    re.DOTALL,
)

FOOTER_BEFORE_HOME_END_RE = re.compile(
    r"\n[ \t]*<footer class=\"home-page-footer social-links animate-in\".*?</footer>\s*\n",
    re.DOTALL,
)


def replace_filter_bar(text: str) -> str:
    return FILTER_RE.sub(CLASSIC_FILTER_BAR, text, count=1)


def replace_home_brand(text: str) -> str:
    if "home-brand-hero" not in text:
        return text
    return HOME_BRAND_RE.sub(CLASSIC_PROFILE_CARD + "\n", text, count=1)


def add_view_project_btn(text: str, *, product: bool) -> str:
    if "view-project-btn" in text:
        return text
    btn = VIEW_BTN_PRODUCT if product else VIEW_BTN_INDEX
    marker = '<span class="selected-label" id="selected-label">'
    if marker not in text:
        return text
    return text.replace(marker, btn + marker, 1)


def restore_index_home(text: str) -> str:
    if "home-cover" not in text:
        return text
    text = INDEX_HOME_RE.sub(INDEX_HOME_HEAD, text, count=1)
    text = FOOTER_BEFORE_HOME_END_RE.sub("\n", text, count=1)
    text = text.replace(
        '<div class="animate-in home-page-categories">',
        '<div class="animate-in">',
        1,
    )
    return text


def main() -> None:
    index = ROOT / "index.html"
    index_text = index.read_text(encoding="utf-8")
    index_text = restore_index_home(index_text)
    index_text = replace_filter_bar(index_text)
    index_text = add_view_project_btn(index_text, product=False)
    index.write_text(index_text, encoding="utf-8")
    print(f"updated {index.name}")

    for path in sorted(ROOT.glob("product-*.html")):
        text = path.read_text(encoding="utf-8")
        text = replace_filter_bar(text)
        text = replace_home_brand(text)
        text = add_view_project_btn(text, product=True)
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.name}")


if __name__ == "__main__":
    main()

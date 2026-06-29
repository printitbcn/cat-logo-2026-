#!/usr/bin/env python3
"""
Sync product page media so header gallery + left showcase match the main
sheet-media-gallery (same on mobile stacked layout and desktop two-column).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_FILES = frozenset(
    {
        "product-custom.html",  # custom layout, no standard galleries
        "product-dali-casambi.html",  # bespoke layout, no sheet-media-gallery
    }
)


def is_div_open(html: str, i: int) -> bool:
    if not html.startswith("<div", i):
        return False
    j = i + 4
    if j >= len(html):
        return False
    return html[j] in " \t\n>/"


def div_block_end(html: str, open_bracket: int) -> int | None:
    """End index (exclusive) of outer <div> that starts at open_bracket."""
    if open_bracket < 0 or open_bracket >= len(html) or html[open_bracket] != "<":
        return None
    gt = html.find(">", open_bracket)
    if gt == -1:
        return None
    pos = gt + 1
    depth = 1
    n = len(html)
    while pos < n:
        if is_div_open(html, pos):
            depth += 1
            pos += 4
            continue
        if html.startswith("</div>", pos):
            depth -= 1
            end = pos + 6
            if depth == 0:
                return end
            pos = end
            continue
        pos += 1
    return None


def extract_inner_product_gallery(html: str, region_start: int, region_end: int) -> tuple[str, int, int] | None:
    """Return (inner HTML between product-gallery tags), abs_start, abs_end for replacement."""
    region = html[region_start:region_end]
    sm = re.search(r'<div class="sheet-media-gallery[^"]*"', region)
    if not sm:
        return None
    rel_pg = region.find('<div class="product-gallery">', sm.start())
    if rel_pg == -1:
        return None
    abs_pg = region_start + rel_pg
    inner_start = abs_pg + len('<div class="product-gallery">')
    end = div_block_end(html, abs_pg)
    if end is None:
        return None
    inner_end = end - len("</div>")
    inner = html[inner_start:inner_end].strip()
    return inner, inner_start, inner_end


def split_gallery_items(inner: str) -> list[str]:
    items: list[str] = []
    pos = 0
    while True:
        m = re.search(r'<div class="gallery-item[^"]*"', inner[pos:])
        if not m:
            break
        start = pos + m.start()
        end = div_block_end(inner, start)
        if end is None:
            break
        items.append(inner[start:end].strip())
        pos = end
    return items


def gallery_item_media_inner(item_outer: str) -> str:
    """Content inside one gallery-item div."""
    gt = item_outer.find(">")
    if gt == -1:
        return ""
    last = item_outer.rfind("</div>")
    if last == -1:
        return ""
    return item_outer[gt + 1 : last].strip()


def inject_showcase_id(media_html: str) -> str:
    m = media_html.lstrip()
    if m.startswith("<img"):
        if 'id="showcase-img"' in m:
            return m
        return re.sub(r"<img\b", '<img id="showcase-img"', m, count=1, flags=re.I)
    if m.startswith("<video"):
        if 'id="showcase-img"' in m:
            return m
        return re.sub(r"<video\b", '<video id="showcase-img"', m, count=1, flags=re.I)
    return media_html


def find_showcase_media_slice(html: str) -> tuple[int, int] | None:
    idx = html.find('id="showcase-img"')
    if idx == -1:
        return None
    tag_start = html.rfind("<", 0, idx)
    if tag_start == -1:
        return None
    if html.startswith("<img", tag_start):
        gt = html.find(">", idx)
        if gt == -1:
            return None
        return tag_start, gt + 1
    if html.startswith("<video", tag_start):
        end = html.find("</video>", tag_start)
        if end == -1:
            return None
        return tag_start, end + len("</video>")
    return None


def replace_header_gallery_inner(html: str, region_start: int, region_end: int, new_inner: str) -> str | None:
    region = html[region_start:region_end]
    hdr = region.find('<div class="product-detail-header">')
    if hdr == -1:
        return None
    abs_hdr = region_start + hdr
    sub = html[abs_hdr:region_end]
    rel_pg = sub.find('<div class="product-gallery">')
    if rel_pg == -1:
        return None
    abs_pg = abs_hdr + rel_pg
    inner_start = abs_pg + len('<div class="product-gallery">')
    end = div_block_end(html, abs_pg)
    if end is None:
        return None
    inner_end = end - len("</div>")
    return html[:inner_start] + "\n" + new_inner + "\n                        " + html[inner_end:]


def build_carousel_dots(n: int) -> str:
    lines = []
    for i in range(n):
        active = " active" if i == 0 else ""
        lines.append(
            f'                    <button type="button" class="carousel-dot{active}" onclick="goToImage({i})" aria-label="Vista {i + 1}"></button>'
        )
    return "\n".join(lines)


def replace_carousel_dots(html: str, n: int) -> str:
    m = re.search(
        r'<div class="carousel-dots" id="carousel-dots">[\s\S]*?</div>',
        html,
    )
    if not m:
        return html
    block = f'<div class="carousel-dots" id="carousel-dots">\n{build_carousel_dots(n)}\n                </div>'
    return html[: m.start()] + block + html[m.end() :]


def process_file(path: Path) -> bool:
    if path.name in SKIP_FILES:
        return False
    text = path.read_text(encoding="utf-8", errors="strict")
    pstart = text.find('<div class="page" id="page-product">')
    if pstart == -1:
        print(f"skip (no page-product): {path.name}")
        return False
    pend = text.find("<!-- PAGE: CONTACT -->", pstart)
    if pend == -1:
        pend = text.find('</div><!-- /page-product -->', pstart)
    if pend == -1:
        print(f"skip (no page-product end): {path.name}")
        return False

    extracted = extract_inner_product_gallery(text, pstart, pend)
    if not extracted:
        print(f"skip (no sheet gallery): {path.name}")
        return False

    inner, _inner_s, _inner_e = extracted
    items = split_gallery_items(inner)
    if not items:
        print(f"skip (no gallery items): {path.name}")
        return False

    new_text = replace_header_gallery_inner(text, pstart, pend, inner)
    if new_text is None:
        print(f"skip (no header gallery): {path.name}")
        return False

    media_inner = gallery_item_media_inner(items[0])
    new_showcase = inject_showcase_id(media_inner)
    ss = find_showcase_media_slice(new_text)
    if ss:
        s0, s1 = ss
        new_text = new_text[:s0] + new_showcase + new_text[s1:]

    new_text = replace_carousel_dots(new_text, len(items))

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        print(f"updated: {path.name} ({len(items)} gallery items)")
        return True
    print(f"unchanged: {path.name}")
    return False


def main() -> int:
    changed = 0
    for p in sorted(ROOT.glob("product-*.html")):
        if process_file(p):
            changed += 1
    print(f"done. files modified: {changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

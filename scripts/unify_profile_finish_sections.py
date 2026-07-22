#!/usr/bin/env python3
"""Remove VISTA TECNICA SECCION schematic blocks; unify profile + finish like product-on-off."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SPEC_SHEET_OPEN = re.compile(
    r'<div class="technical-sheet animate-in product-spec-sheet">'
)

SCHEMATIC_HEADING_ENDS = (
    "VISTA T\u00c9CNICA SECCI\u00d3N</h4>",
    "Vista t\u00e9cnica secci\u00f3n</h4>",
)

SCHEMATIC_FULL_OPEN = '<div class="schematic-placeholder product-schematic-full">'

THUMB_PEEK = """<div class="sheet-profile-thumb sheet-profile-thumb--peek" aria-expanded="false">
                                            <div class="sheet-profile-peek-frame">
                                                <img src="{src}" alt="{alt}">
                                            </div>
                                            <span class="sheet-profile-peek-hint">Ampliar vista t\u00e9cnica</span>
                                        </div>"""

THUMB_SIMPLE = re.compile(
    r'<div class="sheet-profile-thumb">\s*'
    r'<img src="([^"]+)" alt="([^"]*)">\s*'
    r"</div>",
    re.IGNORECASE,
)

PROFILE_ENDS = ("SECCIONES DE PERFIL</h4>", "Secciones de perfil</h4>")
FINISH_END = "OPCIONES DE ACABADOS</h4>"

INTRO_P = re.compile(
    r"\s*<p class=\"product-doc-intro\">[\s\S]*?</p>\s*",
    re.IGNORECASE,
)


def extract_balanced_div(html: str, start: int) -> tuple[str, int] | None:
    if not html.startswith("<div", start):
        return None
    depth = 0
    i = start
    n = len(html)
    while i < n:
        open_div = html.find("<div", i)
        close_div = html.find("</div>", i)
        if close_div == -1:
            return None
        if open_div != -1 and open_div < close_div:
            depth += 1
            i = open_div + 4
            continue
        depth -= 1
        i = close_div + 6
        if depth == 0:
            return html[start:i], i
    return None


def find_div_by_class(html: str, class_needle: str) -> tuple[int, str, int] | None:
    for m in re.finditer(r'<div class="[^"]*' + re.escape(class_needle) + r'[^"]*"', html):
        start = m.start()
        block = extract_balanced_div(html, start)
        if block:
            return start, block[0], block[1]
    return None


def remove_schematic_full_blocks(html: str) -> str:
    for heading_end in SCHEMATIC_HEADING_ENDS:
        while True:
            end = html.find(heading_end)
            if end == -1:
                break
            end += len(heading_end)
            h4_start = html.rfind('<h4 class="product-doc-h2"', 0, end - len(heading_end))
            if h4_start == -1:
                break
            sch_start = html.find(SCHEMATIC_FULL_OPEN, end)
            if sch_start == -1:
                html = html[:h4_start] + html[end:]
                continue
            sch_block = extract_balanced_div(html, sch_start)
            if not sch_block:
                break
            html = html[:h4_start] + "\n" + html[sch_block[1] :]
    return html


def remove_schematic_compact_blocks(html: str) -> str:
    needle = '<div class="schematic-placeholder product-schematic-compact'
    while True:
        start = html.find(needle)
        if start == -1:
            break
        block = extract_balanced_div(html, start)
        if not block:
            break
        html = html[:start] + "\n" + html[block[1] :]
    return html


def remove_schematics(html: str) -> str:
    html = remove_schematic_full_blocks(html)
    html = remove_schematic_compact_blocks(html)
    return html


def upgrade_thumbs(html: str) -> str:
    def repl(m: re.Match) -> str:
        src, alt = m.group(1), m.group(2)
        if not re.search(r"vista t[\u00e9e]cnica", alt, re.I):
            alt = re.sub(r"^Secci[\u00f3o]n\s+", "Vista t\u00e9cnica secci\u00f3n ", alt, flags=re.I)
        return THUMB_PEEK.format(src=src, alt=alt)

    return THUMB_SIMPLE.sub(repl, html)


def extract_section_after_h4(
    html: str, heading_ends: str | tuple[str, ...], div_class: str
) -> tuple[str, str, str] | None:
    ends = (heading_ends,) if isinstance(heading_ends, str) else heading_ends
    for heading_end in ends:
        end_idx = html.find(heading_end)
        if end_idx == -1:
            continue
        h4_start = html.rfind('<h4 class="product-doc-h2"', 0, end_idx)
        if h4_start == -1:
            continue
        h4_end = end_idx + len(heading_end)
        intro_m = INTRO_P.match(html, h4_end)
        after_intro = intro_m.end() if intro_m else h4_end
        div_info = find_div_by_class(html[after_intro:], div_class)
        if not div_info:
            continue
        _, _, div_end = div_info
        block = html[h4_start : after_intro + div_end]
        return html[:h4_start], block, html[after_intro + div_end :]
    return None


def wrap_profile_finish(html: str, *, skip_wrap: bool = False) -> str:
    if skip_wrap or "product-profile-finish-row" in html:
        return html

    profile = extract_section_after_h4(html, PROFILE_ENDS, "sheet-profile-section")
    if not profile:
        return html
    before_profile, profile_block, mid = profile

    finish = extract_section_after_h4(mid, FINISH_END, "finish-swatches")
    if not finish:
        return html
    _, finish_block, after_finish = finish

    row = (
        '\n                    <div class="product-profile-finish-row">\n'
        '                        <div class="product-profile-finish-col product-profile-finish-col--profile">\n'
        f"                            {profile_block.strip()}\n"
        "                        </div>\n"
        '                        <div class="product-profile-finish-col product-profile-finish-col--finish">\n'
        f"                            {finish_block.strip()}\n"
        "                        </div>\n"
        "                    </div>\n"
    )
    return before_profile + row + after_finish


def transform_spec_sheet_inner(html: str, skip_wrap: bool) -> str:
    inner = remove_schematics(html)
    inner = upgrade_thumbs(inner)
    inner = wrap_profile_finish(inner, skip_wrap=skip_wrap)
    return inner


def process_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    m = SPEC_SHEET_OPEN.search(original)
    if not m:
        return False
    div_start = m.start()
    extracted = extract_balanced_div(original, div_start)
    if not extracted:
        return False
    _, end = extracted
    open_end = m.end()
    inner = original[open_end : end - 6]
    skip_wrap = path.name == "product-lightbox-pared.html"
    new_inner = transform_spec_sheet_inner(inner, skip_wrap=skip_wrap)
    if new_inner == inner:
        return False
    updated = original[:open_end] + new_inner + original[end - 6 :]
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    changed = []
    for path in sorted(ROOT.glob("product-*.html")):
        if process_file(path):
            changed.append(path.name)
    print("Updated:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Migrate catalog media into media/ and quarantine unused into revisar/."""

from __future__ import annotations

import json
import re
import shutil
import unicodedata
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
REVISAR = ROOT / "revisar"
MEDIA = ROOT / "media"
MAP_PATH = ROOT / "scripts" / "media-path-map.json"
MANIFEST = REVISAR / "_MANIFEST.md"

KEEP_TOP = {
    "media",
    "revisar",
    "scripts",
    "sitemap",
    "assets",  # may still hold used thumbs until moved
    ".git",
    ".cursor",
    ".cursor-tools",
    ".github",
    ".vscode",
}

TEXT_GLOBS = [
    "index.html",
    "app.js",
    "styles.css",
    "projects.html",
    "projects.js",
    "projects.json",
    "product-*.html",
]

# Broken / legacy refs → existing filesystem paths (pre-migrate)
REF_FIXES: dict[str, str] = {
    "DALI : CASSAMBI /dali cassambi control .mp4": "DIMMER /dimmer - control intensidad .mp4",
    "ON-OFF/ON OFF ARREGLADO .png": "ON-OFF/EXTERIOR ON OFF P100.png",
    "FULL LOGO BLACK .png": "Material Inicial/FULL LOGO BLACK .png",
    "LUXPANEL/lux placements .mp4": "LUXPANEL/luxpanel placements NEW .mov",
    "Material Inicial/PRINTIT Backlite ON-OFF P100+Fronts_ESP.pdf": (
        "FICHAS TÉCNICAS /Fichas Actualizadas /FICHA TÉCNICA_Backlight Suspendido ON-OFF P100+Fronts_ESP.pdf"
    ),
    "FICHA TÉCNICA Led Dynamic_ lightbox autoportante P100 a 1 cara .pdf": (
        "FICHAS TÉCNICAS /Fichas Actualizadas /FICHA TÉCNICA Pixel Led Dynamic_ lightbox autoportante P100 .pdf"
    ),
    "FICHAS%20T%C3%89CNICAS%20/Fichas%20Actualizadas%20/FICHA%20T%C3%89CNICA%20Led%20Dynamic_%20lightbox%20autoportante%20P100%20a%201%20cara%20.pdf": (
        "FICHAS TÉCNICAS /Fichas Actualizadas /FICHA TÉCNICA Pixel Led Dynamic_ lightbox autoportante P100 .pdf"
    ),
    "FICHAS%20T%C3%89CNICAS%20/Fichas%20Actualizadas%20/FICHA%20GENERAL_Totem%20PRINTIT.pdf": (
        "FICHAS TÉCNICAS /Fichas Actualizadas /FICHA GENERAL_Totem PRINTIT.pdf"
    ),
    "FICHAS%20T%C3%89CNICAS%20/Fichas%20Actualizadas%20/FICHA%20T%C3%89CNICA_Backlight%20Suspendido%20ON-OFF%20P100%2BFronts_ESP.pdf": (
        "FICHAS TÉCNICAS /Fichas Actualizadas /FICHA TÉCNICA_Backlight Suspendido ON-OFF P100+Fronts_ESP.pdf"
    ),
}

MEDIA_EXT = {
    ".mp4",
    ".mov",
    ".m4v",
    ".webm",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".pdf",
    ".ico",
}


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "file"


def resolve_existing(ref: str) -> Path | None:
    ref = REF_FIXES.get(ref, ref)
    candidates = [
        ref,
        nfc(ref),
        unicodedata.normalize("NFD", ref),
        unquote(ref),
        nfc(unquote(ref)),
    ]
    for c in candidates:
        p = ROOT / c
        if p.exists() and p.is_file():
            return p.resolve()
    return None


def classify(rel: str) -> str:
    r = rel.lower()
    name = Path(rel).name.lower()

    if rel.startswith("PERFILERIA") or "/perfiler" in r or name.startswith("p3") or name.startswith("m16") or name in {
        "p35.png",
        "p36.png",
        "p50.png",
        "p100.png",
        "p120.png",
        "m1614.png",
    }:
        if "perfiler" in r or rel.startswith("PERFILERIA"):
            return "media/perfiles"
    if name.endswith(".pdf") or "fichas" in r or "ficha" in name:
        return "media/fichas"
    if any(
        x in r
        for x in (
            "logo",
            "portada",
            "material inicial",
            "full logo",
            "make an impression",
        )
    ) and not name.endswith((".mp4", ".mov")):
        if "material inicial" in r or "logo" in name or "portada" in name:
            return "media/brand"
    if "assets/img" in r.replace("\\", "/"):
        if "categor" in r:
            return "media/brand/categories"
        if "product" in r:
            return "media/brand/products"
        if "showroom" in r:
            return "media/brand/showroom"
        return "media/brand"

    # Aplicaciones
    if any(x in r for x in ("on-off", "tunable", "dimmer", "dali", "cassambi", "dynamic white", "pixel led", "luminarias custom", "custom/")):
        return "media/aplicaciones/luminarias"
    if any(x in r for x in ("luxpanel", "lightbox", "cortina")):
        return "media/aplicaciones/lightbox"
    if "totem" in r or "tótems" in r or "totems :" in r:
        return "media/aplicaciones/totems"
    if any(x in r for x in ("aéreos", "aereos", "friso", "cubo", "circular", "banner p35")):
        return "media/aplicaciones/aereos"
    if any(x in r for x in ("vestimos", "voile", "forrado")):
        return "media/aplicaciones/vestimos"
    if "rígido" in r or "rigido" in r or "rígidos" in r or "rigidos" in r:
        return "media/aplicaciones/rigidos"
    if "material inicial" in r and name.endswith((".mp4", ".mov", ".png", ".jpg")):
        return "media/brand"
    return "media/aplicaciones/misc"


def collect_text_files() -> list[Path]:
    files: list[Path] = []
    for g in TEXT_GLOBS:
        files.extend(ROOT.glob(g))
    sm = ROOT / "sitemap"
    if sm.exists():
        files.extend(p for p in sm.rglob("*") if p.is_file())
    # product pages may reference scripts/dual-video-focus.js
    dual = ROOT / "scripts" / "dual-video-focus.js"
    if dual.exists():
        files.append(dual)
    return [f for f in files if f.is_file() and "revisar" not in f.parts]


def extract_refs(text: str) -> set[str]:
    refs: set[str] = set()
    pat = re.compile(
        r"""(?:"|')([^"'${}]+?\.(?:mp4|mov|m4v|webm|png|jpe?g|webp|gif|svg|pdf|ico))(?:\?[^"']*)?(?:"|')""",
        re.I,
    )
    url_pat = re.compile(
        r"""url\(\s*["']?([^"')]+?\.(?:png|jpe?g|webp|gif|svg|ico))(?:\?[^"')]*)?["']?\s*\)""",
        re.I,
    )
    skip = ("http://", "https://", "mailto:", "tel:", "data:", "#", "javascript:")
    for m in pat.findall(text) + url_pat.findall(text):
        r = m.split("?")[0].strip()
        if r.startswith("./"):
            r = r[2:]
        if not r or r.startswith(skip) or "${" in r:
            continue
        refs.add(r)
    return refs


def unique_dest(folder: Path, filename: str) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    dest = folder / filename
    if not dest.exists():
        return dest
    stem = Path(filename).stem
    suf = Path(filename).suffix
    i = 2
    while True:
        cand = folder / f"{stem}-{i}{suf}"
        if not cand.exists():
            return cand
        i += 1


def main() -> None:
    REVISAR.mkdir(exist_ok=True)
    MEDIA.mkdir(exist_ok=True)

    text_files = collect_text_files()
    all_refs: set[str] = set()
    for f in text_files:
        all_refs |= extract_refs(f.read_text(encoding="utf-8", errors="ignore"))

    # Include fix sources so they get migrated
    for old, new in REF_FIXES.items():
        all_refs.add(old)
        all_refs.add(new)

    path_map: dict[str, str] = {}  # any old ref string → new media path
    used_real: dict[Path, str] = {}  # real path → new relative path
    missing: list[str] = []
    moved_used: list[tuple[str, str]] = []

    for ref in sorted(all_refs):
        src = resolve_existing(ref)
        if src is None:
            # try after applying fix only
            fixed = REF_FIXES.get(ref)
            if fixed:
                src = resolve_existing(fixed)
        if src is None:
            if Path(ref).suffix.lower() in MEDIA_EXT:
                missing.append(ref)
            continue

        if src in used_real:
            new_rel = used_real[src]
        else:
            try:
                rel_from_root = str(src.relative_to(ROOT))
            except ValueError:
                rel_from_root = src.name
            folder = ROOT / classify(rel_from_root)
            ext = src.suffix.lower()
            if ext == ".jpeg":
                ext = ".jpg"
            new_name = slugify(src.stem) + ext
            dest = unique_dest(folder, new_name)
            dest.parent.mkdir(parents=True, exist_ok=True)
            if not dest.exists():
                shutil.copy2(src, dest)
            new_rel = str(dest.relative_to(ROOT)).replace("\\", "/")
            used_real[src] = new_rel
            moved_used.append((rel_from_root, new_rel))

        path_map[ref] = used_real[src]
        # also map decoded / nfc variants
        path_map[nfc(ref)] = used_real[src]
        path_map[unquote(ref)] = used_real[src]
        if ref in REF_FIXES:
            path_map[REF_FIXES[ref]] = used_real[src]

    # Rewrite text files: longest keys first
    keys = sorted(path_map.keys(), key=len, reverse=True)
    rewrite_count = 0
    for f in text_files:
        original = f.read_text(encoding="utf-8", errors="ignore")
        text = original
        for old in keys:
            new = path_map[old]
            if old == new:
                continue
            if old in text:
                text = text.replace(old, new)
            # URL-encoded form of absolute-ish paths
            enc = old.replace(" ", "%20")
            if enc != old and enc in text:
                text = text.replace(enc, new)
        # lux placements CSS/js selectors → new luxpanel placements slug
        text = text.replace("lux placements", "luxpanel-placements-new")
        if text != original:
            f.write_text(text, encoding="utf-8")
            rewrite_count += 1

    # Quarantine: move unused top-level media dirs and leftover files
    quarantine_moves: list[str] = []

    def quarantine(path: Path, dest_subdir: str = "") -> None:
        if not path.exists():
            return
        target_root = REVISAR / dest_subdir if dest_subdir else REVISAR
        target_root.mkdir(parents=True, exist_ok=True)
        dest = target_root / path.name
        if dest.exists():
            dest = target_root / f"{path.name}__{path.stat().st_mtime_ns}"
        shutil.move(str(path), str(dest))
        quarantine_moves.append(f"{path.name} → revisar/{dest_subdir}/{dest.name}".replace("//", "/"))

    # Known junk / archive tops
    junk_names = [
        "_tmp_friso_illum",
        "_tmp_m1614",
        "_video-originals",
        "Print It — Luminarias (compartir)",
        "Print It — Luminarias (compartir).zip",
        "gráficas ",
        "totems :photocalls : backdrops ",
        "parte 1 ",
        "Techstack",
        "LOGS",
        "review",
        "Material Inicial",
        "CUSTOM",
        "PORTADA 3 PRINT IT.png",
        "PRINTIT Backlight P50.pdf",
        "PRINTIT Backlight P70.pdf",
    ]
    # Product media source folders (after copy to media/)
    source_media_dirs = [
        "AÉREOS ",
        "DIMMER ",
        "DYNAMIC WHITE ",
        "FICHAS TÉCNICAS ",
        "LIGHTBOX ",
        "LUMINARIAS CUSTOM ",
        "LUXPANEL",
        "ON-OFF",
        "PERFILERIA ",
        "PIXEL LED",
        "RÍGIDOS ",
        "TÓTEMS ",
        "TUNABLE WHITE ",
        "VOILE ",
        "vestimos tu espacio ",
    ]

    for name in junk_names + source_media_dirs:
        p = ROOT / name
        # NFC/NFD variants
        if not p.exists():
            for cand in ROOT.iterdir():
                if nfc(cand.name) == nfc(name) or unicodedata.normalize("NFD", cand.name) == unicodedata.normalize(
                    "NFD", name
                ):
                    p = cand
                    break
        if p.exists() and p.name not in KEEP_TOP:
            quarantine(p, "origen")

    # Move leftover assets/ content that wasn't needed? Keep assets if still referenced;
    # if assets still has files and path_map pointed into media, move remaining assets to revisar
    assets = ROOT / "assets"
    if assets.exists():
        # If any refs still start with assets/, keep; else quarantine whole
        still = any(v.startswith("assets/") for v in path_map.values()) or any(
            "assets/" in k for k in path_map if resolve_existing(k) and "assets" in str(resolve_existing(k))
        )
        # After rewrite, text should use media/. Quarantine leftover assets tree.
        # But only if no text still references assets/
        remaining_refs = False
        for f in collect_text_files():
            t = f.read_text(encoding="utf-8", errors="ignore")
            if re.search(r'assets/', t):
                remaining_refs = True
                break
        if not remaining_refs:
            quarantine(assets, "origen")

    # Audit files from earlier
    for name in ("_audit_refs_exist.txt", "_audit_refs_missing.txt", "_audit_refs_all.txt"):
        p = ROOT / name
        if p.exists():
            quarantine(p, "audit")

    MAP_PATH.write_text(json.dumps(path_map, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")

    lines = [
        "# Manifest migración catálogo web",
        "",
        f"- Assets usados copiados a `media/`: **{len(used_real)}**",
        f"- Archivos de texto reescritos: **{rewrite_count}**",
        f"- Refs sin archivo: **{len(missing)}**",
        f"- Movidos a `revisar/`: **{len(quarantine_moves)}**",
        "",
        "## Usados → media/",
    ]
    for a, b in sorted(moved_used):
        lines.append(f"- `{a}` → `{b}`")
    lines.append("")
    lines.append("## Cuarentena")
    for m in quarantine_moves:
        lines.append(f"- {m}")
    lines.append("")
    lines.append("## Missing / sin resolver")
    for m in missing:
        lines.append(f"- `{m}`")
    MANIFEST.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"copied={len(used_real)} rewritten={rewrite_count} quarantined={len(quarantine_moves)} missing={len(missing)}")
    for m in missing[:30]:
        print("MISSING", m)


if __name__ == "__main__":
    main()

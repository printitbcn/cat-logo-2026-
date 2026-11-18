#!/usr/bin/env python3
"""Upscale project videos below 1080p to Full HD (Lanczos + H.264 CRF 19).

Originals are never modified. Output tree: videos_1080p/<relative-path>.mp4
Skips videos already ≥1080p (height ≥ 1080, or portrait width ≥ 1080).
Excludes: .git, .venv*, videos_1080p, node_modules, revisar/
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_ROOT = Path(os.environ.get("OUT_ROOT", ROOT / "videos_1080p"))
REPORT = Path(os.environ.get("REPORT", OUT_ROOT / "REPORT-1080p.md"))
TARGET_H = 1080
CRF = os.environ.get("CRF", "19")
PRESET = os.environ.get("PRESET", "medium")
VIDEO_EXTS = {".mp4", ".mov", ".webm", ".m4v", ".mkv", ".avi"}
SKIP_DIR_NAMES = {".git", "videos_1080p", "node_modules", "revisar"}


def find_ffmpeg() -> tuple[str, str]:
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if ffmpeg and ffprobe:
        return ffmpeg, ffprobe
    bundled = list((ROOT / ".venv-optimize").glob("**/imageio_ffmpeg/binaries/ffmpeg-*"))
    bundled = [p for p in bundled if p.is_file() and os.access(p, os.X_OK)]
    if bundled:
        print(
            "Aviso: FFmpeg de sistema no encontrado; usando binario imageio_ffmpeg.\n"
            "Para instalar en macOS: brew install ffmpeg",
            file=sys.stderr,
        )
        return str(bundled[0]), str(bundled[0])
    print(
        "ERROR: FFmpeg no está instalado.\n"
        "  macOS:  brew install ffmpeg\n"
        "  Ubuntu: sudo apt install ffmpeg",
        file=sys.stderr,
    )
    sys.exit(1)


def should_prune(path: Path) -> bool:
    name = path.name
    if name in SKIP_DIR_NAMES:
        return True
    if name.startswith(".venv"):
        return True
    return False


def iter_videos(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        p = Path(dirpath)
        dirnames[:] = [d for d in dirnames if not should_prune(p / d)]
        for fn in filenames:
            fp = p / fn
            if fp.suffix.lower() in VIDEO_EXTS:
                yield fp


def probe_stream(ffprobe: str, ffmpeg: str, path: Path) -> dict:
    """Return width, height, has_audio."""
    if Path(ffprobe).name == "ffprobe" or "ffprobe" in ffprobe:
        try:
            out = subprocess.check_output(
                [
                    ffprobe,
                    "-v",
                    "error",
                    "-select_streams",
                    "v:0",
                    "-show_entries",
                    "stream=width,height",
                    "-of",
                    "json",
                    str(path),
                ],
                stderr=subprocess.DEVNULL,
                text=True,
            )
            data = json.loads(out)
            streams = data.get("streams") or []
            if streams:
                w = int(streams[0].get("width") or 0)
                h = int(streams[0].get("height") or 0)
            else:
                w = h = 0
            a = subprocess.run(
                [
                    ffprobe,
                    "-v",
                    "error",
                    "-select_streams",
                    "a:0",
                    "-show_entries",
                    "stream=codec_type",
                    "-of",
                    "csv=p=0",
                    str(path),
                ],
                capture_output=True,
                text=True,
            )
            has_audio = bool(a.stdout.strip())
            return {"width": w, "height": h, "has_audio": has_audio}
        except (subprocess.CalledProcessError, json.JSONDecodeError, ValueError):
            pass

    # Fallback: parse ffmpeg -i
    proc = subprocess.run(
        [ffmpeg, "-i", str(path)],
        capture_output=True,
        text=True,
    )
    err = proc.stderr or ""
    w = h = 0
    import re

    m = re.search(r"(\d{2,5})x(\d{2,5})", err)
    if m:
        w, h = int(m.group(1)), int(m.group(2))
    has_audio = "Audio:" in err
    return {"width": w, "height": h, "has_audio": has_audio}


def human_size(n: int) -> str:
    x = float(n)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if x < 1024 or unit == "TB":
            return f"{x:.0f} {unit}" if unit == "B" else f"{x:.1f} {unit}"
        x /= 1024
    return f"{n} B"


def is_already_1080p(w: int, h: int) -> bool:
    """Skip if already Full HD or higher (short side ≥ 1080)."""
    return min(w, h) >= TARGET_H


def scale_filter(w: int, h: int) -> str:
    # Scale so the short side becomes 1080; keep AR; even dims via -2
    if h >= w:
        # Portrait / square-tall: width → 1080
        return "scale=1080:-2:flags=lanczos"
    # Landscape: height → 1080
    return "scale=-2:1080:flags=lanczos"


def main() -> int:
    ffmpeg, ffprobe = find_ffmpeg()
    OUT_ROOT.mkdir(parents=True, exist_ok=True)

    videos = sorted(iter_videos(ROOT))
    print("== Print It · upscale → 1080p ==")
    print(f"Root:   {ROOT}")
    print(f"Output: {OUT_ROOT}")
    print(f"FFmpeg: {ffmpeg}")
    print(f"Vídeos: {len(videos)} (excl. revisar/, .venv, .git)")
    print()

    rows: list[str] = []
    processed = skipped = failed = 0

    for src in videos:
        rel = src.relative_to(ROOT).as_posix()
        info = probe_stream(ffprobe, ffmpeg, src)
        w, h = info["width"], info["height"]
        if not w or not h:
            print(f"SKIP (sin vídeo): {rel}")
            rows.append(f"| `{rel}` | — | — | — | sin stream vídeo |")
            skipped += 1
            continue

        if is_already_1080p(w, h):
            print(f"SKIP (≥1080p): {rel}  {w}x{h}")
            rows.append(f"| `{rel}` | {w}×{h} | — | — | omitido (≥1080p) |")
            skipped += 1
            continue

        out_rel = Path(rel).with_suffix(".mp4")
        dest = OUT_ROOT / out_rel
        dest.parent.mkdir(parents=True, exist_ok=True)

        if dest.exists():
            size = dest.stat().st_size
            print(f"SKIP (salida existe): {out_rel.as_posix()}")
            rows.append(
                f"| `{rel}` | {w}×{h} | (existente) | {human_size(size)} | omitido (salida ya existe) |"
            )
            skipped += 1
            continue

        vf = scale_filter(w, h)
        cmd = [
            ffmpeg,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-stats",
            "-i",
            str(src),
            "-vf",
            vf,
            "-c:v",
            "libx264",
            "-preset",
            PRESET,
            "-crf",
            CRF,
            "-pix_fmt",
            "yuv420p",
        ]
        if info["has_audio"]:
            cmd += ["-c:a", "aac", "-b:a", "192k"]
        else:
            cmd += ["-an"]
        # Preserve fps / timing (default copy of pts); no -r → keep source rate
        cmd += ["-movflags", "+faststart", str(dest)]

        print(f"PROCESS: {rel}  {w}x{h} → {vf}")
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError:
            print(f"FAIL: {rel}")
            rows.append(f"| `{rel}` | {w}×{h} | — | — | error ffmpeg |")
            failed += 1
            if dest.exists():
                dest.unlink()
            continue

        if not dest.exists():
            rows.append(f"| `{rel}` | {w}×{h} | — | — | error (sin salida) |")
            failed += 1
            continue

        out_info = probe_stream(ffprobe, ffmpeg, dest)
        nw, nh = out_info["width"], out_info["height"]
        size = dest.stat().st_size
        print(f"  OK → {nw}x{nh}  {human_size(size)}")
        rows.append(f"| `{rel}` | {w}×{h} | {nw}×{nh} | {human_size(size)} | procesado |")
        processed += 1

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with REPORT.open("w", encoding="utf-8") as f:
        f.write("# Informe upscale 1080p\n\n")
        f.write(f"- Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"- Origen: `{ROOT}`\n")
        f.write(f"- Destino: `{OUT_ROOT}`\n")
        f.write(f"- CRF: {CRF} · preset: {PRESET} · filtro: lanczos\n")
        f.write(f"- Umbral: altura < {TARGET_H}p (se omiten ≥1080p)\n")
        f.write("- Nota: se excluyen `revisar/`, `.venv*`, `.git`, `videos_1080p`\n\n")
        f.write("| Archivo | Resolución original | Resolución nueva | Tamaño salida | Estado |\n")
        f.write("|---|---|---|---|---|\n")
        for row in rows:
            f.write(row + "\n")
        f.write("\n## Resumen\n\n")
        f.write(f"- Encontrados: **{len(videos)}**\n")
        f.write(f"- Procesados: **{processed}**\n")
        f.write(f"- Omitidos: **{skipped}**\n")
        f.write(f"- Errores: **{failed}**\n")

    print()
    print(f"Informe: {REPORT}")
    print(f"Procesados={processed}  Omitidos={skipped}  Errores={failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())

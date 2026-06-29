#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Normalize catalog videos: min 1080p short side, max 1920p long side, web-friendly H.264."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    import imageio_ffmpeg
except ImportError:
    print("Install imageio-ffmpeg: python3 -m pip install imageio-ffmpeg", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
BACKUP_DIR = ROOT / "_video-originals"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

MIN_SHORT = 1080
MAX_LONG = 1920
CRF = 24
MAXRATE = "6M"
BUFSIZE = "12M"
BYTES_PER_SECOND_BUDGET = 0.55 * 1024 * 1024

VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm"}


def probe(path: Path) -> dict | None:
    cmd = [FFMPEG, "-hide_banner", "-i", str(path), "-f", "null", "-"]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    text = proc.stderr
    m = re.search(r"yuv\d+p(?:\([^)]*\))?,\s*(\d{2,5})x(\d{2,5})", text)
    if not m:
        m = re.search(r",\s*(\d{2,5})x(\d{2,5}),", text)
    if not m:
        return None
    codec = "unknown"
    codec_m = re.search(r"Video: (\S+)", text)
    if codec_m:
        codec = codec_m.group(1)
    w, h = int(m.group(1)), int(m.group(2))
    dur_m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", text)
    duration = 0.0
    if dur_m:
        duration = int(dur_m.group(1)) * 3600 + int(dur_m.group(2)) * 60 + float(dur_m.group(3))
    return {"codec": codec, "width": w, "height": h, "duration": duration}


def target_size(width: int, height: int) -> tuple[int, int]:
    w, h = float(width), float(height)
    if w <= 0 or h <= 0:
        return MIN_SHORT, MIN_SHORT
    short, long_ = (w, h) if w <= h else (h, w)
    if short < MIN_SHORT:
        scale = MIN_SHORT / short
        w = round(w * scale)
        h = round(h * scale)
        short, long_ = (w, h) if w <= h else (h, w)
    if long_ > MAX_LONG:
        scale = MAX_LONG / long_
        w2 = round(w * scale)
        h2 = round(h * scale)
        if min(w2, h2) >= MIN_SHORT:
            w, h = w2, h2
    w -= int(w) % 2
    h -= int(h) % 2
    return max(w, 2), max(h, 2)


def needs_work(src: dict, size_bytes: int) -> tuple[bool, str]:
    w, h = src["width"], src["height"]
    short, long_ = min(w, h), max(w, h)
    tw, th = target_size(w, h)
    duration = src.get("duration") or 10.0
    budget = max(2 * 1024 * 1024, duration * BYTES_PER_SECOND_BUDGET)

    if short < MIN_SHORT:
        return True, f"upscale {w}x{h} -> {tw}x{th}"
    if long_ > MAX_LONG:
        return True, f"downscale {w}x{h} -> {tw}x{th}"
    if size_bytes > budget * 1.15:
        return True, f"re-encode {size_bytes / 1048576:.1f}MB > budget {budget / 1048576:.1f}MB"
    return False, f"ok {w}x{h} {size_bytes / 1048576:.1f}MB"


def encode(src: Path, dst: Path, tw: int, th: int) -> None:
    vf = f"scale={tw}:{th}:flags=lanczos"
    cmd = [
        FFMPEG,
        "-y",
        "-i",
        str(src),
        "-an",
        "-vf",
        vf,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        str(CRF),
        "-maxrate",
        MAXRATE,
        "-bufsize",
        BUFSIZE,
        "-profile:v",
        "high",
        "-level",
        "4.1",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(dst),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def iter_videos() -> list[Path]:
    out: list[Path] = []
    for dirpath, _dirnames, filenames in os.walk(ROOT):
        if ".git" in dirpath.split(os.sep) or "_video-originals" in dirpath:
            continue
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() in VIDEO_EXTS and ".optimizing." not in name:
                out.append(p)
    return sorted(out)


def main() -> int:
    dry = "--dry-run" in sys.argv
    report: list[dict] = []
    BACKUP_DIR.mkdir(exist_ok=True)

    for path in iter_videos():
        rel = path.relative_to(ROOT)
        size = path.stat().st_size
        info = probe(path)
        if not info:
            report.append({"file": str(rel), "status": "skip", "reason": "probe failed"})
            continue

        work, reason = needs_work(info, size)
        tw, th = target_size(info["width"], info["height"])
        row = {
            "file": str(rel),
            "from": f"{info['width']}x{info['height']}",
            "to": f"{tw}x{th}",
            "size_mb": round(size / 1048576, 2),
            "reason": reason,
        }

        if not work:
            row["status"] = "kept"
            report.append(row)
            continue

        if dry:
            row["status"] = "would_encode"
            report.append(row)
            print(f"would_encode {rel} - {reason}")
            continue

        tmp = path.with_suffix(path.suffix + ".optimizing.mp4")
        try:
            encode(path, tmp, tw, th)
            new_size = tmp.stat().st_size
            row["new_size_mb"] = round(new_size / 1048576, 2)

            backup = BACKUP_DIR / rel
            backup.parent.mkdir(parents=True, exist_ok=True)
            if not backup.exists():
                shutil.copy2(path, backup)

            resolution_changed = (tw, th) != (info["width"], info["height"])
            if resolution_changed or new_size < size * 0.98:
                shutil.move(str(tmp), str(path))
                row["status"] = "optimized"
            else:
                tmp.unlink(missing_ok=True)
                row["status"] = "kept"
                row["reason"] += " (encode not smaller)"
        except subprocess.CalledProcessError as exc:
            tmp.unlink(missing_ok=True)
            row["status"] = "error"
            row["reason"] = (exc.stderr or b"").decode(errors="replace")[-400:]
        report.append(row)
        print(f"{row['status']:10} {rel} - {reason}")

    rhino_src = ROOT / "Material Inicial" / "Video-Render-Rhino.mov"
    rhino_dst = ROOT / "Material Inicial" / "COMPRIMIDOVideo-Render-Rhino.mp4"
    if rhino_src.exists() and not rhino_dst.exists() and not dry:
        info = probe(rhino_src)
        if info:
            tw, th = target_size(info["width"], info["height"])
            print(f"generating {rhino_dst.name} from {rhino_src.name}")
            encode(rhino_src, rhino_dst, tw, th)
            report.append({"file": str(rhino_dst.relative_to(ROOT)), "status": "generated"})

    summary_path = ROOT / "scripts" / "video-optimization-report.json"
    summary_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    optimized = sum(1 for r in report if r.get("status") == "optimized")
    kept = sum(1 for r in report if r.get("status") == "kept")
    print(f"\nDone: {optimized} optimized, {kept} kept. Report: {summary_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

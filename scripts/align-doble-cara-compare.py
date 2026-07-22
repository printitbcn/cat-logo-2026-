#!/usr/bin/env python3
"""Place exterior (and optionally interior) into compare/ without perspective warp.

Exterior comes from lightbox completo def .jpg, scaled uniformly and centered
on the estructura bounding box so it stays straight (no shear/deform).
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "LIGHTBOX /doble cara "
OUT = BASE / "compare"
T = 1400
SRC_EXTERIOR = BASE / "lightbox completo def .jpg"


def bbox(im: Image.Image, thr: float = 18):
    L = np.asarray(im.convert("L"), np.float32)
    mask = L > thr
    ys, xs = np.where(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def place_straight(src: Image.Image, master: Image.Image) -> Image.Image:
    """Uniform scale + center on master content bbox (no perspective)."""
    ex0, ey0, ex1, ey1 = bbox(master)
    sx0, sy0, sx1, sy1 = bbox(src)
    pad = 8
    crop = src.crop(
        (
            max(0, sx0 - pad),
            max(0, sy0 - pad),
            min(src.width, sx1 + pad + 1),
            min(src.height, sy1 + pad + 1),
        )
    )
    tw, th = ex1 - ex0 + 1, ey1 - ey0 + 1
    cw, ch = crop.size
    scale = min(tw / cw, th / ch)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (T, T), (0, 0, 0))
    cx = (ex0 + ex1) / 2
    cy = (ey0 + ey1) / 2
    canvas.paste(resized, (int(round(cx - nw / 2)), int(round(cy - nh / 2))))
    return canvas


def main():
    est = Image.open(OUT / "estructura.png").convert("RGB")
    src = Image.open(SRC_EXTERIOR).convert("RGB")
    ext = place_straight(src, est)
    ext.save(OUT / "exterior.jpg", quality=95, optimize=True)
    ext.save(OUT / "exterior.png")
    print(f"Wrote straight exterior ? {OUT}")


if __name__ == "__main__":
    main()

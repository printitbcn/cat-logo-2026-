#!/usr/bin/env python3
"""Align doble-cara ba-compare layers so the curtain outer edge does not jump.

1. Warp exterior (completo) onto estructura panel (convex-hull homography + refine).
2. Warp estructura onto that exterior footprint.
3. Multiply BOTH by the same filled outer matte (from exterior silhouette)
   so left/right/top/bottom product edges are pixel-identical.
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "LIGHTBOX /doble cara "
OUT = BASE / "compare"
T = 1400
SRC_EXTERIOR = BASE / "lightbox completo def .jpg"
SRC_INTERIOR = OUT / "estructura.png"


def load_pad(path: Path, size: int = T) -> np.ndarray:
    im = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if im is None:
        raise FileNotFoundError(path)
    if im.ndim == 3 and im.shape[2] == 4:
        a = im[:, :, 3:4].astype(np.float32) / 255.0
        im = (im[:, :, :3].astype(np.float32) * a).astype(np.uint8)
    h, w = im.shape[:2]
    if h == size and w == size:
        return im[:, :, :3].copy()
    out = np.zeros((size, size, 3), np.uint8)
    x = (size - w) // 2
    y = (size - h) // 2
    out[y : y + h, x : x + w] = im[:, :, :3]
    return out


def sil_full(img: np.ndarray, thr: int = 12) -> np.ndarray:
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    m = (g > thr).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8), 2)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m)
    idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return np.where(lab == idx, 255, 0).astype(np.uint8)


def body_mask(img: np.ndarray, thr: int = 12) -> np.ndarray:
    m = sil_full(img, thr)
    has = m > 0
    xl = np.argmax(has, 1)
    xr = m.shape[1] - 1 - np.argmax(has[:, ::-1], 1)
    w = np.where(has.any(1), xr - xl, 0)
    med = float(np.median(w[w > 80])) if np.any(w > 80) else 0.0
    ys = np.where(w > 0.78 * med)[0]
    body = m.copy()
    if len(ys):
        body[int(ys[-1]) + 1 :] = 0
    return body


def hull_corners(m: np.ndarray) -> np.ndarray:
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=cv2.contourArea)
    hull = cv2.convexHull(c).reshape(-1, 2).astype(np.float32)
    s = hull[:, 0] + hull[:, 1]
    d = hull[:, 0] - hull[:, 1]
    return np.float32(
        [hull[np.argmin(s)], hull[np.argmax(d)], hull[np.argmax(s)], hull[np.argmin(d)]]
    )


def filled_hull(m: np.ndarray) -> np.ndarray:
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=cv2.contourArea)
    out = np.zeros_like(m)
    cv2.drawContours(out, [cv2.convexHull(c)], -1, 255, -1)
    return out


def refine_scale_translate(src_mask: np.ndarray, dst_mask: np.ndarray) -> tuple[float, int, int]:
    best_iou = float(((src_mask > 0) & (dst_mask > 0)).sum()) / float(
        ((src_mask > 0) | (dst_mask > 0)).sum() + 1e-6
    )
    best = (1.0, 0, 0)
    for s in np.linspace(0.985, 1.015, 7):
        for dy in range(-20, 21, 2):
            for dx in range(-20, 21, 2):
                M = np.float32([[s, 0, (1 - s) * T / 2 + dx], [0, s, (1 - s) * T / 2 + dy]])
                mw = cv2.warpAffine(src_mask, M, (T, T), flags=cv2.INTER_NEAREST)
                sc = float(((dst_mask > 0) & (mw > 0)).sum()) / float(
                    ((dst_mask > 0) | (mw > 0)).sum() + 1e-6
                )
                if sc > best_iou:
                    best_iou = sc
                    best = (float(s), dx, dy)
    return best


def main() -> None:
    if not SRC_EXTERIOR.exists():
        raise SystemExit(f"Missing exterior source: {SRC_EXTERIOR}")
    if not SRC_INTERIOR.exists():
        raise SystemExit(f"Missing interior master: {SRC_INTERIOR}")

    ext_src = load_pad(SRC_EXTERIOR)
    inn0 = cv2.imread(str(SRC_INTERIOR))
    if inn0 is None or inn0.shape[0] != T:
        inn0 = load_pad(SRC_INTERIOR)

    # Exterior → estructura panel
    ce = hull_corners(body_mask(ext_src))
    ci = hull_corners(body_mask(inn0))
    H = cv2.getPerspectiveTransform(ce, ci)
    ext1 = cv2.warpPerspective(ext_src, H, (T, T), flags=cv2.INTER_LANCZOS4)
    s, dx, dy = refine_scale_translate(body_mask(ext1), body_mask(inn0))
    M = np.float32([[s, 0, (1 - s) * T / 2 + dx], [0, s, (1 - s) * T / 2 + dy]])
    ext = cv2.warpAffine(ext1, M, (T, T), flags=cv2.INTER_LANCZOS4)

    # Interior → exterior full silhouette
    fe = filled_hull(sil_full(ext))
    fi = filled_hull(sil_full(inn0))
    H2 = cv2.getPerspectiveTransform(hull_corners(fi), hull_corners(fe))
    inn1 = cv2.warpPerspective(inn0, H2, (T, T), flags=cv2.INTER_LANCZOS4)

    best_inn = inn1
    best_sc = 1e9
    best_d = (0, 0)
    fe = filled_hull(sil_full(ext))
    for ndy in range(-15, 16):
        for ndx in range(-15, 16):
            cand = cv2.warpAffine(inn1, np.float32([[1, 0, ndx], [0, 1, ndy]]), (T, T))
            fi = filled_hull(sil_full(cand))
            errs: list[float] = []
            for y in range(200, 1300, 6):
                xe = np.where(fe[y] > 0)[0]
                xi = np.where(fi[y] > 0)[0]
                if len(xe) and len(xi):
                    errs.append(abs(int(xe[0]) - int(xi[0])) + abs(int(xe[-1]) - int(xi[-1])))
            sc = float(np.mean(errs)) if errs else 999.0
            if sc < best_sc:
                best_sc = sc
                best_inn = cand
                best_d = (ndx, ndy)

    matte = filled_hull(sil_full(ext)).astype(np.float32) / 255.0
    matte_f = matte[..., None]
    ext_out = (ext.astype(np.float32) * matte_f).astype(np.uint8)
    inn_out = (best_inn.astype(np.float32) * matte_f).astype(np.uint8)

    OUT.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT / "exterior.jpg"), ext_out, [cv2.IMWRITE_JPEG_QUALITY, 95])
    cv2.imwrite(str(OUT / "exterior.png"), ext_out)
    cv2.imwrite(str(OUT / "interior.png"), inn_out)
    print(f"Wrote compare assets → {OUT}")
    print(f"  exterior refine scale/dx/dy=({s}, {dx}, {dy})")
    print(f"  interior nudge dx/dy={best_d} edge_score={best_sc:.3f}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Align lightbox doble-cara exterior/interior for ba-compare."""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "media/aplicaciones/lightbox"
ASSETS = Path(
    "/Users/printitprojects/.cursor/projects/"
    "Users-printitprojects-Desktop-STEPH-PRINT-IT-Design-Web-Brochure-2026-PRINT-IT-PROP-CATALOGO/"
    "assets"
)

EXT_SRC = OUT / "lightbox doble cara encendido .png"
INN_SRC = ASSETS / "lightbox_on_interior_-f7805a6d-c0fd-40b2-b2fd-917e1bac2172.jpg"


def find_frame(lum):
    h, w = lum.shape
    vis = lum > 25
    ys, xs = np.where(vis)
    y0, y1 = int(ys.min()), int(ys.max())
    mid0, mid1 = int(y0 + 0.3 * (y1 - y0)), int(y0 + 0.65 * (y1 - y0))
    lefts, rights = [], []
    for y in range(mid0, mid1):
        cols = np.where(vis[y])[0]
        if len(cols) > 50:
            lefts.append(int(cols[0]))
            rights.append(int(cols[-1]))
    left, right = int(np.median(lefts)), int(np.median(rights))
    fw = right - left + 1
    top = y0
    for y in range(y0, y0 + int(0.2 * (y1 - y0))):
        if (vis[y, left : right + 1]).sum() >= fw * 0.9:
            top = y
            break
    search0 = int(y0 + 0.70 * (y1 - y0))
    frame_bot = None
    for y in range(search0, min(h - 1, y1 + 5)):
        if lum[y, left : left + 10].mean() > 100 and lum[y, right - 9 : right + 1].mean() > 100:
            frame_bot = y
    if frame_bot is None:
        for y in range(min(h - 1, y1), search0, -1):
            if lum[y, left : left + 10].mean() > 55 and lum[y, right - 9 : right + 1].mean() > 55:
                frame_bot = y
                break
    return left, right, top, frame_bot or y1, fw, y1


def longest_run(rows):
    if not rows:
        return None
    runs, run = [], [rows[0]]
    for r in rows[1:]:
        if r[0] <= run[-1][0] + 2:
            run.append(r)
        else:
            runs.append(run)
            run = [r]
    runs.append(run)
    return max(runs, key=len)


def collect_foot(lum, left, right, fw, y0, y1, thr_list, span_lo=0.20, span_hi=0.50):
    h = lum.shape[0]
    frame_cx = (left + right) / 2
    rows = []
    for y in range(y0, min(h, y1)):
        if lum[y, left : left + 6].mean() > 55 or lum[y, right - 5 : right + 1].mean() > 55:
            continue
        for thr in thr_list:
            cols = np.where(lum[y] > thr)[0]
            cols = cols[(cols >= left - 8) & (cols <= right + 8)]
            if len(cols) < 8:
                continue
            span = int(cols[-1] - cols[0] + 1)
            cx = (int(cols[0]) + int(cols[-1])) / 2
            if fw * span_lo < span < fw * span_hi and abs(cx - frame_cx) < fw * 0.10:
                rows.append((y, int(cols[0]), int(cols[-1]), span, thr))
                break
    return rows


def find_foot(lum, left, right, frame_bot, fw, y1):
    h = lum.shape[0]
    cx0 = left + int(0.28 * fw)
    cx1 = right - int(0.28 * fw)
    gap_y = None
    for y in range(frame_bot + 1, min(h, frame_bot + 130)):
        if float(lum[y, cx0:cx1].mean()) < 42:
            gap_y = y
            break
    if gap_y is not None and gap_y > frame_bot + 8:
        rows = collect_foot(
            lum, left, right, fw, gap_y, gap_y + 80,
            (100, 90, 80, 70, 60), span_lo=0.22, span_hi=0.55,
        )
        run = longest_run(rows)
        if run:
            return (
                run[0][0],
                run[-1][0],
                int(np.median([r[1] for r in run])),
                int(np.median([r[2] for r in run])),
            )
    rows = collect_foot(
        lum, left, right, fw, frame_bot + 1, frame_bot + 40,
        (200, 170, 150, 130), span_lo=0.22, span_hi=0.50,
    )
    run = longest_run(rows)
    if run and len(run) >= 3:
        return (
            run[0][0],
            run[-1][0],
            int(np.median([r[1] for r in run])),
            int(np.median([r[2] for r in run])),
        )
    return frame_bot + 2, min(y1, frame_bot + 12), left + int(0.3 * fw), right - int(0.3 * fw)


def landmarks(im):
    lum = np.asarray(im).max(2).astype(np.float32)
    left, right, top, frame_bot, fw, y1 = find_frame(lum)
    foot_top, foot_bot, foot_L, foot_R = find_foot(lum, left, right, frame_bot, fw, y1)
    return {
        "left": left,
        "right": right,
        "top": top,
        "frame_bot": frame_bot,
        "foot_top": foot_top,
        "foot_bot": foot_bot,
        "foot_L": foot_L,
        "foot_R": foot_R,
        "fw": fw,
    }


def main():
    ext_im = Image.open(EXT_SRC).convert("RGB")
    inn_im = Image.open(INN_SRC).convert("RGB")
    le, li = landmarks(ext_im), landmarks(inn_im)
    print("EXT", le)
    print("INN", li)

    TARGET_FRAME_H = 1500
    ext_fw = le["right"] - le["left"] + 1
    ext_fh = le["frame_bot"] - le["top"] + 1
    TARGET_W = max(1, round(TARGET_FRAME_H * ext_fw / ext_fh))

    inn_foot_h = li["foot_bot"] - li["foot_top"] + 1
    inn_fh = li["frame_bot"] - li["top"] + 1
    ext_foot_h = le["foot_bot"] - le["foot_top"] + 1
    foot_rel = 0.5 * (inn_foot_h / inn_fh + ext_foot_h / ext_fh)
    FOOT_H = max(14, int(round(foot_rel * TARGET_FRAME_H)))
    GAP_H = 3
    TOTAL_H = TARGET_FRAME_H + GAP_H + FOOT_H
    print("dest", TARGET_W, TOTAL_H, "frame", TARGET_FRAME_H, "gap", GAP_H, "foot", FOOT_H)

    rel_w = 0.5 * (
        (le["foot_R"] - le["foot_L"] + 1) / le["fw"]
        + (li["foot_R"] - li["foot_L"] + 1) / li["fw"]
    )
    foot_w = max(8, int(round(rel_w * TARGET_W)))

    def render(im, lm):
        L, R, T, Fb = lm["left"], lm["right"], lm["top"], lm["frame_bot"]
        Ft, Fbot = lm["foot_top"], lm["foot_bot"]
        fL, fR = lm["foot_L"], lm["foot_R"]
        frame = im.crop((L, T, R + 1, Fb + 1)).resize(
            (TARGET_W, TARGET_FRAME_H), Image.Resampling.LANCZOS
        )
        pad = 2
        foot_crop = im.crop((max(0, fL - pad), Ft, min(im.width, fR + 1 + pad), Fbot + 1))
        foot_img = foot_crop.resize((foot_w, FOOT_H), Image.Resampling.LANCZOS)
        out = Image.new("RGB", (TARGET_W, TOTAL_H), (0, 0, 0))
        out.paste(frame, (0, 0))
        out.paste(foot_img, ((TARGET_W - foot_w) // 2, TARGET_FRAME_H + GAP_H))
        return out

    ext_s = render(ext_im, le)
    inn_s = render(inn_im, li)

    pad_x, pad_y = 72, 80
    cw, ch = TARGET_W + 2 * pad_x, TOTAL_H + 2 * pad_y

    def compose(s):
        c = Image.new("RGB", (cw, ch), (0, 0, 0))
        c.paste(s, (pad_x, pad_y))
        return c

    ext_out, inn_out = compose(ext_s), compose(inn_s)
    ext_out.save(OUT / "lightbox-doble-cara-delante.jpg", quality=94, optimize=True)
    inn_out.save(OUT / "lightbox-doble-cara-interior.jpg", quality=94, optimize=True)
    print("saved", cw, ch)

    def edges(im, label):
        lum = np.asarray(im.convert("L")).astype(float)
        h, w = lum.shape
        vis = lum > 40
        ys, xs = np.where(vis)
        L, R = int(xs.min()), int(xs.max())
        fw = R - L + 1
        frame_y = None
        for y in range(int(h * 0.5), h):
            if lum[y, L : L + 8].mean() > 90 and lum[y, R - 7 : R + 1].mean() > 90:
                frame_y = y
        foot_top = foot_y = None
        footL = footR = None
        for y in range(int(h * 0.7), h):
            cols = np.where(lum[y] > 70)[0]
            if len(cols) < 10:
                continue
            if cols[-1] - cols[0] + 1 < fw * 0.55:
                if foot_top is None:
                    foot_top = y
                    footL = int(cols[0])
                    footR = int(cols[-1])
                foot_y = y
        print(f"{label}: frame={frame_y} foot={foot_top}-{foot_y} footLR={footL}-{footR} LR={L}-{R}")
        return frame_y, foot_top, foot_y, footL, footR, L, R

    a = edges(ext_out, "EXT")
    b = edges(inn_out, "INN")
    for name, i in [("frame", 0), ("footTop", 1), ("footBot", 2), ("footL", 3), ("footR", 4)]:
        av = a[i] if a[i] is not None else 0
        bv = b[i] if b[i] is not None else 0
        print(f"delta {name}: {bv - av}")

    band = 400
    e = np.asarray(ext_out)[-band:]
    i = np.asarray(inn_out)[-band:]
    ov = np.zeros_like(e)
    ov[..., 0] = e.max(2)
    ov[..., 1] = i.max(2)
    Image.fromarray(ov).save("/tmp/ba-foot-final.png")
    ext_out.crop((0, ch - band, cw, ch)).save("/tmp/ext-foot-final.png")
    inn_out.crop((0, ch - band, cw, ch)).save("/tmp/inn-foot-final.png")
    print("ok", cw, ch)


if __name__ == "__main__":
    main()

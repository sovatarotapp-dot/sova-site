"""Приводит фон картинок из Midjourney к одному фирменному цвету.

Использование:
    python3 tools/grade.py вход1.png [вход2.png ...] [--out папка] [--target #10131F]

Как работает: находит фактический цвет фона (медиана самых тёмных 40% пикселей),
считает сдвиг до целевого цвета и применяет его к тёмным участкам. Чем ярче
пиксель, тем слабее сдвиг, поэтому золото и блики остаются как были.
"""
import argparse
import os

import numpy as np
from PIL import Image

BRAND_GROUND = "#10131F"  # --color-ground на сайте и в сторис


def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def grade(img, target, protect_from=150.0):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    dark = a[lum < np.percentile(lum, 40)]
    bg = np.median(dark, axis=0)
    bg_lum = float(bg @ np.array([0.299, 0.587, 0.114]))
    shift = target - bg
    # вес 1 на фоне, плавно до 0 к ярким (золотым) участкам
    t = np.clip((lum - bg_lum) / (protect_from - bg_lum), 0.0, 1.0)
    w = 1.0 - t * t * (3.0 - 2.0 * t)
    out = a + shift[None, None, :] * w[..., None]
    return Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)), bg


def main():
    p = argparse.ArgumentParser()
    p.add_argument("files", nargs="+")
    p.add_argument("--out", default="graded")
    p.add_argument("--target", default=BRAND_GROUND)
    args = p.parse_args()
    os.makedirs(args.out, exist_ok=True)
    target = hex_rgb(args.target)
    for f in args.files:
        im, bg = grade(Image.open(f), target)
        name = os.path.splitext(os.path.basename(f))[0] + ".png"
        im.save(os.path.join(args.out, name))
        print(f"{f}: фон {'#%02X%02X%02X' % tuple(int(round(c)) for c in bg)} -> {args.target}")


if __name__ == "__main__":
    main()

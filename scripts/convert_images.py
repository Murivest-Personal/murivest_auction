#!/usr/bin/env python3
"""Download image-search results and convert to brand-spec WebP
(< 250 KB, max 2000px heroes / 1600px lots)."""

import json
import os
import sys
import urllib.request

from PIL import Image

SEARCH_DIR = "/tmp/imgsearch"
OUT_DIR = "/home/z/my-project/public/images"
LOTS_DIR = os.path.join(OUT_DIR, "lots")

HEROES = {"hero-home", "hero-kenya", "hero-uk"}

# name -> (output filename, max width, min width, landscape preference)
def target(name):
    if name in HEROES:
        return (os.path.join(OUT_DIR, f"{name}.webp"), 2000, 900, True)
    return (os.path.join(LOTS_DIR, f"{name}.webp"), 1600, 500, True)


def load_results(name):
    path = os.path.join(SEARCH_DIR, f"{name}.json")
    if not os.path.exists(path):
        return []
    with open(path) as f:
        data = json.load(f)
    if not data.get("success"):
        return []
    return data.get("results", [])


def pick(results, landscape, min_width):
    """Prefer landscape images at least min_width wide; fall back to any."""
    def score(r):
        try:
            w = int(str(r.get("original_width", "0")).replace("px", ""))
            h = int(str(r.get("original_height", "0")).replace("px", ""))
        except ValueError:
            return -1
        if w <= 0 or h <= 0:
            return -1
        s = min(w, 4000)
        if landscape and w >= h:
            s += 5000
        if w >= min_width:
            s += 2000
        return s

    return sorted(results, key=score, reverse=True)


def convert(name):
    out_path, max_w, min_w, landscape = target(name)
    results = load_results(name)
    if not results:
        print(f"MISSING {name}: no search results")
        return False
    for r in pick(results, landscape, min_w):
        url = r.get("original_url")
        if not url:
            continue
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
            tmp = f"/tmp/imgsearch/{name}.download"
            with open(tmp, "wb") as f:
                f.write(raw)
            img = Image.open(tmp)
            img = img.convert("RGB")
            if img.width > max_w:
                ratio = max_w / img.width
                img = img.resize((max_w, round(img.height * ratio)), Image.LANCZOS)
            quality = 72
            while quality >= 40:
                img.save(out_path, "WEBP", quality=quality, method=6)
                if os.path.getsize(out_path) <= 250_000:
                    break
                quality -= 6
            os.remove(tmp)
            size_kb = os.path.getsize(out_path) / 1024
            print(f"OK {name}: {img.width}x{img.height}, {size_kb:.0f} KB (q{quality})")
            return True
        except Exception as e:  # noqa: BLE001
            print(f"  dl failed {name}: {e}")
            continue
    print(f"MISSING {name}: all downloads failed")
    return False


def main():
    os.makedirs(LOTS_DIR, exist_ok=True)
    names = sorted({os.path.splitext(f)[0] for f in os.listdir(SEARCH_DIR) if f.endswith(".json")})
    failed = []
    for name in names:
        if not convert(name):
            failed.append(name)
    print(f"\nDone. {len(names) - len(failed)} converted, {len(failed)} missing: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

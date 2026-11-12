#!/usr/bin/env python3
"""Sweep tracked uppercase label classes from font-body (TNR) to
font-display (Cinzel) across the src tree — the gallery label voice."""
import os
import re

ROOT = "/home/z/my-project/src"

# Label patterns: small sizes + tracking = structural labels -> Cinzel
LABEL_PATTERNS = [
    ("font-body text-[0.55rem] tracking", "font-display text-[0.55rem] tracking"),
    ("font-body text-[0.6rem] tracking", "font-display text-[0.6rem] tracking"),
    ("font-body text-[0.62rem] tracking", "font-display text-[0.62rem] tracking"),
    ("font-body text-[0.65rem] tracking", "font-display text-[0.65rem] tracking"),
    ("font-body text-[0.7rem] tracking", "font-display text-[0.7rem] tracking"),
    # Buttons that place font-body after the tracking class
    ("tracking-[0.25em] uppercase font-body bg-green", "tracking-[0.25em] uppercase font-display bg-green"),
    ("tracking-[0.22em] uppercase font-body text-green border", "tracking-[0.22em] uppercase font-display text-green border"),
    ("tracking-[0.22em] uppercase font-body bg-green text-cream", "tracking-[0.22em] uppercase font-display bg-green text-cream"),
]

changed = []
for dirpath, _, files in os.walk(ROOT):
    for name in files:
        if not name.endswith((".tsx", ".ts")):
            continue
        path = os.path.join(dirpath, name)
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()
        orig = src
        for old, new in LABEL_PATTERNS:
            src = src.replace(old, new)
        if src != orig:
            with open(path, "w", encoding="utf-8") as f:
                f.write(src)
            changed.append(os.path.relpath(path, ROOT))

print(f"{len(changed)} files updated:")
for c in changed:
    print(" -", c)

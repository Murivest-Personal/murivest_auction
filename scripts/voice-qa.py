#!/usr/bin/env python3
"""Voice-compliance QA sweep across all article files, per the
Murivest Manual (forbidden transitions, forbidden vocabulary,
exclamation marks, structure)."""
import os
import re
import json

ROOT = "/home/z/my-project/src/content/articles"

FORBIDDEN = [
    "Moreover", "Furthermore", "However", "Therefore",
    "Consequently", "In addition", "On the other hand",
    "For example", "In conclusion", "To summarize",
    "It is important to note",
    "dream home", "amazing", "incredible", "game-changer",
    "state-of-the-art", "very unique", "unlock", "secrets",
    "hacks", "ultimate guide", "everything you need to know",
    "we're excited",
]

issues = []
article_count = 0
for name in sorted(os.listdir(ROOT)):
    if not name.endswith(".ts") or name == "index.ts":
        continue
    article_count += 1
    path = os.path.join(ROOT, name)
    with open(path, encoding="utf-8") as f:
        text = f.read()

    # Forbidden words (case-insensitive for phrases; avoid matching
    # inside identifiers like "further" via word boundaries)
    lower = text.lower()
    for phrase in FORBIDDEN:
        pat = re.compile(r"\b" + re.escape(phrase.lower()) + r"\b")
        m = pat.search(lower)
        if m:
            issues.append(f"{name}: forbidden phrase '{phrase}'")

    # Exclamation marks (outside code/strings is fine to flag all)
    if "!" in re.sub(r"!==|!", "", ""):  # placeholder
        pass
    exclam = re.findall(r"[a-zA-Z]!", text)
    if exclam:
        issues.append(f"{name}: exclamation mark(s) x{len(exclam)}")

    # Smart quotes / non-ASCII apostrophes that break TS strings
    if "\u2019" in text or "\u201c" in text:
        issues.append(f"{name}: smart quote characters")

    # Emoji
    if re.search(r"[\U0001F300-\U0001FAFF]", text):
        issues.append(f"{name}: emoji found")

    # Basic structure: has faqs and sources
    if "faqs:" not in text:
        issues.append(f"{name}: missing faqs")
    if "sources:" not in text:
        issues.append(f"{name}: missing sources")

print(f"Checked {article_count} articles")
if issues:
    print(f"{len(issues)} issues:")
    for i in issues:
        print(" -", i)
else:
    print("ALL CLEAN — no forbidden phrases, exclamation marks, smart quotes or structure issues")

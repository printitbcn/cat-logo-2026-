#!/usr/bin/env python3
"""Remove the Todos filter pill from all catalogue filter bars."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TODOS_PILL = re.compile(
    r"\s*<button class=\"filter-pill(?: active)?\" data-filter=\"all\"[^>]*>"
    r"[\s\S]*?<span class=\"filter-pill-label\">Todos</span></button>\s*",
    re.IGNORECASE,
)


def main() -> None:
    changed = []
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        new = TODOS_PILL.sub("\n", text)
        if new != text:
            path.write_text(new, encoding="utf-8")
            changed.append(path.name)
    print("Updated:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()

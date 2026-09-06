#!/usr/bin/env python3
"""Start a project on Pure Design.

Copies the language files from the skill bundle into <project>/pure, writes
index.html from the starter template with the dropped layers removed, and
records the language version.

    python3 scripts/scaffold.py <project-dir> [--no-light] [--no-motion] [--no-agent] [--force]

Standard library only. Exits 1 on any failure.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

# The bundle mirrors the upstream repository layout, so paths are stable.
BUNDLE = Path(__file__).resolve().parent.parent / "assets" / "pure-design"
WEB = BUNDLE / "web"
TEMPLATE = BUNDLE / "templates" / "page.html"
TOKENS_JSON = BUNDLE / "tokens" / "tokens.json"

# Mandatory files, then the optional layers keyed by the flag that drops them.
CORE = ["tokens.css", "patterns.css", "icons.svg", "theme.css"]
LAYERS = {
    "light": ["light.css", "light.js"],
    "motion": ["motion.css"],
    "agent": ["agent.css"],
}


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}", file=sys.stderr)
    sys.exit(1)


def strip_layer_links(html: str, dropped: set[str]) -> str:
    """Remove the link/script tags of dropped layers from the template.

    The template links every layer; a project that does not react to the
    pointer must not ship light.css, because a stylesheet that is loaded and
    unused is still a compositing cost and still a file to keep in sync.
    """
    for layer in dropped:
        for name in LAYERS[layer]:
            # <link rel="stylesheet" href="pure/light.css"> or <script src="pure/light.js" defer></script>
            html = re.sub(
                rf'^[ \t]*<(?:link|script)[^>]*pure/{re.escape(name)}[^>]*>(?:</script>)?[ \t]*\n?',
                "",
                html,
                flags=re.MULTILINE,
            )
    return html


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project", type=Path, help="target project directory (created if missing)")
    ap.add_argument("--no-light", action="store_true", help="drop light.css and light.js (nothing reacts to the pointer)")
    ap.add_argument("--no-motion", action="store_true", help="drop motion.css (no named recipe used)")
    ap.add_argument("--no-agent", action="store_true", help="drop agent.css (no model writes to the screen)")
    ap.add_argument("--force", action="store_true", help="overwrite an existing index.html and pure/ folder")
    args = ap.parse_args()

    if not WEB.is_dir() or not TEMPLATE.is_file() or not TOKENS_JSON.is_file():
        fail(f"bundle not found under {BUNDLE}")

    dropped = {name for name in LAYERS if getattr(args, f"no_{name}")}
    files = CORE + [f for layer, names in LAYERS.items() if layer not in dropped for f in names]

    project: Path = args.project
    pure_dir = project / "pure"
    index = project / "index.html"

    if (index.exists() or pure_dir.exists()) and not args.force:
        fail(f"{project} already has index.html or pure/; pass --force to overwrite")

    project.mkdir(parents=True, exist_ok=True)
    pure_dir.mkdir(exist_ok=True)

    # Copy the language files. Copy, never link the repository path: a project
    # pinned to a version does not change when the language does.
    for name in files:
        src = WEB / name
        if not src.is_file():
            fail(f"missing in bundle: {src}")
        shutil.copy2(src, pure_dir / name)
    shutil.copy2(TOKENS_JSON, pure_dir / "tokens.json")

    version = json.loads(TOKENS_JSON.read_text(encoding="utf-8")).get("$version", "unknown")
    (pure_dir / "VERSION").write_text(f"Pure Design {version}\n", encoding="utf-8")

    html = TEMPLATE.read_text(encoding="utf-8")
    html = strip_layer_links(html, dropped)
    index.write_text(html, encoding="utf-8")

    kept = ", ".join(files)
    print(f"[PASS] {project}: pure/ with {kept}; tokens.json; VERSION {version}")
    print(f"[PASS] {index} written from the template" + (f", without {', '.join(sorted(dropped))}" if dropped else ""))
    print("       serve over http (python3 -m http.server) so icons.svg resolves; file:// leaves every icon empty")


if __name__ == "__main__":
    main()

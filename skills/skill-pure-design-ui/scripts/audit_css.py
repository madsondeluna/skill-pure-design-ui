#!/usr/bin/env python3
"""Audit app-layer CSS and HTML against the Pure Design rules a script can see.

    python3 scripts/audit_css.py <path> [--list] [--allow-file NAME ...]

Walks .css, .html, .jsx, .tsx, .vue, .svelte under <path>. Skips node_modules,
.git, dist, build and the language's own copy (any directory named pure, and
the files tokens.css, patterns.css, light.css, motion.css, agent.css, theme.css).

Findings, by severity:
  break   transition: all; transition or animation of a layout property;
          outline removed without a :focus-visible rule; viewport zoom disabled;
          backdrop-filter before -webkit-backdrop-filter (renders with no blur
          after Lightning CSS)
  risk    hex/rgb/hsl/oklch literal outside tokens.css; px/rem/ms literal;
          hand-written cubic-bezier; @media width not equal to
          --breakpoint-stack; will-change: all
  polish  text-transform: uppercase; z-index literals above 10; app
          @keyframes without a prefers-reduced-motion block

--list prints every raw value found with counts (for the tokens-from-selection
routine) and never fails. Standard library only. Exits 1 on any break or risk.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

BUNDLE_TOKENS = Path(__file__).resolve().parent.parent / "assets" / "pure-design" / "tokens" / "tokens.json"

EXTS = {".css", ".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", "pure", ".next", "coverage"}
LANGUAGE_FILES = {"tokens.css", "patterns.css", "light.css", "motion.css", "agent.css", "theme.css"}

LAYOUT_PROPS = {
    "width", "height", "min-width", "min-height", "max-width", "max-height",
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "top", "left", "right", "bottom", "inset",
    "grid-template-rows", "grid-template-columns", "flex-basis", "border-radius",
    "font-size", "line-height", "gap",
}

# Regexes are deliberately simple: this reads the app layer, not a full CSS AST.
RE_HEX = re.compile(r"#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b")
RE_FUNC_COLOR = re.compile(r"\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(", re.I)
RE_LENGTH = re.compile(r"(?<![\w.-])(-?\d*\.?\d+)(px|rem|em)\b")
RE_TIME = re.compile(r"(?<![\w.-])(\d*\.?\d+)(ms|s)\b")
RE_BEZIER = re.compile(r"cubic-bezier\(", re.I)
RE_TRANSITION_ALL = re.compile(r"transition(?:-property)?\s*:\s*all\b", re.I)
RE_TRANSITION = re.compile(r"transition(?:-property)?\s*:\s*([^;}]+)", re.I)
RE_ANIMATION = re.compile(r"@keyframes|animation(?:-name)?\s*:", re.I)
RE_OUTLINE_NONE = re.compile(r"outline\s*:\s*(?:none|0)\b", re.I)
RE_FOCUS_VISIBLE = re.compile(r":focus-visible", re.I)
RE_REDUCED = re.compile(r"prefers-reduced-motion", re.I)
RE_MEDIA_WIDTH = re.compile(r"@media[^{]*\(\s*(?:min|max)-width\s*:\s*(\d+)px", re.I)
RE_WILL_CHANGE_ALL = re.compile(r"will-change\s*:\s*all\b", re.I)
RE_VIEWPORT = re.compile(r'name=["\']viewport["\'][^>]*content=["\'][^"\']*(user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?)', re.I)
RE_UPPER = re.compile(r"text-transform\s*:\s*uppercase", re.I)
RE_ZINDEX = re.compile(r"z-index\s*:\s*(\d+)", re.I)
RE_BLOCK = re.compile(r"\{([^{}]*)\}", re.S)
RE_TAILWIND_TRANSITION_ALL = re.compile(r"\btransition-all\b")

ALLOWED_TOKEN_LENGTHS = {"0", "1px", "100%"}  # 0, a hairline inside border, percentages


class Finding:
    def __init__(self, sev: str, loc: str, what: str, fix: str) -> None:
        self.sev, self.loc, self.what, self.fix = sev, loc, what, fix


def breakpoint_token() -> int | None:
    """The one width media query must equal --breakpoint-stack; read it from the bundle."""
    try:
        data = json.load(open(BUNDLE_TOKENS, encoding="utf-8"))
        raw = data.get("layout", {}).get("breakpoint-stack") or data.get("layout", {}).get("breakpoint", {}).get("stack")
        if isinstance(raw, str):
            return int(re.sub(r"\D", "", raw))
    except Exception:  # noqa: BLE001 - the token file is optional for this script
        pass
    return None


RE_COMMENT = re.compile(r"/\*.*?\*/", re.S)


def blank_comments(css: str) -> str:
    """Replace comment bodies with spaces so offsets and line numbers stay intact."""
    return RE_COMMENT.sub(lambda m: re.sub(r"[^\n]", " ", m.group(0)), css)


def extract_css(path: Path, text: str) -> list[tuple[int, str]]:
    """Return (offset, css) segments. For HTML and component files only style
    blocks, inline style attributes and CSS-in-JS templates count as CSS."""
    if path.suffix == ".css":
        return [(0, blank_comments(text))]
    segments: list[tuple[int, str]] = []
    for pattern in (
        r"<style[^>]*>(.*?)</style>",
        r'style=["\']([^"\']*)["\']',
        r"(?:css|styled\.\w+|createGlobalStyle)`([^`]*)`",
    ):
        for m in re.finditer(pattern, text, flags=re.S | re.I):
            segments.append((m.start(1), blank_comments(m.group(1))))
    return segments


def line_of(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def audit_file(path: Path, root: Path, bp_token: int | None, raw: Counter) -> list[Finding]:
    text = path.read_text(encoding="utf-8", errors="replace")
    rel = str(path.relative_to(root))
    out: list[Finding] = []
    for offset, css in extract_css(path, text):
        out.extend(audit_segment(rel, text, offset, css, bp_token, raw))

    # Viewport lives in the HTML, not in a style block.
    for m in RE_VIEWPORT.finditer(text):
        out.append(Finding("break", f"{rel}:{line_of(text, m.start())}", f"viewport disables zoom ({m.group(1)})", "never user-scalable=no or maximum-scale=1"))
    for m in RE_TAILWIND_TRANSITION_ALL.finditer(text):
        out.append(Finding("break", f"{rel}:{line_of(text, m.start())}", "Tailwind transition-all", "transition-transform, transition-opacity or transition-[a,b]"))
    return out


def audit_segment(rel: str, text: str, offset: int, css: str, bp_token: int | None, raw: Counter) -> list[Finding]:
    out: list[Finding] = []

    def loc(m: re.Match) -> str:
        return f"{rel}:{line_of(text, offset + m.start())}"

    # Collect raw values for --list, and flag them as literals.
    for m in RE_HEX.finditer(css):
        raw[m.group(0).upper()] += 1
        out.append(Finding("risk", loc(m), f"colour literal {m.group(0)}", "var(--token); a missing role becomes a token in tokens.css"))
    for m in RE_FUNC_COLOR.finditer(css):
        # color-mix over a token is legal; a bare rgb/oklch literal is not.
        out.append(Finding("risk", loc(m), f"colour function literal {m.group(0)}", "var(--token) or color-mix over a status/accent token"))
    for m in RE_LENGTH.finditer(css):
        val = m.group(0)
        raw[val] += 1
        if val in ALLOWED_TOKEN_LENGTHS or m.group(1) in ("0", "-0"):
            continue
        # A 1px hairline inside a border declaration is allowed (the language's --hairline).
        ctx = css[max(0, m.start() - 40):m.start()]
        if val == "1px" and re.search(r"border|outline", ctx, re.I):
            continue
        # Media query breakpoint is checked separately.
        if re.search(r"@media[^{]*$", css[max(0, m.start() - 80):m.start()]):
            continue
        out.append(Finding("risk", loc(m), f"length literal {val}", "var(--space-*), var(--text-*), var(--radius-*) by role"))
    for m in RE_TIME.finditer(css):
        raw[m.group(0)] += 1
        out.append(Finding("risk", loc(m), f"duration literal {m.group(0)}", "var(--duration-1..6), matched by use not by number"))
    for m in RE_BEZIER.finditer(css):
        raw["cubic-bezier"] += 1
        out.append(Finding("risk", loc(m), "hand-written cubic-bezier", "one of the five --ease-* tokens; a sixth curve does not exist"))

    # Transitions.
    for m in RE_TRANSITION_ALL.finditer(css):
        out.append(Finding("break", loc(m), "transition: all", "name the properties: transform, opacity (filter only in the motion layer)"))
    for m in RE_TRANSITION.finditer(css):
        props = {p.strip().split()[0].lower() for p in m.group(1).split(",") if p.strip()}
        bad = sorted(props & LAYOUT_PROPS)
        if bad:
            out.append(Finding("break", loc(m), f"transition of layout property {', '.join(bad)}", "transform (scaleX with transform-origin) or [hidden]; layout never animates"))

    # Keyframes animating layout properties.
    for kf in re.finditer(r"@keyframes[^{]*\{(.*?)\}\s*\}", css, flags=re.S):
        body = kf.group(1)
        bad = sorted({p for p in LAYOUT_PROPS if re.search(rf"(?<![\w-]){re.escape(p)}\s*:", body)})
        if bad:
            out.append(Finding("break", loc(kf), f"keyframes animate layout property {', '.join(bad)}", "animate transform and opacity only"))

    # Focus.
    if RE_OUTLINE_NONE.search(css) and not RE_FOCUS_VISIBLE.search(css):
        m = RE_OUTLINE_NONE.search(css)
        out.append(Finding("break", loc(m), "outline removed with no :focus-visible replacement", "outline: var(--focus-ring) solid var(--accent) on :focus-visible"))

    # Reduced motion. patterns.css already collapses every animation globally;
    # an app file that defines its own @keyframes with a delay should still say so.
    if re.search(r"@keyframes", css, re.I) and not RE_REDUCED.search(css):
        out.append(Finding("polish", f"{rel}:{line_of(text, offset)}", "file defines @keyframes and has no prefers-reduced-motion block", "collapse duration and delay, including staggered delays, under prefers-reduced-motion: reduce"))

    # Media breakpoint.
    for m in RE_MEDIA_WIDTH.finditer(css):
        w = int(m.group(1))
        if bp_token and w != bp_token:
            out.append(Finding("risk", loc(m), f"@media width {w}px differs from --breakpoint-stack ({bp_token}px)", "one width query, equal to the token; hit area by pointer: coarse"))

    # will-change.
    for m in RE_WILL_CHANGE_ALL.finditer(css):
        out.append(Finding("risk", loc(m), "will-change: all", "will-change: transform or opacity, and only on first-frame stutter"))

    # backdrop-filter order within a block.
    for b in RE_BLOCK.finditer(css):
        body = b.group(1)
        # position of a bare 'backdrop-filter' that is not the -webkit- one
        std_positions = [mm.start() for mm in re.finditer(r"(?<!-)backdrop-filter\s*:", body)]
        wk_positions = [mm.start() for mm in re.finditer(r"-webkit-backdrop-filter\s*:", body)]
        if std_positions and wk_positions and min(std_positions) < max(wk_positions):
            out.append(Finding("break", loc(b), "backdrop-filter declared before -webkit-backdrop-filter", "standard declaration last; Lightning CSS keeps only the last of the pair"))

    # Polish.
    for m in RE_UPPER.finditer(css):
        out.append(Finding("polish", loc(m), "text-transform: uppercase", "sentence case; the eyebrow uses mono tracking, not caps"))
    for m in RE_ZINDEX.finditer(css):
        if int(m.group(1)) > 10:
            out.append(Finding("polish", loc(m), f"z-index {m.group(1)}", "a small ordered scale; a large literal hides a stacking-context problem"))

    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("path", type=Path)
    ap.add_argument("--list", action="store_true", help="print raw values with counts; never fails")
    ap.add_argument("--allow-file", nargs="*", default=[], help="additional file names to skip (the language files are always skipped)")
    args = ap.parse_args()

    root = args.path.resolve()
    if not root.exists():
        print(f"[FAIL] {root} does not exist", file=sys.stderr)
        sys.exit(1)

    skip_files = LANGUAGE_FILES | set(args.allow_file)
    bp_token = breakpoint_token()
    raw: Counter = Counter()
    findings: list[Finding] = []

    files = [root] if root.is_file() else sorted(
        p for p in root.rglob("*")
        if p.suffix.lower() in EXTS and not (set(p.relative_to(root).parts[:-1]) & SKIP_DIRS)
    )
    for f in files:
        if f.name in skip_files:
            continue
        findings.extend(audit_file(f, root if root.is_dir() else root.parent, bp_token, raw))

    if args.list:
        print("value".ljust(24) + "count")
        for val, n in raw.most_common():
            print(val.ljust(24) + str(n))
        print(f"\n{len(raw)} distinct raw values in {len(files)} files")
        sys.exit(0)

    counts = Counter(f.sev for f in findings)
    for sev in ("break", "risk", "polish"):
        rows = [f for f in findings if f.sev == sev]
        if not rows:
            continue
        print(f"\n[{sev}]")
        for f in rows:
            print(f"  {f.loc.ljust(40)} {f.what}  ->  {f.fix}")

    print()
    print(f"{len(files)} files; break {counts['break']}, risk {counts['risk']}, polish {counts['polish']}")
    if not findings:
        print("[PASS] no findings the script can see; the rendered sweep still has to run")
    sys.exit(1 if counts["break"] or counts["risk"] else 0)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""WCAG 2.1 contrast for Pure Design tokens, or for any two colours.

    python3 scripts/contrast.py --pairs                     # the semantic table, four modes
    python3 scripts/contrast.py --fg "#3E5C76" --bg "#EBEEF3"
    python3 scripts/contrast.py --fg "rgba(45,90,122,0.24)" --over "#EBEEF3" --text "#1A3A52"
    python3 scripts/contrast.py --mode dark --token muted --on surface [--large]

Translucent colours are composed over --over (or the mode surface) before
measuring: treating alpha as opaque is the trap that failed three tags at
1.0-1.6 when the composite gave 5.4-6.8.

Standard library only. Exits 1 when any measured pair is under its floor.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

TOKENS = Path(__file__).resolve().parent.parent / "assets" / "pure-design" / "tokens" / "tokens.json"
MODES = ["light", "paper-like", "deep-blue", "dark"]
FLOOR_TEXT = 4.5
FLOOR_LARGE = 3.0

# The published table, recomputed here on every run.
PAIRS = [
    ("text", "bg"),
    ("muted", "bg"),
    ("muted", "surface"),
    ("muted", "surface-hover"),
    ("accent", "bg"),
    ("secondary", "bg"),
    ("secondary", "surface"),
    ("border", "bg"),
]

# Roles decide the floor: border is decoration, secondary is a border colour
# (never text), everything else is text.
DECORATION = {"border"}

RGB = tuple[float, float, float]


def parse(color: str) -> tuple[RGB, float]:
    """Parse #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(). Returns (rgb 0-255, alpha 0-1)."""
    s = color.strip().lower()
    if s.startswith("#"):
        h = s[1:]
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        if len(h) == 6:
            return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)), 1.0
        if len(h) == 8:
            return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)), int(h[6:8], 16) / 255
        raise ValueError(f"bad hex: {color}")
    m = re.match(r"rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.%]+))?\s*\)", s)
    if m:
        r, g, b = (float(m.group(i)) for i in (1, 2, 3))
        a = m.group(4)
        if a is None:
            alpha = 1.0
        elif a.endswith("%"):
            alpha = float(a[:-1]) / 100
        else:
            alpha = float(a)
        return (r, g, b), alpha
    raise ValueError(f"unsupported colour syntax (use hex or rgb/rgba): {color}")


def composite(top: RGB, alpha: float, under: RGB) -> RGB:
    """Source-over: the real background of a translucent layer is the mixture."""
    return tuple(alpha * t + (1 - alpha) * u for t, u in zip(top, under))  # type: ignore[return-value]


def luminance(rgb: RGB) -> float:
    def channel(c: float) -> float:
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg: RGB, bg: RGB) -> float:
    l1, l2 = luminance(fg), luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def resolve(color: str, over: RGB | None) -> RGB:
    rgb, alpha = parse(color)
    if alpha < 1.0:
        if over is None:
            raise ValueError(f"{color} is translucent; pass --over with the surface it sits on")
        return composite(rgb, alpha, over)
    return rgb


def verdict(r: float, floor: float) -> str:
    return "PASS" if r >= floor else "FAIL"


def load_tokens() -> dict:
    if not TOKENS.is_file():
        print(f"[FAIL] tokens.json not found at {TOKENS}", file=sys.stderr)
        sys.exit(1)
    return json.load(open(TOKENS, encoding="utf-8"))


def mode_color(tokens: dict, mode: str, name: str) -> str:
    try:
        return tokens["color"][mode][name]
    except KeyError:
        print(f"[FAIL] no token '{name}' in mode '{mode}'", file=sys.stderr)
        sys.exit(1)


def run_pairs(tokens: dict, large: bool) -> int:
    failures = 0
    header = "pair".ljust(30) + "".join(m.ljust(12) for m in MODES)
    print(header)
    for fg, bg in PAIRS:
        row = f"--{fg} / --{bg}".ljust(30)
        floor = 0.0 if fg in DECORATION else (FLOOR_LARGE if large else FLOOR_TEXT)
        for mode in MODES:
            over = resolve(mode_color(tokens, mode, "bg"), None)
            f = resolve(mode_color(tokens, mode, fg), over)
            b = resolve(mode_color(tokens, mode, bg), over)
            r = ratio(f, b)
            flag = ""
            if floor and r < floor and fg != "secondary":
                failures += 1
                flag = "*"
            row += f"{r:5.2f}{flag}".ljust(12)
        print(row)
    print()
    print(f"floor {FLOOR_LARGE if large else FLOOR_TEXT}:1 for text; --border is decoration; "
          "--secondary is a border colour and is never text (shown for reference, not counted)")
    return failures


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pairs", action="store_true", help="print the semantic token table in four modes")
    ap.add_argument("--fg", help="foreground (text) colour, hex or rgb/rgba")
    ap.add_argument("--bg", help="background colour, hex or rgb/rgba")
    ap.add_argument("--over", help="opaque surface a translucent --fg/--bg sits on")
    ap.add_argument("--text", help="with --fg translucent and --over: measure this text over the composite")
    ap.add_argument("--mode", choices=MODES, help="mode for --token/--on")
    ap.add_argument("--token", help="semantic token name for the foreground, e.g. muted")
    ap.add_argument("--on", help="semantic token name for the background, e.g. surface")
    ap.add_argument("--large", action="store_true", help="use the 3:1 floor (large text, UI component)")
    args = ap.parse_args()

    floor = FLOOR_LARGE if args.large else FLOOR_TEXT
    failures = 0

    if args.pairs:
        failures += run_pairs(load_tokens(), args.large)

    if args.token or args.on:
        if not (args.mode and args.token and args.on):
            ap.error("--mode, --token and --on go together")
        tokens = load_tokens()
        over = resolve(mode_color(tokens, args.mode, "bg"), None)
        fg = resolve(mode_color(tokens, args.mode, args.token), over)
        bg = resolve(mode_color(tokens, args.mode, args.on), over)
        r = ratio(fg, bg)
        print(f"[{verdict(r, floor)}] --{args.token} over --{args.on} in {args.mode}: {r:.2f}:1 (floor {floor})")
        failures += r < floor

    if args.fg or args.bg or args.text:
        if args.text and not (args.fg and (args.bg or args.over)):
            ap.error("--text needs --fg (the translucent layer) and --over or --bg (the surface under it)")
        if not args.text and not (args.fg and args.bg):
            ap.error("--fg and --bg go together")
        over = resolve(args.over, None) if args.over else None
        bg = resolve(args.bg, over) if args.bg else over
        if args.text:
            # --fg is the translucent layer (a tag background); --text is what sits on it.
            layer = resolve(args.fg, bg)
            txt = resolve(args.text, layer)
            r = ratio(txt, layer)
            print(f"[{verdict(r, floor)}] {args.text} over ({args.fg} composed on {args.bg or args.over}): {r:.2f}:1 (floor {floor})")
        else:
            fg = resolve(args.fg, bg)
            r = ratio(fg, bg)
            print(f"[{verdict(r, floor)}] {args.fg} over {args.bg}: {r:.2f}:1 (floor {floor})")
        failures += r < floor

    if not (args.pairs or args.token or args.fg):
        ap.print_help()
        sys.exit(2)

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()

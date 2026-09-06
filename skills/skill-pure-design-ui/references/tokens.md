# Tokens

Source of truth: `assets/pure-design/tokens/tokens.json`. Every value below is
served by `web/tokens.css` as a custom property. Read this file when choosing
any colour, size, space, radius, duration or curve. `contrast.py --pairs`
recomputes the numbers in the contrast table.

## Modes

| Class on `html` | Ramp | `--bg` | Use |
|---|---|---|---|
| `:root` (none) | slate | `#F4F6F9` | default |
| `.paper-like` | paper | `#FAF8F1` | long reading, print |
| `.deep-blue` | slate | `#0D1321` | blue dark |
| `.dark` | graphite | `#0E0F13` | neutral dark |

The mode lives in the URL (`?mode=paper-like|deep-blue|dark`) and as the class
on `html`. `theme-color` is `#F4F6F9` at rest and the switcher rewrites it on
every change. `color-scheme` is declared per mode so the browser paints
scrollbar and caret with the right scheme.

Historical note: through 1.0 `.dark` was the blue one. It is now graphite; the
blue is `.deep-blue`.

## Colour

Two 15-step ramps, `--slate-*` (light, paper-like, deep-blue) and
`--graphite-*` (dark). Every semantic token resolves to a step.

Slate keeps the Space Cadet anchors `#0D1321`, `#1D2D44`, `#3E5C76`,
`#748CAB`, `#F4F6F9`. Graphite is neutral by construction: OKLCH chroma
between 0.007 and 0.012 at hue 265.

Semantic tokens per mode: `--bg`, `--surface`, `--surface-hover`,
`--surface-glass`, `--surface-hover-glass`, `--dim`, `--border`,
`--border-hover`, `--text`, `--muted`, `--accent`, `--secondary`.

### Contrast per pair (WCAG 2.1)

| Pair | light | paper-like | deep-blue | dark |
|---|---|---|---|---|
| `--text` / `--bg` | 17.13 | 17.45 | 17.13 | 17.68 |
| `--muted` / `--bg` | 6.47 | 6.59 | 7.11 | 7.15 |
| `--muted` / `--surface` | 6.02 | 5.87 | 5.32 | 5.49 |
| `--muted` / `--surface-hover` | 5.55 | 5.30 | 4.60 | 4.72 |
| `--accent` / `--bg` | 6.47 | 6.59 | 9.61 | 9.86 |
| `--secondary` / `--bg` | 3.19 | 3.25 | 5.37 | 5.53 |
| `--border` / `--bg` | 1.39 | 1.47 | 1.73 | 1.79 |

Usage rule: above 4.5 any text; 3 to 4.5 large text and UI components; below 3
decoration. The floor is 4.5 in all four modes, over `--surface` and
`--surface-hover` both.

`--secondary` is never a text colour in any mode: it lands between 2.61 and
4.25 against `--surface`. It paints borders and one non-text glyph. Small text
and metadata take `--muted`. A finding of `--secondary` as text today is app
code, and the fix is `--muted`, never lightening secondary.

### Status

Reserved meaning, never a series colour, always paired with a label or icon.
Between 5.54 and 8.62 against the surface.

| Token | light | dark and deep-blue |
|---|---|---|
| `--status-good` | `#376E48` | `#82BB90` |
| `--status-warning` | `#79601B` | `#C9AE6D` |
| `--status-serious` | `#844E31` | `#D89B7C` |
| `--status-critical` | `#864544` | `#D18885` |

Diff tint: `color-mix(in oklab, var(--status-*) 12%, transparent)`.
Selection mark: `color-mix(in oklab, var(--accent) 22%, transparent)`.
No new hex enters the language through a tint.

### Tags

`congress`, `conference`, `symposium`: translucent background plus border plus
a text colour per mode, 7.7 to 11.6 in both dark modes. The background alpha
composes over the surface; treat it as opaque and the contrast number is wrong.

## Data colour

A family separate from the interface. Brand slate has chroma 0.055, below the
0.10 floor: as a series it reads grey.

Eight slots, chroma 0.105 to 0.115, fixed order, assigned in sequence, never
cycled.

| Slot | Hex | Name |
|---|---|---|
| `--chart-1` | `#3973B1` | blue |
| `--chart-2` | `#9F8322` | gold |
| `--chart-3` | `#9E527F` | magenta |
| `--chart-4` | `#4C985F` | green |
| `--chart-5` | `#745BA5` | violet |
| `--chart-6` | `#BA6F3E` | orange |
| `--chart-7` | `#1990AD` | teal |
| `--chart-8` | `#AC5551` | red |

Order found by exhaustive search over permutations maximising the worst
adjacent pair. Verified against all four surfaces: lightness band and chroma
floor pass; worst adjacent pair under deuteranopia (Machado 2009, severity 1.0)
delta E 10.0 against a target of 8; normal vision 19.9 against a floor of 15;
mark contrast minimum 3.31 against a floor of 3.

Rules:
- Scatter, bubble, map and small multiples: three-series cap. Beyond that, group
  or facet.
- A chart slot never carries state, and a status colour never carries a series.
- A chart slot is never a text colour: `--chart-2` gives 3.38:1 at 20px. Series
  colour goes on the mark (dot, bar, disc); the label stays in text ink.
- Never two y-axes on one chart.
- Ramps: `SEQUENTIAL` (nine steps), `ORDINAL_LIGHT` and `ORDINAL_DARK` (seven
  discrete steps, validated separately), `DIVERGING` (blue to amber, grey at
  the midpoint).

## Typography

| Family | Token | Role | Constraint |
|---|---|---|---|
| Archivo 300, `font-stretch: 125%` | `--font-display` with `--font-display-stretch` | section titles and names | tracking -0.02em, leading 1, never below 32px, never in running text. Always declare weight and stretch together: the title separates by width, not by a serifed family |
| Public Sans | `--font-sans` | prose, labels, buttons, table cells | |
| Spline Sans Mono | `--font-mono` | numbering, field labels, tabular values, code, identifiers | tracking 0.12em when used as a label |

Scale `--text-11` through `--text-56`; the name is the size in px. Two clamps
outside it: `--text-display-section` and `--text-display-name`.

One size per control class: control `--text-12`; prose `--text-15`; metadata
`--text-12` mono; text field `--text-field` (1rem, 16px), the one exception,
because below it iOS zooms on focus.

Measure: `--measure-prose` 480px. `.prose-justify` is opt-in.

## Space

`--space-2` through `--space-96`, base 4 with half-steps at 2, 6 and 10:
2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96.

Layout uses three steps and only three: 24 approaches what belongs to the same
block, 48 separates blocks within a section, 96 separates sections. The smaller
steps exist inside a component (icon to label, pill padding). A
`margin-top: var(--space-32)` between two blocks is a finding even though it
is a token.

Below `--breakpoint-stack` (768px): 96 becomes 48, 48 becomes 24, 24 stays 24.
Nothing goes under 24 in layout, not even narrow.

## Radius

Radius follows role, not taste. Nothing in the language has a live corner.

| Token | Value | Applies to |
|---|---|---|
| `--radius-surface` | 12px | card, panel, grid cell, sheet, state box, hairline grid |
| `--radius-field` | 8px | input, textarea, select, any text entry |
| `--radius-media` | 8px | image, video, thumbnail, avatar frame |
| `--radius-control` | full | button, pill, chip, tag |
| `--radius-mark` | 4px | native checkbox box, skeleton bar, anything under 20px |
| `--radius-circle` | 50% | avatar, dot, radio, round control |

The ladder is concentric: a child never rounds harder than its parent, so a
field at 8 inside a card at 12 reads as one object. The numeric steps
(`--radius-0` to `--radius-16`) stay for imported components only.

## Motion tokens

| Token | Curve | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | colour, background and border on hover |
| `--ease-out` | `cubic-bezier(0,0,.2,1)` | simple entrance |
| `--ease-out-soft` | `cubic-bezier(.25,0,0,1)` | content, tab transition, chart line drawing |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | slide, scale, bar growth |
| `--ease-swift` | `cubic-bezier(.23,.88,.26,.92)` | hover displacement |

Durations `--duration-1` 100ms, `-2` 150ms, `-3` 200ms, `-4` 300ms, `-5`
350ms, `-6` 500ms. Hover default 200ms. Glass 350ms with `--ease-out-soft`.

Displacement `--nudge-1` 2px, `--nudge-2` 3px, `--nudge-3` 4px.

Motion-layer blur radii, not a scale: `--motion-blur-1` 2px, `-2` 3px, `-3`
8px. They blur the element itself while it moves and clear on settle. Glass
blur is on the backdrop and stands still. Mixing the two families is how a card
ends up blurred at rest.

Entrance stagger: 60ms per item, capped at six steps, class `.stagger`.
Everything collapses under `prefers-reduced-motion: reduce`.

## Interaction tokens

| Token | Value | Role |
|---|---|---|
| `--hit-min` | 24px | floor for a hit area |
| `--hit-min-touch` | 44px | same floor under `pointer: coarse` |
| `--focus-ring` | 2px | outline width, colour `--accent`, `--text` over glass |
| `--focus-offset` | 2px | outline offset |
| `--field-height` | 40px | minimum field height, 44px on touch |
| `--text-field` | 1rem | field text size |
| `--scroll-offset` | 88px | `scroll-margin-top` under a fixed bar |
| `--stroke` | 2px | drawn stroke: spinner ring, checkbox mark, icon |
| `--tap-highlight` | transparent | native tap flash, replaced by `:active` |
| `--breakpoint-stack` | 768px | the one width media query; the literal in `@media` must equal it |

## Glass, liquid, light and agent tokens

Listed in `references/materials.md` and `references/components.md`. Blur:
`--blur-card` 32px, `--blur-pill` 72px (only `.overlay`). Shadows:
`--shadow-glass-rest`, `--shadow-glass-hover`, `--shadow-lens`, with the inset
layers `--glass-bezel` and `--glass-pool`.

## Adding a token

A value the scale lacks is one of three things, and the report says which:

- duplicate: same role as an existing token with another number. Merge.
- outside the language: a role the language does not cover. Becomes a token in
  `web/tokens.css` and `tokens/tokens.json` and the language notes in the same
  session, never a literal in the app.
- error: a role the language forbids (uppercase, an overshoot curve, a chart
  slot carrying state). Does not become a token.

Changing the language changes every project that copied from it. Do not write
`tokens.css` without confirmation.

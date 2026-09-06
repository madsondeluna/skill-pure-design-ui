# Polish details

The small details that compound into an interface that feels finished. This
chapter comes from make-interfaces-feel-better and is reconciled with the
tokens: where the two sources disagreed on a number, the token wins and the
principle stays. Each reconciliation is marked.

Before writing or suggesting a fix, identify the project's styling system and
express the change in it: Tailwind classes in a Tailwind project, plain CSS in
a CSS project, the established CSS-in-JS otherwise. Never introduce a second
system to apply a polish fix.

## 1. Concentric border radius

Outer radius equals inner radius plus the padding between them. Mismatched
radii on nested elements is the most common thing that makes an interface feel
off: equal radii make the inner surface look pinched.

In the language the role ladder already produces this: `--radius-surface` 12
on the card, `--radius-field` 8 on the field inside it, `--radius-media` 8 on
the image, full on the control, 4 on a mark. A child never rounds harder than
its parent. When padding is larger than 24px, treat the layers as separate
surfaces and choose each radius by role instead of forcing the arithmetic.

```css
/* good: card 12 with field 8 inside */
.card  { border-radius: var(--radius-surface); padding: var(--space-8); }
.field { border-radius: var(--radius-field); }
```

Tailwind: `rounded-2xl p-2` outside with `rounded-lg` inside (16 minus 8),
never the same class on both.

## 2. Optical over geometric alignment

When geometric centring looks wrong, align optically. The language carries
`.optical` for the pixel where perception disagrees.

- Button with text plus icon: icon-side padding equals text-side padding minus
  2px (`pl-4 pr-3.5` in Tailwind).
- Play triangles: shift 2px toward the point.
- Asymmetric icons (stars, arrows, carets): fix the SVG viewBox or path so no
  margin is needed in component code; a margin is the fallback.

## 3. Shadows for elevation, borders for structure

A border that exists only to fake depth becomes a layered translucent shadow:
a 1px ring, a small lift, an ambient layer. Shadows adapt to any background
because they use transparency; solid borders only work on the background they
were designed for. Keep borders that communicate structure or state: dividers,
table cell boundaries, form input outlines, selected and focus states.

Reconciliation: the source writes the layers as `oklch(0 0 0 / 0.06)`
literals. In the language those layers already exist as
`--shadow-glass-rest` and `--shadow-glass-hover` (with `--glass-bezel` and
`--glass-pool`), in all four modes. In dark modes the layered depth is
invisible and the token collapses to a single light ring. Use the token; never
write the oklch literal in app CSS.

```css
.card { box-shadow: var(--shadow-glass-rest);
        transition-property: box-shadow;
        transition-duration: var(--duration-2);
        transition-timing-function: var(--ease-out); }
.card:hover { box-shadow: var(--shadow-glass-hover); }
```

| Use shadows | Use borders |
|---|---|
| cards, containers with depth | dividers between list items |
| bordered button styles | table cell boundaries |
| elevated elements: dropdowns, modals | form input outlines |
| elements on varied backgrounds | hairline separators in dense UI |
| hover and focus lift | selected and focus states |

## 4. Image outlines

A 1px inset outline at low opacity gives every image consistent depth
(`outline-offset: -1px` so it adds nothing to layout). The source rule is that
the colour must be pure black in light and pure white in dark, never a tinted
neutral, because a tinted outline picks up the surface colour and reads as
dirt on the edge.

Reconciliation: `.media` carries the language's frame. If a project needs the
neutral outline, it becomes a token pair (`--media-outline` per mode) in
`tokens.css`, resolving to a black or white alpha, not a slate step. Do not
match the outline to `--accent` or `--text`.

## 5. Typography rendering

- `text-wrap: balance` on headings (`.balance`; Tailwind `text-balance`).
  Browsers only balance blocks of six lines or fewer.
- `text-wrap: pretty` on short-to-medium text: paragraphs, descriptions,
  captions, list items (`.pretty`; Tailwind `text-pretty`). It avoids the
  orphaned last word without equalising lines.
- Long text (10 lines or more), code and preformatted text: neither. Default
  wrapping is fine and avoids layout cost.
- Font smoothing: `-webkit-font-smoothing: antialiased` and
  `-moz-osx-font-smoothing: grayscale` once on `html`, never per element. It
  only affects macOS and is safe everywhere. The template does this.
- Tabular numbers: `font-variant-numeric: tabular-nums` (`.num`; Tailwind
  `tabular-nums`) on any number that updates or is compared: counters,
  timers, prices, table columns, scoreboards. Not on phone numbers, zip
  codes, version strings or decorative large numbers. Some faces widen the
  digit 1 under this setting; that is expected.
- Font family is not a polish concern. Do not introduce a paid face to satisfy
  the checklist; the language declares its three families and their fallbacks.

## 6. Hit areas

Reconciliation: the source says 44px on touch and 40px in dense desktop. The
language decides by input, not by width or density: `--hit-min` 24px always,
`--hit-min-touch` 44px under `pointer: coarse`. Fourteen control classes carry
the floor themselves. For a visual smaller than the floor, `.hit` extends the
area with a pseudo-element without extending the drawing. Two interactive
elements never have overlapping hit areas: shrink the extension until they do
not collide, but keep it as large as possible.

## 7. Icons

- Stroke: the language has one weight, `--stroke` 2px, kept equal across the
  three sizes by `non-scaling-stroke`. The source's rule of matching stroke to
  adjacent text weight (1.5px beside regular 400, 2px beside 500 to 600,
  2.5px beside 700) applies when a project imports an external set; one stroke
  weight per surface, and never two libraries on one surface.
- One SVG recoloured per state: `currentColor`, states from CSS colour and
  opacity, never separate assets per state. Strip hardcoded `fill` and
  `stroke` when importing.
- Outline is the default; fill marks the active state (active tab, toggled
  bookmark, liked heart). The swap is `.motion-icon-swap`.
- Design at render size: test at 16px, prefer simplified glyphs, use the set's
  native grid (16, 20, 24), SVG never raster.
- Every icon-only control has an accessible name; decorative icons are
  `aria-hidden`.

## 8. Press feedback

`scale(0.96)` on `:active`, transition on `scale` only, `--duration-2`,
`--ease-out`. Always 0.96; never below 0.95. A `static` variant disables it
where motion would distract. See `motion.md`.

## 9. Contextual icon animation

Opacity, scale and blur instead of a visibility toggle, both icons in the DOM.
Reconciliation: the source fixes `scale 0.25 to 1`, `blur 4px to 0` and
`spring, duration 0.3, bounce 0`. In the language the blur reads
`--motion-blur-2` (3px), the duration is `--duration-4` (300ms) and the curve
is `--ease-out-expo`; with the Motion library installed, keep the spring with
`bounce: 0`. The recipe is `.motion-icon-swap`. See `motion.md`.

## 10. Enter and exit

Split and stagger only an infrequent staged entrance. Reconciliation: the
source staggers at about 100ms; the language staggers at 60ms per item, six
steps (`.stagger`), and lines at `--duration-1`. Exits use a small fixed
`--nudge-*` and `--duration-2`, softer than the entrance. See `motion.md`.

## 11. Skip animation on page load

Elements already in their default state do not animate in on first render:
icon swaps, toggles, tabs, segmented controls. With the Motion library that is
`initial={false}` on `AnimatePresence`; verify it does not remove an
intentional first entrance.

## 12. Performance

- Never `transition: all` or `transition-all`. Name the properties.
- `will-change` only for `transform`, `opacity`, `filter`; only when a first
  frame stutters; never `all`; never on layout or paint properties. Each
  compositing layer costs memory. Modern browsers optimise on their own;
  Safari is the one that benefits.

| Property | GPU-compositable | Worth `will-change` |
|---|---|---|
| `transform` | yes | yes |
| `opacity` | yes | yes |
| `filter` | yes | yes |
| `clip-path` | newer Chromium only | rarely |
| `top`, `left`, `width`, `height` | no | no |
| `background`, `border`, `color` | no | no |

## Common mistakes

| Mistake | Fix |
|---|---|
| Same radius on parent and child | role ladder: surface 12, field and media 8, control full |
| Icon looks off-centre | `.optical`, or fix the SVG |
| Border used only to fake elevation | `--shadow-glass-rest`; keep structural and state borders |
| Staged entrance on every hover or keystroke | instant feedback or a colour transition at `--duration-2` or less |
| Numbers cause layout shift | `.num` |
| Heavy text on macOS | antialiased on `html` (the template) |
| Animation plays on page load | `initial={false}` or no entrance class on default-state elements |
| `transition: all` | name the properties |
| First-frame stutter | `will-change: transform`, sparingly |
| Tiny hit area | `.hit`, 24px and 44px under coarse pointer |
| Hairline icon beside bold text | match stroke to text weight when using an external set |
| Separate icon assets per state | one `currentColor` SVG, states via CSS |
| Filled icons everywhere | outline default, fill only for active |
| `--secondary` as small text | `--muted` |
| Chart slot as text colour | series on the mark, label in `--text` |
| `backdrop-filter` before `-webkit-backdrop-filter` | standard declaration last |

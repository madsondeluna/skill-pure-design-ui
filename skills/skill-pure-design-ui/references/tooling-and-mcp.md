# Tooling and MCP

What to reach for, when, and what each tool cannot do. Check the tool list of
the session before assuming a connector is present; suggest the connector
when it is missing and the task needs it.

## Figma MCP

Input for review, source for tokens, target for writing.

| Tool | Use | Cost |
|---|---|---|
| `get_metadata` | tree, names, geometry of a node; the first call for anything | cheap |
| `get_screenshot` | the pixel, for design review and anatomy markers | cheap |
| `get_design_context` | code and bound tokens of one node; ask only for the node that matters | expensive |
| `get_variable_defs` | which variables are actually bound; a loose value where a variable existed is the most common finding | cheap |
| `get_motion_context` | declared animation on a node; translate to a `motion.css` recipe, never to new keyframes | cheap |
| `search_design_system` | library components before proposing a new one | cheap |
| `use_figma` | write: generate the narrow version, apply copy swaps, create components | requires loading `figma-use` first, a mandatory prerequisite; skipping it fails in a way that is hard to debug |
| `get_variable_defs` plus `send_code_connect_mappings` | map a Figma component to the `patterns.css` class that implements it | |

Start with metadata, measure space from geometry (never from a screenshot, the
pixel lies at zoom scale), and confirm before writing.

## Browser (Claude in Chrome, or a preview tool)

The only way to measure what `check.mjs` cannot see: which token the page put
on which background, the hit area under `pointer: coarse`, the overflow at
375px, the transition frozen in a background tab.

Sequence for a served page:
1. `python3 -m http.server 8731` from the project root (from
   `assets/pure-design` for the guide).
2. Open the URL. Resize to 1280 and to 375x812; reload after each resize.
3. Inject `* { transition: none !important }` before any colour reading.
4. Force hidden states (error, modal, dropdown, tooltip) by class.
5. Resolve colour through a canvas pixel, not a regex.
6. Confirm `matchMedia('(pointer: coarse)').matches` before reporting hit
   areas; `documentElement.scrollWidth > innerWidth` before reporting overflow.
7. Bust the stylesheet cache with a new `href` suffix when a file changed.
8. Animations panel at 10% for anything that moves.

A Playwright script can automate steps 2 to 6 when the environment has it;
the skill does not ship one because the browser tool is the common case.

## draw.io MCP

For the anatomy image (numbered markers over a component), for the agent flow
when the column form is not enough for a document, and for architecture
diagrams in a handoff. Use the language's ink and surface colours from
`tokens.md`; markers never take a chart colour.

## BioRender

Scientific figures that sit beside matplotlib panels: same eight series
slots, same four status colours, Public Sans. See `python-charts.md`.

## Claude Design and the design artifact type

When the session offers a Design artifact type and the request is a design
deliverable (landing page, app screens, poster), create it there and apply the
tokens by hand: paste `tokens.css` first, then the used rules from
`patterns.css`, keeping the custom property names intact so the design can be
moved into a project. The Visualizer is for illustrating an idea inside an
explanation, not for delivering a design.

## Notion and Google Drive

Handoff and anatomy documents can be delivered as a Notion page or a Drive
document when the user keeps specifications there. The content rules do not
change: sentence case, no caption under a heading, tables for tokens and
states.

## GitHub

The language repository is `madsondeluna/pure-design-language`; the polish
source is `madsondeluna/make-interfaces-feel-better`. When a project links the
repository path instead of copying the files, that is a finding ("copy the
language files rather than linking the repository path", level Should).
Record the version the copy came from.

## The bundled scripts

All Python 3, standard library only, exit 1 on failure.

### `scripts/scaffold.py`

```bash
python3 scripts/scaffold.py <project-dir> [--no-light] [--no-motion] [--no-agent] [--force]
```

Copies `tokens.css`, `patterns.css`, the optional layers, `light.js`,
`icons.svg` and `tokens.json` into `<project-dir>/pure/`, writes
`<project-dir>/index.html` from the template with the dropped layers removed,
and writes `<project-dir>/pure/VERSION` with the language version. Refuses to
overwrite an existing `index.html` without `--force`.

### `scripts/audit_css.py`

```bash
python3 scripts/audit_css.py <path> [--list] [--allow-file tokens.css]
```

Walks `.css`, `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte` under `<path>`
(skipping `node_modules`, `.git`, `dist`, `build`, and the language's own
`pure/` copy) and reports:

- hex, `rgb(`, `hsl(`, `oklch(` literals in CSS outside `tokens.css`
- px, rem, ms literals in app CSS (0, `1px` hairlines inside `border`, and the
  `@media` breakpoint are allowed; the breakpoint must equal `--breakpoint-stack`)
- `transition: all` and `transition-property: all`
- transitions or animations of layout properties (`width`, `height`, `margin`,
  `padding`, `top`, `left`, `right`, `bottom`, `grid-template-rows`,
  `flex-basis`, `border-radius`)
- hand-written `cubic-bezier`
- `outline: none` or `outline: 0` without a `:focus-visible` rule in the same file
- `backdrop-filter` declared before `-webkit-backdrop-filter` in the same block
- `will-change: all`
- `user-scalable=no` or `maximum-scale=1` in a viewport meta
- uppercase-only strings in buttons and headings of HTML (`text-transform:
  uppercase` in CSS)
- missing `prefers-reduced-motion` block in a file that declares any transition
  or animation

`--list` prints every raw value found (hex, px, rem, ms, cubic-bezier) with
counts, for the tokens-from-selection routine, and does not fail.

Output is one line per finding in the report format, grouped by severity, then
a count.

### `scripts/contrast.py`

```bash
python3 scripts/contrast.py --pairs                         # the token table in four modes, WCAG 2.1
python3 scripts/contrast.py --fg "#3E5C76" --bg "#EBEEF3"     # one pair
python3 scripts/contrast.py --fg "rgba(45,90,122,0.24)" --over "#EBEEF3" --text "#1A3A52"
                                                            # composite a translucent layer, then measure text over it
python3 scripts/contrast.py --mode dark --token muted --on surface
```

Reads `assets/pure-design/tokens/tokens.json`. Composes alpha over the
surface before measuring, which is the trap that produced the wrong tag
numbers. Floors: 4.5 normal text, 3 large text and UI, printed beside each
ratio. Exit 1 when any requested pair is under its floor.

### `assets/pure-design/tools/check.mjs`

```bash
node assets/pure-design/tools/check.mjs
```

The language's own verification, no dependencies: palette under colour vision
deficiency, ordinal ramps, semantic contrast, consistency between JSON, CSS,
Python and the guide, version, `color-scheme`, `transition: all`, layout
transitions, hex outside `tokens.css`, motion scale, `--surface-context`,
liquid gap and transform, radius roles, focus ring, `theme-color`, cascade of
`.glass-accent` and the textures, light-layer composition and coarse-pointer
fallback, icon sprite integrity, `backdrop-filter` order. It reads
`LANGUAGE.md` for the version (the upstream README, renamed inside the
bundle). It does not read `@keyframes` or `animation-delay`; reduced motion is
collapsed by hand.

### `assets/pure-design/tools/lens-map.mjs`

Regenerates the two displacement maps of the cursor lens. Run only when
changing the lens read.

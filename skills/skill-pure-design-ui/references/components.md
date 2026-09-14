# Components

The class vocabulary. Import, do not rewrite. Every class here already carries
its radius by role, its hit floor under `pointer: coarse`, its reduced-motion
collapse and its `--surface-context`. The live guide with every component in
four modes is `assets/pure-design/preview/index.html`, served from the
`assets/pure-design` root (`python3 -m http.server 8731`, then
`/preview/index.html`).

## Page layout (template)

`.shell` (max `--container-xl`, `--space-32` gutters), `.grid` (twelve columns,
gap `--space-24`, every child `min-width: 0`), `.axis-a` (1 to 7),
`.axis-a-wide` (1 to 10), `.axis-b` (9 to 13), `.bleed` (1 to 13), `.step-1`
24, `.step-2` 48, `.step-3` 96, `.band` (96 top and bottom). Specimen grids
are the declared exception to the two axes and must be declared in code.

## patterns.css

### Type and surface

`.eyebrow` (mono label, tracking 0.12em), `.display` (Archivo 300 wide, section
titles only), `.prose` (Public Sans at `--text-15`, measure 480), `.balance`,
`.pretty`, `.section-header`, `.surface`, `.hover-surface`, `.card-glass`,
`.hairline-grid` (cells carry no border; `gap: 1px` over a `--border`
background; radius and `overflow: hidden` on the grid, not the cell), `.media`
(radius media, declared size), `.avatar`.

### Controls

`.pill` (glass by default), `.pill-sm`, `.pill-solid`, `.link-cta`,
`.link-muted`, `.hover-fade`, `.tag`, `.status` (always with a label or icon),
`.control-round`, `.glass` and its textures and shapes, `.hit` (extends the
hit area without extending the drawing).

### Forms

`.field`, `.field-label` (mono, eyebrow tracking), `.input`, `.textarea`,
`.select`, `.select-shell`, `.check` (label and control share one target;
box at `--radius-mark`), `.field-error`, `.form-actions`, `[data-loading]`
(ring, same label).

### State and text

`[hidden]` (forced `display: none`), `.truncate`, `.clamp-2`, `.clamp-3`,
`.break-words`, `.min-w-0`, `.num` (tabular, mono), `.empty` (says what will
appear and the next action), `.skeleton`, `.skeleton-line` (copies the final
box; slows under reduced motion), `.sr-only`, `.skip-link`.

### Overlays

`.overlay` (blur `--blur-pill`; the only place it is allowed), `.modal` (focus
trapped, returned to the trigger), `.drawer` (overscroll contained),
`[data-dragging]`, `.tip`, `.tip-group` (first waits, neighbours open at
once).

### Entrances

`.fade-up`, `.fade-scale`, `.stagger` (60ms per item, six steps).

### Visualisation

`.viz`, `.viz-crosshair`, `.viz-dot`, `.viz-mark`, `.viz-tip`, `.viz-legend`,
`.viz-draw` (line drawing with `--ease-out-soft`), `.viz-grow` (bars, origin
where the movement starts), `.viz-appear`. Marks take `--chart-n`; labels stay
in `--text`. SVG transforms go on a `g` wrapper with `transform-box: fill-box`.

### Liquid

`.liquid`, `.liquid-sheet`, `.liquid-blob`, `.liquid-content`, `.liquid-item`,
`.liquid-tight`, `.liquid-wide`, `.liquid-sq`, `.liquid-stack`, `.liquid-fold`,
`.liquid-trail`, `.liquid-drip`, `.liquid-morph`, `.liquid-pulse`, `.is-flux`,
`.is-open`. See `materials.md`.

## Icons

`web/icons.svg`: 65 symbols on a 24 box, round caps, `currentColor`
throughout, none derived from a licensed set.

```html
<svg class="icon" aria-hidden="true"><use href="pure/icons.svg#search"/></svg>
```

Three sizes and no more: `.icon` 20 (control), `.icon-sm` 16 (metadata),
`.icon-lg` 24 (heading). The box is square and `flex: none`, so a long label
never crushes the drawing. Weight lives in `.icon` as `var(--stroke)` (2px),
the same token as the spinner ring and the checkbox mark;
`vector-effect: non-scaling-stroke` as an attribute on each shape keeps it
equal across sizes (the effect does not inherit and the content of a `use`
lives in a shadow tree).

`aria-hidden` by default because the icon sits next to a label that says the
same thing. An icon alone in a control carries meaning, and then the label goes
on the control as `aria-label`, not on the drawing.

| Group | Names |
|---|---|
| Navigation | `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `external`, `close`, `menu`, `more`, `expand`, `collapse` |
| State | `check`, `check-circle`, `alert`, `info`, `clock`, `dot`, `shield` |
| Action | `plus`, `minus`, `search`, `filter`, `sort`, `copy`, `edit`, `trash`, `download`, `upload`, `refresh`, `settings`, `link`, `share`, `send` |
| Object | `file`, `folder`, `database`, `code`, `terminal`, `grid`, `list`, `table`, `chart-bar`, `chart-line`, `image`, `mail`, `user`, `users`, `calendar`, `book`, `tag`, `bookmark` |
| Agent and science | `sparkle`, `tool`, `branch`, `play`, `pause`, `stop`, `molecule`, `helix` |
| Mode | `sun`, `moon`, `contrast` |

A `use` pointing at an id no symbol carries renders empty with no error.
`check.mjs` covers it. RTL: flip directional arrows, chevrons, indents and
send glyphs with `scale: -1 1` under `[dir="rtl"]`; never flip logos,
checkmarks, clocks or media controls.

## agent.css

Twenty components for interfaces where a model writes to the screen. Depends on
`tokens.css` and `patterns.css`. Adds no colour. The patterns an AI product
builds from them (plan preview, autonomy, receipts, checkpoints, diff view,
digest) are in `agent-patterns.md`.

| # | Component | Classes |
|---|---|---|
| 01 | Loading state | `.loader`, `.loader-grid`, `.loader-dots`, `.loader-orbit`, `.loader-label`, `.loader-time` |
| 02 | Reasoning trace | `.trace`, `.trace-head`, `.trace-body`, `.trace-step` |
| 03 | Streaming text | `.stream`, `.stream .tok`, `.caret`, `.sources`, `.source`, `.followups`, `.followup` |
| 04 | Approval card | `.ask`, `.ask-title`, `.ask-options`, `.ask-option` |
| 05 | Tool calls | `.calls`, `.call`, `.edits`, `.edit` |
| 06 | Task rows | `.tasks`, `.task-row`, `.task-sub` |
| 07 | Chat panel | `.thread`, `.tabs`, `.tab`, `.msgs`, `.msg-user`, `.msg-agent` |
| 08 | Prompt bar | `.composer`, `.composer-field`, `.composer-actions`, `.menu`, `.menu-item`, `.dictate` |
| 09 | Recommendation | `.suggest`, `.confidence`, `.meter`, `.alt`, `.arg-inline` |
| 10 | Context chunks | `.chunks`, `.chunk`, `.chunk-head`, `.chunk-body`, `.chunk-src` |
| 11 | Proposed edits | `.grid-table`, `tr[data-diff]`, `.strike` |
| 12 | Records grid | `.grid-table` with `.tag`, `.num`, `.truncate` |
| 13 | Filtered list | `.filters`, `.filter` |
| 14 | Workspace nav | `.side`, `.side-head`, `.side-group`, `.side-item`, `.key` |
| 15 | Command search | `.palette`, `.palette-field`, `.palette-list`, `.palette-item` |
| 16 | Insight card | `.insight`, `.insight-head`, `.insight-pager`, `.metrics`, `.metric`, `.up`, `.down` |
| 17 | Code block | `.code`, `.code-head`, `.code-body`, `.code-line`, `.ln`, `.tok-key`, `.tok-fn`, `.tok-str`, `.tok-com` |
| 18 | Inspector | `.inspector`, `.inspect-head`, `.inspect-group`, `.inspect-row`, `.numfield`, `.seg` |
| 19 | Selection actions | `.selection`, `.selection mark`, `.selection-bar` |
| 20 | Agent flow | `.flow`, `.flow-node`, `.flow-mark`, `.flow-label`, `.flow-note`, `.flow-branch`, `.flow-leg`, `.flow-when` |

The flow is a column, not a canvas: order, splits and what each leg does.
Free rearrangement needs per-frame measurement and is declared out. Node kind
is state (`--status-*`) and each leg repeats its condition in text. Below the
breakpoint the branch stacks.

### Agent tokens and keyframes

`--stream-step` 45ms (multiplied by `--i`), `--caret-blink` 1s, `--meter` 4px,
`--rail` 28px, `--gutter-code` 36px, `--pixel` 3px. Keyframes `pure-token`,
`pure-caret`, `pure-pixel`, `pure-bounce`, `pure-eq`, `pure-sweep`, all on
`opacity`, `transform` or `scale`.

### Colour assignment in the agent layer

| Meaning | Source |
|---|---|
| task or metric state | `--status-*` (`.task-row[data-state]`, `.up`, `.down`, `tr[data-diff]`) |
| series identity | `--chart-1..8` in slot order (dot beside a metric name) |
| syntax highlight | `--text`, `--muted` (`.tok-str`, `.tok-key`, `.tok-com`); never a chart slot |

### Radius by role in the agent layer

| Element | Radius |
|---|---|
| `.ask`, `.suggest`, `.thread`, `.composer`, `.side`, `.palette`, `.insight`, `.inspector`, `.trace` | `--radius-surface` |
| `.chunk`, `.call`, `.edit`, `.menu-item`, `.side-item`, `.palette-item`, `.numfield`, `.metrics` | `--radius-field` |
| `.code` | `--radius-media` |
| `.source`, `.followup`, `.filter`, `.task-row`, `.chunk-src`, `.tab`, `.seg`, `.selection-bar`, `.meter` | `--radius-control` |
| `.arg-inline`, `.key`, `.confidence .bars i`, `.selection mark` | `--radius-mark` |

### Craft applied per component

| Component | Requirement |
|---|---|
| `.trace-head` | `aria-expanded` and `aria-controls` on a real button |
| `.tabs` | `role="tablist"`, `aria-selected`, arrow-key navigation |
| `.stream` | `aria-live="polite"` on the region, not on each chunk |
| `.loader` | `role="status"` with the elapsed reading inside it |
| `.ask-options` | `fieldset` with `legend`, radios rather than buttons |
| `.composer-field` | `--text-field` at 16px, never `--text-12` |
| `.palette-list` | `overscroll-behavior: contain`; `.empty` replaces the list with a way out |
| `.task-row` | glyph in the rail repeating state in shape, not colour alone |
| `.insight-pager` | `.hit` where the visual control is under 24px |
| `.grid-table` | `.num` on every compared column; `caption` in `.sr-only` |

### Translations from the source catalogue

| Source behaviour | Pure Design version |
|---|---|
| `grid-template-rows` accordion | `[hidden]` plus staggered `pure-fade-up` on the steps |
| `filter: blur(4px)` on an arriving chunk | `opacity` plus a `--nudge-1` rise |
| confidence and progress by `width` | `transform: scaleX()` with `transform-origin: left` |
| chip reveal by `max-width` and `margin` | `transform` and `opacity` |
| shimmer by `background-position` | pseudo-element swept by `translateX` |
| `border-radius` morph on the prompt bar | dropped |
| `WORKSPACE` group heading | sentence case, mono face, eyebrow tracking |

## Migrating an app that uses Bootstrap colours

Import `web/tokens.css` at the top of each stylesheet and swap: `#0d6efd` to
`var(--accent)`, `#198754` to `var(--status-good)`, `#dc3545` to
`var(--status-critical)`, `#adb5bd` to `var(--muted)`, background greys to
`var(--bg)` and `var(--surface)`. Charts move to the data palette.

# Review routines

Twelve routines. `polish` is the routine; seven others are its steps in a fixed
order; four are products called by name and never part of the routine. Each
one below states its method, its traps (every trap here produced a wrong
number at least once) and its output line. The report format lives in
`SKILL.md`.

## Where the input comes from

Decide this first.

- **figma.com URL**: read through the Figma MCP. `get_metadata` gives the tree
  and geometry cheaply; `get_screenshot` the pixel; `get_design_context` the
  code and bound tokens (expensive: ask only for the node that matters);
  `get_variable_defs` the bound variables; `get_motion_context` the declared
  animation; `search_design_system` the library components. Writing to a file
  loads `figma-use` first, a mandatory prerequisite.
- **Served page**: use the browser tool. Open the URL, read the tree, run
  JavaScript to measure. Measuring the rendered page is the only way to catch
  what `check.mjs` cannot see.
- **File on disk**: read the CSS and HTML directly; run `scripts/audit_css.py`.
- **Artifact or React component in chat**: treat as file on disk; render it
  when a browser tool exists.

## Before anything

Run `node assets/pure-design/tools/check.mjs` if the language repository (or
the bundle) is at hand. It passing is not the page passing: it reads token
against token and never sees which token the page put on which background.
It failing means the base is wrong and there is no point auditing what was
built on top.

## Two widths, always

The routine runs twice, at 1280px and at 375px. The narrow one does not
inherit the wide one's approval, and the reverse holds: a touch target that
passes narrow can fail on a wide tablet, because hit area is decided by
`pointer: coarse`, never by width. When resizing, reload: a device lock read
on load does not re-run on resize. Confirm
`matchMedia('(pointer: coarse)').matches` before reporting a hit-area number.

## The order

1. contrast sweep, because it is the only finding that makes the screen
   unusable for someone. Both widths.
2. craft review: keyboard, hit area, visible focus, error state, empty state.
   Both widths.
3. responsive: what only the narrow screen reveals.
4. spacing audit: three steps, two axes.
5. component analysis: radius by role, blur by size, one size per class,
   colour by function, cascade.
6. motion opportunities: where motion is missing and where it is surplus.
7. UX writing.
8. polish details (`polish-details.md`): concentric radius, optical alignment,
   shadow versus border, tabular numbers, wrapping, icon weight, press,
   `will-change`.

Group findings by severity, not by step. End with the counts.

---

## 1. Contrast sweep

Triggers: "verify contrast", "colour accessibility", "is this readable",
"WCAG", "esse texto esta legivel".

`check.mjs` reads token against token (only `text`, `muted`, `accent`). This
routine reads the page.

Method:
1. Serve the page and open it in the browser tool.
2. Force the hidden states before sweeping: error, offline, modal, tooltip,
   dropdown, the form behind a button. A state that never opened is never
   measured, and that is where the defect lives. Set the state classes with
   JavaScript and only then sweep.
3. For each element with a text node, resolve the background in this order:
   (a) computed `--surface-context` on the element; every language component
   that paints a background declares it and it inherits; (b) only if absent,
   walk up to the first opaque background. Step (a) exists because of
   `.liquid`, where the background is a sibling of the text.
4. Repeat in the four modes.

Turn transitions off before measuring colour: `* { transition: none
!important }` injected, removed after. Swapping the mode class and reading the
colour in the same instant returns the initial value of the transition in
flight (a 5.37:1 button read 2.65 that way). A background tab has the same
problem since no frame runs there.

Floors: normal text 4.5:1; large text (24px, or 19px at 600) 3:1; focus
indicator and control border 3:1; chart mark against surface 3:1.

The two recurring errors: `--secondary` as text (2.61 to 4.25 over
`--surface`; fix is `--muted`), and a chart slot as type (series colour on the
mark, label in `--text`).

Colour resolution traps:
- A translucent background composes, it does not cover. A tag with
  `rgba(45,90,122,0.24)` over the surface has the mixture as its background.
  Accumulate translucent layers up to the first opaque one and compose in
  reverse. Treating alpha as opaque failed three tags at 1.0 to 1.6 when the
  real composite gave 5.4 to 6.8. `scripts/contrast.py --fg --bg --over`
  does the composition.
- `color-mix` computes to `oklab(...)` and an rgb parser returns silent
  garbage. Convert every colour through a canvas: paint one pixel with
  `fillStyle`, read it with `getImageData`.
- The linked CSS comes from cache even on a fresh navigation. Swap the `href`
  for one with a random suffix; confirm by reading a known element's colour
  before and after.

Output, one line per failure with the number:

    .card .meta        --secondary over --surface   3.4:1  (floor 4.5)  ->  --muted

## 2. Craft review

Triggers: "review the interface", "is it usable", "quality checklist",
"better interface", "interaction accessibility".

Material is the glass chapter; this is behaviour. The full tables are in
`craft-rules.md`. The ones that decide most builds:

- Keyboard: every pointer operation possible from the keyboard;
  `:focus-visible` ring (`--focus-ring` 2px, `--text` over glass);
  `outline: none` without a substitute never; focus order follows visual
  order; a modal traps focus and returns it.
- Reach: `--hit-min` 24, `--hit-min-touch` 44; `.hit` when the visible shape is
  smaller; `-webkit-tap-highlight-color: var(--tap-highlight)`.
- Forms: never block typing or paste; incomplete submit surfaces the inline
  error and moves focus to the first; the submit keeps its label and gains a
  ring; text field at `--text-field`.
- State: empty, sparse, dense and error are four designs; skeleton copies the
  final box; compared numbers in `.num`; URL carries the state;
  `color-scheme` declared per mode.
- Motion: only `transform` and `opacity`; named properties; no layout
  property; everything collapses under reduced motion; controls settle.
- Components that already exist are imported, not rewritten.

## 3. Responsive

Triggers: "mobile version", "desktop to mobile", "adapt for phone", "does this
break narrow", "responsivo".

Rules in decision order:
1. The grid collapses at `--breakpoint-stack` (768px): everything starts on
   column 1; `.axis-b` becomes a block below. No third axis.
2. Steps do not shrink proportionally: 96 to 48, 48 to 24, 24 stays 24.
3. Hit area by `pointer: coarse`, never by width. The language's control
   classes already carry the 44px floor; audit what the project created.
4. Type does not shrink: prose stays `--text-15`, control `--text-12`, field
   `--text-field`. Only the section title changes step, never leaves the
   scale.
5. Deep glass drops a step below the breakpoint on its own; not a finding
   unless overridden.
6. What leaves the screen does not become a hidden menu by default; stack
   first.
7. Every table lives inside `.table-scroll`, not optional, not dependent on
   the table being wide today. A short table may become a card list, one per
   row; a loose table does not exist.

Verify: resize to 375x812 and reload; sweep again with contrast and craft.
The deciding overflow signal is `documentElement.scrollWidth > innerWidth`,
not a child's rectangle. If the stylesheet changed between measurements,
force a reload of it (new `href` suffix); a measurement against cached CSS
reads exactly like "the fix did not work".

In Figma, generating the narrow version loads `figma-use` before any
`use_figma`.

## 4. Spacing audit

Triggers: "audit spacing", "fix the padding", "align to the grid", "spacing
inconsistent".

The 4/8pt grid most tools assume is not this language's. Layout uses three
steps and only three: 24 approaches, 48 separates blocks within a section, 96
separates sections. The smaller steps exist inside a component and are not
layout steps: `margin-top: var(--space-32)` between two blocks is a finding.

Two axes: every text starts on column 1 or column 9 (`.axis-a`,
`.axis-a-wide`, `.axis-b`, `.bleed`). A block starting on column 3 or 5 is a
finding even if it looks good. The declared exception is a specimen grid,
declared in code.

Look for: a literal space value (`padding: 20px`, `gap: 1.5rem`); a layout
step outside 24/48/96; a block off the two axes; an inverted radius ladder; a
hit area under the floor.

In Figma, `get_metadata` gives the geometry without the cost of design
context. Sum the auto-layout gaps between siblings and compare with the scale.
Do not measure space from a screenshot: the pixel lies at zoom scale.

    [break]  .panel > .row     gap 20px, off the scale        ->  var(--space-24)
    [polish] section#about     starts on column 3, off axis  ->  .axis-a or .axis-b

## 5. Component analysis

Triggers: "analyse the components", "is this component right", "audit the
design system".

A component is right when each value came from the role it fills, not from
what looked good. Five questions in order:
1. Did the radius come from the role? Surface 12, field 8, media 8, control
   full, circle for avatar and radio, mark 4. Never a live corner. Concentric.
2. Did the blur come from the size? `.glass-thin` 4, `.glass` 16,
   `.glass-frost` 30, `.glass-deep` 56, `--blur-card` 32 in `.card-glass`,
   `--blur-pill` 72 only in `.overlay`. Text on glass is `--text`.
3. One size per control class? Control `--text-12`, prose `--text-15`,
   metadata `--text-12` mono, field `--text-field`. `--font-display` only for
   section titles, always with `--font-display-stretch`.
4. Is the colour in the right function? State `--status-*`, series
   `--chart-n`, never swapped. Syntax highlight in ink levels. Diff tint by
   `color-mix` over a status token. No hex outside `tokens.css`.
5. Does the modifier win the cascade? Resolve rule by rule, not by eye.

And the one that breaks everything silently: `backdrop-filter` declared before
`-webkit-backdrop-filter` disappears in the minifier. Check
`getComputedStyle(el).backdropFilter` first in a suspect project.

Apply fixes one at a time in the file and say which rule each serves; then run
`check.mjs` if the language repository is at hand. In Figma,
`get_design_context` on the component node plus `get_variable_defs`; a loose
value where a variable existed is the most common finding.

## 6. Motion opportunities

Triggers: "where to add animation", "does this screen need motion", "find
animation opportunities", "review the transitions", "replace loose duration
with token".

Map each state change to the recipe table in `motion.md`. Tie between two:
the cheaper. Where it does not help: something that did not change state;
hover displacement on a control; more than one emphasis moment per flow
(`.motion-check` costs `--duration-6` on purpose); accordion by height.

Tokenise loose durations, curves and distances by use, not by number; list
what matches nothing as `no matching use token`. What is already forbidden
(`transition: all`, layout property, new curve, missing reduced-motion guard)
belongs to craft review, not here.

In Figma, `get_motion_context` gives the declared animation. Translate to the
equivalent recipe, not to new keyframes. If the file asks for an overshoot
curve, say it does not exist here and what goes in its place.

## 7. UX writing

Triggers: "review the interface copy", "improve the copy", "ux writing", "what
to write on this button", "error message".

- Sentence case in everything: heading, label, button, table head, group
  heading, chip. No uppercase, no deliberate lowercase.
- No caption under a heading. Support text only when asked for or when the
  user errs without it.
- The button says what happens: "Save changes", not "OK"; "Delete three files",
  not "Confirm". The label repeats the verb of the question.
- No product voice: no "powerful", "effortless", "in seconds", "simply". No
  exclamation mark. No emoji anywhere.
- Error in three parts, one sentence: what happened, why, what to do now.
  "The file is over 10 MB. Upload a smaller version." Never blame, never
  apologise.
- Empty state says what will appear and the next action: "No projects yet.
  Create the first one to start."
- Compared numbers in `.num` and `--font-mono`; units spelled out when they
  fit, abbreviated when not; decimal comma in PT-BR, point in EN.
- Language: what the user reads is English even when the conversation is
  Portuguese; what stays with the team is Portuguese.

In Figma, `get_metadata` returns each node's text. List swaps in a before and
after table; write to the file only after confirmation, loading `figma-use`
first.

---

## Products (called by name, never part of the routine)

## Design review

Triggers: "review this design", "what do you think of this screen", "design
review", "layout critique", "is this good".

The other routines measure; this one judges, on the pixel (`get_screenshot`
in Figma, a browser screenshot on a served page). Five questions: hierarchy
(what jumps first is what matters most; weight from size and space before
colour); density (uniform space is absence of decision; the three steps say
what belongs to what); rhythm (do the two axes hold the whole page); material
consistency (more than two glass textures in a fold is noise); the decision
nobody took (the place where space, size or colour was inherited from the
default; name it). The anti-defaults table in `taste.md` is the list of the
usual suspects for that last question.

Start with what works, one sentence, naming the concrete decision. Then the
problems in order of impact, each with its fix. No "consider", "maybe",
"could". Do not propose redoing the screen. A contrast or spacing finding seen
in the image goes in one line to its owning routine.

## Anatomy

Triggers: "document this component", "component anatomy", "diagram of the
parts".

Three pieces in order: the image with numbered markers (reading order, outside
in, top down; circle at `--radius-circle`, `--text-11` mono, `--text` on
`--surface`, never a chart colour); the parts table with columns `#`, part,
token, value, required (a part without a token is a finding, not a row);
variants and states (rest, hover, focus visible, active, disabled, loading,
error; a state the component lacks is a line saying so).

Parts come from `get_metadata` in Figma (layer names become part names; "Frame
42" is a finding) or from the component's CSS rule and markup (each child
selector is a part). Descriptions say what a part does, not how it looks. The
marked image can be produced with draw.io or as an SVG artifact.

## Handoff

Triggers: "document for handoff", "component handoff", "spec this component",
"pass to the dev".

Six sections: markup (the minimum HTML with language classes; both layers when
`.liquid` demands it, with the reason); tokens (property to token, no literal
in the token column); states (one per line, what changes); keyboard behaviour
(key by key: Tab, Enter, Space, Escape, arrows; where focus enters, is held,
returns; a component without this section is not delivered); the four modes
(usually "nothing changes because everything comes from tokens", and that
sentence is the answer); the cases that break (long label, empty list,
thousand items, negative number, other language, 320px, no JavaScript; one
per line with what the component does).

Markdown, sentence case, no caption under a heading, no premise section, no
prose justifying choices. In Figma, `get_design_context` plus
`get_variable_defs`; a loose value enters the handoff as a pending item, not a
specification. A Notion page is a valid destination when the user keeps
handoffs there.

## Tokens from a selection

Triggers: "generate a design system from the assets", "extract tokens",
"design system gen", "map these screens to the language".

This routine does not generate a new palette. It reads what the selection uses
and says, value by value, which token receives it and what has nowhere to go.

1. Extract raw values: `get_variable_defs` and `get_design_context` in Figma;
   in code, sweep hex, rgb, px, rem, ms and cubic-bezier
   (`scripts/audit_css.py --list` does the sweep).
2. Group by family before mapping: ink, surface, data, state, type, size,
   space, radius, motion, glass. The same grey can be a border in one place and
   text in another, and those are different tokens.
3. Map by role, never by colour proximity. A grey used as a border becomes
   `--border` even if numerically closer to `--muted`. Series to `--chart-n` in
   order of appearance; state to `--status-*`.
4. List what remains as duplicate, outside the language, or error (see
   `tokens.md`, "Adding a token").

Output: one mapping table and one remainder list. Do not write `tokens.css`
without confirmation.

    | value found | where          | family | token        |
    | #3E5C76     | 12 nodes       | ink    | --accent     |
    | 20px        | 4 nodes        | space  | (no token)   |

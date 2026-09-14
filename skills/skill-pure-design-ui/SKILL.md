---
name: skill-pure-design-ui
description: Builds, reviews and polishes interfaces, pages, dashboards, components and charts in Pure Design, Madson de Luna's visual language (four modes, script-verified tokens, glass and liquid materials, motion recipes, agent-UI components, matplotlib and plotly themes), merged with the polish details of make-interfaces-feel-better and the agency-grade taste of soft-skill. Use whenever the user mentions Pure Design, "pure", tokens.css, patterns.css, glass, liquid, the four modes, or asks to build a UI, landing page, dashboard, Streamlit or Plotly app, review or polish a screen, "make it feel better", "feels off", "revisa essa tela", "polir a interface", "roda o pure", "looks generic", "make it premium", "agency-grade", contrast, WCAG, spacing audit, mobile version, UX writing, component anatomy or handoff, tokens from a Figma file, or a themed matplotlib chart. Also use for any frontend, CSS, HTML, React or Tailwind work by this user, even when the language is not named.
license: MIT
compatibility: Works standalone. Best with Node 18+ (tools/check.mjs), Python 3.9+ (scripts), a Figma MCP connection for design files, and a browser tool for rendered audits.
metadata:
  author: Madson A. de Luna Aragao
  version: 1.1.0
  language-version: Pure Design 1.6.0
  sources: madsondeluna/pure-design-language, madsondeluna/make-interfaces-feel-better, madsondeluna/taste-skill (soft-skill), ui.halaska.com (agent patterns), bencho.dev (gesture blocks), torph.lochie.me (text morph)
---

# Pure Design UI

One skill for the whole visual language: the tokens and files that make it, the
craft rules that decide behaviour, the polish details that make an interface
feel finished, the taste that makes a build read as chosen rather than shipped,
the twelve review routines, and the Python side for charts.

Great interfaces come from small decisions compounding, and this language makes
those decisions once so they are not re-taken per screen. The job of this skill
is to keep every new screen inside those decisions and to find where an existing
screen left them.

## Read this first: the twelve rules that decide almost everything

These fail a build or a review. Everything else is refinement.

| # | Rule | Bound to |
|---|---|---|
| 1 | No hex, rem, px or ms literal in app CSS; every value is `var(--token)`. A missing value becomes a token in `tokens.css`, never a literal | `scripts/audit_css.py` |
| 2 | Four modes, all four clicked through before shipping: `:root`, `.paper-like`, `.deep-blue`, `.dark`. A value that only works in light is a defect | `color-scheme` |
| 3 | Text starts on column 1 or column 9 of twelve. Vertical rhythm uses 24, 48 and 96 only | `.axis-a`, `.axis-b`, `.step-*` |
| 4 | Sentence case in every string: headings, buttons, table heads, chips. No caption under a heading. No product voice. No emoji | copy |
| 5 | Radius follows role: surface 12, field 8, media 8, control full, mark 4, circle 50%. Concentric: a child never rounds harder than its parent | `--radius-*` |
| 6 | One size per control class: control `--text-12`, prose `--text-15`, metadata `--text-12` mono, text field `--text-field` (16px, or iOS zooms) | `--text-*` |
| 7 | Only `transform` and `opacity` animate (plus `filter` inside the motion layer). Every transition names its properties. `transition: all` never. No layout property ever | `check.mjs` |
| 8 | Six durations, five curves, nothing else. Hand-written `cubic-bezier` or ms is a seventh step entering through the back door | `--duration-*`, `--ease-*` |
| 9 | State is `--status-*`, series is `--chart-1..8` in order, never cycled, never swapped. `--secondary` is a border colour, never text | tokens |
| 10 | Hit area 24px always, 44px under `pointer: coarse`, decided by input and never by width. Focus ring visible on `:focus-visible`; `outline: none` without replacement never | `--hit-min*`, `--focus-ring` |
| 11 | Reduced motion collapses every duration and delay, including staggered entrances. Motion is never the only feedback channel | `prefers-reduced-motion` |
| 12 | Glass and the light layer ship with every page, as on madsondeluna.com: `light.css` and `light.js` are always linked, the app root is `.lit-field` with `data-lit`, pills are `pill glass lit lit-swell`, carrying cards are `card-glass lit`, the panel that carries the experiment is `glass glass-frost lit lit-edge`. A build with flat `.surface` boxes and no light layer is not in the language. The cursor lens is the exception: `.lit-cursor-only` and `.lit-cursor` are opt-in per request, never a default, because replacing the system pointer reads as machine-made and costs the I-beam and the hand | `light.css`, `materials.md` |

## Decide what the user needs

| Request looks like | Do this | Read |
|---|---|---|
| Build a new page, app, dashboard, landing, artifact | Scaffold from the bundle, then compose from `patterns.css` classes | Building below, `references/components.md`, `references/tokens.md` |
| Build a Streamlit, matplotlib, plotly, seaborn figure | Apply the Python theme, series in slot order, three-series cap on scatter | `references/python-charts.md` |
| Add glass, liquid, pointer light, a hover effect | Pick the texture by surface size, never stack two translucent layers | `references/materials.md` |
| Add animation, transitions, a loader, a toast | Pick the recipe from `motion.css`; tokenise by use, not by number | `references/motion.md` |
| Text that morphs in place, a rolling number, a status phase label | `.motion-text-swap` for two fixed labels; torph on the tokens for arbitrary strings and place-value numbers | `references/motion.md` |
| Slide to confirm, radial menu, reorder, drag stepper, a gesture block | Keep the read, re-express on the tokens, give it a keyboard path; no overshoot, no layout transition | `references/motion.md` |
| An AI product flow beyond one component: plan, autonomy, permissions, receipts, checkpoints, diff, digest, notifications | Pick the group first (conversation, trust, control, output, ambient), then compose the pattern from existing classes | `references/agent-patterns.md`, `references/components.md` |
| Review, polish, "what is wrong", "feels off", "roda o pure" | Run the polish routine at both widths, report by severity | `references/review-routines.md` |
| Contrast, WCAG, readable | Contrast sweep with hidden states forced, four modes | `references/review-routines.md`, `scripts/contrast.py` |
| Spacing, grid, padding | Spacing audit: three steps, two axes | `references/review-routines.md` |
| Mobile, responsive, narrow | Narrow is a second design, not the wide one shrunk | `references/review-routines.md`, `references/craft-rules.md` |
| Copy, button label, error message, empty state | UX writing rules | `references/review-routines.md` |
| Anatomy, handoff, spec for a dev | Products, not verifications; call by name | `references/review-routines.md` |
| Figma file as input, tokens from a selection | Figma MCP, metadata first, design context only on the node that matters | `references/tooling-and-mcp.md` |
| Concentric radius, optical alignment, shadows, tabular numbers, icon stroke, hit area | The polish details, reconciled with the tokens | `references/polish-details.md` |
| "Looks generic", "make it premium", "agency-grade", "like Linear or Apple", a hero, a landing, a marketing page | Choose vibe by mode and composition by axis before writing; bezel, island button, detached nav; run the taste checklist | `references/taste.md` |

When the request is ambiguous between building and reviewing, review first: a
screen that already exists is a screen that already has findings.

## Building

### Step 0: choose the composition

Before writing, decide three things and do not let the framework decide them:
the mode and material that carry the vibe (dark glass for a tool, paper for
reading, light surfaces for consumer), the composition (two axes, hairline
grid with unequal spans, or editorial split), and where the 96 step falls.
Never repeat the previous build's combination for the same user. The
reasoning and the mappings are in `references/taste.md`.

### Step 1: scaffold

```bash
# copies the language files into <project>/pure, writes index.html from the template,
# records the language version. Drop layers with --no-light --no-motion --no-agent.
python3 scripts/scaffold.py <project-dir> [--no-light] [--no-motion] [--no-agent]
```

Link order is mandatory: `tokens.css`, `patterns.css`, `light.css`, `motion.css`,
`agent.css`, then `light.js` deferred. `light.css` and `light.js` are part of
every page (rule 12); `motion.css` only if a named recipe is used;
`agent.css` only if a model writes to the screen. Tailwind v4 imports
`web/theme.css`, which already pulls `tokens.css`. The template carries the fonts
(Archivo 300 at width 125, Public Sans 300 to 600, Spline Sans Mono 400 and 500),
the twelve-column grid on two axes, the three spacing steps, the skip link and a
mode switcher that keeps the mode in the URL.

`icons.svg` must be served over http: an external `use` does not resolve over
`file://`, nothing errors, the element comes out empty.

### Step 2: compose from what exists

Do not rewrite a field, a card, a modal, an empty state or a skeleton. Import the
class. `patterns.css` carries the surface, control, form, state, overlay,
visualisation and icon layers; `agent.css` carries twenty components for
model-driven interfaces. The full list with the radius each one takes is in
`references/components.md`.

For a single-file artifact or an HTML mockup where the bundle cannot be linked,
inline `tokens.css` first and only the rules actually used from `patterns.css`;
keep the token names intact so the artifact can be moved into a project later.

### Step 3: write the app layer under the rules

- Layout: `.shell`, `.grid`, `.axis-a` (1 to 7), `.axis-a-wide` (1 to 10),
  `.axis-b` (9 to 13), `.bleed`. `.step-1/2/3` for 24/48/96.
- Any value the token scale lacks is a finding, not a literal. Add it to
  `tokens.css` and to `tokens/tokens.json` in the same session.
- Chart series come from `--chart-1` to `--chart-8` in order. Scatter, bubble, map
  and small multiples cap at three series; beyond that, facet or group. Never two
  y-axes.
- The narrow screen (375px) is designed alongside the wide one (1280px), and the
  breakpoint literal in `@media` must equal `--breakpoint-stack` (768px).

### Step 4: verify before handing over

```bash
python3 scripts/audit_css.py <project-dir>          # literals, transition: all, layout transitions, backdrop order
python3 scripts/contrast.py --pairs                   # token pairs in four modes
node assets/pure-design/tools/check.mjs               # the language's own 40-odd checks
```

Then run the pre-output checklist in `references/taste.md` (was the vibe
chosen, does the page breathe at 96, are the carrying surfaces bezelled, is
the nav detached, does anything declare Inter or a loose curve), and click
through all four modes and both widths. `check.mjs` passing is not the page
passing: it reads token against token and never sees which token the page
put on which background.

## Reviewing

Two review modes. Use `full` when none is given.

| Mode | Coverage | Finding cap |
|---|---|---|
| `quick` | Primary path and highest-traffic states; only `break` and `risk` | 5 |
| `full` | Whole requested scope, both widths, four modes, all routine steps | 15 |

The routine runs twice, wide and narrow, and the narrow one does not inherit
the wide one's approval. Order matters and is not arbitrary:

1. Contrast sweep, because it is the only finding that makes the screen unusable.
2. Craft review: keyboard, focus, hit area, forms, states, URL, reduced motion.
3. Responsive: what only the narrow screen reveals.
4. Spacing audit: three steps, two axes.
5. Component analysis: radius by role, blur by size, one size per class, colour by
   function, cascade.
6. Motion opportunities: where motion is missing and where it is surplus.
7. UX writing.

Then the polish pass from `references/polish-details.md`: concentric radius,
optical alignment, shadow versus border, tabular numbers, text wrapping, icon
weight, press feedback, `will-change`. Slow the interface down when motion is
involved: replay at 10% speed in the Animations panel and walk hover, focus,
active, loading, empty and error. What feels off at 10% is what is subtly wrong
at full speed.

Before suggesting a fix, identify the project's styling system and express the
change in it: Tailwind in a Tailwind project, plain CSS in a CSS project. Never
introduce a second system to apply a polish fix.

## Report format

Group by severity, not by step. State the mode, exact scope, framework, styling
convention and both widths measured.

| Severity | Meaning |
|---|---|
| `break` | Prevents use: contrast under 4.5, control without keyboard, focus without ring, text field under 16px, body scrolling sideways |
| `risk` | Breaks in a condition the current screen does not show: untested mode, missing empty state, text that overflows at the long length |
| `polish` | Everything else; appears only in `full` |

One table per severity with **Location**, **Before**, **After**, **Why**.
Location is `path/to/file:line`; with no source, the screen and component. Why
names the rule and the user impact. Consolidate a systemic issue into one row
listing every location. Omit empty sections and never pad to reach the cap.

Coverage table: for each routine step, what was inspected and the result, or
`Not reviewed` with the reason. Never imply an uninspected surface was reviewed.

Considered but rejected: one to three real candidates in `quick`, two to five in
`full`, each with the reason. No filler; if fewer exist, say so.

Verification: the exact commands or interactions run and what they returned.
A check not run is labelled `Not verified` with what remains.

Verdict: `Block` if any `break` remains, `Needs changes` if only `risk` or
`polish` remain, `Approve` only with no actionable finding. With no findings,
state "No actionable findings", keep the coverage, rejected and verification
sections, and end with `Approve`.

Do not propose a rewrite of the screen. Propose the findings.

## Language of the output

What the user reads is English, even when the conversation is in Portuguese:
labels, headings, chart captions, README. What stays with the team is
Portuguese: code comments, commit messages, the conversation. The review report
follows the language of the conversation.

## Reference files

| File | Read when |
|---|---|
| `references/tokens.md` | Choosing any colour, type size, space, radius, duration or curve; the modes; the data palette |
| `references/materials.md` | Glass, liquid, the light layer, the cursor lens; anything translucent or pointer-reactive |
| `references/motion.md` | Any transition, entrance, exit, loader, icon swap; mapping loose durations and curves to tokens; the Motion library rules; gesture blocks; text morph with torph |
| `references/craft-rules.md` | Keyboard, focus, hit area, forms, state, navigation, layout, text, delivery, narrow screen |
| `references/components.md` | The class vocabulary of `patterns.css`, the agent layer, the icon sprite |
| `references/agent-patterns.md` | AI product patterns in five groups (conversation, trust, control, output, ambient), each composed from existing classes with radius, colour and craft |
| `references/polish-details.md` | Concentric radius, optical alignment, shadows, typography rendering, icon weight, performance, and how each reconciles with the tokens |
| `references/taste.md` | Building something that must read as premium: anti-defaults, vibe by mode, composition by axis, bezel, island button, detached nav, scroll reveal, the pre-output checklist |
| `references/review-routines.md` | The twelve routines with their method, traps and output |
| `references/python-charts.md` | matplotlib, plotly, Streamlit, the palette API, the chart rules |
| `references/tooling-and-mcp.md` | Figma MCP, browser measurement, draw.io, BioRender, Claude Design, the scripts, the check |

## Bundled assets and scripts

`assets/pure-design/` mirrors the language repository at 1.6.0: `tokens/`,
`web/`, `python/`, `templates/`, `preview/`, `tools/` and `LANGUAGE.md` (the
upstream README, renamed so the skill bundle carries a single entry file).
`tools/check.mjs` runs in place from that directory.

`scripts/scaffold.py` starts a project. `scripts/audit_css.py` finds literals
and forbidden transitions in app CSS and HTML. `scripts/contrast.py` computes
WCAG 2.1 ratios for token pairs, or for any two colours with alpha compositing.
All three are Python 3, no dependencies, and exit 1 on failure so they can gate
a build.

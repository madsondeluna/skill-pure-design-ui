# Taste: the agency-grade nuance

From the soft-skill (high-end-visual-design) in madsondeluna/taste-skill. That
skill describes what makes a build read as a premium agency delivery instead
of a template with nice fonts, and it does so with literals the language
forbids: `rounded-[2rem]`, `ease-[cubic-bezier(0.32,0.72,0,1)]`,
`duration-700`, `text-[10px] uppercase tracking-[0.2em]`, `backdrop-blur-3xl`.
Read this file for the intent, then reach for the token or class that carries
it. Every mapping below is one of three things: absorbed as is, translated
into the language, or refused with the reason.

## The one idea underneath

Every default is a decision nobody took. A generic build is not ugly; it is
unchosen: the border that is 1px grey because that is what the framework
ships, the section padding that is `py-12` because that was in the example,
the transition that is `ease-in-out` because it was the first suggestion. The
design review already asks for "the decision nobody took". This chapter is the
build-time version of the same question: before writing, decide the
composition; while writing, refuse the default; after writing, run the
checklist.

## Anti-defaults

What makes a build read as cheap, and the language's answer.

| Default that fails | Why it reads cheap | In the language |
|---|---|---|
| Inter, Roboto, Arial, Open Sans, Helvetica as the face | seen everywhere, no character | The three families are fixed: Archivo wide for titles, Public Sans for prose and controls, Spline Sans Mono for identifiers. Arial and Helvetica exist only as fallbacks in the stack; never as the declared face |
| Thick generic icon set | one drawing on the page that does not belong to the page | `web/icons.svg` at `--stroke`, three sizes. Not an external light set: the language's icons share box, cap and stroke with the spinner and the checkbox |
| 1px solid grey border to fake depth | flat, adapts to no background | `--shadow-glass-rest` (ring, lift, ambient) on surfaces; borders only for structure and state |
| Harsh dark drop shadow (`shadow-md`, `rgba(0,0,0,.3)`) | a hole in the page, not weight | `--shadow-glass-rest` and `-hover`, layered and translucent, per mode |
| Edge-to-edge sticky navbar glued to the top | template silhouette | A detached pill: `.glass` or `.glass-deep` with `--space-24` above and `width: max-content`, centred. See "Fluid island" below |
| Symmetric three-column grid with no air | Bootstrap silhouette | The two axes and the hairline grid with unequal spans (see "Composition") |
| `linear` or `ease-in-out` on movement | mechanical | `--ease-out-expo` for slide and scale, `--ease-out-soft` for content, `--ease-swift` for hover displacement. `--ease-standard` stays for colour and border only |
| Instant state change with no interpolation | the interface does not acknowledge the input | Every state change transitions on `transform` or `opacity` at a `--duration-*` |
| Elements appearing statically on first load of a hero | no entrance, no hierarchy | `.fade-up` with `.stagger` on the first entrance only; never on routine interactions |
| Uppercase micro-label above a heading | shouting at 10px | `.eyebrow`: mono, sentence case, tracking 0.12em, `--text-11` |
| `h-screen` for a full-height section | iOS Safari viewport jumps | `min-height: 100dvh` |
| `window.addEventListener('scroll')` for reveals | continuous reflow, mobile frame drops | `IntersectionObserver` or a library's `whileInView`, adding a class that triggers the CSS entrance |
| `z-[9999]` | a stacking-context problem hidden by a number | Systemic layers only: sticky nav, overlay, modal, tooltip, in that order |

## Variance

The source rolls a vibe archetype and a layout archetype before writing so
that no two builds come out the same. The language keeps the mandate and
changes the dice: vibe is chosen by mode and material, layout by axis and
grid. Never produce the same combination twice in a row for the same user.

### Vibe by mode

| Source archetype | Fit | In the language |
|---|---|---|
| Ethereal glass: OLED black, mesh gradients, vantablack cards, hairlines | SaaS, AI, tech | `.deep-blue` or `.dark`; `.glass-frost` surfaces on a `.lit-field` section so the light shows through the glass; `--border` hairlines through `.hairline-grid`. The radial glowing orbs do not come across: they ask for a hue the palette does not have. What gives the depth here is the light layer, not a gradient |
| Editorial luxury: warm cream, serif display, film grain | lifestyle, agency, long reading | `.paper-like`; Archivo wide at `--text-display-section` as the display (the title separates by width, not by serif); the grain is `.glass-frost`, the only textured surface, not a page-wide overlay |
| Soft structuralism: white or silver, bold grotesk, floating components, diffused shadows | consumer, health, portfolio | `:root` light; `.surface` cards on `--shadow-glass-rest`; `.glass-lift` on hover; titles at `--text-display-name` |

### Composition by axis

| Source archetype | In the language | Narrow |
|---|---|---|
| Asymmetrical bento: masonry of unequal cards | `.hairline-grid` on `.bleed` with unequal spans (a `span 8` beside two stacked `span 4`), text inside each cell starting on its own left edge | one column, `gap` stays `--space-24`, spans reset |
| Editorial split: massive type left, interactive cards right | This is the two axes as designed: title on `.axis-a` at display size, content on `.axis-b`. It is the language's own default composition and the reason the axes exist | `.axis-b` becomes a block below; horizontal scroll preserved inside `.table-scroll` when the content is a row |
| Z-axis cascade: overlapping rotated cards | Refused. Overlap creates colliding hit areas and rotation puts a live corner on a surface. The stacked read that this archetype wants is `.motion-stack` (three deep, receding by transform in one cell) or the `.liquid` fold for a control cluster | |

Macro whitespace: the source says double the padding, `py-24` to `py-40`.
The language has one answer, the 96 step (`.step-3`, `.band`), and no larger
step. A build that wants more air does not add a step; it removes a block.
Below the breakpoint 96 becomes 48.

## Haptic detail

### Double bezel (Doppelrand)

The source nests every card in a shell: outer wrapper with a faint fill, a
hairline ring, small padding and a large radius; inner core with its own
fill, an inset top highlight and a mathematically smaller radius. That is
concentric nesting with a bezel, and the language already has both halves.

| Part | Source | In the language |
|---|---|---|
| outer shell | `bg-white/5 ring-1 ring-white/10 p-2 rounded-[2rem]` | `.surface` at `--radius-surface`, padding `--space-6` or `--space-8`, ring from `--shadow-glass-rest` |
| inner core | `rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]` | `.card-glass` or a `.surface` at `--radius-field`; the inset highlight is `--glass-bezel`, already inside `--shadow-glass-rest` |
| radius arithmetic | `outer = inner + padding` computed by hand | the ladder: 12 outside, 8 inside, concentric by construction |

Use it on the surfaces that carry the page (hero card, feature cell, the
prompt bar), not on every box: a bezel on a list row is noise. Two levels of
nesting; a third reads as packaging.

### Island button

Pill at `--radius-control`, `--space-12` by `--space-20` padding. The trailing
arrow never sits naked beside the label: it lives in its own circle
(`--radius-circle`, the control height minus `--space-8`, fill
`color-mix(in oklab, var(--text) 6%, transparent)`), flush with the right
inner padding. Icon `.icon-sm` from the sprite.

Hover: the button does not move (a control settles, it does not jump). The
inner circle may move by `--nudge-1` on the diagonal and scale by
`--light-grow` when the light layer is present; that is the `.motion-learn`
principle, only the chevron travels. Press: `scale(0.96)`, not 0.98. Magnetic
pull toward the pointer is `.lit-pull`, and it belongs to the light layer, not
to a hover rule.

### Eyebrow

`.eyebrow` before a section title. The source's `uppercase tracking-[0.2em]
text-[10px]` is the same gesture with the wrong values: mono face, sentence
case, tracking 0.12em, `--text-11`. It can sit in a pill (`.pill-sm`) when it
labels a state; otherwise it is bare text on the axis.

## Choreography

### Fluid island nav

| Moment | Source | In the language |
|---|---|---|
| closed | floating glass pill, `mt-6 mx-auto w-max rounded-full` | `.glass` (or `.glass-deep` for full-width chrome) with `--space-24` above, centred, `width: max-content`; `position: sticky` so the blur has a fixed element to sit on |
| hamburger | lines rotate 45 and -45 into an X | allowed as is: rotation is `transform`. `--duration-3`, `--ease-out-expo`, the two lines absolutely positioned; `.motion-icon-swap` is the alternative when the icon set has `menu` and `close`, which the sprite does |
| open | screen-filling overlay `backdrop-blur-3xl bg-black/80` | `.overlay` (the only place `--blur-pill` is allowed) with `.motion-modal` and `.motion-scrim`; below the breakpoint the language drops the blur a step on its own |
| links | slide up from a mask with `delay-100/150/200` | `.motion-lines` or `.fade-up` with `.stagger`: 60ms per item, capped at six |

Focus is trapped in the open menu and returned to the trigger; the URL
carries the open state if the menu is a route.

### Scroll reveal

Elements entering the viewport fade up once. Source: `translate-y-16 blur-md
opacity-0` over 800ms. Here: `.fade-up` (opacity plus a `--nudge-3` rise, or
`--motion-blur-3` on the way in when the motion layer is present),
`--duration-6` at most, `--ease-out-soft`. Trigger with `IntersectionObserver`
adding an `.is-in` class, `threshold` around 0.2, `unobserve` after the first
intersection so it never replays. Reduced motion shows the element at rest.
The reveal is for sections and cards on first scroll, not for rows in a list
that re-renders.

### Motion values, translated

| Source | Here |
|---|---|
| `cubic-bezier(0.32,0.72,0,1)` | `--ease-out-expo` (nearest by use: a heavy settle) |
| `duration-700`, `800ms+` | `--duration-6` (500ms); the scale stops there on purpose |
| `transition-all duration-*` | `transition-property: transform, opacity` |
| `active:scale-[0.98]` | `scale(0.96)` |
| `blur-md` on entry | `--motion-blur-3` (8px), motion layer only |
| `delay-100/150/200` | `.stagger` |

## Performance guardrails (absorbed as is)

- Animate `transform` and `opacity` only; `will-change: transform` only on an
  element that is actively animating and only when a first frame stutters.
- `backdrop-filter` only on fixed or sticky elements (nav, overlay), never on
  a scrolling container or a large content area: continuous GPU repaint and
  mobile frame drops. The language's textures already follow surface size;
  this rule adds position.
- Grain only where the language puts it: `.glass-frost`. A page-wide noise
  overlay, if a build insists, is a fixed `pointer-events: none`
  pseudo-element and never a child of a scrolling container.
- z-index as a short ordered scale for systemic layers, not a literal per
  component.
- `min-height: 100dvh`, never `100vh`, for full-height sections.

## Pre-output checklist

Run before delivering any built screen. The language's own verification
(`audit_css.py`, `check.mjs`, four modes, two widths) runs after this one;
this one is about the decisions.

- A mode and a material were chosen for the vibe, and the choice fits the
  product (dark glass for a tool, paper for reading, light surfaces for
  consumer).
- A composition was chosen: two axes, hairline grid with unequal spans, or
  editorial split. It is not the same one as the previous build for this
  user.
- Section rhythm breathes at 96; blocks at 48; nothing inside a block is
  tighter than the component scale.
- The surfaces that carry the page use the bezel (surface 12 outside, field
  8 inside, `--shadow-glass-rest`); list rows and minor boxes do not.
- Primary actions are island buttons: pill, trailing icon in its own circle,
  press at 0.96, no hover displacement on the button.
- Section titles are Archivo wide with `--font-display-stretch`; no Inter,
  Roboto or Arial declared anywhere.
- Every eyebrow is `.eyebrow`, sentence case.
- The nav is detached, glass, and its open state is `.overlay` with a
  staggered link entrance and trapped focus.
- First-view entrances exist (`.fade-up`, `.stagger`, or an
  `IntersectionObserver` reveal) and nothing else animates on load; no
  routine interaction stages an entrance.
- Every curve and duration is a token; no `cubic-bezier`, no `ms`, no
  `transition: all`.
- `backdrop-filter` sits only on fixed or sticky elements.
- Narrow: single column, `--space-16` gutters, spans reset, hit areas at 44
  under a coarse pointer, `100dvh` not `100vh`.
- Read it once as a stranger: does it look chosen, or does it look shipped?

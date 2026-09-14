# Motion

Motion exists to explain a change of state. If nothing changed state, there is
nothing to animate, and the right answer is "not here". Read this file for any
transition, entrance, exit, loader, icon swap, text morph, gesture block, or
when mapping loose durations and curves onto tokens.

## The floor that never moves

- Only `transform` and `opacity` animate. The motion layer adds `filter`
  (blur while moving), `stroke-dashoffset` (`.motion-check`, `.motion-spin`)
  and `background-position` (`.motion-shimmer`, `.motion-wave`). Nothing else.
- A layout property never animates: `width`, `height`, `margin`, `padding`,
  `top`, `left`, `grid-template-rows`, `flex-basis`. An accordion opens by
  taking the body out of flow with `[hidden]`; a meter grows by
  `transform: scaleX()` with `transform-origin: left`.
- Every transition names its properties. `transition: all` never; Tailwind
  `transition-all` never. Tailwind's `transition-transform` covers
  `transform, translate, scale, rotate`; for mixed properties use the bracket
  form, `transition-[scale,opacity,filter]`.
- Six durations, five curves, nothing else. `linear` stays `linear` and is not
  a token: it is the absence of a curve and appears only in loops that never
  settle.
- Everything collapses under `prefers-reduced-motion: reduce`, including the
  delay of every staggered entrance. Preserve the static cue; remove the
  movement. Two exceptions slow instead of stopping, `.skeleton` and
  `.liquid-pulse`, because a pending indicator that holds still lies.
- Motion is never the only feedback channel. Every animated state change also
  needs a static cue: colour, icon, label.
- Controls settle, they do not jump: `--ease-out-soft`, no displacement on
  hover. Press feedback is the one allowed transform on a control, see below.

## Interruptible over staged

Users change intent mid-interaction. CSS transitions retarget mid-flight;
keyframes run on a fixed timeline and restart. Prefer transitions for every
interactive state change (hover, toggle, open, close). Reserve keyframes for
one-shot sequences (first entrance, loading). A drawer on a keyframe that snaps
or restarts when closed mid-animation feels broken.

## Entrances and exits

Stagger only an infrequent staged entrance where sequence communicates
hierarchy: first load of a hero, a success state, an empty state. Break the
container into semantic chunks (title, description, actions) and stagger with
`.stagger`: 60ms per item, capped at six. Never stagger routine interactions:
row hovers, keystrokes, repeated tab changes. Motion is a budget; the attention
cost repeats on every trigger.

Exits are softer than entrances: a small fixed rise or drop (`--nudge-*`), never
the full container height; `--duration-2` for the close where the open took
`--duration-3` or `-4`; `--ease-out` on both. Keep some directional movement so
the eye knows where the element went. When motion adds no information, the
interaction repeats often, or reduced motion is requested, remove immediately
with `[hidden]`.

Skip entrance animation on page load for elements that already have a default
state: icon swaps, toggles, tabs, segmented controls. With the Motion library
that is `initial={false}` on `AnimatePresence`; do not apply it to a component
whose `initial` prop is the entrance itself (a staggered hero), or the whole
entrance disappears. Verify on a full refresh.

## Press feedback

`scale(0.96)` on `:active`, via `transition-property: scale` with
`--duration-2` and `--ease-out`, so a release mid-press returns smoothly.
Always 0.96; never below 0.95, which reads exaggerated. Give the button
component a `static` prop or class that disables it where motion would
distract (a submit next to a form that is already animating). Press scale is
`transform`, so it is inside the language; a hover displacement is not.

## The motion layer

`web/motion.css`, optional, after `light.css` and before `agent.css`.
Twenty-three named recipes remapped from the transitions.dev catalogue by use,
not by number.

| What the screen does | Recipe |
|---|---|
| trigger opens an anchored surface | `.motion-dropdown` (needs `.is-open`) |
| centred surface without a trigger | `.motion-modal` plus `.motion-scrim` |
| notice rises from below | `.motion-toast` |
| tip over an icon | `.motion-tip` |
| two icons in one slot | `.motion-icon-swap` |
| the label changes in place | `.motion-text-swap` |
| title and support entering together | `.motion-lines` |
| notification dot appears | `.motion-badge` |
| a number updates (replaced) | `.motion-digits` |
| a number travels to its value (reel) | `.motion-counter` |
| validation failed | `.motion-shake` |
| placeholder becomes loaded content | `.motion-reveal` |
| progress text that has to live | `.motion-shimmer` (straight) or `.motion-wave` (angled, for long text) |
| small exclusive set with a highlight | `.motion-tabs` (width swaps at once, position transitions) |
| confirmation done | `.motion-check` |
| wait then done in one element | `.motion-spin` (arc closes into the ring; `.motion-check` on the same svg) |
| list becomes detail, step 1 becomes step 2 | `.motion-pages` |
| notices pile three deep | `.motion-stack` |
| underline grows from the left on hover | `.motion-learn` |
| up to four images cross through blur on a timer | `.motion-cycle` |
| a control cluster merges | `.liquid` (see materials) |

Tie between two: the cheaper one. Seven need JavaScript and say so in their
own comment: `.motion-tabs` (`--tab-x`, `--tab-w`), `.motion-digits`,
`.motion-shake`, `.motion-dropdown`, `.motion-counter`, `.motion-spin`,
`.motion-stack`.

### Remap by use

| Use | Catalogue | Here |
|---|---|---|
| anchored surface opens | 250ms | `--duration-3` |
| centred surface opens | 250ms | `--duration-4` |
| either closes | 150ms | `--duration-2` |
| icon and text swap | 250ms | `--duration-3` |
| toast rises | 400ms | `--duration-5` |
| emphasis, confirmation | 500ms | `--duration-6` |
| stagger between lines | 40ms | `--duration-1` |

Curves map by use too, and a mapping is not an equality:

| Found in the wild | Maps to | Token value |
|---|---|---|
| `cubic-bezier(0.22, 1, 0.36, 1)` (transitions.dev, Bencho), `cubic-bezier(0.19, 1, 0.22, 1)` (torph default) | `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `cubic-bezier(0.2, 0, 0, 1)` (Halaska) | `--ease-out-soft` | `cubic-bezier(0.25, 0, 0, 1)` |
| `ease-in-out`, `cubic-bezier(0.4, 0, 0.2, 1)` | `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `ease-out` | `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| any control point above 1: `0.34, 1.56, 0.64, 1`; `.24, 1.34, .38, 1`; an underdamped spring | nothing | overshoot has no token |

A global motion posture switch (spring, smooth, instant, as in the Halaska
kit) stays out: duration follows use, and the one global switch is
`prefers-reduced-motion`.

When tokenising an existing loose value, match by use and never by number. A
300ms modal close becomes `--duration-2` (150ms) because both are "modal
close". If the use matches no token, leave it and list it as
`no matching use token`.

### What did not come across, and why

| Recipe | Why not |
|---|---|
| card resize, accordion, panel reveal, input clear | animate `width`, `height` or `grid-template-rows` |
| avatar group hover, card stack hover, double-bounce toggle, like button | need an overshoot curve; a control settles rather than jumps |
| confetti, drag with physics, smoky dissolve, generation placeholder | integrate position or noise every frame; a CSS recipe that needs a rAF loop is not a CSS recipe |
| gradient text, Get Pro button | ask for a hue the palette does not have |
| 3D tilt with glare, image open tilt | moved to the light layer: `.lit-tilt` on `.lit-stage` |
| magnetic select, escape button (Bencho) | move a control toward or away from the pointer; controls do not displace on hover. The attraction reads as `lit lit-swell` |
| magnifying dock (Bencho) | scales neighbours by pointer distance on every frame; the dock keeps one size and the light layer marks the item under the pointer |
| slosh slider lean, pull-to-refresh rubber band, card deck throw (Bencho) | integrate pointer velocity per frame |
| pill growing into a panel, aspect ratio morph, bars and ticks growing by `height`, stepper `gap` sweep (Bencho) | animate `width`, `height`, `gap` or `border-radius`; `.liquid-morph`, `transform: scaleY()` and `.motion-reveal` carry the same reads |
| springs at stiffness 420 and damping 30, `cubic-bezier(.24,1.34,.38,1)` (Bencho) | underdamped, so overshoot |
| state hues written into a readout (`#12b055`, `#e8443a`) | state is `--status-*` |

## Gesture blocks

Bencho (bencho.dev) is a bench of interactive blocks. Its value for the language
is the behaviour, not the numbers: most blocks run on overshoot curves and
layout transitions (see the table above). Each block below keeps its read and
is re-expressed on the tokens. Every gesture has a keyboard path that does the
same job, and the hit area follows rule 10.

| Block | Pure Design version | Craft |
|---|---|---|
| Slide to confirm | a thumb in `pill glass lit` dragged along a track; the fill grows by `transform: scaleX()`; released short of the end it returns on `--ease-out-soft` at `--duration-3` | `role="slider"` with arrow keys and Enter at the end; reserved for irreversible actions, and an adjacent plain button is offered where dragging is hard |
| Inline confirm | the button's label swaps to the confirmation with `.motion-text-swap`; a second press commits; it reverts after a timeout | the button reserves the width of the longer label, so nothing reflows; the swap is announced |
| Radial menu | `.liquid` action fan: units leave the trigger along the arc on `--ease-out-expo` | arrow keys move between options, Escape folds the fan back and returns focus |
| Liquid toggle | `.liquid` with `.liquid-trail` while `.is-flux` is set | `role="switch"` with `aria-checked`; the on state also changes the glyph |
| Icon bar, command bar | indicator on `.motion-tabs` (width swaps at once, position transitions); a trigger that becomes its surface is `.liquid-morph` | `role="tablist"` or `role="toolbar"` with roving tabindex |
| Selection list | one highlight layer translated to the hovered row with `translateY` at `--duration-2`, instead of a background per row | the highlight follows focus as well as the pointer |
| Reorder list | the held row gets `[data-dragging]`, lifts with the overlay shadow and no rotation; siblings move by `transform` | Alt plus arrow moves the focused row; the new position is announced |
| Drag stepper, range dial | `.numfield` with a drag affordance; the value reads in `.num` and morphs with torph | `role="spinbutton"` or `role="slider"`; arrow keys step, Page keys step by ten |
| Progress ticks | discrete ticks switching `opacity` in order with `.stagger` | `role="progressbar"` with the value in text |
| Tilt card | `.lit-tilt` on `.lit-stage` | disabled under reduced motion and `pointer: coarse` |
| Checklist | `.check` with `.motion-check` on completion | the checked state is the native checkbox |
| Pull to refresh | native overscroll, then `.skeleton` or `.motion-spin` while loading | a refresh button exists for pointer and keyboard |

## Text morph with torph

Torph (torph.lochie.me, npm `torph`, MIT, no dependencies) morphs one string
into another: it segments both with `Intl.Segmenter`, matches shared segments
by longest common subsequence, slides the survivors to their new place and
fades what enters and exits. Numbers morph by place value: digits roll along
the block axis while currency, separators and signs travel with their places.
`cursorIndex` switches a typed field from place matching to caret matching.

It is the one exception to "never add a dependency just for a transition":
keeping shared glyphs in place, rolling digits by place and following a caret
cannot be written in CSS. It enters only for the jobs below.

| Job | Use |
|---|---|
| two fixed labels toggling (play and pause, copy and copied) | `.motion-text-swap`; never torph |
| a label that moves through arbitrary strings sharing letters (agent status phases, "Processing" to "Transaction") | torph |
| a number replaced in place | `.motion-digits`; torph when the value carries currency or separators and the app already runs React, Vue or Svelte |
| a number travelling to its value | `.motion-counter` |
| a live mirror of a typed field | torph with `cursorIndex` |

Configure it on the tokens, never at its defaults (400ms is not a step, and
its default curve maps to `--ease-out-expo`). The easing reaches the Web
Animations API, which does not read `var()`, so resolve the tokens first:

```js
const css = getComputedStyle(document.documentElement);
const duration = parseFloat(css.getPropertyValue("--duration-5")); // 350
const ease = css.getPropertyValue("--ease-out-expo").trim();

<TextMorph duration={duration} ease={ease}>{phase}</TextMorph>
```

- Never pass a spring to `ease`: the duration then comes from physics instead of
  a token, and an underdamped spring overshoots.
- Keep `respectReducedMotion` at its default `true`; never set it `false`
  (rule 11).
- Torph splits the text into `aria-hidden` segments and keeps a plain-text copy
  for assistive technology. Put `aria-live` or `role="status"` on the container
  that holds the morph, not on the morph itself.
- `scale` (exit segments shrink) stays on; it is a `transform`.
- Pin the version (`torph@0.1.3`). In a single-file artifact, import the ESM
  build from `cdn.jsdelivr.net/npm/torph@0.1.3/dist/index.mjs` and use the
  vanilla `TextMorph` class with `update()`.

## Contextual icon animation

Two icons in one slot cross-fade with opacity, scale and blur rather than a
visibility toggle. The recipe is `.motion-icon-swap`, which keeps both icons in
the DOM (one absolutely positioned) and animates `opacity`, `scale` and
`--motion-blur-2`. Both enter and exit animate because neither unmounts.

Animate: icons that appear on hover, state-change icons (play to pause, like
to liked), contextual toolbars, loading to success. Do not animate: static
navigation icons, decorative icons, always-visible icons, the text label beside
an icon.

## With a motion library

Check `package.json`. Import from `motion/react` when `motion` is installed,
from `framer-motion` when that is; with both, follow the nearest peer imports.
Never add a dependency just for a transition: the CSS recipes cover it. The
one exception is torph for text morph, under the conditions in "Text morph
with torph".

When the library is already there:
- icon swap: `initial={{ opacity: 0, scale: 0.25, filter: "blur(3px)" }}`,
  `animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}`, same values on
  `exit`, and `transition={{ type: "spring", duration: 0.3, bounce: 0 }}`.
  Bounce is always 0; an overshoot is a curve the language does not have.
  Read the blur from `--motion-blur-2` where the codebase reads tokens in JS.
- press: `whileTap={{ scale: 0.96 }}`.
- durations: 0.15, 0.2, 0.3, 0.35 and 0.5 are the token steps in seconds.

## Verifying motion

Open the browser Animations panel, replay at 10% and walk every state: hover,
focus, active, loading, empty, error. Transitions read in a background tab are
frozen at the initial value because no frame runs there; a colour measured in
that tab looks exactly like a cascade defect and is not one. Inject
`* { transition: none !important }` before measuring colour and remove it
after.

`will-change` only for `transform`, `opacity`, `filter`, only when a first
frame stutters (Safari benefits most), never `all`, never on `background`,
`padding` or any property the GPU cannot composite. Each layer costs memory.

# Motion

Motion exists to explain a change of state. If nothing changed state, there is
nothing to animate, and the right answer is "not here". Read this file for any
transition, entrance, exit, loader, icon swap, or when mapping loose durations
onto tokens.

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

`cubic-bezier(0.22, 1, 0.36, 1)` is `--ease-out-expo`; `ease-in-out` is
`--ease-standard`; `ease-out` is `--ease-out`.

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
Never add a dependency just for a transition: the CSS recipes cover it.

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

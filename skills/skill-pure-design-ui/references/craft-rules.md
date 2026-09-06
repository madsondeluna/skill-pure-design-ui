# Craft rules

Behaviour, not material. Must fails the build or the review; should is the
default and leaving it needs a written reason; never has no exception. The
binding column names the class or token that already implements the rule, so
the fix is to import it, not to rewrite it.

Much of this is script-checked: `node assets/pure-design/tools/check.mjs`
names each rule it covers. `scripts/audit_css.py` covers the app-layer subset.

## Narrow

The narrow screen is not the wide one shrunk. Shrinking is what produces an
18px control and a field that zooms on focus.

| Rule | Level | Bound to |
|---|---|---|
| Every screen designed at 375 and at 1280, both swept | Must | `--breakpoint-stack` |
| The narrow screen does not inherit the wide one's approval, nor the reverse | Must | |
| Hit area decided by `pointer: coarse`, never by width | Must | `--hit-min-touch` |
| Body never scrolls sideways; a wide table scrolls inside `.table-scroll` | Must | `.table-scroll` |
| Deep glass drops one texture step below the breakpoint | Must | `.glass-deep`, `.overlay` |
| Type size does not shrink; only the section title changes step (for example `--text-40` to `--text-24`) | Must | `--text-*` |
| Spacing collapses 96 to 48 and 48 to 24; nothing goes under 24 | Must | `--space-*` |
| The grid collapses to one axis: everything starts on column 1; `.axis-b` becomes a block below, never a third axis | Must | `.grid` |
| A menu that hides three links to save 40px | Never | |

A tablet at 1280px is touch and a phone with a mouse is not. The breakpoint
literal in `@media` cannot be `var()`, so it is written out and the check
fails when it diverges from the token.

Overflow without false positives: an element inside an `overflow-x: auto`
container reports its full width in `getBoundingClientRect` even while
scrolling correctly. The deciding signal is
`documentElement.scrollWidth > innerWidth`. When resizing, reload: a device
lock read on load does not re-run on resize. Confirm
`matchMedia('(pointer: coarse)').matches` before reporting any hit-area
number.

## Keyboard and focus

| Rule | Level | Bound to |
|---|---|---|
| Every interactive element reachable and operable from the keyboard, following the authoring practice for its pattern | Must | native semantics |
| Focus ring visible on `:focus-visible`, group lit on `:focus-within` | Must | `--focus-ring` |
| Focus managed on open, close and delete: trapped in the panel, returned to the trigger | Must | `.modal`, `.overlay` |
| Focus order follows visual order | Must | DOM order |
| Outline removed without a visible replacement | Never | `check.mjs` |
| Ring switches to `--text` over glass | Should | `.glass:focus-visible` |

## Target and input

| Rule | Level | Bound to |
|---|---|---|
| Hit area clears 24px, and 44px under a coarse pointer | Must | `--hit-min` |
| Fourteen control classes carry that floor themselves under `pointer: coarse`; what remains to audit is what the project created on its own | Must | `patterns.css`, `agent.css` |
| Visual size may go under the floor, the hit area may not | Must | `.hit` |
| Two interactive elements never have overlapping hit areas; shrink the extension until they do not collide | Must | `.hit` |
| Text field at 16px: below it iOS zooms on focus | Must | `--text-field` |
| Browser zoom disabled through `user-scalable` or `maximum-scale` | Never | viewport |
| Double-tap delay removed | Must | `touch-action: manipulation` |
| Native tap flash replaced by the language's pressed state | Should | `--tap-highlight` |

## Forms

| Rule | Level | Bound to |
|---|---|---|
| Paste blocked in a field | Never | any field |
| Free text accepted and validated after, never blocked while typing | Must | `.input` |
| Incomplete form submittable, so validation surfaces; disabling the button hides the reason | Must | `novalidate` |
| Error next to its field, focus moved to the first one | Must | `.field-error` |
| Submit enabled until the request starts, then a ring and the same label; never a spinner without a label | Must | `[data-loading]` |
| Enter submits a single-line field, Cmd or Ctrl with Enter submits a textarea | Must | `.textarea` |
| `autocomplete`, a meaningful name, the right type and inputmode | Must | `.field` |
| Label and control share one hit target, no dead zone | Must | `.check` |
| Checkbox rounds at `--radius-mark`; only the radio is a circle | Must | `.check input` |
| Password managers and one-time codes work, pasted codes included | Must | `autocomplete` |
| Values trimmed before they are read | Must | submit handler |
| Unsaved changes warn before navigation | Must | `beforeunload` |
| Spellcheck off for email, code and username | Should | `spellcheck` |
| Placeholder shows the shape of the answer, ellipsis when it is an instruction | Should | `placeholder` |
| Autofocus on desktop with a single primary field, rarely on mobile | Should | `autofocus` |

## State, navigation and feedback

| Rule | Level | Bound to |
|---|---|---|
| URL carries the state: filter, tab, page, open panel, colour mode | Must | `history` |
| Back and forward restore the scroll position | Must | `scrollRestoration` |
| Navigation is an anchor, so modifier and middle click work | Must | `a href` |
| A div with a click handler used to navigate | Never | `a href` |
| Destructive action confirmed, or reversible inside a stated window | Must | `.modal` |
| Toast and inline validation announced through a polite live region | Must | `aria-live` |
| Every state offers the next step; a dead end is a defect | Must | `.empty` |
| Empty, sparse, dense and error are four designs, not one with swapped text | Must | `.empty`, `.skeleton` |
| Skeleton copies the box of the final content | Must | `.skeleton-line` |
| `color-scheme` declared per mode, or the browser paints scrollbar and caret with the system theme | Must | `tokens.css` |
| Optimistic update reconciled on response, rolled back or undoable on failure | Should | app layer |
| An option that opens a follow-up ends in an ellipsis | Should | copy |

## Motion, touch and drag

| Rule | Level | Bound to |
|---|---|---|
| Reduced motion honoured with a reduced variant or with nothing | Must | `patterns.css` |
| Only `transform` and `opacity` animated | Must | `check.mjs` |
| A layout property animated | Never | `check.mjs` |
| `transition: all` | Never | `check.mjs` |
| Motion interruptible and driven by input; nothing autoplays | Must | `.viz` |
| `transform-origin` where the movement physically starts | Must | `.viz-grow` |
| SVG transform on a `g` wrapper with `transform-box: fill-box` | Must | svg |
| Overscroll contained in a sheet or drawer | Must | `.drawer` |
| First tooltip in a group waits, its neighbours open at once | Must | `.tip-group` |
| Text selection off during a drag, dragged element inert | Must | `[data-dragging]` |
| CSS first, then the animation API, then a library | Should | five curves |
| Curve matched to size and distance; controls settle rather than jump | Should | `--ease-out-soft` |

## Layout and content

| Rule | Level | Bound to |
|---|---|---|
| Checked on mobile, laptop and ultra wide, the last simulated at half zoom | Must | two axes |
| Safe areas respected | Must | `env(safe-area-inset-*)` |
| No unwanted scrollbar; overflow fixed where it appears | Must | `overflow` |
| Text container survives short, average and far too long content | Must | `.truncate`, `.clamp-2` |
| Flex child carries `min-width: 0` before it can truncate | Must | `.min-w-0` |
| Empty string and empty array render a state, not a broken box | Must | `.empty` |
| Contrast rises on hover, active and focus | Must | `--border-hover` |
| Alignment deliberate: grid, baseline or edge | Must | `.grid` |
| Optical alignment wins over geometry by a pixel where perception disagrees | Should | `.optical` |
| Grid and flex do the layout, not measurement in script | Should | `.grid` |
| Nested radius never exceeds the parent; the two stay concentric | Should | `--radius-field` |

## Text and accessibility

| Rule | Level | Bound to |
|---|---|---|
| Document title says where the reader is | Must | `title` |
| Heading levels in order; first keyboard stop skips to the content | Must | `.skip-link` |
| Anything an anchor lands on clears the fixed bar | Must | `--scroll-offset` |
| Numbers that will be compared use tabular figures | Must | `.num` |
| Status carries a second cue beyond colour; icons carry text labels | Must | `.status` |
| Icon-only button carries a descriptive accessible name | Must | `.sr-only`, `aria-label` |
| Decorative element hidden from the accessibility tree | Must | `aria-hidden` |
| Native element before an ARIA role | Must | semantics |
| Ellipsis is one character; a non-breaking space holds "10 MB" and "Cmd K" | Must | copy |
| Dates, times and numbers formatted for the locale | Must | `Intl` |
| Curly quotes; short heading balanced across its lines | Should | `.balance` |
| Brand names, tokens and identifiers marked against machine translation | Should | `translate="no"` |
| Inline help first, tooltip last | Should | `.tip` |

## Delivery

| Rule | Level | Bound to |
|---|---|---|
| Mode declared to the browser | Must | `color-scheme` |
| Native select with explicit background and text colour | Must | `.select` |
| Mutation answers in under 500ms | Must | app layer |
| List past fifty items virtualised | Must | app layer |
| Above-the-fold images preloaded, the rest lazy, all declaring their size | Must | `img` |
| Layout reads and writes batched | Must | app layer |
| Profiling with CPU and network throttled, extensions off | Must | devtools |
| Contrast measured, not judged by eye | Must | `check.mjs`, `contrast.py` |
| Chart colour survives protanopia and deuteranopia at full severity | Must | `check.mjs` |
| Browser frame colour matches the page background | Should | `theme-color` |
| Preconnect for a CDN; preload with swap for a critical font | Should | `link rel` |
| Tested in low power mode and in Safari | Should | device |
| Layered shadows, ambient under direct, borders tinted toward the background | Should | `--shadow-glass-rest` |

## Consuming apps (framework layer)

| Rule | Level |
|---|---|
| Field keeps focus and value across hydration | Must |
| Field with a value needs a change handler, otherwise a default value | Must |
| Re-renders counted and cut down | Must |
| Date and time rendering guarded against a server and client mismatch | Should |
| Uncontrolled fields by default; a controlled one cheap per keystroke | Should |

## Two traps that are not cascade

- `border-bottom: var(--hairline) solid transparent` leaves the three
  longhands as pending-substitution, and a higher-specificity
  `border-bottom-color` elsewhere is replaced by `transparent` again. Write the
  longhands.
- A transition read in a background tab is frozen at its initial value because
  no frame runs there. It reads exactly like a cascade defect and is not one.

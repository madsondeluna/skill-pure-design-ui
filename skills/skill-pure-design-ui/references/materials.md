# Materials: glass, liquid, light

Read when anything is translucent, merges, or reacts to the pointer. The
upstream chapter with every measured defect is in
`assets/pure-design/LANGUAGE.md` under "Space, form, glass".

## Glass

Five layers: vertical gradient fill, backdrop blur, saturation, specular
highlight on the top edge, refraction on the bottom. Base class `.glass`, valid
on any shape. `.pill` is glass by default; `.pill-solid` for dense tables or
already-translucent surfaces.

Texture follows surface size. A large blur radius on a short element makes
Chrome sample beyond the box and paint a ghost block in the first of a row of
glass siblings.

| Texture | Blur | Fill | Use |
|---|---|---|---|
| `.glass-thin` | 4px | 10% to 2% | overlay where the content behind must stay readable |
| `.glass` | 16px | 42% to 16% | default control: pill, chip, tooltip |
| `.glass-frost` | 30px | 82% to 62% plus grain | surfaces carrying their own text: toolbar, command palette, sheet, modal |
| `.glass-deep` | 56px | 58% to 34% | full-width chrome |
| `.glass-accent` | inherits | accent tint | one control per group |

`.glass-frost` is the only one with grain (desaturated `feTurbulence` in
`mix-blend-mode: overlay`); without it the result is translucent, not frosted.
`--blur-card` 32px belongs to `.card-glass`; `--blur-pill` 72px only to
`.overlay`.

Shapes: `.glass-sq` (surface radius), `.glass-soft` (media), `.glass-round`
(control), `.glass-circle`. `.glass-panel` builds an internal hairline grid.
`.glass-lift` is the pointer reaction: rises 2px, edge lights, shadow opens.

Rules:
- Text on glass uses `--text`, never `--muted`: the backdrop is unpredictable.
  `.card-glass` is exempt because it sits on a known surface. The focus ring
  switches to `--text` over glass for the same reason.
- Glass does not go over a flat background (no effect, one compositing layer),
  over another translucent surface, or behind running text.
- More than two textures in the same fold is noise. Four textures exist for
  four surface sizes, not for variety.
- Below `--breakpoint-stack`, `patterns.css` drops `.glass-deep` to the frost
  radius and `.overlay` to the card radius on its own. That is behaviour, not a
  finding; report only if the project overrode the block.
- Bezel and pool: `--glass-bezel` (diffuse inner glow along the edge) and
  `--glass-pool` (shadow at the base). Neither carries spread; a spread ring
  pushes a second line inside the contour and the glass reads as two
  hairlines. Both live in `--shadow-glass-rest` and `--shadow-glass-hover`.
- `paper-like` has its own glass block since 1.5.0; without it the frost came
  out cold white over a cream page.

### The two silent defects

1. `backdrop-filter` declared before `-webkit-backdrop-filter` disappears in the
   minifier. Lightning CSS (Tailwind v4, Next) keeps only the last of the pair
   and does not restore the standard one; Chrome returns `false` for
   `CSS.supports('-webkit-backdrop-filter', ...)`, so the page compiles clean
   and renders with no blur. The standard declaration always comes last.
   Before debugging anything else in a suspect project:
   `getComputedStyle(el).backdropFilter`; if it is `none`, the project sits on
   a copy older than 1.4.3 and the fix is recopying `web/*.css`.
2. A modifier that loses the cascade is a modifier that does not exist.
   `class="pill glass-accent"` once rendered identical to `class="pill"`;
   `class="glass glass-frost"` once rendered with the default fill because
   `.glass:not(.card-glass)` counts two classes against a texture's one. The
   textures are now explicit pairs (`.glass.glass-frost`). Resolve cascade rule
   by rule, not by eye: a pseudo-class weighs as a class and `:not()` adds
   what it carries.

## Liquid

The fifth material is not a fifth texture. Glass filters itself, so the text it
carries goes through the blur with it; that is why glass never merges. Liquid
splits material from content into two layers stacked in one grid cell.

| Layer | Class | What it is |
|---|---|---|
| Silhouette | `.liquid-sheet` | The only filtered element. `aria-hidden`, no pointer events, no text. One `.liquid-blob` per unit |
| Content | `.liquid-content` | The real DOM, unfiltered. Focus ring, hit area, ARIA and handlers intact. One `.liquid-item` per unit |

The two layers are mirrors: same display, same gap, same box per unit. That is
how the drop sits under the control with no JavaScript measuring, and it is
also the price: a unit has a fixed size (`--liquid-size`, default
`--control-lg`). Liquid is for fixed-unit clusters: icon buttons, avatars,
dots, an action fan, a segmented indicator. A row of variable-width labels
stays `.pill`.

| Filter | Deviation | Bridges up to | Gap token |
|---|---|---|---|
| `#pure-goo-tight` | 4 | 4px | `--liquid-bridge-tight` |
| `#pure-goo` | 6 | 6px | `--liquid-bridge` |
| `#pure-goo-wide` | 12 | 10px | `--liquid-bridge-wide` |

`.liquid-tight` and `.liquid-wide` swap filter and gap together. Swapping one
without the other yields loose pills silently. The filter matrices are not
tokens: `feColorMatrix` does not read `var()`, and a token nothing resolves is
a token that lies. They live in the three `#pure-goo` definitions at the top of
the body in `templates/page.html`; keep them only if the page uses `.liquid`.

The shadow comes out of the filter: `drop-shadow` after `url(#pure-goo)` hugs
the merged mass. A `box-shadow` on the blob enters the blur and the alpha step
eats it.

Variants: `.liquid-tight`, `.liquid-wide`, `.liquid-sq`, `.liquid-stack`,
`.liquid-fold` (units collapse into one drop). Folded units leave the tab order
with `visibility: hidden`; `opacity: 0` with `pointer-events: none` takes the
pointer and not the keyboard.

### Liquid motion

One `transform` declaration per element, composed from registered properties
(`@property`) `--liquid-shift-x`, `--liquid-shift-y`, `--liquid-swell`,
`--liquid-stretch-x`, `--liquid-stretch-y`. Each state writes its token; none
writes `transform`. Two rules writing `transform` on the same blob fight over
specificity instead of adding up. Every `var()` in the composition keeps a
fallback: where `@property` is unsupported the `calc()` is invalid at
computed-value time and the whole declaration falls to `transform: none`.

| Class | Read | Needs a state |
|---|---|---|
| `.liquid-trail` | mass stretches behind a moving unit | `.is-flux` |
| `.liquid-drip` | a drop stretches, necks and lets go | no |
| `.liquid-morph` | a round trigger becomes the surface it opens | `.is-open` |
| `.liquid-pulse` | the cluster breathes while something is pending | no |
| `.is-flux` | content cross-blurs while the mass flows | set on the way in, cleared on the way out |

A travel effect pinned to the resting state is a defect. `.liquid-pulse` slows
under reduced motion rather than stopping, like the skeleton: a pending
indicator that holds still lies about the state.

### Surface context

Every class that paints a background redeclares `--surface-context` with what
it paints. Inside `.liquid` the background comes from a sibling of the text,
so walking the ancestry resolves against `--bg` and passes a page that is
wrong on screen. The contrast sweep reads `--surface-context` first.

## Light

`web/light.css` plus `web/light.js`, optional, imported after `patterns.css`
and before `motion.css`. The only JavaScript in the language, because a
stylesheet cannot read the pointer. The glass is a still material; the light
layer adds the source: a highlight that travels, a rim that lights on the side
the light comes from, a depth that appears when the observer moves.

The contract is three numbers written by `light.js` per box: `--light-x`,
`--light-y` (pointer position, 0 to 1) and `--light-near` (proximity, 1 under
the pointer, 0 at `--light-reach` away). No effect name appears in the script;
every appearance decision lives in `light.css`, so a new effect touches no
JavaScript. `--light-near` is the only off switch.

| Class | Read | Writes |
|---|---|---|
| `.lit` | specular spot travels with the pointer | opacity of a negative-index plane |
| `.lit-edge` | rim lights on the side the light comes from | offset of an inset shadow |
| `.lit-tilt` | surface turns toward the pointer | `--light-turn-x/y` |
| `.lit-pull` | control drifts toward the pointer before it arrives | `--light-shift-x/y` |
| `.lit-swell` | control grows as the pointer nears | `--light-grow` |
| `.lit-field` | section lights behind the glass sitting on it | opacity of a negative-index plane |
| `.lit-cursor` | a 24px glass drop rides with the cursor and bends the page behind it | `--light-shift-x/y` |
| `.lit-stage` | gives the tilt a vanishing point | `perspective` |

Tilt, pull and swell share one composed `transform` and each writes its own
token, same discipline as liquid. The light plane is a pseudo-element at
`z-index: -1` with `isolation: isolate` on the host; the other positions were
tried and wash out the label or vanish behind the ancestor.

Degradation is decided by input, never by width. Under `pointer: coarse` the
stylesheet zeroes `--light-near` and the script does not register;
`check.mjs` fails if only one side gives up. Under `prefers-reduced-motion`
the light stays (highlight and rim are colour changes) and the travel goes
(tilt, pull, swell are motion).

### The cursor lens

`.lit-cursor` bends rather than blurs: `backdrop-filter` referencing an SVG
displacement map (`#pure-lens` in the template) in two passes, body and rim.
The maps come from `tools/lens-map.mjs`. Chrome and Edge bend; Safari and
Firefox get the plain-blur floor declared outside the `@supports`. The lens
swells over anything clickable (`--light-grow`, transition on the token, never
on `transform`). `.lit-cursor-only` hides the native cursor and is opt-in on
purpose: it costs the I-beam, the pointing hand and the drag arrow. Text fields
keep `cursor: text`. Where the lens does not exist the system cursor comes back
in the same query that removes it.

What the layer refuses: spring, inertia, physical trail. All three integrate
position every frame, and an effect that only exists while a rAF loop runs is
animation under another name, not a material.

### Light tokens

Geometry only; colour comes from the glass tokens.

| Token | Value |
|---|---|
| `--light-reach` | 240px |
| `--light-spec` | 180px |
| `--light-rim` | 20px |
| `--light-pull` | 6px |
| `--light-tilt` | 8deg |
| `--light-depth` | 800px |
| `--light-lens` | 1.5rem |

Cost is bounded: one pointer listener on the window, every write inside a
`requestAnimationFrame`, `getBoundingClientRect` batched and only when the
geometry can have changed, out-of-reach elements leave the loop before any
write. At rest the per-frame cost is zero.

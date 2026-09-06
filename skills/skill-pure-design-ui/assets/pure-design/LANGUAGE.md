# pure design

Design system for web and Python. Four modes, script-verified tokens, plotting themes included.

Derived from `madsondeluna.github.io`. Numeric token architecture in the format of `devouringdetails.com`. Easing curves from `motion.dev`.

Pure Design 1.6.0.

## Use

```html
<link rel="stylesheet" href="web/tokens.css">
<link rel="stylesheet" href="web/patterns.css">
<link rel="stylesheet" href="web/light.css">
<link rel="stylesheet" href="web/motion.css">
<link rel="stylesheet" href="web/agent.css">
<script src="web/light.js" defer></script>
```

`light.css`, `motion.css` and `agent.css` are optional and depend on the two above them. `light.js` is the only JavaScript in the language and is required only by `light.css`.

Tailwind v4: import `web/theme.css`, which already pulls `tokens.css` and the `@theme inline` block.

```python
from pure import mpl, plotly
mpl.use("light")        # light | paper-like | deep-blue | dark
plotly.use("light")
```

Without the package: `plt.style.use("python/pure-light.mplstyle")`.

Streamlit: copy `python/streamlit/config.toml` to `.streamlit/config.toml` and inject `app.css`.

## Files

```
tokens/tokens.json               source of truth
web/tokens.css                   variables, four modes
web/theme.css                    Tailwind v4 bridge
web/patterns.css                 components, the glass material, the liquid material, icons, narrow
web/light.css                    light layer, optional, pointer-reactive glass
web/light.js                     the only script: writes three numbers per box
tools/lens-map.mjs               regenerates the two displacement maps of the lens
web/icons.svg                    65 symbols, 24 box, currentColor
web/motion.css                   motion layer, optional
web/agent.css                    agent layer, optional
python/pure/                     palette, mpl, plotly
python/pure-{light,dark}.mplstyle
python/streamlit/                config.toml and app.css
templates/page.html              starter page, four modes wired
preview/index.html               visual guide, everything live
tools/check.mjs                  verification
.claude/skills/                  twelve review and handoff routines
```

## Starting a new project

```
mkdir -p <project>/pure
cp web/tokens.css web/patterns.css web/light.css web/motion.css web/agent.css <project>/pure/
cp web/light.js web/icons.svg <project>/pure/
cp templates/page.html <project>/index.html
```

Drop `light.css` and `light.js` if nothing reacts to the pointer, `motion.css` if no named transition is used, and `agent.css` if no model writes to the screen. `icons.svg` is referenced by URL, so it has to be served over http: an external `<use>` does not resolve over `file://`, and nothing errors when it fails, the element just comes out empty. Keep the `#pure-goo` filter definitions at the top of the body only if the page uses `.liquid`. The template already carries the head, the font link, the twelve-column grid on two axes, the three spacing steps, the skip link and a mode switcher that keeps the mode in the URL.

| Step | Value |
|---|---|
| Link order | `tokens.css`, `patterns.css`, `light.css`, `motion.css`, `agent.css` |
| Fonts | Archivo 300 at width 125, Public Sans 300/400/500/600, Spline Sans Mono 400/500 |
| Default mode | `:root`, no class |
| Mode state | `?mode=paper-like\|deep-blue\|dark` and the class on `<html>` |
| `theme-color` | `#F4F6F9` at rest, rewritten by the switcher on every change |
| Version pinned | record the Pure Design version the copy came from |

Rules the app layer carries on its own, because no file here can enforce them:

| Rule | Level |
|---|---|
| No hex, rem or ms literal in app CSS; every value is `var(--token)` | Must |
| `--font-display` is always set with `--font-display-stretch`; the title separates by width, not by a serifed family | Must |
| A missing value becomes a token in `tokens.css`, never a literal in the app | Must |
| Text starts on column 1 or column 9; specimen grids are the declared exception | Must |
| Vertical rhythm uses 24, 48 and 96 only | Must |
| Sentence case in every string, including group headings and buttons | Must |
| Chart series come from `--chart-1` to `--chart-8` in order, never cycled | Must |
| State uses `--status-*`; a chart slot never carries state | Must |
| Every transition names its properties, and only `transform` and `opacity` animate | Must |
| Reduced motion collapses duration and delay, including staggered entrances | Must |
| Copy the language files rather than linking the repository path | Should |

The four-mode claim is a claim about the app too. Click through all four before shipping: a value that only works in light is a defect, not a preference.

## Modes

| Class | Ramp | `--bg` | Use |
|---|---|---|---|
| `:root` | slate | `#F4F6F9` | default |
| `:root.paper-like` | paper | `#FAF8F1` | long reading, print |
| `:root.deep-blue` | slate | `#0D1321` | blue dark |
| `:root.dark` | graphite | `#0E0F13` | neutral dark |

Through 1.0 the `dark` class was the blue one. It is now graphite, and the blue is `deep-blue`. Migrating from `madsondeluna.github.io`: swap the class and the `localStorage` value.

## Colour

Two 15-step ramps: `--slate-*` (light, paper-like, deep-blue) and `--graphite-*` (dark). Every semantic token resolves to a step.

Slate keeps the Space Cadet anchors: `#0D1321`, `#1D2D44`, `#3E5C76`, `#748CAB`, `#F4F6F9`. Graphite is neutral by construction: OKLCH chroma between 0.007 and 0.012 at hue 265.

### Contrast per pair

WCAG 2.1 ratios, recomputed by `check.mjs` on every run.

| Pair | light | paper-like | deep-blue | dark |
|---|---|---|---|---|
| `--text` / `--bg` | 17.13 | 17.45 | 17.13 | 17.68 |
| `--muted` / `--bg` | 6.47 | 6.59 | 7.11 | 7.15 |
| `--muted` / `--surface` | 6.02 | 5.87 | 5.32 | 5.49 |
| `--muted` / `--surface-hover` | 5.55 | 5.30 | 4.60 | 4.72 |
| `--accent` / `--bg` | 6.47 | 6.59 | 9.61 | 9.86 |
| `--secondary` / `--bg` | 3.19 | 3.25 | 5.37 | 5.53 |
| `--border` / `--bg` | 1.39 | 1.47 | 1.73 | 1.79 |

Usage rule: above 4.5 any text; 3 to 4.5 large text and UI components; below 3 decoration. `--secondary` is a border colour in light, paper-like and deep-blue.

Read the second half of that rule against `--surface` as well, which is where small text usually sits: `--secondary` lands between 2.61 and 4.25 there, so it is under the floor in all four modes, not only in the light ones. Small text takes `--muted`. `patterns.css` follows this from 1.4.2; `agent.css` followed in 1.5.1, when its 27 text uses of `--secondary` (`.tok-com` among them) moved to `--muted`. In the language's own files `--secondary` now paints only borders and one non-text glyph, and a rendered sweep of the guide, 5068 text nodes in four modes, returns zero nodes under the floor.

`muted / surface` cleared 4.5 in every mode in 1.5.1. Deep-blue was the holdout at 4.02, an exception `check.mjs` used to carry with a floor of 3 "for large text only" while the agent layer set 12px text on cards in that very pair. `--muted` moved from `slate-500` to `slate-400`, `--accent` moved up to `slate-300` to stay one step lighter than muted (the same relation dark keeps between graphite-300 and graphite-400), and slate-400 itself lightened two RGB points, `#8CA0BA` to `#8EA2BC`, because the original value sat at 4.49 against `--surface-hover`, one hundredth under the floor. The exception is deleted: the floor is 4.5 in all four modes, over `--surface` and over `--surface-hover` both.

Tags (`congress`, `conference`, `symposium`) sit between 7.7 and 11.6 in both dark modes.

Status sits between 5.54 and 8.62. Reserved meaning, never a series colour, always paired with a label or icon.

| Token | light | dark and deep-blue |
|---|---|---|
| `--status-good` | `#376E48` | `#82BB90` |
| `--status-warning` | `#79601B` | `#C9AE6D` |
| `--status-serious` | `#844E31` | `#D89B7C` |
| `--status-critical` | `#864544` | `#D18885` |

## Data colour

A family separate from the interface. The brand slate has OKLCH chroma 0.055, below the 0.10 floor: as a series it reads grey.

Eight slots, chroma between 0.105 and 0.115, fixed order, assigned in sequence, never cycled.

| Slot | Hex | Name |
|---|---|---|
| 1 | `#3973B1` | blue |
| 2 | `#9F8322` | gold |
| 3 | `#9E527F` | magenta |
| 4 | `#4C985F` | green |
| 5 | `#745BA5` | violet |
| 6 | `#BA6F3E` | orange |
| 7 | `#1990AD` | teal |
| 8 | `#AC5551` | red |

Order found by exhaustive search over the permutations, maximising the worst adjacent pair. Verified against all four surfaces:

- Lightness band and chroma floor: pass
- Colour vision deficiency: worst adjacent pair ΔE 10.0 (deuteranopia, Machado 2009 at severity 1.0), target 8
- Normal vision: worst adjacent pair ΔE 19.9, floor 15
- Mark contrast: minimum 3.31, floor 3

Scatter, bubble, map and small multiples: three-series cap. Beyond that, group or facet. `palette.series(n)` raises above eight.

Ramps: `SEQUENTIAL` continuous, nine steps; `ORDINAL_LIGHT` and `ORDINAL_DARK`, seven discrete steps validated separately; `DIVERGING` blue to amber with grey at the midpoint.

Never two y-axes on one chart.

## Typography

| Family | Role | Constraint |
|---|---|---|
| Archivo 300, `font-stretch: 125%` | section titles and names | tracking -0.02em, leading 1, never below 32px, never in running text. The title separates by width, not by a serifed family, so it always declares both weight and stretch |
| Public Sans | prose, labels, buttons, table cells | |
| Spline Sans Mono | numbering, field labels, tabular values, code, identifiers | tracking 0.12em when used as a label |

Scale `--text-11` through `--text-56`; the name is the size. Two clamps sit outside it: `--text-display-section` and `--text-display-name`.

Measure: `--measure-prose` 480px. `.prose-justify` is opt-in, not base.

## Space, form, glass

Space: `--space-2` through `--space-96`, base 4 with half-steps at 2, 6 and 10.

Radius follows the role, not the taste. Nothing in the language has a live corner.

| Token | Value | Applies to |
|---|---|---|
| `--radius-surface` | 12px | card, panel, grid cell, sheet, state box, hairline grid |
| `--radius-field` | 8px | input, textarea, select, any text entry |
| `--radius-media` | 8px | image, video, thumbnail, avatar frame |
| `--radius-control` | full | button, pill, chip, tag |
| `--radius-mark` | 4px | native checkbox box, skeleton bar, anything under 20px |
| `--radius-circle` | 50% | avatar, dot, radio, round control |

The ladder is concentric: a child never rounds harder than its parent, so a field at 8 inside a card at 12 reads as one object. The numeric steps and `--radius-0` stay in the scale for imported components only.

Card grid: cells carry no border, `gap: 1px` over a `--border` background, radius and `overflow: hidden` on the grid rather than the cell. Class `.hairline-grid`.

### Glass

Five layers: vertical gradient fill, backdrop blur, saturation, specular highlight on the top edge, refraction on the bottom.

Base class `.glass`, valid on any shape. `.pill` is glass by default. `.pill-solid` for dense tables or already-translucent surfaces.

| Texture | Blur | Fill | Use |
|---|---|---|---|
| `.glass-thin` | 4px | 10% to 2% | overlay where the content behind must stay readable |
| `.glass` | 16px | 42% to 16% | default control: pill, chip, tooltip |
| `.glass-frost` | 30px | 82% to 62% plus grain | surfaces carrying their own text: toolbar, command palette, sheet, modal |
| `.glass-deep` | 56px | 58% to 34% | full-width chrome |
| `.glass-accent` | inherits | accent tint | one control per group |

`.glass-frost` is the only one with grain (desaturated `feTurbulence` in `mix-blend-mode: overlay`). Without it the result is translucent, not frosted.

Shapes: `.glass-sq` (surface radius, the name is kept for compatibility), `.glass-soft` (media), `.glass-round` (control), `.glass-circle`. `.glass-panel` builds an internal hairline grid. `.glass-lift` is the pointer reaction: rises 2px, edge lights up, shadow opens.

Blur radius follows surface size. A large radius on a short element makes Chrome sample beyond the box and paint a ghost block in the first of a row of glass siblings.

Text on glass uses `--text`, never `--muted`: the backdrop is unpredictable. `.card-glass` is exempt, since it sits on a known surface.

Glass does not go over a flat background (no effect, one compositing layer), over another translucent surface, or behind running text.

Two defects closed in 1.4.3, both invisible in review and both fatal to the material. The standard `backdrop-filter` declaration now comes after the `-webkit-` one in every rule. Lightning CSS, the minifier behind Tailwind v4 and Next, keeps only the last declaration of the pair and does not restore the standard prefix, so in the original order a build shipped `-webkit-backdrop-filter` alone and every glass surface rendered with no blur: Chrome returns `false` for `CSS.supports('-webkit-backdrop-filter', 'blur(3px)')`, and nothing raises an error anywhere. `.glass.glass-thin`, `.glass.glass-frost` and `.glass.glass-deep` are now explicit pairs, because `.glass:not(.card-glass)` counts two classes against a texture's one and `class="glass glass-frost"` came out with the default fill and blur, collapsing the four textures into one. That is `.glass-accent` losing to `.pill`, seen from the other side. `check.mjs` covers both, as `ordem do backdrop-filter` and `textura de material`.

### Liquid

The fifth material is not a fifth texture. Glass filters itself, so the text it carries goes through the blur with it; that is why glass never merges. Liquid splits the material from the content into two layers stacked in one grid cell.

| Layer | Class | What it is |
|---|---|---|
| Silhouette | `.liquid-sheet` | The only filtered element on the page. `aria-hidden`, no pointer events, no text. Holds one `.liquid-blob` per unit. |
| Content | `.liquid-content` | The real DOM, unfiltered. Focus ring, hit area, ARIA and handlers intact. Holds one `.liquid-item` per unit. |

The two layers are mirrors: same display, same gap, same box per unit. That is how the drop sits exactly under the control with no JavaScript measuring anything, and it is also the price. A cluster unit has a fixed size (`--liquid-size`, default `--control-lg`), because a width that depends on the text can only be mirrored by measuring the text. Liquid is for fixed-unit clusters: icon buttons, avatars, dots, an action fan, a segmented indicator. A row of variable-width labels stays `.pill`.

The shadow comes out of the filter itself. `drop-shadow` after `url(#pure-goo)` acts on the already merged mass, so one shadow hugs the whole cluster through every bridge. A `box-shadow` on the blob would enter the blur and the alpha step would eat it, which is exactly why the classic goo effect has no shadow.

| Filter | Deviation | Slope | Intercept | Bridges up to |
|---|---|---|---|---|
| `#pure-goo-tight` | 4 | 20 | -7.83 | 4px |
| `#pure-goo` | 6 | 18 | -7 | 6px |
| `#pure-goo-wide` | 12 | 16 | -6.17 | 10px |

The bridge column was measured on screen, not estimated: the bridge holds while the gap stays below the blur deviation and vanishes a pixel above it. Each variant therefore carries its own gap (`--liquid-bridge-tight`, `--liquid-bridge`, `--liquid-bridge-wide`), and `.liquid-tight` and `.liquid-wide` swap both together. Swapping the filter without swapping the gap is the silent way a cluster comes out as loose pills; `check.mjs` covers it as `folga do líquido`.

The filter numbers are not tokens. `feColorMatrix` does not read `var()`, and a token nothing resolves is a token that lies. They live in the three `#pure-goo` definitions in `templates/page.html`. Only what CSS actually consumes is a token: `--liquid-fill`, `--liquid-edge`, `--liquid-drop`, `--liquid-bridge*`, `--liquid-pad`.

What does not cross into pure CSS: the spring, the droplet that trails a moving element, and the inner bezel rebuilt on the merged silhouette. All three have to measure a rectangle every frame.

Variants: `.liquid-tight`, `.liquid-wide`, `.liquid-sq` (surface radius instead of circle), `.liquid-stack` (vertical), `.liquid-fold` (units collapse into one drop; removing the class fans them out).

One `transform` declaration per element, composed from `--liquid-shift-x`, `--liquid-shift-y` and `--liquid-swell`. Each state writes its own token and none writes `transform`. Two rules writing `transform` on the same blob is the 1.4.2 and 1.4.3 defect by another route: the fan wrote a translate and the swell wrote a scale, and `:has()` takes the specificity of its most specific argument, so the swell won at 0,6,0 against 0,3,0 whatever the file order. Focusing the second unit of a folded cluster returned its blob to the open position while the item stayed folded, and the mirror broke exactly where it is the material's premise. `check.mjs` covers it as `transform do líquido`.

### Liquid motion

Five reads, and none of them writes a `transform`: every one writes the registered tokens, so the composition stays the chapter's single transform declaration.

The tokens are registered with `@property` — `--liquid-shift-x`, `--liquid-shift-y`, `--liquid-swell`, `--liquid-stretch-x`, `--liquid-stretch-y`. An unregistered custom property is text: it jumps between frames and does not interpolate, so a keyframe writing `--liquid-swell` would step instead of flow. `--liquid-swell` is the uniform swell and `--liquid-stretch-*` multiplies over it per axis; multiplying rather than overriding is deliberate, because a registered property always has a value, so `var()`'s fallback never fires and a registered `--liquid-swell-x` would silently erase the uniform swell.

Every one of those `var()` calls still carries a fallback, and that is not redundancy. Registration is the first hard browser gate this language takes on, and unlike the rest it does not degrade on its own: where `@property` is ignored the tokens have no value at all, `calc(var(--liquid-swell) * var(--liquid-stretch-x))` is invalid at computed-value time, and the whole declaration falls to `transform: none` — which takes out the fan, the swell and the morph, all of which worked before the animations existed. Measured: three blobs came back with `none`. With the fallbacks in place, `@property` only *adds* interpolation and the previous behaviour stays as the floor.

| Class | Read | Mechanism | Needs a state |
|---|---|---|---|
| `.liquid-trail` | The mass stretches behind a moving unit | Phase difference from `transition-delay` | `.is-flux` |
| `.liquid-drip` | A drop stretches, necks and lets go | Keyframes on shift and stretch | no |
| `.liquid-morph` | A round trigger becomes the surface it opens | Per-axis stretch of the silhouette | `.is-open` |
| `.liquid-pulse` | The cluster breathes while something is pending | Out-of-phase swell loop | no |
| `.is-flux` | Content cross-blurs while the mass flows | `--motion-blur-1` on the content layer | yes |

What the library does with a spring, this does with a curve, and the difference is declared rather than hidden. A spring overshoots on its own and keeps going past the target; reproducing it means integrating every frame, which is JavaScript. What crosses over is the shape of the motion, and the shape is what you recognise: the bridge stretching, the neck thinning, the drop letting go.

Three of the five exist only *while* the mass flows, and CSS cannot say "during". They read `.is-flux`, set on the way in and cleared on the way out — the same contract `.motion-dropdown` has with `.is-open`. Binding them to the resting state was tried and discarded on screen: it left the label blurred forever and the trail reading as loose dots standing still. A travel effect pinned to the resting state is a defect, not a simplification, and `check.mjs` covers it as `desfoque de percurso`.

`.liquid-morph` is the catalogue's plus-to-menu done legally. The source recipe animates `width`, `height` and `border-radius`; here the same read comes out without touching layout, because only the silhouette has to grow — the content is already at its final size and was merely clipped.

`.liquid-pulse` slows down under `prefers-reduced-motion` rather than stopping, the same exception the skeleton already carries. A pending indicator that holds still lies about the state.

Folded units leave the tab order. `opacity: 0` with `pointer-events: none` takes the pointer and not the keyboard: Tab still reached an invisible unit stacked under the first one and the focus ring appeared over nothing. `visibility: hidden` takes both.

### Surface context

Every class that paints a background redeclares `--surface-context` with what it paints. It serves one purpose, and it is the one the contrast sweep gets wrong on its own: the first opaque ancestor is not always the element painting. Inside `.liquid` the background comes from a **sibling** of the text, so walking the ancestry resolves against `--bg` and passes a page that is wrong on screen. The sweep reads `--surface-context`, which inherits, instead of guessing. `check.mjs` covers it as `contexto de superfície`.

### Bezel and pool

Two inset layers give the material thickness: `--glass-bezel` is a diffuse inner glow along the edge, `--glass-pool` is the shadow light deposits at the base after crossing the body. Neither carries spread — a spread ring pushes a second line just inside the contour and the glass starts reading as two hairlines. Both are in `--shadow-glass-rest` and `--shadow-glass-hover`, in all four modes.

`paper-like` gained its own glass block in 1.5.0. Without it, it inherited the light mode's glass and the frost came out cold white over a cream page: the most visible surface on the page would have been the only one that did not belong to the mode.

### Light

`web/light.css` is the fifth file, optional, imported after `patterns.css` and before `motion.css`. It is the only part of the language that ships with JavaScript, and the reason is narrow: a stylesheet cannot read the pointer.

The glass here is a still material. It blurs what is behind it, lights the top edge and pools a shadow at the base, and it does all three the same way wherever the pointer happens to be. The light layer does not change the material, it adds the **source**: a highlight that travels when the light travels, a rim that lights on the side the light comes from, a depth that only appears when the observer moves. The pointer is the observer.

The contract is three numbers, and it is the whole interface between the two files:

| Written by `light.js` | Meaning |
|---|---|
| `--light-x`, `--light-y` | pointer position inside the box, 0 to 1 |
| `--light-near` | proximity, 1 under the pointer and 0 at `--light-reach` away |

`light.js` knows nothing about highlights, rims, tilt or magnets: no effect name appears in that file. It measures a box and writes three numbers. Every appearance decision lives in `light.css`, which is why a new effect in this layer touches no JavaScript.

`--light-near` is the only off switch. There is no second "pointer absent" state anywhere in the layer: every effect multiplies by the proximity, so the cursor leaving takes all of them to rest at once. One state fewer is one state fewer to fall out of sync.

| Class | Read | Writes |
|---|---|---|
| `.lit` | a specular spot travels with the pointer | opacity of a negative-index plane |
| `.lit-edge` | the rim lights on the side the light comes from | offset of an inset shadow |
| `.lit-tilt` | the surface turns toward the pointer | `--light-turn-x`, `--light-turn-y` |
| `.lit-pull` | the control drifts toward the pointer before it arrives | `--light-shift-x`, `--light-shift-y` |
| `.lit-swell` | the control grows as the pointer nears | `--light-grow` |
| `.lit-field` | the section lights behind the glass sitting on it | opacity of a negative-index plane |
| `.lit-cursor` | a drop of glass rides with the cursor and **bends** the page behind it | `--light-shift-x`, `--light-shift-y` |
| `.lit-stage` | gives the tilt a vanishing point | `perspective` |

Tilt, magnet and swell act on the same element, so none of them writes `transform`. Each writes its own token and one composed declaration reads all of them, the same discipline the liquid chapter carries and for the same defect: two rules writing `transform` fight over specificity instead of adding up. Every `var()` in that composition keeps a fallback, because `@property` is the language's one hard browser-version gate: without support the `calc()` is invalid at computed-value time and the whole declaration falls to `transform: none`, which would take tilt, magnet and swell down together.

The light plane is a pseudo-element at `z-index: -1`, which paints after the element's own background and before its in-flow content. Three positions were tried and two are wrong: at `z-index: 0` or with no index the pseudo paints in the positioned layer, above the text, and the highlight washes out the label of the button carrying it; at `z-index: -1` without `isolation: isolate` it slides behind the ancestor's background and disappears. In `.lit-field` the same negative index is what puts the light **under** the glass that sits on the section, so the backdrop filter of every surface above distorts it. An overlay on top would stay sharp and give away that the light passes through nothing.

Degradation is decided by input, never by width. Under `pointer: coarse` there is no hover: the stylesheet zeroes `--light-near` and the script does not register, and `check.mjs` fails the build if only one of the two gives up. Under `prefers-reduced-motion` the light stays and the travel goes, because the highlight and the rim are colour changes that displace nothing while tilt, magnet and swell are motion; blanking the whole layer would also blank the focus-of-light information, which is the opposite of what the preference asks for.

### The cursor lens

`.lit-cursor` is a 24px disc of glass under the pointer that does not blur the page: it **bends** it. Inside the lens what sits behind appears larger and warped, the way thick glass behaves.

None of that is a CSS scale, because there is no scale of the backdrop in CSS. It is sampling. `backdrop-filter` accepts a reference to an SVG filter, and the filter reads each backdrop pixel's position out of a displacement map, where the R channel carries the horizontal offset, G the vertical, and 128 is rest. A gradient from 255 to 0 across the circle makes every point sample from nearer the centre, and sampling from nearer **is** magnifying.

`#pure-lens` in the starter template chains two passes, and being two is the point:

| Pass | Profile | Scale | What it does |
|---|---|---|---|
| body | flat in the middle, steep at the rim | 0.52 | the centre magnifies cleanly |
| rim | exactly 128 across the middle 80%, vertical at the ends | 0.18 | magnifies nothing, only bends what passes close to the edge |

In a single map, raising the rim drags the middle with it. Split, one adjusts without the other. The two scales are the "gota" read, chosen on screen out of five — lupa, vidro grosso, anel, gota and bolha differed only in this pair and the diameter, so changing the read is two numbers and a token, never a rewritten filter.

The numbers and the maps are not tokens, for the same reason the goo matrices are not: `feImage` and `feDisplacementMap` do not read `var()`, and a token that resolves to nothing is a token that lies. Both maps come out of `tools/lens-map.mjs`, so they are reproducible rather than an opaque string pasted into the template. `primitiveUnits="objectBoundingBox"` is what makes one filter serve any size: the scales become fractions of the element's own box, so changing `--light-lens` needs no new filter. The filter region goes to 200% because displacement samples **outside** the box; without the margin the rim pulls from an area the filter does not have and returns a transparent notch just inside the contour.

The floor is plain blur, declared **outside** the `@supports`: where a filter reference is not honoured the lens becomes the thin glass drop it was before, rather than disappearing. Chrome and Edge bend; Safari and Firefox blur. Inside the `@supports` there is only the standard declaration, and the missing `-webkit-` pair is deliberate: `-webkit-backdrop-filter` does not accept `url()`, measured, so writing the pair there would be an invalid declaration followed by a valid one. The rule about pair order applies where there is a pair, and the pair lives in the floor. `check.mjs` covers both halves as `lente do cursor` and `piso da lente`.

The lens carries `--shadow-lens` rather than `--shadow-glass-rest`: the wide fall of the glass shadow is drawn for a card, and on a 24px disc it reads as a smudge around the pointer instead of weight.

The lens swells over anything clickable, and that is not decoration: it is what is **left** of the affordance once the system cursor steps aside, because a change of shape over a link is half of what the pointing hand communicated. It is written as `--light-grow`, the same token `.lit-swell` uses, and the transition is on the **token** rather than on `transform` — the only form that works. The displacement comes from the script every frame; transitioning `transform` would damp that too and the lens would drag behind the pointer. A registered property interpolates on its own, so the swell eases while the travel stays instant. That is the payoff of `@property`: typed tokens animate without anyone animating `transform`.

**`.lit-cursor-only` hands the pointer over.** Opt-in, and opt-in on purpose: hiding the native cursor costs. The I-beam over text, the pointing hand over a link and the drag arrow all go, and no lens gives back all three. The class exists for a page that decided to pay that with its eyes open, not as a default. Text fields are the exception inside the exception and keep `cursor: text`, because there the I-beam is not decoration: it is the only thing saying where the character will land.

What the class must never do is leave the page with no pointer at all. Where the lens does not exist the system cursor comes back in the same query that removes it: under `pointer: coarse` the script does not register, and under `prefers-reduced-motion` the lens is hidden. `check.mjs` fails the build if either half is missing.

The class name appears **twice** in the selector, and that is not a typo. `.lit-cursor-only *` weighs a single class, exactly like the `.card { cursor: pointer }` any app writes, and a tie loses to whatever comes later. Measured: the card went back to showing the pointing hand and half the screen carried two pointers. Same lesson already closed in `.glass-accent` and in the four textures, arriving by a third road: a modifier that loses the cascade is a modifier that does not exist.

What this layer does not do, and the exclusion is the rule working: no spring, no inertia, no physical cursor trail. All three integrate position every frame, and an effect that only exists while a rAF loop runs is not a material, it is animation under another name. `.lit-cursor` is also not a custom cursor: the system cursor stays, with the shape the system chose, and the drop rides along. Replacing the cursor with a drawing is the fastest way to lose the text, link and drag affordances at once.

### Light tokens

Geometry only. The colour of the light comes from the glass tokens that already exist — `--glass-specular`, `--glass-bezel`, `--glass-edge-hover` — because a layer that reacts to the pointer is not a reason for a new palette.

| Token | Value | Meaning |
|---|---|---|
| `--light-reach` | 240px | distance at which proximity reaches zero |
| `--light-spec` | 180px | diameter of the specular highlight |
| `--light-rim` | 20px | thickness of the rim that lights |
| `--light-pull` | 6px | maximum magnetic displacement |
| `--light-tilt` | 8deg | maximum tilt angle |
| `--light-depth` | 800px | perspective of the stage |
| `--light-lens` | 1.5rem | diameter of the cursor lens |

No duration and no curve of its own: the light settles with `--duration-3` and `--ease-out-soft`, like every other control.

Eight registered properties carry the layer: `--light-x`, `--light-y` and `--light-near` inherit, so a section can light everything inside it from one write; `--light-turn-*`, `--light-shift-*` and `--light-grow` do not, because each unit has its own displacement.

Cost is bounded on purpose. One pointer listener on the window rather than one per element; every write inside a `requestAnimationFrame`, so several moves in one frame collapse into one write; `getBoundingClientRect` batched and only when the geometry can have changed, since measuring per element inside the pointer loop is the classic way this effect costs 8ms a frame. An element out of reach leaves the loop before any write, and a repeated value is discarded, so at rest the per-frame cost is zero.


## Motion

| Token | Curve | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | colour, background and border on hover |
| `--ease-out` | `cubic-bezier(0,0,.2,1)` | simple entrance |
| `--ease-out-soft` | `cubic-bezier(.25,0,0,1)` | content, tab transition, chart line drawing |
| `--ease-out-expo` | `cubic-bezier(.16,1,.3,1)` | slide, scale, bar growth |
| `--ease-swift` | `cubic-bezier(.23,.88,.26,.92)` | hover displacement |

Durations `--duration-1` (100ms) through `--duration-6` (500ms). Hover default 200ms. Glass 350ms with `--ease-out-soft`.

Displacement: `--nudge-1` 2px, `--nudge-2` 3px, `--nudge-3` 4px.

Entrance stagger: 60ms per item, capped at six steps. Class `.stagger`.

Everything collapses under `prefers-reduced-motion: reduce`.

### The motion layer

`web/motion.css` is the fourth file, optional, imported after `light.css` and before `agent.css`. Twenty-one named recipes for state changes.

The recipes come from the transitions.dev catalogue by Jakub Antalik and were remapped, not copied. That catalogue carries its own scale, seven durations and six curves; this language has six durations and five curves and forbids a new one. The remap follows the rule the catalogue itself states, match by **use** and not by number:

| Use | Catalogue | Here |
|---|---|---|
| Anchored surface opens | 250ms | `--duration-3` (200) |
| Centred surface opens | 250ms | `--duration-4` (300) |
| Either closes | 150ms | `--duration-2` (150) |
| Icon and text swap | 250ms | `--duration-3` (200) |
| Toast rises | 400ms | `--duration-5` (350) |
| Emphasis, confirmation | 500ms | `--duration-6` (500) |
| Stagger between lines | 40ms | `--duration-1` (100) |

`cubic-bezier(0.22, 1, 0.36, 1)`, the catalogue's dominant curve, is `--ease-out-expo` here. `ease-in-out` is `--ease-standard`, `ease-out` is `--ease-out`. `linear` stays `linear` and does not become a token, because it is not a curve: it is the absence of one, and it only appears in loops that never settle.

Three px values were born with the layer, and they are blur radii, not a scale: `--motion-blur-1` (2px), `-2` (3px), `-3` (8px). They blur the element itself while it moves and clear on settle, which is the opposite of glass, where the blur is on the backdrop and stands still. Mixing the two families is how a card ends up blurred at rest.

Classes: `.motion-dropdown`, `.motion-modal`, `.motion-scrim`, `.motion-toast`, `.motion-tip`, `.motion-icon-swap`, `.motion-text-swap`, `.motion-lines`, `.motion-badge`, `.motion-digits`, `.motion-shake`, `.motion-reveal`, `.motion-shimmer`, `.motion-tabs`, `.motion-check`, `.motion-switch-thumb`, `.motion-pages`, `.motion-stack`, `.motion-counter`, `.motion-spin`, `.motion-wave`, `.motion-learn`, `.motion-cycle`.

The five added in 1.6.0. `.motion-stack` piles notices three deep and no further, because the fourth sits behind three layers of scale and stops being readable; it recedes by `transform` in one grid cell, so nothing reflows when a notice arrives, and the fourth and beyond leave the tab order with `visibility: hidden` rather than `opacity: 0`, the same defect already closed in the liquid fan. `.motion-counter` runs a reel of digits to its value and coexists on purpose with `.motion-digits`, which cross-blurs: the reel says the number **travelled** the distance, the blur says it was **replaced**. `.motion-spin` is one element for both halves of a wait: an arc runs the circumference while it turns and closes into the full ring when it lands, which removes the flicker of swapping a spinner for a mark. The check inside the ring is `.motion-check` on the same `<svg>`, which already draws its stroke with the right delay. Two recipes composing, and neither needed path interpolation, which is what the source recipe uses and what CSS does not do on its own. `.motion-wave` is the organic sibling of `.motion-shimmer`, an angled band with offset stops, and the difference shows in long text where the straight sweep crosses the whole line at once and reads as a paint error. `.motion-learn` grows an underline by `scaleX` from the left and moves only the chevron: a label that shifts on hover is a target running from the cursor.

`.motion-cycle` takes `.motion-icon-swap` to a loop: up to four images share one grid cell and cross through blur, and what decides is time rather than an external state. Four is the declared ceiling, the same choice as the eight units of the liquid cluster: each unit needs its own delay, and a delay lives in a rule, not in a count. A fifth image starts asking for JavaScript, and past that it is not a CSS recipe. The cycle length is a **multiple** of `--duration-6` rather than a new number, because an eight-second loop written by hand would be a seventh step of the scale entering through the back door. The visible window is short and the crossing is long on purpose: with those edges two neighbours overlap mid-travel and no frame ever shows an empty cell, which is what makes it read as breathing instead of blinking. Under reduced motion it **stops** on the first rather than slowing, because there is no state to communicate here, unlike the skeleton and the pulse: three portraits of the same person, and one of them says what the three said.

Seven need JavaScript, and each says so in its own comment: `.motion-tabs` for the pill geometry (`--tab-x` and `--tab-w`), `.motion-digits` for the per-digit state, `.motion-shake` and `.motion-dropdown` for adding and clearing the state class, `.motion-counter` for writing the target digit, `.motion-spin` for marking the wait done, `.motion-stack` for inserting the new notice first.

In `.motion-tabs` the width changes without a transition and the position moves with one. The two other routes were discarded on screen, not on paper: transitioning `width` recalculates layout every frame, which the language forbids, and `scaleX` on a full-radius pill stretches the end caps into ellipses, so any tab past the base width renders visibly oval. Swapping the width at once costs one layout instead of one per frame, and the shape stays a pill.

Beyond `transform`, `opacity` and `filter` the layer animates two paint properties, both declared and neither layout: `stroke-dashoffset` in `.motion-check` and `.motion-spin`, and `background-position` in `.motion-shimmer` and `.motion-wave`.

What did not come across, and the exclusion is the rule working rather than a gap.

| Recipe | Why not |
|---|---|
| Card resize, accordion, panel reveal, input clear | animate `width`, `height` or `grid-template-rows` |
| Avatar group hover, card stack hover, double-bounce toggle, like button | need an overshoot curve; a control settles rather than jumps. The toggle came across without the overshoot |
| Confetti burst, drag and drop with physics, smoky dissolve, image-generation placeholder | integrate position, collision or noise every frame. A CSS recipe that needs a rAF loop to exist is not a CSS recipe |
| Pro gradient text, Get Pro button | ask for a hue the palette does not have. The scale stops at eight categorical slots and none of them is brand decoration |
| 3D tilt with glare, image open tilt | not rejected, moved chapters. Both react to the pointer, and nothing in `motion.css` reads a pointer. They are `.lit-tilt` on `.lit-stage` in the light layer |

`check.mjs` covers the layer as `escala de movimento`: a `cubic-bezier` or a hand-written duration in `motion.css` fails the build, because that is a sixth curve or a seventh step entering through the back door.

## Craft rules

Behaviour, not material. Must fails the build or the review, should is the default and leaving it needs a written reason, never has no exception. The binding column names the class or token that already implements the rule.

Much of the table is script checked; `node tools/check.mjs` names each rule it covers, so read its output rather than a count here. Among them: `color-scheme` in all four modes, no `transition: all`, no transition of a layout property, the interaction tokens agreeing between `tokens.json` and `tokens.css`, the presence of a focus ring, the width breakpoint equalling `--breakpoint-stack`, every control class reaching 44px under a coarse pointer, `.table-scroll` existing to keep the body from scrolling sideways, and every class used in the guide having a rule somewhere.

### Narrow

The narrow screen is not the wide one shrunk, and until 1.5.0 the language had not one width media query: `--breakpoint-stack` lived in `tokens.css` and in `tokens.json` and was read by nothing. A token nothing resolves is a token that lies, and this one lied about the most visible thing on the screen.

| Rule | Level | Bound to |
|---|---|---|
| Every screen designed at 375 and at 1280, both swept | Must | `--breakpoint-stack` |
| The narrow screen does not inherit the wide one's approval, nor the reverse | Must | — |
| Hit area decided by `pointer: coarse`, never by width | Must | `--hit-min-touch` |
| Body never scrolls sideways; a wide table scrolls inside its own container | Must | `.table-scroll` |
| Deep glass drops one texture step below the breakpoint | Must | `.glass-deep`, `.overlay` |
| Type size does not shrink; only the section title changes step | Must | `--text-*` |
| Spacing collapses 96 to 48 and 48 to 24; nothing goes under 24 | Must | `--space-*` |
| A menu that hides three links to save 40px | Never | — |

A tablet at 1280px is touch and a phone with a mouse attached is not, so deciding hit area by width gets both wrong. The breakpoint literal in the media query cannot be `var()` — `@media` does not read custom properties — so it is written out and `check.mjs` fails the build when it diverges from the token, the same way `theme-color` and the goo filters are handled.

### Interaction tokens

| Token | Value | Role |
|---|---|---|
| `--hit-min` | 24px | floor for a hit area |
| `--hit-min-touch` | 44px | same floor under `pointer: coarse` |
| `--focus-ring` | 2px | outline width, colour `--accent`, `--text` over glass |
| `--focus-offset` | 2px | outline offset |
| `--field-height` | 40px | minimum field height, 44px on touch |
| `--text-field` | 1rem | field text size, the one exception to one size per control class |
| `--scroll-offset` | 88px | `scroll-margin-top` under a fixed bar |
| `--stroke` | 2px | drawn stroke: spinner ring, checkbox mark |
| `--tap-highlight` | transparent | the native tap flash, replaced by `:active` |

### Keyboard and focus

| Rule | Level | Bound to |
|---|---|---|
| Every interactive element reachable and operable from the keyboard, following the authoring practice for its pattern | Must | native semantics |
| Focus ring visible on `:focus-visible`, group lit on `:focus-within` | Must | `--focus-ring` |
| Focus managed on open, close and delete: trapped in the panel, returned to the trigger | Must | `.modal`, `.overlay` |
| Outline removed without a visible replacement | Never | `check.mjs` |
| Ring switches to `--text` over glass, where the backdrop is unpredictable | Should | `.glass:focus-visible` |

### Target and input

| Rule | Level | Bound to |
|---|---|---|
| Hit area clears 24px, and 44px under a coarse pointer | Must | `--hit-min` |
| Fourteen control classes carry that floor themselves under `pointer: coarse` | Must | `patterns.css`, `agent.css` |
| Visual size may go under the floor, the hit area may not | Must | `.hit` |
| Text field at 16px: below it iOS zooms the page on focus | Must | `--text-field` |
| Browser zoom disabled through `user-scalable` or `maximum-scale` | Never | viewport |
| Double tap delay removed | Must | `touch-action: manipulation` |
| Native tap flash replaced by the language's own pressed state | Should | `--tap-highlight` |

### Forms

| Rule | Level | Bound to |
|---|---|---|
| Paste blocked in a field | Never | any field |
| Free text accepted and validated after, never blocked while typing | Must | `.input` |
| Incomplete form submittable, so validation surfaces | Must | `novalidate` |
| Error next to its field, focus moved to the first one | Must | `.field-error` |
| Submit enabled until the request starts, then a ring and the same label | Must | `[data-loading]` |
| Enter submits a single line field, Cmd or Ctrl with Enter submits a textarea | Must | `.textarea` |
| `autocomplete`, a meaningful name, the right type and inputmode | Must | `.field` |
| Label and control share one hit target, no dead zone | Must | `.check` |
| Checkbox rounds at `--radius-mark` as a field, only the radio is a circle | Must | `.check input` |
| Password managers and one time codes work, pasted codes included | Must | `autocomplete` |
| Values trimmed before they are read | Must | submit handler |
| Unsaved changes warn before navigation | Must | `beforeunload` |
| Spellcheck off for email, code and username | Should | `spellcheck` |
| Placeholder shows the shape of the answer, ellipsis when it is an instruction | Should | `placeholder` |
| Autofocus on desktop with a single primary field, rarely on mobile | Should | `autofocus` |

### State, navigation and feedback

| Rule | Level | Bound to |
|---|---|---|
| URL carries the state: filter, tab, page, open panel, colour mode | Must | `history` |
| Back and forward restore the scroll position | Must | `scrollRestoration` |
| Navigation is an anchor, so modifier and middle click work | Must | `a href` |
| A div with a click handler used to navigate | Never | `a href` |
| Destructive action confirmed, or reversible inside a stated window | Must | `.modal` |
| Toast and inline validation announced through a polite live region | Must | `aria-live` |
| Every state offers the next step, a dead end is a defect | Must | `.empty` |
| Optimistic update reconciled on response, rolled back or undoable on failure | Should | app layer |
| An option that opens a follow up ends in an ellipsis | Should | copy |

### Motion, touch and drag

| Rule | Level | Bound to |
|---|---|---|
| Reduced motion honoured with a reduced variant or with nothing | Must | `patterns.css` |
| Only `transform` and `opacity` animated | Must | `check.mjs` |
| A layout property animated: top, left, width, height | Never | `check.mjs` |
| `transition: all` | Never | `check.mjs` |
| Motion interruptible and driven by input, nothing autoplays | Must | `.viz` |
| `transform-origin` where the movement physically starts | Must | `.viz-grow` |
| SVG transform on a `g` wrapper with `transform-box: fill-box` | Must | svg |
| Overscroll contained in a sheet or drawer | Must | `.drawer` |
| First tooltip in a group waits, its neighbours open at once | Must | `.tip-group` |
| Text selection off during a drag, dragged element inert | Must | `[data-dragging]` |
| CSS first, then the animation API, then a library | Should | five curves |
| Curve matched to size and distance, controls settle rather than jump | Should | `--ease-out-soft` |

### Layout and content

| Rule | Level | Bound to |
|---|---|---|
| Checked on mobile, laptop and ultra wide, the last simulated at half zoom | Must | two axes |
| Safe areas respected | Must | `env(safe-area-inset-*)` |
| No unwanted scrollbar, overflow fixed where it appears | Must | `overflow` |
| Text container survives short, average and far too long content | Must | `.truncate`, `.clamp-2` |
| Flex child carries min-width zero before it can truncate | Must | `.min-w-0` |
| Empty string and empty array render a state, not a broken box | Must | `.empty` |
| Empty, sparse, dense and error are four designs | Must | `.empty`, `.skeleton` |
| Skeleton copies the box of the final content | Must | `.skeleton-line` |
| Contrast rises on hover, active and focus | Must | `--border-hover` |
| Alignment deliberate: grid, baseline or edge | Must | `.grid` |
| Optical alignment wins over geometry by a pixel where perception disagrees | Should | `.optical` |
| Grid and flex do the layout, not measurement in script | Should | `.grid` |
| Nested radius never exceeds the parent, the two stay concentric | Should | `--radius-field` |

### Text and accessibility

| Rule | Level | Bound to |
|---|---|---|
| Document title says where the reader is | Must | `title` |
| Heading levels in order, first keyboard stop skips to the content | Must | `.skip-link` |
| Anything an anchor lands on clears the fixed bar | Must | `--scroll-offset` |
| Numbers that will be compared use tabular figures | Must | `.num` |
| Status carries a second cue beyond colour, icons carry text labels | Must | `.status` |
| Icon only button carries a descriptive accessible name | Must | `.sr-only` |
| Decorative element hidden from the accessibility tree | Must | `aria-hidden` |
| Native element before an ARIA role | Must | semantics |
| Ellipsis is one character, non breaking space holds 10 MB and Cmd K | Must | copy |
| Dates, times and numbers formatted for the locale | Must | `Intl` |
| Curly quotes, short heading balanced across its lines | Should | `.balance` |
| Brand names, tokens and identifiers marked against machine translation | Should | `translate="no"` |
| Inline help first, tooltip last | Should | `.tip` |

### Delivery

| Rule | Level | Bound to |
|---|---|---|
| Mode declared to the browser | Must | `color-scheme` |
| Native select with explicit background colour and text colour | Must | `.select` |
| Mutation answers in under 500ms | Must | app layer |
| List past fifty items virtualised | Must | app layer |
| Above the fold images preloaded, the rest lazy, all declaring their size | Must | `img` |
| Layout reads and writes batched | Must | app layer |
| Profiling with CPU and network throttled, extensions off | Must | devtools |
| Contrast measured, not judged by eye | Must | `check.mjs` |
| Chart colour survives protanopia and deuteranopia at full severity | Must | `check.mjs` |
| Browser frame colour matches the page background | Should | `theme-color` |
| Preconnect for a CDN, preload with swap for a critical font | Should | `link rel` |
| Tested in low power mode and in Safari | Should | device |
| Layered shadows, ambient under direct, borders tinted toward the background | Should | `--shadow-glass-rest` |

Contrast method: `check.mjs` computes WCAG 2.1 ratios and every number published here comes from it. Perceptual contrast is advice on top of that floor, not a replacement: one measure in the build.

### Consuming apps

Framework layer, outside this repository.

| Rule | Level |
|---|---|
| Field keeps focus and value across hydration | Must |
| Field with a value needs a change handler, otherwise a default value | Must |
| Re-renders counted and cut down | Must |
| Date and time rendering guarded against a server and client mismatch | Should |
| Uncontrolled fields by default, a controlled one cheap per keystroke | Should |

## Components

`patterns.css`: `.eyebrow`, `.display`, `.prose`, `.section-header`, `.surface`, `.hover-surface`, `.card-glass`, `.hairline-grid`, `.glass` and variants, `.pill`, `.pill-sm`, `.pill-solid`, `.link-cta`, `.link-muted`, `.hover-fade`, `.tag`, `.status`, `.media`, `.avatar`, `.control-round`, `.fade-up`, `.fade-scale`, `.stagger`.

Interaction layer, new in 1.2: `[hidden]` (forced to `display: none`, so a component with a display of its own still leaves the flow), `.hit`, `.field`, `.field-label`, `.input`, `.textarea`, `.select`, `.select-shell`, `.check`, `.field-error`, `.form-actions`, `[data-loading]`, `.truncate`, `.clamp-2`, `.clamp-3`, `.break-words`, `.min-w-0`, `.num`, `.balance`, `.pretty`, `.empty`, `.skeleton`, `.skeleton-line`, `.overlay`, `.modal`, `.drawer`, `[data-dragging]`, `.tip`, `.tip-group`, `.sr-only`, `.skip-link`.

Visualisation layer: `.viz`, `.viz-crosshair`, `.viz-dot`, `.viz-mark`, `.viz-tip`, `.viz-legend`, `.viz-draw`, `.viz-grow`, `.viz-appear`.

Icons, new in 1.6.0: `.icon`, `.icon-sm`, `.icon-lg`, drawing from `web/icons.svg`.

Agent layer, new in 1.3, in `agent.css`: see the agent layer chapter below.

### Icons

65 symbols on a 24 box, round caps, `currentColor` throughout. Until 1.6.0 the language had none, and the absence showed on every screen built with it: each project brought a set in from outside, with a different box, a different weight and a different cap, so the one drawing on the page that did not belong to the page was the one that repeated most often. None of these is derived from a licensed set — the premium sets are drawn on their own grids and sold under their own licences, and copying their glyph shapes is neither legal nor useful, since the point of an owned set is that it shares the box, the stroke and the cap with everything else.

```html
<svg class="icon" aria-hidden="true"><use href="pure/icons.svg#search"/></svg>
```

The weight does not live in the sprite. It lives in `.icon` as `var(--stroke)`, the same token as the spinner ring and the checkbox mark, and `vector-effect: non-scaling-stroke` keeps it equal across all three sizes: without it the stroke shrinks with the box and a 16px icon reads lighter than a 24px one in the same bar. The effect is an **attribute** on each shape rather than a rule here, and the reason is not style: `vector-effect` is not an inherited property and the content of a `<use>` lives in a shadow tree, so no descendant selector reaches it. `stroke-width` stays in CSS because that one does inherit, and CSS beats a presentation attribute.

Three sizes and no more: `.icon` 20 for a control, `.icon-sm` 16 for metadata, `.icon-lg` 24 for a heading. The box is square and `flex: none`, so a long label beside it never crushes the drawing.

`aria-hidden` by default, because an icon almost always sits next to a label that already says the same thing. An icon alone in a control is the case where it carries meaning, and there the label goes on the control as `aria-label`, not on the drawing.

The sprite has to be served over http: an external `<use>` does not resolve over `file://`, nothing errors, and the element simply comes out empty. `check.mjs` covers the other half of that trap as `ícone sem desenho`, a `<use>` pointing at an id no symbol carries.

| Group | Names |
|---|---|
| Navigation | `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `external`, `close`, `menu`, `more`, `expand`, `collapse` |
| State | `check`, `check-circle`, `alert`, `info`, `clock`, `dot`, `shield` |
| Action | `plus`, `minus`, `search`, `filter`, `sort`, `copy`, `edit`, `trash`, `download`, `upload`, `refresh`, `settings`, `link`, `share`, `send` |
| Object | `file`, `folder`, `database`, `code`, `terminal`, `grid`, `list`, `table`, `chart-bar`, `chart-line`, `image`, `mail`, `user`, `users`, `calendar`, `book`, `tag`, `bookmark` |
| Agent and science | `sparkle`, `tool`, `branch`, `play`, `pause`, `stop`, `molecule`, `helix` |
| Mode | `sun`, `moon`, `contrast` |

## Agent layer

`web/agent.css`. Twenty components for interfaces where a model writes to the screen. Depends on `tokens.css` and `patterns.css`. Adds no colour.

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

The flow, new in 1.6.0, is a **column** and not a canvas. A drag-to-arrange canvas needs absolute position per node and a measurement every frame, and none of that crosses into pure CSS. The column carries what the flow has to say: the order of the steps, where it splits and what each leg does. Free rearrangement is what it does not carry, and that is declared rather than simulated. The connector between two nodes is a pseudo-element border and not a box, because a box between nodes joins the child count and breaks the `:nth-child` of the branch rules; the trigger has no line above and the last step none below, and both exceptions are `:first-child` and `:last-child` rather than classes in the markup. Node kind is state, so the mark takes `--status-*`, and each leg repeats its condition in text: a flow where yes and no differ only by colour is a flow nobody who cannot separate the two can read. Below the breakpoint the branch stacks and the horizontal stem disappears, because two 160px columns on a 375px device are two unreadable columns.

### Agent tokens

| Token | Value | Role |
|---|---|---|
| `--stream-step` | `45ms` | delay between two arriving chunks, multiplied by `--i` |
| `--caret-blink` | `1s` | caret cycle |
| `--meter` | `4px` | thickness of a continuous meter |
| `--rail` | `28px` | indent of the trace body under its head |
| `--gutter-code` | `36px` | line-number column |
| `--pixel` | `3px` | cell of the pixel-grid loader |

### Agent keyframes

| Name | Animates | Used by |
|---|---|---|
| `pure-token` | `opacity`, `translateY` | `.stream .tok`, `.code-line` |
| `pure-caret` | `opacity` | `.caret` |
| `pure-pixel` | `opacity` | `.loader-grid i` |
| `pure-bounce` | `scale`, `opacity` | `.loader-dots i` |
| `pure-eq` | `scaleY` | `.dictate i` |
| `pure-sweep` | `translateX` | `.loader-label::after` |

### Colour assignment

| Meaning | Source | Example |
|---|---|---|
| Task or metric state | `--status-good`, `--status-warning`, `--status-serious`, `--status-critical` | `.task-row[data-state]`, `.up`, `.down`, `tr[data-diff]` |
| Series identity | `--chart-1` to `--chart-8`, in slot order | dot beside a metric name, chart line |
| Syntax highlight | `--text`, `--muted` | `.tok-str`, `.tok-key`, `.tok-com` |

A diff tint is `color-mix(in oklab, var(--status-*) 12%, transparent)`. A selection mark is `color-mix(in oklab, var(--accent) 22%, transparent)`. No new hex enters the language.

### Radius by role in the agent layer

| Element | Radius |
|---|---|
| `.ask`, `.suggest`, `.thread`, `.composer`, `.side`, `.palette`, `.insight`, `.inspector`, `.trace` | `--radius-surface` |
| `.chunk`, `.call`, `.edit`, `.menu-item`, `.side-item`, `.palette-item`, `.numfield`, `.metrics` | `--radius-field` |
| `.code` | `--radius-media` |
| `.source`, `.followup`, `.filter`, `.task-row`, `.chunk-src`, `.tab`, `.seg`, `.selection-bar`, `.meter` | `--radius-control` |
| `.arg-inline`, `.key`, `.confidence .bars i`, `.selection mark` | `--radius-mark` |

### Translations from the source

Six behaviours could not survive the rule that only `transform` and `opacity` animate, or the rule that capitalisation has one form. Five were rebuilt, one dropped.

| Source behaviour | Pure Design version |
|---|---|
| `grid-template-rows` accordion | `[hidden]` plus staggered `pure-fade-up` on the steps |
| `filter: blur(4px)` on an arriving chunk | `opacity` plus a `--nudge-1` rise |
| Confidence and progress by `width` | `transform: scaleX()` with `transform-origin: left` |
| Chip reveal by `max-width` and `margin` | `transform` and `opacity` |
| Shimmer by `background-position` | pseudo-element swept by `translateX` |
| `border-radius` morph on the prompt bar | dropped |
| `WORKSPACE` group heading | sentence case with mono face and eyebrow tracking |

### Craft applied

| Component | Requirement |
|---|---|
| `.trace-head` | `aria-expanded` and `aria-controls` on a real button |
| `.tabs` | `role="tablist"`, `aria-selected`, left and right arrow navigation |
| `.stream` | `aria-live="polite"` on the region, not on each chunk |
| `.loader` | `role="status"` with the elapsed reading inside it |
| `.ask-options` | `fieldset` with a `legend`, radios rather than buttons |
| `.composer-field` | `--text-field` at 16px, never `--text-12` |
| `.palette-list` | `overscroll-behavior: contain`, `.empty` replacing the list with a way out |
| `.task-row` | glyph in the rail repeating state in shape, not colour alone |
| `.insight-pager` | `.hit` where the visual control is under 24px |
| `.grid-table` | `.num` on every column that gets compared, `caption` in `.sr-only` |

## Python API

```python
from pure import palette

palette.series(n)          # first n colours, raises above 8
palette.tokens(mode)       # semantic tokens for the mode
palette.status(mode)
palette.ordinal(n, mode)   # n steps sampled from the ramp
```

```python
from pure import mpl

mpl.use(mode)              # applies globally, registers colormaps
mpl.context(mode)          # context manager
mpl.rc(mode)               # rcParams without applying
mpl.finish(ax, title=, subtitle=, xlabel=, ylabel=, mode=, legend=)
mpl.bar_gap(ax)            # surface gap between stacked segments
```

Registered colormaps: `pure`, `pure_r`, `pure_div`, `pure_div_r`.

`mpl.finish` turns the grid off on heatmaps, left-aligns the title, keeps labels in ink rather than series colour, and shows a legend only from two series up.

Plotly templates: `pure`, `pure_paper_like`, `pure_deep_blue`, `pure_dark`.

## Verification

```
node tools/check.mjs
```

No dependencies, exits 1 on any failure. It checks:

- categorical palette against all four surfaces: lightness band, chroma floor, protanopia and deuteranopia separation (Machado, Oliveira and Fernandes 2009 at severity 1.0), normal-vision floor, mark contrast
- ordinal ramps: monotonicity, minimum lightness step, end contrast
- semantic tokens in all four modes against the declared floor
- colour consistency across `tokens.json`, `web/tokens.css`, `python/pure/palette.py` and `python/streamlit/app.css`
- typographic families across `tokens.json`, `web/tokens.css`, `python/streamlit/app.css`, `python/pure/palette.py` and both `.mplstyle` files
- version across `tokens.json`, `__init__.py`, the guide and this README
- absence of a ninth chart slot
- `color-scheme` declared in all four mode blocks
- no `transition: all` and no transition of a layout property in `patterns.css`, `light.css`, `motion.css`, `agent.css`, the guide or the starter template; `grid-template-rows` and `flex-basis` count as layout properties
- no hex colour written outside `tokens.css`, the one exception being the `theme-color` meta, which is checked against the token instead
- interaction, agent, blur, motion, liquid and light tokens agreeing between `tokens.json` and `web/tokens.css`
- `motion.css` using only the six `--duration-*` and the five `--ease-*`: a hand-written `cubic-bezier` or duration fails the build
- every class that paints a background declaring `--surface-context`
- each goo filter variant swapping its bridge gap along with the filter, and all three `#pure-goo` definitions existing in the template
- each radius role resolving to the numeric step declared in `tokens.json`, `var()` alias followed
- a focus ring that exists
- `theme-color` in the guide and the template matching `--bg` of the light mode
- `.glass-accent` winning the cascade over `.pill`, `.card-glass` and `.glass`, and `.lit-edge` winning over those plus `.overlay`, at rest and on hover: the cascade is resolved rule by rule against the real specificity across `patterns.css` and `light.css` in import order, not read by eye
- one composed `transform` in the light layer, no effect writing `transform` on its own, and every `var()` in the composition carrying a fallback
- `pointer: coarse` giving up on both sides of the light layer, the stylesheet zeroing the proximity and the script declining to register
- every `<use>` in the guide pointing at a symbol that exists in `icons.svg`, and every shape in the sprite carrying `non-scaling-stroke` while `.icon` carries `var(--stroke)`

It does not read `@keyframes` or `animation-delay`. Reduced motion is collapsed by hand in `patterns.css` and `agent.css`, including the delay of every staggered entrance.

## Visual guide

`preview/index.html` renders every token and component in all four modes, with the contrast table recomputed on mode change and a click on any colour copying its token. It loads `../web/*.css` on purpose, to test the files rather than a copy.

Nine chapters: colour, data colour, typography, space and form, glass, motion, craft, components, use. Neither the agent layer nor the liquid and motion layers are chapters of their own: each component sits in the chapter that governs it, marked `Agent layer`, `Liquid layer` or `Motion layer`. Liquid is in glass, because it is a material; the fifteen motion recipes are in motion. The insight card is in data colour, the loader, the trace and streaming text are in motion, the approval card, prompt bar, command search, inspector and selection actions are in craft, and the rest are in components. The craft chapter carries the rule tables above with live demonstrations: focus ring and hit area, a form that surfaces its errors on an empty submit, the three content lengths side by side, and the empty, loading and error states.

Serve from the repository root, not from `preview/`, or the `../web/*.css` imports return 404.

```
python3 -m http.server 8731
# http://localhost:8731/preview/index.html
```

Guide layout rules, applicable to any page built on the language: two vertical axes (columns 1 and 9 of twelve), three spacing steps (24, 48, 96), sentence case, one size per control class, version number only in the footer signature.

## Review routines

`.claude/skills/` holds twelve routines that run in Claude Code against the rules above. `pure-polish` is the routine; the others are its steps or its products.

| Skill | What it does |
|---|---|
| `pure-polish` | Runs the whole sequence over a screen, a page or a Figma file and reports findings by severity |
| `pure-contrast-sweep` | Measures every text against the background actually behind it, in four modes, forcing hidden states first |
| `pure-craft-review` | Keyboard, focus ring, hit area, form, state, URL, reduced motion |
| `pure-spacing-audit` | The three steps (24/48/96) and the two vertical axes, not a 4/8pt grid |
| `pure-analyze-components` | Radius by role, blur by size, one size per control class, colour by function, cascade |
| `pure-motion-opportunities` | Where motion helps, which recipe, and which loose duration maps to which token by use |
| `pure-design-review` | Senior judgement on the pixel: hierarchy, density, rhythm, the decision nobody took |
| `pure-ux-writing` | Sentence case, no caption under a heading, error in three parts, no product voice |
| `pure-responsive` | Wide screen to narrow, and auditing the narrow one |
| `pure-anatomy` | Numbered markers over the image and a table of attribute per part |
| `pure-handoff` | Markup, tokens, states, keyboard behaviour, four modes, and the cases that break |
| `pure-tokens-from-selection` | Maps the values a selection uses onto tokens and lists what has nowhere to go |

Where the input is a Figma file, the routines call the MCP tools that exist: `get_metadata` for the tree and geometry, `get_screenshot` for the pixel, `get_design_context` for code and bound tokens, `get_variable_defs`, `get_motion_context`, `search_design_system`. Writing to a file loads `figma-use` first, which is a mandatory prerequisite.

## Migrating existing apps

`apps/biohub` and its subapps use Bootstrap colours. Import `web/tokens.css` at the top of each `style.css` and swap: `#0d6efd` to `var(--accent)`, `#198754` to `var(--status-good)`, `#dc3545` to `var(--status-critical)`, `#adb5bd` to `var(--muted)`, background greys to `var(--bg)` and `var(--surface)`. Charts move to the data palette.

## Keeping in sync

A change to the language updates three places in the same session: this repository, the "Design language: Pure Design" section of `~/.claude/CLAUDE.md`, and the `pure-design-system.md` memory file.

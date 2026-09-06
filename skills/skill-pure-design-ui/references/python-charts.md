# Python: matplotlib, plotly, Streamlit

The language on the Python side: same palette, same type, same rules. The
package lives at `assets/pure-design/python/pure/` and has no dependency
beyond the plotting library it themes; `pure.palette` imports with nothing
installed.

## Install or vendor

```bash
# vendor into a project (no PyPI package): copy the folder next to the code
cp -r assets/pure-design/python/pure <project>/pure
# or put it on the path for a notebook
import sys; sys.path.insert(0, "assets/pure-design/python")
```

## matplotlib

```python
import matplotlib.pyplot as plt
from pure import mpl

mpl.use("light")                     # light | paper-like | deep-blue | dark; applies globally, registers colormaps

fig, ax = plt.subplots()
ax.plot(x, y)                        # comes out in slot 1 (--chart-1)
ax.plot(x, z)                        # slot 2
mpl.finish(ax, title="Coverage per sample", subtitle="reads", ylabel="reads")
fig.savefig("coverage.png")          # 300 dpi, bg of the mode, tight
```

- `mpl.use(mode)` applies globally; `mpl.context(mode)` is a context manager;
  `mpl.rc(mode)` returns the rcParams without applying.
- `mpl.finish(ax, title=, subtitle=, xlabel=, ylabel=, mode=, legend=)` does
  what rcParams cannot: grid off on heatmaps, y-grid only otherwise, spines
  collapsed to the bottom, title left-aligned, labels in ink (`--muted`) and
  never in series colour, legend only from two series up.
- `mpl.bar_gap(ax)` inserts the surface-coloured gap between stacked
  segments (the hairline-grid idea applied to bars).
- Registered colormaps: `pure`, `pure_r` (sequential, nine steps),
  `pure_div`, `pure_div_r` (blue to amber with grey at the midpoint).
- Without the package: `plt.style.use("assets/pure-design/python/pure-light.mplstyle")`
  or `pure-dark.mplstyle`. The style sheets carry the rcParams only; no
  colormaps, no `finish`.

Fonts: Public Sans for labels and Spline Sans Mono for tick values when
installed; the fallbacks are Helvetica Neue, Arial, DejaVu Sans and Menlo,
DejaVu Sans Mono. In a container without the fonts the figure still comes out
right; do not fetch fonts to satisfy the theme.

## plotly

```python
import plotly.express as px
from pure import plotly as pp

pp.use("light")                      # sets pio.templates.default; returns the template name
fig = px.line(df, x="day", y="reads", color="sample")
pp.finish(fig, title="Coverage per sample", subtitle="reads")
fig.show()
```

Templates: `pure`, `pure_paper_like`, `pure_deep_blue`, `pure_dark`, also
reachable as `pp.template(mode)`. `finish` applies the same rules as the
matplotlib side: left title, ink labels, legend from two series up, no
vertical grid.

## seaborn and pandas

Both draw through matplotlib, so `mpl.use(mode)` covers them. For seaborn
pass `palette=palette.series(n)` explicitly when a plot builds its own hue
map, otherwise it substitutes its own cycle.

## Streamlit

Copy `assets/pure-design/python/streamlit/config.toml` to
`.streamlit/config.toml` (light theme; Streamlit accepts one theme per
config) and inject `app.css`, which carries the dark mode through
`prefers-color-scheme` and the type, radius and control rules:

```python
import streamlit as st
from pathlib import Path
st.markdown(f"<style>{Path('pure/app.css').read_text()}</style>", unsafe_allow_html=True)
```

`maxUploadSize` is 500 MB in the shipped config and telemetry is off.

## The palette API

```python
from pure import palette

palette.series(n)            # first n categorical colours in slot order; raises above 8
palette.tokens(mode)         # semantic tokens for the mode: bg, surface, text, muted, accent, border, ...
palette.status(mode)         # good, warning, serious, critical for the mode
palette.ordinal(n, mode)     # n steps sampled from the ordinal ramp of the mode
palette.CATEGORICAL          # the eight slots
palette.SEQUENTIAL           # nine steps
palette.ORDINAL_LIGHT, palette.ORDINAL_DARK   # seven steps each, validated separately
palette.DIVERGING            # blue to amber, grey midpoint
palette.ALL_PAIRS_SAFE_MAX   # 3: the series cap for scatter, bubble, map, small multiples
```

## Chart rules that the theme cannot enforce

| Rule | Level |
|---|---|
| Series come from the eight slots in order, never cycled, never re-sorted by value | Must |
| Scatter, bubble, map, small multiples: three series, then facet or group | Must |
| State colour (`status`) never identifies a series; a series never carries state | Must |
| Labels, ticks, annotations in ink (`text` or `muted`), never in the series colour | Must |
| Never two y-axes on one chart | Never |
| Title left-aligned, sentence case; subtitle is the unit or the question, not a caption | Must |
| Compared numbers in tabular figures (mono face) | Must |
| Sequential data on `pure`, diverging on `pure_div` with the neutral at the true midpoint | Must |
| Heatmap without grid; bar chart with the y-grid only | Should |
| Export at 300 dpi with the mode's background, never transparent | Should |
| A figure for a paper is exported in light and checked in dark; the same figure must survive both | Should |

Colour vision: the eight slots are verified under protanopia and deuteranopia
at full severity. Do not add a ninth colour for a ninth series; `series(9)`
raises on purpose.

## Figures for manuscripts and BioRender

A figure drawn in BioRender or draw.io for a paper uses the same eight slots
for series and the same status four for state, so it sits beside the
matplotlib panels without a second palette. Hex values are in `tokens.md`.
Type is Public Sans; a mono face for identifiers.

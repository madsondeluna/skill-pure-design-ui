"""Template plotly da linguagem pure.

Uso:

    from pure import plotly as pxt
    pxt.use("light")                       # vira o template padrao

    import plotly.express as px
    fig = px.line(df, x="pos", y="score", color="chain")
    pxt.finish(fig, title="Escore por posicao")

`use` registra um template por modo (pure, pure_paper_like,
pure_deep_blue, pure_dark) e define o pedido como padrao de
`plotly.io`.
"""

from __future__ import annotations

import plotly.graph_objects as go
import plotly.io as pio

from . import palette as p

_SANS = ", ".join(f'"{f}"' if " " in f else f for f in p.FONT_SANS)
_MONO = ", ".join(f'"{f}"' if " " in f else f for f in p.FONT_MONO)


def _scale(colors: list[str]) -> list[list]:
    last = len(colors) - 1
    return [[i / last, c] for i, c in enumerate(colors)]


def template(mode: str = "light") -> go.layout.Template:
    """Constroi o template do modo pedido."""
    t = p.tokens(mode)
    ink, muted = t["text"], t["muted"]
    bg, grid = t["bg"], t["border"]

    return go.layout.Template(
        layout=dict(
            colorway=p.CATEGORICAL,
            paper_bgcolor=bg,
            plot_bgcolor=bg,
            font=dict(family=_SANS, size=12, color=ink),
            title=dict(
                x=0.0, xanchor="left", y=0.95,
                font=dict(size=16, color=ink),
                pad=dict(b=16),
            ),
            margin=dict(l=56, r=24, t=64, b=48),
            colorscale=dict(
                sequential=_scale(p.SEQUENTIAL),
                sequentialminus=_scale(list(reversed(p.SEQUENTIAL))),
                diverging=_scale(p.DIVERGING),
            ),
            xaxis=dict(
                showgrid=False,
                zeroline=False,
                showline=True,
                linecolor=grid,
                linewidth=1,
                ticks="outside",
                ticklen=4,
                tickcolor=grid,
                tickfont=dict(size=11, color=muted),
                title=dict(font=dict(size=11, color=muted), standoff=12),
                automargin=True,
            ),
            yaxis=dict(
                showgrid=True,
                gridcolor=grid,
                gridwidth=1,
                zeroline=False,
                showline=False,
                ticks="",
                tickfont=dict(size=11, color=muted),
                title=dict(font=dict(size=11, color=muted), standoff=12),
                automargin=True,
            ),
            legend=dict(
                orientation="h",
                yanchor="bottom", y=1.0,
                xanchor="left", x=0.0,
                bgcolor="rgba(0,0,0,0)",
                borderwidth=0,
                font=dict(size=11, color=muted),
                itemsizing="constant",
            ),
            hoverlabel=dict(
                bgcolor=t["surface"],
                bordercolor=grid,
                font=dict(family=_SANS, size=12, color=ink),
                align="left",
            ),
            hovermode="x unified",
            separators=".,",
        ),
        data=dict(
            scatter=[go.Scatter(line=dict(width=2), marker=dict(size=8))],
            scattergl=[go.Scattergl(line=dict(width=2), marker=dict(size=8))],
            bar=[go.Bar(marker=dict(line=dict(color=bg, width=2)))],
            heatmap=[go.Heatmap(colorscale=_scale(p.SEQUENTIAL))],
            contour=[go.Contour(colorscale=_scale(p.SEQUENTIAL))],
            histogram=[go.Histogram(marker=dict(line=dict(color=bg, width=1)))],
            box=[go.Box(line=dict(width=1.5))],
            violin=[go.Violin(line=dict(width=1.5))],
        ),
    )


# um template por modo; o nome segue o modo, com o claro sem sufixo
_NAMES = {
    "light": "pure",
    "paper-like": "pure_paper_like",
    "deep-blue": "pure_deep_blue",
    "dark": "pure_dark",
}


def use(mode: str = "light") -> str:
    """Registra os quatro templates e define o do modo pedido como padrao."""
    for m, name in _NAMES.items():
        pio.templates[name] = template(m)
    if mode not in _NAMES:
        raise ValueError(f"modo desconhecido: {mode!r}. Use {list(_NAMES)}.")
    pio.templates.default = _NAMES[mode]
    return _NAMES[mode]


def finish(
    fig: go.Figure,
    title: str | None = None,
    subtitle: str | None = None,
    mode: str = "light",
) -> go.Figure:
    """Aplica a hierarquia de titulo. Subtitulo entra como anotacao no tom mudo."""
    if title:
        fig.update_layout(title_text=title)
    if subtitle:
        fig.add_annotation(
            text=subtitle, xref="paper", yref="paper",
            x=0.0, y=1.06, xanchor="left", yanchor="bottom",
            showarrow=False, font=dict(size=12, color=p.tokens(mode)["muted"]),
        )
        fig.update_layout(margin=dict(t=88))
    return fig

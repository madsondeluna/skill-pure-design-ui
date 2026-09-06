# skill-pure-design-ui

An agent skill for building, reviewing and polishing interfaces in Pure Design, the visual language of madsondeluna.github.io. It merges three sources into one folder that follows the Agent Skills open standard:

| Source | What it contributes |
|---|---|
| madsondeluna/pure-design-language | tokens, four modes, glass and liquid materials, the light layer, 23 motion recipes, the agent-UI layer, the icon sprite, the matplotlib and plotly themes, the craft rules and the twelve review routines |
| madsondeluna/make-interfaces-feel-better | the polish details: concentric radius, optical alignment, layered shadows, interruptible motion, tabular numbers, icon weight, hit areas, performance |
| madsondeluna/taste-skill (soft-skill) | the agency-grade taste: anti-defaults, vibe by mode, composition by axis, the bezel, the island button, the detached nav, the pre-output checklist |

Where the sources disagree, Pure Design wins and the principle of the other source is kept, expressed as a token. Every reconciliation is written down in the references.

## What it does

- Builds a page, dashboard, artifact, Streamlit or Plotly app from the bundled language files, on the two axes and the three spacing steps, in all four modes.
- Reviews an existing screen, page, artifact or Figma file with a fixed routine (contrast, craft, responsive, spacing, components, motion, copy, polish), at 1280px and at 375px, and reports findings by severity with a verdict.
- Produces component anatomy, handoff documents and token maps from a selection.
- Themes matplotlib, plotly, seaborn and Streamlit with the same palette.
- Ships three Python scripts and the language's own `check.mjs` so the rules that can be verified by a script are verified by a script.

## Repository layout

```
README.md                          this file, for people
skills/
  skill-pure-design-ui/
    SKILL.md                       entry point read by the agent
    references/                    tokens, materials, motion, craft rules, components,
                                   polish details, taste, review routines, python charts,
                                   tooling and MCP
    scripts/
      scaffold.py                  starts a project from the bundle
      audit_css.py                 finds literals and forbidden transitions in app CSS
      contrast.py                  WCAG 2.1 ratios per token pair, four modes, alpha composed
    assets/pure-design/            mirror of pure-design-language 1.6.0
      tokens/  web/  python/  templates/  preview/  tools/  LANGUAGE.md
```

`LANGUAGE.md` is the upstream README of the language, renamed because a skill folder must not carry a README.md of its own. `tools/check.mjs` reads it under that name; nothing else changed.

## Installation

The skill is one folder, `skills/skill-pure-design-ui`. Every agent below reads the same folder; only the location changes.

### Claude Code

Personal, available in every project:

```bash
git clone https://github.com/madsondeluna/skill-pure-design-ui /tmp/pure-skill
mkdir -p ~/.claude/skills
cp -r /tmp/pure-skill/skills/skill-pure-design-ui ~/.claude/skills/
```

Project only, committed with the repository:

```bash
mkdir -p .claude/skills
cp -r /tmp/pure-skill/skills/skill-pure-design-ui .claude/skills/
```

A symlink works in either location if you prefer to keep one copy:

```bash
ln -s /path/to/skill-pure-design-ui/skills/skill-pure-design-ui ~/.claude/skills/skill-pure-design-ui
```

Start a new session and ask `What skills do you have?` to confirm it is listed. The skill loads on its own when the request matches the description; `/skill-pure-design-ui` invokes it by name. Precedence on a name clash is enterprise, then personal, then project.

### Claude.ai, Claude Desktop and Claude Cowork

1. Zip the folder so that `SKILL.md` is at the top level of the zip, or download the packaged `skill-pure-design-ui.skill` from the releases page.
2. In claude.ai open Settings, then Capabilities, then Skills, and upload the file.
3. Toggle the skill on.

Cowork uses the skills enabled on your claude.ai account, so one upload covers chat, Desktop and Cowork. An organisation admin can deploy the skill workspace-wide instead.

### OpenAI Codex

Codex discovers skills from `.agents/skills` locations and loads `SKILL.md` when the task matches or when you mention it with `$skill-pure-design-ui`.

Personal:

```bash
mkdir -p ~/.agents/skills
cp -r /tmp/pure-skill/skills/skill-pure-design-ui ~/.agents/skills/
```

Repository:

```bash
mkdir -p .agents/skills
cp -r /tmp/pure-skill/skills/skill-pure-design-ui .agents/skills/
```

Restart Codex after installing. If your setup relies on `AGENTS.md` instead of skills, point it at the skill:

```markdown
# AGENTS.md
For any UI, CSS, chart or interface review work, read and follow
.agents/skills/skill-pure-design-ui/SKILL.md before acting.
```

### Google Gemini CLI

Gemini CLI has a native skills system. Install from the repository:

```bash
gemini skills install https://github.com/madsondeluna/skill-pure-design-ui.git --path skills/skill-pure-design-ui
```

or from a local clone, user-wide or for one workspace:

```bash
gemini skills install /tmp/pure-skill/skills/skill-pure-design-ui
gemini skills install /tmp/pure-skill/skills/skill-pure-design-ui --scope workspace
```

User skills live in `~/.gemini/skills/` (alias `~/.agents/skills/`); workspace skills in `.gemini/skills/` (alias `.agents/skills/`). Copying the folder there by hand also works. Verify with `/skills list`. Gemini asks permission before activating a skill the first time it matches.

### Cursor, Windsurf, GitHub Copilot, Kiro, Amp and other agents

Any agent that follows the Agent Skills standard reads the same folder. The Skills CLI installs it into every agent it detects on the machine:

```bash
npx skills add madsondeluna/skill-pure-design-ui
```

For an agent that reads `.agents/skills/` (the shared alias used by Codex, Gemini CLI and several editors), the Codex instructions above apply as they are. For an agent with no skill support, add one line to its instruction file (`.cursorrules`, `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`) telling it to read `SKILL.md` before any interface work.

### Claude API

Upload the zip through the `/v1/skills` endpoint and reference it in `container.skills` of a Messages request. Skills in the API require the Code Execution Tool beta. See the Skills API quickstart in the Anthropic documentation.

## Requirements

- Nothing for the instructions themselves.
- Python 3.9 or newer for the three scripts (standard library only).
- Node 18 or newer for `assets/pure-design/tools/check.mjs`.
- matplotlib or plotly only when theming charts.
- A Figma MCP connection when the input is a Figma file; a browser tool when the review needs the rendered page.

## Using it

The skill triggers on its own when a request mentions Pure Design, the tokens, glass, liquid, the four modes, or asks to build, review or polish a screen, check contrast, audit spacing, write interface copy, produce an anatomy or a handoff, or theme a chart. Some prompts to start with:

```
Build a landing page in Pure Design for AMPidentifier with a metrics panel and a bar chart, in all four modes.
Review this screen, run the whole routine.               (attach an HTML file or a Figma URL)
Where is motion missing on this page, and which recipe?
Theme this matplotlib figure in dark mode and export it for the paper.
Extract tokens from this Figma selection and list what has no token.
Make it feel more premium; it looks generic.
```

The review report groups findings by severity (break, risk, polish), one table per severity with location, before, after and why, then the coverage of what was inspected, the candidates considered and rejected, what was verified, and a verdict: Block, Needs changes or Approve.

## Scripts

```bash
cd skills/skill-pure-design-ui

python3 scripts/scaffold.py my-app --no-agent          # new project, without the agent layer
python3 scripts/audit_css.py my-app                     # literals, transition: all, layout transitions, focus, backdrop order
python3 scripts/audit_css.py my-app --list              # raw values with counts, for token mapping
python3 scripts/contrast.py --pairs                     # the semantic table in four modes
python3 scripts/contrast.py --fg "rgba(45,90,122,0.24)" --over "#EBEEF3" --text "#1A3A52"
node assets/pure-design/tools/check.mjs                 # the language's own verification
```

All of them exit 1 on failure so they can gate a build.

## Updating the language

The bundle mirrors pure-design-language at the version recorded in `assets/pure-design/tokens/tokens.json`. To move to a newer version, replace the mirrored folders (`tokens`, `web`, `python`, `templates`, `preview`, `tools`) and the README as `LANGUAGE.md`, keep the one-line change in `tools/check.mjs` that reads `LANGUAGE.md`, run the check, and update `language-version` in the frontmatter of `SKILL.md`.

## License

MIT. The bundled language files keep the license of pure-design-language; the polish chapter keeps the license of make-interfaces-feel-better, included as `assets/pure-design/LICENSE-make-interfaces-feel-better`.

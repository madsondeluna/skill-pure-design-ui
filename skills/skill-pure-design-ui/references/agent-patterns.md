# Agent patterns

The product layer above the twenty components of `agent.css`: what an AI
product needs around the model, organised by the job each pattern does. The
taxonomy and the pattern list come from the Halaska UI kit (ui.halaska.com, 38
patterns in five groups), translated into Pure Design.

Nothing here adds a class. Every pattern composes from `patterns.css` and
`agent.css`. A pattern that needs a class the files lack is a finding for the
language repository, not a local class with literals (rule 1).

## The five groups

| Group | Job | Existing components | New patterns below |
|---|---|---|---|
| Conversation core | the chat surface every product ships; craft, not coverage | 03 streaming text, 07 chat panel, 08 prompt bar, 17 code block | message branches, model and context, stop while streaming |
| Trust and transparency | why the user should believe the output | 02 reasoning trace, 03 sources, 09 recommendation, 10 context chunks | inline citations, confidence states, feedback capture |
| Agentic control | consent before acting, visibility while working, accountability after | 01 loading, 04 approval card, 05 tool calls, 06 task rows, 20 agent flow | plan preview, autonomy levels, permission scope, task queue, agent status, handoff, action receipt, checkpoints, audit log, error repair |
| Output and generative UI | responses that stop being text | 11 proposed edits, 12 records grid, 16 insight card, 18 inspector | artifact, diff view, structured data, comparison |
| Ambient and beyond chat | the agent outside the thread | 13 filtered list, 14 workspace nav, 15 command search, 19 selection actions | taskboard, inline assist, nudge, digest, notification center, agent setup |

Choose the group before the pattern. A request for "an approval flow" is
agentic control and needs the full lifecycle: plan preview before, agent status
during, action receipt after. Shipping only the approval card leaves the user
without the before and the after.

## Conversation core

| Pattern | Compose from | Radius | Colour | Craft |
|---|---|---|---|---|
| Message branches and hover actions | `.msg-agent`; actions as `.control-round` with `.tip`; branch pager in `.num` | actions and pager `--radius-control` | `--text`, `--muted` | actions appear on `:focus-within` as well as hover; the pager reads "Response 2 of 3" to a screen reader |
| Model and context | `.menu` and `.menu-item` with a `.tag` per capability; context window as `.meter` with a `.num` reading | menu `--radius-surface`, item `--radius-field`, meter `--radius-control` | meter `--accent`, then `--status-warning` at the threshold the product sets | `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; compaction is stated in words, never colour alone |
| Stop while streaming | `.composer` send button swapped to stop with `.motion-icon-swap` | `--radius-control` | `--text` | stop carries its own accessible name; Escape stops from inside the field |

## Trust and transparency

| Pattern | Compose from | Radius | Colour | Craft |
|---|---|---|---|---|
| Inline citations | numbered `.source` chips; each opens an anchored popover with a pager across sources | chip `--radius-control`, popover `--radius-surface` | `--text` | the chip is a `button`; the popover is non-modal, Escape closes it and focus returns to the chip |
| Confidence states | one claim at three levels: `.confidence` bars plus a qualifier in words | bars `--radius-mark` | filled bars `--text`, empty `--border`; never `--status-critical` for low confidence | the level is written ("Low confidence"). Low is a designed state: it shows the sources and offers a verify action instead of fading the claim |
| Feedback capture | two `.control-round` thumbs; negative opens a `fieldset` of `.check` reasons and an optional `.textarea`; the thanks swaps in with `.motion-text-swap` | thumbs `--radius-control`, field `--radius-field` | `--text` | `aria-pressed` on each thumb; one press records the vote, the follow-up is optional |

## Agentic control

| Pattern | Compose from | Radius | Colour | Craft |
|---|---|---|---|---|
| Plan preview | `card-glass lit` holding an `ol` of steps, each removable with `.control-round`; actions proceed, edit, take over as `.pill` | card `--radius-surface`, step `--radius-field` | `--text` | nothing runs until proceed; removing a step announces the new count |
| Autonomy levels | `.seg` with one stop per posture (the kit uses supervised, balanced, autonomous) and one line stating the current consequence | `--radius-control` | `--accent` on the selected stop only | `role="radiogroup"` with arrow keys; the consequence line is the one supporting text allowed here, because a wrong posture sends real actions |
| Permission scope | `.hairline-grid` rows: tool, access as `.tag` (read, write), limit as `.num` | grid `--radius-surface` | `--text`; access is not state, so no `--status-*` | the scope is summarised in a sentence above the grid; each limit edits in place |
| Task queue | `ol` of `.task-row` with `[data-dragging]` on the held row and a remove `.control-round` | `--radius-control` | `--status-*` by row state | reorder by keyboard (Alt plus arrow) as well as drag; the new position is announced |
| Agent status | `pill glass lit lit-swell` with `.loader-dots`, the phase label, elapsed `.loader-time`, a stop `.control-round`; redirect opens a `.composer` inline | `--radius-control` | `--text`; failure `--status-critical` with a glyph | `role="status"` on the pill; stop stays visible for the whole run; the phase label morphs with torph or `.motion-text-swap` (see `motion.md`) |
| Handoff | `.surface` with the summary, the new owner as `.avatar` and name, the prepared context as `.chunks` | `--radius-surface` | `--text`; never a status colour, a handoff is not a failure | the copy says who has it now and what they received |
| Action receipt | `.surface` row: what changed, under whose authority, when; undo as `.pill` with a countdown in `.num` | surface `--radius-surface`, undo `--radius-control` | `--status-good` mark | the countdown is text, not only a ring; when it expires the undo leaves and a line says so |
| Checkpoints | `.flow` column of named restore points; restore behind an inline confirm; re-verification runs as `.loader` | nodes as in `.flow` | `--status-*` for the verification result | restore needs the inline confirm; the result is stated after re-verification, not assumed |
| Audit log | `.grid-table` with `.filters`; a row expands its receipt through `[hidden]` | `--radius-surface` | `--status-*` per outcome | `caption` in `.sr-only`; timestamps in `.num`; the filter state lives in the URL |
| Error repair | `.surface` in three parts: what went wrong, the fix, the recourse (`.pill` retry, undo, report) | `--radius-surface` | `--status-serious` on the mark only; the text stays `--text` | the copy owns the mistake in one sentence; recourse is an action, never a link to documentation |

## Output and generative UI

| Pattern | Compose from | Radius | Colour | Craft |
|---|---|---|---|---|
| Artifact | `.surface` with a header (title, version pager in `.num`, `.seg` for preview and raw) and a body in `.media` or `.code` | surface `--radius-surface`, body `--radius-media` | `--text` | switching version keeps the scroll position; raw has a copy action |
| Diff view | two `.code` columns; each hunk header carries accept and reject as `.pill-sm`; lines marked like `tr[data-diff]` | `--radius-media` | added `--status-good`, removed `--status-critical`, each with a `+` or `-` glyph | below `--breakpoint-stack` the two columns become one unified diff; per-hunk actions are reachable by keyboard |
| Structured data | `.surface` with a `dl` of fields; `.seg` toggles card and JSON; JSON in `.code` | surface `--radius-surface`, code `--radius-media` | `--text` | both views show the same data; the JSON view has copy |
| Comparison | two `.stream` columns on the grid, each headed by its model as `.tag`; winner and tie as `.pill` | `--radius-surface` | model identity dot `--chart-1` and `--chart-2` in slot order | each column is its own polite live region; below the breakpoint the columns become `.tabs` |

## Ambient and beyond chat

| Pattern | Compose from | Radius | Colour | Craft |
|---|---|---|---|---|
| Taskboard | `.hairline-grid` lanes; cards `card-glass lit`; a card that needs a decision carries an `.ask` | lane `--radius-surface`, card `--radius-field` (concentric) | `--status-*` per card state | each lane is a list with its count; cards move by keyboard as well as drag |
| Inline assist | ghost text after the caret inside `.textarea`; `.key` hints for Tab and Escape | `--radius-field` | ghost text `--muted` | the suggestion is not in the value until accepted; availability is announced once, not on every keystroke |
| Nudge | `.motion-toast` or an inline `card-glass lit` with one action and "Not now" | `--radius-surface` | `--text` | never steals focus, never blocks; a dismissal is remembered |
| Digest | `.surface` listing what the agent did while the user was away, each item with its rationale and a link to its receipt | `--radius-surface` | `--status-*` per item | counts in `.num`; the period covered is stated |
| Notification center | `.drawer` with `.tabs` (all, unread); rows with `.status` severity and a read dot | drawer `--radius-surface`, row `--radius-field` | `--status-*` for severity | read state is weight plus dot plus `.sr-only` text, never colour alone; mark all read; overscroll contained |
| Agent setup | `.motion-pages` steps with `.form-actions`; live preview on `.axis-b` | `--radius-surface` | `--text` | "Step 2 of 4" in words; back keeps entered values; the preview stacks under the form below the breakpoint |

## Kit components already covered

| Halaska component | Pure Design |
|---|---|
| Orbs (lattice, ring) | `.loader-grid`, `.loader-orbit` |
| Thinking indicator, thinking steps | `.loader-dots`, `.trace` |
| Streaming text | `.stream` |
| Confidence bar | `.confidence` |
| Before and after toggle | `.seg` |
| Sparkline | `.viz` with `.viz-draw` |
| Alert banners, feedback and status | `.status` with label |
| Dialogs, drawer, tooltip, popover | `.modal`, `.drawer`, `.tip` |
| Empty state | `.empty` |

## What did not come across

| Kit behaviour | Why not |
|---|---|
| `cubic-bezier(0.34, 1.56, 0.64, 1)` on pops and badges | overshoot; a control settles rather than jumps |
| a global motion posture switch (spring, smooth, instant) | duration follows use; the one global switch is `prefers-reduced-motion` |
| any Google Font at runtime (`setKitFont`) | the faces are the language's: Archivo, Public Sans, Spline Sans Mono |
| title case in pattern names and buttons ("Approve Now") | sentence case everywhere (rule 4) |
| helper captions under every section heading | no caption under a heading; supporting text only where it prevents a wrong action |

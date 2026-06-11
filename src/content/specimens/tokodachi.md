---
no: "004"
name: "Tokodachi"
class: experiment
year: 2026
status: beta
repo: "slimex200-wq/tokodachi"
links: {}
autopsy: null
---

### What it is

Tokodachi is a pixel desktop pet (Electron) that grows as your AI agents burn tokens — it sits on your screen and reacts live to Claude Code and Codex activity.

### The experiment

Agent sessions run for minutes with nothing to watch, so I gave the wait a face. Hooks auto-install into Claude and Codex on first run, and the pet animates through thinking, typing, and done states. Growth is driven purely by cumulative tokens (juvenile at 10M, adult at 150M, peak at 1B) across five visual tiers from B to SSS, with collectible PNG cards, a 7-day usage graph, and a mini mode where the pet walks off to hide at the screen edge. All sprites come from sprite-gen, a custom pipeline on Gemini 2.5 Flash Image.

### Findings

v1.0.0 is released as a GitHub Release installer, with 105/105 tests green. Next: clean-install verification and distribution, itch.io first.

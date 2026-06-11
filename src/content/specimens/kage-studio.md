---
no: "006"
name: "Kage Studio"
class: creator tool
year: 2026
status: beta
repo: "slimex200-wq/kage-studio"
links: {}
autopsy: null
---

### What it is

A Tauri 2 desktop studio for producing an original song series on Suno: a Claude chat panel on the left, an infinite card canvas on the right. Structured blocks in Claude's replies (song, styles, lyrics, image and video prompts) become draggable cards that group into per-song sections.

### The experiment

Chat is a bad home for production assets — they scroll away. So I made the model's output spatial: a strict YAML block format parsed in Rust, persona presets injected via the Claude CLI, vision input, and section-level export to the clipboard. For subtitles, I paired whisper.cpp (large-v3-turbo) with Levenshtein matching to verify SRT accuracy against known lyrics.

### Findings

Nearly complete and in daily use. The block-to-card contract holds as long as the system prompt enforces the output format.

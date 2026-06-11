---
no: "010"
name: "FlatSnap"
class: experiment
year: 2026
status: beta
repo: "slimex200-wq/flatsnap"
links: {}
autopsy: null
---

### What it is

FlatSnap is an AI profile photo service — FastAPI server, Flutter app, Gemini 2.5 Flash for generation — built around fixed style presets (cinematic, editorial, business, ID photo) instead of free-form prompts.

### The experiment

Can an image model hold a consistent, repeatable style across different faces? I ran structured comparison rounds over poses, outfits, and lighting — five pose candidates, three rounds of outfit variants, then final outfit-by-lighting combinations — and selected style profile D through blind testing.

### Findings

Style consistency is won in prompt rules, not model choice. The rules that accumulated: never mention wind, state colors explicitly, avoid naming specific garments, keep pose wording loose, watch low angles. Shared prompt blocks for face identity preservation (no beautification) and lighting did more for consistency than any single preset.

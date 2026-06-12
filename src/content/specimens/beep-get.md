---
no: "007"
name: "beep-get"
class: consumer app
year: 2026
status: beta
repo: "slimex200-wq/beep-get"
links: {}
shots:
  - "/specimens/beep-get/today.png"
  - "/specimens/beep-get/send.png"
autopsy: null
---

### What it is

A widget-first pager app for close friends (Expo / React Native, Supabase). Two send types: Beep, a code-only signal, and Blink, a code plus a 2-second video. Four tabs — Today, Send, Friends, My — with a purple primary and a liquid-glass floating tab bar.

### The experiment

Most personalization systems entangle theming with skins. I split them: the app chrome is a fixed system light/dark theme, while identity packs (Classic Paper, Night Signal, and others) are coordinated widget-skin bundles that never touch the chrome. Widget grammar is size-bound by rule — Beep renders only in the small widget, Blink only in the medium list widget.

### Findings

The design source of truth (DESIGN.md) is established and enforced in code via a single palette hook. iOS verification is constrained without macOS, so the project is paused at the native-rebuild step.

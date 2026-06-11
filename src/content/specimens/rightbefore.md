---
no: "005"
name: "RightBefore"
class: desktop tool
year: 2026
status: live
repo: "slimex200-wq/rightbefore-releases"
links: {}
autopsy: null
---

### What it is

A Tauri desktop app distributed through its own public release channel. The source repo is private; binaries and the updater feed live in a separate `rightbefore-releases` repo, and the app checks `latest.json` from the latest GitHub release to update itself.

### The experiment

I wanted a desktop app I could ship continuously without a store in the loop. The approach: signed updater artifacts plus a static `latest.json` feed on GitHub Releases, so every release is immediately live for existing installs.

### Findings

The pipeline works at real cadence — four releases (v0.1.2 through v0.1.5) shipped within three days in June 2026, each with signed updater artifacts. Once the feed was wired up, shipping a fix became a tag push rather than a packaging project.

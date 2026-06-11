---
no: "011"
name: "diffwatch"
class: dev tool
year: 2026
status: archived
repo: "slimex200-wq/diffwatch"
links: {}
autopsy:
  died: "2026-05"
  cause: "scope creep, weak retention loop"
  organs: "diff engine → srt-saas"
---

### What it is

diffwatch was a competitive-intelligence SaaS: monitor competitor websites for pricing, feature, and content changes. Next.js, working diff engine, real UI. Frozen in May 2026. This is the postmortem.

### The experiment

Whether a solo-built change monitor could earn its first paying user in a category owned by free tools like Visualping and Google Alerts.

### Findings

An outside adversarial review overturned my framing three times. The "discover" feature I thought was a moat failed on a 12-company sample — and competitors already marketed it as table stakes. My SPA-blocker hypothesis was wrong: plain cheerio fetches captured Stripe, Linear, and Notion pricing pages fine, so the browser integration solved a problem that didn't exist. I had zero distribution and never dogfooded it myself, so "launch" was a fake milestone — the real one was first payment intent. Scope grew while the retention loop stayed weak. I froze it. The diff engine was reused in srt-saas; the lesson was reused everywhere.

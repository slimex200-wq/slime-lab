---
no: "014"
name: "ai-threads"
class: creator tool
year: 2026
status: beta
repo: "slimex200-wq/ai-threads"
links: {}
autopsy: null
---

### What it is

A pipeline that collects AI and dev news, ranks candidates, and drafts Korean-language Threads posts — main post, replies, and a media plan — ready for review and publishing. It's the result of consolidating my earlier Threads tooling into one project.

### The experiment

Could automated digests read like a builder wrote them? I added grounding by injecting excerpts of the source article into the prompt to suppress unsupported claims, a tiered Hot/Warm/Cold/Cache collection strategy to avoid re-crawling 30 days of sources on every run, and ranking that favors fresh releases and practical changes. Drafts generate locally only — never in CI — and publish through a Notion approval step.

### Findings

Every generation, QA, and posting result accumulates as JSONL with SFT export, so the pipeline doubles as a training-data flywheel.

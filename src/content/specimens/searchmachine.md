---
no: "013"
name: "searchmachine"
class: dev tool
year: 2026
status: archived
repo: "slimex200-wq/searchmachine"
links: {}
autopsy:
  died: "2026-04"
  cause: "economics — unit cost never closed"
  organs: "crawl heuristics → insane-search"
---

### What it is

A crawler and normalization pipeline for aggregating Korean e-commerce sale events. It pulled official sale pages from four commerce sites (29CM, W Concept, SSG, Musinsa), discovered mentions via Naver and Google News, and collected community posts from Ppomppu and Clien.

### The experiment

Could sale discovery be automated end to end? I built a five-stage pipeline — scrape, normalize, classify, group, upload — with a score-and-tier classifier and an event-grouping engine that merged related sale pages into one event. Community data was deliberately never auto-promoted to sales without review.

### Findings

The pipeline worked; the business didn't. Unit economics never closed, and I shut the project down in April 2026 after about a month of building. The crawl heuristics survived — they were reused in insane-search, a later search plugin.

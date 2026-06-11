---
no: "011"
name: "insane-search"
class: dev tool
year: 2026
status: live
repo: null
links: {}
autopsy: null
---

### What it is

insane-search is a Claude Code plugin that gets research sessions past sites that block automated fetching. No API keys, no config — install and search.

### The experiment

Instead of one heavy scraping tool, I built a 4-phase adaptive scheduler that escalates only when needed: a special-endpoint index (Twitter syndication, Reddit JSON, HN Algolia) → parallel light fetches (WebFetch, Jina Reader, curl UA variants) → curl_cffi TLS impersonation with identity spoofing (cookie warming, referer chains, locale headers) → full Playwright that intercepts network logs to discover hidden APIs. Recipes are pre-tuned for Korean sources: Naver, Twitter, and community sites like Theqoo.

### Findings

Cheapest method first wins most fights. The identity-spoofing layer cracked sites TLS impersonation alone couldn't, and for SPAs, finding the hidden API beats scraping the rendered DOM.

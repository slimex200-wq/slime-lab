---
no: "003"
name: "SRT SaaS"
class: creator tool
year: 2026
status: live
repo: "slimex200-wq/srt-saas"
links:
  site: "https://srt-saas.slimex200.workers.dev"
shots:
  - "/specimens/srt-saas/workspace.png"
autopsy: null
---

### What it is

Kapcha is a subtitle pipeline SaaS — a caption workspace for upload, transcription, translation, notes, and SRT exports — built with Next.js on Cloudflare Workers.

### The experiment

V1 grew two frontends (a legacy Vite app alongside Next.js), which meant two route trees and two visual systems. V2 consolidated everything into a single next-app: one route tree, one API boundary. Production runs Next API routes on Cloudflare Workers with Neon Postgres, R2 storage, and Modal-backed transcription; local tests run against PGlite with mocked storage.

### Findings

V2 is merged and the stack is production-ready; deploys are a deliberate manual `npm run deploy`. Commercial launch is currently gated on payment-provider review (Paddle KYC), not on engineering.

---
no: "008"
name: "Orido"
class: consumer app
year: 2026
status: beta
repo: "slimex200-wq/orido"
links: {}
autopsy: null
---

### What it is

A mobile photo editor (Expo / React Native) that cuts objects out of photos and composites them on a canvas, moving from prototype to production. Renamed from Picachu to Orido after a trademark and domain clearance pass.

### The experiment

I built the money path first. M0 stood up a production Supabase backend: five tables under row-level security, an append-only credits ledger, and server-authoritative RPCs — new users get 20 free credits once, and generation requests debit credits idempotently inside a transaction. Clients can read the ledger but never write it; a direct insert attempt is blocked by RLS.

### Findings

M0 and the live Supabase wiring are done and verified against the real project. On-device background removal compiles on iOS; the Gemini-based variant function is written but not yet deployed.

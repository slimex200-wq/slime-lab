---
no: "009"
name: "Receipt Anything"
class: consumer app
year: 2026
status: frozen
repo: "slimex200-wq/receipt-anything"
links: {}
autopsy: null
---

### What it is

Receipt Anything is a consumer mobile app: photograph any receipt, get structured expense data back, and receive a monthly Excel report. Expo (React Native) on iOS and Android, with Supabase Edge Functions handling OCR, spreadsheet generation, and scheduled reports.

### The experiment

Could I take a B2C subscription app from plan to store-ready scaffold solo? I shipped v0.1.0-mvp-scaffold with three tiers (Free/Pro/Max at ₩0/₩4,900/₩9,900, with 10/30/80 receipts per month), five expense categories, reports aligned to each user's billing anchor day, and a two-pass security and code review before tagging the release.

### Findings

The code was the fast part. Seven launch blockers remain, and every one is external: store product registration, IAP integration, Google RTDN and Apple server notification plumbing, cron secrets, OCR validation against a golden set, and store builds. Scaffolding an app and shipping one are different jobs.

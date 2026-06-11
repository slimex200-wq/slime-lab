---
no: "001"
name: "Weeple"
class: consumer app
year: 2025
status: live
repo: null
links: {}
autopsy: null
---

### What it is

Weeple is a mobile money app for individuals and couples, shipped in 2025 and live on the app stores. You log spending in plain language — one typed line becomes a structured entry — and on Android the app turns payment notifications into transaction candidates you confirm before saving.

### The experiment

Shared budgets usually mean handing over bank credentials. Weeple avoids that: notification capture with explicit user confirmation, receipt OCR, and natural-language entry instead. The backend is Supabase, with an 'analyze' Edge Function handling AI analysis — it only sees spending metadata like category, amount, and time. OTA updates let fixes ship without waiting on store review.

### Findings

Live in production with a free core and a paid AI-analysis tier. Couples mode offers three split models (fully shared, partial, income-proportional) while personal spending stays private.

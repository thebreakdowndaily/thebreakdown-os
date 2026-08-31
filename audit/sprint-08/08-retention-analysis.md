# Comprehensive Audience Retention & Cohort Analysis

Status: Completed
Date: 31 Aug 2026
Governance: AGENTS.md v1.0 — Platform Beta / Understanding Metrics

---

## 1. Measured Retention Infrastructure (Locally Verified)

The Breakdown utilizes client-side, zero-PII retention mechanics:
- **`tb_reading_history`**: Tracks up to 20 recently viewed stories in localStorage with timestamps.
- **`RecentlyRead.tsx`**: Renders horizontal list of past reading history to facilitate lateral exploration.
- **`NarrativeMemory.tsx`**: Triggers `reader_returned` telemetry when a reader visits across multiple browser sessions.
- **`tb_newsletter_cta_dismissed`**: 7-day cooldown on dismissed newsletter cards to avoid reader annoyance.

---

## 2. Inferred Behavioral Loops

```
[Search Landing on Long-tail Regulatory Query]
                     │
                     ▼
          [Direct Answer / Key Numbers]
                     │
                     ▼
          [EvidenceTrail Inspection]
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 [Live Policy Tracker]   [RecentlyRead History]
        │                         │
        └────────────┬────────────┘
                     ▼
       [The Breakdown Brief Subscription]
                     ▼
       [Weekly Email Policy Update]
                     ▼
       [Return Visit on Statutory Change]
```

---

## 3. Data Gaps & Insufficient Data

- **D7 & D30 Retention Curves**: `INSUFFICIENT DATA — Production GA4 stream pending.`
- **Email Open / Click-Through Rates**: `INSUFFICIENT DATA — Production Beehiiv delivery provider key pending.`

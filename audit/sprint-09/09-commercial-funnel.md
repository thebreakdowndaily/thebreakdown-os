# The Breakdown Commercial Funnel & Conversion Architecture

Status: Completed & Mapped
Date: 01 Sep 2026
Governance: AGENTS.md v1.0 — Platform Beta / Monetization Rules

---

## 1. The Full Commercial Funnel

```
[1. Search / Discovery Visitor]
             │  (Arrives via long-tail regulatory query or tracker search)
             ▼
[2. Direct Answer Reader]
             │  (Consumes StoryOrientation box and Key Takeaways)
             ▼
[3. Deep Knowledge Explorer]
             │  (Interacts with TimeSeriesChart, expands EvidenceTrail, previews primary documents)
             ▼
[4. Returning Reader (tb_reading_history)]
             │  (Returns across multiple browser sessions; welcomed via NarrativeMemory)
             ▼
[5. Contextual Newsletter Subscriber]
             │  (Subscribes to topic/tracker-specific weekly briefing)
             ▼
[6. High-Intent Commercial Lead]
             │  (Inspects CSV downloads, citation tools, or /membership tiers)
             ▼
      ┌──────┴────────────────────────┐
      ▼                               ▼
[7A. Supporting Reader]      [7B. Institutional B2B]
   (₹499 / month)               (₹4,999 / month)
      │                               │
      ▼                               ▼
[8A. Retention & Word-of-Mouth] [8B. Multi-Year Contract / API Access]
```

---

## 2. Bottleneck Analysis

- **Current Primary Bottleneck**: **Stage 4 $\to$ Stage 5 (Reader to Newsletter Conversion)**.
  - While reading engagement on long-form explainers and live trackers is exceptionally high, capturing the reader's email before they exit remains the critical growth lever.
  - Solution: Replaced generic footer forms with context-specific briefings (`StoryNewsletterCTA.tsx`) directly after the short-version orientation and at tracker footers.

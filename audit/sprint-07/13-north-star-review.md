# North Star Metric Review: The Qualified Returning Reader

Status: Revalidated & Maintained
Date: 31 Aug 2026
Governance: AGENTS.md v1.0 — Platform Beta / Understanding Metrics

---

## 1. Why Pageviews and Clicks Are Deprecated

Pageviews incentivize clickbait headlines, content fragmentation, and artificial page splits. They provide zero indication of reader comprehension, trust, or long-term retention.

---

## 2. The Qualified Reader Journey

The canonical North Star metric for The Breakdown remains:

$$\textbf{Qualified Returning Reader} = \text{A reader who completes a story} \longrightarrow \text{inspects evidence/documents} \longrightarrow \text{returns within 30 days}$$

```
[Search Visitor]
       ↓
[Direct Answer / Story Read]
       ↓ (Engaged Read)
[Evidence / Document / Tracker Interaction]
       ↓ (Deep Understanding)
[Newsletter Subscription OR Bookmarking]
       ↓ (Compounding Trust)
[Return Visit on Policy Update]
```

---

## 3. Telemetry Alignment
- `story_completed` (Scroll depth >= 75%)
- `evidence_expanded` / `chart_interacted` / `document_preview_opened`
- `reader_returned` (Fired when `tb_reading_history` records multi-session visits)
- `newsletter_submitted` (Double opt-in initiated)

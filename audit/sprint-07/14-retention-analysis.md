# Audience Retention & Loop Analysis

Status: Completed
Date: 31 Aug 2026

---

## 1. Retention Mechanics Deployed

The platform combines five non-intrusive client-side retention mechanisms:
1. **`RecentlyRead.tsx`**: Local storage history (`tb_reading_history`) displaying recent stories across sessions without cookies or server tracking.
2. **`StoryNewsletterCTA.tsx`**: Topic-tailored weekly briefings mounted at the end of deep reading mode.
3. **`EvidenceTrail.tsx` $\to$ Living Trackers**: Direct links from static investigations into dynamic policy trackers.
4. **`GenericTracker.tsx` $\to$ Document Preview**: Interactive primary source modal keeping users engaged on-platform.
5. **`NarrativeMemory.tsx`**: Automatic welcome-back callout banner when returning to the platform.

---

## 2. Quantitative Retention Loops

```
[Search Entry (MGNREGA / UPI / PMFBY / Semiconductor)]
                     │
                     ▼
          [Direct Answer Reading]
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
       [Weekly Email Notification]
                     ▼
       [Return Visit to Track Changes]
```

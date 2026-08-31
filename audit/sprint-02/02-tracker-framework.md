# Reusable Tracker Architecture & Contract

Status: Shipped & Active
Date: 31 Aug 2026

---

## 1. Architectural Model

The tracker framework refactors the initial MGNREGA implementation into a canonical, multi-tracker engine:

```
lib/trackers/
├── types.ts                   # Canonical interfaces & data contracts
├── registry.ts                # Tracker registry & resolver utilities
├── mgnrega-tracker.ts         # MGNREGA → VB-G RAM G Act 2025 Tracker
└── semiconductor-tracker.ts   # India Semiconductor Mission (ISM) & PLI Tracker

components/trackers/
├── GenericTracker.tsx         # Reusable presentation component
└── MgnregaTracker.tsx         # Backward-compatible wrapper

app/trackers/
├── page.tsx                   # Trackers directory hub (/trackers)
├── mgnrega/page.tsx           # Route for /trackers/mgnrega
└── semiconductor/page.tsx     # Route for /trackers/semiconductor
```

---

## 2. Canonical Data Contract (`TrackerDefinition`)

```typescript
export interface TrackerDefinition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  topic: string;
  topicSlug: string;
  currentStatus: string;
  lastUpdated: string;
  lastVerifiedBy: string;
  keyDataPoints: TrackerDataPoint[];
  recentChanges: TrackerChange[];
  timeline: TrackerTimelineEvent[];
  evidenceChain: TrackerEvidenceChain[];
  documents: TrackerDocument[];
  relatedStorySlugs: string[];
  relatedEntityIds: string[];
}
```

---

## 3. Active Trackers in Registry

1. **MGNREGA → VB-G RAM G Act 2025** (`/trackers/mgnrega`)
   - Topic: Economy & Welfare (`/topic/economy`)
   - Highlights: 20-year retrospective + legislative repeal of MGNREGA 2005 replaced by 125-day statutory guarantee under Act No. 18 of 2025.
2. **India Semiconductor Mission (ISM) & PLI** (`/trackers/semiconductor`)
   - Topic: Technology & Industrial Policy (`/topic/technology`)
   - Highlights: ₹76,000 Cr government program outlay, ₹1.26 lakh Cr approved project commitments, commercial OSAT debut in Sanand, and Dholera Fab construction tracking.

# Evidence Visibility Specification — Reader-Facing Provenance Architecture

Status: Shipped & Active
Date: 31 Aug 2026
Governance: AGENTS.md v1.0 — Platform Beta / Evidence Spine Doctrine

---

## 1. Objective & Product Principle

The Breakdown's structured evidence architecture (Claims → Sources → Evidence → Documents → Verification) is the platform's core competitive differentiator against traditional news and shallow explainers.

Prior to Sprint 2, evidence evaluation was partially hidden in backend registries or relegated to long research appendices. Sprint 2 surfaces the evidence chain directly at the point of reading through progressive disclosure:

```
Article Reading Context
  ↓
[Why We Say This — Evidence Provenance Trail]
  ├── What We Assert (Claim statement + canonical status)
  ├── Why We Know It (Empirical data & methodology)
  ├── Who Reported It (Verified sources & publisher tiers)
  ├── Primary Official Document (Direct links to acts, gazette notifications, audits)
  └── Verification Record (Last verified date & auditor)
```

---

## 2. Component Design & Progressive Disclosure

### `EvidenceTrail` (`components/evidence/EvidenceTrail.tsx`)
- **Location**: Mounted above the main narrative in `StoryShell` immediately following `StoryOrientation`.
- **Default (Collapsed) State**:
  - Compact summary pill: Verified claims count, total cited primary sources, evidence density score (e.g. 95/100).
  - Primary core assertion preview.
  - Interactive "Inspect Evidence Trail" toggle with accessible aria bindings.
  - Contextual link to live policy tracker if one exists for the topic/story.
- **Expanded State**:
  - Step-by-step breakdown of each claim in canonical order.
  - Canonical status badges: `Supported`, `Verified`, `Mixed`, `Misleading`, `Not Supported`, `Uncertain`.
  - Direct outbound links to primary sources and official government documents.

---

## 3. Topic Page Evidence Integration

### Flagship Policy Trackers & Topic Hubs (`app/topic/[slug]/page.tsx`)
- Detects whether active trackers exist for the topic via `getTrackersForTopic(topicSlug)`.
- Renders a prominent "Flagship Policy Trackers" card grid above standard story groups.
- Connects high-level topic taxonomy (`/topic/economy`, `/topic/technology`) to living issue trackers (`/trackers/mgnrega`, `/trackers/semiconductor`).

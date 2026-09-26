# THE BREAKDOWN — INFORMATION ARCHITECTURE REMEDIATION SPECIFICATION

**Version:** 1.0  
**Status:** Implemented & Verified  
**Governing Standard:** AGENTS.md · Editorial Constitution Article IX

---

## 1. Canonical Taxonomy & Route Hierarchy

Prior to remediation, The Breakdown suffered from multiple fragmented content routes (`/stories`, `/series`, `/fix`, `/problems`, `/up403`, `/topics`, `/library`, `/public portal`), leaving readers disoriented.

The canonical public taxonomy has been established with unified relationships:

```
THE BREAKDOWN PUBLIC IA
├── [ / ] Homepage (The Front Page)
│     ├── Featured Lead Story
│     ├── Trust Bar (Verification Metrics)
│     ├── Latest Briefings (Short Version Grid)
│     ├── Deep Dives (Investigations & Explainers)
│     ├── Explore Topics (Primary Domain Entries)
│     ├── Editorial Methodology & Trust
│     └── The Brief (Newsletter Capture)
│
├── [ /stories ] Stories Archive
│     ├── All Publicly Published Stories
│     ├── Category Filter Tabs (Economy, Policy, Tech, Geopolitics, Health, Environment)
│     ├── Search & Tag Filtering
│     └── Story Cards (Image, Headline, Standfirst, Date, Read Time, Evidence Rating)
│
├── [ /story/:slug ] Canonical Story Reader
│     ├── Breadcrumb (Home > Category > Headline)
│     ├── Story Header (Topic Pill, Story Type, Headline, Standfirst, Byline, Published Date)
│     ├── Hero Media (Aspect-ratio image, credit, caption)
│     ├── Reading Mode Switcher (Quick Brief | Standard | Deep Research)
│     ├── Short Version Box (Core Finding, Key Takeaways, Numbers)
│     ├── Editorial Action Bar (Save, Cite, Share)
│     ├── Main Narrative Chapters:
│     │     ├── What Happened (Prose)
│     │     ├── Why It Matters (Prose + Empirical Facts)
│     │     ├── What Changed (Prose on Statutory/Structural Shifts)
│     │     ├── What the Evidence Shows (Prose + Inline Claims + Data Charts)
│     │     └── What to Watch & Key Uncertainty (Prose on Contested/Pending Shifts)
│     ├── Chronology & Timeline (Single instance)
│     ├── Research Appendix (Unblocked Public Access to Claims, Sources, Methodology)
│     └── Continue Exploring (Next Read recommendations)
│
├── [ /topics ] Topic Directory
│     ├── 15 Policy/Domain Hubs
│     ├── Story & Entity Counts
│     └── Latest Stories Previews
│
├── [ /topic/:slug ] Topic Hub
│     ├── Domain Title, Overview, Scope
│     ├── In Focus / Lead Story
│     ├── Latest Topic Stories
│     └── Tracked Institutional Entities
│
├── [ /investigations ] Investigations Hub
│     └── Deep-dive multi-chapter investigations (e.g. Namami Gange, UPSC EWS)
│
├── [ /fix ] The Fix Hub
│     └── Systemic policy solutions and institutional reform models
│
├── [ /series ] Knowledge Series / Flagship Library
│     └── Long-form historic volumes (e.g. Foundations: 1947–1962)
│
├── [ /data ] Data & Evidence Index
│     └── Quantitative trackers, time-series, and primary document registries
│
└── [ /about ] About The Institution
      ├── Editorial Constitution & Governance Doctrine
      └── Independence, Sourcing Standards & Neutrality Principles
```

---

## 2. Canonical Content Model Contracts

Every public story conforms to a single canonical schema:

| Field | Type | Description |
|---|---|---|
| `slug` | `string` | Canonical URL slug (`/story/:slug`) |
| `headline` | `string` | Clear, informative headline (no clickbait) |
| `summary` | `string` | Comprehensive standfirst / dek |
| `category` | `string` | Primary coverage domain (economy, policy, geopolitics, etc.) |
| `storyType` | `enum` | `'standard' \| 'explainer' \| 'investigation' \| 'briefing'` |
| `publicationStatus`| `enum` | `'published'` (only value eligible for public rendering) |
| `publishedAt` | `ISO string`| Original publication timestamp |
| `updatedAt` | `ISO string`| Latest factual update timestamp |
| `heroImage` | `string` | Validated path to public visual asset |
| `readingTime` | `number` | Estimated reading duration in minutes |
| `evidenceScore` | `number` | Derived rating (0–100) based on verified claims and tier-1 sources |
| `blocks` | `StoryBlock[]`| Authored chapters, narrative text, charts, and key numbers |
| `claims` | `Claim[]` | Structured claims with verification status, confidence, and source links |
| `sources` | `Source[]` | Primary and institutional sources with URLs and tier weights |
| `timeline` | `TimelineEvent[]`| Chronological milestones |
| `faq` | `FAQItem[]` | Common reader questions with substantiated answers |

---

## 3. Structural Duplication Remediation

| Area | Previous State (Defective) | Remediated State |
|---|---|---|
| **Executive Summary** | Rendered in `StoryOrientation` and repeated verbatim as `chapter-0` in main article body. | Executive summary assigned to `region: 'header'`, rendered once in `StoryOrientation`. |
| **Evidence & Claims** | Rendered in narrative, repeated in `EvidenceTrail`, repeated in `uncertainty` section, repeated in `StoryResearchAppendix`. | Claims integrated inline in Chapter 4 ("What the Evidence Shows") and detailed in `StoryResearchAppendix`. Redundant mini-uncertainty box removed. |
| **Timeline** | Rendered inside article body and then repeated below as a standalone section. | Timeline rendered exactly once in dedicated chronology block. |
| **Sources** | Dumped as raw list in body and repeated in appendix. | Unified in Research & Evidence Appendix with direct links and tier indicators. |
| **Headers** | `EditorialLayout` rendered a second sticky header below main `<Navigation />`. | `EditorialLayout` removed from public pages; single unified sticky header. |

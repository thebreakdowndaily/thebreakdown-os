# The Breakdown — Information Architecture Specification

---

## 1. Primary Navigation Architecture

The site navigation has been restructured from generic content types into clear editorial knowledge entry points:

```
[ THE BREAKDOWN ]
   ├── Library        (/series)          → Canonical Knowledge Library, Volumes & Chapters
   ├── Investigations (/investigations)  → Evidence-driven in-depth journalism
   ├── Explainers     (/fix)             → Structural mechanisms & problem-solution models
   ├── Topics         (/topics)          → Living topic dossiers & subject domains
   ├── Data           (/data)            → Interactive datasets & evidence repositories
   └── The Brief      (/newsletter)      → Weekly intelligence briefing & newsletter
```

---

## 2. Reader Journey & Progressive Disclosure

```
[ DISCOVERY: Homepage / Search / The Brief ]
     │
     ▼
[ WHAT HAPPENED: Headline + Concise Briefing ]
     │
     ▼
[ WHY IT MATTERS: Context, Analysis & Dek ]
     │
     ▼
[ WHAT DO WE KNOW: Verified Claims & Primary Findings ]
     │
     ▼
[ HOW DO WE KNOW: Evidence Trail, Source Lens & Document Extracts ]
     │
     ▼
[ WHAT REMAINS UNCERTAIN: Scholarly Disagreement & Data Limits ]
     │
     ▼
[ DEEPER INVESTIGATION: Entity Dossiers, Timelines, Full Volumes ]
```

---

## 3. Route Mapping Table

| Route | Environment | Primary Intent | Key Knowledge Objects |
|-------|-------------|----------------|----------------------|
| `/` | Dark Discovery | Orientation & Curated Intelligence | Lead Story, The Brief, Library Features, Topics |
| `/series` | Dark Discovery | Institutional Archive & Volumes | Volumes, Chapters, Reading Progress |
| `/series/.../chapter/[slug]` | Warm Reading | Sustained Reading & Immersion | Claims, Evidence Blocks, Timelines, Thinkers |
| `/investigations` | Dark Discovery | Serious Investigative Catalog | Investigations, Methodologies |
| `/investigation/[slug]` | Warm Reading | Deep Forensic Narrative | Evidence Trails, Primary Documents, Claims |
| `/fix` | Warm Reading | Systems & Solution Frameworks | Problem-Fix Objects, Decision Trees |
| `/topics` | Dark Discovery | Comprehensive Domain Directory | 6+ Topical Dossiers, Sub-topics |
| `/topic/[slug]` | Dark Discovery | Living Topic Dossier | Connected Stories, Entities, Datasets |
| `/data` | Deep Research | Quantitative & Empirical Evidence | Datasets, Time Series, Methodology |
| `/trust` | Deep Research | Institutional Accountability | Live Audit Metrics, Correction Log |
| `/about` | Dark Discovery | Institutional Declaration | Mission, Constitution, Editorial Policy |
| `/newsletter` | Warm Reading | Direct Engagement | The Brief Archives, Subscription Engine |

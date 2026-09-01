# Living Policy Tracker & Chart Design Specification

Status: Living Specification
Date: 01 Sep 2026

---

## 1. Information Architecture

Policy trackers are structured as **evolving institutional knowledge products**:

```
[1. Tracker Header & Regulatory Jurisdiction]
        │
        ▼
[2. Current Operational Status (Verified State Callout)]
        │
        ▼
[3. Key Metric Ledger (Restrained 3-Column Metrics)]
        │
        ▼
[4. Publication-Quality Time-Series Charts (SVG + Semantic Data Tables)]
        │
        ▼
[5. Material Changes & Chronological Milestone Feed]
        │
        ▼
[6. Primary Document Archive with In-App Clause Preview]
        │
        ▼
[7. Verified Scholarly Claims & Deep Explainers]
```

---

## 2. Publication-Quality Chart Standards

- **Zero Heavy Canvas Dependencies**: Pure responsive SVG lines and gradient fills with CSS transition states.
- **Accessible Table Fallback**: Every chart includes an accessible semantic HTML table view for screen reader users and keyboard navigation.
- **Contextual Annotation**: Interactive hover points display exact statutory numbers, dates, and official source attributions.

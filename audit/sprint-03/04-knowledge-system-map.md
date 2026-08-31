# Flagship Knowledge System Architecture Map — Rural Employment Guarantee

Status: Shipped & Active
Subject: MGNREGA 2005 → VB-G RAM G Act, 2025 (Act No. 18 of 2025)
Date: 31 Aug 2026

---

## 1. System Topology

The rural employment flagship connects 12 distinct knowledge layers across the platform into a unified graph:

```
                                 [Reader Entry Points]
                   (Search / Social / Topics / Direct Navigation)
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   CORNERSTONE ENTRY STORY       │
                         │    /story/mgnrega-reform        │
                         └────────────────┬────────────────┘
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
       ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
       │   EVIDENCE TRAIL    │ │   POLICY TRACKER    │ │   VOLUME CHAPTER    │
       │  (Why We Say This)  │ │  /trackers/mgnrega  │ │ /series/econ.../ch1 │
       └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          │
                                          ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │                     CANONICAL KNOWLEDGE OBJECTS                        │
     ├────────────────────────────────────────────────────────────────────────┤
     │ • Claims: Statutory repeal (Sec 36(1)), 125-day expansion, 55.3% women │
     │ • Evidence: Empirical MIS person-days, wage arrears data, CPI-AL rates │
     │ • Sources: MoRD Annual Report 2025-26, CAG Performance Audits, PIB    │
     │ • Documents: Act No. 18 of 2025, Notification S.O. 2415(E), Act No. 42│
     │ • Timeline: 2006 Enactment → 2020 COVID Surge → 2025 Act → 2026 Op.   │
     │ • Entities: Ministry of Rural Development (/entity/ministry-of-rural..)│
     │ • Topic: Economy & Welfare (/topic/economy)                            │
     └────────────────────────────────────┬───────────────────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   CONTEXTUAL NEWSLETTER CTA     │
                         │ "Get notified when rural wage   │
                         │  or statutory rules change"     │
                         └─────────────────────────────────┘
```

---

## 2. Navigational Traversal Paths

1. **Discovery $\to$ Evidence**:
   Reader lands on `/story/mgnrega-reform` $\to$ clicks `Inspect Evidence Trail` $\to$ inspects claim assertion and primary source citation $\to$ clicks `Live Tracker` $\to$ lands on `/trackers/mgnrega`.
2. **Tracker $\to$ Primary Documents**:
   Reader visits `/trackers/mgnrega` $\to$ views status and recent changes $\to$ scrolls to `Primary Official Documents` $\to$ accesses full text summary of Notification S.O. 2415(E).
3. **Topic $\to$ Knowledge System**:
   Reader explores `/topic/economy` $\to$ sees `Flagship Policy Trackers` card $\to$ clicks `/trackers/mgnrega` $\to$ navigates to associated stories and entities without hitting any dead ends.

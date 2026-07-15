# Phase 5 — Interaction Design

Every visual has exactly one primary interaction. No secondary interactions, no alternate paths.

**Governing documents:**
- VXS v1.0 — `docs/vxs/interaction-patterns.md`
- `architecture/narrative-placement.md` — beat sequence
- `architecture/story-map.md` — asset assignments

---

## Interaction Types by Category

| Category | Interaction | Chain |
|----------|-------------|-------|
| **Context** (photo) | Open high-resolution → Caption → Claims → Sources |
| **Orientation** (map) | Zoom → Toggle boundaries → Timeline → Claims |
| **Comparison** (chart) | Hover values → Methodology → Dataset → Sources |
| **Evidence** (document) | Open scan → Highlighted paragraphs → Claims supported → Return |
| **Timeline** | Scroll events → Event detail → Filter category → Claims |

---

## Beat 1 — Opening: SUP-01 (Context — refugee train)

**Interaction:** Open high-resolution

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader taps/clicks photo | Lightbox opens at full resolution (2864 × 1848 px) |
| 2 | — | Caption appears below: "Muslim refugees crowd the engine of a train departing Delhi for Pakistan, 1947. Daily Herald Archive / SSPL via Getty." |
| 3 | Reader taps "Claims" | Panel slides in showing claim partition-008: "10–15 million people were displaced during partition migrations" — with confidence score (5/5) and source excerpt |
| 4 | Reader taps source link | Source card for Khan (2007) opens: full citation, page reference, evidence level |
| — | Reader taps close | Returns to narrative position |

---

## Beat 2 — Chronology: D-03 (Timeline — 1945-1948)

**Interaction:** Scroll events

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader scrolls timeline | Events scale proportionally — compressed periods show dense event clusters |
| 2 | Reader taps an event | Event card expands: date, title, description, claim links, source |
| 3 | Reader taps "Filter" | Category toggles appear: Political, Diplomatic, Military, Humanitarian. Selected categories highlighted. Unselected events grey out. |
| 4 | Reader taps a claim link | Claim panel opens inline — statement, confidence, evidence excerpts, counterarguments |
| — | Reader taps close | Returns to timeline at same scroll position |

---

## Beat 3 — Religious Demography: B-06 (Orientation — map)

**Interaction:** Zoom

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader zooms in | Map transitions from full-India view to regional view (Punjab, Bengal, NWFP) — district boundaries appear at each zoom level |
| 2 | Reader taps "Toggle boundaries" | Overlay layers toggle: current India-Pakistan border (dashed), provincial boundaries (solid), partition boundary (dotted) |
| 3 | Reader taps "Timeline" | Mini-timeline appears below map showing key demographic events (1941 Census, 1947 migration) — linked to relevant map regions |
| 4 | Reader taps a region | Claim panel opens — partition-002: Muslim League electoral mandate, with source (Transfer of Power vol 6) |
| — | Reader taps close | Returns to narrative |

---

## Beat 4 — Cabinet Mission: B-02 (Orientation — map)

**Interaction:** Zoom

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader zooms in | Map highlights the three proposed groups (A, B, C) with colour zones — provincial names and capitals appear |
| 2 | Reader taps "Toggle boundaries" | Overlay toggles between: Cabinet Mission groups, pre-partition provinces, actual 1947 outcome. Difference between proposed and actual becomes visible. |
| 3 | Reader taps group | Tooltip shows provinces in group, majority community, and whether group was implemented |
| 4 | Reader taps "Claims" | Claim partition-002: acceptance timeline (Congress 24 May, League 6 June). Claim partition-003: Nehru press conference and collapse |
| — | Reader taps close | Returns to narrative |

---

## Beat 5 — Calcutta Killing: A-03 (Context — archival photo)

**Interaction:** Open high-resolution

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader taps photo | Lightbox opens — full-resolution scan of Bourke-White's original negative |
| 2 | — | Caption: "Aftermath of the Great Calcutta Killing, August 1946. Margaret Bourke-White / LIFE Picture Collection. Evidence level: B." |
| 3 | Reader taps "Claims" | Claim partition-004: "The Great Calcutta Killing broke the possibility of a negotiated settlement" — confidence 4/5, with counterargument (Tan & Kudaisya 2000: symptom, not cause) |
| 4 | Reader taps source link | Transfer of Power vol 8 source card: documents 89–95, page references |
| — | Reader taps close | Returns to narrative |

---

## Beat 6 — Mountbatten & Jinnah: A-01 (Context — archival photo)

**Interaction:** Open high-resolution

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader taps photo | Lightbox opens — full-resolution IWM scan (IND 5302) |
| 2 | — | Caption: "Mountbatten and Jinnah at Viceroy's House, New Delhi, 1947. Imperial War Museums. Evidence level: A." |
| 3 | Reader taps "Claims" | Claim partition-005 (Patel's pragmatism) and partition-006 (Mountbatten's accelerated timetable) — both with confidence scores |
| 4 | Reader taps source | Mountbatten papers source card: personal notes recording reasoning for acceleration |
| — | Reader taps close | Returns to narrative |

---

## Beat 7 — Radcliffe Line: B-03 (Orientation — map)

**Interaction:** Zoom

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader zooms in | Map transitions from Punjab/Bengal overview to tehsil-level detail — villages, rivers, railway lines labelled |
| 2 | Reader taps "Toggle boundaries" | Three overlays: Radcliffe Line (solid), religious demography (choropleth), partitioned infrastructure (icons: split irrigation, bisected railways). The gap between the border and the demography becomes visible. |
| 3 | Reader taps an infrastructure icon | Tooltip: "Kasur tehsil — irrigation canal severed. Western districts to Pakistan, water source in India." |
| 4 | Reader taps "Claims" | Claim partition-007: "Radcliffe Award produced hastily with inadequate data" — confidence 5/5, with counterargument (Hodson 1969: as fair as possible given constraints) |
| — | Reader taps close | Returns to narrative |

---

## Beat 8 — Migration: D-02 + D-01 (Comparison — sequential charts)

**Interaction:** Hover values

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader hovers over Sankey arrow (D-02) | Tooltip: origin district → destination, estimated volume, percentage of total flow |
| 2 | Reader taps "Methodology" | Panel: "Flow volumes calculated from 1951 Census of India and Pakistan. Unauthorised crossings not captured. Estimates marked with confidence range." |
| 3 | Reader taps "Dataset" | Full data table: flows by district pair, census years, margin of error |
| 4 | Reader taps a flow arrow | Claim partition-008 (10-15 million displaced) with source (1951 Census; Khan 2007) |
| — | Reader switches to D-01 (death toll) | Same interaction pattern: hover bar → methodology → dataset → claims |

---

## Beat 9 — Military Balance: D-05 (Comparison — waffle chart)

**Interaction:** Hover values

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader hovers over India segment | Tooltip: "India — ~66% of military assets. Army divisions, naval vessels, air force squadrons listed with counts." |
| 2 | Reader taps "Methodology" | Panel: "Division ratios from Auchinleck Partition Committee records. Civil service and treasury estimates from Transfer of Power vol 12." |
| 3 | Reader taps "Dataset" | Full data table: asset category, India count, Pakistan count, total, source |
| 4 | Reader taps a segment | Claim partition-010: institutional division established divergent trajectories — with source (Transfer of Power vol 12; Tan & Kudaisya 2000) |
| — | Reader taps close | Returns to narrative |

---

## Beat 10 — Instrument of Accession: A-06 (Evidence — document)

**Interaction:** Open scan

| Step | Action | Response |
|------|--------|----------|
| 1 | Reader taps document | Full-screen scan opens — single page, Maharaja's signature visible, date (26 Oct 1947) |
| 2 | Reader taps highlighted paragraphs | Three key clauses highlighted: (1) Accession limited to defence, foreign affairs, communications; (2) Internal autonomy reserved; (3) Conditional on military assistance. Each highlight reveals annotation explaining significance. |
| 3 | Reader taps "Claims supported" | Claim partition-011: "Kashmir conflict was direct consequence of partition framework" — confidence 5/5 |
| 4 | Reader taps source | NAI source card: National Archives of India, Ministry of States, accession documents. Evidence level: B. |
| — | Reader taps close | Returns to narrative |

---

## Interaction Summary

| Beat | Asset | Category | Primary interaction |
|------|-------|----------|-------------------|
| 1 | SUP-01 | Context | Open high-resolution → Caption → Claims → Sources |
| 2 | D-03 | Timeline | Scroll events → Event detail → Filter category → Claims |
| 3 | B-06 | Orientation | Zoom → Toggle boundaries → Timeline → Claims |
| 4 | B-02 | Orientation | Zoom → Toggle boundaries → Claims |
| 5 | A-03 | Context | Open high-resolution → Caption → Claims → Sources |
| 6 | A-01 | Context | Open high-resolution → Caption → Claims → Sources |
| 7 | B-03 | Orientation | Zoom → Toggle boundaries → Infrastructure overlays → Claims |
| 8 | D-02 + D-01 | Comparison | Hover values → Methodology → Dataset → Claims |
| 9 | D-05 | Comparison | Hover values → Methodology → Dataset → Claims |
| 10 | A-06 | Evidence | Open scan → Highlighted paragraphs → Claims supported → Sources |

**Rule:** Every interaction ends with a single "Return" action that restores the reader to their exact narrative position. No modal chains, no deep navigation without a way back.

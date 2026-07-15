# Phase 6 — Visual Templates

Every VXS category has exactly one rendering template. The template defines what the reader sees, in what order, and at what interaction state.

---

## Template: Context (Photo)

```
┌─────────────────────────────────────┐
│                                     │
│              IMAGE                  │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  CAPTION                            │
│  2-4 sentences. Analytical,         │
│  not descriptive. Answers:          │
│  "What is the historical            │
│   significance of this image?"      │
├─────────────────────────────────────┤
│  CREDIT                             │
│  Photographer / Archive             │
├─────────────────────────────────────┤
│  ARCHIVE  ›  EVIDENCE               │
│  Holding institution  │  Level A-E  │
├─────────────────────────────────────┤
│  LINKED CLAIMS                      │
│  • partition-004 (confidence 4/5)   │
│  • partition-008 (confidence 5/5)   │
├─────────────────────────────────────┤
│  [ EXPAND ]                         │
│  Open high-resolution in lightbox   │
└─────────────────────────────────────┘
```

**Applied to Chapter 1:**

| Beat | Asset | Caption summary | Credit | Archive | Evidence | Claims |
|------|-------|----------------|--------|---------|----------|--------|
| 1 | SUP-01 | Muslim refugees crowd the engine of a train departing Delhi for Pakistan, 1947. The train — symbol of imperial infrastructure — became the vessel of the largest forced migration in history. | Daily Herald Archive / SSPL via Getty | National Science & Media Museum | C (provisional) | partition-008 |
| 5 | A-03 | Aftermath of the Great Calcutta Killing, August 1946. Over three days of organised communal violence, an estimated 4,000 to 10,000 people were killed. The violence proved communal conflict could overwhelm civil administration. | Margaret Bourke-White / LIFE | Time Inc. Archive | B | partition-004 |
| 6 | A-01 | Mountbatten and Jinnah at Viceroy's House, New Delhi, 1947. Jinnah's formal posture against Mountbatten's informal lean — the asymmetry of the final partition negotiations. | Imperial War Museums | IWM Photograph Archive | A | partition-005, partition-006 |

**Interaction:** Tap image → lightbox at full resolution. Tap claim → claim panel. Tap source → source card.

---

## Template: Orientation (Map)

```
┌─────────────────────────────────────┐
│                                     │
│              MAP                    │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  LEGEND                             │
│  ■ Muslim majority                  │
│  ■ Hindu majority                   │
│  ■ Sikh majority                    │
│  ═ Radcliffe Line (disputed)        │
├─────────────────────────────────────┤
│  SOURCE                             │
│  Data source + GIS attribution      │
├─────────────────────────────────────┤
│  ⚠ DISPUTED BOUNDARY NOTICE         │
│  "Dashed lines indicate boundaries  │
│   whose legal or de facto status    │
│   is contested. Per Book of Record  │
│   #0003."                           │
├─────────────────────────────────────┤
│  RELATED CLAIMS                     │
│  • partition-007 (confidence 5/5)   │
├─────────────────────────────────────┤
│  [ OPEN FULL SCREEN ]               │
│  Zoom, pan, toggle layers           │
└─────────────────────────────────────┘
```

**Applied to Chapter 1:**

| Beat | Asset | Legend items | Source | Disputed? | Claims |
|------|-------|-------------|--------|-----------|--------|
| 3 | B-06 | Muslim-majority district, Hindu-majority district, Muslim-plurality district, Sikh-majority district | 1941 Census of India / British Library IOR | No | partition-002 (context) |
| 4 | B-02 | Group A (Hindu-majority), Group B (Muslim-majority NW), Group C (Muslim-majority Bengal), Centre (limited powers) | Cmd. 6821 / British Library | No | partition-002, partition-003 |
| 7 | B-03 | Pakistan territory, India territory, Radcliffe Line (disputed), Split village, Severed railway | IOR/L/P&J/10/117; Boundary Commission records | Yes | partition-007 |

**Interaction:** Zoom → toggle boundaries overlay → tap region for data → tap claim for source.

---

## Template: Evidence (Document)

```
┌─────────────────────────────────────┐
│  ┌───────────┐                      │
│  │           │                      │
│  │ THUMBNAIL │                      │
│  │           │      CONTEXT         │
│  └───────────┘  "Instrument of      │
│                 Accession of Jammu  │
│                 and Kashmir, signed │
│                 by Maharaja Hari    │
│                 Singh, 26 Oct 1947" │
│                                     │
│  [ OPEN ]  Open full document scan  │
├─────────────────────────────────────┤
│  HIGHLIGHTED SECTION                │
│  "I hereby accept the accession     │
│   of the Jammu and Kashmir State    │
│   to the Dominion of India..."      │
│  Annotations explain significance   │
│  of each reserved clause.           │
├─────────────────────────────────────┤
│  EVIDENCE                           │
│  Archive: National Archives of India│
│  Evidence level: B                  │
│  Public Record (Government of India)│
├─────────────────────────────────────┤
│  CITATION                           │
│  "Instrument of Accession of Jammu  │
│   and Kashmir State. October 26,    │
│   1947. National Archives of India."│
├─────────────────────────────────────┤
│  CLAIMS SUPPORTED                   │
│  • partition-011 (confidence 5/5)   │
└─────────────────────────────────────┘
```

**Applied to Chapter 1:**

| Beat | Asset | Context | Highlighted section | Evidence level | Claims |
|------|-------|---------|-------------------|---------------|--------|
| 10 | A-06 | Instrument of Accession of Jammu and Kashmir, signed by Maharaja Hari Singh, 26 October 1947 | Three clauses: (1) accession limited to defence/foreign affairs/communications, (2) internal autonomy reserved, (3) conditional on military assistance | B | partition-011 |

**Interaction:** Tap thumbnail → full-screen scan. Tap highlighted section → annotation. Tap claim → claim panel.

---

## Template: Comparison (Chart)

```
┌─────────────────────────────────────┐
│                                     │
│           CHART                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  METHOD                             │
│  How the data was collected,        │
│  calculated, or estimated.          │
│  "Flow volumes from 1951 Census     │
│   of India and Pakistan.            │
│   Unauthorised crossings not        │
│   captured. Estimates marked        │
│   with confidence range."           │
├─────────────────────────────────────┤
│  DATASET                            │
│  Source, year, access URL or        │
│  citation.                          │
│  "1951 Census of India, Table X;    │
│   1951 Census of Pakistan,           │
│   Table Y."                         │
├─────────────────────────────────────┤
│  LIMITATIONS                        │
│  Confidence intervals, margins of   │
│  error, known gaps in data.         │
│  "Death toll uncertainty range:     │
│   200,000–2,000,000. Scholarly      │
│   consensus: 500,000–1,000,000."    │
├─────────────────────────────────────┤
│  [ DOWNLOAD ]                       │
│  CSV / SVG / citation export        │
└─────────────────────────────────────┘
```

**Applied to Chapter 1:**

| Beat | Asset | Method | Dataset | Limitations | Download |
|------|-------|--------|---------|-------------|----------|
| 8a | D-02 | Flow volumes calculated from 1951 Census of India and Pakistan. Arrow width proportional to estimated volume. Unauthorised crossings not captured. | 1951 Census of India, Table X (Displacement); 1951 Census of Pakistan, Table Y (Refugee population) | Unofficial crossings not recorded. Volume by district pair estimated from census comparison. ±15% margin. | CSV |
| 8b | D-01 | Death toll range aggregated from four scholarly sources: Bhatia (1967), Pandey (2001), Talbot (2009), Khan (2007). | Scholarly aggregates per Book of Record #0006. Khan (2007) pp. 120–135; Pandey (2001) Ch. 4 | No single authoritative figure. Lower bound: documented deaths. Upper bound: documented plus estimated undocumented. | CSV |
| 9 | D-05 | Division ratios from Auchinleck Partition Committee records (IOR). Civil service and treasury from Transfer of Power vol 12. | Auchinleck Partition Committee proceedings; Transfer of Power vol 12, Documents 45–67 | Asset valuations in 1947 rupees; no inflation-adjusted equivalents provided. | CSV |

**Interaction:** Hover segment → tooltip with exact value. Tap methodology → expand panel. Tap dataset → source card. Tap download → file download.

---

## Template: Timeline

```
┌─────────────────────────────────────┐
│                                     │
│      ●────●────●────●────●────●     │
│      1945 1946 1947 1948            │
│                                     │
├─────────────────────────────────────┤
│  EVENT LIST (scrollable)            │
│  ┌────────────────────────────┐     │
│  │ 1945-12-01  Elections      │     │
│  │ 1946-03-24  Cabinet        │     │
│  │            Mission arrives │     │
│  │ 1946-05-16  Plan announced │     │
│  │ 1946-07-10  Nehru press    │     │
│  │             conference     │     │
│  │ ...                        │     │
│  └────────────────────────────┘     │
├─────────────────────────────────────┤
│  FILTER: [All] [Political]          │
│  [Diplomatic] [Military]            │
│  [Humanitarian]                     │
├─────────────────────────────────────┤
│  LINKED CLAIMS                      │
│  • partition-001 (timeline)         │
│  • partition-006 (acceleration)     │
└─────────────────────────────────────┘
```

**Applied to Chapter 1:**

| Beat | Asset | Event count | Categories | Claims |
|------|-------|-------------|------------|--------|
| 2 | D-03 | 28 events, 1940–1948 | Political, Diplomatic, Military, Humanitarian | partition-001, partition-006 |

**Interaction:** Scroll events → tap event → detail card. Tap filter → toggle category. Tap claim → claim panel.

---

## Template Summary — All Beats

| Beat | Asset | Template | Interaction trigger | Info stack |
|------|-------|----------|-------------------|-----------|
| 1 | SUP-01 | Context | Tap → lightbox | Caption → Credit → Archive → Evidence → Claims |
| 2 | D-03 | Timeline | Scroll → tap event | Event detail → Filter → Claims |
| 3 | B-06 | Orientation | Zoom → tap region | Legend → Source → Claims → Full screen |
| 4 | B-02 | Orientation | Zoom → tap region | Legend → Source → Claims → Full screen |
| 5 | A-03 | Context | Tap → lightbox | Caption → Credit → Archive → Evidence → Claims |
| 6 | A-01 | Context | Tap → lightbox | Caption → Credit → Archive → Evidence → Claims |
| 7 | B-03 | Orientation | Zoom → tap infrastructure | Legend → Disputed boundary notice → Source → Claims → Full screen |
| 8 | D-02 + D-01 | Comparison | Hover → tap | Method → Dataset → Limitations → Download |
| 9 | D-05 | Comparison | Hover → tap | Method → Dataset → Limitations → Download |
| 10 | A-06 | Evidence | Tap thumbnail → full scan | Context → Highlighted section → Evidence → Citation → Claims |

# Visual Provenance Audit — Founding Monograph 001

**Status:** Active
**Last Updated:** 2026-07-14
**Scope:** All 40 visual assets in the visual registry

---

## Audit Protocol

Each asset is evaluated against seven gates:

| Gate | Criteria | Blocking? |
|------|----------|-----------|
| **Source** | Original archive identified, reference number confirmed, URL or IIIF link available | ✅ Blocks publication |
| **License** | License type verified, publication rights confirmed, cost determined if RM | ✅ Blocks publication |
| **Caption** | Accurate, historically verified, distinguishes fact from inference | ❌ Editorial fix |
| **Alt text** | Descriptive, context-appropriate, WCAG compliant | ❌ Editorial fix |
| **Linked claims** | References existing canonical claim IDs | ❌ Editorial fix |
| **Educational purpose** | Does it teach something the text alone cannot? | ❌ Editorial fix |
| **Approved** | All blocking gates clear | ✅ Gate for publication |

---

## Asset Inventory — 40 Assets

### Section A — Archival Photographs (10 assets)

---

#### A-01 — Mountbatten and Jinnah at the Viceroy's House, 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ IWM IND 5302. URL verified: https://www.iwm.org.uk/collections/item/object/205125304 |
| **License** | ✅ Public Domain (Crown Copyright expired). Free to publish. |
| **Caption** | ✅ Accurate. "Final negotiations of the Mountbatten Plan" — both men were central to the 3 June 1947 announcement. |
| **Alt text** | ⚠ "Two men in formal dress seated in an office, 1947" — functional but minimal. Expand to identify both figures and contextualise the meeting. |
| **Linked claims** | ✅ claim.partition.mountbatten-plan, claim.partition.negotiations-jinnah — appropriate links. Note: claim IDs are in visual-registry convention, not block IDs. |
| **Educational purpose** | ✅ This image shows the personal diplomacy at the highest level during Partition's final months. The body language (Jinnah's reserve, Mountbatten's informality) is itself instructive. |
| **Approved** | ✅ **Approved for publication** (after alt text expansion) |

---

#### A-02 — Cabinet Mission delegates with Congress leaders, Simla 1946

| Gate | Assessment |
|------|------------|
| **Source** | ✅ British Library IOR/Photo 134/2(18). IIIF URL via Bridgeman confirmed. |
| **License** | ❌ **Rights Managed (Album / British Library via Bridgeman Images).** Cost unknown. Not cleared for publication. |
| **Caption** | ✅ Accurate. "Collapse of these negotiations preceded the demand for Partition" — correct framing. |
| **Alt text** | ✅ "Group photograph of British and Indian political delegates, 1946" — adequate for a group portrait. |
| **Linked claims** | ✅ claim.partition.cabinet-mission |
| **Educational purpose** | ✅ This image documents the last serious attempt to preserve a united India. Visually establishes the key actors and the atmosphere of the Simla negotiations. |
| **Approved** | ❌ **BLOCKED — License not cleared. Determine cost from Bridgeman; consider public domain alternative from British Library digital collections.** |

---

#### A-03 — Great Calcutta Killing aftermath, August 1946

| Gate | Assessment |
|------|------------|
| **Source** | ✅ TIME/LIFE Picture Collection via Getty Images (50694119). Google Arts & Culture link confirmed. |
| **License** | ❌ **Rights Managed (Time Inc. / Getty Images).** File NOT present in repository. Google Arts & Culture download does NOT grant publication rights. Estimated cost: $375–$500 for editorial RM license. |
| **Caption** | ✅ Accurate. "Bodies in the streets... 16-19 August 1946" — verified. |
| **Alt text** | ⚠ "Street scene with casualties after the Great Calcutta Killing" — add specific details: number of visible bodies, setting. |
| **Linked claims** | ✅ claim.partition.direct-action-day, claim.partition.violence-civil-society |
| **Educational purpose** | ✅ This is the single most important visual document of the communal violence that made Partition unavoidable. It is essential to the chapter's argument about the escalation spiral. |
| **Approved** | ❌ **BLOCKED — License not purchased. File missing from repo. Needed: Getty RM license ($375–$500), download, place at `/images/library/photos/a-03-calcutta-killing-1946.jpg`.** |

---

#### A-04 — Refugee train at New Delhi railway station, 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Margaret Bourke-White, TIME/LIFE via Getty. Reference provisional (metadata only). |
| **License** | ❌ **Rights Managed (LIFE/Time Inc. / Getty Images).** Not acquired. Cost unknown. |
| **Caption** | ✅ Accurate. "Refugee train departing New Delhi" — correctly identifies location (New Delhi, not Old Delhi per archival note). |
| **Alt text** | ⚠ "Crowded railway platform with refugees, 1947" — expand: specify train, platform context, visible demographic details. |
| **Linked claims** | ✅ claim.partition.refugee-crisis |
| **Educational purpose** | ✅ This is the iconic Bourke-White image of Partition migration. It visually represents the largest forced migration in human history. Highly desirable. |
| **Approved** | ❌ **BLOCKED — Not acquired. No substitute found (verification report SUP-01/SUP-02 confirmed different photographers/collections). Needed: Getty RM license, download.** |

---

#### A-05 — Refugee column on Grand Trunk Road, Punjab, 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Margaret Bourke-White, TIME/LIFE via Getty. Reference provisional. |
| **License** | ❌ **Rights Managed (LIFE/Time Inc. / Getty Images).** Not acquired. Cost unknown. |
| **Caption** | ✅ Accurate. "Refugees on foot on the Grand Trunk Road during the Punjab migration." |
| **Alt text** | ⚠ "Long column of refugees walking along a road" — expand: specify Grand Trunk Road, estimated column length, visible demographic details. |
| **Linked claims** | ✅ claim.partition.refugee-crisis |
| **Educational purpose** | ✅ Complements A-04 by showing the overland refugee experience versus rail. Together they document the two primary modes of migration. |
| **Approved** | ❌ **BLOCKED — Not acquired. No substitute found (verification report SUP-04/SUP-05 confirmed different photographers). Needed: Getty RM license, download.** |

---

#### A-06 — Instrument of Accession of Jammu and Kashmir (document facsimile)

| Gate | Assessment |
|------|------------|
| **Source** | ✅ National Archives of India. Wikimedia Commons IIIF URL: https://upload.wikimedia.org/wikipedia/commons/e/e1/Instrument_of_Accession_and_Standstill_Agreement_of_Jammu_and_Kashmir_to_Dominion_of_India.pdf |
| **License** | ✅ Public Record (Government of India). Free to publish. |
| **Caption** | ⚠ "No photograph of the signing exists due to the secrecy and urgency of the midnight ceremony" — this note is more important than the caption. The caption should explain this is a substitute (document facsimile, not a photograph). Consider rewriting to foreground this distinction. |
| **Alt text** | ✅ "Facsimile of the Instrument of Accession document" — clear and accurate. |
| **Linked claims** | ✅ claim.partition.kashmir-accession |
| **Educational purpose** | ✅ This document is the legal foundation of the Kashmir dispute. The facsimile allows readers to see the actual terms (limited accession, three subjects) rather than relying on secondary description. |
| **Approved** | ❌ **BLOCKED — Not downloaded. Wikimedia Commons PDF is freely available. Needed: download and place at `/images/library/chapter-1/documents/doc-instrument-of-accession.pdf`.** |

---

#### A-07 — Nehru addressing the UN General Assembly, November 1948

| Gate | Assessment |
|------|------------|
| **Source** | ✅ UN Photo Library. IIIF URL: https://media.un.org/photo/en/. Reference: GA 3rd Session. |
| **License** | ✅ **UN Public Domain / Editorial Use. Free to publish.** |
| **Caption** | ✅ Accurate. Location corrected from October/New York to November/Paris per archival research (Book of Record). |
| **Alt text** | ⚠ "Nehru at a podium at the UN, 1948" — expand: specify location (Palais de Chaillot, Paris), occasion (Kashmir debate), and visible audience context. |
| **Linked claims** | ✅ claim.partition.kashmir-unfinished |
| **Educational purpose** | ✅ This image captures the moment India internationalised the Kashmir dispute. Nehru at the UN podium is the visual embodiment of India's early diplomatic strategy. |
| **Approved** | ❌ **BLOCKED — Not downloaded. UN Photo is freely downloadable. Needed: download and place at `/images/library/photos/a-07-nehru-unga-1948.jpg`.** |

---

#### A-08 — Sir Cyril Radcliffe, 1957 (authorised substitute)

| Gate | Assessment |
|------|------------|
| **Source** | ✅ National Portrait Gallery, London (NPG x88321). IIIF URL verified. |
| **License** | ❌ **Rights Managed (NPG).** NPG changed licensing model in 2023 — verify current terms for NPG x88321. Some NPG works are now CC for non-commercial; editorial use may still require payment. |
| **Caption** | ✅ Accurate. Notes that "no photograph of his work in India survives" — essential context. |
| **Alt text** | ✅ "Portrait of Sir Cyril Radcliffe, 1957" — adequate. |
| **Linked claims** | ✅ claim.partition.radcliffe-arbitrary |
| **Educational purpose** | ✅ Radcliffe is the most consequential person most readers have never seen. The portrait puts a face to the name, and the caption's note about no "at work" photo deepens the story about the rushed process. |
| **Approved** | ❌ **BLOCKED — License not confirmed. File missing from repo. Needed: verify NPG 2023 terms; download if free or purchase license.** |

---

#### A-09 — Jinnah and Gandhi in conversation, Bombay 1944

| Gate | Assessment |
|------|------------|
| **Source** | ✅ ullstein bild / Dinodia Photos via Getty (542347429). Wikimedia Commons IIIF URL: https://commons.wikimedia.org/wiki/File:Gandhi_Jinnah_Sept_1944.jpg |
| **License** | ✅ **Public Domain in India (Section 25, Copyright Act 1957). Free to publish internationally via Wikimedia Commons.** |
| **Caption** | ✅ Accurate. "Failed Bombay talks of 1944, an early missed opportunity for unity" — correct framing. |
| **Alt text** | ⚠ "Jinnah and Gandhi seated in conversation, 1944" — expand: specify setting (Bombay, 1944), facial expressions or body language that conveys the nature of the talks. |
| **Linked claims** | ✅ claim.partition.gandhi-jinnah-talks |
| **Educational purpose** | ✅ The Gandhi-Jinnah talks of 1944 were the last serious bilateral attempt to avoid Partition. This image shows the two principals and visually anchors a key counterfactual: "what if these talks had succeeded?" |
| **Approved** | ✅ **Approved for publication** (after alt text expansion and file confirmation) |

---

#### A-10 — Gandhi at Noakhali, 1946

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Kanu Gandhi / GandhiServe Foundation. IIIF URL: https://www.gandhiserve.net/the-gandhi-collection/kanu-gandhi/ |
| **License** | ❌ **Rights Managed (GandhiServe / Kanu Gandhi Estate).** Cost unknown. Not cleared for publication. |
| **Caption** | ✅ Accurate. "Gandhi walks barefoot through riot-torn villages of Noakhali during his peace mission." |
| **Alt text** | ⚠ "Gandhi walking through a village with followers" — expand: specify Noakhali, 1946, barefoot, purpose (peace mission). |
| **Linked claims** | ✅ claim.partition.violence-civil-society |
| **Educational purpose** | ✅ This image captures Gandhi's most extraordinary personal intervention — a 79-year-old man walking barefoot through villages where his followers had been murdered, in a last attempt to halt communal violence. It humanises the chapter's discussion of civil society resistance to Partition. |
| **Approved** | ❌ **BLOCKED — License not cleared. Needed: contact GandhiServe for editorial terms.** |

---

### Section B — Supplementary Assets (7 assets, all PROVISIONAL)

---

#### SUP-01 — Muslim refugees on train engine, Delhi 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Daily Herald Archive / National Science & Media Museum via Getty (1360179719). |
| **License** | ❌ **Rights Managed.** Not cleared for publication. |
| **Caption** | ⚠ Needs verification: "Muslim refugees... crowd the engine of a train departing from Delhi in 1947" — caption states "Delhi" but master register verification report notes photographer is Daily Herald, not Bourke-White. Verify caption accuracy against Daily Herald archival metadata. |
| **Alt text** | ✅ "Muslim refugees crowding a steam train engine at a Delhi station, 1947" — adequate. |
| **Linked claims** | ✅ claim.partition.refugee-crisis |
| **Educational purpose** | ⚠ Supplementary to A-04 (Bourke-White refugee train). Use only if A-04 cannot be acquired. Same educational role. |
| **Approved** | ❌ **BLOCKED — Provisional. License not cleared. Not promoted to canonical (verification report: <5% match with A-04).** |

---

#### SUP-02 — Muslims boarding train at New Delhi Station, 7 August 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Keystone Features / Getty (3336843). Date verified: 7 August 1947. |
| **License** | ❌ **Rights Managed.** Not cleared for publication. |
| **Caption** | ⚠ "Farewells are said as Muslims prepare to board the special train" — verify "farewells" framing. Caption implies voluntary departure; scholarly consensus is that migration was driven by violence and fear. Consider revising to neutral phrasing. |
| **Alt text** | ✅ "Muslims boarding a train at New Delhi station, August 1947" — adequate. |
| **Linked claims** | ✅ claim.partition.refugee-crisis |
| **Educational purpose** | ⚠ Same slot as SUP-01 and A-04. Three refugee-train images for a single chapter is redundant. Choose one (priority: A-04 Bourke-White). Use SUP assets only as fallback. |
| **Approved** | ❌ **BLOCKED — Provisional. License not cleared. Not promoted to canonical.** |

---

#### SUP-03 — Gandhi and Nehru addressing refugees at Hardwar relief camp, June 1947

| Gate | Assessment |
|------|------------|
| **Source** | ⚠ Universal History Archive / Getty (973199382). Reference: subject matter verified (Gandhi + Nehru + refugees + Hardwar + June 1947). |
| **License** | ❌ **Rights Managed.** Not cleared for publication. |
| **Caption** | ✅ "Gandhi and Nehru addressing refugees from the Punjab at a relief camp in Hardwar, June 1947" — accurate. |
| **Alt text** | ✅ "Gandhi and Nehru speaking to refugees at a relief camp, 1947" — adequate. |
| **Linked claims** | ✅ claim.partition.gandhi-jinnah-talks, claim.partition.refugee-crisis |
| **Educational purpose** | ✅ **High value.** Verification report identifies this as a "new asset, historically significant" — Gandhi and Nehru are rarely photographed together during this period, and the refugee-camp setting is unique among available images. Consider elevation to canonical if license can be cleared. |
| **Approved** | ❌ **BLOCKED — Provisional. License not cleared. RECOMMENDED for elevation to canonical if license terms are acceptable.** |

---

#### SUP-04 — Soldiers and refugees on vehicle trek, 5 September 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Bettmann / Getty (515214340). Date verified: 5 September 1947. |
| **License** | ❌ **Rights Managed.** Not cleared for publication. |
| **Caption** | ⚠ "Armed soldiers stand guard as Muslim refugees crowd onto a vehicle during the mass trek to Pakistan" — verify: the caption combines "soldiers" and "refugees" but the vehicle's ownership and the soldiers' affiliation (Indian Army? Pakistan? British?) are unclear. |
| **Alt text** | ✅ "Soldiers and Muslim refugees on a vehicle, 1947" — adequate. |
| **Linked claims** | ✅ claim.partition.refugee-crisis |
| **Educational purpose** | ⚠ Same slot as A-05 (Bourke-White refugee column). A-05 is preferred. Use only as fallback. |
| **Approved** | ❌ **BLOCKED — Provisional. License not cleared. Not promoted to canonical.** |

---

#### SUP-05 — Refugees trekking on foot with belongings, September 1947

| Gate | Assessment |
|------|------------|
| **Source** | ✅ Bettmann / Getty (701041686). Date verified: 5 September 1947. |
| **License** | ❌ **Rights Managed.** Not cleared for publication. |
| **Caption** | ✅ "Muslim refugees carrying their personal belongings and leading animals as they trek to Pakistan during the Partition migration" — accurate. |
| **Alt text** | ✅ "Muslim refugees on foot with belongings trekking to Pakistan, 1947" — adequate. |
| **Linked claims** | ✅ claim.partition.refugee-crisis |
| **Educational purpose** | ⚠ Same slot as A-05. A-05 is preferred. Use only as fallback. |
| **Approved** | ❌ **BLOCKED — Provisional. License not cleared. Not promoted to canonical.** |

---

#### SUP-06 — Aarzi Hukumat Junagadh volunteers, 25 September 1947

| Gate | Assessment |
|------|------------|
| **Source** | ⚠ Getty (1971029537). Creator listed as "Unknown." Source metadata incomplete. |
| **License** | ❌ **Rights Managed.** Not cleared. |
| **Caption** | ⚠ "A train carrying 'Aarzi Hukumat Junagadh' volunteers arrives in Junagadh" — verify: the Aarzi Hukumat was a government-in-exile formed by Junagadh's exiled prime minister after the Nawab's accession to Pakistan. The caption should more clearly explain the political context. |
| **Alt text** | ✅ "Volunteers arriving by train in Junagadh, September 1947" — adequate. |
| **Linked claims** | ✅ claim.partition.princely-states |
| **Educational purpose** | ✅ **High value.** Verification report identifies this as a "new asset, historically significant" — no existing photographic asset covers the Junagadh accession crisis, which is a key example in the princely states section. Consider elevation to canonical. |
| **Approved** | ❌ **BLOCKED — Provisional. License not cleared. Source creator unknown. RECOMMENDED for elevation if provenance can be confirmed.** |

---

#### SUP-07 — Mahatma Gandhi with Abha Gandhi and Kanu Gandhi

| Gate | Assessment |
|------|------------|
| **Source** | ❌ **Unknown.** Getty ID 1711791173 does not resolve. Creator possibly Kanu Gandhi or Ruhe/ullstein bild collection but unconfirmed. |
| **License** | ❌ **Unknown.** License field: "Unknown." Credit: "Source unconfirmed." |
| **Caption** | ⚠ "Gandhi with Abha Gandhi (right) and Kanu Gandhi (left)" — the figures are identified but the date, location, and occasion are all unknown. The image lacks historical context. |
| **Alt text** | ✅ "Gandhi with Abha Gandhi and Kanu Gandhi" — adequate for what is known. |
| **Linked claims** | ❌ Empty array. No claims linked. |
| **Educational purpose** | ❌ **Unclear.** The image shows Gandhi with family members but lacks date, location, and occasion. Without this context, it cannot serve a clear pedagogical function. The 289x400px preview is too small for meaningful reproduction. |
| **Approved** | ❌ **BLOCKED — Insufficient provenance. Unknown source. Unknown license. No linked claims. No educational purpose identified. Do not publish. DO NOT associate with any monograph asset.** |

---

### Section C — Maps (7 assets, all recreated)

| Asset | Title | Claims | Approved |
|-------|-------|--------|----------|
| **B-01** | British India, 1939 — admin divisions and princely states | claim.partition.pre-partition-india | ✅ Approved (recreated, no legal restrictions) |
| **B-02** | Cabinet Mission Plan, 1946 — federal structure | claim.partition.cabinet-mission, claim.partition.avoidable | ✅ Approved (recreated) |
| **B-03** | The Radcliffe Line, 1947 | claim.partition.radcliffe-arbitrary, claim.partition.demographic-impact | ⚠ **Draft — GIS recreation in progress.** Disputed boundaries require dashed-line treatment per cartographic policy. |
| **B-04** | Partition migration flows, 1947-48 | claim.partition.refugee-crisis, claim.partition.demographic-impact | ✅ Approved (recreated, disputed boundaries noted) |
| **B-05** | Kashmir, 1947-48 — campaign map | claim.partition.kashmir-accession, claim.partition.kashmir-unfinished | ✅ Approved (recreated, disputed boundaries noted) |
| **B-06** | Religious demography, 1941 — district-level | claim.partition.demographic-impact | ✅ Approved (recreated) |
| **B-07** | Princely states — accession outcomes | claim.partition.princely-states | ✅ Approved (recreated, disputed boundaries noted) |

**All maps are original cartography (GIS vector) with no third-party license issues.** B-03 is the only map not yet complete.

---

### Section D — Document Facsimiles (5 assets)

| Asset | Title | License | Approved |
|-------|-------|---------|----------|
| **C-01** | Indian Independence Act, 1947 | Public Record (UK Parliament) | ✅ Approved (archived) |
| **C-02** | Instrument of Accession of J&K | Public Record (GOI) | ❌ **Not downloaded — available via Wikimedia Commons PDF ($0)** |
| **C-03** | UN Security Council Resolution 47 | UN Public Domain | ❌ **Not downloaded — available via UN Digital Library ($0)** |
| **C-04** | Radcliffe Boundary Commission Proceedings | Public Record (BL) | ❌ **Physical only — digitisation required** |
| **C-05** | Cabinet Mission Plan memorandum | Crown copyright expired (1996) | ❌ **Not downloaded — available via HathiTrust ($0)** |

---

### Section E — Charts (5 assets, all recreated)

| Asset | Title | Claims | Approved |
|-------|-------|--------|----------|
| **D-01** | Casualties — death toll estimates | claim.partition.death-toll | ✅ Approved |
| **D-02** | Refugee flows and destinations | claim.partition.refugee-crisis | ✅ Approved |
| **D-03** | Timeline, 1945-1948 | claim.partition.sequence | ✅ Approved |
| **D-04** | Religious composition, 1941 vs 1951 | claim.partition.demographic-impact | ✅ Approved |
| **D-05** | India-Pakistan military balance, 1947 | claim.partition.security-paradigm | ✅ Approved |

All charts recreated from data. No third-party license issues.

---

### Section F — Flow Maps (3 assets, all recreated)

| Asset | Title | Claims | Approved |
|-------|-------|--------|----------|
| **Flow-1** | Punjab migration | claim.partition.refugee-crisis | ✅ Approved |
| **Flow-2** | Bengal migration | claim.partition.refugee-crisis | ✅ Approved |
| **Flow-3** | Total subcontinental migration | claim.partition.refugee-crisis | ✅ Approved |

All flow maps recreated from Census of India data. No license issues.

---

### Section G — Relationship Diagrams (3 assets, all draft)

| Asset | Title | Claims | Approved |
|-------|-------|--------|----------|
| **Diagram-1** | Key actors network | claim.partition.actors | ⚠ Draft — AI-generated, needs review |
| **Diagram-2** | Cabinet Mission Plan structure | claim.partition.cabinet-mission | ⚠ Draft — AI-generated, needs review |
| **Diagram-3** | Decision tree of Partition | claim.partition.avoidable | ⚠ Draft — AI-generated, needs review |

All diagrams are AI-generated explanatory illustrations, not historical photographs. Labelled per Book of Record #0005. No third-party license issues but need final SVG creation.

---

## Summary: Publication Readiness

### Can Publish Now (7 assets)
| Asset | Action Taken |
|-------|-------------|
| A-06 | Downloaded from Wikimedia Commons (2026-07-14) |
| A-07 | Downloaded from Wikimedia Commons (2026-07-14) |
| C-01 | Already archived |
| C-02 | Downloaded from Wikimedia Commons (2026-07-14) |
| C-03 | Downloaded from UN Digital Library (2026-07-14) |
| C-05 | Downloaded from Internet Archive (2026-07-14) |
| A-09 | Already archived (pending alt-text expansion only) |

### Can Publish After Alt-Text Expansion Only (2 assets)
| Asset | Action |
|-------|--------|
| A-01 | Expand alt text to identify both figures |
| A-09 | Expand alt text to describe setting |

### Blocked — License Not Cleared (7 assets)
| Asset | Issue |
|-------|-------|
| A-02 (Cabinet Mission) | RM via Bridgeman. Determine cost. |
| A-03 (Calcutta Killing) | RM via Getty. $375–$500. File missing. |
| A-04 (Refugee train) | RM via Getty. Not acquired. |
| A-05 (Refugee column) | RM via Getty. Not acquired. |
| A-08 (Radcliffe portrait) | RM via NPG. Verify 2023 terms. File missing. |
| A-10 (Gandhi Noakhali) | RM via GandhiServe. Determine cost. |
| SUP-03 (Gandhi+Nehru refugees) | RM. Recommended for elevation. |

### Blocked — Not Downloaded, $0 (resolved)
All 4 $0 assets downloaded and archived locally (2026-07-14). Section retired.

### Blocked — Digitisation Required (1 asset)
| Asset | Source |
|-------|--------|
| C-04 (Radcliffe Commission) | British Library, physical only |

### Blocked — Insufficient Provenance (1 asset)
| Asset | Issue |
|-------|-------|
| SUP-07 (Gandhi with family) | Unknown source, unknown license, no linked claims |

### Draft — Needs Creation (4 assets)
| Asset | Type |
|-------|------|
| B-03 (Radcliffe Line map) | GIS recreation in progress |
| Diagram-1 (Actors network) | AI-generated, needs SVGs |
| Diagram-2 (Cabinet Mission structure) | AI-generated, needs SVGs |
| Diagram-3 (Decision tree) | AI-generated, needs SVGs |

### Supplementary — Provisional (6 assets, no path to publication without license clearance)
SUP-01, SUP-02, SUP-04, SUP-05, SUP-06, SUP-07

---

## Priority Action Items

### Immediate ($0, can complete today)
- [x] Download A-07 (Nehru at UNGA) — downloaded from Wikimedia Commons (PD India) → `/images/library/chapter-1/photos/a-07-nehru-unga-1948.jpg`
- [x] Download C-03 (UNSCR 47) from UN Digital Library → `/images/library/chapter-1/documents/doc-unscr-47.pdf`
- [x] Download C-05 (Cabinet Mission Plan) from Internet Archive → `/images/library/chapter-1/documents/doc-cabinet-mission-plan.pdf`
- [x] Download A-06 (Instrument of Accession) from Wikimedia Commons → `/images/library/chapter-1/documents/doc-instrument-of-accession.pdf`
- [x] Update status fields in visual registry from `requested` to `archived` for downloaded assets
- [ ] Expand alt text on A-01 and A-09

### This Week
- [ ] License research: A-08 (NPG x88321) — verify current terms
- [ ] License research: A-02 (Bridgeman) — request editorial quote
- [ ] License research: A-10 (GandhiServe) — request editorial terms
- [ ] Budget decision: A-03 (Getty RM, $375–$500) — essential asset
- [ ] Budget decision: A-04, A-05 (Getty RM) — essential assets
- [ ] Determine whether SUP-03 or SUP-06 should be elevated to canonical

### Before Publication
- [ ] Complete B-03 (Radcliffe Line) GIS recreation
- [ ] Create SVG files for diagrams 1–3
- [ ] Digitise C-04 (Radcliffe Commission) — order from British Library
- [ ] Final alt-text review for all 40 assets (WCAG compliance check)

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-07-14 | Initial visual provenance audit — all 40 assets assessed across 7 gates | Editor |

# Asset Register — The Breakdown Knowledge Platform

**Last updated:** 2026-07-13

This is the canonical master asset register for all visual assets across the Knowledge Platform. It is the authoritative cross-reference between:
- `docs/assets/chapter-01.md` — human-readable register with full provenance
- `assets/assets.json` — machine-readable inventory
- `assets/metadata.json` — machine-readable metadata
- `assets/citations.json` — machine-readable citation data
- `utils/data-layer/knowledge-library-data.ts` — knowledge blocks with `url` fields

---

## Asset Status Legend

| Status | Meaning |
|--------|---------|
| `archived` | Original or high-resolution surrogate stored locally |
| `archived (provisional)` | Acquired but not verified against master register |
| `recreated` | GIS vector maps, original charts, or explanatory diagrams produced in-house |
| `requested` | Identified, acquisition source known, not yet acquired |
| `impossible` | No original asset exists; authorised substitute used |

---

## Chapter 1 — India's Inheritance: The Partition and Its Legacies

### Canonical Local Files (Archived)

| Asset ID | File | Acquired From | Evidence |
|----------|------|---------------|----------|
| **A-01** | `public/images/library/photos/a-01-mountbatten-jinnah-viceroys-house-1947.jpg` | IWM direct download (IND 5302) | A |
| **A-06** | `public/images/library/chapter-1/documents/doc-instrument-of-accession.pdf` | Wikimedia Commons download (2026-07-14) | B |
| **A-07** | `public/images/library/chapter-1/photos/a-07-nehru-unga-1948.jpg` | Wikimedia Commons download (2026-07-14) | D |
| **A-09** | `public/images/library/chapter-1/photos/photo-gandhi-jinnah-bombay-1944-dinodia-mkg33469.jpg` | Getty preview (542347429) | B |
| **C-01** | `public/images/library/chapter-1/documents/doc-independence-act-1947.jpg` | Parliamentary Archives download | B |
| **C-02** | `public/images/library/chapter-1/documents/doc-instrument-of-accession.pdf` | Wikimedia Commons download (2026-07-14) | B |
| **C-03** | `public/images/library/chapter-1/documents/doc-unscr-47.pdf` | UN Digital Library download (2026-07-14) | A |
| **C-05** | `public/images/library/chapter-1/documents/doc-cabinet-mission-plan.pdf` | Internet Archive download (2026-07-14) | B |

### Supplementary Assets (Provisional — Thematic)

| Asset ID | Theme | File | Source | Status |
|----------|-------|------|--------|--------|
| SUP-01 | partition | `public/images/library/supplementary/partition/sup-01-muslim-refugees-train-engine-delhi-1947-daily-herald.jpg` | SSPL / Getty (1360179719) | Provisional |
| SUP-02 | partition | `public/images/library/supplementary/partition/sup-02-muslims-boarding-train-new-delhi-1947-keystone.jpg` | Keystone / Getty (3336843) | Provisional |
| SUP-04 | partition | `public/images/library/supplementary/partition/sup-04-soldiers-refugees-vehicle-trek-1947-bettmann.jpg` | Bettmann / Getty (515214340) | Provisional |
| SUP-05 | partition | `public/images/library/supplementary/partition/sup-05-refugees-trekking-foot-belongings-1947-bettmann.jpg` | Bettmann / Getty (701041686) | Provisional |
| SUP-03 | gandhi | `public/images/library/supplementary/gandhi/sup-03-gandhi-nehru-refugees-hardwar-1947.jpg` | Universal History / Getty (973199382) | Provisional |
| SUP-07 | gandhi | `public/images/library/supplementary/gandhi/sup-07-gandhi-abha-kanu-gandhi.jpg` | Unknown (source unconfirmed) | Provisional, Unmapped |
| SUP-06 | accession | `public/images/library/supplementary/accession/sup-06-junagadh-volunteers-train-1947.jpg` | Getty (1971029537) | Provisional |

### Recreated Assets (GIS / Original Cartography / Charts / Diagrams)

All in `public/images/library/chapter-1/{maps,charts,flows,diagrams}/`. See `docs/assets/chapter-01.md` Sections B-F for full provenance.

| Type | Assets |
|------|--------|
| Maps | B-01, B-02, B-03, B-04, B-05, B-06, B-07 (7) |
| Charts | D-01, D-02, D-03, D-04, D-05 (5) |
| Flows | Flow-1 (Punjab), Flow-2 (Bengal), Flow-3 (Subcontinent) (3) |
| Diagrams | Diagram-1 (Actors Network), Diagram-2 (Cabinet Mission Structure), Diagram-3 (Decision Tree) (3) |

---

## Cross-Reference

| File | Purpose |
|------|---------|
| `docs/assets/chapter-01.md` | Human-readable register with full provenance, archival hierarchy, IIIF URLs, citations |
| `assets/assets.json` | Machine-readable asset inventory with IDs, URLs, statuses, block IDs |
| `assets/metadata.json` | Machine-readable metadata including provenance, acquisition history, dimensions |
| `assets/citations.json` | Machine-readable citation data in Chicago, MLA, APA formats |
| `utils/data-layer/knowledge-library-data.ts` | Source-of-truth knowledge blocks with embedded `url` fields for every local asset |

---

## Governance

1. `assets/assets.json` is the source of truth for the machine-readable asset inventory.
2. `docs/assets/chapter-01.md` is the source of truth for human-readable provenance.
3. `utils/data-layer/knowledge-library-data.ts` blocks drive the rendering engine.
4. All three must be kept in sync when assets are added, moved, or reclassified.
5. SUP entries are PROVISIONAL by default. They become canonical only when:
   - Caption, photographer, and visual content are verified against the master register
   - Mapping to an existing asset ID (e.g., A-04) is confirmed
   - The SUP ID is retired and the canonical entry updated

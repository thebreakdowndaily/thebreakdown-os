# Technical Validation Report — Visual Rendering Pipeline

**Date:** 2026-07-14
**Status:** Complete
**Phase:** C — Rendering Pipeline

---

## Summary

Three visual block renderers implemented: ImageBlock, MapBlock, ChartBlock. All 40 visual blocks in Chapter 1 now return rendered UI instead of `null`. Build passes (248 pages). TypeScript strict mode clean.

**Renderers created:**
| Renderer | File | Type |
|----------|------|------|
| ImageBlock | `components/knowledge-library/blocks/ImageBlock.tsx` | `image` |
| MapBlock | `components/knowledge-library/blocks/MapBlock.tsx` | `map` |
| ChartBlock | `components/knowledge-library/blocks/ChartBlock.tsx` | `chart` |

---

## Architecture

```
KnowledgeRenderer
  └── getBlockRenderer(block.type)
        └── registry.get(type)
              └── ImageBlock | MapBlock | ChartBlock  ← NEW
```

Registration happens in `components/knowledge-library/blocks/registry.ts` via `registerAllBlocks()`, which is called at module scope in `ChapterPage.tsx:16`.

---

## Renderer Specifications

### ImageBlock (`type: 'image'`)

Handles:
- Historical photographs (A-01, A-03, A-07, A-08, A-09)
- Document facsimiles (C-01, C-03, C-05)
- AI-generated explanatory diagrams (Diagram-1, -2, -3) — shown with purple "AI-generated diagram" badge
- Supplementary assets (SUP-01 through SUP-07)

Features:
- Image displayed with lazy loading, max-height 600px, object-contain
- AI-generated badge overlay (top-right) for `aiGenerated: true`
- Placeholder for missing assets — colour-coded by status (amber=requested, blue=draft, gray=recreated/archived)
- Metadata accordion: creator, source, reference, date, license, citation (Chicago), archive hierarchy, IIIF URL, editorial notes
- Evidence level badge next to credit line

Status handling:
| Block status | Render behaviour |
|---|---|
| `archived` + `url` present | Render image from local path |
| `archived` + no `url` | Show "Awaiting Acquisition" placeholder |
| `requested` | Show "Awaiting Acquisition" placeholder with description |
| `draft` | Show "Being Prepared" placeholder (blue) |
| `recreated` + `url` present | Render SVG from local path |

### MapBlock (`type: 'map'`)

Handles:
- Reference maps (B-01 British India, B-07 Princely States)
- Diagrammatic maps (B-02 Cabinet Mission Plan)
- Boundary maps (B-03 Radcliffe Line, B-05 Kashmir)
- Demographic maps (B-06 Religious Demography)
- Migration flow maps (B-04, Flow-1 Punjab, Flow-2 Bengal, Flow-3 Subcontinent)

Features:
- SVG displayed with max-height 500px, object-contain, white background
- "Contains disputed boundaries" badge (top-left amber) for `disputedBoundaries: true`
- Metadata row: map type, data source, credit, evidence level
- Metadata accordion: source, creator, license, cartographic strategy, boundary note (Book of Record #0003), citation, IIIF URL
- Disputed boundary note text: "Dashed lines mark disputed borders. Per Book of Record #0003, these must not be presented as settled fact."

### ChartBlock (`type: 'chart'`)

Handles:
- Bar chart (D-01 Death Toll Estimates)
- Combined chart (D-02 Refugee Flows)
- Timeline chart (D-03 Timeline 1945-1948)
- Stacked bar (D-04 Religious Composition)
- Comparison chart (D-05 Military Balance)

Features:
- SVG displayed with max-height 400px, object-contain
- Metadata row: chart type, data source, credit, evidence level
- Metadata accordion: source, license, chart strategy, citation, IIIF URL

---

## Asset Rendering Inventory

### Photos (10 canonical)

| ID | Block ID | File on disk | url in block | status | Renders? |
|----|----------|-------------|-------------|--------|----------|
| A-01 | b-vis-img-1 | ✅ | ✅ | archived | ✅ Image |
| A-02 | b-vis-img-2 | ❌ | ❌ | requested | ✅ Placeholder |
| A-03 | b-vis-img-3 | ❌ | ❌ | archived | ✅ Placeholder** |
| A-04 | b-vis-img-4 | ❌ | ❌ | requested | ✅ Placeholder |
| A-05 | b-vis-img-5 | ❌ | ❌ | requested | ✅ Placeholder |
| A-06 | b-vis-img-6 | ❌ | ❌ | requested | ✅ Placeholder |
| A-07 | b-vis-img-7 | ❌ | ❌ | archived | ✅ Placeholder** |
| A-08 | b-vis-img-8 | ❌ | ❌ | archived | ✅ Placeholder** |
| A-09 | b-vis-img-9 | ✅ | ✅ | archived | ✅ Image |
| A-10 | b-vis-img-10 | ❌ | ❌ | requested | ✅ Placeholder |

**Note: A-03, A-07, A-08 marked `archived` in block data but have no file on disk. These require Phase B rights verification.

### Maps (10)

| ID | Block ID | File on disk | url in block | status | Renders? |
|----|----------|-------------|-------------|--------|----------|
| B-01 | b-vis-map-1 | ✅ | ✅ | recreated | ✅ SVG |
| B-02 | b-vis-map-2 | ✅ | ✅ | recreated | ✅ SVG |
| B-03 | b-vis-map-3 | ✅ | ✅ | recreated | ✅ SVG |
| B-04 | b-vis-map-4 | ✅ | ✅ | recreated | ✅ SVG |
| B-05 | b-vis-map-5 | ✅ | ✅ | recreated | ✅ SVG |
| B-06 | b-vis-map-6 | ✅ | ✅ | recreated | ✅ SVG |
| B-07 | b-vis-map-7 | ✅ | ✅ | recreated | ✅ SVG |
| Flow-1 | b-vis-flow-1 | ✅ | ✅ | recreated | ✅ SVG |
| Flow-2 | b-vis-flow-2 | ✅ | ✅ | recreated | ✅ SVG |
| Flow-3 | b-vis-flow-3 | ✅ | ✅ | recreated | ✅ SVG |

### Documents (5 canonical)

| ID | Block ID | File on disk | url in block | status | Renders? |
|----|----------|-------------|-------------|--------|----------|
| C-01 | b-vis-doc-1 | ✅ | ✅ | archived | ✅ Image |
| C-02 | b-vis-doc-2 | ❌ | ❌ | requested | ✅ Placeholder |
| C-03 | b-vis-doc-3 | ❌ | ❌ | archived | ✅ Placeholder* |
| C-04 | b-vis-doc-4 | ❌ | ❌ | requested | ✅ Placeholder |
| C-05 | b-vis-doc-5 | ❌ | ❌ | archived | ✅ Placeholder* |

*C-03 and C-05 marked `archived` but no file on disk. C-03 (UNSCR 47) is evidence level A — priority for file retrieval.

### Charts (5)

| ID | Block ID | File on disk | url in block | status | Renders? |
|----|----------|-------------|-------------|--------|----------|
| D-01 | b-vis-chart-1 | ✅ | ✅ | recreated | ✅ SVG |
| D-02 | b-vis-chart-2 | ✅ | ✅ | recreated | ✅ SVG |
| D-03 | b-vis-chart-3 | ✅ | ✅ | recreated | ✅ SVG |
| D-04 | b-vis-chart-4 | ✅ | ✅ | recreated | ✅ SVG |
| D-05 | b-vis-chart-5 | ✅ | ✅ | recreated | ✅ SVG |

### Diagrams (3)

| ID | Block ID | File on disk | url in block | status | Renders? |
|----|----------|-------------|-------------|--------|----------|
| Diagram-1 | b-vis-diagram-1 | ✅ | ✅ | draft | ✅ SVG + AI badge |
| Diagram-2 | b-vis-diagram-2 | ✅ | ✅ | draft | ✅ SVG + AI badge |
| Diagram-3 | b-vis-diagram-3 | ✅ | ✅ | draft | ✅ SVG + AI badge |

### Supplementary (7)

| ID | Block ID | File on disk | url in block | status | Renders? |
|----|----------|-------------|-------------|--------|----------|
| SUP-01 | b-vis-sup-01 | ✅ | ✅ | archived | ✅ Image |
| SUP-02 | b-vis-sup-02 | ✅ | ✅ | archived | ✅ Image |
| SUP-03 | b-vis-sup-03 | ✅ | ✅ | archived | ✅ Image |
| SUP-04 | b-vis-sup-04 | ✅ | ✅ | archived | ✅ Image |
| SUP-05 | b-vis-sup-05 | ✅ | ✅ | archived | ✅ Image |
| SUP-06 | b-vis-sup-06 | ✅ | ✅ | archived | ✅ Image |
| SUP-07 | b-vis-sup-07 | ✅ | ✅ | archived | ✅ Image |

---

## Rendering Totals

| Category | Total | Renders Image/SVG | Placeholder | Placeholder (archived-no-file) |
|----------|-------|-------------------|-------------|-------------------------------|
| Photos | 10 | 2 | 5 | 3 |
| Maps | 10 | 10 | 0 | 0 |
| Documents | 5 | 1 | 2 | 2 |
| Charts | 5 | 5 | 0 | 0 |
| Diagrams | 3 | 3 | 0 | 0 |
| Supplementary | 7 | 7 | 0 | 0 |
| **Total** | **40** | **28** | **7** | **5** |

- **28 blocks render their actual content** (image or SVG)
- **7 blocks show informational placeholders** (for requested/draft assets)
- **5 blocks show a placeholder despite `status: archived`** — these are A-03, A-07, A-08, C-03, C-05, which have no file on disk

---

## Metadata Integration

All three renderers support:

| Feature | ImageBlock | MapBlock | ChartBlock |
|---------|-----------|---------|-----------|
| Caption | ✅ | ✅ | ✅ |
| Credit line | ✅ | ✅ | ✅ |
| Evidence level | ✅ | ✅ | ✅ |
| License | ✅ (accordion) | ✅ (accordion) | ✅ (accordion) |
| Provenance | ✅ (accordion) | ✅ (accordion) | ✅ (accordion) |
| Chicago citation | ✅ (accordion) | ✅ (accordion) | ✅ (accordion) |
| IIIF URL | ✅ (accordion) | ✅ (accordion) | ✅ (accordion) |
| Editorial notes | ✅ (accordion) | ❌ | ❌ |
| Archive hierarchy | ✅ (accordion) | ❌ | ❌ |
| AI-generated badge | ✅ | ❌ | ❌ |
| Disputed boundary badge | ❌ | ✅ | ❌ |
| Disputed boundary note | ❌ | ✅ | ❌ |

---

## Build Verification

| Check | Status |
|-------|--------|
| `npx tsc --noEmit` | ✅ Clean |
| `npm run build` | ✅ Passes (248 pages) |
| Block registration | ✅ All 18 types registered |
| No new `any` types | ✅ Strict typed interfaces per renderer |

---

## Known Issues

1. **A-03, A-07, A-08, C-03, C-05** marked `archived` but have no file in `public/images/library/`. The renderers show a placeholder. These files either never existed, were stored elsewhere, or were lost during reorganization. Phase B investigation needed.

2. **ImageBlock `note` field** is rendered but `notes` in the block data may contain diverse content (editorial notes, provenance notes, acquisition notes) — display is plain text without structure.

3. **Accessibility:** All `<img>` tags use `altText` from block data or fall back to `title`. Lazy loading enabled. No ARIA labels yet on figure/figcaption elements.

4. **Responsive:** SVG maps and images use `max-h-[500px]` / `max-h-[600px]` and `object-contain`. May need breakpoint adjustments for very small viewports.

5. **Placeholder styling:** Uses dashed borders and muted colours. Matches existing design system tokens but is not yet part of a formal component library.

---

## Recommendations

1. **Acquire A-04 and A-05** (Bourke-White/LIFE flagship photos) after pipeline validation — they are the two most historically significant visuals for Partition.
2. **Resolve A-03/A-08 file status** — find or re-acquire the original downloads for Calcutta Killing and Radcliffe portrait.
3. **Retrieve C-03 file** (UNSCR 47, evidence level A — highest confidence) from UN Digital Library.
4. **Add SVG inline rendering** for maps and charts to enable interactivity and better accessibility.
5. **Add `url` field** to blocks that are truly `archived` but missing a file path (A-03, A-07, A-08, C-03, C-05).

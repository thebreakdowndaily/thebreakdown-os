# The Breakdown — Global Premium Editorial Design System
## Earth-Inspired Visual Architecture & Presentation Standard

---

## 1. Creative Foundation: Earth as Canvas

The design philosophy of **The Breakdown** draws directly from the physical materials and sensory qualities of Earth:
- **Soil, Stone, Clay, Graphite** provide the physical foundations and structure.
- **Warm Ivory, Bone, Parchment** provide the reading material.
- **Ochre, Mineral Amber** provide the restrained editorial signal.
- **Forest & Moss** signal verified evidence.
- **Midnight Blue & Slate** frame investigative depth.

The Earth concept operates at the level of material, rhythm, typography, and atmosphere — never as an eco-cliché.

---

## 2. The Three Visual Environments

To balance discovery, sustained reading, and deep verification, The Breakdown establishes three distinct visual environments:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DARK DISCOVERY                                           │
│    Background: #0E0D0B (Deep Charcoal)                      │
│    Text:       #F0EBE1 (Warm Ivory)                         │
│    Surfaces:   Homepage, Global Navigation, Brand moments   │
│    Purpose:    Orientation, identity, visual authority      │
├─────────────────────────────────────────────────────────────┤
│ 2. WARM READING                                             │
│    Background: #141210 (Warm Graphite)                      │
│    Text:       #EDE7DC (Warm Paper)                         │
│    Surfaces:   Stories, Chapters, Investigations, Explainers│
│    Purpose:    Human immersion, sustained reading comfort   │
├─────────────────────────────────────────────────────────────┤
│ 3. DEEP RESEARCH                                            │
│    Background: #0A0908 (Cold Near-Black)                    │
│    Text:       #D4CEC7 (Precision Mineral)                  │
│    Surfaces:   Evidence Trails, Primary Documents, Data     │
│    Purpose:    Precision, analytical rigor, forensic focus  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Typographic Hierarchy (Three-Level System)

| Level | Typeface | CSS Variable | Primary Role |
|-------|----------|--------------|--------------|
| **Display** | Playfair Display | `--font-editorial`, `--font-display` | Headlines, chapter titles, pull quotes, lead metrics |
| **Reading** | Source Serif 4 | `--font-reading`, `--font-serif` | Long-form story body, chapter prose, deks, summaries |
| **Interface** | Inter | `--font-sans` | Navigation, metadata, status pills, labels, inputs |
| **Monospace**| JetBrains Mono | `--font-mono` | Claim statistics, timelines, timestamps, code |

### Scale Rules
- **Hero Headline**: `3rem` to `3.5rem` (clamp desktop), leading `1.06`.
- **Feature Title**: `1.75rem` to `2.25rem`, leading `1.2`.
- **Article Body**: `1.0625rem` (17px), line-height `1.82`, optimal reading measure `68ch`–`72ch`.
- **Category Overline**: `0.6875rem` (11px), uppercase, tracking `0.22em`, font-mono.
- **Evidence Pill**: `0.75rem` (12px), font-mono, with semantic symbols (`✓`, `◐`, `?`).

---

## 4. Evidence Color Semantics

Evidence states **never rely on color alone**. Every status pairs color with text labels and geometric indicators:

| State | Background | Border | Text | Symbol | Meaning |
|-------|------------|--------|------|--------|---------|
| **Verified** | `--color-evidence-verified` (#1E3D2A) | `#2D5A3D` | `#5AAD80` | `✓` | Primary source verified against official records |
| **Partial** | `--color-evidence-partial` (#3D2C0E) | `#6E5018` | `#C9A84C` | `◐` | Secondary source or contested claim |
| **Unresolved**| `--color-evidence-unresolved` (#3D1A1A) | `#6B3030` | `#C07070` | `?` | Insufficient evidence or disputed fact |

---

## 5. Signature Components

1. **`EvidenceStatus`** (`components/evidence/EvidenceStatus.tsx`):
   Visual progress and status breakdown of claims and documents.
2. **`SectionHeader`** (`components/ui/SectionHeader.tsx`):
   Unified editorial header primitive featuring the signature ochre hairline rule.
3. **`ReadingContainer`** (`components/layout/ReadingContainer.tsx`):
   Warm reading surface environment wrapper for article and chapter prose.
4. **`TrustBar`** (`components/home/trust/TrustBar.tsx`):
   Live platform metrics bar grounding editorial authority.

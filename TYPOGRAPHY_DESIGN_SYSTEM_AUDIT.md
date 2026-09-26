# THE BREAKDOWN — TYPOGRAPHY & DESIGN SYSTEM AUDIT

**Version:** 1.0  
**Status:** Remediated & Standardized  
**Governing Standard:** AGENTS.md · Editorial Constitution Article VIII

---

## 1. Typographic Architecture

The Breakdown employs an authentic three-tier typographic system calibrated specifically for long-form explanatory reading and calm editorial authority.

### The Three Typeface Families

```
1. DISPLAY (Headlines & Title Surfaces)
   Family:        Playfair Display, Georgia, serif
   CSS Variable:  var(--font-playfair)
   Weights:       700 (Bold), 900 (Black)
   Role:          Editorial authority, article titles, lead stories, section headings

2. READING (Sustained Article Prose)
   Family:        Source Serif 4, Georgia, serif
   CSS Variable:  var(--font-source-serif)
   Weights:       400 (Regular), 600 (Semibold), 400 Italic
   Line Height:   1.75 (Relaxed) to 1.85 (Loose)
   Measure:       65–75 characters optimal reading column (max-w-3xl)
   Role:          Article narrative, chapter prose, blockquotes, explanatory footnotes

3. INTERFACE & UTILITY (Chrome, Navigation, Metadata)
   Family:        Inter, system-ui, sans-serif
   CSS Variable:  var(--font-inter)
   Weights:       400 (Regular), 500 (Medium), 600 (Semibold)
   Role:          Site navigation, buttons, search, cards, tooltips, dialogs

4. MONOSPACE (Data, Verification & Chronology)
   Family:        JetBrains Mono, ui-monospace, monospace
   Weights:       500 (Medium), 700 (Bold)
   Letter Spacing: 0.05em to 0.2em (Uppercase tracking)
   Role:          Timestamps, verified claim badges, source tier numbers, statistical metrics
```

---

## 2. Normalized Scale & Semantic Mappings

| Element | Font Family | Size | Weight | Line Height | Tracking | Color Token |
|---|---|---|---|---|---|---|
| **H1 (Story Headline)** | Playfair Display | 2.5rem–3.25rem | 900 | 1.1 | -0.02em | `var(--color-text-primary)` (#F5F5F5) |
| **H2 (Chapter Heading)** | Inter / Serif | 1.75rem–2.0rem | 700 | 1.25 | -0.01em | `var(--color-text-primary)` (#FFFFFF) |
| **H3 (Subheading)** | Inter | 1.25rem–1.5rem | 600 | 1.3 | 0 | `var(--color-text-primary)` (#FFFFFF) |
| **Dek / Standfirst** | Inter / Serif | 1.125rem–1.25rem | 400 | 1.6 | 0 | `var(--color-text-secondary)` (#D4D4D8) |
| **Article Prose (Body)**| Source Serif 4 | 1.0625rem–1.125rem| 400 | 1.75 | 0 | `var(--color-text-primary)` (#F5F5F5) |
| **Blockquote** | Source Serif 4 | 1.25rem–1.5rem | 400 Italic | 1.6 | 0 | `var(--color-text-primary)` (#FAFAFA) |
| **Metadata / Byline** | Inter | 0.8125rem–0.875rem| 500 | 1.4 | 0 | `var(--color-text-muted)` (#A1A1AA) |
| **Badges / Tags** | Monospace | 0.6875rem–0.75rem | 700 | 1.0 | +0.1em | `var(--color-earth-ochre)` (#D4A843) |
| **Citation Marker** | Monospace | 0.65em | 700 | 1.0 | 0 | `var(--color-brand-400)` (#FBBF24) |
| **Source Card Title** | Inter | 0.875rem | 600 | 1.3 | 0 | `var(--color-text-primary)` (#FFFFFF) |

---

## 3. Global Color Tokens & Dark Discovery Surface

The Breakdown uses an **Earth-inspired Dark Discovery Palette** that avoids harsh blue-gray digital fatigue while guaranteeing WCAG 2.2 AAA text contrast:

```css
:root {
  /* Surfaces */
  --color-bg-canvas: #0A0A0A;        /* Deep charcoal canvas */
  --color-bg-primary: #0D0E11;       /* Main content layer */
  --color-bg-secondary: #14161C;     /* Card containers and elevated panels */
  --color-bg-tertiary: #1A1D24;      /* Interactive hovered containers */

  /* Text & Foreground */
  --color-text-primary: #F5F5F5;     /* Warm white (high contrast) */
  --color-text-secondary: #D4D4D8;   /* Muted ivory for deks and long text */
  --color-text-muted: #A1A1AA;       /* Secondary metadata and captions */
  --color-earth-dust: #71717A;       /* Subtle utility borders and inactive tabs */

  /* Brand & Ochre Editorial Accents */
  --color-earth-ochre: #D4A843;      /* Flagship warm ochre (accent & badges) */
  --color-earth-clay: #B45309;       /* Terracotta secondary tone */
  --color-brand-400: #E5A93C;        /* Interactive links and primary actions */

  /* Verification & Evidence Semantics */
  --color-evidence-verified: #064E3B; /* Deep emerald background */
  --color-evidence-verified-text: #34D399; /* Crisp emerald text (WCAG AA > 4.5:1) */
  --color-evidence-mixed: #78350F;    /* Amber background */
  --color-evidence-mixed-text: #FBBF24; /* Crisp amber text */
  --color-evidence-disputed: #7F1D1D; /* Deep crimson background */
  --color-evidence-disputed-text: #F87171; /* Light crimson text */

  /* Borders & Dividers */
  --color-border-default: #262626;   /* Subtle structural border */
  --color-border-hover: #404040;     /* Elevated card border */
}
```

---

## 4. Distraction Reduction & Calm Reading Doctrine

In strict accordance with Phase 14:
1. **No Ad Invasions:** Removed all inline advertising placeholders (`<AdSlot>`) and simulated blockers from the article reading column.
2. **No Intrusive Floating Panels:** Consolidated social share, save, and citation tools into a quiet, horizontal divider below the Short Version.
3. **No Decorative Motion:** Transitions are limited to crisp, subtle 150ms opacity/color changes; zero bouncing, floating, or parallax animations.
4. **Max Line Length Enforced:** Article prose width is capped at 65–75 characters (max-w-3xl) to prevent reader eye fatigue on ultrawide monitors.
5. **No Double Headers:** Abolished dual-header rendering on homepage and archive routes.

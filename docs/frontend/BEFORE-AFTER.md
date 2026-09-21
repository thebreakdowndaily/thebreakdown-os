# The Breakdown — Before & After Architectural Comparison

---

## 1. Global Visual Language

| Dimension | Before Redesign | After Redesign (Earth-Inspired) |
|-----------|-----------------|---------------------------------|
| **Color Palette** | Pure black (`#0A0A0A`) with generic amber (`#f59e0b`). Monotone throughout. | Soil, charcoal, warm graphite, ochre, mineral stone, atmospheric slate, and forest green. |
| **Environments** | Single monolithic dark mode applied everywhere. | Three distinct visual environments: **Dark Discovery** (home/nav), **Warm Reading** (articles), **Deep Research** (evidence). |
| **Typography** | Inter + Playfair Display used inconsistently. Line lengths and heading scales felt uniform. | Three-level system: **Playfair Display** (display/headlines), **Source Serif 4** (dedicated long-form reading body), **Inter** (quiet UI/interface), **JetBrains Mono** (evidence data). |
| **Card Layouts** | Symmetrical 3-column cards repeated across every single section. | Asymmetrical compositions: 60/40 splits, horizontal mineral strips, and archival numbered layouts. |

---

## 2. Key Surface Evolution

### Navigation
- **Before**: Inconsistent navigation links (`Chapters`, `Explainers`, `Trackers`, `Topics`, `Data`, `About`). Generic text styling.
- **After**: Product-aligned IA (`Library`, `Investigations`, `Explainers`, `Topics`, `Data`, `The Brief`). Stacked editorial wordmark lockup. Streamlined search trigger with `/` hotkey.

### Hero Section
- **Before**: 2-column box with text left and a generic analytics card right. Hardcoded hex colors.
- **After**: Full-width editorial hero. Responsive Playfair Display 3.5rem headline. Source Serif 4 dek. Inline evidence indicators. Integrated knowledge panel with historical period timeline strip and evidence grade rating.

### Trust Bar
- **Before**: Light-gray background (`bg-gray-50`) clashing directly with the dark page canvas.
- **After**: Dark charcoal bar with dual-channel verification signals (icons + text), monospace metadata, and link to live Trust Dashboard.

### The Brief (Short Version)
- **Before**: Standard 4-card grid resembling generic blog summaries.
- **After**: Numbered editorial briefing format (`01`, `02`, `03`) with category color-coding (moss, atmosphere, clay) and rapid contextual takeaways.

### Knowledge Library
- **Before**: Plain card with generic border styling.
- **After**: Archival layout with large chapter numerals (`01`, `02`), gold-gradient top rule, evidence grade badges, and distinct status pills (`In Research`, `Planned`).

### Footer
- **Before**: Simple 4-column link directory with inline `<style>` tag.
- **After**: Institutional footer featuring wordmark, core institutional mission declaration, newsletter CTA, legal and governance directories, and copyright attribution.

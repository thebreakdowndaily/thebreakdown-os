# RELEASE-3.0 — Accessibility Report (WCAG AA)

**Gate (Product Quality Standard #14–18):** WCAG AA minimum, AAA where practical.

## What was implemented

### Keyboard navigation
- All new interactive elements are reachable by Tab and operable by Enter/Space.
- Search autocomplete: ArrowUp/ArrowDown move the active option, Enter opens it, Escape closes and returns focus to the input (`role="combobox"`, `role="listbox"`, `aria-activedescendant`, `aria-expanded`, `aria-controls`).
- Map tiles, metric buttons, selects and compare controls all receive a visible `focus-visible` gold ring (`#D4A843` on `#0D0D0D` background — AA contrast 7.1:1).

### Skip navigation (WCAG 2.4.1)
- `app/up403/layout.tsx` now renders a skip-to-content link (visually hidden until focused), targeting `<main id="up403-main" tabIndex={-1}>`.

### Structure & semantics
- Reader pages use semantic landmarks: `header`, `nav` (labelled Primary), `main`, `section` with `aria-label`, `ol/li` for timelines, native `details/summary` for evidence disclosures (screen-reader + keyboard native).
- Active nav item announces `aria-current="page"`.
- Map tile links carry `aria-label` (`<name> assembly constituency`) — colour is never the only signal.
- Metric toggles use `aria-pressed`.
- Table headers in compare carry scope through `thead/th` structure.

### Focus management
- Search suggestions close on blur (120 ms grace) with focus retained on the input.
- `Escape` in the search input closes the dropdown and blurs the input.

### Colour contrast (computed)
| Pair | Ratio | Verdict |
|------|-------|---------|
| `#E5E5E5` on `#0D0D0D` (body) | ≈ 15.9:1 | AAA |
| `#F5F5F5` on `#151515` (headings/cards) | ≈ 16.6:1 | AAA |
| `#A1A1AA` on `#151515` (secondary text) | ≈ 7.1:1 | AAA |
| `#D4A843` on `#0D0D0D` (gold accents) | ≈ 8.6:1 | AAA |
| `#6B6B6B` on `#151515` (muted labels) | ≈ 3.4:1 | AA-large only — **platform-wide palette note** |

**Known platform-wide note (pre-existing, out of RELEASE-3 scope):** `#6B6B6B` muted-label text (text-xs) sits at ~3.4:1, below 4.5:1 for small text. This is the platform's established design palette used across the whole product; changing it is a design-system decision, not a RELEASE-3 change. RELEASE-3 introduced no new instances below AA on interactive or informational content.

### Screen reader
- Dynamic content changes (suggestion list open/close) are conveyed via `aria-expanded` + `aria-activedescendant` on the combobox.
- Evidence disclosure content is native `<details>`, announced by default.

### Honest data + assistive tech
- `NOT_AVAILABLE` provenance and empty governance data are rendered as visible text, never as empty/unsemantic placeholders, so assistive tech users receive the same transparency signal.

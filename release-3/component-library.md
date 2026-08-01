# RELEASE-3.0 — Component Library Additions

New and upgraded reader components. All new components carry their governing traceability:
- Reader pages → `release-3/RELEASE-3-PLAN.md` (Module map)
- Evidence disclosure → Editorial Constitution v1.1 (evidence transparency) + RELEASE-3 Module 6
- Analytics wrappers → AGENTS.md Analytics rule (`PluginAnalyticsService` only)

## `components/up403/evidence.tsx` (NEW)

- `EvidenceBadge({ field })` — small gold badge wrapping a native `<details>/<summary>` disclosure; looks up `getProvenanceForField(field)` from `lib/up403/provenance.ts` and renders Field authority / Dataset source / Quality / Dataset version / Research cutoff / Verification date.
- `DatasetProvenance({ record })` — full record provenance block for page footers.
- Zero JavaScript (native disclosure), server-component safe, keyboard and screen-reader accessible.

## `components/up403/nav-link.tsx` (NEW)

Client `Up403NavLink` using `usePathname` for `aria-current="page"` active state in the reader header nav.

## `lib/up403/format.ts` (NEW) + `lib/up403/slug.ts` (NEW)

- `format.ts` — server-safe pure formatters: `partyColorClass`, `dataStatusBadge`, `formatNumber`, `formatPct`, `formatInteger`, `winnerRow`. Single source of truth.
- `slug.ts` — `toSlug` / `fromSlug` for the canonical-ID ↔ URL-slug mapping used by all reader routes.
- `components/up403/data.ts` and `ui.tsx` re-export from `format.ts` so existing 2B import surfaces remain valid. No formatting logic duplicated.

## `lib/up403/reader-events.ts` (NEW, `'use client'`)

Thin wrapper around the existing `PluginAnalyticsService` — `trackReaderEvent(type, metadata)` with fail-silent try/catch. No new analytics infrastructure, no analytics provider calls outside plugins.

## Upgrades

- **`SearchPanel.tsx`** — autocomplete dropdown (`role="combobox"/listbox"`, `aria-activedescendant`, ArrowUp/Down/Enter/Escape), grouped MLA/MP/party highlights, top-match cards → `/up403/{slug}`, focus-visible ring, result-count chip, `up403_search_submit`/`up403_search_select` events.
- **`ComparePanel.tsx`** — `MAX_COMPARE` 10→5 (per plan: compare 2–5), header column links to reader profiles, `up403_compare_seat_added/removed/export` events, focus-visible states.
- **`map.tsx`** — metric toggle / region + value filters / legend / dimmed non-matches / tile analytics / focus-visible states.
- **`app/up403/layout.tsx`** — skip-to-content link, `main` as skip target, `aria-current` active nav, focus-visible rings.

## Component-size discipline

Every new/changed component stays under the 250-line comfort threshold (largest, `SearchPanel.tsx`, ≈ 240 lines). No refactors triggered.

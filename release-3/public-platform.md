# RELEASE-3.0 — Public Platform

**Status:** Shipped (pending certification)
**Governing documents:** Editorial Constitution v1.1 · AGENTS.md v1.0 · Baseline v1.0.0-chapter1 · RELEASE-3-PLAN.md
**Freeze target:** The Breakdown Intelligence Platform v1.0

## What a first-time reader sees

Landing at `/up403` a reader now meets a public home page — not a research dashboard — and can:

1. Search any constituency, MLA, MP, district or party from the hero (autocomplete, keyboard-navigable).
2. Read the state overview: 403 seats, 69 districts, 18 divisions, 3 regions, 80 PC links, 3 elections.
3. See assembly control (party seats) and political DNA distribution for the state.
4. Open any constituency profile at `/up403/up-ac-001` (403 static pages) with election history, DNA, representation, economy, development and governance — every figure carrying a one-click source disclosure.
5. Browse an interactive schematic map filtered by party / DNA / competitiveness.
6. Compare 2–5 constituencies side by side and export CSV.
7. Read data-driven story cards (native disclosure, no client-side computation).
8. Find the research workspace (explore, query, collections, evidence, research profiles) behind one "Research tools" link.

## Evidence-first guarantees preserved

- Every statistic on reader pages renders a source disclosure: Field authority, Dataset source, Quality, Dataset version, Research cutoff, Verification date. Zero-JS native `<details>`.
- Data gaps are surfaced honestly through the `DATA_GAPS` registry (governance issues = 0, disaster risk = empty, reservation = GENERAL) — `NOT_AVAILABLE` is displayed as a transparency statement, never hidden.
- No opinion, no prediction, no editorializing on any reader surface.
- No canonical data changed. No API routes modified.

## Journey instrumentation

Reader journeys now fire privacy-first events through `PluginAnalyticsService` (existing infrastructure, no new analytics layer):

- `up403_search_submit` / `up403_search_select` — journey start
- `up403_map_metric_toggle` / `up403_map_tile_open` — exploration
- `up403_compare_seat_added` / `up403_compare_seat_removed` / `up403_compare_export` — structured comparison

These map to the Understanding Metrics funnel (Reader starts → Opens Evidence → Returns → Completes) without page-view vanity metrics.

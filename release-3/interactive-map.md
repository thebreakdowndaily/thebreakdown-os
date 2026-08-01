# RELEASE-3.0 — Interactive Map

## Route
`/up403/map` — static page wrapping `components/up403/map.tsx` (client, data via `useUp403Data`).

## Behaviour

- **Colour metrics** toggle: Party (MLA), Political DNA, Competitiveness. Metric buttons are `aria-pressed` toggle groups.
- **Filters**: region (3 regions) and value (party / DNA / class). Non-matching tiles dim to 15% opacity instead of disappearing — the reader retains a sense of the full state.
- **Legend** renders per metric with swatches.
- **Tiles**: one per constituency, grid-arranged per region, hover `title` with name + current value, click → `/up403/{slug}`.
- **Honest schematic**: the frozen dataset has no boundary geometry, so the map is explicitly a grid-arranged schematic, disclosed on-page in a footnote. Colours derive from the dataset (DNA = UP403 DNA Algorithm v1.0.0, competitiveness = UP403 Competitiveness Algorithm v1.0.0).

## Accessibility (map-specific)

- Tiles are real links with `aria-label` per constituency.
- `focus-visible` rings (gold `#D4A843`) on tiles, metric buttons and selects.
- Colour is never the only signal: `title`, hover label and `aria-label` carry the value textually.

## Analytics

- `up403_map_metric_toggle` — metric changes.
- `up403_map_tile_open` — tile click, payload includes constituency id, name, party, metric.

## Decisions

- Schematic over geographic: boundary geometry does not exist in the frozen dataset, and fabricating it would violate the evidence-first mandate.
- Dim instead of remove: preserves spatial context while filtering.

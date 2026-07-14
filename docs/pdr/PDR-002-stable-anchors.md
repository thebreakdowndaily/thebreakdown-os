# PDR-002 — Stable Section Anchors

## Problem

Section anchors are derived from heading text via `slugifyHeading(text)`. If an editor changes a heading ("Historical Context" → "Historical Background"), all existing deep links (`#historical-context`) break. External references, saved links, and browser history for the old URL fragment stop working.

## Decision

Log as a deferred enhancement. Not blocking Reader Orientation v1.0.

The preferred approach is to use the Knowledge Block's canonical `id` (e.g., `b-h-empire`) for the DOM `id` attribute instead of a slugified heading. Block IDs are stable by design — they never change even when the displayed heading changes.

Implementation sketch:
- Pass `block.id` to `HeadingBlock` via `BlockComponentProps.id`
- HeadingBlock renders `id={blockId}` on the heading element
- `extractTocItems` uses `block.id` as `TocItem.id` instead of `slugifyHeading(text)`
- Deep links use stable IDs like `#b-h-empire` instead of `#the-end-of-empire`

This mirrors how GitHub Docs, MDN, and GitBook handle anchors.

## Status

- [ ] Add `id` field to `BlockComponentProps` interface
- [ ] Pass `block.id` from `KnowledgeRenderer` to block renderers
- [ ] Update `HeadingBlock.tsx` to use `id` prop instead of `slugifyHeading(text)`
- [ ] Update `extractTocItems` to use block ID
- [ ] Test that existing deep links redirect or break gracefully

## Deliberately Out of Scope for PDR-002

- Redirect from old slugified IDs to new stable IDs
- `generateStaticParams` for old anchor URLs
- Backward-compat hash redirect middleware

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| 14 Jul 2026 | Initial decision — deferred enhancement | CTO Review |

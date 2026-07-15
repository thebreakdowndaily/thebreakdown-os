# Phase 7 — Reader Flow

**Principle:** Every interaction returns the reader exactly where they left. No page jumps. No scroll displacement. No "back to top." The story never interrupts itself.

---

## The Four-State Cycle

```
READ
 │
 ▼
VISUAL  ──►  INSPECT
                 │
                 ▼
             RETURN
                 │
                 ▼
             READ (same position)
```

The cycle repeats for every visual beat. The reader can skip any state — INSPECT is always optional, RETURN is always automatic.

---

## State Definitions

### 1. READ

| Property | Value |
|----------|-------|
| What the reader is doing | Reading narrative prose, scrolling vertically |
| Visual state | Rendered at default size in the flow |
| Reader action to advance | Scroll past the visual, or stop at it |
| Reader action to enter INSPECT | Tap/click on visual |

**Invariant:** The visual is rendered inline at a size that does not require scrolling past it to continue reading. The reader can always choose to ignore the visual and continue the narrative.

### 2. VISUAL

| Property | Value |
|----------|-------|
| What the reader is doing | Looking at the visual in its default state |
| Visual state | The template is fully rendered (image/map/chart + caption + credit + evidence + claims) |
| Reader action to enter INSPECT | Tap trigger area (image for lightbox, map for zoom, etc.) |
| Reader action to return to READ | Scroll past, or tap elsewhere on page |

**Invariant:** All information is visible at default state. No interaction is required to understand the visual. INSPECT adds depth — it does not unlock meaning.

### 3. INSPECT

| Property | Value |
|----------|-------|
| What the reader is doing | Exploring the visual in depth (lightbox, zoom, layer toggle, document scan, chart hover) |
| Visual state | Expanded overlay, lightbox, or panel — depending on interaction type |
| Reader action to return | Close button, tap outside, Escape key |
| Position preserved | Scroll position, active layer state, zoom level |
| History preserved | Open modals in stack (claim panel within lightbox) must all be dismissible to return to READ in one action |

**Invariant:** No modal chain deeper than 2 levels (lightbox → claim panel). A third tap (e.g., claim → source) replaces the current modal rather than stacking. This guarantees RETURN is always one action away.

### 4. RETURN

| Property | Value |
|----------|-------|
| What the reader is doing | Returning to narrative |
| Visual state | Returns to default display state within the flow |
| Position | Exactly the same scroll position as when INSPECT was entered |
| Visual focus | None — focus returns to the narrative text, not the visual |
| Animation | None — no fade, no slide, no zoom transition. Instant snap. |

**Invariant:** The reader cannot visually detect that a return happened. The narrative is exactly where they left it. No loading spinners, no re-layout, no flash.

---

## State Preservation Rules

### Rule 1 — Scroll position is preserved verbatim

When the reader opens a lightbox, `document.documentElement.scrollTop` is frozen. When they close it, the value is restored before anything else renders. No layout shift during the interaction.

### Rule 2 — Modal state is not persistent

If the reader had a claim panel open within a lightbox, closed the lightbox, and reopened it — the claim panel is closed. Each INSPECT session starts fresh at depth 1. Persistent modal state would violate the expectation that "close" means "return to exactly where you were."

Exception: Zoom level and layer toggles within Orientation visuals persist for the duration of the READ session. If the reader zooms into a map, scrolls past it, then scrolls back up — the zoom level is preserved. This is because map exploration is spatial, not hierarchical.

### Rule 3 — RETURN resets interaction state, not visual state

The visual returns to its default display, but any data the reader discovered during INSPECT (e.g., a claim they read, a source they examined) remains in their browser's session memory. If they re-enter INSPECT, the data is already loaded — no reload required.

### Rule 4 — Mobile and desktop share the same rules

| Device | READ | VISUAL | INSPECT | RETURN |
|--------|------|--------|---------|--------|
| Desktop | Scroll with mouse/trackpad | Visual inline, full width | Lightbox overlay. Escape closes. | Same scroll position |
| Mobile | Scroll with touch | Visual inline, full width | Lightbox fills viewport. Swipe down closes. | Same scroll position |
| Tablet | Scroll with touch | Visual inline, responsive width | Lightbox overlay. Tap outside closes. | Same scroll position |

No device-specific behaviour changes. The flow is identical. Only the trigger gestures differ.

---

## Edge Cases

| Edge case | Behaviour |
|-----------|-----------|
| Reader opens lightbox, resizes window, closes lightbox | Return to READ at same relative scroll position. Content reflows naturally — the reader is not at the exact pixel offset but at the same narrative position. |
| Reader is in INSPECT (zoom level 4, layer X active), closes, reopens | Zoom resets to default. Layer resets to default. Each INSPECT session is independent. |
| Reader opens claim panel within lightbox, taps source link (depth 2) | Source card replaces claim panel in the same space. Going back from source returns to VISUAL default, not to claim panel. Only 2 levels of depth. |
| Reader taps visual while page is still loading | No interaction possible until visual is fully rendered. Loading state is non-interactive. |
| Reader opens lightbox, phone screen turns off, phone unlocks | Lightbox is dismissed. Reader returns to READ at the preserved scroll position. Screen lock is treated as session interruption — RETURN preserves position. |
| Reader opens lightbox, then browser back button | Browser back closes the lightbox (history.pushState on lightbox open). Reader returns to READ position. |

---

## Applied — All 10 Visual Beats

| Beat | Asset | READ position | INSPECT trigger | INSPECT depth | RETURN guarantee |
|------|-------|--------------|-----------------|---------------|-----------------|
| 1 | SUP-01 | Last sentence before beat 1 visual | Tap photo | 2 max (lightbox → claims) | Same scroll pos |
| 2 | D-03 | Last sentence before beat 2 visual | Tap event | 2 max (event detail → claims) | Same scroll pos |
| 3 | B-06 | Last sentence before beat 3 visual | Tap map | 2 max (zoom → tap region → claims) | Same scroll pos, zoom resets |
| 4 | B-02 | Last sentence before beat 4 visual | Tap map | 2 max | Same scroll pos, zoom resets |
| 5 | A-03 | Last sentence before beat 5 visual | Tap photo | 2 max (lightbox → claims) | Same scroll pos |
| 6 | A-01 | Last sentence before beat 6 visual | Tap photo | 2 max (lightbox → claims) | Same scroll pos |
| 7 | B-03 | Last sentence before beat 7 visual | Tap map | 2 max (zoom → infrastructure → claims) | Same scroll pos, zoom resets |
| 8 | D-02 + D-01 | Last sentence before beat 8 visual | Hover chart elements | 2 max (hover → tap methodology → dataset) | Same scroll pos |
| 9 | D-05 | Last sentence before beat 9 visual | Hover chart elements | 2 max (hover → tap methodology → dataset) | Same scroll pos |
| 10 | A-06 | Last sentence before beat 10 visual | Tap document thumbnail | 2 max (full scan → highlighted section → claims) | Same scroll pos |

---

## Summary

```
READ  ──►  VISUAL (default, inline)  ──►  INSPECT (overlay, optional)  ──►  RETURN (instant, same position)
   │              │                              │                              │
   │              │                              │                              │
   reader    visual in flow,           always 1-2 levels deep           scroll position frozen,
 scrolls    all info visible,           of depth. close =               restored before render.
   past    no interaction              one action back.                 no animation, no flash.
           required.
```

The story is a single continuous scroll. Visuals are part of the narrative, not interruptions. Every interaction is a temporary depth dive that returns the reader to the exact word they left — as if nothing happened.

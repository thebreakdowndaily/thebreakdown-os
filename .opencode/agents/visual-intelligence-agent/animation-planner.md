# Animation Planner — Timed Visual Sequences

## Purpose

When the decision engine determines that a process, movement, or story needs to be shown step-by-step over time, this module plans an animated sequence. Animations are **never GIFs** — they are planned as structured timelines with steps, durations, and transitions.

## When to Animate

| Situation | Animate? | Type |
|---|---|---|
| Money flows through system stages | ✅ | Flow animation |
| Budget moves from center → state → district → village → worker | ✅ | Cascade animation |
| Disease spreads across regions over time | ✅ | Spreading animation |
| Policy impact evolves over years | ✅ | Progressive reveal |
| Election results update over counting rounds | ✅ | Data animation |
| Historical territorial changes | ✅ | Map animation |
| Simple step-by-step explanation | ❌ | Use infographic cards instead |
| Static comparison | ❌ | Use chart instead |

## Animation Types

### 1. Cascade / Flow Animation
Best for: budget flow, supply chain, hierarchical process
```
Step 1: Budget allocated (Centre) → appears
Step 2: Flows to States → animated path
Step 3: Flows to Districts → animated path
Step 4: Reaches Villages → animated path
Step 5: Reaches Workers → final pulse
```

### 2. Progressive Reveal
Best for: timeline of events, policy evolution, conflict progression
```
Frame 1: Base state (map/chart)
Frame 2: Event 1 appears with label
Frame 3: Event 2 appears with label
Frame 4: Event 3 appears with label
Frame 5: Final state with all events + summary
```

### 3. Data Animation
Best for: changing metrics over time, race charts, growing trends
```
2000: Data state 1
2005: Data state 2 (bars/lines transition)
2010: Data state 3
2015: Data state 4
2020: Data state 5
2024: Final state
```

### 4. Map Animation
Best for: territorial changes, route evolution, spread patterns
```
Phase 1: Base map
Phase 2: Region 1 changes color
Phase 3: Region 2 changes color
Phase 4: Region 3 changes color
Phase 5: Final boundary
```

## Animation Timeline Format

```json
{
  "animationId": "uuid",
  "type": "cascade | progressive-reveal | data-animation | map-animation",
  "purpose": "What this animation explains that a static image cannot",
  "duration": 12,
  "steps": [
    {
      "step": 1,
      "time": 0,
      "duration": 2,
      "action": "show-base",
      "target": "map-or-chart-or-svg",
      "description": "Show the base state",
      "easing": "ease-out",
      "transition": "fade-in"
    },
    {
      "step": 2,
      "time": 2,
      "duration": 3,
      "action": "animate-flow | reveal-element | update-data | change-color",
      "target": "element-id",
      "description": "Show money flowing from Centre to States",
      "easing": "ease-in-out",
      "transition": "slide-path | crossfade | morph"
    },
    {
      "step": 3,
      "time": 5,
      "duration": 3,
      "action": "animate-flow | reveal-element | update-data | change-color",
      "target": "element-id",
      "description": "Show money flowing from States to Districts",
      "easing": "ease-in-out",
      "transition": "slide-path"
    }
  ],
  "controls": {
    "autoplay": true,
    "loop": false,
    "showTimeline": true,
    "showProgress": true,
    "allowSeek": true,
    "playPauseButton": true,
    "speedControl": [0.5, 1, 1.5, 2]
  },
  "caption": "Plain-English explanation of the animation sequence.",
  "altText": "Step-by-step description of what the animation shows.",
  "theme": "dark",
  "responsive": true,
  "lazyLoad": true
}
```

## Transition Types

| Transition | Best For |
|---|---|
| `fade-in` | Elements appearing for the first time |
| `slide-path` | Animated flow along a curved path |
| `crossfade` | Changing between states (maps) |
| `morph` | Shape change (territory, boundaries) |
| `scale-in` | Data points appearing (bubbles, bars) |
| `draw` | SVG path being drawn (routes, borders) |
| `color-transition` | Heatmap / choropleth changing over time |

## Design Rules

1. **Maximum 12 seconds** total animation duration.
2. **Maximum 10 steps** per animation.
3. **Every step must have a clear description** of what happens.
4. **Controls must be visible**: play/pause, progress bar, speed selector.
5. **Autoplay is optional** — reader must be able to pause.
6. **No flashing** — animation must respect `prefers-reduced-motion`.
7. **Progressive enhancement**: static fallback if JS disabled.
8. **Loops only for data that naturally cycles** (e.g., water cycle, trade routes).

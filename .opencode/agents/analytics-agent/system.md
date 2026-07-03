# Analytics Engine — System Specification v1.0

## Identity

The Analytics Engine is the **Learning Analyst**. It replaces traditional page-view analytics with a learning-centered measurement framework. It tracks what readers actually engage with inside a story, not just that they loaded the page.

## Core Philosophy

> Don't just measure page views. Measure learning.

Page views tell you *how many* people came. Learning metrics tell you *what* they understood, *where* they got stuck, and *what* they found valuable.

## The 9 Learning Metrics

### Engagement Metrics (inside the story)

| # | Metric | What It Measures | Why It Matters |
|---|--------|-----------------|----------------|
| 1 | **Time on Section** | Seconds spent on each story section | Identifies which sections are most/least engaging |
| 2 | **Scroll Completion** | % of story height the reader reached | Detects where readers drop off |
| 3 | **Chart Interaction** | Hover/click/zoom events on charts | Measures if data visualizations are being used |
| 4 | **Timeline Interaction** | Click events on timeline entries | Shows if chronology is being explored |
| 5 | **FAQ Expansion** | Which FAQs get opened/closed | Reveals what readers are actually curious about |

### Discovery Metrics (outside the story)

| # | Metric | What It Measures | Why It Matters |
|---|--------|-----------------|----------------|
| 6 | **Search Terms** | Internal search queries with results | Identifies what readers want to learn about |
| 7 | **Return Visits** | Readers returning within 7 days | Measures content stickiness |
| 8 | **Shares** | Social shares per medium | Measures content's value as reference material |
| 9 | **Bookmarks** | Save-for-later events | Measures perceived future value |

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Client-Side Tracking               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │useSection │  │useScroll │  │useChartInter. │  │
│  │ Tracking  │  │ Tracking │  │  action      │  │
│  ├──────────┤  ├──────────┤  ├──────────────┤  │
│  │useFAQ    │  │useSearch │  │TrackedStory  │  │
│  │ Tracking │  │ Tracking │  │  Wrapper     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│         │           │              │            │
│         ▼           ▼              ▼            │
│     ┌─────────────────────────────────────┐     │
│     │     analytics.ts (Core Engine)      │     │
│     │  • Batches events (every 5s)         │     │
│     │  • Debounces rapid events            │     │
│     │  • Attaches session ID + timestamp   │     │
│     │  • POSTs to /api/analytics           │     │
│     └─────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
                        │
                  Batch POST
                        ▼
┌─────────────────────────────────────────────────┐
│              Server-Side Analytics               │
│  ┌─────────────────────────────────────────────┐ │
│  │     /api/analytics (POST/GET)               │ │
│  │  • Validates events                         │ │
│  │  • Aggregates per-story metrics             │ │
│  │  • Anonymizes (no IP, no user ID)           │ │
│  │  • Stores in memory engine                  │ │
│  └─────────────────────────────────────────────┘ │
│                        │                         │
│         ┌──────────────┼──────────────┐          │
│         ▼              ▼              ▼          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │Story       │ │Search      │ │Improvement   │ │
│  │ Analytics  │ │ Analytics  │ │ Signals      │ │
│  │ per slug   │ │ per query  │ │ per story    │ │
│  └────────────┘ └────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              Feedback Loop                       │
│  ┌─────────────────────────────────────────────┐ │
│  │      Story Improvement Engine (weekly)       │ │
│  │  • Finds low-engagement sections             │ │
│  │  • Identifies high-dropoff points            │ │
│  │  • Recommends: shorter sections? more        │ │
│  │    visuals? better hooks? clearer language?  │ │
│  │  • Generates "Improvement Report" per story  │ │
│  │  • Feeds into editorial-review-agent         │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Core Workflow

### Phase 1: Collection (Client-Side)

Every story page loads the Tracking Engine which:
1. Generates an anonymous session ID (stored in localStorage, expires 24h)
2. Observes which sections are visible (IntersectionObserver)
3. Records scroll depth on every scroll event (debounced)
4. Wraps ChartRenderer to capture hover/click/zoom
5. Wraps Timeline to capture event clicks
6. Wraps FAQ to capture open/close
7. Monitors URL for search queries
8. Detects return visits via session cookie

Events are batched and sent every 5 seconds to `/api/analytics`.

```typescript
// Example event batch
{
  sessionId: "sess_abc123",
  events: [
    { type: "section_view", storySlug: "mgnrega-reform", sectionId: "hero", duration: 12000, ts: "..." },
    { type: "scroll", storySlug: "mgnrega-reform", depth: 0.45, maxDepth: 0.45, ts: "..." },
    { type: "chart_interaction", storySlug: "mgnrega-reform", chartId: "chart-0-line", action: "hover", ts: "..." },
  ]
}
```

### Phase 2: Aggregation (Server-Side, every 15 min)

The server aggregates raw events into per-story analytics:

```
AggregateStoryAnalytics {
  storySlug: "mgnrega-reform",
  period: { start: "...", end: "..." },
  totalReaders: 1423,
  
  // Engagement
  avgTimeOnPage: 287000, // ms
  avgScrollCompletion: 0.73,
  sectionEngagement: {
    "hero": { avgTime: 8500, totalEntries: 1400, dropoffRate: 0.02 },
    "executive-summary": { avgTime: 12000, totalEntries: 1350, dropoffRate: 0.08 },
    "quick-facts": { avgTime: 15000, totalEntries: 1240, dropoffRate: 0.05 },
    "evidence": { avgTime: 45000, totalEntries: 980, dropoffRate: 0.15 },
    "charts": { avgTime: 32000, totalEntries: 850, dropoffRate: 0.10 },
    "faq": { avgTime: 28000, totalEntries: 620, dropoffRate: 0.03 },
  },
  
  // Interactions
  chartInteractions: 2341,
  timelineInteractions: 892,
  faqExpansions: 456,
  popularFAQIndices: [2, 0, 1], // which FAQs were most expanded
  
  // Discovery
  searchReferrals: 234,
  returnVisitorRate: 0.31,
  sharesPerMedium: { twitter: 89, linkedin: 45, whatsapp: 67, copyLink: 120 },
  bookmarks: 234,
  
  // Improvement Signals
  lowEngagementSections: ["evidence"], // sections with dropoffRate > 0.12
  highDropoffPoints: [0.6, 0.75], // scroll depths where >10% of readers leave
}
```

### Phase 3: Story Improvement (Weekly)

The Story Improvement Engine analyzes aggregated data and generates recommendations:

```typescript
ImprovementReport {
  storySlug: "mgnrega-reform",
  score: 72, // out of 100 (learning effectiveness)
  
  strengths: [
    "Quick Facts section has highest engagement (avg 15s)",
    "Chart interaction rate is high (1.6 interactions/reader)",
  ],
  
  weaknesses: [
    "Evidence section has 15% dropoff rate — consider breaking into subsections",
    "60% scroll depth is where most readers leave — move key findings higher",
    "FAQ #3 has 3x more expansions than FAQ #1 — consider promoting it",
  ],
  
  recommendations: [
    { action: "restructure", target: "evidence", reason: "15% dropoff rate", priority: "high" },
    { action: "reorder", target: "faq", reason: "FAQ #3 more popular than #1", priority: "medium" },
    { action: "shorten", target: "evidence text", reason: "avg time 45s is too long", priority: "medium" },
  ],
  
  compareToPrevious: {
    scrollCompletionChange: "+0.05",
    avgTimeChange: "+12000ms",
  }
}
```

## Data Privacy

- **No PII**: No IP addresses, no user IDs, no email addresses
- **Anonymous Sessions**: Session IDs are random 24-char strings, stored in localStorage
- **24h Session TTL**: Session data expires after 24 hours
- **30d Search Log TTL**: Search queries cleared after 30 days
- **Aggregate Only**: Dashboard shows aggregated data, never individual sessions
- **No Third-Party**: All analytics run on our infrastructure

## Implementation Rules

1. All tracking is client-side only (no SSR)
2. Events are batched (5s intervals, max 50 events per batch)
3. Scroll tracking is debounced at 200ms
4. Section tracking uses IntersectionObserver with 100ms throttle
5. Chart interaction events are captured via event delegation
6. Return visits detected by localStorage session counter
7. Search terms are sanitized (lowercase, trimmed, no special chars)
8. Share buttons fire analytics before opening share dialog
9. Bookmark events fire on toggle

## Security Rules

1. Never expose session IDs in URLs or referrer headers
2. Never log raw analytics events to console in production
3. API endpoint rate-limited to 100 requests per session per minute
4. Invalid events are silently dropped (no error feedback to client)
5. Batch size capped at 50 events to prevent abuse

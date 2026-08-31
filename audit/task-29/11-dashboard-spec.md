# Analytics Dashboard & Telemetry Specification

The Breakdown Knowledge Platform utilizes a unified, single-pane newsroom dashboard located at `/dashboard` (with the analytics view rendered in [`AnalyticsPanel`](file:///C:/newsjack-content/thebreakdown-os/components/dashboard/AnalyticsPanel.tsx) and [`AnalyticsDashboard`](file:///C:/newsjack-content/thebreakdown-os/components/analytics/AnalyticsDashboard.tsx)).

---

## 1. Unified Dashboard Architecture

No second dashboard or separate analytics endpoints may be introduced. All growth tracking and learning effectiveness metrics must flow through the existing API endpoint:
`/api/analytics/story/{slug}`

```mermaid
graph TD
    UserEvent[Reader Session Events] -->|Capture Event| CaptureLib[lib/analytics/capture.ts]
    CaptureLib -->|POST JSON| AnalyticsAPI[/api/analytics/events]
    AnalyticsAPI -->|Aggregate| DB[(Analytics Store / Memory)]
    DashboardPage[Dashboard View /dashboard] -->|Query| StoryAPI[/api/analytics/story/:slug]
    StoryAPI -->|Hydrate| DashboardPage
```

---

## 2. Integrated Views & Specs

### Overview View
- **Purpose**: High-level newsroom queues and platform health stats.
- **Metrics**: Research queue count, editorial queue count, publishing queue count, active monitors.

### Content & Analytics View
- **Purpose**: Measures reader learning and comprehension performance per story.
- **Metrics**: 
  - **Learning Effectiveness Score (LES)**: Composite comprehension index.
  - **Avg Scroll Completion**: Shows scroll dropoff depth.
  - **Avg Time on Page**: Differentiates scanner readers from engaged readers.
  - **Section Engagement**: Breakdown of time-on-page and dropoff rate per page chapter (e.g. standard standard-narrative vs deep-appendix).

### Telemetry Event Schema Bindings
All tracked events must match the `allowedParams` validation constraints in `lib/analytics/capture.ts`:
- `ad_slot_rendered`: `['placement']`
- `paywall_viewed`: `['placement', 'story_slug']`
- `dataset_download_started`: `['dataset_id', 'status']`
- `share_clicked`: `['story_slug', 'medium']`

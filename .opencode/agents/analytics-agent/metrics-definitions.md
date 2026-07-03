# Analytics Engine — 9 Learning Metrics: Detailed Definitions

## 1. Time on Section

**What it measures:** How long a reader spends with a specific story section in their viewport.

**How it's tracked:**
- Each story section is wrapped in an IntersectionObserver
- When a section enters the viewport (>25% visible), a timer starts
- When the section leaves the viewport (<25% visible), the timer stops
- Time accumulated across multiple viewport entries (reader can revisit)
- Units: milliseconds

**Section types tracked:**
- `hero` — headline, summary, hero image
- `executive-summary` — key points
- `quick-facts` — statistics cards
- `timeline` — chronological events
- `evidence` — claims and sources
- `data-cards` — raw data tables
- `charts` — data visualizations
- `maps` — geographic data
- `visuals` — globe, SVG, animation, infographic
- `debate` — competing viewpoints
- `faq` — expandable Q&A
- `sources` — reference list

**Event format:**
```json
{ "type": "section_view", "storySlug": "...", "sectionId": "...", "duration": 12000, "ts": "..." }
```

**What it tells you:**
- High time + high scroll = engaged reader
- High time + low scroll = reader stuck/confused
- Low time + high scroll = reader skimming (or section too long)

---

## 2. Scroll Completion

**What it measures:** How far the reader scrolled through the story, as a percentage of total story height.

**How it's tracked:**
- `window.scrollY + window.innerHeight` divided by `document.documentElement.scrollHeight`
- Recorded every scroll event, debounced at 200ms
- Only the maximum depth is stored per reader session
- Values: 0.0 (top) to 1.0 (bottom)

**Event format:**
```json
{ "type": "scroll", "storySlug": "...", "depth": 0.45, "maxDepth": 0.73, "ts": "..." }
```

**What it tells you:**
- 90%+ scroll completion = story held attention to the end
- <50% scroll completion = readers lost interest — investigate high-dropoff sections
- Sudden drop at specific % = that section is losing readers

**Dropoff detection:**
- Segment story into 10% height buckets
- Calculate what % of readers reach each bucket
- If bucket N has >10% fewer readers than bucket N-1, it's a dropoff point

---

## 3. Chart Interaction

**What it measures:** How readers interact with data visualizations — hovers, clicks, zooms.

**How it's tracked:**
- Event delegation on chart SVG/canvas elements
- Tracks: `mouseenter` (hover start), `mouseleave` (hover end), `click` (data point), `wheel` (zoom)
- Each chart has a unique `chartId` from the visual plan

**Event format:**
```json
{ "type": "chart_interaction", "storySlug": "...", "chartId": "chart-0-line", "action": "hover|click|zoom", "ts": "..." }
```

**What it tells you:**
- 5+ interactions per reader = chart is being actively explored
- 0 interactions = chart may not be useful (or not noticed)
- Compare chart types: which chart types get the most interaction?
- High hover rate = readers are exploring data in detail

---

## 4. Timeline Interaction

**What it measures:** Which timeline events readers click on.

**How it's tracked:**
- Click event on timeline event cards
- Records which event (by date) was clicked
- Timeline events are expandable — track expand/collapse

**Event format:**
```json
{ "type": "timeline_interaction", "storySlug": "...", "eventDate": "2020-04-01", "action": "click", "ts": "..." }
```

**What it tells you:**
- Which historical events readers are most curious about
- Helps prioritize which events to cover in more detail
- Low interaction = timeline format may not be engaging

---

## 5. FAQ Expansion

**What it measures:** Which FAQ questions readers open and close.

**How it's tracked:**
- Click event on FAQ question headers (expand/collapse)
- Tracks which question index was expanded
- Records expand and collapse separately

**Event format:**
```json
{ "type": "faq_expansion", "storySlug": "...", "questionIndex": 2, "action": "open|close", "ts": "..." }
```

**What it tells you:**
- The most-expanded FAQ reveals what readers actually want to know
- If FAQ #5 is most popular but it's at the bottom, consider moving it up
- Questions that are opened and immediately closed may be misleading

---

## 6. Search Terms

**What it measures:** What readers search for on the site.

**How it's tracked:**
- Input change on search bar (debounced 500ms)
- On form submit, record the query and number of results
- Queries sanitized: lowercase, trimmed, no special chars
- Zero-result queries are flagged separately

**Event format:**
```json
{ "type": "search", "query": "mgnrega wage rates", "resultsCount": 3, "ts": "..." }
```

**What it tells you:**
- What readers want to learn about but can't find
- High-frequency queries suggest story topics to cover
- Zero-result queries suggest content gaps
- Query phrasing reveals reader language (use it in headlines)

---

## 7. Return Visits

**What it measures:** How many readers come back to the site within 7 days.

**How it's tracked:**
- Session counter stored in localStorage
- Incremented on each page load (new tab = new session)
- Tracked per story: does the reader return to the same story?
- Tracked per category: does the reader return to the same topic?

**Event format:**
```json
{ "type": "return_visit", "storySlug": "...", "visitCount": 3, "ts": "..." }
```

**What it tells you:**
- High return rate = sticky content worth revisiting
- Low return rate = one-time read, not memorable
- Compare return rates by category: which topics bring readers back?

---

## 8. Shares

**What it measures:** How often readers share or recommend a story.

**How it's tracked:**
- Click event on share buttons (Twitter, LinkedIn, WhatsApp, copy link)
- Tracked before the share dialog opens (optimistic)
- Copy-link events count from the clipboard API

**Event format:**
```json
{ "type": "share", "storySlug": "...", "medium": "twitter|linkedin|whatsapp|copy_link", "ts": "..." }
```

**What it tells you:**
- High share count = story is valuable as reference material
- Which medium is most used indicates audience platform preference
- Copy-link is the strongest signal (reader is saving for later use)

---

## 9. Bookmarks

**What it measures:** How often readers save stories for later.

**How it's tracked:**
- Click on bookmark icon (toggle)
- Stored in localStorage (anonymous)
- Tracks add and remove separately
- Removes after 7 days if not re-engaged

**Event format:**
```json
{ "type": "bookmark", "storySlug": "...", "action": "add|remove", "ts": "..." }
```

**What it tells you:**
- High bookmark rate = promising topic with perceived future value
- Bookmarks + high return rate = story worth updating
- Bookmarks + low return rate = reader intended to return but didn't

---

## Composite Scoring: Learning Effectiveness Score (LES)

Combine all 9 metrics into a single 0–100 score:

```
LES = (
  (scrollCompletion × 0.20) +
  (timeOnPage × 0.15) +
  (chartInteractions × 0.10) +
  (timelineInteractions × 0.05) +
  (faqExpansions × 0.05) +
  (returnVisitorRate × 0.15) +
  (shareRate × 0.10) +
  (bookmarkRate × 0.10) +
  (searchReferrals × 0.10)
) × 100
```

Where each metric is normalized to 0–1 relative to the story's category average.

---

## Quality Gates

| Metric | Minimum Threshold | Action if Below |
|--------|------------------|----------------|
| Scroll Completion | 50% | Flag for editorial review |
| Time on Page | 90s | Investigate section engagement |
| Chart Interaction | 1.0 per reader | Improve chart placement or type |
| FAQ Expansion | 0.3 per reader | Consider adding FAQ section |
| Return Visit Rate | 15% | Improve story stickiness |
| Share Rate | 1% | Add share prompts |
| Bookmark Rate | 2% | Add bookmark CTA |

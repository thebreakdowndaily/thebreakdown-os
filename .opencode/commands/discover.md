# THE BREAKDOWN
## Discover Command v1.0 — Trend Intelligence

### Mission
Surface the most searched, discussed, and impactful stories across India and the world.

### Sources to Scan
- Google Trends (India focus, past 7 days)
- News headlines: Reuters, BBC, Indian Express, The Hindu, Scroll.in
- Government: PIB, ministry press releases, parliamentary Q&A
- Research: arXiv, Google Scholar (India-affiliated papers)
- Social: X/Twitter trending, Reddit r/India, r/WorldNews
- Wikipedia: Current events portal

### Output Format
For each trending topic, collect:

| Field | Description |
|-------|-------------|
| Topic | Title (max 80 chars) |
| Velocity | Search volume / rate of acceleration |
| Coverage | Which outlets are covering it |
| Why Now | Trigger event or inflection point |
| Category | Government, Economy, Technology, Geopolitics, Education, Policy, Climate |
| Impact Score | 1-100 (urgency × reach × data availability) |

### Ranking Criteria
1. **Urgency** — Breaking vs evergreen
2. **Impact** — How many people it affects
3. **Data availability** — Can we visualise it?
4. **Visual potential** — Chart, map, or timeline possible?
5. **Audience interest** — Is it being searched/discussed?

### Gate
Do not proceed to Research unless Impact Score ≥ 60 and at least 2 independent sources corroborate.

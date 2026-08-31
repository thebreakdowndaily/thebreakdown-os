# Growth Metric Dictionary — The Breakdown Knowledge Platform

This dictionary defines the authoritative growth and retention metrics used across The Breakdown OS. No duplicate or conflicting metric definitions may be introduced.

---

## 1. Retention & Acquisition Metrics

### qualified_returning_reader
* **Definition**: A reader who returns to the platform after their initial session and has a documented history of reading at least two separate stories.
* **Source**: local storage (`tb_reading_history` array containing $\ge 2$ entries, where the earliest entry timestamp is from a previous calendar day).
* **Calculation**: 
  $$\text{Is Returning} = (\text{length of history} \ge 2) \land (\text{now} - \text{earliest readAt} \ge 24\text{ hours})$$
* **Refresh Frequency**: Real-time on page load (via `returning-reader.ts`).
* **Owner**: Growth Bureau
* **Limitation**: Depends on browser local storage persistence (cleared cookies/storage resets the history).

### engaged_reader
* **Definition**: A reader who doesn't just visit the page, but actively consumes context and primary sources, satisfying the canonical learning loop.
* **Source**: Telemetry event stream (`section_view`, `scroll` events).
* **Calculation**: 
  $$\text{Comprehended} = \text{Time on Page} \ge 180\text{ seconds} \land \text{Scroll Depth} \ge 70\%$$
* **Refresh Frequency**: Hourly aggregation.
* **Owner**: Research Bureau
* **Limitation**: Idle time in tabs can inflate time-on-page unless focus tracking is strictly active.

### newsletter_conversion_rate
* **Definition**: The percentage of unique readers who successfully complete the double-opt-in subscription funnel.
* **Source**: Event tracker (`newsletter_viewed`, `newsletter_started`, `newsletter_submitted`).
* **Calculation**:
  $$\text{Conversion} = \frac{\text{Unique } \texttt{newsletter\_submitted} \text{ events}}{\text{Unique } \texttt{newsletter\_viewed} \text{ events}} \times 100$$
* **Refresh Frequency**: Daily.
* **Owner**: Commercial Bureau
* **Limitation**: Does not measure backend bounce rates (invalid emails that pass initial syntax verification).

---

## 2. Interaction & Trust Metrics

### evidence_interaction_rate
* **Definition**: The intensity of user interaction with primary sources, citations, and trust indicators.
* **Source**: Event logs (`chart_interaction`, `timeline_interaction`, `faq_expansion`, `citation_copied`).
* **Calculation**:
  $$\text{Interaction Rate} = \frac{\text{Total visual + citation interactions}}{\text{Total unique sessions}} \times 100$$
* **Refresh Frequency**: Daily.
* **Owner**: Verification Bureau
* **Limitation**: Does not guarantee reading comprehension of the verified claim.

### learning_effectiveness_score (LES)
* **Definition**: Composite index measuring how effectively a story transfers understanding to the reader, based on interaction depth rather than clicks.
* **Source**: `AggregateStoryAnalytics` projection service.
* **Calculation**: 
  $$\text{LES} = 0.4 \times (\text{Avg Scroll Depth}) + 0.3 \times (\text{Normalized Time}) + 0.2 \times (\text{Interaction density}) + 0.1 \times (\text{Return rate})$$
* **Refresh Frequency**: Monthly.
* **Owner**: Editorial Bureau
* **Limitation**: Calibrated for standard/deep formats; may under-represent quick-mode reading habits.

---

## 3. Revenue Metrics

### supporter_conversion_rate
* **Definition**: Percentage of unique visitors who upgrade to Supporting Reader or Institutional Supporter tiers.
* **Source**: Stripe ledger & `/api/checkout` events.
* **Calculation**:
  $$\text{Conversion} = \frac{\text{Completed Stripe Subscriptions}}{\text{Unique Checkout Page Views}} \times 100$$
* **Refresh Frequency**: Real-time.
* **Owner**: Commercial Bureau
* **Limitation**: Excludes off-platform B2B direct bank transfers.

---

## 4. Status Classification

### NOT VERIFIED — PRODUCTION ACCESS REQUIRED
Any metric that requires live web analytics integrations (Google Search Console API, real Beehiiv production database records, live production Stripe payouts) is explicitly marked with this tag to prevent fabrication of telemetry.

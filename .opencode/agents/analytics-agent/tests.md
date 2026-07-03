# Analytics Engine — Tests

## 1. Event Types (9 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| EVT-01 | Section view event | type: "section_view", sectionId: "hero", duration: 12000 | Valid | ✓ |
| EVT-02 | Scroll event | type: "scroll", depth: 0.45, maxDepth: 0.73 | Valid | ✓ |
| EVT-03 | Chart interaction event | type: "chart_interaction", chartId: "chart-0-line", action: "hover" | Valid | ✓ |
| EVT-04 | Timeline interaction event | type: "timeline_interaction", eventDate: "2020-04-01", action: "click" | Valid | ✓ |
| EVT-05 | FAQ expansion event | type: "faq_expansion", questionIndex: 2, action: "open" | Valid | ✓ |
| EVT-06 | Search event | type: "search", query: "mgnrega wages", resultsCount: 3 | Valid | ✓ |
| EVT-07 | Return visit event | type: "return_visit", visitCount: 2 | Valid | ✓ |
| EVT-08 | Share event | type: "share", medium: "twitter" | Valid | ✓ |
| EVT-09 | Bookmark event | type: "bookmark", action: "add" | Valid | ✓ |

## 2. Event Validation (6 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| VAL-01 | Invalid event type | type: "page_view" | Dropped silently | ✓ |
| VAL-02 | Missing storySlug | type: "scroll", no slug | Dropped silently | ✓ |
| VAL-03 | Negative duration | type: "section_view", duration: -5 | Rejected | ✓ |
| VAL-04 | Scroll depth > 1 | depth: 1.5 | Clamped to 1.0 | ✓ |
| VAL-05 | Empty search query | query: "" | Dropped silently | ✓ |
| VAL-06 | Invalid share medium | medium: "facebook" | Dropped silently | ✓ |

## 3. Event Batching (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| BCH-01 | Batch of 10 events | 10 valid events | All accepted | ✓ |
| BCH-02 | Batch of 60 events | 60 events | Only first 50 accepted | ✓ |
| BCH-03 | Empty batch | 0 events | 400 Bad Request | ✓ |
| BCH-04 | Mixed valid/invalid | 8 valid, 2 invalid | 8 stored, 2 dropped, 200 OK | ✓ |

## 4. Section Tracking (5 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| SEC-01 | Section enters viewport | 25% visible | Timer starts | ✓ |
| SEC-02 | Section leaves viewport | <25% visible | Timer stops, duration recorded | ✓ |
| SEC-03 | Section re-enters | Returns to viewport | Timer resumes (accumulates) | ✓ |
| SEC-04 | Multiple sections visible | hero + summary both visible | Both tracked independently | ✓ |
| SEC-05 | Zero duration | Section entered and immediately left | duration: 0, event still recorded | ✓ |

## 5. Scroll Tracking (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| SCR-01 | Scroll to 50% | window.scrollY = 50% height | depth: 0.5, maxDepth: 0.5 | ✓ |
| SCR-02 | Scroll to bottom | window.scrollY = 100% height | depth: 1.0, maxDepth: 1.0 | ✓ |
| SCR-03 | Scroll up and down | 30% → 60% → 40% → 70% | maxDepth: 0.7 | ✓ |
| SCR-04 | Debounce check | 10 scrolls within 200ms | Only last event recorded | ✓ |

## 6. Chart Interaction (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| CHT-01 | Chart hover | mouseenter on chart SVG | action: "hover" | ✓ |
| CHT-02 | Chart click | click on data point | action: "click" | ✓ |
| CHT-03 | Chart zoom | wheel on chart | action: "zoom" | ✓ |
| CHT-04 | Multiple interactions | 5 hovers + 2 clicks | 7 events recorded | ✓ |

## 7. FAQ Tracking (3 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| FAQ-01 | FAQ open | Click question #2 | action: "open", questionIndex: 2 | ✓ |
| FAQ-02 | FAQ close | Click open question #2 | action: "close", questionIndex: 2 | ✓ |
| FAQ-03 | Multiple FAQs | Open #1, open #3, close #1, open #4 | 4 events recorded | ✓ |

## 8. Search Tracking (3 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| SRC-01 | Search with results | Query: "cbdc india", 3 results | query: "cbdc india", resultsCount: 3 | ✓ |
| SRC-02 | Zero-result search | Query: "xyzabc", 0 results | Flagged as content gap | ✓ |
| SRC-03 | Search sanitization | Query: "  GDP Growth! " | query: "gdp growth" | ✓ |

## 9. Aggregation (5 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| AGG-01 | Average time on page | 100 readers, varied times | Correct mean | ✓ |
| AGG-02 | Scroll completion average | 100 readers, varied depths | Correct mean | ✓ |
| AGG-03 | Section engagement | 500 section_view events | Per-section averages correct | ✓ |
| AGG-04 | Dropoff detection | Readers drop at 60% scroll | highDropoffPoints includes 0.6 | ✓ |
| AGG-05 | Popular FAQ detection | FAQ #2 expanded 3x more | popularFAQIndices: [2, ...] | ✓ |

## 10. Improvement Engine (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| IMP-01 | Low scroll completion | 35% avg scroll | recommendation: "restructure top sections" | ✓ |
| IMP-02 | High dropoff section | evidence: 18% dropoff | recommendation: "shorten evidence" | ✓ |
| IMP-03 | Popular FAQ at bottom | FAQ #5 most expanded, it's last | recommendation: "reorder FAQ, move #5 up" | ✓ |
| IMP-04 | Low chart interaction | 0.2 interactions/reader | recommendation: "add more visuals" | ✓ |

## 11. Privacy (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| PRV-01 | No IP storage | Request with IP | IP not logged | ✓ |
| PRV-02 | Anonymous session ID | Session cookie | Random 24-char string | ✓ |
| PRV-03 | Session expiry | 25 hours later | Session data deleted | ✓ |
| PRV-04 | Search log TTL | 31 days later | Search queries cleared | ✓ |

## Total: 51 test cases across 11 categories

# THE BREAKDOWN
## Editorial Review Agent — Editorial Checklist v1.0

### Pre-Publication Checklist

Every item must be `true` for a story to be approved. If any item is `false`, the story cannot be published.

---

#### 1. Headline Accurate

Does the headline accurately reflect the story content?

**Pass:** Headline matches the primary claim or angle of the story.
**Fail:** Headline is misleading, oversimplified, or promises something the story doesn't deliver.

---

#### 2. Reader Promise Fulfilled

Does the story deliver what the architecture's `readerPromise` promised?

**Pass:** By the end of the story, the reader has learned what was promised.
**Fail:** The story raises questions it doesn't answer, or pivots to a different topic.

---

#### 3. No Unsupported Claims

Does every factual claim have supporting evidence?

**Pass:** Every statistic, date, and assertion is cited to a source.
**Fail:** Any claim appears without a citation or evidence trace.

Check against the research and verification inputs. If a claim exists in the story but not in the research, flag it.

---

#### 4. Timeline Correct

Is the chronology accurate and consistent?

**Pass:** Events appear in the correct order, dates match the timeline input, causal relationships are clear.
**Fail:** Wrong dates, missing events, events out of order, or unclear causal sequence.

---

#### 5. Data Explained

Is every number, statistic, or data point explained in context?

**Pass:** "389 crore person-days — a 35% increase from the previous year, and the highest since the scheme began in 2006."
**Fail:** "389 crore person-days" with no comparator, no trend, no meaning.

---

#### 6. Sources Linked

Are all sources identifiable and accessible?

**Pass:** Every citation uses [Source Name, Year] format and matches a full reference.
**Fail:** Missing citations, vague attribution ("experts say"), or sources that can't be traced.

---

#### 7. Definitions Included

Are technical terms, acronyms, and concepts defined for the target audience?

**Pass:** Terms are defined on first mention. Acronyms are expanded.
**Fail:** Assumed knowledge the target audience may not have.

Exception: Common Indian acronyms (RBI, GDP, GST, SC) need not be expanded for general audiences.

---

#### 8. Visual Recommendations Complete

Does the story include visual placeholders where the architecture specified them?

**Pass:** Every visual in the architecture's `visualPlan` has a `[VISUAL: type — purpose]` placeholder at the correct location.
**Fail:** Missing placeholders, wrong visual type, or visual called out in the wrong section.

---

#### 9. Related Stories Suggested

Does the story connect to related coverage?

**Pass:** Related stories are noted (even if only as metadata) — the reader can continue learning.
**Fail:** The story exists in isolation with no connection to other relevant coverage.

---

### Quick Reference Card

| # | Item | Critical? | Fixable by Writer? |
|---|------|-----------|-------------------|
| 1 | Headline accurate | Yes | Yes |
| 2 | Reader promise fulfilled | Yes | Yes |
| 3 | No unsupported claims | Yes | Only if evidence exists |
| 4 | Timeline correct | Yes | No — needs timeline agent |
| 5 | Data explained | Yes | Yes |
| 6 | Sources linked | Yes | Yes |
| 7 | Definitions included | Medium | Yes |
| 8 | Visual recommendations complete | Medium | Yes |
| 9 | Related stories suggested | Low | Yes |

---

### Rejection Triggers

Any of the following triggers automatic rejection regardless of checklist pass rate:

- **Headline is false or misleading** (checklist item 1)
- **A factual claim cannot be traced to any source** (checklist item 3)
- **The timeline has a material date error** (checklist item 4) — e.g., wrong year for an election, policy, or court ruling
- **Unsupported claims outnumber supported claims** (checklist item 3)
- **The story fails the reader promise** (checklist item 2) — reader will feel misled

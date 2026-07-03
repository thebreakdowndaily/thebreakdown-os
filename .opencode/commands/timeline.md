# THE BREAKDOWN
## Timeline Command v1.0 — Event Chronology

### Mission
Construct a chronological sequence of events for the story. Every date must be sourced.

### Date Handling
- Use YYYY-MM-DD format when precise date is known
- Use YYYY-MM for month-level precision
- Use YYYY for year-level precision
- Use "Q1 2026" style for quarterly precision
- Mark estimated dates with (est.) suffix

### Timeline Rules
1. Minimum 5 events for a full story timeline
2. Maximum 20 events (beyond that, group into phases)
3. Every event must have at least one source
4. Flag conflicting dates between sources
5. Include future events where applicable (upcoming hearings, deadlines)

### Event Categories
- **Policy** — Laws passed, schemes launched, regulations notified
- **Event** — Specific occurrences (crisis, summit, accident)
- **Legal** — Court orders, judgments, filings
- **Economic** — Data releases, budget announcements, market movements
- **Social** — Protests, movements, public responses

### Structure
```markdown
| Date | Event | Significance | Source |
|------|-------|-------------|--------|
| 2025-12-21 | Act receives presidential assent | Critical | PIB |
```

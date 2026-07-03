# Election Commission of India Plugin

## Purpose

Fetch and parse data from the Election Commission of India (eci.gov.in). Provides election schedules, results, electoral rolls, voter turnout data, and regulatory notifications.

## Source Access

| Detail | Value |
|--------|-------|
| Base URL | `https://eci.gov.in` |
| Results | `https://results.eci.gov.in` |
| Voter Turnout | `https://voter-turnout.eci.gov.in` |
| Election Schedule | `https://eci.gov.in/election-schedule/` |
| Electoral Roll | `https://eci.gov.in/electoral-roll/` |
| Type | Scrape |
| Auth | None (public) |

## Fetching Instructions

1. **Election schedules**: Fetch upcoming election dates, phases, and constituencies.
2. **Results**: After an election, compile constituency-wise results including margin and vote share.
3. **Voter turnout**: Phase-wise turnout data with gender and state breakdown.
4. **Electoral roll statistics**: State-wise elector counts, gender ratio, EPIC coverage.
5. **Notifications**: Model Code of Conduct, regulatory decisions, and announcements.

## Parsing Instructions

### Election Schedule

| Field | Extraction |
|-------|-----------|
| Election Type | Lok Sabha, State Assembly, By-election |
| State/UT | Jurisdiction |
| Phase | Phase number (if multi-phase) |
| Date | Polling date |
| Constituencies | Seats going to polls |
| Notification Date | Election notification under Sec 14/15 |

### Results

| Field | Extraction |
|-------|-----------|
| Constituency | Name |
| Winner | Candidate name and party |
| Runner-up | Candidate name and party |
| Margin | Votes and percentage |
| Total Votes | Votes polled |
| Turnout | Voter turnout percentage |

### Voter Turnout

| Field | Extraction |
|-------|-----------|
| Phase | Phase number |
| State | State name |
| Total Electors | Registered voters |
| Votes Polled | Total votes cast |
| Turnout % | Percentage |
| Male | Male voter count |
| Female | Female voter count |
| Third Gender | Third gender voter count |

## Handling Guidelines

- **Real-time**: Election results are updated live on counting day. Use timestamps to track freshness.
- **Historical**: ECI maintains archives. Slugs change after elections — use stable URLs.
- **Language**: Hindi and English. Prefer English for consistency.
- **By-elections**: Track separately — results are published on the same portal as general elections.
- **Delimitation**: Constituency boundaries change after delimitation. Note which delimitation applies.

## Source Reliability

Tier 1 (highest). Official election data from the constitutional authority. No interpretation needed for raw numbers.

## Output Schema

Output must conform to `schemas/research.schema.json`. Use `data.type`:
- `"election-schedule"` for upcoming elections
- `"election-result"` for results
- `"voter-data"` for turnout and electoral rolls
- `"notification"` for regulatory announcements

Tag with election type, state, and year.

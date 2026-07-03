# Press Information Bureau Plugin

## Purpose

Fetch and parse press releases from the Press Information Bureau (pib.gov.in). These are official government announcements — policy launches, ministerial statements, cabinet decisions, and program updates.

## Source Access

| Detail | Value |
|--------|-------|
| Base URL | `https://pib.gov.in` |
| Release URL | `https://pib.gov.in/PressReleasePage.aspx?PRID=<id>` |
| Search URL | `https://pib.gov.in/Search.aspx` |
| Type | Scrape |
| Auth | None (public) |

## Fetching Instructions

1. **By PR ID:** Direct URL using the PIB Release ID (`PRID`).
2. **By date:** Use the date-wise archive at `https://pib.gov.in/Allreleasedetail.aspx?releaseyear=<year>`.
3. **By ministry:** Filter releases by ministry using the ministry filter parameter.
4. **Latest:** Fetch the current date's releases — typically 5-15 releases per day.
5. **Search:** Use the search endpoint for keyword-based retrieval.

## Parsing Instructions

Each PIB release contains:

| Field | Extraction |
|-------|-----------|
| PR ID | Unique numeric identifier (8-10 digits) |
| Title | Headline of the press release |
| Date | Date of issue |
| Ministry | Issuing ministry (e.g., Ministry of Finance, Ministry of Defence) |
| Body | Full text of the release |
| Tags | Keywords/topics assigned by PIB |
| Image URL | Associated image (if any) |
| Language | Hindi, English, or bilingual |
| Location | City of issuance |

## Handling Guidelines

- **Embargoed releases**: Some releases have an embargo time. Do not publish before the embargo lifts.
- **Language variants**: Priority to English releases. Hindi releases can supplement.
- **Multiple releases per day**: Each PR ID is a separate document. Do not merge.
- **Corrections**: If a release is updated, note the revision date.
- **Quotes**: Ministerial quotes are verbatim official statements. Attribute clearly.
- **Context**: Releases often reference schemes, acts, or previous announcements. Extract these references for knowledge graph entities.

## Source Reliability

Tier 1 (highest). Official government communications. Use verbatim for direct statements. Context and analysis are editorial.

## Output Schema

Output must conform to `schemas/document.schema.json`. Each release is one document with:
- `source.url` = PIB release page URL
- `source.type` = "government-press-release"
- `source.publishedAt` = release date
- `metadata.prid` = PR ID
- `metadata.ministry` = issuing ministry
- Body text with attribution preserved

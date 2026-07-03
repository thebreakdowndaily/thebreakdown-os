# Gazette of India Plugin

## Purpose

Fetch and parse official notifications from the Gazette of India (egazette.gov.in). These are primary-source legal documents — statutory orders, legislative changes, appointments, tenders, and government notifications.

## Source Access

| Detail | Value |
|--------|-------|
| Base URL | `https://egazette.gov.in` |
| Search URL | `https://egazette.gov.in/Search/Search` |
| Date URL | `https://egazette.gov.in/(YYYY/MM/DD)` |
| Type | Scrape + PDF download |
| Auth | None (public) |

## Fetching Instructions

1. **By date:** Construct URL with date parameter `?date=YYYY-MM-DD`.
2. **By keyword:** Use the search endpoint with query parameter `?keyword=<term>`.
3. **By notification number:** Direct URL if notification number is known.
4. **Latest:** Fetch the current date's gazette.

## Parsing Instructions

Each gazette notification contains:

| Field | Extraction |
|-------|-----------|
| Title | Full title of the notification |
| Notification Number | Unique identifier (e.g., `G.S.R. 123(E)`) |
| Date | Date of publication |
| Department | Ministry or department issuing |
| Subject | Subject line |
| Body | Full text of the notification |
| PDF URL | Link to the official PDF |
| Category | Legislative, Appointment, Tender, Correction, etc. |
| Signed By | Name and title of issuing authority |

## Handling Guidelines

- **Notification numbers**: GSR (General Statutory Rules) and SO (Statutory Order) numbers are the canonical identifiers.
- **Amendments**: Often reference a parent act by year and section. Extract the parent act reference when present.
- **Corrigenda**: Corrections to previous notifications — link back to the original notification number.
- **Multiple notifications per day**: A single date can have dozens of notifications. Each is a separate document.
- **PDF fallback**: If HTML content is incomplete, download and extract from the attached PDF.

## Source Reliability

Tier 1 (highest). These are legally authoritative documents. No interpretation — extract verbatim.

## Output Schema

Output must conform to `schemas/document.schema.json`. Each notification is one document with:
- `source.url` set to the gazette page URL
- `source.type` = "government-gazette"
- `extractedAt` timestamp
- Full body text extracted
- Metadata in `tags` including notification number, department, category

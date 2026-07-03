# Parliament of India Plugin

## Purpose

Fetch and parse data from the Parliament of India (sansad.in). Covers Lok Sabha and Rajya Sabha proceedings, bills, debates, committee reports, and parliamentary questions.

## Source Access

| Detail | Value |
|--------|-------|
| Base URL | `https://sansad.in` |
| LS Home | `https://sansad.in/ls` |
| RS Home | `https://sansad.in/rs` |
| Bills | `https://sansad.in/bills` |
| Committees | `https://sansad.in/committees` |
| Questions | `https://sansad.in/questions` |
| Type | Scrape |
| Auth | None (public) |

## Fetching Instructions

1. **Bills**: Fetch list of pending and passed bills. For each bill: title, introduction date, status, text PDF.
2. **House proceedings**: Daily summaries of Lok Sabha and Rajya Sabha sittings.
3. **Questions**: Starred and unstarred questions with answers (Question Hour).
4. **Committee reports**: Standing committee and select committee reports on legislation.
5. **Debate transcripts**: Full transcripts of house debates when available.

## Parsing Instructions

### Bill

| Field | Extraction |
|-------|-----------|
| Title | Short and long title |
| Bill Number | e.g., Bill No. 123 of 2024 |
| Type | Government Bill, Private Member's Bill |
| Introduced By | Minister or MP name |
| Date Introduced | Introduction date |
| Status | Pending, Passed LS, Passed RS, Assented, Withdrawn |
| Summary | Official bill summary |
| Committee | Committee to which it was referred |
| PDF URL | Full text PDF |
| Linked Acts | Acts this bill amends |

### Question

| Field | Extraction |
|-------|-----------|
| Question Number | Unique ID |
| Type | Starred (oral answer), Unstarred (written answer) |
| Ministry | Addressed to |
| Asked By | MP name and constituency |
| Subject | Subject line |
| Answer | Full answer text |
| Date | Date of answer |

### Committee Report

| Field | Extraction |
|-------|-----------|
| Report Title | Title |
| Committee | Name of committee |
| Presented By | Chairperson |
| Date Presented | Date tabled |
| Subject | Legislation or topic examined |
| Recommendations | List of recommendations |
| PDF URL | Full report |

## Handling Guidelines

- **Bills that lapse**: A bill lapses when the Lok Sabha dissolves unless it originated in Rajya Sabha. Track lapsed bills.
- **Amendments**: Bills can be amended during committee stage. Use the most recent version.
- **Sessions**: Parliament has three sessions per year — Budget, Monsoon, Winter. Tag by session.
- **Question cut-off**: Questions must be submitted 15-21 days ahead. Not all questions are admitted.
- **Language**: Hindi and English. Use English transcripts where available.

## Source Reliability

Tier 1 (highest). Official parliamentary records. Bills, questions, and proceedings are primary-source legislative data.

## Output Schema

Output must conform to `schemas/document.schema.json`. Use `source.type`:
- `"parliament-bill"` for bills
- `"parliament-question"` for questions
- `"parliament-committee"` for committee reports
- `"parliament-proceeding"` for debates and sittings

Tag with house (LS/RS), session, and bill number where applicable.

# Watcher: Supreme Court of India

## Source
- **URL**: `https://main.sci.gov.in/daily-order` | `https://main.sci.gov.in/judgment`
- **Format**: HTML (daily orders) + PDF (judgment PDFs)
- **Poll**: Every 6 hours
- **Last State Key**: `monitor:last_poll:supreme-court`

## What We Track

### Daily Orders
- Case number + title + bench + next hearing date
- Order type (adjourned, stay granted, stay vacated, notice issued, judgment reserved)
- Key keywords in order text (search: "struck down", "unconstitutional", "upheld")

### Judgments
- New judgment published (case title, date, bench, majority/minority)
- Key finding (upheld, struck down, modified, guidelines issued)
- Constitution bench judgments (5+ judge bench) — always flag as critical
- Dissenting opinions

### New Cases Filed
- Public Interest Litigations (PILs) on significant topics
- Cases challenging central/state laws

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| Law struck down | critical |
| Law upheld | major |
| Stay granted on govt policy | critical |
| New PIL on major topic | minor |
| Constitution bench reference | major |
| Review petition filed | minor |

## Diff Strategy
1. Fetch daily orders list — compare case numbers against last poll
2. For ongoing cases, check next hearing date or status field change
3. Fetch judgments page — check for new PDF links
4. Parse judgment PDF for key findings (first 3 pages = summary)
5. Link to existing stories by case name, petitioner, respondent, law cited

## Output Format
```json
{
  "source": "supreme-court",
  "polled_at": "2026-07-02T06:00:00Z",
  "changes": [
    {
      "type": "judgment",
      "entity_id": "civ-appeal-2025-123",
      "entity_name": "XYZ Corp vs Union of India",
      "finding": "section_6A_struck_down",
      "bench": "5",
      "severity": "critical",
      "summary": "Supreme Court struck down Section 6A of the XYZ Act as unconstitutional"
    }
  ],
  "new_items": [...],
  "unchanged_count": 120
}
```

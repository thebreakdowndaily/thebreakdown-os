# Watcher: Comptroller and Auditor General (CAG)

## Source
- **URL**: `https://cag.gov.in/` (Audit Reports section)
- **Format**: HTML + PDF
- **Poll**: Every 24 hours
- **Last State Key**: `monitor:last_poll:cag`

## What We Track

### Audit Reports
- Union Government (civil, defence, railways)
- State Government reports
- Public Sector Undertakings (PSU) audits
- Compliance audits
- Performance audits (scheme/program evaluations)
- Finance accounts

### Report Contents
- Key findings (financial irregularities, procedural violations, policy gaps)
- Dollar amounts involved (Rs X crore in irregular spending)
- Recommendations and their status
- Govt responses / Action Taken Notes (ATNs)

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| Major financial irregularity (>Rs 1000cr) | critical |
| Defence procurement irregularity | critical |
| Scheme performance failure | major |
| Compliance gap in social sector scheme | major |
| Routine compliance report | informational |

## Diff Strategy
1. Fetch report list — check for new report IDs
2. For known reports, check for Action Taken Note publication
3. Scan PDF first 3 pages for executive summary keywords
4. Extract irregularity amounts and flag if above threshold

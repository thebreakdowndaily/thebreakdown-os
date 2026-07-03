# Watcher: OECD

## Source
- **URL**: `https://www.oecd.org/newsroom/rss.xml` | `https://www.oecd.org/india/`
- **Format**: RSS
- **Poll**: Every 24 hours
- **Last State Key**: `monitor:last_poll:oecd`

## What We Track

### India-Specific
- OECD Economic Survey of India (biennial)
- India membership updates (India is not an OECD member but participates in many committees)
- India in OECD reports (education, tax, governance, digital)
- India accession to OECD instruments
- India's PISA performance (if participated)

### Global (with India context)
- PISA education rankings
- Tax transparency reports (India compliance)
- Digital economy reports
- Anti-bribery convention
- Climate finance tracking
- FDI regulatory restrictiveness index
- Gender equality reports
- Global revenue statistics (India tax-to-GDP ratio)

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| India Economic Survey published | critical |
| PISA results (India participation) | major |
| India tax transparency rating change | major |
| India FDI ranking change | minor |
| New OECD recommendation for India | minor |

## Diff Strategy
1. Fetch RSS + India country page
2. Filter for India mentions
3. Compare new report GUIDs
4. Track India-specific statistics (tax-to-GDP, PISA scores)

## Note
India is not an OECD member but participates as a Key Partner and in various committees. OECD reports on India are influential for policy benchmarking.

# Watcher: Press Information Bureau (PIB)

## Source
- **URL**: `https://pib.gov.in/Rss/rss.aspx` (multiple category feeds)
- **Format**: RSS (XML)
- **Poll**: Every 15 minutes
- **Last State Key**: `monitor:last_poll:pib`

## What We Track
- All government announcements released via PIB
- New schemes, policies, programs
- Cabinet decisions
- Appointments (secretaries, chiefs, governors, ambassadors)
- Key statistics releases (GDP, IIP, CPI, WPI, trade, fiscal deficit)
- Bilateral/multilateral announcements
- Awards, recognitions, commemorations

## Categories (feeds)
| Feed | Category | Priority |
|---|---|---|
| National | All India announcements | high |
| Cabinet | Cabinet Committee decisions | critical |
| Economy | Economic data, budget announcements | high |
| Science & Tech | ISRO, DST, DBT announcements | medium |
| Defence | MoD announcements, Make in India | medium |
| States | State-specific PIB releases | medium |

## Diff Strategy
1. Fetch all RSS feeds
2. Compare `<guid>` values against last known GUID list
3. New GUID = new release — always flag as meaningful
4. Parse `<title>` and `<description>` for keywords to classify
5. No diff needed for existing GUIDs (PIB doesn't update releases)

## Output Format
```json
{
  "source": "pib",
  "polled_at": "2026-07-02T00:15:00Z",
  "changes": [
    {
      "type": "new_release",
      "entity_id": "pib-2026-7890",
      "title": "Cabinet approves Rs 1.2 lakh crore semiconductor manufacturing incentive",
      "ministry": "Ministry of Electronics and IT",
      "date": "2026-07-02",
      "severity": "critical",
      "summary": "Cabinet approved production-linked incentive for semiconductor fabs"
    }
  ],
  "new_items": [...],
  "unchanged_count": 18
}
```

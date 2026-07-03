# Watcher: Parliament of India

## Source
- **URL**: `https://sansad.in/` | `https://loksabha.intranet.nic.in/`
- **Format**: HTML (scrape) + JSON API (where available)
- **Poll**: Every 6 hours
- **Last State Key**: `monitor:last_poll:parliament`

## What We Track

### Bills
- New bill introduced (title, date, minister, house)
- Bill status change (introduced → referred to committee → passed in Lok Sabha → passed in Rajya Sabha → President assent → law)
- Bill text amendments (new clauses, modified provisions)
- Bill withdrawn or lapsed
- New official amendments circulated

### Debates
- Key debates by topic (search for high-importance keywords)
- Question Hour: questions+answers by ministry, topic
- Ministerial statements

### Committees
- Committee reports published (title, chair, summary, recommendations)
- Committee members changed
- Committee hearings (topic, date, witnesses)

### Other
- New MP sworn in
- House adjournment/disruption events
- Budget session calendar

## Diff Strategy
1. Fetch bill list — compare bill IDs against last known set
2. For each known bill ID, check `status` field — diff against stored status
3. For each new bill ID, flag as `new_entity` with full details
4. For status changes, flag as `status_change`
5. Fetch committee reports — check if report ID is new (vs last poll)

## Output Format
```json
{
  "source": "parliament",
  "polled_at": "2026-07-02T06:00:00Z",
  "changes": [
    {
      "type": "status_change",
      "entity_id": "bill-2026-42",
      "entity_name": "Digital Personal Data Protection (Amendment) Bill, 2026",
      "from": "referred_to_committee",
      "to": "passed_in_lok_sabha",
      "date": "2026-07-02",
      "summary": "Bill passed in Lok Sabha with 3 amendments"
    }
  ],
  "new_items": [...],
  "unchanged_count": 45
}
```

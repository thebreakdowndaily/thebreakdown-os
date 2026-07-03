# Watcher: Ministry Press Releases

## Source
- **URL**: Ministry-specific RSS feeds (Finance, Defence, Home, External Affairs, Commerce, Agriculture, Health, Education, Environment, Power, Railways)
- **Format**: RSS (XML)
- **Poll**: Every 15 minutes
- **Last State Key**: `monitor:last_poll:press-releases`

## Ministries Tracked
| Ministry | RSS URL Pattern | Priority |
|---|---|---|
| Finance | `finmin.nic.in/rss` | critical |
| Defence | `mod.gov.in/rss` | high |
| Home Affairs | `mha.gov.in/rss` | high |
| External Affairs | `mea.gov.in/rss` | high |
| Commerce & Industry | `commerce.gov.in/rss` | medium |
| Agriculture | `agricoop.gov.in/rss` | medium |
| Health & Family Welfare | `mohfw.gov.in/rss` | high |
| Education | `education.gov.in/rss` | medium |
| Environment | `moef.gov.in/rss` | medium |
| Power | `powermin.gov.in/rss` | low |
| Railways | `indianrailways.gov.in/rss` | medium |
| MSME | `msme.gov.in/rss` | low |
| Labour | `labour.gov.in/rss` | medium |
| Law & Justice | `lawmin.gov.in/rss` | high |
| Telecom | `dot.gov.in/rss` | medium |

## Diff Strategy
1. Fetch each ministry RSS feed
2. Compare GUID against last known set
3. New GUID = new release
4. Cross-reference with PIB watcher results to deduplicate
5. Flag ministry-specific releases that did NOT go through PIB (often more detailed)

## Output Format
Same as PIB watcher, with additional `ministry` field.

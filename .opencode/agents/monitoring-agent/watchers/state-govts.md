# Watcher: State Governments

## Source
- **URL**: State portal RSS feeds (selected states)
- **Format**: RSS / HTML
- **Poll**: Every 6 hours
- **Last State Key**: `monitor:last_poll:state-govts`

## States Tracked (Top 10 by economic + population weight)
| State | Priority | Key Topics |
|---|---|---|
| Uttar Pradesh | high | Policy, law & order, infrastructure |
| Maharashtra | high | Economy, industry, Mumbai-specific |
| Tamil Nadu | high | Policy, health, education |
| Karnataka | high | Tech policy, startup, Bengaluru |
| Gujarat | high | Industry, infrastructure, ports |
| West Bengal | medium | Policy, health, education |
| Rajasthan | medium | Agriculture, water, renewable |
| Bihar | medium | Education, health, infrastructure |
| Madhya Pradesh | medium | Agriculture, industry |
| Telangana | high | Tech, irrigation, Hyderabad |

## What We Track
- State budget announcements
- New state schemes / policies
- Cabinet decisions
- Key appointments (Chief Secretary, DGP)
- Law & order incidents with policy implications
- GST collection data
- State-specific festivals, holidays, disaster declarations

## Diff Strategy
1. Fetch state RSS feeds
2. Compare GUIDs / link URLs
3. Classify by topic using keyword matching
4. Cross-reference with national sources (PIB often carries state announcements too)

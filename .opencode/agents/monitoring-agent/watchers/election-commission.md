# Watcher: Election Commission of India

## Source
- **URL**: `https://eci.gov.in/` | `https://results.eci.gov.in/`
- **Format**: HTML (scrape)
- **Poll**: Every 6 hours
- **Last State Key**: `monitor:last_poll:election-commission`

## What We Track

### Election Schedule
- New election dates announced (state assembly, by-elections, Rajya Sabha)
- Phase-wise polling schedule
- Counting date changes
- Model Code of Conduct (MCC) imposed / lifted
- MCC violation notices

### Electoral Rolls
- Final roll publication
- New voter registration statistics
- Voter turnout data (phase-wise, demographic)

### Results
- By-election results
- Rajya Sabha election results
- State assembly bypoll results

### Other
- New Chief Election Commissioner appointed
- EC directives to political parties
- Political party registration / de-registration
- Expenditure monitoring reports
- Candidate affidavit summaries

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| Election date announced | major |
| MCC imposed | major |
| MCC violation against major party | minor |
| By-election results | major |
| Election schedule changed | critical |
| Voter turnout anomalies | minor |

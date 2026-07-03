# THE BREAKDOWN
## Agent: Trending Intelligence v1.0

**Command**: discover.md
**Model**: big-pickle

### Mission
Find the most searched, discussed, fastest growing, and highest impact stories.

### Sources to Scan
- Google Trends (India focus)
- News headlines: Reuters, BBC, Indian Express, The Hindu, Scroll.in
- Government: PIB, ministry press releases
- Research: arXiv, Google Scholar
- Social: X/Twitter, Reddit
- Wikipedia current events

### Output
A ranked list of trending stories with:
- Rank, Topic, Category, Trending since, Why it matters, Score (1-100)
- Recommended action: Publish Now / Monitor / Ignore

### Quality Gate
Do not proceed to Research agent unless Impact Score ≥ 60 and ≥ 2 independent sources.

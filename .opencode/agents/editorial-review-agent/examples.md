# THE BREAKDOWN
## Editorial Review Agent — Examples v1.0

---

### Example 1: Full Review — Story Approved

**Story:** MGNREGA Budget 2026: Funding Gap Widens as Demand Surges

**Step 1 — Story Purpose:**
- What is this about? The gap between MGNREGA budget allocation and rising demand.
- Why does it matter? 15 crore families depend on MGNREGA for survival.
- Who is affected? Rural workers, especially women (55% of participants).
- Why now? Budget 2026 was just announced; the funding gap has reached record levels.

**Step 2 — Evidence Review:**
- "₹1,20,000 crore allocated" → Budget Documents 2026 ✓
- "389 crore person-days" → Ministry of Rural Development Annual Report 2026 ✓
- "55% women participants" → MOSPI 2026 ✓
- "15 crore families" → MGNREGA dashboard, 2026 ✓
- All claims sourced within 1 sentence of statement ✓

**Step 3 — Structure Review:**
- Hero ✓ | Context ✓ | Evidence ✓ | Timeline ✓ | Stakeholders ✓ | Debate ✓ | Future ✓ | Sources ✓
- No missing sections ✓
- All questions answered ✓

**Step 4 — Reader Review:**
- Clarity: 94 — Each section has a clear main point
- Flow: 91 — Good transitions between sections
- Context: 93 — Historical budget trends explained
- Definitions: 95 — All terms defined
- Transitions: 90 — One transition could be smoother

**Step 5 — Bias Review:**
- No loaded language ✓
- Opposition criticism attributed and contextualized ✓
- Government defence presented alongside criticism ✓
- No emotional manipulation ✓

**Step 6 — Narrative Review:**
- No repeated ideas ✓
- All explanations present ✓
- Ending could be stronger: suggests follow-up but could specify what to watch for

**Step 7 — Evidence Quality:**
```json
{
  "research": 94,
  "verification": 96,
  "sources": 93,
  "context": 91
}
```

**Step 8 — Editorial Score:**
```json
{
  "Research": 94,
  "Evidence": 95,
  "Accuracy": 98,
  "Structure": 94,
  "Readability": 92,
  "Context": 91,
  "VisualPotential": 90,
  "Originality": 88,
  "Trust": 96
}
```

**Step 9 — Quality Gates:**
- Research: 94 ≥ 90 ✓
- Evidence: 95 ≥ 90 ✓
- Accuracy: 98 ≥ 95 ✓
- Readability: 92 ≥ 90 ✓
- Trust: 96 ≥ 95 ✓
- Context: 91 ≥ 90 ✓

**Step 10 — Checklist:**
All items true ✓

**Step 11 — Self Critique:**
```json
{
  "wouldMeetReutersStandards": true,
  "reason": "All claims sourced to government documents or official statistics. Neutral framing. Context from 2006 scheme inception to 2026 budget."
}
```

**Final Output:**
```json
{
  "approved": true,
  "status": "approved",
  "score": 94,
  "summary": "Excellent evidence foundation, clear structure, neutral tone. One minor suggestion: strengthen the ending with specific indicators to watch (next budget cycle, quarterly employment data).",
  "issues": [
    {
      "type": "narrative_issue",
      "severity": "minor",
      "section": "future",
      "description": "Ending could specify what indicators readers should watch for (next budget cycle, quarterly employment data from MOSPI)."
    }
  ],
  "strengths": [
    "All claims sourced within one sentence of statement",
    "Excellent use of Tier 1 government sources",
    "Clear causal explanation of budget-demand gap",
    "Neutral presentation of both government and opposition positions"
  ],
  "missingSections": [],
  "revisionPlan": [],
  "selfCritique": {
    "wouldMeetReutersStandards": true,
    "reason": "All claims sourced to government documents or official statistics. Neutral framing. Context from 2006 scheme inception to 2026 budget."
  }
}
```

---

### Example 2: Revision Required — Missing Context

**Issue:** The story explains a new Supreme Court judgment but assumes the reader knows the history of the case. One transition is weak.

**Key Feedback:**
```json
{
  "status": "revision_required",
  "score": 83,
  "issues": [
    {
      "type": "clarity_issue",
      "severity": "major",
      "section": "context",
      "description": "The story references 'the 2019 amendment' but doesn't explain what it changed. Reader who doesn't remember the 2019 amendment will be lost."
    },
    {
      "type": "readability_issue",
      "severity": "minor",
      "section": "hero",
      "description": "Transition between the judgment summary and the background section is abrupt. The sentence 'Meanwhile, the case has a long history' does not connect the ideas."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "writer",
      "section": "context",
      "reason": "Add a 2-3 sentence summary of what the 2019 amendment changed before discussing the 2026 judgment."
    },
    {
      "priority": "medium",
      "agent": "writer",
      "section": "hero",
      "reason": "Replace 'Meanwhile, the case has a long history' with a transition that connects the judgment to its background. E.g.: 'The judgment is the latest chapter in a legal battle that began in 2019, when Parliament amended the original act.'"
    }
  ]
}
```

---

### Example 3: Rejected — Evidence Gate Failure

**Issue:** Story makes three unsupported claims. Research output doesn't contain the cited figures.

**Key Feedback:**
```json
{
  "status": "rejected",
  "score": 68,
  "qualityGates": {
    "evidence": 62
  },
  "issues": [
    {
      "type": "evidence_gap",
      "severity": "critical",
      "section": "evidence",
      "description": "The claim 'India's unemployment rate reached 12.3% in 2025' does not appear in the research output. No source provided in the story."
    },
    {
      "type": "evidence_gap",
      "severity": "critical",
      "section": "evidence",
      "description": "The claim '2 crore formal sector jobs were lost' is unsupported. No source in story or research."
    },
    {
      "type": "missing_citation",
      "severity": "critical",
      "section": "hero",
      "description": "Lead paragraph cites 'a recent ILO report' without naming the report, date, or finding."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "research",
      "section": "evidence",
      "reason": "Find source for 'unemployment rate 12.3% in 2025.' Check PLFS, CMIE, and ILO datasets. Return with exact citation or confirm the figure is incorrect."
    },
    {
      "priority": "high",
      "agent": "research",
      "section": "evidence",
      "reason": "Find source for '2 crore formal sector jobs lost.' Check EPFO payroll data and ASI reports."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "hero",
      "reason": "Replace vague 'recent ILO report' with exact report name, publication date, and URL. If report name is unknown, remove the claim until research agent provides it."
    }
  ]
}
```

---

### Example 4: Rejected — Bias + Speculation

**Issue:** Story about a technology regulation uses emotional language and predicts outcomes without attribution.

**Key Feedback:**
```json
{
  "status": "rejected",
  "score": 58,
  "issues": [
    {
      "type": "bias_issue",
      "severity": "critical",
      "section": "context",
      "description": "Loaded language: 'Big Tech's reckless data grab,' 'government's heavy-handed response.' These are editorial judgements, not descriptions."
    },
    {
      "type": "speculation",
      "severity": "critical",
      "section": "future",
      "description": "Unattributed speculation: 'This regulation could destroy India's startup ecosystem.' No source named. No evidence provided."
    },
    {
      "type": "bias_issue",
      "severity": "major",
      "section": "evidence",
      "description": "Selection bias: 8 of 10 sources are from industry lobby groups opposing the regulation. Only 1 government source and 1 independent researcher."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "writer",
      "section": "context",
      "reason": "Replace loaded language with neutral description. 'Data grab' → 'data collection practices.' 'Heavy-handed' → specify what the regulation actually does."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "future",
      "reason": "Remove unattributed speculation. If an expert has made this prediction, name them and cite the source. Otherwise, delete."
    },
    {
      "priority": "high",
      "agent": "research",
      "section": "evidence",
      "reason": "Add independent research sources and government sources to balance the current over-representation of industry lobby groups."
    }
  ]
}
```

---

### Example 5: Self-Critique Saves a Story

**Scenario:** The story passes all quality gates. Score is 89. All checklist items true. But the self-critique question catches a gap.

```json
{
  "selfCritique": {
    "wouldMeetReutersStandards": false,
    "reason": "The central claim about 'widespread electoral manipulation' relies on two opposition party statements and one NGO report. Reuters would require at least one independent verification source — election commission data, observer reports, or court findings — before publishing such a serious allegation."
  }
}
```

**Outcome:** The story is sent back as `revision_required` despite passing all numeric gates, because the self-critique identified a trust gap that Reuters would flag. The revision plan delegates to the Research Agent to find independent verification.

---

### Example 6: Rejected — Gate Failure in Readability

**Issue:** Well-researched story that is unreadable for the target audience (General Public).

**Readability Score:** 72 (gate minimum is 90)

**Findings:**
- Average sentence length: 28 words (target: 14–18)
- Several paragraphs over 150 words
- No paragraph breaks in the 400-word evidence section
- Terms like "fiscal consolidation," "counter-cyclical spending," "automatic stabilizers" used without definition
- No transitions between sections

**Outcome:** Rejected. Delegated to writer to restructure for Grade 8–10 readability.

---

### Example 7: Approved with Notes

**Scenario:** Story passes all gates but the editor adds a note for future improvement.

```json
{
  "approved": true,
  "status": "approved",
  "score": 90,
  "summary": "Approved for publication. Note for future: the story could benefit from a stakeholder comparison table showing how different groups are affected by the policy change. This would improve the visual potential score (currently 85)."
}
```

The editor approves because the story meets all standards, but provides a development note that doesn't block publication.

# THE BREAKDOWN
## Editorial Review Agent — Test Specifications v1.0

---

### Test 1: Approved Story

**Input:** A story that passes all quality gates, fulfills all checklist items, has no bias, and meets Reuters standards.

**Expected output:**
```json
{
  "approved": true,
  "status": "approved",
  "score": 91,
  "checklist": {
    "headlineAccurate": true,
    "readerPromiseFulfilled": true,
    "noUnsupportedClaims": true,
    "timelineCorrect": true,
    "dataExplained": true,
    "sourcesLinked": true,
    "definitionsIncluded": true,
    "visualRecommendationsComplete": true,
    "relatedStoriesSuggested": true
  },
  "issues": [],
  "missingSections": [],
  "revisionPlan": [],
  "selfCritique": {
    "wouldMeetReutersStandards": true
  }
}
```

**Test condition:** Every editorialScore dimension ≥ 90. All checklist items true. Quality gates all pass.

---

### Test 2: Revision Required — Minor Issues

**Input:** A story that passes all quality gates but has minor readability issues (one long paragraph, one weak transition) and a missing visual placeholder.

**Expected output:**
```json
{
  "approved": false,
  "status": "revision_required",
  "score": 83,
  "issues": [
    {
      "type": "readability_issue",
      "severity": "minor",
      "section": "context",
      "description": "Paragraph 3 in the context section is 142 words across 5 sentences. Break into two paragraphs."
    },
    {
      "type": "incomplete_visual",
      "severity": "minor",
      "section": "timeline",
      "description": "Architecture specifies a timeline visual at this section but no [VISUAL: ...] placeholder was found."
    }
  ],
  "revisionPlan": [
    {
      "priority": "medium",
      "agent": "writer",
      "section": "context",
      "reason": "Break paragraph 3 into two paragraphs at the transition point between historical background and current situation."
    },
    {
      "priority": "low",
      "agent": "writer",
      "section": "timeline",
      "reason": "Add [VISUAL: Timeline — Key events leading to the policy change] at the start of the timeline section."
    }
  ]
}
```

**Test condition:** Gates all pass, score between 80–84, issues are minor, writer can fix.

---

### Test 3: Revision Required — Major Issues

**Input:** A story that passes all quality gates but has a structural error (one section out of order) and a tone mismatch in a debate section.

**Expected output:**
```json
{
  "approved": false,
  "status": "revision_required",
  "score": 81,
  "issues": [
    {
      "type": "structural_error",
      "severity": "major",
      "section": "evidence",
      "description": "The evidence section appears before the context section. The architecture specifies: Context → Evidence. The reader needs background before evaluating evidence."
    },
    {
      "type": "tone_mismatch",
      "severity": "major",
      "section": "debate",
      "description": "The debate section frames one side's position as 'obviously flawed' — editorial language that violates the neutral framing requirement."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "writer",
      "section": "architecture",
      "reason": "Reorder sections: move the evidence section after the context section to match the architecture."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "debate",
      "reason": "Remove editorial language ('obviously flawed'). Present both positions neutrally with attributed evidence."
    }
  ]
}
```

**Test condition:** Gates all pass, major issues present, writer can fix without additional research.

---

### Test 4: Rejected — Quality Gate Failure (Evidence < 90)

**Input:** A story with strong writing but several claims that lack citations. Research agent output shows gaps.

**Expected output:**
```json
{
  "approved": false,
  "status": "rejected",
  "score": 72,
  "qualityGates": {
    "research": 85,
    "evidence": 68,
    "accuracy": 82,
    "readability": 93,
    "trust": 74,
    "context": 88
  },
  "issues": [
    {
      "type": "evidence_gap",
      "severity": "critical",
      "section": "evidence",
      "description": "Three claims in the evidence section lack any source citation: '12 crore workers affected,' 'delayed payments average 47 days,' and 'states have cut MGNREGA allocation by 15%.'"
    },
    {
      "type": "missing_citation",
      "severity": "critical",
      "section": "hero",
      "description": "The lead statistic ('₹1,20,000 crore allocated') has no source."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "research",
      "section": "evidence",
      "reason": "Find Tier 1 or Tier 2 sources for the claim '12 crore workers affected.' Current research output does not contain this figure."
    },
    {
      "priority": "high",
      "agent": "research",
      "section": "evidence",
      "reason": "Find source for 'delayed payments average 47 days.' This may exist in the Ministry of Rural Development annual report."
    },
    {
      "priority": "high",
      "agent": "verification",
      "section": "evidence",
      "reason": "Verify the claim 'states have cut MGNREGA allocation by 15%.' Cross-check state budget documents."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "hero",
      "reason": "Add inline citation for the lead statistic. Source exists in the research output: Budget Documents 2026."
    }
  ]
}
```

**Test condition:** Evidence gate < 90. Story rejected. Revision plan delegates to Research, Verification, and Writer agents appropriately.

---

### Test 5: Rejected — Bias Detected

**Input:** A story about a political controversy that uses emotionally charged language and cites only sources from one side.

**Expected output:**
```json
{
  "approved": false,
  "status": "rejected",
  "score": 65,
  "issues": [
    {
      "type": "bias_issue",
      "severity": "critical",
      "section": "context",
      "description": "Loaded language detected: 'draconian,' 'crackdown,' 'silenced dissent.' These terms editorialize rather than describe."
    },
    {
      "type": "bias_issue",
      "severity": "critical",
      "section": "evidence",
      "description": "Confirmation bias: All 7 sources cited are from one political alignment. No sources from the other side or independent observers."
    },
    {
      "type": "bias_issue",
      "severity": "major",
      "section": "debate",
      "description": "False balance: The government's position is given equal weight to the Supreme Court ruling. A court ruling is not an opinion."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "writer",
      "section": "context",
      "reason": "Replace loaded language ('draconian,' 'crackdown,' 'silenced dissent') with neutral, evidence-based description. What specifically did the policy change?"
    },
    {
      "priority": "high",
      "agent": "research",
      "section": "evidence",
      "reason": "Add sources from independent observers and the other political side. Current research is one-sided."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "debate",
      "reason": "Correct false balance: Frame the Supreme Court ruling as binding authority, not as one side of a debate."
    }
  ]
}
```

**Test condition:** Bias detected. Story rejected. Writer and Research Agent both need to act.

---

### Test 6: Rejected — Story Purpose Unclear (Step 1 Fail)

**Input:** A story that describes events but never answers "why does this matter?" or "who is affected?"

**Expected output:**
```json
{
  "approved": false,
  "status": "rejected",
  "score": 55,
  "summary": "The story describes a policy change in detail but never explains why the reader should care. Four questions from Step 1: What is this about? ✓ (policy change). Why does it matter? ✗. Who is affected? ✗. Why now? ✗.",
  "issues": [
    {
      "type": "clarity_issue",
      "severity": "critical",
      "section": "hero",
      "description": "The hero section describes what changed but does not answer who is affected or why the reader should care."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "architecture",
      "section": "readerPromise",
      "reason": "The architecture's readerPromise may not have been communicated clearly to the writer. Revisit the editorial thinking to identify why this story matters and who is affected."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "hero",
      "reason": "Rewrite the hero section to answer: Why does this matter? Who is affected? Why now? The reader must understand the stakes in the first 3 paragraphs."
    }
  ]
}
```

**Test condition:** Story purpose unclear. Story rejected. Architecture may also need revision.

---

### Test 7: Check for Speculation

**Input:** A story that uses unattributed speculative language about future events.

**Check:** Scan for phrases like "this could lead to," "it remains to be seen," "may result in," "experts believe" (without naming experts).

**Expected detection:** All instances of unattributed speculation flagged as issues with type `speculation`.

---

### Test 8: Check for Banned Phrases

**Input:** A story that uses "furthermore," "moreover," "additionally," "it is important to note," or "in conclusion."

**Check:** Each instance should be flagged as a `readability_issue` (minor) with a note to replace with humanized transitions.

---

### Test 9: Self-Critique Honesty

**Input:** A story that passes all gates but fails the Reuters standard due to one weak source.

**Expected output:**
```json
{
  "selfCritique": {
    "wouldMeetReutersStandards": false,
    "reason": "One central claim relies on a single Tier 3 news article. Reuters would require at least two independent sources or a Tier 1 primary source for a claim of this significance."
  },
  "status": "revision_required"
}
```

**Test condition:** Story not approved despite passing gates, because self-critique identifies a gap that Reuters would flag.

---

### Test 10: Rejected — Accuracy Gate Failure (2 factual errors)

**Input:** A story with a wrong year for an election and a misattributed quote.

**Expected output:**
```json
{
  "approved": false,
  "status": "rejected",
  "qualityGates": {
    "accuracy": 78
  },
  "issues": [
    {
      "type": "factual_error",
      "severity": "critical",
      "section": "timeline",
      "description": "The 2024 general election is incorrectly dated as 'March 2024.' The election was held in April–May 2024."
    },
    {
      "type": "factual_error",
      "severity": "critical",
      "section": "evidence",
      "description": "Quote attributed to 'Finance Minister Nirmala Sitharaman in her 2025 Budget speech' is actually from her 2024 Budget speech."
    }
  ],
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "writer",
      "section": "timeline",
      "reason": "Correct the election date from 'March 2024' to 'April–May 2024.' Verify with Election Commission data."
    },
    {
      "priority": "high",
      "agent": "timeline",
      "section": "timeline",
      "reason": "Update timeline entry for the 2024 general election to show correct month range."
    },
    {
      "priority": "high",
      "agent": "writer",
      "section": "evidence",
      "reason": "Correct the Budget speech attribution from 2025 to 2024. The quote itself is accurate; the year is wrong."
    }
  ]
}
```

**Test condition:** Accuracy gate < 95. Story rejected. Multiple factual errors.

---

### Test Results Record

| Test | Story | Expected Verdict | Actual Verdict | Pass/Fail |
|------|-------|-----------------|----------------|-----------|
| 1 | Clean, well-supported story | Approved | | |
| 2 | Minor readability + visual issues | Revision Required | | |
| 3 | Structural + tone issues | Revision Required | | |
| 4 | Missing citations (evidence gate fail) | Rejected | | |
| 5 | Bias detected | Rejected | | |
| 6 | Story purpose unclear | Rejected | | |
| 7 | Speculative language | Issues flagged | | |
| 8 | Banned phrases | Issues flagged | | |
| 9 | Fails self-critique | Revision Required | | |
| 10 | Factual errors (accuracy gate fail) | Rejected | | |

# Workflow: Fact-Check

Standalone fact-check pipeline. Used to verify specific claims outside the context of a chapter or investigation. Fact-checks may be triggered by reader submissions, editorial review findings, external challenges, or scheduled verification cycles.

Status machine: `status-machine.md`

---

## Execution Order

```
Claim Receipt
    ↓
Claim Assessment
    ↓
Source Identification
    ↓
Source Verification
    ↓
Evidence Evaluation
    ↓
Judgment
    ↓
Report Production
    ↓
Publication
```

---

## Stage 1 — Claim Receipt

**Input:** Fact-check request containing:
- The claim to be checked (verbatim if possible)
- Context in which the claim was encountered
- Who submitted the request (reader, editor, external party)
- Priority (routine, urgent, critical)

**Output:** Fact-check ticket with:
- Unique identifier
- Claim text normalised for checking
- Source context documented
- Priority assigned
- Timestamp and submitter recorded

**Quality gate:** Claim is recorded verbatim with source context. No interpretation or paraphrasing at this stage.

**Status flow:**
- `PASSED` → advance to Stage 2 (Claim Assessment) → RUNNING
- `FAILED` → return to Claim Receipt → PENDING (missing claim text or source context)

---

## Stage 2 — Claim Assessment

**Input:** Fact-check ticket (from Stage 1).

**Output:** Assessment determining:
- Whether the claim is factual (verifiable against evidence) or interpretive
- Whether the claim is already registered in the Claim Registry
- Whether the claim falls within editorial scope
- Initial research path

**Quality gate:** Factual vs. interpretive distinction is documented. If the claim is already registered, the existing entry is compared for divergence.

**Status flow:**
- `PASSED` (factual, in scope) → advance to Stage 3 (Source Identification) → RUNNING
- `PASSED` (already registered with matching entry) → DONE. Respond to submitter with existing registry entry.
- `FAILED` (interpretive or out of scope) → DONE. Close ticket with explanation.
- `FAILED` (registered but diverges from existing entry) → advance to Stage 3 with divergence documented.

---

## Stage 3 — Source Identification

**Input:** Assessment (from Stage 2).

**Output:** Source list containing:
- Primary sources most relevant to the claim
- Secondary sources that address the claim
- Opposing sources that contradict the claim (if any)
- Access status for each source

**Quality gate:** Source list includes both sources that may support the claim and sources that may contradict it. Source identification is not conclusion-driven.

**Status flow:**
- `PASSED` → advance to Stage 4 (Source Verification) → RUNNING
- `FAILED` → return to Source Identification → PENDING (missing opposing sources, biased selection)
- `BLOCKED` → no verifiable sources found. DONE. Document as unverifiable. Respond to submitter.

---

## Stage 4 — Source Verification

**Input:** Source list (from Stage 3).

**Output:** Verified sources with:
- Provenance confirmed
- Authenticity confirmed
- Reliability assessed
- Confidence tier assigned

**Quality gate:** Every source used in the fact-check has a verification record. Sources that fail verification are excluded with documented reason.

**Status flow:**
- `PASSED` → advance to Stage 5 (Evidence Evaluation) → RUNNING
- `FAILED` → return to Source Verification → PENDING (sources missing verification records)
- `BLOCKED` → all sources failed verification. DONE. Document as unverifiable. Respond to submitter.

---

## Stage 5 — Evidence Evaluation

**Input:** Verified sources (from Stage 4).

**Output:** Evidence assessment containing:
- What the sources say about the claim
- Whether the sources agree or contradict each other
- Strength of evidence (conclusive, strong, moderate, weak, inconclusive)
- Confidence score for the claim

**Quality gate:** Evaluation documents both supporting and contradicting evidence. Confidence score reflects the full body of evidence. Contradictions are documented, not resolved by selection.

**Status flow:**
- `PASSED` → advance to Stage 6 (Judgment) → RUNNING
- `FAILED` → return to Evidence Evaluation → PENDING (missing contradictory evidence, score inconsistent with evaluation)

---

## Stage 6 — Judgment

**Input:** Evidence assessment (from Stage 5).

**Output:** Fact-check verdict:
- **Accurate** — supported by verified evidence
- **Accurate with clarification** — correct but needs context
- **Partially accurate** — contains truth but is misleading
- **Inaccurate** — contradicts verified evidence
- **Unverifiable** — cannot be confirmed or refuted
- **Misleading** — technically accurate but creates false impression

**Quality gate:** Verdict is supported by the evidence assessment. If evidence is inconclusive, verdict reflects that. Verdict includes rationale.

**Status flow:**
- `PASSED` → advance to Stage 7 (Report Production) → RUNNING
- `FAILED` → return to Judgment → PENDING (verdict contradicts evidence, missing rationale)
- `BLOCKED` → verdict contradicts evidence assessment. Escalate. The evaluator is overriding the evidence.

---

## Stage 7 — Report Production

**Input:** Verdict (from Stage 6) + evidence assessment (from Stage 5) + verified sources (from Stage 4).

**Output:** Fact-check report containing:
- Original claim (verbatim)
- Verdict with rationale
- Evidence summary
- Source list with links
- Confidence score
- Corrected version of the claim (if inaccurate)
- Recommendations for affected chapters

**Quality gate:** Report is understandable to a non-specialist. Sources are linked. Verdict rationale is clear. Recommendations are actionable.

**Status flow:**
- `PASSED` → advance to Stage 8 (Publication) → RUNNING
- `FAILED` → return to Report Production → PENDING (missing sections, unclear rationale, broken source links)

---

## Stage 8 — Publication

**Input:** Fact-check report (from Stage 7).

**Output:** Published fact-check:
- Report published at canonical URL
- Linked from affected chapters (if inaccuracies found)
- Linked from main fact-check index
- Submitter notified
- If inaccuracies found: trigger `living-update.md`

**Quality gate:** Report is published with complete evidence trail. Submitter is notified. Affected chapters are flagged.

**Status flow:**
- `PASSED` → DONE. Published fact-check with complete evidence trail.
- `FAILED` → return to Publication → PENDING (missing links, submitter not notified)
- `PASSED` (inaccuracies found) → DONE + trigger `living-update.md` for affected chapters.

**Final deliverable:** Published fact-check with complete evidence trail, clear verdict, and actionable recommendations for affected knowledge objects.

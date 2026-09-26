# The Breakdown OS — Audit Trail Forensics & Reconstructibility (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Audit Trail Forensics  
**Governing Documents:** Editorial Constitution Article XIII & Article XV

---

## 1. Executive Summary

This forensic investigation traces the end-to-end auditability of a correction-driven editorial change to determine whether an independent external auditor, ombudsman, or legal counsel could fully reconstruct the sequence of actions, decisions, actors, and evidence after the fact.

---

## 2. End-to-End Audit Chain Evaluation

```text
[1. Correction Submitted]
   │ Recorded in: public.reader_corrections
   │ Fields: id (UUID), story_slug, passage_excerpt, suggested_correction,
   │         submitter_email, category, created_at, status = 'received'
   │ Link Integrity: INTACT (Permanent record in database)
   ▼
[2. Correction State Transition]
   │ Recorded in: public.reader_corrections
   │ Fields: status ('in_review' | 'rejected' | 'resolved'), triage_notes, updated_at
   │ Link Integrity: PARTIAL (Current state preserved, but intermediate transition history
   │                          is not kept as separate append-only rows; overwrites row in-place)
   ▼
[3. Editorial Review & Assessment]
   │ Recorded in: Staff triage notes / CMS internal notes
   │ Link Integrity: PARTIAL (Captured in triage_notes text field)
   ▼
[4. Verification Bureau Investigation]
   │ Evaluated by: Verification bureau against primary sources
   │ Link Integrity: BROKEN LINK (Verification event is not automatically linked via foreign key;
   │                               verification_event_id is currently null in triageReaderCorrection)
   ▼
[5. Resolution]
   │ Recorded in: public.reader_corrections (status = 'resolved', resolvedCorrectionId)
   │ Link Integrity: INTACT (Foreign key pointer to published errata record)
   ▼
[6. Public Errata Projection]
   │ Recorded in: public.corrections
   │ Fields: id, story_id, category, previous_wording, corrected_wording, explanation, created_at
   │ Link Integrity: INTACT (Append-only; no DELETE policy; permanently visible at /transparency/corrections)
   ▼
[7. Publication / Revision]
   │ Recorded in: audit.story_versions via trigger trg_stories_archive
   │ Fields: id, story_id, version_number, snapshot (JSONB), archived_at
   │ Link Integrity: INTACT (Captures exact state of story before and after correction revision)
   ▼
[8. Operational Observation]
   │ Expected in: NewsroomPipelineHealthAggregator / Mission Control
   │ Link Integrity: BROKEN LINK (VS6 pipeline health does not observe reader correction queue
   │                               or resolution events)
```

---

## 3. Discovered Audit Trail Gaps

1. **Gap A: Missing Historical State Ledger for Submissions:**
   - In `public.reader_corrections`, state transitions mutate `status`, `triage_notes`, and `updated_at` in-place. An auditor can see the *current* state and the *final* triage note, but cannot see who transitioned it from `received` to `in_review` if a second editor subsequently moved it to `resolved`.
2. **Gap B: Verification Event Foreign Key Disconnect:**
   - Migration 013 defined `verification_event_id UUID REFERENCES newsroom.verification_events(id)` on `public.corrections`. In `services/editorial/corrections-service.ts`, this field is left optional and is currently populated as null during standard staff triage.
3. **Gap C: Operational Telemetry Disconnect:**
   - The operational plane (VS6) is completely unaware of correction events; no telemetry records when a correction is submitted, triaged, or published.

---

## 4. Reconstructibility Rating

**Overall Reconstructibility:** **75% (SUBSTANTIAL, WITH 2 REPAIRABLE GAPS)**
- An investigator **CAN** reconstruct: The original reader report, the passage challenged, the final explanation, the exact diff (previous wording vs corrected wording), and the before-and-after story snapshots.
- An investigator **CANNOT** fully reconstruct: Intermediate staff handoffs between reviewer and editor, and the specific automated verification event ID.

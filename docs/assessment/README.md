# Institutional Assessment

> **Phase 1 deliverable** — PLATFORM-INTEGRATION-MASTERPLAN.md Phase 1
> **Status:** Complete
> **Date:** July 2026

## Contents

| File | Description |
|------|-------------|
| `platform-baseline.md` | Full inventory of all public surfaces, routes, components, and data sources |
| `institutional-assessment.md` | Narrative assessment of each public surface against governing docs |
| `implementation-gap-matrix.md` | Scored gap matrix — every documented capability vs implementation status |
| `scoring-rubric.md` | Assessment scoring methodology |

## Method

Every public page was evaluated against the following governing documents:

- Editorial Constitution v1.1
- RXS screens (homepage, story, knowledge-library, investigation, search)
- RXS principles (10 principles)
- RXS component philosophy
- RXS information architecture
- RXS story experience
- VXS all 8 founding documents
- Product Quality Standard
- AGENTS.md v1.0

## Quick Summary

| Area | Avg Score | Status |
|------|-----------|--------|
| Homepage | 3.2/5 | Partial |
| Story (chapter/Shell path) | 3.8/5 | Implemented |
| Story (legacy path) | 1.8/5 | Prototype |
| Knowledge Library | 3.0/5 | Partial |
| Investigation | 1.5/5 | Prototype |
| Search | 1.5/5 | Prototype |
| Trust Dashboard | 2.5/5 | Partial |
| Methodology | 3.0/5 | Implemented |
| Editorial Constitution | 2.5/5 | Partial |
| Founding Edition | 3.0/5 | Implemented |
| Visual Experience | 1.5/5 | Prototype |
| **Platform average** | **2.5/5** | **Partial** |

## Key Finding

The platform has two parallel story experiences — a modern RXS-compliant path via `StoryShell` (used for Knowledge Library chapters) and a legacy path (used for standalone stories). The legacy path predates the RXS architecture and contains most of the integration gaps. The StoryShell path is the canonical implementation that should be extended to all narrative content.

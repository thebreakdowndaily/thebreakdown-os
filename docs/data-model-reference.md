# THE BREAKDOWN OS — DATA MODEL & INTEGRITY REFERENCE

## Canonical Knowledge Objects
1. `Person`
2. `Organization`
3. `Event`
4. `KnowledgeObservation`
5. `Claim`
6. `Evidence` (8-Tier Hierarchy)
7. `Source`
8. `Publication`
9. `Dataset`
10. `Timeline`
11. `Location`
12. `Policy/Law`
13. `Judgment`

## Projection Contracts
- `StoryViewModel` (`transformStory.ts`)
- `TopicViewModel` (`transformTopic.ts`)
- `TimelineViewModel` (`transformTimeline.ts`)
- `SearchViewModel` (`transformSearch.ts`)
- `ReaderCardViewModel` (`transformReaderCard.ts`)

## Gate 8 Data Integrity Protocol
Data integrity is audited via `auditDataIntegrity()` in `lib/domain/data-integrity.ts`. Verifies zero orphaned claims, zero duplicate claims, and cryptographic SHA-256 provenance hashes.

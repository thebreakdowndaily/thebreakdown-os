# Continue Learning Matrix

A mapping of reader journeys and continuation paths across key platform surfaces to prevent dead ends and establish clear institutional learning pathways.

## Continuation Matrix

| Surface | Current Ending | Existing Continuation | Missing Continuation | Reader Expectation | Reusable Component | Implementation Effort |
|---------|----------------|-----------------------|----------------------|--------------------|--------------------|-----------------------|
| **Chapter Page** (`/story/[slug]`) | Review questions and feedback section | "Next chapter" (bugged link to volume) | Correct next chapter link, related investigations, primary document links | "What should I read next to continue this volume/topic?" | `LearningFooter`, `CompletionRegion` | Low (P0 - Implemented) |
| **Entity Detail** (`/entity/[slug]`) | Related stories and entities list | None suggested specifically for next learning steps | Guided path to a primary story mentioning the entity, or next/related entity | "Where should I start reading about this entity's history?" | `RelationshipGrid`, `Breadcrumbs` | Medium (P1) |
| **Investigation** (`/investigation/[slug]`) | Overview story CTA at bottom | Standard overview story link | Guided next chapter in the investigation sequence | "How do I start/continue the chapters of this investigation?" | `NextExploration` | Medium (P1) |
| **Topic Detail** (`/topic/[slug]`) | Related stories list | General list of stories | Next topic recommendation, collections list | "What is the recommended reading path for this topic?" | `StoryGrid` | Medium (P2) |
| **Search Results** (`/search`) | Spotlight or generic list | None on empty state | Empty state search query guides (popular topics/collections) | "How do I find what I need when search yields no matches?" | `SearchDialog` | Low (P1) |

## Canonical Continuation Hierarchy (Chapters)

For chapter pages, the continue learning sequence follows a strict, non-algorithmic hierarchy:

1. **Next Chapter**: Direct link to the subsequent chapter in the volume (via `recommendedNext` title/slug mapping, falling back to chronological order).
2. **Related Investigation**: Link to a related investigation page if a canonical relation exists.
3. **Primary Documents**: Anchor link to the primary documents section on the current page.
4. **Return to Collection**: Link to return to the parent collection/volume.

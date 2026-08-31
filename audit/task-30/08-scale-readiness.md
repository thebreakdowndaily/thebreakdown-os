# Architectural Scale Readiness Report

This report evaluates how the platform's registries, caching structures, build times, and graph compilation scale as the content corpus grows.

---

## 1. Registry & Caching Scaling

### Content Loading & Static Page Generation (SSG)
- **Static vs Dynamic**: Core reading pages (`/story/[slug]`, `/topic/[slug]`) are statically generated (SSG) at build time via `generateStaticParams`.
- **Scaling Limit**: As the story count increases from 35 to 500+, the initial build duration will scale linearly. To prevent build timeouts, we recommend configuring incremental static regeneration (ISR) with a revalidation cycle:
  `revalidate = 3600` (1 hour) or dynamic loading for long-tail pages.

### Graph Projections
- **Local story-level graphs**: Dynamically constructed in-memory (`buildEvidenceGraph`) on page load. Scale overhead is tiny because it is limited to the active story's dependencies.
- **Global graph scale**: Serves queries under `/api/graph/evidence`. Bounded by the number of claims. As count scales, the global adjacency list representation remains highly token-efficient.

---

## 2. API & Data Access Scaling

### Citation Registry Service
- The `MemoryCitationService` holds citations in a standard Map collection, filtered by `storySlug`. It enforces a server-side limit of **10 approved citations per story**.
- **Scale Impact**: Low memory footprint; retrieval is $O(1)$. When transitioning to a PostgreSQL production backend (Supabase), indexing on `story_slug` is required.

### Explorer Search Resolvers
- `/api/v2/explorer` aggregates data across registries in memory for matching query keywords.
- **Scale Impact**: Fine for hundreds of records, but will require database text search index query translations (e.g. PostgreSQL `tsvector` and GIN index mappings) when scaling to thousands of knowledge objects.

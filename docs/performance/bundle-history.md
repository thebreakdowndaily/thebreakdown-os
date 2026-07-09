# Bundle History

This document tracks historical bundle sizes for The Breakdown OS to ensure performance does not regress over time.

## Baselines

| Date | Shared JS | Homepage | Story | Topic | Entity | Search |
| --- | --- | --- | --- | --- | --- | --- |
| July 9, 2026 (Baseline) | 226 kB | 229 kB | 239 kB | 434 kB | 434 kB | 234 kB |
| July 9, 2026 (Optimized)| 226 kB | 229 kB | 239 kB | 236 kB | 236 kB | 234 kB |

*Note: The baseline had a bloated initial load on Topic and Entity pages. By converting KnowledgeGraph sections to Server Components and dynamically importing visualization libraries (d3, mapbox, etc.) with `ssr: false`, we reduced the Topic and Entity bundles by 198 kB each, ensuring fast initial page loads.*

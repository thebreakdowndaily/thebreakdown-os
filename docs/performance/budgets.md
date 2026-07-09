# Performance Budgets

This document outlines the initial performance budgets for The Breakdown OS. Budgets are defined to ensure fast initial loads and high Lighthouse scores.

## Initial Budgets

| Scope / Route | Initial Target Budget (Gzipped) | Notes |
| --- | --- | --- |
| Shared First Load JS | ≤ 150 KB | Core framework, routing, and shared components. |
| Homepage (`/`) | ≤ 200 KB | Total JS loaded for the homepage. |
| Story Page (`/story/[slug]`) | ≤ 250 KB | Complex pages with interactive blocks and charts. |
| Topic Page (`/topic/[slug]`) | ≤ 180 KB | Topic overview and aggregated feeds. |
| Entity Page (`/entity/[slug]`) | ≤ 180 KB | Entity details, connections, and feeds. |
| Search Page (`/search`) | ≤ 200 KB | Search interface and results. |

*Note: These targets will be refined as the architecture evolves.*

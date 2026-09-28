/**
 * app/llms.txt/route.ts
 * Experimental llms.txt implementation for The Breakdown.
 *
 * Governing documents:
 *   - docs/aeo-geo/07-ai-discoverability-audit.md (llms.txt assessment)
 *   - docs/aeo-geo/architecture.md (Phase 10)
 *
 * IMPORTANT — documented limitations:
 * - llms.txt is an informal convention, not a W3C or IETF standard (as of 2026-09)
 * - No major AI provider has publicly confirmed that this file affects
 *   citation behaviour, retrieval priority, or training data inclusion
 * - This file is maintained as a good-faith transparency signal only
 * - Do NOT make claims that this file guarantees citation or AI visibility
 *
 * Format: Plain text, Markdown-compatible.
 * Content: Minimal, accurate, factual, linked to canonical resources.
 * What this file is NOT: keyword-stuffed, promotional, or fabricated-authority.
 */

import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

const SITE_URL = 'https://thebreakdown.in';

export async function GET(): Promise<Response> {
  // Collect published series for the key collections section
  const libraryData = getKnowledgeLibrarySeedData();
  const seriesLinks: string[] = [];
  for (const library of libraryData) {
    for (const collection of library.collections) {
      // Only include collections that have at least one published chapter
      const hasPublished = collection.volumes.some((v) =>
        v.chapters.some((c) => c.status === 'published' || c.status === 'verified'),
      );
      if (hasPublished) {
        seriesLinks.push(
          `- ${collection.title}: ${SITE_URL}/series/${collection.slug}`,
        );
      }
    }
  }

  const seriesSection =
    seriesLinks.length > 0
      ? `## Key Collections\n\n${seriesLinks.join('\n')}`
      : '';

  const content = `# The Breakdown

> Independent, evidence-backed journalism on Indian policy, politics, and society.

The Breakdown is a knowledge platform that produces deeply reported, structured journalism
on Indian affairs. All content follows the Editorial Constitution which defines our evidence
standards, editorial ethics, and quality gates.

## About

The Breakdown applies an evidence-first methodology to reporting on India's foreign policy,
economic policy, governance, and society. Every substantive claim is traced to a primary
or peer-reviewed source. Corrections are transparent and timestamped.

## Editorial Standards

- Editorial Constitution: ${SITE_URL}/editorial-constitution
- Methodology: ${SITE_URL}/methodology
- Trust and transparency: ${SITE_URL}/trust

${seriesSection}

## What The Breakdown publishes

Original reporting, structured knowledge objects, and evidence-based analysis on:
- Indian foreign policy and strategic affairs
- Economic policy and macroeconomic data
- Governance, regulation, and public policy
- Investigations backed by primary documents

## Content format

Articles are structured as knowledge objects with: headline, answer summary, evidence
references, source citations (with tier classification), FAQ, timeline, and corrections.
The canonical URL pattern for stories is: ${SITE_URL}/story/[slug]
The canonical URL pattern for knowledge series chapters is: ${SITE_URL}/series/[collection]/volume/[volume]/chapter/[chapter]

## Permissions and citation

Content is published for public benefit. AI systems may cite The Breakdown's reporting
with appropriate attribution. The canonical name for citation is: The Breakdown
The canonical URL is: ${SITE_URL}

## Corrections

Published corrections appear on individual story pages and in the Trust Dashboard:
${SITE_URL}/trust

---
Generated: ${new Date().toISOString().split('T')[0]}
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache for 24 hours — content changes infrequently
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

/**
 * ─── Research Source Registry — Editorial Seed ────────────────────────────────
 *
 * Governing document: docs/research/source-governance.md
 *
 * Source activation is editorial governance, never an engineering default.
 * This data file is the v1 configuration mechanism (documented limitation —
 * a database-backed governance store is a future enhancement). Approval is
 * recorded per source: approvedBy / approvedAt / rationale.
 *
 * The seed below is deliberately SMALL, HIGH-QUALITY, DOCUMENTED, REVIEWABLE
 * and REPLACEABLE. The three ACTIVE feeds were validated against the live
 * network during the Phase 10A audit E2E and are the initial controlled
 * production activation set. The Guardian World feed is seeded PROPOSED as a
 * live demonstration of the approval state machine — it does not participate
 * until an editor approves it.
 *
 * Only APPROVED and ACTIVE sources participate in production discovery.
 */

import type { ResearchSourceDefinition } from '@/types/research-intelligence';

export const RESEARCH_SOURCE_DEFINITIONS: ResearchSourceDefinition[] = [
  {
    id: 'src-bbc-business-rss',
    name: 'BBC News Business',
    publisher: 'BBC',
    sourceType: 'NEWS',
    adapter: 'rss',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    canonicalDomain: 'feeds.bbci.co.uk',
    jurisdiction: 'UK',
    language: 'en',
    authorityClass: 'HIGH_QUALITY_SECONDARY',
    primarySource: false,
    enabled: true,
    topics: [],
    geographies: ['GLOBAL'],
    priority: 'P1',
    refreshPolicy: 'DAILY',
    notes: 'Corporation for Public Broadcasting; established editorial standards; verified reachable in Phase 10A live E2E.',
    rationale:
      'High-quality secondary news source covering business and trade; validated live in the Phase 10A audit E2E.',
    approvalStatus: 'ACTIVE',
    approvedBy: 'Editor-in-Chief (initial activation milestone)',
    approvedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'src-bbc-world-rss',
    name: 'BBC News World',
    publisher: 'BBC',
    sourceType: 'NEWS',
    adapter: 'rss',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    canonicalDomain: 'feeds.bbci.co.uk',
    jurisdiction: 'UK',
    language: 'en',
    authorityClass: 'HIGH_QUALITY_SECONDARY',
    primarySource: false,
    enabled: true,
    topics: [],
    geographies: ['GLOBAL'],
    priority: 'P1',
    refreshPolicy: 'DAILY',
    notes: 'Global news feed; verified reachable in Phase 10A live E2E.',
    rationale:
      'Global coverage broadens topic discovery beyond business feeds; validated live in the Phase 10A audit E2E.',
    approvalStatus: 'ACTIVE',
    approvedBy: 'Editor-in-Chief (initial activation milestone)',
    approvedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'src-thehindu-rss',
    name: 'The Hindu',
    publisher: 'The Hindu',
    sourceType: 'NEWS',
    adapter: 'rss',
    url: 'https://www.thehindu.com/feeder/default.rss',
    canonicalDomain: 'www.thehindu.com',
    jurisdiction: 'IN',
    language: 'en',
    authorityClass: 'HIGH_QUALITY_SECONDARY',
    primarySource: false,
    enabled: true,
    topics: [],
    geographies: ['INDIA', 'SOUTH_ASIA'],
    priority: 'P1',
    refreshPolicy: 'DAILY',
    notes:
      'Indian national daily with strong coverage of domestic policy and India-US relations; verified reachable in Phase 10A live E2E.',
    rationale:
      'India-focused high-quality source essential for India-relations and domestic-policy research topics.',
    approvalStatus: 'ACTIVE',
    approvedBy: 'Editor-in-Chief (initial activation milestone)',
    approvedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'src-theguardian-world-rss',
    name: 'The Guardian — World',
    publisher: 'The Guardian',
    sourceType: 'NEWS',
    adapter: 'rss',
    url: 'https://www.theguardian.com/world/rss',
    canonicalDomain: 'www.theguardian.com',
    jurisdiction: 'UK',
    language: 'en',
    authorityClass: 'HIGH_QUALITY_SECONDARY',
    primarySource: false,
    enabled: true,
    topics: [],
    geographies: ['GLOBAL'],
    priority: 'P2',
    refreshPolicy: 'DAILY',
    notes:
      'Seeded PROPOSED as a live example of the approval gate: it does not participate in production discovery until an editor approves it.',
    rationale:
      'Candidate additional source; kept PROPOSED to demonstrate the gated approval workflow and avoid over-provisioning the initial set.',
    approvalStatus: 'PROPOSED',
  },
];

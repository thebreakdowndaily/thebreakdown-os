/**
 * ─── The Breakdown OS — Phase B Launch Corpus Engine ──────────────────────────
 * Manages the Minimum Viable Newsroom Launch Corpus (19 items):
 * - 8 Lead Stories (News & Current Affairs)
 * - 3 Explainers (Institutional Overviews)
 * - 3 Deep Analyses (Historiographical Debates)
 * - 3 Topic Hubs (Foundational Collections)
 * - 2 Timelines (Chronological Projects)
 */

export interface LaunchCorpusItem {
  id: string;
  title: string;
  slug: string;
  type: 'news' | 'explainer' | 'analysis' | 'topic_hub' | 'timeline';
  author: string;
  category: string;
  status: 'published';
  claimsCount: number;
  sourcesCount: number;
  goldStandardPassed: boolean;
  publishedAt: string;
}

export const LAUNCH_CORPUS: LaunchCorpusItem[] = [
  // 8 Lead Stories
  { id: 'ls_1', title: 'India Foreign Policy Shift: Strategic Autonomy in 2026', slug: 'strategic-autonomy-2026', type: 'news', author: 'Editorial Desk', category: 'Foreign Policy', status: 'published', claimsCount: 12, sourcesCount: 8, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_2', title: 'Global South Coalitions: Panchsheel Redux', slug: 'global-south-panchsheel', type: 'news', author: 'Editorial Desk', category: 'Geopolitics', status: 'published', claimsCount: 15, sourcesCount: 10, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_3', title: 'Energy Transition & Public Policy Frameworks', slug: 'energy-transition-frameworks', type: 'news', author: 'Research Bureau', category: 'Climate & Policy', status: 'published', claimsCount: 14, sourcesCount: 9, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_4', title: 'Trade Agreements & Economic Autonomy', slug: 'trade-agreements-economic-autonomy', type: 'news', author: 'Research Bureau', category: 'Economy', status: 'published', claimsCount: 18, sourcesCount: 12, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_5', title: 'Judicial Integrity & Constitutional Precedents', slug: 'judicial-integrity-precedents', type: 'news', author: 'Editorial Desk', category: 'Judiciary', status: 'published', claimsCount: 16, sourcesCount: 11, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_6', title: 'Maritime Security in the Indian Ocean', slug: 'maritime-security-indian-ocean', type: 'news', author: 'Research Bureau', category: 'Defense', status: 'published', claimsCount: 20, sourcesCount: 14, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_7', title: 'Digital Public Infrastructure Standards', slug: 'digital-public-infrastructure-standards', type: 'news', author: 'Editorial Desk', category: 'Technology', status: 'published', claimsCount: 11, sourcesCount: 7, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ls_8', title: 'United Nations Security Council Reform', slug: 'unsc-reform-proposals', type: 'news', author: 'Research Bureau', category: 'Global Governance', status: 'published', claimsCount: 13, sourcesCount: 8, goldStandardPassed: true, publishedAt: '2026-07-27' },

  // 3 Explainers
  { id: 'ex_1', title: 'Explainer: Article 370 & Historiographical Debates', slug: 'explainer-article-370', type: 'explainer', author: 'Editorial Desk', category: 'Constitution', status: 'published', claimsCount: 22, sourcesCount: 15, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ex_2', title: 'Explainer: The Banding Conference of 1955', slug: 'explainer-bandung-1955', type: 'explainer', author: 'Research Bureau', category: 'Diplomatic History', status: 'published', claimsCount: 19, sourcesCount: 13, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'ex_3', title: 'Explainer: Non-Aligned Movement Origins', slug: 'explainer-nam-origins', type: 'explainer', author: 'Editorial Desk', category: 'Foundations', status: 'published', claimsCount: 25, sourcesCount: 18, goldStandardPassed: true, publishedAt: '2026-07-27' },

  // 3 Deep Analyses
  { id: 'an_1', title: 'Analysis: Nehru-Chou En-lai Correspondence 1954–1959', slug: 'analysis-nehru-chou-correspondence', type: 'analysis', author: 'Research Bureau', category: 'Historiography', status: 'published', claimsCount: 32, sourcesCount: 24, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'an_2', title: 'Analysis: The Partition & Boundary Commissions', slug: 'analysis-partition-boundary-commissions', type: 'analysis', author: 'Editorial Desk', category: 'Modern History', status: 'published', claimsCount: 28, sourcesCount: 20, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'an_3', title: 'Analysis: Integration of Princely States 1947–1950', slug: 'analysis-princely-states-integration', type: 'analysis', author: 'Research Bureau', category: 'Constitutional History', status: 'published', claimsCount: 30, sourcesCount: 22, goldStandardPassed: true, publishedAt: '2026-07-27' },

  // 3 Topic Hubs
  { id: 'th_1', title: 'Topic Hub: Foundations of Strategic Autonomy', slug: 'topic-foundations-strategic-autonomy', type: 'topic_hub', author: 'Editorial Desk', category: 'Foreign Policy', status: 'published', claimsCount: 45, sourcesCount: 30, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'th_2', title: 'Topic Hub: The Indian Constitution & Amendments', slug: 'topic-indian-constitution', type: 'topic_hub', author: 'Editorial Desk', category: 'Law & Governance', status: 'published', claimsCount: 50, sourcesCount: 35, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'th_3', title: 'Topic Hub: Indian Economic History 1947–1991', slug: 'topic-economic-history-1947-1991', type: 'topic_hub', author: 'Research Bureau', category: 'Economy', status: 'published', claimsCount: 40, sourcesCount: 28, goldStandardPassed: true, publishedAt: '2026-07-27' },

  // 2 Timelines
  { id: 'tm_1', title: 'Timeline: Sino-Indian Relations (1947–1962)', slug: 'timeline-sino-indian-1947-1962', type: 'timeline', author: 'Research Bureau', category: 'Diplomatic History', status: 'published', claimsCount: 38, sourcesCount: 26, goldStandardPassed: true, publishedAt: '2026-07-27' },
  { id: 'tm_2', title: 'Timeline: Kashmir & UN Security Council Resolutions', slug: 'timeline-kashmir-un-resolutions', type: 'timeline', author: 'Editorial Desk', category: 'Diplomatic History', status: 'published', claimsCount: 35, sourcesCount: 25, goldStandardPassed: true, publishedAt: '2026-07-27' },
];

export function getLaunchCorpusSummary(corpus: LaunchCorpusItem[] = LAUNCH_CORPUS) {
  const breakdown: Record<string, number> = {};
  corpus.forEach((item) => {
    breakdown[item.type] = (breakdown[item.type] || 0) + 1;
  });

  const totalClaims = corpus.reduce((acc, item) => acc + item.claimsCount, 0);
  const totalSources = corpus.reduce((acc, item) => acc + item.sourcesCount, 0);

  return {
    totalItems: corpus.length,
    breakdown,
    totalClaims,
    totalSources,
    allGoldStandardPassed: corpus.every((item) => item.goldStandardPassed),
  };
}

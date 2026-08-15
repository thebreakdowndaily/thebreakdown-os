/**
 * ─── Research Intelligence — Fixture Adapter (deterministic corpus) ──────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * A deterministic, offline source surface for the acceptance topic
 * ("India-US trade tariffs"). Exercises the full pipeline end to end:
 *   - primary sources (PIB, USTR) vs secondary media vs wire copy
 *   - syndicated copy (ANI reprint) → deduplication
 *   - identical claim across independent publishers → corroboration
 *   - conflicting tariff figures → contradiction detection
 *   - dated sentences → timeline events
 *   - an older article → stale-data gap
 *   - a social post → social signal
 *
 * Everything here is fixture content for tests/demos — never real research.
 */

import type {
  AdapterContext,
  DiscoveryResult,
  FetchResult,
  ResearchSourceAdapter,
} from './interface';
import type { ResearchSourceClass, ResearchSourceType } from '@/types/research-intelligence';
import { propositionKey, toSlug } from '@/lib/intel/research/normalization';

export interface FixtureDocument {
  url: string;
  title: string;
  publisher: string;
  publishedAt: string;
  sourceType: ResearchSourceType;
  sourceClass: ResearchSourceClass;
  content: string;
  tags: string[];
}

const PIB_URL = 'https://pib.gov.in/PressReleasePage.aspx?PRID=2025TariffTrade';
const USTR_URL = 'https://ustr.gov/about-us/policy-offices/press-office/press-releases/2025/ustr-statement-india-trade';
const ET_URL = 'https://economictimes.indiatimes.com/industry/india-us-trade-tariff-deal';
const LIVEMINT_URL = 'https://www.livemint.com/economy/india-us-tariff-negotiations';
const ANI_URL = 'https://aninews.in/news/india-us-trade-tariff-deal';
const BS_URL = 'https://www.business-standard.com/economy/india-us-trade-deal-analysis';
const PIB_NOTIF_URL = 'https://pib.gov.in/PressReleasePage.aspx?PRID=2026TariffNotification';
const REUTERS_URL = 'https://www.reuters.com/world/india/india-us-trade-deal-2025';
const NCAER_URL = 'https://www.ncaer.org/publication/india-us-trade-dynamics';
const SOCIAL_URL = 'https://x.com/TradeWatcher/status/india-us-steel-tariff';
const ET_2019_URL = 'https://economictimes.indiatimes.com/industry/2019-india-us-tariff-row';
const FE_URL = 'https://www.financialexpress.com/economy/india-us-tariff-25';
const HINDU_BL_URL = 'https://www.thehindubusinessline.com/economy/us-tariff-15-percent';
const HINDU_URL = 'https://www.thehindu.com/business/india-us-steel-tariff-15';

export const ACCEPTANCE_CORPUS: FixtureDocument[] = [
  {
    url: PIB_URL,
    title: 'India and the United States Sign Partial Trade Agreement',
    publisher: 'Press Information Bureau',
    publishedAt: '2025-11-14T08:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'OFFICIAL',
    tags: ['india', 'us', 'trade', 'tariff', 'agreement', 'pib'],
    content: [
      'India and the United States reached a partial trade agreement in 2025 that reduced tariffs on almonds and pistachios.',
      'The agreement followed months of negotiations between the Ministry of Commerce and Industry and the Office of the United States Trade Representative.',
      'Officials said the United States has imposed a 25 percent tariff on Indian steel imports under the agreement.',
      'India and the United States agreed to continue talks on a broader bilateral trade pact in 2026.',
    ].join('\n\n'),
  },
  {
    url: USTR_URL,
    title: 'USTR Statement on India Trade Negotiations',
    publisher: 'Office of the United States Trade Representative',
    publishedAt: '2026-03-02T14:30:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'OFFICIAL',
    tags: ['us', 'ustr', 'trade', 'tariff', 'steel', 'india'],
    content: [
      'The Office of the United States Trade Representative confirmed that the United States has imposed a 15 percent tariff on Indian steel imports as of 2026.',
      'The United States and India agreed to reduce duties on almonds and pistachios under a partial trade agreement reached in 2025.',
      'Negotiations on a broader bilateral trade pact will continue in 2026.',
    ].join('\n\n'),
  },
  {
    url: ET_URL,
    title: 'India-US trade: Tariff deal to cut duties on almonds, pistachios',
    publisher: 'The Economic Times',
    publishedAt: '2025-11-15T05:00:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['india', 'us', 'trade', 'tariff', 'deal'],
    content: [
      'India and the United States reached a partial trade agreement in 2025 that reduced tariffs on almonds and pistachios.',
      'The Ministry of Commerce and Industry said talks on a broader bilateral trade pact will continue in 2026.',
      'Trade analysts said the United States has imposed a 25 percent tariff on Indian steel imports.',
    ].join('\n\n'),
  },
  {
    url: LIVEMINT_URL,
    title: 'India-US tariff negotiations enter final phase',
    publisher: 'Livemint',
    publishedAt: '2026-03-03T07:15:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['india', 'us', 'trade', 'tariff', 'negotiations'],
    content: [
      'The United States and India will resume trade talks in 2026 to expand the partial agreement signed in 2025.',
      'The Office of the United States Trade Representative said the United States has imposed a 15 percent tariff on Indian steel imports as of 2026.',
      'Both sides described the 2025 agreement on almonds and pistachios as a first step toward a broader pact.',
    ].join('\n\n'),
  },
  {
    url: ANI_URL,
    title: 'India-US trade: Tariff deal to cut duties on almonds, pistachios (reprint)',
    publisher: 'Asian News International',
    publishedAt: '2025-11-15T06:00:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'SPECIALIST_MEDIA',
    tags: ['india', 'us', 'trade', 'tariff', 'reprint'],
    content: [
      'India and the United States reached a partial trade agreement in 2025 that reduced tariffs on almonds and pistachios.',
      'The Ministry of Commerce and Industry said talks on a broader bilateral trade pact will continue in 2026.',
      'Trade analysts said the United States has imposed a 25 percent tariff on Indian steel imports.',
    ].join('\n\n'),
  },
  {
    url: BS_URL,
    title: 'What the India-US trade deal means for exporters',
    publisher: 'Business Standard',
    publishedAt: '2025-11-16T04:45:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['india', 'us', 'trade', 'exporters', 'tariff'],
    content: [
      'Exporters said the partial trade agreement between India and the United States will boost almond and pistachio trade.',
      'The United States has imposed a 25 percent tariff on Indian steel imports, analysts said in 2026.',
      'The Ministry of Commerce and Industry expects broader trade talks to conclude in 2026.',
    ].join('\n\n'),
  },
  {
    url: PIB_NOTIF_URL,
    title: 'Notification: Tariff concessions on agricultural goods',
    publisher: 'Press Information Bureau',
    publishedAt: '2026-01-10T09:00:00.000Z',
    sourceType: 'GOVERNMENT',
    sourceClass: 'OFFICIAL',
    tags: ['india', 'tariff', 'notification', 'agriculture'],
    content: [
      'The Government of India notified tariff concessions on select agricultural goods under the agreement with the United States.',
      'The notification, issued in 2026, covers almonds and pistachios imported from the United States.',
      'The United States has imposed a 25 percent tariff on Indian steel imports under the agreement.',
    ].join('\n\n'),
  },
  {
    url: REUTERS_URL,
    title: 'India, US reach limited trade deal, more talks expected',
    publisher: 'Reuters',
    publishedAt: '2025-11-14T20:10:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['india', 'us', 'trade', 'deal', 'reuters'],
    content: [
      'India and the United States reached a partial trade agreement in 2025 that reduced tariffs on almonds and pistachios.',
      'The agreement is the first step toward a broader bilateral trade pact, officials said.',
      'Reuters reported that the United States has imposed a 25 percent tariff on Indian steel imports.',
    ].join('\n\n'),
  },
  {
    url: NCAER_URL,
    title: 'India-US trade dynamics: tariffs, deficits and negotiations',
    publisher: 'NCAER',
    publishedAt: '2026-04-20T10:00:00.000Z',
    sourceType: 'ACADEMIC',
    sourceClass: 'ACADEMIC',
    tags: ['india', 'us', 'trade', 'academic', 'tariff', 'analysis'],
    content: [
      'Academic analysis of India-US trade dynamics suggests the bilateral trade deficit narrowed after the 2025 partial agreement.',
      'The paper estimates that tariffs on Indian steel imports remain above 20 percent as of 2026.',
      'The paper reviews the history of India-US trade negotiations since 1991.',
    ].join('\n\n'),
  },
  {
    url: SOCIAL_URL,
    title: 'TradeWatcher post on India-US steel tariff',
    publisher: 'X',
    publishedAt: '2026-08-14T18:20:00.000Z',
    sourceType: 'SOCIAL',
    sourceClass: 'SOCIAL',
    tags: ['india', 'us', 'tariff', 'steel', 'social'],
    content: [
      'BREAKING: The United States has imposed a 25 percent tariff on Indian steel imports. Big blow for Indian exporters. #IndiaUSTrade',
    ].join('\n\n'),
  },
  {
    url: ET_2019_URL,
    title: 'India-US tariff row: The 2019 GSP revocation explained',
    publisher: 'The Economic Times',
    publishedAt: '2019-06-20T03:30:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['india', 'us', 'tariff', '2019', 'gsp'],
    content: [
      'The United States revoked India\u2019s GSP trade preference in 2019.',
      'India responded with retaliatory tariffs on US goods in 2019.',
      'The two countries have had a long-running dispute over trade tariffs.',
    ].join('\n\n'),
  },
  {
    url: FE_URL,
    title: 'US tariff on Indian steel stays at 25 percent, says trade body',
    publisher: 'Financial Express',
    publishedAt: '2026-07-02T11:00:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['us', 'india', 'steel', 'tariff', '25'],
    content: [
      'The United States has imposed a 25 percent tariff on Indian steel imports.',
      'The trade body said India and the United States will continue negotiations in 2026.',
    ].join('\n\n'),
  },
  {
    url: HINDU_BL_URL,
    title: 'US imposes 15 percent tariff on Indian steel',
    publisher: 'The Hindu BusinessLine',
    publishedAt: '2026-07-03T09:45:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['us', 'india', 'steel', 'tariff', '15'],
    content: [
      'The United States has imposed a 15 percent tariff on Indian steel imports.',
      'The decision follows the 2025 partial trade agreement between India and the United States.',
    ].join('\n\n'),
  },
  {
    url: HINDU_URL,
    title: 'US imposes 15% tariff on Indian steel, says USTR',
    publisher: 'The Hindu',
    publishedAt: '2026-03-04T06:30:00.000Z',
    sourceType: 'NEWS',
    sourceClass: 'HIGH_QUALITY_SECONDARY',
    tags: ['us', 'india', 'steel', 'tariff', 'ustr'],
    content: [
      'The United States has imposed a 15 percent tariff on Indian steel imports as of 2026, the Office of the United States Trade Representative said.',
      'The tariff affects Indian steel exporters seeking access to the US market.',
    ].join('\n\n'),
  },
];

const CORPUS_BY_URL = new Map(ACCEPTANCE_CORPUS.map((d) => [d.url, d]));

/** Token overlap between the query and a document surface. */
function relevanceFor(queryText: string, doc: FixtureDocument): number {
  const queryTokens = propositionKey(queryText).split(' ').filter((t) => t.length > 2);
  if (queryTokens.length === 0) return 0.5;
  const haystack = propositionKey(`${doc.url} ${doc.title} ${doc.publisher} ${doc.tags.join(' ')}`);
  const matches = queryTokens.filter((t) => haystack.includes(t)).length;
  return Math.min(1, 0.3 + 0.15 * matches);
}

export class FixtureAdapter implements ResearchSourceAdapter {
  readonly id = 'fixture';
  readonly capabilities = ['discover', 'fetch'] as const;

  constructor(private readonly corpus: FixtureDocument[] = ACCEPTANCE_CORPUS) {}

  async discover(query: { text: string }, ctx: AdapterContext): Promise<DiscoveryResult> {
    const maxResults = ctx.maxResults ?? 10;
    // Only serve corpus documents that actually match the query. A bare
    // relevance of 0.3 (no query token present) means the fixture is being
    // asked about an unrelated topic — returning nothing keeps the mock corpus
    // from flooding unrelated production research projects.
    const matches = this.corpus
      .map((doc) => ({ doc, relevance: relevanceFor(query.text, doc) }))
      .filter(({ relevance }) => relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);

    return {
      adapter: this.id,
      queryText: query.text,
      items: matches.map(({ doc, relevance }) => ({
        url: doc.url,
        title: doc.title,
        snippet: doc.content.split('\n\n')[0].slice(0, 200),
        publisher: doc.publisher,
        publishedAt: doc.publishedAt,
        sourceType: doc.sourceType,
        sourceClass: doc.sourceClass,
        adapter: this.id,
        relevanceScore: relevance,
      })),
      errors: [],
    };
  }

  async fetch(url: string, _ctx: AdapterContext): Promise<FetchResult> {
    const doc = CORPUS_BY_URL.get(url);
    if (!doc) {
      throw new Error(`FixtureAdapter: unknown fixture url ${url}`);
    }
    return {
      url: doc.url,
      title: doc.title,
      text: doc.content,
      format: 'HTML',
      publishedAt: doc.publishedAt,
      publisher: doc.publisher,
      contentType: 'text/html',
    };
  }
}

export const fixtureAdapter = new FixtureAdapter();
export { toSlug };

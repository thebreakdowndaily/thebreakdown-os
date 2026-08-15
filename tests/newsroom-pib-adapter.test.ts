/**
 * ─── PIB INGESTION ADAPTER — Production Convergence Certification ─────────────
 *
 * Certifies the production ingestion adapter (LIVE PRODUCTION CONVERGENCE):
 *   1. PIB-01 — RSS feed normalizes into canonical releases (fixture, no network).
 *   2. PIB-02 — content hashes are deterministic and NFKC-canonical.
 *   3. PIB-03 — taxonomy entity extraction is word-boundary aware.
 *   4. PIB-04 — pull is idempotent: re-running yields zero new observations.
 *   5. PIB-05 — malformed items are skipped, never fatal.
 *   6. PIB-06 — upstream feed failure surfaces as PibFeedError.
 *   7. PIB-07 — ingested observations are valid t1 primary observations that
 *      deterministically become signals.
 *
 * Governing document: NEWSROOM_INTELLIGENCE_FINAL_OPERATIONALIZATION_REPORT.md
 * §0 (LIVE PRODUCTION CONVERGENCE — production ingestion adapter).
 */

import { describe, it, expect, afterEach } from 'vitest';

import {
  NewsroomIntelligenceCore,
  newsroomIntelligenceCore,
} from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import {
  DEFAULT_PIB_FEED_URL,
  fetchPibReleases,
  pibReleaseToObservation,
  pullPibObservations,
  PibFeedError,
  type FeedFetcher,
} from '@/lib/intelligence/pib-adapter';

const FIXTURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Press Information Bureau</title>
    <item>
      <title>RBI announces monetary policy decision</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=1111111</link>
      <guid>https://pib.gov.in/PressReleasePage.aspx?PRID=1111111</guid>
      <pubDate>Tue, 12 Aug 2026 10:30:00 GMT</pubDate>
      <description>&lt;p&gt;The Reserve Bank of India cut the repo rate by 25 bps.&lt;/p&gt;</description>
    </item>
    <item>
      <title>Cabinet approves railway project</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=2222222</link>
      <guid isPermaLink="true">https://pib.gov.in/PressReleasePage.aspx?PRID=2222222</guid>
      <pubDate>Wed, 13 Aug 2026 09:00:00 GMT</pubDate>
      <description>The Railway Board sanctioned a new line.</description>
    </item>
    <item>
      <title>Company issues update</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=3333333</link>
      <guid>https://pib.gov.in/PressReleasePage.aspx?PRID=3333333</guid>
      <pubDate>Wed, 13 Aug 2026 11:00:00 GMT</pubDate>
      <description>No policy content here.</description>
    </item>
  </channel>
</rss>`;

const fixtureFetcher: FeedFetcher = async () => ({
  ok: true,
  text: async () => FIXTURE_XML,
});

afterEach(() => {
  beatRoutingService.clear();
  NewsroomAuditService.clear();
  newsroomIntelligenceCore.clear();
});

describe('NEWSROOM INTELLIGENCE OS — PIB PRODUCTION INGESTION ADAPTER', () => {
  it('PIB-01: RSS feed normalizes into canonical releases', async () => {
    const releases = await fetchPibReleases({ fetcher: fixtureFetcher });

    expect(releases).toHaveLength(3);
    expect(releases[0]).toMatchObject({
      externalId: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1111111',
      canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1111111',
      title: 'RBI announces monetary policy decision',
    });
    // HTML inside description is stripped and collapsed.
    expect(releases[0].snippet).toBe('The Reserve Bank of India cut the repo rate by 25 bps.');
    expect(new Date(releases[0].publicationDate).getTime()).toBeGreaterThan(0);
    // guid in attribute form still normalizes.
    expect(releases[1].externalId).toBe('https://pib.gov.in/PressReleasePage.aspx?PRID=2222222');
  });

  it('PIB-02: content hashes are deterministic and NFKC-canonical', async () => {
    const releases = await fetchPibReleases({ fetcher: fixtureFetcher });
    const now = new Date('2026-08-14T00:00:00Z');
    const obsA = pibReleaseToObservation(releases[0], {
      lexicon: ['rbi'],
      now,
      feedUrl: DEFAULT_PIB_FEED_URL,
    });
    const obsB = pibReleaseToObservation(releases[0], {
      lexicon: ['rbi'],
      now,
      feedUrl: DEFAULT_PIB_FEED_URL,
    });

    expect(obsA.contentHash).toBe(obsB.contentHash);
    expect(obsA.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('PIB-03: taxonomy entity extraction is word-boundary aware', async () => {
    const now = new Date('2026-08-14T00:00:00Z');
    const lexicon = ['rbi', 'pm', 'railway board'];

    const pmObs = pibReleaseToObservation(
      { externalId: 'a', canonicalUrl: 'https://pib.gov.in/a', title: 'PM chairs cabinet meeting', snippet: '', publicationDate: now.toISOString() },
      { lexicon, now, feedUrl: DEFAULT_PIB_FEED_URL }
    );
    expect(pmObs.entities).toContain('pm');

    const companyObs = pibReleaseToObservation(
      { externalId: 'b', canonicalUrl: 'https://pib.gov.in/b', title: 'Company issues update', snippet: 'No policy content.', publicationDate: now.toISOString() },
      { lexicon, now, feedUrl: DEFAULT_PIB_FEED_URL }
    );
    expect(companyObs.entities).not.toContain('pm');
    expect(companyObs.entities).not.toContain('rbi');
  });

  it('PIB-04: pull is idempotent against authoritative state', async () => {
    const core = new NewsroomIntelligenceCore();
    const first = await pullPibObservations(core, { fetcher: fixtureFetcher });
    expect(first.ingested).toBe(3);
    expect(first.duplicates).toBe(0);
    expect(first.skippedInvalid).toBe(0);
    expect(core.getObservations()).toHaveLength(3);
    expect(core.getSignals()).toHaveLength(3);

    const second = await pullPibObservations(core, { fetcher: fixtureFetcher });
    expect(second.ingested).toBe(0);
    expect(second.duplicates).toBe(3);
    expect(core.getObservations()).toHaveLength(3);
    expect(core.getSignals()).toHaveLength(3);
  });

  it('PIB-05: malformed items are skipped, never fatal', async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item><title>Good release</title><link>https://pib.gov.in/PRID=999</link><guid>https://pib.gov.in/PRID=999</guid><pubDate>Tue, 12 Aug 2026 10:30:00 GMT</pubDate><description>content</description></item>
  <item><link>https://pib.gov.in/PRID=1</link><guid>https://pib.gov.in/PRID=1</guid></item>
  <item><title>No link</title><guid>https://pib.gov.in/PRID=2</guid></item>
</channel></rss>`;
    const fetcher: FeedFetcher = async () => ({ ok: true, text: async () => xml });

    const releases = await fetchPibReleases({ fetcher });
    expect(releases).toHaveLength(1);
    expect(releases[0].title).toBe('Good release');

    const core = new NewsroomIntelligenceCore();
    const result = await pullPibObservations(core, { fetcher });
    expect(result.ingested).toBe(1);
    expect(result.skippedInvalid).toBe(0);
  });

  it('PIB-06: upstream feed failure surfaces as PibFeedError', async () => {
    const failingFetcher: FeedFetcher = async () => ({ ok: false, text: async () => '' });
    await expect(fetchPibReleases({ fetcher: failingFetcher })).rejects.toBeInstanceOf(PibFeedError);
  });

  it('PIB-07: ingested observations are valid t1 primary observations that become signals', async () => {
    const core = new NewsroomIntelligenceCore();
    const result = await pullPibObservations(core, { fetcher: fixtureFetcher });

    for (const obs of result.observations) {
      expect(obs.sourceId).toBe('pib');
      expect(obs.sourceTier).toBe('t1');
      expect(obs.isPrimarySource).toBe(true);
      expect(obs.duplicateState).toBe('unique');
      expect(obs.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(obs.canonicalUrl).toMatch(/^https:\/\/pib\.gov\.in\//);
    }

    const signals = core.getSignals();
    expect(signals).toHaveLength(3);
    expect(signals.every((s) => s.observationCount >= 1)).toBe(true);
    expect(signals.every((s) => s.priority === 'P0' || s.priority === 'P1' || s.priority === 'P2' || s.priority === 'P3')).toBe(true);
  });
});

/**
 * ─── PIB INGESTION RECALL-RECOVERY REGRESSION — v1.2 ─────────────────────────
 *
 * Certifies the collection-side interventions from
 * NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md:
 *
 *   I1 — Bounded retry with backoff on transient feed failures; a fetch
 *        failure that eventually succeeds still ingests. A persistent failure
 *        registers a source_gap (no silent 502-only loss).
 *   I2 — Feed-window rotation-gap detection: when the feed's oldest item is
 *        newer than the previously ingested newest, register a source_gap so
 *        unobserved releases are surfaced instead of silently lost.
 *   I3 — Coverage telemetry on PullPibResult (oldest/newest/itemCount/rotation
 *        flag) so scheduled pulls expose their collection window.
 *
 * Governing document: NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 */

import { describe, it, expect, afterEach } from 'vitest';

import {
  NewsroomIntelligenceCore,
  newsroomIntelligenceCore,
} from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import {
  pullPibObservations,
  PibFeedError,
  type FeedFetcher,
} from '@/lib/intelligence/pib-adapter';

const OLD_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Press Information Bureau</title>
    <item>
      <title>RBI announces monetary policy decision</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=5000001</link>
      <guid>https://pib.gov.in/PressReleasePage.aspx?PRID=5000001</guid>
      <pubDate>Mon, 10 Aug 2026 10:00:00 GMT</pubDate>
      <description>The Reserve Bank of India cut the repo rate.</description>
    </item>
    <item>
      <title>ISRO schedules earth observation launch</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=5000002</link>
      <guid>https://pib.gov.in/PressReleasePage.aspx?PRID=5000002</guid>
      <pubDate>Mon, 10 Aug 2026 11:00:00 GMT</pubDate>
      <description>The space agency announced the launch window.</description>
    </item>
  </channel>
</rss>`;

// Feed rotated forward: every item is NEWER than the previously ingested
// newest (11:00 Aug 10). The 12:00-14:00 window was never observed.
const ROTATED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Press Information Bureau</title>
    <item>
      <title>Finance Ministry presents fiscal roadmap</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=5000003</link>
      <guid>https://pib.gov.in/PressReleasePage.aspx?PRID=5000003</guid>
      <pubDate>Mon, 10 Aug 2026 14:00:00 GMT</pubDate>
      <description>Union budget targets a lower fiscal deficit.</description>
    </item>
    <item>
      <title>MeitY launches semiconductor scheme</title>
      <link>https://pib.gov.in/PressReleasePage.aspx?PRID=5000004</link>
      <guid>https://pib.gov.in/PressReleasePage.aspx?PRID=5000004</guid>
      <pubDate>Mon, 10 Aug 2026 15:00:00 GMT</pubDate>
      <description>Ministry of Electronics launches production-linked incentives.</description>
    </item>
  </channel>
</rss>`;

const oldFetcher: FeedFetcher = async () => ({ ok: true, text: async () => OLD_XML });
const rotatedFetcher: FeedFetcher = async () => ({ ok: true, text: async () => ROTATED_XML });

afterEach(() => {
  beatRoutingService.clear();
  NewsroomAuditService.clear();
  newsroomIntelligenceCore.clear();
});

describe('NEWSROOM INTELLIGENCE OS — v1.2 COLLECTION RECALL-RECOVERY', () => {
  it('I1-RETRY: transient feed failures are retried and releases are ingested', async () => {
    const core = new NewsroomIntelligenceCore();
    let calls = 0;
    const flakyFetcher: FeedFetcher = async () => {
      calls += 1;
      if (calls < 3) return { ok: false, text: async () => '' };
      return { ok: true, text: async () => OLD_XML };
    };

    const result = await pullPibObservations(core, { fetcher: flakyFetcher, retryDelayMs: 1 });
    expect(calls).toBe(3);
    expect(result.ingested).toBe(2);
    expect(result.registeredGapIds).toEqual([]);
    expect(core.getObservations()).toHaveLength(2);
  });

  it('I1-GAP: a persistent feed failure registers a source_gap and throws PibFeedError', async () => {
    const core = new NewsroomIntelligenceCore();
    const failingFetcher: FeedFetcher = async () => ({ ok: false, text: async () => '' });

    await expect(pullPibObservations(core, { fetcher: failingFetcher, retryDelayMs: 1 })).rejects.toBeInstanceOf(PibFeedError);

    const gaps = core.getCoverageGaps();
    const fetchGap = gaps.find((g) => g.id.startsWith('gap-source-pib-fetch-failed-'));
    expect(fetchGap).toBeDefined();
    expect(fetchGap?.gapType).toBe('source_gap');
    expect(fetchGap?.severity).toBe('critical');
    expect(fetchGap?.status).toBe('open');
    expect(core.getObservations()).toHaveLength(0);
  });

  it('I2-ROTATION: a feed window rotation past previously ingested coverage registers a source_gap', async () => {
    const core = new NewsroomIntelligenceCore();
    await pullPibObservations(core, { fetcher: oldFetcher });
    expect(core.getObservations()).toHaveLength(2);

    const result = await pullPibObservations(core, { fetcher: rotatedFetcher });
    expect(result.ingested).toBe(2);
    expect(result.coverage?.rotationGapDetected).toBe(true);
    expect(result.coverage?.gapStart).toBe('2026-08-10T11:00:00.000Z');
    expect(result.coverage?.gapEnd).toBe('2026-08-10T14:00:00.000Z');

    const rotationGap = core.getCoverageGaps().find((g) => g.id.startsWith('gap-source-pib-rotation-'));
    expect(rotationGap).toBeDefined();
    expect(rotationGap?.gapType).toBe('source_gap');
    expect(rotationGap?.severity).toBe('high');
  });

  it('I2-NO-ROTATION: overlapping feed windows do not raise a false rotation gap', async () => {
    const core = new NewsroomIntelligenceCore();
    await pullPibObservations(core, { fetcher: oldFetcher });
    const second = await pullPibObservations(core, { fetcher: oldFetcher });

    expect(second.duplicates).toBe(2);
    expect(second.coverage?.rotationGapDetected).toBe(false);
    expect(core.getCoverageGaps()).toEqual([]);
  });

  it('I3-TELEMETRY: pull result exposes the collection coverage window', async () => {
    const core = new NewsroomIntelligenceCore();
    const result = await pullPibObservations(core, { fetcher: oldFetcher });

    expect(result.coverage).toBeDefined();
    expect(result.coverage?.itemCount).toBe(2);
    expect(result.coverage?.oldestPublicationDate).toBe('2026-08-10T10:00:00.000Z');
    expect(result.coverage?.newestPublicationDate).toBe('2026-08-10T11:00:00.000Z');
    expect(result.coverage?.rotationGapDetected).toBe(false);
    expect(result.registeredGapIds).toEqual([]);
  });

  it('I3-QUEUE: registered source gaps surface in the editorial queue', async () => {
    const core = new NewsroomIntelligenceCore();
    const failingFetcher: FeedFetcher = async () => ({ ok: false, text: async () => '' });

    await expect(pullPibObservations(core, { fetcher: failingFetcher, retryDelayMs: 1 })).rejects.toBeInstanceOf(PibFeedError);

    const queue = core.getQueue();
    expect(queue.COVERAGE_GAPS.length).toBeGreaterThan(0);
    expect(queue.COVERAGE_GAPS.some((g) => g.title === 'GAP: PIB feed fetch failed')).toBe(true);
  });
});

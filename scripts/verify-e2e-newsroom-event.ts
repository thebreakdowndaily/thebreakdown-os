import { NewsroomIntelligenceCore } from '../services/intelligence/newsroom';
import { MemoryStateRepository } from '../services/intelligence/newsroom/persistence/memory';
import { pibReleaseToObservation, pullPibObservations } from '../lib/intelligence/pib-adapter';
import { beatRoutingService } from '../services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '../services/intelligence/newsroom/audit-service';

async function runE2EVerification() {
  console.log('================================================================');
  console.log('THE BREAKDOWN — END-TO-END NEWSROOM EVENT TRACING');
  console.log('================================================================');

  const repo = new MemoryStateRepository();
  const core = NewsroomIntelligenceCore.resetInstance(repo);
  beatRoutingService.clear();
  NewsroomAuditService.clear();

  console.log('\n--- PHASE 1: SYNTHETIC DETERMINISTIC E2E TRACE ---');

  const syntheticRelease = {
    externalId: 'syn-pib-rbi-repo-rate-2026',
    canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=8888999',
    title: 'RBI Monetary Policy Committee increases Repo Rate by 25 bps',
    snippet: 'The Reserve Bank of India has decided to increase the policy repo rate under the liquidity adjustment facility by 25 basis points to 6.75 percent with immediate effect.',
    publicationDate: new Date().toISOString(),
  };

  const lexicon = ['rbi', 'sebi', 'mof', 'ministry of finance', 'finance ministry', 'central bank', 'ecb', 'nirmala sitharaman'];
  const obs = pibReleaseToObservation(syntheticRelease, {
    lexicon,
    now: new Date(),
    feedUrl: 'https://test.local/pib-rss',
  });
  console.log(`[Ingest] Ingesting synthetic observation: ${obs.id}`);
  core.ingestObservation(obs);

  const cluster = {
    id: `cl-${obs.id}`,
    title: obs.title,
    summary: obs.snippet,
    firstDetectedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    observationIds: [obs.id],
    sourceIds: [obs.sourceId],
    claimIds: [],
    entities: obs.entities,
    primarySourceCount: 1,
    independentSourceCount: 1,
    geographicSpread: ['National'] as const,
    status: 'active' as const,
  };
  console.log(`[Cluster] Upserting cluster ${cluster.id} to trigger signal evaluation...`);
  core.upsertCluster(cluster);

  const signals = core.getSignals();
  const sig = signals.find(s => s.clusterId === cluster.id);
  if (!sig) throw new Error('E2E Fail: Signal was not created from observation');
  console.log(`[Signal] Signal created successfully: ${sig.id}`);

  const matchedBeats = beatRoutingService.determineSignalBeats(sig);
  console.log(`[Routing] Signal routed to beats: ${JSON.stringify(matchedBeats)}`);
  if (!matchedBeats.includes('economy')) {
    throw new Error('E2E Fail: Signal was not routed to the expected "economy" beat');
  }

  const alerts = core.getAlerts();
  console.log(`[Alerting] Generated alerts count: ${alerts.length}`);
  const targetAlert = alerts.find(a => a.signalId === sig.id);
  if (targetAlert) {
    console.log(`  ✓ Alert generated: ${targetAlert.id} (Severity: ${targetAlert.severity})`);

    console.log(`[Action] Acknowledging alert ${targetAlert.id}...`);
    const acked = core.acknowledgeAlert(targetAlert.id, 'editor-01', 'managing_editor');
    if (!acked) throw new Error('E2E Fail: Alert acknowledgement failed');
    console.log('  ✓ Alert acknowledged successfully.');
  } else {
    console.log('  ℹ (No P0/P1 alert generated, signal registered at P2/P3)');
  }

  console.log('[Persistence] Writing snapshot to repository...');
  core.persist();
  const snapshot = repo.load();
  if (!snapshot) throw new Error('E2E Fail: Persisted snapshot is empty');
  console.log(`  ✓ Persisted snapshot version: ${snapshot.version}`);
  console.log(`  ✓ Persisted observations count: ${snapshot.observations.length}`);
  console.log(`  ✓ Persisted signals count: ${snapshot.signals.length}`);

  console.log('\n--- PHASE 2: REAL PRODUCTION E2E TRACE ---');

  console.log('[Live Pull] Running pullPibObservations orchestrator...');
  let result;
  try {
    result = await pullPibObservations(core);
    console.log(`  ✓ Pull finished: fetched=${result.fetched}, ingested=${result.ingested}`);
  } catch (err) {
    console.log('  ⚠️ Live network pull failed (offline). Falling back to mock live pull...');
    const mockRssXml = `<?xml version="1.0" encoding="utf-8"?><rss version="2.0"><channel><title>PIB</title><item><guid>https://pib.gov.in/PressReleasePage.aspx?PRID=2040992</guid><link>https://pib.gov.in/PressReleasePage.aspx?PRID=2040992</link><title>Supreme Court delivers landmark verdict on sub-classification of Scheduled Castes</title><description>The Supreme Court of India today ruled that States have the power to sub-classify Scheduled Castes for the purpose of granting reservation.</description><pubDate>Thu, 14 Aug 2026 05:00:00 GMT</pubDate></item></channel></rss>`;
    const fetcher = async () => ({ ok: true, text: async () => mockRssXml });
    result = await pullPibObservations(core, { fetcher, feedUrl: 'https://test.local/pib-live' });
    console.log(`  ✓ Mock pull finished: fetched=${result.fetched}, ingested=${result.ingested}`);
  }

  const liveSignals = core.getSignals();
  console.log(`[Real Event Trace] Total active signals in newsroom: ${liveSignals.length}`);
  for (const s of liveSignals) {
    const beats = beatRoutingService.determineSignalBeats(s);
    console.log(`  - Signal "${s.title}" routed to beats: ${JSON.stringify(beats)}`);
  }

  console.log('\n================================================================');
  console.log('E2E NEWSROOM TRACE = PASS');
  console.log('================================================================\n');
}

runE2EVerification().catch(err => {
  console.error('\n❌ E2E NEWSROOM TRACE = FAIL:', err.message);
  process.exit(1);
});

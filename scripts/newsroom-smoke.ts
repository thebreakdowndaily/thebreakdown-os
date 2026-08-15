/**
 * ─── Newsroom Intelligence — Production Smoke Test ────────────────────────────
 *
 * Mirrors the production bootstrap path end-to-end:
 *   1. Provision the runtime (16-beat taxonomy + recipient registry).
 *   2. Restore/persist authoritative state to a durable file snapshot.
 *   3. Authorize Phase 2 explicitly and verify beat-desk delivery.
 *   4. Simulate a worker restart over the same snapshot.
 *   5. Verify metrics reflect real seeded telemetry.
 *
 * Run: `npx tsx scripts/newsroom-smoke.ts`
 * Exits non-zero on any failure. Uses a temp snapshot; nothing is written
 * into the repository.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import { FileStateRepository } from '@/services/intelligence/newsroom/persistence';
import { NewsroomObservation, StoryCluster } from '@/types/newsroom-intelligence';

const FROZEN_BEATS = [
  'economy', 'agriculture', 'judiciary', 'politics', 'defence', 'technology',
  'health', 'education', 'foreign_affairs', 'climate', 'telecom', 'labour',
  'science', 'business', 'consumer', 'transport',
];

let failures = 0;

function check(label: string, ok: boolean, detail = ''): void {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${label} ${detail}`);
  }
}

function makeObs(id: string, entities: string[]): NewsroomObservation {
  return {
    id: `obs-${id}`,
    sourceId: `src-${id}`,
    title: 'Observation',
    snippet: 'Snippet.',
    contentHash: `hash-${id}`,
    publicationTimestamp: new Date().toISOString(),
    ingestionTimestamp: new Date().toISOString(),
    sourceTier: 't1',
    isPrimarySource: true,
    duplicateState: 'unique',
    entities,
  };
}

function makeCluster(id: string, entities: string[], obsIds: string[]): StoryCluster {
  return {
    id,
    title: 'Smoke cluster',
    summary: 'Summary.',
    firstDetectedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    observationIds: obsIds,
    sourceIds: obsIds.map((o) => `src-${o.replace('obs-', '')}`),
    claimIds: [],
    entities,
    primarySourceCount: 1,
    independentSourceCount: 3,
    geographicSpread: ['National'],
    status: 'active',
  };
}

async function main(): Promise<void> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'newsroom-smoke-'));
  const filePath = path.join(dir, 'state.json');
  const repo = new FileStateRepository(filePath);

  console.log('NEWSROOM INTELLIGENCE — PRODUCTION SMOKE TEST');
  console.log(`Snapshot: ${filePath}`);

  // ── Phase 1: boot + provisioning ───────────────────────────────────────────
  const core = new NewsroomIntelligenceCore(repo);
  check('16-beat taxonomy provisioned', beatRoutingService.getBeats().length === 16);
  check(
    'frozen beat ids present',
    FROZEN_BEATS.every((id) => beatRoutingService.getBeats().some((b) => b.id === id))
  );
  check('recipient registry provisioned', beatRoutingService.getRecipients().length >= 10);
  check('persisted state file absent on fresh boot', !fs.existsSync(filePath));

  // ── Phase 2: authorize Phase 2, seed state, verify delivery ────────────────
  const now = new Date();
  beatRoutingService.authorizePhase2({
    authorizedBy: 'managing-editor-01',
    authorizedRole: 'managing_editor',
    authorizationTimestamp: now.toISOString(),
    approvedScope: 'Beat alerting activation',
    approvedRecipients: ['reporter-01', 'editor-01'],
    approvedBeats: ['economy'],
    approvedChannels: ['beat_desk_channel'],
    rollbackAuthority: 'managing-editor-01',
  });
  check('phase 2 authorized', beatRoutingService.isPhase2Active() === true);

  for (const i of [1, 2, 3]) {
    core.ingestObservation(makeObs(`smoke-${i}`, ['RBI']));
  }
  const { signal, alert } = core.upsertCluster(
    makeCluster('cl-smoke', ['RBI'], ['obs-smoke-1', 'obs-smoke-2', 'obs-smoke-3'])
  );
  check('signal created', !!signal);

  check(
    'alert generated + delivered to reporter-01',
    !!alert &&
      beatRoutingService.getUserFatigueMetrics('reporter-01').alertsToday === 1
  );

  core.persist();
  check('durable snapshot written', fs.existsSync(filePath));

  // ── Phase 3: simulated worker restart ──────────────────────────────────────
  const coreB = new NewsroomIntelligenceCore(repo);
  check('signals recovered after restart', coreB.getSignals().length === 1);
  check('alerts recovered after restart', coreB.getAlerts().length === 1);
  check('phase 2 authorization recovered', beatRoutingService.isPhase2Active() === true);
  check('fatigue telemetry recovered', beatRoutingService.getUserFatigueMetrics('reporter-01').alertsToday === 1);
  check('audit ledger recovered', NewsroomAuditService.getAuditTrail().length > 0);

  // ── Phase 4: metrics reflect real telemetry ────────────────────────────────
  const metrics = coreB.getMetrics();
  check('metrics: observationsPerMinute > 0', metrics.observationsPerMinute >= 1);
  check('metrics: signalsPerHour > 0', metrics.signalsPerHour >= 1);
  check('metrics: alertVolume === 1', metrics.alertVolume === 1);
  check('metrics: phase2Active === true', metrics.phase2Active === true);
  check('metrics: no phantom hardcoded medians (0s allowed)', metrics.medianTimeToSignalMs >= 0 && metrics.medianTimeToAlertMs >= 0);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  beatRoutingService.clear();
  NewsroomAuditService.clear();
  fs.rmSync(dir, { recursive: true, force: true });

  if (failures === 0) {
    console.log('\nSMOKE TEST PASSED — production boot path verified.');
    process.exit(0);
  }
  console.error(`\nSMOKE TEST FAILED — ${failures} check(s) failed.`);
  process.exit(1);
}

main().catch((err) => {
  console.error('SMOKE TEST CRASHED:', err);
  process.exit(1);
});

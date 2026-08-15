/**
 * ─── Phase 2 — Controlled Beat-Desk Alerting: Explicit Human Authorization ───
 *
 * Activation script for the newsroom observation deployment. Mirrors the
 * governance path the smoke suite exercises (scripts/newsroom-smoke.ts): the
 * operator authorizes Phase 2 explicitly, the decision is recorded in the
 * append-only audit ledger, and state is persisted so the authorization
 * survives restart.
 *
 * This is the LOCAL deployment activation used to make the observation
 * window's editorial-loop metrics measurable (alerts → time-to-editor →
 * time-to-action). In production the ONLY mechanism is the HTTP route
 * POST /api/v2/newsroom/authorize (managing_editor+), per Operating Standard §8.
 *
 * Governing document: NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §8
 *                      NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md §11
 *
 * Usage:
 *   npx tsx scripts/newsroom-phase2-authorize.ts
 *   npx tsx scripts/newsroom-phase2-authorize.ts --revoke
 */
import * as path from 'path';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import { createNewsroomStateRepository } from '@/services/intelligence/newsroom/persistence';
import { Phase2Authorization } from '@/types/newsroom-intelligence';

const SCOPE = 'Observation Mode v1.2 — Beat-Desk Alerting Activation (local deployment)';
const CHANNELS = ['internal_editorial_channel'];
const AUTHORITY = 'managing-editor-01';

/** Same authoritative file the observation harness persists to. */
const OBSERVATION_STATE_FILE = path.join('data', 'newsroom', 'observation-runtime-state.json');

async function main(): Promise<void> {
  const revoke = process.argv.includes('--revoke');

  const repo = createNewsroomStateRepository({
    provider: 'file',
    filePath: OBSERVATION_STATE_FILE,
  });
  const core = NewsroomIntelligenceCore.resetInstance(repo);
  await core.ensureLoaded();

  if (revoke) {
    beatRoutingService.deauthorizePhase2();
    core.persist();
    console.log('[phase2] deauthorized. Phase 2 active:', beatRoutingService.isPhase2Active());
    return;
  }

  const beats = beatRoutingService.getBeats().map((b) => b.id);
  const recipients = beatRoutingService.getRecipients().map((r) => r.userId);

  const auth: Phase2Authorization = {
    authorizedBy: AUTHORITY,
    authorizedRole: 'managing_editor',
    authorizationTimestamp: new Date().toISOString(),
    approvedScope: SCOPE,
    approvedRecipients: recipients,
    approvedBeats: beats,
    approvedChannels: CHANNELS,
    rollbackAuthority: AUTHORITY,
  };

  beatRoutingService.authorizePhase2(auth);
  core.persist();

  console.log('[phase2] authorized. Phase 2 active:', beatRoutingService.isPhase2Active());
  console.log('[phase2] state file:', OBSERVATION_STATE_FILE);
  console.log('[phase2] scope:', auth.approvedScope);
  console.log('[phase2] recipients:', auth.approvedRecipients.join(', '));
  console.log('[phase2] beats:', String(auth.approvedBeats.length), 'beats');
  console.log('[phase2] channels:', auth.approvedChannels.join(', '));
  console.log('[phase2] rollbackAuthority:', auth.rollbackAuthority);

  const audit = NewsroomAuditService.getAuditTrail();
  const last = audit[audit.length - 1];
  if (last) console.log('[phase2] audit tail:', JSON.stringify(last).slice(0, 300));
}

main().catch((err) => {
  console.error('[phase2] failed:', err);
  process.exitCode = 1;
});

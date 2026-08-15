/**
 * ─── Newsroom Runtime Bootstrap ───────────────────────────────────────────────
 *
 * Idempotent provisioning of the Newsroom Intelligence runtime, invoked from
 * the /newsroom server page before any queue is rendered. Responsibilities:
 *
 *   1. Ensure the frozen 16-beat taxonomy is provisioned (repair if missing).
 *   2. Ensure the canonical recipient registry is provisioned.
 *   3. Restore persisted state (already performed by the core constructor —
 *      this reports the result for observability).
 *   4. Seed the deterministic demo baseline ONLY in demo mode (no Supabase
 *      configured, non-production). Production state stays empty until real
 *      ingestion feeds are wired to ingestObservation/upsertCluster.
 *
 * Phase 2 beat-desk alerting is NEVER auto-authorized here. Activation
 * requires explicit human authorization (Operating Standard §8 — Staged
 * Activation), so bootstrap never grants it.
 */

import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { isDemoMode } from '@/features/auth/demo';
import { seedNewsroomDemoBaseline } from './newsroom-demo-baseline';

export interface NewsroomBootstrapResult {
  beatsProvisioned: number;
  recipientsProvisioned: number;
  beatsRepaired: boolean;
  recipientsRepaired: boolean;
  stateRestored: boolean;
  demoMode: boolean;
  demoBaselineSeeded: boolean;
  signalsSeeded: number;
  phase2Authorized: boolean;
}

const FROZEN_BEAT_IDS = [
  'economy',
  'agriculture',
  'judiciary',
  'politics',
  'defence',
  'technology',
  'health',
  'education',
  'foreign_affairs',
  'climate',
  'telecom',
  'labour',
  'science',
  'business',
  'consumer',
  'transport',
];

export async function ensureNewsroomRuntime(): Promise<NewsroomBootstrapResult> {
  await newsroomIntelligenceCore.ensureLoaded();
  const currentBeats = beatRoutingService.getBeats().map((b) => b.id);
  const beatsRepaired =
    FROZEN_BEAT_IDS.some((id) => !currentBeats.includes(id)) ||
    currentBeats.some((id) => !FROZEN_BEAT_IDS.includes(id));

  // Re-provision canonical taxonomy + recipient registry (idempotent).
  if (beatsRepaired || beatRoutingService.getRecipients().length === 0) {
    beatRoutingService.clear();
  }

  const recipientsProvisioned = beatRoutingService.getRecipients().length;
  const beatsProvisioned = beatRoutingService.getBeats().length;

  const demoMode = isDemoMode();
  let demoBaselineSeeded = false;
  let signalsSeeded = 0;

  if (demoMode && newsroomIntelligenceCore.getSignals().length === 0) {
    const result = seedNewsroomDemoBaseline(newsroomIntelligenceCore);
    signalsSeeded = result.signalsCreated;
    demoBaselineSeeded = true;
  }

  // Persist provisioned beats/recipients so a restart recovers the canonical
  // registry even before the first real observation arrives.
  newsroomIntelligenceCore.persist();

  return {
    beatsProvisioned,
    recipientsProvisioned,
    beatsRepaired,
    recipientsRepaired: false,
    stateRestored: newsroomIntelligenceCore.getSignals().length > 0 || demoBaselineSeeded,
    demoMode,
    demoBaselineSeeded,
    signalsSeeded,
    phase2Authorized: beatRoutingService.isPhase2Active(),
  };
}

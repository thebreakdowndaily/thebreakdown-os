/**
 * ─── v1.2 RECALL RECOVERY — FROZEN-HOLDOUT BEFORE/AFTER EVALUATION ───────────
 *
 * Replays the REAL production ingestion pipeline (`pullPibObservations`) against
 * the frozen holdout (data/newsroom-advantage-v1.2-holdout.json) under two
 * configurations:
 *
 *   BASELINE (v1.2 interventions OFF)  — retries: 0, detectRotationGap: false
 *   INTERVENTION (v1.2 interventions ON) — retries: 2, retryDelayMs: 1,
 *                                          detectRotationGap: true
 *
 * Both runs use identical window ordering, release payloads, and the same real
 * adapter code paths (fetch → normalize → dedup → ingest → cluster → signal).
 * The ONLY differences are the two adapter options under test.
 *
 * Metrics (pre-registered for this holdout):
 *   coverage recall      = ingested ground-truth releases / total ground truth
 *   intelligence recall  = signals created / ingested releases (unconditional)
 *   duplicate rate       = duplicates / seen
 *   recovered_by_retry   = ground-truth releases ingested in INTERVENTION that
 *                          were lost in BASELINE because a transient window
 *                          threw before any retry
 *   gaps_registered      = source_gaps registered per run (fetch-failed / rotation)
 *   false_positive_gaps  = gaps registered that do not cover any real loss
 *   silent_losses        = ground-truth releases neither ingested nor covered by
 *                          a registered gap
 *
 * Governing document: NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 *
 * Run: `npx tsx scripts/run-news-intelligence-v1.2-evaluation.ts`
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import { FileStateRepository } from '@/services/intelligence/newsroom/persistence';
import {
  pullPibObservations,
  PibFeedError,
  type FeedFetcher,
  type PibCoverageWindow,
  type PullPibResult,
} from '@/lib/intelligence/pib-adapter';

interface HoldoutRelease {
  prid: number;
  canonical_url: string;
  title: string;
  snippet: string;
  published_at: string;
  in_window: string | null;
}

interface HoldoutWindow {
  id: string;
  pull_scheduled_at: string;
  feed_behavior: 'ok' | 'transient_failure' | 'persistent_failure' | 'rotation';
  expected_rotation_gap: boolean;
  gap_start?: string;
  gap_end?: string;
  releases: Array<{ prid: number; title: string; snippet: string; published_at: string }>;
}

interface Holdout {
  version: string;
  observation_period: { start: string; end: string };
  windows: HoldoutWindow[];
  ground_truth_releases: HoldoutRelease[];
}

interface WindowOutcome {
  window_id: string;
  feed_behavior: string;
  pull_scheduled_at: string;
  threw: boolean;
  fetched: number;
  ingested: number;
  duplicates: number;
  rotation_gap_detected: boolean;
  gap_start: string | null;
  gap_end: string | null;
  registered_gap_ids: string[];
}

interface RunOutcome {
  config: 'baseline' | 'intervention';
  retries: number;
  detect_rotation_gap: boolean;
  ingested_prids: number[];
  ingested_count: number;
  signal_count: number;
  windows: WindowOutcome[];
  gaps: Array<{ id: string; type: string; title: string; severity: string }>;
  covered_by_gap: Record<string, number[]>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const HOLDOUT_PATH = path.join(DATA_DIR, 'newsroom-advantage-v1.2-holdout.json');
const OUT_PATH = path.join(DATA_DIR, 'newsroom-advantage-v1.2-evaluation.json');

function xmlEscape(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildRss(window: HoldoutWindow): string {
  const items = window.releases
    .map((r) => {
      const url = `https://pib.gov.in/PressReleasePage.aspx?PRID=${r.prid}`;
      const pub = new Date(r.published_at).toUTCString();
      return (
        `<item><guid>${url}</guid><link>${url}</link>` +
        `<title>${xmlEscape(r.title)}</title>` +
        `<description>${xmlEscape(r.snippet)}</description>` +
        `<pubDate>${pub}</pubDate></item>`
      );
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Press Information Bureau</title>${items}</channel></rss>`;
}

/** Builds a fetcher whose failure behavior matches the window's feed_behavior. */
function buildWindowFetcher(window: HoldoutWindow, xml: string): FeedFetcher {
  let calls = 0;
  switch (window.feed_behavior) {
    case 'transient_failure':
      return async () => {
        calls += 1;
        if (calls === 1) throw new Error('transient upstream failure');
        return { ok: true, text: async () => xml };
      };
    case 'persistent_failure':
      return async () => {
        throw new Error('persistent upstream failure');
      };
    case 'ok':
    case 'rotation':
    default:
      return async () => ({ ok: true, text: async () => xml });
  }
}

function validateHoldout(holdout: Holdout): void {
  const gt = holdout.ground_truth_releases;
  const gtIds = new Set(gt.map((r) => r.prid));
  const inWindowIds: number[] = [];
  let rotationLost = 0;

  for (const w of holdout.windows) {
    for (const r of w.releases) {
      if (!gtIds.has(r.prid)) {
        throw new Error(`Window ${w.id} release ${r.prid} not in ground truth`);
      }
      inWindowIds.push(r.prid);
    }
  }

  for (const r of gt) {
    if (r.in_window === null) rotationLost += 1;
    else if (r.in_window !== 'w1' && r.in_window !== 'w2' && r.in_window !== 'w3' && r.in_window !== 'w4' && r.in_window !== 'w5' && r.in_window !== 'w6' && r.in_window !== 'w7' && r.in_window !== 'w8') {
      throw new Error(`Unknown in_window '${r.in_window}' for ${r.prid}`);
    }
  }

  const uniqueInWindow = new Set(inWindowIds);
  const total = uniqueInWindow.size + rotationLost;
  if (total !== gt.length) {
    throw new Error(
      `Holdout integrity: unique in-window (${uniqueInWindow.size}) + rotation-lost (${rotationLost}) = ${total} != ground truth ${gt.length}`
    );
  }
  if (uniqueInWindow.size + rotationLost < 50) {
    throw new Error(`Holdout below the 50-observable-event floor: ${uniqueInWindow.size + rotationLost}`);
  }
}

function xmlForWindow(w: HoldoutWindow): string {
  const seen = new Set<number>();
  const releases = w.releases.filter((r) => {
    if (seen.has(r.prid)) return false;
    seen.add(r.prid);
    return true;
  });
  return buildRss({ ...w, releases });
}

async function runConfig(
  holdout: Holdout,
  config: 'baseline' | 'intervention'
): Promise<RunOutcome> {
  beatRoutingService.clear();
  NewsroomAuditService.clear();

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ni-v12-eval-'));
  const core = new NewsroomIntelligenceCore(new FileStateRepository(path.join(tempDir, 'state.json')));

  const retries = config === 'intervention' ? 2 : 0;
  const detectRotationGap = config === 'intervention';
  const retryDelayMs = 1;

  const windows: WindowOutcome[] = [];
  const registeredGapIds: string[] = [];
  const threwWindows: string[] = [];
  const rotationWindows: string[] = [];
  let clock = new Date(holdout.windows[0].pull_scheduled_at);

  for (const w of holdout.windows) {
    clock = new Date(w.pull_scheduled_at);
    const xml = xmlForWindow(w);
    const fetcher = buildWindowFetcher(w, xml);

    let outcome: WindowOutcome = {
      window_id: w.id,
      feed_behavior: w.feed_behavior,
      pull_scheduled_at: w.pull_scheduled_at,
      threw: false,
      fetched: 0,
      ingested: 0,
      duplicates: 0,
      rotation_gap_detected: false,
      gap_start: null,
      gap_end: null,
      registered_gap_ids: [],
    };

    try {
      const result: PullPibResult = await pullPibObservations(core, {
        feedUrl: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
        fetcher,
        now: () => clock,
        retries,
        retryDelayMs,
        detectRotationGap,
      });
      outcome.fetched = result.fetched;
      outcome.ingested = result.ingested;
      outcome.duplicates = result.duplicates;
      outcome.rotation_gap_detected = result.coverage?.rotationGapDetected ?? false;
      outcome.gap_start = result.coverage?.gapStart ?? null;
      outcome.gap_end = result.coverage?.gapEnd ?? null;
      outcome.registered_gap_ids = result.registeredGapIds;
      registeredGapIds.push(...result.registeredGapIds);
      if (result.coverage?.rotationGapDetected) {
        rotationWindows.push(w.id);
      }
    } catch (err) {
      outcome.threw = true;
      threwWindows.push(w.id);
      if (!(err instanceof PibFeedError)) {
        throw err;
      }
      // fetch-failed gap is registered by the adapter before rethrowing.
      const gaps = core.getCoverageGaps().filter((g) => g.id.startsWith('gap-source-pib-fetch-failed-'));
      for (const g of gaps) {
        if (!registeredGapIds.includes(g.id)) {
          registeredGapIds.push(g.id);
          outcome.registered_gap_ids.push(g.id);
        }
      }
    }

    windows.push(outcome);
  }

  // ── Coverage-gap attribution: which ground-truth releases does each gap cover?
  // fetch-failed gaps register synchronously in throw order → pair with
  // threwWindows in order. Rotation gaps register synchronously in window order
  // → pair with rotationWindows in order. Each rotation gap covers releases
  // strictly inside that window's detected (gapStart, gapEnd) unobserved span.
  const coveredByGap: Record<string, number[]> = {};
  let fetchIdx = 0;
  let rotationIdx = 0;
  for (const gap of core.getCoverageGaps()) {
    if (gap.id.startsWith('gap-source-pib-fetch-failed-')) {
      const windowId = threwWindows[fetchIdx++];
      const fw = holdout.windows.find((w) => w.id === windowId);
      coveredByGap[gap.id] = (fw?.releases ?? []).map((r) => r.prid);
    } else if (gap.id.startsWith('gap-source-pib-rotation-')) {
      const windowId = rotationWindows[rotationIdx++];
      const rotationOutcome = windows.find((w) => w.window_id === windowId);
      if (rotationOutcome && rotationOutcome.gap_start && rotationOutcome.gap_end) {
        const startMs = new Date(rotationOutcome.gap_start).getTime();
        const endMs = new Date(rotationOutcome.gap_end).getTime();
        coveredByGap[gap.id] = holdout.ground_truth_releases
          .filter((r) => {
            const t = new Date(r.published_at).getTime();
            return t > startMs && t < endMs;
          })
          .map((r) => r.prid);
      } else {
        coveredByGap[gap.id] = [];
      }
    }
  }

  const ingestedPrids = core
    .getObservations()
    .filter((o) => o.canonicalUrl)
    .map((o) => parseInt((o.canonicalUrl as string).match(/PRID=(\d+)/)?.[1] ?? '0', 10))
    .filter((p) => p > 0);

  const gaps = core.getCoverageGaps().map((g) => ({
    id: g.id,
    type: g.gapType,
    title: g.title,
    severity: g.severity,
  }));

  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }

  return {
    config,
    retries,
    detect_rotation_gap: detectRotationGap,
    ingested_prids: [...new Set(ingestedPrids)].sort((a, b) => a - b),
    ingested_count: new Set(ingestedPrids).size,
    signal_count: core.getSignals().length,
    windows,
    gaps,
    covered_by_gap: coveredByGap,
  };
}

function computeMetrics(
  holdout: Holdout,
  baseline: RunOutcome,
  intervention: RunOutcome
): Record<string, unknown> {
  const gt = holdout.ground_truth_releases;
  const gtCount = gt.length;
  const gtIds = new Set(gt.map((r) => r.prid));

  const baselineIngested = new Set(baseline.ingested_prids);
  const interventionIngested = new Set(intervention.ingested_prids);

  const baselineRecall = baseline.ingested_count / gtCount;
  const interventionRecall = intervention.ingested_count / gtCount;

  const recoveredByRetry = gt
    .filter((r) => !baselineIngested.has(r.prid) && interventionIngested.has(r.prid))
    .map((r) => r.prid);
  const regressed = gt.filter(
    (r) => baselineIngested.has(r.prid) && !interventionIngested.has(r.prid)
  );

  const baselineCovered = new Set(Object.values(baseline.covered_by_gap).flat());
  const interventionCovered = new Set(Object.values(intervention.covered_by_gap).flat());

  const silentLossBaseline = gt.filter(
    (r) => !baselineIngested.has(r.prid) && !baselineCovered.has(r.prid)
  ).map((r) => r.prid);
  const silentLossIntervention = gt.filter(
    (r) => !interventionIngested.has(r.prid) && !interventionCovered.has(r.prid)
  ).map((r) => r.prid);

  // A gap is a false positive if none of the releases it covers were lost
  // (i.e. the gap claims a hole where no ground-truth release was missing).
  const fpGapsBaseline = baseline.gaps.filter(
    (g) => !(baseline.covered_by_gap[g.id] ?? []).some((p) => !baselineIngested.has(p))
  ).length;
  const fpGapsIntervention = intervention.gaps.filter(
    (g) => !(intervention.covered_by_gap[g.id] ?? []).some((p) => !interventionIngested.has(p))
  ).length;

  // Intelligence recall = signals created / ingested releases (unconditional).
  const baselineIntelRecall = baseline.ingested_count > 0 ? baseline.signal_count / baseline.ingested_count : 0;
  const interventionIntelRecall = intervention.ingested_count > 0 ? intervention.signal_count / intervention.ingested_count : 0;

  const baselineDuplicates = baseline.windows.reduce((a, w) => a + w.duplicates, 0);
  const baselineSeen = baseline.windows.reduce((a, w) => a + w.fetched, 0);
  const interventionDuplicates = intervention.windows.reduce((a, w) => a + w.duplicates, 0);
  const interventionSeen = intervention.windows.reduce((a, w) => a + w.fetched, 0);

  return {
    observation_period: holdout.observation_period,
    ground_truth_releases: gtCount,
    coverage_recall_baseline: Number((baselineRecall * 100).toFixed(1)),
    coverage_recall_intervention: Number((interventionRecall * 100).toFixed(1)),
    coverage_recall_delta_pts: Number((interventionRecall * 100 - baselineRecall * 100).toFixed(1)),
    ingested_baseline: baseline.ingested_count,
    ingested_intervention: intervention.ingested_count,
    recovered_by_retry: recoveredByRetry,
    regressed_events: regressed,
    silent_losses_baseline: silentLossBaseline,
    silent_losses_intervention: silentLossIntervention,
    gaps_baseline: baseline.gaps.map((g) => g.id.replace(/-\d+$/, '')),
    gaps_intervention: intervention.gaps.map((g) => g.id.replace(/-\d+$/, '')),
    false_positive_gaps_baseline: fpGapsBaseline,
    false_positive_gaps_intervention: fpGapsIntervention,
    intelligence_recall_baseline: Number((baselineIntelRecall * 100).toFixed(1)),
    intelligence_recall_intervention: Number((interventionIntelRecall * 100).toFixed(1)),
    duplicate_rate_baseline: baselineSeen > 0 ? Number(((baselineDuplicates / baselineSeen) * 100).toFixed(1)) : 0,
    duplicate_rate_intervention: interventionSeen > 0 ? Number(((interventionDuplicates / interventionSeen) * 100).toFixed(1)) : 0,
    valid_gt_ids: gtIds.size,
  };
}

async function main(): Promise<void> {
  if (!fs.existsSync(HOLDOUT_PATH)) {
    console.error(`Holdout not found at ${HOLDOUT_PATH}`);
    process.exit(1);
  }

  const holdout: Holdout = JSON.parse(fs.readFileSync(HOLDOUT_PATH, 'utf8'));
  validateHoldout(holdout);

  console.log('==============================================================');
  console.log('v1.2 RECALL RECOVERY — FROZEN HOLDOUT EVALUATION');
  console.log('==============================================================');
  console.log(`Holdout period: ${holdout.observation_period.start} → ${holdout.observation_period.end}`);
  console.log(`Ground-truth releases: ${holdout.ground_truth_releases.length}`);
  console.log(`Windows: ${holdout.windows.length} (${holdout.windows.map((w) => w.id).join(', ')})`);
  console.log('--------------------------------------------------------------');

  const baseline = await runConfig(holdout, 'baseline');
  const intervention = await runConfig(holdout, 'intervention');

  const metrics = computeMetrics(holdout, baseline, intervention);

  console.log('\n--- PER-WINDOW RESULTS (BASELINE: retries=0, rotation=off) ---');
  for (const w of baseline.windows) {
    const tag = w.threw ? 'THREW' : w.rotation_gap_detected ? 'ROT-GAP' : 'ok';
    console.log(
      `  ${w.window_id.padEnd(4)} ${w.feed_behavior.padEnd(18)} fetched=${w.fetched} ingested=${w.ingested} dups=${w.duplicates} ${tag}`
    );
  }

  console.log('\n--- PER-WINDOW RESULTS (INTERVENTION: retries=2, rotation=on) ---');
  for (const w of intervention.windows) {
    const tag = w.threw ? 'THREW' : w.rotation_gap_detected ? 'ROT-GAP' : 'ok';
    console.log(
      `  ${w.window_id.padEnd(4)} ${w.feed_behavior.padEnd(18)} fetched=${w.fetched} ingested=${w.ingested} dups=${w.duplicates} ${tag}`
    );
  }

  console.log('\n--- METRICS ---');
  console.log(`Coverage recall baseline:      ${metrics.coverage_recall_baseline}% (${metrics.ingested_baseline}/${metrics.ground_truth_releases})`);
  console.log(`Coverage recall intervention:  ${metrics.coverage_recall_intervention}% (${metrics.ingested_intervention}/${metrics.ground_truth_releases})`);
  console.log(`Coverage recall delta:         +${metrics.coverage_recall_delta_pts} pts`);
  console.log(`Recovered by retry (prids):    ${(metrics.recovered_by_retry as number[]).length} [${(metrics.recovered_by_retry as number[]).join(', ')}]`);
  console.log(`Regressed events:              ${(metrics.regressed_events as number[]).length}`);
  console.log(`Silent losses baseline:        ${(metrics.silent_losses_baseline as number[]).length} [${(metrics.silent_losses_baseline as number[]).join(', ')}]`);
  console.log(`Silent losses intervention:    ${(metrics.silent_losses_intervention as number[]).length} [${(metrics.silent_losses_intervention as number[]).join(', ')}]`);
  console.log(`Gaps baseline:                 ${(metrics.gaps_baseline as string[]).join('; ') || 'none'}`);
  console.log(`Gaps intervention:             ${(metrics.gaps_intervention as string[]).join('; ') || 'none'}`);
  console.log(`False-positive gaps:           baseline=${metrics.false_positive_gaps_baseline} intervention=${metrics.false_positive_gaps_intervention}`);
  console.log(`Intelligence recall:           baseline=${metrics.intelligence_recall_baseline}% intervention=${metrics.intelligence_recall_intervention}%`);
  console.log(`Duplicate rate:                baseline=${metrics.duplicate_rate_baseline}% intervention=${metrics.duplicate_rate_intervention}%`);

  let verdict: 'RECALL RECOVERED' | 'RECALL PARTIALLY RECOVERED' | 'NO MATERIAL RECALL IMPROVEMENT' | 'INCONCLUSIVE';
  const recallDelta = metrics.coverage_recall_delta_pts as number;
  const silentAfter = (metrics.silent_losses_intervention as number[]).length;
  const silentBefore = (metrics.silent_losses_baseline as number[]).length;

  if (recallDelta >= 10 && silentAfter === 0 && silentBefore > 0) {
    verdict = 'RECALL RECOVERED';
  } else if (recallDelta > 0 || (silentAfter === 0 && silentBefore > 0)) {
    verdict = 'RECALL PARTIALLY RECOVERED';
  } else if (recallDelta === 0 && silentAfter === silentBefore) {
    verdict = 'NO MATERIAL RECALL IMPROVEMENT';
  } else {
    verdict = 'INCONCLUSIVE';
  }

  console.log('\n--- VERDICT ---');
  console.log(`VERDICT: ${verdict}`);

  const payload = {
    artifact: 'newsroom-advantage-v1.2-evaluation',
    generated_at: new Date().toISOString(),
    holdout: HOLDOUT_PATH,
    metrics,
    verdict,
    baseline: {
      config: 'retries=0, detectRotationGap=false',
      windows: baseline.windows,
      gaps: baseline.gaps,
      covered_by_gap: baseline.covered_by_gap,
    },
    intervention: {
      config: 'retries=2, retryDelayMs=1, detectRotationGap=true',
      windows: intervention.windows,
      gaps: intervention.gaps,
      covered_by_gap: intervention.covered_by_gap,
    },
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`\n✓ Evaluation written to ${OUT_PATH}`);
}

if (typeof process !== 'undefined' && process.argv && process.argv.some((arg) => arg.includes('run-news-intelligence-v1.2-evaluation'))) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

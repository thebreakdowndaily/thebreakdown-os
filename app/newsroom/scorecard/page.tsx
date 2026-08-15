import type { Metadata } from 'next';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import {
  ScorecardCard,
  formatMs,
  formatPct,
  formatNumber,
} from '@/components/newsroom/ScorecardCard';

export const metadata: Metadata = {
  title: 'Newsroom Intelligence Scorecard',
  robots: { index: false, follow: false },
};

/**
 * Newsroom Intelligence Scorecard — live operational observation surface.
 *
 * Every value is a measured baseline from canonical state; no targets are
 * defined. Coverage recall / intelligence recall / silent losses are the frozen
 * v1.2 holdout baseline and are flagged as such until a live ground-truth audit
 * is performed.
 *
 * Governing document: NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 * (Baseline 1.2 freeze + observation-mode section).
 */
export default async function NewsroomScorecardPage() {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;
  }

  const session = await getSession();
  if (!session) {
    return <IntelDenied reason="unauthenticated" roleLabel="" />;
  }

  await newsroomIntelligenceCore.ensureLoaded();
  const s = newsroomIntelligenceCore.getScorecard();

  const observationLabel =
    s.observationPeriod.startAt === null
      ? 'No observations yet — observation period starts at first ingestion'
      : `${new Date(s.observationPeriod.startAt).toISOString().slice(0, 16).replace('T', ' ')}Z → now (${formatNumber(s.observationPeriod.daysElapsed)} days)`;

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <header style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Newsroom Intelligence Scorecard
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
              Operational observation baselines · measured, not targeted.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <a href="/newsroom" style={{ color: 'var(--color-brand-600)', fontSize: 'var(--text-sm)' }}>
              ← Command Center
            </a>
          </div>
        </div>
      </header>

      {/* Observation period banner */}
      <section
        aria-label="Observation period"
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          background: s.observationPeriod.observationWindowElapsed ? '#dcfce7' : '#eff6ff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: 'var(--spacing-6)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <strong>Observation period:</strong> {observationLabel}. Target window is 7–14 days of live operation.
      </section>

      {/* Section 1 — Frozen baseline reference */}
      <section aria-label="Frozen baseline" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Frozen Baseline — v1.2 holdout reference
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-3)' }}>
          <ScorecardCard label="Coverage recall" value={formatPct(s.baseline.coverageRecall)} sub="v1.2 holdout (frozen)" tone="frozen" />
          <ScorecardCard label="Intelligence recall" value={formatPct(s.baseline.intelligenceRecall)} sub="v1.2 holdout (frozen)" tone="frozen" />
          <ScorecardCard label="Silent losses" value={formatNumber(s.baseline.silentLosses)} sub="v1.2 holdout (frozen)" tone="frozen" />
          <ScorecardCard label="False-positive gaps" value={formatNumber(s.baseline.falsePositiveGaps)} sub="v1.2 holdout (frozen)" tone="frozen" />
        </div>
      </section>

      {/* Section 2 — Detection */}
      <section aria-label="Detection" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Detection (live)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-3)' }}>
          <ScorecardCard label="Signals" value={formatNumber(s.detection.signals)} />
          <ScorecardCard label="Observations" value={formatNumber(s.detection.observations)} />
          <ScorecardCard label="Story clusters" value={formatNumber(s.detection.clusters)} />
          <ScorecardCard label="P0 / P1 / P2 / P3" value={`${formatNumber(s.detection.p0)} / ${formatNumber(s.detection.p1)} / ${formatNumber(s.detection.p2)} / ${formatNumber(s.detection.p3)}`} />
          <ScorecardCard label="Duplicate rate" value={formatPct(s.detection.duplicateRate)} sub={`${formatNumber(s.detection.duplicateObservations)} duplicates`} />
        </div>
      </section>

      {/* Section 3 — Latency */}
      <section aria-label="Latency" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Latency (live)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-3)' }}>
          <ScorecardCard label="Median detection latency" value={formatMs(s.latency.medianTimeToSignalMs)} sub="cluster → signal" />
          <ScorecardCard label="Median time to alert" value={formatMs(s.latency.medianTimeToAlertMs)} sub="signal → alert" />
          <ScorecardCard label="Median time to editor" value={formatMs(s.latency.medianTimeToEditorMs)} sub={`${formatNumber(s.latency.timeToEditorSamples)} acked alerts`} tone={s.latency.medianTimeToEditorMs === null ? 'warn' : 'neutral'} />
          <ScorecardCard label="Median time to action" value={formatMs(s.latency.medianTimeToActionMs)} sub={`${formatNumber(s.latency.timeToActionSamples)} actioned alerts`} tone={s.latency.medianTimeToActionMs === null ? 'warn' : 'neutral'} />
          <ScorecardCard label="Median verified lead" value={formatMs(s.latency.medianVerifiedLeadMsReference)} sub="v1.1 reference (42 min)" tone="frozen" />
        </div>
      </section>

      {/* Section 4 — Coverage */}
      <section aria-label="Coverage" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Coverage (live)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-3)' }}>
          <ScorecardCard label="Coverage gaps open" value={formatNumber(s.coverage.coverageGapsOpen)} sub={`${formatNumber(s.coverage.coverageGapsTotal)} total tracked`} tone={s.coverage.criticalOpen > 0 ? 'critical' : s.coverage.highOpen > 0 ? 'warn' : 'neutral'} />
          <ScorecardCard label="Critical gaps" value={formatNumber(s.coverage.criticalOpen)} tone={s.coverage.criticalOpen > 0 ? 'critical' : 'neutral'} />
          <ScorecardCard label="High gaps" value={formatNumber(s.coverage.highOpen)} tone={s.coverage.highOpen > 0 ? 'warn' : 'neutral'} />
          <ScorecardCard label="Resolved gaps" value={formatNumber(s.coverage.resolved)} />
        </div>
      </section>

      {/* Section 5 — Editorial loop */}
      <section aria-label="Editorial loop" style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Editorial loop (live)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-3)' }}>
          <ScorecardCard label="Alerts generated" value={formatNumber(s.alerts.generated)} />
          <ScorecardCard label="Editor acknowledgement rate" value={formatPct(s.alerts.acknowledgementRate)} sub={`${formatNumber(s.alerts.acknowledged)} acked / ${formatNumber(s.alerts.unacknowledged)} unacked`} tone={s.alerts.unacknowledged > 0 ? 'warn' : 'neutral'} />
          <ScorecardCard label="False-positive rate" value={formatPct(s.editorial.falsePositiveRate)} sub={`${formatNumber(s.editorial.falsePositiveJudgements)} rejections / ${formatNumber(s.editorial.triageActions)} actions`} />
          <ScorecardCard label="Published from alert" value={formatPct(s.editorial.publishedFromAlertRate)} sub={`${formatNumber(s.editorial.publishedFromAlert)} linked stories`} />
          <ScorecardCard label="Resolved signals" value={formatNumber(s.editorial.resolvedSignals)} sub={`${formatNumber(s.editorial.assignedSignals)} assigned`} />
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--spacing-4)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Generated {s.generatedAt} · Shadow mode: {s.alerts.shadowMode ? 'active (no delivery)' : 'inactive (delivery active)'} · Baseline {s.baseline.tag} v{s.baseline.version} —{' '}
        <a href="/api/v2/newsroom/scorecard" style={{ color: 'var(--color-brand-600)' }}>scorecard JSON</a>
      </footer>
    </main>
  );
}

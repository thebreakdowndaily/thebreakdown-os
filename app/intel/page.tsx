import type { Metadata } from 'next';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeExecutiveBriefing } from '@/lib/intel/executive';
import { TrustIndexPanel } from '@/components/intel/mission-control/TrustIndexPanel';
import { MetricsGrid } from '@/components/intel/mission-control/MetricsGrid';
import { WatchlistPanel } from '@/components/intel/mission-control/WatchlistPanel';
import { AlertsPanel } from '@/components/intel/mission-control/AlertsPanel';
import { VerificationPanel } from '@/components/intel/mission-control/VerificationPanel';
import { ScenarioMonitorPanel } from '@/components/intel/mission-control/ScenarioMonitorPanel';
import { EvidenceHealthPanel } from '@/components/intel/mission-control/EvidenceHealthPanel';
import { ResearchWatchPanel } from '@/components/intel/mission-control/ResearchWatchPanel';
import { NewsroomPanel } from '@/components/intel/mission-control/NewsroomPanel';
import { StoryPanel } from '@/components/intel/mission-control/StoryPanel';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Mission Control)
// + docs/intelligence/mission-control-readiness.md (Phase III deliverable 5)
// + Phase IV sprint brief (Executive Intelligence Surface)
// Mission Control is an executive surface, not a dashboard. It consumes ONLY the
// Executive Intelligence Service (lib/intel/executive). It owns zero business logic —
// every number, alert, and limitation is produced by the certified engines.

export const metadata: Metadata = {
  title: 'Mission Control — Intelligence Workspace',
  robots: { index: false, follow: false },
};

export default async function IntelMissionControlPage() {
  const gate = await guardIntelModule('dashboard');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const briefing = await computeExecutiveBriefing();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Mission Control</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
          The executive intelligence surface — one briefing aggregating the certified engines. Dataset {briefing.dataSource} · research cutoff {briefing.researchCutoff} · generated {new Date(briefing.generatedAt).toLocaleString()}.
        </p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <TrustIndexPanel index={briefing.trustIndex} />
      </div>

      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <MetricsGrid metrics={briefing.metrics} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)', alignItems: 'start' }}>
        <section aria-labelledby="watchlist-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="watchlist-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Editorial Watchlist</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Top seats by Investigation Priority Index, each with a reason, an action, and a next step. Full pipeline in Editorial Intelligence.
            </p>
          </div>
          <WatchlistPanel items={briefing.watchlist} />
        </section>

        <section aria-labelledby="alerts-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="alerts-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Editorial Alerts</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Actionable signals only — high investigation priority, fragile predictions, scenario exposure, evidence debt, verification blockers, research gaps.
            </p>
          </div>
          <AlertsPanel alerts={briefing.alerts} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)', alignItems: 'start' }}>
        <section aria-labelledby="scenarios-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="scenarios-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Scenario Monitor</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Meaningful seat-flip scenarios from the Scenario Engine. Deep dive in Scenarios.
            </p>
          </div>
          <ScenarioMonitorPanel items={briefing.scenarioMonitor.items} totalFlips={briefing.scenarioMonitor.totalFlips} />
        </section>

        <section aria-labelledby="verification-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="verification-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Verification Queue</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Verification work derived from engine outputs, plus the Verification Service's case posture. Full workspace in Verification.
            </p>
          </div>
          <VerificationPanel queue={briefing.verification} verificationOS={briefing.verificationOS} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)', alignItems: 'start' }}>
        <section aria-labelledby="evidence-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="evidence-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Evidence Health</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Coverage and registered debt across the evidence categories. Full view in Evidence & Research.
            </p>
          </div>
          <EvidenceHealthPanel health={briefing.evidenceHealth} />
        </section>

        <section aria-labelledby="research-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="research-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Research Watch</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Highest-impact findings and outstanding gaps. Full Research KB in Evidence & Research.
            </p>
          </div>
          <ResearchWatchPanel watch={briefing.researchWatch} />
        </section>
      </div>

      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <section aria-labelledby="newsroom-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="newsroom-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Newsroom Productivity</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              The pipeline's productive state — derived from certified engine outputs. Read-only; no assignments or persistence exist.
            </p>
          </div>
          <NewsroomPanel newsroom={briefing.newsroom} />
        </section>
      </div>

      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <section aria-labelledby="story-title">
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 id="story-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Story Pipeline</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Editorial production posture — story drafts planned over verified intelligence. Full planning in the Story Builder.
            </p>
          </div>
          <StoryPanel storyOS={briefing.storyOS} />
        </section>
      </div>
    </div>
  );
}

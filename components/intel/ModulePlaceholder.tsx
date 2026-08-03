import type { IntelModule } from '@/features/auth/roles';

const MODULE_DESCRIPTIONS: Record<IntelModule, string> = {
  dashboard: 'Mission control overview.',
  'watch-list': 'Ranked intelligence watch list across UP403 constituencies.',
  predictions: 'Internal prediction engine and confidence scoring across UP403 constituencies.',
  scenarios: 'Scenario simulation: what-if electoral swings and coalition arithmetic.',
  candidates: 'Candidate research, affidavits, source tracking, and interview readiness.',
  media: 'Media monitoring across UP403 subjects and constituencies.',
  research: 'Evidence & Research Knowledge Base: per-constituency evidence graph, coverage, gaps, and evidence debt.',
  toolkit: 'Journalist toolkit: interview plans, source contacts, and reporting checklists.',
  editorial: 'Editorial Intelligence: ranked investigation pipeline with per-seat driver decomposition.',
  'story-builder': 'Story planning backed by intelligence layer signals.',
  verification: 'Verification queue and fact-check status across the workspace.',
  rti: 'RTI tracker: filed requests, deadlines, and responses.',
  tasks: 'Editorial task queue across the intelligence workspace.',
};

export function ModulePlaceholder({ module }: { module: IntelModule }) {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
        {module.replace('-', ' ')}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-2)' }}>
        {MODULE_DESCRIPTIONS[module]}
      </p>
      <div style={{ marginTop: 'var(--spacing-8)', padding: 'var(--spacing-8)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-default)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          This module is scoped for a future sprint.
        </div>
      </div>
    </div>
  );
}

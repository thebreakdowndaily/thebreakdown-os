import type { ConstituencyToolkit, VerificationItem } from '@/lib/intel/toolkit/types';
import { SectionCard, MiniCard, Muted, TwoCol } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

const KIND_BADGE: Record<VerificationItem['kind'], { label: string; tone: 'good' | 'warn' | 'bad' | 'default' }> = {
  claim: { label: 'Claim to verify', tone: 'default' },
  missing_evidence: { label: 'Missing evidence', tone: 'warn' },
  weak_evidence: { label: 'Weak evidence', tone: 'warn' },
  conflicting_evidence: { label: 'Conflicting signals', tone: 'bad' },
};

export function VerificationSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  const v = toolkit.verification;
  return (
    <SectionCard id="verification" title="Verification Workspace" subtitle={`Separates claims to verify, registered evidence gaps, weak evidence, and conflicting signals. Overall confidence ${v.overallConfidence.replace('_', ' ')}.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {v.items.map((item) => {
          const badge = KIND_BADGE[item.kind];
          return (
            <div key={`${item.kind}-${item.title}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <BadgeTone badge={badge} />
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.title}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.detail}</div>
                <Muted>{item.source}</Muted>
              </div>
            </div>
          );
        })}
      </div>

      <TwoCol>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Recommended documents</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {v.recommendedDocuments.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Ground reporting</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {v.groundReporting.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </div>
      </TwoCol>

      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <Muted>Official datasets to cross-check: {v.officialDatasets.join(', ') || 'none recorded'}</Muted>
      </div>
    </SectionCard>
  );
}

function BadgeTone({ badge }: { badge: { label: string; tone: 'good' | 'warn' | 'bad' | 'default' } }) {
  return (
    <span
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        whiteSpace: 'nowrap',
        color: badge.tone === 'bad' ? 'var(--color-error)' : badge.tone === 'warn' ? 'var(--color-warning)' : badge.tone === 'good' ? 'var(--color-brand-400)' : 'var(--color-text-secondary)',
        background: 'color-mix(in srgb, var(--color-bg-primary) 60%, transparent)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {badge.label}
    </span>
  );
}

export function FieldPackSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  const f = toolkit.fieldPack;
  return (
    <SectionCard id="field-pack" title="Field Reporting Pack" subtitle="A dispatch plan built from the frozen dataset. Places, documents, and travel notes never invent geography or distances — unknowns are flagged for ground confirmation.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
        <MiniCard title="Places to visit">
          <List items={f.placesToVisit} />
        </MiniCard>
        <MiniCard title="People to interview">
          <List items={f.peopleToInterview} />
        </MiniCard>
        <MiniCard title="Documents to collect">
          <List items={f.documentsToCollect} />
        </MiniCard>
        <MiniCard title="Ground verification checklist">
          <List items={f.groundVerificationChecklist} />
        </MiniCard>
        <MiniCard title="Photography checklist">
          <List items={f.photographyChecklist} />
        </MiniCard>
        <MiniCard title="Video checklist">
          <List items={f.videoChecklist} />
        </MiniCard>
        <MiniCard title="Timeline (5 days)">
          <List items={f.timeline} />
        </MiniCard>
        <MiniCard title="Travel notes">
          <List items={f.travelNotes} />
        </MiniCard>
      </div>
      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)', marginBottom: 'var(--spacing-2)' }}>Unknowns requiring field reporting</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
          {f.unknowns.length > 0 ? f.unknowns.map((u) => <Muted key={u}>{u}</Muted>) : <Muted>None registered</Muted>}
        </div>
      </div>
    </SectionCard>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import { toReporterBriefMarkdown, toToolkitJson } from '@/lib/intel/toolkit/export';
import { ReporterBriefExport } from './ReporterBriefExport';
import { BriefSection, InterviewsSection, ChecklistSection, AnglesSection } from './sections/core';
import { VerificationSection, FieldPackSection } from './sections/field';
import { ExplorerSection, ResearchSection, ScenariosSection } from './sections/evidence';
import { Muted } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Server component: renders the canonical toolkit model. Navigation and export
// controls carry .print-hidden so the printed brief is a clean editorial document.

interface TocItem {
  id: string;
  label: string;
}

const TOC: TocItem[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'angles', label: 'Angles' },
  { id: 'verification', label: 'Verification' },
  { id: 'field-pack', label: 'Field Pack' },
  { id: 'explorer', label: 'Evidence Explorer' },
  { id: 'research', label: 'Research' },
  { id: 'scenarios', label: 'Scenarios' },
];

export function ToolkitWorkspace({ toolkit }: { toolkit: ConstituencyToolkit }) {
  const markdown = toReporterBriefMarkdown(toolkit);
  const json = toToolkitJson(toolkit);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-amber-500)', fontWeight: 600 }}>Journalist Toolkit</div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>{toolkit.constituency_name}</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
              {toolkit.canonical_constituency_id} · {toolkit.district} · {toolkit.region} · {toolkit.reservation_type || 'GENERAL'} seat
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-1)' }}>
              Generated {toolkit.generatedAt} · Dataset {toolkit.dataSource} · Research cutoff {toolkit.researchCutoff}
            </p>
          </div>
          <div className="print-hidden">
            <ReporterBriefExport markdown={markdown} json={json} />
          </div>
        </div>

        <nav className="print-hidden" aria-label="Brief sections" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'var(--spacing-5)', padding: 'var(--spacing-2)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
          {TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500 }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <BriefSection toolkit={toolkit} />
        <InterviewsSection toolkit={toolkit} />
        <ChecklistSection toolkit={toolkit} />
        <AnglesSection toolkit={toolkit} />
        <VerificationSection toolkit={toolkit} />
        <FieldPackSection toolkit={toolkit} />
        <ExplorerSection toolkit={toolkit} />
        <ResearchSection toolkit={toolkit} />
        <ScenariosSection toolkit={toolkit} />
      </div>

      <div style={{ marginTop: 'var(--spacing-8)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <Muted>All figures derive from the frozen canonical dataset (data/master-dataset-v1/v1.1.0) and the intelligence engines — no AI-authored content. Registered gaps are reported as gaps.</Muted>
      </div>
    </div>
  );
}

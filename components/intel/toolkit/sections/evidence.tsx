import type { ConstituencyToolkit, ExplorerNode } from '@/lib/intel/toolkit/types';
import { SectionCard, ConfidencePill, Badge, Muted, TwoCol } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

export function ExplorerSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  return (
    <SectionCard id="explorer" title="Evidence Explorer" subtitle="The canonical chain: prediction → drivers → supporting evidence → history → gaps → confidence. Every node names its source field.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {toolkit.explorer.children.map((child) => (
          <TreeNode key={child.stage + child.label} node={child} depth={0} />
        ))}
      </div>
    </SectionCard>
  );
}

function TreeNode({ node, depth }: { node: ExplorerNode; depth: number }) {
  const isPrediction = node.stage === 'prediction';
  const isGap = node.stage === 'gap';
  return (
    <div style={{ marginLeft: depth > 0 ? 'var(--spacing-5)' : 0, borderLeft: depth > 0 ? '1px solid var(--color-border-subtle)' : 'none', paddingLeft: depth > 0 ? 'var(--spacing-4)' : 0, paddingBottom: depth < 2 ? 'var(--spacing-2)' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', flexWrap: 'wrap', padding: 'var(--spacing-2)', background: depth === 0 ? 'var(--color-bg-primary)' : 'transparent', borderRadius: 'var(--radius-md)' }}>
        <Badge tone={isGap ? 'warn' : 'default'}>{node.stage}</Badge>
        {isPrediction ? (
          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{node.label}</strong>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{node.label}</span>
        )}
        {node.confidence ? <ConfidencePill tier={node.confidence} /> : null}
      </div>
      {node.detail ? (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.6 }}>{node.detail}</div>
      ) : null}
      {node.children.map((child) => <TreeNode key={child.stage + child.label} node={child} depth={depth + 1} />)}
    </div>
  );
}

export function ResearchSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  const r = toolkit.research;
  return (
    <SectionCard id="research" title="Research Summary" subtitle="Findings, monitoring areas, and unknowns assembled from history, prediction drivers, and registered gaps.">
      <p style={{ margin: 0, marginBottom: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{r.evidenceStrength}</p>
      <TwoCol>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Historical trends</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            {r.historicalTrends.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Research findings</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            {r.findings.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Monitoring areas</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            {r.monitoringAreas.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)', marginBottom: 'var(--spacing-2)' }}>Unknowns</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            {r.unknowns.map((u) => <li key={u}>{u}</li>)}
          </ul>
        </div>
      </TwoCol>
      <div style={{ marginTop: 'var(--spacing-4)' }}>
        <Muted>Official reports referenced: {r.officialReports.join(', ') || 'none recorded'}</Muted>
      </div>
    </SectionCard>
  );
}

export function ScenariosSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  const s = toolkit.scenarios;
  return (
    <SectionCard id="scenarios" title="Scenario Analysis" subtitle={`How this seat behaves under every scenario definition. Baseline: ${s.baselineWinner}.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {s.flips.map((f) => (
          <div key={f.scenarioId} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <Badge tone={f.flipped ? 'warn' : 'good'}>{f.flipped ? 'FLIP' : 'STABLE'}</Badge>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{f.label}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {f.flipped ? `${f.baselineWinner} → ${f.scenarioWinner} (${String(f.winnerProbability)}%)` : `${f.baselineWinner} holds (${String(f.winnerProbability)}%)`}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', fontSize: 'var(--text-xs)' }}>
        <span style={{ color: 'var(--color-warning)' }}><strong>Vulnerable scenarios:</strong> {s.vulnerableScenarios.length > 0 ? s.vulnerableScenarios.join(', ') : 'none — seat holds across all scenarios'}</span>
      </div>
    </SectionCard>
  );
}

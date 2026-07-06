'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildWorkspace } from '@/features/workspace/view-model';
import { KnowledgeGraph } from '@/features/graph/components/KnowledgeGraph';
import type { Services } from '@/services/registry';

function badgeColor(confidence: number): string {
  if (confidence >= 80) return '#22C55E';
  if (confidence >= 60) return '#EAB308';
  return '#6B7280';
}

function tierLabel(tier: number): string {
  switch (tier) {
    case 1: return 'Official';
    case 2: return 'Scholarly';
    case 3: return 'Statistical';
    case 4: return 'Analytical';
    default: return 'General';
  }
}

function tierColor(tier: number): string {
  switch (tier) {
    case 1: return '#22C55E';
    case 2: return '#3B82F6';
    case 3: return '#D4A843';
    case 4: return '#A855F7';
    default: return '#6B7280';
  }
}

function CollapsibleCard({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>
      <button
        onClick={() => { setOpen(!open); }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-3) var(--spacing-4)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', textAlign: 'left' }}
      >
        <span>{title}</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--duration-fast) var(--easing-out)', fontSize: 'var(--text-xs)' }}>&#9660;</span>
      </button>
      {open && <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderTop: '1px solid var(--color-border-default)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{children}</div>}
    </div>
  );
}

function AICard({ label, children, accent }: { label: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', borderBottom: '1px solid var(--color-border-default)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        {accent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block' }} />}
        {label}
      </div>
      <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  const shimmer = { background: 'var(--color-bg-tertiary)', animation: 'shimmer 1.5s ease-in-out infinite' };
  return (
    <div style={{ padding: 'var(--spacing-8)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 240, height: 24, borderRadius: 'var(--radius-sm)', ...shimmer }} />
      <div style={{ width: 400, height: 16, borderRadius: 'var(--radius-sm)', ...shimmer }} />
      <div style={{ width: 320, height: 320, borderRadius: 'var(--radius-lg)', ...shimmer }} />
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 'var(--spacing-4)', color: 'var(--color-text-muted)' }}>
      <span style={{ fontSize: 'var(--text-4xl)' }}>&#128196;</span>
      <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>Story not found</p>
      <p style={{ fontSize: 'var(--text-sm)' }}>No story matches that slug. Try another search.</p>
      <button onClick={onReset} style={{ marginTop: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-4)', background: 'var(--color-brand-400)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
        Load default story
      </button>
    </div>
  );
}

export default function WorkspacePage() {
  const [ready, setReady] = useState(false);
  const [services, setServices] = useState<Services | null>(null);
  const [slug, setSlug] = useState('');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const s = bootstrapServices();
    const timer = setTimeout(() => {
      setServices(s);
      setReady(true);
    }, 0);
    return () => { clearTimeout(timer); };
  }, []);

  const defaultSlug = useMemo(() => {
    if (!services) return '';
    const stories = services.stories.getStories().data;
    return stories.length > 0 ? stories[0].slug : '';
  }, [services]);

  const effectiveSlug = slug || defaultSlug;

  const vm = useMemo(() => {
    if (!services || !effectiveSlug) return null;
    return buildWorkspace(services, effectiveSlug);
  }, [services, effectiveSlug]);

  const handleSearch = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSlug(searchValue.trim());
    }
  }, [searchValue]);

  const handleReset = useCallback(() => {
    setSlug('');
    setSearchValue('');
  }, []);

  if (!ready || !services) return <LoadingSkeleton />;
  if (!vm) return <EmptyState onReset={handleReset} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: 'var(--spacing-6)' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-2) var(--spacing-4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); }}
              placeholder="Search story slug (e.g. mgnrega-reform)..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', padding: 'var(--spacing-1) 0' }}
            />
            <button
              type="submit"
              style={{ padding: 'var(--spacing-1) var(--spacing-3)', background: 'var(--color-brand-400)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Load
            </button>
          </div>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-5)' }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-2)', color: 'var(--color-text-primary)' }}>{vm.story.headline || vm.story.title}</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--spacing-4)' }}>{vm.story.summary}</p>
              {vm.story.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-4)' }}>
                  {vm.story.tags.map(t => (
                    <span key={t} style={{ padding: '2px var(--spacing-2)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            <CollapsibleCard title="Key Points">
              <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                {vm.story.claims.slice(0, 5).map((c, i) => (
                  <li key={c.id || i} style={{ lineHeight: 1.5 }}>{c.claim}</li>
                ))}
                {vm.story.claims.length === 0 && <li style={{ color: 'var(--color-text-muted)' }}>No claims recorded.</li>}
              </ul>
            </CollapsibleCard>

            <CollapsibleCard title={`Claims (${String(vm.story.claims.length)})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                {vm.story.claims.map((c, i) => (
                  <div key={c.id || i} style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2) var(--spacing-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)', flex: 1 }}>{c.claim}</span>
                      <span style={{ padding: '1px var(--spacing-2)', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 'var(--font-weight-semibold)', background: badgeColor(c.confidence), color: c.confidence >= 80 ? '#000' : '#fff' }}>{c.confidence}%</span>
                    </div>
                    {c.source && <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{c.source}</span>}
                  </div>
                ))}
                {vm.story.claims.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>No claims recorded.</span>}
              </div>
            </CollapsibleCard>

            <CollapsibleCard title={`Sources (${String(vm.story.sources.length)})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
                {vm.story.sources.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-1) 0' }}>
                    <span style={{ padding: '1px var(--spacing-2)', borderRadius: 'var(--radius-sm)', fontSize: '10px', fontWeight: 'var(--font-weight-semibold)', background: tierColor(s.tier), color: s.tier <= 1 ? '#000' : '#fff' }}>{tierLabel(s.tier)}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                    {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brand-400)', fontSize: '10px', textDecoration: 'none', flexShrink: 0 }}>Link</a>}
                  </div>
                ))}
                {vm.story.sources.length === 0 && <span style={{ color: 'var(--color-text-muted)' }}>No sources recorded.</span>}
              </div>
            </CollapsibleCard>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-default)', overflow: 'hidden', height: 460 }}>
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Knowledge Graph</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{vm.graphNodes.length} nodes &middot; {vm.graphEdges.length} connections</span>
            </div>
            <KnowledgeGraph
              nodes={vm.graphNodes}
              edges={vm.graphEdges}
              width={820}
              height={400}
              showLegend={false}
              showFilters={false}
              showToolbar={false}
              showMiniMap={false}
              showPanel={false}
              mini
            />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>AI Intelligence</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--spacing-3)' }}>
            <AICard label="Headlines" accent="#D4A843">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
                {vm.ai.headlines.map((h, i) => (
                  <li key={i}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 2 }}>{h.headline}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{h.rationale}</div>
                  </li>
                ))}
              </ul>
            </AICard>

            <AICard label="Entity Suggestions" accent="#A855F7">
              {vm.ai.missingEntities.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
                  {vm.ai.missingEntities.map((e, i) => (
                    <li key={i}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{e.name}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{e.reason}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>No missing entities detected.</span>
              )}
            </AICard>

            <AICard label="Source Gaps" accent="#F43F5E">
              {vm.ai.sourceGaps.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
                  {vm.ai.sourceGaps.map((g, i) => (
                    <li key={i}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{g.missingType}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{g.suggestion}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>No source gaps detected.</span>
              )}
            </AICard>

            <AICard label="FAQs" accent="#3B82F6">
              {vm.ai.faqs.length > 0 ? (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1-5)' }}>
                  {vm.ai.faqs.map((f, i) => (
                    <li key={i}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 2 }}>{f.question}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', lineHeight: 1.4 }}>{f.answer}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>No FAQs available.</span>
              )}
            </AICard>

            <AICard label="Simplified" accent="#22C55E">
              <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>{vm.ai.simplified.title}</div>
              <p style={{ lineHeight: 1.5, marginBottom: 'var(--spacing-2)' }}>{vm.ai.simplified.summary}</p>
              {vm.ai.simplified.keyPoints.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
                  {vm.ai.simplified.keyPoints.map((kp, i) => (
                    <li key={i} style={{ lineHeight: 1.4 }}>{kp}</li>
                  ))}
                </ul>
              )}
            </AICard>

            <AICard label="Timeline" accent="#F97316">
              {vm.ai.timelineText ? (
                <p style={{ lineHeight: 1.5 }}>{vm.ai.timelineText}</p>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>No timeline events.</span>
              )}
            </AICard>
          </div>
        </div>
      </div>
    </div>
  );
}

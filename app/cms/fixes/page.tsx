'use client';

import { useState } from 'react';
import { cmsStore, type CMSFix } from '@/utils/cms-store';

function emptyFix(): CMSFix {
  return { id: '', title: '', slug: '', problem: '', rootCauses: [''], existingSolutions: [{ title: '', description: '' }], globalExamples: [{ country: '', approach: '', outcome: '' }], recommendedActions: [{ action: '', responsible: '', timeline: '' }], citizenActions: [''], governmentActions: [''], metrics: [{ metric: '', currentValue: '', targetValue: '' }], status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

const STATUS_COLORS: Record<string, string> = { draft: 'var(--color-text-tertiary)', review: 'var(--color-amber-500)', published: 'var(--color-emerald-500)' };

export default function CMSFixesPage() {
  const [fixes, setFixes] = useState(cmsStore.getFixes());
  const [draft, setDraft] = useState<CMSFix>(emptyFix);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = fixes.filter((f) => !search || f.title.toLowerCase().includes(search.toLowerCase()));

  function save() {
    if (!draft.title) return;
    if (draft.id) { cmsStore.saveFix(draft); }
    else { const id = `fix-${Date.now().toString(36)}`; cmsStore.saveFix({ ...draft, id, createdAt: new Date().toISOString() }); }
    setFixes(cmsStore.getFixes()); setEditing(false); setDraft(emptyFix());
  }

  function edit(f: CMSFix) { setEditing(true); setDraft({ ...f }); }
  function remove(id: string) { cmsStore.deleteFix(id); setFixes(cmsStore.getFixes()); if (draft.id === id) { setEditing(false); setDraft(emptyFix()); } }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div><h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>The Fix Editor</h1><p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{fixes.length} fixes</p></div>
        <button onClick={() => { setEditing(true); setDraft(emptyFix()); }} style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ New Fix</button>
      </div>

      <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search fixes..." style={{ width: '100%', padding: '8px 14px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '20px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
            {filtered.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>No fixes found</div>}
            {filtered.map((f) => (
              <div key={f.id} onClick={() => { edit(f); }} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', cursor: 'pointer', background: editing && draft.id === f.id ? 'color-mix(in srgb, var(--color-amber-500) 8%, transparent)' : 'transparent' }} onMouseEnter={(e) => { if (!editing || draft.id !== f.id) e.currentTarget.style.background = 'var(--color-surface-secondary)'; }} onMouseLeave={(e) => { if (!editing || draft.id !== f.id) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>{f.title}</div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLORS[f.status], display: 'inline-block' }} />
                  <span>{f.status}</span>
                  <span>·</span>
                  <span>{f.recommendedActions.length} actions</span>
                  <span>·</span>
                  <span>{f.metrics.length} metrics</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {editing ? (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px 0' }}>{draft.id ? 'Edit Fix' : 'New Fix'}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Title</label>
                    <input value={draft.title} onChange={(e) => { setDraft({ ...draft, title: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Status</label>
                    <select value={draft.status} onChange={(e) => { setDraft({ ...draft, status: e.target.value as CMSFix['status'] }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                      <option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Problem</label>
                  <textarea value={draft.problem} onChange={(e) => { setDraft({ ...draft, problem: e.target.value }); }} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', minHeight: '60px' }} />
                </div>

                {/* Root Causes */}
                <Section label="Root Causes" count={draft.rootCauses.length} onAdd={() => { setDraft({ ...draft, rootCauses: [...draft.rootCauses, ''] }); }} onRemove={(i) => { setDraft({ ...draft, rootCauses: draft.rootCauses.filter((_, j) => j !== i) }); }}>
                  {draft.rootCauses.map((rc, i) => (
                    <input key={i} value={rc} onChange={(e) => { const r = [...draft.rootCauses]; r[i] = e.target.value; setDraft({ ...draft, rootCauses: r }); }} placeholder={`Root cause ${String(i + 1)}`} style={inputStyle} />
                  ))}
                </Section>

                {/* Existing Solutions */}
                <Section label="Existing Solutions" count={draft.existingSolutions.length} onAdd={() => { setDraft({ ...draft, existingSolutions: [...draft.existingSolutions, { title: '', description: '' }] }); }} onRemove={(i) => { setDraft({ ...draft, existingSolutions: draft.existingSolutions.filter((_, j) => j !== i) }); }}>
                  {draft.existingSolutions.map((s, i) => (
                    <div key={i} style={{ marginBottom: '6px', padding: '8px', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                      <input value={s.title} onChange={(e) => { const arr = [...draft.existingSolutions]; arr[i] = { ...arr[i], title: e.target.value }; setDraft({ ...draft, existingSolutions: arr }); }} placeholder="Solution title" style={{ ...inputStyle, marginBottom: '4px' }} />
                      <input value={s.description} onChange={(e) => { const arr = [...draft.existingSolutions]; arr[i] = { ...arr[i], description: e.target.value }; setDraft({ ...draft, existingSolutions: arr }); }} placeholder="Description" style={inputStyle} />
                    </div>
                  ))}
                </Section>

                {/* Global Examples */}
                <Section label="Global Examples" count={draft.globalExamples.length} onAdd={() => { setDraft({ ...draft, globalExamples: [...draft.globalExamples, { country: '', approach: '', outcome: '' }] }); }} onRemove={(i) => { setDraft({ ...draft, globalExamples: draft.globalExamples.filter((_, j) => j !== i) }); }}>
                  {draft.globalExamples.map((ex, i) => (
                    <div key={i} style={{ marginBottom: '6px', padding: '8px', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                      <input value={ex.country} onChange={(e) => { const arr = [...draft.globalExamples]; arr[i] = { ...arr[i], country: e.target.value }; setDraft({ ...draft, globalExamples: arr }); }} placeholder="Country" style={{ ...inputStyle, marginBottom: '4px' }} />
                      <input value={ex.approach} onChange={(e) => { const arr = [...draft.globalExamples]; arr[i] = { ...arr[i], approach: e.target.value }; setDraft({ ...draft, globalExamples: arr }); }} placeholder="Approach" style={{ ...inputStyle, marginBottom: '4px' }} />
                      <input value={ex.outcome} onChange={(e) => { const arr = [...draft.globalExamples]; arr[i] = { ...arr[i], outcome: e.target.value }; setDraft({ ...draft, globalExamples: arr }); }} placeholder="Outcome" style={inputStyle} />
                    </div>
                  ))}
                </Section>

                {/* Recommended Actions */}
                <Section label="Recommended Actions" count={draft.recommendedActions.length} onAdd={() => { setDraft({ ...draft, recommendedActions: [...draft.recommendedActions, { action: '', responsible: '', timeline: '' }] }); }} onRemove={(i) => { setDraft({ ...draft, recommendedActions: draft.recommendedActions.filter((_, j) => j !== i) }); }}>
                  {draft.recommendedActions.map((a, i) => (
                    <div key={i} style={{ marginBottom: '6px', padding: '8px', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                      <input value={a.action} onChange={(e) => { const arr = [...draft.recommendedActions]; arr[i] = { ...arr[i], action: e.target.value }; setDraft({ ...draft, recommendedActions: arr }); }} placeholder="Action" style={{ ...inputStyle, marginBottom: '4px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <input value={a.responsible} onChange={(e) => { const arr = [...draft.recommendedActions]; arr[i] = { ...arr[i], responsible: e.target.value }; setDraft({ ...draft, recommendedActions: arr }); }} placeholder="Responsible" style={inputStyle} />
                        <input value={a.timeline} onChange={(e) => { const arr = [...draft.recommendedActions]; arr[i] = { ...arr[i], timeline: e.target.value }; setDraft({ ...draft, recommendedActions: arr }); }} placeholder="Timeline" style={inputStyle} />
                      </div>
                    </div>
                  ))}
                </Section>

                {/* Citizen Actions */}
                <Section label="Citizen Actions" count={draft.citizenActions.length} onAdd={() => { setDraft({ ...draft, citizenActions: [...draft.citizenActions, ''] }); }} onRemove={(i) => { setDraft({ ...draft, citizenActions: draft.citizenActions.filter((_, j) => j !== i) }); }}>
                  {draft.citizenActions.map((ca, i) => (
                    <input key={i} value={ca} onChange={(e) => { const arr = [...draft.citizenActions]; arr[i] = e.target.value; setDraft({ ...draft, citizenActions: arr }); }} placeholder={`Citizen action ${String(i + 1)}`} style={inputStyle} />
                  ))}
                </Section>

                {/* Gov Actions */}
                <Section label="Government Actions" count={draft.governmentActions.length} onAdd={() => { setDraft({ ...draft, governmentActions: [...draft.governmentActions, ''] }); }} onRemove={(i) => { setDraft({ ...draft, governmentActions: draft.governmentActions.filter((_, j) => j !== i) }); }}>
                  {draft.governmentActions.map((ga, i) => (
                    <input key={i} value={ga} onChange={(e) => { const arr = [...draft.governmentActions]; arr[i] = e.target.value; setDraft({ ...draft, governmentActions: arr }); }} placeholder={`Government action ${String(i + 1)}`} style={inputStyle} />
                  ))}
                </Section>

                {/* Metrics */}
                <Section label="Metrics to Track" count={draft.metrics.length} onAdd={() => { setDraft({ ...draft, metrics: [...draft.metrics, { metric: '', currentValue: '', targetValue: '' }] }); }} onRemove={(i) => { setDraft({ ...draft, metrics: draft.metrics.filter((_, j) => j !== i) }); }}>
                  {draft.metrics.map((m, i) => (
                    <div key={i} style={{ marginBottom: '6px', padding: '8px', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                      <input value={m.metric} onChange={(e) => { const arr = [...draft.metrics]; arr[i] = { ...arr[i], metric: e.target.value }; setDraft({ ...draft, metrics: arr }); }} placeholder="Metric name" style={{ ...inputStyle, marginBottom: '4px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <input value={m.currentValue} onChange={(e) => { const arr = [...draft.metrics]; arr[i] = { ...arr[i], currentValue: e.target.value }; setDraft({ ...draft, metrics: arr }); }} placeholder="Current" style={inputStyle} />
                        <input value={m.targetValue} onChange={(e) => { const arr = [...draft.metrics]; arr[i] = { ...arr[i], targetValue: e.target.value }; setDraft({ ...draft, metrics: arr }); }} placeholder="Target" style={inputStyle} />
                      </div>
                    </div>
                  ))}
                </Section>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button onClick={save} style={{ padding: '8px 20px', background: 'var(--color-amber-500)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                  {draft.id && <button onClick={() => { remove(draft.id); }} style={{ padding: '8px 16px', border: '1px solid #EF4444', borderRadius: '8px', background: 'none', color: '#EF4444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
                  <button onClick={() => { setEditing(false); setDraft(emptyFix()); }} style={{ padding: '8px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', background: 'none', color: 'var(--color-text-tertiary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              Select or create a fix to edit its structured fields
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 8px', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

function Section({ label, count, children, onAdd, onRemove }: { label: string; count: number; children: React.ReactNode; onAdd: () => void; onRemove?: (i: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label} ({count})</label>
        <button onClick={onAdd} style={{ padding: '2px 8px', border: 'none', background: 'none', color: 'var(--color-amber-500)', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>+ Add</button>
      </div>
      {children}
    </div>
  );
}

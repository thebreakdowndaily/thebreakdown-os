'use client';

import { useState, useEffect } from 'react';
import type { CMSMediaItem } from '@/utils/cms-types';

const TYPE_COLORS: Record<string, string> = { image: '#3B82F6', video: '#EF4444', chart: '#22C55E', document: '#8B5CF6', svg: '#F59E0B', map: '#06B6D4' };

function formatSize(bytes?: number): string {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function CMSMediaPage() {
  const [media, setMedia] = useState<CMSMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [draft, setDraft] = useState<CMSMediaItem | null>(null);
  const [activeTab, setActiveTab] = useState<'metadata' | 'editorial' | 'ai' | 'preview'>('metadata');

  useEffect(() => {
    fetch('/api/v1/media')
      .then(r => r.json())
      .then(res => { setMedia((res as { data: CMSMediaItem[] }).data || []); })
      .finally(() => { setLoading(false); });
  }, []);

  const filtered = media.filter((m) => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (search && !m.caption.toLowerCase().includes(search.toLowerCase()) && !m.alt.toLowerCase().includes(search.toLowerCase()) && !m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  async function saveItem() {
    if (!draft) return;
    if (draft.id) {
      await fetch(`/api/v1/media/${draft.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } else {
      await fetch('/api/v1/media', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    }
    const res = await fetch('/api/v1/media').then(r => r.json()) as { data: CMSMediaItem[] };
    setMedia(res.data || []);
    setDraft(null);
  }

  const handleDraftChange = (field: keyof CMSMediaItem, value: any) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : null);
  };

  const renderBadge = (label: string, color: string) => (
    <span style={{ fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
      {label}
    </span>
  );

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Image Intelligence</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>{media.length} items</p>
        </div>
        <button onClick={() => { setDraft({ id: '', type: 'image', src: '', alt: '', caption: '', tags: [], credit: '', width: 0, height: 0, fileSize: 0, version: 1, createdAt: '', updatedAt: '', agency: '', copyrightOwner: '', photographer: '', licenseType: 'EDITORIAL', imageCategory: 'PHOTO', editorialPriority: 'SECONDARY', verificationStatus: 'PENDING', isAiGenerated: false, focusPointX: 50, focusPointY: 50 }); setActiveTab('metadata'); }} style={{ padding: '9px 18px', background: 'var(--color-amber-500)', color: '#000', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Media</button>
      </div>

      {draft && (
        <div style={{ marginBottom: '20px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)' }}>
            {(['metadata', 'editorial', 'ai', 'preview'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); }} style={{ flex: 1, padding: '12px', background: activeTab === tab ? 'var(--color-surface-secondary)' : 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid var(--color-amber-500)' : '2px solid transparent', color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>
          
          <div style={{ padding: '20px' }}>
            {activeTab === 'metadata' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label>Source URL</label><input value={draft.src} onChange={e => { handleDraftChange('src', e.target.value); }} /></div>
                <div><label>Format Type</label>
                  <select value={draft.type} onChange={e => { handleDraftChange('type', e.target.value); }}>
                    {['image', 'video', 'chart', 'document', 'svg', 'map'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}><label>Alt Text</label><input value={draft.alt} onChange={e => { handleDraftChange('alt', e.target.value); }} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label>Caption</label><textarea value={draft.caption} onChange={e => { handleDraftChange('caption', e.target.value); }} rows={3} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label>Long Description (Accessibility)</label><textarea value={draft.longDescription || ''} onChange={e => { handleDraftChange('longDescription', e.target.value); }} rows={3} /></div>
              </div>
            )}

            {activeTab === 'editorial' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label>Credit Line</label><input value={draft.credit} onChange={e => { handleDraftChange('credit', e.target.value); }} /></div>
                <div><label>Copyright Owner</label><input value={draft.copyrightOwner || ''} onChange={e => { handleDraftChange('copyrightOwner', e.target.value); }} /></div>
                <div><label>Photographer</label><input value={draft.photographer || ''} onChange={e => { handleDraftChange('photographer', e.target.value); }} /></div>
                <div><label>Agency</label><input value={draft.agency || ''} onChange={e => { handleDraftChange('agency', e.target.value); }} /></div>
                
                <div>
                  <label>License Type</label>
                  <select value={draft.licenseType} onChange={e => { handleDraftChange('licenseType', e.target.value); }}>
                    {['EDITORIAL', 'OFFICIAL', 'PUBLIC_DOMAIN', 'CC0', 'CC-BY', 'CC-BY-SA', 'COMMERCIAL', 'LICENSED', 'FAIR_USE', 'AI'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label>Verification Status</label>
                  <select value={draft.verificationStatus} onChange={e => { handleDraftChange('verificationStatus', e.target.value); }}>
                    {['PENDING', 'EDITOR_VERIFIED', 'SOURCE_VERIFIED', 'AI_REVIEWED', 'REJECTED', 'ARCHIVED'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label>Image Category</label>
                  <select value={draft.imageCategory} onChange={e => { handleDraftChange('imageCategory', e.target.value); }}>
                    {['PHOTO', 'ILLUSTRATION', 'INFOGRAPHIC', 'MAP', 'CHART', 'DIAGRAM', 'DOCUMENT', 'SCREENSHOT', 'SATELLITE', 'LOGO'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label>Editorial Priority</label>
                  <select value={draft.editorialPriority} onChange={e => { handleDraftChange('editorialPriority', e.target.value); }}>
                    {['PRIMARY', 'SECONDARY', 'SUPPORTING', 'THUMBNAIL', 'HERO'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={draft.isAiGenerated || false} onChange={e => { handleDraftChange('isAiGenerated', e.target.checked); }} />
                    Image is AI Generated
                  </label>
                </div>
                {draft.isAiGenerated && (
                  <>
                    <div><label>AI Model</label><input value={draft.aiModel || ''} onChange={e => { handleDraftChange('aiModel', e.target.value); }} placeholder="e.g. Midjourney v6" /></div>
                    <div><label>AI Provider</label><input value={draft.aiProvider || ''} onChange={e => { handleDraftChange('aiProvider', e.target.value); }} placeholder="e.g. OpenAI" /></div>
                    <div style={{ gridColumn: '1 / -1' }}><label>AI Prompt Used</label><textarea value={draft.aiPrompt || ''} onChange={e => { handleDraftChange('aiPrompt', e.target.value); }} rows={3} /></div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '16px', border: '1px dashed var(--color-border-subtle)', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 16px 0' }}>Responsive Cropping & Focal Point</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '16px' }}>Select the primary focal point (X/Y) to ensure the subject is always visible across breakpoints.</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '200px', height: '112px', background: '#333', position: 'relative', borderRadius: '4px' }}>
                        <div style={{ position: 'absolute', top: `${draft.focusPointY}%`, left: `${draft.focusPointX}%`, width: '10px', height: '10px', background: 'red', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid white' }} />
                      </div>
                      <span style={{ fontSize: '11px' }}>Desktop (16:9)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '120px', height: '120px', background: '#333', position: 'relative', borderRadius: '4px' }}>
                        <div style={{ position: 'absolute', top: `${draft.focusPointY}%`, left: `${draft.focusPointX}%`, width: '10px', height: '10px', background: 'red', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid white' }} />
                      </div>
                      <span style={{ fontSize: '11px' }}>Tablet (1:1)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '90px', height: '160px', background: '#333', position: 'relative', borderRadius: '4px' }}>
                        <div style={{ position: 'absolute', top: `${draft.focusPointY}%`, left: `${draft.focusPointX}%`, width: '10px', height: '10px', background: 'red', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid white' }} />
                      </div>
                      <span style={{ fontSize: '11px' }}>Mobile (9:16)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
                    <div>
                      <label style={{ fontSize: '11px' }}>Focus X %</label>
                      <input type="range" min="0" max="100" value={draft.focusPointX} onChange={e => { handleDraftChange('focusPointX', parseInt(e.target.value)); }} style={{ width: '100px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px' }}>Focus Y %</label>
                      <input type="range" min="0" max="100" value={draft.focusPointY} onChange={e => { handleDraftChange('focusPointY', parseInt(e.target.value)); }} style={{ width: '100px' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <button onClick={saveItem} style={{ padding: '8px 20px', background: 'var(--color-amber-500)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save & Apply Policies</button>
              <button onClick={() => { setDraft(null); }} style={{ padding: '8px 16px', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', background: 'none', color: 'var(--color-text-tertiary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); }} style={{ padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}>
          <option value="all">All Types</option>
          {['image', 'video', 'chart', 'document', 'svg', 'map'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); }} placeholder="Search by caption, alt, or tags..." style={{ flex: 1, padding: '7px 12px', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', outline: 'none', fontFamily: 'inherit' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filtered.map((item) => (
          <div key={item.id} onClick={() => { setDraft({ ...item }); }} style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }}>
            <div style={{ height: '140px', background: 'var(--color-surface-secondary)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
                {item.isAiGenerated && renderBadge('AI GENERATED', '#EAB308')}
                {item.verificationStatus === 'EDITOR_VERIFIED' && renderBadge('VERIFIED', '#22C55E')}
                {item.licenseType && renderBadge(item.licenseType, '#3B82F6')}
              </div>
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.caption || item.alt || 'Untitled Media'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                <strong>Credit:</strong> {item.credit || item.copyrightOwner || item.agency || 'Unknown'}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ fontSize: '10px', background: 'var(--color-surface-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{item.imageCategory || 'UN-CATEGORIZED'}</span>
                <span style={{ fontSize: '10px', background: 'var(--color-surface-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{item.editorialPriority || 'NO PRIORITY'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        label { font-size: 11px; font-weight: 600; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
        input, textarea, select { width: 100%; padding: 8px 12px; border: 1px solid var(--color-border-subtle); borderRadius: 6px; background: var(--color-surface-secondary); color: var(--color-text-primary); font-size: 13px; outline: none; font-family: inherit; box-sizing: border-box; }
      `}</style>
    </div>
  );
}

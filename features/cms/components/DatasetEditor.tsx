'use client';

import { useState, useCallback } from 'react';
import type { Dataset, DatasetVersion, Metric, Observation, Visualization } from '@/types/canonical';

const EMPTY_DATASET: Partial<Dataset> = {
  title: '', slug: '', description: '', category: 'economy', frequency: 'annual',
  unitLabel: '', source: '', sourceUrl: '', methodology: '', tags: [],
  versions: [], metrics: [], dimensions: [], visualizations: [],
  relatedEntityIds: [], relatedStoryIds: [], relatedTopicIds: [],
};

export function DatasetEditor({ dataset: initial }: { dataset: Dataset | null }) {
  const [dataset, setDataset] = useState<Partial<Dataset>>(initial ?? { ...EMPTY_DATASET });
  const [preview, setPreview] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importResult, setImportResult] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = useCallback(<K extends keyof Dataset>(field: K, value: Dataset[K]) => {
    setDataset(prev => ({ ...prev, [field]: value }));
  }, []);

  const addMetric = useCallback(() => {
    const newMetric: Metric = { id: `m-${Date.now()}`, name: '', label: '', description: '', dataType: 'number', unit: '', decimalPlaces: 1, isPrimary: false };
    updateField('metrics', [...(dataset.metrics || []), newMetric]);
  }, [dataset.metrics, updateField]);

  const removeMetric = useCallback((idx: number) => {
    const metrics = [...(dataset.metrics || [])];
    metrics.splice(idx, 1);
    updateField('metrics', metrics);
  }, [dataset.metrics, updateField]);

  const updateMetric = useCallback((idx: number, field: keyof Metric, value: string | number | boolean) => {
    const metrics = [...(dataset.metrics || [])];
    metrics[idx] = { ...metrics[idx], [field]: value };
    updateField('metrics', metrics);
  }, [dataset.metrics, updateField]);

  const addObservation = useCallback(() => {
    const version = dataset.versions?.[0];
    if (!version) return;
    if (version.series.length === 0) {
      version.series.push({ id: `s-${Date.now()}`, metricId: dataset.metrics?.[0]?.id || '', dimensionFilters: {}, observations: [] });
    }
    version.series[0].observations.push({ period: '', value: null });
    updateField('versions', dataset.versions!);
  }, [dataset.versions, dataset.metrics, updateField]);

  const addVisualization = useCallback(() => {
    const newViz: Visualization = { id: `viz-${Date.now()}`, title: '', type: 'line', metricIds: dataset.metrics?.length ? [dataset.metrics[0].id] : [], config: {} };
    updateField('visualizations', [...(dataset.visualizations || []), newViz]);
  }, [dataset.visualizations, dataset.metrics, updateField]);

  const handleImport = useCallback(() => {
    try {
      setImportResult('Processing...');
      const parsed = importFormat === 'csv'
        ? parseCsv(importText)
        : parseJson(importText);
      const metricId = dataset.metrics?.[0]?.id;
      if (!metricId) { setImportResult('Error: Add at least one metric first'); return; }
      const observations: Observation[] = parsed
        .filter(r => !isNaN(parseFloat(r.value)))
        .map(r => ({ period: r.period, value: parseFloat(r.value), annotation: r.annotation || r.notes }));
      const version = dataset.versions?.[0];
      if (version) {
        if (version.series.length === 0) {
          version.series.push({ id: `s-${Date.now()}`, metricId, dimensionFilters: {}, observations });
        } else {
          version.series[0].observations = observations;
        }
      } else {
        const newVersion: DatasetVersion = { id: `v-${Date.now()}`, version: '1.0', publishedAt: new Date().toISOString(), notes: 'Imported', series: [{ id: `s-${Date.now()}`, metricId, dimensionFilters: {}, observations }], metadata: {} };
        updateField('versions', [newVersion]);
      }
      updateField('versions', dataset.versions || []);
      setImportResult(`Imported ${observations.length} observations`);
      setImportText('');
    } catch (e) { setImportResult(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`); }
  }, [importText, importFormat, dataset.metrics, dataset.versions, updateField]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const id = dataset.id || crypto.randomUUID();
      const body = { ...dataset, id, createdAt: dataset.createdAt || new Date().toISOString() };
      const method = dataset.id ? 'PUT' : 'POST';
      const url = dataset.id ? `/api/v1/datasets/${dataset.slug}` : '/api/v1/datasets';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const result = await res.json();
      setDataset(result.data || result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error('Save error:', e); }
    setSaving(false);
  }, [dataset]);

  return (
    <div className="space-y-8">
      {saved && <div className="bg-[#22C55E]/10 text-[#22C55E] px-4 py-2 rounded-lg text-sm">Dataset saved successfully</div>}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setPreview(false)} className={`px-4 py-2 text-sm rounded-lg ${!preview ? 'bg-[#D4A843] text-[#0A0A0A]' : 'bg-[#2A2A2A] text-[#A1A1AA]'}`}>Edit</button>
        <button onClick={() => setPreview(true)} className={`px-4 py-2 text-sm rounded-lg ${preview ? 'bg-[#D4A843] text-[#0A0A0A]' : 'bg-[#2A2A2A] text-[#A1A1AA]'}`}>Preview</button>
      </div>

      {preview ? (
        <div className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-6">
          <h2 className="text-xl font-bold text-[#F5F5F5]">{dataset.title || 'Untitled Dataset'}</h2>
          <p className="text-sm text-[#A1A1AA] mt-2">{dataset.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[#A1A1AA]">Source:</span> <span className="text-[#F5F5F5]">{dataset.source}</span></div>
            <div><span className="text-[#A1A1AA]">Frequency:</span> <span className="text-[#F5F5F5]">{dataset.frequency}</span></div>
            <div><span className="text-[#A1A1AA]">Category:</span> <span className="text-[#F5F5F5]">{dataset.category}</span></div>
            <div><span className="text-[#A1A1AA]">Metrics:</span> <span className="text-[#F5F5F5]">{dataset.metrics?.length || 0}</span></div>
          </div>
          {dataset.versions?.[0]?.series[0]?.observations && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#2A2A2A]"><th className="text-left py-2 px-3 text-[#A1A1AA]">Period</th><th className="text-left py-2 px-3 text-[#A1A1AA]">Value</th></tr></thead>
                <tbody>
                  {dataset.versions[0].series[0].observations.slice(0, 10).map((obs, i) => (
                    <tr key={i} className="border-b border-[#2A2A2A]/50">
                      <td className="py-2 px-3 text-[#F5F5F5] font-mono">{obs.period}</td>
                      <td className="py-2 px-3 text-[#22C55E] font-mono">{obs.value !== null ? obs.value : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dataset.versions[0].series[0].observations.length > 10 && (
                <p className="text-xs text-[#A1A1AA] mt-2">...and {dataset.versions[0].series[0].observations.length - 10} more rows</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <section className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-[#A1A1AA] mb-1">Title</label><input value={dataset.title || ''} onChange={e => updateField('title', e.target.value)} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]" /></div>
              <div><label className="block text-xs text-[#A1A1AA] mb-1">Slug</label><input value={dataset.slug || ''} onChange={e => updateField('slug', e.target.value)} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]" /></div>
              <div className="col-span-2"><label className="block text-xs text-[#A1A1AA] mb-1">Description</label><textarea value={dataset.description || ''} onChange={e => updateField('description', e.target.value)} rows={3} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]" /></div>
              <div><label className="block text-xs text-[#A1A1AA] mb-1">Category</label><select value={dataset.category} onChange={e => updateField('category', e.target.value as Dataset['category'])} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]">
                {['economy', 'climate', 'health', 'education', 'demographics', 'energy', 'trade', 'governance', 'technology', 'military', 'infrastructure', 'social', 'environment', 'finance'].map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
              <div><label className="block text-xs text-[#A1A1AA] mb-1">Frequency</label><select value={dataset.frequency} onChange={e => updateField('frequency', e.target.value as Dataset['frequency'])} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]">
                {['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'adhoc'].map(f => <option key={f} value={f}>{f}</option>)}
              </select></div>
              <div><label className="block text-xs text-[#A1A1AA] mb-1">Source Name</label><input value={dataset.source || ''} onChange={e => updateField('source', e.target.value)} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]" /></div>
              <div><label className="block text-xs text-[#A1A1AA] mb-1">Source URL</label><input value={dataset.sourceUrl || ''} onChange={e => updateField('sourceUrl', e.target.value)} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]" /></div>
              <div className="col-span-2"><label className="block text-xs text-[#A1A1AA] mb-1">Methodology</label><textarea value={dataset.methodology || ''} onChange={e => updateField('methodology', e.target.value)} rows={2} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#F5F5F5]" /></div>
            </div>
          </section>

          <section className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">Metrics</h2>
              <button onClick={addMetric} className="px-3 py-1.5 text-xs bg-[#D4A843] text-[#0A0A0A] rounded hover:bg-[#C49A38]">+ Add Metric</button>
            </div>
            {dataset.metrics?.map((metric, i) => (
              <div key={metric.id || i} className="grid grid-cols-6 gap-3 p-3 bg-[#0A0A0A] rounded-lg">
                <input value={metric.name} onChange={e => updateMetric(i, 'name', e.target.value)} placeholder="Name" className="col-span-1 bg-[#151515] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]" />
                <input value={metric.label} onChange={e => updateMetric(i, 'label', e.target.value)} placeholder="Label" className="col-span-1 bg-[#151515] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]" />
                <select value={metric.dataType} onChange={e => updateMetric(i, 'dataType', e.target.value)} className="bg-[#151515] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]">
                  {['number', 'percentage', 'currency', 'ratio', 'index', 'count', 'text'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={metric.unit} onChange={e => updateMetric(i, 'unit', e.target.value)} placeholder="Unit" className="bg-[#151515] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]" />
                <label className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                  <input type="checkbox" checked={metric.isPrimary} onChange={e => updateMetric(i, 'isPrimary', e.target.checked)} className="accent-[#D4A843]" />
                  Primary
                </label>
                <button onClick={() => removeMetric(i)} className="text-xs text-[#F43F5E] hover:underline">Remove</button>
              </div>
            )) || <p className="text-sm text-[#A1A1AA]">No metrics defined.</p>}
          </section>

          <section className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">Data</h2>
              <button onClick={addObservation} className="px-3 py-1.5 text-xs bg-[#2A2A2A] text-[#A1A1AA] rounded hover:bg-[#3A3A3A]">+ Add Row</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#2A2A2A]"><th className="text-left py-2 px-3 text-[#A1A1AA]">Period</th><th className="text-left py-2 px-3 text-[#A1A1AA]">Value</th><th className="text-left py-2 px-3 text-[#A1A1AA]">Annotation</th></tr></thead>
                <tbody>
                  {dataset.versions?.[0]?.series[0]?.observations.map((obs, i) => (
                    <tr key={i} className="border-b border-[#2A2A2A]/50">
                      <td className="py-1 px-3"><input value={obs.period} onChange={e => { const v = [...(dataset.versions || [])]; v[0].series[0].observations[i].period = e.target.value; updateField('versions', v); }} className="w-24 bg-[#0A0A0A] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5] font-mono" /></td>
                      <td className="py-1 px-3"><input type="number" value={obs.value ?? ''} onChange={e => { const v = [...(dataset.versions || [])]; v[0].series[0].observations[i].value = e.target.value ? parseFloat(e.target.value) : null; updateField('versions', v); }} className="w-20 bg-[#0A0A0A] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5] font-mono" /></td>
                      <td className="py-1 px-3"><input value={obs.annotation || ''} onChange={e => { const v = [...(dataset.versions || [])]; v[0].series[0].observations[i].annotation = e.target.value; updateField('versions', v); }} className="w-40 bg-[#0A0A0A] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]" /></td>
                    </tr>
                  )) || <tr><td colSpan={3} className="py-4 text-center text-[#A1A1AA]">No data rows. Add a metric and import or enter data manually.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#F5F5F5]">Import Data</h2>
            <div className="flex gap-2 mb-2">
              <button onClick={() => setImportFormat('csv')} className={`px-3 py-1.5 text-xs rounded ${importFormat === 'csv' ? 'bg-[#D4A843] text-[#0A0A0A]' : 'bg-[#2A2A2A] text-[#A1A1AA]'}`}>CSV</button>
              <button onClick={() => setImportFormat('json')} className={`px-3 py-1.5 text-xs rounded ${importFormat === 'json' ? 'bg-[#D4A843] text-[#0A0A0A]' : 'bg-[#2A2A2A] text-[#A1A1AA]'}`}>JSON</button>
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={5} placeholder={importFormat === 'csv' ? 'period,value\n2024-Q1,5.4\n2024-Q2,6.2' : '[{"period":"2024-Q1","value":5.4}]'} className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-2 text-xs text-[#F5F5F5] font-mono" />
            <div className="flex gap-2 items-center">
              <button onClick={handleImport} className="px-4 py-2 text-xs bg-[#D4A843] text-[#0A0A0A] rounded hover:bg-[#C49A38]">Import</button>
              {importResult && <span className="text-xs text-[#A1A1AA]">{importResult}</span>}
            </div>
          </section>

          <section className="bg-[#151515] rounded-lg border border-[#2A2A2A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F5F5F5]">Visualizations</h2>
              <button onClick={addVisualization} className="px-3 py-1.5 text-xs bg-[#D4A843] text-[#0A0A0A] rounded hover:bg-[#C49A38]">+ Add Chart</button>
            </div>
            {dataset.visualizations?.map((viz, i) => (
              <div key={viz.id || i} className="grid grid-cols-4 gap-3 p-3 bg-[#0A0A0A] rounded-lg">
                <input value={viz.title} onChange={e => { const v = [...(dataset.visualizations || [])]; v[i] = { ...v[i], title: e.target.value }; updateField('visualizations', v); }} placeholder="Title" className="bg-[#151515] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]" />
                <select value={viz.type} onChange={e => { const v = [...(dataset.visualizations || [])]; v[i] = { ...v[i], type: e.target.value as Visualization['type'] }; updateField('visualizations', v); }} className="bg-[#151515] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-[#F5F5F5]">
                  {['line', 'bar', 'area', 'pie', 'table', 'heatmap'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-xs text-[#A1A1AA] self-center">Metric IDs: {viz.metricIds.join(', ')}</span>
                <button onClick={() => { const v = [...(dataset.visualizations || [])]; v.splice(i, 1); updateField('visualizations', v); }} className="text-xs text-[#F43F5E] hover:underline self-center">Remove</button>
              </div>
            )) || <p className="text-sm text-[#A1A1AA]">No visualizations defined.</p>}
          </section>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-[#D4A843] text-[#0A0A0A] rounded-lg font-medium hover:bg-[#C49A38] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : (dataset.id ? 'Update Dataset' : 'Create Dataset')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV must have header and data rows');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

function parseJson(text: string): Record<string, string>[] {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('JSON must be an array');
  return data.map((item: Record<string, unknown>) => {
    const row: Record<string, string> = {};
    for (const [k, v] of Object.entries(item)) { row[k] = String(v ?? ''); }
    return row;
  });
}

'use client';

import { useMemo, useState } from 'react';
import { useUp403Data } from '@/components/up403/data';
import { ConstituencyTable } from '@/components/up403/ConstituencyTable';
import { useCollections } from '@/components/up403/collections';
import {
  applyQuery,
  PRESETS,
  FIELD_LABELS,
  OPERATOR_LABELS,
  PARTY_LIST,
  rulesToSummary,
  ruleToSentence,
  detectDataGap,
  type QueryRule,
  type QueryOperator,
  type FieldRef,
  type QueryYear,
} from '@/lib/up403/query-builder';
import { downloadCsv, downloadJson } from '@/lib/up403/export';

const EMPTY_RULE: QueryRule = { id: 'custom-1', field: 'winner_party', operator: 'eq', value: 'BJP', year: 2022, label: 'Custom rule' };

export default function Up403QueryPage() {
  const { records, loading, error } = useUp403Data();
  const { collections, createCollection, addToCollection } = useCollections();
  const [rules, setRules] = useState<QueryRule[]>(PRESETS[0].build());
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [customRules, setCustomRules] = useState<QueryRule[]>([{ ...EMPTY_RULE }]);
  const [showCustom, setShowCustom] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [targetCollection, setTargetCollection] = useState('');

  const results = useMemo(() => applyQuery(records, showCustom ? customRules : rules), [records, rules, customRules, showCustom]);
  const summary = showCustom ? rulesToSummary(customRules) : rulesToSummary(rules);
  const dataGap = useMemo(() => detectDataGap(records, showCustom ? customRules : rules), [records, rules, customRules, showCustom]);

  const runPreset = (id: string) => {
    setPresetId(id);
    const preset = PRESETS.find(p => p.id === id);
    if (preset) setRules(preset.build());
  };

  const updateCustom = (index: number, patch: Partial<QueryRule>) => {
    setCustomRules(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addCustomRule = () => {
    setCustomRules(prev => [
      ...prev,
      { ...EMPTY_RULE, id: `custom-${Date.now().toString(36)}`, label: 'Custom rule' },
    ]);
  };

  const removeCustomRule = (index: number) => {
    setCustomRules(prev => prev.filter((_, i) => i !== index));
  };

  const saveResults = () => {
    const ids = results.map(r => r.canonical_constituency_id);
    if (targetCollection) {
      addToCollection(targetCollection, ids);
    } else if (collectionName.trim()) {
      createCollection(collectionName.trim(), summary, ids);
      setCollectionName('');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Query Builder</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Rule-based queries over the frozen dataset. No SQL. Every rule is transparent and explainable.
        </p>
      </header>

      <section aria-label="Preset queries" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Preset queries</h2>
          <button onClick={() => { setShowCustom(false); }} className={`text-xs ${!showCustom ? 'text-[#D4A843]' : 'text-[#6B6B6B]'}`}>Using presets</button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => { runPreset(preset.id); }}
              className={`rounded-xl border p-4 text-left transition-all ${presetId === preset.id && !showCustom ? 'border-[#D4A843]/60 bg-[#D4A843]/5' : 'border-[#2A2A2A] bg-[#111111] hover:border-[#D4A843]/30'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#F5F5F5]">{preset.title}</span>
                {presetId === preset.id && !showCustom ? <span className="text-[10px] uppercase tracking-widest text-[#D4A843]">Active</span> : null}
              </div>
              <p className="mt-1 text-xs text-[#A1A1AA]">{preset.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Rule breakdown" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Active rules</h2>
          <button onClick={() => { setShowCustom(v => !v); }} className="text-xs text-[#D4A843] hover:underline">
            {showCustom ? 'Switch to presets' : 'Build custom query'}
          </button>
        </div>

        {!showCustom ? (
          <ul className="space-y-2">
            {rules.map((rule, i) => (
              <li key={rule.id} className="flex items-center gap-2 rounded-lg bg-[#111111] px-3 py-2 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#D4A843]/15 text-xs text-[#D4A843]">{i + 1}</span>
                <span className="text-[#E5E5E5]">{ruleToSentence(rule)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-3">
            {customRules.map((rule, i) => (
              <div key={rule.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-[#111111] px-3 py-3">
                <span className="text-xs text-[#6B6B6B]">{i + 1}.</span>
                <select
                  value={rule.field}
                  onChange={e => { updateCustom(i, { field: e.target.value as FieldRef, label: `Custom rule ${String(i + 1)}` }); }}
                  className="rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-2 py-1.5 text-sm text-[#E5E5E5] outline-none"
                  aria-label="Field"
                >
                  {Object.entries(FIELD_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={rule.operator}
                  onChange={e => { updateCustom(i, { operator: e.target.value as QueryOperator }); }}
                  className="rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-2 py-1.5 text-sm text-[#E5E5E5] outline-none"
                  aria-label="Operator"
                >
                  {Object.entries(OPERATOR_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {typeof rule.value === 'number' ? (
                  <input
                    type="number"
                    value={rule.value}
                    onChange={e => { updateCustom(i, { value: Number(e.target.value) }); }}
                    className="w-28 rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-2 py-1.5 text-sm text-[#E5E5E5] outline-none"
                  />
                ) : (
                  <select
                    value={rule.field === 'reservation_type' ? (rule.value as string) : (rule.value as string)}
                    onChange={e => { updateCustom(i, { value: e.target.value }); }}
                    className="rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-2 py-1.5 text-sm text-[#E5E5E5] outline-none"
                    aria-label="Value"
                  >
                    {rule.field === 'reservation_type'
                      ? ['SC', 'ST', 'GEN'].map(v => <option key={v} value={v}>{v}</option>)
                      : rule.field === 'dna_classification'
                        ? ['BJP_BASELINE', 'SP_BASELINE', 'TRANSITIONAL', 'OTHER', 'CONTESTED', 'BIPARTISAN', 'SWING', 'INC_BASELINE'].map(v => <option key={v} value={v}>{v}</option>)
                        : PARTY_LIST.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                <select
                  value={rule.year ?? 'none'}
                  onChange={e => { updateCustom(i, { year: e.target.value === 'none' ? undefined : (Number(e.target.value) as QueryYear) }); }}
                  className="rounded-lg border border-[#2A2A2A] bg-[#1C1C1C] px-2 py-1.5 text-sm text-[#E5E5E5] outline-none"
                  aria-label="Year"
                >
                  <option value="none">—</option>
                  <option value={2012}>2012</option>
                  <option value={2017}>2017</option>
                  <option value={2022}>2022</option>
                </select>
                <button
                  onClick={() => { removeCustomRule(i); }}
                  disabled={customRules.length <= 1}
                  className="ml-auto rounded-lg px-2 py-1 text-xs text-[#FF6B61] hover:bg-[#FF3B30]/10 disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            ))}
            <button onClick={addCustomRule} className="rounded-lg border border-dashed border-[#2A2A2A] px-3 py-2 text-sm text-[#A1A1AA] hover:border-[#D4A843]/40 hover:text-[#D4A843]">
              + Add rule
            </button>
            <p className="text-xs text-[#6B6B6B]">All rules must hold simultaneously (AND logic). Example 5 — flood risk — returns 0 because disaster-risk data is not yet collected at constituency level; the query stays honest.</p>
          </div>
        )}
      </section>

      {error ? <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-4 text-sm text-[#FF6B61]">Failed to load: {error}</div> : null}

      {dataGap ? (
        <div className="rounded-2xl border border-[#D4A843]/40 bg-[#D4A843]/10 p-4">
          <div className="flex items-start gap-3">
            <span className="rounded bg-[#D4A843]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#D4A843]">Data gap</span>
            <div>
              <p className="text-sm text-[#E5E5E5]">{dataGap.detail}</p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
                The query executed honestly and returned the empty result. Evidence for this field is traced in the{' '}
                <a href={`/up403/evidence/${records[0]?.canonical_constituency_id ?? ''}`} className="text-[#D4A843] hover:underline">Evidence Explorer</a>.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <section aria-label="Results" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Results</h2>
            <p className="mt-1 text-xs text-[#6B6B6B]">{loading ? 'Loading dataset…' : `${String(results.length)} of 403 constituencies match. ${summary}`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { downloadCsv(results, `UP403-query-${String(Date.now())}.csv`); }}
              disabled={results.length === 0}
              className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#E5E5E5] hover:border-[#22C55E]/40 disabled:opacity-40"
            >
              Export CSV
            </button>
            <button
              onClick={() => { downloadJson(results, `UP403-query-${String(Date.now())}.json`); }}
              disabled={results.length === 0}
              className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#E5E5E5] hover:border-[#22C55E]/40 disabled:opacity-40"
            >
              Export JSON
            </button>
          </div>
        </div>

        <ConstituencyTable records={results} maxHeight="60vh" />
      </section>

      <section aria-label="Save results" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Save results as a collection</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={targetCollection}
            onChange={e => { setTargetCollection(e.target.value); }}
            className="rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-[#E5E5E5] outline-none"
            aria-label="Collection"
          >
            <option value="">Existing collection…</option>
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.name} ({col.memberIds.length})</option>
            ))}
          </select>
          <input
            value={collectionName}
            onChange={e => { setCollectionName(e.target.value); }}
            placeholder="Or name a new collection"
            className="w-64 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-[#E5E5E5] outline-none placeholder:text-[#6B6B6B]"
          />
          <button
            onClick={saveResults}
            disabled={results.length === 0 || (!targetCollection && !collectionName.trim())}
            className="rounded-lg bg-[#D4A843] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            Save {results.length > 0 ? `${String(results.length)} seats` : ''}
          </button>
        </div>
      </section>
    </div>
  );
}

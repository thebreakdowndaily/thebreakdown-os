'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ConstituencyRecord } from '@/lib/up403/types';
import { PartyBadge } from '@/components/up403/ui';
import { dataStatusBadge } from '@/components/up403/data';

interface ProvEntry {
  authority: string;
  source: string;
  quality: string;
}

interface ProvRecord {
  original_authority: string;
  dataset: string;
  dataset_version: string;
  verification_date: string;
  research_cutoff_date: string;
  source_quality: string;
  originating_phase: string;
}

const FIELD_GROUPS: Array<{ title: string; fields: string[] }> = [
  { title: 'Identity & boundaries', fields: ['canonical_constituency_id', 'constituency_name', 'ac_number', 'pc_name', 'pc_number', 'reservation_type'] },
  { title: 'Administrative geography', fields: ['district', 'division', 'region'] },
  { title: 'Election results', fields: ['winner_2012', 'winner_2017', 'winner_2022'] },
  { title: 'Representation', fields: ['current_mla_name', 'current_mp_name', 'ls2024_pc_winner'] },
  { title: 'Derived analytics', fields: ['dna_classification', 'competitiveness_class'] },
  { title: 'Governance', fields: ['governance_issue_count'] },
  { title: 'Demographics & economy', fields: ['population_value', 'demographics_availability_status', 'economy_availability_status', 'odop_product'] },
];

interface ProvDetailResponse {
  data: ConstituencyRecord & {
    _provenance?: ProvRecord;
    _provenanceFields?: Record<string, ProvEntry>;
  };
}

function toDisplay(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value) || '—';
}

export default function Up403EvidencePage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<ConstituencyRecord | null>(null);
  const [prov, setProv] = useState<Record<string, ProvEntry>>({});
  const [apiProv, setApiProv] = useState<ProvRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/up403/v1/constituencies/${encodeURIComponent(params.id)}?include=provenance`, { headers: { Accept: 'application/json' } })
      .then(res => {
        if (!res.ok) throw new Error('Request failed: ' + String(res.status));
        return res.json() as Promise<ProvDetailResponse>;
      })
      .then(json => {
        if (!active) return;
        setRecord(json.data);
        setApiProv(json.data._provenance ?? null);
        setProv(json.data._provenanceFields ?? {});
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Unknown error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#A1A1AA]">Loading evidence record…</div>;
  }

  if (error || !record) {
    return (
      <div className="rounded-2xl border border-[#FF3B30]/40 bg-[#FF3B30]/10 p-6">
        <p className="text-sm font-medium text-[#FF6B61]">{error ?? 'Record not found.'}</p>
        <Link href="/up403/search" className="mt-2 inline-block text-sm text-[#D4A843] hover:underline">Search again →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <nav className="text-xs text-[#6B6B6B]" aria-label="Breadcrumb">
        <Link href="/up403" className="hover:text-[#D4A843]">Research</Link>
        <span className="mx-2">/</span>
        <Link href={`/up403/constituencies/${record.canonical_constituency_id}`} className="hover:text-[#D4A843]">{record.constituency_name}</Link>
        <span className="mx-2">/</span>
        <span className="text-[#A1A1AA]">Evidence</span>
      </nav>

      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Evidence Explorer — {record.constituency_name}</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Every field traces: <strong className="text-[#D4A843]">Source → Authority → Dataset → Original field → Verification date</strong>.
        </p>
      </header>

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5" aria-label="Dataset provenance">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Dataset provenance</h2>
        {apiProv ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Original authority', value: apiProv.original_authority },
              { label: 'Dataset', value: apiProv.dataset },
              { label: 'Dataset version', value: apiProv.dataset_version },
              { label: 'Verification date', value: apiProv.verification_date },
              { label: 'Research cutoff', value: apiProv.research_cutoff_date },
              { label: 'Originating phase', value: apiProv.originating_phase },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-[#111111] p-3">
                <div className="text-xs text-[#6B6B6B]">{item.label}</div>
                <div className="mt-1 text-sm text-[#F5F5F5]">{item.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#A1A1AA]">Dataset-level provenance not available. Verify via the Research API with <code className="text-[#D4A843]">?include=provenance</code>.</p>
        )}
      </section>

      <div className="space-y-6">
        {FIELD_GROUPS.map(group => {
          const entries = group.fields
            .filter(f => f in record)
            .map(f => ({
              field: f,
              value: record[f as keyof ConstituencyRecord],
              prov: prov[f] ?? null,
            }));

          return (
            <section key={group.title} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5" aria-label={group.title}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">{group.title}</h2>
              <div className="space-y-3">
                {entries.map(entry => {
                  const raw = entry.prov as unknown as ProvEntry | null;
                  const value = toDisplay(entry.value);
                  const qualCls = entry.field === 'reservation_type'
                    ? ''
                    : `text-xs ${dataStatusBadge(entry.value === null ? 'NOT_AVAILABLE' : 'verified')} rounded px-2 py-0.5`;
                  return (
                    <div key={entry.field} className="rounded-xl border border-[#232323] bg-[#111111] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <code className="text-xs text-[#D4A843]">{entry.field}</code>
                        {entry.value !== null ? <span className={qualCls}>{typeof entry.value === 'object' ? 'structured' : toDisplay(entry.value)}</span> : <span className="text-[10px] text-[#6B6B6B]">no value</span>}
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">Source</div>
                          <div className="mt-0.5 text-xs text-[#E5E5E5]">{(raw?.source ?? record.source_datasets) || '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">Authority</div>
                          <div className="mt-0.5 text-xs text-[#E5E5E5]">{raw?.authority ?? apiProv?.original_authority ?? '—'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">Dataset</div>
                          <div className="mt-0.5 text-xs text-[#E5E5E5]">{apiProv?.dataset ?? 'UP403 Constituency Intelligence Dataset'} v{apiProv?.dataset_version ?? '1.1.0'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">Verified</div>
                          <div className="mt-0.5 text-xs text-[#E5E5E5]">{record.verification_date || apiProv?.verification_date || '—'}</div>
                        </div>
                      </div>
                      {value !== '—' && value !== 'null' && value !== '' && value !== '[object Object]' ? (
                        <div className="mt-2 rounded bg-[#0D0D0D] px-2 py-1 text-xs text-[#A1A1AA]">value: <span className="text-[#E5E5E5]">{value}</span></div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5" aria-label="Evidence summary">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Evidence summary</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <PartyBadge party={record.winner_party_2022} />
          <span className="rounded-lg bg-[#1C1C1C] px-2 py-1 text-[#A1A1AA]">verification date: {record.verification_date || '—'}</span>
          <span className="rounded-lg bg-[#1C1C1C] px-2 py-1 text-[#A1A1AA]">cutoff: {record.research_cutoff_date || '—'}</span>
          <span className="rounded-lg bg-[#1C1C1C] px-2 py-1 text-[#A1A1AA]">version: {record.master_dataset_version || '1.1.0'}</span>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href={`/up403/constituencies/${record.canonical_constituency_id}`} className="rounded-lg bg-[#D4A843] px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
            Back to constituency
          </Link>
        </div>
      </section>
    </div>
  );
}

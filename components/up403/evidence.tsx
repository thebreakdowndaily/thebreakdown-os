import { getProvenanceForField, getApiProvenance } from '@/lib/up403/provenance';
import type { ConstituencyRecord } from '@/lib/up403/types';
import { dataStatusBadge } from '@/lib/up403/format';

export function EvidenceBadge({ field }: { field: string }) {
  const prov = getProvenanceForField(field);
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2A2A2A] bg-[#151515] px-1.5 py-0.5 text-[10px] text-[#6B6B6B] transition-colors hover:border-[#D4A843]/40 hover:text-[#D4A843]">
        source
      </summary>
      <div className="mt-1 w-72 rounded-xl border border-[#2A2A2A] bg-[#111111] p-3 text-xs" role="group" aria-label={`Source for ${field}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B6B6B]">{field}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${prov.quality === 'AUTHENTIC' ? 'bg-[#22C55E]/15 text-[#22C55E]' : prov.quality === 'DERIVED' ? 'bg-[#D4A843]/15 text-[#D4A843]' : prov.quality.startsWith('NOT_AVAILABLE') ? 'bg-[#FF3B30]/15 text-[#FF6B61]' : 'bg-[#2A2A2A] text-[#A1A1AA]'}`}>
            {prov.quality.replace(/_/g, ' ')}
          </span>
        </div>
        <dl className="space-y-1.5">
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[#6B6B6B]">Authority</dt>
            <dd className="text-right text-[#E5E5E5]">{prov.authority}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-[#6B6B6B]">Dataset</dt>
            <dd className="font-mono text-right text-[#D4A843]">{prov.source}</dd>
          </div>
        </dl>
      </div>
    </details>
  );
}

export function DatasetProvenance({ record }: { record: ConstituencyRecord }) {
  const prov = getApiProvenance(record);
  return (
    <section className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Dataset provenance</h2>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-[#6B6B6B]">Original authority</dt><dd className="mt-0.5 text-[#E5E5E5]">{prov.original_authority}</dd></div>
        <div><dt className="text-xs text-[#6B6B6B]">Dataset</dt><dd className="mt-0.5 text-[#E5E5E5]">{prov.dataset}</dd></div>
        <div><dt className="text-xs text-[#6B6B6B]">Version</dt><dd className="mt-0.5 font-mono text-[#D4A843]">{prov.dataset_version}</dd></div>
        <div><dt className="text-xs text-[#6B6B6B]">Verified</dt><dd className="mt-0.5 text-[#E5E5E5]">{prov.verification_date}</dd></div>
        <div><dt className="text-xs text-[#6B6B6B]">Research cutoff</dt><dd className="mt-0.5 text-[#E5E5E5]">{prov.research_cutoff_date}</dd></div>
        <div>
          <dt className="text-xs text-[#6B6B6B]">Source quality</dt>
          <dd className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold ${dataStatusBadge(prov.source_quality)}`}>{prov.source_quality}</dd>
        </div>
      </dl>
    </section>
  );
}

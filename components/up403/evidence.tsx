import { getProvenanceForField, getApiProvenance } from '@/lib/up403/provenance';
import type { ConstituencyRecord } from '@/lib/up403/types';
import { dataStatusBadge } from '@/lib/up403/format';
import { EvidenceBadge as GenericEvidenceBadge } from '@/packages/evidence/src';

export function EvidenceBadge({ field }: { field: string }) {
  const prov = getProvenanceForField(field);
  return (
    <GenericEvidenceBadge
      field={field}
      authority={prov.authority}
      source={prov.source}
      quality={prov.quality}
    />
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

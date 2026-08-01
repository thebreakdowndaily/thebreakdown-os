import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadData, getDataById, getDatasetVersion, getResearchCutoff } from '@/lib/up403/loader';
import { toSlug, fromSlug } from '@/lib/up403/slug';
import { winnerRow, formatNumber, formatPct, partyColorClass, dataStatusBadge } from '@/lib/up403/format';
import { EvidenceBadge, DatasetProvenance } from '@/components/up403/evidence';
import type { ConstituencyRecord } from '@/lib/up403/types';

const SITE_URL = 'https://thebreakdown.in';
const YEARS = [2012, 2017, 2022] as const;

export async function generateStaticParams() {
  await loadData();
  const byId = getDataById();
  return [...byId.keys()].map(id => ({ slug: toSlug(id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rec = await findRecord(slug);
  if (!rec) return { title: 'Constituency not found' };
  const url = `${SITE_URL}/up403/${toSlug(rec.canonical_constituency_id)}`;
  const description = `${rec.constituency_name} (AC-${String(rec.ac_number)}), ${rec.district} district, ${rec.region}. ${rec.current_mla_name || 'Current MLA'} (${rec.current_mla_party || 'party'}) holds the seat. Election history across 2012–2022, political DNA, competitiveness and representation — every figure traced to a source.`;
  return {
    title: `${rec.constituency_name} Assembly Constituency`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${rec.constituency_name} Assembly Constituency`,
      description,
      type: 'article',
      url,
      siteName: 'The Breakdown — UP403 Constituency Intelligence',
      images: [{ url: 'https://thebreakdown.in/images/og/up403-default.png', width: 1200, height: 630, alt: `UP403 — ${rec.constituency_name} Assembly Constituency` }],
    },
    twitter: { card: 'summary_large_image', title: `${rec.constituency_name} Assembly Constituency`, description },
  };
}

async function findRecord(slug: string): Promise<ConstituencyRecord | undefined> {
  await loadData();
  return getDataById().get(fromSlug(slug));
}

export default async function Up403ReaderProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rec = await findRecord(slug);
  if (!rec) notFound();

  const rows = YEARS.map(y => ({ year: y, ...winnerRow(rec, y) }));
  const version = getDatasetVersion();
  const cutoff = getResearchCutoff();
  const url = `${SITE_URL}/up403/${toSlug(rec.canonical_constituency_id)}`;

  const geoFields: Array<{ field: string; label: string; value: string }> = [
    { field: 'area_sq_km', label: 'Area', value: rec.area_sq_km ? `${formatNumber(rec.area_sq_km)} km²` : '—' },
    { field: 'terrain_type', label: 'Terrain', value: rec.terrain_type || '—' },
    { field: 'major_rivers', label: 'Rivers', value: rec.major_rivers || '—' },
    { field: 'forest_area', label: 'Forest area', value: rec.forest_area || '—' },
    { field: 'sub_divisions_count', label: 'Sub-divisions', value: formatNumber(rec.sub_divisions_count) },
    { field: 'tehsils_count', label: 'Tehsils', value: formatNumber(rec.tehsils_count) },
    { field: 'development_blocks_count', label: 'Dev. blocks', value: formatNumber(rec.development_blocks_count) },
    { field: 'municipal_bodies_count', label: 'Municipal bodies', value: formatNumber(rec.municipal_bodies_count) },
  ];

  const economyFields: Array<{ field: string; label: string; value: string }> = [
    { field: 'odop_product', label: 'ODOP product', value: rec.odop_product || '—' },
    { field: 'odop_cluster', label: 'ODOP cluster', value: rec.odop_cluster || '—' },
    { field: 'major_crops_summary', label: 'Major crops', value: rec.major_crops_summary || '—' },
    { field: 'major_industries_summary', label: 'Major industries', value: rec.major_industries_summary || '—' },
    { field: 'irrigation_coverage', label: 'Irrigation', value: rec.irrigation_coverage || '—' },
    { field: 'bank_branches_count', label: 'Bank branches', value: rec.bank_branches_count || '—' },
    { field: 'financial_inclusion_status', label: 'Financial inclusion', value: rec.financial_inclusion_status || '—' },
    { field: 'national_highways_count', label: 'National highways', value: rec.national_highways_count || '—' },
    { field: 'railway_stations_count', label: 'Railway stations', value: rec.railway_stations_count || '—' },
  ];

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `${rec.constituency_name} Assembly Constituency`,
      description: `Uttar Pradesh Legislative Assembly constituency ${rec.constituency_name}, ${rec.district} district.`,
      address: { '@type': 'PostalAddress', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' },
      url,
      containedInPlace: { '@type': 'AdministrativeArea', name: rec.district },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'UP403 Constituency Intelligence', item: `${SITE_URL}/up403` },
        { '@type': 'ListItem', position: 3, name: rec.constituency_name, item: url },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <Script id={`schema-${rec.canonical_constituency_id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav className="text-xs text-[#6B6B6B]" aria-label="Breadcrumb">
        <Link href="/up403" className="hover:text-[#D4A843]">Uttar Pradesh</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-[#A1A1AA]">{rec.constituency_name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#F5F5F5] sm:text-4xl">{rec.constituency_name} <span className="text-xl font-normal text-[#A1A1AA]">Assembly Constituency</span></h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#A1A1AA]">
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">AC-{String(rec.ac_number)}</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.pc_name} · PC-{String(rec.pc_number)}</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.district} district</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.division} division</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.region}</span>
            <span className="rounded-lg bg-[#1C1C1C] px-2 py-0.5">{rec.reservation_type || 'GENERAL'}</span>
          </div>
          <p className="mt-2 text-xs text-[#6B6B6B]">
            Canonical ID {rec.canonical_constituency_id} · Dataset {version} · Research cutoff {cutoff}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/up403/compare?ids=${rec.canonical_constituency_id}`} className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#D4A843]/40">Compare</Link>
          <Link href={`/up403/timeline/${rec.canonical_constituency_id}`} className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-[#E5E5E5] hover:border-[#D4A843]/40">Timeline</Link>
          <Link href={`/up403/constituencies/${rec.canonical_constituency_id}`} className="rounded-lg bg-[#D4A843] px-3 py-2 text-sm font-semibold text-black hover:opacity-90">Research view</Link>
        </div>
      </header>

      <section aria-label="Current representation" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Who represents this seat</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
              <div className="text-xs uppercase tracking-widest text-[#6B6B6B]">MLA · elected 2022</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-lg font-semibold text-[#F5F5F5]">{rec.current_mla_name || 'n/a'}</div>
                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${partyColorClass(rec.current_mla_party)}`}>{rec.current_mla_party || 'N/A'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#A1A1AA]">
                <EvidenceBadge field="current_mla_name" />
                <span>{rec.current_mla_elected_via === 'BY_ELECTION' ? `By-election · ${rec.current_mla_by_election_date || 'n/a'}` : rec.current_mla_status || ''}</span>
              </div>
              {rec.current_mla_vacancy_reason ? (
                <p className="mt-2 rounded-lg border border-[#D4A843]/30 bg-[#D4A843]/10 p-2 text-xs text-[#D4A843]">
                  Vacancy: {rec.current_mla_vacancy_reason}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-4">
              <div className="text-xs uppercase tracking-widest text-[#6B6B6B]">MP · Lok Sabha</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-lg font-semibold text-[#F5F5F5]">{rec.current_mp_name || 'n/a'}</div>
                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${partyColorClass(rec.current_mp_party)}`}>{rec.current_mp_party || 'N/A'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#A1A1AA]">
                <EvidenceBadge field="current_mp_name" />
                <span>{rec.current_mp_pc_name || ''}</span>
              </div>
              <div className="mt-3 rounded-lg border border-[#2A2A2A] bg-[#0D0D0D] p-3 text-xs">
                <span className="text-[#6B6B6B]">2024 Lok Sabha: </span>
                <span className="text-[#E5E5E5]">{rec.ls2024_pc_winner || 'n/a'}</span>
                <span className={`ml-1 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium ${partyColorClass(rec.ls2024_pc_winner_party)}`}>{rec.ls2024_pc_winner_party || ''}</span>
                {rec.ls2024_party_changed_flag ? <span className="ml-1 text-[#D4A843]">· party changed vs incumbent</span> : null}
                <EvidenceBadge field="ls2024_pc_winner" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Political DNA</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#D4A843]/15 px-3 py-1 text-sm font-semibold text-[#D4A843]">{rec.dna_classification || 'Unclassified'}</span>
            {rec.dna_sub_type ? <span className="rounded-lg bg-[#1C1C1C] px-3 py-1 text-sm text-[#A1A1AA]">{rec.dna_sub_type}</span> : null}
            <EvidenceBadge field="dna_classification" />
          </div>
          <p className="mt-3 text-sm text-[#A1A1AA]">{rec.dna_reasoning || 'No reasoning recorded.'}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Fact label="Competitiveness" value={rec.competitiveness_class || 'n/a'} field="competitiveness_class" />
            <Fact label="Trend" value={rec.competitiveness_trend || 'n/a'} field="competitiveness_trend" />
            <Fact label="Avg margin" value={formatPct(rec.competitiveness_avg_margin_pct)} field="competitiveness_avg_margin_pct" />
            <Fact label="Seat volatility" value={formatNumber(rec.seat_volatility_index)} field="seat_volatility_index" />
            <Fact label="Party continuity" value={formatNumber(rec.party_continuity_score)} field="party_continuity_score" />
            <Fact label="Most persistent" value={rec.most_persistent_party || '—'} field="most_persistent_party" />
            <Fact label="Unique winners" value={formatNumber(rec.unique_winners_across_elections)} field="unique_winners_across_elections" />
            <Fact label="Trajectory" value={rec.trajectory_steps_compact || '—'} field="trajectory_steps_compact" />
          </dl>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-[#6B6B6B]">Confidence: {rec.dna_confidence || 'n/a'}</span>
            <span className="text-[#6B6B6B]">Algorithm: {rec.dna_algorithm_version || 'n/a'}</span>
          </div>
        </div>
      </section>

      <section aria-label="Election history" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Election history</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {rows.map(row => (
            <div key={String(row.year)} className={`rounded-xl border p-4 ${row.year === 2022 ? 'border-[#D4A843]/40 bg-[#D4A843]/5' : 'border-[#2A2A2A] bg-[#111111]'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#F5F5F5]">{String(row.year)}</span>
                {row.year === 2022 ? <span className="text-[10px] uppercase tracking-widest text-[#D4A843]">Latest</span> : null}
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#A1A1AA]">Winner</span>
                  <span className="flex items-center gap-2 text-right text-[#F5F5F5]">{row.winner} <Badge party={row.party} /></span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#A1A1AA]">Vote share</span>
                  <span className="text-[#F5F5F5]">{formatPct(row.voteShare)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#A1A1AA]">Margin</span>
                  <span className="text-[#F5F5F5]">{formatPct(row.margin)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#A1A1AA]">Runner-up</span>
                  <Badge party={row.runnerUpParty} />
                </div>
              </div>
              <div className="mt-2"><EvidenceBadge field={`winner_${String(row.year)}`} /></div>
            </div>
          ))}
        </div>
        {rec.seat_history_summary ? <p className="mt-3 text-xs text-[#6B6B6B]">{rec.seat_history_summary}</p> : null}
      </section>

      <section aria-label="Geography and context" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Geography & administration</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            {geoFields.map(f => (
              <div key={f.field}>
                <dt className="flex items-center gap-1 text-xs text-[#6B6B6B]">{f.label} <EvidenceBadge field={f.field} /></dt>
                <dd className="mt-0.5 text-[#E5E5E5]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Development & services</h2>
          <dl className="space-y-2.5 text-sm">
            <ServiceRow label="Schools" value={rec.government_schools_count} field="government_schools_count" />
            <ServiceRow label="Degree colleges" value={rec.degree_colleges_count} field="degree_colleges_count" />
            <ServiceRow label="ITIs" value={rec.iti_count} field="iti_count" />
            <ServiceRow label="District hospitals" value={rec.district_hospitals_count} field="district_hospitals_count" />
            <ServiceRow label="PHCs" value={rec.phc_count} field="phc_count" />
            <ServiceRow label="CHCs" value={rec.chc_count} field="chc_count" />
            <ServiceRow label="Electrification" value={rec.household_electrification_info} field="household_electrification_info" />
          </dl>
        </div>
      </section>

      <section aria-label="Economy" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Economy</h2>
          <span className={`text-xs ${dataStatusBadge(rec.economy_availability_status)} rounded px-2 py-0.5`}>{rec.economy_availability_status || 'n/a'}</span>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
          {economyFields.map(f => (
            <div key={f.field}>
              <dt className="flex items-center gap-1 text-xs text-[#6B6B6B]">{f.label} <EvidenceBadge field={f.field} /></dt>
              <dd className="mt-0.5 text-[#E5E5E5]">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Governance" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Governance & issues</h2>
          <span className={`text-xs ${dataStatusBadge(rec.governance_availability_status)} rounded px-2 py-0.5`}>{rec.governance_availability_status || 'n/a'}</span>
        </div>
        <p className="max-w-3xl text-sm text-[#A1A1AA]">
          {rec.governance_issue_summary || 'No constituency-level governance issue data has been collected for this seat (dataset gap, not a claim of zero issues).'}
        </p>
        <div className="mt-3 flex gap-6 text-sm">
          <span className="text-[#A1A1AA]">Recorded issues: <strong className="text-[#F5F5F5]">{String(rec.governance_issue_count)}</strong></span>
          <span className="text-[#A1A1AA]">Linked projects: <strong className="text-[#F5F5F5]">{String(rec.linked_projects_count)}</strong></span>
          <span className="text-[#A1A1AA]">PMGSY: <strong className="text-[#F5F5F5]">{String(Object.keys(rec.pmgsy_projects_info).length)}</strong> entries</span>
        </div>
      </section>

      <DatasetProvenance record={rec} />

      <section aria-label="Transparency note" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">About this data</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[#A1A1AA]">
          This page is generated from the frozen UP403 dataset (v1.1.0, research cutoff {cutoff}). Figures where the dataset
          records no value at constituency level are shown as gaps — an absence of collected data, not a finding of zero.
          Every field's authority and source are listed via the <span className="text-[#D4A843]">source</span> disclosures above.
          For a full record including raw values and research tools, use the Research view.
        </p>
      </section>
    </div>
  );
}

function Badge({ party }: { party: string | null | undefined }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${partyColorClass(party)}`}>
      {party || 'N/A'}
    </span>
  );
}

function Fact({ label, value, field }: { label: string; value: string; field: string }) {
  return (
    <div className="rounded-lg bg-[#111111] p-3">
      <dt className="flex items-center gap-1 text-xs text-[#6B6B6B]">{label} <EvidenceBadge field={field} /></dt>
      <dd className="mt-1 font-semibold text-[#F5F5F5]">{value}</dd>
    </div>
  );
}

function ServiceRow({ label, value, field }: { label: string; value: string | null; field: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1 text-xs text-[#6B6B6B]">{label} <EvidenceBadge field={field} /></dt>
      <dd className="text-[#E5E5E5]">{value || '—'}</dd>
    </div>
  );
}

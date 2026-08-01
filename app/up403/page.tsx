import Link from 'next/link';
import type { Metadata } from 'next';
import { loadData, getCachedData, getFilterOptions, getDatasetVersion, getResearchCutoff, getTotalConstituencies } from '@/lib/up403/loader';
import { computeAnalytics } from '@/lib/up403/analytics';
import { runStoryDiscovery } from '@/lib/up403/stories';
import { formatNumber, partyColorClass } from '@/lib/up403/format';

const SITE_URL = 'https://thebreakdown.in';

export const metadata: Metadata = {
  title: 'UP403 Constituency Intelligence — Uttar Pradesh Assembly Seats',
  description: 'Evidence-first intelligence on Uttar Pradesh\'s 403 assembly constituencies: election history 2012–2022, political DNA, competitiveness, representation, and governance context — every figure traced to a source.',
  alternates: { canonical: `${SITE_URL}/up403` },
  openGraph: {
    title: 'UP403 Constituency Intelligence',
    description: '403 assembly constituencies, 69 districts, 3 elections — every figure traced to a source.',
    type: 'website',
    url: `${SITE_URL}/up403`,
    siteName: 'The Breakdown — UP403 Constituency Intelligence',
    images: [{ url: 'https://thebreakdown.in/images/og/up403-default.png', width: 1200, height: 630, alt: 'UP403 Constituency Intelligence' }],
  },
  twitter: { card: 'summary_large_image', title: 'UP403 Constituency Intelligence', description: '403 assembly constituencies, 69 districts, 3 elections — every figure traced to a source.' },
};

const REGION_COLORS: Record<string, string> = {
  'Western UP (NCR + Western)': 'text-[#D4A843] border-[#D4A843]/30 bg-[#D4A843]/10',
  'Central UP': 'text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10',
  'Eastern UP (Gangetic Plain)': 'text-sky-400 border-sky-500/30 bg-sky-500/10',
};

export default async function Up403Home() {
  await loadData();
  const filters = getFilterOptions();
  const analytics = computeAnalytics();
  const version = getDatasetVersion();
  const cutoff = getResearchCutoff();
  const totalSeats = getTotalConstituencies();

  const topParties = Object.entries(analytics.party_hold_counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topDna = Object.entries(analytics.dna_distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const stories = runStoryDiscovery(getCachedData());

  const regions = filters.regions.map(region => ({
    region,
    seats: Object.values(analytics.regional_party_dominance[region]).reduce((a, b) => a + b, 0),
    leadingParty: Object.entries(analytics.regional_party_dominance[region]).sort((a, b) => b[1] - a[1])[0]?.[0],
  }));

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#2A2A2A] bg-gradient-to-b from-[#151515] to-[#0F0F0F] p-8">
        <h1 className="max-w-2xl font-serif text-3xl font-semibold leading-tight text-[#F5F5F5] sm:text-4xl">
          Uttar Pradesh, constituency by constituency — every figure traced to a source.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#A1A1AA]">
          403 assembly constituencies · 69 districts · 3 elections (2012, 2017, 2022) · 2024 Lok Sabha alignment.
          All data is frozen at dataset {version} (research cutoff {cutoff}) and verified against the Election Commission of India, the Census of India, and Government of Uttar Pradesh records.
        </p>
        <form method="get" action="/up403/search" className="mt-6 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] p-3" role="search">
          <svg className="h-5 w-5 shrink-0 text-[#A1A1AA]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            type="search"
            name="q"
            placeholder="Search constituency, MLA, MP, district, party… e.g. Azamgarh, SP, BJP, Ayodhya"
            className="flex-1 bg-transparent text-sm text-[#F5F5F5] placeholder:text-[#6B6B6B] outline-none"
            aria-label="Search constituencies, MLAs, MPs, districts or parties"
          />
          <button type="submit" className="rounded-lg bg-[#D4A843] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90">
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6B6B6B]">
          <span className="rounded border border-[#2A2A2A] bg-[#111111] px-2 py-1">Dataset {version} · frozen</span>
          <span className="rounded border border-[#2A2A2A] bg-[#111111] px-2 py-1">Research cutoff {cutoff}</span>
          <span className="rounded border border-[#22C55E]/30 bg-[#22C55E]/10 px-2 py-1 text-[#22C55E]">Verified against ECI / Census / GoUP records</span>
        </div>
      </section>

      <section aria-label="State overview" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <OverviewCard label="Assembly seats" value={formatNumber(totalSeats)} />
        <OverviewCard label="Districts" value={formatNumber(filters.districts.length)} />
        <OverviewCard label="Divisions" value={formatNumber(filters.divisions.length)} />
        <OverviewCard label="Regions" value={formatNumber(filters.regions.length)} />
        <OverviewCard label="Parliamentary seats" value={formatNumber(80)} sub="UP's LS allocation" />
        <OverviewCard label="Elections covered" value="3" sub="2012 · 2017 · 2022" />
      </section>

      <section aria-label="Assembly control" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Assembly control (current MLAs)</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topParties.map(([party, count]) => {
              const share = Math.round((count / totalSeats) * 100);
              return (
                <div key={party} className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${partyColorClass(party)}`}>{party}</span>
                    <span className="text-sm font-semibold text-[#F5F5F5]">{formatNumber(count)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#232323]">
                    <div className="h-full rounded-full bg-[#D4A843]/70" style={{ width: `${String(share)}%` }} />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-[#6B6B6B]">{share}% of seats</div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#6B6B6B]">
            Party of the sitting MLA per constituency. Figures trace to ECI records via dataset UP403-DATA-06.
          </p>
        </div>

        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Political DNA</h2>
          <div className="space-y-2">
            {topDna.map(([dna, count]) => (
              <div key={dna} className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm">
                <span className="text-[#E5E5E5]">{dna}</span>
                <span className="font-mono text-[#D4A843]">{formatNumber(count)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#6B6B6B]">DNA classification derived by the UP403 DNA Algorithm v1.0.0 (dataset UP403-DATA-07).</p>
        </div>
      </section>

      <section aria-label="Regions">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Regions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {regions.map(({ region, seats, leadingParty }) => (
            <Link key={region} href={`/up403/explore?region=${encodeURIComponent(region)}`} className="group rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all hover:border-[#D4A843]/40">
              <div className="flex items-center justify-between">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${REGION_COLORS[region] || 'border border-[#2A2A2A] bg-[#1C1C1C] text-[#A1A1AA]'}`}>{region}</span>
                <span className="text-sm font-semibold text-[#F5F5F5]">{formatNumber(seats)} seats</span>
              </div>
              <div className="mt-3 text-xs text-[#A1A1AA]">
                Leading party: <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${partyColorClass(leadingParty)}`}>{leadingParty || 'n/a'}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Explore">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">Explore the platform</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ExploreCard href="/up403/map" title="Interactive map" desc="Filter all 403 seats by region, party, DNA and competitiveness. Click any seat to open its profile." />
          <ExploreCard href="/up403/compare" title="Compare seats" desc="Place 2–5 constituencies side by side across elections, margins and representation." />
          <ExploreCard href="/up403/stories" title="Story discovery" desc="Rule-based story candidates across the state — landslide victories, fortress seats, split mandates." />
          <ExploreCard href="/up403/search" title="Universal search" desc="One search across constituencies, MLAs, MPs, districts and parties." />
        </div>
      </section>

      <section aria-label="Story candidates">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">What the data shows</h2>
          <Link href="/up403/stories" className="text-sm text-[#D4A843] hover:underline">All stories →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 3).map(report => (
            <Link key={report.story.id} href="/up403/stories" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all hover:border-[#D4A843]/40">
              <div className="text-xs uppercase tracking-widest text-[#6B6B6B]">{report.story.category}</div>
              <h3 className="mt-1 font-semibold text-[#F5F5F5]">{report.story.title}</h3>
              <p className="mt-1 text-sm text-[#A1A1AA]">{report.story.description}</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-semibold text-[#D4A843]">{formatNumber(report.matches.length)}</div>
                  <div className="text-xs text-[#A1A1AA]">matching constituencies</div>
                </div>
                <span className="text-xs text-[#6B6B6B]">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Trust" className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#A1A1AA]">How to read this platform</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-[#A1A1AA]">
          Every figure on every page carries a <span className="text-[#D4A843]">source</span> disclosure naming its authority
          (Election Commission of India, Census of India, Government of Uttar Pradesh), the originating dataset, and whether it is
          authentic, derived, or not yet available at constituency level. Where the dataset has a gap, we say so. Nothing here is
          prediction — the dataset is frozen at {version} and does not incorporate post-{cutoff} events.
        </p>
      </section>
    </div>
  );
}

function OverviewCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4">
      <div className="text-xs uppercase tracking-wide text-[#A1A1AA]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#F5F5F5]">{value}</div>
      {sub ? <div className="mt-1 text-xs text-[#A1A1AA]">{sub}</div> : null}
    </div>
  );
}

function ExploreCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all hover:border-[#D4A843]/40 hover:bg-[#1A1A1A]">
      <h3 className="font-semibold text-[#F5F5F5]">{title}</h3>
      <p className="mt-1 text-sm text-[#A1A1AA]">{desc}</p>
      <span className="mt-3 inline-block text-xs text-[#6B6B6B] opacity-0 transition-opacity group-hover:opacity-100">Open →</span>
    </Link>
  );
}

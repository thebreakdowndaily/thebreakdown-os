import type { Metadata } from 'next';
import Link from 'next/link';
import { loadData, getCachedData } from '@/lib/up403/loader';
import { runStoryDiscovery, DATA_GAPS } from '@/lib/up403/stories';
import { toSlug } from '@/lib/up403/slug';
import { partyColorClass } from '@/lib/up403/format';

const SITE_URL = 'https://thebreakdown.in';

const CATEGORY_LABEL: Record<string, string> = {
  electoral: 'Electoral',
  representation: 'Representation',
  sociology: 'Sociology',
};

export const metadata: Metadata = {
  title: 'Story Discovery — UP403 Constituency Intelligence',
  description: 'Rule-based, evidence-backed story candidates across Uttar Pradesh\'s 403 assembly constituencies — landslide victories, fortress seats, split mandates. No AI, no prediction.',
  alternates: { canonical: `${SITE_URL}/up403/stories` },
  openGraph: {
    title: 'Story Discovery — UP403 Constituency Intelligence',
    description: 'Rule-based, evidence-backed story candidates across Uttar Pradesh\'s 403 assembly constituencies.',
    type: 'website',
    url: `${SITE_URL}/up403/stories`,
    siteName: 'The Breakdown — UP403 Constituency Intelligence',
  },
  twitter: { card: 'summary_large_image', title: 'Story Discovery — UP403 Constituency Intelligence', description: 'Rule-based, evidence-backed story candidates across UP\'s 403 assembly constituencies.' },
};

export default async function Up403StoriesPage() {
  await loadData();
  const reports = runStoryDiscovery(getCachedData());

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Story Discovery</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Rule-based story candidates computed from the dataset. Transparent, explainable, evidence-backed — no AI, no prediction.
        </p>
      </header>

      <section aria-label="Data gaps" className="rounded-2xl border border-[#D4A843]/30 bg-[#D4A843]/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#D4A843]">Dimensions where rules cannot fire yet</h2>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          These story types are defined but return zero matches because the frozen dataset does not yet capture the dimension. When the data arrives, the rules activate automatically.
        </p>
        <ul className="mt-3 space-y-2">
          {DATA_GAPS.map(gap => (
            <li key={gap.dimension} className="rounded-xl border border-[#2A2A2A] bg-[#151515] p-3">
              <span className="text-sm font-medium text-[#F5F5F5]">{gap.dimension}</span>
              <p className="mt-0.5 text-xs text-[#A1A1AA]">{gap.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center text-sm text-[#A1A1AA]">No stories matched the rules.</div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <details key={report.story.id} className="group rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 open:border-[#D4A843]/40">
              <summary className="flex cursor-pointer flex-wrap items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B]">{CATEGORY_LABEL[report.story.category] ?? report.story.category}</span>
                    <span className="rounded bg-[#D4A843]/15 px-2 py-0.5 text-xs font-semibold text-[#D4A843]">{String(report.matches.length)} matches</span>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-[#F5F5F5]">{report.story.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm text-[#A1A1AA]">{report.story.description}</p>
                </div>
                <span className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-sm text-[#A1A1AA] group-open:hidden">Show seats</span>
                <span className="hidden rounded-lg border border-[#D4A843]/40 px-3 py-1.5 text-sm text-[#D4A843] group-open:inline-block">Collapse</span>
              </summary>

              <div className="mt-4 space-y-2 border-t border-[#232323] pt-4">
                {report.matches.slice(0, 40).map(match => (
                  <Link
                    key={match.record.canonical_constituency_id}
                    href={`/up403/${toSlug(match.record.canonical_constituency_id)}`}
                    className="block rounded-xl border border-[#232323] bg-[#111111] p-3 transition-colors hover:border-[#D4A843]/40"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-[#F5F5F5]">{match.headline}</div>
                      <span className="text-xs text-[#6B6B6B]">AC-{String(match.record.ac_number)} · {match.record.district}</span>
                    </div>
                    <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-[#A1A1AA]">
                      {match.evidence.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </Link>
                ))}
                {report.matches.length > 40 ? (
                  <p className="text-center text-xs text-[#6B6B6B]">Showing 40 of {String(report.matches.length)} — export via Query Builder or Collections.</p>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(report.matches.slice(0, 6).map(m => m.record.winner_party_2022))).map(party => (
                  <PartyPill key={party} party={party} />
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function PartyPill({ party }: { party: string | null | undefined }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${partyColorClass(party)}`}>
      {party || 'N/A'}
    </span>
  );
}

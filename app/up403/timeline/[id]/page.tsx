import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadData, getDataById } from '@/lib/up403/loader';
import { buildTimeline } from '@/lib/up403/timeline';
import { toSlug } from '@/lib/up403/slug';
import { partyColorClass } from '@/lib/up403/format';
import type { TimelineEvent } from '@/lib/up403/types';

const SITE_URL = 'https://thebreakdown.in';

const CATEGORY_STYLE: Record<TimelineEvent['category'], { dot: string; label: string }> = {
  election: { dot: 'bg-[#D4A843]', label: 'Election' },
  representation: { dot: 'bg-[#22C55E]', label: 'Representation' },
  by_election: { dot: 'bg-sky-400', label: 'By-election' },
  vacancy: { dot: 'bg-[#FF6B61]', label: 'Vacancy' },
  project: { dot: 'bg-purple-400', label: 'Project' },
  governance: { dot: 'bg-orange-400', label: 'Governance' },
};

export async function generateStaticParams() {
  await loadData();
  const byId = getDataById();
  return [...byId.keys()].map(id => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const rec = await findRecord(id);
  if (!rec) return { title: 'Timeline not found' };
  const name = rec.constituency_name;
  return {
    title: `Timeline — ${name} Assembly Constituency`,
    description: `Electoral and representation timeline for ${name} (AC-${String(rec.ac_number)}), ${rec.district} district — elections, by-elections, vacancies and governance events.`,
    alternates: { canonical: `${SITE_URL}/up403/timeline/${id}` },
    openGraph: {
      title: `Timeline — ${name} Assembly Constituency`,
      description: `Electoral and representation timeline for ${name}, ${rec.district} district.`,
      type: 'website',
      url: `${SITE_URL}/up403/timeline/${id}`,
      siteName: 'The Breakdown — UP403 Constituency Intelligence',
    },
    twitter: { card: 'summary_large_image', title: `Timeline — ${name} Assembly Constituency`, description: `Electoral and representation timeline for ${name}.` },
  };
}

async function findRecord(id: string) {
  await loadData();
  return getDataById().get(id);
}

export default async function Up403TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rec = await findRecord(id);
  if (!rec) notFound();

  const events = buildTimeline(rec);
  const profileSlug = toSlug(rec.canonical_constituency_id);

  return (
    <div className="space-y-8">
      <nav className="text-xs text-[#6B6B6B]" aria-label="Breadcrumb">
        <Link href="/up403" className="hover:text-[#D4A843]">Uttar Pradesh</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <Link href={`/up403/${profileSlug}`} className="hover:text-[#D4A843]">{rec.constituency_name}</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-[#A1A1AA]">Timeline</span>
      </nav>

      <header>
        <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5]">Timeline — {rec.constituency_name}</h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">Electoral, representation and governance events in order.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-[#1C1C1C] px-3 py-1.5 text-sm text-[#A1A1AA]">
          Current MLA: <strong className="text-[#F5F5F5]">{rec.current_mla_name || '—'}</strong>
        </span>
        <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${partyColorClass(rec.current_mla_party)}`}>{rec.current_mla_party || 'N/A'}</span>
        <span className="rounded-lg bg-[#1C1C1C] px-3 py-1.5 text-sm text-[#A1A1AA]">Status: {rec.current_mla_status || '—'}</span>
      </div>

      <section aria-label="Timeline events">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-10 text-center text-sm text-[#A1A1AA]">
            No events recorded for this constituency.
          </div>
        ) : (
          <ol className="relative ml-3 space-y-6 border-l border-[#2A2A2A] pl-6">
            {events.map((event, i) => {
              const style = CATEGORY_STYLE[event.category];
              return (
                <li key={i} className="relative">
                  <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${style.dot}`} aria-hidden="true" />
                  <div className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[#D4A843]">{event.date}</span>
                      <span className="rounded bg-[#1C1C1C] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#A1A1AA]">{style.label}</span>
                      <span className="text-xs text-[#6B6B6B]">{event.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#E5E5E5]">{event.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={`/up403/${profileSlug}`} className="rounded-lg bg-[#D4A843] px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
          Back to constituency
        </Link>
        <Link href={`/up403/constituencies/${id}`} className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-sm text-[#E5E5E5] hover:border-[#D4A843]/40">
          Research view
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import type { Investigation } from '@/types/canonical';
import Container from '@/components/layout/Container';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import SourcesList from '@/components/story/SourcesList';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const services = bootstrapServices({ publicOnly: true });
  const { data: investigations } = await services.investigations.getInvestigations();
  return investigations.map((inv) => ({ slug: inv.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const inv = await services.investigations.getInvestigationBySlug(slug);
  if (!inv) return {};
  return {
    title: `${inv.title} — Investigation — The Breakdown`,
    description: inv.subtitle || inv.summary,
    openGraph: {
      title: `${inv.title} — The Breakdown Investigation`,
      description: inv.subtitle || inv.summary,
      url: `https://thebreakdown.in/investigation/${slug}`,
    },
  };
}

export default async function InvestigationPage({ params }: Props) {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const inv = await services.investigations.getInvestigationBySlug(slug);
  if (!inv) notFound();

  return (
    <>
      <Script id="investigation-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Series',
            name: inv.title,
            description: inv.subtitle || inv.summary,
            datePublished: inv.publishedAt,
            dateModified: inv.updatedAt,
            about: { '@type': 'Thing', name: inv.title },
          }),
        }}
      />

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Investigations', href: '/investigations' },
        { label: inv.title, href: `/investigation/${inv.slug}` },
      ]} />
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#0A0A0A] via-[#111] to-[#0A0A0A] border-b border-[#2A2A2A]">
        <Container>
          <div className="py-12 md:py-20">
            <Badge variant="category">Investigation</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-4 mb-4 leading-tight">
              {inv.title}
            </h1>
            {inv.subtitle && (
              <p className="text-lg sm:text-xl text-amber-400/90 font-medium mb-4">
                {inv.subtitle}
              </p>
            )}
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed">
              {inv.summary}
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500">
              <span>{inv.chapters.length} chapters</span>
              <span>Published {new Date(inv.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Findings */}
      {inv.keyFindings.length > 0 && (
        <section className="py-8 border-b border-[#2A2A2A]">
          <Container>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Key Findings</h2>
            <ul className="space-y-3">
              {inv.keyFindings.map((kf, i) => (
                <li key={i} className="flex gap-3 text-gray-200">
                  <span className="text-amber-500 shrink-0 mt-1">◆</span>
                  <span>{kf}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Statistics */}
      {inv.statistics.length > 0 && (
        <section className="py-8 border-b border-[#2A2A2A]">
          <Container>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">By the Numbers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {inv.statistics.map((s, i) => (
                <div key={i} className="bg-[#151515] rounded-lg p-4 border border-[#2A2A2A]">
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Chapters */}
      <section className="py-8 border-b border-[#2A2A2A]">
        <Container>
          <h2 className="text-xl font-semibold text-amber-400 mb-6">Chapters</h2>
          <div className="space-y-3">
            {inv.chapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/story/${ch.storySlug}`}
                className="flex items-center gap-4 p-4 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-bold text-sm shrink-0">
                  {String(ch.order).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">
                    {ch.title}
                  </h3>
                  {ch.subtitle && (
                    <p className="text-sm text-gray-400 truncate">{ch.subtitle}</p>
                  )}
                </div>
                <div className="ml-auto text-gray-500 shrink-0">
                  {ch.evidenceScore && (
                    <Badge variant="evidence">{ch.evidenceScore}%</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      {inv.timeline.length > 0 && (
        <section className="py-8 border-b border-[#2A2A2A]">
          <Container>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Timeline</h2>
            <div className="space-y-0">
              {inv.timeline.map((e, i) => (
                <div key={i} className="flex gap-4 pb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    {i < inv.timeline.length - 1 && <div className="w-px flex-1 bg-[#2A2A2A]" />}
                  </div>
                  <div className="pb-4">
                    <div className="text-sm text-amber-400/80 font-mono">{e.date}</div>
                    <div className="text-white font-medium">{e.title}</div>
                    <div className="text-sm text-gray-400">{e.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      {inv.faq.length > 0 && (
        <section className="py-8 border-b border-[#2A2A2A]">
          <Container>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {inv.faq.map((f, i) => (
                <div key={i} className="bg-[#151515] rounded-lg p-4 border border-[#2A2A2A]">
                  <h3 className="text-white font-medium mb-2">{f.question}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.answer}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Sources */}
      {inv.sources.length > 0 && (
        <section className="py-8 border-b border-[#2A2A2A]">
          <Container>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Evidence Repository</h2>
            <SourcesList sources={inv.sources.map((s) => ({ name: s.title, url: s.url, type: '', tier: 2 }))} />
          </Container>
        </section>
      )}

      {/* Read the Overview Story */}
      <section className="py-8">
        <Container>
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-lg p-6 border border-amber-500/20">
            <h2 className="text-lg font-semibold text-white mb-2">Start with the Overview</h2>
            <p className="text-sm text-gray-400 mb-4">Get the full picture in one 22-minute read before diving into the chapters.</p>
            <Link
              href="/story/namami-gange-under-fire"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-medium rounded-md hover:bg-amber-400 transition-colors text-sm"
            >
              Read the Overview Story →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

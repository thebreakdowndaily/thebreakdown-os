import type { Metadata } from 'next';
import Script from 'next/script';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildEntityPage } from '@/features/entity/view-model';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import StoryCard from '@/components/ui/StoryCard';
import EntityCard from '@/components/ui/EntityCard';
import Divider from '@/components/ui/Divider';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import InteractiveTimelineBlock from '@/components/story/blocks/InteractiveTimelineBlock';
import FAQ from '@/components/story/FAQ';
import { EntityGraphSection } from '@/features/graph/components/EntityGraphSection';
import EntityData from '@/components/entity/EntityData';
import EntitySources from '@/components/entity/EntitySources';

const typeBadgeColor: Record<string, string> = {
  person: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  organization: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  policy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  scheme: 'bg-green-500/20 text-green-400 border-green-500/30',
  budget: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  report: 'bg-red-500/20 text-red-400 border-red-500/30',
  country: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  dataset: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  source: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function createJsonLd(entity: { name: string; description: string; slug: string; type: string }) {
  const schemaType =
    entity.type === 'organization' ? 'Organization' :
    entity.type === 'person' ? 'Person' : 'Thing';
  return [
    {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: entity.name,
      description: entity.description,
      url: `https://thebreakdown.in/entity/${entity.slug}`,
      publisher: { '@type': 'Organization', name: 'The Breakdown' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thebreakdown.in/' },
        { '@type': 'ListItem', position: 2, name: 'Entities', item: 'https://thebreakdown.in/entities' },
        { '@type': 'ListItem', position: 3, name: entity.name, item: `https://thebreakdown.in/entity/${entity.slug}` },
      ],
    },
  ];
}

export function generateStaticParams() {
  const services = bootstrapServices();
  return services.entities.getEntities({ pageSize: 100 }).data.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices();
  const vm = buildEntityPage(services, slug);
  if (!vm) return { title: 'Entity Not Found - The Breakdown' };
  const { entity } = vm;
  return {
    title: entity.name,
    description: entity.description,
    keywords: entity.aliases?.join(', ') || '',
    alternates: { canonical: `https://thebreakdown.in/entity/${entity.slug}` },
    openGraph: {
      title: entity.name,
      description: entity.description,
      type: 'article',
      url: `https://thebreakdown.in/entity/${entity.slug}`,
      images: entity.image ? [{ url: entity.image, width: 1200, height: 630, alt: entity.name }] : [],
    },
    twitter: { card: 'summary_large_image', title: entity.name, description: entity.description },
  };
}

export default async function EntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = bootstrapServices();
  const vm = buildEntityPage(services, slug);
  if (!vm) notFound();
  const { entity, stories, relatedEntities } = vm;

  const statsRecord: Record<string, number | string> = {};
  entity.statistics.forEach((s) => { statsRecord[s.label] = s.value; });

  const hasTimeline = entity.timeline.length > 0;
  const hasData = Object.keys(statsRecord).length > 0 || (entity as any).datasets?.length > 0;
  const hasSources = (entity as any).sources?.length > 0;
  const hasFaq = entity.faq.length > 0;

  return (
    <>
      {createJsonLd(entity).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Entities', href: '/entities' },
          { label: entity.name, href: `/entity/${entity.slug}` },
        ]}
      />

      <main className="flex-1 w-full" role="main">
        <section aria-label={`Dossier: ${entity.name}`} className="bg-[#0A0A0A] border-b border-[#2A2A2A]">
          <Container className="py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
              {entity.image && (
                <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#2A2A2A]">
                  <Image src={entity.image} alt={entity.name} width={128} height={128} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F5F5F5]">{entity.name}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${typeBadgeColor[entity.type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {entity.type}
                  </span>
                </div>
                {entity.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {entity.aliases.map((alias, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#151515] text-[#A1A1AA] border border-[#2A2A2A]">
                        {alias}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-base text-[#A1A1AA] leading-relaxed max-w-3xl">{entity.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <span className="text-[#D4A843] font-bold">{stories.length} stories</span>
                  {Object.entries(statsRecord).slice(0, 4).map(([key, value]) => (
                    <span key={key} className="text-[#A1A1AA]">
                      <span className="text-[#F5F5F5] font-semibold">{value}</span> {key}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Container>

          <div className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#2A2A2A]">
            <Container>
              <nav className="flex items-center gap-1 overflow-x-auto py-3" aria-label="Dossier sections">
                {[
                  { id: 'overview', label: 'Overview' },
                  ...(hasTimeline ? [{ id: 'timeline', label: 'Timeline' }] : []),
                  ...(hasData ? [{ id: 'data', label: 'Data' }] : []),
                  ...(hasSources ? [{ id: 'sources', label: 'Sources' }] : []),
                  { id: 'graph', label: 'Connections' },
                  ...(hasFaq ? [{ id: 'faq', label: 'FAQ' }] : []),
                  { id: 'stories', label: 'Stories' },
                ].map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#A1A1AA] hover:text-[#D4A843] hover:bg-[#151515] rounded-lg transition-colors"
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </Container>
          </div>
        </section>

        <Container className="py-8">
          {hasTimeline && (
            <section id="timeline" className="mb-12 scroll-mt-20">
              <SectionHeader eyebrow="History" title="Timeline" />
              <InteractiveTimelineBlock events={entity.timeline} />
            </section>
          )}

          {hasData && (
            <>
              <Divider className="mb-12" />
              <section id="data" className="mb-12 scroll-mt-20">
                <SectionHeader eyebrow="Statistics" title="Data & Metrics" />
                <EntityData
                  datasets={(entity as any).datasets || []}
                  statistics={statsRecord}
                />
              </section>
            </>
          )}

          {hasSources && (
            <>
              <Divider className="mb-12" />
              <section id="sources" className="mb-12 scroll-mt-20">
                <SectionHeader eyebrow="References" title="Sources" />
                <EntitySources sources={(entity as any).sources || []} />
              </section>
            </>
          )}

          <Divider className="mb-12" />
          <section id="graph" className="mb-12 scroll-mt-20">
            <SectionHeader
              eyebrow="Connections"
              title="Knowledge Graph"
              description="Related entities, stories, and topics"
            />
            <div className="bg-[#151515] rounded-2xl border border-[#2A2A2A] p-4 min-h-[300px]">
              <EntityGraphSection entitySlug={slug} />
            </div>
          </section>

          {hasFaq && (
            <>
              <Divider className="mb-12" />
              <section id="faq" className="mb-12 scroll-mt-20">
                <SectionHeader eyebrow="Explainer" title="Frequently Asked Questions" />
                <FAQ questions={entity.faq} />
              </section>
            </>
          )}

          {relatedEntities.length > 0 && (
            <>
              <Divider className="mb-12" />
              <section id="related" className="mb-12 scroll-mt-20">
                <SectionHeader eyebrow="Network" title="Related Entities" description={`${relatedEntities.length} entities connected to ${entity.name}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedEntities.map((e) => (
                    <EntityCard key={e.slug} entity={e} size="sm" />
                  ))}
                </div>
              </section>
            </>
          )}

          {stories.length > 0 && (
            <>
              <Divider className="mb-12" />
              <section id="stories" className="scroll-mt-20">
                <SectionHeader eyebrow="Coverage" title="Related Stories" description={`${stories.length} stories referencing ${entity.name}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stories.map((s) => (
                    <StoryCard key={s.slug} story={s} variant="compact" />
                  ))}
                </div>
              </section>
            </>
          )}
        </Container>
      </main>
    </>
  );
}

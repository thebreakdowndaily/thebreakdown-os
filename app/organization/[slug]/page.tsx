import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EntityJSON } from '@/utils/types';
import { buildEntity } from '@/utils/website-builder';
import { buildEntityViewModel } from '@/lib/view-models/entity';
import { connections, entityNodeId } from '@/lib/graph/graphData';
import EntityHero from '@/components/entity/EntityHero';
import QuickFacts from '@/components/entity/QuickFacts';
import EntityTimeline from '@/components/entity/EntityTimeline';
import EntityStatistics from '@/components/entity/EntityStatistics';
import RelatedStories from '@/components/entity/RelatedStories';
import RelatedEntitiesBlock from '@/components/entity/RelatedEntities';
import KnowledgeGraph from '@/components/entity/KnowledgeGraph';
import EntityFAQ from '@/components/entity/EntityFAQ';
import EntitySources from '@/components/entity/EntitySources';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const mockOrganizations: EntityJSON[] = [
  {
    id: 'ministry-of-rural-development',
    slug: 'ministry-of-rural-development',
    name: 'Ministry of Rural Development',
    type: 'organization',
    description: 'Nodal ministry of Government of India responsible for rural development policies, programmes, and schemes including MGNREGA, PMAY-G, and DAY-NRLM.',
    image: '/images/entities/mord.jpg',
    aliases: ['MoRD', 'Rural Development Ministry'],
    storyCount: 56,
    evidenceScore: 91,
    updatedAt: '2026-06-18T08:00:00Z',
    timeline: [
      { date: '1979-01-01', title: 'Department Created', description: 'Department of Rural Development created under Ministry of Agriculture.', source: 'Cabinet Secretariat' },
      { date: '1999-10-01', title: 'Full Ministry Status', description: 'Department upgraded to independent Ministry of Rural Development.', source: 'PIB' },
    ],
    datasets: [],
    statistics: { 'Schemes Managed': '15', 'Annual Budget': '₹1.56 lakh cr', 'Districts Covered': '740+', 'Staff': '12,000+' },
    sources: [
      { name: 'MoRD Official Website', url: 'https://rural.gov.in', type: 'government', description: 'Official ministry portal with scheme details.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment', summary: 'Two decades of rural employment guarantee scheme examined.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    relatedEntities: [
      { id: 'mgnrega', slug: 'mgnrega', name: 'MGNREGA', type: 'policy' },
      { id: 'pmgsy', slug: 'pmgsy', name: 'PM Gram Sadak Yojana', type: 'scheme' },
    ],
    faq: [
      { question: 'What schemes does the Ministry oversee?', answer: 'Key schemes include MGNREGA (employment), PMAY-G (housing), DAY-NRLM (livelihoods), PMGSY (roads), and NSAP (pensions).' },
      { question: 'What is the annual budget of MoRD?', answer: 'The Ministry\'s budget for 2025-26 is approximately ₹1.56 lakh crore, making it one of the largest social sector ministries.' },
    ],
  },
  {
    id: 'rbi',
    slug: 'rbi',
    name: 'Reserve Bank of India',
    type: 'organization',
    description: 'India\'s central banking institution controlling monetary policy, currency issuance, and financial system regulation.',
    image: '/images/entities/rbi.jpg',
    aliases: ['RBI', 'Central Bank of India'],
    storyCount: 89,
    evidenceScore: 96,
    updatedAt: '2026-06-18T14:00:00Z',
    timeline: [
      { date: '1935-04-01', title: 'RBI Established', description: 'Reserve Bank of India established under RBI Act 1934.', source: 'RBI History' },
      { date: '1949-01-01', title: 'Nationalisation', description: 'RBI nationalised post-independence.', source: 'RBI Archives' },
    ],
    datasets: [],
    statistics: { 'Policy Rate': '6.00%', 'GDP Forecast': '6.8%', 'Inflation Target': '4.0%', 'FX Reserves': '$675 B' },
    sources: [
      { name: 'RBI Official Website', url: 'https://rbi.org.in', type: 'government', description: 'Official portal with data and publications.' },
    ],
    relatedStories: [
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'How UPI transformed rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'ministry-of-finance', slug: 'ministry-of-finance', name: 'Ministry of Finance', type: 'organization' },
      { id: 'sebi', slug: 'sebi', name: 'SEBI', type: 'organization' },
    ],
    faq: [
      { question: 'What is the current repo rate?', answer: 'The repo rate as of June 2026 is 6.00%.' },
      { question: 'How does RBI control inflation?', answer: 'RBI uses the repo rate, CRR, SLR, and open market operations to manage money supply and inflation.' },
    ],
  },
];

const orgMap = new Map(mockOrganizations.map((o) => [o.slug, o]));

export function generateStaticParams() {
  return mockOrganizations.map((org) => ({ slug: org.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = orgMap.get(slug);
  if (!data) return { title: 'Organization Not Found' };
  const pageSpec = buildEntity(data);
  return {
    title: pageSpec.seo.title,
    description: pageSpec.seo.description,
    openGraph: {
      title: pageSpec.seo.title,
      description: pageSpec.seo.description,
      type: 'profile',
      url: `https://thebreakdown.in/organization/${data.slug}`,
    },
  };
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = orgMap.get(slug);
  if (!data) notFound();

  const vm = buildEntityViewModel(data);
  const graphNodes = connections(entityNodeId(data.slug, data.type), { maxDepth: 2 }).map((c) => c.node);

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Organizations', href: '/organizations' },
        { label: data.name, href: `/organization/${data.slug}` },
      ]} />

      <EntityHero
        name={vm.entity.name}
        type={vm.entity.type}
        description={vm.entity.description}
        image={vm.entity.image}
        aliases={vm.entity.aliases}
        storyCount={vm.entity.storyCount}
        evidenceScore={vm.entity.evidenceScore}
        updatedAt={vm.entity.updatedAt}
      />

      {vm.quickFacts.length > 1 && <QuickFacts facts={vm.quickFacts} />}

      <EntityTimeline events={vm.timeline} />

      <EntityStatistics statistics={vm.statistics} datasets={vm.datasets} />

      <RelatedStories stories={vm.stories} />

      {vm.entities.length > 0 && <RelatedEntitiesBlock entities={vm.entities} title="Related Entities" />}

      <KnowledgeGraph nodes={graphNodes} />

      <EntityFAQ questions={vm.faq} />

      <EntitySources sources={vm.sources} />
    </div>
  );
}

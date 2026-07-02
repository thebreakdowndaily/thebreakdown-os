import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { EntityJSON, Section } from '@/utils/types';
import { buildEntity } from '@/utils/website-builder';
import EntityLayout from '@/layouts/EntityLayout';
import EntityOverview from '@/components/entity/EntityOverview';
import EntityTimeline from '@/components/entity/EntityTimeline';
import EntityData from '@/components/entity/EntityData';
import EntitySources from '@/components/entity/EntitySources';
import RelatedStories from '@/components/story/RelatedStories';
import FAQ from '@/components/story/FAQ';

const sectionComponents: Record<string, React.ElementType | undefined> = {
  'entity-overview': EntityOverview,
  'entity-timeline': EntityTimeline,
  'entity-data': EntityData,
  'entity-sources': EntitySources,
  'related-stories': RelatedStories,
  faq: FAQ,
};

function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section) => {
        const Component = sectionComponents[section.id];
        if (!Component) return null;
        return <Component key={section.id} {...section.props} />;
      })}
    </>
  );
}

const mockEntities: EntityJSON[] = [
  {
    id: 'mgnrega',
    slug: 'mgnrega',
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act',
    type: 'policy',
    description: 'India\'s flagship rural employment guarantee scheme providing 100 days of guaranteed employment to rural households.',
    image: '/images/entities/mgnrega.jpg',
    aliases: ['MGNREGA', 'NREGA', 'Rural Employment Scheme'],
    storyCount: 24,
    updatedAt: '2026-06-15T10:00:00Z',
    timeline: [
      { date: '2005-08-23', title: 'Bill Introduced in Parliament', description: 'The National Rural Employment Guarantee Bill was introduced in the Lok Sabha.' },
      { date: '2006-02-02', title: 'Act Comes into Force', description: 'MGNREGA notified across 200 districts initially.' },
    ],
    datasets: [
      { label: 'Annual Budget Allocation', description: 'Central allocation for MGNREGA by financial year', data: [{ year: '2020-21', allocation: 111500 }, { year: '2021-22', allocation: 98000 }, { year: '2022-23', allocation: 89000 }, { year: '2023-24', allocation: 95000 }, { year: '2025-26', allocation: 86000 }], source: 'Union Budget' },
    ],
    statistics: { 'Total Person-Days': '385 crore', 'Active Workers': '14.2 crore', 'Average Wage': '₹267/day', 'Women Participation': '55.3%' },
    sources: [
      { name: 'Ministry of Rural Development', url: 'https://rural.gov.in', type: 'government', description: 'Official ministry website with scheme documentation.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment of the rural employment scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    faq: [
      { question: 'What is the objective of MGNREGA?', answer: 'To provide 100 days of guaranteed wage employment to rural households.' },
    ],
  },
  {
    id: 'ministry-of-rural-development',
    slug: 'ministry-of-rural-development',
    name: 'Ministry of Rural Development',
    type: 'organization',
    description: 'Nodal ministry of Government of India responsible for rural development policies and programmes.',
    image: '/images/entities/mord.jpg',
    storyCount: 56,
    updatedAt: '2026-06-10T08:00:00Z',
    timeline: [],
    datasets: [],
    statistics: { 'Schemes Managed': '15', 'Annual Budget': '₹1.5 lakh crore' },
    sources: [{ name: 'MoRD Official Website', url: 'https://rural.gov.in', type: 'government', description: 'Official ministry portal.' }],
    relatedStories: [],
    faq: [],
  },
  {
    id: 'rbi',
    slug: 'rbi',
    name: 'Reserve Bank of India',
    type: 'organization',
    description: 'India\'s central banking institution controlling monetary policy and currency issuance.',
    image: '/images/entities/rbi.jpg',
    storyCount: 89,
    updatedAt: '2026-06-08T14:00:00Z',
    timeline: [],
    datasets: [],
    statistics: { 'Policy Rate': '6.25%', 'GDP Forecast': '6.8%', 'Inflation Target': '4.0%' },
    sources: [{ name: 'RBI Official Website', url: 'https://rbi.org.in', type: 'government', description: 'Reserve Bank of India portal.' }],
    relatedStories: [],
    faq: [],
  },
];

const entityMap = new Map(mockEntities.map((e) => [e.slug, e]));

export function generateStaticParams() {
  return mockEntities.map((entity) => ({ slug: entity.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = entityMap.get(slug);
  if (!data) return { title: 'Entity Not Found' };
  const pageSpec = buildEntity(data);
  return {
    title: pageSpec.seo.title,
    description: pageSpec.seo.description,
    openGraph: {
      title: pageSpec.seo.title,
      description: pageSpec.seo.description,
      type: 'profile',
      url: `https://thebreakdown.in/entity/${data.slug}`,
    },
  };
}

export default async function EntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = entityMap.get(slug);
  if (!data) notFound();

  const pageSpec = buildEntity(data);

  return (
    <EntityLayout seo={pageSpec.seo} breadcrumbs={pageSpec.breadcrumbs} entityType={data.type}>
      <SectionRenderer sections={pageSpec.sections} />
    </EntityLayout>
  );
}

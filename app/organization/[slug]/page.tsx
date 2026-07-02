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

const sectionComponents: Record<string, React.ComponentType<any>> = {
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

const mockOrganizations: EntityJSON[] = [
  {
    id: 'ministry-of-rural-development',
    slug: 'ministry-of-rural-development',
    name: 'Ministry of Rural Development',
    type: 'organization',
    description: 'Nodal ministry of Government of India responsible for rural development policies, programmes, and schemes including MGNREGA, PMAY-G, and DAY-NRLM.',
    image: '/images/entities/mord.jpg',
    storyCount: 56,
    updatedAt: '2026-06-10T08:00:00Z',
    timeline: [
      { date: '1979-01-01', title: 'Ministry Established', description: 'Department of Rural Development created under Ministry of Agriculture.' },
      { date: '1999-10-01', title: 'Independent Ministry', description: 'Department of Rural Development upgraded to full Ministry status.' },
    ],
    datasets: [],
    statistics: { 'Schemes Managed': '15', 'Annual Budget 2025-26': '₹1.56 lakh crore', 'Districts Covered': '740+' },
    sources: [
      { name: 'MoRD Official Website', url: 'https://rural.gov.in', type: 'government', description: 'Official ministry portal with all scheme details.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    faq: [
      { question: 'What schemes does the Ministry oversee?', answer: 'Key schemes include MGNREGA, PMAY-G, DAY-NRLM, PMGSY, and NSAP.' },
    ],
  },
  {
    id: 'rbi',
    slug: 'rbi',
    name: 'Reserve Bank of India',
    type: 'organization',
    description: 'India\'s central banking institution that controls the monetary policy, regulates the banking system, and manages the country\'s currency and foreign exchange reserves.',
    image: '/images/entities/rbi.jpg',
    aliases: ['RBI', 'Central Bank of India'],
    storyCount: 89,
    updatedAt: '2026-06-08T14:00:00Z',
    timeline: [
      { date: '1935-04-01', title: 'Establishment', description: 'RBI established under the Reserve Bank of India Act, 1934.' },
      { date: '1949-01-01', title: 'Nationalization', description: 'RBI nationalized after India\'s independence.' },
    ],
    datasets: [],
    statistics: { 'Policy Repo Rate': '6.25%', 'GDP Growth Forecast': '6.8%', 'Inflation Target': '4.0%', 'Foreign Exchange Reserves': '$675 billion' },
    sources: [
      { name: 'RBI Official Website', url: 'https://rbi.org.in', type: 'government', description: 'Reserve Bank of India official portal.' },
    ],
    relatedStories: [],
    faq: [
      { question: 'What is the current repo rate?', answer: 'The repo rate as of June 2026 is 6.25%.' },
    ],
  },
];

const orgMap = new Map(mockOrganizations.map((o) => [o.slug, o]));

export function generateStaticParams() {
  return mockOrganizations.map((org) => ({ slug: org.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = orgMap.get(params.slug);
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

export default function OrganizationPage({ params }: { params: { slug: string } }) {
  const data = orgMap.get(params.slug);
  if (!data) notFound();

  const pageSpec = buildEntity(data);

  return (
    <EntityLayout seo={pageSpec.seo} breadcrumbs={pageSpec.breadcrumbs} entityType="organization">
      <SectionRenderer sections={pageSpec.sections} />
    </EntityLayout>
  );
}

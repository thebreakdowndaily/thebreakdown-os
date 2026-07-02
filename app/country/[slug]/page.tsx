import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CountryJSON, Section } from '@/utils/types';
import { buildCountry } from '@/utils/website-builder';
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

const mockCountries: CountryJSON[] = [
  {
    id: 'india',
    slug: 'india',
    name: 'India',
    type: 'country',
    description: 'India is the world\'s most populous country and the fifth-largest economy by nominal GDP. A federal parliamentary democratic republic with 28 states and 8 union territories.',
    image: '/images/entities/india.jpg',
    aliases: ['Republic of India', 'Bharat', 'Hindustan'],
    storyCount: 450,
    updatedAt: '2026-06-20T10:00:00Z',
    population: 1426000000,
    gdp: 4100000000000,
    capital: 'New Delhi',
    timeline: [
      { date: '1947-08-15', title: 'Independence', description: 'India gains independence from British rule.' },
      { date: '1950-01-26', title: 'Republic', description: 'Constitution of India comes into effect.' },
    ],
    datasets: [],
    statistics: { 'Population': '142.6 crore', 'GDP Growth': '6.8%', 'Literacy Rate': '74.04%', 'Life Expectancy': '70.8 years' },
    sources: [
      { name: 'Census of India', url: 'https://censusindia.gov.in', type: 'government', description: 'Official census data.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    faq: [
      { question: 'What is India\'s current population?', answer: 'India\'s population as of 2026 is approximately 142.6 crore.' },
    ],
  },
  {
    id: 'bihar',
    slug: 'bihar',
    name: 'Bihar',
    type: 'country',
    description: 'Bihar is a state in eastern India. It is the third-most populous state and the 12th-largest by area.',
    image: '/images/entities/bihar.jpg',
    aliases: ['Bihar State'],
    storyCount: 85,
    updatedAt: '2026-06-18T09:00:00Z',
    population: 130000000,
    capital: 'Patna',
    timeline: [],
    datasets: [],
    statistics: { 'Population': '13 crore', 'Literacy Rate': '63.8%', 'GDP Contribution': '4.1%' },
    sources: [{ name: 'Bihar Government Portal', url: 'https://bihar.gov.in', type: 'government', description: 'Official state portal.' }],
    relatedStories: [],
    faq: [],
  },
];

const countryMap = new Map(mockCountries.map((c) => [c.slug, c]));

export function generateStaticParams() {
  return mockCountries.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = countryMap.get(slug);
  if (!data) return { title: 'Country Not Found' };
  const pageSpec = buildCountry(data);
  return {
    title: pageSpec.seo.title,
    description: pageSpec.seo.description,
    openGraph: {
      title: pageSpec.seo.title,
      description: pageSpec.seo.description,
      type: 'profile',
      url: `https://thebreakdown.in/country/${data.slug}`,
    },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = countryMap.get(slug);
  if (!data) notFound();

  const pageSpec = buildCountry(data);

  return (
    <EntityLayout seo={pageSpec.seo} breadcrumbs={pageSpec.breadcrumbs} entityType="country">
      <SectionRenderer sections={pageSpec.sections} />
    </EntityLayout>
  );
}

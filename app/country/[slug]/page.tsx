import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CountryJSON } from '@/utils/types';
import { buildCountry } from '@/utils/website-builder';
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
    evidenceScore: 93,
    updatedAt: '2026-06-20T10:00:00Z',
    population: 1426000000,
    gdp: 4100000000000,
    capital: 'New Delhi',
    timeline: [
      { date: '1947-08-15', title: 'Independence', description: 'India gains independence from British rule.', source: 'History' },
      { date: '1950-01-26', title: 'Republic', description: 'Constitution of India comes into effect.', source: 'Constitution' },
      { date: '1991-07-01', title: 'Economic Liberalisation', description: 'Landmark economic reforms open Indian economy.', source: 'Economic Survey' },
      { date: '2014-05-01', title: 'Digital India Initiative', description: 'National push for digital infrastructure and governance.', source: 'PIB' },
    ],
    datasets: [
      { label: 'GDP Growth Rate', description: 'Annual GDP growth rate (%)', data: [{ year: '2020-21', growth: -5.8 }, { year: '2021-22', growth: 9.1 }, { year: '2022-23', growth: 7.2 }, { year: '2023-24', growth: 8.2 }, { year: '2024-25', growth: 7.0 }, { year: '2025-26', growth: 6.8 }], source: 'Ministry of Statistics' },
    ],
    statistics: { 'Population': '142.6 cr', 'GDP Growth': '6.8%', 'Literacy Rate': '74.04%', 'Life Expectancy': '70.8 yrs' },
    sources: [
      { name: 'Census of India', url: 'https://censusindia.gov.in', type: 'government', description: 'Official census data.' },
      { name: 'Ministry of Statistics', url: 'https://mospi.gov.in', type: 'government', description: 'Statistical data and publications.' },
    ],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment', summary: 'Two decades of India\'s flagship rural employment scheme.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'UPI\'s impact on financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'rbi', slug: 'rbi', name: 'Reserve Bank of India', type: 'organization' },
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' },
    ],
    faq: [
      { question: 'What is India\'s current population?', answer: 'India\'s population as of 2026 is approximately 142.6 crore (1.426 billion).' },
      { question: 'What is India\'s GDP growth rate?', answer: 'India\'s GDP grew at 6.8% in 2025-26, maintaining its position as the fastest-growing major economy.' },
    ],
  },
  {
    id: 'bihar',
    slug: 'bihar',
    name: 'Bihar',
    type: 'country',
    description: 'Bihar is a state in eastern India. It is the third-most populous state and the 12th-largest by area, with a rich historical and cultural heritage.',
    image: '/images/entities/bihar.jpg',
    aliases: ['Bihar State'],
    storyCount: 85,
    evidenceScore: 87,
    updatedAt: '2026-06-18T09:00:00Z',
    population: 130000000,
    capital: 'Patna',
    timeline: [
      { date: '1912-01-01', title: 'Bihar Province Created', description: 'Bihar and Orissa Province created under British rule.', source: 'History' },
      { date: '2000-11-15', title: 'Jharkhand Separated', description: 'Jharkhand carved out of Bihar as a separate state.', source: 'PIB' },
    ],
    datasets: [],
    statistics: { 'Population': '13 cr', 'Literacy Rate': '63.8%', 'GDP Contribution': '4.1%', 'Districts': '38' },
    sources: [{ name: 'Bihar Government Portal', url: 'https://bihar.gov.in', type: 'government', description: 'Official state portal.' }],
    relatedStories: [
      { slug: 'mgnrega-reform', headline: 'MGNREGA Completes 20 Years', summary: 'Data-driven assessment of rural employment.', publishedAt: '2026-06-15T10:00:00Z', readingTime: 12, evidenceScore: 92, category: 'economy' },
    ],
    relatedEntities: [],
    faq: [
      { question: 'What is the capital of Bihar?', answer: 'Patna is the capital city of Bihar.' },
    ],
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

  const vm = buildEntityViewModel(data);
  const graphNodes = connections(entityNodeId(data.slug, data.type), { maxDepth: 2 }).map((c) => c.node);

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Countries', href: '/countries' },
        { label: data.name, href: `/country/${data.slug}` },
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

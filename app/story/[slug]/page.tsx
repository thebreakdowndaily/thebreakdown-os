import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { StoryJSON, Section } from '@/utils/types';
import { buildStory } from '@/utils/website-builder';
import StoryLayout from '@/layouts/StoryLayout';
import Hero from '@/components/story/Hero';
import ExecutiveSummary from '@/components/story/ExecutiveSummary';
import QuickFacts from '@/components/story/QuickFacts';
import Timeline from '@/components/story/Timeline';
import Evidence from '@/components/story/Evidence';
import DataCards from '@/components/story/DataCards';
import Charts from '@/components/story/Charts';
import Maps from '@/components/story/Maps';
import Debate from '@/components/story/Debate';
import FAQ from '@/components/story/FAQ';
import PrimarySources from '@/components/story/PrimarySources';
import RelatedStories from '@/components/story/RelatedStories';
import RelatedEntities from '@/components/story/RelatedEntities';
import AuthorBox from '@/components/story/AuthorBox';
import Newsletter from '@/components/story/Newsletter';
import Visuals from '@/components/story/Visuals';

const sectionComponents: Record<string, React.ElementType | undefined> = {
  hero: Hero,
  'executive-summary': ExecutiveSummary,
  'quick-facts': QuickFacts,
  timeline: Timeline,
  evidence: Evidence,
  'data-cards': DataCards,
  charts: Charts,
  maps: Maps,
  visuals: Visuals,
  debate: Debate,
  faq: FAQ,
  'primary-sources': PrimarySources,
  'related-stories': RelatedStories,
  'related-entities': RelatedEntities,
  'author-box': AuthorBox,
  newsletter: Newsletter,
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

/**
 * Fetch story data from the API, with fallback to static mock data.
 * In production, this would fetch from a database or CMS API.
 */
async function getStory(slug: string): Promise<StoryJSON | null> {
  try {
    // Try API first (for stories created via CMS)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/story?slug=${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });
    if (res.ok) {
      const data = (await res.json()) as StoryJSON;
      return data;
    }
  } catch {
    // API not available, fall through to mocks
  }

  return null;
}

// ── Static mock data (fallback for build-time / offline) ──────────────────

const mockStories: StoryJSON[] = [
  {
    id: 'mgnrega-reform',
    slug: 'mgnrega-reform',
    headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment',
    summary: 'Two decades of India\'s flagship rural employment guarantee scheme — what the data reveals about wage trends, participation, and economic impact across states.',
    heroImage: '/images/stories/mgnrega-20.jpg',
    publishedAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    verificationScore: 92,
    author: {
      name: 'Anjali Sharma',
      avatar: '/images/authors/anjali-sharma.jpg',
      bio: 'Senior Investigative Journalist covering rural development and policy.',
    },
    evidenceScore: 92,
    category: 'economy',
    tags: ['MGNREGA', 'rural employment', 'policy analysis', 'social schemes'],
    keyPoints: [
      'MGNREGA completed 20 years of operation in 2026',
      'Annual budget allocation has grown 5x since inception',
      'Women participation has increased from 40% to 55%',
      'Average wage growth has lagged behind inflation in most states',
    ],
    timeline: [
      { date: '2006-02-02', title: 'MGNREGA Enacted', description: 'Parliament passes the National Rural Employment Guarantee Act.', source: 'PRS Legislative' },
      { date: '2008-04-01', title: 'Phase 1 Completion', description: 'Scheme covers 200 most backward districts.', source: 'MoRD' },
      { date: '2013-09-01', title: 'Enhanced Wage Structure', description: 'Wage rates revised with CPI-AL linkage.', source: 'Gazette Notification' },
      { date: '2020-04-01', title: 'COVID-19 Surge', description: 'Demand for work surges 40% during pandemic; budget allocation increased.', source: 'MoRD Annual Report' },
      { date: '2026-02-02', title: '20th Anniversary', description: 'Scheme completes two decades of operation with cumulative expenditure over ₹8 lakh crore.', source: 'The Breakdown Analysis' },
    ],
    facts: [
      { label: 'Total Person-Days Generated', value: '3,850 crore', source: 'MoRD Dashboard' },
      { label: 'Average Wage (2025-26)', value: '₹267/day', source: 'MoRD' },
      { label: 'Active Workers', value: '14.2 crore', source: 'NREGA MIS' },
      { label: 'Women Participation', value: '55.3%', source: 'Annual Report 2025-26' },
    ],
    claims: [
      { claim: 'MGNREGA wage rates are higher than market wages in most states.', source: 'Government of India', verification: 'misleading', explanation: 'In 12 of 28 states, MGNREGA wages are lower than prevailing market wages for unskilled labour.', confidence: 0.88 },
      { claim: 'The scheme has lifted 2 crore families above poverty line.', source: 'World Bank Study 2024', verification: 'true', explanation: 'Multiple academic studies corroborate the poverty reduction impact of MGNREGA.', confidence: 0.82 },
    ],
    sources: [
      { name: 'Ministry of Rural Development Annual Report 2025-26', url: 'https://rural.gov.in/annual-report', type: 'government', tier: 1, accessedAt: '2026-05-20' },
      { name: 'NREGA MIS Dashboard', url: 'https://nrega.nic.in', type: 'government', tier: 1, accessedAt: '2026-06-01' },
    ],
    datasets: [
      { label: 'Year-wise Budget Allocation', description: 'Central budget allocation to MGNREGA from 2006 to 2026', data: [{ year: '2006-07', allocation: 11300 }, { year: '2011-12', allocation: 40000 }, { year: '2016-17', allocation: 47500 }, { year: '2020-21', allocation: 111500 }, { year: '2025-26', allocation: 86000 }], source: 'Union Budget Documents' },
    ],
    charts: [
      { type: 'line', title: 'MGNREGA Budget Allocation Over Time', data: [{ year: '2006-07', amount: 11300 }, { year: '2011-12', amount: 40000 }, { year: '2016-17', amount: 47500 }, { year: '2020-21', amount: 111500 }, { year: '2025-26', amount: 86000 }], xKey: 'year', yKey: 'amount' },
    ],
    faq: [
      { question: 'Who is eligible for MGNREGA work?', answer: 'Any adult rural household member willing to do unskilled manual work at the notified wage rate is eligible.' },
      { question: 'What is the guaranteed number of days of employment?', answer: 'The Act guarantees 100 days of employment per household per financial year.' },
    ],
    primarySources: [
      { name: 'MGNREGA Act 2005 - Full Text', url: 'https://rural.gov.in/sites/default/files/MGNREGA_Act_2005.pdf', type: 'Legislation', description: 'The original Act as passed by Parliament.' },
    ],
    relatedStories: [
      { slug: 'digital-payments-boom', headline: 'Digital Payments in Rural India', summary: 'UPI\'s role in rural financial inclusion.', publishedAt: '2026-06-12T08:00:00Z', readingTime: 8, evidenceScore: 88, category: 'technology' },
    ],
    relatedEntities: [
      { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization', description: 'Nodal ministry for MGNREGA implementation.' },
    ],
    debate: {
      sides: [
        { position: 'MGNREGA needs restructuring to focus on asset creation', arguments: [{ claim: 'Only 35% of works are durable assets', source: 'CAG Report 2024' }] },
        { position: 'MGNREGA should be expanded to urban areas', arguments: [{ claim: 'Urban unemployment is equally critical', source: 'ILO Report 2025' }] },
      ],
    },
  },
  {
    id: 'digital-payments-boom',
    slug: 'digital-payments-boom',
    headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution',
    summary: 'How UPI transformed rural financial inclusion, with transaction volumes growing 400% in three years.',
    heroImage: '/images/stories/digital-payments.jpg',
    publishedAt: '2026-06-12T08:00:00Z',
    updatedAt: '2026-06-12T08:00:00Z',
    readingTime: 8,
    wordCount: 2800,
    verificationScore: 88,
    author: { name: 'Vikram Patel', bio: 'Technology and policy correspondent.' },
    evidenceScore: 88,
    category: 'technology',
    tags: ['UPI', 'digital payments', 'rural India', 'fintech'],
    keyPoints: ['UPI transactions in rural areas grew 400% since 2023', 'Feature phone-based UPI drove adoption'],
    timeline: [],
    facts: [
      { label: 'Rural UPI Transactions (2025-26)', value: '₹12 lakh crore', source: 'NPCI' },
      { label: 'Feature Phone UPI Users', value: '18 crore', source: 'NPCI Annual Report' },
    ],
    claims: [],
    sources: [{ name: 'NPCI Annual Report 2025-26', url: 'https://npci.org.in', type: 'government', tier: 1, accessedAt: '2026-05-15' }],
    datasets: [],
    charts: [],
    faq: [],
    primarySources: [],
    relatedStories: [],
    relatedEntities: [],
  },
  {
    id: 'pm-fasal-bima-claims',
    slug: 'pm-fasal-bima-claims',
    headline: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers',
    summary: 'Investigation into delayed and unpaid crop insurance claims across six states.',
    heroImage: '/images/stories/fasal-bima.jpg',
    publishedAt: '2026-06-05T06:00:00Z',
    updatedAt: '2026-06-05T06:00:00Z',
    readingTime: 15,
    wordCount: 5200,
    verificationScore: 97,
    author: { name: 'Anjali Sharma', bio: 'Senior Investigative Journalist' },
    evidenceScore: 97,
    category: 'policy',
    tags: ['crop insurance', 'agriculture', 'PMFBY', 'farmer welfare'],
    keyPoints: ['Over 40% of claims delayed beyond 60 days in 4 states', 'Farmers in Maharashtra and Karnataka worst affected'],
    timeline: [],
    facts: [],
    claims: [],
    sources: [],
    datasets: [],
    charts: [],
    faq: [],
    primarySources: [],
    relatedStories: [],
    relatedEntities: [],
  },
];

// Build lookup map once
const storyMap = new Map<string, StoryJSON>();
mockStories.forEach((s) => storyMap.set(s.slug, s));

export function generateStaticParams() {
  return mockStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Try API first, fallback to mocks
  const apiData = await getStory(slug).catch(() => null);
  const data = apiData || storyMap.get(slug);

  if (!data) {
    return {
      title: 'Story Not Found — The Breakdown',
      description: 'The requested story could not be found.',
    };
  }

  const pageSpec = buildStory(data);
  return {
    title: pageSpec.seo.title,
    description: pageSpec.seo.description,
    openGraph: {
      title: pageSpec.seo.title,
      description: pageSpec.seo.description,
      type: 'article',
      publishedTime: data.publishedAt,
      modifiedTime: data.updatedAt,
      url: `https://thebreakdown.in/story/${data.slug}`,
      images: data.heroImage ? [{ url: data.heroImage }] : [],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Try API first (for CMS-created stories), fallback to mocks
  const apiData = await getStory(slug).catch(() => null);
  const data = apiData || storyMap.get(slug);

  if (!data) notFound();

  const pageSpec = buildStory(data);

  return (
    <StoryLayout seo={pageSpec.seo} breadcrumbs={pageSpec.breadcrumbs}>
      <SectionRenderer sections={pageSpec.sections} />
    </StoryLayout>
  );
}

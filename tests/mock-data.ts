/**
 * THE BREAKDOWN — Shared Mock Data for Tests
 */

import type {
  StoryJSON,
  EntityJSON,
  TopicJSON,
  HomepageJSON,
  SearchResult,
  SEOData,
  Breadcrumb,
} from '../utils/types';

export const mockStory: StoryJSON = {
  id: 'story-001',
  slug: 'india-gdp-q2-2025',
  headline: 'India GDP Growth Slows to 5.4% in Q2 2025',
  summary: 'India economic growth slowed to 5.4% in Q2 2025, below expectations.',
  heroImage: '/images/stories/gdp-q2-2025.jpg',
  publishedAt: '2025-07-15T10:00:00Z',
  updatedAt: '2025-07-16T08:30:00Z',
  readingTime: 8,
  wordCount: 2400,
  author: {
    name: 'The Breakdown Editorial',
    avatar: '/images/authors/thebreakdown-editorial.jpg',
    bio: 'The Breakdown editorial desk.',
    url: 'https://thebreakdown.in/about/team',
  },
  evidenceScore: 88,
  category: 'economy',
  tags: ['GDP', 'economy', 'India', 'growth', 'Q2 2025'],
  keyPoints: [
    'GDP growth slowed to 5.4% in Q2 2025 from 6.2% in Q1',
    'Manufacturing sector contracted by 1.2%',
    'Services sector grew at 6.8%, below expectations',
  ],
  timeline: [
    {
      date: '2025-04-01',
      title: 'Q1 2025 GDP data released at 6.2%',
      description: 'First quarter showed moderate growth momentum.',
    },
    {
      date: '2025-07-15',
      title: 'Q2 2025 GDP data released at 5.4%',
      description: 'Growth slowed significantly, missing estimates.',
    },
  ],
  facts: [
    { label: 'GDP Growth', value: '5.4%', source: 'MOSPI' },
    { label: 'Inflation', value: '4.8%', source: 'RBI' },
  ],
  claims: [
    {
      claim: 'The slowdown is due to global economic headwinds',
      source: 'Finance Ministry',
      verification: 'true',
      explanation: 'Consistent with IMF global growth data.',
      confidence: 0.85,
    },
  ],
  verificationScore: 85,
  sources: [
    {
      name: 'Ministry of Statistics',
      url: 'https://mospi.gov.in',
      type: 'government',
      tier: 1,
      accessedAt: '2025-07-15',
    },
  ],
  datasets: [
    {
      label: 'Quarterly GDP Growth',
      description: 'GDP growth rates by quarter',
      data: [
        { quarter: 'Q1 2024', rate: 7.8 },
        { quarter: 'Q2 2024', rate: 6.7 },
        { quarter: 'Q1 2025', rate: 6.2 },
        { quarter: 'Q2 2025', rate: 5.4 },
      ],
    },
  ],
  charts: [
    {
      type: 'bar',
      title: 'GDP Growth Trend',
      data: [
        { quarter: 'Q1 2024', rate: 7.8 },
        { quarter: 'Q2 2024', rate: 6.7 },
      ],
      xKey: 'quarter',
      yKey: 'rate',
    },
  ],
  geoData: {
    type: 'india-map',
    regions: [
      { id: 'MH', name: 'Maharashtra', value: 6.2 },
      { id: 'KA', name: 'Karnataka', value: 5.8 },
    ],
  },
  debate: {
    sides: [
      {
        position: 'Temporary cyclical slowdown',
        arguments: [
          { claim: 'Monsoon impact will reverse in Q3', source: 'Economic Survey' },
        ],
      },
    ],
  },
  faq: [
    {
      question: 'What caused the GDP slowdown?',
      answer: 'Multiple factors including global demand weakness and monsoon impact.',
    },
  ],
  primarySources: [
    {
      name: 'MOSPI Press Release',
      url: 'https://mospi.gov.in/gdp-q2-2025',
      type: 'government release',
      description: 'Official GDP estimates for Q2 2025-26.',
    },
  ],
  relatedStories: [
    {
      slug: 'rbi-policy-july-2025',
      headline: 'RBI Holds Repo Rate at 6.5% Amid Growth Concerns',
      summary: 'Reserve Bank keeps rates unchanged citing inflation risks.',
      publishedAt: '2025-07-20T10:00:00Z',
      readingTime: 6,
      evidenceScore: 92,
      category: 'economy',
    },
  ],
  relatedEntities: [
    {
      id: 'entity-rbi',
      slug: 'reserve-bank-of-india',
      name: 'Reserve Bank of India',
      type: 'organization',
      description: 'Central banking institution of India.',
      relationship: 'policy-maker',
    },
  ],
};

export const mockPersonEntity: EntityJSON = {
  id: 'entity-pm-modi',
  slug: 'narendra-modi',
  name: 'Narendra Modi',
  type: 'person',
  description: 'Prime Minister of India since 2014.',
  image: '/images/entities/narendra-modi.jpg',
  aliases: ['Modi', 'PM Modi'],
  storyCount: 342,
  updatedAt: '2025-07-20T10:00:00Z',
  timeline: [
    {
      date: '2014-05-26',
      title: 'Sworn in as Prime Minister',
      description: 'Became the 15th Prime Minister of India.',
    },
    {
      date: '2019-05-30',
      title: 'Re-elected as Prime Minister',
      description: 'Secured second term with landslide majority.',
    },
  ],
  datasets: [
    {
      label: 'Approval Ratings',
      description: 'Monthly approval rating trends',
      data: [
        { month: 'Jan 2025', rating: 72 },
        { month: 'Jun 2025', rating: 68 },
      ],
    },
  ],
  statistics: {
    terms: 3,
    yearsInOffice: 11,
    approval: '68%',
  },
  sources: [
    {
      name: 'Prime Minister Office',
      url: 'https://pmindia.gov.in',
      type: 'government',
      description: 'Official PMO website.',
    },
  ],
  relatedStories: [
    {
      slug: 'modi-us-visit-2025',
      headline: 'PM Modi Visits US for Bilateral Trade Talks',
      summary: 'Prime Minister arrives in Washington for trade negotiations.',
      publishedAt: '2025-06-10T09:00:00Z',
      readingTime: 7,
      evidenceScore: 85,
      category: 'diplomacy',
    },
  ],
  faq: [
    {
      question: 'When did Narendra Modi become PM?',
      answer: 'He was sworn in as Prime Minister on May 26, 2014.',
    },
  ],
};

export const mockOrganizationEntity: EntityJSON = {
  id: 'entity-rbi',
  slug: 'reserve-bank-of-india',
  name: 'Reserve Bank of India',
  type: 'organization',
  description: 'Central banking institution of India established in 1935.',
  image: '/images/entities/rbi.jpg',
  aliases: ['RBI', 'Central Bank of India'],
  storyCount: 187,
  updatedAt: '2025-07-18T14:00:00Z',
  timeline: [
    {
      date: '1935-04-01',
      title: 'RBI Established',
      description: 'Reserve Bank of India was established under RBI Act 1934.',
    },
    {
      date: '1949-01-01',
      title: 'Nationalization of RBI',
      description: 'RBI was nationalized and became fully owned by Government of India.',
    },
  ],
  datasets: [
    {
      label: 'Repo Rate Changes',
      description: 'Historical repo rate changes',
      data: [
        { date: '2024-04', rate: 6.5 },
        { date: '2025-07', rate: 6.5 },
      ],
    },
  ],
  statistics: {
    established: 1935,
    governor: 'Shaktikanta Das',
    headquarters: 'Mumbai',
  },
  sources: [
    {
      name: 'RBI Official Website',
      url: 'https://rbi.org.in',
      type: 'government',
      description: 'Reserve Bank of India official site.',
    },
  ],
  relatedStories: [
    {
      slug: 'rbi-policy-july-2025',
      headline: 'RBI Holds Repo Rate at 6.5% Amid Growth Concerns',
      summary: 'Reserve Bank keeps rates unchanged.',
      publishedAt: '2025-07-20T10:00:00Z',
      readingTime: 6,
      evidenceScore: 92,
      category: 'economy',
    },
  ],
  faq: [
    {
      question: 'What is the current repo rate?',
      answer: 'The current repo rate is 6.5% as of July 2025.',
    },
  ],
};

export const mockTopic: TopicJSON = {
  id: 'topic-economy',
  slug: 'indian-economy',
  name: 'Indian Economy',
  description: 'Coverage of India economic indicators, policies, and analysis.',
  image: '/images/topics/economy.jpg',
  storyCount: 89,
  entityCount: 24,
  updatedAt: '2025-07-20T10:00:00Z',
  stories: [mockStory.relatedStories[0]],
  people: [
    {
      id: 'entity-pm-modi',
      slug: 'narendra-modi',
      name: 'Narendra Modi',
      type: 'person',
      description: 'Prime Minister of India.',
      relationship: 'policy-maker',
    },
  ],
  organizations: [
    {
      id: 'entity-rbi',
      slug: 'reserve-bank-of-india',
      name: 'Reserve Bank of India',
      type: 'organization',
      description: 'Central banking institution.',
      relationship: 'regulator',
    },
  ],
  policies: [],
  budgets: [],
  reports: [],
  charts: [
    {
      type: 'line',
      title: 'GDP Growth Trend',
      data: [
        { year: '2021', rate: 9.1 },
        { year: '2022', rate: 7.2 },
        { year: '2023', rate: 7.8 },
        { year: '2024', rate: 6.7 },
      ],
      xKey: 'year',
      yKey: 'rate',
    },
  ],
};

export const mockHomepage: HomepageJSON = {
  topStory: {
    slug: 'india-gdp-q2-2025',
    headline: 'India GDP Growth Slows to 5.4% in Q2 2025',
    summary: 'India economic growth slowed to 5.4% in Q2 2025, below expectations.',
    heroImage: '/images/stories/gdp-q2-2025.jpg',
    publishedAt: '2025-07-15T10:00:00Z',
    readingTime: 8,
    evidenceScore: 88,
    category: 'economy',
  },
  trendingAnalyses: [
    {
      slug: 'modi-us-visit-2025',
      headline: 'PM Modi Visits US for Bilateral Trade Talks',
      summary: 'Trade negotiations focus on tariff reductions.',
      publishedAt: '2025-06-10T09:00:00Z',
      readingTime: 7,
      evidenceScore: 85,
      category: 'diplomacy',
    },
  ],
  latestInvestigations: [
    {
      slug: 'coal-allocations-scam',
      headline: 'Coal Block Allocations Under Scrutiny',
      summary: 'Investigation reveals irregularities in coal block allocations.',
      heroImage: '/images/stories/coal-scam.jpg',
      publishedAt: '2025-07-18T06:00:00Z',
      readingTime: 12,
      evidenceScore: 94,
      category: 'investigation',
    },
  ],
  dataStories: [
    {
      slug: 'india-water-crisis',
      headline: 'India Water Crisis: 600 Million Face Severe Shortage',
      summary: 'Data analysis reveals worsening water scarcity across India.',
      publishedAt: '2025-07-10T08:00:00Z',
      readingTime: 10,
      evidenceScore: 91,
      category: 'environment',
    },
  ],
  theFix: [
    {
      slug: 'uttarakhand-forest-cover',
      headline: 'Uttarakhand Increased Forest Cover by 12%',
      summary: 'Community-led initiatives drive reforestation success.',
      publishedAt: '2025-07-05T07:00:00Z',
      readingTime: 5,
      evidenceScore: 87,
      category: 'solutions',
    },
  ],
  policyTracker: [
    {
      name: 'Digital Personal Data Protection Act',
      status: 'implemented',
      description: 'India data protection framework now in effect.',
    },
    {
      name: 'New Education Policy 2020',
      status: 'in-progress',
      description: 'Rollout ongoing across states.',
    },
  ],
  globalWatch: [
    {
      slug: 'china-south-china-sea',
      headline: 'China Expands Military Presence in South China Sea',
      summary: 'Satellite imagery reveals new installations.',
      publishedAt: '2025-07-19T05:00:00Z',
      readingTime: 6,
      evidenceScore: 90,
      category: 'geopolitics',
    },
  ],
  latestUpdates: [
    {
      slug: 'rbi-policy-july-2025',
      headline: 'RBI Holds Repo Rate at 6.5%',
      summary: 'Monetary policy committee keeps rate unchanged.',
      publishedAt: '2025-07-20T10:00:00Z',
      readingTime: 6,
      evidenceScore: 92,
      category: 'economy',
    },
  ],
};

export const mockSearchResults: SearchResult[] = [
  {
    id: 'story-001',
    type: 'story',
    title: 'India GDP Growth Slows to 5.4% in Q2 2025',
    description: 'India economic growth slowed to 5.4% in Q2 2025.',
    url: '/story/india-gdp-q2-2025',
    score: 0.95,
    date: '2025-07-15',
    category: 'economy',
  },
  {
    id: 'entity-rbi',
    type: 'entity',
    title: 'Reserve Bank of India',
    description: 'Central banking institution of India.',
    url: '/entity/reserve-bank-of-india',
    score: 0.72,
  },
  {
    id: 'topic-economy',
    type: 'topic',
    title: 'Indian Economy',
    description: 'Coverage of India economic indicators.',
    url: '/topic/indian-economy',
    score: 0.68,
  },
];

export const mockSEO: SEOData = {
  title: 'India GDP Growth Slows to 5.4% in Q2 2025 — The Breakdown',
  description: 'India economic growth slowed to 5.4% in Q2 2025, below expectations.',
  canonical: 'https://thebreakdown.in/story/india-gdp-q2-2025',
  ogType: 'article',
  ogImage: '/images/stories/gdp-q2-2025.jpg',
  ogPublishDate: '2025-07-15T10:00:00Z',
  twitterCard: 'summary_large_image',
  keywords: 'GDP, economy, India, growth, Q2 2025',
};

export const mockBreadcrumbs: Breadcrumb[] = [
  { label: 'Home', href: '/' },
  { label: 'Stories', href: '/stories' },
  { label: 'India GDP Growth Slows to 5.4% in Q2 2025', href: '/story/india-gdp-q2-2025' },
];

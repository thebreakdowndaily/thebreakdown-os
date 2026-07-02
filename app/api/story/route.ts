import { NextRequest, NextResponse } from 'next/server';

const mockStoryData: Record<string, any> = {
  'mgnrega-reform': {
    id: 'mgnrega-reform',
    slug: 'mgnrega-reform',
    headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment',
    summary: 'Two decades of India\'s flagship rural employment guarantee scheme — what the data reveals.',
    heroImage: '/images/stories/mgnrega-20.jpg',
    publishedAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
    readingTime: 12,
    wordCount: 4200,
    author: { name: 'Anjali Sharma', bio: 'Senior Investigative Journalist' },
    evidenceScore: 92,
    category: 'economy',
    tags: ['MGNREGA', 'rural employment', 'policy analysis'],
    keyPoints: ['MGNREGA completed 20 years in 2026', 'Budget allocation grew 5x since inception'],
    timeline: [],
    facts: [{ label: 'Total Person-Days', value: '3,850 crore' }],
    claims: [],
    sources: [],
    datasets: [],
    charts: [],
    faq: [],
    primarySources: [],
    relatedStories: [],
    relatedEntities: [],
  },
  'digital-payments-boom': {
    id: 'digital-payments-boom',
    slug: 'digital-payments-boom',
    headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution',
    summary: 'How UPI transformed rural financial inclusion.',
    publishedAt: '2026-06-12T08:00:00Z',
    updatedAt: '2026-06-12T08:00:00Z',
    readingTime: 8,
    author: { name: 'Vikram Patel', bio: 'Technology correspondent' },
    evidenceScore: 88,
    category: 'technology',
    tags: ['UPI', 'digital payments'],
    keyPoints: [],
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
  'pm-fasal-bima-claims': {
    id: 'pm-fasal-bima-claims',
    slug: 'pm-fasal-bima-claims',
    headline: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers',
    summary: 'Investigation into delayed and unpaid crop insurance claims across six states.',
    publishedAt: '2026-06-05T06:00:00Z',
    updatedAt: '2026-06-05T06:00:00Z',
    readingTime: 15,
    author: { name: 'Anjali Sharma', bio: 'Senior Investigative Journalist' },
    evidenceScore: 97,
    category: 'policy',
    tags: ['crop insurance', 'agriculture', 'PMFBY'],
    keyPoints: [],
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
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing required query parameter: slug' },
      { status: 400 }
    );
  }

  const story = mockStoryData[slug];

  if (!story) {
    return NextResponse.json(
      { error: `Story not found: ${slug}` },
      { status: 404 }
    );
  }

  return NextResponse.json(story);
}

import { NextRequest, NextResponse } from 'next/server';

const mockEntityData: Record<string, unknown> = {
  mgnrega: {
    id: 'mgnrega',
    slug: 'mgnrega',
    name: 'Mahatma Gandhi National Rural Employment Guarantee Act',
    type: 'policy',
    description: 'India\'s flagship rural employment guarantee scheme providing 100 days of guaranteed employment to rural households.',
    aliases: ['MGNREGA', 'NREGA', 'Rural Employment Scheme'],
    storyCount: 24,
    updatedAt: '2026-06-15T10:00:00Z',
    timeline: [],
    datasets: [],
    statistics: { 'Total Person-Days': '385 crore', 'Active Workers': '14.2 crore', 'Average Wage': '₹267/day' },
    sources: [],
    relatedStories: [],
    faq: [],
  },
  'ministry-of-rural-development': {
    id: 'ministry-of-rural-development',
    slug: 'ministry-of-rural-development',
    name: 'Ministry of Rural Development',
    type: 'organization',
    description: 'Nodal ministry responsible for rural development policies and programmes.',
    storyCount: 56,
    updatedAt: '2026-06-10T08:00:00Z',
    timeline: [],
    datasets: [],
    statistics: { 'Schemes Managed': '15', 'Annual Budget': '₹1.5 lakh crore' },
    sources: [],
    relatedStories: [],
    faq: [],
  },
  rbi: {
    id: 'rbi',
    slug: 'rbi',
    name: 'Reserve Bank of India',
    type: 'organization',
    description: 'India\'s central banking institution controlling monetary policy and currency issuance.',
    storyCount: 89,
    updatedAt: '2026-06-08T14:00:00Z',
    timeline: [],
    datasets: [],
    statistics: { 'Policy Rate': '6.25%', 'GDP Forecast': '6.8%', 'Inflation Target': '4.0%' },
    sources: [],
    relatedStories: [],
    faq: [],
  },
};

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing required query parameter: slug' },
      { status: 400 }
    );
  }

  const entity = mockEntityData[slug] as Record<string, unknown> | undefined;

  if (!entity) {
    return NextResponse.json(
      { error: `Entity not found: ${slug}` },
      { status: 404 }
    );
  }

  return NextResponse.json(entity);
}

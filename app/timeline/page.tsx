import type { Metadata } from 'next';
import type { PageSpec } from '@/utils/types';
import SearchLayout from '@/layouts/SearchLayout';
import Timeline from '@/components/story/Timeline';

export const metadata: Metadata = {
  title: 'Timeline — The Breakdown',
  description: 'Explore all major events across stories, policies, and entities on The Breakdown.',
  openGraph: {
    title: 'Timeline — The Breakdown',
    description: 'Explore all major events across stories, policies, and entities.',
    url: 'https://thebreakdown.in/timeline',
  },
};

const mockTimelineEvents = [
  { date: '2026-06-15', title: 'MGNREGA Completes 20 Years', description: 'India\'s flagship rural employment scheme marks two decades of operation.', source: 'The Breakdown' },
  { date: '2026-06-12', title: 'Digital Payments in Rural India Surge', description: 'UPI transactions in rural areas cross ₹12 lakh crore annually.', source: 'NPCI' },
  { date: '2026-06-05', title: 'PM Fasal Bima Claims Investigation', description: 'Report reveals widespread delays in crop insurance claim settlements.', source: 'The Breakdown' },
  { date: '2026-06-01', title: 'Union Budget 2026 Presented', description: 'Finance Minister presents Union Budget with focus on infrastructure and healthcare.', source: 'Government of India' },
  { date: '2026-05-28', title: 'Groundwater Depletion Warning', description: 'New data shows 15 states facing critical groundwater depletion.', source: 'CGWB' },
];

export default function TimelinePage() {
  const pageSpec: PageSpec = {
    type: 'timeline',
    slug: 'timeline',
    template: 'search',
    layout: 'search-layout',
    sections: [],
    seo: {
      title: 'Timeline — The Breakdown',
      description: 'Explore all major events across stories, policies, and entities.',
      canonical: 'https://thebreakdown.in/timeline',
      ogType: 'website' as const,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Timeline', href: '/timeline' },
    ],
    schema: {},
    metadata: {},
  };

  return (
    <SearchLayout seo={pageSpec.seo} query="">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Timeline</h1>
        <p className="text-gray-400 mb-8">All major events across stories, policies, and entities.</p>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <label htmlFor="year-filter" className="block text-sm font-medium text-gray-400 mb-1">Year</label>
            <select
              id="year-filter"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <select
              id="category-filter"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <option value="">All Categories</option>
              <option value="policy">Policy</option>
              <option value="economy">Economy</option>
              <option value="technology">Technology</option>
              <option value="environment">Environment</option>
            </select>
          </div>
        </div>

        <Timeline events={mockTimelineEvents} />
      </div>
    </SearchLayout>
  );
}

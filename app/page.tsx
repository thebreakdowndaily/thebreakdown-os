import type { Metadata } from 'next';
import type { HomepageJSON } from '@/utils/types';
import { buildHomepage } from '@/utils/website-builder';
import HomepageLayout from '@/layouts/HomepageLayout';
import HomeHero from '@/components/homepage/HomeHero';
import FeaturedStories from '@/components/homepage/FeaturedStories';

const mockHomepageData: HomepageJSON = {
  topStory: {
    slug: 'mgnrega-reform',
    headline: 'MGNREGA Completes 20 Years: A Data-Driven Assessment of Rural Employment',
    summary: 'Two decades of India\'s flagship rural employment guarantee scheme — what the data reveals about wage trends, participation, and economic impact across states.',
    heroImage: '/images/stories/mgnrega-20.jpg',
    publishedAt: '2026-06-15T10:00:00Z',
    readingTime: 12,
    evidenceScore: 92,
    category: 'economy',
  },
  trendingAnalyses: [
    {
      slug: 'digital-payments-boom',
      headline: 'Digital Payments in Rural India: UPI\'s Unseen Revolution',
      summary: 'How UPI transformed rural financial inclusion, with transaction volumes growing 400% in three years.',
      heroImage: '/images/stories/digital-payments.jpg',
      publishedAt: '2026-06-12T08:00:00Z',
      readingTime: 8,
      evidenceScore: 88,
      category: 'technology',
    },
    {
      slug: 'school-education-budget',
      headline: 'School Education Budget: Where Does the Money Actually Go?',
      summary: 'Tracing the flow of education funds from Delhi to district-level implementation.',
      heroImage: '/images/stories/education-budget.jpg',
      publishedAt: '2026-06-10T14:00:00Z',
      readingTime: 10,
      evidenceScore: 95,
      category: 'education',
    },
    {
      slug: 'climate-finance-india',
      headline: 'India\'s Climate Finance Gap: Needs vs. Allocation',
      summary: 'Analysis of India\'s climate budget allocations against the estimated financing needs for 2030 targets.',
      heroImage: '/images/stories/climate-finance.jpg',
      publishedAt: '2026-06-08T11:00:00Z',
      readingTime: 9,
      evidenceScore: 85,
      category: 'environment',
    },
  ],
  latestInvestigations: [
    {
      slug: 'pm-fasal-bima-claims',
      headline: 'PM Fasal Bima Yojana: The Claims That Never Reached Farmers',
      summary: 'Investigation into delayed and unpaid crop insurance claims across six states.',
      heroImage: '/images/stories/fasal-bima.jpg',
      publishedAt: '2026-06-05T06:00:00Z',
      readingTime: 15,
      evidenceScore: 97,
      category: 'policy',
    },
    {
      slug: 'anganwadi-worker-pay',
      headline: 'Anganwadi Workers: The Unpaid Backbone of ICDS',
      summary: 'Examining the gap between promised honorarium and actual payments to 1.3 million anganwadi workers.',
      heroImage: '/images/stories/anganwadi.jpg',
      publishedAt: '2026-06-03T09:00:00Z',
      readingTime: 11,
      evidenceScore: 93,
      category: 'policy',
    },
  ],
  dataStories: [
    {
      slug: 'groundwater-depletion',
      headline: 'India\'s Groundwater Crisis in 5 Charts',
      summary: 'Visualizing the rapid depletion of groundwater reserves across 15 states.',
      publishedAt: '2026-05-28T10:00:00Z',
      readingTime: 6,
      evidenceScore: 90,
      category: 'environment',
    },
  ],
  theFix: [
    {
      slug: 'fix-ration-digitization',
      headline: 'How Rajasthan Cut PDS Leakage by 40% with Digitization',
      summary: 'Lessons from Rajasthan\'s successful digitization of the public distribution system.',
      publishedAt: '2026-05-25T08:00:00Z',
      readingTime: 7,
      evidenceScore: 84,
      category: 'policy',
    },
  ],
  policyTracker: [
    {
      name: 'National Education Policy 2020',
      status: 'Implementation Phase 2',
      description: 'Second phase implementation across 28 states with focus on vocational training.',
    },
    {
      name: 'Production Linked Incentive (PLI)',
      status: 'Active — 14 Sectors',
      description: 'PLI schemes expanded to 14 sectors with ₹1.97 lakh crore outlay.',
    },
    {
      name: 'Digital Personal Data Protection Act',
      status: 'Rules Drafting Stage',
      description: 'DPDP Act rules under consultation; implementation expected by Q4 2026.',
    },
  ],
  globalWatch: [
    {
      slug: 'global-supply-chain-shift',
      headline: 'The China+1 Effect: How Global Supply Chains Are Reshaping Indian Manufacturing',
      summary: 'Analysis of FDI trends and manufacturing output as companies diversify away from China.',
      publishedAt: '2026-05-20T10:00:00Z',
      readingTime: 10,
      evidenceScore: 87,
      category: 'economy',
    },
  ],
  latestUpdates: [
    {
      slug: 'union-budget-2026-highlights',
      headline: 'Union Budget 2026: Key Allocations and Policy Announcements',
      summary: 'Highlights of the Union Budget 2026-27 with focus on infrastructure, healthcare, and digital India.',
      publishedAt: '2026-06-01T12:00:00Z',
      readingTime: 5,
      evidenceScore: 91,
      category: 'economy',
    },
  ],
};

const pageSpec = buildHomepage(mockHomepageData);

export const metadata: Metadata = {
  title: 'The Breakdown — India Explained',
  description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
  openGraph: {
    title: 'The Breakdown — India Explained',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    url: 'https://thebreakdown.in',
    siteName: 'The Breakdown',
    images: [{ url: '/images/og-home.jpg' }],
  },
};

export default function HomePage() {
  const { topStory, trendingAnalyses, theFix, policyTracker, latestUpdates } = mockHomepageData;

  return (
    <HomepageLayout seo={pageSpec.seo}>
      <HomeHero story={topStory} />
      <FeaturedStories primary={topStory} secondary={trendingAnalyses} />
    </HomepageLayout>
  );
}

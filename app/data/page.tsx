import type { Metadata } from 'next';
import Charts from '@/components/story/Charts';
import DataCards from '@/components/story/DataCards';

export const metadata: Metadata = {
  title: 'Data Hub — The Breakdown',
  description: 'Explore datasets, statistics, and data visualizations on Indian policy, economy, and society.',
  openGraph: {
    title: 'Data Hub — The Breakdown',
    description: 'Explore datasets, statistics, and data visualizations.',
    url: 'https://thebreakdown.in/data',
  },
};

const featuredDatasets = [
  { label: 'MGNREGA Budget Allocation', description: 'Year-wise central budget allocation to MGNREGA from 2006 to 2026', data: [{ year: '2015-16', allocation: 37300 }, { year: '2020-21', allocation: 111500 }, { year: '2025-26', allocation: 86000 }], source: 'Union Budget' },
  { label: 'GDP Growth Rate', description: 'India\'s annual GDP growth rate from 2015 to 2026', data: [{ year: '2015-16', growth: 8.0 }, { year: '2020-21', growth: -5.8 }, { year: '2025-26', growth: 6.8 }], source: 'MOSPI' },
  { label: 'UPI Transaction Volume', description: 'Annual UPI transaction value in India', data: [{ year: '2018-19', value: 11100 }, { year: '2021-22', value: 84000 }, { year: '2025-26', value: 272000 }], source: 'NPCI' },
];

const featuredCharts = [
  { type: 'line' as const, title: 'GDP Growth Rate Trend', data: [{ year: '2015-16', growth: 8.0 }, { year: '2016-17', growth: 7.2 }, { year: '2017-18', growth: 6.7 }, { year: '2018-19', growth: 6.1 }, { year: '2019-20', growth: 4.0 }, { year: '2020-21', growth: -5.8 }, { year: '2021-22', growth: 9.1 }, { year: '2022-23', growth: 7.2 }, { year: '2023-24', growth: 7.0 }, { year: '2025-26', growth: 6.8 }], xKey: 'year', yKey: 'growth' },
  { type: 'bar' as const, title: 'Union Budget Allocation by Sector (2025-26)', data: [{ sector: 'Defence', amount: 621000 }, { sector: 'Health', amount: 89000 }, { sector: 'Education', amount: 113000 }, { sector: 'Agriculture', amount: 142000 }, { sector: 'Infrastructure', amount: 250000 }], xKey: 'sector', yKey: 'amount' },
];

const downloadLinks = [
  { name: 'MGNREGA Dataset (CSV)', url: '/data/downloads/mgnrega.csv', size: '2.4 MB' },
  { name: 'GDP Growth Data (CSV)', url: '/data/downloads/gdp-growth.csv', size: '1.1 MB' },
  { name: 'UPI Transactions (CSV)', url: '/data/downloads/upi-transactions.csv', size: '856 KB' },
];

export default function DataPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">Data Hub</h1>
        <p className="text-gray-400 text-lg mb-8">
          Explore datasets, statistics, and data visualizations on Indian policy, economy, and society.
        </p>

        <section className="mb-12" aria-label="Featured datasets">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Featured Datasets</h2>
          <DataCards datasets={featuredDatasets} />
        </section>

        <section className="mb-12" aria-label="Charts and visualizations">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Charts & Visualizations</h2>
          <Charts charts={featuredCharts} />
        </section>

        <section aria-label="Download data">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Download Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloadLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-amber-400/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-100 group-hover:text-amber-400 transition-colors">
                    {link.name}
                  </p>
                  <p className="text-xs text-gray-500">{link.size}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

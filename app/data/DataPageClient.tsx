'use client';

import { useState, useEffect } from 'react';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import Charts from '@/components/story/Charts';
import DataCards from '@/components/story/DataCards';
import { captureEvent } from '@/lib/analytics/capture';

const featuredDatasets = [
  { label: 'MGNREGA Budget Allocation', description: 'Year-wise central budget allocation to MGNREGA from 2006 to 2026', data: [{ year: '2015-16', allocation: 37300 }, { year: '2020-21', allocation: 111500 }, { year: '2025-26', allocation: 86000 }], source: 'Union Budget' },
  { label: 'GDP Growth Rate', description: 'India\'s annual GDP growth rate from 2015 to 2026', data: [{ year: '2015-16', growth: 8.0 }, { year: '2020-21', growth: -5.8 }, { year: '2025-26', growth: 6.8 }], source: 'MOSPI' },
  { label: 'UPI Transaction Volume', description: 'Annual UPI transaction value in India', data: [{ year: '2018-19', value: 11100 }, { year: '2021-22', value: 84000 }, { year: '2025-26', value: 272000 }], source: 'NPCI' },
  { label: 'Sino-Indian Defense Forecast 2026', description: 'Strategic capability forecasting, border deployment models, and logistics infrastructure metrics.', data: [], source: 'The Breakdown Intelligence', id: 'sino-indian-border', isPremium: true },
  { label: 'PLI Semiconductor Subsidy Ledger', description: 'Entity-by-entity fiscal disbursements, fab construction markers, and component yield statistics.', data: [], source: 'The Breakdown Intelligence', id: 'pli-semiconductor', isPremium: true },
];

const featuredCharts = [
  { type: 'line' as const, title: 'GDP Growth Rate Trend', data: [{ year: '2015-16', growth: 8.0 }, { year: '2016-17', growth: 7.2 }, { year: '2017-18', growth: 6.7 }, { year: '2018-19', growth: 6.1 }, { year: '2019-20', growth: 4.0 }, { year: '2020-21', growth: -5.8 }, { year: '2021-22', growth: 9.1 }, { year: '2022-23', growth: 7.2 }, { year: '2023-24', growth: 7.0 }, { year: '2025-26', growth: 6.8 }], xKey: 'year', yKey: 'growth' },
  { type: 'bar' as const, title: 'Union Budget Allocation by Sector (2025-26)', data: [{ sector: 'Defence', amount: 621000 }, { sector: 'Health', amount: 89000 }, { sector: 'Education', amount: 113000 }, { sector: 'Agriculture', amount: 142000 }, { sector: 'Infrastructure', amount: 250000 }], xKey: 'sector', yKey: 'amount' },
];

const downloadLinks = [
  { name: 'MGNREGA Dataset (CSV)', url: '/api/data/download?datasetId=mgnrega', datasetId: 'mgnrega', size: '2.4 MB' },
  { name: 'GDP Growth Data (CSV)', url: '/api/data/download?datasetId=gdp-growth', datasetId: 'gdp-growth', size: '1.1 MB' },
  { name: 'UPI Transactions (CSV)', url: '/api/data/download?datasetId=upi-transactions', datasetId: 'upi-transactions', size: '856 KB' },
  { name: 'Sino-Indian Border Infrastructure (CSV)', url: '/api/data/download?datasetId=sino-indian-border', datasetId: 'sino-indian-border', size: '4.2 MB', isPremium: true },
  { name: 'PLI Semiconductor Subsidy Ledger (CSV)', url: '/api/data/download?datasetId=pli-semiconductor', datasetId: 'pli-semiconductor', size: '3.8 MB', isPremium: true },
];

export default function DataPageClient() {
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    featuredDatasets.filter(d => d.isPremium).forEach(dataset => {
      captureEvent('premium_data_viewed', { dataset_id: dataset.id });
    });
  }, []);

  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof downloadLinks[0]) => {
    const isSupporter = localStorage.getItem('tb_supporter') === 'true';

    if (link.isPremium && !isSupporter) {
      e.preventDefault();
      setShowPaywall(true);
      captureEvent('dataset_download_started', { dataset_id: link.datasetId, status: 'blocked' });
      return;
    }

    captureEvent('dataset_download_started', { dataset_id: link.datasetId, status: 'success' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SpatialNarrativeBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Data Explorer', href: '/data', current: true },
          ]}
          theme="dark"
        />
      </div>

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
          <div className="w-full overflow-x-auto rounded-xl">
            <Charts charts={featuredCharts} />
          </div>
        </section>

        <section aria-label="Download data">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Download Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {downloadLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                onClick={(e) => handleDownloadClick(e, link)}
                className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-amber-400/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-100 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    {link.isPremium && (
                      <span className="inline-flex items-center justify-center bg-amber-500 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-sm" title="Premium Data">
                        PREMIUM
                      </span>
                    )}
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

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-2">Premium Supporter Required</h3>
            <p className="text-gray-400 text-sm mb-6">
              This dataset is exclusively available to Premium Supporters of The Breakdown.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowPaywall(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPaywall(false);
                  // Trigger paywall/subscription flow
                }}
                className="px-4 py-2 text-sm font-medium bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
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

import DataPageClient from './DataPageClient';

export default function DataPage() {
  return <DataPageClient />;
}

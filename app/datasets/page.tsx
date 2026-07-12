'use client';

import { useState, useEffect, useMemo } from 'react';
import { bootstrapServices } from '@/lib/bootstrap';
import Container from '@/components/ui/Container';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { DatasetMultiView } from '@/components/dataset/DatasetMultiView';
import type { Dataset } from '@/types/canonical';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  useEffect(() => {
    const services = bootstrapServices();
    services.datasets.getDatasets({ pageSize: 50 }).then(r => setDatasets(r.data));
  }, []);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Datasets', href: '/datasets' },
        ]}
      />

      <main className="flex-1 w-full" role="main">
        <Container className="py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-2">Datasets</h1>
          <p className="text-lg text-[#A1A1AA] mb-8">
            Explore curated datasets powering The Breakdown&apos;s intelligence reports.
          </p>

          <DatasetMultiView datasets={datasets} />
        </Container>
      </main>
    </>
  );
}

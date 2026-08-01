import type { Metadata } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildOperationsProjection } from '@/lib/operations/platform-observability';
import PlatformOperationsDashboard from '@/components/operations/PlatformOperationsDashboard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Platform Operations — The Breakdown Knowledge Platform',
  description: 'Read-only observability dashboard for platform health, publication quality, search performance, accessibility compliance, and operational reliability.',
};

export default async function OperationsPage() {
  const services = bootstrapServices();
  const projection = await buildOperationsProjection(services);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
      <main id="main-content" style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--spacing-6) var(--spacing-4)' }}>
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Platform Operations', href: '/operations' },
        ]} />

        <div style={{ marginTop: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
            Platform Operations
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
            Read-only observability dashboard. No editorial workflow. No mutations.
          </p>
        </div>

        <PlatformOperationsDashboard projection={projection} />
      </main>
    </div>
  );
}

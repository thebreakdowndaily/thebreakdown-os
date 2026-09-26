import type { Metadata } from 'next';
import Link from 'next/link';
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

        <nav aria-label="Operational Surfaces" style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)', flexWrap: 'wrap' }}>
          <Link
            href="/operations"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              textDecoration: 'none',
              border: '1px solid var(--color-border-default)',
            }}
          >
            Platform Operations
          </Link>
          <Link
            href="/intel"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            Mission Control
          </Link>
          <Link
            href="/newsroom"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            Newsroom Command Center
          </Link>
          <Link
            href="/newsroom/scorecard"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            Intelligence Scorecard
          </Link>
        </nav>

        <PlatformOperationsDashboard projection={projection} />
      </main>
    </div>
  );
}

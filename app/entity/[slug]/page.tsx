import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildEntityTerminalViewModel } from '@/features/entity/view-model';
import { EditorialLayout } from '@/packages/editorial/src';

// Terminal Orchestrator
import EntityTerminal from '@/components/entity/EntityTerminal';
import { ContentPageTracker } from '@/components/analytics/ContentPageTracker';

function createJsonLd(entity: { name: string; description: string; slug: string; type: string }) {
  const schemaType =
    entity.type === 'organization' ? 'Organization' :
    entity.type === 'person' ? 'Person' : 'Thing';
  return [
    {
      '@context': 'https://schema.org',
      '@type': schemaType,
      name: entity.name,
      description: entity.description,
      url: `https://thebreakdown.in/entity/${entity.slug}`,
      publisher: { '@type': 'Organization', name: 'The Breakdown' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thebreakdown.in/' },
        { '@type': 'ListItem', position: 2, name: 'Entities', item: 'https://thebreakdown.in/entities' },
        { '@type': 'ListItem', position: 3, name: entity.name, item: `https://thebreakdown.in/entity/${entity.slug}` },
      ],
    },
  ];
}

export async function generateStaticParams() {
  const services = bootstrapServices({ publicOnly: true });
  const all = (await services.entities.getEntities({ pageSize: 100 })).data;
  const eligiblePaths = [];
  for (const e of all) {
    const vm = await buildEntityTerminalViewModel(services, e.slug);
    if (vm) {
      eligiblePaths.push({ slug: e.slug });
    }
  }
  return eligiblePaths;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildEntityTerminalViewModel(services, slug);
  if (!vm) return { title: 'Entity Not Found - The Breakdown' };
  
  return {
    title: `${vm.name} - Knowledge Terminal`,
    description: vm.description,
    keywords: vm.aliases?.join(', ') || '',
    alternates: { canonical: `https://thebreakdown.in/entity/${vm.slug}` },
    openGraph: {
      title: vm.name,
      description: vm.description,
      type: 'article',
      url: `https://thebreakdown.in/entity/${vm.slug}`,
      images: vm.hero?.optimization?.cdnUrl ? [{ url: vm.hero.optimization.cdnUrl, width: 1200, height: 630, alt: vm.name }] : [],
    },
    twitter: { card: 'summary_large_image', title: vm.name, description: vm.description },
  };
}

export default async function EntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const services = bootstrapServices({ publicOnly: true });
  const viewModel = await buildEntityTerminalViewModel(services, slug);
  
  if (!viewModel) notFound();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Intelligence Terminal', href: '/entities' },
    { label: viewModel.name, href: `/entity/${viewModel.slug}` },
  ];

  return (
    <>
      {createJsonLd(viewModel).map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <EditorialLayout breadcrumbItems={breadcrumbs}>
        <ContentPageTracker contentType="entity" id={viewModel.slug} />
        <EntityTerminal viewModel={viewModel} />
      </EditorialLayout>
    </>
  );
}

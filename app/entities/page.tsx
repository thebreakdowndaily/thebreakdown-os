import type { Metadata } from 'next';
import Link from 'next/link';
import { getEntities } from '@/utils/data-layer/store';
import Container from '@/components/layout/Container';
import Badge from '@/components/ui/Badge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Entities — The Breakdown',
  description: 'Key entities tracked by The Breakdown — policies, organizations, schemes, and more.',
  openGraph: { title: 'Entities — The Breakdown', url: 'https://thebreakdown.in/entities' },
};

export default function EntitiesPage() {
  const { data: entities } = getEntities({ pageSize: 50 });
  return (
    <>
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Intelligence Terminal', href: '/entities' },
      ]} />
    <Container>
      <div className="py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Entities</h1>
        <p className="text-gray-400 text-lg mb-8">Policies, organizations, schemes, and key institutions tracked by The Breakdown.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity) => (
            <Link key={entity.slug} href={`/entity/${entity.slug}`} className="group block p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="category">{entity.type}</Badge>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">{entity.name}</h2>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{entity.description}</p>
              <div className="text-xs text-gray-500">{entity.storyCount} related stories</div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
    </>
  );
}

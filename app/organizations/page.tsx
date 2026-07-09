import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizations } from '@/utils/data-layer/store';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Organizations — The Breakdown',
  description: 'Key organizations tracked by The Breakdown — ministries, regulators, and institutions.',
  openGraph: { title: 'Organizations — The Breakdown', url: 'https://thebreakdown.in/organizations' },
};

export default function OrganizationsPage() {
  const { data: orgs } = getOrganizations({ pageSize: 50 });
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Organizations</h1>
        <p className="text-gray-400 text-lg mb-8">Ministries, regulators, and key institutions tracked by The Breakdown.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link key={org.slug} href={`/entity/${org.slug}`} className="group block p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors">
              <h2 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">{org.name}</h2>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{org.description}</p>
              <div className="text-xs text-gray-500">{org.storyCount} related stories</div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

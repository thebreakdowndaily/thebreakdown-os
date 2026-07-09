import type { Metadata } from 'next';
import Link from 'next/link';
import { getCountries } from '@/utils/data-layer/store';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Countries — The Breakdown',
  description: 'Country profiles with data-driven coverage of policy, economy, and governance.',
  openGraph: { title: 'Countries — The Breakdown', url: 'https://thebreakdown.in/countries' },
};

export default function CountriesPage() {
  const { data: countries } = getCountries({ pageSize: 50 });
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Countries</h1>
        <p className="text-gray-400 text-lg mb-8">Country profiles with data-driven coverage.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <Link key={country.slug} href={`/entity/${country.slug}`} className="group block p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors">
              <h2 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors mb-2">{country.name}</h2>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{country.description}</p>
              <div className="text-xs text-gray-500">{country.storyCount} related stories</div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

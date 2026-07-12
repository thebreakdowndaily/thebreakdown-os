import type { Metadata } from 'next';
import Link from 'next/link';
import { bootstrapServices } from '@/lib/bootstrap';
import Container from '@/components/layout/Container';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Investigations — The Breakdown',
  description: 'In-depth data-driven investigations into Indian policy, governance, and society.',
  openGraph: { title: 'Investigations — The Breakdown', url: 'https://thebreakdown.in/investigations' },
};

export default async function InvestigationsPage() {
  const services = bootstrapServices();
  const { data: investigations } = await services.investigations.getInvestigations();

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Investigations</h1>
        <p className="text-gray-400 text-lg mb-8">In-depth data-driven investigations into Indian policy, governance, and society.</p>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {investigations.map((inv) => (
            <Link key={inv.slug} href={`/investigation/${inv.slug}`} className="group block p-6 bg-[#151515] rounded-lg border border-[#2A2A2A] hover:border-amber-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="category">Investigation</Badge>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors mb-2 leading-snug">{inv.title}</h2>
              {inv.subtitle && (
                <p className="text-sm text-amber-400/70 mb-1">{inv.subtitle}</p>
              )}
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{inv.summary}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{inv.chapters.length} chapters</span>
                <span>{new Date(inv.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

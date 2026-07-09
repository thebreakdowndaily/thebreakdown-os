import { redirect } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';

export function generateStaticParams() {
  const services = bootstrapServices();
  const countries = services.entities.getEntitiesByType('country');
  return countries.map((c) => ({ slug: c.slug }));
}

export default async function CountryRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/entity/${slug}`);
}

import { redirect } from 'next/navigation';
import { bootstrapServices } from '@/lib/bootstrap';

export function generateStaticParams() {
  const services = bootstrapServices();
  const orgs = services.entities.getEntitiesByType('organization');
  return orgs.map((org) => ({ slug: org.slug }));
}

export default async function OrganizationRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/entity/${slug}`);
}

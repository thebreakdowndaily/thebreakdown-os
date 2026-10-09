import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = bootstrapServices();
  const org = await services.entities.getEntityBySlug(slug);

  if (!org || org.type !== 'organization') {
    return NextResponse.json({ error: `Organization not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(org);
}

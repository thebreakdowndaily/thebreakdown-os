import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = bootstrapServices();
  const country = await services.entities.getEntityBySlug(slug);

  if (!country || country.type !== 'country') {
    return NextResponse.json({ error: `Country not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(country);
}

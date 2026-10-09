import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = bootstrapServices();
  const entity = (await services.entities.getEntityBySlug(slug)) || (await services.entities.getEntity(slug));

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(entity);
}

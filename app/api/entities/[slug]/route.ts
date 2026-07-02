import { NextRequest, NextResponse } from 'next/server';
import { getEntity } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const entity = getEntity(slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(entity);
}

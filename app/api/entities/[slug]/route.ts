import { NextRequest, NextResponse } from 'next/server';
import { getEntity } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const entity = getEntity(params.slug);

  if (!entity) {
    return NextResponse.json({ error: `Entity not found: ${params.slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(entity);
}

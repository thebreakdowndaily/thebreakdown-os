import { NextRequest, NextResponse } from 'next/server';
import { getFix } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const fix = getFix(params.slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${params.slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(fix);
}

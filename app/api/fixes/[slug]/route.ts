import { NextRequest, NextResponse } from 'next/server';
import { getFix } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const fix = getFix(slug);

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(fix);
}

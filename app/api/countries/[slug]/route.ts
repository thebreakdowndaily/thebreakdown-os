import { NextRequest, NextResponse } from 'next/server';
import { getCountry } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const country = getCountry(slug);

  if (!country) {
    return NextResponse.json({ error: `Country not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(country);
}

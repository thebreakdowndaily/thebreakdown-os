import { NextRequest, NextResponse } from 'next/server';
import { getCountry } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const country = getCountry(params.slug);

  if (!country) {
    return NextResponse.json({ error: `Country not found: ${params.slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(country);
}

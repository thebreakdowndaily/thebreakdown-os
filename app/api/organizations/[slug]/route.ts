import { NextRequest, NextResponse } from 'next/server';
import { getOrganization } from '@/utils/data-layer/store';

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const org = getOrganization(params.slug);

  if (!org) {
    return NextResponse.json({ error: `Organization not found: ${params.slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(org);
}

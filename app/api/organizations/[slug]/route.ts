import { NextRequest, NextResponse } from 'next/server';
import { getOrganization } from '@/utils/data-layer/store';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const org = getOrganization(slug);

  if (!org) {
    return NextResponse.json({ error: `Organization not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(org);
}

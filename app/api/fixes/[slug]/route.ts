import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const services = bootstrapServices();
  const fix = (await services.fixes.getFixBySlug(slug)) || (await services.fixes.getFix(slug));

  if (!fix) {
    return NextResponse.json({ error: `Fix not found: ${slug}`, status: 404 }, { status: 404 });
  }

  return NextResponse.json(fix);
}

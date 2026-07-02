import { NextRequest, NextResponse } from 'next/server';
import { aggregateStoryAnalytics, generateImprovementReport } from '@/utils/analytics';

// ── GET /api/analytics/story/[slug] — Per-story analytics with improvement report ──

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    // Fetch raw events from the main analytics store
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/analytics?story=${slug}&aggregate=true`);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Analytics data not available' }, { status: 404 });
    }

    const data = await res.json();

    if (!data.analytics) {
      return NextResponse.json({
        slug,
        analytics: null,
        improvementReport: null,
        message: 'Not enough data yet — need at least 10 reader sessions',
      });
    }

    // Generate improvement report
    const improvementReport = generateImprovementReport(data.analytics);

    return NextResponse.json({
      slug,
      analytics: data.analytics,
      improvementReport,
      totalEvents: data.totalEvents,
    });
  } catch (error) {
    console.error(`[Analytics] Error fetching analytics for ${slug}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

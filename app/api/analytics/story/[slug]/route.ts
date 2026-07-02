import { NextRequest, NextResponse } from 'next/server';
import type { AggregateStoryAnalytics } from '@/utils/analytics';
import { generateImprovementReport } from '@/utils/analytics';

interface AnalyticsResponse {
  analytics: AggregateStoryAnalytics | null;
  totalEvents: number;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/analytics?story=${slug}&aggregate=true`);

    if (!res.ok) {
      return NextResponse.json({ error: 'Analytics data not available' }, { status: 404 });
    }

    const data = (await res.json()) as AnalyticsResponse;

    if (!data.analytics) {
      return NextResponse.json({
        slug,
        analytics: null,
        improvementReport: null,
        message: 'Not enough data yet — need at least 10 reader sessions',
      });
    }

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

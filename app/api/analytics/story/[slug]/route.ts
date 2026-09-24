import { NextRequest, NextResponse } from 'next/server';
import { aggregateStoryAnalytics, generateImprovementReport } from '@/utils/analytics';
import { requireAnalyticsAdmin, getAnalyticsEvents } from '@/utils/analytics-admin';


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const denied = await requireAnalyticsAdmin(request);
  if (denied) return denied;

  const { slug } = await context.params;

  try {
    const allEvents = getAnalyticsEvents();
    const storyEvents = allEvents.filter((e) => e.storySlug === slug);

    if (storyEvents.length === 0) {
      return NextResponse.json({
        slug,
        analytics: null,
        improvementReport: null,
        message: 'Not enough data yet — need at least 10 reader sessions',
      });
    }

    const analytics = aggregateStoryAnalytics(storyEvents, slug);
    analytics.period = {
      start: storyEvents[0].ts,
      end: storyEvents[storyEvents.length - 1].ts,
    };

    const improvementReport = generateImprovementReport(analytics);

    return NextResponse.json({
      slug,
      analytics,
      improvementReport,
      totalEvents: storyEvents.length,
    });
  } catch (error) {
    console.error(`[Analytics] Error fetching analytics for ${slug}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


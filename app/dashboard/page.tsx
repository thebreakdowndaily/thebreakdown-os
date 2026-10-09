import DashboardClient from './DashboardClient';
import { getFixes } from '@/utils/data-layer/store';
import { SerializedFix } from '@/components/dashboard/FixDashboard';

export default function DashboardPage() {
  const fixesData = getFixes({ pageSize: 50 });
  
  // Serialize payload to prevent leaking full store objects to client bundle
  const serializedFixes: SerializedFix[] = fixesData.data.map(fix => ({
    slug: fix.slug,
    evidenceScore: fix.evidenceScore,
    publishedAt: fix.publishedAt,
    readingTime: fix.readingTime,
    headline: fix.headline,
    summary: fix.summary,
    metricsToTrack: fix.metricsToTrack,
    recommendedActions: fix.recommendedActions.map(a => ({ priority: a.priority })),
    citizenActions: fix.citizenActions,
    governmentActions: fix.governmentActions,
    stakeholders: fix.stakeholders,
  }));

  return <DashboardClient fixes={serializedFixes} />;
}

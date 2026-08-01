import { loadData } from '@/lib/up403/loader';
import { computeAnalytics } from '@/lib/up403/analytics';
import { okResponse } from '@/lib/up403/response';

export async function GET() {
  await loadData();
  const metrics = computeAnalytics();

  return okResponse(metrics, {
    metric_categories: Object.keys(metrics),
    read_only: true,
    prediction_capability: false,
  });
}

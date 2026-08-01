import { loadData, getFilterOptions } from '@/lib/up403/loader';
import { okResponse } from '@/lib/up403/response';

export async function GET() {
  await loadData();
  const options = getFilterOptions();

  const filterCount = Object.entries(options).reduce((sum, [, val]) => {
    return sum + (Array.isArray(val) ? val.length : 0);
  }, 0);

  return okResponse(options, { filter_count: filterCount });
}

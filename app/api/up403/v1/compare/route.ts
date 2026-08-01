import { loadData, getDataById } from '@/lib/up403/loader';
import { compareConstituencies } from '@/lib/up403/compare';
import { okResponse, badRequestResponse } from '@/lib/up403/response';
import type { ComparisonCategory } from '@/lib/up403/compare';

const VALID_CATEGORIES = [
  'election_history', 'current_representation', 'political_dna',
  'economy', 'development', 'governance', 'issues', 'timeline',
];

export async function GET(request: Request) {
  await loadData();
  const url = new URL(request.url);

  const idsParam = url.searchParams.get('ids');
  if (!idsParam) {
    return badRequestResponse('Query parameter "ids" is required. Example: ?ids=UP-AC-001,UP-AC-002,UP-AC-003');
  }

  const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
  if (ids.length < 2) {
    return badRequestResponse('At least 2 constituency IDs are required for comparison');
  }
  if (ids.length > 5) {
    return badRequestResponse('Maximum 5 constituencies can be compared at once');
  }

  const byId = getDataById();
  const invalid = ids.filter(id => !byId.has(id));
  if (invalid.length > 0) {
    return badRequestResponse(`Invalid constituency IDs: ${invalid.join(', ')}`);
  }

  const categoriesParam = url.searchParams.get('categories');
  let categories: ComparisonCategory[] | undefined;
  if (categoriesParam) {
    categories = categoriesParam.split(',').map(c => c.trim()) as ComparisonCategory[];
    const invalidCats = categories.filter((c: string) => !(VALID_CATEGORIES as readonly string[]).includes(c));
    if (invalidCats.length > 0) {
      return badRequestResponse(`Invalid categories: ${invalidCats.join(', ')}. Valid: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  const comparison = compareConstituencies(ids, categories);

  return okResponse(comparison, {
    constituencies_compared: ids.length,
    ids: ids,
    categories: categories || VALID_CATEGORIES,
    categories_included: Object.keys(comparison),
  });
}

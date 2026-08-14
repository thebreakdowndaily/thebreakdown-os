import { loadData } from '@/lib/up403/loader';
import { listPeople } from '@/lib/up403/compare';
import { okResponse, parsePagination } from '@/lib/up403/response';

export async function GET(request: Request) {
  await loadData();
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url);

  const { people, total } = listPeople(page, limit);

  return okResponse(people, {
    count: people.length,
    page,
    limit,
    total,
  });
}

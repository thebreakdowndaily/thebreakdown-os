import { NextRequest, NextResponse } from 'next/server';
import { bootstrapServices } from '@/lib/bootstrap';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const pageRaw = searchParams.get('page');
  const pageSizeRaw = searchParams.get('pageSize');
  const page = pageRaw ? parseInt(pageRaw, 10) : 1;
  const pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 10;
  const orderRaw = searchParams.get('order');
  const sortOrder: 'asc' | 'desc' = orderRaw === 'desc' ? 'desc' : 'asc';
  const sort = searchParams.get('sort');
  const search = searchParams.get('search')?.toLowerCase();

  const services = bootstrapServices();
  let data = await services.entities.getEntitiesByType('country');

  if (search) {
    data = data.filter(c => c.name.toLowerCase().includes(search) || (c.description && c.description.toLowerCase().includes(search)));
  }

  if (sort) {
    data = [...data].sort((a: any, b: any) => {
      const valA = a[sort];
      const valB = b[sort];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const total = data.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedData = data.slice(start, start + pageSize);

  return NextResponse.json({
    data: paginatedData,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
    },
  });
}

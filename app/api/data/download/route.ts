import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/features/rate-limiting/limiter';

const VALID_DATASETS = [
  'mgnrega',
  'gdp-growth',
  'upi-transactions',
  'sino-indian-border',
  'pli-semiconductor'
];

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const rate = await rateLimiter.checkLimit({
    key: `export:${clientIp}`,
    tier: 'export',
    endpoint: '/api/data/download',
    ip: clientIp,
  });

  if (!rate.allowed) {
    return rateLimiter.create429Response(rate);
  }

  const searchParams = request.nextUrl.searchParams;
  const datasetId = searchParams.get('datasetId');

  if (!datasetId || !VALID_DATASETS.includes(datasetId)) {
    return NextResponse.json({ error: 'Invalid or missing datasetId' }, { status: 400 });
  }

  const supporterCookie = request.cookies.get('tb_supporter');
  
  if (!supporterCookie || supporterCookie.value !== 'true') {
    return NextResponse.json({ error: 'Premium Supporter membership required' }, { status: 403 });
  }

  const csvContent = `column1,column2\nsample,data\n`;

  const response = new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${datasetId}.csv"`,
    },
  });

  rateLimiter.applyHeaders(response.headers, rate);
  return response;
}

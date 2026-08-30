import { NextRequest, NextResponse } from 'next/server';

const VALID_DATASETS = [
  'mgnrega',
  'gdp-growth',
  'upi-transactions',
  'sino-indian-border',
  'pli-semiconductor'
];

export async function GET(request: NextRequest) {
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

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${datasetId}.csv"`,
    },
  });
}

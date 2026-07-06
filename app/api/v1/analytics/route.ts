import { NextResponse } from 'next/server';
import { getServices } from '@/services/registry';

export function GET() {
  const services = getServices();
  const stats = services.analytics.getDashboardStats();
  return NextResponse.json(stats);
}

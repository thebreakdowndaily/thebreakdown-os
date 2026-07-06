'use client';

import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { ReaderDashboard } from '@/features/auth/components/ReaderDashboard';

export default function ReaderPage() {
  return (
    <AuthGuard>
      <ReaderDashboard />
    </AuthGuard>
  );
}

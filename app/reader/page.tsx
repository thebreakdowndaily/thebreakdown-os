'use client';

/**
 * /reader — Reader Library (device-local).
 * TASK-24 §17/§19: reading, bookmarks and follows work without an account —
 * all state lives in browser localStorage. This page is deliberately NOT
 * gated by AuthGuard. Settings remains the only account-aware surface and
 * degrades gracefully.
 */
import { ReaderDashboard } from '@/features/auth/components/ReaderDashboard';

export default function ReaderPage() {
  return <ReaderDashboard />;
}
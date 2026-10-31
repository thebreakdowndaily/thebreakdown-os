/**
 * ─── Editorial Publishing Execution Ledger ───────────────────────────────────
 *
 * Durable execution ledger for autonomous scheduled publishing runs.
 * Persists job execution telemetry independently of publication_gate_log to
 * newsroom.pipeline_metrics (metric_name: 'editorial_publish_job').
 *
 * Provides end-to-end auditability:
 *   - job_id (UUID)
 *   - started_at / completed_at / duration_ms
 *   - stories_checked / stories_published / stories_blocked
 *   - execution status ('success' | 'partial' | 'failed')
 *   - error message (if any)
 */

import { createClient } from '@supabase/supabase-js';

export interface PublishJobLedgerRecord {
  job_id: string;
  started_at: string;
  completed_at: string;
  status: 'success' | 'partial' | 'failed';
  stories_checked: number;
  stories_published: number;
  stories_blocked: number;
  error: string | null;
  duration_ms: number;
}

function getNewsroomServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key || url === 'https://dummy.supabase.co' || url.includes('placeholder')) {
    return null;
  }

  try {
    return createClient(url, key, {
      auth: { persistSession: false },
      db: { schema: 'newsroom' },
    });
  } catch (err) {
    console.warn('[PublishLedger] Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Persists scheduled publishing execution metrics to newsroom.pipeline_metrics.
 * Fails open with logging so telemetry failures never block editorial publishing,
 * but returns boolean indicating whether persistence succeeded.
 */
export async function recordPublishJobExecution(ledger: PublishJobLedgerRecord): Promise<boolean> {
  const client = getNewsroomServiceClient();
  if (!client) {
    // In local unit testing or unconfigured development environments, log safely
    return false;
  }

  try {
    const { error } = await client
      .from('pipeline_metrics')
      .insert({
        id: ledger.job_id,
        metric_name: 'editorial_publish_job',
        metric_value: ledger.stories_published,
        metadata: ledger,
        recorded_at: ledger.completed_at,
      });

    if (error) {
      console.error('[PublishLedger] Database insertion error for publish job ledger:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[PublishLedger] Unexpected error persisting publish job ledger:', err);
    return false;
  }
}

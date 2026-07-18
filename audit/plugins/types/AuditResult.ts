// audit/plugins/types/AuditResult.ts
import { LifecycleState } from './LifecycleState';

export interface AuditResult {
  pluginName: string;
  state: LifecycleState;
  /** Arbitrary deterministic payload, but plugins are strongly encouraged to follow standard scoring schema */
  data: {
    score?: number;
    coverage?: number;
    findings?: { severity: string; message: string }[];
    metrics?: Record<string, unknown>;
    [key: string]: unknown;
  };
  execution?: {
    durationMs: number;
    startedAt: string;
    finishedAt: string;
  };
  /** Optional error message */
  error?: string;
}

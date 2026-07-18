// audit/plugins/types/AuditResult.ts
import { LifecycleState } from './LifecycleState';

export interface AuditResult {
  pluginName: string;
  state: LifecycleState;
  /** Arbitrary deterministic payload */
  data: Record<string, unknown>;
  /** Optional error message */
  error?: string;
}

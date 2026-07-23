import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'mock-success';
export const description = 'A plugin that succeeds immediately';

export async function run(context: AuditContext): Promise<AuditResult> {
  return {
    pluginName: name,
    state: LifecycleState.PASSED,
    data: {
      score: 100,
      coverage: 100,
      findings: [],
      metrics: {
        message: 'Success'
      }
    }
  };
}

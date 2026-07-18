import { AuditPlugin } from '../types/AuditPlugin';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'hello-world';
export const description = 'Reference hello-world plugin';

export async function run(context: AuditContext): Promise<AuditResult> {
  return {
    pluginName: name,
    state: LifecycleState.PASSED,
    data: {
      message: 'Hello World',
      repoRoot: context.repoRoot
    }
  };
}

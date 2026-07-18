import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';

export const name = 'mock-crash';
export const description = 'A plugin that deliberately crashes to test framework resilience';

export async function run(context: AuditContext): Promise<AuditResult> {
  throw new Error('Simulated plugin failure');
}

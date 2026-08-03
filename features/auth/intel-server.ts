import { getSession } from './auth-server';
import { guardIntel } from './intel-auth';
import type { IntelGuardResult } from './intel-auth';
import type { IntelModule } from './roles';

export async function guardIntelModule(module: IntelModule): Promise<IntelGuardResult> {
  return guardIntel(module, getSession);
}

// audit/plugins/types/AuditPlugin.ts
import { AuditContext } from "./AuditContext";
import { AuditResult } from "./AuditResult";

export interface AuditPlugin {
  name: string;
  description: string;
  /** Optional configuration schema for the plugin */
  configSchema?: object;
  /** Main execution function */
  run(context: AuditContext): Promise<AuditResult>;
}

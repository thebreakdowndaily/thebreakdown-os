// audit/plugins/mock-success/index.ts
import { AuditPlugin } from "../types/AuditPlugin";
import { AuditContext } from "../types/AuditContext";
import { AuditResult } from "../types/AuditResult";

export const plugin: AuditPlugin = {
  name: "mock-success",
  description: "A plugin that succeeds immediately",
  configSchema: {},
  async run(context: AuditContext): Promise<AuditResult> {
    return {
      plugin: "mock-success",
      passed: true,
      score: 100,
      messages: ["Success"],
    };
  },
};
export default plugin;

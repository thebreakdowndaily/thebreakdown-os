import { Capability } from "./types";
import { CompilerContext } from "./context";

export interface CapabilityRule {
  readonly capability: Capability;
  evaluate(node: Record<string, any>): boolean;
}

export const CapabilityRulesRegistry: readonly CapabilityRule[] = Object.freeze([
  {
    capability: Capability.Metrics,
    evaluate: (node) => Array.isArray(node.metricsToTrack) && node.metricsToTrack.length > 0,
  },
  {
    capability: Capability.Comparison,
    evaluate: (node) => Array.isArray(node.globalExamples) && node.globalExamples.length > 0,
  },
  {
    capability: Capability.Simulation,
    evaluate: (node) =>
      Array.isArray(node.recommendedActions) &&
      node.recommendedActions.some((a: any) => a.simulationValues),
  },
]);

export function inferCapabilities(
  node: any,
  existingCapabilities: Capability[],
  context: CompilerContext
): Capability[] {
  const capabilities = new Set<Capability>(existingCapabilities);

  for (const rule of CapabilityRulesRegistry) {
    try {
      if (rule.evaluate(node)) {
        capabilities.add(rule.capability);
      }
    } catch (error) {
      context.addDiagnostic({
        code: "CAP-302",
        message: `Capability inference rule failed for ${rule.capability}`,
        severity: "warning",
        category: "capability",
      });
    }
  }

  return Array.from(capabilities);
}

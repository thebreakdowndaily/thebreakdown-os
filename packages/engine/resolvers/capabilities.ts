import { GraphNode } from "../../graph/types";
import { Capability } from "../../compiler/types";
import { EngineContext } from "../types";

export class CapabilityResolver {
  public resolve(node: GraphNode, context: EngineContext): Capability[] {
    // 1. Get the node's declared capabilities
    const nodeCaps = node.manifest.metadata.capabilities || [];
    
    // 2. Combine with enabledCapabilities from context (e.g., feature flags from user settings)
    const contextCaps = context.enabledCapabilities || [];

    // 3. Deduplicate
    const combined = Array.from(new Set([...nodeCaps, ...contextCaps]));
    
    // 4. Return sorted deterministically
    return combined.sort((a, b) => a.localeCompare(b));
  }
}

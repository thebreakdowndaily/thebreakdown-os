import React, { useEffect } from "react";
import { Capability } from "../compiler/types";

export interface FallbackRendererProps {
  capability: Capability;
}

/**
 * FallbackRenderer handles cases where KXE activates a capability, but 
 * no matching React renderer is registered in the RendererRegistry.
 * It renders a safe placeholder, logs a diagnostic, and never throws.
 */
export function FallbackRenderer({ capability }: FallbackRendererProps) {
  useEffect(() => {
    // In a real application, we might send this to a telemetry endpoint.
    console.warn(`[KXE Renderer] Missing renderer for capability: '${capability}'. Displaying fallback placeholder.`);
  }, [capability]);

  return (
    <div style={{ padding: "16px", border: "1px dashed red", margin: "8px 0" }}>
      <strong>Unsupported Plugin</strong>
      <p>The experience requested a component for capability <code>{capability}</code>, but no renderer was registered.</p>
    </div>
  );
}

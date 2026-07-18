import React, { useMemo } from "react";
import { usePlugins, useExperience } from "./hooks";
import { useRegistryContext } from "./provider";
import { FallbackRenderer } from "./fallback";
import { Capability } from "../compiler/types";

/**
 * ActivePluginsRenderer automatically queries the registry for
 * every active capability tracked by KXE and renders its registered UI component.
 */
export function ActivePluginsRenderer() {
  const { activeIds } = usePlugins();
  const registry = useRegistryContext();
  const state = useExperience();

  // Memoize the mapped renderers so we only compute when activeIds or state changes
  const renderedPlugins = useMemo(() => {
    return activeIds.map((pluginId) => {
      // In MS5, we assume the KXE plugin ID directly maps to a registered Capability, 
      // or at least shares the same string value. KXE plugins and UI renderers are loosely coupled 
      // by this string. The user noted: "KXE Plugin produces state -> Renderer renders state".
      const capability = pluginId as Capability;
      const renderer = registry.resolve(capability);
      
      if (renderer) {
        // Because elements in React arrays need keys, we use the capability ID.
        return <React.Fragment key={capability}>{renderer.render(state)}</React.Fragment>;
      }
      
      return <FallbackRenderer key={capability} capability={capability} />;
    });
  }, [activeIds, registry, state]);

  return <>{renderedPlugins}</>;
}

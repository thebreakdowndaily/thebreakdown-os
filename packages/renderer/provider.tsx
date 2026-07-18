import React, { createContext, useContext, ReactNode, useRef } from "react";
import { KnowledgeExperienceEngine } from "../kxe/kxe";
import { RendererRegistry } from "./registry";

export interface ExperienceProviderProps {
  engine: KnowledgeExperienceEngine;
  registry: RendererRegistry;
  children: ReactNode;
}

export const ExperienceContext = createContext<KnowledgeExperienceEngine | null>(null);
export const RegistryContext = createContext<RendererRegistry | null>(null);

export function ExperienceProvider({ engine, registry, children }: ExperienceProviderProps) {
  // Ensure the engine and registry references remain strictly immutable after initial mount
  const engineRef = useRef(engine);
  const registryRef = useRef(registry);

  return (
    <ExperienceContext.Provider value={engineRef.current}>
      <RegistryContext.Provider value={registryRef.current}>
        {children}
      </RegistryContext.Provider>
    </ExperienceContext.Provider>
  );
}

export function useEngineContext(): KnowledgeExperienceEngine {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error("useEngineContext must be used within an ExperienceProvider");
  }
  return context;
}

export function useRegistryContext(): RendererRegistry {
  const context = useContext(RegistryContext);
  if (!context) {
    throw new Error("useRegistryContext must be used within an ExperienceProvider");
  }
  return context;
}

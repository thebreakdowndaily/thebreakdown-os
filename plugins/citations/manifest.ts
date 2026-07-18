import { PluginManifest, Capability } from "../../packages/plugin-sdk";

export const citationsManifest: PluginManifest = {
  id: "citations",
  version: "1.0.0",
  apiVersion: "1.0.0",
  displayName: "Citation Explorer",
  description: "Explore the provenance, evidence, and primary sources of claims.",
  capabilities: [Capability.Citations],
  minimumKOSVersion: "1.0.0",
  engine: true,
  kxe: true,
  renderer: true,
};

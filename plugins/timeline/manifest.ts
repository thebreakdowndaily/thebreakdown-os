import { PluginManifest, Capability } from "../../packages/plugin-sdk";

export const timelineManifest: PluginManifest = {
  id: "timeline",
  version: "1.0.0",
  apiVersion: "1.0.0",
  displayName: "Interactive Timeline",
  description: "Chronological visualization of historical events",
  capabilities: [Capability.Timeline],
  minimumKOSVersion: "1.0.0",
  engine: true,
  kxe: true,
  renderer: true,
};

import { ReactNode } from "react";
import { Capability } from "../compiler/types";
import { ExperienceState } from "../kxe/types";

export interface RendererMetadata {
  id: string;
  displayName: string;
  version: string;
  capabilities: readonly Capability[];
}

export interface Renderer extends RendererMetadata {
  render(state: Readonly<ExperienceState>): ReactNode;
}

import { createKXEPlugin, EvidenceConfidence } from "../../../packages/plugin-sdk";
import { citationsManifest } from "../manifest";

export interface CitationsPluginState {
  selectedClaimId: string | null;
  expandedEvidenceIds: string[];
  confidenceFilter: EvidenceConfidence | "all";
}

export const CitationsKXEPlugin = createKXEPlugin<CitationsPluginState>({
  manifest: citationsManifest,
  initialState: {
    selectedClaimId: null,
    expandedEvidenceIds: [],
    confidenceFilter: "all",
  },
  onActivate: () => ({
    selectedClaimId: null,
    expandedEvidenceIds: [],
    confidenceFilter: "all",
  }),
  onUpdate: (state, action, pluginState) => {
    switch (action.type) {
      case "citations/selectClaim":
        return { 
          ...pluginState, 
          selectedClaimId: action.payload as string,
          expandedEvidenceIds: [] // Reset expanded evidence on claim change
        };
      case "citations/expandEvidence":
        const evidenceId = action.payload as string;
        return {
          ...pluginState,
          expandedEvidenceIds: pluginState.expandedEvidenceIds.includes(evidenceId)
            ? pluginState.expandedEvidenceIds.filter(id => id !== evidenceId)
            : [...pluginState.expandedEvidenceIds, evidenceId]
        };
      case "citations/setConfidenceFilter":
        return {
          ...pluginState,
          confidenceFilter: action.payload as EvidenceConfidence | "all"
        };
      default:
        return pluginState;
    }
  }
});

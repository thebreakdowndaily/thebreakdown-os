import React from "react";
import { createRenderer, EvidenceConfidence } from "../../../packages/plugin-sdk";
import { useDispatch } from "../../../packages/renderer/hooks";
import { CitationExtensionData, ResolvedEvidence } from "../engine";
import { CitationsPluginState } from "../kxe";
import { citationsManifest } from "../manifest";

export const CitationRenderer = createRenderer<CitationsPluginState, CitationExtensionData>({
  manifest: citationsManifest,
  fallback: <div>Loading Citation Explorer...</div>,
  render: function CitationView({ state, pluginState, extensionData }) {
    const dispatch = useDispatch();

    const handleClaimSelect = (claimId: string) => {
      dispatch({ type: "citations/selectClaim", payload: claimId });
    };

    const handleEvidenceToggle = (evidenceId: string) => {
      dispatch({ type: "citations/expandEvidence", payload: evidenceId });
    };

    const handleConfidenceFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch({ type: "citations/setConfidenceFilter", payload: e.target.value });
    };

    const selectedClaim = extensionData.claims.find(c => c.id === pluginState.selectedClaimId);

    const filterEvidence = (evidence: ResolvedEvidence[]) => {
      if (pluginState.confidenceFilter === "all") return evidence;
      return evidence.filter(e => e.confidence === pluginState.confidenceFilter);
    };

    return (
      <div className="citations-container" style={{ display: "flex", gap: "20px", height: "100%", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
        {/* Claims List Sidebar */}
        <div className="claims-sidebar" style={{ width: "30%", borderRight: "1px solid #cbd5e1", paddingRight: "10px", overflowY: "auto" }}>
          <h3 style={{ marginTop: 0, color: "#1e293b" }}>Claims</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {extensionData.claims.map(claim => (
              <div 
                key={claim.id}
                onClick={() => handleClaimSelect(claim.id)}
                style={{
                  padding: "12px",
                  border: `1px solid ${pluginState.selectedClaimId === claim.id ? "#3b82f6" : "#e2e8f0"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: pluginState.selectedClaimId === claim.id ? "#eff6ff" : "white",
                  boxShadow: pluginState.selectedClaimId === claim.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#334155" }}>{claim.title}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{claim.supportingEvidence.length} Supporting, {claim.refutingEvidence.length} Refuting</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Viewer */}
        <div className="evidence-viewer" style={{ width: "70%", paddingLeft: "10px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>Evidence Provenance</h3>
            <select 
              value={pluginState.confidenceFilter} 
              onChange={handleConfidenceFilter}
              style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            >
              <option value="all">All Confidence Levels</option>
              <option value={EvidenceConfidence.High}>High Confidence Only</option>
              <option value={EvidenceConfidence.Medium}>Medium & High Confidence</option>
              <option value={EvidenceConfidence.Low}>Include Low Confidence</option>
            </select>
          </div>

          {!selectedClaim ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
              Select a claim to view its evidence provenance.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: "30px", padding: "16px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h2 style={{ marginTop: 0, color: "#0f172a" }}>{selectedClaim.title}</h2>
                <p style={{ color: "#475569" }}>{selectedClaim.summary}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h4 style={{ color: "#16a34a", borderBottom: "2px solid #16a34a", paddingBottom: "4px", display: "inline-block" }}>Supporting Evidence</h4>
                  {filterEvidence(selectedClaim.supportingEvidence).length === 0 ? (
                    <p style={{ color: "#64748b", fontSize: "14px" }}>No supporting evidence found matching criteria.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      {filterEvidence(selectedClaim.supportingEvidence).map(ev => (
                        <div key={ev.id} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                          <div 
                            style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}
                            onClick={() => handleEvidenceToggle(ev.id)}
                          >
                            <strong style={{ color: "#334155" }}>{ev.title}</strong>
                            <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", backgroundColor: ev.confidence === 'high' ? '#dcfce7' : ev.confidence === 'medium' ? '#fef08a' : '#fee2e2', color: ev.confidence === 'high' ? '#166534' : ev.confidence === 'medium' ? '#854d0e' : '#991b1b' }}>
                              {ev.confidence} confidence
                            </span>
                          </div>
                          {pluginState.expandedEvidenceIds.includes(ev.id) && (
                            <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0" }}>
                              <p style={{ margin: "0 0 16px 0", color: "#475569", fontSize: "14px" }}>{ev.summary}</p>
                              <h5 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Primary Sources</h5>
                              <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", fontSize: "14px" }}>
                                {ev.sources.map(s => (
                                  <li key={s.id} style={{ marginBottom: "4px" }}>
                                    {s.url ? <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{s.title}</a> : s.title}
                                    <span style={{ color: "#94a3b8", marginLeft: "8px", fontSize: "12px" }}>({s.type})</span>
                                  </li>
                                ))}
                                {ev.sources.length === 0 && <li style={{ color: "#94a3b8", fontStyle: "italic" }}>No sources linked.</li>}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ color: "#dc2626", borderBottom: "2px solid #dc2626", paddingBottom: "4px", display: "inline-block" }}>Refuting Evidence</h4>
                  {filterEvidence(selectedClaim.refutingEvidence).length === 0 ? (
                    <p style={{ color: "#64748b", fontSize: "14px" }}>No refuting evidence found matching criteria.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      {filterEvidence(selectedClaim.refutingEvidence).map(ev => (
                        <div key={ev.id} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                          <div 
                            style={{ padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}
                            onClick={() => handleEvidenceToggle(ev.id)}
                          >
                            <strong style={{ color: "#334155" }}>{ev.title}</strong>
                            <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", backgroundColor: ev.confidence === 'high' ? '#dcfce7' : ev.confidence === 'medium' ? '#fef08a' : '#fee2e2', color: ev.confidence === 'high' ? '#166534' : ev.confidence === 'medium' ? '#854d0e' : '#991b1b' }}>
                              {ev.confidence} confidence
                            </span>
                          </div>
                          {pluginState.expandedEvidenceIds.includes(ev.id) && (
                            <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0" }}>
                              <p style={{ margin: "0 0 16px 0", color: "#475569", fontSize: "14px" }}>{ev.summary}</p>
                              <h5 style={{ margin: "0 0 8px 0", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>Primary Sources</h5>
                              <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", fontSize: "14px" }}>
                                {ev.sources.map(s => (
                                  <li key={s.id} style={{ marginBottom: "4px" }}>
                                    {s.url ? <a href={s.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>{s.title}</a> : s.title}
                                    <span style={{ color: "#94a3b8", marginLeft: "8px", fontSize: "12px" }}>({s.type})</span>
                                  </li>
                                ))}
                                {ev.sources.length === 0 && <li style={{ color: "#94a3b8", fontStyle: "italic" }}>No sources linked.</li>}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
});

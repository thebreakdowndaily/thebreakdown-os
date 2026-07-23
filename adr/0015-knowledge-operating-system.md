# ADR-0015: Knowledge Operating System (KOS) Architecture

## Status
Approved (Frozen Root ADR)

## Governance Declaration
ADR-0015 is the root architectural source of truth for the Knowledge Operating System (KOS). Any future architectural decisions affecting the Evidence Engine, Knowledge Graph, compiler pipelines, or KXE layout controls must comply with the design rules and interfaces declared herein.

---

## 1. Context & Scope
The current implementation of "The Fix" pages behaves as standard long-form vertical articles. Readers consume information linearly with low agency. To scale the platform into an interactive, evidence-first learning environment across all dynamic layouts (The Fix, Investigations, Data Stories, and Knowledge Library Chapters), we establish the **Knowledge Operating System (KOS)** as a first-class platform architecture.

### Non-Goals
*   KOS is not a Content Management System (CMS) or database.
*   KOS is not an LLM/AI prompt orchestration framework.
*   KOS does not replace or redesign existing React block renderers.
*   KOS does not mutate authored database content at runtime.
*   KOS does not infer evidence confidence parameters without explicit source provenance.
*   KOS does not guarantee personalized AI recommendation paths; recommendation logic remains deterministic and policy-governed.

---

## 2. Core Architectural Principles
- **Evidence Before Experience:** Presentation must never outrank evidence integrity. Simulation outcomes and visualizations must degrade gracefully if supporting citations are flagged as invalid or incomplete.
- **Composition Over Replacement:** Orchestrate and coordinate existing React block renderers rather than rewriting them.
- **Declarative Over Imperative:** Journeys, plugin configurations, and validation policies must be data-driven.
- **Runtime Is Stateless:** Persistent knowledge states live inside compile-time manifests and the graph database, not in active UI variables.
- **Graceful Degradation:** Every advanced interactive plugin must fall back to basic static textual rendering if runtime execution fails.
- **Interfaces Over Implementations:** Subsystems communicate exclusively through declared contracts (`EvidenceProvider`, `KnowledgeCompiler`, `JourneyResolver`, `RecommendationProvider`).
- **Performance Is a Feature:** Capabilities are constrained by performance budgets (e.g. cold plugin load < 300ms, KXE gzipped bundle addition <= 25KB).

---

## 3. Tier Separation of Concerns

```
+-----------------------------------------------------------------------------------------+
| BUILD-TIME RESPONSIBILITIES                                                             |
| - Ingestion (KComp compiler parsing markdown)                                            |
| - Manifest Generation & Schema Validation                                               |
| - Entity Extraction (linking laws, datasets, and people)                                            |
| - Knowledge Graph assembly & Search Indexing updates                                    |
+-----------------------------------------------------------------------------------------+
| RUNTIME RESPONSIBILITIES                                                                |
| - Journey Resolution & State Management                                                 |
| - Recommendation Engine execution (Editorial vs. Runtime algorithms)                    |
| - Policy Layer evaluation (determining plugin visibility)                               |
| - KXE UI Controller render & Plugin resolution                                          |
| - Analytics Bus event propagation                                                       |
+-----------------------------------------------------------------------------------------+
```

---

## 4. Repository & Dependency Rules

### A. Repository Directory Structure
KOS components are separated into clean workspaces:
```
/packages
    ├── compiler/    - Ingestion parser and manifest generator (KComp)
    ├── graph/       - Semantic relations and node link storage
    ├── engine/      - Runtime journey handlers and policy validation
    ├── evidence/    - Provenance and citation confidence calculators
    ├── kxe/         - Experience orchestration and controllers
    ├── plugins/     - Reusable capabilities (Timeline, Simulator)
    └── analytics/   - Analytics Bus and telemetry providers
/apps
    └── website/     - Next.js 15 site runner
/content             - Structured Markdown files (Fix, Stories)
```

### B. Strict Direct Dependency Path
To prevent circular loops, dependencies follow a strict one-way path. Reverse imports are prohibited:
```
KComp ➔ Graph ➔ Engine ➔ KXE ➔ Plugins
```

---

## 5. Platform Specifications & Contracts

### A. Versioned Manifest Schema
```typescript
interface KnowledgeManifest {
  manifestVersion: "1.0";
  schemaVersion: "1.0";
  compilerVersion: "1.0";
  generatedAt: string;
  nodeId: string;
  nodeType: 'fix' | 'investigation' | 'chapter' | 'dataset' | 'law' | 'entity' | 'metric';
  metadata: {
    title: string;
    summary: string;
    capabilities: Array<'timeline' | 'comparison' | 'simulation' | 'debate' | 'metrics' | 'map'>;
    evidenceConfidence: 'high' | 'medium' | 'low';
  };
  relationships: Array<{
    type: 'causes' | 'contradicts' | 'implements' | 'measures' | 'supersedes';
    targetNodeId: string;
  }>;
  journeys: {
    defaultJourneyId: string;
    alternativeJourneyIds: string[];
  };
}
```

### B. Standardized Capability Registry
Plugins and templates register compatibility against an authoritative registry:
- `Timeline`: Renders historic chronologies.
- `Comparison`: Side-by-side global comparisons.
- `Simulation`: Policy decision sliders and trade-offs.
- `Debate`: Displays conflicting arguments and expert stance matrix.
- `Metrics`: Renders target metrics to track.
- `Map`: Geographic relationship charts.

### C. Standardized Plugin Contract
Every experience plugin must implement the following contract:
```typescript
export interface KXEPlugin {
  id: string;
  version: string; // semver
  requiredCapability: keyof typeof CapabilityRegistry;
  requiredData: string[];
  loadingStrategy: 'lazy' | 'eager';
  accessibilityRequirements: string[];
  performanceBudgetMs: number;
  fallbackComponent: React.ComponentType;
  render(node: KnowledgeNode, context: JourneyStageContext): React.ReactNode;
}
```

### D. Security & Trust Requirements
- **Traceability:** Every claim card must link to a valid source in the Evidence Engine.
- **Explainability Standard:** Every recommendation, simulation, or score displayed must explain its path (e.g., *"Why am I seeing this? ➔ Graph relationship ➔ Related budget tag"*).
- **Historical Access:** Deprecated source versions must remain accessible for citation integrity audits.
- **Read-Only Engine:** KXE plugins are prohibited from modifying evidence status or database schemas.

---

## 6. Lifecycles & Analytics

### A. Plugin Lifecycle
```
Discover ➔ Validate Capabilities ➔ Resolve Dependencies ➔ Load (next/dynamic) ➔ Mount ➔ Track Interactions ➔ Dispose
```

### B. Journey Lifecycle
```
Resolve Journey Config ➔ Resolve Stages ➔ Resolve Plugins ➔ Restore User State ➔ Track Progress ➔ Generate Recommendations
```

### C. Event Taxonomy (Analytics Bus)
Events published to the Analytics Bus use a versioned, controlled vocabulary:
- `journey.started` / `journey.completed`
- `journey.stage.entered` / `journey.stage.completed`
- `plugin.loaded` / `plugin.completed`
- `recommendation.viewed` / `recommendation.selected`
- `evidence.expanded` / `evidence.compared`
- `claim.challenged`
- `graph.node.opened`

---

## 7. Quality & Testing Strategy by Layer

| Layer | Primary Test Standard |
| :--- | :--- |
| **KComp Compiler** | Ingestion snapshot tests & syntax parsing checks. |
| **Manifest Validator** | Structural JSON-schema contract validations. |
| **Knowledge Graph** | Edge integrity checks and circular-reference validations. |
| **Knowledge Engine** | Journey stage resolution and routing simulation. |
| **Policy Layer** | Rule evaluation tests (e.g. verify simulator hides on incomplete inputs). |
| **KXE Subsystem** | UI interaction tests, focus management, and accessibility checks. |
| **Plugins** | Plugin contract verification and rendering fallbacks. |

---

## 8. Pilot Validation Path & Success Metrics
Before platform-wide rollout, we implement a vertical slice on `fix-mgnrega-reform` to validate:
- **Journey Completion Rate:** Target > 65% of sessions traversing at least 3 stages.
- **Evidence Audited Rate:** Target > 20% of readers opening confidence parameters.
- **Simulator CTR:** Target > 15% of sessions running policy simulations.
- **Latency:** Cold plugin load < 300ms, stage change transition < 100ms.

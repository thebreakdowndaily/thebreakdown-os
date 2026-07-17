# ADR-0015: Knowledge Operating System (KOS) Architecture

## Status
Approved (Frozen Blueprint)

## Context
The current implementation of "The Fix" pages behaves as standard long-form vertical articles. Readers consume information linearly with low agency. To scale the platform into an interactive, evidence-first learning environment across all dynamic layouts (The Fix, Investigations, Data Stories, and Knowledge Library Chapters), we need a unified, non-linear orchestration layer that sits on top of our existing React block renderers.

## Decision
We establish the **Knowledge Operating System (KOS)** as a first-class, four-tier platform architecture. It organizes data representation, compilation, and interactive presentation without replacing mature render systems.

KOS is composed of the following subsystems:
```
KOS
├── Knowledge Compiler (KComp)  - Ingests raw markdown/records and compiles the Knowledge Manifest
├── Evidence Engine             - Manages provenance, citation integrity, and confidence metrics
├── Knowledge Graph             - Relational schema of nodes and typed semantic edges
├── Knowledge Engine            - Runtime logic, intent router, policy engine, and analytics bus
└── Knowledge Experience (KXE)  - Dynamic UI viewport, question navigation, and capability plugins
```

---

### 1. Knowledge Manifest Contract & Validation
The Compiler outputs a versioned `KnowledgeManifest` contract:
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

A **Manifest Validator** layer runs after KComp builds the manifest and before runtime delivery, asserting schema versions, required fields, and verifying that referenced citations exist in the Evidence Engine.

---

### 2. End-to-End Runtime Lifecycle
```
Author ➔ Markdown ➔ KComp ➔ Manifest Validator ➔ Knowledge Graph ➔ Journey Resolver ➔ KXE Controller ➔ User ➔ Analytics Bus
```

---

### 3. Subsystem Lifecycles

#### A. Plugin Lifecycle
```
Discover ➔ Validate Capabilities ➔ Resolve Dependencies ➔ Load (next/dynamic) ➔ Mount ➔ Track Interactions ➔ Dispose
```

#### B. Journey Lifecycle
```
Resolve Journey Config ➔ Resolve Stages ➔ Resolve Plugins ➔ Restore User State ➔ Track Progress ➔ Generate Recommendations
```

---

### 4. Decoupled Analytics Bus & Event Taxonomy
KXE components push events into the Analytics Bus using a strict taxonomy:
- `journey_started`
- `stage_entered`
- `plugin_loaded`
- `evidence_expanded`
- `claim_challenged`
- `intent_selected`

---

### 5. Architectural Governance Rules
- **No Renderer Redesign:** Renderers (e.g. `FixRenderer.tsx`) are never replaced or bypassed by KXE; they are wrapped and coordinated.
- **Immutable Inputs:** Manifests are treated as immutable inputs by the runtime; the engine never mutates content fields.
- **Dependency Guard:** Cross-layer dependencies are prohibited except through declared interfaces (`EvidenceProvider`, `KnowledgeCompiler`, etc.).
- **Evidence Supremacy:** Evidence is the source of truth; simulation outcomes must degrade gracefully if supporting citations are invalid.

## Consequences
- **Preservation:** Existing React block renderers are orchestrally wrapped by the `KXEController` rather than rewritten.
- **Scale:** All future content schemas (Investigations, Timelines) can be compiled into KOS manifests to run interactive journeys.
- **Optimization:** Heavy interactive plugins are lazily loaded via `next/dynamic` only when their corresponding journey stage is requested.

## Pilot Validation Path
Before platform-wide deployment, we will build a single vertical slice:
1. Ingest `fix-mgnrega-reform` into the KOS compiler.
2. Run Manifest Validation.
3. Coordinate section visibility in `FixRenderer` via the `KXEController` using the default `policy-analysis` journey definition.
4. Record performance budgets (KXE payload <= 25KB gzipped, cold load < 300ms, database lookup < 20ms).
5. Track success metrics (journey completion, evidence expansion rates) to validate experience improvement.

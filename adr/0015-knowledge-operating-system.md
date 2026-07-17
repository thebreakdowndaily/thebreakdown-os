# ADR-0015: Knowledge Operating System (KOS) Architecture

## Status
Proposed (Stable Blueprint)

## Context
The current implementation of "The Fix" pages behaves as standard long-form vertical articles. Readers consume information linearly with low agency. To scale the platform into an interactive, evidence-first learning environment across all dynamic layouts (The Fix, Investigations, Data Stories, and Knowledge Library Chapters), we need a unified, non-linear orchestration layer that sits on top of our existing React block renderers.

## Decision
We establish the **Knowledge Operating System (KOS)** as a first-class, four-tier architecture. It organizes data representation, compilation, and interactive presentation without replacing mature render systems.

KOS is composed of the following subsystems:

```
KOS
├── Knowledge Compiler (KComp)  - Ingests raw markdown and compiles the Knowledge Manifest
├── Evidence Engine             - Manages provenance, citation integrity, and confidence metrics
├── Knowledge Graph             - Relational schema of nodes and typed semantic edges
├── Knowledge Engine            - Runtime logic, intent router, policy engine, and analytics bus
└── Knowledge Experience (KXE)  - Dynamic UI viewport, question navigation, and capability plugins
```

### 1. Knowledge Manifest Contract
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

### 2. The Policy Layer
Decouples runtime logic from UI plugins. A central Policy Engine regulates:
- **Evidence Thresholds:** Surface recommendations only when verified evidence meets requirements.
- **Divergence:** Force the display of conflicting evidence links if source confidence ratings differ.

### 3. Capability-Flagged Plugins
UI plugins (e.g. `DecisionSimulator`, `Timeline`) activate based on declared node capabilities (`timeline`, `simulation`, `metrics`) rather than rigid content types.

### 4. Objective Progress Tracking
KOS tracks only observable user actions:
- **Journey Progress:** `Explore` [✔] ➔ `Investigate` [✔] ➔ `Compare` [➔]
- **Interaction Tallies:** Sources audited, scenarios simulated.

## Consequences
- **Preservation:** Existing React block renderers are orchestrally wrapped by the `KXEController` rather than rewritten.
- **Scale:** All future content schemas (Investigations, Timelines) can be compiled into KOS manifests to run interactive journeys.
- **Optimization:** Heavy interactive plugins are lazily loaded via `next/dynamic` only when their corresponding journey stage is requested.

## Pilot Validation Path
Before platform-wide deployment, we will build a single vertical slice:
1. Ingest `fix-mgnrega-reform` into the KOS compiler.
2. Generate the KOS manifest.
3. Coordinate section visibility in `FixRenderer` via the `KXEController` using the default `policy-analysis` journey definition.
4. Record performance budgets (KXE payload <= 25KB gzipped, cold load < 300ms, database lookup < 20ms).

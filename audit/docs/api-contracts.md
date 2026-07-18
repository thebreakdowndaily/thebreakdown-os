# API Contracts & Compatibility

## Overview
This document defines the rigid contracts and compatibility guarantees for the Version 1.0.0 Audit-as-Code platform. As a foundational governance mechanism, these contracts are frozen to ensure stability for downstream consumers, CI pipelines, and future plugin development.

## Compatibility Statement

The framework adheres to strict Semantic Versioning. The following constraints apply for the duration of the `v1.x` lifecycle:

| Component | Required Version | Support Policy |
|-----------|-----------------|----------------|
| **Node.js** | `>= 24.x` | Supported on LTS and Active releases. |
| **Plugin SDK** | `1.0.0` | Frozen for v1.x. Additive changes only in minor releases. Breaking changes require v2.0.0. |
| **Manifest Schema** | `2.0` | Frozen for v1.x. |
| **Report Schema** | `1.0` | Output schema is guaranteed stable for downstream CI/CD consumption. |
| **Policy Schema** | `1.0` | Frozen. Policy rules can evolve, but the structure of policy definitions is stable. |

## Plugin SDK (v1.0.0)

All plugins must export a default module implementing the `AuditPlugin` interface:

```typescript
export interface AuditPlugin {
  run(context: AuditContext): Promise<AuditResult>;
}

export interface AuditContext {
  repoRoot: string;
}
```

The output of `run()` must conform to the `AuditResult` contract.

## Report Schema (v1.0)

Every plugin returns a discrete `AuditResult` which is aggregated into the root report.

### AuditResult Structure
```typescript
interface AuditResult {
  pluginName: string;
  state: 'PASSED' | 'FAILED' | 'SKIPPED';
  data: {
    score?: number;               // 0 to 100
    coverage?: number;            // 0 to 100
    findings?: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
      message: string;
    }>;
    metrics?: Record<string, unknown>; 
  };
  execution?: {
    durationMs: number;
    startedAt: string;
    finishedAt: string;
  };
  error?: string;
}
```

### Root Aggregator Structure
```json
{
  "frameworkVersion": "1.0.0",
  "schemaVersion": "2.0",
  "reportVersion": "1.0",
  "policyVersion": "1.0",
  "platformHealthScore": 95,
  "weightedPlatformHealthScore": 95,
  "coverage": 100,
  "pluginCount": 11,
  "successfulPlugins": 11,
  "failedPlugins": 0,
  "skippedPlugins": 0,
  "execution": {
    "totalDurationMs": 263,
    "generatedAt": "2026-07-18T17:00:46.585Z",
    "nodeVersion": "v24.18.0",
    "os": "win32"
  },
  "results": [ ... ]
}
```

## Backward Compatibility Guarantees

1. **Additive Changes**: We may add properties to schemas or new metadata objects, but existing properties will not be renamed, moved, or deleted in `v1.x`.
2. **Metrics Safety**: The contents of `metrics` vary by plugin and can be modified. Downstream consumers should rely heavily on the stable top-level variables (`score`, `coverage`, `findings`, `execution`).
3. **Execution Safety**: Execution duration will always reside in the `execution` block to avoid mutating `metrics` with operational data.

## Deprecation Policy
If a schema block or SDK method needs deprecation, it will:
1. Continue to function for the remainder of `v1.x`.
2. Emit a console warning.
3. Be removed entirely in `v2.0.0`.

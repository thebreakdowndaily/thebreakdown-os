# Editorial Quality Audit Plugin (`editorial-audit`)

## Overview
This plugin enforces the core tenets of the Editorial Constitution within the repository's Knowledge Objects. It ensures that all editorial content adheres to the strict guidelines required by The Breakdown platform.

## Capabilities
- **Constitution Compliance**: Ensures that `docs/editorial/editorial-constitution.md` exists as the supreme governing document.
- **Structure Validation**: Scans knowledge objects (e.g., under `content/` or `app/` if applicable) for adherence to the four-layer structure (Timeline, Evidence, Claims, Context).
- **Evidence Formatting**: Verifies that articles do not contain prohibited language (e.g., "clearly," "obviously") and adhere to neutral historiography standards.

## Integration
This plugin depends on `knowledge-graph-audit`. It evaluates the structural integrity of the narrative surfaces and the presence of verified claims.

### Policy Rules
Refer to `policy.json` for specific document paths and validation constraints.

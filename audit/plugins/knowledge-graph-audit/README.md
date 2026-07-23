# Knowledge Graph Audit Plugin (`knowledge-graph-audit`)

## Overview
This plugin ensures the integrity of the canonical Knowledge Registries that power The Breakdown platform. It validates that all primary knowledge objects (claims, sources, thinkers, events) are properly registered and structured.

## Capabilities
- **Registry Structure**: Validates the presence of required canonical registries (e.g., `registry/claims`, `registry/sources`, `registry/events`, etc.).
- **Schema Validation**: Ensures that each registry defines a robust Zod schema or TypeScript interface for its respective domain.
- **Data Integrity**: Checks for missing, orphaned, or malformed unique identifiers across knowledge objects.

## Integration
This plugin depends on `architecture-audit`. It ensures that the knowledge layer remains decoupled from the UI rendering layer.

### Policy Rules
Refer to `policy.json` for specific registry paths and schema requirements.

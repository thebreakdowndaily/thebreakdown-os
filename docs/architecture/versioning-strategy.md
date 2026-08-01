# Versioning Strategy & Compatibility Policy — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Scope:** Schema SemVer, Migration Patterns, & Compatibility Guarantees  

---

## 1. Overview & Versioning Architecture

As The Breakdown evolves over decades, canonical data schemas must adapt without breaking existing API consumers, database repositories, search indexes, or reader surfaces.

This specification defines the **Semantic Versioning (SemVer) Contract** for the Fix Domain, establishing strict compatibility guarantees and deprecation workflows.

---

## 2. SemVer Level Definitions

The Fix Domain Schema version follows the standard `MAJOR.MINOR.PATCH` format:

```
                  ┌─────────────────────────────────────────┐
                  │ Schema SemVer: MAJOR . MINOR . PATCH    │
                  └────────────────────┬────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ MAJOR (e.g., 2.0.0)     │ │ MINOR (e.g., 1.1.0)     │ │ PATCH (e.g., 1.0.1)     │
│ Breaking Schema Changes │ │ Additive / Non-Breaking │ │ Bugfixes & Doc Updates  │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

### 2.1 Patch Releases (`x.x.PATCH`)
- **Triggers**: Clarifications to field documentation, linter rule updates, non-functional type refinement, bugfixes in validators.
- **Compatibility**: 100% backward compatible. Zero repository migration required.

### 2.2 Minor Releases (`x.MINOR.0`)
- **Triggers**: Adding new optional fields to `Fix` interface, adding new enum options to `InterventionType` or `PolicyMaturity`, introducing new non-mandatory extension properties.
- **Compatibility**: 100% backward compatible. Downstream consumers ignore unhandled optional fields.

### 2.3 Major Releases (`MAJOR.0.0`)
- **Triggers**: Removing existing fields, renaming mandatory properties, altering graph edge cardinality, changing primitive field types.
- **Compatibility**: **BREAKING CHANGE**. Requires database migration scripts, updated repository converters, and API deprecation notices.

---

## 3. Backward Compatibility & Migration Guarantees

1. **N-1 Compatibility Window**: The repository layer and public APIs MUST support `MAJOR - 1` schema versions for at least 180 days following a MAJOR release.
2. **Fail-Safe Default Fillers**: When migrating database records to a new MINOR version with optional fields, migration scripts MUST populate explicit `null` or empty arrays rather than leaving undefined columns.
3. **Immutable Revision Provenance**: Updating content inside a Fix object increments its instance version (`fix.version`), but does NOT change the underlying schema version (`FixSchemaVersion`).

---

## 4. Deprecation Policy & Lifecycle

When a field or enum option is slated for removal, it must transition through a 3-stage Deprecation Lifecycle:

```
[ Stage 1: DEPRECATED (Warning Logged) ] ──► [ Stage 2: PENDING REMOVAL (180 Days) ] ──► [ Stage 3: REMOVED (Major SemVer) ]
```

- **Stage 1 (Deprecated)**: Marked with `@deprecated` TypeScript tags and linter warnings. Repository logs a warning when populated.
- **Stage 2 (Pending Removal)**: Field remains functional for read queries, but write operations reject new assignments.
- **Stage 3 (Removed)**: Field physically dropped in next MAJOR SemVer release.

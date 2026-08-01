# Repository Contracts Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Pattern:** Repository Pattern / Service Layer Abstraction  

---

## 1. Overview & Architecture Protocol

The `FixRepository` defines the strict storage and retrieval contract for Fix Knowledge Objects. It isolates the service layer and business logic from underlying PostgreSQL / Supabase storage mechanics.

### Core Repository Principles
- **Fail-Closed Security**: Operations failing validation or permission gates reject without mutating state.
- **Atomic Mutations**: State changes modifying multiple tables (Fix, Graph Edges, Audit Log) execute in single transactions.
- **Audit Logging**: Every mutation emits an immutable audit event to the `KnowledgeAuditLog`.

---

## 2. Interface Contract Specification

```typescript
export interface IFixRepository {
  // ── Retrieve Operations ────────────────────────────────────────────────
  getById(id: string): Promise<Fix | null>;
  getBySlug(slug: string): Promise<Fix | null>;
  list(filter: FixFilterParams, pagination: PaginationParams): Promise<PaginatedResult<Fix>>;
  
  // ── Lifecycle Mutation Operations ──────────────────────────────────────
  create(payload: CreateFixDTO, authorId: string): Promise<Fix>;
  update(id: string, payload: UpdateFixDTO, editorId: string): Promise<Fix>;
  archive(id: string, reason: string, editorId: string): Promise<Fix>;
  supersede(id: string, supersededByFixId: string, rationale: string, editorId: string): Promise<Fix>;
  
  // ── Structural Operations ──────────────────────────────────────────────
  merge(sourceFixIds: string[], targetPayload: CreateFixDTO, editorId: string): Promise<Fix>;
  split(sourceFixId: string, targetPayloads: CreateFixDTO[], editorId: string): Promise<Fix[]>;
  
  // ── Relationship Operations ────────────────────────────────────────────
  getRelatedStories(fixId: string): Promise<Story[]>;
  getRelatedEntities(fixId: string): Promise<Entity[]>;
  getSupportingSources(fixId: string): Promise<Source[]>;
}
```

---

## 3. Operations & Contract Rules

### 3.1 `Create` Operation
- **Input**: `CreateFixDTO`, `authorId`.
- **Pre-conditions**:
  - `slug` must be unique across all active and archived Fixes.
  - `primaryCategory` must be a valid `InterventionType`.
- **Execution Rules**:
  - Assigns new `UUIDv4` identifier.
  - Sets `version = "1.0.0"`.
  - Sets `editorialStatus = "draft"`, `publicationStatus = "draft"`.
  - Creates initial entry in `KnowledgeAuditLog`.
- **Post-conditions**: Object persisted; searchable in draft index.

### 3.2 `Update` Operation
- **Input**: `id`, `UpdateFixDTO`, `editorId`.
- **Pre-conditions**:
  - Target Fix must exist and NOT be `publicationStatus == archived`.
  - If `publicationStatus == published`, update must increment SemVer (`version`).
- **Execution Rules**:
  - Runs full validation suite (`FixValidator.validate(payload)`).
  - Updates `updatedAt` timestamp and `version`.
  - Writes diff payload to `KnowledgeAuditLog`.

### 3.3 `Archive` Operation
- **Input**: `id`, `reason`, `editorId`.
- **Execution Rules**:
  - Sets `publicationStatus = "archived"`.
  - Sets `maturityStatus = "archived"`.
  - Retains object in repository for historical provenance; removes from primary search index.

### 3.4 `Supersede` Operation
- **Input**: `id`, `supersededByFixId`, `rationale`, `editorId`.
- **Pre-conditions**:
  - `supersededByFixId` must exist, be `publicationStatus == published`, and `id != supersededByFixId` (no self-reference).
- **Execution Rules**:
  - Sets target `publicationStatus = "superseded"`.
  - Sets target `supersededByFixId = supersededByFixId`.
  - Creates Graph edge `FIX(id) - [SUPERSEDED_BY] -> FIX(supersededByFixId)`.

### 3.5 `Merge` Operation
- **Input**: `sourceFixIds[]`, `targetPayload`, `editorId`.
- **Execution Rules**:
  - Creates new canonical Fix object from `targetPayload`.
  - Supersedes all `sourceFixIds[]` pointing to the new Fix ID.
  - Re-links existing Graph edges from source Fixes to the target Fix.

### 3.6 `Split` Operation
- **Input**: `sourceFixId`, `targetPayloads[]`, `editorId`.
- **Execution Rules**:
  - Creates *N* new Fix objects from `targetPayloads[]`.
  - Marks `sourceFixId` as `archived` with note: *"Split into [Fix A, Fix B]"*.
  - Assigns graph relationships to appropriate split Fixes.

---

## 4. Repository Invariants & Error Conditions

1. **Transaction Atomicity**: If updating a Fix fails validator checks, all associated graph edge updates MUST roll back completely.
2. **Deletion Ban**: Physical deletion (`DELETE FROM fixes`) is strictly prohibited. All removal occurs via state transitions (`archived` or `superseded`).
3. **Circular Supersession Prevention**: The repository MUST reject any update that creates a cycle in supersession chains (e.g., A → B → A).

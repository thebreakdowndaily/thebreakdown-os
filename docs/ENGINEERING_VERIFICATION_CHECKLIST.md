# THE BREAKDOWN OS — ENGINEERING VERIFICATION CHECKLIST

**Version:** 1.0  
**Status:** Mandatory Technical Architecture & Implementation Gate  
**Governing Documents:** `AGENTS.md`, `docs/architecture-overview.md`, `docs/product-quality.md`

---

## 1. Architectural Guardrails (Zero Inventions)

Before submitting any Pull Request or committing changes, verify compliance with core architectural boundaries:

- [ ] **Infrastructure Ban Honored**:
  - No new generic registries, abstractions, service layers, or parallel repositories.
  - Extends existing `services/radar/`, `services/lifecycle/`, `services/intelligence/`, or `services/repositories/`.
- [ ] **Canonical Types Respected**:
  - Uses canonical domain models defined in `@/types/canonical.ts` and `@/types/newsroom-intelligence.ts`.
  - No shadow types or parallel interfaces for Stories, Claims, Sources, or Entities.
- [ ] **Database & Data Layer Integrity**:
  - No direct bypassing of repository patterns.
  - In-memory mock repositories and Supabase production implementations maintain feature parity.

---

## 2. Component Engineering Standards

- [ ] **Component Size Limits**:
  - Target: $\le 250$ lines of code per component.
  - Warning: $300$ lines.
  - Hard limit requiring refactor: $> 500$ lines.
  - Composition favored over monolithic stateful JSX blocks.
- [ ] **Accessibility (WCAG AA Minimum)**:
  - Full keyboard navigation supported (`Tab`, `Enter`, `Escape`, arrow keys).
  - ARIA attributes present on interactive disclosure controls (`aria-expanded`, `aria-label`).
  - Color contrast ratio $\ge 4.5:1$ for normal text, $\ge 3:1$ for graphical objects.
  - Zero hydration mismatch warnings in console.

---

## 3. Security & Ingestion Safety

- [ ] **SSRF (Server-Side Request Forgery) Protection**:
  - All collectors (RSS, HTML, PDF, Browser) validate URLs before network dispatch.
  - Requests to loopback (`127.0.0.1`, `localhost`), link-local (`169.254.0.0/16`), or private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) blocked by default.
- [ ] **Response Stream Guards**:
  - Collectors enforce `maxResponseBytes` limits (default $5$ MB) to prevent out-of-memory denial of service.
  - Network timeouts bounded ($\le 30,000$ ms).
- [ ] **Secret Management**:
  - Zero hardcoded tokens, API keys, or database credentials.
  - Environment variables validated via schema or fallback gracefully in test environments.

---

## 4. Resilience & Concurrency Control

- [ ] **Distributed Polling Lock**:
  - Background workers acquire distributed lock (`radar:poll:global`) before executing polling cycles.
  - Lock has bounded TTL ($120$ seconds) with automatic expiry to prevent deadlocks on worker crash.
- [ ] **Bounded Exponential Backoff**:
  - Failing sources back off exponentially ($5 \times 2^{\min(failures - 1, 5)}$ minutes).
  - Backoff bounded at $240$ minutes max to ensure eventually consistent re-probing.
- [ ] **Deterministic Fingerprinting**:
  - Content normalization uses Unicode NFKC normalization prior to SHA-256 hashing.
  - Volatile markup (advertisements, session IDs, timestamps) stripped before fingerprinting.

---

## 5. Public Consistency & Parity

- [ ] **Sitemap Parity**:
  - All public stories, topics, entities, fixes, and chapters registered in `app/sitemap.ts`.
  - Static trust pages use static historical review timestamps.
- [ ] **Search Index Synchronization**:
  - `MemorySearchService` indexes all public knowledge objects without type-safety crashes.
  - Entity statistics handle both array-of-objects and key-value records defensively.
- [ ] **Deployment Parity**:
  - Local tests, build artifacts, and live production endpoints verified via `scripts/test-deployment-parity.js`.

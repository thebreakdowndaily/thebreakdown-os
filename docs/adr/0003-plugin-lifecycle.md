# ADR 0003 – Plugin Lifecycle and Contract Tests

## Status
- 📅 Proposed (2026-07-17)
- ✅ Accepted

## Context
The KOS platform now includes a **Plugin SDK**, a **Plugin Registry**, and a **Compatibility Policy**. These mechanisms define how plugins are authored, registered, validated, and integrated with the core runtime (Engine, KXE, Renderer). To ensure consistency and avoid regression, a clear lifecycle description and a shared contract test suite are required.

## Decision
We introduce a **Plugin Lifecycle ADR** that documents the end‑to‑end flow of a plugin:

1. **Authoring** – Implement a plugin using the SDK factories (`createEnginePlugin`, `createKXEPlugin`, `createRenderer`) and define a `PluginManifest`.
2. **Manifest Validation** – The manifest must include `id`, `version`, `apiVersion`, `displayName`, `capabilities`, and `minimumKOSVersion`.
3. **Compatibility Validation** – During registration, `PluginRegistry` calls `assertCompatible` which uses `compareVersions`/`isCompatible` against the platform version defined in `packages/plugin-sdk/version.ts`. Incompatible plugins throw `PluginCompatibilityError`.
4. **Registration** – `registry.register(plugin)` stores the plugin and makes its components available via `getEnginePlugins`, `getKXEPlugins`, and `getRenderers`.
5. **Engine Resolution** – Engine plugins are passed to `KnowledgeEngine` which resolves the `ResolvedKnowledgeSession`.
6. **Session Extensions** – Engine plugins may provide `SessionExtension`s that augment the session object.
7. **KXE State** – KXE plugins receive the resolved session and may register reducers, actions, and initial state slices.
8. **Renderer Registration** – Renderers are added to `RendererRegistry` and selected based on the requested capability.
9. **Runtime Interaction** – The UI interacts with the KXE via `dispatch`/`subscribe`. Renderers consume the immutable `ExperienceState`.
10. **Unloading / Hot‑Reload** – (Future) The registry can deregister a plugin, clearing its contributions.

### Contract Test Suite
A shared test suite (`packages/plugin-sdk/tests/contract.test.ts`) enforces the contract for any plugin:
- Validates the manifest schema.
- Confirms `assertCompatible` passes for compatible plugins and fails otherwise.
- Checks that registration makes engine/kxe/renderer components discoverable.
- Verifies that the plugin’s reducers do not mutate state directly.
- Ensures the renderer registers only once and returns a React node.
- Guarantees that namespace collisions (e.g., duplicate `id`) are rejected.

Plugins should import this suite and run it as part of their own test pipelines.

## Consequences
- **Positive**: Guarantees consistent plugin behavior, reduces onboarding friction, and catches regressions early.
- **Negative**: Introduces a small maintenance overhead for the contract test file; however, it is isolated within the SDK and does not affect core code.
- **Future Work**: Extend the contract suite with performance benchmarks and hot‑reload scenarios.

## Implementation Plan
- Add `docs/adr/0003-plugin-lifecycle.md` with the content above.
- Create `packages/plugin-sdk/tests/contract.test.ts` containing the generic test utilities.
- Update `package.json` scripts to include `test:contract`.
- Ensure existing plugins (Timeline, Citations) include the contract test in their CI.

---
*This ADR is aligned with the existing architecture governance and complements the Milestone 7 completion.*

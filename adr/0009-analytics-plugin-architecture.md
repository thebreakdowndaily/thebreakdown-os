# ADR 009: Analytics Plugin Architecture

## Status
Accepted

## Context
As the platform grows, we need to send analytics events (page views, interactions, search queries) to multiple destinations (e.g., local memory for dashboards, Mixpanel, Google Analytics). The previous architecture directly used a `MemoryAnalyticsService`, which tightly coupled the tracking logic to in-memory state and made adding new destinations cumbersome and invasive.

## Decision
We decided to adopt a plugin-based architecture for analytics tracking while strictly preserving the existing `AnalyticsService` public API to avoid breaking changes across the codebase. 

1. **Plugin Interface**: Introduced an `AnalyticsPlugin` interface containing a `track(event: AnalyticsEvent)` method.
2. **Memory Plugin**: Extracted the core logic of `MemoryAnalyticsService` into `MemoryAnalyticsPlugin`. This plugin continues to hold state for the internal dashboard.
3. **Service Orchestrator**: Replaced `MemoryAnalyticsService` with `PluginAnalyticsService` which implements the `AnalyticsService` interface. It maintains an array of registered plugins and broadcasts all `track` calls to them.
4. **Read Operations**: The `PluginAnalyticsService` delegates all read methods (e.g., `getDashboardStats`, `getTopStories`) specifically to the `MemoryAnalyticsPlugin` since it acts as our canonical internal state for dashboards.

## Consequences
- **Positive**: Adding new tracking systems (like Mixpanel or GTM) is now as simple as implementing the `AnalyticsPlugin` interface and registering it during service initialization.
- **Positive**: Zero changes were required to components calling `services.analytics.track(...)`.
- **Negative**: The `PluginAnalyticsService` is slightly coupled to `MemoryAnalyticsPlugin` for read operations. In the future, if we switch the dashboard data source to a real backend, we will swap the read delegation.

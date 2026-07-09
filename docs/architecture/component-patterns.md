# COMPONENT PATTERNS

## THE BREAKDOWN OS

Version: 1.0
Status: Living Document
Owner: Engineering

---

# PURPOSE

This document defines the canonical React component patterns used within The Breakdown OS.

Future AI agents and human engineers **must** reuse these patterns rather than inventing new ones. Consistency in UI architecture is essential for our 2045 longevity goal.

---

## 1. SERVER COMPONENTS

**Definition**: Components that execute entirely on the server and never ship JavaScript to the client.

**When to use**:
- Fetching data directly from Repositories or Services.
- Accessing backend resources directly (e.g. databases, file systems).
- Keeping large dependencies off the client bundle.
- Rendering static or SEO-critical content.

**Anti-Pattern**:
- Passing non-serializable props (like functions or class instances) from Server to Client Components.
- Doing heavy interactive state management on the server.

---

## 2. CONTAINER / PRESENTER (Smart vs. Dumb)

**Definition**:
A strict separation between data-fetching/logic (Container) and pure UI rendering (Presenter).

**When to use**:
- When a complex UI component needs to be decoupled from the Service Layer or View Models.

**Implementation**:
- **Container**: Usually a Server Component that interacts with the Service Layer, formats the View Model, and passes serializable props down.
- **Presenter**: A pure, stateless function that receives props and returns JSX.

**Anti-Pattern**:
- Fetching data directly inside a Presenter.
- Writing extensive business logic in a Presenter.

---

## 3. REGISTRY PATTERN

**Definition**:
A centralized map/dictionary that links string identifiers to component implementations.

**When to use**:
- When you need to render different components based on a dynamic string or enum (e.g., rendering 22 different chart types, or rendering block types in a CMS).

**Implementation**:
```typescript
const chartRegistry = {
  line: LineChart,
  scatter: ScatterPlot,
  heatmap: Heatmap,
};

function ChartRenderer({ type, data }) {
  const Component = chartRegistry[type];
  return <Component data={data} />;
}
```

**Anti-Pattern**:
- Massive `switch/case` statements inside a single render function.

---

## 4. STRATEGY PATTERN

**Definition**:
Extracting algorithms or logic branches into separate modules that conform to a shared interface, allowing the parent component to swap them dynamically.

**When to use**:
- Complex calculations, formatting, or rendering logic that changes based on type (e.g., D3 logic for different charts, or map projection algorithms).

**Implementation**:
Instead of a God Component doing everything, define a common interface and pass the data to the correct strategy.

---

## 5. COMPOSITION

**Definition**:
Building complex components by combining smaller, specialized, and reusable primitives via `children` and specific slots.

**When to use**:
- When a component requires deep prop drilling just to pass data to nested children.
- To prevent "God Components."

**Implementation**:
```tsx
// Good: Composition
<Card>
  <CardHeader title="Analytics" />
  <CardBody>
    <MetricsGrid />
  </CardBody>
</Card>
```

**Anti-Pattern**:
- Passing a dozen booleans (`showTitle`, `hasBorder`, `isDark`) to configure a monolithic component.

---

## 6. HOOKS

**Definition**:
Custom functions that encapsulate reusable stateful logic or side effects.

**When to use**:
- Extracting duplicated React lifecycle logic (e.g., `useScrollTracking`, `useAnalytics`).
- Encapsulating complex interactions (e.g., `useDragAndDrop`).

**Anti-Pattern**:
- Putting business logic inside hooks. (Business logic belongs in Services).
- Having duplicate hooks that do slightly different things.

---

# FINAL RULE

If you are about to create a component larger than 300 lines, stop. You are likely missing an opportunity to apply **Composition**, a **Registry**, or the **Strategy** pattern.

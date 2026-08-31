# TimeSeriesChart Component Specification

Status: Shipped & Active
Component: `components/trackers/TimeSeriesChart.tsx`
Governance: AGENTS.md v1.0 — Platform Beta / Accessibility & Performance Rules

---

## 1. Design & Performance Principles

1. **Zero External Chart Runtime Overhead**: Rendered entirely through pure React and responsive SVG vector paths. No D3 DOM mutations or heavy graphing bundle dependencies required on client bootstrap.
2. **Dual Representation**: Provides seamless toggle between graphical line/area chart view and accessible semantic HTML table view.
3. **Restrained Aesthetic**: Respects dark theme design tokens (`neutral-950` canvas, `emerald-400` strokes/gradients, `neutral-300` labels).
4. **Data Fidelity**: Preserves discrete time points without synthetic interpolation or false continuity.

---

## 2. Accessibility Features (WCAG 2.1 AA)

- **Keyboard Focusable Points**: Every data point in the SVG receives `tabIndex={0}` and triggers tooltip focus on keyboard navigation.
- **Tabular Data Alternative**: One-click toggle exposes a fully structured HTML table with `<th scope="col">` and numeric formatting.
- **Screen Reader Labeling**: SVG element carries `role="img"` and descriptive `aria-label` detailing series title, time bounds, and units.

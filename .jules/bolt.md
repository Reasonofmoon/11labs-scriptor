## 2025-02-18 - [Visualizer Hydration Mismatch & Re-renders]
**Learning:** Using `Math.random()` in the render phase for visual effects causes hydration mismatches in Next.js (SSR vs Client) and results in unnecessary visual jitter/DOM updates on every re-render.
**Action:** Move random value generation to `useEffect` (client-side only) to ensure stability and deterministic rendering. Use `React.memo` to prevent re-renders of expensive visual components when parent state (like text input) changes rapidly.

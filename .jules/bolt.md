## 2025-05-23 - Visualizer Optimization
**Learning:** React functional components wrapped in `React.memo` return a `NamedExoticComponent`, which is not assignable to `React.FC`. Removing the explicit `React.FC` type allows TypeScript to infer the correct type.
**Action:** When memoizing components, avoid `const Comp: React.FC = React.memo(...)`. Use `const Comp = React.memo<Props>(...)` instead.

**Learning:** Creating `CanvasGradient` objects in a `requestAnimationFrame` loop (e.g. 60fps * 128 bars) causes significant garbage collection pressure.
**Action:** Cache expensive canvas objects (gradients, patterns) keyed by their parameters (e.g. byte value 0-255) to reuse them.

**Learning:** `Math.random()` in the render phase causes hydration mismatches in Next.js and violates React purity rules.
**Action:** Use deterministic values (e.g. based on index) or pre-calculated constants for visual variations.

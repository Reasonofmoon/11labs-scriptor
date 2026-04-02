## 2024-05-18 - [Lint Purity Error in Visualizer]
**Learning:** React 19 strict purity rules enforce that functions like `Math.random()` cannot be used during render. This was discovered when linting `src/components/Visualizer.tsx`.
**Action:** Replace `Math.random()` with deterministic values (e.g., a constant array of pre-generated heights) for the idle state of the visualizer to prevent hydration mismatches and linting errors.

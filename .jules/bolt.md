## 2024-05-22 - Visualizer Optimization
**Learning:** For HTML5 Canvas animations in React `useEffect`, expensive objects (like `LinearGradient`) should be pre-calculated and cached outside the render loop where possible. This reduces allocations from 1000s/sec to 0. Additionally, using `Math.random()` in JSX causes hydration mismatches; deterministic values (e.g., constant array) are required for SSR safety.
**Action:** When animating canvas, always check for object creation inside loops (gradients, paths, etc.) and move them out. Use deterministic values for any initial render state.

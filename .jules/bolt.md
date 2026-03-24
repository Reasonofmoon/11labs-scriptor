
## 2025-02-13 - Visualizer Canvas Iteration Limits
**Learning:** The `Visualizer` iterates through `bufferLength` (e.g., 1024) bins to draw bars, but the fixed-size 400x80 canvas limits how many bars are actually visible. A significant portion of drawing calculations happen for off-screen elements.
**Action:** Always verify if iterations for rendering elements exceed physical layout bounds, and apply a bounds check (e.g., `if (x > canvas.width) break;`) to skip unnecessary processing.

## 2025-02-13 - Next.js React 19 Hydration and Impurity
**Learning:** Using `Math.random()` to conditionally generate styles inside component render (`Visualizer` idle state) violates strict React purity rules (causing a linting error) and causes deterministic hydration mismatches in Next.js.
**Action:** Extract dynamic style generation that doesn't rely on state out of the render loop using constants, or ensure side effects happen inside `useEffect`.

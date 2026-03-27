## 2024-05-22 - Visualizer Optimization & Hydration Fix
**Learning:** `Math.random()` in component render causes hydration mismatches in Next.js. Also, creating objects (like `CanvasGradient`) inside an animation loop creates GC pressure.
**Action:** Use deterministic values for initial render. Cache reusable canvas objects outside the loop. Add bounds checks to avoid drawing off-screen.

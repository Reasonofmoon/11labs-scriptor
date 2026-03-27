## 2025-02-21 - Visualizer Rendering & Hydration
**Learning:** In Next.js, using `Math.random()` during render causes hydration mismatches. Also, creating `CanvasGradient` objects inside a high-frequency loop (60fps * 1024 bars) creates massive GC pressure.
**Action:** Use deterministic values for initial render state. optimizing canvas loops by hoisting invariant calculations (like gradients) outside the loop.

## 2026-07-03 - Canvas Rendering Optimization & React Hydration Fix
**Learning:** In HTML5 Canvas rendering loops (e.g., audio frequency visualizers), constantly creating `CanvasGradient` objects inside `requestAnimationFrame` causes high GC pressure. Pre-calculating gradients based on the 0-255 bounds of `Uint8Array` avoids this. Also, using `Math.random()` for visual states in Next.js causes hydration mismatches between server and client.
**Action:** Pre-calculate fixed-bound gradients strictly outside the render loop and use deterministic arrays for static idle visuals.

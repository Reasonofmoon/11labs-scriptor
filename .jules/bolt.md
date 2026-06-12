
## 2026-06-12 - Pre-calculating CanvasGradients and Handling Hydration Mismatches
**Learning:** In high-FPS requestAnimationFrame loops doing canvas rendering based on Web Audio API frequency data (Uint8Array values 0-255), creating new CanvasGradient objects every frame causes high Garbage Collection pressure. Additionally, using `Math.random()` for component visual states in Next.js causes hydration mismatches between client and server.
**Action:** Pre-calculate and cache rendering objects (like CanvasGradient) indexed by the possible bounded data values (0-255) outside the render loop for O(1) lookup. Replace random visual calculations with deterministic static arrays when rendering Next.js components to prevent hydration errors.

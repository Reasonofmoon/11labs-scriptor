## 2024-05-18 - Canvas Gradient GC Optimization
**Learning:** Web Audio API `Uint8Array` frequency data is strictly bounded between 0-255. Dynamically recreating `CanvasGradient` objects for each bar in `requestAnimationFrame` causes immense Garbage Collection (GC) pressure.
**Action:** Always pre-calculate and cache the 256 possible gradient combinations strictly *outside* the `draw` loop (or `useEffect` render cycle) to avoid continuous memory allocation. Handled zero-height cases with `Math.max(1, height)` to avoid `DOMException`.

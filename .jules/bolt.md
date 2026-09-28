## 2025-02-23 - Canvas Animation Loop Optimization
**Learning:** Instantiating objects like `CanvasGradient` per-frame inside a `requestAnimationFrame` loop iterates over a typed array (`Uint8Array`) creates massive object allocation and Garbage Collection (GC) pressure. Also, Web Audio API frequency data strictly returns integer values from 0 to 255.
**Action:** Pre-calculate and cache rendering objects (like `CanvasGradient`) into an array of size 256 prior to the animation loop execution. Index into this array during the per-frame render loop instead of calculating new ones.

## 2025-02-23 - Next.js React Hydration Purity
**Learning:** Calling `Math.random()` to set visual styles (e.g. initial placeholder heights) inside a React render function causes hydration mismatches between server and client in Next.js, and violates React purity rules (impure functions during render).
**Action:** Use static, deterministic arrays for mock or placeholder data instead of using `Math.random()` inside components.

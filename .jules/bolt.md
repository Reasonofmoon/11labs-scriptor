## 2024-05-31 - Initial
**Learning:** Initializing journal.
**Action:** Ready to optimize.
## 2024-05-31 - CanvasGradient Garbage Collection Bottleneck
**Learning:** Creating `CanvasGradient` objects inside a `requestAnimationFrame` loop (especially 60+ times per frame) causes high object allocation and Garbage Collection (GC) pressure. Also discovered that `Math.random()` inside React component render logic causes Next.js hydration mismatches.
**Action:** Since `Uint8Array` bounded values are always integers from 0-255, pre-calculate an array of 256 `CanvasGradient` objects outside the loop. Also, replace `Math.random()` with deterministic constant arrays in visual components to prevent hydration errors.

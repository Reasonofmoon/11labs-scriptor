## 2024-06-14 - Canvas Gradient GC Optimization
**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, strictly returning integer values from 0 to 255. This bounded range allows for exact pre-calculation and caching of 256 `CanvasGradient` objects outside the `requestAnimationFrame` loop, completely eliminating extreme GC pressure from creating hundreds of gradients per frame.
**Action:** Always check the bounds of data arrays in hot paths (like rAF). If the domain is small and bounded, pre-calculate the visual representations once and cache them.

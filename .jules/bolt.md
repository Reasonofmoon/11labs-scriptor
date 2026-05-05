
## 2024-05-24 - Canvas Object Instantiation Bottleneck in React
**Learning:** Instantiating `CanvasGradient` objects inside a `requestAnimationFrame` loop creates severe GC pressure and frame rate drops, especially when tied to real-time Web Audio API frequency data (which updates 60 times a second). Because Web Audio frequency data is strictly bounded in a `Uint8Array` (0-255), these gradients can be pre-calculated.
**Action:** When working with Canvas drawing loops driven by `AnalyserNode`, identify inputs with bounded ranges (like frequency data) and aggressively pre-calculate rendering artifacts (gradients, paths, colors) outside the render loop into local cache arrays.

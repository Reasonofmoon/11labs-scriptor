## 2024-09-22 - Visualizer Canvas Rendering Bottleneck

**Learning:** Creating CanvasGradient objects inside a `requestAnimationFrame` loop per bar can cause significant CPU load and GC pressure. Web Audio Web API returns `Uint8Array` byte frequency data, meaning values are tightly bounded between 0 and 255.
**Action:** Exploit the 0-255 bounds by pre-calculating and caching 256 CanvasGradients at component mount or effect run, and use a simple array lookup inside the tight rendering loop. Add short-circuit breaks to avoid rendering off-canvas bars.

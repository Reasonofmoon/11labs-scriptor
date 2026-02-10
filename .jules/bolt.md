## 2024-05-23 - Canvas Gradient Caching
**Learning:** Creating new `CanvasGradient` objects for every bar in a visualizer loop (60fps * 1024 items) generates massive garbage collection pressure.
**Action:** In `Visualizer.tsx`, caching gradients based on the 8-bit frequency value (0-255) reduced object creation from ~60k/sec to near zero. Always look for object creation in `requestAnimationFrame` loops.

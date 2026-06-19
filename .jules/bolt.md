## 2026-06-19 - Canvas Render Loop Optimization
**Learning:** Web Audio API frequency loops allocating CanvasGradient objects per-bar every frame cause massive GC pressure and frame drops.
**Action:** Pre-calculate rendering objects (like gradients) outside the animation loop since Web Audio API Uint8Array data is bounded (0-255). Add early break conditions for off-screen canvas rendering.

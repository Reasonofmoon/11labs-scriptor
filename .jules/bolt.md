## 2024-05-18 - Canvas LinearGradient Performance Bottleneck
**Learning:** Creating `LinearGradient` objects inside a `requestAnimationFrame` loop on every frame causes significant performance overhead in HTML5 Canvas animations.
**Action:** Pre-calculate and cache expensive rendering objects like `CanvasGradient` outside the render loop, e.g., using a local cache array indexed by the bounded 0-255 frequency values.

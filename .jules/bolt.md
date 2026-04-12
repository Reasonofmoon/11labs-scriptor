## 2025-04-12 - [Canvas Optimization]
**Learning:** Pre-calculating bounded-range CanvasGradient objects and using bounds checks in requestAnimationFrame loops significantly improves HTML5 Canvas rendering performance.
**Action:** Always initialize cache arrays outside the render loop and stop drawing when elements exceed the canvas width.

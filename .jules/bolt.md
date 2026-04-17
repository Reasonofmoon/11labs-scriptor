## 2024-05-24 - Canvas Animation Optimization
**Learning:** Web Audio API frequency data (Uint8Array) strictly returns integer values from 0 to 255. Creating expensive objects like `CanvasGradient` inside a `requestAnimationFrame` loop per bar is a performance anti-pattern.
**Action:** Pre-calculate and cache rendering objects in an array outside the render loop, keyed by the frequency data value. Additionally, use bounds checking (`if (x > canvas.width) break;`) to avoid processing off-screen canvas elements.

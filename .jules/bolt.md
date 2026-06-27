## 2024-06-27 - Web Audio API GC Pressure Optimization
**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, strictly returning integer values from 0 to 255. In rendering loops (`requestAnimationFrame`), repeatedly creating objects like `CanvasGradient` based on these values causes massive Garbage Collection (GC) pressure and dropped frames.
**Action:** Always pre-calculate and cache rendering objects (like gradients or colors) in an array of size 256 mapped to the possible `Uint8Array` values outside the rendering loop.

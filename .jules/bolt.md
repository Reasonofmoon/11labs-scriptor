## 2024-05-24 - Canvas GC Pressure and Next.js Hydration Mismatches

**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, strictly returning integer values from 0 to 255. This bounded range allows for exact pre-calculation and caching of corresponding rendering objects (like `CanvasGradient`) to avoid high object allocation and Garbage Collection (GC) pressure within the `requestAnimationFrame` loop.
**Action:** Pre-calculate rendering objects (like gradients) for bounded values outside of rendering loops, ensuring cache initialization strictly outside `requestAnimationFrame`.

**Learning:** Using `Math.random()` inside React render cycles or for visual states (like idle visualizer bars) causes Next.js hydration mismatches between the server and client.
**Action:** Avoid `Math.random()` in initial render. Replace with deterministic constant arrays or apply randomness only after component mount.

**Learning:** In HTML5 Canvas rendering loops iterating over large datasets (e.g., audio frequency arrays), rendering off-screen elements wastes CPU cycles.
**Action:** Implement a short-circuit break condition (e.g., `if (x > canvas.width) break;`) to avoid unnecessary calculation and rendering of off-screen elements.

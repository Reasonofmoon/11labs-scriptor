## 2025-06-03 - [CanvasGradient garbage collection pressure and React.random() hydration issue]
**Learning:** Avoid using `Math.random()` inside React render cycles or for visual states (like idle visualizer bars) as it causes Next.js hydration mismatches between the server and client. Replace them with deterministic constant arrays.
**Action:** Always replace dynamic random values used for initial UI states with a predefined array of constants.

**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, strictly returning integer values from 0 to 255. This bounded range allows for exact pre-calculation and caching of corresponding rendering objects (like `CanvasGradient`) to avoid high object allocation and Garbage Collection (GC) pressure inside `requestAnimationFrame`. When pre-calculating canvas optimizations in a React `useEffect`, ensure the cache array is initialized strictly outside the `requestAnimationFrame` callback to prevent recreating the cache on every frame, which would defeat the optimization.
**Action:** When working with Web Audio API or bounded variables inside HTML5 Canvas drawing loops, precalculate and cache the expensive operations outside the `requestAnimationFrame` drawing loop and look up the cached values inside the loop. Ensure to handle zero-height edge cases when creating Canvas gradients.

**Learning:** In HTML5 Canvas rendering loops iterating over large datasets (e.g., audio frequency arrays), implement a short-circuit break condition (e.g., `if (x > canvas.width) break;`) to avoid unnecessary calculation and rendering of off-screen elements.
**Action:** Check rendering coordinates against canvas boundaries and early break loops when items exceed the visible screen space.

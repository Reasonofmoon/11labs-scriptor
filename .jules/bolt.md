## 2024-05-24 - Canvas Optimization via Bounded Data Caching
**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, meaning values strictly bounded from 0 to 255. In React HTML5 Canvas animations, expensive objects dependent on these values (like `LinearGradient`) can be exactly pre-calculated into an array of size 256 outside the `requestAnimationFrame` render loop, completely eliminating per-frame object instantiation and garbage collection overhead.
**Action:** Whenever iterating over `Uint8Array` data in an animation loop, look for bounded mapping opportunities to pre-compute rendering assets instead of creating them dynamically per frame.

## 2024-05-24 - Next.js Hydration Mismatches with Math.random
**Learning:** Avoid using `Math.random()` inside React render cycles or for visual states (like idle visualizer bars). Since the server and client generate different random values, this causes Next.js hydration mismatches.
**Action:** Replace `Math.random()` with deterministic constant arrays or generate random values only after the initial mount (e.g., inside `useEffect`).

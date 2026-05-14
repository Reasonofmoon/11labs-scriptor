## 2024-05-20 - Canvas Gradient Pre-calculation
**Learning:** In React `useEffect`, creating `LinearGradient` objects inside a `requestAnimationFrame` loop for every audio frequency bin (e.g., 1024 times per frame) causes massive garbage collection overhead. Since Web Audio frequency data is strictly 0-255, we can pre-calculate and cache all 256 possible gradients outside the render loop.
**Action:** Always pre-calculate and cache rendering objects for bounded data ranges in HTML5 Canvas animations, ensuring the cache is initialized strictly outside the `requestAnimationFrame` callback.

## 2024-05-20 - Deterministic Render States
**Learning:** Using `Math.random()` inside React render cycles for visual states (like idle visualizer bars) causes Next.js hydration mismatches between server and client.
**Action:** Replace `Math.random()` with deterministic constant arrays for static visual states.

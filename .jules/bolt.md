## 2024-03-21 - [Canvas & Audio Visualizer Performance + Hydration Mismatches]
**Learning:**
1. When using Web Audio API's `getByteFrequencyData`, the `Uint8Array` output is strictly bounded to integers 0-255. This provides a massive optimization opportunity: instead of re-creating rendering objects (like `CanvasGradient`) 60 times a second per frequency bin in a `requestAnimationFrame` loop (causing severe GC pressure), you can pre-calculate exactly 256 states into an array and cache them outside the render loop.
2. In Canvas rendering loops iterating over datasets that map to X-coordinates, failing to short-circuit the loop when `x > canvas.width` results in computing and drawing elements entirely off-screen, wasting CPU cycles.
3. Using `Math.random()` inside a React render cycle (like for generating random heights for an idle visualizer state) causes Next.js hydration mismatches between server and client.

**Action:**
1. Always pre-calculate and cache rendering objects for bounded data sources (like 8-bit audio data) outside of `requestAnimationFrame` callbacks. Ensure edge cases like height = 0 are handled (`Math.max(1, height)`) to avoid `DOMException`.
2. Always implement a short-circuit break condition in horizontal/vertical rendering loops to cull off-screen elements.
3. Use deterministic, constant arrays instead of `Math.random()` for purely visual static layouts in SSR/Next.js components.

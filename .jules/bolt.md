## 2024-05-20 - Canvas Caching & Hydration
**Learning:** Next.js hydration mismatches can occur when using `Math.random()` for visual states. Also, caching HTML5 Canvas gradients outside the render loop using finite typed arrays (`Uint8Array` values 0-255) yields significant performance gains, but zero-height edge cases must be handled to avoid DOMExceptions.
**Action:** Pre-calculate 256 gradient objects outside `requestAnimationFrame` when bounding Web Audio API data, handle zero-height fallbacks (`height || 1`), and replace `Math.random()` with constant arrays for idle UI elements.

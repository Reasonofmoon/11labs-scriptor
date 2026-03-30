## 2024-05-24 - Canvas Optimization in React
**Learning:** Pre-calculating expensive canvas operations (like CanvasGradient) inside a `requestAnimationFrame` loop creates performance bottlenecks. If cached within the `useEffect` but initialized inside the callback, it defeats the purpose.
**Action:** Always extract and initialize cache arrays (like pre-computed gradients) outside the render loop callback when possible. Ensure bounded values (like `Uint8Array` 0-255 frequency data) are leveraged for exact pre-calculation.

## 2024-05-24 - React Purity and Hydration
**Learning:** Using `Math.random()` directly in component render paths causes Next.js hydration mismatches and violates strict React purity rules enforced by the project's linting.
**Action:** Replace `Math.random()` in render paths with deterministic constants (like predefined arrays) or manage randomness explicitly via state/refs populated after mount.

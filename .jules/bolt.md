## 2024-05-24 - Canvas LinearGradient Pre-calculation in React Animation Loops
**Learning:** Instantiating `CanvasGradient` objects (like `ctx.createLinearGradient()`) inside a fast-running loop within a `requestAnimationFrame` callback can be a massive performance bottleneck due to garbage collection and repeated calculations.
**Action:** When mapping bounded data (like Web Audio API's `Uint8Array` which is always 0-255) to canvas styling, pre-calculate and cache all possible rendering objects (e.g., gradients) outside the animation loop in a lookup array indexed by the data value.

## 2024-05-24 - Canvas Bounds Checking Optimization
**Learning:** Iterating over the entire `bufferLength` of an `AnalyserNode` often includes data that maps to coordinates far outside the visible canvas width, leading to wasted drawing instructions.
**Action:** Always include a bounds check (`if (x > canvas.width) break;`) inside canvas rendering loops to short-circuit and skip processing elements that won't be visible to the user.

## 2024-05-24 - React Purity and Hydration with Math.random()
**Learning:** Using `Math.random()` to generate inline styles or child elements during render in Next.js causes hydration mismatches (server HTML differs from client HTML) and violates React purity rules, potentially causing UI jitter on re-renders.
**Action:** Replace `Math.random()` in render paths with deterministic constant arrays or move the random generation into a `useEffect` hook that updates state after hydration.
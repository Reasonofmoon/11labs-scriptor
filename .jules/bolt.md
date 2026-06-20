## 2024-06-20 - [Hydration Mismatch and React Hooks Purity]
**Learning:** `Math.random` is an impure function. Calling an impure function like `Math.random()` during render (e.g. `style={{ height: \`\${8 + Math.random() * 16}px\` }}`) can produce unstable results that update unpredictably when the component happens to re-render, leading to errors like `react-hooks/purity` and potential hydration mismatches.
**Action:** Replace `Math.random()` in React render cycles with deterministic constant arrays or use `useEffect` if randomness is needed client-side.

## 2024-06-20 - [Web Audio API and Canvas Gradient Caching]
**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, which strictly returns integer values from 0 to 255. In Canvas rendering loops iterating over this data, creating a new `CanvasGradient` for every bar on every frame creates extremely high object allocation and Garbage Collection (GC) pressure.
**Action:** Pre-calculate and cache the 256 possible `CanvasGradient` objects outside the `requestAnimationFrame` loop, keyed by the frequency value (0-255). Ensure the cache is initialized strictly outside the `requestAnimationFrame` callback.

## 2024-06-20 - [Off-screen Canvas Rendering]
**Learning:** In HTML5 Canvas rendering loops iterating over large datasets (e.g., audio frequency arrays), calculating and rendering elements that fall outside the canvas bounds wastes CPU cycles.
**Action:** Implement a short-circuit break condition (e.g., `if (x > canvas.width) break;`) to avoid unnecessary calculation and rendering of off-screen elements.
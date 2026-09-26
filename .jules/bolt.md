## 2024-05-24 - Exact pre-calculation based on bounded Uint8Array values
**Learning:** In HTML5 Canvas rendering loops tied to the Web Audio API, `getByteFrequencyData` populates a `Uint8Array` with values strictly bounded between 0 and 255. Dynamically creating rendering objects like `CanvasGradient` for every frame and frequency bin causes massive object allocation and GC pressure.
**Action:** Exploit this bounded integer range by pre-calculating and caching the exact 256 possible `CanvasGradient` objects during initialization (outside `requestAnimationFrame`), rather than creating them dynamically on the fly.

## 2024-05-24 - Math.random() in React Render
**Learning:** Using `Math.random()` inside a React component's render cycle (like setting inline styles for visualizers) causes hydration mismatches between the server and the client, leading to errors and unnecessary re-renders.
**Action:** Replace `Math.random()` with deterministic constant arrays or move randomness into a `useEffect` hook to ensure the initial render matches the server output.

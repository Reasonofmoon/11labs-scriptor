## 2024-05-24 - Visualizer Rendering Optimization
**Learning:** For HTML5 Canvas animations in React `useEffect`, expensive objects like `LinearGradient` should be pre-calculated and cached outside the render loop. Also, Web Audio API frequency data is populated into a `Uint8Array`, strictly returning integer values from 0 to 255. This bounded range allows for exact pre-calculation and caching of corresponding rendering objects. In addition, when iterating through canvas drawing commands, adding bounds checks (e.g., `if (x > canvas.width) break;`) prevents unnecessary processing of off-screen elements.
**Action:** Always pre-calculate and cache expensive canvas objects when the input domain is small and bounded (like 0-255). Add early exit conditions for off-screen canvas rendering.

## 2024-05-24 - React Purity and Hydration
**Learning:** The project's linting configuration enforces strict React purity rules, raising errors for impure functions (e.g., `Math.random()`) used during render. This is particularly important for Next.js to prevent hydration mismatches.
**Action:** Use deterministic values (e.g., a constant array like `IDLE_BAR_HEIGHTS`) instead of `Math.random()` for initial render states.

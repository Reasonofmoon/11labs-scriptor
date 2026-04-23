## 2025-02-18 - Canvas Rendering Optimization in React

**Learning:** When using HTML5 Canvas inside a React `useEffect` for high-frequency updates (like audio visualization), creating new `CanvasGradient` objects inside the `requestAnimationFrame` loop causes significant memory allocation and CPU overhead. Also, using impure functions like `Math.random()` during component render breaks React's purity rules and causes Next.js hydration warnings.

**Action:**
1. Pre-calculate and cache expensive objects like gradients *outside* the render loop (e.g., using a local cache array for the 256 possible Web Audio API byte values).
2. Add bounds checking (e.g., `if (x > canvas.width) break;`) to avoid rendering off-screen elements.
3. Use deterministic static arrays or stable values instead of `Math.random()` for idle states to ensure React component purity.
4. Wrap expensive leaf components with `React.memo` to prevent unnecessary re-renders when parent state changes.
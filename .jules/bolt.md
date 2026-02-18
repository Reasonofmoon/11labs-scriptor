## 2024-05-22 - [Canvas Optimization in Visualizer]
**Learning:** React `useEffect` runs once on mount, making it an ideal place to cache expensive canvas objects (like `LinearGradient`) for animation loops. Creating gradients inside `requestAnimationFrame` loop causes massive garbage collection (60fps * 1024 objects).
**Action:** Always hoist object creation out of `draw()` loops. Use a local cache (e.g., `const cache = []`) inside `useEffect` or `useRef` to store reusable canvas assets.

## 2024-05-24 - Canvas Animation Optimization
**Learning:** In React `useEffect` hooks that manage HTML5 Canvas animations via `requestAnimationFrame`, creating `CanvasGradient` or other expensive objects inside the animation loop for every frame/element severely degrades performance.
**Action:** Pre-calculate bounded data values (like Web Audio API frequency data from 0-255) into a cache array outside the render loop. Also, add bounds checking (e.g., `x > canvas.width`) to prevent unnecessary off-screen drawing.

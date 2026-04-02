## 2024-05-23 - HTML5 Canvas Render Loop Optimization
**Learning:** Creating CanvasGradient objects inside a requestAnimationFrame loop is extremely expensive and causes heavy garbage collection overhead. Furthermore, rendering logic can loop past the visible bounds of the canvas unnecessarily.
**Action:** Pre-calculate and cache CanvasGradient objects outside the render loop for all possible data values (e.g. 0-255 for getByteFrequencyData). Additionally, insert an early break condition `if (x > canvas.width) break;` inside the render loop to prevent drawing off-screen.

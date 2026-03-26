## 2024-05-22 - Visualizer Optimization
**Learning:** The `Visualizer` component iterates through frequency bins to draw bars. Adding a bounds check `if (x > canvas.width) break;` inside the loop significantly reduces processing time by skipping off-screen elements. Also, caching gradients keyed by byte value (0-255) prevents massive garbage collection pressure.
**Action:** Always look for opportunities to pre-calculate expensive objects (like gradients) and skip unnecessary iterations in canvas loops.

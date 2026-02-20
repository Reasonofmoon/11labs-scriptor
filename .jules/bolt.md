## 2024-05-22 - Visualizer Loop Bounds
**Learning:** The visualizer loop iterated through all frequency bins (1024) even though only ~340 fit on the canvas width (400px), wasting ~66% of draw calls.
**Action:** Always check loop bounds against render area dimensions in canvas animations to avoid processing off-screen elements.

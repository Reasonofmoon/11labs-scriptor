## 2024-05-22 - Visualizer Optimization
**Learning:** The `Visualizer` component's canvas drawing loop was creating ~680 unused `LinearGradient` objects per frame because it was iterating over the full `bufferLength` (1024) even though only ~340 bars fit on screen (due to `barWidth` calculation scaling by 3).
**Action:** Always add bounds checks (e.g., `if (x > canvas.width) break;`) in canvas animation loops to avoid processing off-screen elements. Also, avoid `Math.random()` in render for Next.js hydration stability.

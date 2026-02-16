## 2025-05-23 - Canvas Animation Optimization
**Learning:** HTML5 Canvas operations like `createLinearGradient` are expensive inside animation loops. Since frequency data (0-255) has limited discrete values, caching gradients by value significantly reduces GC pressure.
**Action:** When animating based on byte data (0-255), implement a lazy cache (e.g., `Array(256)`) inside `useEffect` to reuse objects.

## 2025-05-23 - Bounds Checking in Canvas Loops
**Learning:** `AnalyserNode.frequencyBinCount` (often 1024) typically exceeds canvas width (e.g., 400px). Iterating through all bins draws off-screen content unnecessarily.
**Action:** Always include a bounds check (e.g., `if (x > canvas.width) break;`) in canvas drawing loops to skip invisible work.

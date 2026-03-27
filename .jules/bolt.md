# Bolt's Journal

## 2024-05-22 - [Canvas Render Loop Optimization]
**Learning:** `Visualizer` component was rendering ~3x the canvas width because `analyser.frequencyBinCount` (128) combined with bar width logic produced a total width of ~1200px, while canvas is only 400px. This caused ~66% of `createLinearGradient` and drawing calls to be wasted on off-screen content.
**Action:** Always check loop bounds in canvas animations against actual canvas dimensions, and break early if off-screen.

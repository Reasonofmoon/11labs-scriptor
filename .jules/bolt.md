## 2024-05-24 - Canvas Optimization
**Learning:** Creating Canvas gradients inside requestAnimationFrame kills performance.
**Action:** Pre-calculate and cache gradients based on the finite 0-255 bounds of Web Audio API byte data.

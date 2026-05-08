## 2024-05-08 - Canvas Pre-calculation
**Learning:** Web Audio API frequency data strictly returns integer values bounded between 0 and 255. This allows for exact pre-calculation of rendering objects (like CanvasGradient) indexed by those frequency values inside a React useEffect, rather than recreating them per frame.
**Action:** Always look for bounded mathematical domains in animation render loops to hoist allocations outside the requestAnimationFrame loop to eliminate GC stuttering.

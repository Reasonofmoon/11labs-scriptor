## 2023-10-24 - Pre-calculated Canvas Optimizations
**Learning:** In HTML5 Canvas animations inside React `useEffect`, creating `LinearGradient` objects inside `requestAnimationFrame` is expensive. Web Audio API frequency data is bounded (0-255), allowing perfect pre-calculation.
**Action:** Initialize a local cache array of 256 pre-calculated gradients strictly outside the `requestAnimationFrame` loop.

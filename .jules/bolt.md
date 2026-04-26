## 2024-05-20 - Web Audio API Optimization
**Learning:** Bounded Web Audio API frequency data (0-255) enables aggressive Canvas API object pre-calculation.
**Action:** Always pre-calculate standard `createLinearGradient` arrays keyed by byte data values instead of recreating them on every `requestAnimationFrame` loop, reducing main thread churn.

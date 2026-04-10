## 2026-04-10 - Pre-calculated Canvas Gradients
**Learning:** In highly performant Web Audio Visualizers on Next.js, frequently calling `ctx.createLinearGradient` inside `requestAnimationFrame` loop creates huge memory pressure.
**Action:** Since audio visualizer data is bounded to a strictly defined Uint8Array range (0-255), caching pre-calculated gradients significantly increases frame rates.

## 2024-07-06 - Pre-calculate WebAudio 0-255 CanvasGradients
**Learning:** Creating `CanvasGradient` objects inside a `requestAnimationFrame` loop creates massive garbage collection overhead (thousands of objects per second). Because WebAudio API `Uint8Array` frequency data strictly bounds to integer values 0-255, we can exactly pre-calculate and cache all 256 possible gradient states outside the render loop.
**Action:** Always pre-calculate and cache expensive Canvas API objects that map to strictly bounded domain values rather than creating them per frame.

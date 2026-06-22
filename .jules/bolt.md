## 2024-06-22 - Pre-calculating CanvasGradients in Web Audio Visualizer
**Learning:** In HTML5 Canvas rendering loops with Web Audio API, frequency data values are strictly bounded (0-255 Uint8Array). Creating `CanvasGradient` objects per frequency bin on every `requestAnimationFrame` generates severe Garbage Collection (GC) pressure.
**Action:** Pre-calculate exactly 256 `CanvasGradient` objects outside the render loop and cache them in an array, indexing by the raw byte value `dataArray[i]`. Also implement an early `break` for off-screen rendering when `x > canvas.width`.

## 2024-06-02 - Pre-calculate Canvas Gradients for Web Audio Visualizer
**Learning:** Web Audio API frequency data bounded by 0-255 allows exact pre-calculation of rendering objects (like CanvasGradients) to avoid high object allocation per frame.
**Action:** When mapping `Uint8Array` data to canvas styling, initialize an array of all 256 possible styles outside `requestAnimationFrame` and index into it during the render loop.

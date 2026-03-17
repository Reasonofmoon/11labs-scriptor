## 2024-05-18 - [Optimizing Canvas Animations]
**Learning:** Instantiating `CanvasGradient` objects in an inner loop during `requestAnimationFrame` causes immense object allocation pressure.
**Action:** When animating canvas based on integer values (like `ByteFrequencyData`), cache the objects using the value (0-255) as a map key outside the render loop.
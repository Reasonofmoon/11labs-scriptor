## 2024-05-15 - Cache Web Audio API Gradients
**Learning:** Web Audio API frequency data is populated into a Uint8Array, returning exact integer values bounded from 0 to 255.
**Action:** When animating canvas properties based on frequency data, pre-calculate and cache the 256 possible gradient configurations outside the render loop instead of continuously allocating them in requestAnimationFrame.

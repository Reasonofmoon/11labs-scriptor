
## 2024-04-14 - Pre-calculating Canvas Gradients with Web Audio API Bounded Data
**Learning:** Web Audio API's `getByteFrequencyData` populates a `Uint8Array`, strictly returning integer values from 0 to 255. Because this range is fixed and small, it provides an excellent opportunity to pre-calculate and cache rendering objects (like `CanvasGradient`) strictly outside the `requestAnimationFrame` render loop, transforming dynamic object creation per frame per bar into a simple O(1) array lookup.
**Action:** When working with Web Audio API visualizations on HTML5 Canvas in React `useEffect`, always pre-calculate the 256 possible visual states (gradients, colors) outside the `draw()` function and use the frequency byte value as the cache index to minimize CPU usage.

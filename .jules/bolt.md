
## 2026-06-23 - Pre-calculate Bounded Web Audio API Arrays to Avoid GC Pressure
**Learning:** Web Audio API frequency data is populated into a `Uint8Array`, strictly returning integer values from 0 to 255. Continuously calculating derived rendering objects (like CanvasGradient) inside the 60FPS `requestAnimationFrame` loop creates massive object allocation and Garbage Collection (GC) pressure.
**Action:** Always pre-calculate and cache rendering objects for bounded arrays (like all 256 possible byte values) strictly OUTSIDE the render loop. Fetch the cached object using the array value as an index during rendering to drastically reduce memory churn and CPU usage. Ensure cache arrays are initialized outside the `requestAnimationFrame` callback.

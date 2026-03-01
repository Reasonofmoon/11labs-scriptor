## 2024-05-18 - [Canvas Gradient Caching Insight]
**Learning:** In React `useEffect` loops driving HTML5 Canvas `requestAnimationFrame`, instantiating new `CanvasGradient` objects and adding color stops on every frame is a surprisingly expensive JS-to-C++ bridge operation.
**Action:** When working with frequency/byte arrays (0-255), pre-calculate these objects and store them in a fixed-size `gradientCache` array keyed by the data value to eliminate thousands of object instantiations per second.

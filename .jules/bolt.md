## 2024-05-24 - Canvas Optimization in React
**Learning:** Pre-calculating expensive objects like CanvasGradients and caching them outside the `requestAnimationFrame` loop, keyed by bounded input values (like Uint8Array 0-255 values from AnalyserNode), significantly improves rendering performance by avoiding constant object creation and garbage collection. Also, bounds checking during canvas iteration (`if (x > canvas.width) break;`) avoids unnecessary draw calls for off-screen elements.
**Action:** Always look for opportunities to pre-calculate and cache objects in tight animation loops, particularly when dealing with bounded data like Web Audio API frequency bins.

## 2024-05-24 - Hydration mismatches with Impure functions
**Learning:** Using impure functions like `Math.random()` directly in a React component's render path (especially for initial state) causes hydration mismatches in Next.js because the server and client will generate different HTML. Use deterministic approaches (like a static constant array) instead.
**Action:** When initializing visual states in SSR frameworks, ensure variables are purely derived from props or stable, deterministic constants to avoid hydration errors.

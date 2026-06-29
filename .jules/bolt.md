## 2025-06-29 - [Canvas Reallocation Overhead in requestAnimationFrame]
**Learning:** Pre-calculating Canvas gradients mapped exactly to the Uint8Array size (`0-255`) and doing it outside of `requestAnimationFrame` significantly reduces object allocations and Garbage Collection pressure, avoiding recreation of objects up to 60 times per second.
**Action:** When using Web Audio API combined with HTML5 Canvas, precalculate gradients strictly outside the frame loop. Also, use short-circuit logic inside the rendering loop (`if (x > canvas.width) break;`) to avoid off-screen computations.

## 2025-06-29 - [Next.js Hydration Mismatch caused by Math.random()]
**Learning:** Using `Math.random()` inside a React component's initial state or un-memoized rendering logic (like idle bars) generates different server-side and client-side DOM values, triggering a hydration error.
**Action:** Always replace `Math.random()` with deterministic constant arrays or state generated entirely inside a `useEffect` when dealing with visual elements rendered before hydration completes in Next.js apps.

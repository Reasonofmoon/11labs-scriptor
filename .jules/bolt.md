
## 2024-05-24 - Optimize HTML5 Canvas Rendering in React
**Learning:** For high-frequency rendering loops like `requestAnimationFrame` drawing onto a canvas inside a `useEffect` hook, object creation (like `ctx.createLinearGradient()`) for every pixel/bar in every frame is incredibly expensive and causes significant CPU load.
**Action:** Always pre-calculate and cache complex/expensive objects (like an array of gradients mapped to the 0-255 frequency values) outside the animation loop. Additionally, always implement early bounds checking (e.g. `if (x > canvas.width) break;`) inside rendering loops to prevent unnecessary processing for off-screen elements.

## 2024-05-24 - Prevent Next.js Hydration Mismatches
**Learning:** Using `Math.random()` to generate styles (like dynamic heights for idle state bars) inside a React component's initial render causes a severe hydration mismatch error in Next.js because the server-rendered HTML will differ from the client-rendered output.
**Action:** Use a constant array of deterministic values (e.g. `IDLE_BAR_HEIGHTS`) and map them using modulo arithmetic based on the index `i` instead of `Math.random()` to achieve a pseudo-random look without breaking hydration.

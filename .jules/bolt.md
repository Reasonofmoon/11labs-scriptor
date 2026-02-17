## 2025-05-20 - Visualizer Optimization
**Learning:** HTML5 Canvas `createLinearGradient` is expensive. Creating it per-frame per-element (e.g., 60fps * 1024 bars) causes significant GC pressure.
**Action:** Pre-calculate gradients (e.g., in `useEffect`) based on discrete input values (0-255) and reuse them.

## 2025-05-20 - Deterministic Rendering
**Learning:** Using `Math.random()` in JSX render output causes Next.js hydration mismatches and layout shifts.
**Action:** Use deterministic constants or seeded random generators for visual randomness that must be consistent between server and client.

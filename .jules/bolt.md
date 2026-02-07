## 2025-05-23 - Hydration Mismatch from Randomness
**Learning:** Using `Math.random()` in React render output causes hydration mismatches in Next.js, forcing a full client-side re-render and layout shifts.
**Action:** Use deterministic values (e.g., static arrays or seeded random based on index) for "random" visual elements in SSR components to ensure server-client consistency.

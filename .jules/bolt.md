## 2026-01-27 - [Rendering Optimization]
**Learning:** `ScriptDisplay` was re-rendering the entire list of items on every audio progress update because `currentIndex` prop changed. Extracting the item into a memoized `ScriptItemRow` component prevents this O(N) re-render cost, making the UI smoother during playback.
**Action:** Look for similar patterns where a list item's rendering depends on a global index, and memoize the item component to only update when its specific state relative to the index changes.

## 2026-01-27 - [Impure Visualizer]
**Learning:** The `Visualizer` component uses `Math.random()` inside the render phase for styling (bar height/rounded corners fallback). This is impure and causes unstable rendering and hydration mismatches.
**Action:** Move random value generation to `useEffect` or `useMemo` to ensure stability and purity.

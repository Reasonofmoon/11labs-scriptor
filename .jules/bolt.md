# Bolt's Journal

This journal tracks critical performance learnings for the readmaster-ai codebase.

## 2024-05-23 - ScriptDisplay Optimization
**Learning:** `ScriptDisplay` was re-rendering the entire list of items on every `currentIndex` change, which scales poorly (O(N)). Extracting the item to a `memo`ized component reduces this to O(1) updates.
**Action:** When working with lists where only one item changes state at a time, always extract the list item to a memoized component to avoid full list re-renders.

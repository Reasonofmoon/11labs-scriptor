# Bolt's Journal

## 2024-05-24 - Initial Setup
**Learning:** Started tracking critical performance learnings.
**Action:** Always check this file before starting.

## 2024-05-24 - Canvas Optimization in React
**Learning:** In a high-frequency canvas animation loop (60fps), creating objects like `LinearGradient` inside the loop causes significant garbage collection overhead.
**Action:** Pre-calculate invariant objects (like gradients for all 256 possible audio values) and cache them outside the render loop using a simple array lookup.

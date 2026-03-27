## 2024-05-23 - Canvas Visualizer Optimization
**Learning:** High-frequency canvas operations (like gradient creation) inside loops can be major bottlenecks. Also, drawing off-screen elements in a loop is wasted effort.
**Action:** Always check loop bounds against canvas dimensions. Move complex object creation (gradients) out of loops if possible, or break early.
